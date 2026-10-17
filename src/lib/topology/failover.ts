import type { NetworkTopology, TopologyDevice, TopologyInterface, TopologyLink } from "@/types/topology";
import { computeHsrp, hasHsrpConfig } from "./hsrp";
import { normalizeInterfaceName } from "./hardware-profiles";
import { computeStructuredRoutingTable, type RouteProtocol } from "./routing-table";
import { applyStpPortRoles, computePortChannels, computeStp, isSwitch, portChannelCost } from "./stp-calc";

/**
 * Verbindungen trennen/wiederherstellen und Interfaces ab-/anschalten, mit Neuberechnung über die bestehenden
 * Module (computeStp, computeStructuredRoutingTable mit OSPF/EIGRP/statisch, computeHsrp, computePortChannels)
 * und Vorher/Nachher-Vergleich. Die Konvergenzzeiten sind ein vereinfachtes Modell (siehe convergenceTimeline).
 */

export type FailoverAction =
  | { kind: "link-down"; linkId: string }
  | { kind: "link-up"; linkId: string }
  | { kind: "shutdown"; deviceId: string; ifaceId: string }
  | { kind: "no-shutdown"; deviceId: string; ifaceId: string };

const label = (d: TopologyDevice) => d.config?.hostname ?? d.name;
const isCut = (l: TopologyLink) => l.status === "down";
const parentName = (name: string) => (name.includes(".") ? name.slice(0, name.indexOf(".")) : name);

function linkOf(topology: NetworkTopology, deviceId: string, ifaceId: string): TopologyLink | undefined {
  return topology.links.find(
    (l) => (l.sourceDeviceId === deviceId && l.sourceInterfaceId === ifaceId) || (l.targetDeviceId === deviceId && l.targetInterfaceId === ifaceId),
  );
}

function endsOf(topology: NetworkTopology, link: TopologyLink) {
  const a = topology.devices.find((d) => d.id === link.sourceDeviceId);
  const b = topology.devices.find((d) => d.id === link.targetDeviceId);
  const ai = a?.interfaces.find((i) => i.id === link.sourceInterfaceId);
  const bi = b?.interfaces.find((i) => i.id === link.targetInterfaceId);
  return a && b && ai && bi ? [{ device: a, iface: ai, peer: bi }, { device: b, iface: bi, peer: ai }] : [];
}

/**
 * Leitungszustand der beiden Enden eines Links und seiner Subinterfaces aus Kabel und shutdown ableiten:
 * eigenes shutdown → admin-down; Kabel getrennt oder Gegenseite shutdown → down; sonst up.
 * Der Link zeigt admin-down, solange ein Ende shutdown ist; ein getrenntes Kabel bleibt down.
 */
function refreshLink(topology: NetworkTopology, link: TopologyLink): void {
  const ends = endsOf(topology, link);
  for (const { device, iface, peer } of ends) {
    const status: TopologyInterface["status"] = iface.isShutdown ? "admin-down" : isCut(link) || peer.isShutdown ? "down" : "up";
    iface.status = status;
    for (const sub of device.interfaces) {
      if (sub.id === iface.id || !sub.name.includes(".")) continue;
      if (normalizeInterfaceName(parentName(sub.name)) !== normalizeInterfaceName(iface.name)) continue;
      sub.status = sub.isShutdown ? "admin-down" : status === "up" ? "up" : "down";
    }
  }
  if (!isCut(link)) {
    const adminDown = ends.some((e) => e.iface.isShutdown);
    if (adminDown) link.status = "admin-down";
    else if (link.status === "admin-down") link.status = "up";
  }
}

/** Wendet eine Aktion an und gibt eine neue Topologie zurück (die übergebene bleibt unverändert). */
export function applyFailoverAction(topology: NetworkTopology, action: FailoverAction): NetworkTopology {
  const t: NetworkTopology = structuredClone(topology);
  let link: TopologyLink | undefined;
  if (action.kind === "link-down" || action.kind === "link-up") {
    link = t.links.find((l) => l.id === action.linkId);
    if (!link) return topology;
    link.status = action.kind === "link-down" ? "down" : "up";
  } else {
    const device = t.devices.find((d) => d.id === action.deviceId);
    const iface = device?.interfaces.find((i) => i.id === action.ifaceId);
    if (!device || !iface) return topology;
    iface.isShutdown = action.kind === "shutdown";
    iface.status = iface.isShutdown ? "admin-down" : "up";
    const physical = iface.name.includes(".")
      ? device.interfaces.find((i) => normalizeInterfaceName(i.name) === normalizeInterfaceName(parentName(iface.name)))
      : iface;
    link = physical ? linkOf(t, device.id, physical.id) : undefined;
    if (!link && iface.name.includes(".") && physical) {
      iface.status = iface.isShutdown ? "admin-down" : physical.status === "up" ? "up" : "down";
    }
  }
  if (link) refreshLink(t, link);
  if (t.devices.some((d) => d.interfaces.some((i) => i.portRole)) || t.links.some((l) => l.status === "stp-blocking")) {
    applyStpPortRoles(t);
  }
  return t;
}

// ─── Zustand und Vergleich ─────────────────────────────────────────────

export interface NetworkSnapshot {
  ifaces: Map<string, { device: TopologyDevice; name: string; status: string }>;
  stpRoot: Map<string, { device: TopologyDevice; root: string; rootPort: string; cost: number }>;
  stpPorts: Map<string, { device: TopologyDevice; name: string; text: string; state: string; role: string }>;
  routes: Map<string, { device: TopologyDevice; prefix: string; protocol: RouteProtocol; text: string }>;
  hsrp: Map<string, { device: TopologyDevice; subject: string; state: string; text: string }>;
  portChannels: Map<string, { device: TopologyDevice; name: string; text: string }>;
}

const statusText = (s: string) => (s === "admin-down" ? "administratively down" : s);

export function snapshotNetwork(topology: NetworkTopology): NetworkSnapshot {
  const snap: NetworkSnapshot = { ifaces: new Map(), stpRoot: new Map(), stpPorts: new Map(), routes: new Map(), hsrp: new Map(), portChannels: new Map() };
  for (const d of topology.devices) {
    for (const i of d.interfaces) snap.ifaces.set(`${d.id}|${i.id}`, { device: d, name: i.name, status: i.isShutdown ? "admin-down" : i.status });
  }
  for (const b of computeStp(topology).values()) {
    snap.stpRoot.set(b.device.id, { device: b.device, root: label(b.rootDevice), rootPort: b.rootPort?.iface.name ?? "–", cost: b.rootPathCost });
    for (const p of b.ports) {
      snap.stpPorts.set(`${b.device.id}|${p.iface.name}`, { device: b.device, name: p.iface.name, text: `${p.role} ${p.state} ${p.cost}`, state: p.state, role: p.role });
    }
  }
  for (const d of topology.devices) {
    if (d.type !== "router" && d.type !== "switch-l3") continue;
    for (const r of computeStructuredRoutingTable(d, topology).routes) {
      if (r.protocol === "L") continue;
      const vias = r.vias.map((v) => (v.nextHop ? `via ${v.nextHop} (${v.ifaceName})` : `über ${v.ifaceName}`)).join(", ");
      const metric = r.protocol === "C" ? "" : ` [${r.ad}/${r.metric ?? 0}]`;
      snap.routes.set(`${d.id}|${r.prefix}`, { device: d, prefix: r.prefix, protocol: r.protocol, text: `${r.protocol} ${r.prefix}${metric} ${vias}` });
    }
  }
  for (const d of topology.devices) {
    if (!hasHsrpConfig(d)) continue;
    for (const row of computeHsrp(d, topology)) {
      const subject = `${row.iface.name} Gruppe ${row.group.id}`;
      snap.hsrp.set(`${d.id}|${subject}`, { device: d, subject, state: row.state, text: `${row.state} (Priority ${row.priority})` });
    }
  }
  for (const list of computePortChannels(topology).values()) {
    for (const b of list) {
      snap.portChannels.set(`${b.device.id}|${b.iface.name}`, {
        device: b.device,
        name: b.iface.name,
        text: `up, Member ${b.members.map((m) => m.name).join(", ")}, STP-Kosten ${portChannelCost(b.members)}`,
      });
    }
  }
  // Konfigurierte, aber nicht (mehr) gebündelte Port-Channels sichtbar machen
  for (const d of topology.devices) {
    if (!isSwitch(d)) continue;
    for (const id of new Set(d.interfaces.map((i) => i.channelGroup?.id).filter((x): x is number => x !== undefined))) {
      const key = `${d.id}|Po${id}`;
      if (!snap.portChannels.has(key)) snap.portChannels.set(key, { device: d, name: `Po${id}`, text: "down (kein aktiver Member)" });
    }
  }
  return snap;
}

export type ChangeKind = "interface" | "stp-root" | "stp-port" | "route-removed" | "route-added" | "route-changed" | "hsrp" | "port-channel";

export interface NetworkChange {
  kind: ChangeKind;
  deviceId: string;
  deviceName: string;
  subject: string;
  before?: string;
  after?: string;
  protocol?: RouteProtocol;
  /** STP-Port wechselt nach Forwarding bzw. HSRP-Router wird Active */
  becomesActive?: boolean;
}

function diffMap<V extends { device: TopologyDevice }>(
  a: Map<string, V>,
  b: Map<string, V>,
  text: (v: V) => string,
  subject: (v: V) => string,
  onChange: (before: V | undefined, after: V | undefined) => NetworkChange | null,
  out: NetworkChange[],
) {
  for (const key of new Set([...a.keys(), ...b.keys()])) {
    const x = a.get(key);
    const y = b.get(key);
    if (x && y && text(x) === text(y)) continue;
    const c = onChange(x, y);
    if (c) out.push({ ...c, subject: c.subject || subject((x ?? y)!) });
  }
}

export function diffNetwork(before: NetworkSnapshot, after: NetworkSnapshot): NetworkChange[] {
  const out: NetworkChange[] = [];
  const base = (v: { device: TopologyDevice }) => ({ deviceId: v.device.id, deviceName: label(v.device) });
  diffMap(before.ifaces, after.ifaces, (v) => v.status, (v) => v.name, (x, y) => ({
    kind: "interface", ...base((x ?? y)!), subject: (x ?? y)!.name, before: x && statusText(x.status), after: y && statusText(y.status),
  }), out);
  diffMap(before.stpRoot, after.stpRoot, (v) => `${v.root}|${v.rootPort}|${v.cost}`, () => "", (x, y) => {
    const t = (v?: typeof x) => (v ? `Root ${v.root}${v.rootPort !== "–" ? `, Root-Port ${v.rootPort}` : " (diese Bridge)"}, Kosten ${v.cost}` : undefined);
    return { kind: "stp-root", ...base((x ?? y)!), subject: "Spanning Tree", before: t(x), after: t(y) };
  }, out);
  diffMap(before.stpPorts, after.stpPorts, (v) => v.text, (v) => v.name, (x, y) => ({
    kind: "stp-port", ...base((x ?? y)!), subject: (x ?? y)!.name, before: x?.text, after: y?.text,
    becomesActive: y?.state === "FWD" && x?.state !== "FWD",
  }), out);
  diffMap(before.routes, after.routes, (v) => v.text, (v) => v.prefix, (x, y) => ({
    kind: !x ? "route-added" : !y ? "route-removed" : "route-changed", ...base((x ?? y)!), subject: (x ?? y)!.prefix,
    before: x?.text, after: y?.text, protocol: (y ?? x)!.protocol,
  }), out);
  diffMap(before.hsrp, after.hsrp, (v) => v.text, (v) => v.subject, (x, y) => ({
    kind: "hsrp", ...base((x ?? y)!), subject: (x ?? y)!.subject, before: x?.text, after: y?.text,
    becomesActive: y?.state === "Active" && x?.state !== "Active",
  }), out);
  diffMap(before.portChannels, after.portChannels, (v) => v.text, (v) => v.name, (x, y) => ({
    kind: "port-channel", ...base((x ?? y)!), subject: (x ?? y)!.name, before: x?.text, after: y?.text,
  }), out);
  return out;
}

// ─── Konvergenz (vereinfachtes Modell) ─────────────────────────────────

export type ConvergenceMode = "sofort" | "realistisch";

export interface ConvergenceEvent {
  t: number;
  change: NetworkChange;
  begruendung: string;
}

interface Timers {
  rapid: boolean;
  stpHello: number;
  forwardDelay: number;
  maxAge: number;
  ospfHello: number;
  ospfDead: number;
  eigrpHello: number;
  eigrpHold: number;
}

/** Standardtimer, überschrieben durch Lab-Befehle in der Gerätekonfiguration (labCli), soweit vorhanden. */
function readTimers(topology: NetworkTopology): Timers {
  const cli = topology.devices.map((d) => d.config?.labCli ?? "").join("\n");
  const num = (re: RegExp) => {
    const m = re.exec(cli);
    return m ? Number(m[1]) : null;
  };
  const switches = topology.devices.filter(isSwitch);
  const rapid = switches.length > 0 && switches.every((d) => /^\s*spanning-tree mode rapid-pvst/m.test(d.config?.labCli ?? ""));
  const ospfHello = num(/ip ospf hello-interval (\d+)/) ?? 10;
  const eigrpHello = num(/ip hello-interval eigrp \d+ (\d+)/) ?? 5;
  return {
    rapid,
    stpHello: num(/spanning-tree vlan \d+ hello-time (\d+)/) ?? 2,
    forwardDelay: num(/spanning-tree vlan \d+ forward-time (\d+)/) ?? 15,
    maxAge: num(/spanning-tree vlan \d+ max-age (\d+)/) ?? 20,
    ospfHello,
    ospfDead: num(/ip ospf dead-interval (\d+)/) ?? ospfHello * 4,
    eigrpHello,
    eigrpHold: num(/ip hold-time eigrp \d+ (\d+)/) ?? eigrpHello * 3,
  };
}

function hsrpTimers(topology: NetworkTopology, deviceId: string, subject: string): { hello: number; hold: number; lab: boolean } {
  const d = topology.devices.find((x) => x.id === deviceId);
  const [ifName, , gid] = subject.split(" ");
  const group = d?.interfaces.find((i) => i.name === ifName)?.hsrp?.groups.find((g) => g.id === Number(gid));
  const m = group?.timers ? /^(\d+)\s+(\d+)$/.exec(group.timers.trim()) : null;
  return m ? { hello: Number(m[1]), hold: Number(m[2]), lab: true } : { hello: 3, hold: 10, lab: false };
}

/**
 * Zeitpunkt je Änderung nach der Aktion, vereinfacht:
 * - Interfaces, Port-Channel-Member, verbundene und statische Routen: sofort (Carrier-Verlust bzw. shutdown).
 * - STP 802.1D: Port nach Forwarding bei direktem Ausfall nach 2 × Forward Delay (Listening + Learning),
 *   bei indirektem Ausfall zusätzlich Max Age; RSTP (rapid-pvst auf allen Switches): direkt sofort, indirekt 3 × Hello.
 * - OSPF/EIGRP: Ausfall an einem eigenen Interface eines Routers sofort; sonst nach Dead Interval bzw. Hold Time.
 *   Nach Wiederherstellung: erstes Hello. SPF-/DUAL-Rechenzeit wird nicht modelliert.
 * - HSRP: shutdown am Active → Resign, sofort; Kabel getrennt → Hold Time; Priority-Änderung (Tracking) und
 *   Rückkehr per Preempt → nächstes Hello.
 */
export function convergenceTimeline(
  before: NetworkTopology,
  after: NetworkTopology,
  actions: FailoverAction[],
  changes: NetworkChange[],
  mode: ConvergenceMode,
): ConvergenceEvent[] {
  if (mode === "sofort") return changes.map((change) => ({ t: 0, change, begruendung: "Modus „sofort“: Endzustand ohne Zeitverlauf." }));
  const timers = readTimers(after);
  const recovery = actions.every((a) => a.kind === "link-up" || a.kind === "no-shutdown");
  const shutdownOnly = actions.every((a) => a.kind === "shutdown" || a.kind === "no-shutdown");
  const locallyAffected = new Set(changes.filter((c) => c.kind === "interface").map((c) => c.deviceId));
  const routerProtocolLocal = (protocol: "ospf" | "eigrp") =>
    [...locallyAffected].some((id) => {
      const d = after.devices.find((x) => x.id === id);
      return protocol === "ospf" ? !!d?.config?.ospf : !!d?.config?.eigrp;
    });

  return changes.map((change): ConvergenceEvent => {
    switch (change.kind) {
      case "interface":
        return { t: 0, change, begruendung: shutdownOnly ? "shutdown/no shutdown wirkt sofort." : "Carrier-Verlust bzw. -Rückkehr wird sofort erkannt." };
      case "port-channel":
        return { t: 0, change, begruendung: "Member-Ausfall: das Bündel bleibt mit den übrigen Membern up, nur die Kosten ändern sich (sofort)." };
      case "stp-root":
      case "stp-port": {
        const local = locallyAffected.has(change.deviceId);
        if (timers.rapid) {
          return local || recovery
            ? { t: 0, change, begruendung: "RSTP: Alternate-Port bzw. Proposal/Agreement, praktisch sofort." }
            : { t: 3 * timers.stpHello, change, begruendung: `RSTP: indirekter Ausfall nach 3 × Hello (${3 * timers.stpHello} s).` };
        }
        if (!change.becomesActive) {
          return local || recovery
            ? { t: 0, change, begruendung: "Port verlässt Forwarding bzw. Rolle ändert sich ohne Wartezeit." }
            : { t: timers.maxAge, change, begruendung: `Indirekter Ausfall: gespeicherte BPDU altert erst nach Max Age (${timers.maxAge} s).` };
        }
        const fwd = 2 * timers.forwardDelay;
        return local || recovery
          ? { t: fwd, change, begruendung: `802.1D: Listening + Learning = 2 × Forward Delay (${fwd} s).` }
          : { t: timers.maxAge + fwd, change, begruendung: `802.1D indirekt: Max Age (${timers.maxAge} s) + 2 × Forward Delay (${fwd} s).` };
      }
      case "hsrp": {
        const t = hsrpTimers(after, change.deviceId, change.subject);
        const src = t.lab ? "Lab-Timer" : "Standardtimer";
        if (!change.becomesActive) return { t: 0, change, begruendung: "Rollenwechsel des bisherigen Active bzw. Standby folgt dem neuen Active." };
        if (recovery) return { t: t.hello, change, begruendung: `Preempt: Übernahme mit dem nächsten Hello (${t.hello} s, ${src}).` };
        const hsrpIfaceShut = actions.some((a) => {
          if (a.kind !== "shutdown") return false;
          const iface = before.devices.find((d) => d.id === a.deviceId)?.interfaces.find((i) => i.id === a.ifaceId);
          return !!iface?.hsrp?.groups.length;
        });
        const hsrpIfaceCut = changes.some((c) => {
          if (c.kind !== "interface" || c.after === "up") return false;
          return !!before.devices.find((d) => d.id === c.deviceId)?.interfaces.find((i) => i.name === c.subject)?.hsrp?.groups.length;
        });
        if (hsrpIfaceShut) return { t: 0, change, begruendung: "shutdown am HSRP-Interface des Active: Resign-Nachricht, der Standby übernimmt sofort." };
        if (hsrpIfaceCut) return { t: t.hold, change, begruendung: `Keine Hellos mehr vom Active: Übernahme nach der Hold Time (${t.hold} s, ${src}).` };
        return { t: t.hello, change, begruendung: `Priority-Änderung (Tracking): Übernahme per Preempt mit dem nächsten Hello (${t.hello} s, ${src}).` };
      }
      default: {
        const p = change.protocol ?? "C";
        if (p.startsWith("O")) {
          if (recovery) return { t: timers.ospfHello, change, begruendung: `OSPF: Nachbarschaft ab dem ersten Hello (${timers.ospfHello} s).` };
          return routerProtocolLocal("ospf")
            ? { t: 0, change, begruendung: "OSPF: Interface eines Routers betroffen, neues LSA sofort." }
            : { t: timers.ospfDead, change, begruendung: `OSPF: Nachbar fällt erst nach dem Dead Interval weg (${timers.ospfDead} s).` };
        }
        if (p.startsWith("D")) {
          if (recovery) return { t: timers.eigrpHello, change, begruendung: `EIGRP: Nachbarschaft ab dem ersten Hello (${timers.eigrpHello} s).` };
          return routerProtocolLocal("eigrp")
            ? { t: 0, change, begruendung: "EIGRP: Interface eines Routers betroffen, Feasible Successor bzw. DUAL sofort." }
            : { t: timers.eigrpHold, change, begruendung: `EIGRP: Nachbar fällt erst nach der Hold Time weg (${timers.eigrpHold} s).` };
        }
        return { t: 0, change, begruendung: "Verbundene bzw. statische Route folgt dem Interface-Zustand sofort." };
      }
    }
  });
}

export interface FailoverAnalysis {
  actions: FailoverAction[];
  /** Beschreibung der Aktionen, z. B. „Verbindung SW1 Gi0/1 – SW2 Gi0/1 getrennt“ */
  title: string;
  before: NetworkTopology;
  after: NetworkTopology;
  changes: NetworkChange[];
}

export function describeAction(topology: NetworkTopology, action: FailoverAction): string {
  if (action.kind === "link-down" || action.kind === "link-up") {
    const link = topology.links.find((l) => l.id === action.linkId);
    const ends = link ? endsOf(topology, link) : [];
    const name = ends.map((e) => `${label(e.device)} ${e.iface.name}`).join(" – ");
    return `Verbindung ${name} ${action.kind === "link-down" ? "getrennt" : "wiederhergestellt"}`;
  }
  const d = topology.devices.find((x) => x.id === action.deviceId);
  const i = d?.interfaces.find((x) => x.id === action.ifaceId);
  return `${d ? label(d) : "?"} ${i?.name ?? "?"}: ${action.kind === "shutdown" ? "shutdown" : "no shutdown"}`;
}

export function analyzeFailover(before: NetworkTopology, actions: FailoverAction[], after?: NetworkTopology): FailoverAnalysis {
  const result = after ?? actions.reduce(applyFailoverAction, before);
  return {
    actions,
    title: actions.map((a) => describeAction(before, a)).join("; "),
    before,
    after: result,
    changes: diffNetwork(snapshotNetwork(before), snapshotNetwork(result)),
  };
}

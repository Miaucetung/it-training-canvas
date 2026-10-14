import type { InterfaceHsrpGroup, NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";
import { collectSegmentPeers, endpointsForInterface, isInterfaceActive, isLinkUsable, sameSubnet } from "./ospf-neighbors";

export const HSRP_DEFAULT_PRIORITY = 100;

export type HsrpState = "Active" | "Standby" | "Listen" | "Init" | "nicht bestimmbar";

export interface HsrpRow {
  iface: TopologyInterface;
  group: InterfaceHsrpGroup;
  /** aktuelle Priority nach Tracking-Abzug */
  priority: number;
  configuredPriority: number;
  state: HsrpState;
  active: string;
  standby: string;
  virtualIp: string;
  notes: string[];
  /** Active hängt von der Startreihenfolge ab (Preempt fehlt auf dem Router mit der höchsten Priority) */
  startOrderDependent: boolean;
}

const ipOf = (i: TopologyInterface) => (i.ip ?? "").split("/")[0];
const ipNum = (ip: string) => ip.split(".").reduce((a, o) => a * 256 + Number(o), 0);

export function hasHsrpConfig(device: TopologyDevice): boolean {
  return device.interfaces.some((i) => (i.hsrp?.groups.length ?? 0) > 0);
}

/** Tracking-Interface gilt als oben, wenn es existiert, nicht abgeschaltet ist und im Lab mit einem aktiven Link verbunden ist. */
function trackedInterfaceUp(device: TopologyDevice, name: string, topology: NetworkTopology): boolean {
  const iface = device.interfaces.find((i) => i.name === name);
  if (!iface || iface.isShutdown || iface.status !== "up") return false;
  return topology.links.some((l) => (l.sourceInterfaceId === iface.id || l.targetInterfaceId === iface.id) && isLinkUsable(l));
}

interface Effective {
  priority: number;
  configured: number;
  downTracks: Array<{ interface: string; decrement: number }>;
}

function effectivePriority(device: TopologyDevice, group: InterfaceHsrpGroup, topology: NetworkTopology): Effective {
  const configured = group.priority ?? HSRP_DEFAULT_PRIORITY;
  const downTracks = (group.track ?? []).filter((t) => !trackedInterfaceUp(device, t.interface, topology));
  const priority = Math.max(0, configured - downTracks.reduce((a, t) => a + t.decrement, 0));
  return { priority, configured, downTracks };
}

interface Member {
  device: TopologyDevice;
  iface: TopologyInterface;
  group: InterfaceHsrpGroup;
  eff: Effective;
}

const label = (d: TopologyDevice) => d.config?.hostname ?? d.name;

export function computeHsrp(device: TopologyDevice, topology: NetworkTopology): HsrpRow[] {
  const rows: HsrpRow[] = [];
  for (const iface of device.interfaces) {
    const hsrp = iface.hsrp;
    if (!hsrp) continue;
    for (const group of hsrp.groups) {
      const eff = effectivePriority(device, group, topology);
      const row: HsrpRow = {
        iface,
        group,
        priority: eff.priority,
        configuredPriority: eff.configured,
        state: "Init",
        active: "unknown",
        standby: "unknown",
        virtualIp: group.ip ?? "unknown",
        notes: [],
        startOrderDependent: false,
      };
      rows.push(row);
      for (const t of eff.downTracks) {
        row.notes.push(`Priority ${eff.configured} − ${t.decrement} = ${eff.priority}: das Tracking-Interface ${t.interface} ist im Lab nicht verbunden oder abgeschaltet.`);
      }
      if (group.trackObjects?.length) row.notes.push(`Tracking-Objekt ${group.trackObjects.join(", ")} wird nicht ausgewertet: die tatsächliche Priority ist nicht bestimmbar.`);
      if (!group.ip) row.notes.push("Virtuelle IP im Lab nicht gesetzt: sie wird vom Active-Router gelernt.");
      if (!isInterfaceActive(iface) || !iface.ip) {
        row.notes.push(!iface.ip ? "Interface ohne IP-Adresse im Lab: HSRP bleibt in Init." : "Interface ist nicht aktiv: HSRP bleibt in Init.");
        continue;
      }

      // Teilnehmer am Segment
      const members: Member[] = [{ device, iface, group, eff }];
      let undeterminable = false;
      const seen = new Set<string>([iface.id]);
      for (const { link, first, vlan } of endpointsForInterface(topology, device, iface)) {
        if (!isLinkUsable(link)) continue;
        const peers = collectSegmentPeers(topology, device, iface, first, link, vlan);
        if (!peers) {
          undeterminable = true;
          continue;
        }
        for (const peer of peers) {
          if (peer.device.id === device.id || seen.has(peer.iface.id)) continue;
          seen.add(peer.iface.id);
          const pg = peer.iface.hsrp?.groups.find((g) => g.id === group.id);
          if (!pg || !isInterfaceActive(peer.iface) || !peer.iface.ip || !iface.ip || !sameSubnet(iface.ip, peer.iface.ip)) continue;
          if (peer.iface.hsrp!.version !== hsrp.version) {
            row.notes.push(`${label(peer.device)} nutzt HSRP Version ${peer.iface.hsrp!.version}: Version 1 und 2 tauschen keine Nachrichten aus, der Router wird ignoriert.`);
            continue;
          }
          if ((pg.authentication ?? "") !== (group.authentication ?? "")) {
            row.notes.push(`${label(peer.device)}: Authentication unterschiedlich, die Hellos werden verworfen; beide Router werden Active.`);
            continue;
          }
          members.push({ device: peer.device, iface: peer.iface, group: pg, eff: effectivePriority(peer.device, pg, topology) });
        }
      }
      if (undeterminable) {
        row.state = "nicht bestimmbar";
        row.notes.push("Ein Layer-3-Switch oder Routed-Port im Pfad: die Teilnehmer am Segment sind nicht bestimmbar.");
        continue;
      }

      const sorted = [...members].sort((a, b) => b.eff.priority - a.eff.priority || ipNum(ipOf(b.iface)) - ipNum(ipOf(a.iface)));
      const addr = (m: Member) => (m.iface.id === iface.id ? "local" : ipOf(m.iface));
      const activeM = sorted[0];
      const standbyM = sorted[1];
      row.active = addr(activeM);
      row.standby = standbyM ? addr(standbyM) : "unknown";
      row.state = activeM.iface.id === iface.id ? "Active" : standbyM && standbyM.iface.id === iface.id ? "Standby" : "Listen";
      if (!group.ip) {
        const vipM = members.find((m) => m.group.ip);
        if (vipM) row.virtualIp = vipM.group.ip!;
      }

      if (members.length > 1) {
        if (!activeM.group.preempt) {
          row.startOrderDependent = true;
          row.notes.push(`Angezeigt ist das Ergebnis bei gleichzeitigem Start. ${label(activeM.device)} hat die höchste Priority, aber kein Preempt: wer zuerst startet, bleibt Active (abhängig von der Startreihenfolge).`);
        }
        const vips = new Set(members.map((m) => m.group.ip).filter(Boolean));
        if (vips.size > 1) row.notes.push(`Die Teilnehmer nennen unterschiedliche virtuelle IPs (${[...vips].join(", ")}).`);
        const timers = new Set(members.map((m) => m.group.timers ?? "Standard"));
        if (timers.size > 1) row.notes.push("Timer unterschiedlich konfiguriert: das Verhalten ist nicht bestimmbar (der Standby-Router kann den Active-Router für ausgefallen halten).");
        const tie = sorted.filter((m) => m.eff.priority === activeM.eff.priority);
        if (tie.length > 1) row.notes.push("Gleiche Priority: die höhere Interface-IP gewinnt.");
      } else {
        row.notes.push("Kein weiterer HSRP-Teilnehmer mit passender Konfiguration im Segment.");
      }
    }
  }
  return rows;
}

const pad = (v: string | number, w: number) => String(v).padEnd(w);

export function formatShowStandbyBrief(device: TopologyDevice, topology: NetworkTopology): string {
  const rows = computeHsrp(device, topology);
  if (rows.length === 0) return "";
  const lines = [
    "                     P indicates configured to preempt.",
    "                     |",
    "Interface   Grp  Pri P State   Active          Standby         Virtual IP",
  ];
  for (const r of rows) {
    lines.push(`${pad(r.iface.name, 12)}${pad(r.group.id, 5)}${pad(r.priority, 4)}${r.group.preempt ? "P" : " "} ${pad(r.state, 8)}${pad(r.active, 16)}${pad(r.standby, 16)}${r.virtualIp}`);
  }
  const notes = rows.flatMap((r) => r.notes.map((n) => `% ${r.iface.name} Grp ${r.group.id}: ${n}`));
  if (notes.length > 0) lines.push("", ...notes);
  return lines.join("\n");
}

/** Hinweise für den Inspector. */
export function hsrpHints(device: TopologyDevice, topology: NetworkTopology): string[] {
  if (!hasHsrpConfig(device)) return [];
  const hints: string[] = [];
  for (const r of computeHsrp(device, topology)) {
    if (r.startOrderDependent) hints.push("HSRP ist ohne Preempt nicht präemptiv: angezeigt ist das Ergebnis bei gleichzeitigem Start; der Active-Router kann abweichen.");
    for (const n of r.notes) if (/Tracking|Authentication|Version|Timer/.test(n)) hints.push(`${r.iface.name} Grp ${r.group.id}: ${n}`);
  }
  return [...new Set(hints)];
}

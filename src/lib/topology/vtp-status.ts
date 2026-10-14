import type { DeviceVtpConfig, NetworkTopology, TopologyDevice, TopologyInterface, VtpMode } from "@/types/topology";

/** Standard-VLANs (1, 1002-1005), die jeder Switch kennt. */
const DEFAULT_VLAN_COUNT = 5;

const isSwitch = (d: TopologyDevice) => d.type === "switch-l2" || d.type === "switch-l3";

export function hasVtpConfig(device: TopologyDevice): boolean {
  return isSwitch(device) && !!device.config?.vtp;
}

type PortKind = "trunk" | "trunk-nonegotiate" | "desirable" | "auto" | "access";

/** Port-Modus für die DTP-Auswertung; nicht festgelegte Ports gelten als `dynamic auto` (Standard der Catalyst-Plattform). */
function portKind(i: TopologyInterface): PortKind {
  if (i.mode === "trunk") return i.nonegotiate ? "trunk-nonegotiate" : "trunk";
  if (i.mode === "access") return "access";
  return i.dtp ?? "auto";
}

export interface TrunkVerdict {
  trunk: boolean;
  reason: string;
}

export function evaluateTrunk(a: TopologyInterface, b: TopologyInterface): TrunkVerdict {
  const ka = portKind(a);
  const kb = portKind(b);
  const pair = `${ka} ↔ ${kb}`;
  if (a.isShutdown || b.isShutdown || a.status !== "up" || b.status !== "up") return { trunk: false, reason: "Port nicht aktiv" };
  if (ka === "access" || kb === "access") return { trunk: false, reason: `kein Trunk (${pair})` };
  const staticA = ka === "trunk" || ka === "trunk-nonegotiate";
  const staticB = kb === "trunk" || kb === "trunk-nonegotiate";
  if (staticA && staticB) return { trunk: true, reason: `Trunk (${pair})` };
  if (staticA || staticB) {
    const fixed = staticA ? ka : kb;
    if (fixed === "trunk-nonegotiate") {
      return { trunk: false, reason: `kein Trunk (${pair}): der Trunk-Port sendet wegen nonegotiate keine DTP-Frames, die dynamische Seite verhandelt nicht` };
    }
    return { trunk: true, reason: `Trunk (${pair})` };
  }
  if (ka === "desirable" || kb === "desirable") return { trunk: true, reason: `Trunk (${pair})` };
  return { trunk: false, reason: `kein Trunk (${pair}): auto ↔ auto verhandelt keinen Trunk` };
}

interface Neighbor {
  device: TopologyDevice;
  localIface: TopologyInterface;
  remoteIface: TopologyInterface;
  verdict: TrunkVerdict;
}

function switchNeighbors(device: TopologyDevice, topology: NetworkTopology): Neighbor[] {
  const out: Neighbor[] = [];
  for (const link of topology.links) {
    const isSource = link.sourceDeviceId === device.id;
    if (!isSource && link.targetDeviceId !== device.id) continue;
    const other = topology.devices.find((d) => d.id === (isSource ? link.targetDeviceId : link.sourceDeviceId));
    if (!other || !isSwitch(other)) continue;
    const li = device.interfaces.find((i) => i.id === (isSource ? link.sourceInterfaceId : link.targetInterfaceId));
    const ri = other.interfaces.find((i) => i.id === (isSource ? link.targetInterfaceId : link.sourceInterfaceId));
    if (!li || !ri) continue;
    out.push({ device: other, localIface: li, remoteIface: ri, verdict: evaluateTrunk(li, ri) });
  }
  return out;
}

const nameOf = (d: TopologyDevice) => d.config?.hostname ?? d.name;

/** VTP-Einstellungen eines Switches; ohne VTP-Befehle im Lab gilt die Werkseinstellung (Server, keine Domain, kein Passwort). */
function vtpOf(d: TopologyDevice): DeviceVtpConfig {
  return d.config?.vtp ?? {};
}
const modeOf = (d: TopologyDevice): VtpMode => vtpOf(d).mode ?? "server";

export interface VtpSyncResult {
  /** Server, deren VLAN-Datenbank das Gerät sicher erreicht */
  servers: TopologyDevice[];
  /** Server, die nur erreichbar sind, wenn ein Transparent-Switch ohne Versionsangabe im Lab weiterleitet */
  uncertainServers: TopologyDevice[];
  /** Gründe, warum Nachrichten an einer Verbindung nicht weitergegeben werden */
  blockers: string[];
  /** Gerät ohne Domain: übernommene Domain aus der ersten empfangenen VTP-Nachricht */
  adoptedDomain?: string;
  /** Gerät ohne Domain, mehrere Domains erreichbar: das Ergebnis hängt von der ersten empfangenen Nachricht ab */
  ambiguousDomains?: string[];
  /** Transparent-Switches, deren Weiterleitung von der (im Lab nicht angegebenen) VTP-Version abhängt */
  versionDependent: string[];
}

interface FloodResult {
  /** Empfänger -> Zustellung sicher (true) oder von der VTP-Version eines Transparent-Switches abhängig (false) */
  receivers: Map<string, boolean>;
  blockers: string[];
  versionDependent: string[];
}

/** Verteilt die Ankündigungen eines Servers (Domain D, Passwort P) über Trunks. */
function flood(source: TopologyDevice, topology: NetworkTopology): FloodResult {
  const sv = vtpOf(source);
  const domain = sv.domain as string;
  const password = sv.password ?? "";
  const res: FloodResult = { receivers: new Map(), blockers: [], versionDependent: [] };
  const seen = new Map<string, boolean>([[source.id, true]]);
  const queue: Array<{ dev: TopologyDevice; certain: boolean }> = [{ dev: source, certain: true }];
  for (let cur = queue.shift(); cur; cur = queue.shift()) {
    for (const n of switchNeighbors(cur.dev, topology)) {
      const where = `${nameOf(cur.dev)} ${n.localIface.name} ↔ ${nameOf(n.device)} ${n.remoteIface.name}`;
      if (!n.verdict.trunk) {
        res.blockers.push(`${where}: ${n.verdict.reason}`);
        continue;
      }
      const nv = vtpOf(n.device);
      const nMode = modeOf(n.device);
      if (nMode === "off") {
        res.blockers.push(`${where}: VTP ist am Nachbarn ausgeschaltet`);
        continue;
      }
      let certain = cur.certain;
      if (nMode === "transparent") {
        // v2 leitet unabhängig von der Domain weiter, v1 nur bei gleicher Domain
        if (nv.domain !== domain) {
          if (nv.version === 1) {
            res.blockers.push(`${where}: Transparent mit VTP v1 leitet nur Nachrichten der eigenen Domain weiter`);
            continue;
          }
          if (nv.version === undefined) {
            certain = false;
            res.versionDependent.push(nameOf(n.device));
          }
        }
      } else {
        if (nv.domain && nv.domain !== domain) {
          res.blockers.push(`${where}: andere VTP-Domain (${nv.domain})`);
          continue;
        }
        if ((nv.password ?? "") !== password) {
          res.blockers.push(`${where}: VTP-Passwort stimmt nicht überein`);
          continue;
        }
      }
      const prev = seen.get(n.device.id);
      if (prev !== undefined && (prev || !certain)) continue;
      seen.set(n.device.id, certain);
      if (nMode !== "transparent") res.receivers.set(n.device.id, certain);
      queue.push({ dev: n.device, certain });
    }
  }
  return res;
}

export function computeVtpSync(device: TopologyDevice, topology: NetworkTopology): VtpSyncResult {
  const result: VtpSyncResult = { servers: [], uncertainServers: [], blockers: [], versionDependent: [] };
  const mode = modeOf(device);
  if (mode === "off" || mode === "transparent") return result;
  const sources = topology.devices.filter((d) => isSwitch(d) && d.id !== device.id && modeOf(d) === "server" && !!vtpOf(d).domain);
  const ownDomain = vtpOf(device).domain;
  const reaching: Array<{ src: TopologyDevice; certain: boolean }> = [];
  const blockers = new Set<string>();
  const versionDependent = new Set<string>();
  for (const src of sources) {
    const f = flood(src, topology);
    f.blockers.forEach((b) => blockers.add(b));
    const got = f.receivers.get(device.id);
    if (got === undefined) continue;
    if (ownDomain && vtpOf(src).domain !== ownDomain) continue;
    reaching.push({ src, certain: got });
    f.versionDependent.forEach((v) => versionDependent.add(v));
  }
  result.blockers = [...blockers];
  result.versionDependent = [...versionDependent];
  let usable = reaching;
  if (!ownDomain) {
    const domains = [...new Set(reaching.map((r) => vtpOf(r.src).domain as string))];
    if (domains.length > 1) {
      result.ambiguousDomains = domains;
      return result;
    }
    if (domains.length === 1) result.adoptedDomain = domains[0];
    usable = reaching;
  }
  result.servers = usable.filter((r) => r.certain).map((r) => r.src);
  result.uncertainServers = usable.filter((r) => !r.certain).map((r) => r.src);
  return result;
}

const userVlans = (d: TopologyDevice) => (d.config?.vlans ?? []).filter((v) => v.id !== 1 && !(v.id >= 1002 && v.id <= 1005));

const ADOPTION_NOTE = "Ohne Domain im Lab übernimmt der Switch die Domain aus der ersten empfangenen VTP-Nachricht über einen Trunk und synchronisiert danach (das Passwort muss passen).";

export function formatShowVtpStatus(device: TopologyDevice, topology: NetworkTopology): string {
  const vtp = device.config?.vtp;
  if (!vtp) return "";
  const lines: string[] = [];
  const row = (label: string, value: string) => `${label.padEnd(32)}: ${value}`;
  const mode = modeOf(device);
  const modeNote = vtp.mode ? "" : " (Standard, im Lab nicht gesetzt)";
  const sync = computeVtpSync(device, topology);
  const received = [...sync.servers, ...sync.uncertainServers];

  lines.push(row("VTP version running", vtp.version !== undefined ? String(vtp.version) : "im Lab nicht angegeben"));
  lines.push(row("Configuration Revision", "abhängig vom Verlauf"));

  let vlanCount: string;
  if (mode === "server") {
    const ids = new Set(userVlans(device).map((v) => v.id));
    for (const s of sync.servers) userVlans(s).forEach((v) => ids.add(v.id));
    const note = sync.servers.length > 0 ? " (inkl. VLANs weiterer Server; bei Konflikten entscheidet die Revisionsnummer)" : "";
    vlanCount = `${DEFAULT_VLAN_COUNT + ids.size}${note}${sync.uncertainServers.length > 0 ? " (ohne die Server, die nur über einen Transparent-Switch erreichbar sind)" : ""}`;
  } else if (mode === "client") {
    const ids = new Set<number>();
    for (const s of sync.servers) userVlans(s).forEach((v) => ids.add(v.id));
    if (sync.ambiguousDomains) vlanCount = "abhängig vom Verlauf";
    else if (sync.servers.length > 0) vlanCount = String(DEFAULT_VLAN_COUNT + ids.size) + (sync.uncertainServers.length > 0 ? " (ohne die Server, die nur über einen Transparent-Switch erreichbar sind)" : "");
    else if (sync.uncertainServers.length > 0) vlanCount = "nicht bestimmbar";
    else vlanCount = `${DEFAULT_VLAN_COUNT} (nur Standard-VLANs, keine Synchronisation)`;
  } else if (mode === "transparent") {
    vlanCount = String(DEFAULT_VLAN_COUNT + userVlans(device).length);
  } else {
    vlanCount = "nicht bestimmbar";
  }
  lines.push(row("Number of existing VLANs", vlanCount));
  lines.push(row("VTP Operating Mode", mode.charAt(0).toUpperCase() + mode.slice(1) + modeNote));
  let domainText: string;
  if (vtp.domain) domainText = vtp.domain;
  else if (sync.adoptedDomain) domainText = `${sync.adoptedDomain} (übernommen aus der ersten empfangenen VTP-Nachricht, im Lab nicht gesetzt)`;
  else if (sync.ambiguousDomains) domainText = `abhängig vom Verlauf (erste empfangene Nachricht; erreichbar: ${sync.ambiguousDomains.join(", ")})`;
  else domainText = "nicht gesetzt (im Lab nicht angegeben)";
  lines.push(row("VTP Domain Name", domainText));

  const notes: string[] = [];
  if (mode === "client" || mode === "server") {
    if (!vtp.domain) notes.push(`% ${ADOPTION_NOTE}`);
    if (mode === "client") {
      if (sync.ambiguousDomains) notes.push("% Mehrere VTP-Domains erreichbar: welche der Switch übernimmt, hängt von der ersten empfangenen Nachricht ab.");
      else if (sync.servers.length > 0) notes.push(`% Synchronisiert mit VTP-Server: ${sync.servers.map(nameOf).join(", ")} (Trunk-Kette, gleiche Domain und gleiches Passwort).`);
      else if (received.length === 0) {
        notes.push(vtp.domain || sync.blockers.length > 0 ? "% Keine Synchronisation: kein VTP-Server über funktionierende Trunks erreichbar." : "% Keine Synchronisation: keine VTP-Nachricht empfangen (kein Server mit Domain über Trunks erreichbar).");
        for (const b of sync.blockers) notes.push(`%   ${b}`);
        if (sync.blockers.length === 0 && !hasSwitchNeighbor(device, topology)) notes.push("%   Der Switch hat im Lab keinen Nachbar-Switch.");
      }
    } else if (sync.blockers.length > 0 && vtp.domain) {
      notes.push("% Hinweis: Diese Verbindungen verteilen keine VLANs:");
      for (const b of sync.blockers) notes.push(`%   ${b}`);
    }
    if (sync.versionDependent.length > 0) {
      notes.push(`% Transparent-Switch ${sync.versionDependent.join(", ")}: ob er Nachrichten einer anderen Domain weiterleitet, hängt von der VTP-Version ab (im Lab nicht angegeben; v2 leitet weiter, v1 nur bei gleicher Domain).`);
    }
  }
  if (mode === "transparent") notes.push("% Transparent: eigene VLAN-Datenbank, übernimmt keine VLANs; VTP-Nachrichten werden über die Trunks weitergeleitet (v2 unabhängig von der Domain, v1 nur bei gleicher Domain).");
  if (notes.length > 0) lines.push("", ...notes);
  return lines.join("\n");
}

function hasSwitchNeighbor(device: TopologyDevice, topology: NetworkTopology): boolean {
  return switchNeighbors(device, topology).length > 0;
}

/** Hinweise für den Inspector. */
export function vtpHints(device: TopologyDevice, topology: NetworkTopology): string[] {
  if (!hasVtpConfig(device)) return [];
  const mode = modeOf(device);
  const hints: string[] = [];
  const vtp = vtpOf(device);
  if ((mode === "server" || mode === "client") && !vtp.domain) {
    const sync = computeVtpSync(device, topology);
    hints.push(ADOPTION_NOTE);
    if (sync.ambiguousDomains) hints.push("Mehrere Domains sind erreichbar: die Domain hängt von der ersten empfangenen Nachricht ab (Verlauf).");
  }
  if (mode === "transparent") hints.push("Transparent: keine VLAN-Übernahme, VTP-Nachrichten laufen durch (v2 unabhängig von der Domain, v1 nur bei gleicher Domain).");
  return hints;
}

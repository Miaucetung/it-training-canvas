import type { NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";

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

export interface VtpSyncResult {
  /** Server derselben Domain, die über funktionierende Trunks erreichbar sind */
  servers: TopologyDevice[];
  /** Gründe, warum Nachbarn nicht zur Synchronisation beitragen */
  blockers: string[];
}

const nameOf = (d: TopologyDevice) => d.config?.hostname ?? d.name;

export function computeVtpSync(device: TopologyDevice, topology: NetworkTopology): VtpSyncResult {
  const vtp = device.config?.vtp;
  const result: VtpSyncResult = { servers: [], blockers: [] };
  if (!vtp?.domain) return result;
  const visited = new Set<string>([device.id]);
  const queue: TopologyDevice[] = [device];
  for (let cur = queue.shift(); cur; cur = queue.shift()) {
    for (const n of switchNeighbors(cur, topology)) {
      const where = `${nameOf(cur)} ${n.localIface.name} ↔ ${nameOf(n.device)} ${n.remoteIface.name}`;
      if (!n.verdict.trunk) {
        result.blockers.push(`${where}: ${n.verdict.reason}`);
        continue;
      }
      const nv = n.device.config?.vtp;
      if (!nv?.domain) {
        result.blockers.push(`${where}: Nachbar ohne VTP-Konfiguration im Lab`);
        continue;
      }
      if (nv.domain !== vtp.domain) {
        result.blockers.push(`${where}: andere VTP-Domain (${nv.domain})`);
        continue;
      }
      if ((nv.password ?? "") !== (vtp.password ?? "")) {
        result.blockers.push(`${where}: VTP-Passwort stimmt nicht überein`);
        continue;
      }
      if (visited.has(n.device.id)) continue;
      visited.add(n.device.id);
      if (nv.mode === "server" || nv.mode === undefined) result.servers.push(n.device);
      if (nv.mode !== "off") queue.push(n.device);
    }
  }
  return result;
}

const userVlans = (d: TopologyDevice) => (d.config?.vlans ?? []).filter((v) => v.id !== 1 && !(v.id >= 1002 && v.id <= 1005));

export function formatShowVtpStatus(device: TopologyDevice, topology: NetworkTopology): string {
  const vtp = device.config?.vtp;
  if (!vtp) return "";
  const lines: string[] = [];
  const row = (label: string, value: string) => `${label.padEnd(32)}: ${value}`;
  const mode = vtp.mode ?? "server";
  const modeNote = vtp.mode ? "" : " (Standard, im Lab nicht gesetzt)";
  lines.push(row("VTP version running", vtp.version !== undefined ? String(vtp.version) : "im Lab nicht angegeben"));
  lines.push(row("Configuration Revision", "abhängig vom Verlauf"));

  const sync: VtpSyncResult = mode === "client" || mode === "server" ? computeVtpSync(device, topology) : { servers: [], blockers: [] };
  let vlanCount: string;
  if (mode === "server") {
    const ids = new Set(userVlans(device).map((v) => v.id));
    for (const s of sync.servers) userVlans(s).forEach((v) => ids.add(v.id));
    const note = sync.servers.length > 0 ? " (inkl. VLANs weiterer Server; bei Konflikten entscheidet die Revisionsnummer)" : "";
    vlanCount = `${DEFAULT_VLAN_COUNT + ids.size}${note}`;
  } else if (mode === "client") {
    const ids = new Set<number>();
    for (const s of sync.servers) userVlans(s).forEach((v) => ids.add(v.id));
    vlanCount = sync.servers.length > 0 ? String(DEFAULT_VLAN_COUNT + ids.size) : `${DEFAULT_VLAN_COUNT} (nur Standard-VLANs, keine Synchronisation)`;
  } else if (mode === "transparent") {
    vlanCount = String(DEFAULT_VLAN_COUNT + userVlans(device).length);
  } else {
    vlanCount = "nicht bestimmbar";
  }
  lines.push(row("Number of existing VLANs", vlanCount));
  lines.push(row("VTP Operating Mode", mode.charAt(0).toUpperCase() + mode.slice(1) + modeNote));
  lines.push(row("VTP Domain Name", vtp.domain ?? "nicht gesetzt (im Lab nicht angegeben)"));

  if (mode === "client") {
    lines.push("");
    if (!vtp.domain) {
      lines.push("% Synchronisation nicht bestimmbar: im Lab ist keine VTP-Domain gesetzt.");
    } else if (sync.servers.length > 0) {
      lines.push(`% Synchronisiert mit VTP-Server: ${sync.servers.map(nameOf).join(", ")} (Trunk-Kette, gleiche Domain und gleiches Passwort).`);
    } else {
      lines.push("% Keine Synchronisation: kein VTP-Server über funktionierende Trunks erreichbar.");
      for (const b of sync.blockers) lines.push(`%   ${b}`);
      if (sync.blockers.length === 0) lines.push("%   Der Switch hat im Lab keinen Nachbar-Switch.");
    }
  }
  if (mode === "server" && vtp.domain && sync.blockers.length > 0) {
    lines.push("");
    lines.push("% Hinweis: Diese Verbindungen verteilen keine VLANs:");
    for (const b of sync.blockers) lines.push(`%   ${b}`);
  }
  if (mode === "transparent") {
    lines.push("");
    lines.push("% Transparent: eigene VLAN-Datenbank, keine Synchronisation.");
  }
  return lines.join("\n");
}

import type { NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";

export const DEFAULT_STP_PRIORITY = 32768;
const SYS_ID_EXT_VLAN1 = 1;

export type StpPortRole = "Root" | "Desg" | "Altn";
export type StpPortState = "FWD" | "BLK";

export interface StpPortInfo {
  iface: TopologyInterface;
  role: StpPortRole;
  state: StpPortState;
  cost: number;
  portNumber: number;
}

export interface StpBridgeInfo {
  device: TopologyDevice;
  priority: number;
  mac: string; // 0050.7966.0001
  isRoot: boolean;
  rootDevice: TopologyDevice;
  rootPathCost: number;
  /** Root-Port (nur auf Nicht-Root-Bridges) */
  rootPort?: StpPortInfo;
  /** Nur Ports, an denen ein Link hängt */
  ports: StpPortInfo[];
}

export function isSwitch(device: TopologyDevice): boolean {
  return device.type === "switch-l2" || device.type === "switch-l3";
}

/** 802.1D-Pfadkosten (Short Method) nach Interface-Typ */
export function stpPortCost(name: string): number {
  if (/^te/i.test(name)) return 2;
  if (/^gi/i.test(name)) return 4;
  if (/^fa/i.test(name)) return 19;
  if (/^e(th)?\d/i.test(name)) return 100;
  return 4;
}

/** Port-Nummer wie auf dem Catalyst 2960-24TT: Fa0/n = n, Gi0/n = 24 + n. */
export function stpPortNumber(iface: TopologyInterface, fallbackIndex: number): number {
  const fa = /^fa\w*?0\/(\d+)$/i.exec(iface.name);
  if (fa) return Number(fa[1]);
  const gi = /^gi\w*?0\/(\d+)$/i.exec(iface.name);
  if (gi) return 24 + Number(gi[1]);
  return fallbackIndex + 1;
}

function macToNumber(mac: string): number {
  return parseInt(mac.replace(/[.:-]/g, "").padEnd(12, "0"), 16);
}

function formatMac(index: number): string {
  const hex = (index + 1).toString(16).padStart(4, "0");
  return `0050.7966.${hex}`;
}

function bridgeMac(device: TopologyDevice, index: number): string {
  return device.config?.stp?.mac ?? formatMac(index);
}

function bridgePriority(device: TopologyDevice): number {
  return device.config?.stp?.priority ?? DEFAULT_STP_PRIORITY;
}

function isUsableIface(iface: TopologyInterface): boolean {
  return iface.status === "up" && !iface.isShutdown;
}

interface Edge {
  a: TopologyDevice;
  aIface: TopologyInterface;
  b: TopologyDevice;
  bIface: TopologyInterface;
}

function lexLess(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
}

function bidLess(
  x: { priority: number; mac: string },
  y: { priority: number; mac: string }
): boolean {
  return x.priority !== y.priority ? x.priority < y.priority : macToNumber(x.mac) < macToNumber(y.mac);
}

/**
 * Berechnet IEEE-802.1D-Spanning-Tree (ein Baum für VLAN 1) aus dem Topologiemodell:
 * Root = niedrigste Bridge-ID, Root-Port = geringste Pfadkosten (dann Sender-BID, Sender-Port, lokaler Port),
 * Designated Port je Segment = geringste Root-Pfadkosten (dann BID, Port-ID), der Rest ist Alternate/Blocking.
 */
export function computeStp(topology: NetworkTopology): Map<string, StpBridgeInfo> {
  const switches = topology.devices.filter(isSwitch);
  const index = new Map(topology.devices.map((d, i) => [d.id, i]));
  const byId = new Map(switches.map((d) => [d.id, d]));
  const bid = (d: TopologyDevice) => ({ priority: bridgePriority(d), mac: bridgeMac(d, index.get(d.id) ?? 0) });

  const edges: Edge[] = [];
  for (const link of topology.links) {
    const a = byId.get(link.sourceDeviceId);
    const b = byId.get(link.targetDeviceId);
    if (!a || !b || a.id === b.id) continue;
    if (link.status === "down" || link.status === "admin-down") continue;
    const aIface = a.interfaces.find((i) => i.id === link.sourceInterfaceId);
    const bIface = b.interfaces.find((i) => i.id === link.targetInterfaceId);
    if (!aIface || !bIface || !isUsableIface(aIface) || !isUsableIface(bIface)) continue;
    edges.push({ a, aIface, b, bIface });
  }

  // Zusammenhangskomponenten und Root je Komponente
  const component = new Map<string, string>();
  const rootOf = new Map<string, TopologyDevice>();
  for (const sw of switches) {
    if (component.has(sw.id)) continue;
    const members: TopologyDevice[] = [];
    const stack = [sw];
    component.set(sw.id, sw.id);
    while (stack.length) {
      const cur = stack.pop()!;
      members.push(cur);
      for (const e of edges) {
        const other = e.a.id === cur.id ? e.b : e.b.id === cur.id ? e.a : null;
        if (other && !component.has(other.id)) {
          component.set(other.id, sw.id);
          stack.push(other);
        }
      }
    }
    const root = members.reduce((best, d) => (bidLess(bid(d), bid(best)) ? d : best));
    for (const m of members) rootOf.set(m.id, root);
  }

  // Root-Pfadkosten (Dijkstra, Kosten = Kosten des empfangenden Ports)
  const cost = new Map<string, number>();
  for (const sw of switches) cost.set(sw.id, rootOf.get(sw.id)!.id === sw.id ? 0 : Infinity);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of edges) {
      for (const [from, to, toIface] of [
        [e.a, e.b, e.bIface],
        [e.b, e.a, e.aIface],
      ] as const) {
        const c = cost.get(from.id)! + stpPortCost(toIface.name);
        if (c < cost.get(to.id)!) {
          cost.set(to.id, c);
          changed = true;
        }
      }
    }
  }

  const portNo = (d: TopologyDevice, iface: TopologyInterface) =>
    stpPortNumber(iface, d.interfaces.indexOf(iface));

  // Root-Port je Nicht-Root-Bridge
  const rootPortIface = new Map<string, TopologyInterface>();
  for (const sw of switches) {
    if (rootOf.get(sw.id)!.id === sw.id) continue;
    let best: { key: number[]; iface: TopologyInterface } | null = null;
    for (const e of edges) {
      const mine = e.a.id === sw.id ? e.aIface : e.b.id === sw.id ? e.bIface : null;
      if (!mine) continue;
      const peer = e.a.id === sw.id ? e.b : e.a;
      const peerIface = e.a.id === sw.id ? e.bIface : e.aIface;
      if (cost.get(peer.id)! + stpPortCost(mine.name) !== cost.get(sw.id)) continue;
      const peerBid = bid(peer);
      const key = [peerBid.priority, macToNumber(peerBid.mac), portNo(peer, peerIface), portNo(sw, mine)];
      const better = !best || lexLess(key, best.key);
      if (better) best = { key, iface: mine };
    }
    if (best) rootPortIface.set(sw.id, best.iface);
  }

  // Designated Port je Segment
  const designated = new Set<string>(); // `${deviceId}|${ifaceId}`
  for (const e of edges) {
    const aWins = (() => {
      const ca = cost.get(e.a.id)!;
      const cb = cost.get(e.b.id)!;
      if (ca !== cb) return ca < cb;
      const ba = bid(e.a);
      const bb = bid(e.b);
      if (ba.priority !== bb.priority || ba.mac !== bb.mac) return bidLess(ba, bb);
      return portNo(e.a, e.aIface) <= portNo(e.b, e.bIface);
    })();
    designated.add(aWins ? `${e.a.id}|${e.aIface.id}` : `${e.b.id}|${e.bIface.id}`);
  }

  const connectedIfaces = (sw: TopologyDevice): TopologyInterface[] => {
    const ids = new Set<string>();
    for (const l of topology.links) {
      if (l.status === "down" || l.status === "admin-down") continue;
      if (l.sourceDeviceId === sw.id) ids.add(l.sourceInterfaceId);
      if (l.targetDeviceId === sw.id) ids.add(l.targetInterfaceId);
    }
    return sw.interfaces.filter((i) => ids.has(i.id) && isUsableIface(i));
  };

  const result = new Map<string, StpBridgeInfo>();
  for (const sw of switches) {
    const root = rootOf.get(sw.id)!;
    const rp = rootPortIface.get(sw.id);
    const switchPeerIfaceIds = new Set(
      edges.flatMap((e) => [e.a.id === sw.id ? e.aIface.id : "", e.b.id === sw.id ? e.bIface.id : ""]).filter(Boolean)
    );
    const ports: StpPortInfo[] = connectedIfaces(sw).map((iface) => {
      let role: StpPortRole = "Desg";
      if (switchPeerIfaceIds.has(iface.id)) {
        if (rp && rp.id === iface.id) role = "Root";
        else if (designated.has(`${sw.id}|${iface.id}`)) role = "Desg";
        else role = "Altn";
      }
      return {
        iface,
        role,
        state: role === "Altn" ? "BLK" : "FWD",
        cost: stpPortCost(iface.name),
        portNumber: portNo(sw, iface),
      };
    });
    result.set(sw.id, {
      device: sw,
      priority: bridgePriority(sw),
      mac: bridgeMac(sw, index.get(sw.id) ?? 0),
      isRoot: root.id === sw.id,
      rootDevice: root,
      rootPathCost: cost.get(sw.id)!,
      rootPort: ports.find((p) => p.role === "Root"),
      ports,
    });
  }
  return result;
}

function longIfaceName(name: string): string {
  return name
    .replace(/^Gi(?=\d)/i, "GigabitEthernet")
    .replace(/^Fa(?=\d)/i, "FastEthernet")
    .replace(/^Te(?=\d)/i, "TenGigabitEthernet");
}

const padRight = (s: string, n: number) => s.padEnd(n, " ");

export function formatShowSpanningTree(device: TopologyDevice, topology: NetworkTopology): string {
  if (!isSwitch(device)) return "% Spanning tree ist auf diesem Gerät nicht verfügbar";
  const all = computeStp(topology);
  const info = all.get(device.id);
  if (!info) return "% Spanning tree ist auf diesem Gerät nicht verfügbar";
  const root = all.get(info.rootDevice.id)!;
  const ext = (p: number) => p + SYS_ID_EXT_VLAN1;

  const lines = [
    "VLAN0001",
    "  Spanning tree enabled protocol ieee",
    `  Root ID    Priority    ${ext(root.priority)}`,
    `             Address     ${root.mac}`,
  ];
  if (info.isRoot) {
    lines.push("             This bridge is the root");
  } else {
    lines.push(`             Cost        ${info.rootPathCost}`);
    lines.push(
      `             Port        ${info.rootPort ? `${info.rootPort.portNumber} (${longIfaceName(info.rootPort.iface.name)})` : "-"}`
    );
  }
  lines.push("             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec");
  lines.push("");
  lines.push(`  Bridge ID  Priority    ${ext(info.priority)}  (priority ${info.priority} sys-id-ext ${SYS_ID_EXT_VLAN1})`);
  lines.push(`             Address     ${info.mac}`);
  lines.push("             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec");
  lines.push("             Aging Time  300 sec");
  lines.push("");
  lines.push("Interface           Role Sts Cost      Prio.Nbr Type");
  lines.push("------------------- ---- --- --------- -------- --------------------------------");
  for (const p of info.ports) {
    lines.push(
      `${padRight(p.iface.name, 20)}${p.role} ${p.state} ${padRight(String(p.cost), 9)} ${padRight(`128.${p.portNumber}`, 8)} P2p`
    );
  }
  return lines.join("\n");
}

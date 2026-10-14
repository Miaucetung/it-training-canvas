import type { NetworkTopology, TopologyDevice, TopologyInterface, TopologyLink } from "@/types/topology";
import {
  collectSegmentPeers,
  computeAdjacencies,
  DEFAULT_PRIORITY,
  findLinkEnd,
  isInterfaceActive,
  type OspfAdjacency,
  type OspfFlavor,
  type OspfInterfaceState,
} from "./ospf-neighbors";
import { ipToNumber, isValidIpv4 } from "./topology-validation";

// ---------------------------------------------------------------------------
// IPv6-Adressen
// ---------------------------------------------------------------------------

export const LINK_LOCAL_UNKNOWN = "nicht bestimmbar (Link-Local, EUI-64, MAC unbekannt)";

/** "2001:db8::1" -> 128-bit BigInt (ohne eingebettetes IPv4); null bei Fehlern. */
export function parseIpv6(addr: string): bigint | null {
  const a = addr.trim();
  if (!a || a.includes(".") || (a.match(/::/g) ?? []).length > 1 || /[^0-9a-fA-F:]/.test(a)) return null;
  const [head, tail] = a.includes("::") ? a.split("::") : [a, undefined];
  const h = head === "" ? [] : head.split(":");
  const t = tail === undefined || tail === "" ? [] : tail.split(":");
  const groups = tail === undefined ? h : [...h, ...Array(8 - h.length - t.length).fill("0"), ...t];
  if (groups.length !== 8 || groups.some((g) => g.length === 0 || g.length > 4)) return null;
  let v = 0n;
  for (const g of groups) v = (v << 16n) | BigInt(parseInt(g, 16));
  return v;
}

/** 128-bit BigInt -> IOS-Schreibweise (Großbuchstaben, längste Null-Folge als ::). */
export function formatIpv6(v: bigint): string {
  const groups: number[] = [];
  for (let i = 7; i >= 0; i--) groups.push(Number((v >> BigInt(i * 16)) & 0xffffn));
  let bestStart = -1;
  let bestLen = 0;
  for (let i = 0; i < 8; ) {
    if (groups[i] !== 0) {
      i++;
      continue;
    }
    let j = i;
    while (j < 8 && groups[j] === 0) j++;
    if (j - i > bestLen) {
      bestStart = i;
      bestLen = j - i;
    }
    i = j;
  }
  const hex = (g: number) => g.toString(16).toUpperCase();
  if (bestLen < 2) return groups.map(hex).join(":");
  return `${groups.slice(0, bestStart).map(hex).join(":")}::${groups.slice(bestStart + bestLen).map(hex).join(":")}`;
}

export interface Ipv6Cidr {
  addr: bigint;
  len: number;
  network: bigint;
}

export function parseIpv6Cidr(s: string): Ipv6Cidr | null {
  const m = /^(\S+)\/(\d{1,3})$/.exec(s.trim());
  if (!m) return null;
  const addr = parseIpv6(m[1]);
  const len = Number(m[2]);
  if (addr === null || len > 128) return null;
  return { addr, len, network: networkOf(addr, len) };
}

export function networkOf(addr: bigint, len: number): bigint {
  if (len === 0) return 0n;
  const mask = ((1n << 128n) - 1n) ^ ((1n << BigInt(128 - len)) - 1n);
  return addr & mask;
}

const isLinkLocal = (addr: bigint) => (addr >> 118n) === 0x3fan; // fe80::/10

// ---------------------------------------------------------------------------
// Interface-Zustand und Router-IDs
// ---------------------------------------------------------------------------

const isLoopback = (i: TopologyInterface) => /^lo(opback)?\d+/i.test(i.name);

function linkOf(device: TopologyDevice, iface: TopologyInterface, topology: NetworkTopology): TopologyLink | undefined {
  return topology.links.find(
    (l) => (l.sourceDeviceId === device.id && l.sourceInterfaceId === iface.id) || (l.targetDeviceId === device.id && l.targetInterfaceId === iface.id)
  );
}

/** Interface up/up: Status up, nicht abgeschaltet, Loopback oder Kabel mit aktivem Link. */
export function isIfaceOperational(device: TopologyDevice, iface: TopologyInterface, topology: NetworkTopology): boolean {
  if (iface.status !== "up" || iface.isShutdown) return false;
  if (isLoopback(iface)) return true;
  const link = linkOf(device, iface, topology);
  return !!link && (link.status === "up" || link.status === "stp-forwarding");
}

function ipv4RouterId(device: TopologyDevice): string | null {
  const highest = (ifaces: TopologyInterface[]) => {
    let best: string | null = null;
    for (const i of ifaces) {
      const ip = i.ip?.split("/")[0];
      if (!ip || !isValidIpv4(ip)) continue;
      if (best === null || ipToNumber(ip) > ipToNumber(best)) best = ip;
    }
    return best;
  };
  const loopbacks = device.interfaces.filter((i) => isLoopback(i) && !i.isShutdown && i.status !== "admin-down");
  return highest(loopbacks) ?? highest(device.interfaces.filter(isInterfaceActive));
}

const manualId = (id?: string) => (id && isValidIpv4(id.trim()) ? id.trim() : null);

/** OSPFv3: manuelle router-id, sonst IPv4-Regel; ohne IPv4 am Gerät ist die manuelle ID Pflicht (null). */
export function ospfv3RouterId(device: TopologyDevice): string | null {
  return manualId(device.config?.ospfv3?.routerId) ?? ipv4RouterId(device);
}

export function eigrpv6RouterId(device: TopologyDevice): string | null {
  return manualId(device.config?.eigrpv6?.routerId) ?? ipv4RouterId(device);
}

const isL3 = (d: TopologyDevice) => d.type === "router" || (d.type === "switch-l3" && d.config?.ipRoutingEnabled !== false);
const routingOn = (d: TopologyDevice) => isL3(d) && d.config?.ipv6RoutingEnabled === true;

// ---------------------------------------------------------------------------
// OSPFv3
// ---------------------------------------------------------------------------

export const OSPFV3: OspfFlavor = {
  runs: (d) => routingOn(d) && d.config?.ospfv3 !== undefined,
  routerId: (d) => ospfv3RouterId(d),
  resolve: (d, i): OspfInterfaceState | null => {
    if (!routingOn(d) || !i.ipv6 || !i.ospfv3) return null;
    return {
      area: i.ospfv3.area,
      networkType: i.ospfv3.networkType ?? "broadcast",
      passive: i.ospfv3.passive ?? false,
      priority: i.ospfv3.priority ?? DEFAULT_PRIORITY,
    };
  },
  compatible: (l, r) => !!l.ipv6 && !!r.ipv6,
  address: (i) => i.ipv6LinkLocal ?? "",
};

/** Echte OSPFv3-Nachbarschaften (gleiche Regeln wie OSPFv2, inkl. Switch-Segmenten und DR/BDR-Wahl). */
export function computeOspfv3Neighbors(device: TopologyDevice, topology: NetworkTopology): OspfAdjacency[] {
  return computeAdjacencies(device, topology, OSPFV3);
}

export function formatOspfv3NeighborTable(device: TopologyDevice, adjacencies: OspfAdjacency[]): string {
  if (!routingOn(device)) return "% IPv6 routing not enabled (ipv6 unicast-routing fehlt)";
  const rid = ospfv3RouterId(device);
  const proc = device.config?.ospfv3?.processId ?? 1;
  if (!rid) return `OSPFv3 Prozess ${proc}: keine Router-ID bestimmbar (kein IPv4 am Gerät, router-id fehlt) - keine Nachbarschaften`;
  const head = `OSPFv3 Router with ID (${rid}) (Process ID ${proc})\n`;
  const header = "Neighbor ID     Pri   State           Dead Time   Interface ID    Interface";
  const rows = adjacencies.map((a) => {
    const state = `${a.state}/${a.neighborRole === "-" ? "  -" : a.neighborRole}`;
    return a.neighborRouterId.padEnd(16) + String(a.neighborPriority).padStart(3) + "   " + state.padEnd(16) + "-".padEnd(12) + "-".padEnd(16) + longName(a.localInterface.name);
  });
  const note = adjacencies.length > 0 ? "\n(Dead Time und Interface ID sind Laufzeitwerte: nicht bestimmbar)" : "";
  return head + [header, ...rows].join("\n") + note;
}

// ---------------------------------------------------------------------------
// EIGRPv6
// ---------------------------------------------------------------------------

export interface EigrpV6Neighbor {
  link: TopologyLink;
  asn: number;
  localInterface: TopologyInterface;
  neighbor: TopologyDevice;
  neighborInterface: TopologyInterface;
  neighborRouterId: string;
}

/** Prozess läuft: Gerät routet IPv6, AS konfiguriert, `no shutdown` gesetzt, Router-ID bestimmbar. */
export function eigrpv6Runs(device: TopologyDevice): boolean {
  const c = device.config?.eigrpv6;
  return routingOn(device) && !!c && c.shutdown !== true && eigrpv6RouterId(device) !== null;
}

export function computeEigrpv6Neighbors(device: TopologyDevice, topology: NetworkTopology): EigrpV6Neighbor[] {
  const result: EigrpV6Neighbor[] = [];
  if (!eigrpv6Runs(device)) return result;
  const asn = device.config!.eigrpv6!.asn;
  for (const link of topology.links) {
    const first = findLinkEnd(topology, link, device.id);
    if (!first) continue;
    const { local } = first;
    if (local.eigrpv6?.asn !== asn || !local.ipv6) continue;
    if (!(link.status === "up" || link.status === "stp-forwarding") || !isInterfaceActive(local)) continue;
    const peers = collectSegmentPeers(topology, device, local, first, link);
    if (!peers) continue;
    for (const peer of peers) {
      if (peer.device.id === device.id || !eigrpv6Runs(peer.device)) continue;
      if (peer.device.config!.eigrpv6!.asn !== asn || peer.iface.eigrpv6?.asn !== asn || !peer.iface.ipv6) continue;
      if (!isInterfaceActive(peer.iface)) continue;
      result.push({ link, asn, localInterface: local, neighbor: peer.device, neighborInterface: peer.iface, neighborRouterId: eigrpv6RouterId(peer.device)! });
    }
  }
  return result;
}

export function formatEigrpv6NeighborTable(device: TopologyDevice, neighbors: EigrpV6Neighbor[]): string {
  const c = device.config?.eigrpv6;
  if (!c) return "";
  if (!routingOn(device)) return "% IPv6 routing not enabled (ipv6 unicast-routing fehlt)";
  if (c.shutdown === true) return `EIGRP-IPv6: AS ${c.asn} ist shutdown (no shutdown fehlt) - keine Nachbarschaften`;
  if (eigrpv6RouterId(device) === null) return `EIGRP-IPv6: AS ${c.asn} ohne Router-ID (kein IPv4 am Gerät, eigrp router-id fehlt) - keine Nachbarschaften`;
  const head = `EIGRP-IPv6 Neighbors for AS(${c.asn})`;
  const header = "H   Address                 Interface   Hold Uptime  SRTT  RTO  Q   Seq";
  const rows = neighbors.flatMap((n, idx) => [
    `${String(idx).padEnd(4)}${"Link-local address:".padEnd(24)}${n.localInterface.name.padEnd(12)}${"-".padEnd(5)}${"-".padEnd(8)}${"-".padEnd(6)}${"-".padEnd(5)}${"-".padEnd(4)}-`,
    `    ${n.neighborInterface.ipv6LinkLocal ?? LINK_LOCAL_UNKNOWN}`,
  ]);
  const note = neighbors.length > 0 ? "\n(Hold, Uptime, SRTT, RTO, Q, Seq sind Laufzeitwerte: nicht bestimmbar)" : "";
  return [head, header, ...rows].join("\n") + note;
}

// ---------------------------------------------------------------------------
// Routing-Tabelle
// ---------------------------------------------------------------------------

export type Ipv6RouteCode = "C" | "L" | "LC" | "S" | "O" | "D";

export interface Ipv6Route {
  code: Ipv6RouteCode;
  network: bigint;
  len: number;
  distance: number;
  metric: number;
  /** Zeilen "via ..." */
  vias: string[];
}


function ifaceKind(i: TopologyInterface): "gi" | "fa" | "et" | "se" | "lo" | "other" {
  if (isLoopback(i)) return "lo";
  if (/^gi/i.test(i.name)) return "gi";
  if (/^fa/i.test(i.name)) return "fa";
  if (/^et\d/i.test(i.name)) return "et";
  if (/^se/i.test(i.name)) return "se";
  return "other";
}

/** OSPF-Kosten bei Referenzbandbreite 100 Mbit/s: Ethernet 1, Serial (1544 kbit/s) 64, Loopback 1. */
export function ospfCost(i: TopologyInterface): number {
  const kind = ifaceKind(i);
  return kind === "se" ? 64 : kind === "et" ? 10 : 1;
}

/** EIGRP-Bandbreite (kbit/s) und Verzögerung (µs) der Standardwerte je Interface-Art. */
export function eigrpVector(i: TopologyInterface): { bw: number; delay: number } | null {
  switch (ifaceKind(i)) {
    case "et":
      return { bw: 10_000, delay: 1_000 };
    case "gi":
      return { bw: 1_000_000, delay: 10 };
    case "fa":
      return { bw: 100_000, delay: 100 };
    case "se":
      return { bw: 1_544, delay: 20_000 };
    case "lo":
      return { bw: 8_000_000, delay: 5_000 };
    default:
      return null;
  }
}

export const eigrpMetric = (bw: number, delay: number) => 256 * (Math.floor(10_000_000 / bw) + Math.floor(delay / 10));

const LONG: Array<[RegExp, string]> = [
  [/^Gi(?=\d)/, "GigabitEthernet"],
  [/^Fa(?=\d)/, "FastEthernet"],
  [/^Se(?=\d)/, "Serial"],
  [/^Lo(?=\d)/, "Loopback"],
];
export function longName(name: string): string {
  for (const [re, long] of LONG) if (re.test(name)) return name.replace(re, long);
  return name;
}

const prefixText = (r: { network: bigint; len: number }) => `${formatIpv6(r.network)}/${r.len}`;

type Candidate = Ipv6Route;

function connectedAndLocal(device: TopologyDevice, topology: NetworkTopology): Candidate[] {
  const out: Candidate[] = [];
  for (const i of device.interfaces) {
    const c = i.ipv6 ? parseIpv6Cidr(i.ipv6) : null;
    if (!c || !isIfaceOperational(device, i, topology)) continue;
    if (c.len === 128) {
      out.push({ code: "LC", network: c.addr, len: 128, distance: 0, metric: 0, vias: [`via ${longName(i.name)}, receive`] });
    } else {
      out.push({ code: "C", network: c.network, len: c.len, distance: 0, metric: 0, vias: [`via ${longName(i.name)}, directly connected`] });
      out.push({ code: "L", network: c.addr, len: 128, distance: 0, metric: 0, vias: [`via ${longName(i.name)}, receive`] });
    }
  }
  return out;
}

function staticRoutes(device: TopologyDevice, topology: NetworkTopology): Candidate[] {
  const out: Candidate[] = [];
  for (const r of device.config?.ipv6Routes ?? []) {
    const p = parseIpv6Cidr(r.prefix);
    if (!p) continue;
    const distance = r.distance ?? 1;
    const base = { code: "S" as const, network: p.network, len: p.len, distance, metric: 0 };
    if (r.nextHop) {
      const nh = parseIpv6(r.nextHop);
      if (nh === null) continue;
      if (isLinkLocal(nh)) {
        const out_if = device.interfaces.find((i) => r.outInterface && i.name === r.outInterface);
        if (!out_if || !isIfaceOperational(device, out_if, topology)) continue;
        out.push({ ...base, vias: [`via ${formatIpv6(nh)}, ${longName(out_if.name)}`] });
        continue;
      }
      // Rekursiv: Next-Hop muss in einem angeschlossenen, aktiven Präfix liegen (und nicht die eigene Adresse sein)
      const via = device.interfaces.find((i) => {
        const c = i.ipv6 ? parseIpv6Cidr(i.ipv6) : null;
        return !!c && isIfaceOperational(device, i, topology) && c.len < 128 && networkOf(nh, c.len) === c.network && c.addr !== nh;
      });
      if (!via) continue;
      out.push({ ...base, vias: [`via ${formatIpv6(nh)}`] });
    } else if (r.outInterface) {
      const i = device.interfaces.find((x) => x.name === r.outInterface);
      if (!i || !isIfaceOperational(device, i, topology)) continue;
      out.push({ ...base, vias: [`via ${longName(i.name)}, directly connected`] });
    }
  }
  return out;
}

/** Nächster Hop über eine Nachbarschaft: Link-Local nur, wenn im Lab konfiguriert. */
const nextHopText = (peerIface: TopologyInterface, localIface: TopologyInterface) =>
  `via ${peerIface.ipv6LinkLocal ? formatIpv6(parseIpv6(peerIface.ipv6LinkLocal) ?? 0n) : LINK_LOCAL_UNKNOWN}, ${longName(localIface.name)}`;

function ospfv3Routes(device: TopologyDevice, topology: NetworkTopology): Candidate[] {
  if (!OSPFV3.runs(device) || ospfv3RouterId(device) === null) return [];
  const out: Candidate[] = [];
  const routers = topology.devices.filter((d) => OSPFV3.runs(d) && ospfv3RouterId(d) !== null);
  const adjOf = new Map(routers.map((r) => [r.id, computeOspfv3Neighbors(r, topology)]));
  const areas = new Set(device.interfaces.filter((i) => i.ospfv3 && i.ipv6).map((i) => i.ospfv3!.area));

  for (const area of areas) {
    // Kanten (Router -> Nachbar) mit Kosten des ausgehenden Interfaces, nur in dieser Area
    type Edge = { to: string; cost: number; local: TopologyInterface; peer: TopologyInterface };
    const edges = new Map<string, Edge[]>();
    for (const r of routers) {
      const list: Edge[] = [];
      const adjs = adjOf.get(r.id)!;
      for (const a of adjs) {
        if (a.localInterface.ospfv3?.area !== area) continue;
        const segmentHasDr = adjs.some((x) => x.localInterface.id === a.localInterface.id && x.neighborRole === "DR");
        if (a.state === "2WAY" && !segmentHasDr) continue;
        list.push({ to: a.neighbor.id, cost: ospfCost(a.localInterface), local: a.localInterface, peer: a.neighborInterface });
      }
      edges.set(r.id, list);
    }
    // Dijkstra mit gleichwertigen ersten Hops
    const dist = new Map<string, number>([[device.id, 0]]);
    const firstHops = new Map<string, Array<{ local: TopologyInterface; peer: TopologyInterface }>>([[device.id, []]]);
    const done = new Set<string>();
    for (;;) {
      let cur: string | null = null;
      for (const [id, d] of dist) if (!done.has(id) && (cur === null || d < dist.get(cur)!)) cur = id;
      if (cur === null) break;
      done.add(cur);
      for (const e of edges.get(cur) ?? []) {
        const nd = dist.get(cur)! + e.cost;
        const hops = cur === device.id ? [{ local: e.local, peer: e.peer }] : firstHops.get(cur)!;
        if (!dist.has(e.to) || nd < dist.get(e.to)!) {
          dist.set(e.to, nd);
          firstHops.set(e.to, [...hops]);
        } else if (nd === dist.get(e.to)!) {
          const merged = firstHops.get(e.to)!;
          for (const h of hops) if (!merged.some((m) => m.local.id === h.local.id && m.peer.id === h.peer.id)) merged.push(h);
        }
      }
    }
    // Präfixe: Interfaces der erreichten Router in dieser Area
    const best = new Map<string, { metric: number; hops: Array<{ local: TopologyInterface; peer: TopologyInterface }>; network: bigint; len: number }>();
    for (const r of routers) {
      if (r.id === device.id || !dist.has(r.id)) continue;
      for (const i of r.interfaces) {
        const c = i.ipv6 ? parseIpv6Cidr(i.ipv6) : null;
        if (!c || i.ospfv3?.area !== area || !isIfaceOperational(r, i, topology)) continue;
        const metric = dist.get(r.id)! + ospfCost(i);
        const key = `${c.network}/${c.len}`;
        const cur = best.get(key);
        const hops = firstHops.get(r.id)!;
        if (!cur || metric < cur.metric) best.set(key, { metric, hops: [...hops], network: c.network, len: c.len });
        else if (metric === cur.metric) for (const h of hops) if (!cur.hops.some((m) => m.local.id === h.local.id && m.peer.id === h.peer.id)) cur.hops.push(h);
      }
    }
    for (const b of best.values()) {
      out.push({ code: "O", network: b.network, len: b.len, distance: 110, metric: b.metric, vias: b.hops.map((h) => nextHopText(h.peer, h.local)) });
    }
  }
  return out;
}

function eigrpv6Routes(device: TopologyDevice, topology: NetworkTopology): Candidate[] {
  if (!eigrpv6Runs(device)) return [];
  const asn = device.config!.eigrpv6!.asn;
  const routers = topology.devices.filter((d) => eigrpv6Runs(d) && d.config!.eigrpv6!.asn === asn);
  const neigh = new Map(routers.map((r) => [r.id, computeEigrpv6Neighbors(r, topology)]));

  interface Best {
    bw: number;
    delay: number;
    metric: number;
    network: bigint;
    len: number;
    hops: Array<{ local: TopologyInterface; peer: TopologyInterface; viaId: string }>;
  }
  const table = new Map<string, Map<string, Best>>();
  for (const r of routers) {
    const own = new Map<string, Best>();
    for (const i of r.interfaces) {
      const c = i.ipv6 ? parseIpv6Cidr(i.ipv6) : null;
      const v = eigrpVector(i);
      if (!c || !v || i.eigrpv6?.asn !== asn || !isIfaceOperational(r, i, topology)) continue;
      own.set(`${c.network}/${c.len}`, { bw: v.bw, delay: v.delay, metric: eigrpMetric(v.bw, v.delay), network: c.network, len: c.len, hops: [] });
    }
    table.set(r.id, own);
  }
  const ownPrefixes = new Map(routers.map((r) => [r.id, new Set(table.get(r.id)!.keys())]));

  for (let round = 0; round <= routers.length; round++) {
    let changed = false;
    for (const r of routers) {
      const mine = table.get(r.id)!;
      for (const n of neigh.get(r.id) ?? []) {
        const theirs = table.get(n.neighbor.id);
        const rv = eigrpVector(n.localInterface);
        if (!theirs || !rv) continue;
        for (const [key, tb] of theirs) {
          if (ownPrefixes.get(r.id)!.has(key)) continue;
          if (tb.hops.length > 0 && tb.hops.every((h) => h.viaId === r.id)) continue; // Schleifenvermeidung
          const bw = Math.min(tb.bw, rv.bw);
          const delay = tb.delay + rv.delay;
          const metric = eigrpMetric(bw, delay);
          const hop = { local: n.localInterface, peer: n.neighborInterface, viaId: n.neighbor.id };
          const cur = mine.get(key);
          if (!cur || metric < cur.metric) {
            mine.set(key, { bw, delay, metric, network: tb.network, len: tb.len, hops: [hop] });
            changed = true;
          } else if (metric === cur.metric && !cur.hops.some((h) => h.local.id === hop.local.id && h.peer.id === hop.peer.id)) {
            cur.hops.push(hop);
            changed = true;
          }
        }
      }
    }
    if (!changed) break;
  }

  const out: Candidate[] = [];
  for (const [key, b] of table.get(device.id)!) {
    if (ownPrefixes.get(device.id)!.has(key)) continue;
    out.push({ code: "D", network: b.network, len: b.len, distance: 90, metric: b.metric, vias: b.hops.map((h) => nextHopText(h.peer, h.local)) });
  }
  return out;
}

export interface Ipv6RouteTable {
  enabled: boolean;
  routes: Ipv6Route[];
}

/** Routing-Tabelle: Connected/Local, Static, OSPFv3 (O), EIGRPv6 (D); je Präfix gewinnt die niedrigste Administrative Distance. */
export function computeIpv6Routes(device: TopologyDevice, topology: NetworkTopology): Ipv6RouteTable {
  if (!routingOn(device)) return { enabled: false, routes: [] };
  const all = [
    ...connectedAndLocal(device, topology),
    ...staticRoutes(device, topology),
    ...ospfv3Routes(device, topology),
    ...eigrpv6Routes(device, topology),
  ];
  const byPrefix = new Map<string, Candidate[]>();
  for (const c of all) {
    const k = `${c.network}/${c.len}`;
    byPrefix.set(k, [...(byPrefix.get(k) ?? []), c]);
  }
  const routes: Ipv6Route[] = [];
  for (const cands of byPrefix.values()) {
    const minAd = Math.min(...cands.map((c) => c.distance));
    const winners = cands.filter((c) => c.distance === minAd);
    // gleiche Protokoll-Art zusammenführen (ECMP); verschiedene Codes mit gleicher AD bleiben getrennt
    const first = winners[0];
    const same = winners.filter((w) => w.code === first.code);
    const minMetric = Math.min(...same.map((w) => w.metric));
    const picked = same.filter((w) => w.metric === minMetric);
    routes.push({ ...first, metric: minMetric, vias: picked.flatMap((p) => p.vias) });
  }
  routes.sort((a, b) => (a.network === b.network ? a.len - b.len : a.network < b.network ? -1 : 1));
  return { enabled: true, routes };
}

export function formatShowIpv6Route(device: TopologyDevice, topology: NetworkTopology): string {
  const table = computeIpv6Routes(device, topology);
  if (!table.enabled) return "% IPv6 routing not enabled (ipv6 unicast-routing fehlt)";
  const lines = [
    `IPv6 Routing Table - default - ${table.routes.length} entries`,
    "Codes: C - Connected, L - Local, LC - Local Connected, S - Static, D - EIGRP, O - OSPF Intra",
  ];
  for (const r of table.routes) {
    lines.push(`${r.code.padEnd(4)}${prefixText(r)} [${r.distance}/${r.metric}]`);
    for (const v of r.vias) lines.push(`     ${v}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// show ipv6 interface brief
// ---------------------------------------------------------------------------

export function hasIpv6Config(device: TopologyDevice): boolean {
  return device.interfaces.some((i) => i.ipv6 || i.ipv6LinkLocal) || device.config?.ipv6RoutingEnabled === true;
}

export function formatShowIpv6InterfaceBrief(device: TopologyDevice, topology: NetworkTopology): string {
  const lines: string[] = [];
  for (const i of device.interfaces) {
    const state = i.status === "admin-down" || i.isShutdown ? "[administratively down/down]" : isIfaceOperational(device, i, topology) ? "[up/up]" : "[down/down]";
    lines.push(`${longName(i.name).padEnd(23)}${state}`);
    if (!i.ipv6 && !i.ipv6LinkLocal) {
      lines.push("    unassigned");
      continue;
    }
    lines.push(`    ${i.ipv6LinkLocal ? formatIpv6(parseIpv6(i.ipv6LinkLocal) ?? 0n) : LINK_LOCAL_UNKNOWN}`);
    const c = i.ipv6 ? parseIpv6Cidr(i.ipv6) : null;
    if (c) lines.push(`    ${formatIpv6(c.addr)}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Hinweise für den Inspector
// ---------------------------------------------------------------------------

export function ipv6Hints(device: TopologyDevice): string[] {
  const hints: string[] = [];
  const c = device.config;
  const usesIpv6Routing = !!c?.ipv6Routes?.length || !!c?.ospfv3 || !!c?.eigrpv6;
  if (usesIpv6Routing && c?.ipv6RoutingEnabled !== true) {
    hints.push("ipv6 unicast-routing fehlt: Das Gerät routet kein IPv6, Routen und Nachbarschaften werden nicht angezeigt.");
  }
  if (c?.ospfv3 && ospfv3RouterId(device) === null) {
    hints.push("OSPFv3: keine Router-ID bestimmbar. Ohne IPv4-Adresse am Gerät ist eine manuelle router-id nötig, sonst entsteht keine Nachbarschaft.");
  }
  if (c?.eigrpv6) {
    if (eigrpv6RouterId(device) === null) {
      hints.push("EIGRPv6: keine Router-ID bestimmbar. Ohne IPv4-Adresse am Gerät ist eine manuelle eigrp router-id nötig, sonst entsteht keine Nachbarschaft.");
    }
    if (c.eigrpv6.shutdown === true) hints.push("EIGRPv6: Der Prozess ist shutdown (no shutdown fehlt), es entstehen keine Nachbarschaften.");
  }
  return hints;
}

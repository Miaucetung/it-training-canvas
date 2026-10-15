import type { DeviceRedistribute, NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";
import { computeOspfNeighbors, deviceRunsOspf, isInterfaceActive, resolveInterfaceOspf } from "./ospf-neighbors";

const DEFAULT_REFERENCE_MBPS = 100;

const ipNum = (ip: string) => ip.split(".").reduce((a, o) => a * 256 + Number(o), 0);
const numIp = (n: number) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join(".");
const baseIp = (cidr?: string) => (cidr ?? "").split("/")[0];
const nameOf = (d: TopologyDevice) => d.config?.hostname ?? d.name;

const isLoopback = (i: TopologyInterface) => /^lo(opback)?\d+/i.test(i.name);

/** Standard-Bandbreite (kbit/s) je Interface-Art; null: nicht bekannt. */
function defaultBandwidthKbps(i: TopologyInterface): number | null {
  if (/^gi/i.test(i.name)) return 1_000_000;
  if (/^fa/i.test(i.name)) return 100_000;
  if (/^et\d/i.test(i.name)) return 10_000;
  if (/^se/i.test(i.name)) return 1_544;
  if (/^tu/i.test(i.name)) return 100;
  return null;
}

/**
 * OSPF-Kosten eines Interfaces: `ip ospf cost` aus dem Lab, sonst Referenzbandbreite (auto-cost, Standard 100 Mbit/s)
 * geteilt durch die Interface-Bandbreite (`bandwidth` aus dem Lab oder Standardwert der Interface-Art), mindestens 1.
 * Loopbacks haben Kosten 1.
 */
export function ospfInterfaceCost(device: TopologyDevice, iface: TopologyInterface): number {
  if (iface.ospf?.cost !== undefined) return iface.ospf.cost;
  if (isLoopback(iface)) return 1;
  const ref = device.config?.ospf?.referenceBandwidthMbps ?? DEFAULT_REFERENCE_MBPS;
  const bw = iface.bandwidthKbps ?? defaultBandwidthKbps(iface) ?? 100_000;
  return Math.max(1, Math.floor((ref * 1000) / bw));
}

export interface OspfHop {
  nextHop: string;
  iface: TopologyInterface;
}

export interface OspfSpf {
  routers: TopologyDevice[];
  /** Kosten vom ausgewählten Gerät bis zum Router (Summe der Kosten der Ausgangs-Interfaces) */
  dist: Map<string, number>;
  /** Erste Hops auf den günstigsten Pfaden (alle gleich günstigen) */
  hops: Map<string, OspfHop[]>;
}

/** Dijkstra über die OSPF-Nachbarschaften; Kante = Kosten des Ausgangs-Interfaces des jeweiligen Routers. */
export function ospfSpf(device: TopologyDevice, topology: NetworkTopology): OspfSpf {
  const routers = topology.devices.filter((d) => deviceRunsOspf(d));
  const adjOf = new Map(routers.map((r) => [r.id, computeOspfNeighbors(r, topology)]));
  const dist = new Map<string, number>([[device.id, 0]]);
  const hops = new Map<string, OspfHop[]>([[device.id, []]]);
  const queue: string[] = [device.id];
  while (queue.length > 0) {
    queue.sort((a, b) => dist.get(a)! - dist.get(b)!);
    const cur = queue.shift()!;
    const curDev = routers.find((r) => r.id === cur);
    if (!curDev) continue;
    for (const adj of adjOf.get(cur) ?? []) {
      const cost = dist.get(cur)! + ospfInterfaceCost(curDev, adj.localInterface);
      const first: OspfHop[] = cur === device.id ? [{ nextHop: adj.neighborAddress, iface: adj.localInterface }] : hops.get(cur)!;
      const known = dist.get(adj.neighbor.id);
      if (known === undefined || cost < known) {
        dist.set(adj.neighbor.id, cost);
        hops.set(adj.neighbor.id, [...first]);
        queue.push(adj.neighbor.id);
      } else if (cost === known) {
        const merged = hops.get(adj.neighbor.id)!;
        for (const h of first) if (!merged.some((m) => m.nextHop === h.nextHop && m.iface.id === h.iface.id)) merged.push(h);
      }
    }
  }
  return { routers, dist, hops };
}

function cidrNet(cidr: string): { net: number; len: number } | null {
  const m = /^(\d+(?:\.\d+){3})\/(\d+)$/.exec(cidr);
  if (!m) return null;
  const len = Number(m[2]);
  const size = 2 ** (32 - len);
  return { net: Math.floor(ipNum(m[1]) / size) * size, len };
}

/** Präfix, den OSPF für das Interface ankündigt (Loopbacks als Host-Route /32, sonst das Netz). */
export function ospfAdvertisedPrefix(iface: TopologyInterface): string | null {
  if (!iface.ip) return null;
  if (isLoopback(iface)) return `${baseIp(iface.ip)}/32`;
  const c = cidrNet(iface.ip);
  return c ? `${numIp(c.net)}/${c.len}` : null;
}

/** Netze der OSPF-Interfaces eines Routers (auch passive), nur aktive Interfaces. */
export function ownOspfPrefixes(router: TopologyDevice): Array<{ prefix: string; iface: TopologyInterface; area: number }> {
  const out: Array<{ prefix: string; iface: TopologyInterface; area: number }> = [];
  for (const i of router.interfaces) {
    const state = resolveInterfaceOspf(router, i);
    const prefix = ospfAdvertisedPrefix(i);
    if (state && prefix && isInterfaceActive(i)) out.push({ prefix, iface: i, area: state.area });
  }
  return out;
}

export interface OspfRoute {
  network: string;
  /** "O" innerhalb eigener Areas, "O IA" aus einer fremden Area (über einen ABR) */
  code: "O" | "O IA";
  cost: number;
  vias: OspfHop[];
}

/** OSPF-Routen eines Geräts: kürzeste Pfade über alle Router, Kosten = Summe der Ausgangs-Interface-Kosten bis zum Ursprung plus dessen Interface-Kosten. */
export function computeOspfRoutes(device: TopologyDevice, topology: NetworkTopology): OspfRoute[] {
  if (!deviceRunsOspf(device)) return [];
  const spf = ospfSpf(device, topology);
  const myAreas = new Set(ownOspfPrefixes(device).map((p) => p.area));
  const connected = new Set(device.interfaces.map((i) => ospfAdvertisedPrefix(i)).filter((p): p is string => !!p));
  for (const i of device.interfaces) {
    const c = i.ip ? cidrNet(i.ip) : null;
    if (c) connected.add(`${numIp(c.net)}/${c.len}`);
  }
  const best = new Map<string, OspfRoute & { area: number }>();
  for (const r of spf.routers) {
    if (r.id === device.id || !spf.dist.has(r.id)) continue;
    for (const p of ownOspfPrefixes(r)) {
      if (connected.has(p.prefix)) continue;
      const cost = spf.dist.get(r.id)! + ospfInterfaceCost(r, p.iface);
      const cur = best.get(p.prefix);
      const hops = spf.hops.get(r.id) ?? [];
      if (!cur || cost < cur.cost) {
        best.set(p.prefix, { network: p.prefix, code: "O", cost, vias: [...hops], area: p.area });
      } else if (cost === cur.cost) {
        for (const h of hops) if (!cur.vias.some((v) => v.nextHop === h.nextHop && v.iface.id === h.iface.id)) cur.vias.push(h);
      }
    }
  }
  return [...best.values()].map(({ area, ...rest }) => ({ ...rest, code: myAreas.has(area) ? ("O" as const) : ("O IA" as const) }));
}

/** Seed-Metrik der Redistribution nach OSPF: `metric` aus dem Lab, sonst IOS-Standard (20, Quelle BGP: 1). */
export function ospfSeedMetric(red: DeviceRedistribute): { metric: number; isDefault: boolean } {
  if (red.metric !== undefined) return { metric: red.metric, isDefault: false };
  return { metric: red.source === "bgp" ? 1 : 20, isDefault: true };
}

/** Hinweise für den Inspector: Redistribution nach OSPF ohne metric. */
export function ospfRedistributionHints(device: TopologyDevice): string[] {
  const reds = device.config?.ospf?.redistribute ?? [];
  return reds
    .filter((r) => r.metric === undefined)
    .map((r) => `${nameOf(device)}: redistribute ${r.source}${r.id !== undefined ? ` ${r.id}` : ""} ohne metric: Standardwert ${ospfSeedMetric(r).metric}, Typ ${r.metricType ?? 2} (IOS-Standard, im Lab nicht angegeben).`);
}

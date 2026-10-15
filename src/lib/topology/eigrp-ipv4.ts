import type { DeviceRedistribute, NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";
import {
  collectSegmentPeers,
  deviceRunsOspf,
  isInterfaceActive,
  isLinkUsable,
  localEndpoints,
  sameSubnet,
} from "./ospf-neighbors";
import { eigrpMetric, eigrpVector, isIfaceOperational } from "./ipv6-routing";
import { installedStaticRoutes } from "./static-routes";
import { computeOspfRoutes, ospfSeedMetric, ospfSpf, ownOspfPrefixes } from "./ospf-routes";

const DEFAULT_K = [1, 0, 1, 0, 0];

const ipNum = (ip: string) => ip.split(".").reduce((a, o) => a * 256 + Number(o), 0);
const numIp = (n: number) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join(".");
const baseIp = (cidr?: string) => (cidr ?? "").split("/")[0];

function cidrOf(cidr: string): { net: number; len: number } | null {
  const m = /^(\d+(?:\.\d+){3})\/(\d+)$/.exec(cidr);
  if (!m) return null;
  const len = Number(m[2]);
  const size = 2 ** (32 - len);
  return { net: Math.floor(ipNum(m[1]) / size) * size, len };
}

const keyOf = (net: number, len: number) => `${net}/${len}`;
const textOf = (net: number, len: number) => `${numIp(net)}/${len}`;

function isL3(d: TopologyDevice): boolean {
  return d.type === "router" || (d.type === "switch-l3" && d.config?.ipRoutingEnabled !== false);
}

const nameOf = (d: TopologyDevice) => d.config?.hostname ?? d.name;

// ---------------------------------------------------------------------------
// Schnittstellen und Nachbarn
// ---------------------------------------------------------------------------

export function eigrpV4Runs(d: TopologyDevice): boolean {
  return isL3(d) && !!d.config?.eigrp;
}

function classfulNetwork(ip: string): { net: number; len: number } {
  const first = Number(ip.split(".")[0]);
  const len = first < 128 ? 8 : first < 192 ? 16 : 24;
  const size = 2 ** (32 - len);
  return { net: Math.floor(ipNum(ip) / size) * size, len };
}

/** Das Interface fällt unter ein `network`-Statement des EIGRP-Prozesses (ohne Wildcard: klassischer Netzbereich). */
export function eigrpInterfaceEnabled(d: TopologyDevice, i: TopologyInterface): boolean {
  const e = d.config?.eigrp;
  const ip = baseIp(i.ip);
  if (!e || !ip) return false;
  return e.networks.some((n) => {
    if (n.wildcard) {
      const w = ipNum(n.wildcard);
      return ((ipNum(ip) & ~w) >>> 0) === ((ipNum(n.net) & ~w) >>> 0);
    }
    const c = classfulNetwork(n.net);
    return classfulNetwork(ip).net === c.net && classfulNetwork(ip).len === c.len;
  });
}

export function eigrpInterfacePassive(d: TopologyDevice, i: TopologyInterface): boolean {
  const e = d.config?.eigrp;
  if (!e) return false;
  return e.passive.includes(i.name) || (e.passiveDefault && !e.noPassive.includes(i.name));
}

const kValuesOf = (d: TopologyDevice) => d.config?.eigrp?.kValues ?? DEFAULT_K;
const kDefault = (d: TopologyDevice) => kValuesOf(d).every((k, idx) => k === DEFAULT_K[idx]);

/** Bandbreite (kbit/s) und Verzögerung (µs) eines Interfaces; Werte aus `bandwidth`/`delay` im Lab haben Vorrang. */
function vectorOf(i: TopologyInterface): { bw: number; delay: number } | null {
  const base = eigrpVector(i);
  if (!base) return null;
  return { bw: i.bandwidthKbps ?? base.bw, delay: i.delayTens !== undefined ? i.delayTens * 10 : base.delay };
}

export interface EigrpNeighbor {
  link: NetworkTopology["links"][number];
  asn: number;
  localInterface: TopologyInterface;
  neighbor: TopologyDevice;
  neighborInterface: TopologyInterface;
}

export function computeEigrpNeighbors(device: TopologyDevice, topology: NetworkTopology): EigrpNeighbor[] {
  const result: EigrpNeighbor[] = [];
  if (!eigrpV4Runs(device)) return result;
  const asn = device.config!.eigrp!.asn;
  for (const { link, first, local, vlan } of localEndpoints(topology, device)) {
    if (!isLinkUsable(link) || !isInterfaceActive(local) || !local.ip) continue;
    if (!eigrpInterfaceEnabled(device, local) || eigrpInterfacePassive(device, local)) continue;
    const peers = collectSegmentPeers(topology, device, local, first, link, vlan);
    if (!peers) continue;
    for (const peer of peers) {
      if (peer.device.id === device.id || !eigrpV4Runs(peer.device)) continue;
      if (peer.device.config!.eigrp!.asn !== asn || !isInterfaceActive(peer.iface) || !peer.iface.ip) continue;
      if (!eigrpInterfaceEnabled(peer.device, peer.iface) || eigrpInterfacePassive(peer.device, peer.iface)) continue;
      if (!sameSubnet(local.ip, peer.iface.ip)) continue;
      if (kValuesOf(device).join() !== kValuesOf(peer.device).join()) continue;
      result.push({ link, asn, localInterface: local, neighbor: peer.device, neighborInterface: peer.iface });
    }
  }
  return result;
}

export function formatEigrpNeighborTable(device: TopologyDevice, neighbors: EigrpNeighbor[]): string {
  const e = device.config?.eigrp;
  if (!e) return "";
  const head = `EIGRP-IPv4 Neighbors for AS(${e.asn})`;
  const header = "H   Address                 Interface   Hold Uptime  SRTT  RTO  Q   Seq";
  const rows = neighbors.map((n, idx) => `${String(idx).padEnd(4)}${baseIp(n.neighborInterface.ip).padEnd(24)}${n.localInterface.name.padEnd(12)}${"-".padEnd(5)}${"-".padEnd(8)}${"-".padEnd(6)}${"-".padEnd(5)}${"-".padEnd(4)}-`);
  const note = neighbors.length > 0 ? "\n(Hold, Uptime, SRTT, RTO, Q, Seq sind Laufzeitwerte: nicht bestimmbar)" : "";
  return [head, header, ...rows].join("\n") + note;
}

// ---------------------------------------------------------------------------
// Redistribution: Quellen
// ---------------------------------------------------------------------------

interface SourceNet {
  net: number;
  len: number;
  /** Interface, aus dem die Route stammt (connected/static): liefert die Seed-Metrik ohne `metric` */
  iface?: TopologyInterface;
}

interface SourceResult {
  nets: SourceNet[];
  note?: string;
}

function dedupe(nets: SourceNet[]): SourceNet[] {
  const seen = new Set<string>();
  return nets.filter((n) => (seen.has(keyOf(n.net, n.len)) ? false : (seen.add(keyOf(n.net, n.len)), true)));
}

/** Netze, die ein Router für `redistribute` aus der Quelle liefert (nur interne Routen, keine bereits weiterverteilten). */
export function redistributionSources(r: TopologyDevice, red: DeviceRedistribute, topology: NetworkTopology): SourceResult {
  const nets: SourceNet[] = [];
  const push = (cidr?: string, iface?: TopologyInterface) => {
    const c = cidr ? cidrOf(cidr) : null;
    if (c) nets.push({ ...c, iface });
  };
  switch (red.source) {
    case "connected":
      for (const i of r.interfaces) if (i.ip && isInterfaceActive(i)) push(i.ip, i);
      break;
    case "static":
      for (const s of installedStaticRoutes(r)) {
        if (s.route.network === "0.0.0.0/0") continue;
        push(s.route.network, r.interfaces.find((i) => i.name === s.outInterface));
      }
      break;
    case "ospf": {
      if (!r.config?.ospf || (red.id !== undefined && r.config.ospf.processId !== red.id)) return { nets, note: `Der Prozess ospf ${red.id ?? ""} existiert auf diesem Gerät im Lab nicht.` };
      for (const p of ownOspfPrefixes(r)) push(p.prefix);
      for (const route of computeOspfRoutes(r, topology)) push(route.network);
      break;
    }
    case "eigrp": {
      const asn = red.id ?? r.config?.eigrp?.asn;
      if (asn === undefined || r.config?.eigrp?.asn !== asn) return { nets, note: `Der Prozess eigrp ${red.id ?? ""} existiert auf diesem Gerät im Lab nicht.` };
      const tables = eigrpTables(topology, asn, false);
      const mine = tables.table.get(r.id);
      for (const b of mine?.values() ?? []) nets.push({ net: b.net, len: b.len });
      break;
    }
    default:
      return { nets, note: `Redistribution aus ${red.source} wird nicht ausgewertet (nicht bestimmbar).` };
  }
  return { nets: dedupe(nets) };
}

// ---------------------------------------------------------------------------
// EIGRP-Tabellen
// ---------------------------------------------------------------------------

interface Hop {
  local: TopologyInterface;
  peer: TopologyInterface;
  viaId: string;
}

interface Best {
  net: number;
  len: number;
  bw: number;
  delay: number;
  metric: number;
  external: boolean;
  hops: Hop[];
}

interface Tables {
  routers: TopologyDevice[];
  table: Map<string, Map<string, Best>>;
  originated: Map<string, Set<string>>;
  notes: Map<string, string[]>;
}

function eigrpTables(topology: NetworkTopology, asn: number, withExternal: boolean): Tables {
  const routers = topology.devices.filter((d) => eigrpV4Runs(d) && d.config!.eigrp!.asn === asn);
  const neigh = new Map(routers.map((r) => [r.id, computeEigrpNeighbors(r, topology)]));
  const table = new Map<string, Map<string, Best>>();
  const originated = new Map<string, Set<string>>();
  const notes = new Map<string, string[]>();

  for (const r of routers) {
    const own = new Map<string, Best>();
    for (const i of r.interfaces) {
      const c = i.ip ? cidrOf(i.ip) : null;
      const v = vectorOf(i);
      if (!c || !v || !eigrpInterfaceEnabled(r, i) || !isIfaceOperational(r, i, topology)) continue;
      own.set(keyOf(c.net, c.len), { net: c.net, len: c.len, bw: v.bw, delay: v.delay, metric: eigrpMetric(v.bw, v.delay), external: false, hops: [] });
    }
    if (withExternal) {
      for (const red of r.config!.eigrp!.redistribute) {
        const src = redistributionSources(r, red, topology);
        if (src.note) (notes.get(r.id) ?? notes.set(r.id, []).get(r.id)!).push(src.note);
        const fromInterface = !red.vector && (red.source === "connected" || red.source === "static");
        if (!red.vector && !fromInterface) {
          (notes.get(r.id) ?? notes.set(r.id, []).get(r.id)!).push(`redistribute ${red.source}${red.id !== undefined ? ` ${red.id}` : ""}: Seed-Metrik (metric …) fehlt im Lab, ohne sie gibt EIGRP Routen aus dynamischen Quellen nicht weiter.`);
          continue;
        }
        for (const n of src.nets) {
          const k = keyOf(n.net, n.len);
          if (own.has(k)) continue;
          // connected/static ohne metric: Seed-Metrik aus Bandbreite und Verzögerung des Interfaces
          const v = red.vector ? { bw: red.vector[0], delay: red.vector[1] * 10 } : n.iface ? vectorOf(n.iface) : null;
          if (!v) {
            (notes.get(r.id) ?? notes.set(r.id, []).get(r.id)!).push(`redistribute ${red.source}: für ${textOf(n.net, n.len)} ist ohne metric kein Interface-Vektor bestimmbar (z. B. Null0).`);
            continue;
          }
          own.set(k, { net: n.net, len: n.len, bw: v.bw, delay: v.delay, metric: eigrpMetric(v.bw, v.delay), external: true, hops: [] });
        }
      }
    }
    table.set(r.id, own);
    originated.set(r.id, new Set(own.keys()));
  }

  for (let round = 0; round <= routers.length + 1; round++) {
    let changed = false;
    for (const r of routers) {
      const mine = table.get(r.id)!;
      for (const n of neigh.get(r.id) ?? []) {
        const theirs = table.get(n.neighbor.id);
        const rv = vectorOf(n.localInterface);
        if (!theirs || !rv) continue;
        for (const [key, tb] of theirs) {
          if (originated.get(r.id)!.has(key)) continue;
          if (tb.hops.length > 0 && tb.hops.every((h) => h.viaId === r.id)) continue; // Split Horizon / Schleifenvermeidung
          const bw = Math.min(tb.bw, rv.bw);
          const delay = tb.delay + rv.delay;
          const metric = eigrpMetric(bw, delay);
          const hop: Hop = { local: n.localInterface, peer: n.neighborInterface, viaId: n.neighbor.id };
          const cur = mine.get(key);
          const better = !cur || (cur.external && !tb.external) || (cur.external === tb.external && metric < cur.metric);
          if (better) {
            mine.set(key, { net: tb.net, len: tb.len, bw, delay, metric, external: tb.external, hops: [hop] });
            changed = true;
          } else if (cur && cur.external === tb.external && metric === cur.metric && !cur.hops.some((h) => h.local.id === hop.local.id && h.peer.id === hop.peer.id)) {
            cur.hops.push(hop);
            changed = true;
          }
        }
      }
    }
    if (!changed) break;
  }
  return { routers, table, originated, notes };
}

export interface EigrpRoute {
  network: string;
  external: boolean;
  /** null: K-Werte weichen vom Standard ab, die Metrik ist nicht bestimmbar */
  metric: number | null;
  vias: Array<{ nextHop: string; iface: TopologyInterface }>;
}

export function computeEigrpRoutes(device: TopologyDevice, topology: NetworkTopology): EigrpRoute[] {
  if (!eigrpV4Runs(device)) return [];
  const asn = device.config!.eigrp!.asn;
  const t = eigrpTables(topology, asn, true);
  const mine = t.table.get(device.id);
  if (!mine) return [];
  const out: EigrpRoute[] = [];
  for (const [key, b] of mine) {
    if (t.originated.get(device.id)!.has(key)) continue;
    out.push({
      network: textOf(b.net, b.len),
      external: b.external,
      metric: kDefault(device) ? b.metric : null,
      vias: b.hops.map((h) => ({ nextHop: baseIp(h.peer.ip), iface: h.local })),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// OSPF: externe Routen (E1/E2) aus Redistribution
// ---------------------------------------------------------------------------

export interface OspfExternalRoute {
  network: string;
  type: 1 | 2;
  metric: number;
  /** Seed-Metrik ist der IOS-Standardwert (im Lab kein `metric`) */
  defaultMetric: boolean;
  vias: Array<{ nextHop: string; iface: TopologyInterface }>;
  asbr: string;
}

const classfulLen = (net: number): number => {
  const first = Math.floor(net / 2 ** 24);
  return first < 128 ? 8 : first < 192 ? 16 : 24;
};

export function computeOspfExternalRoutes(device: TopologyDevice, topology: NetworkTopology): OspfExternalRoute[] {
  if (!deviceRunsOspf(device)) return [];
  const spf = ospfSpf(device, topology);
  const { dist, hops: first } = spf;

  const own = new Set<string>();
  for (const i of device.interfaces) {
    const c = i.ip ? cidrOf(i.ip) : null;
    if (c) own.add(keyOf(c.net, c.len));
  }
  const out = new Map<string, OspfExternalRoute & { rank: number }>();
  for (const asbr of spf.routers) {
    const reds = asbr.config?.ospf?.redistribute ?? [];
    if (asbr.id === device.id || reds.length === 0 || !dist.has(asbr.id)) continue;
    for (const red of reds) {
      if (red.source === "ospf") continue;
      const src = redistributionSources(asbr, red, topology);
      for (const n of src.nets) {
        // ohne `subnets` werden nur klassische Netze (Klasse A/B/C) weitergegeben
        if (!red.subnets && n.len !== classfulLen(n.net)) continue;
        const key = keyOf(n.net, n.len);
        if (own.has(key)) continue;
        const type = red.metricType ?? 2;
        const seed = ospfSeedMetric(red);
        const path = dist.get(asbr.id)!;
        const metric = type === 1 ? seed.metric + path : seed.metric;
        const rank = (type === 1 ? 0 : 1) * 1e9 + metric * 1e3 + path;
        const cur = out.get(key);
        if (!cur || rank < cur.rank) {
          out.set(key, { network: textOf(n.net, n.len), type, metric, defaultMetric: seed.isDefault, vias: first.get(asbr.id)!, asbr: nameOf(asbr), rank });
        }
      }
    }
  }
  return [...out.values()].map(({ rank: _rank, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// Hinweise
// ---------------------------------------------------------------------------

export function eigrpHints(device: TopologyDevice, topology: NetworkTopology): string[] {
  const e = device.config?.eigrp;
  if (!e || !eigrpV4Runs(device)) return [];
  const hints: string[] = [];
  const neighbors = computeEigrpNeighbors(device, topology);
  for (const { link, first, local, vlan } of localEndpoints(topology, device)) {
    if (!isLinkUsable(link) || !local.ip || !isInterfaceActive(local)) continue;
    const peers = collectSegmentPeers(topology, device, local, first, link, vlan);
    if (!peers) continue;
    for (const peer of peers) {
      if (peer.device.id === device.id || !eigrpV4Runs(peer.device) || !peer.iface.ip) continue;
      if (neighbors.some((n) => n.neighborInterface.id === peer.iface.id)) continue;
      const who = `${local.name} ↔ ${nameOf(peer.device)} ${peer.iface.name}`;
      const pe = peer.device.config!.eigrp!;
      if (pe.asn !== e.asn) hints.push(`${who}: andere AS-Nummer (${pe.asn} statt ${e.asn}), keine Nachbarschaft.`);
      else if (!eigrpInterfaceEnabled(device, local)) hints.push(`${local.name}: kein passendes network-Statement, EIGRP ist auf diesem Interface nicht aktiv.`);
      else if (!eigrpInterfaceEnabled(peer.device, peer.iface)) hints.push(`${who}: auf der Gegenseite fehlt ein passendes network-Statement.`);
      else if (eigrpInterfacePassive(device, local)) hints.push(`${local.name} ist passive: es entsteht keine Nachbarschaft (für LAN-Interfaces gewollt, auf Router-Links ein Fehler).`);
      else if (eigrpInterfacePassive(peer.device, peer.iface)) hints.push(`${who}: die Gegenseite ist passive, keine Nachbarschaft.`);
      else if (!sameSubnet(local.ip, peer.iface.ip)) hints.push(`${who}: unterschiedliche Subnetze, keine Nachbarschaft.`);
      else if (kValuesOf(device).join() !== kValuesOf(peer.device).join()) hints.push(`${who}: unterschiedliche K-Werte, keine Nachbarschaft.`);
    }
  }
  if (!kDefault(device)) hints.push("Die K-Werte weichen vom Standard ab: die Metrik der EIGRP-Routen ist nicht bestimmbar.");
  for (const red of e.redistribute) {
    if (!red.vector && red.source !== "connected" && red.source !== "static") {
      hints.push(`redistribute ${red.source}: ohne metric gibt EIGRP Routen aus dynamischen Quellen nicht weiter.`);
    } else if (!red.vector) {
      hints.push(`redistribute ${red.source} ohne metric: die Seed-Metrik stammt aus Bandbreite und Verzögerung des Interfaces.`);
    }
  }
  hints.push("EIGRP-Metrik mit Standard-K-Werten aus den Standardwerten der Interface-Art (Bandbreite, Verzögerung); Uptime, Hold und Zähler sind Laufzeitwerte.");
  return [...new Set(hints)];
}

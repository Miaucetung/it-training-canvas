import type { NetworkTopology, TopologyDevice } from "@/types/topology";
import { computeEigrpRoutes, computeOspfExternalRoutes } from "./eigrp-ipv4";
import { computeOspfRoutes } from "./ospf-routes";
import { installedStaticRoutes, ipInCidr } from "./static-routes";

/**
 * Wandelt CIDR-Präfixlänge in eine Subnetzmaske um (z. B. 24 -> "255.255.255.0")
 */
export function cidrToSubnetMask(cidr: number): string {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(Math.max(cidr - i * 8, 0), 8);
    mask.push(256 - Math.pow(2, 8 - bits));
  }
  return mask.join(".");
}

/**
 * Berechnet die Netzadresse aus einer IP/CIDR (z. B. "192.168.10.1/24" -> "192.168.10.0/24")
 */
export function getNetworkAddress(
  ipCidr: string,
): { network: string; ip: string; cidr: number; mask: string } | null {
  const parts = ipCidr.split("/");
  if (parts.length !== 2) return null;
  const ip = parts[0].trim();
  const cidr = parseInt(parts[1].trim(), 10);
  if (isNaN(cidr) || cidr < 0 || cidr > 32) return null;

  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255))
    return null;

  const ipNum =
    (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;

  const netOctets = [
    (netNum >>> 24) & 255,
    (netNum >>> 16) & 255,
    (netNum >>> 8) & 255,
    netNum & 255,
  ];

  return {
    network: `${netOctets.join(".")}/${cidr}`,
    ip,
    cidr,
    mask: cidrToSubnetMask(cidr),
  };
}

export type RouteProtocol =
  | "C"
  | "L"
  | "S"
  | "D"
  | "D EX"
  | "O"
  | "O IA"
  | "O E1"
  | "O E2";

export interface RouteVia {
  nextHop?: string;
  ifaceName: string;
}

export interface StructuredRouteEntry {
  prefix: string;
  protocol: RouteProtocol;
  ad: number;
  metric: number | null;
  vias: RouteVia[];
  isDefault: boolean;
  formattedLine: string;
}

export interface StructuredRoutingTable {
  deviceId: string;
  gatewayOfLastResort: string | null;
  routes: StructuredRouteEntry[];
  hasRuntimeFree: boolean;
  hasDefaultSeed: boolean;
  codesHeader: string;
}

export interface RouteLookupResult {
  entry: StructuredRouteEntry;
  selectedVia: RouteVia;
  allVias: RouteVia[];
  isEcmp: boolean;
  notice?: string;
}

const DEFAULT_CODES_HEADER = [
  "Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP",
  "       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area",
  "       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2",
  "       E1 - OSPF external type 1, E2 - OSPF external type 2",
  "       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2",
  "       ia - IS-IS inter area, * - candidate default, U - per-user static route",
  "       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP",
  "       a - application route",
  "       + - replicated route, % - next hop override, p - overrides from PfR",
  "",
  "Gateway of last resort is not set",
  "",
].join("\n");

/**
 * Berechnet die strukturierte Cisco IOS Routing-Tabelle für ein Gerät
 * aus allen aktiven Routing-Quellen (Connected, Local, Static, OSPF, EIGRP).
 *
 * Diese Funktion ist die Single Source of Truth für:
 * 1. CLI Show-Befehl: CiscoCliGenerator.generateShowIpRoute
 * 2. Paketweiterleitung: lookupRouteLpm
 */
export function computeStructuredRoutingTable(
  device: TopologyDevice,
  topology: NetworkTopology,
): StructuredRoutingTable {
  const candidates: StructuredRouteEntry[] = [];

  // 1. Lokale und Direkt verbundene Routen (C und L)
  for (const iface of device.interfaces) {
    if (!iface.ip) continue;
    const netInfo = getNetworkAddress(iface.ip);
    if (!netInfo) continue;

    // Connected Route (C)
    candidates.push({
      prefix: netInfo.network,
      protocol: "C",
      ad: 0,
      metric: 0,
      vias: [{ ifaceName: iface.name }],
      isDefault: false,
      formattedLine: `C    ${netInfo.network} is directly connected, ${iface.name}`,
    });

    // Local Route (/32 für die Host-IP)
    if (netInfo.cidr < 32) {
      candidates.push({
        prefix: `${netInfo.ip}/32`,
        protocol: "L",
        ad: 0,
        metric: 0,
        vias: [{ ifaceName: iface.name }],
        isDefault: false,
        formattedLine: `L    ${netInfo.ip}/32 is directly connected, ${iface.name}`,
      });
    }
  }

  // 2. OSPF-Routen (O, O IA): kürzeste Pfade über echte Nachbarschaften (Dijkstra)
  const ospfRoutes = computeOspfRoutes(device, topology);

  // 3. Statische Routen (nur installierbare)
  let gateway: string | null = null;
  for (const s of installedStaticRoutes(device)) {
    const isDefault = s.route.network === "0.0.0.0/0";
    if (isDefault && s.route.nextHop && !gateway) gateway = s.route.nextHop;
    const tag = isDefault ? "S*" : "S ";
    const target = s.route.nextHop
      ? `via ${s.route.nextHop}`
      : `is directly connected, ${s.outInterface}`;
    candidates.push({
      prefix: s.route.network,
      protocol: "S",
      ad: s.distance,
      metric: 0,
      vias: [
        {
          nextHop: s.route.nextHop,
          ifaceName: s.outInterface,
        },
      ],
      isDefault,
      formattedLine: `${tag}   ${s.route.network} [${s.distance}/0] ${target}`,
    });
  }

  // Hilfsfunktion zur Formatierung von Multi-Hop / ECMP-Vias
  const formatVias = (
    code: string,
    prefix: string,
    ad: number,
    metric: number | null,
    vias: Array<{ nextHop: string; iface: { name: string } }>,
  ): string[] => {
    const metricText = metric === null ? "nicht bestimmbar" : String(metric);
    return vias.map((v, idx) =>
      idx === 0
        ? `${code.padEnd(5)}${prefix} [${ad}/${metricText}] via ${v.nextHop}, ${v.iface.name}`
        : `${" ".repeat(5 + prefix.length + 1)}[${ad}/${metricText}] via ${v.nextHop}, ${v.iface.name}`,
    );
  };

  // 4. EIGRP-Routen (D, D EX)
  for (const r of computeEigrpRoutes(device, topology)) {
    const ad = r.external ? 170 : 90;
    const protocol: RouteProtocol = r.external ? "D EX" : "D";
    candidates.push({
      prefix: r.network,
      protocol,
      ad,
      metric: r.metric,
      vias: r.vias.map((v) => ({ nextHop: v.nextHop, ifaceName: v.iface.name })),
      isDefault: false,
      formattedLine: formatVias(protocol, r.network, ad, r.metric, r.vias).join("\n"),
    });
  }

  // 5. OSPF interne/Inter-Area-Routen (O, O IA)
  for (const r of ospfRoutes) {
    const protocol: RouteProtocol = r.code === "O IA" ? "O IA" : "O";
    candidates.push({
      prefix: r.network,
      protocol,
      ad: 110,
      metric: r.cost,
      vias: r.vias.map((v) => ({ nextHop: v.nextHop, ifaceName: v.iface.name })),
      isDefault: false,
      formattedLine: formatVias(r.code, r.network, 110, r.cost, r.vias).join("\n"),
    });
  }

  // 6. OSPF externe Routen (O E1, O E2) aus Redistribution
  const externals = computeOspfExternalRoutes(device, topology);
  for (const r of externals) {
    const protocol: RouteProtocol = r.type === 1 ? "O E1" : "O E2";
    candidates.push({
      prefix: r.network,
      protocol,
      ad: 110,
      metric: r.metric,
      vias: r.vias.map((v) => ({ nextHop: v.nextHop, ifaceName: v.iface.name })),
      isDefault: false,
      formattedLine: formatVias(protocol, r.network, 110, r.metric, r.vias).join("\n"),
    });
  }

  // Arbitrierung: Je Präfix gewinnt die Route mit der niedrigsten Administrative Distance
  const bestAd = new Map<string, number>();
  for (const r of candidates) {
    bestAd.set(r.prefix, Math.min(bestAd.get(r.prefix) ?? Infinity, r.ad));
  }
  const installed = candidates.filter((r) => r.ad === bestAd.get(r.prefix));

  let codesHeader = DEFAULT_CODES_HEADER;
  if (gateway) {
    codesHeader = codesHeader.replace(
      "Gateway of last resort is not set",
      `Gateway of last resort is ${gateway} to network 0.0.0.0`,
    );
  }

  const hasRuntimeFree = candidates.some((r) =>
    /^(D|O)/.test(r.formattedLine),
  );
  const hasDefaultSeed = externals.some((r) => r.defaultMetric);

  return {
    deviceId: device.id,
    gatewayOfLastResort: gateway,
    routes: installed,
    hasRuntimeFree,
    hasDefaultSeed,
    codesHeader,
  };
}

/**
 * Erzeugt die textuelle Darstellung von 'show ip route'
 * identisch zum bisherigen CiscoCliGenerator.
 */
export function formatShowIpRoute(table: StructuredRoutingTable): string {
  if (table.routes.length === 0) {
    return table.codesHeader + "(Keine aktiven IPv4-Routen konfiguriert)";
  }

  // Sortierung nach Netzwerk-Präfix
  const lines = table.routes.map((r) => r.formattedLine);
  lines.sort((a, b) => a.localeCompare(b));

  const hasRuntimeFreeNotice = table.hasRuntimeFree
    ? "\n(Uptime ist ein Laufzeitwert und nicht bestimmbar: bei D- und O-Routen nicht ausgegeben)"
    : "";
  const hasDefaultSeedNotice = table.hasDefaultSeed
    ? "\n(O E1/E2 ohne metric im Lab: Seed-Metrik 20 bzw. 1 bei Quelle BGP ist der IOS-Standardwert)"
    : "";

  return (
    table.codesHeader +
    lines.join("\n") +
    hasRuntimeFreeNotice +
    hasDefaultSeedNotice
  );
}

/**
 * Extrahiert die Präfixlänge aus einer CIDR-Notation (z. B. "192.168.1.0/24" -> 24).
 */
function getPrefixLength(prefix: string): number {
  const parts = prefix.split("/");
  if (parts.length === 2) {
    const len = Number(parts[1]);
    if (!isNaN(len)) return len;
  }
  return 0;
}

/**
 * Longest Prefix Match (LPM) Lookup:
 * 1. Findet alle Routen, die targetIp abdecken.
 * 2. Wählt die Route mit der längsten Präfixmaske (/32 vor /24 vor /0).
 * 3. Bei ECMP (mehrere vias): deterministische Auswahl des ersten Pfades mit Hinweis.
 */
export function lookupRouteLpm(
  table: StructuredRoutingTable,
  targetIp: string,
): RouteLookupResult | null {
  const cleanIp = targetIp.split("/")[0].trim();
  const matching = table.routes.filter((r) => ipInCidr(cleanIp, r.prefix));

  if (matching.length === 0) return null;

  // Längstes Präfix gewinnt
  matching.sort((a, b) => {
    const lenA = getPrefixLength(a.prefix);
    const lenB = getPrefixLength(b.prefix);
    if (lenB !== lenA) return lenB - lenA; // Absteigend nach Präfixlänge
    return a.ad - b.ad; // Niedrigere AD bei gleicher Länge
  });

  const best = matching[0];
  const allVias = best.vias;
  const selectedVia = allVias[0] ?? { ifaceName: "" };
  const isEcmp = allVias.length > 1;

  const notice = isEcmp
    ? `ECMP: ${allVias.length} gleichwertige Pfade vorhanden, Pfad über ${
        selectedVia.nextHop ? `${selectedVia.nextHop} (${selectedVia.ifaceName})` : selectedVia.ifaceName
      } gewählt`
    : undefined;

  return {
    entry: best,
    selectedVia,
    allVias,
    isEcmp,
    notice,
  };
}

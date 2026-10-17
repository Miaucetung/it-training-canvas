import type { DeviceNatConfig, TopologyDevice } from "@/types/topology";
import { normalizeInterfaceName } from "../hardware-profiles";
import { evaluateAcl } from "./acl-evaluator";
import type { SimulatedPacket } from "./types";

/**
 * Dynamisches NAT, NAT-Pool und PAT als Teil des Simulationszustands.
 *
 * Die Translation-Tabelle lebt (wie der ARP-Cache) über mehrere Pings hinweg, bis die Simulation zurückgesetzt wird;
 * Timeouts werden nicht modelliert. Statische Einträge stehen in der Konfiguration und werden vorher geprüft.
 *
 * Modellannahmen:
 * - Dynamisch ohne overload: je Inside-Local eine Pool-Adresse, die niedrigste freie; der Eintrag erlaubt auch
 *   von außen initiierte Verbindungen an die Inside-Global-Adresse, solange er besteht (IOS: einfacher Eintrag).
 * - PAT: Die ICMP-ID dient als Port. Die Inside-Global-ID bleibt gleich, wenn sie frei ist, sonst die niedrigste
 *   freie im selben IOS-Portbereich (1–511, 512–1023, 1024–65535). Pool mit overload nutzt die erste Pool-Adresse,
 *   erst bei erschöpftem Bereich die nächste.
 */

export interface NatTranslation {
  kind: "dynamic" | "pat";
  protocol: "icmp";
  insideLocal: string;
  insideGlobal: string;
  outsideLocal: string;
  outsideGlobal: string;
  localPort: number;
  globalPort: number;
  /** Regel wie in der Konfiguration, z. B. "list 1 pool PUBLIC-POOL overload" */
  rule: string;
}

/** Translation-Tabelle je NAT-Gerät (deviceId → Einträge) */
export type NatTable = Record<string, NatTranslation[]>;

export type InsideToOutsideResult =
  | { status: "translated"; entry: NatTranslation; created: boolean }
  | { status: "exhausted"; pool: string }
  | { status: "none" };

const ipToInt = (ip: string): number => ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
const intToIp = (n: number): string => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

function poolAddresses(nat: DeviceNatConfig, name: string): string[] {
  const pool = nat.pools.find((p) => p.name === name);
  if (!pool) return [];
  const out: string[] = [];
  for (let n = ipToInt(pool.start); n <= ipToInt(pool.end); n++) out.push(intToIp(n));
  return out;
}

/** Gehört die Adresse zu einem NAT-Pool des Geräts (Outside-Seite beantwortet ARP dafür)? */
export function isNatPoolAddress(device: TopologyDevice, ip: string): boolean {
  const nat = device.config?.nat;
  return !!nat && nat.pools.some((p) => ipToInt(ip) >= ipToInt(p.start) && ipToInt(ip) <= ipToInt(p.end));
}

function portRange(port: number): [number, number] {
  if (port <= 511) return [1, 511];
  if (port <= 1023) return [512, 1023];
  return [1024, 65535];
}

function ruleLabel(rule: DeviceNatConfig["rules"][number]): string {
  return `list ${rule.acl} ${rule.pool ? `pool ${rule.pool}` : `interface ${rule.interface}`}${rule.overload ? " overload" : ""}`;
}

/**
 * Inside → Outside: bestehenden Eintrag verwenden oder anlegen (nach der passenden `ip nat inside source list`-Regel).
 * Ändert die Tabelle, nicht das Paket.
 */
export function translateInsideToOutside(device: TopologyDevice, packet: SimulatedPacket, table: NatTable): InsideToOutsideResult {
  const nat = device.config?.nat;
  if (!nat) return { status: "none" };
  const entries = (table[device.id] ??= []);
  const localPort = packet.icmpId ?? 1;

  for (const rule of nat.rules) {
    const permitted = evaluateAcl(rule.acl, device.config?.accessLists?.[rule.acl], packet, "in").action === "permit";
    if (!permitted) continue;
    const label = ruleLabel(rule);

    if (rule.overload) {
      const existing = entries.find(
        (e) => e.kind === "pat" && e.insideLocal === packet.srcIp && e.localPort === localPort && e.outsideGlobal === packet.dstIp,
      );
      if (existing) return { status: "translated", entry: existing, created: false };
      const globals = rule.pool
        ? poolAddresses(nat, rule.pool)
        : [device.interfaces.find((i) => rule.interface && normalizeInterfaceName(i.name) === normalizeInterfaceName(rule.interface))?.ip?.split("/")[0]].filter(
            (x): x is string => !!x,
          );
      const [lo, hi] = portRange(localPort);
      for (const g of globals) {
        const taken = new Set(entries.filter((e) => e.insideGlobal === g).map((e) => e.globalPort));
        let port: number | null = taken.has(localPort) ? null : localPort;
        for (let p = lo; port === null && p <= hi; p++) if (!taken.has(p)) port = p;
        if (port === null) continue;
        const entry: NatTranslation = {
          kind: "pat",
          protocol: "icmp",
          insideLocal: packet.srcIp,
          insideGlobal: g,
          outsideLocal: packet.dstIp,
          outsideGlobal: packet.dstIp,
          localPort,
          globalPort: port,
          rule: label,
        };
        entries.push(entry);
        return { status: "translated", entry, created: true };
      }
      return { status: "exhausted", pool: rule.pool ?? rule.interface ?? "" };
    }

    if (!rule.pool) continue;
    const existing = entries.find((e) => e.kind === "dynamic" && e.insideLocal === packet.srcIp);
    if (existing) return { status: "translated", entry: existing, created: false };
    const used = new Set(entries.filter((e) => e.kind === "dynamic").map((e) => e.insideGlobal));
    const free = poolAddresses(nat, rule.pool).find((g) => !used.has(g));
    if (!free) return { status: "exhausted", pool: rule.pool };
    const entry: NatTranslation = {
      kind: "dynamic",
      protocol: "icmp",
      insideLocal: packet.srcIp,
      insideGlobal: free,
      outsideLocal: packet.dstIp,
      outsideGlobal: packet.dstIp,
      localPort,
      globalPort: localPort,
      rule: label,
    };
    entries.push(entry);
    return { status: "translated", entry, created: true };
  }
  return { status: "none" };
}

/** Outside → Inside: passender Eintrag für ein ankommendes Paket (PAT nach Inside-Global, ICMP-ID und Gegenstelle). */
export function lookupOutsideToInside(device: TopologyDevice, packet: SimulatedPacket, table: NatTable): NatTranslation | undefined {
  const entries = table[device.id] ?? [];
  return (
    entries.find(
      (e) => e.kind === "pat" && e.insideGlobal === packet.dstIp && e.globalPort === (packet.icmpId ?? 1) && e.outsideGlobal === packet.srcIp,
    ) ?? entries.find((e) => e.kind === "dynamic" && e.insideGlobal === packet.dstIp)
  );
}

/** Dynamischer Eintrag, über den eine Inside-Global-Adresse von außen erreichbar ist (nur ohne overload). */
export function findDynamicGlobal(table: NatTable, ip: string): { deviceId: string; entry: NatTranslation } | undefined {
  for (const [deviceId, entries] of Object.entries(table)) {
    const entry = entries.find((e) => e.kind === "dynamic" && e.insideGlobal === ip);
    if (entry) return { deviceId, entry };
  }
  return undefined;
}

/** Ausgabe wie `show ip nat translations` (nur dynamische Einträge der Simulation). */
export function formatNatTranslations(entries: NatTranslation[]): string {
  const col = (s: string) => s.padEnd(19);
  const lines = [`Pro  ${col("Inside global")}${col("Inside local")}${col("Outside local")}Outside global`];
  for (const e of entries) {
    lines.push(
      `icmp ${col(`${e.insideGlobal}:${e.globalPort}`)}${col(`${e.insideLocal}:${e.localPort}`)}${col(`${e.outsideLocal}:${e.localPort}`)}${e.outsideGlobal}:${e.globalPort}`,
    );
  }
  for (const e of entries.filter((x) => x.kind === "dynamic")) {
    lines.push(`---  ${col(e.insideGlobal)}${col(e.insideLocal)}${col("---")}---`);
  }
  return lines.join("\n");
}

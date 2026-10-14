import type {
  ChannelGroupMode,
  DeviceConfig,
  DeviceDhcpExcluded,
  DeviceDhcpPool,
  DeviceCryptoConfig,
  DeviceCryptoMapEntry,
  DeviceEigrpConfig,
  DeviceRedistribute,
  DeviceIsakmpPolicy,
  DeviceTransformSet,
  DeviceNatConfig,
  DeviceStaticRoute,
  DeviceVtpConfig,
  InterfaceHsrp,
  InterfaceHsrpGroup,
  InterfaceMode,
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
  VtpMode,
} from "@/types/topology";
import {
  baseInterfaceName,
  interfaceIdFor,
  interfacesForProfile,
  normalizeInterfaceName,
  profileHasInterface,
  resolveHardwareProfile,
} from "@/lib/topology/hardware-profiles";
import type { LabScenario, LabTopologyData, LabTopologyDevice } from "./types";
import { placeZoneBadge } from "./topology-geometry";
import { computeStp } from "@/lib/topology/stp-calc";

// ============================================================================
// Lab-Topologie -> Netzwerk-Topologie (Canvas v2).
// Der Lab-Text ist die Quelle der Wahrheit: Konfiguration wird ausschließlich aus den
// Befehlen des Labs gelesen, Verbindungen und Positionen aus der kuratierten Topologie.
// Nichts wird erfunden; was nicht erkannt wird, landet in `problems`.
// ============================================================================

export type LabState = "target" | "start";

export interface LabNetworkResult {
  topology: NetworkTopology;
  /** Auffälligkeiten (Interface nicht im Profil, Gerät ohne Profil ...) — in Tests muss die Liste leer sein */
  problems: string[];
}

export type LabForNetwork = Pick<LabScenario, "id" | "title" | "steps"> & {
  topology: Pick<LabScenario["topology"], "description" | "connections" | "devices">;
};

const THEME_COLORS: Record<string, string> = {
  indigo: "#6366F1",
  blue: "#3B82F6",
  amber: "#F59E0B",
  emerald: "#10B981",
  violet: "#8B5CF6",
  rose: "#F43F5E",
  slate: "#64748B",
};

const maskToPrefix = (mask: string): number | null => {
  const parts = mask.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  const bits = parts.map((p) => p.toString(2).padStart(8, "0")).join("");
  if (!/^1*0*$/.test(bits)) return null;
  return bits.split("1").length - 1;
};

const ipToInt = (ip: string) => ip.split(".").reduce((a, o) => (a << 8) + Number(o), 0) >>> 0;

// ---------------------------------------------------------------------------
// Parser für die Lab-Befehle eines Geräts
// ---------------------------------------------------------------------------

interface IfaceCfg {
  ip?: string; // CIDR
  ipv6?: string; // addr/len
  ospf6?: { processId: number; area: number; priority?: number; networkType?: "broadcast" | "point-to-point" };
  eigrp6?: number;
  linkLocal?: string;
  mode?: InterfaceMode;
  accessVlan?: number;
  allowedVlans?: number[];
  nativeVlan?: number;
  channelGroup?: { id: number; mode: ChannelGroupMode };
  dot1q?: number;
  shutdown?: boolean;
  ospfPassive?: boolean;
  ospfNetworkType?: "broadcast" | "point-to-point";
  ospfPriority?: number;
  dtp?: "desirable" | "auto";
  nonegotiate?: boolean;
  natSide?: "inside" | "outside";
  hsrpVersion?: 1 | 2;
  hsrpGroups?: Map<number, InterfaceHsrpGroup>;
  bandwidthKbps?: number;
  delayTens?: number;
  tunnelSource?: string;
  tunnelDestination?: string;
  tunnelMode?: string;
  cryptoMap?: string;
}

export interface ParsedDeviceConfig {
  hostname?: string;
  vlans: Map<number, string>;
  ifaces: Map<string, IfaceCfg>;
  ipRouting: boolean;
  stpPriority?: number;
  /** letzter STP-Befehl war `root primary` */
  stpMacro?: "primary";
  ospf?: { processId: number; routerId?: string; networks: Array<{ net: string; wildcard: string; area: number }>; passive: string[]; passiveDefault: boolean; redistribute: DeviceRedistribute[] };
  eigrp?: DeviceEigrpConfig;
  hostIp?: { ip: string; mask: string; gateway?: string };
  hostIpv6?: { ip: string; gateway?: string };
  /** Desktop steht auf DHCP */
  hostDhcp?: boolean;
  ipv6Routing: boolean;
  ospfv3?: { processId: number; routerId?: string; passive: string[]; passiveDefault: boolean; noPassive: string[] };
  eigrp6?: { processId: number; routerId?: string; shutdown: boolean };
  ipv6Routes: Array<{ prefix: string; nextHop?: string; outInterface?: string; distance?: number }>;
  dhcpPools: DeviceDhcpPool[];
  dhcpExcluded: DeviceDhcpExcluded[];
  vtp?: DeviceVtpConfig;
  nat?: DeviceNatConfig;
  ipRoutes: DeviceStaticRoute[];
  accessLists: Record<string, string[]>;
  crypto?: DeviceCryptoConfig;
  /** Alle Befehle für diesen Gerät in Lab-Reihenfolge, ohne Prompt */
  cli: string;
}

/** Blockname -> Gerätenamen: "PC1–PC5" -> PC1..PC5, "R1 / R2" -> R1, R2, sonst der Name selbst. */
/** Nennt das Lab diesen Port des Geräts (Konfiguration `interface ...` oder Verbindungsliste)? */
export function labMentionsPort(lab: LabForNetwork, deviceName: string, port: string): boolean {
  const short = normalizeInterfaceName(port);
  if (parseLabDeviceConfig(lab, deviceName).ifaces.has(short)) return true;
  const esc = deviceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${esc}\\s+([A-Za-z]+\\d+(?:/\\d+)+)(?:\\s*[–-]\\s*[A-Za-z]*(\\d+(?:/\\d+)*))?`, "gi");
  for (const line of lab.topology.connections) {
    for (const m of line.matchAll(re)) {
      const last = m[2]?.split("/").pop();
      const names = last ? expandInterfaceRange(`${m[1]}-${last}`) : [normalizeInterfaceName(m[1])];
      if (names.includes(short)) return true;
    }
  }
  // Ports im Geräte-Label des Geräts ("SW1 (Fa0/1–3, Gig0/1)")
  for (const dl of lab.topology.devices) {
    if (!new RegExp(`^${esc}(?:\\s|\\()`, "i").test(dl.label)) continue;
    for (const m of dl.label.matchAll(/([A-Za-z]+\d+(?:\/\d+)+)(?:\s*[–-]\s*[A-Za-z]*(\d+(?:\/\d+)*))?/g)) {
      const last = m[2]?.split("/").pop();
      const names = last ? expandInterfaceRange(`${m[1]}-${last}`) : [normalizeInterfaceName(m[1])];
      if (names.includes(short)) return true;
    }
  }
  return false;
}

/** Netze (Adresse/Präfix), für die das Lab einen DHCP-Pool (`ip dhcp pool` + `network <Adresse> <Maske>`) konfiguriert. */
export function labDhcpPoolNetworks(lab: Pick<LabScenario, "steps">): Set<string> {
  const nets = new Set<string>();
  for (const step of lab.steps) {
    for (const block of step.blocks as Array<{ commands: Array<{ cmd: string }> }>) {
      let inPool = false;
      for (const c of block.commands) {
        for (const raw of String(c.cmd).split("\n")) {
          const line = raw.trim();
          if (/^ip dhcp pool\s+\S+/i.test(line)) {
            inPool = true;
            continue;
          }
          if (!inPool) continue;
          const m = /^network\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})$/i.exec(line);
          if (m) {
            const p = maskToPrefix(m[2]);
            if (p !== null) nets.add(`${m[1]}/${p}`);
          } else if (!/^(default-router|dns-server|lease|domain-name|option|exit)\b/i.test(line)) inPool = false;
        }
      }
    }
  }
  return nets;
}

export function expandDeviceNames(blockDevice: string): string[] {
  const d = blockDevice.trim();
  if (d.includes("/")) return d.split("/").map((x) => x.trim()).filter(Boolean);
  const r = /^(\D*?)(\d+)\s*[–-]\s*\D*?(\d+)$/.exec(d);
  if (r && Number(r[3]) > Number(r[2])) {
    return Array.from({ length: Number(r[3]) - Number(r[2]) + 1 }, (_, i) => `${r[1]}${Number(r[2]) + i}`);
  }
  return [d];
}

function expandInterfaceRange(spec: string): string[] {
  // "FastEthernet0/1 - 2" | "fa0/1 - 8" | "gi0/1 - 2" | "fa0/1-10"
  const m = /^(\S+?)(\d+)\/(\d+)\s*-\s*(?:\S*?\/)?(\d+)$/.exec(spec.trim()) ?? /^(\D+?)(\d+)\/(\d+)\s*-\s*(\d+)$/.exec(spec.trim());
  if (!m) return [normalizeInterfaceName(spec)];
  const [, type, slot, from, to] = m;
  const out: string[] = [];
  for (let i = Number(from); i <= Number(to); i++) out.push(normalizeInterfaceName(`${type}${slot}/${i}`));
  return out;
}

function parseVlanList(spec: string): number[] {
  return spec.split(",").flatMap((p) => {
    const r = /^(\d+)-(\d+)$/.exec(p.trim());
    if (r) return Array.from({ length: Number(r[2]) - Number(r[1]) + 1 }, (_, i) => Number(r[1]) + i);
    const n = Number(p.trim());
    return Number.isInteger(n) ? [n] : [];
  });
}

/** `redistribute <Quelle> [<id>] [metric ...] [metric-type n] [subnets] [route-map X]` */
function parseRedistribute(rest: string): DeviceRedistribute | null {
  const t = rest.trim().split(/\s+/);
  const src = t.shift()?.toLowerCase();
  if (!src || !["ospf", "eigrp", "static", "connected", "rip", "bgp"].includes(src)) return null;
  const red: DeviceRedistribute = { source: src as DeviceRedistribute["source"], subnets: false };
  if (t[0] && /^\d+$/.test(t[0])) red.id = Number(t.shift());
  while (t.length > 0) {
    const k = t.shift()!.toLowerCase();
    if (k === "subnets") red.subnets = true;
    else if (k === "metric-type" && t[0]) red.metricType = Number(t.shift()) === 1 ? 1 : 2;
    else if (k === "route-map" && t[0]) red.routeMap = t.shift();
    else if (k === "metric") {
      const nums: number[] = [];
      while (t[0] && /^\d+$/.test(t[0])) nums.push(Number(t.shift()));
      if (nums.length === 5) red.vector = nums;
      else if (nums.length === 1) red.metric = nums[0];
    }
  }
  return red;
}

const PROMPT_FREE_SKIP = /^(enable|configure terminal|conf t|end|exit|do copy running-config startup-config|copy running-config startup-config|wr|write memory)$/i;

export function parseLabDeviceConfig(lab: Pick<LabScenario, "steps">, deviceName: string): ParsedDeviceConfig {
  const cfg: ParsedDeviceConfig = { vlans: new Map(), ifaces: new Map(), ipRouting: false, ipv6Routing: false, ipv6Routes: [], dhcpPools: [], dhcpExcluded: [], ipRoutes: [], accessLists: {}, cli: "" };
  const cliLines: string[] = [];
  let ctxIfaces: string[] = [];
  let ctxVlan: number | null = null;
  let ctxOspf = false;
  let ctxV6: "ospf" | "eigrp" | null = null;
  let ctxPool: DeviceDhcpPool | null = null;
  let ctxEigrp = false;
  type CryptoCtx = { kind: "policy"; ref: DeviceIsakmpPolicy } | { kind: "tset"; ref: DeviceTransformSet } | { kind: "map"; ref: DeviceCryptoMapEntry };
  let ctxCrypto: CryptoCtx | null = null;
  const cryptoCfg = (): DeviceCryptoConfig => (cfg.crypto ??= { policies: [], keys: [], transformSets: [], maps: [] });
  const ifaceOf = (n: string): IfaceCfg => {
    const k = normalizeInterfaceName(n);
    const cur = cfg.ifaces.get(k) ?? {};
    cfg.ifaces.set(k, cur);
    return cur;
  };

  for (const step of lab.steps) {
    for (const block of step.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>) {
      const names = expandDeviceNames(block.device);
      const blockIndex = names.indexOf(deviceName);
      if (blockIndex < 0) continue;
      const multi = names.length > 1;
      const blockHosts: Array<{ ip: string; mask: string; gateway?: string }> = [];
      for (const c of block.commands) {
        for (const raw of String(c.cmd).split("\n")) {
          const line = raw.trim();
          if (!line) continue;
          cliLines.push(raw.replace(/\s+$/, ""));
          if (ctxPool && !/^(network|default-router|dns-server|lease|domain-name|option)\b/i.test(line)) ctxPool = null;
          if (ctxEigrp && !/^(no\s+)?(network|auto-summary|passive-interface|eigrp|metric|redistribute|variance|maximum-paths|distance|default-metric|traffic-share|timers|bfd)\b/i.test(line)) ctxEigrp = false;
          if (ctxCrypto) {
            const subs = ctxCrypto.kind === "policy" ? /^(encryption|encr|hash|authentication|group|lifetime)\b/i : ctxCrypto.kind === "tset" ? /^mode\b/i : /^(set|match)\b/i;
            if (!subs.test(line)) ctxCrypto = null;
          }
          if (PROMPT_FREE_SKIP.test(line)) {
            if (/^exit$|^end$/i.test(line)) {
              ctxIfaces = [];
              ctxVlan = null;
              ctxOspf = false;
            }
            continue;
          }

          // DHCP-Pool (Router/L3-Switch) und VTP
          let dh: RegExpExecArray | null;
          if (ctxPool) {
            if ((dh = /^network\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})$/i.exec(line))) {
              const p = maskToPrefix(dh[2]);
              if (p !== null) ctxPool.network = `${dh[1]}/${p}`;
            } else if ((dh = /^default-router\s+(\d+(?:\.\d+){3})/i.exec(line))) ctxPool.defaultRouter = dh[1];
            else if ((dh = /^dns-server\s+(.+)$/i.exec(line))) ctxPool.dnsServers = dh[1].split(/\s+/);
            else if ((dh = /^lease\s+(.+)$/i.exec(line))) ctxPool.lease = dh[1];
            continue;
          }
          if ((dh = /^ip dhcp pool\s+(\S+)$/i.exec(line))) {
            const poolName = dh[1];
            ctxPool = cfg.dhcpPools.find((p) => p.name === poolName) ?? { name: poolName };
            if (!cfg.dhcpPools.includes(ctxPool)) cfg.dhcpPools.push(ctxPool);
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            continue;
          }
          if ((dh = /^ip dhcp excluded-address\s+(\d+(?:\.\d+){3})(?:\s+(\d+(?:\.\d+){3}))?$/i.exec(line))) {
            cfg.dhcpExcluded.push({ from: dh[1], to: dh[2] ?? dh[1] });
            continue;
          }
          if (ctxCrypto) {
            const c = ctxCrypto;
            if (c.kind === "policy") {
              if ((dh = /^(?:encryption|encr)\s+(.+)$/i.exec(line))) c.ref.encryption = dh[1].trim();
              else if ((dh = /^hash\s+(\S+)/i.exec(line))) c.ref.hash = dh[1];
              else if ((dh = /^authentication\s+(\S+)/i.exec(line))) c.ref.authentication = dh[1];
              else if ((dh = /^group\s+(\S+)/i.exec(line))) c.ref.group = dh[1];
              else if ((dh = /^lifetime\s+(\d+)/i.exec(line))) c.ref.lifetime = Number(dh[1]);
            } else if (c.kind === "tset") {
              if ((dh = /^mode\s+(\S+)/i.exec(line))) c.ref.mode = dh[1];
            } else if ((dh = /^set peer\s+(\S+)/i.exec(line))) c.ref.peers.push(dh[1]);
            else if ((dh = /^set transform-set\s+(.+)$/i.exec(line))) c.ref.transformSets.push(...dh[1].trim().split(/\s+/));
            else if ((dh = /^set pfs\s+(\S+)/i.exec(line))) c.ref.pfs = dh[1];
            else if ((dh = /^set security-association lifetime seconds\s+(\d+)/i.exec(line))) c.ref.lifetimeSeconds = Number(dh[1]);
            else if ((dh = /^match address\s+(\S+)/i.exec(line))) c.ref.acl = dh[1];
            continue;
          }
          if ((dh = /^crypto isakmp policy\s+(\d+)$/i.exec(line))) {
            const policy: DeviceIsakmpPolicy = { priority: Number(dh[1]) };
            cryptoCfg().policies.push(policy);
            ctxCrypto = { kind: "policy", ref: policy };
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            continue;
          }
          if ((dh = /^crypto isakmp key\s+(\S+)\s+address\s+(\S+)/i.exec(line))) {
            cryptoCfg().keys.push({ key: dh[1], address: dh[2] });
            continue;
          }
          if ((dh = /^crypto ipsec transform-set\s+(\S+)\s+(.+)$/i.exec(line))) {
            const tset: DeviceTransformSet = { name: dh[1], transform: dh[2].trim().replace(/\s+/g, " ") };
            cryptoCfg().transformSets.push(tset);
            ctxCrypto = { kind: "tset", ref: tset };
            ctxIfaces = [];
            continue;
          }
          if ((dh = /^crypto map\s+(\S+)\s+(\d+)\s+ipsec-isakmp/i.exec(line))) {
            const entry: DeviceCryptoMapEntry = { name: dh[1], seq: Number(dh[2]), peers: [], transformSets: [] };
            cryptoCfg().maps.push(entry);
            ctxCrypto = { kind: "map", ref: entry };
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            continue;
          }
          if ((dh = /^access-list\s+(\d+)\s+(permit|deny)\s+(.+)$/i.exec(line))) {
            (cfg.accessLists[dh[1]] ??= []).push(`access-list ${dh[1]} ${dh[2].toLowerCase()} ${dh[3].trim().replace(/\s+/g, " ")}`);
            continue;
          }
          if ((dh = /^ip route\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})\s+(.+)$/i.exec(line))) {
            const prefix = maskToPrefix(dh[2]);
            const args = dh[3].trim().split(/\s+/);
            if (prefix !== null) {
              const route: DeviceStaticRoute = { network: `${dh[1]}/${prefix}` };
              let k = 0;
              if (/^\d+(?:\.\d+){3}$/.test(args[0])) route.nextHop = args[k++];
              else {
                route.outInterface = normalizeInterfaceName(args[k++]);
                if (args[k] && /^\d+(?:\.\d+){3}$/.test(args[k])) route.nextHop = args[k++];
              }
              if (args[k] && /^\d+$/.test(args[k])) route.distance = Number(args[k]);
              cfg.ipRoutes.push(route);
            }
            continue;
          }
          if ((dh = /^ip nat pool\s+(\S+)\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})(?:\s+(?:netmask|prefix-length)\s+(\S+))?/i.exec(line))) {
            (cfg.nat ??= { statics: [], pools: [], rules: [], insideInterfaces: [], outsideInterfaces: [] }).pools.push({ name: dh[1], start: dh[2], end: dh[3], netmask: dh[4] });
            continue;
          }
          if ((dh = /^ip nat inside source static(?:\s+(tcp|udp))?\s+(\d+(?:\.\d+){3})(?:\s+(\d+))?\s+(\d+(?:\.\d+){3})(?:\s+(\d+))?$/i.exec(line))) {
            const proto = dh[1]?.toLowerCase() as "tcp" | "udp" | undefined;
            (cfg.nat ??= { statics: [], pools: [], rules: [], insideInterfaces: [], outsideInterfaces: [] }).statics.push({
              local: dh[2],
              global: dh[4],
              ...(proto ? { protocol: proto, localPort: Number(dh[3]), globalPort: Number(dh[5]) } : {}),
            });
            continue;
          }
          if ((dh = /^ip nat inside source list\s+(\S+)\s+(pool|interface)\s+(\S+)(\s+overload)?/i.exec(line))) {
            const toPool = dh[2].toLowerCase() === "pool";
            (cfg.nat ??= { statics: [], pools: [], rules: [], insideInterfaces: [], outsideInterfaces: [] }).rules.push({
              acl: dh[1],
              ...(toPool ? { pool: dh[3] } : { interface: normalizeInterfaceName(dh[3]) }),
              overload: !!dh[4],
            });
            continue;
          }
          if ((dh = /^vtp\s+(domain|mode|version|password)\s+(\S+)/i.exec(line))) {
            const vtp = (cfg.vtp ??= {});
            const key = dh[1].toLowerCase();
            if (key === "domain") vtp.domain = dh[2];
            else if (key === "password") vtp.password = dh[2];
            else if (key === "version") vtp.version = Number(dh[2]);
            else if (/^(server|client|transparent|off)$/i.test(dh[2])) vtp.mode = dh[2].toLowerCase() as VtpMode;
            continue;
          }

          // PC-/Server-Desktop-Zeilen
          const inlineHost = /^(\S+?):\s+(\d+(?:\.\d+){3})\s*\/\s*(\d+(?:\.\d+){3})\s*\/\s*GW\s+(\d+(?:\.\d+){3})$/i.exec(line);
          if (inlineHost) {
            if (inlineHost[1] === deviceName) cfg.hostIp = { ip: inlineHost[2], mask: inlineHost[3], gateway: inlineHost[4] };
            continue;
          }
          let m = /^IP(?: Address|-Adresse)?:\s*(\S+)/i.exec(line);
          if (m) {
            if (multi) blockHosts.push({ ip: m[1], mask: "255.255.255.0" });
            else cfg.hostIp = { ...(cfg.hostIp ?? { mask: "255.255.255.0" }), ip: m[1], mask: cfg.hostIp?.mask ?? "255.255.255.0" };
            continue;
          }
          m = /^(?:Subnet Mask|Subnetzmaske|Maske):\s*(\S+)/i.exec(line);
          if (m) {
            const target = multi ? blockHosts[blockHosts.length - 1] : cfg.hostIp;
            if (target) target.mask = m[1];
            continue;
          }
          m = /^(?:Default Gateway|Gateway):\s*(\S+)/i.exec(line);
          if (m) {
            const target = multi ? blockHosts[blockHosts.length - 1] : cfg.hostIp;
            if (target) target.gateway = m[1];
            continue;
          }

          // DHCP-Clients und statische Server-NIC-Zeile ("Server-NIC: statisch 192.168.2.11/24, Gateway 192.168.2.1")
          if (/^(?:◉\s*DHCP\b|IP-Konfiguration:\s*DHCP\b)/i.test(line)) {
            cfg.hostDhcp = true;
            continue;
          }
          const stat = /^Statische IP:\s*(\d+(?:\.\d+){3})\s*\/(\d+)/i.exec(line);
          if (stat) {
            const bits = "1".repeat(Number(stat[2])).padEnd(32, "0");
            cfg.hostIp = { ip: stat[1], mask: [0, 8, 16, 24].map((i) => parseInt(bits.slice(i, i + 8), 2)).join(".") };
            continue;
          }
          const nic = /^Server-NIC:\s*statisch\s+(\d+(?:\.\d+){3})\/(\d+),\s*Gateway\s+(\d+(?:\.\d+){3})/i.exec(line);
          if (nic) {
            const bits = "1".repeat(Number(nic[2])).padEnd(32, "0");
            const mask = [0, 8, 16, 24].map((i) => parseInt(bits.slice(i, i + 8), 2)).join(".");
            cfg.hostIp = { ip: nic[1], mask, gateway: nic[3] };
            continue;
          }

          // IPv6: Host-Zeilen, Prozess-Kontexte, globale Befehle
          let v6: RegExpExecArray | null;
          if ((v6 = /^IPv6 Address:\s*(\S+)/i.exec(line))) {
            cfg.hostIpv6 = { ip: v6[1] };
            continue;
          }
          if ((v6 = /^IPv6 Gateway:\s*(\S+)/i.exec(line))) {
            if (cfg.hostIpv6) cfg.hostIpv6.gateway = v6[1];
            continue;
          }
          if (/^int(?:erface)?\s/i.test(line)) ctxV6 = null;
          if ((v6 = /^ipv6 route\s+(\S+\/\d+)\s+(\S+)(?:\s+(\S+))?(?:\s+(\d+))?$/i.exec(line))) {
            // ipv6 route <prefix> (<next-hop> | <interface> [<next-hop>]) [<distance>]
            const first = v6[2];
            const second = v6[3];
            const route: { prefix: string; nextHop?: string; outInterface?: string; distance?: number } = { prefix: v6[1] };
            if (first.includes(":")) {
              route.nextHop = first;
              if (second && /^\d+$/.test(second)) route.distance = Number(second);
            } else {
              route.outInterface = normalizeInterfaceName(first);
              if (second && second.includes(":")) route.nextHop = second;
              else if (second && /^\d+$/.test(second)) route.distance = Number(second);
            }
            if (v6[4]) route.distance = Number(v6[4]);
            cfg.ipv6Routes.push(route);
            continue;
          }
          if (/^ipv6 unicast-routing$/i.test(line)) {
            cfg.ipv6Routing = true;
            continue;
          }
          if ((v6 = /^ipv6 router ospf\s+(\d+)/i.exec(line))) {
            cfg.ospfv3 = cfg.ospfv3 ?? { processId: Number(v6[1]), passive: [], passiveDefault: false, noPassive: [] };
            ctxV6 = "ospf";
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            continue;
          }
          if ((v6 = /^ipv6 router eigrp\s+(\d+)/i.exec(line))) {
            cfg.eigrp6 = cfg.eigrp6 ?? { processId: Number(v6[1]), shutdown: true };
            ctxV6 = "eigrp";
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            continue;
          }
          if (ctxV6 === "ospf" && cfg.ospfv3) {
            if ((v6 = /^router-id\s+(\S+)/i.exec(line))) cfg.ospfv3.routerId = v6[1];
            else if ((v6 = /^no passive-interface\s+(\S+)/i.exec(line))) cfg.ospfv3.noPassive.push(normalizeInterfaceName(v6[1]));
            else if ((v6 = /^passive-interface\s+(\S+)/i.exec(line))) {
              if (/^default$/i.test(v6[1])) cfg.ospfv3.passiveDefault = true;
              else cfg.ospfv3.passive.push(normalizeInterfaceName(v6[1]));
            }
            continue;
          }
          if (ctxV6 === "eigrp" && cfg.eigrp6) {
            if ((v6 = /^eigrp router-id\s+(\S+)/i.exec(line))) cfg.eigrp6.routerId = v6[1];
            else if (/^no shutdown$/i.test(line)) cfg.eigrp6.shutdown = false;
            else if (/^shutdown$/i.test(line)) cfg.eigrp6.shutdown = true;
            continue;
          }
          if (ctxIfaces.length > 0) {
            for (const n of ctxIfaces) {
              const i6 = ifaceOf(n);
              if ((v6 = /^ipv6 address\s+(\S+)\s+link-local$/i.exec(line))) i6.linkLocal = v6[1];
              else if (/^ipv6 address\s+\S+\s+eui-64$/i.test(line)) continue;
              else if ((v6 = /^ipv6 address\s+(\S+\/\d+)$/i.exec(line))) i6.ipv6 = v6[1];
              else if ((v6 = /^ipv6 ospf priority\s+(\d+)/i.exec(line))) i6.ospf6 = { ...(i6.ospf6 ?? { processId: 0, area: 0 }), priority: Number(v6[1]) };
              else if ((v6 = /^ipv6 ospf network\s+(broadcast|point-to-point)/i.exec(line))) i6.ospf6 = { ...(i6.ospf6 ?? { processId: 0, area: 0 }), networkType: v6[1].toLowerCase() as "broadcast" | "point-to-point" };
              else if ((v6 = /^ipv6 ospf\s+(\d+)\s+area\s+(\d+)/i.exec(line))) i6.ospf6 = { ...(i6.ospf6 ?? {}), processId: Number(v6[1]), area: Number(v6[2]) };
              else if ((v6 = /^ipv6 eigrp\s+(\d+)/i.exec(line))) i6.eigrp6 = Number(v6[1]);
            }
            if (/^ipv6\s/i.test(line)) continue;
          }

          // Globale Befehle
          if ((m = /^hostname\s+(\S+)/i.exec(line))) {
            cfg.hostname = m[1];
            continue;
          }
          if ((m = /^interface\s+range\s+(.+)$/i.exec(line))) {
            ctxIfaces = expandInterfaceRange(m[1]);
            ctxVlan = null;
            ctxOspf = false;
            ctxIfaces.forEach(ifaceOf);
            continue;
          }
          if ((m = /^int(?:erface)?\s+(?:ethernet|eth|et)\s*(\d+\/\d+(?:\.\d+)?)$/i.exec(line))) {
            ctxIfaces = [`Et${m[1]}`];
            ctxVlan = null;
            ctxOspf = false;
            ifaceOf(ctxIfaces[0]);
            continue;
          }
          if ((m = /^int(?:erface)?\s+tunnel\s*(\d+)$/i.exec(line))) {
            ctxIfaces = [`Tu${m[1]}`];
            ctxVlan = null;
            ctxOspf = false;
            ifaceOf(ctxIfaces[0]);
            continue;
          }
          if ((m = /^int(?:erface)?\s+(?:loopback|lo)\s*(\d+)$/i.exec(line))) {
            ctxIfaces = [`Lo${m[1]}`];
            ctxVlan = null;
            ctxOspf = false;
            ifaceOf(ctxIfaces[0]);
            continue;
          }
          if ((m = /^interface\s+vlan\s*(\d+)$/i.exec(line)) || (m = /^int(?:erface)?\s+(vlan\d+)$/i.exec(line))) {
            const name = /^vlan/i.test(m[1]) ? normalizeInterfaceName(m[1]) : `Vlan${m[1]}`;
            ctxIfaces = [name];
            ctxVlan = null;
            ctxOspf = false;
            ifaceOf(name);
            continue;
          }
          if ((m = /^int(?:erface)?\s+(\S+)$/i.exec(line))) {
            ctxIfaces = [normalizeInterfaceName(m[1])];
            ctxVlan = null;
            ctxOspf = false;
            ifaceOf(ctxIfaces[0]);
            continue;
          }
          if ((m = /^vlan\s+(\d+)$/i.exec(line))) {
            ctxVlan = Number(m[1]);
            ctxIfaces = [];
            ctxOspf = false;
            if (!cfg.vlans.has(ctxVlan)) cfg.vlans.set(ctxVlan, "");
            continue;
          }
          if (ctxVlan !== null && (m = /^name\s+(\S+)/i.exec(line))) {
            cfg.vlans.set(ctxVlan, m[1]);
            continue;
          }
          if (/^ip routing$/i.test(line)) {
            cfg.ipRouting = true;
            continue;
          }
          if ((m = /^spanning-tree vlan\s+(\S+)\s+priority\s+(\d+)/i.exec(line))) {
            // priority und root primary/secondary setzen dieselbe Zeile: der letzte Befehl gilt
            if (parseVlanList(m[1]).includes(1) || /^1$/.test(m[1])) {
              cfg.stpPriority = Number(m[2]);
              cfg.stpMacro = undefined;
            }
            continue;
          }
          if ((m = /^spanning-tree vlan\s+(\S+)\s+root\s+(primary|secondary)/i.exec(line))) {
            // Makro, der letzte Befehl gilt: secondary = 28672, primary = 24576 bzw. 4096 unter der aktuellen Root (wird nach dem Aufbau aufgelöst)
            if (parseVlanList(m[1]).includes(1) || /^1$/.test(m[1])) {
              const primary = m[2].toLowerCase() === "primary";
              cfg.stpPriority = primary ? 24576 : 28672;
              cfg.stpMacro = primary ? "primary" : undefined;
            }
            continue;
          }
          if ((m = /^router eigrp\s+(\d+)$/i.exec(line))) {
            cfg.eigrp = cfg.eigrp ?? { asn: Number(m[1]), networks: [], passive: [], passiveDefault: false, noPassive: [], redistribute: [] };
            ctxEigrp = true;
            ctxOspf = false;
            ctxIfaces = [];
            ctxVlan = null;
            continue;
          }
          if (ctxEigrp && cfg.eigrp) {
            const e = cfg.eigrp;
            if ((m = /^network\s+(\d+(?:\.\d+){3})(?:\s+(\d+(?:\.\d+){3}))?$/i.exec(line))) e.networks.push({ net: m[1], ...(m[2] ? { wildcard: m[2] } : {}) });
            else if ((m = /^no passive-interface\s+(\S+)/i.exec(line))) e.noPassive.push(normalizeInterfaceName(m[1]));
            else if ((m = /^passive-interface\s+(\S+)/i.exec(line))) {
              if (/^default$/i.test(m[1])) e.passiveDefault = true;
              else e.passive.push(normalizeInterfaceName(m[1]));
            } else if ((m = /^eigrp router-id\s+(\S+)/i.exec(line))) e.routerId = m[1];
            else if ((m = /^metric weights\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/i.exec(line))) e.kValues = [Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])];
            else if ((m = /^redistribute\s+(.+)$/i.exec(line))) {
              const red = parseRedistribute(m[1]);
              if (red) e.redistribute.push(red);
            }
            continue;
          }
          if ((m = /^router ospf\s+(\d+)/i.exec(line))) {
            cfg.ospf = cfg.ospf ?? { processId: Number(m[1]), networks: [], passive: [], passiveDefault: false, redistribute: [] };
            ctxEigrp = false;
            ctxOspf = true;
            ctxIfaces = [];
            ctxVlan = null;
            continue;
          }
          if (ctxOspf && cfg.ospf) {
            if ((m = /^router-id\s+(\S+)/i.exec(line))) cfg.ospf.routerId = m[1];
            else if ((m = /^network\s+(\S+)\s+(\S+)\s+area\s+(\d+)/i.exec(line))) cfg.ospf.networks.push({ net: m[1], wildcard: m[2], area: Number(m[3]) });
            else if ((m = /^passive-interface\s+(\S+)/i.exec(line))) {
              if (/^default$/i.test(m[1])) cfg.ospf.passiveDefault = true;
              else cfg.ospf.passive.push(normalizeInterfaceName(m[1]));
            } else if ((m = /^redistribute\s+(.+)$/i.exec(line))) {
              const red = parseRedistribute(m[1]);
              if (red) cfg.ospf.redistribute.push(red);
            }
            continue;
          }
          if (/^router\s/i.test(line)) {
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            ctxEigrp = false;
            continue;
          }

          // Interface-Unterbefehle
          if (ctxIfaces.length > 0) {
            for (const n of ctxIfaces) {
              const i = ifaceOf(n);
              if ((m = /^ip address\s+(\S+)\s+(\S+)/i.exec(line))) {
                const p = maskToPrefix(m[2]);
                if (p !== null) i.ip = `${m[1]}/${p}`;
              } else if ((m = /^switchport mode\s+(access|trunk)$/i.exec(line))) {
                i.mode = m[1].toLowerCase() as InterfaceMode;
                i.dtp = undefined;
              } else if ((m = /^switchport mode dynamic\s+(desirable|auto)$/i.exec(line))) {
                i.dtp = m[1].toLowerCase() as "desirable" | "auto";
                i.mode = undefined;
              } else if (/^switchport nonegotiate$/i.test(line)) i.nonegotiate = true;
              else if ((m = /^ip nat\s+(inside|outside)$/i.exec(line))) i.natSide = m[1].toLowerCase() as "inside" | "outside";
              else if ((m = /^bandwidth\s+(\d+)$/i.exec(line))) i.bandwidthKbps = Number(m[1]);
              else if ((m = /^delay\s+(\d+)$/i.exec(line))) i.delayTens = Number(m[1]);
              else if ((m = /^tunnel source\s+(\S+)$/i.exec(line))) i.tunnelSource = /^\d+(?:\.\d+){3}$/.test(m[1]) ? m[1] : normalizeInterfaceName(m[1]);
              else if ((m = /^tunnel destination\s+(\S+)$/i.exec(line))) i.tunnelDestination = m[1];
              else if ((m = /^tunnel mode\s+(.+)$/i.exec(line))) i.tunnelMode = m[1].trim();
              else if ((m = /^crypto map\s+(\S+)$/i.exec(line))) i.cryptoMap = m[1];
              else if ((m = /^standby version\s+(1|2)$/i.exec(line))) i.hsrpVersion = Number(m[1]) as 1 | 2;
              else if ((m = /^standby\s+(?:(\d+)\s+)?(ip|priority|preempt|timers|track|authentication)\b\s*(.*)$/i.exec(line))) {
                const gid = m[1] ? Number(m[1]) : 0;
                const groups = (i.hsrpGroups ??= new Map());
                const g = groups.get(gid) ?? { id: gid };
                groups.set(gid, g);
                const key = m[2].toLowerCase();
                const rest = m[3].trim();
                if (key === "ip" && /^\d+(?:\.\d+){3}$/.test(rest)) g.ip = rest;
                else if (key === "priority" && /^\d+$/.test(rest)) g.priority = Number(rest);
                else if (key === "preempt") g.preempt = true;
                else if (key === "timers") g.timers = rest.replace(/\s+/g, " ");
                else if (key === "track") {
                  const t = /^(\S+)(?:\s+(?:decrement\s+)?(\d+))?/.exec(rest);
                  if (t && /^\d+$/.test(t[1])) (g.trackObjects ??= []).push(Number(t[1]));
                  else if (t) (g.track ??= []).push({ interface: normalizeInterfaceName(t[1]), decrement: t[2] ? Number(t[2]) : 10 });
                } else if (key === "authentication") {
                  const au = /^(?:(text|md5)\s+)?(?:key-string\s+|key-chain\s+)?(\S+)$/i.exec(rest);
                  const chain = /key-chain/i.test(rest);
                  if (au) g.authentication = `${chain ? "md5chain" : (au[1] ?? "text").toLowerCase()}:${au[2]}`;
                }
              }
              else if ((m = /^switchport access vlan\s+(\d+)/i.exec(line))) i.accessVlan = Number(m[1]);
              else if ((m = /^switchport trunk allowed vlan\s+(?:add\s+)?(\S+)/i.exec(line))) i.allowedVlans = parseVlanList(m[1]);
              else if ((m = /^switchport trunk native vlan\s+(\d+)/i.exec(line))) i.nativeVlan = Number(m[1]);
              else if ((m = /^channel-group\s+(\d+)\s+mode\s+(on|active|passive|desirable|auto)/i.exec(line)))
                i.channelGroup = { id: Number(m[1]), mode: m[2].toLowerCase() as ChannelGroupMode };
              else if ((m = /^encapsulation dot1q\s+(\d+)/i.exec(line))) i.dot1q = Number(m[1]);
              else if (/^shutdown$/i.test(line)) i.shutdown = true;
              else if (/^no shutdown$/i.test(line)) i.shutdown = false;
              else if ((m = /^ip ospf network\s+(broadcast|point-to-point)/i.exec(line))) i.ospfNetworkType = m[1].toLowerCase() as "broadcast" | "point-to-point";
              else if ((m = /^ip ospf priority\s+(\d+)/i.exec(line))) i.ospfPriority = Number(m[1]);
            }
          }
        }
      }
      if (multi && blockHosts[blockIndex]) cfg.hostIp = blockHosts[blockIndex];
    }
  }
  cfg.cli = cliLines.join("\n");
  return cfg;
}

// ---------------------------------------------------------------------------
// Umwandlung
// ---------------------------------------------------------------------------

function inNetwork(ip: string, net: string, wildcard: string): boolean {
  const w = ipToInt(wildcard);
  return ((ipToInt(ip) & ~w) >>> 0) === ((ipToInt(net) & ~w) >>> 0);
}

const isCliDevice = (d: LabTopologyDevice) => d.type === "router" || d.type === "switch-l2" || d.type === "switch-l3" || d.type === "firewall";

export function buildNetworkTopologyFromLab(
  lab: LabForNetwork,
  data: LabTopologyData,
  state: LabState = "target"
): LabNetworkResult {
  const problems: string[] = [];
  const devices: TopologyDevice[] = [];
  const poolNetworks = labDhcpPoolNetworks(lab);

  for (const d of data.devices) {
    if (d.assumed) {
      devices.push({
        id: d.id,
        name: d.name,
        type: d.type as TopologyDevice["type"],
        x: d.x - 40,
        y: d.y - 30,
        interfaces: [],
        config: { hostname: d.name },
        label: d.model,
        assumed: true,
        ...(d.assumedReason ? { assumedReason: d.assumedReason } : {}),
      });
      continue;
    }
    const profile = resolveHardwareProfile(d.model, d.type as TopologyDevice["type"]);
    if (!profile) {
      problems.push(`${d.name}: kein Hardware-Profil für Typ ${d.type}`);
      continue;
    }
    const parsed = parseLabDeviceConfig(lab, d.name);
    const ifaces: TopologyInterface[] = interfacesForProfile(profile, d.id);
    const ensure = (name: string): TopologyInterface => {
      const short = normalizeInterfaceName(name);
      const base = baseInterfaceName(short);
      let it = ifaces.find((i) => i.name === short);
      if (!it) {
        if (!profileHasInterface(profile, base)) problems.push(`${d.name}: Interface ${short} nicht im Profil ${profile.model}`);
        it = { id: interfaceIdFor(d.id, short), name: short, status: "up" };
        ifaces.push(it);
      }
      return it;
    };

    const config: DeviceConfig = { hostname: d.name, labCli: isCliDevice(d) ? parsed.cli : undefined };

    if (state === "target") {
      config.hostname = parsed.hostname ?? d.name;
      if (parsed.vlans.size > 0) config.vlans = [...parsed.vlans].map(([id, name]) => ({ id, name: name || `VLAN${String(id).padStart(4, "0")}` }));
      if (parsed.ipRouting) config.ipRoutingEnabled = true;
      if (parsed.stpPriority !== undefined) config.stp = { priority: parsed.stpPriority, ...(parsed.stpMacro ? { macro: parsed.stpMacro } : {}) };

      // Interfaces
      for (const [name, c] of parsed.ifaces) {
        if (/^Po\d+$/.test(name)) continue;
        const sub = /\.(\d+)$/.exec(name);
        const it = ensure(name);
        if (c.ip) it.ip = c.ip;
        if (c.mode) it.mode = c.mode;
        if (c.dtp) it.dtp = c.dtp;
        if (c.nonegotiate) it.nonegotiate = true;
        if (c.tunnelSource || c.tunnelDestination || c.tunnelMode) it.tunnel = { source: c.tunnelSource, destination: c.tunnelDestination, mode: c.tunnelMode };
        if (c.cryptoMap) it.cryptoMap = c.cryptoMap;
        if (c.bandwidthKbps !== undefined) it.bandwidthKbps = c.bandwidthKbps;
        if (c.delayTens !== undefined) it.delayTens = c.delayTens;
        if (c.hsrpGroups && c.hsrpGroups.size > 0) {
          const hsrp: InterfaceHsrp = { version: c.hsrpVersion ?? 1, groups: [...c.hsrpGroups.values()] };
          it.hsrp = hsrp;
        }
        if (c.accessVlan !== undefined) it.vlan = c.accessVlan;
        if (c.allowedVlans) it.allowedVlans = c.allowedVlans;
        if (c.nativeVlan !== undefined) it.nativeVlan = c.nativeVlan;
        if (c.channelGroup) it.channelGroup = c.channelGroup;
        if (sub && c.dot1q !== undefined) {
          it.vlan = c.dot1q;
          it.mode = "routed";
        }
        if (c.shutdown) {
          it.status = "admin-down";
          it.isShutdown = true;
        }
      }
      // Port-Channels: Member erben die Port-channel-Konfiguration
      const poGroups = new Map<number, { mode: ChannelGroupMode; members: string[] }>();
      for (const it of ifaces) {
        if (it.channelGroup) {
          const g = poGroups.get(it.channelGroup.id) ?? { mode: it.channelGroup.mode, members: [] };
          g.members.push(it.name);
          poGroups.set(it.channelGroup.id, g);
        }
      }
      for (const [id, g] of poGroups) {
        const po = parsed.ifaces.get(`Po${id}`);
        for (const m of g.members) {
          const it = ifaces.find((i) => i.name === m)!;
          if (po?.mode && !it.mode) it.mode = po.mode;
          if (po?.allowedVlans && !it.allowedVlans) it.allowedVlans = po.allowedVlans;
        }
        (config.portChannels ??= []).push({
          id,
          mode: g.mode,
          protocol: g.mode === "active" || g.mode === "passive" ? "lacp" : g.mode === "on" ? "static" : "pagp",
          members: g.members,
        });
      }
      // SVIs
      for (const [name, c] of parsed.ifaces) {
        const v = /^Vlan(\d+)$/.exec(name);
        if (v && c.ip) (config.svis ??= []).push({ vlan: Number(v[1]), ip: c.ip });
      }
      // Hosts: DHCP (nur das Netz ist bekannt) oder Adresse aus dem Geräte-Label des Labs
      if (d.dhcpNetwork && (parsed.hostDhcp || poolNetworks.has(d.dhcpNetwork)) && (d.type === "pc" || d.type === "server")) ifaces[0].dhcp = { network: d.dhcpNetwork };
      if (!parsed.hostIp && !parsed.hostDhcp && (d.type === "pc" || d.type === "server")) {
        const nameRe = d.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const m4 = lab.topology.devices.map((x) => new RegExp(`${nameRe}\\s*\\((\\d+(?:\\.\\d+){3})/(\\d+)\\)`).exec(x.label)).find(Boolean);
        if (m4) ifaces[0].ip = `${m4[1]}/${m4[2]}`;
      }
      // Hosts
      if (parsed.hostIp && (d.type === "pc" || d.type === "server")) {
        const p = maskToPrefix(parsed.hostIp.mask);
        const it = ifaces[0];
        if (p !== null) it.ip = `${parsed.hostIp.ip}/${p}`;
        if (parsed.hostIp.gateway) config.defaultGateway = parsed.hostIp.gateway;
      }
      // IPv6
      for (const [name, c] of parsed.ifaces) {
        if (/^Po\d+$/.test(name)) continue;
        if (!c.ipv6 && !c.linkLocal && !c.ospf6 && c.eigrp6 === undefined) continue;
        const it6 = ensure(name);
        if (c.ipv6) it6.ipv6 = c.ipv6;
        if (c.linkLocal) it6.ipv6LinkLocal = c.linkLocal;
        if (c.ospf6 && c.ospf6.processId) {
          const pp = parsed.ospfv3;
          const passive = pp ? (pp.passiveDefault ? !pp.noPassive.includes(name) : pp.passive.includes(name)) : false;
          it6.ospfv3 = {
            processId: c.ospf6.processId,
            area: c.ospf6.area,
            passive,
            ...(c.ospf6.priority !== undefined ? { priority: c.ospf6.priority } : {}),
            ...(c.ospf6.networkType ? { networkType: c.ospf6.networkType } : {}),
          };
        }
        if (c.eigrp6 !== undefined) it6.eigrpv6 = { asn: c.eigrp6 };
      }
      if (d.type === "pc" || d.type === "server") {
        // Desktop-Konfiguration, sonst die Adresse aus dem Geräte-Label des Labs (z. B. "PC2 (R1 Gig0/0, FDAA::0101/64)")
        const fromLabel = lab.topology.devices.map((x) => new RegExp(`${d.name}\\s*\\([^)]*?([0-9A-Fa-f:]*::[0-9A-Fa-f:]*/\\d+)\\)`).exec(x.label)?.[1]).find(Boolean);
        const v6addr = parsed.hostIpv6?.ip ?? fromLabel;
        if (v6addr) ifaces[0].ipv6 = v6addr;
        if (parsed.hostIpv6?.gateway) config.defaultGatewayV6 = parsed.hostIpv6.gateway;
      }
      if (parsed.ospfv3) {
        const areas = [...new Set([...parsed.ifaces.values()].filter((c) => c.ospf6).map((c) => c.ospf6!.area))];
        (config.routingProtocols ??= []).push(`OSPFv3 ${parsed.ospfv3.processId}${areas.length ? ` Area ${areas.join(",")}` : ""}`);
      }
      if (parsed.eigrp6) (config.routingProtocols ??= []).push(`EIGRPv6 ${parsed.eigrp6.processId}`);
      if (parsed.dhcpPools.length > 0) config.dhcpPools = parsed.dhcpPools;
      if (parsed.dhcpExcluded.length > 0) config.dhcpExcluded = parsed.dhcpExcluded;
      if (parsed.vtp) config.vtp = parsed.vtp;
      if (parsed.ipRoutes.length > 0) config.ipRoutes = parsed.ipRoutes;
      if (Object.keys(parsed.accessLists).length > 0) config.accessLists = parsed.accessLists;
      if (parsed.crypto) config.crypto = parsed.crypto;
      if (parsed.nat) {
        const nat: DeviceNatConfig = { ...parsed.nat };
        for (const [name, c] of parsed.ifaces) {
          if (c.natSide === "inside") nat.insideInterfaces.push(name);
          if (c.natSide === "outside") nat.outsideInterfaces.push(name);
        }
        config.nat = nat;
      } else {
        const sides = [...parsed.ifaces].filter(([, c]) => c.natSide);
        if (sides.length > 0) {
          config.nat = {
            statics: [],
            pools: [],
            rules: [],
            insideInterfaces: sides.filter(([, c]) => c.natSide === "inside").map(([n]) => n),
            outsideInterfaces: sides.filter(([, c]) => c.natSide === "outside").map(([n]) => n),
          };
        }
      }
      if (parsed.ipv6Routing) config.ipv6RoutingEnabled = true;
      if (parsed.ipv6Routes.length > 0) config.ipv6Routes = parsed.ipv6Routes;
      if (parsed.ospfv3) config.ospfv3 = { processId: parsed.ospfv3.processId, routerId: parsed.ospfv3.routerId };
      if (parsed.eigrp6) config.eigrpv6 = { asn: parsed.eigrp6.processId, routerId: parsed.eigrp6.routerId, shutdown: parsed.eigrp6.shutdown };
      if (parsed.eigrp) {
        config.eigrp = parsed.eigrp;
        (config.routingProtocols ??= []).push(`EIGRP ${parsed.eigrp.asn}`);
      }
      // OSPF
      if (parsed.ospf) {
        config.routingProtocols = [`OSPF ${parsed.ospf.processId}`, ...(config.routingProtocols ?? [])];
        config.ospf = { processId: parsed.ospf.processId, routerId: parsed.ospf.routerId, ...(parsed.ospf.redistribute.length > 0 ? { redistribute: parsed.ospf.redistribute } : {}) };
        for (const it of ifaces) {
          if (!it.ip) continue;
          const ip = it.ip.split("/")[0];
          const net = parsed.ospf.networks.find((n) => inNetwork(ip, n.net, n.wildcard));
          const c = parsed.ifaces.get(it.name);
          if (!net) {
            it.ospf = { enabled: false };
            continue;
          }
          it.ospf = {
            area: net.area,
            networkType: c?.ospfNetworkType ?? (it.name.startsWith("Tu") ? "point-to-point" : "broadcast"),
            passive: parsed.ospf.passive.includes(it.name) || parsed.ospf.passiveDefault,
            ...(c?.ospfPriority !== undefined ? { priority: c.ospfPriority } : {}),
          };
        }
      }
    }

    // Interfaces ohne Konfiguration, aber in der Adressierungstabelle (nur Zielzustand)
    if (state === "target") {
      for (const row of data.addressingTable.filter((r) => r.device === d.name)) {
        const it = ensure(row.interface);
        const p = maskToPrefix(row.subnetMask);
        if (!it.ip && p !== null && /^\d/.test(row.ip)) it.ip = `${row.ip}/${p}`;
        if (/svi/i.test(row.interface) && it.ip) {
          const v = /^Vlan(\d+)$/.exec(it.name);
          if (v && !(config.svis ?? []).some((s) => s.vlan === Number(v[1]))) (config.svis ??= []).push({ vlan: Number(v[1]), ip: it.ip });
        }
      }
    }

    devices.push({
      id: d.id,
      name: d.name,
      type: d.type as TopologyDevice["type"],
      // Lab-Koordinaten sind Gerätemitten, der Canvas verwendet die linke obere Ecke (80 x 60)
      x: d.x - 40,
      y: d.y - 30,
      interfaces: ifaces,
      config,
      label: d.model,
    });
  }

  const links: TopologyLink[] = [];
  for (const l of data.links) {
    const a = devices.find((x) => x.id === l.from);
    const b = devices.find((x) => x.id === l.to);
    if (!a || !b) {
      problems.push(`Link ${l.id}: Gerät fehlt`);
      continue;
    }
    const find = (dev: TopologyDevice, port: string) => {
      const short = normalizeInterfaceName(port);
      // Im Lab nicht angegebenes Gerät: je Link ein eigener, namenloser Port („–“)
      if (dev.assumed) {
        const it: TopologyInterface = { id: `${interfaceIdFor(dev.id, short)}-${l.id}`, name: short, status: "up" };
        dev.interfaces.push(it);
        return it;
      }
      let it = dev.interfaces.find((i) => i.name === short);
      if (!it) {
        if (!/^Tu\d+$/.test(short)) problems.push(`${dev.name}: Link-Port ${short} nicht im Profil`);
        it = { id: interfaceIdFor(dev.id, short), name: short, status: "up" };
        dev.interfaces.push(it);
      }
      return it;
    };
    const ia = find(a, l.fromPort);
    const ib = find(b, l.toPort);
    for (const [dev, it, port] of [[a, ia, l.fromPort], [b, ib, l.toPort]] as const) {
      if (dev.type.startsWith("switch") && !dev.assumed && !labMentionsPort(lab, dev.name, port)) it.assumed = true;
    }
    // explizit gekennzeichnete Ports (z. B. „Mgmt“ ohne Port im Lab)
    if (l.assumedPorts?.includes("from")) ia.assumed = true;
    if (l.assumedPorts?.includes("to")) ib.assumed = true;
    const bundled = state === "target" && ia.channelGroup && ib.channelGroup;
    links.push({
      id: l.id,
      sourceDeviceId: a.id,
      sourceInterfaceId: ia.id,
      targetDeviceId: b.id,
      targetInterfaceId: ib.id,
      linkType: l.cableType === "serial" ? "serial" : l.cableType === "tunnel" ? "tunnel" : bundled ? "etherchannel" : l.isTrunk ? "trunk" : "ethernet",
      status: "up",
      label: l.subnetLabel,
      ...(l.bendPoints?.length ? { bendPoints: l.bendPoints } : {}),
    });
  }

  // `root primary`: 24576, oder 4096 unter der niedrigsten Priority der anderen Switches, wenn diese niedriger ist.
  // Das Ergebnis hängt vom Netzzustand beim Ausführen ab und wird in diesem Fall als uneindeutig gekennzeichnet.
  if (state === "target") {
    const switches = devices.filter((x) => x.type === "switch-l2" || x.type === "switch-l3");
    // nur Switches, die über Switch-Links mit diesem verbunden sind (nicht angeschlossene Geräte, z. B. ein später angesteckter Rogue-Switch, zählen nicht)
    const reachable = (start: TopologyDevice): Set<string> => {
      const seen = new Set<string>([start.id]);
      const queue = [start.id];
      while (queue.length > 0) {
        const id = queue.shift()!;
        for (const l of links) {
          const other = l.sourceDeviceId === id ? l.targetDeviceId : l.targetDeviceId === id ? l.sourceDeviceId : null;
          if (other && !seen.has(other) && switches.some((x) => x.id === other)) {
            seen.add(other);
            queue.push(other);
          }
        }
      }
      return seen;
    };
    for (const sw of switches) {
      if (sw.config?.stp?.macro !== "primary") continue;
      const domain = reachable(sw);
      const others = switches.filter((x) => x !== sw && domain.has(x.id)).map((x) => x.config?.stp?.priority ?? 32768);
      const lowest = others.length > 0 ? Math.min(...others) : 32768;
      if (lowest > 24576) sw.config.stp.priority = 24576;
      else {
        sw.config.stp.priority = Math.max(0, lowest - 4096);
        sw.config.stp.ambiguous = true;
      }
    }
  }

  const topology: NetworkTopology = {
    id: `lab-${lab.id}-${state}`,
    name: `${lab.title} (${state === "target" ? "Zielzustand" : "Startzustand"})`,
    description: lab.topology.description,
    version: "2.0",
    category: "teaching-labs",
    devices,
    links,
    annotations: (data.notes ?? [])
      .filter((n) => !n.onlyIn || n.onlyIn === state)
      .map((n) => {
        const w = Math.min(320, Math.round(n.text.length * 6.4 + 24));
        return {
          id: `lab-note-${n.id}`,
          type: "note" as const,
          x: n.x - 40 - w / 2,
          y: n.y - 30 - 22,
          width: w,
          height: 44,
          text: n.text,
          author: n.kind === "fault" ? "Beabsichtigter Fehler" : "Lab-Hinweis",
          ...(n.kind === "fault" ? { color: "#DC2626" } : {}),
        };
      }),
    vlans: data.vlans?.map((v) => ({ id: v.id, name: v.name, color: THEME_COLORS[v.colorTheme] ?? "#64748B", subnet: v.subnet })),
    subnetZones: data.zones?.map((z) => ({
      id: z.id,
      // Der Canvas zeigt die Netzadresse selbst an: nicht doppelt im Namen
      name: z.label.replace(/\s*·?\s*\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}/, "").replace(/\s{2,}/g, " ").trim(),
      cidr: /(\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2})/.exec(z.label)?.[1] ?? "",
      color: THEME_COLORS[z.colorTheme ?? "slate"] ?? "#64748B",
      x: z.x,
      y: z.y,
      width: z.width,
      height: z.height,
      labelCorner: placeZoneBadge(data, z.id).corner,
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Unterrichts-Lab",
      labId: lab.id,
      labState: state,
    },
  };
  // Spanning-Tree-Rollen anzeigen, wenn das Lab spanning-tree konfiguriert (Root-Wahl, Alternate-Port)
  if (state === "target" && devices.some((d) => /^\s*spanning-tree/m.test(d.config?.labCli ?? ""))) {
    const stp = computeStp(topology);
    const roleOf = { Root: "RP", Desg: "DP", Altn: "BLK" } as const;
    for (const bridge of stp.values()) {
      for (const p of bridge.ports) {
        const linked = links.some((l) => l.sourceInterfaceId === p.iface.id || l.targetInterfaceId === p.iface.id);
        if (linked && links.some((l) => (l.sourceInterfaceId === p.iface.id || l.targetInterfaceId === p.iface.id) && stp.has(l.sourceDeviceId) && stp.has(l.targetDeviceId))) {
          p.iface.portRole = roleOf[p.role];
        }
      }
    }
    for (const l of links) {
      const ends = [l.sourceInterfaceId, l.targetInterfaceId];
      const blocked = devices.some((d) => d.interfaces.some((i) => ends.includes(i.id) && i.portRole === "BLK"));
      if (blocked) l.status = "stp-blocking";
    }
  }

  return { topology, problems };
}

/** Befehle eines Geräts ohne Prompt, bereit zum Einfügen in die Packet-Tracer-CLI. */
export function getLabDeviceCli(lab: Pick<LabScenario, "steps">, deviceName: string): string {
  return parseLabDeviceConfig(lab, deviceName).cli;
}

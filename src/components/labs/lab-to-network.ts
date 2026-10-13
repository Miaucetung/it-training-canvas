import type {
  ChannelGroupMode,
  DeviceConfig,
  InterfaceMode,
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
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
}

export interface ParsedDeviceConfig {
  hostname?: string;
  vlans: Map<number, string>;
  ifaces: Map<string, IfaceCfg>;
  ipRouting: boolean;
  stpPriority?: number;
  ospf?: { processId: number; routerId?: string; networks: Array<{ net: string; wildcard: string; area: number }>; passive: string[]; passiveDefault: boolean };
  hostIp?: { ip: string; mask: string; gateway?: string };
  hostIpv6?: { ip: string; gateway?: string };
  /** Desktop steht auf DHCP */
  hostDhcp?: boolean;
  ipv6Routing: boolean;
  ospfv3?: { processId: number; routerId?: string; passive: string[]; passiveDefault: boolean; noPassive: string[] };
  eigrp6?: { processId: number; routerId?: string; shutdown: boolean };
  ipv6Routes: Array<{ prefix: string; nextHop?: string; outInterface?: string; distance?: number }>;
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

const PROMPT_FREE_SKIP = /^(enable|configure terminal|conf t|end|exit|do copy running-config startup-config|copy running-config startup-config|wr|write memory)$/i;

export function parseLabDeviceConfig(lab: Pick<LabScenario, "steps">, deviceName: string): ParsedDeviceConfig {
  const cfg: ParsedDeviceConfig = { vlans: new Map(), ifaces: new Map(), ipRouting: false, ipv6Routing: false, ipv6Routes: [], cli: "" };
  const cliLines: string[] = [];
  let ctxIfaces: string[] = [];
  let ctxVlan: number | null = null;
  let ctxOspf = false;
  let ctxV6: "ospf" | "eigrp" | null = null;
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
          if (PROMPT_FREE_SKIP.test(line)) {
            if (/^exit$|^end$/i.test(line)) {
              ctxIfaces = [];
              ctxVlan = null;
              ctxOspf = false;
            }
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
            if (parseVlanList(m[1]).includes(1) || /^1$/.test(m[1])) cfg.stpPriority = Number(m[2]);
            continue;
          }
          if ((m = /^spanning-tree vlan\s+(\S+)\s+root\s+(primary|secondary)/i.exec(line))) {
            // Makro: nur wirksam, wenn keine explizite Priority gesetzt ist (primary 24576, secondary 28672)
            if ((parseVlanList(m[1]).includes(1) || /^1$/.test(m[1])) && cfg.stpPriority === undefined) cfg.stpPriority = m[2].toLowerCase() === "primary" ? 24576 : 28672;
            continue;
          }
          if ((m = /^router ospf\s+(\d+)/i.exec(line))) {
            cfg.ospf = cfg.ospf ?? { processId: Number(m[1]), networks: [], passive: [], passiveDefault: false };
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
            }
            continue;
          }
          if (/^router\s/i.test(line)) {
            ctxIfaces = [];
            ctxVlan = null;
            ctxOspf = false;
            continue;
          }

          // Interface-Unterbefehle
          if (ctxIfaces.length > 0) {
            for (const n of ctxIfaces) {
              const i = ifaceOf(n);
              if ((m = /^ip address\s+(\S+)\s+(\S+)/i.exec(line))) {
                const p = maskToPrefix(m[2]);
                if (p !== null) i.ip = `${m[1]}/${p}`;
              } else if ((m = /^switchport mode\s+(access|trunk)$/i.exec(line))) i.mode = m[1].toLowerCase() as InterfaceMode;
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
      if (parsed.stpPriority !== undefined) config.stp = { priority: parsed.stpPriority };

      // Interfaces
      for (const [name, c] of parsed.ifaces) {
        if (/^Po\d+$/.test(name)) continue;
        const sub = /\.(\d+)$/.exec(name);
        const it = ensure(name);
        if (c.ip) it.ip = c.ip;
        if (c.mode) it.mode = c.mode;
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
      if (parsed.hostDhcp && d.dhcpNetwork && (d.type === "pc" || d.type === "server")) ifaces[0].dhcp = { network: d.dhcpNetwork };
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
      if (parsed.ipv6Routing) config.ipv6RoutingEnabled = true;
      if (parsed.ipv6Routes.length > 0) config.ipv6Routes = parsed.ipv6Routes;
      if (parsed.ospfv3) config.ospfv3 = { processId: parsed.ospfv3.processId, routerId: parsed.ospfv3.routerId };
      if (parsed.eigrp6) config.eigrpv6 = { asn: parsed.eigrp6.processId, routerId: parsed.eigrp6.routerId, shutdown: parsed.eigrp6.shutdown };
      // OSPF
      if (parsed.ospf) {
        config.routingProtocols = [`OSPF ${parsed.ospf.processId}`, ...(config.routingProtocols ?? [])];
        config.ospf = { processId: parsed.ospf.processId, routerId: parsed.ospf.routerId };
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

  const topology: NetworkTopology = {
    id: `lab-${lab.id}-${state}`,
    name: `${lab.title} (${state === "target" ? "Zielzustand" : "Startzustand"})`,
    description: lab.topology.description,
    version: "2.0",
    category: "teaching-labs",
    devices,
    links,
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

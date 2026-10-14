import type { NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";
import { hasRouteTo } from "./static-routes";

const LONG_NAMES: Record<string, string> = { Se: "Serial", Gi: "GigabitEthernet", Fa: "FastEthernet", Et: "Ethernet", Lo: "Loopback", Tu: "Tunnel" };

export function longInterfaceName(name: string): string {
  const m = /^([A-Za-z]+)(.*)$/.exec(name);
  return m && LONG_NAMES[m[1]] ? `${LONG_NAMES[m[1]]}${m[2]}` : name;
}

const baseIp = (cidr?: string) => (cidr ?? "").split("/")[0];

export function isTunnelInterface(i: TopologyInterface): boolean {
  return /^Tu\d+$/.test(i.name) && !!(i.tunnel || i.ip);
}

export function hasTunnels(device: TopologyDevice): boolean {
  return device.interfaces.some(isTunnelInterface);
}

export type LineProtocol = "up" | "down" | "nicht bestimmbar";

export interface TunnelState {
  iface: TopologyInterface;
  adminDown: boolean;
  lineProtocol: LineProtocol;
  sourceIp?: string;
  sourceInterface?: string;
  destination?: string;
  notes: string[];
}

function ownerOf(topology: NetworkTopology, ip: string): { device: TopologyDevice; iface: TopologyInterface } | null {
  for (const d of topology.devices) {
    const i = d.interfaces.find((x) => baseIp(x.ip) === ip);
    if (i) return { device: d, iface: i };
  }
  return null;
}

const nameOf = (d: TopologyDevice) => d.config?.hostname ?? d.name;

export function computeTunnelState(device: TopologyDevice, iface: TopologyInterface, topology: NetworkTopology): TunnelState {
  const t = iface.tunnel;
  const notes: string[] = [];
  const state: TunnelState = { iface, adminDown: !!iface.isShutdown, lineProtocol: "down", destination: t?.destination, notes };
  if (state.adminDown) {
    notes.push("Interface ist mit shutdown abgeschaltet.");
    return state;
  }

  // Quelle
  let sourceUp = false;
  if (!t?.source) {
    notes.push("Kein tunnel source im Lab: der Tunnel bleibt down.");
  } else if (/^\d+(?:\.\d+){3}$/.test(t.source)) {
    state.sourceIp = t.source;
    const owner = device.interfaces.find((i) => baseIp(i.ip) === t.source);
    sourceUp = !!owner && owner.status === "up" && !owner.isShutdown;
    state.sourceInterface = owner?.name;
    if (!sourceUp) notes.push(`Die Quelladresse ${t.source} gehört keinem aktiven Interface dieses Geräts.`);
  } else {
    const src = device.interfaces.find((i) => i.name === t.source);
    state.sourceInterface = t.source;
    state.sourceIp = baseIp(src?.ip) || undefined;
    sourceUp = !!src && !!src.ip && src.status === "up" && !src.isShutdown;
    if (!src) notes.push(`Quell-Interface ${t.source} existiert im Lab nicht.`);
    else if (!src.ip) notes.push(`Quell-Interface ${t.source} hat keine IP-Adresse.`);
    else if (!sourceUp) notes.push(`Quell-Interface ${t.source} ist nicht aktiv.`);
  }

  // Ziel
  let routable: boolean | null = false;
  if (!t?.destination) {
    notes.push("Kein tunnel destination im Lab: der Tunnel bleibt down.");
    routable = false;
  } else if (hasRouteTo(device, t.destination)) {
    routable = true;
  } else if ((device.config?.routingProtocols?.length ?? 0) > 0) {
    routable = null;
    notes.push(`Weder verbundenes Netz noch statische Route zu ${t.destination}: ob ein dynamisch gelernter Weg besteht, ist nicht bestimmbar.`);
  } else {
    notes.push(`Keine Route zu ${t.destination} (weder verbundenes Netz noch statische Route): der Tunnel bleibt down.`);
  }

  if (sourceUp && routable === true) state.lineProtocol = "up";
  else if (sourceUp && routable === null) state.lineProtocol = "nicht bestimmbar";

  // Gegenstelle im Lab
  if (t?.destination) {
    const owner = ownerOf(topology, t.destination);
    if (!owner) {
      notes.push(`Das Ziel ${t.destination} gehört keinem Gerät im Lab.`);
    } else if (owner.device.id !== device.id) {
      const back = owner.device.interfaces.find((i) => i.tunnel && i.tunnel.destination && state.sourceIp && i.tunnel.destination === state.sourceIp);
      if (!back) {
        const other = owner.device.interfaces.filter((i) => isTunnelInterface(i) && i.tunnel?.destination);
        notes.push(
          other.length > 0
            ? `${nameOf(owner.device)} zeigt mit seinem Tunnel auf ${other.map((i) => i.tunnel!.destination).join(", ")} statt auf ${state.sourceIp ?? "diese Quelladresse"}.`
            : `${nameOf(owner.device)} hat im Lab keinen passenden Tunnel zurück.`
        );
      }
    }
  }
  notes.push("GRE ohne Keepalive: „line protocol up“ heißt nur, dass die Quelle aktiv und das Ziel routbar ist; die Gegenstelle wird nicht geprüft.");
  return state;
}

export function formatShowInterfacesTunnel(device: TopologyDevice, iface: TopologyInterface, topology: NetworkTopology): string {
  const s = computeTunnelState(device, iface, topology);
  const t = iface.tunnel;
  const lines: string[] = [];
  const admin = s.adminDown ? "administratively down" : "up";
  lines.push(`${longInterfaceName(iface.name)} is ${admin}, line protocol is ${s.adminDown ? "down" : s.lineProtocol}`);
  lines.push("  Hardware is Tunnel");
  lines.push(iface.ip ? `  Internet address is ${iface.ip}` : "  Internet protocol processing disabled");
  lines.push("  Encapsulation TUNNEL, loopback not set");
  const src = s.sourceIp ? `${s.sourceIp}${s.sourceInterface && s.sourceInterface !== s.sourceIp ? ` (${longInterfaceName(s.sourceInterface)})` : ""}` : (t?.source ? `${longInterfaceName(t.source)} (ohne IP)` : "nicht gesetzt");
  lines.push(`  Tunnel source ${src}, destination ${t?.destination ?? "nicht gesetzt"}`);
  const mode = !t?.mode || /^gre\s+ip$/i.test(t.mode) ? "GRE/IP" : `${t.mode} (laut Lab)`;
  lines.push(`  Tunnel protocol/transport ${mode}`);
  lines.push("");
  lines.push("% MTU, Bandbreite und Zähler sind plattform- bzw. laufzeitabhängig und werden nicht ausgegeben.");
  for (const n of s.notes) lines.push(`% ${n}`);
  return lines.join("\n");
}

export function greOutputs(device: TopologyDevice, topology: NetworkTopology): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of device.interfaces.filter(isTunnelInterface)) {
    out[`show interfaces tunnel ${i.name.replace(/^Tu/, "")}`] = formatShowInterfacesTunnel(device, i, topology);
  }
  return out;
}

/** Hinweise für den Inspector. */
export function greHints(device: TopologyDevice, topology: NetworkTopology): string[] {
  return device.interfaces
    .filter(isTunnelInterface)
    .flatMap((i) => computeTunnelState(device, i, topology).notes.filter((n) => !n.startsWith("GRE ohne Keepalive")).map((n) => `${i.name}: ${n}`));
}

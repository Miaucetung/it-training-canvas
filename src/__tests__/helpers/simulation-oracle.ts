import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { simulatePing } from "@/lib/topology/simulation/packet-simulator";
import type { DropReasonCode, SimulationOptions, SimulationResult } from "@/lib/topology/simulation/types";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

/**
 * Lab-Orakel für die Paket-Simulation: explizite Erwartungen aus den Lab-Texten.
 *
 * Jede Zeile nennt Lab, Quelle, Ziel, Zustand und das erwartete Ergebnis. Die Erwartung folgt dem Lab-Text
 * bzw. dem IOS-Verhalten; weicht der Lab-Text fachlich ab, steht das in `hinweis`.
 * `offen` markiert bekannte, begründete Abweichungen. Für solche Zeilen prüft der Test, dass die Abweichung
 * noch besteht – ist sie behoben, schlägt er an und die Markierung muss entfernt werden.
 */

export type OracleState =
  | { id: "ziel" }
  | { id: "ohne-acl" }
  | { id: "ohne-ipsec" }
  | { id: "shutdown"; device: string; iface: string }
  | { id: "no-shutdown"; device: string; iface: string };

export interface OracleRow {
  nr: number;
  lab: string;
  /** Gerätename der Quelle */
  quelle: string;
  /** Ziel-IP oder Gerätename */
  ziel: string;
  /** Quelladresse wie bei `ping <ziel> source <ip>` */
  quelleIp?: string;
  zustand: OracleState;
  /** Vorheriger Ping im selben Simulationszustand (z. B. NAT-Eintrag erzeugen) */
  vorher?: { quelle: string; ziel: string };
  erwartet: "erfolg" | "fehlschlag";
  /** Bei Fehlschlag: erwarteter Verwerfungsgrund (optional) */
  grund?: DropReasonCode | "invalid-source";
  /** Fundstelle im Lab */
  beleg: string;
  offen?: { art: "simulation" | "lab" | "ausserhalb"; grund: string };
  hinweis?: string;
}

const NOSHUT = (device: string, iface: string): OracleState => ({ id: "no-shutdown", device, iface });
const ZIEL: OracleState = { id: "ziel" };
const OFFEN_RIP = { art: "ausserhalb" as const, grund: "RIP wird in der Simulation nicht berechnet (vorerst außerhalb)." };
const OFFEN_V6 = { art: "ausserhalb" as const, grund: "IPv6-Ping wird nicht simuliert (vorerst außerhalb)." };
const OFFEN_IPSEC = { art: "ausserhalb" as const, grund: "IPsec-Weiterleitung (Crypto-Map) wird nicht simuliert; nicht Teil dieses Auftrags." };

export const ORACLE: OracleRow[] = [
  { nr: 1, lab: "drill-pc-ips", quelle: "PC0", ziel: "192.168.50.12", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 2" },
  { nr: 2, lab: "drill-pc-ips", quelle: "PC0", ziel: "192.168.50.16", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 2" },
  { nr: 3, lab: "drill-interfaces", quelle: "R2", ziel: "10.0.0.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 2" },
  { nr: 4, lab: "drill-interfaces", quelle: "R1", ziel: "10.0.0.2", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify" },
  { nr: 5, lab: "basic-ip", quelle: "PC0", ziel: "192.168.1.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 6, lab: "basic-ip", quelle: "PC0", ziel: "192.168.1.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 7, lab: "basic-ip", quelle: "PC1", ziel: "192.168.1.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (von PC1)" },
  { nr: 8, lab: "basic-ip", quelle: "Router0", ziel: "192.168.1.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (von R1)" },
  { nr: 9, lab: "vlan-trunking", quelle: "PC0", ziel: "192.168.10.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 10, lab: "vlan-trunking", quelle: "PC0", ziel: "192.168.20.10", zustand: ZIEL, erwartet: "fehlschlag", beleg: "Schritt 4: „MUSS FEHLSCHLAGEN“ (anderes VLAN, kein Router)" },
  { nr: 11, lab: "vtp-dtp", quelle: "PC0", ziel: "192.168.10.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 7", offen: { art: "lab", grund: "SW1 `switchport mode dynamic desirable` ↔ SW2 `switchport mode trunk` + `nonegotiate`: SW2 sendet keine DTP-Frames, SW1 bleibt Access, kein Trunk (evaluateTrunk in vtp-status.ts; bekannter Fehler im Lab-Text, siehe KORREKTURVORSCHLAEGE-LABTEXT.md)." } },
  { nr: 12, lab: "etherchannel", quelle: "PC0", ziel: "192.168.1.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 13, lab: "stp", quelle: "PC0", ziel: "192.168.1.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 14, lab: "roas", quelle: "PC0", ziel: "192.168.20.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 15, lab: "ivr-svi", quelle: "PC-Sales", ziel: "192.168.20.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 16, lab: "static-routing", quelle: "PC0", ziel: "192.168.2.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5" },
  { nr: 17, lab: "rip-v1", quelle: "PC0", ziel: "192.168.3.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 7", offen: OFFEN_RIP },
  { nr: 18, lab: "rip-v2", quelle: "PC0", ziel: "192.168.3.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5", offen: OFFEN_RIP },
  { nr: 19, lab: "rip-v2-passive", quelle: "PC0", ziel: "192.168.0.11", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6", offen: OFFEN_RIP },
  { nr: 20, lab: "rip-v2-passive", quelle: "PC0", ziel: "192.168.1.11", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6", offen: OFFEN_RIP },
  { nr: 21, lab: "ospf", quelle: "PC0", ziel: "192.168.3.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 22, lab: "ospf-rid-wildcard", quelle: "PC-links", ziel: "192.168.4.11", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5" },
  { nr: 23, lab: "ospf-dr-bdr-election", quelle: "PC0", ziel: "192.168.4.11", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10" },
  { nr: 24, lab: "ospf-multiarea", quelle: "PC0", ziel: "192.168.3.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5" },
  { nr: 25, lab: "eigrp", quelle: "PC0", ziel: "192.168.3.10", zustand: NOSHUT("R1", "Gi0/2"), erwartet: "erfolg", beleg: "Schritt 5 (Baseline vor dem Failover-Test)" },
  { nr: 26, lab: "eigrp", quelle: "PC0", ziel: "192.168.3.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 7 / Verify: nach shutdown Gi0/2 weiter erfolgreich (DUAL-Failover über R2); der Zielzustand enthält den Shutdown" },
  { nr: 27, lab: "ipv6", quelle: "PC0", ziel: "2001:db8:2::10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4", offen: OFFEN_V6 },
  { nr: 28, lab: "ipv6-static", quelle: "R1-1", ziel: "2001:DB8:CCAF:254::1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5", offen: OFFEN_V6 },
  { nr: 29, lab: "ipv6-static", quelle: "R1-1", ziel: "2001:DB8:CCA2:254::2:1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6", offen: OFFEN_V6 },
  { nr: 30, lab: "ospfv3-ipv6", quelle: "PC0", ziel: "2001:db8:2::10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4", offen: OFFEN_V6 },
  { nr: 31, lab: "ipv6-ospfv3-eigrpv6", quelle: "PC0", ziel: "PC1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6/9", offen: OFFEN_V6 },
  { nr: 32, lab: "ipv6-ospfv3-eigrpv6", quelle: "PC0", ziel: "PC2", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6/9", offen: OFFEN_V6 },
  { nr: 33, lab: "ipv6-ospfv3-eigrpv6", quelle: "PC1", ziel: "PC2", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6/9", offen: OFFEN_V6 },
  { nr: 34, lab: "dhcp", quelle: "PC0", ziel: "PC1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5 (PC1 voraussichtlich .12)", offen: { art: "simulation", grund: "DHCP-Clients haben ohne Lease keine Adresse (Schritt 5)." } },
  { nr: 35, lab: "nat-pat", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6", offen: { art: "simulation", grund: "PAT (overload) wird nicht übersetzt; Antwort an die private Adresse findet keine Route (Schritt 6)." } },
  { nr: 36, lab: "nat-pat", quelle: "Webserver", ziel: "200.0.0.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify", hinweis: "Lab-Text erwartet Fehlschlag. 200.0.0.1 ist die eigene Outside-Adresse des NAT-Routers; IOS beantwortet Pings an eigene Interface-Adressen auch mit PAT. Korrekturvorschlag Labtext." },
  { nr: 37, lab: "dynamic-nat", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6", offen: { art: "simulation", grund: "Dynamisches NAT (Pool) wird nicht übersetzt (Schritt 6)." } },
  { nr: 38, lab: "dynamic-nat", quelle: "Webserver", ziel: "200.0.0.10", zustand: ZIEL, erwartet: "fehlschlag", beleg: "Schritt 7 / Verify: ohne aktiven NAT-Eintrag Fehlschlag" },
  { nr: 39, lab: "dynamic-nat", quelle: "Webserver", ziel: "200.0.0.10", zustand: ZIEL, vorher: { quelle: "PC0", ziel: "47.11.8.15" }, erwartet: "erfolg", beleg: "Schritt 7 / Verify: sofort nach dem PC0-Ping erfolgreich", offen: { art: "simulation", grund: "Keine Translation-Tabelle im Simulationszustand (Schritt 6)." } },
  { nr: 40, lab: "nat-pool-overload", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 7", offen: { art: "simulation", grund: "Pool mit Overload wird nicht übersetzt (Schritt 6)." } },
  { nr: 41, lab: "nat-pool-overload", quelle: "PC0(1)", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (PC0/PC0(1)/PC0(2))", offen: { art: "lab", grund: "Lab-Text nennt das Gateway für PC0(1)/PC0(2) („Gleiche Vorgehensweise … Gateway = NAT-Router Gig0/0“), die Topologie übernimmt es nicht (lab-to-network)." } },
  { nr: 42, lab: "static-nat", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 43, lab: "static-nat", quelle: "Webserver", ziel: "200.0.0.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5" },
  { nr: 44, lab: "hsrp", quelle: "PC0", ziel: "192.168.1.1", zustand: NOSHUT("R1", "Gi0/0"), erwartet: "erfolg", beleg: "Schritt 4 (Baseline, R1 Active)" },
  { nr: 45, lab: "hsrp", quelle: "PC0", ziel: "192.168.1.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4 / Verify: nach R1-Ausfall weiter erfolgreich (R2 Active); der Zielzustand enthält den Shutdown" },
  { nr: 46, lab: "gre-tunnel", quelle: "R1-1", ziel: "2.2.2.2", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4" },
  { nr: 47, lab: "gre-tunnel", quelle: "PC0", ziel: "192.168.2.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10" },
  { nr: 48, lab: "ipsec-s2s-vpn", quelle: "Hamburg", ziel: "200.0.0.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 9" },
  { nr: 49, lab: "ipsec-s2s-vpn", quelle: "PC0", ziel: "192.168.2.10", zustand: { id: "ohne-ipsec" }, erwartet: "fehlschlag", beleg: "Schritt 9: vor IPsec MUSS fehlschlagen (Core routet keine privaten Netze)" },
  { nr: 50, lab: "ipsec-s2s-vpn", quelle: "PC0", ziel: "192.168.2.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 17", offen: OFFEN_IPSEC },
  { nr: 51, lab: "ipsec-s2s-vpn", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "fehlschlag", beleg: "Schritt 18: scheitert am fehlenden Rückweg (kein NAT)" },
  { nr: 52, lab: "port-security", quelle: "PC1", ziel: "192.168.1.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 3 / Verify (vor der Gegenprobe)" },
  { nr: 53, lab: "acl-standard", quelle: "PC0", ziel: "192.168.3.100", zustand: { id: "ohne-acl" }, erwartet: "erfolg", beleg: "Schritt 2 (Baseline vor der ACL)" },
  { nr: 54, lab: "acl-standard", quelle: "PC1", ziel: "192.168.3.100", zustand: { id: "ohne-acl" }, erwartet: "erfolg", beleg: "Schritt 2 (Baseline vor der ACL)" },
  { nr: 55, lab: "acl-standard", quelle: "PC0", ziel: "192.168.3.100", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4 / Verify" },
  { nr: 56, lab: "acl-standard", quelle: "PC1", ziel: "192.168.3.100", zustand: ZIEL, erwartet: "fehlschlag", grund: "acl-deny", beleg: "Schritt 4 / Verify (UUUUU)" },
  { nr: 57, lab: "acl-extended", quelle: "PC1", ziel: "192.168.2.100", zustand: { id: "ohne-acl" }, erwartet: "erfolg", beleg: "Schritt 2 (Baseline vor der ACL)" },
  { nr: 58, lab: "acl-extended", quelle: "PC1", ziel: "192.168.2.100", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 4 / Verify (ICMP nicht betroffen)" },
  { nr: 59, lab: "vlan-hopping", quelle: "PC0", ziel: "192.168.10.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5 / Verify" },
  { nr: 60, lab: "co-acl-nat-isp", quelle: "VPC-9", ziel: "200.10.20.20", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 12" },
    { nr: 61, lab: "co-acl-nat-isp", quelle: "R-PC", ziel: "200.10.20.20", zustand: ZIEL, erwartet: "fehlschlag", grund: "acl-deny", beleg: "Verify „R-PC kann WEB-1 anpingen“", hinweis: "Lab-Verify erwartet Erfolg. Die ACL out-in auf CO-1 (Et0/1 in) erlaubt echo-reply nur an 20.30.10.1–.3; die Antwort an R-PC (20.30.10.100) trifft das implizite deny. Korrekturvorschlag Labtext." },
  { nr: 62, lab: "co-acl-nat-isp", quelle: "USER_PC", ziel: "45.35.55.10", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 12 / Verify" },
  { nr: 63, lab: "co-acl-nat-isp", quelle: "CO-1", ziel: "200.10.20.20", quelleIp: "192.168.10.1", zustand: ZIEL, erwartet: "fehlschlag", grund: "invalid-source", beleg: "Verify: ping 200.10.20.20 source 192.168.10.1", hinweis: "Wörtlich auf CO-1 ungültig: 192.168.10.1 gehört VPC-9, nicht CO-1 (IOS: „Invalid source address“). Gemeint ist der Ping von VPC-9 (Zeile 60). Korrekturvorschlag Labtext." },
  { nr: 64, lab: "ios-backup-upgrade", quelle: "R1", ziel: "TFTP-Server", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 1", offen: { art: "lab", grund: "Adressen von R1 und TFTP-Server sind im Lab nicht angegeben (10.1.1.10 nur im Ping-Befehl)." } },
  { nr: 65, lab: "vlan-dhcp-nat-roas", quelle: "PC0", ziel: "PC2", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10 (Inter-VLAN zu einem Grün-PC)", offen: { art: "simulation", grund: "DHCP-Lease (Schritt 5) und RoaS-Subinterfaces (Schritt 2) fehlen." } },
  { nr: 66, lab: "vlan-dhcp-nat-roas", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10 / Verify", offen: { art: "simulation", grund: "DHCP (Schritt 5), RoaS (Schritt 2) und PAT (Schritt 6) fehlen." } },
  { nr: 67, lab: "vlan-dhcp-nat-roas", quelle: "PC3", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10 / Verify", offen: { art: "simulation", grund: "DHCP (Schritt 5), Trunk-VLAN und RoaS (Schritt 2) und PAT (Schritt 6) fehlen." } },
  { nr: 68, lab: "vlan-dhcp-nat-roas", quelle: "PC1", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (alle VLANs)", offen: { art: "simulation", grund: "DHCP (Schritt 5), RoaS (Schritt 2) und PAT (Schritt 6) fehlen." } },
  { nr: 69, lab: "vlan-dhcp-nat-roas", quelle: "PC2", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (alle VLANs)", offen: { art: "simulation", grund: "DHCP (Schritt 5), RoaS (Schritt 2) und PAT (Schritt 6) fehlen." } },
  { nr: 70, lab: "vlan-vtp-dhcp-campus", quelle: "PC Rot (an SW1)", ziel: "PC Rot (an SW3)", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6 (gleiches VLAN über zwei Trunk-Hops)", offen: { art: "simulation", grund: "DHCP (Schritt 5) und Trunk-VLAN (Schritt 2) fehlen." } },
  { nr: 71, lab: "vlan-vtp-dhcp-campus", quelle: "PC Rot (an SW1)", ziel: "PC Blau (an SW1)", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6 (Inter-VLAN über R1)", offen: { art: "simulation", grund: "DHCP (Schritt 5) und RoaS (Schritt 2) fehlen." } },
  { nr: 72, lab: "vlan-vtp-dhcp-campus", quelle: "PC Rot (an SW1)", ziel: "PC Grün (an SW2)", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6 (Trunk-Hops und Inter-VLAN)", offen: { art: "simulation", grund: "DHCP (Schritt 5), Trunk-VLAN und RoaS (Schritt 2) fehlen." } },
];

// ─── Zustände ───────────────────────────────────────────────────────

function findDevice(topology: NetworkTopology, name: string): TopologyDevice | undefined {
  return topology.devices.find((d) => d.name === name || d.config?.hostname === name);
}

export function applyState(topology: NetworkTopology, state: OracleState): NetworkTopology {
  const t: NetworkTopology = structuredClone(topology);
  if (state.id === "ohne-acl") {
    for (const d of t.devices) {
      for (const i of d.interfaces) {
        delete i.inboundAcl;
        delete i.outboundAcl;
      }
    }
  } else if (state.id === "ohne-ipsec") {
    for (const d of t.devices) {
      for (const i of d.interfaces) delete i.cryptoMap;
      if (d.config) delete d.config.crypto;
    }
  } else if (state.id === "shutdown" || state.id === "no-shutdown") {
    const down = state.id === "shutdown";
    const dev = findDevice(t, state.device);
    const iface = dev?.interfaces.find((i) => i.name === state.iface);
    if (!dev || !iface) throw new Error(`Zustand: ${state.device} ${state.iface} nicht gefunden`);
    iface.isShutdown = down;
    iface.status = down ? "admin-down" : "up";
    for (const l of t.links) {
      const touches =
        (l.sourceDeviceId === dev.id && l.sourceInterfaceId === iface.id) ||
        (l.targetDeviceId === dev.id && l.targetInterfaceId === iface.id);
      if (!touches) continue;
      l.status = down ? "down" : "up";
      const peerDev = t.devices.find((d) => d.id === (l.sourceDeviceId === dev.id ? l.targetDeviceId : l.sourceDeviceId));
      const peerIf = peerDev?.interfaces.find((i) => i.id === (l.sourceDeviceId === dev.id ? l.targetInterfaceId : l.sourceInterfaceId));
      if (peerIf) peerIf.status = down ? "down" : "up";
    }
  }
  return t;
}

export function stateLabel(state: OracleState): string {
  if (state.id === "ziel") return "Zielzustand";
  if (state.id === "ohne-acl") return "Zielzustand ohne ACL-Bindungen (vor der ACL)";
  if (state.id === "ohne-ipsec") return "Zielzustand ohne Crypto-Map (vor IPsec)";
  if (state.id === "no-shutdown") return `Zielzustand mit ${state.device} ${state.iface} no shutdown (Baseline vor dem Test)`;
  return `Zielzustand, ${state.device} ${state.iface} shutdown`;
}

// ─── Ausführung ─────────────────────────────────────────────────────

export interface OracleOutcome {
  row: OracleRow;
  result: SimulationResult;
  /** tatsächlicher Verwerfungsgrund (bei Fehlschlag) */
  reason?: string;
  erfuellt: boolean;
}

export function dropReasonOf(result: SimulationResult): string | undefined {
  if (result.success) return undefined;
  return result.allHops.find((h) => h.status === "dropped")?.dropReason ?? result.status;
}

function resolveTarget(topology: NetworkTopology, ziel: string): { targetDeviceId?: string; targetIp?: string } {
  if (/^[0-9.]+$/.test(ziel) || ziel.includes(":")) return { targetIp: ziel };
  const dev = findDevice(topology, ziel);
  if (!dev) throw new Error(`Ziel ${ziel} nicht gefunden`);
  return { targetDeviceId: dev.id };
}

export function runOracleRow(row: OracleRow): OracleOutcome {
  const lab = LABS.find((l) => l.id === row.lab);
  const data = CURATED_TOPOLOGIES[row.lab];
  if (!lab || !data) throw new Error(`Lab ${row.lab} nicht gefunden`);
  const base = buildNetworkTopologyFromLab(lab, data, "target").topology;
  const topology = applyState(base, row.zustand);
  const arpCache: Record<string, Record<string, string>> = {};

  const ping = (quelle: string, ziel: string, quelleIp?: string) => {
    const src = findDevice(topology, quelle);
    if (!src) throw new Error(`Quelle ${quelle} nicht gefunden`);
    const options = { topology, sourceDeviceId: src.id, ...resolveTarget(topology, ziel), arpCache, ...(quelleIp ? { sourceIp: quelleIp } : {}) } as SimulationOptions;
    return simulatePing(options);
  };

  if (row.vorher) ping(row.vorher.quelle, row.vorher.ziel);
  const result = ping(row.quelle, row.ziel, row.quelleIp);
  const reason = dropReasonOf(result);
  const erfuellt =
    row.erwartet === "erfolg" ? result.success : !result.success && (!row.grund || reason === row.grund);
  return { row, result, reason, erfuellt };
}

export function describeOutcome(o: OracleOutcome): string {
  return o.result.success ? `${o.result.iosSummary} (Erfolg)` : `${o.result.iosSummary} (${o.reason}): ${o.result.explanation}`;
}

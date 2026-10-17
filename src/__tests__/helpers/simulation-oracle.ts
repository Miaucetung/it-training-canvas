import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { simulatePing } from "@/lib/topology/simulation/packet-simulator";
import { analyzeFailover, applyFailoverAction, convergenceTimeline, snapshotNetwork, type FailoverAction } from "@/lib/topology/failover";
import type { NatTable } from "@/lib/topology/simulation/nat-simulation";
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
  | { id: "no-shutdown"; device: string; iface: string }
  /** Zielzustand bzw. ein anderer Basiszustand, danach Ausfall-Aktionen in dieser Reihenfolge (applyFailoverAction) */
  | { id: "aktionen"; basis?: OracleState; schritte: OracleStep[] };

/** Ausfall-Aktion wie im Canvas: Verbindung am Interface trennen/wiederherstellen, Interface shutdown/no shutdown */
export interface OracleStep {
  aktion: "trennen" | "wiederherstellen" | "shutdown" | "no-shutdown";
  device: string;
  iface: string;
}

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
const AUS = (schritte: OracleStep[], basis?: OracleState): OracleState => ({ id: "aktionen", schritte, ...(basis ? { basis } : {}) });
const TRENNEN = (device: string, iface: string): OracleStep => ({ aktion: "trennen", device, iface });
const SHUT = (device: string, iface: string): OracleStep => ({ aktion: "shutdown", device, iface });
const NOSHUT_STEP = (device: string, iface: string): OracleStep => ({ aktion: "no-shutdown", device, iface });
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
  { nr: 34, lab: "dhcp", quelle: "PC0", ziel: "PC1", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 5 (simulierte Vergabe: PC0 .11, PC1 .12 nach excluded .1–.10)" },
  { nr: 35, lab: "nat-pat", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6" },
  { nr: 36, lab: "nat-pat", quelle: "Webserver", ziel: "200.0.0.1", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify", hinweis: "Lab-Text erwartet Fehlschlag. 200.0.0.1 ist die eigene Outside-Adresse des NAT-Routers; IOS beantwortet Pings an eigene Interface-Adressen auch mit PAT. Korrekturvorschlag Labtext." },
  { nr: 37, lab: "dynamic-nat", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6" },
  { nr: 38, lab: "dynamic-nat", quelle: "Webserver", ziel: "200.0.0.10", zustand: ZIEL, erwartet: "fehlschlag", beleg: "Schritt 7 / Verify: ohne aktiven NAT-Eintrag Fehlschlag" },
  { nr: 39, lab: "dynamic-nat", quelle: "Webserver", ziel: "200.0.0.10", zustand: ZIEL, vorher: { quelle: "PC0", ziel: "47.11.8.15" }, erwartet: "erfolg", beleg: "Schritt 7 / Verify: sofort nach dem PC0-Ping erfolgreich" },
  { nr: 40, lab: "nat-pool-overload", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 7" },
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
  { nr: 65, lab: "vlan-dhcp-nat-roas", quelle: "PC0", ziel: "PC2", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10 (Inter-VLAN zu einem Grün-PC)" },
  { nr: 66, lab: "vlan-dhcp-nat-roas", quelle: "PC0", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10 / Verify" },
  { nr: 67, lab: "vlan-dhcp-nat-roas", quelle: "PC3", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 10 / Verify" },
  { nr: 68, lab: "vlan-dhcp-nat-roas", quelle: "PC1", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (alle VLANs)" },
  { nr: 69, lab: "vlan-dhcp-nat-roas", quelle: "PC2", ziel: "47.11.8.15", zustand: ZIEL, erwartet: "erfolg", beleg: "Verify (alle VLANs)" },
  { nr: 70, lab: "vlan-vtp-dhcp-campus", quelle: "PC Rot (an SW1)", ziel: "PC Rot (an SW3)", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6 (gleiches VLAN über zwei Trunk-Hops)" },
  { nr: 71, lab: "vlan-vtp-dhcp-campus", quelle: "PC Rot (an SW1)", ziel: "PC Blau (an SW1)", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6 (Inter-VLAN über R1)" },
  { nr: 72, lab: "vlan-vtp-dhcp-campus", quelle: "PC Rot (an SW1)", ziel: "PC Grün (an SW2)", zustand: ZIEL, erwartet: "erfolg", beleg: "Schritt 6 (Trunk-Hops und Inter-VLAN)" },
  // Ausfall-Szenarien (Phase 2): Ping im konvergierten Zustand nach der Aktion
  { nr: 73, lab: "stp", quelle: "PC0", ziel: "192.168.1.20", zustand: AUS([TRENNEN("SW2", "Gi0/1")]), erwartet: "erfolg", beleg: "Ausfall-Szenario: Root-Link SW1 Gi0/1 – SW2 Gi0/1 getrennt, der Alternate-Port Gi0/2 übernimmt (Verify: ein Port RP, der andere BLK)" },
  { nr: 74, lab: "stp", quelle: "PC0", ziel: "192.168.1.20", zustand: AUS([TRENNEN("SW2", "Gi0/1"), TRENNEN("SW2", "Gi0/2")]), erwartet: "fehlschlag", beleg: "Ausfall-Szenario: beide Verbindungen zwischen SW1 und SW2 getrennt" },
  { nr: 75, lab: "etherchannel", quelle: "PC0", ziel: "192.168.1.20", zustand: AUS([TRENNEN("SW1", "Fa0/1")]), erwartet: "erfolg", beleg: "Ausfall-Szenario: ein Member getrennt, Po1 bleibt mit Fa0/2 up" },
  { nr: 76, lab: "etherchannel", quelle: "PC0", ziel: "192.168.1.20", zustand: AUS([SHUT("SW1", "Fa0/1"), SHUT("SW1", "Fa0/2")]), erwartet: "fehlschlag", beleg: "Ausfall-Szenario: beide Member shutdown, Po1 down" },
  { nr: 77, lab: "ospf", quelle: "PC0", ziel: "192.168.3.10", zustand: AUS([TRENNEN("R1", "Gi0/2")]), erwartet: "erfolg", beleg: "Ausfall-Szenario: direkte Verbindung R1 – R3 getrennt, OSPF routet über R2" },
  { nr: 78, lab: "eigrp", quelle: "PC0", ziel: "192.168.3.10", zustand: AUS([TRENNEN("R1", "Gi0/1")]), erwartet: "fehlschlag", beleg: "Ausfall-Szenario: nach dem Lab-Shutdown von Gi0/2 zusätzlich R1 – R2 getrennt, kein Weg mehr" },
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
    return applyFailoverAction(t, toFailoverAction(t, { aktion: state.id, device: state.device, iface: state.iface }));
  } else if (state.id === "aktionen") {
    return failoverActions(applyState(t, state.basis ?? ZIEL), state.schritte).after;
  }
  return t;
}

/** Ausfall-Aktion des Orakels → Aktion des Canvas (Gerät/Interface per Name) */
export function toFailoverAction(topology: NetworkTopology, step: OracleStep): FailoverAction {
  const dev = findDevice(topology, step.device);
  const iface = dev?.interfaces.find((i) => i.name === step.iface);
  if (!dev || !iface) throw new Error(`Zustand: ${step.device} ${step.iface} nicht gefunden`);
  if (step.aktion === "shutdown" || step.aktion === "no-shutdown") {
    return { kind: step.aktion, deviceId: dev.id, ifaceId: iface.id };
  }
  const link = topology.links.find(
    (l) => (l.sourceDeviceId === dev.id && l.sourceInterfaceId === iface.id) || (l.targetDeviceId === dev.id && l.targetInterfaceId === iface.id),
  );
  if (!link) throw new Error(`Zustand: an ${step.device} ${step.iface} hängt keine Verbindung`);
  return { kind: step.aktion === "trennen" ? "link-down" : "link-up", linkId: link.id };
}

/** Aktionen nacheinander anwenden (jede wird gegen den jeweils aktuellen Zustand aufgelöst) */
export function failoverActions(topology: NetworkTopology, steps: OracleStep[]): { after: NetworkTopology; actions: FailoverAction[] } {
  let cur = topology;
  const actions: FailoverAction[] = [];
  for (const step of steps) {
    const action = toFailoverAction(cur, step);
    actions.push(action);
    cur = applyFailoverAction(cur, action);
  }
  return { after: cur, actions };
}

export function stateLabel(state: OracleState): string {
  if (state.id === "ziel") return "Zielzustand";
  if (state.id === "ohne-acl") return "Zielzustand ohne ACL-Bindungen (vor der ACL)";
  if (state.id === "ohne-ipsec") return "Zielzustand ohne Crypto-Map (vor IPsec)";
  if (state.id === "no-shutdown") return `Zielzustand mit ${state.device} ${state.iface} no shutdown (Baseline vor dem Test)`;
  if (state.id === "aktionen") {
    const steps = state.schritte.map((s) => `${s.device} ${s.iface} ${s.aktion === "trennen" ? "getrennt" : s.aktion === "wiederherstellen" ? "wiederhergestellt" : s.aktion}`);
    return `${state.basis ? stateLabel(state.basis) : "Zielzustand"}, danach ${steps.join(", ")}`;
  }
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
  const natTranslations: NatTable = {};

  const ping = (quelle: string, ziel: string, quelleIp?: string) => {
    const src = findDevice(topology, quelle);
    if (!src) throw new Error(`Quelle ${quelle} nicht gefunden`);
    const options = {
      topology,
      sourceDeviceId: src.id,
      ...resolveTarget(topology, ziel),
      arpCache,
      natTranslations,
      ...(quelleIp ? { sourceIp: quelleIp } : {}),
    } as SimulationOptions;
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


// ─── Ausfall-Szenarien: Zustand und Konvergenz ─────────────────────────

export type AusfallPruefung =
  /** STP-Port: Rolle und Zustand, z. B. "Root FWD 4"; "fehlt" ohne Port */
  | { art: "stp"; device: string; iface: string }
  /** Routing-Tabelle: Zeile zum Präfix; "fehlt" ohne Route */
  | { art: "route"; device: string; prefix: string }
  /** HSRP: Zustand der Gruppe auf dem Interface */
  | { art: "hsrp"; device: string; iface: string; gruppe: number }
  /** Port-Channel: Zustand, Member und Kosten */
  | { art: "port-channel"; device: string; po: string }
  /** Zeitpunkt einer Änderung im Modus „realistische Zeiten“ (Sekunden nach der Aktion) */
  | { art: "konvergenz"; device: string; subject: string };

export interface AusfallRow {
  nr: string;
  lab: string;
  /** Zustand vor den Aktionen */
  basis: OracleState;
  /** Aktionen, nach denen geprüft wird (bei „konvergenz“: die analysierte Aktion) */
  aktionen: OracleStep[];
  pruefung: AusfallPruefung;
  /** erwarteter Wert; bei Routen genügt ein enthaltener Teil (z. B. "via 10.0.12.2") */
  erwartet: string;
  beleg: string;
  offen?: { art: "simulation" | "lab" | "ausserhalb"; grund: string };
}

const OFFEN_HSRP_TRACK = {
  art: "lab" as const,
  grund: "R1 trackt Gi0/1 (Abzug 30), Gi0/1 ist im Lab weder konfiguriert noch verbunden: Priority 80 < 100, R2 bleibt Active; der Lab-Text erwartet R1 Active (KORREKTURVORSCHLAEGE-LABTEXT.md Abschnitt 13).",
};

export const AUSFALL: AusfallRow[] = [
  // stp: SW1 Root, SW2 Gi0/1 Root-Port, Gi0/2 Alternate
  { nr: "A1", lab: "stp", basis: ZIEL, aktionen: [], pruefung: { art: "stp", device: "SW2", iface: "Gi0/2" }, erwartet: "Altn BLK 4", beleg: "Verify: SW2 ein Port RP, der andere BLK" },
  { nr: "A2", lab: "stp", basis: ZIEL, aktionen: [TRENNEN("SW2", "Gi0/1")], pruefung: { art: "stp", device: "SW2", iface: "Gi0/2" }, erwartet: "Root FWD 4", beleg: "Ausfall-Szenario: Root-Link getrennt, Alternate wird Root-Port" },
  { nr: "A3", lab: "stp", basis: ZIEL, aktionen: [TRENNEN("SW2", "Gi0/1")], pruefung: { art: "konvergenz", device: "SW2", subject: "Gi0/2" }, erwartet: "30", beleg: "802.1D, direkter Ausfall: Listening + Learning = 2 × Forward Delay 15 s (Standardtimer)" },
  { nr: "A4", lab: "stp", basis: AUS([TRENNEN("SW2", "Gi0/1")]), aktionen: [{ aktion: "wiederherstellen", device: "SW2", iface: "Gi0/1" }], pruefung: { art: "stp", device: "SW2", iface: "Gi0/2" }, erwartet: "Altn BLK 4", beleg: "Wiederherstellung: Gi0/1 wird wieder Root-Port, Gi0/2 blockiert" },
  { nr: "A5", lab: "stp", basis: AUS([TRENNEN("SW2", "Gi0/1")]), aktionen: [{ aktion: "wiederherstellen", device: "SW2", iface: "Gi0/1" }], pruefung: { art: "konvergenz", device: "SW2", subject: "Gi0/1" }, erwartet: "30", beleg: "Wiederhergestellter Port durchläuft Listening + Learning (2 × 15 s)" },
  // etherchannel
  { nr: "A6", lab: "etherchannel", basis: ZIEL, aktionen: [], pruefung: { art: "port-channel", device: "SW1", po: "Po1" }, erwartet: "up, Member Fa0/1, Fa0/2, STP-Kosten 12", beleg: "Schritt 3/4: Po1 aus Fa0/1 und Fa0/2" },
  { nr: "A7", lab: "etherchannel", basis: ZIEL, aktionen: [TRENNEN("SW1", "Fa0/1")], pruefung: { art: "port-channel", device: "SW1", po: "Po1" }, erwartet: "up, Member Fa0/2, STP-Kosten 19", beleg: "Ausfall-Szenario: ein Member aus, Channel bleibt up, Kosten 19" },
  { nr: "A8", lab: "etherchannel", basis: ZIEL, aktionen: [TRENNEN("SW1", "Fa0/1")], pruefung: { art: "stp", device: "SW2", iface: "Po1" }, erwartet: "Root FWD 19", beleg: "Ausfall-Szenario: Root-Port bleibt Po1, Kosten 12 → 19" },
  { nr: "A9", lab: "etherchannel", basis: ZIEL, aktionen: [TRENNEN("SW1", "Fa0/1")], pruefung: { art: "konvergenz", device: "SW1", subject: "Po1" }, erwartet: "0", beleg: "Member-Ausfall ohne STP-Neuberechnung des Weges" },
  { nr: "A10", lab: "etherchannel", basis: ZIEL, aktionen: [SHUT("SW1", "Fa0/1"), SHUT("SW1", "Fa0/2")], pruefung: { art: "port-channel", device: "SW1", po: "Po1" }, erwartet: "down (kein aktiver Member)", beleg: "Ausfall-Szenario: alle Member shutdown" },
  // hsrp (Zielzustand enthält shutdown R1 Gi0/0)
  { nr: "A11", lab: "hsrp", basis: ZIEL, aktionen: [], pruefung: { art: "hsrp", device: "R2", iface: "Gi0/0", gruppe: 1 }, erwartet: "Active", beleg: "Abschlusstest: nach shutdown R1 Gi0/0 hat R2 die Active-Rolle" },
  { nr: "A12", lab: "hsrp", basis: ZIEL, aktionen: [], pruefung: { art: "hsrp", device: "R1", iface: "Gi0/0", gruppe: 1 }, erwartet: "Init", beleg: "Abschlusstest: R1 Gi0/0 shutdown, HSRP in Init" },
  { nr: "A13", lab: "hsrp", basis: NOSHUT("R1", "Gi0/0"), aktionen: [], pruefung: { art: "hsrp", device: "R1", iface: "Gi0/0", gruppe: 1 }, erwartet: "Active", beleg: "Baseline: R1 Active (Priority 110)", offen: OFFEN_HSRP_TRACK },
  { nr: "A14", lab: "hsrp", basis: ZIEL, aktionen: [NOSHUT_STEP("R1", "Gi0/0")], pruefung: { art: "hsrp", device: "R1", iface: "Gi0/0", gruppe: 1 }, erwartet: "Active", beleg: "Abschlusstest: nach no shutdown holt Preempt R1 zurück", offen: OFFEN_HSRP_TRACK },
  // eigrp (Zielzustand enthält shutdown R1 Gi0/2)
  { nr: "A15", lab: "eigrp", basis: ZIEL, aktionen: [], pruefung: { art: "route", device: "R1", prefix: "192.168.3.0/24" }, erwartet: "via 10.0.12.2", beleg: "„DUAL-Failover testen“: 192.168.3.0/24 über 10.0.12.2 (R2)" },
  { nr: "A16", lab: "eigrp", basis: NOSHUT("R1", "Gi0/2"), aktionen: [], pruefung: { art: "route", device: "R1", prefix: "192.168.3.0/24" }, erwartet: "via 10.0.13.2 (Gi0/2)", beleg: "Baseline: direkter Weg über R3, vor dem Failover-Test" },
  { nr: "A17", lab: "eigrp", basis: NOSHUT("R1", "Gi0/2"), aktionen: [SHUT("R1", "Gi0/2")], pruefung: { art: "konvergenz", device: "R1", subject: "192.168.3.0/24" }, erwartet: "0", beleg: "„Failover in unter einer Sekunde“ (eigenes Interface, Feasible Successor)" },
  { nr: "A18", lab: "eigrp", basis: ZIEL, aktionen: [NOSHUT_STEP("R1", "Gi0/2")], pruefung: { art: "route", device: "R1", prefix: "192.168.3.0/24" }, erwartet: "via 10.0.13.2 (Gi0/2)", beleg: "„Danach: no shutdown“: Wiederherstellung des direkten Weges" },
  // floating-static (Zielzustand enthält shutdown R1 Gi0/0)
  { nr: "A19", lab: "floating-static", basis: ZIEL, aktionen: [], pruefung: { art: "route", device: "R1", prefix: "0.0.0.0/0" }, erwartet: "[200/0] via 10.2.2.1", beleg: "„Failover testen“: S* 0.0.0.0/0 [200/0] via 10.2.2.1" },
  { nr: "A20", lab: "floating-static", basis: NOSHUT("R1", "Gi0/0"), aktionen: [], pruefung: { art: "route", device: "R1", prefix: "0.0.0.0/0" }, erwartet: "[1/0] via 10.1.1.1", beleg: "Baseline: primäre Default-Route AD 1 über 10.1.1.1" },
  { nr: "A21", lab: "floating-static", basis: NOSHUT("R1", "Gi0/0"), aktionen: [SHUT("R1", "Gi0/0")], pruefung: { art: "konvergenz", device: "R1", subject: "0.0.0.0/0" }, erwartet: "0", beleg: "Statische Route folgt dem Interface sofort" },
  // ospf
  { nr: "A22", lab: "ospf", basis: ZIEL, aktionen: [TRENNEN("R1", "Gi0/2")], pruefung: { art: "route", device: "R1", prefix: "192.168.3.0/24" }, erwartet: "via 10.0.12.2 (Gi0/1)", beleg: "Ausfall-Szenario: direkte Verbindung R1 – R3 getrennt" },
  { nr: "A23", lab: "ospf", basis: ZIEL, aktionen: [TRENNEN("R1", "Gi0/2")], pruefung: { art: "konvergenz", device: "R1", subject: "192.168.3.0/24" }, erwartet: "0", beleg: "Eigenes Interface down: neues LSA sofort (SPF-Zeit nicht modelliert)" },
];

/** Zustandsabhängige Lab-Schritte, die das Orakel ausdrücklich nicht modelliert */
export const AUSGELASSEN: Array<{ lab: string; schritt: string; grund: string }> = [
  { lab: "port-security", schritt: "PC1-Kabel abziehen, PC3 an Fa0/1 anschließen", grund: "Umstecken eines fremden Geräts (neue MAC) und err-disabled durch die Violation werden nicht simuliert." },
  { lab: "ospf-dr-bdr-election", schritt: "8) Neuwahl erzwingen: clear ip ospf process", grund: "Kein Ausfall: Neustart des OSPF-Prozesses; die DR/BDR-Wahl wird im Modell nur für den Endzustand berechnet." },
];

function lookupCheck(topology: NetworkTopology, p: AusfallPruefung): string {
  const snap = snapshotNetwork(topology);
  const dev = findDevice(topology, "device" in p ? p.device : "");
  if (!dev) throw new Error(`Gerät nicht gefunden: ${JSON.stringify(p)}`);
  if (p.art === "stp") return snap.stpPorts.get(`${dev.id}|${p.iface}`)?.text ?? "fehlt";
  if (p.art === "route") return snap.routes.get(`${dev.id}|${p.prefix}`)?.text ?? "fehlt";
  if (p.art === "hsrp") return snap.hsrp.get(`${dev.id}|${p.iface} Gruppe ${p.gruppe}`)?.state ?? "fehlt";
  if (p.art === "port-channel") return snap.portChannels.get(`${dev.id}|${p.po}`)?.text ?? "fehlt";
  return "fehlt";
}

export interface AusfallOutcome {
  row: AusfallRow;
  ist: string;
  erfuellt: boolean;
}

export function runAusfallRow(row: AusfallRow): AusfallOutcome {
  const lab = LABS.find((l) => l.id === row.lab);
  const data = CURATED_TOPOLOGIES[row.lab];
  if (!lab || !data) throw new Error(`Lab ${row.lab} nicht gefunden`);
  const before = applyState(buildNetworkTopologyFromLab(lab, data, "target").topology, row.basis);
  const { after, actions } = failoverActions(before, row.aktionen);
  let ist: string;
  if (row.pruefung.art === "konvergenz") {
    const p = row.pruefung;
    const analysis = analyzeFailover(before, actions, after);
    const events = convergenceTimeline(before, after, actions, analysis.changes, "realistisch");
    const ev = events.find((e) => e.change.deviceName === p.device && e.change.subject === p.subject && e.change.kind !== "interface");
    ist = ev ? String(ev.t) : "keine Änderung";
  } else {
    ist = lookupCheck(after, row.pruefung);
  }
  const erfuellt = row.pruefung.art === "route" ? ist.includes(row.erwartet) : ist === row.erwartet;
  return { row, ist, erfuellt };
}

export function ausfallLabel(row: AusfallRow): string {
  const p = row.pruefung;
  const what =
    p.art === "stp" ? `STP ${p.device} ${p.iface}` :
    p.art === "route" ? `Route ${p.device} ${p.prefix}` :
    p.art === "hsrp" ? `HSRP ${p.device} ${p.iface} Gruppe ${p.gruppe}` :
    p.art === "port-channel" ? `${p.device} ${p.po}` :
    `Konvergenz ${p.device} ${p.subject} (s)`;
  const zustand = row.aktionen.length ? stateLabel({ id: "aktionen", basis: row.basis, schritte: row.aktionen }) : stateLabel(row.basis);
  return `${row.nr}. ${row.lab}: ${what} (${zustand}) erwartet ${row.erwartet}`;
}

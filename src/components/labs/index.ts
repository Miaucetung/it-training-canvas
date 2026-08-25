import type { LabScenario } from "./types";

export type { CommandBlock, LabStep, LabScenario } from "./types";

import { DRILL_LABS } from "./drills";
import { LAYER2_LABS } from "./layer2";
import { ROUTING_LABS } from "./routing";
import { IPV6_LABS } from "./ipv6";
import { SERVICES_LABS } from "./services";
import { SECURITY_LABS } from "./security";
import { AUTOMATION_LABS } from "./automation";
import { OPERATIONS_LABS } from "./operations";
import { CAMPUS_LABS } from "./campus";

export const LABS: LabScenario[] = [
  ...DRILL_LABS,
  ...LAYER2_LABS,
  ...ROUTING_LABS,
  ...IPV6_LABS,
  ...SERVICES_LABS,
  ...SECURITY_LABS,
  ...AUTOMATION_LABS,
  ...OPERATIONS_LABS,
  ...CAMPUS_LABS,
];

// ── Didaktisch-kognitive Lernreihenfolge ─────────────────────
// Prinzip (Sweller / Bloom): Fundament → Werkzeug → L2 → L3 → Dienste → Security → Wireless → Automation → Betrieb
// Voraussetzungskette beachtet: z.B. STP vor EtherChannel, Static vor OSPF, SSH früh als Admin-Werkzeug.
const LAB_ORDER: string[] = [
  // ── Drills: Muskelgedächtnis für Grundbefehle ────────────
  "drill-grundkonfig",    // Hostname/Secret/Console/VTY — Voraussetzung für jedes weitere Lab
  "drill-interfaces",     // ip address + no shutdown — Voraussetzung für IP-Konfiguration
  "drill-pc-ips",         // statische IPs vergeben
  "drill-access-ports",   // interface range + mode access — Voraussetzung für VLAN-Labs

  // ── Layer 2 + IP-Grundlagen ───────────────────────────────
  "basic-ip",             // erste vollständige Ende-zu-Ende-Topologie
  "ssh",                  // Admin-Werkzeug: früh lernen, in JEDEM weiteren Lab nutzbar
  "vlan-trunking",        // VLANs + 802.1Q-Trunks — Voraussetzung für STP/EtherChannel/RoaS
  "stp",                  // STP MUSS vor EtherChannel: EC wurde erfunden, um STP-Blocking zu umgehen
  "vtp-dtp",              // VTP/DTP setzt VLAN + Trunk + STP-Verständnis voraus
  "etherchannel",         // Link-Aggregation als STP-Alternative (erst nach STP verständlich)

  // ── IP-Dienste (Grundlage vor Routing-Szenarien) ──────────
  "dhcp",                 // DHCP früh: PCs in den meisten Labs per DHCP, nicht statisch

  // ── Layer 3: Routing (konkret → abstrakt) ─────────────────
  "static-routing",       // statische Routen — konkretester Einstieg in L3
  "floating-static",      // Erweiterung: Backup-Route mit AD
  "roas",                 // Inter-VLAN via Router — braucht VLANs + Routing
  "ivr-svi",              // Inter-VLAN via L3-Switch — Alternative zu RoaS
  "rip-v1",               // historische Baseline (classful, Grenzen zeigen)
  "rip-v2",               // classless RIP mit version 2 + no auto-summary
  "rip-v2-passive",       // 4-Router-Variante, passive-interface, Metrik-Analyse
  "ospf",                 // OSPF Single Area — wichtigstes Protokoll im CCNA
  "ospf-rid-wildcard",    // Loopback-RID, Wildcard-Drill
  "ospf-dr-bdr-election", // DR/BDR auf Multi-Access (setzt OSPF-Grundverständnis voraus)
  "ospf-multiarea",       // Multi-Area, ABR, LSA-Typen
  "eigrp",                // Advanced Distance-Vector, DUAL (nach OSPF gut vergleichbar)

  // ── IPv6 (nach IPv4-Routing beherrscht) ───────────────────
  "ipv6",                 // IPv6-Grundkonfiguration
  "ipv6-static",          // Statische IPv6-Routen
  "ospfv3-ipv6",          // OSPFv3 — analoge Konzepte zu OSPFv2
  "ipv6-ospfv3-eigrpv6",  // OSPFv3 + EIGRPv6 kombiniert, AD-Koexistenz

  // ── IP-Dienste Advanced ────────────────────────────────────
  "dhcp-relay",           // ip helper-address — braucht VLAN + Routing-Verständnis
  "nat-pat",              // PAT/Overload — braucht Routing-Grundverständnis
  "dynamic-nat",          // NAT-Pool — Variante zu PAT
  "nat-pool-overload",    // NAT-Pool + Overload — Pool mit PAT kombiniert (200.0.0.0/29)
  "static-nat",           // 1:1 Static NAT — feste Zuordnung, eingehende Verbindungen möglich
  "vlan-dhcp-nat-roas",   // Campus-Integration: VLAN + VTP + DTP + RoaS + DHCP + PAT
  "ntp-syslog-snmp",      // Management-Protokolle
  "hsrp",                 // FHRP — braucht Routing + Redundanz-Konzept
  "gre-tunnel",           // Site-to-Site VPN über Internet
  "ipsec-s2s-vpn",        // Verschlüsselter Site-to-Site VPN (IKE/IPSec) — Fortsetzung von GRE

  // ── Security: einfach → komplex ───────────────────────────
  "device-hardening",     // Banner, Password-Policy, Login-Block
  "port-security",        // MAC-Begrenzung auf Access-Ports
  "acl-standard",         // Standard-ACL (nur Quelle)
  "acl-extended",         // Extended ACL (Proto/Quelle/Ziel/Port)
  "dhcp-snooping-dai",    // Anti-Spoofing-Trio (braucht DHCP + VLAN)
  "stp-hardening",        // Root Guard, BPDU Guard, Loop Guard
  "vlan-hopping",         // VLAN-Hopping + Mitigation (setzt VLAN/STP voraus)
  "aaa-radius-tacacs",    // Zentrales AAA (fortgeschrittene Security, RADIUS)
  "co-acl-nat-isp",       // ACL + Static NAT Dual-Site (CO-1 EIGRP, CO-2 OSPF, ISP-MUMBAI)

  // ── Automatisierung & Monitoring ──────────────────────────
  "netflow",              // Traffic-Analyse
  "restconf",             // REST API mit HTTPS/JSON
  "netconf-yang",         // NETCONF über SSH

  // ── Betrieb & Troubleshooting (Konsolidierung am Ende) ────
  "password-recovery",    // ROMMON/Boot-Loader — Notfallprozedur
  "ios-backup-upgrade",   // TFTP-Backup + IOS-Upgrade
  "layer1-issues",        // CRC, Duplex-Mismatch, Interface-Counter
  "troubleshooting-cheat",
  "dhcp-troubleshoot-lab",
  "vlan-vtp-dhcp-campus", // Umfassendes Campus-Szenario (integriert L2+L3+DHCP)
];

/** Labs in didaktisch begründeter Reihenfolge. Nicht gefundene IDs werden ans Ende gesetzt. */
export const LABS_ORDERED: LabScenario[] = [
  ...LAB_ORDER.map((id) => LABS.find((l) => l.id === id)).filter(
    (l): l is LabScenario => l !== undefined,
  ),
  ...LABS.filter((l) => !LAB_ORDER.includes(l.id)),
];

import type { ToolId } from "@/lib/types";

/**
 * Didaktischer Lernpfad für das CCNA-Dashboard (freigegeben am 2026-10-14, siehe docs/dashboard-didaktik.md).
 * Reihenfolge nach Voraussetzungen, nicht nach Blueprint-Nummern. Jedes Thema, Quiz und Lab kommt genau einmal vor
 * (Ausnahme: `routing-ospf` in den Schritten 7 und 8, mit je eigenem Anker in der Lektion).
 */

export interface PathLesson {
  topicId: string;
  /** Konzept-ID in der Lektion; die Lektion öffnet direkt an dieser Stelle */
  anchor?: string;
}

export interface LearningStep {
  id: string;
  number: number;
  title: string;
  /** ein Satz in einfacher Sprache: worum es geht */
  summary: string;
  lessons: PathLesson[];
  quizIds: string[];
  labIds: string[];
  /** Simulatoren und Drills (Tool-IDs der App) */
  toolIds: ToolId[];
  /** Schritte, auf denen dieser Schritt aufbaut (Empfehlung, keine Sperre) */
  prerequisiteStepIds: string[];
}

export const TOOL_LABELS: Record<ToolId, string> = {
  "osi-simulator": "OSI-Simulator",
  "vlan-simulator": "VLAN-Simulator",
  "stp-simulator": "STP-Simulator",
  "routing-simulator": "Routing-Simulator",
  "subnetting-drill": "Subnetting-Drill",
  "subnetting-quiz": "Subnetting-Quiz",
  "subnetting-cheatsheet": "Subnetting-Cheatsheet",
  "ipv4-subnet-table": "IPv4-Subnetztabelle",
  "ipv6-calculator": "IPv6-Rechner",
  "routing-drill": "Routing-Drill",
  "ospf-wildcard-drill": "OSPF-Wildcard-Drill",
  "acl-drill": "ACL-Drill",
  "verkabelung-trainer": "Verkabelungs-Trainer",
  "dragdrop-trainer": "Drag-and-Drop-Trainer",
  "topologie-explorer": "Topologie-Erkunder",
  "cli-glossary": "CLI-Glossar",
};

export const LEARNING_STEPS: LearningStep[] = [
  {
    id: "s01-grundlagen",
    number: 1,
    title: "Netzwerkgrundlagen und OSI/TCP-IP",
    summary: "Wie Daten durch ein Netzwerk wandern: Schichtenmodelle, Protokolle und die wichtigsten Geräte.",
    lessons: [{ topicId: "networking-fundamentals" }],
    quizIds: ["ccna-quiz-netzwerkgrundlagen", "ccna-quiz-tag1-grundlagen"],
    labIds: [],
    toolIds: ["osi-simulator", "topologie-explorer"],
    prerequisiteStepIds: [],
  },
  {
    id: "s02-ios-cli",
    number: 2,
    title: "Cisco IOS CLI",
    summary: "Das Werkzeug für alle Labs: Befehlsmodi, Grundkonfiguration und die wichtigsten show-Befehle.",
    lessons: [{ topicId: "ios-cli" }],
    quizIds: ["ccna-quiz-ios-cli"],
    labIds: ["drill-grundkonfig"],
    toolIds: ["cli-glossary"],
    prerequisiteStepIds: ["s01-grundlagen"],
  },
  {
    id: "s03-ethernet",
    number: 3,
    title: "Ethernet, Kabel und Switching",
    summary: "Kupfer und Glasfaser, Stecker, Dämpfung und Fehler auf Schicht 1.",
    lessons: [{ topicId: "verkabelung" }, { topicId: "glasfaser" }],
    quizIds: ["ccna-quiz-glasfaser"],
    labIds: ["layer1-issues"],
    toolIds: ["verkabelung-trainer"],
    prerequisiteStepIds: ["s01-grundlagen"],
  },
  {
    id: "s04-ipv4",
    number: 4,
    title: "IPv4-Adressierung und Subnetting",
    summary: "Adressen, Subnetzmasken und Subnetze berechnen und auf Geräten einrichten.",
    lessons: [{ topicId: "ipv4-addressing" }, { topicId: "subnet-segmentation" }],
    quizIds: ["ccna-quiz-ipv4", "ccna-quiz-segmentierung"],
    labIds: ["basic-ip", "drill-pc-ips", "drill-interfaces"],
    toolIds: ["subnetting-drill", "subnetting-quiz", "subnetting-cheatsheet", "ipv4-subnet-table"],
    prerequisiteStepIds: ["s02-ios-cli"],
  },
  {
    id: "s05-vlans",
    number: 5,
    title: "VLANs und Trunks",
    summary: "Ein Switch, mehrere getrennte Netze: VLANs, Trunks und Routing zwischen VLANs.",
    lessons: [{ topicId: "switching-vlans" }, { topicId: "vlan-advanced" }],
    quizIds: ["ccna-quiz-switching", "quiz-vlan-advanced", "ccna-quiz-roas"],
    labIds: ["vlan-trunking", "drill-access-ports", "vtp-dtp", "roas", "ivr-svi"],
    toolIds: ["vlan-simulator"],
    prerequisiteStepIds: ["s03-ethernet", "s04-ipv4"],
  },
  {
    id: "s06-stp",
    number: 6,
    title: "STP und EtherChannel",
    summary: "Schleifen im Switch-Netz verhindern und Leitungen bündeln.",
    lessons: [{ topicId: "stp" }, { topicId: "etherchannel" }],
    quizIds: ["ccna-quiz-stp", "ccna-quiz-etherchannel", "ccna-quiz-tag1-wiederholung"],
    labIds: ["stp", "etherchannel"],
    toolIds: ["stp-simulator"],
    prerequisiteStepIds: ["s05-vlans"],
  },
  {
    id: "s07-routing",
    number: 7,
    title: "Statisches Routing und Routingtabelle",
    summary: "Wie ein Router den Weg wählt: Routingtabelle, statische Routen, Floating Static und RIP.",
    lessons: [{ topicId: "routing-ospf", anchor: "routing-fundamentals" }],
    quizIds: ["ccna-quiz-static-routing", "ccna-quiz-rip", "ccna-quiz-admin-distance"],
    labIds: ["static-routing", "floating-static", "rip-v1", "rip-v2", "rip-v2-passive"],
    toolIds: ["routing-simulator", "routing-drill"],
    prerequisiteStepIds: ["s04-ipv4", "s05-vlans"],
  },
  {
    id: "s08-ospf",
    number: 8,
    title: "OSPF (EIGRP als Vertiefung)",
    summary: "Dynamisches Routing mit OSPF: Nachbarn, Router-ID, DR/BDR und mehrere Areas.",
    lessons: [{ topicId: "routing-ospf", anchor: "ospf" }],
    quizIds: ["ccna-quiz-ospf", "ccna-quiz-eigrp"],
    labIds: ["ospf", "ospf-rid-wildcard", "ospf-dr-bdr-election", "ospf-multiarea", "eigrp"],
    toolIds: ["routing-simulator", "ospf-wildcard-drill"],
    prerequisiteStepIds: ["s07-routing"],
  },
  {
    id: "s09-ipv6",
    number: 9,
    title: "IPv6",
    summary: "Die neuen Adressen: Aufbau, Konfiguration, statisches und dynamisches Routing mit IPv6.",
    lessons: [{ topicId: "ipv6" }],
    quizIds: ["ccna-quiz-ipv6"],
    labIds: ["ipv6", "ipv6-static", "ospfv3-ipv6", "ipv6-ospfv3-eigrpv6"],
    toolIds: ["ipv6-calculator"],
    prerequisiteStepIds: ["s04-ipv4", "s07-routing"],
  },
  {
    id: "s10-services",
    number: 10,
    title: "IP-Services (DHCP, NAT, DNS, NTP/Syslog/SNMP, FHRP, QoS)",
    summary: "Dienste im Netz: Adressen automatisch vergeben, Adressen übersetzen, Zeit, Logging, Redundanz und Priorisierung.",
    lessons: [
      { topicId: "dhcp-nat" },
      { topicId: "nat" },
      { topicId: "dns" },
      { topicId: "device-management" },
      { topicId: "fhrp" },
      { topicId: "qos" },
    ],
    quizIds: ["ccna-quiz-dhcp", "ccna-quiz-nat", "ccna-quiz-device-management", "ccna-quiz-fhrp", "ccna-quiz-qos"],
    labIds: ["dhcp", "nat-pat", "dynamic-nat", "nat-pool-overload", "static-nat", "ntp-syslog-snmp", "ios-backup-upgrade", "password-recovery", "dhcp-relay", "hsrp"],
    toolIds: [],
    prerequisiteStepIds: ["s07-routing"],
  },
  {
    id: "s11-security",
    number: 11,
    title: "Security",
    summary: "Geräte und Netze absichern: Passwörter, SSH, Zugriffslisten (ACL), Port Security und Schutz vor Angriffen im LAN.",
    lessons: [{ topicId: "security" }, { topicId: "acl" }],
    quizIds: ["ccna-quiz-security", "ccna-quiz-harden-access", "ccna-quiz-dhcp-snooping-dai", "ccna-quiz-acl", "ccna-quiz-port-security"],
    labIds: ["ssh", "device-hardening", "port-security", "acl-standard", "acl-extended", "dhcp-snooping-dai", "stp-hardening", "vlan-hopping", "aaa-radius-tacacs", "co-acl-nat-isp"],
    toolIds: ["acl-drill"],
    prerequisiteStepIds: ["s05-vlans", "s07-routing", "s10-services"],
  },
  {
    id: "s12-wan-vpn",
    number: 12,
    title: "WAN und VPN",
    summary: "Standorte über das Internet verbinden: WAN-Arten, GRE-Tunnel und IPsec.",
    lessons: [{ topicId: "wan" }],
    quizIds: ["ccna-quiz-wan-vpn"],
    labIds: ["gre-tunnel", "ipsec-s2s-vpn"],
    toolIds: [],
    prerequisiteStepIds: ["s08-ospf", "s11-security"],
  },
  {
    id: "s13-wireless",
    number: 13,
    title: "Wireless",
    summary: "WLAN-Architekturen, Access Points, Controller und Verschlüsselung.",
    lessons: [{ topicId: "wlan" }],
    quizIds: ["ccna-quiz-wlan"],
    labIds: [],
    toolIds: [],
    prerequisiteStepIds: ["s01-grundlagen"],
  },
  {
    id: "s14-automation",
    number: 14,
    title: "Controller, Virtualisierung und Automation",
    summary: "Netze per Controller und Programm steuern: SDN, REST-APIs, Datenformate, Virtualisierung und Cloud.",
    lessons: [{ topicId: "sdn-controller" }, { topicId: "automation" }, { topicId: "ccna-virtualization" }],
    quizIds: ["ccna-quiz-sdn", "ccna-quiz-automation", "ccna-quiz-virtualization"],
    labIds: ["netflow", "restconf", "netconf-yang"],
    toolIds: [],
    prerequisiteStepIds: ["s10-services"],
  },
  {
    id: "s15-pruefung",
    number: 15,
    title: "Troubleshooting und Prüfungsvorbereitung",
    summary: "Fehler systematisch finden und das Gelernte in Prüfungssimulationen und Abschluss-Labs testen.",
    lessons: [{ topicId: "troubleshooting" }],
    quizIds: [
      "ccna-quiz-troubleshooting",
      "ccna-quiz-gesamtpruefung",
      "ccna-quiz-gesamtpruefung-2",
      "ccna-quiz-cis1-klausur",
      "ccna-quiz-cis2-klausur",
      "ccna-quiz-cis3-klausur",
    ],
    labIds: ["troubleshooting-cheat", "dhcp-troubleshoot-lab", "vlan-dhcp-nat-roas", "vlan-vtp-dhcp-campus"],
    toolIds: ["dragdrop-trainer"],
    prerequisiteStepIds: ["s05-vlans", "s07-routing", "s08-ospf", "s10-services", "s11-security"],
  },
];

export function getStep(id: string): LearningStep | undefined {
  return LEARNING_STEPS.find((s) => s.id === id);
}

/** Schritte, in denen ein Thema vorkommt (für „Passende Labs“ in der Lektion). */
export function stepsForTopic(topicId: string): LearningStep[] {
  return LEARNING_STEPS.filter((s) => s.lessons.some((l) => l.topicId === topicId));
}

/** Schritt, in dem ein Lab vorkommt. */
export function stepForLab(labId: string): LearningStep | undefined {
  return LEARNING_STEPS.find((s) => s.labIds.includes(labId));
}

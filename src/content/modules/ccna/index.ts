// ============================================================
// CCNA Module Index
// Assembles all topics/concepts/quizzes into a CertificationModule
// and registers it with the contentRegistry.
// ============================================================

import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule } from "@/lib/content/types";
import type { Exercise } from "@/lib/content/types";
import type { LearningPath } from "@/lib/types";

// ── Topic + Concept imports ──────────────────────────────────
import { AUTOMATION_CONCEPTS, TOPIC_AUTOMATION } from "./topics/automation";
import {
  DEVICE_MANAGEMENT_CONCEPTS,
  TOPIC_DEVICE_MANAGEMENT,
} from "./topics/device-management";
import {
  DHCP_NAT_CONCEPTS,
  TOPIC_DHCP_NAT,
  TOPIC_NAT,
  TOPIC_DNS,
} from "./topics/dhcp-nat";
import { FHRP_CONCEPTS, TOPIC_FHRP } from "./topics/fhrp";
import { IOS_CLI_CONCEPTS, TOPIC_IOS_CLI } from "./topics/ios-cli";
import { IPV4_CONCEPTS, TOPIC_IPV4_ADDRESSING } from "./topics/ipv4-addressing";
import { IPV6_CONCEPTS, TOPIC_IPV6 } from "./topics/ipv6";
import {
  NETWORKING_FUNDAMENTALS_CONCEPTS,
  TOPIC_NETWORKING_FUNDAMENTALS,
} from "./topics/networking-fundamentals";
import { QOS_CONCEPTS, TOPIC_QOS } from "./topics/qos";
import { ROUTING_CONCEPTS, TOPIC_ROUTING_OSPF } from "./topics/routing-ospf";
import { SDN_CONCEPTS, TOPIC_SDN } from "./topics/sdn-controller";
import { SECURITY_CONCEPTS, TOPIC_SECURITY, TOPIC_ACL } from "./topics/security";
import {
  SWITCHING_CONCEPTS,
  TOPIC_SWITCHING_VLANS,
  TOPIC_STP,
  TOPIC_ETHERCHANNEL,
} from "./topics/switching-vlans";
import {
  TOPIC_TROUBLESHOOTING,
  TROUBLESHOOTING_CONCEPTS,
} from "./topics/troubleshooting";
import { TOPIC_WAN, WAN_CONCEPTS } from "./topics/wan";
import {
  TOPIC_VERKABELUNG,
  TOPIC_GLASFASER,
  VERKABELUNG_CONCEPTS,
} from "./topics/verkabelung";
import {
  TOPIC_VLAN_ADVANCED,
  VLAN_ADVANCED_CONCEPTS,
} from "./topics/vlan-advanced";
import { TOPIC_WLAN, WLAN_CONCEPTS } from "./topics/wlan";
import {
  TOPIC_VIRTUALIZATION,
  VIRTUALIZATION_CONCEPTS,
} from "./topics/virtualization";
import {
  TOPIC_SUBNET_SEGMENTATION,
  SUBNET_SEGMENTATION_CONCEPTS,
} from "./topics/subnet-segmentation";

// ── Existing quiz registry (unchanged) ──────────────────────
import { CCNA_QUIZZES } from "@/lib/ccna-quiz-content";

// ────────────────────────────────────────────────────────────
// Learning Paths
// ────────────────────────────────────────────────────────────
const CCNA_LEARNING_PATHS: Record<string, LearningPath> = {
  "ccna-full-path": {
    id: "ccna-full-path",
    title: "CCNA 200-301 Komplettkurs",
    description:
      "Vollständiger Lernpfad für die Cisco CCNA 200-301 Prüfung — von Netzwerkgrundlagen bis Prüfungssimulation.",
    subject: "CCNA",
    difficulty: "intermediate",
    estimatedMinutes: 1860,
    tags: ["ccna", "cisco", "networking", "certification"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    // ── Didaktische Begründung der Reihenfolge ──────────────────
    // Prinzip: Vorwissen → Werkzeug → Konzept → Protokoll → Dienst → Sicherheit → Fortgeschritten → Abschluss
    // Kognitive Lerntheorie (Sweller): einfach → komplex, konkret → abstrakt.
    // Bloomsche Taxonomie: Erinnern → Verstehen → Anwenden → Analysieren.
    // Cisco-Blueprint-Gewichtung: IP Connectivity (25%) > Network Fundamentals + Network Access (20% each).
    steps: [
      // ── Block 1: Fundament (OSI, TCP/IP, Modelle) ──────────────
      {
        id: "step-1-netzwerkgrundlagen",
        title: "Netzwerkgrundlagen & OSI-Modell",
        description:
          "OSI-Modell, TCP/IP-Stack, Protokolle und Netzwerkkomponenten — das konzeptuelle Fundament für alle weiteren Themen.",
        type: "info",
        order: 1,
        completed: false,
        hints: [],
      },
      {
        id: "step-2-quiz-netzwerkgrundlagen",
        title: "Quiz: Netzwerkgrundlagen",
        description: "Teste dein Wissen über OSI-Modell und Netzwerkkonzepte.",
        type: "quiz",
        order: 2,
        completed: false,
        quizId: "ccna-quiz-netzwerkgrundlagen",
        hints: [],
      },

      // ── Block 2: CLI-Werkzeug (muss VOR IP-Konfiguration sitzen) ─
      // Begründung: Die CLI ist das Werkzeug für ALLES Folgende.
      // Wer nicht weiß, wie man enable/configure terminal/show tippt,
      // kann kein einziges Routing- oder Security-Lab durchführen.
      {
        id: "step-3-ios-cli",
        title: "Cisco IOS CLI",
        description:
          "CLI-Modi (User/Privileged/Config), Grundbefehle, Interface-Management, SSH und show-Diagnose — das Handwerkzeug für alle weiteren Labs.",
        type: "info",
        order: 3,
        completed: false,
        hints: [],
      },
      {
        id: "step-4-quiz-ios-cli",
        title: "Quiz: Cisco IOS CLI",
        description: "CLI-Modi, Grundkonfig, SSH und Diagnose-Befehle testen.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "ccna-quiz-ios-cli",
        hints: [],
      },

      // ── Block 3: IPv4 — Kern-Adressierung (25% Prüfungsgewicht) ─
      {
        id: "step-5-ipv4",
        title: "IPv4-Adressierung & Subnetting",
        description:
          "CIDR, VLSM, Subnetting-Kalkulation, ARP und ICMP — Pflichtfundament für Routing und Security.",
        type: "info",
        order: 5,
        completed: false,
        hints: [],
      },
      {
        id: "step-6-quiz-ipv4",
        title: "Quiz: IPv4",
        description: "Subnetting-Aufgaben, VLSM-Kalkulation und IPv4-Konzepte.",
        type: "quiz",
        order: 6,
        completed: false,
        quizId: "ccna-quiz-ipv4",
        hints: [],
      },

      // ── Block 4: IPv6 (nach IPv4 — parallele Adressierungsstruktur) ─
      {
        id: "step-7-ipv6",
        title: "IPv6",
        description:
          "IPv6-Adressierung, EUI-64, NDP, SLAAC, DHCPv6 und Dual-Stack — direkt nach IPv4 eingeführt, da die Konzepte identisch sind.",
        type: "info",
        order: 7,
        completed: false,
        hints: [],
      },
      {
        id: "step-8-quiz-ipv6",
        title: "Quiz: IPv6",
        description: "IPv6-Adressen, NDP, SLAAC und Konfiguration testen.",
        type: "quiz",
        order: 8,
        completed: false,
        quizId: "ccna-quiz-ipv6",
        hints: [],
      },

      // ── Block 5: Layer 2 — Switching & VLANs (Network Access 20%) ─
      // Begründung: L2 (MAC, VLAN, STP) muss vor L3-Routing (OSPF, Inter-VLAN)
      // sitzen, weil OSPF-Nachbarschaften auf L2-Erreichbarkeit aufbauen.
      {
        id: "step-9-switching",
        title: "Switching & VLANs",
        description:
          "MAC-Tabellen, Ethernet-Frames, VLANs, 802.1Q-Trunking, STP/RSTP, PortFast, BPDU-Guard und EtherChannel.",
        type: "info",
        order: 9,
        completed: false,
        hints: [],
      },
      {
        id: "step-10-quiz-switching",
        title: "Quiz: Switching & VLANs",
        description: "MAC-Tabellen, VLANs, Trunking, STP und EtherChannel testen.",
        type: "quiz",
        order: 10,
        completed: false,
        quizId: "ccna-quiz-switching",
        hints: [],
      },

      // ── Block 6: Routing (IP Connectivity 25% — größter Blueprint-Block) ─
      // Begründung: Statisches Routing VOR OSPF — konkret vor abstrakt.
      // Inter-VLAN (RoaS/SVI) nach VLAN + Routing, da es beides verbindet.
      {
        id: "step-11-routing-ospf",
        title: "Routing — Statisch, OSPF & Inter-VLAN",
        description:
          "Statische Routen, Default-Route, Administrative Distanz, OSPF Single-/Multi-Area, Router-on-a-Stick und L3-Switch-SVI.",
        type: "info",
        order: 11,
        completed: false,
        hints: [],
      },
      {
        id: "step-12-quiz-ospf",
        title: "Quiz: Routing & OSPF",
        description: "Statisches Routing, OSPF, Cost, DR/BDR und Inter-VLAN testen.",
        type: "quiz",
        order: 12,
        completed: false,
        quizId: "ccna-quiz-ospf",
        hints: [],
      },

      // ── Block 7: IP-Dienste — DHCP & NAT (IP Services 10%) ──────
      // Begründung: DHCP und NAT sind isoliert verständlich und
      // logisch nach dem Routing-Grundverständnis platziert.
      {
        id: "step-13-dhcp-nat",
        title: "DHCP & NAT",
        description:
          "DORA-Prozess, DHCP-Pool und Relay (ip helper-address), NAT-Typen, PAT/Overload und ip nat inside/outside.",
        type: "info",
        order: 13,
        completed: false,
        hints: [],
      },
      {
        id: "step-14-quiz-dhcp",
        title: "Quiz: DHCP",
        description: "DHCP-Prozess, Pool-Konfiguration, Relay-Agent testen.",
        type: "quiz",
        order: 14,
        completed: false,
        quizId: "ccna-quiz-dhcp",
        hints: [],
      },
      {
        id: "step-15-quiz-nat",
        title: "Quiz: NAT",
        description: "Static/Dynamic NAT, PAT, Inside Local/Global testen.",
        type: "quiz",
        order: 15,
        completed: false,
        quizId: "ccna-quiz-nat",
        hints: [],
      },

      // ── Block 8: Netzwerk-Segmentierung (braucht Routing + VLANs) ─
      // Begründung: VLSM-Planung und DMZ-Konzepte setzen voraus,
      // dass man Routing UND VLANs bereits versteht — daher NACH Block 6.
      {
        id: "step-16-segmentierung",
        title: "Netzwerk-Segmentierung & VLSM-Design",
        description:
          "Sicherheitszonen (LAN/DMZ/WAN), VLSM-Planung, Enterprise-Subnetz-Design und Cisco IOS Konfiguration.",
        type: "info",
        order: 16,
        completed: false,
        hints: [],
      },
      {
        id: "step-17-quiz-segmentierung",
        title: "Quiz: Netzwerk-Segmentierung",
        description: "VLSM-Design, Sicherheitszonen, DMZ und Subnetz-Kalkulation.",
        type: "quiz",
        order: 17,
        completed: false,
        quizId: "ccna-quiz-segmentierung",
        hints: [],
      },

      // ── Block 9: Security Fundamentals (15%) ─────────────────────
      {
        id: "step-18-security",
        title: "Netzwerksicherheit",
        description:
          "ACLs (Standard + Extended), Port-Security, DHCP-Snooping, DAI, 802.1X, AAA und Geräte-Härtung.",
        type: "info",
        order: 18,
        completed: false,
        hints: [],
      },
      {
        id: "step-19-quiz-security",
        title: "Quiz: Security",
        description: "ACLs, Port-Security, DAI, 802.1X und Device Hardening testen.",
        type: "quiz",
        order: 19,
        completed: false,
        quizId: "ccna-quiz-security",
        hints: [],
      },

      // ── Block 10: WLAN (Network Access 20%) ──────────────────────
      {
        id: "step-20-wlan",
        title: "WLAN",
        description:
          "802.11-Standards, Frequenzbänder, WPA2/WPA3, CAPWAP, Cisco WLC und AP-Onboarding.",
        type: "info",
        order: 20,
        completed: false,
        hints: [],
      },
      {
        id: "step-21-quiz-wlan",
        title: "Quiz: WLAN",
        description: "802.11-Standards, WPA2/3, CAPWAP und WLC-Konzepte testen.",
        type: "quiz",
        order: 21,
        completed: false,
        quizId: "ccna-quiz-wlan",
        hints: [],
      },

      // ── Block 11: Device Management (IP Services 10%) ────────────
      {
        id: "step-22-device-management",
        title: "Device Management Protocols",
        description:
          "CDP/LLDP, NTP (Stratum, Auth), Syslog (Severity-Level), SNMPv3 (Auth+Priv) und TFTP-Backup.",
        type: "info",
        order: 22,
        completed: false,
        hints: [],
      },
      {
        id: "step-23-quiz-device-mgmt",
        title: "Quiz: Device Management",
        description: "CDP/LLDP, NTP, Syslog, SNMPv3 und TFTP testen.",
        type: "quiz",
        order: 23,
        completed: false,
        quizId: "ccna-quiz-device-management",
        hints: [],
      },

      // ── Block 12: FHRP (IP Services 10%) ─────────────────────────
      {
        id: "step-24-fhrp",
        title: "First Hop Redundancy (HSRP/VRRP/GLBP)",
        description:
          "Virtuelle IP/MAC, Active/Standby, Priority, Preempt und Object Tracking — setzt Routing-Verständnis voraus.",
        type: "info",
        order: 24,
        completed: false,
        hints: [],
      },
      {
        id: "step-25-quiz-fhrp",
        title: "Quiz: FHRP",
        description: "HSRP/VRRP/GLBP, Priority, Preemption und Object Tracking testen.",
        type: "quiz",
        order: 25,
        completed: false,
        quizId: "ccna-quiz-fhrp",
        hints: [],
      },

      // ── Block 13: QoS (IP Services 10%) ──────────────────────────
      {
        id: "step-26-qos",
        title: "Quality of Service",
        description:
          "Classification, Marking (DSCP/CoS), Queuing (LLQ/CBWFQ), Shaping/Policing und Trust Boundary.",
        type: "info",
        order: 26,
        completed: false,
        hints: [],
      },
      {
        id: "step-27-quiz-qos",
        title: "Quiz: QoS",
        description: "DSCP-Werte, Queuing-Mechanismen und Trust Boundary testen.",
        type: "quiz",
        order: 27,
        completed: false,
        quizId: "ccna-quiz-qos",
        hints: [],
      },

      // ── Block 14: WAN & VPN ───────────────────────────────────────
      {
        id: "step-28-wan-vpn",
        title: "WAN & VPN",
        description:
          "Mietleitung, MPLS, Metro-Ethernet, IPsec-VPN, GRE/DMVPN und Cisco SD-WAN.",
        type: "info",
        order: 28,
        completed: false,
        hints: [],
      },
      {
        id: "step-29-quiz-wan-vpn",
        title: "Quiz: WAN & VPN",
        description: "MPLS, IPsec, GRE/DMVPN und Cisco SD-WAN testen.",
        type: "quiz",
        order: 29,
        completed: false,
        quizId: "ccna-quiz-wan-vpn",
        hints: [],
      },

      // ── Block 15: Controller-Based Networking & Cloud (Automation 10%) ─
      {
        id: "step-30-sdn",
        title: "Controller-Based Networking & Cloud",
        description:
          "SDN-Planes (Data/Control/Management), Cisco DNA Center, SD-Access, Cloud-Modelle (IaaS/PaaS/SaaS) und Virtualisierung.",
        type: "info",
        order: 30,
        completed: false,
        hints: [],
      },
      {
        id: "step-31-quiz-sdn",
        title: "Quiz: SDN & Cloud",
        description: "Control/Data Plane, DNA Center, SD-Access und Cloud-Modelle testen.",
        type: "quiz",
        order: 31,
        completed: false,
        quizId: "ccna-quiz-sdn",
        hints: [],
      },

      // ── Block 16: Programmability & Automation (Automation 10%) ──
      {
        id: "step-32-automation",
        title: "Programmability & Automation",
        description:
          "REST APIs, JSON/YAML, NETCONF/RESTCONF, Ansible, Terraform und GitOps — setzt SDN-Konzeptverständnis voraus.",
        type: "info",
        order: 32,
        completed: false,
        hints: [],
      },
      {
        id: "step-33-quiz-automation",
        title: "Quiz: Automation",
        description: "REST APIs, NETCONF/RESTCONF, Ansible und Terraform testen.",
        type: "quiz",
        order: 33,
        completed: false,
        quizId: "ccna-quiz-automation",
        hints: [],
      },

      // ── Block 17: Troubleshooting (Querschnittsthema am Ende) ─────
      // Begründung: Troubleshooting setzt ALLE vorherigen Konzepte voraus
      // und konsolidiert sie. Es ist die «synthetische» Phase (Bloom: Analyze).
      {
        id: "step-34-troubleshooting",
        title: "Troubleshooting & Diagnose",
        description:
          "Methodisches Vorgehen (Top-Down/Bottom-Up), Extended Ping, Traceroute, Interface-Counter, err-disabled Recovery und Logging-Analyse.",
        type: "info",
        order: 34,
        completed: false,
        hints: [],
      },
      {
        id: "step-35-quiz-troubleshooting",
        title: "Quiz: Troubleshooting",
        description: "Diagnose-Methodik, Interface-Counter, err-disabled und ping/traceroute testen.",
        type: "quiz",
        order: 35,
        completed: false,
        quizId: "ccna-quiz-troubleshooting",
        hints: [],
      },

      // ── Block 18: Prüfungssimulation (LETZTER Schritt!) ──────────
      // Begründung: Die Simulation ist die Evaluations-Phase (Bloom: Evaluate).
      // Sie macht nur Sinn, wenn ALLE Themenblöcke abgeschlossen sind.
      // Vorher wäre sie lückenhaft und demotivierend.
      {
        id: "step-36-exam-sim",
        title: "Prüfungssimulation CCNA",
        description:
          "120-Minuten-Simulation mit 100 zufälligen Fragen aus allen CCNA-Themenbereichen — erst sinnvoll, wenn alle 17 Themenblöcke abgeschlossen sind.",
        type: "info",
        order: 36,
        completed: false,
        hints: [],
      },
    ],
  },
};

// ────────────────────────────────────────────────────────────
// Exercises (Canvas-basierte Praktika)
// ────────────────────────────────────────────────────────────
const CCNA_EXERCISES: Record<string, Exercise> = {
  "exercise-subnetting-design": {
    id: "exercise-subnetting-design",
    title: "VLSM-Subnetting-Design",
    description:
      "Plane für die fiktive Acme GmbH ein /24-Netz mit VLSM und visualisiere die Subnetze auf dem Canvas (LAN-A 50 H, LAN-B 25 H, LAN-C 10 H, 2 P2P-Links).",
    learningPathId: "ccna-full-path",
    canvasTemplateId: "tpl-basic-lan",
    estimatedMinutes: 45,
    difficulty: "beginner",
    conceptIds: ["subnetting", "subnetting-drill"],
  },
  "exercise-fhrp-failover": {
    id: "exercise-fhrp-failover",
    title: "HSRP-Failover-Demo",
    description:
      "Baue zwei Distribution-Router mit HSRP Group 1 (Virtual-IP 10.10.10.1). Setze Priorities (110/100), aktiviere Preemption, simuliere Uplink-Ausfall via Object Tracking und beobachte den Failover.",
    learningPathId: "ccna-full-path",
    canvasTemplateId: "tpl-basic-lan",
    estimatedMinutes: 60,
    difficulty: "intermediate",
    conceptIds: ["fhrp-overview", "hsrp"],
  },
  "exercise-qos-trust-boundary": {
    id: "exercise-qos-trust-boundary",
    title: "QoS Trust Boundary konfigurieren",
    description:
      "Setze auf einem Access-Switch eine QoS Trust Boundary an einem Cisco-IP-Phone-Port (mls qos trust device cisco-phone). Markiere Voice mit DSCP EF und priorisiere mit LLQ am Uplink.",
    learningPathId: "ccna-full-path",
    canvasTemplateId: "tpl-basic-lan",
    estimatedMinutes: 60,
    difficulty: "intermediate",
    conceptIds: ["qos-fundamentals", "qos-tools"],
  },
  "exercise-sdwan-overlay": {
    id: "exercise-sdwan-overlay",
    title: "SD-WAN Overlay skizzieren",
    description:
      "Skizziere ein SD-WAN-Overlay mit zwei cEdge-Routern (Hauptsitz + Filiale), MPLS- und Internet-Underlay, vManage/vSmart/vBond. Zeichne die App-Aware-Path-Auswahl für Voice-Traffic.",
    learningPathId: "ccna-full-path",
    canvasTemplateId: "tpl-aws-3tier",
    estimatedMinutes: 60,
    difficulty: "advanced",
    conceptIds: ["wan-technologies", "sd-wan"],
  },
  "exercise-acl-dmz": {
    id: "exercise-acl-dmz",
    title: "Extended ACL DMZ-Policy",
    description:
      "Implementiere die Named ACL DMZ-POLICY auf einem Cisco ISR mit drei Zonen (Internet, DMZ, Internes Netz). Erlaube HTTP/HTTPS zur DMZ, ICMP intern→DMZ, blockiere DMZ→Internes Netz.",
    learningPathId: "ccna-full-path",
    canvasTemplateId: "tpl-dmz",
    estimatedMinutes: 60,
    difficulty: "intermediate",
    conceptIds: ["acl-extended", "acl-named", "acl-troubleshooting"],
  },
};


const CCNA_MODULE: CertificationModule = {
  id: "ccna",
  vendor: "cisco",
  title: "Cisco CCNA 200-301",
  subtitle: "Networking Associate Certification",
  description:
    "Vollständiges Lernmodul für die Cisco CCNA 200-301 Prüfung. " +
    "Abdeckung: OSI/TCP-IP, IPv4/IPv6, Switching, Routing, OSPF, " +
    "DHCP, NAT, Security, QoS, WLAN und Cloud-Grundlagen.",
  difficulty: "intermediate",
  examCode: "200-301",
  estimatedHours: 31,
  prerequisites: [],
  relatedModules: ["az-900", "comptia-network-plus"],

  topics: [
    TOPIC_NETWORKING_FUNDAMENTALS,
    TOPIC_IOS_CLI,
    TOPIC_IPV4_ADDRESSING,
    TOPIC_SUBNET_SEGMENTATION,
    TOPIC_IPV6,
    TOPIC_SWITCHING_VLANS,
    TOPIC_STP,
    TOPIC_ETHERCHANNEL,
    TOPIC_VLAN_ADVANCED,
    TOPIC_VERKABELUNG,
    TOPIC_GLASFASER,
    TOPIC_ROUTING_OSPF,
    TOPIC_FHRP,
    TOPIC_DHCP_NAT,
    TOPIC_NAT,
    TOPIC_DNS,
    TOPIC_DEVICE_MANAGEMENT,
    TOPIC_SECURITY,
    TOPIC_ACL,
    TOPIC_QOS,
    TOPIC_WLAN,
    TOPIC_WAN,
    TOPIC_SDN,
    TOPIC_AUTOMATION,
    TOPIC_VIRTUALIZATION,
    TOPIC_TROUBLESHOOTING,
  ],

  concepts: {
    ...NETWORKING_FUNDAMENTALS_CONCEPTS,
    ...IOS_CLI_CONCEPTS,
    ...IPV4_CONCEPTS,
    ...SUBNET_SEGMENTATION_CONCEPTS,
    ...IPV6_CONCEPTS,
    ...SWITCHING_CONCEPTS,
    ...VLAN_ADVANCED_CONCEPTS,
    ...VERKABELUNG_CONCEPTS,
    ...ROUTING_CONCEPTS,
    ...FHRP_CONCEPTS,
    ...DHCP_NAT_CONCEPTS,
    ...DEVICE_MANAGEMENT_CONCEPTS,
    ...SECURITY_CONCEPTS,
    ...QOS_CONCEPTS,
    ...WLAN_CONCEPTS,
    ...WAN_CONCEPTS,
    ...SDN_CONCEPTS,
    ...AUTOMATION_CONCEPTS,
    ...VIRTUALIZATION_CONCEPTS,
    ...TROUBLESHOOTING_CONCEPTS,
  },

  quizzes: CCNA_QUIZZES,
  exercises: CCNA_EXERCISES,
  learningPaths: CCNA_LEARNING_PATHS,

  metadata: {
    slug: "ccna",
    tagline:
      "Cisco CCNA 200-301 — Netzwerkgrundlagen bis OSPF, Security & WLAN",
    objectives: [
      "OSI/TCP-IP Modell verstehen und anwenden",
      "Cisco IOS CLI bedienen, SSH absichern, Interfaces konfigurieren",
      "IPv4/IPv6 Adressierung und Subnetting beherrschen",
      "Switching: VLANs, STP, EtherChannel konfigurieren",
      "Routing: Statisch, OSPF Single-Area und Multi-Area",
      "First Hop Redundancy mit HSRP/VRRP/GLBP umsetzen",
      "Netzwerksicherheit: ACLs, Port-Security, DHCP Snooping, DAI",
      "Device Management: CDP/LLDP, NTP, Syslog, SNMPv3",
      "Quality of Service: Marking (DSCP/CoS), LLQ, Trust Boundary",
      "WLAN Grundlagen und Cisco Wireless-Architektur",
      "WAN-Architekturen, IPsec/GRE/DMVPN und SD-WAN einordnen",
      "DHCP, NAT/PAT konfigurieren und troubleshooten",
      "SDN-Konzepte, Cisco DNA Center und Cloud-Service-Modelle",
      "REST APIs, JSON/YAML, Ansible und Terraform anwenden",
      "Strukturierte Troubleshooting-Methodik einsetzen",
    ],
    targetAudience: [
      "Fachinformatiker Systemintegration (Azubis)",
      "IT-Einsteiger mit Interesse an Netzwerken",
      "CCNA-Prüfungskandidaten",
    ],
    previewImageUrl: "/assets/modules/ccna-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-28",
    certificationBody: "Cisco",
    certValidityMonths: 36,
    featured: true,
    categories: ["networking", "cisco", "enterprise", "certification"],
  },
};

// Auto-register on import — no manual registration needed
contentRegistry.register(CCNA_MODULE);

export default CCNA_MODULE;

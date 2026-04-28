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
import { DHCP_NAT_CONCEPTS, TOPIC_DHCP_NAT } from "./topics/dhcp-nat";
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
import { SECURITY_CONCEPTS, TOPIC_SECURITY } from "./topics/security";
import {
  SWITCHING_CONCEPTS,
  TOPIC_SWITCHING_VLANS,
} from "./topics/switching-vlans";
import {
  TOPIC_TROUBLESHOOTING,
  TROUBLESHOOTING_CONCEPTS,
} from "./topics/troubleshooting";
import { TOPIC_WAN, WAN_CONCEPTS } from "./topics/wan";
import { TOPIC_WLAN, WLAN_CONCEPTS } from "./topics/wlan";

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
    steps: [
      {
        id: "step-1-netzwerkgrundlagen",
        title: "Netzwerkgrundlagen & OSI-Modell",
        description:
          "Lerne die Grundlagen: OSI-Modell, TCP/IP-Protokolle und Netzwerkkomponenten.",
        type: "info",
        order: 1,
        completed: false,
        hints: [],
      },
      {
        id: "step-2-quiz-netzwerkgrundlagen",
        title: "Quiz: Netzwerkgrundlagen",
        description: "Teste dein Wissen über Netzwerkgrundlagen.",
        type: "quiz",
        order: 2,
        completed: false,
        quizId: "ccna-quiz-netzwerkgrundlagen",
        hints: [],
      },
      {
        id: "step-3-ipv4",
        title: "IPv4-Adressierung & Subnetting",
        description: "Verstehe CIDR, Subnetting, ARP und ICMP.",
        type: "info",
        order: 3,
        completed: false,
        hints: [],
      },
      {
        id: "step-4-quiz-ipv4",
        title: "Quiz: IPv4",
        description: "Subnetting-Aufgaben und IPv4-Konzepte.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "ccna-quiz-ipv4",
        hints: [],
      },
      {
        id: "step-5-ipv6",
        title: "IPv6",
        description: "IPv6-Adressierung, NDP, SLAAC und DHCPv6.",
        type: "info",
        order: 5,
        completed: false,
        hints: [],
      },
      {
        id: "step-6-quiz-ipv6",
        title: "Quiz: IPv6",
        description: "IPv6-Konzepte testen.",
        type: "quiz",
        order: 6,
        completed: false,
        quizId: "ccna-quiz-ipv6",
        hints: [],
      },
      {
        id: "step-7-switching",
        title: "Switching & VLANs",
        description: "MAC-Tabellen, VLANs, Trunking, STP und EtherChannel.",
        type: "info",
        order: 7,
        completed: false,
        hints: [],
      },
      {
        id: "step-8-routing-ospf",
        title: "Routing & OSPF",
        description: "Statisches Routing, OSPF und Inter-VLAN Routing.",
        type: "info",
        order: 8,
        completed: false,
        hints: [],
      },
      {
        id: "step-9-quiz-ospf",
        title: "Quiz: OSPF",
        description: "OSPF-Konfiguration und Konzepte.",
        type: "quiz",
        order: 9,
        completed: false,
        quizId: "ccna-quiz-ospf",
        hints: [],
      },
      {
        id: "step-10-dhcp-nat",
        title: "DHCP & NAT",
        description: "DHCP-Prozess, Relay, Snooping und NAT/PAT.",
        type: "info",
        order: 10,
        completed: false,
        hints: [],
      },
      {
        id: "step-11-quiz-dhcp",
        title: "Quiz: DHCP",
        description: "DHCP-Konzepte und Konfiguration testen.",
        type: "quiz",
        order: 11,
        completed: false,
        quizId: "ccna-quiz-dhcp",
        hints: [],
      },
      {
        id: "step-12-quiz-nat",
        title: "Quiz: NAT",
        description: "NAT/PAT-Konzepte testen.",
        type: "quiz",
        order: 12,
        completed: false,
        quizId: "ccna-quiz-nat",
        hints: [],
      },
      {
        id: "step-13-security",
        title: "Netzwerksicherheit",
        description: "ACLs, Port-Security, DAI und 802.1X.",
        type: "info",
        order: 13,
        completed: false,
        hints: [],
      },
      {
        id: "step-14-quiz-security",
        title: "Quiz: Security",
        description: "Sicherheitskonzepte und ACLs testen.",
        type: "quiz",
        order: 14,
        completed: false,
        quizId: "ccna-quiz-security",
        hints: [],
      },
      {
        id: "step-15-wlan",
        title: "WLAN",
        description: "802.11-Standards, WPA2/3 und Cisco WLC.",
        type: "info",
        order: 15,
        completed: false,
        hints: [],
      },
      {
        id: "step-16-quiz-wlan",
        title: "Quiz: WLAN",
        description: "WLAN-Konzepte und Sicherheit testen.",
        type: "quiz",
        order: 16,
        completed: false,
        quizId: "ccna-quiz-wlan",
        hints: [],
      },
      {
        id: "step-17-exam-sim",
        title: "Prüfungssimulation CCNA",
        description:
          "Wiederhole alle 20 Themen-Quizze im Prüfungsmodus, bevor Du zur Cisco-Zertifizierung antrittst.",
        type: "info",
        order: 17,
        completed: false,
        hints: [],
      },
      {
        id: "step-18-ios-cli",
        title: "Cisco IOS CLI",
        description:
          "CLI-Modi, SSH-Konfiguration, Interface-Management und Diagnose.",
        type: "info",
        order: 18,
        completed: false,
        hints: [],
      },
      {
        id: "step-19-device-management",
        title: "Device Management Protocols",
        description:
          "CDP/LLDP, NTP, Syslog und SNMPv3 für den Netzwerkbetrieb.",
        type: "info",
        order: 19,
        completed: false,
        hints: [],
      },
      {
        id: "step-20-fhrp",
        title: "First Hop Redundancy (HSRP/VRRP/GLBP)",
        description:
          "Default-Gateway-Redundanz mit virtueller IP/MAC und Object Tracking.",
        type: "info",
        order: 20,
        completed: false,
        hints: [],
      },
      {
        id: "step-21-qos",
        title: "Quality of Service",
        description:
          "Classification, Marking (DSCP/CoS), LLQ und Trust Boundary.",
        type: "info",
        order: 21,
        completed: false,
        hints: [],
      },
      {
        id: "step-22-quiz-qos",
        title: "Quiz: QoS",
        description: "QoS-Mechanismen testen.",
        type: "quiz",
        order: 22,
        completed: false,
        quizId: "ccna-quiz-qos",
        hints: [],
      },
      {
        id: "step-23-wan-vpn",
        title: "WAN & VPN",
        description:
          "Mietleitung, MPLS, IPsec, GRE/DMVPN und Cisco SD-WAN.",
        type: "info",
        order: 23,
        completed: false,
        hints: [],
      },
      {
        id: "step-24-sdn",
        title: "Controller-Based Networking & Cloud",
        description:
          "SDN-Planes, Cisco DNA Center, SD-Access und Cloud-Service-Modelle.",
        type: "info",
        order: 24,
        completed: false,
        hints: [],
      },
      {
        id: "step-25-automation",
        title: "Programmability & Automation",
        description:
          "REST APIs, JSON/YAML, Ansible, Terraform und GitOps.",
        type: "info",
        order: 25,
        completed: false,
        hints: [],
      },
      {
        id: "step-26-troubleshooting",
        title: "Troubleshooting & Diagnose",
        description:
          "Methodik, Extended Ping, Traceroute, Interface-Counter und err-disabled Recovery.",
        type: "info",
        order: 26,
        completed: false,
        hints: [],
      },
      {
        id: "step-27-quiz-ios-cli",
        title: "Quiz: Cisco IOS CLI",
        description: "CLI-Modi, SSH-Konfiguration, Diagnose-Befehle.",
        type: "quiz",
        order: 27,
        completed: false,
        quizId: "ccna-quiz-ios-cli",
        hints: [],
      },
      {
        id: "step-28-quiz-device-mgmt",
        title: "Quiz: Device Management",
        description: "CDP/LLDP, NTP, Syslog, SNMPv3.",
        type: "quiz",
        order: 28,
        completed: false,
        quizId: "ccna-quiz-device-management",
        hints: [],
      },
      {
        id: "step-29-quiz-fhrp",
        title: "Quiz: FHRP",
        description: "HSRP/VRRP/GLBP, Priority, Preemption, Object Tracking.",
        type: "quiz",
        order: 29,
        completed: false,
        quizId: "ccna-quiz-fhrp",
        hints: [],
      },
      {
        id: "step-30-quiz-wan-vpn",
        title: "Quiz: WAN & VPN",
        description: "MPLS, IPsec, GRE/DMVPN, Cisco SD-WAN.",
        type: "quiz",
        order: 30,
        completed: false,
        quizId: "ccna-quiz-wan-vpn",
        hints: [],
      },
      {
        id: "step-31-quiz-sdn",
        title: "Quiz: SDN & Cloud",
        description: "Control/Data Plane, DNA Center, SD-Access, Cloud-Modelle.",
        type: "quiz",
        order: 31,
        completed: false,
        quizId: "ccna-quiz-sdn",
        hints: [],
      },
      {
        id: "step-32-quiz-automation",
        title: "Quiz: Automation",
        description: "REST APIs, JSON/YAML, Ansible, Terraform.",
        type: "quiz",
        order: 32,
        completed: false,
        quizId: "ccna-quiz-automation",
        hints: [],
      },
      {
        id: "step-33-quiz-troubleshooting",
        title: "Quiz: Troubleshooting",
        description: "Methodik, Interface-Counter, err-disabled, ping/traceroute.",
        type: "quiz",
        order: 33,
        completed: false,
        quizId: "ccna-quiz-troubleshooting",
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
    TOPIC_IPV6,
    TOPIC_SWITCHING_VLANS,
    TOPIC_ROUTING_OSPF,
    TOPIC_FHRP,
    TOPIC_DHCP_NAT,
    TOPIC_DEVICE_MANAGEMENT,
    TOPIC_SECURITY,
    TOPIC_QOS,
    TOPIC_WLAN,
    TOPIC_WAN,
    TOPIC_SDN,
    TOPIC_AUTOMATION,
    TOPIC_TROUBLESHOOTING,
  ],

  concepts: {
    ...NETWORKING_FUNDAMENTALS_CONCEPTS,
    ...IOS_CLI_CONCEPTS,
    ...IPV4_CONCEPTS,
    ...IPV6_CONCEPTS,
    ...SWITCHING_CONCEPTS,
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

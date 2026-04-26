// ============================================================
// CCNA Module Index
// Assembles all topics/concepts/quizzes into a CertificationModule
// and registers it with the contentRegistry.
// ============================================================

import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule } from "@/lib/content/types";
import type { LearningPath } from "@/lib/types";

// ── Topic + Concept imports ──────────────────────────────────
import { DHCP_NAT_CONCEPTS, TOPIC_DHCP_NAT } from "./topics/dhcp-nat";
import { IPV4_CONCEPTS, TOPIC_IPV4_ADDRESSING } from "./topics/ipv4-addressing";
import { IPV6_CONCEPTS, TOPIC_IPV6 } from "./topics/ipv6";
import {
  NETWORKING_FUNDAMENTALS_CONCEPTS,
  TOPIC_NETWORKING_FUNDAMENTALS,
} from "./topics/networking-fundamentals";
import { ROUTING_CONCEPTS, TOPIC_ROUTING_OSPF } from "./topics/routing-ospf";
import { SECURITY_CONCEPTS, TOPIC_SECURITY } from "./topics/security";
import {
  SWITCHING_CONCEPTS,
  TOPIC_SWITCHING_VLANS,
} from "./topics/switching-vlans";
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
    estimatedMinutes: 960,
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
        description: "Vollständiger Übungstest im Prüfungsformat.",
        type: "quiz",
        order: 17,
        completed: false,
        quizId: "ccna-quiz-exam",
        hints: [],
      },
    ],
  },
};

// ────────────────────────────────────────────────────────────
// CCNA Module Definition
// ────────────────────────────────────────────────────────────
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
  estimatedHours: 16,
  prerequisites: [],
  relatedModules: ["az-900", "comptia-network-plus"],

  topics: [
    TOPIC_NETWORKING_FUNDAMENTALS,
    TOPIC_IPV4_ADDRESSING,
    TOPIC_IPV6,
    TOPIC_SWITCHING_VLANS,
    TOPIC_ROUTING_OSPF,
    TOPIC_DHCP_NAT,
    TOPIC_SECURITY,
    TOPIC_WLAN,
  ],

  concepts: {
    ...NETWORKING_FUNDAMENTALS_CONCEPTS,
    ...IPV4_CONCEPTS,
    ...IPV6_CONCEPTS,
    ...SWITCHING_CONCEPTS,
    ...ROUTING_CONCEPTS,
    ...DHCP_NAT_CONCEPTS,
    ...SECURITY_CONCEPTS,
    ...WLAN_CONCEPTS,
  },

  quizzes: CCNA_QUIZZES,
  exercises: {},
  learningPaths: CCNA_LEARNING_PATHS,

  metadata: {
    slug: "ccna",
    tagline:
      "Cisco CCNA 200-301 — Netzwerkgrundlagen bis OSPF, Security & WLAN",
    objectives: [
      "OSI/TCP-IP Modell verstehen und anwenden",
      "IPv4/IPv6 Adressierung und Subnetting beherrschen",
      "Switching: VLANs, STP, EtherChannel konfigurieren",
      "Routing: Statisch, OSPF Single-Area und Multi-Area",
      "Netzwerksicherheit: ACLs, Port-Security, DHCP Snooping, DAI",
      "WLAN Grundlagen und Cisco Wireless-Architektur",
      "DHCP, NAT/PAT konfigurieren und troubleshooten",
    ],
    targetAudience: [
      "Fachinformatiker Systemintegration (Azubis)",
      "IT-Einsteiger mit Interesse an Netzwerken",
      "CCNA-Prüfungskandidaten",
    ],
    previewImageUrl: "/assets/modules/ccna-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-26",
    certificationBody: "Cisco",
    certValidityMonths: 36,
    featured: true,
    categories: ["networking", "cisco", "enterprise", "certification"],
  },
};

// Auto-register on import — no manual registration needed
contentRegistry.register(CCNA_MODULE);

export default CCNA_MODULE;

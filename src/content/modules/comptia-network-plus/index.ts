// ============================================================
// CompTIA Network+ N10-009 — Stub-Modul (4 Topics)
// Stand: April 2026
//
// Zweck: Architektur-Stresstest — 4 Topics mit maximaler Cross-Reference-Dichte
// zu CCNA und AZ-900. Kein Vollausbau-Modul.
//
// PBQ-Schema-Erkenntnis (Stresstest-Ergebnis):
//   Das Schema (lib/types.ts) definiert type: "drag-drop" in Question,
//   aber Answer = {id, text, isCorrect: boolean} ohne Positions-Attribut.
//   Echter Drag-and-Drop (Zuordnung mit Positionen) ist mit diesem Schema
//   nicht darstellbar — Answer.order?: number fehlt für PBQ-Matching.
//   Workaround in diesem Stub: PBQ-artige Inhalte als single-choice formuliert
//   mit explizitem "PBQ-artig"-Marker im Explanation-Text.
//   Empfehlung für Schema-Erweiterung:
//     Answer.order?: number   // für Drag-Drop-Reihenfolge
//     Answer.matchTarget?: string  // für Matching-Aufgaben
//   Dieses TODO sollte als Issue erfasst werden, bevor PBQ-Questions
//   in Produktionsmodulen genutzt werden.
// ============================================================

import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule } from "@/lib/content/types";
import type { LearningPath, Quiz } from "@/lib/types";

// ── Topic-Imports ─────────────────────────────────────────────

import {
  TOPIC_NETPLUS_NETWORK_CONCEPTS,
  QUIZ_NETPLUS_NETWORK_CONCEPTS,
  NETWORK_CONCEPTS_CONCEPTS,
} from "./topics/netplus-network-concepts";

import {
  TOPIC_NETPLUS_IMPLEMENTATION,
  QUIZ_NETPLUS_IMPLEMENTATION,
  IMPLEMENTATION_CONCEPTS,
} from "./topics/netplus-implementation";

import {
  TOPIC_NETPLUS_SECURITY,
  QUIZ_NETPLUS_SECURITY,
  SECURITY_NP_CONCEPTS,
} from "./topics/netplus-security";

import {
  TOPIC_NETPLUS_OPERATIONS,
  QUIZ_NETPLUS_OPERATIONS,
  OPERATIONS_CONCEPTS,
} from "./topics/netplus-operations";

// ── Learning Path ─────────────────────────────────────────────

const NETPLUS_LEARNING_PATHS: Record<string, LearningPath> = {
  "netplus-stub-path": {
    id: "netplus-stub-path",
    title: "Network+ N10-009 — Stresstest-Stub (4 Topics)",
    description:
      "4 Topics als Architektur-Stresstest: Netzwerkkonzepte, Switching/Routing/Wireless, Sicherheit und Netzwerkbetrieb — mit maximalen Cross-References zu CCNA und AZ-900.",
    subject: "N10-009",
    difficulty: "intermediate",
    estimatedMinutes: 275,
    tags: ["n10-009", "comptia", "network-plus", "vendor-neutral", "cross-reference"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: "netplus-step-1",
        title: "Netzwerkkonzepte & OSI-Modell",
        description: "OSI vendor-neutral, Ports/Protokolle, Cloud-Konzepte, SDN/Zero Trust, IPv6.",
        type: "info",
        order: 1,
        completed: false,
        hints: [],
      },
      {
        id: "netplus-step-2",
        title: "Switching, Routing & Wireless",
        description: "VLANs/802.1Q, STP, OSPF/BGP/RIP, 802.11ax Wi-Fi 6/7, WPA3.",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "netplus-step-3",
        title: "Netzwerksicherheit & Angriffe",
        description: "CIA-Triade, IAM, Firewall-Typen, Angriffserkennung, 802.1X, ACLs.",
        type: "info",
        order: 3,
        completed: false,
        hints: [],
      },
      {
        id: "netplus-step-4",
        title: "Netzwerkbetrieb & Monitoring",
        description: "SNMP v1/v2c/v3, Syslog, IPFIX, DNS, DHCP, DR (RPO/RTO), Dokumentation.",
        type: "info",
        order: 4,
        completed: false,
        hints: [],
      },
    ],
  },
};

// ── Module Definition ─────────────────────────────────────────

const NETPLUS_MODULE: CertificationModule = {
  id: "comptia-network-plus",
  vendor: "comptia",
  title: "CompTIA Network+ N10-009",
  subtitle: "Network+ N10-009 Stub",
  description:
    "Vendor-neutrale Netzwerkgrundlagen für die CompTIA Network+ N10-009-Prüfung. Dieses Stub-Modul (4 Topics) dient als Architektur-Stresstest und Brücke zwischen CCNA (Cisco-spezifisch) und AZ-900 (Cloud-nativ). Schwerpunkt: Cross-References und vendor-neutrale Konzepttiefe.",
  difficulty: "intermediate",
  examCode: "N10-009",
  estimatedHours: 5,
  prerequisites: [],
  relatedModules: ["ccna", "az-900"],

  topics: [
    TOPIC_NETPLUS_NETWORK_CONCEPTS,
    TOPIC_NETPLUS_IMPLEMENTATION,
    TOPIC_NETPLUS_SECURITY,
    TOPIC_NETPLUS_OPERATIONS,
  ],

  concepts: {
    ...NETWORK_CONCEPTS_CONCEPTS,
    ...IMPLEMENTATION_CONCEPTS,
    ...SECURITY_NP_CONCEPTS,
    ...OPERATIONS_CONCEPTS,
  },

  quizzes: {
    [QUIZ_NETPLUS_NETWORK_CONCEPTS.id]: QUIZ_NETPLUS_NETWORK_CONCEPTS,
    [QUIZ_NETPLUS_IMPLEMENTATION.id]: QUIZ_NETPLUS_IMPLEMENTATION,
    [QUIZ_NETPLUS_SECURITY.id]: QUIZ_NETPLUS_SECURITY,
    [QUIZ_NETPLUS_OPERATIONS.id]: QUIZ_NETPLUS_OPERATIONS,
  } as Record<string, Quiz>,

  exercises: {},
  learningPaths: NETPLUS_LEARNING_PATHS,

  metadata: {
    slug: "comptia-network-plus",
    tagline: "Vendor-neutrale Netzwerkkonzepte — die Brücke zwischen CCNA und Azure",
    objectives: [
      "OSI-Modell und TCP/IP vendor-neutral erklären (Abgrenzung von CCNA-Cisco-Kontext)",
      "Netzwerkports und Protokolle (N10-009 Pflichtkanon) auswendig kennen",
      "Cloud-Netzwerkkonzepte (VPC, IaaS/PaaS/SaaS) mit AZ-900-Wissen verknüpfen",
      "SDN, Zero Trust Architecture und IPv6-Übergangstechnologien beschreiben",
      "VLANs, STP und Routing-Protokolle (OSPF/BGP/RIP) vendor-neutral anwenden",
      "Wi-Fi 6/6E/7 (802.11ax/be) und WPA3-Sicherheit erklären",
      "CIA-Triade, Firewall-Typen und Netzwerkangriffe erkennen und benennen",
      "SNMP v1/v2c/v3, Syslog und Flow-Daten (IPFIX vs. NetFlow) als Monitoring-Grundlage",
    ],
    targetAudience: [
      "CCNA-Absolventen, die vendor-neutrale Perspektive ergänzen wollen",
      "AZ-900-Lernende mit Netzwerkbedarf, die konzeptionelle Grundlagen vertiefen wollen",
      "N10-009-Prüfungskandidaten für die Bereiche Konzepte, Implementation, Security und Betrieb",
    ],
    previewImageUrl: "/assets/modules/comptia-network-plus-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-27",
    certificationBody: "CompTIA",
    certValidityMonths: 36,
    featured: false,
    categories: ["networking", "comptia", "certification", "vendor-neutral"],
  },
};

// Auto-register on import
contentRegistry.register(NETPLUS_MODULE);

export default NETPLUS_MODULE;

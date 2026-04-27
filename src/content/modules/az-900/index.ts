// ============================================================
// AZ-900 Module — vollständig, alle 10 Topics
// Stand: April 2026
// ============================================================

import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule } from "@/lib/content/types";
import type { LearningPath, Quiz } from "@/lib/types";

// ── Topic-Imports ─────────────────────────────────────────────

import {
  TOPIC_CLOUD_FUNDAMENTALS,
  QUIZ_CLOUD_FUNDAMENTALS,
  CLOUD_FUNDAMENTALS_CONCEPTS,
} from "./topics/cloud-fundamentals";

import {
  TOPIC_AZURE_ARCHITECTURE,
  QUIZ_AZURE_ARCHITECTURE,
  AZURE_ARCHITECTURE_CONCEPTS,
} from "./topics/azure-architecture";

import {
  TOPIC_AZURE_COMPUTE,
  QUIZ_AZURE_COMPUTE,
  AZURE_COMPUTE_CONCEPTS,
} from "./topics/azure-compute";

import {
  TOPIC_AZURE_NETWORKING,
  QUIZ_AZURE_NETWORKING,
  AZURE_NETWORKING_CONCEPTS,
} from "./topics/azure-networking";

import {
  TOPIC_AZURE_STORAGE,
  QUIZ_AZURE_STORAGE,
  AZURE_STORAGE_CONCEPTS,
} from "./topics/azure-storage";

import {
  TOPIC_AZURE_IDENTITY_SECURITY,
  QUIZ_AZURE_IDENTITY_SECURITY,
  AZURE_IDENTITY_SECURITY_CONCEPTS,
} from "./topics/azure-identity-security";

import {
  TOPIC_AZURE_GOVERNANCE,
  QUIZ_AZURE_GOVERNANCE,
  AZURE_GOVERNANCE_CONCEPTS,
} from "./topics/azure-governance";

import {
  TOPIC_AZURE_MANAGEMENT_TOOLS,
  QUIZ_AZURE_MANAGEMENT_TOOLS,
  AZURE_MANAGEMENT_TOOLS_CONCEPTS,
} from "./topics/azure-management-tools";

import {
  TOPIC_AZURE_MONITORING,
  QUIZ_AZURE_MONITORING,
  AZURE_MONITORING_CONCEPTS,
} from "./topics/azure-monitoring";

import {
  TOPIC_AZURE_COST_SLA,
  QUIZ_AZURE_COST_SLA,
  AZURE_COST_SLA_CONCEPTS,
} from "./topics/azure-cost-sla";

// ── Learning Path ─────────────────────────────────────────────

const AZ900_LEARNING_PATHS: Record<string, LearningPath> = {
  "az-900-full-path": {
    id: "az-900-full-path",
    title: "AZ-900 Azure Fundamentals — Vollständiger Lernpfad",
    description:
      "Alle 10 Topics der AZ-900-Prüfung: Cloud-Grundlagen, Azure-Architektur, Compute, Networking, Storage, Identity & Security, Governance, Management Tools, Monitoring sowie Cost & SLA.",
    subject: "AZ-900",
    difficulty: "beginner",
    estimatedMinutes: 680,
    tags: ["az-900", "azure", "cloud", "microsoft", "certification"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: "az900-step-1",
        title: "Cloud Computing Grundlagen",
        description: "IaaS/PaaS/SaaS, Bereitstellungsmodelle, Shared Responsibility, Cloud-Vorteile.",
        type: "info",
        order: 1,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-2",
        title: "Azure-Architektur & Infrastruktur",
        description: "Regionen, Availability Zones, Availability Sets, Ressourcen-Hierarchie.",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-3",
        title: "Azure Compute-Dienste",
        description: "VMs, App Service, Functions, AKS, Container Instances.",
        type: "info",
        order: 3,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-4",
        title: "Azure Networking",
        description: "VNet, Subnets, NSG, VPN Gateway, ExpressRoute, DNS.",
        type: "info",
        order: 4,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-5",
        title: "Azure Storage",
        description: "Blob, Files, Disk, Queue, Redundanz-Optionen, Access Tiers.",
        type: "info",
        order: 5,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-6",
        title: "Identity, Security & Compliance",
        description: "Microsoft Entra ID, RBAC, Zero Trust, Defender for Cloud, Sentinel.",
        type: "info",
        order: 6,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-7",
        title: "Azure Governance & Compliance",
        description: "Management Groups, Azure Policy, Resource Locks, Microsoft Purview.",
        type: "info",
        order: 7,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-8",
        title: "Azure Management Tools & IaC",
        description: "Portal, Cloud Shell, PowerShell, CLI, Azure Arc, ARM Templates, Bicep.",
        type: "info",
        order: 8,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-9",
        title: "Azure Monitoring",
        description: "Azure Advisor, Service Health, Azure Monitor, Log Analytics, Application Insights.",
        type: "info",
        order: 9,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-10",
        title: "Cost Management & SLAs",
        description: "Kostenoptimierung, Pricing Calculator, Cost Management, Composite SLA, Service Lifecycle.",
        type: "info",
        order: 10,
        completed: false,
        hints: [],
      },
    ],
  },
};

// ── Module Definition ─────────────────────────────────────────

const AZ900_MODULE: CertificationModule = {
  id: "az-900",
  vendor: "microsoft",
  title: "Microsoft Azure Fundamentals",
  subtitle: "AZ-900 Certification",
  description:
    "Fundierte Vorbereitung auf die AZ-900-Prüfung: 10 Topics decken alle drei Prüfungsdomänen ab — Cloud Concepts, Azure Architecture & Services sowie Azure Management & Governance. Mit CCNA-Querverweisen für Netzwerk-Kenntnisse.",
  difficulty: "beginner",
  examCode: "AZ-900",
  estimatedHours: 35,
  prerequisites: [],
  relatedModules: ["ccna"],

  topics: [
    TOPIC_CLOUD_FUNDAMENTALS,
    TOPIC_AZURE_ARCHITECTURE,
    TOPIC_AZURE_COMPUTE,
    TOPIC_AZURE_NETWORKING,
    TOPIC_AZURE_STORAGE,
    TOPIC_AZURE_IDENTITY_SECURITY,
    TOPIC_AZURE_GOVERNANCE,
    TOPIC_AZURE_MANAGEMENT_TOOLS,
    TOPIC_AZURE_MONITORING,
    TOPIC_AZURE_COST_SLA,
  ],

  concepts: {
    ...CLOUD_FUNDAMENTALS_CONCEPTS,
    ...AZURE_ARCHITECTURE_CONCEPTS,
    ...AZURE_COMPUTE_CONCEPTS,
    ...AZURE_NETWORKING_CONCEPTS,
    ...AZURE_STORAGE_CONCEPTS,
    ...AZURE_IDENTITY_SECURITY_CONCEPTS,
    ...AZURE_GOVERNANCE_CONCEPTS,
    ...AZURE_MANAGEMENT_TOOLS_CONCEPTS,
    ...AZURE_MONITORING_CONCEPTS,
    ...AZURE_COST_SLA_CONCEPTS,
  },

  quizzes: {
    [QUIZ_CLOUD_FUNDAMENTALS.id]: QUIZ_CLOUD_FUNDAMENTALS,
    [QUIZ_AZURE_ARCHITECTURE.id]: QUIZ_AZURE_ARCHITECTURE,
    [QUIZ_AZURE_COMPUTE.id]: QUIZ_AZURE_COMPUTE,
    [QUIZ_AZURE_NETWORKING.id]: QUIZ_AZURE_NETWORKING,
    [QUIZ_AZURE_STORAGE.id]: QUIZ_AZURE_STORAGE,
    [QUIZ_AZURE_IDENTITY_SECURITY.id]: QUIZ_AZURE_IDENTITY_SECURITY,
    [QUIZ_AZURE_GOVERNANCE.id]: QUIZ_AZURE_GOVERNANCE,
    [QUIZ_AZURE_MANAGEMENT_TOOLS.id]: QUIZ_AZURE_MANAGEMENT_TOOLS,
    [QUIZ_AZURE_MONITORING.id]: QUIZ_AZURE_MONITORING,
    [QUIZ_AZURE_COST_SLA.id]: QUIZ_AZURE_COST_SLA,
  } as Record<string, Quiz>,

  exercises: {},
  learningPaths: AZ900_LEARNING_PATHS,

  metadata: {
    slug: "az-900",
    tagline: "Azure Fundamentals — solide Cloud-Grundlagen, sofort prüfungsrelevant",
    objectives: [
      "Cloud-Konzepte (IaaS, PaaS, SaaS, Shared Responsibility) erklären",
      "Azure-Architektur: Regionen, Availability Zones, Ressourcen-Hierarchie",
      "Kernservices: Compute, Networking, Storage verstehen und abgrenzen",
      "Identity & Security: Entra ID, RBAC, Zero Trust, Defender, Sentinel",
      "Governance: Management Groups, Azure Policy, Resource Locks, Purview",
      "Management Tools: Portal, Cloud Shell, Azure Arc, Bicep, ARM",
      "Monitoring: Advisor, Service Health, Azure Monitor, Log Analytics",
      "Cost Management: Pricing Calculator, Cost Management, Composite SLA",
    ],
    targetAudience: [
      "IT-Einsteiger und Quereinsteiger ohne Azure-Vorwissen",
      "Entwickler und Admins, die eine fundierte Azure-Grundlage aufbauen wollen",
      "AZ-900-Prüfungskandidaten, die prüfungsrelevantes Wissen strukturiert erwerben wollen",
    ],
    previewImageUrl: "/assets/modules/az-900-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-27",
    certificationBody: "Microsoft",
    certValidityMonths: 24,
    featured: true,
    categories: ["cloud", "azure", "microsoft", "certification"],
  },
};

// Auto-register on import
contentRegistry.register(AZ900_MODULE);

export default AZ900_MODULE;

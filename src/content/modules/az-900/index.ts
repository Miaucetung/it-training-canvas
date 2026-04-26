// ============================================================
// AZ-900 Module Stub (2 topics — proves the architecture works)
// Add more topics the same way as CCNA, no core changes needed.
// ============================================================

import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule, Concept, Topic } from "@/lib/content/types";
import type { LearningPath, Quiz } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

const CONCEPT_CLOUD_FUNDAMENTALS: Concept = {
  id: "cloud-fundamentals",
  title: "Cloud Computing Grundlagen",
  appliesTo: ["az-900", "az-104"],
  tags: ["cloud", "azure", "iaas", "paas", "saas", "shared-responsibility"],
  content: `
## Cloud Computing Grundlagen

### Definition (NIST)
Cloud Computing = **On-demand** Zugriff auf konfigurierbare **Netzwerk-Ressourcen** (Server, Storage, Apps), die schnell bereitgestellt und freigegeben werden.

### Service-Modelle
| Modell | Du verwaltest | Anbieter verwaltet | Beispiel |
|--------|--------------|------------------|---------|
| IaaS | OS, Apps, Daten | Hardware, Hypervisor | Azure VMs |
| PaaS | Apps, Daten | OS, Runtime, Middleware | Azure App Service |
| SaaS | — | Alles | Microsoft 365 |

### Bereitstellungsmodelle
| Modell | Beschreibung |
|--------|-------------|
| Public Cloud | Ressourcen des Anbieters (Azure, AWS, GCP) |
| Private Cloud | Eigene Infrastruktur (On-Premises) |
| Hybrid Cloud | Kombination aus Public + Private |
| Multi Cloud | Mehrere Cloud-Anbieter |

### Shared Responsibility Model
| Schicht | Public Cloud | Hybrid | On-Premises |
|---------|-------------|--------|------------|
| Physische Sicherheit | Microsoft | Microsoft | **Du** |
| Virtualisierung | Microsoft | Microsoft | **Du** |
| Betriebssystem | **Du** (IaaS) | **Du** | **Du** |
| Applikation | **Du** | **Du** | **Du** |
| Daten | **Du** | **Du** | **Du** |

### Cloud-Vorteile (Azure-Perspektive)
- **Economies of Scale**: Günstigere Kosten durch Größe
- **CapEx → OpEx**: Keine Hardware-Investitionen, pay-per-use
- **Elastizität**: Auf- und Abskalieren nach Bedarf
- **High Availability**: SLAs bis 99.99% Uptime
- **Global Reach**: Azure-Regionen weltweit
  `.trim(),
};

const CONCEPT_AZURE_CORE_SERVICES: Concept = {
  id: "azure-core-services",
  title: "Azure Kerndienste",
  appliesTo: ["az-900", "az-104"],
  tags: ["cloud", "azure", "compute", "storage", "networking", "microsoft"],
  relatedConceptIds: ["vlans", "subnetting"],
  content: `
## Azure Kerndienste

### Compute
| Dienst | Beschreibung |
|--------|-------------|
| Azure VMs | IaaS — volle Kontrolle über OS |
| Azure App Service | PaaS — Web-Apps und APIs |
| Azure Functions | Serverless — Event-getrieben |
| Azure Kubernetes Service (AKS) | Container-Orchestrierung |
| Azure Container Instances | Einfache Container, kein Cluster |

### Storage
| Dienst | Beschreibung |
|--------|-------------|
| Azure Blob Storage | Unstrukturierte Objekte (S3-äquivalent) |
| Azure Files | SMB/NFS Dateifreigaben |
| Azure Disk | Block-Storage für VMs |
| Azure Queue Storage | Nachrichten-Warteschlange |

### Networking
| Dienst | Beschreibung | CCNA-Analogie |
|--------|-------------|--------------|
| Virtual Network (VNet) | Isoliertes Netzwerk in Azure | VLAN / privates Netz |
| Subnet | Untersegment eines VNet | Subnetz |
| NSG (Network Security Group) | Firewall-Regeln für NICs/Subnets | ACL |
| VPN Gateway | Site-to-Site / P2S VPN | IPsec VPN |
| ExpressRoute | Dedizierte Verbindung zum Azure-DC | MPLS/WAN |
| Azure Load Balancer | L4 Traffic-Verteilung | Hardware-LB |
| Application Gateway | L7 WAF + LB | Proxy/WAF |

### Datenbanken
| Dienst | Typ |
|--------|-----|
| Azure SQL Database | Relational (PaaS) |
| Cosmos DB | Multi-Modell NoSQL |
| Azure Database for PostgreSQL | PostgreSQL (PaaS) |
  `.trim(),
};

const CONCEPT_AZURE_PRICING: Concept = {
  id: "azure-pricing",
  title: "Azure Preismodell & SLAs",
  appliesTo: ["az-900"],
  tags: ["cloud", "azure", "pricing", "sla", "cost-management"],
  content: `
## Azure Preismodell

### Abrechnungsmodelle
| Modell | Beschreibung | Einsatz |
|--------|-------------|---------|
| Pay-as-you-go | Pro Minute/Stunde/GB | Standard |
| Reserved Instances | 1- oder 3-Jahres-Commitment | -72% vs. PAYG |
| Spot Instances | Nicht-kritische Workloads | bis -90% |
| Azure Hybrid Benefit | Existierende Windows/SQL-Lizenzen | On-Prem → Cloud |

### SLAs
- Einzel-VM (Premium SSD): **99.9%**
- VM in Availability Set: **99.95%**
- VM in Availability Zones: **99.99%**
- Azure SQL Database: **99.99%**

### Faktoren für Kosten
1. **Region**: Preise variieren nach Azure-Region
2. **Service-Tier**: Basic < Standard < Premium
3. **Instanz-Größe**: vCPUs, RAM
4. **Ausgehender Traffic** (Ingress kostenlos!)
5. **Support-Plan**

### Azure Cost Management
- **Azure Pricing Calculator**: Schätzung vor Deployment
- **Azure Cost Management + Billing**: Überwachung der laufenden Kosten
- **Azure Advisor**: Empfehlungen zur Kostenoptimierung
- **Budgets & Alerts**: Warnungen bei Kostenüberschreitung
  `.trim(),
};

// ── Topics ───────────────────────────────────────────────────

const TOPIC_CLOUD_FUNDAMENTALS: Topic = {
  id: "cloud-fundamentals-topic",
  title: "Cloud Computing Grundlagen",
  description:
    "IaaS/PaaS/SaaS, Bereitstellungsmodelle, Shared Responsibility und Cloud-Vorteile.",
  conceptIds: ["cloud-fundamentals"],
  quizIds: [],
  exerciseIds: [],
  prerequisiteTopicIds: [],
  estimatedMinutes: 60,
  tags: ["cloud", "azure", "fundamentals"],
};

const TOPIC_AZURE_ARCHITECTURE: Topic = {
  id: "azure-architecture",
  title: "Azure-Architektur & Kerndienste",
  description:
    "Azure-Kernservices: Compute, Storage, Networking, Datenbanken und Preismodell.",
  conceptIds: ["azure-core-services", "azure-pricing"],
  quizIds: [],
  exerciseIds: [],
  prerequisiteTopicIds: ["cloud-fundamentals-topic"],
  estimatedMinutes: 90,
  tags: ["cloud", "azure", "architecture", "pricing"],
};

// ── Learning Paths ────────────────────────────────────────────

const AZ900_LEARNING_PATHS: Record<string, LearningPath> = {
  "az-900-full-path": {
    id: "az-900-full-path",
    title: "AZ-900 Azure Fundamentals",
    description:
      "Einführung in Microsoft Azure Cloud-Computing für die AZ-900-Prüfung.",
    subject: "AZ-900",
    difficulty: "beginner",
    estimatedMinutes: 300,
    tags: ["az-900", "azure", "cloud", "microsoft"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    steps: [
      {
        id: "az900-step-1",
        title: "Cloud Computing Grundlagen",
        description: "Was ist Cloud? IaaS/PaaS/SaaS, Shared Responsibility.",
        type: "info",
        order: 1,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-2",
        title: "Azure Kerndienste",
        description: "Compute, Storage, Networking in Azure.",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "az900-step-3",
        title: "Preismodelle & SLAs",
        description: "Kosten verstehen, Reserved Instances, Cost Management.",
        type: "info",
        order: 3,
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
    "Grundlagen von Microsoft Azure Cloud Computing. Ideal als Einstieg für alle Azure-Zertifizierungen.",
  difficulty: "beginner",
  examCode: "AZ-900",
  estimatedHours: 8,
  prerequisites: [],
  relatedModules: ["ccna", "az-104"],

  topics: [TOPIC_CLOUD_FUNDAMENTALS, TOPIC_AZURE_ARCHITECTURE],

  concepts: {
    "cloud-fundamentals": CONCEPT_CLOUD_FUNDAMENTALS,
    "azure-core-services": CONCEPT_AZURE_CORE_SERVICES,
    "azure-pricing": CONCEPT_AZURE_PRICING,
  },

  quizzes: {} as Record<string, Quiz>, // populated when az-900 quizzes are created
  exercises: {},
  learningPaths: AZ900_LEARNING_PATHS,

  metadata: {
    slug: "az-900",
    tagline: "Microsoft Azure Fundamentals — Cloud-Grundlagen für den Einstieg",
    objectives: [
      "Cloud-Konzepte (IaaS, PaaS, SaaS) beschreiben",
      "Azure-Kerndienste kennenlernen (Compute, Storage, Networking)",
      "Azure-Preismodelle und SLAs verstehen",
      "Sicherheit und Compliance in Azure",
      "Cross-Referenzen zu CCNA-Netzwerkkonzepten verstehen",
    ],
    targetAudience: [
      "IT-Einsteiger und Quereinsteiger",
      "Entwickler ohne Cloud-Hintergrund",
      "AZ-900-Prüfungskandidaten",
    ],
    previewImageUrl: "/assets/modules/az-900-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-26",
    certificationBody: "Microsoft",
    certValidityMonths: 24,
    featured: true,
    categories: ["cloud", "azure", "microsoft", "certification"],
  },
};

// Auto-register on import
contentRegistry.register(AZ900_MODULE);

export default AZ900_MODULE;

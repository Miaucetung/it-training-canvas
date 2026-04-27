// ============================================================
// AZ-900 Topic: Azure Architecture & Core Infrastructure
// Domain 2: Azure Architecture and Services (~35-40%)
// Outline: "Describe the core architectural components of Azure"
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_AZURE_REGIONS: Concept = {
  id: "azure-regions",
  title: "Azure-Regionen, Region-Paare & Sovereign Regions",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "regions", "geography", "region-pairs", "sovereign", "datacenters"],
  content: `
## Azure-Regionen

Eine Azure-**Region** ist ein geografischer Bereich, der mindestens ein
Rechenzentrum enthält. Regionen sind mit Netzwerken niedriger Latenz miteinander
verbunden. Beispiele: *West Europe* (Amsterdam), *Germany West Central*
(Frankfurt), *East US* (Virginia).

Azure betreibt weltweit mehr als 60 Regionen — mehr als jeder andere
Cloud-Anbieter. Bei der Wahl einer Region spielen folgende Faktoren eine Rolle:

- **Latenz**: Wähle die Region, die deinen Endnutzern geografisch am nächsten liegt
- **Verfügbarkeit**: Nicht alle Dienste sind in allen Regionen verfügbar
- **Datensouveränität**: Manche Compliance-Anforderungen verlangen, dass Daten
  in bestimmten Ländern verbleiben (z.B. DSGVO → EU-Regionen)
- **Kosten**: Preise variieren zwischen Regionen

### Azure Datacenters

Innerhalb einer Region betreibt Azure mehrere physisch getrennte Rechenzentren.
Diese sind für Kunden nicht direkt adressierbar — du wählst eine Region,
Azure verteilt intern auf die Rechenzentren.

### Region-Paare (Region Pairs)

Jede Azure-Region ist mit einer zweiten Region im selben Kontinent gepaart —
mindestens 300 km Abstand. Diese Region-Paare sind für automatisches Failover
und priorisierte Wiederherstellung bei großflächigen Ausfällen ausgelegt.

| Region-Paar | Regionen |
|-------------|---------|
| Deutschland | Germany West Central ↔ Germany North |
| USA | East US ↔ West US |
| Europa | West Europe (NL) ↔ North Europe (IR) |

**Mindestabstand**: Ältere Microsoft-Dokumentation spezifizierte mindestens
300 Meilen (≈ 480 km) Abstand zwischen den Regionen eines Paares. Die aktuelle
Microsoft-Dokumentation nennt keinen festen Kilometerwert mehr, das Konzept
geografischer Trennung bleibt aber bestehen.

**Vorteil von Region-Paaren**:
- Bei Azure-Plattform-Updates wird immer nur eine Region des Paares gleichzeitig aktualisiert
- Georedundanter Speicher (GRS/GZRS) repliziert automatisch in die Pair-Region
- Priorisierte Wiederherstellung bei Katastrophenszenarien (Disaster Recovery)

### Non-Paired Regions (Neue Regionen ohne Pair)

**Prüfungsfalle — aktuell seit 2024**:
Viele ältere Lernmaterialien vermitteln: *"Jede Azure-Region hat ein Region-Pair."*
Das ist **veraltet**. Microsoft hat angekündigt und umgesetzt, dass neuere Regionen
kein klassisches Region-Pair mehr erhalten — stattdessen nutzen sie mehrere
Availability Zones als primäre Redundanzstrategie.

> *"Azure continues to expand globally, and many of our newer regions provide
> multiple availability zones for higher resiliency, and don't have a region pair."*
> — Microsoft Learn, Cross-region replication in Azure

Das bedeutet für die Prüfung:
- Nicht alle Azure-Regionen haben ein Region-Pair
- Bei Non-Paired Regions ist Availability Zones + eigenes DR-Design die Lösung
- GRS-Replikation für Paired Regions: automatisch in die Pair-Region
- Für Non-Paired Regions: Geo-Replikation konfigurierbar in beliebige Regionen

Spezielle Azure-Instanzen, die von regulären Azure-Regionen physisch und
logisch getrennt sind — für Regierungen und stark regulierte Branchen:

| Sovereign Cloud | Betreiber | Zweck |
|-----------------|-----------|-------|
| **Azure Government** | Microsoft + US-Behörden | US-Bundesbehörden (FedRAMP, DoD) |
| **Azure China** | 21Vianet (nicht Microsoft) | China — Einhaltung lokaler Gesetze |
| **Azure Government Secret/Top Secret** | US-Nachrichtendienste | Klassifizierte Workloads |

**Wichtig**: Sovereign Regions sind nicht über das normale Azure Portal erreichbar
und haben einen anderen Satz verfügbarer Dienste.
  `.trim(),
};

export const CONCEPT_AZURE_AVAILABILITY_ZONES: Concept = {
  id: "azure-availability-zones",
  title: "Availability Zones",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "availability-zones", "ha", "redundancy", "datacenter", "sla"],
  // Cross-reference: CCNA STP-Redundanz → Azure Availability Zones
  relatedConceptIds: ["stp-redundancy"],
  content: `
## Availability Zones (AZs)

Eine **Availability Zone** ist ein physisch getrenntes Rechenzentrum innerhalb
einer Azure-Region. Jede Zone hat unabhängige Stromversorgung, Kühlung und
Netzwerkanbindung. Eine Region mit AZ-Unterstützung hat mindestens 3 Zonen.

\`\`\`
Region: West Europe (Amsterdam)
├── Zone 1 (DC-Cluster A) — eigene Stromversorgung, Kühlung, Netz
├── Zone 2 (DC-Cluster B) — physisch getrennt, verbunden via dediziertes Glasfaser
└── Zone 3 (DC-Cluster C) — physisch getrennt
\`\`\`

**CCNA-Analogie**: Ähnlich wie STP Layer-2-Redundanz durch Alternate Ports
sicherstellt, dass bei Ausfall eines Links das Netzwerk weiterläuft, sorgen
Availability Zones dafür, dass beim Ausfall eines Rechenzentrums die
Anwendung weiterläuft — aber auf Infrastruktur-Ebene statt auf Layer 2.

### Zone-redundante vs. zonale Deployments

> **Wichtig**: Die folgenden SLA-Werte gelten spezifisch für **Azure Virtual
> Machines mit Premium SSD**. Andere Services haben eigene SLAs — immer die
> produktspezifische SLA-Seite auf Microsoft Learn prüfen.

| Typ | Beschreibung | VM-SLA (mit Premium SSD) |
|-----|-------------|--------------------------|
| **Einzelne VM** | Keine HA-Konfiguration | 99,9% |
| **Availability Set** | Fault Domains + Update Domains im DC | 99,95% |
| **Zonal** | Ressource in spezifischer Zone gepinnt (Zone 1) | 99,9% |
| **Zone-redundant** | Ressource automatisch über min. 2 Zonen verteilt | **99,99%** |

### Was kann zone-redundant deployed werden?

- Azure Virtual Machines (in Verfügbarkeitszonen)
- Azure Load Balancer (Standard-Tier)
- Azure SQL Database (Zone-redundant konfigurierbar)
- Azure Storage (Zone-Redundant Storage / ZRS)

### Availability Zones vs. Availability Sets

| Merkmal | Availability Set | Availability Zone |
|---------|-----------------|-------------------|
| Schutz vor | Hardware-Ausfall im selben DC | Ausfall eines ganzen DCs |
| Verteilung | Update Domains + Fault Domains | Über physisch getrennte DCs |
| SLA | 99,95% | 99,99% |
| Kosten | Kein Aufpreis | Standard-VM-Preise gelten |

**Prüfungsfalle**: Availability Sets und Availability Zones sind verschiedene
Konzepte. Availability Sets schützen innerhalb eines Rechenzentrums (gegen
Hardware-Wartung und Rack-Ausfälle). Availability Zones schützen gegen den
kompletten Ausfall eines Rechenzentrums.
  `.trim(),
};

export const CONCEPT_AZURE_RESOURCE_HIERARCHY: Concept = {
  id: "azure-resource-hierarchy",
  title: "Ressourcen, Resource Groups, Subscriptions & Management Groups",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "resource-groups", "subscriptions", "management-groups", "hierarchy", "governance"],
  content: `
## Die Azure-Ressourcenhierarchie

Azure organisiert alles in einer vierstufigen Hierarchie. Diese Struktur ist
fundamental für Governance, Kostenkontrolle und Zugriffssteuerung:

\`\`\`
Management Group (Konzern-Ebene)
└── Subscription (Abrechnungs-/Umgebungs-Ebene)
    └── Resource Group (Projekt/Anwendungs-Ebene)
        └── Resource (einzelne Dienste: VM, Storage, etc.)
\`\`\`

---

### Azure Resources (Ressourcen)

Eine Ressource ist die grundlegende Verwaltungseinheit in Azure — jede
bereitgestellte Komponente ist eine Ressource: eine VM, eine Datenbank, ein
Storage Account, ein virtuelles Netzwerk.

Jede Ressource hat:
- Eine eindeutige **Resource ID** (Pfad im Azure Resource Manager)
- Eine **Region/Location**
- Einen **Typ** (z.B. Microsoft.Compute/virtualMachines)
- **Tags** (optionale Metadaten für Kostenzuordnung, Kategorisierung)

---

### Resource Groups (Ressourcengruppen)

Eine Resource Group ist ein logischer Container für Ressourcen, die zusammen
verwaltet, bereitgestellt und gelöscht werden. Sie ist kein Netzwerksegment —
Ressourcen in verschiedenen Resource Groups können trotzdem miteinander
kommunizieren.

**Regeln für Resource Groups**:
- Eine Ressource gehört immer zu **genau einer** Resource Group
- Resource Groups haben eine Region (für Metadaten-Speicherung), aber die
  enthaltenen Ressourcen können in anderen Regionen liegen
- Beim Löschen einer Resource Group werden alle enthaltenen Ressourcen gelöscht
- Zugriff und Richtlinien können auf Resource-Group-Ebene angewendet werden

**Best Practice**: Ressourcen, die zusammen einen Anwendungsstack bilden,
in einer Resource Group zusammenfassen (z.B. VM + VNet + Storage für eine App).

---

### Subscriptions (Abonnements)

Eine Subscription ist die Abrechnungseinheit in Azure. Jede Ressource wird
einer Subscription zugeordnet; Kosten werden pro Subscription abgerechnet.

Typische Subscription-Struktur in Unternehmen:
| Subscription | Zweck |
|-------------|-------|
| Dev | Entwicklungsumgebungen (günstigere Ressourcen, weniger Governance) |
| Test/Staging | Vorproduktionsumgebungen |
| Production | Live-Systeme (strenge Governance, RBAC) |
| Shared Services | Zentrale Dienste wie Monitoring, DNS, Connectivity |

Subscription-Limits (wichtig für AZ-900):
- Maximal 980 Resource Groups pro Subscription
- Spezifische Limits pro Ressourcentyp (z.B. max. 25.000 VMs pro Subscription)

---

### Management Groups

Management Groups sind Container für mehrere Subscriptions. Sie ermöglichen
die Anwendung von Azure Policies und RBAC-Rollen auf viele Subscriptions
gleichzeitig — ohne jede Subscription einzeln zu konfigurieren.

\`\`\`
Root Management Group (Tenant-Root)
├── Konzern-MG
│   ├── Produkt-A MG
│   │   ├── Subscription: Prod-A
│   │   └── Subscription: Dev-A
│   └── Produkt-B MG
│       ├── Subscription: Prod-B
│       └── Subscription: Dev-B
└── Legacy MG
    └── Subscription: Legacy-Systems
\`\`\`

**Wichtige Facts für die Prüfung**:
- Maximal 6 Hierarchie-Ebenen (ohne Root und Subscription)
- Eine Subscription kann nur in **einer** Management Group sein
- Policies und RBAC von höheren Ebenen werden vererbt (Inheritance)
- Die Root Management Group kann nicht verschoben oder gelöscht werden
  `.trim(),
};

export const CONCEPT_AZURE_ARCHITECTURE_GUIDE: Concept = {
  id: "azure-architecture-guide",
  title: "Lernguide: Azure-Architektur",
  appliesTo: ["az-900"],
  tags: ["azure", "guide", "architecture", "regions", "availability-zones"],
  content: `
## Lernziele

- Die Hierarchie Region → Availability Zone → Datacenter erklären
- Region-Paare von Availability Zones abgrenzen
- Die Bedeutung von Sovereign Regions für regulierte Branchen beschreiben
- Die vierstufige Ressourcenhierarchie (Resource → RG → Subscription → MG) skizzieren
- Erklären, warum Resource Groups keine Netzwerksegmente sind
- Angemessene Subscription-Strukturen für typische Unternehmensszenarien vorschlagen

## Praxis-Szenario

Die "GlobalTech AG" (international tätig, Hauptsitz Frankfurt, Büros in USA)
plant ihre Azure-Umgebung:

- Die Unternehmens-IT will zentrale Governance über alle Teams durchsetzen
- Das Produkt-Team in den USA braucht niedrige Latenz zu US-amerikanischen Kunden
- Kundendaten müssen wegen DSGVO in der EU verbleiben
- Dev/Test soll kostengünstig und flexibel sein; Prod braucht 99,99% SLA

**Canvas-Übung**: Zeichne die Hierarchie-Struktur der GlobalTech AG:
Management Groups oben, darunter Subscriptions (EU-Prod, US-Prod, Dev/Test),
darunter Resource Groups (Networking, Compute, Data). Markiere, welche Azure-Region
du für EU-Prod wählst und warum (Datensouveränität + Region-Pair für DR).

## Typische Prüfungsfallen

- ⚠️ **"Availability Zone = Region-Pair"** — FALSCH. AZs sind physisch getrennte
  DCs innerhalb einer Region. Region-Paare sind zwei verschiedene Regionen.
  Region-Paare schützen gegen regionale Katastrophen, AZs gegen DC-Ausfall.

- ⚠️ **"Ressourcen müssen in der gleichen Region wie ihre Resource Group sein"** —
  FALSCH. Die Region einer Resource Group ist nur der Speicherort für Metadaten.
  Ressourcen darin können in beliebigen Regionen liegen.

- ⚠️ **"Eine Subscription gehört mehreren Management Groups"** — FALSCH. Eine
  Subscription kann immer nur einer Management Group zugeordnet sein.

- ⚠️ **"Sovereign Regions sind über das normale Azure Portal erreichbar"** —
  FALSCH. Azure Government und Azure China haben eigene separate Portale und
  Endpunkte.
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_ARCHITECTURE_QUESTIONS: Question[] = [
  {
    id: "az900-arch-q1",
    type: "single-choice",
    points: 10,
    text: "Ein deutsches Unternehmen muss sicherstellen, dass alle Kundendaten innerhalb der EU gespeichert bleiben (DSGVO). Welche Azure-Region ist die primäre Wahl?",
    explanation: "Germany West Central (Frankfurt) ist eine EU-Region mit Datensouveränität in Deutschland. Azure Government ist nur für US-Behörden. Azure China wird von 21Vianet betrieben und ist für China-Compliance — nicht für DSGVO.",
    answers: [
      { id: "a", text: "East US — günstigste Region, gute Performance", isCorrect: false },
      { id: "b", text: "Germany West Central (Frankfurt) — EU-Region, DSGVO-konform", isCorrect: true },
      { id: "c", text: "Azure Government — maximale Sicherheit", isCorrect: false },
      { id: "d", text: "Sovereign Region China — separate Infrastruktur", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q2",
    type: "single-choice",
    points: 10,
    text: "Was ist der Hauptunterschied zwischen einer Availability Zone und einem Region-Paar?",
    explanation: "Availability Zones = physisch getrennte DCs innerhalb einer Region (schützen gegen DC-Ausfall). Region-Paare = zwei verschiedene Regionen, mindestens 300 km entfernt (schützen gegen regionale Katastrophen wie Naturkatastrophen).",
    answers: [
      { id: "a", text: "Availability Zones sind für Disaster Recovery zwischen zwei Ländern; Region-Paare schützen innerhalb einer Region", isCorrect: false },
      { id: "b", text: "Availability Zones sind physisch getrennte DCs innerhalb einer Region; Region-Paare sind zwei getrennte Regionen für DR", isCorrect: true },
      { id: "c", text: "Beide Begriffe beschreiben dasselbe Konzept mit unterschiedlichen Namen", isCorrect: false },
      { id: "d", text: "Region-Paare bieten 99,99% SLA; Availability Zones nur 99,9%", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q3",
    type: "single-choice",
    points: 10,
    text: "Du planst das Deployment von Azure Virtual Machines (Premium SSD) für eine kritische Anwendung. Welche Deployment-Strategie erreicht den VM-SLA von 99,99% Verfügbarkeit?",
    explanation: "Für Azure VMs mit Premium SSD gilt: Einzelne VM = 99,9% SLA; Availability Set = 99,95% SLA; VMs über mindestens 2 Availability Zones verteilt = 99,99% SLA. Diese Werte gelten speziell für VMs — andere Azure-Services haben eigene SLAs.",
    answers: [
      { id: "a", text: "Einzelne VM mit Premium SSD in einer Region ohne AZs (99,9% SLA)", isCorrect: false },
      { id: "b", text: "Zwei VMs in einem Availability Set (99,95% SLA)", isCorrect: false },
      { id: "c", text: "VMs über mindestens zwei Availability Zones verteilt (99,99% SLA)", isCorrect: true },
      { id: "d", text: "Eine VM mit Ultra Disk statt Premium SSD", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q4",
    type: "single-choice",
    points: 10,
    text: "In welchem Verhältnis stehen Resource Groups und Subscriptions zueinander? (Wähle die korrekte Aussage)",
    explanation: "Eine Subscription ist ein Container für viele Resource Groups. Jede Resource Group gehört zu genau einer Subscription. Eine Resource Group kann NICHT Ressourcen aus verschiedenen Subscriptions enthalten.",
    answers: [
      { id: "a", text: "Eine Subscription enthält mehrere Resource Groups; eine Resource Group gehört zu genau einer Subscription", isCorrect: true },
      { id: "b", text: "Eine Resource Group kann Ressourcen aus mehreren Subscriptions enthalten", isCorrect: false },
      { id: "c", text: "Eine Subscription entspricht immer genau einer Resource Group", isCorrect: false },
      { id: "d", text: "Resource Groups und Subscriptions sind dasselbe — nur unterschiedliche Bezeichnungen", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q5",
    type: "single-choice",
    points: 10,
    text: "Was passiert, wenn eine Resource Group gelöscht wird?",
    explanation: "Das Löschen einer Resource Group löscht ALLE darin enthaltenen Ressourcen. Das ist ein wichtiger Lifecycle-Aspekt: Resource Groups sind die Deployment- und Lösch-Einheit. Dies ist sowohl eine Stärke (einfaches Aufräumen) als auch ein Risiko (versehentliches Löschen).",
    answers: [
      { id: "a", text: "Nur die Resource Group selbst wird gelöscht; enthaltene Ressourcen bleiben bestehen", isCorrect: false },
      { id: "b", text: "Alle Ressourcen in der Resource Group werden ebenfalls gelöscht", isCorrect: true },
      { id: "c", text: "Ressourcen werden in die Standard-Resource Group verschoben", isCorrect: false },
      { id: "d", text: "Die Ressourcen werden in der Subscription archiviert, aber nicht gelöscht", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q6",
    type: "single-choice",
    points: 10,
    text: "Welche der folgenden Aussagen zu Management Groups ist KORREKT?",
    explanation: "Azure Policy auf Management Group-Ebene wird an alle untergeordneten Subscriptions und Resource Groups vererbt (Inheritance). Eine Subscription gehört immer zu genau einer MG (nicht mehreren). Maximal 6 Hierarchie-Ebenen (ohne Root). Management Groups und Resource Groups lösen unterschiedliche Probleme.",
    answers: [
      { id: "a", text: "Eine Subscription kann mehreren Management Groups gleichzeitig angehören", isCorrect: false },
      { id: "b", text: "Management Groups können maximal 10 Hierarchie-Ebenen tief sein", isCorrect: false },
      { id: "c", text: "Azure Policy kann auf Management Group-Ebene angewendet und an alle Subscriptions vererbt werden", isCorrect: true },
      { id: "d", text: "Management Groups ersetzen Resource Groups bei Enterprise-Deployments", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q7",
    type: "single-choice",
    points: 10,
    text: "Für welchen Anwendungsfall sind Azure Sovereign Regions gedacht?",
    explanation: "Sovereign Regions (Azure Government, Azure China) sind physisch und logisch vom normalen Azure-Netzwerk getrennt. Sie existieren, um die Compliance-Anforderungen von Regierungsbehörden und streng regulierten Branchen zu erfüllen — z.B. FedRAMP, DoD IL5 für US-Behörden.",
    answers: [
      { id: "a", text: "Für Anwendungen mit sehr hohen Latenzanforderungen", isCorrect: false },
      { id: "b", text: "Für Regierungsbehörden und Organisationen mit strikten regulatorischen Anforderungen zur Datenisolation", isCorrect: true },
      { id: "c", text: "Für Disaster Recovery — Sovereign Regions sind immer Region-Paare", isCorrect: false },
      { id: "d", text: "Für günstigere Preise durch geografisch entfernte Standorte", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q8",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen möchte in einer Region ohne Availability Zones die Verfügbarkeit seiner VMs verbessern. Welche Option schützt vor Hardware-Wartungsausfällen innerhalb desselben Rechenzentrums?",
    explanation: "Availability Sets verteilen VMs über Fault Domains (verschiedene physische Hardware/Racks) und Update Domains (verhindert gleichzeitiges Neustart bei Wartung). Sie schützen innerhalb eines Rechenzentrums. Azure Site Recovery und Backup sind DR/Backup-Lösungen, keine HA-Konfiguration.",
    answers: [
      { id: "a", text: "Azure Site Recovery", isCorrect: false },
      { id: "b", text: "Availability Set (mit Fault Domains und Update Domains)", isCorrect: true },
      { id: "c", text: "Reserved Instances", isCorrect: false },
      { id: "d", text: "Azure Backup", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q9",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI Aussagen zur Resource Group-Region sind korrekt? (Wähle 2)",
    explanation: "Die Region der Resource Group ist nur für ihre eigenen Metadaten relevant (B korrekt). Ressourcen in einer Resource Group können in beliebigen Regionen liegen (C korrekt). Es gibt keine Einschränkung, dass Ressourcen in der Region der RG sein müssen (A falsch).",
    answers: [
      { id: "a", text: "Die Region der Resource Group bestimmt, in welcher Region alle enthaltenen Ressourcen gespeichert werden", isCorrect: false },
      { id: "b", text: "Die Region der Resource Group ist der Speicherort für die Metadaten der Resource Group selbst", isCorrect: true },
      { id: "c", text: "Ressourcen innerhalb einer Resource Group können in verschiedenen Regionen liegen", isCorrect: true },
      { id: "d", text: "Resource Groups mit Region 'global' können keine virtuellen Netzwerke enthalten", isCorrect: false },
    ],
  },
  {
    id: "az900-arch-q10",
    type: "single-choice",
    points: 10,
    text: "Bei Azure-Plattform-Updates wird immer nur eine Region eines Region-Paares gleichzeitig aktualisiert. Welcher Vorteil ergibt sich daraus?",
    explanation: "Durch das gestaffelte Update-Rollout bei Region-Paaren ist sichergestellt, dass nie beide Regionen eines Paares gleichzeitig von einem Update-Ausfall betroffen sind. Das ist der Kern-DR-Vorteil von Region-Paaren für Plattform-Updates.",
    answers: [
      { id: "a", text: "Kostenersparnis durch gebündelte Updates", isCorrect: false },
      { id: "b", text: "Schutz vor gleichzeitigen Ausfällen beider Regionen bei Plattform-Updates", isCorrect: true },
      { id: "c", text: "Automatische Datenmigration zwischen den Regionen", isCorrect: false },
      { id: "d", text: "Niedrigere Netzwerklatenz zwischen den Regionen", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_ARCHITECTURE: Quiz = {
  id: "az900-quiz-azure-architecture",
  title: "Quiz: Azure-Architektur & Infrastruktur",
  description: "Regionen, Region-Paare, Sovereign Regions, Availability Zones, Resource Groups, Subscriptions und Management Groups",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_ARCHITECTURE_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_ARCHITECTURE: Topic = {
  id: "azure-architecture",
  title: "Azure-Architektur & Infrastruktur",
  description:
    "Azure-Regionen, Region-Paare, Sovereign Regions, Availability Zones, Azure Datacenters sowie die Ressourcenhierarchie: Resources, Resource Groups, Subscriptions und Management Groups.",
  conceptIds: [
    "azure-regions",
    "azure-availability-zones",
    "azure-resource-hierarchy",
    "azure-architecture-guide",
  ],
  quizIds: ["az900-quiz-azure-architecture"],
  exerciseIds: ["exercise-az900-architecture-diagram"],
  prerequisiteTopicIds: ["cloud-fundamentals-topic"],
  estimatedMinutes: 75,
  tags: ["azure", "architecture", "regions", "availability-zones", "resource-groups"],
};

export const AZURE_ARCHITECTURE_CONCEPTS: Record<string, Concept> = {
  "azure-regions": CONCEPT_AZURE_REGIONS,
  "azure-availability-zones": CONCEPT_AZURE_AVAILABILITY_ZONES,
  "azure-resource-hierarchy": CONCEPT_AZURE_RESOURCE_HIERARCHY,
  "azure-architecture-guide": CONCEPT_AZURE_ARCHITECTURE_GUIDE,
};

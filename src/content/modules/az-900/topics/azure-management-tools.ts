// ============================================================
// AZ-900 Topic 8: Azure Management Tools & Deployment
// Domain 3: Azure Management and Governance (~30-35%)
// Outline: "Describe features and tools for managing and deploying Azure resources"
// Sources:
//   learn.microsoft.com/training/modules/describe-features-tools-manage-deploy-azure-resources/
//   (units 2, 3, 4, 5, 6 — geprüft April 2026)
//   learn.microsoft.com/azure/azure-arc/overview
//   learn.microsoft.com/azure/azure-resource-manager/bicep/overview
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_AZURE_PORTALS: Concept = {
  id: "azure-portals-tools",
  title: "Azure Portal, Cloud Shell, PowerShell & CLI: Interaktionsmethoden",
  appliesTo: ["az-900"],
  tags: ["azure", "portal", "cloud-shell", "powershell", "cli", "tools"],
  content: `
## Azure-Interaktionsmethoden im Überblick

Azure bietet vier Hauptwege zur Interaktion mit der Plattform:
1. **Azure Portal** — Web-basierte GUI
2. **Azure Cloud Shell** — Browser-basierte Shell
3. **Azure PowerShell** — Cmdlets für Azure
4. **Azure CLI** — Bash-orientierte Kommandozeile

### Azure Portal

Das Azure Portal (portal.azure.com) ist eine **webbasierte grafische Benutzeroberfläche**
zum Erstellen, Verwalten und Überwachen aller Azure-Ressourcen.

Merkmale (verifiziert: MS Learn Unit 2):
- Keine Software-Installation nötig — läuft im Browser
- Resilient: In jedem Azure-Datacenter präsent → kein Single Point of Failure
- **Wartungsarbeiten ohne Downtime** — das Portal ist kontinuierlich verfügbar
- Unterstützt custom Dashboards, Role-based Access, Azure Marketplace
- Bietet grafische Visualisierungen (Topology, Monitoring-Charts, Advisor-Empfehlungen)

Wann geeignet: Einmalige Aktionen, visuelle Erkundung, neue Nutzer, komplexe Setups
ohne Scripting-Kenntnisse.

### Azure Cloud Shell

Eine **browser-basierte Shell-Umgebung**, die direkt im Azure Portal (oder shell.azure.com)
läuft und für Azure vorkonfiguriert ist.

Merkmale (verifiziert: MS Learn Unit 3):
- Direkt im Browser — keine lokale Installation
- **Automatisch mit dem Azure-Account authentifiziert** — keine separate Anmeldung nötig
- Persistenter Speicher via Azure File Share (geräteübergreifend verfügbar)
- Unterstützt **beide** Shell-Typen: **PowerShell UND Bash (Azure CLI)**
- Enthält vorinstalliert: Azure CLI, Azure PowerShell, kubectl, Terraform, Ansible, etc.

⚠️ **Prüfungspunkt**: Cloud Shell unterstützt BEIDE — PowerShell und CLI.
Es ist kein reines PowerShell- oder reines CLI-Tool.

### Azure PowerShell

Eine **PowerShell-Umgebung mit Azure-spezifischen Cmdlets**, die den Azure REST API aufrufen.

Merkmale (verifiziert: MS Learn Unit 4):
- **Cross-Platform**: Windows, Linux, macOS
- Cmdlet-Syntax: \`New-AzResourceGroup\`, \`Get-AzVM\`, \`Remove-AzStorageAccount\`
- Vorteile: Skriptbasiert und automatisierbar, idempotent, in CI/CD integrierbar
- Jedes Cmdlet ruft intern die Azure REST API auf
- Bietet dieselbe Funktionalität wie Azure CLI (aber mit PowerShell-Syntax)

Wann geeignet: Windows-Administratoren, Umgebungen mit etablierter PowerShell-Infrastruktur,
komplexe Automatisierung mit PowerShell-Modulen.

### Azure CLI

Eine **Bash-basierte Kommandozeilenschnittstelle** für Azure — funktional äquivalent
zu Azure PowerShell.

Merkmale (verifiziert: MS Learn Unit 5):
- **Cross-Platform**: Windows, Linux, macOS
- Syntax: \`az group create\`, \`az vm list\`, \`az storage account delete\`
- Vertraut für Linux/Unix-Administratoren — Bash-ähnliche Syntax
- In Azure Cloud Shell vorinstalliert
- Bietet dieselbe Funktionalität wie Azure PowerShell (nur andere Syntax)

Wann geeignet: Linux/DevOps-Umgebungen, CI/CD-Pipelines, Teams mit Bash-Erfahrung.

### Zusammenfassung: Auswahl-Leitfaden

| Tool | Installation | Shell-Typ | Syntax |
|------|-------------|-----------|--------|
| Azure Portal | Nein (Browser) | GUI | Klick-basiert |
| Azure Cloud Shell | Nein (Browser) | PowerShell oder CLI | Beides |
| Azure PowerShell | Ja (lokal) | PowerShell | \`Verb-AzNoun\` |
| Azure CLI | Ja (lokal) | Bash | \`az gruppe aktion\` |
  `.trim(),
};

export const CONCEPT_AZURE_ARC: Concept = {
  id: "azure-arc",
  title: "Azure Arc: Azure-Management außerhalb von Azure",
  appliesTo: ["az-900"],
  tags: ["azure", "arc", "hybrid", "multi-cloud", "management", "arm"],
  content: `
## Azure Arc

**Azure Arc erweitert das Azure-Management-Plane auf Ressourcen außerhalb von Azure.**

> 🔑 **Merksatz**: "Azure Arc = Azure-Management auf Ressourcen außerhalb von Azure"
>
> Wenn eine Frage nach Hybrid-Cloud-Management oder der Verwaltung von
> non-Azure-Ressourcen über Azure fragt: Azure Arc.

### Was Azure Arc macht

Azure Arc **projiziert non-Azure-Ressourcen in den Azure Resource Manager (ARM)**.
Das bedeutet: Diese Ressourcen erscheinen im Azure Portal wie Azure-native Ressourcen
und können mit denselben Azure-Tools verwaltet werden.

Mit Azure Arc können auf non-Azure-Ressourcen folgende Azure-Services angewendet werden:
- **Azure RBAC** — zentrale Zugriffskontrolle
- **Azure Policy** — Compliance-Regeln auch für on-prem Ressourcen
- **Azure Monitor** — Monitoring und Logging zentralisiert
- **Microsoft Defender for Cloud** — Security Posture für non-Azure-Ressourcen

### Typisches Szenario

Ein Unternehmen betreibt 200 on-premises-Server und möchte sie zentral mit Azure Policy
verwalten — ohne sie nach Azure zu migrieren. Azure Arc-Agent wird einmalig installiert,
danach erscheinen alle Server im Azure Portal und erhalten Azure Policy, RBAC und Monitor.

### Abgrenzung: Azure Arc vs. Azure Migrate

| Zweck | Tool |
|-------|------|
| Laufende Verwaltung non-Azure-Ressourcen (Day 2) | **Azure Arc** |
| Einmalige Migration von Workloads nach Azure | **Azure Migrate** |

> 📌 **AZ-900-Scope**: Für AZ-900 gilt die Kernaussage "Azure-Management auf non-Azure-Ressourcen".
> Welche spezifischen Resource-Types Arc unterstützt (Kubernetes, SQL Server, Data Services)
> ist AZ-104/305-Vertiefungswissen — nicht prüfungsrelevant für AZ-900.
  `.trim(),
};

export const CONCEPT_INFRASTRUCTURE_AS_CODE: Concept = {
  id: "azure-iac-tools",
  title: "Infrastructure as Code: ARM Templates und Bicep",
  appliesTo: ["az-900"],
  tags: ["azure", "iac", "arm-templates", "bicep", "infrastructure-as-code"],
  content: `
## Infrastructure as Code (IaC) in Azure

**Infrastructure as Code (IaC)** bedeutet, Infrastruktur über Code-Dateien zu
definieren und zu deployen — statt manuell im Portal zu klicken.

Vorteile von IaC:
- **Reproduzierbarkeit**: Gleiche Infrastruktur in Dev, Test, Prod — aus einem Template
- **Versionierung**: Infrastruktur-Änderungen in Git verfolgen
- **Automatisierung**: In CI/CD-Pipelines integrierbar

### ARM Templates (Azure Resource Manager Templates)

**ARM Templates sind JSON-Dateien, die Azure-Ressourcen deklarativ beschreiben.**

Merkmale (verifiziert: MS Learn Unit 6):
- **Deklarative Syntax**: Du definierst "was" gebaut werden soll, nicht "wie"
- **JSON-Format**: Alle Azure-Ressourcen können in JSON beschrieben werden
- **Idempotent**: Mehrfaches Ausführen desselben Templates führt zum gleichen Ergebnis
- **Orchestrierung**: ARM Template Engine erstellt Ressourcen in der richtigen Reihenfolge
- **Parallelisierung**: Unabhängige Ressourcen werden parallel erstellt

ARM Templates werden direkt von Azure Resource Manager verarbeitet.

### Bicep — Microsofts empfohlene IaC-Sprache für Azure

**Bicep ist eine domänenspezifische Sprache (DSL) für Azure-Deployments.**
Bicep wurde von Microsoft als vereinfachte, typsichere Alternative zu ARM-JSON entwickelt.

Merkmale (verifiziert: MS Learn Unit 6 + Bicep Overview):
- **Kompiliert zu ARM JSON**: Jede Bicep-Datei wird vor dem Deployment in ARM JSON übersetzt
- ARM bleibt die technische Grundlage — Bicep ist eine Abstraktion darüber
- **Einfachere Syntax**: Deutlich weniger Boilerplate als JSON
- **Typ-Sicherheit**: Compiler prüft Ressourcen-Typen und Properties
- **Kostenlos und Open Source** — vollständig von Microsoft supported
- **Idempotent** (wie ARM): Mehrfaches Deployen ist sicher

**Microsoft empfiehlt Bicep für neue Azure-IaC-Projekte** (statt ARM JSON direkt).

### Drittanbieter-IaC: Terraform (Kurzerwähnung)

Neben den Azure-nativen Tools gibt es Multi-Cloud IaC-Tools von Drittanbietern.
Das bekannteste ist **Terraform von HashiCorp** — ein Open-Source-Tool, das
Azure, AWS, GCP und andere Clouds über Provider-Plugins unterstützt.

> **Abgrenzung**: Terraform ist kein Microsoft-Produkt. Für Azure-only Umgebungen
> empfiehlt Microsoft Bicep. Terraform ist relevant, wenn mehrere Cloud-Provider
> mit derselben Toolchain verwaltet werden sollen.

### ARM vs. Bicep Vergleich

| Aspekt | ARM Templates | Bicep |
|--------|--------------|-------|
| Hersteller | Microsoft | Microsoft |
| Format | JSON | DSL (eigene Syntax) |
| Grundlage | Direkt ARM | Kompiliert zu ARM |
| Syntax-Aufwand | Hoch (Boilerplate) | Gering (kompakt) |
| Azure-Support | ✅ Official | ✅ Official (empfohlen) |
| Multi-Cloud | ❌ Azure only | ❌ Azure only |
  `.trim(),
};

export const CONCEPT_MANAGEMENT_TOOLS_GUIDE: Concept = {
  id: "azure-management-tools-guide",
  title: "Lernguide: Azure Management Tools",
  appliesTo: ["az-900"],
  tags: ["azure", "management", "guide", "arc", "iac", "portal"],
  content: `
## Lernziele

- Azure Portal (GUI, kein Downtime), Cloud Shell (Browser-Shell, PowerShell + CLI), PowerShell, CLI unterscheiden
- Azure Arc als "Azure-Management für non-Azure-Ressourcen" erklären
- ARM Templates (JSON, deklarativ, idempotent), Bicep (kompiliert zu ARM, Microsoft-empfohlen), Terraform (HashiCorp, Multi-Cloud, kein Microsoft-Produkt) abgrenzen

## Typische Prüfungsfallen

- ⚠️ **Azure Cloud Shell unterstützt BEIDE**: PowerShell UND CLI (Bash).
  Es ist kein reines PowerShell-Tool und kein reines CLI-Tool.

- ⚠️ **Terraform ist KEIN Microsoft-Produkt**: HashiCorp. Multi-Cloud.
  Wer sagt, Terraform sei von Microsoft oder Azure-exklusiv, liegt falsch.

- ⚠️ **Bicep kompiliert zu ARM JSON**: Bicep ist eine Abstraktion, ARM bleibt die Grundlage.
  "Bicep ersetzt ARM" ist falsch — es ist eine vereinfachte Syntax, die zu ARM konvertiert.

- ⚠️ **Azure Arc ≠ Azure Migrate**: Arc ist für laufende Verwaltung (Day 2 Operations).
  Azure Migrate ist für die einmalige Migration von Workloads nach Azure.

- ⚠️ **Azure Arc erweitert ARM**: Non-Azure-Ressourcen erscheinen als ARM-Ressourcen.
  Das bedeutet: Azure RBAC, Azure Policy, Azure Monitor gelten auch für on-prem Server mit Arc-Agent.

## Tool-Auswahl nach Szenario

| Szenario | Richtiges Tool |
|----------|---------------|
| Grafisch eine VM im Browser erstellen | Azure Portal |
| On-the-fly Azure CLI nutzen ohne Installation | Azure Cloud Shell |
| Skript: 50 Resource Groups automatisch erstellen (Windows Admin) | Azure PowerShell |
| Skript: Monitoring-Pipeline in GitHub Actions (Linux) | Azure CLI |
| 300 on-prem Server zentral mit Azure Policy verwalten | Azure Arc |
| Azure-Infrastruktur reproduzierbar und versioniert deployen | Bicep (Azure-only) oder Terraform (Multi-Cloud) |
| Vorhandenes ARM-JSON-Template weiternutzen | ARM Template |
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_MANAGEMENT_TOOLS_QUESTIONS: Question[] = [
  {
    id: "az900-mgmt-tools-q1",
    type: "single-choice",
    points: 10,
    text: "Welche Aussage zu Azure Cloud Shell ist korrekt?",
    explanation: "Azure Cloud Shell ist browser-basiert, automatisch mit dem Azure-Account authentifiziert und unterstützt BEIDE Shell-Umgebungen: PowerShell und Bash (Azure CLI). Es erfordert keine lokale Installation und bietet persistenten Speicher via Azure File Share.",
    answers: [
      { id: "a", text: "Cloud Shell unterstützt nur PowerShell — für Azure CLI muss eine lokale Installation erfolgen", isCorrect: false },
      { id: "b", text: "Cloud Shell ist browser-basiert, automatisch authentifiziert und unterstützt PowerShell und Azure CLI", isCorrect: true },
      { id: "c", text: "Cloud Shell erfordert eine lokale Softwareinstallation auf dem eigenen Computer", isCorrect: false },
      { id: "d", text: "Cloud Shell ist nur für Enterprise-Kunden verfügbar", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q2",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen betreibt 150 Server on-premises und möchte Azure Policy auf diese Server anwenden, ohne die Server nach Azure zu migrieren. Welcher Azure-Dienst ermöglicht das?",
    explanation: "Azure Arc projiziert non-Azure-Ressourcen (on-premises, andere Clouds) in den Azure Resource Manager. Dadurch können Azure-Services wie Azure Policy, RBAC, Monitoring und Defender for Cloud auf diese Ressourcen angewendet werden — als würden sie in Azure laufen.",
    answers: [
      { id: "a", text: "Azure Migrate — migriert Server nach Azure und ermöglicht dann Policy-Anwendung", isCorrect: false },
      { id: "b", text: "Azure Monitor — kann on-prem Server überwachen und Policy-Alerts senden", isCorrect: false },
      { id: "c", text: "Azure Arc — projiziert on-prem Ressourcen in ARM, ermöglicht Azure Policy darauf", isCorrect: true },
      { id: "d", text: "Management Groups können direkt auf on-prem Server angewendet werden", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q3",
    type: "single-choice",
    points: 10,
    text: "Was ist der technische Unterschied zwischen Bicep und ARM Templates?",
    explanation: "Bicep ist eine domänenspezifische Sprache, die vor dem Deployment automatisch zu ARM JSON kompiliert. ARM bleibt die technische Grundlage. Bicep ist keine Alternative zu ARM, sondern eine vereinfachte Syntax-Schicht darüber — mit weniger Boilerplate, besserer Lesbarkeit und Typ-Sicherheit.",
    answers: [
      { id: "a", text: "Bicep ersetzt ARM Templates komplett — ARM wird nicht mehr verwendet", isCorrect: false },
      { id: "b", text: "Bicep ist nur für Linux-Deployments; ARM Templates für Windows", isCorrect: false },
      { id: "c", text: "Bicep kompiliert zu ARM JSON — ARM bleibt die Grundlage, Bicep ist eine vereinfachte Syntax darüber", isCorrect: true },
      { id: "d", text: "ARM Templates sind neuer als Bicep und empfohlen für neue Projekte", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q4",
    type: "single-choice",
    points: 10,
    text: "Welche der folgenden Aussagen zu Terraform ist korrekt?",
    explanation: "Terraform ist ein Open-Source IaC-Tool von HashiCorp — NICHT von Microsoft. Es unterstützt mehrere Cloud-Provider (Azure, AWS, GCP) über sogenannte Provider. Der AzureRM-Provider ermöglicht Azure-Deployments, aber Terraform ist kein exklusives Microsoft-Produkt.",
    answers: [
      { id: "a", text: "Terraform ist ein Microsoft-Produkt, das speziell für Azure entwickelt wurde", isCorrect: false },
      { id: "b", text: "Terraform ist ein Multi-Cloud IaC-Tool von HashiCorp — kein Microsoft-Produkt", isCorrect: true },
      { id: "c", text: "Terraform und Bicep sind Synonyme — gleiches Tool, verschiedene Namen", isCorrect: false },
      { id: "d", text: "Terraform ist nur für die Migration von on-premises Workloads in die Cloud", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q5",
    type: "single-choice",
    points: 10,
    text: "Welches Tool empfiehlt Microsoft für neue Azure-IaC-Projekte (reine Azure-Umgebung)?",
    explanation: "Microsoft empfiehlt Bicep für neue Azure-IaC-Projekte. Bicep ist kostenlos, Open Source, vollständig von Microsoft supported und hat eine einfachere Syntax als ARM JSON. ARM Templates werden weiter unterstützt, aber nicht aktiv weiterentwickelt. Terraform ist eine Option, aber HashiCorp-Produkt und für Multi-Cloud gedacht.",
    answers: [
      { id: "a", text: "ARM Templates — JSON ist die native Azure-Sprache und wird bevorzugt", isCorrect: false },
      { id: "b", text: "Terraform — weil es Multi-Cloud ist und mehr Flexibilität bietet", isCorrect: false },
      { id: "c", text: "Bicep — Microsofts empfohlene IaC-Sprache für Azure, kompiliert zu ARM, kostenlos und supported", isCorrect: true },
      { id: "d", text: "Azure PowerShell Scripts — einfacher als deklarative Templates", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q6",
    type: "single-choice",
    points: 10,
    text: "Welche Aussage zum Azure Portal ist korrekt?",
    explanation: "Das Azure Portal ist in jedem Azure-Datacenter präsent und hat keinen Single Point of Failure. Es wird fortlaufend aktualisiert ohne Maintenance-Downtime. Es ist webbasiert und erfordert keine Installation. Es kann von jedem modernen Browser genutzt werden.",
    answers: [
      { id: "a", text: "Das Azure Portal benötigt eine lokale Installation auf jedem Computer", isCorrect: false },
      { id: "b", text: "Das Azure Portal hat geplante Wartungszeiten mit Downtime — wie andere Azure-Dienste", isCorrect: false },
      { id: "c", text: "Das Azure Portal ist webbasiert, resilient (in jedem Datacenter präsent) und hat keine Wartungs-Downtime", isCorrect: true },
      { id: "d", text: "Das Azure Portal ist nur über Microsoft Edge verfügbar", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q7",
    type: "single-choice",
    points: 10,
    text: "Ein Linux-Administrator möchte via Skript regelmäßig 10 Azure Storage Accounts anlegen und löschen. Welches Tool ist am besten geeignet?",
    explanation: "Azure CLI verwendet Bash-ähnliche Syntax und ist für Linux-Administratoren am natürlichsten. Es ist cross-platform (Windows/Linux/macOS), unterstützt Scripting vollständig und hat dieselbe Funktionalität wie Azure PowerShell. Azure Cloud Shell wäre eine Option, erfordert aber Browser-Zugang.",
    answers: [
      { id: "a", text: "Azure Portal — grafische Oberfläche für alle Aktionen", isCorrect: false },
      { id: "b", text: "Azure PowerShell — am leistungsfähigsten für alle Azure-Administratoren", isCorrect: false },
      { id: "c", text: "Azure CLI — Bash-Syntax, cross-platform, ideal für Linux-Admins und CI/CD", isCorrect: true },
      { id: "d", text: "ARM Templates — am geeignetsten für wiederholte Ressourcen-Erstellung", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q8",
    type: "single-choice",
    points: 10,
    text: "Azure Arc kann auf welche der folgenden Ressourcentypen angewendet werden?",
    explanation: "Azure Arc unterstützt: Servers und VMs (Windows/Linux, on-prem und andere Clouds), Kubernetes-Cluster (jeder CNCF-konforme Cluster), Azure Data Services on-premises (z.B. Azure SQL Managed Instance), und SQL Server on-premises. Es ist nicht auf Azure-native Ressourcen beschränkt.",
    answers: [
      { id: "a", text: "Nur Azure-native VMs und Kubernetes-Cluster in Azure", isCorrect: false },
      { id: "b", text: "On-premises Server, Kubernetes-Cluster (jeder CNCF-Cluster), SQL Server on-prem und andere Clouds", isCorrect: true },
      { id: "c", text: "Nur Windows Server — Linux ist nicht unterstützt", isCorrect: false },
      { id: "d", text: "Nur Ressourcen in anderen Microsoft-Clouds (Azure Government, Azure China)", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q9",
    type: "single-choice",
    points: 10,
    text: "Was ist eine wichtige Eigenschaft von ARM Templates (Azure Resource Manager Templates)?",
    explanation: "ARM Templates sind idempotent: Dasselbe Template kann mehrfach ausgeführt werden und führt immer zum gleichen Ergebnis. Wenn eine Ressource bereits existiert, wird sie nicht neu erstellt. Das macht ARM Templates sicher für automatisierte Deployments und Pipelines.",
    answers: [
      { id: "a", text: "ARM Templates sind imperativ — sie beschreiben, wie jeder Deployment-Schritt auszuführen ist", isCorrect: false },
      { id: "b", text: "ARM Templates sind idempotent — mehrfaches Ausführen desselben Templates führt immer zum gleichen Ergebnis", isCorrect: true },
      { id: "c", text: "ARM Templates können nur im Azure Portal erstellt werden — kein Code-Editor-Support", isCorrect: false },
      { id: "d", text: "ARM Templates gelten nur für Virtual Machines — nicht für alle Ressourcentypen", isCorrect: false },
    ],
  },
  {
    id: "az900-mgmt-tools-q10",
    type: "single-choice",
    points: 10,
    text: "Welches Azure-native IaC-Tool empfiehlt Microsoft für neue Azure-only Projekte — und warum ist Bicep nicht dasselbe wie ARM Templates?",
    explanation: "Microsoft empfiehlt Bicep für neue Azure-IaC-Projekte. Bicep ist keine Alternative zu ARM, sondern kompiliert zu ARM JSON — ARM bleibt die technische Grundlage. Bicep bietet einfachere Syntax, Typ-Sicherheit und weniger Boilerplate. Terraform (HashiCorp) ist eine Option für Multi-Cloud, aber kein Microsoft-Produkt und nicht die Microsoft-Empfehlung für Azure-only.",
    answers: [
      { id: "a", text: "ARM Templates — als native JSON-Sprache von Azure, direkt von ARM verarbeitet", isCorrect: false },
      { id: "b", text: "Terraform — weil es Multi-Cloud ist und in Azure Cloud Shell vorinstalliert", isCorrect: false },
      { id: "c", text: "Bicep — Microsofts empfohlene IaC-Sprache; kompiliert zu ARM JSON, einfachere Syntax, kostenlos", isCorrect: true },
      { id: "d", text: "Azure PowerShell Scripts — flexibler als deklarative Templates", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_MANAGEMENT_TOOLS: Quiz = {
  id: "az900-quiz-azure-management-tools",
  title: "Quiz: Azure Management Tools & Deployment",
  description: "Azure Portal (resilient, kein Downtime), Cloud Shell (PowerShell + CLI), Azure PowerShell, Azure CLI, Azure Arc (außerhalb Azure), ARM Templates (JSON, idempotent), Bicep (Microsoft-empfohlen, kompiliert zu ARM), Terraform (HashiCorp, Multi-Cloud)",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_MANAGEMENT_TOOLS_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_MANAGEMENT_TOOLS: Topic = {
  id: "azure-management-tools",
  title: "Azure Management Tools & Infrastructure as Code",
  description:
    "Azure Portal (GUI, Continuous Availability), Azure Cloud Shell (Browser-Shell, PowerShell + CLI), Azure PowerShell, Azure CLI. Azure Arc: Azure-Management auf non-Azure-Ressourcen. Infrastructure as Code: ARM Templates (JSON, deklarativ, idempotent), Bicep (Microsoft-empfohlen, kompiliert zu ARM), Terraform (HashiCorp, Multi-Cloud).",
  conceptIds: [
    "azure-portals-tools",
    "azure-arc",
    "azure-iac-tools",
    "azure-management-tools-guide",
  ],
  quizIds: ["az900-quiz-azure-management-tools"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 65,
  tags: ["azure", "management", "portal", "cli", "powershell", "arc", "bicep", "arm", "terraform", "iac"],
};

export const AZURE_MANAGEMENT_TOOLS_CONCEPTS: Record<string, Concept> = {
  "azure-portals-tools": CONCEPT_AZURE_PORTALS,
  "azure-arc": CONCEPT_AZURE_ARC,
  "azure-iac-tools": CONCEPT_INFRASTRUCTURE_AS_CODE,
  "azure-management-tools-guide": CONCEPT_MANAGEMENT_TOOLS_GUIDE,
};

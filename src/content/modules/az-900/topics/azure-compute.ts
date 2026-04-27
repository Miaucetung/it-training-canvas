// ============================================================
// AZ-900 Topic 3: Azure Compute Services
// Domain 2: Azure Architecture and Services (~35-40%)
// Outline: "Describe Azure compute and networking services"
// Sources: learn.microsoft.com/azure/virtual-machines,
//          learn.microsoft.com/azure/app-service,
//          learn.microsoft.com/azure/azure-functions,
//          learn.microsoft.com/azure/aks
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_AZURE_VMS: Concept = {
  id: "azure-virtual-machines",
  title: "Azure Virtual Machines (VMs)",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "compute", "vm", "iaas", "scale-sets", "availability"],
  content: `
## Azure Virtual Machines

Azure VMs sind IaaS-Ressourcen — du erhältst Zugriff auf eine vollständige
virtuelle Maschine mit Betriebssystem, und du bist verantwortlich für Patching,
Konfiguration und Verwaltung des OS.

### Wann sind Azure VMs die richtige Wahl?

- **Lift-and-Shift**: Bestehende On-Premises-Anwendungen unverändert migrieren
- **Custom OS-Konfiguration**: Anwendungen mit spezifischen OS-Anforderungen
- **Volle Kontrolle**: Du verwaltest Betriebssystem, Middleware, Runtime selbst
- **Legacy-Software**: Software, die keine PaaS-Migration unterstützt

### VM-Größen und Serien

Azure VMs werden in Familien/Serien unterteilt, je nach Workload:

| Serie | Typ | Beispiel-Einsatz |
|-------|-----|-----------------|
| B-Serie | Burstable | Dev/Test, kleine Web-Apps |
| D-Serie | General Purpose | Webserver, Datenbanken, mittelgroße Apps |
| E-Serie | Memory-optimized | SAP HANA, In-Memory-Datenbanken |
| F-Serie | Compute-optimized | Batch-Processing, Gaming-Server |
| N-Serie | GPU | ML-Training, Video-Rendering |
| M-Serie | Memory-intensive | Sehr große In-Memory-Workloads |

### Virtual Machine Scale Sets (VMSS)

Scale Sets ermöglichen das automatische Skalieren einer Gruppe identischer VMs:
- Automatisches Hinzufügen oder Entfernen von VM-Instanzen basierend auf Last
- Load Balancing über alle Instanzen automatisch konfigurierbar
- Zone-redundante Deployments über mehrere Availability Zones möglich
- Sinnvoll für: Web-Frontends, Batch-Verarbeitung, containerisierte Workloads

**Wichtiger Unterschied**:
- **Availability Set**: VMs über Fault/Update Domains im *selben DC* verteilen (HA)
- **Scale Set**: Automatisch *skalieren* + optional über Zonen verteilen

### Availability Sets vs. Availability Zones — nochmals klar

| Konzept | Schützt vor | SLA (Premium SSD VMs) |
|---------|------------|----------------------|
| Availability Set | Hardware-Ausfall/Wartung im selben DC | 99,95% |
| Availability Zones | Ausfall eines ganzen DCs | 99,99% |
| Einzelne VM | — (kein Schutz) | 99,9% |

> Hinweis: Diese SLA-Werte gelten spezifisch für Azure VMs mit Premium SSD.

### Azure Virtual Desktop (AVD)

Azure Virtual Desktop (früher Windows Virtual Desktop) ist ein Cloud-basierter
Desktop- und App-Virtualisierungsdienst:
- Bereitstellung von Windows 10/11 Multi-Session-Desktops in Azure
- Remote-Zugriff auf Applikationen und Desktops
- Einsatz: Remote-Work, BYOD-Szenarien, VDI-Migration aus On-Premises
- Kein klassisches IaaS: Infrastruktur teilweise von Microsoft verwaltet
  `.trim(),
};

export const CONCEPT_AZURE_CONTAINERS: Concept = {
  id: "azure-containers",
  title: "Azure Container-Dienste: ACI, AKS und Container Apps",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "compute", "containers", "docker", "kubernetes", "aci", "aks"],
  content: `
## Container-Dienste in Azure

Container sind leichtgewichtige, portable Ausführungsumgebungen, die Anwendung
und ihre Abhängigkeiten bündeln — ohne ein vollständiges Betriebssystem.

### Azure Container Instances (ACI)

ACI ist die einfachste Möglichkeit, einzelne Container in Azure auszuführen:
- Kein Cluster, kein Orchestrator nötig — direkter Container-Start
- Sekunden bis zum ersten Start
- Abrechnung pro Sekunde tatsächlicher Laufzeit (Consumption-Billing)
- **Einsatz**: Kurzlaufende Aufgaben, CI/CD-Jobs, einfache Web-Apps, Tests

**ACI ist KEIN Ersatz für Kubernetes**, sondern für einfache, isolierte Workloads.

### Azure Kubernetes Service (AKS)

AKS ist der verwaltete Kubernetes-Dienst von Azure:
- Microsoft verwaltet die Control Plane (API-Server, etcd) kostenlos
- Du verwaltest die Worker Nodes (Agent Nodes)
- Automatische Updates des Kubernetes-Clusters konfigurierbar
- Integration mit Azure Monitor, Microsoft Entra ID, Azure Container Registry

**Einsatz**: Komplexe Microservices-Architekturen, Teams mit Kubernetes-Erfahrung,
Workloads mit komplexen Scaling- und Routing-Anforderungen.

### Azure Container Apps

Container Apps ist ein serverloser Container-Dienst (abstrahiert Kubernetes):
- Kein direktes Kubernetes-Management nötig
- Automatisches Skalieren auf 0 bei inaktiven Containern
- KEDA-basiertes Autoscaling (event-driven)
- **Einsatz**: Serverlose Container, Microservices ohne K8s-Expertise

### Wann welchen Dienst?

| Dienst | Komplexität | Skalierung | Typischer Einsatz |
|--------|------------|------------|------------------|
| ACI | Minimal | Manuell/keine | Quick Runs, Tests |
| Container Apps | Mittel | Automatisch (serverless) | Microservices, APIs |
| AKS | Hoch | Vollständig konfigurierbar | Enterprise, komplexe Systeme |
  `.trim(),
};

export const CONCEPT_AZURE_APP_FUNCTIONS: Concept = {
  id: "azure-app-service-functions",
  title: "Azure App Service, Azure Functions & Hosting-Optionen",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "compute", "paas", "app-service", "functions", "serverless", "hosting"],
  content: `
## Azure App Service

App Service ist Azures PaaS-Plattform für Web-Anwendungen und APIs:

- Unterstützt: .NET, Java, Node.js, Python, PHP, Ruby
- Kein OS-Management nötig — Microsoft verwaltet die Plattform
- Integriertes CI/CD (GitHub Actions, Azure DevOps, Bitbucket)
- Automatisches Skalieren (Scale Out: mehr Instanzen)
- **Deployment Slots**: Staging-Umgebung mit Zero-Downtime-Swap nach Prod

**App Service Plan**: Definiert die Ressourcen (vCPUs, RAM) und den
Abrechnungsmodus. Mehrere Apps können denselben Plan teilen.

| Tier | Einsatz | Besonderheiten |
|------|---------|----------------|
| Free/Shared | Dev/Test | Keine SLA, geteilte Ressourcen |
| Basic | Kleine Apps | Kein Auto-Scale |
| Standard | Produktions-Web-Apps | Auto-Scale, Deployment Slots |
| Premium | Performance-kritisch | Mehr vCPUs, Networking-Features |
| Isolated | Regulierte Workloads | Dedicated VNet (App Service Environment) |

### Azure Functions

Azure Functions ist der Serverless-Compute-Dienst von Azure:

- Code wird event-driven ausgeführt (HTTP, Timer, Queue, Blob, etc.)
- **Consumption Plan** (serverless): Abrechnung pro Ausführung; automatisches
  Skalieren auf 0 bei keiner Last → keine Kosten bei 0 Aufrufen
- **Premium Plan**: Vorgewärmte Instanzen (kein Cold Start), mehr Leistung
- **App Service Plan**: Functions auf dediziertem Plan — kein serverless Billing

**Prüfungsregel**: Nur der **Consumption Plan** gilt als "serverless" —
der App Service Plan für Functions ist kein serverless Modell.

**Trigger-Beispiele**:
| Trigger | Auslöser |
|---------|---------|
| HTTP Trigger | REST-API-Aufruf |
| Timer Trigger | Zeitplan (z.B. täglich um 02:00 Uhr) |
| Blob Trigger | Neue Datei in Blob Storage |
| Queue Trigger | Neue Nachricht in Azure Storage Queue |
| Event Grid Trigger | Azure-Event (z.B. Resource-Änderung) |

### Hosting-Optionen im Vergleich (AZ-900-Überblick)

| Option | Modell | Verwaltung durch Kunde | SLA |
|--------|--------|----------------------|-----|
| Azure VMs | IaaS | OS, Apps, Daten | 99,9–99,99%* |
| App Service | PaaS | Apps, Daten | 99,95% |
| Azure Functions (Consumption) | Serverless PaaS | Code | 99,95% |
| Azure Container Instances | PaaS/Container | Container-Image | 99,9% |
| Azure Kubernetes Service | PaaS/Container | Workloads, Nodes | 99,95% |

*VM-SLA abhängig von Deployment-Strategie (Einzeln/Set/Zonen)

### Prüfungs-Entscheidungsbaum (Hosting-Option)

1. Brauche ich volles OS-Zugriff oder Lift-and-Shift? → **VM**
2. Ist es eine Web-App / API ohne OS-Management? → **App Service**
3. Event-driven, kurze Laufzeiten, Pay-per-Execution? → **Azure Functions (Consumption)**
4. Einfacher Container, kein Cluster? → **ACI**
5. Komplexe Container-Orchestrierung, Microservices? → **AKS**
6. Serverless Container mit Auto-Scale? → **Container Apps**
  `.trim(),
};

export const CONCEPT_AZURE_COMPUTE_GUIDE: Concept = {
  id: "azure-compute-guide",
  title: "Lernguide: Azure Compute",
  appliesTo: ["az-900"],
  tags: ["azure", "compute", "guide", "vm", "paas", "serverless", "containers"],
  content: `
## Lernziele

- Azure VMs von PaaS-Diensten und Serverless abgrenzen
- Scale Sets von Availability Sets unterscheiden
- Den richtigen Compute-Dienst für ein Szenario wählen
- Azure Virtual Desktop als VDI-Lösung beschreiben
- Container-Dienste (ACI, AKS, Container Apps) voneinander abgrenzen
- App Service Tiers und ihren Einsatzbereich erklären
- Azure Functions Consumption Plan als serverless identifizieren

## Praxis-Szenario

Die "NordLogistik GmbH" modernisiert ihre IT:

- **Lagerverwaltungs-Software** (Legacy Windows .NET 2008, kein Code-Zugriff):
  → Azure VM (Lift-and-Shift, IaaS, volle OS-Kontrolle nötig)

- **Neue Tracking-API** (Node.js, Team hat keine Lust auf OS-Management):
  → Azure App Service (PaaS, Standard-Tier mit Auto-Scale)

- **Täglicher Nacht-Job** (Bestandsabgleich um 02:00 Uhr, dauert 5 Minuten):
  → Azure Functions mit Timer Trigger, Consumption Plan

- **Microservices-Plattform** (20 Services, Kubernetes-erfahrenes Team):
  → Azure Kubernetes Service (AKS)

- **Remote-Arbeitsplätze** (50 Außendienstler brauchen Windows-Desktop via Browser):
  → Azure Virtual Desktop (AVD)

## Typische Prüfungsfallen

- ⚠️ **"Azure Functions = immer serverless"** — FALSCH. Nur der Consumption Plan
  ist serverless. Functions kann auch auf App Service Plan laufen — dann
  gilt Pay-per-Hour wie ein normaler App Service.

- ⚠️ **"Scale Sets = Availability Sets"** — FALSCH. Scale Sets = automatisches
  Hinzufügen/Entfernen von VMs (Elastizität). Availability Sets = HA-Verteilung
  über Fault Domains im selben DC. Beides kombinierbar, aber verschiedene Konzepte.

- ⚠️ **"ACI = Kubernetes"** — FALSCH. ACI ist für einzelne, einfache Container ohne
  Orchestrierung. AKS ist der verwaltete Kubernetes-Dienst für komplexe, skalierbare
  Container-Workloads.

- ⚠️ **"App Service = IaaS"** — FALSCH. App Service ist PaaS — Microsoft verwaltet
  OS und Runtime. Wenn jemand "OS selbst patchen" oder "SSH auf den Server" braucht,
  ist das kein App Service Use Case.
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_COMPUTE_QUESTIONS: Question[] = [
  {
    id: "az900-compute-q1",
    type: "single-choice",
    points: 10,
    text: "Das Entwicklungsteam der 'Bergmann IT GmbH' möchte eine bestehende .NET-Webanwendung deployen, ohne sich um Betriebssystem-Updates kümmern zu müssen. Welcher Azure-Dienst ist die richtige Wahl?",
    explanation: "Azure App Service ist ein PaaS-Dienst: Das Entwicklungsteam deployt nur den Anwendungscode; Microsoft verwaltet OS, Runtime und Plattform. Azure VMs (IaaS) würden OS-Management erfordern. Azure Functions wäre für event-driven, kurzlaufende Tasks, nicht für eine klassische Web-App.",
    answers: [
      { id: "a", text: "Azure Virtual Machine — volle Kontrolle über das Betriebssystem", isCorrect: false },
      { id: "b", text: "Azure App Service — PaaS, kein OS-Management nötig", isCorrect: true },
      { id: "c", text: "Azure Container Instances — einfacher Container-Start", isCorrect: false },
      { id: "d", text: "Azure Functions — serverless, event-driven Ausführung", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q2",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen betreibt eine tägliche Batch-Verarbeitung um 03:00 Uhr morgens, die exakt 8 Minuten dauert. Die restlichen 23 Stunden 52 Minuten soll kein Compute-Dienst Kosten verursachen. Welches Modell passt am besten?",
    explanation: "Azure Functions mit Consumption Plan ist die Lösung: Der Timer Trigger startet die Funktion um 03:00 Uhr, die Ausführung dauert 8 Minuten, danach entstehen keine Kosten. App Service läuft kontinuierlich (auch wenn inaktiv). Azure VMs würden laufende Kosten verursachen, solange sie gestartet sind.",
    answers: [
      { id: "a", text: "Azure VM mit automatischem Shutdown-Plan", isCorrect: false },
      { id: "b", text: "App Service im Free-Tier", isCorrect: false },
      { id: "c", text: "Azure Functions mit Timer Trigger, Consumption Plan", isCorrect: true },
      { id: "d", text: "Azure Kubernetes Service mit Cron-Job", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q3",
    type: "single-choice",
    points: 10,
    text: "Was ist der Unterschied zwischen einem Virtual Machine Scale Set und einem Availability Set?",
    explanation: "Scale Sets sind für elastisches Skalieren (mehr oder weniger VM-Instanzen je nach Last). Availability Sets verteilen VMs über Fault Domains und Update Domains im selben Rechenzentrum für Hochverfügbarkeit. Scale Sets können Zone-redundant sein, aber das ist eine optionale Eigenschaft.",
    answers: [
      { id: "a", text: "Scale Sets verteilen VMs über Fault Domains; Availability Sets skalieren automatisch", isCorrect: false },
      { id: "b", text: "Beide sind identisch — Availability Set ist der ältere Name für Scale Set", isCorrect: false },
      { id: "c", text: "Scale Sets skalieren VM-Instanzen automatisch; Availability Sets verteilen VMs für HA im selben DC", isCorrect: true },
      { id: "d", text: "Availability Sets sind für Regionen ohne Availability Zones nicht verfügbar", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q4",
    type: "single-choice",
    points: 10,
    text: "Welcher Azure-Dienst ist speziell für die Bereitstellung von Windows-Desktops und -Anwendungen für Remote-Nutzer über einen Browser konzipiert?",
    explanation: "Azure Virtual Desktop (AVD) ist Azures Dienst für Desktop-Virtualisierung (VDI). Er ermöglicht die Bereitstellung von Windows 10/11 Multi-Session-Desktops in Azure, auf die Remote-Nutzer über Browser oder den Remote Desktop Client zugreifen. Es ist kein klassisches IaaS — die Infrastruktur wird teilweise von Microsoft verwaltet.",
    answers: [
      { id: "a", text: "Azure Remote Desktop Services auf einem Azure VM", isCorrect: false },
      { id: "b", text: "Azure Virtual Desktop (AVD)", isCorrect: true },
      { id: "c", text: "Azure App Service mit Windows-Hosting-Plan", isCorrect: false },
      { id: "d", text: "Azure Dedicated Host", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q5",
    type: "single-choice",
    points: 10,
    text: "Ein Entwickler möchte einen einzelnen Docker-Container in Azure starten, der einen einmaligen Verarbeitungsjob ausführt. Kein Orchestrator, keine komplexe Infrastruktur. Welcher Dienst ist am einfachsten?",
    explanation: "Azure Container Instances (ACI) ist für genau diesen Fall gemacht: schneller Start eines einzelnen Containers ohne Kubernetes-Cluster. Sekundenschneller Start, Abrechnung pro Sekunde. AKS wäre überdimensioniert für einen Einzeljob.",
    answers: [
      { id: "a", text: "Azure Kubernetes Service — maximale Container-Flexibilität", isCorrect: false },
      { id: "b", text: "Azure Container Instances — kein Cluster, direkter Container-Start", isCorrect: true },
      { id: "c", text: "Azure App Service mit Container-Hosting", isCorrect: false },
      { id: "d", text: "Azure Virtual Machine mit Docker installiert", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q6",
    type: "single-choice",
    points: 10,
    text: "Welcher Azure Functions Hosting-Plan ist das serverlose Modell, bei dem Kosten nur bei tatsächlicher Ausführung entstehen?",
    explanation: "Der Consumption Plan ist das serverless Modell für Azure Functions: Abrechnung pro Ausführung und Laufzeit, automatisches Skalieren auf 0 bei keinen Aufrufen. Der Premium Plan bietet vorgewärmte Instanzen (kein Cold Start), aber laufende Kosten. Der App Service Plan verhält sich wie ein normaler App Service.",
    answers: [
      { id: "a", text: "Premium Plan — vorgewärmte Instanzen, keine Cold Starts", isCorrect: false },
      { id: "b", text: "App Service Plan — Functions auf dediziertem App Service Plan", isCorrect: false },
      { id: "c", text: "Consumption Plan — Pay-per-Execution, Scale to Zero", isCorrect: true },
      { id: "d", text: "Alle Functions-Pläne sind serverless", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q7",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI der folgenden Szenarien sind typische Einsatzfälle für Azure Virtual Machines (IaaS), NICHT für PaaS-Dienste? (Wähle 2)",
    explanation: "VMs (IaaS) sind geeignet für: Legacy-Software, die spezifische OS-Versionen benötigt (A), und für Lift-and-Shift-Migrationen bestehender Server ohne Code-Änderungen (C). Eine neue API (B) ist ein klarer PaaS-Fall (App Service). Ein Timer-Job (D) ist Azure Functions-Territory.",
    answers: [
      { id: "a", text: "Eine Legacy-Anwendung benötigt Windows Server 2012 R2 mit einer spezifischen Registry-Konfiguration", isCorrect: true },
      { id: "b", text: "Ein neues REST-API-Backend soll in Python entwickelt und deployed werden", isCorrect: false },
      { id: "c", text: "Ein bestehender On-Premises-Datenbankserver soll 1:1 nach Azure migriert werden (Lift-and-Shift)", isCorrect: true },
      { id: "d", text: "Eine täglich laufende Bereinigung alter Datenbankeinträge um Mitternacht", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q8",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen hat ein Team von 25 Entwicklern, die von verschiedenen Endgeräten auf eine Windows-Entwicklungsumgebung mit spezifischer Software zugreifen müssen. Welcher Azure-Dienst löst diesen Anwendungsfall?",
    explanation: "Azure Virtual Desktop (AVD) ist die Lösung für virtuelle Windows-Arbeitsplätze in der Cloud. Entwickler erhalten Zugriff auf eine konsistente Windows-Umgebung unabhängig vom lokalen Gerät. App Service und Functions sind für Web-Apps/APIs, keine Desktop-Virtualisierung.",
    answers: [
      { id: "a", text: "Azure App Service — Web-Zugriff auf Windows-Umgebungen", isCorrect: false },
      { id: "b", text: "Azure Virtual Desktop (AVD) — Cloud-basierte Windows-Arbeitsplätze", isCorrect: true },
      { id: "c", text: "Azure Kubernetes Service — Container-basierte Entwicklungsumgebungen", isCorrect: false },
      { id: "d", text: "Azure Functions — serverless Ausführung von Entwickler-Tools", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q9",
    type: "single-choice",
    points: 10,
    text: "Was ist der Hauptvorteil von Azure App Service Deployment Slots?",
    explanation: "Deployment Slots ermöglichen Zero-Downtime-Deployments: Die neue Version wird in einen Staging-Slot deployed und getestet. Nach Freigabe wird der Staging-Slot per 'Swap' mit dem Production-Slot ausgetauscht — ohne Neustart, ohne Downtime. Bei Problemen kann der Swap rückgängig gemacht werden.",
    answers: [
      { id: "a", text: "Kosteneinsparung durch Teilen von App Service Plan-Ressourcen", isCorrect: false },
      { id: "b", text: "Zero-Downtime-Deployments durch Swap zwischen Staging und Production", isCorrect: true },
      { id: "c", text: "Geografische Verteilung der App auf mehrere Regionen", isCorrect: false },
      { id: "d", text: "Automatisches Skalieren basierend auf Metriken", isCorrect: false },
    ],
  },
  {
    id: "az900-compute-q10",
    type: "single-choice",
    points: 10,
    text: "Ein Start-up entwickelt eine Event-getriebene Microservices-Architektur mit 15 verschiedenen Services. Das kleine Team hat Kubernetes-Erfahrung und benötigt volle Kontrolle über Deployments, Netzwerk-Policies und Skalierungsverhalten. Welcher Dienst passt am besten?",
    explanation: "AKS (Azure Kubernetes Service) ist die richtige Wahl: Er bietet volle Kubernetes-Kontrolle bei verwalteter Control Plane. Für ein Team mit K8s-Erfahrung und komplexen Anforderungen (15 Services, Netzwerk-Policies, feingranulares Scaling) ist AKS besser als Container Apps (weniger Kontrolle) oder ACI (kein Orchestrator).",
    answers: [
      { id: "a", text: "Azure Container Instances — am einfachsten für Container", isCorrect: false },
      { id: "b", text: "Azure App Service — PaaS ohne Kubernetes-Komplexität", isCorrect: false },
      { id: "c", text: "Azure Container Apps — serverless Container ohne K8s-Management", isCorrect: false },
      { id: "d", text: "Azure Kubernetes Service (AKS) — volle Kubernetes-Kontrolle, verwaltete Control Plane", isCorrect: true },
    ],
  },
];

export const QUIZ_AZURE_COMPUTE: Quiz = {
  id: "az900-quiz-azure-compute",
  title: "Quiz: Azure Compute Services",
  description: "VMs, Scale Sets, App Service, Azure Functions, ACI, AKS, Azure Virtual Desktop",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_COMPUTE_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_COMPUTE: Topic = {
  id: "azure-compute",
  title: "Azure Compute Services",
  description:
    "Azure VMs, Scale Sets, Availability Sets, Azure Virtual Desktop, Container-Dienste (ACI, AKS, Container Apps), App Service und Azure Functions — wann welcher Dienst.",
  conceptIds: [
    "azure-virtual-machines",
    "azure-containers",
    "azure-app-service-functions",
    "azure-compute-guide",
  ],
  quizIds: ["az900-quiz-azure-compute"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 80,
  tags: ["azure", "compute", "vm", "paas", "serverless", "containers", "app-service"],
};

export const AZURE_COMPUTE_CONCEPTS: Record<string, Concept> = {
  "azure-virtual-machines": CONCEPT_AZURE_VMS,
  "azure-containers": CONCEPT_AZURE_CONTAINERS,
  "azure-app-service-functions": CONCEPT_AZURE_APP_FUNCTIONS,
  "azure-compute-guide": CONCEPT_AZURE_COMPUTE_GUIDE,
};

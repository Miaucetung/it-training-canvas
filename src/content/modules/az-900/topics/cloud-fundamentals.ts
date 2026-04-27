// ============================================================
// AZ-900 Topic: Cloud Computing Grundlagen
// Domain 1: Cloud Concepts (~25-30%)
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_CLOUD_INTRO: Concept = {
  id: "cloud-intro",
  title: "Was ist Cloud Computing?",
  appliesTo: ["az-900", "az-104"],
  tags: ["cloud", "azure", "definition", "nist", "on-demand"],
  content: `
## Was ist Cloud Computing?

Cloud Computing bezeichnet die Bereitstellung von IT-Ressourcen — Server,
Speicher, Netzwerke, Anwendungen — über das Internet auf Abruf und nach
Verbrauch abgerechnet. Das NIST (National Institute of Standards and Technology)
beschreibt Cloud Computing über fünf wesentliche Eigenschaften:

1. **On-Demand Self-Service**: Ressourcen ohne menschliche Interaktion mit dem
   Anbieter bereitstellen (Portale, APIs)
2. **Broad Network Access**: Zugriff über Standard-Netzwerkprotokolle von
   beliebigen Geräten
3. **Resource Pooling**: Ressourcen werden gebündelt und mehreren Kunden
   dynamisch zugeteilt (Multi-Tenancy)
4. **Rapid Elasticity**: Kapazität kann schnell und automatisch skaliert werden
5. **Measured Service**: Ressourcenverbrauch wird gemessen und transparent abgerechnet

### CapEx vs. OpEx

Traditionelle IT-Infrastruktur erfordert **CapEx (Capital Expenditure)**:
hohe Vorab-Investitionen in Hardware, die über Jahre abgeschrieben wird —
unabhängig davon, ob die Kapazität wirklich gebraucht wird.

Cloud Computing ermöglicht **OpEx (Operational Expenditure)**:
laufende Betriebskosten, die nur bei tatsächlicher Nutzung anfallen.

| Merkmal         | CapEx (On-Premises)         | OpEx (Cloud)                |
|-----------------|-----------------------------|-----------------------------|
| Vorabkosten     | Hoch (Serverraum, Hardware) | Gering / keine              |
| Skalierbarkeit  | Begrenzt durch Kapazität    | Elastisch, auf Abruf        |
| Wartung         | Eigene IT-Abteilung         | Anbieter                    |
| Abschreibung    | Über Jahre                  | Sofort als Betriebskosten   |
| Kostenmodell    | Fix                         | Variabel, Pay-as-you-go     |

### Consumption-Based Model (Pay-as-you-go)

Im Cloud-Modell zahlst du ausschließlich für tatsächlich verbrauchte Ressourcen —
keine Fixkosten für brachliegende Kapazität. Das nennt sich **Consumption-Based Model**.

- Rechenleistung: pro Sekunde oder Stunde abgerechnet
- Speicher: pro GB pro Monat
- Ausgehender Datentransfer: pro GB (Ingress meist kostenlos)
- Keine Vorabkäufe, keine Mindestlaufzeiten (im PAYG-Modell)

Das Gegenteil ist das **Fixed-Price-Modell**: eine gleichbleibende monatliche Rate
unabhängig vom Verbrauch — z.B. bei Reserved Instances mit 1- oder 3-Jahres-Commitment
(die dann günstiger als PAYG sind, wenn du die Nutzung vorhersehen kannst).

### Weitere Cloud-Vorteile

- **High Availability**: SLAs bis 99,99% Verfügbarkeit
- **Skalierbarkeit**: Vertikal (mehr CPU/RAM) und horizontal (mehr Instanzen)
- **Elastizität**: Automatisches Hoch- und Herunterskalieren nach Last
- **Global Reach**: Azure betreibt mehr als 60 Regionen weltweit
- **Agilität**: Ressourcen in Minuten bereitstellen, statt Wochen auf Hardware zu warten
- **Disaster Recovery**: Geografische Redundanz ohne eigene Standorte
  `.trim(),
};

export const CONCEPT_CLOUD_SERVICE_MODELS: Concept = {
  id: "cloud-service-models",
  title: "IaaS, PaaS, SaaS — Service-Modelle",
  appliesTo: ["az-900", "az-104"],
  tags: ["cloud", "iaas", "paas", "saas", "service-models"],
  content: `
## Cloud-Service-Modelle

### IaaS — Infrastructure as a Service

**Du verwaltest**: Betriebssystem, Middleware, Runtime, Anwendung, Daten
**Azure verwaltet**: Physische Hardware, Netzwerk, Hypervisor, Virtualisierung

**Typische Einsatzszenarien**:
- Migration bestehender On-Premises-Server zu Azure VMs
- Test- und Entwicklungsumgebungen
- Hochleistungs-Computing (HPC)
- Wenn vollständige Kontrolle über das OS notwendig ist

**Azure-Beispiele**: Azure Virtual Machines, Azure Disk Storage

---

### PaaS — Platform as a Service

**Du verwaltest**: Anwendung und Daten
**Azure verwaltet**: Alles darunter (OS, Runtime, Middleware, Infrastruktur)

**Typische Einsatzszenarien**:
- Web-Anwendungen und APIs entwickeln ohne Server zu verwalten
- Datenbankdienste nutzen ohne DBA-Overhead
- Entwickler fokussieren sich auf Code, nicht auf Infrastruktur

**Azure-Beispiele**: Azure App Service, Azure SQL Database, Azure Functions

---

### SaaS — Software as a Service

**Du verwaltest**: Nichts (nur Konfiguration und Daten innerhalb der App)
**Azure/Anbieter verwaltet**: Alles

**Typische Einsatzszenarien**:
- Standard-Geschäftsanwendungen ohne eigene Entwicklung
- Schneller Rollout für alle Mitarbeiter

**Azure-Beispiele**: Microsoft 365, Microsoft Dynamics 365, Microsoft Teams

---

### Entscheidungshilfe: Welches Modell für welches Szenario?

| Szenario | Empfehlung |
|----------|-----------|
| "Wir heben unsere Windows Server eins zu eins in die Cloud" | IaaS |
| "Wir entwickeln eine neue Web-App, kein Server-Management gewünscht" | PaaS |
| "Alle 200 Mitarbeiter brauchen E-Mail und Office-Anwendungen" | SaaS |
| "Wir brauchen ML-Training auf GPU-Clustern, full Control" | IaaS |
| "Wir deployen eine Node.js-API ohne Betriebssystem zu managen" | PaaS |
  `.trim(),
};

export const CONCEPT_CLOUD_DEPLOYMENT_MODELS: Concept = {
  id: "cloud-deployment-models",
  title: "Cloud-Bereitstellungsmodelle & Shared Responsibility",
  appliesTo: ["az-900"],
  tags: ["cloud", "public", "private", "hybrid", "multi-cloud", "shared-responsibility"],
  content: `
## Cloud-Bereitstellungsmodelle

### Public Cloud
Ressourcen werden vom Cloud-Anbieter (Azure, AWS, GCP) betrieben und über
das öffentliche Internet geteilt. Mehrere Kunden teilen sich dieselbe physische
Infrastruktur, sind aber logisch isoliert (Multi-Tenancy).

**Vorteile**: Keine Vorabinvestitionen, höchste Skalierbarkeit, globale Verfügbarkeit
**Nachteile**: Daten verlassen das eigene Rechenzentrum, Abhängigkeit vom Anbieter

### Private Cloud
IT-Infrastruktur, die exklusiv von einer Organisation betrieben wird — entweder
On-Premises oder bei einem Hosting-Anbieter. Mehr Kontrolle, aber auch mehr
Verantwortung für Betrieb und Kosten.

**Vorteile**: Maximale Kontrolle, Datensouveränität, keine Shared-Infrastruktur
**Nachteile**: Hohe Initialkosten (CapEx), eigener Betrieb nötig

### Hybrid Cloud
Kombination aus Public und Private Cloud mit Verbindung zwischen beiden
(z.B. Azure VPN Gateway oder ExpressRoute). Daten und Anwendungen können
zwischen beiden Umgebungen migriert werden.

**Typischer Einsatz**: Regulierte Branchen (Banken, Gesundheit) die sensible
Daten lokal halten müssen, aber Skalierbarkeit der Public Cloud nutzen wollen.

### Multi-Cloud
Nutzung mehrerer Cloud-Anbieter gleichzeitig (z.B. Azure für KI, AWS für
spezifische Services). Vermeidet Vendor Lock-in.

---

## Shared Responsibility Model

Die Verteilung von Verantwortlichkeiten zwischen Azure und dem Kunden hängt
vom gewählten Service-Modell ab:

| Schicht                    | On-Premises | IaaS       | PaaS       | SaaS       |
|----------------------------|-------------|------------|------------|------------|
| Physische Sicherheit       | Kunde       | Microsoft  | Microsoft  | Microsoft  |
| Netzwerk-Infrastruktur     | Kunde       | Microsoft  | Microsoft  | Microsoft  |
| Hypervisor / Virtualisierung | Kunde     | Microsoft  | Microsoft  | Microsoft  |
| Betriebssystem             | Kunde       | **Kunde**  | Microsoft  | Microsoft  |
| Middleware / Runtime       | Kunde       | **Kunde**  | Microsoft  | Microsoft  |
| Anwendungscode             | Kunde       | **Kunde**  | **Kunde**  | Microsoft  |
| Daten & Identitäten        | Kunde       | **Kunde**  | **Kunde**  | **Kunde**  |
| Endgeräte                  | Kunde       | **Kunde**  | **Kunde**  | **Kunde**  |

**Prüfungsfalle**: Bei SaaS bleibt der Kunde IMMER für seine Daten und
Endgeräte verantwortlich — Microsoft verwaltet nicht Ihre Inhalte.
  `.trim(),
};

export const CONCEPT_CLOUD_FUNDAMENTALS_GUIDE: Concept = {
  id: "cloud-fundamentals-guide",
  title: "Lernguide: Cloud Computing Grundlagen",
  appliesTo: ["az-900"],
  tags: ["cloud", "guide", "az-900", "fundamentals"],
  content: `
## Lernziele

- Den Unterschied zwischen IaaS, PaaS und SaaS anhand konkreter Szenarien erklären
- CapEx und OpEx definieren und Cloud Computing als OpEx-Modell einordnen
- Die vier Bereitstellungsmodelle (Public, Private, Hybrid, Multi-Cloud) abgrenzen
- Das Shared Responsibility Model für alle Service-Modelle korrekt anwenden
- Mindestens fünf Cloud-Vorteile mit Praxisbezug nennen

## Praxis-Szenario

Die "Bäcker GmbH" (50 Mitarbeiter, München) plant ihre IT zu modernisieren:
- Ihr ERP-System läuft auf einem veralteten Windows Server (muss in die Cloud)
- Eine neue Kunden-App soll entwickelt werden (Team aus 3 Entwicklern)
- Alle Mitarbeiter brauchen E-Mail und Dokumente

**Aufgabe**: Weise jedem Use Case das richtige Service-Modell zu und begründe.

*Lösung*: ERP-Migration → IaaS (Azure VM, volle OS-Kontrolle), Kunden-App →
PaaS (App Service, kein Server-Management), E-Mail/Docs → SaaS (Microsoft 365)

## Typische Prüfungsfallen

- ⚠️ **"Hybrid Cloud = Multi-Cloud"** — FALSCH. Hybrid = Public + Private in
  Verbindung. Multi-Cloud = mehrere Public-Anbieter.
- ⚠️ **"Bei SaaS hat der Anbieter Zugriff auf meine Daten"** — Microsoft
  verwaltet die Infrastruktur, NICHT Ihre Inhalte. Datensouveränität liegt
  beim Kunden.
- ⚠️ **"CapEx ist immer schlechter als OpEx"** — Für stabile, vorhersehbare
  Workloads können Reserved Instances (Vorab-Commitment) günstiger sein als
  Pay-as-you-go.
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const CLOUD_FUNDAMENTALS_QUESTIONS: Question[] = [
  {
    id: "az900-cf-q1",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen möchte seinen bestehenden Windows Server 2019 ohne Änderungen in die Cloud verschieben. Welches Service-Modell ist die richtige Wahl?",
    explanation: "Bei IaaS bleibt das Betriebssystem in der Verantwortung des Kunden. Ein 1:1-Lift-and-Shift eines vorhandenen Windows Servers ohne Anpassungen passt zu Azure VMs (IaaS).",
    answers: [
      { id: "a", text: "SaaS — der Anbieter verwaltet alles", isCorrect: false },
      { id: "b", text: "PaaS — die Plattform übernimmt OS und Runtime", isCorrect: false },
      { id: "c", text: "IaaS — volle Kontrolle über das Betriebssystem", isCorrect: true },
      { id: "d", text: "FaaS — serverlose Ausführung ohne VM", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q2",
    type: "single-choice",
    points: 10,
    text: "Welche der folgenden Aussagen beschreibt den Hauptvorteil von OpEx gegenüber CapEx im Cloud-Kontext korrekt?",
    explanation: "OpEx (Operational Expenditure) bedeutet laufende Betriebskosten ohne Vorabinvestitionen. Du zahlst nur für das, was du nutzt. Ob das günstiger als CapEx ist, hängt vom Workload ab — stabile Workloads können mit Reserved Instances günstiger sein.",
    answers: [
      { id: "a", text: "OpEx bedeutet höhere Vorabinvestitionen für langfristige Einsparungen", isCorrect: false },
      { id: "b", text: "OpEx rechnet nur für tatsächliche Nutzung ab, keine Vorabinvestitionen nötig", isCorrect: true },
      { id: "c", text: "OpEx ermöglicht vollständige Kontrolle über die physische Hardware", isCorrect: false },
      { id: "d", text: "OpEx ist immer günstiger als CapEx, unabhängig vom Workload", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q3",
    type: "single-choice",
    points: 10,
    text: "Ein Entwicklerteam möchte eine Web-Anwendung deployen, ohne sich um das Betriebssystem zu kümmern. Welches Modell passt?",
    explanation: "PaaS (z.B. Azure App Service) ermöglicht es Entwicklern, Code zu deployen ohne OS, Runtime oder Middleware selbst zu verwalten.",
    answers: [
      { id: "a", text: "IaaS", isCorrect: false },
      { id: "b", text: "PaaS", isCorrect: true },
      { id: "c", text: "SaaS", isCorrect: false },
      { id: "d", text: "On-Premises", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q4",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI Aussagen zum Shared Responsibility Model sind korrekt? (Wähle 2)",
    explanation: "Bei IaaS bleibt das OS beim Kunden (A korrekt). Die physische Sicherheit der Azure-Rechenzentren liegt immer bei Microsoft, unabhängig vom Service-Modell (C korrekt). Microsoft verwaltet NICHT die Kundendaten (B falsch). Den Hypervisor patcht stets Microsoft (D falsch).",
    answers: [
      { id: "a", text: "Bei IaaS ist das Betriebssystem Verantwortung des Kunden", isCorrect: true },
      { id: "b", text: "Bei SaaS verwaltet Microsoft auch die Daten des Kunden", isCorrect: false },
      { id: "c", text: "Die physische Sicherheit der Rechenzentren liegt immer bei Microsoft", isCorrect: true },
      { id: "d", text: "Bei PaaS muss der Kunde den Hypervisor selbst patchen", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q5",
    type: "single-choice",
    points: 10,
    text: "Was unterscheidet Hybrid Cloud von Multi-Cloud?",
    explanation: "Hybrid Cloud = Public + Private Cloud in Verbindung (z.B. via VPN). Multi-Cloud = mehrere Public-Cloud-Anbieter (z.B. Azure + AWS). Diese Prüfungsfrage kommt regelmäßig in der AZ-900.",
    answers: [
      { id: "a", text: "Hybrid Cloud nutzt mehrere Public-Cloud-Anbieter; Multi-Cloud kombiniert Public und Private", isCorrect: false },
      { id: "b", text: "Hybrid Cloud verbindet Public und Private Cloud; Multi-Cloud nutzt mehrere Public-Cloud-Anbieter", isCorrect: true },
      { id: "c", text: "Beide Begriffe beschreiben dasselbe Konzept", isCorrect: false },
      { id: "d", text: "Hybrid Cloud ist günstiger als Multi-Cloud", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q6",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen der Finanzbranche muss Kundendaten aus regulatorischen Gründen im eigenen Rechenzentrum halten, möchte aber für saisonale Lastspitzen Public-Cloud-Kapazität nutzen. Welches Bereitstellungsmodell passt?",
    explanation: "Hybrid Cloud verbindet das eigene Rechenzentrum (Private Cloud / On-Premises) mit der Public Cloud. Sensible Daten bleiben lokal; Rechenlast kann bei Bedarf in die Public Cloud ausgelagert werden (Cloud Bursting).",
    answers: [
      { id: "a", text: "Public Cloud", isCorrect: false },
      { id: "b", text: "Private Cloud", isCorrect: false },
      { id: "c", text: "Hybrid Cloud", isCorrect: true },
      { id: "d", text: "Multi-Cloud", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q7",
    type: "single-choice",
    points: 10,
    text: "Welche der folgenden Eigenschaften beschreibt 'Elastizität' im Cloud-Kontext am besten?",
    explanation: "Elastizität (Rapid Elasticity) meint das automatische Skalieren — bei hoher Last werden Ressourcen hinzugefügt, bei niedriger Last werden sie freigegeben. Das ist ein Kernvorteil gegenüber statischer On-Premises-Infrastruktur.",
    answers: [
      { id: "a", text: "Die Fähigkeit, weltweit auf Dienste zuzugreifen", isCorrect: false },
      { id: "b", text: "Die automatische Anpassung der Kapazität an die aktuelle Last", isCorrect: true },
      { id: "c", text: "Die Verteilung von Ressourcen auf mehrere Regionen", isCorrect: false },
      { id: "d", text: "Die Messung und Abrechnung des Ressourcenverbrauchs", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q8",
    type: "single-choice",
    points: 10,
    text: "Microsoft 365 ist ein Beispiel für welches Service-Modell?",
    explanation: "Microsoft 365 (früher Office 365) ist ein klassisches SaaS-Produkt: Der Endbenutzer nutzt die Anwendung (Word, Outlook, Teams) ohne sich um Infrastruktur oder Plattform zu kümmern.",
    answers: [
      { id: "a", text: "IaaS", isCorrect: false },
      { id: "b", text: "PaaS", isCorrect: false },
      { id: "c", text: "SaaS", isCorrect: true },
      { id: "d", text: "DBaaS", isCorrect: false },
    ],
  },
  {
    id: "az900-cf-q9",
    type: "multiple-choice",
    points: 15,
    text: "Welche DREI der folgenden Vorteile gehören zu den Hauptvorteilen von Cloud Computing? (Wähle 3)",
    explanation: "Hohe Vorabinvestitionen (A) sind ein Merkmal von On-Premises/CapEx, kein Cloud-Vorteil. Physische Hardware-Kontrolle (D) hat man in der Cloud nicht — das ist ein Kompromiss, kein Vorteil.",
    answers: [
      { id: "a", text: "Hohe Vorabinvestitionen für bessere Planbarkeit", isCorrect: false },
      { id: "b", text: "Globale Verfügbarkeit ohne eigene Rechenzentren", isCorrect: true },
      { id: "c", text: "Zahlung nur für tatsächlich verbrauchte Ressourcen", isCorrect: true },
      { id: "d", text: "Vollständige Kontrolle über die physische Hardware", isCorrect: false },
      { id: "e", text: "Disaster Recovery und Georedundanz ohne eigene Standorte", isCorrect: true },
    ],
  },
  {
    id: "az900-cf-q10",
    type: "single-choice",
    points: 10,
    text: "Ein Startup entwickelt eine serverlose Funktion, die ausschließlich beim Eingang einer Bestellung ausgeführt wird. Bei 0 Bestellungen pro Tag entstehen keine Kosten. Welches Service-Modell beschreibt diesen Fall am besten?",
    explanation: "Azure Functions ist ein PaaS-Dienst im Serverless-Betriebsmodell. Bei 0 Aufrufen entstehen keine Kosten — echte Pay-per-Execution-Abrechnung. IaaS-VMs würden laufen (und kosten) solange sie gestartet sind.",
    answers: [
      { id: "a", text: "IaaS mit automatischem Shutdown", isCorrect: false },
      { id: "b", text: "PaaS mit Azure App Service", isCorrect: false },
      { id: "c", text: "SaaS", isCorrect: false },
      { id: "d", text: "PaaS (Serverless) mit Azure Functions", isCorrect: true },
    ],
  },
];

export const CONCEPT_CLOUD_BENEFITS: Concept = {
  id: "cloud-benefits",
  title: "Cloud-Vorteile: Reliability, Predictability, Security, Manageability",
  appliesTo: ["az-900"],
  tags: ["cloud", "reliability", "predictability", "security", "manageability", "benefits"],
  content: `
## Cloud-Vorteile im Detail

Die AZ-900-Prüfung unterscheidet vier Kategorien von Cloud-Vorteilen:

### 1. High Availability & Scalability

**High Availability (HA)**: Cloud-Dienste sind so ausgelegt, dass sie mit minimaler
Ausfallzeit verfügbar bleiben. Azure definiert Verfügbarkeit in SLAs — zum Beispiel
99,9% bis 99,99% für verschiedene Dienste. Bei 99,99% sind das weniger als
52 Minuten geplante Ausfallzeit pro Jahr.

**Scalability**: Die Fähigkeit, Kapazität nach Bedarf zu erhöhen:
- **Vertikal (Scale Up)**: Größere VM-Instanz (mehr CPU, RAM)
- **Horizontal (Scale Out)**: Mehr Instanzen hinzufügen (Load Balancing)

### 2. Reliability & Predictability

**Reliability (Zuverlässigkeit)**: Cloud-Infrastruktur ist so konzipiert, dass
Ausfälle einzelner Komponenten den Gesamtdienst nicht unterbrechen. Durch
Redundanz, Availability Zones und automatische Failover-Mechanismen können
Anwendungen auch bei Hardware-Fehlern weiterlaufen.

**Predictability (Vorhersagbarkeit)**: Zwei Dimensionen:
- **Performance-Vorhersagbarkeit**: Autoscaling und Load Balancing sorgen für
  konsistente Antwortzeiten, auch bei Lastspitzen
- **Kosten-Vorhersagbarkeit**: Azure Cost Management, Budgets und Alerts
  ermöglichen präzise Kostenkontrolle ohne Überraschungen am Monatsende

### 3. Security & Governance

**Security**: Azure bietet Sicherheitstools auf jeder Ebene — von physischer
Sicherheit der Rechenzentren bis zu Microsoft Defender for Cloud für
Bedrohungserkennung. Der Kunde bleibt aber verantwortlich für seine
Anwendungen und Daten (Shared Responsibility Model).

**Governance**: Azure Policy, RBAC, Resource Locks und Microsoft Purview
ermöglichen es Organisationen, einheitliche Standards durchzusetzen und
Compliance-Anforderungen zu erfüllen — automatisch, nicht manuell.

### 4. Manageability

**Manageability (Verwaltbarkeit)** in der Cloud bedeutet:
- Ressourcen über Templates automatisiert bereitstellen (ARM, Bicep, Terraform)
- Monitoring und Alerts über Azure Monitor centralisiert einrichten
- Skalierung automatisch auslösen ohne manuellen Eingriff
- Verwaltung über Portal, CLI, PowerShell oder REST-APIs

| Vorteil | Klassische IT-Entsprechung | Cloud-Vorteil |
|---------|---------------------------|---------------|
| High Availability | Redundante Hardware kaufen | SLA-garantiert, kein Eigenaufwand |
| Reliability | RAID, Backups | Eingebaut durch Redundanz-Architektur |
| Predictability | Kapazitätsplanung im Voraus | Autoscaling + Cost Management |
| Security | Eigenes Security-Team | Shared Responsibility + Azure-Tools |
| Governance | Manuelle Prozesse | Azure Policy automatisiert Compliance |
| Manageability | Manuelles Config-Management | IaC, ARM Templates, Automation |
  `.trim(),
};

export const CONCEPT_SERVERLESS: Concept = {
  id: "serverless-concept",
  title: "Serverless Computing",
  appliesTo: ["az-900", "az-104"],
  tags: ["cloud", "serverless", "functions", "event-driven", "paas"],
  content: `
## Serverless Computing

Serverless bedeutet nicht, dass es keine Server gibt — sondern dass du dich
nicht um Server kümmern musst. Der Cloud-Anbieter übernimmt vollständig
Bereitstellung, Skalierung und Wartung der Infrastruktur.

### Kernmerkmale

- **Event-driven**: Code wird nur ausgeführt, wenn ein Trigger ausgelöst wird
  (HTTP-Request, Timer, Nachricht in einer Queue, Datei-Upload, etc.)
- **Automatische Skalierung**: Von 0 bis Millionen von Anfragen ohne Konfiguration
- **Pay-per-Execution**: Abrechnung pro Ausführung und Laufzeit — bei 0 Aufrufen
  entstehen keine Kosten
- **Kein Server-Management**: Kein OS-Patching, kein Kapazitätsmanagement

### Abgrenzung: Serverless vs. PaaS

| Merkmal | PaaS (z.B. App Service) | Serverless (z.B. Azure Functions) |
|---------|------------------------|----------------------------------|
| Server-Mgmt | Kein OS-Management | Kein Server-Management |
| Skalierung | Manuell oder auto-scale | Vollautomatisch |
| Bereitschaft | Immer aktiv ("warm") | Cold-Start möglich |
| Kosten | Pro Stunde/Instanz | Pro Ausführung |
| Anwendungstyp | Lang laufende Web-Apps | Kurze, ereignisgetriebene Tasks |

### Wann ist Serverless sinnvoll?

- Unregelmäßige oder unvorhersehbare Last (z.B. nächtliche Batch-Jobs)
- Microservices-Architektur mit vielen kleinen, unabhängigen Funktionen
- Reaktion auf Events (neue Datei in Blob Storage, neue Nachricht, etc.)
- Entwicklerteams ohne Infrastruktur-Expertise

### Azure-Dienste mit Serverless-Charakter

| Dienst | Beschreibung |
|--------|-------------|
| **Azure Functions** | Hauptdienst für Serverless-Code (Consumption Plan) |
| **Azure Logic Apps** | Low-Code-Workflows und Integrationen |
| **Azure Container Apps** | Container serverless skalieren |
| **Azure Event Grid** | Event-Routing zwischen Azure-Diensten |

### Prüfungsfalle
Azure Functions kann AUCH im App Service Plan (nicht serverless) betrieben werden.
Die Prüfung fragt spezifisch nach dem **Consumption Plan** als serverless-Modell —
dabei entstehen Kosten nur bei tatsächlichen Ausführungen.
  `.trim(),
};

export const QUIZ_CLOUD_FUNDAMENTALS: Quiz = {
  id: "az900-quiz-cloud-fundamentals",
  title: "Quiz: Cloud Computing Grundlagen",
  description: "IaaS/PaaS/SaaS, CapEx/OpEx, Bereitstellungsmodelle und Shared Responsibility",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: CLOUD_FUNDAMENTALS_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_CLOUD_FUNDAMENTALS: Topic = {
  id: "cloud-fundamentals-topic",
  title: "Cloud Computing Grundlagen",
  description:
    "Was ist Cloud? IaaS/PaaS/SaaS, CapEx vs. OpEx, Consumption-Based Model, Serverless, Bereitstellungsmodelle (Public/Private/Hybrid/Multi-Cloud), Cloud-Vorteile und das Shared Responsibility Model.",
  conceptIds: [
    "cloud-intro",
    "cloud-service-models",
    "cloud-deployment-models",
    "cloud-benefits",
    "serverless-concept",
    "cloud-fundamentals-guide",
  ],
  quizIds: ["az900-quiz-cloud-fundamentals"],
  exerciseIds: [],
  prerequisiteTopicIds: [],
  estimatedMinutes: 70,
  tags: ["cloud", "azure", "fundamentals", "iaas", "paas", "saas", "serverless"],
};

export const CLOUD_FUNDAMENTALS_CONCEPTS: Record<string, Concept> = {
  "cloud-intro": CONCEPT_CLOUD_INTRO,
  "cloud-service-models": CONCEPT_CLOUD_SERVICE_MODELS,
  "cloud-deployment-models": CONCEPT_CLOUD_DEPLOYMENT_MODELS,
  "cloud-benefits": CONCEPT_CLOUD_BENEFITS,
  "serverless-concept": CONCEPT_SERVERLESS,
  "cloud-fundamentals-guide": CONCEPT_CLOUD_FUNDAMENTALS_GUIDE,
};

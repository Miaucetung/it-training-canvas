// ============================================================
// AZ-900 Topic 10: Azure Cost Management, SLAs & Service Lifecycle
// Domain 3: Azure Management and Governance (~30-35%)
// Outline: "Describe cost management in Azure" + "Describe SLAs and Service Lifecycle"
// Sources:
//   learn.microsoft.com/training/modules/describe-cost-management-azure/
//   (units 2–7, ms.date: 2026-01-16, zuletzt geprüft April 2026)
//   learn.microsoft.com/azure/cost-management-billing/
//   learn.microsoft.com/azure/well-architected/cost-optimization/
// WICHTIG: Der TCO Calculator wurde von Microsoft als RETIRED markiert.
//          (MS Learn Modul describe-cost-management-azure, Unit 3, April 2026)
//          Nicht als aktuelles Tool referenzieren.
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_COST_FACTORS: Concept = {
  id: "azure-cost-factors",
  title: "Kostenfaktoren in Azure: Was beeinflusst Azure-Rechnungen?",
  appliesTo: ["az-900"],
  tags: ["azure", "cost", "pricing", "geography", "consumption", "marketplace"],
  content: `
## Faktoren, die Azure-Kosten beeinflussen

Sechs Hauptfaktoren bestimmen, was in einer Azure-Rechnung steht
(verifiziert: MS Learn Unit 2, describe-cost-management-azure, 2026-01-16):

### 1. Resource Type (Ressourcentyp)

Jede Azure-Ressource hat ihren eigenen Preisbereich.
- Beispiel: Azure SQL Managed Instance kostet deutlich mehr als Azure SQL Basic
- Untertypen, Optionen und Konfigurationen beeinflussen den Preis
- Blob Storage: Kosten variieren nach Tier (Hot/Cool/Cold/Archive) und Zugriffsfrequenz

### 2. Consumption (Verbrauch)

Azure bietet ein Pay-as-you-go-Modell — du zahlst für das, was du verbrauchst.
Alternativ können Reservierungen und Savings Plans signifikant reduzieren (→ siehe Konzept Pricing-Optionen).

### 3. Maintenance (Wartung und aufgegebene Ressourcen)

⚠️ **Versteckte Kostenfalle**: Wenn du eine VM löschst, bleiben Nebenressourcen ggf. bestehen:
- Attached Storage Disks (Managed Disks) — weiter in Rechnung gestellt
- Netzwerkadapter (NICs) — nur Kosten, wenn IP-Adressen reserviert sind
- Reservierte öffentliche IP-Adressen — Kosten auch wenn nicht zugewiesen

Best Practice: Vor dem Löschen einer VM alle Nebenressourcen prüfen.
Azure Advisor → Cost-Kategorie identifiziert solche "Orphaned Resources".

### 4. Geography (Region / Netzwerkzonen)

**Regionen**: Preise für dieselbe Ressource können je nach Region variieren
(Infrastrukturkosten, Energiepreise, Datenschutzauflagen).

**Netzwerkzonen und Datentransfer**:
- **Eingehende Daten** zu Azure (Inbound / Ingress): Generell kostenlos
- **Ausgehende Daten** von Azure (Outbound / Egress): Werden nach Billing-Zone berechnet
- Datenübertragung zwischen Regionen ist generell teurer als innerhalb derselben Region

Billing Zones: Azure teilt die Welt in 4 geografische Zones ein (Zone 1, Zone 2, Zone 3, DE Zone)
— Outbound-Daten-Kosten variieren je nach Zone.

### 5. Subscription Type (Abonnementtyp)

Verschiedene Subscription-Typen enthalten unterschiedliche Angebote:
- **Free Trial**: $200 Credits für 30 Tage + 12 Monate Free-Tier-Dienste
- **Dev/Test-Subscriptions**: Reduzierte Preise für non-production Workloads
- **Enterprise Agreement (EA)**: Volumenrabatte für Großunternehmen
- **Pay-as-you-go**: Standard-Preisliste ohne Vorabverpflichtung

### 6. Azure Marketplace

Azure Marketplace ermöglicht den Kauf von Drittanbieter-Lösungen (VMs mit vorinstallierter Software,
Sicherheitslösungen, Monitoring-Tools etc.) — diese haben eigene Preisstrukturen und
können Lizenzgebühren enthalten. Die Abrechnung erfolgt über die Azure-Rechnung.

## Netzwerk: Die wichtigste Kostenregel

> "Daten ins Azure-Netzwerk hinein: kostenlos. Daten aus dem Azure-Netzwerk heraus: kostenpflichtig."

Diese Faustregel ist prüfungsrelevant. Exceptions:
- Einige Dienste haben eigene Preismodelle (z.B. CDN-Egress)
- Peered VNets in verschiedenen Regionen haben separate Kosten
  `.trim(),
};

export const CONCEPT_PRICING_OPTIONS: Concept = {
  id: "azure-pricing-options",
  title: "Azure Preisoptionen: Pay-as-you-go, Reservierungen, Savings Plans, Spot",
  appliesTo: ["az-900"],
  tags: ["azure", "pricing", "reservations", "savings-plan", "spot", "pay-as-you-go"],
  content: `
## Azure Preisoptionen

### Pay-as-you-go

Zahle für genau die Ressourcen, die du nutzt, nach der genutzten Zeit/Menge.
- Kein Vorabcommitment, keine Mindestlaufzeit
- Teuerste Option pro Stunde/GB bei kontinuierlicher Nutzung
- Ideal für: unvorhersehbare Workloads, Test/Dev, Einmalaufgaben

### Reservierungen (Reserved Instances)

Commitment auf **bestimmte Ressourcen** für **1 oder 3 Jahre** im Voraus.
- Bis zu ~72% Ersparnis gegenüber Pay-as-you-go (tatsächlicher Rabatt variiert je
  nach Ressourcentyp, Region und Laufzeit — der Wert liegt in der Regel darunter)
- Ressourcen-spezifisch: du reservierst z.B. einen SQL Managed Instance Standard_D8s_v3
  in West Europe für 1 Jahr
- Zahlung: Vorab (beste Ersparnis), monatlich, oder hybrid
- Unterstützte Ressourcentypen: VMs, SQL, Cosmos DB, Storage, App Service, etc.

Best for: **stabile, vorhersehbare Workloads** mit konstanter Nutzung

### Azure Savings Plan for Compute

Commitment auf **einen stündlichen Ausgabebetrag** für **1 oder 3 Jahre**.
- Flexibel: gilt über alle compute-eligible Dienste (VMs, ACI, Azure Functions etc.)
- Nicht ressourcenspezifisch — du kannst die VM-Familie oder Region ändern
- Bis zu ~65% Ersparnis (tatsächlicher Rabatt variiert je nach Dienst und Region;
  generell weniger als Reservierungen, dafür mehr Flexibilität)

Best for: **stabile compute-Ausgaben, aber wechselnder Ressourcen-Mix**

Unterschied Reservierung vs. Savings Plan:

| | Reservierung | Savings Plan for Compute |
|---|---|---|
| Commitment-Basis | Spezifische Ressource (VM-Familie, Region) | Stündlicher Ausgabebetrag |
| Flexibilität | Gering (ressourcen-/region-gebunden) | Hoch (alle compute-Dienste) |
| Max. Ersparnis | bis zu ~72% | bis zu ~65% |
| Für wer? | Workload läuft auf fixer Infrastruktur | Compute-Mix variiert |

### Spot VMs (Spot Pricing)

Nutzung von **ungenutzter Azure-Kapazität** zu stark reduzierten Preisen.
- Preis variiert je nach aktueller Verfügbarkeit der Kapazität
- ⚠️ Azure kann die VM **zurückfordern (evict)**, wenn die Kapazität benötigt wird
- Vorlaufzeit: 30-Sekunden-Eviction-Notice

Best for: **fehlertolerante, unterbrechbare Workloads**
(Batch-Processing, Rendering, Entwicklung, interruptible CI/CD-Jobs)

**Nicht geeignet für**: Produktions-Datenbanken, kritische API-Server, alles das Zuverlässigkeit erfordert

### Entscheidungsguide (verifiziert: MS Learn Unit 7a, 2026)

| Workload | Empfohlene Option |
|----------|------------------|
| 24/7 Produktions-SQL (stabile Infrastruktur) | Reservierungen |
| Web/API-Mix der VM-Familien wechselt | Savings Plan for Compute |
| Batch-Rendering, kann jederzeit unterbrochen werden | Spot VMs |
| Unvorhersehbarer Dev/Test-Traffic | Pay-as-you-go |
  `.trim(),
};

export const CONCEPT_PRICING_CALCULATOR: Concept = {
  id: "azure-pricing-calculator",
  title: "Azure Pricing Calculator: Kostenabschätzung vor dem Deployment",
  appliesTo: ["az-900"],
  tags: ["azure", "pricing-calculator", "cost-estimation", "tools"],
  content: `
## Azure Pricing Calculator

Der Azure Pricing Calculator unter **calculator.azure.com** hilft dabei,
die voraussichtlichen Kosten eines Azure-Workloads abzuschätzen **bevor etwas
deployed oder in Rechnung gestellt wird**.

### Wichtige Eigenschaften

- **Keine Provisioning**: Alles im Pricing Calculator ist hypothetisch —
  es wird keine Ressource erstellt und keine Kosten entstehen beim Verwenden
- **Schätzung, keine Garantie**: Preise können sich ändern; tatsächliche Kosten
  hängen von Nutzungsmustern, Rabatten und Verträgen ab
- **Konfigurierbar**: Du kannst Region, Tier, Redundanzoptionen, Laufzeit,
  Lizenzoptionen (Hybrid Benefit etc.) einstellen
- **Exportierbar**: Geschätzte Kosten als Excel oder URL teilbar

### Typische Nutzungsszenarien

1. **Vor einem Projekt**: "Wie viel kostet eine Webanwendung mit App Service (Standard S2),
   Azure SQL (General Purpose 4 vCores), und Application Insights?"
2. **Region-Vergleich**: Kosten in West Europe vs. East US vergleichen
3. **Tier-Vergleich**: Premium SSD vs. Standard SSD für VM-Storage

### Was der Pricing Calculator NICHT kann

- Tatsächlichen Verbrauch messen (dafür: Azure Monitor, Cost Management)
- Bisher aufgelaufene Kosten zeigen (dafür: Cost Management)
- Preisverhandlungen mit Microsoft (dafür: Enterprise Agreement, direkte Anfrage)

### Hinweis: TCO Calculator (RETIRED)

⚠️ Der **Total Cost of Ownership (TCO) Calculator** wurde von Microsoft **eingestellt (retired)**.
Er erscheint nicht mehr auf der Microsoft Learn-Lerneinheit zu Azure-Kostentools
(Unit 3, describe-cost-management-azure, Stand April 2026).
Ältere Lernmaterialien und Dritanbieter-Kurse referenzieren ihn noch —
im Kontext des aktuellen AZ-900-Prüfungsstoffs ist er nicht mehr relevant.
  `.trim(),
};

export const CONCEPT_COST_MANAGEMENT: Concept = {
  id: "azure-cost-management",
  title: "Microsoft Cost Management: Costs überwachen, Budgets setzen, Alerts",
  appliesTo: ["az-900"],
  tags: ["azure", "cost-management", "budgets", "alerts", "cost-analysis", "tags"],
  content: `
## Microsoft Cost Management

Cost Management ist ein Azure-Dienst, der hilft, Azure-Ausgaben zu verfolgen,
zu analysieren, zu kontrollieren und zu optimieren — ohne dass Ausgaben erst
auf der Monatsrechnung auffallen.

### Cost Analysis

Cost Analysis bietet eine **schnelle visuelle Übersicht über Azure-Kosten**:
- Aggregation nach Subscription, Resource Group, Service, Tag
- Ansichten: täglich, wöchentlich, nach Abrechnungszyklus
- Zeitverläufe für Trendanalyse (monatlich, quartalsweise, jährlich)

Typische Nutzungsfälle (MS Learn Unit 6):
- "Plötzlicher Kostenanstieg nach dem letzten Deployment — was hat das verursacht?"
- "Welche Resource Group verursacht 60% der monatlichen Kosten?"
- "Werden unsere Tags und Budgets korrekt eingesetzt?"

### Cost Alerts

Cost Management bündelt drei Typen von Cost Alerts in einer zentralen Ansicht:

**1. Budget Alerts**
- Benachrichtigung, wenn Ausgaben einen konfigurierten Schwellenwert erreichen oder überschreiten
- Konfiguration im Azure Portal oder per Azure Consumption API
- Beispiel: Alarm bei 80% eines monatlichen Dev/Test-Budgets
- Budget-Automation möglich: Bei 100% Budget → Ressourcen automatisch pausieren

**2. Credit Alerts** (nur für Enterprise Agreement-Kunden)
- Benachrichtigung, wenn Azure Kredit-Guthaben 90% und 100% verbraucht ist
- Relevant für EA-Kunden mit einem vorab bezahlten Monetary Commitment

**3. Department Spending Quota Alerts** (nur für Enterprise Agreement-Kunden)
- Benachrichtigung, wenn ein Abteilungsbudget einen festen Schwellenwert erreicht
- Konfiguration im EA Portal; typische Schwellen: 50% und 75% der Quota

### Budgets

Ein Budget in Cost Management legt einen Ausgabelimit fest:
- Scope: Subscription, Resource Group, Dienst-Typ, oder andere Kriterien
- Budget-Level → Alert-Level → Benachrichtigung ODER Automation (Ressourcen-Management)
- Automation: z.B. Non-Prod-Ressourcen automatisch abschalten wenn Budget 100% erreicht

### Tags für Kostenzuordnung

Tags sind Metadaten (Name-Wert-Paare), die Azure-Ressourcen zugewiesen werden:

| Tag-Name | Beispielwert | Kostenzuordnungs-Nutzen |
|----------|-------------|------------------------|
| Environment | Prod / Dev / Test | Kosten nach Umgebung trennen |
| CostCenter | CC-2023-IT | Interne Kostenverrechnung auf Abteilung |
| Owner | team-azure-ops | Verantwortlichen für Ressource identifizieren |
| Workload | webshop-frontend | Kosten pro Applikation/Projekt aufschlüsseln |

**Wichtig zu Tags**:
- Tags werden NICHT automatisch vererbt (Resource ≠ Resource Group ≠ Subscription)
- Azure Policy kann Tagging-Regeln durchsetzen (z.B. "jede neue Ressource muss 'Owner'-Tag haben")
- 6 Tag-Use-Cases (MS Learn Unit 7): Resource Management, Cost Management, Operations, Security, Governance, Workload Automation

### Tags vs. Resource Groups vs. Subscriptions

| Organisationsebene | Scope | Best for |
|-------------------|-------|----------|
| Subscription | Billing-Grenze, RBAC-Grenze | Trennung von Mandanten oder Geschäftsbereichen |
| Resource Group | Deployment-Einheit, Lebenszyklusgruppe | Ressourcen die gemeinsam deployed/gelöscht werden |
| Tags | Freie Metadaten, Querschnitt | Kostenstellenzuordnung, Suche, Compliance-Markierung |
  `.trim(),
};

export const CONCEPT_AZURE_SLA: Concept = {
  id: "azure-sla-lifecycle",
  title: "Azure SLAs, Composite SLA & Service Lifecycle",
  appliesTo: ["az-900"],
  tags: ["azure", "sla", "uptime", "composite-sla", "preview", "ga", "service-lifecycle"],
  content: `
## Azure SLAs (Service Level Agreements)

Ein SLA definiert die **garantierte Uptime (oder Performance)** eines Azure-Dienstes.
Microsoft veröffentlicht SLAs für alle Generally Available (GA) Azure-Dienste.

### SLA-Werte verstehen

SLA-Uptime-Werte bedeuten maximale jährliche Downtime:

| SLA | Max. Downtime/Jahr | Max. Downtime/Monat |
|-----|-------------------|-------------------|
| 99% | ~3 Tage 15h | ~7h 18min |
| 99.9% | ~8h 45min | ~43min |
| 99.95% | ~4h 22min | ~21min |
| 99.99% | ~52min | ~4min |
| 99.999% | ~5min | ~26 Sekunden |

### Composite SLA (kombinierte SLA)

Wenn eine Anwendung aus mehreren Azure-Diensten besteht, multipliziert man
die einzelnen SLAs für die **Gesamt-Composite-SLA**:

**Formel**: Composite SLA = SLA₁ × SLA₂ × SLA₃ × …

**Beispiel**: Web-App auf App Service (99.95%) + Azure SQL Database (99.99%)
- Composite SLA = 0.9995 × 0.9999 = **0.99940005** ≈ **99.94%**

⚠️ **Kontraintuitiver Effekt**: Jeder weitere Dienst in einer Architektur senkt die
Composite SLA — auch wenn alle Einzel-SLAs sehr hoch sind. Eine App mit fünf Diensten
à 99.99% hat eine Composite SLA von 0.9999⁵ ≈ **99.95%** — schlechter als jede Einzel-SLA.
Mehr Abhängigkeiten = mehr kombinierte Ausfallwahrscheinlichkeit.

💡 **Gegenmaßnahme durch Redundanz**: Durch parallele Instanzen kann die effektive
Verfügbarkeit erhöht werden. Zwei unabhängige Web-Apps (je 99.95%) fallen gleichzeitig
aus mit P = 0.0005 × 0.0005 = 0.00000025 — das ist eine effektive Verfügbarkeit von
≈ 99.99975%, deutlich höher als die Einzel-SLA.

### VM-SLA-Staffelung (aus Azure Architecture)

| VM-Konfiguration | SLA |
|-----------------|-----|
| Single VM mit Premium SSD | 99.9% |
| Zwei VMs in Availability Set | 99.95% |
| Zwei VMs in Availability Zones | 99.99% |

⚠️ Eine einzelne VM OHNE Premium SSD hat **kein SLA** von Microsoft.

### Dienste ohne SLA

Folgende Azure-Dienste haben kein SLA:
- **Preview-Dienste** (Private Preview, Public Preview) — kein SLA, kein Support-Garantie
- **Free-Tier-Ressourcen** (z.B. App Service Free F1-Plan)

## Azure Service Lifecycle: Preview → GA

### Private Preview

- Verfügbar nur für ausgewählte Kunden/Partner, auf Einladung
- Keine SLA, kein Produktions-Support
- Früheste Feedback-Phase für Microsoft

### Public Preview

- Verfügbar für alle Azure-Kunden (meist über Azure Portal mit "Preview"-Label)
- **Kein SLA** — nicht für Produktions-Workloads geeignet
- Für Evaluation, Testing, Feedback an Microsoft
- Preise können sich ändern oder Dienst kann eingestellt werden
- Erkennbar: im Portal mit "Preview"-Badge; in Docs mit "(preview)" im Titel

### Generally Available (GA)

- Offiziell released, stabil, für Produktion geeignet
- **SLA gilt** ab GA-Datum
- Vollständiger Microsoft-Support

### Warum ist der Lifecycle prüfungsrelevant?

AZ-900 testet das Verständnis, dass **Preview-Dienste kein SLA haben** und
daher nicht für produktive Workloads geeignet sind, die eine Uptime-Garantie erfordern.

Typische Prüfungsfrage: "Ein Unternehmen nutzt einen Azure-Dienst in Public Preview.
Welches SLA gilt?" → Antwort: Kein SLA für Preview-Dienste.
  `.trim(),
};

export const CONCEPT_COST_GUIDE: Concept = {
  id: "azure-cost-guide",
  title: "Lernguide: Azure Cost Management, Pricing & SLAs",
  appliesTo: ["az-900"],
  tags: ["azure", "cost", "sla", "guide", "pricing"],
  content: `
## Lernziele

- Die sechs Kostenfaktoren in Azure nennen können
- Pricing Calculator von Cost Management abgrenzen (Planung vs. Überwachung)
- TCO Calculator-Status kennen: **RETIRED** — nicht mehr prüfungsrelevant als aktuelles Tool
- Pay-as-you-go vs. Reservierungen vs. Savings Plan vs. Spot VM-Unterschiede
- Cost Management: Cost Analysis, 3 Alert-Typen, Budgets, Tags
- Composite SLA berechnen können
- Service Lifecycle (Private Preview → Public Preview → GA) und SLA-Implikationen

## Typische Prüfungsfallen

- ⚠️ **Pricing Calculator erstellt keine Ressourcen** — er ist nur eine Schätzung.
  Viele Prüfungsfragen testen diese Abgrenzung.

- ⚠️ **TCO Calculator: RETIRED — aber Prüfungsfragen-Bank beachten**
  Der TCO Calculator wurde von Microsoft eingestellt (MS Learn Unit 3, Stand April 2026).
  In neueren Kurs-Versionen erscheint er nicht mehr. **Aber**: Ältere Prüfungsfragen aus
  der Exam-Bank können ihn noch als Antwortoption enthalten (z.B. "Welches Tool hilft beim
  Vergleich On-Prem- vs. Cloud-Kosten?"). In diesem Fall: Den TCO Calculator als Option
  identifizieren die *historisch* für On-Prem→Cloud-Kostenvergleiche genutzt wurde —
  aber nicht als aktuell verfügbares Tool einordnen. Wenn eine andere Antwort das
  *aktuelle* Pricing Calculator oder Cost Management beschreibt, ist die neuere Antwort zu bevorzugen.

- ⚠️ **Credit Alerts und Department Quota Alerts sind nur für EA-Kunden**.
  Pay-as-you-go-Kunden können nur Budget Alerts konfigurieren.

- ⚠️ **Tags werden nicht vererbt**. Ein Tag auf einer Resource Group gilt nicht
  automatisch für die Ressourcen darin.

- ⚠️ **Preview-Dienste haben kein SLA** — auch wenn sie produktionsähnlich aussehen.

- ⚠️ **Composite SLA ist immer schlechter als der schwächste Einzel-SLA**
  (Multiplikation von Werten < 1). Höhere Verfügbarkeit durch Redundanz, nicht durch
  teurere Einzel-Ressourcen.

- ⚠️ **Inbound-Daten zu Azure kostenlos, Outbound bezahlpflichtig** — prüfungsrelevante
  Grundregel für Netzwerkkosten.

## Vergleich Pricing-Tools

| Tool | Zweck | Erstellt Ressourcen? |
|------|-------|---------------------|
| Azure Pricing Calculator | Kostenabschätzung vor Deployment | Nein |
| Microsoft Cost Management | Echte Kosten überwachen, Budgets | Nein |
| Azure Advisor (Cost-Kategorie) | Best-Practice-Empfehlungen für Savings | Nein |
| TCO Calculator | RETIRED — nicht mehr aktuell | N/A |
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_COST_SLA_QUESTIONS: Question[] = [
  {
    id: "az900-cost-q1",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen löscht eine Azure VM, möchte aber sicherstellen, dass keine unnötigen Kosten weiterlaufen. Welche der folgenden Nebenressourcen bleibt nach dem Löschen der VM bestehen und verursacht weiterhin Kosten?",
    explanation: "Managed Disks (Storage) bleiben nach dem Löschen der VM bestehen und werden weiter in Rechnung gestellt, solange sie existieren. Azure Advisor (Cost-Kategorie) zeigt diese 'Orphaned Resources' als Optimierungsempfehlung. NICs und öffentliche IPs können ebenfalls Kosten verursachen, aber Managed Disks sind das häufigste und am direktesten kostenpflichtige Überbleibsel.",
    answers: [
      { id: "a", text: "Das Azure Active Directory-Konto des VM-Administrators", isCorrect: false },
      { id: "b", text: "Attached Managed Disks der VM", isCorrect: true },
      { id: "c", text: "Der Azure Monitor Alert für die VM", isCorrect: false },
      { id: "d", text: "Die Azure Policy-Zuweisung für diese VM", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q2",
    type: "single-choice",
    points: 10,
    text: "Was ist der entscheidende Unterschied zwischen dem Azure Pricing Calculator und Microsoft Cost Management?",
    explanation: "Der Pricing Calculator schätzt voraussichtliche Kosten für hypothetische Konfigurationen — es werden keine Ressourcen erstellt und keine Kosten berechnet. Cost Management überwacht und analysiert echte, bereits aufgelaufene Azure-Kosten. Beide Kosten-Management-Tools, aber zu verschiedenen Zeitpunkten: Planung (Pricing Calculator) vs. Betrieb (Cost Management).",
    answers: [
      { id: "a", text: "Der Pricing Calculator ist für Enterprise Agreement-Kunden, Cost Management für Pay-as-you-go", isCorrect: false },
      { id: "b", text: "Pricing Calculator schätzt zukünftige Kosten (Planung); Cost Management überwacht echte aufgelaufene Kosten (Betrieb)", isCorrect: true },
      { id: "c", text: "Cost Management kann Ressourcen automatisch deployen um Kosten zu optimieren", isCorrect: false },
      { id: "d", text: "Der Pricing Calculator ist jetzt retired — nur Cost Management ist aktuell verfügbar", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q3",
    type: "single-choice",
    points: 10,
    text: "Eine Web-Anwendung nutzt Azure App Service (SLA 99.95%) und Azure SQL Database (SLA 99.99%). Was ist die kombinierte (Composite) SLA der Anwendung?",
    explanation: "Composite SLA = Produkt der Einzel-SLAs = 0.9995 × 0.9999 = 0.99940005 ≈ 99.94%. Die Composite SLA ist immer schlechter (niedriger) als die schwächste Einzel-SLA, da jede weitere Komponente eine weitere Ausfallwahrscheinlichkeit einführt.",
    answers: [
      { id: "a", text: "99.95% — Composite SLA entspricht der höchsten Einzel-SLA", isCorrect: false },
      { id: "b", text: "99.97% — Durchschnitt der beiden SLAs", isCorrect: false },
      { id: "c", text: "99.94% — Composite SLA = 0.9995 × 0.9999", isCorrect: true },
      { id: "d", text: "100% — beide Dienste zusammen garantieren vollständige Verfügbarkeit", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q4",
    type: "single-choice",
    points: 10,
    text: "Ein Startup nutzt einen neuen Azure-Datenbankdienst, der im Azure-Portal als 'Preview' markiert ist. Welches Service Level Agreement gilt für diesen Dienst?",
    explanation: "Preview-Dienste (sowohl Private Preview als auch Public Preview) haben kein SLA. Sie sind nicht für Produktions-Workloads geeignet, die Uptime-Garantien erfordern. SLAs gelten erst ab Generally Available (GA). Dies ist ein klassischer AZ-900-Prüfungspunkt.",
    answers: [
      { id: "a", text: "99.9% SLA — Standard-Uptime für alle Azure-Datenbankdienste", isCorrect: false },
      { id: "b", text: "Kein SLA — Preview-Dienste haben kein SLA", isCorrect: true },
      { id: "c", text: "99% SLA — reduziertes SLA für Preview-Dienste", isCorrect: false },
      { id: "d", text: "Das SLA gilt ab dem ersten Tag der Nutzung, unabhängig vom Status", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q5",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen verarbeitet nightly Batch-Jobs (Videorendering), die unterbrochen und neu gestartet werden können. Das Team will maximale Kostenersparnis bei Compute. Welche Preisoption ist am geeignetsten?",
    explanation: "Spot VMs nutzen ungenutzter Azure-Kapazität zu stark reduzierten Preisen, können aber von Azure zurückgefordert werden wenn die Kapazität benötigt wird (Eviction). Für fehlertolerante, unterbrechbare Workloads wie Batch-Rendering ist Spot die kostengünstigste Option. Reservierungen und Savings Plans erfordern Langzeit-Commitment und wären bei intermittierenden Batch-Jobs nicht optimal.",
    answers: [
      { id: "a", text: "Reservierungen (3-Jahres) — maximale Rabatte", isCorrect: false },
      { id: "b", text: "Azure Savings Plan for Compute — flexible Compute-Ausgaben", isCorrect: false },
      { id: "c", text: "Spot VMs — ungenutzte Kapazität, maximal günstig für unterbrechbare Workloads", isCorrect: true },
      { id: "d", text: "Pay-as-you-go — keine Vorabverpflichtung", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q6",
    type: "single-choice",
    points: 10,
    text: "Was unterscheidet Azure Savings Plan for Compute von Azure Reservierungen?",
    explanation: "Reservierungen binden sich an spezifische Ressource (VM-Familie, Region) — maximale Ersparnis (~72%), wenig Flexibilität. Savings Plan for Compute committed einen stündlichen Ausgabebetrag, der für alle compute-eligible Dienste gilt — ~65% Ersparnis, aber flexibel über VM-Familien und Regionen hinweg.",
    answers: [
      { id: "a", text: "Savings Plans sind nur für Speicher, Reservierungen nur für Compute", isCorrect: false },
      { id: "b", text: "Savings Plan committet einen stündlichen Ausgabebetrag (flexible Compute); Reservierung committet auf spezifische Ressourcen", isCorrect: true },
      { id: "c", text: "Reservierungen sind kostenlos, Savings Plans sind kostenpflichtig", isCorrect: false },
      { id: "d", text: "Savings Plans erfordern 5-Jahres-Commitment, Reservierungen 1 oder 3 Jahre", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q7",
    type: "single-choice",
    points: 10,
    text: "Ein Azure-Administrator möchte eine Warnung erhalten, wenn das monatliche Azure-Budget einer Subscription 80% des definierten Limits erreicht. Welches Cost Management-Feature konfiguriert er?",
    explanation: "Budget Alerts benachrichtigen wenn Ausgaben einen konfigurierten Schwellenwert (z.B. 80% des Budgets) erreichen oder überschreiten. Sie können im Azure Portal oder per Azure Consumption API konfiguriert werden. Credit Alerts sind für EA-Kunden mit Monetary Commitment.",
    answers: [
      { id: "a", text: "Credit Alert — Warnung bei verbrauchtem EA-Guthaben", isCorrect: false },
      { id: "b", text: "Budget Alert — Benachrichtigung bei Erreichen eines Ausgaben-Schwellenwerts", isCorrect: true },
      { id: "c", text: "Azure Monitor Metric Alert — überwacht Azure-Ressourcen-Metriken", isCorrect: false },
      { id: "d", text: "Azure Advisor Cost-Empfehlung — automatische Warnung bei Überschreitung", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q8",
    type: "single-choice",
    points: 10,
    text: "Ein Team taggt ihre Azure-Ressourcen mit 'CostCenter: CC-2023-IT'. Dann erstellen sie eine neue Resource Group und taggen diese ebenfalls mit 'CostCenter: CC-2023-IT'. Wird der Tag automatisch auf neue Ressourcen innerhalb dieser Resource Group übertragen?",
    explanation: "Tags werden NICHT automatisch von Resource Groups auf enthaltene Ressourcen vererbt. Jede Ressource muss eigenständig getaggt werden. Azure Policy kann genutzt werden, um Tagging-Regeln durchzusetzen und sicherzustellen, dass neue Ressourcen bestimmte Tags erhalten — aber das passiert nicht automatisch ohne Policy.",
    answers: [
      { id: "a", text: "Ja — Tags werden von Resource Groups automatisch auf alle enthaltenen Ressourcen vererbt", isCorrect: false },
      { id: "b", text: "Nein — Tags werden nicht automatisch vererbt; Ressourcen müssen einzeln oder per Policy getaggt werden", isCorrect: true },
      { id: "c", text: "Ja — aber nur für Ressourcen die nach dem Tag-Setzen erstellt werden", isCorrect: false },
      { id: "d", text: "Ja — aber nur innerhalb derselben Subscription", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q9",
    type: "single-choice",
    points: 10,
    text: "Welche Aussage zu Netzwerk-Datentransferkosten in Azure ist korrekt?",
    explanation: "Eingehende Daten zu Azure (Inbound/Ingress) sind generell kostenlos. Ausgehende Daten von Azure (Outbound/Egress) werden nach geografischer Billing-Zone berechnet. Dies ist eine prüfungsrelevante Grundregel.",
    answers: [
      { id: "a", text: "Sowohl eingehende als auch ausgehende Daten werden nach Volumen berechnet", isCorrect: false },
      { id: "b", text: "Eingehende Daten zu Azure sind generell kostenlos; ausgehende Daten von Azure sind bezahlpflichtig", isCorrect: true },
      { id: "c", text: "Netzwerk-Datentransfer ist immer kostenlos innerhalb von Azure", isCorrect: false },
      { id: "d", text: "Nur Datenübertragung zwischen verschiedenen Kontinenten ist kostenpflichtig", isCorrect: false },
    ],
  },
  {
    id: "az900-cost-q10",
    type: "single-choice",
    points: 10,
    text: "Ein Azure-Architekt plant eine neue Web-Anwendung und möchte die voraussichtlichen monatlichen Kosten für drei verschiedene Konfigurationsoptionen (unterschiedliche VM-Größen und Regionen) vergleichen — BEVOR etwas deployed wird. Welches Tool nutzt er dafür?",
    explanation: "Der Azure Pricing Calculator (calculator.azure.com) ist das Tool für Kostenabschätzungen vor dem Deployment. Es werden keine Ressourcen erstellt und es entstehen keine Kosten. Microsoft Cost Management hingegen analysiert echte bereits aufgelaufene Kosten. Azure Advisor gibt Empfehlungen für bestehende Ressourcen.",
    answers: [
      { id: "a", text: "Microsoft Cost Management — Echtzeit-Kostenüberwachung für laufende Ressourcen", isCorrect: false },
      { id: "b", text: "Azure Advisor — Kostenoptimierungsempfehlungen für bestehende Ressourcen", isCorrect: false },
      { id: "c", text: "Azure Pricing Calculator — Kostenabschätzung für hypothetische Konfigurationen vor Deployment", isCorrect: true },
      { id: "d", text: "Azure Monitor Cost Analysis — Analyse historischer Ausgaben", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_COST_SLA: Quiz = {
  id: "az900-quiz-azure-cost-sla",
  title: "Quiz: Azure Cost Management, Pricing & SLAs",
  description: "Kostenfaktoren, Pay-as-you-go vs. Reservierungen vs. Savings Plans vs. Spot, Pricing Calculator, Cost Management (Cost Analysis, Budgets, Alerts, Tags), Composite SLA, Service Lifecycle (Preview vs. GA)",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_COST_SLA_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_COST_SLA: Topic = {
  id: "azure-cost-sla",
  title: "Azure Cost Management, Pricing & SLAs",
  description:
    "Sechs Kostenfaktoren. Pricing-Optionen: Pay-as-you-go, Reservierungen, Savings Plans, Spot VMs. Azure Pricing Calculator. Microsoft Cost Management: Cost Analysis, Budget Alerts, Tags. Composite SLA. Service Lifecycle: Preview → GA.",
  conceptIds: [
    "azure-cost-factors",
    "azure-pricing-options",
    "azure-pricing-calculator",
    "azure-cost-management",
    "azure-sla-lifecycle",
    "azure-cost-guide",
  ],
  quizIds: ["az900-quiz-azure-cost-sla"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 80,
  tags: ["azure", "cost", "pricing", "sla", "lifecycle", "reservations", "spot", "budgets"],
};

export const AZURE_COST_SLA_CONCEPTS: Record<string, Concept> = {
  "azure-cost-factors": CONCEPT_COST_FACTORS,
  "azure-pricing-options": CONCEPT_PRICING_OPTIONS,
  "azure-pricing-calculator": CONCEPT_PRICING_CALCULATOR,
  "azure-cost-management": CONCEPT_COST_MANAGEMENT,
  "azure-sla-lifecycle": CONCEPT_AZURE_SLA,
  "azure-cost-guide": CONCEPT_COST_GUIDE,
};

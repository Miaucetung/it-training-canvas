// ============================================================
// AZ-900 Topic 9: Azure Monitoring Tools
// Domain 3: Azure Management and Governance (~30-35%)
// Outline: "Describe monitoring tools in Azure"
// Sources: learn.microsoft.com/training/modules/describe-monitoring-tools-azure/
//          (units 2, 3, 4 — ms.date: 2026-03-23, zuletzt geprüft April 2026)
//          learn.microsoft.com/azure/azure-monitor/overview
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_AZURE_ADVISOR: Concept = {
  id: "azure-advisor",
  title: "Azure Advisor: Personalisierte Best-Practice-Empfehlungen",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "advisor", "cost", "reliability", "security", "performance", "governance"],
  content: `
## Azure Advisor

Azure Advisor bewertet deine Azure-Ressourcen und liefert personalisierte
Empfehlungen, um Zuverlässigkeit, Sicherheit, Performance und Kosteneffizienz
zu verbessern. Jede Empfehlung enthält eine vorgeschlagene Aktion, die du
sofort ausführen, verschieben oder ablehnen kannst.

Du kannst Benachrichtigungen einrichten, sodass Advisor dich automatisch
informiert, wenn neue Empfehlungen verfügbar sind.

### Die fünf Kategorien (verifiziert: MS Learn Unit 2, 2026-03-23)

| Kategorie | Was wird bewertet |
|-----------|------------------|
| **Reliability** | Konfigurationsrisiken, die die Verfügbarkeit deiner Anwendungen beeinträchtigen können |
| **Security** | Bedrohungen und Schwachstellen, die zu Sicherheitsvorfällen führen können |
| **Performance** | Änderungen, die die Geschwindigkeit deiner Anwendungen verbessern können |
| **Operational Excellence** | Verbesserungen in Workflows, Deployments und Betriebsabläufen |
| **Cost** | Möglichkeiten zur Reduzierung deiner Azure-Ausgaben |

### Zugriff und Scope

Das Advisor-Dashboard zeigt Empfehlungen für alle deine Subscriptions.
Du kannst nach Subscription, Resource Group oder Dienst filtern.

### Advisor und Kosten (Cost-Kategorie)

Typische Kostenempfehlungen:
- "Diese VM ist unterlastet — skaliere auf eine kleinere Größe"
- "Reservierungen würden bei diesem Workload 40% sparen"
- "Dieser Storage-Account hat seit 90+ Tagen keinen Zugriff — prüfe, ob er noch benötigt wird"

### Advisor vs. Microsoft Defender for Cloud

Beide geben Empfehlungen, aber:
- **Azure Advisor**: Breites Spektrum (Cost, Performance, Reliability, Ops Excellence, Security)
- **Defender for Cloud**: Fokus ausschließlich auf Sicherheit, mit tiefergehenden
  Threat-Detection-Funktionen

Advisor und Defender for Cloud teilen sich teilweise Security-Empfehlungen —
Defender-Empfehlungen erscheinen auch in Advisors Security-Kategorie.
  `.trim(),
};

export const CONCEPT_AZURE_SERVICE_HEALTH: Concept = {
  id: "azure-service-health",
  title: "Azure Service Health: Verfügbarkeit von Azure-Diensten und -Ressourcen",
  appliesTo: ["az-900"],
  tags: ["azure", "service-health", "availability", "incidents", "planned-maintenance"],
  content: `
## Azure Service Health

Azure Service Health informiert dich über den Zustand von Azure selbst und
der spezifischen Ressourcen, die du betreibst. Es kombiniert drei Ansichten,
die vom globalen Überblick bis zur einzelnen Ressource reichen.

### Die drei Ansichten (verifiziert: MS Learn Unit 3, 2026-03-23)

#### 1. Azure Status
Gibt ein **globales Bild des Azure-Zustands** über alle Dienste und Regionen.
- Öffentlich zugänglich unter status.azure.com
- Nützlich bei weit verbreiteten Ausfällen, um zu prüfen, ob Azure betroffen ist
- Nicht personalisiert — zeigt alle Ereignisse, nicht nur die für dich relevanten

#### 2. Service Health
Fokussiert auf **die Azure-Dienste und Regionen, die du tatsächlich nutzt**.
- Da du angemeldet bist, weiß Service Health, welche Dienste für dich wichtig sind
- Zeigt Ausfälle, geplante Wartungen und Health Advisories, die für deine
  Umgebung relevant sind
- Du kannst Alerts einrichten, um automatisch benachrichtigt zu werden

Typen von Service Health-Ereignissen:
- **Service issues**: Aktive Störungen, die Azure-Dienste betreffen
- **Planned maintenance**: Geplante Wartungsarbeiten (z.B. Platform-Updates)
- **Health advisories**: Vorwarnung vor Änderungen, die Maßnahmen erfordern könnten

#### 3. Resource Health
Fokussiert auf **individuelle Ressourcen**, z.B. eine bestimmte VM.
- Zeigt, ob eine Ressource normal funktioniert oder ein Problem hat
- Zeigt, ob das Problem auf Azures Seite liegt oder auf deiner Seite
- Historische Alerts werden aufbewahrt, um wiederkehrende Trends zu erkennen

### Zusammenspiel der drei Ansichten

| Ansicht | Scope | Typische Nutzung |
|---------|-------|-----------------|
| Azure Status | Global, alle Dienste | "Gibt es einen weltweiten Azure-Ausfall?" |
| Service Health | Deine genutzten Dienste/Regionen | "Betrifft dieser Ausfall meinen Azure SQL in West Europe?" |
| Resource Health | Einzelne Ressource | "Ist diese spezifische VM ausgefallen und warum?" |

### Alerting

Service Health kann Alerts über Azure Monitor Action Groups versenden:
- E-Mail, SMS, Push-Benachrichtigung, Webhook, Logic App, etc.
- Empfohlen: Alert für "Service Issues" in den genutzten Regionen und Diensten
  → Bei Ausfall sofort informiert, bevor Kunden den Ausfall melden
  `.trim(),
};

export const CONCEPT_AZURE_MONITOR: Concept = {
  id: "azure-monitor",
  title: "Azure Monitor: Log Analytics, Alerts, Application Insights",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "monitor", "log-analytics", "alerts", "application-insights", "metrics", "logs"],
  relatedConceptIds: ["syslog-snmp"],
  content: `
## Azure Monitor

Azure Monitor ist eine Plattform zum **Sammeln, Analysieren und Reagieren auf Daten**
aus deinen Azure-Ressourcen und Anwendungen. Es funktioniert mit Azure,
On-Premises und Multi-Cloud-Umgebungen.

Azure Monitor sammelt Logs und Metriken von Anwendungen, Betriebssystemen und
Netzwerkschichten, speichert sie zentral und stellt sie über Dashboards,
Abfragen und Alerts bereit.

### Azure Log Analytics

Log Analytics ist das Tool im Azure-Portal, mit dem du **Abfragen gegen die von
Azure Monitor gesammelten Daten schreibst und ausführst**:

- Einfaches Filtern ("alle Fehler der letzten Stunde")
- Erweiterte Analysen für Trendvisualisierungen über Zeit
- Abfragesprache: **KQL (Kusto Query Language)** — SQL-ähnlich, aber für Log-Daten optimiert
- Log Analytics-Workspaces speichern Log-Daten von mehreren Quellen

Beispiel-KQL-Abfrage (konzeptionell):
\`\`\`
AzureActivity
| where OperationNameValue == "Microsoft.Compute/virtualMachines/delete"
| project TimeGenerated, Caller, ResourceGroup
\`\`\`

### Azure Monitor Alerts

Alerts **benachrichtigen dich, wenn Azure Monitor eine definierte Bedingung erkennt**:

1. Du erstellst eine **Alert Rule** mit: Condition (was wird überwacht?),
   Action Group (wer wird benachrichtigt, was passiert?), Severity (0=Critical bis 4=Verbose)
2. **Action Groups** sind wiederverwendbar — dieselbe Gruppe kann für Advisor,
   Service Health und Azure Monitor Alerts genutzt werden

**Zwei Alert-Typen**:
- **Metric-based Alert**: "Wenn VM-CPU > 80% für 5 Minuten → E-Mail senden"
- **Log-based Alert**: "Wenn ein spezifisches Fehlermuster in Log Analytics erscheint → Ticket erstellen"

**Action-Typen in Action Groups**:
E-Mail, SMS, Voice Call, Azure App Push, Webhook, Azure Function, Logic App,
ITSM-Integration (ServiceNow, etc.), Automation Runbook

### Application Insights

Application Insights ist ein **Azure Monitor-Feature für Web-Anwendungs-Monitoring**:

Es überwacht Performance und Nutzung deiner Webanwendungen — ob sie in Azure,
On-Premises oder einem anderen Cloud-Anbieter laufen.

**Zwei Integrationsmethoden**:
- **SDK in Anwendungscode einbinden** (JavaScript, .NET, Java, Python, Node.js, etc.)
- **Application Insights Agent** ohne Code-Änderungen (für IIS-gehostete .NET-Apps)

**Was Application Insights überwacht** (verifiziert: MS Learn Unit 4):
- Request-Raten, Response-Zeiten und Fehlerraten
- Abhängigkeits-Calls (Datenbank, externe APIs) und deren Performance
- Seitenlade-Zeiten, Nutzeranzahl und Session-Trends
- Server Performance Counters: CPU, Memory, Netzwerk-Nutzung
- **Availability Tests**: Synthetische Requests an deine App — prüfen, ob sie antwortet,
  auch bei geringem echten Traffic

### CCNA-Querverweis: Syslog/SNMP und Azure Monitor

In Netzwerken (CCNA) werden Logs zentral mit **Syslog** (UDP 514) gesammelt und
Ereignisse per **SNMP-Traps** (UDP 162) gemeldet. Azure Monitor ist das
Cloud-Äquivalent für zentrales Log-Management:

| Netzwerk-Konzept | Azure Monitor Entsprechung |
|------------------|---------------------------|
| Syslog-Server (zentraler Log-Collector) | Log Analytics Workspace |
| Syslog-Einträge (Severity: Emergency bis Debug) | Azure Monitor Logs (eigene Severity-Levels) |
| SNMP-Traps (Event-Benachrichtigung) | Azure Monitor Metric Alerts / Activity Log Alerts |
| NMS (Network Management System) | Azure Monitor Dashboards / Workbooks |

**Grenzen der Analogie**:
- Syslog ist ein einfaches Textprotokoll über UDP — Azure Monitor ist eine vollständige
  Observability-Plattform mit strukturierten JSON-Logs, Query Engine und Automatisierung
- SNMP-Traps sind reaktiv (Gerät meldet Ereignis). Azure Monitor Alerts können
  auch proaktiv per KQL-Abfrage auf Muster in historischen Daten reagieren
- Syslog hat keine eingebaute Korrelation mehrerer Log-Quellen.
  Log Analytics kann Logs aus hunderten Quellen korrelieren in einer einzigen Abfrage
- Konfiguration: Syslog ist auf Netzwerkgeräten konfiguriert (logging host).
  Azure Monitor-Verbindungen werden per Diagnostic Settings oder Data Collection Rules
  in Azure Resource Manager konfiguriert — keine Gerätekonfiguration
  `.trim(),
};

export const CONCEPT_MONITORING_GUIDE: Concept = {
  id: "azure-monitoring-guide",
  title: "Lernguide: Azure Monitoring Tools",
  appliesTo: ["az-900"],
  tags: ["azure", "monitoring", "guide", "advisor", "service-health", "monitor"],
  content: `
## Lernziele

- Azure Advisor: fünf Kategorien und typische Empfehlungen nennen können
- Azure Service Health: drei Ansichten (Azure Status / Service Health / Resource Health) und ihre Scopes unterscheiden
- Azure Monitor: Unterschied zwischen Metriken und Logs, Log Analytics (KQL), Azure Monitor Alerts (Action Groups), Application Insights erklären
- Advisor, Defender for Cloud und Azure Monitor in ihren Monitoring-Rollen abgrenzen

## Abgrenzung der Monitoring-Dienste

| Dienst | Primäre Frage | Hauptfunktion |
|--------|---------------|---------------|
| Azure Advisor | "Was soll ich optimieren?" | Empfehlungen (Cost, Security, Performance, Reliability, Ops) |
| Azure Service Health | "Ist Azure selbst ausgefallen?" | Azure-Dienst-Status + individuelle Ressourcen-Health |
| Azure Monitor | "Was passiert gerade in meiner Umgebung?" | Metriken, Logs, Alerts, Dashboards |
| Application Insights | "Wie performt meine Web-App?" | APM — Request Rates, Fehlerraten, Abhängigkeiten |
| Microsoft Defender for Cloud | "Wie sicher bin ich?" | CSPM, Threat Detection, Secure Score |
| Microsoft Sentinel | "Wer greift mich an?" | SIEM/SOAR für unternehmensweite Security Events |

## Typische Prüfungsfallen

- ⚠️ **"Azure Advisor = Monitoring-Tool"** — TEILWEISE. Advisor gibt Empfehlungen
  zur Verbesserung — es überwacht nicht in Echtzeit. Echtzeit-Monitoring macht
  Azure Monitor.

- ⚠️ **"Resource Health zeigt globale Azure-Ausfälle"** — FALSCH. Resource Health
  zeigt den Zustand einer einzelnen Ressource. Globale Ausfälle zeigt Azure Status.

- ⚠️ **"Azure Monitor Alerts können nur per E-Mail benachrichtigen"** — FALSCH.
  Action Groups unterstützen: E-Mail, SMS, Voice, Webhook, Azure Function,
  Logic App, ITSM-Integration, Automation Runbook.

- ⚠️ **"Application Insights läuft nur in Azure"** — FALSCH. Application Insights
  überwacht Web-Apps überall — auch On-Premises und in anderen Clouds.

- ⚠️ **"Log Analytics = Azure Monitor"** — TEILWEISE. Log Analytics ist ein
  Tool/Workspace innerhalb von Azure Monitor, nicht dasselbe. Azure Monitor ist
  die übergeordnete Plattform.
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_MONITORING_QUESTIONS: Question[] = [
  {
    id: "az900-monitoring-q1",
    type: "single-choice",
    points: 10,
    text: "Azure Advisor liefert Empfehlungen in fünf Kategorien. Welche der folgenden ist KEINE offizielle Advisor-Kategorie?",
    explanation: "Die fünf offiziellen Azure Advisor-Kategorien sind: Reliability, Security, Performance, Operational Excellence und Cost. 'Compliance' ist keine Advisor-Kategorie — Compliance-Management übernehmen Azure Policy und Microsoft Defender for Cloud (Regulatory Compliance Dashboard).",
    answers: [
      { id: "a", text: "Reliability — Konfigurationsrisiken für Anwendungsverfügbarkeit", isCorrect: false },
      { id: "b", text: "Cost — Möglichkeiten zur Reduzierung der Azure-Ausgaben", isCorrect: false },
      { id: "c", text: "Compliance — Einhaltung von ISO 27001, PCI DSS etc.", isCorrect: true },
      { id: "d", text: "Operational Excellence — Verbesserungen in Workflows und Deployments", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q2",
    type: "single-choice",
    points: 10,
    text: "Das 'Frachtlogistik Weser GmbH'-Team erhält um 02:00 Uhr eine Meldung, dass ihre Azure SQL-Datenbank in West Europe nicht erreichbar ist. Sie wollen schnell prüfen, ob Azure selbst ein Problem hat UND ob spezifisch die von ihnen genutzten Dienste betroffen sind. Welches Tool nutzen sie?",
    explanation: "Azure Service Health kombiniert genau diese beiden Aspekte: 'Azure Status' für den globalen Überblick ob Azure Probleme hat, und 'Service Health' für die spezifischen Dienste und Regionen, die das Unternehmen nutzt. Resource Health würde noch tiefer gehen zur einzelnen Ressource.",
    answers: [
      { id: "a", text: "Azure Advisor — zeigt Service-Ausfälle und Empfehlungen", isCorrect: false },
      { id: "b", text: "Azure Monitor Alerts — benachrichtigt bei selbst definierten Bedingungen", isCorrect: false },
      { id: "c", text: "Azure Service Health — globaler Azure-Status + dienst-/regionsspezifische Incidents", isCorrect: true },
      { id: "d", text: "Microsoft Defender for Cloud — zeigt Sicherheitsvorfälle", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q3",
    type: "single-choice",
    points: 10,
    text: "Ein Ops-Team will automatisch benachrichtigt werden, wenn eine Azure VM's CPU-Auslastung für mehr als 5 Minuten über 90% liegt. Welches Azure Monitor-Feature konfigurieren sie?",
    explanation: "Azure Monitor Alerts mit einer 'Metric-based Alert Rule' überwachen Metriken (wie CPU-Auslastung) gegen definierte Schwellenwerte. Die Alert Rule enthält die Bedingung (CPU > 90% für 5 min) und verweist auf eine Action Group (wer wird benachrichtigt und wie).",
    answers: [
      { id: "a", text: "Application Insights Availability Test — prüft App-Verfügbarkeit", isCorrect: false },
      { id: "b", text: "Azure Advisor Cost-Empfehlung — identifiziert unterlastete VMs", isCorrect: false },
      { id: "c", text: "Azure Monitor Alert Rule mit Metric-based Condition — Alarm bei Schwellenwert-Überschreitung", isCorrect: true },
      { id: "d", text: "Log Analytics KQL-Abfrage — analysiert historische Log-Daten", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q4",
    type: "single-choice",
    points: 10,
    text: "Ein Entwicklungsteam möchte wissen, wie lange ihre Web-API-Requests durchschnittlich dauern, wie viele Fehler auftreten und welche externen Datenbankaufrufe am langsamsten sind — für eine App in Azure App Service. Welches Tool ist am direktesten geeignet?",
    explanation: "Application Insights ist das Azure Monitor-Feature speziell für Web-Application-Performance-Monitoring (APM). Es überwacht Request-Raten, Response-Zeiten, Fehlerraten und Abhängigkeits-Calls (z.B. Datenbankaufrufe). Log Analytics kann mit Logs arbeiten, ist aber nicht direkt für App-Performance-Metriken ausgelegt.",
    answers: [
      { id: "a", text: "Azure Advisor — gibt Performance-Empfehlungen auf Infrastrukturebene", isCorrect: false },
      { id: "b", text: "Application Insights — APM für Web-Apps: Request Rates, Response Times, Dependencies", isCorrect: true },
      { id: "c", text: "Azure Service Health — zeigt ob Azure App Service regional ausgefallen ist", isCorrect: false },
      { id: "d", text: "Azure Cost Management — zeigt Kosten der App Service-Ressourcen", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q5",
    type: "single-choice",
    points: 10,
    text: "Was ist eine 'Action Group' in Azure Monitor?",
    explanation: "Eine Action Group ist eine wiederverwendbare Sammlung von Benachrichtigungsaktionen (E-Mail, SMS, Webhook, Azure Function, Logic App etc.). Sie wird von Alert Rules, Service Health Alerts und Azure Advisor Notifications genutzt. Eine Action Group kann für viele Alert Rules wiederverwendet werden.",
    answers: [
      { id: "a", text: "Eine Gruppe von Azure-Ressourcen, die gemeinsam überwacht werden", isCorrect: false },
      { id: "b", text: "Eine wiederverwendbare Sammlung von Benachrichtigungsaktionen (E-Mail, SMS, Webhook etc.)", isCorrect: true },
      { id: "c", text: "Eine Ansible/Terraform-ähnliche Konfigurationsgruppe für Automation", isCorrect: false },
      { id: "d", text: "Eine Gruppe von KQL-Abfragen für Log Analytics", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q6",
    type: "single-choice",
    points: 10,
    text: "Welche der drei Azure Service Health-Ansichten gibt den engsten Scope — auf Ebene einer einzelnen Ressource?",
    explanation: "Resource Health zeigt den Zustand einer individuellen Ressource (z.B. einer spezifischen VM) und ob Probleme auf Azures Seite oder der eigenen Konfiguration liegen. Azure Status ist der breiteste (globaler Überblick), Service Health ist der mittlere Scope (eigene genutzten Dienste/Regionen).",
    answers: [
      { id: "a", text: "Azure Status — globaler Überblick aller Azure-Dienste", isCorrect: false },
      { id: "b", text: "Service Health — Dienste und Regionen, die du nutzt", isCorrect: false },
      { id: "c", text: "Resource Health — individuelle Ressource", isCorrect: true },
      { id: "d", text: "Azure Monitor — Metriken und Logs aller Ressourcen", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q7",
    type: "single-choice",
    points: 10,
    text: "Application Insights kann Web-Apps auch ohne Code-Änderungen instrumentieren. Welches Feature ermöglicht das?",
    explanation: "Der Application Insights Agent (auch als Codeless Attach bezeichnet) ermöglicht die Instrumentierung ohne SDK-Integration in den Code — z.B. für IIS-gehostete .NET-Anwendungen. Die SDK-Methode ist alternativ für tiefere Integration und volle Feature-Unterstützung.",
    answers: [
      { id: "a", text: "Azure Monitor Diagnostic Settings — leitet Logs zu Application Insights weiter", isCorrect: false },
      { id: "b", text: "Application Insights Agent — instrumentiert Apps ohne Code-Änderungen", isCorrect: true },
      { id: "c", text: "Log Analytics Data Collection Rule — sammelt App-Logs automatisch", isCorrect: false },
      { id: "d", text: "Azure Policy — erzwingt Application Insights-Konfiguration", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q8",
    type: "single-choice",
    points: 10,
    text: "Ein Azure-Abonnement enthält 200 Ressourcen über 15 Resource Groups. Das Team möchte für alle Ressourcen gleichzeitig Best-Practice-Empfehlungen erhalten — für Cost, Reliability UND Security. Welches Tool bietet das in einer einzigen Ansicht?",
    explanation: "Azure Advisor zeigt alle fünf Kategorien (Cost, Reliability, Security, Performance, Operational Excellence) über alle Subscriptions und Resource Groups im Advisor-Dashboard in einer einzigen Ansicht. Es gibt kein separates Setup pro Ressource.",
    answers: [
      { id: "a", text: "Azure Monitor Log Analytics — schreibt Abfragen gegen Ressourcen-Logs", isCorrect: false },
      { id: "b", text: "Microsoft Defender for Cloud — fokussiert ausschließlich auf Security", isCorrect: false },
      { id: "c", text: "Azure Advisor — alle fünf Kategorien in einer Übersicht über alle Subscriptions", isCorrect: true },
      { id: "d", text: "Azure Service Health — zeigt nur Azure-Dienst-Ausfälle", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q9",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI der folgenden Aussagen zu Azure Monitor Alerts sind korrekt? (Wähle 2)",
    explanation: "Azure Monitor unterstützt Metric-based Alerts (Schwellenwerte auf Metriken wie CPU) UND Log-based Alerts (KQL-Muster in Log-Daten) — beide korrekt. Action Groups sind wiederverwendbar — dieselbe Group kann für mehrere Alert Rules und auch für Service Health Alerts genutzt werden — auch korrekt. Azure Monitor Alerts sind NICHT kostenlos ohne Limit — es gibt pro Alert-Regel und Signaltyp Kosten.",
    answers: [
      { id: "a", text: "Metric-based Alerts und Log-based Alerts sind zwei unterstützte Alert-Typen", isCorrect: true },
      { id: "b", text: "Action Groups können nur einer einzigen Alert Rule zugewiesen werden", isCorrect: false },
      { id: "c", text: "Action Groups sind wiederverwendbar und können von mehreren Alert Rules und Service Health geteilt werden", isCorrect: true },
      { id: "d", text: "Azure Monitor Alerts sind vollständig kostenlos ohne Mengenbeschränkung", isCorrect: false },
    ],
  },
  {
    id: "az900-monitoring-q10",
    type: "single-choice",
    points: 10,
    text: "Welche Abfragesprache wird in Azure Log Analytics verwendet, um Logs aus Azure Monitor abzufragen?",
    explanation: "KQL (Kusto Query Language) ist die Abfragesprache in Azure Log Analytics. KQL ist SQL-ähnlich aber für Log- und Time-Series-Daten optimiert. Microsoft Sentinel nutzt ebenfalls KQL. SQL wird für relationale Datenbanken genutzt, nicht für Log Analytics.",
    answers: [
      { id: "a", text: "SQL — Standard Structured Query Language", isCorrect: false },
      { id: "b", text: "KQL — Kusto Query Language, Log Analytics-Abfragesprache", isCorrect: true },
      { id: "c", text: "PowerShell — Azure Management-Scripting-Sprache", isCorrect: false },
      { id: "d", text: "ARM-Template — Azure Resource Manager Deployment-Sprache", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_MONITORING: Quiz = {
  id: "az900-quiz-azure-monitoring",
  title: "Quiz: Azure Monitoring Tools",
  description: "Azure Advisor (5 Kategorien), Azure Service Health (3 Ansichten), Azure Monitor, Log Analytics (KQL), Alerts, Application Insights",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_MONITORING_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_MONITORING: Topic = {
  id: "azure-monitoring",
  title: "Azure Monitoring Tools",
  description:
    "Azure Advisor (Reliability/Security/Performance/Cost/Ops). Azure Service Health (Azure Status / Service Health / Resource Health). Azure Monitor: Log Analytics (KQL), Monitor Alerts (Action Groups), Application Insights.",
  conceptIds: [
    "azure-advisor",
    "azure-service-health",
    "azure-monitor",
    "azure-monitoring-guide",
  ],
  quizIds: ["az900-quiz-azure-monitoring"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 70,
  tags: ["azure", "monitoring", "advisor", "service-health", "monitor", "log-analytics", "application-insights"],
};

export const AZURE_MONITORING_CONCEPTS: Record<string, Concept> = {
  "azure-advisor": CONCEPT_AZURE_ADVISOR,
  "azure-service-health": CONCEPT_AZURE_SERVICE_HEALTH,
  "azure-monitor": CONCEPT_AZURE_MONITOR,
  "azure-monitoring-guide": CONCEPT_MONITORING_GUIDE,
};

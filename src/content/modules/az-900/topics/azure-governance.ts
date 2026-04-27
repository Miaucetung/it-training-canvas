// ============================================================
// AZ-900 Topic 7: Azure Governance & Compliance
// Domain 3: Azure Management and Governance (~30-35%)
// Outline: "Describe features and tools in Azure for governance and compliance"
// Sources:
//   learn.microsoft.com/training/modules/describe-features-tools-azure-for-governance-compliance/
//   (units 2, 3, 4 — geprüft April 2026)
//   learn.microsoft.com/azure/governance/management-groups/overview
//   learn.microsoft.com/azure/governance/policy/overview
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_MANAGEMENT_GROUPS: Concept = {
  id: "azure-management-groups",
  title: "Azure Management Groups: Governance-Scope über Subscriptions",
  appliesTo: ["az-900"],
  tags: ["azure", "governance", "management-groups", "subscriptions", "hierarchy"],
  content: `
## Azure Management Groups

Wenn eine Organisation viele Azure-Subscriptions hat, braucht sie eine Möglichkeit,
Zugriff, Richtlinien und Compliance für alle Subscriptions effizient zu verwalten.
**Management Groups** sind die Governance-Ebene oberhalb von Subscriptions.

### Hierarchie: Vom Root nach unten

Azure hat eine einzige Organisations-Hierarchie für Governance:

\`\`\`
Root Management Group (eine pro Tenant)
└── Management Group "Corp"
    ├── Management Group "Production"
    │   ├── Subscription A
    │   └── Subscription B
    └── Management Group "Dev/Test"
        ├── Subscription C
        └── Management Group "Sandbox"
            └── Subscription D
\`\`\`

Die **Root Management Group** ist automatisch vorhanden — sie umfasst alle
Management Groups und Subscriptions im Tenant. Policies und Rollenzuweisungen
auf Root-Ebene gelten global für den gesamten Tenant.

### Vererbung von Policies und RBAC

Alles, was auf einer höheren Ebene definiert wird, erbt automatisch nach unten:
- Azure Policy auf Management Group → gilt für alle untergeordneten MGs, Subscriptions und Ressourcen
- RBAC-Rollenzuweisung auf Management Group → gilt für alle untergeordneten Subscriptions

Beispiel: Policy "VMs nur in West Europe und North Europe erlaubt" auf der Corp-MG
→ gilt automatisch für alle Subscriptions darunter, ohne jede Subscription einzeln zu konfigurieren.

### Wichtige Fakten (verifiziert: Azure Docs, Management Groups Overview)

- **10.000** Management Groups maximal pro Directory
- **6 Ebenen** Tiefe maximal (Root und Subscription-Ebene nicht mitgezählt)
- Jede MG und jede Subscription kann **genau einen Parent** haben
- Eine MG kann viele Child-MGs und Subscriptions haben
- Alle Subscriptions und MGs in einem Tenant teilen eine einzige Hierarchie

### Scope-Vergleich (Governance)

| Scope | Governance-Anwendung |
|-------|---------------------|
| Management Group | Organisation-weite Policies über viele Subscriptions |
| Subscription | Billing-Grenze, RBAC-Grenze pro Geschäftsbereich |
| Resource Group | Ressourcen-Verwaltung + Deployment-Einheit |
| Ressource | Direkte Lock/Tag/Policy-Anwendung auf einzelne Ressource |
  `.trim(),
};

export const CONCEPT_AZURE_POLICY: Concept = {
  id: "azure-policy",
  title: "Azure Policy: Compliance-Regeln definieren, auswerten und durchsetzen",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "policy", "governance", "compliance", "initiatives"],
  content: `
## Azure Policy

Azure Policy ist ein Dienst in Azure, mit dem du **Richtlinien erstellst, zuweist
und verwaltest**, die Azure-Ressourcen-Konfigurationen kontrollieren oder überwachen.
Diese Richtlinien erzwingen verschiedene Regeln, sodass Ressourcen konform mit
organisatorischen Standards bleiben.

### Was Azure Policy kann

1. **Definieren**: Einzelne Policy-Definitionen oder gruppierte **Initiativen** erstellen
2. **Auswerten**: Vorhandene und neue Ressourcen auf Compliance prüfen
3. **Durchsetzen**: Nicht-konforme Ressourcen ablehnen (Prevent) oder markieren (Audit)
4. **Remediation**: Automatisch Konfigurationen korrigieren (z.B. fehlende Tags hinzufügen)

### Policy-Scope und Vererbung

Azure Policies können auf jeder Ebene gesetzt werden:
- Ressource, Resource Group, Subscription, Management Group

Policies sind **vererbt**: Eine Policy auf einer Management Group gilt automatisch
für alle untergeordneten Subscriptions, Resource Groups und Ressourcen.

### Beispiele für Built-in Policies

- "Nur VM-Größen aus einer definierten Liste erlaubt"
- "Storage Accounts müssen HTTPS-only sein"
- "Alle Ressourcen müssen einen 'Owner'-Tag haben" + Auto-Remediation wenn fehlend
- "Ressourcen dürfen nur in bestimmten Azure-Regionen erstellt werden"

### Policy vs. RBAC

Beide kontrollieren Aktionen, aber auf unterschiedliche Weise:

| | Azure Policy | Azure RBAC |
|--|------------|-----------|
| Fokus | Ressourcen-Konfiguration | Wer darf was tun |
| Frage | "Ist diese VM-Größe erlaubt?" | "Darf dieser User VMs erstellen?" |
| Wann | Bei Deployment und laufend | Bei jeder API-Aktion |
| Scope | Ressourcen-Eigenschaften | Identitäten und Aktionen |

### Azure Policy Initiatives

Eine **Initiative** ist eine Sammlung verwandter Policies, um einen gemeinsamen
Compliance-Zustand zu verfolgen.

Beispiel: Die Initiative **"Enable Monitoring in Microsoft Defender for Cloud"**
enthält über 100 einzelne Policy-Definitionen, die zusammen ein Sicherheits-Baseline
für alle Azure-Ressourcentypen bilden.

Vorteil: Statt 100 Policies einzeln zu verwalten, verwaltest du eine Initiative
und siehst den Compliance-Status auf einen Blick.

### Azure Policy und AI-gestützte Änderungen

Azure Policy gilt unabhängig davon, wie eine Änderung vorgeschlagen wurde —
also auch bei KI-generierten Empfehlungen oder automatisierten Scripts.
Policy ist der "letzte Wächter" bei jedem Deployment.
  `.trim(),
};

export const CONCEPT_RESOURCE_LOCKS: Concept = {
  id: "azure-resource-locks",
  title: "Azure Resource Locks: Versehentliches Löschen oder Ändern verhindern",
  appliesTo: ["az-900"],
  tags: ["azure", "governance", "locks", "resource-management", "delete-protection"],
  content: `
## Azure Resource Locks

Ein **Resource Lock** verhindert, dass Ressourcen versehentlich gelöscht oder
geändert werden — auch wenn jemand die RBAC-Berechtigung hätte, diese Aktion
durchzuführen.

> Resource Locks sind der letzte Schutz gegen versehentliche Änderungen,
> unabhängig von RBAC.

### Genau ZWEI Lock-Typen — in zwei offiziellen Bezeichnungen (verifiziert: MS Learn Unit 4, April 2026)

Microsoft verwendet für dieselben Lock-Typen zwei verschiedene Bezeichnungen,
je nach Kontext — beide sind offiziell korrekt:

| Lock-Typ | Portal-Bezeichnung | CLI/API-Bezeichnung | Lesen | Ändern | Löschen |
|----------|-------------------|---------------------|-------|--------|---------|
| Kein Löschen | **Delete** | **CanNotDelete** | ✅ | ✅ | ❌ |
| Nur Lesen | **Read-only** | **ReadOnly** | ✅ | ❌ | ❌ |

> **Portal-Form = CLI-Form**: "Delete" und "CanNotDelete" meinen dasselbe.
> "Read-only" (Portal) und "ReadOnly" (CLI/API) meinen dasselbe.

⚠️ **Prüfungsfalle**: Es gibt KEINE Lock-Typen wie "DeleteOnly", "WriteOnly",
"ModifyOnly", "NoDelete" oder "CanNotModify". Nur diese zwei Typen — in
Portal-Schreibweise oder CLI-Schreibweise.

⚠️ **Zweite Prüfungsfalle**: In Prüfungsfragen kann "CanNotDelete" oder "Delete"
als Antwort erscheinen — beide sind korrekt für denselben Lock-Typ. Wenn
"Delete" als Distraktor neben "CanNotDelete" steht, sind es Synonyme, keine
verschiedenen Typen.

- **Delete / CanNotDelete**: Autorisierte User können lesen und ändern,
  aber nicht löschen.
- **Read-only / ReadOnly**: Autorisierte User können nur lesen.
  Entspricht einer Einschränkung auf die Reader-Rolle.

### Scope und Vererbung

Resource Locks können auf drei Ebenen angewendet werden:
- **Individuelle Ressource** → gilt nur für diese Ressource
- **Resource Group** → gilt für alle Ressourcen in der Gruppe (vererbt)
- **Subscription** → gilt für alle Resource Groups und Ressourcen (vererbt)

Wenn ein Lock auf einer Resource Group gesetzt ist, erben alle enthaltenen
Ressourcen automatisch denselben Lock.

### Verwaltung von Locks

Locks sind verwaltbar über: Azure Portal, PowerShell, Azure CLI, ARM Templates.

Im Azure Portal: Ressource → Settings → Locks.

### Locked Resource ändern oder löschen: Zwei-Schritt-Prozess

⚠️ Locks überschreiben RBAC. Auch ein Owner muss den Lock **zuerst entfernen**,
bevor die gesperrte Aktion durchgeführt werden kann.

Ablauf:
1. Lock entfernen
2. Aktion durchführen
3. (Optional) Lock wieder setzen

### Typische Anwendungsfälle

- **Produktions-Datenbanken**: ReadOnly-Lock verhindert Konfigurationsänderungen
- **Core-Networking-Ressourcen** (VNet, ExpressRoute): Delete-Lock verhindert versehentliches Löschen
- **Management-Subscriptions**: Lock auf Subscription-Ebene schützt die gesamte Infrastruktur
  `.trim(),
};

export const CONCEPT_MICROSOFT_PURVIEW: Concept = {
  id: "azure-microsoft-purview",
  title: "Microsoft Purview: Data Governance, Risk & Compliance",
  appliesTo: ["az-900"],
  tags: ["azure", "purview", "data-governance", "compliance", "risk"],
  content: `
## Microsoft Purview

**Microsoft Purview ist eine Familie von Data-Governance-, Risk- und Compliance-Lösungen**,
die eine einheitliche Sicht auf Daten über On-Premises, Multi-Cloud und
Software-as-a-Service-Umgebungen bietet.

### Was Microsoft Purview NICHT ist

⚠️ **Wichtige Klarstellung**: Microsoft Purview ist KEINE einfache Umbenennung
von "Azure Purview". Es handelt sich um einen **Brand-Merger aus 2022**:
- **Azure Purview** (Data Catalog/Governance) + **Microsoft 365 Compliance Center** (Risk & Compliance)
  wurden unter dem Namen "Microsoft Purview" zusammengeführt.
- Das Ergebnis ist eine breitere Plattform als die früheren Einzelprodukte.
- Der Dienst deckt sowohl Azure-Daten als auch M365-Daten (Teams, SharePoint, Exchange) ab.

### Zwei Hauptlösungsbereiche (verifiziert: MS Learn Unit 2)

#### 1. Risk & Compliance Solutions

Microsoft 365 ist eine Kernkomponente. Teams, OneDrive und Exchange werden
eingesetzt um Daten zu verwalten und zu überwachen.

Purview Risk & Compliance hilft beim:
- Schutz sensibler Daten über Clouds, Apps und Geräte
- Identifizieren von Datenrisiken und Verwalten regulatorischer Anforderungen
- Einstieg in die regulatorische Compliance

#### 2. Unified Data Governance

Einheitliche Data-Governance-Fähigkeiten zur Verwaltung von Daten in:
Azure, SQL- und Hive-Datenbanken, On-Premises und anderen Clouds (z.B. Amazon S3).

Unified Data Governance ermöglicht:
- Aktualisierte Karte aller Daten-Assets mit Klassifizierung und End-to-End-Lineage
- Identifizierung, wo sensitive Daten gespeichert sind
- Sichere Umgebung für Datenkonsumenten zum Finden wertvoller Daten
- Einblicke in die Art der Datenspeicherung und -nutzung
- Datenzugangsverwaltung sicher und im Maßstab

### Schlüsselfunktionen

- **Automated data discovery**: Automatisches Erkennen von Daten-Assets
- **Sensitive data classification**: Klassifizierung sensibler Daten
- **End-to-end data lineage**: Nachverfolgbarkeit von Daten durch die gesamte Pipeline

### Abgrenzung zu anderen Compliance-Diensten

| Dienst | Fokus |
|--------|-------|
| Microsoft Purview | Data Governance, Compliance, Risk — über alle Daten-Quellen |
| Azure Policy | Ressourcen-Konfiguration erzwingen (z.B. Tags, Regionen, Größen) |
| Microsoft Defender for Cloud | Security Posture Management, Threat Detection |
| Microsoft Sentinel | SIEM/SOAR — Security Events, Incident Response |
  `.trim(),
};

export const CONCEPT_GOVERNANCE_GUIDE: Concept = {
  id: "azure-governance-guide",
  title: "Lernguide: Azure Governance & Compliance",
  appliesTo: ["az-900"],
  tags: ["azure", "governance", "guide", "policy", "locks", "purview"],
  content: `
## Lernziele

- Management Groups: Hierarchie, Vererbung, Limits (10.000 MGs, 6 Ebenen) erklären
- Azure Policy: Policies vs. Initiatives, Scope, Vererbung, Remediation
- Resource Locks: Genau zwei Typen (Delete, ReadOnly) und ihre Unterschiede
- Microsoft Purview: als Brand-Merger (nicht Umbenennung), zwei Lösungsbereiche
- Abgrenzung: Policy ≠ RBAC, Locks ≠ Policy, Purview ≠ Defender for Cloud

## Typische Prüfungsfallen

- ⚠️ **Resource Locks haben genau ZWEI Typen: Delete und ReadOnly.**
  Keine anderen Typen. Ablenkoptionen wie "WriteProtect", "NoDelete", "DeleteOnly"
  kommen als Distraktoren vor. Immer: Delete (Lesen+Ändern erlaubt, Löschen verhindert)
  und ReadOnly (nur Lesen erlaubt).

- ⚠️ **Policy ≠ RBAC**: Policy kontrolliert Ressourcen-Konfiguration (was darf deployed
  werden). RBAC kontrolliert Identitäten (wer darf etwas tun). Beide können kombiniert
  werden und schränken sich gegenseitig ein.

- ⚠️ **Locks überschreiben RBAC-Berechtigungen**: Auch ein Owner muss einen Lock
  erst entfernen, bevor er eine gesperrte Aktion durchführen kann.

- ⚠️ **Policy-Vererbung geht nach unten**: Policy auf Management Group → gilt für
  alle Subscriptions, Resource Groups und Ressourcen darunter, automatisch.

- ⚠️ **Microsoft Purview ≠ nur eine Umbenennung von Azure Purview**:
  Es ist ein Brand-Merger von Azure Purview + M365 Compliance Center.
  Deckt auch M365-Dienste (Teams, Exchange, SharePoint) ab — nicht nur Azure-Daten.

## Zusammenhang der Governance-Ebenen

\`\`\`
Management Groups  →  Organisieren Subscriptions, Policy/RBAC auf höchster Ebene
        ↓
Azure Policy       →  Konfigurationsregeln auf jeder Ebene (Resource → Subscription → MG)
        ↓
Resource Locks     →  Letzter Schutz gegen Löschen/Ändern (überschreiben RBAC)
        ↓
Microsoft Purview  →  Querschnitts-Tool: Data Governance über alle Datenquellen
\`\`\`
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_GOVERNANCE_QUESTIONS: Question[] = [
  {
    id: "az900-governance-q1",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen hat 50 Azure-Subscriptions für verschiedene Abteilungen. Sie wollen eine Azure Policy ('VMs dürfen nur in EU-Regionen deployed werden') auf ALLE Subscriptions gleichzeitig anwenden. Welches Governance-Tool ist am direktesten geeignet?",
    explanation: "Management Groups ermöglichen Governance auf Subscription-Ebene und darüber. Eine Policy, die auf eine Management Group angewendet wird, vererbt sich auf alle untergeordneten Subscriptions, Resource Groups und Ressourcen automatisch. Ohne Management Groups müsste die Policy manuell auf jede der 50 Subscriptions angewendet werden.",
    answers: [
      { id: "a", text: "Azure Policy direkt auf jede der 50 Subscriptions — einzeln konfigurieren", isCorrect: false },
      { id: "b", text: "Management Groups — Policy auf einer MG einmal setzen, erbt automatisch auf alle Subscriptions", isCorrect: true },
      { id: "c", text: "Resource Locks — verhindern unerwünschte Deployments", isCorrect: false },
      { id: "d", text: "Azure RBAC — verweigert Deployments in falsche Regionen", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q2",
    type: "single-choice",
    points: 10,
    text: "Ein Resource Lock vom Typ 'ReadOnly' ist auf eine Azure Storage Account gesetzt. Was können autorisierte User noch tun?",
    explanation: "ReadOnly Lock erlaubt NUR Lesen. Ändern (Konfiguration ändern, Daten schreiben) und Löschen sind beide verhindert. Das entspricht einer Einschränkung aller autorisierten User auf die Reader-Rolle für diese Ressource — unabhängig von ihren tatsächlichen RBAC-Berechtigungen.",
    answers: [
      { id: "a", text: "Lesen und Ändern, aber nicht Löschen", isCorrect: false },
      { id: "b", text: "Lesen, Ändern und Löschen — Locks gelten nicht für Owner", isCorrect: false },
      { id: "c", text: "Nur Lesen — Ändern und Löschen sind verhindert", isCorrect: true },
      { id: "d", text: "Nichts — ReadOnly sperrt alle Aktionen inklusive Lesezugriff", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q3",
    type: "single-choice",
    points: 10,
    text: "Welches sind die korrekten offiziellen CLI/API-Bezeichnungen für die zwei Azure Resource Lock-Typen?",
    explanation: "Die offiziellen CLI/API-Bezeichnungen sind 'CanNotDelete' (Lesen und Ändern erlaubt, Löschen verhindert) und 'ReadOnly' (nur Lesen erlaubt). Im Azure Portal erscheinen sie als 'Delete' und 'Read-only' — das sind Synonyme, keine unterschiedlichen Typen. 'Delete' allein ist die Portal-Kurzform für 'CanNotDelete', kein eigener dritter Lock-Typ.",
    answers: [
      { id: "a", text: "Delete und ReadOnly", isCorrect: false },
      { id: "b", text: "CanNotDelete und ReadOnly", isCorrect: true },
      { id: "c", text: "CanNotDelete, ReadOnly und CanNotModify", isCorrect: false },
      { id: "d", text: "WriteProtect und DeleteProtect", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q4",
    type: "single-choice",
    points: 10,
    text: "Ein Azure-Administrator hat die Rolle 'Owner' auf einem Virtual Network. Das VNet hat einen 'Delete' Resource Lock. Was passiert, wenn der Admin versucht, das VNet zu löschen?",
    explanation: "Resource Locks überschreiben RBAC-Berechtigungen. Auch ein Owner muss zuerst den Lock entfernen, bevor die gesperrte Aktion durchgeführt werden kann. Das Löschen wird abgelehnt, solange der Lock aktiv ist — unabhängig von der RBAC-Rolle.",
    answers: [
      { id: "a", text: "Das Löschen gelingt — Owner hat alle Berechtigungen und Locks gelten nicht für Owner", isCorrect: false },
      { id: "b", text: "Das Löschen gelingt — Owner kann Locks temporär überschreiben", isCorrect: false },
      { id: "c", text: "Das Löschen wird abgelehnt — Delete Lock überschreibt RBAC, auch für Owner", isCorrect: true },
      { id: "d", text: "Das Löschen gelingt, wird aber im Azure Activity Log als 'Lock Override' protokolliert", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q5",
    type: "single-choice",
    points: 10,
    text: "Was ist der Unterschied zwischen einer Azure Policy und einer Azure Policy Initiative?",
    explanation: "Eine Azure Policy ist eine einzelne Regel (z.B. 'Storage Accounts müssen HTTPS-only sein'). Eine Initiative ist eine Sammlung verwandter Policies, die gemeinsam einen größeren Compliance-Zustand verfolgen (z.B. 'Enable Monitoring in Defender for Cloud' mit 100+ einzelnen Policies). Initiativen erleichtern die Verwaltung vieler zusammenhängender Compliance-Anforderungen.",
    answers: [
      { id: "a", text: "Eine Policy ist für Azure-Ressourcen, eine Initiative für on-premises Ressourcen", isCorrect: false },
      { id: "b", text: "Eine Policy ist eine einzelne Regel; eine Initiative ist eine Sammlung zusammengehöriger Policies", isCorrect: true },
      { id: "c", text: "Initiativen sind nur für Enterprise Agreement-Kunden verfügbar", isCorrect: false },
      { id: "d", text: "Policy und Initiative sind Synonyme — sie beschreiben dasselbe Feature", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q6",
    type: "single-choice",
    points: 10,
    text: "Microsoft Purview wird in der Microsoft-Dokumentation als was beschrieben?",
    explanation: "Microsoft Purview ist laut MS Learn Unit 2 'eine Familie von Data-Governance-, Risk- und Compliance-Lösungen'. Es ist NICHT nur eine Umbenennung von Azure Purview — es ist ein Brand-Merger aus Azure Purview (Data Governance) und Microsoft 365 Compliance Center (Risk & Compliance), der 2022 vollzogen wurde.",
    answers: [
      { id: "a", text: "Eine Umbenennung von 'Azure Purview' — gleiche Funktionen, neuer Name", isCorrect: false },
      { id: "b", text: "Ein SIEM/SOAR-Tool für Sicherheits-Incident-Management", isCorrect: false },
      { id: "c", text: "Eine Familie von Data-Governance-, Risk- und Compliance-Lösungen über Multi-Cloud und SaaS", isCorrect: true },
      { id: "d", text: "Ein Cloud Security Posture Management (CSPM) Tool für Azure-Ressourcen", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q7",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen will sicherstellen, dass jede neue Azure-Ressource automatisch mit dem Tag 'CostCenter' versehen wird — auch wenn das Tag beim Erstellen vergessen wurde. Welches Feature von Azure Policy ermöglicht das?",
    explanation: "Azure Policy hat eine Remediation-Funktion, die automatisch fehlende Tags hinzufügen kann. Policies können so konfiguriert werden, dass nicht-konforme Ressourcen (z.B. fehlender CostCenter-Tag) automatisch korrigiert werden — nicht nur markiert, sondern aktiv geändert. Ressourcen können als Ausnahmen markiert werden, um volle Kontrolle zu behalten.",
    answers: [
      { id: "a", text: "Resource Locks — verhindern das Erstellen von Ressourcen ohne Tag", isCorrect: false },
      { id: "b", text: "Azure Policy Remediation — korrigiert automatisch nicht-konforme Ressourcen (z.B. fehlende Tags hinzufügen)", isCorrect: true },
      { id: "c", text: "Management Groups — Tags werden automatisch vererbt", isCorrect: false },
      { id: "d", text: "Azure RBAC-Deny-Assignment — blockiert Ressourcen-Erstellung ohne Tag", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q8",
    type: "single-choice",
    points: 10,
    text: "Wie viele Ebenen (Levels) kann eine Management Group-Hierarchie maximal haben — ohne Root Management Group und ohne Subscriptions zu zählen?",
    explanation: "Laut Azure Docs (Management Groups Overview) unterstützt ein Management Group-Tree maximal 6 Ebenen Tiefe. Diese 6 Ebenen schließen weder die Root Management Group noch die Subscription-Ebene ein. In der Praxis haben die meisten Organisationen 2-4 Ebenen.",
    answers: [
      { id: "a", text: "3 Ebenen", isCorrect: false },
      { id: "b", text: "6 Ebenen", isCorrect: true },
      { id: "c", text: "10 Ebenen", isCorrect: false },
      { id: "d", text: "Unbegrenzt — solange max. 10.000 Management Groups nicht überschritten", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q9",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen setzt Microsoft Purview ein. Welche der folgenden Datenquellen kann Microsoft Purview Unified Data Governance verwalten?",
    explanation: "Microsoft Purview Unified Data Governance verwaltet Daten in Azure, SQL- und Hive-Datenbanken, On-Premises-Umgebungen und anderen Clouds (z.B. Amazon S3) — also ein breites Multi-Cloud und Hybrid-Spektrum. Es ist nicht auf Azure beschränkt.",
    answers: [
      { id: "a", text: "Nur Azure-Datenquellen (Azure Blob, Azure SQL, etc.)", isCorrect: false },
      { id: "b", text: "Nur Microsoft-Produkte (Azure, Microsoft 365, SQL Server)", isCorrect: false },
      { id: "c", text: "Azure, SQL, Hive, On-Premises und andere Clouds (z.B. Amazon S3)", isCorrect: true },
      { id: "d", text: "Nur relationale Datenbanken — keine Object Storage oder NoSQL", isCorrect: false },
    ],
  },
  {
    id: "az900-governance-q10",
    type: "single-choice",
    points: 10,
    text: "Welche Aussage zum Scope von Azure Policy ist korrekt?",
    explanation: "Azure Policies können auf jeder Ebene der Azure-Hierarchie gesetzt werden: Ressource, Resource Group, Subscription, Management Group. Policies sind vererbt — eine Policy auf einem höheren Scope gilt automatisch für alle untergeordneten Scopes. Eine Policy auf Subscription-Ebene gilt also für alle Resource Groups und Ressourcen darin.",
    answers: [
      { id: "a", text: "Azure Policy kann nur auf Subscription-Ebene konfiguriert werden", isCorrect: false },
      { id: "b", text: "Azure Policy gilt immer nur für die Ebene, auf der sie definiert wurde — keine Vererbung", isCorrect: false },
      { id: "c", text: "Azure Policy kann auf Ressource, Resource Group, Subscription oder Management Group gesetzt werden und vererbt sich nach unten", isCorrect: true },
      { id: "d", text: "Azure Policy übernimmt RBAC-Rollen-Definitionen und erweitert sie", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_GOVERNANCE: Quiz = {
  id: "az900-quiz-azure-governance",
  title: "Quiz: Azure Governance & Compliance",
  description: "Management Groups (Hierarchie, Limits), Azure Policy (Policies vs. Initiatives, Vererbung, Remediation), Resource Locks (Delete, ReadOnly), Microsoft Purview",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_GOVERNANCE_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_GOVERNANCE: Topic = {
  id: "azure-governance",
  title: "Azure Governance & Compliance",
  description:
    "Management Groups (Subscriptions hierarchisch organisieren). Azure Policy: Policies und Initiativen definieren, auswerten, durchsetzen, remediation. Resource Locks: Delete und ReadOnly. Microsoft Purview: Data Governance, Risk & Compliance.",
  conceptIds: [
    "azure-management-groups",
    "azure-policy",
    "azure-resource-locks",
    "azure-microsoft-purview",
    "azure-governance-guide",
  ],
  quizIds: ["az900-quiz-azure-governance"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 70,
  tags: ["azure", "governance", "compliance", "policy", "management-groups", "locks", "purview"],
};

export const AZURE_GOVERNANCE_CONCEPTS: Record<string, Concept> = {
  "azure-management-groups": CONCEPT_MANAGEMENT_GROUPS,
  "azure-policy": CONCEPT_AZURE_POLICY,
  "azure-resource-locks": CONCEPT_RESOURCE_LOCKS,
  "azure-microsoft-purview": CONCEPT_MICROSOFT_PURVIEW,
  "azure-governance-guide": CONCEPT_GOVERNANCE_GUIDE,
};

// ============================================================
// AZ-900 Topic 6: Azure Identity, Access & Security
// Domain 2: Azure Architecture and Services (~35-40%)
// Outline: "Describe Azure identity, access, and security"
// Sources: learn.microsoft.com/training/modules/describe-azure-identity-access-security/
//          (units 2, 5, 6, 7, 8 — zuletzt geprüft April 2026, ms.date: 2026-01-09)
//          learn.microsoft.com/entra/fundamentals/licensing
//          learn.microsoft.com/azure/role-based-access-control/built-in-roles
//          learn.microsoft.com/azure/defender-for-cloud
//          learn.microsoft.com/security/zero-trust
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_ENTRA_ID: Concept = {
  id: "azure-entra-id",
  title: "Microsoft Entra ID: Identität und Authentifizierung",
  appliesTo: ["az-900", "az-104", "az-500"],
  tags: ["azure", "entra", "identity", "authentication", "sso", "mfa", "passwordless"],
  content: `
## Microsoft Entra ID

**Wichtig**: Seit 2023 heißt "Azure Active Directory" offiziell **Microsoft Entra ID**.
In AZ-900-Prüfungen von Januar 2026 wird ausschließlich der Name "Microsoft Entra ID"
verwendet. "Azure AD" ist veraltet.

### Was ist Microsoft Entra ID?

Microsoft Entra ID ist ein **cloudbasierter Identity-and-Access-Management-Dienst (IAM)**:
- Verwaltet Benutzer, Gruppen, Anwendungsidentitäten (Service Principals, Managed Identities)
- Authentifiziert Benutzer für Microsoft-Cloud-Dienste (Azure, Microsoft 365, Dynamics 365)
- Ermöglicht Single Sign-On (SSO) für tausende von SaaS-Applikationen
- Schnittstelle zu On-Premises Active Directory via **Microsoft Entra Connect**

**Entra ID ≠ On-Premises Active Directory**:
- Klassisches AD: LDAP, Kerberos, Organisationseinheiten (OUs), Gruppenrichtlinien
- Microsoft Entra ID: OAuth 2.0, OIDC, SAML 2.0 — keine OUs, keine Gruppenrichtlinien
- Für Lift-and-Shift von AD-abhängigen Apps: **Microsoft Entra Domain Services**

### Authentifizierungsmethoden

#### Passwort-basiert (klassisch)
Benutzername + Passwort. Schwächste Methode — anfällig für Phishing, Password Spray,
Credential Stuffing.

#### Multi-Faktor-Authentifizierung (MFA)
Mindestens zwei der drei Faktoren:
- **Etwas, das du weißt**: Passwort, PIN
- **Etwas, das du hast**: Authenticator-App, SMS-Code, Hardware-Token
- **Etwas, das du bist**: Fingerabdruck, Gesichtserkennung

Azure-Optionen für MFA:
- Microsoft Authenticator App (Push-Benachrichtigung oder TOTP)
- SMS-Code (unsicher, gilt als schwächste MFA-Methode)
- Hardware-OATH-Token

#### Passwortlose Authentifizierung

Passwortlos bedeutet: kein Passwort in der Authentifizierungskette — sicherer UND
komfortabler als Passwörter.

| Methode | Beschreibung |
|---------|-------------|
| **Windows Hello for Business** | Biometrisch (Gesicht/Fingerabdruck) oder PIN, gebunden an Gerät |
| **Microsoft Authenticator (passwortlos)** | Biometrisch in der App ohne Passwort |
| **FIDO2-Sicherheitsschlüssel** | Physischer USB/NFC-Schlüssel (z.B. YubiKey) |

FIDO2 (Fast IDentity Online 2) ist ein offener Standard — Anbieter-unabhängig.

### Single Sign-On (SSO)

SSO erlaubt Benutzern, sich einmal anzumelden und auf viele Anwendungen zuzugreifen,
ohne sich pro App erneut zu authentifizieren. Vorteile:
- Weniger Passwörter = weniger Sicherheitsrisiken
- Bessere User Experience
- Zentrales Widerrufen von Zugriff bei Ausscheiden

Microsoft Entra ID unterstützt SSO für:
- Tausende vorregistrierte SaaS-Apps (Azure Marketplace App Gallery)
- Eigene Anwendungen (via OAuth 2.0 / SAML)
- On-Premises-Anwendungen (via Application Proxy)

### Microsoft Entra External Identities

Wie können externe Benutzer auf Azure-Ressourcen oder Anwendungen zugreifen?

- **B2B (Business-to-Business)**: Partner-Unternehmen-Mitarbeiter werden als Gäste
  ins eigene Entra-Tenant eingeladen. Sie authentifizieren sich mit ihren eigenen
  Unternehmensidentitäten (kein neues Konto erforderlich).
- **B2C (Business-to-Consumer)**: Kunden-Identitäten für eigene Anwendungen.
  Unterstützt lokale Konten, Social-Logins (Google, Facebook, Apple), externe
  Identity Provider.

### Microsoft Entra Domain Services

Microsoft Entra Domain Services (früher Azure AD DS) bietet verwaltete
Domain-Controller in Azure:
- Kompatibel mit LDAP, Kerberos, NTLM — für Lift-and-Shift-Anwendungen
- Keine Notwendigkeit, eigene Domain Controller VMs zu betreiben
- Synchronisiert Identitäten aus Microsoft Entra ID (einwegig: Entra → Domain Services)
- Einsatz: Legacy-Anwendungen, die AD-Protokolle benötigen, aber keine On-Premises-Server mehr existieren
  `.trim(),
};

export const CONCEPT_AZURE_RBAC: Concept = {
  id: "azure-rbac",
  title: "Azure RBAC: Rollenbasierte Zugriffskontrolle",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "rbac", "iam", "permissions", "roles", "least-privilege"],
  relatedConceptIds: ["aaa-radius"],
  content: `
## Azure Role-Based Access Control (RBAC)

Azure RBAC steuert, wer was in Azure tun darf — auf welchen Ressourcen.

### Grundprinzip: Rollenübernahme

**Subjekt** (Wer): Benutzer, Gruppe, Service Principal, Managed Identity
**Rolle** (Was darf ich): Sammlung von Berechtigungen (Actions, NotActions)
**Scope** (Worauf): Management Group, Subscription, Resource Group, einzelne Ressource

Eine **Rollenzuweisung** = Subjekt + Rolle + Scope

### Vordefinierte Rollen (wichtig für AZ-900)

| Rolle | Berechtigungen |
|-------|---------------|
| **Owner** | Alles, inkl. Zugriffsverwaltung weitergeben |
| **Contributor** | Alles, AUSSER Zugriffsrechte vergeben |
| **Reader** | Alles lesen, nichts ändern |
| **User Access Administrator** | Nur Zugriffsrechte verwalten |

Zusätzlich gibt es hunderte ressourcenspezifische Rollen:
- Virtual Machine Contributor — VMs erstellen/verwalten, aber keine Netzwerkressourcen
- Storage Blob Data Reader — nur Blobs lesen
- Key Vault Secrets User — nur Secrets lesen, keine Schlüsselverwaltung

### Scope-Hierarchie

RBAC-Zuweisungen werden vererbt:

\`\`\`
Management Group
  └── Subscription
        └── Resource Group
              └── Einzelne Ressource
\`\`\`

Wenn ein Benutzer die Rolle "Contributor" auf Subscription-Ebene hat, gilt das
für alle Resource Groups und Ressourcen darunter.

### Deny Assignments

RBAC verwendet normalerweise ein "Allow"-Modell (alles ist verboten, außer es wird
explizit erlaubt). Seit Azure Blueprints gibt es **Deny Assignments**, die bestimmte
Aktionen explizit verbieten — auch wenn eine Allow-Rolle diese Aktionen erlauben würde.

### Least Privilege Principle

Best Practice: Weise immer die **minimale Rolle** auf dem **kleinsten Scope** zu,
der für die Aufgabe notwendig ist.

Beispiel: Ein Backup-Service, der nur Storage Blobs lesen muss, sollte
"Storage Blob Data Reader" auf dem Storage Account haben — nicht "Contributor"
auf der Subscription.

### RBAC vs. Microsoft Entra ID Roles

Achtung — zwei unterschiedliche RBAC-Systeme:
- **Azure RBAC** (= Azure Resource Manager RBAC): Steuert Zugriff auf Azure-Ressourcen
  (VMs, Storage, Netzwerke, etc.)
- **Microsoft Entra ID Roles**: Steuert Zugriff auf Entra-Funktionen
  (Benutzer verwalten, Gruppen, Anwendungen registrieren)

"Global Administrator" in Entra ID ≠ "Owner" in Azure RBAC.
Ein Global Admin kann Azure-Ressourcen NICHT direkt verwalten — er kann sich nur
selbst "User Access Administrator"-Rechte geben.

### CCNA-Querverweis: AAA und RBAC — Analogie und ihre Grenzen

In Netzwerken (CCNA) ist **AAA (Authentication, Authorization, Accounting)**
mit RADIUS/TACACS+ das konzeptuelle Äquivalent zu Azures Identitätsverwaltung:

| AAA-Konzept (Netzwerk) | Azure-Entsprechung |
|------------------------|-------------------|
| Authentication (Wer bist du?) | Microsoft Entra ID-Login |
| Authorization (Was darfst du?) | Azure RBAC |
| Accounting (Was hast du getan?) | Azure Monitor Activity Log / Microsoft Sentinel |

**Grenzen der Analogie — wo die Ähnlichkeit endet:**

- **Scope**: RADIUS/TACACS+ kontrolliert **Zugriff auf Netzwerkgeräte** (Router-CLI,
  Switch-Konfiguration). Azure RBAC kontrolliert **Azure-Ressourcenoperationen**
  über den Azure Resource Manager (HTTP/REST-API). Beides ist AAA, aber auf
  völlig unterschiedlichen Ebenen der OSI-Schichten.

- **Protokoll**: RADIUS = UDP (Port 1812/1813), zustandslos.
  Azure RBAC = ARM REST-API (HTTPS), ausgewertet beim Request durch Azure Resource Manager.
  Es gibt kein "RADIUS-Server"-Äquivalent in Azure RBAC.

- **Trennung von AuthN/AuthZ**: TACACS+ trennt Authentication und Authorization
  in separate Transaktionen (Flex-Authorisierung per Befehl möglich).
  Azure trennt: Entra ID = AuthN; RBAC = AuthZ — aber sie sind beide in Azure
  Resource Manager integriert, nicht separat konfigurierbare Dienste.

- **Accounting**: RADIUS Accounting ist Built-in im RADIUS-Protokoll.
  Azure hat kein "Accounting" als Teil von RBAC — das übernehmen separate Dienste:
  Azure Monitor Activity Log (Was wurde in Azure gemacht?) und Microsoft Sentinel
  (Security-Events, Incident Management). Diese müssen explizit konfiguriert werden.

- **Befehlskontrolle**: TACACS+ kann auf Befehlsebene autorisieren
  (z.B. "show running-config" erlaubt, "no shutdown" verboten").
  Azure RBAC arbeitet mit **Actions** (z.B. "Microsoft.Compute/virtualMachines/write")
  — keine Kontrolle auf Befehlsebene einer CLI-Sitzung.

**Fazit**: Die AAA-Analogie hilft, das Prinzip zu verstehen. Für Prüfungen gilt:
Azure RBAC ist das Azure-Äquivalent zur Autorisierungskomponente (A) von AAA,
aber technisch ein eigenständiges Resource-Manager-Konzept — kein RADIUS/TACACS+.
  `.trim(),
};

export const CONCEPT_ZERO_TRUST_DEFENSE: Concept = {
  id: "azure-zero-trust",
  title: "Zero Trust und Defense-in-Depth",
  appliesTo: ["az-900", "az-500"],
  tags: ["azure", "security", "zero-trust", "defense-in-depth", "conditional-access"],
  content: `
## Zero Trust Security Model

Zero Trust ist ein Sicherheitsmodell, das auf dem Grundsatz basiert:
**"Vertraue niemandem — weder innerhalb noch außerhalb des Netzwerks."**

Klassisches Perimeter-Sicherheitsmodell: Alles innerhalb der Firewall ist vertrauenswürdig.
Zero Trust: Jeder Zugriffsversuch wird explizit verifiziert — unabhängig vom Standort.

### Zero Trust Prinzipien (Microsoft)

1. **Explizit verifizieren**: Immer authentifizieren und autorisieren — basierend auf
   allen verfügbaren Datenpunkten (Identität, Standort, Gerätezustand, Anwendung,
   Datenanforderung, erkannte Anomalien).

2. **Least Privilege Access**: Benutzer- und Service-Berechtigungen auf das Minimum
   begrenzen. Just-in-Time und Just-Enough-Access (JIT/JEA).

3. **Assume Breach**: Davon ausgehen, dass ein Angreifer bereits im Netzwerk ist.
   Schaden begrenzen durch Mikrosegmentierung, End-to-End-Verschlüsselung,
   Anomalie-Erkennung.

### Conditional Access (Microsoft Entra ID)

Conditional Access ist Azures Zero-Trust-Policy-Engine: "Wenn Signale erfüllt,
dann Zugriff gewähren / verweigern / MFA fordern."

Signale können sein: Benutzer/Gruppe, Standort (IP-Bereich, Land), Gerätezustand
(MDM-compliant?), Anwendung, Risikolevel (Entra ID Identity Protection).

**Lizenzierung — drei Stufen (Quelle: learn.microsoft.com/entra/fundamentals/licensing):**

| Tier | Feature | Beispiel |
|------|---------|---------|
| **Free / Security Defaults** | Vordefinierte Basisschutz-Richtlinien — nicht anpassbar | MFA für alle Admins erzwingen; Legacy-Auth blockieren; MFA bei Risikoereignissen |
| **Entra ID P1** | Vollständige Conditional Access-Richtlinien — individuell konfigurierbar | "Wenn Login aus unbekanntem Land → MFA"; "Wenn Gerät nicht compliant → Verweigern" |
| **Entra ID P2** | Risikobasiertes Conditional Access (Identity Protection) | "Wenn Sign-in-Risikolevel = Hoch → Passwortänderung erzwingen" |

**Security Defaults (Free-Tier)**: Seit Oktober 2019 in neuen Tenants standardmäßig
aktiviert. Bieten einfachen Basisschutz ohne Konfiguration — aber keine granularen
Richtlinien. Entweder Security Defaults OR Conditional Access Policies — nicht beides
gleichzeitig (sie schließen sich gegenseitig aus).

**Prüfungshinweis**: Die Frage "Was brauche ich für eigene Conditional Access-Richtlinien?"
→ Antwort: **Entra ID P1** (mindestens). Security Defaults im Free-Tier sind kein
"echtes" Conditional Access — sie sind fest vordefiniert und nicht anpassbar.

Beispiele für P1-Richtlinien:
- "Wenn Login aus unbekanntem Land → MFA erforderlich"
- "Wenn Gerät nicht MDM-compliant → Zugriff verweigern"
- "Wenn Anwendung = Finanz-App → Nur verwaltete Geräte"

Beispiel für P2 (risikobasiert, Identity Protection erforderlich):
- "Wenn Hochrisiko-Sign-in → Passwortänderung erzwingen"

## Defense-in-Depth (Verteidigung in der Tiefe)

Defense-in-Depth ist eine Sicherheitsstrategie mit mehreren Schutzschichten,
sodass das Versagen einer Schicht nicht zum vollständigen Kompromittieren führt.

### Die 7 Schichten (verifiziert nach MS Learn AZ-900, Unit 8: "Describe defense-in-depth",
### learn.microsoft.com/training/modules/describe-azure-identity-access-security/)

Das Modell zeigt Schichten von außen (Angreifer-Einstiegspunkt) nach innen (Daten):

| # | Schicht | Schutzfunktion (MS Learn-Definition) | Azure-Umsetzung |
|---|---------|--------------------------------------|----------------|
| 1 | **Physisch** | Erste Verteidigungslinie: Schutz der Hardware im Rechenzentrum | Microsoft DC-Sicherheit (liegt beim Betreiber) |
| 2 | **Identität & Zugriff** | Zugriffssteuerung auf Infrastruktur; SSO, MFA, Änderungsprotokollierung | Microsoft Entra ID, MFA, Azure RBAC |
| 3 | **Perimeter** | DDoS-Schutz gegen großflächige Angriffe; Perimeter-Firewalls | Azure DDoS Protection, Azure Firewall |
| 4 | **Netzwerk** | Kommunikationsbeschränkung zwischen Ressourcen; Segmentierung; "Deny by default" | NSGs, VNet-Subnets, Private Endpoints |
| 5 | **Compute** | VM-Zugriffsschutz; Endpoint Protection; Patch-Management | Microsoft Defender for Cloud, JIT VM Access |
| 6 | **Anwendung** | Sichere Anwendungsentwicklung; Security by Design; Secrets in Key Vault | Azure WAF, App Service Auth, Key Vault |
| 7 | **Daten** | Vertraulichkeit, Integrität und Verfügbarkeit der Daten; Verschlüsselung | Storage Encryption, Key Vault, TDE für SQL |

**Reihenfolge-Logik**: Schicht 1 (Physisch) ist der äußerste Ring — schwer zu überwinden.
Schicht 7 (Daten) ist der innerste Kern — was Angreifer letztendlich wollen.
"Jede Schicht schützt, sodass wenn eine Schicht durchbrochen wird, die nächste bereits
in Stellung ist." (MS Learn, Unit 8)

### Azure Key Vault

Azure Key Vault ist der zentrale Dienst zum sicheren Speichern von:
- **Secrets**: Passwörter, Verbindungszeichenfolgen, API-Keys
- **Keys**: Kryptografische Schlüssel (RSA, EC) für Encryption-at-Rest
- **Certificates**: SSL/TLS-Zertifikate

Key Vault verhindert, dass Secrets im Anwendungscode oder Konfigurationsdateien
gespeichert werden. Anwendungen authentifizieren sich mit Managed Identity und
rufen Secrets zur Laufzeit ab.
  `.trim(),
};

export const CONCEPT_DEFENDER_SENTINEL: Concept = {
  id: "azure-defender-sentinel",
  title: "Microsoft Defender for Cloud und Microsoft Sentinel",
  appliesTo: ["az-900", "az-500"],
  tags: ["azure", "security", "defender", "sentinel", "siem", "soar", "posture"],
  content: `
## Microsoft Defender for Cloud

**Wichtig**: Früher "Azure Security Center" und "Azure Defender" — heißt jetzt
offiziell **Microsoft Defender for Cloud**. "Azure Security Center" ist veraltet.

### Was macht Defender for Cloud?

Microsoft Defender for Cloud ist ein **CSPM (Cloud Security Posture Management)**
und **Workload Protection Platform (CWPP)**:

- **Sicherheitsbewertung (Secure Score)**: Numerische Bewertung des Sicherheitsstatus
  (0–100%). Zeigt Schwachstellen und gibt priorisierte Empfehlungen.
- **Empfehlungen**: Konkrete Maßnahmen zum Verbessern der Sicherheitslage
  (z.B. "MFA für alle Admins aktivieren", "Öffentliche IP-Zugriffe einschränken")
- **Threat Detection**: Erkennt verdächtige Aktivitäten und Angriffe in Echtzeit
- **Just-in-Time (JIT) VM-Zugriff**: RDP/SSH-Ports werden standardmäßig geschlossen
  und nur auf Anfrage für definierte Zeitfenster geöffnet
- **Adaptive Application Controls**: Kontrolliert, welche Anwendungen auf VMs laufen
- **Regulatory Compliance Dashboard**: Zeigt Konformität mit Standards wie ISO 27001,
  SOC 2, PCI DSS, CIS Benchmarks

Defender for Cloud ist nativ in Azure integriert — keine Agenten-Installation für
Azure-Dienste. Für On-Premises und andere Clouds (AWS, GCP) sind Agents erforderlich.

**Free vs. Enhanced Workload Protections**:
- Kostenfrei: Continuous Assessment, Secure Score, Grundempfehlungen
- Bezahlpflichtig: Erweiterte Threat Detection pro Ressourcentyp (VMs, SQL, Storage,
  Kubernetes, App Service, Key Vault, DNS, ARM, Open-Source DB, etc.)

## Microsoft Sentinel

**Wichtig**: Microsoft Sentinel hat kein "Azure"-Präfix — es heißt
**Microsoft Sentinel** (nicht "Azure Sentinel").

### Was ist Microsoft Sentinel?

Microsoft Sentinel ist ein **SIEM (Security Information and Event Management)**
und **SOAR (Security Orchestration, Automation and Response)**-Dienst:

- **Daten sammeln**: Logs aus Azure (Activity Log, Entra ID, Defender), Microsoft 365,
  AWS, GCP, On-Premises-Sicherheitsgeräten, Drittanbieter-Lösungen
- **Analysieren**: KI/ML-basierte Bedrohungserkennung, benutzerdefinierte Abfrageregeln
  (KQL — Kusto Query Language)
- **Reagieren**: Automatisierte Playbooks (Azure Logic Apps) — z.B. Benutzer bei
  verdächtigem Login automatisch sperren
- **Untersuchen**: Interaktiver Untersuchungs-Graph für Incident Response

### Defender for Cloud vs. Microsoft Sentinel

| Aspekt | Defender for Cloud | Microsoft Sentinel |
|--------|-------------------|-------------------|
| Fokus | Azure-Ressourcen-Sicherheit | SIEM für alle Log-Quellen |
| Primärzweck | Posture Management + Workload-Schutz | Threat Detection + SOAR |
| Scope | Azure + Multi-Cloud (Agent) | Beliebige Log-Quellen |
| KI | Threat Detection für spezif. Dienste | Unternehmensweite Anomalie-Erkennung |

Beide Dienste ergänzen sich — Defender for Cloud liefert Alerts, die Sentinel
aggregiert und korreliert.

### CCNA-Querverweis: SIEM und Syslog/SNMP

In Netzwerken (CCNA) werden Logs über **Syslog** (UDP 514) gesammelt und mit
**SNMP-Traps** werden Ereignisse gemeldet. Microsoft Sentinel ist das Azure-Äquivalent:
- Syslog → Sentinel Log Analytics (Data Connectors für Syslog, CEF, SNMP)
- SNMP-Traps → Azure Monitor (Alerts auf Metriken)
- Security-SIEM On-Premises → Microsoft Sentinel (Cloud-SIEM)
  `.trim(),
};

export const CONCEPT_IDENTITY_SECURITY_GUIDE: Concept = {
  id: "azure-identity-security-guide",
  title: "Lernguide: Azure Identity, Access & Security",
  appliesTo: ["az-900"],
  tags: ["azure", "identity", "security", "guide", "entra", "rbac", "defender"],
  content: `
## Lernziele

- Microsoft Entra ID als Cloud-IAM-Dienst erklären (kein "Azure AD" mehr!)
- SSO, MFA und passwortlose Methoden (Windows Hello, FIDO2, Authenticator) unterscheiden
- Azure RBAC: Owner/Contributor/Reader und Scope-Hierarchie verstehen
- Microsoft Entra Domain Services (verwaltete DCs) von Entra ID abgrenzen
- Zero Trust und Defense-in-Depth mit Azure-Diensten verknüpfen
- Conditional Access als Zero-Trust-Implementierung erklären
- Microsoft Defender for Cloud (CSPM/CWPP) von Microsoft Sentinel (SIEM/SOAR) abgrenzen

## Praxis-Szenario

Das "Konsortium Metropol AG" (500 Mitarbeiter) plant Azure-Einführung:

**Anforderung 1**: Mitarbeiter sollen mit ihren Office-365-Konten auch auf Azure DevOps,
Salesforce und 50 weitere SaaS-Apps zugreifen — ohne separate Passwörter.
→ **Microsoft Entra ID SSO** + App Gallery Integrationen

**Anforderung 2**: Alle Admin-Konten müssen eine zweite Authentifizierungsmethode nutzen.
Für privilegierte Zugriffe soll passwortlose Auth eingeführt werden.
→ **MFA** für alle; **FIDO2-Sicherheitsschlüssel** für Admins

**Anforderung 3**: Ein Entwicklerteam soll VMs in einer bestimmten Resource Group
erstellen und verwalten dürfen, aber keine Netzwerkressourcen anfassen.
→ **"Virtual Machine Contributor"-Rolle** auf Resource-Group-Scope
  (nicht "Contributor" auf Subscription — Least Privilege)

**Anforderung 4**: Partnerunternehmen-Mitarbeiter sollen auf ein SharePoint-Projekt
zugreifen, ohne ein neues Azure-Konto.
→ **Microsoft Entra B2B External Identities** (Gasteinladung)

**Anforderung 5**: Bei Logins aus unbekannten Ländern soll MFA erzwungen werden.
→ **Conditional Access Policy**: Standortbedingung → MFA erforderlich

## Kritische Terminologie-Falle

| ❌ Veraltet | ✅ Korrekt |
|-------------|-----------|
| Azure Active Directory | Microsoft Entra ID |
| Azure AD DS | Microsoft Entra Domain Services |
| Azure Security Center | Microsoft Defender for Cloud |
| Azure Defender | Microsoft Defender for Cloud |
| Azure Sentinel | Microsoft Sentinel |

**AZ-900-Prüfungen ab Januar 2026 verwenden ausschließlich die neuen Namen.**
Alte Bezeichnungen können in Fragen als falsche Antwortoptionen auftauchen!

## Typische Prüfungsfallen

- ⚠️ **"Entra ID = On-Premises Active Directory in der Cloud"** — FALSCH.
  Entra ID nutzt OAuth/OIDC/SAML, nicht LDAP/Kerberos. Für LDAP/Kerberos in Azure:
  Microsoft Entra Domain Services.

- ⚠️ **"RBAC-Owner = Entra ID Global Administrator"** — FALSCH. Zwei separate
  RBAC-Systeme. Azure RBAC steuert Azure-Ressourcen, Entra ID Roles steuern
  Entra-Verwaltungsaktionen.

- ⚠️ **"MFA ist dasselbe wie passwortlose Auth"** — FALSCH. MFA kombiniert
  Passwort + zweiten Faktor. Passwortlos eliminiert das Passwort vollständig
  (nur biometrisch/FIDO2).

- ⚠️ **"Defender for Cloud = Microsoft Sentinel"** — FALSCH. Defender for Cloud
  schützt Azure-Workloads und gibt Sicherheitsempfehlungen. Sentinel ist ein
  SIEM/SOAR für unternehmensweites Log-Management und Threat Intelligence.

- ⚠️ **"Conditional Access ist kostenlos im Free-Tier"** — FALSCH. Im Free-Tier gibt
  es nur **Security Defaults** — fest vordefinierte, nicht anpassbare Basisschutz-Richtlinien.
  Eigene, granulare Conditional Access-Richtlinien (z.B. standortbasiert, gerätebasiert)
  erfordern mindestens **Entra ID P1**. Risk-basiertes Conditional Access (z.B. Sign-in-Risiko
  als Bedingung) benötigt **P2** (Identity Protection).
  Quelle: learn.microsoft.com/entra/fundamentals/licensing
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_IDENTITY_SECURITY_QUESTIONS: Question[] = [
  {
    id: "az900-identity-q1",
    type: "single-choice",
    points: 10,
    text: "Wie heißt der Azure-Identitätsdienst, der OAuth 2.0 und SAML unterstützt und für die Authentifizierung von Cloud-Anwendungen und Microsoft 365 verwendet wird?",
    explanation: "Der korrekte, aktuelle Name ist 'Microsoft Entra ID'. Der alte Name 'Azure Active Directory' (Azure AD) ist seit 2023 veraltet. AZ-900-Prüfungen ab Januar 2026 verwenden ausschließlich 'Microsoft Entra ID'.",
    answers: [
      { id: "a", text: "Azure Active Directory (Azure AD)", isCorrect: false },
      { id: "b", text: "Microsoft Entra ID", isCorrect: true },
      { id: "c", text: "Microsoft Entra Domain Services", isCorrect: false },
      { id: "d", text: "Azure Identity Manager", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q2",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen möchte seine Legacy-Anwendungen in Azure betreiben, die für den Betrieb Kerberos-Authentifizierung und LDAP-Abfragen benötigen — ohne eigene Domain Controller VMs zu verwalten. Welcher Dienst ist geeignet?",
    explanation: "Microsoft Entra Domain Services bietet verwaltete Domain Controller in Azure mit LDAP, Kerberos und NTLM — ohne eigene DC-VMs. Microsoft Entra ID selbst unterstützt kein LDAP/Kerberos (es nutzt OAuth/OIDC/SAML). Azure Bastion ist für sicheren VM-Zugriff, kein DC-Ersatz.",
    answers: [
      { id: "a", text: "Microsoft Entra ID — stellt alle AD-Protokolle bereit", isCorrect: false },
      { id: "b", text: "Microsoft Entra Domain Services — verwaltete DCs mit LDAP und Kerberos", isCorrect: true },
      { id: "c", text: "Azure Bastion — sichere RDP-Verbindung zu VMs ohne öffentliche IP", isCorrect: false },
      { id: "d", text: "Microsoft Defender for Cloud — Schutz für AD-Workloads", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q3",
    type: "single-choice",
    points: 10,
    text: "Welches Azure-RBAC-Prinzip beschreibt: Ein DevOps-Engineer bekommt 'Contributor'-Rechte nur auf eine bestimmte Resource Group, nicht auf die gesamte Subscription?",
    explanation: "Dies ist das Least-Privilege-Prinzip mit minimalem Scope. RBAC-Zuweisungen sollten immer die minimale Rolle auf dem kleinsten notwendigen Scope haben. 'Contributor' auf Subscription-Level würde Schreibzugriff auf ALLE Ressourcen in der Subscription geben — zu weitreichend.",
    answers: [
      { id: "a", text: "Separation of Duties — zwei Personen müssen gemeinsam handeln", isCorrect: false },
      { id: "b", text: "Least Privilege — minimale Berechtigungen auf kleinstmöglichem Scope", isCorrect: true },
      { id: "c", text: "Defense-in-Depth — mehrere Schutzschichten", isCorrect: false },
      { id: "d", text: "Zero Trust — alle Zugriffe werden explizit verifiziert", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q4",
    type: "single-choice",
    points: 10,
    text: "Welche Azure RBAC-Rolle erlaubt ALLES — inklusive Zugriffsrechte an andere weitergeben?",
    explanation: "Owner ist die umfassendste Azure RBAC-Rolle: vollständige Kontrolle über alle Ressourcen und kann Zugriffsrechte weitergeben. Contributor hat alle Änderungsrechte, ABER kann keine Zugriffsrechte vergeben. Reader ist schreibgeschützt.",
    answers: [
      { id: "a", text: "Contributor — kann Ressourcen erstellen und löschen", isCorrect: false },
      { id: "b", text: "Global Administrator — hat alle Rechte in Azure", isCorrect: false },
      { id: "c", text: "Owner — alle Rechte inklusive Zugriffsvergabe", isCorrect: true },
      { id: "d", text: "Security Administrator — steuert alle Sicherheitseinstellungen", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q5",
    type: "single-choice",
    points: 10,
    text: "Was ist FIDO2 im Kontext von Microsoft Entra ID?",
    explanation: "FIDO2 (Fast IDentity Online 2) ist ein offener Standard für passwortlose Authentifizierung mit physischen Sicherheitsschlüsseln (z.B. YubiKey). Es ist einer der drei passwortlosen Methoden in Entra ID (neben Windows Hello for Business und Microsoft Authenticator passwortlos). FIDO2-Keys funktionieren auch ohne Internetzugang.",
    answers: [
      { id: "a", text: "Ein MFA-Standard, der SMS-Codes erzeugt", isCorrect: false },
      { id: "b", text: "Ein offener Authentifizierungsstandard für physische Sicherheitsschlüssel (passwortlos)", isCorrect: true },
      { id: "c", text: "Eine Microsoft-proprietäre Biometrie-Technologie für Windows-Geräte", isCorrect: false },
      { id: "d", text: "Ein Single Sign-On Protokoll für SaaS-Anwendungen", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q6",
    type: "single-choice",
    points: 10,
    text: "Die 'Stadtwerk Allee GmbH' will, dass Mitarbeiter nur dann auf Azure-Ressourcen zugreifen können, wenn sie ein Firmen-Gerät nutzen, das als 'compliant' im MDM registriert ist. Welche Funktion setzt diese Anforderung um?",
    explanation: "Conditional Access in Microsoft Entra ID P1 erlaubt genau diese Richtlinien: 'Wenn Bedingung X (Gerät nicht compliant) → Zugriff verweigern'. Der Gerätezustand (compliant, Intune-registriert) ist eine der verfügbaren Bedingungen. MFA erzwingt Authentifizierung, aber kontrolliert nicht den Gerätezustand.",
    answers: [
      { id: "a", text: "Multi-Faktor-Authentifizierung (MFA) — zweiter Faktor für alle Logins", isCorrect: false },
      { id: "b", text: "Azure RBAC — steuert Berechtigungen auf Resource-Ebene", isCorrect: false },
      { id: "c", text: "Conditional Access — richtlinienbasierter Zugriff mit Gerätezustand als Bedingung", isCorrect: true },
      { id: "d", text: "Microsoft Sentinel — SIEM für Security Events", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q7",
    type: "single-choice",
    points: 10,
    text: "Welches Sicherheitsmodell basiert auf dem Prinzip 'Niemals vertrauen, immer verifizieren' und davon ausgehen, dass ein Angreifer bereits im Netzwerk ist?",
    explanation: "Zero Trust basiert auf drei Prinzipien: Explizit verifizieren (jeden Zugriff authentifizieren), Least Privilege, und Assume Breach (davon ausgehen, dass man bereits kompromittiert ist). Klassische Perimeter-Sicherheit vertraut allem innerhalb der Firewall — das ist das Gegenteil von Zero Trust.",
    answers: [
      { id: "a", text: "Defense-in-Depth — mehrere Sicherheitsschichten hintereinander", isCorrect: false },
      { id: "b", text: "Perimeter Security — schützt die Außengrenzen des Netzwerks", isCorrect: false },
      { id: "c", text: "Zero Trust — niemals vertrauen, immer verifizieren, Breach annehmen", isCorrect: true },
      { id: "d", text: "Separation of Duties — kritische Aktionen erfordern mehrere Personen", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q8",
    type: "single-choice",
    points: 10,
    text: "Welcher Dienst ist ein SIEM/SOAR für unternehmensweite Security-Log-Aggregation, KI-basierte Bedrohungserkennung und automatisierte Incident Response in Azure?",
    explanation: "Microsoft Sentinel ist Azures SIEM (Security Information and Event Management) und SOAR (Security Orchestration, Automation and Response). Es aggregiert Logs aus beliebigen Quellen, erkennt Bedrohungen per KI/KQL und automatisiert Reaktionen via Logic App Playbooks. Microsoft Defender for Cloud ist fokussierter auf Azure-Ressourcen-Posture-Management.",
    answers: [
      { id: "a", text: "Microsoft Defender for Cloud — schützt Azure-Workloads und gibt Empfehlungen", isCorrect: false },
      { id: "b", text: "Microsoft Sentinel — SIEM/SOAR für unternehmensweite Threat Detection und Response", isCorrect: true },
      { id: "c", text: "Azure Monitor — Metriken und Logs für Azure-Ressourcen", isCorrect: false },
      { id: "d", text: "Azure Policy — erzwingt Compliance-Regeln für Azure-Ressourcen", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q9",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI Authentifizierungsmethoden gelten in Microsoft Entra ID als 'passwortlos'? (Wähle 2)",
    explanation: "Passwortlose Methoden eliminieren das Passwort komplett: Windows Hello for Business (Biometrie/PIN, gerätegebunden) und FIDO2-Sicherheitsschlüssel (physischer Hardware-Key). SMS-Codes sind ein MFA-Faktor (nicht passwortlos — du brauchst immer noch ein Passwort + SMS). TOTP (Time-based One-Time Password) ist ebenfalls ein MFA-Faktor, kein passwortloses Verfahren.",
    answers: [
      { id: "a", text: "Windows Hello for Business — biometrisch/PIN, gerätegebunden", isCorrect: true },
      { id: "b", text: "SMS-Einmalcode — zweiter Faktor per Textnachricht", isCorrect: false },
      { id: "c", text: "FIDO2-Sicherheitsschlüssel — physischer Hardware-Key nach offenem Standard", isCorrect: true },
      { id: "d", text: "TOTP Authenticator — zeitbasierter Einmalcode aus der App", isCorrect: false },
    ],
  },
  {
    id: "az900-identity-q10",
    type: "single-choice",
    points: 10,
    text: "Ein IT-Sicherheitsadministrator soll RBAC-Rollenzuweisungen in einer Azure Subscription verwalten dürfen — also Rollen vergeben und entziehen können — aber KEINE eigenen Ressourcen erstellen oder löschen. Welche Rolle ist genau richtig?",
    explanation: "User Access Administrator ist genau für diesen Zweck: Rollenzuweisungen verwalten, ohne selbst Ressourcen erstellen oder ändern zu können. Owner kann alles inklusive Rollenvergabe, ABER auch Ressourcen erstellen/löschen — zu weitreichend. Contributor kann Ressourcen verwalten, ABER keine Rollen vergeben. Reader ist nur lesend.",
    answers: [
      { id: "a", text: "Owner — alles inklusive Rollenvergabe und Ressourcenverwaltung", isCorrect: false },
      { id: "b", text: "Contributor — Ressourcen verwalten, aber keine Rollenvergabe", isCorrect: false },
      { id: "c", text: "User Access Administrator — nur Rollenzuweisungen verwalten, keine Ressourcenoperationen", isCorrect: true },
      { id: "d", text: "Reader — nur lesen, keine Änderungen", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_IDENTITY_SECURITY: Quiz = {
  id: "az900-quiz-azure-identity-security",
  title: "Quiz: Azure Identity, Access & Security",
  description: "Microsoft Entra ID, RBAC, SSO, MFA, FIDO2, Zero Trust, Defense-in-Depth, Defender for Cloud, Sentinel",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_IDENTITY_SECURITY_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_IDENTITY_SECURITY: Topic = {
  id: "azure-identity-security",
  title: "Azure Identity, Access & Security",
  description:
    "Microsoft Entra ID, SSO, MFA, passwortlose Auth (FIDO2, Windows Hello). Azure RBAC (Owner/Contributor/Reader). Zero Trust, Defense-in-Depth, Conditional Access. Microsoft Defender for Cloud (CSPM/CWPP), Microsoft Sentinel (SIEM/SOAR).",
  conceptIds: [
    "azure-entra-id",
    "azure-rbac",
    "azure-zero-trust",
    "azure-defender-sentinel",
    "azure-identity-security-guide",
  ],
  quizIds: ["az900-quiz-azure-identity-security"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 90,
  tags: ["azure", "identity", "security", "entra", "rbac", "zero-trust", "defender", "sentinel"],
};

export const AZURE_IDENTITY_SECURITY_CONCEPTS: Record<string, Concept> = {
  "azure-entra-id": CONCEPT_ENTRA_ID,
  "azure-rbac": CONCEPT_AZURE_RBAC,
  "azure-zero-trust": CONCEPT_ZERO_TRUST_DEFENSE,
  "azure-defender-sentinel": CONCEPT_DEFENDER_SENTINEL,
  "azure-identity-security-guide": CONCEPT_IDENTITY_SECURITY_GUIDE,
};

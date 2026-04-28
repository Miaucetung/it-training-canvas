// ============================================================
// CompTIA Network+ N10-009 — Topic 3: Netzwerksicherheit & Angriffe
// Domains: 4.1 (Grundlegende Sicherheitskonzepte), 4.2 (Angriffstypen), 4.3 (Sicherheitslösungen)
// Sources:
//   CompTIA Network+ N10-009 Exam Objectives Version 4.0 (lokal, Projektordner)
//   NIST SP 800-207 "Zero Trust Architecture" (August 2020) — csrc.nist.gov
//   Wikipedia — für unstrittige technische Definitionen (CIA-Triade, Firewall-Typen)
// Cross-References:
//   → CCNA: acls (Access Control Lists — Cisco-IOS-Kontext)
//   → AZ-900: azure-rbac (Identity & Access Management — Cloud-Kontext)
// N10-009 Scope-Grenze:
//   Angriffe: erkennen und benennen können (N+ Scope)
//   Mitigation-Details und Hardening-Tiefe: CompTIA Security+ Territorium
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_SECURITY_FUNDAMENTALS_NP: Concept = {
  id: "netplus-security-fundamentals",
  title: "Netzwerksicherheit-Grundlagen: CIA, IAM, Firewall-Typen (N10-009)",
  appliesTo: ["comptia-network-plus"],
  tags: ["security", "cia-triad", "iam", "firewall", "zero-trust", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["acl-extended", "azure-rbac", "security-fundamentals"],
  content: `
## Netzwerksicherheit: Die N10-009-Grundlagen

### Die CIA-Triade — Fundament aller Sicherheitskonzepte

Network+ (und alle CompTIA-Zertifizierungen) bauen auf der CIA-Triade auf:

| Schutzziel | Beschreibung | Bedrohung |
|---|---|---|
| **Confidentiality** (Vertraulichkeit) | Daten sind nur für Berechtigte zugänglich | Abhören, Data Leakage |
| **Integrity** (Integrität) | Daten werden nicht unbemerkt verändert | Man-in-the-Middle, Tampering |
| **Availability** (Verfügbarkeit) | Systeme sind für Berechtigte erreichbar | DDoS, Ransomware |

**Prüfungstipp:** Viele N10-009-Szenarien fragen, welches CIA-Schutzziel verletzt wird. Ein DDoS-Angriff → Availability. Abgehörter Datenverkehr → Confidentiality. Manipulierte DNS-Antwort → Integrity.

### Identity and Access Management (IAM)

**Authentifizierung** (Authentication): Wer bist du? — Identität nachweisen
- **MFA (Multi-Faktor-Authentifizierung):** Mindestens zwei Faktoren aus unterschiedlichen Kategorien (Wissen + Besitz + Biometrie)
- **SSO (Single Sign-On):** Einmal anmelden, auf mehrere Ressourcen zugreifen — über SAML, OAuth/OIDC
- **RADIUS:** Remote Authentication Dial-In User Service — zentrales Authentifizierungsprotokoll für Netzwerkzugriff (UDP 1812/1813)
- **LDAP:** Verzeichnisdienst-Protokoll (TCP 389, LDAPS TCP 636) — Benutzerverwaltung
- **TACACS+:** Cisco-proprietäres Protokoll für Device-Administration (Netzwerkgeräte-Management)

> **Cross-Reference CCNA:** RADIUS und AAA-Framework hast du in CCNA im Kontext der Cisco-Device-Authentifizierung kennengelernt. In N10-009 ist es vendor-neutral: RADIUS für Netzwerkzugriff, TACACS+ als Cisco-Alternative.

**Autorisierung** (Authorization): Was darfst du?
- **Least Privilege:** Nur die minimal notwendigen Rechte vergeben
- **Regelbasierte Zugriffskontrolle:** Zugriff basiert auf Regeln (z.B. ACLs, Firewalls)

> **Cross-Reference AZ-900:** Konzept \`azure-rbac\` — dort implementiert Microsoft das Autorisierungsprinzip als rollenbasierte Zugriffskontrolle in der Cloud. N+ behandelt die zugrunde liegenden IAM-Konzepte, AZ-900 die Azure-spezifische Umsetzung. Das Least-Privilege-Prinzip gilt überall — cloud-agnostisch.

### Firewall-Typen: Vendor-neutrale Klassifikation

**Stateless Firewall (Paketfilter):**
- Prüft jedes Paket einzeln anhand von Regeln (Quell-IP, Ziel-IP, Port, Protokoll)
- Kein Zustandsgedächtnis — weiß nicht, ob ein Paket zu einer laufenden Verbindung gehört
- Schnell, aber begrenzt wirksam gegen moderne Angriffe

**Stateful Firewall:**
- Verfolgt den Verbindungszustand (Connection Tracking Table)
- Erkennt, ob eingehende Pakete zu einer legitimen ausgehenden Verbindung gehören
- Standard in modernen Firewalls — blockiert unsolicited eingehende Pakete automatisch

**NGFW (Next-Generation Firewall):**
- Vendor-neutral: Alle großen Anbieter haben NGFW-Produkte (Palo Alto, Fortinet, Check Point, Cisco — alle implementieren den Standard)
- Zusätzlich zu Stateful: Deep Packet Inspection (DPI), Application Awareness, IDS/IPS-Integration, User-Identity-Bindung
- **Cisco ASA** wäre eine konkrete Cisco-Implementierung — für N10-009 nicht nennen

**WAF (Web Application Firewall):**
- Speziell für HTTP/HTTPS-Traffic — schützt Webanwendungen
- Erkennt: SQL-Injection, XSS, OWASP-Top-10-Angriffe
- Layer-7-Inspektion — versteht HTTP-Protokoll semantisch

**Prüfungsfalle:** N10-009 fragt nach dem richtigen Firewall-Typ für ein Szenario. WAF → Webanwendungsschutz. NGFW → vollständige Netzwerkzugangskontrolle. Stateless → einfache Paketfilterung am Perimeter.

### Netzwerksegmentierung

**Warum segmentieren?**
- Kompromittierung eines Segments begrenzt den Schaden ("Blast Radius")
- Pflicht für: IoT-Geräte, BYOD, Gäste — je isolierter, desto sicherer

**Segmentierungsansätze:**
- **VLAN-Trennung:** Logische Trennung im Switching (Inter-VLAN-Traffic durch Firewall)
- **DMZ (Demilitarized Zone):** Zone zwischen Internet und internem Netz — für Server, die aus dem Internet erreichbar sein müssen (Web, Mail)
- **Sicherheitsüberwachtes Subnetz:** Screened Subnet — mit Firewall abgesichertes Segment

**Spezifische Segmentierungsfälle (N10-009 Objectives):**
- **IoT / IIoT:** Geräte oft schwach gesichert → dediziertes VLAN
- **SCADA/ICS:** Betriebstechnologie (OT) — strikt vom IT-Netz trennen, Kompromittierung kann physischen Schaden anrichten
- **BYOD:** Private Geräte → dediziertes, limitiertes Netz
- **Gast-WLAN:** Immer isoliert vom Produktionsnetz
`,
};

export const CONCEPT_NETWORK_ATTACKS_NP: Concept = {
  id: "netplus-network-attacks",
  title: "Netzwerkangriffe: Typen und Erkennung (N10-009 Domain 4.2)",
  appliesTo: ["comptia-network-plus"],
  tags: ["attacks", "ddos", "arp-poisoning", "phishing", "vlan-hopping", "n10-009"],
  relatedConceptIds: ["netplus-security-fundamentals"],
  content: `
## Netzwerkangriffe: N10-009 Erkennungs-Scope

**Wichtige Abgrenzung:** Network+ erwartet, dass du Angriffe **erkennen und benennen** kannst — die detaillierte Mitigation und Forensik ist CompTIA Security+-Territorium. Für N10-009 gilt: Verstehe, was der Angriff tut und welches CIA-Schutzziel er verletzt.

### Layer-2-Angriffe

**VLAN-Hopping:**
- Angreifer überwindet VLAN-Isolierung durch manipulierte 802.1Q-Tags oder Switch-Emulation
- Ziel: Zugriff auf Traffic in fremden VLANs
- Prävention: Native VLAN ändern, Switch-Emulation deaktivieren

**MAC-Flooding:**
- Überflutet die MAC-Adresstabelle eines Switches mit gefälschten Adressen
- Folge: Switch verhält sich wie ein Hub und broadcastet alle Frames → Abhören möglich
- Verletzt: **Confidentiality**

**ARP-Poisoning / ARP-Spoofing:**
- Angreifer sendet gefälschte ARP-Antworten → assoziiert seine MAC-Adresse mit der IP eines anderen Geräts
- Folge: Traffic wird zum Angreifer umgeleitet → Man-in-the-Middle
- Verletzt: **Integrity** + **Confidentiality**

### DNS-Angriffe

**DNS-Poisoning / DNS-Spoofing:**
- Gefälschte DNS-Antworten leiten Nutzer auf falsche IP-Adressen um
- Beispiel: DNS-Antwort für "bank.com" zeigt auf Phishing-Server
- Prävention: DNSSEC (signiert DNS-Antworten kryptografisch)
- Verletzt: **Integrity**

### Netzwerk-Infrastruktur-Angriffe

**DoS / DDoS (Denial of Service / Distributed):**
- **DoS:** Ein Angreifer überlastet ein Ziel mit Traffic oder Anfragen
- **DDoS:** Koordinierter Angriff aus vielen kompromittierten Systemen (Botnet)
- Verletzt: **Availability**

**Betrügerische Geräte (Rogue Devices):**
- **Rogue DHCP-Server:** Gibt falsche IP-Konfiguration an Clients → falscher Default-Gateway
- **Rogue Access Point / Evil Twin:** Gefälschter WLAN-Zugangspunkt — Clients verbinden sich und ihr Traffic wird abgehört

**On-Path-Angriff (Man-in-the-Middle):**
- Angreifer positioniert sich zwischen Kommunikationspartner
- Kann Traffic lesen und manipulieren
- Klassische Methoden: ARP-Spoofing, DNS-Spoofing, Rogue AP
- Verletzt: **Confidentiality** + **Integrity**

### Social Engineering

N10-009 listet diese explizit — wichtig: es geht um das **Erkennen**, nicht die psychologischen Details (Security+-Niveau):

- **Phishing:** E-Mails/Nachrichten, die Nutzer täuschen (Credentials eingeben, Malware herunterladen)
- **Dumpster Diving:** Vertrauliche Informationen aus weggeworfenen Dokumenten
- **Shoulder Surfing:** Über die Schulter schauen, um Credentials zu erhalten
- **Tailgating:** Unbefugter Zutritt durch "Mitgehen" durch gesicherte Türen

### Malware

Für N10-009: Arten kennen und CIA-Auswirkung zuordnen können.
- **Ransomware** → Availability + Confidentiality (verschlüsselt, erpresst)
- **Spyware** → Confidentiality
- **Rootkit** → Integrity (versteckt sich im System)
- **Botnet** → Verfügbarkeit (für DDoS genutzt)
`,
};

export const CONCEPT_SECURITY_SOLUTIONS_NP: Concept = {
  id: "netplus-security-solutions",
  title: "Sicherheitslösungen: NAC, ACLs, Port Security (N10-009 Domain 4.3)",
  appliesTo: ["comptia-network-plus"],
  tags: ["nac", "acl", "port-security", "802.1x", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["acl-extended", "port-security"],
  content: `
## Sicherheitslösungen: N10-009 Domain 4.3

### Network Access Control (NAC)

NAC kontrolliert, welche Geräte Zugang zum Netzwerk erhalten.

**802.1X — Port-basierte Authentifizierung:**
- Standard (IEEE 802.1X) für Netzwerkzugangskontrolle auf Port-Ebene
- **Drei Rollen:**
  - **Supplicant:** Das Gerät, das Zugang möchte (Laptop, Smartphone)
  - **Authenticator:** Der Switch oder AP, der den Zugang kontrolliert
  - **Authentication Server:** RADIUS-Server, der die Entscheidung trifft
- Gerät bekommt erst Netzwerkzugang nach erfolgreicher Authentifizierung

> **Cross-Reference CCNA:** In CCNA hast du 802.1X mit Cisco-Switches und ISE (Identity Services Engine) kennengelernt. N10-009: Das Protokoll und die drei Rollen sind vendor-neutral.

**Port Security (auf Switches):**
- Beschränkt, welche MAC-Adressen an einem Switch-Port erlaubt sind
- Bei Verletzung: Port wird gesperrt (Error-Disabled)
- Schutz gegen MAC-Flooding und unberechtigte Geräteanschlüsse

**MAC-Filter:** Erlaubt oder blockiert Geräte basierend auf MAC-Adresse — in WLAN und Switching genutzt. Begrenzte Sicherheit (MAC-Adressen können gefälscht werden).

### Access Control Lists (ACLs)

ACLs sind regelbasierte Filter, die Traffic erlauben oder verweigern.

> **Cross-Reference CCNA:** Konzept \`acls\` — dort auf Cisco-IOS mit \`access-list\`-Befehlen, Standard- und Extended-ACLs. In N10-009 sind ACLs das vendor-neutrale Konzept — jede Firewall, jeder Router implementiert sie anders.

**Vendor-neutrale ACL-Prinzipien (N10-009):**
- Regelbasierte Prüfung: Quell-IP, Ziel-IP, Port, Protokoll
- Erste passende Regel gewinnt (Implicit Deny am Ende)
- Einsatz: Firewalls, Router, Cloud-Security-Groups

> **Abgrenzung AZ-900:** Konzept \`azure-rbac\` — Azure-RBAC kontrolliert, welche Aktionen ein Nutzer auf Azure-Ressourcen ausführen darf (Berechtigungen). ACLs kontrollieren Netzwerktraffic (Pakete). Beides ist Zugriffskontrolle, aber auf unterschiedlichen Ebenen: RBAC = Management-Plane, ACLs = Data-Plane.

### Sicherheitszonen

**Trusted vs. Untrusted Zones:**
- Intern (trusted): Unternehmensnetz
- Extern (untrusted): Internet
- DMZ: Zwischen beiden — für Server, die aus dem Internet erreichbar sind

**URL-Filterung / Inhaltsfilterung:**
- Blockiert Zugriff auf bestimmte Webseiten oder Inhaltskategorien (Malware-Sites, unerwünschte Inhalte)
- Realisiert durch Proxy oder NGFW-Funktionen

### Geofencing

Geo-basierte Zugangskontrolle: Blockiert oder erlaubt Netzwerkzugriff basierend auf geografischem Standort (IP-Geolokalisierung oder physische Standortdaten). Einsatz: Regulatorische Compliance, Zugangsbeschränkungen für bestimmte Länder.

### Physische Sicherheit

N10-009 inkludiert explizit physische Sicherheit als Teil des Netzwerksicherheits-Scope:
- **Kameraüberwachung:** Erkennung physischer Einbrüche
- **Schlösser:** Schutz von Serverräumen, Patching-Feldern, IDF/MDF
- **Täuschungstechnologien:** Honeypot (einzelnes System) und Honeynet (Netzwerk aus Honeypots) — locken Angreifer an, um sie zu beobachten und ihr Verhalten zu analysieren
`,
};

// ── Quiz ──────────────────────────────────────────────────────

const QUIZ_QUESTIONS_T3: Question[] = [
  {
    id: "np-security-q1",
    type: "single-choice",
    text: "Ein Angreifer sendet massenweise gefälschte ARP-Antworten ins Netzwerk und assoziiert seine MAC-Adresse mit der IP des Default-Gateways. Welches CIA-Schutzziel ist primär verletzt?",
    points: 10,
    answers: [
      { id: "a", text: "Availability — das Gateway ist nicht mehr erreichbar", isCorrect: false },
      { id: "b", text: "Confidentiality und Integrity — Traffic wird umgeleitet und kann gelesen/manipuliert werden", isCorrect: true },
      { id: "c", text: "Nur Integrity — die MAC-Tabelle wird korrumpiert", isCorrect: false },
      { id: "d", text: "Availability und Confidentiality — Flooding blockiert das Netzwerk", isCorrect: false },
    ],
    explanation:
      "ARP-Poisoning/-Spoofing ist ein On-Path-(Man-in-the-Middle-)Angriff: Traffic wird zum Angreifer umgeleitet. Der Angreifer kann ihn lesen (Confidentiality) und manipulieren (Integrity). Das Gateway bleibt aus Nutzersicht erreichbar — Availability ist primär nicht betroffen. Antwort D beschreibt eher MAC-Flooding, nicht ARP-Spoofing.",
  },
  {
    id: "np-security-q2",
    type: "single-choice",
    // PBQ-artig: In der echten Prüfung häufig als Szenario mit Netzwerktopologie
    text: "Sicherheitsadministrator Max muss sicherstellen, dass nur authentifizierte Geräte Zugang zum Unternehmensnetz erhalten. Welcher Standard implementiert port-basierte Netzwerkzugangskontrolle?",
    points: 10,
    answers: [
      { id: "a", text: "IEEE 802.1Q", isCorrect: false },
      { id: "b", text: "IEEE 802.11ax", isCorrect: false },
      { id: "c", text: "IEEE 802.1X", isCorrect: true },
      { id: "d", text: "IEEE 802.3ad", isCorrect: false },
    ],
    explanation:
      "IEEE 802.1X ist der Standard für port-basierte Netzwerkzugangskontrolle (NAC). Es definiert die drei Rollen: Supplicant (Gerät), Authenticator (Switch/AP) und Authentication Server (RADIUS). 802.1Q ist VLAN-Tagging, 802.11ax ist Wi-Fi 6, 802.3ad ist Link Aggregation (LACP).",
  },
  {
    id: "np-security-q3",
    type: "multiple-choice",
    text: "Welche ZWEI Angriffstypen zielen primär auf das CIA-Schutzziel 'Availability'? (Wähle 2)",
    points: 10,
    answers: [
      { id: "a", text: "DDoS-Angriff (Distributed Denial of Service)", isCorrect: true },
      { id: "b", text: "ARP-Poisoning", isCorrect: false },
      { id: "c", text: "Ransomware (die Systeme verschlüsselt und unzugänglich macht)", isCorrect: true },
      { id: "d", text: "DNS-Spoofing", isCorrect: false },
    ],
    explanation:
      "DDoS überlastet Systeme und macht sie für legitime Nutzer unerreichbar → Availability. Ransomware verschlüsselt Daten/Systeme → ebenfalls primär Availability (Systeme nicht nutzbar), sekundär Confidentiality (Daten exfiltriert). ARP-Poisoning und DNS-Spoofing betreffen primär Confidentiality/Integrity durch Traffic-Umleitung.",
  },
  {
    id: "np-security-q4",
    type: "single-choice",
    text: "Welcher Firewall-Typ ist auf HTTP/HTTPS-Traffic spezialisiert und schützt vor SQL-Injection und XSS-Angriffen?",
    points: 10,
    answers: [
      { id: "a", text: "Stateless Firewall (Paketfilter)", isCorrect: false },
      { id: "b", text: "Stateful Firewall", isCorrect: false },
      { id: "c", text: "NGFW (Next-Generation Firewall)", isCorrect: false },
      { id: "d", text: "WAF (Web Application Firewall)", isCorrect: true },
    ],
    explanation:
      "Eine WAF (Web Application Firewall) ist auf Layer 7 spezialisiert und versteht HTTP/HTTPS semantisch. Sie erkennt webspezifische Angriffe wie SQL-Injection, XSS und OWASP-Top-10-Schwachstellen. Eine NGFW hat DPI und Application Awareness, ist aber kein Spezialist für Webanwendungen. Stateless und Stateful Firewalls arbeiten auf Layer 3-4 ohne HTTP-Verständnis.",
  },
  {
    id: "np-security-q5",
    type: "single-choice",
    text: "Was ist VLAN-Hopping und welches Sicherheitsziel verletzt es primär?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Ein Angreifer überflutet Switch-Ports — verletzt Availability",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Ein Angreifer umgeht VLAN-Isolation durch manipulierte 802.1Q-Tags — verletzt Confidentiality",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Ein Angreifer manipuliert Routing-Tabellen — verletzt Integrity",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Ein Angreifer blockiert DHCP-Antworten — verletzt Availability",
        isCorrect: false,
      },
    ],
    explanation:
      "VLAN-Hopping überwindet die logische VLAN-Trennung: Ein Angreifer schickt Frames mit manipulierten 802.1Q-Tags oder emuliert Switch-Verhalten (Double-Tagging), um Traffic aus einem anderen VLAN abzuhören. Das verletzt primär die Vertraulichkeit (Confidentiality) — die VLAN-Isolation als Sicherheitsmaßnahme versagt.",
  },
  {
    id: "np-security-q6",
    type: "single-choice",
    text: "Was unterscheidet einen Honeypot von einem Honeynet?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Ein Honeypot ist für WLAN, ein Honeynet für kabelgebundene Netzwerke",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Ein Honeypot ist ein einzelnes Täuschungssystem, ein Honeynet ist ein Netzwerk aus mehreren Honeypots",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Honeynets sind produktive Systeme, Honeypots sind Attrappen",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Honeynet ist der veraltete Begriff, Honeypot der aktuelle",
        isCorrect: false,
      },
    ],
    explanation:
      "Ein Honeypot ist ein einzelnes täuschendes System, das Angreifer anlockt und ihr Verhalten aufzeichnet. Ein Honeynet ist ein ganzes Netzwerk aus Honeypots — simuliert eine komplexe Infrastruktur und ermöglicht detailliertere Angreiferbeobachtung. Beide sind Täuschungstechnologien ohne produktiven Wert — der Zugriff auf sie ist per Definition verdächtig.",
  },
  {
    id: "np-security-q7",
    type: "single-choice",
    text: "Worin besteht der konzeptuelle Unterschied zwischen einer ACL (Access Control List) und Azure RBAC aus N10-009- und AZ-900-Perspektive?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "ACLs und RBAC sind technisch identisch — nur verschiedene Namen",
        isCorrect: false,
      },
      {
        id: "b",
        text: "ACLs filtern Netzwerktraffic (Data Plane), RBAC kontrolliert Benutzerberechtigungen auf Ressourcen (Management Plane)",
        isCorrect: true,
      },
      {
        id: "c",
        text: "RBAC ist moderner und hat ACLs vollständig ersetzt",
        isCorrect: false,
      },
      {
        id: "d",
        text: "ACLs gelten für Cloud-Umgebungen, RBAC für On-Premise",
        isCorrect: false,
      },
    ],
    explanation:
      "ACLs (Network+/CCNA-Kontext) filtern IP-Traffic: Welche Pakete dürfen passieren? — Data Plane, Layer 3-4. Azure RBAC (AZ-900) kontrolliert, welche Azure-API-Aktionen ein Benutzer ausführen darf — Management Plane, Berechtigungsmodell. Beide sind Zugangskontrolle, aber auf fundamental unterschiedlichen Ebenen: Netzwerk-Paket vs. Cloud-API-Aktion.",
  },
];

export const QUIZ_NETPLUS_SECURITY: Quiz = {
  id: "netplus-quiz-security",
  title: "Network+ T3: Netzwerksicherheit & Angriffe",
  description:
    "CIA-Triade, IAM, Firewall-Typen (Stateless/Stateful/NGFW/WAF), Angriffserkennung und Sicherheitslösungen — N10-009 Domain 4.",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 630,
  questions: QUIZ_QUESTIONS_T3,
};

// ── Topic-Descriptor ──────────────────────────────────────────

export const TOPIC_NETPLUS_SECURITY: Topic = {
  id: "netplus-security",
  title: "Netzwerksicherheit & Angriffe",
  description:
    "CIA-Triade, Identity and Access Management, Firewall-Typen vendor-neutral (Stateless/Stateful/NGFW/WAF), Netzwerkangriffe erkennen (ARP-Poisoning, DDoS, VLAN-Hopping), 802.1X NAC, ACLs, Netzwerksegmentierung.",
  conceptIds: [
    "netplus-security-fundamentals",
    "netplus-network-attacks",
    "netplus-security-solutions",
  ],
  quizIds: ["netplus-quiz-security"],
  exerciseIds: [],
  prerequisiteTopicIds: ["netplus-network-concepts"],
  estimatedMinutes: 70,
  tags: ["security", "cia", "iam", "firewall", "attacks", "nac", "acl", "n10-009", "comptia"],
};

// ── Exports ───────────────────────────────────────────────────

export const SECURITY_NP_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_SECURITY_FUNDAMENTALS_NP.id]: CONCEPT_SECURITY_FUNDAMENTALS_NP,
  [CONCEPT_NETWORK_ATTACKS_NP.id]: CONCEPT_NETWORK_ATTACKS_NP,
  [CONCEPT_SECURITY_SOLUTIONS_NP.id]: CONCEPT_SECURITY_SOLUTIONS_NP,
};

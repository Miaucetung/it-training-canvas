// ============================================================
// CompTIA Network+ N10-009 — Topic 4: Netzwerkbetrieb & Monitoring
// Domains: 3.1 (Dokumentation/Prozesse), 3.2 (Monitoring), 3.3 (DR), 3.4 (Netzwerkdienste), 3.5 (Netzwerkzugang)
// Sources:
//   CompTIA Network+ N10-009 Exam Objectives Version 4.0 (lokal, Projektordner)
//   RFC 3164 / RFC 5424 (Syslog), RFC 1157 / RFC 3411 (SNMP), RFC 5101 (IPFIX) — rfc-editor.org
//   Wikipedia — DNS-Eintragstypen, NTP-Grundlagen (unstrittige technische Grundlage)
// Cross-References (trilateraler Knoten):
//   → CCNA: syslog-snmp (Cisco-spezifisches Logging/Monitoring — IOS-Kontext)
//   → AZ-900: azure-monitor (Cloud-natives Monitoring — Azure-Kontext)
//   → N10-009: vendor-neutrale Brücke zwischen beiden
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_MONITORING_NP: Concept = {
  id: "netplus-monitoring",
  title: "Netzwerk-Monitoring: SNMP, Syslog, Flow-Daten — Vendor-neutrale Brücke",
  appliesTo: ["comptia-network-plus"],
  tags: ["snmp", "syslog", "monitoring", "ipfix", "netflow", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["azure-monitor"],
  content: `
## Netzwerk-Monitoring: Der trilaterale Wissensknoten

Dies ist der zentrale Cross-Reference-Punkt dieses Stubs — derselbe Überwachungsbedarf, drei Lernpfade:

> **CCNA** zeigt dir Cisco-spezifisches Logging: \`logging buffered\`, \`debug\`, Syslog-Konfiguration auf IOS-Geräten, SNMP-Community-Strings auf Cisco-Switches.
>
> **AZ-900** zeigt dir Cloud-natives Monitoring: Azure Monitor, Log Analytics Workspace, Metriken und Alerts auf Azure-Ressourcen.
>
> **Network+ (hier)** verbindet beide: Die vendor-neutrale Sicht auf Netzwerküberwachung — was SNMP, Syslog und Flow-Daten konzeptionell leisten, unabhängig von Hersteller oder Cloud-Plattform.

Das Monitoring-Bedürfnis ist universell. Die Implementierung ist herstellerspezifisch. Network+ liefert das konzeptionelle Fundament.

### SNMP — Simple Network Management Protocol

SNMP ist das Standard-Protokoll für Netzwerk-Management und -Überwachung (Domain 3.2 der Objectives).

**SNMP-Komponenten:**
- **Manager (NMS):** Zentrale Monitoring-Station — stellt Anfragen, empfängt Traps
- **Agent:** Software auf dem überwachten Gerät (Router, Switch, Server)
- **MIB (Management Information Base):** Datenbank, die beschreibt, welche Variablen das Gerät exponiert (z.B. Interface-Counters, CPU-Last)

**SNMP-Versionen — Prüfungsklassiker:**

| Version | Sicherheit | Authentifizierung | Besonderheit |
|---|---|---|---|
| **v1** | Keine | Community-String (Klartext) | Veraltert — kein Einsatz empfohlen |
| **v2c** | Minimal | Community-String (Klartext) | Verbesserte Performance, aber noch unsicheres Auth |
| **v3** | Stark | Username + Authentifizierungs-Hash + Verschlüsselung | **Empfohlene Version** — Auth + Encryption |

**Community-Strings (v1/v2c):**
- Quasi-Passwort für SNMP-Zugriff
- Standard-Strings wie "public" (read-only) und "private" (read-write) müssen geändert werden — Sicherheits-Grundregel

**SNMP-Traps:**
- Proaktive Benachrichtigungen vom Agenten an den Manager (UDP Port 162)
- Normales SNMP-Polling: Manager fragt Agenten (UDP Port 161)
- Trap: Agent meldet sich unaufgefordert bei kritischen Ereignissen

> **Cross-Reference CCNA:** In CCNA hast du SNMP auf Cisco-Geräten konfiguriert (\`snmp-server community\`, \`snmp-server host\`). Vendor-neutral: Das Protokoll und die drei Versionen gelten für alle SNMP-fähigen Geräte. v3 ist überall der Standard.

> **Cross-Reference AZ-900:** Azure Monitor (Konzept \`azure-monitor\`) sammelt Metriken und Logs von Azure-Ressourcen — konzeptionell analog zu einem SNMP-Manager, der Daten von Agenten sammelt. Die Abstraktion ist dieselbe: zentrale Sammlung + Alerting. Die Implementierung ist cloud-nativ statt SNMP-basiert.

### Syslog — Standardisiertes Logging

Syslog ist das Standard-Protokoll zur Übertragung von Log-Meldungen (RFC 5424, ursprünglich RFC 3164).

**Syslog-Prinzip:**
- Geräte senden Log-Meldungen an einen zentralen **Syslog-Collector** (UDP Port 514, oder TCP/TLS für verschlüsselt)
- Zentralisierung ermöglicht: Korrelation, Langzeitspeicherung, Alarmierung

**Syslog-Severity-Levels (0–7, niedrig = kritisch):**

| Level | Name | Bedeutung |
|---|---|---|
| 0 | Emergency | System nicht mehr nutzbar |
| 1 | Alert | Sofortiges Handeln erforderlich |
| 2 | Critical | Kritischer Fehler |
| 3 | Error | Fehlerzustand |
| 4 | Warning | Warnung — Fehler möglich |
| 5 | Notice | Normal, aber beachtenswert |
| 6 | Informational | Informationsmeldungen |
| 7 | Debug | Debugging-Details |

**SIEM — Security Information and Event Management:**
- Sammelt und korreliert Logs aus vielen Quellen (Firewalls, Switches, Server, SNMP-Traps, Syslog)
- Erkennt Muster über mehrere Quellen hinweg (z.B. mehrere fehlgeschlagene Logins + ungewöhnlicher Traffic)
- Vendor-neutral: Splunk, IBM QRadar, Microsoft Sentinel sind Implementierungen

### Flow-Daten: IPFIX als Standard, NetFlow als Cisco-Implementierung

Flow-Daten erfassen Netzwerkverkehr auf Verbindungsebene — wer hat mit wem, wann, wie viel kommuniziert. Kein Paket-Inhalt (das wäre Paketerfassung), sondern Metadaten.

**Vendor-Neutralität — wichtig:**
- **NetFlow** ist eine Cisco-Erfindung (proprietär) — in CCNA kennengelernt
- **IPFIX** (IP Flow Information Export, RFC 5101) ist der IETF-Standard, der auf NetFlow-v9 basiert — **der vendor-neutrale Standard**
- **sFlow** (Sampled Flow): Anderer Ansatz — nimmt Stichproben von Paketen, exportiert sie. Kein Standard wie IPFIX, aber weit verbreitet bei non-Cisco-Geräten

**Für N10-009:** Sprich von "Flow-Daten" und "IPFIX" als Konzept. NetFlow ist die Cisco-Implementierung — genauso wie EtherChannel Cisco-proprietär ist und LACP der Standard.

### API-Integration im Monitoring

Moderne Monitoring-Lösungen nutzen APIs für:
- Automatisierte Konfigurationsabfragen
- Echtzeit-Datenintegration
- Automatische Reaktion auf Alerts (z.B. VLAN-Port sperren bei erkanntem Angriff)

### Portspiegelung (Port Mirroring / SPAN)

Kopiert Traffic von einem oder mehreren Ports auf einen dedizierten Analyse-Port.
- **SPAN (Switched Port Analyzer):** Cisco-Begriff, Konzept vendor-neutral: "Port Mirroring"
- Ermöglicht Paketerfassung (Wireshark, tcpdump) ohne den Produktionstraffic zu unterbrechen
`,
};

export const CONCEPT_NETWORK_SERVICES_NP: Concept = {
  id: "netplus-network-services",
  title: "Netzwerkdienste: DHCP, DNS, NTP — Betriebsgrundlagen (N10-009 Domain 3.4)",
  appliesTo: ["comptia-network-plus"],
  tags: ["dhcp", "dns", "ntp", "dnssec", "doh", "n10-009"],
  relatedConceptIds: ["netplus-monitoring"],
  content: `
## Netzwerkdienste: DHCP, DNS und Zeitprotokolle

### DHCP — Dynamic Host Configuration Protocol

**DHCP-Prozess (DORA):**
1. **Discover:** Client broadcastet — "Ich brauche eine IP-Adresse"
2. **Offer:** DHCP-Server antwortet mit einem Angebot
3. **Request:** Client wählt ein Angebot und fordert es an
4. **Acknowledge:** Server bestätigt die Zuweisung

**DHCP-Konfigurationselemente (N10-009 Objectives):**
- **Scope/Bereich:** IP-Adresspool, aus dem Adressen vergeben werden
- **Reservierungen:** Feste IP für bekannte MAC-Adresse (Drucker, Server)
- **Lease-Time:** Wie lange ist die IP-Zuweisung gültig — kurz für öffentliche Netzwerke, länger für stabile Büros
- **Exklusionen:** IP-Adressen im Scope, die NICHT vergeben werden (für statisch konfigurierte Geräte)
- **DHCP-Optionen:** Neben der IP auch: Default-Gateway (Option 3), DNS-Server (Option 6), Domain-Name (Option 15)
- **DHCP-Relay / IP Helper:** Leitet DHCP-Broadcasts über Router-Grenzen weiter — ohne Relay-Agent braucht jedes Subnetz einen eigenen DHCP-Server

**SLAAC (Stateless Address Autoconfiguration):**
- IPv6-Mechanismus: Geräte konfigurieren sich selbst ohne DHCP-Server
- Nutzt Router-Advertisements mit Netzwerkpräfix + selbst generierter Interface-ID

### DNS — Domain Name System

DNS übersetzt Hostnamen in IP-Adressen und umgekehrt.

**DNS-Eintragstypen (N10-009 Pflicht):**

| Typ | Funktion | Beispiel |
|---|---|---|
| **A** | Hostname → IPv4-Adresse | server.example.com → 192.168.1.10 |
| **AAAA** | Hostname → IPv6-Adresse | server.example.com → 2001:db8::1 |
| **CNAME** | Alias → kanonischer Name | www → server.example.com |
| **MX** | Mail-Eingang → Mailserver | example.com → mail.example.com |
| **TXT** | Freier Text | SPF, DKIM, Domain-Verification |
| **NS** | Zuständiger Nameserver | example.com → ns1.example.com |
| **PTR** | IP-Adresse → Hostname (Reverse DNS) | 10.1.168.192.in-addr.arpa → server |

**DNS-Zonen:**
- **Forward Lookup:** Name → IP
- **Reverse Lookup:** IP → Name (PTR-Records)
- **Autoritativ vs. nicht-autoritativ:** Autoritativer Server hat die echten Zonendaten. Caching-Server hat gecachte Antworten (nicht-autoritativ).

**DNS-Sicherheit:**
- **DNSSEC:** Signiert DNS-Antworten digital — schützt vor DNS-Poisoning (Antworten werden auf Integrität geprüft)
- **DNS over HTTPS (DoH):** DNS-Anfragen verschlüsselt über HTTPS → schützt vor Abhören und Manipulation auf dem Transportweg
- **DNS over TLS (DoT):** Gleiches Ziel wie DoH, aber über TLS direkt auf Port 853

### Zeitprotokolle

**NTP (Network Time Protocol):**
- Synchronisiert Uhren im Netzwerk (UDP Port 123)
- Hierarchisches System: Stratum 0 (Atomuhr/GPS) → Stratum 1 (NTP-Server) → Stratum 2 (Clients)
- Kritisch für: Logging-Korrelation (Timestamps müssen übereinstimmen), Authentifizierungsprotokolle (Kerberos), TLS-Zertifikate

**PTP (Precision Time Protocol, IEEE 1588):**
- Höhere Präzision als NTP — für industrielle Steuerungen, Finanzhandel (Mikrosekunden-Genauigkeit)

**NTS (Network Time Security):**
- Kryptografische Authentifizierung für NTP — schützt vor NTP-Manipulation

### VPN-Typen (Domain 3.5)

**Site-to-Site-VPN:**
- Verbindet zwei Standorte permanent (z.B. Büro ↔ Rechenzentrum)
- Transparentes Tunneling — Endgeräte bemerken das VPN nicht

**Client-to-Site-VPN:**
- Einzelne Nutzer verbinden sich ins Unternehmensnetz (Remote Work)
- **Full Tunnel:** Gesamter Traffic des Clients läuft durch das VPN
- **Split Tunnel:** Nur unternehmensrelevanter Traffic durch VPN, Rest direkt ins Internet
`,
};

export const CONCEPT_DR_OPERATIONS_NP: Concept = {
  id: "netplus-dr-operations",
  title: "Disaster Recovery, Dokumentation & Change Management (N10-009 Domains 3.1/3.3)",
  appliesTo: ["comptia-network-plus"],
  tags: ["disaster-recovery", "rpo", "rto", "documentation", "change-management", "n10-009"],
  relatedConceptIds: ["netplus-monitoring", "netplus-network-services"],
  content: `
## Netzwerkbetrieb: DR, Dokumentation und Change Management

### Disaster Recovery — Metriken

**Recovery Time Objective (RTO):**
- Maximale akzeptable Ausfallzeit — "Wie lange darf das System down sein?"
- Niedrigerer RTO = teurere Lösung (Hot Site, aktive Replikation)

**Recovery Point Objective (RPO):**
- Maximaler akzeptabler Datenverlust — "Wie alt darf das letzte Backup sein?"
- RPO = 1 Stunde → Backup mindestens stündlich

**MTTR (Mean Time to Repair):** Durchschnittliche Reparaturzeit nach einem Ausfall  
**MTBF (Mean Time between Failure):** Durchschnittliche Zeit zwischen Ausfällen — Zuverlässigkeitsmaß

**DR-Site-Typen:**

| Typ | Beschreibung | RTO | Kosten |
|---|---|---|---|
| **Cold Site** | Leer — Hardware muss erst beschafft/konfiguriert werden | Tage–Wochen | Niedrig |
| **Warm Site** | Hardware vorhanden, Software konfiguriert, aber keine aktuellen Daten | Stunden–Tage | Mittel |
| **Hot Site** | Vollständig operativ, aktueller Datenstand | Minuten | Hoch |

**Hochverfügbarkeit:**
- **Aktiv-Aktiv:** Beide Systeme leiten Traffic aktiv weiter — bei Ausfall übernimmt das andere sofort
- **Aktiv-Passiv:** Ein System aktiv, das andere wartet als Standby (höheres RTO als Aktiv-Aktiv)

### Netzwerkdokumentation (Domain 3.1)

**Physische vs. logische Diagramme:**
- **Physisch:** Zeigt tatsächliche Geräte, Kabel, Rack-Positionen
- **Logisch (Layer 2):** VLANs, Trunk-Verbindungen, Spanning-Tree-Topologie
- **Logisch (Layer 3):** IP-Subnetzierung, Routing-Protokolle, Routing-Pfade

**IPAM (IP Address Management):**
- Dokumentiert alle IP-Zuweisungen im Netzwerk
- Verhindert IP-Konflikte, unterstützt Kapazitätsplanung

**Lebenszyklusmanagement:**
- **EOL (End of Life):** Produkt wird nicht mehr verkauft
- **EOS (End of Support):** Keine Updates, Patches oder Support mehr — Sicherheitsrisiko

### Change Management

Jede Änderung an produktiven Netzwerken folgt einem Prozess:
- **Anfrage (Service Request):** Dokumentierte Änderungsanfrage
- **Genehmigung:** Review-Prozess vor Umsetzung
- **Konfigurationsmanagement:** Produktionskonfiguration vs. Baseline (goldene Konfiguration als Referenz)

**Warum Konfigurationsmanagement?**
- Reproduzierbarkeit: Geräte können nach Ausfall identisch wiederhergestellt werden
- Compliance: Nachweis, dass Geräte konfigurationskonform sind
- Debugging: Vergleich "aktuell" vs. "golden config" zeigt ungewollte Änderungen
`,
};

export const CONCEPT_NETWORK_ACCESS_NP: Concept = {
  id: "netplus-network-access",
  title: "Netzwerkzugang und Remote Connectivity (N10-009 Domain 3.5)",
  appliesTo: ["comptia-network-plus"],
  tags: ["vpn", "remote-access", "802.1x", "aaa", "split-tunnel", "full-tunnel", "n10-009"],
  relatedConceptIds: ["netplus-security-solutions", "netplus-network-services"],
  content: `
## Netzwerkzugang: N10-009 Domain 3.5

Domain 3.5 behandelt den sicheren Zugang zu Netzwerkressourcen fuer Standorte, mobile Nutzer und externe Partner.

### VPN-Betriebsmodelle

| VPN-Typ | Zweck | Typisches Szenario |
|---|---|---|
| **Site-to-Site VPN** | Verbindet ganze Netzwerke transparent | Filiale mit Zentrale verbinden |
| **Client-to-Site VPN** | Einzelne Clients verbinden sich ins Unternehmensnetz | Homeoffice, Admin-Zugriff unterwegs |

**Full Tunnel vs. Split Tunnel:**
- **Full Tunnel:** Gesamter Client-Traffic geht durch das Unternehmens-VPN
  - Vorteil: Zentrale Sicherheitskontrolle (Web-Filter, IDS/IPS, Logging)
  - Nachteil: Hoehere Last auf VPN-Gateway, moeglichweise mehr Latenz
- **Split Tunnel:** Nur Zielnetze der Firma gehen durch das VPN, Rest direkt ins Internet
  - Vorteil: Entlastet VPN-Konzentrator
  - Nachteil: Erhoehtes Risiko durch parallele Unternehmens- und Internetpfade

### Authentifizierung und Autorisierung

**AAA-Prinzip (Authentication, Authorization, Accounting):**
- **Authentication:** Wer bist du?
- **Authorization:** Was darfst du?
- **Accounting:** Was hast du getan?

In Enterprise-Umgebungen wird AAA typischerweise ueber RADIUS oder TACACS+ umgesetzt.

### Network Access Control (NAC)

- **802.1X:** Port-basierte Zugriffskontrolle an Switch/AP
- Endpoint muss sich authentifizieren, bevor Datenverkehr erlaubt wird
- Kann mit Posture Checks kombiniert werden (z.B. aktueller Patch-Stand, EDR aktiv)

### Zero Trust Network Access (ZTNA)

ZTNA gewaehrt Zugriff auf einzelne Anwendungen statt pauschalen Netzwerkkorridor.
- Kontextbasiert (Identitaet, Geraetestatus, Standort)
- Grundprinzip: minimale, dynamische Berechtigung
- In hybriden Umgebungen oft Ergaenzung oder Ersatz klassischer Remote-VPN-Architektur

### Betriebsrelevante Praxispunkte

- Zugriffspfade dokumentieren (welcher Nutzer/Standort darf auf welche Ressourcen)
- Regelmaessige Rezertifizierung von Berechtigungen
- Monitoring von VPN-Auslastung, Session-Fehlern und Anmeldeanomalien
- Klare Entscheidung Full vs. Split Tunnel nach Risiko- und Kapazitaetsprofil
`,
};

// ── Quiz ──────────────────────────────────────────────────────

const QUIZ_QUESTIONS_T4: Question[] = [
  {
    id: "np-ops-q1",
    type: "single-choice",
    // SNMP-Versions-Prüfungsklassiker
    text: "Welche SNMP-Version bietet Authentifizierung und Verschlüsselung und ist die aktuell empfohlene Version?",
    points: 10,
    answers: [
      { id: "a", text: "SNMPv1 — mit Community-String-Authentifizierung", isCorrect: false },
      { id: "b", text: "SNMPv2c — mit verbesserter Performance", isCorrect: false },
      { id: "c", text: "SNMPv3 — mit Username-basierter Auth und Verschlüsselung", isCorrect: true },
      { id: "d", text: "SNMPv4 — der neueste Standard", isCorrect: false },
    ],
    explanation:
      "SNMPv3 ist die einzige SNMP-Version mit echtem Sicherheitsmodell: Username-basierte Authentifizierung (MD5 oder SHA), optionale Verschlüsselung (AES/DES) und Zugriffskontrolle. SNMPv1 und v2c nutzen Community-Strings im Klartext — ein gravierendes Sicherheitsrisiko. SNMPv4 existiert nicht. SNMP-Versionen sind ein Network+-Prüfungsklassiker.",
  },
  {
    id: "np-ops-q2",
    type: "single-choice",
    text: "Ein Unternehmen nutzt eine Monitoring-Lösung, die Flow-Metadaten erfasst (wer kommuniziert mit wem, wie viel Traffic, welche Ports). Das Gerät unterstützt den IETF-Standard für Flow-Export. Welches Protokoll wird genutzt?",
    points: 10,
    answers: [
      { id: "a", text: "NetFlow — der Cisco-Standard für Flow-Daten", isCorrect: false },
      { id: "b", text: "IPFIX — IP Flow Information Export (RFC 5101)", isCorrect: true },
      { id: "c", text: "SNMP-Traps für Traffic-Meldungen", isCorrect: false },
      { id: "d", text: "sFlow — der IEEE-Standard für Flow-Daten", isCorrect: false },
    ],
    explanation:
      "IPFIX (IP Flow Information Export, RFC 5101) ist der IETF-Standard für Flow-Daten-Export — vendor-neutral. NetFlow ist Cisco-proprietär (der Vorläufer, auf dem IPFIX basiert). sFlow ist weit verbreitet bei non-Cisco-Herstellern, aber kein IETF-Standard wie IPFIX. Die Frage fragt nach 'IETF-Standard' — das ist IPFIX.",
  },
  {
    id: "np-ops-q3",
    type: "single-choice",
    text: "Welcher Syslog-Severity-Level (0–7) hat die höchste Kritikalität?",
    points: 10,
    answers: [
      { id: "a", text: "Level 7 — Debug", isCorrect: false },
      { id: "b", text: "Level 4 — Warning", isCorrect: false },
      { id: "c", text: "Level 0 — Emergency", isCorrect: true },
      { id: "d", text: "Level 1 — Alert", isCorrect: false },
    ],
    explanation:
      "Syslog-Severity-Level: 0 (Emergency) ist am kritischsten — 'System nicht mehr nutzbar'. Level 7 (Debug) ist am wenigsten kritisch. Merkhilfe: Niedrigere Zahl = höhere Kritikalität. In der Prüfung werden oft Level 0 (Emergency) und Level 7 (Debug) als Extreme abgefragt.",
  },
  {
    id: "np-ops-q4",
    type: "single-choice",
    text: "Was ist der Unterschied zwischen RPO und RTO im Kontext von Disaster Recovery?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "RPO misst die maximale Ausfallzeit, RTO misst den maximalen Datenverlust",
        isCorrect: false,
      },
      {
        id: "b",
        text: "RPO (Recovery Point Objective) ist der maximale akzeptable Datenverlust, RTO (Recovery Time Objective) ist die maximale akzeptable Ausfallzeit",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Beide messen Ausfallzeit — RPO für primäre, RTO für sekundäre Systeme",
        isCorrect: false,
      },
      {
        id: "d",
        text: "RPO gilt für Cloud-Umgebungen, RTO für on-premise",
        isCorrect: false,
      },
    ],
    explanation:
      "RPO (Recovery Point Objective): Wie alt darf das letzte Backup sein? — maximaler Datenverlust. RPO = 4h → Backups mindestens alle 4h. RTO (Recovery Time Objective): Wie lange darf das System ausfallen? — maximale Wiederherstellungszeit. Niedrigeres RTO erfordert teurere Lösungen (Hot Site, aktive Replikation).",
  },
  {
    id: "np-ops-q5",
    type: "single-choice",
    // PBQ-artig: Szenario mit DR-Site-Auswahl
    text: "Netzwerkingenieurin Sara muss eine DR-Site empfehlen. Das SLA erfordert maximale Wiederherstellungszeit von 30 Minuten. Welcher DR-Site-Typ erfüllt diese Anforderung?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Cold Site — Hardware muss erst beschafft werden",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Warm Site — Konfiguriert aber ohne aktuellen Datenstand",
        isCorrect: false,
      },
      {
        id: "c",
        text: "Hot Site — Vollständig operativ mit aktuellem Datenstand",
        isCorrect: true,
      },
      {
        id: "d",
        text: "Cold Site mit schnellem Wiederherstellungsplan",
        isCorrect: false,
      },
    ],
    explanation:
      "Nur eine Hot Site kann ein RTO von 30 Minuten erfüllen. Hot Sites sind vollständig betriebsbereit mit aktuellem Datenstand (aktive Replikation) — Umschaltzeit in Minuten. Warm Sites benötigen Stunden (Daten müssen eingespielt werden). Cold Sites benötigen Tage bis Wochen. Höhere Verfügbarkeit = höhere Kosten.",
  },
  {
    id: "np-ops-q6",
    type: "single-choice",
    text: "Was ist Port Mirroring (SPAN) und wofür wird es eingesetzt?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Port Mirroring dupliziert Switch-Ports für höhere Bandbreite",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Port Mirroring kopiert Traffic von einem Port auf einen Analyse-Port — ermöglicht Paketerfassung ohne Produktionsunterbrechung",
        isCorrect: true,
      },
      {
        id: "c",
        text: "SPAN ist ein Cisco-Standard und nicht vendor-neutral verfügbar",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Port Mirroring ist Teil des SNMP-Standards für Monitoring",
        isCorrect: false,
      },
    ],
    explanation:
      "Port Mirroring (vendor-neutral; Cisco nennt es SPAN — Switched Port Analyzer) kopiert Traffic von einem oder mehreren Quell-Ports auf einen dedizierten Analyse-Port. Ein Netzwerkanalysator (Wireshark, IDS) kann dort Traffic empfangen, ohne die Produktion zu beeinflussen. Das Konzept ist vendor-neutral — alle Hersteller implementieren Port Mirroring, die Namen variieren.",
  },
  {
    id: "np-ops-q7",
    type: "single-choice",
    text: "Welcher DNS-Eintragstyp wird für Reverse-DNS-Lookups genutzt (IP-Adresse → Hostname)?",
    points: 10,
    answers: [
      { id: "a", text: "A-Record", isCorrect: false },
      { id: "b", text: "CNAME-Record", isCorrect: false },
      { id: "c", text: "PTR-Record", isCorrect: true },
      { id: "d", text: "MX-Record", isCorrect: false },
    ],
    explanation:
      "PTR-Records (Pointer Records) werden für Reverse-DNS-Lookups genutzt: IP-Adresse → Hostname. Reverse-DNS wird u.a. für E-Mail-Spam-Prüfung, Logging (lesbare Hostnamen in Logs) und manche Authentifizierungsmechanismen verwendet. A-Record: Name→IPv4. AAAA: Name→IPv6. CNAME: Alias→Name. MX: Domain→Mailserver.",
  },
  {
    id: "np-ops-q8",
    type: "single-choice",
    text: "Welche Aussage zu Full Tunnel und Split Tunnel ist korrekt?",
    points: 10,
    answers: [
      { id: "a", text: "Split Tunnel leitet immer den gesamten Traffic durch das Unternehmens-VPN", isCorrect: false },
      { id: "b", text: "Full Tunnel reduziert grundsaetzlich die Last auf VPN-Gateways", isCorrect: false },
      { id: "c", text: "Full Tunnel erzwingt zentralisierte Sicherheitskontrollen fuer den gesamten Client-Traffic", isCorrect: true },
      { id: "d", text: "Es gibt zwischen beiden Modellen keine Sicherheitsunterschiede", isCorrect: false },
    ],
    explanation:
      "Beim Full Tunnel wird der komplette Traffic durch das Unternehmensnetz gefuehrt, wodurch zentrale Kontrolle moeglich ist. Split Tunnel schickt nur Unternehmensziele durch das VPN und entlastet Gateways, hat aber ein anderes Risikoprofil.",
  },
  {
    id: "np-ops-q9",
    type: "single-choice",
    text: "Welcher VPN-Typ verbindet typischerweise zwei komplette Standorte transparent miteinander?",
    points: 10,
    answers: [
      { id: "a", text: "Client-to-Site VPN", isCorrect: false },
      { id: "b", text: "Site-to-Site VPN", isCorrect: true },
      { id: "c", text: "Split-Tunnel VPN", isCorrect: false },
      { id: "d", text: "Port-Mirroring VPN", isCorrect: false },
    ],
    explanation:
      "Site-to-Site-VPN verbindet zwei Netzsegmente/Standorte auf Gateway-Ebene. Endgeraete arbeiten transparent, ohne einen separaten VPN-Client zu starten. Client-to-Site ist fuer einzelne Remote-Nutzer gedacht.",
  },
  {
    id: "np-ops-q10",
    type: "single-choice",
    text: "Welcher Standard wird fuer port-basierte Zugriffskontrolle in kabelgebundenen und drahtlosen Enterprise-Netzen verwendet?",
    points: 10,
    answers: [
      { id: "a", text: "IEEE 802.1X", isCorrect: true },
      { id: "b", text: "IEEE 802.3ad", isCorrect: false },
      { id: "c", text: "IEEE 802.11h", isCorrect: false },
      { id: "d", text: "RFC 1918", isCorrect: false },
    ],
    explanation:
      "802.1X ist der Standard fuer port-basierte Authentifizierung und Teil vieler NAC-Architekturen. 802.3ad bezieht sich auf Link Aggregation, 802.11h auf WLAN-Kanalregeln im 5-GHz-Band, RFC1918 auf private IPv4-Adressbereiche.",
  },
];

export const QUIZ_NETPLUS_OPERATIONS: Quiz = {
  id: "netplus-quiz-operations",
  title: "Network+ T4: Netzwerkbetrieb & Monitoring",
  description:
    "SNMP v1/v2c/v3, Syslog-Levels, IPFIX vs. NetFlow, DNS-Eintragstypen, DHCP, Disaster Recovery (RPO/RTO) und Dokumentation — N10-009 Domain 3.",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 630,
  questions: QUIZ_QUESTIONS_T4,
};

// ── Topic-Descriptor ──────────────────────────────────────────

export const TOPIC_NETPLUS_OPERATIONS: Topic = {
  id: "netplus-operations",
  title: "Netzwerkbetrieb & Monitoring",
  description:
    "SNMP (v1/v2c/v3), Syslog, Flow-Daten (IPFIX/NetFlow), DNS-Dienste, DHCP, Zeitprotokolle, Disaster Recovery (RPO/RTO/DR-Sites) und Netzwerkdokumentation — vendor-neutrale Brücke zwischen CCNA-Logging und AZ-900-Azure-Monitor.",
  conceptIds: [
    "netplus-monitoring",
    "netplus-network-services",
    "netplus-dr-operations",
    "netplus-network-access",
  ],
  quizIds: ["netplus-quiz-operations"],
  exerciseIds: [],
  prerequisiteTopicIds: ["netplus-network-concepts"],
  estimatedMinutes: 70,
  tags: ["snmp", "syslog", "dhcp", "dns", "dr", "rpo", "rto", "monitoring", "n10-009", "comptia"],
};

// ── Exports ───────────────────────────────────────────────────

export const OPERATIONS_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_MONITORING_NP.id]: CONCEPT_MONITORING_NP,
  [CONCEPT_NETWORK_SERVICES_NP.id]: CONCEPT_NETWORK_SERVICES_NP,
  [CONCEPT_DR_OPERATIONS_NP.id]: CONCEPT_DR_OPERATIONS_NP,
  [CONCEPT_NETWORK_ACCESS_NP.id]: CONCEPT_NETWORK_ACCESS_NP,
};

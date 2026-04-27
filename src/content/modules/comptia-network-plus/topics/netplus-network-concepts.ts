// ============================================================
// CompTIA Network+ N10-009 — Topic 1: Netzwerkkonzepte & OSI
// Domains: 1.1 (OSI), 1.2 (Geräte/Cloud), 1.3 (Ports/Protokolle), 1.4 (Medien), 1.8 (SDN/Zero Trust)
// Sources:
//   CompTIA Network+ N10-009 Exam Objectives Version 4.0 (lokal, Projektordner)
//   RFC 791 (IPv4), RFC 793 (TCP), RFC 768 (UDP) — rfc-editor.org
//   IEEE 802.3, 802.11 Standard-Übersichten
// Cross-References:
//   → CCNA: tcp-ip-suite, network-components (networking-fundamentals)
//   → AZ-900: vnet-subnet, azure-connectivity (azure-networking)
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_OSI_TCPIP: Concept = {
  id: "netplus-osi-tcpip",
  title: "OSI-Referenzmodell & TCP/IP: Vendor-neutrale Perspektive",
  appliesTo: ["comptia-network-plus"],
  tags: ["osi", "tcp-ip", "network-concepts", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["tcp-ip-suite", "network-components", "vnet-subnet"],
  content: `
## OSI & TCP/IP: Was Network+ anders betont als CCNA

Du kennst die 7 OSI-Schichten bereits aus CCNA — dort mit Cisco-Kontext (IOS-Befehle, Cisco-Geräte pro Layer). Network+ nutzt dasselbe Modell, aber **vendor-neutral** und als Denkwerkzeug für Fehlerbehebung und Protokollzuordnung.

> **Cross-Reference CCNA:** Konzept \`tcp-ip-suite\` — dort mit Cisco-spezifischer Praxis. Hier die herstellerübergreifende Sichtweise, die in der N10-009-Prüfung verlangt wird.

### Die 7 OSI-Schichten im Network+-Kontext

| Schicht | Name | Einheiten | Typische Protokolle/Geräte |
|---|---|---|---|
| 7 | Anwendung | Daten | HTTP, HTTPS, DNS, SMTP, FTP, SSH |
| 6 | Darstellung | Daten | TLS/SSL (Verschlüsselung), JPEG, ASCII |
| 5 | Sitzung | Daten | NetBIOS, RPC, SIP |
| 4 | Transport | Segmente (TCP) / Datagramme (UDP) | TCP, UDP |
| 3 | Vermittlung | Pakete | IP, ICMP, Router |
| 2 | Datenverbindung | Rahmen (Frames) | Ethernet, 802.11, Switch, Bridge |
| 1 | Bitübertragung | Bits | Kabel, Hubs, Repeater, NIC |

**Network+-Schwerpunkt:** Schichten 1–4 stehen im Fokus der Prüfung. Layer 5–7 werden weniger detailliert geprüft als in manchen höherstufigen Zertifizierungen.

### TCP/IP-Modell vs. OSI

Das in der Praxis genutzte Modell ist TCP/IP (4 Schichten), das die OSI-Schichten zusammenfasst:

| TCP/IP-Schicht | Entsprechende OSI-Schichten |
|---|---|
| Anwendung | 5 + 6 + 7 |
| Transport | 4 |
| Internet | 3 |
| Netzwerkzugang | 1 + 2 |

**Prüfungsfalle:** Network+ fragt oft, welches OSI-Layer ein bestimmtes Gerät oder Protokoll zugeordnet wird. Merke: Switches → Layer 2 (MAC-Adressen). Router → Layer 3 (IP-Adressen). Firewalls können Layer 3 bis 7 arbeiten.

### Datenkapselung (Encapsulation)

Beim Senden durchläuft Daten die OSI-Schichten von oben nach unten:
- Layer 4 fügt **TCP/UDP-Header** hinzu → Segment/Datagramm
- Layer 3 fügt **IP-Header** hinzu → Paket
- Layer 2 fügt **Ethernet-Header + Trailer** hinzu → Frame
- Layer 1 sendet als Bits

Beim Empfang läuft der Prozess umgekehrt (De-Kapselung).

**PBQ-Hinweis:** In der echten Prüfung kommen hier Drag-and-Drop-Aufgaben vor (Protokolle den richtigen OSI-Layern zuordnen). Übe diese Zuordnung auswendig.
`,
};

export const CONCEPT_PORTS_PROTOCOLS: Concept = {
  id: "netplus-ports-protocols",
  title: "Netzwerkports, Protokolle und Dienste (N10-009 Prüfungskanon)",
  appliesTo: ["comptia-network-plus"],
  tags: ["ports", "protocols", "tcp", "udp", "n10-009"],
  relatedConceptIds: ["tcp-ip-suite"],
  content: `
## Ports und Protokolle: Der N10-009-Pflichtkanon

Network+ N10-009 erwartet, dass du diese Ports und Protokolle auswendig kennst. Das ist eine direkte Prüfungsanforderung aus den Exam Objectives (Domain 1.4).

### Prüfungsrelevante Ports

| Protokoll | Port(s) | Transport | Merkhilfe |
|---|---|---|---|
| FTP | 20 (Daten), 21 (Steuerung) | TCP | File Transfer Protocol |
| SSH / SFTP | 22 | TCP | Sicheres Remote-Management & Dateiübertragung |
| Telnet | 23 | TCP | Unverschlüsselt — in der Praxis durch SSH ersetzt |
| SMTP | 25 | TCP | E-Mail senden (Server zu Server) |
| DNS | 53 | UDP (primär), TCP (Zone Transfers) | Namensauflösung |
| DHCP | 67 (Server), 68 (Client) | UDP | IP-Adressvergabe |
| TFTP | 69 | UDP | Trivial FTP — einfach, kein Auth |
| HTTP | 80 | TCP | Unverschlüsseltes Web |
| NTP | 123 | UDP | Zeitsynchronisierung |
| SNMP | 161 (Queries), 162 (Traps) | UDP | Netzwerkmonitoring |
| LDAP | 389 | TCP | Verzeichnisdienste (unverschlüsselt) |
| HTTPS | 443 | TCP | Verschlüsseltes Web (TLS) |
| SMB | 445 | TCP | Windows-Dateifreigaben |
| Syslog | 514 | UDP | Log-Weiterleitung |
| SMTPS | 587 | TCP | E-Mail senden (verschlüsselt) |
| LDAPS | 636 | TCP | LDAP über TLS |
| SQL Server | 1433 | TCP | Microsoft SQL Server |
| RDP | 3389 | TCP | Remote Desktop Protocol |
| SIP | 5060/5061 | TCP/UDP | VoIP-Signalisierung |

### TCP vs. UDP: Wann was?

**TCP (Transmission Control Protocol):**
- Verbindungsorientiert (3-Way-Handshake: SYN → SYN-ACK → ACK)
- Bestätigung, Fehlerkorrektur, Reihenfolge garantiert
- Langsamer, aber zuverlässig
- Einsatz: HTTP, HTTPS, FTP, SSH, E-Mail

**UDP (User Datagram Protocol):**
- Verbindungslos — kein Handshake
- Keine Bestätigung, keine Reihenfolge
- Schneller, geringerer Overhead
- Einsatz: DNS, DHCP, TFTP, NTP, VoIP, Streaming, Online-Games

**Prüfungsregel:** DNS verwendet normalerweise UDP Port 53, aber TCP für Zone Transfers und bei Antworten > 512 Byte (heute EDNS0 häufiger). Das fragt die Prüfung gelegentlich.

### IP-Protokolltypen

- **ICMP** (Internet Control Message Protocol): ping, traceroute, Fehlermeldungen → kein Port, direkt in IP eingebettet
- **GRE** (Generic Routing Encapsulation): VPN-Tunnel, kein Port
- **IPSec**: Sichere VPN-Verbindungen
  - AH (Authentication Header): Integrität, kein Verschlüsselung
  - ESP (Encapsulating Security Payload): Integrität + Verschlüsselung
  - IKE (Internet Key Exchange): Schlüsselaustausch, UDP 500/4500
`,
};

export const CONCEPT_CLOUD_NETWORKING: Concept = {
  id: "netplus-cloud-networking",
  title: "Cloud-Konzepte in der Netzwerktechnik (N10-009 Neu-Schwerpunkt)",
  appliesTo: ["comptia-network-plus"],
  tags: ["cloud", "vpc", "iaas", "paas", "saas", "nfv", "n10-009"],
  relatedConceptIds: ["vnet-subnet", "azure-connectivity"],
  content: `
## Cloud-Netzwerk-Konzepte: Was N10-009 anders betont

N10-009 hat gegenüber N10-008 erheblich mehr Cloud-Inhalte. Diese sind **vendor-neutral** — du lernst Konzepte, die für AWS, Azure, GCP gleichermaßen gelten.

> **Cross-Reference AZ-900:** Konzept \`vnet-subnet\` behandelt Virtual Networks in Azure konkret. Hier lernst du die zugrunde liegenden Konzepte, die überall gelten.

### Service-Modelle

| Modell | Was der Anbieter verwaltet | Beispiele |
|---|---|---|
| **IaaS** (Infrastructure as a Service) | Physisch + Virtualisierung + Storage | VMs, virtuelle Netzwerke |
| **PaaS** (Platform as a Service) | + OS + Runtime + Middleware | Managed Databases, App Platforms |
| **SaaS** (Software as a Service) | Alles | E-Mail-Dienste, CRM, Office 365 |

**Merkhilfe (Verantwortungsmodell):** Je höher im Stack, desto mehr übernimmt der Anbieter. Der Nutzer verliert Kontrolle, gewinnt aber Einfachheit.

### Bereitstellungsmodelle

- **Public Cloud:** Ressourcen über das öffentliche Internet, geteilte Infrastruktur
- **Private Cloud:** Dedizierte Infrastruktur, on-premise oder hosted
- **Hybrid Cloud:** Kombination aus Public + Private, mit Konnektivität zwischen beiden

### Virtuelles Netzwerk in der Cloud

**VPC / Virtual Private Cloud (oder VNet in Azure):**
- Logisch isoliertes Netzwerksegment in der Cloud
- Enthält Subnetze, Routing-Tabellen, Security Groups
- **Network Security Groups / Security Lists:** Firewalling auf Subnetz- oder Port-Ebene

**Cloud-Konnektivitätsoptionen:**
- **VPN-Gateway:** Verschlüsselter Tunnel über das Internet (Site-to-Site oder Client-to-Site)
- **Direkte Verbindung** (Direct Connect / ExpressRoute): Dedizierte Leitung zum Cloud-Anbieter, kein Internet-Transit, geringere Latenz, höhere Kosten

**Cloud-Gateways:**
- **Internet-Gateway:** Erlaubt Ressourcen im VPC den Internetzugang
- **NAT-Gateway:** Ermöglicht ausgehende Verbindungen aus privaten Subnetzen ins Internet, ohne eingehende Verbindungen zu erlauben

### NFV — Network Functions Virtualization

Traditionell laufen Netzwerkfunktionen (Firewalls, Load Balancer, Router) auf dedizierter Hardware. NFV virtualisiert diese Funktionen als Software auf Standard-Servern.

**Vorteile:** Geringere Kosten, schnellere Bereitstellung, Skalierbarkeit  
**Einsatz:** Besonders in Cloud-Rechenzentren und Telekommunikation

### Skalierbarkeit und Mandantenfähigkeit

- **Skalierbarkeit:** Cloud-Ressourcen können on-demand wachsen (horizontal/vertikal)
- **Mandantenfähigkeit:** Mehrere Kunden teilen sich dieselbe physische Infrastruktur, sind aber logisch isoliert (Multi-Tenancy)
`,
};

export const CONCEPT_MODERN_NETWORK: Concept = {
  id: "netplus-modern-network",
  title: "Moderne Netzwerkarchitekturen: SDN, Zero Trust, IPv6 (N10-009 Domain 1.8)",
  appliesTo: ["comptia-network-plus"],
  tags: ["sdn", "sd-wan", "zero-trust", "ipv6", "vxlan", "iac", "n10-009"],
  relatedConceptIds: ["netplus-osi-tcpip", "azure-connectivity"],
  content: `
## Moderne Netzwerkkonzepte: Die N10-009-Neuerungen

Domain 1.8 der Exam Objectives fasst aufkommende Anwendungsfälle zusammen. Diese sind in N10-009 deutlich stärker gewichtet als in N10-008.

### SDN — Software-Defined Networking

Traditionell: Steuerungsebene (Control Plane) und Datenweiterleitungsebene (Data Plane) sind im gleichen Gerät integriert.

**SDN trennt diese Ebenen:**
- **Control Plane** → zentraler Controller (Software)
- **Data Plane** → Netzwerkgeräte leiten nur weiter, entscheiden nicht selbst

**Vorteile:**
- Zentrales Richtlinienmanagement — eine Änderung gilt überall
- Programmierbar über APIs
- Zero-Touch-Bereitstellung neuer Geräte
- Anwendungsbewusst (Application-Aware Routing)
- Transportagnostisch — läuft über Ethernet, MPLS, Internet

**SD-WAN (Software-Defined Wide Area Network):**
- SDN-Prinzipien auf WAN-Verbindungen angewandt
- Unternehmen können Internet-Leitungen (billiger) statt teurer MPLS-Verbindungen nutzen
- Automatische Pfadauswahl je nach Anwendungsqualität

### Zero Trust Architecture (ZTA) — Neu in N10-009

**Kernprinzip:** "Never trust, always verify" — kein Gerät, kein Benutzer wird automatisch vertraut, auch nicht innerhalb des Netzwerks.

Gegensatz zum traditionellen Perimeter-Modell: "Alles innerhalb der Firewall ist vertrauenswürdig."

**Drei Säulen von Zero Trust:**
1. **Richtlinienbasierte Authentifizierung:** Jede Anfrage wird authentifiziert, unabhängig vom Standort
2. **Autorisierung:** Nur explizit erlaubte Aktionen sind erlaubt
3. **Least Privilege:** Minimalberechtigungen — nur was für die Aufgabe nötig ist

> **Cross-Reference AZ-900:** Das Konzept "Zero Trust" taucht auch in der Azure-Sicherheitsarchitektur auf (Microsoft Defender for Cloud, Conditional Access). N+ behandelt es auf Netzwerkebene, AZ-900 auf Cloud/Identity-Ebene.

**SASE / SSE:**
- **SASE** (Secure Access Secure Edge): Kombination aus SD-WAN + Cloud-Security (Firewall-as-a-Service, CASB, Zero Trust Network Access)
- **SSE** (Security Service Edge): Nur der Security-Teil von SASE ohne WAN-Funktionen

### VXLAN — Virtual Extensible LAN

Problem: Standard-VLANs erlauben nur 4.094 VLANs (12-Bit-Tag). In großen Rechenzentren mit Tausenden von Mandanten zu wenig.

**VXLAN löst das:**
- 24-Bit-VNI (VXLAN Network Identifier) → über 16 Millionen virtuelle Netzwerke
- **Layer-2-Verkapselung über Layer-3:** Ethernet-Frames werden in UDP-Pakete eingebettet
- **DCI (Datacenter Interconnect):** VXLAN verbindet mehrere physische Rechenzentren so, als wären sie ein großes Layer-2-Netzwerk

### Infrastructure as Code (IaC)

Netzwerkkonfigurationen werden wie Software-Code behandelt:
- **Automatisierung:** Playbooks, Templates, wiederverwendbare Aufgaben → konsistente, fehlerfreie Deployments
- **Konfigurationsabweichung (Config Drift):** IaC erkennt, wenn Geräte von der Soll-Konfiguration abweichen
- **Quellenkontrolle (Source Control):** Netzwerkkonfigurationen in Git → Versionierung, Branching, Rollbacks

### IPv6 — Ernsthafter in N10-009

IPv6 ist keine Zukunftstechnologie mehr — N10-009 behandelt es als prüfungsrelevantes Pflichtthema.

**Warum IPv6?**
- IPv4-Adresserschöpfung: Öffentliche IPv4-Adressen sind knapp
- IPv6 hat 128-Bit-Adressen → 340 Sextillionen Adressen

**Übergangs-Technologien:**
- **Dual Stack:** Gerät hat gleichzeitig eine IPv4- und eine IPv6-Adresse
- **Tunneling:** IPv6-Pakete werden in IPv4-Pakete eingebettet (6to4, Teredo)
- **NAT64:** Übersetzung zwischen IPv6 und IPv4 — für Umgebungen, die nicht auf Dual Stack setzen können

**Prüfungsfalle:** NAT ist für IPv4 eine Kompensation für Adressmangel. IPv6 braucht kein NAT — hat aber NAT64 für Kompatibilität mit Legacy-IPv4-Systemen.

<!-- TODO: N10-009 IPv6-Adressnotation-Tiefe prüfen — Objectives Domain 1.8 listet
     Tunneling/Dual-Stack/NAT64 explizit, aber keine spezifischen Adressformate
     (z.B. EUI-64, Link-Local fe80::/10, Präfixnotation). Falls die Prüfung diese
     Details abfragt, hier ergänzen. Quelle: N10-009 Exam Objectives v4.0, Domain 1.8 -->
`,
};

// ── Quiz ──────────────────────────────────────────────────────

const QUIZ_QUESTIONS_T1: Question[] = [
  {
    id: "np-concepts-q1",
    type: "single-choice",
    // PBQ-artig: In der echten Prüfung würde das als Drag-Drop-Aufgabe erscheinen
    text: "Ein Netzwerkadministrator ordnet Protokolle den OSI-Schichten zu. Auf welchem OSI-Layer operiert ein Router primär?",
    points: 10,
    answers: [
      { id: "a", text: "Layer 1 — Bitübertragungsschicht", isCorrect: false },
      { id: "b", text: "Layer 2 — Datenverbindungsschicht", isCorrect: false },
      { id: "c", text: "Layer 3 — Vermittlungsschicht", isCorrect: true },
      { id: "d", text: "Layer 4 — Transportschicht", isCorrect: false },
    ],
    explanation:
      "Router arbeiten auf Layer 3 (Vermittlungsschicht) und treffen Weiterleitungsentscheidungen anhand von IP-Adressen. Switches arbeiten primär auf Layer 2 (MAC-Adressen). Diese Zuordnung ist in Network+ prüfungsrelevant — in der echten Prüfung erscheint sie oft als Drag-and-Drop-Aufgabe (PBQ).",
  },
  {
    id: "np-concepts-q2",
    type: "single-choice",
    text: "Welches Protokoll nutzt UDP Port 53, wechselt aber bei Zone Transfers auf TCP?",
    points: 10,
    answers: [
      { id: "a", text: "DHCP", isCorrect: false },
      { id: "b", text: "DNS", isCorrect: true },
      { id: "c", text: "SNMP", isCorrect: false },
      { id: "d", text: "TFTP", isCorrect: false },
    ],
    explanation:
      "DNS nutzt normalerweise UDP Port 53 für kurze Anfragen (schneller, geringer Overhead). Für Zone Transfers (vollständige Replikation zwischen DNS-Servern) oder bei Antworten über 512 Byte wechselt DNS auf TCP Port 53. Das ist eine typische Network+-Prüfungsfalle.",
  },
  {
    id: "np-concepts-q3",
    type: "multiple-choice",
    text: "Welche ZWEI Aussagen über Zero Trust Architecture (ZTA) sind korrekt? (Wähle 2)",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Ressourcen innerhalb des internen Netzwerks werden automatisch als vertrauenswürdig eingestuft",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Jede Zugriffsanfrage wird authentifiziert, unabhängig vom Standort des Nutzers",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Das Prinzip der geringsten Rechte (Least Privilege) ist ein Kernbestandteil",
        isCorrect: true,
      },
      {
        id: "d",
        text: "ZTA erfordert zwingend eine VPN-Verbindung für alle Remote-Zugriffe",
        isCorrect: false,
      },
    ],
    explanation:
      "Zero Trust basiert auf 'Never trust, always verify' — kein Gerät wird automatisch vertraut, auch nicht im internen Netz (A ist falsch). Jede Anfrage wird authentifiziert (B korrekt) und Benutzer erhalten minimal nötige Berechtigungen — Least Privilege (C korrekt). ZTA ersetzt oft herkömmliche VPN-Architekturen durch ZTNA, ist aber nicht auf VPN angewiesen (D falsch).",
  },
  {
    id: "np-concepts-q4",
    type: "single-choice",
    text: "Ein Unternehmen möchte mehrere Rechenzentren zu einem einzigen Layer-2-Netzwerk verbinden und benötigt dabei deutlich mehr als 4.094 VLANs. Welche Technologie löst dieses Problem?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "SD-WAN — Software-Defined Wide Area Network",
        isCorrect: false,
      },
      {
        id: "b",
        text: "VXLAN — Virtual Extensible LAN",
        isCorrect: true,
      },
      {
        id: "c",
        text: "IPSec — Internet Protocol Security",
        isCorrect: false,
      },
      {
        id: "d",
        text: "NAT64 — Network Address Translation für IPv6",
        isCorrect: false,
      },
    ],
    explanation:
      "VXLAN (Virtual Extensible LAN) verwendet einen 24-Bit-VNI statt des 12-Bit-VLAN-Tags und ermöglicht so über 16 Millionen virtuelle Netzwerke. VXLAN kapselt Ethernet-Frames in UDP-Pakete (Layer-2-über-Layer-3) und wird für Datacenter Interconnect (DCI) eingesetzt. SD-WAN optimiert WAN-Verbindungen, löst aber nicht das VLAN-Limit-Problem.",
  },
  {
    id: "np-concepts-q5",
    type: "single-choice",
    text: "Was ist der Hauptunterschied zwischen IaaS und PaaS im Cloud-Service-Modell?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Bei IaaS verwaltet der Nutzer das Betriebssystem, bei PaaS übernimmt das der Anbieter",
        isCorrect: true,
      },
      {
        id: "b",
        text: "IaaS ist immer günstiger als PaaS",
        isCorrect: false,
      },
      {
        id: "c",
        text: "PaaS bietet weniger Skalierbarkeit als IaaS",
        isCorrect: false,
      },
      {
        id: "d",
        text: "IaaS ist ausschließlich für öffentliche Cloud-Bereitstellungen geeignet",
        isCorrect: false,
      },
    ],
    explanation:
      "Bei IaaS (Infrastructure as a Service) ist der Nutzer für OS, Anwendungen und Daten verantwortlich — der Anbieter stellt nur Compute, Storage und Netzwerk bereit. Bei PaaS übernimmt der Anbieter zusätzlich OS, Runtime und Middleware — der Nutzer konzentriert sich nur auf die Anwendung. Das Shared-Responsibility-Modell ist prüfungsrelevant für N10-009 und AZ-900.",
  },
  {
    id: "np-concepts-q6",
    type: "single-choice",
    text: "Ein Unternehmen setzt SDN ein. Welches Merkmal trifft auf die SDN-Architektur zu?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Jedes Netzwerkgerät enthält eine vollständige, unabhängige Control Plane",
        isCorrect: false,
      },
      {
        id: "b",
        text: "SDN ist nur mit Cisco-Hardware kompatibel",
        isCorrect: false,
      },
      {
        id: "c",
        text: "Control Plane und Data Plane sind getrennt — ein zentraler Controller verwaltet Richtlinien",
        isCorrect: true,
      },
      {
        id: "d",
        text: "SDN erfordert physisch dedizierte Leitungen zwischen Controller und Geräten",
        isCorrect: false,
      },
    ],
    explanation:
      "SDN trennt Control Plane (Entscheidungslogik) von der Data Plane (Paket-Weiterleitung). Ein zentraler Controller trifft alle Routing- und Richtlinienentscheidungen und kommuniziert über Protokolle wie OpenFlow oder APIs mit den Netzwerkgeräten. SDN ist vendor-neutral und transportagnostisch — funktioniert über Standard-Ethernet, MPLS oder Internet.",
  },
  {
    id: "np-concepts-q7",
    type: "single-choice",
    text: "Welcher TCP/UDP-Port nutzt SSH für sichere Remote-Verbindungen?",
    points: 10,
    answers: [
      { id: "a", text: "Port 21", isCorrect: false },
      { id: "b", text: "Port 22", isCorrect: true },
      { id: "c", text: "Port 23", isCorrect: false },
      { id: "d", text: "Port 443", isCorrect: false },
    ],
    explanation:
      "SSH (Secure Shell) verwendet TCP Port 22. SFTP (Secure File Transfer Protocol) teilt sich Port 22 mit SSH, da SFTP als SSH-Subsystem läuft. Port 21 ist FTP (unverschlüsselt), Port 23 ist Telnet (unverschlüsselt, in der Praxis ersetzt durch SSH), Port 443 ist HTTPS. Port-Zuordnungen sind in N10-009 Pflicht-Lernstoff.",
  },
];

export const QUIZ_NETPLUS_NETWORK_CONCEPTS: Quiz = {
  id: "netplus-quiz-network-concepts",
  title: "Network+ T1: Netzwerkkonzepte & OSI",
  description:
    "OSI-Modell, Ports/Protokolle, Cloud-Konzepte, SDN und Zero Trust — die Grundlagen von N10-009 Domain 1.",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: QUIZ_QUESTIONS_T1,
};

// ── Topic-Descriptor ──────────────────────────────────────────

export const TOPIC_NETPLUS_NETWORK_CONCEPTS: Topic = {
  id: "netplus-network-concepts",
  title: "Netzwerkkonzepte & OSI-Modell",
  description:
    "OSI-Referenzmodell und TCP/IP vendor-neutral, Pflicht-Ports und Protokolle, Cloud-Netzwerkkonzepte (VPC, IaaS/PaaS/SaaS), SDN/SD-WAN, Zero Trust Architecture und IPv6-Grundlagen.",
  conceptIds: [
    "netplus-osi-tcpip",
    "netplus-ports-protocols",
    "netplus-cloud-networking",
    "netplus-modern-network",
  ],
  quizIds: ["netplus-quiz-network-concepts"],
  exerciseIds: [],
  prerequisiteTopicIds: [],
  estimatedMinutes: 60,
  tags: ["osi", "protocols", "cloud", "sdn", "zero-trust", "ipv6", "n10-009", "comptia"],
};

// ── Exports ───────────────────────────────────────────────────

export const NETWORK_CONCEPTS_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_OSI_TCPIP.id]: CONCEPT_OSI_TCPIP,
  [CONCEPT_PORTS_PROTOCOLS.id]: CONCEPT_PORTS_PROTOCOLS,
  [CONCEPT_CLOUD_NETWORKING.id]: CONCEPT_CLOUD_NETWORKING,
  [CONCEPT_MODERN_NETWORK.id]: CONCEPT_MODERN_NETWORK,
};

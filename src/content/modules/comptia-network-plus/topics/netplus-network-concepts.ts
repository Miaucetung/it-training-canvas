// ============================================================
// CompTIA Network+ N10-009 — Topic 1: Netzwerkkonzepte & OSI
// Domains: 1.1 (OSI), 1.2 (Geräte/Cloud), 1.3 (Ports/Protokolle), 1.4 (Medien), 1.5 (Kabeltypen/Transceiver), 1.6 (Topologien), 1.7 (IPv4/VLSM/CIDR), 1.8 (SDN/Zero Trust)
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

export const CONCEPT_MEDIA_TRANSCEIVERS: Concept = {
  id: "netplus-media-transceivers",
  title: "Kabelmedien, Transceiver und Steckverbinder (N10-009 Domain 1.5)",
  appliesTo: ["comptia-network-plus"],
  tags: ["cable", "fiber", "transceiver", "sfp", "cat6a", "smf", "mmf", "n10-009"],
  relatedConceptIds: ["netplus-cable-physical-issues"],
  content: `
## Kabelmedien und Transceiver: N10-009 Domain 1.5

### Kupferkabel — Twisted Pair

| Kategorie | Max. Bandbreite | Max. Länge | Einsatz |
|-----------|----------------|------------|--------|
| **Cat5e** | 1 Gbit/s (1000BASE-T) | 100 m | LAN-Installationen, ältere Gebäude |
| **Cat6** | 10 Gbit/s (bis 55 m) | 100 m (1G), 55 m (10G) | Standard-LAN, Serverräume |
| **Cat6A** | 10 Gbit/s | 100 m | Empfohlen für neue 10G-Installationen |
| **Cat7** | 10 Gbit/s | 100 m | Bessere Abschirmung (STP), proprietäre Stecker |
| **Cat8** | 40 Gbit/s | 30 m | Rechenzentrum, kurze Server-to-Switch-Strecken |

**UTP vs. STP:**
- **UTP (Unshielded Twisted Pair):** Keine Abschirmung — günstiger, flexibler, am häufigsten
- **STP (Shielded Twisted Pair):** Abschirmung reduziert Interferenz — Vorsicht: muss korrekt geerdet sein, sonst verstärkt Abschirmung Interferenz
- **Prüfungsregel:** N10-009 fragt gelegentlich nach dem richtigen Einsatzort — STP für Umgebungen mit hoher EMI (Industriehallen, neben Hochspannungskabeln)

### Glasfaser (Fiber Optic)

| Typ | Farbe (typisch) | Kerndurchmesser | Max. Reichweite | Einsatz |
|-----|----------------|-----------------|----------------|--------|
| **SMF (Single-Mode)** | Gelb | 9 µm | Bis 100 km (und mehr) | WAN, Campus-Backbone, ISP |
| **MMF (Multi-Mode) OM3** | Aqua/Türkis | 50 µm | ~300 m @ 10G | Rechenzentrum, Gebäude-Backbone |
| **MMF (Multi-Mode) OM4** | Violett/Magenta | 50 µm | ~400 m @ 10G | Hochperformantes RZ |
| **MMF (Multi-Mode) OM5** | Grün-Limette | 50 µm | SWDM4 (Multiwell. 40/100G) | Moderne RZ-Anwendungen |

**Wichtige Unterscheidung:**
- SMF hat einen kleinen Kern → nur ein Lichtmodus → geringere Dispersion → sehr lange Reichweiten
- MMF hat einen größen Kern → mehrere Lichtmodi → modale Dispersion begrenzt Reichweite
- SMF und MMF sehen sich äußerlich ähnlich (gleiche Stecker möglich), sind aber **optisch inkompatibel**

### Transceiver und Stecker

**SFP-Formfaktoren:**

| Formfaktor | Bandbreite | Beschreibung |
|------------|-----------|-------------|
| **SFP** (Small Form-factor Pluggable) | Bis 1 Gbit/s | Standard-Einzelkanalmodul |
| **SFP+** | Bis 10 Gbit/s | Enhanced SFP |
| **SFP28** | Bis 25 Gbit/s | 25G-Einzelkanal |
| **QSFP+** (Quad SFP) | 40 Gbit/s | 4 × 10G-Kanäle |
| **QSFP28** | 100 Gbit/s | 4 × 25G-Kanäle |

**BiDi (Bidirectional Transceiver):**
- Sendet und empfängt über eine einzige Glasfaser (statt zwei) mittels WDM (Wellenlängenmultiplex)
- Vorteil: Halbiert den benötigten Faserstrang
- Erfordert einen TX-BiDi auf einer Seite und einen RX-BiDi auf der anderen

**DAC (Direct Attach Copper):**
- Vorkonfektioniertes Kupferkabel mit integrierten SFP+-Köpfen
- Einsatz: Kurze Verbindungen (≤7 m) im Rechenzentrum zwischen Switch und Server
- Günstiger als Glasfaser-Transceiver für kurze Strecken

### Glasfaser-Steckverbinder

| Stecker | Einsatz | Merkmal |
|---------|---------|--------|
| **LC** (Lucent Connector) | Standard in RZ und modernen Installationen | Klein, Duplex-Variante üblich |
| **SC** (Subscriber Connector) | Ältere Installationen, GPON | Quadratisch, Push-Pull |
| **ST** (Straight Tip) | Ältere Netzwerke | Bajonettverschluss, rund |
| **MTP/MPO** | Hochdichte RZ, 40G/100G | 12 oder 24 Fasern in einem Stecker |

> **Cross-Reference Troubleshooting:** Falsche Stecker oder SMF/MMF-Verwechslung sind typische physische Fehlerquellen — siehe Konzept \`netplus-cable-physical-issues\` in Topic 5.
`,
};

export const CONCEPT_TOPOLOGIES_ARCHITECTURES: Concept = {
  id: "netplus-topologies-architectures",
  title: "Netzwerktopologien und -architekturen (N10-009 Domain 1.6)",
  appliesTo: ["comptia-network-plus"],
  tags: ["topology", "star", "mesh", "three-tier", "spine-leaf", "wan", "n10-009"],
  relatedConceptIds: ["netplus-osi-tcpip", "netplus-cloud-networking"],
  content: `
## Netzwerktopologien: N10-009 Domain 1.6

### Physische LAN-Topologien

| Topologie | Beschreibung | Vorteil | Nachteil |
|-----------|-------------|---------|----------|
| **Bus** | Alle Geräte an einem gemeinsamen Kabel | Einfach, günstig | Kollisionen, Single Point of Failure, historisch (Koaxial) |
| **Ring** | Geräte in einem Kreisring verbunden | Kollisionsfrei (Token), deterministisch | Ausfall eines Geräts unterbricht Ring (außer dual ring) |
| **Star (Stern)** | Alle Geräte mit einem zentralen Switch verbunden | Ausfalltoleranz (Gerät ≠ ganzes Netz), einfach erweiterbar | Zentraler Switch ist Single Point of Failure |
| **Mesh (Voll)** | Jedes Gerät direkt mit jedem anderen verbunden | Maximale Redundanz, kein SPof | Sehr teuer (n×(n-1)/2 Verbindungen) |
| **Mesh (Partiell)** | Kritische Knoten mit mehreren Verbindungen | Guter Kompromiss Redundanz/Kosten | Selektive Redundanz |
| **Hybrid** | Kombination mehrerer Topologien | Flexibel anpassbar | Komplex in Verwaltung |

**Prüfungsregel:** Heute nutzen nahezu alle LANs eine **logische Bus**-Topologie über Ethernet, aber eine **physische Stern**-Topologie (alle Geräte mit Switch verbunden).

### LAN-Netzwerkarchitekturen

**Dreischicht-Architektur (Three-Tier):**
Die klassische Enterprise-Hierarchie — prüfungsrelevant für N10-009:

| Schicht | Funktion | Geräte |
|---------|---------|--------|
| **Access Layer** | Endgeräte verbinden sich hier | Access-Switches mit PoE, Port Security |
| **Distribution Layer** | Verbindet Access-Switches, Policy-Enforcement, VLAN-Routing | L3-Switches, Router |
| **Core Layer** | Hochgeschwindigkeits-Backbone, Routing zwischen Verteilungsblöcken | Hochleistungs-Layer-3-Switches |

**Collapsed Core (Zweischicht):**
- Distribution und Core werden auf einem Gerät zusammengeführt
- Einsatz: Mittlere Unternehmen — einfacher, kostengünstiger als Three-Tier

**Spine-Leaf-Architektur (Rechenzentrum):**
- Moderne RZ-Architektur für East-West-Traffic (Server-zu-Server)
- **Leaf:** Access-Switches — jeder Server ist an einem Leaf angeschlossen
- **Spine:** Backbone-Switches — jeder Leaf ist mit jedem Spine verbunden
- Kein Trunking, flache Topologie, niedrige und vorhersehbare Latenz
- **Traffic-Richtungen:**
  - **North-South:** Externer Traffic (Internet → Rechenzentrum, Client → Server) → traditionell Three-Tier
  - **East-West:** Interner RZ-Traffic (Server ↔ Server, Microservices) → Spine-Leaf

### WAN-Topologien

| WAN-Topologie | Beschreibung | Einsatz |
|--------------|-------------|--------|
| **Point-to-Point** | Direkte dedizierte Leitung zwischen zwei Standorten | Kleine Unternehmen, kritische Verbindungen |
| **Hub-and-Spoke (Stern)** | Zentrale Hub-Site verbindet alle Spoke-Sites | Viele Standorte, zentrales RZ, kostengünstig |
| **Full Mesh** | Jeder Standort direkt mit jedem anderen verbunden | Maximale Redundanz, teuer, für kritische Infrastruktur |
| **Partial Mesh** | Kritische Standorte voll verbunden, andere über Hub | Kompromiss zwischen Kosten und Redundanz |

**MPLS (Multiprotocol Label Switching):**
- Dedizierte WAN-Verbindung mit garantierter Bandbreite und QoS
- Teurer als Internet-basierte VPNs, aber vorhersehbare Performance
- In SD-WAN-Architektur: MPLS als einer von mehreren Transportwegen

### SOHO-Netzwerke

SOHO (Small Office/Home Office): Kleine Netzwerke mit einem kombinierten Gerät (Router + Switch + WLAN + Firewall)
- Alles in einem Gerät → kostengünstig, aber begrenzte Konfigurierbarkeit
- N10-009 fragt grundlegende SOHO-Konfiguration: DHCP, NAT, Wireless-Sicherheit
`,
};

export const CONCEPT_IPv4_SUBNETTING: Concept = {
  id: "netplus-ipv4-subnetting",
  title: "IPv4-Adressierung, Subnetting, VLSM und CIDR (N10-009 Domain 1.7)",
  appliesTo: ["comptia-network-plus"],
  tags: ["ipv4", "subnetting", "cidr", "vlsm", "rfc1918", "nat", "n10-009"],
  relatedConceptIds: ["netplus-network-service-issues"],
  content: `
## IPv4-Adressierung und Subnetting: N10-009 Domain 1.7

**N10-009-Anforderung:** IPv4-Subnetting ist Pflichtthema — du musst Netzwerkadresse, Broadcastadresse, Hostbereich und Subnetzmaske aus einer CIDR-Notation bestimmen können.

### IPv4-Adressklassen (historisch, aber prüfungsrelevant)

| Klasse | Bereich (erstes Oktett) | Standard-Maske | Netzwerke | Hosts/Netz |
|--------|------------------------|---------------|-----------|------------|
| **A** | 1–126 | /8 (255.0.0.0) | 126 | ~16,7 Mio. |
| **B** | 128–191 | /16 (255.255.0.0) | 16.384 | ~65.534 |
| **C** | 192–223 | /24 (255.255.255.0) | ~2 Mio. | 254 |
| **D** | 224–239 | — | Multicast | — |
| **E** | 240–255 | — | Reserviert | — |

**Loopback:** 127.0.0.0/8 (127.0.0.1 = lokaler Host — kein Traffic verlässt das Interface)

### Private RFC-1918-Adressbereiche

| Bereich | CIDR | Klasse |
|---------|------|-------|
| 10.0.0.0 – 10.255.255.255 | /8 | A |
| 172.16.0.0 – 172.31.255.255 | /12 | B |
| 192.168.0.0 – 192.168.255.255 | /16 | C |

**APIPA:** 169.254.0.0/16 — automatisch zugewiesen bei fehlendem DHCP-Server

**NAT (Network Address Translation):**
- Private Adressen werden durch NAT auf öffentliche IP-Adressen übersetzt
- PAT (Port Address Translation) / NAT Overloading: Viele private IPs teilen sich eine öffentliche IP (Port-basiert)
- Ermöglicht private RFC-1918-Netzwerke im Internet-Zugang

### CIDR-Notation und Subnetzmasken

| CIDR | Subnetzmaske | Hosts | Netzwerkadressen |
|------|-------------|-------|------------------|
| **/24** | 255.255.255.0 | 254 | 1 Netzwerk von /24 |
| **/25** | 255.255.255.128 | 126 | 2 × /25 aus /24 |
| **/26** | 255.255.255.192 | 62 | 4 × /26 aus /24 |
| **/27** | 255.255.255.224 | 30 | 8 × /27 aus /24 |
| **/28** | 255.255.255.240 | 14 | 16 × /28 aus /24 |
| **/29** | 255.255.255.248 | 6 | 32 × /29 aus /24 |
| **/30** | 255.255.255.252 | 2 | Point-to-Point-Links |
| **/32** | 255.255.255.255 | 0 (Host-Route) | Einzelne Hostadresse |

**Hosts-Formel:** $2^{(32 - \\text{Präfixlänge})} - 2$ 
(-2 für Netzwerkadresse und Broadcast)

### Subnetz berechnen: Schritt-für-Schritt

**Beispiel:** 192.168.10.50/26

1. **Präfixlänge:** /26 → 26 Bits Netz, 6 Bits Host
2. **Subnetzmaske:** 255.255.255.192
3. **Blockgröße:** $2^6 = 64$ Adressen pro Subnetz
4. **Subnetze:** 192.168.10.0/26, 192.168.10.64/26, 192.168.10.128/26, 192.168.10.192/26
5. **Host 50 liegt in:** 192.168.10.0/26 (Bereich 0–63)
6. **Netzwerkadresse:** 192.168.10.0
7. **Broadcastadresse:** 192.168.10.63
8. **Hostbereich:** 192.168.10.1 – 192.168.10.62 (62 Hosts)

### VLSM — Variable Length Subnet Masking

VLSM erlaubt verschiedene Subnetzmasken innerhalb des gleichen Netzwerks — ermöglicht effiziente Adresszuweisung:

**Szenario:** Netzwerk 10.0.0.0/24, drei Standorte: 50 Hosts, 25 Hosts, 2 Hosts (Point-to-Point)

| Standort | Benötigte Hosts | CIDR | Subnetz | Tatsächlich verfügbar |
|---------|----------------|------|---------|----------------------|
| Standort A | 50 | /26 | 10.0.0.0/26 | 62 Hosts |
| Standort B | 25 | /27 | 10.0.0.64/27 | 30 Hosts |
| WAN-Link | 2 | /30 | 10.0.0.96/30 | 2 Hosts |

**Vorteile gegenüber klassischem Subnetting:** Keine verschwendeten Adressen durch zu große Subnetze.

### Supernetting / CIDR-Aggregation

Mehrere aufeinanderfolgende Subnetze können zu einem größeren Netzwerk zusammengefasst werden (Route Summarization):
- 192.168.0.0/24 + 192.168.1.0/24 + 192.168.2.0/24 + 192.168.3.0/24 → 192.168.0.0/22
- Vorteil: Weniger Einträge in der Routing-Tabelle → weniger Rechenaufwand für Router
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
  {
    id: "np-concepts-q8",
    type: "single-choice",
    text: "Welcher SFP-Formfaktor unterstützt bis zu 100 Gbit/s durch vier parallel genutzte 25G-Kanäle?",
    points: 10,
    answers: [
      { id: "a", text: "SFP+", isCorrect: false },
      { id: "b", text: "SFP28", isCorrect: false },
      { id: "c", text: "QSFP28", isCorrect: true },
      { id: "d", text: "BiDi SFP", isCorrect: false },
    ],
    explanation:
      "QSFP28 (Quad Small Form-factor Pluggable 28) nutzt 4 Kanäle mit je 25 Gbit/s = 100 Gbit/s gesamt. QSFP+ nutzt 4 × 10G = 40G. SFP28 ist ein Einzelkanalmodul mit 25G. BiDi SFP überträgt zwei Richtungen auf einer Faser, aber mit 1G oder 10G pro Kanal — kein 100G-Formfaktor.",
  },
  {
    id: "np-concepts-q9",
    type: "single-choice",
    text: "Ein Rechenzentrum will Server-zu-Server-Traffic (East-West) mit niedriger, vorhersehbarer Latenz und ohne Spanning Tree optimieren. Welche Architektur ist am geeignetsten?",
    points: 10,
    answers: [
      { id: "a", text: "Three-Tier (Access/Distribution/Core)", isCorrect: false },
      { id: "b", text: "Hub-and-Spoke WAN-Topologie", isCorrect: false },
      { id: "c", text: "Spine-Leaf-Architektur", isCorrect: true },
      { id: "d", text: "Bus-Topologie mit Koaxialkabel", isCorrect: false },
    ],
    explanation:
      "Spine-Leaf ist die moderne RZ-Architektur für East-West-Traffic (Server ↔ Server). Jeder Leaf-Switch ist mit jedem Spine-Switch verbunden — maximale 2-Hop-Latenz von jedem Server zu jedem anderen Server. Kein Spanning Tree nötig (ECMP stattdessen). Three-Tier ist für North-South-Traffic (Client→Server) optimiert. Hub-and-Spoke ist eine WAN-Topologie.",
  },
  {
    id: "np-concepts-q10",
    type: "single-choice",
    text: "Ein Administrator hat das Netzwerk 192.168.5.0/27 erhalten. Wie viele nutzbare Hostadressen stehen zur Verfügung?",
    points: 10,
    answers: [
      { id: "a", text: "32", isCorrect: false },
      { id: "b", text: "30", isCorrect: true },
      { id: "c", text: "62", isCorrect: false },
      { id: "d", text: "14", isCorrect: false },
    ],
    explanation:
      "/27 bedeutet 27 Netzwerk-Bits, 5 Host-Bits. Blockgröße: 2^5 = 32 Adressen. Nutzbare Hosts: 32 − 2 = 30 (Netzwerkadresse 192.168.5.0 und Broadcast 192.168.5.31 abziehen). Hostbereich: 192.168.5.1 – 192.168.5.30. /26 = 62 Hosts, /28 = 14 Hosts — die Prüfung testet diese Unterschiede häufig.",
  },
  {
    id: "np-concepts-q11",
    type: "single-choice",
    text: "Welcher private RFC-1918-Bereich entspricht einer /12-Präfixlänge?",
    points: 10,
    answers: [
      { id: "a", text: "10.0.0.0 - 10.255.255.255", isCorrect: false },
      { id: "b", text: "172.16.0.0 - 172.31.255.255", isCorrect: true },
      { id: "c", text: "192.168.0.0 - 192.168.255.255", isCorrect: false },
      { id: "d", text: "169.254.0.0 - 169.254.255.255", isCorrect: false },
    ],
    explanation:
      "RFC-1918 definiert drei private Bereiche: 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16. Die /12-Range ist 172.16.0.0 bis 172.31.255.255. 169.254.0.0/16 ist APIPA (Link-Local) und kein RFC-1918-Privatbereich.",
  },
  {
    id: "np-concepts-q12",
    type: "single-choice",
    text: "Welche Aussage beschreibt den Hauptzweck von NAT/PAT in IPv4-Netzen am besten?",
    points: 10,
    answers: [
      { id: "a", text: "Erhöht die Layer-2-Bandbreite auf Switch-Ports", isCorrect: false },
      { id: "b", text: "Ersetzt DNS durch direkte IP-Zuordnung", isCorrect: false },
      {
        id: "c",
        text: "Ermöglicht mehreren privaten Hosts den Internetzugang über eine oder wenige öffentliche IP-Adressen",
        isCorrect: true,
      },
      { id: "d", text: "Verhindert grundsätzlich alle eingehenden Angriffe", isCorrect: false },
    ],
    explanation:
      "PAT (NAT Overload) übersetzt viele interne private Quelladressen auf eine öffentliche IP plus unterschiedliche Quellports. Dadurch wird IPv4-Adressknappheit kompensiert. NAT ist kein vollwertiger Sicherheitsmechanismus und ersetzt keine Firewall-Regeln.",
  },
  {
    id: "np-concepts-q13",
    type: "single-choice",
    text: "Welcher Port ist korrekt für SNMP-Manager-Anfragen bzw. SNMP-Traps zugeordnet?",
    points: 10,
    answers: [
      { id: "a", text: "161/162 UDP", isCorrect: true },
      { id: "b", text: "67/68 UDP", isCorrect: false },
      { id: "c", text: "20/21 TCP", isCorrect: false },
      { id: "d", text: "500/4500 UDP", isCorrect: false },
    ],
    explanation:
      "SNMP nutzt UDP 161 für Manager-Queries an Agents und UDP 162 für asynchrone Traps/Inform-Meldungen. 67/68 gehört zu DHCP, 20/21 zu FTP, 500/4500 zu IKE/IPsec-NAT-T.",
  },
  {
    id: "np-concepts-q14",
    type: "multiple-choice",
    text: "Welche ZWEI Aussagen zu Fiber-Optic sind korrekt? (Wähle 2)",
    points: 10,
    answers: [
      { id: "a", text: "SMF hat typischerweise einen 9-um-Kern und eignet sich für lange Strecken", isCorrect: true },
      { id: "b", text: "MMF ist immer besser für WAN-Backbones über viele Kilometer", isCorrect: false },
      { id: "c", text: "MMF nutzt mehrere Lichtmodi, was die Reichweite begrenzen kann", isCorrect: true },
      { id: "d", text: "SMF und MMF sind austauschbar, solange der Stecker passt", isCorrect: false },
    ],
    explanation:
      "SMF verwendet einen kleinen Kern (typisch 9 um), reduziert modale Dispersion und erlaubt große Reichweiten. MMF hat mehrere Lichtmodi, was Dispersion erhöht und die Distanz begrenzt. Gleicher Stecker bedeutet nicht optische Kompatibilität.",
  },
  {
    id: "np-concepts-q15",
    type: "single-choice",
    text: "Ein Unternehmen benötigt eine dedizierte private Verbindung zur Public Cloud ohne Internet-Transit. Welche Option passt am besten?",
    points: 10,
    answers: [
      { id: "a", text: "Site-to-Site VPN über das öffentliche Internet", isCorrect: false },
      { id: "b", text: "Direkte Verbindung wie ExpressRoute/Direct Connect", isCorrect: true },
      { id: "c", text: "NAT Gateway im Cloud-Subnetz", isCorrect: false },
      { id: "d", text: "Public Load Balancer", isCorrect: false },
    ],
    explanation:
      "Eine dedizierte Direktverbindung (z.B. ExpressRoute/Direct Connect) umgeht den Internet-Transit, liefert planbare Latenzen und oft bessere SLA-Werte. Site-to-Site VPN nutzt das Internet. NAT Gateway und Load Balancer lösen andere Probleme.",
  },
  {
    id: "np-concepts-q16",
    type: "single-choice",
    text: "Welche Architektur trennt bei SDN die Entscheidungslogik von der reinen Paketweiterleitung?",
    points: 10,
    answers: [
      { id: "a", text: "Control Plane im zentralen Controller, Data Plane in den Forwarding-Geräten", isCorrect: true },
      { id: "b", text: "Control und Data Plane bleiben in jedem Access Point zusammen", isCorrect: false },
      { id: "c", text: "Nur die Security Plane wird zentralisiert", isCorrect: false },
      { id: "d", text: "Data Plane wird vollständig in die Cloud ausgelagert, Control Plane lokal", isCorrect: false },
    ],
    explanation:
      "Das Kernprinzip von SDN ist die Trennung von Control Plane (zentrale Richtlinien-/Pfadentscheidung) und Data Plane (lokales Forwarding in Netzwerkgeräten). Dadurch wird Netzwerksteuerung programmierbar und konsistent.",
  },
  {
    id: "np-concepts-q17",
    type: "single-choice",
    text: "Welche Aussage zu Zero Trust ist korrekt?",
    points: 10,
    answers: [
      { id: "a", text: "Interner Traffic wird pauschal als vertrauenswürdig behandelt", isCorrect: false },
      { id: "b", text: "Authentifizierung und Autorisierung erfolgen kontinuierlich und kontextabhängig", isCorrect: true },
      { id: "c", text: "Zero Trust ersetzt jede Form von Netzwerksegmentierung", isCorrect: false },
      { id: "d", text: "Zero Trust ist nur für Cloud-Umgebungen geeignet", isCorrect: false },
    ],
    explanation:
      "Zero Trust bedeutet 'never trust, always verify'. Zugriffe werden kontinuierlich anhand von Identität, Gerätezustand, Kontext und Policy bewertet. Segmentierung bleibt ein wichtiges Element und Zero Trust gilt für on-prem wie Cloud.",
  },
  {
    id: "np-concepts-q18",
    type: "single-choice",
    text: "Ein Host hat die Adresse 10.1.4.130/25. In welchem Subnetz liegt er?",
    points: 10,
    answers: [
      { id: "a", text: "10.1.4.0/25", isCorrect: false },
      { id: "b", text: "10.1.4.64/25", isCorrect: false },
      { id: "c", text: "10.1.4.128/25", isCorrect: true },
      { id: "d", text: "10.1.4.192/25", isCorrect: false },
    ],
    explanation:
      "Bei /25 ist die Blockgroesse 128. Die Subnetze sind 10.1.4.0/25 (0-127) und 10.1.4.128/25 (128-255). 10.1.4.130 liegt damit im zweiten Subnetz 10.1.4.128/25.",
  },
  {
    id: "np-concepts-q19",
    type: "single-choice",
    text: "Welche Kombination beschreibt eine typische dreistufige Enterprise-LAN-Architektur korrekt?",
    points: 10,
    answers: [
      { id: "a", text: "Access - Core - WAN Edge", isCorrect: false },
      { id: "b", text: "Distribution - Access - Data Center", isCorrect: false },
      { id: "c", text: "Access - Distribution - Core", isCorrect: true },
      { id: "d", text: "Edge - Spine - Leaf", isCorrect: false },
    ],
    explanation:
      "Die klassische Three-Tier-LAN-Struktur besteht aus Access, Distribution und Core. Spine-Leaf ist eher ein Datacenter-Ansatz. WAN Edge ist kein eigenes Standard-Layer innerhalb der klassischen LAN-Three-Tier-Hierarchie.",
  },
  {
    id: "np-concepts-q20",
    type: "single-choice",
    text: "Welche Aussage zu APIPA ist richtig?",
    points: 10,
    answers: [
      { id: "a", text: "APIPA-Adressen sind global im Internet routbar", isCorrect: false },
      { id: "b", text: "APIPA wird typischerweise genutzt, wenn DHCP nicht erreichbar ist", isCorrect: true },
      { id: "c", text: "APIPA basiert auf IPv6-RA und SLAAC", isCorrect: false },
      { id: "d", text: "APIPA entspricht dem privaten Bereich 192.168.0.0/16", isCorrect: false },
    ],
    explanation:
      "APIPA (169.254.0.0/16) wird lokal vergeben, wenn ein Client keinen DHCP-Server erreicht. Diese Adressen sind nicht fuer normales Routing ins Internet gedacht und dienen primär lokaler Link-Kommunikation.",
  },
  {
    id: "np-concepts-q21",
    type: "multiple-choice",
    text: "Welche ZWEI Aussagen zu WAN-Topologien sind korrekt? (Wähle 2)",
    points: 10,
    answers: [
      { id: "a", text: "Hub-and-Spoke reduziert in der Regel Kosten gegenueber Full Mesh", isCorrect: true },
      { id: "b", text: "Full Mesh minimiert die Anzahl der Verbindungen", isCorrect: false },
      { id: "c", text: "Partial Mesh ist oft ein Kompromiss aus Redundanz und Kosten", isCorrect: true },
      { id: "d", text: "Point-to-Point erfordert immer mindestens drei Standorte", isCorrect: false },
    ],
    explanation:
      "Hub-and-Spoke ist in grossen Standortnetzen meist günstiger als Full Mesh. Partial Mesh verbindet kritische Knoten redundant und spart trotzdem Leitungen. Full Mesh maximiert Verbindungen und Kosten. Point-to-Point verbindet genau zwei Endpunkte.",
  },
  {
    id: "np-concepts-q22",
    type: "single-choice",
    text: "Welche Port-Zuordnung ist korrekt?",
    points: 10,
    answers: [
      { id: "a", text: "RDP - TCP 3389", isCorrect: true },
      { id: "b", text: "HTTPS - TCP 22", isCorrect: false },
      { id: "c", text: "NTP - UDP 69", isCorrect: false },
      { id: "d", text: "TFTP - UDP 161", isCorrect: false },
    ],
    explanation:
      "RDP nutzt TCP 3389. HTTPS ist TCP 443, NTP ist UDP 123 und TFTP ist UDP 69. Port-Mapping ist in Domain 1 ein zentraler Teil des klausurrelevanten Grundwissens.",
  },
  {
    id: "np-concepts-q23",
    type: "single-choice",
    text: "Wie viele nutzbare Hosts bietet ein /26-Netz?",
    points: 10,
    answers: [
      { id: "a", text: "14", isCorrect: false },
      { id: "b", text: "30", isCorrect: false },
      { id: "c", text: "62", isCorrect: true },
      { id: "d", text: "126", isCorrect: false },
    ],
    explanation:
      "Ein /26 hat 6 Host-Bits. 2^6 = 64 Gesamtadressen, davon 2 reserviert (Netzwerk und Broadcast). Es bleiben 62 nutzbare Hostadressen.",
  },
  {
    id: "np-concepts-q24",
    type: "single-choice",
    text: "Welche Beschreibung trifft am besten auf BiDi-Transceiver zu?",
    points: 10,
    answers: [
      { id: "a", text: "Benötigt immer zwei Fasern pro Linkrichtung", isCorrect: false },
      { id: "b", text: "Uebertraegt Senden und Empfangen auf derselben Faser ueber unterschiedliche Wellenlaengen", isCorrect: true },
      { id: "c", text: "Funktioniert nur mit Kupferkabeln (DAC)", isCorrect: false },
      { id: "d", text: "Ist ein reines Layer-3-Routing-Feature", isCorrect: false },
    ],
    explanation:
      "BiDi-Transceiver nutzen WDM, um TX und RX auf einer einzelnen Glasfaser mit unterschiedlichen Wellenlaengen zu fahren. Das spart Faserpaare, erfordert aber kompatible Gegenstellen.",
  },
  {
    id: "np-concepts-q25",
    type: "single-choice",
    text: "Ein Unternehmen moechte viele unterschiedlich grosse Teilnetze aus einem groesseren Netz effizient adressieren. Welches Konzept ist dafuer vorgesehen?",
    points: 10,
    answers: [
      { id: "a", text: "FLSM mit identischer Subnetzmaske fuer alle Teilnetze", isCorrect: false },
      { id: "b", text: "VLSM mit variablen Praefixlaengen je nach Hostbedarf", isCorrect: true },
      { id: "c", text: "APIPA fuer dynamische Segmentierung", isCorrect: false },
      { id: "d", text: "Loopback-Adressierung 127.0.0.0/8", isCorrect: false },
    ],
    explanation:
      "VLSM erlaubt unterschiedliche Subnetzgroessen innerhalb eines adressierten Blocks und reduziert Adressverschwendung. FLSM nutzt feste Masken fuer alle Segmente und ist weniger effizient bei heterogenen Hostanforderungen.",
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
    "netplus-media-transceivers",
    "netplus-topologies-architectures",
    "netplus-ipv4-subnetting",
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
  [CONCEPT_MEDIA_TRANSCEIVERS.id]: CONCEPT_MEDIA_TRANSCEIVERS,
  [CONCEPT_TOPOLOGIES_ARCHITECTURES.id]: CONCEPT_TOPOLOGIES_ARCHITECTURES,
  [CONCEPT_IPv4_SUBNETTING.id]: CONCEPT_IPv4_SUBNETTING,
};

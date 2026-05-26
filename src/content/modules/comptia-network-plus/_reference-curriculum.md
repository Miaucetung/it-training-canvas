# CompTIA Network+ N10-009 – Referenz-Curriculum

> **Zweck:** Konsolidierter Soll-Stand aller Lernziele für die CompTIA Network+ N10-009-Prüfung.  
> Jeder Eintrag trägt einen Blueprint-Tag (z.B. `[1.4]`).  
> Quelle: CompTIA Network+ N10-009 Exam Objectives Version 4.0 (Copyright © 2023 CompTIA, Inc.)
>
> **Letzte Aktualisierung:** Mai 2026 | **Blueprint-Version:** N10-009 (gültig ab 2024)

---

## Gewichtung der Prüfungsbereiche

| Section | Thema | Anteil | Mindest-Quiz | Mindest-Konzepte |
|---------|-------|--------|-------------|-----------------|
| 1.0 | Netzwerkkonzepte | 23% | 28 | 7 |
| 2.0 | Netzwerkimplementierung | 20% | 25 | 6 |
| 3.0 | Netzwerkbetrieb | 19% | 24 | 6 |
| 4.0 | Netzwerksicherheit | 14% | 18 | 5 |
| 5.0 | Netzwerkfehlerbehebung | 24% | 30 | 8 |

> Prüfungsdetails: max. 90 Fragen, 90 Minuten, Mehrfachauswahl + simulationsbasiert

---

## 1.0 Netzwerkkonzepte (23%)

### 1.1 OSI-Referenzmodell
`[1.1]` Konzepte im Zusammenhang mit dem OSI-Referenzmodell erklären:
- Schicht 1 – Bitübertragungsschicht (Physical)
- Schicht 2 – Datenverbindungsschicht (Data Link) — MAC-Adressen, Frames
- Schicht 3 – Vermittlungsschicht (Network) — IP-Adressen, Routing
- Schicht 4 – Transportschicht (Transport) — TCP, UDP, Ports
- Schicht 5 – Sitzungsschicht (Session)
- Schicht 6 – Darstellungsschicht (Presentation) — Verschlüsselung, Encoding
- Schicht 7 – Anwendungsschicht (Application) — HTTP, DNS, SMTP

---

### 1.2 Netzwerkgeräte, Anwendungen und Funktionen
`[1.2]` Folgende physische und virtuelle Geräte vergleichen und gegenüberstellen:
- **Router** — Layer-3-Weiterleitung, verbindet verschiedene Netze
- **Switch** — Layer-2, MAC-basierte Weiterleitung
- **Firewall** — Paketfilterung, Stateful Inspection, NGFW
- **IDS/IPS** — Intrusion Detection/Prevention System
- **Load Balancer** — Lastverteilung auf Server
- **Proxy** — Vermittler zwischen Client und Server (Forward/Reverse)
- **NAS (Network Attached Storage)** — Dateizugriff über Netzwerk
- **SAN (Storage Area Network)** — Highspeed-Speichernetzwerk
- **Wireless Access Point (AP)** — Drahtloser Zugangspunkt
- **Wireless Controller** — Zentrale Verwaltung von APs
- **CDN (Content Delivery Network)** — Vereinfachter Zugang zu Inhalten
- **VPN (Virtual Private Network)** — Gesicherte Verbindung über öffentliches Netz
- **QoS (Quality of Service)** — Priorisierung von Netzwerkverkehr
- **TTL (Time to live)** — Lebensdauer von Paketen

---

### 1.3 Cloud-Konzepte und Konnektivitätsoptionen
`[1.3]` Cloud-Konzepte und Konnektivitätsoptionen zusammenfassen:
- **NFV (Network Functions Virtualization)** — Netzwerkfunktionen als Software
- **VPC (Virtual Private Cloud)** — Isoliertes Cloud-Netzwerk
- Netzwerk-Sicherheitsgruppen und -listen
- Cloud-Gateways: Internet-Gateway, NAT-Gateway
- Cloud-Konnektivität: VPN, Direkte Verbindung
- Bereitstellungsmodelle: Öffentlich, Privat, Hybrid
- Service-Modelle: SaaS, IaaS, PaaS
- Skalierbarkeit, Anpassbarkeit, Mandantenfähigkeit

---

### 1.4 Ports, Protokolle, Dienste und Traffic-Typen
`[1.4]` Gängige Netzwerk-Ports, Protokolle, Dienste und Traffic-Typen erklären:

| Protokoll | Port(s) |
|-----------|---------|
| FTP | 20/21 |
| SFTP / SSH | 22 |
| Telnet | 23 |
| SMTP | 25 |
| DNS | 53 |
| DHCP | 67/68 |
| TFTP | 69 |
| HTTP | 80 |
| NTP | 123 |
| SNMP | 161/162 |
| LDAP | 389 |
| HTTPS | 443 |
| SMB | 445 |
| Syslog | 514 |
| SMTPS | 587 |
| LDAPS | 636 |
| SQL Server | 1433 |
| RDP | 3389 |
| SIP | 5060/5061 |

**IP-Typen:**
- ICMP, TCP, UDP, GRE, IPSec (AH, ESP, IKE)

**Traffic-Typen:**
- Unicast, Multicast, Anycast, Broadcast

---

### 1.5 Übertragungsmedien und Transceiver
`[1.5]` Übertragungsmedien und Transceiver vergleichen und gegenüberstellen:

**Wireless:**
- 802.11-Standards (Wi-Fi), Mobilfunk, Satellit

**Kabelgebunden:**
- 802.3-Standards (Ethernet)
- Single-Mode Fiber (SMF) — ein Lichtmodus, gelb, bis 100 km
- Multi-Mode Fiber (MMF) — mehrere Lichtmoden, orange/aqua, bis 550 m
- DAC (Direct Attach Copper) — Twinaxial-Kabel
- Koaxialkabel
- Kabel-Geschwindigkeiten, Plenum vs. Nicht-Plenum

**Transceiver:**
- Protokolle: Ethernet, Fibre Channel (FC)
- Formfaktoren: SFP (Small Form-Factor Pluggable), QSFP (Quad SFP)

**Steckertypen:**
- SC (Subscriber Connector), LC (Local Connector), ST (Straight Tip)
- MPO (Multi-Fiber Push On)
- RJ11, RJ45
- F-type, BNC (Bayonet Neill-Concelman)

---

### 1.6 Netzwerk-Topologien, -Architekturen und -Typen
`[1.6]` Netzwerk-Topologien, -Architekturen und -Typen vergleichen und gegenüberstellen:
- **Mesh** — Vollständig vermascht, hohe Redundanz
- **Hybrid** — Kombination mehrerer Topologien
- **Star / Hub-and-Spoke** — Zentraler Knoten, typisch für LANs
- **Spine and Leaf** — Datacenter-Topologie, niedrige Latenz
- **Punkt-zu-Punkt** — Direkte Verbindung zweier Geräte
- **Dreistufiges hierarchisches Modell:** Core → Distribution → Access
- **Collapsed Core** — Distribution und Core zusammengefasst (kleinere Unternehmen)
- Traffic-Flows: Nord-Süd (Client↔Server), Ost-West (Server↔Server, Datacenter)

---

### 1.7 IPv4-Netzwerk-Adressierung
`[1.7]` In einem gegebenen Szenario eine geeignete IPv4-Netzwerk-Adressierung verwenden:
- **Öffentliche vs. private Adressen**
  - APIPA (169.254.0.0/16) — Automatic Private IP Addressing
  - RFC 1918: Klasse A (10.x), Klasse B (172.16–31.x), Klasse C (192.168.x)
  - Loopback/Localhost: 127.0.0.1
- **Subnetze:**
  - VLSM (Variable Length Subnet Mask)
  - CIDR (Classless Inter-Domain Routing)
- **IPv4-Adressklassen:**
  - Klasse A, B, C (Unicast), Klasse D (Multicast), Klasse E (Reserviert)

---

### 1.8 Aufkommende Anwendungsfälle / moderne Netzwerkumgebungen
`[1.8]` Aufkommende Anwendungsfälle für moderne Netzwerkumgebungen zusammenfassen:
- **SDN / SD-WAN** — Anwendungsbewusst, Zero-Touch-Bereitstellung, transportagnostisch, zentrales Richtlinienmanagement
- **VXLAN** — Schicht-2-Verkapselung, Datacenter Interconnect (DCI)
- **Zero Trust Architecture (ZTA)** — Richtlinienbasierte Authentifizierung, Autorisierung, Least Privilege
- **SASE / SSE (Secure Access Service Edge / Security Service Edge)**
- **IaC (Infrastructure as Code)** — Automatisierung (Playbooks/Templates), Quellenkontrolle/Versionskontrolle, Branching
- **IPv6-Adressierung** — Adresserschöpfung abmildern, Tunneling, Dual Stack, NAT64

---

## 2.0 Netzwerkimplementierung (20%)

### 2.1 Routing-Technologien
`[2.1]` Merkmale von Routing-Technologien erklären:
- **Statisches Routing** — Manuell konfigurierte Routen
- **Dynamisches Routing:**
  - BGP (Border Gateway Protocol) — Inter-AS, Internet-Routing
  - EIGRP (Enhanced Interior Gateway Routing Protocol) — Cisco-proprietär
  - OSPF (Open Shortest Path First) — Link-State, offener Standard
- **Routenauswahl:** Administrative Distanz, Präfixlänge, Metrik
- **Address Translation:** NAT, PAT (Port Address Translation)
- **FHRP (First Hop Redundancy Protocol)** — HSRP, VRRP
- **VIP (Virtual IP)**
- **Sub-Interfaces** — Logische Schnittstellen auf physischer Interface

---

### 2.2 Switching-Technologien und -Funktionen
`[2.2]` In einem gegebenen Szenario Switching-Technologien und -Funktionen konfigurieren:
- **VLAN (Virtual Local Area Network)**
  - VLAN-Datenbank, SVI (Switch Virtual Interface)
- **Interface-Konfiguration:**
  - Natives VLAN, Voice VLAN
  - 802.1Q-Tagging (Trunk-Ports)
  - Link-Aggregation (LACP / 802.3ad)
  - Geschwindigkeit und Duplex
- **Spanning Tree (STP / RSTP)** — Loop-Vermeidung, Root Bridge, Port-Rollen/-Status
- **MTU (Maximum Transmission Unit)** — Standard 1518 Byte, Jumbo Frames (bis 9000 Byte)

---

### 2.3 Wireless-Geräte und -Technologien
`[2.3]` In einem gegebenen Szenario Wireless-Geräte und -Technologien auswählen und konfigurieren:
- **Kanäle:** Kanalbreite, nicht überlappende Kanäle, regulatorische Auswirkungen (802.11h)
- **Frequenzoptionen:** 2,4 GHz, 5 GHz, 6 GHz (Wi-Fi 6E), Bandsteuerung
- **SSID:**
  - BSSID (Basic Service Set Identifier)
  - ESSID (Extended Service Set Identifier)
- **Netzwerktypen:** Mesh, Ad hoc, Punkt-zu-Punkt, Infrastruktur
- **Verschlüsselung:** WPA2, WPA3
- **Gastnetzwerke** — Captive Portale
- **Authentifizierung:** PSK vs. Enterprise (802.1X)
- **Antennen:** Omnidirektional vs. direktional
- **AP-Typen:** Autonomous vs. Lightweight Access Point

---

### 2.4 Physische Installationen
`[2.4]` Wichtige Faktoren physischer Installationen erklären:
- **Installationsorte:**
  - IDF (Intermediate Distribution Frame), MDF (Main Distribution Frame)
  - Rack-Größe, Port-seitige Ein-/Auslässe
- **Verkabelung:** Patchfeld (Copper + Glasfaser-Patchfeld)
- **Sicherheit:** Abschließbare Schränke
- **Stromversorgung:** USV (Unterbrechungsfreie Stromversorgung), PDU (Power Distribution Unit), Leistungsaufnahme, Spannung
- **Umweltfaktoren:** Feuchtigkeit, Brandschutz, Temperatur

---

## 3.0 Netzwerkbetrieb (19%)

### 3.1 Organisatorische Prozesse und Verfahren
`[3.1]` Den Zweck organisatorischer Prozesse und Verfahren erläutern:
- **Dokumentation:**
  - Physikalische vs. logische Diagramme
  - Rack-Diagramme, Kabelpläne
  - Netzwerkdiagramme (Schicht 1/2/3)
  - Asset-Bestand (Hardware, Software, Lizensierung, Garantie)
  - IPAM (IP Address Management)
  - SLA (Service-Level-Agreement)
  - Wireless-Vermessung / Heatmap
- **Lebenszyklusmanagement:** EOL (End-of-Life), EOS (End-of-Support), Patches/OS/Firmware, Außerbetriebnahme
- **Change-Management** — Prozessverfolgung, Serviceanfragen
- **Konfigurationsmanagement** — Produktions-, Backup-, Baseline-Konfiguration (Golden Config)

---

### 3.2 Netzwerk-Überwachungstechnologien
`[3.2]` In einem gegebenen Szenario Netzwerk-Überwachungstechnologien einsetzen:
- **Methoden:**
  - SNMP (v2c, v3) — Traps, MIB, Community-Strings, Authentifizierung
  - Flow-Daten (NetFlow, sFlow)
  - Paketerfassung (Packet Capture)
  - Baseline-Kennzahlen — Alarmierung bei Anomalien
  - Protokoll-Aggregation: Syslog-Collector, SIEM
  - API-Integration
  - Portspiegelung (Port Mirroring / SPAN)
- **Lösungen:**
  - Netzwerkerkennung (Ad hoc / geplant)
  - Traffic-Analyse, Leistungsüberwachung, Verfügbarkeitsüberwachung, Konfigurationsüberwachung

---

### 3.3 Disaster Recovery (DR)
`[3.3]` Konzepte der Notfallwiederherstellung erklären:
- **DR-Kennzahlen:**
  - RPO (Recovery Point Objective) — maximaler Datenverlust
  - RTO (Recovery Time Objective) — maximale Ausfallzeit
  - MTTR (Mean Time to Repair)
  - MTBF (Mean Time Between Failure)
- **DR-Sites:** Cold Site, Warm Site, Hot Site
- **Hohe Verfügbarkeit:** Aktiv-Aktiv, Aktiv-Passiv
- **Tests:** Tabletop-Übungen, Validierungstests

---

### 3.4 IPv4- und IPv6-Netzwerkdienste
`[3.4]` In einem gegebenen Szenario IPv4- und IPv6-Netzwerkdienste implementieren:
- **Dynamische Adressierung:**
  - DHCP — Reservierungen, Bereiche, Lease-Time, Optionen, Relay/IP Helper, Exklusionen
  - SLAAC (Stateless Address Autoconfiguration) — IPv6
- **Namensauflösung (DNS):**
  - DNSSEC, DNS over HTTPS (DoH), DNS over TLS (DoT)
  - Record-Typen: A, AAAA, CNAME, MX, TXT, NS, PTR
  - Zonen-Typen: Forward, Reverse
  - Autoritativ vs. nicht autoritativ, Primär vs. Sekundär, Rekursiv
  - Hosts-Datei
- **Zeitprotokolle:** NTP, PTP (Precision Time Protocol), NTS (Network Time Security)

---

### 3.5 Netzwerkzugriff und -verwaltung
`[3.5]` Methoden des Netzwerkzugriffs und der Netzwerkverwaltung vergleichen und gegenüberstellen:
- **VPN:**
  - Site-to-Site-VPN
  - Client-to-Site-VPN (ohne Client / clientbasiert)
  - Split Tunnel vs. Full Tunnel
- **Verbindungsmethoden:** SSH, GUI, API, Konsole
- **Jump-Box / Bastion Host**
- **In-Band- vs. Out-of-Band-Verwaltung**

---

## 4.0 Netzwerksicherheit (14%)

### 4.1 Grundlegende Netzwerk-Sicherheitskonzepte
`[4.1]` Die Bedeutung grundlegender Netzwerk-Sicherheitskonzepte erklären:
- **Logische Sicherheit:**
  - Verschlüsselung (Data in Transit, Data at Rest)
  - Zertifikate, PKI, selbstsignierte Zertifikate
  - IAM — Authentifizierung: MFA, SSO, RADIUS, LDAP, SAML, TACACS+, zeitbasierte Authentifizierung
  - Autorisierung: Least Privilege, regelbasierte Zugriffskontrolle
  - Geofencing
- **Physische Sicherheit:** Kameras, Schlösser
- **Täuschungstechnologien:** Honeypot, Honeynet
- **Allgemeine Sicherheitsterminologie:** Risiko, Schwachstelle, Exploit, Bedrohung, CIA-Triade (Confidentiality, Integrity, Availability)
- **Audits und Compliance:** Datenstandort, PCI DSS, DSGVO (GDPR)
- **Netzsegmentierung:** IoT/IIoT, SCADA/ICS/OT, Gast-VLAN, BYOD

---

### 4.2 Angriffstypen und ihre Auswirkungen
`[4.2]` Verschiedene Angriffstypen und ihre Auswirkungen auf das Netzwerk zusammenfassen:
- DoS / DDoS
- VLAN-Hopping
- MAC-Flooding
- ARP-Poisoning / ARP-Spoofing
- DNS-Poisoning / DNS-Spoofing
- Rogue Devices: DHCP-Server, Rogue AP
- Evil Twin (gefälschter AP)
- On-Path-Angriff (Man-in-the-Middle)
- Social Engineering: Phishing, Dumpster Diving, Shoulder Surfing, Tailgating
- Malware

---

### 4.3 Netzwerksicherheitsfunktionen und -maßnahmen
`[4.3]` In einem gegebenen Szenario Netzwerksicherheitsfunktionen, Sicherheitsmaßnahmen und Lösungen anwenden:
- **Geräte härten:** Ungenutzte Ports/Dienste deaktivieren, Standardpasswörter ändern
- **NAC (Network Access Control):** Port-Sicherheit, 802.1X, MAC-Filter
- **Schlüssel-Verwaltung**
- **Sicherheitsregeln:** ACL (Access Control List), URL-Filterung, Inhaltsfilterung
- **Zonen:** Vertrauenswürdig vs. nicht vertrauenswürdig, DMZ (Sicherheitsüberwachtes Subnetz)

---

## 5.0 Netzwerkfehlerbehebung (24%)

### 5.1 Fehlerbehebungs-Methodik
`[5.1]` Die Methodik der Fehlerbehebung erklären:
1. **Problem identifizieren** — Informationen sammeln, Nutzer befragen, Symptome erkennen, Veränderungen feststellen, Problem reproduzieren, mehrere Probleme einzeln angehen
2. **Theorie über wahrscheinliche Ursache aufstellen** — Offensichtliches hinterfragen, mehrere Herangehensweisen: Top-to-Bottom / Bottom-to-Top OSI-Modell, Teile-und-herrsche
3. **Theorie testen** — Bei Bestätigung: Lösungsschritte; bei Widerlegung: neue Theorie / eskalieren
4. **Aktionsplan aufstellen** — Mögliche Auswirkungen bestimmen
5. **Lösung umsetzen** — oder eskalieren
6. **Systemfunktionalität prüfen** — Präventive Maßnahmen ergreifen
7. **Dokumentieren** — Erkenntnisse, Aktionen, Ergebnisse, Lessons Learned

---

### 5.2 Kabelprobleme und physische Schnittstellenprobleme
`[5.2]` In einem gegebenen Szenario gängige Probleme mit der Verkabelung und der physischen Schnittstelle beheben:
- **Kabelprobleme:**
  - Falsches Kabel (SMF vs. MMF, Kategorie 5/6/7/8, STP vs. UTP)
  - Signaldegradation: Überlagerung (Crosstalk), Interferenz, Abschwächung (Attenuation)
  - Unsachgemäße Terminierung
  - TX/RX vertauscht
- **Schnittstellenprobleme:**
  - Erhöhte Zähler: CRC, Runts (<64 Byte), Giants (>1518 Byte), Drops
  - Port-Status: Error Disabled, Administrativ Disabled, Suspended
- **Hardwareprobleme:**
  - PoE: Leistungsbudget überschritten, falscher Standard
  - Transceiver: Mismatch, Signalstärke

---

### 5.3 Allgemeine Netzwerkdienstprobleme
`[5.3]` In einem gegebenen Szenario allgemeine Probleme mit Netzwerkdiensten beheben:
- **Switching-Probleme:**
  - STP: Netzwerk-Loops, Root-Bridge-Auswahl, Port-Rollen/-Status
  - Falsche VLAN-Zuweisung
  - ACL-Fehler
- **Routing-Probleme:**
  - Routing-Tabelle prüfen, Standardrouten
- **Adressierungsprobleme:**
  - IP-Adresserschöpfung
  - Falscher Standard-Gateway
  - Falsche IP-Adresse / doppelte IP-Adresse
  - Falsche Subnetzmaske

---

### 5.4 Performance-Probleme
`[5.4]` In einem gegebenen Szenario gängige Performance-Probleme beheben:
- Datenstau / Bottleneck, Engpässe
- Bandbreite / Durchsatzleistung
- Latenz
- Paketverlust
- Jitter
- **Wireless:**
  - Interferenz / Kanalüberlappung
  - Signalverschlechterung oder -verlust
  - Unzureichende Funkabdeckung
  - Abgrenzungsprobleme (Roaming-Übergabe)
  - Falsche Roaming-Konfiguration

---

### 5.5 Tools und Protokolle zur Netzwerkfehlerbehebung
`[5.5]` In einem gegebenen Szenario das passende Tool oder Protokoll zur Lösung von Netzwerkfehlern anwenden:

**Software-Tools:**
- Protokoll-Analysator (Wireshark)
- **Kommandozeile:** `ping`, `traceroute`/`tracert`, `nslookup`, `tcpdump`, `dig`, `netstat`, `ip`/`ifconfig`/`ipconfig`, `arp`, `nmap`
- LLDP (Link Layer Discovery Protocol) / CDP (Cisco Discovery Protocol)
- Geschwindigkeitstester

**Hardware-Tools:**
- Toner (Kabelsuche), Kabeltester, Network TAP (Test Access Point)
- Wi-Fi-Analysator, Visuelle Fehlersuche (Optical Power Meter)

**Grundlegende Befehle für Netzwerkgeräte:**
- MAC-Adresstabelle anzeigen (`show mac address-table`)
- Route anzeigen (`show ip route`)
- Schnittstelle anzeigen (`show interfaces`)
- Konfiguration anzeigen (`show running-config`)
- ARP anzeigen (`show arp`)
- VLAN anzeigen (`show vlan brief`)
- Leistung anzeigen (`show processes cpu`)

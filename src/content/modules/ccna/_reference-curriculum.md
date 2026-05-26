# CCNA 200-301 v1.1 – Referenz-Curriculum

> **Zweck:** Konsolidierter Soll-Stand aller Lernziele für die CCNA 200-301 v1.1-Prüfung.  
> Jeder Eintrag trägt einen Cisco-Blueprint-Tag (z.B. `[1.6]`).  
> Priorität der Quellen: Cisco-Blueprint > Wendell Odom OCG Vol. 1 & 2 > Jeremy's IT Lab > Boson ExSim.
>
> **Letzte Aktualisierung:** Mai 2026 | **Blueprint-Version:** 200-301 v1.1 (gültig ab August 2024)

---

## Gewichtung der Prüfungsbereiche

| Section | Thema | Anteil | Mindest-Quiz | Mindest-Konzepte |
|---------|-------|--------|-------------|-----------------|
| 1.0 | Network Fundamentals | 20% | 25 | 6 |
| 2.0 | Network Access | 20% | 25 | 6 |
| 3.0 | IP Connectivity | 25% | 30 | 8 |
| 4.0 | IP Services | 10% | 15 | 4 |
| 5.0 | Security Fundamentals | 15% | 20 | 6 |
| 6.0 | Automation and Programmability | 10% | 15 | 4 |

---

## 1.0 Network Fundamentals (20%)

### 1.1 Netzwerkkomponenten
`[1.1]` Rolle und Funktion der folgenden Komponenten erklären:
- Router (Layer 3, IP-basierte Weiterleitung)
- Layer-2-Switch (MAC-basierte Weiterleitung)
- Layer-3-Switch (Inter-VLAN-Routing, kombiniert Switch + Router)
- Next-Generation Firewall (NGFW) und IPS (Intrusion Prevention System)
- Access Point (AP) — Autonomous und Lightweight
- Wireless LAN Controller (WLC)
- Cisco DNA Center (Controller-basiertes Management)
- Endpoints (PCs, Drucker, IP-Telefone)
- Server
- PoE-fähige Geräte (Switches, Injektoren)

**Odom-Referenz:** Vol. 1 / Part I / Ch. 1–2  
**Jeremy's IT Lab:** Day 1–2

---

### 1.2 Netzwerk-Topologie-Architekturen
`[1.2]` Eigenschaften folgender Architekturen beschreiben:
- **2-Tier (Collapsed Core):** Access + Distribution/Core fusioniert — für kleinere Unternehmen
- **3-Tier:** Access → Distribution → Core — skalierbar für Enterprise
- **Spine-Leaf:** Datacenter-Topologie, vollständig vermascht zwischen Ebenen, niedrige Latenz
- **WAN:** Weitverkehrsverbindungen (MPLS, SD-WAN, Internet-VPN)
- **SOHO (Small Office / Home Office):** Router/AP kombiniert, PAT, kein Hierarchie-Modell
- **On-Premises vs. Cloud:** Eigene Infrastruktur vs. IaaS/PaaS/SaaS

**Odom-Referenz:** Vol. 1 / Part I / Ch. 3  
**Prüfungs-Fallstrick:** Spine-Leaf ist *kein* hierarchisches 3-Tier-Modell — andere Terminologie, anderer Use Case (DC).

---

### 1.3 Physische Schnittstellen & Kabeltypen
`[1.3]` Folgende Kabeltypen und Konzepte unterscheiden:
- **Single-Mode Fiber (SMF):** Ein Lichtmodus, gelbes Kabel, bis 100 km, teurer
- **Multi-Mode Fiber (MMF):** Mehrere Lichtmoden, orange/aqua, bis 550 m (OM3/OM4)
- **Kupfer UTP:** Cat5e (1 Gbit/s), Cat6 (10 Gbit/s bis 55 m), Cat6A (10 Gbit/s bis 100 m)
- **Shared Media vs. Point-to-Point Ethernet**
- **PoE (Power over Ethernet):** PoE (802.3af, 15,4 W), PoE+ (802.3at, 30 W), PoE++ (802.3bt, 60/100 W)
- Cisco SFP-Transceiver-Typen (1000BASE-T, 1000BASE-SX, 1000BASE-LX)

**Odom-Referenz:** Vol. 1 / Part I / Ch. 2  

---

### 1.4 Schnittstellenfehler & Kabelprobleme
`[1.4]` Folgende Probleme identifizieren und interpretieren:
- **Kollisionen / Late Collisions** (Duplex-Mismatch)
- **CRC-Fehler** (physische Schicht, schlechtes Kabel)
- **Input/Output Errors** in `show interfaces`
- **Speed/Duplex Mismatch:** Auto-Negotiation-Verhalten verstehen
- **Runts und Giants:** Frames unter 64 Byte bzw. über 1518 Byte

---

### 1.5 TCP vs. UDP
`[1.5]` TCP und UDP vergleichen:

| Merkmal | TCP | UDP |
|---------|-----|-----|
| Verbindung | Connection-oriented (3-Way Handshake) | Connectionless |
| Zuverlässigkeit | Guaranteed delivery (ACK) | Best Effort |
| Reihenfolge | Sequenznummern | Keine Garantie |
| Flow Control | Sliding Window | Kein Flow Control |
| Overhead | Hoch | Gering |
| Anwendungen | HTTP, FTP, SSH, SMTP, Telnet | DNS, DHCP, TFTP, SNMP, VoIP, Video |

**Prüfungs-Fallstrick:** DNS verwendet standardmäßig UDP/53 — aber bei Zonetransfers TCP/53.

---

### 1.6 IPv4-Adressierung und Subnetting
`[1.6]` IPv4-Adressen konfigurieren und verifizieren:
- Binär-/Dezimal-Konvertierung
- Subnetzmaske, CIDR-Notation, Wildcard-Mask
- Subnetting: Anzahl Subnetze, Hosts pro Subnetz, Netz-/Broadcast-Adresse
- VLSM (Variable Length Subnet Masking)
- Subnetting-Kurzverfahren (Block-Size-Methode)

**Odom-Referenz:** Vol. 1 / Part II / Ch. 7–9  

---

### 1.7 Private IPv4-Adressen
`[1.7]` Notwendigkeit privater Adressbereiche erklären (RFC 1918):
- 10.0.0.0/8 | 172.16.0.0/12 | 192.168.0.0/16
- NAT als Mechanismus zur Verbindung mit öffentlichem Internet
- APIPA (169.254.0.0/16) — Automatic Private IP Addressing

---

### 1.8 IPv6-Adressierung konfigurieren und verifizieren
`[1.8]` IPv6-Grundlagen:
- 128-Bit-Adressen, Hexadezimal, 8 Gruppen zu je 16 Bit
- Abkürzungsregeln: führende Nullen, `::` für aufeinanderfolgende Null-Gruppen
- Global Unicast Address (GUA): 2000::/3
- Link-Local Address (LLA): FE80::/10 (automatisch generiert)
- Präfix-Delegation: ISP vergibt /48 oder /56, Kunde nutzt /64 pro Subnetz
- IPv6-Konfiguration: `ipv6 unicast-routing`, `ipv6 address`

---

### 1.9 IPv6-Adresstypen
`[1.9]` Alle IPv6-Adresstypen erklären:
- **Global Unicast (GUA):** 2000::/3 — öffentlich routbar
- **Unique Local (ULA):** FC00::/7 — privat, nicht global routbar (wie RFC 1918)
- **Link-Local:** FE80::/10 — nur lokales Segment, immer vorhanden
- **Loopback:** ::1/128 — wie 127.0.0.1
- **Unspecified:** ::/128 — noch keine Adresse zugewiesen
- **Multicast:** FF00::/8 — wichtige Gruppen: FF02::1 (all nodes), FF02::2 (all routers), FF02::5 (OSPF routers), FF02::6 (OSPF DR/BDR)
- **Anycast:** Gleiche Adresse auf mehreren Interfaces — nächstgelegenes Gerät antwortet
- **Modified EUI-64:** Interface-ID aus MAC-Adresse ableiten (FF:FE einfügen, 7. Bit invertieren)
- **NDP (Neighbor Discovery Protocol):** Ersetzt ARP in IPv6 — RS/RA/NS/NA-Nachrichten
- **SLAAC vs. DHCPv6:** Stateless vs. Stateful-Konfiguration

**Prüfungs-Fallstrick:** Anycast hat keinen eigenen Präfix — es ist eine normale GUA-Adresse, die mehreren Interfaces zugewiesen wird.

---

### 1.10 IP-Parameter Client-OS prüfen
`[1.10]` IP-Konfiguration auf verschiedenen Betriebssystemen verifizieren:
- **Windows:** `ipconfig /all`, `ipconfig /release`, `ipconfig /renew`, `ipconfig /flushdns`
- **macOS/Linux:** `ip address`, `ip route`, `ifconfig`, `nmcli`
- Relevante Ausgabewerte: IP, Maske, Gateway, DNS, DHCP-Server, MAC

---

### 1.11 Wireless-Grundprinzipien
`[1.11]` Drahtlose Konzepte verstehen:
- **Nicht-überlappende Kanäle:** 2.4 GHz → Kanäle 1, 6, 11 (drei nicht-überlappend)
- **5 GHz:** Viele nicht-überlappende Kanäle (UNII-1 bis UNII-3)
- **SSID:** Netzwerkname (bis 32 Zeichen)
- **RF (Radio Frequency):** RSSI, SNR, Interferenz-Quellen
- **CSMA/CA** mit RTS/CTS für versteckte Knoten
- **Verschlüsselung:** WEP (unsicher) → WPA → WPA2 (AES-CCMP) → WPA3 (SAE)

---

### 1.12 Virtualisierungsgrundlagen
`[1.12]` *(v1.1 — verstärkter Blueprint-Fokus)*
- **Server-Virtualisierung:** Hypervisor Typ 1 (bare-metal: ESXi, Hyper-V) vs. Typ 2 (hosted: VirtualBox)
- **VMs vs. Container:** Unterschied in Isolation, Overhead, Startup-Zeit (Docker, Kubernetes)
- **VRF (Virtual Routing and Forwarding):** Mehrere unabhängige Routing-Tabellen auf einem Router
- **Virtual Switching:** VMware vSwitch, Cisco Nexus 1000V
- **Network Function Virtualization (NFV):** Netzwerkfunktionen (Firewall, Router) als VMs

**Status im Repo:** ❌ MISSING — muss neu angelegt werden

---

### 1.13 Switching-Grundkonzepte
`[1.13]` MAC-Adress-Lernprozess eines Switches:
- **MAC Learning:** Switch lernt Source-MAC beim Eingang von Frames
- **MAC Aging:** Standardmäßig 300 Sek. — danach wird Eintrag aus CAM-Table gelöscht
- **Frame Flooding:** Unbekannte Unicast, Broadcast und Multicast werden an alle Ports gesendet
- **MAC-Address-Table:** `show mac address-table`
- **VLAN-Zugehörigkeit** beeinflusst Flooding-Domain

---

## 2.0 Network Access (20%)

### 2.1 VLANs konfigurieren und verifizieren
`[2.1]` VLANs im normalen Bereich (1–1005) über mehrere Switches:
- **Access Ports:** Daten-VLAN, Voice-VLAN (802.1p/Q mit `switchport voice vlan`)
- **Default VLAN:** VLAN 1 (Management-VLAN 1 sollte geändert werden!)
- **Inter-VLAN Connectivity:** Router-on-a-Stick (ROAS), Layer-3-Switch mit SVIs
- Konfiguration: `vlan <id>`, `name`, `switchport mode access`, `switchport access vlan`

---

### 2.2 Interswitch Connectivity
`[2.2]` Trunk-Ports und 802.1Q:
- **Trunk Port:** Trägt mehrere VLANs zwischen Switches/Router
- **802.1Q-Tag:** 4-Byte-Tag im Ethernet-Frame (VLAN-ID, 12 Bit = 4094 VLANs)
- **Native VLAN:** Frames ohne Tag auf Trunk — Default VLAN 1 (Sicherheitsrisiko → ändern!)
- **Allowed VLANs:** `switchport trunk allowed vlan`
- **DTP (Dynamic Trunking Protocol):** Cisco-proprietär — sollte deaktiviert werden (`nonegotiate`)

---

### 2.3 Layer-2-Discovery-Protokolle
`[2.3]` CDP und LLDP konfigurieren und verifizieren:
- **CDP (Cisco Discovery Protocol):** Cisco-proprietär, Layer 2, alle 60 Sek.
- **LLDP (Link Layer Discovery Protocol):** IEEE 802.1AB, herstellerunabhängig
- Verifikation: `show cdp neighbors detail`, `show lldp neighbors detail`
- Sicherheit: CDP/LLDP auf User-Ports deaktivieren

---

### 2.4 EtherChannel konfigurieren und verifizieren
`[2.4]` Layer-2 und Layer-3 EtherChannel (IEEE 802.3ad / LACP):
- **LACP (802.3ad):** IEEE-Standard, aktiv/passiv Modi
- **PAgP (Port Aggregation Protocol):** Cisco-proprietär, desirable/auto Modi
- **Static (on/on):** Kein Protokoll — beide Seiten müssen `on` sein
- Lastverteilung: `port-channel load-balance` (src-mac, dst-mac, src-dst-ip)
- Verifikation: `show etherchannel summary`, `show etherchannel port-channel`
- **Voraussetzungen:** Gleiche Speed, Duplex, VLAN-Konfiguration, Native VLAN

---

### 2.5 Spanning Tree Protocol (STP / RSTP)
`[2.5]` Rapid PVST+ Spanning Tree Protocol interpretieren:
- **Root Bridge:** Niedrigste Bridge-ID (Priority + MAC) — Standard-Priority 32768
- **Root Port (RP):** Bester Pfad zur Root Bridge (niedrigste Kosten)
- **Designated Port (DP):** Bester Port pro Segment zur Root Bridge
- **Alternate / Backup Port (RSTP):** Blockierend, aber schnell konvergierend
- **Port-States (STP):** Blocking → Listening → Learning → Forwarding → Disabled
- **Port-States (RSTP):** Discarding → Learning → Forwarding (kein Listening!)
- **PortFast:** Sofort Forwarding auf Access Ports — kein Listening/Learning
- **BPDU Guard:** Schaltet Port ab bei eingehendem BPDU auf PortFast-Port
- **BPDU Filter:** Unterdrückt BPDUs (Vorsicht: kann Loops verursachen)
- **STP-Kosten:** 1 Gbit/s = 4, 100 Mbit/s = 19, 10 Mbit/s = 100
- **PVST+:** Per-VLAN STP — jedes VLAN hat eigene Topology
- **Rapid PVST+:** RSTP pro VLAN (Standard bei modernen Cisco-Switches)

**Status im Repo:** ⚠️ THIN — kein dediziertes Quiz (ccna-quiz-stp fehlt)  
**Odom-Referenz:** Vol. 1 / Part II / Ch. 9–10  

---

### 2.6 Cisco Wireless-Architekturen und AP-Modi
`[2.6]` Wireless LAN-Architekturen:
- **Autonomer AP:** Komplette Konfiguration lokal, kein WLC — verwaltet mit Cisco Prime
- **Lightweight AP (LWAP):** Konfiguration zentral über WLC, CAPWAP-Tunnel
- **Cloud-Based AP:** Cisco Meraki — Management über Cloud-Dashboard
- **AP-Modi:** Local (default), FlexConnect, Monitor, Sniffer, Rogue Detector, SE-Connect
- **Split-MAC-Architektur:** Echtzeitfunktionen im AP (Beacon, Probe, ACK), Management im WLC
- **CAPWAP:** UDP 5246 (Control), UDP 5247 (Data) — verschlüsselt mit DTLS

---

### 2.7 Physische WLAN-Infrastruktur
`[2.7]` Physische Verbindungen von WLAN-Komponenten:
- AP verbunden mit Access-Switch (Access Port im VLAN oder Trunk)
- WLC verbunden mit Distribution-Switch (Trunk für alle WLAN-VLANs)
- **LAG (Link Aggregation Group):** WLC nutzt LAG für Redundanz zum Switch
- **VLAN-Tagging im Wireless:** Management-VLAN, SSID-VLANs auf Trunk

---

### 2.8 AP und WLC Management-Zugriff
`[2.8]` Verwaltungszugriff auf Wireless-Infrastruktur:
- **WLC-Zugangswege:** HTTP (unsicher), HTTPS, Telnet (unsicher), SSH, Console
- **TACACS+ vs. RADIUS für WLC:** RADIUS für WLAN-Client-Auth, TACACS+ für Admin-Zugriff
- **AP-Management:** WLC managed APs automatisch nach CAPWAP-Join
- **Out-of-Band Management** via dediziertem Service Port des WLC

---

### 2.9 WLAN-GUI-Konfiguration
`[2.9]` Cisco WLC GUI interpretieren:
- SSID/WLAN-Konfiguration: Security Policy, QoS-Profil (Platinum/Gold/Silver/Bronze)
- **WPA2-PSK vs. WPA2-Enterprise** im GUI auswählen
- RADIUS-Server in WLC AAA-Konfiguration hinterlegen
- Advanced Settings: Client Band Select, Load Balancing, 802.11r Fast Transition

---

## 3.0 IP Connectivity (25%)

### 3.1 Routing-Tabelle interpretieren
`[3.1]` Komponenten der Routing-Tabelle:
- **Routing-Protocol-Code:** C (Connected), S (Static), O (OSPF), R (RIP), B (BGP), D (EIGRP)
- **Prefix/Network Mask:** Zieladresse in CIDR
- **Next Hop:** IP des nächsten Routers
- **Administrative Distance (AD):** Connected=0, Static=1, EIGRP=90, OSPF=110, RIP=120, iBGP=200
- **Metric:** Protokollspezifischer Kostenwert
- **Gateway of Last Resort:** Default Route (0.0.0.0/0)
- **Varianz:** `show ip route` Ausgabe lesen und interpretieren

---

### 3.2 Router-Weiterleitungsentscheidung
`[3.2]` Wie trifft ein Router eine Weiterleitungsentscheidung:
1. **Longest Prefix Match:** Spezifischste Route gewinnt (z.B. /28 vor /24)
2. **Administrative Distance:** Niedrigste AD gewinnt bei gleicher Präfixlänge
3. **Metric:** Niedrigste Metric beim gleichen Protokoll gewinnt
4. **Equal-Cost Load Balancing:** OSPF und EIGRP unterstützen mehrere gleiche Routen

---

### 3.3 Statisches Routing IPv4 und IPv6
`[3.3]` Statische Routen konfigurieren und verifizieren:
- **Default Route:** `ip route 0.0.0.0 0.0.0.0 <next-hop>` | `ipv6 route ::/0 <next-hop>`
- **Network Route:** Ziel-Netz und Maske angeben
- **Host Route:** /32 (IPv4) oder /128 (IPv6)
- **Floating Static Route:** Höhere AD als dynamisches Protokoll → Backup-Route
- **IPv6 Static Routes:** `ipv6 route <prefix/len> <next-hop | interface>`
- **Recursive Lookup:** Next-Hop-Adresse muss in Routing-Tabelle auflösbar sein

---

### 3.4 OSPFv2 Single-Area konfigurieren und verifizieren
`[3.4]` OSPF in Area 0:
- **Neighbor Adjacency:** Hello/Dead Timer, gleiche Area-ID, Subnetz, MTU, Authentifizierung
- **OSPF Hello-Timer:** Standard 10 Sek. (P2P), 10 Sek. (Broadcast) | Dead Timer: 4× Hello
- **DR/BDR-Wahl (Broadcast-Netzwerke):** Höchste Priority (Standard 1) → Router-ID → höchste IP
- **Router-ID:** Höchste Loopback-IP → Höchste physische Interface-IP → manuell `router-id`
- **OSPF-Kosten:** 100 Mbit/s Referenzbandbreite / Interface-Bandbreite (Standard: 1 Gbit/s = 1)
- **LSA-Typen:** Type 1 (Router-LSA), Type 2 (Network-LSA, vom DR), Type 3 (Summary-LSA vom ABR)
- **OSPF-Netzwerktypen:** Broadcast (DR/BDR), Point-to-Point (kein DR/BDR), NBMA
- **Neighbor-States:** Down → Init → 2-Way → Exstart → Exchange → Loading → Full
- **Verifikation:** `show ip ospf neighbor`, `show ip ospf interface`, `show ip route ospf`
- **Passive Interface:** `passive-interface <int>` — kein Hello, Route wird annonciert
- **`network` Statement vs. `ip ospf <process> area <id>`** auf Interface-Ebene

**Odom-Referenz:** Vol. 1 / Part IV / Ch. 19–21  
**Prüfungs-Fallstrick:** OSPF wählt nicht zwingend den schnellsten Link — die Cost-Berechnung basiert auf der Referenzbandbreite (Standard 100 Mbit/s). 1-Gbit/s-Link hat Cost 1, 100-Mbit/s-Link auch Cost 1 → `auto-cost reference-bandwidth` anpassen!

---

### 3.5 First Hop Redundancy Protocols (FHRP)
`[3.5]` FHRP-Konzepte und Konfiguration:
- **HSRP (Hot Standby Router Protocol):** Cisco-proprietär, virtuelle IP/MAC, Active/Standby
- **VRRP (Virtual Router Redundancy Protocol):** IEEE-Standard (RFC 5798), Master/Backup
- **GLBP (Gateway Load Balancing Protocol):** Cisco, Lastverteilung über mehrere Gateways
- **Preemption:** Neuerer Active-Router kann Rolle zurückkehren
- Verifikation: `show standby`, `show vrrp`, `show glbp`

---

## 4.0 IP Services (10%)

### 4.1 NAT (Inside Source NAT)
`[4.1]` Static NAT und NAT-Pools:
- **Static NAT:** 1:1-Mapping (Server-Publishing)
- **Dynamic NAT:** Pool privater → Pool öffentlicher Adressen
- **PAT (Port Address Translation) / NAT Overload:** Viele private → eine öffentliche IP (via Port)
- Konfiguration: `ip nat inside`, `ip nat outside`, `ip nat inside source`
- Verifikation: `show ip nat translations`, `show ip nat statistics`

---

### 4.2 NTP (Network Time Protocol)
`[4.2]` NTP-Client und -Server:
- **Stratum:** 0 = Atomuhr, 1 = NTP-Server mit Stratum-0-Quelle, 2 = NTP-Client von Stratum-1
- **Cisco als NTP-Client:** `ntp server <IP>`
- **Cisco als NTP-Server:** `ntp master <stratum>`
- Verifikation: `show ntp associations`, `show ntp status`
- **NTP-Sicherheit:** NTP Authentication mit MD5

---

### 4.3 DHCP und DNS
`[4.3]` DHCP- und DNS-Rolle im Netzwerk:
- **DHCP-Prozess:** DORA (Discover → Offer → Request → Acknowledge)
- **DHCP-Lease, IP-Helper-Address** für Relay über Router-Grenzen
- **DNS-Hierarchie:** Root → TLD → Authoritative → Resolver
- **DNS-Record-Typen:** A (IPv4), AAAA (IPv6), MX (Mail), CNAME (Alias), PTR (Reverse)
- **DNS-Auflösung:** Recursive vs. Iterative Query

---

### 4.4 SNMP
`[4.4]` SNMP in Netzwerkoperationen:
- **Versionen:** SNMPv1 (Community Strings, unsicher) → SNMPv2c (bulk-reads) → SNMPv3 (Auth + Encrypt)
- **Manager / Agent / MIB:** NMS fragt Agent, der MIB-Objekte zurückgibt
- **OID (Object Identifier):** Eindeutige Nummer für jeden MIB-Eintrag
- **SNMP-Operationen:** GET, GET-NEXT, SET, TRAP (asynchron), INFORM
- **Ports:** UDP 161 (Agent), UDP 162 (Trap/Inform an Manager)
- **SNMPv3-Security:** noAuthNoPriv / authNoPriv / authPriv (MD5/SHA + AES/3DES)

---

### 4.5 Syslog
`[4.5]` Syslog-Features:
- **Severity-Level:** 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notice, 6=Info, 7=Debug
- **Merksatz:** "Every Awesome Cisco Engineer Will Need Daily Inspiration"
- **Syslog-Ziele:** Console (Level 7), VTY (Level 7), Buffer (intern), External Syslog Server
- Konfiguration: `logging host <IP>`, `logging trap <level>`
- **Zeitstempel:** Wichtig für Korrelation → NTP synchronisieren!

---

### 4.6 DHCP-Client und Relay
`[4.6]` DHCP konfigurieren und verifizieren:
- **Cisco als DHCP-Server:** `ip dhcp pool`, `network`, `default-router`, `dns-server`, `lease`
- **Excluded Addresses:** `ip dhcp excluded-address`
- **DHCP Relay (ip helper-address):** Router leitet DHCP-Broadcasts an DHCP-Server weiter
- **DHCP-Client auf Interface:** `ip address dhcp`
- Verifikation: `show ip dhcp binding`, `show ip dhcp pool`

---

### 4.7 QoS (Quality of Service)
`[4.7]` PHB (Per-Hop Behavior) für QoS:
- **Klassifizierung:** Traffic identifizieren (ACL, NBAR, DSCP/CoS)
- **Markierung:** DSCP (Layer 3, 6 Bit im IP-Header) vs. CoS (Layer 2, 3 Bit im 802.1Q-Tag)
- **DSCP-Werte:** EF=46 (VoIP), AF (Assured Forwarding), CS (Class Selector), BE=0
- **Queuing:** FIFO, WFQ, CBWFQ, LLQ (Low Latency Queuing für VoIP)
- **Congestion Avoidance:** RED, WRED
- **Policing vs. Shaping:** Policing verwirft Überschuss (Raten-Limit), Shaping puffert ihn
- **Schnittstellen:** `service-policy input/output`, `policy-map`, `class-map`

---

### 4.8 SSH-Remote-Zugriff
`[4.8]` Netzwerkgeräte für SSH konfigurieren:
- **Voraussetzungen:** Hostname, Domain-Name, RSA-Schlüssel, lokaler User oder AAA
- **Konfigurationsschritte:** `crypto key generate rsa`, `ip ssh version 2`, `line vty`
- **SSHv1 vs. SSHv2:** Immer SSHv2 verwenden (`ip ssh version 2`)
- Verifikation: `show ip ssh`, `show ssh`

---

### 4.9 TFTP und FTP im Netzwerk
`[4.9]` *(Status im Repo: ❌ MISSING)*
- **TFTP (Trivial File Transfer Protocol):** UDP/69, kein Auth, kein Directory, für IOS-Image-Transfer
- **FTP (File Transfer Protocol):** TCP/20 (Daten), TCP/21 (Steuerung), Passwort-Auth
- **Aktiv vs. Passiv FTP:** Unterschied für Firewalls relevant
- **IOS-Image-Backup:** `copy flash: tftp:` / `copy running-config tftp:`
- **IOS-Upgrade via TFTP:** Reihenfolge — Download → Verify MD5 → Boot Statement → Reload
- **Secure Alternatives:** SFTP (SSH-basiert), SCP — bevorzugt in Produktionsumgebungen

---

## 5.0 Security Fundamentals (15%)

### 5.1 Sicherheitskonzepte
`[5.1]` Bedrohungen, Schwachstellen, Exploits und Gegenmaßnahmen:
- **Bedrohungen:** Viren, Würmer, Trojaner, Ransomware, DDoS, Man-in-the-Middle, Phishing
- **Schwachstellen:** Ungepatchte Software, schwache Passwörter, Fehlkonfigurationen
- **Angriffsvektoren:** On-Path (MitM), Reconnaissance, Spoofing, Replay-Angriffe
- **Gegenmaßnahmen:** Patches, starke Auth, Segmentierung, IDS/IPS, AAA

---

### 5.2 Security-Programm-Elemente
`[5.2]` *(Status im Repo: ❌ MISSING)*
- **User Awareness:** Phishing-Simulationen, Security-Training, acceptable Use Policy (AUP)
- **Training:** Regelmäßige Schulungen, zertifizierte Security-Fachkräfte
- **Physical Access Control:** Badge-Systeme, Biometrie, Sicherheitsschleusen, Kamera
- **Principle of Least Privilege:** Minimale Berechtigungen, Role-Based Access Control (RBAC)
- **Defense in Depth:** Mehrere Sicherheitsebenen (Firewall + IDS + Endpoint + Physical)

---

### 5.3 Gerätezugangskontrolle
`[5.3]` Zugangskontrolle mit lokalen Passwörtern:
- **Enable Password / Enable Secret:** MD5-gehashtes Secret (immer `enable secret` verwenden!)
- **Console, VTY, AUX Lines:** `password`, `login`, `login local`
- **Lokale Benutzerdatenbank:** `username <name> privilege <level> secret <pw>`
- **Privilege Levels:** 0 (minimal), 1 (User EXEC), 15 (Privileged EXEC) — benutzerdefiniert 2–14
- **Password Encryption:** `service password-encryption` (schwach, reversibel — kein Ersatz für Secret)

---

### 5.4 Passwort-Richtlinien und AAA
`[5.4]` AAA (Authentication, Authorization, Accounting):
- **Lokales AAA:** `aaa new-model`, `aaa authentication login default local`
- **TACACS+ (Cisco-proprietär):** TCP/49, trennt Auth/Author/Accounting, verschlüsselt ganzes Paket
- **RADIUS (IEEE-Standard):** UDP/1812(Auth)+1813(Accounting), kombiniert Auth+Author, nur Passwort verschlüsselt
- **AAA-Verwendungsfall:** TACACS+ für Device-Admin-Auth, RADIUS für WLAN-Client-Auth (802.1X)
- **Passwort-Richtlinien:** Komplexität, Mindestalter, Maximalalter, Wiederverwendungsverbot

---

### 5.5 IPsec VPNs
`[5.5]` IPsec Remote-Access und Site-to-Site VPNs:
- **Site-to-Site VPN:** Router-zu-Router, Always-On, Layer-3-Tunnel
- **Remote Access VPN:** Client-zu-Gateway, Cisco AnyConnect (SSL/TLS oder IPsec)
- **IPsec-Protokolle:** AH (Authentication Header — kein Encrypt), ESP (Encapsulating Security Payload — Auth + Encrypt)
- **IKE-Phasen:** Phase 1 (ISAKMP SA — Verschlüsselung aushandeln), Phase 2 (IPsec SA)
- **Modi:** Transport (nur Payload verschlüsselt) vs. Tunnel (ganzes Paket → neuer IP-Header)
- **GRE over IPsec:** GRE-Tunnel für Multicast/Routing, IPsec für Verschlüsselung

---

### 5.6 Access Control Lists (ACLs)
`[5.6]` ACLs konfigurieren und verifizieren:
- **Standard ACLs (1–99, 1300–1999):** Nur Source-IP — möglichst nahe am Ziel platzieren
- **Extended ACLs (100–199, 2000–2699):** Source + Destination + Protokoll + Port — nahe an der Quelle
- **Named ACLs:** Lesbarere Namen, Einträge löschbar
- **Reihenfolge:** Top-Down, implizites `deny any` am Ende
- **Wildcard-Mask:** Inverse Subnetzmaske (0 = prüfen, 1 = ignorieren)
- **ACL auf Interface:** `ip access-group <name/nr> in/out`
- **Verifikation:** `show ip access-lists`, `show run | include access-list`

---

### 5.7 Layer-2-Sicherheitsfunktionen
`[5.7]` DHCP Snooping, DAI, Port Security:
- **DHCP Snooping:** Unterscheidet Trusted (Uplinks zum echten DHCP-Server) und Untrusted Ports (Endgeräte) — verhindert Rogue DHCP
- **DAI (Dynamic ARP Inspection):** Validiert ARP-Pakete gegen DHCP-Snooping-Binding-Table — verhindert ARP-Spoofing
- **Port Security:** Begrenzt MACs pro Port, Violation-Modi: shutdown / restrict / protect
- `ip dhcp snooping vlan <id>`, `ip arp inspection vlan <id>`, `switchport port-security`

---

### 5.8 Cisco Security-Lösungen für Remote-Zugriff
`[5.8]` SSH, IPsec, RAVPN, SSL VPN:
- **SSH:** Verschlüsselter Management-Zugriff — immer SSHv2, Telnet vermeiden
- **IPsec Site-to-Site:** Router/Firewall zu Router/Firewall
- **RAVPN (Remote Access VPN):** Cisco AnyConnect über IKEv2/IPsec oder SSL/TLS
- **SSL VPN:** Clientless (Browser-basiert) oder Full-Tunnel (AnyConnect)
- **NGFW (Cisco FTD/ASA):** Stateful Inspection + Application Awareness

---

### 5.9 802.1X Authentifizierungsmechanismen
`[5.9]` *(Status im Repo: ❌ MISSING)*
- **802.1X Rollen:** Supplicant (Client), Authenticator (Switch/AP), Authentication Server (RADIUS)
- **EAP (Extensible Authentication Protocol):** Rahmen für verschiedene Auth-Methoden
- **EAP-Typen:** EAP-TLS (Zertifikat beidseitig), PEAP (nur Server-Zertifikat), EAP-FAST (Cisco)
- **Port-basierte Netzwerkzugangskontrolle:** Port bleibt gesperrt bis Auth erfolgreich
- **Konfiguration auf Switch:** `dot1x system-auth-control`, `authentication port-control auto`
- **RADIUS-Integration:** Switch sendet EAP-Nachrichten via RADIUS an Auth-Server

---

### 5.10 WPA2-PSK WLAN-Konfiguration (GUI)
`[5.10]` WPA2-PSK über Cisco WLC GUI konfigurieren:
- WLAN erstellen, SSID eingeben, WPA2-Policy, AES-Verschlüsselung, PSK eingeben
- VLAN-Zuweisung für das WLAN
- QoS-Profil zuweisen (Silver für normalen Daten-Traffic)

---

## 6.0 Automation and Programmability (10%)

### 6.1 Automatisierungs-Impact auf Netzwerkmanagement
`[6.1]` Automatisierung im Netzwerk:
- **Probleme mit manuellem Management:** Fehleranfällig, langsam, nicht skalierbar
- **Vorteile der Automatisierung:** Konsistenz, Geschwindigkeit, Auditierbarkeit, Rollback
- **Intent-Based Networking (IBN):** Administrator definiert Absicht (Intent), System setzt um
- **Infrastructure as Code (IaC):** Netzwerkkonfiguration in versionierten Dateien

---

### 6.2 Traditionelle vs. Controller-basierte Netzwerke
`[6.2]` Vergleich:
- **Traditionell:** Distributed Control Plane — jedes Gerät trifft eigene Entscheidungen
- **Controller-basiert:** Zentralisierter Control Plane — Controller trifft Entscheidungen für alle Geräte
- **Cisco SD-Access:** Fabric-Architektur, Cisco DNA Center als Controller
- **OpenFlow:** Erstes SDN-Protokoll (akademisch), trennt Data/Control Plane strikt

---

### 6.3 Controller-basierte SDN-Architektur
`[6.3]` Overlay, Underlay und Fabric:
- **Underlay:** Physische Netzwerktopologie (IP-Konnektivität zwischen Geräten)
- **Overlay:** Virtuelles Netzwerk über Underlay (VXLAN-Tunnel, SD-Access Fabric-Encapsulation)
- **Fabric:** Overlay + Underlay als Einheit — Cisco SD-Access nutzt LISP + VXLAN
- **Northbound API:** Controller → Management-Apps (REST-APIs, Dashboard)
- **Southbound API:** Controller → Netzwerkgeräte (OpenFlow, NETCONF, RESTCONF, CLI)

---

### 6.4 Cisco DNA Center vs. traditionelles Gerätemanagement
`[6.4]` DNA Center:
- **Traditionell:** CLI pro Gerät via SSH/Telnet — `show`, `configure terminal`
- **DNA Center:** GUI + REST-API für alle Geräte zentral
- **Intent-Based Policies:** Segment-basierte Policies (SGT/TrustSec), automatisch auf Geräte gepusht
- **Assurance:** Telemetrie-basiertes Monitoring, AI/ML-Analyse von Netzwerkzustand
- **Day-0/Day-1/Day-2:** Onboarding → Konfiguration → Betrieb

---

### 6.5 REST-API-Charakteristiken
`[6.5]` REST-basierte APIs:
- **CRUD → HTTP:** Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE
- **HTTP-Verben:** GET (idempotent), POST (nicht idempotent), PUT (idempotent), DELETE (idempotent)
- **Datenformate:** JSON (Standard bei REST), XML (NETCONF/SOAP)
- **Authentifizierung:** Basic Auth, Bearer Token (OAuth2), API-Key
- **HTTP-Statuscodes:** 200/201/204 (Erfolg), 400 (Bad Request), 401/403 (Auth), 404 (Not Found), 500 (Server Error)
- **YANG / NETCONF / RESTCONF:** YANG = Datenmodell, NETCONF (XML über SSH), RESTCONF (HTTP/REST mit YANG)

---

### 6.6 Configuration Management Werkzeuge
`[6.6]` Ansible, Puppet, Chef:
- **Ansible:** Agentlos, Push-Modell, YAML-Playbooks, SSH/NETCONF
- **Puppet:** Agent-basiert, Pull-Modell, Puppet DSL (Ruby-ähnlich)
- **Chef:** Agent-basiert, Pull-Modell, Ruby-Cookbooks
- **Idempotenz:** Gleicher Run → gleicher Zustand, auch bei Wiederholung
- **Terraform:** IaC für Cloud-Ressourcen (nicht Configuration Management, aber verwandt)

---

### 6.7 JSON-Daten erkennen und interpretieren
`[6.7]` JSON-Struktur:
- **Datentypen:** String (Anführungszeichen), Number (ohne), Boolean (true/false), null, Array [], Object {}
- **Verschachtelte Strukturen:** Object in Object, Array von Objects
- **Cisco API-Antworten lesen:** Typische DNA-Center-API-Antwort-Struktur
- **Vergleich JSON vs. YAML vs. XML:** Lesbarkeit, Einsatzgebiet, Syntaxmerkmale

---

## Anhang: Prüfungsformat

| Parameter | Wert |
|-----------|------|
| Prüfungszeit | 120 Minuten |
| Anzahl Fragen | ca. 95–107 (variiert) |
| Mindestpunktzahl | 825/1000 |
| Fragetypen | Single-Choice, Multiple-Choice, Drag-and-Drop, Testlet (Szenario), Simlet (IOS-Sim) |
| Verfügbare Sprachen | Englisch, Japanisch |

### Gewichtete Fragenanzahl für Simulation (100 Fragen)
| Section | Anteil | Fragen |
|---------|--------|--------|
| 1.0 Network Fundamentals | 20% | 20 |
| 2.0 Network Access | 20% | 20 |
| 3.0 IP Connectivity | 25% | 25 |
| 4.0 IP Services | 10% | 10 |
| 5.0 Security Fundamentals | 15% | 15 |
| 6.0 Automation & Programmability | 10% | 10 |

---

*Quellen: Cisco Exam Topics 200-301 v1.1 (Aug 2024), Wendell Odom CCNA Official Cert Guide Vol. 1 & 2 (v2), Jeremy's IT Lab Free CCNA, Boson ExSim-Max 200-301 (Fragenreferenz). Alle Texte in eigenen Worten.*

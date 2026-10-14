# Dashboard: Stufen und Glossar (zur Freigabe)

Stand: Vorschlag, nichts davon ist umgesetzt. Nach deiner Freigabe (oder Änderung) setze ich beides im Dashboard um.

## 1. Stufen „Einsteiger“ und „Fortgeschritten“

Die Labs haben heute vier Bezeichnungen (Anfänger 5, Mittel 24, Fortgeschritten 22, Drill 4). Auf dem Dashboard gibt es nur zwei Stufen. Vorschlag für die Regel:

- **Einsteiger:** Labs mit „Anfänger“ oder „Drill“ sowie „Mittel“-Labs in den Lernpfad-Schritten 2 bis 7 (CLI, Kabel, IPv4, VLANs, STP, statisches Routing).
- **Fortgeschritten:** Labs mit „Fortgeschritten“ sowie „Mittel“-Labs ab Schritt 8 (OSPF, IPv6, Services, Security, Automation, Prüfung).

Ergebnis: 18 Labs Einsteiger, 37 Labs Fortgeschritten. Die Daten der Labs ändere ich nicht; die Stufe wird aus dieser Zuordnung angezeigt.

Grenzfälle, die du prüfen solltest: `ipv6` (Grundkonfiguration, steht nach der Regel bei Fortgeschritten, weil Schritt 9), `dhcp` ist „Anfänger“ und bleibt Einsteiger, `nat-pat`, `device-hardening`, `acl-standard` und `ssh` (Anfänger, Schritt 11, bleibt Einsteiger). Willst du die Regel nach Schritt statt nach Lab-Stufe, oder einzelne Labs von Hand zuordnen?

| Schritt | Lab | Titel | heutige Stufe | Vorschlag | Begründung |
|---|---|---|---|---|---|
| 2 | `drill-grundkonfig` | Drill: Grundkonfiguration ×3 | Drill | **Einsteiger** | Drill: wiederholt nur die Grundbefehle der CLI. |
| 3 | `layer1-issues` | Cable & Layer-1-Issues | Mittel | **Einsteiger** | Liest Zähler und setzt Duplex/Speed, keine Netzkonfiguration. |
| 4 | `basic-ip` | IP-Grundkonfiguration | Anfänger | **Einsteiger** | Erste Konfiguration mit einem Router und zwei PCs (Lab-Stufe Anfänger). |
| 4 | `drill-interfaces` | Drill: Router-Interfaces hochziehen | Drill | **Einsteiger** | Drill: dieselben vier Befehle je Interface, ein Link. |
| 4 | `drill-pc-ips` | Drill: 6 PCs durchnummerieren | Drill | **Einsteiger** | Drill: nur IP-Adressen an sechs PCs vergeben. |
| 5 | `drill-access-ports` | Drill: Access-Ports im Akkord | Drill | **Einsteiger** | Drill: Access-Ports im VLAN, Wiederholung eines Handgriffs. |
| 5 | `ivr-svi` | Inter-VLAN Routing (L3-Switch / SVI) | Mittel | **Einsteiger** | Gleiche Aufgabe wie Router-on-a-Stick, aber mit SVIs auf einem Layer-3-Switch. |
| 5 | `roas` | Inter-VLAN Routing (RoaS) | Mittel | **Einsteiger** | Ein Router mit Subinterfaces, übersichtlich, baut direkt auf VLANs auf. |
| 5 | `vlan-trunking` | VLANs & Trunking | Anfänger | **Einsteiger** | Erstes VLAN-Lab (Lab-Stufe Anfänger), ein Trunk. |
| 5 | `vtp-dtp` | VTP & DTP | Mittel | **Einsteiger** | Switch-Kette mit VTP, aber ohne Routing; baut nur auf VLANs auf. |
| 6 | `etherchannel` | EtherChannel (LACP) | Fortgeschritten | **Fortgeschritten** | Bündelung mit LACP verlangt auf beiden Seiten passende Einstellungen (Lab-Stufe Fortgeschritten). |
| 6 | `stp` | STP — PortFast & BPDU Guard | Mittel | **Einsteiger** | Zwei Switches mit Schleife, wenige Befehle (PortFast, BPDU Guard). |
| 7 | `floating-static` | Floating Static Route | Mittel | **Einsteiger** | Erweitert statisches Routing um Administrative Distance, bleibt aber bei einem Router. |
| 7 | `rip-v1` | RIPv1 — Classful Distance-Vector | Anfänger | **Einsteiger** | Lab-Stufe Anfänger: drei Router, classful, kaum Optionen. |
| 7 | `rip-v2` | RIPv2 — Dynamisches Routing | Mittel | **Einsteiger** | Wie RIPv1, nur mit Maske und auto-summary-Besonderheit. |
| 7 | `rip-v2-passive` | RIPv2 + Passive Interface (4 Router) | Mittel | **Einsteiger** | Vier Router mit gemeinsamem Segment; Grenzfall zwischen beiden Stufen. |
| 7 | `static-routing` | Statisches Routing | Mittel | **Einsteiger** | Zwei Router, wenige statische Routen, direkt nach IPv4/VLANs. |
| 8 | `eigrp` | EIGRP Grundlagen | Fortgeschritten | **Fortgeschritten** | Zweites Protokoll als Vertiefung, Dreieck mit Feasible Successor. |
| 8 | `ospf` | OSPF — Single Area 0 | Mittel | **Fortgeschritten** | Erstes dynamisches Protokoll mit Nachbarn und Router-ID; baut auf Schritt 7 auf. |
| 8 | `ospf-dr-bdr-election` | OSPF DR/BDR-Wahl (Multi-Access) | Fortgeschritten | **Fortgeschritten** | DR/BDR-Wahl auf einem Segment mit vier Routern und Prioritäten. |
| 8 | `ospf-multiarea` | OSPF Multi-Area | Fortgeschritten | **Fortgeschritten** | Mehrere Areas, ABR und Stub-Area. |
| 8 | `ospf-rid-wildcard` | OSPF Single-Area — Loopback-RID & Wildcard | Mittel | **Fortgeschritten** | Loopback-Router-ID und Wildcard-Masken richtig setzen. |
| 9 | `ipv6` | IPv6 Grundkonfiguration | Mittel | **Fortgeschritten** | Zwei Router, statische Routen; erster Kontakt mit IPv6 (Grenzfall, Lab-Stufe Mittel). |
| 9 | `ipv6-ospfv3-eigrpv6` | IPv6 Routing — OSPFv3 + EIGRPv6 | Fortgeschritten | **Fortgeschritten** | Zwei Protokolle auf einem Dreieck, Administrative Distance im Spiel. |
| 9 | `ipv6-static` | IPv6 Static Routing | Mittel | **Fortgeschritten** | Serielle Links, Default-Route und Loopback-Routen in IPv6. |
| 9 | `ospfv3-ipv6` | OSPFv3 für IPv6 | Fortgeschritten | **Fortgeschritten** | OSPFv3 mit eigener Syntax, setzt OSPF und IPv6 voraus. |
| 10 | `dhcp` | DHCPv4 auf Router | Anfänger | **Einsteiger** | Ein Router als DHCP-Server, wenige Befehle (Lab-Stufe Anfänger). |
| 10 | `dhcp-relay` | DHCP Relay über VLAN-Grenzen | Fortgeschritten | **Fortgeschritten** | DHCP über VLAN-Grenzen mit Router-on-a-Stick und VTP. |
| 10 | `dynamic-nat` | Dynamisches NAT (Pool) | Mittel | **Fortgeschritten** | Pool, ACL und Rückrouten zusammen konfigurieren. |
| 10 | `hsrp` | HSRP First-Hop Redundancy | Fortgeschritten | **Fortgeschritten** | Zwei Router, virtuelle IP, Priority, Preempt, Tracking. |
| 10 | `ios-backup-upgrade` | IOS-Backup & Upgrade (TFTP) | Mittel | **Fortgeschritten** | Dateien per TFTP sichern und Image wechseln, Fehler kosten ein Gerät. |
| 10 | `nat-pat` | NAT / PAT (Overload) | Mittel | **Fortgeschritten** | Ein NAT-Router plus ISP-Strecke mit Rückrouten (Grenzfall, Lab-Stufe Mittel). |
| 10 | `nat-pool-overload` | Dynamic NAT — Pool + Overload | Mittel | **Fortgeschritten** | Pool mit Overload, Pool-Grenzen und Rückroute müssen passen. |
| 10 | `ntp-syslog-snmp` | NTP + Syslog + SNMPv2c | Mittel | **Fortgeschritten** | Drei Dienste mit Authentifizierung, Loopback und Management-VLAN. |
| 10 | `password-recovery` | Password Recovery | Mittel | **Fortgeschritten** | Eingriff über ROMMON und Config-Register, setzt Gerätekenntnis voraus. |
| 10 | `static-nat` | Statisches NAT | Mittel | **Fortgeschritten** | Mehrere statische Zuordnungen mit Rückroute für die Inside-Global-Adressen. |
| 11 | `aaa-radius-tacacs` | AAA mit RADIUS | Fortgeschritten | **Fortgeschritten** | AAA-Methodenlisten mit RADIUS und lokalem Fallback. |
| 11 | `acl-extended` | Extended ACL | Fortgeschritten | **Fortgeschritten** | Extended-ACL mit Protokoll und Port, Reihenfolge der Regeln. |
| 11 | `acl-standard` | Standard ACL | Mittel | **Fortgeschritten** | Eine Standard-ACL an einem Router, Platzierung beachten. |
| 11 | `co-acl-nat-isp` | ACL + Static NAT — Dual-Site mit ISP | Fortgeschritten | **Fortgeschritten** | 20 Geräte, EIGRP, OSPF, Redistribution, NAT und ACLs in zwei Standorten. |
| 11 | `device-hardening` | Device Hardening | Mittel | **Fortgeschritten** | Viele Einzelmaßnahmen (Banner, Login-Schutz, vty-ACL) auf einem Switch. |
| 11 | `dhcp-snooping-dai` | DHCP Snooping + Dynamic ARP Inspection | Fortgeschritten | **Fortgeschritten** | Trusted/Untrusted-Ports, Snooping und DAI zusammen mit Rogue-Server. |
| 11 | `port-security` | Port Security | Mittel | **Fortgeschritten** | Ein Switch mit Sticky-MAC und zwei Violation-Modi, Gegenprobe mit Fremdgerät. |
| 11 | `ssh` | SSH Remote-Zugriff | Anfänger | **Einsteiger** | Ein Router, wenige Befehle (Lab-Stufe Anfänger). |
| 11 | `stp-hardening` | STP Root-Bridge Hardening | Fortgeschritten | **Fortgeschritten** | Root Guard, BPDU Guard und PortFast mit Rogue-Switch-Gegenprobe. |
| 11 | `vlan-hopping` | VLAN-Hopping & Mitigation | Fortgeschritten | **Fortgeschritten** | Native VLAN, nonegotiate und Double-Tagging verstehen. |
| 12 | `gre-tunnel` | GRE-Tunnel-VPN zwischen Sites | Fortgeschritten | **Fortgeschritten** | Tunnel plus OSPF über den Tunnel. |
| 12 | `ipsec-s2s-vpn` | IPSec Site-to-Site VPN: Hamburg ↔ Bremen | Fortgeschritten | **Fortgeschritten** | Größtes Lab (19 Schritte): IKE, IPsec und Crypto Map. |
| 14 | `netconf-yang` | NETCONF + YANG | Fortgeschritten | **Fortgeschritten** | NETCONF und YANG per Python-Skript. |
| 14 | `netflow` | NetFlow / Flexible NetFlow | Fortgeschritten | **Fortgeschritten** | Flow Record, Exporter und Monitor als eigene Konfigurationsobjekte. |
| 14 | `restconf` | REST API mit RESTCONF | Fortgeschritten | **Fortgeschritten** | REST-Aufrufe mit curl und JSON-Daten gegen den Router. |
| 15 | `dhcp-troubleshoot-lab` | DHCP Troubleshooting: 3 Fehler finden | Fortgeschritten | **Fortgeschritten** | Fehlersuche mit drei versteckten Fehlern in DHCP-Relay und VLANs. |
| 15 | `troubleshooting-cheat` | Show-Cheat-Lab (Troubleshooting) | Mittel | **Fortgeschritten** | Nachschlagelab für show-Befehle, setzt bekannte Befehle voraus. |
| 15 | `vlan-dhcp-nat-roas` | VLAN + DHCP + NAT — Campus mit Internetzugang | Fortgeschritten | **Fortgeschritten** | Abschluss-Lab: VLANs, DHCP, NAT und Router-on-a-Stick zusammen. |
| 15 | `vlan-vtp-dhcp-campus` | Campus: VTP + RoaS + zentrales DHCP (3 Switches) | Fortgeschritten | **Fortgeschritten** | Abschluss-Lab: drei Switches, VTP, zentrales DHCP und Router-on-a-Stick. |

### Simulatoren und Werkzeuge

| Werkzeug | Vorschlag | Begründung |
|---|---|---|
| OSI-Simulator | Einsteiger | zeigt Schichten und Datenfluss ohne Konfiguration |
| VLAN-Simulator | Einsteiger | Frames mit und ohne Tag sehen, nichts einzugeben |
| STP-Simulator | Fortgeschritten | Root-Wahl, Port-Rollen und Konvergenz setzen STP-Wissen voraus |
| Routing-Simulator | Fortgeschritten | Routingtabellen, Longest Match und OSPF-Austausch |
| Topologie-Erkunder | Einsteiger | Geräte anklicken und erklärt bekommen |
| CLI-Glossar | Einsteiger | Befehle nachschlagen |
| Verkabelungs-Trainer | Einsteiger | Kabeltypen zuordnen |
| Subnetting-Drill, Subnetting-Quiz | Einsteiger | übt die Grundrechnung mit Rückmeldung |
| Subnetting-Cheatsheet, IPv4-Subnetztabelle | Einsteiger | Nachschlagehilfen |
| IPv6-Rechner | Einsteiger | Hilfsmittel zum Nachrechnen |
| Routing-Drill | Fortgeschritten | Routingentscheidungen trainieren |
| OSPF-Wildcard-Drill | Fortgeschritten | Wildcard-Masken zu OSPF-network-Befehlen |
| ACL-Drill | Fortgeschritten | ACL-Reihenfolge und Platzierung |
| Drag-and-Drop-Trainer | Fortgeschritten | Aufgaben aus allen Themengebieten (Prüfungsvorbereitung) |

Die Lernpfad-Schritte selbst erhalten keine Stufe, sondern die Angabe „Baut auf: …“ (bereits umgesetzt).

## 2. Glossar für das Dashboard

Je Begriff ein bis zwei Sätze in einfacher Sprache, Fachbegriffe im Original. Die Begriffe stehen in den Titeln und Kurztexten der Lernpfad-Schritte; im Dashboard erscheinen sie mit einer kurzen Erklärung (Tooltip oder Aufklappen), und das CLI-Glossar bleibt für Befehle zuständig.

| Begriff | Erklärung (Entwurf) |
|---|---|
| OSI-Modell | Ein Schichtenmodell mit sieben Schichten, das beschreibt, wie Daten von einer Anwendung über das Netzwerk zu einer anderen gelangen. |
| TCP/IP | Die Protokollfamilie des Internets. Sie ist einfacher aufgebaut als das OSI-Modell und wird in der Praxis verwendet. |
| Switch | Ein Gerät, das Geräte im selben lokalen Netz verbindet und Daten anhand von MAC-Adressen weiterleitet. |
| Router | Ein Gerät, das verschiedene Netze verbindet und Daten anhand von IP-Adressen auf den richtigen Weg schickt. |
| IOS | Das Betriebssystem der Cisco-Geräte. Man bedient es über die CLI. |
| CLI | „Command Line Interface“: die Eingabezeile, über die man Geräte mit Befehlen konfiguriert. |
| Subnetz | Ein Teil eines IP-Netzes. Durch Subnetting teilt man ein großes Netz in kleinere Netze auf. |
| Subnetzmaske | Sagt, welcher Teil einer IP-Adresse das Netz ist und welcher das Gerät, z. B. 255.255.255.0. |
| Gateway | Der Router, über den ein Gerät das eigene Netz verlässt. |
| VLAN | Ein virtuelles lokales Netz: ein Switch wird logisch in mehrere getrennte Netze aufgeteilt. |
| Trunk | Eine Verbindung zwischen Switches (oder Switch und Router), die mehrere VLANs gleichzeitig überträgt. |
| STP | „Spanning Tree Protocol“: verhindert Schleifen im Switch-Netz, indem es redundante Wege abschaltet. |
| EtherChannel | Mehrere Kabel zwischen zwei Switches werden zu einer logischen Leitung gebündelt. |
| Routingtabelle | Die Liste, in der ein Router nachschlägt, über welchen Nachbarn er ein Zielnetz erreicht. |
| Statisches Routing | Routen werden von Hand eingetragen. Sie ändern sich nicht von selbst. |
| OSPF | Ein Routingprotokoll, mit dem Router ihre Routen automatisch austauschen und den besten Weg berechnen. |
| EIGRP | Ein weiteres Routingprotokoll von Cisco. Es ist in diesem Kurs eine Vertiefung. |
| IPv6 | Die neue Version des Internetprotokolls mit sehr viel längeren Adressen als IPv4. |
| DHCP | Vergibt Geräten automatisch IP-Adresse, Maske und Gateway. |
| NAT | Übersetzt private in öffentliche IP-Adressen, damit Geräte im internen Netz ins Internet kommen. |
| DNS | Übersetzt Namen wie „example.com“ in IP-Adressen. |
| NTP | Gleicht die Uhrzeit von Geräten mit einer zentralen Zeitquelle ab. |
| Syslog | Sammelt Meldungen (Logs) von Geräten an einer zentralen Stelle. |
| SNMP | Ein Protokoll, mit dem man Geräte überwacht und Messwerte abfragt. |
| FHRP | „First Hop Redundancy Protocol“ (z. B. HSRP): zwei Router teilen sich eine virtuelle Gateway-Adresse, damit bei einem Ausfall der andere übernimmt. |
| QoS | „Quality of Service“: bevorzugt wichtigen Datenverkehr, z. B. Sprache, wenn das Netz ausgelastet ist. |
| ACL | „Access Control List“: eine Liste von Regeln, die Datenverkehr erlaubt oder sperrt. |
| Port Security | Ein Switch-Port akzeptiert nur bestimmte Geräte (MAC-Adressen). |
| VPN | Ein verschlüsselter Tunnel durch ein öffentliches Netz, z. B. um zwei Standorte zu verbinden. |
| WLAN | Drahtloses lokales Netz (Wi-Fi). |
| SDN / Controller | Ein Controller steuert viele Netzwerkgeräte zentral per Software. |
| API | Eine Schnittstelle, über die Programme miteinander oder mit Geräten sprechen. Eine REST-API nutzt dafür HTTP. |
| Lab | Eine praktische Übung, in der du ein Netzwerk nachbaust und konfigurierst. |
| Drill | Eine kurze Wiederholungsübung zum Einschleifen eines Handgriffs. |

Alle 34 Begriffe sind Entwurf. Streichen, ergänzen oder umformulieren kannst du jederzeit.

# Dashboard: Stufen und Glossar (zur Freigabe)

Stand: Vorschlag, nichts davon ist umgesetzt. Nach deiner Freigabe (oder Änderung) setze ich beides im Dashboard um.

## 1. Stufen „Einsteiger“ und „Fortgeschritten“

Die Labs haben heute vier Bezeichnungen (Anfänger 5, Mittel 24, Fortgeschritten 22, Drill 4). Auf dem Dashboard gibt es nur zwei Stufen. Vorschlag für die Regel:

- **Einsteiger:** Labs mit „Anfänger“ oder „Drill“ sowie „Mittel“-Labs in den Lernpfad-Schritten 2 bis 7 (CLI, Kabel, IPv4, VLANs, STP, statisches Routing).
- **Fortgeschritten:** Labs mit „Fortgeschritten“ sowie „Mittel“-Labs ab Schritt 8 (OSPF, IPv6, Services, Security, Automation, Prüfung).

Ergebnis: 18 Labs Einsteiger, 37 Labs Fortgeschritten. Die Daten der Labs ändere ich nicht; die Stufe wird aus dieser Zuordnung angezeigt.

Grenzfälle, die du prüfen solltest: `ipv6` (Grundkonfiguration, steht nach der Regel bei Fortgeschritten, weil Schritt 9), `dhcp` ist „Anfänger“ und bleibt Einsteiger, `nat-pat`, `device-hardening`, `acl-standard` und `ssh` (Anfänger, Schritt 11, bleibt Einsteiger). Willst du die Regel nach Schritt statt nach Lab-Stufe, oder einzelne Labs von Hand zuordnen?

| Schritt | Lab | Titel | heutige Stufe | Vorschlag |
|---|---|---|---|---|
| 2 | `drill-grundkonfig` | Drill: Grundkonfiguration ×3 | Drill | Einsteiger |
| 3 | `layer1-issues` | Cable & Layer-1-Issues | Mittel | Einsteiger |
| 4 | `basic-ip` | IP-Grundkonfiguration | Anfänger | Einsteiger |
| 4 | `drill-interfaces` | Drill: Router-Interfaces hochziehen | Drill | Einsteiger |
| 4 | `drill-pc-ips` | Drill: 6 PCs durchnummerieren | Drill | Einsteiger |
| 5 | `drill-access-ports` | Drill: Access-Ports im Akkord | Drill | Einsteiger |
| 5 | `ivr-svi` | Inter-VLAN Routing (L3-Switch / SVI) | Mittel | Einsteiger |
| 5 | `roas` | Inter-VLAN Routing (RoaS) | Mittel | Einsteiger |
| 5 | `vlan-trunking` | VLANs & Trunking | Anfänger | Einsteiger |
| 5 | `vtp-dtp` | VTP & DTP | Mittel | Einsteiger |
| 6 | `etherchannel` | EtherChannel (LACP) | Fortgeschritten | Fortgeschritten |
| 6 | `stp` | STP — PortFast & BPDU Guard | Mittel | Einsteiger |
| 7 | `floating-static` | Floating Static Route | Mittel | Einsteiger |
| 7 | `rip-v1` | RIPv1 — Classful Distance-Vector | Anfänger | Einsteiger |
| 7 | `rip-v2` | RIPv2 — Dynamisches Routing | Mittel | Einsteiger |
| 7 | `rip-v2-passive` | RIPv2 + Passive Interface (4 Router) | Mittel | Einsteiger |
| 7 | `static-routing` | Statisches Routing | Mittel | Einsteiger |
| 8 | `eigrp` | EIGRP Grundlagen | Fortgeschritten | Fortgeschritten |
| 8 | `ospf` | OSPF — Single Area 0 | Mittel | Fortgeschritten |
| 8 | `ospf-dr-bdr-election` | OSPF DR/BDR-Wahl (Multi-Access) | Fortgeschritten | Fortgeschritten |
| 8 | `ospf-multiarea` | OSPF Multi-Area | Fortgeschritten | Fortgeschritten |
| 8 | `ospf-rid-wildcard` | OSPF Single-Area — Loopback-RID & Wildcard | Mittel | Fortgeschritten |
| 9 | `ipv6` | IPv6 Grundkonfiguration | Mittel | Fortgeschritten |
| 9 | `ipv6-ospfv3-eigrpv6` | IPv6 Routing — OSPFv3 + EIGRPv6 | Fortgeschritten | Fortgeschritten |
| 9 | `ipv6-static` | IPv6 Static Routing | Mittel | Fortgeschritten |
| 9 | `ospfv3-ipv6` | OSPFv3 für IPv6 | Fortgeschritten | Fortgeschritten |
| 10 | `dhcp` | DHCPv4 auf Router | Anfänger | Einsteiger |
| 10 | `dhcp-relay` | DHCP Relay über VLAN-Grenzen | Fortgeschritten | Fortgeschritten |
| 10 | `dynamic-nat` | Dynamisches NAT (Pool) | Mittel | Fortgeschritten |
| 10 | `hsrp` | HSRP First-Hop Redundancy | Fortgeschritten | Fortgeschritten |
| 10 | `ios-backup-upgrade` | IOS-Backup & Upgrade (TFTP) | Mittel | Fortgeschritten |
| 10 | `nat-pat` | NAT / PAT (Overload) | Mittel | Fortgeschritten |
| 10 | `nat-pool-overload` | Dynamic NAT — Pool + Overload | Mittel | Fortgeschritten |
| 10 | `ntp-syslog-snmp` | NTP + Syslog + SNMPv2c | Mittel | Fortgeschritten |
| 10 | `password-recovery` | Password Recovery | Mittel | Fortgeschritten |
| 10 | `static-nat` | Statisches NAT | Mittel | Fortgeschritten |
| 11 | `aaa-radius-tacacs` | AAA mit RADIUS | Fortgeschritten | Fortgeschritten |
| 11 | `acl-extended` | Extended ACL | Fortgeschritten | Fortgeschritten |
| 11 | `acl-standard` | Standard ACL | Mittel | Fortgeschritten |
| 11 | `co-acl-nat-isp` | ACL + Static NAT — Dual-Site mit ISP | Fortgeschritten | Fortgeschritten |
| 11 | `device-hardening` | Device Hardening | Mittel | Fortgeschritten |
| 11 | `dhcp-snooping-dai` | DHCP Snooping + Dynamic ARP Inspection | Fortgeschritten | Fortgeschritten |
| 11 | `port-security` | Port Security | Mittel | Fortgeschritten |
| 11 | `ssh` | SSH Remote-Zugriff | Anfänger | Einsteiger |
| 11 | `stp-hardening` | STP Root-Bridge Hardening | Fortgeschritten | Fortgeschritten |
| 11 | `vlan-hopping` | VLAN-Hopping & Mitigation | Fortgeschritten | Fortgeschritten |
| 12 | `gre-tunnel` | GRE-Tunnel-VPN zwischen Sites | Fortgeschritten | Fortgeschritten |
| 12 | `ipsec-s2s-vpn` | IPSec Site-to-Site VPN: Hamburg ↔ Bremen | Fortgeschritten | Fortgeschritten |
| 14 | `netconf-yang` | NETCONF + YANG | Fortgeschritten | Fortgeschritten |
| 14 | `netflow` | NetFlow / Flexible NetFlow | Fortgeschritten | Fortgeschritten |
| 14 | `restconf` | REST API mit RESTCONF | Fortgeschritten | Fortgeschritten |
| 15 | `dhcp-troubleshoot-lab` | DHCP Troubleshooting: 3 Fehler finden | Fortgeschritten | Fortgeschritten |
| 15 | `troubleshooting-cheat` | Show-Cheat-Lab (Troubleshooting) | Mittel | Fortgeschritten |
| 15 | `vlan-dhcp-nat-roas` | VLAN + DHCP + NAT — Campus mit Internetzugang | Fortgeschritten | Fortgeschritten |
| 15 | `vlan-vtp-dhcp-campus` | Campus: VTP + RoaS + zentrales DHCP (3 Switches) | Fortgeschritten | Fortgeschritten |

### Simulatoren und Werkzeuge

| Werkzeug | Vorschlag |
|---|---|
| OSI-Simulator | Einsteiger |
| VLAN-Simulator | Einsteiger |
| STP-Simulator | Fortgeschritten |
| Routing-Simulator | Fortgeschritten |
| Topologie-Erkunder, CLI-Glossar, Verkabelungs-Trainer | Einsteiger |
| Subnetting-Drill, Subnetting-Quiz, Subnetting-Cheatsheet, IPv4-Subnetztabelle, IPv6-Rechner | Einsteiger |
| Routing-Drill, OSPF-Wildcard-Drill, ACL-Drill | Fortgeschritten |
| Drag-and-Drop-Trainer | Fortgeschritten |

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

# Korrekturvorschläge für Lab-Texte (nur Vorschläge, nichts umgesetzt)

Du entscheidest und änderst die Lab-Texte selbst oder gibst einzelne Änderungen frei. Zeilennummern beziehen sich auf den Stand von `feature/lab-topologies` (`src/components/labs/`). „Alt“ ist der heutige Text, „Neu“ ein Vorschlag. Ports und Adressen im neuen Text sind **Vorschläge von mir**, weil das Lab sie nicht nennt — bitte prüfen.

## 1. dhcp-relay — services.tsx

| Stelle | Alt | Neu | Begründung |
|---|---|---|---|
| Zeile 254 (`topology.devices`) | `{ type: "pc", label: "Clients Rot/Blau/Gelb", count: 3 }` | `{ type: "pc", label: "Client Rot / Client Blau", count: 2 }` | Konfiguriert und in den Schritten verwendet werden nur `Client Rot` und `Client Blau`. „Gelb“ ist das Server-VLAN 71 (`name Gelb`), kein Client. |
| Zeile 260 (`connections`) | `"Client-Rot → SW1 Fa0/1 (VLAN 51) · Client-Blau → SW1 Fa0/11 (VLAN 61)"` | unverändert, falls beide Clients an SW1 hängen. Wenn Clients an SW2 gedacht sind: zusätzlich `"Client-Rot (2. Standort) → SW2 Fa0/1 (VLAN 51)"` | SW2 konfiguriert `Fa0/1-10` als VLAN 51 (Zeile 349), aber kein Gerät nennt einen Anschluss an SW2. Entweder SW2-Ports streichen oder ein Gerät ergänzen. |

## 2. co-acl-nat-isp — security.tsx

| Stelle | Alt | Neu | Begründung |
|---|---|---|---|
| Zeile 1902 (nach `ISP-SW`) | (fehlt) | `{ type: "switch", label: "SW1 (CO-1 LAN) / SW2 (CO-2 LAN)", count: 2 },` | Die Verbindungszeilen 1911–1912 nennen `SW1` und `SW2`, die Geräteliste nicht. |
| Zeilen 1899–1901 | `ETH0/0`, `ETH0/1` | beibehalten, aber im `description` ergänzen: „Interface-Namen im Format `Ethernet0/0` (IOL/GNS3-Router), nicht Packet-Tracer-`GigabitEthernet`“ | Die Namen sind nicht Packet-Tracer-Standard. Das Lab-Topologie-Profil „Ethernet“ folgt dem Lab. Wenn das Lab in Packet Tracer gebaut werden soll, müssten Ports umbenannt werden. |

## 3. hsrp — services.tsx

| Stelle | Alt | Neu | Begründung |
|---|---|---|---|
| Zeile 1997 (`devices`) | `{ type: "router", label: "R1, R2", count: 2 }, { type: "pc", label: "PC0", count: 1 }` | zusätzlich `{ type: "switch", label: "SW1 (gemeinsames LAN)", count: 1 }` | R1, R2 und PC0 teilen das Segment 192.168.1.0/24; das geht nur über einen Verteiler. |
| Zeilen 2001–2004 (`connections`) | `"R1 Gi0/0 — 192.168.1.2/24 (HSRP Active, Priority 110)"`, `"R2 Gi0/0 — 192.168.1.3/24 (HSRP Standby, Priority 100)"`, `"PC0 → gemeinsames LAN 192.168.1.0/24"` | `"R1 Gi0/0 (192.168.1.2/24, HSRP Active, Priority 110) ↔ SW1 Fa0/1"`, `"R2 Gi0/0 (192.168.1.3/24, HSRP Standby, Priority 100) ↔ SW1 Fa0/2"`, `"PC0 → SW1 Fa0/3 (192.168.1.0/24)"` | Konkrete Ports als Vorschlag. |

## 4. acl-extended — security.tsx

| Stelle | Alt | Neu | Begründung |
|---|---|---|---|
| Zeilen 793–797 | `devices`: R1, `PC0 / PC1` (2), Web-Server; `connections`: `"PC0 / PC1 → R1 Gi0/0"`, `"R1 Gi0/1 → Web-Server"` | zusätzlich `{ type: "switch", label: "SW1 (LAN 192.168.1.0/24)", count: 1 }`; `connections`: `"R1 Gi0/0 ↔ SW1 Gi0/1"`, `"PC0 → SW1 Fa0/1"`, `"PC1 → SW1 Fa0/2"`, `"R1 Gi0/1 → Web-Server (192.168.2.100)"` | Beide PCs liegen in 192.168.1.0/24 (`192.168.1.10`, `.20`) und hängen laut Text am selben Port `Gi0/0`; dafür fehlt der Switch. |
| Zeile 798 (`hint`) | `"Gleiche Topologie wie Standard-ACL. Extended ACL am Quell-Interface (Gi0/0 in)."` | `"Ähnliche Topologie wie die Standard-ACL, aber beide PCs liegen im selben Subnetz am Switch. Extended ACL am Quell-Interface (Gi0/0 in)."` | Die Standard-ACL hat drei getrennte Router-Ports (Gi0/0, Gi0/1, Gi0/2 mit PC0, PC1, Server), die Extended-ACL zwei. Die Topologien sind nicht gleich. |

## 5. ntp-syslog-snmp — services.tsx

| Stelle | Alt | Neu | Begründung |
|---|---|---|---|
| Zeilen 1822–1827 | `devices`: `{ type: "server", label: "NTP, Syslog, SNMP-Manager", count: 3 }`; `connections`: `"SW1 Gi0/1 → Server-VLAN 99 (10.0.0.0/24)"` | zusätzlich `{ type: "switch", label: "SW-Server (Server-VLAN 99)", count: 1 }`; `connections`: `"SW1 Gi0/1 ↔ SW-Server Gi0/1 (VLAN 99, 10.0.0.0/24)"`, `"NTP-Server (10.0.0.10) → SW-Server Fa0/1"`, `"Syslog-Server (10.0.0.20) → SW-Server Fa0/2"`, `"SNMP-Manager (10.0.0.30) → SW-Server Fa0/3"` | Die `description` (Zeile 1823) nennt die drei Server mit Adressen (`.10`, `.20`, `.30`) im Segment 10.0.0.0/24; drei Server an einem Port von SW1 gehen nur über einen Verteiler. Das ist kein Widerspruch, sondern eine fehlende Angabe. |

## 6. aaa-radius-tacacs — kein Widerspruch

Das Lab verortet den RADIUS-Server **nicht** ausdrücklich im Management-Netz: Die Zeile 1713 sagt nur `"SW1 Mgmt → RADIUS-Server (10.0.0.50)"`, die Management-SVI hat `192.168.1.254/24`. Die Adresse `10.0.0.50` steht nur in der RADIUS-Konfiguration (Zeile 1766). Es gibt keinen Satz, der behauptet, beide lägen im selben Netz.

Offen bleibt nur, **wie SW1 den Server erreicht** (kein Gateway, keine Route, kein Port). Optionaler Hinweis (nicht nötig, wenn das Lab bewusst ohne erreichbaren Server arbeitet — Zeile 1837 sagt genau das): in `connections` die Zeile `"SW1 Mgmt → RADIUS-Server (10.0.0.50)"` ändern in `"SW1 Mgmt → RADIUS-Server (10.0.0.50) — im Lab nicht erreichbar, der lokale Fallback greift"`.

## 7. Zusätzliche Befunde beim Aufbau der Topologien (Paket 1)

| Lab / Datei | Stelle | Alt | Neu | Begründung |
|---|---|---|---|---|
| ivr-svi — layer2.tsx | Zeile 1460 | `"MLS1 (Layer-3, z. B. 3560)"` | `"MLS1 (Layer-3, z. B. 3650)"` | Die Befehle verwenden `gi1/0/1` und `gi1/0/2`. Das ist das Schema der 3650 (der 3560 hat `Fa0/x`/`Gi0/x`). Die Topologie folgt der Konfiguration (3650-24PS). |
| vtp-dtp — layer2.tsx | Zeile 648 (SW2) | `interface range gi0/1 - 2\nswitchport mode trunk\nswitchport nonegotiate` | `interface gi0/1\nswitchport mode trunk\ninterface gi0/2\nswitchport mode trunk\nswitchport nonegotiate` (Erklärung zu Zeile 648 entsprechend anpassen) | SW1 steht auf `switchport mode dynamic desirable` (Zeile 604), SW2 auf `trunk` **mit** `nonegotiate`. Ein `nonegotiate`-Port sendet keine DTP-Frames, `desirable` bekommt keine Antwort und bleibt Access: der Trunk SW1–SW2 kommt nach Cisco-DTP-Verhalten nicht zustande, VTP synchronisiert dann nicht. Bitte in Packet Tracer gegenprüfen. Gi0/2 (zu SW3) bleibt statisch mit `nonegotiate`. |

Die Topologie zeichnet beide Verbindungen als Trunk (wie die Verbindungsliste des Labs sagt). Im Zielzustand zeigt `show interfaces trunk` auf SW1 daher **keinen** Trunk für Gi0/1 — das spiegelt die Lab-Konfiguration ehrlich wider.

## 8. Angenommene Switch-Ports (Paket 1 und 2)

In diesen Labs nennt der Lab-Text einen Switch-Port weder in der Verbindungsliste noch in einem `interface`-Befehl. Die Topologie folgt der Konvention **Uplink = Gi0/1, Endgeräte = Fa0/1.. in Gerätereihenfolge** und kennzeichnet die Ports in der Adressierungstabelle (Fußzeile „Ports angenommen“) und im Canvas-Inspector (Marke „angenommen“). „Neu“ ist ein Vorschlag, den du prüfen musst; Änderungen am Lab-Text mache ich nicht.

| Lab | Angenommene Ports | Vorschlag für `connections` (Neu) |
|---|---|---|
| basic-ip | Switch0 Fa0/1, Fa0/2, Gi0/1 | `"PC0 → Switch0 Fa0/1"`, `"PC1 → Switch0 Fa0/2"`, `"Switch0 Gi0/1 → Router0 GigabitEthernet0/0"` |
| ospf | SW1/SW2/SW3 Fa0/1, Gi0/1 | `"R1 Gi0/0 → SW1 Gi0/1, SW1 Fa0/1 → PC0"` (entsprechend SW2/PC1, SW3/PC2) |
| static-routing | SW1/SW2 Fa0/1, Fa0/2, Gi0/1 | `"PC0 → SW1 Fa0/1, PC1 → SW1 Fa0/2, SW1 Gi0/1 → R1 Gi0/0"`, `"R2 Gi0/0 → SW2 Gi0/1, SW2 Fa0/1 → PC2, SW2 Fa0/2 → PC3"` |
| rip-v1, rip-v2 | SW1/SW2/SW3 Fa0/1, Gi0/1 | Zeile `"LANs: …"` ergänzen um `"SWn Gi0/1 → Rn Gi0/0, PCx → SWn Fa0/1"` |
| rip-v2-passive | SW1 Gi0/1, Fa0/1, Fa0/2 | `"R2 Gi0/0 → SW1 Gi0/1"`, `"SW1 Fa0/1 → R3 Gi0/1"`, `"SW1 Fa0/2 → R4 Gi0/1"` (die Konfiguration nennt R3/R4 `Gi0/1`; „Fa/Gi“ im alten Text streichen) |
| ospf-dr-bdr-election | Sw1 Fa0/1–Fa0/4 | `"R1 Gi0/1 → Sw1 Fa0/1"`, `"R2 Gi0/1 → Sw1 Fa0/2"`, `"R3 Gi0/1 → Sw1 Fa0/3"`, `"R4 Gi0/1 → Sw1 Fa0/4"` |
| eigrp | SW1/SW3 Fa0/1, Gi0/1 | `"R1 Gi0/0 → SW1 Gi0/1, SW1 Fa0/1 → PC0"` (entsprechend R3/SW3/PC1) |

Die Liste wird mit jedem weiteren Paket um die Labs ergänzt, in denen Switch-Ports angenommen werden. Welche Ports angenommen sind, kann man jederzeit im Lab-Dialog unter der Adressierungstabelle nachlesen.

## 9. Paket 3 (IPv6): Befunde

| Lab | Stelle | Befund | Vorschlag (Neu) |
|---|---|---|---|
| ipv6-static — ipv6.tsx | Schritt 2 (R1-1) und Schritt 3 (R2-1): `ipv6 route 2001:DB8:CCAF:254::1/128 …` | Die Zieladresse `2001:DB8:CCAF:254::1/128` gehört zu keinem Gerät im Lab; auf dem Internet-Router gibt es dazu keine Route. Beide Standorte verweisen auf dieselbe Adresse. Die Topologie zeichnet sie nicht. | Entweder die Zeile streichen oder als Ziel die Loopback des jeweils anderen Standorts nennen (`2001:DB8:CCA2:254::2:1/128` auf R1-1, `2001:DB8:CCA1:254::1:1/128` auf R2-1). Bitte selbst entscheiden. |
| ipv6-static — ipv6.tsx | Verbindungsliste | Die Internet-Seite der Serial-Links ist nirgends konfiguriert; `…:1::1` ergibt sich nur als Next-Hop der Routen. Der Internet-Router hat daher im Export keine Interface-Adressen. | Ergänzen: `interface se0/0/0` → `ipv6 address 2001:DB8:CCA1:1::1/64` und `interface se0/1/0` → `ipv6 address 2001:DB8:CCA2:2::1/64` im Schritt „Gegenrouten auf dem Internet-Router“ (Serial-Taktgeber `clock rate` ebenfalls nicht genannt). |
| ipv6-ospfv3-eigrpv6 — ipv6.tsx | Geräteliste | Für die PCs steht nur die Adresse im Label (`FDAA::0101/64`), ein Gateway fehlt. Die Topologie zeigt „im Lab nicht angegeben“. | Pro PC ergänzen: `Default Gateway: FDAA::FFFF` (bzw. `FDBB::FFFF`, `FDCC::FFFF`), falls das gewollt ist. |
| ipv6-ospfv3-eigrpv6 — ipv6.tsx | PC-Nummerierung | PC2 hängt an R1, PC0 an R3 (gegenläufig). Topologie folgt dem Text. | Nur Hinweis, keine Änderung nötig. |

## 10. Paket 4 (Services): Befunde

| Lab | Stelle | Befund | Vorschlag |
|---|---|---|---|
| ntp-syslog-snmp | Schritt 1 (SW1) | `interface loopback0` auf dem Switch: ein Catalyst 2960 unterstützt keine Loopback-Interfaces (Packet Tracer ebenfalls nicht). Die Topologie zeichnet SW1 deshalb als Catalyst 3560-24PS (Layer 3). | In der Geräteliste `SW1 (Layer-3, z. B. 3560)` statt `SW1` nennen. |
| ntp-syslog-snmp | `connections`, `devices` | Die Serveradressen stehen nur in den Befehlen (`ntp server 10.0.0.10`, `logging host 10.0.0.20`, `snmp-server host 10.0.0.30`); die Server haben keine eigene Konfiguration, ein Gateway fehlt. Die Tabelle nennt sie mit dem Vermerk „Adresse aus …“. | Pro Server eine Zeile `Desktop > IP Configuration` mit Adresse, Maske /24 und ggf. Gateway ergänzen. |
| ipsec-s2s-vpn | `devices` / Schritt 8 | Der „DHCP-Server“ (192.168.1.11) hat keine DHCP-Pools, beide PCs sind statisch adressiert. | Entweder Pools ergänzen und PCs auf DHCP stellen oder das Gerät „Server“ nennen. |
| nat-pat, dynamic-nat, nat-pool-overload, static-nat | Schritt 1 | Gateway und Maske nur für PC0; `PC0(1)` und `PC0(2)` stehen nur im Geräte-Label (Adresse), ohne Gateway. | Je PC den Block `Gateway: 192.168.1.1` ergänzen. |
| dhcp-relay | siehe Abschnitt 1 | „Client Gelb“ (Geräteliste) ist nicht konfiguriert, SW2 hat keine angeschlossenen Geräte: die Topologie zeichnet beides nicht. | wie Abschnitt 1. |
| hsrp, ntp-syslog-snmp | siehe Abschnitte 3 und 5 | Verteiler fehlt: in der Topologie als „angenommen“ gestrichelt gezeichnet, ohne Export. | wie Abschnitte 3 und 5. |

Ergänzung zu Abschnitt 8 (angenommene Switch-Ports):

| Lab | Angenommene Ports | Vorschlag für `connections` (Neu) |
|---|---|---|
| dhcp | Switch0 Gi0/1, Fa0/1, Fa0/2 | `"PC0 → Switch0 Fa0/1"`, `"PC1 → Switch0 Fa0/2"`, `"Switch0 Gi0/1 → Router0 Gi0/0"` |
| dynamic-nat, static-nat | SW Fa0/1, Fa0/2, Fa0/3 | `"PC0 → SW Fa0/1"`, `"PC0(1) → SW Fa0/2"`, `"PC0(2) → SW Fa0/3"` |


## 11. Paket 5 (Security): Befunde

| Lab | Stelle | Befund | Vorschlag |
|---|---|---|---|
| co-acl-nat-isp | `connections` (ISP-SW) | Verbindungstext nennt `ISP-SW (Fa0/1, VLAN 99)` und `(Fa0/2, VLAN 199)`, die Konfiguration `ethernet 0/0` (VLAN 99), `ethernet 0/1` (VLAN 199) und `ethernet 0/2` (Trunk). Die Topologie folgt der Konfiguration. | Verbindungstext auf `ISP-SW Ethernet0/0` / `Ethernet0/1` / `Ethernet0/2 (Trunk)` ändern. |
| co-acl-nat-isp | Geräteliste | SW1/SW2 (Standort-LANs) und der Switch des Internet-Segments fehlen bzw. sind nicht konfiguriert; die Topologie zeichnet SW1/SW2 als „im Lab nicht konfiguriert“ und das Internet-Segment als „im Lab nicht angegeben“. EIGRP (CO-1, ISP-MUMBAI) ist nicht modelliert, daher zeigt CO-1 keine Nachbarn; OSPF CO-2 ↔ ISP-MUMBAI wird berechnet. | Switches mit Ports in Geräteliste und Verbindungsliste ergänzen. |
| dhcp-snooping-dai | Schritt „DHCP Snooping aktivieren“ | `ip dhcp snooping vlan 10`, aber kein VLAN 10 und keine Access-Ports in VLAN 10: die Ports Fa0/1–3 liegen im VLAN 1, Snooping würde nicht greifen. | `vlan 10` und `switchport access vlan 10` für Fa0/1–3 sowie Trunk/Access für Gi0/1 ergänzen (oder `snooping vlan 1`). |
| stp-hardening | Verbindungsliste | `Dist1 ↔ Dist2 (Gi0/3)`: Catalyst 2960 hat nur Gi0/1–2. Die Topologie nutzt ein Profil „2960 mit 4 Gigabit-Uplinks“. Dist-Ports zum Core sind nicht genannt (angenommen Gi0/1). | Dist-Ports nennen (`Core Gi0/1 ↔ Dist1 Gi0/1`, `Core Gi0/2 ↔ Dist2 Gi0/1`) und `Gi0/3` durch einen vorhandenen Port ersetzen. |
| stp-hardening | Schritt 1 (Core) | `spanning-tree vlan 1-100 priority 4096` gefolgt von `… root primary`: die Wirkung des Makros nach expliziter Priority ist uneindeutig. Die Topologie nimmt 4096 an. | Nur einen der beiden Befehle verwenden. |
| vlan-hopping, port-security | Hosts | Gateway (192.168.10.1 bzw. 192.168.1.1) ohne Gerät im Lab; VLAN 20 VOICE ohne Port. | Router ergänzen oder Gateway streichen. |
| ssh | `connections` | „direkt oder via Switch“: die Topologie zeichnet direkt. | Eine Variante festlegen. |
| device-hardening, aaa-radius-tacacs | `connections` | Admin-PC-Port am SW1 (und SW1-Port zum RADIUS-Server) nicht genannt: angenommen Fa0/1 bzw. Gi0/1. RADIUS-Maske und Weg dorthin fehlen. | Ports nennen; Maske/Gateway des Servers ergänzen. |

Ergänzung zu Abschnitt 8 (angenommene Switch-Ports):

| Lab | Angenommene Ports |
|---|---|
| device-hardening | SW1 Fa0/1 |
| stp-hardening | Dist1 Gi0/1, Gi0/3; Dist2 Gi0/1, Gi0/3 |
| aaa-radius-tacacs | SW1 Fa0/1, Gi0/1 |

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

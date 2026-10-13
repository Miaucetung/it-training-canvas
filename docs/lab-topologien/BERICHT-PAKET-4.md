# Lab-Topologien — Paket 4 (Services): Bericht

Branch `feature/lab-topologies-services` (aufbauend auf `feature/ipv6-outputs`). Nicht gemergt.
Neue Topologien (10): **dhcp, dhcp-relay, nat-pat, dynamic-nat, nat-pool-overload, static-nat, ntp-syslog-snmp, hsrp, gre-tunnel, ipsec-s2s-vpn**.
Lint 0 Fehler (48 Warnungen wie vorher), **1220 Tests in 58 Dateien grün**, Build grün, Layout-Audit: 0 Überlappungen, 0 Zonen-Konflikte, 0 Raster-Abweichungen in allen Labs, Screenshots 100/100 Prüfungen.

## 1. Neu im Fundament

| Baustein | Inhalt |
|---|---|
| DHCP-Clients | `TopologyInterface.dhcp = { network }`: Anzeige „DHCP (Netz/Präfix)“ im Diagramm, in der Tabelle (Maske „–“), im Canvas und im Inspector. Gesetzt nur, wenn das Lab den Desktop auf DHCP stellt (`◉ DHCP`, `IP-Konfiguration: DHCP`) und das Netz aus dem Lab-Text stammt; der Test prüft das Netz gegen Pool-`network`-Befehle und Interface-Adressen |
| Tunnel | Link-Typ `tunnel` (Canvas: gestrichelt violett; Lab-Diagramm ebenso), virtuelles Interface `Tu<N>` (Konverter, Profil). OSPF-Netztyp auf Tunneln ist point-to-point, die Nachbarschaft wird berechnet |
| Textmarken | `LabTopologyData.notes` (z. B. logischer IPSec-Tunnel ohne eigenes Interface), Teil der Geometrie-Prüfung |
| Angenommene Geräte | mehrere Links an einem angenommenen Gerät erhalten je einen eigenen Port „–“; Verbindungen zu angenommenen Geräten sind im Lab-Diagramm gestrichelt; Validierung (VLAN-Abgleich) überspringt sie |
| Konverter | Desktop-Zeilen `IP:`/`Maske:`; `Server-NIC: statisch …`; Adressen von Hosts aus dem Geräte-Label (`PC0(1) (192.168.1.11/24)`); Ports aus Geräte-Labels (`SW1 (Fa0/1–3, Gig0/1)`) zählen als „im Lab genannt“ |
| Hardware | Layer-3-Switches (3560/3650) mit `Lo0` |
| Tests | Verbindungstest versteht `────`-Ketten und Zeilen mit nur einem Port (`R1 Gi0/0 — 192.168.1.2/24`); Adresstest kennt DHCP-Zeilen, „Adresse aus `…`“ und Label-Adressen; neue Datei `lab-services-topologies.test.ts` (7 Prüfungen) |

## 2. Die Labs

| Lab | Geräte | Links | Besonderheit |
|---|---|---|---|
| dhcp | Router0, Switch0, PC0, PC1 | 3 | Clients „DHCP (192.168.1.0/24)“; Switch-Ports angenommen |
| dhcp-relay | R1, SW1, SW2, DHCP-Server, Client Rot/Blau | 5 | 2 Trunks, 3 VLAN-Zonen, Clients „DHCP (172.16.51.0/24)“ / „(172.16.61.0/24)“; Client Gelb und SW2-Endgeräte fehlen im Lab (nicht gezeichnet) |
| nat-pat, dynamic-nat, nat-pool-overload, static-nat | NAT-Router, ISP, INTERNET, Webserver, Switch, 3 PCs | 8 | gleiche Struktur, andere Adressen; NAT-Details (inside/outside, Pool, Overload, static) in Tabelle und CLI-Export |
| ntp-syslog-snmp | SW1 (3560), Verteiler (angenommen), 3 Server | 4 | Server-VLAN 99; Serveradressen aus den SW1-Befehlen |
| hsrp | R1, R2, PC0, Verteiler (angenommen) | 3 | virtuelle IP nur als Gateway des PCs und in der Zonenbeschriftung |
| gre-tunnel | Internet, R1-1, R2-1, PC0, PC1 | 5 | Tunnel12 als eigener Link, OSPF über den Tunnel |
| ipsec-s2s-vpn | 14 Geräte | 13 | Tunnel nur als Textmarke (Crypto Map hängt am physischen Interface) |

## 3. Offene Punkte und Annahmen

- Verteiler bei hsrp und ntp-syslog-snmp ist angenommen (gestrichelt, „im Lab nicht angegeben“, kein Export); Switch-Ports bei dhcp und dynamic-/static-nat angenommen (siehe `KORREKTURVORSCHLAEGE-LABTEXT.md`, Abschnitte 8 und 10).
- ntp-syslog-snmp: SW1 als Catalyst 3560, weil das Lab `interface loopback0` auf dem Switch konfiguriert (2960 kennt das nicht).
- Keine Simulation von NAT-Tabellen, HSRP-Zuständen, IKE/IPSec-SA oder GRE-Statistik: der CLI-Export enthält die Befehle, die `show`-Ausgaben dazu fehlen. Entscheidung offen, ob sie nachgerüstet werden sollen.
- NAT-Labs: Gateway nur für PC0 genannt, für PC0(1)/(2) „im Lab nicht angegeben“.

## 4. Selbstprüfung je Lab (was noch nicht gut aussieht)

**dhcp, dhcp-relay.** Gut: Clients ohne erfundene Adresse, VLAN-Zonen mit Netzadresse und Legende. Schwach: der Pool (Ausnahmen, DNS) steht nur in der Tabelle; im Canvas zeigt R1 im Badge nur die ersten zwei Subinterfaces (IPv4-Grenze).

**NAT-Labs.** Gut: Kette Webserver–INTERNET–ISP–NAT von rechts nach links mit Subnetz-Labels. Schwach: Das Diagramm ist 1200 px breit, auf 390 px nur mit Zoom lesbar; inside/outside steht nur in der Tabelle, nicht am Port.

**ntp-syslog-snmp, hsrp.** Gut: Angenommener Verteiler klar gestrichelt. Schwach: viel Leerraum; HSRP-Rollen (Active/Standby) stehen nur in der Tabelle.

**gre-tunnel.** Gut: Tunnel violett gestrichelt neben der physischen Serial-Strecke. Schwach: im Canvas überlappt das Serial-Port-Label am Internet-Router teilweise den IP-Badge (Canvas-Layout, nicht Lab-Daten).

**ipsec-s2s-vpn.** Gut: komplette Provider-Kette, Textmarke für den Tunnel. Schwach: größtes Diagramm (1290 × 640), Schrift im Lab-Dialog bei 1440 px klein (Zoom oder „Breit“ nötig).

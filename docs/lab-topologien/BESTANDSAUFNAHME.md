# Lab-Topologien — Schritt 1: Bestandsaufnahme (nur lesen, nichts umgesetzt)

Branch `feature/lab-topologies` (von `main` @ `53875eb`, `fix/claude-audit` ist gemergt).
Quelle: die 55 Labs in `src/components/labs/` (Lab-Text = Wahrheit). Rohdaten: `docs/audit-claude/belege/lab-inventar.txt`, Skripte `scripts/audit/lab-inventory.audit.ts` und `lab-topo-full.audit.ts`.
Geräte-/Link-Zahlen stammen aus dem Feld `topology` des Labs (Geräteliste und Verbindungsliste) und aus den Konfigurationsblöcken. „Links“ zählt jede Verbindung einzeln (inkl. Endgeräte).

## 1. Ergebnis in Zahlen

| Status | Anzahl | Bedeutung |
|---|---|---|
| Pilot fertig | 4 | basic-ip, vlan-trunking, roas, ospf |
| **ja** | 34 | Topologie vollständig aus dem Lab ableitbar |
| **bedingt** | 12 | Topologie möglich, aber das Lab lässt Angaben offen (siehe Spalte „Offen“) |
| **nein** | 5 | keine Netz-Topologie (Einzelgeräte, Konsole, Befehls-Cheatsheet) |

Lab-Anzahl pro Kategorie: drills 4, layer2 7, routing 10, ipv6 4, services 10, security 10, automation 3, operations 5, campus 2.

## 2. Tabelle aller 55 Labs

Legende Topologie: ✔ Pilot · ja · bed. (bedingt) · nein. „Offen“ = fehlende Angabe (nicht raten). „Widerspruch“ = Lab-Text widerspricht sich selbst (nicht korrigieren; die Konfiguration gilt, Begründung unten).

### drills (4)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| drill-grundkonfig | Drill: Grundkonfiguration ×3 | nein | 3 (R1, SW1, SW2) | 0 | „Keine Verkabelung nötig“ | — |
| drill-interfaces | Drill: Router-Interfaces hochziehen | ja | 2 Router | 1 (R1 Gi0/1 ↔ R2 Gi0/1, 10.0.0.0/30) | Je Router zwei LAN-Interfaces (192.168.10/20/30/40.0/24) ohne Endgerät → als Stub darstellen | — |
| drill-pc-ips | Drill: 6 PCs durchnummerieren | ja | 7 (SW1 + 6 PC) | 6 (Fa0/1–6) | Switch-Modell; Präfix der PC-IPs (192.168.50.11–.16) | — |
| drill-access-ports | Drill: Access-Ports im Akkord | nein | 2 Switches | 0 | „reines Konfigurationstraining“ | — |

### layer2 (7)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| basic-ip | IP-Grundkonfiguration | ✔ | 4 | 3 | — | — |
| vlan-trunking | VLANs & Trunking | ✔ | 6 | 5 | — | — |
| roas | Inter-VLAN Routing (RoaS) | ✔ | 4 | 3 | — | — |
| stp | STP — PortFast & BPDU Guard | ja | 4 (2 SW, 2 PC) | 4 (2 redundante Gi-Links, 2 PCs) | STP-Rollen werden nicht im Lab genannt (Root = SW1) | — |
| vtp-dtp | VTP & DTP | ja | 5 (3 SW, 2 PC) | 4 | — | — |
| etherchannel | EtherChannel (LACP) | ja | 4 | 4 (2 gebündelte Fa-Links) | — | — |
| ivr-svi | Inter-VLAN Routing (L3-Switch / SVI) | ja | 3 (MLS1, 2 PC) | 2 | Modell: Lab nennt „Layer-3, z. B. 3560“, Spec ist 3650-24PS → Lab folgen, Profil ergänzen oder entscheiden | — |

### routing (10)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| static-routing | Statisches Routing | ja | 8 (2 R, 2 SW, 4 PC) | 7 | Switch-Ports der PCs nicht genannt | — |
| floating-static | Floating Static Route | bed. | 1 Router (+ ISP-MPLS, DSL-Modem als Gegenstellen) | 2 | Gegenstellen 10.1.1.1 und 10.2.2.1 sind keine Geräte im Lab; Darstellung als Wolke/Router offen | — |
| rip-v1 | RIPv1 — Classful | ja | 9 (3 R, 3 SW, 3 PC) | 8 | Switch-Ports nicht genannt; WAN-Netze /24 | — |
| rip-v2 | RIPv2 — Dynamisches Routing | ja | 9 | 8 | Switch-Ports nicht genannt | — |
| rip-v2-passive | RIPv2 + Passive Interface (4 Router) | ja | 8 (4 R, SW1, PC0, 2 Server) | 7 | Switch-Ports; R3 „Fa/Gi 10.0.0.10“ — Konfiguration nennt Gi0/1 | — |
| ospf | OSPF — Single Area 0 | ✔ | 9 | 9 | — | Verbindungsliste vs. R3-Konfiguration (Konfiguration gilt, erledigt) |
| ospf-rid-wildcard | OSPF Single-Area — Loopback-RID & Wildcard | ja | 5 (3 R, 2 PC) | 4 (PCs direkt am Router) | — | — |
| ospf-dr-bdr-election | OSPF DR/BDR-Wahl (Multi-Access) | ja | 9 (4 R, Sw1, PC0, 3 Server) | 8 | Anschluss der Server an R2–R4 (Gi0/0) ergibt sich nur aus „LANs“ | — |
| ospf-multiarea | OSPF Multi-Area | ja | 5 | 4 | — | — |
| eigrp | EIGRP Grundlagen | ja | 7 (3 R, 2 SW, 2 PC) | 7 (Dreieck + 2 LAN + 2 PC) | R2 hat kein LAN | — |

### ipv6 (4)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| ipv6 | IPv6 Grundkonfiguration | ja | 4 | 3 | PCs direkt an Gi0/0 bzw. Gi0/0 (kein Switch) | — |
| ipv6-static | IPv6 Static Routing | bed. | 3 Router (Internet, R1-1, R2-1) | 2 (Serial) | Adressen der Internet-Seite der Serial-Links stehen nicht in der Konfiguration (nur die Netze 2001:DB8:CCA1:1::/64 und …CCA2:2::/64); Serial-Slots Se0/0/0 bzw. Se0/1/0 | — |
| ospfv3-ipv6 | OSPFv3 für IPv6 | ja | 4 | 3 | — | — |
| ipv6-ospfv3-eigrpv6 | IPv6 Routing — OSPFv3 + EIGRPv6 | ja | 6 (3 R, 3 PC) | 6 | PC-Nummerierung gegenläufig (PC2 an R1, PC0 an R3) — so übernehmen | — |

### services (10)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| dhcp | DHCPv4 auf Router | ja | 4 | 3 | PCs erhalten Adressen per DHCP: Zielzustand zeigt „DHCP“, keine erfundenen Werte | — |
| dhcp-relay | DHCP Relay über VLAN-Grenzen | ja | 7 | 4 genannt | dritter Client „Gelb“ ohne Port (Gelb = Server-VLAN 71); SW2 Fa0/1–10 konfiguriert, kein Gerät genannt | Geräteliste: 3 Clients, Verbindungsliste: 2 |
| nat-pat | NAT / PAT (Overload) | ja | 8 | 7 | — | — |
| dynamic-nat | Dynamisches NAT (Pool) | ja | 8 | 7 | — | — |
| nat-pool-overload | Dynamic NAT — Pool + Overload | ja | 8 | 7 | — | — |
| static-nat | Statisches NAT | ja | 8 | 7 | — | — |
| ntp-syslog-snmp | NTP + Syslog + SNMPv2c | bed. | 4 (SW1, 3 Server) | 1 genannt | drei Server an einem Port „Gi0/1 → Server-VLAN 99“ ohne Verteiler; Server-Adressen | — |
| hsrp | HSRP First-Hop Redundancy | bed. | 3 (R1, R2, PC0) | 3 + Verteiler | ein gemeinsames LAN ohne Switch im Lab | R1, R2 und PC0 teilen ein Segment, ein Switch fehlt |
| gre-tunnel | GRE-Tunnel-VPN zwischen Sites | ja | 5 | 4 + Tunnel | — | — |
| ipsec-s2s-vpn | IPSec Site-to-Site VPN: Hamburg ↔ Bremen | ja | 14 | 13 + Tunnel | größtes Lab (19 Schritte); alle Verbindungen stehen in der Liste | — |

### security (10)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| ssh | SSH Remote-Zugriff | ja | 2 | 1 | „Admin-PC → R1 Gi0/0 direkt oder via Switch“: Variante offen (Vorschlag: direkt) | — |
| device-hardening | Device Hardening | ja | 2 | 1 | Port des Admin-PCs am SW1 nicht genannt | — |
| port-security | Port Security | ja | 4 (SW1, PC1, PC2, PC3) | 2 (+ PC3 später) | PC3 „zunächst nicht angeschlossen“ → Start-/Zielzustand | — |
| acl-standard | Standard ACL | ja | 4 | 3 (PCs direkt am Router) | — | — |
| acl-extended | Extended ACL | bed. | 4 (R1, 2 PC, Web-Server) | 3 | beide PCs liegen in 192.168.1.0/24 am selben Port Gi0/0, ein Switch fehlt | zwei Hosts an einer Router-Schnittstelle |
| dhcp-snooping-dai | DHCP Snooping + DAI | ja | 5 | 4 | — | — |
| stp-hardening | STP Root-Bridge Hardening | ja | 4 (Core, Dist1, Dist2, Rogue) | 3 (+ Rogue später) | Ports auf der Dist-Seite nicht genannt (nur Core Gi0/1–2 und „Dist1 ↔ Dist2 Gi0/3“) | — |
| vlan-hopping | VLAN-Hopping & Mitigation | ja | 6 | 4 (+ Angreifer-Switch später) | Start-/Zielzustand (Angriff vs. gehärtet) | — |
| aaa-radius-tacacs | AAA mit RADIUS | bed. | 3 | 2 | RADIUS-Server 10.0.0.50 liegt nicht im Netz 192.168.1.0/24 von SW1; Verbindung „SW1 Mgmt → RADIUS“ ohne Port | Adressplan: Management-SVI 192.168.1.254 vs. RADIUS 10.0.0.50 |
| co-acl-nat-isp | ACL + Static NAT — Dual-Site mit ISP | bed. | 4 Router/Switches + 13 Endgeräte | ≈ 17 | Interface-Namen `ETH0/0`, `ETH0/1` (kein Packet-Tracer-Name); Switches der Standort-LANs (SW1/SW2) stehen in der Verbindungsliste, aber nicht in der Geräteliste; hat bereits ein eigenes JSX-Diagramm | Geräteliste vs. Verbindungsliste (SW1, SW2) |

### automation (3)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| netflow | NetFlow / Flexible NetFlow | bed. | 2 | 1 | Verbindung R1 ↔ Collector nur als „Mgmt“ genannt, Port offen | — |
| restconf | REST API mit RESTCONF | bed. | 2 (IOS-XE, Admin-PC) | 1 | Port offen; Modell IOS-XE (kein ISR 2911) | — |
| netconf-yang | NETCONF + YANG | bed. | 2 | 1 | wie restconf | — |

### operations (5)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| password-recovery | Password Recovery | nein | 2 + Konsolen-PC | Konsolenkabel | keine Netz-Topologie | — |
| ios-backup-upgrade | IOS-Backup & Upgrade (TFTP) | bed. | 2 | 1 | Adressen nur als „z. B. 10.1.1.0/24“ | — |
| layer1-issues | Cable & Layer-1-Issues | nein | 1 Switch | 0 | Fa0/5 mit Zählerwerten, kein Netz | — |
| troubleshooting-cheat | Show-Cheat-Lab (Troubleshooting) | nein | „bestehendes Netz“ | — | PC → SW1 → R1 → Internet → Webserver ohne Adressen | — |
| dhcp-troubleshoot-lab | DHCP Troubleshooting: 3 Fehler finden | bed. | 5 | 4 | Fehlersuche: 3 beabsichtigte Fehler im Startzustand; Konfiguration im Lab nur teilweise (R1 Gi0/0.51, SW1-SVI 192.168.2.50) | — |

### campus (2)

| ID | Titel | Topo | Geräte | Links | Offen | Widerspruch |
|---|---|---|---|---|---|---|
| vlan-dhcp-nat-roas | VLAN + DHCP + NAT — Campus mit Internetzugang | ja | 12 | 11 | PC-Namen uneinheitlich (PC3, PC4, C5, PC0, PC2, PC1) — so übernehmen | — |
| vlan-vtp-dhcp-campus | Campus: VTP + RoaS + zentrales DHCP (3 Switches) | ja | 13 (R1, 3 SW, 9 PC) | 13 | — | — |

## 3. Lücken, die über mehrere Labs reichen

1. **Serial-Schnittstellen:** gre-tunnel und ipv6-static verwenden `Se0/0/0`, `Se0/0/1` bzw. `Se0/1/0`. Das Standardprofil des Codes (2911) kennt nur `Se0/1/0` und `Se0/1/1`. Das Profil braucht eine Ergänzung (HWIC-2T in Slot 0) oder das Lab bekommt ein eigenes Profil.
2. **Endgeräte:** PCs heißen im Lab `Fa0` (Packet Tracer), Server `Fa0`. Das Profil `pc`/`server` im Code hat `eth0`. Für Lab-Topologien gilt der Name aus dem Lab.
3. **DHCP-Clients** (dhcp, dhcp-relay, dhcp-snooping-dai, dhcp-troubleshoot-lab, vlan-dhcp-nat-roas, vlan-vtp-dhcp-campus, ipsec): Adressen ergeben sich zur Laufzeit. Die Vorlage zeigt „DHCP“ und nennt keine konkreten Werte.
4. **Modelle:** 3560 (ivr-svi), IOS-XE (restconf, netconf-yang), `ETHx/x`-Router (co-acl-nat-isp). Hier befolge ich das Lab und ergänze das Hardware-Profil, sofern du das so willst.
5. **Fehlersuche-Labs:** dhcp-troubleshoot-lab (Start = fehlerhaft, Ziel = behoben); layer1-issues ist ein Zähler-Lab ohne Netz. Beabsichtigte Fehler werden im Datensatz gekennzeichnet.
6. **Verteiler fehlen** (hsrp, acl-extended, ntp-syslog-snmp): Ohne Switch ist das Segment nicht aufbaubar. Vorschlag: Gerät im Datensatz als `assumed` markieren und im Diagramm gestrichelt zeichnen — oder diese Labs bis zu deiner Korrektur zurückstellen.

## 4. Widersprüche im Lab-Text (nicht korrigiert)

| Lab | Widerspruch | Vorgehen |
|---|---|---|
| ospf | Verbindungsliste vs. Konfiguration von R3 | erledigt: Konfiguration gilt |
| dhcp-relay | Geräteliste „3 Clients (Rot/Blau/Gelb)“, Verbindungsliste nur Rot und Blau | Konfiguration gilt; dritter Client bleibt offen |
| co-acl-nat-isp | Verbindungsliste nennt SW1/SW2, Geräteliste nicht | Verbindungsliste + Konfiguration; SW1/SW2 als Switches aufnehmen |
| hsrp | R1, R2, PC0 in einem LAN, kein Switch genannt | als offen markieren |
| acl-extended | zwei Hosts am selben Router-Port, kein Switch | als offen markieren |
| aaa-radius-tacacs | RADIUS-Server 10.0.0.50 vs. Management-Netz 192.168.1.0/24 | Adressen aus der Konfiguration, Verbindung offen |

## 5. Vorschlag: Pakete

Reihenfolge laut Auftrag; vorgeschlagen sind Pakete je Kategorie, die Pilot-Labs zählen mit. Die Zahl in Klammern sind neue Topologien.

| Paket | Labs (neu) | Inhalt |
|---|---|---|
| 1 Layer 2 | stp, vtp-dtp, etherchannel, ivr-svi (4) | + gemeinsames Fundament: Datenformat/Loader „Topologie im Canvas öffnen“, Kategorie „Unterrichts-Labs“, CLI-Export, Hervorhebung Tabelle ↔ Diagramm, Screenshot-Skript (die vier Piloten werden darauf umgestellt) |
| 2 Routing | static-routing, floating-static, rip-v1, rip-v2, rip-v2-passive, ospf-rid-wildcard, ospf-dr-bdr-election, ospf-multiarea, eigrp (9) | + Drills: drill-interfaces, drill-pc-ips (2) |
| 3 IPv6 | ipv6, ipv6-static, ospfv3-ipv6, ipv6-ospfv3-eigrpv6 (4) | Serial-Profil-Ergänzung |
| 4 Services | dhcp, dhcp-relay, nat-pat, dynamic-nat, nat-pool-overload, static-nat, ntp-syslog-snmp, hsrp, gre-tunnel, ipsec-s2s-vpn (10) | größtes Lab ipsec; hsrp/ntp bedingt |
| 5 Security | ssh, device-hardening, port-security, acl-standard, acl-extended, dhcp-snooping-dai, stp-hardening, vlan-hopping, aaa-radius-tacacs, co-acl-nat-isp (10) | co-acl-nat-isp mit vorhandenem JSX-Diagramm abgleichen |
| 6 Operations und Automation | ios-backup-upgrade, dhcp-troubleshoot-lab, netflow, restconf, netconf-yang (5) | Fehlerkennzeichnung; password-recovery, layer1-issues, troubleshooting-cheat, drill-grundkonfig, drill-access-ports: keine Topologie |
| 7 Campus | vlan-dhcp-nat-roas, vlan-vtp-dhcp-campus (2) | 12–13 Geräte |

Summe neue Topologien: 4 + 11 + 4 + 10 + 10 + 5 + 2 = 46; zusammen mit den 4 Piloten 50 von 55; 5 Labs ohne Topologie.

## 6. Entscheidungen, die ich von dir brauche

1. Fehlende Verteiler (hsrp, acl-extended, ntp-syslog-snmp): als „angenommen“ (gestrichelt, im Datensatz markiert) zeichnen oder zurückstellen?
2. Hardware: Serial-Ergänzung am 2911 (`Se0/0/0`, `Se0/0/1`, `Se0/1/0`, `Se0/1/1`), 3560 für ivr-svi, IOS-XE-Router und `ETHx/x`-Namen für co-acl-nat-isp: jeweils Lab folgen und Profil ergänzen — einverstanden?
3. DHCP-Clients ohne Adresse im Diagramm („DHCP“): einverstanden?
4. Die vier Piloten auf das neue Datenformat/Loader umstellen (Paket 1), oder unverändert lassen?
5. Reihenfolge der Pakete wie oben; die zwei Drill-Labs in Paket 2 mitnehmen?

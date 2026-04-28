// ============================================================
// CCNA Topic: Routing & OSPF
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_ROUTING_FUNDAMENTALS: Concept = {
  id: "routing-fundamentals",
  title: "Routing-Grundlagen & Routing-Tabelle",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "routing", "layer-3", "static-routes", "default-route"],
  content: `
## Routing-Grundlagen

### Wie trifft ein Router Weiterleitungsentscheidungen?
1. Schaut in die **Routing-Tabelle** (RIB)
2. Longest Prefix Match: spezifischste Route gewinnt
3. Kein Match → Paket verworfen (oder Default Route)

### Routing-Tabelle
\`\`\`
R1# show ip route
Codes: C - connected, S - static, R - RIP, O - OSPF, B - BGP

C   192.168.1.0/24 is directly connected, GigabitEthernet0/0
O   10.0.0.0/8     [110/2] via 192.168.1.2, 00:01:23, Gi0/1
S   0.0.0.0/0      [1/0] via 192.168.1.1
\`\`\`

Format: **Protokoll Netz/Präfix [AD/Metric] via Next-Hop, Uptime, Interface**

### Administrative Distance (AD)
| Route-Typ | AD |
|-----------|-----|
| Connected | 0 |
| Static | 1 |
| OSPF | 110 |
| EIGRP | 90 |
| RIP | 120 |
| iBGP | 200 |

**Kleinster AD gewinnt** — höhere AD = weniger vertrauenswürdig

### Statische Routen
\`\`\`
! Next-Hop
R1(config)# ip route 192.168.2.0 255.255.255.0 192.168.1.2
! Ausgangsinterface
R1(config)# ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1
! Default Route
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
\`\`\`

### Floating Static Route
Höhere AD als dynamisches Protokoll → nur als Backup aktiv
\`\`\`
R1(config)# ip route 192.168.2.0 255.255.255.0 192.168.1.2 200  ! AD=200
\`\`\`
  `.trim(),
};

export const CONCEPT_OSPF: Concept = {
  id: "ospf",
  title: "OSPF — Open Shortest Path First",
  appliesTo: ["ccna"],
  tags: [
    "networking",
    "ospf",
    "routing",
    "dynamic-routing",
    "link-state",
    "area",
  ],
  content: `
## OSPF (OSPFv2, RFC 2328)

OSPF ist ein **Link-State-Routing-Protokoll** (IGP) mit Dijkstra SPF-Algorithmus.

### OSPF-Konzepte
- **Router-ID**: Eindeutige 32-Bit-ID (höchste IP oder manuell)
- **Neighbor**: OSPF-Router die direkt benachbart sind (Hello-Pakete)
- **Adjacency**: Vollständig synchronisierter Nachbar (Full State)
- **LSA (Link State Advertisement)**: Routerinformationen
- **LSDB (Link State Database)**: Alle LSAs eines Bereichs
- **SPF-Algorithmus**: Berechnet Shortest Path Tree

### OSPF-Metrik: Cost
Cost = 100 Mbit/s ÷ Interface-Bandbreite

| Interface | Cost |
|-----------|------|
| Serial (1.544 Mbit/s) | 64 |
| FastEthernet (100 Mbit/s) | 1 |
| GigabitEthernet (1 Gbit/s) | 1 (Auto-Cost Problem!) |

**Empfehlung**: \`auto-cost reference-bandwidth 10000\` (10 Gbit/s Referenz)

### OSPF-Nachbar-Zustände
Down → Init → 2-Way → ExStart → Exchange → Loading → **Full**

### Designated Router (DR) & Backup DR (BDR)
Auf Broadcast-Netzen (Ethernet): Wahl von DR/BDR zur Reduzierung von Adjacencies
- Höchste Priorität (default 1) → DR
- Zweithöchste → BDR
- \`ip ospf priority 0\` = niemals DR/BDR

### Single-Area OSPF (Area 0)
\`\`\`
R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1
R1(config-router)# network 192.168.1.0 0.0.0.255 area 0
R1(config-router)# passive-interface GigabitEthernet0/0  ! Kein OSPF Hello
R1(config-router)# default-information originate         ! Default Route verteilen

R1# show ip ospf neighbor
R1# show ip ospf database
R1# show ip route ospf
\`\`\`

### Multi-Area OSPF
- **Area 0 (Backbone)**: Alle anderen Areas müssen mit Area 0 verbunden sein
- **ABR (Area Border Router)**: Verbindet zwei Areas
- **ASBR (Autonomous System Boundary Router)**: Redistributiert externe Routen
- Reduziert LSDB-Größe, lokalisiert SPF-Berechnungen
  `.trim(),
};

export const CONCEPT_INTER_VLAN_ROUTING: Concept = {
  id: "inter-vlan-routing",
  title: "Inter-VLAN Routing",
  appliesTo: ["ccna"],
  tags: [
    "networking",
    "vlan",
    "routing",
    "router-on-a-stick",
    "layer-3-switch",
  ],
  content: `
## Inter-VLAN Routing

Kommunikation zwischen VLANs erfordert Layer-3-Routing.

### Methode 1: Legacy (separater Router-Port pro VLAN)
- Physisch eine Verbindung pro VLAN → nicht skalierbar

### Methode 2: Router-on-a-Stick
- Ein Trunk-Link zwischen Switch und Router
- Router erstellt Sub-Interfaces pro VLAN

\`\`\`
R1(config)# interface GigabitEthernet0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0

R1(config)# interface GigabitEthernet0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
\`\`\`

### Methode 3: Layer-3-Switch (SVIs)
- SVI (Switched Virtual Interface) pro VLAN
- Hochperformant, keine physische Router-Verbindung nötig

\`\`\`
SW(config)# ip routing
SW(config)# interface vlan 10
SW(config-if)# ip address 192.168.10.1 255.255.255.0
SW(config-if)# no shutdown

SW(config)# interface vlan 20
SW(config-if)# ip address 192.168.20.1 255.255.255.0
\`\`\`
  `.trim(),
};

export const CONCEPT_ROUTING_OSPF_GUIDE: Concept = {
  id: "routing-ospf-guide",
  title: "Lernguide: Routing & OSPF",
  appliesTo: ["ccna"],
  tags: ["routing", "ospf", "layer-3", "dynamic-routing", "guide"],
  content: `
## Lernziele
- Statische Routen und eine Default Route auf einem Cisco-Router konfigurieren
- OSPF Single-Area (Area 0) mit korrekter Wildcard-Maske und Router-ID einrichten
- Den OSPF-Nachbarzustand (Neighbor State) bis "Full" interpretieren
- Administrative Distance erklären und wissen, wann eine statische Route eine OSPF-Route verdrängt
- Inter-VLAN Routing über Router-on-a-Stick oder Layer-3-Switch konfigurieren

## Praxis-Szenario
Die "LogiSpeed GmbH" (Logistik, 3 Standorte: Hamburg, Berlin, München) möchte ihre drei Büros über Mietleitungen verbinden. Jeder Standort betreibt einen Cisco ISR 4351. Die Leitungen bilden ein Dreieck: Hamburg (R1: 10.0.12.1/30) ↔ Berlin (R2: 10.0.12.2/30 und 10.0.23.1/30) ↔ München (R3: 10.0.23.2/30). Jeder Router hat ein LAN-Interface: R1 192.168.1.0/24, R2 192.168.2.0/24, R3 192.168.3.0/24. Alle Router sollen in OSPF Area 0 konvergieren. Loopback-Interfaces (1.1.1.1, 2.2.2.2, 3.3.3.3) dienen als stabile Router-IDs.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit drei Routern (R1, R2, R3) in einem Dreieck. Füge pro Router ein Loopback-Interface und ein LAN-Subnetz (mit einem angeschlossenen PC) hinzu. Beschrifte alle WAN-Links mit den Point-to-Point-Subnetzen (/30). Notiere neben jedem Router die OSPF-Router-ID.
**Ziel:** Die vollständige OSPF-Area-0-Konfiguration visualisieren und zeigen, dass alle drei Router-LANs im gesamten Netz erreichbar sind.
**Tipps:** Konfiguriere auf jedem Router \`router-id X.X.X.X\` bevor OSPF gestartet wird — andernfalls wählt IOS automatisch eine Router-ID, was zu unerwarteten Ergebnissen führt. Überprüfe mit \`show ip ospf neighbor\`.

## Verständnisfragen
1. Was ist der Unterschied zwischen Administrative Distance und Metric — und warum gewinnt eine OSPF-Route (AD 110) gegen eine RIP-Route (AD 120)?
2. Welche Wildcard-Maske gehört zum Netz 192.168.2.0/24 — und wie lautet der vollständige OSPF-network-Befehl?
3. Wann wird auf einem Ethernet-Segment ein Designated Router (DR) gewählt — und welcher Router wird DR, wenn alle Prioritäten gleich sind?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **Falsche Wildcard-Maske im network-Befehl:** \`network 192.168.1.0 255.255.255.0 area 0\` ist falsch — die dritte Zahl muss die Wildcard-Maske sein (0.0.0.255), nicht die Subnetzmaske. OSPF startet zwar, aber keine Nachbarn kommen hoch.
- ⚠️ **Router-ID nicht eindeutig:** Wenn zwei Router dieselbe Router-ID haben, bilden sie keine Adjacency. Immer \`router-id\` manuell setzen und Loopback-Interfaces verwenden, da diese stabil bleiben.
- ⚠️ **passive-interface auf falscher Seite:** \`passive-interface\` unterdrückt OSPF-Hello-Pakete — nützlich für LAN-Interfaces ohne OSPF-Nachbarn. Auf WAN-Interfaces versehentlich gesetzt, kommt keine Adjacency zustande.
  `.trim(),
};

export const TOPIC_ROUTING_OSPF: Topic = {
  id: "routing-ospf",
  title: "Routing & OSPF",
  description:
    "Routing-Grundlagen, statische Routen, OSPF Single- und Multi-Area, Inter-VLAN Routing — Layer-3-Vermittlung meistern.",
  conceptIds: [
    "routing-fundamentals",
    "ospf",
    "inter-vlan-routing",
    "routing-ospf-guide",
  ],
  quizIds: ["ccna-quiz-ospf"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing", "switching-vlans"],
  estimatedMinutes: 180,
  tags: ["routing", "ospf", "layer-3"],
};

export const ROUTING_CONCEPTS: Record<string, Concept> = {
  "routing-fundamentals": CONCEPT_ROUTING_FUNDAMENTALS,
  ospf: CONCEPT_OSPF,
  "inter-vlan-routing": CONCEPT_INTER_VLAN_ROUTING,
  "routing-ospf-guide": CONCEPT_ROUTING_OSPF_GUIDE,
};

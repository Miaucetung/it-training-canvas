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
Cost = Referenzbandbreite ÷ Interface-Bandbreite (Ergebnis auf ganze Zahl abgerundet, Minimum 1)

**⚠️ Standard-Fallstrick: Default-Referenzbandbreite = 100 Mbit/s**
Alle Links ab 100 Mbit/s aufwärts bekommen dieselbe Cost **1**:

| Interface | Bandbreite | Cost (Default ref-bw 100M) | Cost (ref-bw 100000 = 100G) |
|-----------|-----------|---------------------------|----------------------------|
| Serial | 1.544 Mbit/s | 64 | 64.772 → 64 |
| FastEthernet | 100 Mbit/s | **1** | 1000 |
| GigabitEthernet | 1 Gbit/s | **1** | 100 |
| 10GigabitEthernet | 10 Gbit/s | **1** | 10 |

→ OSPF kann standardmäßig nicht zwischen FastEthernet, GigE und 10GigE unterscheiden!

**Lösung**: \`auto-cost reference-bandwidth 100000\` **konsistent auf allen Routern der Area**:
\`\`\`
R1(config-router)# auto-cost reference-bandwidth 100000
\`\`\`
Inkonsistente Werte über Routergrenzen hinweg führen zu asymmetrischem Routing.

### OSPF-Nachbar-Zustände (Übersicht)
Down → Init → 2-Way → ExStart → Exchange → Loading → **Full**

Details siehe Konzept \`ospf-neighbor-states\`.

### Designated Router (DR) & Backup DR (BDR)
Details und Wahlkriterien → Konzept \`ospf-dr-bdr\`.
- Höchste Priorität (default 1) → DR, Zweithöchste → BDR
- \`ip ospf priority 0\` = niemals DR/BDR
- **Non-Preemptive**: Neuer Router mit höherer Priorität verdrängt bestehenden DR **nicht** automatisch

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

export const CONCEPT_OSPF_NEIGHBOR_STATES: Concept = {
  id: "ospf-neighbor-states",
  title: "OSPF Neighbor-States & Troubleshooting",
  appliesTo: ["ccna"],
  tags: ["ospf", "routing", "neighbor", "adjacency", "troubleshooting"],
  content: `
## OSPF Nachbar-Zustände (7 States)

### Vollständige State-Machine
\`\`\`
Down → Init → 2-Way → ExStart → Exchange → Loading → Full
\`\`\`

| State | Beschreibung | Erwarteter Fortschritt |
|-------|-------------|----------------------|
| **Down** | Kein Hello empfangen (oder Interface down) | Sobald Interface up + Hello gesendet |
| **Init** | Hello vom Nachbarn empfangen, eigene Router-ID aber noch nicht im Hello des Nachbarn | Nach nächstem Hello mit eigener RID |
| **2-Way** | Beide Router sehen sich gegenseitig im Hello. DR/BDR-Wahl findet hier statt. DROther-Router bleiben hier stehen (normal!) | Nur DR/BDR bilden Full-Adjacency mit allen |
| **ExStart** | Master/Slave-Aushandlung per DBD-Paketen (leerer Header). Höchste Router-ID = Master | Nach Einigung über Sequenznummer |
| **Exchange** | DBD-Pakete (Database Description) werden ausgetauscht — enthält LSDB-Zusammenfassung | Nach vollständigem DBD-Austausch |
| **Loading** | LSR / LSU für fehlende LSAs werden ausgetauscht | Nach vollständiger LSDB-Synchronisation |
| **Full** | LSDB vollständig synchronisiert — SPF-Berechnung möglich | Stabil (Zielzustand) |

### Wichtiger Sonderfall: 2-Way ist kein Fehler!
- **DR/BDR** zu allen anderen Routern im Segment: Zustand **Full**
- **DROther** zu anderen DROther-Routern: Zustand **2-Way** — das ist korrekt und gewollt
- Prüfungsfrage: "Nachbar bleibt in 2-Way" → beide Router sind DROther (Priority 1, gleiche Priorität, kleinere Router-ID verliert)

### Häufige Ursachen für blockierte Adjacency

| Symptom | Wahrscheinliche Ursache | Diagnose |
|---------|------------------------|---------|
| Bleibt in **Init** | Firewall blockiert 224.0.0.5 (OSPF All-Routers-Multicast) | \`debug ip ospf hello\` |
| Bleibt in **2-Way** | Beide sind DROther (normal) **oder** Priority 0 auf beiden | \`show ip ospf interface\` |
| Bleibt in **ExStart** | Router-ID-Konflikt (zwei Router mit gleicher RID) | \`show ip ospf\` auf beiden |
| Bleibt in **Exchange** | MTU-Mismatch — DBD-Paket passt nicht durch | \`show ip ospf interface\` → MTU prüfen |
| Gar kein Hello | Hello/Dead-Timer-Mismatch, falsche Area-ID, Authentication | \`debug ip ospf adj\` |

### Hello-Timer / Dead-Timer — beide Seiten MÜSSEN übereinstimmen
- Standard Broadcast/P2P: Hello 10s, Dead 40s
- Standard NBMA: Hello 30s, Dead 120s
- Timer können manuell gesetzt werden — aber bei Mismatch: kein Adjacency!
\`\`\`
R1(config-if)# ip ospf hello-interval 5
R1(config-if)# ip ospf dead-interval 20
\`\`\`

### Cisco IOS Command Reference
\`\`\`
show ip ospf neighbor              ! Zustand, Dead-Timer, DR/BDR pro Segment
show ip ospf neighbor detail       ! Volldetails inkl. Timer, Interface, MTU
show ip ospf interface Gi0/0       ! Timer, Netzwerktyp, Cost, DR/BDR-Info
debug ip ospf adj                  ! Adjacency-Aufbau Echtzeit-Diagnose
clear ip ospf process              ! OSPF-Prozess neu starten (alle Adjacencies reset)
\`\`\`
  `.trim(),
};

export const CONCEPT_OSPF_DR_BDR: Concept = {
  id: "ospf-dr-bdr",
  title: "OSPF DR/BDR-Wahl & Netzwerktypen",
  appliesTo: ["ccna"],
  tags: ["ospf", "dr", "bdr", "network-type", "broadcast", "point-to-point"],
  content: `
## OSPF Designated Router (DR) und Backup DR (BDR)

### Warum DR/BDR?
In einem Broadcast-Segment mit N Routern entstehen ohne DR/BDR: N×(N-1)/2 Adjacencies.
Mit DR/BDR bildet jeder Router Adjacency nur mit DR und BDR → drastisch weniger Overhead.

| Beispiel (5 Router) | Adjacencies |
|---------------------|------------|
| Ohne DR/BDR | 5×4/2 = **10** |
| Mit DR/BDR | **4** (je Router zu DR und BDR) |

### DR/BDR-Wahlkriterien (in dieser Reihenfolge)
1. **Höchste OSPF-Priority** (Range 0–255, Standard: 1) → wird DR
2. **Zweithöchste Priority** → wird BDR
3. **Gleichstand**: Höchste Router-ID entscheidet

\`\`\`
R1(config-if)# ip ospf priority 100    ! Begünstigt DR-Wahl
R1(config-if)# ip ospf priority 0      ! Schließt Router von DR/BDR aus
\`\`\`

### ⚠️ Non-Preemptive Wahl — der häufigste Prüfungs-Fallstrick!
Wenn ein neuer Router mit höherer Priority ins Segment kommt:
- Er wird **nicht** sofort DR — die Wahl ist **non-preemptive**
- Bestehender DR bleibt bis zum nächsten Ausfall oder OSPF-Neustart
- Nur wenn der aktuelle DR ausfällt, übernimmt der BDR die DR-Rolle und ein neuer BDR wird gewählt

→ Ein neu hinzugefügter Router mit Priority 255 verdrängt den bestehenden DR nicht!

### OSPF-Netzwerktypen
| Typ | Beispiel | DR/BDR? | Hello-Interval |
|-----|---------|---------|--------------|
| **Broadcast** | Ethernet (Standard) | Ja | 10s / Dead 40s |
| **Point-to-Point** | Serielle Leitung, GRE-Tunnel | Nein | 10s / Dead 40s |
| **NBMA** | Frame Relay (Legacy) | Ja (manuell) | 30s / Dead 120s |
| **Point-to-Multipoint** | Hub-and-Spoke ohne DR | Nein | 30s / Dead 120s |

\`\`\`
R1(config-if)# ip ospf network point-to-point    ! DR/BDR deaktivieren auf Ethernet
R1(config-if)# ip ospf network broadcast         ! DR/BDR aktivieren auf seriell
\`\`\`

### OSPF-Multicast-Adressen
| Adresse | Empfänger |
|---------|----------|
| **224.0.0.5** | All OSPF Routers — Hello, DBD, LSR, LSU |
| **224.0.0.6** | All DR/BDR Routers — DROther sendet Updates nur an DR/BDR |

### Cisco IOS Command Reference
\`\`\`
show ip ospf neighbor              ! DR/BDR pro Segment, State
show ip ospf interface Gi0/0       ! Netzwerktyp, Priority, DR, BDR, Timer
ip ospf priority <0-255>           ! Priority setzen
ip ospf network point-to-point     ! Netzwerktyp überschreiben
\`\`\`
  `.trim(),
};

export const CONCEPT_OSPF_LSA_TYPES: Concept = {
  id: "ospf-lsa-types",
  title: "OSPF LSA-Typen & LSDB",
  appliesTo: ["ccna"],
  tags: ["ospf", "lsa", "lsdb", "routing", "area"],
  content: `
## OSPF Link State Advertisements (LSAs)

Alle Router in einer Area haben **identische** LSDBs — das ist die Grundlage für konsistentes SPF-Routing.

### LSA-Typen (CCNA-relevant: Type 1, 2, 3)

| Typ | Name | Erzeugt von | Inhalt | Reichweite |
|-----|------|-------------|--------|------------|
| **Type 1** | Router LSA | Jeder OSPF-Router | Alle direkten Links, Interfaces, Kosten | Nur eigene Area |
| **Type 2** | Network LSA | DR (Designated Router) | Liste aller Router im Broadcast-Segment | Nur eigene Area |
| **Type 3** | Summary LSA | ABR | Inter-Area-Routen | Andere Areas |
| **Type 5** | AS External LSA | ASBR | Redistributed externe Routen | Gesamte OSPF-Domain |
| **Type 7** | NSSA External LSA | ASBR in NSSA | Externe Routen in Not-So-Stubby Area | Nur NSSA (ABR konvertiert zu Type 5) |

### Type 1 — Router LSA
- Jeder Router generiert genau eine Router-LSA für jede Area, der er angehört
- Enthält alle OSPF-fähigen Interfaces des Routers mit ihren Netzwerkadressen und Kosten

### Type 2 — Network LSA
- Existiert **nur auf Broadcast-Segmenten** (Ethernet mit DR)
- Generiert vom **DR** — nicht vom BDR oder anderen Routern
- Fehlt auf Point-to-Point-Links: dort kein DR → kein Type-2-LSA

### Type 3 — Summary LSA
- ABR kündigt Routen aus einer Area in anderen Areas an
- Ermöglicht Route Summarization: \`area X range <netz> <maske>\`
- In Routing-Tabelle erkennbar als: **O IA** (OSPF inter-area)

### Routing-Codes in der Routing-Tabelle
\`\`\`
show ip route
O    192.168.1.0/24 [110/2]    → OSPF intra-area (Type-1/2-LSA)
O IA 192.168.2.0/24 [110/20]   → OSPF inter-area (Type-3-LSA vom ABR)
O E2 10.0.0.0/8    [110/20]    → OSPF externe Route Typ 2 (Type-5-LSA)
O E1 10.1.0.0/16   [110/30]    → OSPF externe Route Typ 1 (akkumulierte Cost)
\`\`\`

### Cisco IOS Command Reference
\`\`\`
show ip ospf database               ! Alle LSA-Typen im Überblick
show ip ospf database router        ! Type-1-LSAs (Router LSAs)
show ip ospf database network       ! Type-2-LSAs (nur mit DR vorhanden)
show ip ospf database summary       ! Type-3-LSAs (Inter-Area vom ABR)
show ip ospf database external      ! Type-5-LSAs (externe Routen vom ASBR)
area <id> range <netz> <maske>     ! Route Summarization am ABR konfigurieren
\`\`\`
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
    "ospf-neighbor-states",
    "ospf-dr-bdr",
    "ospf-lsa-types",
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
  "ospf-neighbor-states": CONCEPT_OSPF_NEIGHBOR_STATES,
  "ospf-dr-bdr": CONCEPT_OSPF_DR_BDR,
  "ospf-lsa-types": CONCEPT_OSPF_LSA_TYPES,
  "inter-vlan-routing": CONCEPT_INTER_VLAN_ROUTING,
  "routing-ospf-guide": CONCEPT_ROUTING_OSPF_GUIDE,
};

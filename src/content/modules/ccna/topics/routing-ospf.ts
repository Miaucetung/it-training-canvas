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

export const CONCEPT_ROUTING_TTL_TRACEROUTE: Concept = {
  id: "routing-ttl-traceroute",
  title: "TTL & Traceroute — den Weg eines Pakets sichtbar machen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["routing", "ttl", "traceroute", "tracert", "icmp", "troubleshooting"],
  content: `
## TTL — die "Lebensdauer" eines Pakets

**TTL (Time To Live)** ist ein 8-Bit-Feld im IPv4-Header (bei IPv6 heißt es **Hop Limit**).
Es verhindert, dass Pakete bei einem Routing-Loop **ewig** im Kreis laufen.

> **Die eine Regel, die du dir merken musst:**
> **Jeder Router, der ein Paket weiterleitet, zieht 1 von der TTL ab.**
> Wird die TTL dabei **0**, verwirft der Router das Paket und schickt eine
> **ICMP-Meldung "Time Exceeded" (Type 11, Code 0)** an den Absender zurück.

\`\`\`
PC (TTL=64) ──▶ R1 (TTL 64→63) ──▶ R2 (63→62) ──▶ R3 (62→61) ──▶ Ziel
\`\`\`

Typische Start-TTL je Betriebssystem (gut zum Fingerprinting):

| System | Start-TTL |
|--------|-----------|
| Windows | 128 |
| Linux / macOS | 64 |
| Cisco IOS / Router | 255 |

> 🔎 **Trick:** Eine Antwort mit TTL **57** ist sehr wahrscheinlich von einem Linux-Host
> (64) gekommen, der **7 Hops** entfernt ist (64 − 57). Bei TTL **120** → Windows (128), 8 Hops.

## Traceroute — der geniale TTL-Trick

Traceroute nutzt genau diese TTL-Regel, um **jeden Hop** auf dem Weg sichtbar zu machen:

1. Sende ein Paket mit **TTL = 1** → der **1. Router** dekrementiert auf 0, verwirft es
   und meldet sich mit **Time Exceeded** → seine IP ist jetzt bekannt.
2. Sende ein Paket mit **TTL = 2** → der 2. Router meldet sich.
3. … TTL = 3, 4, 5 … bis das **Ziel** antwortet (mit Echo Reply oder Port Unreachable).

\`\`\`
Tracing route to 8.8.8.8 over a maximum of 30 hops
 1    1 ms   1 ms   1 ms   192.168.1.1      ← TTL 1: Default Gateway
 2   12 ms  11 ms  12 ms   100.64.0.1       ← TTL 2: ISP
 3    *      *      *       Request timed out ← Router blockt ICMP (kein Fehler!)
 4   18 ms  17 ms  18 ms   8.8.8.8          ← Ziel erreicht
\`\`\`

### tracert vs traceroute — verschiedene Probe-Pakete
| Tool | System | Probe-Paket |
|------|--------|-------------|
| \`tracert\` | Windows | **ICMP** Echo Request |
| \`traceroute\` | Linux/macOS | **UDP** (hohe Ports, 33434+) |
| \`traceroute\` | Cisco IOS | **UDP** |

Das ist wichtig fürs Troubleshooting: Blockt eine Firewall **UDP**, scheitert Linux-traceroute,
Windows-tracert (ICMP) kommt aber evtl. durch — und umgekehrt.

### Sterne (\`* * *\`) richtig deuten
Ein \`*\` heißt **nicht** automatisch "kaputt":
- Der Router antwortet absichtlich **nicht** auf ICMP/UDP (Policy) → trotzdem leitet er weiter.
- Erst wenn **ab einem Hop alles** \`*\` ist **und** das Ziel nie antwortet, liegt dort das Problem.

> 🎯 **Prüfungs-/Praxisknackpunkt:** Traceroute zeigt den Pfad **hin**. Der **Rückweg** kann
> asymmetrisch ein anderer sein — die Latenzwerte sind immer Round-Trip.

## Mini-Lab (Packet Tracer / echtes Gerät)
\`\`\`
PC>  tracert 8.8.8.8          ! Windows-PC
R1#  traceroute 10.0.0.5      ! Cisco-Router
R1#  ping 10.0.0.5            ! erst Erreichbarkeit, dann Pfad
\`\`\`
1. Baue PC1 — R1 — R2 — R3 — Server.
2. \`tracert\` vom PC zum Server → du siehst R1, R2, R3, Server (4 Zeilen).
3. Zieh ein Kabel an R2 raus → \`tracert\` endet jetzt bei R1 + Timeouts → Fehler **lokalisiert**.

> 🧪 **Interaktiv:** Im **Routing- & OSPF-Simulator → Tab "Paketreise"** siehst du die
> TTL live an jedem Hop sinken und die MAC-Adressen neu geschrieben werden (IP bleibt gleich).

[[icmp]] · [[routing-fundamentals]]
  `.trim(),
};

export const CONCEPT_STATIC_ROUTING_DEEP: Concept = {
  id: "static-routing-deep",
  title: "Statisches Routing in der Tiefe",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["routing", "static-routes", "default-route", "floating-static", "troubleshooting"],
  content: `
## Wann statisches Routing?
- **Kleine / stabile** Netze, Stub-Netze (nur ein Weg raus)
- **Default-Route** zum ISP
- **Backup-Pfade** (Floating Static)
- Volle **Kontrolle** & **0 Protokoll-Overhead** — aber **keine Selbstheilung** bei Ausfall

## Die \`ip route\`-Syntax — drei Varianten
\`\`\`
ip route <ziel-netz> <maske> { <next-hop-ip> | <ausgangs-interface> | <iface> <next-hop> }  [AD]
\`\`\`

| Variante | Beispiel | Verhalten |
|----------|----------|-----------|
| **Next-Hop** | \`ip route 10.2.0.0 255.255.255.0 10.0.0.2\` | rekursiver Lookup: erst Next-Hop suchen |
| **Exit-Interface** | \`ip route 10.2.0.0 255.255.255.0 Gi0/1\` | nur auf **P2P**-Links sinnvoll |
| **Fully specified** | \`ip route 10.2.0.0 255.255.255.0 Gi0/1 10.0.0.2\` | **beste** Wahl auf Multi-Access (Ethernet) |

> ⚠️ **Klassiker-Fehler:** Auf einem **Ethernet** nur das Exit-Interface angeben. Der Router
> muss dann für **jede** Ziel-IP ein ARP machen ("Proxy-ARP-Krücke") → unsauber. Auf Ethernet
> immer **Next-Hop** oder **fully specified** nehmen.

## Spezielle statische Routen
\`\`\`
! Default-Route ("Gateway of last resort") — matcht ALLES
ip route 0.0.0.0 0.0.0.0 203.0.113.1

! Host-Route (/32) — exakt EINE Adresse, schlägt jede kürzere Route (Longest Prefix!)
ip route 10.2.0.50 255.255.255.255 10.0.0.6

! Summary/Aggregat — eine Route statt vieler
ip route 10.2.0.0 255.255.0.0 10.0.0.2

! Null-Route (Blackhole) — Traffic gezielt verwerfen
ip route 172.16.99.0 255.255.255.0 Null0
\`\`\`

## Floating Static Route — der Backup-Trick
Eine statische Route hat AD **1**. Gibst du ihr eine **höhere AD** als das dynamische
Protokoll, "schwebt" sie im Hintergrund und wird **nur aktiv, wenn die Hauptroute ausfällt**:
\`\`\`
! Primär: OSPF lernt 10.2.0.0/24 (AD 110)
! Backup über zweite Leitung, AD 130 > 110 → nur bei Ausfall aktiv:
ip route 10.2.0.0 255.255.255.0 10.9.9.2 130
\`\`\`

## So liest du eine statische Route in der Tabelle
\`\`\`
S    10.2.0.0/24 [1/0] via 10.0.0.2
S*   0.0.0.0/0   [1/0] via 203.0.113.1   ← * = Kandidat für Default
\`\`\`
\`[AD/Metric]\` — bei statisch ist die **Metric immer 0**.

## Troubleshooting-Checkliste
1. \`show ip route\` — taucht die Route überhaupt auf? (Next-Hop **erreichbar**?)
2. Next-Hop pingbar? Sonst wird die Route **nicht installiert** (recursive lookup failt).
3. **Hin- UND Rückweg** geroutet? Ziel braucht auch eine Route **zurück** (häufigster Fehler!).
4. Maske richtig? \`/24\` vs \`/32\` vs \`/0\` — Longest Prefix gewinnt.

> 🎯 **Faustregeln**
> - "**Ping geht hin, aber nicht zurück**" → Rückroute auf dem Zielrouter fehlt.
> - Default-Route am Stub-Router, **spezifische** Routen Richtung Core.
> - Floating Static = **AD höher** als das Protokoll, das es ersetzen soll.

> 🧪 **Interaktiv:** Simulator → Tab **"Routing-Tabelle & AD"**: Static (AD 1) gegen OSPF/RIP
> toggeln und sehen, wer die RIB gewinnt.

[[routing-fundamentals]] · [[dynamic-routing-deep]]
  `.trim(),
};

export const CONCEPT_DYNAMIC_ROUTING_DEEP: Concept = {
  id: "dynamic-routing-deep",
  title: "Dynamisches Routing & Routing-Protokolle",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["routing", "dynamic-routing", "rip", "ospf", "eigrp", "bgp", "metric", "convergence"],
  content: `
## Warum dynamisch?
Router **lernen Routen automatisch** voneinander und **passen sich an Ausfälle an**
(Konvergenz). Preis: CPU-, RAM- und Bandbreiten-Overhead durch Protokoll-Verkehr.

## Die zwei großen Familien
| | **Distance-Vector** | **Link-State** |
|--|---------------------|----------------|
| Idee | "Routing by **rumor**" — sag dem Nachbarn nur **Distanz + Richtung** | jeder baut die **ganze Karte** (LSDB) und rechnet selbst |
| Beispiele | RIP, (EIGRP = advanced DV) | OSPF, IS-IS |
| Algorithmus | Bellman-Ford | Dijkstra (SPF) |
| Sieht | nur was Nachbarn erzählen | komplette Topologie der Area |
| Konvergenz | langsamer | schneller |
| Ressourcen | wenig | mehr CPU/RAM |

> **Bild:** Distance-Vector ist wie nach dem Weg fragen ("3 Straßen geradeaus");
> Link-State ist wie eine **Landkarte** haben und selbst den kürzesten Weg suchen.

## Die CCNA-Protokolle im Vergleich
| Protokoll | Typ | Metrik | AD | Algorithmus | Multicast |
|-----------|-----|--------|----|-------------|-----------|
| **RIPv2** | Distance-Vector | **Hop-Count** (max 15!) | 120 | Bellman-Ford | 224.0.0.9 |
| **OSPF** | Link-State | **Cost** (= Ref-BW / BW) | 110 | Dijkstra/SPF | 224.0.0.5/.6 |
| **EIGRP** | Advanced DV | **BW + Delay** (k-Werte) | 90 (int) | DUAL | 224.0.0.10 |
| **BGP** | Path-Vector | **Pfad-Attribute** | 20/200 | Best-Path | — (TCP 179) |

> 📌 **AD-Reihenfolge auswendig:** Connected 0 · Static 1 · **EIGRP 90 · OSPF 110 · RIP 120** · iBGP 200.
> Bei mehreren Quellen für dasselbe Netz gewinnt die **kleinste AD**.

## Metric vs. Administrative Distance — nicht verwechseln!
- **AD** entscheidet **zwischen Protokollen** ("wem glaube ich?") → in die RIB kommt die kleinste AD.
- **Metric** entscheidet **innerhalb eines Protokolls** ("welcher Pfad ist besser?").

\`\`\`
O   10.0.0.0/8 [110/2] via 192.168.1.2
                 │   └─ Metric (OSPF-Cost) — protokoll-intern
                 └───── AD (110 = OSPF) — protokoll-übergreifend
\`\`\`

## Konvergenz & Loop-Vermeidung (Distance-Vector)
- **Split Horizon** — eine Route nicht über das Interface zurückschicken, über das man sie gelernt hat.
- **Route Poisoning** — ausgefallene Route mit "unendlich" (RIP: 16 Hops) markieren.
- **Hold-Down-Timer** — kurz keine schlechteren Updates für ein Netz annehmen.
- **Triggered Updates** — Änderungen sofort melden, statt aufs Intervall zu warten.

## Minimal-Konfiguration (Vergleich)
\`\`\`
! RIPv2
router rip
 version 2
 no auto-summary
 network 10.0.0.0

! OSPF (Wildcard-Maske!)
router ospf 1
 router-id 1.1.1.1
 network 10.0.0.0 0.0.0.255 area 0

! EIGRP
router eigrp 100
 no auto-summary
 network 10.0.0.0 0.0.0.255
\`\`\`

## Welches Protokoll wann?
| Situation | Wahl |
|-----------|------|
| Reines Cisco, schnelle Konvergenz | EIGRP |
| Multi-Vendor, Standard, große Netze | OSPF |
| Sehr klein / Legacy | RIPv2 |
| Zwischen Autonomen Systemen / Internet | BGP |

> 🎯 **Tipps & Tricks**
> - **\`show ip route\`** ist deine Wahrheit — was hier nicht steht, wird nicht geroutet.
> - **\`show ip protocols\`** zeigt aktive Protokolle, Timer, Netze, AD.
> - OSPF-Nachbarschaft kommt nicht zustande? → **MTU, Area, Hello/Dead-Timer, Subnetz, Auth** prüfen (siehe [[ospf-neighbor-states]]).
> - RIP zählt **Hops**, nicht Bandbreite → eine 1-Hop-56k-Leitung schlägt bei RIP eine 3-Hop-Glasfaser (Schwäche!).
> - "**Passive-Interface**" stoppt Protokoll-Updates auf einem Interface (z. B. LAN zum Endnutzer), ohne das Netz aus dem Routing zu nehmen.

> 🧪 **Interaktiv:** Simulator → Tab **"OSPF SPF/Cost"** (Link-Kosten verschieben, Pfad neu rechnen)
> und Tab **"Routing-Tabelle & AD"** (Protokoll-Quellen vergleichen).

[[ospf]] · [[static-routing-deep]] · [[routing-fundamentals]]
  `.trim(),
};

export const CONCEPT_RIPV1: Concept = {
  id: "ripv1",
  title: "RIPv1 — das classful Urgestein (und seine Grenzen)",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["routing", "rip", "ripv1", "distance-vector", "classful", "legacy"],
  content: `
## RIPv1 in einem Satz
**RIP Version 1** (RFC 1058, 1988) ist das einfachste dynamische Routing-Protokoll:
Distance-Vector, Metrik = **Hop-Count**, AD **120** — aber **classful** und damit heute
fast nur noch als Negativbeispiel relevant. Wer versteht, was RIPv1 **nicht** kann,
versteht, warum es RIPv2, OSPF & EIGRP gibt.

## Wie RIPv1 arbeitet
- Sendet die **komplette Routing-Tabelle alle 30 s** an die Nachbarn.
- **Broadcast** an \`255.255.255.255\` — jeder im Segment hört mit (v2 nutzt Multicast 224.0.0.9).
- Metrik = **Hop-Count**, Maximum **15** (16 = "infinity" = unerreichbar) → nicht für große Netze.
- Loop-Schutz: **Split Horizon, Route Poisoning, Hold-Down** (180 s), Triggered Updates.

\`\`\`
R1(config)# router rip
R1(config-router)# network 192.168.1.0      ! CLASSFUL — kein /Präfix, keine Wildcard
R1(config-router)# network 10.0.0.0         ! aktiviert ALLE Interfaces im 10er-Netz
\`\`\`

## Der eine, alles entscheidende Haken: **classful**
RIPv1-Updates enthalten **keine Subnetzmaske**. Der Empfänger "rät" die Maske:
- gleiche Major-Net-Zugehörigkeit → eigene Interface-Maske annehmen,
- über eine **Klassengrenze** hinweg → **klassenbasierte** Standardmaske (/8, /16, /24).

Daraus folgen die drei Killer-Limits:

| Limit | Bedeutung |
|-------|-----------|
| **Kein VLSM** | Ein Major-Netz muss **überall dieselbe Maske** haben — kein /30-WAN neben /24-LAN. |
| **Kein CIDR / keine Supernets** | Präfixe wie 10.0.0.0/12 sind nicht darstellbar. |
| **Auto-Summary erzwungen** | Fasst an Klassengrenzen **immer** zusammen (nicht abschaltbar) → **discontiguous networks** brechen. |

> 🔎 **Discontiguous-Beispiel:** Zwei Subnetze von 172.16.0.0, getrennt durch ein 10er-Netz.
> Beide Router melden classful "172.16.0.0/16" → der mittlere Router bekommt zwei gleich
> aussehende Routen und kann nicht mehr unterscheiden → Verbindung kaputt.

## RIPv1 vs. RIPv2 — die Prüfungstabelle
| Merkmal | **RIPv1** | **RIPv2** |
|---------|-----------|-----------|
| Maske im Update | **nein** (classful) | **ja** (classless) |
| Adressierung | **Broadcast** 255.255.255.255 | **Multicast** 224.0.0.9 |
| VLSM / CIDR | ❌ | ✅ |
| Auto-Summary | erzwungen | abschaltbar (\`no auto-summary\`) |
| Authentifizierung | ❌ | ✅ (MD5) |
| Metrik / Max-Hops / AD | Hop-Count / 15 / 120 | identisch |

> 🎯 **Faustregeln**
> - RIP läuft per Default als **Version 1** — \`version 2\` + \`no auto-summary\` macht es brauchbar.
> - Sieht eine Aufgabe **gemischte Masken** (z. B. /30 + /24) im selben Netz → RIPv1 **kann das nicht**, Antwort = v2/OSPF.
> - \`debug ip rip\` zeigt sofort die Version: v1 = "via 255.255.255.255" **ohne** Maske.
> - \`network\` bei RIP ist **classful** (kein Wildcard) — anders als OSPF/EIGRP.

> 🧪 **Lab:** „RIPv1 — Classful Distance-Vector" (Labs) — saubere /24-Konfiguration plus ein
> Schritt, der VLSM/discontiguous gezielt brechen lässt und auf v2 umstellt.

[[dynamic-routing-deep]] · [[routing-fundamentals]]
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

---

## Vertiefung: Election, Priority, RID-Tiebreaker & DR im Detail

### Router-ID — woher der „Tiebreaker" kommt
Die **Router-ID (RID)** ist eine 32-Bit-Zahl im IP-Format, die jeden OSPF-Router **eindeutig** identifiziert. IOS wählt sie beim OSPF-Start in dieser Reihenfolge:

1. **Manuell** gesetzt: \`router-id A.B.C.D\` (gewinnt immer, empfohlen)
2. sonst **höchste IP eines Loopback-Interface**
3. sonst **höchste IP eines aktiven physischen Interface**

> 💡 **Warum Loopback?** Ein Loopback ist ein logisches Interface und **immer up/up** — es fällt nie aus, egal welches Kabel gezogen wird. Damit bleibt die RID (und die DR/BDR-Wahl) **stabil**. Deshalb bekommt in diesem Lab jeder Router ein \`Lo0\` aus 192.168.254.0/24.

Die RID ist auch der **Tiebreaker** der DR/BDR-Wahl: Sind alle Priorities gleich (Default 1), entscheidet die **höchste RID** = höchste Loopback-IP.

### Die Wahl Schritt für Schritt
1. Interface wird aktiv → Router lauscht **Dead-Interval** lang (40 s) auf Hellos, bevor er wählt (\`Waiting\`-State). So „übernimmt" niemand vorschnell ein laufendes Segment.
2. Aus allen Hellos werden **Priority** und **RID** gelesen.
3. **BDR zuerst**: unter den Kandidaten (Priority > 0, die sich nicht selbst schon als DR sehen) gewinnt die höchste Priority, bei Gleichstand die höchste RID.
4. **DR danach**: gibt es bereits einen DR, bleibt er (non-preemptive); sonst wird der beste Kandidat DR, der BDR rückt nach.
5. Ergebnis steht in jedem \`Hello\` (Felder *Designated Router* / *Backup DR*) und in \`show ip ospf interface\`.

### Neighbor-States lesen: FULL vs. 2-WAY
Auf einem Broadcast-Segment bildet **jeder Router Full-Adjacency NUR mit DR und BDR**. Zwei **DROTHER** untereinander bleiben absichtlich im Zustand **2-WAY** — das ist **kein Fehler**, sondern genau der Sparmechanismus.

\`\`\`
R1# show ip ospf neighbor
Neighbor ID     Pri  State        Dead Time  Address    Interface
192.168.254.2     1  FULL/BDR     00:00:35   10.1.0.2   GigabitEthernet0/1
192.168.254.3     0  2-WAY/DROTHER 00:00:33  10.1.0.3   GigabitEthernet0/1
192.168.254.4     1  2-WAY/DROTHER 00:00:31  10.1.0.4   GigabitEthernet0/1
\`\`\`
- \`FULL/BDR\` → voll synchronisiert mit dem BDR.
- \`2-WAY/DROTHER\` → bewusst nur 2-Way (beide sind DROTHER). Details der Phasen: [[ospf-neighbor-states]].

### Durchgerechnetes Beispiel (dieses Lab)
Vier Router an einem Switch, Loopbacks 192.168.254.**1–4**, alle Priority 1 (Default):

| Router | Priority | RID (Loopback) | Rolle |
|--------|----------|----------------|-------|
| R1 | 1 | 192.168.254.1 | DROTHER |
| R2 | 1 | 192.168.254.2 | DROTHER |
| R3 | 1 | 192.168.254.3 | **BDR** |
| R4 | 1 | 192.168.254.4 | **DR** |

→ Höchste RID (R4) wird DR, zweithöchste (R3) BDR — **reiner Loopback-Tiebreaker**, weil alle Priorities gleich sind.

Jetzt gezielt steuern: \`ip ospf priority 255\` auf R1, \`100\` auf R2, \`0\` auf R3 → danach \`clear ip ospf process\` auf allen:

| Router | Priority | Rolle danach |
|--------|----------|--------------|
| R1 | 255 | **DR** |
| R2 | 100 | **BDR** |
| R3 | 0 | DROTHER (dauerhaft — nie wählbar) |
| R4 | 1 | DROTHER |

→ Jetzt entscheidet die **Priority**, nicht mehr die RID. Priority **0** nimmt R3 komplett aus der Wahl.

### Troubleshooting-Schnellcheck
- **„Nachbar bleibt 2-WAY"** → völlig normal zwischen zwei DROTHERn. Nur DR/BDR müssen FULL sein.
- **Neuer Router wird nicht DR** trotz Priority 255 → Wahl ist **non-preemptive**: \`clear ip ospf process\` (auf dem ganzen Segment) erzwingt die Neuwahl.
- **Gar kein DR (alle DROTHER)** → alle Interfaces haben Priority **0**. Mindestens einem eine Priority > 0 geben.
- **Unerwarteter DR** → jemand hat ein höheres Loopback/Priority. \`show ip ospf interface\` zeigt DR, BDR, eigene Priority und Netzwerktyp.
- **Kein DR/BDR, obwohl Ethernet** → Interface wurde auf \`ip ospf network point-to-point\` gestellt.

> 🧪 **Lab dazu:** „OSPF DR/BDR-Wahl (Multi-Access)" — baut genau diese Topologie nach und lässt dich Priority, RID-Tiebreaker und die non-preemptive Neuwahl selbst auslösen.
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

export const CONCEPT_RIP_OSPF_VERDICHTUNG: Concept = {
  id: "rip-ospf-verdichtung",
  title: "Verdichtung: RIPv2 & OSPF Single-Area (CIS4-Lektion)",
  appliesTo: ["ccna"],
  tags: ["routing", "rip", "ripv2", "ospf", "wildcard", "verdichtung", "exam"],
  content: `
Kompakte Prüfungs-Review-Karte zur Lektion **RIP Teil II, RIPv2 & OSPF-Grundlagen**.
Vertiefungen: [[ripv1]] · [[dynamic-routing-deep]] · [[ospf]] · [[ospf-neighbor-states]] · [[ospf-dr-bdr]].

## 1) Passive Interface (RIP **und** OSPF)
\`\`\`
R(config-router)# passive-interface GigabitEthernet0/0
\`\`\`
- Unterdrückt Routing-Updates auf einem Interface — typisch für **LAN-Seiten ohne Nachbar-Router**.
- **Unterschied:** Bei **RIP** wird auf dem Interface nichts gesendet **und** nichts empfangen.
  Bei **OSPF** werden **keine Hellos** mehr gesendet (→ keine Adjacency), das Netz wird aber **weiter angekündigt**.

## 2) RIPv2 in einer Tabelle
| Merkmal | RIPv1 | **RIPv2** |
|---|---|---|
| Typ | classful | **classless** |
| Maske im Update | nein | **ja** |
| Update-Ziel | Broadcast 255.255.255.255 | **Multicast 224.0.0.9** |
| Abwärtskompatibel | – | ja (zu v1) |

\`\`\`
R(config)# router rip
R(config-router)# version 2          ! classless aktivieren
R(config-router)# no auto-summary    ! Zusammenfassung an Klassengrenzen AUS
R(config-router)# network 10.0.0.0   ! classful-Netzangabe, KEIN Wildcard
\`\`\`
- **no auto-summary**: verhindert, dass Subnetze fälschlich zu classful-Netzen zusammengefasst werden (discontiguous!).
- **Load Balancing:** RIP nutzt per Default **4 gleichwertige Pfade** (Equal-Cost), erweiterbar auf **6** (\`maximum-paths 6\`).
- Metrik = **Hop-Count** (max 15), **AD 120**. Erwartete Route: \`R 192.168.0.0/24 [120/3] via 10.1.0.2\`.

## 3) OSPF — Hello & Adjacency
Jeder OSPF-Router sendet **Hello** an **224.0.0.5** (All-OSPF-Routers). Inhalt: Router-ID, Subnetz, Maske, Area, **Hello-Intervall**.

**Adjacency entsteht nur, wenn diese 4 Parameter übereinstimmen:**
1. gleiches **Subnetz**
2. gleiche **Subnetzmaske**
3. gleiches **Hello-/Dead-Intervall**
4. gleiche **Area**

> 🎯 „Keine OSPF-Nachbarn" → genau diese 4 prüfen (Subnetz / Maske / Hello-Intervall / Area).

**Neighbor-Phasen (Kurzform):** DOWN → INIT → **2-WAY** (sehen sich gegenseitig, DR/BDR-Wahl) → ExStart → Exchange → Loading → **FULL** (alle LSAs synchron). Details: [[ospf-neighbor-states]].

## 4) OSPF Areas & ABR
- **Area 0 = Backbone** ist Pflicht; **jede** andere Area (1–65535) braucht eine **direkte** Verbindung zu Area 0.
- **ABR (Area Border Router):** in **zwei** Areas, vermittelt Routen zwischen ihnen (und fasst sie ggf. zusammen: \`area <id> range\`).
- **Single-Area** = alle \`network … area 0\`.

\`\`\`
R(config)# router ospf 1
R(config-router)# router-id 1.1.1.1
R(config-router)# network 192.168.1.0 0.0.0.255 area 0   ! /24 → Wildcard 0.0.0.255
R(config-router)# network 192.168.10.0 0.0.0.3 area 0    ! /30 → Wildcard 0.0.0.3
\`\`\`

## 5) Router-ID — Auswahlreihenfolge
1. **Manuell** \`router-id A.B.C.D\` (gewinnt immer)
2. sonst **höchste Loopback-IP** (Loopback ist immer up/up → stabil!)
3. sonst **höchste IP eines physischen Interface**

> 💡 Darum auf jedem Router ein **Loopback** (\`ip address X.X.X.X 255.255.255.255\`) für eine stabile RID anlegen.

## 6) Wildcard-Maske
- Wildcard = **invertierte** Subnetzmaske (Bit \`1\` = „egal/don't care"). Bits müssen **von rechts** aufgefüllt sein (keine Lücken — \`0.0.0.16\` ist **ungültig**).

| Präfix | Subnetzmaske | **Wildcard** |
|---|---|---|
| /24 | 255.255.255.0 | **0.0.0.255** |
| /25 | 255.255.255.128 | **0.0.0.127** |
| /16 | 255.255.0.0 | **0.0.255.255** |
| /8 | 255.0.0.0 | **0.255.255.255** |
| /30 | 255.255.255.252 | **0.0.0.3** |
| /32 | 255.255.255.255 | **0.0.0.0** |

> ⚠️ Im \`network\`-Befehl steht die **Wildcard**, nicht die Subnetzmaske — \`network 192.168.1.0 255.255.255.0 area 0\` ist falsch.

## Übungen in den Labs
- **„RIPv2 + Passive Interface (4 Router)"** — version 2 / no auto-summary / passive-interface, erwartete \`[120/3]\`-Routen.
- **„OSPF Single-Area — Loopback-RID & Wildcard"** — Loopbacks als RID, alle Netze in Area 0, Wildcard-Drill, Troubleshooting.
  `.trim(),
};

export const CONCEPT_INTER_VLAN_ROUTING_OVERVIEW: Concept = {
  id: "inter-vlan-routing-overview",
  title: "Inter-VLAN Routing — Überblick",
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

export const CONCEPT_ROUTING_SIMULATOR: Concept = {
  id: "routing-simulator",
  title: "Interaktiver Routing- & OSPF-Simulator",
  appliesTo: ["ccna"],
  tags: ["routing", "ospf", "simulator", "interactive", "layer-3"],
  content: `
## Interaktiver Routing- & OSPF-Simulator

Fünf zusammenhängende Visualisierungen — eigenständig verständlich, ohne Vorwissen:

1. **Paketreise (Hop-by-Hop)** — verfolge ein Paket PC1 → R1 → R2 → R3 → PC2 und sieh live, wie an jedem Router
   die Routing-Tabelle befragt, die TTL dekrementiert und die MAC-Adressen neu geschrieben werden — die IP
   bleibt dabei konstant.
2. **Traceroute (TTL-Trick)** — Schritt für Schritt TTL=1, 2, 3 … aussenden und sehen, wie jeder Router beim
   TTL=0 mit „ICMP Time Exceeded" antwortet und so seine IP verrät, bis das Ziel erreicht ist — inkl. live
   wachsendem \`tracert\`-Output.
3. **Routing-Tabelle & Administrative Distance** — Toggle Connected/Static/EIGRP/OSPF/RIP für denselben Zielprefix
   und sieh, welche Quelle die RIB gewinnt (niedrigste AD wins).
4. **OSPF Neighbor-States** — klick dich durch Down → Init → 2-Way → ExStart → Exchange → Loading → Full mit
   Paket-Animation und Troubleshooting-Hinweis je State.
5. **OSPF SPF / Cost** — Dijkstra-Visualisierung mit 4 Routern. Verschiebe Link-Kosten und sieh, wie sich der
   beste Pfad sofort neu berechnet.

→ Direkt im Topic-Detail über den CTA "Routing- & OSPF-Simulator" starten.
  `.trim(),
};

export const TOPIC_ROUTING_OSPF: Topic = {
  id: "routing-ospf",
  title: "Routing & OSPF",
  description:
    "Routing-Grundlagen, statische Routen, OSPF Single- und Multi-Area, Inter-VLAN Routing — Layer-3-Vermittlung meistern.",
  conceptIds: [
    "routing-fundamentals",
    "routing-ttl-traceroute",
    "static-routing-deep",
    "dynamic-routing-deep",
    "ripv1",
    "routing-simulator",
    "ospf",
    "ospf-neighbor-states",
    "ospf-dr-bdr",
    "ospf-lsa-types",
    "rip-ospf-verdichtung",
    "inter-vlan-routing-overview",
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
  "routing-ttl-traceroute": CONCEPT_ROUTING_TTL_TRACEROUTE,
  "static-routing-deep": CONCEPT_STATIC_ROUTING_DEEP,
  "dynamic-routing-deep": CONCEPT_DYNAMIC_ROUTING_DEEP,
  ripv1: CONCEPT_RIPV1,
  "routing-simulator": CONCEPT_ROUTING_SIMULATOR,
  ospf: CONCEPT_OSPF,
  "ospf-neighbor-states": CONCEPT_OSPF_NEIGHBOR_STATES,
  "ospf-dr-bdr": CONCEPT_OSPF_DR_BDR,
  "ospf-lsa-types": CONCEPT_OSPF_LSA_TYPES,
  "rip-ospf-verdichtung": CONCEPT_RIP_OSPF_VERDICHTUNG,
  "inter-vlan-routing-overview": CONCEPT_INTER_VLAN_ROUTING_OVERVIEW,
  "routing-ospf-guide": CONCEPT_ROUTING_OSPF_GUIDE,
};

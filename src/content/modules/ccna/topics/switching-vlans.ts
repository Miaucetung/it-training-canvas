// ============================================================
// CCNA Topic: Switching & VLANs
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_SWITCHING_BASICS: Concept = {
  id: "switching-basics",
  title: "Switching-Grundlagen & MAC-Tabelle",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "switching", "layer-2", "mac", "cam-table"],
  content: `
## Switching-Grundlagen

### Wie lernt ein Switch?
1. **Learning**: Bei Eingang eines Frames lernt der Switch die Quell-MAC + Port
2. **Flooding**: Ziel-MAC unbekannt → Frame wird an alle Ports gesendet (außer Eingang)
3. **Forwarding**: Ziel-MAC bekannt → Frame wird nur an Ziel-Port weitergeleitet
4. **Filtering**: Quell- und Ziel-Port identisch → Frame verworfen
5. **Aging**: MAC-Tabelleneinträge verfallen (Default: 300 s)

### MAC-Tabelle (CAM-Tabelle)
| MAC-Adresse | Port | VLAN | Age |
|------------|------|------|-----|
| AA:BB:CC:DD:EE:FF | Gi0/1 | 10 | 120 |

\`\`\`
SW# show mac address-table
SW# show mac address-table dynamic
SW# clear mac address-table dynamic
\`\`\`

### Switching-Methoden
| Methode | Latenz | Zuverlässigkeit |
|---------|--------|----------------|
| Store-and-Forward | Hoch | Fehlerprüfung (FCS) |
| Cut-Through | Sehr gering | Keine Fehlerprüfung |
| Fragment-Free | Gering | Prüft erste 64 Byte |

### Broadcast-Domäne vs. Collision-Domäne
- **Collision-Domäne**: Pro Switch-Port eine eigene (Full-Duplex → keine Kollisionen)
- **Broadcast-Domäne**: Alle Ports im gleichen VLAN teilen eine Broadcast-Domäne
  `.trim(),
};

export const CONCEPT_VLANS: Concept = {
  id: "vlans",
  title: "VLANs — Virtual Local Area Networks",
  appliesTo: ["ccna", "comptia-network-plus", "az-104"],
  tags: ["networking", "vlan", "layer-2", "segmentation", "trunk", "802.1q"],
  relatedConceptIds: ["vnet-subnet"],
  content: `
## VLANs

### Was sind VLANs?
- Logische Segmentierung auf Layer 2, unabhängig von physischer Verkabelung
- Trennt Broadcast-Domänen → verbessert Performance und Sicherheit
- Kommunikation zwischen VLANs nur über Router (Inter-VLAN Routing)

### VLAN-Typen
| Typ | Beschreibung |
|-----|-------------|
| Data VLAN | Normaler User-Traffic |
| Native VLAN | Untagged Traffic auf Trunk-Links (Default: VLAN 1) |
| Management VLAN | Für Switch-Management-Zugriff (empfohlen: nicht VLAN 1) |
| Voice VLAN | Separates VLAN für VoIP (QoS-Priorisierung) |

### Trunk vs. Access Port
| Port-Typ | Beschreibung | Tags |
|----------|-------------|------|
| Access Port | Verbindet Endgerät mit einem VLAN | Kein Tag (untagged) |
| Trunk Port | Trägt mehrere VLANs (Switch ↔ Switch, Switch ↔ Router) | 802.1Q Tagged |

### 802.1Q VLAN-Tagging
- 4-Byte-Tag wird in Ethernet-Frame eingefügt
- Enthält VLAN-ID (12 Bit → max. 4094 VLANs)
- Native VLAN wird nicht getaggt

### Cisco Konfiguration
\`\`\`
! VLAN erstellen
SW(config)# vlan 10
SW(config-vlan)# name SALES

! Access Port
SW(config)# interface GigabitEthernet 0/1
SW(config-if)# switchport mode access
SW(config-if)# switchport access vlan 10

! Trunk Port
SW(config)# interface GigabitEthernet 0/24
SW(config-if)# switchport mode trunk
SW(config-if)# switchport trunk native vlan 999
SW(config-if)# switchport trunk allowed vlan 10,20,30

! Überprüfen
SW# show vlan brief
SW# show interfaces trunk
\`\`\`
  `.trim(),
};

export const CONCEPT_STP: Concept = {
  id: "stp",
  title: "STP & RSTP — Spanning Tree verstehen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "stp", "rstp", "layer-2", "redundancy", "loops"],
  content: `
## 🎯 Was du nach dieser Lektion kannst

- Erklären, **warum** Layer-2 ohne STP zusammenbricht (Broadcast-Storm).
- Die **Wahl der Root Bridge** Schritt für Schritt durchführen.
- Für jeden Switch-Port die richtige **Rolle** (Root / Designated / Blocked) bestimmen.
- Den Unterschied zwischen **STP (802.1D)** und **RSTP (802.1w)** in einem Satz erklären.
- **PortFast** und **BPDU Guard** sinnvoll einsetzen.

> 💡 **Tipp:** Öffne nach der Theorie den **interaktiven STP-Simulator** unten – dort wählst du selbst die Root Bridge, beobachtest die BPDU-Wahl und siehst, wie RSTP in <1 s konvergiert.

---

## 1. Das Problem — warum brauchen wir STP überhaupt?

Stell dir vor, du verbindest drei Switches zu einem **Dreieck** (für Redundanz – fällt ein Kabel aus, gibt es noch einen Weg). Ohne STP passiert in Sekunden ein **Layer-2-Meltdown**:

| Symptom | Was passiert |
|---|---|
| 🌪 **Broadcast-Storm** | Ein einziger ARP-Broadcast kreist endlos im Ring – CPU geht auf 100 %. |
| 🔀 **MAC-Flapping** | Switches sehen dieselbe Quell-MAC abwechselnd auf zwei Ports → MAC-Tabelle instabil. |
| 👯 **Frame-Duplikate** | Empfänger erhalten jedes Paket 2× / 3× / N× – TCP bricht ein. |

> ⚠️ **Wichtig:** Ethernet-Frames haben **keine TTL** wie IP. Ein Loop ist deshalb ewig. Genau diese Lücke schließt STP.

**Lösung in einem Satz:** STP schaltet so viele Ports auf „Blocking", dass aus dem physischen Maschen­netz ein logischer **Baum** ohne Kreise wird – fällt ein Link aus, wird ein blockierter Port automatisch aktiviert.

---

## 2. Die Wahl der Root Bridge — wie der „Chef" entsteht

Jeder Switch hat eine **Bridge-ID** (8 Byte): \`Priority (2B) | MAC-Adresse (6B)\`.

\`\`\`
Default-Priority = 32768
Schritt 1: Vergleiche Priority — niedrigste gewinnt.
Schritt 2: Bei Gleichstand vergleiche MAC — niedrigste gewinnt.
\`\`\`

📖 **Eselsbrücke:** *„Der Sparsamste (niedrigste Zahl) wird Chef."*

**Best Practice:** Setze den Core-Switch manuell als Root:

\`\`\`
SW(config)# spanning-tree vlan 1 priority 4096
\`\`\`

Priority wird in Schritten von **4096** vergeben (4096, 8192, 12288 …). Sonst akzeptiert IOS den Wert nicht.

---

## 3. Port-Rollen — wer macht was?

Sobald die Root Bridge feststeht, bekommt **jeder Port** genau eine Rolle:

| Rolle | Symbol | Wahl-Regel |
|---|---|---|
| **Root Port (RP)** | 🟦 | *Jeder Nicht-Root-Switch* hat genau einen — der mit den **niedrigsten Kosten zur Root**. |
| **Designated Port (DP)** | 🟩 | *Pro Netzsegment* gibt es genau einen — der mit den niedrigsten Kosten Richtung Root. Alle Root-Ports der Root Bridge sind automatisch DP. |
| **Blocked / Alternate (BLK)** | 🟥 | Alle übrigen — kein Forwarding, hört aber BPDUs. Springt bei Ausfall ein. |

**STP-Pfadkosten (IEEE 802.1D-2004):**

| Bandbreite | Cost |
|---|---|
| 10 Mbit/s | 100 |
| 100 Mbit/s | 19 |
| 1 Gbit/s | **4** |
| 10 Gbit/s | 2 |
| 100 Gbit/s | 1 |

> 📝 **Merke:** Cost wird über jeden Hop **addiert**, nicht multipliziert.

### Tie-Breaker — was, wenn zwei Pfade gleich teuer sind?

1. Niedrigste **Sender-Bridge-ID**
2. Niedrigste **Sender-Port-ID** (Priority + Portnummer)
3. Niedrigste **eigene Port-ID**

---

## 4. Port-Zustände — der Konvergenz-Tanz (802.1D)

Wenn ein Switch hochfährt, durchläuft jeder Port diese Phasen:

\`\`\`
 Blocking ─►  Listening ─►  Learning ─►  Forwarding
   (∞)         (15 s)        (15 s)        (∞)
            ◄────── 30 s Forward-Delay ──────►
            ◄─── + 20 s Max-Age bei Fehler ──►   = bis zu 50 s 😱
\`\`\`

| Zustand | BPDU senden | BPDU empfangen | MAC lernen | Daten weiterleiten |
|---|---|---|---|---|
| Blocking | ❌ | ✅ | ❌ | ❌ |
| Listening | ✅ | ✅ | ❌ | ❌ |
| Learning | ✅ | ✅ | ✅ | ❌ |
| **Forwarding** | ✅ | ✅ | ✅ | ✅ |

> ⏱ **50 Sekunden** sind in modernen Netzen **inakzeptabel** – deshalb RSTP.

---

## 5. RSTP (802.1w) — Spanning Tree für die Realität

RSTP ist *abwärtskompatibel* zu STP, aber konvergiert in **< 1 Sekunde** statt 50.

### Was ist neu?

| | STP (802.1D) | RSTP (802.1w) |
|---|---|---|
| Port-Zustände | 5 (Disabled, Blocking, Listening, Learning, Forwarding) | **3** (Discarding, Learning, Forwarding) |
| Port-Rollen | Root, Designated, Blocked | Root, Designated, **Alternate**, **Backup** |
| Konvergenz | 30–50 s | **< 1 s** |
| BPDU | nur Root sendet | **jeder** Switch sendet (Keep-Alive alle 2 s) |
| Edge-Port | extra konfigurieren (PortFast) | nativ unterstützt |

### Der Trick: Proposal / Agreement Handshake

Statt auf Timer zu warten, **fragen** zwei Switches sich direkt:

\`\`\`
SW-A ──(Proposal: „Ich bin Designated")──► SW-B
SW-B  ─(Agreement: „OK, du bist Designated")─► SW-A
                                              → Port sofort Forwarding ⚡
\`\`\`

**Alternate Port:** Ein zweitbester Weg zur Root, der schon vor-konfiguriert ist. Fällt der Root Port aus → **Alternate übernimmt in Millisekunden**, ohne neue Wahl.

📖 **Eselsbrücke:** *„STP fragt nach 50 s, RSTP fragt sofort."*

---

## 6. PortFast & BPDU Guard — die Helfer für Access-Ports

**Problem:** Ein PC, der bootet, will **sofort** Netzwerk – darf aber nicht 30 s in Listening/Learning hängen.

**Lösung — PortFast:** Access-Port überspringt Listening/Learning und geht direkt auf Forwarding.

\`\`\`cisco
SW(config-if)# switchport mode access
SW(config-if)# spanning-tree portfast
\`\`\`

> ⚠️ **Gefahr:** Steckt jemand statt eines PCs einen *Switch* in den PortFast-Port → sofortiger Loop!

**Lösung — BPDU Guard:** Empfängt der Port jemals eine BPDU (also: hängt da ein Switch), wird er sofort *err-disabled*:

\`\`\`cisco
SW(config-if)# spanning-tree bpduguard enable
\`\`\`

| Feature | Wofür | Wo aktivieren |
|---|---|---|
| **PortFast** | Schnelles Forwarding | Access-Ports (PC, Drucker, AP) |
| **BPDU Guard** | Schutz vor versehentlichen Switches | **Immer** zusammen mit PortFast |
| **Root Guard** | Schutz vor unerlaubter neuer Root | Edge-Ports Richtung Fremd-Switches |
| **Loop Guard** | Schutz vor unidirektionalen Links | Trunk-Ports zw. Switches |

### Globale Aktivierung (empfohlen):

\`\`\`cisco
SW(config)# spanning-tree portfast default
SW(config)# spanning-tree portfast bpduguard default
SW(config)# spanning-tree mode rapid-pvst
\`\`\`

---

## 7. Cisco-Spezialitäten — PVST+ und Rapid-PVST+

Standard-STP kennt **einen** Spanning Tree für alle VLANs. Cisco macht es besser:

- **PVST+** *(per VLAN Spanning Tree Plus)* — ein STP pro VLAN → unterschiedliche Root Bridges pro VLAN möglich → **Load-Balancing**.
- **Rapid-PVST+** — dasselbe, aber mit RSTP-Geschwindigkeit. **Heute Default auf allen Catalyst-Switches.**

\`\`\`cisco
SW(config)# spanning-tree mode rapid-pvst
SW(config)# spanning-tree vlan 10 root primary    ! VLAN 10 → diese Switch ist Root
SW(config)# spanning-tree vlan 20 root secondary  ! VLAN 20 → Backup-Root
\`\`\`

---

## 8. Troubleshooting-Cheatsheet

\`\`\`cisco
SW# show spanning-tree                       ! Übersicht alle VLANs
SW# show spanning-tree vlan 10               ! Detail VLAN 10
SW# show spanning-tree root                  ! Wer ist Root?
SW# show spanning-tree interface Gi0/1       ! Port-Rolle & -Status
SW# show spanning-tree summary               ! PortFast, BPDU Guard global
\`\`\`

| Symptom | Wahrscheinliche Ursache |
|---|---|
| Falscher Switch ist Root | Default-Priority überall — manuelle Priority setzen |
| Port hängt in *Listening* | Klassisches 802.1D — auf \`rapid-pvst\` umstellen |
| Port plötzlich *err-disabled* | BPDU Guard hat zugeschlagen → da hängt ein Switch |
| Pakete kommen 2× an | STP läuft nicht / Bridge ohne STP im Pfad |

---

## 🧪 Selbsttest — kannst du das jetzt erklären?

1. **Warum** explodiert ein L2-Loop, ein L3-Loop aber nicht?
2. Du hast 3 Switches mit Priority 32768. Wer wird Root?
3. RSTP — wie heißen die 3 Port-Zustände?
4. Wann genau setzt du **BPDU Guard** ein?
5. Auf welchem Cost-Pfad würdest du Gigabit über zwei 100-Mbit-Links bevorzugen?

> 👉 Öffne danach den **STP-Simulator** und überprüfe deine Antworten interaktiv!
  `.trim(),
};

export const CONCEPT_STP_SIMULATOR: Concept = {
  id: "stp-simulator",
  title: "STP-Simulator",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["stp", "rstp", "simulator", "interactive", "layer-2"],
  content: `## Interaktiver STP/RSTP-Simulator

Visualisiert die komplette Spanning-Tree-Logik:

- 🏆 **Root-Bridge-Wahl** anhand frei wählbarer Priorities & MACs
- 🟦 **Root / Designated / Blocked Ports** automatisch berechnet
- ⏱ **Konvergenzvergleich STP vs. RSTP** (50 s vs. <1 s) in Echtzeit
- 💥 **Ausfall-Simulation:** Link kappen → Failover live beobachten
- 🛡 **PortFast / BPDU Guard** Demo

Starte den Simulator über den Button im Topic-Bereich.`.trim(),
};

export const CONCEPT_ETHERCHANNEL: Concept = {
  id: "etherchannel",
  title: "EtherChannel (Link Aggregation)",
  appliesTo: ["ccna"],
  tags: [
    "networking",
    "etherchannel",
    "lacp",
    "pagp",
    "redundancy",
    "bandwidth",
  ],
  content: `
## EtherChannel

Bündelt mehrere physische Links zu einem logischen Link.

### Protokolle
| Protokoll | Typ | Beschreibung |
|-----------|-----|-------------|
| LACP (802.3AD) | Offen | IEEE-Standard, von allen Herstellern unterstützt |
| PAgP | Cisco-proprietär | Nur Cisco ↔ Cisco |
| Static (mode on) | Kein Protokoll | Kein Aushandeln, muss auf beiden Seiten konfiguriert sein |

### LACP-Modi
| Seite A | Seite B | Ergebnis |
|---------|---------|---------|
| active | active | ✅ EtherChannel |
| active | passive | ✅ EtherChannel |
| passive | passive | ❌ Kein EtherChannel |

### Cisco Konfiguration
\`\`\`
SW(config)# interface range GigabitEthernet 0/1-2
SW(config-if-range)# channel-group 1 mode active  ! LACP
SW(config-if-range)# exit
SW(config)# interface Port-channel 1
SW(config-if)# switchport mode trunk

SW# show etherchannel summary
\`\`\`
  `.trim(),
};

export const CONCEPT_SWITCHING_VLANS_GUIDE: Concept = {
  id: "switching-vlans-guide",
  title: "Lernguide: Switching & VLANs",
  appliesTo: ["ccna"],
  tags: ["switching", "vlan", "stp", "layer-2", "trunk", "guide"],
  content: `
## Lernziele
- VLANs auf einem Cisco-Switch erstellen und Ports als Access- oder Trunk-Ports konfigurieren
- Den Unterschied zwischen Access Port und Trunk Port erklären und korrekt zuordnen
- STP/RSTP-Konvergenz und die Wahl der Root Bridge nachvollziehen
- Eine VLAN-Segmentierung für mindestens 3 Gruppen planen und umsetzen
- EtherChannel mit LACP konfigurieren und den Status überprüfen

## Praxis-Szenario
Die "Albert-Einstein-Gesamtschule" (Dortmund, 800 Schüler, 60 Lehrkräfte) möchte ihr Netzwerk segmentieren. Bisher sind alle Geräte in einem flachen Netz (192.168.1.0/24). Zukünftig sollen drei Gruppen getrennt werden: VLAN 10 "Schueler" (192.168.10.0/24, ~600 Hosts), VLAN 20 "Lehrer" (192.168.20.0/24, ~80 Hosts) und VLAN 30 "Verwaltung" (192.168.30.0/24, ~20 Hosts). Zwei Cisco Catalyst 2960X-Switches werden im Serverraum und im Lehrerzimmer aufgestellt und über einen Trunk-Link verbunden (native VLAN 999).

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit zwei Switches (SW1 und SW2). Verbinde beide über einen Trunk-Link (GigabitEthernet 0/24). Hänge an SW1 je einen PC für VLAN 10, 20 und 30 an Access-Ports. Hänge an SW2 je einen weiteren PC pro VLAN. Beschrifte alle Ports mit Modus (access/trunk) und VLAN-Nummer.
**Ziel:** Zeigen, dass VLANs switchübergreifend funktionieren und der Trunk alle drei VLANs trägt.
**Tipps:** Vergiss nicht, die VLANs auf beiden Switches zu erstellen (\`vlan 10\`, \`vlan 20\`, \`vlan 30\`). Auf dem Trunk-Port \`switchport trunk allowed vlan 10,20,30\` setzen.

## Verständnisfragen
1. Was ist das Native VLAN auf einem Trunk-Port — und welches Sicherheitsproblem entsteht, wenn es auf beiden Seiten unterschiedlich konfiguriert ist?
2. Warum darf ein Access-Port nur einem einzigen VLAN zugewiesen sein?
3. Was passiert im Netz, wenn STP deaktiviert wird und physische Redundanzlinks existieren?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **Native VLAN Mismatch:** Wenn SW1 native VLAN 1 und SW2 native VLAN 999 konfiguriert hat, erzeugt Cisco einen CDP-Fehler und der Trunk arbeitet fehlerhaft. Immer sicherstellen, dass das Native VLAN auf beiden Seiten identisch ist.
- ⚠️ **Trunk-Port am falschen Gerät als Access konfiguriert:** Endgeräte (PCs, Drucker) bekommen Access-Ports; Switch-zu-Switch- und Switch-zu-Router-Verbindungen bekommen Trunk-Ports. Wer dies verwechselt, verliert den VLAN-Traffic komplett.
- ⚠️ **VLAN nur auf einem Switch erstellt:** Ein VLAN muss auf jedem Switch existieren, der es nutzt. Wird es nur auf SW1 erstellt, trägt der Trunk zwar den Tag, aber SW2 verwirft den Traffic für das unbekannte VLAN.
  `.trim(),
};

export const TOPIC_SWITCHING_VLANS: Topic = {
  id: "switching-vlans",
  title: "Switching & VLANs",
  description:
    "Switching-Grundlagen, VLANs, Trunking, STP/RSTP und EtherChannel — Layer-2-Netzwerke verstehen und konfigurieren.",
  conceptIds: [
    "switching-basics",
    "vlans",
    "stp",
    "stp-simulator",
    "etherchannel",
    "switching-vlans-guide",
    "vlan-simulator",
    "canvas-template:tpl-edu-vlan-trunk-ris",
    "canvas-template:tpl-edu-stp-root-bridge",
  ],
  quizIds: ["ccna-quiz-stp", "ccna-quiz-switching", "ccna-quiz-etherchannel", "ccna-quiz-tag1-wiederholung"],
  exerciseIds: [],
  prerequisiteTopicIds: ["networking-fundamentals"],
  estimatedMinutes: 150,
  tags: ["switching", "vlan", "stp", "layer-2"],
};

export const CONCEPT_VLAN_SIMULATOR: Concept = {
  id: "vlan-simulator",
  title: "VLAN-Simulator",
  appliesTo: ["ccna"],
  tags: ["vlan", "802.1q", "simulator", "interactive"],
  content: `## VLAN-Simulator

Der VLAN-Simulator ermöglicht interaktives Experimentieren mit 802.1Q-Frames:

- Schalte den VLAN-Tag ein/aus und beobachte den Frame-Aufbau auf Bit-Ebene
- Konfiguriere Access- und Trunk-Ports
- Simuliere Inter-VLAN-Routing via ROAS oder Layer-3-Switch

**Starte den Simulator** über den Button im Topic-Bereich.`.trim(),
};

export const SWITCHING_CONCEPTS: Record<string, Concept> = {
  "switching-basics": CONCEPT_SWITCHING_BASICS,
  vlans: CONCEPT_VLANS,
  stp: CONCEPT_STP,
  "stp-simulator": CONCEPT_STP_SIMULATOR,
  etherchannel: CONCEPT_ETHERCHANNEL,
  "switching-vlans-guide": CONCEPT_SWITCHING_VLANS_GUIDE,
  "vlan-simulator": CONCEPT_VLAN_SIMULATOR,
};

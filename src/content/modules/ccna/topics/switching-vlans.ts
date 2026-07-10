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
- 4-Byte-Tag wird in Ethernet-Frame eingefügt (zwischen Quell-MAC und EtherType)
- Enthält VLAN-ID (12 Bit → max. 4094 VLANs)
- Native VLAN wird nicht getaggt

**802.1Q-Tag-Struktur (4 Byte):**
| Feld | Größe | Bedeutung |
|------|-------|-----------|
| TPID (Tag Protocol ID) | 2 Byte | Fester Wert 0x8100 — signalisiert "das ist ein 802.1Q-Tag" |
| PCP (Priority Code Point) | 3 Bit | CoS-Priorität (0–7), entspricht Layer-2-QoS |
| DEI (Drop Eligible Indicator) | 1 Bit | Markiert Frame als bevorzugt verwerfbar bei Überlast |
| VID (VLAN ID) | 12 Bit | Die eigentliche VLAN-Nummer (1–4094) |

### ISL (Inter-Switch Link) — Legacy
- **Cisco-proprietär**, Vorgänger von 802.1Q, heute praktisch nicht mehr im Einsatz
- Kapselt den gesamten Frame (statt nur einen Tag einzufügen) → **30 Byte Overhead**
- Unterstützt nur bis zu **1024 VLANs**
- Prüfungsrelevant nur als Abgrenzung: 802.1Q ist der offene IEEE-Standard und heute Default

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
  title: "STP — Spanning Tree Protocol",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "stp", "layer-2", "redundancy", "loops"],
  content: `
## Spanning Tree Protocol (IEEE 802.1D)

### Problem: Layer-2-Schleifen
Ohne STP → Broadcast-Sturm, MAC-Tabelleninstabilität, Frame-Duplikate

:::slide:stp:::

### BPDUs (Bridge Protocol Data Units)
- STP-Switches tauschen alle **2 Sekunden (Hello-Timer)** BPDUs aus
- Ziel-MAC der BPDU: **Multicast 0180.C200.0000**
- Enthält u. a. Root-BID, Sender-BID, Root Path Cost, Timer-Werte

### Bridge-ID (BID) — Struktur
\`\`\`
Bridge-ID (8 Byte) = Priority (2 Byte) + MAC-Adresse (6 Byte)
\`\`\`
- **Priority**: Default 32768, in Schritten von 4096 änderbar (0–61440)
- Bei **PVST+** wird die Priority um die **Extended System ID** (VLAN-ID, 12 Bit) ergänzt → pro VLAN eine eigene Bridge-ID/eigener Baum
- Niedrigste BID gewinnt die Root-Bridge-Wahl (bei Priority-Gleichstand entscheidet die niedrigste MAC)

### STP-Ablauf
1. **Root Bridge wählen**: Niedrigste Bridge-ID (Priorität + MAC)
2. **Root Ports wählen**: Pro Nicht-Root-Switch, Port mit kleinstem Root Path Cost
3. **Designated Ports wählen**: Pro Segment, bester Port (kleinste Root Path Cost)
4. **Alle anderen Ports**: Blocking-State

### Port-Kosten (Root Path Cost) — IEEE-Standardwerte
| Bandbreite | Kosten (IEEE 802.1D) |
|-----------|----------------------|
| 10 Mbit/s | 100 |
| 100 Mbit/s | 19 |
| 1 Gbit/s | 4 |
| 10 Gbit/s | 2 |

:::falle
Root Path Cost ist die **Summe der Port-Kosten entlang des Pfades zur Root Bridge**, nicht nur die Kosten des eigenen Ports. Bei gleichem Path Cost entscheidet zuerst die niedrigste Sender-BID, dann der niedrigste Sender-Port.
:::

### STP-Port-Zustände (802.1D)
| Zustand | Forwarding | Learning | Dauer |
|---------|-----------|---------|-------|
| Blocking | Nein | Nein | – |
| Listening | Nein | Nein | 15 s |
| Learning | Nein | Ja | 15 s |
| Forwarding | Ja | Ja | – |
| Disabled | Nein | Nein | – |

### STP-Timer und Konvergenzzeit
| Timer | Wert | Bedeutung |
|-------|------|-----------|
| Hello Timer | 2 s | Intervall zwischen BPDUs |
| Forward Delay | 15 s | Dauer je Listening- und Learning-Phase |
| Max Age | 20 s | Wie lange eine BPDU als gültig gilt, bevor der Baum neu berechnet wird |

**Konvergenzzeit-Formel**: Max Age + 2 × Forward Delay ≈ 20 s + 2×15 s = **bis zu 50 Sekunden** (Hauptkritikpunkt an klassischem STP)

### Root-Bridge-Manipulation (Konfiguration)
\`\`\`
SW(config)# spanning-tree vlan 10 priority 4096
! oder relativ zur aktuellen Root-Bridge:
SW(config)# spanning-tree vlan 10 root primary     ! setzt Priority automatisch niedrig genug
SW(config)# spanning-tree vlan 10 root secondary    ! Backup-Root

SW# show spanning-tree vlan 10
\`\`\`

### RSTP (802.1W) — Rapid Spanning Tree
- Cisco-Name: **Rapid PVST+** (pro VLAN ein eigener RSTP-Baum, Default auf modernen Switches)
- Konvergenz typischerweise **< 1–10 Sekunden** statt bis zu 50 s

**Port-States (nur 3 statt 5):**
| STP (802.1D) | RSTP (802.1W) |
|--------------|---------------|
| Blocking, Listening | Discarding |
| Learning | Learning |
| Forwarding | Forwarding |

**Port-Rollen (RSTP):**
| Rolle | Bedeutung |
|-------|-----------|
| Root Port | Bester Weg zur Root Bridge (wie bei STP) |
| Designated Port | Bester Port je Segment (wie bei STP) |
| **Alternate Port** | Backup für den Root Port — übernimmt sofort bei dessen Ausfall |
| **Backup Port** | Backup für einen Designated Port am selben Segment (z. B. Hub) |

**Link-Typen (beeinflussen Konvergenzgeschwindigkeit):**
| Link-Typ | Beschreibung |
|----------|-------------|
| Point-to-Point | Full-Duplex zwischen zwei Switches → schneller Proposal/Agreement-Handshake |
| Shared | Half-Duplex (Hub) → verhält sich wie klassisches STP |
| Edge | Entspricht PortFast — Endgerät, sofort Forwarding |

- **Proposal/Agreement-Handshake**: RSTP synchronisiert Nachbarn direkt (statt auf Timer zu warten) — dadurch die schnelle Konvergenz auf Point-to-Point-Links
- RSTP ist abwärtskompatibel: erkennt Legacy-STP-Switches an deren BPDU-Version und fällt dort automatisch auf klassisches STP-Verhalten zurück

### PortFast & BPDU Guard
\`\`\`
SW(config-if)# spanning-tree portfast          ! Access-Ports: sofort Forwarding
SW(config-if)# spanning-tree bpduguard enable  ! Deaktiviert Port bei BPDU-Empfang
\`\`\`

:::merke
**PortFast** nur auf Ports zu Endgeräten (PCs, Drucker) — niemals zu anderen Switches, sonst droht eine Layer-2-Schleife! **BPDU Guard** schützt genau davor: Empfängt ein PortFast-Port dennoch eine BPDU, wird er sofort in den err-disabled-Zustand versetzt.
:::
  `.trim(),
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

### Load-Balancing-Kriterien
Der Switch wählt anhand eines Hash-Algorithmus, über welchen physischen Link ein Frame läuft (nicht rundenbasiert):
- Quell-/Ziel-MAC (src-mac, dst-mac, src-dst-mac)
- Quell-/Ziel-IP (src-ip, dst-ip, src-dst-ip)
- Quell-/Ziel-Port (src-port, dst-port), je nach Plattform

\`\`\`
SW(config)# port-channel load-balance src-dst-ip
\`\`\`

:::falle
Ein einzelner Datenstrom (z. B. eine einzelne TCP-Session) läuft **immer über denselben physischen Link** — Load Balancing verteilt nur *zwischen* verschiedenen Flows, nicht innerhalb eines Flows.
:::

### Grenzen
- Max. **8 aktive Links** pro EtherChannel (LACP kann bis zu 8 weitere als Standby vorhalten = 16 Member insgesamt)
- Max. Anzahl EtherChannels pro Switch ist plattformabhängig (typisch bis zu 16)

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
  title: "Switching-Grundlagen & VLANs",
  description:
    "Wie ein Switch lernt und weiterleitet, MAC-Tabelle und VLANs/Trunking — das Layer-2-Fundament. STP und EtherChannel haben eigene Themen.",
  conceptIds: [
    "switching-basics",
    "vlans",
    "switching-vlans-guide",
    "vlan-simulator",
    "canvas-template:tpl-edu-vlan-trunk-ris",
  ],
  quizIds: ["ccna-quiz-switching"],
  exerciseIds: [],
  prerequisiteTopicIds: ["networking-fundamentals"],
  estimatedMinutes: 90,
  tags: ["switching", "vlan", "layer-2"],
  lessonSummary: {
    mustKnow: [
      "Configure access ports (switchport mode access) and trunk ports (switchport mode trunk) explicitly",
      "802.1Q tagging — 4-byte tag inserted between src-MAC and EtherType; the only trunking standard in use today",
      "Native VLAN — untagged VLAN on a trunk port; default is VLAN 1, which is a known security risk",
      "switchport trunk allowed vlan — always use an explicit allowlist; never leave trunks carrying all VLANs",
      "Voice VLAN — configured on access ports alongside the data VLAN to support IP phones with QoS prioritization",
    ],
    bestPractice: [
      {
        topic: "Access / Trunk port mode",
        practice:
          "Always set port mode explicitly with 'switchport mode access' or 'switchport mode trunk'; never rely on DTP auto-negotiation.",
      },
      {
        topic: "Native VLAN",
        practice:
          "Change the native VLAN from VLAN 1 to an unused VLAN (e.g. 999) on every trunk port: 'switchport trunk native vlan 999'.",
        note: "[Cisco only] — 802.1Q itself does not define a native VLAN concept; this is Cisco's implementation detail",
      },
      {
        topic: "Trunk encapsulation",
        practice:
          "Use dot1q encapsulation — it is the only option on modern switches and the IEEE standard.",
        note: "[IOS-XE differs] — 'switchport trunk encapsulation dot1q' is not required on IOS-XE; dot1q is the only supported encapsulation",
      },
      {
        topic: "Trunk allowed VLANs",
        practice:
          "Always specify an explicit VLAN list: 'switchport trunk allowed vlan 10,20,30'; never leave the trunk set to carry all VLANs.",
      },
      {
        topic: "Voice VLAN",
        practice:
          "Configure 'switchport voice vlan <id>' on access ports connected to IP phones; this enables the phone to tag voice traffic separately from PC data.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "DTP (Dynamic Trunking Protocol)",
        reason:
          "Security risk: enables VLAN hopping via switch spoofing; disabled in modern network designs",
        replacedBy: "'switchport nonegotiate' on all trunk ports",
      },
      {
        topic: "VTP v1 / VTP v2",
        reason:
          "VTP advertisement storms have caused production-wide VLAN database wipes; most enterprises disable VTP entirely",
        replacedBy: "Manual VLAN configuration per switch, or VTP v3 with a domain password",
      },
      {
        topic: "VLAN 1 as native VLAN",
        reason:
          "Attack surface for double-tagging VLAN hopping attacks; Cisco security hardening guides explicitly recommend changing it",
        replacedBy: "An unused, dedicated native VLAN (e.g. VLAN 999) with no hosts assigned",
      },
      {
        topic: "ISL (Inter-Switch Link)",
        reason:
          "Cisco-proprietary predecessor to 802.1Q, no longer supported on modern IOS-XE platforms; adds 30-byte overhead and caps at 1024 VLANs",
        replacedBy: "802.1Q (dot1q)",
      },
    ],
    fastFacts: [
      "VLAN 1 is the default native VLAN on all Cisco trunk ports. Verify: show interfaces trunk",
      "DTP is enabled by default — disable it with 'switchport nonegotiate' on every trunk port. Verify: show dtp interface <int>",
      "802.1Q adds a 4-byte tag between src-MAC and EtherType; max Ethernet frame size grows from 1518 to 1522 bytes. Verify: show interfaces <int> | include MTU",
    ],
  },
};

export const TOPIC_STP: Topic = {
  id: "stp",
  title: "STP — Spanning Tree Protocol",
  description:
    "Root Bridge, Root/Designated Ports, Port-Zustände, RSTP und PortFast/BPDU Guard — Layer-2-Schleifen verhindern.",
  conceptIds: ["stp", "canvas-template:tpl-edu-stp-root-bridge"],
  quizIds: ["ccna-quiz-stp"],
  exerciseIds: [],
  prerequisiteTopicIds: ["switching-vlans"],
  estimatedMinutes: 40,
  tags: ["switching", "stp", "layer-2", "redundancy"],
  lessonSummary: {
    mustKnow: [
      "Root Bridge election: lowest Bridge ID (priority + MAC) wins; control with 'spanning-tree vlan <id> priority <0-61440>'",
      "Root Path Cost is the sum of port costs along the path to the Root Bridge — not just the local port cost",
      "Classic STP (802.1D) convergence can take up to 50 s (Max Age 20 + 2 × Forward Delay 15); Rapid PVST+ converges in under 10 s",
      "PortFast: skips Listening and Learning states; use only on access ports to end-hosts — never toward another switch",
      "BPDU Guard: err-disables a PortFast port immediately if a BPDU is received — prevents rogue switch attachments",
    ],
    bestPractice: [
      {
        topic: "Root Bridge placement",
        practice:
          "Manually set the Root Bridge on the distribution/core switch with 'spanning-tree vlan <id> root primary' — never let it be elected by default (random MAC).",
        note: "[Cisco only] — sets priority automatically lower than current root",
      },
      {
        topic: "Rapid PVST+",
        practice:
          "Use Rapid PVST+ ('spanning-tree mode rapid-pvst') on all modern Cisco switches — it is the default on IOS 15+ and converges in seconds rather than up to 50 s.",
        note: "[Cisco only] — IEEE equivalent is 802.1w (RSTP)",
      },
      {
        topic: "PortFast + BPDU Guard",
        practice:
          "Enable both globally for all access ports: 'spanning-tree portfast default' and 'spanning-tree portfast bpduguard default'.",
        note: "[Cisco only]",
      },
      {
        topic: "Port cost for multi-gigabit",
        practice:
          "Set 'auto-cost reference-bandwidth' equivalent: use 'spanning-tree pathcost method long' so GigabitEthernet and 10-GigE have distinct costs (not both 1).",
        note: "[Cisco only]",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Classic STP (IEEE 802.1D)",
        reason:
          "50-second convergence time (Max Age 20 s + 2 × Forward Delay 15 s) causes traffic disruption during topology changes; all modern switches run RSTP by default",
        replacedBy: "Rapid PVST+ (Cisco) or 802.1w RSTP",
      },
      {
        topic: "PVST+ (Classic per-VLAN STP)",
        reason:
          "Cisco's per-VLAN variant of 802.1D; still present as a fallback mode but offers no advantage over Rapid PVST+",
        replacedBy: "Rapid PVST+",
      },
    ],
    fastFacts: [
      "Rapid PVST+ is the default STP mode on Cisco Catalyst switches running IOS 15+. Verify: show spanning-tree summary",
      "A PortFast port that receives a BPDU goes err-disabled immediately with BPDU Guard enabled. Verify: show interfaces <int> status",
      "Default STP port cost for FastEthernet is 19; GigabitEthernet is 4 (with default 100M reference bandwidth). Verify: show spanning-tree vlan <id>",
    ],
  },
};

export const TOPIC_ETHERCHANNEL: Topic = {
  id: "etherchannel",
  title: "EtherChannel (Link Aggregation)",
  description:
    "LACP, PAgP und statisches EtherChannel — mehrere physische Links zu einem logischen Link bündeln.",
  conceptIds: ["etherchannel"],
  quizIds: ["ccna-quiz-etherchannel"],
  exerciseIds: [],
  prerequisiteTopicIds: ["switching-vlans"],
  estimatedMinutes: 30,
  tags: ["switching", "etherchannel", "lacp", "layer-2"],
  lessonSummary: {
    mustKnow: [
      "LACP (IEEE 802.3ad) is the open standard; PAgP is Cisco-proprietary; both negotiate EtherChannel dynamically — static 'mode on' requires no negotiation but must match on both sides",
      "LACP modes: active+active or active+passive forms a bundle; passive+passive does NOT form a bundle",
      "All member ports must have identical speed, duplex, VLAN configuration, and trunk/access mode — a mismatch prevents the EtherChannel from forming",
      "Load balancing uses a hash of source/destination MAC or IP; a single TCP flow always stays on one physical link (not per-packet round-robin)",
      "Maximum 8 active links per LACP EtherChannel (plus up to 8 hot-standby links = 16 member ports total)",
    ],
    bestPractice: [
      {
        topic: "Protocol selection",
        practice:
          "Use LACP ('channel-group <n> mode active') in all environments; PAgP only when connecting Cisco to Cisco and LACP is unavailable for legacy reasons.",
        note: "[Cisco only for PAgP]",
      },
      {
        topic: "Hash algorithm",
        practice:
          "Set 'port-channel load-balance src-dst-ip' for routed traffic between many hosts; 'src-dst-mac' for Layer-2 access-layer links — choose based on traffic diversity to maximize distribution across physical links.",
        note: "[Cisco only]",
      },
      {
        topic: "STP and EtherChannel",
        practice:
          "Spanning Tree sees the Port-Channel as a single logical link; ensure STP port cost on Port-Channel reflects its aggregate bandwidth ('spanning-tree pathcost method long').",
        note: "[Cisco only]",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Static EtherChannel (mode on)",
        reason:
          "No negotiation protocol — if one side is 'on' and the other is 'auto/desirable/active/passive', the port goes into err-disabled; also provides no detection of misconfiguration",
        replacedBy: "LACP with 'mode active' on both sides",
      },
    ],
    fastFacts: [
      "'show etherchannel summary' shows each group, member ports, and the bundle state (SU = Layer-2 in use; P = member port in bundle). Verify: show etherchannel summary",
      "A single TCP stream will always use one physical link regardless of how many links are in the EtherChannel — load balancing is per-flow, not per-packet. Verify: show etherchannel load-balance",
      "If member ports have different VLANs or different trunk/access modes, the EtherChannel will not form and ports may go err-disabled. Verify: show interfaces port-channel <n>",
    ],
  },
};

// Hinweis: "vlan-simulator" ist als Concept in vlan-advanced.ts definiert
// (dort deutlich ausführlicher) — TOPIC_SWITCHING_VLANS referenziert die ID
// weiterhin, löst aber über die gemeinsame concepts-Registry dorthin auf.

export const SWITCHING_CONCEPTS: Record<string, Concept> = {
  "switching-basics": CONCEPT_SWITCHING_BASICS,
  vlans: CONCEPT_VLANS,
  stp: CONCEPT_STP,
  etherchannel: CONCEPT_ETHERCHANNEL,
  "switching-vlans-guide": CONCEPT_SWITCHING_VLANS_GUIDE,
};

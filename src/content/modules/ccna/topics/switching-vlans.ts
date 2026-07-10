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
      "Access-Ports (switchport mode access) und Trunk-Ports (switchport mode trunk) immer explizit konfigurieren",
      "802.1Q-Tagging — 4-Byte-Tag zwischen Quell-MAC und EtherType; der einzige heute verwendete Trunking-Standard",
      "Native VLAN — ungetaggtes VLAN auf einem Trunk-Port; Standard ist VLAN 1, was ein bekanntes Sicherheitsrisiko darstellt",
      "switchport trunk allowed vlan — immer eine explizite Erlaubnisliste verwenden; Trunks niemals alle VLANs tragen lassen",
      "Voice VLAN — auf Access-Ports neben dem Daten-VLAN konfiguriert, um IP-Telefone mit QoS-Priorisierung zu unterstützen",
    ],
    bestPractice: [
      {
        topic: "Access / Trunk Port-Modus",
        practice:
          "Port-Modus immer explizit mit 'switchport mode access' oder 'switchport mode trunk' setzen; niemals auf DTP-Auto-Aushandlung verlassen.",
      },
      {
        topic: "Native VLAN",
        practice:
          "Das Native VLAN von VLAN 1 auf ein ungenutztes VLAN (z. B. 999) an jedem Trunk-Port ändern: 'switchport trunk native vlan 999'.",
        note: "[Cisco only] — 802.1Q selbst definiert kein Native-VLAN-Konzept; dies ist Ciscos Implementierungsdetail",
      },
      {
        topic: "Trunk-Kapselung",
        practice:
          "Dot1q-Kapselung verwenden — sie ist die einzige Option auf modernen Switches und der IEEE-Standard.",
        note: "[IOS-XE differs] — 'switchport trunk encapsulation dot1q' ist auf IOS-XE nicht erforderlich; dot1q ist die einzige unterstützte Kapselung",
      },
      {
        topic: "Erlaubte Trunk-VLANs",
        practice:
          "Immer eine explizite VLAN-Liste angeben: 'switchport trunk allowed vlan 10,20,30'; den Trunk nie so lassen, dass er alle VLANs trägt.",
      },
      {
        topic: "Voice VLAN",
        practice:
          "'switchport voice vlan <id>' auf Access-Ports konfigurieren, die an IP-Telefone angeschlossen sind; so kann das Telefon Sprach-Traffic separat von PC-Daten taggen.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "DTP (Dynamic Trunking Protocol)",
        reason:
          "Sicherheitsrisiko: ermöglicht VLAN-Hopping durch Switch-Spoofing; in modernen Netzwerkdesigns deaktiviert",
        replacedBy: "'switchport nonegotiate' auf allen Trunk-Ports",
      },
      {
        topic: "VTP v1 / VTP v2",
        reason:
          "VTP-Advertisement-Stürme haben produktionsweite VLAN-Datenbank-Löschungen verursacht; die meisten Unternehmen deaktivieren VTP vollständig",
        replacedBy: "Manuelle VLAN-Konfiguration pro Switch oder VTP v3 mit Domain-Passwort",
      },
      {
        topic: "VLAN 1 als Native VLAN",
        reason:
          "Angriffsfläche für Double-Tagging-VLAN-Hopping-Angriffe; Cisco-Sicherheitsleitfäden empfehlen ausdrücklich eine Änderung",
        replacedBy: "Ein ungenutztes, dediziertes Native VLAN (z. B. VLAN 999) ohne zugewiesene Hosts",
      },
      {
        topic: "ISL (Inter-Switch Link)",
        reason:
          "Ciscos proprietärer Vorgänger zu 802.1Q; auf modernen IOS-XE-Plattformen nicht mehr unterstützt; fügt 30 Byte Overhead hinzu und ist auf 1024 VLANs begrenzt",
        replacedBy: "802.1Q (dot1q)",
      },
    ],
    fastFacts: [
      "VLAN 1 ist das Standard-Native-VLAN auf allen Cisco-Trunk-Ports. Verify: show interfaces trunk",
      "DTP ist standardmäßig aktiviert — mit 'switchport nonegotiate' auf jedem Trunk-Port deaktivieren. Verify: show dtp interface <int>",
      "802.1Q fügt ein 4-Byte-Tag zwischen Quell-MAC und EtherType ein; die maximale Ethernet-Frame-Größe wächst von 1518 auf 1522 Bytes. Verify: show interfaces <int> | include MTU",
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
      "Root-Bridge-Wahl: die niedrigste Bridge-ID (Priorität + MAC) gewinnt; mit 'spanning-tree vlan <id> priority <0-61440>' manuell steuern",
      "Root Path Cost ist die Summe der Port-Kosten entlang des Weges zur Root-Bridge — nicht nur die lokalen Port-Kosten",
      "Classic STP (802.1D) benötigt bis zu 50 s für Konvergenz (Max Age 20 + 2 × Forward Delay 15); Rapid PVST+ konvergiert in unter 10 s",
      "PortFast: überspringt Listening- und Learning-Zustände; nur auf Access-Ports zu End-Hosts verwenden — niemals in Richtung eines anderen Switches",
      "BPDU Guard: deaktiviert einen PortFast-Port sofort per err-disabled, wenn ein BPDU empfangen wird — verhindert das Anschließen unerlaubter Switches",
    ],
    bestPractice: [
      {
        topic: "Root-Bridge-Platzierung",
        practice:
          "Root-Bridge manuell auf dem Distribution-/Core-Switch setzen mit 'spanning-tree vlan <id> root primary' — niemals per Zufall wählen lassen (zufällige MAC).",
        note: "[Cisco only] — setzt Priorität automatisch niedriger als die aktuelle Root",
      },
      {
        topic: "Rapid PVST+",
        practice:
          "Rapid PVST+ ('spanning-tree mode rapid-pvst') auf allen modernen Cisco-Switches verwenden — Standard ab IOS 15+, konvergiert in Sekunden statt bis zu 50 s.",
        note: "[Cisco only] — IEEE-Äquivalent ist 802.1w (RSTP)",
      },
      {
        topic: "PortFast + BPDU Guard",
        practice:
          "Beides global für alle Access-Ports aktivieren: 'spanning-tree portfast default' und 'spanning-tree portfast bpduguard default'.",
        note: "[Cisco only]",
      },
      {
        topic: "Port-Kosten für Multi-Gigabit",
        practice:
          "'spanning-tree pathcost method long' verwenden, damit GigabitEthernet und 10-GigE unterschiedliche Kosten haben (nicht beide 1).",
        note: "[Cisco only]",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Classic STP (IEEE 802.1D)",
        reason:
          "50 Sekunden Konvergenzzeit (Max Age 20 s + 2 × Forward Delay 15 s) verursacht Traffic-Unterbrechungen bei Topologieänderungen; alle modernen Switches laufen standardmäßig mit RSTP",
        replacedBy: "Rapid PVST+ (Cisco) oder 802.1w RSTP",
      },
      {
        topic: "PVST+ (Classic Per-VLAN STP)",
        reason:
          "Ciscos Per-VLAN-Variante von 802.1D; als Fallback-Modus noch vorhanden, bietet aber keinen Vorteil gegenüber Rapid PVST+",
        replacedBy: "Rapid PVST+",
      },
    ],
    fastFacts: [
      "Rapid PVST+ ist der Standard-STP-Modus auf Cisco-Catalyst-Switches mit IOS 15+. Verify: show spanning-tree summary",
      "Ein PortFast-Port, der ein BPDU empfängt, wird sofort per err-disabled deaktiviert, wenn BPDU Guard aktiv ist. Verify: show interfaces <int> status",
      "Standard-STP-Port-Kosten für FastEthernet: 19; GigabitEthernet: 4 (bei Standard-Referenzbandbreite 100M). Verify: show spanning-tree vlan <id>",
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
      "LACP (IEEE 802.3ad) ist der offene Standard; PAgP ist Cisco-proprietär; beide handeln EtherChannel dynamisch aus — statisches 'mode on' erfordert keine Aushandlung, muss aber auf beiden Seiten übereinstimmen",
      "LACP-Modi: active+active oder active+passive bilden einen Bundle; passive+passive bildet KEINEN Bundle",
      "Alle Member-Ports müssen identische Geschwindigkeit, Duplex, VLAN-Konfiguration und Trunk-/Access-Modus haben — eine Abweichung verhindert die Bildung des EtherChannel",
      "Load Balancing nutzt einen Hash aus Quell-/Ziel-MAC oder IP; ein einzelner TCP-Flow bleibt immer auf einem physischen Link (kein Per-Paket-Round-Robin)",
      "Maximal 8 aktive Links pro LACP-EtherChannel (plus bis zu 8 Hot-Standby-Links = 16 Member-Ports insgesamt)",
    ],
    bestPractice: [
      {
        topic: "Protokollauswahl",
        practice:
          "LACP ('channel-group <n> mode active') in allen Umgebungen verwenden; PAgP nur bei Cisco-zu-Cisco-Verbindungen, wenn LACP aus Legacy-Gründen nicht verfügbar ist.",
        note: "[Cisco only für PAgP]",
      },
      {
        topic: "Hash-Algorithmus",
        practice:
          "'port-channel load-balance src-dst-ip' für gerouteten Traffic zwischen vielen Hosts setzen; 'src-dst-mac' für Layer-2-Access-Layer-Links — je nach Traffic-Diversität wählen, um die Verteilung auf physische Links zu maximieren.",
        note: "[Cisco only]",
      },
      {
        topic: "STP und EtherChannel",
        practice:
          "Spanning Tree sieht den Port-Channel als einen einzelnen logischen Link; STP-Port-Kosten am Port-Channel müssen die aggregierte Bandbreite widerspiegeln ('spanning-tree pathcost method long').",
        note: "[Cisco only]",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Statischer EtherChannel (mode on)",
        reason:
          "Kein Aushandlungsprotokoll — wenn eine Seite 'on' ist und die andere 'auto/desirable/active/passive', geht der Port in err-disabled; erkennt auch keine Fehlkonfigurationen",
        replacedBy: "LACP mit 'mode active' auf beiden Seiten",
      },
    ],
    fastFacts: [
      "'show etherchannel summary' zeigt jede Gruppe, Member-Ports und den Bundle-Zustand (SU = Layer-2 in Betrieb; P = Member-Port im Bundle). Verify: show etherchannel summary",
      "Ein einzelner TCP-Stream nutzt immer einen physischen Link — Load Balancing erfolgt pro Flow, nicht pro Paket. Verify: show etherchannel load-balance",
      "Haben Member-Ports unterschiedliche VLANs oder Trunk-/Access-Modi, bildet sich kein EtherChannel und Ports können err-disabled werden. Verify: show interfaces port-channel <n>",
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

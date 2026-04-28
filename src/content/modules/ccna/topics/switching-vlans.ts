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
  title: "STP — Spanning Tree Protocol",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "stp", "layer-2", "redundancy", "loops"],
  content: `
## Spanning Tree Protocol (IEEE 802.1D)

### Problem: Layer-2-Schleifen
Ohne STP → Broadcast-Sturm, MAC-Tabelleninstabilität, Frame-Duplikate

### STP-Ablauf
1. **Root Bridge wählen**: Niedrigste Bridge-ID (Priorität + MAC)
2. **Root Ports wählen**: Pro Nicht-Root-Switch, Port mit kleinstem Root Path Cost
3. **Designated Ports wählen**: Pro Segment, bester Port (kleinste Root Path Cost)
4. **Alle anderen Ports**: Blocking-State

### STP-Port-Zustände (802.1D)
| Zustand | Forwarding | Learning | Dauer |
|---------|-----------|---------|-------|
| Blocking | Nein | Nein | – |
| Listening | Nein | Nein | 15 s |
| Learning | Nein | Ja | 15 s |
| Forwarding | Ja | Ja | – |
| Disabled | Nein | Nein | – |

**Konvergenzzeit**: bis zu 50 Sekunden (Problem!)

### RSTP (802.1W)
- Rapid Spanning Tree → Konvergenz in < 1 Sekunde
- Port-Rollen: Root, Designated, Alternate, Backup
- Cisco: PVST+, Rapid-PVST+ (per VLAN)

### PortFast & BPDU Guard
\`\`\`
SW(config-if)# spanning-tree portfast          ! Access-Ports: sofort Forwarding
SW(config-if)# spanning-tree bpduguard enable  ! Deaktiviert Port bei BPDU-Empfang
\`\`\`
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
    "etherchannel",
    "switching-vlans-guide",
  ],
  quizIds: [],
  exerciseIds: [],
  prerequisiteTopicIds: ["networking-fundamentals"],
  estimatedMinutes: 150,
  tags: ["switching", "vlan", "stp", "layer-2"],
};

export const SWITCHING_CONCEPTS: Record<string, Concept> = {
  "switching-basics": CONCEPT_SWITCHING_BASICS,
  vlans: CONCEPT_VLANS,
  stp: CONCEPT_STP,
  etherchannel: CONCEPT_ETHERCHANNEL,
  "switching-vlans-guide": CONCEPT_SWITCHING_VLANS_GUIDE,
};

// ============================================================
// Shared Concept: OSI Model
// appliesTo: ccna, comptia-network-plus, az-104 (networking)
// ============================================================

import type { Concept } from "@/lib/content/types";

export const CONCEPT_OSI_MODEL: Concept = {
  id: "osi-model",
  title: "OSI-Modell (7 Schichten)",
  appliesTo: ["ccna", "comptia-network-plus", "az-104"],
  tags: ["networking", "osi", "layer", "encapsulation", "reference-model"],
  relatedConceptIds: ["tcp-ip-model", "encapsulation"],
  content: `
## ISO/OSI Referenzmodell

Das **ISO/OSI-Modell** (Open Systems Interconnection) ist ein 7-schichtiges Referenzmodell für die standardisierte Kommunikation in Netzwerken.

| Schicht | Name | PDU | Beispielprotokolle |
|---------|------|-----|--------------------|
| 7 | Application | Daten | HTTP, FTP, SMTP, DNS |
| 6 | Presentation | Daten | TLS, JPEG, ASCII |
| 5 | Session | Daten | NetBIOS, RPC |
| 4 | Transport | Segment | TCP, UDP |
| 3 | Network | Paket | IP, ICMP, OSPF |
| 2 | Data Link | Frame | Ethernet, PPP, 802.11 |
| 1 | Physical | Bit | Kupfer, Glasfaser, WLAN |

### Merkhilfe (oben → unten)
**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing

### Encapsulation / Decapsulation
- **Sender**: Jede Schicht fügt einen Header (und ggf. Trailer) hinzu
- **Empfänger**: Jede Schicht entfernt den entsprechenden Header

### Wichtige Geräte und ihre Schichten
| Gerät | OSI-Schicht | Kriterium |
|-------|------------|-----------|
| Hub | 1 – Physical | Broadcastet alle Bits |
| Switch | 2 – Data Link | MAC-Adressen |
| Router | 3 – Network | IP-Adressen |
| L3-Switch | 2 + 3 | MAC + IP |

### TCP/IP Modell (4 Schichten)
| TCP/IP | OSI-Entsprechung |
|--------|-----------------|
| Application | 5, 6, 7 |
| Transport | 4 |
| Internet | 3 |
| Network Access | 1, 2 |
  `.trim(),
};

export const CONCEPT_ENCAPSULATION: Concept = {
  id: "encapsulation",
  title: "Encapsulation & Decapsulation",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "osi", "encapsulation", "pdu"],
  relatedConceptIds: ["osi-model"],
  content: `
## Datenkapselung (Encapsulation)

Encapsulation beschreibt den Prozess, bei dem jede OSI-Schicht beim **Senden** einen Header (und ggf. Trailer) an die Daten anhängt.

\`\`\`
Schicht 7-5: Daten
           ↓ + Transport-Header (TCP/UDP)
Schicht 4:  Segment
           ↓ + Network-Header (IP)
Schicht 3:  Paket
           ↓ + Data-Link-Header + Trailer (Ethernet)
Schicht 2:  Frame
           ↓ Bits auf dem Medium
Schicht 1:  Bits
\`\`\`

### Decapsulation
Beim **Empfangen** wird jeder Header von der entsprechenden Schicht entfernt (in umgekehrter Reihenfolge).

### PDU-Bezeichnungen
| Schicht | PDU-Name |
|---------|----------|
| 4 | Segment |
| 3 | Paket |
| 2 | Frame |
| 1 | Bit |
  `.trim(),
};

export const CONCEPT_NETWORK_TOPOLOGIES: Concept = {
  id: "network-topologies",
  title: "Netzwerktopologien",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "topology", "design", "redundancy"],
  content: `
## Netzwerktopologien

### Physische Topologien
| Topologie | Beschreibung | Redundanz |
|-----------|-------------|-----------|
| Bus | Alle Geräte an einem Kabel | Sehr gering |
| Linie (Line / Daisy-Chain) | Geräte in Reihe verkettet, jeder hat genau 2 Nachbarn (außer den Enden) | Sehr gering — Kabelbruch trennt Netz |
| Ring | Wie Linie, aber Endpunkte geschlossen → Token kreist | Gering — bei zwei Brüchen geteilt |
| Star | Alle Geräte über zentralen Switch | Mittel — Switch = Single Point of Failure |
| Baum (Tree) | Hierarchische Verkettung mehrerer Sterne (z. B. Etagen-Switch → Core-Switch) | Mittel |
| Mesh (full) | Jeder mit jedem verbunden | Sehr hoch |
| Mesh (partial) | Ausgewählte direkte Verbindungen | Hoch |
| Hybrid | Kombination mehrerer Topologien | Variabel |

### Vergleichstabelle (Praxis-Bewertung)
| Topologie | Ausfallsicherheit | Kosten | Erweiterbarkeit | Heute relevant? |
|-----------|-------------------|--------|-----------------|------------------|
| Bus       | ✗ niedrig         | ✓ sehr günstig | ✗ nur kurze Strecken | nein (historisch, 10BASE-2/5) |
| Linie     | ✗ niedrig         | ✓ günstig | ⚠ jeder Knoten ist Single Point | nur Industrieprotokolle (z. B. PROFIBUS) |
| Ring      | ⚠ mittel (Token Ring), ✓ Dual-Ring (FDDI/SDH) | ⚠ mittel | ⚠ aufwendig | im LAN nein, im MAN/WAN ja (SDH, RPR) |
| Star      | ⚠ Switch = SPOF   | ⚠ mittel | ✓ einfach (Port hinzufügen) | ✓ Standard im Access-Layer |
| Baum      | ⚠ Mittel (mehrere SPOFs)        | ⚠ mittel | ✓ sehr gut (Etagen / Standorte) | ✓ Standard für Campus-Netze |
| Mesh full | ✓ höchstmöglich   | ✗ teuer (n·(n−1)/2 Links) | ✗ schwer skalierbar | nur in WAN-Backbones / Spine-Leaf |
| Hybrid    | abhängig          | abhängig | ✓ ja | ✓ Realität jedes größeren Netzes |

### Cisco Hierarchical Network Model (3-Tier)
\`\`\`
┌──────────────────────────────┐
│    Core Layer (Backbone)     │  Hochgeschwindigkeit, kein Filtering
├──────────────────────────────┤
│  Distribution Layer          │  Routing, Policy, Aggregation
├──────────────────────────────┤
│    Access Layer              │  Endgeräteanschluss, Port-Security
└──────────────────────────────┘
\`\`\`

- **Core Layer**: Maximale Performance, keine Paketmanipulation
- **Distribution Layer**: Routing zwischen VLANs, ACLs, QoS
- **Access Layer**: Endgeräte, VLANs, DHCP, PoE

### Spine & Leaf (Data Center)
Moderne 2-Tier-Architektur für Rechenzentren:
- **Spine Switches**: Core-Layer, verbinden alle Leaf Switches
- **Leaf Switches**: Access-Layer, verbinden Server und Endgeräte
  `.trim(),
};

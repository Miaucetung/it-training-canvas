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

| Schicht | Name | PDU | Merksatz | Beispiele |
|---------|------|-----|----------|-----------|
| 7 | Application | Daten | Welche Anwendung nutzt den Netzwerkdienst? | HTTP/HTTPS, FTP, SSH, DNS, SMTP, IMAP |
| 6 | Presentation | Daten | Wie werden die Daten dargestellt oder umgewandelt? | TLS/SSL, JPEG, PNG, ASCII, UTF-8, Kompression |
| 5 | Session | Daten | Bleibt die Unterhaltung zwischen zwei Systemen organisiert? | Login-Sitzungen, RPC, NetBIOS-Session |
| 4 | Transport | Segment | Zu welchem Dienst oder Programm gehören die Daten? | TCP, UDP, Portnummern |
| 3 | Network | Paket | In welches Netzwerk muss das Paket? | IPv4, IPv6, ICMP, Router, L3-Switch |
| 2 | Data Link | Frame | Welches Gerät im lokalen Netz bekommt den Frame? | Ethernet, WLAN, MAC-Adresse, Switch, VLAN |
| 1 | Physical | Bit | Kommt ein Signal an oder nicht? | Kabel, Glasfaser, Funk, RJ45, Hub, Repeater |

### Merkhilfe (Schicht 7→1)
**A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing

:::slide:osi:::

### Schichten im Detail

**Schicht 1 — Physical Layer (Bitübertragungsschicht)**
Zuständig für die physikalische Übertragung von Bits als elektrische, optische oder Funksignale. Kabel, Stecker, Spannung, Frequenz, Datenrate und Signalform sind hier geregelt.
Geräte: Hub, Repeater, RJ45-Stecker

**Schicht 2 — Data Link Layer (Sicherungsschicht)**
Kommunikation im lokalen Netzwerk. MAC-Adressen, Ethernet-Frames, Fehlererkennung (FCS). ARP wird oft im Umfeld dieser Schicht behandelt.
Geräte: Switch, WLAN-Access-Point

**Schicht 3 — Network Layer (Vermittlungsschicht)**
Kommunikation zwischen verschiedenen Netzwerken: logische Adressierung (IP), Routing, Wegfindung.
Geräte: Router, Layer-3-Switch

**Schicht 4 — Transport Layer (Transportschicht)**
Ende-zu-Ende-Kommunikation, Ports, Segmentierung, Flusskontrolle.
- **TCP** (verbindungsorientiert, zuverlässig): HTTP, SSH, FTP, E-Mail
- **UDP** (verbindungslos, schnell): DNS, VoIP, Streaming, Online-Gaming

**Schicht 5 — Session Layer (Sitzungsschicht)**
Aufbau, Verwaltung und Beendigung von Kommunikationssitzungen.

**Schicht 6 — Presentation Layer (Darstellungsschicht)**
Datenformatierung, Zeichencodierung, Komprimierung, Verschlüsselung/Entschlüsselung.

**Schicht 7 — Application Layer (Anwendungsschicht)**
Dienste für Benutzerprogramme, Zugriff auf Netzwerkfunktionen.

### Wichtige Geräte und ihre Schichten
| Gerät | OSI-Schicht | Kriterium |
|-------|------------|-----------|
| Hub | 1 – Physical | Broadcastet alle Bits |
| Switch | 2 – Data Link | MAC-Adressen |
| Router | 3 – Network | IP-Adressen |
| L3-Switch | 2 + 3 | MAC + IP |

### TCP/IP Modell (4 Schichten) vs. OSI
| TCP/IP | OSI-Entsprechung | Protokolle |
|--------|-----------------|------------|
| Application | 5 + 6 + 7 | HTTP, DNS, FTP, SMTP, SSH |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IP, ICMP, ARP |
| Network Access | 1 + 2 | Ethernet, WLAN |

### Encapsulation — Beispiel: Webseite abrufen
\`\`\`
Browser (Layer 7) → HTTP GET /index.html
  ↓ + TCP-Header (Port 80) → Segment
  ↓ + IP-Header (Ziel-IP) → Paket
  ↓ + Ethernet-Header (Ziel-MAC) + FCS → Frame
  ↓ Bits auf dem Kabel
\`\`\`
Beim Empfänger wird jede Schicht von unten nach oben wieder abgestreift (Decapsulation).

> **⚠️ Achtung-Falle:** OSI-Schicht 4 = Transport, TCP/IP-Schicht 4 = Application — diese Verwechslung kostet Punkte. Immer prüfen, welches Modell gefragt ist!
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

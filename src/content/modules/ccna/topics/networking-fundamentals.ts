// ============================================================
// CCNA Topic: Netzwerkgrundlagen (Networking Fundamentals)
// Based on: Networking Handout (Ralf Pohlmann, CCNA 200-301)
// ============================================================

import {
  CONCEPT_ENCAPSULATION,
  CONCEPT_NETWORK_TOPOLOGIES,
  CONCEPT_OSI_MODEL,
} from "@/content/_shared/networking/osi-model";
import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_NETWORK_COMPONENTS: Concept = {
  id: "network-components",
  title: "Netzwerkkomponenten & Medien",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "hardware", "cables", "media", "infrastructure"],
  content: `
## Netzwerkkomponenten

### Endgeräte (End Devices)
- Workstations, Server, Drucker, IP-Telefone, Smartphones
- Initiieren und beenden die Kommunikation

### Netzwerkgeräte (Network Devices)
| Gerät | Schicht | Funktion |
|-------|---------|---------|
| Hub | 1 | Broadcastet eingehende Signale auf alle Ports |
| Switch | 2 | Leitet Frames anhand der MAC-Tabelle weiter |
| Router | 3 | Leitet Pakete anhand der Routing-Tabelle weiter |
| Firewall | 3-7 | Filtert Datenverkehr nach Regeln |
| Access Point | 1-2 | Verbindet WLAN mit dem kabelgebundenen Netz |

### Übertragungsmedien
| Medium | Typ | Max. Distanz | Geschwindigkeit |
|--------|-----|-------------|----------------|
| CAT5e | Kupfer (UTP) | 100 m | 1 Gbit/s |
| CAT6 | Kupfer (UTP) | 100 m | 10 Gbit/s (55 m) |
| Single-Mode Fiber | Glasfaser | > 10 km | 10+ Gbit/s |
| Multi-Mode Fiber | Glasfaser | 550 m (OM3) | 10 Gbit/s |
| 802.11ax (Wi-Fi 6) | Wireless | ~30 m indoor | bis 9.6 Gbit/s |

### Kabeltypen
- **Straight-Through**: Gleiche Pins → verbindet ungleiche Geräte (PC ↔ Switch)
- **Crossover**: Pins 1/2 ↔ 3/6 → verbindet gleiche Geräte (Switch ↔ Switch)
- **Heute**: Auto-MDIX erkennt automatisch den Kabeltyp

### Duplex & Speed
- **Half-Duplex**: Senden oder Empfangen (nicht gleichzeitig), Kollisionen möglich
- **Full-Duplex**: Gleichzeitiges Senden und Empfangen, keine Kollisionen
- **Auto-Negotiation**: Switch und Endgerät handeln Geschwindigkeit/Duplex aus
  `.trim(),
};

export const CONCEPT_TCP_IP_SUITE: Concept = {
  id: "tcp-ip-suite",
  title: "TCP/IP Protokoll-Suite",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "tcp-ip", "protocols", "layer-3", "layer-4"],
  content: `
## TCP/IP Protokoll-Suite

### Die wichtigsten Protokolle nach Schicht

| Schicht | Protokoll | Zweck |
|---------|-----------|-------|
| Application | HTTP/HTTPS | Web-Kommunikation (80/443) |
| Application | FTP | Dateiübertragung (20/21) |
| Application | SSH | Sicherer Remote-Zugriff (22) |
| Application | Telnet | Remote-Zugriff (unverschlüsselt, 23) |
| Application | SMTP | E-Mail senden (25) |
| Application | DNS | Name → IP-Auflösung (53) |
| Application | DHCP | IP-Adressvergabe (67/68) |
| Application | SNMP | Netzwerk-Management (161/162) |
| Transport | TCP | Zuverlässige Verbindung (verbindungsorientiert) |
| Transport | UDP | Schnelle Übertragung (verbindungslos) |
| Internet | IP | Routing und Adressierung |
| Internet | ICMP | Fehlermeldungen (ping, traceroute) |
| Internet | ARP | IP → MAC Auflösung |

### TCP vs. UDP
| Merkmal | TCP | UDP |
|---------|-----|-----|
| Verbindung | Verbindungsorientiert (3-Way Handshake) | Verbindungslos |
| Zuverlässigkeit | Ja (ACK, Retransmission) | Nein |
| Reihenfolge | Ja (Sequenznummern) | Nein |
| Flusskontrolle | Ja (Window Size) | Nein |
| Overhead | Höher | Geringer |
| Anwendungsfall | HTTP, FTP, SMTP | DNS, DHCP, VoIP, Streaming |

### TCP 3-Way Handshake
\`\`\`
Client → Server: SYN (seq=x)
Server → Client: SYN-ACK (seq=y, ack=x+1)
Client → Server: ACK (ack=y+1)
\`\`\`

### Bekannte Port-Nummern
- 0-1023: Well-Known Ports
- 1024-49151: Registered Ports
- 49152-65535: Dynamic/Private Ports
  `.trim(),
};

export const CONCEPT_NETWORKING_FUNDAMENTALS_GUIDE: Concept = {
  id: "networking-fundamentals-guide",
  title: "Lernguide: Netzwerkgrundlagen",
  appliesTo: ["ccna"],
  tags: ["networking", "fundamentals", "osi", "tcp-ip", "guide"],
  content: `
## Lernziele
- Das OSI-Modell mit allen 7 Schichten benennen und deren Funktion erklären
- TCP und UDP anhand von Merkmalen (Verbindungsaufbau, Zuverlässigkeit) unterscheiden
- Netzwerkkomponenten (Hub, Switch, Router) den korrekten OSI-Schichten zuordnen
- Gängige Protokolle (HTTP, DNS, DHCP, ICMP) der richtigen Schicht zuordnen
- Encapsulation und De-Encapsulation an einem konkreten Beispiel durchspielen

## Praxis-Szenario
Die Firma "Müller & Partner GmbH" (Steuerberatung, 25 Mitarbeiter) betreibt bisher einen einzigen unmanaged Hub in ihrem Büro. Alle PCs hängen an einem einzigen Kollisionsbereich — bei gleichzeitigem Drucken und Surfen bricht die Performance ein. Der IT-Dienstleister empfiehlt den Einsatz eines managed Switches (Cisco Catalyst 2960X) sowie eines Routers (Cisco ISR 4331) mit Anschluss an einen 100-Mbit/s-Glasfaseranschluss (IP 203.0.113.1). Das neue Netz erhält das Subnetz 192.168.10.0/24. Aufgabe: Die Teilnehmenden sollen erklären, auf welcher OSI-Schicht Hub, Switch und Router jeweils arbeiten und warum der Wechsel vom Hub zum Switch die Kollisionsdomänen beseitigt.

## Canvas-Übung
**Aufgabe:** Erstelle auf dem Canvas eine 3-Tier-Hierarchietopologie bestehend aus: einem Core-Switch (Layer 3, z. B. Catalyst 3850), zwei Distribution-Switches (Layer 2/3) und vier Access-Switches (Layer 2) mit je 2 angeschlossenen PCs. Verbinde alle Ebenen mit Uplinks und beschrifte jede Verbindung mit dem verwendeten Kabeltyp (UTP CAT6 oder Glasfaser).
**Ziel:** Zeigen, dass du die 3-Tier-Hierarchie (Core / Distribution / Access) korrekt aufbauen und den Geräten die richtige OSI-Schicht zuordnen kannst.
**Tipps:** Beginne mit dem Core-Switch in der Mitte des Canvas und arbeite dich nach unten zu den Access-Switches vor. Nutze farbige Linien für unterschiedliche Kabeltypen.

## Verständnisfragen
1. Auf welcher OSI-Schicht arbeitet ein Switch — und warum leitet er Frames anhand der MAC-Adresse weiter?
2. Was ist der Unterschied zwischen dem TCP/IP-Modell mit 4 Schichten und dem OSI-Modell mit 7 Schichten — wie ordnen sich die Schichten einander zu?
3. Warum ist der 3-Way Handshake bei TCP notwendig, und welche drei Pakete werden ausgetauscht?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **OSI- vs. TCP/IP-Schichtnummern verwechseln:** Im OSI-Modell ist die Transportschicht Schicht 4, im TCP/IP-Modell ebenfalls Schicht 4 — aber die Anwendungsschicht ist OSI-Schicht 7 vs. TCP/IP-Schicht 4 (Anwendung). In Prüfungsfragen immer prüfen, welches Modell gemeint ist.
- ⚠️ **Hub und Switch gleichsetzen:** Ein Hub arbeitet auf Layer 1 und broadcastet alle Signale; ein Switch lernt MAC-Adressen und leitet gezielt weiter (Layer 2). Diese Verwechslung kostet Punkte bei Fragen zur Kollisions- und Broadcastdomäne.
- ⚠️ **Implizites "deny all" bei ACLs vergessen:** Obwohl dies eigentlich ein Sicherheitsthema ist, wird das Konzept schon in den Grundlagen erwähnt. Merke: Jede ACL endet unsichtbar mit "deny any" — fehlende Permit-Regeln sperren allen Traffic.
  `.trim(),
};

export const TOPIC_NETWORKING_FUNDAMENTALS: Topic = {
  id: "networking-fundamentals",
  title: "Netzwerkgrundlagen",
  description:
    "OSI-Modell, TCP/IP-Suite, Netzwerkkomponenten und Medien — die Basis für alle weiteren CCNA-Themen.",
  conceptIds: [
    "osi-model",
    "encapsulation",
    "network-topologies",
    "network-components",
    "tcp-ip-suite",
    "networking-fundamentals-guide",
  ],
  quizIds: ["ccna-quiz-netzwerkgrundlagen"],
  exerciseIds: [],
  prerequisiteTopicIds: [],
  estimatedMinutes: 90,
  tags: ["osi", "tcp-ip", "networking", "fundamentals"],
};

export const NETWORKING_FUNDAMENTALS_CONCEPTS: Record<string, Concept> = {
  "osi-model": CONCEPT_OSI_MODEL,
  encapsulation: CONCEPT_ENCAPSULATION,
  "network-topologies": CONCEPT_NETWORK_TOPOLOGIES,
  "network-components": CONCEPT_NETWORK_COMPONENTS,
  "tcp-ip-suite": CONCEPT_TCP_IP_SUITE,
  "networking-fundamentals-guide": CONCEPT_NETWORKING_FUNDAMENTALS_GUIDE,
};

// ============================================================
// CCNA Topic: IPv6
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_IPV6_BASICS: Concept = {
  id: "ipv6-basics",
  title: "IPv6 Grundlagen & Adressierung",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "ipv6", "addressing", "layer-3"],
  relatedConceptIds: ["subnetting"],
  content: `
## IPv6 Grundlagen

### Warum IPv6?
- IPv4 hat ~4,3 Milliarden Adressen → erschöpft
- IPv6: 128-Bit-Adressen → 340 Sextillionen Adressen
- Kein NAT mehr nötig (jedes Gerät bekommt öffentliche Adresse)
- Eingebaute IPsec-Unterstützung, vereinfachter Header

### IPv6-Adressformat
- 128 Bit, in 8 Gruppen zu je 16 Bit (Hexadezimal)
- Beispiel: **2001:0DB8:0000:0000:0000:0000:0000:0001**

### Verkürzte Notation
1. Führende Nullen in einer Gruppe weglassen: \`0DB8\` → \`DB8\`
2. Eine aufeinanderfolgende Folge von Null-Gruppen durch \`::\` ersetzen (nur einmal!)
   - 2001:DB8:0:0:0:0:0:1 → **2001:DB8::1**

### IPv6-Adresstypen
| Typ | Präfix | Beschreibung |
|-----|--------|-------------|
| Unicast Global | 2000::/3 | Öffentlich routbar (wie IPv4-Public) |
| Unicast Link-Local | FE80::/10 | Nur im lokalen Segment, automatisch konfiguriert |
| Unicast Unique Local | FC00::/7 | Privat (wie RFC 1918), nicht global routbar |
| Multicast | FF00::/8 | Eine-zu-Viele |
| Loopback | ::1/128 | Loopback (wie 127.0.0.1) |

### EUI-64 (Interface ID)
Automatische Generierung der Interface-ID aus MAC-Adresse:
1. MAC-Adresse (48 Bit) in zwei 24-Bit-Hälften teilen
2. \`FF:FE\` in die Mitte einfügen (64 Bit)
3. Siebtes Bit des ersten Oktetts invertieren (Universal/Local Bit)

Beispiel: MAC \`AA:BB:CC:DD:EE:FF\` → \`A8BB:CCFF:FEDD:EEFF\`

### IPv6 Konfiguration (Cisco)
\`\`\`
R1(config)# ipv6 unicast-routing
R1(config-if)# ipv6 address 2001:DB8:1::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# no shutdown
\`\`\`

### Neighbor Discovery Protocol (NDP) — ersetzt ARP
| NDP-Nachricht | Entsprechung IPv4 |
|--------------|------------------|
| Router Solicitation (RS) | — |
| Router Advertisement (RA) | — |
| Neighbor Solicitation (NS) | ARP Request |
| Neighbor Advertisement (NA) | ARP Reply |
  `.trim(),
};

export const CONCEPT_IPV6_ROUTING: Concept = {
  id: "ipv6-routing",
  title: "IPv6 Routing & Adresskonfiguration",
  appliesTo: ["ccna"],
  tags: ["networking", "ipv6", "routing", "slaac", "dhcpv6"],
  content: `
## IPv6 Routing & Konfiguration

### Stateless Address Autoconfiguration (SLAAC)
- Host konfiguriert sich automatisch ohne DHCPv6
- Bezieht Präfix aus Router Advertisement (RA)
- Generiert Interface-ID via EUI-64 oder zufällig

### DHCPv6
| Modus | Beschreibung |
|-------|-------------|
| Stateful DHCPv6 | Server vergibt Adresse + DNS (wie DHCPv4) |
| Stateless DHCPv6 | Host nutzt SLAAC für Adresse, DHCPv6 nur für DNS |

### Statische IPv6-Routen
\`\`\`
R1(config)# ipv6 route 2001:DB8:2::/64 2001:DB8:1::2
R1(config)# ipv6 route ::/0 2001:DB8:1::1  ! Default Route
\`\`\`

### show-Befehle (IPv6)
\`\`\`
R1# show ipv6 interface brief
R1# show ipv6 route
R1# show ipv6 neighbors       ! NDP-Cache (wie arp -a)
\`\`\`
  `.trim(),
};

export const CONCEPT_IPV6_GUIDE: Concept = {
  id: "ipv6-guide",
  title: "Lernguide: IPv6",
  appliesTo: ["ccna"],
  tags: ["ipv6", "networking", "addressing", "dual-stack", "guide"],
  content: `
## Lernziele
- IPv6-Adressen in Kurzform darstellen und aus der Kurzform die Vollform rekonstruieren
- Den Unterschied zwischen Global Unicast, Link-Local und Unique Local Adressen erläutern
- Dual-Stack auf einem Cisco-Router konfigurieren (IPv4 + IPv6 auf demselben Interface)
- SLAAC und DHCPv6 vergleichen und den Einsatzzweck beider Methoden erklären
- NDP als IPv6-Ersatz für ARP beschreiben

## Praxis-Szenario
Die "DataCenter Nord GmbH" betreibt in Hamburg einen Webserver mit der IPv4-Adresse 192.168.100.10/24 hinter einem Cisco ISR 4431 (Gateway: 192.168.100.1). Der ISP stellt den IPv6-Präfix 2001:DB8:CAFE:1::/64 zur Verfügung. Im Zuge einer schrittweisen IPv6-Migration soll der Router dual-stack konfiguriert werden: Interface Gi0/0/0 erhält 192.168.100.1/24 sowie 2001:DB8:CAFE:1::1/64. Der Webserver bekommt die statische IPv6-Adresse 2001:DB8:CAFE:1::10/64. Beide Protokollversionen müssen gleichzeitig erreichbar sein.

## Canvas-Übung
**Aufgabe:** Erstelle eine Dual-Stack-Topologie mit einem Router (Gi0/0/0: LAN-Seite, Gi0/0/1: Verbindung zum ISP-Router), einem Switch und zwei PCs. Beschrifte alle Interfaces mit IPv4-Adresse UND IPv6-Adresse. Zeige auf dem Canvas auch die Link-Local-Adresse (FE80::1) des Router-Interfaces.
**Ziel:** Verdeutlichen, dass ein Interface gleichzeitig eine IPv4-, eine IPv6-Global-Unicast- und eine IPv6-Link-Local-Adresse tragen kann.
**Tipps:** Konfiguriere zuerst \`ipv6 unicast-routing\` — ohne diesen Befehl leitet der Router keine IPv6-Pakete weiter. Überprüfe mit \`show ipv6 interface brief\`.

## Verständnisfragen
1. Welche IPv6-Adresse beginnt immer mit FE80::/10 — und in welchem Bereich ist sie gültig?
2. Was ist der Unterschied zwischen SLAAC und Stateful DHCPv6?
3. Welcher NDP-Nachrichtentyp entspricht einem ARP-Request — und an welche Multicast-Adresse wird er gesendet?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **\`ipv6 unicast-routing\` vergessen:** Ohne diesen globalen Befehl verhält sich der Router wie ein Host — er leitet keine IPv6-Pakete weiter. Dies ist der häufigste Fehler bei IPv6-Labs.
- ⚠️ **Link-Local-Adressen als routbar ansehen:** FE80::/10-Adressen sind nur im lokalen Segment gültig und werden von Routern nicht weitergeleitet. Sie dienen als Next-Hop in IPv6-Routen, sind aber kein Ersatz für globale Adressen.
- ⚠️ **Die ::-Kurzform mehr als einmal verwenden:** In einer IPv6-Adresse darf \`::\` nur einmal vorkommen. \`2001::DB8::1\` ist ungültig — dies führt zu Konfigurationsfehlern, die schwer zu debuggen sind.
  `.trim(),
};

export const TOPIC_IPV6: Topic = {
  id: "ipv6",
  title: "IPv6",
  description:
    "IPv6-Adressierung, NDP, SLAAC, DHCPv6 und Routing — der Nachfolger von IPv4.",
  conceptIds: ["ipv6-basics", "ipv6-routing", "ipv6-guide"],
  quizIds: ["ccna-quiz-ipv6"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing"],
  estimatedMinutes: 90,
  tags: ["ipv6", "networking", "addressing"],
};

export const IPV6_CONCEPTS: Record<string, Concept> = {
  "ipv6-basics": CONCEPT_IPV6_BASICS,
  "ipv6-routing": CONCEPT_IPV6_ROUTING,
  "ipv6-guide": CONCEPT_IPV6_GUIDE,
};

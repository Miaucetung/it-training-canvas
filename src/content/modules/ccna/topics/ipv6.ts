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

export const CONCEPT_IPV6_ADDRESS_TYPES: Concept = {
  id: "ipv6-address-types",
  title: "IPv6 Adresstypen — GUA, ULA, Link-Local, Multicast",
  appliesTo: ["ccna"],
  tags: ["ipv6", "addressing", "unicast", "multicast", "link-local"],
  content: `
## IPv6 Adresstypen im Überblick

| Typ | Präfix | Beschreibung | IPv4-Äquivalent |
|-----|--------|-------------|----------------|
| **Global Unicast (GUA)** | 2000::/3 | Öffentlich routbar, weltweit eindeutig | Öffentliche IPv4-Adresse |
| **Unique Local (ULA)** | FC00::/7 | Privat, nicht global routbar | RFC 1918 (10.x, 172.16.x, 192.168.x) |
| **Link-Local** | FE80::/10 | Nur im lokalen Segment gültig, nicht routbar | APIPA (169.254.x.x) |
| **Multicast** | FF00::/8 | Eine-zu-viele-Kommunikation | 224.0.0.0/4 |
| **Loopback** | ::1/128 | Loopback-Interface | 127.0.0.1 |
| **Unspecified** | ::/128 | Noch keine Adresse (z. B. DAD) | 0.0.0.0 |
| **Anycast** | (kein eigener Präfix) | Normale Unicast-Adresse auf mehreren Interfaces — Routing wählt den nächsten | Kein IPv4-Äquivalent |

---

## Anycast — One-to-Nearest

Anycast ist **kein eigener Adresstyp mit reserviertem Präfix**, sondern eine normale
Global-Unicast-Adresse, die **mehreren Geräten gleichzeitig zugewiesen** wird.
Das Routing-Protokoll leitet Pakete automatisch zum **topologisch nächsten** Empfänger.

### Funktionsprinzip
\`\`\`
Client ──→ [Anycast 2001:DB8::1/128]
             ├── Server A (Frankfurt)   ← am nächsten → bekommt Paket
             ├── Server B (Paris)
             └── Server C (Amsterdam)
\`\`\`

### Subnet-Router Anycast (reservierter Standardfall)
Bei jedem IPv6-Präfix ist die Adresse mit **Interface-ID = 0** als
**Subnet-Router Anycast** reserviert:
- Präfix: \`2001:DB8:CAFE:1::/64\` → Subnet-Router Anycast: \`2001:DB8:CAFE:1::\` (Interface-ID alle Nullen)
- Bedeutung: Pakete an diese Adresse werden zum nächsten Router im Subnetz gesendet
- Konfiguration: \`ipv6 address 2001:DB8:1::/64 anycast\`

### Anycast vs. Multicast — Abgrenzung

| Merkmal | Anycast | Multicast |
|---------|---------|----------|
| **Empfänger** | Einer (der nächste) | Alle Mitglieder der Multicast-Gruppe |
| **Adress-Präfix** | Normaler Unicast-Bereich | FF00::/8 |
| **Routing** | Unicast-Routing (IGP) wählt nächsten | Multicast-Routing (PIM) |
| **Anwendung** | DNS-Root-Server, Anycast-CDN | OSPFv3, Video-Streaming |

> **Prüfungshinweis**: Anycast-Adressen sind syntaktisch identisch mit GUA — der Unterschied
> liegt ausschließlich in der Konfiguration (gleiche Adresse auf mehreren Interfaces).

---

## Wichtige Multicast-Gruppen

| Multicast-Adresse | Bedeutung |
|------------------|-----------|
| **FF02::1** | All Nodes (alle IPv6-Hosts im Segment) |
| **FF02::2** | All Routers (alle IPv6-Router im Segment) |
| **FF02::5** | All OSPF Routers (OSPFv3) |
| **FF02::6** | OSPF Designated Routers |
| **FF02::1:2** | All DHCP Relay Agents/Server |

---

## Global Unicast Address (GUA) — Aufbau

\`\`\`
| Global Routing Prefix (48 Bit) | Subnet ID (16 Bit) | Interface ID (64 Bit) |
|--------------------------------|--------------------|-----------------------|
| Vom ISP zugewiesen             | Vom Admin          | EUI-64 oder zufällig  |
\`\`\`

Beispiel: **2001:0DB8:CAFE : 0001 : 0000:0000:0000:0001**
- Global Routing Prefix: 2001:0DB8:CAFE
- Subnet ID: 0001
- Interface ID: 0000:0000:0000:0001

---

## Link-Local — automatische Konfiguration

Jedes IPv6-Interface konfiguriert sich **automatisch** eine Link-Local-Adresse,
auch ohne manuelle Konfiguration oder SLAAC/DHCPv6.

- Präfix: **FE80::/10**
- Interface-ID: EUI-64 aus MAC-Adresse oder zufällig
- Nur im lokalen L2-Segment gültig
- Wird von NDP, OSPFv3, EIGRP für IPv6 als Quelladresse genutzt

> **Cisco IOS:** \`ipv6 address fe80::1 link-local\` setzt eine statische Link-Local-Adresse.
`,
};

export const CONCEPT_IPV6_NDP_SLAAC: Concept = {
  id: "ipv6-ndp-slaac",
  title: "NDP & SLAAC — Neighbor Discovery und automatische Adresskonfiguration",
  appliesTo: ["ccna"],
  tags: ["ipv6", "ndp", "slaac", "dhcpv6", "neighbor-discovery"],
  content: `
## NDP — Neighbor Discovery Protocol (RFC 4861)

NDP ist das IPv6-Äquivalent zu ARP und mehr. Es verwendet ICMPv6-Nachrichten
und arbeitet über Multicast statt Broadcast.

### NDP-Nachrichten

| Nachricht | Abkürzung | ICMPv6-Type | Funktion | IPv4-Äquivalent |
|-----------|-----------|-------------|---------|----------------|
| **Router Solicitation** | RS | 133 | Host fragt nach Routern | — |
| **Router Advertisement** | RA | 134 | Router teilt Präfix/Gateway mit | — |
| **Neighbor Solicitation** | NS | 135 | Suche MAC-Adresse zu IPv6-Adresse | ARP Request |
| **Neighbor Advertisement** | NA | 136 | Antwort mit eigener MAC-Adresse | ARP Reply |
| **Redirect** | — | 137 | Besseren Next-Hop mitteilen | ICMP Redirect |

- Ethertype der Ethernet-Frames: **0x86DD** (IPv6)
- NS/NA werden an die **Solicited-Node-Multicast-Adresse** (\`FF02::1:FFxx:xxxx\`) gesendet — das
  Ethernet-Ziel dazu ist eine **Multicast-MAC mit Präfix \`33:33\`**, gefolgt von den letzten 32 Bit
  der IPv6-Zieladresse (z. B. \`33:33:FF:00:00:02\`)

### Neighbor-Cache-Zustände (analog zur ARP-Tabelle)
| Zustand | Bedeutung |
|---------|-----------|
| **INCOMPLETE** | NS wurde gesendet, noch keine NA erhalten |
| **REACHABLE** | Nachbar wurde kürzlich bestätigt erreichbar (NA erhalten) |
| **STALE** | Erreichbarkeit nicht mehr garantiert (Timer abgelaufen), Eintrag wird aber noch genutzt |
| **DELAY** | Traffic wurde gesendet, es wird kurz gewartet, ob eine Bestätigung (z.B. TCP-ACK) eintrifft |
| **PROBE** | Aktive NS-Bestätigung wird angefordert (NUD — Neighbor Unreachability Detection) |

:::merke
Führt ein Host eine erneute Bestätigung durch NUD durch und bekommt eine NA → zurück zu
**REACHABLE**. Bleibt die Antwort aus → Eintrag wird nach PROBE-Versuchen gelöscht.
:::

### NDP-Ablauf (Adressauflösung)

\`\`\`
Host A möchte MAC von Host B (2001:DB8::2) ermitteln:

Host A → [NS an FF02::1:FF00:0002 (Solicited-Node Multicast)]
          "Wer hat 2001:DB8::2?"

Host B → [NA an Host A (Unicast)]
          "Ich! Meine MAC: AA:BB:CC:DD:EE:FF"
\`\`\`

---

## SLAAC — Stateless Address Autoconfiguration (RFC 4862)

SLAAC ermöglicht Hosts, sich ohne DHCPv6-Server eine vollständige IPv6-Adresse
zu konfigurieren.

### SLAAC-Prozess

\`\`\`
1. Host sendet RS (Router Solicitation) an FF02::2
2. Router antwortet mit RA (Router Advertisement):
   - IPv6-Präfix (z. B. 2001:DB8:1::/64)
   - Default Gateway = Router's Link-Local-Adresse
   - Flags: A-Flag (SLAAC), M-Flag (DHCPv6 Stateful), O-Flag (DHCPv6 Stateless)
3. Host erstellt Interface-ID via EUI-64 oder Zufallswert
4. DAD (Duplicate Address Detection) prüft, ob Adresse bereits vergeben
5. Host konfiguriert Adresse: Präfix + Interface-ID
\`\`\`

### SLAAC-Flags im Router Advertisement

| Flag | Bedeutung |
|------|-----------|
| **A-Flag = 1** | Nutze SLAAC für die Adresse |
| **M-Flag = 1** | Nutze Stateful DHCPv6 für Adresse |
| **O-Flag = 1** | Nutze Stateless DHCPv6 für andere Parameter (DNS) |

---

## DHCPv6 — Stateful vs. Stateless

| Merkmal | Stateful DHCPv6 | Stateless DHCPv6 |
|---------|----------------|-----------------|
| Adressvergabe | Server vergibt IPv6-Adresse | Host nutzt SLAAC (eigene Adresse) |
| DNS-Server | Ja, vom DHCPv6-Server | Ja, vom DHCPv6-Server |
| Adress-Tracking | Ja (Server führt Lease-Tabelle) | Nein |
| Router-Flag | M-Flag = 1 | O-Flag = 1, A-Flag = 1 |
| Cisco IOS-Befehl | \`ipv6 dhcp server POOL\` | \`ipv6 nd other-config-flag\` |

---

## DAD — Duplicate Address Detection

Bevor ein Host eine IPv6-Adresse nutzt, prüft er via **DAD**, ob sie bereits vergeben ist:

1. Host sendet NS (Neighbor Solicitation) für die eigene Adresse an Solicited-Node Multicast
2. Bleibt die NA-Antwort aus → Adresse ist eindeutig und wird genutzt
3. Kommt eine NA-Antwort → Adresskonflikt! Host bricht Konfiguration ab
`,
};

export const TOPIC_IPV6: Topic = {
  id: "ipv6",
  title: "IPv6",
  description:
    "IPv6-Adressierung, NDP, SLAAC, DHCPv6 und Routing — der Nachfolger von IPv4.",
  conceptIds: ["ipv6-basics", "ipv6-routing", "ipv6-guide", "ipv6-calculator", "ipv6-address-types", "ipv6-ndp-slaac"],
  quizIds: ["ccna-quiz-ipv6"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing"],
  estimatedMinutes: 90,
  tags: ["ipv6", "networking", "addressing"],
  lessonSummary: {
    mustKnow: [
      "IPv6-Adresstypen: Global Unicast (2000::/3), Unique Local (FC00::/7), Link-Local (FE80::/10) und Multicast (FF00::/8)",
      "NDP ersetzt ARP: Neighbor Solicitation (NS, Typ 135) und Neighbor Advertisement (NA, Typ 136) lösen IPv6 in MAC auf",
      "SLAAC — Host konfiguriert sich selbst aus Router Advertisement (RA); nutzt Präfix aus RA und EUI-64 oder zufällige Interface-ID; bestätigt via DAD",
      "Stateful DHCPv6 (M-Flag=1) weist Adressen zu; Stateless DHCPv6 (O-Flag=1) liefert nur DNS, während SLAAC die Adresse übernimmt",
      "'ipv6 unicast-routing' muss auf Cisco-Routern aktiviert sein, bevor IPv6-Pakete weitergeleitet werden",
    ],
    bestPractice: [
      {
        topic: "IPv6-Adresszuweisung",
        practice:
          "Eine statische Link-Local-Adresse auf Router-Interfaces konfigurieren ('ipv6 address fe80::1 link-local') — verbessert die Lesbarkeit in 'show ipv6 neighbors' und OSPFv3-Nachbartabellen.",
        note: "[Cisco only]",
      },
      {
        topic: "ICMPv6-Firewall-Regeln",
        practice:
          "ICMPv6-Typen 1–4 und 133–137 niemals in ACLs oder Firewalls blockieren — das bricht NDP und Path MTU Discovery stillschweigend gemäß RFC 4890.",
      },
      {
        topic: "SLAAC-Datenschutz",
        practice:
          "In Unternehmensumgebungen DHCPv6 Stateful für Server verwenden, damit die IP-zu-Asset-Zuordnung erhalten bleibt; SLAAC mit zufälligen IDs ist für Client-Datenschutz vorzuziehen.",
      },
      {
        topic: "Dual-Stack-Migration",
        practice:
          "IPv6 auf allen Interfaces aktivieren, die bereits IPv4 haben ('ipv6 address <gua>/64'), und eine statische IPv6-Default-Route hinzufügen — ermöglicht eine saubere Dual-Stack-Migration ohne IPv4 zu entfernen.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "6to4 / Teredo-Tunneling",
        reason:
          "IPv4-zu-IPv6-Übergangsmechanismen (RFC 3056, RFC 4380); weitgehend veraltet zugunsten von nativem Dual-Stack oder MAP-E; tauchen noch in CCNA-Prüfungszielen auf",
        replacedBy: "Natives Dual-Stack-Deployment",
      },
      {
        topic: "EUI-64 Interface-ID",
        reason:
          "Leitet die Interface-ID aus der MAC-Adresse ab und legt Hardware-Identität offen; die meisten modernen Betriebssysteme nutzen standardmäßig randomisierte IDs (RFC 7217) für Datenschutz",
        replacedBy: "Randomisierte stabile Adressen (RFC 7217)",
      },
    ],
    fastFacts: [
      "Jedes IPv6-fähige Interface bekommt automatisch eine Link-Local-Adresse (FE80::/10) — auch ohne manuelle Konfiguration. Verify: show ipv6 interface brief",
      "Die IPv6-Loopback-Adresse ist ::1/128 (entspricht 127.0.0.1). Verify: ping ::1",
      "OSPFv3 nutzt Multicast FF02::5 (alle OSPF-Router) und FF02::6 (DR/BDR). Verify: show ipv6 ospf neighbor",
    ],
  },
};

const CONCEPT_IPV6_CALCULATOR: Concept = {
  id: "ipv6-calculator",
  title: "IPv6-Adressrechner",
  appliesTo: ["ccna"],
  tags: ["ipv6", "calculator", "interactive", "addressing"],
  content: `## IPv6-Adressrechner

Der IPv6-Adressrechner hilft beim Zerlegen und Umrechnen von IPv6-Adressen:

- Vollständige ↔ Kurzform (:: Notation)
- Präfix / Interface-ID trennen
- Adresstyp bestimmen (GUA / ULA / LLA / Multicast)
- Solicited-Node Multicast-Adresse berechnen

**Öffne den Rechner** über den Button im Topic-Bereich.`.trim(),
};

export const IPV6_CONCEPTS: Record<string, Concept> = {
  "ipv6-basics": CONCEPT_IPV6_BASICS,
  "ipv6-routing": CONCEPT_IPV6_ROUTING,
  "ipv6-guide": CONCEPT_IPV6_GUIDE,
  "ipv6-calculator": CONCEPT_IPV6_CALCULATOR,
  "ipv6-address-types": CONCEPT_IPV6_ADDRESS_TYPES,
  "ipv6-ndp-slaac": CONCEPT_IPV6_NDP_SLAAC,
};

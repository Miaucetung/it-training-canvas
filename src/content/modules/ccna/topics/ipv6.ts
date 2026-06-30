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

:::kernidee
IPv6 ist nicht „IPv4 mit mehr Ziffern", sondern ein **anderes Adressmodell**: Adressen sind so reichlich, dass jedes Gerät **mehrere** öffentliche Adressen gleichzeitig trägt und sich per **SLAAC selbst** konfiguriert — **NAT entfällt**. Die scheinbar kryptische Schreibweise ist nur **Kompression** (führende Nullen weg, eine Null-Folge als \`::\`); darunter sind es immer **128 Bit = 8 Gruppen à 16 Bit**.
:::

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

#### Diagramm 1 — Verkürzung Schritt für Schritt
\`\`\`
Vollform:   2001:0DB8:0000:0001:0000:0000:0000:0001

Schritt 1 — führende Nullen entfernen:
            2001:DB8:0:1:0:0:0:1

Schritt 2 — längste Null-Sequenz durch :: ersetzen (nur einmal!):
            2001:DB8:0:1::1

         ┌─ Regel: Bei Gleichstand die ERSTE Sequenz wählen ─┐
         │  2001:0:0:1:0:0:0:1                               │
         │       ^^^^        ^^^ zwei Sequenzen               │
         │  längste = 0:0:0 (3) → :: setzen → 2001:0:0:1::1  │
         └───────────────────────────────────────────────────┘
\`\`\`

:::falle
\`::\` darf in einer Adresse **nur einmal** vorkommen. \`2001::DB8::1\` ist **ungültig** — bei zwei \`::\` lässt sich nicht mehr rekonstruieren, wie viele Null-Gruppen wo fehlen. Bei Gleichstand zweier gleich langer Null-Folgen die **erste** komprimieren.
:::

### IPv6-Adresstypen
| Typ | Präfix | Beschreibung |
|-----|--------|-------------|
| Unicast Global | 2000::/3 | Öffentlich routbar (wie IPv4-Public) |
| Unicast Link-Local | FE80::/10 | Nur im lokalen Segment, automatisch konfiguriert |
| Unicast Unique Local | FC00::/7 | Privat (wie RFC 1918), nicht global routbar |
| Multicast | FF00::/8 | Eine-zu-Viele |
| Loopback | ::1/128 | Loopback (wie 127.0.0.1) |

### EUI-64 (Interface ID)

#### Methoden zur Interface-ID-Bildung
| Methode | Beschreibung | RFC |
|---------|-------------|-----|
| **EUI-64** | Interface-ID aus MAC-Adresse abgeleitet | RFC 4291 |
| **Zufällig (Privacy Ext.)** | Kryptografisch zufällige, temporäre Interface-ID | RFC 4941, RFC 8981 |
| **Stable Opaque** | Stabiler, aber nicht MAC-basierter Bezeichner | RFC 7217 |
| **Manuell** | Vom Admin statisch gesetzt (z. B. \`fe80::1\`) | — |

#### Diagramm 3 — MAC → EUI-64 Transformation
\`\`\`
 Original MAC (EUI-48):
 ┌──────────┬──────────┐
 │  OUI     │ Geräte-ID│
 │ AA:BB:CC │ DD:EE:FF │  ← 48 Bit
 └──────────┴──────────┘

 Schritt 1 — FF:FE in die Mitte einfügen:
 ┌──────────┬───────────┬──────────┐
 │  OUI     │  FF:FE    │ Geräte-ID│
 │ AA:BB:CC │ FF:FE     │ DD:EE:FF │  ← 64 Bit (EUI-64)
 └──────────┴───────────┴──────────┘

 Schritt 2 — U/L-Bit (Bit 7 von Byte 1) invertieren:
   AA = 1010 1010
        ↑ Bit 7 = 0 (universell zugewiesen)
   XOR  0000 0010  (0x02)
      = 1010 1000 = A8

 Ergebnis Interface-ID:
 A8:BB:CC:FF:FE:DD:EE:FF → A8BB:CCFF:FEDD:EEFF

 Vollständige SLAAC-Adresse (Präfix 2001:DB8:1::/64):
 2001:DB8:1::A8BB:CCFF:FEDD:EEFF/64
\`\`\`

> 🔒 **Datenschutz-Hinweis:** EUI-64-Interface-IDs sind MAC-basiert und
> damit **global nachverfolgbar**. Moderne Betriebssysteme nutzen daher
> standardmäßig **Privacy Extensions (RFC 4941/8981)** oder
> **RFC 7217 Stable Opaque IDs**.

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

#### Diagramm 2 — GUA-Struktur mit Bit-Breiten

\`\`\`
 ←──────────────────────── 128 Bit ──────────────────────────────────────────→
 ┌────────────────────────────┬──────────────┬──────────────────────────────┐
 │   Global Routing Prefix    │  Subnet ID   │       Interface ID           │
 │         48 Bit             │   16 Bit     │          64 Bit              │
 ├────────────────────────────┼──────────────┼──────────────────────────────┤
 │ Vom ISP zugewiesen         │ Vom Admin    │ EUI-64 / Zufällig / RFC 7217 │
 │ RIR-Block   → /23          │ Subnetting   │                              │
 │ ISP-Allok   → /32          │ innerhalb    │                              │
 │ Site-Allok  → /48          │ der Site     │                              │
 └────────────────────────────┴──────────────┴──────────────────────────────┘
 Beispiel: 2001:0DB8:CAFE:0001:A8BB:CCFF:FEDD:EEFF/64
           └────────────────┘└────┘└────────────────┘
            GRP (48 Bit)    Sn-ID   Interface-ID (64 Bit)
\`\`\`

---

## Link-Local — automatische Konfiguration

Jedes IPv6-Interface konfiguriert sich **automatisch** eine Link-Local-Adresse,
auch ohne manuelle Konfiguration oder SLAAC/DHCPv6.

- Präfix: **FE80::/10**
- Interface-ID: EUI-64 aus MAC-Adresse oder zufällig
- Nur im lokalen L2-Segment gültig
- Wird von NDP, OSPFv3, EIGRP für IPv6 als Quelladresse genutzt

> **Cisco IOS:** \`ipv6 address fe80::1 link-local\` setzt eine statische Link-Local-Adresse.

---

## Diagramm 6 — Mehrere Adressen gleichzeitig am Interface

Ein IPv6-Interface kann gleichzeitig mehrere Adressen verschiedener Typen tragen:

\`\`\`
 Interface GigabitEthernet0/0/0
 ┌────────────────────────────────────────────────────────────────────┐
 │  Typ               Adresse                      Quelle            │
 │  ────────────────────────────────────────────────────────────────   │
 │  Link-Local        fe80::1/10                   Automatisch (NDP) │
 │  GUA (statisch)    2001:db8:cafe:1::1/64        Admin konfig.     │
 │  GUA (SLAAC)       2001:db8:cafe:1::a8bb:.../64 RA + EUI-64       │
 │  GUA (Privacy)     2001:db8:cafe:1::d4e9:.../64 RFC 8981 temp.    │
 │  IPv4              192.168.1.1/24               Dual-Stack        │
 └────────────────────────────────────────────────────────────────────┘
\`\`\`

> **Merke:** NDP und OSPFv3 nutzen immer die **Link-Local-Adresse** als
> Quelladresse — diese ist auf jedem IPv6-fähigen Interface vorhanden,
> unabhängig davon, ob SLAAC oder DHCPv6 aktiv ist.
`,
};

export const CONCEPT_IPV6_NDP_SLAAC: Concept = {
  id: "ipv6-ndp-slaac",
  title: "NDP & SLAAC — Neighbor Discovery und automatische Adresskonfiguration",
  appliesTo: ["ccna"],
  tags: ["ipv6", "ndp", "slaac", "dhcpv6", "neighbor-discovery"],
  content: `
## NDP — Neighbor Discovery Protocol (RFC 4861)

:::kernidee
IPv6 kennt **keinen Broadcast** mehr — NDP ersetzt ARP durch **ICMPv6 + Multicast** und kann mehr: **NS/NA** finden Nachbar-MACs (wie ARP), **RS/RA** lassen Hosts den Router und das Präfix entdecken. Genau dieses **RA** ist der Motor von **SLAAC**: Der Router ruft „hier ist Präfix X", der Host hängt seine eigene Interface-ID an und hat **ohne DHCP** eine Adresse.
:::

NDP ist das IPv6-Äquivalent zu ARP und mehr. Es verwendet ICMPv6-Nachrichten
und arbeitet über Multicast statt Broadcast.

### NDP-Nachrichten

| Nachricht | Abkürzung | Funktion | IPv4-Äquivalent |
|-----------|-----------|---------|----------------|
| **Router Solicitation** | RS | Host fragt nach Routern | — |
| **Router Advertisement** | RA | Router teilt Präfix/Gateway mit | — |
| **Neighbor Solicitation** | NS | Suche MAC-Adresse zu IPv6-Adresse | ARP Request |
| **Neighbor Advertisement** | NA | Antwort mit eigener MAC-Adresse | ARP Reply |
| **Redirect** | — | Besseren Next-Hop mitteilen | ICMP Redirect |

### NDP-Ablauf (Adressauflösung)

\`\`\`
Host A möchte MAC von Host B (2001:DB8::2) ermitteln:

Host A → [NS an FF02::1:FF00:0002 (Solicited-Node Multicast)]
          "Wer hat 2001:DB8::2?"

Host B → [NA an Host A (Unicast)]
          "Ich! Meine MAC: AA:BB:CC:DD:EE:FF"
\`\`\`

---

## SLAAC — Stateless Address Autoconfiguration (RFC 4862, RFC 4861, RFC 4291)

SLAAC ermöglicht Hosts, sich ohne DHCPv6-Server eine vollständige IPv6-Adresse
zu konfigurieren. Die drei zentralen RFCs:

| RFC | Inhalt |
|-----|--------|
| **RFC 4862** | SLAAC — Adresskonfigurationsablauf auf dem Host |
| **RFC 4861** | NDP — Router Advertisements und Neighbor Discovery |
| **RFC 4291** | IPv6-Adressarchitektur — Adresstypen, Präfixe, Interface-ID |

### SLAAC-Ablauf in 5 Schritten

#### Diagramm 4 — SLAAC Sequenz (Host ↔ Router)

\`\`\`
 Host (noch kein Präfix)               Router (2001:DB8:1::/64)
      │                                      │
 [1]  │ Link-Local bilden                    │
      │ fe80::A8BB:CCFF:FEDD:EEFF/10         │
      │                                      │
 [2]  │ DAD für Link-Local:                  │
      │ NS → ff02::1:FFDD:EEFF               │
      │ [kein Konflikt → Link-Local aktiv]   │
      │                                      │
 [3]  │──── RS ──────────────────────────>│  an ff02::2 (All Routers)
      │     "Gibt es einen Router?"          │
      │                                      │
 [4]  │<──── RA ───────────────────────────│  von fe80::1 (Router LLA)
      │     Präfix: 2001:DB8:1::/64          │
      │     Flags:  A=1, M=0, O=0, L=1       │
      │     Gateway: fe80::1                 │
      │                                      │
 [5]  │ GUA bilden + DAD:                    │
      │ 2001:DB8:1::A8BB:CCFF:FEDD:EEFF/64   │
      │ NS → ff02::1:FFDD:EEFF               │
      │ [kein Konflikt → GUA aktiv ✓]        │
\`\`\`

### SLAAC-Flags im Router Advertisement

#### Diagramm 5 — RA-Flag-Entscheidungstabelle

| M | O | A | L | Ergebnis |
|---|---|---|---|----------|
| 0 | 0 | 1 | 1 | **Reines SLAAC** — Adresse via SLAAC, kein DHCPv6 |
| 0 | 1 | 1 | 1 | **SLAAC + Stateless DHCPv6** — Adresse via SLAAC, DNS vom Server |
| 1 | 1 | 0 | 1 | **Stateful DHCPv6** — Server vergibt Adresse + alle Parameter |
| 1 | 1 | 1 | 1 | **Parallel** — Stateful DHCPv6 UND SLAAC (selten) |

| Flag | Vollname | Bedeutung |
|------|----------|-----------|
| **A-Flag** | Autonomous Address Configuration | 1 = Host darf SLAAC nutzen |
| **M-Flag** | Managed Address Configuration | 1 = Stateful DHCPv6 für Adresse nutzen |
| **O-Flag** | Other Configuration | 1 = Stateless DHCPv6 für weitere Params (DNS) |
| **L-Flag** | On-Link | 1 = Präfix ist direkt im Segment erreichbar |

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

---

## SLAAC-Fallstricke

| Fallstrick | Erklärung |
|-----------|----------|
| ⚠️ **A-Flag = 0** | Kein SLAAC möglich — Host muss DHCPv6 oder manuelle Konfiguration nutzen |
| ⚠️ **M=1 schließt SLAAC nicht aus** | M=1 bedeutet Stateful DHCPv6 *soll* genutzt werden — SLAAC (A=1) kann parallel aktiv sein |
| ⚠️ **Default-Gateway nur via RA** | Gateway kommt ausschließlich aus dem RA (Router's Link-Local). DHCPv6 kennt keinen Gateway-Parameter |
| ⚠️ **Link-Local immer konfiguriert** | FE80::/10 wird automatisch auf jedem IPv6-Interface gebildet — unabhängig von SLAAC oder DHCPv6 |
| ⚠️ **RA-Spoofing** | Angreifer können gefälschte RAs senden. In Produktionsnetzen: **IPv6 RA-Guard** (RFC 6105) einsetzen |
`,
};

export const CONCEPT_IPV6_PRIVACY: Concept = {
  id: "ipv6-privacy",
  title: "Privacy Extensions — RFC 4941, RFC 8981, RFC 7217",
  appliesTo: ["ccna"],
  tags: ["ipv6", "privacy", "security", "slaac"],
  content: `
## 3.1 Das EUI-64-Tracking-Problem

Bei SLAAC mit EUI-64 wird die Interface-ID direkt aus der MAC-Adresse abgeleitet
(XOR + FF:FE-Infix). Das hat einen kritischen Nachteil:

\`\`\`
 MAC:          AA:BB:CC:DD:EE:FF  ← physische Hardware-Adresse
 Interface-ID: A8BB:CCFF:FEDD:EEFF  ← MAC direkt erkennbar

 Konsequenz:
 ┌────────────────────────────────────────────────────────────────┐
 │ Host wechselt WLAN:                                         │
 │ Netz A: 2001:db8:cafe:1::A8BB:CCFF:FEDD:EEFF/64            │
 │ Netz B: 2001:db8:dead:2::A8BB:CCFF:FEDD:EEFF/64            │
 │                         ═════════════════════                 │
 │ Interface-ID identisch → Gerät netzwerkübergreifend         │
 │ verfolgbar (Tracking, Profiling)                            │
 └────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 3.2 RFC 4941 / RFC 8981 — Temporäre Adressen (Privacy Extensions)

| RFC | Jahr | Inhalt |
|-----|------|--------|
| **RFC 4941** | 2007 | Erste Privacy Extensions: zufällige Interface-ID, periodische Rotation |
| **RFC 8981** | 2021 | Ablösung von RFC 4941: präziseres Stable/Temporary-Modell, OS-Anforderungen |

---

## 3.3 Stabile vs. Temporäre Adressen

\`\`\`
 Interface GigabitEthernet0 (Linux/Windows mit RFC 8981)
 ┌────────────────────────────────────────────────────────────────┐
 │  Stabile Adresse   (permanent, für eingehende Verbindungen)  │
 │  2001:db8:1::a8bb:ccff:fedd:eeff/64  ← EUI-64 ODER RFC 7217 │
 │                                                              │
 │  Temporäre Adresse (kurzlebig, für ausgehende Verbindungen)  │
 │  2001:db8:1::d4e9:f123:8a72:1b3c/64  ← kryptografisch zuf.  │
 │  Gültig: ~24h     Bevorzugt: ~4h (Default RFC 8981)          │
 └────────────────────────────────────────────────────────────────┘

 Ablauf temporäre Adresse:
  [Neue temp. ID] → [Bevorzugt ~4h: ausgehende Verbindungen]
                 → [Deprecation: neue temp. ID erstellt, alte bleibt für offene Sessions]
                 → [Expire ~24h: alte Adresse gelöscht]
\`\`\`

| Merkmal | Stabile Adresse | Temporäre Adresse (RFC 8981) |
|---------|-----------------|------------------------------|
| Interface-ID-Quelle | EUI-64 oder RFC 7217 | Kryptografisch zufällig |
| Lebensdauer | Permanent | ~24h (konfigurierbar) |
| Verwendung | Eingehende Verbindungen, Server | Ausgehende Verbindungen (Browser, Apps) |
| Tracking-Risiko | Mittel (RFC 7217) bis hoch (EUI-64) | Sehr gering |
| Standard in | Servern, Routern | Desktop, Smartphones (default ON) |

---

## 3.4 RFC 7217 — Stable Opaque Interface Identifier

RFC 7217 (2014) definiert **stabile, aber nicht MAC-basierte** Interface-IDs.
Ziel: Persistenz ohne MAC-Trackbarkeit.

\`\`\`
 RFC 7217 Interface-ID-Generierung:
 ┌─────────────────────────────────────────────────────────────┐
 │ Input:                                                      │
 │  • Netzwerk-Präfix  (z. B. 2001:db8:1::/64)               │
 │  • Interface-Index  (z. B. eth0 = 2)                       │
 │  • Netzwerk-ID      (z. B. SSID oder Interface-Name)       │
 │  • Geheimschlüssel  (lokal, nie übertragen)               │
 │                                                             │
 │ Output: SHA-256 → stabile Interface-ID (pro Netz eindeutig) │
 │ 2001:db8:cafe:1::f3a2:b19c:7e4d:aa82/64                    │
 │                                                             │
 │ Wechselt das Netz → andere ID (Tracking unmöglich)         │
 │ Bleibt im gleichen Netz → gleiche ID (Stabilität OK)       │
 └─────────────────────────────────────────────────────────────┘
\`\`\`

| Eigenschaft | EUI-64 | RFC 7217 Stable | RFC 8981 Temporär |
|-------------|--------|-----------------|-------------------|
| MAC-basiert | Ja ❌ | Nein ✅ | Nein ✅ |
| Netzwerkübergr. gleich | Ja ❌ | Nein ✅ | Nein ✅ |
| Stabil im gleichen Netz | Ja ✅ | Ja ✅ | Nein ❌ (rotiert) |
| Tracking-Risiko | Hoch | Gering | Sehr gering |
| Empfehlung | Legacy/Server | Server, Infrastruktur | Clients, Browser |

---

## 3.5 Sicherheit & Datenschutz-Block

\`\`\`
┌───────────────── IPv6 Privacy Threat Model ──────────────────┐
│                                                            │
│ Bedrohung 1: Geräte-Tracking via EUI-64-Interface-ID      │
│  → Mitigation: RFC 7217 (stabil) oder RFC 8981 (temporär) │
│                                                            │
│ Bedrohung 2: Adress-Scanning im /64-Subnetz               │
│  → 2^64 mögliche Adressen = Port-Scan praktisch unmöglich │
│  → Schutz durch die /64-Größe bereits inhärent           │
│                                                            │
│ Bedrohung 3: RA-Spoofing (Rogue Router Advertisement)     │
│  → Gefälschter RA mit M=1 oder bösartiger Gateway-Adresse │
│  → Mitigation: IPv6 RA-Guard (RFC 6105)                   │
│                                                            │
│ Bedrohung 4: Adress-Korrelation via DNS/Zertifikate        │
│  → Temporäre Adressen helfen nur auf Transport-Ebene      │
│  → DNS-Reverse-Lookup kann stabile Adresse preisgeben     │
└──────────────────────────────────────────────────────────────┘
\`\`\`

**OS-Standardverhalten (Stand 2024):**

| Betriebssystem | Standard |
|----------------|----------|
| **Linux** | RFC 8981 aktiv (\`net.ipv6.conf.all.use_tempaddr=2\`) |
| **Windows** | RFC 8981 aktiv (seit Vista) |
| **macOS / iOS** | RFC 8981 + RFC 7217 stable aktiv |
| **Android** | RFC 8981 aktiv (seit Android 8) |
| **Cisco IOS** | EUI-64 default; Privacy optional via \`ipv6 address autoconfig\` |

---

## 3.6 Fallstricke

| Fallstrick | Erklärung |
|-----------|----------|
| ⚠️ **Temporäre Adressen = kein Server-Betrieb** | Eingehende Verbindungen brauchen stabile Adressen. Ein Server mit temporärer RFC 8981-Adresse ist nach ~24h unter alter Adresse nicht mehr erreichbar. |
| ⚠️ **RFC 7217 ≠ anonym** | RFC 7217 verhindert netzwerkübergreifendes Tracking, aber im gleichen Netz ist die Adresse stabil und identifizierbar. |
| ⚠️ **RFC 4941 vs. RFC 8981** | RFC 8981 ist der aktuelle Standard (2021). RFC 4941 war unschärfer. In der Prüfung: RFC 8981 nennen. |
| ⚠️ **DAD-Overhead bei Rotation** | Jede neue temporäre Adresse löst DAD aus. In dichten Netzen erhöht das den ICMPv6-Traffic. |
| ⚠️ **Log-Korrelation erschwert** | Mehrere rotierende Adressen pro Host erschweren die Netzwerk-Forensik — NDP-Cache, Firewall und Syslog müssen alle Adressen eines Hosts erfassen. |
  `.trim(),
};

export const CONCEPT_IPV6_HEADER_ANALYSE: Concept = {
  id: "ipv6-header-analyse",
  title: "IPv6 Header-Analyse & Hex-Werkzeuge",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["ipv6", "ipv4", "header", "hex", "packet-analysis", "wireshark", "icmpv6", "prüfung"],
  content: `
## Wie liest man einen Netzwerk-Header?

**Methode:** Gehe Byte für Byte durch und mappe die Bytes auf die Felder des Header-Diagramms.

- 1 Byte = 2 Hex-Ziffern = 8 Bit
- 1 Nibble (halbes Byte) = 1 Hex-Ziffer = 4 Bit

---

## IPv6 Header — Feldübersicht

Der IPv6-Header ist **fest 40 Byte** lang (kein Optionsfeld wie bei IPv4).

| Byte(s) | Feld | Größe | Beschreibung |
|---------|------|-------|-------------|
| 1 (obere 4 Bit) | Version | 4 Bit | Wert 6 → IPv6 |
| 1 (untere 4 Bit) + 2 (obere 4 Bit) | Traffic Class | 8 Bit | QoS/DSCP |
| 2 (untere 4 Bit) + 3–4 | Flow Label | 20 Bit | Flow-Kennung für QoS |
| 5–6 | Payload Length | 16 Bit | Nutzdatenlänge (nach den 40 Byte Header) |
| 7 | Next Header | 8 Bit | Nächstes Protokoll (0x3A = 58 = ICMPv6) |
| 8 | Hop Limit | 8 Bit | Wie TTL bei IPv4 — sinkt um 1 je Hop |
| 9–24 | Source Address | 128 Bit | Quelladresse (16 Byte) |
| 25–40 | Destination Address | 128 Bit | Zieladresse (16 Byte) |

---

## Trace 1 — IPv6-Paket Byte für Byte

\`\`\`
60 00 00 00  00 40 3A 40  FE C0 00 01  00 00 00 00
00 00 AF C1  00 B4 00 01  FE C0 00 01  00 00 00 00
00 00 00 00  BE FE 30 01  ...
\`\`\`

| Byte(s) | Hex | Feld | Bedeutung |
|---------|-----|------|-----------|
| 1 (obere 4 Bit) | 6 | Version | IPv6 |
| 1 (untere 4 Bit) + 2 (obere 4 Bit) | 0 00 | Traffic Class | QoS = 0 (Best Effort) |
| 2 (untere 4 Bit) + 3–4 | 0 00 00 | Flow Label | kein aktiver Flow |
| 5–6 | 00 40 | Payload Length | 64 Byte Nutzdaten |
| 7 | 3A | Next Header | 0x3A = 58 = ICMPv6 |
| 8 | 40 | Hop Limit | 64 (typische TTL) |
| 9–24 | FE C0 00 01 … 00 B4 00 01 | Source Address | fec0:1::afc1:b4:1 |
| 25–40 | FE C0 00 01 … BE FE 30 01 | Destination Address | fec0:1::befe:3001 |

Ab Byte 41 beginnt die Payload — da Next Header = 0x3A, folgt ein ICMPv6-Header.

### Adressverkürzung (Prüfungsrelevant)

**Source:** FE C0 00 01 00 00 00 00 00 00 AF C1 00 B4 00 01
\`\`\`
Ausgeschrieben:       fec0:0001:0000:0000:0000:afc1:00b4:0001
Führende Nullen weg:  fec0:1:0:0:0:afc1:b4:1
Längste Null-Gruppe:  fec0:1::afc1:b4:1
\`\`\`

**Destination:** FE C0 00 01 00 00 00 00 00 00 00 00 BE FE 30 01
\`\`\`
Ausgeschrieben:       fec0:0001:0000:0000:0000:0000:befe:3001
Führende Nullen weg:  fec0:1:0:0:0:0:befe:3001
Längste Null-Gruppe:  fec0:1::befe:3001
\`\`\`

> ℹ️ **fec0::/10** war das „Site-Local"-Präfix — seit RFC 3879 **deprecated**, ersetzt durch ULA (fc00::/7). In Prüfungsaufgaben taucht fec0:: trotzdem noch auf.

---

## Trace 2 — IPv4 zum Vergleich

\`\`\`
45 00 00 54  A1 1B 00 00  41 01 55 52  C0 A8 01 02
C0 A8 01 E9  ...
\`\`\`

| Byte(s) | Hex | Feld | Bedeutung |
|---------|-----|------|-----------|
| 1 (obere 4 Bit) | 4 | Version | IPv4 |
| 1 (untere 4 Bit) | 5 | IHL | Headerlänge 5 × 4 Byte = 20 Byte |
| 2 | 00 | Type of Service | Best Effort |
| 3–4 | 00 54 | Total Length | 84 Byte Gesamtpaket |
| 5–6 | A1 1B | Identification | Fragment-ID |
| 7–8 | 00 00 | Flags + Fragment Offset | nicht fragmentiert |
| 9 | 41 | TTL | 65 |
| 10 | 01 | Protocol | 1 = ICMP |
| 11–12 | 55 52 | Header Checksum | 0x5552 |
| 13–16 | C0 A8 01 02 | Source Address | 192.168.1.2 |
| 17–20 | C0 A8 01 E9 | Destination Address | 192.168.1.233 |

Hex → Dezimal: C0=192, A8=168, 01=1, E9=233 (E=14 → 14×16 + 9 = 233)

### Gegenüberstellung beider Traces

| | Trace 1 | Trace 2 |
|--|---------|---------|
| Version | IPv6 | IPv4 |
| Sender | fec0:1::afc1:b4:1 | 192.168.1.2 |
| Empfänger | fec0:1::befe:3001 | 192.168.1.233 |
| Protokoll | ICMPv6 (0x3A = 58) | ICMP (0x01 = 1) |
| Hop Limit / TTL | 64 | 65 |
| Paketgröße | 40 + 64 = 104 Byte | 84 Byte gesamt |

---

## Header-Byte-Positionen — Eselsbrücke

| | Source-Adresse | Destination-Adresse |
|--|----------------|---------------------|
| **IPv6** | Byte 9–24 (nach 8 Byte Fixheader) | Byte 25–40 |
| **IPv4** | Byte 13–16 | Byte 17–20 |

---

## Hex ↔ Dezimal Spickzettel für Netzwerktechnik

### Die 16er-Reihe (auswendig lernen)

| × 16 | Ergebnis | Hex-Ziffer |
|------|---------|------------|
| 1 | 16 | 1 |
| 2 | 32 | 2 |
| 3 | 48 | 3 |
| 4 | 64 | 4 |
| 5 | 80 | 5 |
| 6 | 96 | 6 |
| 7 | 112 | 7 |
| 8 | 128 | 8 |
| 9 | 144 | 9 |
| 10 | 160 | A |
| 11 | 176 | B |
| 12 | 192 | C |
| 13 | 208 | D |
| 14 | 224 | E |
| 15 | 240 | F |

**Formel:** \`C0\` = C × 16 + 0 = 12 × 16 + 0 = **192**

**Dezimal → Hex:** 200 ÷ 16 = 12 Rest 8 → **C8** · 233 ÷ 16 = 14 Rest 9 → **E9**

### Wichtige Netzwerkwerte in Hex

| Hex | Dez | Kontext |
|-----|-----|---------|
| 01 | 1 | ICMP (IPv4 Protocol-Nummer) |
| 06 | 6 | TCP |
| 11 | 17 | UDP |
| 3A | 58 | ICMPv6 (IPv6 Next Header) |
| 40 | 64 | Typische TTL / Hop Limit (Linux/Cisco) |
| 80 | 128 | TTL Windows-Default / halbe 256 |
| C0 | 192 | „192" in privaten IPv4-Adressen |
| A8 | 168 | „168" in 192.168.x.x |
| 0A | 10 | 10.0.0.0/8 privates Netz (RFC 1918) |
| AC | 172 | 172.16.0.0/12 privates Netz |
| FE | 254 | FE80:: = IPv6 Link-Local Präfix |
| FF | 255 | Maximum / Broadcast |

### IP-Adresskombinationen in Hex erkennen

| Hex | IPv4 / IPv6 | Bedeutung |
|-----|-------------|-----------|
| C0 A8 xx xx | 192.168.x.x | RFC 1918 privat |
| 0A xx xx xx | 10.x.x.x | RFC 1918 privat |
| AC 1x xx xx | 172.16–31.x.x | RFC 1918 privat |
| 7F 00 00 01 | 127.0.0.1 | Loopback |
| FE 80 … | fe80:: | IPv6 Link-Local |
| FC / FD … | fc00::/7 | IPv6 ULA (privat) |
| FF 02 … | ff02:: | IPv6 Multicast (Link-Local Scope) |
| 20 01 … | 2001:: | IPv6 Global Unicast (GUA) |

---

## Prüfungstipps Header-Analyse

1. **Beide Schreibweisen angeben** (vollständig + verkürzt) → sichert alle Teilpunkte
2. **Herleitung sichtbar machen:**
   \`\`\`
   Bytes 9–24:    FE C0 00 01 00 00 00 00 00 00 AF C1 00 B4 00 01
   Vollständig:   fec0:0001:0000:0000:0000:afc1:00b4:0001
   Verkürzt:      fec0:1::afc1:b4:1
   \`\`\`
3. **IPv4 dezimal angeben**, IPv6 hexadezimal verkürzt — sofern nicht anders gefordert
4. **Protocol/Next Header auswendig:** 1=ICMP, 6=TCP, 17=UDP, 58=ICMPv6
  `.trim(),
};

export const TOPIC_IPV6: Topic = {
  id: "ipv6",
  title: "IPv6",
  description:
    "IPv6-Adressierung, NDP, SLAAC, DHCPv6 und Routing — der Nachfolger von IPv4.",
  conceptIds: ["ipv6-basics", "ipv6-routing", "ipv6-guide", "ipv6-calculator", "ipv6-address-types", "ipv6-ndp-slaac", "ipv6-privacy", "ipv6-header-analyse"],
  quizIds: ["ccna-quiz-ipv6"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing"],
  estimatedMinutes: 90,
  tags: ["ipv6", "networking", "addressing"],
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
  "ipv6-privacy": CONCEPT_IPV6_PRIVACY,
  "ipv6-header-analyse": CONCEPT_IPV6_HEADER_ANALYSE,
};

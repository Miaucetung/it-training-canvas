// ============================================================
// CCNA Topic: IPv4 Addressing & Subnetting
// ============================================================

import {
  CONCEPT_IPV4_HEADER,
  CONCEPT_SUBNETTING,
} from "@/content/_shared/networking/subnetting";
import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_ARP: Concept = {
  id: "arp",
  title: "ARP — Address Resolution Protocol",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "arp", "layer-2", "layer-3", "mac", "ip"],
  content: `
## ARP — Address Resolution Protocol

ARP löst eine IPv4-Adresse in eine MAC-Adresse auf (OSI Layer 2/3 Boundary).

### Ablauf
\`\`\`
PC-A (10.0.0.1) möchte PC-B (10.0.0.2) erreichen:
1. PC-A prüft ARP-Cache → kein Eintrag
2. PC-A sendet ARP Request (Broadcast): "Wer hat 10.0.0.2?"
3. PC-B antwortet (Unicast): "Ich habe 10.0.0.2, meine MAC ist AA:BB:CC:DD:EE:FF"
4. PC-A speichert Zuordnung im ARP-Cache
\`\`\`

### ARP-Cache
- Temporäre Tabelle IP ↔ MAC
- Einträge laufen ab (dynamic ARP entries, typisch 240 s)
- Statische Einträge: \`arp -s IP MAC\`
- Cache anzeigen: \`arp -a\` (Windows) / \`arp -n\` (Linux)

### Gratuitous ARP
- Gerät sendet ARP mit eigener IP als Ziel
- Zweck: Cache-Update nach IP/MAC-Änderung, Duplikaterkennung

### ARP-Spoofing (Sicherheit)
- Angreifer sendet gefälschte ARP-Antworten
- Mitigation: Dynamic ARP Inspection (DAI), Static ARP Entries
  `.trim(),
};

export const CONCEPT_ICMP: Concept = {
  id: "icmp",
  title: "ICMP & ICMPv6 — Fehlermeldungen und Diagnose",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "icmp", "icmpv6", "ping", "traceroute", "ndp", "troubleshooting", "firewall"],
  content: `
## ICMP — Internet Control Message Protocol

ICMP ist ein Hilfsprotokoll für Fehlermeldungen und Diagnose auf Layer 3.
Es läuft **direkt auf IP** — keine Port-Nummern, kein TCP/UDP.

### ICMP vs. ICMPv6

| | ICMP (IPv4) | ICMPv6 (IPv6) |
|--|-------------|---------------|
| Protocol/Next Header | 1 (0x01) | 58 (0x3A) |
| RFC | 792 | 4443 |
| Aufgaben | Fehler, Ping, Traceroute | Fehler, Ping, **NDP** (ARP-Ersatz + Router-Discovery) |

### ICMP-Header (Grundaufbau)

| Byte | Feld | Bedeutung |
|------|------|-----------|
| 1 | Type | Art der Nachricht |
| 2 | Code | Unterart (Präzisierung) |
| 3–4 | Checksum | Prüfsumme |
| ab 5 | Rest | Typ-abhängig (Identifier, Sequence Number, …) |

### ICMP-Types (IPv4, RFC 792)

| Type | Code | Bedeutung |
|------|------|-----------|
| 0 | 0 | Echo Reply (Ping-Antwort) |
| 3 | 0 | Destination Network Unreachable |
| 3 | 1 | Destination Host Unreachable |
| 3 | 3 | Destination Port Unreachable |
| 3 | 4 | Fragmentation Needed — DF-Bit gesetzt (Path MTU Discovery) |
| 5 | 0 | Redirect |
| 8 | 0 | Echo Request (Ping) |
| 11 | 0 | Time Exceeded — TTL abgelaufen (→ Traceroute) |
| 12 | 0 | Parameter Problem — Fehler im IP-Header |

### ICMPv6-Types (RFC 4443)

ICMPv6 übernimmt zusätzlich die Aufgaben von ARP und IGMP.

| Type | Bedeutung |
|------|-----------|
| 1 | Destination Unreachable |
| 2 | Packet Too Big (Path MTU Discovery für IPv6) |
| 3 | Time Exceeded (wie ICMP Type 11) |
| 4 | Parameter Problem |
| 128 | Echo Request (Ping IPv6) |
| 129 | Echo Reply |
| 133 | Router Solicitation (RS) — Host fragt nach Router |
| 134 | Router Advertisement (RA) — Router teilt Präfix mit |
| 135 | Neighbor Solicitation (NS) — ARP-Äquivalent Anfrage |
| 136 | Neighbor Advertisement (NA) — ARP-Äquivalent Antwort |
| 137 | Redirect |

> **Merksatz:** Types 1–4 = Fehler · 128/129 = Ping · 133–137 = NDP (Neighbor Discovery)

### ICMP in Diagnose-Tools

| Tool | Verwendetes ICMP | Ablauf |
|------|-----------------|--------|
| **ping** | Echo Request (8/128) + Echo Reply (0/129) | Sendet Request, misst RTT bis Reply |
| **traceroute** | Time Exceeded (11 / Typ 3) — TTL-Trick | TTL=1 → Router 1 antwortet; TTL=2 → Router 2; … |
| **Path MTU Discovery** | Type 3 Code 4 (IPv4) / Type 2 (IPv6) | Router meldet max. erlaubte Paketgröße |
| **DAD (IPv6)** | NS (135) + NA (136) | Host prüft ob neue Adresse schon vergeben ist |

### traceroute im Detail
- Startet mit TTL=1 → Router 1 gibt ICMP Time Exceeded zurück (seine IP ist sichtbar)
- TTL=2 → Router 2 antwortet; so wird der Pfad Hop für Hop aufgedeckt
- Ziel antwortet mit Echo Reply (oder Port Unreachable bei UDP-Probe)

### Firewall & RFC 4890

> ⚠️ **ICMPv6 darf in einer Firewall NICHT pauschal blockiert werden.**

Zwei kritische Gründe:
1. **Neighbor Discovery** (NS/NA Type 135/136) funktioniert sonst nicht — keine Adressauflösung im LAN → IPv6-Kommunikation vollständig unterbrochen
2. **Path MTU Discovery** (Type 2 "Packet Too Big") funktioniert sonst nicht — IPv6-Router dürfen **nicht fragmentieren**, der Sender muss Type 2 erhalten, sonst gehen große Pakete **still verloren**

RFC 4890 gibt konkrete Empfehlungen: Types 1–4, 128–136 müssen passieren dürfen.

### Prüfungsknackpunkte

- ICMP läuft **direkt auf IP** — keine Port-Nummern, kein TCP/UDP
- Protocol-Nummer: ICMP = **1 (0x01)**, ICMPv6 = **58 (0x3A)** — auswendig!
- Traceroute: TTL-Trick → Time Exceeded (Type 11 IPv4 / Type 3 IPv6)
- ICMPv6 Types 133–137 = Neighbor Discovery Protocol (NDP) = ersetzt ARP + Router-Discovery
- ICMPv6 blockieren = NDP kaputt = IPv6 im LAN funktioniert nicht mehr
  `.trim(),
};

export const CONCEPT_IPV4_ADDRESSING_GUIDE: Concept = {
  id: "ipv4-addressing-guide",
  title: "Lernguide: IPv4-Adressierung & Subnetting",
  appliesTo: ["ccna"],
  tags: ["ipv4", "subnetting", "cidr", "addressing", "guide"],
  content: `
## Lernziele
- Eine /24-Netzadresse in mindestens 5 Subnetze aufteilen (VLSM)
- Netzwerkadresse, Broadcast-Adresse und nutzbaren Adressbereich eines Subnetzes berechnen
- CIDR-Notation in Subnetzmaske und Wildcard-Maske umrechnen
- Den ARP-Prozess Schritt für Schritt erläutern
- ping und traceroute zur Fehleranalyse einsetzen

## Praxis-Szenario
Die "TechVision AG" (Softwareentwicklung, Standort München) bezieht ein neues Bürogebäude und erhält vom ISP das Netz 10.50.20.0/24. Der Netzwerkadministrator muss 5 Abteilungen versorgen: Entwicklung (60 Hosts), Marketing (30 Hosts), Vertrieb (20 Hosts), HR (10 Hosts) und Management (5 Hosts). Mit VLSM sollen die Subnetze 10.50.20.0/26 (Entwicklung), 10.50.20.64/27 (Marketing), 10.50.20.96/27 (Vertrieb), 10.50.20.128/28 (HR) und 10.50.20.144/29 (Management) zugewiesen werden. Jedes Subnetz erhält einen Cisco ISR 4321 als Default Gateway.

## Canvas-Übung
**Aufgabe:** Baue eine Topologie mit einem zentralen Router (Cisco ISR 4321) und 5 Switches — einen pro Abteilung. Verbinde jeden Switch mit dem entsprechenden Router-Interface (oder Sub-Interface). Beschrifte jedes Segment mit der korrekten Subnetzadresse, Subnetzmaske und dem Default Gateway.
**Ziel:** Zeigen, dass du VLSM korrekt anwendest und die Subnetzgrenzen auf dem Canvas sichtbar machst.
**Tipps:** Nutze die "Magic Number"-Methode: Subnetzgröße = 256 − Subnetzmasken-Oktett. Überprüfe immer, ob die Anzahl der nutzbaren Hosts (2^n − 2) ausreicht.

## Verständnisfragen
1. Welche zwei Adressen dürfen in einem Subnetz niemals einem Host zugewiesen werden — und warum?
2. Was ist der Unterschied zwischen einer Subnetzmaske (z. B. 255.255.255.0) und einer Wildcard-Maske (0.0.0.255)?
3. Erkläre, was passiert, wenn ein PC eine ARP-Anfrage sendet: Wer empfängt sie, und wer antwortet?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **Die -2 für Netzwerk- und Broadcast-Adresse vergessen:** Ein /28-Subnetz hat 16 Adressen, aber nur 14 nutzbare Hosts. Prüfungsfragen fragen oft nach "nutzbaren" Hosts — immer 2 abziehen.
- ⚠️ **Wildcard-Maske mit invertierter Subnetzmaske verwechseln:** Die Wildcard-Maske für /24 ist 0.0.0.255 (nicht 255.255.255.0). Ein häufiger Fehler bei OSPF-network-Befehlen und ACLs.
- ⚠️ **Subnetzgrenzen falsch berechnen:** Das zweite /27-Subnetz beginnt nicht bei .32 sondern bei .32 — aber bei /26 beginnt das zweite bei .64. Immer die Schrittweite (= Subnetzgröße) addieren, nicht raten.
  `.trim(),
};

export const CONCEPT_SUBNETTING_DRILL: Concept = {
  id: "subnetting-drill",
  title: "Subnetting — Methoden & Referenz",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["subnetting", "drill", "practice", "vlsm", "cidr"],
  content: `
## Subnetting-Methode (Magic Number)

Die schnellste Methode für CCNA-Prüfungen — kein Taschenrechner nötig.

### 5-Schritte-Cookbook
1. **Magic Number** = 256 − interessantes Masken-Oktett
2. **Subnetz-ID** = größtes Vielfaches der Magic Number ≤ Host-Oktett
3. **Broadcast** = nächste Subnetz-ID − 1
4. **Erster Host** = Subnetz-ID + 1
5. **Letzter Host** = Broadcast − 1

**Beispiel** 192.168.10.77 /28:
- Maske: 255.255.255.**240** → Magic = 256 − 240 = **16**
- Subnetz-ID: 4 × 16 = 64, 5 × 16 = 80 → **80** ≤ 77? Nein → **64**
- Broadcast: 64 + 16 − 1 = **79**
- Hosts: 192.168.10.**65** bis 192.168.10.**78**

## Class-B-Subnetting — zwei Methoden zum Üben

Beide Wege führen zum selben Ergebnis und sind **IHK-prüfungsrelevant**:
**Methode A** rechnet dezimal (schnell), **Methode B** zeigt die Bits (verständlich, prüfungssicher).
Übe beide am selben Beispiel und vergleiche.

### Methode A — Pattern Value (ohne Binär)

Wenn die Maske im **3. Oktett** wechselt (z. B. /17–/24), funktioniert die Magic Number genauso —
nur im 3. statt im 4. Oktett. Zwei Begriffe genügen:

- **Interesting Octet** = das Oktett, in dem die Maske **weder 0 noch 255** ist
- **Pattern Value** = 256 − Masken-Wert in diesem Oktett (= Block-Größe in diesem Oktett)

#### Die 3 Regeln je Masken-Oktett (Subnetz-ID)

| Masken-Oktett | Was passiert mit dem IP-Oktett |
|---------------|--------------------------------|
| **255** | Wert **1:1** übernehmen |
| **0** | Wert auf **0** setzen |
| dazwischen | **Pattern Value** bilden → nächstes Vielfaches **unter** dem IP-Wert nehmen |

**Broadcast** = nächstes Vielfaches − 1 im Interesting Octet, restliche Host-Oktette = **255**.

**Beispiel 1** — 172.16.42.5 **/20** → Maske 255.255.**240**.0
- Interesting Octet: 3. (240) → Pattern Value = 256 − 240 = **16**
- Vielfache: 0, 16, 32, 48, … → 42 liegt zwischen 32 und 48 → **32**
- Subnetz-ID: **172.16.32.0/20** · Broadcast: 48 − 1 = 47 → **172.16.47.255**
- Block: 16 × 256 = **4096** Adressen

**Beispiel 2** — 172.16.144.115 **/18** → Maske 255.255.**192**.0
- Pattern Value = 256 − 192 = **64**
- Vielfache: 0, 64, 128, 192 → 144 liegt zwischen 128 und 192 → **128**
- Subnetz-ID: **172.16.128.0/18** · Broadcast: 192 − 1 = 191 → **172.16.191.255**
- Block: 64 × 256 = **16.384** Adressen

### Methode B — Binär (AND-Verknüpfung)

Nur das **Interesting Octet** wird in Binär zerlegt; die anderen Oktette folgen denselben
1:1-/0-Regeln. Subnetzmaske drüberlegen:

- **Netz-Bits** (Maske = 1) → unverändert übernehmen
- **Host-Bits** (Maske = 0) → für die **Subnetz-ID** alle **0**, für den **Broadcast** alle **1**

**Beispiel 1** — 172.16.42.5 /20 (Interesting Octet = 3., Maske 240):

\`\`\`
            Netz | Host
IP   (42)   0010 | 1010
Maske(240)  1111 | 0000
            ---------------
Subnetz-ID  0010 | 0000  = 32   → 172.16.32.0/20
Broadcast   0010 | 1111  = 47   → 172.16.47.255
\`\`\`

**Beispiel 2** — 172.16.144.115 /18 (Interesting Octet = 3., Maske 192):

\`\`\`
            Netz | Host
IP  (144)   10 | 010000
Maske(192)  11 | 000000
            -----------------
Subnetz-ID  10 | 000000  = 128  → 172.16.128.0/18
Broadcast   10 | 111111  = 191  → 172.16.191.255
\`\`\`

> 🎯 **Gegenprobe**: Tool *„IPv4-Subnetting-Referenz"* → Tab *Oktett 0–255 (Binär)* zeigt jedes
> Oktett ↔ 8-Bit-Binär; die Trennlinie Netz/Host liegt dort, wo die Maske von 1 auf 0 wechselt.

### Schnell-Referenz: Häufige CIDR-Präfixe

| CIDR | Maske | Magic | Hosts |
|------|-------|-------|-------|
| /25 | .128 | 128 | 126 |
| /26 | .192 | 64 | 62 |
| /27 | .224 | 32 | 30 |
| /28 | .240 | 16 | 14 |
| /29 | .248 | 8 | 6 |
| /30 | .252 | 4 | 2 |
| /22 | 255.255.252.0 | 4 (3. Okt.) | 1022 |
| /20 | 255.255.240.0 | 16 (3. Okt.) | 4094 |
| /19 | 255.255.224.0 | 32 (3. Okt.) | 8190 |
| /18 | 255.255.192.0 | 64 (3. Okt.) | 16382 |

### IP-Klassen (Schnell-Erkennung am 1. Oktett)

| Klasse | Bereich | 1. Bits | Verwendung |
|--------|---------|---------|------------|
| A | 1–126 | \`0xxxxxxx\` | Große Netze |
| B | 128–191 | \`10xxxxxx\` | Mittlere Netze |
| C | 192–223 | \`110xxxxx\` | Kleine Netze |
| D | 224–239 | \`1110xxxx\` | Multicast |
| E | 240–255 | \`1111xxxx\` | Reserviert |

### VLSM-Regel
**Immer von größtem zu kleinstem Bedarf** vergeben — sonst entstehen Lücken.

### ⚠️ Typische Fehlerquellen
- Magic Number aus dem **falschen Oktett** — immer das Oktett, in dem die Maske wechselt
- Bei /31 kein \`−2\` rechnen — RFC 3021 erlaubt 2 Hosts (Point-to-Point)
- /30 vs. /29 verwechseln (2 Hosts vs. 6 Hosts)

> 🎯 **Übungsaufgaben** → im Quiz **"CCNA: IPv4 Adressierung & Subnetting"**
  `.trim(),
};


export const CONCEPT_SUBNETTING_EQUAL_SPLIT: Concept = {
  id: "subnetting-equal-split",
  title: "Aufgabe: Netz in gleich große Subnetze aufteilen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["subnetting", "cidr", "aufgabe", "uebung", "vlsm", "nid", "broadcast"],
  content: `
## Verdichtung: Adresse, Maske, Subnetz

Eine IPv4-Adresse ist ein **32-Bit-Wert** (2³² ≈ 4,294,967,296 Adressen), notiert als
**4 Oktette** (je 8 Bit), durch Punkte getrennt — z. B. \`11000000.10101000.00000001.00000010\` = **192.168.1.2**.

Die **Subnetzmaske** legt fest, welche Bits zum Netz- und welche zum Host-Anteil gehören:

- Masken-Bit = **1** → korrespondierendes Bit gehört zum **Netzanteil**
- Masken-Bit = **0** → korrespondierendes Bit gehört zum **Hostanteil**

> Eine gültige Maske besteht immer aus **lückenlosen 1 en, gefolgt von lückenlosen 0 en** —
> \`11110111…\` ist **ungültig**.

### Die „Subnetz-Torte" — drei Arten von Adressen

Jedes Subnetz hat einen festen Adressblock. Innerhalb dieses Blocks:

| Adresse | Bedingung (Host-Anteil) | Rolle |
|---------|-------------------------|-------|
| **Netz-ID (NID)** | alle Bits **0** | „Name" des Subnetzes — **erste** Adresse |
| **gültige Hosts** | alles dazwischen | an Knoten vergebbar |
| **Broadcast** | alle Bits **1** | alle Hosts lauschen — **letzte** Adresse |

→ Nutzbare Hosts = Blockgröße − 2 (NID + Broadcast abziehen).
Sonderfall **/31** = 2 Hosts (Point-to-Point, RFC 3021), **/32** = 1 (Host-Route).

## Methode: gleich große Subnetze (Bits borgen)

Anders als bei VLSM (Bedarf je Abteilung) wird hier ein Netz in **X gleich große** Teile zerlegt:

1. **Subnetz-Bits** \`n\` = wie viele Bits borge ich vom Host-Anteil, sodass \`2ⁿ ≥ X\`
2. Neues Präfix = altes Präfix + \`n\` → daraus die Subnetzmaske
3. **Anzahl Subnetze** = \`2ⁿ\`
4. **Adressen je Subnetz (Blockgröße)** = \`2^(Host-Bits)\` = Schrittweite zur nächsten Netz-ID
5. **Subnetz-IDs** = 0, Blockgröße, 2×Blockgröße, … im interessanten Oktett

## Aufgabe

> **Sie sind Admin des Netzes \`192.168.1.0/24\`. Teilen Sie es in X = 4 gleich große Subnetze auf.**
>
> 1. Welche Subnetzmaske müssen die Subnetze verwenden (dezimal **und** CIDR)?
> 2. Wie viele Subnetze entstehen?
> 3. Wie viele IP-Adressen hat jedes Subnetz?
> 4. Wie viele **gültige** IP-Adressen hat jedes Subnetz?
> 5. Notieren Sie die ersten vier Subnetz-IDs.
> 6. Welche Subnetz-ID hat das letzte Subnetz?

### Lösung

4 Subnetze brauchen \`2² = 4\` → **2 Bits borgen** → Präfix \`/24 + 2 = /26\`.
Letztes Oktett der Maske: \`11000000\` = **192**.

1. Subnetzmaske: **255.255.255.192** = **/26**
2. Subnetze: \`2² =\` **4**
3. Adressen je Subnetz: \`2^(32−26) = 2⁶ =\` **64** (Blockgröße → Schrittweite 64)
4. Gültige Hosts: \`64 − 2 =\` **62**
5. Erste vier Subnetz-IDs:

| # | Subnetz-ID | Erster Host | Letzter Host | Broadcast |
|---|-----------|-------------|--------------|-----------|
| 1 | 192.168.1.0/26   | .1   | .62  | .63  |
| 2 | 192.168.1.64/26  | .65  | .126 | .127 |
| 3 | 192.168.1.128/26 | .129 | .190 | .191 |
| 4 | 192.168.1.192/26 | .193 | .254 | .255 |

6. Letztes Subnetz: **192.168.1.192/26**

> 🎯 **Gegenprobe** mit dem Tool **„IPv4-Subnetting-Referenz"** (Tab *Blockgrößen*): /26 → Block 64, 62 Hosts.
  `.trim(),
};

export const TOPIC_IPV4_ADDRESSING: Topic = {
  id: "ipv4-addressing",
  title: "IPv4-Adressierung & Subnetting",
  description:
    "IPv4-Aufbau, CIDR-Notation, Subnetting, VLSM, ARP und ICMP — unverzichtbar für jede Netzwerkkonfiguration.",
  conceptIds: [
    "subnetting",
    "subnetting-drill",
    "subnetting-equal-split",
    "ipv4-header",
    "arp",
    "icmp",
    "ipv4-addressing-guide",
  ],
  quizIds: ["ccna-quiz-ipv4"],
  exerciseIds: ["exercise-subnetting-design"],
  prerequisiteTopicIds: ["networking-fundamentals"],
  estimatedMinutes: 120,
  tags: ["ipv4", "subnetting", "cidr", "arp", "addressing"],
};

export const IPV4_CONCEPTS: Record<string, Concept> = {
  subnetting: CONCEPT_SUBNETTING,
  "subnetting-drill": CONCEPT_SUBNETTING_DRILL,
  "subnetting-equal-split": CONCEPT_SUBNETTING_EQUAL_SPLIT,
  "ipv4-header": CONCEPT_IPV4_HEADER,
  arp: CONCEPT_ARP,
  icmp: CONCEPT_ICMP,
  "ipv4-addressing-guide": CONCEPT_IPV4_ADDRESSING_GUIDE,
};

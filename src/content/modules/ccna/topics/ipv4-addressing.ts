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
  title: "ICMP & Netzwerk-Diagnose",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "icmp", "ping", "traceroute", "troubleshooting"],
  content: `
## ICMP — Internet Control Message Protocol

ICMP (RFC 792) ist ein Hilfsprotokoll für Fehlermeldungen und Diagnose auf Layer 3.

### Wichtige ICMP-Typen
| Typ | Code | Bedeutung |
|-----|------|-----------|
| 0 | 0 | Echo Reply (ping Antwort) |
| 3 | 0 | Destination Network Unreachable |
| 3 | 1 | Destination Host Unreachable |
| 3 | 3 | Destination Port Unreachable |
| 3 | 4 | Fragmentation Needed (PMTUD) |
| 5 | 0 | Redirect |
| 8 | 0 | Echo Request (ping) |
| 11 | 0 | TTL Exceeded (traceroute) |

### ping
- Sendet ICMP Echo Request, wartet auf Echo Reply
- Misst RTT (Round-Trip Time) und Paketverlust
- \`ping 8.8.8.8\` | \`ping -c 4 8.8.8.8\` (Linux)

### traceroute / tracert
- Nutzt TTL-Expiry (ICMP Type 11) um jeden Hop zu identifizieren
- Startet mit TTL=1 → Router gibt ICMP Time Exceeded zurück
- Erhöht TTL bei jedem Schritt bis Ziel erreicht
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
  title: "Subnetting-Drill — Übungsaufgaben (Block 1–6)",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["subnetting", "drill", "practice", "vlsm", "cidr"],
  content: `
## Subnetting-Drill

> **Tipp zum Trainieren:** Decke die Antwort ab, rechne im Kopf, vergleiche dann.

### Block 1 — Netzklasse, Subnetzmaske, Hostanzahl

| # | Aufgabe | Antwort |
|---|---------|--------|
| 1 | Subnetzmaske von /22 in Dotted-Decimal? | \`255.255.252.0\` |
| 2 | /27 — wie viele nutzbare Hosts? | \`30\` (2^5 − 2) |
| 3 | /30 — wie viele nutzbare Hosts? | \`2\` (typisch P2P) |
| 4 | /29 — Subnetzmaske + Hosts? | \`255.255.255.248\`, **6 Hosts** |
| 5 | 255.255.255.192 → CIDR + Hosts? | \`/26\`, **62 Hosts** |

### Block 2 — Subnetz-ID, Broadcast, Hostbereich

| # | Adresse | Subnetz-ID | Broadcast | Erste / Letzte Host |
|---|---------|----------|-----------|--------------------|
| 6 | 10.10.10.45 /27 | 10.10.10.32 | 10.10.10.63 | .33 / .62 |
| 7 | 192.168.1.130 /26 | 192.168.1.128 | 192.168.1.191 | .129 / .190 |
| 8 | 172.16.5.200 /22 | 172.16.4.0 | 172.16.7.255 | 172.16.4.1 / 172.16.7.254 |
| 9 | 10.0.0.18 /29 | 10.0.0.16 | 10.0.0.23 | .17 / .22 |
| 10 | 192.168.50.77 /28 | 192.168.50.64 | 192.168.50.79 | .65 / .78 |

### Block 3 — Subnetzanzahl

| # | Aufgabe | Antwort |
|---|---------|--------|
| 11 | /24 zu /27 — wie viele Subnetze? | \`8\` (2^3) |
| 12 | /16 zu /20 — wie viele Subnetze? | \`16\` (2^4) |
| 13 | /22 zu /28 — wie viele Subnetze? | \`64\` (2^6) |

### Block 4 — VLSM-Aufgabe

**Aufgabe 14 — Acme GmbH**
Du hast \`192.168.10.0/24\` und brauchst:
- LAN-A: 50 Hosts
- LAN-B: 25 Hosts
- LAN-C: 10 Hosts
- WAN-Link 1: 2 Hosts
- WAN-Link 2: 2 Hosts

**Lösung (von größtem zu kleinstem Bedarf):**
| Netz | Bedarf | Größe | Subnetz | Bereich | Maske |
|------|-------|-------|---------|---------|-------|
| LAN-A | 50 | /26 (62 H) | 192.168.10.0/26 | .0–.63 | 255.255.255.192 |
| LAN-B | 25 | /27 (30 H) | 192.168.10.64/27 | .64–.95 | 255.255.255.224 |
| LAN-C | 10 | /28 (14 H) | 192.168.10.96/28 | .96–.111 | 255.255.255.240 |
| WAN-1 | 2 | /30 (2 H) | 192.168.10.112/30 | .112–.115 | 255.255.255.252 |
| WAN-2 | 2 | /30 (2 H) | 192.168.10.116/30 | .116–.119 | 255.255.255.252 |
| Reserve | – | – | 192.168.10.120/29 etc. | .120–.255 | – |

### Block 5 — Schnell-Tricks

| # | Aufgabe | Trick / Antwort |
|---|---------|----------------|
| 15 | Schrittweite (Block-Size) bei /26? | \`64\` (256 − 192) |
| 16 | Schrittweite bei /29? | \`8\` |
| 17 | Schrittweite bei /20? | \`16\` (im 3. Oktett) |
| 18 | /23 — Hosts? | \`510\` (2^9 − 2) |
| 19 | /17 — Hosts? | \`32766\` (2^15 − 2) |
| 20 | Wo liegt 172.20.130.5 im /17 \`172.20.128.0\`? | im Subnetz (172.20.128.1 – 172.20.255.254) |

### Block 6 — Binär-Drill (Klasse erkennen)

> **Aufgabe:** IP-Adresse → Binär (4 × 8 Bit) → Klasse (A/B/C/D/E) bestimmen.
> Methode: Erstes Oktett ansehen, dann Klassen-Schwellen \`1–126 / 128–191 / 192–223 / 224–239 / 240–255\` anwenden.

| #  | IP-Adresse        | Binär (1. Oktett)  | Klasse |
|----|-------------------|--------------------|--------|
| 21 | 101.29.16.200     | \`01100101\`         | **A** |
| 22 | 172.20.0.39       | \`10101100\`         | **B** |
| 23 | 212.14.154.0      | \`11010100\`         | **C** |
| 24 | 25.246.133.37     | \`00011001\`         | **A** |
| 25 | 128.2.229.1       | \`10000000\`         | **B** |
| 26 | 192.168.5.254     | \`11000000\`         | **C** (privat, RFC 1918) |
| 27 | 185.138.123.40    | \`10111001\`         | **B** |
| 28 | 223.255.199.80    | \`11011111\`         | **C** (Grenzfall — letzte C-Adresse) |
| 29 | 203.7.224.240     | \`11001011\`         | **C** |
| 30 | 198.162.13.252    | \`11000110\`         | **C** |
| 31 | 19.249.83.75      | \`00010011\`         | **A** |
| 32 | 95.127.11.239     | \`01011111\`         | **A** |
| 33 | 224.0.0.5         | \`11100000\`         | **D** (Multicast — OSPF "AllSPFRouters") |
| 34 | 134.78.45.227     | \`10000110\`         | **B** |
| 35 | 245.72.189.160    | \`11110101\`         | **E** (reserviert) |
| 36 | 145.23.12.24      | \`10010001\`         | **B** |
| 37 | 42.36.53.234      | \`00101010\`         | **A** |

> **Selbsttest-Tipp:** Die Übung ohne Taschenrechner durchführen — in der CCNA-Prüfung steht keiner zur Verfügung. Aus den ersten zwei bis drei Bits lässt sich die Klasse bereits ablesen (\`0…\` = A, \`10…\` = B, \`110…\` = C, \`1110…\` = D, \`1111…\` = E).

### Methode (Standard-Cookbook)
1. **Bestimme das Magic Number = 256 − Maske-Oktett.**
2. **Subnetz-ID = größter Vielfaches der Magic Number ≤ Host-Oktett.**
3. **Broadcast = nächste Subnetz-ID − 1.**
4. **Erster Host = Subnetz-ID + 1, letzter Host = Broadcast − 1.**
5. **Hostzahl = 2^Hostbits − 2** (Subnetz + Broadcast abziehen; nicht bei /31 P2P RFC 3021).

### Häufige Fehlerquellen
- ⚠️ Magic Number aus dem **falschen Oktett** ableiten (immer das Oktett, in dem die Maske wechselt).
- ⚠️ Bei /31 fälschlich \`-2\` rechnen — RFC 3021 erlaubt 2 Hosts (Point-to-Point).
- ⚠️ /30 vs. /29 verwechseln (2 Hosts vs. 6 Hosts).
- ⚠️ Bei VLSM den Bedarf **nicht von groß nach klein** sortiert → Verschnitt entsteht.
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
  "ipv4-header": CONCEPT_IPV4_HEADER,
  arp: CONCEPT_ARP,
  icmp: CONCEPT_ICMP,
  "ipv4-addressing-guide": CONCEPT_IPV4_ADDRESSING_GUIDE,
};

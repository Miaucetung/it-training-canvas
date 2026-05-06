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

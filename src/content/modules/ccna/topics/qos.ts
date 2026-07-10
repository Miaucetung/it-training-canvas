// ============================================================
// CCNA Topic: Quality of Service (QoS)
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 15
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_QOS_FUNDAMENTALS: Concept = {
  id: "qos-fundamentals",
  title: "QoS — Grundlagen & Verkehrsklassen",
  appliesTo: ["ccna"],
  tags: ["qos", "networking", "voice", "video", "marking"],
  content: `
## Warum QoS?

:::kernidee
QoS schafft **keine** Bandbreite — es entscheidet nur, **wer bei Stau zuerst darf**. Solange die Leitung frei ist, tut QoS nichts. Erst wenn die Queue voll läuft, zahlt sich aus, dass VoIP (verträgt keine Verzögerung) **vor** einem Backup (wartet gern) bedient wird. Kernfrage immer: *Welcher Verkehr leidet unter Verzögerung — und welcher nicht?*
:::

:::analogie
Wie die **Rettungsgasse** auf der Autobahn: Mehr Spuren (Bandbreite) gibt es im Stau nicht, aber der Krankenwagen (VoIP) kommt trotzdem durch, weil alle anderen Platz machen. Der Lieferwagen (Backup) wartet — ihm schadet die Minute nicht.
:::

Bei voller Auslastung müssen Router/Switches entscheiden, **welcher Traffic
bevorzugt** wird. Echtzeit-Verkehr (VoIP, Video) verträgt keine Verzögerung —
Filetransfers schon.

### Vier QoS-Eigenschaften
| Metrik | Bedeutung | VoIP-Toleranz |
|--------|----------|---------------|
| **Bandwidth** | Datenrate | min. 30 kbps pro Call |
| **Delay (Latency)** | One-Way Verzögerung | < 150 ms |
| **Jitter** | Schwankung der Latenz | < 30 ms |
| **Loss** | Paketverlust | < 1 % |

### Verkehrsklassen (typisch)
| Klasse | Beispiel | DSCP |
|--------|----------|------|
| Voice | RTP, SIP-Signaling | EF (46) / CS3 (24) |
| Video Conferencing | Webex, Teams | AF41 (34) |
| Streaming Video | YouTube, Netflix | AF31 (26) |
| Mission-Critical Data | ERP, DB | AF21 (18) |
| Best Effort | Web, Mail | DF/0 (0) |
| Scavenger | Backups, Updates | CS1 (8) |
  `.trim(),
};

export const CONCEPT_QOS_TOOLS: Concept = {
  id: "qos-tools",
  title: "QoS-Werkzeuge: Classify, Mark, Queue, Shape, Police",
  appliesTo: ["ccna"],
  tags: ["qos", "classification", "marking", "queueing", "shaping", "policing"],
  content: `
## QoS-Werkzeugkasten

### 1. Classification & Marking
**Klassifikation** identifiziert Traffic (per ACL, NBAR, Class-Map).
**Marking** schreibt diesen Traffic in jedes Paket — damit nachfolgende Router/Switches
die Klasse erkennen, ohne erneut zu klassifizieren.

| Marking-Feld | Bits | Schicht |
|-------------|------|--------|
| **CoS** (802.1p) | 3 (in 802.1Q-Tag) | Layer 2 |
| **DSCP** (DiffServ) | 6 (im IP-Header ToS) | Layer 3 |
| IP Precedence (legacy) | 3 (in DSCP enthalten) | Layer 3 |

#### DSCP-Klassen
- **Default Forwarding (DF)** = 0 → Best Effort
- **Class Selector (CS0–CS7)** kompatibel zu IP Precedence
- **Assured Forwarding (AFxy)** — x = Klasse 1–4, y = Drop-Wahrscheinlichkeit 1–3
- **Expedited Forwarding (EF)** = 46 → für VoIP-RTP

### 2. Queueing
Mehrere Queues pro Interface, jede mit eigener Strategie:
- **CBWFQ** (Class-Based Weighted Fair Queueing): garantierte Bandbreite pro Klasse
- **LLQ** (Low Latency Queueing): CBWFQ + **Priority Queue** für VoIP
- Tail-Drop vs. WRED: WRED verwirft selektiv vor Überfüllung

### 3. Shaping vs. Policing
Beide begrenzen Traffic — anderer Mechanismus:

| | Shaping | Policing |
|---|---------|---------|
| Aktion | **puffert** Überschuss | **verwirft / re-markt** |
| Latenz | erhöht | nein |
| Einsatz | egress (eigene Seite) | ingress (Provider-Eingang) |
| Burst | glätten | tolerieren oder zuschlagen |

:::merke
**Shaping puffert (verzögert), Policing verwirft (oder re-markt).** Merkhilfe: Sha**p**ing = **p**arken, **Pol**icing = **Pol**izei (straft sofort ab). Shaping passt auf der **eigenen Egress**-Seite (du willst nichts verlieren), Policing am **Ingress** des Providers (er straft Überschuss).
:::

### 4. Trust Boundary
Je weiter "innen" (z. B. am Access-Switch des IP-Phones), desto
vertrauenswürdiger das Marking. Klassifikation erfolgt am **Trust Boundary**.
Empfehlung:
- IP-Phone marks Voice mit CoS 5 / DSCP EF → Switch \`mls qos trust cos\`
- User-PC: NICHT trusten — Switch markiert auf 0

### Konfigurationsbeispiel (Auszug)
\`\`\`
class-map match-any VOICE
  match ip dscp ef

policy-map QOS-OUT
  class VOICE
    priority percent 30          ! LLQ: 30 % der Bandbreite, niedrige Latenz
  class class-default
    fair-queue
    random-detect

interface gi0/1
  service-policy output QOS-OUT
\`\`\`

### Beispiel-Output: \`show policy-map interface gi0/1\` (gekürzt)
\`\`\`
GigabitEthernet0/1
  Service-policy output: QOS-OUT

    Class-map: VOICE (match-any)
      18452 packets, 2954112 bytes
      5 minute offered rate 84000 bps, drop rate 0 bps
      Match: ip dscp ef (46)
      Priority: 30% (300000 kbps), burst bytes 7500
        Priority Level 1
        Conform: 18452 (packets) 2954112 (bytes)
        Exceed: 0 (packets) 0 (bytes)

    Class-map: class-default (match-any)
      125400 packets, 89220000 bytes
      Queueing
        Output Queue: Conversation 25
        Bandwidth remaining 70 (%)
        (pkts output/bytes output) 125400/89220000
        (pkts dropped via WRED) 14/8420
\`\`\`
  `.trim(),
};

export const CONCEPT_QOS_GUIDE: Concept = {
  id: "qos-guide",
  title: "Lernguide: Quality of Service",
  appliesTo: ["ccna"],
  tags: ["qos", "voice", "marking", "guide"],
  content: `
## Lernziele
- Die vier QoS-Eigenschaften (Bandwidth, Delay, Jitter, Loss) und ihre VoIP-Grenzwerte nennen
- Layer-2-Marking (CoS) und Layer-3-Marking (DSCP) unterscheiden
- DSCP-Werte EF, AF31, AF21 und DF korrekt zuordnen
- Den Unterschied zwischen Shaping und Policing erklären
- Eine Trust Boundary auf einem Access-Switch festlegen

## Praxis-Szenario
Die "FleetTrack GmbH" (Logistik-Software) betreibt 80 IP-Telefone, ein internes Webex-Konferenzsystem und Standardarbeitsplätze über eine 200-Mbit/s-Internetleitung. In Stoßzeiten klagen Mitarbeitende über schlechte Sprachqualität. Auf dem Cisco Catalyst 9200 sollen Voice-Pakete (DSCP EF) per LLQ priorisiert, Video (AF41) garantiert mit 30 % Bandbreite versorgt werden. Am Access-Port des IP-Telefons wird Trust auf CoS gesetzt; am User-PC jedoch nicht (Mitarbeitende könnten ihren P2P-Traffic als "Voice" markieren).

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit einem Catalyst 9200, daran ein IP-Telefon (mit angeschlossenem PC am Telefon-Switchport) und einem WAN-Router. Markiere den Switchport zum Telefon mit "trust cos". Beschrifte den Uplink zum Router als WAN-Bottleneck (200 Mbit/s) und füge eine LLQ-Policy "VOICE: priority percent 30" als Notiz hinzu.
**Ziel:** Trust Boundary und LLQ-Policy in einem realistischen VoIP-Szenario sichtbar machen.
**Tipps:** Voice-RTP nutzt DSCP **EF = 46**. SIP-Signaling oft CS3 (24). Vermeide es, beides in dieselbe Priority-Queue zu packen — Signaling braucht keine LLQ.

## Verständnisfragen
1. Welcher DSCP-Wert wird typischerweise für Voice-RTP verwendet, und welcher für Voice-Signaling?
2. Was passiert bei **Policing** mit Paketen, die das Limit überschreiten — und worin unterscheidet sich Shaping?
3. Warum sollte das Trust Boundary so weit "innen" wie möglich liegen — und was riskiert man, wenn man am User-PC trustet?
*(Antworten im Quiz verfügbar)*

:::falle
QoS-Fallen:
- **CoS vs. DSCP:** CoS (Layer 2) lebt nur im 802.1Q-Tag — beim Wechsel in ein untagged Access-VLAN ist es **weg**. Nur **DSCP** (im IP-Header) überlebt Ende-zu-Ende.
- **LLQ ohne Limit:** Eine Priority-Queue ohne \`priority percent\`/\`kbps\` kann das ganze Interface verstopfen — andere Klassen verhungern.
- **Marking am falschen Hop:** Zieht der Provider DSCP nicht mit (remark to 0), ist das Marking über das WAN futsch — vorher im SLA prüfen.
:::
  `.trim(),
};

export const TOPIC_QOS: Topic = {
  id: "qos",
  title: "Quality of Service (QoS)",
  description:
    "Classification, Marking (DSCP/CoS), Queueing (LLQ/CBWFQ), Shaping vs. Policing und Trust Boundary.",
  conceptIds: [
    "qos-fundamentals",
    "qos-tools",
    "qos-guide",
  ],
  quizIds: ["ccna-quiz-qos"],
  exerciseIds: ["exercise-qos-trust-boundary"],
  prerequisiteTopicIds: ["switching-vlans", "routing-ospf"],
  estimatedMinutes: 90,
  tags: ["qos", "voice", "video", "marking", "shaping"],
  lessonSummary: {
    mustKnow: [
      "VoIP quality requirements: delay < 150 ms one-way, jitter < 30 ms, packet loss < 1% — QoS does not create bandwidth, it prioritizes during congestion",
      "DSCP EF (46) for voice RTP; AF41 (34) for video conferencing; DF/0 for best effort — these values must be memorized for the exam",
      "LLQ = CBWFQ + a Priority Queue for voice; the Priority Queue is serviced first, then remaining bandwidth distributed to other classes",
      "Shaping buffers excess traffic (adds delay, no drops); Policing drops or re-marks excess traffic immediately (no added delay)",
      "Trust Boundary: mark traffic as close to the source as possible (at the IP phone or access switch); never trust end-user PCs to self-mark",
    ],
    bestPractice: [
      {
        topic: "VoIP QoS deployment",
        practice:
          "Configure LLQ with 'priority percent 30' for voice (EF) on WAN interfaces; always set a rate limit on the priority queue to prevent voice from starving all other traffic.",
        note: "[Cisco only]",
      },
      {
        topic: "DSCP over CoS",
        practice:
          "Mark with DSCP (Layer 3, IP header) rather than CoS (Layer 2, 802.1Q tag) — DSCP survives across routed hops; CoS is stripped at every Layer-3 boundary.",
      },
      {
        topic: "Trust boundary at IP phone",
        practice:
          "Set 'mls qos trust cos' on access ports connected to IP phones — the phone marks voice as CoS 5 (EF) and PC-through traffic as CoS 0 (best effort).",
        note: "[Cisco only] — applies to Catalyst switches with MLS QoS",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "IP Precedence (3-bit ToS)",
        reason:
          "Only 3 bits (8 values) vs DSCP 6 bits (64 values); DSCP is backward-compatible with IP Precedence through the Class Selector (CS) values",
        replacedBy: "DSCP (DiffServ Code Point, RFC 2474)",
      },
      {
        topic: "Tail-drop",
        reason:
          "Drops all packets at queue tail during congestion; causes TCP global synchronization (all flows back off simultaneously, then all surge together)",
        replacedBy: "WRED (Weighted Random Early Detection) for TCP flows",
      },
    ],
    fastFacts: [
      "DSCP EF = binary 101110 = decimal 46. AF class x, drop y = 8x+2y in decimal (e.g., AF41 = 8×4+2×1 = 34). Verify: show class-map",
      "CoS bits live in the 802.1Q VLAN tag PCP field (3 bits, values 0–7); CoS 5 = voice, CoS 0 = default. Verify: show interfaces <int> trunk",
      "'show policy-map interface <int>' shows per-class packet counters, drops, and queue depth in real time. Verify: show policy-map interface gi0/1",
    ],
  },
};

export const QOS_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_QOS_FUNDAMENTALS.id]: CONCEPT_QOS_FUNDAMENTALS,
  [CONCEPT_QOS_TOOLS.id]: CONCEPT_QOS_TOOLS,
  [CONCEPT_QOS_GUIDE.id]: CONCEPT_QOS_GUIDE,
};

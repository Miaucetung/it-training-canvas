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
      "VoIP-Qualitätsanforderungen: Verzögerung < 150 ms einfache Richtung, Jitter < 30 ms, Paketverlust < 1% — QoS erzeugt keine Bandbreite, es priorisiert bei Überlastung",
      "DSCP EF (46) für Voice-RTP; AF41 (34) für Videokonferenzen; DF/0 für Best Effort — diese Werte müssen für die Prüfung auswendig gelernt werden",
      "LLQ = CBWFQ + eine Priority Queue für Sprache; die Priority Queue wird zuerst bedient, dann wird die verbleibende Bandbreite auf andere Klassen verteilt",
      "Shaping puffert überschüssigen Traffic (fügt Verzögerung hinzu, keine Drops); Policing verwirft oder re-markiert überschüssigen Traffic sofort (keine zusätzliche Verzögerung)",
      "Trust Boundary: Traffic so nah wie möglich an der Quelle markieren (am IP-Telefon oder Access-Switch); End-User-PCs niemals vertrauen, Traffic selbst zu markieren",
    ],
    bestPractice: [
      {
        topic: "VoIP-QoS-Deployment",
        practice:
          "LLQ mit 'priority percent 30' für Sprache (EF) auf WAN-Interfaces konfigurieren; immer ein Ratenlimit für die Priority Queue setzen, damit Sprache nicht den gesamten anderen Traffic aushungert.",
        note: "[Cisco only]",
      },
      {
        topic: "DSCP gegenüber CoS",
        practice:
          "Mit DSCP (Layer 3, IP-Header) statt CoS (Layer 2, 802.1Q-Tag) markieren — DSCP überlebt geroutete Hops; CoS wird an jeder Layer-3-Grenze entfernt.",
      },
      {
        topic: "Trust Boundary am IP-Telefon",
        practice:
          "'mls qos trust cos' auf Access-Ports, die an IP-Telefone angeschlossen sind, setzen — das Telefon markiert Sprache als CoS 5 (EF) und PC-Durchgangs-Traffic als CoS 0 (Best Effort).",
        note: "[Cisco only] — gilt für Catalyst-Switches mit MLS QoS",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "IP Precedence (3-Bit-ToS)",
        reason:
          "Nur 3 Bits (8 Werte) gegenüber DSCP 6 Bits (64 Werte); DSCP ist abwärtskompatibel mit IP Precedence über die Class-Selector-Werte (CS)",
        replacedBy: "DSCP (DiffServ Code Point, RFC 2474)",
      },
      {
        topic: "Tail-Drop",
        reason:
          "Verwirft alle Pakete am Queue-Ende bei Überlastung; verursacht TCP-Global-Synchronisation (alle Flows drosseln gleichzeitig, dann steigen alle gleichzeitig wieder an)",
        replacedBy: "WRED (Weighted Random Early Detection) für TCP-Flows",
      },
    ],
    fastFacts: [
      "DSCP EF = binär 101110 = dezimal 46. AF-Klasse x, Drop-Stufe y = 8x+2y dezimal (z. B. AF41 = 8×4+2×1 = 34). Verify: show class-map",
      "CoS-Bits befinden sich im PCP-Feld des 802.1Q-VLAN-Tags (3 Bits, Werte 0–7); CoS 5 = Sprache, CoS 0 = Standard. Verify: show interfaces <int> trunk",
      "'show policy-map interface <int>' zeigt pro Klasse Paketzähler, Drops und Warteschlangentiefe in Echtzeit. Verify: show policy-map interface gi0/1",
    ],
  },
};

export const QOS_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_QOS_FUNDAMENTALS.id]: CONCEPT_QOS_FUNDAMENTALS,
  [CONCEPT_QOS_TOOLS.id]: CONCEPT_QOS_TOOLS,
  [CONCEPT_QOS_GUIDE.id]: CONCEPT_QOS_GUIDE,
};

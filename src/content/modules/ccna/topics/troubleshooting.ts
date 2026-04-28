// ============================================================
// CCNA Topic: Troubleshooting-Methodik
// Quelle: CCNA 200-301 Official Cert Guide V1, Ch 20
// + verteilte Diagnose-Themen aus V1 Ch 5/7/8 und V2
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_TS_METHODOLOGY: Concept = {
  id: "ts-methodology",
  title: "Troubleshooting-Methodik (OSI-basiert)",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["troubleshooting", "osi", "methodology", "networking"],
  content: `
## Strukturierte Fehlersuche

### Bottom-Up (Layer 1 → 7)
Empfohlen für Hardware-/Verkabelungs-Fehler.
1. **L1**: Kabel, LED, Auto-MDIX, Speed/Duplex
2. **L2**: \`show interfaces\`, MAC-Tabelle, Trunk-Status, STP-Blocking
3. **L3**: \`ip address\`, Routing-Tabelle, Default-Gateway, ARP
4. **L4**: TCP/UDP-Ports, ACL-Filter
5. **L5–7**: DNS, Auth, Anwendungsdienste

### Top-Down
Wenn Anwender ein App-Problem melden (kein Web möglich).
Beginnt bei der Anwendung und arbeitet sich nach unten.

### Divide-and-Conquer
Beginnt in der Mitte (oft L3): "Pingt Hostname?" Wenn ja → L1/L2 ok.
Schnellste Methode bei erfahrenen Admins.

### Strukturiertes Vorgehen (CCNA-Stil)
1. **Problem isolieren** — Wer ist betroffen? Wo? Seit wann?
2. **Hypothesen aufstellen** — was könnte es sein?
3. **Hypothese testen** (nur **eine Variable** ändern!)
4. **Ergebnis prüfen** — Problem weg? → Doku, sonst nächste Hypothese
5. **Dokumentieren** — Lessons Learned, Knowledge Base
  `.trim(),
};

export const CONCEPT_TS_PING_TRACEROUTE: Concept = {
  id: "ts-ping-traceroute",
  title: "Ping & Traceroute — richtig einsetzen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["troubleshooting", "ping", "traceroute", "icmp"],
  content: `
## Ping (ICMP Echo)

### Standard-Ping
\`\`\`
R1# ping 8.8.8.8
\`\`\`
Sendet 5 Pakete, 100 Byte, Timeout 2 s.

### Extended Ping (Cisco-Spezialität)
Erlaubt **Source-IP**, **Anzahl**, **Größe**, **DF-Bit** zu wählen — perfekt um
**Reverse-Path**-Probleme zu finden.

\`\`\`
R1# ping
Protocol [ip]:
Target IP address: 192.168.2.1
Repeat count [5]: 100
Datagram size [100]: 1500
Timeout in seconds [2]:
Extended commands [n]: y
Source address or interface: gi0/1   ! ← entscheidend
Type of service [0]:
Set DF bit in IP header? [no]: y      ! → MTU-Test
\`\`\`

**Tipp:** Wer von R1 aus eine andere Quell-IP setzt, simuliert Traffic von einem
echten Endgerät — testet damit sowohl Hin- als auch Rückweg.

### MTU-Test mit DF-Bit
Wenn ein Paket > MTU mit DF=1 unterwegs ist, **muss** der Router fragmentation-needed
zurückmelden. Wenn nicht → "PMTUD-Black-Hole".

## Traceroute

Sendet IP-Pakete mit aufsteigendem TTL (1, 2, 3, ...). Jeder Hop verwirft das
Paket bei TTL=0 und schickt **ICMP Time Exceeded** zurück → Router-IP wird sichtbar.

### Cisco-Traceroute
- Per Default UDP-Pakete an unwahrscheinliche Ports
- Extended traceroute: source-interface, ttl-Bereich, Probe-Anzahl

### Symbole im Output
| Symbol | Bedeutung |
|--------|----------|
| \`*\` | keine Antwort (Timeout) |
| \`!H\` | Host unreachable |
| \`!N\` | Network unreachable |
| \`!A\` | administrativ (ACL) blockiert |
| \`!P\` | Protocol unreachable |
| \`!Q\` | Source quench |

### Schnellabbruch
\`Strg-Shift-6\` (auf manchen Tastaturen \`Esc Shift-6\`) bricht ein hängendes Ping/Traceroute ab.
  `.trim(),
};

export const CONCEPT_TS_INTERFACE_ERRORS: Concept = {
  id: "ts-interface-errors",
  title: "Interface-Counter & typische Probleme",
  appliesTo: ["ccna"],
  tags: ["troubleshooting", "interface", "duplex", "errors", "ethernet"],
  content: `
## \`show interfaces\` — Counter richtig lesen

\`\`\`
R1# show interfaces gi0/1
GigabitEthernet0/1 is up, line protocol is up
  ...
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
  5 minute input rate 1234 bits/sec
  5 minute output rate 5678 bits/sec
     12345 packets input, 9876543 bytes
     0 input errors, 0 CRC, 0 frame, 0 overrun
     6789 packets output, 5432109 bytes
     0 output errors, 0 collisions, 0 interface resets
     0 babbles, 0 late collision, 0 deferred
\`\`\`

### Wichtige Counter
| Counter | Bedeutung | Typische Ursache |
|---------|----------|-----------------|
| **input errors** | Sammelwert (CRC + frame + giants + runts) | Kabel, EMV |
| **CRC** | Frame-Checksum falsch | schlechtes Kabel/SFP |
| **runts** | < 64 Byte | Kollisionen (Half-Duplex) |
| **giants** | > 1518 Byte | falsche MTU, Jumbo nicht beidseitig |
| **late collisions** | Kollision **nach** 64 Byte | **Duplex-Mismatch** |
| **collisions** | Kollision in normalen 64 Byte | Half-Duplex, übersättigt |
| **input drops** | Buffer voll | Burst-Traffic, Speed-Mismatch |

### Status-Codes (administratively / Protocol)
| Status | Protocol | Diagnose |
|--------|----------|---------|
| up | up | OK |
| up | down | Layer-2 Problem (kein Keepalive, Encap-Mismatch) |
| down | down | Layer-1 Problem (Kabel, Gegenstelle aus, Speed-Mismatch) |
| administratively down | down | \`shutdown\` aktiv → \`no shutdown\` |
| **err-disabled** | down | Port-Security/BPDU Guard hat den Port abgeschaltet |

### err-disabled Recovery
\`\`\`
SW(config)# errdisable recovery cause psecure-violation
SW(config)# errdisable recovery cause bpduguard
SW(config)# errdisable recovery interval 300         ! 5 Minuten
SW# show errdisable recovery
SW(config-if)# shutdown
SW(config-if)# no shutdown                            ! manuelles Recovery
\`\`\`
  `.trim(),
};

export const CONCEPT_TS_GUIDE: Concept = {
  id: "troubleshooting-guide",
  title: "Lernguide: Troubleshooting",
  appliesTo: ["ccna"],
  tags: ["troubleshooting", "diagnostics", "guide"],
  content: `
## Lernziele
- Bottom-Up, Top-Down und Divide-and-Conquer als Troubleshooting-Methoden anwenden
- Extended Ping mit Source-Interface zur Reverse-Path-Diagnose nutzen
- Traceroute-Symbole (\`*\`, \`!H\`, \`!A\`) korrekt deuten
- Late collisions als Indikator für Duplex-Mismatch erkennen
- Einen Port aus dem Zustand \`err-disabled\` zurückholen

## Praxis-Szenario
Bei der "Wohnungsgenossenschaft Nord eG" können Mitarbeitende im Lehrlingsbüro plötzlich nicht mehr drucken. Pings auf den Drucker funktionieren teilweise, dann gar nicht. Auf dem Cisco Catalyst 2960X zeigt \`show interfaces gi0/12\` eine alarmierende Zahl von **late collisions** und CRC-Errors. Der Port hängt im Half-Duplex, das Druckerinterface auf Full-Duplex (manuell konfiguriert). Eine Auszubildende soll: das Problem reproduzieren, mit Extended Ping + DF-Bit den Pfad analysieren, die Konfiguration korrigieren, in der Knowledge Base dokumentieren.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit einem Cisco Catalyst 2960X, zwei PCs (mit auto-Negotiation) und einem Drucker (manuell auf Full-Duplex). Beschrifte den Druckerport mit Counter-Werten ("Late Collisions: 4271").
**Ziel:** Den klassischen Duplex-Mismatch visuell erkennbar machen und die Korrektur (beide Seiten auf "auto") nachvollziehen.
**Tipps:** \`show interfaces gi0/12\` ist die wichtigste Diagnose. Wer "late collisions" sieht, weiß: **eine** Seite ist Half-, die andere Full-Duplex. Auf 1 Gbit/s tritt das Problem nicht auf — Gigabit ist immer Full-Duplex.

## Verständnisfragen
1. Was ist der Unterschied zwischen einer **Collision** und einer **Late Collision** — und welcher Fehler weist eindeutig auf ein Duplex-Problem hin?
2. Wann verwendet man Extended Ping mit \`source-interface\` statt einer normalen Ping?
3. Welche zwei Schritte holen einen err-disabled-Port zurück, und wann ist es besser, das automatische Recovery (\`errdisable recovery\`) zu aktivieren?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **Bei Ping vom Router den Reverse-Path vergessen:** Ein \`ping\` von R1 nutzt R1's Loopback oder ausgehendes Interface als Quell-IP — die ist möglicherweise im Zielnetz nicht geroutet. Mit Extended Ping eine Quell-IP wählen, die der Endhost auch erreichen würde.
- ⚠️ **\`shutdown / no shutdown\` als Allheilmittel:** Bei err-disabled-Ports hilft das, aber der Auslöser bleibt bestehen. Wer nicht die Ursache (z. B. Port-Security-Violation) klärt, bekommt das gleiche Problem in 5 min wieder.
- ⚠️ **Pings, die "nicht vergeben" antworten:** Wenn 4 von 5 Pings ankommen, ist das nicht "fast OK" — es ist ein klares Symptom (Duplex, Buffer-Overrun, ARP-Cache-Tabelle voll). Ursache suchen, nicht akzeptieren.
  `.trim(),
};

export const TOPIC_TROUBLESHOOTING: Topic = {
  id: "troubleshooting",
  title: "Troubleshooting & Diagnose",
  description:
    "Methodik (Bottom-Up/Top-Down), Extended Ping, Traceroute, Interface-Counter und err-disabled Recovery.",
  conceptIds: [
    "ts-methodology",
    "ts-ping-traceroute",
    "ts-interface-errors",
    "troubleshooting-guide",
  ],
  quizIds: ["ccna-quiz-troubleshooting"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ios-cli", "switching-vlans", "routing-ospf"],
  estimatedMinutes: 90,
  tags: ["troubleshooting", "ping", "traceroute", "diagnostics"],
};

export const TROUBLESHOOTING_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_TS_METHODOLOGY.id]: CONCEPT_TS_METHODOLOGY,
  [CONCEPT_TS_PING_TRACEROUTE.id]: CONCEPT_TS_PING_TRACEROUTE,
  [CONCEPT_TS_INTERFACE_ERRORS.id]: CONCEPT_TS_INTERFACE_ERRORS,
  [CONCEPT_TS_GUIDE.id]: CONCEPT_TS_GUIDE,
};

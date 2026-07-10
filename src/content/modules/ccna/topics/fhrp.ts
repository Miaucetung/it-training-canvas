// ============================================================
// CCNA Topic: First Hop Redundancy Protocols (FHRP)
// Quelle: CCNA 200-301 Official Cert Guide V2, Ch 16
// HSRP, VRRP, GLBP
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_FHRP_OVERVIEW: Concept = {
  id: "fhrp-overview",
  title: "FHRP — Erstes-Hop-Redundanz",
  appliesTo: ["ccna"],
  tags: ["networking", "fhrp", "hsrp", "vrrp", "glbp", "redundancy"],
  content: `
## Warum FHRP?

:::kernidee
Ein PC kennt nur **eine** Default-Gateway-IP — er kann nicht „den anderen Router probieren". FHRP löst das, indem **zwei Router sich eine virtuelle IP + virtuelle MAC teilen**. Der Host redet immer mit der vIP; im Hintergrund entscheiden die Router unter sich, wer gerade antwortet. Fällt der aktive aus, übernimmt der zweite **dieselbe** vIP/vMAC — der Host merkt nichts, sein ARP-Eintrag bleibt gültig.
:::

:::analogie
Wie eine **Support-Hotline**: Du wählst immer dieselbe Nummer (vIP). Wer gerade abhebt (welcher Mitarbeiter/Router), ist dir egal — fällt einer aus, übernimmt der nächste denselben Anschluss, ohne dass du eine neue Nummer brauchst.
:::

PCs werden mit **einem** Default-Gateway konfiguriert. Fällt dieser Router aus,
verlieren alle Hosts den Internetzugang — selbst wenn ein Backup-Router vorhanden ist.

**Lösung**: Eine **virtuelle IP** (vIP) und **virtuelle MAC**, die mehrere Router
gemeinsam nutzen. Hosts kennen nur die vIP. Bei Ausfall übernimmt automatisch ein
zweiter Router.

### FHRP-Familie
| Protokoll | Standard | Aktiv/Standby | Load-Balancing |
|-----------|---------|--------------|---------------|
| **HSRP** | Cisco-proprietär | 1 aktiv, 1+ standby | nur per VLAN |
| **VRRP** | RFC 5798 (offen) | 1 master, 1+ backup | nur per VLAN |
| **GLBP** | Cisco-proprietär | bis 4 AVF gleichzeitig | ✅ pro Host |
  `.trim(),
};

export const CONCEPT_HSRP: Concept = {
  id: "hsrp",
  title: "HSRP — Hot Standby Router Protocol",
  appliesTo: ["ccna"],
  tags: ["cisco", "hsrp", "fhrp", "redundancy", "gateway"],
  content: `
## HSRP (RFC 2281, Cisco)

Cisco-proprietäres FHRP, in Version 1 und 2.

### HSRP-Versionen
| | HSRP v1 | HSRP v2 |
|--|---------|--------|
| Multicast | 224.0.0.2 | 224.0.0.102 |
| UDP-Port | 1985 | 1985 |
| Gruppen-IDs | 0–255 | 0–4095 |
| IPv6-Support | Nein | Ja |
| Virtuelle MAC | 0000.0C07.AC**xx** | 0000.0C9F.F**xxx** |

### HSRP-States
1. **Initial** — Interface gerade aktiviert
2. **Learn** — wartet, IP der Gruppe zu lernen
3. **Listen** — kennt vIP, hört Hellos
4. **Speak** — sendet Hellos, kämpft um Active/Standby
5. **Standby** — nur Standby-Router
6. **Active** — leitet Traffic für vIP weiter

### Wahl des Active Routers
- Höchste **Priority** (Default 100, Range 0–255)
- Bei Gleichstand: höchste IP-Adresse
- **Preemption** muss explizit aktiviert sein, sonst behält der erste seine Rolle

:::falle
**Ohne \`standby … preempt\` kommt der Vorzugs-Router nach einem Reboot NICHT automatisch zurück.** Bootet R1 (Priority 110) neu, ist in der Zwischenzeit R2 (100) aktiv geworden — und bleibt es, weil ohne Preempt die höhere Priority nicht erzwungen wird. (Bei **VRRP** ist Preempt per Default **an**, bei HSRP **aus** — beliebte Prüfungsfrage.)
:::

### Beispielkonfiguration
\`\`\`
R1(config)# interface gi0/0
R1(config-if)# ip address 192.168.1.2 255.255.255.0
R1(config-if)# standby version 2
R1(config-if)# standby 10 ip 192.168.1.1            ! virtuelle IP
R1(config-if)# standby 10 priority 110
R1(config-if)# standby 10 preempt
R1(config-if)# standby 10 timers 1 3                ! hello 1s, hold 3s
R1(config-if)# standby 10 authentication md5 key-string GeheimerKey
R1(config-if)# standby 10 track 1 decrement 20      ! Object Tracking
\`\`\`

### Verifikation
\`\`\`
R1# show standby
R1# show standby brief
R1# show standby gi0/0 10
\`\`\`

### Beispiel-Output: \`show standby brief\`
\`\`\`
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State    Active          Standby         Virtual IP
Gi0/0       10   110 P Active   local           10.10.10.3      10.10.10.1
\`\`\`

### Beispiel-Output: \`show standby\` (Auszug)
\`\`\`
GigabitEthernet0/0 - Group 10 (version 2)
  State is Active
    8 state changes, last state change 02:14:12
  Virtual IP address is 10.10.10.1
  Active virtual MAC address is 0000.0c9f.f00a (MAC In Use)
    Local virtual MAC address is 0000.0c9f.f00a (v2 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.232 secs
  Preemption enabled
  Active router is local
  Standby router is 10.10.10.3, priority 100 (expires in 9.456 sec)
  Priority 110 (configured 110)
    Track object 1 state Up decrement 20
  Group name is "hsrp-Gi0/0-10" (default)
\`\`\`

### Object Tracking (Uplink-Ausfall)
Falls der WAN-Uplink ausfällt, soll R1 die Active-Rolle abgeben:
\`\`\`
R1(config)# track 1 interface gi0/1 line-protocol
R1(config-if)# standby 10 track 1 decrement 20
\`\`\`
Sinkt die Priority unter die des Standby (z. B. 90 < 100) → Failover.
  `.trim(),
};

export const CONCEPT_VRRP_GLBP: Concept = {
  id: "vrrp-glbp",
  title: "VRRP & GLBP",
  appliesTo: ["ccna"],
  tags: ["vrrp", "glbp", "fhrp", "redundancy"],
  content: `
## VRRP — Virtual Router Redundancy Protocol (RFC 5798)

Offener Standard, sehr ähnlich HSRP.

| | HSRP | VRRP |
|---|------|------|
| Standard | Cisco | IETF |
| Multicast | 224.0.0.2/102 | **224.0.0.18** |
| Protokoll | UDP 1985 | **IP-Protokoll 112** |
| Standardrolle | Active / Standby | **Master / Backup** |
| Default-Priority | 100 | 100 |
| Preempt-Default | aus | **ein** |
| vIP = echte Router-IP? | nein (separat) | **ja, möglich** |

### VRRP Konfiguration (IOS XE)
\`\`\`
R1(config)# interface gi0/0
R1(config-if)# vrrp 10 address-family ipv4
R1(config-if-vrrp)# address 192.168.1.1            ! vIP
R1(config-if-vrrp)# priority 110
R1(config-if-vrrp)# preempt
\`\`\`

## GLBP — Gateway Load Balancing Protocol (Cisco)

Im Gegensatz zu HSRP/VRRP nutzt GLBP **mehrere Gateways gleichzeitig**.

### Rollen
- **AVG** (Active Virtual Gateway): einer pro Gruppe — verteilt vMACs an Clients
- **AVF** (Active Virtual Forwarder): bis zu **4 pro Gruppe** — leiten echten Traffic
- Standby AVG: übernimmt bei AVG-Ausfall

### Load-Balancing-Methoden
- **round-robin** (Default): rotiert vMACs
- **weighted**: nach Gewichtung (Bandbreite)
- **host-dependent**: ein Host bekommt immer denselben AVF (sticky)

### Konfiguration
\`\`\`
R1(config-if)# glbp 10 ip 192.168.1.1
R1(config-if)# glbp 10 priority 110
R1(config-if)# glbp 10 preempt
R1(config-if)# glbp 10 load-balancing round-robin
\`\`\`

### Wann was?
- **HSRP**: rein Cisco-Umgebung, einfaches Active/Standby
- **VRRP**: gemischte Hersteller (Cisco + Juniper/Arista/HPE)
- **GLBP**: Cisco-Umgebung mit Bedarf an aktivem Load-Balancing
  `.trim(),
};

export const CONCEPT_FHRP_GUIDE: Concept = {
  id: "fhrp-guide",
  title: "Lernguide: First Hop Redundancy",
  appliesTo: ["ccna"],
  tags: ["fhrp", "hsrp", "vrrp", "glbp", "guide"],
  content: `
## Lernziele
- Den Zweck eines FHRP erklären (Default-Gateway-Redundanz)
- HSRP zwischen zwei Routern mit gleicher vIP konfigurieren
- HSRP-States (Initial → Learn → Listen → Speak → Standby/Active) auflisten
- Den Unterschied zwischen HSRP, VRRP und GLBP nennen
- Object Tracking nutzen, um bei Uplink-Ausfall die Priority zu senken

## Praxis-Szenario
Die "VersicherungsMakler GmbH" (250 Mitarbeiter) betreibt zwei Cisco ISR 4451-Router (R1 und R2) als redundante Gateways im Hauptbüro. Beide hängen am gleichen Distribution-Switch im VLAN 10 (192.168.10.0/24). R1 hat 192.168.10.2, R2 hat 192.168.10.3. Die Workstations werden auf das Default-Gateway 192.168.10.1 (HSRP-vIP) konfiguriert. R1 soll im Normalfall aktiv sein (Priority 110, Preempt). Bei Ausfall des WAN-Uplinks (Gi0/1) soll R1 seine Priority um 20 senken, damit R2 übernimmt.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit zwei Routern (R1, R2), einem Distribution-Switch und drei PCs. Beschrifte beide Router mit ihrer realen IP, die HSRP-vIP (192.168.10.1) als Notiz im Switch-Subnetz. Zeichne den WAN-Uplink von R1 und markiere ihn mit "tracked".
**Ziel:** Visualisieren, dass die PCs nur die vIP kennen und R1/R2 sich bei einem Uplink-Ausfall automatisch tauschen.
**Tipps:** Nach Konfiguration immer mit \`show standby brief\` prüfen — R1 sollte "Active", R2 "Standby" anzeigen. Wer ohne \`preempt\` arbeitet, erlebt nach einem Reboot, dass R2 aktiv bleibt — auch wenn R1 die höhere Priority hat.

## Verständnisfragen
1. Warum benötigt HSRP eine **virtuelle MAC-Adresse** und nicht nur eine virtuelle IP?
2. Welcher zentrale Default-Unterschied existiert zwischen HSRP und VRRP bzgl. Preempt?
3. Wie viele AVFs (Active Virtual Forwarder) kann eine GLBP-Gruppe gleichzeitig haben — und wie unterscheidet sich das von HSRP?
*(Antworten im Quiz verfügbar)*

:::falle
FHRP-Fallen:
- **Preempt vergessen:** ohne \`standby 10 preempt\` holt sich der Vorzugs-Router seine Rolle nach Reload nicht zurück.
- **HSRP v1 mit IDs > 255:** v1 kennt nur Gruppen 0–255 — für höhere IDs \`standby version 2\`.
- **Object Tracking ohne Decrement:** \`standby 10 track 1\` senkt nur um den Default (10). Um unter den Standby zu fallen, explizit \`decrement 20\` angeben.
:::
  `.trim(),
};

export const TOPIC_FHRP: Topic = {
  id: "fhrp",
  title: "First Hop Redundancy (HSRP/VRRP/GLBP)",
  description:
    "Default-Gateway-Redundanz mit HSRP, VRRP und GLBP — virtuelle IP/MAC, Preempt und Object Tracking.",
  conceptIds: [
    "fhrp-overview",
    "hsrp",
    "vrrp-glbp",
    "fhrp-guide",
  ],
  quizIds: ["ccna-quiz-fhrp"],
  exerciseIds: ["exercise-fhrp-failover"],
  prerequisiteTopicIds: ["routing-ospf"],
  estimatedMinutes: 90,
  tags: ["fhrp", "hsrp", "vrrp", "glbp", "redundancy"],
  lessonSummary: {
    mustKnow: [
      "FHRP bietet Default-Gateway-Redundanz durch gemeinsame Nutzung einer virtuellen IP und virtuellen MAC zwischen mehreren Routern — Hosts müssen nur die vIP kennen",
      "HSRP Active-Router-Wahl: höchste Priorität gewinnt (Standard 100); Gleichstand bricht die höchste IP; Preemption ist standardmäßig AUS — muss explizit aktiviert werden",
      "VRRP ist der offene Standard (RFC 5798) entsprechend HSRP; Preemption ist bei VRRP standardmäßig EIN (Gegenteil von HSRP)",
      "Object Tracking verknüpft HSRP-Priorität mit Interface- oder Routenzustand — Priorität verringern wenn das getrackte Objekt ausfällt, damit der Backup-Router übernimmt",
      "GLBP erlaubt bis zu 4 Active Virtual Forwarders (AVFs) gleichzeitig und bietet echtes Load-Balancing, anders als HSRP/VRRP, das einen Router im Leerlauf hält",
    ],
    bestPractice: [
      {
        topic: "HSRP Preempt",
        practice:
          "'standby <group> preempt' auf dem beabsichtigten Active-Router immer konfigurieren — ohne es übernimmt der bevorzugte Router die Active-Rolle nach einem Neustart NICHT.",
        note: "[Cisco only]",
      },
      {
        topic: "HSRP-Version",
        practice:
          "HSRP Version 2 ('standby version 2') für alle neuen Deployments verwenden — unterstützt IPv6, Gruppen 0–4095 und nutzt Multicast 224.0.0.102 statt dem Legacy-Wert 224.0.0.2.",
        note: "[Cisco only]",
      },
      {
        topic: "Object Tracking für Uplink-Ausfall",
        practice:
          "Das WAN-Interface-Leitungsprotokoll tracken und die HSRP-Priorität um genug verringern, damit sie unter die Priorität des Standby-Routers fällt: 'standby <g> track <obj> decrement 20'.",
        note: "[Cisco only]",
      },
      {
        topic: "FHRP-Protokollauswahl",
        practice:
          "VRRP in Multi-Vendor-Umgebungen (Cisco + Juniper/Arista) verwenden; HSRP in reinen Cisco-Umgebungen; GLBP wenn aktives Load-Balancing über mehrere Gateways benötigt wird.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "HSRP v1",
        reason:
          "Auf Gruppen-IDs 0–255 begrenzt, kein IPv6-Support, nutzt Legacy-Multicast 224.0.0.2; HSRP v2 ist der aktuelle Standard",
        replacedBy: "HSRP Version 2",
      },
    ],
    fastFacts: [
      "HSRP virtuelle MAC für v2: 0000.0C9F.Fxxx wobei xxx = HSRP-Gruppen-ID in Hex. Verify: show standby",
      "Ohne Preempt bleibt ein neu gestarteter Router mit hoher Priorität im Standby-Modus — der aktuelle Active behält seine Rolle. Verify: show standby brief (P-Flag prüfen)",
      "VRRP nutzt IP-Protokoll 112 (nicht UDP) für seine Multicast-224.0.0.18-Hello-Nachrichten — wichtig für ACL-/Firewall-Regeln. Verify: show vrrp brief",
    ],
  },
};

export const FHRP_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_FHRP_OVERVIEW.id]: CONCEPT_FHRP_OVERVIEW,
  [CONCEPT_HSRP.id]: CONCEPT_HSRP,
  [CONCEPT_VRRP_GLBP.id]: CONCEPT_VRRP_GLBP,
  [CONCEPT_FHRP_GUIDE.id]: CONCEPT_FHRP_GUIDE,
};

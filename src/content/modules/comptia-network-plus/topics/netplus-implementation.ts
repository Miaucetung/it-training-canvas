// ============================================================
// CompTIA Network+ N10-009 — Topic 2: Switching, Routing & Wireless
// Domains: 2.1 (Routing), 2.2 (Switching/VLANs), 2.3 (Wireless)
// Sources:
//   CompTIA Network+ N10-009 Exam Objectives Version 4.0 (lokal, Projektordner)
//   RFC 2328 (OSPF), RFC 4271 (BGP), RFC 2453 (RIP) — rfc-editor.org
//   IEEE 802.11ax (Wi-Fi 6), IEEE 802.11be (Wi-Fi 7) Standard-Übersichten
//   Wikipedia: Spanning Tree Protocol (unstrittige technische Grundlage)
// Cross-References:
//   → CCNA: vlans, stp, routing-fundamentals, ospf, wlan-standards, wlan-security
//   (Schwerpunkt: In CCNA mit Cisco-IOS; hier vendor-neutral für N10-009)
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_SWITCHING_VLANS_NP: Concept = {
  id: "netplus-switching-vlans",
  title: "Switching & VLANs: Vendor-neutrale Grundlagen (N10-009)",
  appliesTo: ["comptia-network-plus"],
  tags: ["switching", "vlan", "802.1q", "stp", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["vlans", "stp", "switching-basics"],
  content: `
## Switching und VLANs: Vom CCNA-Cisco-Kontext zur N+-Vendor-Neutralität

> **Cross-Reference CCNA:** In CCNA hast du VLANs und STP auf Cisco-IOS konfiguriert (Befehle wie \`vlan 10\`, \`switchport access vlan\`, \`show spanning-tree\`). Network+ fragt die **Konzepte** dahinter — vendor-neutral, ohne Cisco-Syntax.

### VLANs — Virtual Local Area Networks

Ein VLAN trennt Broadcast-Domänen logisch, ohne physische Trennung zu erfordern. Mehrere VLANs können auf denselben Switch-Ports coexistieren.

**Warum VLANs?**
- **Sicherheit:** Trennung sensitiver Systeme (z.B. VLAN für VoIP, VLAN für Buchhaltung)
- **Performance:** Kleinere Broadcast-Domänen → weniger Broadcast-Traffic
- **Flexibilität:** Logische Gruppenbildung unabhängig vom physischen Standort

**802.1Q-Tagging:**
- Standard für VLAN-übertragende Ports — ein Tag im Ethernet-Frame identifiziert das VLAN
- 12-Bit-VLAN-ID → 4.094 nutzbare VLANs (1–4094, wobei 1 und 4095 reserviert)
- **Native VLAN:** Traffic ohne Tag — Frames auf dem Native VLAN werden nicht getaggt

**Port-Typen auf Switches (IEEE-Terminologie):**
- **Untagged Port** (Cisco-Begriff: *Access Port*): Gehört einem einzigen VLAN. Verbindet Endgeräte (PCs, Drucker). Kein Tag im Frame beim Verlassen des Switches.
- **Tagged Port** (Cisco-Begriff: *Trunk Port*): Überträgt mehrere VLANs mit 802.1Q-Tags. Verbindet Switch-zu-Switch oder Switch-zu-Router.

> **Vendor-Hinweis Terminologie:** Cisco verwendet "Trunk Port" für tagged/multi-VLAN-Ports. Die IEEE-802.1Q-Norm sowie andere Hersteller (HP/Aruba, Juniper, Extreme) sprechen von **Tagged Port** vs. **Untagged Port**. Network+ nutzt die Konzepte — für die Prüfung beide Begriffe kennen.

- **Voice VLAN:** Separates VLAN für VoIP-Verkehr auf demselben Port wie ein PC — priorisiert QoS

**SVI — Switch Virtual Interface:**
- Virtuelle Layer-3-Schnittstelle auf einem Managed Switch
- Ermöglicht Inter-VLAN-Routing ohne externen Router (Layer-3-Switch)
- Erhält eine IP-Adresse und agiert als Default-Gateway für das VLAN

### STP — Spanning Tree Protocol

Redundante Links zwischen Switches verhindern Netzwerkausfälle bei einem Link-Failure, erzeugen aber gleichzeitig **Switching Loops** — Frames kreisen endlos.

**STP löst das (IEEE 802.1D):**
1. **Root Bridge wählen:** Switch mit niedrigster Bridge-ID (Priorität + MAC-Adresse) wird Root Bridge
2. **Root Ports bestimmen:** Jeder Non-Root-Switch wählt den Port mit dem günstigsten Weg zur Root Bridge
3. **Designated Ports:** Pro Segment wird ein Designated Port (bester Weg zur Root) aktiv
4. **Blocked Ports:** Alle redundanten Ports werden blockiert — verhindern Loops

**Port-Zustände im STP:**
- Blocking → Listening → Learning → Forwarding (oder dauerhaft Blocking)

**Varianten (prüfungsrelevant):**
- **RSTP (802.1w):** Rapid Spanning Tree — schnellere Konvergenz als Original-STP
- **MSTP (802.1s):** Multiple Spanning Tree — ein STP-Prozess pro VLAN-Gruppe

> **Vendor-Hinweis:** In CCNA hast du Cisco-proprietäre Varianten kennengelernt (PVST+, Rapid-PVST+). In N10-009 ist IEEE-802.1D/w/s der Maßstab. Das Konzept ist identisch, die Implementierungsdetails sind vendor-spezifisch.

### Link Aggregation / EtherChannel

**Link Aggregation (IEEE 802.3ad / LACP):**
- Mehrere physische Links werden zu einem logischen Link gebündelt
- Erhöht Bandbreite und bietet Redundanz (fällt ein Link aus, laufen die anderen weiter)
- **LACP** (Link Aggregation Control Protocol): Standardprotokoll für automatische Verhandlung

> **Cross-Reference CCNA:** Konzept \`etherchannel\` — Cisco-proprietäre Variante heißt EtherChannel, Standards-konforme Version ist LACP. Funktioniert identisch.

### MTU und Jumbo Frames

- **MTU (Maximum Transmission Unit):** Standard Ethernet = 1500 Byte
- **Jumbo Frames:** MTU bis 9000 Byte — für Hochdurchsatz in Rechenzentren (iSCSI, NFS)
- Alle Geräte auf dem Pfad müssen dieselbe MTU unterstützen, sonst → Fragmentierung oder Paketverlust
`,
};

export const CONCEPT_ROUTING_NP: Concept = {
  id: "netplus-routing",
  title: "Routing: Statisch, Dynamisch und Protokolle (Vendor-neutral, N10-009)",
  appliesTo: ["comptia-network-plus"],
  tags: ["routing", "ospf", "bgp", "rip", "static-routing", "n10-009", "vendor-neutral"],
  relatedConceptIds: ["routing-fundamentals", "ospf", "inter-vlan-routing"],
  content: `
## Routing: Die N10-009-Perspektive

> **Cross-Reference CCNA:** In CCNA hast du mit Cisco-IOS geroutet und EIGRP als schnelles Link-State-Protokoll kennengelernt. **EIGRP ist Cisco-proprietär** und gehört nicht zum N10-009-Prüfungskanon. Network+ prüft vendor-neutrale Protokolle: RIP, OSPF, BGP.

### Statisches Routing

Routen werden manuell von einem Administrator konfiguriert.

**Vorteile:** Einfach, deterministisch, kein Protokoll-Overhead, sicherer (keine automatische Propagierung)  
**Nachteile:** Nicht skalierbar, kein automatisches Failover, hoher Verwaltungsaufwand

**Default Route (0.0.0.0/0):** "Schicke alles, wofür keine spezifischere Route existiert, dorthin." — Wird beim letzten Router auf dem Weg ins Internet gesetzt.

### Dynamisches Routing

Router tauschen automatisch Routing-Informationen aus und passen ihre Routing-Tabellen an.

**Routenauswahl:**
- **Administrative Distanz:** Vertrauenswürdigkeit der Route-Quelle (niedrigerer Wert = vertrauenswürdiger)
  - Direkt verbunden: 0 | Statisch: 1 | OSPF: 110 | RIP: 120
- **Präfixlänge (Longest Match):** Spezifischere Route gewinnt (/28 gewinnt gegen /24)
- **Metrik:** Protokoll-interner Kostenwert (OSPF: Bandbreite; RIP: Hop Count)

### Routing-Protokolle (N10-009 Kanon)

**RIP (Routing Information Protocol):**
- Distance-Vector-Protokoll (zählt Hops)
- Maximum 15 Hops → nur für kleine Netzwerke geeignet
- RIPv2 unterstützt VLSM und CIDR
- Sehr langsame Konvergenz → kaum noch produktiv eingesetzt, aber prüfungsrelevant

**OSPF (Open Shortest Path First):**
- Link-State-Protokoll — jeder Router kennt die vollständige Topologie
- Nutzt den Dijkstra-Algorithmus (Shortest Path First)
- Kosten basieren auf Interface-Bandbreite
- Skaliert auf große Netzwerke durch **Areas** (Area 0 = Backbone)
- Schnelle Konvergenz bei Topologieänderungen
- Standard in Enterprise-Umgebungen

> **Cross-Reference CCNA:** Konzept \`ospf\` — dort mit Cisco-IOS-Konfiguration. Das Protokoll selbst ist vendor-neutral (RFC 2328).

**BGP (Border Gateway Protocol):**
- **Exterior Gateway Protocol** — verbindet autonome Systeme (AS) im Internet
- Das Routing-Protokoll des Internets schlechthin
- Path-Vector-Protokoll — entscheidet anhand von AS-Pfaden und Policies
- Sehr langsame Konvergenz (Designentscheidung für Stabilität)
- In Unternehmensnetzen für Internet-Peering mit ISPs eingesetzt

**EIGRP — zur Klarstellung:**
EIGRP (Enhanced Interior Gateway Routing Protocol) erscheint in der N10-009-Abkürzungsliste, ist aber Cisco-proprietär. In der Prüfung kann es als Distraktor auftauchen — merke: Es ist kein Standard-Protokoll für N10-009, sondern ein CCNA-Thema.

### NAT und PAT

**NAT (Network Address Translation):** Übersetzt private IP-Adressen (RFC 1918) in öffentliche und zurück. Erlaubt vielen Geräten, eine öffentliche IP-Adresse zu teilen.

**PAT (Port Address Translation):** NAT-Variante, bei der auch der TCP/UDP-Port zur Unterscheidung genutzt wird. Ermöglicht noch mehr Geräten hinter einer IP-Adresse. Wird im Heimrouter eingesetzt.

**FHRP (First Hop Redundancy Protocol):**
- Mehrere Router erscheinen für Endgeräte als ein einziger Default-Gateway
- Vendor-neutral: VRRP (Virtual Router Redundancy Protocol, RFC 5798)
- Cisco-proprietäre Varianten: HSRP, GLBP (N+ nennt nur FHRP als Konzept, keine Cisco-Specifics)
`,
};

export const CONCEPT_WIRELESS_NP: Concept = {
  id: "netplus-wireless",
  title: "Wireless-Netzwerke: 802.11-Standards, Wi-Fi 6/7, Sicherheit (N10-009)",
  appliesTo: ["comptia-network-plus"],
  tags: ["wireless", "wifi", "802.11", "wpa3", "wpa2", "wi-fi6", "wi-fi7", "n10-009"],
  relatedConceptIds: ["wlan-standards", "wlan-security", "wireless-architecture"],
  content: `
## Wireless-Netzwerke: N10-009 mit aktuellem Wi-Fi-6/7-Fokus

> **Cross-Reference CCNA:** In CCNA hast du Wireless im Kontext von Cisco-Controllern (WLC) und Lightweight APs kennengelernt. Network+ behandelt Wireless vendor-neutral — gleiche Technologieprinzipien, kein Cisco-spezifischer Kontext.

### 802.11-Standards: Aktueller Stand (N10-009)

| Standard | Name | Frequenz | Max. Datenrate | Besonderheit |
|---|---|---|---|---|
| 802.11a | — | 5 GHz | 54 Mbps | Älterer Standard |
| 802.11b | — | 2,4 GHz | 11 Mbps | Älterer Standard, störanfällig |
| 802.11g | — | 2,4 GHz | 54 Mbps | — |
| 802.11n | Wi-Fi 4 | 2,4 / 5 GHz | 600 Mbps | MIMO, Dual-Band |
| 802.11ac | Wi-Fi 5 | 5 GHz | bis 6,9 Gbps | MU-MIMO, Beamforming |
| **802.11ax** | **Wi-Fi 6 / Wi-Fi 6E** | 2,4 / 5 / **6 GHz** | bis 9,6 Gbps | OFDMA, bessere Effizienz in dichten Umgebungen |
| **802.11be** | **Wi-Fi 7** | 2,4 / 5 / 6 GHz | bis 46 Gbps | Multi-Link Operation (MLO), 320 MHz Kanäle |

<!-- TODO: 802.11be (Wi-Fi 7) in N10-009-Objectives-Tiefe verifizieren. Objectives nennen
     "802.11-Standards" generisch ohne einzelne Standards aufzulisten. Wi-Fi 7 wurde Feb. 2024
     zertifiziert, N10-009 erschien Juni 2024 — möglicherweise nicht explizit prüfungsrelevant.
     Falls Exam-Feedback zeigt, dass 802.11be nicht geprüft wird, Tabellen-Eintrag entfernen. -->

**N10-009-Schwerpunkt:** Wi-Fi 6 (802.11ax) und Wi-Fi 7 (802.11be) sind aktuelle Prüfungsthemen. Ältere Quellen nennen oft nur 802.11ac — das reicht für N10-009 **nicht** mehr.

### Frequenzen und Kanäle

**2,4-GHz-Band:**
- Größere Reichweite, durchdringt Wände besser
- Nur 3 nicht-überlappende Kanäle (1, 6, 11) in den USA/Europa
- Starke Interferenz (Mikrowellen, Bluetooth, viele Legacy-Geräte)

**5-GHz-Band:**
- Höhere Bandbreite, geringere Interferenz
- Kürzere Reichweite
- Deutlich mehr nicht-überlappende Kanäle

**6-GHz-Band (Wi-Fi 6E):**
- Neu hinzugekommen — fast keine Legacy-Geräte, sehr wenig Interferenz
- 59 nicht-überlappende 20-MHz-Kanäle (USA)

**Kanalbreite:**
- 20 MHz → 40 MHz → 80 MHz → 160 MHz (802.11ax) → 320 MHz (802.11be)
- Breiterer Kanal = höhere Durchsatzrate, aber weniger nicht-überlappende Kanäle

**802.11h:** Protokollerweiterung für das 5-GHz-Band — Leistungsregelung (TPC) und dynamische Frequenzwahl (DFS) um Radarinterferenzen zu vermeiden. Pflicht in Europa.

### Wireless-Sicherheit

**WPA2 (Wi-Fi Protected Access 2, IEEE 802.11i):**
- Verschlüsselung: **AES-CCMP** (128-Bit) — stark, aktuell
- Ersetzte WEP (gebrochen) und WPA (schwächer)
- **WPA2-Personal (PSK):** Gemeinsamer Pre-Shared Key — Heimnetzwerke
- **WPA2-Enterprise:** 802.1X-Authentifizierung mit RADIUS-Server — Unternehmensnetze

**WPA3 (seit 2018):**
- **SAE** (Simultaneous Authentication of Equals) ersetzt PSK — Schutz gegen Offline-Dictionary-Attacks
- Forward Secrecy — auch bei nachträglichem Key-Kompromiss sind ältere Sessions geschützt
- **WPA3-Enterprise:** 192-Bit-Sicherheitsmodus für hochsensible Umgebungen
- Pflicht: Neues Wi-Fi 6-Equipment muss WPA3 unterstützen

> **Prüfungsfalle:** WEP ist gebrochen (RC4 + IV-Schwäche). WPA (TKIP) ist schwächer als WPA2. Die Prüfung fragt nach der empfohlenen aktuellen Wahl: **WPA3** wenn verfügbar, sonst **WPA2-Enterprise**.

### Authentifizierung

**PSK vs. Enterprise:**
- **PSK (Pre-Shared Key):** Ein Passwort für alle — einfach, aber bei Kompromittierung muss es überall geändert werden
- **802.1X Enterprise:** Individueller Nutzername/Passwort pro Benutzer, authentifiziert über RADIUS — skalierbar, auditierfähig, bei CCNA mit Cisco-WLC kennengelernt

### Netzwerktypen

- **Infrastructure-Modus:** Clients verbinden sich über Access Points — Standardbetrieb
- **Ad-hoc (IBSS):** Direkte Gerät-zu-Gerät-Verbindung ohne AP — selten in der Praxis
- **Mesh:** Mehrere APs verbunden sich untereinander — gute Abdeckung ohne verkabelte Infrastruktur an jedem AP
- **Punkt-zu-Punkt:** Zwei APs verbinden entfernte Standorte (z.B. zwei Gebäude)

### AP-Typen

- **Autonomer AP:** Eigenständig, separate Konfiguration pro AP — kleine Netze
- **Lightweight AP (LWAP):** Wird von einem zentralen Wireless-Controller (WLC) gesteuert — CAPWAP-Protokoll für die Kommunikation zwischen AP und Controller. Skalierbar für Enterprise-Umgebungen.
`,
};

// ── Quiz ──────────────────────────────────────────────────────

const QUIZ_QUESTIONS_T2: Question[] = [
  {
    id: "np-impl-q1",
    type: "single-choice",
    text: "Ein Port auf einem Switch überträgt Traffic für mehrere VLANs mit 802.1Q-Tags und ist mit einem anderen Switch verbunden. Welcher Port-Typ ist das (IEEE-Terminologie)?",
    points: 10,
    answers: [
      { id: "a", text: "Untagged Port (Cisco: Access Port)", isCorrect: false },
      { id: "b", text: "Tagged Port (Cisco: Trunk Port)", isCorrect: true },
      { id: "c", text: "Voice-VLAN-Port", isCorrect: false },
      { id: "d", text: "Management Port", isCorrect: false },
    ],
    explanation:
      "Ein Tagged Port (IEEE-802.1Q-Terminologie) bzw. 'Trunk Port' (Cisco-Begriff) überträgt Traffic für mehrere VLANs und kennzeichnet Frames mit 802.1Q-Tags. Er wird typischerweise für Switch-zu-Switch- oder Switch-zu-Router-Verbindungen genutzt. Ein Untagged Port (Cisco: Access Port) gehört einem einzigen VLAN und verbindet Endgeräte ohne Tagging. Network+ nutzt beide Begriffe — die IEEE-Bezeichnung ist vendor-neutral.",
  },
  {
    id: "np-impl-q2",
    type: "single-choice",
    // PBQ-artig: In der echten Prüfung erscheint das oft als Szenario-Frage mit Topologie-Diagramm
    text: "Netzwerkadministratorin Lara findet in ihrem Switched-Netzwerk einen Loop: Frames kreisen endlos zwischen zwei redundanten Links. Welches Protokoll ist dafür zuständig, dieses Problem automatisch zu verhindern?",
    points: 10,
    answers: [
      { id: "a", text: "OSPF — Open Shortest Path First", isCorrect: false },
      { id: "b", text: "LACP — Link Aggregation Control Protocol", isCorrect: false },
      { id: "c", text: "STP — Spanning Tree Protocol (IEEE 802.1D)", isCorrect: true },
      { id: "d", text: "BGP — Border Gateway Protocol", isCorrect: false },
    ],
    explanation:
      "STP (Spanning Tree Protocol, IEEE 802.1D) verhindert Switching-Loops durch Blockierung redundanter Ports. Der Switch mit der niedrigsten Bridge-ID wird Root Bridge; alle anderen Switches berechnen den günstigsten Weg zur Root und blockieren redundante Pfade. RSTP (802.1w) ist die schnellere Variante. LACP bündelt Links (erhöht Bandbreite), verhindert aber keine Loops.",
  },
  {
    id: "np-impl-q3",
    type: "single-choice",
    text: "Welches Routing-Protokoll ist das 'Routing-Protokoll des Internets' und verbindet autonome Systeme (AS) miteinander?",
    points: 10,
    answers: [
      { id: "a", text: "OSPF (Open Shortest Path First)", isCorrect: false },
      { id: "b", text: "RIP (Routing Information Protocol)", isCorrect: false },
      { id: "c", text: "EIGRP (Enhanced Interior Gateway Routing Protocol)", isCorrect: false },
      { id: "d", text: "BGP (Border Gateway Protocol)", isCorrect: true },
    ],
    explanation:
      "BGP (Border Gateway Protocol) ist das Exterior Gateway Protocol des Internets und verbindet autonome Systeme (AS) — z.B. ISPs untereinander oder Unternehmen mit ihrem ISP. OSPF und RIP sind Interior Gateway Protocols (innerhalb eines AS). EIGRP ist Cisco-proprietär und nicht im N10-009-Hauptkanon — es erscheint hier bewusst als Distraktor.",
  },
  {
    id: "np-impl-q4",
    type: "single-choice",
    text: "Welcher 802.11-Standard führt das 6-GHz-Band ein und heißt auch Wi-Fi 6E?",
    points: 10,
    answers: [
      { id: "a", text: "IEEE 802.11ac (Wi-Fi 5)", isCorrect: false },
      { id: "b", text: "IEEE 802.11n (Wi-Fi 4)", isCorrect: false },
      { id: "c", text: "IEEE 802.11ax (Wi-Fi 6 / Wi-Fi 6E)", isCorrect: true },
      { id: "d", text: "IEEE 802.11be (Wi-Fi 7)", isCorrect: false },
    ],
    explanation:
      "IEEE 802.11ax ist Wi-Fi 6. Die Erweiterung auf das 6-GHz-Band heißt Wi-Fi 6E (das 'E' steht für Extended). Wi-Fi 6E bietet deutlich mehr nicht-überlappende Kanäle und weniger Interferenz als 2,4 oder 5 GHz. Wi-Fi 7 (802.11be) geht noch weiter mit Multi-Link Operation und 320-MHz-Kanälen.",
  },
  {
    id: "np-impl-q5",
    type: "single-choice",
    text: "Was ist der Hauptvorteil von WPA3 gegenüber WPA2-Personal?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "WPA3 ist schneller als WPA2, weil es schwächere Verschlüsselung nutzt",
        isCorrect: false,
      },
      {
        id: "b",
        text: "WPA3 schützt mit SAE gegen Offline-Dictionary-Attacks und bietet Forward Secrecy",
        isCorrect: true,
      },
      {
        id: "c",
        text: "WPA3 erfordert keine Authentifizierung für Gastnetzwerke",
        isCorrect: false,
      },
      {
        id: "d",
        text: "WPA3 ist ausschließlich für Enterprise-Netzwerke — nicht für Heimnetzwerke",
        isCorrect: false,
      },
    ],
    explanation:
      "WPA3 nutzt SAE (Simultaneous Authentication of Equals) statt des PSK-Handshakes. SAE verhindert Offline-Dictionary-Attacks — ein Angreifer kann aufgezeichneten Handshake-Traffic nicht mehr offline gegen Wortlisten testen. Zusätzlich bietet WPA3 Forward Secrecy: Auch wenn der Schlüssel später kompromittiert wird, bleiben frühere Sessions geschützt.",
  },
  {
    id: "np-impl-q6",
    type: "single-choice",
    text: "Ein Router hat für das Ziel 192.168.10.0 zwei Routen: eine OSPF-Route (/24) und eine statische Route (/28). Welche Route wird bevorzugt?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Die OSPF-Route (/24), weil OSPF zuverlässiger als statisches Routing ist",
        isCorrect: false,
      },
      {
        id: "b",
        text: "Die statische Route (/28), weil längere Präfixe (spezifischere Routen) immer bevorzugt werden",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Die statische Route (/28), weil statisches Routing immer Priorität hat",
        isCorrect: false,
      },
      {
        id: "d",
        text: "Beide werden gleichzeitig genutzt (Load Balancing)",
        isCorrect: false,
      },
    ],
    explanation:
      "Das Longest-Prefix-Match-Prinzip: Spezifischere Routen (längere Präfix-Maske) gewinnen immer — unabhängig von der Routing-Quelle oder Administrative Distanz. /28 ist spezifischer als /24, daher gewinnt die statische /28-Route. Die Antwort C klingt ähnlich, ist aber falsch: Nicht weil statisches Routing generell Priorität hat, sondern weil die Präfixlänge entscheidend ist.",
  },
  {
    id: "np-impl-q7",
    type: "multiple-choice",
    text: "Welche ZWEI Aussagen über 802.1Q-Trunking sind korrekt? (Wähle 2)",
    points: 10,
    answers: [
      {
        id: "a",
        text: "Frames auf dem Native VLAN werden nicht getaggt",
        isCorrect: true,
      },
      {
        id: "b",
        text: "802.1Q ermöglicht bis zu 16 Millionen VLANs dank des 24-Bit-Tags",
        isCorrect: false,
      },
      {
        id: "c",
        text: "Ein Tagged Port (Cisco: Trunk Port) überträgt Traffic für mehrere VLANs gleichzeitig",
        isCorrect: true,
      },
      {
        id: "d",
        text: "Tagged Ports (Trunk Ports) werden ausschließlich für Verbindungen zu Endgeräten genutzt",
        isCorrect: false,
      },
    ],
    explanation:
      "802.1Q fügt einen 4-Byte-Tag in den Ethernet-Frame ein mit einem 12-Bit-VLAN-ID (bis 4.094 VLANs, nicht 16 Millionen — das ist VXLAN mit 24-Bit-VNI). Frames auf dem Native VLAN werden ausnahmsweise NICHT getaggt. Tagged Ports (Cisco: Trunk Ports) verbinden Switches miteinander oder Switch-zu-Router, nicht Endgeräte. Endgeräte sind an Untagged Ports (Cisco: Access Ports) angeschlossen.",
  },
  {
    id: "np-impl-q8",
    type: "single-choice",
    text: "Was ist der Unterschied zwischen OSPF und RIP in Bezug auf Skalierbarkeit?",
    points: 10,
    answers: [
      {
        id: "a",
        text: "RIP skaliert besser weil es einfacher konfigurierbar ist",
        isCorrect: false,
      },
      {
        id: "b",
        text: "OSPF skaliert besser: keine Hop-Count-Begrenzung, schnelle Konvergenz, hierarchische Areas",
        isCorrect: true,
      },
      {
        id: "c",
        text: "Beide Protokolle sind gleich gut skalierbar, unterscheiden sich nur im Algorithmus",
        isCorrect: false,
      },
      {
        id: "d",
        text: "RIP skaliert besser weil es BGP als Basis nutzt",
        isCorrect: false,
      },
    ],
    explanation:
      "RIP ist auf 15 Hops begrenzt und konvergiert langsam (sendet alle 30 Sekunden vollständige Routing-Tabellen). OSPF hat keine Hop-Count-Begrenzung, nutzt den Dijkstra-Algorithmus (kürzester Pfad), konvergiert schnell bei Topologieänderungen und skaliert durch hierarchische Aufteilung in Areas. Für große Enterprise-Netzwerke ist OSPF die Standardwahl.",
  },
];

export const QUIZ_NETPLUS_IMPLEMENTATION: Quiz = {
  id: "netplus-quiz-implementation",
  title: "Network+ T2: Switching, Routing & Wireless",
  description:
    "VLANs, 802.1Q-Trunking, STP, dynamisches Routing (OSPF/BGP), Wireless-Standards (Wi-Fi 6/7) und WPA3 — N10-009 Domain 2.",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 720,
  questions: QUIZ_QUESTIONS_T2,
};

// ── Topic-Descriptor ──────────────────────────────────────────

export const TOPIC_NETPLUS_IMPLEMENTATION: Topic = {
  id: "netplus-implementation",
  title: "Switching, Routing & Wireless",
  description:
    "VLANs und 802.1Q vendor-neutral, Spanning Tree Protocol, Routing-Protokolle (OSPF, BGP, RIP), 802.11-Standards mit Wi-Fi 6/7-Schwerpunkt, WPA2/WPA3 und Wireless-Architektur.",
  conceptIds: [
    "netplus-switching-vlans",
    "netplus-routing",
    "netplus-wireless",
  ],
  quizIds: ["netplus-quiz-implementation"],
  exerciseIds: [],
  prerequisiteTopicIds: ["netplus-network-concepts"],
  estimatedMinutes: 75,
  tags: ["switching", "vlans", "routing", "ospf", "wireless", "wifi6", "wpa3", "n10-009", "comptia"],
};

// ── Exports ───────────────────────────────────────────────────

export const IMPLEMENTATION_CONCEPTS: Record<string, Concept> = {
  [CONCEPT_SWITCHING_VLANS_NP.id]: CONCEPT_SWITCHING_VLANS_NP,
  [CONCEPT_ROUTING_NP.id]: CONCEPT_ROUTING_NP,
  [CONCEPT_WIRELESS_NP.id]: CONCEPT_WIRELESS_NP,
};

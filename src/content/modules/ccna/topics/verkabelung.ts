// ============================================================
// CCNA Topic: Verkabelung (Cabling)
// Abdeckung: Kupfer, Glasfaser, Praxis — CCNA Exam Topic 1.3
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

// ── Concept 1: Twisted Pair Grundlagen ───────────────────────

export const CONCEPT_KUPFER_TWISTED_PAIR: Concept = {
  id: "kupfer-twisted-pair",
  title: "Kupferkabel — Twisted Pair Aufbau & Störungsunterdrückung",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "copper",
    "twisted-pair",
    "emi",
    "crosstalk",
    "utp",
    "stp",
    "layer-1",
  ],
  content: `
## 🧲 Anker — Alltagsanalogie

Stell dir zwei Lautsprecher vor, die exakt dasselbe Signal spielen — aber einer ist um 180° gedreht (Polarität invertiert). Der Lärm beider hebt sich gegenseitig auf. Genau so funktioniert ein verdrilltes Aderpaar.

---

## Warum verdrillen?

Jedes Kupferkabel ist eine Antenne. Es sendet elektromagnetische Felder aus **und** empfängt sie.

**Ohne Verdrillung**: Beide Adern des Paares laufen parallel → Störsignale (EMI) werden auf beiden Adern gleich stark eingekoppelt → das Signal wird verfälscht.

**Mit Verdrillung**: Die Adern tauschen ihre Position regelmäßig. Das Störsignal wird abwechselnd auf "Ader A" und "Ader B" eingekoppelt — mit entgegengesetztem Vorzeichen. Der Empfänger subtrahiert beide Adern voneinander → Nutzanteil verdoppelt sich, Störanteil löscht sich aus.

:::kernidee
Twisted-Pair überträgt **differenziell**: Die Information steckt in der **Differenz** zwischen den zwei Adern eines Paares, nicht im Absolutpegel. Eine Störung (EMI) trifft beide verdrillten Adern **gleich** — und fällt beim Subtrahieren heraus. Mehr Verdrillungen pro Meter = bessere Auslöschung = höhere Kategorie. Das ist der ganze Trick hinter Cat5e→Cat6→Cat6a.
:::

> Dieser Mechanismus heißt **Gleichtaktunterdrückung (Common Mode Rejection)**.

---

## Schirmungsarten (Notation: Außenschirm/Aderpaar-Schirm)

| Kürzel | Außenschirm | Aderpaar-Schirm | Anwendung |
|--------|------------|-----------------|-----------|
| U/UTP | keiner | keiner | Büro, Cat5e/6 |
| F/UTP | Folie | keiner | Cat6a in stark gestörter Umgebung |
| S/FTP | Geflecht | Folie pro Paar | Cat7/7a, Industrie |
| S/STP | Geflecht | Geflecht pro Paar | Cat7a+, High-End |

**U** = Unshielded · **F** = Folie · **S** = Schirmgeflecht · **TP** = Twisted Pair

> ⚠️ **Achtung-Falle**: Mehr Schirmung ≠ immer besser. Geschirmte Kabel erfordern korrekte Erdung. Falsches Erden erzeugt Erdschleifen und verschlechtert die Signalqualität!

---

## Störmechanismen im Detail

### NEXT — Near-End Crosstalk
Übersprechen vom **sendenden** auf das **empfangende** Aderpaar am **selben Ende** des Kabels. Kritischstes Maß bei 10/100BASE-T.

### FEXT — Far-End Crosstalk
Übersprechen, das am **gegenüberliegenden** Kabelende gemessen wird. Weniger kritisch als NEXT.

### Return Loss
Anteil des Signals, das durch Impedanzschwankungen reflektiert wird. Verursacht Echo und Signalverzerrung.

### Attenuation (Dämpfung)
Signalverlust über die Kabellänge — steigt mit Frequenz und Länge. Grenzwert bei 100 m je Segment (TIA-568).

---

## Aderpaaranzahl & Nutzung

| Standard | Paare genutzt | Paare gesamt | Hinweis |
|----------|--------------|--------------|---------|
| 10/100BASE-T | 2 von 4 | 4 | Paare 1+2 (Pins 1-2, 3-6) |
| 1000BASE-T | 4 von 4 | 4 | Alle 4 Paare bidirektional |
| 10GBASE-T | 4 von 4 | 4 | Erfordert Cat6a/7 |

---

## Cisco-Kontext

Cisco-Switches und -Router unterstützen **Auto-MDI-X** — sie erkennen automatisch, ob Straight-Through oder Crossover benötigt wird, und konfigurieren die Pins entsprechend. Bei modernen Geräten (Catalyst 2960, 3750, ISR-Serie) ist Auto-MDI-X standardmäßig aktiv.

\`\`\`
SW# show interfaces GigabitEthernet 0/1
  ...
  MDI type: Auto-MDIX
\`\`\`
  `.trim(),
};

// ── Concept 2: Kabelkategorien ────────────────────────────────

export const CONCEPT_KUPFER_KATEGORIEN: Concept = {
  id: "kupfer-kategorien",
  title: "Twisted-Pair Kategorien — Cat5e bis Cat8",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "cat5e",
    "cat6",
    "cat6a",
    "cat7",
    "cat8",
    "bandwidth",
    "frequency",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 1.3 | ⏱️ 20 Min

---

## Kategorienvergleich

| Kategorie | Max. Frequenz | Max. Datenrate | Max. Länge | Schirmung | Typischer Einsatz |
|-----------|--------------|---------------|------------|-----------|------------------|
| Cat 5e | 100 MHz | 1 Gbit/s | 100 m | U/UTP | Ältere Büroinfrastruktur |
| Cat 6 | 250 MHz | 10 Gbit/s | 55 m (10G) / 100 m (1G) | U/UTP, F/UTP | Standard-Büroverkabelung heute |
| Cat 6a | 500 MHz | 10 Gbit/s | 100 m | U/UTP, F/UTP, S/FTP | Datacenter, neue Gebäudeverkabelung |
| Cat 7 | 600 MHz | 10 Gbit/s | 100 m | S/FTP | Industrie, gestörte Umgebungen |
| Cat 7a | 1000 MHz | 40 Gbit/s | 50 m | S/STP | Datacenter Spine-Links |
| Cat 8 | 2000 MHz | 25/40 Gbit/s | 30 m | S/FTP | Datacenter ToR-Switches |

---

## Entscheidungshilfe: Welche Kategorie wählen?

\`\`\`
Neue Gebäudeinstallation heute?
  └→ Cat 6a — zukunftssicher, 10G auf 100 m, bezahlbar

Upgrade bestehender Cat5e-Infrastruktur?
  └→ Cat 6 — passt in alte Kanäle, 10G bis 55 m reichen im Access-Bereich

Datacenter, kurze Kabellängen (<30 m), 40G?
  └→ Cat 8 oder DAC-Kabel (günstiger)

Industrieumgebung mit starker EMI (Motoren, Frequenzumrichter)?
  └→ Cat 7 S/FTP — vollständige Schirmung pro Paar
\`\`\`

---

## Wichtige Prüfungspunkte

:::falle
**Cat 6 liefert 10 Gbit/s nur bis 55 m** — auf den vollen 100 m sind es maximal 1 Gbit/s. Für 10 Gbit/s über 100 m braucht es **Cat 6a**. Genau dieser Längen-/Geschwindigkeits-Zusammenhang wird gern abgefragt.
:::

> ⚠️ **Achtung-Falle**: Cat 7 verwendet **GG45** oder **TERA**-Stecker, **nicht** Standard-RJ45 — dadurch ist es nicht rückwärtskompatibel ohne Adapter.

> ⚠️ **Achtung-Falle**: Die offizielle ISO/IEC-Bezeichnung lautet "Klasse" (Class E = Cat6, Class EA = Cat6a, Class F = Cat7). In der Praxis wird "Cat" durchgängig verwendet.

---

## Geschichtliche Zeitlinie

| Jahr | Ereignis |
|------|---------|
| 1991 | Cat 3 — 10BASE-T (10 Mbit/s) |
| 1995 | Cat 5 — 100BASE-TX (100 Mbit/s) |
| 2001 | Cat 5e — 1000BASE-T (1 Gbit/s) |
| 2002 | Cat 6 — Verbesserte Specs |
| 2008 | Cat 6a — 10GBASE-T auf 100 m |
| 2010 | Cat 7 / 7a — Industrie-Grade |
| 2016 | Cat 8 — IEEE 802.3bq, Datacenter |
  `.trim(),
};

// ── Concept 3: Stecker & Pinbelegung ─────────────────────────

export const CONCEPT_KUPFER_STECKER_PINBELEGUNG: Concept = {
  id: "kupfer-stecker-pinbelegung",
  title: "RJ45-Stecker, Pinbelegung & Kabeltypen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "rj45",
    "t568a",
    "t568b",
    "straight-through",
    "crossover",
    "rollover",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 1.3 | ⏱️ 25 Min

---

## Steckertypen im Vergleich

| Stecker | Pins | Norm | Kompatibilität | Einsatz |
|---------|------|------|----------------|---------|
| **RJ45 (8P8C)** | 8 | TIA-568 | Universell | Ethernet Cat5e–Cat6a |
| **GG45** | 8+4 = 12 | IEC 60603-7-7 | RJ45-kompatibel | Cat7 |
| **TERA** | 8 | IEC 60512-99-001 | Nicht RJ45-kompatibel | Cat7 Industrie |
| **ARJ45** | 8 | ISO 11801 | RJ45-kompatibel | Cat6a |

---

## TIA/EIA-568A vs. 568B Pinbelegung

| Pin | 568A Farbe | 568B Farbe | Signal (1000BASE-T) |
|-----|-----------|-----------|---------------------|
| 1 | Weiß-Grün | Weiß-Orange | BI_DA+ |
| 2 | Grün | Orange | BI_DA- |
| 3 | Weiß-Orange | Weiß-Grün | BI_DB+ |
| 4 | Blau | Blau | BI_DC+ |
| 5 | Weiß-Blau | Weiß-Blau | BI_DC- |
| 6 | Orange | Grün | BI_DB- |
| 7 | Weiß-Braun | Weiß-Braun | BI_DD+ |
| 8 | Braun | Braun | BI_DD- |

:::merke
**568B: „Orange vor Grün"** — bei 568B liegen die orangenen Adern auf Pins 1–2, bei 568A die grünen. Gleiche Norm an beiden Enden = **Straight-Through**; A an einem, B am anderen Ende = **Crossover**.
:::

---

## Kabeltypen

### Straight-Through (Patch-Kabel)
- Beide Enden identisch (568B/568B oder 568A/568A)
- Verbindet **unterschiedliche** Gerätetypen: PC ↔ Switch, Router ↔ Switch
- Pins 1→1, 2→2, 3→3, 6→6

### Crossover
- Ein Ende 568A, anderes Ende 568B
- Verbindet **gleiche** Gerätetypen: Switch ↔ Switch, PC ↔ PC, Router ↔ Router (ohne Auto-MDI-X)
- Pins 1→3, 2→6, 3→1, 6→2

### Rollover (Konsolen-Kabel, "Yost-Kabel")
- Alle Pins gespiegelt: Pin 1→8, 2→7, 3→6, 4→5
- Verbindet **PC (COM-Port/USB-Serial) ↔ Cisco Konsolen-Port**
- Häufig **hellblau** (Cisco-Standard)
- Kein Ethernet! Nur serielle RS-232-Konsole (9600 Baud, 8N1)

---

:::falle
**Auto-MDI-X** macht Crossover-Kabel in der Praxis fast überflüssig — moderne Catalyst-Switches erkennen selbst, ob Straight-Through oder Crossover nötig ist. **Trotzdem** Prüfungsthema: Du musst wissen, welcher Kabeltyp *eigentlich* zwischen welchen Geräten gehört (gleiche Geräte → Crossover, ungleiche → Straight-Through).
:::

:::falle
Das **Rollover-Kabel** (hellblau, Cisco) ist **kein Ethernet-Kabel** — es überträgt keine Daten, sondern verbindet ausschließlich den **Konsolenport** (seriell) zur Erstkonfiguration. Nicht mit Crossover verwechseln.
:::

---

## 🔧 Interaktiver Pin-Trainer

Öffne den **Verkabelungs-Trainer** (Button unten), um Adernfarben per Drag-and-Drop auf einen RJ45-Stecker zu legen und T568A/B zu üben.
  `.trim(),
};

// ── Concept 4: Glasfaser Grundlagen ──────────────────────────

export const CONCEPT_GLASFASER_GRUNDLAGEN: Concept = {
  id: "glasfaser-grundlagen",
  title: "Glasfaser — Singlemode vs. Multimode",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "fiber",
    "singlemode",
    "multimode",
    "om1",
    "om2",
    "om3",
    "om4",
    "om5",
    "os1",
    "os2",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 1.3 | ⏱️ 20 Min

---

## 🕯️ Anker — Lichtleiter-Analogie

Stell dir ein langes, gebogenes Glasrohr vor. Wirfst du Licht hinein, wird es an der Innenwand reflektiert und läuft bis zum anderen Ende — wie ein Lichtschlauch. Das ist Glasfaser. Singlemode = schmaler Kanal, nur ein Lichtpfad. Multimode = breiter Kanal, mehrere Lichtpfade gleichzeitig.

---

## Singlemode (SMF) vs. Multimode (MMF)

| Eigenschaft | Singlemode | Multimode |
|-------------|-----------|-----------|
| Kerndurchmesser | 8–10 µm | 50–62,5 µm |
| Wellenlänge | 1310 nm / 1550 nm | 850 nm / 1300 nm |
| Max. Distanz | > 10 km (bis 80 km+) | bis 550 m (OM4) |
| Lichtquelle | Laser | LED / VCSEL |
| Kosten | Höher (Laser) | Günstiger (LED) |
| Anwendung | WAN, Campus-Backbone | Datacenter, Gebäudeverkabelung |

---

## Multimode-Typen (OM-Klassen)

| Klasse | Kerndurchmesser | Max. 10G-Distanz | Max. 40G-Distanz | Max. 100G-Distanz | Farbe (Mantel) |
|--------|----------------|-----------------|-----------------|------------------|----------------|
| OM1 | 62,5 µm | 33 m | – | – | Orange |
| OM2 | 50 µm | 82 m | – | – | Orange |
| OM3 | 50 µm (optimiert) | 300 m | 100 m | 70 m | Aqua |
| OM4 | 50 µm (high-bandwidth) | 550 m | 150 m | 100 m | Aqua / Violett |
| OM5 | 50 µm (WBMMF) | 550 m | 440 m | 150 m | Limetten-Grün |

> **OM5** unterstützt WDM (Wellenlängenmultiplexing) mit kurzen Wellenlängen — ermöglicht 400G über ein einziges Faserpaar.

---

## Singlemode-Typen (OS-Klassen)

| Klasse | Dämpfung | Anwendung |
|--------|---------|-----------|
| OS1 | ≤ 1 dB/km bei 1310 nm | Indoor, strukturierte Verkabelung |
| OS2 | ≤ 0,4 dB/km bei 1310 nm | Outdoor, Weitverkehr, niedrige Dämpfung |

---

> ⚠️ **Achtung-Falle**: **Singlemode-Fasern und Multimode-Fasern sind physisch inkompatibel** — Stecker passen zwar (beide oft LC/SC), aber ein SM-Sender an einer MM-Faser erzeugt massive Verluste. Immer auf Kabelbeschriftung/Farbe achten!

> ⚠️ **Achtung-Falle**: Glasfaser überträgt Licht — **kein** elektrisches Signal. Daher keine elektromagnetischen Störungen (EMI), kein Crosstalk, galvanische Trennung. Ideal für Verbindungen zwischen Gebäuden (Blitzschutz!).

---

## Dämpfungsbudget-Rechnung (Grundprinzip)

\`\`\`
Gesamt-Dämpfungsbudget = TX-Leistung − Empfänger-Empfindlichkeit

Beispiel SFP-Modul: TX = −3 dBm, RX-Empfindlichkeit = −20 dBm
→ Budget = 17 dB

Kabelstrecke 300 m OM3: 0,3 km × 3,5 dB/km = 1,05 dB
Stecker (2×): 2 × 0,5 dB = 1 dB
Spleißstellen (0×): 0 dB
Gesamt: 2,05 dB → ✅ deutlich unter 17 dB Budget
\`\`\`
  `.trim(),
};

// ── Concept 5: Glasfaser Stecker & Transceiver ───────────────

export const CONCEPT_GLASFASER_STECKER_TRANSCEIVER: Concept = {
  id: "glasfaser-stecker-transceiver",
  title: "Glasfaser-Stecker, Transceiver, DAC & AOC",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "fiber",
    "lc",
    "sc",
    "sfp",
    "qsfp",
    "transceiver",
    "dac",
    "aoc",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 1.3 | ⏱️ 20 Min

---

## Glasfaser-Steckertypen

| Stecker | Form | Arretierung | Einsatz | Merkmal |
|---------|------|-------------|---------|---------|
| **LC** (Lucent Connector) | Duplex-Clip | Push-Pull | SFP, SFP+, QSFP | Standard Datacenter |
| **SC** (Subscriber Connector) | Quadratisch | Push-Pull | ältere Geräte, GPON | "Square Connector" |
| **ST** (Straight Tip) | Rund | Bajonett-Drehverschluss | Legacy LAN, Outdoor | Veraltet |
| **MPO/MTP** | Multi-Faser (8/12/24) | Push-Pull | OM3/4/5 40G/100G | Hochdichte Verkabelung |
| **FC** (Ferrule Connector) | Rund | Schraubanschluss | Messtechnik, Telekom | Vibrationssicher |

> **LC ist der Marktstandard** in modernen Datacentern und bei SFP+-Modulen.

---

## Transceiver-Typen

| Formfaktor | Max. Datenrate | Anschluss | Typischer Einsatz |
|-----------|---------------|-----------|------------------|
| **SFP** (Small Form-factor Pluggable) | 1 Gbit/s | LC Duplex | Access-Switches, 1G Links |
| **SFP+** | 10 Gbit/s | LC Duplex | Distribution/Core, 10G |
| **SFP28** | 25 Gbit/s | LC Duplex | Server-Anbindung 25G |
| **QSFP+** | 40 Gbit/s | MPO-12 | Spine/Core-Switches |
| **QSFP28** | 100 Gbit/s | MPO-12 | Datacenter Core, 100G |
| **QSFP-DD** | 400 Gbit/s | MPO-16 | Hyperscale-Datacenter |

> Cisco verwendet für SFP/SFP+ die Bezeichnung **"GLC-SX-MMD"** (1G MM), **"SFP-10G-SR"** (10G MM), **"SFP-10G-LR"** (10G SM).

---

## DAC- und AOC-Kabel — kostengünstige Alternativen

### DAC — Direct Attach Copper
- Passives Kupferkabel mit **fest integrierten SFP+/QSFP-Steckern** an beiden Enden
- Länge: 1–7 m (passiv bis 7 m, aktiv bis 15 m)
- Sehr günstig, sehr niedrige Latenz
- Kein Lichtweg — reines Kupfer, aber SFP-Formfaktor
- Ideal: Top-of-Rack-Switch ↔ Server in gleichen Rack

### AOC — Active Optical Cable
- Glasfaserkabel mit fest integrierten SFP+/QSFP-Transceivern (aktive Elektronik im Stecker)
- Länge: 1–100 m
- Leichter als DAC, kein EMI, größere Reichweite
- Ideal: Verbindungen zwischen benachbarten Racks

> ⚠️ **Achtung-Falle**: DAC und AOC haben **fest verbundene Stecker** — kein Austausch von Kabel und Transceiver möglich. Wenn ein Ende defekt ist, muss das gesamte Kabel ersetzt werden.

---

## Cisco-Kompatibilität

\`\`\`
! Transceiver-Info anzeigen
SW# show interfaces GigabitEthernet 0/1 transceiver
SW# show interfaces GigabitEthernet 0/1 transceiver detail

! Alle eingesteckten Transceiver anzeigen
SW# show inventory
\`\`\`

> Cisco-Switches prüfen per EEPROM, ob ein Transceiver "Cisco-approved" ist. Nicht-zertifizierte Module werden mit Warnung geladen (kann per Service-Vertrag erzwungen sein, \`service unsupported-transceiver\` deaktiviert die Warnung).
  `.trim(),
};

// ── Concept 6: Verkabelungs-Praxis ───────────────────────────

export const CONCEPT_VERKABELUNG_PRAXIS: Concept = {
  id: "verkabelung-praxis",
  title: "Praxis: Patchpanel, strukturierte Verkabelung & Messtechnik",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "patch-panel",
    "structured-cabling",
    "wiremap",
    "next",
    "tdr",
    "lsa",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐ | Exam Topic: 1.3 | ⏱️ 15 Min

---

## Patchpanel aufschluss — LSA-Technik

Ein Patchpanel verbindet die Festverkabelung (in der Wand) mit den aktiven Netzwerkgeräten (im Rack). Jede Dose wird auf der Rückseite des Panels eingeschnitten ("aufgelegt").

**LSA-Leiste (LSA-Plus / IDC)**:
- Steht für **L**öt- **S**chraub- **A**der-Anschluss (englisch: IDC = Insulation Displacement Connector)
- Die Ader wird **ohne Abisolieren** in den Schlitz gedrückt — die Klinge schneidet durch die Isolation
- Werkzeug: **Auflegegerät (Anschlagwerkzeug / Punch-Down-Tool)**
  - Ein Ende "Schneiden" (Cut), anderes Ende "Kein Schneiden"
  - Farbcode 568B beachten: orange, grün, blau, braun Paare

**Fehler beim Auflegen:**
- Verdrillung zu früh aufgelöst (max. 13 mm vor Anschlusspunkt laut TIA-568)
- Falsches Farbschema (568A/B vertauscht)
- Ader nur halb eingedrückt → schlechter Kontakt

---

## Strukturierte Verkabelung (ISO 11801 / EN 50173)

### Die drei Ebenen

| Ebene | Bezeichnung | Verbindet | Max. Länge |
|-------|------------|-----------|------------|
| Primärverkabelung | Campus-Backbone | Gebäude untereinander | 2000 m (MM) / 60 km (SM) |
| Sekundärverkabelung | Gebäude-Backbone | Stockwerke / Gebäudeverteiler | 500 m |
| Tertiärverkabelung | Horizontale Verkabelung | Endgerätedose ↔ Stockwerkverteiler | max. 90 m (festes Kabel) + 10 m Patch |

> Die 90+10 m Regel: 90 m festes Kabel in der Wand + max. 10 m Patchkabel = 100 m Gesamtstrecke.

---

## Messtechnik — was ein Kabeltester misst

### Wiremap
Prüft, ob jeder Pin korrekt mit dem entsprechenden Pin am anderen Ende verbunden ist.

| Fehler | Ursache |
|--------|---------|
| Open | Ader unterbrochen |
| Short | Zwei Adern kurzgeschlossen |
| Crossed pair | Paare vertauscht (häufig 568A/B-Verwechslung) |
| Split pair | Adern verschiedener Paare gekreuzt → schlechtes NEXT |
| Reversed pair | Ader innerhalb eines Paares vertauscht (Polarität) |

### NEXT (Near-End Crosstalk)
Übersprechen zwischen Aderpaaren am Messgerät-Ende. Wird in dB angegeben — je höher, desto besser (weniger Störung).

### Return Loss
Signalreflexionen durch Impedanzunregelmäßigkeiten. Hoch = gut (viel Verlust = wenig Reflexion).

### Attenuation (Insertion Loss)
Signalverlust über die Strecke. Niedrig = gut.

### Length / TDR
Time-Domain-Reflectometry — misst Kabellänge und findet Unterbrechungen durch Laufzeitmessung.

---

## Cisco-Diagnose-Befehle

\`\`\`
! Kabeldiagnose auf Catalyst-Switch
SW# test cable-diagnostics tdr interface GigabitEthernet 0/1
SW# show cable-diagnostics tdr interface GigabitEthernet 0/1

! Ergebnis zeigt: Pair, Ergebnis (OK/Open/Short), Länge in Metern
\`\`\`
  `.trim(),
};

// ── Concept 7: Glasfaser Sicherheit & FTTx ───────────────────

export const CONCEPT_GLASFASER_SICHERHEIT_FTTX: Concept = {
  id: "glasfaser-sicherheit-fttx",
  title: "Glasfaser: Sicherheit, Abhören & FTTx-Architekturen",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "fiber",
    "security",
    "ftth",
    "fttb",
    "fttc",
    "olt",
    "bending",
    "tapping",
    "lszh",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐ | Exam Topic: 1.3 | ⏱️ 15 Min

---

## 🔒 Glasfaser — Kann man sie abhören?

Glasfaser gilt als "abhörsicher", aber das stimmt nur bedingt. Es gibt reale Angriffsmethoden:

### Bending (Kabelbiegen)
Wird der **Mindestbiegeradius** unterschritten, tritt ein Teil des Lichts seitlich aus dem Faserkern aus. Mit einem empfindlichen optischen Sensor direkt am gebogenen Kabel lässt sich das ausgetretene Licht empfangen und dekodieren — ohne die Verbindung zu unterbrechen.

### Tapping (physisches Anzapfen)
Angreifer können eine Glasfaserleitung aufschneiden und eine **optische Abzweigung (Optical Splitter)** einschleusen, die einen Teil des Signals abgreift. Da moderne Empfänger nur 1–2 % der optischen Leistung benötigen, kann ein solcher Verlust beim legitimen Empfänger unbemerkt bleiben.

### Glasfaser als Mikrofon
Akustische Signale (Schall) in der Umgebung des Kabels beeinflussen die Lichtsignale messbar. Forscher haben gezeigt, dass Gespräche in Kabel-Nähe als Audiodaten rekonstruiert werden können.

### Schutzmaßnahmen

| Maßnahme | Beschreibung |
|----------|-------------|
| **Ende-zu-Ende-Verschlüsselung** | Effektivster Schutz — Daten auch bei physischem Zugriff unlesbar |
| **Optisches Monitoring** | Systeme messen Dämpfungsverluste kontinuierlich — Abweichungen lösen Alarm aus |
| **Physische Sicherheit** | Kabeltrassen überwachen, Sicherheitsummantelungen, Zugangskontrolle |

> ⚠️ **Achtung-Falle**: Glasfaser ≠ abhörsicher. Verschlüsselung (TLS, MACsec) ist immer erforderlich, nicht optional!

---

## 📡 FTTx — Fiber to the X

Das **X** steht für den Endpunkt der Glasfaserleitung. Je weiter Glasfaser reicht, desto höher die Bandbreite.

| Abkürzung | Bedeutung | Glasfaser endet bei | Letzte Meile | Typische Technik |
|-----------|-----------|---------------------|--------------|-----------------|
| **FTTH** | Fiber to the **Home** | Wohnung / Büro (Dose) | – (100 % Glasfaser) | GPON, XGS-PON |
| **FTTB** | Fiber to the **Building** | Gebäudekeller (APL) | Kupfer im Haus | VDSL2, G.fast |
| **FTTC** | Fiber to the **Curb** | Straßenverteiler (MFG) | Kupfer bis Dose | VDSL2 |

> **FTTH** = beste Leistung, da kein Kupferanteil auf der letzten Meile. Die Deutsche Telekom setzt bei Neuausbau bevorzugt auf FTTH.

### OLT — Optical Line Transmitter
An den FTTx-Übergangspunkten wandelt ein **OLT** (Optical Line Transmitter) optische Signale in elektrische um (und umgekehrt). Der OLT im Straßenverteiler (FTTC) oder Gebäudekeller (FTTB) ist der "Übersetzer" zwischen Glasfaser- und Kupfernetz.

---

## Glasfaser — Warum keine Notstromversorgung?

Glasfaser überträgt **kein elektrisches Signal** — keine Elektrizität fließt durch das Kabel. Das bedeutet:
- **Stromausfall** → Alarmanlagen/Notrufdienste über Glasfaser funktionieren nicht
- Lösung: Notstromversorgung (USV) am OLT / ONT **und** optionaler Rückfallkanal (Mobilfunk, Kupfer-PSTN)

> ⚠️ **Achtung-Falle**: Analoges Kupfernetz (PSTN) lieferte Strom über die Leitung — Glasfaser tut das nicht. In neuen FTTH-Installationen ist eine separate Notstromquelle Pflicht.
  `.trim(),
};

// ── Concept 8: Glasfaser Dämpfung, Reinigung & LSZH ──────────

export const CONCEPT_GLASFASER_REINIGUNG_LSZH: Concept = {
  id: "glasfaser-reinigung-lszh",
  title: "Glasfaser: Dämpfungsarten, Farbtabelle, Reinigung & LSZH",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: [
    "cabling",
    "fiber",
    "attenuation",
    "insertion-loss",
    "return-loss",
    "cleaning",
    "lszh",
    "color-code",
    "layer-1",
  ],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐ | Exam Topic: 1.3 | ⏱️ 20 Min

---

## 📉 Glasfaser-Dämpfungsarten

Bei Glasfasern unterscheidet man drei Arten von Dämpfung:

### 1. Attenuation (klassische Dämpfung)
- **Definition**: Leistungsabfall des optischen Signals zwischen Eingangs- und Ausgangsseite
- **Einheit**: Dezibel (dB) — je **niedriger**, desto besser
- **Ursachen**: Absorption, Reflexion, Streuung, Dispersion, Diffusion
- Glasfaser hat deutlich geringere Dämpfung als Kupferkabel
- Bei zu kurzen Strecken kann Dämpfung sogar **erwünscht sein** → Dämpfungsglieder (Attenuatoren)

### 2. Insertion Loss (Eingangsdämpfung)
- **Definition**: Gesamtverlust durch Hinzufügen von Komponenten (Stecker, Koppler, Spleißstellen)
- **Merkregel**: Qualitätskabel haben Insertion Loss < 0,3 dB
- Jeder Stecker, jeder Spleißpunkt addiert Verlust zum Gesamtbudget

### 3. Return Loss (Reflexionsdämpfung / Fresnel Loss)
- **Definition**: Licht, das an Verbindungsstellen zur Quelle zurückreflektiert wird
- Auch "Fresnel Reflection Loss" oder "Fresnel Loss"
- Return Loss ist **minimal**, wenn:
  - Faserkerne exakt ausgerichtet sind
  - Stecker/Spleißstellen einwandfrei ausgeführt sind
  - Keine Verschmutzungen vorhanden sind
- **Einheit**: dB — je **höher**, desto besser (wie bei Kupfer)

> ⚠️ **Achtung-Falle**: Bei Dämpfung (Attenuation) gilt "niedriger = besser", bei Return Loss gilt "höher = besser". Beide werden in dB gemessen — Kontext beachten!

---

## 🌈 Glasfaser-Farbtabelle

Farben geben schnellen Aufschluss über Glasfasertyp und Polierstil:

| Farbe | Bedeutung |
|-------|----------|
| **Gelb** | Singlemode (OS1/OS2) |
| **Orange** | Multimode OM1/OM2 |
| **Aqua/Türkis** | Multimode OM3/OM4 |
| **Limetten-Grün** | Multimode OM5 (WBMMF) |

### Stecker-/Kupplungsfarben (Polierstil)

| Farbe | Polierstil | Schliff | Return Loss |
|-------|-----------|---------|-------------|
| **Blau** | PC / UPC (Ultra Physical Contact) | Gerade (0°) | ~40–55 dB |
| **Grün** | APC (Angled Physical Contact) | 8° Schräge | ~60–65 dB |

> **APC (Grün)** hat deutlich besseren Return Loss durch den 8° Schrägschliff — reflektiertes Licht wird in den Mantel geleitet statt zurück zur Quelle. Nicht mit PC/UPC kombinieren!

---

## 🧹 Glasfaser reinigen — Warum und wie?

**98 % aller Verbindungsausfälle** sind auf Verschmutzungen zurückzuführen (Studie NTT-Advanced Technology).

### Was reinigen?
- **Glasfaserferrulen**: Steckerenden — Staub/Fett blockiert das Lichtsignal
- **Glasfaseradapter**: Kupplungen, in denen sich Partikel ansammeln
- **Geräteanschlüsse**: SFP-Transceiver und Geräteports ebenfalls reinigen

### Wann reinigen?
- Vor der ersten Installation (auch neue Kabel!)
- Nach dem Abziehen und Wiederanschließen — beim Abziehen wandert Schmutz vom Rand in die Mitte der Ferrule
- **Nicht** bei dauerhaft gesteckten, unangetasteten Kabeln notwendig

### Ablauf (Pflicht!): **Inspektion → Reinigung → Inspektion**
Erst inspizieren (z.B. Glasfaser-Mikroskop/Inspektionskamera), dann reinigen, dann erneut prüfen ob sauber.

### Reinigungswerkzeuge

| Werkzeug | Einsatz | Vorteil |
|---------|---------|---------|
| **Spulenreiniger** | Ferrulen unterschiedlicher Größen | Tuch austauschbar, wiederverwendbar |
| **Klick-Reiniger (1,25 mm)** | LC, MU-Stecker | Einfach, auch Adapter reinigbar |
| **Klick-Reiniger (2,5 mm)** | SC, ST-Stecker | Einfach, auch Adapter reinigbar |
| **Klick-Reiniger (MPO)** | MPO/MTP-Stecker | Spezialisiert für Multifaser |
| **Reinigungsstäbchen** | Transceiver-Ports | Geringstes Risiko für Beschädigung |

---

## 🔥 LSZH — Low Smoke Zero Halogen

**LSZH** beschreibt eine Materialklasse für Kabelmäntel:

| Eigenschaft | PVC (alt) | LSZH (modern) |
|-------------|-----------|---------------|
| Brandfall | Produziert Chlorwasserstoff (HCl) | Kein Halogen, kaum Rauch |
| Reaktion mit Löschmittel | Salzsäure → gefährlich für Mensch + Geräte | Keine Salzsäurebildung |
| Rauchentwicklung | Stark | Minimal |

### Wo wird LSZH eingesetzt?
- **Historisch**: Flugzeuge, U-Boote (enge Räume, viele Menschen)
- **Heute**: Rechenzentren, Serverräume, moderne Gebäudeverkabelung
- **Zukunft**: LSZH wird PVC als Standard-Kabelmaterial ersetzen

> ⚠️ **Achtung-Falle**: LSZH ≠ feuerfest. LSZH-Kabel können brennen — sie produzieren jedoch deutlich weniger giftigen Rauch. In Fluchtwegen und sicherheitskritischen Bereichen sind LSZH-Kabel gesetzlich vorgeschrieben.
  `.trim(),
};

// ── Concept 9: Lernguide Verkabelung ─────────────────────────

export const CONCEPT_VERKABELUNG_GUIDE: Concept = {
  id: "verkabelung-guide", // keep id for backwards compatibility
  title: "Lernguide: Verkabelung — Anker bis Selbsttest",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["cabling", "guide", "rj45", "fiber", "structured-cabling", "layer-1"],
  content: `
## Lernziele

Nach diesem Modul kannst du:
- Den Unterschied zwischen UTP-, F/UTP- und S/FTP-Kabeln erklären
- Die richtigen Kabelkategorien für verschiedene Szenarien auswählen
- T568A und T568B korrekt belegen und den Unterschied zwischen Straight-Through und Crossover erklären
- Singlemode von Multimode unterscheiden und OM/OS-Klassen zuordnen
- Steckertypen (LC, SC, ST, MPO) und Transceiver (SFP, SFP+, QSFP+) benennen
- Eine einfache Kabelmessung interpretieren (Wiremap, NEXT, Attenuation)

---

## Praxis-Szenario

Die Firma "TechStart GmbH" zieht in ein neues Bürogebäude (3 Stockwerke, je 40 Mitarbeiter). Aufgabe:

**Erdgeschoss (EG)**: 40 Workstations, Drucker, VoIP-Telefone → **Cat 6 U/UTP**, Patchpanel 48-Port, Cisco Catalyst 2960

**Obergeschoss 1 (OG1)**: 40 Workstations + 5 Server → **Cat 6a F/UTP**, separates Patchpanel

**Serverraum (EG)**: Verbindung zwischen allen drei Stockwerk-Switches und dem Core-Switch → **OM4 Glasfaser** (LC/LC, duplex), Cisco Catalyst 3650 Core

**Verbindung zum Provider-Router**: **OS2 Singlemode**, LC/LC, SFP-LR-Modul

---

## Canvas-Übung

Erstelle eine Topologie mit:
- 1 Core-Switch (Serverraum)
- 3 Access-Switches (EG, OG1, OG2)
- Bezeichne alle Kabeltypen (Cat6/Cat6a/OM4/OS2) an den Verbindungen
- Füge je 3 Endgeräte pro Stockwerk ein
- Markiere: Tertiärverkabelung (grün), Sekundärverkabelung (blau), Primärverkabelung (rot)

---

## Häufige Fehler & Achtung-Fallen

> ⚠️ **Achtung-Falle**: Crossover-Kabel sind mit modernen Cisco-Switches dank Auto-MDI-X **nicht mehr nötig** — trotzdem Prüfungsthema!

> ⚠️ **Achtung-Falle**: T568A und T568B beschreiben **nur die Reihenfolge der Aderfarben** am Stecker. Ob du 568A oder 568B nimmst, ist egal — Hauptsache **beide Enden des Kabels sind identisch**. (Ausnahme: Crossover-Kabel = ein Ende 568A, anderes 568B.)

> ⚠️ **Achtung-Falle**: "CAT" ist eine **UL/TIA-Klassifizierung**, während "Klasse" die ISO/IEC-Bezeichnung ist. Cat6a = ISO Klasse EA. In der Praxis wird "Cat" weltweit verwendet.

> ⚠️ **Achtung-Falle**: Das Rollover-Kabel (hellblau, Cisco) ist **kein Ethernet-Kabel**. Es geht in den **Console-Port**, nicht in den Ethernet-Port!

---

## Verständnisfragen (Selbsttest)

1. Welches Kabel würdest du wählen, um zwei Cisco Catalyst 2960-Switches direkt zu verbinden — und warum ist die Frage heute weniger relevant als vor 10 Jahren?
2. Du misst auf einer Cat 5e Strecke ein NEXT von 42 dB. Ist das ein Problem? (Minimum laut TIA-568C für Cat5e bei 100 MHz: 35,3 dB)
3. Erkläre den Unterschied zwischen OM4 und OS2 Glasfaser in einem Satz.
4. Warum darf ein Kabel in der Wand (Festverkabelung) maximal 90 m lang sein, obwohl 100 m der Standard sind?

*(Antworten im Quiz verfügbar)*
  `.trim(),
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_VERKABELUNG: Topic = {
  id: "verkabelung",
  title: "Verkabelung (Kupfer)",
  description:
    "Twisted-Pair-Kategorien, RJ45-Pinbelegung, strukturierte Verkabelung und Messtechnik — Layer-1 Kupferinfrastruktur. Glasfaser hat ein eigenes Thema.",
  conceptIds: [
    "kupfer-twisted-pair",
    "kupfer-kategorien",
    "kupfer-stecker-pinbelegung",
    "verkabelung-praxis",
    "verkabelung-guide",
    "verkabelung-trainer",
  ],
  quizIds: [],
  exerciseIds: [],
  prerequisiteTopicIds: ["networking-fundamentals"],
  estimatedMinutes: 70,
  tags: [
    "cabling",
    "layer-1",
    "copper",
    "rj45",
    "structured-cabling",
  ],
  lessonSummary: {
    mustKnow: [
      "CAT5e supports 1 Gbit/s up to 100 m; CAT6 supports 10 Gbit/s up to 55 m (or 1 Gbit/s up to 100 m)",
      "UTP pairs are twisted to cancel electromagnetic interference (EMI); tighter twist = better noise rejection",
      "T568A and T568B are two pin-out standards for RJ-45; mixing them on each end of a cable creates a crossover cable",
      "Auto-MDIX automatically detects and corrects straight-through vs. crossover; enabled by default when speed and duplex are both 'auto'",
      "Structured cabling limits: horizontal cable max 90 m permanent link + 10 m patch cables = 100 m total channel",
    ],
    bestPractice: [
      {
        topic: "Cable standard consistency",
        practice:
          "Use T568B throughout a building — it is the more common enterprise standard; never mix T568A and T568B within the same installation.",
      },
      {
        topic: "Cable testing",
        practice:
          "After termination, always test with a cable certifier (not just a continuity tester) to verify attenuation, NEXT, and return loss meet CAT6 specs.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "Manual crossover cables",
        reason:
          "Required before Auto-MDIX to connect like devices (switch-to-switch, router-to-router); modern Cisco switches support Auto-MDIX by default",
        replacedBy: "Auto-MDIX (IEEE 802.3ab)",
      },
      {
        topic: "CAT3 / CAT5 (non-e)",
        reason:
          "CAT3 limited to 10 Mbit/s; CAT5 limited to 100 Mbit/s; neither supports Gigabit reliably",
        replacedBy: "CAT5e (minimum) or CAT6/6A for new installations",
      },
    ],
    fastFacts: [
      "T568B pin order: Orange-white, Orange, Green-white, Blue, Blue-white, Green, Brown-white, Brown. Verify: hold the crimp end with the clip facing down",
      "A cable with T568B on one end and T568A on the other end is a crossover cable — useful for direct PC-to-PC or hub-to-hub connections. Verify: wiring map test",
      "The 100 m limit (90 m permanent + 10 m patch) applies to all UTP categories. Exceeding it causes attenuation failures. Verify: cable certifier attenuation measurement",
    ],
  },
};

export const TOPIC_GLASFASER: Topic = {
  id: "glasfaser",
  title: "Glasfaser (Fiber Optic)",
  description:
    "Singlemode vs. Multimode, Stecker, Transceiver, DAC/AOC, FTTx-Architekturen, Dämpfung, Farbtabelle und Reinigung.",
  conceptIds: [
    "glasfaser-grundlagen",
    "glasfaser-stecker-transceiver",
    "glasfaser-sicherheit-fttx",
    "glasfaser-reinigung-lszh",
  ],
  quizIds: ["ccna-quiz-glasfaser"],
  exerciseIds: [],
  prerequisiteTopicIds: ["verkabelung"],
  estimatedMinutes: 90,
  tags: ["cabling", "layer-1", "fiber", "sfp"],
  lessonSummary: {
    mustKnow: [
      "Single-Mode Fiber (SMF, yellow jacket, 9 μm core) supports distances > 10 km with laser light; used for campus backbone and WAN handoffs",
      "Multi-Mode Fiber (MMF, orange/aqua jacket, 50/62.5 μm core) is limited to ~550 m (OM3/OM4) with LED/VCSEL; used for intra-building runs",
      "SFP transceivers are hot-swappable; SFP+ supports 10 Gbit/s; QSFP/QSFP28 support 40/100 Gbit/s",
      "Fiber connectors: LC (small form, enterprise standard), SC (square, older), ST (bayonet), MPO (multi-fiber, data center)",
    ],
    bestPractice: [
      {
        topic: "Fiber end-face cleaning",
        practice:
          "Always clean fiber end-faces before connecting with a cassette cleaner or IEC 61300-3-35 compliant tool; a contaminated end-face causes >3 dB insertion loss and intermittent link failures.",
      },
      {
        topic: "SMF vs. MMF selection",
        practice:
          "Use SMF for all inter-building and campus backbone runs > 300 m; MMF only within a building where cost and distance allow.",
      },
    ],
    legacyOrExamOnly: [
      {
        topic: "ST connectors",
        reason:
          "Bayonet-twist-lock connector from the 1980s; larger than LC, requires two separate fibers; still found in legacy installations but no longer specified for new work",
        replacedBy: "LC duplex connectors",
      },
      {
        topic: "62.5 μm MMF (OM1)",
        reason:
          "Only supports 275 m at 1 Gbit/s and ~33 m at 10 Gbit/s; older campus installations; not suitable for 10G or 25G modern switches",
        replacedBy: "50 μm MMF (OM3/OM4/OM5)",
      },
    ],
    fastFacts: [
      "SMF uses yellow jackets (OS1/OS2); OM1 is orange; OM3 is aqua; OM4 is violet/magenta; OM5 is lime green. Verify: check jacket color before patching",
      "Never look directly into a fiber end-face or connector — even 'dark' fiber may carry invisible IR laser light that can permanently damage eyesight. Verify: use a fiber checker/VFL at low power only",
      "An SFP mismatch (SMF SFP on MMF cable) causes high insertion loss and link instability — check 'show interface <int> transceiver' for Tx/Rx power levels. Verify: show interface transceiver",
    ],
  },
};

// ── Exports ───────────────────────────────────────────────────

const CONCEPT_VERKABELUNG_TRAINER: Concept = {
  id: "verkabelung-trainer",
  title: "Verkabelungs-Trainer",
  appliesTo: ["ccna"],
  tags: ["cabling", "layer-1", "trainer", "interactive"],
  content: `## Verkabelungs-Trainer

Der interaktive Verkabelungs-Trainer testet dein Wissen über Layer-1-Infrastruktur:

- Kabeltypen und Einsatzbereiche (Straight-Through, Crossover, Rollover)
- Stecker und Pinbelegungen (RJ-45, LC, SC, ST, MPO)
- Glasfaser-Kategorien (SMF vs. MMF, OS2 vs. OM4)
- SFP/QSFP-Transceiver-Auswahl für gegebene Distanz- und Bandbreitenanforderungen

**Starte den Trainer** über den Button im Topic-Bereich.`.trim(),
};

export const VERKABELUNG_CONCEPTS: Record<string, Concept> = {
  "kupfer-twisted-pair": CONCEPT_KUPFER_TWISTED_PAIR,
  "kupfer-kategorien": CONCEPT_KUPFER_KATEGORIEN,
  "kupfer-stecker-pinbelegung": CONCEPT_KUPFER_STECKER_PINBELEGUNG,
  "glasfaser-grundlagen": CONCEPT_GLASFASER_GRUNDLAGEN,
  "glasfaser-stecker-transceiver": CONCEPT_GLASFASER_STECKER_TRANSCEIVER,
  "glasfaser-sicherheit-fttx": CONCEPT_GLASFASER_SICHERHEIT_FTTX,
  "glasfaser-reinigung-lszh": CONCEPT_GLASFASER_REINIGUNG_LSZH,
  "verkabelung-praxis": CONCEPT_VERKABELUNG_PRAXIS,
  "verkabelung-guide": CONCEPT_VERKABELUNG_GUIDE,
  "verkabelung-trainer": CONCEPT_VERKABELUNG_TRAINER,
};

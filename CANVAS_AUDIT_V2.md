# Canvas-Modul — Audit v2 (Mai 2026)

> Erstellt: 26. Mai 2026  
> Basis: AUDIT_CANVAS.md (2. Mai 2026) — dieser Audit **ergänzt**, ersetzt nicht.  
> Schwerpunkt: **Integration Canvas ↔ Topic-Lernfluss**

---

## Prämisse

Das Canvas-Feature ist **keine** begrenzt ausgebaute Funktion.  
Es ist eine vollwertige **Network Simulation Suite** (~20 000 LOC):

| Schicht | Komponenten |
|---------|-------------|
| Renderer | HTML5-Canvas, world↔screen-Transform, Viewport-Culling-Ansatz |
| Shapes | 78 SVG-Shapes in 11 Kategorien (network, cloud, security, azure, aws, …) |
| Simulation | `networking-engine.ts` (IP/CIDR/ARP/ICMP/TTL), `network-simulator.ts` (Hop-by-Hop) |
| Tools | SubnettingDrill, SubnetSegmentation, IPv6Calculator, VlanSimulator, VerkabelungTrainer, TerminalEmulator (Cisco IOS) |
| Didaktik | 11 Built-in-Templates (5 Infra + 6 Educational), Template Gallery mit Suche/Filter |
| Lernfluss | LearningPath + LearningStep + ProgressTracker; Quiz per Modul |

**Was begrenzt ist**, ist die **Verknüpfung** zwischen Topic-Lernfluss und den vorhandenen Tools.  
Topics und Canvas leben weitgehend nebeneinander statt miteinander.

---

## Delta seit Audit v1 (2. Mai 2026)

### ✅ Umgesetzte P1/P2-Items

| Item | Commit | Status |
|------|--------|--------|
| Template-Platzierung am Viewport + groupId-Anker | `0bf27fb` | ✅ |
| Didaktische Template-Galerie (edu-Kategorie, 6 Vorlagen) | `3d3c51d` | ✅ |
| Select-Tool Drag für Vorlage-Gruppen | `024991c` | ✅ |
| IPv6-Rechner & Drill in IPv6-Topic verlinkt | `54d4b9c`, `fcfe0e4` | ✅ |
| EUI-64 XOR-Erklärer + Präfix-Drill + Binär-Tab | `b259bff`, `5c01d96`, `15d7c8a` | ✅ |
| QuizDialog in TopicDetailPanel eingebunden | `8d1a6e1` | ✅ |
| Immediate per-question feedback in QuizDialog | `569e259` | ✅ |
| SubnettingDrill: Segmentierungs-Modus | `54d4b9c` | ✅ |
| FloatingToolbar: Minimize + Select-All | `e2a2267`, `34ed231` | ✅ |
| Lernseite Netzwerk-Segmentierung + VLSM-Planer | `f18725a` | ✅ |
| Verkabelung: Glasfaser Tag 8 Lesson | `5658c9c` | ✅ |
| CCNA 200-301 v1.1 Curriculum Alignment (16 Commits) | `2923f18` | ✅ |

### ❌ Noch nicht umgesetzte P1-Items aus v1

| Item | Severity (v1) | Anmerkung |
|------|---------------|-----------|
| RAF-basiertes Rendering (Dirty-Flag) | P1 | Weiterhin `useEffect`-Redraw |
| Undo/Redo inkl. Connections | P1 | Noch `objects[]`-only |
| Zod-Schema für JSON-Import | P1 | `importFromJSON` ohne Validierung |
| ErrorBoundary um `<Canvas>` | P1 | Fehlt |
| LRU-Cache für SVG-Images | P1 | Map ohne Eviction |
| Touch/Pinch-Zoom | P2 | Keine Touch-Events |
| Step-Mode PacketFlowVisualizer | P2 | Nur Auto-Play |
| ARIA/Keyboard-Navigation | P2 | Kein `tabIndex`, keine `role` |
| Canvas-spezifische Tests | P2 | Weiterhin 0 Tests |

---

## 1.1 Funktions-Audit

### Vorhanden

| Funktion | Komponente | Notiz |
|----------|-----------|-------|
| Freies Zeichnen (Pen, Eraser, Geo-Shapes, Text) | `Canvas.tsx` | Stable |
| Shape-Bibliothek (78 Shapes) | `ShapePicker.tsx` + `shapes.ts` | Vollständig für CCNA/Cloud |
| Verbindungen mit Port-Snap | `connection-utils.ts` | Typ-kompatibel (Compatibility-Matrix) |
| Pan/Zoom (Wheel + LMB) | `Canvas.tsx` | Wheel-Zoom seit `3c13d1c` |
| Multi-Selection, Gruppen, Layer | `Canvas.tsx` | Stabil |
| Copy/Paste, Resize-Handles | `Canvas.tsx` | Funktioniert |
| Snap-to-Grid, Snap-to-Shape | `Canvas.tsx` | Aktiv |
| Export PNG/SVG/JSON | `canvas-utils.ts` | Produktionsreif |
| Import JSON | `canvas-utils.ts` | Ohne Validierung |
| Templates (Gallery + Custom + Suche) | `TemplateGallery.tsx` | 11 Built-in |
| Per-Subject Canvas-Persistenz | `App.tsx` (localStorage) | CCNA/AZ-900/NetworkPlus |
| Paket-Simulation (Hop-by-Hop) | `SimulationControls` + `network-simulator.ts` | Kein Step-Mode |
| PDU-Inspector (OSI-Layer) | `PDUInspector.tsx` | Voll funktional |
| Topologie-Validator | `TopologyValidator.tsx` | Rules-based |
| Annotationen (Sticky) | `AnnotationLayer.tsx` | 5 Typen |
| MiniMap | `MiniMap.tsx` | Immer sichtbar |
| Cisco IOS Terminal-Emulator | `TerminalEmulator.tsx` | Modal, ~1515 LOC |
| SubnettingDrill (30 generierte Aufgaben) | `SubnettingDrillDialog.tsx` | In ipv4-Topic verlinkt |
| SubnetSegmentationTool (VLSM) | `SubnetSegmentationTool.tsx` | In subnet-seg-Topic verlinkt |
| IPv6-Rechner + Drill | `IPv6CalculatorDialog.tsx` | In ipv6-Topic verlinkt |
| VLAN-Simulator (802.1Q Frame-Vivisektor) | `VlanSimulatorDialog.tsx` | In vlan-advanced-Topic verlinkt |
| Verkabelungs-Trainer | `VerkabelungTrainerDialog.tsx` | In verkabelung-Topic verlinkt |

### Fehlend / Eingeschränkt (mit Blueprint-Referenz)

| Funktion | Fehlend | Lernwert | Aufwand | Blueprint |
|----------|---------|----------|---------|-----------|
| Step-Mode PacketFlowVisualizer | Nur Auto-Play; kein Pause/Prev/Next | Hoch | M | 3.4, 1.5 |
| TerminalEmulator als Topic-CTA | Tool existiert, ist nicht verlinkt | Hoch | **S** | alle CLI-Topics |
| STP-Interaktiv (Root Bridge wählen) | Kein Template, kein geführter Modus | Hoch | M | 2.5 |
| OSPF-Multi-Area-Template | Kein Template (nur basic-lan recycelt) | Hoch | **S** | 3.4 |
| VLAN/Trunk-Template | VlanSimulator existiert, aber kein Canvas-Template | Mittel | **S** | 2.1 |
| NAT Inside/Outside-Template | Kein Template | Mittel | **S** | 4.3 |
| Wireless WLC+AP-Layout-Template | Kein Template | Mittel | **S** | 2.8 |
| Canvas-Template-Button in Topic | Mechanismus fehlt | Hoch | **S** | übergreifend |
| IPv6 Dual-Stack-Template | Kein Template | Niedrig | S | 1.9 |
| Touch/Pinch-Zoom | Keine Touch-Events | Niedrig | L | — |
| ARIA/Keyboard-Navigation | Keine | Niedrig | L | — |

---

## 1.2 Architektur-Audit

### F-ARCH-1 (bestätigt aus v1) — App.tsx Monolith

**Datei:** `src/App.tsx` · **LOC:** 2 229  
**Befund:** 15+ `useState`-Flags für UI-Panels, gesamte Canvas-State-Verwaltung, Persistierung, Simulation-Bridging — alles in einer Datei. Prop-Drilling über 4–5 Ebenen.  
**Konsequenz:** Jedes neue Feature verlängert App.tsx weiter. Kollaborationsedits werden schwieriger.  
**Severity:** L  
**Aktion in dieser PR:** Nur als Finding dokumentiert. Refactor-Diskussion läuft separat.

### F-TECH-1 (bestätigt aus v1) — Null Canvas-Tests

**Dateien:** `networking-engine.ts` (1 279 LOC), `network-simulator.ts` (450 LOC), `canvas-utils.ts` (572 LOC), `connection-utils.ts` (281 LOC), `connection-compatibility.ts` (604 LOC), `Canvas.tsx` (1 533 LOC)  
**Tests vorhanden:** 0 von ca. 4 700 LOC Canvas-Kernlogik  
**Severity:** L  
**Konsequenz:** Regressions in Networking-Engine, Topologie-Validator oder Connection-Kompatibilität werden nicht automatisch erkannt.

### Sonstige Architektur-Befunde

| ID | Befund | Datei | Severity |
|----|--------|-------|----------|
| A-3 | `importFromJSON` ohne Schema-Check; malformed JSON kann State korrumpieren | `canvas-utils.ts` ~130 | M |
| A-4 | `svgImageCache: Map<string, HTMLImageElement>` ohne Eviction; ~78 Shapes + Custom → unbegrenzt | `canvas-utils.ts` ~7 | S |
| A-5 | Render via `useEffect` mit 15-Pointer-Dep-Array, kein RAF-Loop, kein Dirty-Flag | `Canvas.tsx` ~186 | M |
| A-6 | History speichert nur `objects[]`, nicht `connections[]` → Undo verliert alle Verbindungen | `App.tsx` ~430 | M |
| A-7 | `properties?: Record<string, any>` auf DrawingObject; Casts `as PortPosition` in Canvas | `types.ts` ~95 | S |

---

## 1.3 UX/UI-Audit

### Discoverability

| Tool | Weg vom Start | Klicks |
|------|--------------|--------|
| SubnettingDrill | Sidebar → CCNA → IPv4-Topic → CTA | 3 |
| IPv6Calculator | Sidebar → CCNA → IPv6-Topic → CTA | 3 |
| VlanSimulator | Sidebar → CCNA → VLAN Advanced-Topic → CTA | 3 |
| VerkabelungTrainer | Sidebar → CCNA → Verkabelung-Topic → CTA | 3 |
| SubnetSegmentationTool | Sidebar → CCNA → Netzwerk-Segmentierung → inline sichtbar | 3 |
| TerminalEmulator | FloatingToolbar → ??? (kein klarer Einstiegspunkt) | 5+ |
| Templates | FloatingToolbar → Template-Icon | 2 |
| PacketFlowVisualizer | FloatingToolbar → "Analyse"-Bereich | 3 |

**Befund:** Tools mit Topic-CTA sind gut findbar (3 Klicks). TerminalEmulator ist versteckt — kein direkter CTA aus einem iOS-CLI-Topic heraus.

### Onboarding / leerer Canvas

**Befund:** Beim ersten Start wird ein Welcome-Screen gezeigt (`showWelcome`). Nach dem Schließen: leeres Canvas ohne Orientierung. Kein Hinweis, wie man zum CCNA-Lernpfad kommt oder was als erstes zu tun ist. → **F-UX-1 (S)**

### Toolbar / Werkzeuge

**Stärken:** Alle Tool-Shortcuts vorhanden, Keyboard-Shortcuts-Dialog implementiert, Theme-Toggle, Grid-Toggle.  
**Lücken:** Toolbar auf <768 px nicht overflow-safe (noch nicht implementiert per v1-Audit). Kein visueller Indikator "TerminalEmulator verfügbar".

### Mobile / Touch

**Befund (unverändert seit v1):** Keine Touch-Events, kein Pinch-Zoom. Canvas auf Mobilgeräten nicht nutzbar. **F-UX-2 (L)** — kein Quick-Win.

### Accessibility

**Befund (unverändert seit v1):** Kein `tabIndex` auf Canvas-Wrapper, keine ARIA-Labels auf Toolbar-Buttons, keine `role`. Screen-Reader: Canvas-Inhalt nicht zugänglich. **F-UX-3 (L)** — kein Quick-Win.

### Bilingualität

**Befund:** App ist vollständig DE. Keine EN-Strings. Konsistent. Kein Handlungsbedarf.

### Visual Design

**Befund:** Canvas-Komponenten folgen dem Dark/Light-Theme konsistent. Tailwind-Klassen konsistent mit restlicher App. Kein visuelles Delta.

---

## 1.4 Content-Coverage-Audit — Topic ↔ Tool-Verknüpfung

> Frage: Welche Topic-Datei könnte ein bestehendes Canvas-Element auslösen, tut es aber nicht?

### Integrations-Mechanismus (verstanden)

`TopicDetailPanel.tsx` prüft, ob die Topic's `conceptIds`-Liste bestimmte **virtuelle Concept-IDs** enthält (Feature-Flags). Ist die Flag da, rendert die Komponente einen CTA-Button.

```ts
// Aktuelle Feature-Flags in TopicDetailPanel.tsx (Zeile 99–104):
const hasSubnettingDrill    = topic.conceptIds.includes("subnetting-drill");
const hasIPv6Calculator     = topic.conceptIds.includes("ipv6-calculator");
const hasVerkabelungTrainer = topic.conceptIds.includes("verkabelung-trainer");
const hasVlanSimulator      = topic.conceptIds.includes("vlan-simulator");
const hasSubnetSegTool      = topic.conceptIds.includes("subnet-seg-tool");

// NICHT vorhanden:
// hasTerminalEmulator  → kein Flag, kein CTA, kein Import
// hasCanvasTemplate    → kein Mechanismus, Canvas-Template-ID im Exercise-Schema vorhanden
//                        aber TopicDetailPanel rendert keine Canvas-Template-CTA
```

### Mapping: Topic → Tool → Status

| Topic-Datei | Tool | Virtual-Flag in conceptIds? | CTA in TopicDetailPanel? | Gap? |
|-------------|------|-----------------------------|--------------------------|------|
| `ipv4-addressing.ts` | SubnettingDrillDialog | ✅ `"subnetting-drill"` | ✅ | — |
| `subnet-segmentation.ts` | SubnetSegmentationTool | ✅ `"subnet-seg-tool"` | ✅ | — |
| `ipv6.ts` | IPv6CalculatorDialog | ✅ `"ipv6-calculator"` | ✅ | — |
| `vlan-advanced.ts` | VlanSimulatorDialog | ✅ `"vlan-simulator"` | ✅ | — |
| `verkabelung.ts` | VerkabelungTrainerDialog | ✅ `"verkabelung-trainer"` | ✅ | — |
| **`switching-vlans.ts`** | VlanSimulatorDialog | ❌ Flag fehlt | ❌ | **F-INT-1** |
| **`ios-cli.ts`** | TerminalEmulator | ❌ Kein Flag definiert | ❌ kein CTA | **F-INT-2** |
| **`routing-ospf.ts`** | Canvas-Template öffnen | ❌ Kein Mechanismus | ❌ kein CTA | **F-INT-3** |
| `subnet-segmentation.ts` | SubnettingDrillDialog | ❌ Nur in `relatedConceptIds`, nicht `conceptIds` | ❌ | **F-INT-4** |
| `dhcp-nat.ts` | PacketFlowVisualizer | ❌ Kein Mechanismus | ❌ kein CTA | F-INT-5 (Roadmap) |
| `networking-fundamentals.ts` | Canvas-Template (ARP/Ping) | ❌ Kein Mechanismus | ❌ kein CTA | F-INT-6 (Roadmap) |

### Topic-interne Canvas-Übungshinweise ohne Tool-Link

Mehrere Topics enthalten Fließtext-Abschnitte "Canvas-Übung:", die auf das Canvas hinweisen, aber keinen Button öffnen. Inkonsistent mit dem CTA-Muster der anderen Topics.

| Topic | Textstelle |
|-------|-----------|
| `switching-vlans.ts` | `## Canvas-Übung` im Guide-Concept (Zeile ~185) |
| `ios-cli.ts` | `## Canvas-Übung` im Guide-Concept (Zeile ~200) |
| `routing-ospf.ts` | `## Canvas-Übung` im Guide-Concept |
| `subnet-segmentation.ts` | `VLSM-Subnetting-Design` als Exercise-Text |

**Befund:** Der Text sagt dem Lerner "geh zum Canvas", aber kein Button navigiert oder öffnet ein Tool → **Lernfluss-Unterbrechung**.

### Blueprint-Coverage durch vorhandene Templates

| Blueprint-Topic | Template vorhanden | Lücke |
|-----------------|-------------------|-------|
| 1.1 OSI/TCP-IP | `tpl-edu-osi-encapsulation` ✅ | — |
| 1.5 ARP | `tpl-edu-ping-arp` ✅ | — |
| 1.6 Subnetting | `tpl-edu-warum-subnetting` ✅ | — |
| 1.9 IPv6 | ❌ | Dual-Stack-Template fehlt |
| 2.1 VLANs/Trunk | ❌ | VLAN+Trunk-Template fehlt |
| 2.5 STP/RSTP | ❌ | Root Bridge Election fehlt |
| 2.8 Wireless WLC | ❌ | WLC+AP-Template fehlt |
| 3.4 OSPF-Areas | ❌ | Multi-Area-Template fehlt |
| 4.1 DHCP | `tpl-edu-dhcp-dora` ✅ | — |
| 4.3 NAT | ❌ | NAT Inside/Outside fehlt |
| 4.5 TCP | `tpl-edu-tcp-handshake` ✅ | — |
| 5.0 DMZ/ACL | `tpl-dmz` ✅ | — |

---

## 1.5 Konsolidierte Findings

| ID | Dimension | Finding | Severity | Quick-Win? |
|----|-----------|---------|----------|-----------|
| **F-INT-1** | Integration | `switching-vlans.ts` hat "Canvas-Übung"-Text aber keine `"vlan-simulator"`-Flag → VlanSimulatorDialog wird nicht getriggert | M | **J** |
| **F-INT-2** | Integration | `ios-cli.ts` hat "Canvas-Übung"-Text + TerminalEmulator existiert, aber kein CTA in TopicDetailPanel (kein Flag, kein Import, keine `useState`) | M | **J** |
| **F-INT-3** | Integration | `routing-ospf.ts` verweist auf Canvas-Übung, aber es gibt keinen Mechanismus um aus einem Topic ein Canvas-Template zu laden | M | **J** |
| **F-INT-4** | Integration | `subnet-segmentation.ts` listet `"subnetting-drill"` nur in `relatedConceptIds`, nicht in `conceptIds` → Drill-Button erscheint nicht | S | **J** |
| **F-TMPL-1** | Content | Fehlende CCNA-Templates: OSPF Multi-Area, VLAN/Trunk, STP Root Bridge, NAT, WLC+AP, IPv6 Dual-Stack | M | **J** (4 davon) |
| **F-TECH-1** | Architektur | 0 Tests für ~4 700 LOC Canvas-Kernlogik (`networking-engine`, `network-simulator`, `canvas-utils`, `connection-utils`) | L | N |
| **F-ARCH-1** | Architektur | `App.tsx` monolithisch (2 229 LOC), Prop-Drilling, kein Store | L | N |
| **F-TECH-2** | Technik | Undo/Redo: History nur `objects[]`, Connections gehen beim Undo verloren | M | N |
| **F-TECH-3** | Technik | JSON-Import ohne Zod-Validierung; malformed Import kann State korrumpieren | M | N |
| **F-TECH-4** | Technik | SVG-Cache ohne Eviction (`Map` ohne LRU) | S | N |
| **F-TECH-5** | Technik | `useEffect`-Render ohne RAF-Loop; kein Dirty-Flag | M | N |
| **F-UX-1** | UX | Leerer Canvas nach Welcome-Screen: keine Orientierung wo der CCNA-Lernpfad startet | S | **J** |
| **F-UX-2** | UX | Keine Touch/Pinch-Events → mobil nicht nutzbar | L | N |
| **F-UX-3** | UX | Kein ARIA, kein `tabIndex`, Screen-Reader-blind | L | N |
| **F-SIM-1** | Didaktik | PacketFlowVisualizer: nur Auto-Play, kein Step-Mode / Pause / Replay | M | N |

---

## Hinweis für Phase 2

Quick-Win-Kriterien (alle drei müssen zutreffen):  
1. Implementierungsaufwand ≤ 1 Stunde Agent-Zeit  
2. Kein Schema-Change, kein API-Bruch  
3. Klarer Lern- oder UX-Wert für CCNA-Kandidaten

Aus den Findings sind **Quick-Win-Kandidaten:**  
`F-INT-1`, `F-INT-2`, `F-INT-3`, `F-INT-4`, `F-TMPL-1` (teilweise), `F-UX-1`

Alle anderen Findings gehen in den **Roadmap-später**-Abschnitt.

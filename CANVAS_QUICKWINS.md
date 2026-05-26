# Canvas Quick-Win Backlog

> Erstellt: 26. Mai 2026  
> Basis: CANVAS_AUDIT_V2.md (Phase 1)  
> Branch: `feature/canvas-audit-and-quickwins`

---

## Vorab-Klärungen (Präzisierungen aus Freigabe-Review)

### F-INT-3 — Variante A vs. Variante B

**Frage:** Gibt es eine Variante A (TemplateGallery-Modal mit vorgefilterter Template-ID), die den bestehenden Mechanismus nutzt?

**Analyse:**

`TemplateGallery.tsx` hat aktuell keine `initialTemplateId`-Prop. `TopicDetailPanel.tsx` hat keinen Callback zur `App.tsx`-Ebene, der `setShowTemplateGallery` auslösen könnte. Aber:

- `TemplateGallery` hat bereits einen `previewTemplate: CanvasTemplate | null`-State — initial `null`.  
- Die `interface TemplateGalleryProps` ist klein und gut erweiterbar.  
- `App.tsx` verwaltet `showTemplateGallery` und hat direkten Zugriff auf `BUILT_IN_TEMPLATES`.  
- Das conceptId-Pattern `"canvas-template:<id>"` kann ohne Schema-Änderung als virtuelles Flag in `conceptIds` eingetragen werden.

**Variante A ist realisierbar:**

| Schritt | Datei | Aufwand |
|---------|-------|---------|
| `initialTemplateId?: string` zu `TemplateGalleryProps` hinzufügen, bei Mount `previewTemplate` setzen | `TemplateGallery.tsx` | ~5 Zeilen |
| TopicDetailPanel erkennt `"canvas-template:<id>"` in `conceptIds`, zeigt CTA, ruft neuen `onOpenTemplate?(id)` Callback auf | `TopicDetailPanel.tsx` | ~15 Zeilen |
| In `App.tsx`: `onOpenTemplate` übergeben, setzt `pendingTemplateId` + `setShowTemplateGallery(true)`, `TemplateGallery` bekommt `initialTemplateId` | `App.tsx` | ~10 Zeilen |

**Urteil: Variante A → Quick-Win (QW-4).** Gesamtaufwand S, 3 Dateien, ~30 Zeilen.

**Variante B** (dedizierter Topic→Template-Loader mit eigenem Modal, eigenem State, eigener Routing-Logik) wäre ein separates Feature. Nicht nötig.

**Einschränkung für routing-ospf.ts:** F-INT-3 betrifft *den Mechanismus*. Das OSPF-Multi-Area-Template (`tpl-edu-ospf-areas`) existiert noch nicht → die eigentliche Flag in `routing-ospf.ts` kann erst landen, wenn das Template gebaut ist. Das Template ist in Roadmap-später (s.u.). **QW-4 liefert den Mechanismus; erste Demo-Nutzung erfolgt mit QW-5a (VLAN/Trunk-Template).**

---

### F-INT-1 vs. F-INT-2 — Warum mehr Code-Anbindung?

**F-INT-1 (switching-vlans + vlan-simulator):**

```
switching-vlans.ts — conceptIds:
+ "vlan-simulator"    ← 1 Zeile, 1 Datei
```

`VlanSimulatorDialog` ist **bereits** in `TopicDetailPanel.tsx` importiert, hat bereits einen `useState`, hat bereits einen CTA-Block und wird bereits als Dialog gerendert (für `vlan-advanced`). F-INT-1 ist reines Content-Wiring. **Aufwand: XS.**

**F-INT-2 (ios-cli + TerminalEmulator):**

`TerminalEmulator` ist in `TopicDetailPanel.tsx` **nicht** importiert, hat keine `useState`, keinen CTA-Block, keinen Dialog-Render. Alles fehlt:

```ts
// Was hinzukommt in TopicDetailPanel.tsx:
import { TerminalEmulator } from "./TerminalEmulator";         // Import
const [terminalOpen, setTerminalOpen] = useState(false);      // State
const hasTerminalEmulator = topic.conceptIds.includes("ios-terminal"); // Flag
// + CTA-Button-Block (~15 Zeilen)
// + Dialog-Render-Block (~8 Zeilen)
```

Hinzu kommt die `TerminalEmulatorProps`-Eigenheit: `shape: DrawingObject | null` ist ein **Required-Prop**, das für canvas-gebundene Geräte gedacht ist. In standalone-Nutzung (Topic-Popup ohne Canvas-Shape) muss `shape={null}` übergeben werden. Die Callbacks `onUpdateHistory` und `onUpdateConfig` werden mit leeren Funktionen belegt.

**Konsequenz im Standalone-Modus (`shape=null`):**  
- Vollwertiges Cisco IOS CLI-Terminal funktioniert ✅  
- IOS-Befehle (`show`, `conf t`, `interface`, `ip address`, ...) funktionieren ✅  
- Terminal-History wird **nicht** in einem Canvas-Shape gespeichert (kein Canvas-Objekt vorhanden) — das ist für Lern-Kontext akzeptabel ✅  
- Canvas-Simulation wird nicht beeinflusst — das ist erwartet für ein Topic-Popup ✅

**Urteil: F-INT-2 bleibt Quick-Win** (nicht "Quick-Win mit Vorbehalt" im Sinne eines Blockers). Aufwand ist S statt XS, aber klar im S-Bereich. Die conceptId-Mechanik wird genutzt. Standalone-Modus ist funktional vollständig für den Lernzweck.

---

## Quick-Win Backlog — Umsetzungsreihenfolge

### QW-1 — vlan-simulator-Flag in switching-vlans.ts

| | |
|---|---|
| **Finding** | F-INT-1 |
| **Titel** | VlanSimulator-CTA für Switching & VLANs Topic |
| **Dateien** | `src/content/modules/ccna/topics/switching-vlans.ts` |
| **Aufwand** | XS (~5 min) |
| **Änderung** | `conceptIds` in `TOPIC_SWITCHING_VLANS` um `"vlan-simulator"` erweitern |
| **Akzeptanzkriterium** | VlanSimulatorDialog-CTA erscheint im "Switching & VLANs"-Topic; bereits vorhandene Funktion im VLAN Advanced-Topic unverändert |
| **Kein Risiko** | VlanSimulatorDialog ist bereits importiert, hat State, CTA, Dialog in TopicDetailPanel |

---

### QW-2 — subnetting-drill-Flag in subnet-segmentation.ts

| | |
|---|---|
| **Finding** | F-INT-4 |
| **Titel** | SubnettingDrill-CTA für Netzwerk-Segmentierung Topic |
| **Dateien** | `src/content/modules/ccna/topics/subnet-segmentation.ts` |
| **Aufwand** | XS (~5 min) |
| **Änderung** | `"subnetting-drill"` aus `relatedConceptIds` eines Concepts herausnehmen und in `conceptIds` von `TOPIC_SUBNET_SEGMENTATION` aufnehmen |
| **Akzeptanzkriterium** | SubnettingDrillDialog-CTA erscheint im "Netzwerk-Segmentierung"-Topic; SubnettingDrill-Funktion selbst unverändert |
| **Hinweis** | `relatedConceptIds` im Concept kann bleiben — das ist korrekte Nutzung für Cross-Referenz-Rendering |

---

### QW-3 — TerminalEmulator-CTA in TopicDetailPanel + ios-terminal Flag

| | |
|---|---|
| **Finding** | F-INT-2 |
| **Titel** | Cisco IOS Terminal-CTA für IOS CLI Topic |
| **Dateien** | `src/components/TopicDetailPanel.tsx`, `src/content/modules/ccna/topics/ios-cli.ts` |
| **Aufwand** | S (~25 min) |
| **Änderungen** | (1) `import { TerminalEmulator } from "./TerminalEmulator"` hinzufügen; (2) `const [terminalOpen, setTerminalOpen] = useState(false)` + `const hasTerminalEmulator = topic.conceptIds.includes("ios-terminal")`; (3) CTA-Button-Block (Farbe: orange, Emoji: `>_`); (4) Dialog-Render mit `shape={null}`, leere Handler; (5) `"ios-terminal"` zu `TOPIC_IOS_CLI.conceptIds` in ios-cli.ts |
| **Akzeptanzkriterium** | Terminal-CTA erscheint im "Cisco IOS CLI"-Topic; Klick öffnet TerminalEmulator-Modal; IOS-Befehle (`?`, `show version`, `enable`, `conf t`, `show interfaces`) sind ausführbar; Tests grün |
| **Vorbehalt (akzeptiert)** | Im Standalone-Modus läuft der Terminal ohne Canvas-Shape — History und Config-Änderungen werden nicht auf ein Canvas-Objekt zurückgeschrieben. Für Topic-Lern-Kontext ausreichend |

---

### QW-4 — Canvas-Template-CTA-Mechanismus (Variante A)

| | |
|---|---|
| **Finding** | F-INT-3 |
| **Titel** | Topic → Canvas-Template öffnen via `"canvas-template:<id>"`-Flag |
| **Dateien** | `src/components/TopicDetailPanel.tsx`, `src/components/TemplateGallery.tsx`, `src/App.tsx` |
| **Aufwand** | S (~40 min) |
| **Änderungen** | (1) `TemplateGallery`: `initialTemplateId?: string` zu Props, bei Mount `setPreviewTemplate(BUILT_IN_TEMPLATES.find(t => t.id === initialTemplateId) ?? null)`; (2) `TopicDetailPanel`: `onOpenTemplate?: (id: string) => void` zu Props; conceptIds scannen auf `"canvas-template:"` Präfix, CTA-Button rendern, Callback aufrufen; (3) `App.tsx`: `onOpenTemplate` Prop an TopicDetailPanel übergeben; Handler setzt `setShowTemplateGallery(true)` + `setPendingTemplateId(id)` (neuer `useState`); `initialTemplateId={pendingTemplateId}` an `TemplateGallery` übergeben |
| **Akzeptanzkriterium** | Ein Topic mit `conceptIds: ["canvas-template:tpl-edu-vlan-trunk-ris"]` zeigt einen "Topologie auf Canvas öffnen"-CTA; Klick öffnet TemplateGallery mit dem VLAN/Trunk-Template vorausgewählt (im Preview-Modus); Lerner klickt "Anwenden" → Template landet auf Canvas; Tests grün |
| **Abhängigkeit** | Erste Demo-Nutzung mit `tpl-edu-vlan-trunk-ris` aus QW-5a; für routing-ospf.ts folgt Flag erst wenn OSPF-Template fertig (Roadmap-später) |
| **Kein Schema-Change** | `conceptIds: string[]` existiert bereits — Pattern `"canvas-template:<id>"` ist rein konventionell |

---

### QW-5a — VLAN/Trunk/Router-on-a-Stick Canvas-Template

| | |
|---|---|
| **Finding** | F-TMPL-1 (Priorisierung: höchster Prüfungs-Impact CCNA 2.1) |
| **Titel** | Didaktisches Template: VLAN + Trunk + Router-on-a-Stick |
| **Dateien** | `src/lib/collaboration-engine.ts`, `src/content/modules/ccna/topics/switching-vlans.ts` |
| **Aufwand** | S (~40 min) |
| **Template-ID** | `tpl-edu-vlan-trunk-ris` |
| **Inhalt** | 1× Router (`router`, "R1-RoaS"), 2× Switch (`switch`, "SW1", "SW2"), 3× PC (`computer`, "PC-VLAN10", "PC-VLAN20", "PC-VLAN30"), Trunk-Verbindung R1↔SW1 (Beschriftung "Trunk 802.1Q"), Trunk-Link SW1↔SW2, Access-Verbindungen zu PCs; Text-Labels "VLAN 10 – Sales", "VLAN 20 – IT", "VLAN 30 – Mgmt" |
| **Akzeptanzkriterium** | Template in Gallery unter Kategorie `"education"`, Tag `"vlan"`, Difficulty `"beginner"`; mit QW-4-Mechanismus aus switching-vlans.ts direkt öffenbar; nach "Anwenden" sind alle Shapes korrekt platziert und als Gruppe verschiebbar |
| **CCNA-Blueprint** | 2.1 Configure and verify VLANs and interVLAN routing |

---

### QW-5b — STP Root Bridge Election Canvas-Template

| | |
|---|---|
| **Finding** | F-TMPL-1 (Priorisierung: hoch visualisierbar, CCNA 2.5) |
| **Titel** | Didaktisches Template: STP Root Bridge Election |
| **Dateien** | `src/lib/collaboration-engine.ts`, `src/content/modules/ccna/topics/switching-vlans.ts` |
| **Aufwand** | S (~35 min) |
| **Template-ID** | `tpl-edu-stp-root-bridge` |
| **Inhalt** | 3× Switch (`switch`, "SW1 Priority 4096 (Root)", "SW2 Priority 32768", "SW3 Priority 32768"), Verbindungen mit Port-Cost-Labels ("Cost 4", "Cost 4", "Cost 8"), Text-Label "Root Bridge Election: niedrigste Bridge-ID gewinnt", Blocked-Port-Annotation auf einem redundanten Link |
| **Akzeptanzkriterium** | Template in Gallery unter Kategorie `"education"`, Tags `["stp", "spanning-tree"]`, Difficulty `"intermediate"`; mit QW-4-Mechanismus aus switching-vlans.ts aufrufbar; Port-Cost-Beschriftungen lesbar |
| **CCNA-Blueprint** | 2.5 Describe the purpose of Spanning Tree Protocol (STP) |

---

## Umsetzungsreihenfolge

```
QW-1  →  QW-2  →  QW-3  →  QW-5a  →  QW-4  →  QW-5b
 XS        XS        S         S          S         S
```

**Begründung der Reihenfolge:**
- QW-1 und QW-2 sind unabhängige Einzeiler → sofort, kein Risiko.
- QW-3 (TerminalEmulator) ist unabhängig von den Template-Items → früh liefern, da eigenständiger Wert.
- QW-5a vor QW-4, weil QW-4 für seine erste sinnvolle Demo-Nutzung das VLAN-Template braucht.
- QW-5b nach QW-4, weil das Template dann direkt mit dem neuen Mechanismus verdrahtet werden kann.

---

## Roadmap-später

Diese Items aus dem Audit sind **keine** Quick-Wins — entweder zu komplex, zu riskant oder zu niedrige Priorität für diesen PR.

### Templates (F-TMPL-1 Rest)

| Template-ID | Blueprint | Warum Roadmap-später |
|-------------|-----------|---------------------|
| `tpl-edu-ospf-multiarea` | 3.4 | Benötigt ~12 Shapes (Router, ABR, ASBR, mehrere Netze) + korrekte OSPF-Kosten-Beschriftung. Fachlich heikel: falsche Topologie ist schlechter als keine. Benötigt Fachreview. |
| `tpl-edu-nat-pat` | 4.3 | NAT Inside/Outside/DMZ-Zonen + Übersetzungstabelle als Canvas-Annotation. Visualisierung der PAT-Ports ist komplex. Erst nach tpl-dmz-Review. |
| `tpl-edu-wlc-ap` | 2.8 | WLC-Shape fehlt in `shapes.ts` (nur `access-point` vorhanden, kein Cisco WLC). Erst WLC-Shape bauen, dann Template. Zwei separate Items. |

### Architektur / Technik

| Finding | Warum Roadmap-später |
|---------|---------------------|
| F-ARCH-1 (App.tsx Monolith) | Refactor mit hohem Bruch-Risiko. Erfordert State-Migration (Zustand, Jotai, o.ä.), sorgfältige Planung. Separater Sprint. |
| F-TECH-1 (0 Canvas-Tests) | Hoher Invest: Mocking von Canvas-API, `HTMLCanvasElement`, `getContext`. Sinnvoll aber kein Quick-Win. |
| F-TECH-2 (Undo/Redo Connections) | Undo-Stack-Format muss geändert werden → alle History-Einträge inkompatibel → Migration nötig. |
| F-TECH-3 (Zod JSON-Import) | Zod bereits als Dev-Dependency? Prüfen. Wenn ja: S. Wenn nein: neue Dependency → Abstimmung nötig. |
| F-TECH-5 (RAF-Rendering) | Tiefgreifende Änderung an `Canvas.tsx` Render-Loop. Regression-Risiko ohne Tests (s. F-TECH-1) hoch. |

### UX / Accessibility

| Finding | Warum Roadmap-später |
|---------|---------------------|
| F-UX-1 (Onboarding/leerer Canvas) | Medium-Aufwand, Design-Entscheidung nötig (Welcome-Flow vs. contextual hints). |
| F-UX-2 (Touch/Pinch) | Komplette Touch-Event-Schicht auf Canvas.tsx; erfordert Pointer-Events-Refactor. L. |
| F-UX-3 (ARIA/Keyboard) | Systematische Arbeit über alle Canvas-Komponenten. L. |
| F-SIM-1 (PacketFlow Step-Mode) | Refactor des Simulations-State-Machine. M, aber kein Lernfluss-Blocker für CCNA-Text-Topics. |

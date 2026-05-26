# UX-/Layout-/Didaktik-Audit — CCNA Canvas App
**Datum:** 2026-05-26  
**Scope:** Dark-Mode, Desktop-Browser, CCNA 200-301 Lernfluss  
**Out-of-Scope:** Mobile-Ansicht (separate Roadmap), Light-Mode-Konsistenz (späterer Audit)  
**Screenshots:** 10 (Inventar abgenickt), inkl. Nachlieferung QW-3/QW-4-Ergebnis-Screenshots

---

## 1.A — Erster Eindruck (erste 30 Sekunden)

### Was ist die App, wo fange ich an?
Beim ersten Öffnen sieht der Nutzer entweder die Topic-Liste (wenn Sidebar offen) oder das Canvas (wenn direkt navigiert). Die Topic-Liste (SS1) ist strukturell klar — nummerierte Karten, Metadaten (Konzepte · Fragen · Zeit) — aber das **Canvas als Einstiegsscreen** (SS5) vermittelt keinen klaren nächsten Schritt.

### Visuelle Hierarchie Header
Die Header-Leiste (SS1, SS2) zeigt **10 Navigationselemente** auf einer Zeile:  
`Lernpfade` | `Gerät` · `CLI` · `Paketfluss` · `Simulation` · `Prüfen` · `Metriken` | `Notizen` · `Vorlagen` · `Teilen` · `$`

Im Code sind dünne 1-px-Divider zwischen den Gruppen vorhanden — visuell jedoch so subtil, dass sie in der Bildschirmaufnahme nicht auffallen. Für einen CCNA-Lerner, der primär lesen und quizzen will, sind sieben der zehn Elemente Canvas-Werkzeuge, die beim Lesemodus rauschen.

> **Einschränkung:** Header ist in `App.tsx` implementiert (2229 LOC, F-ARCH-1) → direkte Änderungen sind **off limits** in dieser Iteration.

### Leeres Canvas (SS5)
Das Keyboard-Shortcuts-Overlay (`Canvas.tsx` Zeile 1610–1641) wird **immer** gerendert — unabhängig davon, ob Objekte auf dem Canvas sind. Es dominiert das obere linke Viertel des Bildschirms und gibt dem Nutzer den Eindruck, er müsse zuerst Shortcuts lernen, bevor er loslegen kann. Ein Einstiegshinweis ("← Thema öffnen · Vorlage laden · Shape ziehen") fehlt komplett.

### Farbpalette / Typografie
Konsistent dunkel, gutes Kontrastverhältnis für Body-Text. Code-Blocks in Konzepten gut abgesetzt (monospace, dunkler Hintergrund). Keine Konsistenzprobleme beobachtet.

---

## 1.B — Lernfluss (Topics → Quiz → Canvas)

### Positive Befunde (aus Nachlieferungs-Screenshots)
- **SS10 (IOS CLI Terminal-CTA):** Orange CTA-Block „Cisco IOS Terminal" erscheint ganz oben im Topic-Panel, noch vor der Konzeptliste. Prominenz und Kontext-Reihenfolge sind optimal. Der Non-Persistenz-Hinweis in Orange ist sichtbar und klar.
- **SS9 (VLAN-Trunk-RoaS auf Canvas):** Template lädt korrekt, VLAN-Zonen farbkodiert (blau/grün/lila), CLI-Hinweistexte am unteren Rand lesbar. Verbindungslabels (Gi0/0 Trunk 802.1Q) korrekt zugeordnet. Didaktisch sauber umgesetzt.
- **SS4 (Subnetting-Drill):** Modal-UX clean. Zwei Tabs, Aufgaben-Counter, Placeholder-Texte klar. Keine UI-Probleme erkennbar.

### Leere Cross-References Section
Jedes Topic-Panel (SS3) endet mit dem Abschnitt „Cross-References (0)" + Italic-Text „Keine Cross-References für dieses Topic." — auch für Topics, die keinerlei Cross-Refs haben. Das ist visuelles Rauschen am Ende des Panels und impliziert einem Lerner fälschlicherweise, dass ein Feature existiert, das gerade leer ist.

**Ursache:** `TopicDetailPanel.tsx` Zeile 747–800 rendert den `<section>`-Block bedingungslos; erst innerhalb wird auf `crossRefs.length === 0` geprüft.

### Quiz-Preview (SS3)
"23 Fragen — 3 davon sichtbar, +20 weitere" ist akzeptabel. Die Preview gibt genug Kontext für die Entscheidung „Quiz starten oder nicht". Kein kritisches Finding.

### Topic-Panel CTA-Reihenfolge (Switching & VLANs)
Aktuell: `hasSubnettingDrill` → `hasVlanSimulator` → `hasTerminalEmulator` → `canvasTemplateIds`. Für Switching & VLANs heißt das: VLAN-Simulator zuerst (Zeile 328), dann Template-CTAs (Zeile 414). Da das Canvas-Template eine komplexere Lernaktivität ist als der Modal-Simulator, könnte die Reihenfolge diskutiert werden — für jetzt kein zwingender Quick-Win.

---

## 1.C — Canvas-Bedienung

### Keyboard-Shortcuts-Overlay (SS5, SS6)
Das Overlay (`Canvas.tsx` ~Zeile 1610) ist ein statisches `div` ohne Visible-Flag. Es erscheint auf dem leeren Canvas (SS5) als dominantes Element und bleibt auch sichtbar, wenn Shapes auf dem Canvas liegen (SS6 zeigt es nicht, weil der Screenshot wahrscheinlich nach einem Dismiss gemacht wurde — aber aus dem Code ist klar: kein conditionaler Render). Für geübte Nutzer ist es Rauschen; für Einsteiger ist es uneinladend als Einstiegsschirm.

### FloatingToolbar (SS6)
Die Toolbar zeigt ~20 Icons in einer Reihe. **Positive Nachricht:** `FloatingToolbar.tsx` nutzt bereits `<Separator orientation="vertical">` an mehreren Stellen (Zeilen 234, 273, 484, 553, 713, 863). Die Separatoren haben jedoch `className="bg-slate-700 h-8 mx-1"` — im Dark-Mode-Screenshot sind sie kaum sichtbar, weil Toolbar-Hintergrund ebenfalls `bg-slate-900/90` ist (delta ≈ 1 Graustufe). Ein Kontrast-Boost auf `bg-slate-600` würde die Gruppen sichtbar gliedern.

### Packet-Flow-Panel (SS8)
Öffnet als rechtes Side-Panel, verdeckt ~30 % des Canvas. Worker Node 3 verschwindet aus dem Sichtfeld. Das ist eine architektonische Entscheidung (side-panel vs. overlay), kein Quick-Win.

---

## 1.D — Konsolidierte Findings

| ID | Bereich | Finding | Screenshot | Severity | Fix-Aufwand | Quick-Win? |
|---|---|---|---|---|---|---|
| F-UX-A1 | A | Header: 10 Nav-Elemente ohne erkennbare visuelle Gruppen; Canvas-Tools dominieren auch im Lese-Modus | SS1 | **M** | 60 min (App.tsx) | **N** — App.tsx off limits |
| F-UX-A2 | A | Leeres Canvas: kein Einstiegshinweis, kein „Erste Schritte"-CTA | SS5 | **M** | 25 min (Canvas.tsx) | **J** |
| F-UX-A3 | A | Keyboard-Shortcuts-Overlay immer sichtbar — auch bei befülltem Canvas, dominiert Leerzustand | SS5, SS6 | **S** | 15 min (Canvas.tsx) | **J** (mit A2 kombinierbar) |
| F-UX-B1 | B | ✅ Terminal-CTA prominent, non-persistenz hint korrekt | SS10 | — | — | — (bereits gelöst) |
| F-UX-B2 | B | Cross-References Section rendert immer — leerer Zustand ist visuelles Rauschen | SS3 | **S** | 15 min (TopicDetailPanel.tsx) | **J** |
| F-UX-B3 | B | ✅ VLAN-Template Canvas-Ergebnis: korrekt, VLAN-Zones lesbar, Subinterface-Labels ok | SS9 | — | — | — (bereits gelöst) |
| F-UX-C1 | C | Toolbar-Separatoren: vorhanden, aber bg-slate-700 auf bg-slate-900 → kaum erkennbar | SS6 | **S** | 15 min (FloatingToolbar.tsx) | **J** |
| F-UX-C2 | C | Packet-Flow-Panel überdeckt Canvas ohne Resize; Worker Node 3 verschwindet | SS8 | **S** | 90 min+ (Architektur) | **N** — Roadmap |

**Severity-Legende:** L = kritisch (blockt Lernfluss), M = stört, S = minor/polish

---

## Roadmap-Later (begründet nicht in dieser Iteration)

| ID | Finding | Grund für Zurückstellung |
|---|---|---|
| F-UX-A1 | Header Nav-Gruppen sichtbarer machen | App.tsx (F-ARCH-1) — off limits; separate Refactor-Session geplant |
| F-UX-C2 | Packet-Flow-Panel als resizable/overlay | Architektur-Änderung (Canvas + Panel-Layout), > 90 min, kein Quick-Win-Kriterium |
| Mobile UX | Out-of-Scope dieser Iteration | Separate Roadmap-Position vereinbart |
| Light-Mode | Out-of-Scope dieser Iteration | Späterer Audit vereinbart |

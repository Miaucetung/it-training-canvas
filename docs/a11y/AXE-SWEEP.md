# axe-Lauf über alle Hauptansichten und Dialoge

Erzeugt von `scripts/e2e/a11y-sweep.mjs` und `scripts/e2e/a11y-sweep-report.mjs` (nur lesend; axe-core mit allen Regeln inkl. Farbkontrast, Dev-Server, Edge). Es wurde nichts geändert; im Canvas-Code (`src/components/canvas-v2/`, `src/lib/topology/`) bleiben Befunde reine Liste.

**116 Läufe (29 Ansichten × 4 Kombinationen): 108 ohne Verstöße, 8 mit Verstößen.**

## Ergebnis je Ansicht

| Ansicht | Bereich | 1440 dunkel | 1440 hell | 390 dunkel | 390 hell |
|---|---|---|---|---|---|
| Dashboard | App | ✓ | ✓ | ✓ | ✓ |
| Header: Lernen-Menü | App | ✓ | ✓ | ✓ | ✓ |
| Header: Navigation/Werkzeuge-Menü | App | ✓ | ✓ | ✓ | ✓ |
| Lektion | Lektion | ✓ | ✓ | ✓ | ✓ |
| Prüfungstrainer: Menü | Trainer | ✓ | ✓ | ✓ | ✓ |
| Prüfungstrainer: Frage mit Grafik (Lernmodus) | Trainer | ✓ | ✓ | ✓ | ✓ |
| Prüfungstrainer: Ergebnis (Prüfungsmodus) | Trainer | ✓ | ✓ | ✓ | ✓ |
| Priorisiertes Lernen: Menü | Trainer | ✓ | ✓ | ✓ | ✓ |
| Priorisiertes Lernen: Quiz-Frage | Trainer | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Subnetting-Drill | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Routing-Drill | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: OSPF-Wildcard-Drill | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: ACL-Drill | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Subnetting-Quiz | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Subnetting-Cheatsheet | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: IPv4-Subnetztabelle | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: IPv6-Rechner | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: VLAN-Simulator | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: STP-Simulator | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: OSI-Simulator | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Routing-Simulator | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Verkabelungs-Trainer | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Drag-and-Drop-Trainer | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Topologie-Erkunder | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: CLI-Glossar | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Labs-Dialog (Liste) | Labs | ✓ | ✓ | ✓ | ✓ |
| Labs-Dialog (Lab geöffnet) | Labs | ✓ | ✓ | ✓ | ✓ |
| Canvas v1 | Canvas | label-content-name-mismatch×1, region×3 | color-contrast×1, label-content-name-mismatch×1, region×3 | label-content-name-mismatch×1, landmark-one-main×1, page-has-heading-one×1, region×3 | color-contrast×1, label-content-name-mismatch×1, landmark-one-main×1, page-has-heading-one×1, region×3 |
| Canvas v2 | Canvas v2 (nur auflisten) | label-content-name-mismatch×8, region×4 | color-contrast×1, label-content-name-mismatch×8, region×4 | label-content-name-mismatch×5, landmark-one-main×1, page-has-heading-one×1, region×2 | color-contrast×1, label-content-name-mismatch×5, landmark-one-main×1, page-has-heading-one×1, region×2 |

## Nach Regel

| Regel | Schwere | Ansichten | Läufe | Elemente |
|---|---|---:|---:|---:|
| label-content-name-mismatch | serious | 2 | 8 | 30 |
| region | moderate | 2 | 8 | 24 |
| color-contrast | serious | 2 | 4 | 4 |
| landmark-one-main | moderate | 2 | 4 | 4 |
| page-has-heading-one | moderate | 2 | 4 | 4 |

### label-content-name-mismatch (serious)

Betroffene Ansichten (2): Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Canvas v1: `.sm\:px-3` — `<button class="shrink-0 flex items-..." title="Zurück zur Lernoberf..." aria-label="Zurück zur Lernoberf...">` — Text inside the element is not included in the accessible name
- Canvas v2: `.hover\:bg-slate-800.border-slate-700.gap-1:nth-child(6)` — `<button class="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors b` — Text inside the element is not included in the accessible name
- Canvas v2: `g[data-link-id="link-trunk"]` — `<g data-link-id="link-trunk" class="topology-link cursor-pointer transition-opacity hover:opacity-95 focus:out` — Text inside the element is not included in the accessible name
- Canvas v2: `.gap-1\.5.items-center.flex:nth-child(2) > .hover\:bg-slate-100.border-slate-200.text-slate-700:nth-child(6)` — `<button class="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors b` — Text inside the element is not included in the accessible name
- Canvas v2: `g[data-link-id="link-vlan10"]` — `<g data-link-id="link-vlan10" class="topology-link cursor-pointer transition-opacity hover:opacity-95 focus:ou` — Text inside the element is not included in the accessible name

### region (moderate)

Betroffene Ansichten (2): Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Canvas v1: `.relative.h-full.overflow-hidden` — `<div class="relative w-full h-full overflow-hidden">` — Some page content is not contained by landmarks
- Canvas v1: `.text-slate-500` — `<p class="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">Canvas ist leer</p>` — Some page content is not contained by landmarks
- Canvas v1: `.mb-5` — `<p class="text-sm mb-5 text-slate-300">Womit möchtest du beginnen?</p>` — Some page content is not contained by landmarks
- Canvas v2: `.bg-slate-900\/90 > .flex-wrap.gap-2.items-center` — `<div class="flex flex-wrap items-center gap-2">` — Some page content is not contained by landmarks
- Canvas v2: `.w-10` — `<span class="text-[11px] font-mono px-1 w-10 text-center">100%</span>` — Some page content is not contained by landmarks
- Canvas v2: `.mr-0\.5` — `<span class="text-[10px] font-bold uppercase tracking-wider mr-0.5 hidden xl:inline text-slate-400">Geräte:</s` — Some page content is not contained by landmarks

### color-contrast (serious)

Betroffene Ansichten (2): Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Canvas v1: `.sm\:px-3 > .font-semibold` — `<span class="font-semibold">Lernen</span>` — Element has insufficient color contrast of 4.2 (foreground color: #1d4ed8, background color: #c1cdea, font size: 9.0pt (12px), font weight: 

### landmark-one-main (moderate)

Betroffene Ansichten (2): Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Canvas v1: `html` — `<html lang="de" class="dark">` — Document does not have a main landmark
- Canvas v1: `html` — `<html lang="de">` — Document does not have a main landmark

### page-has-heading-one (moderate)

Betroffene Ansichten (2): Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Canvas v1: `html` — `<html lang="de" class="dark">` — Page must have a level-one heading
- Canvas v1: `html` — `<html lang="de">` — Page must have a level-one heading

## Canvas v2 (nur aufgelistet)

- 1440 px dunkel: label-content-name-mismatch×8 (.sm\:px-3); region×4 (.bg-slate-900\/90 > .flex-wrap.gap-2.items-center)
- 1440 px hell: color-contrast×1 (.sm\:px-3 > .font-semibold); label-content-name-mismatch×8 (.sm\:px-3); region×4 (.bg-white\/90 > .flex-wrap.gap-2.items-center)
- 390 px dunkel: label-content-name-mismatch×5 (.sm\:px-3); landmark-one-main×1 (html); page-has-heading-one×1 (html); region×2 (.bg-slate-900\/90 > .flex-wrap.gap-2.items-center)
- 390 px hell: color-contrast×1 (.sm\:px-3 > .font-semibold); label-content-name-mismatch×5 (.sm\:px-3); landmark-one-main×1 (html); page-has-heading-one×1 (html); region×2 (.bg-white\/90 > .flex-wrap.gap-2.items-center)

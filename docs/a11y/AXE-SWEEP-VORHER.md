# axe-Lauf über alle Hauptansichten und Dialoge

Erzeugt von `scripts/e2e/a11y-sweep.mjs` und `scripts/e2e/a11y-sweep-report.mjs` (nur lesend; axe-core mit allen Regeln inkl. Farbkontrast, Dev-Server, Edge). Es wurde nichts geändert; im Canvas-Code (`src/components/canvas-v2/`, `src/lib/topology/`) bleiben Befunde reine Liste.

**116 Läufe (29 Ansichten × 4 Kombinationen): 55 ohne Verstöße, 61 mit Verstößen.**

## Ergebnis je Ansicht

| Ansicht | Bereich | 1440 dunkel | 1440 hell | 390 dunkel | 390 hell |
|---|---|---|---|---|---|
| Dashboard | App | ✓ | ✓ | ✓ | ✓ |
| Header: Lernen-Menü | App | ✓ | ✓ | ✓ | ✓ |
| Header: Navigation/Werkzeuge-Menü | App | ✓ | ✓ | ✓ | color-contrast×5 |
| Lektion | Lektion | ✓ | ✓ | landmark-one-main×1, page-has-heading-one×1, scrollable-region-focusable×16 | landmark-one-main×1, page-has-heading-one×1, scrollable-region-focusable×16 |
| Prüfungstrainer: Menü | Trainer | ✓ | ✓ | ✓ | ✓ |
| Prüfungstrainer: Frage mit Grafik (Lernmodus) | Trainer | ✓ | ✓ | ✓ | ✓ |
| Prüfungstrainer: Ergebnis (Prüfungsmodus) | Trainer | ✓ | ✓ | ✓ | ✓ |
| Priorisiertes Lernen: Menü | Trainer | color-contrast×2 | color-contrast×2 | color-contrast×2 | color-contrast×2 |
| Priorisiertes Lernen: Quiz-Frage | Trainer | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Subnetting-Drill | Werkzeuge/Simulatoren | color-contrast×4 | ✓ | color-contrast×4 | ✓ |
| Werkzeug: Routing-Drill | Werkzeuge/Simulatoren | color-contrast×1 | ✓ | color-contrast×1 | ✓ |
| Werkzeug: OSPF-Wildcard-Drill | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: ACL-Drill | Werkzeuge/Simulatoren | ✓ | color-contrast×18 | ✓ | color-contrast×18 |
| Werkzeug: Subnetting-Quiz | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Werkzeug: Subnetting-Cheatsheet | Werkzeuge/Simulatoren | empty-table-header×1, landmark-no-duplicate-banner×1, landmark-unique×1 | empty-table-header×1, landmark-no-duplicate-banner×1, landmark-unique×1 | empty-table-header×1, landmark-no-duplicate-banner×1, landmark-unique×1, scrollable-region-focusable×1 | empty-table-header×1, landmark-no-duplicate-banner×1, landmark-unique×1, scrollable-region-focusable×1 |
| Werkzeug: IPv4-Subnetztabelle | Werkzeuge/Simulatoren | color-contrast×45, scrollable-region-focusable×1 | color-contrast×67, scrollable-region-focusable×1 | color-contrast×1, scrollable-region-focusable×1 | color-contrast×20, scrollable-region-focusable×1 |
| Werkzeug: IPv6-Rechner | Werkzeuge/Simulatoren | color-contrast×10 | color-contrast×6 | color-contrast×9 | color-contrast×5 |
| Werkzeug: VLAN-Simulator | Werkzeuge/Simulatoren | color-contrast×7 | color-contrast×9 | color-contrast×7 | color-contrast×9 |
| Werkzeug: STP-Simulator | Werkzeuge/Simulatoren | select-name×4 | select-name×4 | select-name×4 | select-name×4 |
| Werkzeug: OSI-Simulator | Werkzeuge/Simulatoren | color-contrast×21, label×1, select-name×1 | color-contrast×32, label×1, select-name×1 | color-contrast×13, label×1, select-name×1 | color-contrast×20, label×1, select-name×1 |
| Werkzeug: Routing-Simulator | Werkzeuge/Simulatoren | color-contrast×2 | color-contrast×2 | color-contrast×2 | color-contrast×2 |
| Werkzeug: Verkabelungs-Trainer | Werkzeuge/Simulatoren | color-contrast×9 | color-contrast×9 | color-contrast×9 | color-contrast×9 |
| Werkzeug: Drag-and-Drop-Trainer | Werkzeuge/Simulatoren | ✓ | ✓ | button-name×3 | button-name×3 |
| Werkzeug: Topologie-Erkunder | Werkzeuge/Simulatoren | ✓ | color-contrast×1 | ✓ | color-contrast×1 |
| Werkzeug: CLI-Glossar | Werkzeuge/Simulatoren | ✓ | ✓ | ✓ | ✓ |
| Labs-Dialog (Liste) | Labs | ✓ | ✓ | ✓ | ✓ |
| Labs-Dialog (Lab geöffnet) | Labs | label-content-name-mismatch×10, nested-interactive×1 | label-content-name-mismatch×10, nested-interactive×1 | label-content-name-mismatch×5, nested-interactive×1, scrollable-region-focusable×1 | label-content-name-mismatch×5, nested-interactive×1, scrollable-region-focusable×1 |
| Canvas v1 | Canvas | label-content-name-mismatch×1, region×3 | color-contrast×1, label-content-name-mismatch×1, region×3 | label-content-name-mismatch×1, landmark-one-main×1, page-has-heading-one×1, region×3 | color-contrast×1, label-content-name-mismatch×1, landmark-one-main×1, page-has-heading-one×1, region×3 |
| Canvas v2 | Canvas v2 (nur auflisten) | label-content-name-mismatch×8, region×4 | color-contrast×1, label-content-name-mismatch×8, region×4 | label-content-name-mismatch×5, landmark-one-main×1, page-has-heading-one×1, region×2 | color-contrast×1, label-content-name-mismatch×5, landmark-one-main×1, page-has-heading-one×1, region×2 |

## Nach Regel

| Regel | Schwere | Ansichten | Läufe | Elemente |
|---|---|---:|---:|---:|
| color-contrast | serious | 14 | 41 | 390 |
| scrollable-region-focusable | serious | 4 | 10 | 40 |
| label-content-name-mismatch | serious | 3 | 12 | 60 |
| landmark-one-main | moderate | 3 | 6 | 6 |
| page-has-heading-one | moderate | 3 | 6 | 6 |
| select-name | critical | 2 | 8 | 20 |
| region | moderate | 2 | 8 | 24 |
| empty-table-header | minor | 1 | 4 | 4 |
| landmark-no-duplicate-banner | moderate | 1 | 4 | 4 |
| landmark-unique | moderate | 1 | 4 | 4 |
| label | critical | 1 | 4 | 4 |
| nested-interactive | serious | 1 | 4 | 4 |
| button-name | critical | 1 | 2 | 6 |

### color-contrast (serious)

Betroffene Ansichten (14): Priorisiertes Lernen: Menü; Werkzeug: Subnetting-Drill; Werkzeug: Routing-Drill; Werkzeug: IPv4-Subnetztabelle; Werkzeug: IPv6-Rechner; Werkzeug: VLAN-Simulator; Werkzeug: OSI-Simulator; Werkzeug: Routing-Simulator; Werkzeug: Verkabelungs-Trainer; Werkzeug: ACL-Drill; Werkzeug: Topologie-Erkunder; Canvas v1; Canvas v2; Header: Navigation/Werkzeuge-Menü

Beispiele (Selektor, Element, Meldung):

- Priorisiertes Lernen: Menü: `.bg-indigo-500\/10 > .font-semibold` — `<span class="font-semibold">Fragen üben</span>` — Element has insufficient color contrast of 3.54 (foreground color: #615fff, background color: #171e40, font size: 12.0pt (16px), font weight
- Priorisiertes Lernen: Menü: `.bg-indigo-500\/10 > .opacity-80.text-xs` — `<span class="text-xs opacity-80">1043 Fragen</span>` — Element has insufficient color contrast of 2.75 (foreground color: #5352d9, background color: #171e40, font size: 9.0pt (12px), font weight:
- Werkzeug: Subnetting-Drill: `.justify-between.items-center.flex > .text-slate-500.text-xs` — `<span class="text-xs text-slate-500">Aufgabe 1 / 30 · Score: 0 ✓</span>` — Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172b, font size: 9.0pt (12px), font weight:
- Werkzeug: Subnetting-Drill: `div:nth-child(1) > .opacity-70` — `<span class="opacity-70">IP-Adresse:&nbsp;&nbsp;</span>` — Element has insufficient color contrast of 4.37 (foreground color: #7b8ac5, background color: #1d293d, font size: 10.5pt (14px), font weight
- Werkzeug: Subnetting-Drill: `div:nth-child(2) > .opacity-70:nth-child(1)` — `<span class="opacity-70">Subnetzmaske:</span>` — Element has insufficient color contrast of 4.37 (foreground color: #7b8ac5, background color: #1d293d, font size: 10.5pt (14px), font weight
- Werkzeug: Routing-Drill: `.text-slate-500.font-mono.shrink-0` — `<span class="font-mono text-xs text-slate-500 shrink-0">R1(config)#</span>` — Element has insufficient color contrast of 3.74 (foreground color: #62748e, background color: #0f172b, font size: 9.0pt (12px), font weight:

### scrollable-region-focusable (serious)

Betroffene Ansichten (4): Werkzeug: IPv4-Subnetztabelle; Lektion; Werkzeug: Subnetting-Cheatsheet; Labs-Dialog (Lab geöffnet)

Beispiele (Selektor, Element, Meldung):

- Werkzeug: IPv4-Subnetztabelle: `.overflow-auto` — `<div class="overflow-auto p-5">` — Element should have focusable content
- Lektion: `#concept-osi-model > .items-start.gap-3.flex > .min-w-0.flex-1 > .mt-2 > .overflow-x-auto.my-2:nth-child(3)` — `<div class="overflow-x-auto my-2">` — Element should have focusable content
- Lektion: `#concept-osi-model > .items-start.gap-3.flex > .min-w-0.flex-1 > .mt-2 > pre` — `<pre class="text-xs rounded-lg p-3 my-2 font-mono overflow-x-auto bg-slate-900 border border-slate-700">` — Element should have focusable content
- Lektion: `#concept-encapsulation > .items-start.gap-3.flex > .min-w-0.flex-1 > .mt-2 > pre` — `<pre class="text-xs rounded-lg p-3 my-2 font-mono overflow-x-auto bg-slate-900 border border-slate-700">` — Element should have focusable content
- Werkzeug: Subnetting-Cheatsheet: `.overflow-x-auto` — `<div class="overflow-x-auto">` — Element should have focusable content
- Labs-Dialog (Lab geöffnet): `.bg-slate-900\/90.rounded-2xl.shadow-xs > .overflow-x-auto` — `<div class="overflow-x-auto">` — Element should have focusable content

### label-content-name-mismatch (serious)

Betroffene Ansichten (3): Labs-Dialog (Lab geöffnet); Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Labs-Dialog (Lab geöffnet): `.bg-cyan-950\/70` — `<button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors` — Text inside the element is not included in the accessible name
- Labs-Dialog (Lab geöffnet): `button[aria-label="Präsentationsmodus umschalten"]` — `<button class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors` — Text inside the element is not included in the accessible name
- Labs-Dialog (Lab geöffnet): `g[transform="translate(240, 80)"]` — `<g transform="translate(240, 80)" class="cursor-pointer group" role="button" tabindex="0" aria-label="Gerät R1` — Text inside the element is not included in the accessible name
- Canvas v1: `.sm\:px-3` — `<button class="shrink-0 flex items-..." title="Zurück zur Lernoberf..." aria-label="Zurück zur Lernoberf...">` — Text inside the element is not included in the accessible name
- Canvas v2: `.hover\:bg-slate-800.border-slate-700.gap-1:nth-child(6)` — `<button class="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors b` — Text inside the element is not included in the accessible name
- Canvas v2: `g[data-link-id="link-trunk"]` — `<g data-link-id="link-trunk" class="topology-link cursor-pointer transition-opacity hover:opacity-95 focus:out` — Text inside the element is not included in the accessible name

### landmark-one-main (moderate)

Betroffene Ansichten (3): Lektion; Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Lektion: `html` — `<html lang="de" class="dark">` — Document does not have a main landmark
- Lektion: `html` — `<html lang="de">` — Document does not have a main landmark

### page-has-heading-one (moderate)

Betroffene Ansichten (3): Lektion; Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Lektion: `html` — `<html lang="de" class="dark">` — Page must have a level-one heading
- Lektion: `html` — `<html lang="de">` — Page must have a level-one heading

### select-name (critical)

Betroffene Ansichten (2): Werkzeug: STP-Simulator; Werkzeug: OSI-Simulator

Beispiele (Selektor, Element, Meldung):

- Werkzeug: STP-Simulator: `.gap-2.items-center.flex:nth-child(1) > select` — `<select class="flex-1 text-xs rounded px-2 py-1 border bg-slate-900 border-slate-600 text-slate-100">` — Element does not have an implicit (wrapped) <label>
- Werkzeug: STP-Simulator: `.gap-2.items-center.flex:nth-child(2) > select` — `<select class="flex-1 text-xs rounded px-2 py-1 border bg-slate-900 border-slate-600 text-slate-100">` — Element does not have an implicit (wrapped) <label>
- Werkzeug: STP-Simulator: `.gap-2.items-center.flex:nth-child(3) > select` — `<select class="flex-1 text-xs rounded px-2 py-1 border bg-slate-900 border-slate-600 text-slate-100">` — Element does not have an implicit (wrapped) <label>
- Werkzeug: OSI-Simulator: `select` — `<select class="text-xs rounded px-2 py-1 border bg-slate-900 border-slate-600 text-slate-100"><option value="3` — Element does not have an implicit (wrapped) <label>
- Werkzeug: STP-Simulator: `.gap-2.items-center.flex:nth-child(1) > select` — `<select class="flex-1 text-xs rounded px-2 py-1 border bg-white border-slate-300 text-slate-900">` — Element does not have an implicit (wrapped) <label>
- Werkzeug: STP-Simulator: `.gap-2.items-center.flex:nth-child(2) > select` — `<select class="flex-1 text-xs rounded px-2 py-1 border bg-white border-slate-300 text-slate-900">` — Element does not have an implicit (wrapped) <label>

### region (moderate)

Betroffene Ansichten (2): Canvas v1; Canvas v2

Beispiele (Selektor, Element, Meldung):

- Canvas v1: `.relative.h-full.overflow-hidden` — `<div class="relative w-full h-full overflow-hidden">` — Some page content is not contained by landmarks
- Canvas v1: `.text-slate-500` — `<p class="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">Canvas ist leer</p>` — Some page content is not contained by landmarks
- Canvas v1: `.mb-5` — `<p class="text-sm mb-5 text-slate-300">Womit möchtest du beginnen?</p>` — Some page content is not contained by landmarks
- Canvas v2: `.bg-slate-900\/90 > .flex-wrap.gap-2.items-center` — `<div class="flex flex-wrap items-center gap-2">` — Some page content is not contained by landmarks
- Canvas v2: `.w-10` — `<span class="text-[11px] font-mono px-1 w-10 text-center">100%</span>` — Some page content is not contained by landmarks
- Canvas v2: `.mr-0\.5` — `<span class="text-[10px] font-bold uppercase tracking-wider mr-0.5 hidden xl:inline text-slate-400">Geräte:</s` — Some page content is not contained by landmarks

### empty-table-header (minor)

Betroffene Ansichten (1): Werkzeug: Subnetting-Cheatsheet

Beispiele (Selektor, Element, Meldung):

- Werkzeug: Subnetting-Cheatsheet: `th:nth-child(5)` — `<th class="py-2 font-semibold"></th>` — Element does not have text that is visible to screen readers

### landmark-no-duplicate-banner (moderate)

Betroffene Ansichten (1): Werkzeug: Subnetting-Cheatsheet

Beispiele (Selektor, Element, Meldung):

- Werkzeug: Subnetting-Cheatsheet: `.md\:px-6.bg-surface\/90.backdrop-blur-md` — `<header class="flex items-center justify-between px-3 md:px-6 py-2.5 border-b border-border-default bg-surface` — Document has more than one banner landmark

### landmark-unique (moderate)

Betroffene Ansichten (1): Werkzeug: Subnetting-Cheatsheet

Beispiele (Selektor, Element, Meldung):

- Werkzeug: Subnetting-Cheatsheet: `.md\:px-6.bg-surface\/90.backdrop-blur-md` — `<header class="flex items-center justify-between px-3 md:px-6 py-2.5 border-b border-border-default bg-surface` — The landmark must have a unique aria-label, aria-labelledby, or title to make landmarks distinguishable

### label (critical)

Betroffene Ansichten (1): Werkzeug: OSI-Simulator

Beispiele (Selektor, Element, Meldung):

- Werkzeug: OSI-Simulator: `.w-32` — `<input min="0" max="6" class="w-32" type="range" value="0">` — Element does not have an implicit (wrapped) <label>

### nested-interactive (serious)

Betroffene Ansichten (1): Labs-Dialog (Lab geöffnet)

Beispiele (Selektor, Element, Meldung):

- Labs-Dialog (Lab geöffnet): `.h-auto` — `<svg viewBox="0 0 940 620" class="w-full h-auto block" role="img" aria-label="Cisco Netzwerk-Topologiediagramm` — Element has focusable descendants. Move them outside of the element, or remove them.

### button-name (critical)

Betroffene Ansichten (1): Werkzeug: Drag-and-Drop-Trainer

Beispiele (Selektor, Element, Meldung):

- Werkzeug: Drag-and-Drop-Trainer: `.px-5.border-t.border-slate-700 > .border-slate-600.hover\:border-indigo-400.bg-slate-800:nth-child(1)` — `<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm bg-slate-800 border-slate-600 tex` — Element does not have inner text that is visible to screen readers
- Werkzeug: Drag-and-Drop-Trainer: `.px-5.border-t.border-slate-700 > .gap-2.items-center.flex > .border-slate-600.hover\:border-indigo-400.bg-slate-800` — `<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm bg-slate-800 border-slate-600 tex` — Element does not have inner text that is visible to screen readers
- Werkzeug: Drag-and-Drop-Trainer: `.px-5.border-t.border-slate-700 > .border-slate-600.hover\:border-indigo-400.bg-slate-800:nth-child(3)` — `<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm bg-slate-800 border-slate-600 tex` — Element does not have inner text that is visible to screen readers
- Werkzeug: Drag-and-Drop-Trainer: `.px-5.border-t.border-slate-200 > .border-slate-300.hover\:border-indigo-400.bg-white:nth-child(1)` — `<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm bg-white border-slate-300 text-sl` — Element does not have inner text that is visible to screen readers
- Werkzeug: Drag-and-Drop-Trainer: `.px-5.border-t.border-slate-200 > .gap-2.items-center.flex > .border-slate-300.hover\:border-indigo-400.bg-white` — `<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm bg-white border-slate-300 text-sl` — Element does not have inner text that is visible to screen readers
- Werkzeug: Drag-and-Drop-Trainer: `.px-5.border-t.border-slate-200 > .border-slate-300.hover\:border-indigo-400.bg-white:nth-child(3)` — `<button class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm bg-white border-slate-300 text-sl` — Element does not have inner text that is visible to screen readers

## Canvas v2 (nur aufgelistet)

- 1440 px dunkel: label-content-name-mismatch×8 (.sm\:px-3); region×4 (.bg-slate-900\/90 > .flex-wrap.gap-2.items-center)
- 1440 px hell: color-contrast×1 (.sm\:px-3 > .font-semibold); label-content-name-mismatch×8 (.sm\:px-3); region×4 (.bg-white\/90 > .flex-wrap.gap-2.items-center)
- 390 px dunkel: label-content-name-mismatch×5 (.sm\:px-3); landmark-one-main×1 (html); page-has-heading-one×1 (html); region×2 (.bg-slate-900\/90 > .flex-wrap.gap-2.items-center)
- 390 px hell: color-contrast×1 (.sm\:px-3 > .font-semibold); label-content-name-mismatch×5 (.sm\:px-3); landmark-one-main×1 (html); page-has-heading-one×1 (html); region×2 (.bg-white\/90 > .flex-wrap.gap-2.items-center)

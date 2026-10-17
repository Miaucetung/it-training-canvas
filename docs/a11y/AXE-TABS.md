# axe-Lauf über jeden Reiter einzeln (alle Regeln)

Erzeugt von `scripts/e2e/a11y-tabs-sweep.mjs` und `scripts/e2e/a11y-tabs-report.mjs`. Je Werkzeug-Dialog, Labs-Dialog, Prüfungstrainer-Menü und Priorisiertes Lernen wird jeder gefundene Reiter bzw. Modus aus frischem Zustand geöffnet und mit allen axe-Regeln geprüft (1440/390 px, hell/dunkel). Canvas v1 und v2 sind nicht Teil dieses Laufs (siehe `AXE-SWEEP.md`, nur aufgelistet). Es wurde nichts geändert.

**112 Zustände (Ansicht × Reiter) in 380 Läufen: 97 Zustände in allen vier Kombinationen sauber, 15 mit Verstößen oder Skriptfehlern (4 Läufe mit Skriptfehler).**

## Übersicht je Ansicht

| Ansicht | Zustände | davon mit Verstößen |
|---|---:|---:|
| Werkzeug: Subnetting-Drill | 4 | 0 |
| Werkzeug: Routing-Drill | 3 | 0 |
| Werkzeug: OSPF-Wildcard-Drill | 4 | 2 |
| Werkzeug: ACL-Drill | 8 | 2 |
| Werkzeug: Subnetting-Quiz | 5 | 1 |
| Werkzeug: Subnetting-Cheatsheet | 1 | 0 |
| Werkzeug: IPv4-Subnetztabelle | 4 | 0 |
| Werkzeug: IPv6-Rechner | 6 | 2 |
| Werkzeug: VLAN-Simulator | 9 | 3 |
| Werkzeug: STP-Simulator | 5 | 0 |
| Werkzeug: OSI-Simulator | 6 | 0 |
| Werkzeug: Routing-Simulator | 6 | 1 |
| Werkzeug: Verkabelungs-Trainer | 6 | 1 |
| Werkzeug: Drag-and-Drop-Trainer | 2 | 0 |
| Werkzeug: Topologie-Erkunder | 3 | 0 |
| Werkzeug: CLI-Glossar | 21 | 1 |
| Labs-Dialog (Liste) | 16 | 2 |
| Prüfungstrainer: Menü | 1 | 0 |
| Priorisiertes Lernen: Menü | 2 | 0 |

## Befunde je Werkzeug und Reiter

### Werkzeug: OSPF-Wildcard-Drill

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „network“ | color-contrast | serious | 1440 dunkel, 390 dunkel | 1 | `.text-slate-500.font-mono.shrink-0` — `<span class="font-mono text-xs text-slate-500 shrink-0">R1(config-router)#</span>` |
| Reiter „DR/BDR“ | color-contrast | serious | 1440 hell, 390 hell | 4 | `.text-\[12px\].bg-white.tabular-nums:nth-child(1) > .text-indigo-400.font-semibold` — `<span class="font-semibold text-indigo-400">R1</span>` |

### Werkzeug: ACL-Drill

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „ACE schreiben“ | color-contrast | serious | 1440 hell, 390 hell | 1 | `.text-terminal-muted` — `<span class="font-mono text-xs text-terminal-muted shrink-0">R1(config)#</span>` |
| Reiter „Advanced“ | color-contrast | serious | 1440 hell, 390 hell | 1 | `.text-terminal-muted` — `<span class="font-mono text-xs text-terminal-muted shrink-0">R1(config)#</span>` |

### Werkzeug: Subnetting-Quiz

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „Cheatsheet ▼“ | color-contrast | serious | 1440 dunkel, 1440 hell, 390 dunkel, 390 hell | 5 | `th:nth-child(1)` — `<th class="text-left py-1 pr-4">CIDR</th>` |

### Werkzeug: IPv6-Rechner

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „Segmentierung“ | label | critical | 1440 dunkel, 1440 hell, 390 dunkel, 390 hell | 1 | `input[min="1"]` — `<input min="1" max="128" class="w-full rounded-lg border px-3 py-2 text-sm font-mono bg-muted border-border te` |
| Reiter „Binär“ | scrollable-region-focusable | serious | 1440 dunkel, 1440 hell, 390 dunkel, 390 hell | 1 | `.overflow-x-auto` — `<div class="overflow-x-auto">` |

### Werkzeug: VLAN-Simulator

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „Trunk-Animation“ | label | critical | 1440 dunkel, 1440 hell, 390 dunkel, 390 hell | 1 | `.w-20` — `<input min="0.5" max="4" step="0.5" class="w-20" type="range" value="1">` |
| Reiter „Packet-Walk“ | button-name | critical | 1440 dunkel, 1440 hell, 390 dunkel, 390 hell | 6 | `.bg-accent-solid.w-2.h-2` — `<button class="w-2 h-2 rounded-full transition-all w-5 bg-accent-solid"></button>` |
| Reiter „Packet-Walk“ | scrollable-region-focusable | serious | 390 dunkel, 390 hell | 1 | `.overflow-x-auto` — `<div class="overflow-x-auto">` |
| Reiter „Ziel-MAC6B“ | color-contrast | serious | 390 hell | 1 | `.ring-2 > .mt-0\.5.text-\[9px\].text-muted-foreground` — `<span class="text-[9px] mt-0.5 text-muted-foreground">6B</span>` |

### Werkzeug: Routing-Simulator

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „5 · OSPF SPF / Cost“ | scrollable-region-focusable | serious | 390 dunkel, 390 hell | 1 | `pre` — `<pre class="text-xs font-mono overflow-x-auto p-2 rounded bg-muted">` |

### Werkzeug: Verkabelungs-Trainer

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „Kategorien“ | scrollable-region-focusable | serious | 390 dunkel, 390 hell | 1 | `.overflow-x-auto` — `<div class="overflow-x-auto">` |

### Werkzeug: CLI-Glossar

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „Packet-Tracer-Limits“ | scrollable-region-focusable | serious | 1440 dunkel, 1440 hell | 1 | `.overflow-y-auto.py-4.px-6` — `<div class="flex-1 overflow-y-auto px-6 py-4">` |

### Labs-Dialog (Liste)

| Reiter / Zustand | Regel | Schwere | Kombinationen | max. Elemente | Beispiel |
|---|---|---|---|---:|---|
| Reiter „Cisco IOS CLI“ | color-contrast | serious | 390 dunkel, 390 hell | 3 | `.text-orange-400\/70` — `<div class="text-xs mt-1 text-orange-400/70">Übungseingaben werden nicht gespeichert. Für persistente Labs nut` |
| Reiter „Cisco IOS CLI“ | empty-table-header | minor | 390 dunkel, 390 hell | 1 | `.overflow-x-auto.my-2.focus-visible\:ring-ring:nth-child(9) > table > thead > tr > th:nth-child(1)` — `<th class="px-2 py-1 text-left font-semibold border border-slate-600 text-slate-200"></th>` |
| Reiter „Als erledigt markieren“ | color-contrast | serious | 390 dunkel, 390 hell | 3 | `.text-orange-400\/70` — `<div class="text-xs mt-1 text-orange-400/70">Übungseingaben werden nicht gespeichert. Für persistente Labs nut` |
| Reiter „Als erledigt markieren“ | empty-table-header | minor | 390 dunkel, 390 hell | 1 | `.my-2.focus-visible\:ring-ring.overflow-x-auto:nth-child(9) > table > thead > tr > th:nth-child(1)` — `<th class="px-2 py-1 text-left font-semibold border border-slate-600 text-slate-200"></th>` |

## Nach Regel

| Regel | Schwere | Betroffene Zustände | Elemente (Summe über Läufe) |
|---|---|---:|---:|
| color-contrast | serious | 8 | 42 |
| scrollable-region-focusable | serious | 5 | 12 |
| label | critical | 2 | 8 |
| empty-table-header | minor | 2 | 4 |
| button-name | critical | 1 | 24 |

## Skriptfehler (Zustand nicht geprüft)

- Labs-Dialog (Liste) · Reiter „Cisco IOS CLI“: page.evaluate: TypeError: Cannot read properties of undefined (reading 'click')
- Labs-Dialog (Liste) · Reiter „Als erledigt markieren“: page.evaluate: TypeError: Cannot read properties of undefined (reading 'click')

## Grenzen des Laufs

- Reiter und Modi werden heuristisch gefunden (sichtbare Schaltflächen in den oberen 300 px des Dialogs, ohne Schließen/Export). Das schließt Schaltflächen ein, die keine Reiter sind (z. B. Felder im Frame-Vivisektor, Lab-Kapitel im Labs-Dialog); sie zählen als eigener Zustand.
- Der Labs-Dialog wird nur über die Kopfzone der Liste geprüft; einzelne Labs, Lab-Kapitel und die Katalog-Filter sind nicht vollständig durchlaufen.
- Zustände nach Eingaben (Quiz beantworten, Drill prüfen, Ergebnisbildschirme) sind nicht Teil dieses Laufs.

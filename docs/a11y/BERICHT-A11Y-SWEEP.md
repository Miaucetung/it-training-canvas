# Bericht: a11y-Sweep (Branch fix/a11y-sweep)

## 2a Behoben: Prüfungstrainer Menü und Ergebnis

Datei: `src/components/ExamPrepDialog.tsx`. Keine neuen festen Farben, nur Design-Tokens.

| Stelle | Vorher | Jetzt |
|---|---|---|
| Statistik-Beschriftungen (Fragen gesamt, Mit Grafik, Schwächefragen, Kategorien) | feste Zink-Klasse | `text-xs text-muted-foreground` |
| Kategorie-Auswahlfeld | ohne Label | `<label htmlFor="exam-category-filter">` + `<select id=…>` |
| Kachel Lernmodus | sky | `border-accent-primary bg-accent-primary/10 text-accent-primary-fg` |
| Kachel Prüfungsmodus | purple | `border-status-trunk-border bg-status-trunk-bg text-status-trunk-fg` |
| Kachel Schwächen-Drill | orange | `border-status-blocking-border bg-status-blocking-bg text-status-blocking-fg` |
| Unterzeilen der Kacheln | `opacity-80` | volle Deckkraft |
| „/ 1000“ | feste Zink-Klasse | `text-xs text-muted-foreground` |
| Button „Nochmal“ | `bg-sky-500 text-white` | `bg-accent-solid text-on-accent-solid` |

Nachweis: Test `exam-prep-contrast.test.tsx` (10 Tests); axe über Menü, Frage mit Grafik und Ergebnis in 1440/390 px, hell/dunkel: 0 Verstöße.

Nicht angefasst (Liste b): Button „Prüfen“ mit `bg-sky-500 text-white` und weitere Farbklassen im selben Dialog.

Für die Sweep-Läufe wurden die Audit-Hooks (nur DEV/`VITE_AUDIT_HOOKS=1`) um `openTool(id)` und `openDialog("labs")` ergänzt (`src/lib/audit-hooks.ts`, `src/App.tsx`).

## 2b Liste fest eingetragener Farbklassen

`docs/a11y/HARDCODED-FARBKLASSEN.md` (Datei, Zeile, Klassen; nichts ersetzt).

- 5174 Klassen in 89 Dateien.
- Canvas-Code (`canvas-v2/`, `lib/topology/`): 771 in 8 Dateien, nur aufgelistet.
- Übrige App: 4403 in 81 Dateien.
- Familien: slate 2411, white 488, indigo 350, amber 289, emerald 288, red 228, sky 225 …
- Einordnung nötig: Terminal-Blöcke und Statusfarben sind teils gewollt.

## 2c axe-Lauf

`docs/a11y/AXE-SWEEP.md`: 29 Ansichten × 4 Kombinationen = 116 Läufe, 55 sauber, 61 mit Verstößen, 13 Regeln.

Sauber in allen vier Kombinationen: Dashboard, Header Lernen-Menü, Prüfungstrainer (3 Zustände), Priorisiertes Lernen Quiz-Frage, OSPF-Wildcard-Drill, Subnetting-Quiz, CLI-Glossar, Labs-Dialog Liste.

| Regel | Schwere | Ansichten | Elemente | Wo |
|---|---|---|---|---|
| color-contrast | serious | 14 | 390 | Priorisiertes Lernen Menü, Subnetting-/Routing-Drill (dunkel), ACL-Drill (hell ×18), IPv4-Subnetztabelle (bis ×67), IPv6-Rechner, VLAN-, OSI-, Routing-Simulator, Verkabelungs-Trainer, Topologie-Erkunder (hell), Header-Menü 390 hell ×5, Canvas v1/v2 hell ×1 |
| scrollable-region-focusable | serious | 4 | – | Lektion 390 ×16, IPv4-Subnetztabelle, Subnetting-Cheatsheet, Labs (Lab geöffnet) |
| label-content-name-mismatch | serious | 3 | – | Labs (Lab geöffnet), Canvas v1, Canvas v2 |
| select-name | critical | 2 | – | STP-Simulator ×4, OSI-Simulator |
| label | critical | 1 | – | OSI-Simulator (Range-Slider) |
| button-name | critical | 1 | – | DnD-Trainer 390 ×3 |
| nested-interactive | serious | 1 | – | Labs (Lab geöffnet), SVG mit role="img" und fokussierbaren Geräten |
| landmark-one-main, page-has-heading-one | moderate | 3 | – | Lektion 390, Canvas v1/v2 390 |
| region | moderate | 2 | – | Canvas v1/v2 |
| empty-table-header, landmark-no-duplicate-banner, landmark-unique | minor/moderate | 1 | – | Subnetting-Cheatsheet |

### Canvas v2 (nur aufgelistet, nichts geändert)

- 1440: label-content-name-mismatch ×8, region ×4; hell zusätzlich color-contrast ×1.
- 390: label-content-name-mismatch ×5, region ×2, landmark-one-main ×1, page-has-heading-one ×1; hell zusätzlich color-contrast ×1.

## Vorschlag Reihenfolge (zur Entscheidung)

1. Critical: select-name (STP, OSI), label (OSI), button-name (DnD 390).
2. color-contrast in den Werkzeugen, größte Mengen zuerst (IPv4-Tabelle, OSI, ACL-Drill hell, IPv6, VLAN, Verkabelung).
3. scrollable-region-focusable (Lektion, Tabellen).
4. Labs: label-content-name-mismatch, nested-interactive.
5. Landmarks/Überschriften (Lektion 390, Cheatsheet).
6. Canvas: erst nach Absprache mit Gemini.

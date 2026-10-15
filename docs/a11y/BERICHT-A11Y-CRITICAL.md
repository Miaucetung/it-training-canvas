# Bericht: fix/a11y-critical

Grundlage: axe-Lauf über 29 Ansichten × 4 Kombinationen (1440/390 px, hell/dunkel). Vorher: [AXE-SWEEP-VORHER.md](AXE-SWEEP-VORHER.md) (main, 164050f). Nachher: [AXE-SWEEP.md](AXE-SWEEP.md) (dieser Branch).

**Ergebnis: 116 Läufe, vorher 55 sauber / 61 mit Verstößen, nachher 93 sauber / 23 mit Verstößen. Betroffene Elemente 572 → 99. Critical-Verstöße: 0.**

Je Buchstabe ein Commit.

## a) Critical (1b968e3)

| Befund | Behebung |
|---|---|
| select-name, STP-Simulator (3 Priority-Auswahlen) | `aria-label="Bridge Priority <Switch>"` |
| select-name, OSI-Simulator (Speed) | `aria-label="Geschwindigkeit"` |
| label, OSI-Simulator (Range-Slider) | `aria-label="Schritt"` |
| button-name, DnD-Trainer 390 px (Zurück, Reset, Weiter; Text unter `sm` ausgeblendet) | `aria-label` = sichtbarer Text |

Test: `critical-a11y-names.test.tsx`.

## b) color-contrast, Komponenten vollständig auf Design-Tokens

Reihenfolge nach Anzahl, je ein Commit. Die `dark`-Weichen sind überall entfernt (der Prop bleibt aus Kompatibilität optional in der Signatur, wird nicht mehr ausgewertet).

| Komponente | feste Farbklassen vorher → nachher | axe-Elemente vorher → nachher |
|---|---|---|
| IPv4-Subnetztabelle | 31 → 1 | 137 → 0 |
| OSI-Simulator | 71 → 1 | 94 → 0 |
| ACL-Drill | 93 → 1 | 19 → 0 |
| IPv6-Rechner (alle 5 Tabs geprüft) | 374 → 1 | 26 → 0 |
| VLAN-Simulator (alle 4 Tabs geprüft) | 249 → 2 | 24 → 0 |
| Verkabelungs-Trainer (alle 3 Tabs geprüft) | 111 → 0 | 28 → 0 |

Übrig sind in allen Dateien der Scrim `bg-black/50|60` des Dialog-Hintergrunds, im VLAN-Simulator zusätzlich `bg-white` (Schalter-Knopf) und `text-white` (Badge auf VLAN-Farbe).

Token-Zuordnung: Panel `bg-card border-border text-foreground`, Kopfzeilen/Kacheln `bg-muted`, Sekundärtext `text-muted-foreground`, Akzent `accent-primary(-fg)` bzw. `bg-accent-solid text-on-accent-solid`, Status `status-success|warning|error|trunk|blocking-*`, Terminal-Eingabe und Hex-Block `terminal-*`.

Entscheidungen, die du kennen solltest:

- **OSI-Schichtfarben**: neue Tokens `--osi-layer-1..7` in `src/index.css` (hell und dunkel getrennt, ≥ 4,5:1 auf Karte und Tönung). Tönungen per `color-mix` statt Hex-Alpha.
- **Abdunkeln über `opacity` entfällt**, wo es Text betraf: OSI-Schichten „noch nicht gekapselt“ (vorher `opacity-50`) sind jetzt gestrichelt auf `bg-muted/40`; VLAN-Trunk-Schalter (vorher `opacity-40`) gestrichelt mit `aria-pressed`; Nebentexte `opacity-60/70/80` → `text-muted-foreground` bzw. volle Deckkraft.
- **Datenfarben bleiben Daten**: VLAN-Identitätsfarben, Frame-Feldfarben, Gerätetyp-Farben und die TIA-568-Aderfarben bleiben als Hex in den Daten. Nur der Text darauf wurde getrennt (Feldbeschriftung `text-foreground`, die Farbe nur noch als Rahmen). Aderfarben-Beschriftungen nutzen weiter ihre eigene Datenfarbe.
- **Sichtbare Änderung**: Der Hex-Block im OSI-Simulator war grün auf Schwarz, jetzt `terminal-fg` auf `terminal-bg` (hell auf dunkel wie im übrigen Terminal). Auf Wunsch wieder grün über ein Terminal-Token.
- ACL-Drill: SVG-Beschriftungen und -Pfeile nutzen `var(--text-secondary|--text-muted|--status-*)`.
- Weitere `color-contrast`-Befunde außerhalb der genannten Komponenten sind **nicht** behoben (siehe unten).

## c) scrollable-region-focusable (c586350)

Bereiche erhalten `tabIndex=0` mit Fokusring (Muster wie bei den Exhibits): Lektion (Codeblöcke und Tabellen im Markdown, ohne Region-Rolle, da wiederholt), IPv4-Subnetztabelle, Subnetting-Cheatsheet (Region „Blockgrößen-Tabelle“), Lab-Adressierungstabelle. Test: `scrollable-regions-focusable.test.tsx`.

## d) Labs (669025e)

- `label-content-name-mismatch`: Die Namen enthalten jetzt den sichtbaren Text. Schalter: „Detail-Modus umschalten: IPs an|Kompakt“ und „Präsentationsmodus umschalten: Beamer (P)“, beide mit `aria-pressed`. Geräte: „R1 Cisco 2911: Gerät auswählen“ (Name, Modell, ggf. „angenommen“-Zusatz). Dafür steht hinter dem Gerätenamen im SVG-Text ein Leerzeichen, damit der sichtbare Text „R1 Cisco 2911“ lautet.
- `nested-interactive`: Diagramm-SVG `role="img"` → `role="group"` (enthält bedienbare Geräte). `aria-label` unverändert.
- `scripts/e2e/capture-lab-topologies.mjs` wählt die Schalter jetzt mit `^=`.
- Test: `lab-diagram-a11y.test.tsx`.

## e) Landmarks und Überschriften (27cb05b)

- Lektion: umgebender Container ist `<main>`; Topic-Titel `h2` → `h1`, die vier Abschnittsüberschriften `h3` → `h2` (sonst `heading-order`).
- Cheatsheet: `<header>` → `<div>` (zweiter banner), leere Tabellenkopfzelle bekommt `sr-only`-Text „Hinweis“.
- Tests: `TopicDetailPanel.test.tsx` (h1/h2), `subnetting-cheatsheet-landmarks.test.tsx`.

## Sperrklinke für feste Farbklassen

- Scanner: `src/__tests__/helpers/hardcoded-colors.ts` (dieselben Regeln wie die Liste; `scripts/audit/hardcoded-colors.audit.ts` nutzt ihn jetzt mit).
- Baseline: `src/__tests__/fixtures/hardcoded-colors-baseline.json`, 85 Dateien, 3918 Klassen (die Liste hatte vorher 5174 in 89 Dateien; der Rückgang stammt aus den sechs Komponenten und den Ausnahmen).
- Test `src/__tests__/build/hardcoded-colors-ratchet.test.ts` schlägt fehl, wenn eine Datei mehr Klassen hat als in der Baseline oder eine neue Datei welche einführt (die Meldung nennt Datei, Zahlen und die Token-Alternativen). Er schlägt auch fehl, wenn die Zahl **sinkt**, mit dem Hinweis, die Baseline nachzuziehen.
- Nachziehen: `npm run baseline:colors:update`. Das Skript verweigert Erhöhungen und neue Dateien; nur mit `--allow-increase` möglich.
- Ausdrücklich erlaubte Ausnahmen (`ALLOWED_ALWAYS_DARK`, weder gezählt noch in der Baseline): `LabScenariosDialog.tsx`, `exhibits/CLIExhibit.tsx`, `TerminalEmulator.tsx` (laut CLAUDE.md bewusst immer dunkel). Terminal-Tokens (`bg-terminal-*`, `text-terminal-*`) sind keine Palettenklassen und werden nie gezählt.
- Nachgewiesen: neue Klasse in bestehender Datei → rot; neue Datei → rot; Absenken → rot, bis die Baseline nachgezogen ist; das Update-Skript lehnt eine Erhöhung ab.
- **Canvas-Code** (`canvas-v2/`, `lib/topology/`, 771 Klassen in 8 Dateien) steht mit seinem Ist-Stand in der Baseline und ist nicht verändert. Fügt Gemini dort Klassen hinzu oder entfernt welche, schlägt der Test an; die Baseline dann bewusst per Skript nachziehen.

## Vorher/nachher je Ansicht

| Ansicht | Läufe mit Verstößen (von 4) vorher → nachher | Elemente vorher → nachher | Regeln nachher |
|---|---|---|---|
| Dashboard | 0 → 0 | 0 → 0 | – |
| Header: Lernen-Menü | 0 → 0 | 0 → 0 | – |
| Header: Navigation/Werkzeuge-Menü | 1 → 1 | 5 → 5 | color-contrast |
| Lektion | 2 → 0 | 36 → 0 | – |
| Prüfungstrainer: Menü | 0 → 0 | 0 → 0 | – |
| Prüfungstrainer: Frage mit Grafik (Lernmodus) | 0 → 0 | 0 → 0 | – |
| Prüfungstrainer: Ergebnis (Prüfungsmodus) | 0 → 0 | 0 → 0 | – |
| Priorisiertes Lernen: Menü | 4 → 4 | 8 → 8 | color-contrast |
| Priorisiertes Lernen: Quiz-Frage | 0 → 0 | 0 → 0 | – |
| Werkzeug: Subnetting-Drill | 2 → 2 | 8 → 8 | color-contrast |
| Werkzeug: Routing-Drill | 2 → 2 | 2 → 2 | color-contrast |
| Werkzeug: OSPF-Wildcard-Drill | 0 → 0 | 0 → 0 | – |
| Werkzeug: ACL-Drill | 2 → 0 | 36 → 0 | – |
| Werkzeug: Subnetting-Quiz | 0 → 0 | 0 → 0 | – |
| Werkzeug: Subnetting-Cheatsheet | 4 → 0 | 14 → 0 | – |
| Werkzeug: IPv4-Subnetztabelle | 4 → 0 | 137 → 0 | – |
| Werkzeug: IPv6-Rechner | 4 → 0 | 30 → 0 | – |
| Werkzeug: VLAN-Simulator | 4 → 0 | 32 → 0 | – |
| Werkzeug: STP-Simulator | 4 → 0 | 16 → 0 | – |
| Werkzeug: OSI-Simulator | 4 → 0 | 94 → 0 | – |
| Werkzeug: Routing-Simulator | 4 → 4 | 8 → 8 | color-contrast |
| Werkzeug: Verkabelungs-Trainer | 4 → 0 | 36 → 0 | – |
| Werkzeug: Drag-and-Drop-Trainer | 2 → 0 | 6 → 0 | – |
| Werkzeug: Topologie-Erkunder | 2 → 2 | 2 → 2 | color-contrast |
| Werkzeug: CLI-Glossar | 0 → 0 | 0 → 0 | – |
| Labs-Dialog (Liste) | 0 → 0 | 0 → 0 | – |
| Labs-Dialog (Lab geöffnet) | 4 → 0 | 36 → 0 | – |
| Canvas v1 | 4 → 4 | 22 → 22 | label-content-name-mismatch, region, color-contrast, landmark-one-main, page-has-heading-one |
| Canvas v2 | 4 → 4 | 44 → 44 | label-content-name-mismatch, region, color-contrast, landmark-one-main, page-has-heading-one |
| **Summe** | **61 → 23** | **572 → 99** | |

## Noch offen (nicht Teil des Auftrags, nicht angefasst)

| Ansicht | Rest |
|---|---|
| Priorisiertes Lernen: Menü | color-contrast ×2 (indigo-Kacheln), alle 4 Kombinationen |
| Subnetting-Drill | color-contrast ×4, nur dunkel |
| Routing-Drill | color-contrast ×1, nur dunkel |
| Routing-Simulator | color-contrast ×2, alle 4 Kombinationen |
| Topologie-Erkunder | color-contrast ×1, nur hell |
| Header Navigation/Werkzeuge-Menü | color-contrast ×5, 390 px hell |
| Canvas v1 (wird entfernt) | label-content-name-mismatch, region; hell color-contrast ×1; 390 px landmark-one-main, page-has-heading-one |
| Canvas v2 (Gemini, nur aufgelistet) | label-content-name-mismatch ×8 bzw. ×5, region ×4 bzw. ×2; hell color-contrast ×1; 390 px landmark-one-main, page-has-heading-one |

Hinweise:

- Die Sweep-Ansichten prüfen nur den Standardzustand. Tabs wurden für IPv6, VLAN und Verkabelung einzeln geprüft (axe, ohne Befund); weitere Zustände (z. B. geöffnete Konzepte in der Lektion, Kabel-Wizard-Detail) sind nicht abgedeckt.
- `App.tsx` ist nur an einer Stelle geändert (`<main>` um das Topic-Detail); die Aufrufer der Dialoge sind unverändert.

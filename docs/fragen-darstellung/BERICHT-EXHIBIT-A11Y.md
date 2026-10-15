# Exhibit-Barrierefreiheit: Nebenbefunde aus dem axe-Lauf

Branch `fix/exhibit-a11y` (von `main` @ `55b11ab`). Nicht gemergt. Keine Änderung an Fragetexten, Optionen, Lösungen oder Exhibit-Daten (der Inhalts-Snapshot ist unverändert, der Snapshot-Test grün).

## Beauftragt

1. **Topologie-Grafiken** (`TopologyExhibit`): das SVG hatte `role="img"` ohne Namen (`svg-img-alt`). Jetzt `aria-label` aus den Daten (`src/lib/exhibit-a11y.ts`): „Topologie: R1, SW1, PC1, 3 Verbindungen“, also nur Gerätenamen (Leerraum vereinheitlicht) und die Zahl der Verbindungen, nichts Erfundenes. Dasselbe für die Funkzonen-Grafik (`WirelessZonesExhibit`, z. B. Q0173): „Funkzonen: AP1, AP2, Kanal 1, 6“ (Zonennamen und Kanäle aus den Daten).
2. **Zwei `color-contrast`-Stellen im Prüfungstrainer** (`ExamPrepDialog`), jetzt über die Design-Tokens:
   - Fragenzähler („96/1081“): `text-zinc-500`/`text-zinc-400` (3,08 : 1 dunkel, 2,62 : 1 hell) → `text-muted-foreground`.
   - „← Zum Menü“: `text-zinc-600`/`text-zinc-400` (1,92 : 1 dunkel, 2,51 : 1 hell) → `text-muted-foreground hover:text-foreground`.
3. **axe über alle Fragen mit Exhibit** (Skript `scripts/e2e/exhibit-axe.mjs`): Prüfungstrainer 363 Fragen, Quiz/Priorisiertes Lernen 355 Fragen (klassifizierter Pool), je 1440 px und 390 px, dunkel und hell, inkl. Farbkontrast.

## Was der Lauf zusätzlich gefunden hat (ebenfalls behoben)

| Befund | Wo | Fix |
|---|---|---|
| `color-contrast` 4,16 : 1 in 11 Fragen | CLI-Exhibit, Prompt-Zeilen (`Router(config)#…`, `text-gray-500` auf `bg-gray-950`) | `text-gray-400` (nur diese Zeilenfarbe; die übrigen Zeilenfarben bleiben) |
| `scrollable-region-focusable` bei 390 px in 225 Fragen | CLI-Exhibit-Container und Tabellen-Container (`overflow-x-auto`, nicht per Tastatur erreichbar) | Container als `role="region"` mit Namen („CLI-Ausgabe“, „Tabelle“) und `tabIndex={0}`, sichtbarer Fokus über `ring`-Token. Für die Tabelle bekam `Table` in `ui/table.tsx` die optionale Prop `containerProps` (ohne sie bleibt der Container byte-gleich) |
| `empty-heading` in Q1254 | `QuizDialog`: leerer Fragetext ergab ein leeres `<h3>` | Überschrift nur bei vorhandenem Text; **Daten unverändert** (siehe unten) |

Reihenfolge der Funde: Ein erster Lauf (nur Prüfungstrainer, 1440 px dunkel) fand zuerst flüchtige Befunde während der Übergänge (`disabled:opacity-40`, 11 Fragen) und danach den CLI-Prompt-Kontrast (11 Fragen). Der volle Lauf über alle acht Kombinationen fand dann die scrollbaren Regionen bei 390 px (je 225 Fragen: CLI-Container im Prüfungstrainer, Tabellen-Container im Quiz) und den leeren Titel in Q1254. Das Skript schaltet deshalb Übergänge ab und wartet pro Frage, damit axe keine halb eingeblendeten Zustände misst.

## Ergebnis

| Dialog | 1440 dunkel | 1440 hell | 390 dunkel | 390 hell |
|---|---|---|---|---|
| Prüfungstrainer (363 Fragen mit Exhibit) | 0 Verstöße | 0 Verstöße | 0 Verstöße | 0 Verstöße |
| Quiz (355 Fragen mit Exhibit) | 0 Verstöße | 0 Verstöße | 0 Verstöße | 0 Verstöße |

8/8 Kombinationen ohne Verstöße, inklusive Farbkontrast.

## Tests

- `src/__tests__/lib/exhibit-a11y.test.tsx` (8): Beispiel „Topologie: R1, SW1, PC1, 3 Verbindungen“, Einzahl/Mehrzahl, **alle Topologie-Exhibits beider Pools** haben `role="img"` mit einem Namen, der exakt aus Gerätenamen und Verbindungszahl besteht; Funkzonen; CLI-Prompt-Farbe; CLI- und Tabellen-Region mit Namen und `tabindex`; andere Tabellen der App unverändert.
- `src/__tests__/components/exam-prep-contrast.test.tsx` (2): Zähler und „Zum Menü“ nutzen die Tokens (hell/dunkel).
- `src/__tests__/components/quiz-empty-heading.test.tsx` (2): keine leere Überschrift, Überschrift mit Text bleibt.
- Gesamt: Lint 0 Fehler (48 Warnungen), 1821 Tests in 84 Dateien grün, Build grün, `test:e2e:browser` 31/31, `question-rendering.mjs` komplett (6 Konfigurationen, 1081 + 1055 + 81 Fragen): 0 Fundstellen.

## Daten-Befund (nicht korrigiert)

q1254 / Q1254: `question` ist ein leerer String; Optionen und JSON-Exhibit sind vorhanden. In `INHALTLICHE-BEFUNDE.md` (Abschnitt 5) vermerkt.

## Gleiches Muster, nicht angefasst

Im Prüfungstrainer stehen dieselben zu hellen Zinkfarben noch an anderen Stellen, die der Lauf nicht trifft (andere Bildschirme): `text-zinc-400`/`text-zinc-500` bei der Zeitangabe und den Domain-Zählern im Ergebnisbildschirm sowie `text-zinc-600/400` bei „Schwächeliste zurücksetzen“ im Menü. Das wären weitere ein- bis zweizeilige Änderungen auf `text-muted-foreground`.

# Integration `fix/diagram-overlaps`: Inhalts-Snapshot und Merge

Branch `integrate/diagram-overlaps` (von `main` @ `8896ff7`). Nicht gemergt.

## Vorgehen

1. **Snapshot-Schutz zuerst** auf dem Stand von `main` gebaut und committet (`1aa2b69`), noch ohne die Änderungen von `fix/diagram-overlaps`.
2. **`fix/diagram-overlaps` (`4da11c0`) gemergt** (`05004b7`, `--no-ff`), ohne den Branch selbst zu verändern. Es gab keine Konflikte. Eine lokale, unversionierte Datei `scripts/audit/test-topology-overlaps.mjs` (älterer Arbeitsstand) stand dem Merge im Weg; sie liegt jetzt unverändert unter `.local/test-topology-overlaps.untracked-local.mjs`.
3. **`topology-layout-only.test.ts` durch den Snapshot-Test ersetzt** (`754c0d0`). Der Test las den Referenzstand zur Laufzeit per `git show` (Kandidaten: `GIT_BASE_REF`, `6b5ee88`, `origin/main`, `main`, `HEAD~1`); der Snapshot braucht keine Git-Historie und hängt nicht davon ab, welcher Ref gerade gilt.

## Der Snapshot

- **Datei:** `src/__tests__/fixtures/content-snapshot.json` (eingecheckt, deterministisch, ohne Zeitstempel). Umfang: `ccnaQuestions` 1081, `ccnaQuestionsClassified` 1055, `ccnaDragDrop` 81 Einträge; doppelte IDs innerhalb eines Pools bekommen das Suffix `~2`.
- **Je Frage Prüfsummen (SHA-256, 16 Hex-Zeichen, schlüsselreihenfolge-unabhängig):**
  - Multiple Choice: `text` (Fragetext), `options`, `correct` (Lösung), `meta` (übrige Felder wie Blueprint, Priorität), `exhibitKind` (Art/boolean), `exhibitDevices` (Geräte-ID, Typ, Name), `exhibitLinks` (Verbindungen), `exhibitInterfaces` (Interface-Namen), `exhibitSubnets`, `exhibitLabels` (Text und Zuordnung), `exhibitCli`, `exhibitTable`, `exhibitZones` (Zonen-ID, Name, Kanal) und `exhibitAll` (alles außer Layout, als Auffangnetz).
  - Drag-and-Drop: `instruction`, `context`, `targets`, `items` (Text und Zuordnung), `explanation`, `meta`.
- **Nicht in den Prüfsummen (reine Layout-Felder):** Geräte-Koordinaten `x`/`y`, Label-`position`, Zonen-`x`/`y`/`r`.
- **Test** `src/__tests__/lib/content-snapshot.test.ts`: berechnet den aktuellen Stand und vergleicht ihn mit der JSON-Datei. Jede inhaltliche Abweichung lässt ihn mit Pool, Frage-ID und Feld scheitern, z. B. `ccnaQuestions q0001: text geändert`; entfernte und neue Fragen werden gemeldet. 10 Prüfungen, darunter synthetische Fälle für Layout-Änderung (keine Abweichung) und jede Inhaltsart (Text, Optionen, Lösung, Gerätename, Interface-Name, Subnetz, Label-Text, Verbindung, CLI, Tabelle, Zone, Drag-and-Drop). An den echten Daten geprüft: eine Änderung an q0001 wird erkannt, nach dem Zurücksetzen ist der Test wieder grün.
- **Aktualisieren** geht nur per ausdrücklichem Aufruf: `npm run snapshot:content:update` (setzt `UPDATE_CONTENT_SNAPSHOT=1`). Der Audit-Wrapper schreibt ohne diese Variable nichts, der Test schreibt nie.

## Nachweis

Nach dem Merge ist der Snapshot-Test grün, ohne dass der Snapshot aktualisiert wurde: die JSON-Datei ist zwischen `1aa2b69` und dem Merge-Stand byte-identisch. Der Diff der Fragendateien durch `fix/diagram-overlaps` besteht ausschließlich aus drei Label-Positionen (`left` → `above`) in q0463, q0898, q0944 und Q0463, Q0898, Q0944; keine Fragetexte, Optionen, Lösungen, Gerätenamen, Interface-Namen, Subnetze oder Label-Texte.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run lint` | 0 Fehler, 48 Warnungen (wie vorher) |
| `npm test` | 1762 Tests in 77 Dateien grün |
| `npm run build` | grün |
| `npm run test:e2e:browser` | 31/31 |
| `question-rendering.mjs` komplett | alle 6 Konfigurationen (1440/1024/390 px, Dark/Light), je 1081 Prüfungsfragen, 1055 Quizfragen, 81 Drag-and-Drop-Fragen: **0 Fundstellen** |

## Hinweise

- `BERICHT-PHASE-3.md` von `fix/diagram-overlaps` beschreibt noch den ersetzten Test `topology-layout-only.test.ts` (Abschnitt 3); das ist unverändert geblieben, weil `fix/diagram-overlaps` nicht verändert werden sollte. Maßgeblich ist jetzt dieser Bericht.
- Die in Phase 3 geprüfte Aussage „nur q0463, q0898, q0944 geändert“ prüft der Snapshot-Test nicht mehr gegen einen Ref; sie folgt aus der unveränderten Snapshot-Datei und dem oben genannten Diff.
- `question-rendering.mjs` liest die Basis-URL jetzt aus `BASE_URL` (Standard `http://localhost:5000`).
- Der Snapshot ist mit rund 1 MB die größte eingecheckte Testdatei.

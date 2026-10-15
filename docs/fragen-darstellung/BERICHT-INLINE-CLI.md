# Umsetzung: CLI-Ausgaben aus dem Fragetext ins Exhibit

Branch `fix/inline-cli-exhibits` (von `main` @ `9b519dd`). Nicht gemergt. Grundlage: `INLINE-CLI-ANALYSE.md`.

## Was geändert wurde

| Pool | Frage | Änderung |
|---|---|---|
| `ccnaQuestions` | q0829 | CLI-Block aus dem Fragetext in ein neues CLI-Exhibit (24 Zeilen). Der Fragetext endet jetzt mit „What is the root cause of the issue?“. |
| `ccnaQuestionsClassified` | Q0829 | wie oben, **dasselbe Exhibit** (Zeilen aus dem klassifizierten Pool, die der Prüfungspool nicht hat). |
| `ccnaQuestions` | q0965 | doppelter Konfigurationsblock am Textanfang entfernt. |
| `ccnaQuestionsClassified` | Q0965 | wie oben. |

- **q0829:** Die Zeilenumbrüche stammen aus dem klassifizierten Pool (PDF). Gegenprobe im Test: die typischen `show interfaces`-Zeilenanfänge (Interface-Statuszeile, `Hardware is`, `MTU`, `reliability`, `Encapsulation`, `Keepalive`, `Auto-duplex`, `ARP type`, `Last input`, `Last clearing`, `Queueing`, `Output queue`, `5 minute …`, Zähler mit führender Zahl) zerlegen den **einzeiligen** Text des Prüfungspools in genau dieselben 24 Zeilen.
- **q0965:** Der Block wurde nur entfernt, weil er nach Leerraum-Normalisierung **identisch** mit dem vorhandenen Exhibit ist; das Umsetzungsskript bricht sonst ab (Bedingung erfüllt, in beiden Pools). Das Exhibit ist unverändert.
- **Unverändert** (laut Auftrag): Q0181, Q0242, Q0254, Q0277 (je Prüfungs- und klassifizierter Pool) und q0398/Q0398. Optionen, Lösungen und alle übrigen Fragen bleiben gleich.

## Nachweis

Test `src/__tests__/lib/inline-cli-exhibits.test.ts` (28 Prüfungen), Originalstand in `src/__tests__/fixtures/inline-cli-originals.json` (main @ `9b519dd`):

- **q0829, beide Pools:** Fragetext + Exhibit-Inhalt ergeben ohne Leerraum-Unterschiede genau den Originaltext; der neue Fragetext ist der unveränderte Anfang des Originals.
- **q0965, beide Pools:** Exhibit-Inhalt + neuer Fragetext ergeben ohne Leerraum-Unterschiede genau den Originaltext; der entfernte Block ist nach Normalisierung gleich dem Exhibit; das Exhibit ist objektgleich zum Original.
- **Kein Tippfehler korrigiert:** „FastEthemet0/13“ im Fragetext, die Bindestriche am Zeilenende („Keepalive not set -“, „Queueing strategy: fifo -“), die typografischen Anführungszeichen und die Tippfehler in den Optionen von q0965 sind unverändert.
- **Randfälle** sind objektgleich zum Original.

## Snapshot (bewusst aktualisiert)

`npm run snapshot:content:update`. Der Vergleich alt/neu nennt genau diese Änderungen und nichts sonst:

| Pool | Frage | Geänderte Felder |
|---|---|---|
| `ccnaQuestions` | q0829 | `text`, `exhibitKind` (bool:false → cli), `exhibitCli`, `exhibitAll` |
| `ccnaQuestionsClassified` | Q0829 | `text`, `exhibitKind`, `exhibitCli`, `exhibitAll` |
| `ccnaQuestions` | q0965 | `text` |
| `ccnaQuestionsClassified` | Q0965 | `text` |

Keine Frage wurde hinzugefügt oder entfernt; Optionen, Lösung und die übrigen Exhibit-Felder (Geräte, Verbindungen, Interfaces, Subnetze, Labels, Tabellen, Zonen) aller Fragen sind gleich geblieben. Drag-and-Drop unverändert.

## Nebenwirkungen

- Die Kategorie von q0829 in der App wird aus dem Fragetext abgeleitet (`categorizeQuestion`). Ohne die CLI-Schlüsselwörter im Text wechselt sie von „Geräte & Medien“ zu „Grundlagen & Sonstige“; q0965 bleibt „Security & Services“. Das betrifft nur die Kategorie-Filter im Prüfungstrainer. Wenn q0829 in „Geräte & Medien“ bleiben soll, wäre das eine eigene Änderung (Kategorie auch aus dem Exhibit ableiten).
- Der Test `ccna-question-pool.test.ts` zählt die Fragen mit Exhibit: 362 → 363 (q0829), mit Kommentar im Test.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run lint` | 0 Fehler, 48 Warnungen (wie vorher) |
| `npm test` | 1790 Tests in 78 Dateien grün |
| `npm run build` | grün |
| `npm run test:e2e:browser` | 31/31 |
| `question-rendering.mjs` komplett | alle 6 Konfigurationen (1440/1024/390 px, Dark/Light), 1081 + 1055 + 81 Fragen: **0 Fundstellen** |

## INHALTLICHE-BEFUNDE.md

Neuer Abschnitt 4 nimmt die Einlesefehler auf, ohne sie zu korrigieren. Zu den „defekten“ Anführungszeichen: geprüft, es sind typografische Zeichen (U+201C/U+201D), also kein Einlesefehler; die Anzeige als „?“ in der Konsole kam von der Zeichencodierung der Konsole. Der Abschnitt hält das so fest. Die Datei wurde von Hand ergänzt, das Erzeugungsskript `generate-inhaltliche-befunde.mjs` würde sie überschreiben und wurde nicht ausgeführt.

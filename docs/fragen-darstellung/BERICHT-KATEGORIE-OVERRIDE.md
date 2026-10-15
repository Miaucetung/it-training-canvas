# Kategorie von q0829: categoryOverride

Branch `fix/category-override` (von `main` @ `55b11ab`). Nicht gemergt. Grundlage: `ANALYSE-KATEGORIE-AUS-EXHIBIT.md` (Variante 4).

## Anlass

Seit dem Umzug der CLI-Ausgabe von q0829 / Q0829 ins Exhibit fehlen deren Schlagwörter im Fragetext; die Kategorie fiel von „Geräte & Medien“ auf „Grundlagen & Sonstige“. Die Schlagwort-Ableitung wird nicht angefasst.

## Änderung

- Optionales Feld `categoryOverride` an `CCNAQuestion` und `CCNAQuestionClassified` (und am App-Modell `Question`), **nur gesetzt für q0829 und Q0829: „Geräte & Medien“**.
- `categoryOf(q)` in `src/lib/ccna-question-pool.ts`: Override, sonst `categorizeQuestion(q.question)`. Verwendet im Prüfungstrainer (`ccna-exam-pool.ts`), im Kategorie-Filter des Fragenpools und in der Domain-Analyse des Quiz-Dialogs. `categorizeQuestion` selbst ist unverändert.
- `toQuestion` (beide Pools) gibt den Override nur dann weiter, wenn er gesetzt ist; alle anderen Fragen haben das Feld nicht.

## Nachweis

Test `src/__tests__/lib/category-override.test.ts` (7): nur q0829/Q0829 tragen ein Override; die Ableitung aus dem Fragetext ergibt für beide weiter „Grundlagen & Sonstige“ (Ableitung unverändert); alle übrigen Fragen beider Pools haben `categoryOf = categorizeQuestion` (also unveränderte Kategorien); q0829 steht im Prüfungstrainer in „Geräte & Medien“ und im Kategorie-Filter des Fragenpools nicht mehr in „Grundlagen & Sonstige“.

## Snapshot-Auswirkung (bewusst aktualisiert)

Der Vergleich alt/neu nennt genau zwei Einträge und nur das Feld `meta` (die Prüfsumme der übrigen Felder, in die `categoryOverride` eingeht):

| Pool | Frage | Geänderte Felder |
|---|---|---|
| `ccnaQuestions` | q0829 | `meta` |
| `ccnaQuestionsClassified` | Q0829 | `meta` |

Fragetext, Optionen, Lösung und alle Exhibit-Felder sind gleich geblieben; es wurden keine Fragen hinzugefügt oder entfernt, Drag-and-Drop ist unverändert.

## Später (UEBERGABE.md)

Kategorie langfristig aus der Blueprint-Zuordnung (`blueprint_section`/`blueprint_domain` im klassifizierten Pool) ableiten statt aus Schlagwörtern; vermerkt unter „Fragenpool (außerhalb der Labs)“.

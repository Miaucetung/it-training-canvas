# Antwortoptionen mit CLI-Block: Darstellung

Branch `feature/option-cli-display` (von `main` @ `a530db5`, mit `analysis/cli-in-options` gemergt). Nicht gemergt. Grundlage: `ANALYSE-CLI-IN-OPTIONEN.md`.

## Was geändert wurde

Reine Anzeige: **Daten, Reihenfolge, Index und Lösung bleiben unverändert**, der Inhalts-Snapshot ist nicht aktualisiert worden (die Datei `src/__tests__/fixtures/content-snapshot.json` ist byte-identisch zu `main`, der Snapshot-Test ist grün).

- `src/lib/cli-option.ts`: `classifyOption` (Einordnung, unverändert aus der Analyse), `splitCliOption` (Zeilen für erkannte Fälle, sonst `null`), `isCliOption`, `cliButtonClass`.
- `src/components/CliOptionText.tsx`: Text einer Option. Erkannte Blöcke erscheinen in Monospace (`font-mono text-xs`) mit Zeilenumbrüchen (`whitespace-pre`); alle anderen Optionen werden mit exakt demselben `<span>` wie vorher gerendert.
- `ExamPrepDialog` (Prüfungstrainer) und `QuizDialog` (Quiz und Priorisiertes Lernen, das den Quiz-Dialog nutzt): die Option nutzt `CliOptionText`; der Options-Button bekommt für erkannte Blöcke zusätzlich `overflow-x-auto`.

### Erkannte Fälle (genau die 280 Optionen der Analyse, Prüfungspool)

| Einordnung | Optionen | Fragen |
|---|---:|---:|
| mehrzeilig mit Prompts | 157 | 40 |
| Konfiguration ohne Prompt | 111 | 36 |
| show-Ausgabe | 8 | 2 |
| Zeilenumbruch bereits im Text (q0846) | 4 | 1 |
| **zusammen** | **280** | **78** |

Einzelbefehle (912) und alle übrigen Optionen (3321) bleiben unverändert. Im klassifizierten Pool sind es 284 erkannte Optionen und 911 Einzelbefehle (er hat andere Fragen, z. B. Q0089).

### Zerlegung (`splitCliOption`)

- **Mehrfach-Prompts:** neue Zeile vor jedem Prompt (`R1(config)#`, `SW1(config-if)#`, `R7#`), auch bei PDF-Resten im Prompt (`SW1(config- if)#`). Steht hinter einem bloßen Prompt (`R7# interface … ip address …`) mehr als ein Befehl, wird an den Befehlsanfängen getrennt.
- **Konfiguration ohne Prompt:** neue Zeile vor eindeutigen Befehlsanfängen (`interface`, `description`, `ip address`, `no shutdown`, `switchport …`, `encapsulation`, `ip ospf`, `router ospf`, `network <Ziffer>`, `access-list`, `line vty`, `transport input`, `login local`, `crypto …`, `username` u. a.); ein alleinstehendes `!` bekommt eine eigene Zeile. Allgemeine Wörter (`vlan`, `name`, `password`, `line`) trennen nicht, weil sie auch in Argumenten stehen (`switchport access vlan 10`, `ip domain name x`); `no ` bleibt am Befehl.
- **show-Ausgabe:** neue Zeile vor jeder Routenzeile (`o E2 10.0.0.0/8 …`), die Zeile „Gateway of last resort …“ steht für sich.
- **vorhandene Umbrüche** (q0846) bleiben erhalten.
- **Kein Zeichen ändert sich.** Die Zeilen werden nur an Leerzeichen getrennt; Tippfehler und Reste aus dem PDF bleiben sichtbar (`intergface`, `passwordcisco123`, ` -` und `•` am Zeilenende).

## Nachweis

Tests (alle grün):

- `src/__tests__/lib/cli-option.test.ts` (12): für **alle erkannten Optionen beider Pools** ergeben die zusammengesetzten Zeilen ohne Leerraum-Unterschiede genau den Originaltext (keine leere Zeile); genau 280 erkannte Optionen im Prüfungspool (157/111/8/4); 912 Einzelbefehle und alle übrigen Optionen (zusammen 4233) liefern `null`; Zerlegung typischer Fälle (q0446, q0904, q0109, q1050, q0014, q0200, q0306, q0942, q0493, q0846); Einzelbefehle und Sätze bleiben `null`; Tippfehler bleiben.
- `src/__tests__/components/cli-option-text.test.tsx` (5): alle 4233 nicht erkannten Optionen des Prüfungspools ergeben **exakt** das bisherige `<span class="flex-1">…</span>` (und im klassifizierten Pool das bisherige `<span class="text-sm">…</span>`); der Options-Button bekommt für sie keine zusätzliche Klasse; alle 280 erkannten Optionen erscheinen als Monospace-Block mit erhaltenem Text; im `QuizDialog`: Block/Einzelbefehl/Satz, gleiche Basisklassen der Buttons, Klick wechselt die Farbklassen, Button fokussierbar.
- `src/__tests__/components/exam-prep-cli-option.test.tsx` (1): im Prüfungstrainer gleiche Button-Klassen (nur der Block-Button hat zusätzlich `overflow-x-auto`), Auswahl wechselt die Klassen, nach „Prüfen“ erscheint das Häkchen, die Option ist deaktiviert.
- Snapshot-Test unverändert grün, ohne den Snapshot zu aktualisieren.

Browser (Skript `scripts/e2e/option-cli-check.mjs check`, Edge, Dev-Server), je Dialog (Prüfungstrainer und Quiz) in 1440 px und 390 px, dunkel und hell, **alle 78 Fragen mit 280 erkannten Optionen**:

- Die Seite und der Dialog scrollen nie horizontal, kein Block ragt über die Fensterbreite. Bei 1440 px scrollen 6 Blöcke innerhalb ihrer Option, bei 390 px 202 (Prüfungstrainer) bzw. 234 (Quiz): die breite Zeile scrollt **innerhalb der Option**.
- axe (inkl. Farbkontrast) an q0109: **0 Verstöße in den CLI-Optionen**.
- Tastatur: die Option bleibt ein Button, fokussierbar, per Enter wählbar.
- 20/20 Prüfungen.

Außerdem: `question-rendering.mjs` komplett (6 Konfigurationen: 1440/1024/390 px, Dark/Light; 1081 Prüfungs-, 1055 Quiz-, 81 Drag-and-Drop-Fragen): **0 Fundstellen**. `npm run lint`: 0 Fehler, 48 Warnungen. `npm test`: 1809 Tests in 81 Dateien grün. `npm run build` grün. `npm run test:e2e:browser`: 31/31.

## Entscheidung beim Scrollen (Abweichung vom ersten Entwurf)

Zuerst scrollte ein eigener Bereich im Button. axe meldet das bei 390 px als `scrollable-region-focusable` (ein scrollbarer Bereich ohne Tastaturzugang); ein fokussierbarer Bereich im Button wäre wiederum verschachtelte Interaktion, und `tabindex="-1"` genügte der Regel nicht. Deshalb scrollt jetzt der **Options-Button selbst** (`overflow-x-auto`): er ist ohnehin fokussierbar, die Klickfläche, Auswahl- und Ergebnisfarben und die Tastaturbedienung bleiben gleich. Nebenwirkung: bei schmaler Breite scrollen Buchstabe und Ergebnis-Häkchen mit der Zeile mit.

## Bereits vorhandene axe-Befunde (nicht Teil dieser Änderung)

An q0109 findet axe vor und nach der Änderung gleich: `svg-img-alt` (die Topologie-Grafik hat keinen Namen) und im Prüfungstrainer zwei `color-contrast`-Stellen (Elemente mit `text-zinc-400` bzw. `text-zinc-500` im Dialog, nicht in den Optionen). Beides liegt außerhalb der Optionen.

## Screenshots (vorher/nachher)

Nicht im Repo (`.local/screenshots/option-cli/`, gitignored); `bericht.html` zeigt alle Paare nebeneinander. Drei Beispiele, je im Prüfungstrainer bei 1440 px dunkel: **q0109** (Mehrfach-Prompts mit Konfiguration), **q0942** (show-Ausgabe/Routing-Tabelle), **q0014** (Konfiguration ohne Prompt); dazu q0109 bei 390 px hell (Scrollen in der Option) und Q0109 im Quiz (1440 px dunkel, 390 px hell).

## Grenzen

- Die Zerlegung ist eine Heuristik für die Anzeige. Wo mehrere Befehle ohne Trenner hintereinander stehen und das Wort im Argument vorkommen kann, bleibt es in einer Zeile (z. B. `username x password y enable password …` in q0984B).
- Aus dem PDF stammende Reste (` -`, `•`, getrennte Prompts wie `C-` / `router(config-router)#`) bleiben, weil nichts verändert wird.
- Die Option-Anzeige in anderen Dialogen (Drag-and-Drop, Lektionen) ist nicht berührt.

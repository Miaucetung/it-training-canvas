# Dashboard didaktisch ordnen: Bericht (Phase 2, Zwischenstand)

Branch `feature/dashboard-didaktik`. Nicht gemergt. Konzept: `docs/dashboard-didaktik.md`; Stufen/Glossar zur Freigabe: `docs/dashboard-stufen-glossar.md`.
Lint 0 Fehler (48 Warnungen wie vorher), **1565 Tests in 66 Dateien grün**, Build grün, `npm run test:e2e:browser` 31/31, neuer Browser-Test `scripts/e2e/dashboard-didaktik.mjs` 33/33 (axe 0 Violations inkl. Kontrast, Hell/Dunkel × 1440/1024/390 px, neue Nutzer und Nutzer mit Fortschritt, keine horizontale Seitenverschiebung).

## 1. Fortschritt repariert (Arbeitspaket 1)

- Ursache: Die Balken zählten Themen-IDs, gefüllt wurde aber mit Schritt-IDs des Lernpfads und mit einem Speicher, den niemand schrieb. Sie konnten nicht steigen.
- Neu: `src/lib/learning-progress.ts` (`ccna-learning-progress-v1`). Ereignisse: Lektion geöffnet (= begonnen), „Als gelesen markieren“ (wieder abwählbar), Quiz vollständig durchlaufen mit Ergebnis (bestes, letztes, Versuche; keine Mindestquote). Gespeichert wird nur, was Nutzer tun.
- Abwärtskompatibel: Info- und Quiz-Schritte des Lernpfads (`canvas-user-progress`), `ccna-completed-topics`, frühere Themen-IDs und „zuletzt geöffnet“ werden gelesen, nie verändert. Eine bewusste Abwahl überstimmt Altdaten; Altdaten ohne Ergebnis zeigen „Ergebnis nicht gespeichert“.
- Tests (20): Ereignisse, Altdaten, kaputte Speicherstände, und die Beweise, dass die Balken steigen und wieder sinken (Dashboard-Komponente), dass der Button in der Lektion speichert und das Quiz-Ergebnis erscheint.

## 2. Lernpfad, Nächster Schritt, Dreiklang (Arbeitspaket 2)

- `src/lib/learning-path-config.ts`: die 15 freigegebenen Schritte. Test: jedes der 26 Themen, 39 Quizzes und 55 Labs kommt genau einmal vor (nur `routing-ospf` zweimal, mit den Ankern `routing-fundamentals` und `ospf`).
- `src/lib/learning-path-logic.ts`: Status je Schritt (offen, begonnen, abgeschlossen = alle Lektionen gelesen und alle Quizzes einmal durchlaufen; Labs sind keine Pflicht) und genau eine Empfehlung: erster offener Schritt mit erfüllten Voraussetzungen, darin erst Lektion, dann Quiz; sind alle Schritte abgeschlossen, das erste offene Lab, sonst „fertig“.
- Dashboard von oben nach unten: Kopf (Titel, „?“, Strg+K, Beamer), Einführungskarte, **Nächster Schritt**, **Lernpfad** mit Dreiklang Verstehen / Üben / Anwenden, Prüfungsbereiche (zweite Sicht), **Werkzeuge und Referenzen** (kompakter Topologie-Erkunder, Übungen, Simulatoren), Zuletzt bearbeitet, Fußzeile.
- Verknüpfungen: Lektion öffnet an der passenden Stelle (Anker); Quiz startet direkt aus dem Dashboard; Lab öffnet direkt das richtige Lab; die Lektion zeigt „Weiter: Übungsfragen“ und „Passende Labs“; das Lab zeigt „Lektion dazu“.
- Nebenbefund behoben: Der Lab-Dialog öffnete bei erneutem Öffnen mit demselben Lab nicht auf diesem Lab.

## 3. Einführung (Arbeitspaket 3, Teil 1)

- Schlichte Karte „So funktioniert die App“ (drei Schritte), schließbar, über das „?“ wieder aufrufbar; die mehrstufige `OnboardingTour` öffnet sich auf dem Dashboard nicht mehr von selbst (Hilfe-Eintrag bleibt).
- „Was ist die CCNA …“: nur Angaben aus offiziellen Cisco-Quellen, mit Quelle und Datum (abgerufen am 14.10.2026): Prüfung 200-301, Version 1.1, 120 Minuten, Bewertung bestanden/nicht bestanden, sechs Bereiche mit 20/20/25/10/15/10 % (Cisco-Prüfungsthemen v1.1, PDF, Text selbst ausgelesen). Fragenzahl und Bestehensgrenze nennt Cisco nicht und stehen deshalb nicht dort; ein Test verbietet Zahlen dazu.
- **Offen, wartet auf deine Freigabe:** Stufen „Einsteiger/Fortgeschritten“ für Labs und Simulatoren und das Glossar (34 Begriffe), siehe `docs/dashboard-stufen-glossar.md`.

## 4. Anfänger-Weg (Arbeitspaket 4)

Gemessen im Browser (`npm run test:e2e:dashboard`), neue Nutzer, Ziel höchstens zwei Klicks je Etappe:

| Etappe | Klicks |
|---|---|
| Dashboard → erste Lektion („Jetzt starten: Lektion lesen“) | 1 |
| Lektion → Übungsfragen („Weiter: Übungsfragen“) | 1 |
| Lektion → Dashboard | 1 |
| Dashboard → Lektion IPv4 über den Lernpfad (Schritt 4 aufklappen, Lektion wählen) | 2 |
| Lektion → passendes Lab („IP-Grundkonfiguration“) | 1 |
| Lab → Lektion zurück (Verweis „Lektion dazu“ sichtbar) | 1 |
| Lab → Dashboard (Dialog schließen, Lektion schließen) | 2 |

## 5. Weitere Änderungen und Hinweise

- `QuizDialog`: die Fragenansicht hat jetzt `role="dialog"` mit dem Quiz-Titel (vorher nur die Ergebnisansicht).
- Kopfzeile unter 1280 px: Zugänglicher Name des Menü-Knopfs beginnt jetzt mit dem sichtbaren Text („Menü: Navigation und Werkzeuge öffnen“); axe meldete `label-content-name-mismatch`. Die Skripte, die den Knopf suchen, sind angepasst.
- Die Zeile „1.055 Fragen, 81 Drag-and-Drop-Aufgaben, 5 Simulatoren“ steht nicht mehr im Dashboard (sie war im ausgeblendeten Kopfbereich; es gibt vier Simulatoren).
- Die Titel der Lektionen im Lab-Dialog („Lektion dazu“) stehen dort als eigene Tabelle (`LESSON_TITLES`); bei neuen Themen muss sie ergänzt werden.
- Lernfortschritt wird lokal gespeichert, nicht mit dem Konto synchronisiert (wie die erledigten Labs).
- Screenshots (neue Nutzer, mit Fortschritt) liegen außerhalb der Versionsverwaltung in `.local/screenshots/dashboard`.

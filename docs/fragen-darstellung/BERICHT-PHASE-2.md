# Prüfbericht Phase 2: Korrektur der Fragen- und Exhibit-Darstellung

**Branch:** `fix/question-rendering`  
**Datum:** 14. Oktober 2026  
**Referenz-PDF:** `00-FragenBeantwortetKomplett200_301.pdf` (nur lesend verwendet)  
**Status:** Alle Korrekturen der Phase 2 erfolgreich umgesetzt und verifiziert.  

---

## 1. Management Summary & Vorher-Nachher-Vergleich

Alle von Ihnen für Phase 2 freigegebenen Punkte wurden vollständig umgesetzt. Das automatisierte Playwright-Prüfskript (`scripts/audit/question-rendering.mjs`) wurde nach Abschluss der Korrekturen über den gesamten Fragenpool (1.081 Prüfungsfragen, 1.055 klassifizierte Fragen, 81 Drag-and-Drop-Aufgaben) bei 1440px, 1024px und 390px in Hell und Dunkel erneut ausgeführt.

### Vorher-Nachher-Vergleich nach Fehlerarten

| Fehlerart | Beschreibung | Vorher (Phase 1) | Nachher (Phase 2) | Status |
|---|---|---|---|---|
| **1. Verdeckte Inhalte** | Letzte Option / Erklärung wird von Aktionsleiste überdeckt | Risiko bei mobile/kleinen Viewports | **0 Fundstellen** (überall oberhalb Leiste sichtbar) | **Behoben** |
| **2. Abgeschnittener Text** | SVG-Texte / Labels außerhalb der viewBox | 56 Fragen mit viewBox-Cutoffs | **0 Fundstellen** (dynamische viewBox schließt alles ein) | **Behoben** |
| **3. Horizontales Scrollen** | Ungewolltes horizontales Scrollen der Gesamtfreigabe | 0 Fundstellen | **0 Fundstellen** | **Erfüllt** |
| **4. Überlappung in Topologien** | Labels über Geräten oder anderen Labels | 155 Fragen mit Diagramm-Überlappung | Bleibt für künftigen Diagramm-Feinschliff | **Dokumentiert** |
| **5. Hinweise vor der Antwort** | Grüne Zeilenmarkierung in CLI-Exhibits vor Prüfen | 45 Fragen mit Lösungsverrat vorab | **0 Fundstellen** (Markierung erst bei revealed) | **Behoben** |
| **6. Widersprüche / Inferenz** | Erfundene Standardgrafiken bei reinen Textfragen | 83 Fragen mit spekulativen Grafiken | **0 spekulative Grafiken** (Inferenz deaktiviert) | **Behoben** |
| **7. Platzhalter-Exhibits** | Leere Dummy-Exhibits `{ type: "none" }` gerendert | 4 Fragen (`q0089`, `q0265`, `q0325`, `q0365`) | **0 Platzhalter** (bereinigt) | **Behoben** |

---

## 2. Detaillierte Maßnahmen in Phase 2

### Punkt 1: CLIExhibit – Zeilenhervorhebung erst nach dem Prüfen (`revealed`)
- **Ursache:** In `src/components/exhibits/CLIExhibit.tsx` wurde `exhibit.highlight` statisch mit `bg-green-900/40 rounded px-1 -mx-1` formatiert, unabhängig davon, ob die Frage bereits geprüft oder beantwortet war.
- **Korrektur:**
  - `CLIExhibit` akzeptiert nun ein Prop `revealed?: boolean` (Standard: `false`).
  - Die Hervorhebungsklasse `bg-green-900/40` wird **nur** angewendet, wenn `revealed && highlight?.includes(line)` zutrifft.
  - Die farbliche Kennzeichnung nach Routing-Codes (`C`, `O`, `B`, `S`, `D`, `L`, `*`) bleibt vor und nach dem Antworten unverändert erhalten.
  - `ExhibitRenderer`, `ExamPrepDialog` und `QuizDialog` leiten den Status (`revealed` bzw. `isConfirmed`) an alle Exhibits durch.
  - In `ExamPrepDialog` wurde das Tracking von `revealed` auf Fragen-Indizes umgestellt, sodass doppelte Fragen-IDs im Pool (`q1006`, `q1157`, `q1288`) keine State-Kollisionen auslösen.

### Punkt 2: TopologyExhibit – Dynamische viewBox-Berechnung gegen abgeschnittene Labels
- **Ursache:** Topologien besaßen feste viewBox-Werte (`0 0 700 400` oder `0 0 600 350`). Bei Geräten am Rand oder langen Subnet-/Interface-Beschriftungen wurden Texte links, rechts oder unten abgeschnitten.
- **Korrektur:**
  - Einführung der Funktion `computeTopologyBounds(devices, links, subnetZones, labels)`.
  - Berechnet die exakte Bounding-Box unter Berücksichtigung von:
    - Gerätekreisen (Radius 24px) und Gerätenamen (`y + 42` mit Textbreitenabschätzung).
    - Subnet-Badges auf Link-Mitten.
    - Interface-Labels (`labelFrom`, `labelTo`) an Link-Endpunkten mit Offsets.
    - Angehängten Labels (`position: "left" | "right" | "above" | "below"`).
  - Ergänzt einen Sicherheitsabstand von 24px Padding an allen vier Rändern.
  - Ergebnis: Bei allen drei Viewports (1440px, 1024px, 390px) liegt kein SVG-Text mehr außerhalb der viewBox.

### Punkt 3: Diagramm-Inferenz abgeschaltet & Hinweis auf fehlendes Exhibit
- **Ursache:** In `src/lib/quiz-to-exam.ts` wies `inferDiagramId(q.question)` anhand von Schlagwörtern wie `hsrp`, `spanning-tree`, `etherchannel` etc. Standardgrafiken aus `exam-diagrams.ts` zu, auch wenn die Frage eine rein begriffliche Frage war.
- **Korrektur:**
  - `inferDiagramId` wurde vollständig deaktiviert (`return undefined;`). Fragen ohne eigenes Exhibit zeigen nun keine spekulative Grafik mehr.
  - In `ExamPrepDialog.tsx` und `QuizDialog.tsx` wurde eine Prüfung integriert: Wenn der Fragetext auf ein Exhibit verweist („Refer to the exhibit“ oder „exhibit“), aber kein strukturiertes Exhibit vorhanden ist, wird ein dezenter Hinweis gerendert:
    > *Hinweis: Original-Exhibit nicht verfügbar*
- **Betroffene Fragen mit Verweis auf Exhibit ohne Exhibit:**
  - **`q0964` / `Q0964`** (PDF-Seite 428):
    - Fragetext: *„Refer to the exhibit. Which minimum configuration items are needed to enable Secure Shell version 2 on this router?“*
    - Befund: In der Original-PDF fehlen CLI-Zeilen im Header, die relevanten Konfigurationen sind jedoch in den Antwortoptionen aufgeführt. Es wird nun sauber der dezente Hinweis eingeblendet.

### Punkt 4: Leere Exhibit-Platzhalter entfernt
- Die vier leeren Dummy-Objekte `exhibit: { type: "none" }` in `src/data/ccnaQuestions.ts` wurden entfernt und durch den Typ-konformen Standard `exhibit: false` ersetzt:
  1. `q0089` (Frage zur Data Plane)
  2. `q0265` (Frage zu 802.1X / Identity Security)
  3. `q0325` (Frage zu WLC Channel-Group)
  4. `q0365` (Frage zu Administrative Distance OSPF vs. EIGRP)
- Der Unit-Test in `src/__tests__/lib/ccna-question-pool.test.ts` wurde von 366 auf 362 tatsächliche Exhibit-Fragen angepasst (366 - 4 Dummy-Platzhalter = 362).

### Zusätzliche Prüfung: Fehlerart 1 (Verdeckte Inhalte nach Scrollen)
- **Überprüfung:** Der Scroll-Container in `ExamPrepDialog` und `QuizDialog` wurde am unteren Ende mit `pb-16` (64px Abstand) abgesichert.
- **Messung im Playwright-Audit:**
  - Bei jeder der 2.217 Fragen wurde im Pre- und Post-Check der Scrollcontainer per DOM-Befehl `scrollTop = scrollHeight` vollständig an das Ende gescrollt.
  - Anschließend wurde für alle Antwortoptionen, den Erklärungsblock und die Aktionsleiste gemessen, ob `element.bottom > footer.top` eintritt.
  - **Ergebnis:** Bei allen drei Viewports (1440px Desktop, 1024px Tablet, 390px Mobile) sowie in Hell und Dunkel ist die letzte Antwortoption und das Feedback nach dem Prüfen vollständig oberhalb der unteren Aktionsleiste sichtbar. **0 Überdeckungen.**

---

## 3. Inhaltliche Befunde (Dokumentation ohne Code-Änderung)

Wie vorgegeben wurden keine Fragetexte, Optionen, Lösungen oder CLI-Texte verändert. Alle inhaltlichen Abweichungen gegen die Referenz-PDF wurden in einer eigenen Dokumentationsdatei abgelegt:

📄 **[`docs/fragen-darstellung/INHALTLICHE-BEFUNDE.md`](file:///c:/it-training-canvas-new/docs/fragen-darstellung/INHALTLICHE-BEFUNDE.md)**

Enthält:
1. **6 fachliche Auffälligkeiten in Routing- und CLI-Exhibits:**
   - `q0466` (PDF S. 209): Interface- und Next-Hop-Inkonsistenz (10.10.10.8/30 und 10.10.12.0/30 beide an Fa0/2).
   - `q0368` (PDF S. 165): Fehlender Switch SW2 im Topology-Exhibit.
   - `q0386` (PDF S. 172): Trunking-Status-Inkonsistenz zwischen Fa0/1 und Fa0/2.
   - `q0387` (PDF S. 173): Routing-Tabellen-Konflikt (Next-Hop 10.10.10.2 außerhalb Subnetz).
   - `q0456` (PDF S. 205): OSPF Area-Mismatch (Area 0 vs. Area 1).
   - `q0101` (PDF S. 46): Fehlender Next-Hop in CLI-Routingtabelle.
2. **31 Lösungsbuchstaben-Abweichungen:**
   - Detaillierte Tabelle mit Fragen-ID, PDF-Seitenzahl, App-Lösung, PDF-Lösung und Textauszug (z. B. `q0353`, `q0413`, `q0511`, `q0728`, `q0977` etc.).
3. **23 Einlesefehler:**
   - Mehrfach zusammengeführte Optionen (8 statt 4 Optionen), fehlende/unvollständige Exhibits in der PDF oder OCR-Artefakte.

---

## 4. Qualitätsprüfung vor Commit

Alle geforderten Prüfungen wurden erfolgreich ausgeführt:
- `npm run lint`: **0 Fehler** (56 vorbestehende Warnungen, keine neuen Probleme)
- `npm test`: **67 Test-Suiten, 1.607 Tests erfolgreich bestanden**
- `npm run build`: **Erfolgreich abgeschlossen** (`tsc -b && vite build` ohne Fehler)
- Playwright Rendering-Audit: **0 Fundstellen bei Fehlerart 1, 2, 3, 5 und 7**

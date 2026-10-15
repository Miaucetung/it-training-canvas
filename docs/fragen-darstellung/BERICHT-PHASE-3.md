# Prüfbericht Phase 3: Behebung von Fehlerart 4 (Überlappungen in Topologie-Grafiken)

**Branch:** `fix/diagram-overlaps`
**Datum:** 15. Oktober 2026
**Basis-Commit:** `6b5ee88` (aktueller `main`)
**Status:** **0 Fundstellen bei Fehlerart 4 erreicht** (Ziel vollständig erfüllt).

---

## 1. Management Summary & Vorher-Nachher-Vergleich

Im Rahmen von Phase 3 wurden sämtliche Überlappungen in Netzwerk-Topologie-Grafiken (Fehlerart 4) im gesamten Fragenbestand systematisch analysiert und behoben.

Als Ausgangsbasis diente ein vollständiger Prüflauf von `question-rendering.mjs` gegen den Dev-Server über alle 6 Konfigurationen (3 Viewports: 1440px Desktop, 1024px Tablet, 390px Mobile jeweils in Dark- und Light-Theme).

### Vorher-Nachher-Vergleich nach Fehlerarten

| Fehlerart | Beschreibung | Vorher (Phase 2 / Baseline) | Nachher (Phase 3) | Status |
|---|---|---|---|---|
| **1. Verdeckte Inhalte** | Letzte Option / Erklärung wird von Aktionsleiste überdeckt | 0 Fundstellen | **0 Fundstellen** | **Erfüllt** |
| **2. Abgeschnittener Text** | SVG-Texte / Labels außerhalb der viewBox | 0 Fundstellen | **0 Fundstellen** | **Erfüllt** |
| **3. Horizontales Scrollen** | Ungewolltes horizontales Scrollen | 0 Fundstellen | **0 Fundstellen** | **Erfüllt** |
| **4. Überlappung in Topologien** | Labels über Geräten oder anderen Labels | **155 Fragen betroffen** (2.480 registrierte Kollisionen über 6 Durchläufe) | **0 Fundstellen** (0 Fragen betroffen) | **Behoben (Ziel 0)** |
| **5. Hinweise vor der Antwort** | Grüne Zeilenmarkierung in CLI-Exhibits vor Prüfen | 0 Fundstellen | **0 Fundstellen** | **Erfüllt** |
| **6. Widersprüche / Inferenz** | Erfundene Standardgrafiken bei reinen Textfragen | 0 spekulative Grafiken | **0 spekulative Grafiken** | **Erfüllt** |
| **7. Platzhalter-Exhibits** | Leere Dummy-Exhibits `{ type: "none" }` | 0 Platzhalter | **0 Platzhalter** | **Erfüllt** |

---

## 2. Ursachenanalyse der Fehlerart 4

Die 2.480 Überlappungs-Befunde im Ausgangszustand gingen auf 119 distinkte kollidierende Label-Paare zurück, die sich in **drei allgemeine Ursachen** in `TopologyExhibit.tsx` und **drei Einzelfälle** aufteilen ließen:

### Allgemeine Ursachen in `TopologyExhibit.tsx`

1. **Kollision von Interface-Labels mit Gerätenamen bei abwärts gerichteten Links:**
   - *Problem:* Bei Links von oben nach unten (`uy > 0`) platzierte die bisherige Formel Schnittstellenbezeichnungen (`labelFrom`/`labelTo`) nahe am Gerät. Bei `y = d.y + 42` liegt jedoch der Gerätename (`d.label`), wodurch z. B. `G0/1` oder `F0/0` direkt auf Gerätenamen wie `R1`, `SW1` oder IP-Adressen wie `(1.1.1.1)` gerendert wurde.
   - *Lösung:* In `getInterfaceLabelLayout` werden steile Links (`|effUy| > 0.75`) mit seitlichem Versatz (`sideOffset = Math.max(16, devLabelW / 2 + 8)`) und gezieltem Textanker (`start` bzw. `end`) seitlich am Gerätenamen vorbeigeführt.

2. **Kollision von freien Labels mit Gerätenamen:**
   - *Problem:* Frei angehängte Labels (`labels` mit `position: "below"`) wurden im Abstand `off = 50` unter dem Gerätemittelpunkt positioniert. Da der Gerätename bei `y = 42` gerendert wird, überlappte das Label bei einer Texthöhe von 12–14px die Gerätebeschriftung.
   - *Lösung:* Der Abstand für `position: "below"` wurde in `TopologyExhibit.tsx` und der Bounding-Box-Berechnung `computeTopologyBounds` von `50` auf `62` erhöht. Damit bleibt zwischen Gerätename und Zusatzlabel ein sauberer vertikaler Freiraum von mindestens 8px.

3. **Kollision von Subnetz-Badges und Interface-Labels auf horizontalen/parallelen Links:**
   - *Problem:* Auf horizontalen oder leicht geneigten Links lagen Interface-Labels und das zentrierte Subnetz-Badge (`mx, my`) auf exakt derselben vertikalen Höhe. Bei redundanten Links zwischen zwei Geräten (z. B. zwei parallele Kabel zwischen zwei Routern) fielen die Linien und Labels deckungsgleich zusammen.
   - *Lösung:* Interface-Labels wurden mit `ny * 12` über die Link-Achse gehoben. Zusätzlich wurde eine Parallellink-Erkennung (`pairCounts`, `pShift = ±16px`) implementiert, die redundante Links parallel versetzt anordnet.

### Die verbleibenden 3 Einzelfälle

Nach Behebung der drei allgemeinen Ursachen verblieben exakt 3 Einzelfälle (in beiden Fragendateien `ccnaQuestions.ts` und `ccnaQuestionsClassified.ts`), bei denen ein manuell platziertes Label mit einem Interface kollidierte:
- **`q0463` / `Q0463`:** Label `"R3 = Primärroute, R2 = Backup"` war an `r1` mit `position: "left"` gehängt. Da der Link von R1 zu R2 nach links unten abzweigt, kollidierte das Label mit Interface `g0/1`.  
  *Korrektur:* Label-Position auf `position: "above"` gesetzt (Bereich oberhalb von R1 ist frei).
- **`q0898` / `Q0898`:** Label `"OSPF Area 0"` an `r3` mit `position: "left"` kollidierte mit dem nach links unten verlaufenden Interface `F0/0` zu R4.  
  *Korrektur:* Label-Position auf `position: "above"` gesetzt (Bereich oberhalb von R3 ist frei).
- **`q0944` / `Q0944`:** Label `"OSPF Area 0"` an `r3` mit `position: "left"` kollidierte mit dem Interface `F0/0` zu R4.  
  *Korrektur:* Label-Position auf `position: "above"` gesetzt.

---

## 3. Nachweis der Text- und Datenintegrität

Gemäß Aufgabenstellung durften in den Fragendateien (`ccnaQuestions.ts`, `ccnaQuestionsClassified.ts`) **ausschließlich Layout-Werte** angepasst werden. Sämtliche inhaltlichen Texte mussten zu 100 % unverändert bleiben:
- Gerätenamen, Interface-Namen, IP-Adressen, Subnetze, Label-Texte, Fragetexte, Optionen und Lösungen sind unverändert geblieben.

Zur automatischen Sicherstellung und kontinuierlichen Regression-Prüfung wurde der Unit-Test [`src/__tests__/lib/topology-layout-only.test.ts`](file:///c:/it-training-canvas-gemini/src/__tests__/lib/topology-layout-only.test.ts) hinzugefügt:
1. Lädt den exakten Stand von `main` (`6b5ee88`) per `git show` zur Laufzeit in isolierte VM-Kontexte.
2. Prüft für alle 1.081 Fragen aus `ccnaQuestions` und alle 1.055 Fragen aus `ccnaQuestionsClassified`:
   - Identische Fragenanzahl und IDs.
   - 100%ige Übereinstimmung der Fragetexte, Optionen, Lösungsindizes und Erklärungen.
   - Bei Topologie-Exhibits: Identische Geräte-IDs, Typen und Gerätenamen; identische Link-Endpunkte, Interface-Namen und Subnetze; identische Label-Texte und Zuordnungen.
   - Weist nach, dass sich **ausschließlich** bei `q0463` / `Q0463`, `q0898` / `Q0898` und `q0944` / `Q0944` das Feld `position` von `"left"` auf `"above"` geändert hat und keine weiteren Modifikationen existieren.

Der Test läuft bei jedem `npm test` automatisch mit.

---

## 4. Qualitätsprüfung vor Commit

Vor dem Commit wurden alle geforderten Prüfungen erfolgreich durchlaufen:
1. `npm run lint`: **0 Fehler** (48 vorbestehende Warnungen, keine Fehler).
2. `npm test`: **71 Test-Suiten, 1.621 Tests bestanden** (100 % erfolgreich).
3. `npm run build`: **Erfolgreich abgeschlossen** (`tsc -b && vite build` ohne Fehler).
4. `question-rendering.mjs` Playwright-Audit: **0 Fundstellen bei Fehlerart 4**.

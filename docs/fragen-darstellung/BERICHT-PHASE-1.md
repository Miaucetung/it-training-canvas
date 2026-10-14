# Prüfbericht Phase 1: Darstellung aller CCNA-Prüfungsfragen

**Status:** Phase 1 abgeschlossen (Reine Bestandsaufnahme & automatische DOM-Messung – keine fachlichen oder Code-Änderungen an Fragenkomponenten)  
**Datum:** 14. Oktober 2026  
**Branch:** `fix/question-rendering`  
**Geprüfte Fragen gesamt:** 2.217 Fragen  
- **Prüfungstrainer** (`ExamPrepDialog` / `src/data/ccnaQuestions.ts`): 1.081 Fragen  
- **Priorisiertes Lernen** (`QuizDialog` / `src/data/ccnaQuestionsClassified.ts`): 1.055 Fragen  
- **Drag-and-Drop-Trainer** (`DragDropTrainerDialog` / `src/data/ccnaDragDrop.ts`): 81 Fragen  

**Test-Matrix:**
- **Viewports:** 1440 × 900 px (Desktop), 1024 × 768 px (Tablet), 390 × 844 px (Mobile)
- **Themes:** Dark Mode & Light Mode
- **Zustände:** Vor dem Prüfen (`pre-check`) und nach dem Prüfen / Aufdecken (`post-check`)
- **Gesamtzahl durchgeführter Prüfschritte:** 6 Durchläufe × 2.217 Fragen = **13.302 automatisierte Fragenprüfungen**
- **Screenshots:** Gespeichert unter `.local/screenshots/` (nicht im Git-Repository)

---

## 1. Zusammenfassung der Messungen

Die Prüfung erfolgte vollständig skriptgesteuert per Playwright (`scripts/audit/question-rendering.mjs`) über direkte DOM-Messungen (`getBoundingClientRect()`, SVG `getBBox()`, `scrollWidth`/`clientWidth`-Vergleiche und CSS-Klassenprüfung).

| Fehlerart | 1440px | 1024px | 390px | Dark | Light | Eindeutige Fragen (Gesamt) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Verdeckte Inhalte durch fixierte Leisten** | 0 | 0 | 0 | 0 | 0 | **0** |
| **2. Abgeschnittener Text (SVG viewBox)** | 8.444 | 8.444 | 8.584 | 12.736 | 12.736 | **390** |
| **3. Horizontales Scrollen der Seite** | 0 | 0 | 0 | 0 | 0 | **0** |
| **4. Überlappung in Topologie-Grafik** | 13.924 | 13.924 | 13.900 | 20.874 | 20.874 | **396** |
| **5. Hinweise vor der Antwort (Highlight)** | 574 | 574 | 574 | 864 | 858 | **323** |
| **6. Widersprüche Grafik vs. Frage/Exhibit** | – | – | – | – | – | **89** (83 Regex-Inferenz + 6 CLI/Topologie) |
| **7. Fehlende / leere Exhibits & Einlesefehler** | – | – | – | – | – | **59** (1 fehlend + 4 none + 23 PDF-Ingestion + 31 Lösungsdiff) |

### Aufteilung der eindeutigen Fragen nach Fragenpool

| Fehlerkategorie | Prüfungstrainer (`ccnaQuestions`) | Priorisiertes Lernen (`ccnaQuestionsClassified`) | Drag & Drop (`ccnaDragDrop`) |
| :--- | :---: | :---: | :---: |
| 1. Verdeckte Inhalte | 0 | 0 | 0 |
| 2. Abgeschnittener Text (viewBox) | 176 | 214 | 0 |
| 3. Horizontales Scrollen | 0 | 0 | 0 |
| 4. Überlappung in Topologie | 178 | 218 | 0 |
| 5. Hinweise vor der Antwort | 149 | 174 | 0 |
| 6. Widersprüche & Fehlinferenzen | 6 | 83 | 0 |
| 7. Fehlende/Leere Exhibits & Diskrepanzen | 5 | 54 | 0 |

---

## 2. Detaillierte Fehleranalyse & vermutete Ursachen

### Fehlerart 1: Verdeckte Inhalte (0 Fundstellen)
- **Befund:** Bei der isolierten Messung des scrollbaren Inhaltsbereichs (`.overflow-y-auto`) gegen die fixierten Header- und Footer-Bounding-Boxes wurden 0 Kollisionen festgestellt.
- **Hintergrund:** Alle Dialoge nutzen ein konsistentes Flex-Spaltenlayout (`flex flex-col h-full` mit `shrink-0` für Header und Footer sowie `flex-1 min-h-0 overflow-y-auto` für den Inhalt). Dadurch können Antwortoptionen und Erklärungen auch auf 390px vollständig bis über den Footer hinaus gescrollt werden.

### Fehlerart 2: Abgeschnittener Text in SVG-Topologien (390 eindeutige Fragen)
- **Messwert-Belege:**
  - `q0001`: Text `"ML.S1"` und `"Firewall"` ragen links um bis zu 80–150px aus der `viewBox` heraus.
  - `q0006`: Text `"10.10.10.0/24"` ragt rechts um 48.2px aus der `viewBox` heraus.
  - `q0041`: Subnetz-Label `"192.168.1.0/24"` mit `position: "left"` ragt links um 72.5px aus der `viewBox` heraus.
  - `q0101`: MAC-Label `"MAC C601.420F.2007"` mit `position: "below"` ragt unten um 18.4px über `maxY` hinaus.
- **Vermutete Ursache:** In [`src/components/exhibits/TopologyExhibit.tsx`](file:///c:/it-training-canvas-new/src/components/exhibits/TopologyExhibit.tsx#L106-L111) wird die `viewBox` ausschließlich anhand der Mittelpunkte der Geräte berechnet:
  ```ts
  const minX = Math.min(...devices.map((d) => d.x)) - 60;
  const minY = Math.min(...devices.map((d) => d.y)) - 60;
  const maxX = Math.max(...devices.map((d) => d.x)) + 60;
  const maxY = Math.max(...devices.map((d) => d.y)) + 60;
  ```
  Freie Labels ([`labels`](file:///c:/it-training-canvas-new/src/components/exhibits/TopologyExhibit.tsx#L181-L196)) werden mit einem Offset von `off = 50px` platziert. Ein Label mit `position: "left"` und `anchor: "end"` erstreckt sich vom Punkt `d.x - 50` nach links. Bei einer Textlänge von 80–120px liegt der linke Textrand bei `d.x - 130` bis `d.x - 170`, während `minX` bei `d.x - 60` abgeschnitten wird. Die linke Hälfte des Labels ist im SVG unlesbar abgeschnitten.

### Fehlerart 3: Horizontales Scrollen (0 Fundstellen)
- **Befund:** Weder `document.documentElement` noch der Dialog-Container erzeugen horizontales Scrollen auf 1440, 1024 oder 390px.
- **Hintergrund:** Breite CLI-Tabellen und Codeblöcke besitzen eigene `overflow-x-auto`-Container mit Monospace-Schrift, was dem geforderten Verhalten entspricht.

### Fehlerart 4: Überlappungen in Topologie-Grafiken (396 eindeutige Fragen)
- **Messwert-Belege:**
  - `q0001`: Kollisionsfläche von 249.6 px² zwischen Gerätename und Link-Subnetz-Badge.
  - `q0010`: Subnetz-Badge `"172.16.1.0/24"` überdeckt die Linklinie und berührt das Interface-Label `.1`.
  - `q0054`: Zwei benachbarte Switches (Dist-1 und Dist-2) haben überlappende Bounding-Boxes bei ihren VLAN-Zonen-Labels.
- **Vermutete Ursache:** Die Koordinaten in `ccnaQuestions.ts` und den generierten Topologien basieren auf statischen Koordinatenrastern. Es gibt keine dynamische Kollisionserkennung zwischen Subnetz-Badges (`<rect> + <text>`) und Geräten bzw. Interface-Beschriftungen.

### Fehlerart 5: Hinweise vor der Antwort (323 eindeutige Fragen)
- **Messwert-Belege:**
  - `q0001`: Zeile `"O 10.10.13.0/25 [110/6576] via 10.10.10.1, 06:58:21, FastEthernet0/1"` wird vor dem Antworten mit `bg-green-900/40` grün hinterlegt gerendert.
  - `q0002`: Zeile `"O 10.10.13.208/29 [110/2] via 10..."` grün hervorgehoben.
  - `q0016`: Zeile `"Bad mask /28 for address 192.168.16.143"` grün hervorgehoben.
  - `q0075`: Zeile `"reliability 166/255, txload 1/255,"` grün hervorgehoben.
  - `q0093`: Zeile `"Fa0/1 connected 1"` grün hervorgehoben.
  - `q0123`: Zeile `"Full Duplex, 10000Mbps, link type is f"` grün hervorgehoben.
  - `q0135`: Zeile `"3612699 input errors, 3612699 CRC,"` grün hervorgehoben.
  - `q0186`: Zeile `"Trunking Native Mode VLAN: 1 (default)"` grün hervorgehoben.
  - `q0194`: Zeile `"vtp mode transparent"` grün hervorgehoben.
  - `q0466`: Zeile `"O 10.10.13.0/25 [110/11] via 10.10.10.9..."` grün hervorgehoben.
- **Vermutete Ursache:** In [`src/components/exhibits/CLIExhibit.tsx`](file:///c:/it-training-canvas-new/src/components/exhibits/CLIExhibit.tsx) wird `exhibit.highlight` statisch ausgewertet:
  ```tsx
  const isHighlighted = highlight?.some((h) => line.includes(h));
  return <div className={isHighlighted ? "bg-green-900/40" : ""}>{line}</div>;
  ```
  Der Komponente wird der Zustand `revealed` bzw. `isConfirmed` überhaupt nicht übergeben. Dadurch wird die Lösungszeile dem Benutzer sofort beim Öffnen der Frage mit Signalgrün präsentiert.

---

## 3. Auszug der Messwert-Tabelle (Beispielhafte Fundstellen)

| Fragen-ID | Fehlerart | Breite/Theme | Beleg (Messwert) | Vermutete Ursache |
| :--- | :--- | :---: | :--- | :--- |
| `q0001` | 5. Hinweis vor Antwort | 1440/Dark | 1 Zeile mit grünem Hintergrund vor Prüfen: `"O 10.10.13.0/25..."` | `CLIExhibit.tsx` ignoriert Prüf-Status |
| `q0001` | 2. Abgeschnittener Text | 1440/Dark | `"Firewall"` ragt um 162.9px links aus viewBox | `TopologyExhibit.tsx` ignoriert Label-Breiten |
| `q0001` | 4. Topologie-Überlappung | 1440/Dark | Label `"R1"` überlappt mit `"Internet"` (Kollision: 249.6px²) | Feste Rasterabstände ohne Collision Check |
| `q0002` | 5. Hinweis vor Antwort | 1024/Light | 1 Zeile mit grünem Hintergrund vor Prüfen: `"O 10.10.13.208/29..."` | `CLIExhibit.tsx` ignoriert Prüf-Status |
| `q0016` | 5. Hinweis vor Antwort | 390/Dark | 1 Zeile mit grünem Hintergrund vor Prüfen: `"Bad mask /28..."` | `CLIExhibit.tsx` ignoriert Prüf-Status |
| `q0041` | 2. Abgeschnittener Text | 390/Light | `"192.168.1.0/24"` ragt um 72.5px links aus viewBox | `TopologyExhibit.tsx` viewBox-Padding zu klein |
| `q0075` | 5. Hinweis vor Antwort | 1440/Light | Zeile `"reliability 166/255..."` vor Prüfen grün hinterlegt | `CLIExhibit.tsx` statisches Highlight |
| `q0089` | 7. Leeres Exhibit | Alle | `exhibit: { type: "none" }` | Überflüssiges Platzhalter-Objekt |
| `q0093` | 5. Hinweis vor Antwort | 1024/Dark | Zeile `"Fa0/1 connected 1"` vor Prüfen grün hinterlegt | `CLIExhibit.tsx` statisches Highlight |
| `q0101` | 6. Widerspruch / Fehlen | Alle | Frage nennt `fa0/1`, Grafik hat kein Interface-Label | Topologie-Exhibit unvollständig |
| `q0123` | 5. Hinweis vor Antwort | 390/Dark | 2 Zeilen vor Prüfen grün hinterlegt | `CLIExhibit.tsx` statisches Highlight |
| `q0135` | 5. Hinweis vor Antwort | 1440/Dark | Zeile `"3612699 input errors..."` vor Prüfen grün hinterlegt | `CLIExhibit.tsx` statisches Highlight |
| `q0265` | 7. Leeres Exhibit | Alle | `exhibit: { type: "none" }` | Überflüssiges Platzhalter-Objekt |
| `q0325` | 7. Leeres Exhibit | Alle | `exhibit: { type: "none" }` | Überflüssiges Platzhalter-Objekt |
| `q0365` | 7. Leeres Exhibit | Alle | `exhibit: { type: "none" }` | Überflüssiges Platzhalter-Objekt |
| `q0368` | 6. Inhaltl. Widerspruch | Alle | 3 Netze an `Fa0/2`, Next-Hop passt nicht zu `Fa0/1` | CLI-Routingtabelle fachlich fehlerhaft |
| `q0386` | 6. Inhaltl. Widerspruch | Alle | 3 `/24`-Netze directly connected an `Fa0/0` | CLI-Routingtabelle fachlich fehlerhaft |
| `q0387` | 6. Inhaltl. Widerspruch | Alle | 3 `/24`-Netze directly connected an `Fa0/0` | CLI-Routingtabelle fachlich fehlerhaft |
| `q0456` | 6. Inhaltl. Widerspruch | Alle | Ziel `10.10.8.14` nicht in Tabelle; `10.0.0.0/28` markiert | Frage/Exhibit passen nicht zueinander |
| `q0466` | 6. Inhaltl. Widerspruch | Alle | 2 Netze an `Fa0/2`, Next-Hop `10.10.10.1` passt nicht | CLI-Routingtabelle fachlich fehlerhaft |
| `q0964` | 7. Fehlendes Exhibit | Alle | Fragetext verweist auf Exhibit, `exhibit: false` | Exhibit fehlt (PDF Seite 428) |
| `Q0369` | 6. Fehlinferenz Grafik | Alle | Reine Theoriefrage zu HSRP erhält FHRP-Topologie | `inferDiagramId` Regex-Treffer |
| `Q0371` | 6. Fehlinferenz Grafik | Alle | Reine Theoriefrage zu HSRP erhält FHRP-Topologie | `inferDiagramId` Regex-Treffer |
| `Q0373` | 6. Fehlinferenz Grafik | Alle | CLI-Syntaxfrage zu HSRP erhält FHRP-Topologie | `inferDiagramId` Regex-Treffer |

*(Vollständige Datensätze aller 68.942 Messpunkte sind maschinenlesbar in `.local/rendering_audit_results.json` abgelegt).*

---

## 4. Getrennte Liste inhaltlicher Auffälligkeiten in Exhibits und Fragen (Nur Meldung – nicht verändert)

Gemäß der Projektregeln wurden diese fachlichen Unstimmigkeiten **nicht** verändert, sondern exakt dokumentiert:

### 4.1 Widersprüche in Routing-Tabellen und Topologien

1. **`q0466` (Routing-Tabelle & Topologie):**
   - **CLI-Exhibit:**
     ```text
     C 10.10.10.8/30 is directly connected, FastEthernet0/2
     C 10.10.12.0/30 is directly connected, FastEthernet0/2
     O 10.10.13.0/25 [110/11] via 10.10.10.9, 00:00:03, FastEthernet0/2
                             [110/11] via 10.10.10.1, 00:00:03, FastEthernet0/1
     C 10.10.4.0/30 is directly connected, FastEthernet0/1
     ```
   - **Auffälligkeiten:**
     1. Zwei unterschiedliche Subnetze (`10.10.10.8/30` und `10.10.12.0/30`) sind als *directly connected* an demselben physischen Interface `FastEthernet0/2` angegeben (ohne Subinterfaces/Secondary IPs).
     2. Die zweite OSPF-Route führt über den Next-Hop `10.10.10.1` aus `FastEthernet0/1` heraus. Direkt an `FastEthernet0/1` hängt jedoch das Netz `10.10.4.0/30`. Der Next-Hop `10.10.10.1` ist auf diesem Link nicht erreichbar.
     3. Die zugehörige Topologie zeigt Site A – Router1 – Router2 – Site B als schlichte Boxen ohne jegliche Interface-Beschriftung oder Subnetz-Angaben.

2. **`q0368` (Routing-Tabelle FastEthernet0/2):**
   - **CLI-Exhibit:** Drei Subnetze (`10.10.8.0/30`, `10.10.12.0/30`, `10.10.4.0/30`) sind alle als *directly connected* an `FastEthernet0/2` gelistet.
   - Die OSPF-Route nutzt als Next-Hop `10.10.10.5` an `FastEthernet0/1`, aber `FastEthernet0/1` hat gar kein direkt verbundenes Netz in der Routingtabelle.

3. **`q0386` & `q0387` (Drei /24-Subnetze an FastEthernet0/0):**
   - **CLI-Exhibit:** `192.168.12.0/24`, `192.168.13.0/24` und `192.168.14.0/24` sind alle drei als *directly connected* an `FastEthernet0/0` eingetragen.
   - Die Routen über Next-Hop `192.168.14.3` und `192.168.15.5` nutzen als Exit-Interface `FastEthernet0/1`, für das kein direkt verbundenes Netz existiert.

4. **`q0456` (Zieladresse passt zu keiner Route):**
   - **Frage:** „A packet sourced from 10.10.10.1 is destined for 10.10.8.14. What is the subnet mask of the destination route?“
   - **CLI-Exhibit:** Enthält nur `10.0.0.0/28`, `10.0.10.0/24`, `10.10.10.0/24` und Default-Route `0.0.0.0/0`.
   - **Auffälligkeit:** Es gibt überhaupt keine Route für `10.10.8.x`. Die korrekte Antwort ist als Option B (`255.255.255.240` = `/28`) hinterlegt und die Zeile `10.0.0.0/28` ist grün markiert, obwohl `10.0.0.0/28` das Paket `10.10.8.14` gar nicht matcht.

5. **`q0101` (Tippfehler & fehlende Interfaces):**
   - **Fragetext:** „An engineer is configuring the HO router. Which IPv6 address configuration must be applied to the router fa0/1 interface...“
   - **Auffälligkeit:** Tippfehler im Fragetext („HO router“ statt „HQ1 router“). In der Topologie fehlt die Beschriftung des Interfaces `fa0/1`. In Option C wird die MAC-Adresse bei der EUI-64-Generierung verstümmelt.

---

### 4.2 Automatische Fehlinferenz generischer Diagramme (`inferDiagramId`)

In [`src/lib/quiz-to-exam.ts`](file:///c:/it-training-canvas-new/src/lib/quiz-to-exam.ts#L47-L62) ordnet die Funktion `inferDiagramId` Fragen aus `ccnaQuestionsClassified` anhand von Regex-Keywords generische Konzept-Topologien zu. Dies führt bei **83 Fragen** dazu, dass reine Text- oder CLI-Syntaxfragen fälschlicherweise eine Topologie erhalten:

- **23 FHRP-Fragen** (z. B. `Q0369`, `Q0371`, `Q0373`): Reine Multiple-Choice-Fragen zu HSRP-Zuständen oder CLI-Befehlen (`standby 1 priority 110 preempt`) erhalten ein vollständiges Gateway-Redundanz-Diagramm mit festen IP-Adressen, die gar nicht zur Frage gehören.
- **20 Spanning-Tree-Fragen** (z. B. Fragen zu PortFast/BPDU-Guard): Erhalten automatisch eine 4-Switch-STP-Topologie.
- **22 EtherChannel-Fragen**: Erhalten LACP/PAgP-Topologien mit festen Interface-Bezeichnungen.
- **7 Admin-Distance-Fragen**: Erhalten statische Distanz-Tabellen.
- **5 OSPF-DR/BDR-Fragen**, **3 VLAN-Trunk-Fragen**, **2 NAT-PAT-Fragen**, **1 Longest-Prefix-Frage**.

> [!NOTE]
> Die Regel des Nutzers lautet hierzu eindeutig: *„Grafiken ohne eindeutige Zuordnung lieber schlicht lassen als raten.“* In Phase 2 sollte diese pauschale Inferenz für Fragen deaktiviert werden, die im Cisco-Original kein Exhibit besitzen.

---

### 4.3 Fehlende und leere Exhibits

1. **`q0964` (Fehlende Grafik):**
   - **Fragetext:** „Refer to the exhibit. An engineer must configure...“
   - **App:** `exhibit: false` bzw. kein Exhibit vorhanden.
   - **PDF-Referenz:** Befindet sich auf Seite 428 der Referenz-PDF mit einer Topologie-Grafik.
2. **`q0089`, `q0265`, `q0325`, `q0365` (Leere Platzhalter):**
   - Besitzen `exhibit: { type: "none" }`, obwohl es sich um reine Textfragen ohne Exhibit-Bezug handelt.

---

### 4.4 Diskrepanzen zur Referenz-PDF (`00-FragenBeantwortetKomplett200_301.pdf`)

Mittels PDF-Parser wurden alle 590 Seiten der PDF gegen die App-Fragen abgeglichen (1.159 Fragen exakt zugeordnet):

#### 23 Einlesefehler (Optionenanzahl abweichend)

| Fragen-ID | Seite in PDF | Art der Abweichung | App-Zustand | PDF-Zustand |
| :--- | :---: | :--- | :--- | :--- |
| `q0045` | 17 | Optionen-Anzahl | 5 Optionen | 4 Optionen |
| `q0086` | 29 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0166` | 61 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0171` | 62 | Optionen-Anzahl | 4 Optionen | 2 Optionen |
| `q0181` | 66 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0219` | 81 | Optionen-Anzahl | 6 Optionen | 4 Optionen |
| `q0313` | 123 | Optionen-Anzahl | 4 Optionen | 2 Optionen |
| `q0382` | 156 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0419` | 176 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0476` | 206 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0522` | 232 | Optionen-Anzahl | 6 Optionen | 5 Optionen |
| `q0551` | 241 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0565` | 246 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0658` | 286 | Optionen-Anzahl | 5 Optionen | 4 Optionen |
| `q0821` | 347 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0834` | 352 | Optionen-Anzahl | 4 Optionen | 2 Optionen |
| `q0875` | 374 | Optionen-Anzahl | 4 Optionen | 1 Option |
| `q0876` | 377 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q0983` | 437 | Optionen-Anzahl | 5 Optionen | 4 Optionen |
| `q0984` | 439 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q1014` | 452 | Optionen-Anzahl | 4 Optionen | 8 Optionen |
| `q1149` | 525 | Optionen-Anzahl | 4 Optionen | 3 Optionen |
| `q1198` | 546 | Optionen-Anzahl | 4 Optionen | 3 Optionen |

#### 31 Lösungsbuchstaben- & Text-Diskrepanzen zur PDF

| Fragen-ID | Seite in PDF | Art der Abweichung | App-Wert | PDF-Referenz |
| :--- | :---: | :--- | :--- | :--- |
| `q0008` | 4 | Lösung weicht ab | Lösung: C | PDF grün markiert: A, C |
| `q0034` | 12 | Fragetext gekürzt | 256 Zeichen | 181 Zeichen (Absatz fehlt) |
| `q0145` | 53 | Fragetext abweichend | 340 Zeichen | 198 Zeichen |
| `q0219` | 81 | Lösung weicht ab | Lösung: A, C, D, E | PDF grün markiert: A |
| `q0222` | 82 | Lösung weicht ab | Lösung: B, D, E | PDF grün markiert: A, B, D, E |
| `q0224` | 83 | Lösung weicht ab | Lösung: A, C | PDF grün markiert: A, C, D |
| `q0241` | 89 | Lösung weicht ab | Lösung: B, C | PDF grün markiert: B |
| `q0245` | 91 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0253` | 94 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0257` | 95 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, C |
| `q0267` | 100 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B, D |
| `q0277` | 106 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, C |
| `q0300` | 118 | Lösung weicht ab | Lösung: A, B | PDF grün markiert: A, B, C |
| `q0318` | 125 | Lösung weicht ab | Lösung: B | PDF grün markiert: B, D |
| `q0332` | 132 | Lösung weicht ab | Lösung: B | PDF grün markiert: A, B |
| `q0338` | 135 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0343` | 137 | Lösung weicht ab | Lösung: B | PDF grün markiert: B, C |
| `q0361` | 146 | Lösung weicht ab | Lösung: A, B | PDF grün markiert: A, B, C |
| `q0376` | 153 | Lösung weicht ab | Lösung: A, B | PDF grün markiert: A, B, D |
| `q0380` | 155 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0395` | 162 | Lösung weicht ab | Lösung: A, B | PDF grün markiert: A, B, C |
| `q0412` | 172 | Lösung weicht ab | Lösung: B | PDF grün markiert: A, B |
| `q0428` | 180 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0433` | 183 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0469` | 202 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0475` | 205 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0500` | 219 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0510` | 224 | Lösung weicht ab | Lösung: B | PDF grün markiert: A, B |
| `q0520` | 230 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |
| `q0527` | 234 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, C |
| `q0534` | 236 | Lösung weicht ab | Lösung: A | PDF grün markiert: A, B |

---

## 5. Empfohlene Maßnahmen für Phase 2 (nach Freigabe)

Sobald das OK für Phase 2 vorliegt, können die rein darstellungsbezogenen Fehler über zentrale Komponentenkorrekturen nachhaltig behoben werden:

1. **Behebung von Fehler 5 (Hinweise vor der Antwort in CLI-Exhibits):**
   - In [`src/components/exhibits/CLIExhibit.tsx`](file:///c:/it-training-canvas-new/src/components/exhibits/CLIExhibit.tsx) die Property `revealed?: boolean` ergänzen.
   - Die CSS-Klasse `bg-green-900/40` darf **nur** dann gerendert werden, wenn `revealed === true` ist. Vor dem Klick auf „Prüfen“ bleibt der Text unhervorgehoben.
2. **Behebung von Fehler 2 (Abgeschnittener Text / SVG viewBox):**
   - In [`src/components/exhibits/TopologyExhibit.tsx`](file:///c:/it-training-canvas-new/src/components/exhibits/TopologyExhibit.tsx) die Berechnung von `minX`, `minY`, `maxX`, `maxY` so erweitern, dass auch angehängte Labels mit ihren Textbreiten und Offsets berücksichtigt werden (z. B. horizontales Padding von mindestens 120px bei links-/rechtsbündigen Labels).
3. **Behebung von Fehler 4 (Überlappende Labels in Topologien):**
   - In `TopologyExhibit.tsx` automatischen vertikalen Ausgleich für benachbarte Subnetz-Badges und Interfaces einführen.
4. **Deaktivierung von Regex-Fehlinferenzen (`inferDiagramId`):**
   - In [`src/lib/quiz-to-exam.ts`](file:///c:/it-training-canvas-new/src/lib/quiz-to-exam.ts) die pauschale Zuweisung von generischen Topologien für Fragen deaktivieren, die im Original kein Exhibit haben.
5. **Bereinigung überflüssiger `exhibit: { type: "none" }`:**
   - Bereinigung der 4 Fragen (`q0089`, `q0265`, `q0325`, `q0365`).

---

**Bereit für Phase 2. Warte auf Freigabe / OK durch den Benutzer.**


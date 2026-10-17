# Entscheidungen zu den inhaltlichen Befunden

Grundlage: [INHALTLICHE-PRUEFUNG.md](INHALTLICHE-PRUEFUNG.md). **Bisher ist nichts geändert.** Umgesetzt wird nur, was in der Spalte „Entscheidung“ mit **übernehmen** gefüllt ist (je Zeile eintragen: `übernehmen`, `ablehnen` oder `später`). Danach folgt die Umsetzung mit bewusster Snapshot-Aktualisierung (`npm run snapshot:content:update`) und der Liste der geänderten Fragen-IDs.

Buchstaben beziehen sich auf die App-Reihenfolge der Optionen (A = erste Option). „Optionen bereinigt“ bedeutet: Optionstexte auf den Wortlaut der PDF zurücksetzen und überzählige Optionen entfernen. Gilt für beide Pools (`ccnaQuestions` und `ccnaQuestionsClassified`, Q-ID in Großbuchstaben), wo die Frage dort vorkommt.

## Verweis: die 7 echten Lösungsabweichungen aus INHALTLICHE-PRUEFUNG.md (Abschnitt 1)

Jede hat eine eigene Zeile unten. Dazu kommt A5 (q1014), das ein echter Einlesefehler ist, aber keine der 7 Lösungsabweichungen.

| Frage | Kennung | Abschnitt |
|---|---|---|
| q0219 | A1 | A |
| q0501 | A2 | A |
| q0658 | A3 | A |
| q0769 | A4 | A |
| q1151 | A6 | A |
| q0593 | D1 | D |
| q1227 | D2 | D |

## A. Eingeschleuste Folgefragen entfernen (10 Fragen, Vorbelegung: fremde Optionen und Lösungsteile entfernen)

| Nr. | Frage | Kurzbeschreibung | Aktuelle Lösung | Vorgeschlagene Lösung | Sicherheit | Entscheidung |
|---|---|---|---|---|---|---|
| A1 | q0219 | CDP-Aussage; 6 statt 4 Optionen, Text aus Q0220 eingemischt | A, C, D, E | **A**; Optionen bereinigt (4) | sicher | |
| A2 | q0501 | VRRP-Virtual-MAC; Optionen mit Text aus Q0502 | B, D | **B**; Optionen bereinigt | sicher | |
| A3 | q0658 | ACL Gi0/0 erlauben, Gi0/1 verweigern; 5 statt 4 Optionen (Q0659) | A, B, C | **A**; Optionen bereinigt (4) | sicher | |
| A4 | q0769 | „How many JSON objects“; Optionen mit Text aus Q0770 | A, D | **A**; Optionen bereinigt | sicher | |
| A5 | q1014 | SDN Control/Data Plane; Optionen mit Q1015 eingemischt, Exhibit (JSON) gehört zu Q1015 | C, D | **C**; Optionen bereinigt; Exhibit entfernen | sicher | |
| A6 | q1151 | DHCP-Renew; Lösung B stammt von unbenannter Root-Bridge-Zusatzfrage, Option D mit deren Text | C, B | **C**; Optionen bereinigt | sicher | |
| A7 | q0271 | RSTP-Zustände; Option E mit „Q0272 #autonomousaccesspoint …“ | D, E | D, E (unverändert); Option E = „forwarding“ | sicher | |
| A8 | q0786 | HTTP-Header „Accept“; Optionen mit „One/Four/Seven/Nine“ und Q0787-Text | D | D (unverändert); Optionen bereinigt | sicher | |
| A9 | q0840 | WLAN Web Passthrough; Optionen mit Text aus Q0841 | D | D (unverändert); Optionen bereinigt | sicher | |
| A10 | q1163 | Private IPv4-Adressen; Optionen mit Text aus Q1164 | D | D (unverändert); Optionen bereinigt | sicher | |

## B. Verschwundene Folgefragen

| Nr. | Frage | Kurzbeschreibung | Aktuell | Vorschlag | Sicherheit | Entscheidung |
|---|---|---|---|---|---|---|
| B1 | Q0220, Q0502, Q0770, Q0841, Q1015, Root-Bridge-Frage (aus Q1151), Q1164 | Folgefragen, die in der PDF stehen und im Pool fehlen | nicht im Pool | **nicht neu aufnehmen** (Vorgabe) | – | |

## C. Einzelwahl-Fragen mit zwei Lösungen

| Nr. | Frage | Kurzbeschreibung | Aktuelle Lösung | Vorgeschlagene Lösung | Sicherheit | Entscheidung |
|---|---|---|---|---|---|---|
| C1 | q0213 | VLAN 10 von SW1 bei nativem VLAN 100 auf SW2 | B, C | **B** (landet im nativen VLAN 100; die PDF markiert C „drops“, fachlich zweifelhaft) | wahrscheinlich | |
| C2 | q0060 | Binärmuster der IPv6 Unique Local Address | B, D | **B** (laut PDF; D `11111101` wäre praxisnah) | unklar | |
| C3 | q0949 | IP-Header-Feld bei QoS-Marking | C, D | **C** (laut PDF; D „DSCP“ ist Teil des ToS-Bytes) | unklar | |
| C4 | q0982 | Gruppe betritt Gebäude mit dem Badge einer Person | C, D | **D** (laut PDF; C „physical access control“ wäre formal vertretbar) | unklar | |

## D. Widersprüchliche PDF-Markierungen

| Nr. | Frage | Kurzbeschreibung | Aktuelle Lösung | Vorgeschlagene Lösung | Sicherheit | Entscheidung |
|---|---|---|---|---|---|---|
| D1 | q0593 | PC ohne Internet, Gateway 10.2.2.10 liegt außerhalb 10.2.2.0/29; PDF markiert B | C | **C** belassen | wahrscheinlich | |
| D2 | q1227 | gleiche Frage; PDF markiert A (dritte Kopie Q1124: C) | C | **C** belassen | wahrscheinlich | |

## E. Leere oder verschobene Angaben

| Nr. | Frage | Kurzbeschreibung | Aktuelle Lösung | Vorgeschlagene Lösung | Sicherheit | Entscheidung |
|---|---|---|---|---|---|---|
| E1 | q1254 / Q1254 | Fragetext leer; auch die PDF hat keinen Text (nur JSON-Bild und Optionen), PDF-Lösung „value“ | A (value) | **im Trainer ausblenden, nicht löschen**: Ausschlussliste für Trainer und Prüfungsmodus (`ccna-exam-pool.ts`, `ccna-classified-pool.ts`, `ccna-question-pool.ts`), Daten bleiben unverändert | sicher | |
| E2 | q0551 / Q0551 | Option A ist leer, steht schon so in der PDF; Lösung D „6“ korrekt | D | **unverändert** (Text von Option A nicht ableitbar) | sicher | |
| E3 | q0665 | App-Frage „How does MAC learning function?“ ist PDF „Q0664 (2)“; PDF-Q0665 ist eine Drag-and-Drop-Frage; Antwort D fachlich richtig | D | **unverändert**; nur Vermerk, kein Eingriff | sicher | |
| E4 | q1006, q1157, q1288 | je zweimal im Pool mit gleicher ID und unterschiedlichem Inhalt (die PDF nummeriert selbst doppelt) | – | **unverändert**; Folgen für Fortschritt und Schwächeliste vorher prüfen | sicher | |

## F. Befunde aus INHALTLICHE-BEFUNDE.md ohne neue Prüfung

Nicht Teil der PDF-Prüfung; Vorschlag jeweils: **unverändert belassen** (Quellfehler, keine Korrektur ohne Vorgabe).

| Nr. | Frage | Kurzbeschreibung | Aktuelle Lösung | Vorschlag | Sicherheit | Entscheidung |
|---|---|---|---|---|---|---|
| F1 | q0466 | Routing-Tabelle: zwei Netze an Fa0/2, Next-Hop passt nicht zum Interface | – | unverändert | – | |
| F2 | q0368 | drei directly-connected-Netze an Fa0/2, Fa0/1 ohne Netz | – | unverändert | – | |
| F3 | q0386, q0387 | drei /24 an Fa0/0, Next-Hops über Fa0/1 | – | unverändert | – | |
| F4 | q0456 | Ziel 10.10.8.14 nicht in der Tabelle, Lösung /28 | – | unverändert | – | |
| F5 | q0101 | „HO“ statt „HQ1“, Interface fa0/1 unbeschriftet, MAC-Verstümmelung in Option C | – | unverändert | – | |
| F6 | q0829 / Q0829 | Tippfehler „FastEthemet0/13“ im Fragetext | – | unverändert | – | |
| F7 | q0965 / Q0965 | Tippfehler „name-serveer“, „domain mame“ in Optionen | – | unverändert | – | |

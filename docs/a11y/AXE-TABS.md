# axe-Lauf über jeden Reiter einzeln (alle Regeln)

Erzeugt von `scripts/e2e/a11y-tabs-sweep.mjs` und `scripts/e2e/a11y-tabs-report.mjs`. Je Werkzeug-Dialog, Labs-Dialog, Prüfungstrainer-Menü und Priorisiertes Lernen wird jeder gefundene Reiter (role="tab"; in den Drills die Modus-Schalter mit aria-pressed) aus frischem Zustand geöffnet und mit allen axe-Regeln geprüft (1440/390 px, hell/dunkel). Canvas v1 und v2 sind nicht Teil dieses Laufs (siehe `AXE-SWEEP.md`, nur aufgelistet). Es wurde nichts geändert.

**58 Zustände (Ansicht × Reiter) in 232 Läufen: 58 Zustände in allen vier Kombinationen sauber, 0 mit Verstößen oder Skriptfehlern.**

## Übersicht je Ansicht

| Ansicht | Zustände | davon mit Verstößen |
|---|---:|---:|
| Werkzeug: Subnetting-Drill | 3 | 0 |
| Werkzeug: Routing-Drill | 3 | 0 |
| Werkzeug: OSPF-Wildcard-Drill | 4 | 0 |
| Werkzeug: ACL-Drill | 8 | 0 |
| Werkzeug: Subnetting-Quiz | 1 | 0 |
| Werkzeug: Subnetting-Cheatsheet | 1 | 0 |
| Werkzeug: IPv4-Subnetztabelle | 4 | 0 |
| Werkzeug: IPv6-Rechner | 6 | 0 |
| Werkzeug: VLAN-Simulator | 5 | 0 |
| Werkzeug: STP-Simulator | 5 | 0 |
| Werkzeug: OSI-Simulator | 1 | 0 |
| Werkzeug: Routing-Simulator | 6 | 0 |
| Werkzeug: Verkabelungs-Trainer | 4 | 0 |
| Werkzeug: Drag-and-Drop-Trainer | 1 | 0 |
| Werkzeug: Topologie-Erkunder | 1 | 0 |
| Werkzeug: CLI-Glossar | 1 | 0 |
| Labs-Dialog (Liste) | 1 | 0 |
| Labs-Dialog (Lab geöffnet) | 1 | 0 |
| Prüfungstrainer: Menü | 1 | 0 |
| Priorisiertes Lernen: Menü | 1 | 0 |

## Befunde je Werkzeug und Reiter

Keine Verstöße.

## Nach Regel

| Regel | Schwere | Betroffene Zustände | Elemente (Summe über Läufe) |
|---|---|---:|---:|

## Grenzen des Laufs

- Reiter werden über role="tab" gefunden. Dialoge ohne Tabs (Drills) werden über ihre Modus-Schalter (button mit aria-pressed) geprüft; Labs, Prüfungstrainer und Priorisiertes Lernen nur im Standardzustand (Labs zusätzlich mit geöffnetem Lab).
- Der Vorgängerlauf (`AXE-TABS-VORHER.md`) fand Reiter heuristisch und zählte dabei auch Schaltflächen, die keine Reiter sind; deshalb unterscheidet sich die Zahl der Zustände.
- Zustände nach Eingaben (Quiz beantworten, Drill prüfen, Ergebnisbildschirme) sind nicht Teil dieses Laufs.

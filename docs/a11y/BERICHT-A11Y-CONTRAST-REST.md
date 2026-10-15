# Bericht: fix/a11y-contrast-rest

Vorher: [AXE-SWEEP-VOR-CONTRAST-REST.md](AXE-SWEEP-VOR-CONTRAST-REST.md) (main, bdaf5af). Nachher: [AXE-SWEEP.md](AXE-SWEEP.md).

**Ergebnis: 116 Läufe, vorher 93 sauber / 23 mit Verstößen, nachher 108 sauber / 8 mit Verstößen. Betroffene Elemente 99 → 66. Alle verbleibenden Verstöße liegen in Canvas v1 und Canvas v2 (nicht angefasst).**

## Matrix (nur geänderte und noch offene Ansichten; alle übrigen Ansichten bleiben sauber)

| Ansicht | Läufe mit Verstößen (von 4) vorher → nachher | Elemente vorher → nachher | Rest |
|---|---|---|---|
| Header: Navigation/Werkzeuge-Menü (390 px hell) | 1 → 0 | 5 → 0 | – |
| Priorisiertes Lernen: Menü | 4 → 0 | 8 → 0 | – |
| Subnetting-Drill | 2 → 0 | 8 → 0 | – |
| Routing-Drill | 2 → 0 | 2 → 0 | – |
| Routing-Simulator | 4 → 0 | 8 → 0 | – |
| Topologie-Erkunder | 2 → 0 | 2 → 0 | – |
| Canvas v1 (wird entfernt) | 4 → 4 | 22 → 22 | unverändert |
| Canvas v2 (Gemini) | 4 → 4 | 44 → 44 | unverändert |
| **Summe** | **23 → 8** | **99 → 66** | |

## Umgestellte Komponenten (feste Farbklassen vorher → nachher)

| Datei | Klassen |
|---|---|
| RoutingSimulatorDialog | 150 → 1 |
| SubnettingDrillDialog | 162 → 1 |
| RoutingDrillDialog | 62 → 1 |
| MobileNavDrawer (Header-Menü 390 px) | 56 → 1 |
| TopologieExplorerDialog | 40 → 1 |
| PrioritizedLearningDialog | 39 → 1 |

Übrig ist jeweils der Scrim `bg-black/60` des Dialog-Hintergrunds bzw. im Drawer eine Einzelstelle. Die Baseline der Sperrklinke ist per `npm run baseline:colors:update` nachgezogen (nur Senkungen).

## Vorgehen und Entscheidungen

- Gleiche Zuordnung wie bei `fix/a11y-critical`: Panel `bg-card border-border text-foreground`, Kacheln/Hover `bg-muted`, Sekundärtext `text-muted-foreground`, Akzent `accent-primary(-fg)` bzw. `bg-accent-solid text-on-accent-solid`, Status `status-*`, Terminal-Eingabefelder `terminal-*`. Die `dark`-Weichen sind entfernt (Props bleiben optional in der Signatur).
- **Priorisiertes Lernen**: Kacheln „Fragen üben“ und „Schwächen-Drill“ wie im Prüfungstrainer (`accent-primary` bzw. `status-blocking`); deaktivierter Zustand mit eigenen Farben (`disabled:bg-muted disabled:text-muted-foreground`) statt `opacity-40`.
- **Routing-Simulator, Topologie-Erkunder**: SVG-Strich- und -Textfarben aus `dark ? "#hex" : "#hex"` wurden zu CSS-Variablen (`var(--muted-foreground)`, `var(--foreground)`, `var(--status-*)`, `var(--accent-*)`). Deaktivierte Buttons und Nebentexte mit `opacity-*` nutzen explizite Farben.
- **Routing-Simulator, Traceroute-Ausgabe**: `terminal-*`-Tokens. Weiße Beschriftungen auf Datenfarben in einzelnen SVG-Kreisen (Hex-Füllungen für Geräte und Hops) sind unverändert; sie werden von axe nicht beanstandet und zählen nicht als Klassen.
- **Header-Menü**: Die Menüs waren für dunklen Hintergrund gefärbt (`text-sky-400`, `bg-sky-500/20 text-sky-300` …) und auf hellem Grund unlesbar (Kontrast bis 1,25:1). Jetzt Tokens; Chips mit `/10`-Tönung.
- Nicht berührt: `src/components/canvas-v2/`, `src/lib/topology/`, Canvas-v1-Code.

## Geprüft

- axe-Sweep über alle 29 Ansichten × 4 Kombinationen (siehe oben).
- Zusätzliche Zustände einzeln (1440 px, hell und dunkel): alle 5 Tabs des Routing-Simulators, Segmentierung im Subnetting-Drill, ausgefallener Link im Topologie-Erkunder.
- Lint 0 Fehler (48 Warnungen wie zuvor), 1852 Tests, Build und `test:e2e:browser` (31 von 31) grün.

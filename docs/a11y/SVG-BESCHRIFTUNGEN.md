# Kontrast von SVG-Beschriftungen auf Füllungen (Nicht-Canvas)

Skript: `scripts/e2e/svg-label-contrast.mjs` (nur lesend; `EXHIBITS=1` ergänzt alle Prüfungsfragen mit Grafik). Je `<text>` werden die berechnete Füllfarbe, die darunterliegenden SVG-Formen (von unten nach oben mit Deckkraft überlagert) und der HTML-Hintergrund zusammengerechnet; Ziel 4,5:1. 1440 px, hell und dunkel.

Geprüft: Dashboard, alle 16 Werkzeuge inkl. Reiter, Labs-Dialog (OSPF-Lab), Prüfungsfrage mit Grafik q0109 sowie **alle 363 Prüfungsfragen mit Exhibit** (11.422 Beschriftungen, niedrigster Wert 5,17:1, keine Stelle unter 4,5:1). Gesamt 12.704 Beschriftungen, 86 unter 4,5:1; alle in Routing-Simulator und STP-Simulator (plus ein Messartefakt im Labs-Dialog, s. u.). axe erkennt diese Fälle nicht, weil es Formfüllungen in SVG nicht als Hintergrund auswertet.

Beim Nachrechnen fiel ein Fehler aus `fix/a11y-contrast-rest` auf, der hier mitbehoben ist: Im Routing-Simulator stand die Beschriftung unter dem PC-Symbol (`DeviceIcon`, Art `pc`) im aktiven Zustand auf `--on-accent-solid` und war damit im dunklen Thema dunkel auf dunkel (1,12:1), im hellen weiß auf weiß. Die Beschriftung liegt außerhalb der Form und nutzt jetzt immer `var(--foreground)`.

## Stellen unter 4,5:1

### Routing-Simulator (`src/components/RoutingSimulatorDialog.tsx`)

| Stelle (Zeile) | Text auf Füllung | Kontrast | Thema |
|---|---|---|---|
| Router-Kreise im Reiter „5 · SPF / Cost“ (≈1258), Füllung `#f59e0b` (Ziel) | „R4“ weiß | 2,15 | beide |
| Router-Kreise, Füllung `#10b981` (Pfad) | „R2“ weiß (13 px) | 2,54 | beide |
| Kostenfeld auf Pfad-Link (Reiter 5) | „1“ weiß auf `#10b981` (11 px) | 2,54 | beide |
| Router-Kreis Quelle `#0ea5e9` (Reiter 4 und 5) | „R1“ weiß | 2,77 | beide |
| Traceroute-Hop-Kreise (≈768), `#ef4444` | „0“ (9 px), „R1“ weiß | 3,76 | beide |
| Router-Kreis Nachbar-Zustände, `#8b5cf6` (≈1001/1013) | „R2“ weiß | 4,23 | beide |
| Traceroute: Hop-Beschriftung und IP in `#0ea5e9` auf Hintergrund (≈739, 757) | „1“, „192.168.1.1“ | 2,77 | hell |
| Paket-Symbol (≈635), `#10b981` | „📦“ weiß | 2,54 (Emoji, kaum aussagekräftig) | beide |

### STP-Simulator (`src/components/StpSimulatorDialog.tsx`)

| Stelle | Text auf Füllung | Kontrast | Thema |
|---|---|---|---|
| Port-Rollen-Marke „DP“ (`roleColor`, `#10b981`) | weiß, 9 px | 2,54 | beide |
| „RP“ (`#3b82f6`) | weiß, 9 px | 3,68 | beide |
| „BLK“ (`#ef4444`) | weiß, 9 px | 3,76 | beide |
| „MAC ..0001 · cost→0“ usw. (≈375, Füllung `#64748b`) | Grau auf `#0f172a`, 9 px | 3,75 | dunkel |
| „Klick auf Cost-Label = Link aus“ (≈393) | `#64748b` auf `#f1f5f9`, 10 px | 4,34 | hell |
| „👑 ROOT“ (≈344), `#facc15` | auf weiß, 14 px | 1,53 | hell |

### Labs-Dialog

Im hellen Thema meldet das Skript 10 Stellen (Modellbeschriftungen `#94a3b8` u. a., 1,05–2,33:1). Das ist ein Messartefakt: der Dialog ist laut CLAUDE.md bewusst immer dunkel, das Skript rechnet dort die halbtransparenten Dialogflächen über die helle Seite. Im dunklen Lauf, der die tatsächliche Darstellung zeigt, liegt keine Stelle unter 4,5:1.

## Einordnung

- Weiß auf den Statusfarben `#10b981`, `#0ea5e9`, `#f59e0b`, `#ef4444`, `#3b82f6` erreicht 4,5:1 nie; die Tokens `--status-*-solid` und `--on-status-*-solid` bzw. `--accent-solid` sind dafür gedacht (dort ist der Kontrast gesichert).
- Offen sind das Reparieren dieser Stellen (nicht Teil der Prüfung) und die Frage, ob Datenfarben in Netz-Diagrammen (Pfad = grün, Ziel = gelb) erhalten bleiben sollen; dann bräuchte es dunkle Beschriftungen auf den hellen Füllungen (`#f59e0b`, `#10b981`).

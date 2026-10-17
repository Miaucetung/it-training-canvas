# Bericht: fix/a11y-tabs

Grundlage: Reiter-Sweep [AXE-TABS-VORHER.md](AXE-TABS-VORHER.md) (main, ab3bf6e). Nachher: [AXE-TABS.md](AXE-TABS.md) und Haupt-Sweep [AXE-SWEEP.md](AXE-SWEEP.md).

## Ergebnis

| Lauf | vorher | nachher |
|---|---|---|
| Reiter-Sweep (alle Regeln, 1440/390 px, hell/dunkel) | 112 Zustände, 97 sauber, 15 mit Verstößen, 2 Läufe mit Skriptfehler | 58 Zustände, **alle sauber**, 0 Skriptfehler |
| Haupt-Sweep (29 Ansichten × 4) | 108/116 sauber (Rest Canvas v1/v2) | 108/116 sauber (Rest weiterhin nur Canvas v1/v2, nicht angefasst) |

Die Zahl der Zustände sinkt, weil der Sweep Reiter jetzt über `role="tab"` findet (in den Drills über die Modus-Schalter mit `aria-pressed`) statt heuristisch; der Vorgänger zählte auch Schaltflächen, die keine Reiter sind (z. B. 21 Zustände im CLI-Glossar).

## a) Critical (je Werkzeug ein Commit)

| Befund | Behebung |
|---|---|
| IPv6-Rechner „Segmentierung“: Präfix- und CIDR-Feld ohne Namen | `label htmlFor` + `id` |
| VLAN-Simulator „Trunk-Animation“: Geschwindigkeits-Slider ohne Namen | `<label htmlFor="vlan-trunk-speed">` |
| VLAN-Simulator „Packet-Walk“: 6 Schritt-Punkte ohne Namen | `aria-label="Schritt n von N"`, aktueller Schritt `aria-current="step"` |

## b) Übrige Befunde

| Werkzeug / Reiter | Befund | Behebung |
|---|---|---|
| OSPF-Wildcard-Drill | Prompt `text-slate-500` (dunkel), `text-indigo-400` (hell) | Datei auf Design-Tokens, Eingabefeld Terminal-Tokens |
| ACL-Drill „ACE schreiben“/„Advanced“ | Prompt in `text-terminal-muted` auf heller Karte | `text-muted-foreground` |
| Subnetting-Quiz „Cheatsheet“ | Tabellenkopf/Hinweis `gray-400/500` | Datei vollständig auf Tokens (`dark:`-Varianten aufgelöst) |
| VLAN-Simulator | „6B“ auf gewähltem Frame-Feld (390 px hell); Packet-Walk-Diagramm scrollbar | gewähltes Feld `text-foreground`; Bereich fokussierbar |
| IPv6-Rechner „Binär“, Gruppenübersicht | scrollbare Tabellen | fokussierbare, benannte Bereiche |
| Routing-Simulator | `<pre>` (SPF/Cost), Routing-Treffer | fokussierbare, benannte Bereiche |
| Verkabelungs-Trainer „Kategorien“ | scrollbare Tabelle | fokussierbarer Bereich |
| CLI-Glossar | scrollbarer Inhalt ohne Fokus | fokussierbarer Bereich „Glossar-Inhalt“ |
| Lektion (über Labs geprüft) | IOS-Terminal-Karte `text-orange-400/70`; leere Tabellenkopfzelle im Markdown | Karte über `status-blocking`-Tokens; leere `th` erhält unsichtbaren Text „Merkmal“ |

## c) Reiter-Semantik

- Neue unstyled Bausteine `TabBar`, `TabBarList`, `TabBarTab`, `TabBarPanel` in `src/components/ui/tabs.tsx` (Radix, wie die vorhandene Tabs-Komponente; eigene Gestaltung bleibt erhalten).
- Umgestellt: STP-Simulator, VLAN-Simulator, IPv6-Rechner, Routing-Simulator, Verkabelungs-Trainer, IPv4-Subnetztabelle (je ein Commit). Ergebnis: `role="tablist"` mit Namen, `role="tab"` mit `aria-selected`/`aria-controls`, `role="tabpanel"`, Pfeiltasten/Home/End, Roving-Tabindex.
- Die Modus-Schalter der Drills (Subnetting, Routing, ACL, OSPF-Wildcard) bleiben Umschaltflächen mit `aria-pressed`; sie wechseln keinen Bereich mit eigenem Panel-Inhalt im Sinn einer Reiterleiste.
- Test `tool-tabs-semantics.test.tsx`: je Werkzeug Tablist mit Namen, genau ein ausgewählter Tab, zugehöriges Tabpanel für **jeden** Tab, Pfeiltaste wechselt. Dabei aufgefallen und behoben: Im VLAN-Simulator fehlte das Panel für „Topologie-Simulator“.
- Sweep-Skript: Reiter über `role="tab"`, Fallback `button[aria-pressed]` nur in Werkzeugen; Labs-Dialog mit geöffnetem Lab statt heuristischer Kopfzone (behebt die Skriptfehler).

## Prüfung

Lint 0 Fehler (48 Warnungen wie zuvor), 1876 Tests, Build und `test:e2e:browser` (31 von 31) grün. Die Baseline der Farb-Sperrklinke ist nachgezogen (nur Senkungen).

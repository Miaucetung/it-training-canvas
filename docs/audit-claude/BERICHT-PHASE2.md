# Audit Phase 2 und 1b — Korrekturen und Browserprüfung

Branch `fix/claude-audit` (von `main` @ `8e20ed3`), 23 Commits, kein Merge, nichts gepusht.
Vor jedem Commit liefen `npm run lint` (0 Fehler, 48 Warnungen wie vorher), `npm test` und `npm run build`.
Stand am Ende: **51 Testdateien / 543 Tests grün** (vorher 37 / 440).

## 1. Zur Freigabe: B-02 (nicht committet)

`build.yaml` läuft nach der Änderung nur noch manuell. Voraussetzungen geprüft:

- `k8s/base/deployment.yaml` zieht `ghcr.io/miaucetung/it-training-canvas:main` (`imagePullPolicy: Always`).
- `ci.yml` baut und pusht genau diesen Tag (`${REGISTRY}/${IMAGE_NAME}:main`, `IMAGE_NAME: miaucetung/it-training-canvas`) und deployt danach (`kubectl apply -k k8s/base`, `rollout restart`, `rollout status`), nur wenn `ci` (Lint, Build, Tests) grün ist.
- Unterschiede, die du kennen solltest: `build.yaml` pusht zusätzlich einen Tag mit dem Commit-SHA (nützlich für Rollbacks) und hängt `no-cache: true` an. Es zeigt außerdem Pod-Status zur Fehlersuche und wartet 300 s auf den Rollout. `ci.yml` wartet 120 s. Das fällt weg, wenn `build.yaml` nicht mehr automatisch läuft.

```diff
 name: Build and Push Docker Image
 
+# Manuell ausloesbar. Automatisches Bauen und Deployen nach Push auf main
+# uebernimmt ci.yml (Lint, Build, Tests -> Image -> Deployment).
 on:
-  push:
-    branches: [main]
+  workflow_dispatch:
```

Die Datei liegt als Patch bereit (`git apply` auf den Stand von `main`). Ich committe sie erst nach deinem OK.

## 2. Commits

| Befund | Commit | Inhalt | Test |
|---|---|---|---|
| (Doku) | 7ea2f8b | Phase-1-Bericht, Belege, Audit-Skripte | — |
| B-04 | acf8fc1 | `buildCanvasSvg` mit XML-Escaping, Zahlen-/Farb-Whitelist, Sanitizer für Shape-SVG. Alle `${…}`-Stellen in den Lab-Druckvorlagen (`LabScenariosDialog`, `LabDiagramExport`) escaped | `svg-export-escaping.test.ts` (Sonderzeichen, `<script>`, Attribut-Injektion). Rot vor der Änderung, weil `buildCanvasSvg` nicht existierte |
| B-01 | 6891804 | `ospf-neighbors.ts`: echte Nachbarschaften, Router-ID, DR/BDR; `show ip route` lernt OSPF nur über Nachbarn. Optionale OSPF-Felder je Interface im Modell und Zod-Schema | `ospf-neighbors.test.ts`, über 25 Fälle (positiv/negativ). Das Fehlverhalten ist in `belege/cli-und-subnetz.txt` dokumentiert |
| B-05, B-28 | 66d1b2c | Seed-Eintrag, Fallback 26, „81 Labs“/„(55)“, Fake-Ping-Messwerte, Template-Bewertungen entfernt | `dashboard-no-invented-content.test.tsx` |
| B-07 | a58eda0 | siehe Abschnitt 3 | `design-token-contrast.test.ts`; Doc-Tabelle angepasst |
| B-03 | 6b0dc79 | Topologien an den Lab-Text angepasst, Router 2911 | `lab-topology-matches-lab-text.test.ts` |
| B-12 | 84658de | Kein `Lo0 1.1.1.1/32` mehr auf neuen Routern | `default-router-loopback.test.ts` |
| B-11 | 20b73c8 | 2960-24TT: Fa0/1–24; Doc angepasst | `default-hardware-profiles.test.ts` |
| B-06, B-06b | f10870b | `stp-calc.ts` berechnet Root, Root-/Designated-/Alternate-Ports aus dem Modell; IOS-Begriffe (`Altn`, `P2p`, Priority 24577); `show vlan brief` ohne erfundene VLANs und ohne SVIs | `stp-and-vlan-brief.test.ts` |
| B-08 | 0d738e0 | `shouldIgnoreSingleKeyShortcut`: Strg/Cmd/Alt, Select/ARIA-Eingaben, offene Modale | `single-key-shortcuts.test.tsx` |
| B-09 | d84c62a | 15 Dialoge in `ModalPortal`, `role="dialog"`, `aria-modal`, Name | `dialogs-use-portal.test.tsx` |
| B-19 | e4b4d87 | Defekte Bibliothek wird vor dem Überschreiben gesichert | `storage-library-corruption.test.ts` (3 von 4 rot vorher) |
| B-17 | 86d6870 | Wiederherstellen-Button sagt, was er tut | `migration-conflict-labels.test.ts` |
| B-30 | f9df7f8 | Layout-Funktionen gemeinsam (`topology-layout.ts`), Test nutzt das Original | `lab-topology-quality.test.ts` |
| B-10 | 55e52ae | IBM Plex lokal für 13 Slides, Preconnects entfernt | `no-external-font-requests.test.ts` |
| B-31 | 8a6739e | Schriften als data-URI ins SVG vor dem PNG-Export | `svg-font-embed.test.ts` und Browser-Check |
| B-37 | 4a5d6b7 | Icon-only Schließen-Buttons: `aria-label` (13 Dateien) | Browser-/axe-Lauf |
| B-38 | 7fa52fc | Subnetting-Drill: Schließen-Button lag bei 390 px außerhalb des Bildschirms (x = 442) | Browser-Check |
| B-40 | f962391 | `role="dialog"`, `aria-modal`, Name für 10 weitere Dialoge | `dialogs-use-portal.test.tsx` |
| B-41, B-42 | f78fcc3, e473e5f | axe: label-in-name, `nested-interactive`, Violett-Kontrast | Browser-/axe-Lauf |
| Phase 1b | c7641ba | `scripts/e2e/browser-audit.mjs`, `npm run test:e2e:browser`, `playwright-core` als devDependency | — |

### Ehrliche Hinweise

- **Bestehende Test-Erwartungen geändert (3 Stellen, keine abgeschwächt):** `cisco-cli-generator.test.ts` erwartete das nicht-IOS-konforme `Blk` und `Priority 32768` (jetzt `Altn BLK`, `32769 (priority 32768 sys-id-ext 1)`); `lab-scenarios-dialog.test.tsx` suchte den Button über den exakten Namen (jetzt Regex, weil der Name den sichtbaren Text enthalten muss).
- **B-04:** Der Test ist vorher rot, weil die Funktion fehlte. Das Fehlverhalten selbst war im Phase-1-Befund belegt.
- **B-01 Grenzen:** Nachbarn nur über direkte Links (kein Layer-2-Segment über Switches hinweg). Dead Time ist ein fester Wert (`00:00:36`). Priorität/Rolle bei Broadcast mit genau zwei Routern.
- **B-06 Grenzen:** STP nur für VLAN 1 und 802.1D-Pfadkosten (Short Method). Bridge-MACs sind abgeleitet (`0050.7966.<Index>`), solange `config.stp.mac` fehlt.
- **Breite Diffs:** B-09 hat die JSX-Blöcke der 15 Dialoge um zwei Leerzeichen eingerückt (große Diff-Zeilenzahl, kein Verhaltenswechsel).
- **Zeilenenden:** Git meldet CRLF-Warnungen; die Dateien behalten ihr bisheriges Zeilenende.

## 3. B-07 Kontrast, vorher/nachher

| Token / Paar | vorher | nachher |
|---|---|---|
| Light `status-success-solid` (weißer Text) | `#059669` 3,77 | `#05875F` **4,53** |
| Light `status-warning-solid` | `#D97706` 3,19 | `#B26205` **4,52** |
| Light `status-blocking-solid` | `#EA580C` 3,56 | `#CC4D0A` **4,53** |
| Dark `on-status-error-solid` auf `#EF4444` | `#FFFFFF` 3,76 | `#0B111E` **5,01** (wie die anderen Dark-Solids und wie im Doc) |
| Light `text-muted` auf `app-bg` | `#64748B` 4,32 | `#5D6C81` **4,86** |
| Light `text-muted` auf `surface` / `surface-elevated` | 4,76 / 4,05 | **5,35 / 4,55** |

Der axe-Lauf im Browser (Abschnitt 4) findet auf der durchscheinenden Kopfzeile noch `text-muted` mit 4,36 : 1 (zusammengesetzter Hintergrund `#e7e8ea`). Das ist offen.

## 4. Phase 1b — Browserprüfung (Playwright, echtes Chromium)

Aufruf: `npm run build && npm run test:e2e:browser`. Rohdaten: `belege/browser-audit.json`, `belege/axe-details.json`.

| Prüfung | Vor den Korrekturen | Danach |
|---|---|---|
| Schließen-Button bei 390 px erreichbar und wirksam (Labs, D&D, Subnetting, VLAN-Simulator, Schwächen-Drill) | 2 von 5 fehlgeschlagen: D&D ohne Namen, **Subnetting-Drill außerhalb des Bildschirms**, Schwächen-Drill ohne `role=dialog` | 5 von 5 |
| Zurück-Navigation zum Dashboard (Lektion über Logo und Breadcrumb, Canvas, Dialoge per Escape; bei 1280 und 390 px) | 10 von 10 bestanden | 10 von 10 |
| Webfonts im PNG-Export | **fehlgeschlagen**: SVG als `<img>` rendert mit Fallback-Schrift (Textbreite 317 px statt 351 px) | mit Einbettung 351 px = IBM Plex |
| Externe Hosts beim Start | keine | keine |
| axe inkl. `color-contrast`, Dashboard / Menü / Labs-Dialog / D&D / Lektion / Canvas v1, Hell und Dunkel | in allen 12 Zuständen Verstöße (u. a. `button-name` kritisch, `nested-interactive`, Kontrast 1,26 : 1) | Dunkel: Dashboard, Menü und D&D ohne Verstoß; übrige Zustände siehe unten |

**Noch offen (axe):**
- Hell: `text-muted` auf der Kopfzeile 4,36 : 1; kleine Badges `text-primary` auf `bg-primary/10` 4,08–4,48 : 1; `text-slate-400` auf Weiß 2,63 : 1 (Lektion); `text-blue-700` auf getöntem Grund 4,2 : 1 (Canvas v1).
- Dunkel: `text-slate-500` bei 10–12 px auf dunklem Grund 3,66–4,02 : 1 (Labs-Dialog, Lektion).
- Labs-Dialog: zwei `banner`/`main`-Landmarks (der Dialog enthält `<header>`, das Dashboard dahinter ist nicht `inert`), `heading-order`.
- Canvas v1: `region` (3 Stellen), ein `label-content-name-mismatch`.

## 5. B-03 — Widersprüche im Lab-Text (bewusst nicht korrigiert)

1. **ospf:** Die Verbindungsliste (`R2 Gi0/2 ↔ R3 Gi0/1 (10.0.23.0/30)`, `R1 Gi0/2 ↔ R3 Gi0/2 (10.0.13.0/30)`) widerspricht der Konfiguration von R3 (`Gi0/1 = 10.0.13.2`, `Gi0/2 = 10.0.23.2`). Die Topologie folgt der Verbindungsliste; die Adressierungstabelle zeigt deshalb für R3 Gi0/1/Gi0/2 die Werte der Liste. Der Test nimmt diese beiden Zeilen ausdrücklich aus.
2. **ospf:** Das Lab konfiguriert kein `ip ospf network point-to-point`. Die Topologie behauptet das auch nicht mehr.
3. **Annahmen, keine Widersprüche:** basic-ip nennt keine Switch-Ports (Topologie: Fa0/1, Fa0/2, Uplink Gi0/1); vlan-trunking vergibt Gateway-Adressen `.1`, obwohl es dort absichtlich keinen Router gibt.

Geräte heißen in den Topologien wie die Gerätelabels im Lab (`Router0`, `Switch0`, `PC0` …), die Hostnamen (`R1`, `SW1`) stehen in den Befehlen.

## 6. Nicht umgesetzt

| Befund | Grund |
|---|---|
| B-02 | wartet auf dein OK (Abschnitt 1) |
| B-27 Fachauswahl-Reste (`az-900`, `comptia-network-plus`, Querverweise, `kubectl`-Hilfe, Cloud-Kosten-Rechner) | Fachentscheidung |
| B-14 Blueprint-Zuordnung | Fachentscheidung |
| B-16 Subnetzrechner (`/32`, `/31`, Eingabe ohne Präfix) | Fachentscheidung |
| B-13 Link-Regeln (Port-Typ gegen Link-Typ) | niedrig |
| B-15, B-18, B-20, B-21, B-22, B-24, B-25, B-26, B-29, B-32 bis B-35 | niedrig (nur gelistet; siehe `BERICHT.md`) |
| B-31 (Teil) SVG-Datei-Export (`exportTopologyAsSvg`) | bettet keine Schrift ein, weil die Datei im Browser mit installierter/geladener Schrift geöffnet wird |

## 7. Neue Befunde aus der Browserprüfung

| ID | Schwere | Befund | Stand |
|---|---|---|---|
| B-31 | hoch | PNG-Export verwendet nicht die Webfonts | behoben |
| B-37 | hoch | icon-only Schließen-Buttons ohne Namen (axe: critical) | behoben |
| B-38 | hoch | Subnetting-Drill: Schließen-Button bei 390 px außerhalb | behoben |
| B-40 | mittel | 10 modale Dialoge ohne `role="dialog"` | behoben |
| B-41, B-42 | mittel | label-in-name, `nested-interactive`, Violett-Kontrast 1,26 : 1 | behoben |
| B-43 | mittel | Restliche Kontrast- und Landmark-Verstöße (Abschnitt 4) | offen |

## 8. Nachtrag: Freigaben, Merge und Rollback

- B-02 ist umgesetzt: `build.yaml` läuft nur noch manuell; `ci.yml` pusht `:main` und zusätzlich den unveränderlichen Tag `:sha-<7 Zeichen>` (metadata-action, `type=sha,prefix=sha-,format=short`).
- Merge: `fix/claude-audit` per `--no-ff` nach `main` (Merge-Commit `53875eb`). CI auf `main`: `ci`, `docker`, `deploy` erfolgreich; `build.yaml` startete nicht mehr. Tags dieses Builds: `:main` und `:sha-53875eb`.

### Zurückrollen auf ein früheres Image

Das Deployment verwendet `ghcr.io/miaucetung/it-training-canvas:main` mit `imagePullPolicy: Always`. Für ein Rollback zeigt man das Deployment einmalig auf ein SHA-Tag:

```
# 1. Gewünschtes Tag finden (GitHub -> Packages -> it-training-canvas, oder: git log --oneline -10 -> die ersten 7 Zeichen)
# 2. Deployment auf das alte Image setzen
kubectl set image deployment/it-training-canvas -n apps *=ghcr.io/miaucetung/it-training-canvas:sha-<kurzer-hash>
kubectl rollout status deployment/it-training-canvas -n apps
```

Danach ist `:main` im Deployment ersetzt. Der nächste Lauf von `ci.yml` führt `kubectl apply -k k8s/base` aus und setzt das Image wieder auf `:main`. Soll das alte Image bleiben, `git revert` des fehlerhaften Merge-Commits nach `main` pushen (CI baut dann einen neuen `:main` und einen neuen `sha-`Tag). Schnellster Notfall ohne Tag-Suche: `kubectl rollout undo deployment/it-training-canvas -n apps` geht zur vorherigen ReplicaSet-Revision zurück, funktioniert aber bei `:main` nur, solange das alte Image noch im Knoten-Cache liegt oder `:main` nicht überschrieben wurde. Verlassen kann man sich nur auf die SHA-Tags.

### Live-Prüfung (https://ccna.ajti.online, nach dem Deployment)

- HTTP 200; Pod `it-training-canvas-…` 1/1 Running, Rollout erfolgreich.
- `npm run test:e2e:browser` gegen die Live-Seite: 30 von 31 bestanden. Einziger Fehlschlag: Anfrage an `static.cloudflareinsights.com`. Das ist der Cloudflare-Web-Analytics-Beacon, den Cloudflare ins HTML einfügt (nicht aus dem Repo). In Cloudflare unter „Web Analytics“ deaktivieren, falls keine externen Anfragen gewünscht sind (DSGVO).
- axe inkl. Farbkontrast: 0 Verstöße in Hell und Dunkel für Dashboard, Menü, Labs-Dialog, D&D und Lektion. Canvas v1 (3 `region`, 1 Kontrast, 1 Label) bewusst nicht angefasst.

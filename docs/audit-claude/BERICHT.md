# Audit-Bericht Phase 1 — Arbeit von Gemini am Repository it-training-canvas

Stand: 2026-10-13 · Branch `main` @ `8e20ed3` · Basis „vor Gemini“: `66f8ac2` (2026-08-25, letzter Commit vor `4f5c24e`)
Methode: nur lesen und ausführen. Keine Änderung an Code, Daten, Git. Neu angelegt wurden nur `scripts/audit/` und `docs/audit-claude/`.
Alle Belege sind reproduzierbar (siehe `scripts/audit/README.md`); Rohausgaben liegen unter `docs/audit-claude/belege/`.

## 0. Was geprüft wurde und was nicht

**Per Skript/Ausführung belegt:** Lint/Test/Build, Datendiff, Lab-Zählung, 4 Lab-Topologien, CLI-Generator, Subnetzrechner, Link-Regeln, EtherChannel-Matrix, Blueprint-Zuordnung, Kontrast (60 Tabellenzeilen + alle Tokenpaare), Pipeline, Abhängigkeiten.
**Nur im Code gelesen (nicht im Browser ausgeführt):** Dropdown-Fokusverhalten, Roving Tabindex, Kürzel, Portale, Migration im laufenden Browser.
**Nicht geprüft (braucht echten Browser):** Schließen-Button bei 390 px, Zurück-Navigation aus Übungsansichten, ob Webfonts im PNG-Export wirklich erscheinen, eigener axe-Lauf mit Farbkontrast (der vorhandene Test schaltet `color-contrast` ab), Lint-Warnungen gegenüber der Basis.

## 1. Zusammenfassung — die 10 wichtigsten Befunde

| # | ID | Schwere | Kurz |
|---|---|---|---|
| 1 | B-01 | hoch | `show ip ospf neighbor` erfindet Nachbarn: listet jedes Gerät am Link (Switches, PCs, Router ohne OSPF) als `FULL`, Fallback-Neighbor-ID `2.2.2.2`. |
| 2 | B-02 | hoch | `build.yaml` baut, pusht und **deployt auf jedem Push nach main ohne Lint/Test**. Das ist der Fall, nach dem du gefragt hast: Ja. |
| 3 | B-03 | hoch | Lab-Topologien weichen vom Lab-Text ab (OSPF: R3 Gi0/1↔Gi0/2 vertauscht; VLAN-Lab: VLAN 99, Namen, IPs; basic-ip: PC1 .11 statt .20; RoaS: Fa0/10,Fa0/20 statt Fa0/1,Fa0/2). Fachentscheidung nötig. |
| 4 | B-04 | hoch | v1-SVG-Export schreibt `obj.text`/`svgPath` ungeescaped. Ein Text `<script>…` landet im exportierten `.svg`. Vorbestehend, Gemini hat die Zeile angefasst und nicht behoben. |
| 5 | B-05 | mittel-hoch | Dashboard „Zuletzt bearbeitet“ erfindet einen Eintrag („Netzwerkgrundlagen & OSI-Modell“, „vor 2 h“), wenn Fortschritt, aber keine Historie existiert. |
| 6 | B-06 | mittel | `show vlan brief` erfindet VLAN 10 SALES/20 DEV auf jedem Switch ohne VLANs; `show spanning-tree` hängt an Geräte-IDs (`swa`, `swb`) und erfindet sonst einen Root mit nicht existierender MAC. |
| 7 | B-07 | mittel | Kontrast: Tabelle im Doc ist rechnerisch korrekt (60/60). Aber vier echte Token-Paare liegen unter 4,5 : 1, obwohl der CSS-Kommentar „AA ≥ 4,5“ sagt. |
| 8 | B-08 | mittel | Kürzel `P` fängt `Strg+P` ab (Druckdialog), kennt weder Dialog noch `<select>`, und feuert Dashboard und Lab-Dialog doppelt. |
| 9 | B-09 | mittel | 15 Dialoge ohne Portal (`fixed inset-0` ohne `ModalPortal`), trotz Commit „portal drill modals“. |
| 10 | B-10 | mittel | 13 Slide-Embeds laden Google Fonts (vorbestehend). Das widerspricht „keine externen Anfragen“ und ist in DE ein DSGVO-Thema. |

**Was in Ordnung ist (belegt):**
- `src/data/` unverändert: `git diff --stat 66f8ac2 HEAD -- src/data` ist leer. Fragen 1081 roh / 1055 klassifiziert / 81 Drag-and-Drop.
- Lab-Inhalte unverändert: nur `index.ts`/`types.ts` geändert, die neuen Dateien sind Zusatz. Es gibt **55** Labs, nicht 56. Keine doppelten IDs, alle in einer Kategorie, `LABS_ORDERED` = 55, Badge zählt aus `LABS_ORDERED.length`.
- `npm run lint`: 0 Fehler, 48 Warnungen. `npm test`: 37 Dateien, 440 Tests grün. `npm run build`: grün.
- Keine `eslint-disable`/`@ts-ignore`/`.skip`/`.only` in Geminis Diff. `eslint.config.js` unverändert. Einzige Config-Änderung: `testTimeout: 15000`.
- CI-Dateien, Dockerfile, k8s, nginx nicht verändert. Docker-Image enthält nur `dist` (Multi-Stage).
- EtherChannel-Matrix korrekt. `Po` ist nur `SD`, wenn kein Member gebündelt ist. Wireless/WLC-Regeln im Kern korrekt.
- v1 ist Default; `useLocalStorage` schreibt beim Start nichts. Der Key `ccna-canvas-version` entsteht erst beim Umschalten. Theme-Skript und App nutzen denselben Key und dieselben Werte.
- Inline-Subnetzrechner: /0, /8, /24, /30, /31, /32 und ungültige Eingaben korrekt (Details B-16).
- Blueprint-Gewichte 20/20/25/10/15/10 = 100 stimmen mit dem Blueprint überein.

## 2. Alle Befunde

Schwere: kritisch / hoch / mittel / niedrig. Aufwand: S < 1 h, M < 1 Tag, L > 1 Tag. „Behauptung“ nennt die Quelle (Code-Kommentar, Doc, Commit).

### Fachlich / Generator / Daten

| ID | Bereich | Schwere | Beleg | Behauptung vs. Wirklichkeit | Korrekturvorschlag | Aufwand |
|---|---|---|---|---|---|---|
| B-01 | CLI-Generator | hoch | `cisco-cli-generator.ts:281-313`: Schleife über alle Links, kein Check auf OSPF, `nId … \|\| "2.2.2.2"`, `nAddr … \|\| "10.0.12.2"`. Lauf `belege/cli-und-subnetz.txt`: Basic-LAN-R1 (kein OSPF) zeigt `2.2.2.2 FULL/ -`. SW1 zeigt 2–4 Nachbarn. OSPF-Beispiel R1 zeigt SW1 als zweiten Nachbarn. | Spec: „show ip ospf neighbor (p2p: FULL/ -)“. Das Format stimmt, die Auswahl der Nachbarn nicht. | Nur Router mit OSPF, nur Links zu Routern mit OSPF, Neighbor-ID = Router-ID (Lo/Config), Fallback „kein Nachbar“ statt Fantasiewerte. | S |
| B-02 | Pipeline | hoch | `.github/workflows/build.yaml`: Job `build-and-push` → `deploy` ohne `lint/test`. `ci.yml` gated korrekt (`docker needs ci`). Beide pushen nach `main`, beide deployen, `build.yaml` mit `no-cache`. | Nur berichten (nicht ändern). Ein rotes Lint/Test verhindert das Deployen nicht. Zwei Deploys konkurrieren. | `build.yaml` entfernen oder auf `needs: ci` umstellen. | S |
| B-03 | Lab-Topologien | hoch | `belege/lab-topology-dump.txt` vs. Lab-Text, Details in Abschnitt 4. | Gemini: Topologien „stimmen“. 4 von 4 Labs weichen ab. | Fachlich entscheiden (Abschnitt 4), dann Topologie **oder** Lab angleichen. | M |
| B-06 | CLI-Generator | mittel | `generateShowVlanBrief:325-331` Fallback `SALES`/`DEV`. Lauf: leerer neuer Switch zeigt VLAN 10/20; `Vlan1` (SVI) erscheint als Port in VLAN 1. `generateShowSpanningTree:230-238` Root über `id.includes("swa")`/Name „Root“. Lauf: SW1 im OSPF-Beispiel zeigt Root `0050.7966.0001`, den es nicht gibt. | Fantasie-Daten statt Modell. Funktioniert nur für die STP-Beispieltopologie. | VLAN-Liste aus Config (Default nur VLAN 1), SVIs ausschließen. STP: Root/Bridge-ID aus Modell berechnen oder „kein STP-Modell“ ausgeben. | M |
| B-06b | CLI-Generator | niedrig | `show spanning-tree`: Rolle `Blk` (IOS: `Altn`), Typ `Shr` (IOS: `P2p`), Priority `24576` (IOS: `24577` inkl. sys-id-ext). `show ip route`: Zeit/Metrik fest `[110/2] 00:14:22`, nur direkte Nachbarnetze (keine Mehr-Hop-Routen), C/L auch für `down`/`admin-down`, Interface-Kurzname statt `GigabitEthernet0/0`. `show interfaces trunk`: Abschnitt „forwarding state“ fest `1,10,20`; STP-Beispiel zeigt „keine Trunks“, obwohl Links `trunk` sind. | Format nahe an IOS, aber nicht exakt. | Bei B-06 mit korrigieren. | M |
| B-07 | Kontrast | mittel | `belege/kontrast.md` Abschnitt 3: light `on-status-success-solid` 3,77; `…warning…` 3,19; `…blocking…` 3,56; dark `on-status-error-solid` (#FFF auf #EF4444) 3,76. `src/index.css:30` Kommentar „WCAG AA >= 4.5:1“. Doc-Zeile „Dark `--status-error-solid` auf `--on-status-error-solid` (#0B111E) 5,01“ nennt falschen Hex (CSS ist `#FFFFFF`). Zusätzlich: `text-muted` auf `app-bg` 4,32 und auf `surface-elevated` 4,05 stehen als „Bestanden (AA Large/UI)“, obwohl `text-muted` für Fließtext (11 px) dient. | Doc: „exakt nach W3C-Formel berechnet“. Rechnung ist korrekt (0 von 60 Abweichungen), aber Pass-Label und CSS-Kommentar sind es nicht. Nur `button.tsx` nutzt `on-status-error-solid`; die anderen drei Paare sind aktuell ungenutzt. | Farben anpassen (z. B. success `#047857`, warning `#B45309`, blocking `#C2410C` als Solid) und Doc/Kommentar korrigieren. `text-muted` auf `app-bg` auf `#5B6B80` o. Ä. | S |
| B-11 | Hardware-Profile | mittel | `topology-operations.ts:36-41` Default-2960 hat nur Fa0/1–Fa0/4. `docs/topology-hardware-profiles.md` sagt Fa0/1–Fa0/4, `docs/topology-link-matrix.md:12` sagt Fa0/1–Fa0/24. Router: Tester-Guide/Doc „2911“, Lab-Topologien „Cisco 2901 ISR“, aber ospf-Topologie nutzt `Gi0/2` (2901 hat nur Gi0/0–0/1). RoaS-Topologie nutzt `Fa0/10`, `Fa0/20` (im Default nicht vorhanden). | Spec: „überall einheitlich“. Nicht einheitlich. | 24 Fa-Ports erzeugen, Modellnamen vereinheitlichen. | S |
| B-12 | Topologie-Operationen | mittel | `getDefaultInterfacesForType("router")`: jeder neue Router bekommt `Lo0 1.1.1.1/32`. Lauf: R1 und R2 beide `1.1.1.1/32` → Router-ID-Kollision. | — | Kein Default-IP auf Lo0. | S |
| B-13 | Link-Regeln | niedrig | Lauf `cli-und-subnetz.txt`: serial Gi0/0↔Gi0/0 **erlaubt**, serial Router↔Cloud erlaubt (Meldung sagt „nur zwischen zwei Routern“), Ethernet Router-`Se0/1/0`↔Switch-`Fa0/1` erlaubt, Ethernet PC↔PC erlaubt. Wireless- und WLC-Regeln greifen. | Spec: „Serial nur zwischen Routern“. Gerätetyp wird geprüft, Port-Typ nicht. | Port-Typ gegen Link-Typ prüfen. | S |
| B-14 | Blueprint | niedrig | Abschnitt 5. `troubleshooting` hat keinen Bereich. Subtopic-Codes entsprechen nicht der offiziellen Nummerierung (Domäne 4: SSH ist offiziell 4.8, TFTP 4.9; hier SSH unter 5.3, TFTP 4.7). | Doc: „Official Blueprint“. | Siehe Abschnitt 5. | S |
| B-15 | Beispieltopologien | niedrig | STP stimmt mit deiner Vorgabe (A Root, beide DP; B Gi0/1 RP, Gi0/2 DP; C Gi0/1 RP, Gi0/2 BLK). OSPF-Beispiel: p2p nur als Freitext in `description` (`"ip ospf network point-to-point"`); der Generator liest `description.includes("point-to-point")` als Konfiguration. | — | Eigenes Feld `ospfNetworkType`. | S |
| B-16 | Subnetzrechner | niedrig | `belege/cli-und-subnetz.txt` oben. Korrekt: /0–/32, 256.1.1.1, /33, /-1, /, /1e1. Auffällig: `1.2.3.4` ohne Präfix rechnet still mit /24; `01.2.3.4` akzeptiert (führende Null); `0.0.0.0/0` und `0.x.x.x` Klasse „C“; `/32` meldet 1 Host, `/31` 2 Hosts (RFC 3021, für CCNA diskutabel). | — | Ohne Präfix Fehler oder klassfull; Klasse „—“ für 0.x. | S |

### Canvas v2 / Datensicherheit

| ID | Bereich | Schwere | Beleg | Behauptung vs. Wirklichkeit | Korrekturvorschlag | Aufwand |
|---|---|---|---|---|---|---|
| B-04 | Export | hoch | `canvas-utils.ts:701-702` `…>${obj.text}</text>`; Zeile 705 `${obj.svgPath}` roh; `obj.color` unescaped. `exportCanvasAsSVG`, `App.tsx:732`. Vorbestehend (Zeile von Gemini nur wegen Schrift geändert). Das v2-Export `generateCleanSvgString` nutzt `XMLSerializer` und ist in Ordnung. | Spec: „SVG-Export korrekt escaped“. v1: nein. Text mit `<`/`&` macht die SVG ungültig, `<script>` wird in der Datei ausgeführt, wenn sie direkt geöffnet wird. | Texte/Attribute escapen, `svgPath` nur aus Bibliothek zulassen. | S |
| B-17 | Migration | mittel | `migration.ts:575-607`: Konfliktzweig braucht `wasEditedInV2` (`author !== "Migration-Engine"`). Außer Migration und Restore-Button schreibt **nichts** in `canvas-topology-v2` (`grep V2_STORAGE_KEY`); v2-Bearbeitungen gehen in `canvas-topology-v2-library`. Konflikt ist praktisch unerreichbar. Falls doch: Button „Alten Stand (v1) laden“ (`CanvasV2Container.tsx:1428-1440`) stellt das **Backup von v2** wieder her, nicht den v1-Stand. | Gemini: „Datenverlust ausgeschlossen, konfliktrelevante Backups geschützt“. Nur in Unit-Tests simuliert, im Produkt toter/falsch beschrifteter Pfad. | Konfliktlogik an die Library koppeln oder entfernen, Button umbenennen. | M |
| B-18 | Backups | niedrig | `getBackupKeys` sortiert per `parseInt` des Suffixes; der Restore-Pfad benennt `…-backup-pre-v1-restore-<ts>` → `parseInt` = NaN → 0 → gilt als ältestes, wird zuerst gelöscht und ist nie „jüngstes“. Bei mehreren Konflikten (je Fach) wird pro Fach ein Backup angelegt und mit `prune(MAX-1)` dabei das vorige Konflikt-Backup entfernt, das `conflicts[]` noch referenziert. | „max. 3, jüngstes geschützt“: gilt nur für numerische Suffixe. | Einheitliches Key-Schema. | S |
| B-19 | Library-Speicher | mittel | `storage-manager.ts:92-97` (`saveNamedTopology`): defekter JSON-Inhalt → `library = {}` → Schreiben überschreibt die **gesamte** Bibliothek mit einer Topologie. Kein Backup. | — | Bei Parse-Fehler abbrechen oder Rohwert sichern. | S |
| B-20 | Import | niedrig | `sanitizeTopology()` (`storage-manager.ts:~205`) ist ein No-op (`return topology`), aber `importTopologyFromJson` kommentiert „Sanitize … gegen Skript-Injektion & XSS“. Praktisch ist React-Escaping der Schutz. `handleFileUpload` (`TopologyStorageDialog.tsx:143`) liest die ganze Datei, bevor die 2-MB-Grenze greift; kein `onerror`. | Kommentar/Funktionsname suggerieren eine Bereinigung, die es nicht gibt. | Umbenennen/entfernen; `file.size` vor dem Lesen prüfen. | S |
| B-21 | `innerHTML`-Stellen | niedrig | `dangerouslySetInnerHTML`: `AclDrillDialog:597` (statischer Szenariotext + `**`→`<strong>`), `ExamPrepDialog:218` (`EXAM_DIAGRAMS`, statisch), `ShapePicker:83` (Shape-Bibliothek). `document.write`: `LabDiagramExport:131`, `LabScenariosDialog:269` (statische Labdaten, `lab.title` ungeescaped). Slide-Embeds: `stage.innerHTML` mit Templates. `eval`/`new Function`: keine. | Alle Quellen statisch, kein Nutzereingang gefunden. | Optional escapen. | S |
| B-22 | Feature-Flag | niedrig | `App.tsx:357` `useLocalStorage("ccna-canvas-version","v1")`; Schalter ist **für alle sichtbar** (`App.tsx:1568`), kein verstecktes Flag. Migration läuft erst beim Klick auf „v2“. | Gemini: „hinter Feature-Flag“. Es ist ein sichtbarer Umschalter. Default v1 stimmt. | Nur Beschreibung anpassen. | — |
| B-23 | Engine-Kennzeichnung | niedrig | `getToolEngineStatus` + Toast (`AppHeader.tsx:256`) kennzeichnet `v1_only`-Werkzeuge in v2 (Ping-Test u. a.). | In Ordnung. | — | — |

### Bedienung / Barrierefreiheit

| ID | Bereich | Schwere | Beleg | Behauptung vs. Wirklichkeit | Korrekturvorschlag | Aufwand |
|---|---|---|---|---|---|---|
| B-08 | Kürzel | mittel | `CcnaDashboard.tsx:175` und `LabScenariosDialog.tsx:557`: `e.key === "p"` ohne `ctrlKey/metaKey/altKey`-Prüfung → `Strg+P` wird abgefangen. Guard nur `INPUT`/`TEXTAREA`/`contentEditable`, nicht `SELECT`, `role=textbox/combobox`, Dialog/Befehlspalette. Beide Handler hängen an `window`; mit offenem Lab-Dialog über dem Dashboard schalten **beide** um. | Spec: „dürfen nicht auslösen in Eingabefeld, Befehlspalette oder Dialog“. Eingabefeld ja, Dialog/Select nein. | Modifier ausschließen, `closest('[role=dialog],…')`, Handler nur im aktiven Kontext. | S |
| B-09 | Dialoge | mittel | Dateien mit `fixed inset-0` ohne `ModalPortal`/Radix-Portal: AclDrill, CliGlossary, DragDropTrainer, IPv4SubnetTable, IPv6Calculator, OsiSimulator, OspfWildcardDrill, RouterOnAStick, RoutingDrill, RoutingSimulator, StpSimulator, SubnettingDrill, TopologieExplorer, VerkabelungTrainer, VlanSimulator. Nur `LabScenariosDialog` nutzt `ModalPortal`. | Commit `8e20ed3` „portal drill modals“; Spec „alle Dialoge per Portal“. 15 offen. Sichtbarkeit des Schließen-Buttons bei 390 px nicht geprüft. | Portal-Wrapper einheitlich. | M |
| B-24 | Breadcrumbs | niedrig | `AppBreadcrumbs.tsx`: `<a href="#" role="button">` mit eigenem Enter/Space-Handler statt `<button>`/echtem Link. Der Eintrag „Lernpfade“ ruft `onNavigateHome` (führt nicht zu Lernpfaden). `<nav><ol>` aus shadcn-Komponente. | Spec: „echte <a>/<button>“, „tatsächlicher Ort“. Teilweise. | `<button>` oder echte Route. | S |
| B-25 | Dropdown-Menüs | niedrig | `AppHeader.tsx:204-245`: `role=menu/menuitem`, `aria-haspopup`, `aria-expanded`, Escape stellt Fokus wieder her, Pfeile/Home/End; **kein** `role=dialog`/`aria-modal` an Dropdowns (nur `MobileNavDrawer`, modal). Aber: globaler `window`-Listener hört auch außerhalb des Menüs auf Pfeile; `Tab` schließt ohne Fokus-Rückgabe; Fokus wird beim Öffnen nicht ins Menü gesetzt. | Weitgehend erfüllt. | — | S |
| B-26 | Canvas v2 | niedrig | `SvgTopologyRenderer.tsx:455-474` Roving Tabindex; `CanvasV2Container.tsx:1038` Shift+Pfeile verschiebt, `:1126` Alt+Pfeile pannt; Guard für Formularfelder (`:978`). | In Ordnung (nur gelesen). | — | — |
| B-27 | Fachauswahl-Reste | mittel | `AppHeader` führt `subjects`/`onSelectSubject` weiter als Props (`_subjects`). `AppBreadcrumbs`/`FloatingToolbar`/`PresentationsDialog` nutzen `SUBJECT_CONFIGS`. `navigation-config.ts`: `subjects: ["Azure","AWS"]` (Cloud-Kosten-Rechner, über `isToolSupportedForSubject` nicht erreichbar), `FISI`. `content-loader.ts` lädt weiter `az-900` und `comptia-network-plus`, `cross-references.ts` verlinkt auf `az-900`. `TerminalEmulator` enthält `kubectl`-Hilfe. Test `navigation-accessibility-axe` übergibt `["CCNA","FISI","Azure"]`. AWS-Vorlagen sind aus `collaboration-engine.ts` entfernt, 13 Vorlagen bleiben (CCNA-bezogen). | Gemini: „Entfernen aller Nicht-CCNA-Fächer“. UI-seitig weg, Code und Content bleiben. | Entscheiden: Module/Querverweise wirklich löschen? | M |

### Design-System / Tests / Inhalte / Abhängigkeiten

| ID | Bereich | Schwere | Beleg | Behauptung vs. Wirklichkeit | Korrekturvorschlag | Aufwand |
|---|---|---|---|---|---|---|
| B-05 | Erfundene Inhalte | mittel-hoch | `CcnaDashboard.tsx:100-110`: Seed „Netzwerkgrundlagen & OSI-Modell“ mit `timestamp: lastActivityAt \|\| Date.now() - 3600000 * 2` (erfundenes „vor 2 Stunden“, Titel passt nicht zur ID `completedSteps[0]`). | Spec Abschnitt 8. Erfunden. | Seed entfernen oder Titel aus dem Modul auflösen, echten Zeitstempel verwenden. | S |
| B-28 | Erfundene Inhalte | niedrig | `TopologyHero.tsx:579`: „Ping erfolgreich: 4 Pakete empfangen, RTT 1.2ms“ ist fest einprogrammiert. `TodayPracticeSection.tsx:72`: „Drag-and-Drop Trainer (81 Labs)“ — es sind 81 **Aufgaben**; `:107` „Packet Tracer Labs (55)“ fest, nicht aus `LABS` abgeleitet. `collaboration-engine.ts:405-555` `rating: 4.5/4.6/5.0` (nirgends angezeigt). `CcnaDashboard.tsx:188` Fallback `26`. | — | Simulation kennzeichnen; Zahlen ableiten. | S |
| B-29 | Doku | niedrig | `docs/audit-ccna.md:13` und `docs/redesign-konzept.md:14`: „über 1.200 Prüfungsfragen“; Daten: 1081 / 1055. `CLAUDE.md`: „Default: dark“; Code: Default `system` (`App.tsx:249`). `docs/dashboard-konzept.md:195` nennt „ISR 4331“. | Doku mehrfach falsch, wie vermutet. | Zahlen korrigieren. | S |
| B-30 | Tests | mittel | `lab-topology-quality.test.ts:23-39`: der Kollisionstest implementiert `getPortLabelPos` **lokal nach**; das Original ist eine nicht exportierte Closure (`ProfessionalTopologyDiagram.tsx:89`). „0 Überlappungen“ prüft eine Kopie mit angenommenen Boxgrößen, nicht das gerenderte Diagramm. `navigation-accessibility-axe.test.tsx:105` deaktiviert `color-contrast` (jsdom), „axe 0 Violations“ betrifft also keinen Kontrast. Einige schwache Assertions (`toBeDefined`), z. B. `navigation-redesign.test.tsx`, `lab-scenarios-dialog.test.tsx`. Gelöscht: `Sidebar.catalog.test.tsx` (zusammen mit der Sidebar, in Ordnung). | Behauptung „0 Überlappungen / 0 Violations“ nur eingeschränkt belegt. | Funktion exportieren und importieren; Kontrast separat (`contrast.mjs`). | M |
| B-31 | Fonts | niedrig | App: `@fontsource/ibm-plex-*` über `src/main.tsx`, keine externen Hosts in `index.html`/`src/*.css`. PNG-Export wartet auf `document.fonts` (`storage-manager.ts:~320`), aber ein SVG, das als `<img>` gerendert wird, sieht Seitenschriften nicht — Wirkung für die v2-Topologie **ungeprüft/zweifelhaft**. | — | Im Browser prüfen; ggf. Schrift in SVG einbetten. | M |
| B-10 | Externe Anfragen | mittel | `public/embeds/ccna-slides/*.html` (13 Dateien) laden `fonts.googleapis.com`/`fonts.gstatic.com`. Vorbestehend, Commit-Historie vor Gemini. | Spec: „keine Anfragen an externe Server“. Für die App ja, für die Slides nein. | Schriften lokal einbinden. | S |
| B-32 | Design-Tokens | niedrig | Hartcodiert außerhalb der Tokens: 728 Hex-Treffer in .ts/.tsx (ohne Daten/Labs/Tests), 3284 `*-slate-*`-Klassen, 2 `!important` (`index.css:450,457`, Fokus-Outline `#38bdf8`). In Geminis Diff kamen rund 900 weitere hartcodierte Farbzeilen dazu. | Gemini: Tokens als Leitsystem. CLAUDE.md erlaubt Legacy, verbietet Ausbreitung. | Migration schrittweise. | L |
| B-33 | Abhängigkeiten | niedrig | Neu (nur devDependencies): `axe-core 4.14.0` MPL-2.0 (3,4 MB), `pixelmatch 8.0.0` ISC, `pngjs 7.0.0` MIT, `@types/pixelmatch 5.2.6`, `@types/pngjs 6.0.5`. `@fontsource/ibm-plex-sans 5.2.8`, `…-mono 5.2.7` (SIL OFL) waren schon in der Basis. Kein Eintrag im Laufzeit-Bundle. | In Ordnung. | — | — |
| B-34 | Repo-Größe | niedrig | `docs/screenshots` 42 MB, 35 Dateien (getrackt); `.git` 203 MB. `.dockerignore` schließt `docs` nicht aus (Build-Kontext), das fertige Image enthält nur `dist` (8,7 MB; Hauptchunk `index-*.js` 1,76 MB / 457 kB gzip). | Image nicht aufgebläht. | `docs/screenshots` und `notes/` in `.dockerignore`. | S |
| B-35 | Lint | niedrig | 48 Warnungen (`no-explicit-any`, `react-refresh`), 0 Fehler. Vergleich mit der Basis nicht gemacht. | — | — | — |

## 3. Zu B-03 — Abweichungen je Lab-Topologie

Quelle: `belege/lab-topology-dump.txt` (Topologie = `curated-topologies.ts`, Text = Lab-Schritte in `layer2.tsx`/`routing.tsx`).

| Lab | Topologie sagt | Lab-Text sagt |
|---|---|---|
| **basic-ip** | Geräte `Router0`, `Switch0`, `PC0`, `PC1`; PC1 `192.168.1.11` | Router heißt per `hostname R1`; PC1 `192.168.1.20`. Übrige IPs stimmen. |
| **vlan-trunking** | VLAN 20 „Marketing“; VLAN 99 „Management“ mit SVIs `192.168.99.1/.2`; Trunk „VLAN 10, 20, 99“; PC1–4 = .10/.10/.11/.11 | VLAN 20 „HR“; **kein** VLAN 99/SVI; Trunk `allowed vlan 10,20`; PCs .10 (V10), .10 (V20), **.20** (V10), **.20** (V20). Geräte heißen PC0–PC3. |
| **roas** | `R1`, `SW1`; PCs an `Fa0/10`, `Fa0/20`; `SW1 Vlan1 192.168.10.2` mit VLAN 1 im Subnetz 192.168.10.0/24; VLAN-Namen Sales/Marketing | `Router0`, `Switch0`; PCs an `Fa0/1`, `Fa0/2`; kein SVI; VLAN-Namen `VLAN10`/`VLAN20`. |
| **ospf** | R3 `Gi0/1` = 10.0.23.2 (zu R2), `Gi0/2` = 10.0.13.2 (zu R1); Zone „Area 0 Backbone“ `10.0.0.0/24` (kommt in keinem Link vor) | Konfiguration: R3 `Gi0/1` = 10.0.**13**.2, `Gi0/2` = 10.0.**23**.2 — vertauscht. Der Verbindungstext im Lab (`routing.tsx:1320-1321`) widerspricht der eigenen Konfiguration. Kein `ip ospf network point-to-point` im Lab. Router in der Topologie „Cisco 2901“ (nur 2 Gi-Ports) mit Gi0/2. |

Alle Labtexte blieben unverändert. Die Abweichungen sind teils Fehler in der Topologie (Gemini), teils im Lab selbst (ospf R3). Das entscheidest du.

## 4. Blueprint-Zuordnung zur Prüfung (aus `dashboard-blueprint-config.ts`, 26 Lektionen)

⚠ = auffällig. Gewichte stimmen; Rohdaten in `belege/blueprint.txt`.

| Lektion | Bereich |
|---|---|
| networking-fundamentals | 1.0 Network Fundamentals |
| ios-cli ⚠ (kein Blueprint-Thema, eher Querschnitt) | 1.0 |
| ipv4-addressing | 1.0 |
| subnet-segmentation ⚠ („Netzwerk-Segmentierung“, eher VLAN/2.0 oder 1.0?) | 1.0 |
| ipv6 | 1.0 |
| verkabelung | 1.0 |
| glasfaser ⚠ (Unterthema 1.4 „Interface-/Kabelprobleme“ zeigt auf Glasfaser) | 1.0 |
| ccna-virtualization | 1.0 |
| switching-vlans | 2.0 Network Access |
| stp | 2.0 |
| etherchannel | 2.0 |
| vlan-advanced | 2.0 (Unterthema 2.3 CDP/LLDP zeigt darauf) ⚠ |
| wlan | 2.0 |
| routing-ospf | 3.0 IP Connectivity |
| fhrp | 3.0 |
| dhcp-nat | 4.0 IP Services |
| nat | 4.0 |
| dns | 4.0 |
| device-management | 4.0 |
| qos | 4.0 |
| security | 5.0 Security Fundamentals (enthält SSH, offiziell 4.8) ⚠ |
| acl | 5.0 |
| wan ⚠ (WAN/VPN gehört nicht zu Automation) | 6.0 Automation and Programmability |
| sdn-controller | 6.0 |
| automation | 6.0 |
| troubleshooting ⚠ | **keinem Bereich zugeordnet** |

## 5. Befunde, die du fachlich entscheiden musst

1. **B-03 / Lab-Abweichungen:** Soll die Topologie dem Lab-Text folgen oder umgekehrt? Besonders ospf (R3-Ports), vlan-trunking (VLAN 99, HR vs. Marketing, IPs), roas (Fa0/1/2 vs. Fa0/10/20), basic-ip (PC1 .11/.20). Labs ändere ich nur auf deine Ansage.
2. **ospf-Lab:** Soll `ip ospf network point-to-point` ins Lab? Aktuell ist die Topologie „p2p“, das Lab nicht.
3. **Blueprint (B-14):** `wan`, `ios-cli`, `glasfaser`, `subnet-segmentation` zuordnen; `troubleshooting` einem Bereich geben; Unterthemen-Codes an die offizielle Nummerierung angleichen (oder als „eigene Gliederung“ kennzeichnen).
4. **Hardware (B-11):** Router 2911 oder 2901? Switch mit 24 Fa-Ports (24TT) oder bewusst 4?
5. **Fachauswahl-Reste (B-27):** `az-900`, `comptia-network-plus`, Querverweise, `kubectl`-Hilfe, Cloud-Kosten-Rechner löschen oder behalten?
6. **Pipeline (B-02):** Welcher Workflow bleibt? (Nur du, ich ändere keine Workflows.)
7. **Vorbestehende Befunde (B-04, B-10):** Mit in den Korrekturlauf nehmen?
8. **Subnetzrechner (B-16):** `/32` = 1 Host und `/31` = 2 Hosts beibehalten?

## 6. Vorschlag für Phase 2 (nur nach deinem OK)

Reihenfolge nach Nutzen: B-01, B-04, B-05, B-06, B-12, B-08, B-07, B-17, B-19, B-09, B-13, B-30. Je Befund ein Commit auf `fix/claude-audit` mit Test, davor Lint/Test/Build. B-02, B-03, B-10, B-14, B-27 erst nach deiner Entscheidung.

## 7. Verzeichnis der Belege

`scripts/audit/*` (Skripte) · `docs/audit-claude/belege/` (lint, test, build, cli-und-subnetz, kontrast, labs, lab-topology-dump, blueprint, data-counts)

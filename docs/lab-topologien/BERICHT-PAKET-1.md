# Lab-Topologien — Paket 1 (Layer 2): Bericht

Branch `feature/lab-topologies` (von `main` @ `53875eb`). Nicht gepusht, nicht gemergt.
Neue Topologien: **stp, vtp-dtp, etherchannel, ivr-svi**. Die vier Piloten (basic-ip, vlan-trunking, roas, ospf) laufen auf demselben Fundament.
Lint 0 Fehler (48 Warnungen wie vorher), **681 Tests in 53 Dateien grün** (vorher 543 / 51), Build grün.

## 1. Was neu ist (Fundament, gilt für alle späteren Pakete)

| Baustein | Datei | Inhalt |
|---|---|---|
| Hardware-Profile | `src/lib/topology/hardware-profiles.ts` | 2911 mit HWIC-2T (`Gi0/0–0/2`, `Se0/0/0`, `Se0/0/1`), 2960-24TT, **3560-24PS** (Fa0/1–24, Gi0/1–2), 3650-24PS, PC-PT/Server-PT (`Fa0`). Die Standard-Interfaces neuer Router im Canvas heißen jetzt `Se0/0/0`/`Se0/0/1` (vorher `Se0/1/x`); Doku angepasst |
| Topologie-Dateien | `src/components/labs/topologies/` | je Kategorie eine Datei (`layer2.ts`, `routing.ts`, `layer2-switching.ts`) plus `builders.ts`. `curated-topologies.ts` führt sie zusammen. Die Pilot-Daten sind unverändert verschoben (JSON-Vergleich vorher/nachher identisch), danach aber bewusst angepasst (Abschnitt 5) |
| Konverter | `src/components/labs/lab-to-network.ts` | Lab → Netzwerk-Topologie (Canvas v2). Konfiguration wird **nur** aus den Befehlen des Labs gelesen (Hostname, VLANs, Access/Trunk, Channel-Groups, SVIs, `ip routing`, OSPF, STP-Priorität, Desktop-IPs). Zielzustand und Startzustand (ohne Konfiguration). Ungelesenes landet in `problems` |
| CLI-Export | `getLabDeviceCli` | pro Router/Switch nur Befehle, ohne Prompt. Im Lab-Dialog (Kopieren / .txt je Gerät) und im Canvas-Inspektor |
| Canvas-Integration | `LabScenariosDialog`, `CanvasV2Container`, `App.tsx` | Button „Topologie im Canvas öffnen“ im Lab; im Canvas Gruppe **„Unterrichts-Labs“** im Topologie-Menü, Umschalter **Zielzustand / Startzustand**, **„Zurück zum Lab“**. Lädt als neue Vorlage, überschreibt keine gespeicherten Topologien und ändert die gespeicherte Engine-Einstellung nicht |
| Linienführung | `TopologyLink.bendPoints`, `LinkRenderer` | parallele Verbindungen (Loop, Bundle) mit Zwischenpunkten; Labels und STP-Marker folgen der Linie |
| Zonen | `placeZoneBadge` | Zonen-Titel steht in der Ecke, in der er weder Linien noch Labels noch Geräte berührt (Lab-Diagramm und Canvas) |
| STP im Canvas | Konverter | wenn das Lab `spanning-tree` konfiguriert: Port-Rollen RP/DP/BLK an den Links, blockierter Link markiert (berechnet aus Priorität/MAC/Kosten, siehe `stp-calc.ts`) |
| Tests | `lab-topologies-network.test.ts`, `lab-topology-quality.test.ts`, `lab-topology-matches-lab-text.test.ts` | datengetrieben über **alle** Einträge in `CURATED_TOPOLOGIES`; neue Labs werden automatisch erfasst |
| Screenshots | `scripts/e2e/lab-topology-screenshots.mjs` | Dark/Light × 1440/390 px × Detail/Simple, im Lab-Dialog und im Canvas; prüft außerdem Laden der Vorlage, Startzustand und den Rücksprung |

### Was der Test je Lab prüft

1. Schema gültig (`networkTopologySchema`), Kategorie `teaching-labs`, `labId`/`labState` gesetzt.
2. Alle Interfaces (Links, Adressierungstabelle, Konfiguration) existieren im Hardware-Profil; kein Interface doppelt belegt.
3. Jede Zeile der Verbindungsliste des Labs (`A Port ↔ B Port`, Ketten mit `→`) entspricht einem Link mit denselben Ports. Bekannte Widersprüche stehen in einer Ausnahmeliste (derzeit nur die zwei ospf-Zeilen).
4. Jede IP/Maske der Adressierungstabelle stimmt mit den Befehlen überein (`ip address` bzw. Desktop-Konfiguration inkl. Gateway).
5. Validierung (`validateTopology`) liefert genau die erwarteten Meldungen (derzeit überall keine).
6. Startzustand: dieselben Geräte/Links, keine IPs, keine VLANs.
7. CLI-Export: nicht leer, kein Prompt, identisch mit `config.labCli`.
8. **Keine erfundenen IPs** in allen `show`-Ausgaben des Generators (jede IP muss zu einem Interface, einem Netz, einer Maske, einem Gateway oder einer im Lab konfigurierten Router-ID gehören); `show vlan brief` nennt nur VLANs des Labs.
9. Layout: 0 überlappende Bounding-Boxes (Icons, Gerätenamen, Port-Labels, Subnetz-Labels), 0 sich kreuzende Linien, Tier-Ausrichtung, **10-px-Raster**, **Zonen-Titel liegen in der Zone und überdecken nichts**.
10. Spezifisch: stp (Root SW1 mit Priorität 4096, SW2 Gi0/1 Root-Port, Gi0/2 Alternate), etherchannel (Po1 LACP, `show etherchannel summary`), ivr-svi (SVIs, `ip routing`, Routen), vtp-dtp (VLAN-Datenbank nur auf dem Server), ospf (DR/BDR aus der Konfiguration).

## 2. Die vier Labs

| Lab | Geräte | Links | Modell/Profil | Besonderheit |
|---|---|---|---|---|
| stp | 4 (2 SW, 2 PC) | 4 | 2960-24TT | zwei parallele Gi-Links (Loop), Root SW1 |
| vtp-dtp | 5 (3 SW, 2 PC) | 4 | 2960-24TT | Trunks, VLAN 10 VERWALTUNG/20 TECHNIK, VTP-Rollen im Modelltext |
| etherchannel | 4 | 4 | 2960-24TT | Fa0/1–2 als Port-channel 1 (LACP active), PCs an Fa0/3 |
| ivr-svi | 3 (MLS1, 2 PC) | 2 | **3650-24PS** | SVIs `Vlan10`/`Vlan20` |

## 3. Selbstprüfung je Lab (was noch nicht gut aussieht)

**stp.** Gut: Schleife als symmetrisches Sechseck, Rollen im Canvas gut lesbar (SW1 DP/DP, SW2 RP/BLK, blockierter Link orange). Schwach: im Lab-Dialog ist das Diagramm bei 1440 px nur etwa 490 px breit, Port-Labels sind dort ca. 6 px hoch (gilt für alle Labs inkl. Pilot-Labs, Layout der Dialogspalte ist nicht Teil dieses Auftrags). „Root“ steht nur im Modelltext, nicht als eigenes Zeichen. Im Canvas steht das Modell nicht am Gerät.

**vtp-dtp.** Gut: Kette mit Trunk-Labels, zwei VLAN-Zonen mit Netzadresse. Schwach: VLAN 20 TECHNIK steht nur in der Legende (kein Port im Lab). VTP-Rollen (Server/Client) sieht man nur im Lab-Diagramm. **Lab-Fehler:** `desirable` ↔ `trunk nonegotiate` (siehe Korrekturvorschläge), im Zielzustand zeigt SW1 deshalb keinen Trunk auf Gi0/1.

**etherchannel.** Gut: gebündelte Links mit Beschriftung „Port-channel 1 · LACP active“, `show etherchannel summary` korrekt (`Po1(SU)`, beide `(P)`). Schwach: im Canvas fehlt die Port-channel-Beschriftung, die Zwischenpunkt-Linien ersetzen dort das Bündel-Symbol (Ellipse). Beide Links sind grün (EtherChannel), aber ohne Hinweis auf die Gruppe.

**ivr-svi.** Gut: Dreiecksform, zwei VLAN-Zonen, SVIs in der Tabelle und im Canvas-Inspektor. Schwach: Die SVIs sind im Diagramm nicht am Gerät gezeichnet. Modell: Lab sagt „z. B. 3560“, die Ports sagen 3650 → Topologie folgt den Ports.

**Alle.** Die Diagramme im Lab-Dialog sind klein (siehe oben). Im Canvas auf 390 px passt die Topologie, aber die Schrift ist dort sehr klein (Pinch-Zoom nötig).

## 4. Gefundene Fehler und Korrekturen am Rand

| Fund | Korrektur |
|---|---|
| Lab-Dialog bei 390 px: Detailbereich 481 px breit, Inhalt rechts abgeschnitten (auch bei den Piloten) | Detailbereich ohne Radix-ScrollArea (dessen innerer `display:table`-Wrapper breitete sich aus), Grid-Spalten `min-w-0` |
| Canvas: `fitView` ignorierte Zonen und lief mit veralteter Container-Größe | Zonen eingerechnet; Einpassen nach dem Laden |
| Canvas: Toolbar lief bei 390 px über | Auswahlzeile umbrechbar |
| Canvas: Zonen-Titel zeigte leere Klammern `()` ohne Netzadresse | nur mit Adresse |

## 5. Änderungen an den Piloten (inhaltlich unverändert, Layout angepasst)

Meine neuen Prüfungen (10-px-Raster, Zonen-Titel) schlugen bei den Piloten an. Das Pilot-Layout hatte also Verstöße, die der bisherige Test nicht erfasste. Angepasst wurde **nur Gestaltung**:

- Alle Koordinaten (Geräte, Zwischenpunkte, Zonen, Label-Positionen) auf das 10-px-Raster gerundet (z. B. `y: 65` → `70`).
- vlan-trunking: Zonen-Titel gekürzt (`VLAN 10 · SALES · PC0 192.168.10.10` → `VLAN 10 · SALES`; die IPs stehen in der Tabelle). Die Titel waren breiter (268 px) als die Zonen (160 px).
- ospf: LAN-Zonen breiter/höher (Titel passten nicht hinein), `viewBox` von 560 auf 620 Höhe.

Adressen, Ports, Geräte, VLANs und Lab-Inhalte sind unverändert; alle bestehenden Pilot-Tests laufen.

## 6. Screenshots

`docs/lab-topologien/screenshots/<lab>/` — je Lab 17 Bilder (JPEG, ca. 4–6 MB insgesamt für vier Labs):
`lab-{dark,light}-{1440,390}-{detail,simple}.jpg`, `canvas-{dark,light}-{1440,390}-{detail,simple}.jpg`, `canvas-dark-1440-startzustand.jpg`.
Enthalten sind die vier neuen Labs und zur Regression die vier Piloten. Der Lauf prüft zusätzlich: Vorlage lädt (`lab:<id>`), Startzustand umschaltbar, „Zurück zum Lab“ öffnet das Lab. Ergebnis: 50 von 50.

Selbst angesehen habe ich: stp (Canvas dark 1440/390, Lab dark 1440), vtp-dtp (Canvas dark/light, Lab dark/light 390), etherchannel (Canvas dark 1440), ivr-svi (Lab light 1440), ospf (Canvas dark 1440), vlan-trunking (Lab dark 1440). Die übrigen Bilder sind vom Skript erzeugt, aber nicht einzeln begutachtet.

## 7. Offen / Entscheidungen

1. Lab-Text-Korrekturen: `KORREKTURVORSCHLAEGE-LABTEXT.md` (Datei, Stelle, alt, neu). Besonders vtp-dtp (DTP) und ivr-svi (Modell).
2. Das Diagramm im Lab-Dialog ist bei 1440 px klein. Vorschlag (nicht umgesetzt): die Topologie-Spalte breiter machen oder einen Vollbild/Zoom-Button ergänzen.
3. Der Canvas zeigt keine Modelltexte (VTP-Rolle, „Root“). Vorschlag: Gerätenotiz aus `model` als zweite Zeile unter dem Namen.
4. Paket 2 (Routing, 9 Labs + 2 Drills) wartet auf dein OK.

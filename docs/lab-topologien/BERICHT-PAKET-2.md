# Lab-Topologien — Paket 2 (Routing): Bericht

Branch `feature/lab-topologies-routing` (von `main` @ `18c8fd3`). Nicht gemergt.
Neue Topologien (11): **static-routing, floating-static, rip-v1, rip-v2, rip-v2-passive, ospf-rid-wildcard, ospf-dr-bdr-election, ospf-multiarea, eigrp, drill-interfaces, drill-pc-ips**. Pilot `ospf` unverändert.
Lint 0 Fehler (48 Warnungen wie vorher), **902 Tests in 54 Dateien grün** (vorher 681 / 53), Build grün, Layout-Audit: 0 Überlappungen, 0 Zonen-Konflikte, 0 Raster-Abweichungen in allen 19 Labs.

## 1. Neu im Fundament

| Baustein | Inhalt |
|---|---|
| Fehlende Geräte („im Lab nicht angegeben“) | `assumed` an Gerät (Lab-Typ, Canvas-Typ, Schema). Gestrichelter Rahmen und Beschriftung „im Lab nicht angegeben“ im Lab-Diagramm und im Canvas. Kein Interface-Profil, keine Konfiguration, kein CLI-Export. Profil `extern` (Wolke ohne Ports) |
| Konverter | Mehrgeräte-Blöcke (`PC1–PC5`, `R1 / R2`) werden einzeln zugeordnet (Host-IPs der Reihe nach); `interface loopback N` → `LoN`; deutsche Desktop-Zeilen (`IP-Adresse`, `Subnetzmaske`, `Gateway`); Zeilen der Form `Server0: IP / Maske / GW x` |
| Builder | `link(...)` und `ifRow(...)` in `topologies/builders.ts` |
| Dateien | `topologies/routing-labs.ts` (5 Labs), `topologies/routing-more.ts` (6 Labs), beide in `curated-topologies.ts` |
| Tests (datengetrieben) | Verbindungstest versteht jetzt Klammern mit Kommas, `—`/`·`-Ketten, Adress-Zusätze (`Gi0/0 192.168.1.254/24`), Bereiche (`PC0–PC5 → SW1 Fa0/1–Fa0/6`, `R1..R4 Gi0/1 → Sw1`). Der CLI-Test verlangt Befehle nur für Geräte, die das Lab konfiguriert; sonst muss der Export leer sein (nichts erfunden). Der Lab-Text-Test kennt Loopbacks, deutsche Desktop-Zeilen und Mehrgeräteblöcke |
| Neue Testdatei | `lab-routing-topologies.test.ts` (12 labspezifische Prüfungen) |

## 2. Die Labs

| Lab | Geräte | Links | Besonderheit |
|---|---|---|---|
| static-routing | 2 R, 2 SW, 4 PC | 7 | Routen im CLI-Export von R1/R2 |
| floating-static | 1 R + 2 angenommene (ISP-MPLS, DSL-Modem) | 2 | AD 1 / AD 200 in den Link-Beschriftungen; angenommene Geräte gestrichelt |
| rip-v1 / rip-v2 | je 3 R, 3 SW, 3 PC | gleiche Struktur | WAN-Masken /24 (v1) bzw. /30 (v2) laut Lab |
| rip-v2-passive | 4 R, 1 SW, PC0, 2 Server | 7 | Segment 10.0.0.8/29 über SW1; LAN-Interfaces passive |
| ospf-rid-wildcard | 3 R, 2 PC | 4 | Loopback = Router-ID (1.1.1.1 / 2.2.2.2 / 3.3.3.3) |
| ospf-dr-bdr-election | 4 R, Sw1, PC0, 3 Server | 8 | Priorities 255 / 100 / 0 / Default auf Gi0/1, Segment 10.1.0.0/29 |
| ospf-multiarea | 3 R, 2 PC | 4 | R2 = ABR (Area 0 und Area 1), Area 1 stub |
| eigrp | 3 R, 2 SW, 2 PC | 7 | Dreieck mit drei /30-Links |
| drill-interfaces | 2 R | 1 | nur der WAN-Link wird gezeichnet; die LAN-Interfaces (Gi0/0, Gi0/2) stehen nur in der Tabelle |
| drill-pc-ips | 1 SW, 6 PC | 6 | Zone 192.168.50.0/24, Gateway .1 ohne Gerät (im Lab nicht angegeben) |

## 3. Offene Punkte und Annahmen (nichts geraten, aber dokumentiert)

| Lab | Punkt |
|---|---|
| ospf-dr-bdr-election | **Nachbartabelle bleibt leer.** `computeOspfNeighbors` kennt nur direkte Links; das gemeinsame Segment läuft über Sw1. Priorities und Router-IDs (höchste Loopback, Lab setzt keinen `router-id`-Befehl) sind im Modell korrekt, `show ip ospf neighbor` zeigt aber nichts. Eine Wahl über ein L2-Segment hinweg wäre eine eigene Funktion; Entscheidung bei dir |
| ospf-dr-bdr-election | Server-IPs stehen im Lab nur in der Zeile `Server0: 192.168.2.11 / …`; der Konverter liest diese Zeile |
| ospf-dr-bdr-election, rip-v2-passive | Switch-Ports sind im Lab nicht angegeben. Konvention wie in Paket 1: Endgeräte/Router an Fa0/1.. in Gerätereihenfolge, Uplink Gi0/1. Das ist eine Annahme, nicht Lab-Inhalt |
| rip-v2-passive | Verbindungstext „R3 Fa/Gi“ ist mehrdeutig; die Konfiguration gilt (Gi0/1) |
| floating-static | Der IP-SLA-Bonusschritt (`track`) ändert die Route; die Topologie zeigt den Zustand der Grundkonfiguration |
| drill-interfaces | R1 Gi0/0, Gi0/2 und R2 Gi0/0, Gi0/2 haben Adressen, aber keine Gegenstelle im Lab: nicht gezeichnet |
| Lab-Texte | Keine neuen Widersprüche gefunden, daher keine Ergänzung in `KORREKTURVORSCHLAEGE-LABTEXT.md` |

## 4. Selbstprüfung je Lab (was noch nicht gut aussieht)

Die Beurteilung unten stützt sich auf Layout-Audit und Tests. Die Screenshots liegen in `docs/lab-topologien/screenshots/<lab>/` und sind visuell noch nicht von dir abgenommen.

**static-routing, rip-v1, rip-v2.** Gut: klare Zweier-/Dreier-Struktur, LAN-Zonen mit Netzadresse. Schwach: die Port-Labels stehen weit von den Geräten (Abstände zur Überlappungsfreiheit), die Linien wirken dadurch leicht „leer“.

**floating-static.** Gut: Primär-/Backup-Link mit AD sofort lesbar. Schwach: die angenommenen Geräte sind nur gestrichelt markiert; im Canvas erscheinen sie ohne Ports.

**rip-v2-passive.** Gut: Segment-Switch als eigene Ebene, drei LAN-Zonen. Schwach: höchstes Diagramm der Gruppe (720 px), bei 390 px sehr klein.

**ospf-rid-wildcard, ospf-multiarea.** Gut: Router-Kette mit Subnetz-Labels über der Linie. Schwach: Area-Zugehörigkeit steht nur in Modelltext/Tabelle und bei multiarea in den Link-Labels, nicht als eigene Zone.

**ospf-dr-bdr-election.** Gut: Sw1 oben, vier Router, LAN-Zonen darunter, keine Kreuzungen. Schwach: DR/BDR sind im Diagramm nicht markiert (Priorities nur in der Tabelle/Inspektor), Nachbartabelle leer (siehe Abschnitt 3).

**eigrp.** Gut: Dreieck mit R2 unten, drei Subnetz-Labels. Schwach: die Diagonal-Links nutzen große Port-Offsets, dadurch stehen die Labels weit von R2.

**drill-interfaces, drill-pc-ips.** Gut: bewusst schlicht. Schwach: drill-interfaces zeigt nur zwei Geräte; drill-pc-ips ist breit (1000 px), bei 390 px klein.

**Alle.** Wie in Paket 1: Lab-Dialog bei 1440 px zeigt das Diagramm klein; im Canvas fehlt der Modelltext am Gerät.

## 5. Geänderte Tests (keine abgeschwächt)

- `lab-topologies-network.test.ts`: Verbindungsparser erweitert (siehe oben), CLI-Test unterscheidet „im Lab konfiguriert“ / „nicht konfiguriert → Export muss leer sein“.
- `lab-topology-matches-lab-text.test.ts`: Loopback, deutsche Desktop-Zeilen, Mehrgeräteblöcke; die Prüfung selbst ist nicht entfernt worden.

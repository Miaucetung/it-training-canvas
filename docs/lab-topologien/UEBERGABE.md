# Übergabe: Lab-Topologien (Stand nach Paket 7)

## Stand
- In `main` (`03969dd`): Pakete 1 bis 6, IPv6-Ausgaben, OSPF über Switch-Segmente, STP-Makros, Dashboard (Lernpfad, Fortschritt, Einführung).
- `feature/lab-topologies-campus` (nicht gemergt): Paket 7 Campus (2 Labs), siehe `BERICHT-PAKET-7.md`. Damit haben 50 von 55 Labs eine Vorlage; die fünf ohne Netz sind im Bericht genannt.
- Lint 0 Fehler (48 Warnungen), 1607 Tests in 67 Dateien grün, Build grün.
- Berichte: `BESTANDSAUFNAHME.md`, `BERICHT-PAKET-1.md` bis `-7.md`, `KORREKTURVORSCHLAEGE-LABTEXT.md`. Screenshots entstehen nur noch unter `.local/screenshots` (nicht im Repo).

## Fundament (für alle Pakete)
- Daten: `src/components/labs/topologies/<kategorie>.ts` plus `builders.ts`, zusammengeführt in `curated-topologies.ts`.
- Konverter Lab -> Canvas: `src/components/labs/lab-to-network.ts` (Konfiguration nur aus den Lab-Befehlen).
- Hardware-Profile: `src/lib/topology/hardware-profiles.ts`.
- Tests laufen datengetrieben über alle Einträge in `CURATED_TOPOLOGIES` (`lab-topologies-network`, `lab-topology-quality`, `lab-topology-matches-lab-text`). Neues Lab = Eintrag anlegen, Tests greifen automatisch.
- Screenshots: `npm run build && node scripts/e2e/lab-topology-screenshots.mjs <lab-id> ...` (Ausgabe nach `.local/screenshots`, gitignored; nicht committen).
- Layout-Analyse: `scripts/audit/lab-layout.audit.ts` (`npx vitest run -c scripts/audit/vitest.audit.config.ts scripts/audit/lab-layout.audit.ts --disableConsoleIntercept`).

## Offen
1. Lab-Text-Korrekturen entscheiden/selbst ändern (`KORREKTURVORSCHLAEGE-LABTEXT.md`); vtp-dtp (DTP) und ivr-svi (Modell 3650) zuerst. Danach ggf. Ausnahmeliste `KNOWN_CONNECTION_CONTRADICTIONS` im Test anpassen (ospf).
2. Diagramm im Lab-Dialog bei 1440 px klein (Port-Labels ca. 6 px); Vorschlag: breitere Spalte oder Zoom/Vollbild.
3. Canvas zeigt keine Modelltexte (VTP-Rolle, Root); Vorschlag: zweite Zeile unter dem Gerätenamen.
4. Fehlende Geräte: gestrichelt, „im Lab nicht angegeben“, ohne CLI-Export (`assumed`) — umgesetzt in Paket 2 (floating-static); für hsrp, acl-extended, ntp-syslog-snmp in Paket 4 anwenden.
5a. OSPFv3/EIGRPv6-Nachbarschaften und `show ipv6`-Ausgaben gibt es nicht (nur Adressen und Protokollname). Entscheidung offen.
5. Entschieden, noch nicht umgesetzt: DHCP-Clients als „DHCP (Netz/Präfix)“, Profil mit `Ethernet0/0`-Namen für co-acl-nat-isp, 2911 mit zweitem HWIC für ipv6-static (`Se0/1/0`).
6. Branch ist nicht in `main`; vor dem Merge OK abwarten.

## Nächste Schritte
- **Nachrüstschritt show-Ausgaben: umgesetzt auf `feature/show-outputs`** (Stufen 1 bis 5, je ein Commit; Details und Annahmen in `BERICHT-SHOW-OUTPUTS.md`): DHCP (`show ip dhcp pool/binding`), VTP (`show vtp status`), NAT (statische Einträge), HSRP (`show standby brief`), statische Routen im `show ip route`, GRE (`show interfaces tunnel`), IPsec (`show crypto map/isakmp sa/ipsec sa`), EIGRP für IPv4 (Nachbarn, `D`-Routen), Redistribution (`D EX`, `O E2/E1`). Nach OK mergen.
- Offene Folgearbeit: `show ip nat statistics`, `show ip eigrp topology` (Feasible Successor), Stub-/NSSA-Areas und ABR-Summarisierung bei OSPF, ACL-Auswertung (`show ip access-lists` mit Treffern entsteht zur Laufzeit).
- Pro Paket: Topologie-Datei, Tests grün, Screenshots, Bericht mit Selbstprüfung, dann auf OK warten.

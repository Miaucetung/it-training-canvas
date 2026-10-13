# Übergabe: Lab-Topologien (Stand nach Paket 4)

## Stand
- In `main` (`64ba462`): Paket 1 (Layer 2), 2 (Routing), 3 (IPv6) mit Fundament, Screenshots aller Labs, OSPF über Switch-Segmente, Diagramm-Zoom.
- `feature/ipv6-outputs` (nicht gemergt): `show ipv6 interface brief/route`, OSPFv3-/EIGRPv6-Nachbarn, Hinweise, alle IPv6-Adressen im Canvas.
- `feature/lab-topologies-services` (nicht gemergt, baut auf `feature/ipv6-outputs` auf): Paket 4 Services (10 Labs), siehe `BERICHT-PAKET-4.md`.
- Lint 0 Fehler (48 Warnungen), 1220 Tests in 58 Dateien grün, Build grün.
- Berichte: `BESTANDSAUFNAHME.md` (alle 55 Labs), `BERICHT-PAKET-1.md` bis `-4.md`, `KORREKTURVORSCHLAEGE-LABTEXT.md`. Screenshots: `screenshots/<lab>/`.

## Fundament (für alle Pakete)
- Daten: `src/components/labs/topologies/<kategorie>.ts` plus `builders.ts`, zusammengeführt in `curated-topologies.ts`.
- Konverter Lab -> Canvas: `src/components/labs/lab-to-network.ts` (Konfiguration nur aus den Lab-Befehlen).
- Hardware-Profile: `src/lib/topology/hardware-profiles.ts`.
- Tests laufen datengetrieben über alle Einträge in `CURATED_TOPOLOGIES` (`lab-topologies-network`, `lab-topology-quality`, `lab-topology-matches-lab-text`). Neues Lab = Eintrag anlegen, Tests greifen automatisch.
- Screenshots: `npm run build && node scripts/e2e/lab-topology-screenshots.mjs <lab-id> ...`.
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
- Nach OK: `feature/ipv6-outputs` und `feature/lab-topologies-services` mergen.
- Danach Paket 5 Security, 6 Operations/Automation, 7 Campus (Details und Lücken je Lab: `BESTANDSAUFNAHME.md`).
- Pro Paket: Topologie-Datei, Tests grün, Screenshots, Bericht mit Selbstprüfung, dann auf OK warten.

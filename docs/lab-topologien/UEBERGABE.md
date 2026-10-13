# Übergabe: Lab-Topologien (Stand nach Paket 3)

## Stand
- Paket 1 und 2 sind in `main` (`c6999e7`). Paket 3 (IPv6: ipv6, ipv6-static, ospfv3-ipv6, ipv6-ospfv3-eigrpv6) liegt auf `feature/lab-topologies-ipv6`, nicht gemergt; Bericht `BERICHT-PAKET-3.md`.
- Paket 2 fertig: static-routing, floating-static, rip-v1, rip-v2, rip-v2-passive, ospf-rid-wildcard, ospf-dr-bdr-election, ospf-multiarea, eigrp, drill-interfaces, drill-pc-ips.
- Lint 0 Fehler (48 Warnungen), 902 Tests in 54 Dateien grün, Build grün.
- Berichte: `BESTANDSAUFNAHME.md` (alle 55 Labs), `BERICHT-PAKET-1.md`, `BERICHT-PAKET-2.md`, `KORREKTURVORSCHLAEGE-LABTEXT.md`. Screenshots: `screenshots/<lab>/`.

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
- Nach OK zu Paket 3: Merge von `feature/lab-topologies-ipv6`.
- Danach Paket 4 Services, 5 Security, 6 Operations/Automation, 7 Campus (Details und Lücken je Lab: `BESTANDSAUFNAHME.md`).
- Pro Paket: Topologie-Datei, Tests grün, Screenshots, Bericht mit Selbstprüfung, dann auf OK warten.

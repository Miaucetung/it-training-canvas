# Übergabe: Lab-Topologien (Stand nach Paket 1)

## Stand
- Branch `feature/lab-topologies` (von `main` @ `53875eb`), nicht gemergt.
- Paket 1 (Layer 2) fertig: stp, vtp-dtp, etherchannel, ivr-svi; Piloten (basic-ip, vlan-trunking, roas, ospf) auf demselben Fundament.
- Lint 0 Fehler (48 Warnungen), 681 Tests in 53 Dateien grün, Build grün.
- Berichte: `BESTANDSAUFNAHME.md` (alle 55 Labs), `BERICHT-PAKET-1.md`, `KORREKTURVORSCHLAEGE-LABTEXT.md`. Screenshots: `screenshots/<lab>/`.

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
4. Verteiler fehlen im Lab-Text (hsrp, acl-extended, ntp-syslog-snmp): entschieden = gestrichelt zeichnen, beschriftet „im Lab nicht angegeben“, ohne Konfiguration im CLI-Export (noch nicht umgesetzt).
5. Entschieden, noch nicht umgesetzt: DHCP-Clients als „DHCP (Netz/Präfix)“, Profil mit `Ethernet0/0`-Namen für co-acl-nat-isp, 2911 mit zweitem HWIC für ipv6-static (`Se0/1/0`).
6. Branch ist nicht in `main`; vor dem Merge OK abwarten.

## Nächste Schritte
- Paket 2 Routing (static-routing, floating-static, rip-v1, rip-v2, rip-v2-passive, ospf-rid-wildcard, ospf-dr-bdr-election, ospf-multiarea, eigrp) plus Drills drill-interfaces, drill-pc-ips.
- Danach Paket 3 IPv6, 4 Services, 5 Security, 6 Operations/Automation, 7 Campus (Details und Lücken je Lab: `BESTANDSAUFNAHME.md`).
- Pro Paket: Topologie-Datei, Tests grün, Screenshots, Bericht mit Selbstprüfung, dann auf OK warten.

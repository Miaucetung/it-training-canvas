# Lab-Topologien — Paket 6 (Operations/Automation): Bericht

Branch `feature/lab-topologies-operations` (von `main` @ `75fbd5a`). Nicht gemergt.
Neue Topologien (5): **ios-backup-upgrade, dhcp-troubleshoot-lab, netflow, restconf, netconf-yang**.
Keine Netz-Topologie (laut Bestandsaufnahme, bewusst nicht angelegt): password-recovery, layer1-issues, troubleshooting-cheat, drill-grundkkonfig und drill-access-ports.
Lint 0 Fehler (48 Warnungen wie vorher), **1525 Tests in 61 Dateien grün**, Build grün, Layout-Audit 0 Überlappungen / Zonen-Konflikte / Raster-Abweichungen, Screenshots 100/100 und 60/60 Prüfungen.

## 1. Neu im Fundament

| Baustein | Inhalt |
|---|---|
| STP-Makros | Grundregel „letzter Befehl gilt“ (`priority` und `root primary/secondary` setzen dieselbe Zeile). `root secondary` = 28672; `root primary` = 24576, oder 4096 unter der niedrigsten Priority der **verbundenen** anderen Switches, wenn diese niedriger ist. Im zweiten Fall ist das Ergebnis vom Netzzustand abhängig und als uneindeutig gekennzeichnet (Modell `stp.ambiguous`, Hinweis im Inspector). stp-hardening: Core 24576 (statt 4096), Ergebnis unverändert (Core bleibt Root, Dist2 Gi0/3 blockiert) |
| Textmarken im Canvas | `notes` aus den Lab-Daten erscheinen auch im Canvas als Notizen („Lab-Hinweis“), Fehlermarken als „Beabsichtigter Fehler“ (rot) und nur im Startzustand |
| IOS-XE-Profil | `iosxe-router` mit `Gi0/0–0/2` (restconf, netconf-yang; kein ISR 2911) |
| Tests | Verbindungstest: Zeilen ganz ohne Port prüfen, dass die genannten Geräte über einen Link verbunden sind; DHCP-Clients „Netz im Lab nicht angegeben“ müssen im Lab `ipconfig /renew` ausführen; neue Dateien `lab-operations-topologies.test.ts` (5) und `lab-stp-macros.test.ts` (5) |

## 2. Die Labs

| Lab | Besonderheit |
|---|---|
| ios-backup-upgrade | R1 ↔ TFTP-Server; Subnetz nur als Beispiel genannt: keine R1-Adresse, keine Maske, nur 10.1.1.10 aus dem `ping`-Befehl (Interface ohne IP) |
| netflow | R1 Gi0/0 10.0.0.1/24, Lo0 10.0.0.254/32 (Exporter-Quelle), Collector 10.0.0.60; Verbindung über Gi0/0 (Lab nennt nur „Mgmt“), per Textmarke gekennzeichnet |
| restconf, netconf-yang | R1 (IOS-XE) Gi0/0 10.0.0.1/24, Admin-PC 10.0.0.10; Port per Textmarke gekennzeichnet |
| dhcp-troubleshoot-lab | drei Fehler als markierte Hinweise im Startzustand; Zielzustand mit SW1-SVI 192.168.2.50; Clients ohne Netz („DHCP (Netz im Lab nicht angegeben)“), Server-Adresse nur als Verweis auf `ip helper-address` |

## 3. Offene Punkte

- **dhcp-troubleshoot-lab:** Das Lab nennt nur die drei Korrekturen, nicht die Ausgangskonfiguration. Der Startzustand zeigt daher Geräte und Links ohne Konfiguration plus die Fehlermarken; ein „fehlerhaft konfigurierter“ Startzustand ließe sich nur mit einer vollständigen Basiskonfiguration im Lab darstellen. SW1-Ports (Gi0/1 zum Router, Fa0/1–3) sind angenommen.
- **netflow, restconf, netconf-yang:** Das Lab nennt „Mgmt“ ohne Port; die Topologie zeichnet Gi0/0, weil dort die Adresse liegt (kein angenommener Switch-Port, siehe Textmarke).
- **ios-backup-upgrade:** Keine Adresse für R1 und keine Maske, weil das Lab nur ein Beispielnetz nennt.
- Nachrüsten (Schritt nach Paket 7): show-Ausgaben für NAT, HSRP, GRE, IPsec sowie EIGRP für IPv4 und Redistribution, siehe `UEBERGABE.md`.

## 4. Selbstprüfung je Lab (was noch nicht gut aussieht)

**ios-backup-upgrade, netflow, restconf, netconf-yang.** Gut: sehr ruhig, zwei Geräte, Hinweise in der Textmarke. Schwach: wenig Aussage im Diagramm selbst; Flow-Record/Exporter, YANG- und curl-Details nur im CLI-Export.

**dhcp-troubleshoot-lab.** Gut: die Fehler stehen als rote Notizen am Ort des Problems und verschwinden im Zielzustand. Schwach: die Fehlermarken sind nicht per Linie an die Geräte gebunden (nur räumlich nah); der Startzustand ist nicht „kaputt konfiguriert“, siehe oben.

# Lab-Topologien — Paket 5 (Security): Bericht

Branch `feature/lab-topologies-security` (von `main` @ `826a0f9`). Nicht gemergt.
Neue Topologien (10): **ssh, device-hardening, port-security, acl-standard, acl-extended, dhcp-snooping-dai, stp-hardening, vlan-hopping, aaa-radius-tacacs, co-acl-nat-isp**; außerdem dhcp-relay überarbeitet.
Lint 0 Fehler (48 Warnungen wie vorher), **1420 Tests in 59 Dateien grün**, Build grün, Layout-Audit 0 Überlappungen / Zonen-Konflikte / Raster-Abweichungen, Screenshots 110/110 Prüfungen.

## 1. Neu im Fundament

| Baustein | Inhalt |
|---|---|
| „im Lab nicht konfiguriert“ | `assumedReason: "not-configured"`: im Lab genannte, aber nicht konfigurierte Geräte gestrichelt, Beschriftung „im Lab nicht konfiguriert“, ohne Export. dhcp-relay: Client Gelb und SW2-Endgeräte; co-acl-nat-isp: SW1/SW2. „Nicht angegeben“ (fehlt im Lab) bleibt für Verteiler und das Internet-Segment |
| Profile | `iol-router` / `iol-switch` mit `Ethernet0/0–0/3` (Kurzform `Et0/0`) für co-acl-nat-isp, `catalyst2960-4gi` (Gi0/1–4) für stp-hardening; Parser und Tabelle verstehen `interface ethernet 0/0` und `ETH0/1` |
| STP | `spanning-tree vlan … root primary/secondary` als Makro (24576 / 28672), nur wenn keine explizite Priority gesetzt ist |
| OSPF | Router-on-a-Stick am Trunk: ein dot1q-Subinterface des passenden VLANs bildet die Nachbarschaft (co-acl-nat-isp CO-2 ↔ ISP-MUMBAI über ISP-SW); Tests positiv und negativ (falsches VLAN, VLAN nicht erlaubt, Subinterface an anderem Port) |
| Parser | `Statische IP: … /24` |
| Tests | Quality-Test: Labs ganz ohne IP (stp-hardening) dürfen eine leere Tabelle haben (geprüft gegen den Lab-Text); `lab-security-topologies.test.ts` (8 Prüfungen) |

## 2. Die Labs

| Lab | Besonderheit |
|---|---|
| ssh, device-hardening | Management-SVI bzw. Interface, Hardening-Befehle im Export |
| port-security | PC3 nicht angeschlossen (Textmarke), Port-Security-Parameter an den Links |
| acl-standard | ACL 10 out am Server-Port, drei LANs |
| acl-extended | Verteiler angenommen (beide PCs am selben Router-Port) |
| dhcp-snooping-dai | Clients „DHCP (192.168.10.0/24)“, Angreifer statisch .99, Uplink trusted |
| stp-hardening | STP berechnet: Core Root, Dist2 Gi0/3 BLK; Rogue-Switch nicht angeschlossen |
| vlan-hopping | Trunk nativ 999, erlaubt 10,20; Angreifer-Switch nicht angeschlossen |
| aaa-radius-tacacs | RADIUS-Server außerhalb des Management-Netzes, ohne Maske und Weg (nichts erfunden) |
| co-acl-nat-isp | 20 Geräte, Ethernet-Namen, VLAN-99/199-Trunk zum ISP, drei Zonen |

## 3. Offene Punkte

- co-acl-nat-isp: EIGRP und Redistribution sind nicht modelliert (CO-1 zeigt keine Nachbarn); ACL- und NAT-Wirkung wird nicht simuliert.
- Angenommene Ports und Lab-Text-Befunde: `KORREKTURVORSCHLAEGE-LABTEXT.md`, Abschnitte 8 und 11.
- Physische Aktionen aus den Labs (PC3, Rogue-Switch, Angreifer-Switch) sind als nicht angeschlossene Geräte dargestellt, nicht als Start-/Zielzustand-Unterschied.

## 4. Selbstprüfung je Lab (was noch nicht gut aussieht)

**ssh, device-hardening, aaa.** Gut: ruhig, kurze Beschriftungen. Schwach: viel Leerraum, Hardening-/AAA-Details nur im CLI-Export und in der Tabelle.

**port-security, vlan-hopping.** Gut: Parameter direkt am Link. Schwach: nicht angeschlossene Geräte sind nur durch die Textmarke erklärt.

**acl-standard, acl-extended.** Gut: ACL-Platzierung am Link beschriftet. Schwach: die ACL-Zeilen selbst stehen nur im Export.

**dhcp-snooping-dai.** Gut: trusted/untrusted erkennbar. Schwach: VLAN-Lücke im Lab-Text (siehe Korrekturvorschläge, Abschnitt 11).

**stp-hardening.** Gut: Canvas zeigt Rollen (DP/RP/BLK), blockierter Link orange. Schwach: der BLK-Marker am Dist2-Port überlappt dort das Gerätesymbol (Canvas-Darstellung).

**co-acl-nat-isp.** Gut: komplettes Szenario mit Zonen. Schwach: größtes Diagramm (1780 × 780), im Dialog nur mit Zoom oder „Breit“ lesbar; ISP-Strecke und Hosts dicht.

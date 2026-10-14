# Lab-Topologien — Paket 7 (Campus): Bericht

Branch `feature/lab-topologies-campus` (von `main` @ `03969dd`). Nicht gemergt.
Neue Topologien (2): **vlan-dhcp-nat-roas, vlan-vtp-dhcp-campus**.
**Abdeckung: 50 von 55 Labs haben eine Topologie-Vorlage.** Ohne Vorlage bleiben bewusst: `drill-grundkonfig`, `drill-access-ports`, `password-recovery`, `layer1-issues` und `troubleshooting-cheat` (Konsole, Zähler bzw. „bestehendes Netz“ ohne Geräte und Adressen; Begründung je Lab in `BESTANDSAUFNAHME.md`).
Lint 0 Fehler (48 Warnungen wie vorher), **1607 Tests in 67 Dateien grün**, Build grün, Layout-Audit 0 Überlappungen / Zonen-Konflikte / Raster-Abweichungen, Screenshots 20/20 Prüfungen (außerhalb des Repos: `.local/screenshots/labs`).

## 1. Neu im Fundament

- **DHCP aus Pools:** Hat das Lab für das Netz eines Clients einen DHCP-Pool (`ip dhcp pool …` mit `network <Adresse> <Maske>`), gilt der Client als DHCP-Client, auch wenn der Text den Desktop nicht ausdrücklich auf DHCP stellt (hier nur `ipconfig /renew` bzw. „DHCP auswählen“ für „Alle PCs“). Der Test prüft Pool-Netz oder Desktop-Eintrag.
- Tests: `lab-campus-topologies.test.ts` (4 Prüfungen).

## 2. Die Labs

| Lab | Geräte | Besonderheit |
|---|---|---|
| vlan-dhcp-nat-roas | Router0, ISP, INTERNET, Webserver, SW1, SW2, 6 PCs (PC0, PC1, PC2, PC3, PC4, C5) | Router-on-a-Stick mit DHCP-Pools und PAT; Trunks laut Lab (SW1 on, SW2 desirable); PC-Namen wie im Lab (uneinheitlich) |
| vlan-vtp-dhcp-campus | R1, SW1–SW3, 9 PCs | Router-on-a-Stick mit Native-Subinterface, VTP-Server/-Client, zentrales DHCP, Management-SVIs |

## 3. Offene Punkte

- PC-Namen in vlan-vtp-dhcp-campus nennt das Lab nur als „PC Rot (an SW1)“; für die übrigen acht PCs ist das Schema übertragen.
- Die DHCP-Adressen entstehen zur Laufzeit, die Vorlage zeigt „DHCP (Netz)“.
- NAT-Tabellen, DHCP-Bindungen und VTP-Status werden nicht simuliert (Nachrüstschritt in `UEBERGABE.md`).

## 4. Selbstprüfung je Lab (was noch nicht gut aussieht)

**vlan-dhcp-nat-roas.** Gut: Kette Router0 → ISP → INTERNET → Webserver oben, die beiden Switch-Gruppen mit den VLAN-Spalten gleichfarbig ausgerichtet. Schwach: VLAN-Zugehörigkeit der PCs steht nur im Modelltext („VLAN 10“) und in der Legende, nicht als farbige Zone je VLAN.

**vlan-vtp-dhcp-campus.** Gut: drei gleichartige Switch-Gruppen, Trunk-Kette klar. Schwach: das Diagramm ist 1700 px breit (Zoom oder „Breit“ nötig); die langen PC-Namen („PC Blau (an SW2)“) nehmen viel Platz.

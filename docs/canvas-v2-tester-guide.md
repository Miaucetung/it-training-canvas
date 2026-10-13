# Tester-Leitfaden: CCNA Canvas Next (v2 SVG Preview)

Dieses Dokument dient als Leitfaden und Referenz für Tester von **CCNA Canvas Next (v2)** im Rahmen von Meilenstein 2d.

---

## 1. Wie schalte ich auf v2 um?

1. Öffne die CCNA-Lernplattform im Browser und navigiere zum **Canvas**-Bereich.
2. In der linken oberen Ecke des Zeichenbereichs findest du den Umschalter:
   - Klicke auf **`v2 (SVG Next)`**.
3. **Verlustfreier Entwurfs-Import:**
   - Deine bestehende v1-Zeichnung wird automatisch als Entwurf in die moderne SVG-Engine migriert.
   - Das Original in `canvas-app-data` bleibt unangetastet und gesichert.

---

## 2. Was ist neu in v2?

- **Netzwerk-Icons im Cisco-Stil:**
  - Vektorbasierte, scharfe SVG-Icons für alle 9 Schema-Gerätetypen (Router, L2-Switch, L3-Switch, Server, Endgerät/PC, Firewall, WLC, Access Point, Cloud).
- **Reale Hardware-Profile (Packet Tracer Standard):**
  - **Router:** Cisco 2911 ISR mit 2-Ebenen-Interfaces (`Gi0/0`, `Gi0/1`, `Gi0/2`), Serial HWIC-2T (`Se0/0/0`, `Se0/0/1`) und Loopback (`Lo0`).
  - **L2-Switch:** Cisco Catalyst 2960-24TT (`Fa0/1`–`Fa0/4`, Uplinks `Gi0/1`, `Gi0/2`, Management `Vlan1`).
  - **L3-Switch:** Cisco Catalyst 3650-24PS (24× Downlinks `Gi1/0/1`–`Gi1/0/24`, 4× 1G SFP Uplinks `Gi1/1/1`–`Gi1/1/4`, SVIs und Routing).
- **Gerätekonfiguration & Didaktische Validierung:**
  - **Hosts:** IP, Subnetzmaske, Default-Gateway (mit Warnung bei Subnetz-Mismatch), DNS.
  - **Router:** Hostname, Interfaces, Subinterfaces mit `encapsulation dot1q` (Router-on-a-Stick).
  - **Switches & EtherChannel:** Access-VLANs, Trunks (Allowed/Native VLANs) und Port-Channels mit allen 5 Modi (`on`, `active`, `passive`, `desirable`, `auto`).
  - Konsistenzprüfung für gebündelte Ports (Warnung bei VLAN- oder Modus-Mismatch, Port-Channel `(SU)` vs. `(SD)`).
- **Dynamischer Cisco IOS Inspector:**
  - Realistische Live-Ausgabe von `show ip interface brief`, `show ip route` und `show etherchannel summary`, direkt generiert aus dem Topologiemodell.
- **Tastaturbedienung & Barrierefreiheit (Roving Tabindex):**
  - Genau **ein** Tab-Stopp für den Canvas.
  - **Pfeiltasten:** 2D-Spatial Navigation zum nächstgelegenen Element in Blickrichtung.
  - **Shift + Pfeiltasten:** Verschiebt das aktuell selektierte Gerät.
  - **Alt + Pfeiltasten (oder Pfeiltasten ohne Selektion):** Pannen des Viewports.
  - **0 automatisch erkennbare Verstöße** im axe-core WCAG 2.1 AA Audit (Dark & Light Theme).
- **Touch & Mobile Ergonomie:**
  - 1 Finger verschiebt Geräte oder zeichnet; 2 Finger pannen/zoomen.
  - Long-Press (500 ms) öffnet das Kontextmenü mit Touch-Slop-Schutz (>10 px bricht ab).
  - Transform-Griffe mit mindestens 44 × 44 px Touch-Trefferfläche.
- **Sicherer Export & Speicherverwaltung:**
  - Bereinigter SVG-Vektorexport (Markup-Sanitization ohne Skript-Inhalte) und JSON-Import/Export.
  - Rollierendes Backup im LocalStorage (max. 3 Snapshots) mit QuotaExceeded-Absicherung.

---

## 3. Wie kehre ich zu v1 zurück?

- Klicke oben links auf **`v1 (Canvas)`** oder nutze den entsprechenden Umschalter in der Toolbar.
- Die v1-Engine (Canvas HTML5) übernimmt sofort wieder die Steuerung.
- Alle ursprünglichen v1-Inhalte sind zu 100 % erhalten geblieben.

# Original-Prompt: VLAN Vertiefung (CCNA Deep-Dive Modul)

> ⚠️ **WICHTIG FÜR COPILOT**: Diese Datei ist die Referenz für den vollständigen Scope des VLAN-Vertiefungs-Moduls.
> Bei Context-Compaction DARF der Phase-1-Plan diesen Scope NICHT reduzieren.
> Jede Abweichung (z. B. Quiz 25→15, 3 Labs→1 Lab) ist ein Fehler und muss vor der Implementierung korrigiert werden.

---

## Modul-Metadaten

| Feld | Wert |
|------|------|
| Topic-Datei | `src/content/modules/ccna/topics/vlan-advanced.ts` |
| Ziel-Topic | `vlan-advanced` |
| Zertifikat | CCNA 200-301 |
| Blueprint | 2.1, 2.2, 3.3 |
| Sprache | Deutsch (Cisco CLI bleibt Englisch) |
| Schätzung | 180 Minuten |

---

## Vollständige Themen-Liste (12 Themen)

Das Modul muss folgende 12 Themen als **separate, ausführliche Concepts** abdecken:

| # | Concept-ID | Titel | Blueprint |
|---|-----------|-------|-----------|
| 1 | `vlan-broadcast-problem` | Broadcast-Domäne — Problem & L2-Segmentierung | 2.1 |
| 2 | `dot1q-tagging` | 802.1Q Frame-Aufbau Byte für Byte (TPID/PCP/DEI/VID) | 2.1 |
| 3 | `vlan-port-typen` | Access-, Trunk- und Voice-VLAN-Ports | 2.1 |
| 4 | `vlan-typen` | VLAN-Typen (Default/Data/Voice/Management/Native) | 2.1 |
| 5 | `inter-vlan-routing` | Inter-VLAN Routing — ROAS vs. L3-Switch-SVI | 3.3 |
| 6 | `vtp-dtp` | VTP-Modi & DTP-Risiken | 2.1 |
| 7 | `vlan-sicherheit` | VLAN Hopping, Double-Tagging & Härtungs-Checkliste | 2.1 |
| 8 | `vlan-advanced-guide` | Lernguide: Anker → Szenario → Selbsttest | 2.1 |
| 9 | `vlan-simulator` | VLAN-Simulator (interaktives Tool) | 2.1 |
| 10 | `vlan-lab-bruecke` | Lab 12.1 — Kapitelabschluss ROAS (NetzTech GmbH) | 2.1, 3.3 |
| 11 | `vlan-lab-multi-switch` | Lab 12.2 — Multi-Switch mit L3-Switch und SVIs | 3.3 |
| 12 | `vlan-lab-wlan` | Lab 12.3 — WLAN-VLAN-Anbindung (AP → Trunk → Switch) | 2.1 |

---

## Lab-Szenario-Spezifikation

### Jedes Lab-Concept muss enthalten:

- [ ] ASCII-Topologie-Diagramm
- [ ] IP-Plan-Tabelle (VLAN-ID, Name, Subnetz, Verwendung)
- [ ] Komplette IOS-Config mit Kommentaren
- [ ] Mindestens 3 Verifikations-Befehle (`show`-Commands + `ping`)
- [ ] 5 Fehler-Bullets (typische Fallstricke mit Erklärung)
- [ ] Explizite Übungsaufgabe ("Füge VLAN X hinzu — was musst du ändern?")
- [ ] Cross-Reference zu verwandten Modulen (STP, Wireless, Security)
- [ ] Packet-Tracer-Hinweis (netacad.com, kostenloser Download)

### Lab 12.1 — ROAS / NetzTech GmbH (`vlan-lab-bruecke`)

- Topologie: PC1, PC2, IP-Phone → SW1 (Access) + SW2 (Distribution/Trunk) → R1 (ROAS)
- VLANs: SALES 10, IT 20, MGMT-DEPT 30, VOICE 100, MANAGEMENT 99, NATIVE 999
- Vollständige Config: SW1+SW2 Trunks, Access-Ports, Voice-VLAN, ROAS-Subinterfaces, SSH-SVI
- Übungsaufgabe: "Füge VLAN 40 (GÄSTE) hinzu und stelle sicher, dass GÄSTE-Hosts das Internet aber nicht VLAN 10/20 erreichen können"
- Einleitung: Packet-Tracer-Verweis (kostenlos via netacad.com)
- Abschluss: "Wenn du diese drei Szenarien aufgebaut und je einmal bewusst kaputtgemacht hast, hast du VLANs verstanden"

### Lab 12.2 — Multi-Switch / L3-Switch (`vlan-lab-multi-switch`)

- Topologie: PC1 + PC2 → SW1 (Access-Layer) → Trunk → SW2 (L3-Switch, Distribution)
- VLANs: DATA 10, SERVERS 20, MANAGEMENT 99, NATIVE 999
- Vollständige Config:
  - SW1: Access-Ports (VLAN 10, VLAN 20), Trunk Gi0/24 (native 999)
  - SW2: ip routing, SVI Vlan10/Vlan20/Vlan99, Trunk Gi0/24
- Verifikation: `show ip route`, `show interfaces trunk`, `show vlan brief`, `ping`
- 5 Fehler-Bullets
- Übungsaufgabe: "Füge VLAN 30 hinzu — welche Änderungen auf SW1, SW2 sind nötig?"
- Cross-Reference: STP-Modul ("Zwei Switches mit Trunk → STP wird hier relevant")

### Lab 12.3 — WLAN-VLAN (`vlan-lab-wlan`)

- Topologie: Laptop (Data VLAN) + Phone (Voice VLAN) → AP (SSID → VLAN Mapping) → Trunk → L3-Switch
- VLANs: DATA 10, VOICE 100, MANAGEMENT 99, NATIVE 999
- Vollständige Config: NUR Switch-Seite (AP-Config ist herstellerspezifisch)
  - L3-Switch: Trunk-Port zum AP (allowed VLANs 10,100,99; native 999), SVIs mit ip routing
- Wichtiger Hinweis: AP-SSID-zu-VLAN-Mapping ist Cisco-WLC-/Meraki-spezifisch → Cross-Reference Wireless-Modul
- Verifikation, 5 Fehler-Bullets
- Übungsaufgabe: "Füge ein Gäste-WLAN (VLAN 50) hinzu — was ändert sich auf dem Switch?"

---

## Quiz-Spezifikation

| Parameter | Wert |
|-----------|------|
| Export-Name | `QUIZ_VLAN_ADVANCED` |
| Quiz-ID | `"quiz-vlan-advanced"` |
| Anzahl Fragen | **25** (MINDEST-Anforderung) |
| Punkte pro Frage | 10 (single/true-false), 15 (multiple-choice) |
| Blueprint-Verteilung | 2.1 (≥15Q), 3.3 (≥6Q), 2.2 (≥2Q) |
| Typen-Mix | single-choice, multiple-choice, true-false |
| Schwierigkeit | 30% leicht / 50% mittel / 20% schwer |
| Lab-bezogene Fragen | **3–5 explizit auf Lab 12.2 und/oder 12.3 bezogen** |
| Pflicht-Explanation | Jede Frage muss `explanation` haben |
| Pflicht-Blueprint | Jede Frage muss `blueprint`-Tag haben |

---

## Diagramm-Anforderungen

| Diagramm | Format | Wo |
|----------|--------|----|
| 802.1Q Header (TPID/TCI/PCP/DEI/VID) | ASCII | `dot1q-tagging` |
| Frame Vorher/Nachher (ohne/mit Tag) | ASCII | `dot1q-tagging` |
| Push/Pop-Sequenz (Tag Add→Trunk→Remove) | ASCII | `dot1q-tagging` oder Lab 12.1 |
| Native VLAN auf Trunk (kein Tag) | ASCII | `dot1q-tagging` |
| Voice auf Access-Port (Data ungetaggt / Voice getaggt) | ASCII | `vlan-port-typen` |
| ROAS-Topologie | ASCII | `inter-vlan-routing` |
| L3-Switch SVI-Topologie | ASCII | `inter-vlan-routing` |
| Hopping-Path / Double-Tagging | Canvas-Template `tpl-edu-vlan-hopping` | `collaboration-engine.ts` |
| Lab 12.1 Topologie | ASCII in Concept | `vlan-lab-bruecke` |
| Lab 12.2 Topologie | ASCII in Concept | `vlan-lab-multi-switch` |
| Lab 12.3 Topologie | ASCII in Concept | `vlan-lab-wlan` |

---

## Simulator-Anforderungen

### Tab 1 (Phase 1a) — Frame-Vivisektor (bereits vorhanden)
- Bit-genaue TPID/PCP/DEI/VID-Visualisierung ✅
- Interaktive Felder zum Klicken ✅

### Tab 4 (Phase 1b) — Packet-Walk (neu implementiert)
- 6-Schritt Frame-Walk durch Trunk ✅
- Prev/Next-Navigation ✅
- Frame-Tag-Statusanzeige ✅

---

## Commit-Konvention

**1 Commit pro Punkt oder Themengruppe.** Beispiele:

```
feat(ccna): CONCEPT_VLAN_LAB_MULTI_SWITCH — Lab 12.2 Multi-Switch L3-Switch
feat(ccna): CONCEPT_VLAN_LAB_WLAN — Lab 12.3 WLAN-VLAN-Anbindung
feat(ccna): QUIZ_VLAN_ADVANCED auf 25 Fragen erweitert (3 Lab-bezogen)
feat(ccna): CONCEPT_VLAN_LAB_BRUECKE — Einleitung, Abschluss, Übungsaufgabe ergänzt
```

---

## Out-of-Scope (bewusst ausgeschlossen)

- Private VLANs (PVLAN) — CCNP-Thema
- Per-VLAN STP Details — STP-Modul
- EtherChannel / LACP — deepdive-roadmap.md Tier 2 (Blueprint 2.4)
- DAI / IP Source Guard — Security-Modul
- WLC / Meraki AP-Konfiguration — Wireless-Modul
- MLS / CEF / FIB — CCNP-Thema

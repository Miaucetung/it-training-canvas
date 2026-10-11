# Canvas v2 Roadmap & CCNA Routing-Konzept

Dieses Dokument beschreibt die Meilensteine des Canvas v2 (React 19 + SVG Next) mit besonderem Fokus auf das anstehende Routing- und OSPF-Modul sowie die Barrierefreiheits-Architektur (Schritt 2e).

---

## 1. Übersicht & Status der Meilensteine

| Meilenstein | Inhalt | Status |
| :--- | :--- | :--- |
| **Hotfix Mobile** | Flip-Button auf 390px, Toolbar-Drawer für Tools & Prüfung bis `< lg` | Abgeschlossen |
| **Phase 2a** | Schema-Entwurf (Zod, CCNA 2.0 Schema), Annotations-Ebene, verlustfreie Migration | Abgeschlossen |
| **Phase 2b** | SVG-Renderer, Status-Visualisierung (Farbe + Symbole), Interface-Labels, Legende | Abgeschlossen |
| **Phase 2c** | 4 CCNA-Referenztopologien, Cisco CLI Generator (L2/L3), Performance-Benchmark | Abgeschlossen |
| **Phase 2d-1** | Gerätepalette, Platzierung (Drag/Touch), Verbinden mit Port-Validierung, Undo/Redo | Abgeschlossen |
| **Phase 2d-2** | Annotations-Werkzeuge (Text, Freihand, Formen), Inline-Editor, Transform-Handles | Abgeschlossen |
| **Phase 2d-3** | Geräte-Konfiguration, Gateway-Validierung, EtherChannel-Modi & Konsistenz, Export/Import | Abgeschlossen |
| **Routing & OSPF** | Statische Routen, Default-Route, OSPF (Router-ID, Wildcards, Areas, Passive-IF) | **In Planung** (siehe Abschn. 2) |
| **Phase 2e** | Barrierefreiheit (WCAG AA): Tastaturnavigation, ARIA, Screenreader-Baum, axe-core | **In Umsetzung** (siehe Abschn. 3) |
| **Phase 2f** | Funktionsparitäts-Audit, Finale Freigabe, v2 als Standard | Ausstehend |

---

## 2. Detailliertes Konzept: Routing & OSPF (Schritt 2d-4)

### 2.1 Zielsetzung & Zielgruppe
Für angehende Fachinformatiker Systemintegration (CCNA 200-301) ist das Verständnis von Routing-Tabellen, Metriken, statischen Routen und dynamischem OSPF essenziell. Router und L3-Switche erhalten im Geräte-Konfigurationsdialog einen dedizierten Tab **„Routing & OSPF“**.

### 2.2 Statisches Routing (IPv4 & IPv6)
1. **Statische Standardrouten:**
   - Syntax: `ip route <prefix> <mask> <next-hop | exit-interface> [distance]`
   - Default-Route: `ip route 0.0.0.0 0.0.0.0 <next-hop>`
   - Administrative Distanz (AD): Default 1; Floating Static Routes konfigurierbar (z. B. AD 254).
2. **Validierung & Didaktische Hinweise:**
   - Next-Hop-Erreichbarkeit: Liegt die Next-Hop-IP in einem direkt verbundenen Subnetz des Routers?
   - Exit-Interface-Validierung: Rekursive Auflösung oder Warnung bei fehlerhaftem Interface.
   - Routen-Konflikte: Erkennung redundanter oder sich gegenseitig überschreibender Routen.

### 2.3 OSPFv2 Dynamisches Routing
1. **OSPF-Instanz:**
   - `router ospf <process-id>` (z. B. 1)
   - `router-id <A.B.C.D>`:
     - Explizit konfigurierbar
     - Cisco-Auswahlkaskade: 1. Manuelle Router-ID (`router-id X.X.X.X`) > 2. Höchste IPv4-Adresse eines aktiven Loopback-Interfaces > 3. Höchste IPv4-Adresse eines aktiven physischen Interfaces (Status up/up)
2. **Netzwerk-Ankündigung (Wildcard-Masken):**
   - Syntax: `network <network-ip> <wildcard-mask> area <area-id>`
   - Umrechnungshilfe & Validierung zwischen Subnetzmaske und Wildcard-Maske (z. B. `/24` $\rightarrow$ `0.0.0.255`, `/30` $\rightarrow$ `0.0.0.3`).
   - Mehrere Areas (Single Area 0 vs. Multi-Area mit ABR-Rolle).
3. **Schnittstellen-Parameter:**
   - `passive-interface <interface>`: Verhindert das Aussenden von OSPF-Hello-Paketen auf Endgeräte-LANs, nimmt das Subnetz jedoch in OSPF auf (CCNA Best Practice).
   - `ip ospf network point-to-point`: Unterdrückt DR/BDR-Wahl auf Point-to-Point Ethernet-Links; Nachbarschaftszustand wechselt sauber zu `FULL/-`.
   - `ip ospf cost <cost>`: Manuelle Link-Kosten-Beeinflussung.
4. **Cisco IOS CLI-Ausgaben:**
   - `show ip route`: Markierung statischer (`S`), direkt verbundener (`C`), lokaler (`L`) und OSPF (`O`, `O IA`) Routen mit Metriken `[110/cost]`.
   - `show ip ospf neighbor`: Nachbarschaftstabelle mit Neighbor ID, Pri, State (`FULL/DR`, `FULL/BDR`, `FULL/-`), Dead Time, Address, Interface.
   - `show ip ospf interface brief`: Übersicht der OSPF-aktiven Interfaces, Cost und State.
   - `show ip protocols`: Router-ID, OSPF-Prozess, angekündigte Netzwerke und passive Interfaces.

---

## 3. Konzept: Barrierefreiheit & Accessibility (Phase 2e)

Gemäß WCAG 2.1 Konformitätsstufe AA werden folgende Anforderungen umgesetzt:

1. **Tastaturnavigation im SVG-Canvas (Roving Tabindex):**
   - Genau ein Tab-Stopp für den gesamten Canvas-Bereich (`Tab` / `Shift+Tab` betritt bzw. verlässt den Canvas).
   - `Pfeiltasten` (Up/Down/Left/Right): Wechseln den Fokus zum nächsten Element in der jeweiligen geometrischen Richtung (Spatial Navigation / Roving Tabindex).
   - `Shift + Pfeiltasten`: Verschieben das aktuell fokussierte Gerät.
   - Pannen per Tastatur nur, wenn die leere Canvas-Fläche fokussiert ist (oder über dedizierte Tastenkombination).
   - `Enter` / `Leertaste`: Öffnet den Geräte-Konfigurationsdialog (Inspector).
   - `Context-Taste` / `Shift+F10`: Öffnet das Kontextmenü für das fokussierte Gerät.
   - `Entf` / `Backspace`: Löscht das fokussierte Element (mit Undo-Möglichkeit).
2. **Sichtbare Fokus-Indikatoren:**
   - 2px/3px Kontrastreicher Fokusring (WCAG AA konform: mindestens 3:1 Kontrast zum Hintergrund).
3. **ARIA-Labels mit dynamischem Live-Status:**
   - `aria-label="Router R1, Status Up, IP 192.168.1.1/24, 2 Verbindungen, 0 Warnungen"`
   - Links: `aria-label="Verbindung zwischen SW1 Gi0/1 und SW2 Gi0/1, Typ EtherChannel, Status Up"`
4. **Textalternative für Screenreader:**
   - Eine semantische HTML-Zusammenfassung (Liste/Tabelle) der Topologie mit allen Geräten, Ports und Links, die für Screenreader lesbar ist (`sr-only` oder umschaltbar).
5. **Dialog-Fokusfalle (Focus Trap) & Return-Focus:**
   - In allen Modaldialogen (Gerätekonfiguration, Port-Verbindung, Topologie-Speicher) wird der Tastaturfokus gefangen.
   - `Escape` schließt den Dialog.
   - Beim Schließen kehrt der Fokus exakt auf das zuvor ausgewählte Canvas-Element zurück.
6. **Automatisierte Überprüfung mit axe-core:**
   - E2E- und Unit-Prüfungen stellen sicher, dass keine Kontrast-, Rollen- oder ARIA-Verletzungen vorliegen.

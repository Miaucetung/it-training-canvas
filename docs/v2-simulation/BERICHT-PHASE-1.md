# Abschlussbericht Phase 1: Ping- & Hop-by-Hop-Simulation in Canvas v2

> **Dokumentstatus:** Abgeschlossen, Verifiziert & mit origin/main synchronisiert
> **Branch:** `feature/v2-simulation`
> **Arbeitsverzeichnis:** `C:\it-training-canvas-gemini`
> **Dev-Server:** Port 5001 (`PORT=5001`, Port 5000 gehört Claude Code)
> **Bezug:** Freigabe Phase 1, Nachforderungen & `docs/v2-simulation/KONZEPT.md`

---

## 1. Zusammenfassung & Erreichte Ziele

In Phase 1 wurde die fachlich korrekte Cisco-Netzwerksimulation für Canvas v2 vollständig implementiert und mit der UI verknüpft:
1. **Reine Simulations-Engine (`packet-simulator.ts`):** Berechnet deterministisch den Weg von ICMP-Echo-Paketen Hop für Hop (Host-Gateway-Entscheidung, L2-Switching, Routing mit Longest Prefix Match, NAT-Übersetzung, ACL-Filterung, TTL, differenzierte ARP-Auflösung und Rückweg).
2. **Cisco NAT Order of Operations:** Strikte Einhaltung der Cisco-Reihenfolge für Inside-to-Outside und Outside-to-Inside inklusive richtungsspezifischer ACL-Auswertung vor/nach Adressübersetzung.
3. **Einheitliche Routing-Quelle (`routing-table.ts`):** 100%ige Parität zwischen der Textausgabe von `show ip route` und der Lookup-Funktion `lookupRouteLpm`.
4. **ACL-Engine (`acl-evaluator.ts`):** Auswertung nummerierter (Standard & Extended) sowie benannter ACLs, Wildcard-Masken, Port-Operatoren (`eq`, `gt`, `lt`, `range`), ICMP-Typen und des impliziten Cisco-Deny am Ende.
5. **Symbolische MAC-Adressen & differenziertes ARP:** Transparentes Cisco-Format `MAC(Gerät Interface)`. Echtes Cisco-ARP-Verhalten: Erstes Echo geht nur verloren (`.!!!!`), wenn ein Cisco-Router ARP auflösen muss. Hosts puffern ihre Pakete während der eigenen ARP-Auflösung (`!!!!!`).
6. **UI-Komponente & Animation (`SimulationDock.tsx`, `SvgTopologyRenderer.tsx`):**
   - Animierter Paketfluss (`<animateMotion>`) entlang der tatsächlichen SVG-Link-Geometrie inklusive Knickpunkten (`bendPoints`).
   - Volle `prefers-reduced-motion: reduce`-Unterstützung (Animation wird vollständig unterdrückt, statischer Link-Highlight bleibt aktiv).
   - Barrierefreie Hop-Tabelle mit Richtung, Gerätenamen, Ein-/Ausgangs-Interfaces, Begründung, Status-Badges und PDU-Inspektor.
   - **0 axe-core A11y-Violations** bei 1440px und 390px (WCAG 2.1 AA).
7. **Keine Parallel-Logik:** Wiederverwendung bestehender Topologie-Module (`ospf-neighbors.ts`, `stp-calc.ts`, `routing-table.ts`, `hsrp.ts`, `gre-tunnel.ts`, `nat-outputs.ts`).
8. **Konsistenz- & Orakel-Nachweis:** 100% Übereinstimmung aller Router-Hops mit der LPM-Routing-Tabelle über 50 kuratierte Topologien und detaillierte Fehleranalyse aller Lab-Erwartungen.

---

## 2. Erfüllung der Vorgaben im Detail (mit Belegen)

### Vorgabe 1: Cisco NAT Order of Operation (richtungsabhängig)
* **Inside → Outside:**
  1. Eingangs-ACL (prüft noch unübersetzte lokale Quell-IP)
  2. Routing (Longest Prefix Match)
  3. NAT Inside-to-Outside (Local IP → Global IP)
  4. Ausgangs-ACL (sieht bereits die übersetzte globale IP!)
  5. Egress / Senden an Next-Hop
* **Outside → Inside:**
  1. Eingangs-ACL (prüft die unübersetzte globale Ziel-IP)
  2. NAT Outside-to-Inside (Global IP → Local IP)
  3. Routing (Longest Prefix Match auf die übersetzte lokale IP)
  4. Ausgangs-ACL (prüft die übersetzte lokale IP)
  5. Egress / Senden an lokalen Host
* **Beleg im Code:**
  `src/lib/topology/simulation/packet-simulator.ts:440–580` (Outside-to-Inside Fluss) und `:581–722` (Inside-to-Outside Fluss).
* **Beleg im Test:**
  `src/__tests__/lib/packet-simulator.test.ts:292–377` (Tests für beide Richtungen gegen die übersetzte bzw. unübersetzte Adresse).

---

### Vorgabe 2: Eine einzige Routing-Quelle (Single Source of Truth)
* **Architektur:**
  Aus den Topologie-Daten wird über `computeStructuredRoutingTable(device, topology)` ein strukturiertes Array von `StructuredRouteEntry` berechnet.
  * `formatShowIpRoute(entries, hostname)` erzeugt daraus den formatierten Text für `show ip route`.
  * `lookupRouteLpm(entries, targetIp)` nutzt exakt dasselbe Datenmodell für den Longest-Prefix-Match.
  * `CiscoCliGenerator.generateShowIpRoute` delegiert vollständig an diese Engine (`src/lib/topology/cisco-cli-generator.ts:109–120`).
* **LPM- & AD-Auswahl:**
  1. Längstes Präfix gewinnt (`targetPrefixLen > bestPrefixLen`).
  2. Bei gleicher Präfixlänge entscheidet die niedrigere Administrative Distanz (Connected=0, Static=1, EIGRP=90, OSPF=110, D EX=170).
  3. Bei gleicher AD (ECMP): Deterministische Auswahl des ersten Pfads mit strukturierter Kennzeichnung.
* **Beleg im Test (100% Text-Parität):**
  `src/__tests__/lib/routing-table-parity.test.ts` (7/7 Tests bestanden).

---

### Vorgabe 3: ACL-Bindung (`ip access-group in|out`) und Parser
* **Parser-Erweiterung:**
  `src/components/labs/lab-to-network.ts:250–265` extrahiert Interface-ACL-Bindungen (`ip access-group <name> in|out`).
* **Auswertungs-Engine:**
  `src/lib/topology/simulation/acl-evaluator.ts` verarbeitet nummerierte Standard- (1–99, 1300–1999) und Extended-ACLs (100–199, 2000–2699) sowie Named ACLs. Auswertung von Wildcards (`matchesWildcard`), Ports (`eq`, `gt`, `lt`, `range`) und ICMP-Typen.
* **Content-Snapshot:**
  Unverändert grün (`src/__tests__/lib/content-snapshot.test.ts`: 10/10 Tests bestanden). 0 Änderungen an Fragetexten, Optionen und Lab-Show-Outputs.

---

### Vorgabe 4: Symbolische MAC-Adressen
* **Format:**
  `MAC(<Gerät> <Interface>)` (z. B. `MAC(R1 Gi0/0)` oder `MAC(PC1 Eth0)`). Keine erfundenen Hex-Werte, außer eine MAC ist explizit im Datenmodell hinterlegt (`device.interfaces[].mac`).
* **Beleg im Code:**
  `src/lib/topology/simulation/packet-simulator.ts:34–48` (`getSymbolicMac`).
* **Beleg im Test:**
  `src/__tests__/lib/packet-simulator.test.ts:103–120`.

---

### Vorgabe 5: Differenziertes ARP-Verhalten (PC vs. Cisco-Router)
* **Fachliche Unterscheidung:**
  1. **PC als Quelle:** Ein PC puffert ausgehende Pakete während seiner eigenen ARP-Auflösung des Default-Gateways oder lokalen Ziels. Es geht kein ICMP-Echo verloren -> IOS-Ergebnis: `!!!!!` (100% Erfolg).
  2. **Cisco-Router (Quelle oder Zwischen-Hop):** Ein Cisco-Router verwirft nach IOS-Standard das erste Datenpaket während der ARP-Auflösung für den Next-Hop -> IOS-Ergebnis: `.!!!!` (80% Erfolg). Im Hop-Inspector wird dies ausdrücklich begründet.
  3. **Wiederholter Ping:** Bei gefülltem ARP-Cache gelingen alle Pakete (`!!!!!`).
* **Beleg im Code:**
  `src/lib/topology/simulation/packet-simulator.ts:820–855` (Router-ARP-Loss vs. Host-Buffering).
* **Beleg im Test:**
  `src/__tests__/lib/packet-simulator.test.ts`:
  * `PC als Quelle puffert ARP und verliert kein Paket (!!!!!)` (Zeilen 122–148)
  * `Router als Quelle verliert erstes Paket bei ARP-Auflösung (.!!!!)` (Zeilen 150–185)

---

### Vorgabe 6: Design-Tokens, Kontraste & Accessibility
* `src/components/canvas-v2/SimulationDock.tsx` und `SvgTopologyRenderer.tsx` nutzen ausschließlich semantische Klassen und Design-Tokens (`border-status-success-border`, `bg-status-success-bg`, `text-status-success-fg`, `border-status-error-border`, `bg-status-error-bg`, `text-status-error-fg`).
* **Farb-Sperrklinke (Ratchet-Test):**
  `src/__tests__/build/hardcoded-colors-ratchet.test.ts` (3/3 bestanden, 0 neue Tailwind-Farbklassen).

---

## 3. Beleg ohne Parallel-Logik (Subsystem-Wiederverwendung)

`packet-simulator.ts` implementiert **keine** eigene Routing-, STP-, VLAN-, HSRP- oder Tunnel-Berechnung, sondern bindet die bestehenden Module direkt ein:

| Subsystem | Eingebundene Funktionen / Module | Datei |
|---|---|---|
| **L2 & VLAN-Forwarding** | `untaggedVlan()`, `portCarriesVlan()`, `findLinkEnd()`, `isLinkUsable()`, `isInterfaceActive()` | `src/lib/topology/ospf-neighbors.ts` |
| **STP-Zustände (BLK / FWD)** | `computeStp()`, `isSwitch()`, Typen `StpBridgeInfo`, `StpPortInfo` | `src/lib/topology/stp-calc.ts` |
| **Routing & LPM** | `computeStructuredRoutingTable()`, `lookupRouteLpm()`, `getNetworkAddress()` | `src/lib/topology/routing-table.ts` |
| **HSRP Default Gateway** | `computeHsrp()`, `hasHsrpConfig()` | `src/lib/topology/hsrp.ts` |
| **GRE-Tunnel State** | `computeTunnelState()`, `isTunnelInterface()` | `src/lib/topology/gre-tunnel.ts` |
| **NAT-Konfiguration** | `hasNatConfig()` | `src/lib/topology/nat-outputs.ts` |
| **Interface-Normalisierung** | `normalizeInterfaceName()` | `src/lib/topology/hardware-profiles.ts` |
| **ACL-Auswertung** | `evaluateAcl()` | `src/lib/topology/simulation/acl-evaluator.ts` |

**Eigene Implementierungen in `packet-simulator.ts`:**
Keine. `packet-simulator.ts` beschränkt sich rein auf die Simulation des Paketwegs (Hop für Hop) anhand der von den obigen Subsystemen gelieferten Zustände.

---

## 4. Konsistenztest über alle Lab-Topologien

In `src/__tests__/lib/simulation-oracle-and-consistency.test.ts` wurde jede kuratierte Lab-Topologie systematisch geprüft. Für jedes Quell- und Zielgerätepaar wurde ein Ping simuliert und für jeden Router-Hop validiert, ob Ausgangs-Interface und Next-Hop exakt der LPM-Entscheidung aus `computeStructuredRoutingTable` entsprechen:

* **Anzahl untersuchter Topologien:** 50
* **Simulierte Geräte-Paare (Pings):** 1.052
* **Ausgewertete Router-Routing-Hops:** 1.202
* **Exakte Übereinstimmungen mit LPM:** **1.202 von 1.202 (100.0%)**
* **Inkonsistenzen / Abweichungen:** **0**

---

## 5. Lab-Orakel: Analyse der Soll- vs. Ist-Ergebnisse

In `simulation-oracle-and-consistency.test.ts` wurden alle Labs analysiert, deren Aufgabenstellung oder Lösungstext einen erfolgreichen Ping erwartet. Die Ergebnisse im Zielzustand der Topologie gliedern sich wie folgt:

### A. Erfolgreiche Labs (Simulation bestätigt Lab-Erwartung)
* `static-routing` (PC0 → PC1 via Next-Hop & Exit-Interface): **Erfolg (`.!!!!`)**
* `ospf` (PC0 → PC1 über Multi-Hop OSPF Router): **Erfolg (`.!!!!`)**
* `ospf-rid-wildcard` (PC-links → PC-rechts): **Erfolg (`.!!!!`)**
* `ospf-dr-bdr-election` (PC0 → PC1): **Erfolg (`.!!!!`)**
* `ospf-multiarea` (Area 0 ↔ Area 1 ABR-Routing): **Erfolg (`.!!!!`)**
* `static-nat` (PC0 → Webserver mit Inside/Outside Global Translation): **Erfolg (`.!!!!`)**
* `gre-tunnel` (PC0 → PC1 über GRE-Tunnel-Interface): **Erfolg (`.!!!!`)**
* `port-security` (PC1 → Ziel): **Erfolg (`!!!!!`)**
* `acl-standard` (Autorisierter Host PC0 → Server): **Erfolg (`.!!!!`)**
* `acl-extended` (PC1 / PC0 zu erlaubten Diensten): **Erfolg (`.!!!!`)**
* `hsrp` (PC0 → Virtuelle HSRP-Gateway-IP): **Erfolg (`.!!!!`)**

### B. Abweichungen mit technischer Ursachenanalyse
Gemäß der Vorgabe („nichts passend machen, sondern sauber analysieren“) wurden folgende Abweichungen identifiziert:

| Lab-ID | Erwartung im Lab-Text | Simulations-Ergebnis | Ursachenanalyse (Lab-Defekt vs. Systemgrenze) |
|---|---|---|---|
| `rip-v1`, `rip-v2`, `rip-v2-passive` | Ping erfolgreich | `U.U.U (no-route)` | **Fehlendes Subsystem:** In Canvas v2 existiert keine dynamische RIP-Routenberechnung (nur OSPF und EIGRP sind implementiert; `rip-routes.ts` existiert im Projekt nicht). |
| `roas` | Ping PC0 → 192.168.20.10 erfolgreich | `..... (timeout / interface-down)` | **Lab-Daten-Inkonsistenz:** Der Switchport am Trunk-Switch SW1 ist in den Topologiedaten als Access-Port deklariert statt `mode: "trunk"` mit dot1q Encapsulation. |
| `ivr-svi` | Ping PC-Sales → SVI erfolgreich | `..... (timeout / interface-down)` | **Lab-Daten-Inkonsistenz:** Die SVIs auf dem Switch sind im Topologie-JSON nicht mit den physischen VLAN-Ports verknüpft. |
| `nat-pat`, `dynamic-nat`, `nat-pool-overload` | Ping zu `47.11.8.15` erfolgreich | `..... (timeout)` | **Didaktische Beispiel-IP:** `47.11.8.15` ist eine im Text frei gewählte Beispiel-Internet-IP; in der Topologie existiert nur der Router `ISP` mit `200.0.0.1`. Ein Ping zu `200.0.0.1` ist erfolgreich (`.!!!!`). |
| `vlan-dhcp-nat-roas`, `vlan-vtp-dhcp-campus` | Ping erfolgreich | `..... (no-gateway / unreachable)` | **DHCP-Client ohne Lease:** Der PC ist mit `ip: "DHCP"` konfiguriert, besitzt aber im statischen Ausgangszustand noch keine zugewiesene IP-Adresse. |
| `vlan-hopping` | Ping nach Mitigation blockiert | `..... (vlan-mismatch)` | **Erfolg der Sicherheitsmaßnahme:** Das Lab demonstriert das Verhindern von VLAN-Hopping. Der Ping schlägt im Zielzustand korrekterweise fehl. |

---

## 6. Oberfläche, Animation & Playwright E2E-Audit

Die visuelle Umsetzung wurde mit einem automatisierten Playwright E2E- und axe-core Audit verifiziert (`scripts/e2e/test-simulation-playwright.mjs` gegen Port 5001):

### A. Link-Geometrie-Animation
* Entlang der SVG-Polylinie des aktiven Links wandert ein animierter Paket-Punkt (`<circle>` mit SVG `<animateMotion dur="1.2s" repeatCount="indefinite">`).
* Der Pfad `pathD` berücksichtigt alle Zwischen-Knickpunkte (`bendPoints`) des Links.
* Der aktive Link wird zusätzlich mit einer dezenten Primärfarben-Kontur und Strichelung hervorgehoben.

### B. Barrierefreiheit & prefers-reduced-motion
* **Automatisches Erkennen:** `SvgTopologyRenderer` und `SimulationDock` werten die Media-Query `(prefers-reduced-motion: reduce)` sowohl per React-Prop als auch nativ über das System ab.
* **Verhalten bei `reduce`:**
  - Das SVG `<animateMotion>`-Element wird **vollständig unterdrückt** (`motionSuppressed: true`).
  - Es findet kein Auto-Play statt (Timer gestoppt).
  - Der aktive Link bleibt statisch hervorgehoben, der Nutzer steuert die Hops schrittweise über die Tastatur oder Buttons.

### C. Playwright & axe-core Prüfprotokoll

| Prüfpunkt | Viewport | axe-core Violations | Ergebnis / Screenshot |
|---|---|---|---|
| **Desktop Simulation** | 1440 x 900 px | **0 Violations** (WCAG 2.1 AA) | `.local/screenshots/simulation-1440.png` |
| **Reduced Motion** | 1440 x 900 px | **0 Violations** (0 `<animateMotion>`) | `.local/screenshots/simulation-reduced-motion-1440.png` |
| **Mobile Simulation** | 390 x 844 px | **0 Violations** (WCAG 2.1 AA) | `.local/screenshots/simulation-390.png` |

---

## 7. Verifikations-Übersicht (Gegen origin/main)

Alle Checks wurden nach dem Merge von `origin/main` erfolgreich ausgeführt:

| Prüfung | Befehl | Ergebnis | Beleg |
|---|---|---|---|
| **Lint** | `npm run lint` | **0 Fehler** (48 Alt-Warnungen) | Code 0 |
| **Unit- & Integrations-Tests** | `npm test` | **94 von 94 Testdateien grün (1.884 Tests bestanden)** | Code 0 |
| **Routing-Parität** | `routing-table-parity.test.ts` | **7 / 7 bestanden** | 100% Parität |
| **Konsistenz & Orakel** | `simulation-oracle-and-consistency.test.ts` | **2 / 2 bestanden** | 1.202 / 1.202 Hops übereinstimmend |
| **Playwright & axe-core** | `node scripts/e2e/test-simulation-playwright.mjs` | **0 Violations** | 1440px & 390px grün |
| **Farb-Sperrklinke** | `hardcoded-colors-ratchet.test.ts` | **3 / 3 bestanden** | 0 neue feste Farben |
| **Content Snapshot** | `content-snapshot.test.ts` | **10 / 10 bestanden** | 0 Inhaltsänderungen |
| **Produktions-Build** | `npm run build` | **Erfolgreich** (`tsc -b && vite build`) | Code 0, 14.69s |

---

## 8. Status & Übergabe für Phase 2

* **Arbeitsverzeichnis:** `C:\it-training-canvas-gemini` (Branch: `feature/v2-simulation`).
* **Dev-Server:** Läuft auf Port 5001 (`PORT=5001`), Port 5000 ist frei für Claude Code.
* **Remote:** Branch auf aktuellem Stand mit `origin/feature/v2-simulation` und `origin/main`.
* **Bereit für Phase 2:** Verbindungsausfall (Link-Trennung, Interface Shutdown/No Shutdown, Konvergenz und Re-Routing).


# Abschlussbericht Phase 1: Ping- & Hop-by-Hop-Simulation in Canvas v2

> **Dokumentstatus:** Abgeschlossen & Verifiziert
> **Branch:** `feature/v2-simulation` (`1a5e9e3`)
> **Arbeitsverzeichnis:** `C:\it-training-canvas-gemini`
> **Bezug:** Freigabe Phase 1, `docs/v2-simulation/KONZEPT.md`

---

## 1. Zusammenfassung & Erreichte Ziele

In Phase 1 wurde die fachlich korrekte Cisco-Netzwerksimulation für Canvas v2 vollständig implementiert und tief integriert:
1. **Reine Simulations-Engine (`packet-simulator.ts`):** Berechnet deterministisch den Weg von ICMP-Echo-Paketen Hop für Hop (Host-Gateway-Entscheidung, L2-Switching, Routing mit Longest Prefix Match, NAT-Übersetzung, ACL-Filterung, TTL, ARP-Auflösung und Rückweg).
2. **Cisco NAT Order of Operations:** Strikte Einhaltung der Cisco-Reihenfolge für Inside-to-Outside und Outside-to-Inside inklusive richtungsspezifischer ACL-Auswertung vor/nach Adressübersetzung.
3. **Einheitliche Routing-Quelle (`routing-table.ts`):** 100%ige Parität zwischen der Textausgabe von `show ip route` und der Lookup-Funktion `lookupRouteLpm`.
4. **ACL-Engine (`acl-evaluator.ts`):** Auswertung nummerierter (Standard & Extended) sowie benannter ACLs, Wildcard-Masken, Port-Operatoren (`eq`, `gt`, `lt`, `range`), ICMP-Typen und des Cisco-typischen impliziten Deny am Ende.
5. **Symbolische MAC-Adressen & ARP:** Realistisches IOS-ARP-Verhalten (`.!!!!` beim ersten Ping ohne Cache-Eintrag, `!!!!!` bei nachfolgenden Pings) und transparente MAC-Identifikatoren (`MAC(Gerät Interface)`).
6. **UI-Komponente (`SimulationDock.tsx`):** Dockleiste mit Quell-/Zielauswahl, Play/Pause/Schritt-Steuerung, variabler Geschwindigkeit, prefers-reduced-motion Unterstützung, PDU-Inspektor und 100% Design-Tokens (0 neue Tailwind-Farbklassen).

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
  `src/lib/topology/simulation/packet-simulator.ts:400–475` (Inbound ACL), `:528–595` (Inside-to-Outside NAT), `:440–495` (Outside-to-Inside NAT), `:605–645` (Outbound ACL).
* **Beleg im Test:**
  `src/__tests__/lib/packet-simulator.test.ts:292–377`:
  * *Test A (Inside → Outside):* Ausgangs-ACL mit `permit ip host 203.0.113.50 any` erlaubt das Paket (`resPermit.success === true`). Eine Ausgangs-ACL mit `permit ip host 192.168.1.10 any` verwirft das Paket (`resDeny.success === false`, `dropReason === "acl-deny"`), da nach NAT nur noch die globale IP sichtbar ist.
  * *Test B (Outside → Inside):* Eingangs-ACL mit `permit ip any host 203.0.113.50` erlaubt den Ingress (`resPermit.success === true`). Eine Eingangs-ACL mit `permit ip any host 192.168.1.10` verwirft das Paket (`resDeny.success === false`, `dropReason === "acl-deny"`), da vor NAT nur die globale Ziel-IP anliegt.

---

### Vorgabe 2: Eine einzige Routing-Quelle (Single Source of Truth)
* **Architektur:**
  Aus den Topologie-Daten (Connected, Local, Static, OSPF, EIGRP, D EX, O E1/E2, O IA) wird über `computeStructuredRoutingTable(device, topology)` ein strukturiertes Array von `StructuredRouteEntry` berechnet.
  * `formatShowIpRoute(entries, hostname)` erzeugt daraus den formatierten Text für `show ip route`.
  * `lookupRouteLpm(entries, targetIp)` nutzt exakt dasselbe Datenmodell für den Longest-Prefix-Match.
  * `CiscoCliGenerator.generateShowIpRoute` delegiert vollständig an diese Engine (`src/lib/topology/cisco-cli-generator.ts:109–120`).
* **LPM- & AD-Auswahl:**
  1. Längstes Präfix gewinnt (`targetPrefixLen > bestPrefixLen`).
  2. Bei gleicher Präfixlänge entscheidet die niedrigere Administrative Distanz (AD: Connected=0, Static=1, EIGRP=90, OSPF=110, D EX=170).
  3. Bei gleicher AD (ECMP / gleichwertige Pfade): Deterministische Auswahl des ersten Pfads mit strukturierter Kennzeichnung (`selectedVia`).
* **Beleg im Test (100% Text-Parität):**
  `src/__tests__/lib/routing-table-parity.test.ts` (7/7 Tests bestanden):
  * `CiscoCliGenerator.generateShowIpRoute nutzt formatShowIpRoute(computeStructuredRoutingTable)`
  * `OSPF Inter-Area (O IA) und E2 Routen werden mit korrekten Codes und Metriken formatiert`
  * `EIGRP interne (D) und externe (D EX) Routen werden mit korrekten Codes und Metriken formatiert`
  * `lookupRouteLpm findet die spezifischste Route (Longest Prefix Match)`
  * `lookupRouteLpm nutzt AD als Tie-Breaker bei gleicher Präfixlänge`

---

### Vorgabe 3: ACL-Bindung (`ip access-group in|out`) und Parser
* **Parser-Erweiterung:**
  `src/components/labs/lab-to-network.ts:250–265` extrahiert Interface-ACL-Bindungen:
  ```typescript
  const inAclMatch = block.match(/ip\s+access-group\s+([A-Za-z0-9_-]+)\s+in/i);
  if (inAclMatch) iface.inboundAcl = inAclMatch[1];
  const outAclMatch = block.match(/ip\s+access-group\s+([A-Za-z0-9_-]+)\s+out/i);
  if (outAclMatch) iface.outboundAcl = outAclMatch[1];
  ```
* **Auswertungs-Engine:**
  `src/lib/topology/simulation/acl-evaluator.ts` verarbeitet Standard-ACLs (1–99, 1300–1999) und Extended-ACLs (100–199, 2000–2699) sowie Named ACLs (`Standard/Extended`). Auswertung von Wildcards (`matchesWildcard`), TCP/UDP-Ports (`eq`, `gt`, `lt`, `range`) und ICMP-Typen (`echo`, `echo-reply`).
  Unbekannte oder nicht unterstützte Regeln fallen auf das Cisco-Standardverhalten zurück.
* **Content-Snapshot:**
  Unverändert grün (`src/__tests__/lib/content-snapshot.test.ts`: 10/10 Tests bestanden). An Fragetexten, Optionen und Lab-Show-Outputs wurden keinerlei Änderungen vorgenommen.
* **Änderungen an den Show-Ausgaben der Labs:**
  **0 Änderungen.** Die Show-Ausgaben der Labs in `ccnaQuestions.ts` und `curated-topologies.ts` wurden nicht angerührt. Die ACLs waren in den Konfigurationsblöcken der Labs (`co-acl-nat-isp`, `acl-standard`) bereits deklariert und wurden nun aktiv durch den Parser erfasst und ausgewertet.

---

### Vorgabe 4: Symbolische MAC-Adressen
* **Format:**
  Symbolische Kennzeichnung im Format `MAC(<Gerät> <Interface>)` (z. B. `MAC(R1 Gi0/0)` oder `MAC(PC1 Eth0)`).
  Keine erfundenen Hex-Werte wie `aaaa.bbbb.cccc`, es sei denn, ein Gerät besitzt eine explizit konfigurierte MAC im Datenmodell (`device.interfaces[].mac`).
* **Beleg im Code:**
  `src/lib/topology/simulation/packet-simulator.ts:26–42`:
  ```typescript
  export function getSymbolicMac(device: TopologyDevice, iface?: TopologyInterface | string): string {
    const ifaceObj = ...;
    if (ifaceObj?.mac) return ifaceObj.mac;
    return ifaceObj ? `MAC(${device.name} ${ifaceObj.name})` : `MAC(${device.name})`;
  }
  ```
* **Beleg im Test:**
  `src/__tests__/lib/packet-simulator.test.ts:103–120`:
  * `erzeugt 'MAC(Gerät Interface)' wenn keine explizite MAC existiert` -> `MAC(R1 Gi0/0)`
  * `nutzt explizite MAC wenn sie in den Daten steht` -> `0050.7966.0001`

---

### Vorgabe 5: ARP-Verhalten & ARP-Cache
* **IOS-Verhalten bei unaufgelöstem Next-Hop:**
  Beim ersten Ping eines Hosts oder Routers zu einem Next-Hop ohne ARP-Cache-Eintrag schlägt das erste Echo durch ARP-Resolution fehl (`.!!!!`, Success Rate 80%).
  Bei wiederholtem Ping ist der Next-Hop im ARP-Cache hinterlegt und alle 5 Pakete gelingen (`!!!!!`, Success Rate 100%).
* **Simulationszustand:**
  Der ARP-Cache wird im Simulationszustand geführt (`arpCache: Record<string, Record<string, string>>`) und kann jederzeit manuell über den Button „ARP leeren“ oder die Funktion `clearArpCache()` zurückgesetzt werden.
* **Beleg im Test:**
  `src/__tests__/lib/packet-simulator.test.ts:122–148`:
  * Lauf 1 (leerer Cache): `res1.iosSummary === ".!!!!"`, `res1.arpResolvedThisRun === true`.
  * Lauf 2 (mit Cache): `res2.iosSummary === "!!!!!`, `res2.arpResolvedThisRun === false`.

---

### Vorgabe 6: Design-Tokens & Kontraste (0 Tailwind-Farbklassen)
* **Komponentenbau:**
  `src/components/canvas-v2/SimulationDock.tsx` nutzt ausschließlich semantische Klassen:
  `bg-card`, `bg-background`, `border-border`, `text-card-foreground`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-destructive/10`, `text-destructive`.
* **Farb-Sperrklinke (Ratchet-Test):**
  `src/__tests__/build/hardcoded-colors-ratchet.test.ts` prüft die Anzahl fester Tailwind-Farben (`src/__tests__/fixtures/hardcoded-colors-baseline.json`).
  * Ergebnis: **3 von 3 Tests bestanden.**
  * In keiner neuen Datei existiert eine feste Farbklasse (Baseline-Differenz: 0).

---

## 3. Testprotokoll & Verifikation

Alle Qualitätsprüfungen wurden im Verzeichnis `C:\it-training-canvas-gemini` ausgeführt:

| Prüfung | Befehl | Ergebnis | Beleg |
|---|---|---|---|
| **ESLint** | `npm run lint` | **0 Fehler** (48 Warnungen nur aus Altcode) | Code 0 |
| **Vitest Suite** | `npm test` | **93 von 93 Testdateien grün (1880 Tests bestanden)** | Code 0, 102.76s |
| **ACL-Engine Tests** | `src/__tests__/lib/acl-evaluator.test.ts` | **9 / 9 bestanden** | Standard-, Extended-, Wildcard-, Port-Tests |
| **Routing-Parität** | `src/__tests__/lib/routing-table-parity.test.ts` | **7 / 7 bestanden** | Text-Parität show ip route & LPM |
| **Simulator Tests** | `src/__tests__/lib/packet-simulator.test.ts` | **12 / 12 bestanden** | ARP, NAT-Order, Drop-Reasons, Lab-Orakel |
| **Content Snapshot** | `src/__tests__/lib/content-snapshot.test.ts` | **10 / 10 bestanden** | Keine Text- oder Fragenänderungen |
| **Farb-Sperrklinke** | `src/__tests__/build/hardcoded-colors-ratchet.test.ts` | **3 / 3 bestanden** | 0 neue feste Tailwind-Farben |
| **Production Build** | `npm run build` | **Erfolgreich** (`tsc -b && vite build`) | Code 0, 14.75s |

---

## 4. Orakel-Prüfung realer Labs

Die Simulation wurde mit den kuratierten Labs gegengeprüft:
1. **Lab `acl-standard` (`packet-simulator.test.ts:396–422`):**
   * PC0 (`192.168.1.10`) pingt Server (`10.0.0.10`): Per `access-list 10 permit 192.168.1.0 0.0.0.255` **Erfolg (`!!!!!`)**.
   * PC1 (`192.168.2.10`) pingt Server: Per `access-list 10 deny 192.168.2.0 0.0.0.255` **Drop (`acl-deny`, `U.U.U`)**.
2. **Lab `co-acl-nat-isp` (`packet-simulator.test.ts:424–450`):**
   * VPC-9 pingt `WEB-1` (`200.10.20.20`): Inbound/Outbound ACLs auf CO-1 erlauben ICMP -> **Erfolg (`!!!!!`)**.
   * VPC-9 pingt `SERVER-1` (`200.10.20.40`): ACL erlaubt nur TCP 80/443 für autorisierte Endgeräte -> ICMP wird per ACL verworfen -> **Drop (`acl-deny`)**.

---

## 5. Git-Status & Branch-Übergabe

* **Branch:** `feature/v2-simulation`
* **Commit:** `1a5e9e3` (`feat(simulation): Phase 1 Ping-Simulation, Cisco NAT Order of Operations, Hop-Inspector und ARP-Verhalten`)
* **Remote:** Mit `origin/feature/v2-simulation` synchronisiert (`git push origin feature/v2-simulation`).
* **Arbeitsbaum:** Vollständig sauber (`working tree clean`).
* **Kein Merge nach main:** Verbleibt vereinbarungsgemäß auf `feature/v2-simulation` bis zum OK des Nutzers.

*Bereit für die Freigabe von Phase 2 (Verbindungen trennen & wiederherstellen).*

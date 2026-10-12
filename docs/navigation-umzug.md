# Spickzettel für Tester: Navigation-Umzug (Phase R3 Schritt 1)

Dieser Spickzettel dokumentiert die neue Navigationsstruktur der CCNA-App nach der Umstrukturierung in Phase R3 Schritt 1.

---

## 1. Schnelle Referenztabelle: „Früher im Header → Jetzt unter ...“

| Früherer Header-Button | Neuer Ort in Navigation (R3) | Menü-Kategorie / Pfad | Verhalten in Lektion | Kompatibilität Canvas |
| :--- | :--- | :--- | :--- | :--- |
| **Lernpfade** | `Lernen` → *Lernpfade* | Menü *Lernen* | Modal / Liste öffnet direkt | Beide (v1 & v2) |
| **Themenübersicht** (Home) | `Lernen` → *Themenübersicht & Module* | Menü *Lernen* | Navigation zur Modulübersicht | Beide (v1 & v2) |
| **Mein Lernfortschritt** | `Lernen` → *Mein Lernfortschritt* | Menü *Lernen* | Öffnet Account/Fortschritt | Beide (v1 & v2) |
| **Prüfungsfragen-Trainer** | `Üben & Prüfen` → *Prüfungsfragen-Trainer* | Menü *Üben & Prüfen* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Drag-&-Drop** | `Üben & Prüfen` → *Drag-and-Drop-Trainer* | Menü *Üben & Prüfen* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Priorisiert lernen** | `Üben & Prüfen` → *Priorisiertes Lernen (Blueprint)* | Menü *Üben & Prüfen* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Schwächen-Drill** | `Üben & Prüfen` → *Gezielter Schwächen-Drill* | Menü *Üben & Prüfen* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **802.1Q VLAN- & Trunk-Vivisektor** | `Simulatoren` → *VLAN- und Trunk-Simulator* | Menü *Simulatoren* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Spanning Tree (STP & RSTP)** | `Simulatoren` → *Spanning-Tree-Simulator (STP/RSTP)* | Menü *Simulatoren* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **OSI- & TCP/IP-Encapsulation** | `Simulatoren` → *OSI- und TCP/IP-Simulator* | Menü *Simulatoren* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Dynamisches Routing & OSPF** | `Simulatoren` → *Routing- und OSPF-Simulator* | Menü *Simulatoren* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Ping testen** | `Simulatoren` → *Geführter Ping-Test* | Menü *Simulatoren* | Automatischer Flip zum Canvas | Nur v1 (in v2 mit Hinweis-Badge) |
| **Paketfluss** | `Simulatoren` → *Paketfluss-Visualisierer (Canvas v2)* | Menü *Simulatoren* | HUD-Toggle über Canvas | Nur v2 (in Entwicklung) |
| **Simulation** | `Simulatoren` → *Topologie-Simulation (HUD)* | Menü *Simulatoren* | Automatischer Flip zum Canvas | Nur v1 (in v2 mit Hinweis-Badge) |
| **Subnetting-Drill** | `Werkzeuge` → *Subnetting-Drill (Schnellrechnen)* | Spalte *Subnetting & Rechner* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Subnetting-Quiz** | `Werkzeuge` → *Subnetting-Quiz (Fragen)* | Spalte *Subnetting & Rechner* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Subnetting-Cheatsheet** | `Werkzeuge` → *Subnetting-Übersicht & Rechner* | Spalte *Subnetting & Rechner* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **IPv4-Subnetting-Referenz** | `Werkzeuge` → *IPv4-Subnetz-Tabelle* | Spalte *Subnetting & Rechner* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **IPv6-Calculator** | `Werkzeuge` → *IPv6-Präfix- & EUI-64-Rechner* | Spalte *Subnetting & Rechner* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Routing-Endlos-Lab** | `Werkzeuge` → *Routing-Trainer (ip route)* | Spalte *Drills & Labs* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **OSPF- & Wildcard-Drill** | `Werkzeuge` → *OSPF- und Wildcard-Trainer* | Spalte *Drills & Labs* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **ACL-Drill** | `Werkzeuge` → *Access-List-Trainer (ACL)* | Spalte *Drills & Labs* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Cisco IOS CLI-Glossar** | `Werkzeuge` → *Cisco-IOS-Befehlsreferenz* | Spalte *Praxis & Terminal* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **CLI (Terminal)** | `Werkzeuge` → *Cisco-IOS-Terminal (Konsole)* | Spalte *Praxis & Terminal* | Automatischer Flip zum Canvas | Beide (v1 & v2) |
| **Labs** | `Werkzeuge` → *Geführte Praxis-Labs* | Spalte *Praxis & Terminal* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Verkabelungs-Trainer** | `Werkzeuge` → *Verkabelungs-Trainer (Kabel & Ports)* | Spalte *Praxis & Terminal* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Kosten-Rechner** | `Werkzeuge` → *Cloud-Kosten-Rechner* | Spalte *Praxis & Terminal* | Modal öffnet direkt (nur Azure/AWS) | Beide (v1 & v2) |
| **Gerät (+ Gerät)** | `Werkzeuge` → *Gerät hinzufügen* | Spalte *Canvas & Zusammenarbeit* | Automatischer Flip zum Canvas | Nur v1 (in v2: Sidebar-Palette) |
| **Prüfen (Validator)** | `Werkzeuge` → *Topologie-Diagnose* | Spalte *Canvas & Zusammenarbeit* | Automatischer Flip zum Canvas | Nur v1 (in v2: Toolbar-Diagnose) |
| **Topologie-Explorer** | `Werkzeuge` → *Topologie-Explorer (Referenznetze)* | Spalte *Canvas & Zusammenarbeit* | Modal öffnet direkt über Lektion | Beide (v1 & v2) |
| **Metriken** | `Werkzeuge` → *Live-Metriken* | Spalte *Canvas & Zusammenarbeit* | Automatischer Flip zum Canvas | Nur v1 (in v2 mit Hinweis-Badge) |
| **Notizen** | `Werkzeuge` → *Topologie-Notizen* | Spalte *Canvas & Zusammenarbeit* | Automatischer Flip zum Canvas | Nur v1 (in v2 mit Hinweis-Badge) |
| **Vorlagen** | `Werkzeuge` → *Topologie-Vorlagen* | Spalte *Canvas & Zusammenarbeit* | Automatischer Flip zum Canvas | Nur v1 (in v2: Toolbar-Speicher) |
| **Teilen & Export** | `Werkzeuge` → *Teilen und Exportieren* | Spalte *Canvas & Zusammenarbeit* | Modal öffnet direkt über Lektion | Nur v1 (in v2: Toolbar-Export) |
| **Tastenkürzel & Hilfe (?)** | `Header rechts` → Keyboard-Icon (`?`) | Direkter Header-Button | Modal öffnet direkt | Beide (v1 & v2) |
| **Theme-Schalter** | `Header rechts` → Segmentschalter (*System*, *Hell*, *Dunkel*) | Direkter Header-Schalter | Wechselt Theme sofort | Global |
| **Canvas 3D-Flip** | `Header rechts` → Flip-Schalter (*Lernen* ↔ *Canvas*) | Direkter Header-Schalter | Dreht Oberfläche 180° um | Global |

---

## 2. Fachbezogenes Menü-Scoping

Nicht jedes Fach benötigt alle Werkzeuge. Die Menüs passen sich automatisch an das aktuell gewählte Fach an:

| Fach / Zertifizierung | Sichtbare Simulatoren & Drills | Spezial-Werkzeuge | Ausgeblendete Menüpunkte |
| :--- | :--- | :--- | :--- |
| **CCNA 200-301** | VLAN, STP, OSI, Routing, Ping, HUD, Subnetting, OSPF, ACL, Routing-Trainer, Verkabelung, Labs | Cisco-IOS-Terminal, CLI-Referenz, Praxis-Labs | Cloud-Kosten-Rechner |
| **FISI** (Fachinformatiker) | VLAN, STP, OSI, Routing, Ping, HUD, Subnetting, OSPF, ACL, Routing-Trainer, Verkabelung, Labs | Cisco-IOS-Terminal, CLI-Referenz, Praxis-Labs | Cloud-Kosten-Rechner |
| **Networking** (Network+) | VLAN, STP, OSI, Routing, Ping, HUD, Subnetting, Routing-Trainer, Verkabelung | Topologie-Explorer, Verkabelungs-Trainer | Cisco-spezifische Drills (OSPF/ACL), Kosten-Rechner |
| **Microsoft Azure** | Allgemeine Cloud-Themen & Lernpfade | **Cloud-Kosten-Rechner** | Cisco-Terminal, VLAN/STP, OSPF-Drill, ACL-Drill |
| **Amazon AWS** | Allgemeine Cloud-Themen & Lernpfade | **Cloud-Kosten-Rechner** | Cisco-Terminal, VLAN/STP, OSPF-Drill, ACL-Drill |
| **IT Security** | OSI-Simulator, ACL-Drill, Subnetting | Topologie-Explorer | VLAN/STP, Cloud-Kosten-Rechner |
| **Linux / Docker / K8s** | Systembezogene Themen & Pfade | Dashboard & Lernfortschritt | Netzwerk-Switches & Cisco-CLI |

---

## 3. Responsive Breakpoints & Mobile Drawer

- **Desktop (≥ 1280px / Tailwind `xl`):**
  - Alle 4 logischen Navigationsgruppen (`Lernen`, `Üben & Prüfen`, `Simulatoren`, `Werkzeuge`) sind direkt im Header als Dropdowns platziert.
  - Streng einzeilig ohne Überlauf, ohne Zeilenumbruch und ohne unbeschriftete kryptische Icon-Reihen.
- **Tablets & Mobile (< 1280px / z. B. 1024px iPad, 768px, 390px Smartphone):**
  - Schaltet automatisch auf den aufgeräumten Drawer um: Die Schaltfläche **`Menü`** (mit Listen-Icon und Beschriftung) öffnet einen seitlichen Drawer.
  - Der Drawer bietet alle 4 Gruppen in vertikaler, touch-optimierter Struktur mit mindestens 44px Tipphöhe pro Element.
  - Der 3D-Flip-Button (*Lernen* ↔ *Canvas*), der Theme-Schalter und der Fach-Umschalter bleiben auch auf Mobilgeräten direkt und einzeilig im Header zugänglich.

---

## 4. Canvas-Versionierung (v1 vs. v2) und Hinweise

- **Brotkrumen-Navigation (Breadcrumb):**
  - Im Canvas-Modus zeigt der Brotkrumenpfad explizit die aktive Version an:
    `[Fach] › Topologie-Canvas (v1)` bzw. `[Fach] › Topologie-Canvas (v2)`.
  - Ausgezeichnet als semantisches `<nav aria-label="Brotkrumen">` mit `aria-current="page"` auf dem aktiven Element, vollständig tastaturbedienbar (`Tab`, `Enter`, `Leertaste`).
- **Verhalten bei v1-spezifischen Werkzeugen in Canvas v2:**
  - Werkzeuge, die ausschließlich auf die Datenstrukturen von Canvas v1 ausgelegt sind (z. B. *Gerät hinzufügen*, *Topologie-Diagnose*, *Live-Metriken*, *Topologie-Notizen*, *Topologie-Vorlagen*, *Teilen und Exportieren*, *Geführter Ping-Test*, *Simulation-HUD*), werden bei aktiver Canvas-v2-Engine nicht stillschweigend wirkungslos geschaltet.
  - Sie tragen einen sichtbaren Badge **`Nur v1`** und eine leicht gedimmte Optik (`opacity-60 cursor-not-allowed`).
  - Ein Klick löst eine informative Benachrichtigung (Toast) aus, die erklärt, warum das Werkzeug in v2 separat gelöst ist bzw. dass dafür auf v1 umgeschaltet werden kann.

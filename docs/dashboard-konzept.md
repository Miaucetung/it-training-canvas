# Konzept: CCNA 200-301 Dashboard als zentrale Fach-Startseite (Phase R3 Schritt 1b)

Dieses Dokument definiert das Architektur-, UX- und Fachkonzept für die Neugestaltung des Dashboards als dedizierte CCNA-200-301-Startseite.

---

## 1. Leitbild, Zielgruppen & Design-Philosophie

### 1.1 Leitbild: Professionelles Engineering-Werkzeug
Wer die Plattform öffnet, erkennt innerhalb von Sekunden: **Hier arbeitet ein vollwertiges, präzises Fachwerkzeug für die Cisco-Zertifizierung CCNA 200-301.**
- **Keine Gamification:** Keine Abzeichen, Streaks, Erfahrungspunkte, Level-Ups, Konfetti-Animationen, Maskottchen, Emojis oder cheerleading Slogans.
- **Keine Cyber- oder Gaming-Optik:** Kein Neon-Glow, keine willkürlichen Farbverläufe, keine Partikeleffekte, keine Dauerschleifen-Animationen.
- **Leitlinie für Interaktivität:** Jede Interaktion muss etwas **zeigen**, **erklären** oder **beschleunigen**. Keine Interaktion dient der reinen Unterhaltung.
- **Typografie & Zahlen:** IBM Plex Sans für Fließtexte, IBM Plex Mono für Befehle, IP-Adressen, Masken und Konfigurationen. Alle Metriken, Zähler und Tabellenwerte nutzen `tabular-nums` für zitterfreie Lesbarkeit.

### 1.2 Die drei Nutzergruppen (ohne Modus-Auswahl)
Die Oberfläche bedient drei Anforderungsprofile gleichzeitig durch das Prinzip: **„Einfach auf den ersten Blick, Tiefe auf Klick“**:

1. **Lernende (Umschüler FISI & Azubis):**
   - Eindeutiger nächster Schritt über den prominenten Haupt-CTA (`Weiterlernen` bzw. `Jetzt starten`).
   - Klarer Überblick über den Stand in den 6 offiziellen Cisco-Blueprint-Bereichen.
   - Schneller Einstieg in Schwächen-Drills und praxisnahe Drag-and-Drop-Szenarien.
2. **Dozenten & Ausbilder:**
   - **Präsentationsmodus für Beamer:** Größere Schrift (+20 %), maximierter Kontrast, ablenkungsfreie Ansicht ohne Navigationselemente.
   - Schneller Aufruf von interaktiven Topologien und CLI-Ausgaben für den Unterricht.
   - Teilen von Topologien per Direktlink oder JSON-Export.
3. **Erfahrene Netzwerker & Prüfungskandidaten kurz vor dem Examen:**
   - **Befehlspalette (`Strg+K` / `Cmd+K`):** Blitzschnelle Tastatursuche über alle 1.055 Fragen, CLI-Befehle, Simulatoren und Themen.
   - **Direktzugriff auf Referenzen:** Subnetting-Tabelle, Wildcard-Masken, Portnummern, Administrative Distanzen mit einem Tastendruck.
   - **Inline-Subnetz-Schnellrechner:** Netz-, Broadcast- und Hostberechnung direkt auf dem Dashboard ohne Dialog-Wechsel.

---

## 2. Layout-Skizzen (ASCII-Mockups)

### 2.1 Desktop-Ansicht (1440px)

```text
+------------------------------------------------------------------------------------------------------------------------+
| [Header] CCNA 200-301  |  Lernen v  |  Üben & Prüfen v  |  Simulatoren v  |  Werkzeuge v  |  [Suche Strg+K]  [Lernen|Canvas]|
+------------------------------------------------------------------------------------------------------------------------+
|                                                                                                                        |
|  +-- HERO SECTION ---------------------------------------------------------------------------------------------------+ |
|  | [CCNA 200-301]                                         |  +-- INTERAKTIVE V2-TOPOLOGIE -------------------------+  | |
|  | Die strukturierte Fachplattform zur Cisco-Zertifizierung|  |  [PC1] .50  --- (VLAN 10) --- [SW1]                 |  | |
|  | 1.055 Fragen * 81 Drag-and-Drop-Labs * 5 Simulatoren   |  |                   |            | Trunk (802.1Q)        |  | |
|  |                                                        |  |  [Server] .10 --+          [R1 Gateway] .1          |  | |
|  | [ Weiterlernen: OSPFv2 Single-Area -> ]                |  |                             | (Gi0/0)               |  | |
|  | Zuletzt: Lektion 14 vor 2 Std. * 78 % Trefferquote     |  |  [Hover: Details]  [Ping zeigen (PC1 -> S1)]       |  | |
|  +--------------------------------------------------------+  +-----------------------------------------------------+  | |
|                                                                                                                        |
|  +-- PRÜFUNGSBEREITSCHAFT & COUNTDOWN -------------------------------------------------------------------------------+ |
|  | PRÜFUNGSBEREITSCHAFT: 64 % [============--------]  (Berechnung: gewichtete Blueprint-Genauigkeit x Fragenabdeckung) | |
|  | Prüfungstermin: 15. November 2026 (noch 34 Tage)  |  Empfohlener Fokus: IP Connectivity & Network Access           | |
|  | [v Aufschlüsselung anzeigen: Warum 64 %?]                                                                         | |
|  +-------------------------------------------------------------------------------------------------------------------+ |
|                                                                                                                        |
|  +-- DIE 6 BLUEPRINT-BEREICHE (OFFIZIELLER CISCO 200-301 BLUEPRINT) -------------------------------------------------+ |
|  |                                                                                                                    | |
|  |  +-- 1.0 Network Fundamentals (20%) -+  +-- 2.0 Network Access (20%) --------+  +-- 3.0 IP Connectivity (25%) -----+  | |
|  |  | Fortschritt: 18/20 Lektionen (90%) |  | Fortschritt: 12/16 Lektionen (75%) |  | Fortschritt: 8/18 Lektionen (44%) |  | |
|  |  | Fragen: 142/287 beantwortet        |  | Fragen: 98/224 beantwortet         |  | Fragen: 65/196 beantwortet         |  | |
|  |  | Trefferquote: 82 %                 |  | Trefferquote: 74 %                 |  | Trefferquote: 61 % (Aufholbedarf)  |  | |
|  |  | [v Drill-down: 8 Unterthemen]     |  | [v Drill-down: 6 Unterthemen]      |  | [v Drill-down: 5 Unterthemen]      |  | |
|  |  +------------------------------------+  +------------------------------------+  +------------------------------------+  | |
|  |                                                                                                                    | |
|  |  +-- 4.0 IP Services (10%) ----------+  +-- 5.0 Security Fundamentals (15%) -+  +-- 6.0 Automation & Prog. (10%) ---+  | |
|  |  | Fortschritt: 8/10 Lektionen (80%)  |  | Fortschritt: 7/12 Lektionen (58%)  |  | Fortschritt: 4/8 Lektionen (50%)   |  | |
|  |  | Fragen: 55/121 beantwortet         |  | Fragen: 48/119 beantwortet         |  | Fragen: 32/108 beantwortet         |  | |
|  |  | Trefferquote: 79 %                 |  | Trefferquote: 68 %                 |  | Trefferquote: 71 %                 |  | |
|  |  | [v Drill-down: 5 Unterthemen]     |  | [v Drill-down: 6 Unterthemen]      |  | [v Drill-down: 4 Unterthemen]      |  | |
|  |  +------------------------------------+  +------------------------------------+  +------------------------------------+  | |
|  +--------------------------------------------------------------------------------------------------------------------+ |
|                                                                                                                        |
|  +-- HEUTE ÜBEN (SCHNELLWERKZEUGE) ----------------------+  +-- SIMULATOREN & PRAXIS -------------------------------+ |
|  | INLINE-SUBNETZ-SCHNELLRECHNER:                        |  | [VLAN-Simulator] Frames, 802.1Q & Trunks live         | |
|  | Eingabe: [ 192.168.10.77/27          ] [Zufall]       |  | [STP-Simulator]  Root Bridge & Port-Rollen verstehen   | |
|  | Netz: 192.168.10.64   | Broadcast: 192.168.10.95      |  | [OSPF-Simulator] SPF-Algorithmus & LSA-Austausch      | |
|  | Hosts: 192.168.10.65 - 192.168.10.94 (30 nutzbar)     |  | [OSI-Simulator]  Kapselung durch alle 7 Schichten      | |
|  | Maske: 255.255.255.224 | Wildcard: 0.0.0.31           |  | [Canvas v2]      Freie Topologieplanung im Packet-Tracer| |
|  | ----------------------------------------------------  |  +-------------------------------------------------------+ |
|  | [ Schwächen-Drill: 14 fehlerhafte Fragen üben       ] |                                                            |
|  | [ Drag-and-Drop: Zufällige Zuordnungsaufgabe (81)   ] |  +-- SCHNELLREFERENZEN (PROFI-ZUGRIFF) ------------------+ |
|  +-------------------------------------------------------+  | [IOS CLI] [Subnetz-Tabelle] [Wildcard] [Ports] [ADs]   | |
|                                                             +-------------------------------------------------------+ |
|  +-- ZULETZT BEARBEITET ---------------------------------------------------------------------------------------------+ |
|  | 1. Lektion: OSPF Cost & Metrik-Berechnung (vor 2 Std.)                    [Weiterlesen]                            | |
|  | 2. Prüfungsfrage: Q0312 – EIGRP vs. OSPF Administrative Distanz (vor 5 Std.) [Wiederholen]                         | |
|  | 3. Drag-and-Drop: IPv6 Address Types & Scopes (gestern)                   [Üben]                                   | |
|  +-------------------------------------------------------------------------------------------------------------------+ |
|                                                                                                                        |
|  [Footer: Unabhängige Lernplattform. Cisco & CCNA sind Marken von Cisco Systems, Inc. Kein offizielles Cisco-Produkt.] |
+------------------------------------------------------------------------------------------------------------------------+
```

---

### 2.2 Mobile-Ansicht (390px)

```text
+---------------------------------------+
| [=] CCNA 200-301    [K] [Sun] [Canvas]|
+---------------------------------------+
|                                       |
| HERO                                  |
| CCNA 200-301                          |
| Vorbereitung auf Cisco-Prüfung        |
|                                       |
| +-----------------------------------+ |
| | > WEITERLERNEN                    | |
| | OSPFv2 Single-Area                | |
| | Lektion 14 * 78 % Trefferquote    | |
| +-----------------------------------+ |
|                                       |
| [Mini-Topologie: R1 - SW1 - PC1]      |
| [Ping testen: PC1 -> R1]              |
|                                       |
| +-----------------------------------+ |
| | PRÜFUNGSBEREITSCHAFT: 64 %        | |
| | 34 Tage bis zur Prüfung           | |
| | [v Details aufklappen]            | |
| +-----------------------------------+ |
|                                       |
| BLUEPRINT-BEREICHE (6)                |
|                                       |
| +-- 1.0 Network Fundamentals (20%) -+ |
| | 18/20 Lekt. * 142/287 Q * 82 %    | |
| | [v Drill-down aufklappen]         | |
| +-----------------------------------+ |
|                                       |
| +-- 2.0 Network Access (20%) -------+ |
| | 12/16 Lekt. * 98/224 Q * 74 %     | |
| | [v Drill-down aufklappen]         | |
| +-----------------------------------+ |
|                                       |
| +-- 3.0 IP Connectivity (25%) ------+ |
| | 8/18 Lekt. * 65/196 Q * 61 %      | |
| | [v Drill-down aufklappen]         | |
| +-----------------------------------+ |
|                                       |
| +-- 4.0 IP Services (10%) ----------+ |
| | 8/10 Lekt. * 55/121 Q * 79 %      | |
| +-----------------------------------+ |
|                                       |
| +-- 5.0 Security Fundamentals (15%)-+ |
| | 7/12 Lekt. * 48/119 Q * 68 %      | |
| +-----------------------------------+ |
|                                       |
| +-- 6.0 Automation & Prog. (10%) ---+ |
| | 4/8 Lekt. * 32/108 Q * 71 %       | |
| +-----------------------------------+ |
|                                       |
| SUBNETZ-SCHNELLRECHNER                |
| [ 192.168.10.77/27      ] [Zufall]    |
| Netz:      192.168.10.64              |
| Broadcast: 192.168.10.95              |
| Hosts:     .65 - .94 (30 nutzbar)     |
| Maske:     255.255.255.224            |
|                                       |
| HEUTE ÜBEN                            |
| [ Schwächen-Drill: 14 Fragen       ] |
| [ Drag-and-Drop: Zufalls-Lab       ] |
|                                       |
| SIMULATOREN                           |
| [ VLAN-Simulator                   ] |
| [ STP-Simulator                    ] |
| [ Routing- & OSPF-Simulator        ] |
| [ OSI-Simulator                    ] |
| [ Topologie-Canvas v2              ] |
|                                       |
| ZULETZT BEARBEITET                    |
| - OSPF Cost & Metrik (vor 2 Std.)     |
| - Q0312: Admin Distance (vor 5 Std.)  |
|                                       |
| [Footer: Rechtlicher Disclaimer]      |
+---------------------------------------+
```

---

## 3. Detaillierte Spezifikation der 6 Dashboard-Bereiche

### 3.1 Bereich 1: Kopfbereich (Hero)
- **Titel:** `CCNA 200-301` mit Unterzeile:
  *„Strukturierte Vorbereitung auf die Cisco-Zertifizierung: 1.055 klassifizierte Prüfungsfragen, 81 Drag-and-Drop-Szenarien und interaktive Protokoll-Simulatoren.“*
- **Haupt-Aktionsschaltfläche (Primary CTA):**
  - **Bestehender Nutzer:** Großer Button `--accent-solid` mit Text:
    `Weiterlernen: [Titel der letzten Lektion/Frage]` (mit Unterzeile: `Zuletzt vor [X] Stunden bearbeitet * [Y]% Trefferquote`).
  - **Neuer Nutzer:** `Jetzt starten: Lernpfad Network Fundamentals` (führt ohne Reibung direkt zu Schritt 1 des offiziellen Lehrplans).
  - Tastaturkürzel: `Enter` oder `Space` bei fokussiertem Hero löst den CTA sofort aus.
- **Interaktive Topologie (v2-Renderer):**
  - **Geräte & Links:** Echte Cisco-Symbole aus dem v2-Renderer: Router `R1` (Gateway `192.168.10.1`), Layer-2-Switch `SW1`, Server `SRV1` (DNS/Web `192.168.10.10`), Workstation `PC1` (`192.168.10.50`).
  - **Interaktiver Hover/Fokus:** Beim Überfahren oder Tastatur-Fokussieren eines Knotens oder Links öffnet sich ein Tooltip mit Live-Kurzinfo:
    - *Switch SW1:* `Cisco Catalyst 2960 * VLAN 10 (Clients), VLAN 20 (Server) * 802.1Q Trunk zu R1 (Gi0/1)`
    - *Router R1:* `Cisco ISR 4331 * Default Gateway 192.168.10.1/24 * OSPF Process ID 1 Area 0`
    - *Link PC1-SW1:* `FastEthernet0/1 * Access Port * VLAN 10 * Speed 100 Mbps Full-Duplex`
  - **Klick-Aktionen:**
    - Klick auf `SW1` -> öffnet `VLAN-Simulator`
    - Klick auf `R1` -> öffnet Lektion `Routing & OSPF`
    - Klick auf `SRV1` -> öffnet Lektion `IP-Dienste (DNS/DHCP)`
  - **On-Demand-Paketfluss:**
    - Button `Ping zeigen (PC1 -> SRV1)`.
    - Bei Klick wandert ein einzelner, ruhiger Lichtpuls entlang des Links von `PC1` über `SW1` zu `SRV1` und zurück (ICMP Echo Request / Reply).
    - **Keine Dauerschleife:** Nach genau 1 Umlauf stoppt die Bewegung.
    - **Barrierefreiheit:** Bei aktivem `prefers-reduced-motion` findet keine CSS/SVG-Verschiebung statt; stattdessen erscheint ein ruhiger Status-Badge `Ping erfolgreich: RTT 1.2ms (ICMP Echo Reply erhalten)`.

---

### 3.2 Bereich 2: Prüfungsbereiche nach offiziellem Cisco-Blueprint

Die 6 Karten entsprechen exakt den offiziellen Cisco CCNA 200-301 Prüfungsdomänen und deren Gewichtung:

| Domäne | Offizieller Titel | Gewichtung | Lektionen (Bestand) | Fragen im Pool | Hauptthemen im Lehrplan |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **1.0** | **Network Fundamentals** | **20 %** | 8 | 287 | Router, Switches, Topologien, Kabel/Glasfaser, IPv4/IPv6-Adressierung, Virtualisierung, Cloud |
| **2.0** | **Network Access** | **20 %** | 5 | 224 | VLANs, 802.1Q Trunks, STP/RSTP, EtherChannel (LACP), WLAN-Architektur (WLC, AP, WPA3) |
| **3.0** | **IP Connectivity** | **25 %** | 2 | 196 | Routingtabelle, Longest Match, Statische Routen, OSPFv2 Single-Area, FHRP (HSRP) |
| **4.0** | **IP Services** | **10 %** | 5 | 121 | NAT/PAT, NTP, DHCP Relay & Client, DNS, SNMPv3, Syslog, QoS (Marking, LLQ) |
| **5.0** | **Security Fundamentals** | **15 %** | 2 | 119 | Bedrohungen, CIA, Geräte-Härtung, AAA, ACLs (Standard/Extended), Port Security, DHCP Snooping, DAI |
| **6.0** | **Automation and Programmability** | **10 %** | 3 | 108 | Controller (Cisco DNA Center), REST-APIs, JSON/YAML, Ansible, Terraform, Puppet |
| **Summe**| **CCNA 200-301 Gesamt** | **100 %** | **25 (+1 Cross)**| **1.055** | *Vollständige Blueprint-Abdeckung* |

*(Hinweis: Lektion 26 `Troubleshooting` ist ein Querschnittsthema, das alle 6 Bereiche diagnostisch vernetzt).*

#### Funktionen jeder Blueprint-Karte:
1. **Visuelle Gewichtung:** Deutlicher Badge (z. B. `25 % Gewichtung` bei IP Connectivity mit dezenter Akzent-Hervorhebung).
2. **Echte Fortschrittsdaten:**
   - Abgeschlossene Lektionen (z. B. `8 / 18 Lektionen`).
   - Beantwortete Fragen aus dem Fragenpool (z. B. `65 / 196 Fragen`).
   - Trefferquote (`61 % Genauigkeit`).
3. **Drill-down Accordion (ohne Seitenwechsel):**
   - Klick auf `Unterthemen anzeigen` klappt die Teilthemen des Blueprints direkt in der Karte auf.
   - Beispiel für `3.0 IP Connectivity`:
     - `3.1 Routingtabelle & Longest Match` (Status: Gelernt * 8/10 Fragen richtig)
     - `3.2 Administrative Distanz & Metriken` (Status: Gelernt * 12/12 Fragen richtig)
     - `3.3 Statisches Routing & Default-Route` (Status: Gelernt * 15/18 Fragen richtig)
     - `3.4 OSPFv2 Konfiguration & Nachbarschaften` (Status: Offen * 2/15 Fragen richtig -> **Schwäche**)
     - `3.5 First Hop Redundancy (HSRP)` (Status: Offen * Noch keine Fragen beantwortet)
   - Jedes Unterthema besitzt einen Direkt-Button zum Lektionslesen oder Fragen-Üben.

---

### 3.3 Bereich 3: Prüfungsbereitschaft (Transparente Formel & Countdown)

Keine Fantasie- oder Motivationszahlen. Der Readiness-Score basiert auf einem mathematisch transparenten Modell, das der Nutzer jederzeit aufklappen und nachprüfen kann:

#### Die Berechnungsformel:
$$\text{Readiness-Score} = \sum_{d=1}^{6} \left( W_d \times \text{DomainScore}_d \right)$$

Wobei für jede Domäne $d$:
$$\text{DomainScore}_d = \text{Accuracy}_d \times \text{CoverageFactor}_d$$
$$\text{CoverageFactor}_d = \min\left(1.0, \frac{\text{Fragen}_{\text{beantwortet}, d}}{N_{\text{min}, d}}\right)$$

- $W_d$: Offizielle Cisco-Gewichtung ($W_1 = 0{,}20$, $W_2 = 0{,}20$, $W_3 = 0{,}25$, $W_4 = 0{,}10$, $W_5 = 0{,}15$, $W_6 = 0{,}10$).
- $\text{Accuracy}_d$: Trefferquote der bisher beantworteten Fragen in Domäne $d$ ($\frac{\text{Richtig}}{\text{Beantwortet}}$).
- $\text{CoverageFactor}_d$: Verhindert Verzerrung durch Stichproben. Wer z. B. in Domäne 3 nur 1 Frage beantwortet hat und diese richtig war, hat nicht 100 % Prüfungsreife. $N_{\text{min}}$ ist auf mindestens 20 Fragen pro Domäne kalibriert.

#### Aufklappbare Aufschlüsselung im Dashboard:
Klickt der Nutzer auf `Warum 64 %?`, öffnet sich eine nüchterne Tabelle:
- *IP Connectivity (25 %):* Trefferquote 61 %, Abdeckung 33 % -> **zieht Gesamtbereitschaft um 11,2 % nach unten**.
- *Network Access (20 %):* Trefferquote 74 %, Abdeckung 44 % -> **zieht Gesamtbereitschaft um 4,8 % nach unten**.
- *Konkrete Handlungsempfehlung:* „Löse 25 weitere Fragen in *3.0 IP Connectivity*, um deinen Readiness-Score um bis zu 9 Punkte zu steigern.“

#### Optionaler Prüfungs-Countdown:
- Eingabefeld: Persönliches Prüfungsdatum festlegen (z. B. `15.11.2026`).
- Anzeige: `Noch 34 Tage bis zur Prüfung`.
- Prioritäten-Hinweis: Passt die Empfehlungen auf dem Dashboard dynamisch an die verbleibende Zeit an.

---

### 3.4 Bereich 4: Heute üben (Inline-Werkzeuge ohne Modal-Dialoge)

1. **Inline-Subnetz-Schnellrechner:**
   - Direkt auf der Startseite integriert, kein störender Dialog.
   - Eingabefeld mit Vorbelegung (z. B. `192.168.10.77/27`).
   - Button `Zufälliges Subnetz`: Generiert sofort eine neue Übungsaufgabe.
   - Sofortige Live-Ausgabe in Tabellenform mit `tabular-nums`:
     - **Netzadresse:** `192.168.10.64`
     - **Broadcastadresse:** `192.168.10.95`
     - **Nutzbarer Hostbereich:** `192.168.10.65 – 192.168.10.94` (30 nutzbare Adressen)
     - **Subnetzmaske:** `255.255.255.224`
     - **Wildcard-Maske:** `0.0.0.31`
     - **Binär-Oktett (Schrittweite):** `32` (Blockgröße im 4. Oktett)
2. **Schwächen-Drill-Einstieg:**
   - Zeigt die genaue Anzahl der aktuell im `localStorage` gespeicherten Fehlerfragen (z. B. `14 Fragen im Schwächen-Speicher`).
   - Ein Klick startet den Trainer gefiltert exakt auf diese Fragen.
3. **Zufälliges Drag-and-Drop-Szenario:**
   - Vorschau einer Zuordnungsaufgabe aus den 81 verfügbaren CCNA-Szenarien mit Aufgabenstellung (z. B. *„Ordne die IPv6-Adresstypen den Scopes zu“*).
   - Ein Klick öffnet den Drag-and-Drop-Trainer direkt an dieser Aufgabe.

---

### 3.5 Bereich 5: Simulatoren und Werkzeuge

Fünf kompakte Fachkacheln mit jeweils genau einem klaren Satz zum Lernwert:

1. **VLAN- & Trunk-Simulator:**
   *„Verfolge Ethernet-Frames mit 802.1Q-Tags, Access- und Trunk-Ports sowie Native VLANs im Live-Betrieb.“*
2. **Spanning-Tree-Simulator (STP & RSTP):**
   *„Verstehe Root-Bridge-Wahlen, Port-Rollen (Root, Designated, Blocked) und Konvergenzzeiten Schritt für Schritt.“*
3. **Routing- & OSPF-Simulator:**
   *„Analysiere Routingtabellen, Longest-Prefix-Matches und den Austausch von OSPF Link-State Advertisements.“*
4. **OSI- & TCP/IP-Simulator:**
   *„Visualisiere Datenkapselung von Layer 7 bis Layer 1 mit vollständigen Header-Strukturen und Prüfsummen.“*
5. **Topologie-Canvas (v2):**
   *„Entwirf komplexe Netzwerkarchitekturen frei, konfiguriere Cisco-Geräte und teste Erreichbarkeit.“*

---

### 3.6 Bereich 6: Zuletzt bearbeitet

Eine kompakte Historie der letzten 3 Aktionen zur nahtlosen Fortsetzung des Lernens:
- Eindeutiges Typ-Icon (Lektion, Multiple-Choice-Frage, Drag-and-Drop-Lab).
- Titel des Themas mit Zeitstempel (z. B. `vor 2 Stunden`).
- Direkter Aktionslink (`Weiterlesen`, `Wiederholen`, `Lab öffnen`).

---

## 4. Spezifikation für spezifische Nutzergruppen

### 4.1 Tastatur-Befehlspalette (`Strg+K` / `Cmd+K`)
Ermöglicht professionelles Arbeiten ohne Griff zur Maus:
- Global erreichbar über `Strg+K` (Windows/Linux) bzw. `Cmd+K` (macOS).
- Durchsucht gleichzeitig in Echtzeit:
  - **Cisco-IOS-Befehle:** z. B. `show ip interface brief`, `router ospf`, `switchport mode trunk` (mit Kurzerklärung und Modus).
  - **Prüfungsfragen nach ID:** z. B. `Q0042`, `dd-q0012` führt direkt zur Frage.
  - **Blueprint-Themen:** z. B. `FHRP`, `Subnetting`, `VLAN`, `NAT`.
  - **Simulatoren & Werkzeuge:** Direkter Sprung ohne Menünavigation.

### 4.2 Dozenten-Präsentationsmodus für Beamer
Für Lehrkräfte an Schulen, Akademien und Berufsbildungszentren:
- Aktivierbar über Schnellzugriff im Header oder Tastenkürzel `P`.
- **Eigenschaften:**
  - Typografie wird automatisch vergrößert (Schriftgröße +20 % für Beamer-Lesbarkeit aus Entfernung).
  - Maximaler Kontrast (Tokens optimiert für lichtschwache Projektoren).
  - Navigation und Randleisten werden ablenkungsfrei minimiert.
  - Ermöglicht das Teilen von Topologien per Direktlink oder JSON-Datei für Unterrichts-Übungen.

### 4.3 Schnellreferenz für Profis
Direkter Ein-Klick-Zugriff auf die wichtigsten Fakten-Tabellen:
- **IOS-Befehlsglossar:** Alphabetisch und nach Modus sortiert.
- **IPv4-Subnetztabelle:** `/0` bis `/32` mit Maske, Wildcard und Hostanzahl.
- **Ports & Protokolle:** Well-Known Ports (20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 67/68 DHCP, 69 TFTP, 80 HTTP, 110 POP3, 123 NTP, 161 SNMP, 443 HTTPS, 514 Syslog).
- **Administrative Distanzen (AD):**
  - Connected: `0`
  - Static: `1`
  - EIGRP (Internal): `90`
  - OSPF: `110`
  - IS-IS: `115`
  - RIP: `120`
  - EIGRP (External): `170`
  - BGP (Internal): `200`

---

## 5. Datenbasis-Audit: Zuordnung von Fragen & Lektionen zum Blueprint

Eine Grundforderung des Auftrags lautet:
*„Sind alle Fragen und Lektionen einem der sechs Blueprint-Bereiche zugeordnet? Wo fehlt die Zuordnung?“*

### 5.1 Prüfungsfragen-Pool (Multiple-Choice)
- **Klassifizierter Pool (`src/data/ccnaQuestionsClassified.ts`):**
  - Gesamtanzahl: **1.055 Fragen**.
  - **Ergebnis:** **100 % aller 1.055 Fragen sind bereits sauber und fehlerfrei den 6 offiziellen Cisco-Blueprint-Bereichen zugeordnet!**
    - `1.0 Network Fundamentals`: **287 Fragen**
    - `2.0 Network Access`: **224 Fragen**
    - `3.0 IP Connectivity`: **196 Fragen**
    - `4.0 IP Services`: **121 Fragen**
    - `5.0 Security Fundamentals`: **119 Fragen**
    - `6.0 Automation and Programmability`: **108 Fragen**
    - Fehlende Zuordnungen: **0 Fragen**.
  - Jede Frage besitzt zusätzlich ein präzises `blueprint_section`-Feld (z. B. `3.4` für OSPF, `2.1` für VLANs).
- **Rohdaten-Pool (`src/data/ccnaQuestions.ts`):**
  - Enthält 1.078 Rohfragen, die historisch über eine Text-RegEx-Heuristik in 8 ad-hoc Kategorien eingeteilt wurden.
  - **Empfehlung für das neue Dashboard:** Das Dashboard nutzt als Datenbasis **ausschließlich den klassifizierten Fragenpool (`ccnaQuestionsClassified.ts`)**, da dieser methodisch exakt dem offiziellen Cisco-Blueprint entspricht.

### 5.2 Drag-and-Drop-Fragen (`src/data/ccnaDragDrop.ts`)
- Gesamtanzahl: **81 interaktive Zuordnungsfragen**.
- **Audit-Befund:** Die Drag-and-Drop-Fragen besitzen im aktuellen Datenmodell **kein explizites `blueprintDomain`-Feld**, sondern nur `id`, `instruction`, `targets`, `items` und `explanation`.
- **Lösung für R3 Schritt 1b:**
  Wir führen eine formale Zuordnungs-Map für alle 81 Drag-and-Drop-IDs ein:
  - Z. B. `dd-q0003` (FTP vs TFTP Port 21/69) -> `4.0 IP Services`
  - Z. B. `dd-q0012` (OUI, MAC, IP, Subnet) -> `1.0 Network Fundamentals`
  - Z. B. `dd-q0811` (802.11 Standards) -> `2.0 Network Access`
  - Z. B. `dd-q0905` (HSRP States) -> `3.0 IP Connectivity`
  - Z. B. `dd-q0016` (ACL Typen & Filterung) -> `5.0 Security Fundamentals`
  - Z. B. `dd-q1024` (REST API Methods & JSON) -> `6.0 Automation & Programmability`
  Damit fließen auch gelöste Drag-and-Drop-Aufgaben zu 100 % in den jeweiligen Blueprint-Fortschritt ein.

### 5.3 Lektionen & Topics (`src/content/modules/ccna/index.ts`)
- Gesamtanzahl: **26 Topics** in `CCNA_MODULE.topics`.
- **Audit-Befund:** Im `Topic`-Interface existiert bisher kein Feld `blueprintDomain`. In `TopicListPanel.tsx` wurden stattdessen 8 ad-hoc Kategorien (`Fundamentals`, `Adressierung`, `Switching & Routing`, etc.) genutzt.
- **Lösung für R3 Schritt 1b:**
  Alle 26 Topics werden eindeutig auf die 6 Blueprint-Domänen gemappt:

```typescript
export const TOPIC_TO_BLUEPRINT_DOMAIN: Record<string, "1.0" | "2.0" | "3.0" | "4.0" | "5.0" | "6.0"> = {
  // 1.0 Network Fundamentals (20 %)
  "topic-networking-fundamentals": "1.0",
  "topic-ios-cli": "1.0",
  "topic-ipv4-addressing": "1.0",
  "topic-subnet-segmentation": "1.0",
  "topic-ipv6": "1.0",
  "topic-verkabelung": "1.0",
  "topic-glasfaser": "1.0",
  "topic-virtualization": "1.0",
  "topic-wan": "1.0", // WAN-Topologien & Architekturen

  // 2.0 Network Access (20 %)
  "topic-switching-vlans": "2.0",
  "topic-stp": "2.0",
  "topic-etherchannel": "2.0",
  "topic-vlan-advanced": "2.0",
  "topic-wlan": "2.0",

  // 3.0 IP Connectivity (25 %)
  "topic-routing-ospf": "3.0",
  "topic-fhrp": "3.0", // First Hop Redundancy (HSRP/VRRP)

  // 4.0 IP Services (10 %)
  "topic-dhcp-nat": "4.0",
  "topic-nat": "4.0",
  "topic-dns": "4.0",
  "topic-device-management": "4.0", // NTP, Syslog, SNMP
  "topic-qos": "4.0",

  // 5.0 Security Fundamentals (15 %)
  "topic-security": "5.0",
  "topic-acl": "5.0",

  // 6.0 Automation and Programmability (10 %)
  "topic-sdn": "6.0", // Controller, DNA Center
  "topic-automation": "6.0", // REST, JSON, Ansible

  // Querschnittsthema (wird anteilig auf 1.0 - 5.0 angerechnet oder als Diagnose ausgewiesen)
  "topic-troubleshooting": "1.0", 
};
```

---

## 6. Nüchterne leere Zustände (Empty States für neue Lerner)

Wenn ein Nutzer die Plattform zum ersten Mal öffnet, darf kein deprimierender „0 %-Friedhof“ mit roten Warnbalken erscheinen.
Stattdessen zeigt das Dashboard eine einladende, fachlich klare Orientierung:

1. **Hero-Bereich:**
   - Titel: `Willkommen zur CCNA 200-301 Prüfungsvorbereitung`
   - Primärer CTA: `Jetzt starten: 1.0 Network Fundamentals`
   - Begleittext: *„Starte mit den Grundlagen der Datenübertragung und arbeite dich strukturiert durch alle 6 Prüfungsbereiche.“*
2. **Prüfungsbereitschaft:**
   - Anstelle von `0 % Unvorbereitet` steht ein neutraler Einstiegshinweis:
     `Bereitschaftsmessung startet ab 10 beantworteten Fragen.`
   - Fortschrittsbalken ist neutral grau gefüllt mit dem Hinweis `Startbereit`.
3. **Blueprint-Karten:**
   - Jede Karte zeigt dezent `Noch nicht begonnen * [X] Lektionen verfügbar`.
   - Der Button lautet `Bereich beginnen` statt `Wiederholen`.
4. **Schwächen-Drill:**
   - Zeigt sachlich: `Noch keine Fehlerfragen gespeichert. Löse dein erstes Quiz im Bereich Network Fundamentals.`

---

## 7. Gestaltung & Design-System-Konformität (R2-Tokens)

Das Dashboard hält sich strikt an die in R2 definierten Design-Tokens:

- **Hintergründe & Flächen:**
  - App-Hintergrund: `--app-bg` (`#090D16` Dark / `#F8FAFC` Light)
  - Dashboard-Karten: `--surface` (`#0F172A` Dark / `#FFFFFF` Light)
  - Hover-Flächen & Dropdowns: `--surface-elevated` (`#1E293B` Dark / `#F1F5F9` Light)
  - Trennlinien: `--border-subtle` (`#334155` Dark / `#E2E8F0` Light)
- **Akzentfarben & Interaktion:**
  - Primär-Buttons & CTA: `--accent-solid` (`#0284C7` Dark / `#0284C7` Light) mit Text `--on-accent-solid` (`#FFFFFF`).
  - Mindestkontrast von 4,5:1 auf allen Texten gemäß WCAG AA garantiert.
- **Typografie:**
  - IBM Plex Sans für alle Fließtexte, Überschriften und Labels.
  - IBM Plex Mono für IP-Adressen, Subnetzmasken, CLI-Befehle und Config-Fragmente.
  - CSS-Klasse `tabular-nums` für alle Prozentangaben, Zähler und Countdown-Werte.
- **Netzwerk-Icons:**
  - Cisco-Originalstil aus `src/components/canvas-v2/DeviceIcons.tsx` für Router, Switch, Firewall, Cloud, Server, PC. Keine generischen Cliparts.

---

## 8. Rechtlicher Hinweis (Footer-Disclaimer)

Im Fußbereich des Dashboards wird folgender rechtlich präzise Disclaimer fest platziert:

> **Rechtlicher Hinweis:** Diese Plattform ist eine unabhängige Lern- und Trainingssoftware und steht in keiner geschäftlichen Verbindung zu Cisco Systems, Inc. Die Software wurde von Cisco weder geprüft noch genehmigt oder autorisiert. *CCNA* und *Cisco* sind eingetragene Marken von Cisco Systems, Inc. Die Verwendung der Markenbezeichnung dient ausschließlich der sachlichen Information über den Gegenstand und die Ausrichtung der Vorbereitung auf die Prüfung CCNA 200-301.

---

## 9. Geplanter Implementierungsablauf (Phase D2)

Nach Freigabe dieses Konzepts (D1) erfolgt die technische Umsetzung in folgenden strukturierten Teilschritten auf dem Branch `feature/redesign-r3-dashboard`:

1. **D2.1 Daten-Aggregator & Blueprint-Mapping:**
   - Erstellung von `src/lib/ccna-blueprint-service.ts` zur Berechnung der 6 Domänen-Statistiken, der Readiness-Formel und der Drag-and-Drop-Zuordnung aus den echten bestehenden Progress- und Quizdaten.
2. **D2.2 Hero-Bereich mit interaktiver v2-Topologie:**
   - Erstellung von `src/components/dashboard/HeroSection.tsx` mit v2-SVG-Renderer, Hover-Tooltips, On-Demand-Ping und Weiterlernen-CTA.
3. **D2.3 Blueprint-Grid mit Drill-down Accordion:**
   - Erstellung von `src/components/dashboard/BlueprintDomainsSection.tsx` mit 6 Karten, animierten Accordions ohne Seitenwechsel und direkten Einsprungpunkten.
4. **D2.4 Inline-Subnetz-Schnellrechner & Übungs-Tools:**
   - Erstellung von `src/components/dashboard/InlineSubnetCalculator.tsx` und `TodayPracticeSection.tsx`.
5. **D2.5 Befehlspalette (`Strg+K`) & Dozenten-Präsentationsmodus:**
   - Erstellung von `src/components/dashboard/CommandPalette.tsx` und Toggle für Projektormodus.
6. **D2.6 Validierung, A11y (axe-core) & Multi-Device-Screenshots:**
   - Tests und Screenshots bei 1440px, 1024px und 390px (Dark und Light, jeweils neuer Nutzer und fortgeschrittener Nutzer).

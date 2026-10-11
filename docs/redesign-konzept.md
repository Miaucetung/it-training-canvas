# CCNA-Lernplattform: Umfassendes Redesign-Konzept (Phase R1)

> **Dokument:** Phase R1 Analyse & Designkonzept (Optik & UI-Architektur)  
> **Repository:** `it-training-canvas-new`  
> **Branch:** `feature/app-redesign`  
> **Status:** Konzept zur Freigabe vorgelegt (Kein Code geändert)  
> **Zielgruppe:** Erwachsene in beruflicher Umschulung / Weiterbildung (CCNA 200-301 Fachinformatiker Systemintegration)  
> **Zielgeräte:** Desktop (1440 × 900 px) & Smartphone (390 × 844 px), jeweils Dark & Light Mode  

---

## 1. Executive Summary & Ausgangslage

Die Plattform `ccna.ajti.online` bietet mit über 1.200 Prüfungsfragen, 81 interaktiven Drag-and-Drop-Aufgaben, 26 didaktischen CCNA-Themenmodulen und spezialisierten Netzwerk-Simulatoren eine fachlich herausragende Basis.

Gleichzeitig leidet die Gesamtanwendung unter einem gewachsenen **optischen und architektonischen Wildwuchs**:
1. **Header-Überladung:** 12+ separate Schaltflächen drängen sich im Desktop-Header.
2. **Fragmentiertes Theming:** Der Light-Mode ist in weiten Teilen der App unbenutzbar, da Farben wie `bg-slate-900`, `bg-[#0a0f1e]` und `text-slate-200` fest verdrahtet sind. Der Theme-Schalter existierte bisher nur versteckt im Canvas.
3. **Modale über Modalen:** Mehrere Dialoge (Lernpfade, Prüfung, Simulatoren) öffnen sich unkoordiniert übereinander.
4. **Mobile Platzverschwendung:** Auf 390px Smartphones blockiert eine vertikale Fach-Sidebar dauerhaft rund 60px Bildschirmbreite; Zielbereiche bei Drag-&-Drop-Fragen erfordern horizontales Scrollen.
5. **Inkonsistente UI-Muster:** Es existieren mindestens 5 verschiedene Button-Stile, 4 Tabs-Implementierungen und disparate Kartenlayouts.

**Ziel des Redesigns:** Ein ruhiges, hochgradig lesbares, barrierefreies (WCAG AA) und konsistentes Designsystem, das auf der klaren visuellen Sprache des neu entwickelten **Canvas v2** aufbaut.

---

## 2. Screenshot-Inventar der Hauptbereiche (1440px & 390px, Dark & Light)

Alle 52 Referenz-Screenshots wurden automatisiert im headless Chromium via Chrome DevTools Protocol (CDP) erfasst und sind unter `docs/screenshots/redesign-r1/` abgelegt:

| Bereich | Desktop Dark (1440px) | Desktop Light (1440px) | Mobile Dark (390px) | Mobile Light (390px) | Befunde / Defizite im Ist-Zustand |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01 Dashboard** | `01_dashboard_desktop_dark.png` | `01_dashboard_desktop_light.png` | `01_dashboard_mobile_dark.png` | `01_dashboard_mobile_light.png` | Header überladen; Tools-Pills wiederholen Menü; Light-Mode greift nicht; Sidebar nimmt mobil 60px weg. |
| **02 Lernpfade** | `02_learning_paths_desktop_dark.png` | `02_learning_paths_desktop_light.png` | `02_learning_paths_mobile_dark.png` | `02_learning_paths_mobile_light.png` | Dropdown hängt unruhig vom Header herab; verdeckt dahinterliegenden Content; schließt nicht zuverlässig. |
| **03 Lektionen** | `03_lesson_desktop_dark.png` | `03_lesson_desktop_light.png` | `03_lesson_mobile_dark.png` | `03_lesson_mobile_light.png` | Heterogene Farben; Tabellen teils schwer lesbar; Weiter-Button am Ende uneinheitlich positioniert. |
| **04 Prüfung** | `04_exam_prep_desktop_dark.png` | `04_exam_prep_desktop_light.png` | `04_exam_prep_mobile_dark.png` | `04_exam_prep_mobile_light.png` | Drei grelle Boxen (Cyan, Violett, Orange); unruhige visuelle Hierarchie; Select-Dropdown im Standard-OS-Stil. |
| **05 D&D Exhibit** | `05_drag_drop_exhibit_desktop_dark.png` | `05_drag_drop_exhibit_desktop_light.png` | `05_drag_drop_exhibit_mobile_dark.png` | `05_drag_drop_exhibit_mobile_light.png` | Mobil erzwungenes horizontales Scrollen bei CLI-Exhibits; Touch-Targets unter 44px; Modal-Stacking. |
| **06 Sim: VLAN** | `06_sim_vlan_desktop_dark.png` | `06_sim_vlan_desktop_light.png` | `06_sim_vlan_mobile_dark.png` | `06_sim_vlan_mobile_light.png` | Isoliertes Popup mit eigenem Tabs-System; eingeklemmt in festes `max-h-[90vh]`; Scroll-Container kollidieren. |
| **07 Sim: STP** | `07_sim_stp_desktop_dark.png` | `07_sim_stp_desktop_light.png` | `07_sim_stp_mobile_dark.png` | `07_sim_stp_mobile_light.png` | Weicht im Farbschema vom Canvas v2 STP-Dreieck ab; eigenständige Button-Leiste. |
| **08 Sim: OSI** | `08_sim_osi_desktop_dark.png` | `08_sim_osi_desktop_light.png` | `08_sim_osi_mobile_dark.png` | `08_sim_osi_mobile_light.png` | Sehr detailliert, aber visuell überladen; Hex-Dump ohne Syntax-Trennlinien. |
| **09 Subnetting** | `09_sim_subnetting_desktop_dark.png` | `09_sim_subnetting_desktop_light.png` | `09_sim_subnetting_mobile_dark.png` | `09_sim_subnetting_mobile_light.png` | Eingabefelder uneinheitlich gestaltet; Tastaturnavigation im Modal nicht standardisiert. |
| **10 Routing** | `10_sim_routing_desktop_dark.png` | `10_sim_routing_desktop_light.png` | `10_sim_routing_mobile_dark.png` | `10_sim_routing_mobile_light.png` | 4 interne Tabs im Dialog; Routingtabelle weicht von Canvas v2 CLI-Ausgabe ab. |
| **11 Glossar** | `11_glossary_desktop_dark.png` | `11_glossary_desktop_light.png` | `11_glossary_mobile_dark.png` | `11_glossary_mobile_light.png` | Suchfeld und Kategoriefilter haben abweichende Radien und Hintergrundfarben. |
| **12 Fortschritt** | `12_progress_desktop_dark.png` | `12_progress_desktop_light.png` | `12_progress_mobile_dark.png` | `12_progress_mobile_light.png` | Fortschrittsbalken mit grellen Gradients; Textkontraste im Dark-Mode teils grenzwertig. |
| **13 Canvas v2** | `13_canvas_desktop_dark.png` | `13_canvas_desktop_light.png` | `13_canvas_mobile_dark.png` | `13_canvas_mobile_light.png` | **Referenz-Design**: Ruhig, sauber gruppiert, hochwertige Icons, klare Legende, keine Überblendungen. |

---

## 3. Inventar der UI-Muster (Wildwuchs & Inkonsistenzen)

### 3.1 Buttons (5 divergierende Stile)
1. **Primary Action**: `bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl` (Lektions-CTA).
2. **Accent / Cyan Pill**: `rounded-full bg-cyan-600/90 text-white font-bold shadow-lg` (Hilfe/Tour Button).
3. **Ghost / Outline Toolbar**: `border border-slate-700 bg-slate-800 text-slate-300 rounded-lg text-xs` (Dashboard Shortcuts).
4. **Header Pills**: Unterschiedliche Paddings (`px-2.5 sm:px-3 py-1.5` vs. `px-2 py-1`), teils borderlos, teils mit 1px Rahmen.
5. **Canvas v2 Tool Buttons**: `border border-slate-700/80 bg-slate-900/90 text-slate-200 rounded-lg text-xs font-semibold` (Klarer Sieger bezüglich Ruhe und Lesbarkeit).

### 3.2 Karten & Container
- **Dashboard**: Gradient-Rahmen `from-indigo-950/60 to-slate-900/80 border-indigo-500/20 rounded-2xl`.
- **Themenkarten**: Starre Slate-Karten `bg-slate-900 border-slate-800 rounded-xl`.
- **Prüfungskarten**: Drei stark kontrastierende Rahmenfarben (Cyan, Violett, Orange), die das Auge überfordern.
- **Canvas v2 Panels**: Subtile 1px Border (`border-slate-700/80`), transparenter Backdrop-Blur (`bg-slate-900/95`), keine unruhigen Verläufe.

### 3.3 Dialoge & Modalfenster
- **Fehlender zentraler Dialog-Stack**: Öffnet man aus dem Header ein Menü, während ein Prüfungsdialog geöffnet ist, rendern sich die Ebenen ineinander.
- **Inkonsistente Abmessungen**: Manche Dialoge nutzen `max-w-2xl`, andere `max-w-4xl`, `max-w-5xl` oder feste Pixelbreiten.
- **Close-Buttons**: Unterschiedliche Positionen (rechts oben mit `X`, Schließen-Button im Footer oder nur Klick auf Backdrop).

### 3.4 Tabs & Filter
- In Lektionen: Textbasierte Reiter mit Underline.
- In Simulatoren: Eigene Button-Tabs mit abweichenden Indikatoren.
- Auf dem Canvas: Segmented Control (`Simple ↔ Detail`) mit Schieber-Optik.
- Im Dashboard: Horizontale Pill-Reihe mit `rounded-full`.

### 3.5 Code- und CLI-Blöcke
- Reine unstrukturierte `<pre>`-Tags ohne Trennung zwischen Cisco-Prompt (`Router#`), Befehl und Systemausgabe.
- Kein einheitlicher "Befehl kopieren"-Button (wichtig, damit Lernende nicht den Prompt mitkopieren).
- Fehlendes Syntax-Highlighting für Cisco-Schlüsselwörter (`GigabitEthernet`, `up/up`, `trunking`, `via 10.0.0.1`).

---

## 4. Neues Design-System (Basierend auf Canvas v2)

Das Designsystem orientiert sich an der reduzierten, hochprofessionellen Ästhetik von **Canvas v2**: tiefe, unaufgeregte Slate-Flächen, exakte 8pt/4px-Raster, klare Typografie und gezielte Statusakzente.

### 4.1 Farb-Tokens (CSS-Variablen & Tailwind-Theme)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SEMANTISCHE FARB-TOKENS                           │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│ Token                    │ Dark Mode                │ Light Mode            │
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ --app-bg                 │ oklch(0.12 0.02 260)     │ oklch(0.98 0.005 250) │
│ --surface                │ oklch(0.16 0.02 260)     │ oklch(1.00 0 0)       │
│ --surface-elevated       │ oklch(0.20 0.02 260)     │ oklch(0.96 0.01 250)  │
│ --surface-sunken         │ oklch(0.10 0.02 260)     │ oklch(0.93 0.01 250)  │
│ --border-subtle          │ oklch(0.24 0.02 260)     │ oklch(0.90 0.01 250)  │
│ --border-default         │ oklch(0.30 0.02 260)     │ oklch(0.82 0.02 250)  │
│ --border-accent          │ oklch(0.65 0.18 240)     │ oklch(0.55 0.18 240)  │
│ --text-primary           │ oklch(0.96 0.01 250)     │ oklch(0.15 0.02 250)  │
│ --text-secondary         │ oklch(0.72 0.02 250)     │ oklch(0.42 0.02 250)  │
│ --text-muted             │ oklch(0.52 0.02 250)     │ oklch(0.55 0.02 250)  │
│ --accent-primary         │ #38BDF8 (Sky)            │ #0284C7 (Sky)         │
│ --status-success         │ #10B981 (Emerald)        │ #059669 (Emerald)     │
│ --status-warning         │ #F59E0B (Amber)          │ #D97706 (Amber)       │
│ --status-error           │ #EF4444 (Red)            │ #DC2626 (Red)         │
│ --status-trunk           │ #818CF8 (Indigo)         │ #4F46E5 (Indigo)      │
│ --status-blocking        │ #F97316 (Orange)         │ #EA580C (Orange)      │
└──────────────────────────┴──────────────────────────┴───────────────────────┘
```

> **WCAG AA Konformität:** Alle Text- und Rahmenfarben weisen im Verhältnis zu ihrem jeweiligen Hintergrund einen Kontrastwert von mindestens **4,5 : 1** (Fließtext) bzw. **3,0 : 1** (Große Schrift / Icons / Rahmen) auf.

### 4.2 Typografie-Skala

- **Fließtext & UI:** `IBM Plex Sans` (präzise Lesbarkeit bei langen Texten).
- **Code & CLI:** `IBM Plex Mono` (feste Laufweite, unmissverständliche Ziffern `0` vs `O`, `1` vs `l`).

```
Title 2XL : 24px / 32px (font-bold)       — Hauptseiten & Lektions-Titel
Title XL  : 20px / 28px (font-semibold)  — Modul-Überschriften
Title LG  : 16px / 24px (font-semibold)  — Karten-Titel & Dialog-Header
Body Base : 14px / 20px (font-normal)    — Didaktischer Lesetext
Body SM   : 12px / 16px (font-medium)    — Badges, Labels, Toolbar-Buttons
Code Base : 12px / 18px (font-mono)      — CLI-Befehle, Routing-Tabellen, Subnetze
```

### 4.3 Abstände, Radien & Schatten
- **Raster:** Konsequentes 4px / 8px Raster (`p-2`, `p-3`, `p-4`, `p-6`).
- **Radien:**
  - `rounded-md` (6px): Badges, Input-Felder, Dropdown-Items.
  - `rounded-lg` (8px): Buttons, Toolbar-Elemente, Segmented Controls.
  - `rounded-xl` (12px): Inhaltskarten, Panels, Code-Blöcke.
  - `rounded-2xl` (16px): Dialog-Container.
- **Schatten:** Ruhige, weiche Umgebungs-Schatten (`shadow-sm`, `shadow-md`, `shadow-xl`) ohne grelles Glimmen.

---

## 5. Konsolidierung der Navigation (Entlastung des Headers)

### 5.1 Struktur vor und nach dem Redesign

```
IST-ZUSTAND (12 separate Buttons):
[Logo] [Lernpfade] [+ Gerät] [>_ CLI] [Labs] [Tools ▾] [Prüfung] [Priorisiert] [Ping] [Mehr ▾] [?] [Anmelden] [Canvas]

ZIEL-ZUSTAND (4 logische Gruppen + Global Controls):
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] CCNA 200-301    [Lernen]  [Üben & Prüfen]  [Simulatoren]  [Werkzeuge]   │ ☀/☽ │ [Canvas] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Die 4 Funktionsbereiche im Detail

1. **Lernen**
   - 26 CCNA-Themen (Themenübersicht, Lektionen)
   - Strukturierte Lernpfade (z. B. "Netzwerkgrundlagen & IPv4", "Routing & ACLs")
   - Mein Fortschritt & Lernverlauf
2. **Üben & Prüfen**
   - Prüfungsfragen-Trainer (1.081 Fragen: Lernmodus, Prüfungsmodus)
   - 81 Drag-and-Drop-Aufgaben mit Exhibits
   - Schwächen-Drill (gezielte Wiederholung falscher Antworten)
3. **Simulatoren**
   - Paketfluss-Simulation (Canvas v2 integriert)
   - 802.1Q VLAN- & Trunk-Vivisektor
   - Spanning Tree Protocol (STP & RSTP)
   - OSI- & TCP/IP-Encapsulation (L1–L7)
   - Dynamisches Routing & OSPF-Konvergenz
4. **Werkzeuge**
   - Subnetting-Trainer & VLSM-Planer
   - IPv4- & IPv6-Rechner / EUI-64
   - Cisco IOS CLI-Glossar & Befehlsübersicht
   - Verkabelungs-Trainer

### 5.3 Rechte Funktionsleiste
- **Globaler Theme-Toggle** (`☀` Light / `☽` Dark): Schaltet die gesamte Anwendung um (gespeichert in `localStorage`, Default: System-Präferenz).
- **Account / Anmelden**: Profil & Synchronisation.
- **Canvas 3D-Flip (`Lernen` $\leftrightarrow$ `Canvas`)**: Klar akzentuierter Umschalter zwischen Wissens-Dashboard und interaktiver Topologie-Zeichenfläche.

### 5.4 Mobile Navigation (390px Viewport)
- **Wegfall der permanenten linken 60px-Sidebar**: Die Modul-Icons werden in ein klares Drawer-Menü oder eine schlanke mobile Bottom-Bar überführt.
- Der Hauptinhalt erhält die **vollständigen 390px Breite** (mehr Platz für Lesetext, Tabellen und Touch-Ziele).
- Der Flip-Button (`Lernen` / `Canvas`) ist mobil prominent und immer erreichbar.

---

## 6. Neues Konzept für Simulatoren & Arbeitsbereiche

### 6.1 Problem der bisherigen Popups
Bisher öffnen sich Simulatoren als schwebende Fenster über der Seite. Auf Mobilgeräten oder kleinen Displays führt dies zu Scroll-Konflikten (Outer Modal scrollt gegen Inner Tab) und Informationsverlust.

### 6.2 Die einheitliche 3-Zonen-Arbeitsfläche
Jeder Simulator erhält eine standardisierte, ruhige Architektur:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ ZONE 1: KOPFLEISTE                                                                     │
│ Simulator-Titel · CCNA-Topic · [▶ Play] [⏸ Pause] [⏮ Schritt] [⏭ Schritt] [Tempo 1x]    │
├────────────────────────────────────────────────────────────┬───────────────────────────┤
│ ZONE 2: BÜHNE (Interaktives Vektormodell)                  │ ZONE 3: DETAIL-INSPECTOR  │
│                                                            │                           │
│ • Reines SVG mit gestochen scharfen Symbolen               │ • Aktuelle PDU / Frame    │
│ • Hop- und Link-Zustände (FWD, BLK, Trunk)                 │ • Header-Felder           │
│ • Keine unruhigen Dauer-Loops                              │ • Cisco IOS CLI-Befehle   │
│ • Statische Schrittanzeige bei prefers-reduced-motion      │ • Didaktischer Merksatz   │
└────────────────────────────────────────────────────────────┴───────────────────────────┘
```

- **Verknüpfung mit Lektionen:** In den Lektionen führt ein Button *"Im Simulator ausprobieren"* direkt in die vorbereitete Szene.
- **Mobil:** Zone 2 liegt oben, Zone 3 als aufklappbares Bottom-Sheet darunter.

---

## 7. CLI-Terminal & Prüfungs-Exhibits

### 7.1 Cisco-Terminal-Komponente (`CiscoTerminalView`)
1. **Drei-Elemente-Trennung:**
   - **Prompt:** `Router#`, `Switch(config-if)#` in dezentem Sky/Muted.
   - **Befehl:** `show ip route` fett und hervorgehoben.
   - **Ausgabe:** Exakt formatiert in monospaced Typografie mit Syntax-Akzenten.
2. **Kopier-Schutz:** Der Button *"Befehl kopieren"* kopiert ausschließlich `show ip route` in die Zwischenablage – niemals den Prompt `Router#`.
3. **Syntax-Highlighting:** Codes (`C`, `S`, `O`, `D`), Interface-Namen (`Gi0/1`) und IP-Präfixe werden dezent und augenfreundlich farblich hervorgehoben.

### 7.2 Mobile Exhibit-Optimierung für 81 Drag-&-Drop-Fragen
- Exhibits werden als einklappbare Referenzkarten oberhalb der Frage dargestellt.
- Drag-&-Drop-Ziele erhalten mindestens **48 × 48 px** Trefferfläche (Touch Target nach WCAG 2.5.5).
- Alternativ zum Ziehen: **Antippen zum Auswählen $\rightarrow$ Antippen des Ziels** (Zwei-Schritt-Touch).
- Horizontales Scrollen auf Smartphones wird komplett unterbunden.

---

## 8. Animationsrichtlinie & Barrierefreiheit

- **Dezent & zweckgebunden:** Keine dekorativen Gimmicks. Animationen dienen ausschließlich dem Verständnis (z. B. 3D-Flip zwischen Lernen und Canvas, Paket-Fortschritt pro Hop).
- **Keine neuen externen Libraries:** Reine CSS-Transitions und Tailwind-Utilities.
- **Globales `prefers-reduced-motion`:**
  - Bei aktiviertem System-Schalter werden Flip-Transitionen und Paketläufe sofort als statische Schritte gerendert (`transition: none`, `animation: none`).
- **WCAG AA:** Status nie ausschließlich über Farbe (immer Kombination aus Farbe, Symbol, Textbadge und ARIA-Live-Ansage).

---

## 9. Phasen-Fahrplan (Nach Freigabe von R1)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase R1: Analyse & Designkonzept (ABGESCHLOSSEN — Wartet auf Freigabe)                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Phase R2: Design-System & Tokens                                                       │
│ • CSS-Variablen & Tailwind @theme Bereinigung (Dark & Light)                           │
│ • Globaler Theme-Schalter (Header)                                                     │
│ • Standard-Komponenten: Button, Card, Dialog, Tabs, Badge, Input, Table, Callout, CLI  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Phase R3: Bereichsweise Umstellung (Einzelschritte mit CI-Triade & Screenshots)        │
│ 1. Navigation & Layout-Gerüst (Header, Drawer, Breadcrumbs)                            │
│ 2. Lektionen & Lernpfade (Lesefluss, Navigation, Fortschritt)                          │
│ 3. CLI-Ausgaben & Terminal-Komponente (Prompt-Trennung, Copy-Button)                   │
│ 4. Prüfungsfragen & Drag-and-Drop mit Exhibits (Mobile Touch-Optimierung)              │
│ 5. Simulatoren (Standardisierte 3-Zonen-Arbeitsfläche)                                 │
│ 6. Glossar, Fortschritt & finale Politur                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Status & Nächster Schritt

Das Analyse- und Designkonzept ist vollständig ausgearbeitet. Im Quellcode wurden während Phase R1 **keinerlei funktionale Änderungen** vorgenommen.

**Nächster Schritt:**  
Ich erwarte dein **OK** zum Konzept in `docs/redesign-konzept.md`. Sobald du freigibst, starten wir mit **Phase R2: Design-System & Tokens**.

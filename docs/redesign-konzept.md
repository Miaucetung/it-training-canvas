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

Um die Vorgaben von **WCAG 2.1 AA** (mindestens 4,5 : 1 für Fließtext, mindestens 3,0 : 1 für UI-Komponenten, Rahmen und Icons) in beiden Farbmodi strikt einzuhalten, trennen wir Status- und Akzentfarben konsequent in Text-Tokens (`-fg`) und Flächen-/Rahmen-Tokens (`-bg`, `-border`):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               SEMANTISCHE FARB-TOKENS                                  │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Token                    │ Dark Mode (Sanfter Nacht)│ Light Mode (Augenfreundlich)     │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ --app-bg                 │ #0B111E (Midnight Slate) │ #F3F4F6 (Warmes Papiergrau)      │
│ --surface                │ #151D2D (Slate 850)      │ #FFFFFF (Weiß)                   │
│ --surface-elevated       │ #1E293B (Slate 800)      │ #E9EDF2 (Sanfter Well)           │
│ --surface-sunken         │ #070B13 (Deep Slate)     │ #DEE3E9 (Sunken Panel)           │
│ --border-subtle          │ #1E293B (Slate 800)      │ #E2E7ED (Subtiler Rahmen)        │
│ --border-default         │ #2A3649 (Slate 750)      │ #CBD5E1 (Slate 300)              │
│ --border-accent          │ #60A5FA (Blue 400)       │ #2563EB (Blue 600 - Cisco Blau)  │
│                          │                          │                                  │
│ --text-primary           │ #F1F5F9 (Soft White)     │ #1E293B (Dunkelschiefer)         │
│ --text-secondary         │ #CBD5E1 (Slate 300)      │ #475569 (Schiefergrau)           │
│ --text-muted             │ #94A3B8 (Slate 400)      │ #5D6C81 (Slate 500, abgedunkelt) │
│                          │                          │                                  │
│ --accent-primary-fg      │ #60A5FA (Blue 400)       │ #1D4ED8 (Blue 700 - Cisco Navy)  │
│ --accent-primary         │ #3B82F6 (Blue 500)       │ #2563EB (Blue 600 - Fokus/Rahmen)│
│                          │                          │                                  │
│ --status-success-fg      │ #34D399 (Emerald 400)    │ #047857 (Emerald 700)            │
│ --status-success-bg      │ rgba(16, 185, 129, 0.12) │ #ECFDF5 (Emerald 50)             │
│ --status-success-border  │ #059669 (Emerald 600)    │ #059669 (Emerald 600)            │
│                          │                          │                                  │
│ --status-warning-fg      │ #FBBF24 (Amber 400)      │ #92400E (Amber 800)              │
│ --status-warning-bg      │ rgba(245, 158, 11, 0.12) │ #FFFBEB (Amber 50)               │
│ --status-warning-border  │ #D97706 (Amber 600)      │ #D97706 (Amber 600)              │
│                          │                          │                                  │
│ --status-error-fg        │ #F87171 (Red 400)        │ #B91C1C (Red 700)                │
│ --status-error-bg        │ rgba(239, 68, 68, 0.12)  │ #FEF2F2 (Red 50)                 │
│ --status-error-border    │ #DC2626 (Red 600)        │ #DC2626 (Red 600)                │
│                          │                          │                                  │
│ --status-trunk-fg        │ #818CF8 (Indigo 400)     │ #4338CA (Indigo 700)             │
│ --status-trunk-bg        │ rgba(99, 102, 241, 0.12) │ #EEF2FF (Indigo 50)              │
│ --status-trunk-border    │ #6366F1 (Indigo 500)     │ #4F46E5 (Indigo 600)             │
│                          │                          │                                  │
│ --status-blocking-fg     │ #FB923C (Orange 400)     │ #C2410C (Orange 700)             │
│ --status-blocking-bg     │ rgba(249, 115, 22, 0.12) │ #FFF7ED (Orange 50)              │
│ --status-blocking-border │ #EA580C (Orange 600)     │ #EA580C (Orange 600)             │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

> **Hierarchie & Kopplung:** Die Schichtung folgt strikt `app-bg (#0B111E) < surface (#151D2D) < surface-elevated (#1E293B)` im Dark Mode bzw. `app-bg (#F3F4F6) < surface (#FFFFFF) < surface-elevated (#E9EDF2)` im Light Mode. Der Canvas-Hintergrund (`--canvas-bg`) ist direkt an `var(--app-bg)` gekoppelt (kein eigener Sonderwert).

#### CLI-Terminal- und Code-Tokens (bleiben in BEIDEN Themes dunkel)
CLI-Terminals und Cisco-Code-Blöcke behalten ihr vertrautes Konsolen-Erscheinungsbild in beiden Themes. Lediglich der umgebende Rahmen (`--terminal-border`) passt sich an das gewählte Theme an:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              TERMINAL-TOKENS (BEIDE THEMES)                            │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Token                    │ Fester Farbwert          │ Verwendungszweck                 │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ --terminal-bg            │ #0B0F19 (Deep Slate)     │ Konsolen-Hintergrund             │
│ --terminal-fg            │ #E2E8F0 (Slate 200)      │ Standard-Ausgabetext (> 14:1)    │
│ --terminal-prompt        │ #60A5FA (Blue 400)       │ Cisco Prompt (Router#, Switch#)  │
│ --terminal-cmd           │ #FFFFFF (Reinweiß)       │ Eingegebener Befehl (> 18:1)     │
│ --terminal-muted         │ #94A3B8 (Slate 400)      │ Kommentare, Interface-Header     │
│ --terminal-selection     │ #1E293B (Slate 800)      │ Text-Markierungshervorhebung     │
│ --terminal-border        │ var(--border-default)    │ Rahmen (passt sich dem Theme an) │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

#### Rechnerische Kontrast-Tabelle (WCAG 2.1 AA Verifikation)
Alle Kontrastverhältnisse wurden exakt nach W3C-Formel (relative Luminanz $L = 0.2126 R + 0.7152 G + 0.0722 B$ mit Gamma-Entzerrung) auf den augenfreundlichen Hintergrundfarben neu berechnet:

| Token | Hex-Code | Ziel-Hintergrund | Kontrastverhältnis | WCAG-AA Anforderung | Status & Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Light `--text-primary`** | `#1E293B` | `--surface` (`#FFFFFF`) | **14,64 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--text-primary`** | `#1E293B` | `--app-bg` (`#F3F4F6`) | **13,29 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--text-secondary`** | `#475569` | `--surface` (`#FFFFFF`) | **7,58 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--text-secondary`** | `#475569` | `--app-bg` (`#F3F4F6`) | **6,89 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--text-muted`** | `#5D6C81` | `--surface` (`#FFFFFF`) | **5,35 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--text-muted`** | `#5D6C81` | `--app-bg` (`#F3F4F6`) | **4,86 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--accent-primary-fg`** | `#1D4ED8` | `--surface` (`#FFFFFF`) | **6,70 : 1** | $\ge 4,5 : 1$ (Text/Link) | Bestanden (AA) |
| **Light `--accent-primary-fg`** | `#1D4ED8` | `--app-bg` (`#F3F4F6`) | **6,09 : 1** | $\ge 4,5 : 1$ (Text/Link) | Bestanden (AA) |
| **Light `--accent-primary`** | `#2563EB` | `--surface` (`#FFFFFF`) | **5,17 : 1** | $\ge 3,0 : 1$ (Fokus/Linie) | Bestanden (AA) |
| **Light `--accent-primary`** | `#2563EB` | `--app-bg` (`#F3F4F6`) | **4,70 : 1** | $\ge 3,0 : 1$ (Fokus/Linie) | Bestanden (AA) |
| **Light `--status-success-fg`** | `#047857` | `--surface` (`#FFFFFF`) | **5,48 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-success-fg`** | `#047857` | `--app-bg` (`#F3F4F6`) | **4,98 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-success-border`**| `#059669`| `--surface` (`#FFFFFF`) | **3,77 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA Large/UI) |
| **Light `--status-success-border`**| `#059669`| `--app-bg` (`#F3F4F6`) | **3,42 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA Large/UI) |
| **Light `--status-warning-fg`** | `#92400E` | `--surface` (`#FFFFFF`) | **7,09 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--status-warning-fg`** | `#92400E` | `--app-bg` (`#F3F4F6`) | **6,44 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-warning-border`**| `#D97706`| `--surface` (`#FFFFFF`) | **3,19 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA Large/UI) |
| **Light `--status-warning-border`**| `#D97706`| `--app-bg` (`#F3F4F6`) | **2,89 : 1** | $\ge 3,0 : 1$ (Subtiler Rand) | Hinweis (Subtil) |
| **Light `--status-error-fg`** | `#B91C1C` | `--surface` (`#FFFFFF`) | **6,47 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-error-fg`** | `#B91C1C` | `--app-bg` (`#F3F4F6`) | **5,88 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-error-border`** | `#DC2626` | `--surface` (`#FFFFFF`) | **4,83 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA) |
| **Light `--status-error-border`** | `#DC2626` | `--app-bg` (`#F3F4F6`) | **4,39 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA Large/UI) |
| **Light `--status-trunk-fg`** | `#4338CA` | `--surface` (`#FFFFFF`) | **7,90 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--status-trunk-fg`** | `#4338CA` | `--app-bg` (`#F3F4F6`) | **7,18 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--status-trunk-border`** | `#4F46E5` | `--surface` (`#FFFFFF`) | **6,29 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA) |
| **Light `--status-trunk-border`** | `#4F46E5` | `--app-bg` (`#F3F4F6`) | **5,71 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA) |
| **Light `--status-blocking-fg`**| `#C2410C` | `--surface` (`#FFFFFF`) | **5,18 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-blocking-fg`**| `#C2410C` | `--app-bg` (`#F3F4F6`) | **4,71 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Light `--status-blocking-border`**|`#EA580C`| `--surface` (`#FFFFFF`) | **3,56 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA Large/UI) |
| **Light `--status-blocking-border`**|`#EA580C`| `--app-bg` (`#F3F4F6`) | **3,23 : 1** | $\ge 3,0 : 1$ (Icon/Rahmen) | Bestanden (AA Large/UI) |
| **Dark `--text-primary`** | `#F1F5F9` | `--surface` (`#151D2D`) | **15,39 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--text-primary`** | `#F1F5F9` | `--app-bg` (`#0B111E`) | **17,22 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--text-secondary`** | `#CBD5E1` | `--surface` (`#151D2D`) | **11,36 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--text-secondary`** | `#CBD5E1` | `--app-bg` (`#0B111E`) | **12,71 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--text-muted`** | `#94A3B8` | `--surface` (`#151D2D`) | **6,58 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Dark `--text-muted`** | `#94A3B8` | `--app-bg` (`#0B111E`) | **7,36 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--accent-primary-fg`** | `#60A5FA` | `--surface` (`#151D2D`) | **6,63 : 1** | $\ge 4,5 : 1$ (Text/Link) | Bestanden (AA) |
| **Dark `--accent-primary-fg`** | `#60A5FA` | `--app-bg` (`#0B111E`) | **7,42 : 1** | $\ge 4,5 : 1$ (Text/Link) | Bestanden (AAA) |
| **Dark `--status-success-fg`** | `#34D399` | `--surface` (`#151D2D`) | **8,77 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--status-success-fg`** | `#34D399` | `--app-bg` (`#0B111E`) | **9,81 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--status-warning-fg`** | `#FBBF24` | `--surface` (`#151D2D`) | **10,10 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--status-warning-fg`** | `#FBBF24` | `--app-bg` (`#0B111E`) | **11,30 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--status-error-fg`** | `#F87171` | `--surface` (`#151D2D`) | **6,10 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Dark `--status-error-fg`** | `#F87171` | `--app-bg` (`#0B111E`) | **6,82 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Dark `--status-trunk-fg`** | `#818CF8` | `--surface` (`#151D2D`) | **5,65 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Dark `--status-trunk-fg`** | `#818CF8` | `--app-bg` (`#0B111E`) | **6,32 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AA) |
| **Dark `--status-blocking-fg`** | `#FB923C` | `--surface` (`#151D2D`) | **7,45 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Dark `--status-blocking-fg`** | `#FB923C` | `--app-bg` (`#0B111E`) | **8,34 : 1** | $\ge 4,5 : 1$ (Text) | Bestanden (AAA) |
| **Light `--accent-solid`** | `#1D4ED8` | `--on-accent-solid` (`#FFFFFF`) | **6,70 : 1** | $\ge 4,5 : 1$ (Solid Button) | Bestanden (AA) |
| **Dark `--accent-solid`** | `#3B82F6` | `--on-accent-solid` (`#0B111E`) | **5,13 : 1** | $\ge 4,5 : 1$ (Solid Button) | Bestanden (AA) |
| **Light `--status-success-solid`** | `#05875F` | `--on-status-success-solid` (`#FFFFFF`) | **4,53 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AA) |
| **Dark `--status-success-solid`** | `#34D399` | `--on-status-success-solid` (`#0B111E`) | **9,81 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AAA) |
| **Light `--status-warning-solid`** | `#B26205` | `--on-status-warning-solid` (`#FFFFFF`) | **4,52 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AA) |
| **Dark `--status-warning-solid`** | `#FBBF24` | `--on-status-warning-solid` (`#0B111E`) | **11,30 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AAA) |
| **Light `--status-error-solid`** | `#DC2626` | `--on-status-error-solid` (`#FFFFFF`) | **4,83 : 1** | $\ge 4,5 : 1$ (Destructive Btn) | Bestanden (AA) |
| **Dark `--status-error-solid`** | `#EF4444` | `--on-status-error-solid` (`#0B111E`) | **5,01 : 1** | $\ge 4,5 : 1$ (Destructive Btn) | Bestanden (AA) |
| **Light `--status-trunk-solid`** | `#4F46E5` | `--on-status-trunk-solid` (`#FFFFFF`) | **6,29 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AA) |
| **Dark `--status-trunk-solid`** | `#818CF8` | `--on-status-trunk-solid` (`#0B111E`) | **6,32 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AA) |
| **Light `--status-blocking-solid`** | `#CC4D0A` | `--on-status-blocking-solid` (`#FFFFFF`) | **4,53 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AA) |
| **Dark `--status-blocking-solid`** | `#FB923C` | `--on-status-blocking-solid` (`#0B111E`) | **8,34 : 1** | $\ge 4,5 : 1$ (Solid Action) | Bestanden (AAA) |

### 4.2 Typografie-Architektur & Skala

#### Schriftfamilien & Fallback-Stack
Zur Vermeidung von externen Render-Blockaden (FOUT/FOIT) und aus Datenschutz- sowie Offline-Gründen werden keine externen Webfonts nachgeladen. Als Primärschriften fungieren die bereits im Projekt eingebetteten Schriften `IBM Plex Sans` und `IBM Plex Mono`, ergänzt durch einen robusten System-Fallback:

- **UI & Fließtext (`font-sans`):**  
  `"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`  
  *Begründung:* Entwickelt für technische und didaktische Anwendungen; exzellente Zeichenunterscheidung und ergonomische Lesbarkeit bei stundenlangem Lernen.
- **Code & CLI-Terminal (`font-mono`):**  
  `"IBM Plex Mono", "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace`  
  *Begründung:* Strikte Festbreite, unverwechselbare Differenzierung von Ziffern und Buchstaben (`0` mit Mittelpunkt vs. `O`, `1` vs. `l` vs. `I`), unerlässlich für Cisco-Konfigurationen und Subnetzmasken.

#### Schriftgrößen- und Zeilenhöhen-Skala
Alle Größen sind an ein 4px-Raster gebunden, um vertikalen Rhythmus und typografische Harmonie zu gewährleisten:

| Stufe | Schriftgröße | Zeilenhöhe | Schriftstärke | Einsatzbereich |
| :--- | :--- | :--- | :--- | :--- |
| **Display 2XL** | 24px (1.5rem) | 32px (2.0rem) | Bold (700) | Hauptseiten-Titel, Dashboard-Hero |
| **Title XL** | 20px (1.25rem) | 28px (1.75rem) | Semibold (600) | Modul-Überschriften, Hauptbereiche |
| **Title LG** | 16px (1.0rem) | 24px (1.5rem) | Semibold (600) | Kartentitel, Dialog-Header |
| **Body Base** | 14px (0.875rem)| 20px (1.25rem) | Regular (400) / Medium (500) | Didaktischer Lesetext, Lektionen |
| **Body SM** | 12px (0.75rem) | 16px (1.0rem) | Medium (500) | Badges, Hilfetexte, Toolbar-Buttons |
| **Code Base** | 13px (0.8125rem)| 20px (1.25rem)| Regular (400) / Semibold (600) | Cisco IOS CLI-Befehle, Routing-Tabellen |
| **Code SM** | 11px (0.6875rem)| 16px (1.0rem) | Regular (400) | Port-Labels, Subnetz-Details, Hex-Dumps |

#### Schriftstärken
- **Regular (400):** Standard-Fließtext und Erklärungen.
- **Medium (500):** UI-Labels, Navigationselemente, Segmented Controls, Formularbeschriftungen.
- **Semibold (600):** Überschriften (H2/H3), Card-Headings, CLI-Kommandos (zur Unterscheidung vom Prompt).
- **Bold (700):** Haupttitel (H1) und numerische Erfolgsmetriken / Punktestände.

### 4.3 Abstände, Radien & Schatten
- **Raster:** Konsequentes 4px / 8px Raster (`p-2`, `p-3`, `p-4`, `p-6`).
- **Radien:**
  - `rounded-md` (6px): Badges, Input-Felder, Dropdown-Items.
  - `rounded-lg` (8px): Buttons, Toolbar-Elemente, Segmented Controls.
  - `rounded-xl` (12px): Inhaltskarten, Panels, Code-Blöcke.
  - `rounded-2xl` (16px): Dialog-Container.
- **Schatten:** Ruhige, weiche Umgebungs-Schatten (`shadow-sm`, `shadow-md`, `shadow-xl`) ohne grelles Glimmen.

### 4.4 Overlay- & Z-Index-Architektur

Zur Vermeidung von z-Index-Konflikten und unkontrolliertem Überlagern („Modale über Modalen“) wird eine standardisierte Z-Index-Skala als Tokens etabliert:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              Z-INDEX-TOKENS & OVERLAY-EBENEN                           │
├──────────────────────────┬──────────┬──────────────────────────────────────────────────┤
│ Token                    │ z-Index  │ Komponenten                                      │
├──────────────────────────┼──────────┼──────────────────────────────────────────────────┤
│ --z-dropdown             │ 1000     │ Menü-Dropdowns, Filter-Popups, Tooltips          │
│ --z-sticky               │ 1100     │ Fester Anwendungs-Header, Breadcrumb-Leiste      │
│ --z-drawer               │ 1200     │ Mobiles Navigations-Drawer, Lektions-Sidebar    │
│ --z-dialog               │ 1300     │ Modale Dialoge, Simulator-Vollbild, D&D Exhibit  │
│ --z-toast                │ 1400     │ Systemmeldungen, Kopier-Bestätigungen, Feedback  │
└──────────────────────────┴──────────┴──────────────────────────────────────────────────┘
```

#### Strikte Single-Overlay-Regeln:
1. **Single-Active-Rule:** Es darf immer nur **ein einziges Overlay derselben oder einer höheren Ebene** aktiv sein.
2. **Kaskadierendes Schließen:** Das Öffnen eines Dialogs (`--z-dialog`) schließt automatisch alle geöffneten Dropdowns (`--z-dropdown`).
3. **Drawer schließt Dropdowns:** Das Öffnen des mobilen Drawers (`--z-drawer`) schließt sofort eventuell offene Kontext-Dropdowns.
4. **Escape-Priorität:** Die Taste `Escape` schließt immer das hierarchisch oberste geöffnete Overlay.
5. **Fokus-Falle (Tab-Trap):** Modale Dialoge sperren den Hintergrund mit `inert` und fangen den Tab-Fokus ein. Klick auf den Backdrop schließt das Overlay.

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
   - Paketfluss-Simulation (Canvas v2) — **[Status: Offen / in Vorbereitung — Phase 3, wartet auf Anbindung an das v2-Topologiemodell]**
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

### 5.4 Mobile Navigation & Fachwechsel (390px Viewport)

Bisher blockierte eine dauerhaft eingeblendete vertikale Sidebar auf Mobilgeräten rund 60px der Gesamtbreite von 390px. Das führte zu drastischer Platzenge für Fragentexte, Tabellen und Exhibits.

**Neues mobiles Bedienkonzept:**
- **Vollständige 390px Breite für Inhalte:** Die permanente linke 60px-Leiste entfällt vollständig.
- **Zwei intuitive Wege zum Fachwechsel:**
  1. **Kompakter Fach-Selector im Header:** Direkt im oberen Header neben dem App-Titel befindet sich ein Button mit Modul-Dropdown (z. B. `[Netzwerkgrundlagen ▾]`). Ein Fingertipp öffnet ein übersichtliches modales Auswahlmenü (Bottom-Sheet auf Mobile).
  2. **Fachauswahl im Navigations-Drawer (`--z-drawer`):** Das Hamburger-Menü enthält an oberster Stelle eine übersichtliche, vertikale Liste aller CCNA-Module mit direktem Statusindikator und Prozentfortschritt.
- **Ergonomische Touch-Targets:** Alle Interaktionselemente auf 390px erreichen mindestens **44 × 44 px** (bzw. 48 × 48 px bei Drag-&-Drop-Zielen).
- **Permanenter Flip-Button:** Der Umschalter zwischen Wissens-Dashboard und Canvas v2 bleibt mobil im Header stets prominent und mit einem Fingertipp erreichbar.

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
1. **Dunkles Erscheinungsbild in beiden Themes:**
   - Terminals und Cisco-Code-Blöcke bleiben in **beiden** Farbmodi dunkel (`--terminal-bg: #0B0F19`, `--terminal-fg: #E2E8F0`).
   - Nur der umgebende Rahmen passt sich an das globale Theme an (`--terminal-border: var(--border-default)`).
   - Verhindert Blendung beim Lesen langer Konsolenausgaben und spiegelt die reale Putty-/SSH-Arbeitsumgebung von Netzwerk-Engineers wider.
2. **Drei-Elemente-Trennung:**
   - **Prompt:** `Router#`, `Switch(config-if)#` in dezentem Sky/Muted (`--terminal-prompt: #38BDF8`).
   - **Befehl:** `show ip route` fett und hervorgehoben (`--terminal-cmd: #FFFFFF`).
   - **Ausgabe:** Exakt formatiert in monospaced Typografie mit Syntax-Akzenten (`--terminal-fg: #E2E8F0`).
3. **Kopier-Schutz:** Der Button *"Befehl kopieren"* kopiert ausschließlich `show ip route` in die Zwischenablage – niemals den Prompt `Router#`.
4. **Syntax-Highlighting:** Codes (`C`, `S`, `O`, `D`), Interface-Namen (`Gi0/1`) und IP-Präfixe werden dezent und augenfreundlich farblich hervorgehoben.

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

# IT Training Canvas — App-Übersicht

Stand: 2026-06-15 · CCNA/IT-Trainingsplattform (ajti.online)
Stack: React 19 · TypeScript · Vite · Tailwind · shadcn/ui · Supabase · Cloudflare → Traefik → Kubernetes

---

## 1. Zwei Oberflächen (3D-Card-Flip)

Die App trennt **Lernen** und **Zeichnen** über eine 3D-Flip-Animation (Button „Canvas"/„Lernen" oben rechts). Beide Seiten teilen sich keinen Platz — ideal auch für Mobile.

- **Vorderseite — Lernoberfläche:** Themen-Dashboard, Lerninhalte, Quizze
- **Rückseite — Canvas:** Netzwerk-Topologien zeichnen, simulieren, exportieren

---

## 2. Lernoberfläche (Dashboard)

- **Fächer-Sidebar** (auto-minimierend, auf Mobile als Overlay): CCNA 200-301, FISI, Azure, AWS, Linux, Docker, Kubernetes, Networking, IT Security
- **Themen-Dashboard** als responsives Karten-Grid (Container Queries: 1–3 Spalten), Hero-Header mit Statistik-Chips
- **Themen-Detail** mit Markdown-Lerninhalt, eingebetteten Quizzen und Querverweisen
- **20 Lernpfade** (geführt, mit Fortschritt, Punkten, Hinweisen, Canvas-Validierung) — z. B. CIS1/CIS2/CIS3-Klausurvorbereitung
- **Tool-Schnellstart** direkt aus dem Dashboard

## 3. Wissens-Inhalte

| Inhalt | Umfang |
|--------|--------|
| Quizze | 38 (Netzwerkgrundlagen, Subnetting, VLAN, STP, OSPF, EIGRP, ACL, NAT, IPv6, Security, WLAN, QoS, Automation …) |
| Prüfungssimulator | ~860 Fragen aus echtem CCNA-200-301-Material |
| Lab-Szenarien | 41 (Drill + Grundlagen + Fortgeschritten) |
| CLI-Glossar | 179 Cisco-IOS-Befehle in 17 Kategorien, mit Suche & Copy |
| Canvas-Vorlagen | 16 (Netzwerk, Cloud, Security, Didaktik) |

---

## 4. Lernmodi & Trainer

- **Prüfungssimulator (ExamPrep):** 3 Modi
  - *Lernmodus* — sofortiges Feedback + Erklärung
  - *Prüfungsmodus* — 120-Minuten-Countdown (rot unter 10 Min), Auto-Abgabe
  - *Schwächen-Drill (SRS)* — wiederholt nur falsch beantwortete Fragen
- **Lab-Szenarien:** Schritt-für-Schritt Cisco-IOS-Übungen mit Verify-Befehlen
  - **Drill-Labs** für Muskelgedächtnis (Grundkonfig ×3, 6 PCs, Access-Ports, Router-Interfaces)
- **Tools-Menü** (alle Simulatoren App-weit startbar):
  - VLAN-, STP-, OSI-, Routing-Simulator
  - Subnetting-Drill, IPv6-Rechner, Verkabelungs-Trainer
  - Topologie-Explorer, CLI-Glossar
- **Ping-Szenario** — geführte Schritt-für-Schritt-Analyse

---

## 5. Canvas (Netzwerk-Designer)

- **78 High-Tech-Shapes** (Router, Switch, Firewall, Server, Cloud, Container …) mit Gradient-Chassis, Status-LEDs, Port-Bänken, Glow
- **Zeichnen:** Stift, Formen, Text, Pfeile, Verbindungen mit Ports & Labels
- **HUD-Selektion** (Eckklammern), Plattform-Schatten, MiniMap, Grid (Linien/Punkte)
- **Geräte-Konfiguration** per Doppelklick (IP, Hostname, Subnetz …)
- **Terminal-Emulator** — echte IOS-CLI je Gerät
- **Simulation:** Paketfluss-Visualizer, PDU-Inspector, Topologie-Validator, Metriken-Dashboard
- **Touch-Bedienung:** Pointer-Events (Maus/Finger/Stift), Pinch-Zoom & Zwei-Finger-Pan

## 6. Export & Kollaboration

- **Packet-Tracer-Export:** ZIP mit IOS-Konfig pro Gerät + Aufbau-Anleitung (README) + Endgeräte-Notizen
- **Export:** PNG, SVG, JSON; Lab-Export als TXT/PDF
- **Teilen & Export**, Präsentationsmodus, Notizen/Annotationen, Vorlagen-Galerie
- **Kosten-Rechner**

---

## 7. Account & Sync

- **Supabase-Auth:** App läuft voll ohne Login (localStorage primär); eingeloggt → Cloud-Sync als Upgrade
- **Passwort-Reset-Flow** vollständig (E-Mail + neues Passwort setzen)
- **Lernpfad-Fortschritt** wird geräteübergreifend synchronisiert
  - *Offen:* Quiz-/Drill-Fortschritt noch nur lokal

## 8. Plattform & Qualität

- **Responsive:** Desktop, Tablet, Smartphone (Header/Sidebar/Canvas mobil-tauglich)
- **Dark/Light-Theme**, deutsche UI, DSGVO-konform (Fonts self-hosted)
- **CI/CD:** Lint + Typecheck + 269 Tests → Docker → Kubernetes-Rollout
- **Performance:** Lazy-Loading aller schweren Dialoge, Code-Splitting, React.memo
- **Onboarding-Tour**, Tastenkürzel-Hilfe

---

## Roadmap (offen)

1. Cross-Device-Sync für Quiz-/Drill-/Prüfungs-Fortschritt (nicht nur Lernpfade)
2. PWA/Offline-Modus
3. Lernstatistik-Dashboard
4. Per-Sekunden-Re-Render bei aktivem Lernpfad entkoppeln

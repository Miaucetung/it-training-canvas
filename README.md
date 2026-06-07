# IT Training Canvas

**Interaktive Lernplattform für IT-Zertifizierungen** — CCNA 200-301 · AZ-900 · CompTIA Network+

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Coverage](https://img.shields.io/badge/coverage-96.8%25-brightgreen)
![CI](https://img.shields.io/github/actions/workflow/status/Miaucetung/it-training-canvas/ci.yml?label=CI)

---

## Was ist das?

Klassische Quiz-Apps testen Auswendiglernen. Diese App erklärt, simuliert und prüft — in einem Werkzeug.

Lernende ziehen Netzwerkgeräte auf ein Canvas, beobachten Pakete in Echtzeit, simulieren VLAN-Konfigurationen, lösen Subnetting-Aufgaben und schließen Quizze ab — alles verknüpft mit einem XP/Achievement-System, das Lernfortschritt sichtbar macht.

Gebaut als duales Projekt: eigene Prüfungsvorbereitung (IHK Fachinformatiker Systemintegration) und Portfolio-Demo für Dozenten- und Systemhaus-Stellen.

---

## Features

### 🗺️ Interaktiver Netzwerk-Canvas
- Geräte (Router, Switch, PC, Firewall, AP, Server) per Drag-and-Drop platzieren
- Verbindungen mit Typ, Geschwindigkeit, VLAN-Tag konfigurieren
- Topology-Templates laden (Basic LAN, OSPF Multi-Area, VLAN-Segmentierung u.a.)
- Export als JSON, PNG oder SVG

### 🔬 Simulatoren & Labs

| Simulator | Beschreibung |
|-----------|-------------|
| **Ping-Szenario** | Hop-by-Hop Paketanalyse mit VLAN-Check, Routing und Fehlerdiagnose |
| **Packet-Flow-Visualizer** | Animierter PDU-Fluss durch die Topologie |
| **OSI-Simulator** | Encapsulation/Decapsulation auf allen 7 Schichten |
| **Routing-Simulator** | OSPF Neighbor-States, DR/BDR-Wahl, Cost-Berechnung |
| **VLAN-Simulator** | Access/Trunk-Ports, Inter-VLAN-Routing, Voice-VLAN |
| **STP-Simulator** | Root-Bridge-Wahl, Port-States, RSTP-Konvergenz |
| **Subnetting-Drill** | Zeitgesteuerte VLSM-Aufgaben mit Schritt-für-Schritt-Lösung |
| **Terminal-Emulator** | IOS-CLI Syntax-Referenz mit Modus-Navigation |
| **Topologie-Explorer** | Referenz-Topologien für Enterprise, DC, SOHO |
| **PDU-Inspector** | Frame-/Paket-Header im Detail |

### 📚 Lernmodule
- **CCNA 200-301 v1.1** — 20 Topics, 696+ Quizfragen, Blueprint-aligned (August 2024)
- **AZ-900** — 10 Topics zu Azure-Fundamentals
- **CompTIA Network+ N10-009** — 5 Topics
- Geteilte Konzepte (`_shared/`) über Modulgrenzen hinweg (OSI, Subnetting, Encapsulation)
- Cross-References: CCNA-VLAN ↔ AZ-104-VNet-Subnet — Wissensübertragung explizit gemacht

### 🎮 Gamification-Engine
- XP für korrekte Antworten, Quiz-Abschluss, Topic-Completion
- 15 Achievements (inkl. Secret Achievements wie „Brückenbauer")
- Streak-System mit 30-Tage-History und Freeze-Mechanismus
- Level-Up-Events via eigenem Event-Bus
- Persistenz via `localStorage` mit Schema-Versionierung und Auto-Migration

### 🧪 Quiz-Engine
- Single-Choice, Multiple-Choice, True/False
- Shuffle-Modus, Zeitlimit, Passierschwelle konfigurierbar
- Jede Frage mit Erklärung — Lernender sieht *warum*, nicht nur richtig/falsch
- Prüfungssimulator (CCNA Exam-Format, 20 Q — Ausbau auf 100 Q geplant)

---

## Stack

| Layer | Technologie | Entscheidung |
|-------|-------------|--------------|
| UI | React 19 + TypeScript 5.7 | Concurrent Mode, strikte Typisierung |
| Build | Vite 7 + SWC | < 2 s HMR, schnelle Builds |
| Styling | Tailwind CSS 4 + shadcn/ui | Design-System ohne Custom-CSS-Overhead |
| Komponenten | Radix UI (Accessibility-Basis) | ARIA out-of-the-box |
| State | React State + localStorage | Kein Server → kein zusätzlicher State-Layer |
| Diagramme | @xyflow/react + D3 | Canvas-Rendering + flexible Layouts |
| Animation | Framer Motion + GSAP | Paket-Animationen im Simulator |
| Formulare | react-hook-form + Zod | Typsichere Validierung |
| Tests | Vitest + Testing Library | 96.8% Statement-Coverage (lib + content) |
| CI/CD | GitHub Actions → GHCR → K3s | Vollautomatisches Deployment |
| Infrastruktur | K3s auf Talos Linux Homelab | Kubernetes-Produktionserfahrung |
| Ingress | Cloudflare Tunnel | Kein öffentlicher Port, Zero-Trust |

---

## Architektur

Die App verwendet ein **Plugin-System** für Lernmodule:

```
src/
├── content/
│   ├── modules/           # Ein Ordner pro Zertifizierung
│   │   ├── ccna/          # Topics, Konzepte, Quizze, Gap-Plan
│   │   ├── az-900/
│   │   └── comptia-network-plus/
│   └── _shared/           # Geteilte Konzepte (OSI, Subnetting)
└── lib/
    ├── content/           # Registry, Loader, Adapter, Cross-References
    └── gamification/      # XP-Engine, Achievement-Engine, Streak, Event-Bus
```

**Prinzip:** Ein neues Modul = ein neuer Ordner + eine Zeile in `content-loader.ts`. Keine Core-Änderungen nötig.

**Adapter-Pattern:** `adapters.ts` übersetzt `CertificationModule` → Legacy-Quiz/LearningPath-Typen.

**ContentProvider-Interface:** Alle Modul-Daten liegen hinter einem Interface — der Wechsel von lokalen TS-Dateien zu einem CMS/Supabase-Backend erfordert keine Komponentenänderungen.

→ Details: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## Lokales Setup

```bash
# Node.js 20+ erforderlich
git clone https://github.com/Miaucetung/it-training-canvas.git
cd it-training-canvas
npm install
npm run dev              # http://localhost:5173
npm test                 # Vitest Unit-Tests
npm run test:coverage    # Coverage-Report nach coverage/
npm run build            # Produktions-Build nach dist/
```

---

## CI/CD & Deployment

```
git push → GitHub Actions (CI: build + test)
                  ↓ [main only]
           Docker Build → GHCR (ghcr.io/miaucetung/it-training-canvas:main)
                  ↓
           kubectl apply -k k8s/base/
           kubectl rollout restart deployment/it-training-canvas -n apps
```

- Kubernetes-Deployment mit Liveness/Readiness-Probes und Resource-Limits
- Cloudflare Tunnel als Ingress — kein öffentlich exponierter Port
- Rollback durch Image-Tag-Wechsel im Deployment-Manifest

---

## Test-Coverage

```
Statements : 96.82%  (580/599)
Branches   : 93.03%  (187/201)
Functions  : 91.42%   (96/105)
Lines      : 97.43%  (531/545)
```

Abgedeckt: Gamification-Engine (XP, Achievement, Streak), Content-Registry, Adapter, Cross-References, Validatoren.

---

## Aktueller Stand & Roadmap

**CCNA-Inhalte (Blueprint 200-301 v1.1):**

| Section | Topics | Quiz-Q | Status |
|---------|--------|--------|--------|
| 1.0 Network Fundamentals | vollständig | 85+ Q | ✅ |
| 2.0 Network Access | VLAN/Switching ohne Quiz | 9 Q | ⚠️ Ausbau |
| 3.0 IP Connectivity | OSPF begonnen | 16 Q | ⚠️ Ausbau |
| 4.0 IP Services | vollständig | 30+ Q | ✅ |
| 5.0 Security Fundamentals | vollständig | 34 Q | ✅ |
| 6.0 Automation | vollständig | 16 Q | ✅ |
| Exam-Simulator | 20/100 Fragen | 20 Q | ❌ geplant |

**Nächste Schritte:**
- [ ] Section 2.0: STP/RSTP Quiz + Switching-Quizze (+38 Q)
- [ ] Section 3.0: OSPF Single-Area vollständig (+12 Q, +3 Konzepte)
- [ ] Section 5.0: 802.1X + Security Program Elements (+16 Q)
- [ ] Exam-Simulator auf 100 Fragen erweitern
- [ ] Auth/Backend (Supabase) für geräteübergreifende Persistenz

---

## Hintergrund

Entwickelt von einem Fachinformatiker-Umschüler am CBW Frankfurt als Begleitung zur eigenen CCNA-Prüfungsvorbereitung. Das Projekt demonstriert produktionsnahe Frontend-Architektur, DevOps-Praxis und Fachkompetenz in Netzwerkthemen.

---

## Lizenz

MIT — Details in [`LICENSE`](./LICENSE)

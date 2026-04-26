# INVENTORY.md

## 1. App-Identität

- **App-Name:** spark-template (vermutlich IT-Training-Canvas)
- **Kurzbeschreibung:** Interaktive Web-App zum Erstellen, Simulieren und Lernen mit Netzwerkdiagrammen. Zielgruppe: IT-Ausbildung, Fachinformatiker, CCNA-Vorbereitung.
- **Aktueller Status:** In Entwicklung
- **Geschätzter Reifegrad:** 6/10

## 2. Tech-Stack

- **Framework:** React 19, Vite 7
- **Sprache:** TypeScript
- **Styling:** TailwindCSS 4, Custom Theme
- **UI-Library:** shadcn/ui, Radix UI, Lucide/Phosphor/Heroicons
- **State Management:** React State, useLocalStorage
- **Datenbank/ORM:** Keine (nur LocalStorage)
- **Auth-Lösung:** Keine echte Auth, nur lokale User-Objekte
- **Payment:** Nicht vorhanden
- **Hosting/Deployment:** Vite/Static, vermutlich Cloud/Container
- **Top 10 Dependencies:**
  - @github/spark: UI/Infra-Toolkit
  - @radix-ui/\*: UI-Komponenten
  - @tailwindcss/\*: Styling
  - @tanstack/react-query: Data-Fetching
  - d3: Diagramme
  - framer-motion: Animationen
  - zod: Validation
  - react-hook-form: Forms
  - lucide-react, @phosphor-icons/react, @heroicons/react: Icons
  - sonner: Toaster/Notifications

## 3. Feature-Inventar

### Vorhandene Features

- Netzwerkdiagramm-Canvas (Canvas.tsx)
- Komponenten/Shapes platzieren, verbinden (ShapePicker, Canvas, ConnectionPropertiesPanel)
- Simulation von Netzwerken (SimulationControls, network-simulator)
- Quiz/Prüfung (QuizDialog, ccna-quiz-content)
- Lernpfad/Progress-Tracking (LearningPathEditor, ProgressTracker)
- Kollaboration (collaboration-engine)
- Export/Import (ShareExportDialog, canvas-utils)
- MiniMap, Toolbar, Sidebar, Templates

### Auth & User-Management

- Registrierung: nein
- Login: nein
- User-Profil: nein (nur lokale User-Objekte)
- Rollen/Berechtigungen: nein (nur Session-Permissions)

### Lern-/Didaktik-Features

- XP-System: nein
- Streaks: nein
- Achievements/Badges: nein
- Spaced Repetition: nein
- Schwächenanalyse: nein
- Fortschritts-Tracking: ja (ProgressTracker)
- Exam Readiness: ja (QuizDialog)
- Sonstige: Hints, Validierungsschritte, Lernpfade

### Content-Management

- Inhalte: Hardcoded in TypeScript (default-learning-content, ccna-quiz-content)
- Admin-Interface: nein

### Payment / Buchung

- Vorhanden: nein

## 4. Code-Struktur

- **Ordnerstruktur (2 Ebenen):**
  - src/
    - components/
    - hooks/
    - lib/
    - styles/
    - components/ui/
  - public/
  - dist/
  - k8s/
- **Dateien grob:**
  - Komponenten: >40
  - Lib/Utils: >10
  - Keine API-Routes, keine /pages oder /app
- **Architektur:**
  - React-Komponenten, keine Next.js-Router
  - Client Components, keine Server Components
  - Modular, aber viele Features in src/components und src/lib

## 5. Code-Qualität

- TypeScript strict: Teilweise (strictNullChecks, aber kein strict)
- ESLint: ja (eslint, eslint-plugin-react-hooks)
- Prettier: nein
- Tests: nein
- Code-Smells: Sehr große Komponenten, viel Logik in Komponenten, wenig Trennung, keine Tests, viele hardcodierte Inhalte
- TODOs/FIXMEs: Keine auffälligen gefunden

## 6. Schmerzpunkte & Lücken

- Keine Authentifizierung, kein User-Management
- Kein Backend, keine Persistenz außer LocalStorage
- Keine Tests, keine Prettier-Formatierung
- Inhalte hardcodiert, kein CMS/Admin
- Keine Payment-Integration
- Komponenten teils sehr groß und unübersichtlich

## 7. Wiederverwendbares

- Kollaborations-Engine (collaboration-engine)
- Netzwerk-Simulator (network-simulator)
- Quiz-/Lernpfad-Logik
- UI-Komponenten (shadcn/ui, eigene Dialoge, Toolbar, Sidebar)

## 8. Offene Fragen / Unklarheiten

- Wie sollen Inhalte langfristig gepflegt werden?
- Ist Multi-User/Backend geplant?
- Wie sieht die Roadmap für Auth, Payment, Admin aus?
- Wer nutzt die App aktuell produktiv?

_Ehrliche Bestandsaufnahme, Stand Code-Review April 2026._

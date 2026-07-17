# IT Training Canvas

## 1. Was ist das

Ein interaktiver Lern-Trainer für IT-Zertifizierungen: Netzwerkdiagramme auf einem Canvas zeichnen, Simulatoren (VLAN, STP, OSPF, Subnetting) durchspielen und Quizfragen beantworten. Abgedeckt sind drei Zertifizierungsbereiche (`src/content/modules/`): **CCNA 200-301** (20 Topics), **AZ-900** (10 Topics), **CompTIA Network+ N10-009** (5 Topics). Zusätzlich gibt es zwei eigenständige CCNA-Fragenpools außerhalb des Topic-Systems (siehe Abschnitt 4).

## 2. Tech-Stack

- React 19, TypeScript 5.7
- Vite 7 (Build/Dev-Server)
- Tailwind CSS 4, Radix UI (shadcn/ui-Pattern), Phosphor Icons
- Supabase (`@supabase/supabase-js` 2.108) — Auth + Progress-Sync
- Zod 3 — Validierung
- Vitest 4 + Testing Library — Tests

## 3. Architektur-Überblick

**`src/`-Struktur:**

| Ordner | Zweck |
|---|---|
| `components/` | UI-Komponenten. Größere Features (Dialoge/Simulatoren) sind lazy-loaded |
| `lib/` | Geschäftslogik: Content-System (`lib/content/`), Adapter für die CCNA-Fragenpools, Simulator-Engines, Supabase-Client |
| `data/` | Statische Fragenpool-Daten (`ccnaQuestions.ts`, `ccnaQuestionsClassified.ts`) |
| `content/modules/` | Lerninhalte pro Zertifizierung (Topics, Konzepte, Quizze) — Plugin-System, Details in [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| `hooks/` | React-Hooks, u. a. `useLearningState`, `useAuth`, `useProgressSync` |
| `tools/` | Einzelne, eigenständig lazy-geladene Lernwerkzeuge |
| `types/` | Geteilte TS-Typen außerhalb von `lib/types.ts` (z. B. `exhibit.ts`) |
| `__tests__/` | Tests, grob nach Bereich gespiegelt (`lib/`, `components/`, `content/`, `gamification/` — letzteres jetzt archiviert) |

**State-Management:** Kein globaler Store. Lokaler React-State plus `useLocalStorage`-Hook für Persistenz (Canvas-Zustand, Lernfortschritt, Quiz-Schwächelisten). Ist ein Nutzer eingeloggt, synct `useProgressSync` zusätzlich gegen Supabase: beim Sign-in Merge (Remote gewinnt bei Konflikten, rein lokale Daten werden hochgeladen), danach debounced Push (2 s) bei jeder Änderung. Nicht jeder localStorage-Key wird gesynct — siehe Abschnitt 4.

**Code-Splitting:** Schwere Dialoge (Simulatoren, Prüfungsvorbereitung) werden per `React.lazy(() => import(...))` geladen, jeder wird ein eigener Build-Chunk (z. B. `ExamPrepDialog` ~679 kB, `PrioritizedLearningDialog` ~717 kB) und lädt erst beim Öffnen — hält den initialen Bundle klein.

## 4. CCNA-Fragenpool-System

Es gibt **zwei parallele, unabhängige Datenquellen** für CCNA-Fragen — das ist die Stelle, die am ehesten verwirrt:

| | `ccnaQuestions.ts` | `ccnaQuestionsClassified.ts` |
|---|---|---|
| Fragen | 1078 | 1047 |
| Herkunft | Basis-Extraktion aus dem CCNA-200-301-PDF | **Autogeneriert** aus einem externen Tool |
| Inhalt | Rohe Fragen, Text-Heuristik-Kategorisierung | Nach CCNA-200-301-v1.1-Blueprint klassifiziert (Domain + Subsection + Prüfungsgewichtung), gefiltert auf in-scope + beantwortbar |
| Genutzt von | `ExamPrepDialog` (über `lib/ccna-exam-pool.ts`) | `PrioritizedLearningDialog` (über `lib/ccna-classified-pool.ts`) |
| Fortschritt (`localStorage`) | `ccna-exam-weak-questions` (Supabase-gesynct) | `ccna-classified-weak-questions` (nur lokal) |

`ccnaQuestionsClassified.ts` trägt einen Header-Kommentar mit dem Source-Commit-Hash aus dem separaten Repo [`ccna-classifier`](https://github.com/Miaucetung/ccna-classifier), das die Klassifikation per LLM gegen das Blueprint durchführt und diese Datei bei jedem Lauf neu emittiert.

**Wichtig:** Änderungen am priorisierten Pool gehören ins `ccna-classifier`-Repo, **nicht** direkt in `ccnaQuestionsClassified.ts` — die Datei wird beim nächsten Emit überschrieben.

## 5. Bekannte Design-Entscheidungen / Altlasten

- **`_archive/gamification/`**: Ein XP/Achievement/Streak-System wurde gebaut, aber nie an eine sichtbare UI-Komponente angebunden (Event-Bus lief ins Leere). Archiviert statt gelöscht, falls das Feature später aufgegriffen wird — siehe `_archive/gamification/README.md` zur Reaktivierung.
- **Gemischte Zeilenenden**: Historisch CRLF/LF je nach Datei (kein `.gitattributes` vorhanden). Seit Einführung von `.gitattributes` (`* text=auto`) ist das für neue Dateien konsistent; bestehende Dateien wurden bewusst nicht angefasst, um unnötig große Diffs zu vermeiden.
- **`notes/ccna-exam/images/`**: Liegt nur lokal (nicht in Git getrackt). Rohe Exhibit-SVGs/PNGs aus der PDF-Extraktion, mittlerweile durch strukturierte Exhibit-Daten in den `ccnaQuestions*.ts`-Dateien ersetzt — bei Bedarf für manuelle Nacharbeit an einzelnen Exhibits vorhanden.

## 6. Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest
npm run build    # Produktions-Build nach dist/
```

**Environment:** `src/lib/supabase.ts` erwartet `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` (z. B. in `.env.local`). Es existiert aktuell **keine** `.env.example` im Repo — Werte müssen von einem bestehenden Supabase-Projekt bezogen oder ein eigenes Projekt aufgesetzt werden.

## 7. Wo ist was

```
src/
├── components/        UI-Komponenten (Dialoge, Simulatoren, Canvas)
├── lib/
│   ├── content/        Content-Registry/Loader/Adapter für Lernmodule
│   └── gamification/   entfernt, siehe _archive/gamification/
├── data/               CCNA-Fragenpool-Rohdaten (siehe Abschnitt 4)
├── content/modules/    Lerninhalte pro Zertifizierung (CCNA/AZ-900/CompTIA)
├── hooks/              React-Hooks (Auth, Lernfortschritt, Progress-Sync)
├── tools/              Einzelne lazy-geladene Lernwerkzeuge
├── types/              Geteilte TS-Typen
└── __tests__/          Tests

_archive/gamification/  archiviertes, nie verdrahtetes Gamification-System
notes/ccna-exam/        Original-PDF-Extraktion, Exhibit-Rohmaterial (nicht getrackt)
docs/, ANLEITUNG.md      Nutzer-/Zusatzdokumentation (nicht Teil dieser Architektur-README)
ARCHITECTURE.md          Details zum Content-Modul-Plugin-System
```

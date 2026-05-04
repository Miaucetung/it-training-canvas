# Canvas-Modul — Audit & Verbesserungs-Prompt

> Erstellt: 2. Mai 2026
> Repo: `it-training-canvas-new` · Branch `main`
> Methodik: gründliche Code-Analyse aller Canvas-relevanten Dateien

---

## TEIL 1 — Audit (Kurzfassung)

### Architektur-Überblick

- **`Canvas.tsx`** (~1500 Zeilen) hostet HTML5-Canvas + alle Mouse/Wheel-Events; lokaler State für Drawing/Selection/Resize/Pan/Zoom.
- **`App.tsx`** (~2200 Zeilen) ist State-Hub für Canvas-State, 15+ UI-Panel-Flags, Persistierung via `useLocalStorage`.
- Satelliten: `FloatingToolbar`, `SelectionToolbar`, `CanvasContextMenu`, `MiniMap`, `AnnotationLayer`, `TemplateGallery`, `PacketFlowVisualizer`, `PDUInspector`, `ShapePropertiesPanel`, `ConnectionPropertiesPanel`.
- Datenmodell: `DrawingObject` (Tool-typed), `CanvasConnection` (mit Compatibility-Matrix), `CanvasTemplate`.
- Render-Pipeline: React-State → großes `useEffect`-`redraw()` → imperative Canvas-Ops in World-Koordinaten (Pan-Offset + Scale).

### Stärken

- Solides Type-System für Shapes/Connections, Compatibility-Matrix in `connection-compatibility.ts`.
- **Echte Netzwerk-Logik** (`networking-engine.ts`): IP/CIDR-Berechnung, ARP, ICMP, TTL, Hop-by-Hop — nicht nur Visuals.
- PDU-Inspector zeigt OSI-Layer mit echten Daten (Src/Dst MAC+IP, TTL, Header-Felder).
- Snap-to-Grid + Snap-to-Shape, Multi-Selection, Gruppen, Layer (background/default/foreground).
- Klares Theme-Konzept (light/dark) mit konsistenter Farbgebung.
- Templates-System mit Built-in + Custom + Suchen/Filtern; jetzt zusätzlich didaktische Kategorie.

### Risiken / Schwächen

| Bereich            | Befund                                                                   | Datei:Zeile                       |
| ------------------ | ------------------------------------------------------------------------ | --------------------------------- |
| **Performance**    | Monolithischer `useEffect`-Redraw, kein RAF-Loop, keine Viewport-Culling | `Canvas.tsx` ~186-217             |
| **Architektur**    | `App.tsx` monolithisch, Prop-Drilling über 5 Ebenen, kein Store          | `App.tsx` ~180-2200               |
| **Undo/Redo**      | History speichert nur `objects[]`, keine `connections[]`                 | `App.tsx` ~430-470                |
| **Type-Safety**    | `properties?: Record<string, any>`, Casts wie `as PortPosition`          | `types.ts` ~95, `Canvas.tsx` ~593 |
| **A11y**           | Keine ARIA, kein Focus-Mgmt, Canvas nicht für Screen-Reader              | global                            |
| **Mobile**         | Keine Touch-Events, kein Pinch-Zoom, Toolbar zu breit                    | `Canvas.tsx` global               |
| **Tests**          | Canvas-spezifische Tests fast 0; kein Networking-Engine-Test             | `__tests__/`                      |
| **Memory**         | `svgImageCache: Map<string, HTMLImageElement>` ohne Eviction             | `canvas-utils.ts` ~7              |
| **Error-Handling** | Keine ErrorBoundary, JSON-Import ohne Schema-Check                       | `App.tsx` ~544                    |
| **Didaktik**       | Packet-Trace nur Auto-Play, kein Step-Mode, kein Replay                  | `PacketFlowVisualizer.tsx`        |

### Top-Priorisierte Verbesserungen

**P1 (Kritisch):** RAF-basiertes Rendering · Undo/Redo inkl. Connections · Zod-Validation für Import · ErrorBoundary · LRU-Cache für SVGs.
**P2 (Wichtig):** State-Store (Zustand/Context) · Touch+Pinch-Support · Step-by-Step Packet-Trace · Keyboard-/ARIA-Navigation · Canvas-Tests.
**P3 (Schön zu haben):** Group-Properties-Editor · Annotation-Lock für Lehrkräfte · Template-Thumbnails · QoS-Simulation · WebSocket-Live-Collaboration.

### Didaktische Bewertung

| Lernziel               | Aktuelle Unterstützung                                   |
| ---------------------- | -------------------------------------------------------- |
| Topologie-Design       | ⭐⭐⭐⭐ (Drag&Drop, IT-Shapes, Connections)             |
| Routing nachvollziehen | ⭐⭐⭐⭐ (Packet-Trace, aber ohne Step-Mode)             |
| OSI-Modell             | ⭐⭐⭐⭐ (PDU-Inspector + neue OSI-Vorlage)              |
| IP-Subnetting          | ⭐⭐⭐ (deklarativ, kein interaktiver Rechner im Canvas) |
| Firewall-/ACL-Regeln   | ⭐⭐ (im Modell vorhanden, kein UI-Editor)               |
| Cloud-Architektur      | ⭐⭐⭐ (Shapes vorhanden, keine Cloud-Simulation)        |

---

## TEIL 2 — Prompt zur Übertragung in die Azure-App

Den folgenden Block kannst du direkt in der Azure-App-Variante (Copilot, Spark, Codespaces o. ä.) verwenden:

```text
ROLLE
Du bist Senior-Frontend/-Didaktik-Engineer. Du verbesserst das bestehende Canvas-Lehrmodul
einer IT-Trainings-Webapp (React + TypeScript + Vite + Tailwind, HTML5-Canvas mit
imperativem Rendering, world↔screen-Transform, DrawingObject/CanvasConnection-Modell,
Templates-Galerie, Packet-Flow-Simulator und PDU-Inspector).

ZIEL
Hebe das Canvas-Modul von "produktionsreif für <500 Objekte, Desktop, Einzelnutzer"
auf "skalierbar für Klassen, Tablet-tauglich, didaktisch geführt". Lehrkräfte sollen
Theorie ohne Folien direkt im Canvas erklären können; Lernende sollen Schritt für Schritt
beobachten, anhalten und annotieren können.

KONTEXT (aus dem Audit)
- Canvas.tsx (~1500 LOC) und App.tsx (~2200 LOC) sind monolithisch; State per Prop-Drilling.
- Render erfolgt via useEffect mit großer Dependency-Liste, kein requestAnimationFrame.
- Undo/Redo speichert nur objects[], nicht connections[].
- Keine Touch-/Pinch-Events; keine ARIA/Tab-Order.
- SVG-Image-Cache ohne Eviction; ImportFromJSON ohne Schema-Validierung.
- Templates werden jetzt am Viewport platziert und als Gruppe verschiebbar
  (groupId pro Vorlage, sichtbarer ✥-Anker), aber Step-by-Step-Modus fehlt.
- Echte Netzwerk-Logik (IP/CIDR/ARP/ICMP/TTL) ist da, wird aber nur einmalig vor der
  Animation berechnet — kein Pause/Replay.

AUFTRAG (in Reihenfolge bearbeiten, jeweils mit Tests + Commit + kurzer Bedienungs-Notiz)

1) RENDER-LOOP STABILISIEREN
   - Redraw auf requestAnimationFrame umstellen (Dirty-Flag-Pattern).
   - Off-Screen-Objekte vor dem Zeichnen filtern (Viewport-Culling mit AABB-Test).
   - SVG-Image-Cache durch LRU-Cache (max. 100 Einträge) ersetzen.

2) HISTORY VOLLSTÄNDIG MACHEN
   - History-Eintrag = { objects, connections }.
   - Undo/Redo, Save/Load und Template-Apply müssen weiter funktionieren.
   - Tests für Roundtrip add → undo → redo.

3) DEFENSIVE EINGABEN
   - Zod-Schema für DrawingObject, CanvasConnection und CanvasTemplate.
   - importFromJSON/Template-Apply läuft durch das Schema; bei Fehler Toast + Abbruch,
     keine Mutation des States.
   - <CanvasErrorBoundary> um <Canvas/>; Fallback-UI mit "Zurücksetzen"-Button.

4) STORE-EXTRAKTION
   - Zustand- oder Context-Store mit zwei Slices: canvas (objects, connections,
     selection, viewport) und ui (Panel-Flags, Tool-Settings).
   - App.tsx auf <500 LOC reduzieren, indem Panels eigenen Store-Zugriff bekommen.
   - Keine Verhaltensänderung nach außen, nur Strukturwechsel.

5) MOBILE / TABLET
   - touchstart/move/end + 2-Finger-Pinch-Zoom + 2-Finger-Pan.
   - Long-Press = Kontextmenü.
   - FloatingToolbar: Overflow-Gruppen ("Mehr…"-Popover) bei <768 px.

6) DIDAKTISCHE STEUERUNG
   - PacketFlowVisualizer: Step-Mode mit Buttons Prev/Pause/Next; pro Schritt
     Erklärtext (Hop-Beschreibung, Header-Diff zum Vorhop) und visuelles Highlight
     auf der betroffenen Connection.
   - "Lehrer-Modus": optionaler Schalter, der Annotationen lockt
     (annotation.locked = true → andere Nutzer dürfen nur replyen, nicht löschen).
   - Replay-Button: gespeicherter Trace kann erneut abgespielt werden.

7) DIDAKTISCHE INHALTE ERWEITERN
   - Mindestens 4 weitere Vorlagen in der Kategorie "Didaktik / Lehrkonzept":
     • TCP-Flow-Control (Sliding-Window, Cumulative ACK)
     • NAT/PAT (Inside Local/Global)
     • VLAN + Trunking + 802.1Q-Tag
     • Routing-Entscheidung (Longest Prefix Match)
   - Jede Vorlage: ✥-Anker, Begleittexte direkt im Canvas, didaktischer Spannungsbogen
     (Frage → Beobachtung → Erklärung → Praxis-Tipp). Keine reinen Topologie-Bilder.

8) ACCESSIBILITY & KEYBOARD
   - Tab-Order über alle interaktiven Elemente; Canvas-Wrapper bekommt tabIndex=0.
   - Sichtbarer Fokus-Ring (Tailwind ring-2 ring-offset-2).
   - prefers-reduced-motion: Animationen einfrieren, Step-Mode bleibt nutzbar.
   - Aria-Labels auf allen Toolbar-Buttons.

9) TESTS
   - Vitest: Hit-Testing, Resize-Handle-Logik, Group-Drag, History-Roundtrip,
     Template-Apply mit Viewport-Offset, Networking-Engine (IP-Range, Subnet-Match,
     ARP-Antwort), Zod-Schemas.
   - Mindestens 30 zusätzliche Tests; Linie/Branch-Coverage Canvas-Modul ≥ 60 %.

10) DOKUMENTATION
    - ARCHITECTURE.md aktualisieren: Render-Loop, Store-Slices, Coord-Modell, Templates.
    - SHORTCUTS-Dialog ergänzt um Touch-Gesten.
    - "Dozenten-Quickstart" als eigene didaktische Vorlage (1 Canvas-Tafel).

NICHT-ZIELE
- Kein Backend/Cloud-Live-Collab in dieser Iteration (vorbereiten via Store-API,
  aber kein WebSocket-Server).
- Keine grafische Überarbeitung der Marke; bestehendes Theme bleibt.

QUALITÄTS-GUARDRAILS
- Jeder Schritt eigener Commit mit aussagekräftiger Message.
- Tests laufen nach jedem Schritt vollständig grün.
- TypeScript strict, keine neuen any.
- Keine destruktiven Aktionen ohne explizite Bestätigung.
- Wo mehrere Wege möglich sind: kürzeste Lösung mit klarstem Vertrag wählen.

AUSGABE-ERWARTUNG
- Pro Schritt: kurze Liste der geänderten Dateien, Commit-Message-Vorschlag,
  Test-Ergebnis (passed/total), Bedienungs-Hinweis für Lehrkräfte.
- Am Ende: Changelog der gesamten Iteration und drei offene Punkte für die nächste
  Iteration (z. B. WebSocket-Sync, KI-Tutor, Cloud-Speicher).
```

---

## TEIL 3 — Zusatz-Prompt: Vercel-Deployment-Sicherheit

Direkt **an den Prompt aus Teil 2 anhängen**, damit jede Iteration ohne Deployment-Schmerzen durch Vercel läuft (das Repo wird per Git-Import von Vercel gebaut).

```text
DEPLOYMENT-RAHMEN (gilt zusätzlich zu allem oben)

Plattform
- Hosting: Vercel, importiert direkt aus dem Git-Repo (Branch main = Production,
  jeder andere Branch = Preview-Deployment).
- Bundler: Vite. Vercel erkennt das automatisch, Build-Output bleibt "dist".
- Kein Server-Side-Rendering, kein Next.js, kein Edge-Function-Code in dieser Iteration.
- Tests laufen NICHT auf Vercel — Build kann grün sein, obwohl Tests rot sind.
  Deshalb: lokal jeder Commit zwingend mit `npx vitest run` validieren, bevor gepusht wird.

HARTE REGELN

1) Build muss reproduzierbar sein
   - Nach jeder Iteration einmal lokal sauber durchspielen:
       npm ci
       npm run build
       npx vitest run
     Erst wenn alle drei grün sind, pushen.
   - package-lock.json IMMER committen, bei jeder Dependency-Änderung.
   - Niemals --legacy-peer-deps oder --force in den Install-Command schreiben.

2) Keine SSR-/Node-only-Imports im Client-Code
   - Verboten: `import fs from "node:fs"`, `path`, `child_process`, `crypto` (Node-Variante),
     `process.env.*` außerhalb von import.meta.env.
   - localStorage / window / document / requestAnimationFrame nur in
     Komponenten oder Hooks, die ausschließlich im Browser laufen — kein Top-Level-Zugriff
     beim Modul-Import.
   - matchMedia (z. B. `prefers-reduced-motion`) hinter typeof window-Check oder
     useEffect kapseln.

3) Dependencies sauber klassifizieren
   - Alles, was zur Laufzeit im Browser gebraucht wird (zod, zustand, neue Radix-Komponenten):
     in dependencies, NICHT devDependencies.
   - Test-/Build-Tools (vitest, @types/*, eslint-plugins) in devDependencies.
   - Native/optional Module ohne Browser-Support (`canvas` von npm, `sharp`, `puppeteer`)
     bleiben verboten — wir nutzen nur den Browser-HTMLCanvas.

4) Pfade und Aliase
   - Alle neuen Imports über @/-Alias (siehe vite.config.ts + tsconfig.json).
   - Datei- und Ordnernamen exakt case-korrekt verwenden — Linux-Build auf Vercel
     bricht bei Groß/Klein-Mismatches, Windows lokal nicht.
   - Keine Imports aus notes/, coverage/, k8s/ oder anderen Nicht-Source-Ordnern.

5) Bundle-Größe disziplinieren
   - Große, optionale Module dynamisch laden:
       const TemplateGallery = lazy(() => import("@/components/TemplateGallery"));
       const PDUInspector    = lazy(() => import("@/components/PDUInspector"));
   - BUILT_IN_TEMPLATES bei >20 Vorlagen in src/content/templates/* aufsplitten und
     je Kategorie lazy importieren.
   - Vite-Build-Output beobachten: einzelne Chunks sollen <500 kB bleiben.
     Bei Warnung in der Iteration nachbessern, nicht ignorieren.

6) Routing & SPA-Fallback
   - Falls neue Routen eingeführt werden (React Router): vercel.json im Repo-Root
     mit:
       { "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ] }
   - public/_headers und public/_redirects sind Netlify-Format und werden von Vercel
     ignoriert. Wenn Header/Redirects nötig sind: nach vercel.json migrieren
     (Beispiel CSP/HSTS bewusst dort, nicht in Meta-Tags).

7) Environment-Variablen
   - Variablen, die im Client sichtbar sein dürfen, mit VITE_-Prefix
     (z. B. VITE_COLLAB_URL).
   - Variablen ohne Prefix sind im Browser nicht erreichbar — nicht versuchen,
     darauf zuzugreifen.
   - Keine Secrets ins Repo, auch nicht in runtime.config.json oder spark.meta.json.
   - Wenn neue Env-Variablen eingeführt werden: README/DEVELOPER.md ergänzen
     (Name, Zweck, Default).

8) Asset-Handling
   - Statische Dateien gehören nach public/, Referenz mit absoluter URL ab Root
     (`/img/foo.svg`, nie `./img/...`).
   - Inline-SVG in shapes.ts beibehalten — funktioniert auf Vercel ohne weitere Konfiguration.
   - Keine Git-LFS-Dateien einführen; Thumbnails (z. B. für Templates) als Base64
     ins Template-Objekt einbetten oder beim Build aus dem Canvas erzeugen.

9) PWA / Service-Worker
   - In dieser Iteration KEIN Service-Worker, der index.html cached. Sonst sehen
     Schüler nach Updates die alte Version, Lehrkräfte können nicht zuverlässig live
     erklären. Falls Offline-Support: ausschließlich statische Assets cachen,
     index.html immer "network-first".

10) CI für Tests (separat zu Vercel)
    - .github/workflows/ci.yml einrichten, die npm ci + npm run build + npx vitest run
      bei jedem Push und PR ausführt.
    - PRs erst mergen, wenn diese Workflow grün ist (Branch-Protection-Hinweis im
      Iterations-Changelog vermerken).
    - Vercel-Build allein reicht NICHT als Qualitäts-Gate.

ARBEITSWEISE PRO ITERATION

Schritt-Reihenfolge
  1. Feature-Branch erstellen (feat/... oder fix/...).
  2. Implementierung gemäß Auftrag aus Teil 2.
  3. Lokal: npm run build + npx vitest run + manueller Smoke-Test im Vite-Dev.
  4. Push → Vercel baut Preview-URL.
  5. Preview-URL manuell in echtem Browser prüfen, insbesondere:
       - Touch/Pinch auf Tablet-Emulation (DevTools)
       - prefers-reduced-motion (DevTools → Rendering)
       - dark/light Theme
       - Templates anwenden + Step-Mode des Packet-Tracers
  6. Erst nach erfolgreicher Preview-Prüfung nach main mergen.
  7. Nach Merge: Vercel Production-Deployment beobachten, im UI prüfen, dass das
     Deployment-Log ohne Warnings durchläuft.

Roll-Back-Plan
  - Vor riskanten Refactors (Render-Loop, Store-Extraktion) lokal Tag setzen:
      git tag pre-store-refactor && git push --tags
  - Falls Production kaputt: in Vercel "Promote to Production" bei vorherigem
    grünen Deployment klicken — ist sofort wieder live.

DEPLOYMENT-AUSGABE PRO ITERATION
  Zusätzlich zu der bisherigen Schritt-Ausgabe (Dateien, Commit-Message, Tests):
  - Lokales Build-Resultat (Bundle-Größen pro Chunk, Warnungen).
  - Preview-URL-Hinweis ("Preview-Deployment unter <Vercel-URL> manuell verifizieren").
  - Falls Bundle-Warnung: Hinweis, welche Komponente lazy gezogen wurde oder
    welche Vorlage ausgelagert wurde.

NICHT-ZIELE FÜR DEN DEPLOYMENT-TEIL
  - Kein Wechsel zu Next.js / einem anderen Framework.
  - Kein Edge-Functions-Code, keine API-Routen in Vercel.
  - Kein neues Backend; alle "Live-Collab"-Vorbereitungen bleiben Store-API-Stubs
    ohne aktiven WebSocket.
```

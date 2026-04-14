# IT Training Canvas – Entwickler-Dokumentation

Interaktive Lern- und Trainingsplattform für IT-Infrastruktur (inspiriert von Cisco Packet Tracer), gebaut mit React 19, TypeScript, Vite und Tailwind CSS v4.

---

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Tech-Stack](#tech-stack)
- [Projektstruktur](#projektstruktur)
- [Architektur-Überblick](#architektur-überblick)
- [Die 5 Entwicklungsphasen](#die-5-entwicklungsphasen)
- [Komponentenübersicht](#komponentenübersicht)
- [Bibliotheken (lib/)](#bibliotheken-lib)
- [Typsystem](#typsystem)
- [State Management](#state-management)
- [Shape-System & Rendering](#shape-system--rendering)
- [Verbindungen (Connections)](#verbindungen-connections)
- [Templates](#templates)
- [Theming & CSS](#theming--css)
- [Tastenkürzel](#tastenkürzel)
- [Neue Shapes hinzufügen](#neue-shapes-hinzufügen)
- [Lizenz](#lizenz)

---

## Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Dev-Server starten (Standard-Port: 5000)
npm run dev

# TypeScript prüfen
npx tsc --noEmit

# Produktions-Build
npm run build

# Build-Vorschau
npm run preview
```

---

## Tech-Stack

| Technologie    | Version | Zweck                                      |
| -------------- | ------- | ------------------------------------------ |
| React          | 19      | UI-Framework                               |
| TypeScript     | ~5.7    | Typsicherheit                              |
| Vite           | 7.2     | Build-Tool / Dev-Server                    |
| Tailwind CSS   | v4      | Utility-CSS-Framework                      |
| Radix UI       | v1      | Barrierefreie UI-Primitives                |
| Phosphor Icons | 2.1     | Icon-Bibliothek (Typ: `React.ElementType`) |
| Framer Motion  | 12.6    | Animationen                                |
| Recharts       | 2.15    | Diagramme (Metriken-Dashboard)             |
| D3             | 7.9     | Datentransformationen                      |
| Zod            | 3.25    | Schema-Validierung                         |

---

## Projektstruktur

```
src/
├── App.tsx                      # Haupt-Komponente, gesamte State-Verwaltung
├── main.tsx                     # React-Entry-Point
├── ErrorFallback.tsx            # Fehlergrenze (react-error-boundary)
├── main.css                     # CSS-Entry (importiert theme.css + index.css)
├── index.css                    # Tailwind-Basis + CSS-Variablen (OKLch)
│
├── components/
│   ├── Canvas.tsx               # Haupt-Zeichenfläche (HTML5 Canvas API)
│   ├── FloatingToolbar.tsx      # Werkzeugleiste (Stift, Form, Text, etc.)
│   ├── Sidebar.tsx              # Fach-Navigation (FISI, Azure, AWS, ...)
│   ├── SelectionToolbar.tsx     # Kontextmenü für selektierte Objekte
│   ├── MiniMap.tsx              # Miniaturansicht der Zeichenfläche
│   ├── ShapePicker.tsx          # Shape-Bibliothek (50+ IT-Shapes)
│   ├── ShapePropertiesPanel.tsx # Shape-Eigenschaften bearbeiten
│   ├── ShapeConfigDialog.tsx    # Netzwerk-/Cloud-Konfiguration pro Shape
│   ├── ConnectionPropertiesPanel.tsx  # Verbindungseigenschaften
│   ├── CanvasContextMenu.tsx    # Rechtsklick-Kontextmenü
│   ├── LearningPathEditor.tsx   # Lernpfad-Editor (Phase 3)
│   ├── ProgressTracker.tsx      # Lernfortschritt-Anzeige
│   ├── QuizDialog.tsx           # Quiz-System (MC, Text, Drag&Drop)
│   ├── HintPanel.tsx            # Hinweise mit Punktabzug
│   ├── SimulationControls.tsx   # Netzwerk-Simulation steuern (Phase 4)
│   ├── PacketFlowVisualizer.tsx # Paket-Verfolgung visualisieren
│   ├── CostCalculator.tsx       # Cloud-Kostenrechner
│   ├── MetricsDashboard.tsx     # Echtzeit-Metriken (CPU, RAM, etc.)
│   ├── AnnotationLayer.tsx      # Annotations-System (Phase 5)
│   ├── TemplateGallery.tsx      # Template-Galerie (5 Built-in)
│   ├── ShareExportDialog.tsx    # Export/Share (JSON, PNG, SVG)
│   ├── TerminalEmulator.tsx     # Simul. Terminal pro Shape
│   ├── KeyboardShortcutsDialog.tsx  # Tastenkürzel-Referenz
│   ├── PresentationsDialog.tsx  # Alle Fächer anzeigen/laden
│   └── ui/                      # 30+ Radix/shadcn UI-Komponenten
│
├── lib/
│   ├── types.ts                 # Alle TypeScript-Typen
│   ├── canvas-utils.ts          # Zeichen-, Export- und Import-Funktionen
│   ├── connection-utils.ts      # Verbindungslogik und Rendering
│   ├── shapes.ts                # Shape-Definitionen (IT_SHAPES)
│   ├── collaboration-engine.ts  # Collaboration, Templates, Share, Annotations
│   ├── shape-properties.ts      # Netzwerk-/Cloud-Property-Typen
│   ├── validation-engine.ts     # Lernschritt-Validierung
│   ├── network-simulator.ts     # Paket-Simulation, Pfadfindung, Metriken
│   └── utils.ts                 # cn() – Tailwind-Klassen-Merge
│
├── hooks/
│   └── use-mobile.ts            # Mobile-Viewport-Erkennung
│
└── styles/
    └── theme.css                # Radix-Farbpaletten + Design-Token
```

---

## Architektur-Überblick

```
┌─────────────────────────────────────────────────────┐
│                     App.tsx                          │
│  (Zentraler State: ~40 useState + useLocalStorage)  │
├──────────┬──────────┬──────────┬────────────────────┤
│ Sidebar  │ Canvas   │ Toolbar  │ Dialoge/Panels     │
│          │ (HTML5)  │          │                     │
├──────────┴──────────┴──────────┴────────────────────┤
│                    lib/                              │
│  canvas-utils │ connection-utils │ shapes            │
│  collaboration-engine │ validation-engine            │
│  network-simulator │ shape-properties │ types        │
├─────────────────────────────────────────────────────┤
│  localStorage (useLocalStorage Hook)                │
│  BroadcastChannel (Cross-Tab-Sync)                  │
└─────────────────────────────────────────────────────┘
```

**Kernprinzipien:**

1. **Single-Source-of-Truth:** Alle Zustände leben in `App.tsx` und werden als Props weitergegeben.
2. **localStorage-Persistenz:** Ein custom `useLocalStorage`-Hook (in App.tsx) synchronisiert den State mit `localStorage` und nutzt `useRef` um Endlos-Loops zu vermeiden.
3. **Canvas-Rendering:** HTML5 Canvas API mit `requestAnimationFrame`-Loop. Shapes werden über SVG-Pfade (`svgPath`) als `Path2D` / `Image` gerendert.
4. **Typsicherheit:** Durchgängige TypeScript-Typisierung für alle Domänen (Drawing, Network, Learning, Simulation, Collaboration).

---

## Die 5 Entwicklungsphasen

### Phase 1 – Multi-Subject Canvas System

- Separate Canvas-Workspaces pro Fach (FISI, Azure, AWS, Linux, Docker, K8s, ...)
- 12 vorkonfigurierte Fächer mit Icons, Farben und Kategorien
- Werkzeuge: Stift, Radierer, Rechteck, Kreis, Linie, Pfeil, Text, Selektion
- Undo/Redo, Raster, Auto-Save

### Phase 2 – Shape-Konfiguration & Terminal

- 50+ IT-Shapes (Router, Switch, Server, Cloud-Dienste, Container, ...)
- Netzwerk-Konfiguration: IP, Subnetz, Gateway, DNS, Ports
- Cloud-Konfiguration: Region, Instanztyp, Speicher, CPU, RAM
- Simul. Terminal pro Shape: `ifconfig`, `ping`, `docker ps`, `kubectl get pods`, ...

### Phase 3 – Learning Engine

- Lernpfade mit Schritten: Info, Aufgabe, Quiz, Checkpoint
- Quiz-Typen: Multiple Choice, Texteingabe, Drag & Drop, Wahr/Falsch
- Validierung: Prüft ob korrekte Shapes platziert, konfiguriert und verbunden sind
- Hinweise mit Punktabzug, Fortschrittsverfolgung

### Phase 4 – Simulation & Monitoring

- Paket-Flow-Visualisierung (L2–L7 Protokolle)
- Netzwerk-Simulation: Latenz, Paketverlust, Bandbreite
- Cloud-Kostenrechner (AWS/Azure, stündlich/monatlich/jährlich)
- Echtzeit-Metriken: CPU, RAM, Netzwerk-I/O, Disk-I/O, Latenz, Fehlerrate

### Phase 5 – Collaboration & Sharing

- Annotations: Kommentare, Pfeile, Highlights, Callouts mit Threading
- Template-Galerie: 5 Built-in-Templates + eigene speichern
- Export: JSON, PNG, SVG
- Share-Links mit optionalem Passwort und Ablaufdatum
- Cross-Tab-Sync über BroadcastChannel

---

## Komponentenübersicht

### Canvas.tsx (Kern-Zeichenfläche)

- Rendert alle `DrawingObject`-Typen über `drawObject()` aus canvas-utils
- Verwaltet Maus-Events für Zeichnen, Selektion, Verschieben, Verbinden
- Offscreen-Canvas für Performance-Optimierung
- Zoom/Pan mit Mausrad + Drag

### FloatingToolbar.tsx

- Werkzeug-Auswahl (Stift, Radierer, Formen, Text, Select, Shape, Connection)
- Farbwähler, Stiftbreite, Schriftgröße
- Undo/Redo-Buttons, Raster-Toggle

### Sidebar.tsx

- Fach-Tabs mit Icons und Farben
- Fach hinzufügen/entfernen
- Wechselt den kompletten Canvas-State pro Fach

### TemplateGallery.tsx

- 5 Built-in-Vorlagen: Basic LAN, AWS 3-Tier, K8s Cluster, DMZ, CI/CD Pipeline
- Suche nach Name, Beschreibung, Tags
- Aktuelle Zeichnung als Template speichern

---

## Bibliotheken (lib/)

### canvas-utils.ts

| Funktion                                     | Beschreibung                                 |
| -------------------------------------------- | -------------------------------------------- |
| `drawObject(ctx, obj)`                       | Rendert ein DrawingObject auf den Canvas     |
| `preloadShapes(shapes)`                      | Lädt SVG-Pfade als Image für Shape-Rendering |
| `setImageLoadCallback(cb)`                   | Callback wenn ein Shape-Bild geladen wurde   |
| `generateId()`                               | Erzeugt eindeutige ID                        |
| `isPointInBounds(point, obj)`                | Prüft ob Punkt innerhalb eines Objekts liegt |
| `getShapeBounds(obj)`                        | Bounding-Box eines Objekts                   |
| `exportCanvasAsPNG(canvas, filename)`        | Canvas als PNG exportieren                   |
| `exportCanvasAsSVG(objects, filename, w, h)` | Objekte als SVG exportieren                  |
| `downloadJSON(data, filename)`               | Daten als JSON-Datei herunterladen           |
| `importFromJSON(file)`                       | JSON-Datei importieren                       |

### connection-utils.ts

| Funktion                                             | Beschreibung                            |
| ---------------------------------------------------- | --------------------------------------- |
| `getPortPosition(shape, port)`                       | Berechnet Port-Position auf Shape       |
| `findNearestPort(shape, point)`                      | Findet nächsten Port zu einem Punkt     |
| `drawConnectionPorts(ctx, shape)`                    | Zeichnet Port-Punkte auf Shape          |
| `drawConnection(ctx, conn, shapes)`                  | Zeichnet Verbindungslinie + Pfeilspitze |
| `createConnection(src, srcPort, tgt, tgtPort, type)` | Erstellt neue Verbindung                |
| `generateConnectionId()`                             | Erzeugt eindeutige Verbindungs-ID       |

**CONNECTION_PORTS:** `top(0.5,0)`, `right(1,0.5)`, `bottom(0.5,1)`, `left(0,0.5)`, `center(0.5,0.5)`, `default(0.5,0.5)`

### shapes.ts

- **`IT_SHAPES`:** Array mit 50+ Shape-Definitionen (id, name, svgPath, Kategorie, Beschreibung)
- **`SHAPE_CATEGORIES`:** 11 Kategorien (Netzwerk, Cloud, Server, Speicher, Security, Container, Pfeile, Diagramme, Azure, AWS, Infrastruktur)
- **`getShapesByCategory()`:** Gruppiert IT_SHAPES nach Kategorie

### collaboration-engine.ts

- **Templates:** `BUILT_IN_TEMPLATES` (5 Vorlagen), `createTemplate()`, `searchTemplates()`
- **Annotations:** `createAnnotation()`, `addReply()`, `getAnnotationIcon()`
- **Sharing:** `generateShareLink()`, `getShareUrl()`, `getExportFilename()`
- **Collaboration:** `initCollaboration()`, `broadcastEvent()`, `onCollabEvent()` (BroadcastChannel-basiert)

### validation-engine.ts

- `validateStep(step, objects, connections)` – Validiert Lernschritt-Abschluss
- Regel-Typen: `shape-exists`, `shape-configured`, `connection-exists`, `status-check`
- Gibt `ScoreResult` zurück (Prozent, bestanden, Detail-Ergebnisse)

### network-simulator.ts

- `findPath(sourceId, targetId, connections)` – BFS-Pfadfindung zwischen Shapes
- `simulatePacketTrace(source, target, connections, config)` – Simuliert Paketfluss mit Latenz/Verlust
- `generateShapeMetrics(shape)` – Mock-Metriken für Dashboard

### shape-properties.ts

- Shape-Status-Typen: `active`, `inactive`, `error`, `warning`, `pending`
- Netzwerk-Protokolle: TCP, UDP, ICMP, HTTP, HTTPS, SSH, DNS, etc.
- Verbindungstypen: Ethernet, Fiber, WiFi, API, VPN, VNet-Peering
- Property-Interfaces: `NetworkDeviceProperties`, `ServerProperties`, `CloudResourceProperties`

---

## Typsystem

Alle Typen sind in `src/lib/types.ts` definiert. Die wichtigsten:

```typescript
// Werkzeuge
type Tool =
  | "pen"
  | "eraser"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "select"
  | "shape"
  | "connection";

// Zeichenobjekt (vereinheitlicht alle Canvas-Elemente)
interface DrawingObject {
  id: string;
  type: Tool;
  color: string;
  points?: Point[]; // Für Stift/Radierer
  startPoint?: Point; // Für Formen/Linien
  endPoint?: Point;
  shapeWidth?: number; // Für Shapes
  shapeHeight?: number;
  svgPath?: string; // WICHTIG: Muss gesetzt sein damit Shapes gerendert werden
  shapeId?: string; // Referenz auf IT_SHAPES[].id
  label?: string;
  config?: ShapeConfig; // Netzwerk-/Cloud-Konfiguration
}

// Canvas-Zustand pro Fach
interface CanvasState {
  objects: DrawingObject[];
  connections: CanvasConnection[];
  history: DrawingObject[][];
  historyIndex: number;
}

// Verbindung zwischen Shapes
interface CanvasConnection {
  id: string;
  sourceShapeId: string;
  sourcePort: PortPosition; // "top" | "right" | "bottom" | "left" | "center"
  targetShapeId: string;
  targetPort: PortPosition;
  connectionType: ConnectionType;
  status: "active" | "inactive" | "error";
  animated: boolean;
  protocol?: string;
  bandwidth?: string;
}
```

---

## State Management

Der gesamte Anwendungs-State lebt in `App.tsx`:

```typescript
// Custom Hook: persistiert State in localStorage
function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (val: T) => void];

// Hauptsächliche State-Variablen:
const [appData, setAppData] = useLocalStorage("appData", initialState);
// appData enthält: subjects[], currentSubject, canvasStates{}, learningPaths{},
//                  userProgress{}, templates[], annotations{}, ...

const [tool, setTool] = useState<Tool>("pen");
const [color, setColor] = useState("#000000");
const [theme, setTheme] = useState<"light" | "dark">("light");
// ... ~40 weitere State-Variablen
```

**Wichtig:** Beim Aktualisieren des Canvas-States immer `setAppData()` verwenden, nicht gleichzeitig `setAppData` und andere State-Setter aufrufen (Race-Condition-Risiko).

---

## Shape-System & Rendering

### Wie Shapes gerendert werden

1. **Definition:** Jedes Shape ist in `IT_SHAPES` (shapes.ts) definiert mit einem `svgPath` (SVG-Markup-String)
2. **Preload:** Beim App-Start werden alle Shapes über `preloadShapes()` als `Image`-Objekte vorgeladen
3. **Platzierung:** Wenn ein Shape auf dem Canvas platziert wird, wird ein `DrawingObject` mit `type: "shape"`, `shapeId` und `svgPath` erstellt
4. **Rendering:** `drawObject()` erkennt `type === "shape"` und rendert das vorgeladene Bild via `ctx.drawImage()`

**Kritisch:** Ohne `svgPath` im `DrawingObject` wird das Shape **nicht gerendert** — nur die Verbindungslinien wären sichtbar.

### Shape-IDs (immer Kleinbuchstaben)

```
router, switch, computer, server, firewall, loadbalancer, database, cloud, container,
gateway, access-point, web-server, database-server, application-server, kubernetes-pod,
storage-array, nas, s3-bucket, vpn, ipsec, ssl-certificate, docker-container,
kubernetes-service, helm-chart, cloud-region, availability-zone, subnet, ...
```

---

## Verbindungen (Connections)

### Port-System

Jedes Shape hat 5 Anschluss-Ports (+ `default` als Alias für `center`):

```
        top (0.5, 0)
          │
left ─────┼───── right
(0,0.5)   │      (1, 0.5)
       bottom (0.5, 1)
```

### Verbindung erstellen (Code-Pfad)

1. User wählt "Connection"-Tool
2. Klick auf Source-Shape → `findNearestPort()` bestimmt den Port
3. Klick auf Target-Shape → `createConnection()` erzeugt `CanvasConnection`
4. `drawConnection()` rendert die Linie + optionale Animation

---

## Templates

5 eingebaute Vorlagen in `BUILT_IN_TEMPLATES`:

| ID                | Name               | Schwierigkeit   | Inhalt                                    |
| ----------------- | ------------------ | --------------- | ----------------------------------------- |
| `tpl-basic-lan`   | Einfaches LAN      | Anfänger        | Router, Switch, 3 PCs, 4 Verbindungen     |
| `tpl-aws-3tier`   | AWS 3-Tier         | Mittel          | ALB, 2 App-Server, RDS, 5 Verbindungen    |
| `tpl-k8s-cluster` | Kubernetes Cluster | Fortgeschritten | Control Plane, Worker, Pods, Service      |
| `tpl-dmz`         | DMZ-Netzwerk       | Mittel          | 2 Firewalls, DMZ-Server, DB               |
| `tpl-cicd`        | CI/CD Pipeline     | Mittel          | Git → CI → Test → Registry → Deploy → K8s |

Templates werden über `tplShape()` und `tplConn()` in der collaboration-engine erstellt. `tplShape()` sucht automatisch den passenden `svgPath` aus `IT_SHAPES`.

---

## Theming & CSS

### CSS-Hierarchie

```
main.css
├── styles/theme.css    → Radix-Farbpaletten (40+ Skalen, Light/Dark)
└── index.css           → Tailwind CSS v4 + tw-animate-css + OKLch-Variablen
```

### Farbsystem

Farben werden in **OKLch** definiert (moderner Farbraum):

```css
--primary: oklch(0.55 0.2 260); /* Light-Mode */
--primary: oklch(0.75 0.15 260); /* Dark-Mode */
```

### Dark Mode

Via CSS-Klasse `.dark` auf dem Root-Element, umschaltbar über Theme-Toggle in der Sidebar.

---

## Tastenkürzel

| Kürzel   | Aktion                      |
| -------- | --------------------------- |
| `P`      | Stift-Werkzeug              |
| `E`      | Radierer                    |
| `V`      | Auswahl-Werkzeug            |
| `T`      | Text-Werkzeug               |
| `Ctrl+Z` | Rückgängig                  |
| `Ctrl+Y` | Wiederholen                 |
| `?`      | Tastenkürzel-Dialog         |
| `M`      | MiniMap ein/aus             |
| `Delete` | Ausgewähltes Objekt löschen |

---

## Neue Shapes hinzufügen

1. **Shape-Definition** in `src/lib/shapes.ts` zum `IT_SHAPES`-Array hinzufügen:

```typescript
{
  id: "mein-shape",              // Eindeutige ID (Kleinbuchstaben, Bindestrich)
  name: "Mein Shape",            // Anzeigename
  category: "network",           // Kategorie (siehe SHAPE_CATEGORIES)
  description: "Beschreibung",
  svgPath: `<svg>...</svg>`,     // Komplettes SVG-Markup
  defaultWidth: 80,
  defaultHeight: 80,
}
```

2. Das Shape erscheint automatisch im **ShapePicker** unter der entsprechenden Kategorie.

3. Falls das Shape in Templates verwendet werden soll, die `shapeId` in `tplShape()` nutzen (collaboration-engine.ts).

---

## Lizenz

MIT License – siehe LICENSE.

import { AnnotationLayer } from "@/components/AnnotationLayer";
import { Canvas } from "@/components/Canvas";
import { CanvasContextMenu } from "@/components/CanvasContextMenu";
import { ConnectionPropertiesPanel } from "@/components/ConnectionPropertiesPanel";
import { CostCalculator } from "@/components/CostCalculator";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { LearningPathEditor } from "@/components/LearningPathEditor";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { MiniMap } from "@/components/MiniMap";
import { PacketFlowVisualizer } from "@/components/PacketFlowVisualizer";
import { PDUInspector } from "@/components/PDUInspector";
import { PresentationsDialog } from "@/components/PresentationsDialog";
import { ProgressTracker } from "@/components/ProgressTracker";
import { SelectionToolbar } from "@/components/SelectionToolbar";
import { ShapeConfigDialog } from "@/components/ShapeConfigDialog";
import { ShapePicker } from "@/components/ShapePicker";
import { ShapePropertiesPanel } from "@/components/ShapePropertiesPanel";
import { ShareExportDialog } from "@/components/ShareExportDialog";
import { Sidebar } from "@/components/Sidebar";
import { TemplateGallery } from "@/components/TemplateGallery";
import { TerminalEmulator } from "@/components/TerminalEmulator";
import {
  downloadJSON,
  exportCanvasAsPNG,
  exportCanvasAsSVG,
  importFromJSON,
} from "@/lib/canvas-utils";
import { createTemplate } from "@/lib/collaboration-engine";
import {
  DEFAULT_LEARNING_PATHS,
  DEFAULT_QUIZZES,
} from "@/lib/default-learning-content";
import { CATALOG_PREVIEW } from "@/lib/content/module-catalog";
import {
  Annotation,
  CanvasConnection,
  CanvasState,
  CanvasTemplate,
  COLLABORATOR_COLORS,
  DEFAULT_SUBJECTS,
  DrawingObject,
  FontFamily,
  GRID_SIZES,
  GridPattern,
  GridSize,
  LearningPath,
  PEN_WIDTHS,
  PenWidth,
  Quiz,
  ShapeConfig,
  ShapeDefinition,
  SUBJECT_CONFIGS,
  SubjectData,
  TemplateCategory,
  TerminalCommand,
  TEXT_SIZES,
  TextSize,
  Tool,
  UserProgress,
} from "@/lib/types";
import {
  BookOpen,
  ChartLine,
  CurrencyDollar,
  Export,
  FolderOpen,
  GraduationCap,
  Info,
  Keyboard,
  Lightning,
  Notepad,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast, Toaster } from "sonner";

// ── Phase 6c-1: Catalog → Subject-ID mapping ─────────────────
// Maps CATALOG_PREVIEW slugs to SUBJECT_CONFIGS keys.
const CATALOG_SLUG_TO_SUBJECT: Record<string, string> = {
  "ccna": "CCNA",
  "az-900": "AZ-900",
  "comptia-network-plus": "NetworkPlus",
};

// New subjects from the catalog that aren't already in DEFAULT_SUBJECTS.
// These are injected alongside legacy subjects so catalog modules appear in the Sidebar.
const CATALOG_SUBJECTS: string[] = CATALOG_PREVIEW
  .map((m) => CATALOG_SLUG_TO_SUBJECT[m.slug])
  .filter((s): s is string => !!s && !DEFAULT_SUBJECTS.includes(s));

// Custom hook to replace useKV with localStorage fallback
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  // Use ref to avoid dependency on storedValue in setValue
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback(
    (value: React.SetStateAction<T>) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValueRef.current) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error("Error writing localStorage:", error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
}

function App() {
  const [appData, setAppData] = useLocalStorage<Record<string, SubjectData>>(
    "canvas-app-data",
    {},
  );
  const [currentSubject, setCurrentSubject] = useState<string>(
    DEFAULT_SUBJECTS[0],
  );
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff"); // Default white for dark theme
  const [penWidth, setPenWidth] = useState<PenWidth>("normal");
  const [textSize, setTextSize] = useState<TextSize>("medium");
  const [fontFamily, setFontFamily] = useState<FontFamily>("IBM Plex Mono");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState<GridSize>("medium");
  const [gridPattern, setGridPattern] = useState<GridPattern>("dots");
  const [gridColor, setGridColor] = useState<string>("");
  const [gridAccentColor, setGridAccentColor] = useState<string>("");
  const [gridOpacity, setGridOpacity] = useState<number>(0.5);
  const [showPresentations, setShowPresentations] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([
    ...DEFAULT_SUBJECTS,
    ...CATALOG_SUBJECTS,
  ]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [selectedShape, setSelectedShape] = useState<ShapeDefinition | null>(
    null,
  );
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [viewportInfo, setViewportInfo] = useState({
    x: 0,
    y: 0,
    zoom: 1,
    width: 800,
    height: 600,
  });
  const [selectedObjectForProperties, setSelectedObjectForProperties] =
    useState<DrawingObject | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    selectedObjects: DrawingObject[];
  } | null>(null);

  // Connection Properties State
  const [selectedConnection, setSelectedConnection] =
    useState<CanvasConnection | null>(null);
  const [showConnectionPanel, setShowConnectionPanel] = useState(false);

  // Phase 4: Simulation State
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [showPacketFlow, setShowPacketFlow] = useState(false);
  const [pduInspectorData, setPduInspectorData] = useState<{
    sourceId: string;
    targetId: string;
    protocol: string;
    hopIndex: number;
  } | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  // Phase 5: Collaboration State
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showShareExport, setShowShareExport] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [annotations, setAnnotations] = useLocalStorage<
    Record<string, Annotation[]>
  >("canvas-annotations", {});
  const [customTemplates, setCustomTemplates] = useLocalStorage<
    CanvasTemplate[]
  >("canvas-custom-templates", []);
  const currentUserColor = COLLABORATOR_COLORS[0];

  // Selection Toolbar State
  const [selectedObjects, setSelectedObjects] = useState<DrawingObject[]>([]);

  // Phase 2: Config Dialog State
  const [configDialogShape, setConfigDialogShape] =
    useState<DrawingObject | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // Phase 2: Terminal Emulator State
  const [terminalShape, setTerminalShape] = useState<DrawingObject | null>(
    null,
  );
  const [showTerminal, setShowTerminal] = useState(false);

  // Phase 3: Learning Engine State
  const [learningPaths, setLearningPaths] = useLocalStorage<
    Record<string, LearningPath>
  >("canvas-learning-paths", {});
  const [quizzes, setQuizzes] = useLocalStorage<Record<string, Quiz>>(
    "canvas-quizzes",
    {},
  );
  const [userProgress, setUserProgress] = useLocalStorage<
    Record<string, UserProgress>
  >("canvas-user-progress", {});
  const [showLearningPathEditor, setShowLearningPathEditor] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [activeLearningPath, setActiveLearningPath] =
    useState<LearningPath | null>(null);
  const [showProgressTracker, setShowProgressTracker] = useState(false);

  const [selectionToolbarPosition, setSelectionToolbarPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const emptyCanvasState = () => ({
      objects: [] as DrawingObject[],
      connections: [] as CanvasConnection[],
      history: [[]] as DrawingObject[][],
      historyIndex: 0,
    });

    if (!appData || Object.keys(appData).length === 0) {
      // Fresh state: initialize all subjects (legacy + catalog)
      const initialData: Record<string, SubjectData> = {};
      [...DEFAULT_SUBJECTS, ...CATALOG_SUBJECTS].forEach((subject) => {
        initialData[subject] = {
          name: subject,
          canvasState: emptyCanvasState(),
          lastModified: Date.now(),
        };
      });
      setAppData(initialData);
    } else {
      // Existing state: ensure catalog subjects are present (migration)
      const missingCatalog = CATALOG_SUBJECTS.filter((s) => !(s in appData));
      if (missingCatalog.length > 0) {
        const updated = { ...appData };
        missingCatalog.forEach((subject) => {
          updated[subject] = {
            name: subject,
            canvasState: emptyCanvasState(),
            lastModified: Date.now(),
          };
        });
        setAppData(updated);
        setSubjects(Object.keys(updated));
      } else {
        setSubjects(Object.keys(appData));
      }
      // Hide welcome if there's content
      const hasContent = Object.values(appData).some(
        (subject) => subject.canvasState.objects.length > 0,
      );
      if (hasContent) setShowWelcome(false);
    }
  }, []);

  // Seed default learning paths & quizzes — merge so new default content is always present
  useEffect(() => {
    if (Object.keys(learningPaths).length === 0) {
      setLearningPaths(DEFAULT_LEARNING_PATHS);
    }
    // DEFAULT_QUIZZES as base, existing user quizzes override (preserves customizations)
    setQuizzes((prev) => ({ ...DEFAULT_QUIZZES, ...prev }));
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("canvas-theme") as
      | "light"
      | "dark"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      // Default to dark theme
      document.documentElement.classList.add("dark");
    }

    const savedGridColor = localStorage.getItem("canvas-grid-color");
    const savedGridAccentColor = localStorage.getItem(
      "canvas-grid-accent-color",
    );
    const savedGridOpacity = localStorage.getItem("canvas-grid-opacity");
    if (savedGridColor) setGridColor(savedGridColor);
    if (savedGridAccentColor) setGridAccentColor(savedGridAccentColor);
    if (savedGridOpacity) setGridOpacity(parseFloat(savedGridOpacity));
  }, []);

  const getCurrentCanvasState = useCallback((): CanvasState => {
    if (!appData) {
      return {
        objects: [],
        connections: [],
        history: [[]],
        historyIndex: 0,
      };
    }
    return (
      appData[currentSubject]?.canvasState || {
        objects: [],
        connections: [],
        history: [[]],
        historyIndex: 0,
      }
    );
  }, [appData, currentSubject]);

  const updateCanvasState = useCallback(
    (newObjects: DrawingObject[]) => {
      setShowWelcome(false);
      setAppData((prev) => {
        if (!prev) {
          return {
            [currentSubject]: {
              name: currentSubject,
              canvasState: {
                objects: newObjects,
                connections: [],
                history: [newObjects],
                historyIndex: 0,
              },
              lastModified: Date.now(),
            },
          };
        }

        const current = prev[currentSubject] || {
          name: currentSubject,
          canvasState: {
            objects: [],
            connections: [],
            history: [[]],
            historyIndex: 0,
          },
          lastModified: Date.now(),
        };

        const newHistory = current.canvasState.history.slice(
          0,
          current.canvasState.historyIndex + 1,
        );
        newHistory.push(newObjects);

        return {
          ...prev,
          [currentSubject]: {
            ...current,
            canvasState: {
              ...current.canvasState,
              objects: newObjects,
              history: newHistory,
              historyIndex: newHistory.length - 1,
            },
            lastModified: Date.now(),
          },
        };
      });

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        toast.success("Automatisch gespeichert", { duration: 2000 });
      }, 30000);
    },
    [currentSubject, setAppData],
  );

  const handleUndo = useCallback(() => {
    setAppData((prev) => {
      if (!prev) return {};
      const current = prev[currentSubject];
      if (!current || current.canvasState.historyIndex <= 0) return prev;

      const newIndex = current.canvasState.historyIndex - 1;
      return {
        ...prev,
        [currentSubject]: {
          ...current,
          canvasState: {
            ...current.canvasState,
            objects: current.canvasState.history[newIndex],
            historyIndex: newIndex,
          },
          lastModified: Date.now(),
        },
      };
    });
  }, [currentSubject, setAppData]);

  const handleRedo = useCallback(() => {
    setAppData((prev) => {
      if (!prev) return {};
      const current = prev[currentSubject];
      if (
        !current ||
        current.canvasState.historyIndex >=
          current.canvasState.history.length - 1
      )
        return prev;

      const newIndex = current.canvasState.historyIndex + 1;
      return {
        ...prev,
        [currentSubject]: {
          ...current,
          canvasState: {
            ...current.canvasState,
            objects: current.canvasState.history[newIndex],
            historyIndex: newIndex,
          },
          lastModified: Date.now(),
        },
      };
    });
  }, [currentSubject, setAppData]);

  const handleSave = useCallback(() => {
    toast.success("Erfolgreich gespeichert!", { duration: 2000 });
  }, []);

  const handleExport = useCallback(() => {
    if (!appData) {
      toast.error("Keine Daten zum Exportieren", { duration: 2000 });
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadJSON(appData, `it-training-backup-${timestamp}.json`);
    toast.success("Export erfolgreich!", { duration: 2000 });
  }, [appData]);

  const handleExportPNG = useCallback(() => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) {
      toast.error("Canvas nicht gefunden", { duration: 2000 });
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    exportCanvasAsPNG(
      canvas,
      `${currentSubject}-${timestamp}.png`,
      theme === "dark" ? "#0f172a" : "#ffffff",
    );
    toast.success("PNG exportiert!", { duration: 2000 });
  }, [currentSubject, theme]);

  const handleExportSVG = useCallback(() => {
    const canvasState = getCurrentCanvasState();
    if (canvasState.objects.length === 0) {
      toast.error("Keine Objekte zum Exportieren", { duration: 2000 });
      return;
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    exportCanvasAsSVG(
      canvasState.objects,
      viewportInfo.width || 1920,
      viewportInfo.height || 1080,
      `${currentSubject}-${timestamp}.svg`,
      theme === "dark" ? "#0f172a" : "#ffffff",
    );
    toast.success("SVG exportiert!", { duration: 2000 });
  }, [currentSubject, theme, viewportInfo, getCurrentCanvasState]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const data = await importFromJSON(file);
        setAppData(data);
        setSubjects(Object.keys(data));
        setShowWelcome(false);
        toast.success("Import erfolgreich!", { duration: 2000 });
      } catch (error) {
        toast.error("Import fehlgeschlagen: Ungültige JSON-Datei", {
          duration: 3000,
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [setAppData],
  );

  // Handlers for ShapePropertiesPanel
  const handleUpdateObject = useCallback(
    (id: string, updates: Partial<DrawingObject>) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj,
      );
      updateCanvasState(newObjects);

      // Update the selected object for properties panel
      const updatedObj = newObjects.find((obj) => obj.id === id);
      if (updatedObj) {
        setSelectedObjectForProperties(updatedObj);
      }
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleDeleteObjectFromPanel = useCallback(
    (id: string) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.filter((obj) => obj.id !== id);
      updateCanvasState(newObjects);
      setSelectedObjectForProperties(null);
      setShowPropertiesPanel(false);
      toast.success("Objekt gelöscht", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleDuplicateObject = useCallback(
    (id: string) => {
      const canvasState = getCurrentCanvasState();
      const objToDuplicate = canvasState.objects.find((obj) => obj.id === id);
      if (!objToDuplicate) return;

      const newObj: DrawingObject = {
        ...objToDuplicate,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        selected: false,
      };

      // Offset the position
      if (newObj.startPoint) {
        newObj.startPoint = {
          x: newObj.startPoint.x + 30,
          y: newObj.startPoint.y + 30,
        };
      }
      if (newObj.endPoint) {
        newObj.endPoint = {
          x: newObj.endPoint.x + 30,
          y: newObj.endPoint.y + 30,
        };
      }
      if (newObj.points) {
        newObj.points = newObj.points.map((p) => ({
          x: p.x + 30,
          y: p.y + 30,
        }));
      }

      updateCanvasState([...canvasState.objects, newObj]);
      toast.success("Objekt dupliziert", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleBringToFront = useCallback(
    (id: string) => {
      const canvasState = getCurrentCanvasState();
      const objIndex = canvasState.objects.findIndex((obj) => obj.id === id);
      if (objIndex === -1) return;

      const newObjects = [...canvasState.objects];
      const [obj] = newObjects.splice(objIndex, 1);
      newObjects.push(obj); // Move to end (front)
      updateCanvasState(newObjects);
      toast.success("Nach vorne gebracht", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleSendToBack = useCallback(
    (id: string) => {
      const canvasState = getCurrentCanvasState();
      const objIndex = canvasState.objects.findIndex((obj) => obj.id === id);
      if (objIndex === -1) return;

      const newObjects = [...canvasState.objects];
      const [obj] = newObjects.splice(objIndex, 1);
      newObjects.unshift(obj); // Move to beginning (back)
      updateCanvasState(newObjects);
      toast.success("Nach hinten gesendet", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  // Context Menu Handlers
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, selectedObjects: DrawingObject[]) => {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        selectedObjects,
      });
    },
    [],
  );

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDeleteMultiple = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.filter(
        (obj) => !ids.includes(obj.id),
      );
      updateCanvasState(newObjects);
      toast.success(`${ids.length} Objekt(e) gelöscht`, { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleDuplicateMultiple = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const objectsToDuplicate = canvasState.objects.filter((obj) =>
        ids.includes(obj.id),
      );

      const newObjects = objectsToDuplicate.map((obj) => ({
        ...obj,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        selected: false,
        startPoint: obj.startPoint
          ? { x: obj.startPoint.x + 30, y: obj.startPoint.y + 30 }
          : undefined,
        endPoint: obj.endPoint
          ? { x: obj.endPoint.x + 30, y: obj.endPoint.y + 30 }
          : undefined,
        points: obj.points?.map((p) => ({ x: p.x + 30, y: p.y + 30 })),
      }));

      updateCanvasState([...canvasState.objects, ...newObjects]);
      toast.success(`${ids.length} Objekt(e) dupliziert`, { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleBringToFrontMultiple = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const others = canvasState.objects.filter((obj) => !ids.includes(obj.id));
      const toMove = canvasState.objects.filter((obj) => ids.includes(obj.id));
      updateCanvasState([...others, ...toMove]);
      toast.success("Nach vorne gebracht", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleSendToBackMultiple = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const others = canvasState.objects.filter((obj) => !ids.includes(obj.id));
      const toMove = canvasState.objects.filter((obj) => ids.includes(obj.id));
      updateCanvasState([...toMove, ...others]);
      toast.success("Nach hinten gesendet", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleToggleLock = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) => {
        if (ids.includes(obj.id)) {
          return { ...obj, locked: !obj.locked };
        }
        return obj;
      });
      updateCanvasState(newObjects);
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleToggleVisibility = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) => {
        if (ids.includes(obj.id)) {
          return { ...obj, visible: obj.visible === false };
        }
        return obj;
      });
      updateCanvasState(newObjects);
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleGroup = useCallback(
    (ids: string[]) => {
      const groupId = `group-${Date.now()}`;
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) => {
        if (ids.includes(obj.id)) {
          return { ...obj, groupId };
        }
        return obj;
      });
      updateCanvasState(newObjects);
      toast.success("Gruppiert", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleUngroup = useCallback(
    (ids: string[]) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) => {
        if (ids.includes(obj.id)) {
          return { ...obj, groupId: undefined };
        }
        return obj;
      });
      updateCanvasState(newObjects);
      toast.success("Gruppierung aufgehoben", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  const handleSelectAll = useCallback(() => {
    const canvasState = getCurrentCanvasState();
    const newObjects = canvasState.objects.map((obj) => ({
      ...obj,
      selected: true,
    }));
    updateCanvasState(newObjects);
  }, [getCurrentCanvasState, updateCanvasState]);

  const handleRotateMultiple = useCallback(
    (ids: string[], degrees: number) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) => {
        if (ids.includes(obj.id)) {
          return { ...obj, rotation: ((obj.rotation || 0) + degrees) % 360 };
        }
        return obj;
      });
      updateCanvasState(newObjects);
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  // Connection Handlers
  const handleConnectionSelect = useCallback(
    (connection: CanvasConnection | null) => {
      setSelectedConnection(connection);
      setShowConnectionPanel(!!connection);
      // Close shape properties if connection is selected
      if (connection) {
        setShowPropertiesPanel(false);
        setSelectedObjectForProperties(null);
      }
    },
    [],
  );

  const handleUpdateConnection = useCallback(
    (id: string, updates: Partial<CanvasConnection>) => {
      setAppData((prev) => {
        if (!prev) return {};
        const current = prev[currentSubject];
        if (!current) return prev;

        const newConnections = current.canvasState.connections.map((conn) =>
          conn.id === id ? { ...conn, ...updates } : conn,
        );

        return {
          ...prev,
          [currentSubject]: {
            ...current,
            canvasState: {
              ...current.canvasState,
              connections: newConnections,
            },
            lastModified: Date.now(),
          },
        };
      });

      // Update selected connection state
      setSelectedConnection((prev) =>
        prev && prev.id === id ? { ...prev, ...updates } : prev,
      );
    },
    [currentSubject],
  );

  const handleDeleteConnection = useCallback(
    (id: string) => {
      setAppData((prev) => {
        if (!prev) return {};
        const current = prev[currentSubject];
        if (!current) return prev;

        return {
          ...prev,
          [currentSubject]: {
            ...current,
            canvasState: {
              ...current.canvasState,
              connections: current.canvasState.connections.filter(
                (c) => c.id !== id,
              ),
            },
            lastModified: Date.now(),
          },
        };
      });
      setShowConnectionPanel(false);
      setSelectedConnection(null);
      toast.success("Verbindung gelöscht", { duration: 1500 });
    },
    [currentSubject],
  );

  // Phase 2: Handle shape configuration
  const handleOpenShapeConfig = useCallback((shape: DrawingObject) => {
    setConfigDialogShape(shape);
    setShowConfigDialog(true);
  }, []);

  const handleSaveShapeConfig = useCallback(
    (shapeId: string, config: ShapeConfig, status: DrawingObject["status"]) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) =>
        obj.id === shapeId ? { ...obj, config, status } : obj,
      );
      updateCanvasState(newObjects);
      setShowConfigDialog(false);
      setConfigDialogShape(null);
      toast.success("Konfiguration gespeichert", { duration: 1500 });
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  // Phase 2: Handle terminal
  const handleOpenTerminal = useCallback((shape: DrawingObject) => {
    setTerminalShape(shape);
    setShowTerminal(true);
  }, []);

  const handleUpdateTerminalHistory = useCallback(
    (shapeId: string, history: TerminalCommand[]) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) =>
        obj.id === shapeId ? { ...obj, terminalHistory: history } : obj,
      );
      updateCanvasState(newObjects);
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  // Phase 6: Handle config update from terminal CLI
  const handleUpdateShapeConfigFromTerminal = useCallback(
    (shapeId: string, config: ShapeConfig) => {
      const canvasState = getCurrentCanvasState();
      const newObjects = canvasState.objects.map((obj) =>
        obj.id === shapeId ? { ...obj, config } : obj,
      );
      updateCanvasState(newObjects);
    },
    [getCurrentCanvasState, updateCanvasState],
  );

  // Phase 3: Learning Engine Handlers
  const handleSaveLearningPath = useCallback(
    (path: LearningPath) => {
      setLearningPaths((prev) => ({ ...prev, [path.id]: path }));
      setShowLearningPathEditor(false);
      setEditingPath(null);
      toast.success("Lernpfad gespeichert", { duration: 1500 });
    },
    [setLearningPaths],
  );

  const handleDeleteLearningPath = useCallback(
    (pathId: string) => {
      setLearningPaths((prev) => {
        const next = { ...prev };
        delete next[pathId];
        return next;
      });
      // Clean up progress
      setUserProgress((prev) => {
        const next = { ...prev };
        delete next[pathId];
        return next;
      });
      toast.success("Lernpfad gelöscht", { duration: 1500 });
    },
    [setLearningPaths, setUserProgress],
  );

  const handleStartLearningPath = useCallback(
    (path: LearningPath) => {
      setActiveLearningPath(path);
      setShowProgressTracker(true);

      // Initialize progress if not exists
      if (!userProgress[path.id]) {
        setUserProgress((prev) => ({
          ...prev,
          [path.id]: {
            pathId: path.id,
            currentStepIndex: 0,
            completedSteps: [],
            quizScores: {},
            hintsUsed: {},
            startedAt: Date.now(),
            lastActivityAt: Date.now(),
            totalTimeSpent: 0,
            overallScore: 0,
          },
        }));
      }
    },
    [userProgress, setUserProgress],
  );

  const handleUpdateProgress = useCallback(
    (newProgress: UserProgress) => {
      setUserProgress((prev) => ({
        ...prev,
        [newProgress.pathId]: newProgress,
      }));
    },
    [setUserProgress],
  );

  // Handle object selection from Canvas
  const handleObjectSelection = useCallback((objects: DrawingObject[]) => {
    const selectedObjects = objects.filter((obj) => obj.selected);
    if (selectedObjects.length === 1) {
      setSelectedObjectForProperties(selectedObjects[0]);
      setShowPropertiesPanel(true);
    } else if (selectedObjects.length === 0) {
      setSelectedObjectForProperties(null);
      setShowPropertiesPanel(false);
    }
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("canvas-theme", newTheme);

    // Automatically switch color based on theme
    if (newTheme === "dark" && color === "#000000") {
      setColor("#ffffff");
    } else if (newTheme === "light" && color === "#ffffff") {
      setColor("#000000");
    }
  }, [theme, color]);

  const handleGridToggle = useCallback(() => {
    setShowGrid((prev) => !prev);
  }, []);

  const handleGridColorChange = useCallback(
    (color: string, accentColor: string) => {
      setGridColor(color);
      setGridAccentColor(accentColor);
      localStorage.setItem("canvas-grid-color", color);
      localStorage.setItem("canvas-grid-accent-color", accentColor);
    },
    [],
  );

  const handleGridOpacityChange = useCallback((opacity: number) => {
    setGridOpacity(opacity);
    localStorage.setItem("canvas-grid-opacity", opacity.toString());
  }, []);

  const handleToolChange = useCallback((newTool: Tool) => {
    setTool(newTool);
    if (newTool === "shape") {
      setShowShapePicker(true);
    } else {
      setSelectedShape(null);
    }
  }, []);

  const handleSelectShape = useCallback((shape: ShapeDefinition) => {
    setSelectedShape(shape);
    setTool("shape");
    toast.success(
      `${shape.name} ausgewählt - klicke auf das Canvas zum Platzieren`,
      { duration: 2000 },
    );
  }, []);

  const handleAddSubject = useCallback(
    (name: string) => {
      if (subjects.includes(name)) {
        toast.error("Thema existiert bereits", { duration: 2000 });
        return;
      }

      setAppData((prev) => {
        const prevData = prev || {};
        return {
          ...prevData,
          [name]: {
            name,
            canvasState: {
              objects: [],
              connections: [],
              history: [[]],
              historyIndex: 0,
            },
            lastModified: Date.now(),
          },
        };
      });
      setSubjects((prev) => [...prev, name]);
      setCurrentSubject(name);
      toast.success(
        `Thema hinzugefügt: ${SUBJECT_CONFIGS[name]?.name || name}`,
        { duration: 2000 },
      );
    },
    [subjects, setAppData],
  );

  const handleRemoveSubject = useCallback(
    (subject: string) => {
      if (subjects.length === 1) {
        toast.error("Das letzte Thema kann nicht entfernt werden", {
          duration: 2000,
        });
        return;
      }

      setAppData((prev) => {
        if (!prev) return {};
        const newData = { ...prev };
        delete newData[subject];
        return newData;
      });

      const newSubjects = subjects.filter((s) => s !== subject);
      setSubjects(newSubjects);

      if (currentSubject === subject) {
        setCurrentSubject(newSubjects[0]);
      }

      toast.success(
        `Thema entfernt: ${SUBJECT_CONFIGS[subject]?.name || subject}`,
        { duration: 2000 },
      );
    },
    [subjects, currentSubject, setAppData],
  );

  const handleDeleteSubject = useCallback(
    (subject: string) => {
      handleRemoveSubject(subject);
    },
    [handleRemoveSubject],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignoriere Tastenkürzel wenn ein Input-Feld oder Textarea fokussiert ist
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !isInputActive) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y" && !isInputActive) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Nur wenn kein Input aktiv ist
        if (!isInputActive) {
          const canvasState = getCurrentCanvasState();
          const selectedObjects = canvasState.objects.filter(
            (obj) => obj.selected,
          );
          if (selectedObjects.length > 0) {
            e.preventDefault();
            const newObjects = canvasState.objects.filter(
              (obj) => !obj.selected,
            );
            updateCanvasState(newObjects);
          }
        }
      } else if (!e.ctrlKey && !e.metaKey && !isInputActive) {
        // Tool-Shortcuts nur wenn kein Input aktiv
        const toolMap: Record<string, Tool> = {
          v: "select",
          p: "pen",
          e: "eraser",
          t: "text",
          r: "rectangle",
          c: "circle",
          l: "line",
          a: "arrow",
          s: "shape",
        };
        const newTool = toolMap[e.key.toLowerCase()];
        if (newTool) {
          e.preventDefault();
          handleToolChange(newTool);
        }
        // Keyboard shortcuts dialog
        if (e.key === "?" || e.key === "F1") {
          e.preventDefault();
          setShowKeyboardShortcuts(true);
        }
        // Toggle MiniMap
        if (e.key === "m") {
          e.preventDefault();
          setShowMiniMap(!showMiniMap);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleSave,
    currentSubject,
    appData,
    updateCanvasState,
  ]);

  // Helper function to get object bounds
  const getObjectBounds = useCallback(
    (
      obj: DrawingObject,
    ): { x: number; y: number; width: number; height: number } => {
      if (obj.type === "shape" && obj.startPoint) {
        return {
          x: obj.startPoint.x,
          y: obj.startPoint.y,
          width: obj.shapeWidth || 80,
          height: obj.shapeHeight || 80,
        };
      }
      if (obj.type === "rectangle" && obj.startPoint && obj.endPoint) {
        const x = Math.min(obj.startPoint.x, obj.endPoint.x);
        const y = Math.min(obj.startPoint.y, obj.endPoint.y);
        return {
          x,
          y,
          width: Math.abs(obj.endPoint.x - obj.startPoint.x),
          height: Math.abs(obj.endPoint.y - obj.startPoint.y),
        };
      }
      if (obj.type === "line" && obj.startPoint && obj.endPoint) {
        const x = Math.min(obj.startPoint.x, obj.endPoint.x);
        const y = Math.min(obj.startPoint.y, obj.endPoint.y);
        return {
          x,
          y,
          width: Math.abs(obj.endPoint.x - obj.startPoint.x) || 10,
          height: Math.abs(obj.endPoint.y - obj.startPoint.y) || 10,
        };
      }
      if (obj.type === "text" && obj.startPoint) {
        return {
          x: obj.startPoint.x,
          y: obj.startPoint.y,
          width: 150,
          height: obj.fontSize || 16,
        };
      }
      if (obj.type === "pen" && obj.points?.length) {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        obj.points.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
        return {
          x: minX,
          y: minY,
          width: maxX - minX || 10,
          height: maxY - minY || 10,
        };
      }
      // Fallback
      return { x: 0, y: 0, width: 100, height: 100 };
    },
    [],
  );

  const canvasState = getCurrentCanvasState();
  const canUndo = canvasState.historyIndex > 0;
  const canRedo = canvasState.historyIndex < canvasState.history.length - 1;
  const currentConfig = SUBJECT_CONFIGS[currentSubject];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white flex">
      {/* Sidebar */}
      <Sidebar
        subjects={subjects}
        currentSubject={currentSubject}
        onSubjectChange={setCurrentSubject}
        onAddSubject={handleAddSubject}
        onRemoveSubject={handleRemoveSubject}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-6 py-3 border-b ${
            theme === "dark"
              ? "bg-slate-900/50 border-slate-700/50"
              : "bg-white/80 border-slate-200"
          } backdrop-blur-sm`}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: currentConfig?.color || "#6366F1" }}
            />
            <div>
              <h2
                className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}
              >
                {currentConfig?.name || currentSubject}
              </h2>
              <p
                className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}
              >
                {currentConfig?.description || "Training Canvas"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Learning Engine Button */}
            <button
              onClick={() => {
                const paths = Object.values(learningPaths);
                if (paths.length > 0) {
                  // Show path selector or start first path
                  handleStartLearningPath(paths[0]);
                } else {
                  setEditingPath(null);
                  setShowLearningPathEditor(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeLearningPath
                  ? "bg-indigo-500/20 text-indigo-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
              title="Lernpfade"
            >
              <GraduationCap size={16} />
              Lernpfade
              {Object.keys(learningPaths).length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                  }`}
                >
                  {Object.keys(learningPaths).length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setEditingPath(null);
                setShowLearningPathEditor(true);
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                theme === "dark"
                  ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              }`}
              title="Neuen Lernpfad erstellen"
            >
              <BookOpen size={14} />+
            </button>

            {/* Phase 4: Simulation Buttons */}
            <div
              className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}
            />
            <button
              onClick={() => setShowPacketFlow(!showPacketFlow)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showPacketFlow
                  ? "bg-emerald-500/20 text-emerald-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              title="Paketfluss-Simulation"
            >
              <Lightning size={16} />
              Paketfluss
            </button>
            <button
              onClick={() => setShowCostCalculator(!showCostCalculator)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showCostCalculator
                  ? "bg-amber-500/20 text-amber-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                    : "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
              }`}
              title="Kosten-Rechner"
            >
              <CurrencyDollar size={16} />
              Kosten
            </button>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showMetrics
                  ? "bg-blue-500/20 text-blue-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-blue-300 hover:bg-blue-500/10"
                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title="Metriken-Dashboard"
            >
              <ChartLine size={16} />
              Metriken
            </button>

            {/* Phase 5: Collaboration Buttons */}
            <div
              className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`}
            />
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showAnnotations
                  ? "bg-pink-500/20 text-pink-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-pink-300 hover:bg-pink-500/10"
                    : "text-slate-500 hover:text-pink-600 hover:bg-pink-50"
              }`}
              title="Annotationen"
            >
              <Notepad size={16} />
              Notizen
              {(annotations[currentSubject]?.length ?? 0) > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${theme === "dark" ? "bg-slate-700" : "bg-slate-200"}`}
                >
                  {annotations[currentSubject]?.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowTemplateGallery(!showTemplateGallery)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showTemplateGallery
                  ? "bg-violet-500/20 text-violet-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-violet-300 hover:bg-violet-500/10"
                    : "text-slate-500 hover:text-violet-600 hover:bg-violet-50"
              }`}
              title="Vorlagen-Galerie"
            >
              <FolderOpen size={16} />
              Vorlagen
            </button>
            <button
              onClick={() => setShowShareExport(!showShareExport)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showShareExport
                  ? "bg-cyan-500/20 text-cyan-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    : "text-slate-500 hover:text-cyan-600 hover:bg-cyan-50"
              }`}
              title="Teilen & Export"
            >
              <Export size={16} />
              Teilen
            </button>

            <div
              className={`flex items-center gap-2 text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}
            >
              <Keyboard size={14} />
              <span>P Stift • E Radierer • V Auswahl • T Text</span>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <Canvas
            objects={canvasState.objects}
            onObjectsChange={updateCanvasState}
            onSelectionChange={(selectedObjs) => {
              setSelectedObjects(selectedObjs);
              if (selectedObjs.length === 1) {
                setSelectedObjectForProperties(selectedObjs[0]);
                setShowPropertiesPanel(true);
              } else if (selectedObjs.length === 0) {
                setSelectedObjectForProperties(null);
                setShowPropertiesPanel(false);
                setSelectionToolbarPosition(null);
              } else {
                // Multiple selection - close properties panel but keep selection toolbar
                setSelectedObjectForProperties(null);
                setShowPropertiesPanel(false);
              }
              // Calculate toolbar position above selection
              if (selectedObjs.length > 0 && tool === "select") {
                let minX = Infinity,
                  minY = Infinity,
                  maxX = -Infinity,
                  maxY = -Infinity;
                selectedObjs.forEach((obj) => {
                  const bounds = getObjectBounds(obj);
                  if (bounds.x < minX) minX = bounds.x;
                  if (bounds.y < minY) minY = bounds.y;
                  if (bounds.x + bounds.width > maxX)
                    maxX = bounds.x + bounds.width;
                  if (bounds.y + bounds.height > maxY)
                    maxY = bounds.y + bounds.height;
                });
                // Transform to screen coordinates
                const screenX =
                  (minX + (maxX - minX) / 2 - viewportInfo.x) *
                  viewportInfo.zoom;
                const screenY =
                  (minY - viewportInfo.y) * viewportInfo.zoom - 60;
                setSelectionToolbarPosition({
                  x: Math.max(150, screenX),
                  y: Math.max(60, screenY),
                });
              }
            }}
            connections={canvasState.connections}
            onConnectionsChange={(newConnections) => {
              setAppData((prev) => {
                if (!prev) return {};
                const current = prev[currentSubject];
                if (!current) return prev;

                return {
                  ...prev,
                  [currentSubject]: {
                    ...current,
                    canvasState: {
                      ...current.canvasState,
                      connections: newConnections,
                    },
                    lastModified: Date.now(),
                  },
                };
              });
            }}
            onConnectionSelect={handleConnectionSelect}
            onContextMenu={handleContextMenu}
            tool={tool}
            color={color}
            penWidth={PEN_WIDTHS[penWidth]}
            fontSize={TEXT_SIZES[textSize]}
            fontFamily={fontFamily}
            theme={theme}
            showGrid={showGrid}
            gridSize={GRID_SIZES[gridSize]}
            gridPattern={gridPattern}
            gridColor={gridColor}
            gridAccentColor={gridAccentColor}
            gridOpacity={gridOpacity}
            selectedShape={selectedShape}
            onViewportChange={setViewportInfo}
          />

          {/* MiniMap */}
          {showMiniMap && canvasState.objects.length > 0 && (
            <MiniMap
              objects={canvasState.objects}
              canvasWidth={viewportInfo.width}
              canvasHeight={viewportInfo.height}
              viewportOffset={{
                x: -viewportInfo.x * viewportInfo.zoom,
                y: -viewportInfo.y * viewportInfo.zoom,
              }}
              viewportScale={viewportInfo.zoom}
              theme={theme}
            />
          )}

          {/* Welcome Overlay */}
          {showWelcome && canvasState.objects.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`text-center p-8 rounded-2xl ${
                  theme === "dark" ? "bg-slate-900/80" : "bg-white/80"
                } backdrop-blur-sm max-w-md pointer-events-auto`}
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: currentConfig?.color || "#6366F1" }}
                >
                  <Info size={32} className="text-white" weight="fill" />
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}
                >
                  Willkommen bei {currentConfig?.name || currentSubject}
                </h3>
                <p
                  className={`text-sm mb-4 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
                >
                  Beginne mit dem Zeichnen, um deine IT-Konzepte zu
                  visualisieren. Nutze die Werkzeugleiste unten oder
                  Tastenkürzel für schnellen Zugriff.
                </p>
                <div
                  className={`grid grid-cols-2 gap-2 text-xs ${theme === "dark" ? "text-slate-500" : "text-slate-500"}`}
                >
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`px-2 py-1 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                      P
                    </kbd>
                    <span>Stift</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`px-2 py-1 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                      E
                    </kbd>
                    <span>Radierer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`px-2 py-1 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                      R
                    </kbd>
                    <span>Rechteck</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd
                      className={`px-2 py-1 rounded ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                      T
                    </kbd>
                    <span>Text</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === "dark"
                      ? "text-slate-400 hover:text-white hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Verstanden
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Toolbar */}
        <FloatingToolbar
          tool={tool}
          onToolChange={handleToolChange}
          color={color}
          onColorChange={setColor}
          penWidth={penWidth}
          onPenWidthChange={setPenWidth}
          textSize={textSize}
          onTextSizeChange={setTextSize}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          showGrid={showGrid}
          onGridToggle={handleGridToggle}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          gridPattern={gridPattern}
          onGridPatternChange={setGridPattern}
          gridColor={gridColor}
          gridAccentColor={gridAccentColor}
          onGridColorChange={handleGridColorChange}
          gridOpacity={gridOpacity}
          onGridOpacityChange={handleGridOpacityChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onExport={handleExport}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onImport={handleImport}
          onShowPresentations={() => setShowPresentations(true)}
          onShowShapePicker={() => setShowShapePicker(true)}
          onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
          canUndo={canUndo}
          canRedo={canRedo}
          currentSubject={currentSubject}
          selectedShape={selectedShape}
        />
      </div>

      {/* Shape Picker Panel */}
      {showShapePicker && (
        <ShapePicker
          onSelectShape={handleSelectShape}
          onClose={() => setShowShapePicker(false)}
          theme={theme}
        />
      )}

      <PresentationsDialog
        open={showPresentations}
        onOpenChange={setShowPresentations}
        subjects={appData || {}}
        onLoadSubject={setCurrentSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
        theme={theme}
      />

      {/* Shape Properties Panel */}
      {showPropertiesPanel && selectedObjectForProperties && (
        <ShapePropertiesPanel
          selectedObject={selectedObjectForProperties}
          onUpdateObject={handleUpdateObject}
          onDeleteObject={handleDeleteObjectFromPanel}
          onDuplicateObject={handleDuplicateObject}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onClose={() => {
            setShowPropertiesPanel(false);
            setSelectedObjectForProperties(null);
          }}
          theme={theme}
        />
      )}

      {/* Connection Properties Panel */}
      {showConnectionPanel && selectedConnection && (
        <ConnectionPropertiesPanel
          connection={selectedConnection}
          objects={canvasState.objects}
          onUpdateConnection={handleUpdateConnection}
          onDeleteConnection={handleDeleteConnection}
          onClose={() => {
            setShowConnectionPanel(false);
            setSelectedConnection(null);
          }}
          theme={theme}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedObjects={contextMenu.selectedObjects}
          allObjects={canvasState.objects}
          onClose={handleContextMenuClose}
          onDelete={handleDeleteMultiple}
          onDuplicate={handleDuplicateMultiple}
          onBringToFront={handleBringToFrontMultiple}
          onSendToBack={handleSendToBackMultiple}
          onToggleLock={handleToggleLock}
          onToggleVisibility={handleToggleVisibility}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          onSelectAll={handleSelectAll}
          onShowProperties={(obj) => {
            setSelectedObjectForProperties(obj);
            setShowPropertiesPanel(true);
            handleContextMenuClose();
          }}
          onRotate={handleRotateMultiple}
          onOpenConfig={(obj) => {
            handleOpenShapeConfig(obj);
            handleContextMenuClose();
          }}
          onOpenTerminal={(obj) => {
            handleOpenTerminal(obj);
            handleContextMenuClose();
          }}
          theme={theme}
        />
      )}

      {/* Selection Toolbar */}
      {tool === "select" &&
        selectedObjects.length > 0 &&
        selectionToolbarPosition && (
          <SelectionToolbar
            selectedObjects={selectedObjects}
            position={selectionToolbarPosition}
            onDelete={() =>
              handleDeleteMultiple(selectedObjects.map((o) => o.id))
            }
            onDuplicate={() =>
              handleDuplicateMultiple(selectedObjects.map((o) => o.id))
            }
            onBringToFront={() =>
              handleBringToFrontMultiple(selectedObjects.map((o) => o.id))
            }
            onSendToBack={() =>
              handleSendToBackMultiple(selectedObjects.map((o) => o.id))
            }
            onToggleLock={() =>
              handleToggleLock(selectedObjects.map((o) => o.id))
            }
            onGroup={() => handleGroup(selectedObjects.map((o) => o.id))}
            onRotate={(degrees) =>
              handleRotateMultiple(
                selectedObjects.map((o) => o.id),
                degrees,
              )
            }
            onSetLayer={(layer) => {
              const updatedObjects = canvasState.objects.map((obj) =>
                selectedObjects.some((sel) => sel.id === obj.id)
                  ? { ...obj, layer }
                  : obj,
              );
              updateCanvasState(updatedObjects);
            }}
            theme={theme}
          />
        )}

      {/* Shape Configuration Dialog */}
      <ShapeConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        shape={configDialogShape}
        onSave={handleSaveShapeConfig}
        theme={theme}
      />

      {/* Terminal Emulator */}
      {showTerminal && terminalShape && (
        <TerminalEmulator
          shape={terminalShape}
          onClose={() => {
            setShowTerminal(false);
            setTerminalShape(null);
          }}
          onUpdateHistory={handleUpdateTerminalHistory}
          onUpdateConfig={handleUpdateShapeConfigFromTerminal}
          allObjects={getCurrentCanvasState().objects}
          allConnections={getCurrentCanvasState().connections}
          theme={theme}
        />
      )}

      {/* Phase 3: Learning Path Editor */}
      {showLearningPathEditor && (
        <LearningPathEditor
          path={editingPath}
          onSave={handleSaveLearningPath}
          onClose={() => {
            setShowLearningPathEditor(false);
            setEditingPath(null);
          }}
          theme={theme}
          subject={currentSubject}
        />
      )}

      {/* Phase 3: Progress Tracker */}
      {showProgressTracker && activeLearningPath && (
        <ProgressTracker
          path={activeLearningPath}
          progress={
            userProgress[activeLearningPath.id] || {
              pathId: activeLearningPath.id,
              currentStepIndex: 0,
              completedSteps: [],
              quizScores: {},
              hintsUsed: {},
              startedAt: Date.now(),
              lastActivityAt: Date.now(),
              totalTimeSpent: 0,
              overallScore: 0,
            }
          }
          quizzes={quizzes}
          objects={canvasState.objects}
          connections={canvasState.connections}
          onUpdateProgress={handleUpdateProgress}
          onClose={() => {
            setShowProgressTracker(false);
            setActiveLearningPath(null);
          }}
          theme={theme}
        />
      )}

      {/* Phase 4: Packet Flow Visualizer */}
      {showPacketFlow && (
        <PacketFlowVisualizer
          objects={canvasState.objects}
          connections={canvasState.connections}
          theme={theme}
          onClose={() => setShowPacketFlow(false)}
          onInspectPDU={(sourceId, targetId, protocol, hopIndex) =>
            setPduInspectorData({ sourceId, targetId, protocol, hopIndex })
          }
        />
      )}

      {/* Phase 6: PDU Inspector */}
      {pduInspectorData && (
        <PDUInspector
          sourceShape={
            canvasState.objects.find(
              (o) => o.id === pduInspectorData.sourceId,
            ) || null
          }
          targetShape={
            canvasState.objects.find(
              (o) => o.id === pduInspectorData.targetId,
            ) || null
          }
          protocol={pduInspectorData.protocol}
          hopIndex={pduInspectorData.hopIndex}
          onClose={() => setPduInspectorData(null)}
          theme={theme}
        />
      )}

      {/* Phase 4: Cost Calculator */}
      {showCostCalculator && (
        <CostCalculator
          objects={canvasState.objects}
          theme={theme}
          onClose={() => setShowCostCalculator(false)}
        />
      )}

      {/* Phase 4: Metrics Dashboard */}
      {showMetrics && (
        <MetricsDashboard
          objects={canvasState.objects}
          theme={theme}
          onClose={() => setShowMetrics(false)}
        />
      )}

      {/* Phase 5: Annotation Layer */}
      {showAnnotations && (
        <AnnotationLayer
          annotations={annotations[currentSubject] || []}
          objects={canvasState.objects}
          zoom={viewportInfo.zoom}
          panX={viewportInfo.x}
          panY={viewportInfo.y}
          theme={theme}
          currentUser="Benutzer"
          currentUserColor={currentUserColor}
          onAnnotationsChange={(newAnnotations) => {
            setAnnotations((prev) => ({
              ...prev,
              [currentSubject]: newAnnotations,
            }));
          }}
          onClose={() => setShowAnnotations(false)}
        />
      )}

      {/* Phase 5: Share & Export Dialog */}
      {showShareExport && (
        <ShareExportDialog
          theme={theme}
          currentSubject={currentSubject}
          objectCount={canvasState.objects.length}
          connectionCount={canvasState.connections.length}
          onExportJSON={handleExport}
          onExportPNG={handleExportPNG}
          onExportSVG={handleExportSVG}
          onClose={() => setShowShareExport(false)}
        />
      )}

      {/* Phase 5: Template Gallery */}
      {showTemplateGallery && (
        <TemplateGallery
          theme={theme}
          customTemplates={customTemplates}
          currentObjects={canvasState.objects}
          currentConnections={canvasState.connections}
          onApplyTemplate={(objects, connections) => {
            setShowWelcome(false);
            setAppData((prev) => {
              if (!prev) return {};
              const current = prev[currentSubject];
              if (!current) return prev;
              const newObjects = [...current.canvasState.objects, ...objects];
              const newConnections = [
                ...current.canvasState.connections,
                ...connections,
              ];
              const newHistory = current.canvasState.history.slice(
                0,
                current.canvasState.historyIndex + 1,
              );
              newHistory.push(newObjects);
              return {
                ...prev,
                [currentSubject]: {
                  ...current,
                  canvasState: {
                    ...current.canvasState,
                    objects: newObjects,
                    connections: newConnections,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                  },
                  lastModified: Date.now(),
                },
              };
            });
          }}
          onSaveAsTemplate={(name, description, category, tags) => {
            const template = createTemplate(
              name,
              description,
              category as TemplateCategory,
              canvasState.objects,
              canvasState.connections,
              "Benutzer",
              tags,
            );
            setCustomTemplates((prev) => [...prev, template]);
          }}
          onClose={() => setShowTemplateGallery(false)}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Toaster
        position="bottom-right"
        theme={theme}
        toastOptions={{
          style: {
            background: theme === "dark" ? "#1e293b" : "#ffffff",
            border:
              theme === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            color: theme === "dark" ? "#f1f5f9" : "#1e293b",
          },
        }}
      />
    </div>
  );
}

export default App;

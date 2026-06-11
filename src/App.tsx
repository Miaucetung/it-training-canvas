import { AnnotationLayer } from "@/components/AnnotationLayer";
import { Canvas } from "@/components/Canvas";
import { CanvasContextMenu } from "@/components/CanvasContextMenu";
import { ConnectionPropertiesPanel } from "@/components/ConnectionPropertiesPanel";
import { CostCalculator } from "@/components/CostCalculator";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { MiniMap } from "@/components/MiniMap";
import { PDUInspector } from "@/components/PDUInspector";
import { PresentationsDialog } from "@/components/PresentationsDialog";
import { SelectionToolbar } from "@/components/SelectionToolbar";
import { ShapeConfigDialog } from "@/components/ShapeConfigDialog";
import { ShapePicker } from "@/components/ShapePicker";
import { ShapePropertiesPanel } from "@/components/ShapePropertiesPanel";
import { ShareExportDialog } from "@/components/ShareExportDialog";
import { Sidebar } from "@/components/Sidebar";
import { PingScenarioDialog } from "@/components/PingScenarioDialog";
import { OnboardingTour } from "@/components/OnboardingTour";
import {
  SimulationControls,
  useSimulation,
} from "@/components/SimulationControls";
import { TopicDetailPanel } from "@/components/TopicDetailPanel";
import { TopicListPanel } from "@/components/TopicListPanel";
import { TopologyValidator } from "@/components/TopologyValidator";
import { useLearningState } from "@/hooks/useLearningState";
import {
  downloadJSON,
  exportCanvasAsPNG,
  exportCanvasAsSVG,
  importFromJSON,
} from "@/lib/canvas-utils";
import { createTemplate } from "@/lib/collaboration-engine";
import { CATALOG_PREVIEW } from "@/lib/content/module-catalog";
import type { CertificationModule, Topic } from "@/lib/content/types";
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
  PEN_WIDTHS,
  PenWidth,
  ShapeConfig,
  ShapeDefinition,
  SUBJECT_CONFIGS,
  SubjectData,
  TemplateCategory,
  TerminalCommand,
  TEXT_SIZES,
  TextSize,
  Tool,
} from "@/lib/types";
import { useLocalStorage } from "@/lib/use-local-storage";
import {
  ArrowClockwise,
  BookOpen,
  CaretDown,
  ChartLine,
  CurrencyDollar,
  Export,
  FolderOpen,
  GraduationCap,
  Keyboard,
  Lightning,
  Notepad,
  Plus,
  Pulse,
  Stethoscope,
  Target,
  Terminal,
  UserCircle,
} from "@phosphor-icons/react";
import { AuthDialog } from "@/components/AuthDialog";
import { SetPasswordDialog } from "@/components/SetPasswordDialog";
import { supabase } from "@/lib/supabase";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast, Toaster } from "sonner";

// ── Lazy-loaded heavy dialogs (code-split on first use) ───────
const ExamPrepDialog = lazy(() => import("@/components/ExamPrepDialog"));
const LabScenariosDialog = lazy(() =>
  import("@/components/LabScenariosDialog").then((m) => ({ default: m.LabScenariosDialog })),
);
const LearningPathEditor = lazy(() =>
  import("@/components/LearningPathEditor").then((m) => ({ default: m.LearningPathEditor })),
);
const PacketFlowVisualizer = lazy(() =>
  import("@/components/PacketFlowVisualizer").then((m) => ({ default: m.PacketFlowVisualizer })),
);
const ProgressTracker = lazy(() =>
  import("@/components/ProgressTracker").then((m) => ({ default: m.ProgressTracker })),
);
const TemplateGallery = lazy(() =>
  import("@/components/TemplateGallery").then((m) => ({ default: m.TemplateGallery })),
);
const TerminalEmulator = lazy(() =>
  import("@/components/TerminalEmulator").then((m) => ({ default: m.TerminalEmulator })),
);

function getObjectBounds(obj: DrawingObject): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
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
  return { x: 0, y: 0, width: 100, height: 100 };
}

// ── Phase 6c-1: Catalog → Subject-ID mapping ─────────────────
// Maps CATALOG_PREVIEW slugs to SUBJECT_CONFIGS keys.
const CATALOG_SLUG_TO_SUBJECT: Record<string, string> = {
  ccna: "CCNA",
  "az-900": "AZ-900",
  "comptia-network-plus": "NetworkPlus",
};

// Reverse map: Subject-ID → module ID (for TopicListPanel, Phase 6c-2)
export const SUBJECT_TO_MODULE_ID: Record<string, string> = {
  CCNA: "ccna",
  "AZ-900": "az-900",
  NetworkPlus: "comptia-network-plus",
};

// New subjects from the catalog that aren't already in DEFAULT_SUBJECTS.
// These are injected alongside legacy subjects so catalog modules appear in the Sidebar.
const CATALOG_SUBJECTS: string[] = CATALOG_PREVIEW.map(
  (m) => CATALOG_SLUG_TO_SUBJECT[m.slug],
).filter((s): s is string => !!s && !DEFAULT_SUBJECTS.includes(s));

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  // Phase 6c-3: selected topic for detail panel
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTopicModule, setSelectedTopicModule] =
    useState<CertificationModule | null>(null);
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
  const [showSimulationHUD, setShowSimulationHUD] = useState(false);
  const [showPingScenario, setShowPingScenario] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLabScenarios, setShowLabScenarios] = useState(false);
  const [showExamPrep, setShowExamPrep] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  /** UI density: "simple" hides connection labels for clean overview, "detail" shows everything. */
  const [viewDensity, setViewDensity] = useState<"simple" | "detail">("detail");
  const [showTopologyValidator, setShowTopologyValidator] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [canvasView, setCanvasView] = useState(false);
  const [moreMenuPos, setMoreMenuPos] = useState<{ top: number; right: number } | null>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreMenuContentRef = useRef<HTMLDivElement>(null);

  // Phase 5: Collaboration State
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showShareExport, setShowShareExport] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  // QW-4: Template-ID die beim Öffnen der Gallery vorausgewählt wird (von Topic-CTA)
  const [pendingTemplateId, setPendingTemplateId] = useState<
    string | undefined
  >(undefined);
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

  // Phase 3: Learning Engine State (extracted to useLearningState hook)
  const {
    user,
    isRecoveryMode,
    clearRecoveryMode,
    learningPaths,
    quizzes,
    userProgress,
    editingPath,
    setEditingPath,
    activeLearningPath,
    setActiveLearningPath,
    showLearningPathEditor,
    setShowLearningPathEditor,
    showProgressTracker,
    setShowProgressTracker,
    handleSaveLearningPath,
    handleStartLearningPath,
    handleUpdateProgress,
  } = useLearningState();

  const [selectionToolbarPosition, setSelectionToolbarPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

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

  // Stabile Handler für memoized Children (Canvas, Sidebar, FloatingToolbar)
  const viewportInfoRef = useRef(viewportInfo);
  viewportInfoRef.current = viewportInfo;

  const handleSubjectChange = useCallback((s: string) => {
    setCurrentSubject(s);
    setSelectedTopic(null);
    setSelectedTopicModule(null);
  }, []);

  const handleToggleSidebar = useCallback(
    () => setSidebarCollapsed((v) => !v),
    [],
  );

  const handleSelectionChange = useCallback(
    (selectedObjs: DrawingObject[]) => {
      setSelectedObjects(selectedObjs);
      if (selectedObjs.length === 1) {
        setSelectedObjectForProperties(selectedObjs[0]);
        setShowPropertiesPanel(true);
      } else if (selectedObjs.length === 0) {
        setSelectedObjectForProperties(null);
        setShowPropertiesPanel(false);
        setSelectionToolbarPosition(null);
      } else {
        setSelectedObjectForProperties(null);
        setShowPropertiesPanel(false);
      }
      if (selectedObjs.length > 0 && tool === "select") {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        selectedObjs.forEach((obj) => {
          const bounds = getObjectBounds(obj);
          if (bounds.x < minX) minX = bounds.x;
          if (bounds.y < minY) minY = bounds.y;
          if (bounds.x + bounds.width > maxX) maxX = bounds.x + bounds.width;
          if (bounds.y + bounds.height > maxY) maxY = bounds.y + bounds.height;
        });
        const vp = viewportInfoRef.current;
        const screenX = (minX + (maxX - minX) / 2 - vp.x) * vp.zoom;
        const screenY = (minY - vp.y) * vp.zoom - 60;
        setSelectionToolbarPosition({
          x: Math.max(150, screenX),
          y: Math.max(60, screenY),
        });
      }
    },
    [tool],
  );

  const handleConnectionsChange = useCallback(
    (newConnections: CanvasConnection[]) => {
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
    },
    [currentSubject, setAppData],
  );

  const handleShowPresentations = useCallback(
    () => setShowPresentations(true),
    [],
  );
  const handleShowKeyboardShortcuts = useCallback(
    () => setShowKeyboardShortcuts(true),
    [],
  );

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
      } catch {
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
    setCanvasView(!(SUBJECT_TO_MODULE_ID[currentSubject] ?? null));
  }, [currentSubject]);

  useEffect(() => {
    if (!showMoreMenu) return;
    const handler = (e: MouseEvent) => {
      const inButton = moreMenuRef.current?.contains(e.target as Node);
      const inContent = moreMenuContentRef.current?.contains(e.target as Node);
      if (!inButton && !inContent) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMoreMenu]);

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
  const canvasState = getCurrentCanvasState();
  const canUndo = canvasState.historyIndex > 0;
  const canRedo = canvasState.historyIndex < canvasState.history.length - 1;
  const currentConfig = SUBJECT_CONFIGS[currentSubject];
  // Phase 6c-2: resolve catalog module ID for current subject (null = legacy)
  const catalogModuleId = SUBJECT_TO_MODULE_ID[currentSubject] ?? null;

  // Simulation engine (Packet-Tracer-style HUD)
  const noopObjects = useCallback((_o: DrawingObject[]) => {}, []);
  const noopConnections = useCallback((_c: CanvasConnection[]) => {}, []);
  const { simulationState, setSimulationState, sendPacket } = useSimulation(
    canvasState.objects,
    canvasState.connections,
    noopObjects,
    noopConnections,
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-white flex">
      {/* Sidebar */}
      <Sidebar
        subjects={subjects}
        currentSubject={currentSubject}
        onSubjectChange={handleSubjectChange}
        onAddSubject={handleAddSubject}
        onRemoveSubject={handleRemoveSubject}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const paths = Object.values(learningPaths);
                if (paths.length > 0) {
                  handleStartLearningPath(paths[0]);
                } else {
                  setEditingPath(null);
                  setShowLearningPathEditor(true);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setEditingPath(null);
                setShowLearningPathEditor(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeLearningPath
                  ? "bg-indigo-500/20 text-indigo-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
              }`}
              title="Lernpfade starten (Rechtsklick: neuen Pfad anlegen)"
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

            <div className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`} />

            <button
              onClick={() => setShowShapePicker(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "text-slate-400 hover:text-sky-300 hover:bg-sky-500/10"
                  : "text-slate-500 hover:text-sky-600 hover:bg-sky-50"
              }`}
              title="Netzwerkgerät hinzufügen (Router, Switch, PC, Server …)"
            >
              <Plus size={16} />
              Gerät
            </button>
            <button
              onClick={() => {
                const sel = canvasState.objects.find(
                  (o) => o.selected && o.type === "shape",
                );
                if (sel) {
                  handleOpenTerminal(sel);
                } else {
                  toast.info(
                    "Wähle zuerst ein Netzwerkgerät auf dem Canvas aus",
                    { duration: 2500 },
                  );
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showTerminal
                  ? "bg-green-500/20 text-green-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-green-300 hover:bg-green-500/10"
                    : "text-slate-500 hover:text-green-600 hover:bg-green-50"
              }`}
              title="IOS-CLI für selektiertes Gerät öffnen"
            >
              <Terminal size={16} />
              CLI
            </button>
            <button
              onClick={() => setShowLabScenarios(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showLabScenarios
                  ? "bg-violet-500/20 text-violet-300"
                  : theme === "dark"
                    ? "text-slate-400 hover:text-violet-300 hover:bg-violet-500/10"
                    : "text-slate-500 hover:text-violet-600 hover:bg-violet-50"
              }`}
              title="Lab-Szenarien — Schritt-für-Schritt Cisco IOS Übungen"
            >
              <BookOpen size={16} />
              Labs
            </button>
            <button
              onClick={() => setShowExamPrep(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                theme === "dark"
                  ? "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100"
              }`}
              title="CCNA Prüfungsvorbereitung — 1200+ echte Prüfungsfragen"
            >
              <Target size={16} weight="fill" />
              Prüfung
            </button>
            <button
              onClick={() => setShowPingScenario(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                theme === "dark"
                  ? "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"
                  : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
              }`}
              title="Ping testen – geführte Schritt-für-Schritt-Analyse"
            >
              <Lightning size={16} weight="fill" />
              Ping testen
            </button>

            <div className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`} />

            {/* Mehr-Dropdown */}
            <div ref={moreMenuRef} className="relative">
              <button
                ref={moreButtonRef}
                onClick={() => {
                  if (!showMoreMenu && moreButtonRef.current) {
                    const rect = moreButtonRef.current.getBoundingClientRect();
                    setMoreMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
                  }
                  setShowMoreMenu((prev) => !prev);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showMoreMenu ||
                  showPacketFlow ||
                  showSimulationHUD ||
                  showMetrics ||
                  showAnnotations ||
                  showTemplateGallery ||
                  showShareExport ||
                  showCostCalculator
                    ? theme === "dark"
                      ? "bg-slate-700 text-slate-200"
                      : "bg-slate-100 text-slate-700"
                    : theme === "dark"
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
                title="Weitere Werkzeuge"
              >
                Mehr
                <CaretDown
                  size={12}
                  className={`transition-transform duration-150 ${showMoreMenu ? "rotate-180" : ""}`}
                />
              </button>
              {showMoreMenu && moreMenuPos && createPortal(
                <div
                  ref={moreMenuContentRef}
                  style={{ top: moreMenuPos.top, right: moreMenuPos.right }}
                  className={`fixed z-[200] min-w-[210px] rounded-xl border shadow-2xl py-1.5 ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-700/80"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <p className={`px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                    Simulation
                  </p>
                  <button
                    onClick={() => { setShowPacketFlow(!showPacketFlow); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showPacketFlow ? theme === "dark" ? "bg-emerald-500/10 text-emerald-300" : "bg-emerald-50 text-emerald-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Lightning size={15} />
                    Paketfluss
                    {showPacketFlow && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                  <button
                    onClick={() => { setShowSimulationHUD(!showSimulationHUD); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showSimulationHUD ? theme === "dark" ? "bg-teal-500/10 text-teal-300" : "bg-teal-50 text-teal-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Pulse size={15} />
                    Simulation
                    {simulationState.isRunning && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
                  </button>
                  <button
                    onClick={() => { setShowTopologyValidator(true); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Stethoscope size={15} />
                    Topologie prüfen
                  </button>
                  <button
                    onClick={() => { setShowMetrics(!showMetrics); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showMetrics ? theme === "dark" ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <ChartLine size={15} />
                    Metriken
                    {showMetrics && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </button>

                  <div className={`my-1.5 mx-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} />

                  <p className={`px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                    Kollaboration
                  </p>
                  <button
                    onClick={() => { setShowAnnotations(!showAnnotations); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showAnnotations ? theme === "dark" ? "bg-pink-500/10 text-pink-300" : "bg-pink-50 text-pink-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Notepad size={15} />
                    Notizen
                    {(annotations[currentSubject]?.length ?? 0) > 0 && (
                      <span className={`ml-auto px-1.5 rounded-full text-[10px] ${theme === "dark" ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                        {annotations[currentSubject]?.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setShowTemplateGallery(!showTemplateGallery); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showTemplateGallery ? theme === "dark" ? "bg-violet-500/10 text-violet-300" : "bg-violet-50 text-violet-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <FolderOpen size={15} />
                    Vorlagen
                  </button>
                  <button
                    onClick={() => { setShowShareExport(!showShareExport); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showShareExport ? theme === "dark" ? "bg-cyan-500/10 text-cyan-300" : "bg-cyan-50 text-cyan-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Export size={15} />
                    Teilen & Export
                  </button>

                  <div className={`my-1.5 mx-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} />

                  <button
                    onClick={() => { setShowCostCalculator(!showCostCalculator); setShowMoreMenu(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${showCostCalculator ? theme === "dark" ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700" : theme === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <CurrencyDollar size={15} />
                    Kosten-Rechner
                    {showCostCalculator && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </button>
                </div>,
                document.body
              )}
            </div>

            <div className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`} />

            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              }`}
              title="Tastenkürzel & Hilfe (?)"
            >
              <Keyboard size={16} />
            </button>

            <div className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`} />

            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === "dark"
                    ? "text-emerald-400 hover:bg-zinc-700"
                    : "text-emerald-600 hover:bg-emerald-50"
                }`}
                title={`Angemeldet als ${user.email} — Klicken zum Abmelden`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  theme === "dark" ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {user.email?.[0]?.toUpperCase() ?? "?"}
                </span>
                <span className="max-w-[80px] truncate hidden sm:block">{user.email?.split("@")[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthDialog(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  theme === "dark"
                    ? "border-sky-700/60 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/80"
                    : "border-sky-400/60 text-sky-600 hover:bg-sky-50 hover:border-sky-500"
                }`}
                title="Anmelden — Fortschritt geräteübergreifend synchronisieren"
              >
                <UserCircle size={15} />
                Anmelden
              </button>
            )}

            <div className={`w-px h-5 ${theme === "dark" ? "bg-slate-700" : "bg-slate-300"}`} />

            <button
              onClick={() => setCanvasView((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                canvasView
                  ? theme === "dark"
                    ? "border-indigo-600/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                    : "border-indigo-400/50 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  : theme === "dark"
                    ? "border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:bg-slate-800"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title={canvasView ? "Zurück zur Lernoberfläche" : "Zum Canvas wechseln"}
            >
              <ArrowClockwise size={14} />
              {canvasView ? "Lernen" : "Canvas"}
            </button>
          </div>
        </div>

        {/* Canvas / Topic — 3D Flip */}
        <div className="flex-1 relative overflow-hidden" style={{ perspective: "1400px" }}>
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: canvasView ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT: Lernoberfläche — Dashboard */}
            <div
              className="absolute inset-0 overflow-hidden flex"
              inert={canvasView || undefined}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], pointerEvents: canvasView ? "none" : "auto" }}
            >
              {catalogModuleId ? (
                <>
                  {/* Left: Topic list — fixed sidebar */}
                  <div
                    className={`w-72 shrink-0 overflow-y-auto border-r ${
                      theme === "dark" ? "border-slate-700/50 bg-slate-900/40" : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <TopicListPanel
                      moduleId={catalogModuleId}
                      theme={theme}
                      onTopicClick={(topic, mod) => {
                        setSelectedTopic(topic);
                        setSelectedTopicModule(mod);
                      }}
                    />
                  </div>

                  {/* Right: Topic detail or placeholder */}
                  <div className="flex-1 overflow-hidden">
                    {selectedTopic && selectedTopicModule ? (
                      <TopicDetailPanel
                        topic={selectedTopic}
                        module={selectedTopicModule}
                        theme={theme}
                        onOpenTemplate={(tplId) => {
                          setPendingTemplateId(tplId);
                          setShowTemplateGallery(true);
                        }}
                        onClose={() => {
                          setSelectedTopic(null);
                          setSelectedTopicModule(null);
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-xs px-6">
                          <p className={`text-base font-medium mb-2 ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                            Thema auswählen
                          </p>
                          <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                            Wähle ein Thema aus der Liste, um den Lerninhalt anzuzeigen.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className={`text-sm ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                    Kein Lerninhalt für dieses Thema.
                  </p>
                </div>
              )}
            </div>

            {/* BACK: Canvas */}
            <div
              className="absolute inset-0 overflow-hidden"
              inert={!canvasView || undefined}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
                transform: "rotateY(180deg)",
                pointerEvents: canvasView ? "auto" : "none",
              }}
            >
              {/* Floating View-Density toggle (Simple ↔ Detail) */}
              <div
                className="absolute top-2 right-2 z-30 flex items-center gap-0 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-900/80 backdrop-blur-sm shadow-lg text-xs"
                title="Anzeige-Dichte umschalten — Simple blendet Verbindungs-Labels aus für klare Übersicht"
              >
                <button
                  onClick={() => setViewDensity("simple")}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    viewDensity === "simple"
                      ? "bg-cyan-500/30 text-cyan-200"
                      : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setViewDensity("detail")}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    viewDensity === "detail"
                      ? "bg-cyan-500/30 text-cyan-200"
                      : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                  }`}
                >
                  Detail
                </button>
              </div>

              {/* Floating help / tour button */}
              <button
                onClick={() => setShowOnboarding(true)}
                title="Tour erneut öffnen — die wichtigsten Funktionen kurz erklärt"
                className="absolute bottom-4 right-4 z-30 w-9 h-9 flex items-center justify-center rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white text-base font-bold shadow-lg backdrop-blur-sm transition-colors"
              >
                ?
              </button>

              <Canvas
                objects={canvasState.objects}
                onObjectsChange={updateCanvasState}
                onSelectionChange={handleSelectionChange}
                connections={canvasState.connections}
                onConnectionsChange={handleConnectionsChange}
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
                showConnectionLabels={viewDensity === "detail"}
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
                    className={`text-center p-6 rounded-2xl ${
                      theme === "dark" ? "bg-slate-900/80" : "bg-white/80"
                    } backdrop-blur-sm max-w-sm w-full mx-4 pointer-events-auto`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                        theme === "dark" ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Canvas ist leer
                    </p>
                    <p
                      className={`text-sm mb-5 ${
                        theme === "dark" ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Womit möchtest du beginnen?
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setShowTemplateGallery(true)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        }`}
                      >
                        Template laden
                      </button>
                      <button
                        onClick={() => setShowShapePicker(true)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                            : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Shape platzieren
                      </button>
                      <button
                        onClick={() => setSidebarCollapsed(false)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                            : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Aus Topic starten
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Toolbar — only visible on canvas face */}
        {canvasView && (
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
            onShowPresentations={handleShowPresentations}
            onShowKeyboardShortcuts={handleShowKeyboardShortcuts}
            onSelectAll={handleSelectAll}
            canUndo={canUndo}
            canRedo={canRedo}
            currentSubject={currentSubject}
            selectedShape={selectedShape}
          />
        )}
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

      <PingScenarioDialog
        open={showPingScenario}
        onClose={() => setShowPingScenario(false)}
        objects={canvasState.objects}
        connections={canvasState.connections}
      />

      <Suspense fallback={null}>
        <LabScenariosDialog
          open={showLabScenarios}
          onClose={() => setShowLabScenarios(false)}
          theme={theme}
        />
      </Suspense>

      {showExamPrep && (
        <Suspense fallback={null}>
          <ExamPrepDialog
            dark={theme === "dark"}
            onClose={() => setShowExamPrep(false)}
          />
        </Suspense>
      )}

      {isRecoveryMode && (
        <SetPasswordDialog
          dark={theme === "dark"}
          onClose={clearRecoveryMode}
        />
      )}

      {!isRecoveryMode && showAuthDialog && (
        <AuthDialog
          dark={theme === "dark"}
          onClose={() => setShowAuthDialog(false)}
        />
      )}

      <OnboardingTour
        forceOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
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
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* Simulation HUD (Packet-Tracer-style controls) */}
      {showSimulationHUD && (
        <SimulationControls
          objects={canvasState.objects}
          connections={canvasState.connections}
          simulationState={simulationState}
          onSimulationChange={setSimulationState}
          onPacketSend={sendPacket}
          theme={theme}
        />
      )}

      {/* Topology Validator dialog */}
      <TopologyValidator
        open={showTopologyValidator}
        onOpenChange={setShowTopologyValidator}
        objects={canvasState.objects}
        connections={canvasState.connections}
        theme={theme}
        onSelectObject={(id) => {
          const newObjects = canvasState.objects.map((o) => ({
            ...o,
            selected: o.id === id,
          }));
          updateCanvasState(newObjects);
          setShowTopologyValidator(false);
        }}
      />

      {/* Phase 3: Learning Path Editor */}
      {showLearningPathEditor && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* Phase 3: Progress Tracker */}
      {showProgressTracker && activeLearningPath && (
        <Suspense fallback={null}>
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
        </Suspense>
      )}

      {/* Phase 4: Packet Flow Visualizer */}
      {showPacketFlow && (
        <Suspense fallback={null}>
          <PacketFlowVisualizer
            objects={canvasState.objects}
            connections={canvasState.connections}
            theme={theme}
            onClose={() => setShowPacketFlow(false)}
            onInspectPDU={(sourceId, targetId, protocol, hopIndex) =>
              setPduInspectorData({ sourceId, targetId, protocol, hopIndex })
            }
          />
        </Suspense>
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
        <Suspense fallback={null}>
        <TemplateGallery
          theme={theme}
          customTemplates={customTemplates}
          currentObjects={canvasState.objects}
          currentConnections={canvasState.connections}
          viewport={viewportInfo}
          initialTemplateId={pendingTemplateId}
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
          onClose={() => {
            setShowTemplateGallery(false);
            setPendingTemplateId(undefined);
          }}
        />
        </Suspense>
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

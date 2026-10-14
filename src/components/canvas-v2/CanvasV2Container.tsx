import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  NetworkTopology,
  TopologyAnnotation,
  TopologyDevice,
  TopologyLink,
} from "@/types/topology";
import {
  BUILT_IN_CCNA_TOPOLOGIES,
  generateBenchmarkTopology,
  TOPOLOGY_ROUTER_ON_A_STICK,
} from "@/lib/topology/sample-topologies";
import {
  restoreBackupSnapshot,
  safeSetItem,
  V2_STORAGE_KEY,
  MigrationConflict,
} from "@/lib/topology/migration";
import {
  createNewDevice,
  addDeviceToTopology,
  addLinkToTopology,
  moveDeviceInTopology,
  deleteDeviceFromTopology,
  deleteLinkFromTopology,
  snapToGrid,
  DEFAULT_GRID_SIZE,
  createNewAnnotation,
  addAnnotationToTopology,
  updateAnnotationInTopology,
  deleteAnnotationFromTopology,
  moveAnnotationInTopology,
  smoothFreehandPoints,
  findNextSpatialElement,
  SpatialDirection,
  SpatialElementTarget,
} from "@/lib/topology/topology-operations";
import { useTopologyHistory } from "@/hooks/useTopologyHistory";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { computeOspfNeighbors } from "@/lib/topology/ospf-neighbors";
import { ipv6Hints } from "@/lib/topology/ipv6-routing";
import { stpHints } from "@/lib/topology/stp-hints";
import { vtpHints } from "@/lib/topology/vtp-status";
import { natHints } from "@/lib/topology/nat-outputs";
import { AnnotationHandleType, SvgTopologyRenderer } from "./SvgTopologyRenderer";
import { TopologyLegend } from "./TopologyLegend";
import { CanvasToolMode, DevicePalette } from "./DevicePalette";
import { ConnectDialog } from "./ConnectDialog";
import { DeviceContextMenu } from "./DeviceContextMenu";
import { DeviceConfigDialog } from "./DeviceConfigDialog";
import { StorageTab, TopologyStorageDialog } from "./TopologyStorageDialog";
import { TopologyScreenReaderView } from "./TopologyScreenReaderView";
import { downloadBlob, saveNamedTopology } from "@/lib/topology/storage-manager";
import { validateTopology } from "@/lib/topology/topology-validation";
import { toast } from "sonner";
import {
  ArrowsIn,
  FloppyDisk,
  Gear,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ShieldCheck,
  Table,
  Terminal,
  Warning,
  X,
} from "@phosphor-icons/react";

interface CanvasV2ContainerProps {
  initialTopology?: NetworkTopology;
  onSwitchToV1?: () => void;
  theme?: "dark" | "light";
  externalStorageTab?: StorageTab | null;
  onCloseStorageDialog?: () => void;
  /** Aufforderung aus dem Lab-Dialog: Lab-Topologie als neue Vorlage laden (nonce erzwingt erneutes Laden) */
  labRequest?: { labId: string; nonce: number } | null;
  /** Rücksprung zum Lab, aus dem die aktive Vorlage stammt */
  onBackToLab?: (labId: string) => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.0;

export const CanvasV2Container: React.FC<CanvasV2ContainerProps> = ({
  initialTopology = TOPOLOGY_ROUTER_ON_A_STICK,
  onSwitchToV1,
  theme = "dark",
  externalStorageTab = null,
  onCloseStorageDialog,
  labRequest = null,
  onBackToLab,
}) => {
  const isDark = theme === "dark";

  // Undo / Redo Historie mit useTopologyHistory Hook
  const {
    topology: activeTopology,
    setTopology,
    undo,
    redo,
    canUndo,
    canRedo,
    resetTopology,
  } = useTopologyHistory(initialTopology);

  // Topologie-Auswahl
  const [selectedTopologyId, setSelectedTopologyId] = useState<string>(initialTopology.id);
  const [migratedTopologies, setMigratedTopologies] = useState<Record<string, NetworkTopology> | null>(null);
  const [migrationConflicts, setMigrationConflicts] = useState<MigrationConflict[]>([]);

  // Viewport & Zoom/Pan State
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch Zoom (Pinch) Tracking
  const lastTouchDistRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartClientRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Bearbeitungs-Modi & Palette (Schritte 2d-1 & 2d-2)
  const [activePlacementType, setActivePlacementType] = useState<TopologyDevice["type"] | null>(null);
  const [activeMode, setActiveMode] = useState<CanvasToolMode>("select");
  const [activeAnnotationColor, setActiveAnnotationColor] = useState<string>("#F59E0B");
  const [snapGrid, setSnapGrid] = useState<boolean>(false);

  // Dragging von Geräten auf dem Canvas
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragStartClient, setDragStartClient] = useState<{ x: number; y: number } | null>(null);
  const [initialDevicePos, setInitialDevicePos] = useState<{ x: number; y: number } | null>(null);
  const [hasMovedDevice, setHasMovedDevice] = useState<boolean>(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dragging & Resizing von Annotationen (Schritt 2d-2)
  const [selectedAnnotation, setSelectedAnnotation] = useState<TopologyAnnotation | null>(null);
  const [draggingAnnotationId, setDraggingAnnotationId] = useState<string | null>(null);
  const [hasMovedAnnotation, setHasMovedAnnotation] = useState<boolean>(false);
  const [draggingHandle, setDraggingHandle] = useState<{
    annotation: TopologyAnnotation;
    handle: AnnotationHandleType;
    startClient: { x: number; y: number };
  } | null>(null);

  // Live-Zeichnen von Annotationen
  const [isDrawingAnnotation, setIsDrawingAnnotation] = useState<boolean>(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingAnnotationPreview, setDrawingAnnotationPreview] = useState<TopologyAnnotation | null>(null);

  // Inline-Editor für Text und Notizen (DOM-Overlay)
  const [editingAnnotation, setEditingAnnotation] = useState<{
    id: string;
    text: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
  } | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  // Verbindungs-Dialog & Kontextmenü
  const [connectSourceDevice, setConnectSourceDevice] = useState<TopologyDevice | null>(null);
  const [connectDialogState, setConnectDialogState] = useState<{
    source: TopologyDevice;
    target: TopologyDevice;
  } | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    device: TopologyDevice;
    x: number;
    y: number;
  } | null>(null);

  // View-Optionen
  const [viewDensity, setViewDensity] = useState<"simple" | "detail">("detail");
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Selektion
  const [selectedDevice, setSelectedDevice] = useState<TopologyDevice | null>(null);
  const [selectedLink, setSelectedLink] = useState<TopologyLink | null>(null);

  // Schritt 2d-3 Dialoge & Storage
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState<boolean>(false);
  const [isStorageDialogOpen, setIsStorageDialogOpen] = useState<boolean>(false);
  const [storageDialogTab, setStorageDialogTab] = useState<StorageTab>("templates");
  const [showScreenReaderView, setShowScreenReaderView] = useState<boolean>(false);

  useEffect(() => {
    if (externalStorageTab) {
      setStorageDialogTab(externalStorageTab);
      setIsStorageDialogOpen(true);
    }
  }, [externalStorageTab]);

  // Performance-Tracking
  const [renderDurationMs, setRenderDurationMs] = useState<number>(0);

  // Live-Diagnose der Topologie
  const diagnostics = useMemo(() => validateTopology(activeTopology), [activeTopology]);

  // Debounced Autosave (1500ms Drosselung nach Änderungen)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveNamedTopology(activeTopology);
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeTopology]);

  // Viewport Container Ref für ResizeObserver und Koordinaten-Messung
  const viewportRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // Dynamisch generierte Cisco Show-Ausgaben für das selektierte Gerät
  const dynamicShowOutputs = useMemo(() => {
    if (!selectedDevice) return {};
    return CiscoCliGenerator.getDynamicShowOutputs(selectedDevice, activeTopology);
  }, [selectedDevice, activeTopology]);

  const ipv6HintList = useMemo(
    () => (selectedDevice ? [...ipv6Hints(selectedDevice), ...stpHints(selectedDevice), ...vtpHints(selectedDevice, activeTopology), ...natHints(selectedDevice)] : []),
    [selectedDevice, activeTopology]
  );

  // Broadcast-Segment mit DR/BDR-Wahl: Hinweis zur Nicht-Präemption
  const hasOspfBroadcastSegment = useMemo(() => {
    if (!selectedDevice) return false;
    return computeOspfNeighbors(selectedDevice, activeTopology).some((a) => a.networkType === "broadcast");
  }, [selectedDevice, activeTopology]);

  // Gespeicherte V2-Topologien beim Start laden (Migration läuft ausschließlich bei aktivem Umschalten in App.tsx)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(V2_STORAGE_KEY);
      if (stored) {
        setMigratedTopologies(JSON.parse(stored));
      }
    } catch {
      // Ignorieren falls JSON fehlerhaft
    }
  }, []);

  // ResizeObserver: Reaktives Tracking für Container-Größe
  useEffect(() => {
    if (!viewportRef.current) return;

    let rafId: number | null = null;
    const observer = new ResizeObserver((entries) => {
      if (entries.length === 0) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setContainerSize({ width: Math.max(200, width), height: Math.max(200, height) });
      });
    });

    observer.observe(viewportRef.current);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Ansicht einpassen (Fit View)
  const fitView = useCallback((topo = activeTopology) => {
    if (topo.devices.length === 0 && (!topo.annotations || topo.annotations.length === 0)) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
      return;
    }

    const allX: number[] = [
      ...topo.devices.map((d) => d.x),
      ...topo.devices.map((d) => d.x + (d.width || 80)),
      ...(topo.annotations || []).map((a) => a.x),
      ...(topo.annotations || []).map((a) => a.x + (a.width || 80)),
      ...(topo.subnetZones || []).flatMap((z) => [z.x, z.x + z.width]),
    ];
    const allY: number[] = [
      ...topo.devices.map((d) => d.y),
      ...topo.devices.map((d) => d.y + (d.height || 60)),
      ...(topo.annotations || []).map((a) => a.y),
      ...(topo.annotations || []).map((a) => a.y + (a.height || 60)),
      ...(topo.subnetZones || []).flatMap((z) => [z.y, z.y + z.height]),
    ];

    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const width = maxX - minX + 120;
    const height = maxY - minY + 120;

    const targetW = containerSize.width || (window.innerWidth > 640 ? 860 : 360);
    const targetH = containerSize.height || (window.innerHeight > 640 ? 550 : 420);

    const scaleX = targetW / width;
    const scaleY = targetH / height;
    const optimalScale = Math.min(1.5, Math.max(MIN_SCALE, Math.min(scaleX, scaleY) * 0.9));

    setScale(optimalScale);
    setTranslateX((targetW - width * optimalScale) / 2 - minX * optimalScale + 60 * optimalScale);
    setTranslateY((targetH - height * optimalScale) / 2 - minY * optimalScale + 60 * optimalScale);
  }, [activeTopology, containerSize]);

  // Unterrichts-Labs (Vorlagen aus den Labs, lazy geladen)
  const pendingFitRef = useRef(false);
  const [labOptions, setLabOptions] = useState<Array<{ id: string; title: string }>>([]);
  const [labState, setLabState] = useState<"target" | "start">("target");

  useEffect(() => {
    let alive = true;
    Promise.all([import("@/components/labs"), import("@/components/labs/curated-topologies")])
      .then(([labs, curated]) => {
        if (!alive) return;
        setLabOptions(
          labs.LABS_ORDERED.filter((l) => curated.CURATED_TOPOLOGIES[l.id]).map((l) => ({ id: l.id, title: l.title })),
        );
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const openLabTopology = useCallback(
    async (labId: string, state: "target" | "start" = "target") => {
      try {
        const [labs, curated, converter] = await Promise.all([
          import("@/components/labs"),
          import("@/components/labs/curated-topologies"),
          import("@/components/labs/lab-to-network"),
        ]);
        const lab = labs.LABS.find((l) => l.id === labId);
        const data = curated.CURATED_TOPOLOGIES[labId];
        if (!lab || !data) {
          toast.error("Für dieses Lab gibt es noch keine Topologie-Vorlage.");
          return;
        }
        const { topology } = converter.buildNetworkTopologyFromLab(lab, data, state);
        setSelectedTopologyId(`lab:${labId}`);
        setLabState(state);
        setSelectedDevice(null);
        setSelectedLink(null);
        setSelectedAnnotation(null);
        setConnectSourceDevice(null);
        pendingFitRef.current = true;
        resetTopology(topology);
      } catch {
        toast.error("Die Lab-Topologie konnte nicht geladen werden.");
      }
    },
    [resetTopology],
  );

  // Nach dem Laden einer Vorlage mit der aktuellen Container-Größe einpassen
  useEffect(() => {
    if (pendingFitRef.current) {
      pendingFitRef.current = false;
      fitView(activeTopology);
    }
  }, [activeTopology, fitView]);

  // Die Anfrage (nicht die Callback-Identität) löst das Laden aus
  const openLabRef = useRef(openLabTopology);
  useEffect(() => {
    openLabRef.current = openLabTopology;
  });
  useEffect(() => {
    if (labRequest) void openLabRef.current(labRequest.labId, "target");
  }, [labRequest]);

  // Topologie-Wechsel
  const handleSelectTopology = (id: string) => {
    if (id.startsWith("lab:")) {
      void openLabTopology(id.slice(4), labState);
      return;
    }
    const startTime = performance.now();
    setSelectedTopologyId(id);
    setSelectedDevice(null);
    setSelectedLink(null);
    setSelectedAnnotation(null);
    setConnectSourceDevice(null);

    let nextTopo: NetworkTopology | null = null;

    if (id === "benchmark-50-80") {
      nextTopo = generateBenchmarkTopology(50, 80);
    } else if (id.startsWith("migrated-") && migratedTopologies) {
      const key = id.replace("migrated-", "");
      nextTopo = migratedTopologies[key] || null;
    } else {
      nextTopo = BUILT_IN_CCNA_TOPOLOGIES.find((t) => t.id === id) || null;
    }

    if (nextTopo) {
      resetTopology(nextTopo);
      fitView(nextTopo);
    }

    const elapsed = performance.now() - startTime;
    setRenderDurationMs(parseFloat(elapsed.toFixed(1)));
  };

  // Zoom mit festem Zentrum
  const zoomAtPoint = useCallback((newScale: number, pointX: number, pointY: number) => {
    const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
    const unscaledX = (pointX - translateX) / scale;
    const unscaledY = (pointY - translateY) / scale;

    setScale(clampedScale);
    setTranslateX(pointX - unscaledX * clampedScale);
    setTranslateY(pointY - unscaledY * clampedScale);
  }, [scale, translateX, translateY]);

  // Zoom-Buttons (zentriert auf Viewport-Mitte)
  const handleZoomIn = () => {
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    zoomAtPoint(scale * 1.2, centerX, centerY);
  };

  const handleZoomOut = () => {
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    zoomAtPoint(scale * 0.82, centerX, centerY);
  };

  // Fokuspunkt-Zoom per Mausrad (zum Mauszeiger hin)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    zoomAtPoint(scale * zoomFactor, mouseX, mouseY);
  };

  // Tastaturgesteuerte Bewegung eines Geräts (Pfeiltasten / Barrierefreiheit)
  const handleDeviceMoveByKey = useCallback(
    (device: TopologyDevice, dx: number, dy: number) => {
      let newX = device.x + dx;
      let newY = device.y + dy;
      if (snapGrid) {
        newX = snapToGrid(newX, DEFAULT_GRID_SIZE);
        newY = snapToGrid(newY, DEFAULT_GRID_SIZE);
      }
      setTopology((prev) => moveDeviceInTopology(prev, device.id, newX, newY, 0), true);
      setSelectedDevice((prev) => (prev && prev.id === device.id ? { ...prev, x: newX, y: newY } : prev));
    },
    [snapGrid, setTopology]
  );

  // ── GERÄTE-INTERAKTIONEN (Schritt 2d-1) ──
  const handleDevicePointerDown = (device: TopologyDevice, e: React.PointerEvent) => {
    if (activeMode === "connect") {
      e.stopPropagation();
      if (!connectSourceDevice) {
        setConnectSourceDevice(device);
        toast.info(`Quellgerät ausgewählt: ${device.name}. Klicke nun auf das Zielgerät.`);
      } else if (connectSourceDevice.id !== device.id) {
        setConnectDialogState({ source: connectSourceDevice, target: device });
        setConnectSourceDevice(null);
      }
      return;
    }

    if (activeMode !== "select") return;

    e.stopPropagation();
    setSelectedDevice(device);
    setSelectedLink(null);
    setSelectedAnnotation(null);

    setDraggingDeviceId(device.id);
    setDragStartClient({ x: e.clientX, y: e.clientY });
    setInitialDevicePos({ x: device.x, y: device.y });
    setHasMovedDevice(false);

    // Langes Drücken auf Touch (>500ms) = Kontextmenü
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setContextMenuState({ device, x: e.clientX, y: e.clientY });
      setDraggingDeviceId(null);
    }, 500);
  };

  const handleDeviceContextMenu = (device: TopologyDevice, e: React.MouseEvent) => {
    e.preventDefault();
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    setContextMenuState({ device, x: e.clientX, y: e.clientY });
  };

  // ── ANNOTATION-INTERAKTIONEN (Schritt 2d-2) ──
  const handleAnnotationPointerDown = (ann: TopologyAnnotation, e: React.PointerEvent) => {
    if (activeMode !== "select") return;

    e.stopPropagation();
    setSelectedAnnotation(ann);
    setSelectedDevice(null);
    setSelectedLink(null);

    setDraggingAnnotationId(ann.id);
    setDragStartClient({ x: e.clientX, y: e.clientY });
    setHasMovedAnnotation(false);
  };

  const handleAnnotationDoubleClick = (ann: TopologyAnnotation) => {
    if (ann.type === "text" || ann.type === "note") {
      setEditingAnnotation({
        id: ann.id,
        text: ann.text || "",
        x: ann.x,
        y: ann.y,
        width: ann.width,
        height: ann.height,
      });
      setEditingText(ann.text || "");
    }
  };

  const handleHandlePointerDown = (
    ann: TopologyAnnotation,
    handle: AnnotationHandleType,
    e: React.PointerEvent
  ) => {
    e.stopPropagation();
    setDraggingHandle({
      annotation: ann,
      handle,
      startClient: { x: e.clientX, y: e.clientY },
    });
  };

  // Inline-Editor Commit / Cancel (1 Undo-Schritt!)
  const commitInlineEdit = () => {
    if (!editingAnnotation) return;
    setTopology(
      (prev) =>
        updateAnnotationInTopology(prev, editingAnnotation.id, {
          text: editingText,
        }),
      true
    );
    setEditingAnnotation(null);
    toast.success("Text aktualisiert");
  };

  const cancelInlineEdit = () => {
    setEditingAnnotation(null);
  };

  // Löschen des selektierten Elements mit Undo
  const handleDeleteSelected = useCallback(() => {
    if (selectedDevice) {
      const devName = selectedDevice.name;
      setTopology((prev) => deleteDeviceFromTopology(prev, selectedDevice.id), true);
      setSelectedDevice(null);
      toast.info(`${devName} gelöscht (Rückgängig mit Strg+Z)`);
    } else if (selectedLink) {
      setTopology((prev) => deleteLinkFromTopology(prev, selectedLink.id), true);
      setSelectedLink(null);
      toast.info(`Verbindung gelöscht (Rückgängig mit Strg+Z)`);
    } else if (selectedAnnotation) {
      setTopology((prev) => deleteAnnotationFromTopology(prev, selectedAnnotation.id), true);
      setSelectedAnnotation(null);
      toast.info(`Annotation gelöscht (Rückgängig mit Strg+Z)`);
    }
  }, [selectedDevice, selectedLink, selectedAnnotation, setTopology]);

  // Platzieren per Tap auf freie Canvas-Fläche
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!viewportRef.current) return;

    if (activePlacementType) {
      const rect = viewportRef.current.getBoundingClientRect();
      let worldX = (e.clientX - rect.left - translateX) / scale;
      let worldY = (e.clientY - rect.top - translateY) / scale;
      if (snapGrid) {
        worldX = snapToGrid(worldX, DEFAULT_GRID_SIZE);
        worldY = snapToGrid(worldY, DEFAULT_GRID_SIZE);
      }

      const newDev = createNewDevice(activePlacementType, Math.round(worldX - 30), Math.round(worldY - 30));
      setTopology((prev) => addDeviceToTopology(prev, newDev), true);
      setSelectedDevice(newDev);
      setActivePlacementType(null);
      toast.success(`${newDev.name} platziert`);
      return;
    }

    // Leere Fläche angeklickt -> Selektion aufheben
    setSelectedDevice(null);
    setSelectedLink(null);
    setSelectedAnnotation(null);
    setConnectSourceDevice(null);
  };

  // Platzieren per Drag from Palette (Maus)
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/ccna-device-type") as TopologyDevice["type"];
    if (!type || !viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    let worldX = (e.clientX - rect.left - translateX) / scale;
    let worldY = (e.clientY - rect.top - translateY) / scale;
    if (snapGrid) {
      worldX = snapToGrid(worldX, DEFAULT_GRID_SIZE);
      worldY = snapToGrid(worldY, DEFAULT_GRID_SIZE);
    }

    const newDev = createNewDevice(type, Math.round(worldX - 30), Math.round(worldY - 30));
    setTopology((prev) => addDeviceToTopology(prev, newDev), true);
    setSelectedDevice(newDev);
    toast.success(`${newDev.name} hinzugefügt`);
  };

  // Maus- und Touch-Pan / Drag / Draw Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".topology-device, .topology-link, .topology-annotation, .annotation-handles, button, select, textarea, input")) return;
    if (!viewportRef.current) return;

    const isDrawingTool = ["freehand", "line", "arrow", "box", "circle", "text", "note"].includes(activeMode);

    if (isDrawingTool) {
      const rect = viewportRef.current.getBoundingClientRect();
      let worldX = (e.clientX - rect.left - translateX) / scale;
      let worldY = (e.clientY - rect.top - translateY) / scale;
      if (snapGrid) {
        worldX = snapToGrid(worldX, DEFAULT_GRID_SIZE);
        worldY = snapToGrid(worldY, DEFAULT_GRID_SIZE);
      }

      if (activeMode === "text") {
        const textAnn = createNewAnnotation("text", Math.round(worldX), Math.round(worldY), {
          color: activeAnnotationColor,
          text: "Neuer Text",
        });
        setTopology((prev) => addAnnotationToTopology(prev, textAnn), true);
        setSelectedAnnotation(textAnn);
        setEditingAnnotation({ id: textAnn.id, text: "Neuer Text", x: textAnn.x, y: textAnn.y });
        setEditingText("Neuer Text");
        setActiveMode("select");
        return;
      }

      if (activeMode === "note") {
        const noteAnn = createNewAnnotation("note", Math.round(worldX), Math.round(worldY), {
          color: activeAnnotationColor,
          text: "Wichtige Notiz...",
        });
        setTopology((prev) => addAnnotationToTopology(prev, noteAnn), true);
        setSelectedAnnotation(noteAnn);
        setEditingAnnotation({
          id: noteAnn.id,
          text: "Wichtige Notiz...",
          x: noteAnn.x,
          y: noteAnn.y,
          width: noteAnn.width,
          height: noteAnn.height,
        });
        setEditingText("Wichtige Notiz...");
        setActiveMode("select");
        return;
      }

      setIsDrawingAnnotation(true);
      setDrawingStart({ x: worldX, y: worldY });
      const initialPreview = createNewAnnotation(activeMode as TopologyAnnotation["type"], Math.round(worldX), Math.round(worldY), {
        color: activeAnnotationColor,
        endX: Math.round(worldX),
        endY: Math.round(worldY),
        width: 0,
        height: 0,
        points: [{ x: Math.round(worldX), y: Math.round(worldY) }],
      });
      setDrawingAnnotationPreview(initialPreview);
      return;
    }

    setIsPanning(true);
    setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Live-Zeichnen von Annotationen
    if (isDrawingAnnotation && drawingStart && drawingAnnotationPreview && viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      let worldX = (e.clientX - rect.left - translateX) / scale;
      let worldY = (e.clientY - rect.top - translateY) / scale;
      if (snapGrid) {
        worldX = snapToGrid(worldX, DEFAULT_GRID_SIZE);
        worldY = snapToGrid(worldY, DEFAULT_GRID_SIZE);
      }

      if (drawingAnnotationPreview.type === "freehand") {
        setDrawingAnnotationPreview((prev) =>
          prev
            ? {
                ...prev,
                points: [...(prev.points || []), { x: Math.round(worldX), y: Math.round(worldY) }],
              }
            : null
        );
      } else if (drawingAnnotationPreview.type === "line" || drawingAnnotationPreview.type === "arrow") {
        setDrawingAnnotationPreview((prev) =>
          prev ? { ...prev, endX: Math.round(worldX), endY: Math.round(worldY) } : null
        );
      } else if (drawingAnnotationPreview.type === "box" || drawingAnnotationPreview.type === "circle") {
        const minX = Math.min(drawingStart.x, worldX);
        const minY = Math.min(drawingStart.y, worldY);
        const w = Math.abs(worldX - drawingStart.x);
        const h = Math.abs(worldY - drawingStart.y);
        setDrawingAnnotationPreview((prev) =>
          prev
            ? {
                ...prev,
                x: Math.round(minX),
                y: Math.round(minY),
                width: Math.round(Math.max(10, w)),
                height: Math.round(Math.max(10, h)),
              }
            : null
        );
      }
      return;
    }

    // 2. Resizen von Annotationen über Anfasser
    if (draggingHandle) {
      const dx = (e.clientX - draggingHandle.startClient.x) / scale;
      const dy = (e.clientY - draggingHandle.startClient.y) / scale;
      const ann = draggingHandle.annotation;

      if (draggingHandle.handle === "se") {
        const newW = Math.max(20, (ann.width || 120) + dx);
        const newH = Math.max(20, (ann.height || 80) + dy);
        setTopology((prev) => updateAnnotationInTopology(prev, ann.id, { width: Math.round(newW), height: Math.round(newH) }), false);
      } else if (draggingHandle.handle === "end") {
        const endX = (ann.endX ?? ann.x) + dx;
        const endY = (ann.endY ?? ann.y) + dy;
        setTopology((prev) => updateAnnotationInTopology(prev, ann.id, { endX: Math.round(endX), endY: Math.round(endY) }), false);
      } else if (draggingHandle.handle === "start") {
        const startX = ann.x + dx;
        const startY = ann.y + dy;
        setTopology((prev) => updateAnnotationInTopology(prev, ann.id, { x: Math.round(startX), y: Math.round(startY) }), false);
      }
      return;
    }

    // 3. Verschieben von Geräten
    if (draggingDeviceId && dragStartClient && initialDevicePos) {
      const dx = e.clientX - dragStartClient.x;
      const dy = e.clientY - dragStartClient.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 10) {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        setHasMovedDevice(true);
      }

      let newX = initialDevicePos.x + dx / scale;
      let newY = initialDevicePos.y + dy / scale;
      if (snapGrid) {
        newX = snapToGrid(newX, DEFAULT_GRID_SIZE);
        newY = snapToGrid(newY, DEFAULT_GRID_SIZE);
      }

      setTopology((prev) => moveDeviceInTopology(prev, draggingDeviceId, newX, newY, 0), false);
      return;
    }

    // 4. Verschieben von Annotationen
    if (draggingAnnotationId && dragStartClient) {
      const dx = (e.clientX - dragStartClient.x) / scale;
      const dy = (e.clientY - dragStartClient.y) / scale;
      if (Math.hypot(dx, dy) > 6) {
        setHasMovedAnnotation(true);
      }
      setTopology((prev) => moveAnnotationInTopology(prev, draggingAnnotationId, dx, dy, 0), false);
      setDragStartClient({ x: e.clientX, y: e.clientY });
      return;
    }

    // 5. Panning des Canvas
    if (!isPanning) return;
    setTranslateX(e.clientX - panStart.x);
    setTranslateY(e.clientY - panStart.y);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    // Live-Zeichnen abschließen (1 Undo-Schritt!)
    if (isDrawingAnnotation && drawingAnnotationPreview) {
      let finalAnn = drawingAnnotationPreview;
      if (finalAnn.type === "freehand") {
        finalAnn = {
          ...finalAnn,
          points: smoothFreehandPoints(finalAnn.points || []),
        };
      }

      const isValid =
        (finalAnn.type === "freehand" && (finalAnn.points?.length || 0) > 1) ||
        (finalAnn.type !== "freehand" && ((finalAnn.width || 0) > 10 || Math.hypot((finalAnn.endX ?? 0) - finalAnn.x, (finalAnn.endY ?? 0) - finalAnn.y) > 10));

      if (isValid) {
        setTopology((prev) => addAnnotationToTopology(prev, finalAnn), true);
        setSelectedAnnotation(finalAnn);
        toast.success("Annotation hinzugefügt");
      }

      setIsDrawingAnnotation(false);
      setDrawingStart(null);
      setDrawingAnnotationPreview(null);
    }

    if (draggingHandle) {
      setTopology((prev) => ({ ...prev }), true);
      setDraggingHandle(null);
    }

    if (draggingDeviceId && hasMovedDevice) {
      setTopology((prev) => ({ ...prev }), true);
    }

    if (draggingAnnotationId && hasMovedAnnotation) {
      setTopology((prev) => ({ ...prev }), true);
    }

    setDraggingDeviceId(null);
    setDraggingAnnotationId(null);
    setDragStartClient(null);
    setInitialDevicePos(null);
    setHasMovedDevice(false);
    setHasMovedAnnotation(false);
    setIsPanning(false);
  };

  // Touch-Gesten: 1 Finger zeichnet / verschiebt / pannt, 2 Finger führen Pinch & Pan aus
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();

    if (e.touches.length === 1) {
      const t = e.touches[0];
      const now = Date.now();
      const distFromLastTap = Math.hypot(t.clientX - lastTapPosRef.current.x, t.clientY - lastTapPosRef.current.y);
      touchStartClientRef.current = { x: t.clientX, y: t.clientY };

      // Doppeltipp-Erkennung (< 300ms)
      if (now - lastTapTimeRef.current < 300 && distFromLastTap < 30) {
        if (scale > 1.2) {
          fitView();
        } else {
          zoomAtPoint(1.8, t.clientX - rect.left, t.clientY - rect.top);
        }
        lastTapTimeRef.current = 0;
        return;
      }

      lastTapTimeRef.current = now;
      lastTapPosRef.current = { x: t.clientX, y: t.clientY };

      const isDrawingTool = ["freehand", "line", "arrow", "box", "circle", "text", "note"].includes(activeMode);
      if (isDrawingTool) {
        let worldX = (t.clientX - rect.left - translateX) / scale;
        let worldY = (t.clientY - rect.top - translateY) / scale;
        if (snapGrid) {
          worldX = snapToGrid(worldX, DEFAULT_GRID_SIZE);
          worldY = snapToGrid(worldY, DEFAULT_GRID_SIZE);
        }

        if (activeMode === "text" || activeMode === "note") {
          const newAnn = createNewAnnotation(activeMode, Math.round(worldX), Math.round(worldY), {
            color: activeAnnotationColor,
            text: activeMode === "text" ? "Neuer Text" : "Wichtige Notiz...",
          });
          setTopology((prev) => addAnnotationToTopology(prev, newAnn), true);
          setSelectedAnnotation(newAnn);
          setEditingAnnotation({
            id: newAnn.id,
            text: newAnn.text || "",
            x: newAnn.x,
            y: newAnn.y,
            width: newAnn.width,
            height: newAnn.height,
          });
          setEditingText(newAnn.text || "");
          setActiveMode("select");
          return;
        }

        setIsDrawingAnnotation(true);
        setDrawingStart({ x: worldX, y: worldY });
        const initialPreview = createNewAnnotation(activeMode as TopologyAnnotation["type"], Math.round(worldX), Math.round(worldY), {
          color: activeAnnotationColor,
          endX: Math.round(worldX),
          endY: Math.round(worldY),
          width: 0,
          height: 0,
          points: [{ x: Math.round(worldX), y: Math.round(worldY) }],
        });
        setDrawingAnnotationPreview(initialPreview);
        return;
      }

      if ((e.target as HTMLElement).closest(".topology-device, .topology-link, .topology-annotation, .annotation-handles, button, select, textarea, input")) return;

      setIsPanning(true);
      setPanStart({ x: t.clientX - translateX, y: t.clientY - translateY });
    } else if (e.touches.length === 2) {
      // 2 Finger Touch: Abbrechen von Zeichnen/Long-Press und Umschalten auf 2-Finger Zoom/Pan
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (isDrawingAnnotation) {
        setIsDrawingAnnotation(false);
        setDrawingAnnotationPreview(null);
      }
      setDraggingDeviceId(null);
      setDraggingAnnotationId(null);
      setIsPanning(false);

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      lastTouchDistRef.current = dist;
      lastTouchCenterRef.current = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();

    if (e.touches.length === 1) {
      const t = e.touches[0];

      // Long-Press bricht sofort ab bei Bewegung > 10px
      const distFromStart = Math.hypot(
        t.clientX - touchStartClientRef.current.x,
        t.clientY - touchStartClientRef.current.y
      );
      if (distFromStart > 10 && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }

      // 1-Finger Zeichnen
      if (isDrawingAnnotation && drawingStart && drawingAnnotationPreview) {
        let worldX = (t.clientX - rect.left - translateX) / scale;
        let worldY = (t.clientY - rect.top - translateY) / scale;
        if (snapGrid) {
          worldX = snapToGrid(worldX, DEFAULT_GRID_SIZE);
          worldY = snapToGrid(worldY, DEFAULT_GRID_SIZE);
        }

        if (drawingAnnotationPreview.type === "freehand") {
          setDrawingAnnotationPreview((prev) =>
            prev
              ? {
                  ...prev,
                  points: [...(prev.points || []), { x: Math.round(worldX), y: Math.round(worldY) }],
                }
              : null
          );
        } else if (drawingAnnotationPreview.type === "line" || drawingAnnotationPreview.type === "arrow") {
          setDrawingAnnotationPreview((prev) =>
            prev ? { ...prev, endX: Math.round(worldX), endY: Math.round(worldY) } : null
          );
        } else if (drawingAnnotationPreview.type === "box" || drawingAnnotationPreview.type === "circle") {
          const minX = Math.min(drawingStart.x, worldX);
          const minY = Math.min(drawingStart.y, worldY);
          const w = Math.abs(worldX - drawingStart.x);
          const h = Math.abs(worldY - drawingStart.y);
          setDrawingAnnotationPreview((prev) =>
            prev
              ? {
                  ...prev,
                  x: Math.round(minX),
                  y: Math.round(minY),
                  width: Math.round(Math.max(10, w)),
                  height: Math.round(Math.max(10, h)),
                }
              : null
          );
        }
        return;
      }

      // 1-Finger Geräte Verschieben
      if (draggingDeviceId && dragStartClient && initialDevicePos) {
        const dx = t.clientX - dragStartClient.x;
        const dy = t.clientY - dragStartClient.y;
        if (Math.hypot(dx, dy) > 10) {
          setHasMovedDevice(true);
        }

        let newX = initialDevicePos.x + dx / scale;
        let newY = initialDevicePos.y + dy / scale;
        if (snapGrid) {
          newX = snapToGrid(newX, DEFAULT_GRID_SIZE);
          newY = snapToGrid(newY, DEFAULT_GRID_SIZE);
        }

        setTopology((prev) => moveDeviceInTopology(prev, draggingDeviceId, newX, newY, 0), false);
        return;
      }

      // 1-Finger Pan
      if (isPanning) {
        setTranslateX(t.clientX - panStart.x);
        setTranslateY(t.clientY - panStart.y);
      }
    } else if (e.touches.length === 2 && lastTouchDistRef.current !== null && lastTouchCenterRef.current) {
      // 2 Finger Zoom & Pan
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const center = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top,
      };

      const scaleChange = dist / lastTouchDistRef.current;
      zoomAtPoint(scale * scaleChange, center.x, center.y);

      lastTouchDistRef.current = dist;
      lastTouchCenterRef.current = center;
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
    lastTouchDistRef.current = null;
    lastTouchCenterRef.current = null;
  };

  // Tastatursteuerung:
  // - Escape: Zurück zu Modus 'select', Selektion aufheben
  // - Delete / Backspace: Löscht nur wenn Fokus NICHT in Input/Textarea/Dialog liegt!
  // - Shift + Pfeiltasten: Verschiebt ausgewähltes Gerät am Raster
  // - Reguläre Pfeiltasten: Pannen des Viewports
  // - Strg+Z / Strg+Y: Undo / Redo
  // - +/- / 0: Zoom & Fit View
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    const isFocusInInput =
      target?.tagName === "INPUT" ||
      target?.tagName === "TEXTAREA" ||
      target?.tagName === "SELECT" ||
      target?.isContentEditable ||
      Boolean(target?.closest("input, textarea, select, [contenteditable='true'], dialog, [role='dialog']")) ||
      connectDialogState !== null ||
      contextMenuState !== null ||
      editingAnnotation !== null;

    // Wenn Fokus in einem Formularfeld oder Dialog liegt: Keinerlei Tastatur-Canvas-Aktionen!
    if (isFocusInInput) return;

    // Escape: Zurück zu Auswahl-Modus
    if (e.key === "Escape") {
      e.preventDefault();
      setActiveMode("select");
      setActivePlacementType(null);
      setSelectedDevice(null);
      setSelectedLink(null);
      setSelectedAnnotation(null);
      setConnectSourceDevice(null);
      return;
    }

    // Undo / Redo (Strg+Z / Strg+Y bzw. Cmd+Z / Cmd+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        if (canRedo) redo();
      } else {
        if (canUndo) undo();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      if (canRedo) redo();
      return;
    }

    // Löschen mit Undo (nur wenn Canvas-Fokus!)
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      handleDeleteSelected();
      return;
    }

    // Enter öffnet Gerätekonfiguration / Inspector (Barrierefreiheit)
    if (e.key === "Enter" && selectedDevice) {
      e.preventDefault();
      setIsConfigDialogOpen(true);
      return;
    }

    // Kontextmenü per Tastatur (Menütaste oder Shift+F10)
    if ((e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) && selectedDevice) {
      e.preventDefault();
      setContextMenuState({
        device: selectedDevice,
        x: selectedDevice.x * scale + translateX,
        y: selectedDevice.y * scale + translateY,
      });
      return;
    }

    // ── Tastaturbedienung (WCAG 2.1 AA & Roving Tabindex) ──
    if (e.key.startsWith("Arrow")) {
      // 1. Shift + Pfeiltasten: Fokussiertes Gerät auf dem Canvas verschieben
      if (e.shiftKey && selectedDevice) {
        e.preventDefault();
        const step = snapGrid ? DEFAULT_GRID_SIZE : 10;
        let newX = selectedDevice.x;
        let newY = selectedDevice.y;

        if (e.key === "ArrowUp") newY -= step;
        if (e.key === "ArrowDown") newY += step;
        if (e.key === "ArrowLeft") newX -= step;
        if (e.key === "ArrowRight") newX += step;

        setTopology((prev) => moveDeviceInTopology(prev, selectedDevice.id, newX, newY, 0), true);
        setSelectedDevice((prev) => (prev ? { ...prev, x: newX, y: newY } : null));
        return;
      }

      // 2. Unmodifizierte Pfeiltasten bei aktivem Element: Spatial Navigation (Roving Tabindex)
      if ((selectedDevice || selectedLink) && !e.altKey) {
        e.preventDefault();
        const dir: SpatialDirection =
          e.key === "ArrowUp" ? "up" :
          e.key === "ArrowDown" ? "down" :
          e.key === "ArrowLeft" ? "left" : "right";

        // Kandidaten für 2D-Navigation
        const candidates: SpatialElementTarget[] = [
          ...activeTopology.devices.map((d) => ({
            id: d.id,
            type: "device" as const,
            x: d.x,
            y: d.y,
          })),
          ...activeTopology.links.map((l) => {
            const s = activeTopology.devices.find((d) => d.id === l.sourceDeviceId);
            const t = activeTopology.devices.find((d) => d.id === l.targetDeviceId);
            return {
              id: l.id,
              type: "link" as const,
              x: s && t ? (s.x + t.x) / 2 : 0,
              y: s && t ? (s.y + t.y) / 2 : 0,
            };
          }),
        ];

        const currentPos = selectedDevice
          ? { x: selectedDevice.x, y: selectedDevice.y }
          : selectedLink
          ? (() => {
              const s = activeTopology.devices.find((d) => d.id === selectedLink.sourceDeviceId);
              const t = activeTopology.devices.find((d) => d.id === selectedLink.targetDeviceId);
              return { x: s && t ? (s.x + t.x) / 2 : 0, y: s && t ? (s.y + t.y) / 2 : 0 };
            })()
          : { x: 0, y: 0 };

        const otherCandidates = candidates.filter((c) =>
          selectedDevice ? c.id !== selectedDevice.id : c.id !== selectedLink?.id
        );

        const next = findNextSpatialElement(currentPos, dir, otherCandidates);
        if (next) {
          if (next.type === "device") {
            const dev = activeTopology.devices.find((d) => d.id === next.id);
            if (dev) {
              setSelectedDevice(dev);
              setSelectedLink(null);
              setSelectedAnnotation(null);
              setTimeout(() => {
                const el = viewportRef.current?.querySelector(`[data-device-id="${dev.id}"]`) as HTMLElement | SVGElement | null;
                el?.focus();
              }, 0);
            }
          } else {
            const lnk = activeTopology.links.find((l) => l.id === next.id);
            if (lnk) {
              setSelectedLink(lnk);
              setSelectedDevice(null);
              setSelectedAnnotation(null);
              setTimeout(() => {
                const el = viewportRef.current?.querySelector(`[data-link-id="${lnk.id}"]`) as HTMLElement | SVGElement | null;
                el?.focus();
              }, 0);
            }
          }
        }
        return;
      }

      // 3. Pannen per Tastatur: Nur wenn kein Element fokussiert ist ODER über Alt + Pfeile
      if ((!selectedDevice && !selectedLink) || e.altKey) {
        e.preventDefault();
        const panStep = e.shiftKey ? 80 : 40;
        if (e.key === "ArrowUp") setTranslateY((y) => y + panStep);
        if (e.key === "ArrowDown") setTranslateY((y) => y - panStep);
        if (e.key === "ArrowLeft") setTranslateX((x) => x + panStep);
        if (e.key === "ArrowRight") setTranslateX((x) => x - panStep);
        return;
      }
    }

    // Reguläre Tastaturkürzel (Canvas Zoom & Viewport)
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === "0") {
      e.preventDefault();
      fitView();
    }
  };

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-full flex flex-col select-none overflow-hidden outline-none ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {/* ── TOPBAR: Steuerung, Topologie-Auswahl & Feature-Flag ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b shrink-0 z-20 ${
          isDark
            ? "bg-slate-900/90 border-slate-800"
            : "bg-white/90 border-slate-200"
        } backdrop-blur-md`}
      >
        {/* Linke Seite: Topologie-Auswahl */}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="topology-selector" className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-sky-400" : "text-sky-700"}`}>
            Topologie:
          </label>
          <select
            id="topology-selector"
            aria-label="Topologie auswählen"
            value={selectedTopologyId}
            onChange={(e) => handleSelectTopology(e.target.value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer outline-none transition-colors ${
              isDark
                ? "bg-slate-800 border-slate-700 text-white hover:border-sky-500"
                : "bg-white border-slate-300 text-slate-900 hover:border-sky-500"
            }`}
          >
            <optgroup label="CCNA 200-301 Referenzen">
              <option value="ccna-router-on-a-stick">Router-on-a-Stick (Inter-VLAN)</option>
              <option value="ccna-stp-triangle">Spanning Tree (802.1D STP)</option>
              <option value="ccna-ospf-routing">OSPFv2 P2P mit Kunden-LANs</option>
              <option value="ccna-basic-lan">Basic LAN (Switching)</option>
            </optgroup>
            {(Boolean(import.meta.env.DEV) ||
              (typeof window !== "undefined" &&
                new URLSearchParams(window.location.search).get("debug") === "true")) && (
              <optgroup label="Stresstest / Benchmark">
                <option value="benchmark-50-80">Benchmark Lasttest (50 Geräte, 80 Links)</option>
              </optgroup>
            )}
            {(labOptions.length > 0 || selectedTopologyId.startsWith("lab:")) && (
              <optgroup label="Unterrichts-Labs">
                {selectedTopologyId.startsWith("lab:") &&
                  !labOptions.some((o) => `lab:${o.id}` === selectedTopologyId) && (
                    <option value={selectedTopologyId}>{activeTopology.name}</option>
                  )}
                {labOptions.map((o) => (
                  <option key={o.id} value={`lab:${o.id}`}>
                    {o.title}
                  </option>
                ))}
              </optgroup>
            )}
            {migratedTopologies && Object.keys(migratedTopologies).length > 0 && (
              <optgroup label="Aus bestehendem Canvas migriert">
                {Object.keys(migratedTopologies).map((k) => (
                  <option key={k} value={`migrated-${k}`}>
                    {k} Topologie (Migriert)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {activeTopology.metadata?.labId && (
            <div className="flex items-center gap-1.5" role="group" aria-label="Lab-Vorlage">
              <div
                className={`flex items-center p-0.5 rounded-lg border text-xs font-medium ${
                  isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                }`}
              >
                {(["target", "start"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    aria-pressed={labState === st}
                    onClick={() => void openLabTopology(activeTopology.metadata!.labId!, st)}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      labState === st
                        ? "bg-sky-700 text-white font-bold"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {st === "target" ? "Zielzustand" : "Startzustand"}
                  </button>
                ))}
              </div>
              {onBackToLab && (
                <button
                  type="button"
                  onClick={() => onBackToLab(activeTopology.metadata!.labId!)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-sky-300 hover:border-sky-500"
                      : "bg-white border-slate-300 text-sky-800 hover:border-sky-500"
                  }`}
                >
                  Zurück zum Lab
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mitte: Ansichts-Optionen */}
        <div className="flex items-center gap-1.5">
          {/* Simple / Detail Umschalter */}
          <div
            className={`flex items-center p-0.5 rounded-lg border text-xs font-medium ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={() => setViewDensity("simple")}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewDensity === "simple"
                  ? "bg-sky-700 text-white font-bold"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setViewDensity("detail")}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewDensity === "detail"
                  ? "bg-sky-700 text-white font-bold"
                  : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900 font-medium"
              }`}
            >
              Detail
            </button>
          </div>

          {/* Legende Toggle */}
          <button
            onClick={() => setShowLegend((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showLegend
                ? "bg-sky-500/20 border-sky-500 text-sky-300"
                : isDark
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Legende
          </button>

          {/* Fit View */}
          <button
            onClick={() => fitView()}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title="Ansicht einpassen (Taste 0)"
          >
            <ArrowsIn size={15} />
          </button>

          {/* Speichern & Export Dialog */}
          <button
            onClick={() => {
              setStorageDialogTab("saved");
              setIsStorageDialogOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isDark
                ? "border-slate-700 text-slate-200 hover:bg-slate-800 bg-slate-800/50"
                : "border-slate-200 text-slate-700 hover:bg-slate-100 bg-slate-50"
            }`}
            title="Topologie speichern, exportieren (JSON/SVG/PNG) oder importieren"
          >
            <FloppyDisk size={15} weight="bold" />
            <span className="hidden md:inline">Speichern & Export</span>
          </button>

          {/* Netzwerk-Diagnose Button mit Badge */}
          <button
            onClick={() => {
              setStorageDialogTab("diagnostics");
              setIsStorageDialogOpen(true);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              diagnostics.warningsCount > 0
                ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                : isDark
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="CCNA Validierung & Diagnose"
          >
            {diagnostics.warningsCount > 0 ? (
              <>
                <Warning size={15} weight="bold" className="text-amber-400" />
                <span className="font-bold">{diagnostics.warningsCount}</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} weight="bold" className="text-emerald-500" />
                <span className={`hidden md:inline text-[11px] font-bold ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
                  OK
                </span>
              </>
            )}
          </button>

          {/* Barrierefreie Semantik-Tabelle (WCAG AA Textalternative) */}
          <button
            onClick={() => setShowScreenReaderView(true)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isDark
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Semantische Textübersicht der Topologie (Barrierefreie Tabelle)"
            aria-label="Semantische Textübersicht der Topologie anzeigen"
          >
            <Table size={15} weight="bold" className="text-sky-400" />
            <span className="hidden lg:inline text-[11px]">Tabelle</span>
          </button>
        </div>

        {/* Rechte Seite: Zoom & Feature-Flag */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Buttons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title="Herauszoomen (Taste -)"
            >
              <MagnifyingGlassMinus size={15} />
            </button>
            <span className="text-[11px] font-mono px-1 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title="Hereinzoomen (Taste +)"
            >
              <MagnifyingGlassPlus size={15} />
            </button>
          </div>

          {/* Feature-Flag Umschalter (v1 Canvas vs v2 SVG) */}
          {onSwitchToV1 && (
            <div
              className={`flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                onClick={onSwitchToV1}
                className={`px-2 py-1 rounded-md transition-colors ${
                  isDark ? "text-slate-400 hover:text-white" : "text-slate-700 hover:text-slate-950 font-semibold"
                }`}
                title="Zurück zum bestehenden Pixel-Canvas (v1)"
              >
                v1 (Canvas)
              </button>
              <button
                disabled
                className="px-2 py-1 rounded-md bg-indigo-600 text-white shadow-xs"
                title="Neuer SVG Topologie-Renderer aktiv (v2)"
              >
                v2 (SVG Next)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. GERÄTEPALETTE & EDITING TOOLBAR (Schritte 2d-1 & 2d-2) ── */}
      <DevicePalette
        theme={theme}
        activePlacementType={activePlacementType}
        onSelectPlacementType={setActivePlacementType}
        activeMode={activeMode}
        onSelectMode={(m) => {
          setActiveMode(m);
          setConnectSourceDevice(null);
        }}
        activeAnnotationColor={activeAnnotationColor}
        onSelectAnnotationColor={setActiveAnnotationColor}
        snapGrid={snapGrid}
        onToggleSnapGrid={() => setSnapGrid((s) => !s)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        selectedDeviceId={selectedDevice?.id}
        selectedLinkId={selectedLink?.id}
        selectedAnnotationId={selectedAnnotation?.id}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* ── KONFLIKT-BANNER (Präzise formuliert mit reversibler Wiederherstellung) ── */}
      {migrationConflicts.length > 0 && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-200">
          <div className="flex items-center gap-2">
            <Warning size={16} className="text-amber-400 shrink-0" />
            <span className="font-bold text-amber-400">Hinweis zur Datenmigration:</span>
            <span>Deine Zeichnung wurde im alten und im neuen Canvas unterschiedlich bearbeitet. Der neue Stand ist gesichert.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMigrationConflicts([])}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] transition-colors"
              title="Behält deine aktuellen Änderungen im neuen Canvas"
            >
              Neuen Stand behalten
            </button>
            <button
              onClick={() => {
                const conflict = migrationConflicts[0];
                if (conflict.backupKey) {
                  // Reversibles Snapshotting vor dem Überschreiben
                  const currentV2 = localStorage.getItem(V2_STORAGE_KEY);
                  if (currentV2) {
                    safeSetItem(localStorage, `${V2_STORAGE_KEY}-backup-pre-v1-restore-${Date.now()}`, currentV2);
                  }
                  restoreBackupSnapshot(conflict.backupKey);
                  const stored = localStorage.getItem(V2_STORAGE_KEY);
                  if (stored) setMigratedTopologies(JSON.parse(stored));
                  toast.success("Gesicherter v2-Stand wiederhergestellt. Die Daten des alten Canvas (v1) bleiben unverändert erhalten.");
                }
                setMigrationConflicts([]);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors"
              title="Stellt die gesicherte Version aus dem neuen Canvas (v2) wieder her. Der alte Canvas (v1) bleibt unverändert."
            >
              Gesicherten v2-Stand wiederherstellen
            </button>
          </div>
        </div>
      )}

      {/* ── PLACEMENT-HINWEIS BANNER ── */}
      {activePlacementType && (
        <div className="bg-sky-500/20 border-b border-sky-500/40 px-3 py-1.5 text-xs flex items-center justify-between text-sky-200">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">📍</span>
            <span>
              Tippe oder klicke auf die Zielfläche im Canvas, um <strong>{activePlacementType.toUpperCase()}</strong> zu platzieren.
            </span>
          </div>
          <button
            onClick={() => setActivePlacementType(null)}
            className="text-[11px] underline text-sky-300 hover:text-white"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* ── CONNECT-MODUS HINWEIS ── */}
      {activeMode === "connect" && connectSourceDevice && (
        <div className="bg-indigo-500/20 border-b border-indigo-500/40 px-3 py-1.5 text-xs flex items-center justify-between text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">🔌</span>
            <span>
              Quellgerät <strong>{connectSourceDevice.name}</strong> aktiv. Klicke jetzt auf das Zielgerät zum Verbinden.
            </span>
          </div>
          <button
            onClick={() => setConnectSourceDevice(null)}
            className="text-[11px] underline text-indigo-300 hover:text-white"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* ── CANVAS BEREICH: Interaktives SVG Rendering ── */}
      <div
        ref={viewportRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleCanvasDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <SvgTopologyRenderer
          topology={activeTopology}
          viewDensity={viewDensity}
          theme={theme}
          snapGrid={snapGrid}
          gridSize={DEFAULT_GRID_SIZE}
          selectedDeviceId={selectedDevice?.id}
          selectedLinkId={selectedLink?.id}
          selectedAnnotationId={selectedAnnotation?.id}
          onDeviceClick={(d) => {
            if (activeMode === "connect") {
              if (!connectSourceDevice) {
                setConnectSourceDevice(d);
                toast.info(`Quellgerät: ${d.name}. Wähle nun das Zielgerät.`);
              } else if (connectSourceDevice.id !== d.id) {
                setConnectDialogState({ source: connectSourceDevice, target: d });
                setConnectSourceDevice(null);
              }
              return;
            }
            setSelectedDevice(d);
            setSelectedLink(null);
            setSelectedAnnotation(null);
          }}
          onLinkClick={(l) => {
            setSelectedLink(l);
            setSelectedDevice(null);
            setSelectedAnnotation(null);
          }}
          onAnnotationClick={(ann) => {
            setSelectedAnnotation(ann);
            setSelectedDevice(null);
            setSelectedLink(null);
          }}
          onDevicePointerDown={handleDevicePointerDown}
          onDeviceContextMenu={handleDeviceContextMenu}
          onDeviceMoveByKey={handleDeviceMoveByKey}
          onAnnotationPointerDown={handleAnnotationPointerDown}
          onAnnotationDoubleClick={handleAnnotationDoubleClick}
          onHandlePointerDown={handleHandlePointerDown}
          drawingAnnotationPreview={drawingAnnotationPreview}
          scale={scale}
          translateX={translateX}
          translateY={translateY}
        />

        {/* ── INLINE TEXT / NOTIZEN EDITOR DOM-OVERLAY (Schritt 2d-2) ── */}
        {editingAnnotation && (
          <div
            className={`absolute z-50 p-2.5 rounded-xl shadow-2xl border backdrop-blur-md ${
              isDark
                ? "bg-slate-900/98 border-sky-400 text-white"
                : "bg-white/98 border-sky-500 text-slate-900"
            }`}
            style={{
              left: Math.max(10, Math.min(window.innerWidth - 240, translateX + editingAnnotation.x * scale)),
              top: Math.max(50, Math.min(window.innerHeight - 180, translateY + editingAnnotation.y * scale)),
              width: Math.max(200, (editingAnnotation.width || 150) * scale),
            }}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-400 mb-1">
              <span>Text bearbeiten</span>
              <span className="text-[9px] text-slate-400">Enter = Speichern</span>
            </div>
            <textarea
              autoFocus
              rows={3}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitInlineEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelInlineEdit();
                }
              }}
              className={`w-full p-2 rounded-lg text-xs font-medium border outline-none resize-none ${
                isDark
                  ? "bg-slate-950 border-slate-700 text-white focus:border-sky-400"
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500"
              }`}
              placeholder="Text oder Notiz eingeben (Umlaute äöüß)..."
            />
            <div className="flex items-center justify-end gap-1.5 mt-2">
              <button
                onClick={cancelInlineEdit}
                className="px-2.5 py-1 rounded text-[11px] text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                onClick={commitInlineEdit}
                className="px-3 py-1 rounded bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] transition-colors"
              >
                Fertig
              </button>
            </div>
          </div>
        )}

        {/* Legende Overlay */}
        {showLegend && (
          <div className="absolute top-3 left-3 z-30 max-w-xs shadow-2xl">
            <TopologyLegend theme={theme} onClose={() => setShowLegend(false)} />
          </div>
        )}

        {/* Status / Performance HUD (unten rechts) */}
        <div
          className={`absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-lg border shadow-lg backdrop-blur-md text-[10px] font-mono flex items-center gap-3 ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-300"
              : "bg-white/80 border-slate-200 text-slate-700"
          }`}
        >
          <span>
            <strong className="text-sky-400">{activeTopology.devices.length}</strong> Geräte
          </span>
          <span>·</span>
          <span>
            <strong className="text-sky-400">{activeTopology.links.length}</strong> Links
          </span>
          <span>·</span>
          <span>
            <strong className="text-amber-400">{activeTopology.annotations?.length || 0}</strong> Annotationen
          </span>
          {renderDurationMs > 0 && (
            <>
              <span>·</span>
              <span className="text-emerald-400">⚡ {renderDurationMs}ms</span>
            </>
          )}
        </div>
      </div>

      {/* ── DETAIL-PANEL: Beim Klick auf Gerät / Link ── */}
      {selectedDevice && (
        <div
          className={`absolute bottom-0 right-0 sm:top-24 sm:bottom-auto sm:right-3 w-full sm:w-80 max-h-[55vh] sm:max-h-[75vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border shadow-2xl p-4 z-40 transition-all ${
            isDark
              ? "bg-slate-900/98 border-slate-700/80 text-white"
              : "bg-white/98 border-slate-200 text-slate-900"
          } backdrop-blur-md`}
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/50">
            <div>
              <div className="text-xs font-bold uppercase text-sky-400">{selectedDevice.type.toUpperCase()}</div>
              <h3 className="text-sm font-bold truncate">{selectedDevice.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              {selectedDevice.config?.labCli && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard
                        ?.writeText(selectedDevice.config!.labCli!)
                        .then(() => toast.success(`CLI von ${selectedDevice.name} kopiert`))
                        .catch(() => toast.error("Kopieren nicht möglich"));
                    }}
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    title="Befehle dieses Geräts (ohne Prompt) für die Packet-Tracer-CLI kopieren"
                  >
                    CLI kopieren
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadBlob(
                        new Blob([selectedDevice.config!.labCli!], { type: "text/plain;charset=utf-8" }),
                        `${selectedDevice.name}-cli.txt`,
                      )
                    }
                    className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    title="CLI-Befehle als Textdatei speichern"
                  >
                    .txt
                  </button>
                </>
              )}
              <button
                onClick={() => setIsConfigDialogOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 transition-colors"
                title="Gerät konfigurieren"
              >
                <Gear size={14} weight="bold" />
                <span>Konfigurieren</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="p-1 rounded-lg text-red-400 hover:bg-red-500/20"
                title="Gerät löschen (Entf)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Interface Tabelle */}
          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
                Schnittstellen & IP-Adressen
              </h4>
              <div className="space-y-1.5">
                {selectedDevice.interfaces.map((iface) => (
                  <div
                    key={iface.id}
                    className={`p-2 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                      isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <div className={`font-bold ${isDark ? "text-sky-400" : "text-sky-700"}`}>
                        {iface.name}
                        {iface.assumed && (
                          <span
                            className={`ml-1.5 px-1 py-0.5 rounded text-[9px] font-semibold ${isDark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"}`}
                            title="Port im Lab nicht angegeben, nach Konvention angenommen"
                          >
                            angenommen
                          </span>
                        )}
                      </div>
                      {iface.ip && <div className={isDark ? "text-slate-300" : "text-slate-800 font-semibold"}>{iface.ip}</div>}
                      {iface.dhcp && !iface.ip && <div className={isDark ? "text-slate-300" : "text-slate-800 font-semibold"}>DHCP ({iface.dhcp.network})</div>}
                      {iface.ipv6 && <div className={isDark ? "text-slate-300 break-all" : "text-slate-800 font-semibold break-all"}>{iface.ipv6}</div>}
                      {iface.description && (
                        <div className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600 font-medium"}`}>{iface.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {iface.status.toUpperCase()}
                      </span>
                      {iface.vlan && (
                        <div className={`text-[10px] mt-0.5 font-medium ${isDark ? "text-indigo-400" : "text-indigo-700"}`}>
                          VLAN {iface.vlan}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamisch generierte Cisco IOS Show Befehle */}
            {Object.keys(dynamicShowOutputs).length > 0 && (
              <div>
                <h4 className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Terminal size={14} className="text-green-400" />
                  <span>Simulierte CLI show-Ausgaben (Dynamisch)</span>
                </h4>
                {ipv6HintList.length > 0 && (
                  <ul className="mb-2 space-y-1" aria-label="IPv6-Hinweise">
                    {ipv6HintList.map((h) => (
                      <li key={h} className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] leading-snug">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="space-y-2">
                  {Object.entries(dynamicShowOutputs).map(([cmd, out]) => (
                    <div key={cmd} className="rounded-lg overflow-hidden border border-slate-800">
                      <div className="px-2.5 py-1 bg-slate-800/90 text-green-400 font-mono text-[10px] font-bold">
                        # {cmd}
                      </div>
                      <pre
                        tabIndex={0}
                        role="region"
                        aria-label={`CLI-Ausgabe für Befehl ${cmd}`}
                        className="p-2 bg-black/90 text-slate-300 font-mono text-[9.5px] overflow-x-auto whitespace-pre leading-tight outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {out}
                      </pre>
                      {cmd === "show ip ospf neighbor" && hasOspfBroadcastSegment && (
                        <p className="px-2.5 py-1.5 bg-slate-900 text-amber-300 text-[10px] leading-snug border-t border-slate-800">
                          DR-Wahl ist nicht präemptiv. Angezeigt ist das Ergebnis bei gleichzeitigem Start; in Packet Tracer kann der DR abweichen (clear ip ospf process).
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── VERBINDUNGS-DIALOG (Schritt 2d-1) ── */}
      {connectDialogState && (
        <ConnectDialog
          sourceDevice={connectDialogState.source}
          targetDevice={connectDialogState.target}
          existingLinks={activeTopology.links}
          theme={theme}
          onConnect={(newLink) => {
            setTopology((prev) => addLinkToTopology(prev, newLink), true);
            toast.success(`Verbindung ${connectDialogState.source.name} ↔ ${connectDialogState.target.name} erstellt`);
            setConnectDialogState(null);
          }}
          onClose={() => setConnectDialogState(null)}
        />
      )}

      {/* ── KONTEXTMENÜ (Touch Long-Press & Rechtsklick) ── */}
      {contextMenuState && (
        <DeviceContextMenu
          device={contextMenuState.device}
          x={contextMenuState.x}
          y={contextMenuState.y}
          theme={theme}
          onConnect={() => {
            setConnectSourceDevice(contextMenuState.device);
            setActiveMode("connect");
            toast.info(`Quellgerät ausgewählt: ${contextMenuState.device.name}. Wähle das Zielgerät.`);
          }}
          onConfigure={() => {
            setSelectedDevice(contextMenuState.device);
            setIsConfigDialogOpen(true);
          }}
          onDelete={() => {
            const devName = contextMenuState.device.name;
            setTopology((prev) => deleteDeviceFromTopology(prev, contextMenuState.device.id), true);
            if (selectedDevice?.id === contextMenuState.device.id) {
              setSelectedDevice(null);
            }
            toast.info(`${devName} gelöscht (Rückgängig mit Strg+Z)`);
          }}
          onClose={() => setContextMenuState(null)}
        />
      )}

      {/* ── GERÄTE-KONFIGURATIONSDIALOG (Schritt 2d-3) ── */}
      {isConfigDialogOpen && selectedDevice && (
        <DeviceConfigDialog
          device={selectedDevice}
          topology={activeTopology}
          theme={theme}
          isOpen={isConfigDialogOpen}
          onClose={() => setIsConfigDialogOpen(false)}
          onSave={(updatedDev) => {
            setTopology((prev) => ({
              ...prev,
              devices: prev.devices.map((d) => (d.id === updatedDev.id ? updatedDev : d)),
            }), true);
            setSelectedDevice(updatedDev);
            toast.success(`${updatedDev.name} Konfiguration gespeichert`);
          }}
        />
      )}

      {/* ── TOPOLOGIE-SPEICHER- & EXPORT-DIALOG (Schritt 2d-3) ── */}
      {isStorageDialogOpen && (
        <TopologyStorageDialog
          currentTopology={activeTopology}
          theme={theme}
          isOpen={isStorageDialogOpen}
          initialTab={storageDialogTab}
          onClose={() => {
            setIsStorageDialogOpen(false);
            onCloseStorageDialog?.();
          }}
          onLoadTopology={(loadedTopo) => {
            setTopology(() => loadedTopo, true);
            setSelectedTopologyId(loadedTopo.id);
            setSelectedDevice(null);
            setSelectedLink(null);
            setSelectedAnnotation(null);
            toast.success(`Topologie '${loadedTopo.name}' geladen`);
          }}
          svgElementRef={{
            get current() {
              return viewportRef.current?.querySelector("svg") as SVGSVGElement | null;
            },
          }}
        />
      )}

      {/* ── BARRIEREFREIE TEXTALTERNATIVE (Screenreader sr-only & Modale Ansicht) ── */}
      <TopologyScreenReaderView topology={activeTopology} isSrOnly={true} />
      {showScreenReaderView && (
        <TopologyScreenReaderView
          topology={activeTopology}
          isSrOnly={false}
          isOpen={true}
          theme={theme}
          onClose={() => setShowScreenReaderView(false)}
        />
      )}
    </div>
  );
};

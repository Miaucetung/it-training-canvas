import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  LinkType,
  NetworkTopology,
  TopologyDevice,
  TopologyLink,
} from "@/types/topology";
import {
  BUILT_IN_CCNA_TOPOLOGIES,
  generateBenchmarkTopology,
  TOPOLOGY_BASIC_LAN,
  TOPOLOGY_OSPF,
  TOPOLOGY_ROUTER_ON_A_STICK,
  TOPOLOGY_STP_TRIANGLE,
} from "@/lib/topology/sample-topologies";
import {
  migrateLocalStorageCanvasToV2,
  restoreBackupSnapshot,
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
} from "@/lib/topology/topology-operations";
import { useTopologyHistory } from "@/hooks/useTopologyHistory";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { SvgTopologyRenderer } from "./SvgTopologyRenderer";
import { TopologyLegend } from "./TopologyLegend";
import { DevicePalette } from "./DevicePalette";
import { ConnectDialog } from "./ConnectDialog";
import { DeviceContextMenu } from "./DeviceContextMenu";
import { toast } from "sonner";
import {
  ArrowsIn,
  CheckCircle,
  Eye,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Terminal,
  Warning,
  X,
} from "@phosphor-icons/react";

interface CanvasV2ContainerProps {
  theme?: "dark" | "light";
  onSwitchToV1?: () => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.5;

export const CanvasV2Container: React.FC<CanvasV2ContainerProps> = ({
  theme = "dark",
  onSwitchToV1,
}) => {
  const isDark = theme === "dark";

  // Verfügbare Topologien
  const [selectedTopologyId, setSelectedTopologyId] = useState<string>("ccna-router-on-a-stick");

  // Undo/Redo Topology History
  const {
    topology: activeTopology,
    setTopology,
    undo,
    redo,
    canUndo,
    canRedo,
    resetTopology,
  } = useTopologyHistory(TOPOLOGY_ROUTER_ON_A_STICK);

  // Migrierte Topologien aus dem Altsystem laden
  const [migratedTopologies, setMigratedTopologies] = useState<Record<string, NetworkTopology> | null>(null);
  const [migrationConflicts, setMigrationConflicts] = useState<MigrationConflict[]>([]);

  // View-State (Zoom & Pan)
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch Gesture Tracking (Pinch & Double Tap)
  const lastTouchDistRef = useRef<number | null>(null);
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Bearbeitungs-Modi & Palette (Schritt 2d-1)
  const [activePlacementType, setActivePlacementType] = useState<TopologyDevice["type"] | null>(null);
  const [activeMode, setActiveMode] = useState<"select" | "connect">("select");
  const [snapGrid, setSnapGrid] = useState<boolean>(false);

  // Dragging von Geräten auf dem Canvas
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [dragStartClient, setDragStartClient] = useState<{ x: number; y: number } | null>(null);
  const [initialDevicePos, setInitialDevicePos] = useState<{ x: number; y: number } | null>(null);
  const [hasMovedDevice, setHasMovedDevice] = useState<boolean>(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Performance-Tracking
  const [renderDurationMs, setRenderDurationMs] = useState<number>(0);

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

  // Altdaten-Prüfung & Konflikterkennung beim Start
  useEffect(() => {
    try {
      const migResult = migrateLocalStorageCanvasToV2();
      if (migResult.conflicts && migResult.conflicts.length > 0) {
        setMigrationConflicts(migResult.conflicts);
      }
      const stored = localStorage.getItem(V2_STORAGE_KEY);
      if (stored) {
        setMigratedTopologies(JSON.parse(stored));
      }
    } catch {
      // Ignorieren falls JSON fehlerhaft
    }
  }, []);

  // ResizeObserver: Reaktives Tracking für Container-Größe, Orientierungswechsel und Sidebar-Kollaps
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
    if (topo.devices.length === 0) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
      return;
    }

    const minX = Math.min(...topo.devices.map((d) => d.x));
    const maxX = Math.max(...topo.devices.map((d) => d.x + (d.width || 80)));
    const minY = Math.min(...topo.devices.map((d) => d.y));
    const maxY = Math.max(...topo.devices.map((d) => d.y + (d.height || 60)));

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

  // Topologie-Wechsel
  const handleSelectTopology = (id: string) => {
    const startTime = performance.now();
    setSelectedTopologyId(id);
    setSelectedDevice(null);
    setSelectedLink(null);
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

  // ── GERÄTE-INTERAKTIONEN (Schritt 2d-1) ──
  // PointerDown auf Gerät: Vorbereitung Verschieben oder Connect
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

    e.stopPropagation();
    setSelectedDevice(device);
    setSelectedLink(null);

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

  // Rechtsklick auf Gerät = Kontextmenü
  const handleDeviceContextMenu = (device: TopologyDevice, e: React.MouseEvent) => {
    e.preventDefault();
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    setContextMenuState({ device, x: e.clientX, y: e.clientY });
  };

  // Löschen des selektierten Geräts oder Links mit Undo
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
    }
  }, [selectedDevice, selectedLink, setTopology]);

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

  // Maus- und Touch-Pan / Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".topology-device, .topology-link, button, select")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingDeviceId && dragStartClient && initialDevicePos) {
      const dx = e.clientX - dragStartClient.x;
      const dy = e.clientY - dragStartClient.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 6) {
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

    if (!isPanning) return;
    setTranslateX(e.clientX - panStart.x);
    setTranslateY(e.clientY - panStart.y);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    if (draggingDeviceId && hasMovedDevice) {
      // Endgültige Position in Undo-Historie sichern
      setTopology((prev) => ({ ...prev }), true);
    }

    setDraggingDeviceId(null);
    setDragStartClient(null);
    setInitialDevicePos(null);
    setHasMovedDevice(false);
    setIsPanning(false);
  };

  // Touch-Gesten: Pinch-to-Zoom zum Mittelpunkt der Finger & 1-Finger Pan / Device Drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();

    if (e.touches.length === 1) {
      const t = e.touches[0];
      const now = Date.now();
      const distFromLastTap = Math.hypot(t.clientX - lastTapPosRef.current.x, t.clientY - lastTapPosRef.current.y);

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

      if ((e.target as HTMLElement).closest(".topology-device, .topology-link, button, select")) return;
      setIsPanning(true);
      setPanStart({ x: t.clientX - translateX, y: t.clientY - translateY });
    } else if (e.touches.length === 2) {
      // 2 Finger Pinch Start
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      setDraggingDeviceId(null);
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

      if (draggingDeviceId && dragStartClient && initialDevicePos) {
        const dx = t.clientX - dragStartClient.x;
        const dy = t.clientY - dragStartClient.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
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

      if (isPanning) {
        setTranslateX(t.clientX - panStart.x);
        setTranslateY(t.clientY - panStart.y);
      }
    } else if (e.touches.length === 2 && lastTouchDistRef.current !== null && lastTouchCenterRef.current) {
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
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    if (draggingDeviceId && hasMovedDevice) {
      setTopology((prev) => ({ ...prev }), true);
    }

    setDraggingDeviceId(null);
    setDragStartClient(null);
    setInitialDevicePos(null);
    setHasMovedDevice(false);
    setIsPanning(false);
    lastTouchDistRef.current = null;
    lastTouchCenterRef.current = null;
  };

  // Tastatursteuerung:
  // - Shift + Pfeiltasten: Verschiebt ausgewähltes Gerät am Raster
  // - Reguläre Pfeiltasten: Pannen des Viewports
  // - Strg+Z / Strg+Y: Undo / Redo
  // - Entf / Backspace: Ausgewähltes Element löschen
  // - +/- / 0: Zoom & Fit View
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

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

    // Löschen mit Undo
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      handleDeleteSelected();
      return;
    }

    // Ausgewähltes Gerät mit Shift + Pfeiltasten verschieben
    if (selectedDevice && e.shiftKey && (e.key.startsWith("Arrow"))) {
      e.preventDefault();
      const step = snapGrid ? DEFAULT_GRID_SIZE : 15;
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

    // Reguläre Tastaturkürzel (Canvas Viewport Steuerung)
    if (e.key === "+" || e.key === "=") {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === "-" || e.key === "_") {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === "0") {
      e.preventDefault();
      fitView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setTranslateY((y) => y + 35);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setTranslateY((y) => y - 35);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTranslateX((x) => x + 35);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setTranslateX((x) => x - 35);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-full flex flex-col select-none overflow-hidden outline-none ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
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
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            Topologie:
          </label>
          <select
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
            <optgroup label="Stresstest / Benchmark">
              <option value="benchmark-50-80">Benchmark Lasttest (50 Geräte, 80 Links)</option>
            </optgroup>
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
                  ? "bg-sky-500 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setViewDensity("detail")}
              className={`px-2 py-1 rounded-md transition-colors ${
                viewDensity === "detail"
                  ? "bg-sky-500 text-white font-bold"
                  : "text-slate-400 hover:text-white"
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
                className="px-2 py-1 rounded-md text-slate-400 hover:text-white transition-colors"
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

      {/* ── 2. GERÄTEPALETTE & EDITING TOOLBAR (Schritt 2d-1) ── */}
      <DevicePalette
        theme={theme}
        activePlacementType={activePlacementType}
        onSelectPlacementType={setActivePlacementType}
        activeMode={activeMode}
        onSelectMode={(m) => {
          setActiveMode(m);
          setConnectSourceDevice(null);
        }}
        snapGrid={snapGrid}
        onToggleSnapGrid={() => setSnapGrid((s) => !s)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        selectedDeviceId={selectedDevice?.id}
        selectedLinkId={selectedLink?.id}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* ── KONFLIKT-BANNER (aus Nacharbeit 2) ── */}
      {migrationConflicts.length > 0 && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-amber-200">
          <div className="flex items-center gap-2">
            <Warning size={16} className="text-amber-400 shrink-0" />
            <span className="font-bold text-amber-400">Versionskonflikt:</span>
            <span>{migrationConflicts[0].message}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const conflict = migrationConflicts[0];
                if (conflict.backupKey) {
                  restoreBackupSnapshot(conflict.backupKey);
                  const stored = localStorage.getItem(V2_STORAGE_KEY);
                  if (stored) setMigratedTopologies(JSON.parse(stored));
                  toast.success("Snapshot erfolgreich wiederhergestellt");
                }
                setMigrationConflicts([]);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] transition-colors"
            >
              Snapshot wiederherstellen
            </button>
            <button
              onClick={() => setMigrationConflicts([])}
              className="px-2 py-1 rounded-lg border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 text-[11px] transition-colors"
            >
              Schließen
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

      {/* ── CANVAS BEREICH: Interaktives SVG Rendering mit Touch-Action none ── */}
      <div
        ref={viewportRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
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
          }}
          onLinkClick={(l) => {
            setSelectedLink(l);
            setSelectedDevice(null);
          }}
          onDevicePointerDown={handleDevicePointerDown}
          onDeviceContextMenu={handleDeviceContextMenu}
          scale={scale}
          translateX={translateX}
          translateY={translateY}
        />

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
                      <div className="font-bold text-sky-400">{iface.name}</div>
                      {iface.ip && <div className="text-slate-300">{iface.ip}</div>}
                      {iface.description && (
                        <div className="text-[10px] text-slate-400">{iface.description}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">
                        {iface.status.toUpperCase()}
                      </span>
                      {iface.vlan && (
                        <div className="text-[10px] text-indigo-400 mt-0.5">VLAN {iface.vlan}</div>
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
                <div className="space-y-2">
                  {Object.entries(dynamicShowOutputs).map(([cmd, out]) => (
                    <div key={cmd} className="rounded-lg overflow-hidden border border-slate-800">
                      <div className="px-2.5 py-1 bg-slate-800/90 text-green-400 font-mono text-[10px] font-bold">
                        # {cmd}
                      </div>
                      <pre className="p-2 bg-black/90 text-slate-300 font-mono text-[9.5px] overflow-x-auto whitespace-pre leading-tight">
                        {out}
                      </pre>
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
    </div>
  );
};

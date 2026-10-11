import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
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
  V2_STORAGE_KEY,
} from "@/lib/topology/migration";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { SvgTopologyRenderer } from "./SvgTopologyRenderer";
import { TopologyLegend } from "./TopologyLegend";
import {
  ArrowsIn,
  CheckCircle,
  Eye,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Terminal,
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
  const [activeTopology, setActiveTopology] = useState<NetworkTopology>(TOPOLOGY_ROUTER_ON_A_STICK);

  // Migrierte Topologien aus dem Altsystem laden
  const [migratedTopologies, setMigratedTopologies] = useState<Record<string, NetworkTopology> | null>(null);

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

  // Altdaten-Prüfung beim Start
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
      setActiveTopology(nextTopo);
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

  // Maus-Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".topology-device, .topology-link, button, select")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTranslateX(e.clientX - panStart.x);
    setTranslateY(e.clientY - panStart.y);
  };

  const handleMouseUp = () => setIsPanning(false);

  // Touch-Gesten: Pinch-to-Zoom zum Mittelpunkt der Finger & 1-Finger Pan
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

    if (e.touches.length === 1 && isPanning) {
      const t = e.touches[0];
      setTranslateX(t.clientX - panStart.x);
      setTranslateY(t.clientY - panStart.y);
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
    setIsPanning(false);
    lastTouchDistRef.current = null;
    lastTouchCenterRef.current = null;
  };

  // Tastatursteuerung (+/- zoomen, Pfeiltasten pannen, 0 = einpassen)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

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
      setTranslateY((y) => y + (e.shiftKey ? 80 : 35));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setTranslateY((y) => y - (e.shiftKey ? 80 : 35));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTranslateX((x) => x + (e.shiftKey ? 80 : 35));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setTranslateX((x) => x - (e.shiftKey ? 80 : 35));
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-full flex flex-col overflow-hidden select-none outline-none focus:ring-1 focus:ring-sky-500/30 ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
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

      {/* ── CANVAS BEREICH: Interaktives SVG Rendering mit Touch-Action none ── */}
      <div
        ref={viewportRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onWheel={handleWheel}
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
          selectedDeviceId={selectedDevice?.id}
          selectedLinkId={selectedLink?.id}
          onDeviceClick={(d) => {
            setSelectedDevice(d);
            setSelectedLink(null);
          }}
          onLinkClick={(l) => {
            setSelectedLink(l);
            setSelectedDevice(null);
          }}
          scale={scale}
          translateX={translateX}
          translateY={translateY}
        />

        {/* Legende Overlay */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 z-30 max-w-[340px]">
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
          className={`absolute bottom-0 right-0 sm:top-12 sm:bottom-auto sm:right-3 w-full sm:w-80 max-h-[55vh] sm:max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border shadow-2xl p-4 z-40 transition-all ${
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
            <button
              onClick={() => setSelectedDevice(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
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
    </div>
  );
};

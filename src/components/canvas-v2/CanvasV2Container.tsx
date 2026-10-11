import React, { useState, useEffect, useRef, useMemo } from "react";
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

export const CanvasV2Container: React.FC<CanvasV2ContainerProps> = ({
  theme = "dark",
  onSwitchToV1,
}) => {
  const isDark = theme === "dark";

  // Verfügbare Topologien
  const [selectedTopologyId, setSelectedTopologyId] = useState<string>("ccna-router-on-a-stick");
  const [activeTopology, setActiveTopology] = useState<NetworkTopology>(TOPOLOGY_ROUTER_ON_A_STICK);

  // View States
  const [viewDensity, setViewDensity] = useState<"simple" | "detail">("detail");
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<TopologyDevice | null>(null);
  const [selectedLink, setSelectedLink] = useState<TopologyLink | null>(null);

  // Zoom & Pan
  const [scale, setScale] = useState<number>(1);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Performance Benchmarking
  const [renderDurationMs, setRenderDurationMs] = useState<number>(0);

  // Migrierte Altdaten aus LocalStorage laden
  const migratedTopologies = useMemo(() => {
    try {
      const raw = localStorage.getItem(V2_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }, []);

  // Topologie-Wechsel
  const handleSelectTopology = (id: string) => {
    const startTime = performance.now();
    setSelectedTopologyId(id);
    setSelectedDevice(null);
    setSelectedLink(null);

    if (id === "benchmark-50-80") {
      const bench = generateBenchmarkTopology(50, 80);
      setActiveTopology(bench);
      fitView(bench);
    } else if (id.startsWith("migrated-") && migratedTopologies) {
      const key = id.replace("migrated-", "");
      const topo = migratedTopologies[key];
      if (topo) {
        setActiveTopology(topo);
        fitView(topo);
      }
    } else {
      const found = BUILT_IN_CCNA_TOPOLOGIES.find((t) => t.id === id);
      if (found) {
        setActiveTopology(found);
        fitView(found);
      }
    }
    const elapsed = performance.now() - startTime;
    setRenderDurationMs(parseFloat(elapsed.toFixed(1)));
  };

  // Zoom & Pan Steuerungen
  const handleZoomIn = () => setScale((s) => Math.min(2.5, s + 0.15));
  const handleZoomOut = () => setScale((s) => Math.max(0.3, s - 0.15));
  const handleZoomReset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const fitView = (topo = activeTopology) => {
    if (topo.devices.length === 0) {
      handleZoomReset();
      return;
    }
    const minX = Math.min(...topo.devices.map((d) => d.x));
    const maxX = Math.max(...topo.devices.map((d) => d.x + (d.width || 80)));
    const minY = Math.min(...topo.devices.map((d) => d.y));
    const maxY = Math.max(...topo.devices.map((d) => d.y + (d.height || 60)));

    const width = maxX - minX + 80;
    const height = maxY - minY + 80;

    // Zielbereich annehmen (Standardcontainer 800x500)
    const targetW = window.innerWidth > 640 ? 860 : 360;
    const targetH = window.innerHeight > 640 ? 550 : 420;

    const scaleX = targetW / width;
    const scaleY = targetH / height;
    const optimalScale = Math.min(1.4, Math.max(0.35, Math.min(scaleX, scaleY) * 0.85));

    setScale(optimalScale);
    setTranslateX((targetW - width * optimalScale) / 2 - minX * optimalScale + 20);
    setTranslateY((targetH - height * optimalScale) / 2 - minY * optimalScale + 20);
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".topology-device, .topology-link, button")) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTranslateX(e.clientX - panStart.x);
    setTranslateY(e.clientY - panStart.y);
  };

  const handleMouseUp = () => setIsPanning(false);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((s) => Math.min(3, Math.max(0.2, s * zoomFactor)));
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden select-none ${
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
              <option value="ccna-stp-triangle">Spanning Tree (STP-Dreieck)</option>
              <option value="ccna-ospf-routing">OSPFv2 Point-to-Point</option>
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
            title="Ansicht einpassen"
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
              title="Herauszoomen"
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
              title="Hereinzoomen"
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
                className="px-2 py-1 rounded-md bg-indigo-600 text-white font-bold"
                title="Neuer SVG Topologie-Renderer (v2)"
              >
                v2 (SVG Next)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RENDERING BEREICH: SVG Canvas mit Zoom/Pan ── */}
      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
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

            {/* Simulierte Cisco IOS Show Befehle */}
            {selectedDevice.config?.showOutputs && (
              <div>
                <h4 className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Terminal size={14} className="text-green-400" />
                  <span>Simulierte CLI show-Ausgaben</span>
                </h4>
                <div className="space-y-2">
                  {Object.entries(selectedDevice.config.showOutputs).map(([cmd, out]) => (
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

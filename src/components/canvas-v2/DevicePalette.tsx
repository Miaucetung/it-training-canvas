import { TopologyDevice } from "@/types/topology";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowUpRight,
  Circle,
  Cursor,
  GridFour,
  LineSegment,
  Note,
  PencilSimple,
  PlugsConnected,
  Square,
  TextT,
  Trash,
} from "@phosphor-icons/react";
import React from "react";
import { DeviceIcon } from "./DeviceIcons";

export type CanvasToolMode =
  | "select"
  | "connect"
  | "note"
  | "text"
  | "freehand"
  | "line"
  | "arrow"
  | "box"
  | "circle";

export interface DevicePaletteProps {
  theme?: "dark" | "light";
  activePlacementType: TopologyDevice["type"] | null;
  onSelectPlacementType: (type: TopologyDevice["type"] | null) => void;
  activeMode: CanvasToolMode;
  onSelectMode: (mode: CanvasToolMode) => void;
  activeAnnotationColor?: string;
  onSelectAnnotationColor?: (color: string) => void;
  snapGrid: boolean;
  onToggleSnapGrid: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  selectedDeviceId?: string | null;
  selectedLinkId?: string | null;
  selectedAnnotationId?: string | null;
  onDeleteSelected: () => void;
}

const PALETTE_DEVICES: Array<{
  type: TopologyDevice["type"];
  label: string;
  tooltip: string;
}> = [
  {
    type: "router",
    label: "Router",
    tooltip: "Cisco ISR/CSR Router (WAN, OSPF, BGP)",
  },
  {
    type: "switch-l2",
    label: "Switch L2",
    tooltip: "Layer-2 Switch (VLANs, STP, 802.1Q)",
  },
  {
    type: "switch-l3",
    label: "Switch L3",
    tooltip: "Multilayer Switch (Inter-VLAN SVI, Routing)",
  },
  {
    type: "pc",
    label: "PC",
    tooltip: "Endgerät Host / Client (DHCP, IPv4/IPv6)",
  },
  {
    type: "server",
    label: "Server",
    tooltip: "Server (DNS, DHCP, Web, Syslog)",
  },
  { type: "access-point", label: "AP", tooltip: "Access Point (WLAN 802.11, SSID)" },
  { type: "wlc", label: "WLC", tooltip: "Wireless LAN Controller (CAPWAP)" },
  {
    type: "firewall",
    label: "Firewall",
    tooltip: "Cisco ASA / FTD Firewall (ACLs, NAT)",
  },
  {
    type: "cloud",
    label: "Cloud",
    tooltip: "WAN / ISP Internet Cloud (Multi-Access, NAT)",
  },
];

const ANNOTATION_COLORS = [
  { name: "Gelb", value: "#F59E0B" },
  { name: "Blau", value: "#38BDF8" },
  { name: "Grün", value: "#10B981" },
  { name: "Pink", value: "#EC4899" },
  { name: "Grau", value: "#94A3B8" },
];

export const DevicePalette: React.FC<DevicePaletteProps> = ({
  theme = "dark",
  activePlacementType,
  onSelectPlacementType,
  activeMode,
  onSelectMode,
  activeAnnotationColor = "#F59E0B",
  onSelectAnnotationColor,
  snapGrid,
  onToggleSnapGrid,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  selectedDeviceId,
  selectedLinkId,
  selectedAnnotationId,
  onDeleteSelected,
}) => {
  const isDark = theme === "dark";

  const isDrawingMode = [
    "note",
    "text",
    "freehand",
    "line",
    "arrow",
    "box",
    "circle",
  ].includes(activeMode);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-1.5 px-3 py-1.5 border-b shrink-0 z-20 text-xs backdrop-blur-md ${
        isDark
          ? "bg-slate-900/95 border-slate-800 text-white"
          : "bg-white/95 border-slate-200 text-slate-900"
      }`}
    >
      {/* ── 1. MODUS-WERKZEUGE (Zeiger, Verbinden & Annotationen) ── */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Zeiger (Auswahl / Verschieben) */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("select");
          }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "select" && !activePlacementType
              ? "bg-sky-500 text-white shadow-xs ring-1 ring-sky-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Auswahl- und Verschiebe-Werkzeug (Taste Esc)"
        >
          <Cursor size={14} weight="bold" />
          <span className="hidden sm:inline">Zeiger</span>
        </button>

        {/* Verbinden */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("connect");
          }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "connect"
              ? "bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Verbinden: Klicke nacheinander auf zwei Geräte"
        >
          <PlugsConnected size={14} weight="bold" />
          <span className="hidden sm:inline">Verbinden</span>
        </button>

        <div className="h-4 w-px bg-slate-700/60 hidden sm:block mx-0.5" />

        {/* ── ANNOTATIONS-WERKZEUGE (Schritt 2d-2) ── */}
        {/* Notiz / Post-it */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("note");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "note"
              ? "bg-amber-500 text-white shadow-xs ring-1 ring-amber-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Haftnotiz / Sticky Note hinzufügen"
        >
          <Note size={15} weight="bold" />
        </button>

        {/* Text */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("text");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "text"
              ? "bg-sky-500 text-white shadow-xs ring-1 ring-sky-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Textbeschriftung einfügen"
        >
          <TextT size={15} weight="bold" />
        </button>

        {/* Freihand-Stift */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("freehand");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "freehand"
              ? "bg-emerald-500 text-white shadow-xs ring-1 ring-emerald-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Freihand-Zeichnung (geglätteter Stift)"
        >
          <PencilSimple size={15} weight="bold" />
        </button>

        {/* Linie */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("line");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "line"
              ? "bg-slate-600 text-white shadow-xs ring-1 ring-slate-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Linie ziehen"
        >
          <LineSegment size={15} weight="bold" />
        </button>

        {/* Pfeil */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("arrow");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "arrow"
              ? "bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Richtungspfeil zeichnen"
        >
          <ArrowUpRight size={15} weight="bold" />
        </button>

        {/* Rechteck */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("box");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "box"
              ? "bg-purple-600 text-white shadow-xs ring-1 ring-purple-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Rechteck / Box zeichnen"
        >
          <Square size={15} weight="bold" />
        </button>

        {/* Kreis / Ellipse */}
        <button
          onClick={() => {
            onSelectPlacementType(null);
            onSelectMode("circle");
          }}
          className={`p-1.5 rounded-lg font-semibold transition-all ${
            activeMode === "circle"
              ? "bg-pink-600 text-white shadow-xs ring-1 ring-pink-300"
              : isDark
                ? "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
                : "bg-slate-100 text-slate-700 hover:text-black hover:bg-slate-200"
          }`}
          title="Kreis / Ellipse zeichnen"
        >
          <Circle size={15} weight="bold" />
        </button>

        {/* Farbwähler bei aktivem Zeichenwerkzeug */}
        {isDrawingMode && onSelectAnnotationColor && (
          <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-lg bg-black/20 border border-slate-700/60">
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => onSelectAnnotationColor(c.value)}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  activeAnnotationColor === c.value
                    ? "scale-125 ring-2 ring-white"
                    : "opacity-70 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.value }}
                title={`Farbe: ${c.name}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-slate-700/60 hidden md:block" />

      {/* ── 2. GERÄTE-PALETTE (Drag per Maus & Tap per Touch) ── */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5 hidden xl:inline">
          Geräte:
        </span>
        {PALETTE_DEVICES.map((d) => {
          const isSelectedForPlacement = activePlacementType === d.type;

          return (
            <button
              key={d.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/ccna-device-type", d.type);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => {
                onSelectPlacementType(isSelectedForPlacement ? null : d.type);
                if (!isSelectedForPlacement) {
                  onSelectMode("select");
                }
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-medium text-[11px] transition-all cursor-grab active:cursor-grabbing shrink-0 ${
                isSelectedForPlacement
                  ? "bg-sky-500/25 border-sky-400 text-sky-200 ring-2 ring-sky-400/30 scale-105"
                  : isDark
                    ? "bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-700/80 hover:border-slate-600"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
              title={`${d.tooltip} — Ziehen oder Antippen zum Platzieren`}
            >
              <div className="shrink-0 scale-75 origin-center">
                <DeviceIcon type={d.type} size={18} status="active" />
              </div>
              <span className="text-[10px]">{d.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-slate-700/60 hidden md:block" />

      {/* ── 3. AKTIONEN: Undo / Redo / Raster / Löschen ── */}
      <div className="flex items-center gap-1">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-lg border transition-colors ${
            canUndo
              ? isDark
                ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                : "border-slate-200 text-slate-800 hover:bg-slate-100"
              : "border-transparent text-slate-600 cursor-not-allowed opacity-40"
          }`}
          title="Rückgängig (Strg+Z)"
        >
          <ArrowCounterClockwise size={14} weight="bold" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-lg border transition-colors ${
            canRedo
              ? isDark
                ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                : "border-slate-200 text-slate-800 hover:bg-slate-100"
              : "border-transparent text-slate-600 cursor-not-allowed opacity-40"
          }`}
          title="Wiederholen (Strg+Y)"
        >
          <ArrowClockwise size={14} weight="bold" />
        </button>

        {/* Snap to Grid */}
        <button
          onClick={onToggleSnapGrid}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-colors ${
            snapGrid
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
              : isDark
                ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                : "border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Am 20px-Raster einrasten (Snap-to-Grid)"
        >
          <GridFour size={14} weight={snapGrid ? "bold" : "regular"} />
          <span className="hidden sm:inline">Raster</span>
        </button>

        {/* Löschen */}
        {(selectedDeviceId || selectedLinkId || selectedAnnotationId) && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold text-[11px] transition-colors"
            title="Ausgewähltes Element löschen (Taste Entf) mit Undo"
          >
            <Trash size={14} weight="bold" />
            <span className="hidden sm:inline">Löschen</span>
          </button>
        )}
      </div>
    </div>
  );
};

import React, { useId, useMemo } from "react";
import { DeviceIcon } from "@/components/canvas-v2/DeviceIcons";
import type { DeviceType } from "@/types/topology";
import { cn } from "@/lib/utils";
import { placeZoneBadge } from "./topology-geometry";
import {
  ASSUMED_CAPTION,
  deviceNameWidth,
  getPortLabelPos,
  ipLabelWidth,
  portLabelWidth,
  subnetLabelWidth,
  zoneBadgeWidth,
} from "./topology-layout";
import type {
  LabTopologyData,
  LabTopologyDevice,
} from "./types";

interface ProfessionalTopologyDiagramProps {
  topology: LabTopologyData;
  detailMode?: boolean;
  selectedDevice?: string | null;
  onSelectDevice?: (deviceName: string | null) => void;
  className?: string;
  theme?: "dark" | "light";
}

const COLOR_THEMES = {
  indigo: {
    zoneFill: "rgba(99, 102, 241, 0.06)",
    zoneStroke: "rgba(129, 140, 248, 0.35)",
    tagBg: "rgba(99, 102, 241, 0.15)",
    tagText: "#a5b4fc",
    vlanPill: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  },
  blue: {
    zoneFill: "rgba(59, 130, 246, 0.06)",
    zoneStroke: "rgba(96, 165, 250, 0.35)",
    tagBg: "rgba(59, 130, 246, 0.15)",
    tagText: "#93c5fd",
    vlanPill: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  amber: {
    zoneFill: "rgba(245, 158, 11, 0.06)",
    zoneStroke: "rgba(251, 191, 36, 0.35)",
    tagBg: "rgba(245, 158, 11, 0.15)",
    tagText: "#fcd34d",
    vlanPill: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  emerald: {
    zoneFill: "rgba(16, 185, 129, 0.06)",
    zoneStroke: "rgba(52, 211, 153, 0.35)",
    tagBg: "rgba(16, 185, 129, 0.15)",
    tagText: "#6ee7b7",
    vlanPill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  violet: {
    zoneFill: "rgba(139, 92, 246, 0.06)",
    zoneStroke: "rgba(167, 139, 250, 0.35)",
    tagBg: "rgba(139, 92, 246, 0.15)",
    tagText: "#c4b5fd",
    vlanPill: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
  rose: {
    zoneFill: "rgba(244, 63, 94, 0.06)",
    zoneStroke: "rgba(251, 113, 133, 0.35)",
    tagBg: "rgba(244, 63, 94, 0.15)",
    tagText: "#fda4af",
    vlanPill: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  slate: {
    zoneFill: "rgba(100, 116, 139, 0.06)",
    zoneStroke: "rgba(148, 163, 184, 0.30)",
    tagBg: "rgba(100, 116, 139, 0.15)",
    tagText: "#cbd5e1",
    vlanPill: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
};

export const ProfessionalTopologyDiagram: React.FC<ProfessionalTopologyDiagramProps> = ({
  topology,
  detailMode = false,
  selectedDevice = null,
  onSelectDevice,
  className,
  theme = "dark",
}) => {
  const isLight = theme === "light";
  const clipId = useId();

  const deviceMap = useMemo(() => {
    const map = new Map<string, LabTopologyDevice>();
    topology.devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [topology.devices]);

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border overflow-hidden select-none transition-colors",
        isLight
          ? "bg-slate-50/80 border-slate-300/80 text-slate-900"
          : "bg-slate-950/90 border-slate-800 text-slate-100",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${topology.viewBox.width} ${topology.viewBox.height}`}
        className="w-full h-auto block"
        role="img"
        aria-label="Cisco Netzwerk-Topologiediagramm"
        style={{
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <defs>
          {/* Dezentes Punktraster für Cisco-Press-Hintergrund */}
          <pattern
            id={`grid-${clipId}`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="12"
              cy="12"
              r="1"
              fill={isLight ? "#cbd5e1" : "#1e293b"}
              opacity={isLight ? 0.7 : 0.4}
            />
          </pattern>

          {/* Schatten für Geräte-Icons */}
          <filter id={`device-shadow-${clipId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3"
              floodColor={isLight ? "#64748b" : "#000000"}
              floodOpacity={isLight ? "0.15" : "0.5"}
            />
          </filter>
        </defs>

        {/* 1. Hintergrund-Raster */}
        <rect
          width={topology.viewBox.width}
          height={topology.viewBox.height}
          fill={`url(#grid-${clipId})`}
        />

        {/* 2. Subnetz- und Broadcast-Zonen (Hintergrund-Ebene) */}
        {topology.zones?.map((zone) => {
          const c = COLOR_THEMES[zone.colorTheme || "indigo"];
          const badge = placeZoneBadge(topology, zone.id).box;
          return (
            <g key={zone.id} className="transition-all duration-200">
              {/* Zonen-Rechteck */}
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                rx="14"
                fill={c.zoneFill}
                stroke={c.zoneStroke}
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              {/* Zonen-Header Badge (Ecke mit freier Fläche, siehe placeZoneBadge) */}
              <g transform={`translate(${badge.minX + 4}, ${badge.minY + 11})`}>
                <rect
                  x="-4"
                  y="-11"
                  width={zoneBadgeWidth(zone.label)}
                  height="18"
                  rx="6"
                  fill={isLight ? "#ffffff" : "#0f172a"}
                  stroke={c.zoneStroke}
                  strokeWidth="1"
                />
                <text
                  x="4"
                  y="2"
                  fontSize="9.5"
                  fontWeight="700"
                  fill={isLight ? "#334155" : c.tagText}
                  letterSpacing="0.02em"
                >
                  {zone.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* 3. Physische Verbindungen (Links) */}
        {topology.links.map((link) => {
          const fromDev = deviceMap.get(link.from);
          const toDev = deviceMap.get(link.to);
          if (!fromDev || !toDev) return null;

          const isConnectedToSelected =
            selectedDevice &&
            (selectedDevice === fromDev.name || selectedDevice === toDev.name);

          // Pfad-Generierung: gerade oder über definierte rechtwinklige Stützpunkte
          let pathD = `M ${fromDev.x} ${fromDev.y}`;
          if (link.bendPoints && link.bendPoints.length > 0) {
            link.bendPoints.forEach((bp) => {
              pathD += ` L ${bp.x} ${bp.y}`;
            });
          }
          pathD += ` L ${toDev.x} ${toDev.y}`;

          // Stützpunkte für Label-Berechnung
          const firstTargetX = link.bendPoints?.[0]?.x ?? toDev.x;
          const firstTargetY = link.bendPoints?.[0]?.y ?? toDev.y;
          const lastSourceX =
            link.bendPoints?.[link.bendPoints.length - 1]?.x ?? fromDev.x;
          const lastSourceY =
            link.bendPoints?.[link.bendPoints.length - 1]?.y ?? fromDev.y;

          const fromOffset = link.fromPortOffset ?? 48;
          const toOffset = link.toPortOffset ?? 48;
          const fromSide = link.fromPortSide ?? 12;
          const toSide = link.toPortSide ?? 12;

          const fromLabelPos = getPortLabelPos(
            fromDev.x,
            fromDev.y,
            firstTargetX,
            firstTargetY,
            fromOffset,
            fromSide,
          );
          const toLabelPos = getPortLabelPos(
            toDev.x,
            toDev.y,
            lastSourceX,
            lastSourceY,
            toOffset,
            toSide,
          );

          // Mittelpunkt für Subnetz-Link-Label
          const midX = link.subnetLabelPos?.x ?? (fromDev.x + toDev.x) / 2;
          const midY = link.subnetLabelPos?.y ?? (fromDev.y + toDev.y) / 2;

          const isTunnel = link.cableType === "tunnel";
          const dashedLink = isTunnel || fromDev.assumed === true || toDev.assumed === true;
          const linkColor = isConnectedToSelected
            ? "#38bdf8"
            : isTunnel
              ? isLight
                ? "#9333ea"
                : "#c084fc"
            : link.isTrunk
              ? isLight
                ? "#2563eb"
                : "#60a5fa"
              : isLight
                ? "#475569"
                : "#94a3b8";

          const fromPortWidth = portLabelWidth(link.fromPort);
          const toPortWidth = portLabelWidth(link.toPort);
          const fromIpWidth = ipLabelWidth(link.fromIp);
          const toIpWidth = ipLabelWidth(link.toIp);

          return (
            <g key={link.id} className="transition-all duration-200">
              {/* Basis-Linklinie */}
              <path
                d={pathD}
                stroke={linkColor}
                strokeWidth={link.isTrunk ? 3 : 2}
                strokeDasharray={dashedLink ? "6 4" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={selectedDevice && !isConnectedToSelected ? 0.35 : 1}
              />

              {/* 802.1Q Trunk-Streifenmuster / Kennzeichnung */}
              {link.isTrunk && (
                <path
                  d={pathD}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={isLight ? 0.8 : 0.9}
                />
              )}

              {/* Mittiges Subnetz-Label falls vorhanden (z. B. Point-to-Point WAN) */}
              {link.subnetLabel && (
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-subnetLabelWidth(link.subnetLabel) / 2}
                    y="-9"
                    width={subnetLabelWidth(link.subnetLabel)}
                    height="18"
                    rx="6"
                    fill={isLight ? "#ffffff" : "#0f172a"}
                    stroke={isLight ? "#cbd5e1" : "#334155"}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fontSize="9"
                    fontWeight="600"
                    fill={isLight ? "#334155" : "#e2e8f0"}
                  >
                    {link.subnetLabel}
                  </text>
                </g>
              )}

              {/* Port-Label From */}
              <g
                transform={`translate(${fromLabelPos.x}, ${fromLabelPos.y})`}
                opacity={selectedDevice && !isConnectedToSelected ? 0.35 : 1}
              >
                <rect
                  x={-fromPortWidth / 2}
                  y="-8"
                  width={fromPortWidth}
                  height="16"
                  rx="4"
                  fill={isLight ? "#f1f5f9" : "#090d16"}
                  stroke={isLight ? "#94a3b8" : "#334155"}
                  strokeWidth="1"
                />
                <text
                  textAnchor="middle"
                  dy="3.5"
                  fontSize="8.5"
                  fontWeight="600"
                  fill={isLight ? "#1e293b" : "#cbd5e1"}
                >
                  {link.fromPort}
                </text>
                {/* Detail Mode: IP unter dem Port */}
                {detailMode && link.fromIp && (
                  <g transform="translate(0, 16)">
                    <rect
                      x={-fromIpWidth / 2}
                      y="-7"
                      width={fromIpWidth}
                      height="14"
                      rx="3"
                      fill={isLight ? "#e0f2fe" : "#032b43"}
                      stroke="#0284c7"
                      strokeWidth="0.8"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fontSize="7.5"
                      fontWeight="700"
                      fill="#38bdf8"
                    >
                      {link.fromIp}
                    </text>
                  </g>
                )}
              </g>

              {/* Port-Label To */}
              <g
                transform={`translate(${toLabelPos.x}, ${toLabelPos.y})`}
                opacity={selectedDevice && !isConnectedToSelected ? 0.35 : 1}
              >
                <rect
                  x={-toPortWidth / 2}
                  y="-8"
                  width={toPortWidth}
                  height="16"
                  rx="4"
                  fill={isLight ? "#f1f5f9" : "#090d16"}
                  stroke={isLight ? "#94a3b8" : "#334155"}
                  strokeWidth="1"
                />
                <text
                  textAnchor="middle"
                  dy="3.5"
                  fontSize="8.5"
                  fontWeight="600"
                  fill={isLight ? "#1e293b" : "#cbd5e1"}
                >
                  {link.toPort}
                </text>
                {/* Detail Mode: IP unter dem Port */}
                {detailMode && link.toIp && (
                  <g transform="translate(0, 16)">
                    <rect
                      x={-toIpWidth / 2}
                      y="-7"
                      width={toIpWidth}
                      height="14"
                      rx="3"
                      fill={isLight ? "#e0f2fe" : "#032b43"}
                      stroke="#0284c7"
                      strokeWidth="0.8"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fontSize="7.5"
                      fontWeight="700"
                      fill="#38bdf8"
                    >
                      {link.toIp}
                    </text>
                  </g>
                )}
              </g>
            </g>
          );
        })}

        {/* 4. Netzwerk-Geräte (Nodes) */}
        {topology.devices.map((device) => {
          const isSelected = selectedDevice === device.name;
          const isFaded = selectedDevice && !isSelected;

          return (
            <g
              key={device.id}
              transform={`translate(${device.x}, ${device.y})`}
              className="cursor-pointer group"
              onClick={() =>
                onSelectDevice?.(isSelected ? null : device.name)
              }
              role="button"
              tabIndex={0}
              aria-label={`Gerät ${device.name} auswählen`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectDevice?.(isSelected ? null : device.name);
                }
              }}
            >
              {/* Fokus- / Auswahl-Aura */}
              {isSelected && (
                <circle
                  r="34"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                  className="animate-spin-slow"
                />
              )}

              {device.assumed && (
                <rect
                  x="-30"
                  y="-30"
                  width="60"
                  height="60"
                  rx="10"
                  fill="none"
                  stroke={isLight ? "#64748b" : "#94a3b8"}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
              )}

              {/* Gerätesymbol zentriert */}
              <g
                transform="translate(-24, -24)"
                filter={`url(#device-shadow-${clipId})`}
                opacity={isFaded ? 0.35 : 1}
                className="transition-opacity duration-150"
              >
                <DeviceIcon
                  type={device.type as DeviceType}
                  size={48}
                  status={isSelected ? "active" : "active"}
                />
              </g>

              {/* Gerätename & Modell-Beschriftung (unter dem Symbol) */}
              <g
                transform="translate(0, 36)"
                opacity={isFaded ? 0.4 : 1}
                className="transition-opacity duration-150"
              >
                {/* Hintergrundpill für maximale Lesbarkeit */}
                <rect
                  x={-deviceNameWidth(device.name) / 2}
                  y="-11"
                  width={deviceNameWidth(device.name)}
                  height="18"
                  rx="5"
                  fill={
                    isSelected
                      ? "#0284c7"
                      : isLight
                        ? "#ffffff"
                        : "#0f172a"
                  }
                  stroke={
                    isSelected
                      ? "#38bdf8"
                      : isLight
                        ? "#cbd5e1"
                        : "#334155"
                  }
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                <text
                  textAnchor="middle"
                  dy="2"
                  fontSize="11"
                  fontWeight="700"
                  fill={
                    isSelected
                      ? "#ffffff"
                      : isLight
                        ? "#0f172a"
                        : "#f8fafc"
                  }
                  letterSpacing="0.01em"
                >
                  {device.name}
                </text>

                {/* Hardware-Modell (z. B. Cisco 2901) */}
                {device.model && (
                  <text
                    textAnchor="middle"
                    y="18"
                    fontSize="8.5"
                    fontWeight="500"
                    fill={isLight ? "#64748b" : "#94a3b8"}
                  >
                    {device.model}
                  </text>
                )}
                {device.assumed && (
                  <text
                    textAnchor="middle"
                    y={device.model ? 30 : 18}
                    fontSize="7.5"
                    fontStyle="italic"
                    fill={isLight ? "#64748b" : "#94a3b8"}
                  >
                    {ASSUMED_CAPTION}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Textmarken (z. B. logischer Tunnel ohne eigenes Interface) */}
        {(topology.notes ?? []).map((note) => (
          <g key={note.id} transform={`translate(${note.x}, ${note.y})`}>
            <rect
              x={-subnetLabelWidth(note.text) / 2}
              y="-9"
              width={subnetLabelWidth(note.text)}
              height="18"
              rx="6"
              fill={isLight ? "#faf5ff" : "#1e1b4b"}
              stroke={isLight ? "#9333ea" : "#c084fc"}
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text textAnchor="middle" dy="3.5" fontSize="9" fontWeight="600" fill={isLight ? "#6b21a8" : "#e9d5ff"}>
              {note.text}
            </text>
          </g>
        ))}
      </svg>

      {/* 5. Legende für VLANs & Farbcodes */}
      {topology.vlans && topology.vlans.length > 0 && (
        <div
          className={cn(
            "p-3 border-t flex flex-wrap items-center gap-3 text-xs font-mono shrink-0",
            isLight
              ? "bg-slate-100/90 border-slate-300/80 text-slate-700"
              : "bg-slate-900/90 border-slate-800 text-slate-300",
          )}
        >
          <span className="font-sans font-bold text-[11px] text-slate-400 uppercase tracking-wider mr-1">
            VLAN Legende:
          </span>
          {topology.vlans.map((vlan) => {
            const c = COLOR_THEMES[vlan.colorTheme];
            return (
              <div
                key={vlan.id}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px]",
                  c.vlanPill,
                )}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                <span className="font-bold">VLAN {vlan.id}</span>
                <span className="opacity-80">({vlan.name})</span>
                <span className="opacity-60 text-[10px] pl-1 font-sans">
                  {vlan.subnet}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

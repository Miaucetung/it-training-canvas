import React from "react";
import {
  NetworkTopology,
  TopologyDevice,
  TopologyLink,
  TopologyAnnotation,
  TopologySubnetZone,
} from "@/types/topology";
import { DeviceIcon } from "./DeviceIcons";
import { LinkRenderer } from "./LinkRenderer";

interface SvgTopologyRendererProps {
  topology: NetworkTopology;
  viewDensity?: "simple" | "detail";
  theme?: "dark" | "light";
  selectedDeviceId?: string | null;
  selectedLinkId?: string | null;
  onDeviceClick?: (device: TopologyDevice) => void;
  onLinkClick?: (link: TopologyLink) => void;
  onDevicePointerDown?: (device: TopologyDevice, e: React.PointerEvent) => void;
  onDeviceContextMenu?: (device: TopologyDevice, e: React.MouseEvent) => void;
  snapGrid?: boolean;
  gridSize?: number;
  width?: number | string;
  height?: number | string;
  scale?: number;
  translateX?: number;
  translateY?: number;
}

export const SvgTopologyRenderer: React.FC<SvgTopologyRendererProps> = ({
  topology,
  viewDensity = "detail",
  theme = "dark",
  selectedDeviceId = null,
  selectedLinkId = null,
  onDeviceClick,
  onLinkClick,
  onDevicePointerDown,
  onDeviceContextMenu,
  snapGrid = false,
  gridSize = 20,
  width = "100%",
  height = "100%",
  scale = 1,
  translateX = 0,
  translateY = 0,
}) => {
  const isDark = theme === "dark";

  // Device Map für O(1) Link Endpunkt-Zugriff
  const deviceMap = new Map<string, TopologyDevice>();
  for (const d of topology.devices) {
    deviceMap.set(d.id, d);
  }

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-full select-none"
      style={{ touchAction: "none" }}
    >
      {/* SVG Definitionen für Marker (Pfeilspitzen, Muster) */}
      <defs>
        <marker
          id="topo-arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isDark ? "#94A3B8" : "#475569"}
          />
        </marker>
        <pattern
          id="topo-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="20"
            cy="20"
            r="1"
            fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
          />
        </pattern>
      </defs>

      {/* Hintergrund-Raster */}
      <rect width="100%" height="100%" fill="url(#topo-grid)" />

      {/* Skalierbare & verschiebbare Topologie-Ebene */}
      <g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
        {/* 1. Subnetz-Zonen (Hintergrund-Layer) */}
        {topology.subnetZones?.map((zone) => (
          <g key={zone.id} className="subnet-zone">
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              rx="12"
              fill={zone.color}
              fillOpacity={isDark ? 0.08 : 0.06}
              stroke={zone.color}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
            />
            {/* Zonen-Titel Pille */}
            <g transform={`translate(${zone.x + 12}, ${zone.y + 12})`}>
              <rect
                x="0"
                y="0"
                width={Math.max(80, (zone.name.length + zone.cidr.length) * 6.5)}
                height="20"
                rx="4"
                fill={isDark ? "#0F172A" : "#FFFFFF"}
                stroke={zone.color}
                strokeWidth="1"
                opacity="0.9"
              />
              <text
                x="8"
                y="14"
                fill={isDark ? "#F1F5F9" : "#1E293B"}
                fontSize="10"
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {zone.name} <tspan fill={zone.color}>({zone.cidr})</tspan>
              </text>
            </g>
          </g>
        ))}

        {/* 2. Annotationen (Formen, Text, Pfeile, Freihand) */}
        {topology.annotations?.map((ann) => (
          <g key={ann.id} className="topology-annotation">
            {ann.type === "freehand" && ann.points && ann.points.length > 1 && (
              <polyline
                points={ann.points.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={ann.color || "#F59E0B"}
                strokeWidth={ann.strokeWidth || 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {ann.type === "text" && (
              <text
                x={ann.x}
                y={ann.y}
                fill={ann.color || (isDark ? "#F8FAFC" : "#0F172A")}
                fontSize={ann.fontSize || 13}
                fontFamily={ann.fontFamily || "monospace"}
                fontWeight="500"
              >
                {ann.text}
              </text>
            )}
            {ann.type === "note" && (
              <g transform={`translate(${ann.x}, ${ann.y})`}>
                <rect
                  x="0"
                  y="0"
                  width={ann.width || 140}
                  height={ann.height || 48}
                  rx="6"
                  fill={isDark ? "#1E293B" : "#FEF3C7"}
                  stroke={ann.color || "#F59E0B"}
                  strokeWidth="1"
                />
                <text
                  x="8"
                  y="16"
                  fill={isDark ? "#F8FAFC" : "#78350F"}
                  fontSize="11"
                  fontWeight="600"
                >
                  {ann.author ? `${ann.author}:` : "Notiz:"}
                </text>
                <text
                  x="8"
                  y="32"
                  fill={isDark ? "#CBD5E1" : "#92400E"}
                  fontSize="10"
                >
                  {ann.text}
                </text>
              </g>
            )}
            {ann.type === "line" && (
              <line
                x1={ann.x}
                y1={ann.y}
                x2={ann.endX ?? ann.x}
                y2={ann.endY ?? ann.y}
                stroke={ann.color || "#64748B"}
                strokeWidth={ann.strokeWidth || 1.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {ann.type === "arrow" && (
              <line
                x1={ann.x}
                y1={ann.y}
                x2={ann.endX ?? ann.x}
                y2={ann.endY ?? ann.y}
                stroke={ann.color || "#10B981"}
                strokeWidth={ann.strokeWidth || 2}
                markerEnd="url(#topo-arrowhead)"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {ann.type === "box" && (
              <rect
                x={ann.x}
                y={ann.y}
                width={ann.width || 80}
                height={ann.height || 50}
                rx="6"
                fill={ann.fillColor || "transparent"}
                stroke={ann.color || "#64748B"}
                strokeWidth={ann.strokeWidth || 1.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {ann.type === "circle" && (
              <ellipse
                cx={ann.x + (ann.width || 60) / 2}
                cy={ann.y + (ann.height || 60) / 2}
                rx={(ann.width || 60) / 2}
                ry={(ann.height || 60) / 2}
                fill={ann.fillColor || "transparent"}
                stroke={ann.color || "#EC4899"}
                strokeWidth={ann.strokeWidth || 1.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}

        {/* 3. Links (Verbindungen zwischen Geräten) */}
        {topology.links.map((link) => {
          const src = deviceMap.get(link.sourceDeviceId);
          const tgt = deviceMap.get(link.targetDeviceId);
          if (!src || !tgt) return null;

          return (
            <LinkRenderer
              key={link.id}
              link={link}
              sourceDevice={src}
              targetDevice={tgt}
              viewDensity={viewDensity}
              theme={theme}
              selected={selectedLinkId === link.id}
              onLinkClick={onLinkClick}
            />
          );
        })}

        {/* 4. Geräte (Vordergrund-Layer) */}
        {topology.devices.map((device) => {
          const isSelected = selectedDeviceId === device.id;
          const w = device.width || 64;
          const h = device.height || 54;
          const iconSize = 48;

          // Interfaces mit vergebener IP-Adresse herausfiltern
          const ipInterfaces = device.interfaces.filter((i) => i.ip);

          return (
            <g
              key={device.id}
              transform={`translate(${device.x}, ${device.y})`}
              className="topology-device cursor-pointer transition-transform hover:scale-105"
              onPointerDown={(e) => onDevicePointerDown?.(device, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                onDeviceContextMenu?.(device, e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDeviceClick?.(device);
              }}
            >
              {/* Selektions-Halo */}
              {isSelected && (
                <rect
                  x="-8"
                  y="-8"
                  width={w + 16}
                  height={viewDensity === "detail" ? h + 48 : h + 24}
                  rx="10"
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="2.5"
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Handgezeichnetes Cisco Device Icon */}
              <g transform={`translate(${(w - iconSize) / 2}, 0)`}>
                <DeviceIcon
                  type={device.type}
                  size={iconSize}
                  status={device.status}
                />
              </g>

              {/* Gerätename Label */}
              <g transform={`translate(${w / 2}, ${iconSize + 2})`}>
                <rect
                  x={-Math.max(28, (device.name.length * 6.5) / 2 + 4)}
                  y="-2"
                  width={Math.max(56, device.name.length * 6.5 + 8)}
                  height="16"
                  rx="3"
                  fill={isDark ? "#0F172A" : "#FFFFFF"}
                  stroke={isSelected ? "#FACC15" : isDark ? "#334155" : "#E2E8F0"}
                  strokeWidth="1"
                  opacity="0.95"
                />
                <text
                  x="0"
                  y="10"
                  fill={isDark ? "#F8FAFC" : "#0F172A"}
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {device.name}
                </text>
              </g>

              {/* Detail-Modus: IP-Adressen und Schnittstellen-Badge */}
              {viewDensity === "detail" && ipInterfaces.length > 0 && (
                <g transform={`translate(${w / 2}, ${iconSize + 20})`}>
                  {ipInterfaces.slice(0, 2).map((iface, idx) => (
                    <g key={iface.id} transform={`translate(0, ${idx * 13})`}>
                      <rect
                        x="-48"
                        y="-1"
                        width="96"
                        height="12"
                        rx="2.5"
                        fill={isDark ? "#1E293B" : "#F1F5F9"}
                        stroke={isDark ? "#475569" : "#CBD5E1"}
                        strokeWidth="0.8"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="8"
                        fill={isDark ? "#38BDF8" : "#0284C7"}
                        fontSize="7.5"
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {iface.name}: {iface.ip?.split("/")[0]}
                      </text>
                    </g>
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

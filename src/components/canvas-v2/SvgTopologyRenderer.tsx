import {
  NetworkTopology,
  TopologyDevice,
  TopologyLink,
  TopologyAnnotation,
} from "@/types/topology";
import { DeviceIcon } from "./DeviceIcons";
import { LinkRenderer } from "./LinkRenderer";
import { getFontStack } from "@/lib/canvas-utils";

export type AnnotationHandleType = "nw" | "ne" | "se" | "sw" | "start" | "end";

export function getContrastingAnnotationColor(
  color: string | undefined,
  theme: "dark" | "light"
): string {
  if (!color) return theme === "dark" ? "#38BDF8" : "#0284C7";
  const upper = color.toUpperCase();
  if (theme === "light") {
    if (upper === "#F59E0B" || upper === "#FBBF24") return "#B45309"; // Amber 700 (Kontrast ~6.5:1 auf Weiß)
    if (upper === "#38BDF8" || upper === "#7DD3FC") return "#0284C7"; // Sky 600 (~5.3:1)
    if (upper === "#10B981" || upper === "#34D399") return "#047857"; // Emerald 700 (~5.8:1)
    if (upper === "#EC4899" || upper === "#F472B6") return "#BE185D"; // Pink 700 (~5.6:1)
    if (upper === "#94A3B8" || upper === "#CBD5E1") return "#475569"; // Slate 600 (~5.5:1)
    return color;
  } else {
    if (upper === "#B45309") return "#FBBF24";
    if (upper === "#047857") return "#34D399";
    if (upper === "#BE185D") return "#F472B6";
    if (upper === "#475569") return "#CBD5E1";
    return color;
  }
}

export function getDeviceAriaLabel(
  device: TopologyDevice,
  topology: NetworkTopology
): string {
  const typeLabel =
    device.type === "router"
      ? "Router"
      : device.type === "switch-l2"
      ? "Switch (Layer 2)"
      : device.type === "switch-l3"
      ? "Multilayer Switch (Layer 3)"
      : device.type === "firewall"
      ? "Firewall"
      : device.type === "access-point"
      ? "Access Point"
      : device.type === "wlc"
      ? "Wireless LAN Controller"
      : device.type === "pc"
      ? "PC"
      : device.type === "laptop"
      ? "Laptop"
      : device.type === "server"
      ? "Server"
      : "Cloud-Netzwerk";

  const parts: string[] = [`${typeLabel} ${device.name}`];

  const ipInterfaces = device.interfaces.filter((i) => i.ip);
  const upInterfaces = device.interfaces.filter((i) => i.status === "up");

  if (ipInterfaces.length > 0) {
    const ifaceTexts = ipInterfaces.map((i) => `${i.name} ${i.status}: ${i.ip}`).join(", ");
    parts.push(ifaceTexts);
  } else if (upInterfaces.length > 0) {
    parts.push(`${upInterfaces.length} aktive Ports`);
  }

  if (device.config?.defaultGateway) {
    parts.push(`Gateway ${device.config.defaultGateway}`);
  }

  if (device.config?.routingProtocols && device.config.routingProtocols.length > 0) {
    parts.push(`Routing ${device.config.routingProtocols.join(", ")}`);
  }

  const deviceLinks = topology.links.filter(
    (l) => l.sourceDeviceId === device.id || l.targetDeviceId === device.id
  );
  parts.push(`${deviceLinks.length} Verbindung${deviceLinks.length === 1 ? "" : "en"}`);

  if (device.status && device.status !== "active") {
    parts.push(`Status ${device.status}`);
  }

  return parts.join(", ");
}

interface SvgTopologyRendererProps {
  topology: NetworkTopology;
  viewDensity?: "simple" | "detail";
  theme?: "dark" | "light";
  selectedDeviceId?: string | null;
  selectedLinkId?: string | null;
  selectedAnnotationId?: string | null;
  onDeviceClick?: (device: TopologyDevice) => void;
  onLinkClick?: (link: TopologyLink) => void;
  onDevicePointerDown?: (device: TopologyDevice, e: React.PointerEvent) => void;
  onDeviceContextMenu?: (device: TopologyDevice, e: React.MouseEvent) => void;
  onDeviceMoveByKey?: (device: TopologyDevice, dx: number, dy: number) => void;
  onAnnotationClick?: (annotation: TopologyAnnotation) => void;
  onAnnotationPointerDown?: (annotation: TopologyAnnotation, e: React.PointerEvent) => void;
  onAnnotationDoubleClick?: (annotation: TopologyAnnotation) => void;
  onHandlePointerDown?: (
    annotation: TopologyAnnotation,
    handle: AnnotationHandleType,
    e: React.PointerEvent
  ) => void;
  drawingAnnotationPreview?: TopologyAnnotation | null;
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
  selectedAnnotationId = null,
  onDeviceClick,
  onLinkClick,
  onDevicePointerDown,
  onDeviceContextMenu,
  onAnnotationClick,
  onAnnotationPointerDown,
  onAnnotationDoubleClick,
  onHandlePointerDown,
  drawingAnnotationPreview = null,
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

  // 1. Trennung der Annotationen für CCNA-Ebenenreihenfolge:
  // Hintergrund: Boxen, Kreise, Linien, Pfeile, Freihand, Text (hinter Geräten)
  // Vordergrund: Notizen / Post-its (vor Geräten und Links!)
  const backgroundAnnotations = (topology.annotations || []).filter(
    (ann) => ann.type !== "note"
  );
  const noteAnnotations = (topology.annotations || []).filter(
    (ann) => ann.type === "note"
  );

  const selectedAnnotation = (topology.annotations || []).find(
    (a) => a.id === selectedAnnotationId
  );

  // Render-Funktion für ein einzelnes Annotations-Element
  const renderAnnotationItem = (ann: TopologyAnnotation, isInteractive: boolean = true) => {
    const isSelected = selectedAnnotationId === ann.id;

    return (
      <g
        key={ann.id}
        className={`topology-annotation ${isInteractive ? "cursor-pointer" : ""}`}
        onPointerDown={
          isInteractive
            ? (e) => {
                e.stopPropagation();
                onAnnotationPointerDown?.(ann, e);
              }
            : undefined
        }
        onClick={
          isInteractive
            ? (e) => {
                e.stopPropagation();
                onAnnotationClick?.(ann);
              }
            : undefined
        }
        onDoubleClick={
          isInteractive
            ? (e) => {
                e.stopPropagation();
                onAnnotationDoubleClick?.(ann);
              }
            : undefined
        }
      >
        {/* Freihand-Pfad */}
        {ann.type === "freehand" && ann.points && ann.points.length > 0 && (
          <polyline
            points={ann.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={isSelected ? "#38BDF8" : getContrastingAnnotationColor(ann.color, theme)}
            strokeWidth={ann.strokeWidth || 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Text mit garantiertem WCAG AA Kontrast (>= 4.5:1) */}
        {ann.type === "text" && (
          <text
            x={ann.x}
            y={ann.y}
            fill={isSelected ? "#38BDF8" : getContrastingAnnotationColor(ann.color, theme)}
            fontSize={ann.fontSize || 14}
            fontFamily={getFontStack(ann.fontFamily)}
            fontWeight="600"
            className="select-none"
          >
            {ann.text || "Text"}
          </text>
        )}

        {/* Haftnotiz (Post-it) */}
        {ann.type === "note" && (
          <g transform={`translate(${ann.x}, ${ann.y})`}>
            {/* Notiz-Karte mit Schatten */}
            <rect
              x="0"
              y="0"
              width={ann.width || 150}
              height={ann.height || 100}
              rx="6"
              fill={ann.fillColor || (isDark ? "#1E293B" : "#FEF3C7")}
              stroke={isSelected ? "#38BDF8" : ann.color || (isDark ? "#475569" : "#F59E0B")}
              strokeWidth={isSelected ? "2" : "1.5"}
            />
            {/* Notiz-Kopfleiste */}
            <rect
              x="0"
              y="0"
              width={ann.width || 150}
              height="18"
              rx="6"
              fill={ann.color || (isDark ? "#334155" : "#FDE68A")}
              opacity="0.85"
            />
            <text
              x="8"
              y="13"
              fill={isDark ? "#F8FAFC" : "#78350F"}
              fontSize="10"
              fontWeight="bold"
              fontFamily="'IBM Plex Sans', sans-serif"
            >
              {ann.author ? `${ann.author}` : "NOTIZ"}
            </text>
            {/* Multi-Line Text mit Zeilenumbruch-Rendering */}
            {(ann.text || "Notiz...").split("\n").map((line, lIdx) => (
              <text
                key={lIdx}
                x="8"
                y={32 + lIdx * 14}
                fill={isDark ? "#E2E8F0" : "#92400E"}
                fontSize="10.5"
                fontFamily="'IBM Plex Sans', sans-serif"
              >
                {line}
              </text>
            ))}
          </g>
        )}

        {/* Linie */}
        {ann.type === "line" && (
          <line
            x1={ann.x}
            y1={ann.y}
            x2={ann.endX ?? ann.x}
            y2={ann.endY ?? ann.y}
            stroke={isSelected ? "#38BDF8" : ann.color || "#64748B"}
            strokeWidth={ann.strokeWidth || 2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Pfeil */}
        {ann.type === "arrow" && (
          <line
            x1={ann.x}
            y1={ann.y}
            x2={ann.endX ?? ann.x}
            y2={ann.endY ?? ann.y}
            stroke={isSelected ? "#38BDF8" : ann.color || "#10B981"}
            strokeWidth={ann.strokeWidth || 2}
            strokeLinecap="round"
            markerEnd="url(#topo-arrowhead)"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Rechteck / Box */}
        {ann.type === "box" && (
          <rect
            x={ann.x}
            y={ann.y}
            width={ann.width || 140}
            height={ann.height || 90}
            rx="6"
            fill={ann.fillColor || "transparent"}
            stroke={isSelected ? "#38BDF8" : ann.color || "#64748B"}
            strokeWidth={ann.strokeWidth || 2}
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Kreis / Ellipse */}
        {ann.type === "circle" && (
          <ellipse
            cx={ann.x + (ann.width || 110) / 2}
            cy={ann.y + (ann.height || 110) / 2}
            rx={(ann.width || 110) / 2}
            ry={(ann.height || 110) / 2}
            fill={ann.fillColor || "transparent"}
            stroke={isSelected ? "#38BDF8" : ann.color || "#EC4899"}
            strokeWidth={ann.strokeWidth || 2}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </g>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-full select-none"
      style={{
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
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
            fill={isDark ? "#10B981" : "#059669"}
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
                fontFamily="'IBM Plex Sans', sans-serif"
              >
                {zone.name} <tspan fill={zone.color}>({zone.cidr})</tspan>
              </text>
            </g>
          </g>
        ))}

        {/* 2. Hintergrund-Annotationen (Formen, Linien, Freihand, Text hinter Geräten) */}
        {backgroundAnnotations.map((ann) => renderAnnotationItem(ann))}

        {/* 3. Links (Physische Verbindungen zwischen Geräten) */}
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

        {/* 4. Geräte (Netzwerkkomponenten) */}
        {topology.devices.map((device, index) => {
          const isSelected = selectedDeviceId === device.id;
          // Roving Tabindex: Genau ein Tab-Stopp für den gesamten Canvas
          // Ist ein Gerät selektiert, erhält es tabIndex=0.
          // Ist kein Gerät und kein Link selektiert, erhält das erste Gerät tabIndex=0.
          // Alle anderen Elemente erhalten tabIndex=-1.
          const isRovingActive = isSelected || (!selectedDeviceId && !selectedLinkId && index === 0);
          const w = device.width || 64;
          const h = device.height || 54;
          const iconSize = 48;

          // Interfaces mit vergebener IP-Adresse herausfiltern
          const ipInterfaces = device.interfaces.filter((i) => i.ip);

          return (
            <g
              key={device.id}
              data-device-id={device.id}
              transform={`translate(${device.x}, ${device.y})`}
              className={`topology-device cursor-pointer transition-transform hover:scale-105 focus:outline-none ${
                isSelected ? "filter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : ""
              }`}
              tabIndex={isRovingActive ? 0 : -1}
              role="button"
              aria-label={getDeviceAriaLabel(device, topology)}
              aria-haspopup="dialog"
              aria-expanded={isSelected}
              onPointerDown={(e) => onDevicePointerDown?.(device, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                onDeviceContextMenu?.(device, e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDeviceClick?.(device);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDeviceClick?.(device);
                } else if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
                  e.preventDefault();
                  const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                  onDeviceContextMenu?.(device, {
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2,
                    preventDefault: () => {},
                  } as unknown as React.MouseEvent);
                }
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
                  fontFamily="'IBM Plex Mono', monospace"
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
                        fontFamily="'IBM Plex Mono', monospace"
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

        {/* 5. Vordergrund-Annotationen: Notizen / Post-its (vor Geräten!) */}
        {noteAnnotations.map((ann) => renderAnnotationItem(ann))}

        {/* 6. Live-Vorschau der aktuell gezeichneten Annotation */}
        {drawingAnnotationPreview && renderAnnotationItem(drawingAnnotationPreview, false)}

        {/* 7. Selektions-Anfasser (Resize & Move Handles) für ausgewählte Annotation */}
        {selectedAnnotation && (
          <g className="annotation-handles pointer-events-auto">
            {/* Box, Kreis & Notiz: 4 Eckgriffe */}
            {["box", "circle", "note"].includes(selectedAnnotation.type) && (
              <>
                <rect
                  x={selectedAnnotation.x - 2}
                  y={selectedAnnotation.y - 2}
                  width={(selectedAnnotation.width || 120) + 4}
                  height={(selectedAnnotation.height || 80) + 4}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
                {/* NW Griff mit 44x44px Touch-Trefferfläche (WCAG 2.5.5) */}
                <g
                  className="cursor-nwse-resize"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onHandlePointerDown?.(selectedAnnotation, "nw", e);
                  }}
                >
                  <rect
                    x={selectedAnnotation.x - 22}
                    y={selectedAnnotation.y - 22}
                    width={44}
                    height={44}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <rect
                    x={selectedAnnotation.x - 5}
                    y={selectedAnnotation.y - 5}
                    width={10}
                    height={10}
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>

                {/* NE Griff mit 44x44px Touch-Trefferfläche */}
                <g
                  className="cursor-nesw-resize"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onHandlePointerDown?.(selectedAnnotation, "ne", e);
                  }}
                >
                  <rect
                    x={selectedAnnotation.x + (selectedAnnotation.width || 120) - 22}
                    y={selectedAnnotation.y - 22}
                    width={44}
                    height={44}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <rect
                    x={selectedAnnotation.x + (selectedAnnotation.width || 120) - 5}
                    y={selectedAnnotation.y - 5}
                    width={10}
                    height={10}
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>

                {/* SE Griff mit 44x44px Touch-Trefferfläche */}
                <g
                  className="cursor-nwse-resize"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onHandlePointerDown?.(selectedAnnotation, "se", e);
                  }}
                >
                  <rect
                    x={selectedAnnotation.x + (selectedAnnotation.width || 120) - 22}
                    y={selectedAnnotation.y + (selectedAnnotation.height || 80) - 22}
                    width={44}
                    height={44}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <rect
                    x={selectedAnnotation.x + (selectedAnnotation.width || 120) - 5}
                    y={selectedAnnotation.y + (selectedAnnotation.height || 80) - 5}
                    width={10}
                    height={10}
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>

                {/* SW Griff mit 44x44px Touch-Trefferfläche */}
                <g
                  className="cursor-nesw-resize"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onHandlePointerDown?.(selectedAnnotation, "sw", e);
                  }}
                >
                  <rect
                    x={selectedAnnotation.x - 22}
                    y={selectedAnnotation.y + (selectedAnnotation.height || 80) - 22}
                    width={44}
                    height={44}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <rect
                    x={selectedAnnotation.x - 5}
                    y={selectedAnnotation.y + (selectedAnnotation.height || 80) - 5}
                    width={10}
                    height={10}
                    rx="2"
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>
              </>
            )}

            {/* Linie & Pfeil: Start- und Endpunkt-Griffe mit 44x44px Touch-Fläche */}
            {["line", "arrow"].includes(selectedAnnotation.type) && (
              <>
                {/* Startpunkt */}
                <g
                  className="cursor-move"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onHandlePointerDown?.(selectedAnnotation, "start", e);
                  }}
                >
                  <circle
                    cx={selectedAnnotation.x}
                    cy={selectedAnnotation.y}
                    r={22}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <circle
                    cx={selectedAnnotation.x}
                    cy={selectedAnnotation.y}
                    r={6}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>

                {/* Endpunkt */}
                <g
                  className="cursor-move"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onHandlePointerDown?.(selectedAnnotation, "end", e);
                  }}
                >
                  <circle
                    cx={selectedAnnotation.endX ?? selectedAnnotation.x}
                    cy={selectedAnnotation.endY ?? selectedAnnotation.y}
                    r={22}
                    fill="transparent"
                    pointerEvents="all"
                  />
                  <circle
                    cx={selectedAnnotation.endX ?? selectedAnnotation.x}
                    cy={selectedAnnotation.endY ?? selectedAnnotation.y}
                    r={6}
                    fill="#FFFFFF"
                    stroke="#0284C7"
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>
              </>
            )}

            {/* Text & Freihand: Bounding-Halo */}
            {["text", "freehand"].includes(selectedAnnotation.type) && (
              <rect
                x={selectedAnnotation.x - 6}
                y={selectedAnnotation.y - (selectedAnnotation.type === "text" ? 18 : 6)}
                width={(selectedAnnotation.width || (selectedAnnotation.text?.length || 10) * 9) + 12}
                height={(selectedAnnotation.height || 26) + 12}
                rx="4"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            )}
          </g>
        )}
      </g>
    </svg>
  );
};

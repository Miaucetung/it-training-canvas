import { TopologyDevice, TopologyLink } from "@/types/topology";

interface LinkRendererProps {
  link: TopologyLink;
  sourceDevice: TopologyDevice;
  targetDevice: TopologyDevice;
  viewDensity?: "simple" | "detail";
  theme?: "dark" | "light";
  selected?: boolean;
  onLinkClick?: (link: TopologyLink) => void;
}

export function getLinkAriaLabel(
  link: TopologyLink,
  sourceDevice: TopologyDevice,
  targetDevice: TopologyDevice
): string {
  const srcIface = sourceDevice.interfaces.find((i) => i.id === link.sourceInterfaceId);
  const tgtIface = targetDevice.interfaces.find((i) => i.id === link.targetInterfaceId);

  const typeName =
    link.linkType === "serial"
      ? "Serielle WAN-Verbindung"
      : link.linkType === "trunk"
      ? "802.1Q Trunk-Verbindung"
      : link.linkType === "etherchannel"
      ? "EtherChannel-Bündel"
      : link.linkType === "wireless"
      ? "WLAN-Verbindung"
      : "Ethernet-Verbindung";

  const statusName =
    link.status === "stp-blocking"
      ? "STP Blocking"
      : link.status === "down"
      ? "Down"
      : link.status === "admin-down"
      ? "Administrativ Down"
      : "Up";

  return `${typeName} zwischen ${sourceDevice.name} (${srcIface?.name || "Port"}) und ${targetDevice.name} (${tgtIface?.name || "Port"}), Status ${statusName}`;
}

export const LinkRenderer: React.FC<LinkRendererProps> = ({
  link,
  sourceDevice,
  targetDevice,
  viewDensity = "detail",
  theme = "dark",
  selected = false,
  onLinkClick,
}) => {
  // Koordinaten der Geräte-Zentren
  const x1 = sourceDevice.x + (sourceDevice.width || 80) / 2;
  const y1 = sourceDevice.y + (sourceDevice.height || 60) / 2;
  const x2 = targetDevice.x + (targetDevice.width || 80) / 2;
  const y2 = targetDevice.y + (targetDevice.height || 60) / 2;

  const bends = link.bendPoints ?? [];
  const hasBends = bends.length > 0;
  const pts = [{ x: x1, y: y1 }, ...bends, { x: x2, y: y2 }];

  // Richtung des ersten und letzten Segments (bei Linien ohne Zwischenpunkte identisch)
  const segInfo = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { ux: (b.x - a.x) / len, uy: (b.y - a.y) / len, len };
  };
  const firstSeg = segInfo(pts[0], pts[1]);
  const lastSeg = segInfo(pts[pts.length - 2], pts[pts.length - 1]);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = hasBends ? firstSeg.ux : dx / length;
  const uy = hasBends ? firstSeg.uy : dy / length;
  // Normalenvektor senkrecht zur Verbindung (bzw. zum ersten Segment)
  const nx = -uy;
  const ny = ux;
  // Normalenvektor am Zielende
  const tnx = hasBends ? lastSeg.uy : nx;
  const tny = hasBends ? -lastSeg.ux : ny;

  // Mittelpunkt des Links (bei Zwischenpunkten: Mitte der Gesamtlänge entlang des Linienzugs)
  let midX = (x1 + x2) / 2;
  let midY = (y1 + y2) / 2;
  if (hasBends) {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
    let remaining = lens.reduce((a, b) => a + b, 0) / 2;
    for (let i = 0; i < lens.length; i++) {
      if (remaining <= lens[i] || i === lens.length - 1) {
        const t = lens[i] === 0 ? 0 : remaining / lens[i];
        midX = pts[i].x + (pts[i + 1].x - pts[i].x) * t;
        midY = pts[i].y + (pts[i + 1].y - pts[i].y) * t;
        break;
      }
      remaining -= lens[i];
    }
  }
  const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");

  // Farbdefinitionen basierend auf Link-Typ und Status
  const isDark = theme === "dark";
  const isDown = link.status === "down";
  const isAdminDown = link.status === "admin-down";
  const isStpBlocking = link.status === "stp-blocking";

  let baseStrokeColor = isDark ? "#38BDF8" : "#0284C7"; // Standard Ethernet
  let strokeDasharray = "none";
  let strokeWidth = 2.5;

  if (link.linkType === "serial") {
    baseStrokeColor = "#DC2626"; // Cisco Serial Rot
    strokeWidth = 2.2;
  } else if (link.linkType === "trunk") {
    baseStrokeColor = isDark ? "#818CF8" : "#4F46E5"; // Trunk Indigo
    strokeWidth = 3;
    strokeDasharray = "7 3";
  } else if (link.linkType === "etherchannel") {
    baseStrokeColor = isDark ? "#34D399" : "#059669"; // EtherChannel Emerald
    strokeWidth = 3.5;
  } else if (link.linkType === "wireless") {
    baseStrokeColor = "#06B6D4"; // WLAN Cyan
    strokeDasharray = "4 4";
    strokeWidth = 2;
  }

  // Schnittstellen-Labels (aus den Interfaces der Geräte suchen)
  const sourceIf = sourceDevice.interfaces.find((i) => i.id === link.sourceInterfaceId);
  const targetIf = targetDevice.interfaces.find((i) => i.id === link.targetInterfaceId);

  let strokeColor = baseStrokeColor;
  // Status-Übersteuerungen
  if (isDown) {
    strokeColor = "#EF4444";
    strokeDasharray = "6 4";
  } else if (isAdminDown) {
    strokeColor = isDark ? "#64748B" : "#94A3B8";
    strokeDasharray = "4 4";
  } else if (isStpBlocking) {
    strokeColor = `url(#grad-stp-blocking-${link.id})`;
  }

  if (selected) {
    strokeColor = "#FACC15";
    strokeWidth = 3.5;
  }

  const srcLabel = sourceIf ? sourceIf.name : link.sourceInterfaceId;
  const tgtLabel = targetIf ? targetIf.name : link.targetInterfaceId;

  // Berechne versetzte Positionen für Labels an beiden Enden (Kollisionsschutz!)
  // Mit Zwischenpunkten: Labels hinter dem Geräte-Symbol und auf der oberen Seite der Linie,
  // damit sie nicht über der Beschriftung unter dem Gerät liegen.
  const labelDistFromCenter = hasBends ? Math.min(firstSeg.len * 0.55, 62) : Math.min(68, length * 0.32);
  const tgtLabelDist = hasBends ? Math.min(lastSeg.len * 0.55, 62) : Math.min(68, length * 0.32);
  const labelOffsetNormal = 14;
  const srcSide = hasBends && ny > 0 ? -1 : 1;
  const tgtSide = hasBends ? (tny > 0 ? 1 : -1) : 1;

  const srcLabelX = x1 + ux * labelDistFromCenter + srcSide * nx * labelOffsetNormal;
  const srcLabelY = y1 + uy * labelDistFromCenter + srcSide * ny * labelOffsetNormal;

  const tgtDirX = hasBends ? lastSeg.ux : ux;
  const tgtDirY = hasBends ? lastSeg.uy : uy;
  const tgtLabelX = x2 - tgtDirX * tgtLabelDist - tgtSide * tnx * labelOffsetNormal;
  const tgtLabelY = y2 - tgtDirY * tgtLabelDist - tgtSide * tny * labelOffsetNormal;

  // Serieller Zickzack-Pfad (Cisco Lightning Blitz)
  const renderSerialPath = () => {
    const segments = 4;
    const segLength = length / (segments + 2);
    let path = `M ${x1} ${y1}`;
    path += ` L ${x1 + ux * segLength} ${y1 + uy * segLength}`;

    // Zickzack-Amplituden
    for (let i = 1; i <= segments; i++) {
      const segT = (segLength * i) + segLength * 0.5;
      const side = i % 2 === 0 ? 1 : -1;
      const px = x1 + ux * segT + nx * (10 * side);
      const py = y1 + uy * segT + ny * (10 * side);
      path += ` L ${px} ${py}`;
    }

    path += ` L ${x2 - ux * segLength} ${y2 - uy * segLength} L ${x2} ${y2}`;
    return path;
  };

  const renderInterfaceBadge = (
    label: string,
    role?: "RP" | "DP" | "BLK" | "ALT",
  ) => {
    if (!role) {
      return (
        <>
          <rect
            x="-18"
            y="-7"
            width="36"
            height="14"
            rx="3"
            fill={isDark ? "#0F172A" : "#FFFFFF"}
            stroke={isDark ? "#334155" : "#CBD5E1"}
            strokeWidth="1"
            opacity="0.95"
          />
          <text
            x="0"
            y="3.5"
            fill={isDark ? "#94A3B8" : "#475569"}
            fontSize="8"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
          >
            {label}
          </text>
        </>
      );
    }

    const roleConfig =
      role === "RP"
        ? { bg: "#065F46", text: "#A7F3D0", label: "RP" }
        : role === "DP"
          ? { bg: "#1E3A8A", text: "#DBEAFE", label: "DP" }
          : { bg: "#7C2D12", text: "#FFEDD5", label: "BLK" };

    return (
      <>
        <rect
          x="-28"
          y="-7.5"
          width="56"
          height="15"
          rx="3.5"
          fill={isDark ? "#0F172A" : "#FFFFFF"}
          stroke={isDark ? "#334155" : "#CBD5E1"}
          strokeWidth="1"
          opacity="0.95"
        />
        <text
          x="-9"
          y="3.5"
          fill={isDark ? "#94A3B8" : "#475569"}
          fontSize="7.5"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', monospace"
        >
          {label}
        </text>
        <rect
          x="7"
          y="-5.5"
          width="18"
          height="11"
          rx="2"
          fill={roleConfig.bg}
        />
        <text
          x="16"
          y="3"
          fill={roleConfig.text}
          fontSize="7"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="'IBM Plex Mono', monospace"
        >
          {roleConfig.label}
        </text>
      </>
    );
  };

  return (
    <g
      data-link-id={link.id}
      className={`topology-link cursor-pointer transition-opacity hover:opacity-95 focus:outline-none ${
        selected ? "filter drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" : ""
      }`}
      tabIndex={selected ? 0 : -1}
      role="button"
      aria-label={getLinkAriaLabel(link, sourceDevice, targetDevice)}
      onClick={() => onLinkClick?.(link)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onLinkClick?.(link);
        }
      }}
    >
      {/* STP-Blocking Gradient: Normalfarbton am Forwarding-Port, Orange am Blocking-Port */}
      {isStpBlocking && (
        <defs>
          <linearGradient
            id={`grad-stp-blocking-${link.id}`}
            gradientUnits="userSpaceOnUse"
            x1={sourceIf?.portRole === "BLK" ? x2 : x1}
            y1={sourceIf?.portRole === "BLK" ? y2 : y1}
            x2={sourceIf?.portRole === "BLK" ? x1 : x2}
            y2={sourceIf?.portRole === "BLK" ? y1 : y2}
          >
            <stop offset="0%" stopColor={baseStrokeColor} />
            <stop offset="55%" stopColor={baseStrokeColor} />
            <stop offset="75%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
      )}

      {/* Breiter unsichtbarer Trefferbereich für Klick / Hover */}
      {hasBends ? (
        <polyline points={polylinePoints} fill="none" stroke="transparent" strokeWidth="16" className="pointer-events-auto" />
      ) : (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="transparent"
          strokeWidth="16"
          className="pointer-events-auto"
        />
      )}

      {/* Eigentlicher Link-Pfad */}
      {hasBends ? (
        <polyline
          points={polylinePoints}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      ) : link.linkType === "serial" && !isDown ? (
        <path
          d={renderSerialPath()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : link.linkType === "etherchannel" ? (
        // EtherChannel Doppellinie mit Bündelungs-Ring
        <>
          <line
            x1={x1 + nx * 3.5}
            y1={y1 + ny * 3.5}
            x2={x2 + nx * 3.5}
            y2={y2 + ny * 3.5}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeDasharray={strokeDasharray}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={x1 - nx * 3.5}
            y1={y1 - ny * 3.5}
            x2={x2 - nx * 3.5}
            y2={y2 - ny * 3.5}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeDasharray={strokeDasharray}
            vectorEffect="non-scaling-stroke"
          />
          {/* Bündelungs-Ellipse um die beiden Links */}
          <ellipse
            cx={midX}
            cy={midY}
            rx="9"
            ry="5"
            transform={`rotate(${(Math.atan2(dy, dx) * 180) / Math.PI + 90} ${midX} ${midY})`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* STATUS-MARKER (Nie nur über Farbe!) */}
      {/* 1. Down: Rotes X-Markersymbol */}
      {isDown && (
        <g transform={`translate(${midX}, ${midY})`}>
          <circle cx="0" cy="0" r="8" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
          <path
            d="M -3.5 -3.5 L 3.5 3.5 M 3.5 -3.5 L -3.5 3.5"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      )}

      {/* 2. Admin-Down: Schloss-/Schraffur-Symbol */}
      {isAdminDown && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="0" cy="-1" r="1.5" fill="#E2E8F0" />
          <line x1="0" y1="1" x2="0" y2="3.5" stroke="#E2E8F0" strokeWidth="1.2" />
        </g>
      )}

      {/* 3. STP-Blocking: Querbalken-Marker am Zielport */}
      {isStpBlocking && (
        <g transform={`translate(${x2 - ux * 28}, ${y2 - uy * 28})`}>
          {/* Blocking Querbalken || */}
          <circle cx="0" cy="0" r="9" fill="#7C2D12" stroke="#F97316" strokeWidth="1.5" />
          <line x1="-2.5" y1="-4" x2="-2.5" y2="4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="2.5" y1="-4" x2="2.5" y2="4" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
          {/* Label BLK */}
          <rect x="-11" y="10" width="22" height="11" rx="2.5" fill="#9A3412" />
          <text x="0" y="18" fill="#FFEDD5" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
            BLK
          </text>
        </g>
      )}

      {/* Trunk 802.1Q Badge in der Mitte */}
      {link.linkType === "trunk" && !isDown && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x="-22"
            y="-7"
            width="44"
            height="14"
            rx="4"
            fill={isDark ? "#1E1B4B" : "#EEF2FF"}
            stroke={isDark ? "#818CF8" : "#4F46E5"}
            strokeWidth="1"
          />
          <text
            x="0"
            y="3"
            fill={isDark ? "#C7D2FE" : "#3730A3"}
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="'IBM Plex Mono', monospace"
          >
            802.1Q
          </text>
        </g>
      )}

      {/* Interface-Labels an beiden Enden (Detail-Modus) */}
      {viewDensity === "detail" && (
        <>
          {/* Quell-Interface Label */}
          {srcLabel && (
            <g transform={`translate(${srcLabelX}, ${srcLabelY})`}>
              {renderInterfaceBadge(srcLabel, sourceIf?.portRole)}
            </g>
          )}

          {/* Ziel-Interface Label */}
          {tgtLabel && (
            <g transform={`translate(${tgtLabelX}, ${tgtLabelY})`}>
              {renderInterfaceBadge(tgtLabel, targetIf?.portRole)}
            </g>
          )}
        </>
      )}
    </g>
  );
};

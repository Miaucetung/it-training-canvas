import {
  CONNECTION_COLORS,
  ConnectionType,
  ShapeConnection,
} from "@/lib/shape-properties";
import { DrawingObject, Point } from "@/lib/types";

// Connection Port Positions (relative to shape center)
export const CONNECTION_PORTS = {
  top: { x: 0.5, y: 0 },
  right: { x: 1, y: 0.5 },
  bottom: { x: 0.5, y: 1 },
  left: { x: 0, y: 0.5 },
  center: { x: 0.5, y: 0.5 },
  default: { x: 0.5, y: 0.5 },
};

export type PortPosition = keyof typeof CONNECTION_PORTS;

// Calculate absolute position of a connection port
export function getPortPosition(
  shape: DrawingObject,
  port: PortPosition,
): Point {
  if (!shape.startPoint || !shape.shapeWidth || !shape.shapeHeight) {
    return { x: 0, y: 0 };
  }

  const portOffset = CONNECTION_PORTS[port] || CONNECTION_PORTS.center;
  return {
    x: shape.startPoint.x + shape.shapeWidth * portOffset.x,
    y: shape.startPoint.y + shape.shapeHeight * portOffset.y,
  };
}

// Find nearest port to a point
export function findNearestPort(
  shape: DrawingObject,
  point: Point,
  threshold: number = 30,
): PortPosition | null {
  if (!shape.startPoint || !shape.shapeWidth || !shape.shapeHeight) {
    return null;
  }

  let nearestPort: PortPosition | null = null;
  let minDistance = threshold;

  for (const portName of Object.keys(CONNECTION_PORTS) as PortPosition[]) {
    const portPos = getPortPosition(shape, portName);
    const distance = Math.hypot(point.x - portPos.x, point.y - portPos.y);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPort = portName;
    }
  }

  return nearestPort;
}

// Draw connection ports on a shape
export function drawConnectionPorts(
  ctx: CanvasRenderingContext2D,
  shape: DrawingObject,
  hoveredPort: PortPosition | null = null,
  theme: "light" | "dark" = "dark",
) {
  if (!shape.startPoint || !shape.shapeWidth || !shape.shapeHeight) return;

  const portRadius = 6;
  const ports: PortPosition[] = ["top", "right", "bottom", "left"];

  ports.forEach((port) => {
    const pos = getPortPosition(shape, port);
    const isHovered = port === hoveredPort;

    // Port background
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, portRadius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered
      ? "#3B82F6"
      : theme === "dark"
        ? "#334155"
        : "#E2E8F0";
    ctx.fill();
    ctx.strokeStyle = isHovered
      ? "#60A5FA"
      : theme === "dark"
        ? "#64748B"
        : "#94A3B8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Port inner dot
    if (isHovered) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
  });
}

// Draw a connection line between two shapes
export function drawConnection(
  ctx: CanvasRenderingContext2D,
  connection: ShapeConnection,
  shapes: Map<string, DrawingObject>,
  animated: boolean = false,
  animationOffset: number = 0,
) {
  const sourceShape = shapes.get(connection.sourceShapeId);
  const targetShape = shapes.get(connection.targetShapeId);

  if (!sourceShape || !targetShape) return;

  const sourcePos = getPortPosition(
    sourceShape,
    connection.sourcePort as PortPosition,
  );
  const targetPos = getPortPosition(
    targetShape,
    connection.targetPort as PortPosition,
  );

  // Calculate control points for curved connection
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const distance = Math.hypot(dx, dy);
  const curvature = Math.min(distance * 0.3, 100);

  let cp1: Point, cp2: Point;

  // Adjust control points based on port positions
  switch (connection.sourcePort) {
    case "top":
      cp1 = { x: sourcePos.x, y: sourcePos.y - curvature };
      break;
    case "bottom":
      cp1 = { x: sourcePos.x, y: sourcePos.y + curvature };
      break;
    case "left":
      cp1 = { x: sourcePos.x - curvature, y: sourcePos.y };
      break;
    case "right":
    default:
      cp1 = { x: sourcePos.x + curvature, y: sourcePos.y };
      break;
  }

  switch (connection.targetPort) {
    case "top":
      cp2 = { x: targetPos.x, y: targetPos.y - curvature };
      break;
    case "bottom":
      cp2 = { x: targetPos.x, y: targetPos.y + curvature };
      break;
    case "left":
      cp2 = { x: targetPos.x - curvature, y: targetPos.y };
      break;
    case "right":
    default:
      cp2 = { x: targetPos.x + curvature, y: targetPos.y };
      break;
  }

  // Draw connection line
  ctx.beginPath();
  ctx.moveTo(sourcePos.x, sourcePos.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, targetPos.x, targetPos.y);

  const color =
    connection.color ||
    CONNECTION_COLORS[connection.connectionType] ||
    "#3B82F6";

  const strokeColor =
    connection.status === "error"
      ? "#EF4444"
      : connection.status === "inactive"
        ? "#6B7280"
        : color;

  const isAnimated = animated || connection.animated;

  // — Glow underlayer (solid, wide, low-opacity) —
  ctx.save();
  ctx.setLineDash([]);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = isAnimated ? 6 : 4;
  ctx.globalAlpha = isAnimated ? 0.18 : 0.12;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = isAnimated ? 18 : 10;
  ctx.stroke();
  ctx.restore();

  // — Main line —
  ctx.beginPath();
  ctx.moveTo(sourcePos.x, sourcePos.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, targetPos.x, targetPos.y);
  if (isAnimated) {
    ctx.setLineDash([8, 4]);
    ctx.lineDashOffset = -animationOffset;
  } else {
    ctx.setLineDash([]);
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = isAnimated ? 8 : 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Reset dash
  ctx.setLineDash([]);

  // Draw arrow at target
  drawArrowHead(ctx, cp2, targetPos, strokeColor);

  // Draw bidirectional arrow if needed
  if (connection.bidirectional) {
    drawArrowHead(ctx, cp1, sourcePos, strokeColor);
  }

  // Draw label if present
  if (connection.label) {
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2 + (connection.labelOffsetY ?? 0);

    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Pill background with color border
    const tw = ctx.measureText(connection.label).width;
    const pH = 15;
    const pW = tw + 14;
    const px = midX - pW / 2;
    const py = midY - pH / 2;

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(10, 17, 35, 0.88)";
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void })
      .roundRect(px, py, pW, pH, 4);
    ctx.fill();

    // Color-tinted border
    ctx.strokeStyle = strokeColor + "66";
    ctx.lineWidth = 1;
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: (...a: unknown[]) => void })
      .roundRect(px, py, pW, pH, 4);
    ctx.stroke();

    ctx.fillStyle = "#CBD5E1";
    ctx.fillText(connection.label, midX, midY);
  }
}

// Draw arrow head
function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  fromPoint: Point,
  toPoint: Point,
  color: string,
) {
  const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
  const arrowLength = 10;
  const arrowWidth = 6;

  ctx.beginPath();
  ctx.moveTo(toPoint.x, toPoint.y);
  ctx.lineTo(
    toPoint.x - arrowLength * Math.cos(angle - Math.PI / 6),
    toPoint.y - arrowLength * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    toPoint.x - arrowLength * Math.cos(angle + Math.PI / 6),
    toPoint.y - arrowLength * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// Generate unique connection ID
export function generateConnectionId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new connection
export function createConnection(
  sourceShapeId: string,
  sourcePort: PortPosition,
  targetShapeId: string,
  targetPort: PortPosition,
  connectionType: ConnectionType = "ethernet",
): ShapeConnection {
  return {
    id: generateConnectionId(),
    sourceShapeId,
    sourcePort,
    targetShapeId,
    targetPort,
    connectionType,
    status: "active",
    animated: false,
    bidirectional: false,
  };
}

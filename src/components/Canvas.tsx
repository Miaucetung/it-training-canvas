import {
  drawConnectionPoints,
  drawObject,
  generateId,
  getShapeBounds,
  isPointInBounds,
  preloadShapes,
  setImageLoadCallback,
} from "@/lib/canvas-utils";
import {
  createConnection,
  drawConnection,
  drawConnectionPorts,
  findNearestPort,
  getPortPosition,
  PortPosition,
} from "@/lib/connection-utils";
import { getConnectionCompatibility } from "@/lib/connection-compatibility";
import { ShapeConnection } from "@/lib/shape-properties";
import { IT_SHAPES } from "@/lib/shapes";
import {
  CanvasConnection,
  DrawingObject,
  FontFamily,
  Point,
  ShapeDefinition,
  Tool,
} from "@/lib/types";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { PacketData } from "@/components/SimulationControls";

interface CanvasProps {
  objects: DrawingObject[];
  onObjectsChange: (objects: DrawingObject[]) => void;
  onSelectionChange?: (selectedObjects: DrawingObject[]) => void;
  connections: CanvasConnection[];
  onConnectionsChange: (connections: CanvasConnection[]) => void;
  onConnectionSelect?: (connection: CanvasConnection | null) => void;
  onContextMenu?: (e: React.MouseEvent, objects: DrawingObject[]) => void;
  simulationPackets?: PacketData[];
  tool: Tool;
  color: string;
  penWidth: number;
  fontSize: number;
  fontFamily: FontFamily;
  theme: "light" | "dark";
  showGrid: boolean;
  gridSize: number;
  gridPattern: "lines" | "dots" | "dashed";
  gridColor?: string;
  gridAccentColor?: string;
  gridOpacity?: number;
  selectedShape?: ShapeDefinition | null;
  /** When false, hides per-connection labels (Simple/clean mode). */
  showConnectionLabels?: boolean;
  onViewportChange?: (viewport: {
    x: number;
    y: number;
    zoom: number;
    width: number;
    height: number;
  }) => void;
}

interface TextInputState {
  worldPosition: Point; // For saving the text object
  screenPosition: Point; // For positioning the textarea (clientX/clientY)
  value: string;
  isEditing: boolean;
}

function CanvasInner({
  objects,
  onObjectsChange,
  onSelectionChange,
  connections,
  onConnectionsChange,
  onConnectionSelect,
  onContextMenu,
  simulationPackets = [],
  tool,
  color,
  penWidth,
  fontSize,
  fontFamily,
  theme,
  showGrid,
  gridSize,
  gridPattern,
  gridColor,
  gridAccentColor,
  gridOpacity = 1,
  selectedShape,
  showConnectionLabels = true,
  onViewportChange,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentObject, setCurrentObject] = useState<DrawingObject | null>(
    null,
  );
  const [selectedObjectIds, setSelectedObjectIds] = useState<Set<string>>(
    new Set(),
  );
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState<TextInputState | null>(null);
  const [textValue, setTextValue] = useState("");

  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);

  // Resize state (drag a selection corner-handle)
  type ResizeHandle = "tl" | "tr" | "bl" | "br";
  const [resizeState, setResizeState] = useState<{
    objectId: string;
    handle: ResizeHandle;
    fixedCorner: Point; // world-coords corner that stays put
  } | null>(null);
  const [hoverHandle, setHoverHandle] = useState<ResizeHandle | null>(null);

  // Cursor preview for shapes
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);

  // NEW: Hover state for highlighting
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  // NEW: Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<DrawingObject[]>([]);

  // NEW: Shapes preloaded flag
  const [shapesPreloaded, setShapesPreloaded] = useState(false);

  // NEW: Connection state
  const [connectionStart, setConnectionStart] = useState<{
    shapeId: string;
    port: PortPosition;
    position: Point;
  } | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{
    shapeId: string;
    port: PortPosition;
  } | null>(null);

  // Preload shapes on mount
  useEffect(() => {
    if (!shapesPreloaded) {
      preloadShapes(IT_SHAPES).then(() => setShapesPreloaded(true));
    }
  }, [shapesPreloaded]);

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedObjects = objects.filter((obj) =>
        selectedObjectIds.has(obj.id),
      );
      onSelectionChange(selectedObjects);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObjectIds, objects]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redraw();
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Redraw when dependencies change
  useEffect(() => {
    redraw();
  }, [
    objects,
    connections,
    simulationPackets,
    theme,
    showGrid,
    gridSize,
    gridPattern,
    gridColor,
    gridAccentColor,
    gridOpacity,
    scale,
    offset,
    currentObject,
    cursorPosition,
    selectedShape,
    tool,
    hoveredObjectId,
    showConnectionLabels,
  ]);

  // Report viewport changes to parent
  useEffect(() => {
    if (onViewportChange && canvasRef.current) {
      onViewportChange({
        x: -offset.x / scale,
        y: -offset.y / scale,
        zoom: scale,
        width: canvasRef.current.width / scale,
        height: canvasRef.current.height / scale,
      });
    }
  }, [scale, offset, onViewportChange]);

  // Focus text input when it appears
  useEffect(() => {
    if (textInput && textInputRef.current) {
      // Use setTimeout to ensure the element is mounted
      const timer = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.setSelectionRange(
            0,
            textInputRef.current.value.length,
          );
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [textInput]);

  // Keyboard handlers for copy/paste, delete, rotate, group
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process if text input is active
      if (textInput) return;

      const selectedObjects = objects.filter((obj) =>
        selectedObjectIds.has(obj.id),
      );

      // Copy (Ctrl+C)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "c" &&
        selectedObjects.length > 0
      ) {
        e.preventDefault();
        setClipboard(selectedObjects.map((obj) => ({ ...obj })));
      }

      // Paste (Ctrl+V)
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && clipboard.length > 0) {
        e.preventDefault();
        const pastedObjects = clipboard.map((obj) => ({
          ...obj,
          id: generateId(),
          startPoint: obj.startPoint
            ? { x: obj.startPoint.x + 20, y: obj.startPoint.y + 20 }
            : undefined,
          endPoint: obj.endPoint
            ? { x: obj.endPoint.x + 20, y: obj.endPoint.y + 20 }
            : undefined,
          points: obj.points?.map((p) => ({ x: p.x + 20, y: p.y + 20 })),
          selected: true,
        }));

        // Deselect old objects, add new ones
        const updatedObjects = objects.map((obj) => ({
          ...obj,
          selected: false,
        }));
        onObjectsChange([...updatedObjects, ...pastedObjects]);
        setSelectedObjectIds(new Set(pastedObjects.map((o) => o.id)));
      }

      // Delete (Delete or Backspace)
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedObjectIds.size > 0
      ) {
        e.preventDefault();
        const newObjects = objects.filter(
          (obj) => !selectedObjectIds.has(obj.id),
        );
        onObjectsChange(newObjects);
        setSelectedObjectIds(new Set());
      }

      // Rotate selected shapes (R key, Shift+R for reverse)
      if (
        e.key === "r" &&
        selectedObjects.length > 0 &&
        selectedObjects.some((o) => o.type === "shape")
      ) {
        e.preventDefault();
        const rotationAmount = e.shiftKey ? -15 : 15;
        const updatedObjects = objects.map((obj) => {
          if (selectedObjectIds.has(obj.id) && obj.type === "shape") {
            return {
              ...obj,
              rotation: ((obj.rotation || 0) + rotationAmount) % 360,
            };
          }
          return obj;
        });
        onObjectsChange(updatedObjects);
      }

      // Toggle shadow (S key)
      if (
        e.key === "s" &&
        selectedObjects.length > 0 &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        const updatedObjects = objects.map((obj) => {
          if (selectedObjectIds.has(obj.id)) {
            return { ...obj, shadow: !obj.shadow };
          }
          return obj;
        });
        onObjectsChange(updatedObjects);
      }

      // Group selected objects (Ctrl+G)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "g" &&
        selectedObjects.length > 1
      ) {
        e.preventDefault();
        const groupId = generateId();
        const updatedObjects = objects.map((obj) => {
          if (selectedObjectIds.has(obj.id)) {
            return { ...obj, groupId };
          }
          return obj;
        });
        onObjectsChange(updatedObjects);
      }

      // Ungroup (Ctrl+Shift+G)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
        e.preventDefault();
        const updatedObjects = objects.map((obj) => {
          if (selectedObjectIds.has(obj.id)) {
            return { ...obj, groupId: undefined };
          }
          return obj;
        });
        onObjectsChange(updatedObjects);
      }

      // Select All (Ctrl+A)
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const allIds = new Set(objects.map((o) => o.id));
        setSelectedObjectIds(allIds);
        onObjectsChange(objects.map((obj) => ({ ...obj, selected: true })));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [objects, selectedObjectIds, clipboard, textInput, onObjectsChange]);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const defaultGridColor =
        theme === "dark" ? "rgba(56, 189, 248, 0.1)" : "rgba(0, 0, 0, 0.08)";
      const defaultAccentColor =
        theme === "dark" ? "rgba(56, 189, 248, 0.22)" : "rgba(0, 0, 0, 0.15)";

      const finalGridColor = gridColor || defaultGridColor;
      const finalAccentColor = gridAccentColor || defaultAccentColor;
      const adjustedGridSize = gridSize * scale;

      ctx.save();
      ctx.globalAlpha = gridOpacity;

      if (gridPattern === "dots") {
        for (
          let x = offset.x % adjustedGridSize;
          x <= width;
          x += adjustedGridSize
        ) {
          for (
            let y = offset.y % adjustedGridSize;
            y <= height;
            y += adjustedGridSize
          ) {
            const worldX = (x - offset.x) / scale;
            const worldY = (y - offset.y) / scale;
            const isAccent =
              Math.round(worldX / gridSize) % 5 === 0 &&
              Math.round(worldY / gridSize) % 5 === 0;

            ctx.fillStyle = isAccent ? finalAccentColor : finalGridColor;
            const radius = isAccent ? 2 : 1;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (gridPattern === "lines" || gridPattern === "dashed") {
        ctx.lineWidth = 0.5;
        if (gridPattern === "dashed") {
          ctx.setLineDash([4, 4]);
        }

        for (
          let x = offset.x % adjustedGridSize;
          x <= width;
          x += adjustedGridSize
        ) {
          const worldX = (x - offset.x) / scale;
          const isAccent = Math.round(worldX / gridSize) % 5 === 0;
          ctx.strokeStyle = isAccent ? finalAccentColor : finalGridColor;
          ctx.lineWidth = isAccent ? 1 : 0.5;

          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (
          let y = offset.y % adjustedGridSize;
          y <= height;
          y += adjustedGridSize
        ) {
          const worldY = (y - offset.y) / scale;
          const isAccent = Math.round(worldY / gridSize) % 5 === 0;
          ctx.strokeStyle = isAccent ? finalAccentColor : finalGridColor;
          ctx.lineWidth = isAccent ? 1 : 0.5;

          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        ctx.setLineDash([]);
      }

      ctx.restore();
    },
    [
      theme,
      gridColor,
      gridAccentColor,
      gridSize,
      gridPattern,
      gridOpacity,
      scale,
      offset,
    ],
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    const bgColor = theme === "dark" ? "#0a0f1e" : "#f8fafc";
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark mode radial vignette (darker corners for depth)
    if (theme === "dark") {
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.15,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.95,
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw grid
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Apply transform for zoom/pan
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Sort objects by layer for proper z-ordering
    const layerOrder: Record<string, number> = {
      background: 0,
      default: 1,
      foreground: 2,
    };
    const sortedObjects = [...objects]
      .filter((obj) => obj.visible !== false)
      .sort((a, b) => {
        const aLayer = layerOrder[a.layer || "default"] ?? 1;
        const bLayer = layerOrder[b.layer || "default"] ?? 1;
        return aLayer - bLayer;
      });

    // Draw all objects with hover state
    sortedObjects.forEach((obj) => {
      // Skip locked objects for interaction but still draw them
      const isHovered = obj.id === hoveredObjectId;
      if (obj.type === "eraser") {
        drawObject(ctx, { ...obj, color: bgColor }, isHovered);
      } else {
        drawObject(ctx, obj, isHovered);
      }

      // Draw connection points for shapes
      if (obj.type === "shape") {
        drawConnectionPoints(ctx, obj, isHovered);
      }

      // Draw selection handles for selected objects
      if (obj.selected) {
        drawSelectionHandles(ctx, obj);
      }
    });

    // Draw all connections
    const shapesMap = new Map(
      objects.filter((o) => o.type === "shape").map((o) => [o.id, o]),
    );
    connections.forEach((conn) => {
      // Convert CanvasConnection to ShapeConnection format
      const shapeConnection: ShapeConnection = {
        id: conn.id,
        sourceShapeId: conn.sourceShapeId,
        sourcePort: conn.sourcePort,
        targetShapeId: conn.targetShapeId,
        targetPort: conn.targetPort,
        connectionType: conn.connectionType as any,
        color: conn.color,
        status: (conn.status || "active") as "active" | "inactive" | "error",
        animated: conn.animated,
        bidirectional: conn.bidirectional,
        label: conn.label,
        labelOffsetY: conn.labelOffsetY,
        labelOffsetT: conn.labelOffsetT,
      };
      drawConnection(
        ctx,
        shapeConnection,
        shapesMap,
        conn.animated,
        0,
        showConnectionLabels,
      );
    });

    // Draw simulation packets
    if (simulationPackets.length > 0) {
      simulationPackets.forEach((packet) => {
        const sourceObj = shapesMap.get(packet.sourceId);
        const targetObj = shapesMap.get(packet.targetId);
        if (!sourceObj || !targetObj) return;

        // Get source and target positions
        const sourcePos = getPortPosition(sourceObj, "right");
        const targetPos = getPortPosition(targetObj, "left");

        // Calculate packet position along the path
        const packetX =
          sourcePos.x + (targetPos.x - sourcePos.x) * packet.progress;
        const packetY =
          sourcePos.y + (targetPos.y - sourcePos.y) * packet.progress;

        // Draw packet
        ctx.save();
        ctx.beginPath();
        ctx.arc(packetX, packetY, 8, 0, Math.PI * 2);

        // Color based on status
        const packetColor =
          packet.status === "error"
            ? "#EF4444"
            : packet.status === "dropped"
              ? "#F59E0B"
              : "#3B82F6";

        ctx.fillStyle = packetColor;
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw protocol label
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "8px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(packet.protocol.slice(0, 4), packetX, packetY);
        ctx.restore();
      });
    }

    // Draw connection ports when connection tool is active
    if (tool === "connection") {
      objects.forEach((obj) => {
        if (obj.type !== "shape") return;

        const isHoveredShape = hoveredPort?.shapeId === obj.id;
        const highlightPort = isHoveredShape ? hoveredPort.port : null;

        drawConnectionPorts(ctx, obj, highlightPort, theme);
      });
    }

    // Draw connection preview line when creating connection
    if (tool === "connection" && connectionStart && cursorPosition) {
      // Inline screenToWorld calculation
      const cursorWorld = {
        x: (cursorPosition.x - offset.x) / scale,
        y: (cursorPosition.y - offset.y) / scale,
      };

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(connectionStart.position.x, connectionStart.position.y);
      ctx.lineTo(cursorWorld.x, cursorWorld.y);
      ctx.strokeStyle = hoveredPort ? "#22c55e" : "#6366f1";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    }

    // Draw current object being created
    if (currentObject) {
      drawObject(ctx, currentObject);
    }

    ctx.restore();

    // Draw shape cursor preview
    if (tool === "shape" && selectedShape && cursorPosition) {
      drawShapePreview(ctx, cursorPosition);
    }
  }, [
    objects,
    connections,
    simulationPackets,
    theme,
    showGrid,
    drawGrid,
    scale,
    offset,
    currentObject,
    cursorPosition,
    selectedShape,
    tool,
    hoveredObjectId,
    connectionStart,
    hoveredPort,
    showConnectionLabels,
  ]);

  // Set callback for SVG image loading to trigger canvas redraw
  useEffect(() => {
    setImageLoadCallback(() => redraw());
    return () => setImageLoadCallback(() => {});
  }, [redraw]);

  const drawSelectionHandles = (
    ctx: CanvasRenderingContext2D,
    obj: DrawingObject,
  ) => {
    ctx.save();

    let bounds: { x: number; y: number; width: number; height: number } | null =
      null;

    if (obj.startPoint && obj.endPoint) {
      bounds = {
        x: Math.min(obj.startPoint.x, obj.endPoint.x),
        y: Math.min(obj.startPoint.y, obj.endPoint.y),
        width: Math.abs(obj.endPoint.x - obj.startPoint.x),
        height: Math.abs(obj.endPoint.y - obj.startPoint.y),
      };
    } else if (obj.points && obj.points.length > 0) {
      const xs = obj.points.map((p) => p.x);
      const ys = obj.points.map((p) => p.y);
      bounds = {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    } else if (obj.startPoint && obj.type === "text") {
      const textWidth = (obj.text?.length || 5) * (obj.fontSize || 20) * 0.6;
      bounds = {
        x: obj.startPoint.x,
        y: obj.startPoint.y - (obj.fontSize || 20),
        width: textWidth,
        height: (obj.fontSize || 20) * 1.2,
      };
    }

    if (bounds) {
      // Draw selection border
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2 / scale;
      ctx.setLineDash([5 / scale, 5 / scale]);
      ctx.strokeRect(
        bounds.x - 5,
        bounds.y - 5,
        bounds.width + 10,
        bounds.height + 10,
      );
      ctx.setLineDash([]);

      // Draw corner handles
      const handleSize = 8 / scale;
      ctx.fillStyle = "#6366f1";
      const corners = [
        { x: bounds.x - 5, y: bounds.y - 5 },
        { x: bounds.x + bounds.width + 5, y: bounds.y - 5 },
        { x: bounds.x - 5, y: bounds.y + bounds.height + 5 },
        { x: bounds.x + bounds.width + 5, y: bounds.y + bounds.height + 5 },
      ];

      corners.forEach((corner) => {
        ctx.fillRect(
          corner.x - handleSize / 2,
          corner.y - handleSize / 2,
          handleSize,
          handleSize,
        );
      });
    }

    ctx.restore();
  };

  // Hit-test for selection-corner-handles (returns handle + fixed-opposite-corner in world coords)
  const getResizeHandleAt = (
    worldPos: Point,
  ): { obj: DrawingObject; handle: ResizeHandle; fixedCorner: Point } | null => {
    if (selectedObjectIds.size !== 1) return null;
    const obj = objects.find(
      (o) =>
        selectedObjectIds.has(o.id) &&
        o.startPoint &&
        o.endPoint &&
        !o.locked,
    );
    if (!obj || !obj.startPoint || !obj.endPoint) return null;

    const minX = Math.min(obj.startPoint.x, obj.endPoint.x);
    const minY = Math.min(obj.startPoint.y, obj.endPoint.y);
    const maxX = Math.max(obj.startPoint.x, obj.endPoint.x);
    const maxY = Math.max(obj.startPoint.y, obj.endPoint.y);

    // Selection box is drawn with -5/+5 padding around bounds — match that
    const padded = {
      tl: { x: minX - 5, y: minY - 5 },
      tr: { x: maxX + 5, y: minY - 5 },
      bl: { x: minX - 5, y: maxY + 5 },
      br: { x: maxX + 5, y: maxY + 5 },
    } as const;
    const fixed: Record<ResizeHandle, Point> = {
      tl: { x: maxX, y: maxY },
      tr: { x: minX, y: maxY },
      bl: { x: maxX, y: minY },
      br: { x: minX, y: minY },
    };

    const r = 12 / scale; // generous hit-radius in world units
    const handles: ResizeHandle[] = ["tl", "tr", "bl", "br"];
    for (const h of handles) {
      const p = padded[h];
      if (Math.abs(worldPos.x - p.x) <= r && Math.abs(worldPos.y - p.y) <= r) {
        return { obj, handle: h, fixedCorner: fixed[h] };
      }
    }
    return null;
  };

  const drawShapePreview = (ctx: CanvasRenderingContext2D, pos: Point) => {
    if (!selectedShape) return;

    ctx.save();
    ctx.globalAlpha = 0.5;

    const worldPos = screenToWorld(pos);
    const x = worldPos.x - selectedShape.width / 2;
    const y = worldPos.y - selectedShape.height / 2;

    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw preview rectangle
    ctx.strokeStyle = selectedShape.color;
    ctx.fillStyle = selectedShape.color + "20";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, selectedShape.width, selectedShape.height);
    ctx.fillRect(x, y, selectedShape.width, selectedShape.height);
    ctx.setLineDash([]);

    // Draw shape name
    ctx.fillStyle = selectedShape.color;
    ctx.font = "12px IBM Plex Mono";
    ctx.textAlign = "center";
    ctx.fillText(
      selectedShape.name,
      x + selectedShape.width / 2,
      y + selectedShape.height + 16,
    );

    ctx.restore();
  };

  const screenToWorld = (point: Point): Point => ({
    x: (point.x - offset.x) / scale,
    y: (point.y - offset.y) / scale,
  });

  const snapToGrid = (point: Point): Point => {
    if (!showGrid) return point;
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  };

  const getMousePos = (
    e: React.MouseEvent<HTMLCanvasElement | HTMLDivElement>,
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't process if text input is active
    if (textInput) return;

    const screenPos = getMousePos(e);
    const worldPos = screenToWorld(screenPos);

    // Middle mouse or alt + click for panning
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart(screenPos);
      e.preventDefault();
      return;
    }

    // Resize: clicked on a selection corner-handle of a selected shape?
    if (tool === "select" && e.button === 0) {
      const hit = getResizeHandleAt(worldPos);
      if (hit) {
        setResizeState({
          objectId: hit.obj.id,
          handle: hit.handle,
          fixedCorner: hit.fixedCorner,
        });
        e.preventDefault();
        return;
      }
    }

    setIsDrawing(true);
    setDragStart(worldPos);

    // Text tool - show input
    if (tool === "text") {
      e.preventDefault();
      e.stopPropagation();
      const snappedPos = snapToGrid(worldPos);
      setTextValue("");
      setTextInput({
        worldPosition: snappedPos,
        screenPosition: { x: e.clientX, y: e.clientY },
        value: "",
        isEditing: true,
      });
      return;
    }

    // Select tool
    if (tool === "select") {
      const clickedObject = [...objects]
        .filter((obj) => obj.visible !== false) // Only consider visible objects
        .reverse()
        .find((obj) => isPointInBounds(worldPos, obj));

      if (clickedObject) {
        // If object is in a group, select all group members.
        // Exception: template groups (groupId starts with "tpl-group-") only
        // select all members when clicking the anchor handle; individual clicks
        // select just the clicked object so users can edit template elements.
        let objectsToSelect = [clickedObject.id];
        if (clickedObject.groupId) {
          const isTplGroup = clickedObject.groupId.startsWith("tpl-group-");
          const isAnchor =
            isTplGroup &&
            clickedObject.type === "text" &&
            clickedObject.text?.startsWith("\u2725");
          if (!isTplGroup || isAnchor) {
            objectsToSelect = objects
              .filter((o) => o.groupId === clickedObject.groupId)
              .map((o) => o.id);
          }
        }

        if (e.ctrlKey || e.metaKey) {
          const newSelected = new Set(selectedObjectIds);
          objectsToSelect.forEach((id) => {
            if (newSelected.has(id)) {
              newSelected.delete(id);
            } else {
              newSelected.add(id);
            }
          });
          setSelectedObjectIds(newSelected);
        } else {
          setSelectedObjectIds(new Set(objectsToSelect));
        }

        const newSelectedSet =
          e.ctrlKey || e.metaKey
            ? new Set(
                [...selectedObjectIds].filter(
                  (id) =>
                    !objectsToSelect.includes(id) ||
                    !selectedObjectIds.has(clickedObject.id),
                ),
              )
            : new Set(objectsToSelect);

        const updatedObjects = objects.map((obj) => ({
          ...obj,
          selected:
            newSelectedSet.has(obj.id) || objectsToSelect.includes(obj.id),
        }));
        onObjectsChange(updatedObjects);
      } else {
        setSelectedObjectIds(new Set());
        onObjectsChange(objects.map((obj) => ({ ...obj, selected: false })));
        // Empty area click in select mode → start panning (LMB drag)
        setIsPanning(true);
        setPanStart(screenPos);
        setIsDrawing(false);
      }
      return;
    }

    // Shape tool
    if (tool === "shape" && selectedShape) {
      const snappedPos = snapToGrid(worldPos);
      const shapeObject: DrawingObject = {
        id: generateId(),
        type: "shape",
        color: selectedShape.color,
        width: 2,
        startPoint: {
          x: snappedPos.x - selectedShape.width / 2,
          y: snappedPos.y - selectedShape.height / 2,
        },
        endPoint: {
          x: snappedPos.x + selectedShape.width / 2,
          y: snappedPos.y + selectedShape.height / 2,
        },
        shapeId: selectedShape.id,
        shapeWidth: selectedShape.width,
        shapeHeight: selectedShape.height,
        svgPath: selectedShape.svgPath,
        label: selectedShape.name,
      };
      onObjectsChange([...objects, shapeObject]);
      return;
    }

    // Connection tool - start creating connection from a port
    if (tool === "connection") {
      // Find if we clicked on or near a shape's port
      for (const obj of objects) {
        if (obj.type !== "shape") continue;

        const nearestPort = findNearestPort(obj, worldPos, 20);
        if (nearestPort) {
          const portPos = getPortPosition(obj, nearestPort);
          setConnectionStart({
            shapeId: obj.id,
            port: nearestPort,
            position: portPos,
          });
          setIsDrawing(true);
          return;
        }
      }
      return;
    }

    // Drawing tools
    const snappedPos = e.shiftKey ? snapToGrid(worldPos) : worldPos;
    const newObject: DrawingObject = {
      id: generateId(),
      type: tool,
      color:
        tool === "eraser" ? (theme === "dark" ? "#0f172a" : "#f8fafc") : color,
      width: tool === "eraser" ? 20 : penWidth,
    };

    if (tool === "pen" || tool === "eraser") {
      newObject.points = [snappedPos];
    } else {
      newObject.startPoint = snappedPos;
      newObject.endPoint = snappedPos;
    }

    setCurrentObject(newObject);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = getMousePos(e);
    const worldPos = screenToWorld(screenPos);

    // RESIZE: actively dragging a corner-handle
    if (resizeState) {
      const idx = objects.findIndex((o) => o.id === resizeState.objectId);
      if (idx !== -1) {
        const obj = objects[idx];
        const fixed = resizeState.fixedCorner;
        // Optional grid-snap with Shift
        const target = e.shiftKey ? snapToGrid(worldPos) : worldPos;
        const newStart = {
          x: Math.min(fixed.x, target.x),
          y: Math.min(fixed.y, target.y),
        };
        const newEnd = {
          x: Math.max(fixed.x, target.x),
          y: Math.max(fixed.y, target.y),
        };
        // Avoid degenerate 0×0
        if (newEnd.x - newStart.x < 4) newEnd.x = newStart.x + 4;
        if (newEnd.y - newStart.y < 4) newEnd.y = newStart.y + 4;

        const updated: DrawingObject = {
          ...obj,
          startPoint: newStart,
          endPoint: newEnd,
          // For shape objects, sync the rendered size too
          shapeWidth:
            obj.type === "shape" ? newEnd.x - newStart.x : obj.shapeWidth,
          shapeHeight:
            obj.type === "shape" ? newEnd.y - newStart.y : obj.shapeHeight,
        };
        const next = objects.slice();
        next[idx] = updated;
        onObjectsChange(next);
      }
      return;
    }

    // Hover-detect resize handle for cursor feedback
    if (!isDrawing && !isPanning && tool === "select") {
      const hit = getResizeHandleAt(worldPos);
      setHoverHandle(hit ? hit.handle : null);
    } else {
      setHoverHandle(null);
    }

    // Update cursor position for shape preview
    if (tool === "shape" && selectedShape) {
      setCursorPosition(screenPos);
    } else {
      setCursorPosition(null);
    }

    // Hover detection for shapes (only when not drawing)
    if (!isDrawing && tool === "select") {
      const hoveredObj = [...objects]
        .reverse()
        .find((obj) => isPointInBounds(worldPos, obj));
      setHoveredObjectId(hoveredObj?.id || null);
    } else if (!isDrawing) {
      setHoveredObjectId(null);
    }

    // Port hover detection for connection tool
    if (tool === "connection") {
      let foundPort: { shapeId: string; port: PortPosition } | null = null;

      for (const obj of objects) {
        if (obj.type !== "shape") continue;

        const nearestPort = findNearestPort(obj, worldPos, 20);
        if (nearestPort) {
          // Don't select the same port we started from
          if (
            connectionStart &&
            connectionStart.shapeId === obj.id &&
            connectionStart.port === nearestPort
          ) {
            continue;
          }
          foundPort = { shapeId: obj.id, port: nearestPort };
          break;
        }
      }

      setHoveredPort(foundPort);
    } else {
      setHoveredPort(null);
    }

    // Handle panning
    if (isPanning && panStart) {
      const dx = screenPos.x - panStart.x;
      const dy = screenPos.y - panStart.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart(screenPos);
      return;
    }

    // Connection tool - track cursor for preview (redraw will show preview line)
    if (tool === "connection" && connectionStart && isDrawing) {
      // The connection preview is drawn in the redraw function
      // We just need to trigger a redraw by updating cursor position
      setCursorPosition(screenPos);
      return;
    }

    if (!isDrawing) return;
    // For draw-tools we need a currentObject; select-tool dragging continues without one.
    if (tool !== "select" && !currentObject) return;

    // Snap to nearby shapes when dragging
    const snappedPos = e.shiftKey ? snapToGrid(worldPos) : worldPos;

    // Snap-to-Shape: align with nearby shape edges
    if (!e.shiftKey && tool === "select" && selectedObjectIds.size > 0) {
      const SNAP_THRESHOLD = 10;
      const otherShapes = objects.filter(
        (obj) => !selectedObjectIds.has(obj.id) && obj.type === "shape",
      );

      otherShapes.forEach((shape) => {
        const bounds = getShapeBounds(shape);
        if (!bounds) return;

        // Horizontal alignment
        if (Math.abs(snappedPos.x - bounds.x) < SNAP_THRESHOLD) {
          snappedPos.x = bounds.x;
        } else if (
          Math.abs(snappedPos.x - (bounds.x + bounds.width)) < SNAP_THRESHOLD
        ) {
          snappedPos.x = bounds.x + bounds.width;
        } else if (
          Math.abs(snappedPos.x - (bounds.x + bounds.width / 2)) <
          SNAP_THRESHOLD
        ) {
          snappedPos.x = bounds.x + bounds.width / 2;
        }

        // Vertical alignment
        if (Math.abs(snappedPos.y - bounds.y) < SNAP_THRESHOLD) {
          snappedPos.y = bounds.y;
        } else if (
          Math.abs(snappedPos.y - (bounds.y + bounds.height)) < SNAP_THRESHOLD
        ) {
          snappedPos.y = bounds.y + bounds.height;
        } else if (
          Math.abs(snappedPos.y - (bounds.y + bounds.height / 2)) <
          SNAP_THRESHOLD
        ) {
          snappedPos.y = bounds.y + bounds.height / 2;
        }
      });
    }

    // Handle select tool dragging
    if (tool === "select" && dragStart && selectedObjectIds.size > 0) {
      // Check if any selected object is locked
      const hasLockedObject = objects.some(
        (obj) => selectedObjectIds.has(obj.id) && obj.locked,
      );
      if (hasLockedObject) {
        return; // Don't allow dragging locked objects
      }

      const dx = snappedPos.x - dragStart.x;
      const dy = snappedPos.y - dragStart.y;

      const updatedObjects = objects.map((obj) => {
        if (selectedObjectIds.has(obj.id)) {
          const newObj = { ...obj };
          if (newObj.points) {
            newObj.points = newObj.points.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
          }
          if (newObj.startPoint) {
            newObj.startPoint = {
              x: newObj.startPoint.x + dx,
              y: newObj.startPoint.y + dy,
            };
          }
          if (newObj.endPoint) {
            newObj.endPoint = {
              x: newObj.endPoint.x + dx,
              y: newObj.endPoint.y + dy,
            };
          }
          return newObj;
        }
        return obj;
      });

      onObjectsChange(updatedObjects);
      setDragStart(snappedPos);
      return;
    }

    // Update current drawing object
    if (!currentObject) return;
    if (currentObject.type === "pen" || currentObject.type === "eraser") {
      setCurrentObject({
        ...currentObject,
        points: [...(currentObject.points || []), snappedPos],
      });
    } else {
      setCurrentObject({
        ...currentObject,
        endPoint: snappedPos,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (resizeState) {
      setResizeState(null);
      return;
    }
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    // Connection tool - complete connection if hovering over a valid port
    if (tool === "connection" && connectionStart && isDrawing) {
      const screenPos = getMousePos(e);
      const worldPos = screenToWorld(screenPos);

      // Find if we're over a valid target port
      for (const obj of objects) {
        if (obj.type !== "shape") continue;
        if (obj.id === connectionStart.shapeId) continue; // Can't connect to same shape

        const nearestPort = findNearestPort(obj, worldPos, 20);
        if (nearestPort) {
          // Auto-detect recommended connection/cable type
          const sourceObj = objects.find(
            (o) => o.id === connectionStart.shapeId,
          );
          const compat = getConnectionCompatibility(
            sourceObj?.shapeId,
            obj.shapeId,
          );

          // Create the connection with auto-detected types
          const newConnection = createConnection(
            connectionStart.shapeId,
            connectionStart.port,
            obj.id,
            nearestPort,
            compat.recommendedConnection,
          );

          // Apply recommended cable type
          const enrichedConnection = {
            ...newConnection,
            cableType: compat.recommendedCable,
            ...(compat.warning ? { label: compat.warning } : {}),
          };

          onConnectionsChange([...connections, enrichedConnection]);
          break;
        }
      }

      // Reset connection state
      setConnectionStart(null);
      setHoveredPort(null);
      setCursorPosition(null);
      setIsDrawing(false);
      return;
    }

    if (currentObject) {
      // Only add if it has content
      const hasContent =
        (currentObject.points && currentObject.points.length > 1) ||
        (currentObject.startPoint &&
          currentObject.endPoint &&
          (Math.abs(currentObject.endPoint.x - currentObject.startPoint.x) >
            2 ||
            Math.abs(currentObject.endPoint.y - currentObject.startPoint.y) >
              2));

      if (hasContent) {
        onObjectsChange([...objects, currentObject]);
      }
    }

    setIsDrawing(false);
    setCurrentObject(null);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Shift+Wheel = pan, alles andere (inkl. ohne Modifier oder mit Ctrl) = Zoom mit Cursor-Anker
    if (e.shiftKey) {
      setOffset((prev) => ({
        x: prev.x - (e.deltaX || e.deltaY),
        y: prev.y - (e.shiftKey && !e.deltaX ? 0 : e.deltaY),
      }));
      return;
    }

    const screenPos = getMousePos(e as any);
    const worldPos = screenToWorld(screenPos);
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor));
    setScale(newScale);
    setOffset({
      x: screenPos.x - worldPos.x * newScale,
      y: screenPos.y - worldPos.y * newScale,
    });
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = getMousePos(e);
    const worldPos = screenToWorld(screenPos);

    // Check for connection click first
    if (onConnectionSelect) {
      for (const conn of connections) {
        const sourceObj = objects.find((o) => o.id === conn.sourceShapeId);
        const targetObj = objects.find((o) => o.id === conn.targetShapeId);
        if (!sourceObj || !targetObj) continue;

        const sourcePos = getPortPosition(
          sourceObj,
          conn.sourcePort as PortPosition,
        );
        const targetPos = getPortPosition(
          targetObj,
          conn.targetPort as PortPosition,
        );

        // Check if point is near the line
        const dist = distanceToLine(worldPos, sourcePos, targetPos);
        if (dist < 10) {
          onConnectionSelect(conn);
          return;
        }
      }
    }

    // Find clicked text object to edit
    const clickedText = [...objects]
      .reverse()
      .find((obj) => obj.type === "text" && isPointInBounds(worldPos, obj));

    if (clickedText && clickedText.startPoint) {
      // Remove the text object and open editor with its content
      const newObjects = objects.filter((obj) => obj.id !== clickedText.id);
      onObjectsChange(newObjects);
      setTextValue(clickedText.text || "");
      setTextInput({
        worldPosition: clickedText.startPoint,
        screenPosition: { x: e.clientX, y: e.clientY },
        value: clickedText.text || "",
        isEditing: true,
      });
    }
  };

  // Helper function to calculate distance from point to line segment
  const distanceToLine = (
    point: Point,
    lineStart: Point,
    lineEnd: Point,
  ): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Text input handlers
  const handleTextSubmit = useCallback(() => {
    if (textInput && textValue.trim()) {
      const textObject: DrawingObject = {
        id: generateId(),
        type: "text",
        color,
        width: 0,
        startPoint: textInput.worldPosition,
        text: textValue,
        fontSize,
        fontFamily,
      };
      onObjectsChange([...objects, textObject]);
    }
    setTextInput(null);
    setTextValue("");
  }, [
    textInput,
    textValue,
    color,
    fontSize,
    fontFamily,
    objects,
    onObjectsChange,
  ]);

  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Prevent all keyboard events from bubbling
      e.stopPropagation();

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleTextSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setTextInput(null);
        setTextValue("");
      }
    },
    [handleTextSubmit],
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    setTextValue(e.target.value);
  };

  // Prevent all events from bubbling from the text input
  const preventPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const getCursor = () => {
    if (resizeState || hoverHandle) {
      const h = resizeState?.handle ?? hoverHandle;
      if (h === "tl" || h === "br") return "nwse-resize";
      if (h === "tr" || h === "bl") return "nesw-resize";
    }
    if (isPanning) return "grabbing";
    if (tool === "select") return "default";
    if (tool === "text") return "text";
    if (tool === "eraser") return "cell";
    if (tool === "shape") return "copy";
    return "crosshair";
  };

  // Use the stored screen position directly, but convert to relative position to container
  const getTextInputPos = (): { left: number; top: number } | null => {
    if (!textInput || !containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      left: textInput.screenPosition.x - containerRect.left,
      top: textInput.screenPosition.y - containerRect.top,
    };
  };

  const textInputPos = getTextInputPos();

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onContextMenu) {
            const selectedObjects = objects.filter((obj) =>
              selectedObjectIds.has(obj.id),
            );
            onContextMenu(e, selectedObjects);
          }
        }}
        style={{ cursor: getCursor() }}
        className="w-full h-full"
      />

      {/* Zoom indicator */}
      {scale !== 1 && (
        <div
          className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-xs font-mono ${
            theme === "dark"
              ? "bg-slate-800 text-slate-300"
              : "bg-white text-slate-700 shadow-md"
          }`}
        >
          {Math.round(scale * 100)}%
          <button
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="ml-2 underline hover:no-underline"
          >
            Reset
          </button>
        </div>
      )}

      {/* Text input overlay - clicking outside submits */}
      {textInput && textInputPos && (
        <>
          {/* Backdrop to catch clicks outside */}
          <div
            className="absolute inset-0 z-50"
            onClick={handleTextSubmit}
            onMouseDown={preventPropagation}
          />

          {/* Text input container - absolute positioning relative to canvas container */}
          <div
            className="absolute z-100"
            style={{
              left: `${Math.max(10, textInputPos.left)}px`,
              top: `${Math.max(10, textInputPos.top)}px`,
            }}
            onClick={preventPropagation}
            onMouseDown={preventPropagation}
          >
            <textarea
              ref={textInputRef}
              value={textValue}
              onChange={handleTextChange}
              onKeyDown={handleTextKeyDown}
              onKeyUp={preventPropagation}
              onKeyPress={preventPropagation}
              onClick={preventPropagation}
              onMouseDown={preventPropagation}
              onMouseUp={preventPropagation}
              onBlur={(e) => {
                // Only submit if clicking outside, not on another input
                if (!e.relatedTarget) {
                  handleTextSubmit();
                }
              }}
              placeholder="Text eingeben..."
              autoFocus
              spellCheck={false}
              className="border-2 border-indigo-500 outline-none px-3 py-2 rounded-lg shadow-2xl resize"
              style={{
                color,
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                fontSize: `${fontSize}px`,
                fontFamily,
                width: "300px",
                height: "100px",
                minWidth: "200px",
                minHeight: "60px",
                maxWidth: "600px",
                maxHeight: "400px",
              }}
            />
            <div
              className={`mt-2 text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}
            >
              Enter = Bestätigen • Shift+Enter = Neue Zeile • Esc = Abbrechen
            </div>
          </div>
        </>
      )}

      {/* Tool hints — nur wenn Canvas leer (UX-QW-1) */}
      {objects.length === 0 && (
        <div
          className={`absolute top-4 left-4 px-3 py-2 rounded-lg text-xs ${
            theme === "dark"
              ? "bg-slate-800/80 text-slate-400"
              : "bg-white/80 text-slate-600 shadow-md"
          } backdrop-blur-sm pointer-events-none`}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 max-w-md">
            <span>Linke Maustaste auf leerer Fläche: Verschieben</span>
            <span>Scrollrad: Zoom (zum Cursor)</span>
            <span>Shift+Scroll: Schwenken</span>
            <span>Eckpunkt ziehen: Größe ändern</span>
            <span>Shift: Snap</span>
            <span>Ctrl+C/V: Kopieren</span>
            <span>R: Drehen</span>
            <span>S: Schatten</span>
            <span>Ctrl+G: Gruppieren</span>
            <span>Del: Löschen</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const Canvas = memo(CanvasInner);

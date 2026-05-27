/**
 * ReactFlowCanvas — topology canvas built on @xyflow/react + framer-motion
 *
 * Replaces the HTML5-Canvas-based Canvas.tsx for topology visualisation.
 *
 * Rendering model:
 *   DrawingObject { type: "shape" }     → NetworkDeviceNode (drag, status dot, label)
 *   DrawingObject { type: "text" }      → TextLabelNode
 *   DrawingObject { type: "rectangle" } → ZoneRectNode (coloured zone backgrounds)
 *   CanvasConnection                    → smoothstep Edge (animated dashes, colour, label)
 *
 * Objects of type pen / line / arrow / circle are stored as-is but skipped by
 * ReactFlow (not mappable to nodes).  A future overlay can render them via SVG.
 *
 * framer-motion is used for:
 *   - Node mount animations (fade + scale in)
 *   - Edge label fade in
 */

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";

import type { PacketData } from "@/components/SimulationControls";
import type {
  CanvasConnection,
  DrawingObject,
  FontFamily,
  ShapeDefinition,
} from "@/lib/types";
import type { Tool } from "@/lib/types";

// ── CanvasProps — identical interface to Canvas.tsx ──────────────────────
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
  onViewportChange?: (viewport: {
    x: number;
    y: number;
    zoom: number;
    width: number;
    height: number;
  }) => void;
}

// ── Status colours ────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  running: "#22c55e",
  stopped: "#94a3b8",
  error: "#ef4444",
  warning: "#f59e0b",
  pending: "#38bdf8",
};

// ── Custom node: NetworkDeviceNode ────────────────────────────────────────
type NodeData = { obj: DrawingObject };

function NetworkDeviceNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { obj } = data;
  const w = obj.shapeWidth ?? 64;
  const h = obj.shapeHeight ?? 64;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        width: w,
        height: h,
        position: "relative",
        outline: selected ? "2px solid #38bdf8" : "none",
        outlineOffset: 3,
        borderRadius: 4,
      }}
    >
      <Handle type="target" id="top"    position={Position.Top}    style={{ opacity: 0, width: 8, height: 8, background: "#38bdf8" }} />
      <Handle type="target" id="left"   position={Position.Left}   style={{ opacity: 0, width: 8, height: 8, background: "#38bdf8" }} />
      <Handle type="source" id="right"  position={Position.Right}  style={{ opacity: 0, width: 8, height: 8, background: "#38bdf8" }} />
      <Handle type="source" id="bottom" position={Position.Bottom} style={{ opacity: 0, width: 8, height: 8, background: "#38bdf8" }} />

      {obj.svgPath ? (
        <img
          src={obj.svgPath}
          alt={obj.label ?? obj.shapeId ?? "device"}
          style={{ width: "100%", height: "100%", userSelect: "none", pointerEvents: "none" }}
          draggable={false}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `2px solid ${obj.color}`,
            borderRadius: 6,
            background: obj.color + "20",
          }}
        />
      )}

      {/* Label badge */}
      {obj.label && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.14 }}
          style={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            color: obj.color,
            fontSize: 11,
            fontFamily: "IBM Plex Mono, monospace",
            whiteSpace: "nowrap",
            background: "rgba(10,15,30,0.82)",
            padding: "1px 5px",
            borderRadius: 3,
            pointerEvents: "none",
          }}
        >
          {obj.label}
        </motion.div>
      )}

      {/* Status dot */}
      {obj.status && obj.status !== "running" && (
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: STATUS_COLOR[obj.status] ?? "#94a3b8",
            border: "2px solid #0a0f1e",
          }}
        />
      )}
    </motion.div>
  );
}

// ── Custom node: TextLabelNode ────────────────────────────────────────────
function TextLabelNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { obj } = data;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.14 }}
      style={{
        color: obj.color,
        fontSize: obj.fontSize ?? 14,
        fontFamily: obj.fontFamily ?? "IBM Plex Mono, monospace",
        userSelect: "none",
        background: selected ? "rgba(56,189,248,0.08)" : "transparent",
        padding: "2px 4px",
        borderRadius: 3,
        outline: selected ? "1px solid #38bdf8" : "none",
        whiteSpace: "pre",
        cursor: "default",
        lineHeight: 1.3,
      }}
    >
      {obj.text ?? ""}
    </motion.div>
  );
}

// ── Custom node: ZoneRectNode ─────────────────────────────────────────────
function ZoneRectNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { obj } = data;
  const w = obj.endPoint ? obj.endPoint.x - (obj.startPoint?.x ?? 0) : 120;
  const h = obj.endPoint ? obj.endPoint.y - (obj.startPoint?.y ?? 0) : 80;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: w,
        height: h,
        border: `${obj.width ?? 1.5}px solid ${obj.color}`,
        background: obj.color + "20",
        borderRadius: 4,
        outline: selected ? "1px solid #38bdf8" : "none",
        outlineOffset: 2,
        pointerEvents: "none",
      }}
    />
  );
}

const NODE_TYPES = {
  networkDevice: NetworkDeviceNode,
  textLabel: TextLabelNode,
  zoneRect: ZoneRectNode,
} as const;

// ── Converters ────────────────────────────────────────────────────────────
function objToNode(obj: DrawingObject): Node | null {
  if (!obj.startPoint) return null;

  const base = {
    id: obj.id,
    position: { x: obj.startPoint.x, y: obj.startPoint.y },
    data: { obj } as NodeData,
    selected: obj.selected ?? false,
    draggable: !obj.locked,
  };

  if (obj.type === "shape")     return { ...base, type: "networkDevice" };
  if (obj.type === "text")      return { ...base, type: "textLabel" };
  if (obj.type === "rectangle" && obj.endPoint) {
    return { ...base, type: "zoneRect", zIndex: obj.layer === "background" ? -1 : 0 };
  }
  return null;
}

function connToEdge(conn: CanvasConnection): Edge {
  return {
    id: conn.id,
    source: conn.sourceShapeId,
    target: conn.targetShapeId,
    animated: conn.animated ?? false,
    label: conn.label ?? "",
    style: { stroke: conn.color ?? "#38bdf8", strokeWidth: 2 },
    labelStyle: {
      fill: "#cbd5e1",
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 10,
      fontWeight: "bold",
    },
    labelBgStyle: { fill: "rgba(10,17,35,0.88)", fillOpacity: 1 },
    labelBgPadding: [4, 7] as [number, number],
    labelBgBorderRadius: 4,
    type: "smoothstep",
    data: { conn },
  };
}

// ── Inner canvas (needs ReactFlowProvider in tree) ────────────────────────
function ReactFlowCanvasInner({
  objects,
  onObjectsChange,
  onSelectionChange,
  connections,
  onConnectionsChange,
  onConnectionSelect,
  onContextMenu,
  tool,
  color,
  theme,
  showGrid,
  gridSize,
  gridPattern,
  gridAccentColor,
  gridOpacity = 1,
  selectedShape,
  onViewportChange,
}: CanvasProps) {
  // Derive RF nodes/edges from props
  const rfNodes = useMemo(() => objects.flatMap((o) => objToNode(o) ?? []), [objects]);
  const rfEdges = useMemo(() => connections.map(connToEdge), [connections]);

  const [nodes, setNodes] = useNodesState(rfNodes);
  const [edges, setEdges] = useEdgesState(rfEdges);

  // Keep ReactFlow in sync when external state changes
  useEffect(() => { setNodes(rfNodes); }, [rfNodes, setNodes]);
  useEffect(() => { setEdges(rfEdges); }, [rfEdges, setEdges]);

  // Node changes: drag end → update DrawingObject positions; select; delete
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Position: propagate drag-end back to DrawingObjects
      const posChanges = changes.filter(
        (c): c is NodeChange & { type: "position"; position: { x: number; y: number } } =>
          c.type === "position" && !(c as any).dragging && !!(c as any).position,
      );
      if (posChanges.length > 0) {
        const updated = objects.map((obj) => {
          const ch = posChanges.find((c) => c.id === obj.id);
          if (!ch) return obj;
          const pos = (ch as any).position as { x: number; y: number };
          const dx = pos.x - (obj.startPoint?.x ?? 0);
          const dy = pos.y - (obj.startPoint?.y ?? 0);
          return {
            ...obj,
            startPoint: pos,
            ...(obj.endPoint ? { endPoint: { x: obj.endPoint.x + dx, y: obj.endPoint.y + dy } } : {}),
            ...(obj.points   ? { points: obj.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) } : {}),
          };
        });
        onObjectsChange(updated);
      }

      // Selection: report to parent
      const selChanges = changes.filter((c) => c.type === "select");
      if (selChanges.length > 0 && onSelectionChange) {
        const selectedIds = new Set(
          selChanges.filter((c: any) => c.selected).map((c) => c.id),
        );
        onSelectionChange(objects.filter((o) => selectedIds.has(o.id)));
      }

      // Delete
      const removeIds = new Set(changes.filter((c) => c.type === "remove").map((c) => c.id));
      if (removeIds.size > 0) onObjectsChange(objects.filter((o) => !removeIds.has(o.id)));
    },
    [objects, onObjectsChange, onSelectionChange],
  );

  // Edge changes: delete → remove CanvasConnection
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      const removeIds = new Set(changes.filter((c) => c.type === "remove").map((c) => c.id));
      if (removeIds.size > 0) onConnectionsChange(connections.filter((c) => !removeIds.has(c.id)));
    },
    [connections, onConnectionsChange],
  );

  // New connection drawn by user
  const handleConnect = useCallback(
    (params: Connection) => {
      const newConn: CanvasConnection = {
        id: `conn-${Date.now()}`,
        sourceShapeId: params.source ?? "",
        sourcePort: params.sourceHandle ?? "default",
        targetShapeId: params.target ?? "",
        targetPort: params.targetHandle ?? "default",
        connectionType: "ethernet",
        status: "active",
        animated: false,
        color,
        label: "",
      };
      onConnectionsChange([...connections, newConn]);
    },
    [connections, onConnectionsChange, color],
  );

  // Clicking on the pane with a shape selected → add new shape node
  const handlePaneClick = useCallback(
    (e: React.MouseEvent) => {
      if (tool !== "shape" || !selectedShape) return;
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newObj: DrawingObject = {
        id: `shape-${Date.now()}`,
        type: "shape",
        color: selectedShape.color,
        width: 1.5,
        startPoint: { x, y },
        shapeId: selectedShape.id,
        shapeWidth: selectedShape.width,
        shapeHeight: selectedShape.height,
        svgPath: selectedShape.svgPath,
        label: selectedShape.name,
      };
      onObjectsChange([...objects, newObj]);
    },
    [tool, selectedShape, objects, onObjectsChange],
  );

  // Colours
  const bgColor     = theme === "dark" ? "#0a0f1e" : "#f8fafc";
  const gridDotColor = theme === "dark"
    ? (gridAccentColor || "rgba(56,189,248,0.22)")
    : "rgba(0,0,0,0.12)";

  const bgVariant = gridPattern === "dots"
    ? BackgroundVariant.Dots
    : gridPattern === "lines"
      ? BackgroundVariant.Lines
      : BackgroundVariant.Cross;

  return (
    <div style={{ width: "100%", height: "100%", background: bgColor }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        panOnDrag={[2]}
        selectionOnDrag={tool === "select"}
        connectOnClick={false}
        style={{ background: bgColor }}
        onContextMenu={(e) => onContextMenu?.(e as unknown as React.MouseEvent, [])}
        onEdgeClick={(_, edge) => {
          onConnectionSelect?.(connections.find((c) => c.id === edge.id) ?? null);
        }}
        onMoveEnd={(_, viewport) => {
          onViewportChange?.({
            x: viewport.x,
            y: viewport.y,
            zoom: viewport.zoom,
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }}
      >
        {showGrid && (
          <Background
            variant={bgVariant}
            gap={gridSize}
            size={1.5}
            color={gridDotColor}
            style={{ opacity: gridOpacity }}
          />
        )}
        <Controls
          style={{
            background: "rgba(10,17,35,0.82)",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────
export function ReactFlowCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

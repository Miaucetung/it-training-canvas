// ============================================================
// VlanNetworkVisualizer — ReactFlow-basierte VLAN-Topologie
// Exakte Port-zu-Port-Verbindungen, 5 VLANs, Neon-Design
// ============================================================

import 'reactflow/dist/style.css';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from 'reactflow';
import { useState, useMemo } from 'react';

// ── VLAN-Farben ───────────────────────────────────────────────
const VLAN_COLORS: Record<number, string> = {
  10: '#00d4ff', // Management — Cyan
  20: '#10b981', // Server     — Emerald
  30: '#6366f1', // Clients    — Indigo
  40: '#f97316', // WLAN       — Orange
  99: '#ff00ff', // Native     — Magenta
};
const vc = (id: number) => VLAN_COLORS[id] ?? '#888888';

const VLANS = [
  { id: 10, label: 'VLAN 10', name: 'Management' },
  { id: 20, label: 'VLAN 20', name: 'Server' },
  { id: 30, label: 'VLAN 30', name: 'Clients' },
  { id: 40, label: 'VLAN 40', name: 'WLAN' },
  { id: 99, label: 'VLAN 99', name: 'Native' },
];

// ── Switch-Dimensionen & Port-Layout ─────────────────────────
const SW_W   = 340;  // Switch-Breite (px)
const SW_H   = 92;   // Switch-Höhe  (px)
const PORT_W = 18;   // Port-Rect-Breite
const PORT_H = 18;   // Port-Rect-Höhe
const PORT_GAP   = 4;                    // Abstand zwischen Ports
const PORT_PITCH = PORT_W + PORT_GAP;    // 22 px
const COLS   = 12;
// Links-Padding so dass alle 12 Ports mittig sitzen
const LEFT_PAD = (SW_W - COLS * PORT_PITCH + PORT_GAP) / 2; // = 40
// Y-Oberkante der Port-Rects (Zeile 0 und Zeile 1)
const PORT_ROW_TOP = [10, 46];

// Relative X-Mitte eines Ports (Spaltenindex 0–11)
const portX = (col: number) => LEFT_PAD + col * PORT_PITCH + PORT_W / 2;
// Zeile 0: portX(0)=49 … portX(11)=291

// Relative Y-Mitte eines Ports
const portCY = (row: number) => PORT_ROW_TOP[row] + PORT_H / 2;
// row 0 → 19,  row 1 → 55

// ── Port-Konfiguration ────────────────────────────────────────
interface PortCfg {
  port: number;
  nodeId: string;
  vlan: number;
  mode: 'access' | 'trunk';
  side: 'top' | 'bottom' | 'left' | 'right';
}

const PORT_CFGS: PortCfg[] = [
  { port: 1,  nodeId: 'mgmt',   vlan: 10, mode: 'access', side: 'bottom' },
  { port: 2,  nodeId: 'srv1',   vlan: 20, mode: 'access', side: 'top'    },
  { port: 3,  nodeId: 'srv2',   vlan: 20, mode: 'access', side: 'top'    },
  { port: 4,  nodeId: 'pc1',    vlan: 30, mode: 'access', side: 'bottom' },
  { port: 5,  nodeId: 'pc2',    vlan: 30, mode: 'access', side: 'bottom' },
  { port: 6,  nodeId: 'pc3',    vlan: 30, mode: 'access', side: 'bottom' },
  { port: 7,  nodeId: 'pc4',    vlan: 30, mode: 'access', side: 'bottom' },
  { port: 8,  nodeId: 'pc5',    vlan: 30, mode: 'access', side: 'bottom' },
  { port: 9,  nodeId: 'pc6',    vlan: 30, mode: 'access', side: 'bottom' },
  { port: 21, nodeId: 'ap1',    vlan: 40, mode: 'trunk',  side: 'left'   },
  { port: 22, nodeId: 'ap2',    vlan: 40, mode: 'trunk',  side: 'right'  },
  { port: 24, nodeId: 'router', vlan: 99, mode: 'trunk',  side: 'top'    },
];

// Handle-Style für einen Switch-Port
function swHandleStyle(pc: PortCfg): React.CSSProperties {
  const idx = pc.port - 1;
  const col = idx % COLS;
  const row = Math.floor(idx / COLS);
  const color = pc.mode === 'trunk' ? vc(pc.vlan) : vc(pc.vlan);
  const base: React.CSSProperties = {
    width: 10, height: 10, borderRadius: '50%',
    background: color, border: '1.5px solid #0a0e27', zIndex: 10,
  };
  if (pc.side === 'top'    || pc.side === 'bottom') return { ...base, left: portX(col) };
  if (pc.side === 'left'   || pc.side === 'right')  return { ...base, top: portCY(row) };
  return base;
}

// Alle 24 Port-Rects für visuelle Darstellung im Switch
const ALL_PORT_RECTS = Array.from({ length: 24 }, (_, i) => {
  const portNum = i + 1;
  const cfg = PORT_CFGS.find(p => p.port === portNum);
  return {
    port: portNum,
    x: LEFT_PAD + (i % COLS) * PORT_PITCH,
    y: PORT_ROW_TOP[Math.floor(i / COLS)],
    active: !!cfg,
    mode:  cfg?.mode  ?? 'unused',
    vlan:  cfg?.vlan  ?? 0,
  };
});

// ── DeviceNode ────────────────────────────────────────────────
interface DeviceData {
  label: string;
  sublabel?: string;
  shape: 'router' | 'server' | 'pc' | 'ap' | 'cloud';
  vlan: number;
}

const SHAPE_ICON: Record<DeviceData['shape'], string> = {
  router: '⚙️', server: '🖥️', pc: '💻', ap: '📡', cloud: '☁️',
};

function DeviceNode({ data }: NodeProps<DeviceData>) {
  const color = VLAN_COLORS[data.vlan] ?? '#888888';
  const hStyle = (c: string): React.CSSProperties => ({
    width: 10, height: 10, borderRadius: '50%',
    background: c, border: '1.5px solid #0a0e27',
  });

  return (
    <div style={{
      background: `${color}18`, border: `2px solid ${color}`,
      borderRadius: 8, padding: '6px 12px', minWidth: 90,
      textAlign: 'center', position: 'relative',
      boxShadow: `0 0 10px ${color}33`,
    }}>
      {/* Server / PC — Eingang vom Switch (oben) */}
      {(data.shape === 'server' || data.shape === 'pc') && (
        <Handle type="target" id="input" position={Position.Top} style={hStyle(color)} />
      )}

      {/* Router — Ausgang zum WAN (oben) + Eingang vom Switch (unten) */}
      {data.shape === 'router' && (
        <>
          <Handle type="source" id="wan-out"   position={Position.Top}    style={hStyle('#aaa')} />
          <Handle type="target" id="switch-in" position={Position.Bottom} style={hStyle(vc(99))} />
        </>
      )}

      {/* AP — Eingang vom Switch (oben) + Ausgang zu WiFi-Clients (unten) */}
      {data.shape === 'ap' && (
        <>
          <Handle type="target" id="input"    position={Position.Top}    style={hStyle(color)} />
          <Handle type="source" id="wifi-out" position={Position.Bottom} style={hStyle(color)} />
        </>
      )}

      {/* WAN/Cloud — Eingang vom Router (unten) */}
      {data.shape === 'cloud' && (
        <Handle type="target" id="input" position={Position.Bottom} style={hStyle('#aaa')} />
      )}

      <div style={{ fontSize: 22, lineHeight: 1 }}>{SHAPE_ICON[data.shape]}</div>
      <div style={{ fontSize: 11, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', color: '#fff', marginTop: 4 }}>
        {data.label}
      </div>
      {data.sublabel && (
        <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#88ccff', opacity: 0.75 }}>
          {data.sublabel}
        </div>
      )}
    </div>
  );
}

// ── SwitchNode — 24-Port Managed Switch ──────────────────────
function SwitchNode({ data }: NodeProps<{ label: string; sublabel: string }>) {
  return (
    <div style={{
      width: SW_W, height: SW_H,
      background: '#0d1a3a', border: '2px solid #ff00ff',
      borderRadius: 8, position: 'relative',
      boxShadow: '0 0 16px #ff00ff44',
    }}>
      {/* Port-Rects */}
      {ALL_PORT_RECTS.map(p => {
        const color = p.mode === 'trunk' ? '#ff00ff'
                    : p.mode === 'unused' ? '#1e2a3a'
                    : vc(p.vlan);
        return (
          <div key={p.port} style={{
            position: 'absolute', left: p.x, top: p.y,
            width: PORT_W, height: PORT_H,
            background: color, borderRadius: 2,
            border: '1px solid #0a0e27',
            opacity: p.mode === 'unused' ? 0.2 : 1,
            boxShadow: p.mode !== 'unused' ? `0 0 4px ${color}88` : undefined,
          }} title={`Port ${p.port}`} />
        );
      })}

      {/* Port-Nummern über aktiven Ports */}
      {PORT_CFGS.map(pc => {
        const idx = pc.port - 1;
        return (
          <div key={pc.port} style={{
            position: 'absolute',
            left: LEFT_PAD + (idx % COLS) * PORT_PITCH + PORT_W / 2,
            top: PORT_ROW_TOP[Math.floor(idx / COLS)] - 10,
            fontSize: 7, fontFamily: 'monospace',
            color: vc(pc.vlan), transform: 'translateX(-50%)',
            pointerEvents: 'none', opacity: 0.75,
          }}>
            {pc.port}
          </div>
        );
      })}

      {/* Label */}
      <div style={{
        position: 'absolute', bottom: 2, left: '50%',
        transform: 'translateX(-50%)', fontSize: 9,
        fontFamily: 'monospace', color: '#ff00ff',
        whiteSpace: 'nowrap', opacity: 0.8,
      }}>
        {data.label} · {data.sublabel}
      </div>

      {/* ReactFlow-Handles — einer pro aktivem Port */}
      {PORT_CFGS.map(pc => {
        const posMap = {
          top: Position.Top, bottom: Position.Bottom,
          left: Position.Left, right: Position.Right,
        } as const;
        return (
          <Handle
            key={pc.port}
            type="source"
            position={posMap[pc.side]}
            id={`port-${pc.port}`}
            style={swHandleStyle(pc)}
          />
        );
      })}
    </div>
  );
}

// ── ReactFlow Node-Typen ──────────────────────────────────────
const NODE_TYPES = { device: DeviceNode, switch: SwitchNode };

// ── Basis-Nodes (feste Positionen) ───────────────────────────
const BASE_NODES: Node[] = [
  { id: 'wan',  type: 'device', position: { x: 582, y: -48 }, data: { label: 'Internet', shape: 'cloud', vlan: 0 } },
  { id: 'router', type: 'device', position: { x: 548, y: 62 },  data: { label: 'Router', sublabel: '192.168.0.1', shape: 'router', vlan: 99 } },
  { id: 'sw1',  type: 'switch', position: { x: 410, y: 210 }, data: { label: 'SW1', sublabel: '24-Port L2 Managed' } },
  // Server (oben links / rechts)
  { id: 'srv1', type: 'device', position: { x: 90,  y: 62 },  data: { label: 'Server 1', sublabel: '10.0.20.1', shape: 'server', vlan: 20 } },
  { id: 'srv2', type: 'device', position: { x: 1020, y: 62 }, data: { label: 'Server 2', sublabel: '10.0.20.2', shape: 'server', vlan: 20 } },
  // Mgmt-PC (Mitte-unten)
  { id: 'mgmt', type: 'device', position: { x: 582, y: 395 }, data: { label: 'Mgmt-PC', sublabel: '10.0.10.1', shape: 'pc', vlan: 10 } },
  // Access Points (links / rechts)
  { id: 'ap1',  type: 'device', position: { x: 128, y: 368 }, data: { label: 'AP 1', sublabel: '10.0.10.10', shape: 'ap', vlan: 40 } },
  { id: 'ap2',  type: 'device', position: { x: 1020, y: 368 }, data: { label: 'AP 2', sublabel: '10.0.10.11', shape: 'ap', vlan: 40 } },
  // Wired PCs (unten)
  { id: 'pc1',  type: 'device', position: { x:  58, y: 530 }, data: { label: 'PC 1', sublabel: '10.0.30.1', shape: 'pc', vlan: 30 } },
  { id: 'pc2',  type: 'device', position: { x: 198, y: 530 }, data: { label: 'PC 2', sublabel: '10.0.30.2', shape: 'pc', vlan: 30 } },
  { id: 'pc3',  type: 'device', position: { x: 338, y: 530 }, data: { label: 'PC 3', sublabel: '10.0.30.3', shape: 'pc', vlan: 30 } },
  { id: 'pc4',  type: 'device', position: { x: 612, y: 530 }, data: { label: 'PC 4', sublabel: '10.0.30.4', shape: 'pc', vlan: 30 } },
  { id: 'pc5',  type: 'device', position: { x: 752, y: 530 }, data: { label: 'PC 5', sublabel: '10.0.30.5', shape: 'pc', vlan: 30 } },
  { id: 'pc6',  type: 'device', position: { x: 892, y: 530 }, data: { label: 'PC 6', sublabel: '10.0.30.6', shape: 'pc', vlan: 30 } },
  // WiFi-Clients
  { id: 'wc1',  type: 'device', position: { x:  25, y: 455 }, data: { label: 'WiFi 1', sublabel: '10.0.40.1', shape: 'pc', vlan: 40 } },
  { id: 'wc2',  type: 'device', position: { x: 185, y: 462 }, data: { label: 'WiFi 2', sublabel: '10.0.40.2', shape: 'pc', vlan: 40 } },
  { id: 'wc3',  type: 'device', position: { x: 968, y: 455 }, data: { label: 'WiFi 3', sublabel: '10.0.40.3', shape: 'pc', vlan: 40 } },
  { id: 'wc4',  type: 'device', position: { x: 1128, y: 462 }, data: { label: 'WiFi 4', sublabel: '10.0.40.4', shape: 'pc', vlan: 40 } },
];

// ── Basis-Edges ───────────────────────────────────────────────
type RawEdge = Edge & {
  vlan: number;
  isTrunk?: boolean;
  isWireless?: boolean;
  info: string;
};

const BASE_EDGES: RawEdge[] = [
  // Router ↔ WAN
  { id: 'e-r-wan',  source: 'router', sourceHandle: 'wan-out',   target: 'wan',    targetHandle: 'input',     vlan: 0,  info: 'WAN-Uplink' },
  // Switch → Router (Trunk, alle VLANs)
  { id: 'e-sw-r',   source: 'sw1',    sourceHandle: 'port-24',   target: 'router', targetHandle: 'switch-in', vlan: 99, isTrunk: true, info: 'Trunk P24 · Tagged 10,20,30,40 · Native VLAN 99' },
  // Switch → Server 1/2 (Access VLAN 20)
  { id: 'e-sw-s1',  source: 'sw1',    sourceHandle: 'port-2',    target: 'srv1',   targetHandle: 'input',     vlan: 20, info: 'Access P2 · VLAN 20 · Untagged' },
  { id: 'e-sw-s2',  source: 'sw1',    sourceHandle: 'port-3',    target: 'srv2',   targetHandle: 'input',     vlan: 20, info: 'Access P3 · VLAN 20 · Untagged' },
  // Switch → Mgmt-PC (Access VLAN 10)
  { id: 'e-sw-m',   source: 'sw1',    sourceHandle: 'port-1',    target: 'mgmt',   targetHandle: 'input',     vlan: 10, info: 'Access P1 · VLAN 10 · Untagged' },
  // Switch → AP 1/2 (Trunk VLAN 10+40)
  { id: 'e-sw-a1',  source: 'sw1',    sourceHandle: 'port-21',   target: 'ap1',    targetHandle: 'input',     vlan: 40, isTrunk: true, info: 'Trunk P21 · Tagged VLAN 40 + Untagged VLAN 10' },
  { id: 'e-sw-a2',  source: 'sw1',    sourceHandle: 'port-22',   target: 'ap2',    targetHandle: 'input',     vlan: 40, isTrunk: true, info: 'Trunk P22 · Tagged VLAN 40 + Untagged VLAN 10' },
  // Switch → PCs (Access VLAN 30)
  { id: 'e-sw-p1',  source: 'sw1',    sourceHandle: 'port-4',    target: 'pc1',    targetHandle: 'input',     vlan: 30, info: 'Access P4 · VLAN 30 · Untagged' },
  { id: 'e-sw-p2',  source: 'sw1',    sourceHandle: 'port-5',    target: 'pc2',    targetHandle: 'input',     vlan: 30, info: 'Access P5 · VLAN 30 · Untagged' },
  { id: 'e-sw-p3',  source: 'sw1',    sourceHandle: 'port-6',    target: 'pc3',    targetHandle: 'input',     vlan: 30, info: 'Access P6 · VLAN 30 · Untagged' },
  { id: 'e-sw-p4',  source: 'sw1',    sourceHandle: 'port-7',    target: 'pc4',    targetHandle: 'input',     vlan: 30, info: 'Access P7 · VLAN 30 · Untagged' },
  { id: 'e-sw-p5',  source: 'sw1',    sourceHandle: 'port-8',    target: 'pc5',    targetHandle: 'input',     vlan: 30, info: 'Access P8 · VLAN 30 · Untagged' },
  { id: 'e-sw-p6',  source: 'sw1',    sourceHandle: 'port-9',    target: 'pc6',    targetHandle: 'input',     vlan: 30, info: 'Access P9 · VLAN 30 · Untagged' },
  // AP 1 → WiFi-Clients (wireless)
  { id: 'e-a1-w1',  source: 'ap1',    sourceHandle: 'wifi-out',  target: 'wc1',    targetHandle: 'input',     vlan: 40, isWireless: true, info: 'WiFi · SSID Corp-WLAN · VLAN 40' },
  { id: 'e-a1-w2',  source: 'ap1',    sourceHandle: 'wifi-out',  target: 'wc2',    targetHandle: 'input',     vlan: 40, isWireless: true, info: 'WiFi · SSID Corp-WLAN · VLAN 40' },
  // AP 2 → WiFi-Clients (wireless)
  { id: 'e-a2-w3',  source: 'ap2',    sourceHandle: 'wifi-out',  target: 'wc3',    targetHandle: 'input',     vlan: 40, isWireless: true, info: 'WiFi · SSID Corp-WLAN · VLAN 40' },
  { id: 'e-a2-w4',  source: 'ap2',    sourceHandle: 'wifi-out',  target: 'wc4',    targetHandle: 'input',     vlan: 40, isWireless: true, info: 'WiFi · SSID Corp-WLAN · VLAN 40' },
];

// ── Hauptkomponente ───────────────────────────────────────────
interface Props {
  dark?: boolean;
  onClose?: () => void;
}

export function VlanNetworkVisualizer({ onClose }: Props) {
  const [selectedVlan, setSelectedVlan] = useState<number | null>(null);
  const [animating, setAnimating]       = useState(true);
  const [hoveredEdge, setHoveredEdge]   = useState<RawEdge | null>(null);

  // Edges mit VLAN-Farben und Filterung
  const styledEdges = useMemo((): Edge[] =>
    BASE_EDGES.map(e => {
      const active =
        selectedVlan === null ||
        e.vlan === selectedVlan ||
        (e.isTrunk && selectedVlan !== null);
      const color = e.vlan === 0 ? '#888' : vc(e.vlan);
      return {
        ...e,
        animated: animating && active && !e.isWireless,
        type: 'smoothstep',
        style: {
          stroke:       active ? color : '#1e2a3a',
          strokeWidth:  e.isTrunk ? 3 : e.isWireless ? 1.5 : 2,
          strokeDasharray: e.isWireless ? '6,4' : undefined,
          opacity:      active ? 1 : 0.08,
          cursor:       'pointer',
        },
      } as unknown as Edge;
    }), [selectedVlan, animating]);

  // Nodes mit Opazität je nach VLAN-Filter
  const styledNodes = useMemo((): Node[] =>
    BASE_NODES.map(n => {
      if (n.id === 'wan' || n.id === 'router' || n.id === 'sw1') return n;
      if (selectedVlan === null) return n;
      const vlan = (n.data as DeviceData).vlan;
      // APs erscheinen bei VLAN 10 und 40 (Trunk trägt beide)
      const isAP = n.id === 'ap1' || n.id === 'ap2';
      const active = vlan === selectedVlan || (isAP && (selectedVlan === 10 || selectedVlan === 40));
      return { ...n, style: { opacity: active ? 1 : 0.18 } };
    }), [selectedVlan]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#050815' }}
      role="dialog"
      aria-label="VLAN Netzwerk Visualizer"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0 gap-2"
        style={{ background: '#0a0e27', borderBottom: '1px solid #1a2040' }}
      >
        <span
          className="text-sm font-bold font-mono flex-shrink-0"
          style={{ color: '#00d4ff', textShadow: '0 0 8px #00d4ff' }}
        >
          VLAN Netzwerk
        </span>

        {/* VLAN-Filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setSelectedVlan(null)}
            className="px-2 py-0.5 rounded text-xs font-mono transition-all"
            style={{
              background: selectedVlan === null ? '#1a2040' : 'transparent',
              color: selectedVlan === null ? '#fff' : '#555',
              border: `1px solid ${selectedVlan === null ? '#00d4ff' : '#1a2040'}`,
            }}
          >Alle</button>
          {VLANS.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVlan(selectedVlan === v.id ? null : v.id)}
              className="px-2 py-0.5 rounded text-xs font-mono transition-all"
              style={{
                background: selectedVlan === v.id ? vc(v.id) + '22' : 'transparent',
                color: selectedVlan === v.id ? vc(v.id) : '#555',
                border: `1px solid ${selectedVlan === v.id ? vc(v.id) : '#1a2040'}`,
              }}
              title={v.name}
            >{v.label}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setAnimating(a => !a)}
            className="px-3 py-1 rounded text-xs font-mono"
            style={{
              background: '#1a2040',
              color: animating ? '#00d4ff' : '#10b981',
              border: `1px solid ${animating ? '#00d4ff' : '#10b981'}`,
            }}
            aria-label={animating ? 'Pause' : 'Play'}
          >{animating ? '⏸ Pause' : '▶ Play'}</button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 rounded text-xs font-mono"
              style={{ background: '#ff000022', color: '#ff6b6b', border: '1px solid #ff000044' }}
              aria-label="Schließen"
            >✕</button>
          )}
        </div>
      </div>

      {/* ── ReactFlow Canvas ── */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={styledNodes}
          edges={styledEdges}
          nodeTypes={NODE_TYPES}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          style={{ background: '#0a0e27' }}
          onEdgeMouseEnter={(_, edge) => setHoveredEdge(edge as unknown as RawEdge)}
          onEdgeMouseLeave={() => setHoveredEdge(null)}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Lines}
            gap={40}
            color="#1a2040"
            style={{ opacity: 0.5 }}
          />
          <Controls
            style={{ background: '#0d1230', border: '1px solid #1a2040' }}
            showInteractive={false}
          />
        </ReactFlow>
      </div>

      {/* ── Info-Leiste (Hover) ── */}
      <div
        className="flex-shrink-0 px-4 py-1.5 text-xs font-mono flex items-center gap-3"
        style={{ background: '#0a0e27', borderTop: '1px solid #1a2040', minHeight: 32 }}
      >
        {hoveredEdge ? (
          <>
            <span style={{ color: hoveredEdge.isTrunk ? '#ff00ff' : vc(hoveredEdge.vlan) }}>
              {hoveredEdge.isTrunk ? '🏷 Tagged Trunk' : hoveredEdge.isWireless ? '📶 Wireless' : '📋 Access (Untagged)'}
            </span>
            <span style={{ color: '#88ccff' }}>{hoveredEdge.info}</span>
          </>
        ) : (
          <span style={{ color: '#333' }}>
            Hover über eine Verbindung für Details · Klicke VLAN-Filter zum Hervorheben
          </span>
        )}
        {/* Legende */}
        <div className="ml-auto flex gap-3 items-center" style={{ color: '#333' }}>
          <span>━━ Trunk</span>
          <span>── Access</span>
          <span>╌╌ Wireless</span>
        </div>
      </div>
    </div>
  );
}

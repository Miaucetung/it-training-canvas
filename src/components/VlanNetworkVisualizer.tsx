// ============================================================
// VlanNetworkVisualizer — VLAN Netzwerk Topologie (Neon/Cyberpunk)
// SVG-basiert, animierte Pakete, 5 VLANs, Router + 24-Port-Switch
// ============================================================

import { useEffect, useRef, useState } from "react";

// ── Konstanten ───────────────────────────────────────────────
const SVG_W = 960;
const SVG_H = 620;
const PACKET_R = 5;
const GLOW_BLUR = 8;

// VLAN-Definitionen: ID, Name, Farbe, Beschreibung
const VLANS = [
  {
    id: 10,
    label: "VLAN 10",
    name: "Management",
    color: "#00d4ff",
    desc: "Access: Mgmt-PC (Port 1) · Trunk: Router, APs",
  },
  {
    id: 20,
    label: "VLAN 20",
    name: "Server",
    color: "#10b981",
    desc: "Access: Server 1 & 2 (Ports 2–3) · Trunk: Router",
  },
  {
    id: 30,
    label: "VLAN 30",
    name: "Clients",
    color: "#6366f1",
    desc: "Access: PC 1–6 (Ports 4–9) · Trunk: Router",
  },
  {
    id: 40,
    label: "VLAN 40",
    name: "WLAN",
    color: "#f97316",
    desc: "Tagged: APs (Ports 21–22) · WiFi-Clients",
  },
  {
    id: 99,
    label: "VLAN 99",
    name: "Native",
    color: "#ff00ff",
    desc: "Native VLAN auf Trunk-Links (untagged Mgmt-Frames)",
  },
];

// Hilfsfunktion: VLAN-Farbe anhand ID
const vlanColor = (id: number): string =>
  VLANS.find((v) => v.id === id)?.color ?? "#444";

// ── Topologie-Nodes ──────────────────────────────────────────
interface Node {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  shape: "router" | "switch" | "server" | "pc" | "ap" | "cloud";
  vlan: number;
  detail: string;
}

const NODES: Node[] = [
  // Internet / WAN
  {
    id: "wan",
    label: "Internet",
    x: 480,
    y: 32,
    shape: "cloud",
    vlan: 0,
    detail: "WAN-Uplink / ISP-Anschluss",
  },
  // Router (Layer-3-Gerät, Router-on-a-Stick)
  {
    id: "router",
    label: "Router",
    sublabel: "192.168.0.1",
    x: 480,
    y: 110,
    shape: "router",
    vlan: 99,
    detail:
      "Router-on-a-Stick · Subinterfaces g0/0.10–.40 · encapsulation dot1q · Trunk zum Switch (Port 24)",
  },
  // Core Switch
  {
    id: "sw1",
    label: "SW1",
    sublabel: "24-Port L2 Managed",
    x: 480,
    y: 245,
    shape: "switch",
    vlan: 99,
    detail:
      "24-Port Layer-2 Managed Switch · Ports 1–23 Access/Trunk · Port 24: Trunk zum Router (alle VLANs erlaubt)",
  },
  // Server
  {
    id: "srv1",
    label: "Server 1",
    sublabel: "10.0.20.1",
    x: 160,
    y: 155,
    shape: "server",
    vlan: 20,
    detail: "VLAN 20 (Server) · Access Port, untagged · Port 2 am Switch",
  },
  {
    id: "srv2",
    label: "Server 2",
    sublabel: "10.0.20.2",
    x: 800,
    y: 155,
    shape: "server",
    vlan: 20,
    detail: "VLAN 20 (Server) · Access Port, untagged · Port 3 am Switch",
  },
  // Mgmt PC
  {
    id: "mgmt",
    label: "Mgmt-PC",
    sublabel: "10.0.10.1",
    x: 480,
    y: 350,
    shape: "pc",
    vlan: 10,
    detail: "VLAN 10 (Management) · Access Port, untagged · Port 1 am Switch",
  },
  // Access Points
  {
    id: "ap1",
    label: "AP 1",
    sublabel: "10.0.10.10",
    x: 200,
    y: 370,
    shape: "ap",
    vlan: 40,
    detail:
      "Trunk Port (Ports 21) · Tagged VLAN 40 (WLAN) + VLAN 10 (Mgmt) · SSID: Corp-WLAN",
  },
  {
    id: "ap2",
    label: "AP 2",
    sublabel: "10.0.10.11",
    x: 760,
    y: 370,
    shape: "ap",
    vlan: 40,
    detail:
      "Trunk Port (Port 22) · Tagged VLAN 40 (WLAN) + VLAN 10 (Mgmt) · SSID: Corp-WLAN",
  },
  // Wired PCs (VLAN 30)
  {
    id: "pc1",
    label: "PC 1",
    sublabel: "10.0.30.1",
    x: 60,
    y: 520,
    shape: "pc",
    vlan: 30,
    detail: "VLAN 30 (Clients) · Access Port, untagged · Port 4",
  },
  {
    id: "pc2",
    label: "PC 2",
    sublabel: "10.0.30.2",
    x: 190,
    y: 520,
    shape: "pc",
    vlan: 30,
    detail: "VLAN 30 (Clients) · Access Port, untagged · Port 5",
  },
  {
    id: "pc3",
    label: "PC 3",
    sublabel: "10.0.30.3",
    x: 320,
    y: 520,
    shape: "pc",
    vlan: 30,
    detail: "VLAN 30 (Clients) · Access Port, untagged · Port 6",
  },
  {
    id: "pc4",
    label: "PC 4",
    sublabel: "10.0.30.4",
    x: 640,
    y: 520,
    shape: "pc",
    vlan: 30,
    detail: "VLAN 30 (Clients) · Access Port, untagged · Port 7",
  },
  {
    id: "pc5",
    label: "PC 5",
    sublabel: "10.0.30.5",
    x: 770,
    y: 520,
    shape: "pc",
    vlan: 30,
    detail: "VLAN 30 (Clients) · Access Port, untagged · Port 8",
  },
  {
    id: "pc6",
    label: "PC 6",
    sublabel: "10.0.30.6",
    x: 900,
    y: 520,
    shape: "pc",
    vlan: 30,
    detail: "VLAN 30 (Clients) · Access Port, untagged · Port 9",
  },
  // WiFi Clients (VLAN 40)
  {
    id: "wc1",
    label: "WiFi 1",
    sublabel: "10.0.40.1",
    x: 90,
    y: 445,
    shape: "pc",
    vlan: 40,
    detail: "VLAN 40 (WLAN) · WiFi-Client via AP 1",
  },
  {
    id: "wc2",
    label: "WiFi 2",
    sublabel: "10.0.40.2",
    x: 200,
    y: 465,
    shape: "pc",
    vlan: 40,
    detail: "VLAN 40 (WLAN) · WiFi-Client via AP 1",
  },
  {
    id: "wc3",
    label: "WiFi 3",
    sublabel: "10.0.40.3",
    x: 760,
    y: 465,
    shape: "pc",
    vlan: 40,
    detail: "VLAN 40 (WLAN) · WiFi-Client via AP 2",
  },
  {
    id: "wc4",
    label: "WiFi 4",
    sublabel: "10.0.40.4",
    x: 880,
    y: 445,
    shape: "pc",
    vlan: 40,
    detail: "VLAN 40 (WLAN) · WiFi-Client via AP 2",
  },
];

// ── Kanten (Edges) ────────────────────────────────────────────
interface Edge {
  id: string;
  from: string;
  to: string;
  type: "trunk" | "access" | "wireless" | "wan";
  vlan: number; // Haupt-VLAN (für Farbe / Filter)
  vlans?: number[]; // Alle VLANs auf Trunk
  label?: string;
  tagged: boolean;
}

const EDGES: Edge[] = [
  // WAN → Router
  {
    id: "e-wan-r",
    from: "wan",
    to: "router",
    type: "wan",
    vlan: 0,
    tagged: false,
    label: "WAN-Uplink",
  },
  // Router → Switch (Trunk, alle VLANs)
  {
    id: "e-r-sw",
    from: "router",
    to: "sw1",
    type: "trunk",
    vlan: 99,
    tagged: true,
    vlans: [10, 20, 30, 40, 99],
    label: "Trunk · Port 24 · Tagged 10,20,30,40 · Native 99",
  },
  // Switch → Server1/2 (Access VLAN 20)
  {
    id: "e-sw-s1",
    from: "sw1",
    to: "srv1",
    type: "access",
    vlan: 20,
    tagged: false,
    label: "Access VLAN 20 · Port 2 · Untagged",
  },
  {
    id: "e-sw-s2",
    from: "sw1",
    to: "srv2",
    type: "access",
    vlan: 20,
    tagged: false,
    label: "Access VLAN 20 · Port 3 · Untagged",
  },
  // Switch → Mgmt-PC (Access VLAN 10)
  {
    id: "e-sw-mgmt",
    from: "sw1",
    to: "mgmt",
    type: "access",
    vlan: 10,
    tagged: false,
    label: "Access VLAN 10 · Port 1 · Untagged",
  },
  // Switch → AP1/AP2 (Trunk: VLAN 10 + 40)
  {
    id: "e-sw-ap1",
    from: "sw1",
    to: "ap1",
    type: "trunk",
    vlan: 40,
    tagged: true,
    vlans: [10, 40],
    label: "Trunk · Port 21 · Tagged 40, Untagged 10",
  },
  {
    id: "e-sw-ap2",
    from: "sw1",
    to: "ap2",
    type: "trunk",
    vlan: 40,
    tagged: true,
    vlans: [10, 40],
    label: "Trunk · Port 22 · Tagged 40, Untagged 10",
  },
  // Switch → Wired PCs (Access VLAN 30)
  {
    id: "e-sw-pc1",
    from: "sw1",
    to: "pc1",
    type: "access",
    vlan: 30,
    tagged: false,
    label: "Access VLAN 30 · Port 4",
  },
  {
    id: "e-sw-pc2",
    from: "sw1",
    to: "pc2",
    type: "access",
    vlan: 30,
    tagged: false,
    label: "Access VLAN 30 · Port 5",
  },
  {
    id: "e-sw-pc3",
    from: "sw1",
    to: "pc3",
    type: "access",
    vlan: 30,
    tagged: false,
    label: "Access VLAN 30 · Port 6",
  },
  {
    id: "e-sw-pc4",
    from: "sw1",
    to: "pc4",
    type: "access",
    vlan: 30,
    tagged: false,
    label: "Access VLAN 30 · Port 7",
  },
  {
    id: "e-sw-pc5",
    from: "sw1",
    to: "pc5",
    type: "access",
    vlan: 30,
    tagged: false,
    label: "Access VLAN 30 · Port 8",
  },
  {
    id: "e-sw-pc6",
    from: "sw1",
    to: "pc6",
    type: "access",
    vlan: 30,
    tagged: false,
    label: "Access VLAN 30 · Port 9",
  },
  // AP1 → WiFi-Clients (wireless, VLAN 40)
  {
    id: "e-ap1-wc1",
    from: "ap1",
    to: "wc1",
    type: "wireless",
    vlan: 40,
    tagged: false,
    label: "WiFi · SSID Corp-WLAN · VLAN 40",
  },
  {
    id: "e-ap1-wc2",
    from: "ap1",
    to: "wc2",
    type: "wireless",
    vlan: 40,
    tagged: false,
    label: "WiFi · SSID Corp-WLAN · VLAN 40",
  },
  {
    id: "e-ap2-wc3",
    from: "ap2",
    to: "wc3",
    type: "wireless",
    vlan: 40,
    tagged: false,
    label: "WiFi · SSID Corp-WLAN · VLAN 40",
  },
  {
    id: "e-ap2-wc4",
    from: "ap2",
    to: "wc4",
    type: "wireless",
    vlan: 40,
    tagged: false,
    label: "WiFi · SSID Corp-WLAN · VLAN 40",
  },
];

// ── Paket-Animationen (Routen) ────────────────────────────────
interface PacketRoute {
  id: string;
  path: string[]; // Node-IDs in Reihenfolge
  vlan: number;
  delay: number; // Sekunden Verzögerung
  dur: number; // Animationsdauer in Sekunden
}

const PACKET_ROUTES: PacketRoute[] = [
  {
    id: "pkt-pc1-srv1",
    path: ["pc1", "sw1", "router", "sw1", "srv1"],
    vlan: 30,
    delay: 0,
    dur: 4,
  },
  {
    id: "pkt-pc3-wan",
    path: ["pc3", "sw1", "router", "wan"],
    vlan: 30,
    delay: 1.2,
    dur: 3.5,
  },
  {
    id: "pkt-wc1-srv2",
    path: ["wc1", "ap1", "sw1", "router", "sw1", "srv2"],
    vlan: 40,
    delay: 0.5,
    dur: 5,
  },
  { id: "pkt-mgmt-sw", path: ["mgmt", "sw1"], vlan: 10, delay: 2, dur: 2 },
  {
    id: "pkt-srv1-pc4",
    path: ["srv1", "sw1", "router", "sw1", "pc4"],
    vlan: 20,
    delay: 0.8,
    dur: 4.5,
  },
  {
    id: "pkt-wc3-srv1",
    path: ["wc3", "ap2", "sw1", "router", "sw1", "srv1"],
    vlan: 40,
    delay: 1.8,
    dur: 5.5,
  },
  {
    id: "pkt-pc5-wan",
    path: ["pc5", "sw1", "router", "wan"],
    vlan: 30,
    delay: 3,
    dur: 3.5,
  },
];

// ── Hilfsfunktionen ───────────────────────────────────────────
// Knotenposition anhand ID
const nodePos = (id: string): { x: number; y: number } => {
  const n = NODES.find((n) => n.id === id);
  return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
};

// SVG-Pfad für animateMotion aus Liste von Node-IDs
const buildMotionPath = (nodeIds: string[]): string => {
  const pts = nodeIds.map(nodePos);
  if (pts.length < 2) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
};

// ── Port-Daten für den Switch ─────────────────────────────────
interface SwitchPort {
  port: number;
  nodeId?: string;
  vlan: number;
  mode: "access" | "trunk" | "unused";
}

const SWITCH_PORTS: SwitchPort[] = [
  { port: 1, nodeId: "mgmt", vlan: 10, mode: "access" },
  { port: 2, nodeId: "srv1", vlan: 20, mode: "access" },
  { port: 3, nodeId: "srv2", vlan: 20, mode: "access" },
  { port: 4, nodeId: "pc1", vlan: 30, mode: "access" },
  { port: 5, nodeId: "pc2", vlan: 30, mode: "access" },
  { port: 6, nodeId: "pc3", vlan: 30, mode: "access" },
  { port: 7, nodeId: "pc4", vlan: 30, mode: "access" },
  { port: 8, nodeId: "pc5", vlan: 30, mode: "access" },
  { port: 9, nodeId: "pc6", vlan: 30, mode: "access" },
  { port: 10, vlan: 0, mode: "unused" },
  { port: 11, vlan: 0, mode: "unused" },
  { port: 12, vlan: 0, mode: "unused" },
  { port: 13, vlan: 0, mode: "unused" },
  { port: 14, vlan: 0, mode: "unused" },
  { port: 15, vlan: 0, mode: "unused" },
  { port: 16, vlan: 0, mode: "unused" },
  { port: 17, vlan: 0, mode: "unused" },
  { port: 18, vlan: 0, mode: "unused" },
  { port: 19, vlan: 0, mode: "unused" },
  { port: 20, vlan: 0, mode: "unused" },
  { port: 21, nodeId: "ap1", vlan: 40, mode: "trunk" },
  { port: 22, nodeId: "ap2", vlan: 40, mode: "trunk" },
  { port: 23, vlan: 0, mode: "unused" },
  { port: 24, nodeId: "router", vlan: 99, mode: "trunk" },
];

// ── Props ──────────────────────────────────────────────────────
interface VlanNetworkVisualizerProps {
  dark?: boolean;
  onClose?: () => void;
}

// ── Haupt-Komponente ──────────────────────────────────────────
export function VlanNetworkVisualizer({
  dark = true,
  onClose,
}: VlanNetworkVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [selectedVlan, setSelectedVlan] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<Edge | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Animationen pausieren / fortsetzen
  const togglePause = () => {
    if (!svgRef.current) return;
    if (paused) {
      svgRef.current.unpauseAnimations();
    } else {
      svgRef.current.pauseAnimations();
    }
    setPaused((p) => !p);
  };

  // Animationen zurücksetzen (Speed-Änderung oder Reset)
  const resetAnimations = () => {
    setPaused(false);
    setAnimKey((k) => k + 1);
  };

  // Nach Speed-Änderung Animationen neu starten
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.unpauseAnimations();
    }
  }, [animKey]);

  // Isometrische Segmentierungsfarbe für Kanten
  const edgeColor = (edge: Edge): string => {
    if (
      selectedVlan !== null &&
      edge.vlan !== selectedVlan &&
      !edge.vlans?.includes(selectedVlan)
    ) {
      return "#1e2a3a";
    }
    if (edge.type === "wan") return "#888";
    if (edge.type === "trunk") return "#ff00ff";
    return vlanColor(edge.vlan);
  };

  // Kanten-Opazität basierend auf Filter
  const edgeOpacity = (edge: Edge): number => {
    if (selectedVlan === null) return 1;
    const match =
      edge.vlan === selectedVlan || edge.vlans?.includes(selectedVlan);
    return match ? 1 : 0.12;
  };

  // Knoten-Opazität basierend auf Filter
  const nodeOpacity = (node: Node): number => {
    if (selectedVlan === null) return 1;
    if (node.vlan === 0) return 0.5; // WAN
    // APs und Router auf Trunk tragen alle VLANs
    if (node.id === "router" || node.id === "sw1") return 1;
    if (node.id === "ap1" || node.id === "ap2") {
      return selectedVlan === 10 || selectedVlan === 40 || selectedVlan === 99
        ? 1
        : 0.2;
    }
    return node.vlan === selectedVlan ? 1 : 0.2;
  };

  // Kanten zwischen zwei Nodes berechnen
  const getEdge = (fromId: string, toId: string): Edge | undefined =>
    EDGES.find(
      (e) =>
        (e.from === fromId && e.to === toId) ||
        (e.from === toId && e.to === fromId),
    );

  // Tooltip-Handler für SVG-Koordinaten
  const handleNodeMouseEnter = (
    e: React.MouseEvent<SVGElement>,
    node: Node,
  ) => {
    const rect = (
      e.currentTarget.closest("svg") as SVGSVGElement
    )?.getBoundingClientRect();
    const svgEl = e.currentTarget.closest("svg") as SVGSVGElement;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
    setHoveredNode(node);
    setHoveredEdge(null);
    setTooltip({ x: svgP.x, y: svgP.y - 12, text: node.detail });
    void rect;
  };

  const handleEdgeMouseEnter = (
    e: React.MouseEvent<SVGElement>,
    edge: Edge,
  ) => {
    const svgEl = e.currentTarget.closest("svg") as SVGSVGElement;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
    setHoveredEdge(edge);
    setHoveredNode(null);
    setTooltip({ x: svgP.x, y: svgP.y - 12, text: edge.label ?? "" });
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    setHoveredEdge(null);
    setTooltip(null);
  };

  // Gesamte Animationsdauer angepasst an Speed
  const animDur = (base: number) => `${(base / speed).toFixed(2)}s`;

  // ── Render ──────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#050815" }}
      role="dialog"
      aria-label="VLAN Netzwerk Visualizer"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ background: "#0a0e27", borderBottom: "1px solid #1a2040" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-base font-bold font-mono"
            style={{
              color: "#00d4ff",
              textShadow: `0 0 ${GLOW_BLUR}px #00d4ff`,
            }}
          >
            VLAN Netzwerk
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Router-on-a-Stick · 24-Port Managed Switch · 5 VLANs
          </span>
        </div>

        {/* Steuerung */}
        <div className="flex items-center gap-2">
          {/* VLAN-Filter */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setSelectedVlan(null)}
              className="px-2 py-0.5 rounded text-xs font-mono transition-all"
              style={{
                background: selectedVlan === null ? "#1a2040" : "transparent",
                color: selectedVlan === null ? "#fff" : "#666",
                border: "1px solid",
                borderColor: selectedVlan === null ? "#00d4ff" : "#1a2040",
              }}
              aria-label="Alle VLANs anzeigen"
            >
              Alle
            </button>
            {VLANS.map((v) => (
              <button
                key={v.id}
                onClick={() =>
                  setSelectedVlan(selectedVlan === v.id ? null : v.id)
                }
                className="px-2 py-0.5 rounded text-xs font-mono transition-all"
                style={{
                  background:
                    selectedVlan === v.id ? v.color + "33" : "transparent",
                  color: selectedVlan === v.id ? v.color : "#666",
                  border: "1px solid",
                  borderColor: selectedVlan === v.id ? v.color : "#1a2040",
                  textShadow:
                    selectedVlan === v.id ? `0 0 6px ${v.color}` : "none",
                }}
                aria-label={`Filter ${v.label}`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Speed */}
          <select
            value={speed}
            onChange={(e) => {
              setSpeed(Number(e.target.value));
              resetAnimations();
            }}
            className="text-xs font-mono rounded px-1 py-0.5"
            style={{
              background: "#1a2040",
              color: "#00d4ff",
              border: "1px solid #1a2040",
            }}
            aria-label="Animationsgeschwindigkeit"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>

          {/* Pause/Play */}
          {!prefersReducedMotion && (
            <button
              onClick={togglePause}
              className="px-3 py-1 rounded text-xs font-mono transition-all"
              style={{
                background: "#1a2040",
                color: paused ? "#10b981" : "#00d4ff",
                border: `1px solid ${paused ? "#10b981" : "#00d4ff"}`,
              }}
              aria-label={
                paused ? "Animation fortsetzen" : "Animation pausieren"
              }
            >
              {paused ? "▶ Play" : "⏸ Pause"}
            </button>
          )}

          {/* Reset */}
          <button
            onClick={resetAnimations}
            className="px-2 py-1 rounded text-xs font-mono transition-all"
            style={{
              background: "#1a2040",
              color: "#888",
              border: "1px solid #1a2040",
            }}
            aria-label="Animation zurücksetzen"
          >
            ↺ Reset
          </button>

          {/* Schließen */}
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 rounded text-xs font-mono ml-2"
              style={{
                background: "#ff000022",
                color: "#ff6b6b",
                border: "1px solid #ff000044",
              }}
              aria-label="Schließen"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── SVG Hauptfläche ── */}
      <div className="flex-1 overflow-hidden relative">
        <svg
          ref={svgRef}
          key={animKey}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full"
          style={{ background: "#0a0e27" }}
          aria-label="VLAN Netzwerk Topologie"
        >
          <defs>
            {/* Gitter-Hintergrundmuster */}
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1a2040"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Glow-Filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={GLOW_BLUR / 2} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="glow-strong"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation={GLOW_BLUR} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Paket-Trail-Marker pro VLAN */}
            {VLANS.map((v) => (
              <radialGradient
                key={v.id}
                id={`pkt-grad-${v.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor={v.color} stopOpacity="1" />
                <stop offset="100%" stopColor={v.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Gitter-Hintergrund */}
          <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

          {/* ── VLAN-Zonen (Hintergrundmarkierung) ── */}
          {/* VLAN 20 Server-Zone */}
          <rect
            x={110}
            y={115}
            width={130}
            height={75}
            rx={8}
            fill={vlanColor(20) + "08"}
            stroke={vlanColor(20) + "22"}
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          <rect
            x={720}
            y={115}
            width={130}
            height={75}
            rx={8}
            fill={vlanColor(20) + "08"}
            stroke={vlanColor(20) + "22"}
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          {/* VLAN 30 Client-Zone */}
          <rect
            x={30}
            y={490}
            width={350}
            height={80}
            rx={8}
            fill={vlanColor(30) + "08"}
            stroke={vlanColor(30) + "22"}
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          <rect
            x={600}
            y={490}
            width={350}
            height={80}
            rx={8}
            fill={vlanColor(30) + "08"}
            stroke={vlanColor(30) + "22"}
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          {/* VLAN 40 WLAN-Zone */}
          <rect
            x={50}
            y={415}
            width={270}
            height={115}
            rx={8}
            fill={vlanColor(40) + "06"}
            stroke={vlanColor(40) + "1a"}
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          <rect
            x={650}
            y={415}
            width={270}
            height={115}
            rx={8}
            fill={vlanColor(40) + "06"}
            stroke={vlanColor(40) + "1a"}
            strokeWidth={1}
            strokeDasharray="4,3"
          />

          {/* ── Kanten ── */}
          {EDGES.map((edge) => {
            const from = nodePos(edge.from);
            const to = nodePos(edge.to);
            const col = edgeColor(edge);
            const opacity = edgeOpacity(edge);
            const isHovered = hoveredEdge?.id === edge.id;
            const strokeW =
              edge.type === "trunk"
                ? 3.5
                : edge.type === "wan"
                  ? 2.5
                  : edge.type === "wireless"
                    ? 1.5
                    : 2;
            const dash =
              edge.type === "wireless"
                ? "6,4"
                : edge.type === "trunk"
                  ? "none"
                  : "none";

            return (
              <g key={edge.id}>
                {/* Glow-Unterebene für Trunk-Leitungen */}
                {edge.type === "trunk" && (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={col}
                    strokeWidth={strokeW + 4}
                    strokeOpacity={opacity * 0.2}
                    style={{ filter: `drop-shadow(0 0 6px ${col})` }}
                  />
                )}
                {/* Haupt-Linie */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isHovered ? "#fff" : col}
                  strokeWidth={isHovered ? strokeW + 1 : strokeW}
                  strokeOpacity={opacity}
                  strokeDasharray={dash}
                  style={{ cursor: "pointer", transition: "stroke 0.2s" }}
                  onMouseEnter={(e) => handleEdgeMouseEnter(e, edge)}
                  onMouseLeave={handleMouseLeave}
                />
                {/* Tagged-Markierung auf Trunk-Leitungen */}
                {edge.type === "trunk" && edge.vlans && opacity > 0.5 && (
                  <g>
                    {edge.vlans.map((vid, i) => {
                      const mx =
                        (from.x + to.x) / 2 +
                        (i - edge.vlans!.length / 2 + 0.5) * 14;
                      const my = (from.y + to.y) / 2;
                      return (
                        <circle
                          key={vid}
                          cx={mx}
                          cy={my}
                          r={5}
                          fill={vlanColor(vid)}
                          stroke="#0a0e27"
                          strokeWidth={1}
                          style={{
                            filter: `drop-shadow(0 0 4px ${vlanColor(vid)})`,
                          }}
                        />
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}

          {/* ── Paket-Animationen ── */}
          {!prefersReducedMotion &&
            PACKET_ROUTES.map((route) => {
              if (selectedVlan !== null && route.vlan !== selectedVlan)
                return null;
              const mPath = buildMotionPath(route.path);
              if (!mPath) return null;
              const col = vlanColor(route.vlan);
              return (
                <g key={route.id}>
                  {/* Trail-Partikel (3 versetzt) */}
                  {[0, 0.08, 0.16].map((trailOffset, ti) => (
                    <circle
                      key={ti}
                      r={PACKET_R - ti * 1.2}
                      fill={col}
                      opacity={1 - ti * 0.35}
                      style={{
                        filter:
                          ti === 0 ? `drop-shadow(0 0 6px ${col})` : "none",
                      }}
                    >
                      <animateMotion
                        dur={animDur(route.dur)}
                        begin={`${(route.delay / speed + trailOffset).toFixed(2)}s`}
                        repeatCount="indefinite"
                        calcMode="linear"
                        keyPoints={`${trailOffset};1`}
                        keyTimes={`${trailOffset};1`}
                      >
                        <mpath href={`#mp-${route.id}`} />
                      </animateMotion>
                    </circle>
                  ))}
                  {/* Unsichtbarer Pfad für mpath-Referenz */}
                  <path
                    id={`mp-${route.id}`}
                    d={mPath}
                    fill="none"
                    stroke="none"
                  />
                </g>
              );
            })}

          {/* ── Nodes ── */}
          {NODES.map((node) => {
            const isHovered = hoveredNode?.id === node.id;
            const opacity = nodeOpacity(node);
            const col = node.vlan > 0 ? vlanColor(node.vlan) : "#888";

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{
                  opacity,
                  cursor: "pointer",
                  transition: "opacity 0.3s",
                }}
                onMouseEnter={(e) => handleNodeMouseEnter(e, node)}
                onMouseLeave={handleMouseLeave}
                role="img"
                aria-label={`${node.label}: ${node.detail}`}
              >
                <NodeShape
                  shape={node.shape}
                  color={col}
                  hovered={isHovered}
                  isSwitch={node.id === "sw1"}
                  selectedVlan={selectedVlan}
                />
                {/* Label */}
                <text
                  y={nodeShapeRadius(node.shape) + 14}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="'JetBrains Mono', monospace"
                  fill={isHovered ? "#fff" : col}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 4px ${col})` : "none",
                  }}
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    y={nodeShapeRadius(node.shape) + 26}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily="monospace"
                    fill="#88ccff"
                    opacity={0.7}
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Tooltip ── */}
          {tooltip && (
            <TooltipBox x={tooltip.x} y={tooltip.y} text={tooltip.text} />
          )}
        </svg>
      </div>

      {/* ── Legende ── */}
      <div
        className="flex-shrink-0 px-4 py-2 flex flex-wrap gap-3 items-center text-xs font-mono"
        style={{ background: "#0a0e27", borderTop: "1px solid #1a2040" }}
      >
        <span style={{ color: "#88ccff" }}>VLANs:</span>
        {VLANS.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVlan(selectedVlan === v.id ? null : v.id)}
            className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-all"
            style={{
              background:
                selectedVlan === v.id ? v.color + "22" : "transparent",
              border: `1px solid ${selectedVlan === v.id ? v.color : "#1a2040"}`,
              color: selectedVlan === v.id ? v.color : "#aaa",
            }}
            title={v.desc}
            aria-label={`${v.label} ${v.name}: ${v.desc}`}
          >
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: v.color, boxShadow: `0 0 4px ${v.color}` }}
            />
            {v.label} <span className="opacity-60">{v.name}</span>
          </button>
        ))}
        <span className="ml-auto flex gap-3 text-gray-500">
          <span>━━ Trunk (Tagged)</span>
          <span>── Access (Untagged)</span>
          <span style={{ borderBottom: "1px dashed #666" }}>╌╌ Wireless</span>
        </span>
      </div>

      {/* ── Info-Panel (Hover-Details) ── */}
      {(hoveredNode || hoveredEdge) && (
        <div
          className="flex-shrink-0 px-4 py-2 text-xs font-mono"
          style={{
            background: "#0d1230",
            borderTop: "1px solid #1a2040",
            color: "#00d4ff",
          }}
        >
          {hoveredNode && (
            <span>
              <span style={{ color: vlanColor(hoveredNode.vlan) }}>
                ▶ {hoveredNode.label}
              </span>
              {" · "}
              {hoveredNode.detail}
            </span>
          )}
          {hoveredEdge && (
            <span>
              <span style={{ color: edgeColor(hoveredEdge) }}>
                {hoveredEdge.tagged ? "🏷 Tagged" : "📋 Untagged"}
              </span>
              {" · "}
              {hoveredEdge.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Hilfskomponente: Node-Shape ───────────────────────────────
function NodeShape({
  shape,
  color,
  hovered,
  isSwitch,
  selectedVlan,
}: {
  shape: Node["shape"];
  color: string;
  hovered: boolean;
  isSwitch?: boolean;
  selectedVlan: number | null;
}) {
  const glowFilter = hovered ? "url(#glow-strong)" : "url(#glow)";
  const fill = color + "22";
  const stroke = color;

  if (shape === "cloud") {
    return (
      <g filter={glowFilter}>
        <ellipse
          cx={0}
          cy={0}
          rx={28}
          ry={14}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <ellipse
          cx={-12}
          cy={-6}
          rx={12}
          ry={10}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <ellipse
          cx={12}
          cy={-6}
          rx={12}
          ry={10}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
        />
      </g>
    );
  }

  if (shape === "router") {
    return (
      <g filter={glowFilter}>
        <circle
          cx={0}
          cy={0}
          r={22}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        <circle
          cx={0}
          cy={0}
          r={22}
          fill="none"
          stroke={stroke}
          strokeWidth={hovered ? 3 : 2}
        />
        {/* Router-Symbol: Kreis mit Pfeilen */}
        <line
          x1={-10}
          y1={0}
          x2={10}
          y2={0}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <line
          x1={0}
          y1={-10}
          x2={0}
          y2={10}
          stroke={stroke}
          strokeWidth={1.5}
        />
        <polygon points="8,-4 12,0 8,4" fill={stroke} />
        <polygon points="-8,4 -12,0 -8,-4" fill={stroke} />
      </g>
    );
  }

  if (shape === "switch" && isSwitch) {
    // 24-Port Switch: breites Rechteck mit Port-Reihen
    const SW = 200;
    const SH = 48;
    return (
      <g filter={glowFilter} transform={`translate(${-SW / 2},${-SH / 2})`}>
        <rect
          width={SW}
          height={SH}
          rx={6}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        {/* Port-Reihen (2 × 12) */}
        {SWITCH_PORTS.map((p, i) => {
          const row = Math.floor(i / 12);
          const col = i % 12;
          const px = 12 + col * 15;
          const py = 10 + row * 16;
          let portColor = "#1e2a3a";
          if (p.mode === "trunk") portColor = "#ff00ff";
          else if (p.mode === "access") {
            if (selectedVlan !== null && p.vlan !== selectedVlan) {
              portColor = "#1e2a3a";
            } else {
              portColor = vlanColor(p.vlan);
            }
          }
          return (
            <rect
              key={p.port}
              x={px}
              y={py}
              width={10}
              height={10}
              rx={2}
              fill={portColor}
              stroke="#0a0e27"
              strokeWidth={0.5}
              opacity={p.mode === "unused" ? 0.3 : 1}
            />
          );
        })}
      </g>
    );
  }

  if (shape === "server") {
    return (
      <g filter={glowFilter}>
        <rect
          x={-18}
          y={-14}
          width={36}
          height={28}
          rx={4}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        <line
          x1={-12}
          y1={-6}
          x2={12}
          y2={-6}
          stroke={stroke}
          strokeWidth={1}
        />
        <line x1={-12} y1={0} x2={12} y2={0} stroke={stroke} strokeWidth={1} />
        <line x1={-12} y1={6} x2={12} y2={6} stroke={stroke} strokeWidth={1} />
        <circle cx={10} cy={-6} r={2} fill={stroke} />
        <circle cx={10} cy={0} r={2} fill={stroke} />
        <circle cx={10} cy={6} r={2} fill={stroke} />
      </g>
    );
  }

  if (shape === "ap") {
    return (
      <g filter={glowFilter}>
        <circle
          cx={0}
          cy={0}
          r={14}
          fill={fill}
          stroke={stroke}
          strokeWidth={2}
        />
        {/* WiFi-Bögen */}
        {[8, 14, 20].map((r, i) => (
          <path
            key={i}
            d={`M ${-r * 0.7} ${-r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.7} ${-r * 0.7}`}
            fill="none"
            stroke={stroke}
            strokeWidth={1.5}
            opacity={1 - i * 0.25}
          />
        ))}
        <circle cx={0} cy={0} r={3} fill={stroke} />
      </g>
    );
  }

  // PC (Standard)
  return (
    <g filter={glowFilter}>
      <rect
        x={-12}
        y={-10}
        width={24}
        height={16}
        rx={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <rect
        x={-4}
        y={6}
        width={8}
        height={4}
        rx={1}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
      />
      <rect x={-8} y={10} width={16} height={2} rx={1} fill={stroke} />
    </g>
  );
}

// Radius/Abstand für Label-Positionierung je Node-Shape
function nodeShapeRadius(shape: Node["shape"]): number {
  if (shape === "router") return 24;
  if (shape === "switch") return 28;
  if (shape === "server") return 16;
  if (shape === "ap") return 16;
  if (shape === "cloud") return 16;
  return 12; // pc
}

// ── Hilfskomponente: SVG-Tooltip ──────────────────────────────
function TooltipBox({ x, y, text }: { x: number; y: number; text: string }) {
  const maxW = 280;
  const lines = text.split(" · ");
  return (
    <g
      transform={`translate(${Math.min(x, SVG_W - maxW / 2 - 10)},${Math.max(y - lines.length * 14 - 8, 8)})`}
    >
      <rect
        x={-maxW / 2}
        y={0}
        width={maxW}
        height={lines.length * 14 + 10}
        rx={6}
        fill="#0d1230"
        stroke="#00d4ff"
        strokeWidth={1}
        opacity={0.95}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={16 + i * 14}
          textAnchor="middle"
          fontSize={10}
          fontFamily="monospace"
          fill={i === 0 ? "#00d4ff" : "#88ccff"}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/*
 * Verwendungsbeispiel in TopicDetailPanel.tsx:
 *
 * import { VlanNetworkVisualizer } from "./VlanNetworkVisualizer";
 *
 * {hasVlanNetwork && vlanNetworkOpen && (
 *   <VlanNetworkVisualizer dark={dark} onClose={() => setVlanNetworkOpen(false)} />
 * )}
 */

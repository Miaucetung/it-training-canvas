// ============================================================
// TopologieExplorerDialog — Interaktiver Topologie-Vergleich
// Visualisiert: Stern · Bus · Ring · Mesh · Baum · Linie · Hybrid
// SVG-Diagramme + animierter Paketfluss + Vor-/Nachteile.
// ============================================================

import { X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

type TopologyId = "stern" | "bus" | "ring" | "mesh" | "baum" | "linie" | "hybrid";

interface TopologyDef {
  id: TopologyId;
  label: string;
  short: string;
  pros: string[];
  cons: string[];
  examples: string[];
  failureBehavior: string;
}

const TOPOLOGIES: TopologyDef[] = [
  {
    id: "stern",
    label: "Stern",
    short: "Alle Geräte hängen an einem zentralen Switch.",
    pros: [
      "Einfache Fehlersuche (defekter Port = nur 1 Gerät betroffen)",
      "Leicht erweiterbar",
      "Heute Standard im Enterprise-LAN",
    ],
    cons: [
      "Single Point of Failure: zentraler Switch",
      "Mehr Kabel als bei Bus",
    ],
    examples: ["Ethernet-LAN", "WLAN mit zentralem AP"],
    failureBehavior: "Defekter Link betrifft nur ein Gerät — defekter Switch legt alle lahm.",
  },
  {
    id: "bus",
    label: "Bus",
    short: "Alle Geräte teilen sich ein gemeinsames Kabel.",
    pros: [
      "Sehr wenig Kabelmaterial",
      "Einfacher Aufbau",
    ],
    cons: [
      "Kabelbruch legt das gesamte Segment lahm",
      "Kollisionen bei vielen Teilnehmern (CSMA/CD)",
      "Schwierige Fehlersuche",
    ],
    examples: ["Klassisches 10Base2 (Coax)", "CAN-Bus im Fahrzeug"],
    failureBehavior: "Hauptkabel defekt = alle Geräte offline.",
  },
  {
    id: "ring",
    label: "Ring",
    short: "Geräte sind ringförmig verkettet, Daten kreisen oft per Token.",
    pros: [
      "Kollisionsfrei via Token-Passing",
      "Deterministische Latenz",
    ],
    cons: [
      "Ausfall eines Geräts kann Ring unterbrechen",
      "Erweiterung erfordert Ringöffnung",
    ],
    examples: ["Token Ring (Legacy)", "FDDI", "Industrie-Ring (ERPS)"],
    failureBehavior: "Single Ring: Bruch = Ausfall. Dual Ring: heilt sich selbst.",
  },
  {
    id: "mesh",
    label: "Mesh",
    short: "Jedes Gerät hat mehrere Verbindungen — ggf. zu jedem anderen.",
    pros: [
      "Sehr hohe Ausfallsicherheit / Redundanz",
      "Mehrere parallele Pfade verfügbar",
    ],
    cons: [
      "Sehr hoher Verkabelungsaufwand (n·(n-1)/2 Links bei Full-Mesh)",
      "Teuer in Material & Wartung",
    ],
    examples: ["WAN-Backbone (Partial-Mesh)", "WLAN-Mesh (Eero, Unifi)"],
    failureBehavior: "Einzelne Linkausfälle werden über alternative Pfade kompensiert.",
  },
  {
    id: "baum",
    label: "Baum",
    short: "Hierarchische Erweiterung mehrerer Stern-Topologien.",
    pros: [
      "Skaliert für große Netze (Core/Distribution/Access)",
      "Klare Struktur",
    ],
    cons: [
      "Ausfall eines Verteilerknotens isoliert ganze Zweige",
      "Höhere Komplexität",
    ],
    examples: ["Enterprise-Campus", "Cisco 3-Tier-Design"],
    failureBehavior: "Knoten weiter oben = mehr Geräte betroffen.",
  },
  {
    id: "linie",
    label: "Linie",
    short: "Daisy-Chain — Geräte hintereinander verkettet.",
    pros: [
      "Sehr wenig Kabel",
      "Geeignet für lineare Anlagen (Förderband, Tunnel)",
    ],
    cons: [
      "Bruch in der Mitte trennt das Netz in zwei Hälften",
      "Latenz steigt mit jeder Station",
    ],
    examples: ["Industrieanlagen (Feldbus)", "Daisy-Chained Switches"],
    failureBehavior: "Bruch = Netz in zwei Inseln aufgeteilt.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    short: "Kombination mehrerer Topologien — der Standard in der Praxis.",
    pros: [
      "Kombiniert Vorteile (Skalierbarkeit + Ausfallsicherheit)",
      "Anpassbar an reale Anforderungen",
    ],
    cons: [
      "Komplexere Planung & Dokumentation",
      "Vermischte Fehlerbilder",
    ],
    examples: ["Campus-Netz (Stern + Mesh-Backbone)", "Internet"],
    failureBehavior: "Abhängig vom betroffenen Teilbereich.",
  },
];

// ── SVG-Renderer ────────────────────────────────────────────
const W = 360;
const H = 240;
const CX = W / 2;
const CY = H / 2;
const NODE_R = 14;

function nodePositions(id: TopologyId, n = 6): { x: number; y: number }[] {
  switch (id) {
    case "stern": {
      // 1 center + n-1 around
      const ring = [];
      for (let i = 0; i < n - 1; i++) {
        const a = (i / (n - 1)) * Math.PI * 2 - Math.PI / 2;
        ring.push({ x: CX + Math.cos(a) * 85, y: CY + Math.sin(a) * 75 });
      }
      return [{ x: CX, y: CY }, ...ring];
    }
    case "bus":
    case "linie": {
      const pts = [];
      const step = (W - 60) / (n - 1);
      for (let i = 0; i < n; i++) pts.push({ x: 30 + i * step, y: CY });
      return pts;
    }
    case "ring": {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: CX + Math.cos(a) * 85, y: CY + Math.sin(a) * 75 });
      }
      return pts;
    }
    case "mesh": {
      const pts = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: CX + Math.cos(a) * 85, y: CY + Math.sin(a) * 75 });
      }
      return pts;
    }
    case "baum": {
      // root, 2 mids, 3 leaves
      return [
        { x: CX, y: 30 },
        { x: CX - 80, y: 110 },
        { x: CX + 80, y: 110 },
        { x: CX - 110, y: 200 },
        { x: CX - 50, y: 200 },
        { x: CX + 80, y: 200 },
      ];
    }
    case "hybrid": {
      // 2 stars connected by a backbone
      return [
        { x: 90, y: CY },       // hub-left
        { x: 270, y: CY },      // hub-right
        { x: 30, y: 60 },
        { x: 30, y: 180 },
        { x: 330, y: 60 },
        { x: 330, y: 180 },
      ];
    }
  }
}

function edges(id: TopologyId, n = 6): [number, number][] {
  switch (id) {
    case "stern":
      return Array.from({ length: n - 1 }, (_, i) => [0, i + 1] as [number, number]);
    case "bus":
      // backbone line; visually represented by a horizontal bus + drop lines (drop lines are nodes themselves)
      return Array.from({ length: n - 1 }, (_, i) => [i, i + 1] as [number, number]);
    case "linie":
      return Array.from({ length: n - 1 }, (_, i) => [i, i + 1] as [number, number]);
    case "ring": {
      const e: [number, number][] = [];
      for (let i = 0; i < n; i++) e.push([i, (i + 1) % n]);
      return e;
    }
    case "mesh": {
      const e: [number, number][] = [];
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) e.push([i, j]);
      return e;
    }
    case "baum":
      return [
        [0, 1], [0, 2],
        [1, 3], [1, 4], [2, 5],
      ];
    case "hybrid":
      return [
        [0, 1],          // backbone
        [0, 2], [0, 3],  // left star
        [1, 4], [1, 5],  // right star
      ];
  }
}

function TopologyDiagram({
  id,
  dark,
  failedEdge,
}: {
  id: TopologyId;
  dark: boolean;
  failedEdge: number | null;
}) {
  const pts = useMemo(() => nodePositions(id), [id]);
  const es = useMemo(() => edges(id), [id]);
  const stroke = dark ? "#94a3b8" : "#475569";
  const failColor = "#ef4444";
  const nodeFill = dark ? "#1e293b" : "#f1f5f9";
  const nodeStroke = dark ? "#60a5fa" : "#2563eb";
  const centerStroke = dark ? "#fbbf24" : "#d97706";

  // For animated packet flow we walk a path along edges 0..n
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setStep((s) => (s + 1) % es.length), 700);
    return () => window.clearInterval(t);
  }, [es.length]);

  const activeEdge = es[step] ?? null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      style={{ maxHeight: 260 }}
    >
      {/* Edges */}
      {es.map(([a, b], i) => {
        const broken = failedEdge === i;
        const active = !broken && activeEdge && activeEdge[0] === a && activeEdge[1] === b;
        return (
          <line
            key={i}
            x1={pts[a].x}
            y1={pts[a].y}
            x2={pts[b].x}
            y2={pts[b].y}
            stroke={broken ? failColor : active ? nodeStroke : stroke}
            strokeWidth={active ? 3 : broken ? 2 : 1.5}
            strokeDasharray={broken ? "4 4" : undefined}
            opacity={broken ? 0.7 : 1}
          />
        );
      })}
      {/* Animated packet */}
      {activeEdge && failedEdge !== step && (() => {
        const [a, b] = activeEdge;
        return (
          <circle
            cx={(pts[a].x + pts[b].x) / 2}
            cy={(pts[a].y + pts[b].y) / 2}
            r={5}
            fill={dark ? "#fde047" : "#eab308"}
          >
            <animate attributeName="r" values="4;7;4" dur="0.7s" repeatCount="indefinite" />
          </circle>
        );
      })()}
      {/* Nodes */}
      {pts.map((p, i) => {
        const isCenter = (id === "stern" && i === 0) || (id === "baum" && i === 0) || (id === "hybrid" && (i === 0 || i === 1));
        return (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isCenter ? NODE_R + 3 : NODE_R}
              fill={nodeFill}
              stroke={isCenter ? centerStroke : nodeStroke}
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize={10}
              fill={dark ? "#e2e8f0" : "#0f172a"}
              fontFamily="monospace"
            >
              {isCenter ? "SW" : i}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Main Dialog ─────────────────────────────────────────────
export function TopologieExplorerDialog({ dark, onClose }: Props) {
  const [selected, setSelected] = useState<TopologyId>("stern");
  const [failedEdge, setFailedEdge] = useState<number | null>(null);

  const def = TOPOLOGIES.find((t) => t.id === selected)!;
  const numEdges = edges(selected).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${
          dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}>
          <div>
            <h2 className="text-lg font-semibold">Topologie-Explorer</h2>
            <p className="text-xs opacity-70">
              Stern · Bus · Ring · Mesh · Baum · Linie · Hybrid — mit animiertem Paketfluss & Ausfallsimulation.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className={`p-2 rounded-lg hover:bg-slate-500/20`}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6 p-6">
          {/* Sidebar — topology list */}
          <div className="flex lg:flex-col flex-wrap gap-2">
            {TOPOLOGIES.map((t) => {
              const active = t.id === selected;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelected(t.id);
                    setFailedEdge(null);
                  }}
                  className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                    active
                      ? dark
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-100"
                        : "bg-cyan-50 border-cyan-300 text-cyan-900"
                      : dark
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{t.short}</div>
                </button>
              );
            })}
          </div>

          {/* Main area */}
          <div className="space-y-4">
            {/* Diagram */}
            <div className={`rounded-xl border p-4 ${
              dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"
            }`}>
              <TopologyDiagram id={selected} dark={dark} failedEdge={failedEdge} />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="opacity-70">Ausfallsimulation:</span>
                <button
                  onClick={() => setFailedEdge(null)}
                  className={`px-2 py-1 rounded border ${
                    failedEdge === null
                      ? dark ? "bg-emerald-500/30 border-emerald-500/50" : "bg-emerald-100 border-emerald-300"
                      : dark ? "border-slate-700 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  Alle Links OK
                </button>
                {Array.from({ length: numEdges }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setFailedEdge(i)}
                    className={`px-2 py-1 rounded border ${
                      failedEdge === i
                        ? "bg-red-500/30 border-red-500/50 text-red-100"
                        : dark ? "border-slate-700 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    Link {i + 1} ⚠
                  </button>
                ))}
              </div>
              {failedEdge !== null && (
                <p className={`mt-2 text-xs ${dark ? "text-red-300" : "text-red-600"}`}>
                  {def.failureBehavior}
                </p>
              )}
            </div>

            {/* Vor-/Nachteile */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className={`rounded-xl border p-4 ${
                dark ? "border-emerald-500/30 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"
              }`}>
                <div className={`text-sm font-semibold mb-2 ${dark ? "text-emerald-200" : "text-emerald-800"}`}>
                  Vorteile
                </div>
                <ul className="text-sm space-y-1">
                  {def.pros.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className={dark ? "text-emerald-400" : "text-emerald-600"}>+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-xl border p-4 ${
                dark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-200 bg-amber-50"
              }`}>
                <div className={`text-sm font-semibold mb-2 ${dark ? "text-amber-200" : "text-amber-800"}`}>
                  Nachteile
                </div>
                <ul className="text-sm space-y-1">
                  {def.cons.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className={dark ? "text-amber-400" : "text-amber-600"}>−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Einsatz */}
            <div className={`rounded-xl border p-4 ${
              dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"
            }`}>
              <div className="text-sm font-semibold mb-1">Typischer Einsatz</div>
              <div className="text-sm opacity-80">{def.examples.join(" · ")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

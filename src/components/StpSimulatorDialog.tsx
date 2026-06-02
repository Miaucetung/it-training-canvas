// ============================================================
// StpSimulatorDialog — Interaktiver Spanning-Tree-Simulator
// ----------------------------------------------------------
// Didaktische Visualisierung von STP (802.1D) & RSTP (802.1w):
//   • Root-Bridge-Wahl (Priority + MAC) live berechnet
//   • Port-Rollen (Root / Designated / Blocked) farblich markiert
//   • Konvergenz-Vergleich STP vs RSTP (50 s vs <1 s)
//   • Ausfallsimulation: Link kappen → Failover-Animation
//   • Port-State-Walk durch Blocking → Listening → Learning → Forwarding
// ============================================================

import { ArrowsClockwise, Lightning, Pause, Play, Shield, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

// ── Topologie: 4 Switches im Quadrat mit redundanten Links ───
// Indizes:
//   0 = SW1 (oben-links)   1 = SW2 (oben-rechts)
//   2 = SW3 (unten-links)  3 = SW4 (unten-rechts)
// Links: 0-1, 0-2, 1-3, 2-3, 0-3 (Diagonale)
interface SwitchDef {
  id: number;
  name: string;
  priority: number;
  mac: string; // last 4 hex chars for display
  x: number;
  y: number;
}

interface LinkDef {
  id: number;
  a: number; // switch index
  b: number;
  cost: number; // STP cost
  bandwidth: string;
}

const INITIAL_SWITCHES: SwitchDef[] = [
  { id: 0, name: "SW1", priority: 32768, mac: "0001", x: 130, y: 100 },
  { id: 1, name: "SW2", priority: 32768, mac: "0002", x: 470, y: 100 },
  { id: 2, name: "SW3", priority: 32768, mac: "0003", x: 130, y: 320 },
  { id: 3, name: "SW4", priority: 32768, mac: "0004", x: 470, y: 320 },
];

const LINKS: LinkDef[] = [
  { id: 0, a: 0, b: 1, cost: 4, bandwidth: "1 Gbit/s" },
  { id: 1, a: 0, b: 2, cost: 4, bandwidth: "1 Gbit/s" },
  { id: 2, a: 1, b: 3, cost: 4, bandwidth: "1 Gbit/s" },
  { id: 3, a: 2, b: 3, cost: 4, bandwidth: "1 Gbit/s" },
  { id: 4, a: 0, b: 3, cost: 19, bandwidth: "100 Mbit/s" }, // Diagonale, langsamer
];

// ── Berechnung: Root + Port-Rollen (BFS / Dijkstra-light) ─────
interface PortRole {
  linkId: number;
  switchId: number; // welcher Switch
  role: "root" | "designated" | "blocked";
}

interface StpResult {
  rootId: number;
  bridgeIds: { id: number; bridgeId: string }[];
  costToRoot: number[]; // pro switch
  portRoles: PortRole[];
}

function bridgeId(sw: SwitchDef): string {
  return `${sw.priority.toString().padStart(5, "0")}.${sw.mac}`;
}

function computeStp(
  switches: SwitchDef[],
  activeLinks: LinkDef[],
): StpResult {
  // 1. Root Bridge wählen: niedrigste Bridge-ID
  const bridgeIds = switches.map((s) => ({ id: s.id, bridgeId: bridgeId(s) }));
  const sorted = [...bridgeIds].sort((x, y) => x.bridgeId.localeCompare(y.bridgeId));
  const rootId = sorted[0].id;

  // 2. Cost-to-Root via Dijkstra
  const n = switches.length;
  const cost = Array(n).fill(Infinity);
  cost[rootId] = 0;
  const visited = new Set<number>();
  // adjacency
  const adj: { to: number; cost: number; linkId: number }[][] = Array.from({ length: n }, () => []);
  for (const l of activeLinks) {
    adj[l.a].push({ to: l.b, cost: l.cost, linkId: l.id });
    adj[l.b].push({ to: l.a, cost: l.cost, linkId: l.id });
  }
  while (visited.size < n) {
    // pick unvisited with min cost
    let u = -1;
    let best = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && cost[i] < best) {
        best = cost[i];
        u = i;
      }
    }
    if (u === -1) break;
    visited.add(u);
    for (const e of adj[u]) {
      if (cost[u] + e.cost < cost[e.to]) {
        cost[e.to] = cost[u] + e.cost;
      }
    }
  }

  // 3. Root Port pro Nicht-Root-Switch
  // = der eine eigene Port, dessen Nachbar (cost[nachbar] + linkcost) = cost[self] ist
  // Tiebreaker: niedrigere Bridge-ID des Nachbarn
  const rootPortLink: (number | null)[] = Array(n).fill(null);
  for (let i = 0; i < n; i++) {
    if (i === rootId) continue;
    let bestLink: { linkId: number; nbrBridgeId: string } | null = null;
    for (const e of adj[i]) {
      if (cost[e.to] + e.cost === cost[i]) {
        const nbrBid = bridgeIds[e.to].bridgeId;
        if (!bestLink || nbrBid < bestLink.nbrBridgeId) {
          bestLink = { linkId: e.linkId, nbrBridgeId: nbrBid };
        }
      }
    }
    rootPortLink[i] = bestLink ? bestLink.linkId : null;
  }

  // 4. Designated Port pro Link
  // = die Seite des Links, deren Switch näher (oder bei Gleichstand bessere Bridge-ID) zur Root steht
  const designatedSide = new Map<number, number>(); // linkId -> switchId
  for (const l of activeLinks) {
    let dp: number;
    if (cost[l.a] < cost[l.b]) dp = l.a;
    else if (cost[l.b] < cost[l.a]) dp = l.b;
    else {
      // gleichteuer → niedrigere Bridge-ID
      dp = bridgeIds[l.a].bridgeId < bridgeIds[l.b].bridgeId ? l.a : l.b;
    }
    designatedSide.set(l.id, dp);
  }

  // 5. Port-Rollen je (Switch, Link) bestimmen
  const portRoles: PortRole[] = [];
  for (const l of activeLinks) {
    for (const sw of [l.a, l.b]) {
      if (designatedSide.get(l.id) === sw) {
        portRoles.push({ linkId: l.id, switchId: sw, role: "designated" });
      } else if (rootPortLink[sw] === l.id) {
        portRoles.push({ linkId: l.id, switchId: sw, role: "root" });
      } else {
        portRoles.push({ linkId: l.id, switchId: sw, role: "blocked" });
      }
    }
  }

  return { rootId, bridgeIds, costToRoot: cost, portRoles };
}

// ── Tabs ──────────────────────────────────────────────────────
type TabId = "election" | "states" | "convergence" | "guards";

const TABS: { id: TabId; label: string; icon: typeof Lightning }[] = [
  { id: "election", label: "Root-Wahl & Port-Rollen", icon: Lightning },
  { id: "states", label: "Port-Zustände", icon: Play },
  { id: "convergence", label: "STP vs RSTP", icon: ArrowsClockwise },
  { id: "guards", label: "PortFast & BPDU Guard", icon: Shield },
];

// ════════════════════════════════════════════════════════════
// Tab 1: Election — interaktive Root-Wahl + Port-Rollen
// ════════════════════════════════════════════════════════════
function ElectionTab({ dark }: { dark: boolean }) {
  const [switches, setSwitches] = useState<SwitchDef[]>(INITIAL_SWITCHES);
  const [brokenLinks, setBrokenLinks] = useState<Set<number>>(new Set());

  const activeLinks = useMemo(
    () => LINKS.filter((l) => !brokenLinks.has(l.id)),
    [brokenLinks],
  );

  const result = useMemo(() => computeStp(switches, activeLinks), [switches, activeLinks]);

  const updatePriority = (id: number, priority: number) => {
    setSwitches((prev) => prev.map((s) => (s.id === id ? { ...s, priority } : s)));
  };

  const toggleLink = (id: number) => {
    setBrokenLinks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reset = () => {
    setSwitches(INITIAL_SWITCHES);
    setBrokenLinks(new Set());
  };

  const roleColor = (role: PortRole["role"]) =>
    role === "root" ? "#3b82f6" : role === "designated" ? "#10b981" : "#ef4444";
  const roleLabel = (role: PortRole["role"]) =>
    role === "root" ? "RP" : role === "designated" ? "DP" : "BLK";

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-5">
      {/* SVG-Diagramm */}
      <div
        className={`rounded-xl border p-4 ${
          dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"
        }`}
      >
        <svg viewBox="0 0 600 420" className="w-full h-auto" style={{ maxHeight: 460 }}>
          {/* Links */}
          {LINKS.map((l) => {
            const broken = brokenLinks.has(l.id);
            const sa = switches[l.a];
            const sb = switches[l.b];
            const roleA = result.portRoles.find(
              (p) => p.linkId === l.id && p.switchId === l.a,
            );
            const roleB = result.portRoles.find(
              (p) => p.linkId === l.id && p.switchId === l.b,
            );
            const stroke = broken
              ? "#6b7280"
              : roleA?.role === "blocked" || roleB?.role === "blocked"
                ? "#ef4444"
                : "#10b981";
            const midX = (sa.x + sb.x) / 2;
            const midY = (sa.y + sb.y) / 2;
            return (
              <g key={l.id}>
                <line
                  x1={sa.x}
                  y1={sa.y}
                  x2={sb.x}
                  y2={sb.y}
                  stroke={stroke}
                  strokeWidth={broken ? 2 : 3}
                  strokeDasharray={broken ? "6 6" : undefined}
                  opacity={broken ? 0.4 : 1}
                />
                {/* Port-Rolle bei A */}
                {roleA && !broken && (
                  <g>
                    <circle
                      cx={sa.x + (sb.x - sa.x) * 0.18}
                      cy={sa.y + (sb.y - sa.y) * 0.18}
                      r={11}
                      fill={roleColor(roleA.role)}
                    />
                    <text
                      x={sa.x + (sb.x - sa.x) * 0.18}
                      y={sa.y + (sb.y - sa.y) * 0.18 + 3}
                      textAnchor="middle"
                      fontSize={9}
                      fill="white"
                      fontWeight={700}
                      fontFamily="monospace"
                    >
                      {roleLabel(roleA.role)}
                    </text>
                  </g>
                )}
                {/* Port-Rolle bei B */}
                {roleB && !broken && (
                  <g>
                    <circle
                      cx={sb.x + (sa.x - sb.x) * 0.18}
                      cy={sb.y + (sa.y - sb.y) * 0.18}
                      r={11}
                      fill={roleColor(roleB.role)}
                    />
                    <text
                      x={sb.x + (sa.x - sb.x) * 0.18}
                      y={sb.y + (sa.y - sb.y) * 0.18 + 3}
                      textAnchor="middle"
                      fontSize={9}
                      fill="white"
                      fontWeight={700}
                      fontFamily="monospace"
                    >
                      {roleLabel(roleB.role)}
                    </text>
                  </g>
                )}
                {/* Cost-Label + Link-Toggle */}
                <g
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleLink(l.id)}
                >
                  <rect
                    x={midX - 28}
                    y={midY - 10}
                    width={56}
                    height={20}
                    rx={4}
                    fill={dark ? "#1e293b" : "#ffffff"}
                    stroke={broken ? "#6b7280" : "#94a3b8"}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill={broken ? "#9ca3af" : dark ? "#e2e8f0" : "#334155"}
                    fontFamily="monospace"
                  >
                    {broken ? "✕ down" : `cost ${l.cost}`}
                  </text>
                </g>
              </g>
            );
          })}
          {/* Switches */}
          {switches.map((sw) => {
            const isRoot = sw.id === result.rootId;
            return (
              <g key={sw.id}>
                <rect
                  x={sw.x - 50}
                  y={sw.y - 30}
                  width={100}
                  height={60}
                  rx={8}
                  fill={dark ? "#0f172a" : "#ffffff"}
                  stroke={isRoot ? "#facc15" : dark ? "#60a5fa" : "#2563eb"}
                  strokeWidth={isRoot ? 4 : 2}
                />
                {isRoot && (
                  <text
                    x={sw.x}
                    y={sw.y - 36}
                    textAnchor="middle"
                    fontSize={14}
                    fill="#facc15"
                    fontWeight={700}
                  >
                    👑 ROOT
                  </text>
                )}
                <text
                  x={sw.x}
                  y={sw.y - 8}
                  textAnchor="middle"
                  fontSize={15}
                  fontWeight={700}
                  fill={dark ? "#f1f5f9" : "#0f172a"}
                  fontFamily="monospace"
                >
                  {sw.name}
                </text>
                <text
                  x={sw.x}
                  y={sw.y + 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill={dark ? "#94a3b8" : "#475569"}
                  fontFamily="monospace"
                >
                  prio {sw.priority}
                </text>
                <text
                  x={sw.x}
                  y={sw.y + 22}
                  textAnchor="middle"
                  fontSize={9}
                  fill={dark ? "#64748b" : "#64748b"}
                  fontFamily="monospace"
                >
                  MAC ..{sw.mac} · cost→{result.costToRoot[sw.id]}
                </text>
              </g>
            );
          })}
          {/* Legende */}
          <g>
            <rect x={10} y={390} width={580} height={24} rx={4} fill={dark ? "#1e293b" : "#f1f5f9"} />
            <circle cx={28} cy={402} r={6} fill="#3b82f6" />
            <text x={40} y={406} fontSize={11} fill={dark ? "#e2e8f0" : "#334155"}>Root Port (RP)</text>
            <circle cx={148} cy={402} r={6} fill="#10b981" />
            <text x={160} y={406} fontSize={11} fill={dark ? "#e2e8f0" : "#334155"}>Designated Port (DP)</text>
            <circle cx={310} cy={402} r={6} fill="#ef4444" />
            <text x={322} y={406} fontSize={11} fill={dark ? "#e2e8f0" : "#334155"}>Blocked / Alternate</text>
            <text x={460} y={406} fontSize={10} fill={dark ? "#94a3b8" : "#64748b"} fontStyle="italic">
              Klick auf Cost-Label = Link aus
            </text>
          </g>
        </svg>
      </div>

      {/* Sidebar — Bridge Priority Editor */}
      <div className="space-y-3">
        <div
          className={`rounded-xl border p-4 ${
            dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-white"
          }`}
        >
          <div className="text-sm font-semibold mb-3">Bridge Priority pro Switch</div>
          <div className="space-y-2">
            {switches.map((sw) => (
              <div key={sw.id} className="flex items-center gap-2">
                <span className="text-xs font-mono w-12">{sw.name}</span>
                <select
                  value={sw.priority}
                  onChange={(e) => updatePriority(sw.id, Number(e.target.value))}
                  className={`flex-1 text-xs rounded px-2 py-1 border ${
                    dark
                      ? "bg-slate-900 border-slate-600 text-slate-100"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                >
                  {[4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {sw.id === result.rootId && (
                  <span className="text-yellow-500 text-sm">👑</span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={reset}
            className={`w-full mt-3 text-xs px-2 py-1.5 rounded border ${
              dark
                ? "border-slate-600 hover:bg-slate-700 text-slate-300"
                : "border-slate-300 hover:bg-slate-100 text-slate-700"
            }`}
          >
            ↺ Zurücksetzen
          </button>
        </div>

        <div
          className={`rounded-xl border p-4 text-xs space-y-1.5 ${
            dark
              ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-100"
              : "border-cyan-200 bg-cyan-50 text-cyan-900"
          }`}
        >
          <div className="font-semibold mb-1">💡 Beobachte</div>
          <p>1. Senke <code>SW3</code> auf <code>4096</code> → es wird Root.</p>
          <p>2. Bei Gleichstand entscheidet die <strong>MAC</strong>.</p>
          <p>3. Klick einen Link weg → Blocked-Port wird aktiv!</p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 2: Port-Zustände — STP-Sequenz mit Timer
// ════════════════════════════════════════════════════════════
type StpState = "disabled" | "blocking" | "listening" | "learning" | "forwarding";

const STP_SEQUENCE: { state: StpState; durationS: number; color: string; description: string }[] = [
  { state: "blocking", durationS: 20, color: "#ef4444", description: "Hört nur BPDUs, blockt alles andere. Max-Age = 20 s." },
  { state: "listening", durationS: 15, color: "#f59e0b", description: "Sendet/empfängt BPDUs, lernt aber keine MACs. Forward-Delay = 15 s." },
  { state: "learning", durationS: 15, color: "#eab308", description: "Lernt MAC-Adressen, leitet aber noch keine Daten weiter." },
  { state: "forwarding", durationS: Infinity, color: "#10b981", description: "Vollbetrieb — leitet Frames weiter & lernt MACs." },
];

function PortStatesTab({ dark }: { dark: boolean }) {
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsedInStep, setElapsedInStep] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setElapsedInStep((prev) => {
        const step = STP_SEQUENCE[stepIdx];
        if (prev + 1 >= step.durationS && stepIdx < STP_SEQUENCE.length - 1) {
          setStepIdx(stepIdx + 1);
          return 0;
        }
        if (step.durationS === Infinity) return prev;
        return prev + 1;
      });
    }, 200); // beschleunigt: 1 Schritt = 200ms statt 1s
    return () => window.clearInterval(t);
  }, [running, stepIdx]);

  const reset = () => {
    setRunning(false);
    setStepIdx(0);
    setElapsedInStep(0);
  };

  const totalElapsed = STP_SEQUENCE.slice(0, stepIdx).reduce((s, x) => s + x.durationS, 0) + elapsedInStep;

  return (
    <div className="space-y-5">
      <div
        className={`rounded-xl border p-5 ${
          dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setRunning(!running)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              dark ? "bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-100" : "bg-cyan-100 hover:bg-cyan-200 text-cyan-900"
            }`}
          >
            {running ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            {running ? "Pause" : "Start"}
          </button>
          <button
            onClick={reset}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              dark ? "border-slate-600 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            ↺ Reset
          </button>
          <span className="text-xs opacity-70 ml-auto">
            Simulationszeit: <strong>{totalElapsed} s</strong> (5× beschleunigt)
          </span>
        </div>

        {/* Timeline */}
        <div className="flex gap-2 mb-5">
          {STP_SEQUENCE.map((s, i) => {
            const isActive = i === stepIdx;
            const isPast = i < stepIdx;
            const width = s.durationS === Infinity ? 200 : s.durationS * 12;
            return (
              <div
                key={i}
                style={{ width, minWidth: 80 }}
                className={`relative rounded-lg p-3 transition-all ${
                  isActive ? "ring-2 scale-105" : ""
                } ${isPast ? "opacity-50" : ""}`}
                aria-label={`Phase ${s.state}`}
              >
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: s.color,
                    opacity: isActive ? 0.3 : 0.15,
                    border: `2px solid ${isActive ? s.color : "transparent"}`,
                  }}
                />
                <div className="relative">
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: s.color }}>
                    {s.state}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {s.durationS === Infinity ? "∞" : `${s.durationS} s`}
                  </div>
                  {isActive && s.durationS !== Infinity && (
                    <div className="mt-1 h-1 bg-black/20 rounded overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(elapsedInStep / s.durationS) * 100}%`,
                          background: s.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Beschreibung aktuelle Phase */}
        <div
          className={`rounded-lg p-4 border-l-4`}
          style={{
            borderLeftColor: STP_SEQUENCE[stepIdx].color,
            background: dark ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.8)",
          }}
        >
          <div className="text-sm font-semibold mb-1" style={{ color: STP_SEQUENCE[stepIdx].color }}>
            {STP_SEQUENCE[stepIdx].state.toUpperCase()}
          </div>
          <p className="text-sm opacity-90">{STP_SEQUENCE[stepIdx].description}</p>
        </div>
      </div>

      {/* Vergleichstabelle */}
      <div
        className={`rounded-xl border p-4 ${
          dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-white"
        }`}
      >
        <div className="text-sm font-semibold mb-3">Was passiert in welchem Zustand?</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`text-left ${dark ? "text-slate-400" : "text-slate-600"}`}>
                <th className="py-2 pr-3">Zustand</th>
                <th className="py-2 px-2 text-center">BPDU senden</th>
                <th className="py-2 px-2 text-center">BPDU empfangen</th>
                <th className="py-2 px-2 text-center">MAC lernen</th>
                <th className="py-2 px-2 text-center">Daten weiterleiten</th>
                <th className="py-2 pl-2">Dauer</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: "Blocking", send: false, recv: true, learn: false, fwd: false, dur: "Max-Age (20 s)" },
                { s: "Listening", send: true, recv: true, learn: false, fwd: false, dur: "15 s" },
                { s: "Learning", send: true, recv: true, learn: true, fwd: false, dur: "15 s" },
                { s: "Forwarding", send: true, recv: true, learn: true, fwd: true, dur: "∞" },
              ].map((row, i) => (
                <tr
                  key={i}
                  className={`border-t ${dark ? "border-slate-700" : "border-slate-200"}`}
                >
                  <td className="py-2 pr-3 font-mono font-semibold">{row.s}</td>
                  <td className="text-center">{row.send ? "✅" : "❌"}</td>
                  <td className="text-center">{row.recv ? "✅" : "❌"}</td>
                  <td className="text-center">{row.learn ? "✅" : "❌"}</td>
                  <td className="text-center">{row.fwd ? "✅" : "❌"}</td>
                  <td className="pl-2 opacity-70">{row.dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 3: Konvergenz STP vs RSTP
// ════════════════════════════════════════════════════════════
function ConvergenceTab({ dark }: { dark: boolean }) {
  const [running, setRunning] = useState(false);
  const [stpProgress, setStpProgress] = useState(0); // 0..50
  const [rstpProgress, setRstpProgress] = useState(0); // 0..1

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setStpProgress((p) => Math.min(p + 1, 50));
      setRstpProgress((p) => Math.min(p + 50, 1000));
    }, 100);
    return () => window.clearInterval(t);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setStpProgress(0);
    setRstpProgress(0);
  };

  const stpDone = stpProgress >= 50;
  const rstpDone = rstpProgress >= 1000;

  return (
    <div className="space-y-5">
      <div
        className={`rounded-xl border p-5 ${
          dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setRunning(!running)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${
              dark ? "bg-amber-500/30 hover:bg-amber-500/50 text-amber-100" : "bg-amber-100 hover:bg-amber-200 text-amber-900"
            }`}
          >
            {running ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            {running ? "Pause" : "Failover starten"}
          </button>
          <button
            onClick={reset}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              dark ? "border-slate-600 hover:bg-slate-700" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            ↺ Reset
          </button>
          <span className="text-xs opacity-70 ml-auto">Szenario: Root-Port-Ausfall → Alternate übernimmt</span>
        </div>

        {/* STP Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">STP (802.1D — klassisch)</span>
            <span className={`text-sm font-mono ${stpDone ? (dark ? "text-emerald-300" : "text-emerald-600") : "opacity-70"}`}>
              {stpProgress} s {stpDone && "✅ konvergiert"}
            </span>
          </div>
          <div className={`h-8 rounded-lg overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
            <div
              className="h-full bg-linear-to-r from-red-500 via-amber-500 to-emerald-500 transition-all"
              style={{ width: `${(stpProgress / 50) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] opacity-60 mt-1 font-mono">
            <span>0s Link-Down</span>
            <span>20s Max-Age</span>
            <span>35s Listen</span>
            <span>50s Forwarding</span>
          </div>
        </div>

        {/* RSTP Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">RSTP (802.1w — Rapid)</span>
            <span className={`text-sm font-mono ${rstpDone ? (dark ? "text-emerald-300" : "text-emerald-600") : "opacity-70"}`}>
              {(rstpProgress / 1000).toFixed(2)} s {rstpDone && "✅ konvergiert"}
            </span>
          </div>
          <div className={`h-8 rounded-lg overflow-hidden ${dark ? "bg-slate-700" : "bg-slate-200"}`}>
            <div
              className="h-full bg-linear-to-r from-cyan-400 to-emerald-500 transition-all"
              style={{ width: `${(rstpProgress / 1000) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] opacity-60 mt-1 font-mono">
            <span>0s Link-Down</span>
            <span>~1s Proposal/Agreement</span>
            <span>→ Alternate aktiv</span>
          </div>
        </div>

        <div
          className={`mt-5 rounded-lg p-4 ${
            dark ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-cyan-50 border border-cyan-200"
          }`}
        >
          <div className="text-sm font-semibold mb-2">⚡ Warum ist RSTP so viel schneller?</div>
          <ul className="text-sm space-y-1 list-disc ml-5">
            <li><strong>Proposal/Agreement-Handshake</strong> statt Timer-basiert</li>
            <li><strong>Alternate Port</strong> ist schon vor-berechnet — kein Re-Election nötig</li>
            <li><strong>Jeder</strong> Switch sendet BPDUs alle 2 s (Keep-Alive)</li>
            <li>Nur noch <strong>3 Zustände</strong>: Discarding / Learning / Forwarding</li>
          </ul>
        </div>
      </div>

      {/* Vergleichsmatrix */}
      <div
        className={`rounded-xl border p-4 ${
          dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-white"
        }`}
      >
        <div className="text-sm font-semibold mb-3">Direktvergleich</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={`text-left ${dark ? "text-slate-400" : "text-slate-600"}`}>
                <th className="py-2 pr-3"></th>
                <th className="py-2 px-3">STP (802.1D)</th>
                <th className="py-2 px-3">RSTP (802.1w)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Konvergenz", "30–50 s", "< 1 s ⚡"],
                ["Port-Zustände", "5 (Disabled/Blocking/Listening/Learning/Forwarding)", "3 (Discarding/Learning/Forwarding)"],
                ["Port-Rollen", "Root, Designated, Blocked", "Root, Designated, Alternate, Backup"],
                ["BPDU-Sender", "Nur Root", "Jeder Switch (alle 2 s)"],
                ["Edge-Port", "Manuell PortFast", "Nativ"],
                ["Konfiguration (Cisco)", "spanning-tree mode pvst", "spanning-tree mode rapid-pvst"],
              ].map((row, i) => (
                <tr key={i} className={`border-t ${dark ? "border-slate-700" : "border-slate-200"}`}>
                  <td className="py-2 pr-3 font-semibold">{row[0]}</td>
                  <td className="py-2 px-3 opacity-80">{row[1]}</td>
                  <td className="py-2 px-3 opacity-80">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 4: PortFast & BPDU Guard
// ════════════════════════════════════════════════════════════
function GuardsTab({ dark }: { dark: boolean }) {
  const [portFast, setPortFast] = useState(true);
  const [bpduGuard, setBpduGuard] = useState(true);
  const [connected, setConnected] = useState<"pc" | "switch">("pc");

  // Ergebnis berechnen
  const getResult = () => {
    if (connected === "pc") {
      if (portFast) {
        return {
          status: "ok",
          title: "✅ Sofort online",
          desc: "PortFast überspringt Listening/Learning → User sieht ab Boot sofort Netzwerk. Kein Loop möglich, weil PCs keine BPDUs senden.",
        };
      }
      return {
        status: "warn",
        title: "⏳ 30 s Wartezeit",
        desc: "Ohne PortFast: 15 s Listening + 15 s Learning → DHCP-Timeout möglich. Windows zeigt 'Netzwerkkabel nicht verbunden'.",
      };
    } else {
      // Switch angeschlossen
      if (portFast && bpduGuard) {
        return {
          status: "blocked",
          title: "🛡 Port err-disabled (gut!)",
          desc: "BPDU Guard erkennt: 'Hier kommen BPDUs an, obwohl Edge-Port konfiguriert!' → Port wird sofort gesperrt. Manuell mit 'shutdown / no shutdown' resettable.",
        };
      }
      if (portFast && !bpduGuard) {
        return {
          status: "danger",
          title: "💥 SOFORTIGER LOOP",
          desc: "PortFast erlaubt Forwarding sofort. Der zweite Switch bringt eine weitere Brücke ins L2-Netz → Spanning Tree muss neu konvergieren, aber bis dahin: Broadcast-Sturm!",
        };
      }
      return {
        status: "warn",
        title: "⚠ Funktioniert, aber riskant",
        desc: "Ohne PortFast läuft Standard-STP-Sequenz → kein sofortiger Loop, aber 30+ s Downtime. BPDU Guard wäre trotzdem sinnvoll als Frühwarnung.",
      };
    }
  };

  const result = getResult();
  const statusColor =
    result.status === "ok"
      ? "#10b981"
      : result.status === "blocked"
        ? "#3b82f6"
        : result.status === "warn"
          ? "#f59e0b"
          : "#ef4444";

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Konfiguration */}
      <div
        className={`rounded-xl border p-5 space-y-4 ${
          dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="text-sm font-semibold">Port-Konfiguration</div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={portFast}
            onChange={(e) => setPortFast(e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <div className="text-sm font-semibold">PortFast aktiv</div>
            <div className="text-xs opacity-70">spanning-tree portfast</div>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={bpduGuard}
            onChange={(e) => setBpduGuard(e.target.checked)}
            className="w-4 h-4"
          />
          <div>
            <div className="text-sm font-semibold">BPDU Guard aktiv</div>
            <div className="text-xs opacity-70">spanning-tree bpduguard enable</div>
          </div>
        </label>

        <div className="pt-3 border-t border-slate-600/30">
          <div className="text-sm font-semibold mb-2">Was hängt am Port?</div>
          <div className="flex gap-2">
            <button
              onClick={() => setConnected("pc")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                connected === "pc"
                  ? dark
                    ? "bg-cyan-500/30 border-cyan-500/50 text-cyan-100"
                    : "bg-cyan-100 border-cyan-300 text-cyan-900"
                  : dark
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-slate-300 hover:bg-slate-100"
              }`}
            >
              💻 PC / Drucker
            </button>
            <button
              onClick={() => setConnected("switch")}
              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                connected === "switch"
                  ? dark
                    ? "bg-red-500/30 border-red-500/50 text-red-100"
                    : "bg-red-100 border-red-300 text-red-900"
                  : dark
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-slate-300 hover:bg-slate-100"
              }`}
            >
              🔀 Fremder Switch
            </button>
          </div>
        </div>

        {/* CLI */}
        <div className={`rounded-lg p-3 font-mono text-xs ${dark ? "bg-slate-900" : "bg-slate-800 text-green-400"}`}>
          <div className="opacity-60 mb-1">! Resultierende Konfiguration</div>
          <div>SW(config)# interface Gi0/1</div>
          <div>SW(config-if)# switchport mode access</div>
          {portFast && <div>SW(config-if)# spanning-tree portfast</div>}
          {bpduGuard && <div>SW(config-if)# spanning-tree bpduguard enable</div>}
        </div>
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-xl border-2 p-5 space-y-3`}
        style={{
          borderColor: statusColor,
          background: dark ? `${statusColor}15` : `${statusColor}10`,
        }}
      >
        <div className="text-sm uppercase tracking-wide opacity-70">Ergebnis</div>
        <div className="text-2xl font-bold" style={{ color: statusColor }}>
          {result.title}
        </div>
        <p className="text-sm leading-relaxed">{result.desc}</p>

        <div
          className={`mt-4 rounded-lg p-3 text-xs space-y-2 ${
            dark ? "bg-slate-900/50" : "bg-white"
          }`}
        >
          <div className="font-semibold mb-1">Best Practice (global aktivieren)</div>
          <pre className={`${dark ? "text-green-400" : "text-green-700"} font-mono text-xs leading-relaxed`}>
{`SW(config)# spanning-tree portfast default
SW(config)# spanning-tree portfast bpduguard default
SW(config)# spanning-tree mode rapid-pvst`}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Main Dialog
// ════════════════════════════════════════════════════════════
export function StpSimulatorDialog({ dark, onClose }: Props) {
  const [tab, setTab] = useState<TabId>("election");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${
            dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                dark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"
              }`}
            >
              <Lightning size={22} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">STP & RSTP Simulator</h2>
              <p className="text-xs opacity-70">
                Root-Wahl · Port-Rollen · Konvergenz · PortFast/BPDU Guard — interaktiv
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-2 rounded-lg hover:bg-slate-500/20"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`sticky top-[73px] z-10 flex gap-1 px-6 pt-3 border-b ${
            dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                  active
                    ? dark
                      ? "border-cyan-400 text-cyan-300"
                      : "border-cyan-600 text-cyan-700"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Icon size={14} weight={active ? "fill" : "regular"} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tab === "election" && <ElectionTab dark={dark} />}
          {tab === "states" && <PortStatesTab dark={dark} />}
          {tab === "convergence" && <ConvergenceTab dark={dark} />}
          {tab === "guards" && <GuardsTab dark={dark} />}
        </div>
      </div>
    </div>
  );
}

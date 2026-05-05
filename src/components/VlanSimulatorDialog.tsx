// ============================================================
// VlanSimulatorDialog — Interaktiver VLAN-Simulator
// Tabs: Frame-Vivisektor (802.1Q) · Switch-Simulator · Trunk-Animation
// ============================================================

import { X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

type Tab = "frame" | "switch" | "trunk";

// ── 802.1Q Frame Vivisektor ────────────────────────────────────

const FRAME_FIELDS = [
  {
    id: "preamble",
    label: "Präambel",
    bytes: "8",
    hex: "55 55 55 55 55 55 55 D5",
    color: "#6366f1",
    detail: "7 Byte 0x55 (Synchronisation) + 1 Byte 0xD5 (Start Frame Delimiter). Zeigt dem Empfänger: 'Frame beginnt jetzt'.",
    bits: "10101010 … 10101011",
  },
  {
    id: "dst",
    label: "Ziel-MAC",
    bytes: "6",
    hex: "FF FF FF FF FF FF",
    color: "#ef4444",
    detail: "6 Byte Ziel-MAC-Adresse. FF:FF:FF:FF:FF:FF = Broadcast (alle Geräte im VLAN). Unicast = spezifisches Gerät.",
    bits: "11111111 × 6",
  },
  {
    id: "src",
    label: "Quell-MAC",
    bytes: "6",
    hex: "00 1A 2B 3C 4D 5E",
    color: "#f97316",
    detail: "6 Byte Quell-MAC-Adresse des sendenden Geräts. OUI (3 Byte) + Gerätespezifisch (3 Byte).",
    bits: "00000000 00011010 …",
  },
  {
    id: "tag",
    label: "802.1Q Tag",
    bytes: "4",
    hex: "81 00 A0 0A",
    color: "#10b981",
    detail: "0x8100 (TPID) + TCI: PCP=5 (3 Bit, Priorität VoIP), DEI=0 (1 Bit), VID=0x00A=10 (12 Bit). Dieser Frame gehört zu VLAN 10.",
    bits: "10000001 00000000 | 10100000 00001010\nTPID: 0x8100 | PCP:101 DEI:0 VID:000000001010",
    optional: true,
  },
  {
    id: "ethertype",
    label: "Ethertype/Länge",
    bytes: "2",
    hex: "08 00",
    color: "#3b82f6",
    detail: "0x0800 = IPv4-Payload. Andere Werte: 0x0806=ARP, 0x86DD=IPv6, 0x8100=802.1Q-Tag (wenn kein Tag vorhanden und dieser Wert auftaucht, ist es ein getaggter Frame!).",
    bits: "00001000 00000000",
  },
  {
    id: "data",
    label: "Nutzdaten",
    bytes: "46–1500",
    hex: "45 00 …",
    color: "#a855f7",
    detail: "IP-Header + Daten (46–1500 Byte für ungetaggte Frames, 42–1496 für getaggte, da +4 Byte Tag). Minimum 64 Byte Gesamtframe für CSMA/CD-Erkennung.",
    bits: "Variabel",
  },
  {
    id: "fcs",
    label: "FCS",
    bytes: "4",
    hex: "A3 F2 D1 B8",
    color: "#64748b",
    detail: "Frame Check Sequence: CRC-32 über den gesamten Frame (ohne Präambel). Empfänger berechnet CRC neu — stimmt er nicht: Frame verwerfen, kein automatischer Retry auf Layer 2.",
    bits: "CRC-32",
  },
];

function FrameVivisektor({ dark }: { dark: boolean }) {
  const [selected, setSelected] = useState<string | null>("tag");
  const [tagEnabled, setTagEnabled] = useState(true);

  const fields = FRAME_FIELDS.filter((f) => !f.optional || tagEnabled);
  const selectedField = fields.find((f) => f.id === selected) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
          Klicke auf ein Frame-Feld für Details.
        </span>
        <label className="flex items-center gap-2 cursor-pointer ml-auto">
          <span className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>802.1Q Tag</span>
          <button
            onClick={() => { setTagEnabled(!tagEnabled); if (!tagEnabled) setSelected("tag"); else if (selected === "tag") setSelected(null); }}
            className={`relative w-9 h-5 rounded-full transition-colors ${tagEnabled ? "bg-indigo-600" : dark ? "bg-slate-600" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${tagEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </label>
      </div>

      {/* Frame visual */}
      <div className="flex flex-wrap gap-1 items-stretch">
        {fields.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(selected === f.id ? null : f.id)}
            style={{ borderColor: f.color, background: selected === f.id ? f.color + "33" : undefined }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 px-2 py-2 min-w-[52px] text-center transition-all hover:scale-105 ${
              selected === f.id ? "ring-2 ring-offset-1" : ""
            } ${dark ? "bg-slate-800" : "bg-white shadow-sm"}`}
          >
            <span className="text-[10px] font-semibold" style={{ color: f.color }}>{f.label}</span>
            <span className={`text-[9px] mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>{f.bytes}B</span>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selectedField && (
        <div className={`rounded-xl border p-4 space-y-3 transition-all ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selectedField.color }} />
            <span className={`font-bold text-sm ${dark ? "text-white" : "text-slate-900"}`}>{selectedField.label}</span>
            <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>({selectedField.bytes} Byte)</span>
          </div>
          <p className={`text-xs leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>{selectedField.detail}</p>
          <div className={`rounded-lg p-2 font-mono text-xs ${dark ? "bg-slate-900 border border-slate-700 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-700"}`}>
            <div className="text-[10px] text-slate-500 mb-1">Hex</div>
            <div>{selectedField.hex}</div>
            {selectedField.bits && (
              <>
                <div className="text-[10px] text-slate-500 mt-2 mb-1">Binär</div>
                <div className="whitespace-pre-wrap text-[10px]">{selectedField.bits}</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`text-xs rounded-xl border p-3 ${dark ? "bg-amber-900/20 border-amber-700/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
        ⚠️ Mit Tag: Frame-Größe = 1522 Byte max. | Ohne Tag: 1518 Byte max.
        Native VLAN = kein Tag auf Trunk-Port.
      </div>
    </div>
  );
}

// ── Switch Simulator ───────────────────────────────────────────

interface PortConfig {
  mode: "access" | "trunk";
  vlan: number;
  allowedVlans: number[];
}

const VLAN_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  10: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  20: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
  30: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  99: { bg: "#f3e8ff", text: "#6b21a8", border: "#a855f7" },
};
const VLAN_COLORS_DARK: Record<number, { bg: string; text: string; border: string }> = {
  10: { bg: "#1e3a8a44", text: "#93c5fd", border: "#3b82f6" },
  20: { bg: "#14532d44", text: "#86efac", border: "#22c55e" },
  30: { bg: "#78350f44", text: "#fcd34d", border: "#f59e0b" },
  99: { bg: "#581c8744", text: "#d8b4fe", border: "#a855f7" },
};

function SwitchSimulator({ dark }: { dark: boolean }) {
  const VLANS = [10, 20, 30, 99];
  const [ports, setPorts] = useState<PortConfig[]>([
    { mode: "access", vlan: 10, allowedVlans: [10, 20, 30] },
    { mode: "access", vlan: 10, allowedVlans: [10, 20, 30] },
    { mode: "access", vlan: 20, allowedVlans: [10, 20, 30] },
    { mode: "access", vlan: 20, allowedVlans: [10, 20, 30] },
    { mode: "access", vlan: 30, allowedVlans: [10, 20, 30] },
    { mode: "trunk",  vlan: 1,  allowedVlans: [10, 20, 30, 99] },
    { mode: "trunk",  vlan: 1,  allowedVlans: [10, 20, 30, 99] },
    { mode: "access", vlan: 99, allowedVlans: [99] },
  ]);
  const [sending, setSending] = useState<number | null>(null);
  const [result, setResult] = useState<string[] | null>(null);

  function updatePort(idx: number, update: Partial<PortConfig>) {
    setPorts((prev) => prev.map((p, i) => i === idx ? { ...p, ...update } : p));
    setResult(null);
  }

  function simulateSend(fromPort: number) {
    setSending(fromPort);
    setResult(null);
    const src = ports[fromPort];
    const srcVlan = src.mode === "access" ? src.vlan : null;
    const msgs: string[] = [];
    ports.forEach((p, i) => {
      if (i === fromPort) return;
      if (src.mode === "access") {
        if (p.mode === "access" && p.vlan === srcVlan) {
          msgs.push(`Port ${i + 1} (Access VLAN ${p.vlan}) ✅ — gleiche Broadcast-Domäne`);
        } else if (p.mode === "trunk" && p.allowedVlans.includes(srcVlan!)) {
          msgs.push(`Port ${i + 1} (Trunk) ✅ — Frame mit Tag VLAN ${srcVlan} weitergeleitet`);
        } else {
          msgs.push(`Port ${i + 1} (VLAN ${p.mode === "access" ? p.vlan : "Trunk"}) ❌ — anderes VLAN / nicht erlaubt`);
        }
      } else {
        msgs.push(`Port ${i + 1} — Broadcast von Trunk-Port: Frame-VLAN bestimmt Empfänger`);
      }
    });
    setTimeout(() => { setResult(msgs); setSending(null); }, 600);
  }

  const colors = dark ? VLAN_COLORS_DARK : VLAN_COLORS;

  // IOS config preview
  const iosConfig = ports.map((p, i) => {
    const lines = [`interface GigabitEthernet0/${i + 1}`];
    if (p.mode === "access") {
      lines.push(` switchport mode access`, ` switchport access vlan ${p.vlan}`);
    } else {
      lines.push(` switchport mode trunk`, ` switchport trunk allowed vlan ${p.allowedVlans.join(",")}`);
    }
    return lines.join("\n");
  }).join("\n!\n");

  return (
    <div className="space-y-4">
      <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
        Konfiguriere die 8 Ports und sende einen Frame, um zu sehen, welche Ports ihn empfangen.
      </p>

      {/* Ports grid */}
      <div className="grid grid-cols-4 gap-2">
        {ports.map((p, i) => {
          const vc = p.mode === "access" ? (colors[p.vlan] ?? { bg: "#f1f5f9", text: "#475569", border: "#94a3b8" }) : { bg: dark ? "#1e293b" : "#f8fafc", text: dark ? "#94a3b8" : "#475569", border: "#94a3b8" };
          return (
            <div
              key={i}
              style={{ borderColor: vc.border, background: vc.bg }}
              className={`rounded-xl border-2 p-2 space-y-1.5 ${sending === i ? "ring-2 ring-indigo-400 animate-pulse" : ""}`}
            >
              <div className="text-[10px] font-bold" style={{ color: vc.text }}>Port {i + 1}</div>
              <select
                value={p.mode}
                onChange={(e) => updatePort(i, { mode: e.target.value as "access" | "trunk" })}
                className={`w-full text-[10px] rounded border px-1 py-0.5 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
              >
                <option value="access">Access</option>
                <option value="trunk">Trunk</option>
              </select>
              {p.mode === "access" && (
                <select
                  value={p.vlan}
                  onChange={(e) => updatePort(i, { vlan: Number(e.target.value) })}
                  className={`w-full text-[10px] rounded border px-1 py-0.5 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  {VLANS.map((v) => <option key={v} value={v}>VLAN {v}</option>)}
                </select>
              )}
              {p.mode === "trunk" && (
                <div className="text-[9px]" style={{ color: vc.text }}>VLANs: {p.allowedVlans.join(",")}</div>
              )}
              <button
                onClick={() => simulateSend(i)}
                className="w-full text-[9px] py-0.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 font-semibold"
              >
                📤 Senden
              </button>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-3 space-y-1 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
          <div className={`text-xs font-semibold mb-2 ${dark ? "text-slate-200" : "text-slate-800"}`}>Frame-Verteilung:</div>
          {result.map((r, i) => (
            <div key={i} className={`text-[11px] ${r.includes("✅") ? dark ? "text-green-400" : "text-green-700" : dark ? "text-red-400" : "text-red-600"}`}>
              {r}
            </div>
          ))}
        </div>
      )}

      {/* IOS config */}
      <details className="group">
        <summary className={`cursor-pointer text-xs font-semibold select-none ${dark ? "text-indigo-300" : "text-indigo-600"}`}>
          📋 Cisco IOS-Konfiguration anzeigen
        </summary>
        <pre className={`mt-2 text-[10px] rounded-xl p-3 font-mono overflow-x-auto ${dark ? "bg-slate-900 border border-slate-700 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-700"}`}>
          {iosConfig}
        </pre>
      </details>
    </div>
  );
}

// ── Trunk Animation ────────────────────────────────────────────

const TRUNK_VLANS = [
  { id: 10, color: "#3b82f6", label: "VLAN 10 — BÜRO" },
  { id: 20, color: "#22c55e", label: "VLAN 20 — PRODUKTION" },
  { id: 30, color: "#f59e0b", label: "VLAN 30 — GÄSTE" },
  { id: 99, color: "#a855f7", label: "VLAN 99 — MANAGEMENT" },
];

interface TrunkFrame {
  id: number;
  vlan: number;
  color: string;
  x: number;
}

function TrunkAnimation({ dark }: { dark: boolean }) {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [frames, setFrames] = useState<TrunkFrame[]>([]);
  const frameIdRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const [visibleVlans, setVisibleVlans] = useState<Set<number>>(new Set([10, 20, 30, 99]));

  function toggleVlan(vlanId: number) {
    setVisibleVlans((prev) => {
      const next = new Set(prev);
      if (next.has(vlanId)) next.delete(vlanId);
      else next.add(vlanId);
      return next;
    });
  }

  useEffect(() => {
    if (!running) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    let last = performance.now();
    function animate(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      setFrames((prev) => {
        const next = prev
          .map((f) => ({ ...f, x: f.x + dt * 120 * speed }))
          .filter((f) => f.x < 620);
        return next;
      });
      // Spawn new frame
      if (now - lastSpawnRef.current > 600 / speed) {
        const validVlans = TRUNK_VLANS.filter((v) => visibleVlans.has(v.id));
        if (validVlans.length > 0) {
          const vlanDef = validVlans[Math.floor(Math.random() * validVlans.length)];
          setFrames((prev) => [
            ...prev,
            { id: frameIdRef.current++, vlan: vlanDef.id, color: vlanDef.color, x: -60 },
          ]);
          lastSpawnRef.current = now;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [running, speed, visibleVlans]);

  const vlanForFrame = (vlanId: number) => TRUNK_VLANS.find((v) => v.id === vlanId)!;

  return (
    <div className="space-y-4">
      <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
        Jede Farbe = ein VLAN. Alle Frames teilen sich denselben physischen Trunk-Link — durch 802.1Q-Tags bleibt die Zugehörigkeit erhalten.
      </p>

      {/* VLAN toggle */}
      <div className="flex flex-wrap gap-2">
        {TRUNK_VLANS.map((v) => (
          <button
            key={v.id}
            onClick={() => toggleVlan(v.id)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
              visibleVlans.has(v.id) ? "opacity-100" : "opacity-40"
            }`}
            style={{ borderColor: v.color, color: v.color }}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: v.color }} />
            VLAN {v.id}
          </button>
        ))}
      </div>

      {/* Animation canvas */}
      <div className={`relative rounded-xl overflow-hidden ${dark ? "bg-slate-900 border border-slate-700" : "bg-slate-100 border border-slate-200"}`} style={{ height: 100 }}>
        {/* Trunk line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-slate-500 to-slate-400 opacity-40" />
        <div className={`absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>SW1</div>
        <div className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${dark ? "text-slate-400" : "text-slate-500"}`}>SW2</div>

        {/* Frames */}
        {frames.map((f) => {
          const vd = vlanForFrame(f.vlan);
          const top = 20 + ((f.id % 3) * 20);
          return (
            <div
              key={f.id}
              className="absolute rounded px-2 py-0.5 text-white text-[10px] font-bold shadow transition-none"
              style={{ left: f.x, top, background: f.color, whiteSpace: "nowrap", transform: "translateY(-50%)" }}
            >
              VLAN {f.vlan}
              <span className="ml-1 text-[8px] opacity-80">[0x8100/{f.vlan}]</span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setRunning(!running)}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            running
              ? dark ? "bg-red-900/40 text-red-300 hover:bg-red-800/40" : "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-indigo-600 text-white hover:bg-indigo-500"
          }`}
        >
          {running ? "⏹ Stop" : "▶ Start"}
        </button>
        <button
          onClick={() => setFrames([])}
          className={`px-3 py-1.5 rounded-lg text-xs ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
        >
          Leeren
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>Geschwindigkeit:</span>
          <input
            type="range" min={0.5} max={4} step={0.5} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-20"
          />
          <span className={`text-xs font-mono ${dark ? "text-slate-300" : "text-slate-700"}`}>{speed}×</span>
        </div>
      </div>

      {/* VLAN legend */}
      <div className="space-y-1">
        {TRUNK_VLANS.map((v) => (
          <div key={v.id} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: v.color }} />
            <span className={dark ? "text-slate-300" : "text-slate-700"}>{v.label}</span>
            <code className={`text-[10px] font-mono ${dark ? "text-slate-500" : "text-slate-400"}`}>Tag: 0x8100 + VID={v.id}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dialog ────────────────────────────────────────────────

export function VlanSimulatorDialog({ dark, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("frame");

  const tabs: { id: Tab; label: string }[] = [
    { id: "frame",  label: "Frame-Vivisektor" },
    { id: "switch", label: "Switch-Simulator" },
    { id: "trunk",  label: "Trunk-Animation" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
          dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex-1">
            <h2 className="font-bold text-base">🌐 VLAN-Simulator</h2>
            <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              802.1Q Frame-Vivisektor · Switch-Simulator · Trunk-Animation
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className={`p-1.5 rounded-lg ${dark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b flex-shrink-0 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? dark ? "border-indigo-400 text-indigo-300" : "border-indigo-600 text-indigo-700"
                  : dark ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "frame"  && <FrameVivisektor dark={dark} />}
          {tab === "switch" && <SwitchSimulator dark={dark} />}
          {tab === "trunk"  && <TrunkAnimation dark={dark} />}
        </div>
      </div>
    </div>
  );
}

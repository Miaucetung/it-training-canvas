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

type Tab = "frame" | "topology" | "trunk";

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

// ── Topology Simulator: 24-Port Switch + Router ───────────────

const VLAN_DEFS = [
  { id: 10, name: "BÜRO",       color: "#3b82f6", bg: "#dbeafe", bgD: "#1e3a8a33", text: "#1e40af", textD: "#93c5fd" },
  { id: 20, name: "PRODUKTION", color: "#22c55e", bg: "#dcfce7", bgD: "#14532d33", text: "#166534", textD: "#86efac" },
  { id: 30, name: "GÄSTE",      color: "#f59e0b", bg: "#fef3c7", bgD: "#78350f33", text: "#92400e", textD: "#fcd34d" },
  { id: 99, name: "MGMT",       color: "#a855f7", bg: "#f3e8ff", bgD: "#581c8733", text: "#6b21a8", textD: "#d8b4fe" },
];

function vlanDef(id: number) { return VLAN_DEFS.find(v => v.id === id) ?? VLAN_DEFS[0]; }

type PortMode = "access" | "trunk" | "unassigned";

interface SWPort {
  num: number;         // 1-24
  mode: PortMode;
  accessVlan: number;
  trunkAllowed: number[];
  trunkNative: number;
  connectedTo: "pc" | "router" | "none";
  deviceLabel: string;
}

type RouterIntfMode = "subinterface" | "none";
interface RouterIntf {
  id: string;          // "Gi0/0.10" etc.
  vlan: number;
  ip: string;
  mode: RouterIntfMode;
  active: boolean;
}

function buildDefaultPorts(): SWPort[] {
  return Array.from({ length: 24 }, (_, i) => ({
    num: i + 1,
    mode: "unassigned" as PortMode,
    accessVlan: 10,
    trunkAllowed: [10, 20, 30, 99],
    trunkNative: 99,
    connectedTo: "none" as const,
    deviceLabel: "",
  }));
}

function buildDefaultRouter(): RouterIntf[] {
  return [
    { id: "Gi0/0.10", vlan: 10, ip: "192.168.10.1/24", mode: "none", active: false },
    { id: "Gi0/0.20", vlan: 20, ip: "192.168.20.1/24", mode: "none", active: false },
    { id: "Gi0/0.30", vlan: 30, ip: "192.168.30.1/24", mode: "none", active: false },
    { id: "Gi0/0.99", vlan: 99, ip: "192.168.99.1/24", mode: "none", active: false },
  ];
}

// ── Validation engine ─────────────────────────────────────────

interface ValidationIssue {
  level: "error" | "warn" | "info";
  msg: string;
  port?: number;
}

function validateTopology(ports: SWPort[], router: RouterIntf[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Find trunk port connected to router
  const routerPorts = ports.filter(p => p.connectedTo === "router");
  const trunkToRouter = routerPorts.filter(p => p.mode === "trunk");
  const accessToRouter = routerPorts.filter(p => p.mode === "access");

  if (routerPorts.length === 0) {
    issues.push({ level: "info", msg: "Kein Port mit dem Router verbunden — kein Inter-VLAN-Routing möglich." });
  }

  if (accessToRouter.length > 0 && router.some(r => r.active)) {
    accessToRouter.forEach(p => {
      issues.push({ level: "warn", port: p.num, msg: `Port ${p.num} ist mit dem Router verbunden, aber als Access konfiguriert. Für Router-on-a-Stick muss dieser Port als TRUNK konfiguriert sein.` });
    });
  }

  if (trunkToRouter.length > 1) {
    issues.push({ level: "warn", msg: `${trunkToRouter.length} Trunk-Ports zum Router — normalerweise reicht einer für Router-on-a-Stick.` });
  }

  // Active router subinterfaces but no trunk to router
  const activeRouterIntfs = router.filter(r => r.active);
  if (activeRouterIntfs.length > 0 && trunkToRouter.length === 0) {
    issues.push({ level: "error", msg: "Router hat aktive Subinterfaces, aber kein Trunk-Port führt zum Router. Frames können den Router nicht erreichen." });
  }

  // Check: router subinterface VLAN allowed on trunk?
  trunkToRouter.forEach(p => {
    activeRouterIntfs.forEach(r => {
      if (!p.trunkAllowed.includes(r.vlan)) {
        issues.push({ level: "error", port: p.num, msg: `VLAN ${r.vlan} ist nicht in der Trunk-Allowed-Liste von Port ${p.num} — Router-Subinterface Gi0/0.${r.vlan} ist erreichbar, aber Frames werden geblockt.` });
      }
    });
  });

  // Native VLAN on trunk ports
  trunkToRouter.forEach(p => {
    if (p.trunkNative === 1) {
      issues.push({ level: "warn", port: p.num, msg: `Port ${p.num}: Native VLAN ist VLAN 1. Sicherheitsrisiko (VLAN Hopping). Empfehlung: Native VLAN auf unbenutzte ID setzen (z.B. 999).` });
    }
  });

  // PC ports: check if access, warn if trunk
  const pcPorts = ports.filter(p => p.connectedTo === "pc");
  pcPorts.forEach(p => {
    if (p.mode === "trunk") {
      issues.push({ level: "warn", port: p.num, msg: `Port ${p.num} ist mit einem PC verbunden, aber als Trunk konfiguriert. PCs erwarten ungetaggte Frames (Access-Port). Ohne 802.1Q-fähige NIC ignoriert der PC getaggte Frames.` });
    }
    if (p.mode === "unassigned") {
      issues.push({ level: "error", port: p.num, msg: `Port ${p.num} ist mit einem PC verbunden, aber noch nicht konfiguriert. Gerät hat keine VLAN-Zugehörigkeit.` });
    }
  });

  // Same VLAN, different ports: reachability
  const accessVlans = new Set(pcPorts.filter(p => p.mode === "access").map(p => p.accessVlan));
  accessVlans.forEach(vid => {
    const portsInVlan = pcPorts.filter(p => p.mode === "access" && p.accessVlan === vid);
    if (portsInVlan.length >= 1) {
      issues.push({ level: "info", msg: `VLAN ${vid} (${vlanDef(vid).name}): ${portsInVlan.length} PC(s) in derselben Broadcast-Domäne — können direkt kommunizieren ohne Router.` });
    }
  });

  // Inter-VLAN reachability
  if (activeRouterIntfs.length >= 2) {
    const routedVlans = activeRouterIntfs.map(r => r.vlan);
    issues.push({ level: "info", msg: `Inter-VLAN Routing aktiv: ${routedVlans.map(v => `VLAN ${v}`).join(" ↔ ")} können über Router kommunizieren.` });
  }

  if (issues.length === 0) {
    issues.push({ level: "info", msg: "Keine Konfigurationsprobleme erkannt. Topologie sieht korrekt aus." });
  }

  return issues;
}

// ── IOS config generator ──────────────────────────────────────

function generateSwitchConfig(ports: SWPort[]): string {
  const lines: string[] = ["! === Cisco Catalyst — VLAN-Konfiguration ===", "!"];
  VLAN_DEFS.forEach(v => {
    lines.push(`vlan ${v.id}`, ` name ${v.name}`);
  });
  lines.push("!");
  ports.forEach(p => {
    if (p.mode === "unassigned") return;
    lines.push(`interface GigabitEthernet0/${p.num}`);
    if (p.connectedTo !== "none") lines.push(` description ${p.deviceLabel || p.connectedTo}`);
    if (p.mode === "access") {
      lines.push(` switchport mode access`, ` switchport access vlan ${p.accessVlan}`, ` spanning-tree portfast`);
    } else {
      lines.push(
        ` switchport mode trunk`,
        ` switchport trunk encapsulation dot1q`,
        ` switchport trunk native vlan ${p.trunkNative}`,
        ` switchport trunk allowed vlan ${p.trunkAllowed.join(",")}`,
        ` switchport nonegotiate`
      );
    }
    lines.push("!");
  });
  return lines.join("\n");
}

function generateRouterConfig(router: RouterIntf[], trunkPort: number | null): string {
  const active = router.filter(r => r.active);
  if (active.length === 0) return "! Kein Router-on-a-Stick konfiguriert";
  const lines: string[] = ["! === Cisco Router — Router-on-a-Stick ===", "!"];
  if (trunkPort !== null) {
    lines.push(`interface GigabitEthernet0/0`, ` description Trunk zum Switch (Port Gi0/${trunkPort})`, ` no ip address`, ` no shutdown`, "!");
  }
  active.forEach(r => {
    lines.push(
      `interface ${r.id}`,
      ` description VLAN-${r.vlan}-Gateway`,
      ` encapsulation dot1q ${r.vlan}`,
      ` ip address ${r.ip.replace("/24", " 255.255.255.0")}`,
      ` no shutdown`,
      "!"
    );
  });
  return lines.join("\n");
}

// ── TopologySimulator component ───────────────────────────────

function TopologySimulator({ dark }: { dark: boolean }) {
  const [ports, setPorts] = useState<SWPort[]>(buildDefaultPorts);
  const [router, setRouter] = useState<RouterIntf[]>(buildDefaultRouter);
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [showConfig, setShowConfig] = useState<"switch" | "router" | null>(null);

  const issues = validateTopology(ports, router);
  const errors   = issues.filter(i => i.level === "error");
  const warnings = issues.filter(i => i.level === "warn");
  const infos    = issues.filter(i => i.level === "info");

  const trunkToRouterPort = ports.find(p => p.connectedTo === "router" && p.mode === "trunk");

  function updatePort(num: number, update: Partial<SWPort>) {
    setPorts(prev => prev.map(p => p.num === num ? { ...p, ...update } : p));
    setSelectedPort(num);
  }

  function toggleRouterIntf(id: string) {
    setRouter(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }

  function reset() {
    setPorts(buildDefaultPorts());
    setRouter(buildDefaultRouter());
    setSelectedPort(null);
  }

  const selPort = selectedPort !== null ? ports.find(p => p.num === selectedPort) : null;

  // Tagging explanation for a port
  function taggingExplain(p: SWPort): { tag: boolean; why: string; color: string } {
    if (p.mode === "access") {
      return {
        tag: false,
        why: `Access-Port: Frames werden OHNE 802.1Q-Tag gesendet und empfangen. Das angeschlossene Gerät (${p.deviceLabel || "PC"}) kennt VLAN ${p.accessVlan} nicht — der Switch setzt den Tag intern.`,
        color: "#22c55e",
      };
    }
    if (p.mode === "trunk") {
      return {
        tag: true,
        why: `Trunk-Port: Alle Frames AUSSER Native VLAN (${p.trunkNative}) werden MIT 802.1Q-Tag übertragen. Erlaubte VLANs: ${p.trunkAllowed.join(", ")}. Native VLAN ${p.trunkNative} = kein Tag.`,
        color: "#f59e0b",
      };
    }
    return { tag: false, why: "Port nicht konfiguriert — kein Traffic erlaubt.", color: "#ef4444" };
  }

  const sb = dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200";
  const tb = dark ? "text-slate-300" : "text-slate-700";

  return (
    <div className="space-y-4">
      {/* Legend bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {VLAN_DEFS.map(v => (
          <span key={v.id} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ borderColor: v.color, color: dark ? v.textD : v.text, background: dark ? v.bgD : v.bg }}>
            <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />
            VLAN {v.id} {v.name}
          </span>
        ))}
        <button onClick={reset} className={`ml-auto text-[10px] px-2 py-0.5 rounded border ${dark ? "border-slate-600 text-slate-400 hover:text-slate-200" : "border-slate-300 text-slate-500 hover:text-slate-700"}`}>↺ Reset</button>
      </div>

      {/* Topology: two column layout */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">

        {/* Switch */}
        <div className={`rounded-xl border p-3 ${sb}`}>
          <div className={`text-xs font-bold mb-2 ${tb}`}>🖥 Cisco Catalyst 2960X — 24-Port Switch</div>

          {/* Port grid: 2 rows of 12 like a real switch faceplate */}
          <div className="space-y-1">
            {[0, 1].map(row => (
              <div key={row} className="flex gap-1 flex-wrap">
                {ports.slice(row * 12, row * 12 + 12).map(p => {
                  const vc = p.mode === "access" ? vlanDef(p.accessVlan) : null;
                  const portBg = p.mode === "unassigned"
                    ? dark ? "#374151" : "#e2e8f0"
                    : p.mode === "trunk"
                      ? dark ? "#1e3a8a55" : "#dbeafe"
                      : dark ? vc!.bgD : vc!.bg;
                  const portBorder = p.mode === "unassigned"
                    ? dark ? "#4b5563" : "#cbd5e1"
                    : p.mode === "trunk"
                      ? "#3b82f6"
                      : vc!.color;
                  const isSelected = selectedPort === p.num;
                  return (
                    <button
                      key={p.num}
                      onClick={() => setSelectedPort(isSelected ? null : p.num)}
                      title={`Port ${p.num}${p.deviceLabel ? ` — ${p.deviceLabel}` : ""}`}
                      style={{ background: portBg, borderColor: portBorder }}
                      className={`relative w-7 h-9 rounded border-2 flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-110 ${isSelected ? "ring-2 ring-indigo-400 scale-110" : ""}`}
                    >
                      <span className="text-[8px] font-bold leading-none" style={{ color: dark ? "#94a3b8" : "#475569" }}>{p.num}</span>
                      {/* LED dot */}
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.mode === "unassigned" ? "#4b5563" : p.mode === "trunk" ? "#f59e0b" : vc!.color }} />
                      {p.connectedTo !== "none" && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white border border-current text-[6px] flex items-center justify-center" style={{ color: portBorder }}>
                          {p.connectedTo === "router" ? "R" : "P"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Port legend */}
          <div className="flex gap-3 mt-2 text-[10px] flex-wrap">
            <span className={dark ? "text-slate-500" : "text-slate-400"}>● LED: <span style={{ color: "#4b5563" }}>grau</span>=frei, <span style={{ color: "#f59e0b" }}>gelb</span>=Trunk, Farbe=Access-VLAN</span>
            <span className={dark ? "text-slate-500" : "text-slate-400"}>R=Router angeschlossen, P=PC angeschlossen</span>
          </div>
        </div>

        {/* Router */}
        <div className={`rounded-xl border p-3 min-w-[180px] ${sb}`}>
          <div className={`text-xs font-bold mb-2 ${tb}`}>🔀 Cisco ISR (Router-on-a-Stick)</div>
          <div className={`text-[10px] mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Aktiviere Subinterfaces für Inter-VLAN-Routing
          </div>
          <div className="space-y-1.5">
            {router.map(r => {
              const vd = vlanDef(r.vlan);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRouterIntf(r.id)}
                  style={{
                    borderColor: r.active ? vd.color : dark ? "#374151" : "#e2e8f0",
                    background: r.active ? (dark ? vd.bgD : vd.bg) : "transparent",
                  }}
                  className="w-full text-left rounded-lg border p-1.5 transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.active ? vd.color : dark ? "#4b5563" : "#cbd5e1" }} />
                    <span className="text-[10px] font-mono font-semibold" style={{ color: r.active ? (dark ? vd.textD : vd.text) : dark ? "#94a3b8" : "#64748b" }}>{r.id}</span>
                  </div>
                  <div className="text-[9px] mt-0.5 ml-3.5" style={{ color: dark ? "#64748b" : "#94a3b8" }}>
                    {r.ip} · encap dot1q {r.vlan}
                  </div>
                  {!r.active && <div className="text-[9px] ml-3.5" style={{ color: "#ef4444" }}>inaktiv</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Port configurator */}
      {selPort && (() => {
        const te = taggingExplain(selPort);
        return (
          <div className={`rounded-xl border p-4 space-y-3 ${dark ? "bg-slate-800/80 border-indigo-500/40" : "bg-indigo-50/60 border-indigo-200"}`}>
            <div className={`font-semibold text-sm ${dark ? "text-white" : "text-slate-900"}`}>
              Port {selPort.num} konfigurieren
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {/* Connected to */}
              <div>
                <label className={`text-[10px] font-semibold block mb-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>Gerät angeschlossen</label>
                <select
                  value={selPort.connectedTo}
                  onChange={e => updatePort(selPort.num, { connectedTo: e.target.value as SWPort["connectedTo"] })}
                  className={`w-full text-xs rounded-lg border px-2 py-1 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  <option value="none">— keins —</option>
                  <option value="pc">PC / Server / Drucker</option>
                  <option value="router">Router (Gi0/0)</option>
                </select>
              </div>

              {/* Label */}
              <div>
                <label className={`text-[10px] font-semibold block mb-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>Beschriftung</label>
                <input
                  type="text"
                  value={selPort.deviceLabel}
                  placeholder={selPort.connectedTo === "pc" ? "z.B. PC-Buchhaltung" : selPort.connectedTo === "router" ? "Router Gi0/0" : ""}
                  onChange={e => updatePort(selPort.num, { deviceLabel: e.target.value })}
                  className={`w-full text-xs rounded-lg border px-2 py-1 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                />
              </div>

              {/* Port mode */}
              <div>
                <label className={`text-[10px] font-semibold block mb-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>Port-Modus</label>
                <select
                  value={selPort.mode}
                  onChange={e => updatePort(selPort.num, { mode: e.target.value as PortMode })}
                  className={`w-full text-xs rounded-lg border px-2 py-1 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  <option value="unassigned">— nicht konfiguriert —</option>
                  <option value="access">Access (ungetaggt)</option>
                  <option value="trunk">Trunk (getaggt)</option>
                </select>
              </div>

              {selPort.mode === "access" && (
                <div>
                  <label className={`text-[10px] font-semibold block mb-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>Access VLAN</label>
                  <select
                    value={selPort.accessVlan}
                    onChange={e => updatePort(selPort.num, { accessVlan: Number(e.target.value) })}
                    className={`w-full text-xs rounded-lg border px-2 py-1 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                  >
                    {VLAN_DEFS.map(v => <option key={v.id} value={v.id}>VLAN {v.id} — {v.name}</option>)}
                  </select>
                </div>
              )}

              {selPort.mode === "trunk" && (
                <>
                  <div>
                    <label className={`text-[10px] font-semibold block mb-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>Erlaubte VLANs</label>
                    <div className="flex flex-wrap gap-1">
                      {VLAN_DEFS.map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            const cur = selPort.trunkAllowed;
                            const next = cur.includes(v.id) ? cur.filter(x => x !== v.id) : [...cur, v.id].sort((a,b)=>a-b);
                            updatePort(selPort.num, { trunkAllowed: next });
                          }}
                          style={{ borderColor: v.color, background: selPort.trunkAllowed.includes(v.id) ? (dark ? v.bgD : v.bg) : "transparent", color: dark ? v.textD : v.text }}
                          className="text-[9px] px-1.5 py-0.5 rounded border font-semibold transition-all"
                        >
                          {v.id}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`text-[10px] font-semibold block mb-1 ${dark ? "text-slate-400" : "text-slate-600"}`}>Native VLAN</label>
                    <select
                      value={selPort.trunkNative}
                      onChange={e => updatePort(selPort.num, { trunkNative: Number(e.target.value) })}
                      className={`w-full text-xs rounded-lg border px-2 py-1 ${dark ? "bg-slate-700 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                    >
                      {VLAN_DEFS.map(v => <option key={v.id} value={v.id}>VLAN {v.id}</option>)}
                      <option value={999}>VLAN 999 (empfohlen: leer)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Tagging explanation box */}
            <div
              className="rounded-lg p-3 text-xs"
              style={{ background: te.color + (dark ? "22" : "18"), borderLeft: `3px solid ${te.color}` }}
            >
              <div className="font-semibold mb-1" style={{ color: te.color }}>
                {te.tag ? "🏷 Frames werden getaggt (802.1Q)" : "🔓 Frames werden NICHT getaggt (untagged)"}
              </div>
              <div className={dark ? "text-slate-300" : "text-slate-600"}>{te.why}</div>
              {selPort.mode === "trunk" && (
                <div className="mt-2 font-mono text-[10px] space-y-0.5" style={{ color: te.color }}>
                  {selPort.trunkAllowed.map(vid => (
                    <div key={vid}>
                      VLAN {vid}: {vid === selPort.trunkNative ? "🔓 kein Tag (Native VLAN)" : "🏷 802.1Q Tag [0x8100 + VID=" + vid + "]"}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-detected IOS commands */}
            <div className={`rounded-lg p-2 font-mono text-[10px] ${dark ? "bg-slate-900 border border-slate-700 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-700"}`}>
              <div className="text-slate-500 mb-1">Cisco IOS — automatisch generiert:</div>
              <div>interface GigabitEthernet0/{selPort.num}</div>
              {selPort.deviceLabel && <div> description {selPort.deviceLabel}</div>}
              {selPort.mode === "access" && (
                <><div> switchport mode access</div><div> switchport access vlan {selPort.accessVlan}</div><div> spanning-tree portfast</div></>
              )}
              {selPort.mode === "trunk" && (
                <><div> switchport mode trunk</div><div> switchport trunk encapsulation dot1q</div><div> switchport trunk native vlan {selPort.trunkNative}</div><div> switchport trunk allowed vlan {selPort.trunkAllowed.join(",")}</div><div> switchport nonegotiate</div></>
              )}
            </div>
          </div>
        );
      })()}

      {/* Validation panel */}
      <div className={`rounded-xl border p-3 space-y-2 ${dark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className={`text-xs font-bold flex items-center gap-2 ${dark ? "text-white" : "text-slate-900"}`}>
          🔍 Automatische Verbindungsprüfung
          <span className={`text-[10px] font-normal px-1.5 py-0.5 rounded-full ${errors.length > 0 ? "bg-red-500/20 text-red-400" : warnings.length > 0 ? "bg-amber-500/20 text-amber-400" : "bg-green-500/20 text-green-400"}`}>
            {errors.length} Fehler · {warnings.length} Warnungen · {infos.length} Info
          </span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {[...errors, ...warnings, ...infos].map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11px] ${
                issue.level === "error"
                  ? dark ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-700"
                  : issue.level === "warn"
                    ? dark ? "bg-amber-900/30 text-amber-300" : "bg-amber-50 text-amber-800"
                    : dark ? "bg-slate-700/60 text-slate-300" : "bg-slate-50 text-slate-600"
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">
                {issue.level === "error" ? "❌" : issue.level === "warn" ? "⚠️" : "ℹ️"}
              </span>
              <span className="leading-relaxed">{issue.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full config export */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowConfig(showConfig === "switch" ? null : "switch")}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${showConfig === "switch" ? "bg-indigo-600 text-white border-indigo-600" : dark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
        >
          📋 Switch-Config
        </button>
        <button
          onClick={() => setShowConfig(showConfig === "router" ? null : "router")}
          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${showConfig === "router" ? "bg-indigo-600 text-white border-indigo-600" : dark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
        >
          📋 Router-Config
        </button>
      </div>

      {showConfig && (
        <pre className={`text-[10px] rounded-xl p-3 font-mono overflow-x-auto ${dark ? "bg-slate-900 border border-slate-700 text-slate-300" : "bg-slate-100 border border-slate-200 text-slate-700"}`}>
          {showConfig === "switch"
            ? generateSwitchConfig(ports)
            : generateRouterConfig(router, trunkToRouterPort?.num ?? null)}
        </pre>
      )}
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
    { id: "frame",    label: "Frame-Vivisektor" },
    { id: "topology", label: "Topologie-Simulator" },
    { id: "trunk",    label: "Trunk-Animation" },
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
          {tab === "topology" && <TopologySimulator dark={dark} />}
          {tab === "trunk"  && <TrunkAnimation dark={dark} />}
        </div>
      </div>
    </div>
  );
}

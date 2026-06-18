import { useState, useCallback, useMemo } from "react";
import { Plus, Trash, Copy, Check, CaretDown, CaretRight } from "@phosphor-icons/react";

// ─── Types ───────────────────────────────────────────────────
interface SegmentInput {
  id: string;
  name: string;
  hosts: string;
  vlan: string;
  color: string;
}

interface SubnetResult {
  segment: SegmentInput;
  networkAddress: string;
  subnetMask: string;
  cidr: number;
  gateway: string;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  usableHosts: number;
  blockSize: number;
}

// ─── Constants ───────────────────────────────────────────────
const ZONE_COLORS = [
  "#6366f1", // indigo - client
  "#10b981", // emerald - server
  "#f59e0b", // amber - dmz
  "#ef4444", // red - management
  "#8b5cf6", // violet - wlan
  "#06b6d4", // cyan - guests
  "#f97316", // orange
  "#84cc16", // lime
];

const PRESET_ZONES = [
  { name: "Client-Zone", hosts: "50", vlan: "10" },
  { name: "Server-Zone", hosts: "20", vlan: "20" },
  { name: "WLAN", hosts: "30", vlan: "30" },
  { name: "Gäste-WLAN", hosts: "15", vlan: "40" },
  { name: "DMZ", hosts: "8", vlan: "50" },
  { name: "Management", hosts: "5", vlan: "99" },
];

let _id = 0;
const nextId = () => `seg-${++_id}`;

// ─── IP Helpers ──────────────────────────────────────────────
function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

function numToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function cidrToMask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

function maskToStr(prefix: number): string {
  const m = cidrToMask(prefix);
  return numToIp(m);
}

function hostsNeededToCidr(hosts: number): number {
  // find smallest prefix such that 2^(32-prefix) - 2 >= hosts
  for (let prefix = 30; prefix >= 1; prefix--) {
    const usable = Math.pow(2, 32 - prefix) - 2;
    if (usable >= hosts) return prefix;
  }
  return 1;
}

function parseBaseNetwork(cidrStr: string): { baseIp: number; prefix: number } | null {
  const m = cidrStr.trim().match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
  if (!m) return null;
  const prefix = parseInt(m[2], 10);
  if (prefix < 8 || prefix > 30) return null;
  const ip = ipToNum(m[1]);
  if (isNaN(ip)) return null;
  const mask = cidrToMask(prefix);
  const baseIp = (ip & mask) >>> 0; // align to network boundary
  return { baseIp, prefix };
}

function calculateVlsm(
  baseIp: number,
  basePrefix: number,
  segments: SegmentInput[]
): SubnetResult[] | string {
  const baseSize = Math.pow(2, 32 - basePrefix);
  const baseEnd = baseIp + baseSize - 1;

  // Sort by required hosts descending (VLSM rule: largest first)
  const sorted = [...segments]
    .filter((s) => s.name.trim() && parseInt(s.hosts) > 0)
    .map((s) => ({ seg: s, hosts: parseInt(s.hosts) || 1 }))
    .sort((a, b) => b.hosts - a.hosts);

  const results: SubnetResult[] = [];
  let currentIp = baseIp;

  for (const { seg, hosts } of sorted) {
    const prefix = hostsNeededToCidr(hosts);
    const blockSize = Math.pow(2, 32 - prefix);

    // Align currentIp to block boundary
    const rem = currentIp % blockSize;
    if (rem !== 0) currentIp += blockSize - rem;

    const networkIp = currentIp;
    const broadcastIp = networkIp + blockSize - 1;

    if (broadcastIp > baseEnd) {
      return `Nicht genug Adressraum! Das Subnetz für "${seg.name}" (/${prefix}, ${blockSize} Adressen) passt nicht mehr ins Basis-Netz.`;
    }

    results.push({
      segment: seg,
      networkAddress: numToIp(networkIp),
      subnetMask: maskToStr(prefix),
      cidr: prefix,
      gateway: numToIp(networkIp + 1),
      firstHost: numToIp(networkIp + 2),
      lastHost: numToIp(broadcastIp - 1),
      broadcast: numToIp(broadcastIp),
      usableHosts: blockSize - 2,
      blockSize,
    });

    currentIp = broadcastIp + 1;
  }

  return results;
}

// ─── Gleich große Subnetze (FLSM, anhand Netz-ID) ────────────
export interface EqualSplitResult {
  results: SubnetResult[];
  newPrefix: number;
  subnetBits: number;
  blockSize: number;
  total: number;
}

export function calculateEqualSplit(
  baseIp: number,
  basePrefix: number,
  numSubnets: number,
): EqualSplitResult | string {
  if (!Number.isFinite(numSubnets) || numSubnets < 2) {
    return "Bitte in mindestens 2 Subnetze aufteilen.";
  }
  const subnetBits = Math.ceil(Math.log2(numSubnets));
  const newPrefix = basePrefix + subnetBits;
  if (newPrefix > 30) {
    return `Zu fein unterteilt: /${newPrefix} überschreitet /30. Wähle weniger Subnetze oder ein größeres Basis-Netz.`;
  }
  const total = Math.pow(2, subnetBits);
  if (total > 256) {
    return "Mehr als 256 Subnetze werden nicht dargestellt. Wähle weniger Subnetze.";
  }
  const blockSize = Math.pow(2, 32 - newPrefix);

  const results: SubnetResult[] = Array.from({ length: total }, (_, i) => {
    const networkIp = (baseIp + i * blockSize) >>> 0;
    const broadcastIp = (networkIp + blockSize - 1) >>> 0;
    const seg: SegmentInput = {
      id: `eq-${i + 1}`,
      name: `Subnetz ${i + 1}`,
      hosts: String(blockSize - 2),
      vlan: String((i + 1) * 10),
      color: ZONE_COLORS[i % ZONE_COLORS.length],
    };
    return {
      segment: seg,
      networkAddress: numToIp(networkIp),
      subnetMask: maskToStr(newPrefix),
      cidr: newPrefix,
      gateway: numToIp((networkIp + 1) >>> 0),
      firstHost: numToIp((networkIp + 1) >>> 0),
      lastHost: numToIp((broadcastIp - 1) >>> 0),
      broadcast: numToIp(broadcastIp),
      usableHosts: blockSize - 2,
      blockSize,
    };
  });

  return { results, newPrefix, subnetBits, blockSize, total };
}

// ─── Cisco IOS Config Generator ──────────────────────────────
function generateCiscoConfig(baseNet: string, results: SubnetResult[]): string {
  const lines: string[] = [];
  lines.push(`! Netzwerk-Segmentierung Konfiguration`);
  lines.push(`! Basis-Netz: ${baseNet}`);
  lines.push(`! Generiert vom Subnetz-Planer`);
  lines.push(``);
  lines.push(`! ── Switch: VLANs anlegen ──`);
  for (const r of results) {
    const vlan = r.segment.vlan || "?";
    lines.push(`vlan ${vlan}`);
    lines.push(` name ${r.segment.name.replace(/\s+/g, "-")}`);
  }
  lines.push(``);
  lines.push(`! ── Trunk-Port zum Router ──`);
  const vlanList = results.map((r) => r.segment.vlan).filter(Boolean).join(",");
  lines.push(`interface GigabitEthernet0/1`);
  lines.push(` switchport mode trunk`);
  lines.push(` switchport trunk allowed vlan ${vlanList}`);
  lines.push(` description Uplink-zum-Router`);
  lines.push(``);
  lines.push(`! ── Router-on-a-Stick Sub-Interfaces ──`);
  lines.push(`interface GigabitEthernet0/0`);
  lines.push(` no shutdown`);
  for (const r of results) {
    const vlan = r.segment.vlan || "X";
    lines.push(``);
    lines.push(`interface GigabitEthernet0/0.${vlan}`);
    lines.push(` encapsulation dot1Q ${vlan}`);
    lines.push(` ip address ${r.gateway} ${r.subnetMask}`);
    lines.push(` description ${r.segment.name.replace(/\s+/g, "-")}`);
  }
  lines.push(``);
  lines.push(`! ── Verifizierung ──`);
  lines.push(`! show ip interface brief`);
  lines.push(`! show ip route`);
  lines.push(`! show vlan brief`);
  return lines.join("\n");
}

// ─── Block Diagram ───────────────────────────────────────────
function BlockDiagram({
  results,
  basePrefix,
  dark,
}: {
  results: SubnetResult[];
  basePrefix: number;
  dark: boolean;
}) {
  const totalAddresses = Math.pow(2, 32 - basePrefix);
  const usedAddresses = results.reduce((s, r) => s + r.blockSize, 0);
  const freeAddresses = totalAddresses - usedAddresses;

  return (
    <div className="space-y-1.5">
      {results.map((r) => {
        const widthPct = (r.blockSize / totalAddresses) * 100;
        return (
          <div key={r.segment.id} className="flex items-center gap-2">
            <div className="w-28 text-xs truncate shrink-0" style={{ color: r.segment.color }}>
              {r.segment.name}
            </div>
            <div className="flex-1 h-6 rounded overflow-hidden bg-slate-700/20 relative">
              <div
                className="h-full rounded flex items-center px-2"
                style={{ width: `${Math.max(widthPct, 2)}%`, backgroundColor: r.segment.color + "40", borderLeft: `3px solid ${r.segment.color}` }}
              >
                <span className="text-xs font-mono whitespace-nowrap" style={{ color: dark ? "#e2e8f0" : "#1e293b" }}>
                  {r.networkAddress}/{r.cidr} · {r.usableHosts} Hosts
                </span>
              </div>
            </div>
            <div className={`text-xs w-8 text-right ${dark ? "text-slate-500" : "text-slate-400"}`}>
              /{r.cidr}
            </div>
          </div>
        );
      })}
      {freeAddresses > 0 && (
        <div className="flex items-center gap-2">
          <div className={`w-28 text-xs shrink-0 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            (frei)
          </div>
          <div className="flex-1 h-6 rounded overflow-hidden">
            <div
              className={`h-full rounded border border-dashed flex items-center px-2 ${dark ? "border-slate-600 text-slate-500" : "border-slate-300 text-slate-400"}`}
              style={{ width: `${Math.max((freeAddresses / totalAddresses) * 100, 2)}%` }}
            >
              <span className="text-xs">{freeAddresses} Adressen frei</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
interface SubnetSegmentationToolProps {
  dark: boolean;
}

export function SubnetSegmentationTool({ dark }: SubnetSegmentationToolProps) {
  const [baseNetwork, setBaseNetwork] = useState("10.10.0.0/22");
  const [segments, setSegments] = useState<SegmentInput[]>(() =>
    PRESET_ZONES.map((z, i) => ({
      id: nextId(),
      name: z.name,
      hosts: z.hosts,
      vlan: z.vlan,
      color: ZONE_COLORS[i % ZONE_COLORS.length],
    }))
  );
  const [mode, setMode] = useState<"vlsm" | "equal">("vlsm");
  const [numSubnets, setNumSubnets] = useState("4");
  const [splitInfo, setSplitInfo] = useState<EqualSplitResult | null>(null);
  const [results, setResults] = useState<SubnetResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = dark ? "text-white" : "text-slate-900";
  const textMuted = dark ? "text-slate-400" : "text-slate-500";
  const bg = dark ? "bg-slate-800" : "bg-white";
  const bgCard = dark ? "bg-slate-900/50" : "bg-slate-50";
  const border = dark ? "border-slate-700" : "border-slate-200";
  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm ${dark ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"} focus:outline-none focus:ring-2 focus:ring-indigo-500/50`;

  const addSegment = useCallback(() => {
    setSegments((prev) => [
      ...prev,
      {
        id: nextId(),
        name: `Zone ${prev.length + 1}`,
        hosts: "10",
        vlan: String(10 + prev.length * 10),
        color: ZONE_COLORS[prev.length % ZONE_COLORS.length],
      },
    ]);
  }, []);

  const removeSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSegment = useCallback((id: string, field: keyof SegmentInput, value: string) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }, []);

  const calculate = useCallback(() => {
    setError(null);
    setResults(null);
    setSplitInfo(null);
    setShowConfig(false);

    const parsed = parseBaseNetwork(baseNetwork);
    if (!parsed) {
      setError("Ungültiges Basis-Netz. Beispiel: 10.10.0.0/22");
      return;
    }

    if (mode === "equal") {
      const n = parseInt(numSubnets, 10);
      const res = calculateEqualSplit(parsed.baseIp, parsed.prefix, n);
      if (typeof res === "string") {
        setError(res);
      } else {
        setSplitInfo(res);
        setResults(res.results);
      }
      return;
    }

    const valid = segments.filter((s) => s.name.trim() && parseInt(s.hosts) > 0);
    if (valid.length === 0) {
      setError("Bitte mindestens eine Zone mit Name und Host-Anzahl eintragen.");
      return;
    }

    const res = calculateVlsm(parsed.baseIp, parsed.prefix, valid);
    if (typeof res === "string") {
      setError(res);
    } else {
      setResults(res);
    }
  }, [baseNetwork, segments, mode, numSubnets]);

  const ciscoConfig = useMemo(() => {
    if (!results) return "";
    return generateCiscoConfig(baseNetwork, results);
  }, [results, baseNetwork]);

  const copyConfig = useCallback(() => {
    navigator.clipboard.writeText(ciscoConfig).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [ciscoConfig]);

  const parsedBase = parseBaseNetwork(baseNetwork);
  const totalAddresses = parsedBase ? Math.pow(2, 32 - parsedBase.prefix) : 0;

  return (
    <div className={`rounded-2xl border ${border} ${bg} overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${border} ${dark ? "bg-slate-800/50" : "bg-indigo-50"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${dark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
            🔢
          </div>
          <div>
            <h3 className={`font-semibold text-sm ${text}`}>Subnetz-Segmentierungsplaner</h3>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              {mode === "equal"
                ? "Netz-ID eingeben → in gleich große Subnetze aufteilen (FLSM)"
                : "Basis-Netz eingeben → Zonen definieren → VLSM berechnen"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Mode toggle */}
        <div className={`flex gap-1 p-1 rounded-xl ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
          {([
            ["vlsm", "VLSM — nach Bedarf"],
            ["equal", "Gleich groß (FLSM)"],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResults(null);
                setSplitInfo(null);
                setError(null);
                setShowConfig(false);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : dark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
              }`}
              aria-pressed={mode === m}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Base Network Input */}
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${textMuted}`}>
            {mode === "equal" ? "Netz-ID (CIDR)" : "Basis-Netz (CIDR)"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={baseNetwork}
              onChange={(e) => setBaseNetwork(e.target.value)}
              className={`${inputCls} font-mono`}
              placeholder="z.B. 10.10.0.0/22"
              spellCheck={false}
            />
            {parsedBase && (
              <div className={`px-3 py-2 rounded-lg border text-xs font-mono shrink-0 ${dark ? "bg-slate-700 border-slate-600 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                {totalAddresses.toLocaleString()} Adr.
              </div>
            )}
          </div>
        </div>

        {/* Equal-split control (FLSM) */}
        {mode === "equal" && (
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${textMuted}`}>
              In wie viele gleich große Subnetze aufteilen?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[2, 4, 8, 16, 32, 64].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumSubnets(String(n))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                    parseInt(numSubnets, 10) === n
                      ? "bg-indigo-600 text-white"
                      : dark
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                min="2"
                max="256"
                value={numSubnets}
                onChange={(e) => setNumSubnets(e.target.value)}
                className={`w-20 px-2 py-1.5 rounded-lg border text-xs font-mono ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"} focus:outline-none focus:ring-1 focus:ring-indigo-500/50`}
                aria-label="Anzahl Subnetze"
              />
            </div>
            <p className={`mt-2 text-xs ${textMuted}`}>
              Die Aufteilung erfolgt gleichmäßig ab der Netz-ID. Bei einer Zahl, die keine
              Zweierpotenz ist, wird auf die nächste Zweierpotenz aufgerundet.
            </p>
          </div>
        )}

        {/* Segments Table (VLSM only) */}
        {mode === "vlsm" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-xs font-medium ${textMuted}`}>
              Zonen / Segmente ({segments.length})
            </label>
            <button
              onClick={addSegment}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${dark ? "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"}`}
            >
              <Plus size={12} weight="bold" />
              Zone hinzufügen
            </button>
          </div>

          <div className={`rounded-xl border ${border} overflow-hidden`}>
            {/* Table Header */}
            <div className={`grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium ${textMuted} ${dark ? "bg-slate-800" : "bg-slate-50"} border-b ${border}`}>
              <div className="col-span-1">Farbe</div>
              <div className="col-span-4">Zone</div>
              <div className="col-span-3">Hosts (mind.)</div>
              <div className="col-span-3">VLAN-ID</div>
              <div className="col-span-1"></div>
            </div>

            {segments.map((seg) => (
              <div key={seg.id} className={`grid grid-cols-12 gap-2 px-3 py-2 items-center border-b last:border-0 ${border} ${dark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"} transition-colors`}>
                <div className="col-span-1 flex items-center">
                  <input
                    type="color"
                    value={seg.color}
                    onChange={(e) => updateSegment(seg.id, "color", e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    title="Farbe wählen"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={seg.name}
                    onChange={(e) => updateSegment(seg.id, "name", e.target.value)}
                    className={`w-full px-2 py-1 rounded-lg border text-xs ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"} focus:outline-none focus:ring-1 focus:ring-indigo-500/50`}
                    placeholder="Zone-Name"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={seg.hosts}
                    onChange={(e) => updateSegment(seg.id, "hosts", e.target.value)}
                    min="1"
                    max="65534"
                    className={`w-full px-2 py-1 rounded-lg border text-xs font-mono ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"} focus:outline-none focus:ring-1 focus:ring-indigo-500/50`}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={seg.vlan}
                    onChange={(e) => updateSegment(seg.id, "vlan", e.target.value)}
                    min="1"
                    max="4094"
                    className={`w-full px-2 py-1 rounded-lg border text-xs font-mono ${dark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"} focus:outline-none focus:ring-1 focus:ring-indigo-500/50`}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => removeSegment(seg.id)}
                    className={`p-1 rounded transition-colors ${dark ? "text-slate-500 hover:text-red-400 hover:bg-red-500/10" : "text-slate-400 hover:text-red-500 hover:bg-red-50"}`}
                    aria-label="Zone löschen"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Calculate Button */}
        <button
          onClick={calculate}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
        >
          {mode === "equal" ? "In gleich große Subnetze aufteilen →" : "VLSM berechnen →"}
        </button>

        {/* Error */}
        {error && (
          <div className={`p-4 rounded-xl border-l-4 border-red-500 ${dark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-700"} text-sm`}>
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-5">
            {/* Rechenweg (FLSM) */}
            {mode === "equal" && splitInfo && parsedBase && (
              <div className={`rounded-xl border p-4 text-xs ${dark ? "border-indigo-500/30 bg-indigo-500/10 text-slate-300" : "border-indigo-200 bg-indigo-50 text-slate-700"}`}>
                <div className={`mb-2 font-semibold ${dark ? "text-indigo-200" : "text-indigo-800"}`}>
                  Rechenweg
                </div>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>
                    {parseInt(numSubnets, 10)} Subnetze benötigt → 2<sup>{splitInfo.subnetBits}</sup> ={" "}
                    {splitInfo.total} ≥ {parseInt(numSubnets, 10)} → {splitInfo.subnetBits} Subnetz-Bit(s) borgen.
                  </li>
                  <li>
                    Neue Präfixlänge: /{parsedBase.prefix} + {splitInfo.subnetBits} = <strong>/{splitInfo.newPrefix}</strong>{" "}
                    → Maske {maskToStr(splitInfo.newPrefix)}.
                  </li>
                  <li>
                    Blockgröße (Schrittweite): 2<sup>{32 - splitInfo.newPrefix}</sup> ={" "}
                    <strong>{splitInfo.blockSize.toLocaleString()}</strong> Adressen, davon {splitInfo.blockSize - 2} nutzbar.
                  </li>
                  <li>
                    Ergebnis: <strong>{splitInfo.total}</strong> gleich große Subnetze ab {results[0].networkAddress}.
                  </li>
                </ol>
              </div>
            )}

            {/* Block Diagram */}
            <div className={`rounded-xl border ${border} ${bgCard} p-4`}>
              <h4 className={`text-xs font-semibold mb-3 ${textMuted} uppercase tracking-wide`}>
                Adressraum-Visualisierung
              </h4>
              <BlockDiagram
                results={results}
                basePrefix={parsedBase!.prefix}
                dark={dark}
              />
            </div>

            {/* Results Table */}
            <div className={`rounded-xl border ${border} overflow-hidden`}>
              <div className={`px-4 py-3 border-b ${border} ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}>
                <h4 className={`text-xs font-semibold ${textMuted} uppercase tracking-wide`}>
                  Berechnete Subnetze
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={`border-b ${border} ${dark ? "bg-slate-800/30" : "bg-slate-50"}`}>
                      {["Zone", "VLAN", "Subnetz", "Maske", "Gateway", "Erster Host", "Letzter Host", "Broadcast", "Hosts"].map((h) => (
                        <th key={h} className={`px-3 py-2 text-left font-medium ${textMuted} whitespace-nowrap`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={r.segment.id}
                        className={`border-b last:border-0 ${border} ${i % 2 === 0 ? (dark ? "bg-transparent" : "bg-white") : (dark ? "bg-slate-800/20" : "bg-slate-50/50")}`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.segment.color }} />
                            <span className={`font-medium ${text}`}>{r.segment.name}</span>
                          </div>
                        </td>
                        <td className={`px-3 py-2.5 font-mono ${text}`}>{r.segment.vlan}</td>
                        <td className={`px-3 py-2.5 font-mono font-semibold ${text}`}>{r.networkAddress}/{r.cidr}</td>
                        <td className={`px-3 py-2.5 font-mono ${textMuted}`}>{r.subnetMask}</td>
                        <td className={`px-3 py-2.5 font-mono ${dark ? "text-emerald-400" : "text-emerald-700"}`}>{r.gateway}</td>
                        <td className={`px-3 py-2.5 font-mono ${textMuted}`}>{r.firstHost}</td>
                        <td className={`px-3 py-2.5 font-mono ${textMuted}`}>{r.lastHost}</td>
                        <td className={`px-3 py-2.5 font-mono ${dark ? "text-red-400" : "text-red-600"}`}>{r.broadcast}</td>
                        <td className={`px-3 py-2.5 font-mono font-semibold ${dark ? "text-indigo-300" : "text-indigo-700"}`}>{r.usableHosts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cisco Config Toggle */}
            <div className={`rounded-xl border ${border} overflow-hidden`}>
              <button
                onClick={() => setShowConfig((v) => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${dark ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🖥️</span>
                  <span className={`text-sm font-medium ${text}`}>Cisco IOS Konfiguration</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                    Router-on-a-Stick
                  </span>
                </div>
                {showConfig ? <CaretDown size={16} className={textMuted} /> : <CaretRight size={16} className={textMuted} />}
              </button>

              {showConfig && (
                <div className={`border-t ${border}`}>
                  <div className="flex justify-end px-4 py-2 border-b border-opacity-50" style={{ borderColor: dark ? "#334155" : "#e2e8f0" }}>
                    <button
                      onClick={copyConfig}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${copied ? (dark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-700") : (dark ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}`}
                    >
                      {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
                      {copied ? "Kopiert!" : "Kopieren"}
                    </button>
                  </div>
                  <pre className={`p-4 text-xs font-mono leading-relaxed overflow-x-auto ${dark ? "text-slate-300 bg-slate-950/50" : "text-slate-700 bg-slate-50"}`}>
                    {ciscoConfig}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

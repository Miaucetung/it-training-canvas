// ============================================================
// IPv6CalculatorDialog
// Vier Tabs:
//  1) Adress-Analyse  — Vollform / Kurzform / Typ / Präfix / Interface-ID
//  2) EUI-64          — MAC → Interface-ID Schritt für Schritt
//  3) Segmentierung   — IPv6-Präfix aufteilen (wie IPv4-Segmentierung)
//  4) Drill           — Zufällige Übungsaufgaben: Typ, Expand, Compress, EUI-64
// ============================================================

import {
  ArrowClockwise,
  Calculator,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useCallback, useState } from "react";

// ── Types ────────────────────────────────────────────────────

type IPv6Tab = "analyse" | "eui64" | "segmentation" | "drill";
type DrillType = "type" | "expand" | "compress" | "eui64" | "prefix";

export type IPv6AddrType =
  | "loopback"
  | "unspecified"
  | "link-local"
  | "unique-local"
  | "multicast"
  | "global-unicast"
  | "unknown";

interface TypeInfo {
  type: IPv6AddrType;
  label: string;
  description: string;
  prefix: string;
  badgeClass: string;
}

interface EUI64Step {
  label: string;
  value: string;
  explanation: string;
}

export interface EUI64Result {
  steps: EUI64Step[];
  interfaceId: string;
}

export interface IPv6Subnet {
  networkAddress: string;
  prefixLength: number;
}

export interface SegResult {
  subnets: IPv6Subnet[];
  subnetBits: number;
  totalCount: bigint;
  showFirst: number;
}

interface DrillTask {
  drillType: DrillType;
  question: string;
  input: string;
  answer: string;
  choices?: string[];
  hint: string;
  explanation: string;
  /** Optional normalizer: expand both sides before comparing, so different forms match. */
  answerNormalize?: (s: string) => string;
}

// ── IPv6 Engine (exported for tests) ─────────────────────────

/** Expands a compressed/partial IPv6 address to full 8×4-hex-group form. */
export function expandIPv6(input: string): string | null {
  const t = input.trim().toLowerCase().replace(/\s/g, "");
  if (!t) return null;
  let parts: string[];
  if (t.includes("::")) {
    const sides = t.split("::");
    if (sides.length !== 2) return null;
    const L = sides[0] ? sides[0].split(":") : [];
    const R = sides[1] ? sides[1].split(":") : [];
    const pad = 8 - L.length - R.length;
    if (pad < 0) return null;
    parts = [...L, ...Array<string>(pad).fill("0"), ...R];
  } else {
    parts = t.split(":");
  }
  if (parts.length !== 8) return null;
  const result: string[] = [];
  for (const p of parts) {
    if (!/^[0-9a-f]{0,4}$/.test(p)) return null;
    result.push((p || "0").padStart(4, "0"));
  }
  return result.join(":");
}

/** Compresses a full 8×4-hex-group IPv6 address to shortest notation. */
export function compressIPv6(expanded: string): string {
  const g = expanded.toLowerCase().split(":");
  if (g.length !== 8) return expanded;
  const s = g.map((x) => x.replace(/^0+/, "") || "0");
  let bS = -1,
    bL = 0,
    cS = -1,
    cL = 0;
  for (let i = 0; i < 8; i++) {
    if (s[i] === "0") {
      if (cS === -1) {
        cS = i;
        cL = 1;
      } else cL++;
      if (cL > bL) {
        bL = cL;
        bS = cS;
      }
    } else {
      cS = -1;
      cL = 0;
    }
  }
  if (bL < 2) return s.join(":");
  const before = s.slice(0, bS).join(":");
  const after = s.slice(bS + bL).join(":");
  if (bS === 0 && bS + bL === 8) return "::";
  if (bS === 0) return `::${after}`;
  if (bS + bL === 8) return `${before}::`;
  return `${before}::${after}`;
}

/** Returns the address type with label and description. */
export function getIPv6Type(input: string): TypeInfo {
  const exp = expandIPv6(input);
  if (!exp)
    return {
      type: "unknown",
      label: "Ungültige Adresse",
      description: "Die Adresse konnte nicht verarbeitet werden.",
      prefix: "",
      badgeClass: "bg-slate-500",
    };
  if (exp === "0000:0000:0000:0000:0000:0000:0000:0001")
    return {
      type: "loopback",
      label: "Loopback",
      description:
        "Wie 127.0.0.1 bei IPv4 — nur für lokale Tests auf dem Gerät selbst. Kein Routing.",
      prefix: "::1/128",
      badgeClass: "bg-purple-500",
    };
  if (exp === "0000:0000:0000:0000:0000:0000:0000:0000")
    return {
      type: "unspecified",
      label: "Nicht spezifiziert",
      description:
        "Adresse noch nicht zugewiesen (wie 0.0.0.0 bei IPv4). Wird beim Bootstrapping verwendet.",
      prefix: "::/128",
      badgeClass: "bg-slate-500",
    };
  const f = parseInt(exp.split(":")[0], 16);
  if ((f & 0xff00) === 0xff00)
    return {
      type: "multicast",
      label: "Multicast",
      description:
        "Eine-zu-Viele. Scope im zweiten Nibble: FF02 = Link-Local, FF05 = Site-Local, FF0E = Global.",
      prefix: "FF00::/8",
      badgeClass: "bg-orange-500",
    };
  if ((f & 0xffc0) === 0xfe80)
    return {
      type: "link-local",
      label: "Link-Local",
      description:
        "Nur im lokalen Netzwerksegment gültig. Automatisch per NDP konfiguriert. Router leiten Link-Local-Pakete nie weiter.",
      prefix: "FE80::/10",
      badgeClass: "bg-sky-500",
    };
  if ((f & 0xfe00) === 0xfc00)
    return {
      type: "unique-local",
      label: "Unique Local (ULA)",
      description:
        "Privat routbar innerhalb einer Organisation (wie RFC 1918). Nicht global routbar. In der Praxis meist FD::-Adressen mit Zufalls-Präfix.",
      prefix: "FC00::/7",
      badgeClass: "bg-emerald-500",
    };
  if ((f & 0xe000) === 0x2000)
    return {
      type: "global-unicast",
      label: "Global Unicast (GUA)",
      description:
        "Öffentlich routbar. Beginnt mit 2000::/3 (erste 3 Bits = 001). ISP vergibt /32, Organisation /48, Subnetz /64.",
      prefix: "2000::/3",
      badgeClass: "bg-indigo-500",
    };
  return {
    type: "unknown",
    label: "Reserviert/Unbekannt",
    description:
      "Reservierter Adressbereich — aktuell nicht für allgemeine Nutzung zugewiesen.",
    prefix: "",
    badgeClass: "bg-slate-400",
  };
}

/** Computes EUI-64 interface ID from a MAC address with step-by-step explanation. */
export function eui64FromMac(mac: string): EUI64Result | null {
  const c = mac.replace(/[:\-.\s]/g, "");
  if (!/^[0-9a-fA-F]{12}$/.test(c)) return null;
  const bytes = (c.match(/.{2}/g) as string[]).map((b) => parseInt(b, 16));
  const [a, b, cv, d, e, f] = bytes;
  const fmt = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  const fl = a ^ 0x02;
  const all = [fl, b, cv, 0xff, 0xfe, d, e, f];
  const interfaceId = [
    all.slice(0, 2),
    all.slice(2, 4),
    all.slice(4, 6),
    all.slice(6, 8),
  ]
    .map((p) => p.map(fmt).join(""))
    .join(":");
  return {
    interfaceId,
    steps: [
      {
        label: "1. Original MAC-Adresse",
        value: bytes.map(fmt).join(":"),
        explanation:
          "Die 48-Bit MAC-Adresse (EUI-48) des Netzwerkadapters — eindeutig vom Hersteller vergeben.",
      },
      {
        label: "2. OUI | Geräte-ID trennen",
        value: `OUI: ${[a, b, cv].map(fmt).join(":")}  ·  Geräte-ID: ${[d, e, f].map(fmt).join(":")}`,
        explanation:
          "Die MAC wird in die 24-Bit Hersteller-ID (OUI = Organizationally Unique Identifier) und die 24-Bit gerätespezifische ID aufgeteilt.",
      },
      {
        label: "3. FF:FE in die Mitte einfügen",
        value: `${[a, b, cv].map(fmt).join(":")}:FF:FE:${[d, e, f].map(fmt).join(":")}`,
        explanation:
          "Die bekannten Bytes 0xFF:0xFE werden zwischen OUI und Geräte-ID eingefügt — 48 Bit wachsen auf 64 Bit (EUI-64).",
      },
      {
        label: `4. U/L-Bit invertieren  0x${fmt(a)} → 0x${fmt(fl)}`,
        value: `${fmt(fl)}:${fmt(b)}:${fmt(cv)}:FF:FE:${[d, e, f].map(fmt).join(":")}`,
        explanation: `Bit 7 (Universal/Local-Bit) des ersten Oktetts wird per XOR 0x02 invertiert: 0x${fmt(a)} ^ 0x02 = 0x${fmt(fl)}. Bei IEEE-registrierten MACs ist dieses Bit 0 — nach Invertierung steht 1 für „universell vergeben".`,
      },
      {
        label: "5. Interface-ID (IPv6-Gruppen)",
        value: interfaceId,
        explanation: `8 Bytes → 4 Gruppen à 16 Bit. Vollständige SLAAC-Adresse: z.B. 2001:DB8:1::${interfaceId}/64`,
      },
    ],
  };
}

function bigIntToIPv6(n: bigint): string {
  const groups: string[] = [];
  for (let i = 0; i < 8; i++)
    groups.push(
      ((n >> BigInt(16 * (7 - i))) & BigInt(0xffff))
        .toString(16)
        .padStart(4, "0"),
    );
  return compressIPv6(groups.join(":"));
}

/** Divides an IPv6 prefix into subnets of a larger prefix length. */
export function calcIPv6Segmentation(
  prefixWithCidr: string,
  newCidr: number,
): SegResult | null {
  const m = prefixWithCidr.match(/^(.+?)\/(\d+)$/);
  if (!m) return null;
  const origCidr = parseInt(m[2], 10);
  if (
    isNaN(origCidr) ||
    isNaN(newCidr) ||
    newCidr <= origCidr ||
    newCidr > 128 ||
    origCidr < 0
  )
    return null;
  const exp = expandIPv6(m[1]);
  if (!exp) return null;
  let base = BigInt(0);
  for (const gr of exp.split(":").map((x) => parseInt(x, 16)))
    base = (base << BigInt(16)) | BigInt(gr);
  const mask =
    origCidr === 0
      ? BigInt(0)
      : ((BigInt(1) << BigInt(origCidr)) - BigInt(1)) << BigInt(128 - origCidr);
  const networkBase = base & mask;
  const subnetBits = newCidr - origCidr;
  const totalCount = BigInt(1) << BigInt(subnetBits);
  const subnetSize = BigInt(1) << BigInt(128 - newCidr);
  const showFirst = Number(totalCount < BigInt(8) ? totalCount : BigInt(8));
  return {
    subnets: Array.from({ length: showFirst }, (_, i) => ({
      networkAddress: bigIntToIPv6(networkBase + BigInt(i) * subnetSize),
      prefixLength: newCidr,
    })),
    subnetBits,
    totalCount,
    showFirst,
  };
}

// ── Drill Task Generator ──────────────────────────────────────

const TYPE_POOL: IPv6AddrType[] = [
  "global-unicast",
  "link-local",
  "unique-local",
  "multicast",
  "loopback",
];
const TYPE_LABELS: Record<IPv6AddrType, string> = {
  loopback: "Loopback",
  unspecified: "Nicht spezifiziert",
  "link-local": "Link-Local",
  "unique-local": "Unique Local (ULA)",
  multicast: "Multicast",
  "global-unicast": "Global Unicast (GUA)",
  unknown: "Reserviert",
};

function rHex(n: number) {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function randomAddr(t: IPv6AddrType): string {
  switch (t) {
    case "loopback":
      return "::1";
    case "multicast":
      return `ff0${["2", "5", "8", "e"][Math.floor(Math.random() * 4)]}::${rHex(1)}`;
    case "link-local":
      return `fe80::${rHex(4)}:${rHex(4)}:${rHex(4)}:${rHex(4)}`;
    case "unique-local":
      return `fd${rHex(2)}:${rHex(4)}:${rHex(4)}::${rHex(1)}`;
    case "global-unicast":
      return `2001:db8:${rHex(4)}:${rHex(4)}::${rHex(1)}`;
    default:
      return "::1";
  }
}

/** Returns the network (prefix) address for an address/CIDR string, compressed. */
export function calcIPv6Prefix(addrWithCidr: string): { network: string; prefixLen: number } | null {
  const m = addrWithCidr.trim().match(/^(.+?)\/(\d+)$/);
  if (!m) return null;
  const prefixLen = parseInt(m[2], 10);
  if (isNaN(prefixLen) || prefixLen < 0 || prefixLen > 128) return null;
  const exp = expandIPv6(m[1].trim());
  if (!exp) return null;
  let addr = BigInt(0);
  for (const g of exp.split(":")) addr = (addr << BigInt(16)) | BigInt(parseInt(g, 16));
  const mask =
    prefixLen === 0
      ? BigInt(0)
      : ((BigInt(1) << BigInt(prefixLen)) - BigInt(1)) << BigInt(128 - prefixLen);
  return { network: bigIntToIPv6(addr & mask), prefixLen };
}

function makeDrillTask(dt?: DrillType): DrillTask {
  const all: DrillType[] = ["type", "expand", "compress", "eui64", "prefix"];
  const drillType = dt ?? all[Math.floor(Math.random() * all.length)];
  switch (drillType) {
    case "type": {
      const pick = TYPE_POOL[Math.floor(Math.random() * TYPE_POOL.length)];
      const addr = randomAddr(pick);
      const info = getIPv6Type(addr);
      const others = TYPE_POOL.filter((x) => x !== pick)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((x) => TYPE_LABELS[x]);
      const choices = [info.label, ...others].sort(() => Math.random() - 0.5);
      return {
        drillType: "type",
        question: "Welcher IPv6-Adresstyp ist diese Adresse?",
        input: addr,
        answer: info.label,
        choices,
        hint: "FF00 → Multicast | FE80 → Link-Local | FC/FD → ULA | 2xxx/3xxx → GUA | ::1 → Loopback",
        explanation: `${info.label} (${info.prefix}): ${info.description}`,
      };
    }
    case "expand": {
      const t = TYPE_POOL[Math.floor(Math.random() * TYPE_POOL.length)];
      const compressed = randomAddr(t);
      const expanded = expandIPv6(compressed) ?? compressed;
      return {
        drillType: "expand",
        question:
          "Schreibe diese IPv6-Adresse in Vollform (8 Gruppen × 4 Hex-Ziffern, Trenner ':'):",
        input: compressed,
        answer: expanded,
        hint: "Ersetze :: durch die fehlenden Null-Gruppen (je 0000). Alle Gruppen auf 4 Stellen auffüllen.",
        explanation: `Vollform: ${expanded}`,
      };
    }
    case "compress": {
      const t = TYPE_POOL[Math.floor(Math.random() * TYPE_POOL.length)];
      const full =
        expandIPv6(randomAddr(t)) ?? "2001:0db8:0000:0000:0000:0000:0000:0001";
      const compressed = compressIPv6(full);
      return {
        drillType: "compress",
        question: "Schreibe diese IPv6-Adresse in Kurzform:",
        input: full,
        answer: compressed,
        hint: "Regel 1: Führende Nullen in jeder Gruppe weglassen. Regel 2: Längste aufeinanderfolgende Null-Gruppen → :: (nur einmal pro Adresse!)",
        explanation: `Kurzform: ${compressed}`,
      };
    }
    case "eui64": {
      const mac = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0")
          .toUpperCase(),
      ).join(":");
      const r = eui64FromMac(mac);
      if (!r) return makeDrillTask("type");
      return {
        drillType: "eui64",
        question:
          "Berechne die EUI-64 Interface-ID (Format: XXXX:XXXX:XXXX:XXXX) für diese MAC-Adresse:",
        input: mac,
        answer: r.interfaceId,
        hint: "1) FF:FE in die Mitte der MAC einfügen. 2) Erstes Oktett XOR 0x02. 3) Als 4 × 4-Hex-Gruppen aufschreiben.",
        explanation: `Interface-ID: ${r.interfaceId}. ${r.steps[3].explanation}`,
      };
    }
    case "prefix": {
      // Real-world-style examples like classroom exercise sheets
      const POOL = [
        "2340:0:10:100:1000:abcd:101:1010/64",
        "30a0:abcd:ef12:3456:abc:b0b0:9999:9009/64",
        "2222:3333:4444:5555:0:6060:707:1/64",
        "34ba:b:b:0:5555:0:6060:707/64",
        "3124:0:dead:cafe:ff:fe00:1:2/64",
        "2bcd:0:face:beff:febe:cafe:1:2/64",
        "3fed:f:e0:d00:face:baff:fe00:0/80",
        "34ba:b:b:0:5555:1:6060:707/80",
        "3124:0:dead:cafe:f:fe00:1:2/80",
        "3fed:f:e0:d00:face:baff:fe00:0/48",
        "3bed:800:0:40:face:baff:fe00:0/48",
        "210f:a:b:c:cccc:b0b0:9999:9009/40",
        "34ba:b:b:0:5555:0:6060:707/36",
        "3124:0:dead:cafe:ff:fe00:1:2/60",
        "2bcd:0:face:1:beff:febe:cafe:3/56",
        "3fed:f:e0:d000:face:baff:fe00:0/52",
        "3bed:800:0:40:face:baff:fe00:0/44",
        "2001:db8:acad:1:face:baff:fe00:1/64",
        "fc00:0:a:1:200:ff:fe00:1/48",
        "fd12:3456:789a:1:abc:def:0:1/56",
      ];
      const src = POOL[Math.floor(Math.random() * POOL.length)];
      const pm = src.match(/^(.+?)\/(\d+)$/);
      if (!pm) return makeDrillTask("type");
      const prefixLen = parseInt(pm[2], 10);
      const result = calcIPv6Prefix(src);
      if (!result) return makeDrillTask("type");
      const expAddr = expandIPv6(pm[1]);
      if (!expAddr) return makeDrillTask("type");
      const prefixGroups = Math.floor(prefixLen / 16);
      const partialBits = prefixLen % 16;
      const groups = expAddr.split(":");
      let explanation = `Vollform: ${expAddr}/${prefixLen}\n`;
      explanation += `Erste ${prefixLen} Bits = ${prefixGroups} vollständige Gruppe(n): ${groups.slice(0, prefixGroups).join(":")}`;
      if (partialBits > 0) {
        const mask = (0xffff << (16 - partialBits)) & 0xffff;
        explanation += ` + Gruppe ${prefixGroups + 1} AND 0x${mask.toString(16).toUpperCase().padStart(4, "0")} = ${groups[prefixGroups]}`;
      }
      explanation += `\n→ Host-Bits auf 0 → komprimiert: ${result.network}/${prefixLen}`;
      const normalize = (s: string) => {
        const n = s.trim().match(/^(.+?)\/(\d+)$/);
        if (!n) return s.trim().toLowerCase();
        const exp2 = expandIPv6(n[1].trim());
        return exp2 ? `${exp2}/${n[2].trim()}` : s.trim().toLowerCase();
      };
      return {
        drillType: "prefix",
        question: "Leite die IPv6-Präfixadresse ab (Host-Bits → 0, dann kürzen):",
        input: src,
        answer: `${result.network}/${prefixLen}`,
        hint: `/${prefixLen} = die ersten ${prefixLen} Bits sind Netzwerk. Bei /64 → erste 4 Gruppen behalten, Rest → ::. Bei nicht-16er-Grenzen Gruppe AND Maske.`,
        explanation,
        answerNormalize: normalize,
      };
    }
  }
}

// ── Small shared helpers ──────────────────────────────────────

function InfoRow({
  dark,
  label,
  value,
}: {
  dark: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
    >
      <span
        className={`text-xs block mb-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-mono font-medium break-all ${dark ? "text-white" : "text-slate-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatBlock({
  dark,
  label,
  value,
}: {
  dark: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-lg font-bold font-mono ${dark ? "text-emerald-300" : "text-emerald-700"}`}
      >
        {value}
      </div>
      <div
        className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
      >
        {label}
      </div>
    </div>
  );
}

// ── Tab: Adress-Analyse ───────────────────────────────────────

function AnalyseTab({ dark }: { dark: boolean }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    expanded: string;
    compressed: string;
    typeInfo: TypeInfo;
    prefix64: string;
    ifaceId: string;
  } | null>(null);
  const [error, setError] = useState("");

  const analyse = useCallback(() => {
    const exp = expandIPv6(input.trim());
    if (!exp) {
      setError("Ungültige IPv6-Adresse. Beispiele: 2001:db8::1  oder  fe80::1");
      setResult(null);
      return;
    }
    setError("");
    const groups = exp.split(":");
    setResult({
      expanded: exp,
      compressed: compressIPv6(exp),
      typeInfo: getIPv6Type(exp),
      prefix64: groups.slice(0, 4).join(":") + "::",
      ifaceId: groups.slice(4).join(":"),
    });
  }, [input]);

  const examples = [
    ["2001:0DB8:0000:0000:0000:0000:0000:0001", "Global Unicast (Vollform)"],
    ["2001:db8::1", "Global Unicast (Kurzform)"],
    ["fe80::1", "Link-Local"],
    ["fd00:1234:5678::1", "Unique Local"],
    ["ff02::1", "All-Nodes Multicast"],
    ["::1", "Loopback"],
  ];

  return (
    <div className="p-5 space-y-4">
      {/* Didaktik */}
      <div
        className={`rounded-xl p-3 text-xs ${dark ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border border-indigo-200 text-indigo-700"}`}
      >
        <strong>Lernziel:</strong> Eine IPv6-Adresse analysieren — Vollform und
        Kurzform unterscheiden, Adresstyp erkennen, Präfix von Interface-ID
        trennen.
      </div>

      {/* Input */}
      <div>
        <label
          className={`block text-xs font-medium mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}
        >
          IPv6-Adresse eingeben
        </label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyse()}
            placeholder="z.B.  2001:db8::1  oder  fe80::1"
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-mono ${dark ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
          />
          <button
            onClick={analyse}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
          >
            Analysieren
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div
            className={`rounded-xl border p-3 ${dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${result.typeInfo.badgeClass}`}
              >
                {result.typeInfo.label}
              </span>
              <span
                className={`text-xs font-mono ${dark ? "text-slate-400" : "text-slate-500"}`}
              >
                {result.typeInfo.prefix}
              </span>
            </div>
            <p
              className={`text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}
            >
              {result.typeInfo.description}
            </p>
          </div>

          <div className="space-y-2">
            <InfoRow
              dark={dark}
              label="Vollform (expanded)"
              value={result.expanded}
            />
            <InfoRow
              dark={dark}
              label="Kurzform (compressed)"
              value={result.compressed}
            />
          </div>

          <div
            className={`rounded-xl border p-3 ${dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}
          >
            <p
              className={`text-xs font-semibold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}
            >
              Präfix / Interface-ID Aufteilung bei /64
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span
                  className={`block text-xs mb-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Präfix (erste 64 Bit)
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${dark ? "text-indigo-300" : "text-indigo-700"}`}
                >
                  {result.prefix64}
                </span>
              </div>
              <div>
                <span
                  className={`block text-xs mb-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                >
                  Interface-ID (letzte 64 Bit)
                </span>
                <span
                  className={`text-xs font-mono font-semibold ${dark ? "text-emerald-300" : "text-emerald-700"}`}
                >
                  {result.ifaceId}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-3 text-xs ${dark ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" : "bg-amber-50 border border-amber-200 text-amber-700"}`}
          >
            <strong>Praxis-Tipp:</strong> Bei SLAAC-Adressen wird die
            Interface-ID per EUI-64 aus der MAC-Adresse berechnet. Wechsle zum
            EUI-64-Tab, um diesen Prozess Schritt für Schritt nachzuvollziehen.
          </div>
        </div>
      )}

      {/* Examples */}
      {!result && (
        <div
          className={`rounded-xl border p-3 ${dark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}
        >
          <p
            className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}
          >
            Beispiel-Adressen zum Ausprobieren:
          </p>
          <div className="space-y-0.5">
            {examples.map(([addr, lbl]) => (
              <button
                key={addr}
                onClick={() => setInput(addr)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${dark ? "text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10" : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"}`}
              >
                <span className="font-mono text-xs">{addr}</span>
                <span className="text-xs opacity-60">— {lbl}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: EUI-64 ───────────────────────────────────────────────

// ── XOR Erklärer (U/L-Bit + freier XOR-Rechner) ─────────────

function toBin8(n: number): string {
  return n.toString(2).padStart(8, "0");
}

function XorExplainer({ dark, initialByte }: { dark: boolean; initialByte?: number }) {
  const [byteA, setByteA] = useState(initialByte !== undefined ? initialByte.toString(16).toUpperCase().padStart(2, "0") : "AA");
  const [byteB, setByteB] = useState("02");
  const [error, setError] = useState("");

  const parseHex = (s: string): number | null => {
    const v = parseInt(s.trim(), 16);
    return isNaN(v) || v < 0 || v > 255 ? null : v;
  };

  const a = parseHex(byteA);
  const b = parseHex(byteB);
  const result = a !== null && b !== null ? a ^ b : null;

  const handleA = (v: string) => {
    setByteA(v);
    setError(parseHex(v) === null ? "Eingabe muss 1–2 Hex-Ziffern (00–FF) sein" : "");
  };
  const handleB = (v: string) => {
    setByteB(v);
    setError(parseHex(v) === null ? "Eingabe muss 1–2 Hex-Ziffern (00–FF) sein" : "");
  };

  const binA = a !== null ? toBin8(a) : "????????";
  const binB = b !== null ? toBin8(b) : "????????";
  const binR = result !== null ? toBin8(result) : "????????";

  // Highlight which bits changed (differ between a and result)
  const changedBits: boolean[] = a !== null && result !== null
    ? Array.from({ length: 8 }, (_, i) => ((a >> (7 - i)) & 1) !== ((result >> (7 - i)) & 1))
    : Array(8).fill(false);

  const card = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200";
  const label = dark ? "text-slate-400" : "text-slate-500";
  const mono = dark ? "text-white" : "text-slate-900";
  const accent = dark ? "text-amber-300" : "text-amber-700";
  const accentBg = dark ? "bg-amber-500/20" : "bg-amber-100";

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${card}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${accent}`}>XOR-Rechner</span>
        <span className={`text-xs ${label}`}>— Bit-für-Bit Erklärung</span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={`block text-xs mb-1 ${label}`}>Byte A (Hex)</label>
          <input
            value={byteA}
            onChange={(e) => handleA(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="z.B. AA"
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase ${dark ? "bg-slate-900 border-slate-600 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
          />
        </div>
        <div>
          <label className={`block text-xs mb-1 ${label}`}>Byte B (Hex)</label>
          <input
            value={byteB}
            onChange={(e) => handleB(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="z.B. 02"
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase ${dark ? "bg-slate-900 border-slate-600 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Binary breakdown table */}
      {a !== null && b !== null && result !== null && (
        <div className="space-y-3">
          {/* Bit position header */}
          <div>
            <p className={`text-xs font-semibold mb-1 ${label}`}>Bit-Positionen (Bit 7 = MSB links)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <td className={`pr-2 text-left ${label}`}>Bit-Nr.</td>
                    {[7,6,5,4,3,2,1,0].map(bit => (
                      <td key={bit} className={`w-8 py-0.5 rounded ${bit === 6 ? accentBg : ""}`}>
                        <span className={bit === 6 ? accent : label}>{bit}</span>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`pr-2 text-left ${label} py-1`}>A = 0x{a.toString(16).toUpperCase().padStart(2,"0")}</td>
                    {binA.split("").map((bit, i) => (
                      <td key={i} className={`w-8 py-1 rounded font-bold ${i === 1 ? (dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700") : mono}`}>
                        {bit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={`pr-2 text-left ${label} py-1`}>B = 0x{b.toString(16).toUpperCase().padStart(2,"0")}</td>
                    {binB.split("").map((bit, i) => (
                      <td key={i} className={`w-8 py-1 rounded font-bold ${i === 1 ? (dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700") : mono}`}>
                        {bit}
                      </td>
                    ))}
                  </tr>
                  <tr className={`border-t ${dark ? "border-slate-600" : "border-slate-300"}`}>
                    <td className={`pr-2 text-left py-1 font-bold ${accent}`}>A XOR B</td>
                    {binR.split("").map((bit, i) => (
                      <td key={i} className={`w-8 py-1 rounded font-bold ${changedBits[i]
                        ? (dark ? "bg-cyan-500/30 text-cyan-300" : "bg-cyan-100 text-cyan-700")
                        : (i === 1 ? (dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700") : mono)}`}>
                        {bit}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-1.5 text-xs flex-wrap">
              <span className={`flex items-center gap-1 ${dark ? "text-amber-300" : "text-amber-700"}`}>
                <span className={`inline-block w-3 h-3 rounded ${accentBg}`}/> Bit 6 = U/L-Bit
              </span>
              <span className={`flex items-center gap-1 ${dark ? "text-cyan-300" : "text-cyan-700"}`}>
                <span className={`inline-block w-3 h-3 rounded ${dark ? "bg-cyan-500/30" : "bg-cyan-100"}`}/> Flippt durch XOR
              </span>
            </div>
          </div>

          {/* Result summary */}
          <div className={`rounded-lg border px-3 py-2.5 ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className={`text-xs ${label}`}>Byte A</p>
                <p className={`font-mono font-bold text-sm ${mono}`}>0x{a.toString(16).toUpperCase().padStart(2,"0")}</p>
                <p className={`font-mono text-xs ${label}`}>{binA}</p>
              </div>
              <div>
                <p className={`text-xs ${label}`}>XOR 0x{b.toString(16).toUpperCase().padStart(2,"0")}</p>
                <p className={`font-mono font-bold text-sm ${accent}`}>= 0x{result.toString(16).toUpperCase().padStart(2,"0")}</p>
                <p className={`font-mono text-xs ${dark ? "text-cyan-400" : "text-cyan-600"}`}>{binR}</p>
              </div>
              <div>
                <p className={`text-xs ${label}`}>Dezimal</p>
                <p className={`font-mono font-bold text-sm ${mono}`}>{a} ⊕ {b} = {result}</p>
              </div>
            </div>
          </div>

          {/* Bit-by-bit explanation */}
          <div className={`rounded-lg border p-3 space-y-1 text-xs ${dark ? "border-slate-700 bg-slate-900/40" : "border-slate-200 bg-white"}`}>
            <p className={`font-semibold mb-2 ${mono}`}>Bit-für-Bit XOR-Regel: 0⊕0=0 · 1⊕1=0 · 0⊕1=1 · 1⊕0=1</p>
            {Array.from({ length: 8 }, (_, i) => {
              const bitPos = 7 - i;
              const bA = (a >> bitPos) & 1;
              const bB = (b >> bitPos) & 1;
              const bR = (result >> bitPos) & 1;
              const flipped = bA !== bR;
              return (
                <div key={i} className={`flex items-center gap-2 rounded px-2 py-0.5 ${i === 1 ? accentBg : ""}`}>
                  <span className={`w-12 ${i === 1 ? accent : label}`}>Bit {bitPos}{i === 1 ? " ★" : ""}</span>
                  <span className={`font-mono ${mono}`}>{bA}</span>
                  <span className={label}>⊕</span>
                  <span className={`font-mono ${mono}`}>{bB}</span>
                  <span className={label}>=</span>
                  <span className={`font-mono font-bold ${flipped ? (dark ? "text-cyan-300" : "text-cyan-600") : mono}`}>{bR}</span>
                  {i === 1 && <span className={`text-xs ml-1 ${accent}`}>← U/L-Bit (Bit 6)</span>}
                  {flipped && i !== 1 && <span className={`text-xs ml-1 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>↩ flippt</span>}
                </div>
              );
            })}
          </div>

          {/* U/L Bit explanation */}
          <div className={`rounded-lg border p-3 text-xs space-y-1.5 ${dark ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            <p className="font-bold">Warum Bit 6 (das 7. Bit von links)?</p>
            <p>In einem Byte werden Bits <strong>von rechts</strong> als Bit 0–7 nummeriert. Bit 7 = ganz links (MSB). Bit 6 = zweite Stelle von links.</p>
            <p>0x02 in Binär = <strong>0000 0010</strong> → nur Bit 1 von rechts (= Bit 6 in 0-indexed von links) ist gesetzt.</p>
            <p>XOR mit 0x02 flippt <strong>genau dieses eine Bit</strong> und lässt alle anderen unverändert.</p>
            <p className="font-semibold">IEEE-Konvention: Bei einer fabrik-neuen MAC ist Bit 6 = 0 (universell). Nach Invertierung = 1 (lokal) → Bedeutet für IPv6: „diese Interface-ID wurde modifiziert".</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EUI64Tab({ dark }: { dark: boolean }) {
  const [mac, setMac] = useState("");
  const [result, setResult] = useState<EUI64Result | null>(null);
  const [error, setError] = useState("");
  const [openStep, setOpenStep] = useState<number | null>(null);

  const calculate = useCallback(() => {
    const r = eui64FromMac(mac.trim());
    if (!r) {
      setError(
        "Ungültige MAC-Adresse. Format: AA:BB:CC:DD:EE:FF oder AABBCCDDEEFF",
      );
      setResult(null);
      return;
    }
    setError("");
    setResult(r);
    setOpenStep(null);
  }, [mac]);

  return (
    <div className="p-5 space-y-4">
      <div
        className={`rounded-xl p-3 text-xs ${dark ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" : "bg-cyan-50 border border-cyan-200 text-cyan-700"}`}
      >
        <strong>Lernziel:</strong> Verstehen, wie eine IPv6 Interface-ID per
        EUI-64 aus einer MAC-Adresse generiert wird — der Mechanismus hinter
        SLAAC.
      </div>

      <div>
        <label
          className={`block text-xs font-medium mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}
        >
          MAC-Adresse eingeben
        </label>
        <div className="flex gap-2">
          <input
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
            placeholder="z.B.  AA:BB:CC:DD:EE:FF"
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-mono ${dark ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
          />
          <button
            onClick={calculate}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors"
          >
            Berechnen
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {result && (
        <div className="space-y-2">
          {result.steps.map((step, i) => (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden ${dark ? "border-slate-700" : "border-slate-200"}`}
            >
              <button
                onClick={() => setOpenStep(openStep === i ? null : i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${dark ? "bg-slate-800 hover:bg-slate-700/80" : "bg-slate-50 hover:bg-slate-100"}`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${i === result.steps.length - 1 ? "bg-cyan-500" : "bg-slate-500"}`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-medium block ${dark ? "text-slate-300" : "text-slate-700"}`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`text-xs font-mono break-all mt-0.5 block ${dark ? "text-cyan-300" : "text-cyan-700"}`}
                  >
                    {step.value}
                  </span>
                </div>
                <span
                  className={`text-lg leading-none ${dark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {openStep === i ? "−" : "+"}
                </span>
              </button>
              {openStep === i && (
                <div
                  className={`px-4 py-3 text-xs leading-relaxed border-t ${dark ? "bg-slate-800/40 text-slate-400 border-slate-700" : "bg-white text-slate-600 border-slate-200"}`}
                >
                  {step.explanation}
                </div>
              )}
            </div>
          ))}

          <div
            className={`rounded-xl border p-3 ${dark ? "bg-cyan-500/10 border-cyan-500/30" : "bg-cyan-50 border-cyan-200"}`}
          >
            <span
              className={`text-xs font-semibold block mb-1 ${dark ? "text-cyan-300" : "text-cyan-700"}`}
            >
              Ergebnis: Interface-ID
            </span>
            <span
              className={`text-lg font-mono font-bold ${dark ? "text-white" : "text-slate-900"}`}
            >
              {result.interfaceId}
            </span>
            <span
              className={`text-xs block mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Vollständige SLAAC-Adresse (Beispiel): 2001:DB8:1::
              {result.interfaceId}/64
            </span>
          </div>
        </div>
      )}

      {!result && (
        <div
          className={`rounded-xl border p-3 ${dark ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}
        >
          <p
            className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}
          >
            Beispiel-MACs aus dem Lernguide:
          </p>
          {[
            ["AA:BB:CC:DD:EE:FF", "Buchbeispiel → A8BB:CCFF:FEDD:EEFF"],
            ["00:1A:2B:3C:4D:5E", "Typische Herstelleradresse"],
          ].map(([m, lbl]) => (
            <button
              key={m}
              onClick={() => setMac(m)}
              className={`w-full text-left flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${dark ? "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10" : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"}`}
            >
              <span className="font-mono text-xs">{m}</span>
              <span className="text-xs opacity-60">— {lbl}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── XOR / U/L-Bit Erklärer ─────────────────────────────── */}
      <XorExplainer dark={dark} initialByte={result ? parseInt(result.steps[0].value.split(":")[0], 16) : undefined} />
    </div>
  );
}

// ── Tab: Segmentierung ────────────────────────────────────────

function SegmentationTab({ dark }: { dark: boolean }) {
  const [prefix, setPrefix] = useState("2001:DB8:CAFE::/48");
  const [newCidr, setNewCidr] = useState(56);
  const [result, setResult] = useState<SegResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    const r = calcIPv6Segmentation(prefix.trim(), newCidr);
    if (!r) {
      setError(
        "Ungültige Eingabe. Beispiel: Präfix 2001:DB8::/48, neues CIDR 56. Das neue CIDR muss größer als das ursprüngliche sein.",
      );
      setResult(null);
      return;
    }
    setError("");
    setResult(r);
  }, [prefix, newCidr]);

  const scenarios = [
    {
      prefix: "2001:DB8::/32",
      newCidr: 48,
      label: "ISP /32 → Kunden-Blöcke /48",
      note: "65.536 Subnetze",
    },
    {
      prefix: "2001:DB8:CAFE::/48",
      newCidr: 56,
      label: "Organisation /48 → Standorte /56",
      note: "256 Subnetze",
    },
    {
      prefix: "2001:DB8:CAFE::/48",
      newCidr: 64,
      label: "Organisation /48 → VLANs /64",
      note: "65.536 Subnetze",
    },
    {
      prefix: "2001:DB8:CAFE:1::/56",
      newCidr: 64,
      label: "Standort /56 → VLANs /64",
      note: "256 Subnetze",
    },
  ];

  return (
    <div className="p-5 space-y-4">
      <div
        className={`rounded-xl p-3 text-xs ${dark ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-emerald-50 border border-emerald-200 text-emerald-700"}`}
      >
        <strong>Lernziel:</strong> IPv6-Präfixe hierarchisch aufteilen. Bei IPv6
        ist <strong>/64</strong> die kleinste SLAAC-fähige Einheit. Typische
        Kette:{" "}
        <span className="font-mono">
          ISP /32 → Org /48 → Standort /56 → VLAN /64
        </span>
        .
      </div>

      {/* Scenario quick-pick */}
      <div>
        <p
          className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}
        >
          Typische Szenarien:
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {scenarios.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setPrefix(s.prefix);
                setNewCidr(s.newCidr);
                setResult(null);
              }}
              className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${dark ? "border-slate-700 bg-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300" : "border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-700"}`}
            >
              <span className="font-mono font-semibold">{s.prefix}</span>
              {" → /"}
              <span className="font-semibold">{s.newCidr}</span>
              <span className="ml-2 opacity-60">{s.label}</span>
              <span
                className={`ml-1 text-xs ${dark ? "text-emerald-500" : "text-emerald-600"}`}
              >
                ({s.note})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom input */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className={`block text-xs font-medium mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}
          >
            Ausgangspräfix (mit /CIDR)
          </label>
          <input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="z.B. 2001:DB8::/48"
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${dark ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400"}`}
          />
        </div>
        <div>
          <label
            className={`block text-xs font-medium mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}
          >
            Neues CIDR (1–128)
          </label>
          <input
            type="number"
            min={1}
            max={128}
            value={newCidr}
            onChange={(e) => setNewCidr(parseInt(e.target.value))}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${dark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-300 text-slate-900"}`}
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
      >
        Segmentieren
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div
            className={`rounded-xl border p-3 grid grid-cols-3 gap-3 text-center ${dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}
          >
            <StatBlock
              dark={dark}
              label="Subnetz-Bits"
              value={String(result.subnetBits)}
            />
            <StatBlock
              dark={dark}
              label="Anzahl Subnetze"
              value={
                result.totalCount > BigInt(1_000_000)
                  ? `2^${result.subnetBits}`
                  : result.totalCount.toString()
              }
            />
            <StatBlock
              dark={dark}
              label="Präfix-Länge"
              value={`/${result.subnets[0]?.prefixLength ?? ""}`}
            />
          </div>

          <div>
            <p
              className={`text-xs font-medium mb-2 ${dark ? "text-slate-400" : "text-slate-600"}`}
            >
              Erste {result.showFirst} Subnetze
              {result.totalCount > BigInt(8)
                ? ` (von ${result.totalCount > BigInt(1_000_000) ? "2^" + result.subnetBits : result.totalCount})`
                : ""}
              :
            </p>
            <div
              className={`rounded-xl border overflow-hidden ${dark ? "border-slate-700" : "border-slate-200"}`}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr className={dark ? "bg-slate-800" : "bg-slate-100"}>
                    <th
                      className={`px-3 py-2 text-left font-semibold w-8 ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      #
                    </th>
                    <th
                      className={`px-3 py-2 text-left font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Netzwerkadresse
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.subnets.map((s, i) => (
                    <tr
                      key={i}
                      className={
                        dark
                          ? "border-t border-slate-700"
                          : "border-t border-slate-100"
                      }
                    >
                      <td
                        className={`px-3 py-2 ${dark ? "text-slate-600" : "text-slate-400"}`}
                      >
                        {i}
                      </td>
                      <td
                        className={`px-3 py-2 font-mono font-medium ${dark ? "text-emerald-300" : "text-emerald-700"}`}
                      >
                        {s.networkAddress}/{s.prefixLength}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`rounded-xl p-3 text-xs ${dark ? "bg-amber-500/10 border border-amber-500/20 text-amber-300" : "bg-amber-50 border border-amber-200 text-amber-700"}`}
          >
            <strong>Praxis-Tipp:</strong> /64 ist die Mindestgröße für SLAAC.
            Router-zu-Router Point-to-Point-Links dürfen /127 (RFC 6164)
            verwenden. /128 ist eine Host-Route (einzelne Adresse — wie /32 bei
            IPv4).
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Drill ────────────────────────────────────────────────

function DrillTab({ dark }: { dark: boolean }) {
  const [filter, setFilter] = useState<DrillType | "random">("random");
  const [task, setTask] = useState<DrillTask>(() => makeDrillTask());
  const [textInput, setTextInput] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });

  const newTask = useCallback(
    (f?: DrillType | "random") => {
      const activeFilter = f ?? filter;
      setTask(
        makeDrillTask(activeFilter === "random" ? undefined : activeFilter),
      );
      setTextInput("");
      setChoice(null);
      setChecked(false);
      setCorrect(false);
      setShowHint(false);
    },
    [filter],
  );

  const changeFilter = (f: DrillType | "random") => {
    setFilter(f);
    newTask(f);
  };

  const check = useCallback(() => {
    if (checked) return;
    const rawAnswer = task.choices ? choice : textInput.trim();
    const normalize = task.answerNormalize ?? ((s: string) => s.toLowerCase());
    const isCorrect = normalize(rawAnswer ?? "") === normalize(task.answer);
    setCorrect(isCorrect);
    setChecked(true);
    setScore((s) => ({
      right: s.right + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
  }, [task, textInput, choice, checked]);

  const accuracy =
    score.total > 0 ? Math.round((score.right / score.total) * 100) : null;

  const filterLabels: Record<DrillType | "random", string> = {
    random: "Zufällig",
    type: "Typ",
    expand: "Vollform",
    compress: "Kurzform",
    eui64: "EUI-64",
    prefix: "Präfix",
  };
  const taskTypeLabel: Record<DrillType, string> = {
    type: "Adresstyp",
    expand: "Vollform",
    compress: "Kurzform",
    eui64: "EUI-64",
    prefix: "Präfixadresse",
  };

  return (
    <div className="p-5 space-y-4">
      {/* Filter + Score */}
      <div className="flex items-center gap-2 flex-wrap">
        {(
          ["random", "type", "expand", "compress", "eui64", "prefix"] as (
            | DrillType
            | "random"
          )[]
        ).map((f) => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${filter === f ? (dark ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-amber-100 border-amber-300 text-amber-700") : dark ? "border-slate-700 text-slate-500 hover:text-slate-300" : "border-slate-200 text-slate-500 hover:text-slate-700"}`}
          >
            {filterLabels[f]}
          </button>
        ))}
        {accuracy !== null && (
          <span
            className={`ml-auto text-xs font-semibold ${accuracy >= 70 ? (dark ? "text-emerald-400" : "text-emerald-600") : dark ? "text-amber-400" : "text-amber-600"}`}
          >
            {score.right}/{score.total} ({accuracy}%)
          </span>
        )}
      </div>

      {/* Task card */}
      <div
        className={`rounded-xl border p-4 ${dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200"}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-700"}`}
          >
            {taskTypeLabel[task.drillType]}
          </span>
        </div>

        <p
          className={`text-sm font-medium mb-3 ${dark ? "text-white" : "text-slate-900"}`}
        >
          {task.question}
        </p>

        <div
          className={`rounded-lg border px-3 py-2 mb-4 ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}
        >
          <span
            className={`text-sm font-mono break-all ${dark ? "text-indigo-300" : "text-indigo-700"}`}
          >
            {task.input}
          </span>
        </div>

        {/* Multiple-choice (type) or text input */}
        {task.choices ? (
          <div className="grid grid-cols-2 gap-2">
            {task.choices.map((c) => {
              const isCorrectChoice = c === task.answer;
              const isSelectedChoice = c === choice;
              const baseClass =
                "text-left text-xs px-3 py-2 rounded-lg border transition-colors";
              let colorClass: string;
              if (checked) {
                if (isCorrectChoice)
                  colorClass = dark
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-emerald-50 border-emerald-400 text-emerald-700";
                else if (isSelectedChoice)
                  colorClass = dark
                    ? "bg-red-500/20 border-red-500 text-red-300"
                    : "bg-red-50 border-red-400 text-red-700";
                else
                  colorClass = dark
                    ? "border-slate-700 text-slate-600"
                    : "border-slate-200 text-slate-400";
              } else if (isSelectedChoice) {
                colorClass = dark
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-amber-50 border-amber-400 text-amber-700";
              } else {
                colorClass = dark
                  ? "border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100";
              }
              return (
                <button
                  key={c}
                  onClick={() => !checked && setChoice(c)}
                  className={`${baseClass} ${colorClass}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !checked && check()}
            disabled={checked}
            placeholder="Antwort eingeben …"
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono ${dark ? "bg-slate-900 border-slate-600 text-white placeholder-slate-500 disabled:opacity-60" : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 disabled:bg-slate-50"}`}
          />
        )}
      </div>

      {/* Hint toggle */}
      {!checked && (
        <button
          onClick={() => setShowHint((v) => !v)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Info size={12} />
          {showHint ? "Hinweis ausblenden" : "Hinweis anzeigen"}
        </button>
      )}
      {showHint && !checked && (
        <div
          className={`rounded-xl p-3 text-xs ${dark ? "bg-slate-800 border border-slate-700 text-slate-400" : "bg-slate-100 border border-slate-200 text-slate-600"}`}
        >
          {task.hint}
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <div
          className={`rounded-xl border p-3 ${correct ? (dark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200") : dark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200"}`}
        >
          <div className="flex items-center gap-2 mb-1">
            {correct ? (
              <CheckCircle
                size={14}
                className={dark ? "text-emerald-400" : "text-emerald-500"}
                weight="fill"
              />
            ) : (
              <XCircle
                size={14}
                className={dark ? "text-red-400" : "text-red-500"}
                weight="fill"
              />
            )}
            <span
              className={`text-xs font-semibold ${correct ? (dark ? "text-emerald-300" : "text-emerald-700") : dark ? "text-red-300" : "text-red-700"}`}
            >
              {correct ? "Richtig!" : "Falsch"}
            </span>
          </div>
          <p
            className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}
          >
            {task.explanation}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!checked && (
          <button
            onClick={check}
            disabled={!task.choices ? textInput.trim() === "" : choice === null}
            className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Überprüfen
          </button>
        )}
        {checked && (
          <button
            onClick={() => newTask()}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors"
          >
            <ArrowClockwise size={14} />
            Nächste Aufgabe
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Dialog ───────────────────────────────────────────────

interface IPv6CalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export function IPv6CalculatorDialog({
  open,
  onClose,
  theme,
}: IPv6CalculatorDialogProps) {
  const dark = theme === "dark";
  const [tab, setTab] = useState<IPv6Tab>("analyse");

  if (!open) return null;

  const tabs: { id: IPv6Tab; label: string; activeClass: string }[] = [
    {
      id: "analyse",
      label: "Adress-Analyse",
      activeClass: dark
        ? "border-indigo-400 text-indigo-300"
        : "border-indigo-600 text-indigo-700",
    },
    {
      id: "eui64",
      label: "EUI-64",
      activeClass: dark
        ? "border-cyan-400 text-cyan-300"
        : "border-cyan-600 text-cyan-700",
    },
    {
      id: "segmentation",
      label: "Segmentierung",
      activeClass: dark
        ? "border-emerald-400 text-emerald-300"
        : "border-emerald-600 text-emerald-700",
    },
    {
      id: "drill",
      label: "Drill",
      activeClass: dark
        ? "border-amber-400 text-amber-300"
        : "border-amber-600 text-amber-700",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${dark ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 ${dark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <Calculator size={18} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2
              className={`font-bold text-sm ${dark ? "text-white" : "text-slate-900"}`}
            >
              IPv6 Rechner & Drill
            </h2>
            <p
              className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Adress-Analyse · EUI-64 · Segmentierung · Drill
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className={`ml-auto p-1.5 rounded-lg transition-colors ${dark ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar */}
        <div
          className={`flex border-b flex-shrink-0 ${dark ? "border-slate-700" : "border-slate-200"}`}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? `${t.activeClass} border-b-2` : `border-transparent ${dark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"}`}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "analyse" && <AnalyseTab dark={dark} />}
          {tab === "eui64" && <EUI64Tab dark={dark} />}
          {tab === "segmentation" && <SegmentationTab dark={dark} />}
          {tab === "drill" && <DrillTab dark={dark} />}
        </div>
      </div>
    </div>
  );
}

// ── Test exports ──────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const __test__ = {
  expandIPv6,
  compressIPv6,
  getIPv6Type,
  eui64FromMac,
  calcIPv6Segmentation,
  calcIPv6Prefix,
};

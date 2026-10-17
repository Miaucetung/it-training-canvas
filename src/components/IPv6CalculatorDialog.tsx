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
import { ModalPortal } from "@/components/ui/modal-portal";

// ── Types ────────────────────────────────────────────────────

type IPv6Tab = "analyse" | "eui64" | "segmentation" | "drill" | "binaer";
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
      badgeClass: "bg-muted-foreground text-background",
    };
  if (exp === "0000:0000:0000:0000:0000:0000:0000:0001")
    return {
      type: "loopback",
      label: "Loopback",
      description:
        "Wie 127.0.0.1 bei IPv4 — nur für lokale Tests auf dem Gerät selbst. Kein Routing.",
      prefix: "::1/128",
      badgeClass: "bg-status-trunk-solid text-on-status-trunk-solid",
    };
  if (exp === "0000:0000:0000:0000:0000:0000:0000:0000")
    return {
      type: "unspecified",
      label: "Nicht spezifiziert",
      description:
        "Adresse noch nicht zugewiesen (wie 0.0.0.0 bei IPv4). Wird beim Bootstrapping verwendet.",
      prefix: "::/128",
      badgeClass: "bg-muted-foreground text-background",
    };
  const f = parseInt(exp.split(":")[0], 16);
  if ((f & 0xff00) === 0xff00)
    return {
      type: "multicast",
      label: "Multicast",
      description:
        "Eine-zu-Viele. Scope im zweiten Nibble: FF02 = Link-Local, FF05 = Site-Local, FF0E = Global.",
      prefix: "FF00::/8",
      badgeClass: "bg-status-blocking-solid text-on-status-blocking-solid",
    };
  if ((f & 0xffc0) === 0xfe80)
    return {
      type: "link-local",
      label: "Link-Local",
      description:
        "Nur im lokalen Netzwerksegment gültig. Automatisch per NDP konfiguriert. Router leiten Link-Local-Pakete nie weiter.",
      prefix: "FE80::/10",
      badgeClass: "bg-accent-solid text-on-accent-solid",
    };
  if ((f & 0xfe00) === 0xfc00)
    return {
      type: "unique-local",
      label: "Unique Local (ULA)",
      description:
        "Privat routbar innerhalb einer Organisation (wie RFC 1918). Nicht global routbar. In der Praxis meist FD::-Adressen mit Zufalls-Präfix.",
      prefix: "FC00::/7",
      badgeClass: "bg-status-success-solid text-on-status-success-solid",
    };
  if ((f & 0xe000) === 0x2000)
    return {
      type: "global-unicast",
      label: "Global Unicast (GUA)",
      description:
        "Öffentlich routbar. Beginnt mit 2000::/3 (erste 3 Bits = 001). ISP vergibt /32, Organisation /48, Subnetz /64.",
      prefix: "2000::/3",
      badgeClass: "bg-accent-solid text-on-accent-solid",
    };
  return {
    type: "unknown",
    label: "Reserviert/Unbekannt",
    description:
      "Reservierter Adressbereich — aktuell nicht für allgemeine Nutzung zugewiesen.",
    prefix: "",
    badgeClass: "bg-muted-foreground text-background",
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
export function calcIPv6Prefix(
  addrWithCidr: string,
): { network: string; prefixLen: number } | null {
  const m = addrWithCidr.trim().match(/^(.+?)\/(\d+)$/);
  if (!m) return null;
  const prefixLen = parseInt(m[2], 10);
  if (isNaN(prefixLen) || prefixLen < 0 || prefixLen > 128) return null;
  const exp = expandIPv6(m[1].trim());
  if (!exp) return null;
  let addr = BigInt(0);
  for (const g of exp.split(":"))
    addr = (addr << BigInt(16)) | BigInt(parseInt(g, 16));
  const mask =
    prefixLen === 0
      ? BigInt(0)
      : ((BigInt(1) << BigInt(prefixLen)) - BigInt(1)) <<
        BigInt(128 - prefixLen);
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
        question:
          "Leite die IPv6-Präfixadresse ab (Host-Bits → 0, dann kürzen):",
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
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2 bg-muted border-border"
    >
      <span
        className="text-xs block mb-0.5 text-muted-foreground"
      >
        {label}
      </span>
      <span
        className="text-sm font-mono font-medium break-all text-foreground"
      >
        {value}
      </span>
    </div>
  );
}

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div
        className="text-lg font-bold font-mono text-status-success-fg"
      >
        {value}
      </div>
      <div
        className="text-xs mt-0.5 text-muted-foreground"
      >
        {label}
      </div>
    </div>
  );
}

// ── Tab: Adress-Analyse ───────────────────────────────────────

function AnalyseTab() {
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
        className="rounded-xl p-3 text-xs bg-accent-primary/10 border border-accent-primary/20 text-accent-primary-fg"
      >
        <strong>Lernziel:</strong> Eine IPv6-Adresse analysieren — Vollform und
        Kurzform unterscheiden, Adresstyp erkennen, Präfix von Interface-ID
        trennen.
      </div>

      {/* Input */}
      <div>
        <label
          className="block text-xs font-medium mb-1 text-muted-foreground"
        >
          IPv6-Adresse eingeben
        </label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyse()}
            placeholder="z.B.  2001:db8::1  oder  fe80::1"
            className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono bg-muted border-border text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={analyse}
            className="px-4 py-2 rounded-lg bg-accent-solid hover:opacity-90 text-on-accent-solid text-xs font-semibold transition-colors"
          >
            Analysieren
          </button>
        </div>
        {error && <p className="text-xs text-status-error-fg mt-1">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div
            className="rounded-xl border p-3 bg-muted/60 border-border"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${result.typeInfo.badgeClass}`}
              >
                {result.typeInfo.label}
              </span>
              <span
                className="text-xs font-mono text-muted-foreground"
              >
                {result.typeInfo.prefix}
              </span>
            </div>
            <p
              className="text-xs text-muted-foreground"
            >
              {result.typeInfo.description}
            </p>
          </div>

          <div className="space-y-2">
            <InfoRow
              label="Vollform (expanded)"
              value={result.expanded}
            />
            <InfoRow
              label="Kurzform (compressed)"
              value={result.compressed}
            />
          </div>

          <div
            className="rounded-xl border p-3 bg-muted/60 border-border"
          >
            <p
              className="text-xs font-semibold mb-2 text-muted-foreground"
            >
              Präfix / Interface-ID Aufteilung bei /64
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span
                  className="block text-xs mb-0.5 text-muted-foreground"
                >
                  Präfix (erste 64 Bit)
                </span>
                <span
                  className="text-xs font-mono font-semibold text-accent-primary-fg"
                >
                  {result.prefix64}
                </span>
              </div>
              <div>
                <span
                  className="block text-xs mb-0.5 text-muted-foreground"
                >
                  Interface-ID (letzte 64 Bit)
                </span>
                <span
                  className="text-xs font-mono font-semibold text-status-success-fg"
                >
                  {result.ifaceId}
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-3 text-xs bg-status-warning-bg border border-status-warning-border/20 text-status-warning-fg"
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
          className="rounded-xl border p-3 bg-muted/40 border-border"
        >
          <p
            className="text-xs font-medium mb-2 text-muted-foreground"
          >
            Beispiel-Adressen zum Ausprobieren:
          </p>
          <div className="space-y-0.5">
            {examples.map(([addr, lbl]) => (
              <button
                key={addr}
                onClick={() => setInput(addr)}
                className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-lg transition-colors text-muted-foreground hover:text-accent-primary-fg hover:bg-accent-primary/10"
              >
                <span className="font-mono text-xs">{addr}</span>
                <span className="text-xs text-muted-foreground">— {lbl}</span>
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

function XorExplainer({
  initialByte,
}: {
  initialByte?: number;
}) {
  const [byteA, setByteA] = useState(
    initialByte !== undefined
      ? initialByte.toString(16).toUpperCase().padStart(2, "0")
      : "AA",
  );
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
    setError(
      parseHex(v) === null ? "Eingabe muss 1-2 Hex-Ziffern (00-FF) sein" : "",
    );
  };
  const handleB = (v: string) => {
    setByteB(v);
    setError(
      parseHex(v) === null ? "Eingabe muss 1-2 Hex-Ziffern (00-FF) sein" : "",
    );
  };

  const card = "bg-muted/60 border-border";
  const lbl = "text-muted-foreground";
  const mono = "text-foreground";
  const accent = "text-status-warning-fg";
  const accentBg = "bg-status-warning-bg";
  const cyanText = "text-accent-primary-fg";
  const cyanBg = "bg-accent-primary/25";

  // 0x02 = 00000010: the set bit is at Bit 1 (0-indexed from RIGHT, value=2).
  // In the left-to-right display array [7,6,5,4,3,2,1,0], that is array index 6.
  const UL_BIT_POS = 1; // 0-indexed from right
  const UL_ARRAY_IDX = 7 - UL_BIT_POS; // = 6

  const isULCol = (arrayIdx: number) => b === 0x02 && arrayIdx === UL_ARRAY_IDX;

  const changedBits =
    a !== null && result !== null
      ? Array.from(
          { length: 8 },
          (_, i) => ((a >> (7 - i)) & 1) !== ((result >> (7 - i)) & 1),
        )
      : (Array(8).fill(false) as boolean[]);

  const binA = a !== null ? toBin8(a) : "????????";
  const binB = b !== null ? toBin8(b) : "????????";
  const binR = result !== null ? toBin8(result) : "????????";

  return (
    <div className={`rounded-xl border p-4 space-y-5 ${card}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${accent}`}>
          XOR-Rechner
        </span>
        <span className={`text-xs ${lbl}`}>Bit-fur-Bit Erklarung</span>
      </div>

      {/* Step 0: XOR rules */}
      <div
        className="rounded-lg border p-3 text-xs space-y-2 border-border bg-card/50"
      >
        <p className={`font-bold ${mono}`}>Schritt 0 - Die XOR-Regel</p>
        <div className="grid grid-cols-4 gap-2 text-center font-mono">
          {(
            [
              ["0", "0", "0", "unverandert"],
              ["1", "0", "1", "unverandert"],
              ["0", "1", "1", "flippt!"],
              ["1", "1", "0", "flippt!"],
            ] as const
          ).map(([x, y, r, note], i) => (
            <div
              key={i}
              className={`rounded-lg border p-2 ${note === "flippt!" ? ("border-accent-primary bg-accent-primary/10") : "border-border bg-muted/60"}`}
            >
              <p className={`text-sm font-bold ${mono}`}>
                {x} XOR {y} = {r}
              </p>
              <p
                className={`text-xs mt-0.5 ${note === "flippt!" ? cyanText : lbl}`}
              >
                {note}
              </p>
            </div>
          ))}
        </div>
        <p className={`text-xs ${lbl}`}>
          <strong className={mono}>Merksatz:</strong> XOR mit{" "}
          <strong className={cyanText}>1</strong> flippt das Bit. XOR mit{" "}
          <strong className={mono}>0</strong> lasst das Bit unverandert.
        </p>
      </div>

      {/* Step 1: Why 0x02 = only 1 bit */}
      {b === 0x02 && (
        <div
          className="rounded-lg border p-3 text-xs space-y-2 border-status-warning-border/30 bg-status-warning-bg"
        >
          <p className={`font-bold ${accent}`}>
            Schritt 1 - Was bedeutet "XOR mit 0x02"?
          </p>
          <p className={`${mono}`}>0x02 in Binar:</p>
          <div className="flex gap-1 font-mono text-lg justify-center">
            {toBin8(0x02)
              .split("")
              .map((bit, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded font-black border ${i === UL_ARRAY_IDX ? `${accentBg} ${accent} border-status-warning-border` : `border-border text-muted-foreground`}`}
                >
                  {bit}
                </span>
              ))}
          </div>
          <p className={`text-center text-xs ${lbl}`}>
            {[7, 6, 5, 4, 3, 2, 1, 0].map((n, i) => (
              <span
                key={n}
                className={`inline-block w-8 text-center ${i === UL_ARRAY_IDX ? accent : lbl}`}
              >
                {n}
              </span>
            ))}
            <br />
            <em>Bit-Nr. (0-indexed von rechts)</em>
          </p>
          <p className={`font-semibold ${accent}`}>
            Nur Bit 1 (das 2. von rechts, Wert = 2) ist auf "1" gesetzt. Alle
            anderen 7 Bits = 0.
          </p>
          <p className={lbl}>
            Weil XOR mit 0 nichts andert und XOR mit 1 flippt: XOR mit 0x02
            andert genau ein einziges Bit und lasst alle anderen 7 Bits vollig
            unverandert.
          </p>
        </div>
      )}

      {/* Inputs */}
      <div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs mb-1 ${lbl}`}>Byte A (Hex)</label>
            <input
              value={byteA}
              onChange={(e) => handleA(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="z.B. AA"
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${lbl}`}>
              Byte B (Hex) = Maske
            </label>
            <input
              value={byteB}
              onChange={(e) => handleB(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="z.B. 02"
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono uppercase bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
        {error && <p className="text-xs text-status-error-fg mt-1">{error}</p>}
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {[
            ["AA", "02"],
            ["00", "02"],
            ["02", "02"],
            ["FF", "02"],
            ["1A", "02"],
          ].map(([ma, mb]) => (
            <button
              key={ma + mb}
              onClick={() => {
                handleA(ma);
                setByteB(mb);
              }}
              className="text-xs px-2 py-0.5 rounded border transition-colors border-border text-muted-foreground hover:text-status-warning-fg hover:border-status-warning-border/40"
            >
              0x{ma} XOR 0x{mb}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: The bit table */}
      {a !== null && b !== null && result !== null && (
        <div className="space-y-4">
          <div>
            <p className={`text-xs font-bold mb-2 ${mono}`}>
              Schritt 2 - Bit-Tabelle (links = Bit 7 = MSB = grosster Wert 128,
              rechts = Bit 0 = LSB = Wert 1)
            </p>
            <div tabIndex={0} role="region" aria-label="Bit-Tabelle" className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <table className="w-full text-center text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <td
                      className={`text-left pr-2 ${lbl}`}
                      style={{ minWidth: "140px" }}
                    >
                      Position
                    </td>
                    {[7, 6, 5, 4, 3, 2, 1, 0].map((bitNr, i) => (
                      <td
                        key={bitNr}
                        className={`w-9 pb-1 ${isULCol(i) ? accentBg : ""}`}
                      >
                        <div
                          className={`font-bold ${isULCol(i) ? accent : lbl}`}
                        >
                          {bitNr}
                        </div>
                        <div
                          className={`text-xs ${isULCol(i) ? `${accent}` : lbl}`}
                          style={{ fontSize: "9px" }}
                        >
                          ={Math.pow(2, bitNr)}
                        </div>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`pr-2 py-2 text-left ${lbl}`}>
                      A = 0x{a.toString(16).toUpperCase().padStart(2, "0")}
                    </td>
                    {binA.split("").map((bit, i) => (
                      <td
                        key={i}
                        className={`w-9 py-2 font-bold text-sm rounded ${isULCol(i) ? `${accentBg} ${accent}` : mono}`}
                      >
                        {bit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={`pr-2 py-1 text-left text-xs ${lbl}`}>
                      Maske B = 0x
                      {b.toString(16).toUpperCase().padStart(2, "0")}
                      {b === 0x02 && (
                        <span className={`ml-1 ${accent}`}>
                          (nur Bit 1 gesetzt!)
                        </span>
                      )}
                    </td>
                    {binB.split("").map((bit, i) => (
                      <td
                        key={i}
                        className={`w-9 py-1 font-bold text-sm rounded ${bit === "1" ? `${cyanBg} ${cyanText}` : isULCol(i) ? `${accentBg} ${lbl}` : lbl}`}
                      >
                        {bit}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={`pr-2 py-0.5 text-left text-xs ${lbl}`}>
                      Wirkung
                    </td>
                    {Array.from({ length: 8 }, (_, i) => {
                      const bBit = (b >> (7 - i)) & 1;
                      return (
                        <td
                          key={i}
                          className="text-center py-0.5"
                          style={{ fontSize: "9px" }}
                        >
                          <span className={bBit === 1 ? cyanText : lbl}>
                            {bBit === 1 ? "flippt" : "="}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr
                    className="border-t-2 border-status-warning-border/50"
                  >
                    <td className={`pr-2 py-2 text-left font-bold ${accent}`}>
                      = 0x{result.toString(16).toUpperCase().padStart(2, "0")}
                    </td>
                    {binR.split("").map((bit, i) => (
                      <td
                        key={i}
                        className={`w-9 py-2 font-bold text-sm rounded ${changedBits[i] ? `${cyanBg} ${cyanText}` : isULCol(i) ? `${accentBg} ${accent}` : mono}`}
                      >
                        {bit}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-2 text-xs flex-wrap">
              {b === 0x02 && (
                <span className={`flex items-center gap-1 ${accent}`}>
                  <span
                    className={`inline-block w-3 h-3 rounded ${accentBg}`}
                  />{" "}
                  U/L-Bit (Bit 1, Wert=2)
                </span>
              )}
              <span className={`flex items-center gap-1 ${cyanText}`}>
                <span className={`inline-block w-3 h-3 rounded ${cyanBg}`} />{" "}
                Geflippt
              </span>
              <span className={`flex items-center gap-1 ${lbl}`}>
                "flippt" = Maskenbit war 1 | "=" = Maskenbit war 0, bleibt
                gleich
              </span>
            </div>
          </div>

          {/* Step 3: Bit by bit */}
          <div
            className="rounded-lg border p-3 space-y-1 text-xs border-border bg-card/40"
          >
            <p className={`font-bold mb-2 ${mono}`}>
              Schritt 3 - Jedes Bit einzeln (von links nach rechts = Bit 7 bis
              Bit 0)
            </p>
            <div
              className={`grid text-xs font-semibold px-2 mb-1 ${lbl}`}
              style={{
                gridTemplateColumns: "80px 28px 20px 28px 20px 28px 1fr",
              }}
            >
              <span>Bit-Nr.</span>
              <span className="text-center">A</span>
              <span className="text-center">XOR</span>
              <span className="text-center">Maske</span>
              <span className="text-center">=</span>
              <span className="text-center">Erg.</span>
              <span>Erklarung</span>
            </div>
            {Array.from({ length: 8 }, (_, i) => {
              const bitPos = 7 - i;
              const bA = (a >> bitPos) & 1;
              const bB = (b >> bitPos) & 1;
              const bR = (result >> bitPos) & 1;
              const flipped = bA !== bR;
              const isUL = b === 0x02 && bitPos === UL_BIT_POS;
              return (
                <div
                  key={i}
                  className={`grid rounded px-2 py-1.5 ${isUL ? accentBg : flipped ? cyanBg : ""}`}
                  style={{
                    gridTemplateColumns: "80px 28px 20px 28px 20px 28px 1fr",
                  }}
                >
                  <span
                    className={`font-mono font-semibold ${isUL ? accent : lbl}`}
                  >
                    Bit {bitPos}
                    {isUL ? " U/L" : ""}
                  </span>
                  <span className={`text-center font-mono font-bold ${mono}`}>
                    {bA}
                  </span>
                  <span className={`text-center ${lbl}`}>XOR</span>
                  <span
                    className={`text-center font-mono font-bold ${bB === 1 ? cyanText : lbl}`}
                  >
                    {bB}
                  </span>
                  <span className={`text-center ${lbl}`}>=</span>
                  <span
                    className={`text-center font-mono font-bold ${flipped ? cyanText : mono}`}
                  >
                    {bR}
                  </span>
                  <span className={`${lbl}`}>
                    {bB === 1 ? (
                      <span className={cyanText}>
                        {bA} wird {bR} (Maske=1 flippt)
                      </span>
                    ) : (
                      <span>bleibt {bA} (Maske=0, kein Flip)</span>
                    )}
                    {isUL && (
                      <span className={`ml-2 font-bold ${accent}`}>
                        DIES ist das U/L-Bit!
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step 4: Summary */}
          <div
            className="rounded-lg border p-3 bg-card border-border"
          >
            <p className={`text-xs font-bold mb-2 ${mono}`}>
              Schritt 4 - Ergebnis
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <p className={lbl}>Byte A (Binar)</p>
                <p className={`font-mono font-bold mt-0.5 ${mono}`}>
                  {toBin8(a)}
                </p>
                <p className={`font-mono text-xs ${lbl}`}>
                  = 0x{a.toString(16).toUpperCase().padStart(2, "0")} = {a}
                </p>
              </div>
              <div>
                <p className={lbl}>XOR Maske (Binar)</p>
                <p className={`font-mono font-bold mt-0.5 ${cyanText}`}>
                  {toBin8(b)}
                </p>
                <p className={`font-mono text-xs ${lbl}`}>
                  = 0x{b.toString(16).toUpperCase().padStart(2, "0")} = {b}
                </p>
              </div>
              <div>
                <p className={lbl}>Ergebnis (Binar)</p>
                <p className={`font-mono font-bold mt-0.5 ${accent}`}>
                  {toBin8(result)}
                </p>
                <p className={`font-mono text-xs ${lbl}`}>
                  = 0x{result.toString(16).toUpperCase().padStart(2, "0")} ={" "}
                  {result}
                </p>
              </div>
            </div>
          </div>

          {/* U/L Bit naming confusion explainer */}
          {b === 0x02 && (
            <div
              className="rounded-lg border p-3 text-xs space-y-2 border-status-warning-border/30 bg-status-warning-bg text-status-warning-fg"
            >
              <p className="font-bold text-sm">
                Das "7. Bit" - Warum heisst es so? (Namenswirrwarr klaren!)
              </p>
              <p>
                0x02 = <strong>0000 0010</strong>. Die unterlegte Stelle (von
                rechts das 2. Bit) ist es.
              </p>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr
                    className="text-status-warning-fg"
                  >
                    <th className="text-left py-1 pr-3">Zahlung</th>
                    <th className="text-left py-1">
                      Ergebnis fur das Bit mit Wert 2
                    </th>
                    <th className="text-left py-1">Warum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pr-3 py-0.5 font-semibold">
                      Von links, ab 1
                    </td>
                    <td className="py-0.5">
                      das <strong>7. Bit</strong>
                    </td>
                    <td className="py-0.5">
                      Position 7 von 8 von links
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-3 py-0.5 font-semibold">
                      Von rechts, ab 0
                    </td>
                    <td className="py-0.5">
                      <strong>Bit 1</strong>
                    </td>
                    <td className="py-0.5">
                      Informatik-Konvention (LSB=0)
                    </td>
                  </tr>
                  <tr>
                    <td className="pr-3 py-0.5 font-semibold">
                      Von rechts, ab 1
                    </td>
                    <td className="py-0.5">
                      das <strong>2. Bit</strong>
                    </td>
                    <td className="py-0.5">Alltagssprache</td>
                  </tr>
                  <tr>
                    <td className="pr-3 py-0.5 font-semibold">Wert</td>
                    <td className="py-0.5">
                      <strong>2 (= 0x02 = 2^1)</strong>
                    </td>
                    <td className="py-0.5">
                      Einzig eindeutige Angabe!
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>
                Alle vier Beschreibungen meinen <strong>dasselbe Bit</strong>.
                Verwirrung entsteht nur durch unterschiedliche Zahlanfange.
              </p>
              <p className="font-semibold">
                Konkretes Beispiel: 0xAA (10101010) XOR 0x02 (00000010) = 0xA8
                (10101000) - nur das 2. Bit von rechts (Wert 2) kippt von 1 auf
                0.
              </p>
              <p>
                IEEE U/L-Bit Bedeutung: Bei einer neuen fabrikseitig zugeteilten
                MAC ist dieses Bit = 0. EUI-64 setzt es auf 1 um zu
                kennzeichnen: "diese Interface-ID wurde aus einer MAC
                abgeleitet".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EUI64Tab() {
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
        className="rounded-xl p-3 text-xs bg-accent-primary/10 border border-accent-primary/20 text-accent-primary-fg"
      >
        <strong>Lernziel:</strong> Verstehen, wie eine IPv6 Interface-ID per
        EUI-64 aus einer MAC-Adresse generiert wird — der Mechanismus hinter
        SLAAC.
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-1 text-muted-foreground"
        >
          MAC-Adresse eingeben
        </label>
        <div className="flex gap-2">
          <input
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calculate()}
            placeholder="z.B.  AA:BB:CC:DD:EE:FF"
            className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono bg-muted border-border text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={calculate}
            className="px-4 py-2 rounded-lg bg-accent-solid hover:opacity-90 text-on-accent-solid text-xs font-semibold transition-colors"
          >
            Berechnen
          </button>
        </div>
        {error && <p className="text-xs text-status-error-fg mt-1">{error}</p>}
      </div>

      {result && (
        <div className="space-y-2">
          {result.steps.map((step, i) => (
            <div
              key={i}
              className="rounded-xl border overflow-hidden border-border"
            >
              <button
                onClick={() => setOpenStep(openStep === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors bg-muted hover:bg-muted/80"
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === result.steps.length - 1 ? "bg-accent-solid text-on-accent-solid" : "bg-muted-foreground text-background"}`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-xs font-medium block text-muted-foreground"
                  >
                    {step.label}
                  </span>
                  <span
                    className="text-xs font-mono break-all mt-0.5 block text-accent-primary-fg"
                  >
                    {step.value}
                  </span>
                </div>
                <span
                  className="text-lg leading-none text-muted-foreground"
                >
                  {openStep === i ? "−" : "+"}
                </span>
              </button>
              {openStep === i && (
                <div
                  className="px-4 py-3 text-xs leading-relaxed border-t bg-muted/40 text-muted-foreground border-border"
                >
                  {step.explanation}
                </div>
              )}
            </div>
          ))}

          <div
            className="rounded-xl border p-3 bg-accent-primary/10 border-accent-primary/30"
          >
            <span
              className="text-xs font-semibold block mb-1 text-accent-primary-fg"
            >
              Ergebnis: Interface-ID
            </span>
            <span
              className="text-lg font-mono font-bold text-foreground"
            >
              {result.interfaceId}
            </span>
            <span
              className="text-xs block mt-1 text-muted-foreground"
            >
              Vollständige SLAAC-Adresse (Beispiel): 2001:DB8:1::
              {result.interfaceId}/64
            </span>
          </div>
        </div>
      )}

      {!result && (
        <div
          className="rounded-xl border p-3 bg-muted/40 border-border"
        >
          <p
            className="text-xs font-medium mb-2 text-muted-foreground"
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
              className="w-full text-left flex items-center gap-2 px-2 py-1 rounded-lg transition-colors text-muted-foreground hover:text-accent-primary-fg hover:bg-accent-primary/10"
            >
              <span className="font-mono text-xs">{m}</span>
              <span className="text-xs text-muted-foreground">— {lbl}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── XOR / U/L-Bit Erklärer ─────────────────────────────── */}
      <XorExplainer
        initialByte={
          result ? parseInt(result.steps[0].value.split(":")[0], 16) : undefined
        }
      />
    </div>
  );
}

// ── Tab: Segmentierung ────────────────────────────────────────

function SegmentationTab() {
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
        className="rounded-xl p-3 text-xs bg-status-success-bg border border-status-success-border/20 text-status-success-fg"
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
          className="text-xs font-medium mb-2 text-muted-foreground"
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
              className="text-left text-xs px-3 py-2 rounded-lg border transition-colors border-border bg-muted hover:bg-status-success-border/20 hover:border-status-success-border/30 text-muted-foreground hover:text-status-success-fg"
            >
              <span className="font-mono font-semibold">{s.prefix}</span>
              {" → /"}
              <span className="font-semibold">{s.newCidr}</span>
              <span className="ml-2 text-muted-foreground">{s.label}</span>
              <span
                className="ml-1 text-xs text-status-success-fg"
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
            htmlFor="ipv6-seg-prefix"
            className="block text-xs font-medium mb-1 text-muted-foreground"
          >
            Ausgangspräfix (mit /CIDR)
          </label>
          <input
            id="ipv6-seg-prefix"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="z.B. 2001:DB8::/48"
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono bg-muted border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label
            htmlFor="ipv6-seg-cidr"
            className="block text-xs font-medium mb-1 text-muted-foreground"
          >
            Neues CIDR (1–128)
          </label>
          <input
            id="ipv6-seg-cidr"
            type="number"
            min={1}
            max={128}
            value={newCidr}
            onChange={(e) => setNewCidr(parseInt(e.target.value))}
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono bg-muted border-border text-foreground"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full py-2 rounded-lg bg-status-success-solid hover:opacity-90 text-on-status-success-solid text-sm font-semibold transition-colors"
      >
        Segmentieren
      </button>
      {error && <p className="text-xs text-status-error-fg">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div
            className="rounded-xl border p-3 grid grid-cols-3 gap-3 text-center bg-muted/60 border-border"
          >
            <StatBlock
              label="Subnetz-Bits"
              value={String(result.subnetBits)}
            />
            <StatBlock
              label="Anzahl Subnetze"
              value={
                result.totalCount > BigInt(1_000_000)
                  ? `2^${result.subnetBits}`
                  : result.totalCount.toString()
              }
            />
            <StatBlock
              label="Präfix-Länge"
              value={`/${result.subnets[0]?.prefixLength ?? ""}`}
            />
          </div>

          <div>
            <p
              className="text-xs font-medium mb-2 text-muted-foreground"
            >
              Erste {result.showFirst} Subnetze
              {result.totalCount > BigInt(8)
                ? ` (von ${result.totalCount > BigInt(1_000_000) ? "2^" + result.subnetBits : result.totalCount})`
                : ""}
              :
            </p>
            <div
              className="rounded-xl border overflow-hidden border-border"
            >
              <table className="w-full text-xs">
                <thead>
                  <tr className={"bg-muted"}>
                    <th
                      className="px-3 py-2 text-left font-semibold w-8 text-muted-foreground"
                    >
                      #
                    </th>
                    <th
                      className="px-3 py-2 text-left font-semibold text-muted-foreground"
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
                        "border-t border-border"
                      }
                    >
                      <td
                        className="px-3 py-2 text-muted-foreground"
                      >
                        {i}
                      </td>
                      <td
                        className="px-3 py-2 font-mono font-medium text-status-success-fg"
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
            className="rounded-xl p-3 text-xs bg-status-warning-bg border border-status-warning-border/20 text-status-warning-fg"
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

function DrillTab() {
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
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${filter === f ? ("bg-status-warning-bg border-status-warning-border/40 text-status-warning-fg") : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {filterLabels[f]}
          </button>
        ))}
        {accuracy !== null && (
          <span
            className={`ml-auto text-xs font-semibold ${accuracy >= 70 ? ("text-status-success-fg") : "text-status-warning-fg"}`}
          >
            {score.right}/{score.total} ({accuracy}%)
          </span>
        )}
      </div>

      {/* Task card */}
      <div
        className="rounded-xl border p-4 bg-muted/60 border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium bg-status-warning-bg text-status-warning-fg"
          >
            {taskTypeLabel[task.drillType]}
          </span>
        </div>

        <p
          className="text-sm font-medium mb-3 text-foreground"
        >
          {task.question}
        </p>

        <div
          className="rounded-lg border px-3 py-2 mb-4 bg-card border-border"
        >
          <span
            className="text-sm font-mono break-all text-accent-primary-fg"
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
                  colorClass = "bg-status-success-bg border-status-success-border text-status-success-fg";
                else if (isSelectedChoice)
                  colorClass = "bg-status-error-bg border-status-error-border text-status-error-fg";
                else
                  colorClass = "border-border text-muted-foreground";
              } else if (isSelectedChoice) {
                colorClass = "bg-status-warning-bg border-status-warning-border text-status-warning-fg";
              } else {
                colorClass = "border-border text-muted-foreground hover:bg-muted hover:text-foreground";
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
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono bg-card border-border text-foreground placeholder:text-muted-foreground disabled:bg-muted disabled:text-muted-foreground`}
          />
        )}
      </div>

      {/* Hint toggle */}
      {!checked && (
        <button
          onClick={() => setShowHint((v) => !v)}
          className="flex items-center gap-1.5 text-xs transition-colors text-muted-foreground hover:text-muted-foreground"
        >
          <Info size={12} />
          {showHint ? "Hinweis ausblenden" : "Hinweis anzeigen"}
        </button>
      )}
      {showHint && !checked && (
        <div
          className="rounded-xl p-3 text-xs bg-muted border border-border text-muted-foreground"
        >
          {task.hint}
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <div
          className={`rounded-xl border p-3 ${correct ? ("bg-status-success-bg border-status-success-border/30") : "bg-status-error-bg border-status-error-border/30"}`}
        >
          <div className="flex items-center gap-2 mb-1">
            {correct ? (
              <CheckCircle
                size={14}
                className={"text-status-success-fg"}
                weight="fill"
              />
            ) : (
              <XCircle
                size={14}
                className={"text-status-error-fg"}
                weight="fill"
              />
            )}
            <span
              className={`text-xs font-semibold ${correct ? ("text-status-success-fg") : "text-status-error-fg"}`}
            >
              {correct ? "Richtig!" : "Falsch"}
            </span>
          </div>
          <p
            className="text-xs text-muted-foreground"
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
            className="flex-1 py-2 rounded-lg bg-status-warning-solid hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-on-status-warning-solid text-sm font-semibold transition-colors"
          >
            Überprüfen
          </button>
        )}
        {checked && (
          <button
            onClick={() => newTask()}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-status-warning-solid hover:opacity-90 text-on-status-warning-solid text-sm font-semibold transition-colors"
          >
            <ArrowClockwise size={14} />
            Nächste Aufgabe
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tab: Binär-Rechner ────────────────────────────────────────

const HEX_DIGITS = "0123456789ABCDEF";

function hexToBin4(h: string): string {
  return parseInt(h, 16).toString(2).padStart(4, "0");
}

function BinaryTab() {
  const [ipv6Input, setIpv6Input] = useState("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
  const [hoverDigit, setHoverDigit] = useState<string | null>(null);
  const [clickedDigit, setClickedDigit] = useState<string | null>(null);

  const card = "bg-muted/60 border-border";
  const lbl = "text-muted-foreground";
  const mono = "text-foreground";
  const accent = "text-accent-primary-fg";

  const activeDigit = clickedDigit ?? hoverDigit;

  // Parse IPv6 to 32 hex chars (fill gaps gracefully)
  const cleanHex = (() => {
    const raw = ipv6Input.trim().replace(/:/g, "").toUpperCase();
    if (/^[0-9A-F]{1,32}$/.test(raw)) return raw.padEnd(32, "0").slice(0, 32);
    try {
      const exp = expandIPv6(ipv6Input.trim());
      return exp ? exp.replace(/:/g, "").toUpperCase() : null;
    } catch {
      return null;
    }
  })();

  const groups = cleanHex
    ? Array.from({ length: 8 }, (_, i) => cleanHex.slice(i * 4, i * 4 + 4))
    : null;

  return (
    <div className="p-4 space-y-5">
      {/* Hex→Binär Reference Matrix */}
      <div className={`rounded-xl border p-4 space-y-3 ${card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${accent}`}>
          Hex → Binär Referenztabelle (alle 16 Ziffern 0–F)
        </p>
        <p className={`text-xs ${lbl}`}>
          Jede Hex-Ziffer entspricht genau <strong className={mono}>4 Bits</strong> (einem Nibble).
          Eine IPv6-Gruppe (z.B. <span className="font-mono">2001</span>) = 4 Hex-Ziffern = <strong className={mono}>16 Bits</strong>.
        </p>

        {/* Bit-value header */}
        <div className={`flex items-center text-center font-mono text-xs ${lbl}`} style={{ paddingLeft: "72px" }}>
          {["8","4","2","1"].map(v => (
            <span key={v} className="w-7 font-semibold">{v}</span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {HEX_DIGITS.split("").map((h) => {
            const bin = hexToBin4(h);
            const isActive = activeDigit === h;
            const val = parseInt(h, 16);
            return (
              <button
                key={h}
                onMouseEnter={() => setHoverDigit(h)}
                onMouseLeave={() => setHoverDigit(null)}
                onClick={() => setClickedDigit(clickedDigit === h ? null : h)}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 border text-left transition-all ${
                  isActive
                    ? "border-accent-primary bg-accent-primary/25"
                    : "border-border hover:border-border hover:bg-muted/50"
                }`}
              >
                {/* Hex digit */}
                <span className={`w-5 text-center font-mono font-black text-base ${isActive ? accent : mono}`}>{h}</span>
                <span className={`text-xs ${lbl}`}>=</span>
                {/* 4 bits */}
                <span className="flex gap-0.5">
                  {bin.split("").map((bit, i) => (
                    <span key={i} className={`w-6 h-6 flex items-center justify-center rounded font-mono font-bold text-sm border ${
                      bit === "1"
                        ? "bg-accent-primary/30 border-accent-primary/60 text-accent-primary-fg"
                        : "bg-muted/50 border-border text-muted-foreground"
                    }`}>{bit}</span>
                  ))}
                </span>
                <span className={`text-xs ml-auto font-mono ${lbl}`}>{val}</span>
              </button>
            );
          })}
        </div>

        {/* Detail view for active digit */}
        {activeDigit && (() => {
          const val = parseInt(activeDigit, 16);
          const bin = hexToBin4(activeDigit);
          const parts = [8, 4, 2, 1];
          return (
            <div className="rounded-lg border p-3 space-y-2 text-xs border-accent-primary/40 bg-accent-primary/10">
              <p className={`font-bold ${accent}`}>
                0x{activeDigit} = {val} = Binär: {bin}
              </p>
              <div className="flex gap-2 flex-wrap">
                {bin.split("").map((bit, i) => (
                  <div key={i} className="text-center">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-lg font-mono font-black text-lg border-2 ${
                      bit === "1"
                        ? "bg-accent-primary/20 border-accent-primary text-accent-primary-fg"
                        : "bg-muted border-border text-muted-foreground"
                    }`}>{bit}</div>
                    <div className={`mt-0.5 font-semibold ${bit === "1" ? accent : lbl}`}>{parts[i]}</div>
                  </div>
                ))}
                <div className={`flex items-center ml-3 gap-1 text-sm font-mono ${mono}`}>
                  {bin.split("").map((bit, i) => (
                    <span key={i}>
                      {bit === "1" && <span className={`${accent} font-bold`}>{parts[i]}</span>}
                      {bit === "1" && i < 3 && bin.split("").slice(i + 1).some(b => b === "1") && <span className={lbl}> + </span>}
                    </span>
                  ))}
                  {val === 0 && <span className={lbl}>kein Bit gesetzt</span>}
                  <span className={lbl}> = </span>
                  <span className={`font-bold ${accent}`}>{val}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* IPv6 address decomposition */}
      <div className={`rounded-xl border p-4 space-y-3 ${card}`}>
        <p className={`text-xs font-bold uppercase tracking-wide ${accent}`}>IPv6-Adresse Bit für Bit</p>
        <div>
          <label className={`block text-xs mb-1 ${lbl}`}>IPv6-Adresse eingeben</label>
          <input
            value={ipv6Input}
            onChange={(e) => setIpv6Input(e.target.value)}
            placeholder="z.B. 2001:db8::1"
            className="w-full rounded-lg border px-3 py-2 text-sm font-mono bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {["2001:0db8:85a3::8a2e:0370:7334", "fe80::1", "::1", "ff02::1", "2001:db8:1:2:3:4:5:6"].map(ex => (
              <button key={ex} onClick={() => setIpv6Input(ex)}
                className="text-xs px-2 py-0.5 rounded border transition-colors border-border text-muted-foreground hover:text-accent-primary-fg hover:border-accent-primary/40">
                {ex}
              </button>
            ))}
          </div>
        </div>

        {groups ? (
          <div className="space-y-3">
            {/* Group overview */}
            <div tabIndex={0} role="region" aria-label="Gruppenübersicht" className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <table className="w-full border-collapse text-center" style={{minWidth:"560px"}}>
                <thead>
                  <tr>
                    {groups.map((g, gi) => (
                      <td key={gi} className={`px-1 pb-1 text-xs font-semibold ${lbl}`}>Gruppe {gi + 1}</td>
                    ))}
                  </tr>
                  <tr>
                    {groups.map((g, gi) => (
                      <td key={gi} className="px-1 pb-2">
                        <span className={`font-mono font-bold text-sm ${accent}`}>{g}</span>
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Per-group: 4 hex digits each as 4 bits */}
                  {[0,1,2,3].map(digitIdx => (
                    <tr key={digitIdx}>
                      {groups.map((g, gi) => {
                        const h = g[digitIdx];
                        const bin = hexToBin4(h);
                        return (
                          <td key={gi} className="px-1 py-0.5">
                            <div className="flex justify-center gap-0.5">
                              {bin.split("").map((bit, bi) => (
                                <span key={bi} className={`w-5 h-5 flex items-center justify-center rounded text-xs font-mono font-bold border ${
                                  bit === "1"
                                    ? "bg-accent-primary/25 border-accent-primary/50 text-accent-primary-fg"
                                    : "bg-muted/40 border-border text-muted-foreground"
                                }`}>{bit}</span>
                              ))}
                            </div>
                            <div className={`text-center text-xs font-mono mt-0.5 ${accent}`}>{h}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* bit count row */}
                  <tr>
                    {groups.map((_, gi) => (
                      <td key={gi} className={`px-1 pt-1 text-center text-xs ${lbl}`}>16 Bit</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Full 128-bit binary string */}
            <div className="rounded-lg border p-3 space-y-2 border-border bg-card/40">
              <p className={`text-xs font-bold ${mono}`}>Vollständige 128-Bit Darstellung</p>
              <div className="flex flex-wrap gap-0.5">
                {groups.map((g, gi) =>
                  g.split("").map((h, di) =>
                    hexToBin4(h).split("").map((bit, bi) => {
                      const absIdx = gi * 16 + di * 4 + bi;
                      return (
                        <span key={absIdx} className={`font-mono text-xs font-bold ${
                          (absIdx % 16 === 0 && absIdx > 0) ? "ml-2" : (absIdx % 4 === 0 && absIdx > 0 ? "ml-0.5" : "")
                        } ${bit === "1"
                          ? "text-accent-primary-fg"
                          : "text-muted-foreground"
                        }`}>{bit}</span>
                      );
                    })
                  )
                )}
              </div>
              <p className={`text-xs ${lbl}`}>
                Leerzeichen = Nibble-Grenze (4 Bit) · Größerer Abstand = Gruppen-Grenze (16 Bit)
              </p>
            </div>
          </div>
        ) : (
          <p className={`text-xs ${lbl}`}>Ungültige IPv6-Adresse — bitte korrigieren.</p>
        )}
      </div>

      {/* Quick tip */}
      <div className="rounded-lg border p-3 text-xs space-y-1 border-border bg-muted/40 text-muted-foreground">
        <p className={`font-bold ${mono}`}>Merkhilfe</p>
        <p>1 Hex-Ziffer = 4 Bit | 1 IPv6-Gruppe (z.B. <span className="font-mono">85a3</span>) = 4 Ziffern = <strong className={mono}>16 Bit</strong> | Ganze IPv6-Adresse = 8 Gruppen = <strong className={mono}>128 Bit</strong></p>
        <p>Tipp: Klicke eine Ziffer in der Tabelle oben an, um die Berechnungsformel zu sehen.</p>
      </div>
    </div>
  );
}

// ── Main Dialog ───────────────────────────────────────────────

interface IPv6CalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
}

export function IPv6CalculatorDialog({
  open,
  onClose,
}: IPv6CalculatorDialogProps) {
  const [tab, setTab] = useState<IPv6Tab>("analyse");

  if (!open) return null;

  const tabs: { id: IPv6Tab; label: string; activeClass: string }[] = [
    {
      id: "analyse",
      label: "Adress-Analyse",
      activeClass: "border-accent-primary text-accent-primary-fg",
    },
    {
      id: "eui64",
      label: "EUI-64",
      activeClass: "border-accent-primary text-accent-primary-fg",
    },
    {
      id: "segmentation",
      label: "Segmentierung",
      activeClass: "border-status-success-border text-status-success-fg",
    },
    {
      id: "drill",
      label: "Drill",
      activeClass: "border-status-warning-border text-status-warning-fg",
    },
    {
      id: "binaer",
      label: "Binär",
      activeClass: "border-status-trunk-border text-status-trunk-fg",
    },
  ];

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="IPv6-Rechner"
        className="fixed inset-0 z-dialog flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-card border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 border-border bg-muted/50"
          >
            <div className="w-9 h-9 rounded-xl bg-accent-solid flex items-center justify-center flex-shrink-0">
              <Calculator size={18} weight="duotone" className="text-on-accent-solid" />
            </div>
            <div>
              <h2
                className="font-bold text-sm text-foreground"
              >
                IPv6 Rechner & Drill
              </h2>
              <p
                className="text-xs mt-0.5 text-muted-foreground"
              >
                Adress-Analyse · EUI-64 · Segmentierung · Binär · Drill
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="ml-auto p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Bar */}
          <div
            className="flex border-b flex-shrink-0 border-border"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors ${tab === t.id ? `${t.activeClass} border-b-2` : `border-transparent text-muted-foreground hover:text-foreground`}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {tab === "analyse" && <AnalyseTab />}
            {tab === "eui64" && <EUI64Tab />}
            {tab === "segmentation" && <SegmentationTab />}
            {tab === "drill" && <DrillTab />}
            {tab === "binaer" && <BinaryTab />}
          </div>
        </div>
      </div>
    </ModalPortal>
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

// ============================================================
// SubnettingDrillDialog
// Zwei Modi:
//  1) Einzelsubnetz-Drill: IP + Maske → Subnetz-ID, Broadcast,
//     Erste/Letzte Host, Magic Number
//  2) Subnetz-Segmentierung: Netz + Anzahl benötigter Subnetze
//     → neue Präfixlänge, Maske, Hosts/Subnetz, Subnetz-IDs
// ============================================================

import {
  ArrowClockwise,
  ArrowRight,
  Calculator,
  CheckCircle,
  GridFour,
  Path,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useMemo, useState, type ReactNode } from "react";
import { ModalPortal } from "@/components/ui/modal-portal";

// ── Domain-Logik ────────────────────────────────────────────

interface DrillTask {
  id: number;
  ip: [number, number, number, number];
  mask: [number, number, number, number];
  cidr: number;
  // Lösung
  subnet: [number, number, number, number];
  broadcast: [number, number, number, number];
  firstHost: [number, number, number, number];
  lastHost: [number, number, number, number];
  magic: number;
}

type Octet = [number, number, number, number];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cidrToMask(cidr: number): Octet {
  const bits = "1".repeat(cidr) + "0".repeat(32 - cidr);
  return [
    parseInt(bits.slice(0, 8), 2),
    parseInt(bits.slice(8, 16), 2),
    parseInt(bits.slice(16, 24), 2),
    parseInt(bits.slice(24, 32), 2),
  ] as Octet;
}

function ipToInt(o: Octet): number {
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0;
}

function intToIp(n: number): Octet {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ] as Octet;
}

function generateTask(id: number): DrillTask {
  // CIDR aus pädagogisch sinnvollem Bereich /16 .. /30 (vermeidet /31, /32)
  const cidr = randInt(16, 30);
  const mask = cidrToMask(cidr);

  // Erstes Oktett: Klasse A/B/C aus 1–223 (kein Multicast / experimental)
  let ip: Octet;
  // eslint-disable-next-line prefer-const
  ip = [randInt(1, 223), randInt(0, 255), randInt(0, 255), randInt(0, 255)];
  // Skip 127 (loopback) und Klasse-D/E
  if (ip[0] === 127) ip[0] = 128;

  const ipInt = ipToInt(ip);
  const maskInt = ipToInt(mask);
  const subnetInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (subnetInt | (~maskInt >>> 0)) >>> 0;
  const subnet = intToIp(subnetInt);
  const broadcast = intToIp(broadcastInt);
  const firstHost = intToIp(subnetInt + 1);
  const lastHost = intToIp(broadcastInt - 1);

  // Magic Number = 256 − das erste Oktett der Maske, das nicht 255 ist
  let magic = 256;
  for (const m of mask) {
    if (m !== 255) {
      magic = 256 - m;
      break;
    }
  }
  if (magic === 0) magic = 1; // /32 — sollte hier nicht vorkommen

  return {
    id,
    ip,
    mask,
    cidr,
    subnet,
    broadcast,
    firstHost,
    lastHost,
    magic,
  };
}

function generateBatch(n: number): DrillTask[] {
  return Array.from({ length: n }, (_, i) => generateTask(i + 1));
}

// ── Subnetz-Segmentierung Domain-Logik ──────────────────────

interface SegSubnet {
  networkId: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
}

interface SegTask {
  id: number;
  baseNetwork: string; // z.B. "192.168.10.0"
  baseCidr: number;    // z.B. 24
  requiredSubnets: number; // z.B. 4
  // Lösung
  newCidr: number;     // z.B. 26
  newMask: string;     // z.B. "255.255.255.192"
  hostsPerSubnet: number;
  subnets: SegSubnet[];// alle resultierenden Subnetze
}

function numToIpStr(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8)  & 0xff,
    n          & 0xff,
  ].join(".");
}

function ipStrToNum(s: string): number {
  const parts = s.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/** Berechnet alle Subnetze eines segmentierten Netzes */
export function calcSegmentation(
  baseNetwork: string,
  baseCidr: number,
  requiredSubnets: number,
): Omit<SegTask, "id" | "baseNetwork" | "baseCidr" | "requiredSubnets"> {
  // Mindest-Bits für requiredSubnets (aufgerundet auf nächste Zweierpotenz)
  const subnetBits = Math.ceil(Math.log2(Math.max(requiredSubnets, 2)));
  const newCidr = baseCidr + subnetBits;
  const maskNum = newCidr >= 32 ? 0xffffffff : (0xffffffff << (32 - newCidr)) >>> 0;
  const newMask = numToIpStr(maskNum);
  const hostBits = 32 - newCidr;
  const hostsPerSubnet = hostBits > 1 ? (1 << hostBits) - 2 : hostBits === 1 ? 0 : 1;
  const blockSize = 1 << hostBits;
  const totalSubnets = 1 << subnetBits;
  const baseNum = ipStrToNum(baseNetwork);

  const subnets: SegSubnet[] = Array.from({ length: totalSubnets }, (_, i) => {
    const netNum = (baseNum + i * blockSize) >>> 0;
    const bcNum  = (netNum + blockSize - 1) >>> 0;
    return {
      networkId: numToIpStr(netNum),
      broadcast: numToIpStr(bcNum),
      firstHost: numToIpStr((netNum + 1) >>> 0),
      lastHost:  numToIpStr((bcNum  - 1) >>> 0),
    };
  });

  return { newCidr, newMask, hostsPerSubnet, subnets };
}

const SEG_REQUIRED_OPTIONS = [2, 4, 8, 16];
const SEG_BASE_CIDRS = [16, 20, 22, 24];

function generateSegTask(id: number): SegTask {
  const baseCidr = SEG_BASE_CIDRS[randInt(0, SEG_BASE_CIDRS.length - 1)];
  const requiredSubnets = SEG_REQUIRED_OPTIONS[randInt(0, SEG_REQUIRED_OPTIONS.length - 1)];

  // Erzeuge ein realistisches Netz-Basisaddresse
  const firstOctet = randInt(1, 223);
  const baseNum = ipStrToNum(
    `${firstOctet === 127 ? 10 : firstOctet}.${randInt(0, 255)}.${randInt(0, 255)}.0`,
  );
  // Subnetz-ID des Basisnetzes
  const baseMaskNum = (0xffffffff << (32 - baseCidr)) >>> 0;
  const netNum = (baseNum & baseMaskNum) >>> 0;
  const baseNetwork = numToIpStr(netNum);

  const seg = calcSegmentation(baseNetwork, baseCidr, requiredSubnets);
  return { id, baseNetwork, baseCidr, requiredSubnets, ...seg };
}

function generateSegBatch(n: number): SegTask[] {
  return Array.from({ length: n }, (_, i) => generateSegTask(i + 1));
}

function octetEq(a: Octet, parsed: (number | null)[]): boolean {
  if (parsed.length !== 4) return false;
  return parsed.every((v, i) => v === a[i]);
}

function parseOctets(input: string): (number | null)[] {
  // erlaubt: "192.168.1.0", "192 168 1 0", "192,168,1,0"
  const parts = input
    .trim()
    .split(/[.\s,]+/)
    .filter(Boolean)
    .map((s) => {
      const n = Number.parseInt(s, 10);
      if (Number.isNaN(n) || n < 0 || n > 255) return null;
      return n;
    });
  // pad to 4
  while (parts.length < 4) parts.push(null);
  return parts.slice(0, 4);
}

const TOTAL_TASKS = 30;

type DrillMode = "single" | "segmentation";

// ── UI ─────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
}

// ── Segmentation sub-component ─────────────────────────────

interface SegDrillProps {
  inputCls: string;
}

function useSegDrill(totalTasks = TOTAL_TASKS) {
  const [tasks, setTasks] = useState<SegTask[]>(() => generateSegBatch(totalTasks));
  const [idx, setIdx]     = useState(0);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [solvedFlags, setSolvedFlags] = useState<boolean[]>(() => Array(totalTasks).fill(false));

  // user inputs
  const [cidrIn, setCidrIn]     = useState("");
  const [maskIn, setMaskIn]     = useState("");
  const [hostsIn, setHostsIn]   = useState("");
  // For each subnet's network-ID (show first 4 subnets)
  const [subnetIns, setSubnetIns] = useState<string[]>(["", "", "", ""]);

  const task = tasks[idx];
  const SHOW_SUBNETS = Math.min(4, task?.subnets.length ?? 0);

  const setSubnetIn = (i: number, v: string) =>
    setSubnetIns((arr) => arr.map((x, j) => (j === i ? v : x)));

  const result = useMemo(() => {
    if (!checked || !task) return null;
    const cidrOk  = Number.parseInt(cidrIn.trim(), 10) === task.newCidr;
    const maskOk  = maskIn.trim() === task.newMask;
    const hostsOk = Number.parseInt(hostsIn.trim(), 10) === task.hostsPerSubnet;
    const subnetsOk = Array.from({ length: SHOW_SUBNETS }, (_, i) =>
      subnetIns[i].trim() === task.subnets[i].networkId,
    );
    return { cidrOk, maskOk, hostsOk, subnetsOk };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, task, cidrIn, maskIn, hostsIn, subnetIns]);

  const handleCheck = () => {
    if (!task) return;
    const cidrOk  = Number.parseInt(cidrIn.trim(), 10) === task.newCidr;
    const maskOk  = maskIn.trim() === task.newMask;
    const hostsOk = Number.parseInt(hostsIn.trim(), 10) === task.hostsPerSubnet;
    const subnetsOk = Array.from({ length: SHOW_SUBNETS }, (_, i) =>
      subnetIns[i].trim() === task.subnets[i].networkId,
    );
    const allOk = cidrOk && maskOk && hostsOk && subnetsOk.every(Boolean);
    setChecked(true);
    if (allOk && !solvedFlags[idx]) {
      setScore((s) => s + 1);
      setSolvedFlags((f) => f.map((v, i) => (i === idx ? true : v)));
    }
  };

  const handleNext = () => {
    if (idx + 1 >= totalTasks) return;
    setIdx((i) => i + 1);
    setCidrIn(""); setMaskIn(""); setHostsIn("");
    setSubnetIns(["", "", "", ""]);
    setChecked(false);
  };

  const handleRestart = () => {
    setTasks(generateSegBatch(totalTasks));
    setIdx(0);
    setCidrIn(""); setMaskIn(""); setHostsIn("");
    setSubnetIns(["", "", "", ""]);
    setChecked(false);
    setScore(0);
    setSolvedFlags(Array(totalTasks).fill(false));
  };

  return {
    tasks, idx, checked, score, task, SHOW_SUBNETS,
    cidrIn, setCidrIn, maskIn, setMaskIn, hostsIn, setHostsIn,
    subnetIns, setSubnetIn, result,
    handleCheck, handleNext, handleRestart,
    finished: idx + 1 === totalTasks && checked,
  };
}

// ── Rechenweg-Erklärungen (pure, testbar) ───────────────────

function toBin8(n: number): string {
  return n.toString(2).padStart(8, "0");
}

interface SingleExplain {
  octetIndex: number; // 0..3 — das interessante Oktett
  octetLabel: string; // "3. Oktett"
  maskOctet: number;
  magic: number;
  netBitsInOctet: number; // 0..8 — Split-Position im Oktett
  ipOctet: number;
  subnetOctet: number;
  broadcastOctet: number;
  steps: string[];
}

export function explainSingle(task: DrillTask): SingleExplain {
  const idx = Math.max(
    0,
    task.mask.findIndex((m) => m !== 255),
  );
  const octetIndex = task.mask[idx] === undefined ? 3 : idx;
  const maskOctet = task.mask[octetIndex];
  const magic = task.magic;
  const netBitsInOctet = Math.min(8, Math.max(0, task.cidr - octetIndex * 8));
  const ipOctet = task.ip[octetIndex];
  const subnetOctet = task.subnet[octetIndex];
  const broadcastOctet = task.broadcast[octetIndex];
  const octetLabel = `${octetIndex + 1}. Oktett`;

  const subnetStr = task.subnet.join(".");
  const bcStr = task.broadcast.join(".");
  const firstStr = task.firstHost.join(".");
  const lastStr = task.lastHost.join(".");

  const steps: string[] = [];
  if (maskOctet === 0) {
    // byte-aligned (/8,/16,/24): interessantes Oktett wird voll zum Host
    steps.push(
      `Interesting Octet: ${octetLabel}. Hier ist die Maske 0 → das Oktett gehört komplett zum Host-Anteil, die linken Oktette (255) werden 1:1 übernommen.`,
    );
    steps.push(`Blockgröße in diesem Oktett: 256 − 0 = 256 (volle 256er-Schritte).`);
    steps.push(`Subnetz-ID: dieses und alle rechten Host-Oktette auf 0 → ${subnetStr}.`);
  } else {
    steps.push(
      `Interesting Octet: ${octetLabel} (Maske ${maskOctet}). Die übrigen Oktette sind 255 (1:1 übernehmen) oder 0 (auf 0 setzen).`,
    );
    steps.push(`Magic Number / Blockgröße: 256 − ${maskOctet} = ${magic}.`);
    steps.push(
      `Subnetz-ID: größtes Vielfaches von ${magic}, das ≤ ${ipOctet} ist, = ${subnetOctet} → ${subnetStr}.`,
    );
  }
  steps.push(
    `Broadcast: nächstes Vielfaches − 1 = ${subnetOctet + magic} − 1 = ${broadcastOctet}; rechte Host-Oktette = 255 → ${bcStr}.`,
  );
  steps.push(
    `Nutzbare Hosts: ${firstStr} … ${lastStr} (Subnetz-ID + 1 bis Broadcast − 1).`,
  );

  return {
    octetIndex,
    octetLabel,
    maskOctet,
    magic,
    netBitsInOctet,
    ipOctet,
    subnetOctet,
    broadcastOctet,
    steps,
  };
}

interface SegExplain {
  subnetBits: number;
  newCidr: number;
  hostBits: number;
  blockSize: number;
  steps: string[];
}

export function explainSeg(task: SegTask): SegExplain {
  const subnetBits = Math.ceil(Math.log2(Math.max(task.requiredSubnets, 2)));
  const newCidr = task.newCidr;
  const hostBits = 32 - newCidr;
  const blockSize = 1 << hostBits;
  const firstIds = task.subnets
    .slice(0, Math.min(4, task.subnets.length))
    .map((s) => s.networkId)
    .join(", ");

  const steps = [
    `${task.requiredSubnets} Subnetze benötigt → 2^${subnetBits} = ${1 << subnetBits} ≥ ${task.requiredSubnets} → ${subnetBits} Subnetz-Bit(s) vom Host-Anteil borgen.`,
    `Neue Präfixlänge: /${task.baseCidr} + ${subnetBits} = /${newCidr} → Maske ${task.newMask}.`,
    `Blockgröße (Schrittweite zur nächsten Subnetz-ID): 2^${hostBits} = ${blockSize} Adressen.`,
    `Subnetz-IDs: ${task.baseNetwork} + n × ${blockSize} → ${firstIds} …`,
    `Nutzbare Hosts je Subnetz: 2^${hostBits} − 2 = ${task.hostsPerSubnet}.`,
  ];

  return { subnetBits, newCidr, hostBits, blockSize, steps };
}

// ── Rechenweg-UI-Komponenten ────────────────────────────────

function BinaryOctet({
  value,
  netBits,
}: {
  value: number;
  netBits: number;
}) {
  const bits = toBin8(value).split("");
  return (
    <span className="inline-flex items-center font-mono text-[11px] leading-none">
      {bits.map((b, i) => (
        <span
          key={i}
          className={`inline-block w-4 py-1 text-center ${
            i < netBits
              ? "bg-accent-primary/25 text-accent-primary-fg"
              : "bg-muted/40 text-muted-foreground"
          } ${i === netBits - 1 ? "mr-1.5 rounded-r-sm" : ""} ${i === netBits ? "rounded-l-sm" : ""} ${i === 0 ? "rounded-l-sm" : ""} ${i === 7 ? "rounded-r-sm" : ""}`}
        >
          {b}
        </span>
      ))}
    </span>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span
            className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-accent-primary/20 text-accent-primary-fg"
          >
            {i + 1}
          </span>
          <span className="text-xs leading-snug text-muted-foreground">
            {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

function CalcPathCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-xl border p-3.5 space-y-3 border-accent-primary/30 bg-accent-primary/10"
    >
      <div className="flex items-center gap-1.5">
        <Path size={14} weight="bold" className={"text-accent-primary-fg"} />
        <span className="text-xs font-semibold text-accent-primary-fg">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function SingleCalcPath({ task }: { task: DrillTask }) {
  const ex = explainSingle(task);
  const rows: Array<{ label: string; octet: number; strong?: boolean }> = [
    { label: "IP", octet: ex.ipOctet },
    { label: "Maske", octet: ex.maskOctet },
    { label: "Subnetz-ID", octet: ex.subnetOctet, strong: true },
    { label: "Broadcast", octet: ex.broadcastOctet, strong: true },
  ];
  return (
    <CalcPathCard title="Rechenweg">
      <StepList steps={ex.steps} />
      <div className="rounded-lg p-2.5 bg-card/50">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Binär · {ex.octetLabel} ·{" "}
          <span className={"text-accent-primary-fg"}>Netz</span>
          {" | "}
          <span className={"text-muted-foreground"}>Host</span>
        </div>
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-2">
              <span className={`w-20 shrink-0 text-[11px] ${r.strong ? ("text-accent-primary-fg font-semibold") : "text-muted-foreground"}`}>
                {r.label}
              </span>
              <BinaryOctet value={r.octet} netBits={ex.netBitsInOctet} />
              <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                = {r.octet}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CalcPathCard>
  );
}

function SegCalcPath({ task }: { task: SegTask }) {
  const ex = explainSeg(task);
  return (
    <CalcPathCard title="Rechenweg">
      <StepList steps={ex.steps} />
    </CalcPathCard>
  );
}

function SegmentationDrill({ inputCls }: SegDrillProps) {
  const drill = useSegDrill();
  const { task, checked, result, SHOW_SUBNETS } = drill;

  if (!task) return null;

  const fieldOk = (ok: boolean | undefined) =>
    checked ? (
      <span className={`text-xs flex items-center gap-1 ${ok ? "text-status-success-fg" : "text-status-error-fg"}`}>
        {ok ? <CheckCircle size={12} weight="fill" /> : <XCircle size={12} weight="fill" />}
        {ok ? "richtig" : "falsch"}
      </span>
    ) : null;

  const allOk = result && result.cidrOk && result.maskOk && result.hostsOk && result.subnetsOk.every(Boolean);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="h-1 rounded-full bg-muted">
        <div
          className="h-full bg-status-trunk-solid rounded-full transition-all"
          style={{ width: `${((drill.idx + (checked ? 1 : 0)) / TOTAL_TASKS) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Aufgabe {drill.idx + 1} / {TOTAL_TASKS} · Score: {drill.score} ✓
        </span>
        <button
          type="button"
          onClick={drill.handleRestart}
          className="p-1 rounded transition-colors text-muted-foreground hover:text-foreground"
          title="Neu starten"
          aria-label="Segmentierungs-Drill neu starten"
        >
          <ArrowClockwise size={14} />
        </button>
      </div>

      {/* Task display */}
      <div className="rounded-xl px-4 py-3 font-mono text-sm bg-status-trunk-bg text-status-trunk-fg">
        <div><span>Netzwerk:&nbsp;&nbsp;&nbsp;</span><span className="font-bold">{task.baseNetwork}/{task.baseCidr}</span></div>
        <div><span>Benötigte Subnetze: </span><span className="font-bold">{task.requiredSubnets}</span></div>
      </div>

      <p className="text-xs text-muted-foreground">
        Wie wird das Netz in mindestens {task.requiredSubnets} gleich große Subnetze aufgeteilt?
        Bestimme neue Präfixlänge, Subnetzmaske, Hosts pro Subnetz und die ersten {SHOW_SUBNETS} Subnetz-IDs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Neue Präfixlänge */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Neue Präfixlänge (CIDR)
            </label>
            {fieldOk(result?.cidrOk)}
          </div>
          <input
            type="text" inputMode="numeric"
            value={drill.cidrIn}
            onChange={(e) => drill.setCidrIn(e.target.value)}
            placeholder="z. B. 26"
            className={inputCls}
            disabled={checked}
          />
          {checked && !result?.cidrOk && (
            <p className="text-xs text-status-error-fg">Lösung: /{task.newCidr}</p>
          )}
        </div>

        {/* Neue Maske */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Neue Subnetzmaske
            </label>
            {fieldOk(result?.maskOk)}
          </div>
          <input
            type="text" inputMode="numeric"
            value={drill.maskIn}
            onChange={(e) => drill.setMaskIn(e.target.value)}
            placeholder="z. B. 255.255.255.192"
            className={inputCls}
            disabled={checked}
          />
          {checked && !result?.maskOk && (
            <p className="text-xs text-status-error-fg">Lösung: {task.newMask}</p>
          )}
        </div>

        {/* Hosts pro Subnetz */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Hosts / Subnetz
            </label>
            {fieldOk(result?.hostsOk)}
          </div>
          <input
            type="text" inputMode="numeric"
            value={drill.hostsIn}
            onChange={(e) => drill.setHostsIn(e.target.value)}
            placeholder="z. B. 62"
            className={inputCls}
            disabled={checked}
          />
          {checked && !result?.hostsOk && (
            <p className="text-xs text-status-error-fg">Lösung: {task.hostsPerSubnet}</p>
          )}
        </div>
      </div>

      {/* Subnetz-IDs */}
      <div className="rounded-lg p-3 space-y-2 bg-muted/60">
        <p className="text-xs font-medium text-muted-foreground">
          Subnetz-IDs (erste {SHOW_SUBNETS} Subnetze):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: SHOW_SUBNETS }, (_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">
                  Subnetz {i + 1}
                </label>
                {checked && (
                  <span className={`text-xs flex items-center gap-1 ${result?.subnetsOk[i] ? "text-status-success-fg" : "text-status-error-fg"}`}>
                    {result?.subnetsOk[i]
                      ? <CheckCircle size={11} weight="fill" />
                      : <XCircle size={11} weight="fill" />}
                    {result?.subnetsOk[i] ? "richtig" : task.subnets[i].networkId}
                  </span>
                )}
              </div>
              <input
                type="text" inputMode="numeric"
                value={drill.subnetIns[i]}
                onChange={(e) => drill.setSubnetIn(i, e.target.value)}
                placeholder="z. B. 192.168.1.0"
                className={inputCls}
                disabled={checked}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Detailübersicht nach Prüfung */}
      {checked && (
        <>
          <div className={`rounded-md px-3 py-2 text-xs ${
            allOk
              ? "bg-status-success-bg text-status-success-fg border border-status-success-border/30"
              : "bg-status-error-bg text-status-error-fg border border-status-error-border/30"
          }`}>
            {allOk
              ? "Alles korrekt — gut gemacht!"
              : "Nicht alles richtig — der Rechenweg zeigt jeden Schritt."}
          </div>
          <SegCalcPath task={task} />
        </>
      )}

      {drill.finished && (
        <div className="rounded-xl p-3 text-xs bg-status-trunk-bg border border-status-trunk-border/30 text-status-trunk-fg">
          <strong>Drill beendet.</strong> {drill.score} von {TOTAL_TASKS} beim ersten Versuch korrekt.
        </div>
      )}

      {/* Footer actions */}
      <div className="flex justify-end gap-2 pt-1">
        {!checked && (
          <button
            type="button"
            onClick={drill.handleCheck}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-status-trunk-solid hover:opacity-90 text-on-status-trunk-solid transition-colors"
          >
            Prüfen
          </button>
        )}
        {checked && drill.idx + 1 < TOTAL_TASKS && (
          <button
            type="button"
            onClick={drill.handleNext}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-status-trunk-solid hover:opacity-90 text-on-status-trunk-solid transition-colors flex items-center gap-1.5"
          >
            Nächste Aufgabe <ArrowRight size={14} />
          </button>
        )}
        {drill.finished && (
          <button
            type="button"
            onClick={drill.handleRestart}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-status-trunk-solid hover:opacity-90 text-on-status-trunk-solid transition-colors flex items-center gap-1.5"
          >
            Neuen Drill starten <ArrowClockwise size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export function SubnettingDrillDialog({ open, onClose }: Props) {
  const [mode, setMode] = useState<DrillMode>("single");
  const [tasks, setTasks] = useState<DrillTask[]>(() =>
    generateBatch(TOTAL_TASKS),
  );
  const [idx, setIdx] = useState(0);
  const [subnetIn, setSubnetIn] = useState("");
  const [broadcastIn, setBroadcastIn] = useState("");
  const [firstIn, setFirstIn] = useState("");
  const [lastIn, setLastIn] = useState("");
  const [magicIn, setMagicIn] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [solvedFlags, setSolvedFlags] = useState<boolean[]>(() =>
    Array(TOTAL_TASKS).fill(false),
  );

  const task = tasks[idx];

  const result = useMemo(() => {
    if (!checked || !task) return null;
    const subnetOk = octetEq(task.subnet, parseOctets(subnetIn));
    const broadcastOk = octetEq(task.broadcast, parseOctets(broadcastIn));
    const firstOk = octetEq(task.firstHost, parseOctets(firstIn));
    const lastOk = octetEq(task.lastHost, parseOctets(lastIn));
    const magicOk = Number.parseInt(magicIn.trim(), 10) === task.magic;
    return { subnetOk, broadcastOk, firstOk, lastOk, magicOk };
  }, [checked, task, subnetIn, broadcastIn, firstIn, lastIn, magicIn]);

  if (!open) return null;

  const inputCls = `w-full px-2.5 py-1.5 rounded-md text-sm font-mono border bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-indigo-500`;

  const handleCheck = () => {
    if (!task) return;
    const subnetOk = octetEq(task.subnet, parseOctets(subnetIn));
    const broadcastOk = octetEq(task.broadcast, parseOctets(broadcastIn));
    const firstOk = octetEq(task.firstHost, parseOctets(firstIn));
    const lastOk = octetEq(task.lastHost, parseOctets(lastIn));
    const magicOk = Number.parseInt(magicIn.trim(), 10) === task.magic;
    const allOk = subnetOk && broadcastOk && firstOk && lastOk && magicOk;
    setChecked(true);
    if (allOk && !solvedFlags[idx]) {
      setScore((s) => s + 1);
      setSolvedFlags((f) => f.map((v, i) => (i === idx ? true : v)));
    }
  };

  const handleNext = () => {
    if (idx + 1 >= TOTAL_TASKS) return;
    setIdx((i) => i + 1);
    setSubnetIn("");
    setBroadcastIn("");
    setFirstIn("");
    setLastIn("");
    setMagicIn("");
    setChecked(false);
  };

  const handleRestart = () => {
    setTasks(generateBatch(TOTAL_TASKS));
    setIdx(0);
    setSubnetIn("");
    setBroadcastIn("");
    setFirstIn("");
    setLastIn("");
    setMagicIn("");
    setChecked(false);
    setScore(0);
    setSolvedFlags(Array(TOTAL_TASKS).fill(false));
  };

  const finished = idx + 1 === TOTAL_TASKS && checked;
  const ipStr = task
    ? `${task.ip[0]}.${task.ip[1]}.${task.ip[2]}.${task.ip[3]}`
    : "";
  const maskStr = task
    ? `${task.mask[0]}.${task.mask[1]}.${task.mask[2]}.${task.mask[3]}`
    : "";

  const fieldRow = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    correctOctets: Octet | undefined,
    correctNumber: number | undefined,
    isOk: boolean | undefined,
  ) => {
    const correctText = correctOctets
      ? correctOctets.join(".")
      : correctNumber !== undefined
        ? String(correctNumber)
        : "";
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            className="text-xs font-medium text-muted-foreground"
          >
            {label}
          </label>
          {checked && (
            <span
              className={`text-xs flex items-center gap-1 ${isOk ? "text-status-success-fg" : "text-status-error-fg"}`}
            >
              {isOk ? (
                <CheckCircle size={12} weight="fill" />
              ) : (
                <XCircle size={12} weight="fill" />
              )}
              {isOk ? "richtig" : `richtig: ${correctText}`}
            </span>
          )}
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={correctOctets ? "z. B. 192.168.1.0" : "z. B. 16"}
          className={inputCls}
          disabled={checked}
        />
      </div>
    );
  };

  const tabBtn = (m: DrillMode, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        mode === m
          ? "bg-accent-solid text-on-accent-solid"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
      aria-pressed={mode === m}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-dialog flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Subnetting-Drill"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] bg-card border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-border"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-primary/20 text-accent-primary-fg"
            >
              <Calculator size={16} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="font-semibold text-sm text-foreground"
              >
                Subnetting-Drill
              </div>
              <div className="text-[11px] text-muted-foreground">
                Üben mit Rechenweg — Magic Number & Binär
              </div>
            </div>
            {/* Mode toggle */}
            <div className="flex gap-1 p-1 rounded-lg order-last w-full sm:order-none sm:w-auto bg-muted">
              {tabBtn("single", "Einzelsubnetz", <Calculator size={13} />)}
              {tabBtn("segmentation", "Segmentierung", <GridFour size={13} />)}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Schließen"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {mode === "segmentation" ? (
              <SegmentationDrill inputCls={inputCls} />
            ) : (
              <>
                {/* Progress */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Aufgabe {idx + 1} / {TOTAL_TASKS} · Score: {score} ✓
                  </span>
                  <button
                    type="button"
                    onClick={handleRestart}
                    title="Neu generieren"
                    className="p-1 rounded transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Aufgaben neu generieren"
                  >
                    <ArrowClockwise size={14} />
                  </button>
                </div>

                <div className="h-1 rounded-full bg-muted">
                  <div
                    className="h-full bg-accent-solid rounded-full transition-all"
                    style={{
                      width: `${((idx + (checked ? 1 : 0)) / TOTAL_TASKS) * 100}%`,
                    }}
                  />
                </div>

                {task && (
                  <>
                    <div
                      className="rounded-xl px-4 py-3 font-mono text-sm bg-accent-primary/10 text-accent-primary-fg"
                    >
                      <div>
                        <span>IP-Adresse:&nbsp;&nbsp;</span>
                        <span className="font-bold">{ipStr}</span>
                      </div>
                      <div>
                        <span>Subnetzmaske:</span>{" "}
                        <span className="font-bold">{maskStr}</span>{" "}
                        <span>(/{task.cidr})</span>
                      </div>
                    </div>

                    <p
                      className="text-xs text-muted-foreground"
                    >
                      Bestimme Subnetz-ID, Broadcast, ersten und letzten nutzbaren
                      Host sowie die Magic Number.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fieldRow(
                        "Subnetz-ID",
                        subnetIn,
                        setSubnetIn,
                        task.subnet,
                        undefined,
                        result?.subnetOk,
                      )}
                      {fieldRow(
                        "Broadcast",
                        broadcastIn,
                        setBroadcastIn,
                        task.broadcast,
                        undefined,
                        result?.broadcastOk,
                      )}
                      {fieldRow(
                        "Erste Host-IP",
                        firstIn,
                        setFirstIn,
                        task.firstHost,
                        undefined,
                        result?.firstOk,
                      )}
                      {fieldRow(
                        "Letzte Host-IP",
                        lastIn,
                        setLastIn,
                        task.lastHost,
                        undefined,
                        result?.lastOk,
                      )}
                      <div className="sm:col-span-2">
                        {fieldRow(
                          "Magic Number",
                          magicIn,
                          setMagicIn,
                          undefined,
                          task.magic,
                          result?.magicOk,
                        )}
                      </div>
                    </div>

                    {checked && result && (
                      <div
                        className={`text-xs rounded-md px-3 py-2 ${
                          result.subnetOk &&
                          result.broadcastOk &&
                          result.firstOk &&
                          result.lastOk &&
                          result.magicOk
                            ? "bg-status-success-bg text-status-success-fg border border-status-success-border/30"
                            : "bg-status-error-bg text-status-error-fg border border-status-error-border/30"
                        }`}
                      >
                        {result.subnetOk &&
                        result.broadcastOk &&
                        result.firstOk &&
                        result.lastOk &&
                        result.magicOk
                          ? "Alles korrekt — gut gemacht!"
                          : "Nicht alles richtig — der Rechenweg zeigt jeden Schritt."}
                      </div>
                    )}

                    {checked && <SingleCalcPath task={task} />}
                  </>
                )}

                {finished && (
                  <div
                    className="rounded-xl p-4 text-sm bg-accent-primary/10 border border-accent-primary/30 text-accent-primary-fg"
                  >
                    <strong>Drill beendet.</strong> Du hast {score} von {TOTAL_TASKS}{" "}
                    Aufgaben beim ersten Versuch korrekt gelöst. Klicke auf das
                    Refresh-Symbol oben, um einen neuen Satz zu generieren.
                  </div>
                )}

                {/* Footer for single mode */}
                <div className="flex justify-end gap-2 pt-1">
                  {!checked && (
                    <button
                      type="button"
                      onClick={handleCheck}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-solid hover:opacity-90 text-on-accent-solid transition-colors"
                    >
                      Prüfen
                    </button>
                  )}
                  {checked && idx + 1 < TOTAL_TASKS && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-solid hover:opacity-90 text-on-accent-solid transition-colors flex items-center gap-1.5"
                    >
                      Nächste Aufgabe <ArrowRight size={14} />
                    </button>
                  )}
                  {finished && (
                    <button
                      type="button"
                      onClick={handleRestart}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-solid hover:opacity-90 text-on-accent-solid transition-colors flex items-center gap-1.5"
                    >
                      Neuen Drill starten <ArrowClockwise size={14} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

// ── Exports for tests ──────────────────────────────────────
export const __test__ = {
  cidrToMask,
  generateTask,
  parseOctets,
  octetEq,
  calcSegmentation,
  generateSegTask,
  explainSingle,
  explainSeg,
  toBin8,
};

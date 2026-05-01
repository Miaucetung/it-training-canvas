// ============================================================
// SubnettingDrillDialog
// Interaktive Übung: 30 automatisch generierte Subnetting-Aufgaben
// nach dem Muster aus den Tag-3-Notizen ("03 - Subnetting_1.doc"):
//   IP-Adresse + Subnetzmaske gegeben
//   → Subnetz-ID, Broadcast, Erste/Letzte Host, Magic Number
// ============================================================

import { useMemo, useState } from "react";
import { ArrowClockwise, ArrowRight, CheckCircle, XCircle, X } from "@phosphor-icons/react";

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
  ip = [
    randInt(1, 223),
    randInt(0, 255),
    randInt(0, 255),
    randInt(0, 255),
  ];
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

// ── UI ─────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export function SubnettingDrillDialog({ open, onClose, theme }: Props) {
  const dark = theme === "dark";
  const [tasks, setTasks] = useState<DrillTask[]>(() => generateBatch(TOTAL_TASKS));
  const [idx, setIdx] = useState(0);
  const [subnetIn, setSubnetIn] = useState("");
  const [broadcastIn, setBroadcastIn] = useState("");
  const [firstIn, setFirstIn] = useState("");
  const [lastIn, setLastIn] = useState("");
  const [magicIn, setMagicIn] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [solvedFlags, setSolvedFlags] = useState<boolean[]>(() => Array(TOTAL_TASKS).fill(false));

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
    setSubnetIn(""); setBroadcastIn(""); setFirstIn(""); setLastIn(""); setMagicIn("");
    setChecked(false);
  };

  const handleRestart = () => {
    setTasks(generateBatch(TOTAL_TASKS));
    setIdx(0);
    setSubnetIn(""); setBroadcastIn(""); setFirstIn(""); setLastIn(""); setMagicIn("");
    setChecked(false);
    setScore(0);
    setSolvedFlags(Array(TOTAL_TASKS).fill(false));
  };

  const finished = idx + 1 === TOTAL_TASKS && checked;
  const ipStr = task ? `${task.ip[0]}.${task.ip[1]}.${task.ip[2]}.${task.ip[3]}` : "";
  const maskStr = task ? `${task.mask[0]}.${task.mask[1]}.${task.mask[2]}.${task.mask[3]}` : "";

  const inputCls = `w-full px-2.5 py-1.5 rounded-md text-sm font-mono border ${
    dark
      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
  } focus:outline-none focus:ring-1 focus:ring-indigo-500`;

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
          <label className={`text-xs font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>
            {label}
          </label>
          {checked && (
            <span className={`text-xs flex items-center gap-1 ${isOk ? "text-emerald-500" : "text-rose-500"}`}>
              {isOk ? <CheckCircle size={12} weight="fill" /> : <XCircle size={12} weight="fill" />}
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Subnetting-Drill"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${
          dark ? "bg-slate-900 border border-slate-700" : "bg-white border border-slate-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-3 px-5 py-3 border-b ${
            dark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <div className="flex-1">
            <div className={`font-semibold text-sm ${dark ? "text-white" : "text-slate-900"}`}>
              Subnetting-Drill
            </div>
            <div className="text-xs text-slate-500">
              Aufgabe {idx + 1} / {TOTAL_TASKS} · Score: {score} ✓
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            title="Neu generieren"
            className={`p-1.5 rounded-md transition-colors ${
              dark ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            aria-label="Aufgaben neu generieren"
          >
            <ArrowClockwise size={16} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-md transition-colors ${
              dark ? "text-slate-400 hover:text-white hover:bg-slate-700" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className={`h-1 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
          <div
            className="h-full bg-indigo-500 transition-all"
            style={{ width: `${((idx + (checked ? 1 : 0)) / TOTAL_TASKS) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {task && (
            <>
              <div
                className={`rounded-xl px-4 py-3 font-mono text-sm ${
                  dark ? "bg-slate-800 text-indigo-300" : "bg-indigo-50 text-indigo-900"
                }`}
              >
                <div>
                  <span className="opacity-70">IP-Adresse:&nbsp;&nbsp;</span>
                  <span className="font-bold">{ipStr}</span>
                </div>
                <div>
                  <span className="opacity-70">Subnetzmaske:</span>{" "}
                  <span className="font-bold">{maskStr}</span>{" "}
                  <span className="opacity-70">(/{task.cidr})</span>
                </div>
              </div>

              <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
                Bestimme Subnetz-ID, Broadcast, ersten und letzten nutzbaren Host sowie die Magic Number.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fieldRow("Subnetz-ID", subnetIn, setSubnetIn, task.subnet, undefined, result?.subnetOk)}
                {fieldRow("Broadcast", broadcastIn, setBroadcastIn, task.broadcast, undefined, result?.broadcastOk)}
                {fieldRow("Erste Host-IP", firstIn, setFirstIn, task.firstHost, undefined, result?.firstOk)}
                {fieldRow("Letzte Host-IP", lastIn, setLastIn, task.lastHost, undefined, result?.lastOk)}
                <div className="sm:col-span-2">
                  {fieldRow("Magic Number", magicIn, setMagicIn, undefined, task.magic, result?.magicOk)}
                </div>
              </div>

              {checked && result && (
                <div
                  className={`text-xs rounded-md px-3 py-2 ${
                    result.subnetOk && result.broadcastOk && result.firstOk && result.lastOk && result.magicOk
                      ? dark
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : dark
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {result.subnetOk && result.broadcastOk && result.firstOk && result.lastOk && result.magicOk
                    ? "Alles korrekt — gut gemacht!"
                    : "Nicht alles richtig — vergleiche oben mit der Lösung."}
                </div>
              )}
            </>
          )}

          {finished && (
            <div
              className={`rounded-xl p-4 text-sm ${
                dark ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-200" : "bg-indigo-50 border border-indigo-200 text-indigo-800"
              }`}
            >
              <strong>Drill beendet.</strong> Du hast {score} von {TOTAL_TASKS} Aufgaben beim ersten Versuch korrekt gelöst.
              Klicke auf das Refresh-Symbol oben, um einen neuen Satz zu generieren.
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center gap-2 justify-end px-5 py-3 border-t ${
            dark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          {!checked && (
            <button
              type="button"
              onClick={handleCheck}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Prüfen
            </button>
          )}
          {checked && idx + 1 < TOTAL_TASKS && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
            >
              Nächste Aufgabe <ArrowRight size={14} />
            </button>
          )}
          {finished && (
            <button
              type="button"
              onClick={handleRestart}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
            >
              Neuen Drill starten <ArrowClockwise size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Exports for tests ──────────────────────────────────────
export const __test__ = {
  cidrToMask,
  generateTask,
  parseOctets,
  octetEq,
};

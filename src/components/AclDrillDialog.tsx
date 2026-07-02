// ============================================================
// AclDrillDialog — ACL-Drill (gegen die Uhr), sieben Modi:
//   1) "wildcard"  — host / any / Subnetz als Adress-Wildcard schreiben
//   2) "match"     — ACL + Paket lesen → permit/deny (First-Match + implizites deny)
//   3) "build"     — Standard- ODER Extended-ACE aus Anforderung schreiben
//   4) "range"     — IP-Bereich abdecken, mehrere Lösungswege (semantisch geprüft)
//   5) "named"     — benannte ACL: Definition + ACE
//   6) "advanced"  — established, Operatoren (gt/lt/range), log, time-range
//   7) "placement" — Interface + Richtung wählen
// ============================================================

import {
  ArrowRight,
  CheckCircle,
  Crosshair,
  Eye,
  ListChecks,
  MapPin,
  Sliders,
  Tag,
  Timer,
  ArrowsHorizontal,
  Function as FunctionIcon,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  checkAclAdvanced,
  checkAclBuild,
  checkAclNamed,
  checkAclRange,
  checkAclWildcard,
  generateAclAdvancedTask,
  generateAclBuildTask,
  generateAclMatchTask,
  generateAclNamedTask,
  generateAclPlacementTask,
  generateAclRangeTask,
  generateAclWildcardTask,
  type AclAdvancedTask,
  type AclBuildTask,
  type AclMatchTask,
  type AclNamedTask,
  type AclPlacementTask,
  type AclRangeTask,
  type AclWildcardTask,
} from "@/lib/acl-drill";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

type Mode = "wildcard" | "match" | "build" | "range" | "named" | "advanced" | "placement";

interface Stats {
  total: number;
  correct: number;
  streak: number;
  best: number;
}

export function AclDrillDialog({ open, onClose, theme }: Props) {
  const dark = theme === "dark";
  const [mode, setMode] = useState<Mode>("wildcard");
  const [wcTask, setWcTask] = useState<AclWildcardTask>(() => generateAclWildcardTask());
  const [matchTask, setMatchTask] = useState<AclMatchTask>(() => generateAclMatchTask());
  const [buildTask, setBuildTask] = useState<AclBuildTask>(() => generateAclBuildTask());
  const [rangeTask, setRangeTask] = useState<AclRangeTask>(() => generateAclRangeTask());
  const [namedTask, setNamedTask] = useState<AclNamedTask>(() => generateAclNamedTask());
  const [advTask, setAdvTask] = useState<AclAdvancedTask>(() => generateAclAdvancedTask());
  const [placeTask, setPlaceTask] = useState<AclPlacementTask>(() => generateAclPlacementTask());
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0, best: 0 });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  const isSingleLine = mode === "wildcard" || mode === "build" || mode === "advanced";
  const isMultiLine = mode === "range" || mode === "named";
  const isChoice = mode === "match" || mode === "placement";

  const wcCheck = useMemo(
    () => (checked && mode === "wildcard" ? checkAclWildcard(input, wcTask) : null),
    [checked, mode, input, wcTask],
  );
  const buildCheck = useMemo(
    () => (checked && mode === "build" ? checkAclBuild(input, buildTask) : null),
    [checked, mode, input, buildTask],
  );
  const advCheck = useMemo(
    () => (checked && mode === "advanced" ? checkAclAdvanced(input, advTask) : null),
    [checked, mode, input, advTask],
  );
  const namedCheck = useMemo(
    () => (checked && mode === "named" ? checkAclNamed(input, namedTask) : null),
    [checked, mode, input, namedTask],
  );
  const rangeCheck = useMemo(
    () => (checked && mode === "range" ? checkAclRange(input, rangeTask) : null),
    [checked, mode, input, rangeTask],
  );

  const matchCorrectIndex = matchTask.result === "permit" ? 0 : 1;
  const isCorrect =
    mode === "wildcard"
      ? !!wcCheck?.ok
      : mode === "build"
        ? !!buildCheck?.ok
        : mode === "advanced"
          ? !!advCheck?.ok
          : mode === "named"
            ? !!namedCheck?.ok
            : mode === "range"
              ? !!rangeCheck?.ok
              : mode === "match"
                ? checked && selected === matchCorrectIndex
                : checked && selected === placeTask.correctIndex;

  if (!open) return null;

  const panel = dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const text = dark ? "text-white" : "text-slate-900";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const cardBg = dark ? "bg-slate-800/60" : "bg-slate-50";
  const ink = dark ? "#cbd5e1" : "#475569";
  const sub = dark ? "#94a3b8" : "#64748b";
  const fieldCls = `w-full rounded-lg border px-3 py-2.5 font-mono text-sm ${
    dark
      ? "bg-slate-950 border-slate-700 text-emerald-300 placeholder-slate-600"
      : "bg-slate-900 border-slate-700 text-emerald-300 placeholder-slate-500"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500/50`;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  function score(ok: boolean) {
    setStats((p) => {
      const streak = ok ? p.streak + 1 : 0;
      return { total: p.total + 1, correct: p.correct + (ok ? 1 : 0), streak, best: Math.max(p.best, streak) };
    });
  }

  function handleCheck() {
    if (checked) return;
    if (mode === "wildcard") { setChecked(true); score(checkAclWildcard(input, wcTask).ok); }
    else if (mode === "build") { setChecked(true); score(checkAclBuild(input, buildTask).ok); }
    else if (mode === "advanced") { setChecked(true); score(checkAclAdvanced(input, advTask).ok); }
    else if (mode === "named") { setChecked(true); score(checkAclNamed(input, namedTask).ok); }
    else if (mode === "range") { setChecked(true); score(checkAclRange(input, rangeTask).ok); }
    else if (mode === "match") { if (selected === null) return; setChecked(true); score(selected === matchCorrectIndex); }
    else { if (selected === null) return; setChecked(true); score(selected === placeTask.correctIndex); }
  }

  function regen(m: Mode) {
    if (m === "wildcard") setWcTask(generateAclWildcardTask());
    else if (m === "match") setMatchTask(generateAclMatchTask());
    else if (m === "build") setBuildTask(generateAclBuildTask());
    else if (m === "range") setRangeTask(generateAclRangeTask());
    else if (m === "named") setNamedTask(generateAclNamedTask());
    else if (m === "advanced") setAdvTask(generateAclAdvancedTask());
    else setPlaceTask(generateAclPlacementTask());
  }

  function handleNext() {
    setChecked(false);
    setInput("");
    setSelected(null);
    regen(mode);
  }

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setChecked(false);
    setInput("");
    setSelected(null);
    regen(m);
  }

  const tabBtn = (m: Mode, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => switchMode(m)}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
        mode === m
          ? "bg-indigo-600 text-white"
          : dark
            ? "text-slate-400 hover:bg-slate-700 hover:text-white"
            : "text-slate-600 hover:bg-slate-100"
      }`}
      aria-pressed={mode === m}
    >
      {icon}
      {label}
    </button>
  );

  const prompt =
    mode === "wildcard" ? wcTask.prompt
      : mode === "build" ? buildTask.prompt
        : mode === "advanced" ? advTask.prompt
          : mode === "range" ? rangeTask.prompt
            : mode === "named" ? namedTask.prompt
              : "";
  const hint =
    mode === "wildcard" ? wcTask.hint
      : mode === "build" ? buildTask.hint
        : mode === "advanced" ? advTask.hint
          : mode === "range" ? rangeTask.hint
            : mode === "named" ? namedTask.hint
              : "";
  const singleReason =
    mode === "wildcard" ? wcCheck?.reason : mode === "build" ? buildCheck?.reason : mode === "advanced" ? advCheck?.reason : undefined;
  const singleSolution =
    mode === "wildcard" ? wcTask.display : mode === "build" ? buildTask.display : mode === "advanced" ? advTask.display : "";

  const footHint =
    mode === "wildcard" ? "host <ip> · any · <netz> <wildcard>"
      : mode === "build" ? "access-list <n> permit|deny …"
        : mode === "advanced" ? "… [gt|lt|range] · established · log · time-range"
          : mode === "range" ? "mehrere Zeilen · jeder korrekte Weg zählt"
            : mode === "named" ? "ip access-list <typ> <NAME> + ACE"
              : mode === "match" ? "First-Match · implizites deny am Ende"
                : "Standard→Ziel/out · Extended→Quelle/in";

  const canCheck = isChoice ? selected !== null : input.trim().length > 0;

  const verdictBox = (explanation: ReactNode, extra?: ReactNode) => (
    <div
      className={`rounded-lg border p-3 text-sm ${
        isCorrect
          ? dark ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          : dark ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        {isCorrect ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
        {isCorrect ? "Richtig!" : "Nicht korrekt"}
      </div>
      {explanation && <div className="mt-1 text-xs opacity-90">{explanation}</div>}
      {extra}
    </div>
  );

  // Lösungswege für den Range-Modus (Permit-Blöcke + Subnetz/Rand-deny)
  // ── Inline-Annotation für jeden Permit-Block ────────────────
  // Erklärt: welchen Bereich deckt die Zeile ab, und warum nicht einen größeren Block?
  function permitAnnotation(net: string, wild: string, hi: number): string {
    const start = parseInt(net.split(".")[3]);
    const wildOctet = parseInt(wild.split(".")[3]);
    const size = wildOctet + 1;
    const end = start + size - 1;
    if (size === 1) return `deckt nur .${start}  — kein größerer Block startet hier`;
    const nextSize = size * 2;
    let reason = "";
    if (nextSize <= 256) {
      if (start + nextSize - 1 > hi) {
        reason = `${nextSize}er würde bis .${start + nextSize - 1} → überschreitet .${hi}`;
      } else if (start % nextSize !== 0) {
        reason = `.${start} steht nicht in Startliste für ${nextSize}er`;
      }
    }
    return `deckt .${start}–.${end}${reason ? `  ← größter Block: ${reason}` : ""}`;
  }

  function denyAnnotation(net: string, wild: string, lo: number, hi: number): string {
    const start = parseInt(net.split(".")[3]);
    const wildOctet = parseInt(wild.split(".")[3]);
    const end = start + wildOctet;
    const side = end < lo ? "vor dem Zielbereich" : "nach dem Zielbereich";
    return `deckt .${start}–.${end}  — ${side} → sperren`;
  }

  const rangeSolutions = (
    <div className={`mt-2 space-y-2 rounded-lg border p-3 ${dark ? "border-slate-700 bg-slate-950/40" : "border-slate-200 bg-white"}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
        Weg A — Permit-Blöcke (minimal {rangeTask.minLines} Zeilen)
      </div>
      <div className="space-y-0.5">
        {rangeTask.permitBlocks.map((b) => (
          <div key={b.net} className="flex flex-wrap items-baseline gap-x-3 font-mono text-[11px]">
            <span className={dark ? "text-emerald-300" : "text-emerald-700"}>
              permit {b.net} {b.wild}
            </span>
            <span className={`text-[10px] ${muted}`}>
              {permitAnnotation(b.net, b.wild, rangeTask.hi)}
            </span>
          </div>
        ))}
      </div>
      <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
        Weg B — Subnetz erlauben, Ränder sperren ({rangeTask.denyEdges.length + 1} Zeilen)
      </div>
      <div className="space-y-0.5">
        {rangeTask.denyEdges.map((b) => (
          <div key={b.net} className="flex flex-wrap items-baseline gap-x-3 font-mono text-[11px]">
            <span className={dark ? "text-rose-300" : "text-rose-700"}>
              deny {b.net} {b.wild}
            </span>
            <span className={`text-[10px] ${muted}`}>
              {denyAnnotation(b.net, b.wild, rangeTask.lo, rangeTask.hi)}
            </span>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline gap-x-3 font-mono text-[11px]">
          <span className={dark ? "text-emerald-300" : "text-emerald-700"}>
            permit {rangeTask.base}.0 0.0.0.255
          </span>
          <span className={`text-[10px] ${muted}`}>erlaubt alles, was die deny-Zeilen nicht gesperrt haben</span>
        </div>
      </div>
      <p className={`text-[11px] ${muted}`}>💡 {rangeTask.hint}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="ACL-Drill"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex shrink-0 items-center gap-3 border-b px-5 py-3 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"}`}>
            <ListChecks size={16} weight="bold" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${text}`}>ACL-Drill</div>
            <div className={`text-[11px] ${muted}`}>Wildcard, Lesen, Schreiben, Bereiche, Named & Advanced — gegen die Uhr</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-md p-1.5 transition-colors ${dark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"}`}
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 px-5 pt-2">
          <div className={`flex flex-wrap gap-1 rounded-lg p-1 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            {tabBtn("wildcard", "Wildcard", <Crosshair size={13} />)}
            {tabBtn("match", "ACL lesen", <Eye size={13} />)}
            {tabBtn("build", "ACE schreiben", <ListChecks size={13} />)}
            {tabBtn("range", "IP-Bereich", <ArrowsHorizontal size={13} />)}
            {tabBtn("named", "Named", <Tag size={13} />)}
            {tabBtn("advanced", "Advanced", <Sliders size={13} />)}
            {tabBtn("placement", "Platzierung", <MapPin size={13} />)}
          </div>
        </div>

        {/* Stats */}
        <div className={`flex shrink-0 items-center gap-4 px-5 py-2 text-xs ${muted}`}>
          <span className="flex items-center gap-1"><Timer size={13} /> {fmt(elapsed)}</span>
          <span>Aufgaben: <span className={`font-semibold ${text}`}>{stats.total}</span></span>
          <span>Richtig: <span className="font-semibold text-emerald-500">{stats.correct}</span></span>
          {accuracy !== null && <span>Quote: <span className="font-semibold">{accuracy}%</span></span>}
          {stats.streak >= 3 && <span className="font-semibold text-orange-500">🔥 {stats.streak}er Serie</span>}
          {stats.best >= 5 && <span className="text-violet-500">Best: {stats.best}</span>}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {(isSingleLine || isMultiLine) && (
            <>
              <div className={`rounded-xl p-4 ${cardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-1`}>Aufgabe</div>
                <p className={`text-sm ${text}`}>{prompt}</p>
              </div>

              {(mode === "wildcard" || mode === "range") && (
                <div className={`rounded-lg border px-3 py-2.5 ${dark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50"}`}>
                  <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${dark ? "text-indigo-300" : "text-indigo-700"}`}>
                    <FunctionIcon size={12} weight="bold" /> Spickzettel
                  </div>
                  {/* Nachschlagetabelle: kein Rechnen nötig, einfach nachschlagen */}
                  <table className={`w-full font-mono text-[11px] ${dark ? "text-slate-300" : "text-slate-700"}`}>
                    <thead>
                      <tr className={`text-[10px] ${muted}`}>
                        <th className="text-left font-semibold pb-1">Wildcard</th>
                        <th className="text-right font-semibold pb-1 pr-2">Anzahl</th>
                        <th className="text-left font-semibold pb-1 pl-3">Gültige Starts (letztes Oktett)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ["host <ip>",  "1",   "jede Adresse  (→ Kurzform für 0.0.0.0)"],
                        ["0.0.0.1",   "2",   "0, 2, 4, 6, 8 … (gerade)"],
                        ["0.0.0.3",   "4",   "0, 4, 8, 12, 16 …"],
                        ["0.0.0.7",   "8",   "0, 8, 16, 24, 32 …"],
                        ["0.0.0.15",  "16",  "0, 16, 32, 48, 64 …"],
                        ["0.0.0.31",  "32",  "0, 32, 64, 96, 128, 160, 192, 224"],
                        ["0.0.0.63",  "64",  "0, 64, 128, 192"],
                        ["0.0.0.127", "128", "0, 128"],
                        ["0.0.0.255", "256", "0  (ganzes /24 = any)"],
                      ] as [string, string, string][]).map(([wc, n, starts]) => (
                        <tr key={wc} className="leading-5">
                          <td className={dark ? "text-indigo-300" : "text-indigo-700"}>{wc}</td>
                          <td className={`text-right pr-2 ${muted}`}>{n}</td>
                          <td className={`pl-3 ${muted}`}>{starts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mode === "range" && (
                    <div className={`mt-3 border-t pt-2 ${dark ? "border-slate-700" : "border-indigo-200"}`}>
                      <div className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wide ${muted}`}>Bereich abdecken — drei Schritte:</div>
                      <ol className={`space-y-0.5 text-[11px] leading-snug ${dark ? "text-slate-300" : "text-slate-700"}`}>
                        <li>① Starte am <strong>linken Ende</strong> des Bereichs</li>
                        <li>② Suche die <strong>größte Wildcard</strong> aus der Tabelle, deren Start dort steht <em>und</em> die nicht über das rechte Ende hinausreicht</li>
                        <li>③ Schreibe die Zeile, springe um die Blockgröße vor → zurück zu ②</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {(mode === "wildcard" || mode === "range") && (
                <div className={`rounded-lg border p-3 ${dark ? "border-slate-700 bg-slate-950/40" : "border-slate-200 bg-white"}`}>
                  <div className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
                    So „rastet" ein Block ein — Blockgröße 32
                  </div>
                  <svg viewBox="0 0 880 150" width="100%" height="120" fontFamily="'IBM Plex Mono',monospace">
                    {[0, 1, 2, 3].map((i) => {
                      const x0 = 40 + i * 32 * 6.25;
                      const w = 32 * 6.25;
                      const hot = i === 1; // Fach 32–63 enthält .46
                      return (
                        <rect key={i} x={x0} y={50} width={w} height={40} rx={4}
                          fill={hot ? "rgba(245,158,11,0.18)" : i % 2 ? "rgba(100,116,139,0.18)" : "rgba(100,116,139,0.09)"}
                          stroke={hot ? "#f59e0b" : "#64748b"} strokeWidth={hot ? 2 : 1} />
                      );
                    })}
                    {["0–31", "32–63", "64–95", "96–127"].map((t, i) => (
                      <text key={t} x={40 + i * 32 * 6.25 + 100} y={75} fontSize="15" textAnchor="middle" fill={i === 1 ? "#f59e0b" : ink}>{t}</text>
                    ))}
                    {[0, 32, 64, 96, 128].map((v) => (
                      <text key={v} x={40 + v * 6.25} y={108} fontSize="13" textAnchor="middle" fill={sub}>{v}</text>
                    ))}
                    {/* Zeiger .46 */}
                    <text x={327.5} y={24} fontSize="14" textAnchor="middle" fill="#f43f5e">du tippst .46</text>
                    <path d="M327.5 30 L327.5 48" stroke="#f43f5e" strokeWidth="2" markerEnd="url(#dn)" />
                    <circle cx={327.5} cy={70} r={5} fill="#f43f5e" />
                    {/* Einrasten auf .32 */}
                    <path d="M322 80 Q 280 106 247 96" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#sn)" />
                    <text x={150} y={140} fontSize="14" textAnchor="middle" fill="#10b981">Router nimmt das ganze Fach ab .32</text>
                    <defs>
                      <marker id="dn" markerWidth="8" markerHeight="8" refX="4" refY="6" orient="auto"><path d="M0,0 L8,0 L4,7 z" fill="#f43f5e" /></marker>
                      <marker id="sn" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#10b981" /></marker>
                    </defs>
                  </svg>
                  <p className={`mt-1 text-[12px] leading-snug ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    Stell dir .0–.255 als Schrank mit festen Schubladen vor — Schublade 1: .0–.31, Schublade 2: .32–.63 usw. Du kannst <strong>nur ganze Schubladen</strong> auf- oder zusperren, nie einen Teil davon. Start <span className="text-rose-500">.46</span> liegt mitten in Schublade 2 → der Router öffnet automatisch <strong>die ganze Schublade ab .32</strong>. Richtige Starts: <strong>genau da, wo eine Schublade beginnt</strong> (0, 32, 64, 96 …).
                  </p>
                </div>
              )}

              <div>
                <label className={`mb-1 block text-xs ${muted}`}>
                  {mode === "wildcard" ? "Adress-/Wildcard-Angabe:"
                    : mode === "range" ? "ACL-Zeilen (eine pro Zeile, ohne access-list-Präfix möglich):"
                      : mode === "named" ? "Benannte ACL (Definition + ACE, je eine Zeile):"
                        : "ACL-Befehl im Global-Config-Modus:"}
                </label>
                {isMultiLine ? (
                  <textarea
                    autoFocus
                    rows={mode === "range" ? 5 : 3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === "range" ? "permit 192.168.1.0 0.0.0.63\npermit 192.168.1.64 0.0.0.31\n…" : "ip access-list extended BLOCK_TELNET\n deny tcp any host 10.0.0.5 eq 23"}
                    className={`${fieldCls} resize-y`}
                    spellCheck={false}
                    disabled={checked}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    {(mode === "build" || mode === "advanced") && (
                      <span className="font-mono text-xs text-slate-500 shrink-0">R1(config)#</span>
                    )}
                    <input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { if (checked) handleNext(); else handleCheck(); } }}
                      placeholder={
                        mode === "wildcard" ? "host 10.0.0.5  /  any  /  10.0.0.0 0.0.0.255"
                          : mode === "advanced" ? "access-list 110 permit tcp any host 10.0.0.5 established"
                            : "access-list 110 deny tcp ... eq 23"
                      }
                      className={fieldCls}
                      spellCheck={false}
                      disabled={checked}
                    />
                  </div>
                )}
              </div>

              {checked && mode === "range" && rangeCheck &&
                verdictBox(
                  <>
                    {rangeCheck.ok
                      ? `Perfekt — deine ${rangeCheck.lineCount} Zeile(n) erlauben exakt ${rangeTask.base}.${rangeTask.lo}–${rangeTask.hi}.`
                      : rangeCheck.reason}
                    {rangeCheck.alignmentHint && (
                      <div className={`mt-2 flex gap-1.5 rounded-md border px-2 py-1.5 text-[12px] ${dark ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-700"}`}>
                        <span aria-hidden>📐</span>
                        <span><span className="font-semibold">Block-Ausrichtung:</span> {rangeCheck.alignmentHint}</span>
                      </div>
                    )}
                  </>,
                  rangeSolutions,
                )}

              {checked && mode === "named" && namedCheck &&
                verdictBox(
                  namedCheck.ok ? hint : namedCheck.reason,
                  <pre className={`mt-2 overflow-x-auto rounded font-mono text-[11px] ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
                    {namedTask.displayLines.join("\n")}
                  </pre>,
                )}

              {checked && isSingleLine &&
                verdictBox(
                  isCorrect ? hint : (singleReason ?? hint),
                  <>
                    <p className="mt-2 font-mono text-xs">
                      <span className={muted}>Lösung: </span>
                      <span className={dark ? "text-emerald-300" : "text-emerald-700"}>{singleSolution}</span>
                    </p>
                    {!isCorrect && <p className={`mt-1 text-xs ${muted}`}>💡 {hint}</p>}
                  </>,
                )}
            </>
          )}

          {mode === "match" && (
            <>
              <div className={`rounded-xl p-3 ${cardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-2`}>
                  {matchTask.type === "standard" ? "Standard-ACL" : "Extended-ACL"} {matchTask.aclNumber}
                </div>
                <div className="space-y-1 font-mono text-[12px]">
                  {matchTask.lines.map((l, i) => (
                    <div key={i} className={`rounded px-2 py-1 ${dark ? "bg-slate-950/60 text-slate-200" : "bg-white text-slate-800"}`}>{l}</div>
                  ))}
                  <div className={`rounded px-2 py-1 italic ${dark ? "text-slate-500" : "text-slate-400"}`}>(implizit) deny any</div>
                </div>
              </div>
              <div className={`rounded-lg border px-3 py-2 text-sm font-mono ${dark ? "border-slate-700 text-amber-300" : "border-slate-200 text-amber-700"}`}>
                📦 {matchTask.packetText}
              </div>
              <p className={`text-sm ${text}`}>
                Wird das Paket <span className="font-semibold">erlaubt</span> oder <span className="font-semibold">verworfen</span>?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {["permit", "deny"].map((opt, i) => {
                  const isAns = i === matchCorrectIndex;
                  const isSel = i === selected;
                  let cls = dark ? "border-slate-700 hover:border-indigo-500" : "border-slate-200 hover:border-indigo-400";
                  if (checked && isAns) cls = "border-emerald-500 bg-emerald-500/10";
                  else if (checked && isSel) cls = "border-rose-500 bg-rose-500/10";
                  else if (isSel) cls = "border-indigo-500 bg-indigo-500/10";
                  return (
                    <button key={opt} type="button" disabled={checked} onClick={() => setSelected(i)}
                      className={`rounded-md border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${cls} ${text}`}>
                      {opt === "permit" ? "✅ permit (erlaubt)" : "⛔ deny (verworfen)"}
                    </button>
                  );
                })}
              </div>
              {checked && verdictBox(matchTask.explanation)}
            </>
          )}

          {mode === "placement" && (
            <>
              <div className={`rounded-xl p-4 ${cardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-1`}>Szenario</div>
                <p className={`text-sm ${text}`} dangerouslySetInnerHTML={{ __html: placeTask.scenario.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
              </div>
              <div className="grid grid-cols-1 gap-2">
                {placeTask.options.map((opt, i) => {
                  const isAns = i === placeTask.correctIndex;
                  const isSel = i === selected;
                  let cls = dark ? "border-slate-700 hover:border-indigo-500" : "border-slate-200 hover:border-indigo-400";
                  if (checked && isAns) cls = "border-emerald-500 bg-emerald-500/10";
                  else if (checked && isSel) cls = "border-rose-500 bg-rose-500/10";
                  else if (isSel) cls = "border-indigo-500 bg-indigo-500/10";
                  return (
                    <button key={opt} type="button" disabled={checked} onClick={() => setSelected(i)}
                      className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors ${cls} ${text}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {checked && verdictBox(placeTask.explanation)}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex shrink-0 items-center justify-between border-t px-5 py-3 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <span className={`text-[11px] ${muted}`}>{footHint}</span>
          {!checked ? (
            <button type="button" onClick={handleCheck} disabled={!canCheck}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40">
              Prüfen
            </button>
          ) : (
            <button type="button" onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
              Nächste <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

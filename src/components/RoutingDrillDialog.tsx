// ============================================================
// RoutingDrillDialog — Routing-Endlos-Lab
//   Modus 1: "ip route"-Befehl gegen die Uhr tippen
//   Modus 2: Longest-Prefix-Match aus einer Routing-Tabelle wählen
// ============================================================

import {
  ArrowRight,
  CheckCircle,
  Path,
  Terminal,
  Timer,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  checkIpRoute,
  generateIpRouteTask,
  generateMatchTask,
  maskString,
  type IpRouteTask,
  type MatchTask,
} from "@/lib/routing-drill";

interface Props {
  open: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

type Mode = "ip-route" | "match";

interface Stats {
  total: number;
  correct: number;
  streak: number;
  best: number;
}

export function RoutingDrillDialog({ open, onClose, theme }: Props) {
  const dark = theme === "dark";
  const [mode, setMode] = useState<Mode>("ip-route");
  const [ipTask, setIpTask] = useState<IpRouteTask>(() => generateIpRouteTask());
  const [matchTask, setMatchTask] = useState<MatchTask>(() => generateMatchTask());
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, streak: 0, best: 0 });
  const [elapsed, setElapsed] = useState(0);

  // Session-Timer (Count-up) — gegen die Uhr
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  const ipCheck = useMemo(
    () => (checked && mode === "ip-route" ? checkIpRoute(input, ipTask) : null),
    [checked, mode, input, ipTask],
  );
  const matchCorrect = checked && mode === "match" && selected === matchTask.correctIndex;
  const isCorrect = mode === "ip-route" ? !!ipCheck?.ok : matchCorrect;

  if (!open) return null;

  const panel = dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const text = dark ? "text-white" : "text-slate-900";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const cardBg = dark ? "bg-slate-800/60" : "bg-slate-50";
  const inputCls = `w-full rounded-lg border px-3 py-2.5 font-mono text-sm ${
    dark
      ? "bg-slate-950 border-slate-700 text-emerald-300 placeholder-slate-600"
      : "bg-slate-900 border-slate-700 text-emerald-300 placeholder-slate-500"
  } focus:outline-none focus:ring-2 focus:ring-indigo-500/50`;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  function score(ok: boolean) {
    setStats((p) => {
      const streak = ok ? p.streak + 1 : 0;
      return {
        total: p.total + 1,
        correct: p.correct + (ok ? 1 : 0),
        streak,
        best: Math.max(p.best, streak),
      };
    });
  }

  function handleCheck() {
    if (checked) return;
    if (mode === "ip-route") {
      const r = checkIpRoute(input, ipTask);
      setChecked(true);
      score(r.ok);
    } else {
      if (selected === null) return;
      setChecked(true);
      score(selected === matchTask.correctIndex);
    }
  }

  function handleNext() {
    setChecked(false);
    setInput("");
    setSelected(null);
    if (mode === "ip-route") setIpTask(generateIpRouteTask());
    else setMatchTask(generateMatchTask());
  }

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setChecked(false);
    setInput("");
    setSelected(null);
    if (m === "ip-route") setIpTask(generateIpRouteTask());
    else setMatchTask(generateMatchTask());
  }

  const tabBtn = (m: Mode, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => switchMode(m)}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Routing-Endlos-Lab"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex shrink-0 items-center gap-3 border-b px-5 py-3 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"}`}>
            <Path size={16} weight="bold" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${text}`}>Routing-Endlos-Lab</div>
            <div className={`text-[11px] ${muted}`}>ip route schreiben & Longest-Prefix-Match — gegen die Uhr</div>
          </div>
          <div className={`flex gap-1 rounded-lg p-1 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            {tabBtn("ip-route", "ip route", <Terminal size={13} />)}
            {tabBtn("match", "Route wählen", <Path size={13} />)}
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
          {mode === "ip-route" ? (
            <>
              <div className={`rounded-xl p-4 ${cardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-1`}>Aufgabe</div>
                <p className={`text-sm ${text}`}>{ipTask.prompt}</p>
              </div>

              <div>
                <label className={`mb-1 block text-xs ${muted}`}>Befehl im global-config-Modus:</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500 shrink-0">R1(config)#</span>
                  <input
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { if (checked) handleNext(); else handleCheck(); } }}
                    placeholder="ip route ..."
                    className={inputCls}
                    spellCheck={false}
                    disabled={checked}
                  />
                </div>
              </div>

              {checked && (
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
                  {!isCorrect && ipCheck?.reason && <p className="mt-1 text-xs opacity-90">{ipCheck.reason}</p>}
                  <p className="mt-2 font-mono text-xs">
                    <span className={muted}>Lösung: </span>
                    <span className={dark ? "text-emerald-300" : "text-emerald-700"}>{ipTask.expected}</span>
                  </p>
                  <p className={`mt-1 text-xs ${muted}`}>💡 {ipTask.hint}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={`rounded-xl p-3 ${cardBg}`}>
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-2`}>R1# show ip route</div>
                <div className="space-y-1">
                  {matchTask.table.map((r, i) => {
                    const isAns = i === matchTask.correctIndex;
                    const isSel = i === selected;
                    let cls = dark ? "border-slate-700 hover:border-indigo-500" : "border-slate-200 hover:border-indigo-400";
                    if (checked && isAns) cls = "border-emerald-500 bg-emerald-500/10";
                    else if (checked && isSel) cls = "border-rose-500 bg-rose-500/10";
                    else if (isSel) cls = "border-indigo-500 bg-indigo-500/10";
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={checked}
                        onClick={() => setSelected(i)}
                        className={`w-full rounded-md border px-2.5 py-1.5 text-left font-mono text-[12px] tabular-nums transition-colors ${cls} ${text}`}
                      >
                        <span className="text-indigo-400 font-semibold">{r.proto}</span>{"  "}
                        {r.net}/{r.cidr}
                        {r.cidr > 0 && <span className={muted}> [{r.ad}/{r.metric}]</span>} via {r.nextHop}
                        <span className={muted}>, {r.iface}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className={`text-sm ${text}`}>
                Welche Route nutzt R1 für ein Paket an <span className="font-mono font-semibold">{matchTask.dest}</span>?
                <span className={`block text-xs ${muted}`}>Tippe die Zeile an, dann „Prüfen“.</span>
              </p>
              {checked && (
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
                  <p className="mt-1 text-xs opacity-90">{matchTask.explanation}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`flex shrink-0 items-center justify-between border-t px-5 py-3 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <span className={`text-[11px] ${muted}`}>{mode === "ip-route" ? `/${ipTask.cidr} → ${ipTask.scenario === "default" ? "0.0.0.0" : maskString(ipTask.cidr)}` : "Longest Prefix Match"}</span>
          {!checked ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={mode === "match" && selected === null}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
            >
              Prüfen
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Nächste <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OspfWildcardDrillDialog — OSPF- & Wildcard-Drill (gegen die Uhr)
//   Modus 1: "wildcard"     — Wildcard-Maske zu Präfix/Maske
//   Modus 2: "ospf-network" — network … wildcard area N tippen
//   Modus 3: "dr-bdr"       — DR aus Priority + Router-ID wählen
// ============================================================

import {
  ArrowRight,
  CheckCircle,
  Crosshair,
  Function as FunctionIcon,
  Timer,
  Tree,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  checkOspfNetwork,
  checkWildcard,
  generateDrBdrTask,
  generateOspfNetworkTask,
  generateWildcardTask,
  type DrBdrTask,
  type OspfNetworkTask,
  type WildcardTask,
} from "@/lib/ospf-wildcard-drill";
import { ModalPortal } from "@/components/ui/modal-portal";

interface Props {
  open: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
}

type Mode = "wildcard" | "ospf-network" | "dr-bdr";

interface Stats {
  total: number;
  correct: number;
  streak: number;
  best: number;
}

export function OspfWildcardDrillDialog({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("wildcard");
  const [wcTask, setWcTask] = useState<WildcardTask>(() => generateWildcardTask());
  const [netTask, setNetTask] = useState<OspfNetworkTask>(() => generateOspfNetworkTask());
  const [drTask, setDrTask] = useState<DrBdrTask>(() => generateDrBdrTask());
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

  const wcCheck = useMemo(
    () => (checked && mode === "wildcard" ? checkWildcard(input, wcTask) : null),
    [checked, mode, input, wcTask],
  );
  const netCheck = useMemo(
    () => (checked && mode === "ospf-network" ? checkOspfNetwork(input, netTask) : null),
    [checked, mode, input, netTask],
  );
  const drCorrect = checked && mode === "dr-bdr" && selected === drTask.correctIndex;
  const isCorrect =
    mode === "wildcard" ? !!wcCheck?.ok : mode === "ospf-network" ? !!netCheck?.ok : drCorrect;

  if (!open) return null;

  const panel = "bg-card border-border";
  const text = "text-foreground";
  const muted = "text-muted-foreground";
  const cardBg = "bg-muted/60";
  const inputCls =
    "w-full rounded-lg border px-3 py-2.5 font-mono text-sm bg-terminal-bg border-terminal-border text-terminal-fg placeholder:text-terminal-muted focus:outline-none focus:ring-2 focus:ring-ring/50";

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
    if (mode === "wildcard") {
      setChecked(true);
      score(checkWildcard(input, wcTask).ok);
    } else if (mode === "ospf-network") {
      setChecked(true);
      score(checkOspfNetwork(input, netTask).ok);
    } else {
      if (selected === null) return;
      setChecked(true);
      score(selected === drTask.correctIndex);
    }
  }

  function handleNext() {
    setChecked(false);
    setInput("");
    setSelected(null);
    if (mode === "wildcard") setWcTask(generateWildcardTask());
    else if (mode === "ospf-network") setNetTask(generateOspfNetworkTask());
    else setDrTask(generateDrBdrTask());
  }

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setChecked(false);
    setInput("");
    setSelected(null);
    if (m === "wildcard") setWcTask(generateWildcardTask());
    else if (m === "ospf-network") setNetTask(generateOspfNetworkTask());
    else setDrTask(generateDrBdrTask());
  }

  const tabBtn = (m: Mode, label: string, icon: ReactNode) => (
    <button
      type="button"
      onClick={() => switchMode(m)}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        mode === m
          ? "bg-accent-solid text-on-accent-solid"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      aria-pressed={mode === m}
    >
      {icon}
      {label}
    </button>
  );

  const reason =
    mode === "wildcard" ? wcCheck?.reason : mode === "ospf-network" ? netCheck?.reason : undefined;
  const solution =
    mode === "wildcard" ? wcTask.expected : mode === "ospf-network" ? netTask.expected : "";
  const hint = mode === "wildcard" ? wcTask.hint : mode === "ospf-network" ? netTask.hint : "";

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-dialog flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="OSPF- & Wildcard-Drill"
        onClick={onClose}
      >
        <div
          className={`flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border shadow-2xl ${panel}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b px-5 py-3 border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 text-accent-primary-fg">
              <FunctionIcon size={16} weight="bold" />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-semibold ${text}`}>OSPF- & Wildcard-Drill</div>
              <div className={`text-[11px] ${muted}`}>Wildcard, network-Befehl & DR/BDR-Wahl — gegen die Uhr</div>
            </div>
            <div className="flex gap-1 rounded-lg p-1 bg-muted">
              {tabBtn("wildcard", "Wildcard", <Crosshair size={13} />)}
              {tabBtn("ospf-network", "network", <FunctionIcon size={13} />)}
              {tabBtn("dr-bdr", "DR/BDR", <Tree size={13} />)}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 transition-colors text-muted-foreground hover:bg-muted"
              aria-label="Schließen"
            >
              <X size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className={`flex shrink-0 items-center gap-4 px-5 py-2 text-xs ${muted}`}>
            <span className="flex items-center gap-1"><Timer size={13} /> {fmt(elapsed)}</span>
            <span>Aufgaben: <span className={`font-semibold ${text}`}>{stats.total}</span></span>
            <span>Richtig: <span className="font-semibold text-status-success-fg">{stats.correct}</span></span>
            {accuracy !== null && <span>Quote: <span className="font-semibold">{accuracy}%</span></span>}
            {stats.streak >= 3 && <span className="font-semibold text-status-blocking-fg">🔥 {stats.streak}er Serie</span>}
            {stats.best >= 5 && <span className="text-status-trunk-fg">Best: {stats.best}</span>}
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {mode === "dr-bdr" ? (
              <>
                <div className={`rounded-xl p-3 ${cardBg}`}>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-2`}>Multi-Access-Segment</div>
                  <div className="space-y-1">
                    {drTask.routers.map((r) => (
                      <div key={r.name} className={`flex items-center justify-between rounded-md px-2.5 py-1.5 font-mono text-[12px] tabular-nums bg-card/60 ${text}`}>
                        <span className="font-semibold text-accent-primary-fg">{r.name}</span>
                        <span className={muted}>Priority <span className={text}>{r.priority}</span></span>
                        <span className={muted}>RID <span className={text}>{r.rid}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className={`text-sm ${text}`}>
                  Welcher Router wird <span className="font-semibold">Designated Router (DR)</span>?
                  <span className={`block text-xs ${muted}`}>Tippe die Antwort an, dann „Prüfen“.</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {drTask.options.map((opt, i) => {
                    const isAns = i === drTask.correctIndex;
                    const isSel = i === selected;
                    let cls = "border-border hover:border-accent-primary";
                    if (checked && isAns) cls = "border-status-success-border bg-status-success-bg";
                    else if (checked && isSel) cls = "border-status-error-border bg-status-error-bg";
                    else if (isSel) cls = "border-accent-primary bg-accent-primary/10";
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={checked}
                        onClick={() => setSelected(i)}
                        className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors ${cls} ${text}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {checked && (
                  <div
                    className={`rounded-lg border p-3 text-sm ${
                      isCorrect
                        ? "border-status-success-border/30 bg-status-success-bg text-status-success-fg"
                        : "border-status-error-border/30 bg-status-error-bg text-status-error-fg"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {isCorrect ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
                      {isCorrect ? "Richtig!" : "Nicht korrekt"}
                    </div>
                    <p className="mt-1 text-xs opacity-90">{drTask.explanation}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={`rounded-xl p-4 ${cardBg}`}>
                  <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted} mb-1`}>Aufgabe</div>
                  <p className={`text-sm ${text}`}>{mode === "wildcard" ? wcTask.prompt : netTask.prompt}</p>
                </div>

                <div>
                  <label className={`mb-1 block text-xs ${muted}`}>
                    {mode === "wildcard" ? "Wildcard-Maske:" : "Befehl im router-config-Modus:"}
                  </label>
                  <div className="flex items-center gap-2">
                    {mode === "ospf-network" && (
                      <span className="font-mono text-xs text-muted-foreground shrink-0">R1(config-router)#</span>
                    )}
                    <input
                      autoFocus
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { if (checked) handleNext(); else handleCheck(); } }}
                      placeholder={mode === "wildcard" ? "0.0.0.255" : "network ... area ..."}
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
                        ? "border-status-success-border/30 bg-status-success-bg text-status-success-fg"
                        : "border-status-error-border/30 bg-status-error-bg text-status-error-fg"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {isCorrect ? <CheckCircle size={16} weight="fill" /> : <XCircle size={16} weight="fill" />}
                      {isCorrect ? "Richtig!" : "Nicht korrekt"}
                    </div>
                    {!isCorrect && reason && <p className="mt-1 text-xs opacity-90">{reason}</p>}
                    <p className="mt-2 font-mono text-xs">
                      <span className={muted}>Lösung: </span>
                      <span className={"text-status-success-fg"}>{solution}</span>
                    </p>
                    <p className={`mt-1 text-xs ${muted}`}>💡 {hint}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t px-5 py-3 border-border">
            <span className={`text-[11px] ${muted}`}>
              {mode === "wildcard" ? "Wildcard = invertierte Maske" : mode === "ospf-network" ? "network <netz> <wildcard> area <id>" : "Priority › RID-Tiebreaker"}
            </span>
            {!checked ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={mode === "dr-bdr" && selected === null}
                className="rounded-lg bg-accent-solid px-4 py-2 text-sm font-medium text-on-accent-solid transition-colors hover:opacity-90 disabled:bg-muted disabled:text-muted-foreground"
              >
                Prüfen
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-lg bg-accent-solid px-4 py-2 text-sm font-medium text-on-accent-solid transition-colors hover:opacity-90"
              >
                Nächste <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

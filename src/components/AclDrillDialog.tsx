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
  const rangeSolutions = (
    <div className={`mt-2 space-y-2 rounded-lg border p-3 ${dark ? "border-slate-700 bg-slate-950/40" : "border-slate-200 bg-white"}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
        Weg A — Permit-Blöcke (minimal {rangeTask.minLines} Zeilen)
      </div>
      <pre className={`overflow-x-auto font-mono text-[11px] ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
        {rangeTask.permitBlocks.map((b) => `permit ${b.net} ${b.wild}`).join("\n")}
      </pre>
      <div className={`text-[11px] font-semibold uppercase tracking-wide ${muted}`}>
        Weg B — Subnetz erlauben, Ränder sperren ({rangeTask.denyEdges.length + 1} Zeilen)
      </div>
      <pre className={`overflow-x-auto font-mono text-[11px] ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
        {[...rangeTask.denyEdges.map((b) => `deny ${b.net} ${b.wild}`), `permit ${rangeTask.base}.0 0.0.0.255`].join("\n")}
      </pre>
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
                  rangeCheck.ok
                    ? `Perfekt — deine ${rangeCheck.lineCount} Zeile(n) erlauben exakt ${rangeTask.base}.${rangeTask.lo}–${rangeTask.hi}.`
                    : rangeCheck.reason,
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

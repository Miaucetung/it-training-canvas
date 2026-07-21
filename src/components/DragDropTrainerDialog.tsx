// ============================================================
// DragDropTrainerDialog — Prüfungs-Zuordnungsfragen (DRAG DROP)
// Interaktion: HTML5-Drag (Desktop) + Click-to-assign (Touch/Maus):
// Item antippen → Ziel antippen. Zugewiesene Items per Klick zurücklegen.
// ============================================================

import { X, ArrowLeft, ArrowRight, ArrowCounterClockwise, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { ccnaDragDropQuestions, type DragDropQuestion } from "@/data/ccnaDragDrop";

interface Props {
  dark: boolean;
  onClose: () => void;
}

/** Deterministisch mischen, damit die Item-Reihenfolge nicht die Lösung verrät. */
function shuffled<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DragDropTrainerDialog({ dark, onClose }: Props) {
  const [qIndex, setQIndex] = useState(0);
  // itemId -> targetId
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const q: DragDropQuestion = ccnaDragDropQuestions[qIndex];
  const items = useMemo(() => shuffled(q.items, qIndex + 7), [q, qIndex]);
  const poolItems = items.filter((it) => !(it.id in placed));

  const panel = dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200";
  const text = dark ? "text-slate-200" : "text-slate-800";
  const muted = dark ? "text-slate-400" : "text-slate-500";
  const chipBase = dark
    ? "bg-slate-800 border-slate-600 text-slate-200 hover:border-indigo-400"
    : "bg-white border-slate-300 text-slate-700 hover:border-indigo-400";
  const targetBase = dark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200";

  function goto(i: number) {
    setQIndex(i);
    setPlaced({});
    setSelected(null);
    setChecked(false);
  }

  function assign(itemId: string, targetId: string) {
    if (checked) return;
    setPlaced((p) => ({ ...p, [itemId]: targetId }));
    setSelected(null);
  }

  function unassign(itemId: string) {
    if (checked) return;
    setPlaced((p) => {
      const n = { ...p };
      delete n[itemId];
      return n;
    });
  }

  function check() {
    setChecked(true);
    const allCorrect = q.items.every((it) =>
      it.target === null ? !(it.id in placed) : placed[it.id] === it.target,
    );
    if (allCorrect) setSolved((s) => new Set(s).add(qIndex));
  }

  const correctCount = q.items.filter((it) =>
    it.target === null ? !(it.id in placed) : placed[it.id] === it.target,
  ).length;
  const hasDistractors = q.items.some((it) => it.target === null);
  const allPlaced = q.items.filter((it) => it.target !== null).every((it) => it.id in placed);

  function itemVerdict(itemId: string): boolean {
    const it = q.items.find((x) => x.id === itemId)!;
    return it.target === null ? !(itemId in placed) : placed[itemId] === it.target;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border shadow-2xl overflow-hidden ${panel}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${dark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"}`}>
          <div>
            <h2 className={`text-sm font-bold ${text}`}>Drag-&-Drop-Trainer</h2>
            <p className={`text-xs ${muted}`}>
              Frage {qIndex + 1} / {ccnaDragDropQuestions.length} · {solved.size} gelöst
            </p>
          </div>
          <button onClick={onClose} className={`p-1 rounded ${muted} hover:opacity-70`}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
          <p className={`text-sm font-medium ${text}`}>{q.instruction}</p>
          {q.context && (
            <pre className="rounded-lg bg-slate-950 text-slate-200 text-xs leading-relaxed p-3 overflow-x-auto font-mono">
              {q.context}
            </pre>
          )}
          {hasDistractors && (
            <p className={`text-xs ${muted}`}>Nicht alle Elemente werden verwendet.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pool */}
            <div className="space-y-2">
              <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Elemente</p>
              {poolItems.length === 0 && (
                <p className={`text-xs italic ${muted}`}>Alle Elemente zugeordnet.</p>
              )}
              {poolItems.map((it) => (
                <button
                  key={it.id}
                  draggable={!checked}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", it.id)}
                  onClick={() => setSelected(selected === it.id ? null : it.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors cursor-grab ${chipBase} ${
                    selected === it.id ? "ring-2 ring-indigo-500 border-indigo-500" : ""
                  } ${checked && it.target !== null ? "opacity-50" : ""}`}
                >
                  {it.label}
                  {checked && (
                    <span className="ml-2 inline-flex align-middle">
                      {itemVerdict(it.id) ? (
                        <CheckCircle size={15} className="text-green-500" weight="fill" />
                      ) : (
                        <XCircle size={15} className="text-red-500" weight="fill" />
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Targets */}
            <div className="space-y-2">
              <p className={`text-xs font-semibold uppercase tracking-wider ${muted}`}>Ziele</p>
              {q.targets.map((t) => {
                const assigned = items.filter((it) => placed[it.id] === t.id);
                return (
                  <div
                    key={t.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) assign(id, t.id);
                    }}
                    onClick={() => selected && assign(selected, t.id)}
                    className={`rounded-lg border-2 border-dashed p-2 min-h-[52px] transition-colors ${targetBase} ${
                      selected ? "border-indigo-400 cursor-pointer" : ""
                    }`}
                  >
                    <p className={`text-xs font-semibold mb-1 ${text}`}>{t.label}</p>
                    <div className="space-y-1">
                      {assigned.map((it) => (
                        <button
                          key={it.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            unassign(it.id);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md border text-xs ${
                            checked
                              ? itemVerdict(it.id)
                                ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                                : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                              : chipBase
                          }`}
                          title={checked ? undefined : "Zurücklegen"}
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ergebnis */}
          {checked && (
            <div
              className={`rounded-lg border px-3 py-2 text-sm ${
                correctCount === q.items.length
                  ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              <p className="font-semibold">
                {correctCount} von {q.items.length} richtig zugeordnet
              </p>
              {q.explanation && <p className={`mt-1 text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{q.explanation}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between gap-2 px-5 py-3 border-t shrink-0 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <button
            onClick={() => goto((qIndex - 1 + ccnaDragDropQuestions.length) % ccnaDragDropQuestions.length)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${chipBase}`}
          >
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Zurück</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPlaced({});
                setSelected(null);
                setChecked(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${chipBase}`}
            >
              <ArrowCounterClockwise size={15} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={check}
              disabled={checked || !allPlaced}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <CheckCircle size={15} /> Prüfen
            </button>
          </div>
          <button
            onClick={() => goto((qIndex + 1) % ccnaDragDropQuestions.length)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${chipBase}`}
          >
            <span className="hidden sm:inline">Weiter</span> <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

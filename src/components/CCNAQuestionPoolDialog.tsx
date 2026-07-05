// ============================================================
// CCNAQuestionPoolDialog — Menü rund um den CCNA-200-301-Fragenpool
// (src/data/ccnaQuestions.ts, 1200+ Originalfragen aus dem PDF).
// ------------------------------------------------------------
// Bietet:
//   - Kategorie-Filter (Themen-Sortierung nach CCNA-Domäne)
//   - Alle Fragen (ungefiltert oder nach Kategorie)
//   - Schwächen-Drill (wiederholt falsch beantwortete Fragen,
//     persistiert in localStorage)
// Die eigentliche Frage-für-Frage-UI bleibt in QuizDialog —
// dieser Dialog baut nur das passende gefilterte Quiz-Objekt.
// ============================================================

import { useMemo, useState } from "react";
import { FireSimple, ListChecks, Target, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Quiz, ScoreResult } from "@/lib/types";
import {
  buildQuestionPoolQuiz,
  getPoolCategories,
  getPoolCategoryCounts,
} from "@/lib/ccna-question-pool";
import { QuizDialog } from "./QuizDialog";

const STORAGE_KEY = "ccna-fragenpool-weak-questions";

function loadWeakIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* localStorage nicht verfügbar */
  }
  return new Set();
}

function saveWeakIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* localStorage nicht verfügbar */
  }
}

interface Props {
  theme: "light" | "dark";
  onClose: () => void;
}

export function CCNAQuestionPoolDialog({ theme, onClose }: Props) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [weakIds, setWeakIds] = useState<Set<string>>(loadWeakIds);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const categories = useMemo(() => getPoolCategories(), []);
  const categoryCounts = useMemo(() => getPoolCategoryCounts(), []);
  const totalQuestions = useMemo(
    () => Object.values(categoryCounts).reduce((s, n) => s + n, 0),
    [categoryCounts],
  );
  const filteredCount =
    selectedCategory === "all" ? totalQuestions : (categoryCounts[selectedCategory] ?? 0);

  function startAll() {
    setActiveQuiz(buildQuestionPoolQuiz({ category: selectedCategory }));
  }

  function startDrill() {
    if (weakIds.size === 0) {
      toast.warning("Noch keine Schwächefragen. Übe erst im Lernmodus.");
      return;
    }
    setActiveQuiz(buildQuestionPoolQuiz({ ids: weakIds, shuffle: true }));
  }

  function handleQuizComplete(result: ScoreResult) {
    setWeakIds((prev) => {
      const next = new Set(prev);
      for (const r of result.results) {
        if (r.passed) next.delete(r.ruleId);
        else next.add(r.ruleId);
      }
      saveWeakIds(next);
      return next;
    });
    setActiveQuiz(null);
  }

  if (activeQuiz) {
    return (
      <QuizDialog
        quiz={activeQuiz}
        onComplete={handleQuizComplete}
        onClose={() => setActiveQuiz(null)}
        theme={theme}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl ${bg} ${border} border shadow-2xl`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <Target size={22} className="text-indigo-500" />
            <div>
              <h2 className={`font-bold ${text}`}>CCNA 200-301 — Fragenpool</h2>
              <p className={`text-xs ${textMuted}`}>{totalQuestions} Originalfragen aus dem PDF</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-slate-700/50 ${textMuted}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Stats */}
          <div className={`grid grid-cols-3 gap-3 rounded-xl p-4 ${cardBg}`}>
            <div className="flex flex-col items-center gap-1 text-center">
              <ListChecks size={20} className="text-indigo-500" />
              <span className={`text-2xl font-bold ${text}`}>{totalQuestions}</span>
              <span className={`text-xs ${textMuted}`}>Fragen gesamt</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <FireSimple size={20} className="text-orange-500" />
              <span className={`text-2xl font-bold ${text}`}>{weakIds.size}</span>
              <span className={`text-xs ${textMuted}`}>Schwächefragen</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Target size={20} className="text-purple-500" />
              <span className={`text-2xl font-bold ${text}`}>{categories.length}</span>
              <span className={`text-xs ${textMuted}`}>Kategorien</span>
            </div>
          </div>

          {/* Category filter */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${textMuted}`}>
              Kategorie filtern
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm ${
                isDark ? "border-slate-600 bg-slate-800 text-white" : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              <option value="all">Alle Kategorien ({totalQuestions} Fragen)</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} ({categoryCounts[c] ?? 0} Fragen)
                </option>
              ))}
            </select>
          </div>

          {/* Mode buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={startAll}
              disabled={filteredCount === 0}
              className="flex flex-col items-center gap-2 rounded-xl border border-indigo-500 bg-indigo-500/10 p-5 text-indigo-500 transition-all hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ListChecks size={32} />
              <span className="font-semibold">Fragen üben</span>
              <span className="text-xs opacity-80">
                {selectedCategory === "all" ? "Alle" : selectedCategory} · {filteredCount} Fragen
              </span>
            </button>

            <button
              onClick={startDrill}
              disabled={weakIds.size === 0}
              className="flex flex-col items-center gap-2 rounded-xl border border-orange-500 bg-orange-500/10 p-5 text-orange-500 transition-all hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FireSimple size={32} />
              <span className="font-semibold">Schwächen-Drill</span>
              <span className="text-xs opacity-80">
                {weakIds.size > 0 ? `${weakIds.size} gespeicherte Fehler` : "Noch keine Fehler"}
              </span>
            </button>
          </div>

          {weakIds.size > 0 && (
            <button
              onClick={() => {
                setWeakIds(new Set());
                saveWeakIds(new Set());
              }}
              className={`text-xs self-start ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"}`}
            >
              Schwächeliste zurücksetzen ({weakIds.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

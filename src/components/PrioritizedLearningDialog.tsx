// ============================================================
// PrioritizedLearningDialog — priorisierte Lern-Queue nach
// CCNA-200-301-v1.1-Blueprint-Pruefungsgewichtung.
// ------------------------------------------------------------
// Adaptiert aus CCNAQuestionPoolDialog (Fragenpool-Menue-Muster),
// aber Datenquelle ist ccna-classified-pool.ts / ccnaQuestionsClassified.ts
// (blueprint_domain + priority_score statt Text-Heuristik). Delegiert
// die eigentliche Frage-fuer-Frage-UI an QuizDialog (Wiederverwendung,
// kein UI-Neubau fuer die Interaktion selbst).
// Eigener Fortschritts-Key (localStorage), getrennt von ExamPrepDialog
// ("ccna-exam-weak-questions") und dem toten CCNAQuestionPoolDialog
// ("ccna-fragenpool-weak-questions"). Kein Supabase-Sync in dieser Version.
// ============================================================

import { useMemo, useState } from "react";
import { ChartLine, FireSimple, ListChecks, SortAscending, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Quiz, ScoreResult } from "@/lib/types";
import {
  BLUEPRINT_DOMAINS,
  getDomainCounts,
  getDomainTitle,
  toQuestion,
} from "@/lib/ccna-classified-pool";
import { ccnaQuestionsClassified, type CCNAQuestionClassified } from "@/data/ccnaQuestionsClassified";
import { QuizDialog } from "./QuizDialog";

const STORAGE_KEY = "ccna-classified-weak-questions";

// CCNA 200-301 v1.1 Blueprint-Pruefungsgewichtung je Domaene (siehe ccna-classifier CLAUDE.md).
const DOMAIN_WEIGHTS: Record<string, number> = {
  "1.0": 20,
  "2.0": 20,
  "3.0": 25,
  "4.0": 10,
  "5.0": 15,
  "6.0": 10,
};

// Anzeige-Reihenfolge der Domain-Chips: nach Pruefungsgewichtung absteigend.
const DOMAIN_DISPLAY_ORDER = ["3.0", "1.0", "2.0", "5.0", "4.0", "6.0"];

type SortMode = "priority" | "domain";

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

interface BuildQuizParams {
  domains: Set<string>;
  showUnsafe: boolean;
  sortMode: SortMode;
  ids?: Set<string>;
  shuffle?: boolean;
}

/** Baut das Lern-Queue-Quiz direkt aus den Rohdaten — erlaubt Mehrfach-Domain-
 * Auswahl und Domain-Gruppierung, was der einfache Adapter-Filter (eine Domain
 * oder "all") nicht abdeckt. Nutzt `toQuestion` aus dem Adapter fuer das Mapping. */
function buildQuiz({ domains, showUnsafe, sortMode, ids, shuffle = false }: BuildQuizParams): Quiz {
  let raw: CCNAQuestionClassified[] = ccnaQuestionsClassified;
  if (ids) raw = raw.filter((q) => ids.has(q.id));
  raw = raw.filter((q) => domains.has(q.blueprint_domain));
  if (!showUnsafe) raw = raw.filter((q) => q.classifier_confidence !== "low");

  const ordered = shuffle
    ? [...raw].sort(() => Math.random() - 0.5)
    : sortMode === "domain"
      ? [...raw].sort(
          (a, b) => a.blueprint_domain.localeCompare(b.blueprint_domain) || b.priority_score - a.priority_score,
        )
      : [...raw].sort((a, b) => b.priority_score - a.priority_score);

  return {
    id: "ccna-lernqueue-priorisiert",
    title: "CCNA 200-301 — Priorisierte Lern-Queue",
    description:
      "Nach CCNA-200-301-v1.1-Blueprint-Pruefungsgewichtung priorisierte Fragen.",
    questions: ordered.map(toQuestion),
    passingScore: 70,
    // Reihenfolge oben bereits final (sortiert/gemischt) — QuizDialog soll nicht zusaetzlich mischen.
    shuffleQuestions: false,
  };
}

interface Props {
  theme: "light" | "dark";
  onClose: () => void;
}

export function PrioritizedLearningDialog({ theme, onClose }: Props) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const [activeDomains, setActiveDomains] = useState<Set<string>>(new Set(BLUEPRINT_DOMAINS));
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [showUnsafe, setShowUnsafe] = useState(false);
  const [weakIds, setWeakIds] = useState<Set<string>>(loadWeakIds);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const domainCounts = useMemo(() => getDomainCounts(), []);
  const totalQuestions = useMemo(
    () => Object.values(domainCounts).reduce((s, n) => s + n, 0),
    [domainCounts],
  );

  const filteredCount = useMemo(() => {
    let raw: CCNAQuestionClassified[] = ccnaQuestionsClassified;
    raw = raw.filter((q) => activeDomains.has(q.blueprint_domain));
    if (!showUnsafe) raw = raw.filter((q) => q.classifier_confidence !== "low");
    return raw.length;
  }, [activeDomains, showUnsafe]);

  function toggleDomain(domain: string) {
    setActiveDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  function startAll() {
    setActiveQuiz(buildQuiz({ domains: activeDomains, showUnsafe, sortMode }));
  }

  function startDrill() {
    if (weakIds.size === 0) {
      toast.warning("Noch keine Schwächefragen. Übe erst im Lernmodus.");
      return;
    }
    setActiveQuiz(
      buildQuiz({
        domains: new Set(BLUEPRINT_DOMAINS),
        showUnsafe: true,
        sortMode: "priority",
        ids: weakIds,
        shuffle: true,
      }),
    );
  }

  function handleAnswerConfirmed(questionId: string, passed: boolean) {
    setWeakIds((prev) => {
      const next = new Set(prev);
      if (passed) next.delete(questionId);
      else next.add(questionId);
      saveWeakIds(next);
      return next;
    });
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
        onAnswerConfirmed={handleAnswerConfirmed}
        onClose={() => setActiveQuiz(null)}
        theme={theme}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-[620px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl ${bg} ${border} border shadow-2xl`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <ChartLine size={22} className="text-indigo-500" />
            <div>
              <h2 className={`font-bold ${text}`}>Priorisierte Lern-Queue</h2>
              <p className={`text-xs ${textMuted}`}>
                {totalQuestions} klassifizierte Fragen, sortiert nach Blueprint-Gewichtung
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-slate-700/50 ${textMuted}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Stats */}
          <div className={`grid grid-cols-2 gap-3 rounded-xl p-4 ${cardBg}`}>
            <div className="flex flex-col items-center gap-1 text-center">
              <ListChecks size={20} className="text-indigo-500" />
              <span className={`text-2xl font-bold ${text}`}>{filteredCount}</span>
              <span className={`text-xs ${textMuted}`}>Fragen (aktueller Filter)</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <FireSimple size={20} className="text-orange-500" />
              <span className={`text-2xl font-bold ${text}`}>{weakIds.size}</span>
              <span className={`text-xs ${textMuted}`}>Schwächefragen</span>
            </div>
          </div>

          {/* Domain-Filter */}
          <div>
            <label className={`mb-2 block text-sm font-medium ${textMuted}`}>
              Blueprint-Domänen
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_DISPLAY_ORDER.map((domain) => {
                const active = activeDomains.has(domain);
                return (
                  <button
                    key={domain}
                    onClick={() => toggleDomain(domain)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? isDark
                          ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                          : "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : isDark
                          ? "border-slate-700 text-slate-500 hover:border-slate-600"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {getDomainTitle(domain)} ({DOMAIN_WEIGHTS[domain]}%) · {domainCounts[domain] ?? 0}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sortierung + Confidence-Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SortAscending size={16} className={textMuted} />
              <div className={`flex rounded-lg border overflow-hidden ${border}`}>
                <button
                  onClick={() => setSortMode("priority")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortMode === "priority"
                      ? isDark
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-indigo-50 text-indigo-700"
                      : `${textMuted} hover:bg-slate-700/20`
                  }`}
                >
                  Nach Wichtigkeit
                </button>
                <button
                  onClick={() => setSortMode("domain")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortMode === "domain"
                      ? isDark
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-indigo-50 text-indigo-700"
                      : `${textMuted} hover:bg-slate-700/20`
                  }`}
                >
                  Nach Domäne
                </button>
              </div>
            </div>

            <label className={`flex items-center gap-2 text-xs ${textMuted} cursor-pointer`}>
              <input
                type="checkbox"
                checked={showUnsafe}
                onChange={(e) => setShowUnsafe(e.target.checked)}
                className="rounded"
              />
              Auch unsichere Fragen zeigen
            </label>
          </div>

          {/* Mode buttons */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={startAll}
              disabled={filteredCount === 0}
              className="flex flex-col items-center gap-2 rounded-xl border border-indigo-500 bg-indigo-500/10 p-5 text-indigo-500 transition-all hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChartLine size={32} />
              <span className="font-semibold">Fragen üben</span>
              <span className="text-xs opacity-80">{filteredCount} Fragen</span>
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

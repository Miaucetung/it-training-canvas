// ============================================================
// ExamPrepDialog — CCNA 200-301 Prüfungsvorbereitung
// ------------------------------------------------------------
// 3 Modi:
//   1) Lernmodus   — Frage für Frage, sofortiges Feedback + Erklärung
//   2) Prüfungsmodus — Timer 120 min, 100 Zufallsfragen, Ergebnis am Ende
//   3) Schwächen-Drill — Wiederholt falsch beantwortete Fragen
//
// Daten: src/data/ccnaQuestions.ts (1078 Original-Fragen aus dem
// CCNA 200-301 PDF, über ccna-exam-pool.ts adaptiert). Exhibits sind
// die in dieser Session gebauten strukturierten Objekte (CLI/Topologie/
// Tabelle) — kein PNG-Fallback mehr nötig.
// ============================================================

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  FireSimple,
  Gauge,
  ListChecks,
  Shuffle,
  Target,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EXAM_DIAGRAMS } from "@/lib/exam-diagrams";
import { getExamPrepQuestions, type PrepQuestion } from "@/lib/ccna-exam-pool";
import { hasExhibit, getExhibitList } from "@/lib/ccna-question-pool";
import { ExhibitRenderer } from "@/components/exhibits/ExhibitRenderer";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────
interface SessionResult {
  questionId: string;
  correct: boolean;
  userAnswer: string[];
  correctAnswer: string[];
}

type Mode = "menu" | "learn" | "exam" | "drill" | "results";
type Category = "all" | string;

interface Props {
  dark: boolean;
  onClose: () => void;
}

// ─── Constants ───────────────────────────────────────────────
const EXAM_TIME_SECONDS = 120 * 60; // 120 Minuten
const EXAM_QUESTIONS_COUNT = 100;
const PASS_THRESHOLD = 0.825; // 825/1000 Cisco Grenze
const STORAGE_KEY = "ccna-exam-weak-questions";

// ─── Helpers ─────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function answersEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

// ─── Sub-components ──────────────────────────────────────────
function CategoryBadge({ category }: { category: string; dark: boolean }) {
  const colors: Record<string, string> = {
    Routing: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    "Switching & VLANs": "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    Wireless: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
    "IPv4 & Subnetting": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    IPv6: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    "Security & Services": "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    "Architektur & Automation": "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300",
    "Geräte & Medien": "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    "Grundlagen & Sonstige": "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
  };
  const cls = colors[category] ?? colors["Grundlagen & Sonstige"];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{category}</span>;
}

// ─── Question Card ────────────────────────────────────────────
interface QuestionCardProps {
  question: PrepQuestion;
  userAnswer: string[];
  onToggle: (letter: string) => void;
  revealed: boolean;
  dark: boolean;
  index: number;
  total: number;
}

function QuestionCard({
  question,
  userAnswer,
  onToggle,
  revealed,
  dark,
  index,
  total,
}: QuestionCardProps) {
  const base = dark
    ? "bg-zinc-800 border-zinc-700 text-zinc-200"
    : "bg-white border-zinc-200 text-zinc-800";

  const correct = question.correctAnswer;
  const isMulti = question.type === "multi-select";

  function optionCls(letter: string): string {
    const selected = userAnswer.includes(letter);
    if (!revealed) {
      if (selected) {
        return dark
          ? "border-sky-500 bg-sky-900/40 text-sky-200"
          : "border-sky-500 bg-sky-50 text-sky-900";
      }
      return dark
        ? "border-zinc-600 bg-zinc-700/50 hover:border-zinc-400"
        : "border-zinc-200 bg-zinc-50 hover:border-zinc-400";
    }
    // revealed
    if (correct.includes(letter)) {
      return dark
        ? "border-green-500 bg-green-900/40 text-green-200"
        : "border-green-500 bg-green-50 text-green-900";
    }
    if (selected && !correct.includes(letter)) {
      return dark
        ? "border-red-500 bg-red-900/40 text-red-200"
        : "border-red-500 bg-red-50 text-red-900";
    }
    return dark ? "border-zinc-600 bg-zinc-700/50 opacity-60" : "border-zinc-200 bg-zinc-50 opacity-60";
  }

  const exhibitList = hasExhibit(question.exhibit) ? getExhibitList(question.exhibit) : [];

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${base}`}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 text-sm">
        <span className={dark ? "text-zinc-500" : "text-zinc-400"}>
          {index + 1}/{total}
        </span>
        <CategoryBadge category={question.category} dark={dark} />
        {isMulti && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            Wähle {correct.length}
          </span>
        )}
      </div>

      {/* Exhibit — strukturiert (CLI/Topologie/Tabelle) oder Platzhalter-Banner */}
      {hasExhibit(question.exhibit) && (
        exhibitList.length > 0 ? (
          <div className="mb-4 space-y-2">
            {exhibitList.map((ex, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl border ${dark ? "border-zinc-700" : "border-zinc-200"}`}
              >
                <ExhibitRenderer exhibit={ex} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`mb-4 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              dark ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <span aria-hidden>⚠️</span>
            <span>
              <strong>Topologie/Grafik wird nachgereicht.</strong> Diese Frage bezieht sich auf
              ein Exhibit, das noch nachgebaut wird — du kannst sie trotzdem anhand des Texts
              beantworten.
            </span>
          </div>
        )
      )}

      {/* Diagram — context visual for concept questions */}
      {question.diagramId && EXAM_DIAGRAMS[question.diagramId] && (
        <div
          className={`mb-4 overflow-hidden rounded-lg border ${dark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`}
          dangerouslySetInnerHTML={{ __html: EXAM_DIAGRAMS[question.diagramId] }}
        />
      )}

      {/* Question text */}
      <p className="mb-4 text-base leading-relaxed">{question.text}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.letter}
            disabled={revealed}
            onClick={() => onToggle(opt.letter)}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${optionCls(opt.letter)}`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold ${
                userAnswer.includes(opt.letter)
                  ? "bg-sky-500 text-white"
                  : dark
                  ? "bg-zinc-600 text-zinc-300"
                  : "bg-zinc-200 text-zinc-600"
              }`}
            >
              {opt.letter}
            </span>
            <span className="flex-1">{opt.text}</span>
            {revealed && correct.includes(opt.letter) && (
              <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
            )}
            {revealed && userAnswer.includes(opt.letter) && !correct.includes(opt.letter) && (
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Revealed feedback */}
      {revealed && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${
            answersEqual(userAnswer, correct)
              ? dark
                ? "bg-green-900/30 text-green-300"
                : "bg-green-50 text-green-700"
              : dark
              ? "bg-red-900/30 text-red-300"
              : "bg-red-50 text-red-700"
          }`}
        >
          {answersEqual(userAnswer, correct) ? (
            <span className="font-semibold">✓ Richtig!</span>
          ) : (
            <span>
              <span className="font-semibold">✗ Falsch.</span>{" "}
              Richtige Antwort: {correct.join(", ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────
interface ResultsProps {
  results: SessionResult[];
  questions: PrepQuestion[];
  dark: boolean;
  onRetry: () => void;
  onMenu: () => void;
  mode: "learn" | "exam" | "drill";
  elapsedSeconds?: number;
}

function ResultsScreen({ results, questions, dark, onRetry, onMenu, mode, elapsedSeconds }: ResultsProps) {
  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? correct / total : 0;
  const passed = pct >= PASS_THRESHOLD;
  const score = Math.round(pct * 1000);

  const byCategory = useMemo(() => {
    const map: Record<string, { c: number; t: number }> = {};
    const qMap = new Map(questions.map((q) => [q.id, q]));
    results.forEach((r) => {
      const cat = qMap.get(r.questionId)?.category ?? "Sonstige";
      if (!map[cat]) map[cat] = { c: 0, t: 0 };
      map[cat].t++;
      if (r.correct) map[cat].c++;
    });
    return map;
  }, [results, questions]);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Score circle */}
      <div
        className={`flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 ${
          passed ? "border-green-500" : "border-red-500"
        }`}
      >
        <span className={`text-3xl font-bold ${passed ? "text-green-500" : "text-red-500"}`}>
          {score}
        </span>
        <span className="text-xs text-zinc-500">/ 1000</span>
      </div>

      <div className="text-center">
        <div className={`text-2xl font-bold ${passed ? "text-green-500" : "text-red-500"}`}>
          {passed ? "Bestanden! 🎉" : "Nicht bestanden"}
        </div>
        <div className={dark ? "text-zinc-400" : "text-zinc-500"}>
          {correct} / {total} richtig ({Math.round(pct * 100)}%)
          {" · "}Cisco-Grenze: 825/1000
        </div>
        {mode === "exam" && elapsedSeconds != null && (
          <div className={`mt-1 text-sm ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
            Zeit: {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className={`h-3 w-full max-w-sm overflow-hidden rounded-full ${dark ? "bg-zinc-700" : "bg-zinc-200"}`}>
        <div
          className={`h-full rounded-full transition-all ${passed ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>

      {/* Domain breakdown — sorted worst first */}
      {Object.keys(byCategory).length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          <div className={`text-sm font-medium ${dark ? "text-zinc-300" : "text-zinc-600"}`}>
            Domain-Analyse
          </div>
          {Object.entries(byCategory)
            .sort(([, a], [, b]) => a.c / a.t - b.c / b.t)
            .map(([cat, { c, t }]) => (
              <div key={cat} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className={dark ? "text-zinc-300" : "text-zinc-700"}>{cat}</span>
                  <span className={dark ? "text-zinc-500" : "text-zinc-400"}>
                    {c}/{t} ({Math.round((c / t) * 100)}%)
                  </span>
                </div>
                <div className={`h-2 overflow-hidden rounded-full ${dark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                  <div
                    className={`h-full rounded-full ${c / t >= PASS_THRESHOLD ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${Math.round((c / t) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          <Shuffle size={16} />
          Nochmal
        </button>
        <button
          onClick={onMenu}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
            dark
              ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <ArrowLeft size={16} />
          Menü
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function ExamPrepDialog({ dark, onClose }: Props) {
  const questions = useMemo(() => getExamPrepQuestions(), []);

  const [mode, setMode] = useState<Mode>("menu");
  const [sessionMode, setSessionMode] = useState<"learn" | "exam" | "drill">("learn");
  const [sessionQ, setSessionQ] = useState<PrepQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<SessionResult[]>([]);
  const [weakIds, setWeakIds] = useState<Set<string>>(loadWeakIds);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [examFinished, setExamFinished] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer für Prüfungsmodus
  useEffect(() => {
    if (mode === "exam" && !examFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            finishExam();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, examFinished]);

  // Categories
  const categories = useMemo(() => {
    const cats = new Set(questions.map((q) => q.category));
    return ["all", ...Array.from(cats).sort()];
  }, [questions]);

  // Anzahl Fragen mit bereits gebauter (nicht-Platzhalter) Exhibit-Grafik
  const questionsWithGraphic = useMemo(
    () => questions.filter((q) => hasExhibit(q.exhibit) && getExhibitList(q.exhibit).length > 0).length,
    [questions],
  );

  const filteredPool = useMemo(() => {
    if (selectedCategory === "all") return questions;
    return questions.filter((q) => q.category === selectedCategory);
  }, [questions, selectedCategory]);

  function startLearn() {
    const pool = shuffle(filteredPool);
    setSessionQ(pool);
    setQIndex(0);
    setUserAnswers(new Map());
    setRevealed(new Set());
    setResults([]);
    setExamFinished(false);
    setSessionMode("learn");
    setMode("learn");
  }

  function startExam() {
    const pool = shuffle(filteredPool).slice(0, EXAM_QUESTIONS_COUNT);
    setSessionQ(pool);
    setQIndex(0);
    setUserAnswers(new Map());
    setRevealed(new Set());
    setResults([]);
    setTimeLeft(EXAM_TIME_SECONDS);
    setExamFinished(false);
    setSessionMode("exam");
    setMode("exam");
  }

  function startDrill() {
    const pool = shuffle(questions.filter((q) => weakIds.has(q.id)));
    if (pool.length === 0) {
      toast.warning("Noch keine Schwächefragen. Übe erst im Lernmodus.");
      return;
    }
    setSessionQ(pool);
    setQIndex(0);
    setUserAnswers(new Map());
    setRevealed(new Set());
    setResults([]);
    setExamFinished(false);
    setSessionMode("drill");
    setMode("drill");
  }

  function toggleAnswer(letter: string) {
    const q = sessionQ[qIndex];
    if (!q) return;
    setUserAnswers((prev) => {
      const next = new Map(prev);
      const cur = next.get(q.id) ?? [];
      if (q.type === "multi-select") {
        next.set(
          q.id,
          cur.includes(letter) ? cur.filter((l) => l !== letter) : [...cur, letter]
        );
      } else {
        next.set(q.id, [letter]);
      }
      return next;
    });
  }

  function revealAnswer() {
    const q = sessionQ[qIndex];
    if (!q) return;
    setRevealed((prev) => new Set([...prev, q.id]));

    const ua = userAnswers.get(q.id) ?? [];
    const ca = q.correctAnswer;
    const isCorrect = answersEqual(ua, ca);

    setResults((prev) => {
      if (prev.find((r) => r.questionId === q.id)) return prev;
      return [...prev, { questionId: q.id, correct: isCorrect, userAnswer: ua, correctAnswer: ca }];
    });
    if (!isCorrect) {
      setWeakIds((prev) => { const next = new Set(prev); next.add(q.id); saveWeakIds(next); return next; });
    } else {
      setWeakIds((prev) => { const next = new Set(prev); next.delete(q.id); saveWeakIds(next); return next; });
    }
  }

  function nextQuestion() {
    if (qIndex < sessionQ.length - 1) {
      setQIndex(qIndex + 1);
    } else {
      finishExam();
    }
  }

  function prevQuestion() {
    if (qIndex > 0) setQIndex(qIndex - 1);
  }

  function finishExam() {
    if (mode === "exam") {
      const finalResults: SessionResult[] = sessionQ.map((q) => {
        const existing = results.find((r) => r.questionId === q.id);
        if (existing) return existing;
        const ua = userAnswers.get(q.id) ?? [];
        const ca = q.correctAnswer;
        const isCorrect = answersEqual(ua, ca);
        return { questionId: q.id, correct: isCorrect, userAnswer: ua, correctAnswer: ca };
      });
      setResults(finalResults);
    }
    setExamFinished(true);
    setMode("results");
  }

  const bg = dark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900";
  const headerBg = dark ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200";
  const currentQ = sessionQ[qIndex];
  const currentAnswer = currentQ ? (userAnswers.get(currentQ.id) ?? []) : [];
  const isRevealed = currentQ ? revealed.has(currentQ.id) : false;
  const canReveal = !isRevealed && currentAnswer.length > 0;
  const progress = sessionQ.length > 0 ? (qIndex / sessionQ.length) * 100 : 0;
  const answeredCount = results.length;

  const isQuizScreen = (mode === "learn" || mode === "exam" || mode === "drill") && !!currentQ;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${bg}`}>
      {/* Header — shrink-0, immer sichtbar, kein Scrollen nötig um Titel/Timer/Schließen zu erreichen */}
      <div className={`shrink-0 flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4 ${headerBg}`}>
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Target size={22} className="text-sky-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold sm:text-lg">CCNA 200-301 Prüfungsvorbereitung</h2>
            {mode !== "menu" && mode !== "results" && (
              <p className={`truncate text-xs ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                {mode === "learn" && "Lernmodus"}
                {mode === "exam" && "Prüfungsmodus"}
                {mode === "drill" && "Schwächen-Drill"}
                {" · "}
                {sessionQ.length} Fragen
                {filteredPool.length !== questions.length && selectedCategory !== "all"
                  ? ` (${selectedCategory})`
                  : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {mode === "exam" && !examFinished && (
            <div
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold sm:px-3 sm:text-sm ${
                timeLeft < 600
                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                  : dark
                  ? "bg-zinc-700 text-zinc-200"
                  : "bg-zinc-200 text-zinc-700"
              }`}
            >
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${
              dark ? "hover:bg-zinc-700" : "hover:bg-zinc-200"
            }`}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Progress bar (non-menu modes) — shrink-0 */}
      {mode !== "menu" && mode !== "results" && (
        <div className={`h-1 shrink-0 ${dark ? "bg-zinc-700" : "bg-zinc-200"}`}>
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Scrollable content — nutzt die volle Bildschirmhöhe/-breite, Controls bleiben separat erreichbar */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
          {/* ── MENU ──────────────────────────────────────────── */}
          {mode === "menu" && (
            <div className="flex flex-col gap-6">
              {/* Stats */}
              <div
                className={`grid grid-cols-2 gap-3 rounded-xl p-4 sm:grid-cols-4 ${
                  dark ? "bg-zinc-800" : "bg-zinc-50"
                }`}
              >
                {[
                  { label: "Fragen gesamt", value: questions.length, icon: <ListChecks size={20} className="text-sky-500" /> },
                  {
                    label: "Mit Grafik",
                    value: questionsWithGraphic,
                    icon: <CheckCircle size={20} className="text-green-500" />,
                  },
                  {
                    label: "Schwächefragen",
                    value: weakIds.size,
                    icon: <FireSimple size={20} className="text-orange-500" />,
                  },
                  { label: "Kategorien", value: categories.length - 1, icon: <Gauge size={20} className="text-purple-500" /> },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                    {s.icon}
                    <span className="text-2xl font-bold">{s.value}</span>
                    <span className={`text-xs ${dark ? "text-zinc-500" : "text-zinc-500"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Category filter */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                  Kategorie filtern
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${
                    dark
                      ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                      : "border-zinc-300 bg-white text-zinc-900"
                  }`}
                >
                  <option value="all">Alle Kategorien ({filteredPool.length} Fragen)</option>
                  {categories
                    .filter((c) => c !== "all")
                    .map((c) => {
                      const cnt = questions.filter((q) => q.category === c).length;
                      return (
                        <option key={c} value={c}>
                          {c} ({cnt} Fragen)
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Mode buttons */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={startLearn}
                  disabled={filteredPool.length === 0}
                  className="flex flex-col items-center gap-2 rounded-xl border border-sky-500 bg-sky-500/10 p-5 text-sky-500 transition-all hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <BookOpen size={32} />
                  <span className="font-semibold">Lernmodus</span>
                  <span className="text-xs opacity-80">Sofortiges Feedback · Alle {filteredPool.length} Fragen</span>
                </button>

                <button
                  onClick={startExam}
                  disabled={filteredPool.length < 10}
                  className="flex flex-col items-center gap-2 rounded-xl border border-purple-500 bg-purple-500/10 p-5 text-purple-500 transition-all hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Clock size={32} />
                  <span className="font-semibold">Prüfungsmodus</span>
                  <span className="text-xs opacity-80">
                    120 min · {Math.min(EXAM_QUESTIONS_COUNT, filteredPool.length)} Fragen · Score
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
                  className={`text-xs ${dark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
                >
                  Schwächeliste zurücksetzen ({weakIds.size})
                </button>
              )}
            </div>
          )}

          {/* ── QUIZ (learn / exam / drill) ───────────────────── */}
          {isQuizScreen && currentQ && (
            <QuestionCard
              question={currentQ}
              userAnswer={currentAnswer}
              onToggle={toggleAnswer}
              revealed={isRevealed || examFinished}
              dark={dark}
              index={qIndex}
              total={sessionQ.length}
            />
          )}

          {/* ── RESULTS ──────────────────────────────────────── */}
          {mode === "results" && (
            <ResultsScreen
              results={results}
              questions={sessionQ}
              dark={dark}
              mode={sessionMode}
              elapsedSeconds={sessionMode === "exam" ? EXAM_TIME_SECONDS - timeLeft : undefined}
              onRetry={() => setMode("menu")}
              onMenu={() => setMode("menu")}
            />
          )}
        </div>
      </div>

      {/* Footer controls — shrink-0, immer ohne Scrollen erreichbar (wichtig auf Smartphone/Tablet) */}
      {isQuizScreen && (
        <div className={`shrink-0 border-t px-4 py-3 sm:px-6 ${headerBg}`}>
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prevQuestion}
                disabled={qIndex === 0}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  dark
                    ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <ArrowLeft size={16} /> Zurück
              </button>

              <div className="flex items-center gap-2">
                {mode !== "exam" && !isRevealed && (
                  <button
                    onClick={revealAnswer}
                    disabled={!canReveal}
                    className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                  >
                    <CheckCircle size={16} />
                    Prüfen
                  </button>
                )}
                {mode === "exam" && (
                  <span className={`text-sm ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
                    {answeredCount} / {sessionQ.length} beantwortet
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {qIndex < sessionQ.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                      dark
                        ? "border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                        : "border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    Weiter <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={finishExam}
                    className="flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    <Target size={16} /> Auswertung
                  </button>
                )}
              </div>
            </div>

            {/* Back to menu */}
            <button
              onClick={() => setMode("menu")}
              className={`self-center text-xs ${dark ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              ← Zum Menü
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

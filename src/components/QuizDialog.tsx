import { Question, Quiz, ScoreResult, ValidationResult } from "@/lib/types";
import { hasExhibit, getExhibitList, categorizeQuestion } from "@/lib/ccna-question-pool";
import { ExhibitRenderer } from "@/components/exhibits/ExhibitRenderer";
import {
  CheckCircle,
  Clock,
  Trophy,
  Warning,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface QuizDialogProps {
  quiz: Quiz;
  onComplete: (result: ScoreResult) => void;
  onClose: () => void;
  theme: "light" | "dark";
}

interface QuizState {
  currentIndex: number;
  answers: Record<string, string[]>;
  textAnswers: Record<string, string>;
  confirmedQuestions: Record<string, boolean>;
  startedAt: number;
  timeRemaining: number | null;
}

// Cisco-Bestehensgrenze: 825/1000 (≈82,5 %) — Referenz wie in der Prüfung.
const CISCO_PASS = 825;

export function QuizDialog({
  quiz,
  onComplete,
  onClose,
  theme,
}: QuizDialogProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const questions = useMemo(() => {
    if (quiz.shuffleQuestions) {
      return [...quiz.questions].sort(() => Math.random() - 0.5);
    }
    return quiz.questions;
  }, [quiz]);

  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    answers: {},
    textAnswers: {},
    confirmedQuestions: {},
    startedAt: Date.now(),
    timeRemaining: quiz.timeLimit || null,
  });

  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  // Timer
  useEffect(() => {
    if (state.timeRemaining === null || showResult) return;
    if (state.timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeRemaining:
          prev.timeRemaining !== null ? prev.timeRemaining - 1 : null,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.timeRemaining, showResult]);

  const currentQuestion = questions[state.currentIndex];

  const selectAnswer = useCallback(
    (questionId: string, answerId: string) => {
      // Don't allow changing answer after confirming
      setState((prev) => {
        if (prev.confirmedQuestions[questionId]) return prev;
        const q = questions.find((q) => q.id === questionId);
        if (!q) return prev;

        let newAnswers: string[];
        if (q.type === "single-choice" || q.type === "true-false") {
          newAnswers = [answerId];
        } else {
          const current = prev.answers[questionId] || [];
          if (current.includes(answerId)) {
            newAnswers = current.filter((id) => id !== answerId);
          } else {
            newAnswers = [...current, answerId];
          }
        }

        return {
          ...prev,
          answers: { ...prev.answers, [questionId]: newAnswers },
        };
      });
    },
    [questions],
  );

  const confirmAnswer = useCallback((questionId: string) => {
    setState((prev) => ({
      ...prev,
      confirmedQuestions: { ...prev.confirmedQuestions, [questionId]: true },
    }));
  }, []);

  const setTextAnswer = useCallback((questionId: string, text: string) => {
    setState((prev) => {
      if (prev.confirmedQuestions[questionId]) return prev;
      return {
        ...prev,
        textAnswers: { ...prev.textAnswers, [questionId]: text },
      };
    });
  }, []);

  const goToNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, questions.length - 1),
    }));
  }, [questions.length]);

  const goToPrev = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const unansweredCount = useMemo(() => {
    return questions.filter((q) => {
      if (q.type === "text-input") return !state.textAnswers[q.id]?.trim();
      return !state.answers[q.id]?.length;
    }).length;
  }, [questions, state.answers, state.textAnswers]);

  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);

  const handleSubmit = useCallback(() => {
    if (unansweredCount > 0 && !showUnansweredWarning) {
      setShowUnansweredWarning(true);
      return;
    }
    setShowUnansweredWarning(false);

    let totalPoints = 0;
    let maxPoints = 0;
    const results: ValidationResult[] = [];

    questions.forEach((q) => {
      maxPoints += q.points;
      const selectedIds = state.answers[q.id] || [];
      const textAnswer = state.textAnswers[q.id] || "";

      let passed = false;

      if (q.type === "text-input") {
        const correctAnswers = q.answers
          .filter((a) => a.isCorrect)
          .map((a) => a.text.toLowerCase().trim());
        passed = correctAnswers.includes(textAnswer.toLowerCase().trim());
      } else {
        const correctIds = q.answers
          .filter((a) => a.isCorrect)
          .map((a) => a.id);
        passed =
          selectedIds.length === correctIds.length &&
          selectedIds.every((id) => correctIds.includes(id));
      }

      if (passed) totalPoints += q.points;

      results.push({
        ruleId: q.id,
        passed,
        message: passed ? `Richtig: ${q.text}` : `Falsch: ${q.text}`,
        points: passed ? q.points : 0,
      });
    });

    const percentage =
      maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const scoreResult: ScoreResult = {
      totalPoints,
      maxPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
      results,
      completedAt: Date.now(),
    };

    setResult(scoreResult);
    setShowResult(true);
  }, [
    questions,
    state.answers,
    state.textAnswers,
    quiz.passingScore,
    unansweredCount,
    showUnansweredWarning,
  ]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Prüfungs-Auswertung: Score (1000er-Skala), Zeit, Domain-Analyse.
  const resultStats = useMemo(() => {
    if (!result) return null;
    const correct = result.results.filter((r) => r.passed).length;
    const total = result.results.length;
    const wrong = total - correct;
    const score = total > 0 ? Math.round((correct / total) * 1000) : 0;
    const elapsedSeconds = Math.max(
      0,
      Math.round((result.completedAt - state.startedAt) / 1000),
    );
    const byDomain: Record<string, { c: number; t: number }> = {};
    result.results.forEach((r, i) => {
      const cat = categorizeQuestion(questions[i]?.text ?? "");
      (byDomain[cat] ??= { c: 0, t: 0 }).t++;
      if (r.passed) byDomain[cat].c++;
    });
    return { correct, total, wrong, score, elapsedSeconds, byDomain };
  }, [result, questions, state.startedAt]);


  if (showResult && result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={`relative w-[550px] max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl ${bg} ${border} border shadow-2xl`}
        >
          <div className="p-8 text-center">
            {result.passed ? (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Trophy size={40} className="text-green-400" weight="fill" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Warning size={40} className="text-red-400" weight="fill" />
              </div>
            )}

            <h2 className={`text-2xl font-bold mb-2 ${text}`}>
              {result.passed ? "Bestanden!" : "Nicht bestanden"}
            </h2>
            <p className={`text-sm ${textMuted} mb-6`}>
              {result.passed
                ? "Gratulation! Du hast das Quiz erfolgreich bestanden."
                : `Du brauchst mindestens ${quiz.passingScore}% zum Bestehen.`}
            </p>

            {/* Score Display */}
            <div className={`p-6 rounded-xl ${cardBg} mb-6`}>
              <div
                className="text-5xl font-bold mb-2"
                style={{ color: result.passed ? "#10b981" : "#ef4444" }}
              >
                {result.percentage}%
              </div>
              <p className={`text-sm ${textMuted}`}>
                {result.totalPoints} / {result.maxPoints} Punkte
              </p>
              <div
                className={`h-2 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"} mt-4 overflow-hidden`}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${result.percentage}%`,
                    backgroundColor: result.passed ? "#10b981" : "#ef4444",
                  }}
                />
              </div>
            </div>

            {/* Prüfungs-Auswertung: Score (1000er-Skala) + Statistik + Domains */}
            {resultStats && (
              <>
                <div className={`p-4 rounded-xl ${cardBg} mb-4`}>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: resultStats.score >= CISCO_PASS ? "#10b981" : "#ef4444" }}
                    >
                      {resultStats.score}
                    </span>
                    <span className={`text-sm ${textMuted}`}>/ 1000</span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-0.5`}>
                    Cisco-Bestehensgrenze: 825 / 1000
                  </p>
                </div>

                {/* Statistik-Kacheln */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: "Richtig", value: String(resultStats.correct), color: "text-green-400" },
                    { label: "Falsch", value: String(resultStats.wrong), color: "text-red-400" },
                    { label: "Quote", value: `${result.percentage}%`, color: text },
                    { label: "Zeit", value: formatTime(resultStats.elapsedSeconds), color: text },
                  ].map((s) => (
                    <div key={s.label} className={`p-2.5 rounded-lg ${cardBg} text-center`}>
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className={`text-[10px] uppercase tracking-wide ${textMuted}`}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Domain-Analyse (schwächste zuerst) */}
                {Object.keys(resultStats.byDomain).length > 1 && (
                  <div className="text-left mb-6">
                    <div className={`text-xs font-semibold uppercase tracking-wide ${textMuted} mb-2`}>
                      Domain-Analyse
                    </div>
                    <div className="space-y-2">
                      {Object.entries(resultStats.byDomain)
                        .sort(([, a], [, b]) => a.c / a.t - b.c / b.t)
                        .map(([cat, { c, t }]) => {
                          const p = Math.round((c / t) * 100);
                          const ok = c / t >= CISCO_PASS / 1000;
                          return (
                            <div key={cat} className="space-y-0.5">
                              <div className="flex justify-between text-xs">
                                <span className={text}>{cat}</span>
                                <span className={textMuted}>
                                  {c}/{t} ({p}%)
                                </span>
                              </div>
                              <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                                <div
                                  className={`h-full rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`}
                                  style={{ width: `${p}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Question Results with explanation */}
            <div className="space-y-2 text-left mb-6">
              {result.results.map((r, i) => {
                const q = questions[i];
                return (
                  <div
                    key={r.ruleId}
                    className={`p-3 rounded-lg ${cardBg}`}
                  >
                    <div className="flex items-center gap-3">
                      {r.passed ? (
                        <CheckCircle size={20} className="text-green-400 shrink-0" weight="fill" />
                      ) : (
                        <XCircle size={20} className="text-red-400 shrink-0" weight="fill" />
                      )}
                      <span className={`flex-1 text-sm ${text}`}>
                        Frage {i + 1}: {q?.text}
                      </span>
                      <span className={`text-xs font-medium shrink-0 ${r.passed ? "text-green-400" : "text-red-400"}`}>
                        {r.points} / {q?.points || 0} Pkt
                      </span>
                    </div>
                    {!r.passed && q?.explanation && (
                      <p className={`mt-2 text-xs leading-relaxed ${textMuted} pl-8`}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onComplete(result)}
                className="px-6 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                Fertig
              </button>
              {!result.passed && (
                <button
                  onClick={() => {
                    setState({
                      currentIndex: 0,
                      answers: {},
                      textAnswers: {},
                      confirmedQuestions: {},
                      startedAt: Date.now(),
                      timeRemaining: quiz.timeLimit || null,
                    });
                    setShowResult(false);
                    setResult(null);
                  }}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"} transition-colors`}
                >
                  Nochmal versuchen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentConfirmed = currentQuestion
    ? !!state.confirmedQuestions[currentQuestion.id]
    : false;

  const hasCurrentAnswer = currentQuestion
    ? currentQuestion.type === "text-input"
      ? !!state.textAnswers[currentQuestion.id]?.trim()
      : !!(state.answers[currentQuestion.id]?.length)
    : false;

  const isLastQuestion = state.currentIndex === questions.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-[650px] max-w-[95vw] max-h-[90vh] rounded-2xl ${bg} ${border} border shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
          <div>
            <h2 className={`font-bold ${text}`}>{quiz.title}</h2>
            <p className={`text-xs ${textMuted}`}>
              Frage {state.currentIndex + 1} von {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {state.timeRemaining !== null && (
              <div className={`flex items-center gap-1.5 text-sm font-mono ${state.timeRemaining < 60 ? "text-red-400" : textMuted}`}>
                <Clock size={16} />
                {formatTime(state.timeRemaining)}
              </div>
            )}
            <button onClick={onClose} className={`p-2 rounded-lg hover:bg-slate-700/50 ${textMuted}`}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`h-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((state.currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedAnswers={state.answers[currentQuestion.id] || []}
              textAnswer={state.textAnswers[currentQuestion.id] || ""}
              onSelectAnswer={(answerId) => selectAnswer(currentQuestion.id, answerId)}
              onTextAnswer={(t) => setTextAnswer(currentQuestion.id, t)}
              isConfirmed={isCurrentConfirmed}
              isDark={isDark}
              text={text}
              textMuted={textMuted}
              cardBg={cardBg}
              border={border}
            />
          )}
        </div>

        {/* Navigation */}
        <div className={`flex items-center justify-between px-6 py-4 border-t ${border}`}>
          <button
            onClick={goToPrev}
            disabled={state.currentIndex === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30 ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"} transition-colors`}
          >
            Zurück
          </button>

          {/* Question dots — bei großen Pools (z. B. Fragenpool) durch Zähler ersetzen */}
          {questions.length > 40 ? (
            <span className={`text-xs font-medium ${textMuted}`}>
              Frage {state.currentIndex + 1} / {questions.length}
            </span>
          ) : (
          <div className="flex gap-1.5">
            {questions.map((q, i) => {
              const answered = !!(state.answers[q.id]?.length || state.textAnswers[q.id]);
              const confirmed = !!state.confirmedQuestions[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setState((prev) => ({ ...prev, currentIndex: i }))}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === state.currentIndex
                      ? "bg-indigo-500"
                      : confirmed
                        ? "bg-green-500/60"
                        : answered
                          ? "bg-amber-500/50"
                          : isDark
                            ? "bg-slate-700"
                            : "bg-slate-300"
                  }`}
                />
              );
            })}
          </div>
          )}

          <div className="flex gap-2 items-center">
            {/* Confirm button — shown when answer selected but not yet confirmed */}
            {hasCurrentAnswer && !isCurrentConfirmed && (
              <button
                onClick={() => confirmAnswer(currentQuestion.id)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
              >
                Prüfen
              </button>
            )}

            {/* Next / Submit — shown after confirming */}
            {isCurrentConfirmed && (
              isLastQuestion ? (
                <div className="flex flex-col items-end gap-1">
                  {showUnansweredWarning && (
                    <span className="text-xs text-amber-400">
                      {unansweredCount} Frage{unansweredCount > 1 ? "n" : ""} unbeantwortet — trotzdem abgeben?
                    </span>
                  )}
                  <button
                    onClick={handleSubmit}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                      showUnansweredWarning ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {showUnansweredWarning ? "Trotzdem abgeben" : "Abgeben"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={goToNext}
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Weiter
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  selectedAnswers,
  textAnswer,
  onSelectAnswer,
  onTextAnswer,
  isConfirmed,
  isDark,
  text,
  textMuted,
  cardBg,
  border,
}: {
  question: Question;
  selectedAnswers: string[];
  textAnswer: string;
  onSelectAnswer: (answerId: string) => void;
  onTextAnswer: (text: string) => void;
  isConfirmed: boolean;
  isDark: boolean;
  text: string;
  textMuted: string;
  cardBg: string;
  border: string;
}) {
  const inputBg = isDark ? "bg-slate-800" : "bg-slate-50";

  const getAnswerStyle = (answerId: string, isCorrect: boolean) => {
    if (!isConfirmed) {
      const isSelected = selectedAnswers.includes(answerId);
      return isSelected
        ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300"
        : `${cardBg} ${border} ${text} hover:border-indigo-500/30`;
    }
    // After confirmation: show correct/incorrect
    const isSelected = selectedAnswers.includes(answerId);
    if (isCorrect && isSelected) return "bg-green-500/15 border-green-500/60 text-green-300";
    if (isCorrect && !isSelected) return "bg-green-500/10 border-green-500/40 text-green-400"; // show missed correct
    if (!isCorrect && isSelected) return "bg-red-500/15 border-red-500/60 text-red-300";
    return `${cardBg} ${border} ${isDark ? "text-slate-500" : "text-slate-400"} opacity-60`;
  };

  const getAnswerIcon = (answerId: string, isCorrect: boolean) => {
    if (!isConfirmed) return null;
    const isSelected = selectedAnswers.includes(answerId);
    if (isCorrect) return <CheckCircle size={18} className="text-green-400 shrink-0" weight="fill" />;
    if (isSelected && !isCorrect) return <XCircle size={18} className="text-red-400 shrink-0" weight="fill" />;
    return null;
  };

  // Check if the confirmed answer was correct
  const isAnswerCorrect = isConfirmed && (() => {
    if (question.type === "text-input") {
      const correctAnswers = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.text.toLowerCase().trim());
      return correctAnswers.includes(textAnswer.toLowerCase().trim());
    }
    const correctIds = question.answers.filter((a) => a.isCorrect).map((a) => a.id);
    return (
      selectedAnswers.length === correctIds.length &&
      selectedAnswers.every((id) => correctIds.includes(id))
    );
  })();

  return (
    <div className="space-y-4">
      {/* Points badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${cardBg} ${textMuted}`}>
          {question.type === "single-choice" && "Einfachauswahl"}
          {question.type === "multiple-choice" && "Mehrfachauswahl"}
          {question.type === "text-input" && "Texteingabe"}
          {question.type === "true-false" && "Wahr/Falsch"}
          {question.type === "drag-drop" && "Zuordnung"}
        </span>
        <span className={`text-xs font-medium ${textMuted}`}>
          {/^q\d+$/.test(question.id) && (
            <span className="font-mono mr-2 opacity-70">{question.id}</span>
          )}
          {question.points} Punkte
        </span>
      </div>

      {/* Exhibit: gerendert wenn strukturiert, sonst Platzhalter-Banner */}
      {hasExhibit(question.exhibit) && !question.imageUrl && (
        getExhibitList(question.exhibit).length > 0 ? (
          <div className="space-y-2">
            {getExhibitList(question.exhibit).map((ex, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <ExhibitRenderer exhibit={ex} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`rounded-lg border px-3 py-2 text-sm flex items-start gap-2 ${
              isDark
                ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <span aria-hidden>⚠️</span>
            <span>
              <strong>Topologie/Grafik wird nachgereicht.</strong> Diese Frage bezieht
              sich auf ein Exhibit, das noch nachgebaut wird — du kannst sie trotzdem
              anhand des Texts beantworten.
            </span>
          </div>
        )
      )}

      {/* Question text */}
      <h3 className={`text-lg font-semibold ${text}`}>{question.text}</h3>

      {/* Answers */}
      {question.type === "text-input" ? (
        <input
          type="text"
          value={textAnswer}
          onChange={(e) => onTextAnswer(e.target.value)}
          disabled={isConfirmed}
          placeholder="Deine Antwort eingeben..."
          className={`w-full px-4 py-3 rounded-xl ${inputBg} ${text} border ${border} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-70`}
        />
      ) : (
        <div className="space-y-2">
          {question.answers.map((answer) => {
            const isMulti = question.type === "multiple-choice";
            const isSelected = selectedAnswers.includes(answer.id);

            return (
              <button
                key={answer.id}
                onClick={() => !isConfirmed && onSelectAnswer(answer.id)}
                disabled={isConfirmed}
                className={`w-full text-left p-4 rounded-xl border transition-all ${getAnswerStyle(answer.id, answer.isCorrect)} disabled:cursor-default`}
              >
                <div className="flex items-center gap-3">
                  {isConfirmed ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      {getAnswerIcon(answer.id, answer.isCorrect)}
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-${isMulti ? "md" : "full"} border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500"
                          : isDark
                            ? "border-slate-600"
                            : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" className="text-white">
                          <path
                            d="M2 6L5 9L10 3"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                  <span className="text-sm">{answer.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation — shown after confirmation */}
      {isConfirmed && question.explanation && (
        <div
          className={`mt-2 p-4 rounded-xl border-l-4 ${
            isAnswerCorrect
              ? "bg-green-500/10 border-green-500"
              : "bg-red-500/10 border-red-500"
          }`}
        >
          <p className={`text-xs font-semibold mb-1 ${isAnswerCorrect ? "text-green-400" : "text-red-400"}`}>
            {isAnswerCorrect ? "✓ Richtig!" : "✗ Leider falsch"}
          </p>
          <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}


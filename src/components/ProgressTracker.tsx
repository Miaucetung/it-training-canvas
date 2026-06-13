import {
  CanvasConnection,
  DrawingObject,
  LearningPath,
  LearningStep,
  Quiz,
  ScoreResult,
  UserProgress,
} from "@/lib/types";
import { validateStep } from "@/lib/validation-engine";
import {
  ArrowRight,
  BookOpen,
  CaretDown,
  CaretRight,
  CheckCircle,
  Clock,
  Lightning,
  Medal,
  Play,
  Question,
  Trophy,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HintPanel } from "./HintPanel";
import { QuizDialog } from "./QuizDialog";

interface ProgressTrackerProps {
  path: LearningPath;
  progress: UserProgress;
  quizzes: Record<string, Quiz>;
  objects: DrawingObject[];
  connections: CanvasConnection[];
  onUpdateProgress: (progress: UserProgress) => void;
  onClose: () => void;
  theme: "light" | "dark";
}

export function ProgressTracker({
  path,
  progress,
  quizzes,
  objects,
  connections,
  onUpdateProgress,
  onClose,
  theme,
}: ProgressTrackerProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const [showHints, setShowHints] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [expandedStep, setExpandedStep] = useState<number>(
    progress.currentStepIndex,
  );
  // Letztes Prüfergebnis (für sichtbares Feedback nach "Überprüfen")
  const [lastValidation, setLastValidation] = useState<ScoreResult | null>(null);

  const currentStep = path.steps[progress.currentStepIndex];
  const completedCount = progress.completedSteps.length;
  const totalSteps = path.steps.length;
  const overallProgress = Math.round((completedCount / totalSteps) * 100);

  // Time tracking — Ref hält den aktuellen Fortschritt, damit der Sekunden-
  // Timer nicht mit einer veralteten Closure einen Schritt-Fortschritt
  // überschreibt (sonst springt currentStepIndex jede Sekunde zurück).
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    const interval = setInterval(() => {
      const p = progressRef.current;
      onUpdateProgress({
        ...p,
        totalTimeSpent: p.totalTimeSpent + 1,
        lastActivityAt: Date.now(),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onUpdateProgress]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleValidateStep = useCallback(() => {
    if (!currentStep) return;

    const result = validateStep(currentStep, objects, connections);
    setLastValidation(result);

    if (result.passed) {
      toast.success(
        `Schritt bestanden — ${result.percentage}% (${result.totalPoints} Punkte)`,
      );
    } else {
      const offen = result.results.filter((r) => !r.passed).length;
      toast.error(
        `Noch nicht erfüllt (${result.percentage}%). ${offen} Anforderung${offen === 1 ? "" : "en"} offen — siehe Checkliste.`,
      );
    }

    if (result.passed) {
      const newCompletedSteps = [
        ...new Set([...progress.completedSteps, currentStep.id]),
      ];
      const nextIndex = Math.min(progress.currentStepIndex + 1, totalSteps - 1);

      // Calculate hint deductions for this step
      const usedHints = progress.hintsUsed[currentStep.id] || [];
      const hintDeduction = usedHints.reduce((sum, hintId) => {
        const hint = currentStep.hints.find((h) => h.id === hintId);
        return sum + (hint?.pointsDeduction || 0);
      }, 0);
      const adjustedPoints = Math.max(0, result.totalPoints - hintDeduction);

      onUpdateProgress({
        ...progress,
        currentStepIndex: nextIndex,
        completedSteps: newCompletedSteps,
        overallScore: progress.overallScore + adjustedPoints,
        lastActivityAt: Date.now(),
      });

      setExpandedStep(nextIndex);
      setLastValidation(null);
    }

    return result;
  }, [
    currentStep,
    objects,
    connections,
    progress,
    totalSteps,
    onUpdateProgress,
  ]);

  const handleQuizComplete = useCallback(
    (result: ScoreResult) => {
      if (!currentStep?.quizId) return;

      const newQuizScores = {
        ...progress.quizScores,
        [currentStep.quizId]: result,
      };

      if (result.passed) {
        const newCompletedSteps = [
          ...new Set([...progress.completedSteps, currentStep.id]),
        ];
        const nextIndex = Math.min(
          progress.currentStepIndex + 1,
          totalSteps - 1,
        );

        onUpdateProgress({
          ...progress,
          currentStepIndex: nextIndex,
          completedSteps: newCompletedSteps,
          quizScores: newQuizScores,
          overallScore: progress.overallScore + result.totalPoints,
          lastActivityAt: Date.now(),
        });

        setExpandedStep(nextIndex);
      } else {
        onUpdateProgress({
          ...progress,
          quizScores: newQuizScores,
          lastActivityAt: Date.now(),
        });
      }

      setActiveQuiz(null);
    },
    [currentStep, progress, totalSteps, onUpdateProgress],
  );

  const handleUseHint = useCallback(
    (hintId: string) => {
      if (!currentStep) return;
      const stepHints = progress.hintsUsed[currentStep.id] || [];
      if (stepHints.includes(hintId)) return;

      onUpdateProgress({
        ...progress,
        hintsUsed: {
          ...progress.hintsUsed,
          [currentStep.id]: [...stepHints, hintId],
        },
        lastActivityAt: Date.now(),
      });
    },
    [currentStep, progress, onUpdateProgress],
  );

  const handleGoToStep = useCallback(
    (index: number) => {
      // Can only go to completed steps or the next uncompleted step
      const step = path.steps[index];
      if (!step) return;
      if (
        progress.completedSteps.includes(step.id) ||
        index === progress.currentStepIndex
      ) {
        onUpdateProgress({
          ...progress,
          currentStepIndex: index,
          lastActivityAt: Date.now(),
        });
        setExpandedStep(index);
      }
    },
    [path.steps, progress, onUpdateProgress],
  );

  const isPathComplete = completedCount === totalSteps;

  const STEP_TYPE_ICONS: Record<LearningStep["type"], React.ReactNode> = {
    info: <BookOpen size={14} />,
    task: <Play size={14} />,
    quiz: <Question size={14} />,
    checkpoint: <CheckCircle size={14} />,
  };

  return (
    <>
      <div
        className={`fixed right-0 top-0 bottom-0 w-[380px] max-w-[95vw] z-40 ${bg} ${border} border-l shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b ${border}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Medal size={20} className="text-indigo-400" weight="fill" />
              <h3 className={`font-bold ${text}`}>Lernpfad</h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${textMuted} hover:bg-slate-700/30`}
            >
              <X size={18} />
            </button>
          </div>

          <h4 className={`text-sm font-semibold ${text} mb-1`}>{path.title}</h4>
          <p className={`text-xs ${textMuted} mb-3`}>{path.description}</p>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={textMuted}>
                Fortschritt: {completedCount}/{totalSteps} Schritte
              </span>
              <span className="text-indigo-400 font-medium">
                {overallProgress}%
              </span>
            </div>
            <div
              className={`h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"} overflow-hidden`}
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1 ${textMuted}`}>
                <Clock size={12} />
                {formatTime(progress.totalTimeSpent)}
              </span>
              <span className={`flex items-center gap-1 ${textMuted}`}>
                <Trophy size={12} />
                {progress.overallScore} Punkte
              </span>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto">
          {path.steps.map((step, index) => {
            const isCompleted = progress.completedSteps.includes(step.id);
            const isCurrent = index === progress.currentStepIndex;
            const isExpanded = index === expandedStep;
            const isAccessible = isCompleted || isCurrent;

            return (
              <div key={step.id} className={`border-b ${border}`}>
                {/* Step Header */}
                <button
                  onClick={() => {
                    setExpandedStep(isExpanded ? -1 : index);
                    if (isAccessible) handleGoToStep(index);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                    isCurrent
                      ? isDark
                        ? "bg-indigo-500/10"
                        : "bg-indigo-50"
                      : "hover:bg-slate-800/30"
                  }`}
                >
                  {/* Status Indicator */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-green-500/20"
                        : isCurrent
                          ? "bg-indigo-500/20"
                          : isDark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle
                        size={16}
                        className="text-green-400"
                        weight="fill"
                      />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    ) : (
                      <span className={`text-xs ${textMuted}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          isCompleted
                            ? "text-green-400"
                            : isCurrent
                              ? "text-indigo-300"
                              : textMuted
                        }
                      >
                        {STEP_TYPE_ICONS[step.type]}
                      </span>
                      <span
                        className={`text-sm font-medium truncate ${
                          isCompleted
                            ? "text-green-400 line-through"
                            : isCurrent
                              ? text
                              : textMuted
                        }`}
                      >
                        {step.title || `Schritt ${index + 1}`}
                      </span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <CaretDown size={14} className={textMuted} />
                  ) : (
                    <CaretRight size={14} className={textMuted} />
                  )}
                </button>

                {/* Step Details (expanded) */}
                {isExpanded && (
                  <div className={`px-5 pb-4 pl-[60px] space-y-3`}>
                    <p className={`text-xs ${textMuted} leading-relaxed`}>
                      {step.description}
                    </p>

                    {/* Action Buttons */}
                    {isCurrent && !isCompleted && (
                      <div className="flex gap-2 flex-wrap">
                        {step.type === "quiz" &&
                          step.quizId &&
                          quizzes[step.quizId] && (
                            <button
                              onClick={() =>
                                setActiveQuiz(quizzes[step.quizId!])
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors"
                            >
                              <Question size={14} /> Quiz starten
                            </button>
                          )}

                        {(step.type === "task" ||
                          step.type === "checkpoint") && (
                          <button
                            onClick={handleValidateStep}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle size={14} /> Überprüfen
                          </button>
                        )}

                        {step.type === "info" && (
                          <button
                            onClick={() => {
                              const newCompleted = [
                                ...new Set([
                                  ...progress.completedSteps,
                                  step.id,
                                ]),
                              ];
                              const nextIdx = Math.min(
                                index + 1,
                                totalSteps - 1,
                              );
                              onUpdateProgress({
                                ...progress,
                                currentStepIndex: nextIdx,
                                completedSteps: newCompleted,
                                lastActivityAt: Date.now(),
                              });
                              setExpandedStep(nextIdx);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors"
                          >
                            <ArrowRight size={14} /> Verstanden
                          </button>
                        )}

                        {step.hints.length > 0 && (
                          <button
                            onClick={() => setShowHints(!showHints)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              showHints
                                ? "bg-amber-500/20 text-amber-300"
                                : `${cardBg} ${textMuted} hover:text-amber-300`
                            }`}
                          >
                            <Lightning size={14} />
                            Hinweise (
                            {(progress.hintsUsed[step.id] || []).length}/
                            {step.hints.length})
                          </button>
                        )}
                      </div>
                    )}

                    {/* Anforderungs-Checkliste für Aufgaben/Checkpoints */}
                    {isCurrent &&
                      !isCompleted &&
                      (step.type === "task" || step.type === "checkpoint") &&
                      (step.validationRules?.length ?? 0) > 0 && (
                        <div className={`p-3 rounded-lg ${cardBg} space-y-1.5`}>
                          <p className={`text-[11px] font-semibold ${textMuted} uppercase tracking-wider`}>
                            Anforderungen (auf dem Canvas)
                          </p>
                          {step.validationRules!.map((rule) => {
                            const res = lastValidation?.results.find(
                              (r) => r.ruleId === rule.id,
                            );
                            const state = !lastValidation
                              ? "pending"
                              : res?.passed
                                ? "passed"
                                : "failed";
                            return (
                              <div
                                key={rule.id}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span className="mt-0.5">
                                  {state === "passed" ? (
                                    <CheckCircle
                                      size={13}
                                      weight="fill"
                                      className="text-green-400"
                                    />
                                  ) : state === "failed" ? (
                                    <X size={13} className="text-red-400" />
                                  ) : (
                                    <CaretRight
                                      size={13}
                                      className={textMuted}
                                    />
                                  )}
                                </span>
                                <span
                                  className={
                                    state === "passed"
                                      ? "text-green-400"
                                      : state === "failed"
                                        ? "text-red-300"
                                        : textMuted
                                  }
                                >
                                  {rule.description}
                                  <span className={`ml-1 ${textMuted}`}>
                                    ({rule.points} Pkt)
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                          <p className={`text-[11px] ${textMuted} pt-1`}>
                            Tipp: Über „Canvas" oben rechts umschalten, Geräte
                            platzieren & per Doppelklick konfigurieren, dann
                            erneut „Überprüfen".
                          </p>
                        </div>
                      )}

                    {/* Hint Panel */}
                    {isCurrent && showHints && step.hints.length > 0 && (
                      <HintPanel
                        hints={step.hints}
                        usedHintIds={progress.hintsUsed[step.id] || []}
                        onUseHint={handleUseHint}
                        onClose={() => setShowHints(false)}
                        theme={theme}
                      />
                    )}

                    {/* Quiz Score (if completed) */}
                    {step.quizId && progress.quizScores[step.quizId] && (
                      <div
                        className={`flex items-center gap-2 p-2 rounded-lg ${cardBg} text-xs`}
                      >
                        <Trophy size={14} className="text-amber-400" />
                        <span className={textMuted}>Quiz-Ergebnis:</span>
                        <span
                          className={`font-medium ${
                            progress.quizScores[step.quizId].passed
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {progress.quizScores[step.quizId].percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer - Completion */}
        {isPathComplete && (
          <div className={`px-5 py-4 border-t ${border} text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy size={24} className="text-amber-400" weight="fill" />
              <span className={`text-lg font-bold ${text}`}>
                Lernpfad abgeschlossen!
              </span>
            </div>
            <p className={`text-xs ${textMuted} mb-3`}>
              Gesamt: {progress.overallScore} Punkte in{" "}
              {formatTime(progress.totalTimeSpent)}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Fertig
            </button>
          </div>
        )}
      </div>

      {/* Quiz Dialog */}
      {activeQuiz && (
        <QuizDialog
          quiz={activeQuiz}
          onComplete={handleQuizComplete}
          onClose={() => setActiveQuiz(null)}
          theme={theme}
        />
      )}
    </>
  );
}

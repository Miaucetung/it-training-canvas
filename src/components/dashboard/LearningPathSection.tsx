import { useState } from "react";
import { CaretDown, CaretUp, CheckCircle, Circle, CircleHalf } from "@phosphor-icons/react";
import { TOOL_LABELS, getStep, type LearningStep } from "@/lib/learning-path-config";
import { evaluateStep, stepStatusLabel, type StepEvaluation, type StepStatus } from "@/lib/learning-path-logic";
import type { EffectiveProgress } from "@/lib/learning-progress";
import type { ToolId } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { LabInfo } from "@/lib/lab-infos";
import type { NextStepLookups } from "./NextStepCard";

export type PathLabInfo = LabInfo;

interface LearningPathSectionProps {
  steps: LearningStep[];
  progress: EffectiveProgress;
  completedLabs: ReadonlySet<string>;
  labs: Record<string, PathLabInfo>;
  lookups: NextStepLookups;
  /** Schritt, der zuerst aufgeklappt ist (z. B. der empfohlene) */
  initialOpenStepId?: string;
  onOpenLesson: (topicId: string, anchor?: string) => void;
  onStartQuiz: (quizId: string) => void;
  onOpenLab: (labId: string) => void;
  onLaunchTool: (toolId: ToolId) => void;
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "abgeschlossen") return <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" weight="fill" aria-hidden />;
  if (status === "begonnen") return <CircleHalf className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" weight="fill" aria-hidden />;
  return <Circle className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />;
}

const itemButton =
  "text-left text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded";

function StepPanel({ ev, lookups, labs, progress, onOpenLesson, onStartQuiz, onOpenLab, onLaunchTool }: {
  ev: StepEvaluation;
  lookups: NextStepLookups;
  labs: Record<string, PathLabInfo>;
  progress: EffectiveProgress;
} & Pick<LearningPathSectionProps, "onOpenLesson" | "onStartQuiz" | "onOpenLab" | "onLaunchTool">) {
  const { step } = ev;
  const prereq = step.prerequisiteStepIds.map((id) => getStep(id)).filter((s): s is LearningStep => !!s);
  return (
    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/60">
      <p className="text-sm text-muted-foreground leading-relaxed">{step.summary}</p>
      {prereq.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Baut auf:</span> {prereq.map((p) => `Schritt ${p.number} ${p.title}`).join("; ")}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">1 · Verstehen</h3>
          <ul className="space-y-1.5">
            {ev.lessons.map(({ lesson, status }) => (
              <li key={`${lesson.topicId}-${lesson.anchor ?? ""}`} className="flex flex-col">
                <button type="button" className={itemButton} onClick={() => onOpenLesson(lesson.topicId, lesson.anchor)}>
                  Lektion: {lookups.topicTitle(lesson.topicId)}
                </button>
                <span className="text-xs text-muted-foreground">
                  {status === "gelesen" ? "gelesen" : status === "begonnen" ? "begonnen" : "offen"}
                  {lookups.topicMinutes(lesson.topicId) ? ` · ${lookups.topicMinutes(lesson.topicId)} Min.` : ""}
                  {lesson.anchor ? " · öffnet an der passenden Stelle" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">2 · Üben</h3>
          {ev.quizzes.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keine Übungsfragen vorhanden.</p>
          ) : (
            <ul className="space-y-1.5">
              {ev.quizzes.map((q) => (
                <li key={q.quizId} className="flex flex-col">
                  <button type="button" className={itemButton} onClick={() => onStartQuiz(q.quizId)}>
                    {lookups.quizTitle(q.quizId)}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {lookups.quizQuestionCount(q.quizId) ? `${lookups.quizQuestionCount(q.quizId)} Fragen · ` : ""}
                    {q.done ? (q.resultKnown ? `bearbeitet · bestes Ergebnis ${q.bestPercent} %` : "bearbeitet (Ergebnis nicht gespeichert)") : "noch nicht bearbeitet"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {step.toolIds.filter((t) => /drill|quiz|cheatsheet|table|trainer|glossary|calculator/.test(t)).length > 0 && (
            <ul className="mt-2 space-y-1">
              {step.toolIds
                .filter((t) => /drill|quiz|cheatsheet|table|trainer|glossary|calculator/.test(t))
                .map((t) => (
                  <li key={t}>
                    <button type="button" className={itemButton} onClick={() => onLaunchTool(t)}>
                      {TOOL_LABELS[t]}
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">3 · Anwenden</h3>
          {ev.labs.length === 0 && step.toolIds.filter((t) => /simulator|explorer/.test(t)).length === 0 ? (
            <p className="text-xs text-muted-foreground">Für diesen Schritt gibt es kein Lab und keinen Simulator.</p>
          ) : null}
          <ul className="space-y-1.5">
            {step.toolIds
              .filter((t) => /simulator|explorer/.test(t))
              .map((t) => (
                <li key={t}>
                  <button type="button" className={itemButton} onClick={() => onLaunchTool(t)}>
                    {TOOL_LABELS[t]}
                  </button>
                </li>
              ))}
            {ev.labs.map(({ labId, done }) => (
              <li key={labId} className="flex flex-col">
                <button type="button" className={itemButton} onClick={() => onOpenLab(labId)}>
                  Lab: {labs[labId]?.title ?? labId}
                </button>
                <span className="text-xs text-muted-foreground">
                  {done ? "erledigt" : "offen"}
                  {labs[labId]?.duration ? ` · ${labs[labId].duration}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {progress.openedTopicIds.size === 0 && ev.step.number === 1 && (
        <p className="text-xs text-muted-foreground">Noch kein Fortschritt: Beginne mit der Lektion unter „Verstehen“.</p>
      )}
    </div>
  );
}

/** Lernpfad: Schritte mit Status und dem Dreiklang Verstehen → Üben → Anwenden. */
export function LearningPathSection({
  steps,
  progress,
  completedLabs,
  labs,
  lookups,
  initialOpenStepId,
  onOpenLesson,
  onStartQuiz,
  onOpenLab,
  onLaunchTool,
}: LearningPathSectionProps) {
  const [openId, setOpenId] = useState<string | null>(initialOpenStepId ?? null);
  const evals = steps.map((s) => evaluateStep(s, progress, completedLabs));
  const done = evals.filter((e) => e.status === "abgeschlossen").length;

  return (
    <section aria-label="Lernpfad" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
        <div>
          <h2 className="text-lg font-bold text-foreground font-sans">Dein Lernpfad</h2>
          <p className="text-xs text-muted-foreground">
            {steps.length} Schritte, geordnet nach Voraussetzungen. Jeder Schritt: Verstehen → Üben → Anwenden.
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {done} von {steps.length} Schritten abgeschlossen
        </span>
      </div>
      <ol className="space-y-2">
        {evals.map((ev) => {
          const open = openId === ev.step.id;
          return (
            <li key={ev.step.id} className={cn("rounded-lg border bg-surface transition-colors", open ? "border-primary/50" : "border-border")}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`pfad-${ev.step.id}`}
                onClick={() => setOpenId(open ? null : ev.step.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              >
                <StatusIcon status={ev.status} />
                <span className="font-mono text-xs text-muted-foreground w-[4.5rem] shrink-0 whitespace-nowrap">Schritt {ev.step.number}</span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-foreground">{ev.step.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                  {stepStatusLabel(ev.status)} · {ev.requiredDone}/{ev.requiredTotal}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 sm:hidden">{stepStatusLabel(ev.status)}</span>
                {open ? <CaretUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <CaretDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {open && (
                <div id={`pfad-${ev.step.id}`}>
                  <StepPanel ev={ev} lookups={lookups} labs={labs} progress={progress} onOpenLesson={onOpenLesson} onStartQuiz={onStartQuiz} onOpenLab={onOpenLab} onLaunchTool={onLaunchTool} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import type { EffectiveProgress } from "@/lib/learning-progress";
import type { LearningStep, PathLesson } from "@/lib/learning-path-config";

export type StepStatus = "offen" | "begonnen" | "abgeschlossen";
export type LessonStatus = "offen" | "begonnen" | "gelesen";

export interface StepEvaluation {
  step: LearningStep;
  lessons: Array<{ lesson: PathLesson; status: LessonStatus }>;
  quizzes: Array<{ quizId: string; done: boolean; attempts: number; bestPercent?: number; lastPercent?: number; resultKnown: boolean }>;
  labs: Array<{ labId: string; done: boolean }>;
  status: StepStatus;
  /** Pflichtbestandteile (Lektionen + Quizzes), davon erledigt */
  requiredDone: number;
  requiredTotal: number;
}

export function lessonStatus(topicId: string, progress: EffectiveProgress): LessonStatus {
  if (progress.readTopicIds.has(topicId)) return "gelesen";
  if (progress.openedTopicIds.has(topicId)) return "begonnen";
  return "offen";
}

/**
 * Status eines Schritts aus echten Daten: abgeschlossen = alle Lektionen gelesen und alle Quizzes einmal vollständig durchlaufen
 * (ohne Mindestquote). Labs zählen nicht als Pflicht, werden aber angezeigt.
 */
export function evaluateStep(step: LearningStep, progress: EffectiveProgress, completedLabs: ReadonlySet<string>): StepEvaluation {
  const lessons = step.lessons.map((lesson) => ({ lesson, status: lessonStatus(lesson.topicId, progress) }));
  const quizzes = step.quizIds.map((quizId) => {
    const q = progress.quizzes[quizId];
    return {
      quizId,
      done: !!q && q.attempts > 0,
      attempts: q?.attempts ?? 0,
      bestPercent: q?.bestPercent,
      lastPercent: q?.lastPercent,
      resultKnown: !!q && q.bestPercent !== undefined,
    };
  });
  const labs = step.labIds.map((labId) => ({ labId, done: completedLabs.has(labId) }));
  const requiredTotal = lessons.length + quizzes.length;
  const requiredDone = lessons.filter((l) => l.status === "gelesen").length + quizzes.filter((q) => q.done).length;
  const anyStarted = lessons.some((l) => l.status !== "offen") || quizzes.some((q) => q.done) || labs.some((l) => l.done);
  const status: StepStatus = requiredTotal > 0 && requiredDone === requiredTotal ? "abgeschlossen" : anyStarted ? "begonnen" : "offen";
  return { step, lessons, quizzes, labs, status, requiredDone, requiredTotal };
}

export type NextAction =
  | { kind: "lesson"; evaluation: StepEvaluation; lesson: PathLesson; firstVisit: boolean; prerequisitesMissing: string[] }
  | { kind: "quiz"; evaluation: StepEvaluation; quizId: string; prerequisitesMissing: string[] }
  | { kind: "lab"; evaluation: StepEvaluation; labId: string }
  | { kind: "done" };

/**
 * Genau eine Empfehlung, nur aus echten Daten:
 * 1. erster nicht abgeschlossener Schritt, dessen Voraussetzungen abgeschlossen sind (sonst der erste nicht abgeschlossene);
 *    darin die erste ungelesene Lektion, danach das erste noch nicht bearbeitete Quiz;
 * 2. sind alle Schritte abgeschlossen: das erste noch nicht erledigte Lab;
 * 3. sonst „alles erledigt“.
 */
export function computeNextAction(steps: LearningStep[], progress: EffectiveProgress, completedLabs: ReadonlySet<string>): NextAction {
  const evals = steps.map((s) => evaluateStep(s, progress, completedLabs));
  const byId = new Map(evals.map((e) => [e.step.id, e]));
  const open = evals.filter((e) => e.status !== "abgeschlossen");
  if (open.length > 0) {
    const missing = (e: StepEvaluation) => e.step.prerequisiteStepIds.filter((id) => byId.get(id)?.status !== "abgeschlossen");
    const chosen = open.find((e) => missing(e).length === 0) ?? open[0];
    const prerequisitesMissing = missing(chosen).map((id) => byId.get(id)?.step.title ?? id);
    const lesson = chosen.lessons.find((l) => l.status !== "gelesen");
    if (lesson) {
      const firstVisit = progress.openedTopicIds.size === 0 && progress.readTopicIds.size === 0 && Object.keys(progress.quizzes).length === 0;
      return { kind: "lesson", evaluation: chosen, lesson: lesson.lesson, firstVisit, prerequisitesMissing };
    }
    const quiz = chosen.quizzes.find((q) => !q.done);
    if (quiz) return { kind: "quiz", evaluation: chosen, quizId: quiz.quizId, prerequisitesMissing };
  }
  for (const e of evals) {
    const lab = e.labs.find((l) => !l.done);
    if (lab) return { kind: "lab", evaluation: e, labId: lab.labId };
  }
  return { kind: "done" };
}

/** Anzeigetext der Schwierigkeitsstufe (freigegebene Zuordnung folgt in Arbeitspaket 3). */
export function stepStatusLabel(status: StepStatus): string {
  return status === "abgeschlossen" ? "abgeschlossen" : status === "begonnen" ? "begonnen" : "offen";
}

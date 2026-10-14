import { ArrowRight } from "@phosphor-icons/react";
import type { NextAction } from "@/lib/learning-path-logic";

export interface NextStepLookups {
  topicTitle: (topicId: string) => string;
  topicMinutes: (topicId: string) => number | undefined;
  quizTitle: (quizId: string) => string;
  quizQuestionCount: (quizId: string) => number | undefined;
  labTitle: (labId: string) => string;
}

interface NextStepCardProps {
  action: NextAction;
  lookups: NextStepLookups;
  onOpenLesson: (topicId: string, anchor?: string) => void;
  onStartQuiz: (quizId: string) => void;
  onOpenLab: (labId: string) => void;
  onOpenExamPrep?: () => void;
}

/** „Nächster Schritt“: genau eine Empfehlung, berechnet aus dem echten Fortschritt. */
export function NextStepCard({ action, lookups, onOpenLesson, onStartQuiz, onOpenLab, onOpenExamPrep }: NextStepCardProps) {
  let heading = "";
  let detail = "";
  let reason = "";
  let button = "";
  let run: (() => void) | null = null;

  if (action.kind === "lesson") {
    const { step } = action.evaluation;
    const minutes = lookups.topicMinutes(action.lesson.topicId);
    heading = `Schritt ${step.number} · ${step.title}`;
    detail = `Lektion: ${lookups.topicTitle(action.lesson.topicId)}${minutes ? ` (${minutes} Min.)` : ""}`;
    reason = action.firstVisit
      ? "Hier fängst du an. Du brauchst kein Vorwissen."
      : "Du machst mit der nächsten Lektion auf deinem Lernpfad weiter.";
    if (action.prerequisitesMissing.length > 0) reason += ` Empfohlen vorher: ${action.prerequisitesMissing.join(", ")}.`;
    button = action.firstVisit ? "Jetzt starten: Lektion lesen" : "Lektion lesen";
    run = () => onOpenLesson(action.lesson.topicId, action.lesson.anchor);
  } else if (action.kind === "quiz") {
    const { step } = action.evaluation;
    const n = lookups.quizQuestionCount(action.quizId);
    heading = `Schritt ${step.number} · ${step.title}`;
    detail = `Übungsfragen: ${lookups.quizTitle(action.quizId)}${n ? ` (${n} Fragen)` : ""}`;
    reason = "Die Lektionen dieses Schritts sind gelesen. Jetzt prüfst du dich mit Übungsfragen.";
    if (action.prerequisitesMissing.length > 0) reason += ` Empfohlen vorher: ${action.prerequisitesMissing.join(", ")}.`;
    button = "Übungsfragen starten";
    run = () => onStartQuiz(action.quizId);
  } else if (action.kind === "lab") {
    const { step } = action.evaluation;
    heading = `Schritt ${step.number} · ${step.title}`;
    detail = `Lab: ${lookups.labTitle(action.labId)}`;
    reason = "Alle Lektionen und Übungsfragen sind bearbeitet. Als Nächstes wendest du das Gelernte in einem Lab an.";
    button = "Lab öffnen";
    run = () => onOpenLab(action.labId);
  } else {
    heading = "Alle Schritte abgeschlossen";
    detail = "Lektionen, Übungsfragen und Labs sind bearbeitet.";
    reason = "Zur Wiederholung eignen sich die Prüfungsvorbereitung und die Prüfungssimulationen.";
    button = onOpenExamPrep ? "Prüfungsvorbereitung öffnen" : "";
    run = onOpenExamPrep ?? null;
  }

  return (
    <section aria-label="Nächster Schritt" className="rounded-xl border border-primary/40 bg-surface p-5 sm:p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent-primary-fg mb-1">Nächster Schritt</p>
      <h2 className="text-lg sm:text-xl font-bold text-foreground font-sans">{heading}</h2>
      <p className="text-sm text-foreground mt-1">{detail}</p>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{reason}</p>
      {run && button && (
        <button
          type="button"
          onClick={run}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span>{button}</span>
          <ArrowRight weight="bold" className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}

// ============================================================
// Adapter: CCNA-200-301-Fragenpool (src/data/ccnaQuestions.ts)
// → App-Quiz-Modell (Quiz/Question/Answer).
// Reine Funktionen, testbar. Bewusst NICHT in CCNA_QUIZZES
// registriert, damit der Pool nicht in den Prüfungs-Pool
// (quiz-to-exam) leakt.
// ============================================================

import type { Quiz, Question, Answer } from "@/lib/types";
import { ccnaQuestions, type CCNAQuestion } from "@/data/ccnaQuestions";
import type { ExhibitData } from "@/types/exhibit";

const LETTERS = "abcdefghijklmnop";

/** Normalisiert `exhibit` (boolean | ExhibitData) auf einen Boolean für Altcode. */
export function hasExhibit(
  exhibit: boolean | ExhibitData | undefined,
): boolean {
  if (exhibit === undefined) return false;
  if (typeof exhibit === "boolean") return exhibit;
  return exhibit.type !== "none";
}

/** Gibt das strukturierte Exhibit zurück oder null (bei boolean/none/undefined). */
export function getExhibitData(
  exhibit: boolean | ExhibitData | undefined,
): ExhibitData | null {
  if (exhibit === undefined || typeof exhibit === "boolean") return null;
  return exhibit;
}

/** Wandelt eine Roh-Frage (CCNAQuestion) in das App-`Question`-Modell. */
export function toQuestion(raw: CCNAQuestion): Question {
  const correctIdx = Array.isArray(raw.correct) ? raw.correct : [raw.correct];
  const answers: Answer[] = raw.options.map((text, i) => ({
    id: LETTERS[i] ?? String(i),
    text,
    isCorrect: correctIdx.includes(i),
  }));
  return {
    id: raw.id, // Original-Nummerierung (q0001 …) bleibt erhalten
    type: Array.isArray(raw.correct) ? "multiple-choice" : "single-choice",
    text: raw.question,
    explanation: "",
    points: 1,
    answers,
    exhibit: raw.exhibit,
  };
}

/** Baut das komplette Fragenpool-Quiz (alle 1078 Fragen, Reihenfolge = Nummerierung). */
export function buildQuestionPoolQuiz(): Quiz {
  return {
    id: "ccna-fragenpool",
    title: "CCNA 200-301 — Fragenpool",
    description:
      "Originaler Fragenpool (Textfragen). Fragen mit Topologie/CLI-Grafik sind markiert — die Grafik wird nachgereicht.",
    questions: ccnaQuestions.map(toQuestion),
    passingScore: 70,
    shuffleQuestions: false,
  };
}

let _cached: Quiz | null = null;
/** Lazy-gecachter Zugriff — baut das Quiz erst beim ersten Aufruf. */
export function getQuestionPoolQuiz(): Quiz {
  return (_cached ??= buildQuestionPoolQuiz());
}

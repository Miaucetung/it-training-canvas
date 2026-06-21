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

type ExhibitField = boolean | ExhibitData | ExhibitData[] | undefined;

/** true, wenn ein renderbares Exhibit existiert ODER ein Platzhalter nötig ist. */
export function hasExhibit(exhibit: ExhibitField): boolean {
  if (exhibit === undefined) return false;
  if (typeof exhibit === "boolean") return exhibit;
  const arr = Array.isArray(exhibit) ? exhibit : [exhibit];
  return arr.some((e) => e.type !== "none");
}

/** Liste der renderbaren Exhibits (ohne "none"); leer bei boolean/undefined. */
export function getExhibitList(exhibit: ExhibitField): ExhibitData[] {
  if (exhibit === undefined || typeof exhibit === "boolean") return [];
  const arr = Array.isArray(exhibit) ? exhibit : [exhibit];
  return arr.filter((e) => e.type !== "none");
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

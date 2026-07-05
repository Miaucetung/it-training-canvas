// ============================================================
// Adapter: CCNA-200-301-Fragenpool (src/data/ccnaQuestions.ts)
// → ExamPrepDialog-Fragenmodell (PrepQuestion).
// ------------------------------------------------------------
// Ersetzt die frühere Quelle (Lektions-Quizze via quiz-to-exam.ts):
// die Prüfungsvorbereitung nutzt jetzt direkt die 1078 Original-
// fragen aus dem CCNA-200-301-PDF, inkl. der in dieser Session
// gebauten strukturierten Exhibits (CLI/Topologie/Tabelle statt PNG).
// ============================================================

import { ccnaQuestions, type CCNAQuestion } from "@/data/ccnaQuestions";
import type { ExhibitData } from "@/types/exhibit";
import { categorizeQuestion } from "@/lib/ccna-question-pool";
import { inferDiagramId } from "@/lib/quiz-to-exam";

const LETTERS = "abcdefghijklmnop".toUpperCase();

export interface PrepQuestion {
  id: string;
  category: string;
  type: "single" | "multi-select";
  expectedAnswerCount: number;
  text: string;
  options: { letter: string; text: string }[];
  correctAnswer: string[];
  exhibit: boolean | ExhibitData | ExhibitData[];
  diagramId?: string;
}

function toPrepQuestion(raw: CCNAQuestion): PrepQuestion {
  const correctIdx = Array.isArray(raw.correct) ? raw.correct : [raw.correct];
  return {
    id: raw.id,
    category: categorizeQuestion(raw.question),
    type: correctIdx.length > 1 ? "multi-select" : "single",
    expectedAnswerCount: correctIdx.length,
    text: raw.question,
    options: raw.options.map((text, i) => ({ letter: LETTERS[i] ?? String(i), text })),
    correctAnswer: correctIdx.map((i) => LETTERS[i] ?? String(i)),
    exhibit: raw.exhibit,
    diagramId: inferDiagramId(raw.question),
  };
}

let _cached: PrepQuestion[] | null = null;
/** Lazy-gecachter Zugriff auf den Original-Fragenpool im ExamPrepDialog-Format. */
export function getExamPrepQuestions(): PrepQuestion[] {
  return (_cached ??= ccnaQuestions.map(toPrepQuestion));
}

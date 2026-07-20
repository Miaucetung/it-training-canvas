// ============================================================
// Adapter: Klassifizierter CCNA-Fragenpool
// (src/data/ccnaQuestionsClassified.ts) → App-Quiz-Modell
// (Quiz/Question/Answer).
// ------------------------------------------------------------
// Analog zu ccna-question-pool.ts, aber nutzt die vom Classifier
// bereits ermittelte Blueprint-Zuordnung (blueprint_domain/
// blueprint_section) statt Text-Heuristik — keine Notwendigkeit
// zu raten, die Klassifikation liegt explizit vor.
// Reine Funktionen, testbar. Bewusst eigenstaendig, damit
// ExamPrepDialog/ccnaQuestions.ts unangetastet bleiben.
// ============================================================

import type { Quiz, Question, Answer } from "@/lib/types";
import {
  ccnaQuestionsClassified,
  type CCNAQuestionClassified,
} from "@/data/ccnaQuestionsClassified";
import type { ExhibitData } from "@/types/exhibit";
import { hasExhibit, getExhibitList } from "@/lib/ccna-question-pool";

const LETTERS = "abcdefghijklmnop";

export { hasExhibit, getExhibitList };

/**
 * Platzhalter-Exhibit ({needsExhibit:true, exhibitData:null} — Fragen ohne
 * Match in ccnaQuestions.ts) auf das App-Format abbilden: gleiche Semantik
 * wie das bestehende `exhibit: true` ("Grafik noetig, noch nicht migriert").
 */
function toAppExhibit(
  exhibit: CCNAQuestionClassified["exhibit"],
): boolean | ExhibitData | ExhibitData[] {
  if (
    typeof exhibit === "object" &&
    exhibit !== null &&
    !Array.isArray(exhibit) &&
    "needsExhibit" in exhibit
  ) {
    return true;
  }
  return exhibit;
}

/** Wandelt eine klassifizierte Roh-Frage in das App-`Question`-Modell. */
export function toQuestion(raw: CCNAQuestionClassified): Question {
  const correctIdx = Array.isArray(raw.correct) ? raw.correct : [raw.correct];
  const answers: Answer[] = raw.options.map((text, i) => ({
    id: LETTERS[i] ?? String(i),
    text,
    isCorrect: correctIdx.includes(i),
  }));
  return {
    id: raw.id,
    type: Array.isArray(raw.correct) ? "multiple-choice" : "single-choice",
    text: raw.question,
    explanation: "",
    points: 1,
    answers,
    exhibit: toAppExhibit(raw.exhibit),
    blueprint: raw.blueprint_section,
  };
}

// ── Blueprint-Domain-Filter ────────────────────────────────────

export const BLUEPRINT_DOMAINS = ["1.0", "2.0", "3.0", "4.0", "5.0", "6.0"] as const;

const DOMAIN_TITLES: Record<string, string> = {
  "1.0": "Network Fundamentals",
  "2.0": "Network Access",
  "3.0": "IP Connectivity",
  "4.0": "IP Services",
  "5.0": "Security Fundamentals",
  "6.0": "Automation and Programmability",
};

/** Anzeigetitel zu einer Blueprint-Domaenen-Nummer (z. B. "3.0" -> "IP Connectivity"). */
export function getDomainTitle(domain: string): string {
  return DOMAIN_TITLES[domain] ?? domain;
}

/** Anzahl Fragen je Blueprint-Domaene (fuer Filter-Dropdown-Anzeige). */
export function getDomainCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of ccnaQuestionsClassified) {
    counts[q.blueprint_domain] = (counts[q.blueprint_domain] ?? 0) + 1;
  }
  return counts;
}

type ConfidenceFilter = "all" | "medium" | "high";

const CONFIDENCE_RANK: Record<CCNAQuestionClassified["classifier_confidence"], number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function meetsConfidence(q: CCNAQuestionClassified, min: ConfidenceFilter): boolean {
  if (min === "all") return true;
  const minRank = min === "high" ? 2 : 1;
  return CONFIDENCE_RANK[q.classifier_confidence] >= minRank;
}

export interface ClassifiedPoolQuizOptions {
  /** Nur Fragen dieser Blueprint-Domaene (z. B. "3.0"). "all"/undefined = keine Einschraenkung. */
  domain?: string;
  /**
   * Mindest-Konfidenz der Klassifikation. Default: "medium" (blendet die 84
   * Low-Confidence-Faelle aus — teils kaputte SVG-Fragmente ohne echten Text).
   */
  minConfidence?: ConfidenceFilter;
  /** Nur Fragen mit dieser ID-Menge (z. B. fuer den Schwaechen-Drill). */
  ids?: Set<string>;
  /** Zufaellige Reihenfolge statt der Default-Sortierung nach priority_score. */
  shuffle?: boolean;
}

/**
 * Baut das priorisierte Lern-Queue-Quiz: gefiltert nach Domaene/Konfidenz/
 * ID-Menge, standardmaessig absteigend nach priority_score sortiert (die
 * wichtigsten/sichersten Fragen zuerst).
 */
export function buildClassifiedPoolQuiz(options: ClassifiedPoolQuizOptions = {}): Quiz {
  const { domain, minConfidence = "medium", ids, shuffle = false } = options;

  let raw = ccnaQuestionsClassified;
  if (ids) raw = raw.filter((q) => ids.has(q.id));
  if (domain && domain !== "all") raw = raw.filter((q) => q.blueprint_domain === domain);
  raw = raw.filter((q) => meetsConfidence(q, minConfidence));

  const ordered = shuffle
    ? [...raw].sort(() => Math.random() - 0.5)
    : [...raw].sort((a, b) => b.priority_score - a.priority_score);

  return {
    id: "ccna-lernqueue-priorisiert",
    title: "CCNA 200-301 — Priorisierte Lern-Queue",
    description:
      "Nach CCNA-200-301-v1.1-Blueprint-Pruefungsgewichtung priorisierte Fragen, absteigend nach Relevanz-Score sortiert.",
    questions: ordered.map(toQuestion),
    passingScore: 70,
    // Reihenfolge ist oben bereits final (sortiert oder gemischt) — QuizDialog
    // soll sie nicht zusaetzlich mischen, sonst geht die priority_score-Sortierung verloren.
    shuffleQuestions: false,
  };
}

let _cached: Quiz | null = null;
/** Lazy-gecachter Zugriff — baut das ungefilterte, standardsortierte Quiz erst beim ersten Aufruf. */
export function getClassifiedPoolQuiz(): Quiz {
  return (_cached ??= buildClassifiedPoolQuiz());
}

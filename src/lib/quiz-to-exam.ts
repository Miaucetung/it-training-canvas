import { CCNA_QUIZZES } from "./ccna-quiz-content";
import type { Quiz } from "./types";

// Quiz ID → ExamPrepDialog category string
const QUIZ_CATEGORY_MAP: Record<string, string> = {
  "ccna-quiz-netzwerkgrundlagen": "Network Fundamentals",
  "ccna-quiz-ipv4": "IPv4/Subnetting",
  "ccna-quiz-segmentierung": "IPv4/Subnetting",
  "ccna-quiz-ipv6": "IPv6",
  "ccna-quiz-dhcp": "NAT/DHCP",
  "ccna-quiz-nat": "NAT/DHCP",
  "ccna-quiz-security": "Security",
  "ccna-quiz-harden-access": "Security",
  "ccna-quiz-stp": "Switching/VLAN",
  "ccna-quiz-dhcp-snooping-dai": "Security",
  "ccna-quiz-acl": "Security",
  "ccna-quiz-ospf": "OSPF",
  "ccna-quiz-qos": "Network Fundamentals",
  "ccna-quiz-wlan": "Wireless",
  "ccna-quiz-gesamtpruefung": "General",
  "ccna-quiz-gesamtpruefung-2": "General",
  "ccna-quiz-ios-cli": "Network Fundamentals",
  "ccna-quiz-device-management": "Network Fundamentals",
  "ccna-quiz-fhrp": "Routing",
  "ccna-quiz-wan-vpn": "Routing",
  "ccna-quiz-sdn": "Automation/SDN",
  "ccna-quiz-virtualization": "Automation/SDN",
  "ccna-quiz-automation": "Automation/SDN",
  "ccna-quiz-troubleshooting": "Network Fundamentals",
  "ccna-quiz-glasfaser": "Network Fundamentals",
  "ccna-quiz-switching": "Switching/VLAN",
  "ccna-quiz-etherchannel": "Switching/VLAN",
  "quiz-vlan-advanced": "Switching/VLAN",
  "ccna-quiz-tag1-wiederholung": "Network Fundamentals",
  "ccna-quiz-tag1-grundlagen": "Network Fundamentals",
  "ccna-quiz-static-routing": "Routing",
  "ccna-quiz-rip": "Routing",
  "ccna-quiz-admin-distance": "Routing",
  "ccna-quiz-eigrp": "Routing",
  "ccna-quiz-port-security": "Security",
  "ccna-quiz-cis1-klausur": "Network Fundamentals",
  "ccna-quiz-cis2-klausur": "Routing",
  "ccna-quiz-cis3-klausur": "Security",
};

// Returns a diagram key from EXAM_DIAGRAMS if the question text matches a known concept.
export function inferDiagramId(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/\bosi\b/.test(t) && /schicht|layer|tcp\/ip|modell/.test(t)) return "osi-model";
  if (/administrative\s+distance|admin[\s-]distance|ad[\s-]wert|a\.d\.\s|tabelle.*ad|ad.*tabelle/.test(t)) return "admin-distance";
  if (/longest[\s-]prefix[\s-]match|longest[\s-]match|spezifischste.*route|spezifischster.*prefix/.test(t)) return "longest-prefix";
  if (/dhcp.*dora|dora.*dhcp|dhcp[\s-]discover|dhcp[\s-]offer|dhcprequest|dhcpack/.test(t)) return "dhcp-dora";
  if (/ospf.*\bdr\b|\bdr\b.*ospf|\bdr\b.*\bbdr\b|\bbdr\b.*\bdr\b|designated\s+router|broadcast.*ospf.*wahl/.test(t)) return "ospf-dr-bdr";
  if (/ospf.*cost|ospf.*kosten|cost.*ospf|referenz[\s-]bandbreite|ospf.*metrik|10\^8/.test(t)) return "ospf-cost";
  if (/spanning[\s-]tree.*port.*zustand|port[\s-]zustand.*stp|listening.*learning.*forwarding|blocking.*listening/.test(t)) return "stp-states";
  if (/spanning[\s-]tree|root[\s-]bridge|stp.*topologie|topologie.*stp|designated[\s-]port|blocked[\s-]port/.test(t)) return "stp-topology";
  if (/nat.*overload|\bpat\b|port\s+address\s+translation|inside[\s-]global|inside[\s-]local/.test(t)) return "nat-pat";
  if (/\bhsrp\b|\bvrrp\b|\bglbp\b|first[\s-]hop[\s-]redundancy|virtual[\s-]ip.*gateway/.test(t)) return "fhrp";
  if (/802\.1q|trunk.*vlan|vlan.*trunk|native[\s-]vlan/.test(t)) return "vlan-trunk";
  if (/etherchannel|port[\s-]channel|\blacp\b|\bpagp\b|link[\s-]aggregation/.test(t)) return "etherchannel";
  return undefined;
}

// Minimal shape that matches ExamQuestion in ExamPrepDialog (structural compatibility).
// All required ExamQuestionSchema fields must be present.
export interface ConvertedExamQuestion {
  id: string;
  category: string;
  type: "single" | "multi-select" | "drag-drop";
  expectedAnswerCount: number;
  text: string;
  options: { letter: string; text: string }[];
  correctAnswer: string[] | null;
  exhibitImages: string[];
  needsExhibit: boolean;
  sourcePage: number;
  needsReview: boolean;
  explanation?: string;
  diagramId?: string;
}

const TYPE_MAP = {
  "single-choice": "single",
  "multiple-choice": "multi-select",
  "true-false": "single",
} as const satisfies Partial<Record<string, "single" | "multi-select">>;

export function convertQuizzesToExam(quizzes: Quiz[]): ConvertedExamQuestion[] {
  const result: ConvertedExamQuestion[] = [];
  const seenIds = new Set<string>();

  for (const quiz of quizzes) {
    const category = QUIZ_CATEGORY_MAP[quiz.id] ?? "General";

    for (const q of quiz.questions) {
      // Skip unsupported types and duplicates
      if (q.type === "drag-drop" || q.type === "text-input") continue;
      if (seenIds.has(q.id)) continue;
      seenIds.add(q.id);

      const examType = TYPE_MAP[q.type as keyof typeof TYPE_MAP];
      if (!examType) continue;

      const options = q.answers.map((a) => ({
        letter: a.id.toUpperCase(),
        text: a.text,
      }));

      const correctAnswer = q.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id.toUpperCase());

      result.push({
        id: q.id,
        category,
        type: examType,
        expectedAnswerCount: correctAnswer.length,
        text: q.text,
        options,
        correctAnswer: correctAnswer.length > 0 ? correctAnswer : null,
        exhibitImages: [],
        needsExhibit: false,
        sourcePage: 0,
        needsReview: false,
        explanation: q.explanation || undefined,
        diagramId: inferDiagramId(q.text),
      });
    }
  }

  return result;
}

// Pre-converted, singleton — avoids re-running conversion on every render.
let _cached: ConvertedExamQuestion[] | null = null;

export function getExamQuestions(): ConvertedExamQuestion[] {
  if (!_cached) {
    _cached = convertQuizzesToExam(Object.values(CCNA_QUIZZES));
  }
  return _cached;
}

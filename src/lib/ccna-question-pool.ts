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

// ── Themen-Kategorisierung ────────────────────────────────────
// Leitet aus dem Fragetext eine CCNA-Domäne ab. Einzige Quelle der Wahrheit
// für Kategorie-Filter im Fragenpool UND die Domain-Analyse in QuizDialog.
const DOMAIN_RULES: Array<[string, RegExp]> = [
  ["Wireless", /\b(wlan|wireless|access point|\bap\b|ssid|wlc|802\.11|wpa|roaming|antenna|channel|rf\b|lightweight|capwap)\b/i],
  ["IPv6", /\b(ipv6|eui-64|slaac|fe80|2001:|2000::|fc00|ff02|dual-stack|::)/i],
  ["Switching & VLANs", /\b(vlan|trunk|switchport|spanning[- ]tree|\bstp\b|rstp|etherchannel|lacp|pagp|mac[- ]address|\bcdp\b|\blldp\b|port[- ]security|portfast|bpdu|native vlan|dtp|vtp)\b/i],
  ["Routing", /\b(route|routing|ospf|eigrp|\bbgp\b|\brip\b|static|next[- ]hop|administrative distance|gateway of last resort|longest prefix|metric|prefix|router[- ]id)\b/i],
  ["IPv4 & Subnetting", /\b(subnet|subnetting|wildcard|netmask|broadcast address|\/2[0-9]|\/3[0-2]|255\.255|dhcp|cidr|private ip|rfc 1918)\b/i],
  ["Security & Services", /\b(\bacl\b|\bnat\b|\bpat\b|\baaa\b|802\.1x|firewall|\bvpn\b|snmp|syslog|\bntp\b|password|\bssh\b|tacacs|radius|dai|snooping)\b/i],
  ["Architektur & Automation", /\b(spine|leaf|cloud|controller|\bsdn\b|automation|json|rest api|ansible|puppet|chef|hypervisor|virtual machine|three[- ]tier|collapsed|data plane|control plane|northbound|southbound)\b/i],
  ["Geräte & Medien", /\b(ethernet|fiber|optical|copper|cat ?[56]|sfp|transceiver|duplex|collision|crc|cable|connector|poe|mtu)\b/i],
];
const FALLBACK_CATEGORY = "Grundlagen & Sonstige";

/** Leitet aus dem Fragetext eine CCNA-Domäne ab (für Filter + Domain-Analyse). */
export function categorizeQuestion(textRaw: string): string {
  const t = textRaw || "";
  for (const [name, re] of DOMAIN_RULES) if (re.test(t)) return name;
  return FALLBACK_CATEGORY;
}

/** Alle im Pool vorkommenden Kategorien, alphabetisch sortiert. */
export function getPoolCategories(): string[] {
  const cats = new Set(ccnaQuestions.map((q) => categorizeQuestion(q.question)));
  return Array.from(cats).sort();
}

/** Anzahl Fragen je Kategorie (für die Filter-Dropdown-Anzeige). */
export function getPoolCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of ccnaQuestions) {
    const cat = categorizeQuestion(q.question);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return counts;
}

export interface QuestionPoolQuizOptions {
  /** Nur Fragen dieser Kategorie (aus categorizeQuestion). "all" = keine Einschränkung. */
  category?: string;
  /** Nur Fragen mit dieser ID-Menge (z. B. für den Schwächen-Drill). */
  ids?: Set<string>;
  /** Reihenfolge mischen statt Original-Nummerierung (Default: false). */
  shuffle?: boolean;
}

/** Baut das Fragenpool-Quiz, optional gefiltert nach Kategorie und/oder ID-Menge. */
export function buildQuestionPoolQuiz(options: QuestionPoolQuizOptions = {}): Quiz {
  const { category, ids, shuffle = false } = options;
  let raw = ccnaQuestions;
  if (ids) raw = raw.filter((q) => ids.has(q.id));
  if (category && category !== "all") {
    raw = raw.filter((q) => categorizeQuestion(q.question) === category);
  }
  return {
    id: "ccna-fragenpool",
    title: "CCNA 200-301 — Fragenpool",
    description:
      "Originaler Fragenpool (Textfragen). Fragen mit Topologie/CLI-Grafik sind markiert — die Grafik wird nachgereicht.",
    questions: raw.map(toQuestion),
    passingScore: 70,
    shuffleQuestions: shuffle,
  };
}

let _cached: Quiz | null = null;
/** Lazy-gecachter Zugriff — baut das ungefilterte Quiz erst beim ersten Aufruf. */
export function getQuestionPoolQuiz(): Quiz {
  return (_cached ??= buildQuestionPoolQuiz());
}

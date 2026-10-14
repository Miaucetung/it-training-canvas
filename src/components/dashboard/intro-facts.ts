export const INTRO_DISMISSED_KEY = "ccna-dashboard-intro-v1-dismissed";

/**
 * Prüfungsangaben ausschließlich aus offiziellen Cisco-Quellen (abgerufen am 2026-10-14):
 * - Prüfungsseite: https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/exams-and-training.html
 *   (120 Minuten, Version v1.1, Bewertung bestanden/nicht bestanden; Fragenzahl und Bestehensgrenze nennt Cisco dort nicht)
 * - Prüfungsthemen v1.1 (PDF): https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf
 *   (sechs Bereiche mit 20/20/25/10/15/10 %)
 */
export const CISCO_EXAM_PAGE = "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/exams-and-training.html";
export const CISCO_EXAM_TOPICS_PDF = "https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf";
export const CISCO_FACTS_DATE = "14.10.2026";

export function isIntroDismissed(): boolean {
  try {
    return window.localStorage.getItem(INTRO_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function persistDismissed(): void {
  try {
    window.localStorage.setItem(INTRO_DISMISSED_KEY, "1");
  } catch {
    // ignorieren
  }
}


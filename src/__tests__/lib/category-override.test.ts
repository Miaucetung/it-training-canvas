import { describe, it, expect } from "vitest";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";
import { buildQuestionPoolQuiz, categorizeQuestion, categoryOf, toQuestion } from "@/lib/ccna-question-pool";
import { toQuestion as toClassifiedQuestion } from "@/lib/ccna-classified-pool";
import { getExamPrepQuestions } from "@/lib/ccna-exam-pool";

const GERAETE = "Geräte & Medien";
const FALLBACK = "Grundlagen & Sonstige";
const exam = (id: string) => ccnaQuestions.find((q) => q.id === id)!;
const classified = (id: string) => ccnaQuestionsClassified.find((q) => q.id === id)!;

describe("categoryOverride: feste Kategorie für einzelne Fragen", () => {
  it("nur q0829 und Q0829 tragen ein categoryOverride, mit „Geräte & Medien“", () => {
    expect(ccnaQuestions.filter((q) => q.categoryOverride !== undefined).map((q) => `${q.id}=${q.categoryOverride}`)).toEqual([`q0829=${GERAETE}`]);
    expect(ccnaQuestionsClassified.filter((q) => q.categoryOverride !== undefined).map((q) => `${q.id}=${q.categoryOverride}`)).toEqual([`Q0829=${GERAETE}`]);
  });

  it("die Ableitung aus den Schlagwörtern bleibt unverändert (der Fragetext allein ergibt weiter die Rückfallkategorie)", () => {
    expect(categorizeQuestion(exam("q0829").question)).toBe(FALLBACK);
    expect(categorizeQuestion(classified("Q0829").question)).toBe(FALLBACK);
    // Beispiele anderer Fragen: Ableitung wie bisher
    expect(categorizeQuestion("Which command enables PortFast on an access port?")).toBe("Switching & VLANs");
    expect(categorizeQuestion("What is the purpose of OSPF router-id?")).toBe("Routing");
  });

  it("categoryOf nimmt den Override, sonst die Ableitung", () => {
    expect(categoryOf(exam("q0829"))).toBe(GERAETE);
    expect(categoryOf(classified("Q0829"))).toBe(GERAETE);
    expect(categoryOf({ question: "Which command enables PortFast on an access port?" })).toBe("Switching & VLANs");
    expect(categoryOf({ question: "x", categoryOverride: "Wireless" })).toBe("Wireless");
  });

  it("alle übrigen Fragen behalten ihre bisherige Kategorie (categoryOf = Ableitung)", () => {
    for (const q of ccnaQuestions.filter((x) => x.id !== "q0829")) expect(categoryOf(q), q.id).toBe(categorizeQuestion(q.question));
    for (const q of ccnaQuestionsClassified.filter((x) => x.id !== "Q0829")) expect(categoryOf(q), q.id).toBe(categorizeQuestion(q.question));
  });

  it("Prüfungstrainer: q0829 steht in „Geräte & Medien“", () => {
    const prep = getExamPrepQuestions().find((q) => q.id === "q0829")!;
    expect(prep.category).toBe(GERAETE);
  });

  it("Kategorie-Filter des Fragenpools: q0829 in „Geräte & Medien“, nicht mehr in „Grundlagen & Sonstige“", () => {
    expect(buildQuestionPoolQuiz({ category: GERAETE }).questions.some((q) => q.id === "q0829")).toBe(true);
    expect(buildQuestionPoolQuiz({ category: FALLBACK }).questions.some((q) => q.id === "q0829")).toBe(false);
  });

  it("App-Frage trägt den Override (beide Pools) und nur für diese Frage", () => {
    expect(toQuestion(exam("q0829")).categoryOverride).toBe(GERAETE);
    expect(toClassifiedQuestion(classified("Q0829")).categoryOverride).toBe(GERAETE);
    expect("categoryOverride" in toQuestion(exam("q0001"))).toBe(false);
    expect("categoryOverride" in toClassifiedQuestion(classified("Q0001"))).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { toQuestion } from "@/lib/ccna-classified-pool";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";
import type { CCNAQuestionClassified } from "@/data/ccnaQuestionsClassified";

const base: Omit<CCNAQuestionClassified, "exhibit"> = {
  id: "Q9999",
  question: "Refer to the exhibit.",
  options: ["A", "B", "C", "D"],
  correct: 1,
  blueprint_section: "3.5",
  blueprint_domain: "3.0",
  priority_score: 90,
  classifier_confidence: "high",
};

describe("toQuestion (classified) — Exhibit-Mapping", () => {
  it("needsExhibit-Platzhalter wird zu true (Banner)", () => {
    const q = toQuestion({ ...base, exhibit: { needsExhibit: true, exhibitData: null } });
    expect(q.exhibit).toBe(true);
  });

  it("einzelnes ExhibitData-Objekt bleibt erhalten (Regression: wurde zu true verschluckt)", () => {
    const q = toQuestion({
      ...base,
      exhibit: { type: "cli", content: "R1#show ip route" },
    });
    expect(q.exhibit).toEqual({ type: "cli", content: "R1#show ip route" });
  });

  it("Exhibit-Array und Booleans werden unverändert durchgereicht", () => {
    const arr = toQuestion({ ...base, exhibit: [{ type: "none" }] });
    expect(arr.exhibit).toEqual([{ type: "none" }]);
    expect(toQuestion({ ...base, exhibit: false }).exhibit).toBe(false);
    expect(toQuestion({ ...base, exhibit: true }).exhibit).toBe(true);
  });

  it("Q0375 (Static Route, nondefault AD) trägt seine Topologie in die Lern-Queue", () => {
    const raw = ccnaQuestionsClassified.find((q) => q.id === "Q0375");
    expect(raw).toBeDefined();
    const q = toQuestion(raw!);
    expect(q.exhibit).toMatchObject({ type: "topology" });
  });

  it("nur die echten needsExhibit-Fragen landen als Platzhalter im Pool", () => {
    const placeholders = ccnaQuestionsClassified
      .filter((raw) => toQuestion(raw).exhibit === true)
      .map((raw) => raw.id);
    expect(placeholders).toEqual(["Q0173", "Q0311", "Q0964", "Q1135"]);
  });
});

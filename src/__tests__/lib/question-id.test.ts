import { describe, it, expect } from "vitest";
import { normalizeStoredQuestionIds, toBaseQuestionId } from "@/lib/question-id";

describe("toBaseQuestionId", () => {
  it("entfernt den #idx-Anhang", () => {
    expect(toBaseQuestionId("q0123#4")).toBe("q0123");
    expect(toBaseQuestionId("q0123#12")).toBe("q0123");
  });
  it("lässt Basis-IDs unverändert", () => {
    expect(toBaseQuestionId("q0123")).toBe("q0123");
    expect(toBaseQuestionId("")).toBe("");
  });
});

describe("normalizeStoredQuestionIds", () => {
  it("führt #idx-Einträge auf die Basis-ID zurück und entdoppelt", () => {
    expect([...normalizeStoredQuestionIds(["q0001#0", "q0001#7", "q0002", "q0002#3"])].sort()).toEqual(["q0001", "q0002"]);
  });
  it("ist abwärtskompatibel zu alten Listen ohne Suffix", () => {
    expect([...normalizeStoredQuestionIds(["q0001", "q0002"])]).toEqual(["q0001", "q0002"]);
  });
  it("verwirft Fremdes (kein Array, Nicht-Strings, leere Basis)", () => {
    expect(normalizeStoredQuestionIds(null).size).toBe(0);
    expect(normalizeStoredQuestionIds({ a: 1 }).size).toBe(0);
    expect([...normalizeStoredQuestionIds([1, null, "#3", "q0009#1"])]).toEqual(["q0009"]);
  });
});

import { describe, it, expect } from "vitest";
import { toQuestion, buildQuestionPoolQuiz } from "@/lib/ccna-question-pool";
import { ccnaQuestions } from "@/data/ccnaQuestions";

describe("toQuestion", () => {
  it("single-choice: genau eine korrekte Antwort am richtigen Index", () => {
    const q = toQuestion({
      id: "q0006",
      question: "Frage?",
      options: ["A", "B", "C", "D"],
      correct: 0,
      exhibit: false,
    });
    expect(q.type).toBe("single-choice");
    expect(q.answers.filter((a) => a.isCorrect)).toHaveLength(1);
    expect(q.answers[0].isCorrect).toBe(true);
    expect(q.id).toBe("q0006"); // Original-Nummerierung bleibt
    expect(q.exhibit).toBe(false);
  });

  it("multiple-choice: correct als Array → mehrere korrekte", () => {
    const q = toQuestion({
      id: "q0011",
      question: "Choose two",
      options: ["A", "B", "C", "D", "E"],
      correct: [3, 4],
      exhibit: false,
    });
    expect(q.type).toBe("multiple-choice");
    const correct = q.answers.filter((a) => a.isCorrect).map((a) => a.text);
    expect(correct).toEqual(["D", "E"]);
  });

  it("exhibit-Flag wird durchgereicht", () => {
    const q = toQuestion({
      id: "q0001",
      question: "Refer to the exhibit.",
      options: ["A", "B", "C", "D"],
      correct: 1,
      exhibit: true,
    });
    expect(q.exhibit).toBe(true);
  });

  it("Antwort-IDs sind a, b, c, …", () => {
    const q = toQuestion({
      id: "q0050",
      question: "x",
      options: ["A", "B", "C", "D"],
      correct: [0, 1],
      exhibit: false,
    });
    expect(q.answers.map((a) => a.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("buildQuestionPoolQuiz", () => {
  const quiz = buildQuestionPoolQuiz();

  it("enthält alle Fragen aus dem Datensatz (1078)", () => {
    expect(quiz.questions).toHaveLength(ccnaQuestions.length);
    expect(quiz.questions).toHaveLength(1078);
  });

  it("behält Reihenfolge/Nummerierung bei (kein Shuffle)", () => {
    expect(quiz.shuffleQuestions).toBe(false);
    expect(quiz.questions[0].id).toBe(ccnaQuestions[0].id);
    expect(quiz.questions[quiz.questions.length - 1].id).toBe(
      ccnaQuestions[ccnaQuestions.length - 1].id,
    );
  });

  it("jede Frage hat mindestens eine korrekte Antwort", () => {
    for (const q of quiz.questions) {
      expect(q.answers.some((a) => a.isCorrect)).toBe(true);
    }
  });

  it("Anzahl Exhibit-Fragen stimmt (334)", () => {
    expect(quiz.questions.filter((q) => q.exhibit)).toHaveLength(334);
  });
});

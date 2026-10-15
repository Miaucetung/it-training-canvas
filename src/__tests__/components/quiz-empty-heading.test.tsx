// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { QuizDialog } from "@/components/QuizDialog";
import type { Quiz } from "@/lib/types";

const quizWith = (text: string): Quiz =>
  ({
    id: "t",
    title: "t",
    description: "",
    passingScore: 70,
    shuffleQuestions: false,
    questions: [
      {
        id: "x1",
        type: "single-choice",
        text,
        explanation: "",
        points: 1,
        answers: [
          { id: "A", text: "value", isCorrect: true },
          { id: "B", text: "array", isCorrect: false },
        ],
      },
    ],
  }) as unknown as Quiz;

describe("QuizDialog: Fragen ohne Text (z. B. Q1254)", () => {
  beforeEach(() => cleanup());

  it("eine Frage ohne Text erzeugt keine leere Überschrift", () => {
    const { container } = render(<QuizDialog quiz={quizWith("")} theme="dark" onComplete={vi.fn()} onClose={vi.fn()} />);
    const empty = [...container.ownerDocument.querySelectorAll("h1,h2,h3,h4")].filter((h) => !(h.textContent ?? "").trim());
    expect(empty).toEqual([]);
  });

  it("eine Frage mit Text behält ihre Überschrift", () => {
    render(<QuizDialog quiz={quizWith("What is represented by the word value?")} theme="dark" onComplete={vi.fn()} onClose={vi.fn()} />);
    expect(document.querySelector("h3")?.textContent).toBe("What is represented by the word value?");
  });
});

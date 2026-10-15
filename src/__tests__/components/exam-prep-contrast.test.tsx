// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/lib/ccna-exam-pool", () => ({
  getExamPrepQuestions: () => [
    {
      id: "q9101",
      category: "Routing",
      type: "single" as const,
      expectedAnswerCount: 1,
      text: "Which route is preferred?",
      options: [
        { letter: "A", text: "the longest prefix" },
        { letter: "B", text: "the shortest prefix" },
      ],
      correctAnswer: ["A"],
      exhibit: false,
    },
  ],
}));

import ExamPrepDialog from "@/components/ExamPrepDialog";

describe("ExamPrepDialog: Textfarben über Design-Tokens (Kontrast)", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  for (const dark of [true, false]) {
    it(`Fragenzähler und „Zum Menü“ nutzen text-muted-foreground (${dark ? "dunkel" : "hell"})`, () => {
      render(<ExamPrepDialog dark={dark} onClose={vi.fn()} />);
      fireEvent.click(screen.getByText("Lernmodus"));
      const counter = screen.getByText("1/1");
      expect(counter.className).toBe("text-muted-foreground");
      const back = screen.getByText("← Zum Menü");
      expect(back.className).toContain("text-muted-foreground");
      expect(back.className).toContain("hover:text-foreground");
      expect(back.className).not.toMatch(/text-zinc-(400|600)/);
    });
  }
});

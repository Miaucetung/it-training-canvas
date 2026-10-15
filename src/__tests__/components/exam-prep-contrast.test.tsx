// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/lib/ccna-exam-pool", () => ({
  getExamPrepQuestions: () =>
    Array.from({ length: 12 }, (_, i) => ({
      id: `q91${String(i).padStart(2, "0")}`,
      category: "Routing",
      type: "single" as const,
      expectedAnswerCount: 1,
      text: `Which route is preferred (${i})?`,
      options: [
        { letter: "A", text: "the longest prefix" },
        { letter: "B", text: "the shortest prefix" },
      ],
      correctAnswer: ["A"],
      exhibit: false,
    })),
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
      const counter = screen.getByText("1/12");
      expect(counter.className).toBe("text-muted-foreground");
      const back = screen.getByText("← Zum Menü");
      expect(back.className).toContain("text-muted-foreground");
      expect(back.className).toContain("hover:text-foreground");
      expect(back.className).not.toMatch(/text-zinc-(400|600)/);
    });
  }

  for (const dark of [true, false]) {
    it(`Ergebnisbildschirm: Zeitangabe und Domain-Zähler nutzen text-muted-foreground (${dark ? "dunkel" : "hell"})`, () => {
      render(<ExamPrepDialog dark={dark} onClose={vi.fn()} />);
      fireEvent.click(screen.getByText("Prüfungsmodus"));
      for (let i = 0; i < 12; i++) {
        fireEvent.click(screen.getByText("the longest prefix"));
        fireEvent.click(screen.getByText(i < 11 ? /Weiter/ : /Auswertung/));
      }
      const time = screen.getByText(/^Zeit:/);
      expect(time.className).toContain("text-muted-foreground");
      expect(time.className).not.toMatch(/text-zinc-(400|500)/);
      const counter = screen.getByText(/^12\/12 \(100%\)$/);
      expect(counter.className).toBe("text-muted-foreground");
    });

    it(`Menü: „Schwächeliste zurücksetzen“ nutzt text-muted-foreground (${dark ? "dunkel" : "hell"})`, () => {
      localStorage.setItem("ccna-exam-weak-questions", JSON.stringify(["q9100", "q9101"]));
      render(<ExamPrepDialog dark={dark} onClose={vi.fn()} />);
      const reset = screen.getByText(/^Schwächeliste zurücksetzen \(2\)$/);
      expect(reset.className).toContain("text-muted-foreground");
      expect(reset.className).toContain("hover:text-foreground");
      expect(reset.className).not.toMatch(/text-zinc-(400|600)/);
    });
  }
});


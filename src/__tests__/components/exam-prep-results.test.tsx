// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/lib/ccna-exam-pool", () => {
  const mk = (id: string, category: string, text: string) => ({
    id,
    category,
    type: "single" as const,
    expectedAnswerCount: 1,
    text,
    options: [
      { letter: "A", text: `${text} richtig` },
      { letter: "B", text: `${text} falsch` },
    ],
    correctAnswer: ["A"],
    exhibit: false,
  });
  return {
    getExamPrepQuestions: () => [
      mk("q0001", "Kategorie Alpha", "Frage eins"),
      mk("q0002", "Kategorie Beta", "Frage zwei"),
      mk("q0001", "Kategorie Alpha", "Frage drei"),
    ],
  };
});

import ExamPrepDialog from "@/components/ExamPrepDialog";

describe("ExamPrepDialog – Ergebnisbildschirm mit #idx-IDs", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    window.__AUDIT_NO_SHUFFLE__ = true;
  });

  const runSession = (answerLetter: "A" | "B") => {
    render(<ExamPrepDialog dark={false} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Lernmodus"));
    for (let i = 0; i < 3; i++) {
      const option = screen
        .getAllByRole("button")
        .find((b) => b.textContent?.includes(`${answerLetter === "A" ? "richtig" : "falsch"}`) && b.textContent.length < 60)!;
      fireEvent.click(option);
      fireEvent.click(screen.getByText("Prüfen"));
      const next = screen.queryByText(/Weiter/);
      fireEvent.click(next ?? screen.getByText("Auswertung"));
    }
  };

  it("zeigt die richtigen Kategorien (nicht 'Sonstige') und zählt je Kategorie", () => {
    runSession("A");
    expect(screen.getByText("Domain-Analyse")).toBeDefined();
    expect(screen.getByText("Kategorie Alpha")).toBeDefined();
    expect(screen.getByText("Kategorie Beta")).toBeDefined();
    expect(screen.queryByText("Sonstige")).toBeNull();
    expect(screen.getByText("2/2 (100%)")).toBeDefined();
    expect(screen.getByText("1/1 (100%)")).toBeDefined();
  });

  it("falsche Antworten landen in der richtigen Kategorie; gespeichert wird nur die Basis-ID", () => {
    runSession("B");
    expect(screen.getByText("0/2 (0%)")).toBeDefined();
    expect(screen.getByText("0/1 (0%)")).toBeDefined();
    expect(screen.queryByText("Sonstige")).toBeNull();
    const stored = JSON.parse(localStorage.getItem("ccna-exam-weak-questions") ?? "[]") as string[];
    expect(stored.sort()).toEqual(["q0001", "q0002"]);
    expect(stored.some((id) => id.includes("#"))).toBe(false);
  });

  it("alte gespeicherte #idx-Einträge werden beim Lesen auf die Basis-ID zurückgeführt", () => {
    localStorage.setItem("ccna-exam-weak-questions", JSON.stringify(["q0001#0", "q0001#2", "q0002#1"]));
    render(<ExamPrepDialog dark={false} onClose={vi.fn()} />);
    expect(screen.getByText("2 gespeicherte Fehler")).toBeDefined();
  });
});

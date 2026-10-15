// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

vi.mock("@/lib/ccna-exam-pool", () => ({
  getExamPrepQuestions: () => [
    {
      id: "q9001",
      category: "Routing",
      type: "single" as const,
      expectedAnswerCount: 1,
      text: "Which configuration sets priority 0?",
      options: [
        { letter: "A", text: "R3(config)#interface fastethernet 0/0 R3(config-if)#ip ospf priority 0" },
        { letter: "B", text: "no shutdown" },
        { letter: "C", text: "The router becomes DROTHER." },
      ],
      correctAnswer: ["A"],
      exhibit: false,
    },
  ],
}));

import ExamPrepDialog from "@/components/ExamPrepDialog";

describe("ExamPrepDialog: Antwortoptionen mit CLI-Block", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("Block als Monospace-Zeilen, Einzelbefehl und Satz unverändert, gleiche Buttons, Auswahl und Ergebnisfarben wie vorher", () => {
    render(<ExamPrepDialog dark={false} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Lernmodus"));
    const optionButtons = screen.getAllByRole("button").filter((b) => /ip ospf priority|no shutdown|DROTHER/.test(b.textContent ?? ""));
    expect(optionButtons).toHaveLength(3);
    const [block, single, sentence] = optionButtons;

    const code = block.querySelector("[data-cli-option]") as HTMLElement;
    expect(code.textContent).toBe("R3(config)#interface fastethernet 0/0\nR3(config-if)#ip ospf priority 0");
    expect(single.querySelector("[data-cli-option]")).toBeNull();
    expect(single.querySelector("span.flex-1")?.textContent).toBe("no shutdown");
    expect(sentence.querySelector("span.flex-1")?.textContent).toBe("The router becomes DROTHER.");

    // gleiche Button-Klassen (Klickfläche) vor der Auswahl; nur der Block-Button scrollt (overflow-x-auto)
    expect(single.className).toBe(sentence.className);
    expect(block.className).toBe(`${single.className} overflow-x-auto`);

    // Auswahl: die Klassen wechseln wie bei jeder Option, danach "Prüfen" -> Ergebnisfarben/Symbole
    fireEvent.click(block);
    expect(block.className).not.toBe(`${single.className} overflow-x-auto`);
    fireEvent.click(screen.getByText("Prüfen"));
    expect(block.querySelector("svg")).not.toBeNull(); // Häkchen bei der richtigen Antwort
    expect(block.hasAttribute("disabled")).toBe(true);
  });
});

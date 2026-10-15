// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { CliOptionText } from "@/components/CliOptionText";
import { QuizDialog } from "@/components/QuizDialog";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";
import { classifyOption, cliButtonClass, isCliBlockKind } from "@/lib/cli-option";
import type { Quiz } from "@/lib/types";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const optionsOf = (list: Array<{ id: string; options: string[] }>) => list.flatMap((q) => q.options);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

describe("CliOptionText: nicht erkannte Optionen werden genau wie vorher gerendert", () => {
  it("alle 4233 Einzelbefehle und übrigen Optionen des Prüfungspools ergeben exakt das bisherige <span>", () => {
    const rest = optionsOf(ccnaQuestions).filter((t) => !isCliBlockKind(classifyOption(t).kind));
    expect(rest).toHaveLength(912 + 3321);
    for (const text of rest) {
      const html = renderToStaticMarkup(<CliOptionText text={text} className="flex-1" cliClassName="flex-1" />);
      expect(html).toBe(`<span class="flex-1">${esc(text)}</span>`);
    }
  });

  it("der Options-Button bekommt für diese Optionen keine zusätzliche Klasse", () => {
    const all = [...optionsOf(ccnaQuestions), ...optionsOf(ccnaQuestionsClassified)].filter((t) => !isCliBlockKind(classifyOption(t).kind));
    expect(all.every((t) => cliButtonClass(t) === "")).toBe(true);
  });

  it("dasselbe für den klassifizierten Pool", () => {
    const rest = optionsOf(ccnaQuestionsClassified).filter((t) => !isCliBlockKind(classifyOption(t).kind));
    for (const text of rest) {
      expect(renderToStaticMarkup(<CliOptionText text={text} className="text-sm" cliClassName="flex-1" />)).toBe(`<span class="text-sm">${esc(text)}</span>`);
    }
  });
});

describe("CliOptionText: erkannte CLI-Blöcke", () => {
  const blocks = optionsOf(ccnaQuestions).filter((t) => isCliBlockKind(classifyOption(t).kind));

  it("alle 280 erkannten Optionen erscheinen als Monospace-Block (Button scrollt); der Text bleibt (bis auf Leerraum) erhalten", () => {
    expect(blocks).toHaveLength(280);
    for (const text of blocks) {
      const html = renderToStaticMarkup(<CliOptionText text={text} className="flex-1" cliClassName="flex-1" />);
      expect(html).toContain('data-cli-option=""');
      expect(cliButtonClass(text)).toBe(" overflow-x-auto");
      expect(html).toContain("font-mono");
      expect(html).toContain("whitespace-pre");
      const inner = html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
      expect(norm(inner)).toBe(norm(text));
    }
  });

  it("das äußere Element darf im Flex-Layout schrumpfen (min-w-0), die Seite scrollt nicht", () => {
    const html = renderToStaticMarkup(<CliOptionText text={blocks[0]} className="flex-1" cliClassName="flex-1" />);
    expect(html.startsWith('<span class="min-w-0 max-w-full flex-1">')).toBe(true);
  });
});

describe("QuizDialog: Antwortoptionen mit CLI-Block", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  const quiz: Quiz = {
    id: "t",
    title: "t",
    description: "",
    passingScore: 70,
    shuffleQuestions: false,
    questions: [
      {
        id: "x1",
        type: "single-choice",
        text: "Which configuration?",
        explanation: "",
        points: 1,
        answers: [
          { id: "A", text: "R1(config)#interface fastethernet 0/0 R1(config-if)#ip ospf priority 0", isCorrect: true },
          { id: "B", text: "no shutdown", isCorrect: false },
          { id: "C", text: "The router forwards the packet.", isCorrect: false },
        ],
      },
    ],
  } as unknown as Quiz;

  it("Block erscheint als Monospace mit Zeilen; Einzelbefehl und Satz bleiben unverändert; Auswahl per Klick und Tastatur funktioniert", () => {
    render(<QuizDialog quiz={quiz} theme="dark" onComplete={vi.fn()} onClose={vi.fn()} />);
    const buttons = screen.getAllByRole("button").filter((b) => /R1\(config\)|no shutdown|forwards/.test(b.textContent ?? ""));
    expect(buttons).toHaveLength(3);
    const [block, single, sentence] = buttons;
    // Block: Monospace, zwei Zeilen
    const code = block.querySelector("[data-cli-option]") as HTMLElement;
    expect(code).not.toBeNull();
    expect(code.textContent).toBe("R1(config)#interface fastethernet 0/0\nR1(config-if)#ip ospf priority 0");
    // Einzelbefehl und Satz: wie bisher ein <span class="text-sm">
    expect(single.querySelector("[data-cli-option]")).toBeNull();
    expect(single.querySelector("span.text-sm")?.textContent).toBe("no shutdown");
    expect(sentence.querySelector("[data-cli-option]")).toBeNull();
    // Klickfläche: alle drei sind gleich aufgebaute Buttons mit gleichen Basisklassen; nur der Block-Button scrollt
    const base = (b: HTMLElement) => b.className.split(" ").filter((c) => ["w-full", "text-left", "p-4", "rounded-xl", "border", "transition-all"].includes(c)).sort().join(" ");
    expect(base(block)).toBe(base(single));
    expect(base(block)).toBe(base(sentence));
    expect(block.className).toContain("overflow-x-auto");
    expect(single.className).not.toContain("overflow-x-auto");
    expect(sentence.className).not.toContain("overflow-x-auto");
    // Auswahl per Klick: Farbklassen wechseln wie bei jeder anderen Option
    const before = block.className;
    fireEvent.click(block);
    expect(block.className).not.toBe(before);
    // Tastatur: Buttons sind fokussierbar und per Enter/Space (nativ) bedienbar; der Textblock selbst ist nicht fokussierbar
    expect(block.tabIndex).toBe(0);
    expect(code.hasAttribute("tabindex")).toBe(false);
    block.focus();
    expect(document.activeElement).toBe(block);
  });
});

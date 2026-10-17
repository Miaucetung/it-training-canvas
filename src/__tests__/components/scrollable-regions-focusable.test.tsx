// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ConceptMarkdown } from "@/components/markdown-render";
import { IPv4SubnetTableDialog } from "@/components/IPv4SubnetTableDialog";
import SubnettingCheatsheet from "@/tools/SubnettingCheatsheet";

describe("Scrollbare Bereiche sind per Tastatur erreichbar", () => {
  beforeEach(() => cleanup());

  it("Lektion: Codeblöcke und Tabellen haben tabindex=0", () => {
    const md = "```\nshow ip route\n```\n\n| A | B |\n|---|---|\n| 1 | 2 |\n";
    const { container } = render(<ConceptMarkdown text={md} dark />);
    const pre = container.querySelector("pre") as HTMLElement;
    expect(pre.getAttribute("tabindex")).toBe("0");
    const wrapper = container.querySelector("table")!.parentElement as HTMLElement;
    expect(wrapper.className).toContain("overflow-x-auto");
    expect(wrapper.getAttribute("tabindex")).toBe("0");
  });

  it("IPv4-Subnetztabelle: Inhaltsbereich ist ein fokussierbarer, benannter Bereich", () => {
    render(<IPv4SubnetTableDialog onClose={vi.fn()} />);
    expect(screen.getByRole("region", { name: "Tabelleninhalt" }).getAttribute("tabindex")).toBe("0");
  });

  it("Subnetting-Cheatsheet: Blockgrößen-Tabelle ist ein fokussierbarer, benannter Bereich", () => {
    render(<SubnettingCheatsheet />);
    expect(screen.getByRole("region", { name: "Blockgrößen-Tabelle" }).getAttribute("tabindex")).toBe("0");
  });
});

describe("Markdown: leere Tabellenkopfzellen", () => {
  it("leere th bekommt unsichtbaren Text", () => {
    cleanup();
    const md = "| | A |\n|---|---|\n| x | 1 |\n";
    const { container } = render(<ConceptMarkdown text={md} dark />);
    for (const th of container.querySelectorAll("th")) expect((th.textContent ?? "").trim()).not.toBe("");
  });
});

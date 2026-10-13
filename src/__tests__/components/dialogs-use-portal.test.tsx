// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { DragDropTrainerDialog } from "@/components/DragDropTrainerDialog";
import { CliGlossaryDialog } from "@/components/CliGlossaryDialog";
import { IPv4SubnetTableDialog } from "@/components/IPv4SubnetTableDialog";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

describe("Dialoge hängen per Portal an document.body (B-09)", () => {
  it("jede Komponente mit 'fixed inset-0' nutzt ModalPortal, createPortal oder ein Radix-Portal", () => {
    const root = resolve(process.cwd(), "src/components");
    const offenders = walk(root).filter((file) => {
      const src = readFileSync(file, "utf8");
      if (!src.includes("fixed inset-0")) return false;
      return !/ModalPortal|createPortal|DialogPrimitive|SheetPrimitive|AlertDialogPrimitive|\.Portal/.test(src);
    });
    expect(offenders.map((f) => f.replace(root, ""))).toEqual([]);
  });

  it("gerenderte Dialoge sind modal, benannt und direkte Kinder von body", () => {
    const cases: Array<[string, React.ReactElement]> = [
      ["Drag-and-Drop-Trainer", <DragDropTrainerDialog key="a" dark onClose={vi.fn()} />],
      ["Cisco-IOS-Befehlsreferenz", <CliGlossaryDialog key="b" dark onClose={vi.fn()} />],
      ["IPv4-Subnetztabelle", <IPv4SubnetTableDialog key="c" dark onClose={vi.fn()} />],
    ];
    for (const [label, el] of cases) {
      const { container, unmount } = render(el);
      const dlg = screen.getByRole("dialog", { name: label });
      expect(dlg.getAttribute("aria-modal")).toBe("true");
      expect(dlg.parentElement).toBe(document.body);
      expect(container.contains(dlg)).toBe(false);
      unmount();
    }
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StpSimulatorDialog } from "@/components/StpSimulatorDialog";
import { OsiSimulatorDialog } from "@/components/OsiSimulatorDialog";
import { DragDropTrainerDialog } from "@/components/DragDropTrainerDialog";

describe("Zugängliche Namen: Formularelemente und Icon-Buttons", () => {
  beforeEach(() => cleanup());

  for (const dark of [true, false]) {
    it(`STP-Simulator: jede Bridge-Priority-Auswahl hat einen Namen (${dark ? "dunkel" : "hell"})`, () => {
      render(<StpSimulatorDialog dark={dark} onClose={vi.fn()} />);
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
      for (const s of selects) expect(s.getAttribute("aria-label") ?? "").toMatch(/^Bridge Priority /);
    });

    it(`OSI-Simulator: Slider und Geschwindigkeit haben Namen (${dark ? "dunkel" : "hell"})`, () => {
      render(<OsiSimulatorDialog dark={dark} onClose={vi.fn()} />);
      expect(screen.getByRole("slider", { name: "Schritt" })).toBeTruthy();
      expect(screen.getByRole("combobox", { name: "Geschwindigkeit" })).toBeTruthy();
    });
  }

  it("Drag-and-Drop-Trainer: Zurück, Reset und Weiter haben Namen (auch wenn der Text ausgeblendet ist)", () => {
    render(<DragDropTrainerDialog dark onClose={vi.fn()} />);
    for (const name of ["Zurück", "Reset", "Weiter"]) expect(screen.getByRole("button", { name })).toBeTruthy();
  });
});

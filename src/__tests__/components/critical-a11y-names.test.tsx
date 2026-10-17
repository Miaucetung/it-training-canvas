// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

describe("STP-Simulator: Tabellen", () => {
  it("Reiter „STP vs RSTP“: Tabelle scrollbar per Tastatur, Tabellenkopf ohne leere Zelle", () => {
    cleanup();
    render(<StpSimulatorDialog dark onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /STP vs RSTP/ }));
    const region = screen.getByRole("region", { name: "Tabelle Direktvergleich" });
    expect(region.getAttribute("tabindex")).toBe("0");
    for (const th of region.querySelectorAll("th")) expect((th.textContent ?? "").trim()).not.toBe("");
  });

  it("Reiter „Port-Zustände“: Tabelle scrollbar per Tastatur", () => {
    cleanup();
    render(<StpSimulatorDialog dark={false} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Port-Zustände/ }));
    expect(screen.getByRole("region", { name: "Tabelle Zustände" }).getAttribute("tabindex")).toBe("0");
  });
});

import { VlanSimulatorDialog } from "@/components/VlanSimulatorDialog";
import { IPv6CalculatorDialog } from "@/components/IPv6CalculatorDialog";

describe("Weitere critical-Fälle aus dem Reiter-Sweep", () => {
  it("VLAN „Trunk-Animation“: Geschwindigkeits-Slider hat einen Namen", () => {
    cleanup();
    render(<VlanSimulatorDialog dark onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Trunk-Animation/ }));
    expect(screen.getByRole("slider", { name: "Geschwindigkeit:" })).toBeTruthy();
  });

  it("VLAN „Packet-Walk“: Schritt-Punkte heißen „Schritt n von N“, aktueller Schritt mit aria-current", () => {
    cleanup();
    render(<VlanSimulatorDialog dark onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Packet-Walk/ }));
    const dots = screen.getAllByRole("button", { name: /^Schritt \d+ von \d+$/ });
    expect(dots.length).toBeGreaterThan(1);
    expect(dots[0].getAttribute("aria-current")).toBe("step");
    expect(dots[1].getAttribute("aria-current")).toBeNull();
    fireEvent.click(dots[2]);
    expect(screen.getAllByRole("button", { name: /^Schritt \d+ von \d+$/ })[2].getAttribute("aria-current")).toBe("step");
  });

  it("IPv6 „Segmentierung“: Präfix- und CIDR-Feld haben Namen", () => {
    cleanup();
    render(<IPv6CalculatorDialog open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Segmentierung" }));
    expect(screen.getByLabelText("Ausgangspräfix (mit /CIDR)")).toBeTruthy();
    expect(screen.getByLabelText("Neues CIDR (1–128)")).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { StpSimulatorDialog } from "@/components/StpSimulatorDialog";
import { VlanSimulatorDialog } from "@/components/VlanSimulatorDialog";
import { IPv6CalculatorDialog } from "@/components/IPv6CalculatorDialog";
import { RoutingSimulatorDialog } from "@/components/RoutingSimulatorDialog";
import { VerkabelungTrainerDialog } from "@/components/VerkabelungTrainerDialog";
import { IPv4SubnetTableDialog } from "@/components/IPv4SubnetTableDialog";

const CASES: Array<[string, () => void, number]> = [
  ["STP-Simulator", () => render(<StpSimulatorDialog dark onClose={vi.fn()} />), 4],
  ["VLAN-Simulator", () => render(<VlanSimulatorDialog dark onClose={vi.fn()} />), 4],
  ["IPv6-Rechner", () => render(<IPv6CalculatorDialog open onClose={vi.fn()} />), 5],
  ["Routing-Simulator", () => render(<RoutingSimulatorDialog dark onClose={vi.fn()} />), 5],
  ["Verkabelungs-Trainer", () => render(<VerkabelungTrainerDialog dark onClose={vi.fn()} />), 3],
  ["IPv4-Subnetztabelle", () => render(<IPv4SubnetTableDialog onClose={vi.fn()} />), 3],
];

describe("Reiter in den Werkzeugen sind echte Tabs", () => {
  beforeEach(() => cleanup());
  for (const [name, mount, count] of CASES) {
    it(`${name}: tablist, ${count} Tabs, genau einer ausgewählt, passendes tabpanel`, () => {
      mount();
      const list = screen.getByRole("tablist");
      expect(list.getAttribute("aria-label")).toBeTruthy();
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBe(count);
      expect(tabs.filter((t) => t.getAttribute("aria-selected") === "true").length).toBe(1);
      const selected = tabs.find((t) => t.getAttribute("aria-selected") === "true")!;
      const panel = screen.getByRole("tabpanel");
      expect(panel.getAttribute("aria-labelledby")).toBe(selected.id);
      expect(selected.getAttribute("aria-controls")).toBe(panel.id);
    });

    it(`${name}: jeder Tab hat nach dem Auswählen ein zugehöriges tabpanel`, async () => {
      mount();
      for (let i = 0; i < count; i++) {
        fireEvent.mouseDown(screen.getAllByRole("tab")[i]);
        await waitFor(() => expect(screen.getAllByRole("tab")[i].getAttribute("aria-selected")).toBe("true"));
        const sel = screen.getAllByRole("tab")[i];
        const panel = screen.getByRole("tabpanel");
        expect(sel.getAttribute("aria-controls")).toBe(panel.id);
      }
    });

    it(`${name}: Pfeiltaste wechselt zum nächsten Tab`, async () => {
      mount();
      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
      await waitFor(() => expect(screen.getAllByRole("tab")[1].getAttribute("aria-selected")).toBe("true"));
      expect(screen.getAllByRole("tab")[0].getAttribute("aria-selected")).toBe("false");
    });
  }
});

// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProfessionalTopologyDiagram } from "@/components/labs/ProfessionalTopologyDiagram";
import type { LabTopologyData } from "@/components/labs/types";

const topology: LabTopologyData = {
  viewBox: { width: 400, height: 200 },
  devices: [
    { id: "r1", name: "R1", type: "router", tier: "gateway", x: 100, y: 60, model: "Cisco 2911" },
    { id: "sw1", name: "SW1", type: "switch-l2", tier: "access", x: 300, y: 60, model: "Catalyst 2960" },
  ],
  links: [{ id: "l1", from: "r1", to: "sw1", fromPort: "Gi0/0", toPort: "Fa0/1" }],
  addressingTable: [],
};

describe("Lab-Diagramm: Zugänglichkeit", () => {
  beforeEach(() => cleanup());

  it("Diagramm ist eine Gruppe (enthält bedienbare Geräte), nicht role=img", () => {
    const { container } = render(<ProfessionalTopologyDiagram topology={topology} />);
    const svg = container.querySelector('svg[aria-label="Cisco Netzwerk-Topologiediagramm"]') as SVGElement;
    expect(svg.getAttribute("role")).toBe("group");
    expect(svg.querySelectorAll('[role="button"]').length).toBe(2);
  });

  it("Gerätename enthält den sichtbaren Text (Name und Modell)", () => {
    render(<ProfessionalTopologyDiagram topology={topology} />);
    expect(screen.getByRole("button", { name: "R1 Cisco 2911: Gerät auswählen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "SW1 Catalyst 2960: Gerät auswählen" })).toBeTruthy();
  });
});

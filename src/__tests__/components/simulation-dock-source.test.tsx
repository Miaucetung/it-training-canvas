// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SimulationDock } from "@/components/canvas-v2/SimulationDock";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import * as simulator from "@/lib/topology/simulation/packet-simulator";

vi.mock("@/lib/topology/simulation/packet-simulator", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/topology/simulation/packet-simulator")>();
  return { ...actual, simulatePing: vi.fn(actual.simulatePing) };
});

const topology = buildNetworkTopologyFromLab(LABS.find((l) => l.id === "drill-interfaces")!, CURATED_TOPOLOGIES["drill-interfaces"], "target").topology;

const lastCall = () => {
  const calls = vi.mocked(simulator.simulatePing).mock.calls;
  return calls[calls.length - 1][0];
};

describe("SimulationDock: Quell-IP (ping … source …)", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(simulator.simulatePing).mockClear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("bietet für Router die Interface-Adressen und „automatisch“ an", () => {
    render(<SimulationDock topology={topology} isOpen onClose={vi.fn()} activeHopIndex={null} onSelectHop={vi.fn()} />);
    const select = screen.getByLabelText("Quell-IP:") as HTMLSelectElement;
    const labels = [...select.options].map((o) => o.textContent);
    expect(labels[0]).toBe("automatisch (Ausgangsinterface)");
    expect(labels).toContain("source 10.0.0.1 (Gi0/1)");
  });

  it("gibt die gewählte Quell-IP an die Simulation weiter, „automatisch“ keine", () => {
    render(<SimulationDock topology={topology} isOpen onClose={vi.fn()} activeHopIndex={null} onSelectHop={vi.fn()} />);
    fireEvent.click(screen.getByText("Ping senden"));
    expect(lastCall().sourceIp).toBeUndefined();
    fireEvent.change(screen.getByLabelText("Quell-IP:"), { target: { value: "192.168.10.1" } });
    fireEvent.click(screen.getByText("Ping senden"));
    expect(lastCall().sourceIp).toBe("192.168.10.1");
  });
});

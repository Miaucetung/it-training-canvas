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

describe("SimulationDock: Vorschau-Hinweis", () => {
  it("nennt die bekannten Grenzen der Simulation", () => {
    cleanup();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    render(<SimulationDock topology={topology} isOpen onClose={vi.fn()} activeHopIndex={null} onSelectHop={vi.fn()} />);
    const note = screen.getByTestId("simulation-preview-note").textContent ?? "";
    expect(note).toMatch(/^Vorschau/);
    for (const g of ["RIP", "IPv6-Ping", "IPsec", "DHCP-Relay"]) expect(note).toContain(g);
  });
});

describe("SimulationDock: simulierte DHCP-Vergabe", () => {
  beforeEach(() => {
    cleanup();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("kennzeichnet vergebene Leases im Ergebnis als simulierte Vergabe", () => {
    const dhcp = buildNetworkTopologyFromLab(LABS.find((l) => l.id === "dhcp")!, CURATED_TOPOLOGIES.dhcp, "target").topology;
    render(<SimulationDock topology={dhcp} isOpen onClose={vi.fn()} activeHopIndex={null} onSelectHop={vi.fn()} />);
    fireEvent.click(screen.getByText("Ping senden"));
    const note = screen.getByTestId("simulated-leases");
    expect(note.textContent).toMatch(/Simulierte DHCP-Vergabe/);
    expect(note.textContent).toMatch(/PC0 192\.168\.1\.11\/24/);
  });
});

describe("SimulationDock: NAT-Translation-Tabelle", () => {
  beforeEach(() => {
    cleanup();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("zeigt die Tabelle nach einem PAT-Ping, reicht sie an den nächsten Ping weiter und leert sie per clear", () => {
    const nat = buildNetworkTopologyFromLab(LABS.find((l) => l.id === "nat-pat")!, CURATED_TOPOLOGIES["nat-pat"], "target").topology;
    const pc0 = nat.devices.find((d) => d.name === "PC0")!;
    render(<SimulationDock topology={nat} isOpen onClose={vi.fn()} activeHopIndex={null} onSelectHop={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Quelle:"), { target: { value: pc0.id } });
    fireEvent.click(screen.getByText("IP"));
    fireEvent.change(screen.getByLabelText("Ziel-IP eingeben"), { target: { value: "47.11.8.15" } });
    fireEvent.click(screen.getByText("Ping senden"));
    expect(screen.getByTestId("nat-translations").textContent).toMatch(/icmp \S+:1\s+192\.168\.1\.10:1\s+47\.11\.8\.15:1\s+47\.11\.8\.15:1/);

    fireEvent.click(screen.getByText("Ping senden"));
    expect(Object.values(lastCall().natTranslations ?? {}).flat()).toHaveLength(1);

    fireEvent.click(screen.getByText("clear ip nat translation *"));
    expect(screen.queryByTestId("nat-translations")).toBeNull();
  });
});

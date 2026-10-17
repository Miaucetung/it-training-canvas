// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { SvgTopologyRenderer } from "@/components/canvas-v2/SvgTopologyRenderer";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";

const topology = buildNetworkTopologyFromLab(LABS.find((l) => l.id === "nat-pat")!, CURATED_TOPOLOGIES["nat-pat"], "target").topology;
const center = (id: string) => {
  const d = topology.devices.find((x) => x.id === id)!;
  return [d.x + (d.width || 80) / 2, d.y + (d.height || 60) / 2];
};

beforeEach(() => {
  cleanup();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

describe("Pfad-Hervorhebung und Paketanimation", () => {
  it("hebt alle beteiligten Geräte und Links dauerhaft hervor, ohne Pfad nichts", () => {
    const link = topology.links[0];
    const withPath = render(
      <SvgTopologyRenderer topology={topology} simulationPathDeviceIds={[link.sourceDeviceId, link.targetDeviceId]} simulationPathLinkIds={[link.id]} />,
    );
    expect(withPath.getAllByTestId("simulation-path-device")).toHaveLength(2);
    expect(withPath.getAllByTestId("simulation-path-link")).toHaveLength(1);
    cleanup();
    const without = render(<SvgTopologyRenderer topology={topology} />);
    expect(without.queryAllByTestId("simulation-path-device")).toHaveLength(0);
    expect(without.queryAllByTestId("simulation-path-link")).toHaveLength(0);
  });

  it("das Paket läuft vom sendenden Gerät zum anderen Ende des aktiven Links", () => {
    const link = topology.links[0];
    const startOf = (from: string) => {
      const { container, unmount } = render(
        <SvgTopologyRenderer topology={topology} activeSimulationLinkId={link.id} activeSimulationFromDeviceId={from} simulationPathLinkIds={[link.id]} />,
      );
      const path = container.getElementsByTagName("animateMotion")[0].getAttribute("path")!;
      unmount();
      return path.split(" ").slice(1, 3).map(Number);
    };
    expect(startOf(link.sourceDeviceId)).toEqual(center(link.sourceDeviceId));
    expect(startOf(link.targetDeviceId)).toEqual(center(link.targetDeviceId));
  });
});

describe("Beschriftungen außerhalb der Schaltflächen (Label in Name)", () => {
  it("Gerät und Link: role=button enthält keinen sichtbaren Text; Beschriftung ist dekorativ und löst dieselbe Aktion aus", () => {
    const onDeviceClick = vi.fn();
    const onLinkClick = vi.fn();
    const { container } = render(<SvgTopologyRenderer topology={topology} onDeviceClick={onDeviceClick} onLinkClick={onLinkClick} />);
    for (const btn of container.querySelectorAll('[role="button"]')) {
      expect(btn.querySelector("text"), btn.getAttribute("aria-label") ?? "").toBeNull();
    }
    const labels = container.querySelector(".topology-device-labels")!;
    expect(labels.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(labels);
    expect(onDeviceClick).toHaveBeenCalledTimes(1);
    fireEvent.click(container.querySelector(".topology-link-labels")!);
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import fs from "node:fs";
import { SimulationDock } from "@/components/canvas-v2/SimulationDock";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { analyzeFailover } from "@/lib/topology/failover";
import type { NetworkTopology } from "@/types/topology";

const nat = (): NetworkTopology => buildNetworkTopologyFromLab(LABS.find((l) => l.id === "nat-pat")!, CURATED_TOPOLOGIES["nat-pat"], "target").topology;
const activate = (el: HTMLElement) => {
  fireEvent.mouseDown(el, { button: 0 });
  fireEvent.click(el);
};
const base = { isOpen: true, onClose: vi.fn(), activeHopIndex: null, onSelectHop: vi.fn() };
const aside = () => screen.getByRole("complementary", { name: /Netzwerksimulation/ });

function pingPc0ToWeb(topology: NetworkTopology) {
  fireEvent.change(screen.getByLabelText("Quelle:"), { target: { value: topology.devices.find((d) => d.name === "PC0")!.id } });
  activate(screen.getByRole("button", { name: "IP" }));
  fireEvent.change(screen.getByLabelText("Ziel-IP eingeben"), { target: { value: "47.11.8.15" } });
  fireEvent.click(screen.getByRole("button", { name: "Ping senden" }));
}

beforeEach(() => {
  cleanup();
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

describe("Simulation: Reiter und Vorschau-Hinweis", () => {
  it("bietet die Reiter Ping, Ausfall und Konvergenz; Ping ist vorgewählt", () => {
    render(<SimulationDock topology={nat()} {...base} />);
    const tabs = screen.getAllByRole("tab").map((t) => t.textContent);
    expect(tabs).toEqual(["Ping", "Ausfall", "Konvergenz"]);
    expect(screen.getByRole("tab", { name: "Ping" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("simulation-preview-note").textContent).toBe("Vorschau · noch nicht simuliert: RIP, IPv6-Ping, IPsec, DHCP-Relay");
  });

  it("wechselt auf Anforderung von außen in den Reiter Ausfall und zeigt den Vergleich", () => {
    const t = nat();
    const analysis = analyzeFailover(t, [{ kind: "link-down", linkId: t.links[0].id }]);
    render(<SimulationDock topology={t} {...base} failoverAnalysis={analysis} requestedTab={{ tab: "ausfall", nonce: 1 }} />);
    expect(screen.getByRole("tab", { name: /Ausfall/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("failover-title").textContent).toMatch(/getrennt/);
    expect(screen.getByTestId("failover-endstate-note")).toBeTruthy();
  });

  it("Konvergenz: Hinweis, dass Pings mit dem Endzustand rechnen", () => {
    const t = nat();
    const analysis = analyzeFailover(t, [{ kind: "link-down", linkId: t.links[0].id }]);
    render(<SimulationDock topology={t} {...base} failoverAnalysis={analysis} requestedTab={{ tab: "konvergenz", nonce: 1 }} />);
    expect(screen.getByTestId("convergence-endstate-note").textContent).toMatch(/Endzustand.*nicht simuliert/);
  });
});

describe("Simulation: Seitenleiste und Bottom Sheet über CSS-Variablen", () => {
  it("Höhenstufen setzen die Variable --sim-h aus den Layout-Variablen", () => {
    render(<SimulationDock topology={nat()} {...base} />);
    const style = () => aside().getAttribute("style") ?? "";
    expect(style()).toContain("--sim-h: var(--sim-sheet-half)");
    fireEvent.click(screen.getByRole("button", { name: "Eingeklappt" }));
    expect(style()).toContain("--sim-h: var(--sim-sheet-collapsed)");
    expect(screen.queryByRole("tablist")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Volle Höhe" }));
    expect(style()).toContain("--sim-h: var(--sim-sheet-full)");
    expect(aside().className).toContain("max-md:absolute");
    expect(screen.getByRole("button", { name: "Volle Höhe" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("Desktop: Seitenleiste ein- und ausklappbar (Rail-Breite aus Variable)", () => {
    render(<SimulationDock topology={nat()} {...base} />);
    expect(aside().className).toContain("md:w-[var(--sim-sidebar-width)]");
    fireEvent.click(screen.getByRole("button", { name: "Seitenleiste einklappen" }));
    expect(aside().className).toContain("md:w-[var(--sim-sidebar-rail)]");
    fireEvent.click(screen.getByRole("button", { name: "Seitenleiste ausklappen" }));
    expect(aside().className).toContain("md:w-[var(--sim-sidebar-width)]");
  });

  it("die Layout-Variablen sind in main.css definiert und im Dock nicht fest verdrahtet", () => {
    const css = fs.readFileSync("src/main.css", "utf8");
    for (const v of ["--sim-sidebar-width", "--sim-sidebar-rail", "--sim-sheet-collapsed", "--sim-sheet-half", "--sim-sheet-full"]) {
      expect(css, v).toContain(`${v}:`);
    }
    const dock = fs.readFileSync("src/components/canvas-v2/SimulationDock.tsx", "utf8");
    expect(dock).not.toMatch(/(?:h|w|max-h|min-h)-\[\d+(?:px|vh|rem)\]/);
  });

  it("Container steuert die Stufe: onStageChange wird gemeldet, die Anzeige folgt der Prop", () => {
    const onStageChange = vi.fn();
    render(<SimulationDock topology={nat()} {...base} stage="half" onStageChange={onStageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Volle Höhe" }));
    expect(onStageChange).toHaveBeenCalledWith("full");
    expect(aside().getAttribute("style")).toContain("--sim-h: var(--sim-sheet-half)");
  });
});

describe("Simulation: Ping-Ergebnis und Hop-Tabelle", () => {
  it("Ergebnis offen, NAT-Tabelle eingeklappt; Hinweg und Rückweg als Zwischenzeilen", () => {
    const t = nat();
    render(<SimulationDock topology={t} {...base} />);
    pingPc0ToWeb(t);
    expect(screen.getByText(/Gesamtzahl Hops: 22 \(Hinweg: 11, Rückweg: 11\)/)).toBeTruthy();
    const details = document.querySelector("details")!;
    expect(details.hasAttribute("open")).toBe(false);
    expect(within(details).getByText("NAT-Translation-Tabelle (Simulationszustand)")).toBeTruthy();
    const table = screen.getByRole("table", { name: /Hop-Tabelle/ });
    expect(within(table).getByText("Hinweg (Request)")).toBeTruthy();
    expect(within(table).getByText("Rückweg (Reply)")).toBeTruthy();
  });

  it("Kopfzeile fixiert und deckend; aktuelle Zeile hervorgehoben (aria-current)", () => {
    const t = nat();
    render(<SimulationDock topology={t} {...base} activeHopIndex={2} />);
    pingPc0ToWeb(t);
    const table = screen.getByRole("table", { name: /Hop-Tabelle/ });
    const thead = table.querySelector("thead")!;
    expect(thead.className).toContain("sticky");
    expect(thead.className).toContain("top-0");
    expect(thead.className).toMatch(/\bbg-muted(?![/\w-])/);
    const current = table.querySelectorAll('tr[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute("data-hop-index")).toBe("2");
    expect(screen.getByRole("region", { name: "Hop-Tabelle, scrollbar" }).className).toContain("md:overflow-y-auto");
  });

  it("meldet beteiligte Geräte und Links als Pfad (zum Einpassen und Hervorheben)", () => {
    const onPathChange = vi.fn();
    const t = nat();
    render(<SimulationDock topology={t} {...base} onPathChange={onPathChange} />);
    pingPc0ToWeb(t);
    const calls = onPathChange.mock.calls;
    const path = calls[calls.length - 1][0] as { deviceIds: string[]; linkIds: string[] };
    const names = path.deviceIds.map((id) => t.devices.find((d) => d.id === id)!.name);
    expect(names).toEqual(expect.arrayContaining(["PC0", "SW1", "NAT-Router", "ISP", "INTERNET", "Webserver"]));
    expect(path.linkIds.length).toBeGreaterThanOrEqual(5);
    for (const id of path.linkIds) expect(t.links.some((l) => l.id === id)).toBe(true);
  });

  it("meldet beim Hop-Wechsel auch das sendende Gerät (Richtung der Paketanimation)", () => {
    const onSelectHop = vi.fn();
    const t = nat();
    render(<SimulationDock topology={t} {...base} onSelectHop={onSelectHop} />);
    pingPc0ToWeb(t);
    const call = onSelectHop.mock.calls.find((c) => c[0] === 0)!;
    expect(call[3]).toBe(call[1]);
  });
});

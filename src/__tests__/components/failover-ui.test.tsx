// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { LinkContextMenu } from "@/components/canvas-v2/LinkContextMenu";
import { ConvergenceView, FailoverChangesView } from "@/components/canvas-v2/FailoverTabs";
import { CanvasV2Container } from "@/components/canvas-v2/CanvasV2Container";
import { analyzeFailover } from "@/lib/topology/failover";
import type { NetworkTopology, TopologyLink } from "@/types/topology";

const stp = (): NetworkTopology => buildNetworkTopologyFromLab(LABS.find((l) => l.id === "stp")!, CURATED_TOPOLOGIES.stp, "target").topology;
const rootLink = (t: NetworkTopology): TopologyLink => {
  const sw2 = t.devices.find((d) => d.name === "SW2")!;
  const gi01 = sw2.interfaces.find((i) => i.name === "Gi0/1")!;
  return t.links.find((l) => (l.sourceDeviceId === sw2.id && l.sourceInterfaceId === gi01.id) || (l.targetDeviceId === sw2.id && l.targetInterfaceId === gi01.id))!;
};

beforeEach(() => {
  cleanup();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("LinkContextMenu", () => {
  it("bietet trennen und shutdown je Ende an; Auswahl liefert die Aktion", () => {
    const t = stp();
    const link = rootLink(t);
    const onAction = vi.fn();
    render(<LinkContextMenu link={link} topology={t} x={10} y={10} onAction={onAction} onDelete={vi.fn()} onClose={vi.fn()} />);
    const labels = screen.getAllByRole("menuitem").map((b) => b.textContent);
    expect(labels).toEqual(["Verbindung trennen", "SW1 Gi0/1: shutdown", "SW2 Gi0/1: shutdown", "Verbindung löschen (Entf)"]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Verbindung trennen" }));
    expect(onAction).toHaveBeenCalledWith({ kind: "link-down", linkId: link.id });
  });

  it("Tastatur: erster Eintrag fokussiert, Pfeiltasten wechseln, Escape schließt", () => {
    const t = stp();
    const onClose = vi.fn();
    render(<LinkContextMenu link={rootLink(t)} topology={t} x={10} y={10} onAction={vi.fn()} onDelete={vi.fn()} onClose={onClose} />);
    const items = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });
    expect(document.activeElement).toBe(items[items.length - 1]);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("getrennte Verbindung: Eintrag „wiederherstellen“", () => {
    const t = stp();
    const link = { ...rootLink(t), status: "down" as const };
    render(<LinkContextMenu link={link} topology={t} x={10} y={10} onAction={vi.fn()} onDelete={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getAllByRole("menuitem")[0].textContent).toBe("Verbindung wiederherstellen");
  });
});

describe("Ausfall- und Konvergenz-Ansicht", () => {
  it("Ausfall: Vorher/Nachher je Änderung, Hinweis auf den Endzustand der Pings", () => {
    const t = stp();
    const analysis = analyzeFailover(t, [{ kind: "link-down", linkId: rootLink(t).id }]);
    render(<FailoverChangesView analysis={analysis} />);
    expect(screen.getByTestId("failover-endstate-note").textContent).toMatch(/Endzustand/);
    expect(screen.getByTestId("failover-endstate-note").textContent).toMatch(/Konvergenzzeit/);
    const port = screen.getAllByTestId("failover-change").find((li) => /SW2 Gi0\/2/.test(li.textContent ?? ""))!;
    expect(port.textContent).toMatch(/vorher: Altn BLK 4/);
    expect(port.textContent).toMatch(/nachher: Root FWD 4/);
  });

  it("Ausfall ohne Aktion: Hinweis, wie eine Aktion ausgelöst wird", () => {
    render(<FailoverChangesView analysis={null} />);
    expect(screen.getByText("Noch keine Ausfall-Aktion")).toBeTruthy();
  });

  it("Konvergenz: realistische Zeiten mit 30 s, ausstehend bis zum Endzustand; Modell- und Endzustands-Hinweis", () => {
    const t = stp();
    const analysis = analyzeFailover(t, [{ kind: "link-down", linkId: rootLink(t).id }]);
    const { rerender } = render(<ConvergenceView analysis={analysis} mode="sofort" onModeChange={vi.fn()} />);
    expect(screen.getByTestId("failover-model-note").textContent).toMatch(/Vereinfachtes Modell/);
    expect(screen.getByTestId("convergence-endstate-note").textContent).toMatch(/Endzustand/);

    rerender(<ConvergenceView analysis={analysis} mode="realistisch" onModeChange={vi.fn()} />);
    const port = screen.getAllByTestId("failover-change").find((li) => /SW2 Gi0\/2/.test(li.textContent ?? ""))!;
    expect(port.textContent).toMatch(/t = 30 s · ausstehend/);
    expect(port.textContent).toMatch(/2 × Forward Delay/);
    fireEvent.click(screen.getByText("Endzustand"));
    expect(screen.getByText("Konvergiert nach 30 s.")).toBeTruthy();
    expect(screen.getAllByTestId("failover-change").find((li) => /SW2 Gi0\/2/.test(li.textContent ?? ""))!.textContent).toMatch(/wirksam/);
  });

  it("Modus-Umschalter meldet den gewählten Modus", () => {
    const t = stp();
    const onModeChange = vi.fn();
    render(<ConvergenceView analysis={analyzeFailover(t, [{ kind: "link-down", linkId: rootLink(t).id }])} mode="sofort" onModeChange={onModeChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "realistische Zeiten" }));
    expect(onModeChange).toHaveBeenCalledWith("realistisch");
  });
});

describe("Canvas: Verbindung per Kontextmenü trennen", () => {
  it("Rechtsklick auf den Link → trennen → Link down und Ausfall-Analyse sichtbar", () => {
    const t = stp();
    const { container } = render(<CanvasV2Container initialTopology={t} />);
    const linkEl = container.querySelector(`[data-link-id="${rootLink(t).id}"]`)!;
    fireEvent.contextMenu(linkEl);
    fireEvent.click(screen.getByRole("menuitem", { name: "Verbindung trennen" }));
    const sidebar = screen.getByRole("complementary", { name: /Netzwerksimulation/ });
    expect(within(sidebar).getByRole("tab", { name: /Ausfall/ }).getAttribute("aria-selected")).toBe("true");
    expect(within(sidebar).getByTestId("failover-title").textContent).toMatch(/Verbindung SW1 Gi0\/1 – SW2 Gi0\/1 getrennt/);
    expect(container.querySelector(`[data-link-id="${rootLink(t).id}"]`)!.getAttribute("aria-label")).toMatch(/Status Down/);
  });

  it("Tastatur: Link auswählen, Shift+F10 öffnet das Menü, shutdown per Enter", () => {
    const t = stp();
    const { container } = render(<CanvasV2Container initialTopology={t} />);
    const linkEl = container.querySelector(`[data-link-id="${rootLink(t).id}"]`) as HTMLElement;
    fireEvent.keyDown(linkEl, { key: "Enter" });
    fireEvent.keyDown(linkEl, { key: "F10", shiftKey: true });
    const item = screen.getByRole("menuitem", { name: "SW2 Gi0/1: shutdown" });
    fireEvent.click(item);
    expect(screen.getByTestId("failover-title").textContent).toBe("SW2 Gi0/1: shutdown");
  });
});

describe("Canvas: Layout bei geöffneter Simulation", () => {
  it("Landmarks: main mit Name und genau eine Überschrift der Ebene 1", () => {
    render(<CanvasV2Container initialTopology={stp()} />);
    expect(screen.getByRole("main", { name: "Topologie-Canvas" })).toBeTruthy();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("Geräte-Palette und Zeichenwerkzeuge verschwinden, die Topbar bleibt einzeilig; nach dem Schließen ist alles wieder da", () => {
    const { container } = render(<CanvasV2Container initialTopology={stp()} />);
    const palette = () => container.querySelector('button[title*="Haftnotiz"]');
    const toggle = () => screen.getByRole("button", { name: "Simulation öffnen oder schließen" });
    const topbar = () => container.querySelector("#topology-selector")!.closest(".border-b") as HTMLElement;
    expect(palette()).toBeTruthy();
    expect(topbar().className).toContain("flex-wrap");

    fireEvent.click(toggle());
    expect(palette()).toBeNull();
    expect(topbar().className).toContain("flex-nowrap");
    expect(topbar().className).not.toContain("flex-wrap");
    expect(screen.getByRole("complementary", { name: /Netzwerksimulation/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Simulation schließen" }));
    expect(palette()).toBeTruthy();
    expect(screen.queryByRole("complementary", { name: /Netzwerksimulation/ })).toBeNull();
  });

  it("Seitenleiste/Sheet liegt im Layout-Fluss neben dem Canvas (kein fixed-Overlay)", () => {
    const { container } = render(<CanvasV2Container initialTopology={stp()} />);
    fireEvent.click(screen.getByRole("button", { name: "Simulation öffnen oder schließen" }));
    const aside = screen.getByRole("complementary", { name: /Netzwerksimulation/ });
    expect(aside.className.split(" ")).not.toContain("fixed");
    const row = aside.parentElement!;
    expect(row.className).toContain("md:flex-row");
    expect(row.querySelector("[class*='cursor-grab']")).toBeTruthy();
    expect(container.querySelector("main")!.contains(aside)).toBe(true);
  });
});

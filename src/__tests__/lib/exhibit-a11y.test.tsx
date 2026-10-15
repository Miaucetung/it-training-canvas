import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";
import { TopologyExhibit } from "@/components/exhibits/TopologyExhibit";
import { WirelessZonesExhibit } from "@/components/exhibits/WirelessZonesExhibit";
import { CLIExhibit } from "@/components/exhibits/CLIExhibit";
import { topologyAriaLabel, wirelessZonesAriaLabel } from "@/lib/exhibit-a11y";
import type { ExhibitData, TopologyExhibit as TopologyData, WirelessZonesExhibit as ZonesData } from "@/types/exhibit";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const exhibitsOf = (list: Array<{ exhibit: unknown }>): ExhibitData[] =>
  list.flatMap((q) => (Array.isArray(q.exhibit) ? q.exhibit : q.exhibit && typeof q.exhibit === "object" ? [q.exhibit] : [])) as ExhibitData[];

describe("Namen der Exhibit-Grafiken (nur aus den Daten)", () => {
  it("Topologie: Gerätenamen und Zahl der Verbindungen", () => {
    const e: TopologyData = {
      type: "topology",
      devices: [
        { id: "r1", type: "router", label: "R1", x: 0, y: 0 },
        { id: "sw1", type: "switch", label: "SW1", x: 1, y: 1 },
        { id: "pc1", type: "pc", label: "PC1", x: 2, y: 2 },
      ],
      links: [
        { from: "r1", to: "sw1" },
        { from: "sw1", to: "pc1" },
        { from: "r1", to: "pc1" },
      ],
    };
    expect(topologyAriaLabel(e)).toBe("Topologie: R1, SW1, PC1, 3 Verbindungen");
    expect(topologyAriaLabel({ ...e, links: [e.links[0]] })).toBe("Topologie: R1, SW1, PC1, 1 Verbindung");
    expect(topologyAriaLabel({ ...e, links: [] })).toBe("Topologie: R1, SW1, PC1, 0 Verbindungen");
  });

  it("Gerätenamen mit Zeilenumbruch werden nur im Leerraum vereinheitlicht", () => {
    expect(topologyAriaLabel({ devices: [{ id: "a", type: "router", label: "R3\n(1.1.1.3)", x: 0, y: 0 }], links: [] })).toBe("Topologie: R3 (1.1.1.3), 0 Verbindungen");
  });

  it("alle Topologie-Exhibits beider Pools: role=\"img\" mit Namen, der exakt aus Gerätenamen und Verbindungszahl besteht", () => {
    const all = [...exhibitsOf(ccnaQuestions), ...exhibitsOf(ccnaQuestionsClassified)].filter((e): e is TopologyData => e.type === "topology" && e.devices.length > 0);
    expect(all.length).toBeGreaterThan(100);
    for (const e of all) {
      const html = renderToStaticMarkup(<TopologyExhibit exhibit={e} />);
      const label = topologyAriaLabel(e);
      expect(html, label).toContain(`role="img" aria-label="${esc(label)}"`);
      const expected = `Topologie: ${[...e.devices.map((d) => d.label.replace(/\s+/g, " ").trim()), `${e.links.length} ${e.links.length === 1 ? "Verbindung" : "Verbindungen"}`].join(", ")}`;
      expect(label).toBe(expected);
    }
  });

  it("Funkzonen-Grafik: Zonennamen und Kanäle, am SVG gesetzt", () => {
    const e: ZonesData = {
      type: "wireless-zones",
      zones: [
        { id: "a", label: "AP1", channel: 1, x: 0, y: 0 },
        { id: "b", label: "AP2", channel: 6, x: 10, y: 0 },
        { id: "c", label: "AP3", channel: 1, x: 20, y: 0 },
      ],
    };
    expect(wirelessZonesAriaLabel(e)).toBe("Funkzonen: AP1, AP2, AP3, Kanal 1, 6");
    expect(renderToStaticMarkup(<WirelessZonesExhibit exhibit={e} />)).toContain('role="img" aria-label="Funkzonen: AP1, AP2, AP3, Kanal 1, 6"');
  });

  it("CLI-Exhibit: Prompt-Zeilen sind heller als vorher (Kontrast), sonstige Zeilenfarben unverändert", () => {
    const html = renderToStaticMarkup(<CLIExhibit exhibit={{ type: "cli", content: "Router(config)#interface Gi0/0\nC 10.0.0.0/24 is directly connected\nplain" }} />);
    expect(html).toContain("text-gray-400");
    expect(html).not.toContain("text-gray-500");
    expect(html).toContain("text-green-400");
    expect(html).toContain("text-gray-200");
  });
});

describe("Scrollbare Exhibit-Bereiche sind per Tastatur erreichbar (axe: scrollable-region-focusable)", () => {
  it("CLI-Exhibit: Region mit Namen und tabindex 0", () => {
    const html = renderToStaticMarkup(<CLIExhibit exhibit={{ type: "cli", content: "x" }} />);
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="CLI-Ausgabe"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("overflow-x-auto");
  });

  it("Tabellen-Exhibit: Container der Tabelle ist Region mit Namen und tabindex 0, Inhalt unverändert", async () => {
    const { TableExhibit } = await import("@/components/exhibits/TableExhibit");
    const html = renderToStaticMarkup(<TableExhibit exhibit={{ type: "table", headers: ["A", "B"], rows: [["1", "2"]] }} />);
    expect(html).toMatch(/<div data-slot="table-container"[^>]*role="region"[^>]*aria-label="Tabelle"[^>]*tabindex="0"/);
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain(">A<");
    expect(html).toContain(">2<");
  });

  it("andere Tabellen der App behalten den Container unverändert (ohne containerProps)", async () => {
    const { Table } = await import("@/components/ui/table");
    const html = renderToStaticMarkup(
      <Table>
        <tbody />
      </Table>
    );
    expect(html).toContain('<div data-slot="table-container" class="relative w-full overflow-x-auto">');
    expect(html).not.toContain("tabindex");
  });
});

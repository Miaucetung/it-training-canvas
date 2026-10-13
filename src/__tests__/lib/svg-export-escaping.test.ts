// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { buildCanvasSvg } from "@/lib/canvas-utils";
import { escapeXml, sanitizeSvgFragment } from "@/lib/escape";
import type { DrawingObject } from "@/lib/types";

const base = { id: "t1", color: "#112233", width: 2 };

function textObj(text: string, extra: Partial<DrawingObject> = {}): DrawingObject {
  return { ...base, type: "text", startPoint: { x: 10, y: 20 }, text, fontSize: 16, ...extra } as DrawingObject;
}

function parse(svg: string) {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  expect(doc.getElementsByTagName("parsererror").length).toBe(0);
  return doc;
}

describe("SVG-Export: Escaping (B-04)", () => {
  it("escaped Sonderzeichen im Text und liefert gültiges XML", () => {
    const svg = buildCanvasSvg([textObj(`R1 & R2 < "X" > 'Y'`)], 800, 600);
    expect(svg).toContain("R1 &amp; R2 &lt; &quot;X&quot; &gt; &#39;Y&#39;");
    const doc = parse(svg);
    expect(doc.querySelector("text")?.textContent).toBe(`R1 & R2 < "X" > 'Y'`);
  });

  it("führt <script>-artigen Text nicht als Element aus", () => {
    const svg = buildCanvasSvg([textObj(`</text><script>alert(1)</script><text>`)], 800, 600);
    const doc = parse(svg);
    expect(doc.querySelectorAll("script").length).toBe(0);
    expect(doc.querySelectorAll("text").length).toBe(1);
  });

  it("verwirft Attribut-Injektion über Farbe, Schrift und Zahlen", () => {
    const evil = `red" onload="alert(1)`;
    const svg = buildCanvasSvg(
      [
        textObj("x", { color: evil, fontFamily: `a" onclick="alert(1)` as never }),
        { ...base, type: "rectangle", color: evil, startPoint: { x: "1\" onload=\"x" as never, y: 0 }, endPoint: { x: 5, y: 5 } } as DrawingObject,
      ],
      800,
      600,
      evil,
    );
    const doc = parse(svg);
    doc.querySelectorAll("*").forEach((el) => {
      for (const a of Array.from(el.attributes)) expect(a.name.startsWith("on")).toBe(false);
    });
    expect(svg).not.toContain("onload");
  });

  it("bereinigt Shape-SVG (script, Event-Handler, javascript:)", () => {
    const shape = {
      ...base,
      type: "shape",
      startPoint: { x: 0, y: 0 },
      svgPath: `<path d="M0 0" onclick="alert(1)"/><script>alert(2)</script><a href="javascript:alert(3)"><circle r="2"/></a>`,
    } as DrawingObject;
    const svg = buildCanvasSvg([shape], 100, 100);
    const doc = parse(svg);
    expect(doc.querySelectorAll("script").length).toBe(0);
    expect(svg).not.toMatch(/onclick|javascript:/i);
    expect(doc.querySelector("path")).not.toBeNull();
  });

  it("sanitizeSvgFragment verwirft kaputtes Markup", () => {
    expect(sanitizeSvgFragment("<path")).toBe("");
  });

  it("escapeXml behandelt null/undefined", () => {
    expect(escapeXml(undefined)).toBe("");
    expect(escapeXml(null)).toBe("");
  });
});

import { describe, it, expect } from "vitest";
import { computeFitTransform } from "@/lib/topology/fit-view";

describe("computeFitTransform", () => {
  it("zentriert ein Rechteck im Viewport und begrenzt den Zoom", () => {
    const fit = computeFitTransform({ minX: 100, maxX: 300, minY: 50, maxY: 150 }, { width: 800, height: 600 }, { minScale: 0.25 });
    expect(fit.scale).toBe(1.5);
    expect(200 * fit.scale + fit.translateX).toBeCloseTo(400);
    expect(100 * fit.scale + fit.translateY).toBeCloseTo(300);
  });

  it("verkleinert große Inhalte so, dass sie mit Rand in den Viewport passen", () => {
    const fit = computeFitTransform({ minX: 0, maxX: 2000, minY: 0, maxY: 1000 }, { width: 1000, height: 800 }, { minScale: 0.25 });
    expect(fit.scale).toBeCloseTo((1000 / 2120) * 0.9);
    expect(1000 * fit.scale + fit.translateX).toBeCloseTo(500);
  });

  it("unterschreitet den Mindestzoom nicht", () => {
    const fit = computeFitTransform({ minX: 0, maxX: 100000, minY: 0, maxY: 100 }, { width: 300, height: 300 }, { minScale: 0.25 });
    expect(fit.scale).toBe(0.25);
  });
});

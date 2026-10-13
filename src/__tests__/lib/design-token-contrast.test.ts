import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  const open = css.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < css.length; end++) {
    if (css[end] === "{") depth++;
    if (css[end] === "}" && --depth === 0) break;
  }
  return css.slice(open + 1, end);
}

function tokens(b: string): Record<string, string> {
  return Object.fromEntries([...b.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const light = tokens(block(":root"));
const dark = { ...light, ...tokens(block(".dark")) };

const rgb = (h: string): [number, number, number] => {
  expect(h, `kein Hex-Wert: ${h}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};
const lum = ([r, g, b]: number[]) => {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe("Design-Token-Kontraste (B-07)", () => {
  for (const [name, map] of [
    ["light", light],
    ["dark", dark],
  ] as const) {
    const solids = Object.keys(map).filter((k) => k.endsWith("-solid") && !k.startsWith("on-"));

    it(`${name}: jeder on-*-solid hat >= 4,5 : 1 auf seinem *-solid`, () => {
      expect(solids.length).toBeGreaterThan(0);
      for (const k of solids) {
        expect(ratio(map["on-" + k], map[k]), `${name} on-${k}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it("light: text-muted erreicht 4,5 : 1 auf surface, app-bg und surface-elevated", () => {
    for (const bg of ["surface", "app-bg", "surface-elevated"]) {
      expect(ratio(light["text-muted"], light[bg]), bg).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("dark: text-muted erreicht 4,5 : 1 auf surface und app-bg", () => {
    for (const bg of ["surface", "app-bg"]) {
      expect(ratio(dark["text-muted"], dark[bg]), bg).toBeGreaterThanOrEqual(4.5);
    }
  });
});

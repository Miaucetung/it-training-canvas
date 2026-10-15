import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ALLOWED_ALWAYS_DARK,
  BASELINE_PATH,
  countHardcodedColors,
  diffAgainstBaseline,
  type ColorBaseline,
} from "../helpers/hardcoded-colors";

const root = process.cwd();
const baselineFile = path.join(root, BASELINE_PATH);
const current = countHardcodedColors(root);

const NOTE =
  "Anzahl fest eingetragener Tailwind-Farbklassen (text/bg/from/via/to mit Palette, white/black, Hex) je Datei. " +
  "Nur über `npm run baseline:colors:update` ändern.";

const format = (lines: string[]) => lines.map((l) => `  - ${l}`).join("\n");

describe("Sperrklinke: feste Farbklassen", () => {
  if (process.env.UPDATE_COLOR_BASELINE === "1") {
    it("schreibt die Baseline neu (npm run baseline:colors:update)", () => {
      const old: ColorBaseline | null = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, "utf8")) : null;
      if (old && process.env.ALLOW_COLOR_INCREASE !== "1") {
        const d = diffAgainstBaseline(old.files, current);
        const worse = [
          ...d.increased.map((x) => `${x.file}: ${x.baseline} -> ${x.current}`),
          ...d.added.map((x) => `${x.file}: neu mit ${x.current}`),
        ];
        if (worse.length > 0) {
          throw new Error(
            `Baseline wird nicht erhöht. Stellen auf Design-Tokens umstellen oder bewusst mit --allow-increase aktualisieren:\n${format(worse)}`,
          );
        }
      }
      const next: ColorBaseline = { version: 1, note: NOTE, files: current };
      fs.writeFileSync(baselineFile, JSON.stringify(next, null, 1) + "\n", "utf8");
    });
    return;
  }

  const baseline: ColorBaseline = JSON.parse(fs.readFileSync(baselineFile, "utf8"));
  const diff = diffAgainstBaseline(baseline.files, current);

  it("keine Datei hat mehr feste Farbklassen als in der Baseline, keine neue Datei führt welche ein", () => {
    const worse = [
      ...diff.increased.map((x) => `${x.file}: ${x.baseline} -> ${x.current}`),
      ...diff.added.map((x) => `${x.file}: neu mit ${x.current}`),
    ];
    expect(
      worse,
      `Neue feste Farbklassen. Design-Tokens verwenden (text-foreground, text-muted-foreground, bg-card, bg-muted, border-border, ` +
        `text-accent-primary-fg, bg-status-*-bg/-fg …):\n${format(worse)}`,
    ).toEqual([]);
  });

  it("Baseline ist aktuell: gesunkene Zahlen werden bewusst nachgezogen", () => {
    const better = [
      ...diff.decreased.map((x) => `${x.file}: ${x.baseline} -> ${x.current}`),
      ...diff.removed.map((x) => `${x.file}: ${x.baseline} -> 0`),
    ];
    expect(better, `Baseline mit "npm run baseline:colors:update" nachziehen:\n${format(better)}`).toEqual([]);
  });

  it("erlaubte Ausnahmen sind benannt, existieren und stehen nicht in der Baseline", () => {
    for (const [file, reason] of Object.entries(ALLOWED_ALWAYS_DARK)) {
      expect(reason.length).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(root, file)), file).toBe(true);
      expect(file in baseline.files, file).toBe(false);
    }
  });
});

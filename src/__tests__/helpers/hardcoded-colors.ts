import fs from "node:fs";
import path from "node:path";

/**
 * Fest eingetragene Tailwind-Farbklassen für Text und Flächen (außerhalb der Design-Tokens).
 * Gemeinsame Grundlage für die Sperrklinke (Test) und die Auswertung (scripts/audit/hardcoded-colors.audit.ts).
 */

const PALETTE = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

// Text und Flächen (inkl. Verläufe); Varianten wie dark:, hover:, md: zählen mit
export const COLOR = new RegExp(
  `(?<![\\w-])((?:[a-z0-9\\-\\[\\]\\/&>:_]+:)*)(text|bg|from|via|to)-((?:${PALETTE})-\\d{2,3}|white|black)(?:\\/\\d{1,3})?(?![\\w-])`,
  "g",
);
export const HEX_ARBITRARY = /(?<![\w-])((?:[a-z0-9\-[\]/&>:_]+:)*)(text|bg)-\[#[0-9a-fA-F]{3,8}\]/g;

/**
 * Ausdrücklich erlaubte Ausnahmen: Dateien, die laut CLAUDE.md bewusst immer dunkel sind (Terminal-Konvention,
 * keine helle Variante). Sie werden weder gezählt noch in die Baseline aufgenommen.
 * Terminal-Tokens (`bg-terminal-*`, `text-terminal-*`) sind keine Palettenklassen und werden ohnehin nicht erfasst.
 */
export const ALLOWED_ALWAYS_DARK: Readonly<Record<string, string>> = {
  "src/components/LabScenariosDialog.tsx": "Lab-Dialog: bewusst immer dunkel (Terminal-Konvention)",
  "src/components/exhibits/CLIExhibit.tsx": "CLI-Exhibit: Terminalblock, bewusst immer dunkel",
  "src/components/TerminalEmulator.tsx": "Terminal-Emulator: bewusst immer dunkel",
};

const SKIP_DIRS = new Set(["__tests__", "node_modules"]);

export function walkSources(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkSources(p, out);
    else if (/\.(tsx|ts|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

export function colorClassesOfLine(text: string): string[] {
  const classes: string[] = [];
  for (const m of text.matchAll(COLOR)) classes.push(m[0]);
  for (const m of text.matchAll(HEX_ARBITRARY)) classes.push(m[0]);
  return classes;
}

export const relPath = (root: string, file: string): string => path.relative(root, file).replace(/\\/g, "/");

/** Anzahl fester Farbklassen je Datei (Pfad relativ zum Repo-Root), ohne die erlaubten Ausnahmen. */
export function countHardcodedColors(root: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const f of walkSources(path.join(root, "src"))) {
    const rel = relPath(root, f);
    if (rel in ALLOWED_ALWAYS_DARK) continue;
    let count = 0;
    for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) count += colorClassesOfLine(line).length;
    if (count > 0) result[rel] = count;
  }
  return Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
}

export const BASELINE_PATH = "src/__tests__/fixtures/hardcoded-colors-baseline.json";

export interface ColorBaseline {
  version: number;
  note: string;
  files: Record<string, number>;
}

export interface BaselineDiff {
  increased: Array<{ file: string; baseline: number; current: number }>;
  added: Array<{ file: string; current: number }>;
  decreased: Array<{ file: string; baseline: number; current: number }>;
  removed: Array<{ file: string; baseline: number }>;
}

export function diffAgainstBaseline(baseline: Record<string, number>, current: Record<string, number>): BaselineDiff {
  const diff: BaselineDiff = { increased: [], added: [], decreased: [], removed: [] };
  for (const [file, n] of Object.entries(current)) {
    if (!(file in baseline)) diff.added.push({ file, current: n });
    else if (n > baseline[file]) diff.increased.push({ file, baseline: baseline[file], current: n });
    else if (n < baseline[file]) diff.decreased.push({ file, baseline: baseline[file], current: n });
  }
  for (const [file, n] of Object.entries(baseline)) if (!(file in current)) diff.removed.push({ file, baseline: n });
  return diff;
}

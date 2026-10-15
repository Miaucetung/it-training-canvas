// Ausdrückliche Aktualisierung der Farbklassen-Baseline (npm run baseline:colors:update).
// Ohne --allow-increase wird die Baseline nur gesenkt; Erhöhungen und neue Dateien brechen ab.
import { spawnSync } from "node:child_process";

const allowIncrease = process.argv.includes("--allow-increase");
const r = spawnSync("npx", ["vitest", "run", "src/__tests__/build/hardcoded-colors-ratchet.test.ts"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, UPDATE_COLOR_BASELINE: "1", ...(allowIncrease ? { ALLOW_COLOR_INCREASE: "1" } : {}) },
});
process.exit(r.status ?? 1);

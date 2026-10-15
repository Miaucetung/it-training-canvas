// Ausdrücklicher Aufruf zum Aktualisieren des Inhalts-Snapshots (npm run snapshot:content:update).
import { spawnSync } from "node:child_process";

const r = spawnSync("npx", ["vitest", "run", "-c", "scripts/audit/vitest.audit.config.ts", "scripts/audit/content-snapshot.audit.ts", "--disableConsoleIntercept"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, UPDATE_CONTENT_SNAPSHOT: "1" },
});
process.exit(r.status ?? 1);

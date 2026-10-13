import { defineConfig } from "vitest/config";
import { resolve } from "path";

// Eigene Konfiguration: Audit-Skripte laufen NICHT in `npm test`.
// Aufruf: npx vitest run -c scripts/audit/vitest.audit.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["scripts/audit/**/*.audit.ts"],
    testTimeout: 60000,
  },
  resolve: { alias: { "@": resolve(process.cwd(), "src") } },
});

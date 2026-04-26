import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    environmentMatchGlobs: [
      ['src/__tests__/components/**', 'jsdom'],
    ],
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/lib/content/**/*.ts", "src/content/**/*.ts", "src/lib/gamification/**/*.ts"],
      exclude: ["src/__tests__/**"],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 70,
      },
    },
    isolate: true,
  },
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "src"),
    },
  },
});

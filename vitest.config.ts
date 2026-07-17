import { configDefaults, defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    env: {
      VITE_SUPABASE_URL: "https://shkvdpbclqjnvlcnjufg.supabase.co",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
    environment: "node",
    environmentMatchGlobs: [
      ['src/__tests__/components/**', 'jsdom'],
    ],
    setupFiles: ["./src/__tests__/setup.ts"],
    exclude: [...configDefaults.exclude, "_archive/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/lib/content/**/*.ts", "src/content/**/*.ts"],
      exclude: ["src/__tests__/**"],
      thresholds: {
        lines: 75,
        functions: 50,
        branches: 55,
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

import { describe, it, expect, vi } from "vitest";
import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// Helper — builds a minimal valid module for testing
// ────────────────────────────────────────────────────────────
function makeModule(overrides: Partial<CertificationModule> = {}): CertificationModule {
  return {
    id: "test-module",
    vendor: "generic",
    title: "Test Module",
    subtitle: "subtitle",
    description: "A test module for unit tests",
    difficulty: "beginner",
    estimatedHours: 5,
    topics: [],
    concepts: {},
    quizzes: {},
    exercises: {},
    learningPaths: {},
    metadata: {
      slug: "test-module",
      tagline: "tagline",
      objectives: ["learn testing"],
      targetAudience: ["developers"],
      previewImageUrl: "/test.png",
      priceCents: 0,
      lastUpdated: "2026-01-01",
      certificationBody: "Test Corp",
      featured: false,
      categories: ["test"],
    },
    ...overrides,
  } satisfies CertificationModule;
}

// ────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────

describe("ContentRegistry", () => {
  // setup.ts resets the registry before/after each test via _resetForTesting()

  describe("register()", () => {
    it("registers a module so it can be retrieved immediately", () => {
      const mod = makeModule({ id: "cisco-ccna" });
      contentRegistry.register(mod);
      expect(contentRegistry.isRegistered("cisco-ccna")).toBe(true);
    });

    it("registering a module does not affect other IDs", () => {
      contentRegistry.register(makeModule({ id: "mod-a" }));
      expect(contentRegistry.isRegistered("mod-b")).toBe(false);
    });

    it("logs a warning when the same module ID is registered twice", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const mod = makeModule({ id: "dup-module" });

      contentRegistry.register(mod);
      contentRegistry.register(mod);

      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0]![0]).toContain("dup-module");
      warnSpy.mockRestore();
    });

    it("overwrites the previous registration on duplicate ID", () => {
      const v1 = makeModule({ id: "evolving", title: "Version 1" });
      const v2 = makeModule({ id: "evolving", title: "Version 2" });

      vi.spyOn(console, "warn").mockImplementation(() => {});
      contentRegistry.register(v1);
      contentRegistry.register(v2);

      const retrieved = contentRegistry.getModuleSync("evolving");
      expect(retrieved?.title).toBe("Version 2");
    });
  });

  describe("getModuleSync()", () => {
    it("returns the module when registered", () => {
      const mod = makeModule({ id: "sync-test" });
      contentRegistry.register(mod);

      const result = contentRegistry.getModuleSync("sync-test");
      expect(result).toBeDefined();
      expect(result?.id).toBe("sync-test");
    });

    it("returns undefined for an unknown module ID", () => {
      const result = contentRegistry.getModuleSync("totally-unknown");
      expect(result).toBeUndefined();
    });
  });

  describe("getModule() (async)", () => {
    it("resolves the module when registered", async () => {
      const mod = makeModule({ id: "async-test" });
      contentRegistry.register(mod);

      const result = await contentRegistry.getModule("async-test");
      expect(result.id).toBe("async-test");
    });

    it("rejects with a descriptive error for an unknown module ID", async () => {
      await expect(contentRegistry.getModule("does-not-exist")).rejects.toThrow(
        "does-not-exist",
      );
    });

    it("error message mentions the registry (helpful for debugging)", async () => {
      await expect(contentRegistry.getModule("ghost")).rejects.toThrow(
        /ContentRegistry/,
      );
    });
  });

  describe("listModules()", () => {
    it("returns an empty array when nothing is registered", async () => {
      const mods = await contentRegistry.listModules();
      expect(mods).toHaveLength(0);
    });

    it("returns metadata for every registered module", async () => {
      contentRegistry.register(makeModule({ id: "a" }));
      contentRegistry.register(makeModule({ id: "b" }));

      const mods = await contentRegistry.listModules();
      expect(mods).toHaveLength(2);
    });

    it("returns CourseMetadata objects (not full modules)", async () => {
      contentRegistry.register(makeModule({ id: "meta-test" }));
      const [first] = await contentRegistry.listModules();

      expect(first).toHaveProperty("slug");
      expect(first).toHaveProperty("tagline");
      expect(first).not.toHaveProperty("topics"); // not a full CertificationModule
    });
  });

  describe("getAllModules()", () => {
    it("returns a Map with all registered modules", () => {
      contentRegistry.register(makeModule({ id: "x" }));
      contentRegistry.register(makeModule({ id: "y" }));

      const all = contentRegistry.getAllModules();
      expect(all.size).toBe(2);
      expect(all.has("x")).toBe(true);
      expect(all.has("y")).toBe(true);
    });
  });

  describe("listModulesByVendor()", () => {
    it("filters modules by vendor", () => {
      contentRegistry.register(makeModule({ id: "cisco-1", vendor: "cisco" }));
      contentRegistry.register(makeModule({ id: "cisco-2", vendor: "cisco" }));
      contentRegistry.register(makeModule({ id: "ms-1", vendor: "microsoft" }));

      const ciscoModules = contentRegistry.listModulesByVendor("cisco");
      expect(ciscoModules).toHaveLength(2);
      expect(ciscoModules.every((m) => m.vendor === "cisco")).toBe(true);
    });

    it("returns an empty array if no modules match the vendor", () => {
      contentRegistry.register(makeModule({ id: "cisco-only", vendor: "cisco" }));

      const comptia = contentRegistry.listModulesByVendor("comptia");
      expect(comptia).toHaveLength(0);
    });
  });

  describe("isRegistered()", () => {
    it("returns false before registration", () => {
      expect(contentRegistry.isRegistered("not-yet")).toBe(false);
    });

    it("returns true after registration", () => {
      contentRegistry.register(makeModule({ id: "registered-now" }));
      expect(contentRegistry.isRegistered("registered-now")).toBe(true);
    });
  });
});

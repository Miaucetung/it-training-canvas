import { describe, it, expect } from "vitest";
import { loadModule, listAvailableModuleIds } from "@/lib/content/content-loader";
import { contentRegistry } from "@/lib/content/content-registry";

// NOTE: Each import of ccna/index.ts or az-900/index.ts triggers auto-registration.
// The setup.ts beforeEach/_resetForTesting ensures the registry is clean before each test,
// but the module JS is still cached. loadModule() checks isRegistered() and re-registers
// when the registry is clean.

describe("ContentLoader", () => {
  describe("listAvailableModuleIds()", () => {
    it("includes ccna and az-900", () => {
      const ids = listAvailableModuleIds();
      expect(ids).toContain("ccna");
      expect(ids).toContain("az-900");
    });

    it("returns at least 2 modules", () => {
      expect(listAvailableModuleIds().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("loadModule()", () => {
    it("loads and returns the ccna module", async () => {
      const mod = await loadModule("ccna");
      expect(mod.id).toBe("ccna");
      expect(mod.vendor).toBe("cisco");
    });

    it("loads and returns the az-900 module", async () => {
      const mod = await loadModule("az-900");
      expect(mod.id).toBe("az-900");
      expect(mod.vendor).toBe("microsoft");
    });

    it("registers the module in the registry after loading", async () => {
      expect(contentRegistry.isRegistered("ccna")).toBe(false);
      await loadModule("ccna");
      expect(contentRegistry.isRegistered("ccna")).toBe(true);
    });

    it("throws a descriptive error for an unknown module ID", async () => {
      await expect(loadModule("does-not-exist")).rejects.toThrow(
        "does-not-exist",
      );
    });

    it("error for unknown module mentions ContentLoader (not silent)", async () => {
      await expect(loadModule("unknown-module")).rejects.toThrow(
        /ContentLoader/,
      );
    });

    it("loading the same module twice does NOT duplicate the registry entry", async () => {
      await loadModule("ccna");
      await loadModule("ccna");

      const all = contentRegistry.getAllModules();
      const ccnaEntries = Array.from(all.values()).filter((m) => m.id === "ccna");
      expect(ccnaEntries).toHaveLength(1);
    });

    it("loading two different modules registers both independently", async () => {
      await loadModule("ccna");
      await loadModule("az-900");

      expect(contentRegistry.isRegistered("ccna")).toBe(true);
      expect(contentRegistry.isRegistered("az-900")).toBe(true);
    });
  });
});

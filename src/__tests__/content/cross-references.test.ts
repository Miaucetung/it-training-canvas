import { describe, it, expect } from "vitest";
import {
  findRelatedConcepts,
  findConceptsByTag,
  getConceptBridgesForModule,
} from "@/lib/content/cross-references";
import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule, Concept } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function makeConcept(id: string, tags: string[] = [], appliesTo: string[] = []): Concept {
  return {
    id,
    title: `Concept ${id}`,
    content: "Minimal content for testing.",
    tags,
    appliesTo,
  };
}

function makeModuleWithConcepts(
  id: string,
  vendor: CertificationModule["vendor"],
  concepts: Record<string, Concept>,
): CertificationModule {
  return {
    id,
    vendor,
    title: `Module ${id}`,
    subtitle: "subtitle",
    description: "test",
    difficulty: "beginner",
    estimatedHours: 5,
    topics: [],
    concepts,
    quizzes: {},
    exercises: {},
    learningPaths: {},
    metadata: {
      slug: id,
      tagline: "tagline",
      objectives: ["obj"],
      targetAudience: ["devs"],
      previewImageUrl: "/img.png",
      priceCents: 0,
      lastUpdated: "2026-01-01",
      certificationBody: "Test",
      featured: false,
      categories: ["test"],
    },
  };
}

// ────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────

describe("Cross-References", () => {
  describe("findRelatedConcepts()", () => {
    it("returns empty array for an unknown source concept", () => {
      // No modules registered — nothing to find
      const results = findRelatedConcepts("this-concept-does-not-exist", "az-900");
      expect(results).toHaveLength(0);
    });

    it("returns empty array when target module is not registered", () => {
      // ccna not registered, so bridge lookup yields nothing
      const results = findRelatedConcepts("subnetting", "az-900");
      expect(results).toHaveLength(0);
    });

    it("finds a bridge when target module IS registered with the target concept", () => {
      // Register az-900 with the concept that is the bridge target
      const az900 = makeModuleWithConcepts("az-900", "microsoft", {
        "azure-addressing": makeConcept(
          "azure-addressing",
          ["networking", "subnetting"],
          ["az-900"],
        ),
      });
      contentRegistry.register(az900);

      const results = findRelatedConcepts("subnetting", "az-900");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]!.concept.id).toBe("azure-addressing");
    });

    it("bridge includes the bridgeNote text", () => {
      const az900 = makeModuleWithConcepts("az-900", "microsoft", {
        "azure-addressing": makeConcept("azure-addressing", [], ["az-900"]),
      });
      contentRegistry.register(az900);

      const results = findRelatedConcepts("subnetting", "az-900");
      expect(results[0]!.bridge.bridgeNote).toBeTruthy();
      expect(results[0]!.bridge.bridgeNote.length).toBeGreaterThan(10);
    });

    it("works in reverse direction (target → source lookup)", () => {
      // Searching from az-900 concept back to ccna module
      const ccna = makeModuleWithConcepts("ccna", "cisco", {
        subnetting: makeConcept("subnetting", ["networking"], ["ccna"]),
      });
      contentRegistry.register(ccna);

      const results = findRelatedConcepts("azure-addressing", "ccna");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]!.concept.id).toBe("subnetting");
    });

    it("does not return the same module's concept as a cross-reference to itself", () => {
      const mod = makeModuleWithConcepts("ccna", "cisco", {
        subnetting: makeConcept("subnetting", ["networking"], ["ccna"]),
      });
      contentRegistry.register(mod);

      // Source and target are the same module — should not self-reference
      const results = findRelatedConcepts("subnetting", "ccna");
      // The bridge points ccna → az-900, so searching within ccna → ccna finds nothing
      for (const r of results) {
        expect(r.concept.id).not.toBe("subnetting");
      }
    });
  });

  describe("findConceptsByTag()", () => {
    it("returns empty array when no modules are registered", () => {
      const results = findConceptsByTag("networking");
      expect(results).toHaveLength(0);
    });

    it("finds concepts tagged with the given tag", () => {
      const mod = makeModuleWithConcepts("ccna", "cisco", {
        "osi-model": makeConcept("osi-model", ["networking", "layer-3"], ["ccna"]),
        "subnetting": makeConcept("subnetting", ["networking", "ip"], ["ccna"]),
        "wlan-basics": makeConcept("wlan-basics", ["wireless"], ["ccna"]),
      });
      contentRegistry.register(mod);

      const results = findConceptsByTag("networking");
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.concept.tags.includes("networking"))).toBe(true);
    });

    it("returns concepts from multiple modules with the same tag", () => {
      const ccna = makeModuleWithConcepts("ccna", "cisco", {
        "subnetting": makeConcept("subnetting", ["networking"], ["ccna"]),
      });
      const az900 = makeModuleWithConcepts("az-900", "microsoft", {
        "vnet-subnet": makeConcept("vnet-subnet", ["networking"], ["az-900"]),
      });
      contentRegistry.register(ccna);
      contentRegistry.register(az900);

      const results = findConceptsByTag("networking");
      expect(results).toHaveLength(2);

      const moduleIds = results.map((r) => r.moduleId);
      expect(moduleIds).toContain("ccna");
      expect(moduleIds).toContain("az-900");
    });

    it("returns empty array when no concept has the requested tag", () => {
      const mod = makeModuleWithConcepts("ccna", "cisco", {
        subnetting: makeConcept("subnetting", ["networking"], ["ccna"]),
      });
      contentRegistry.register(mod);

      const results = findConceptsByTag("does-not-exist-tag");
      expect(results).toHaveLength(0);
    });

    it("is case-sensitive for tags (tags must be lowercase)", () => {
      const mod = makeModuleWithConcepts("ccna", "cisco", {
        subnetting: makeConcept("subnetting", ["networking"], ["ccna"]),
      });
      contentRegistry.register(mod);

      // Tags are stored as-is, no case folding — call sites must use consistent casing
      const upper = findConceptsByTag("NETWORKING");
      expect(upper).toHaveLength(0);

      const lower = findConceptsByTag("networking");
      expect(lower).toHaveLength(1);
    });
  });

  describe("getConceptBridgesForModule()", () => {
    it("returns bridges where the module is either source or target", () => {
      const bridges = getConceptBridgesForModule("ccna");
      expect(bridges.length).toBeGreaterThan(0);
      for (const b of bridges) {
        const involved = b.sourceModuleId === "ccna" || b.targetModuleId === "ccna";
        expect(involved).toBe(true);
      }
    });

    it("returns bridges for comptia-network-plus once module is registered", () => {
      const bridges = getConceptBridgesForModule("comptia-network-plus");
      expect(bridges.length).toBeGreaterThan(0);
      for (const b of bridges) {
        const involved =
          b.sourceModuleId === "comptia-network-plus" ||
          b.targetModuleId === "comptia-network-plus";
        expect(involved).toBe(true);
      }
    });
  });
});

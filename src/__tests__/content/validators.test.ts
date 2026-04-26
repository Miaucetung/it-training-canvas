import { describe, it, expect } from "vitest";
import {
  validateModule,
  validateConcept,
  validateTopic,
  validateConceptCoverage,
  validateConceptAppliesTo,
} from "@/lib/content/validators";
import { loadModule } from "@/lib/content/content-loader";
import type { CertificationModule, Concept } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// Test helpers
// ────────────────────────────────────────────────────────────

function makeValidModule(overrides: Partial<CertificationModule> = {}): CertificationModule {
  return {
    id: "valid-module",
    vendor: "generic",
    title: "Valid Module",
    subtitle: "subtitle",
    description: "A valid module for testing purposes",
    difficulty: "beginner",
    estimatedHours: 5,
    topics: [
      {
        id: "topic-a",
        title: "Topic A",
        description: "desc",
        conceptIds: ["concept-x"],
        quizIds: [],
        exerciseIds: [],
        estimatedMinutes: 30,
        tags: ["test"],
      },
    ],
    concepts: {
      "concept-x": {
        id: "concept-x",
        title: "Concept X",
        content: "Meaningful content for the concept goes here.",
        appliesTo: ["valid-module"],
        tags: ["test"],
      },
    },
    quizzes: {},
    exercises: {},
    learningPaths: {},
    metadata: {
      slug: "valid-module",
      tagline: "tagline",
      objectives: ["learn things"],
      targetAudience: ["developers"],
      previewImageUrl: "/preview.png",
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
// validateModule tests
// ────────────────────────────────────────────────────────────

describe("validateModule()", () => {
  it("accepts a structurally valid module", () => {
    const result = validateModule(makeValidModule());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects null with an informative error", () => {
    const result = validateModule(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a module with missing id", () => {
    const { id: _omit, ...noId } = makeValidModule();
    const result = validateModule(noId);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("id"))).toBe(true);
  });

  it("rejects a module with an empty topics array", () => {
    const result = validateModule(makeValidModule({ topics: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("topic"))).toBe(true);
  });

  it("rejects a module with duplicate topic IDs", () => {
    const dup = {
      id: "topic-a",
      title: "Duplicate",
      description: "desc",
      conceptIds: [],
      quizIds: [],
      exerciseIds: [],
      estimatedMinutes: 30,
      tags: [],
    };
    const result = validateModule(makeValidModule({ topics: [dup, dup] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("topic"))).toBe(true);
  });

  it("rejects a module where a topic references an unknown prerequisite topic ID", () => {
    const result = validateModule(
      makeValidModule({
        topics: [
          {
            id: "topic-a",
            title: "Topic A",
            description: "desc",
            conceptIds: [],
            quizIds: [],
            exerciseIds: [],
            estimatedMinutes: 30,
            tags: [],
            prerequisiteTopicIds: ["topic-b-does-not-exist"],
          },
        ],
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("prerequisite") || e.includes("topic-b-does-not-exist"))).toBe(true);
  });

  it("rejects a module where metadata.slug ≠ module.id", () => {
    const result = validateModule(
      makeValidModule({
        metadata: {
          ...makeValidModule().metadata,
          slug: "wrong-slug",
        },
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("slug"))).toBe(true);
  });

  it("rejects a module with an invalid vendor", () => {
    const result = validateModule(makeValidModule({ vendor: "oracle" as never }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("vendor"))).toBe(true);
  });

  it("rejects a module with invalid lastUpdated date format", () => {
    const result = validateModule(
      makeValidModule({
        metadata: {
          ...makeValidModule().metadata,
          lastUpdated: "26.04.2026",
        },
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("lastUpdated") || e.includes("ISO"))).toBe(true);
  });

  it("provides multiple errors when multiple fields are wrong", () => {
    const result = validateModule({ id: "", vendor: "bad", topics: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("CCNA module (real) passes validation", async () => {
    const mod = await loadModule("ccna");
    const result = validateModule(mod);
    if (!result.valid) {
      console.error("CCNA validation errors:", result.errors);
    }
    expect(result.valid).toBe(true);
  });

  it("AZ-900 module (real) passes validation", async () => {
    const mod = await loadModule("az-900");
    const result = validateModule(mod);
    if (!result.valid) {
      console.error("AZ-900 validation errors:", result.errors);
    }
    expect(result.valid).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// validateConcept tests
// ────────────────────────────────────────────────────────────

describe("validateConcept()", () => {
  it("accepts a valid concept", () => {
    const result = validateConcept({
      id: "osi-model",
      title: "OSI Model",
      content: "The OSI model has 7 layers.",
      appliesTo: ["ccna"],
      tags: ["networking"],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects a concept with empty content", () => {
    const result = validateConcept({
      id: "osi-model",
      title: "OSI Model",
      content: "short",
      appliesTo: ["ccna"],
      tags: ["networking"],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("content"))).toBe(true);
  });

  it("rejects a concept with empty appliesTo", () => {
    const result = validateConcept({
      id: "osi-model",
      title: "OSI Model",
      content: "Long enough content for the test here.",
      appliesTo: [],
      tags: ["networking"],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("appliesTo"))).toBe(true);
  });

  it("rejects a concept with no tags", () => {
    const result = validateConcept({
      id: "osi-model",
      title: "OSI Model",
      content: "Long enough content for the test here.",
      appliesTo: ["ccna"],
      tags: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("tags"))).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// validateConceptCoverage tests
// ────────────────────────────────────────────────────────────

describe("validateConceptCoverage()", () => {
  it("passes when all topic conceptIds are in the concepts map", () => {
    const mod = makeValidModule(); // topic-a references concept-x, which exists
    const result = validateConceptCoverage(mod);
    expect(result.valid).toBe(true);
  });

  it("fails when a topic references a concept ID not in the map", () => {
    const mod = makeValidModule({
      topics: [
        {
          id: "topic-a",
          title: "Topic A",
          description: "desc",
          conceptIds: ["concept-x", "missing-concept"],
          quizIds: [],
          exerciseIds: [],
          estimatedMinutes: 30,
          tags: [],
        },
      ],
    });
    const result = validateConceptCoverage(mod);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("missing-concept"))).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────
// validateConceptAppliesTo tests
// ────────────────────────────────────────────────────────────

describe("validateConceptAppliesTo()", () => {
  const knownModules = new Set(["ccna", "az-900", "comptia-network-plus"]);

  it("passes when all appliesTo IDs are known modules", () => {
    const concept: Concept = {
      id: "osi-model",
      title: "OSI",
      content: "content",
      appliesTo: ["ccna", "comptia-network-plus"],
      tags: ["networking"],
    };
    const result = validateConceptAppliesTo(concept, knownModules);
    expect(result.valid).toBe(true);
  });

  it("fails when appliesTo contains an unknown module ID", () => {
    const concept: Concept = {
      id: "osi-model",
      title: "OSI",
      content: "content",
      appliesTo: ["ccna", "nicht-existent"],
      tags: ["networking"],
    };
    const result = validateConceptAppliesTo(concept, knownModules);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("nicht-existent"))).toBe(true);
    expect(result.errors[0]).toContain("osi-model");
  });
});

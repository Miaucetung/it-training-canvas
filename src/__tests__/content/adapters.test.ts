import { describe, it, expect } from "vitest";
import {
  extractQuizzes,
  extractLearningPaths,
  buildCombinedQuizRegistry,
  getTopicQuizIds,
  getModuleLearningPath,
} from "@/lib/content/adapters";
import type { CertificationModule } from "@/lib/content/types";
import type { Quiz, LearningPath } from "@/lib/types";

// ────────────────────────────────────────────────────────────
// Test fixtures
// ────────────────────────────────────────────────────────────

function makeQuiz(id: string): Quiz {
  return {
    id,
    title: `Quiz ${id}`,
    description: "Test quiz",
    questions: [],
    passingScore: 80,
    shuffleQuestions: false,
  };
}

function makeLearningPath(id: string): LearningPath {
  return {
    id,
    title: `Path ${id}`,
    description: "Test path",
    subject: "Test",
    steps: [],
    difficulty: "beginner",
    estimatedMinutes: 60,
    tags: [],
    createdAt: 0,
    updatedAt: 0,
  };
}

function makeModule(id: string, overrides: Partial<CertificationModule> = {}): CertificationModule {
  return {
    id,
    vendor: "generic",
    title: `Module ${id}`,
    subtitle: "subtitle",
    description: "Test",
    difficulty: "beginner",
    estimatedHours: 5,
    topics: [
      {
        id: "topic-1",
        title: "Topic 1",
        description: "desc",
        conceptIds: [],
        quizIds: ["quiz-a"],
        exerciseIds: [],
        estimatedMinutes: 30,
        tags: [],
      },
      {
        id: "topic-empty",
        title: "Empty Topic",
        description: "no quizzes",
        conceptIds: [],
        quizIds: [],
        exerciseIds: [],
        estimatedMinutes: 15,
        tags: [],
      },
    ],
    concepts: {},
    quizzes: {
      "quiz-a": makeQuiz("quiz-a"),
      "quiz-b": makeQuiz("quiz-b"),
    },
    exercises: {},
    learningPaths: {
      "path-1": makeLearningPath("path-1"),
      "path-2": makeLearningPath("path-2"),
    },
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
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────

describe("Adapters", () => {
  describe("extractQuizzes()", () => {
    it("returns all quizzes from the module as a flat Record", () => {
      const mod = makeModule("m1");
      const quizzes = extractQuizzes(mod);

      expect(Object.keys(quizzes)).toHaveLength(2);
      expect(quizzes["quiz-a"]).toBeDefined();
      expect(quizzes["quiz-b"]).toBeDefined();
    });

    it("returns an empty Record when the module has no quizzes", () => {
      const mod = makeModule("m1", { quizzes: {} });
      const quizzes = extractQuizzes(mod);
      expect(Object.keys(quizzes)).toHaveLength(0);
    });

    it("returns a shallow copy (mutating output does not affect module)", () => {
      const mod = makeModule("m1");
      const quizzes = extractQuizzes(mod);
      quizzes["injected"] = makeQuiz("injected");

      expect(mod.quizzes["injected"]).toBeUndefined();
    });

    it("returned Quiz objects have required fields (id, title, questions, passingScore)", () => {
      const mod = makeModule("m1");
      const quizzes = extractQuizzes(mod);

      for (const quiz of Object.values(quizzes)) {
        expect(quiz).toHaveProperty("id");
        expect(quiz).toHaveProperty("title");
        expect(quiz).toHaveProperty("questions");
        expect(quiz).toHaveProperty("passingScore");
      }
    });
  });

  describe("extractLearningPaths()", () => {
    it("returns all learning paths from the module", () => {
      const mod = makeModule("m1");
      const paths = extractLearningPaths(mod);

      expect(Object.keys(paths)).toHaveLength(2);
      expect(paths["path-1"]).toBeDefined();
      expect(paths["path-2"]).toBeDefined();
    });

    it("returns an empty Record when the module has no learning paths", () => {
      const mod = makeModule("m1", { learningPaths: {} });
      const paths = extractLearningPaths(mod);
      expect(Object.keys(paths)).toHaveLength(0);
    });

    it("returned LearningPath objects have required fields", () => {
      const mod = makeModule("m1");
      const paths = extractLearningPaths(mod);

      for (const path of Object.values(paths)) {
        expect(path).toHaveProperty("id");
        expect(path).toHaveProperty("title");
        expect(path).toHaveProperty("steps");
        expect(path).toHaveProperty("difficulty");
      }
    });
  });

  describe("buildCombinedQuizRegistry()", () => {
    it("merges quizzes from multiple modules", () => {
      const modA = makeModule("a", {
        quizzes: { "qa-1": makeQuiz("qa-1") },
      });
      const modB = makeModule("b", {
        quizzes: { "qb-1": makeQuiz("qb-1") },
      });

      const combined = buildCombinedQuizRegistry([modA, modB]);
      expect(Object.keys(combined)).toHaveLength(2);
      expect(combined["qa-1"]).toBeDefined();
      expect(combined["qb-1"]).toBeDefined();
    });

    it("later module's quiz wins on ID collision (deterministic overwrite)", () => {
      const modA = makeModule("a", { quizzes: { "shared": { ...makeQuiz("shared"), title: "From A" } } });
      const modB = makeModule("b", { quizzes: { "shared": { ...makeQuiz("shared"), title: "From B" } } });

      const combined = buildCombinedQuizRegistry([modA, modB]);
      expect(combined["shared"]?.title).toBe("From B");
    });

    it("returns empty Record for empty array input", () => {
      const combined = buildCombinedQuizRegistry([]);
      expect(Object.keys(combined)).toHaveLength(0);
    });
  });

  describe("getTopicQuizIds()", () => {
    it("returns quiz IDs for a known topic", () => {
      const mod = makeModule("m1");
      const ids = getTopicQuizIds(mod, "topic-1");
      expect(ids).toEqual(["quiz-a"]);
    });

    it("returns an empty array for a topic with no quizzes", () => {
      const mod = makeModule("m1");
      const ids = getTopicQuizIds(mod, "topic-empty");
      expect(ids).toHaveLength(0);
    });

    it("returns an empty array for an unknown topic ID", () => {
      const mod = makeModule("m1");
      const ids = getTopicQuizIds(mod, "non-existent-topic");
      expect(ids).toHaveLength(0);
    });
  });

  describe("getModuleLearningPath()", () => {
    it("returns the first path when no pathId is specified", () => {
      const mod = makeModule("m1");
      const path = getModuleLearningPath(mod);
      expect(path).toBeDefined();
      expect(path?.id).toBe("path-1");
    });

    it("returns a specific path when pathId is given", () => {
      const mod = makeModule("m1");
      const path = getModuleLearningPath(mod, "path-2");
      expect(path?.id).toBe("path-2");
    });

    it("returns undefined for an unknown pathId", () => {
      const mod = makeModule("m1");
      const path = getModuleLearningPath(mod, "ghost-path");
      expect(path).toBeUndefined();
    });

    it("returns undefined when the module has no learning paths", () => {
      const mod = makeModule("m1", { learningPaths: {} });
      const path = getModuleLearningPath(mod);
      expect(path).toBeUndefined();
    });
  });
});

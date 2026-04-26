// ============================================================
// Adapters — bridge between CertificationModule and the
// existing app component layer (QuizDialog, ProgressTracker,
// LearningPathEditor). Components NEVER import module files;
// they only see the existing lib/types shapes.
// ============================================================

import type { CertificationModule } from "@/lib/content/types";
import type { LearningPath, Quiz } from "@/lib/types";

// ────────────────────────────────────────────────────────────
// extractQuizzes
// Returns all quizzes from a module as a flat Record<id, Quiz>
// ready to pass to QuizDialog / DEFAULT_QUIZZES merging
// ────────────────────────────────────────────────────────────
export function extractQuizzes(
  module: CertificationModule,
): Record<string, Quiz> {
  return { ...module.quizzes };
}

// ────────────────────────────────────────────────────────────
// extractLearningPaths
// Returns all learning paths from a module
// ────────────────────────────────────────────────────────────
export function extractLearningPaths(
  module: CertificationModule,
): Record<string, LearningPath> {
  return { ...module.learningPaths };
}

// ────────────────────────────────────────────────────────────
// buildCombinedQuizRegistry
// Merges quizzes from multiple modules into a single registry.
// Pass modules in the order you want (later modules overwrite on conflict).
// ────────────────────────────────────────────────────────────
export function buildCombinedQuizRegistry(
  modules: CertificationModule[],
): Record<string, Quiz> {
  return modules.reduce<Record<string, Quiz>>(
    (acc, mod) => ({ ...acc, ...mod.quizzes }),
    {},
  );
}

// ────────────────────────────────────────────────────────────
// getModuleQuizIds
// Returns quiz IDs for a specific topic within a module
// ────────────────────────────────────────────────────────────
export function getTopicQuizIds(
  module: CertificationModule,
  topicId: string,
): string[] {
  const topic = module.topics.find((t) => t.id === topicId);
  return topic?.quizIds ?? [];
}

// ────────────────────────────────────────────────────────────
// getModuleLearningPath
// Returns the primary (first) learning path for a module,
// or a specific one by ID.
// ────────────────────────────────────────────────────────────
export function getModuleLearningPath(
  module: CertificationModule,
  pathId?: string,
): LearningPath | undefined {
  if (pathId) return module.learningPaths[pathId];
  return Object.values(module.learningPaths)[0];
}

// ============================================================
// Module Validators — Zod schemas for CertificationModule
// Use validateModule() before registering external/dynamic content.
// Tests use these to assert structural correctness of all modules.
// ============================================================

import { z } from "zod";
import type { CertificationModule, Concept, Topic } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// Leaf schemas
// ────────────────────────────────────────────────────────────

const VendorSchema = z.enum(
  ["cisco", "microsoft", "comptia", "linux", "generic"],
  { message: "vendor must be one of: cisco, microsoft, comptia, linux, generic" },
);

const DifficultySchema = z.enum(["beginner", "intermediate", "advanced"], {
  message: "difficulty must be one of: beginner, intermediate, advanced",
});

const ConceptSchema = z.object({
  id: z.string().min(1, "concept.id must not be empty"),
  title: z.string().min(1, "concept.title must not be empty"),
  content: z.string().min(10, "concept.content must have meaningful text (>10 chars)"),
  appliesTo: z.array(z.string()).min(1, "concept.appliesTo must list at least one module"),
  tags: z.array(z.string()).min(1, "concept.tags must have at least one tag"),
  relatedConceptIds: z.array(z.string()).optional(),
});

const TopicSchema = z.object({
  id: z.string().min(1, "topic.id must not be empty"),
  title: z.string().min(1, "topic.title must not be empty"),
  description: z.string().min(1, "topic.description must not be empty"),
  conceptIds: z.array(z.string()),
  quizIds: z.array(z.string()),
  exerciseIds: z.array(z.string()),
  prerequisiteTopicIds: z.array(z.string()).optional(),
  estimatedMinutes: z.number().positive("estimatedMinutes must be > 0"),
  tags: z.array(z.string()),
});

const CourseMetadataSchema = z.object({
  slug: z.string().min(1),
  tagline: z.string().min(1),
  objectives: z.array(z.string()).min(1),
  targetAudience: z.array(z.string()).min(1),
  previewImageUrl: z.string().min(1),
  priceCents: z.number(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "lastUpdated must be ISO 8601 (YYYY-MM-DD)"),
  certificationBody: z.string().min(1),
  certValidityMonths: z.number().positive().optional(),
  featured: z.boolean(),
  categories: z.array(z.string()).min(1),
});

// ────────────────────────────────────────────────────────────
// Base module schema (structural, no cross-field checks)
// ────────────────────────────────────────────────────────────

const CertificationModuleBaseSchema = z.object({
  id: z.string().min(1, "module.id must not be empty"),
  vendor: VendorSchema,
  title: z.string().min(1, "module.title must not be empty"),
  subtitle: z.string().min(1, "module.subtitle must not be empty"),
  description: z.string().min(10, "module.description must have meaningful text"),
  difficulty: DifficultySchema,
  examCode: z.string().optional(),
  estimatedHours: z.number().positive("estimatedHours must be > 0"),
  topics: z.array(TopicSchema).min(1, "module must have at least one topic"),
  concepts: z.record(z.string(), ConceptSchema),
  quizzes: z.record(z.string(), z.unknown()),
  exercises: z.record(z.string(), z.unknown()),
  learningPaths: z.record(z.string(), z.unknown()),
  prerequisites: z.array(z.string()).optional(),
  relatedModules: z.array(z.string()).optional(),
  metadata: CourseMetadataSchema,
});

// ────────────────────────────────────────────────────────────
// Cross-field validation (refine)
// ────────────────────────────────────────────────────────────

export const CertificationModuleSchema = CertificationModuleBaseSchema
  .refine(
    (mod) => {
      const ids = mod.topics.map((t) => t.id);
      return ids.length === new Set(ids).size;
    },
    (mod) => {
      const ids = mod.topics.map((t) => t.id);
      const seen = new Set<string>();
      const dupes = ids.filter((id) => (seen.has(id) ? true : !seen.add(id)));
      return {
        message: `module '${mod.id}' has duplicate topic IDs: ${dupes.join(", ")}`,
        path: ["topics"],
      };
    },
  )
  .refine(
    (mod) => {
      const topicIds = new Set(mod.topics.map((t) => t.id));
      const bad = mod.topics.flatMap((t) =>
        (t.prerequisiteTopicIds ?? []).filter((p) => !topicIds.has(p)),
      );
      return bad.length === 0;
    },
    (mod) => {
      const topicIds = new Set(mod.topics.map((t) => t.id));
      const bad = mod.topics.flatMap((t) =>
        (t.prerequisiteTopicIds ?? []).filter((p) => !topicIds.has(p)),
      );
      return {
        message: `module '${mod.id}' has topics with unknown prerequisites: ${bad.join(", ")}`,
        path: ["topics"],
      };
    },
  )
  .refine(
    (mod) => {
      // concept keys must match concept IDs
      return Object.entries(mod.concepts).every(([key, c]) => key === c.id);
    },
    (mod) => {
      const mismatches = Object.entries(mod.concepts)
        .filter(([key, c]) => key !== c.id)
        .map(([key, c]) => `${key} ≠ ${c.id}`);
      return {
        message: `concept map keys must match concept IDs: ${mismatches.join(", ")}`,
        path: ["concepts"],
      };
    },
  )
  .refine(
    (mod) => {
      // metadata slug must match module id
      return mod.metadata.slug === mod.id;
    },
    (mod) => ({
      message: `metadata.slug '${mod.metadata.slug}' must equal module.id '${mod.id}'`,
      path: ["metadata", "slug"],
    }),
  );

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a module against the full schema.
 * Returns { valid, errors } — never throws.
 */
export function validateModule(module: unknown): ValidationResult {
  const result = CertificationModuleSchema.safeParse(module);
  if (result.success) return { valid: true, errors: [] };

  const errors = result.error.errors.map(
    (e) => `[${e.path.join(".") || "root"}] ${e.message}`,
  );
  return { valid: false, errors };
}

/**
 * Validates a concept independently.
 */
export function validateConcept(concept: unknown): ValidationResult {
  const result = ConceptSchema.safeParse(concept);
  if (result.success) return { valid: true, errors: [] };
  const errors = result.error.errors.map(
    (e) => `[${e.path.join(".") || "root"}] ${e.message}`,
  );
  return { valid: false, errors };
}

/**
 * Validates a topic independently.
 */
export function validateTopic(topic: unknown): ValidationResult {
  const result = TopicSchema.safeParse(topic);
  if (result.success) return { valid: true, errors: [] };
  const errors = result.error.errors.map(
    (e) => `[${e.path.join(".") || "root"}] ${e.message}`,
  );
  return { valid: false, errors };
}

/**
 * Validates that all conceptIds in topics are present in the concepts map.
 * Called separately because it's a cross-collection check.
 */
export function validateConceptCoverage(module: CertificationModule): ValidationResult {
  const conceptKeys = new Set(Object.keys(module.concepts));
  const missing: string[] = [];

  for (const topic of module.topics) {
    for (const cId of topic.conceptIds) {
      if (!conceptKeys.has(cId)) {
        missing.push(`topic '${topic.id}' references unknown concept '${cId}'`);
      }
    }
  }

  return missing.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors: missing };
}

/**
 * Validates that concept.appliesTo only references module IDs known to the registry.
 * Pass the set of known module IDs from the registry.
 */
export function validateConceptAppliesTo(
  concept: Concept,
  knownModuleIds: Set<string>,
): ValidationResult {
  const unknown = concept.appliesTo.filter((id) => !knownModuleIds.has(id));
  return unknown.length === 0
    ? { valid: true, errors: [] }
    : {
        valid: false,
        errors: unknown.map(
          (id) =>
            `concept '${concept.id}' appliesTo unknown module '${id}'`,
        ),
      };
}

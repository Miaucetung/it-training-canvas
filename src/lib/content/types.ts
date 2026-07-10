// ============================================================
// Generic Content Types — applies to CCNA, AZ-900, CompTIA, etc.
// These types are the foundation for all certification modules.
// Existing app types (Quiz, LearningPath) are reused as leaf
// types; adapters.ts bridges them to the component layer.
// ============================================================

import type { LearningPath, Quiz } from "@/lib/types";

// ────────────────────────────────────────────────────────────
// Vendor & Module Identity
// ────────────────────────────────────────────────────────────
export type Vendor = "cisco" | "microsoft" | "comptia" | "linux" | "generic";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// ────────────────────────────────────────────────────────────
// Concept — smallest reusable knowledge unit
// A Concept can be shared across multiple modules (e.g. OSI model
// appears in CCNA, CompTIA Network+, and Azure Networking)
// ────────────────────────────────────────────────────────────
export interface Concept {
  /** Globally unique ID, e.g. 'osi-model', 'subnetting', 'vnet-subnet' */
  id: string;
  title: string;
  /** Markdown content — rendered in study view */
  content: string;
  /** Module IDs this concept is relevant to */
  appliesTo: string[];
  /** Semantic tags for cross-reference engine */
  tags: string[];
  /** Optional mapping: concept in other modules that covers similar ground */
  relatedConceptIds?: string[];
}

// ────────────────────────────────────────────────────────────
// Exercise — a canvas-based hands-on task
// Uses the existing LearningPath type as its representation
// so it integrates directly with ProgressTracker / LearningPathEditor
// ────────────────────────────────────────────────────────────
export interface Exercise {
  id: string;
  title: string;
  description: string;
  /** Reference to a LearningPath ID (defined in the module) */
  learningPathId: string;
  /** Canvas topology template ID (from TemplateGallery) */
  canvasTemplateId?: string;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  /** Concept IDs practiced in this exercise */
  conceptIds: string[];
}

// ────────────────────────────────────────────────────────────
// LessonSummary — structured study aid attached to a Topic
// ────────────────────────────────────────────────────────────
export interface LessonSummary {
  /** Max 5. Each = one action statement. Only concepts on the CCNA 200-301 v1.1
   *  blueprint AND actively used in modern enterprise networks post-2015. */
  mustKnow: string[];

  /** One entry per mustKnow item.
   *  practice = de-facto standard config in 2024 in one sentence. */
  bestPractice: {
    topic: string;
    practice: string;
    /** e.g. "[Cisco only]" or "[IOS-XE differs]" */
    note?: string;
  }[];

  /** Concepts in the lesson that are exam-relevant but rarely used in practice. */
  legacyOrExamOnly: {
    topic: string;
    /** Why it's legacy */
    reason: string;
    /** Modern alternative, if one exists */
    replacedBy?: string;
  }[];

  /** Max 3. Each = one CLI-verifiable fact.
   *  Format: "<fact>. Verify: show <command>" */
  fastFacts: string[];
}

// ────────────────────────────────────────────────────────────
// Topic — a chapter-level grouping of concepts, quizzes, exercises
// ────────────────────────────────────────────────────────────
export interface Topic {
  id: string;
  title: string;
  description: string;
  /** Ordered concept IDs — study these in sequence */
  conceptIds: string[];
  /** Quiz IDs — from the module's quiz registry */
  quizIds: string[];
  /** Exercise IDs — canvas-based practicals */
  exerciseIds: string[];
  /** Topics that must be completed before this one */
  prerequisiteTopicIds?: string[];
  estimatedMinutes: number;
  tags: string[];
  lessonSummary?: LessonSummary;
}

// ────────────────────────────────────────────────────────────
// CertificationModule — top-level module descriptor
// ────────────────────────────────────────────────────────────
export interface CertificationModule {
  /** URL-safe identifier, e.g. 'ccna', 'az-900', 'comptia-network-plus' */
  id: string;
  vendor: Vendor;
  title: string;
  /** Short subtitle shown on cards */
  subtitle: string;
  description: string;
  difficulty: DifficultyLevel;
  /** Official exam code, e.g. '200-301', 'AZ-900' */
  examCode?: string;
  estimatedHours: number;
  topics: Topic[];
  /** Fully resolved concept map — id → Concept */
  concepts: Record<string, Concept>;
  /** Fully resolved quiz map — id → Quiz (from existing lib/types) */
  quizzes: Record<string, Quiz>;
  /** Fully resolved exercise map — id → Exercise */
  exercises: Record<string, Exercise>;
  /** Pre-built learning paths for this module (from existing lib/types) */
  learningPaths: Record<string, LearningPath>;
  /** Module IDs that should be completed before this one */
  prerequisites?: string[];
  /** Related module IDs (for cross-selling / cross-referencing) */
  relatedModules?: string[];
  /** Metadata for the landing page / course catalog */
  metadata: CourseMetadata;
}

// ────────────────────────────────────────────────────────────
// CourseMetadata — marketing/catalog data per module
// No UI built yet; consumed by a future landing page / catalog
// ────────────────────────────────────────────────────────────
export interface CourseMetadata {
  /** Slug for URL routing on the landing page */
  slug: string;
  tagline: string;
  /** Markdown or plain-text learning objectives */
  objectives: string[];
  /** Who this course is designed for */
  targetAudience: string[];
  /** Placeholder for image URL / asset path */
  previewImageUrl: string;
  /** Placeholder for pricing — set 0 for free, -1 = price TBD */
  priceCents: number;
  /** ISO 8601 date of last content update */
  lastUpdated: string;
  /** Certification body / official name */
  certificationBody: string;
  /** Approximate validity period of the cert in months */
  certValidityMonths?: number;
  featured: boolean;
  /** e.g. ['networking', 'cisco', 'enterprise'] */
  categories: string[];
}

// ────────────────────────────────────────────────────────────
// ContentProvider interface — CMS / backend contract
// Implement this interface to swap local TS files for a CMS,
// REST API, or GraphQL backend without changing any component.
// ────────────────────────────────────────────────────────────
export interface ContentProvider {
  getModule(id: string): Promise<CertificationModule>;
  listModules(): Promise<CourseMetadata[]>;
  getConcept(id: string): Promise<Concept>;
  findConceptsByTag(tag: string): Promise<Concept[]>;
}

// ────────────────────────────────────────────────────────────
// Cross-Reference types
// ────────────────────────────────────────────────────────────
export interface ConceptBridge {
  /** Concept in the source module */
  sourceConceptId: string;
  sourceModuleId: string;
  /** Equivalent concept in the target module */
  targetConceptId: string;
  targetModuleId: string;
  /** Human-readable explanation of the relationship */
  bridgeNote: string;
}

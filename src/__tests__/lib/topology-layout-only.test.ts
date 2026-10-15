import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import * as ts from "typescript";
import vm from "node:vm";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";

function getBaseGitRef(): string {
  const candidates = [
    process.env.GIT_BASE_REF,
    "6b5ee88",
    "origin/main",
    "main",
    "HEAD~1",
  ].filter(Boolean) as string[];

  for (const ref of candidates) {
    try {
      execSync(`git rev-parse --verify ${ref}`, { stdio: "ignore" });
      return ref;
    } catch {
      // try next candidate
    }
  }
  throw new Error("Could not determine base git ref for comparison");
}

function loadFromGit<T>(ref: string, repoRelativePath: string, exportName: string): T {
  const fileContent = execSync(`git show ${ref}:${repoRelativePath}`, {
    maxBuffer: 50 * 1024 * 1024,
    encoding: "utf8",
  });

  const js = ts.transpileModule(fileContent, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const sandbox = { exports: {} as Record<string, unknown> };
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox);
  return sandbox.exports[exportName] as T;
}

/**
 * Normalizes an exhibit by removing layout-only properties:
 * - device coordinates (x, y)
 * - label position ("above", "below", "left", "right")
 * All text fields (device labels, interface names, subnets, label text) are preserved.
 */
function stripLayoutFieldsFromExhibit(exhibit: unknown): unknown {
  if (!exhibit) return exhibit;
  if (Array.isArray(exhibit)) {
    return exhibit.map(stripLayoutFieldsFromExhibit);
  }
  if (typeof exhibit !== "object") return exhibit;

  const obj = exhibit as Record<string, unknown>;
  if (obj.type === "topology") {
    const devices = Array.isArray(obj.devices)
      ? obj.devices.map((d: Record<string, unknown>) => {
          const { x: _x, y: _y, ...rest } = d;
          return rest;
        })
      : obj.devices;

    const labels = Array.isArray(obj.labels)
      ? obj.labels.map((l: Record<string, unknown>) => {
          const { position: _pos, ...rest } = l;
          return rest;
        })
      : obj.labels;

    return {
      ...obj,
      devices,
      labels,
    };
  }

  return exhibit;
}

function stripLayoutFieldsFromQuestion(q: Record<string, unknown>): Record<string, unknown> {
  return {
    ...q,
    exhibit: stripLayoutFieldsFromExhibit(q.exhibit),
  };
}

describe("Topology and question data integrity vs main (6b5ee88)", () => {
  const baseRef = getBaseGitRef();
  const baselineCcnaQuestions = loadFromGit<Array<Record<string, unknown>>>(
    baseRef,
    "src/data/ccnaQuestions.ts",
    "ccnaQuestions"
  );
  const baselineCcnaClassified = loadFromGit<Array<Record<string, unknown>>>(
    baseRef,
    "src/data/ccnaQuestionsClassified.ts",
    "ccnaQuestionsClassified"
  );

  it("ccnaQuestions: contains identical number of questions as main", () => {
    expect(ccnaQuestions.length).toBe(baselineCcnaQuestions.length);
  });

  it("ccnaQuestions: exactly preserving all texts, options, solutions, and topologies except layout fields", () => {
    expect(ccnaQuestions.length).toBe(baselineCcnaQuestions.length);

    const violations: string[] = [];

    for (let i = 0; i < ccnaQuestions.length; i++) {
      const cur = ccnaQuestions[i] as unknown as Record<string, unknown>;
      const base = baselineCcnaQuestions[i];

      // 1. Question ID must match
      if (cur.id !== base.id) {
        violations.push(`Question at index ${i} ID mismatch: ${cur.id} vs ${base.id}`);
        continue;
      }

      // 2. Question text must be byte-identical
      if (cur.question !== base.question) {
        violations.push(`Question ${cur.id}: question text modified`);
      }

      // 3. Options must be identical
      if (JSON.stringify(cur.options) !== JSON.stringify(base.options)) {
        violations.push(`Question ${cur.id}: options modified`);
      }

      // 4. Correct answer must be identical
      if (JSON.stringify(cur.correct) !== JSON.stringify(base.correct)) {
        violations.push(`Question ${cur.id}: correct answer modified`);
      }

      // 5. Normalized exhibits (with layout fields x, y, position stripped) must be identical
      const curStripped = stripLayoutFieldsFromQuestion(cur);
      const baseStripped = stripLayoutFieldsFromQuestion(base);

      if (JSON.stringify(curStripped) !== JSON.stringify(baseStripped)) {
        violations.push(
          `Question ${cur.id}: non-layout data modified in exhibit: ` +
            `current=${JSON.stringify(curStripped)} baseline=${JSON.stringify(baseStripped)}`
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("ccnaQuestionsClassified: contains identical number of questions as main", () => {
    expect(ccnaQuestionsClassified.length).toBe(baselineCcnaClassified.length);
  });

  it("ccnaQuestionsClassified: exactly preserving all texts, options, solutions, and topologies except layout fields", () => {
    expect(ccnaQuestionsClassified.length).toBe(baselineCcnaClassified.length);

    const violations: string[] = [];

    for (let i = 0; i < ccnaQuestionsClassified.length; i++) {
      const cur = ccnaQuestionsClassified[i] as unknown as Record<string, unknown>;
      const base = baselineCcnaClassified[i];

      // 1. Question ID must match
      if (cur.id !== base.id) {
        violations.push(`Classified question at index ${i} ID mismatch: ${cur.id} vs ${base.id}`);
        continue;
      }

      // 2. Question text must be byte-identical
      if (cur.question !== base.question) {
        violations.push(`Classified question ${cur.id}: question text modified`);
      }

      // 3. Options must be identical
      if (JSON.stringify(cur.options) !== JSON.stringify(base.options)) {
        violations.push(`Classified question ${cur.id}: options modified`);
      }

      // 4. Correct answer must be identical
      if (JSON.stringify(cur.correct) !== JSON.stringify(base.correct)) {
        violations.push(`Classified question ${cur.id}: correct answer modified`);
      }

      // 5. Normalized exhibits (with layout fields x, y, position stripped) must be identical
      const curStripped = stripLayoutFieldsFromQuestion(cur);
      const baseStripped = stripLayoutFieldsFromQuestion(base);

      if (JSON.stringify(curStripped) !== JSON.stringify(baseStripped)) {
        violations.push(
          `Classified question ${cur.id}: non-layout data modified in exhibit: ` +
            `current=${JSON.stringify(curStripped)} baseline=${JSON.stringify(baseStripped)}`
        );
      }
    }

    expect(violations).toEqual([]);
  });

  it("verifies only permitted questions had layout fields changed (q0463, q0898, q0944 in both pools)", () => {
    const changedExamIds: string[] = [];
    for (let i = 0; i < ccnaQuestions.length; i++) {
      const cur = ccnaQuestions[i];
      const base = baselineCcnaQuestions[i];
      if (JSON.stringify(cur) !== JSON.stringify(base)) {
        changedExamIds.push(cur.id);
      }
    }
    expect(changedExamIds.sort()).toEqual(["q0463", "q0898", "q0944"]);

    const changedClassifiedIds: string[] = [];
    for (let i = 0; i < ccnaQuestionsClassified.length; i++) {
      const cur = ccnaQuestionsClassified[i];
      const base = baselineCcnaClassified[i];
      if (JSON.stringify(cur) !== JSON.stringify(base)) {
        changedClassifiedIds.push(cur.id);
      }
    }
    expect(changedClassifiedIds.sort()).toEqual(["Q0463", "Q0898", "Q0944"]);
  });
});

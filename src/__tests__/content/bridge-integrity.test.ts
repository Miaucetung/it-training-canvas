/**
 * Bridge Integrity — Integration Test
 *
 * This test validates that ALL bridges in CONCEPT_BRIDGES resolve to real
 * Concept IDs in their respective modules.
 *
 * This test runs in its OWN isolated module context (vitest isolate: true)
 * so the real module registrations are not polluted by synthetic test modules
 * from other test files.
 *
 * When this test is RED:
 *   A bridge references a concept or module that does not exist.
 *   The error message includes the exact bridge, the reason, and suggestions
 *   for what the concept ID might be.
 *
 * When adding a new bridge:
 *   1. Add it to CONCEPT_BRIDGES in cross-references.ts
 *   2. Run `npm test src/__tests__/content/bridge-integrity.test.ts`
 *   3. If red: fix the concept IDs before committing
 *
 * See TESTING.md § Bridge-Integrität for full documentation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { contentRegistry } from "@/lib/content/content-registry";
import { validateBridges, formatBridgeValidationReport } from "@/lib/content/bridge-validator";
import { CONCEPT_BRIDGES } from "@/lib/content/cross-references";

import ccnaModule from "@/content/modules/ccna";
import az900Module from "@/content/modules/az-900";
import netplusModule from "@/content/modules/comptia-network-plus";

// Re-register after setup.ts clears the registry in beforeEach
beforeEach(() => {
  contentRegistry.register(ccnaModule);
  contentRegistry.register(az900Module);
  contentRegistry.register(netplusModule);
});

describe("Bridge integrity: all registered modules and bridges are consistent", () => {
  it("all bridges in CONCEPT_BRIDGES resolve to real Concepts in registered modules", () => {
    const result = validateBridges(contentRegistry, CONCEPT_BRIDGES);

    if (!result.valid) {
      const report = formatBridgeValidationReport(result);
      throw new Error(
        `Dead bridges found in CONCEPT_BRIDGES.\n\n` +
          `This test exists to catch dead bridges before they reach production.\n` +
          `Fix the bridges listed below, then re-run.\n\n` +
          report,
      );
    }

    expect(result.valid).toBe(true);
    expect(result.totalBridges).toBeGreaterThan(0);
  });

  it("all 3 modules are registered (registration side effects ran)", () => {
    expect(contentRegistry.isRegistered("ccna")).toBe(true);
    expect(contentRegistry.isRegistered("az-900")).toBe(true);
    expect(contentRegistry.isRegistered("comptia-network-plus")).toBe(true);
  });
});

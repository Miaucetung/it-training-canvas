// ============================================================
// Bridge Validator
// Validates that all ConceptBridge entries resolve to real Concept
// IDs in their respective modules.
//
// Motivation: TypeScript cannot catch the case where a Topic-ID is
// used as a sourceConceptId (both are `string`). This runtime
// validator closes that gap.
//
// Usage:
//   import { validateBridges, CONCEPT_BRIDGES } from './cross-references';
//   const result = validateBridges(contentRegistry, CONCEPT_BRIDGES);
//   if (!result.valid) console.error(formatBridgeValidationReport(result));
// ============================================================

import type { ConceptBridge, CertificationModule } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// Public interface for the registry dependency
// Minimal interface — avoids a hard import of the singleton,
// making the validator testable with synthetic registries.
// ────────────────────────────────────────────────────────────
export interface ContentRegistry {
  getModuleSync(id: string): CertificationModule | undefined;
  getAllModules(): Map<string, CertificationModule>;
}

// ────────────────────────────────────────────────────────────
// Result types
// ────────────────────────────────────────────────────────────
export type BridgeDeadReason =
  | "source-module-missing"
  | "target-module-missing"
  | "source-concept-missing"
  | "target-concept-missing";

export type DeadBridge = {
  bridge: ConceptBridge;
  reason: BridgeDeadReason;
  /** Human-readable explanation including suggestions */
  detail: string;
};

export type BridgeValidationResult = {
  valid: boolean;
  totalBridges: number;
  validBridges: number;
  deadBridges: DeadBridge[];
};

// ────────────────────────────────────────────────────────────
// Suggestion engine — simple substring + prefix matching
// Returns concept IDs that are plausibly what the author meant.
// ────────────────────────────────────────────────────────────
function suggestConcepts(missing: string, available: string[]): string[] {
  const lower = missing.toLowerCase();
  const suggestions = available.filter((id) => {
    const idLower = id.toLowerCase();
    return (
      idLower.includes(lower) ||
      lower.includes(idLower) ||
      // Check word overlap (e.g. "stp-redundancy" vs "stp")
      idLower.split("-").some((part) => lower.split("-").includes(part))
    );
  });
  // Return max 3 suggestions, closest first (shorter = more specific match)
  return suggestions.sort((a, b) => a.length - b.length).slice(0, 3);
}

// ────────────────────────────────────────────────────────────
// Core validator
// ────────────────────────────────────────────────────────────
export function validateBridges(
  registry: ContentRegistry,
  bridges: ConceptBridge[],
): BridgeValidationResult {
  const deadBridges: DeadBridge[] = [];

  for (const bridge of bridges) {
    const sourceModule = registry.getModuleSync(bridge.sourceModuleId);
    if (!sourceModule) {
      deadBridges.push({
        bridge,
        reason: "source-module-missing",
        detail: `Modul '${bridge.sourceModuleId}' ist nicht im Registry registriert. Stelle sicher, dass das Modul importiert und registriert wurde.`,
      });
      continue;
    }

    const targetModule = registry.getModuleSync(bridge.targetModuleId);
    if (!targetModule) {
      deadBridges.push({
        bridge,
        reason: "target-module-missing",
        detail: `Modul '${bridge.targetModuleId}' ist nicht im Registry registriert. Stelle sicher, dass das Modul importiert und registriert wurde.`,
      });
      continue;
    }

    const sourceConceptExists = bridge.sourceConceptId in sourceModule.concepts;
    if (!sourceConceptExists) {
      const available = Object.keys(sourceModule.concepts);
      const suggestions = suggestConcepts(bridge.sourceConceptId, available);
      const suggestionText =
        suggestions.length > 0
          ? ` Meintest du '${suggestions.join("' oder '")}'?`
          : "";
      deadBridges.push({
        bridge,
        reason: "source-concept-missing",
        detail:
          `Concept '${bridge.sourceConceptId}' nicht in Modul '${bridge.sourceModuleId}' gefunden. ` +
          `Verfügbare Concepts in '${bridge.sourceModuleId}': [${available.join(", ")}].` +
          suggestionText,
      });
      continue;
    }

    const targetConceptExists = bridge.targetConceptId in targetModule.concepts;
    if (!targetConceptExists) {
      const available = Object.keys(targetModule.concepts);
      const suggestions = suggestConcepts(bridge.targetConceptId, available);
      const suggestionText =
        suggestions.length > 0
          ? ` Meintest du '${suggestions.join("' oder '")}'?`
          : "";
      deadBridges.push({
        bridge,
        reason: "target-concept-missing",
        detail:
          `Concept '${bridge.targetConceptId}' nicht in Modul '${bridge.targetModuleId}' gefunden. ` +
          `Verfügbare Concepts in '${bridge.targetModuleId}': [${available.join(", ")}].` +
          suggestionText,
      });
      continue;
    }
  }

  const validBridges = bridges.length - deadBridges.length;

  return {
    valid: deadBridges.length === 0,
    totalBridges: bridges.length,
    validBridges,
    deadBridges,
  };
}

// ────────────────────────────────────────────────────────────
// Formatter helpers — developer-facing output
// ────────────────────────────────────────────────────────────

export function formatDeadBridgeReport(dead: DeadBridge): string {
  const { bridge, reason, detail } = dead;
  return (
    `❌ Bridge tot: ${bridge.sourceModuleId}.${bridge.sourceConceptId} ↔ ${bridge.targetModuleId}.${bridge.targetConceptId}\n` +
    `   Grund (${reason}): ${detail}`
  );
}

export function formatBridgeValidationReport(result: BridgeValidationResult): string {
  if (result.valid) {
    return `✅ Alle ${result.totalBridges} Bridges sind valide.`;
  }

  const lines: string[] = [
    `❌ Bridge-Validierung fehlgeschlagen: ${result.deadBridges.length} von ${result.totalBridges} Bridges sind tot (${result.validBridges} valide).`,
    "",
  ];

  for (const dead of result.deadBridges) {
    lines.push(formatDeadBridgeReport(dead));
    lines.push("");
  }

  return lines.join("\n");
}

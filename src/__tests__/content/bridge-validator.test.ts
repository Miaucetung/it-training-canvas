/**
 * Bridge Validator Tests
 *
 * Tests the validateBridges() function that ensures all ConceptBridge entries
 * resolve to real Concept IDs in their respective modules.
 *
 * All tests use synthetic in-memory modules — NOT the production registry.
 * The integration test that validates the real bridge inventory is in
 * src/__tests__/content/cross-references.test.ts (see "all registered bridges valid").
 *
 * These unit tests cover every failure mode so that when a bridge breaks,
 * the error message tells the developer exactly what went wrong.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateBridges, formatDeadBridgeReport } from '@/lib/content/bridge-validator';
import type { ContentRegistry } from '@/lib/content/bridge-validator';
import type { ConceptBridge } from '@/lib/content/types';
import type { CertificationModule } from '@/lib/content/types';

// ──────────────────────────────────────────────────────────────────────────────
// Test helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Builds a minimal CertificationModule with the given concept IDs */
function makeModule(id: string, conceptIds: string[]): CertificationModule {
  const concepts: Record<string, import('@/lib/content/types').Concept> = {};
  for (const cid of conceptIds) {
    concepts[cid] = {
      id: cid,
      title: `Concept ${cid}`,
      content: '',
      appliesTo: [id],
      tags: [],
    };
  }
  return {
    id,
    vendor: 'generic',
    title: `Module ${id}`,
    subtitle: '',
    description: '',
    difficulty: 'beginner',
    estimatedHours: 1,
    prerequisites: [],
    relatedModules: [],
    topics: [],
    concepts,
    quizzes: {},
    exercises: {},
    learningPaths: {},
    metadata: {
      slug: id,
      tagline: '',
      objectives: [],
      targetAudience: [],
      previewImageUrl: '',
      priceCents: 0,
      lastUpdated: '2026-01-01',
      certificationBody: 'Test',
      featured: false,
      categories: [],
    },
  } as unknown as CertificationModule;
}

/** Builds a minimal ConceptBridge */
function makeBridge(
  sourceModuleId: string,
  sourceConceptId: string,
  targetModuleId: string,
  targetConceptId: string,
): ConceptBridge {
  return {
    sourceModuleId,
    sourceConceptId,
    targetModuleId,
    targetConceptId,
    bridgeNote: `Test bridge: ${sourceModuleId}.${sourceConceptId} → ${targetModuleId}.${targetConceptId}`,
  };
}

/** Builds a ContentRegistry backed by an in-memory Map */
function makeRegistry(modules: CertificationModule[]): ContentRegistry {
  const map = new Map<string, CertificationModule>(modules.map((m) => [m.id, m]));
  return {
    getModuleSync: (id: string) => map.get(id),
    getAllModules: () => map,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 1: Empty bridge array
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: empty bridge array', () => {
  it('returns valid with zero totals when bridges array is empty', () => {
    const registry = makeRegistry([]);
    const result = validateBridges(registry, []);

    expect(result.valid).toBe(true);
    expect(result.totalBridges).toBe(0);
    expect(result.validBridges).toBe(0);
    expect(result.deadBridges).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 2: All bridges valid
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: all bridges valid', () => {
  let registry: ContentRegistry;
  let bridges: ConceptBridge[];

  beforeEach(() => {
    registry = makeRegistry([
      makeModule('ccna', ['vlans', 'ospf', 'acls']),
      makeModule('az-900', ['vnet-subnet', 'azure-monitor', 'azure-rbac']),
    ]);
    bridges = [
      makeBridge('ccna', 'vlans', 'az-900', 'vnet-subnet'),
      makeBridge('ccna', 'ospf', 'az-900', 'azure-monitor'),
      makeBridge('ccna', 'acls', 'az-900', 'azure-rbac'),
    ];
  });

  it('returns valid: true when all bridges resolve', () => {
    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(true);
    expect(result.totalBridges).toBe(3);
    expect(result.validBridges).toBe(3);
    expect(result.deadBridges).toHaveLength(0);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 3: Source concept missing (concept ID does not exist in module)
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: source concept missing', () => {
  it('detects missing sourceConceptId and reports source-concept-missing', () => {
    const registry = makeRegistry([
      makeModule('ccna', ['ospf']),           // 'vlan' does NOT exist — only 'vlans'
      makeModule('az-900', ['vnet-subnet']),
    ]);
    const bridges = [
      makeBridge('ccna', 'vlan', 'az-900', 'vnet-subnet'), // typo: vlan not vlans
    ];

    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(false);
    expect(result.totalBridges).toBe(1);
    expect(result.validBridges).toBe(0);
    expect(result.deadBridges).toHaveLength(1);
    expect(result.deadBridges[0].reason).toBe('source-concept-missing');
    expect(result.deadBridges[0].detail).toContain('vlan');
    expect(result.deadBridges[0].detail).toContain('ccna');
  });

  it('includes suggestions when similar concept IDs exist (substring match)', () => {
    const registry = makeRegistry([
      makeModule('ccna', ['vlans', 'vlan-hopping', 'vlan-security']),
      makeModule('az-900', ['vnet-subnet']),
    ]);
    const bridges = [makeBridge('ccna', 'vlan', 'az-900', 'vnet-subnet')];

    const result = validateBridges(registry, bridges);

    expect(result.deadBridges[0].detail).toContain('vlans'); // suggestion
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 4: Target concept missing
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: target concept missing', () => {
  it('detects missing targetConceptId and reports target-concept-missing', () => {
    const registry = makeRegistry([
      makeModule('ccna', ['acls']),
      makeModule('az-900', ['azure-rbac']),   // 'nsg' does NOT exist
    ]);
    const bridges = [makeBridge('ccna', 'acls', 'az-900', 'nsg')];

    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(false);
    expect(result.deadBridges[0].reason).toBe('target-concept-missing');
    expect(result.deadBridges[0].detail).toContain('nsg');
    expect(result.deadBridges[0].detail).toContain('az-900');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 5: Source module not registered
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: source module not registered', () => {
  it('detects unregistered source module and reports source-module-missing', () => {
    const registry = makeRegistry([
      makeModule('az-900', ['azure-monitor']),
      // 'ccna' module never registered
    ]);
    const bridges = [makeBridge('ccna', 'ospf', 'az-900', 'azure-monitor')];

    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(false);
    expect(result.deadBridges[0].reason).toBe('source-module-missing');
    expect(result.deadBridges[0].detail).toContain('ccna');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 6: Target module not registered
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: target module not registered', () => {
  it('detects unregistered target module and reports target-module-missing', () => {
    const registry = makeRegistry([
      makeModule('ccna', ['ospf']),
      // 'az-900' module never registered
    ]);
    const bridges = [makeBridge('ccna', 'ospf', 'az-900', 'azure-route-server')];

    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(false);
    expect(result.deadBridges[0].reason).toBe('target-module-missing');
    expect(result.deadBridges[0].detail).toContain('az-900');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 7: Topic-ID used instead of Concept-ID (the Phase-5 bug)
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: topic-ID used as concept-ID (Phase-5 bug pattern)', () => {
  it('detects when a Topic ID is used as sourceConceptId instead of a Concept ID', () => {
    // Simulates: sourceConceptId: "netplus-network-concepts" (Topic)
    //                              vs "netplus-cloud-networking" (Concept)
    const registry = makeRegistry([
      // module has concept "netplus-cloud-networking" but NOT "netplus-network-concepts"
      makeModule('comptia-network-plus', ['netplus-cloud-networking', 'netplus-monitoring']),
      makeModule('az-900', ['vnet-subnet']),
    ]);
    const bridges = [
      // Bug: topic ID used instead of concept ID
      makeBridge('comptia-network-plus', 'netplus-network-concepts', 'az-900', 'vnet-subnet'),
    ];

    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(false);
    expect(result.deadBridges[0].reason).toBe('source-concept-missing');
    // Should suggest the right concept
    expect(result.deadBridges[0].detail).toContain('netplus-cloud-networking');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 8: Multiple dead bridges found simultaneously
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: multiple dead bridges found simultaneously', () => {
  it('collects all dead bridges, not just the first one', () => {
    const registry = makeRegistry([
      makeModule('ccna', ['vlans', 'ospf']),
      makeModule('az-900', ['azure-monitor']),
    ]);
    const bridges = [
      makeBridge('ccna', 'vlans', 'az-900', 'azure-monitor'),         // ✅ valid
      makeBridge('ccna', 'vlan', 'az-900', 'azure-monitor'),          // ❌ typo: vlan not vlans
      makeBridge('ccna', 'ospf', 'az-900', 'azure-route-server'),     // ❌ target missing
      makeBridge('unknown-module', 'ospf', 'az-900', 'azure-monitor'),// ❌ source module missing
    ];

    const result = validateBridges(registry, bridges);

    expect(result.valid).toBe(false);
    expect(result.totalBridges).toBe(4);
    expect(result.validBridges).toBe(1);
    expect(result.deadBridges).toHaveLength(3);

    const reasons = result.deadBridges.map((d) => d.reason);
    expect(reasons).toContain('source-concept-missing');
    expect(reasons).toContain('target-concept-missing');
    expect(reasons).toContain('source-module-missing');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 9: Error message quality — helpful output format
// ──────────────────────────────────────────────────────────────────────────────

describe('validateBridges: error message quality', () => {
  it('detail string includes both concept ID and module ID', () => {
    const registry = makeRegistry([
      makeModule('ccna', ['acls']),
      makeModule('az-900', ['azure-rbac']),
    ]);
    const bridges = [makeBridge('ccna', 'syslog-snmp', 'az-900', 'azure-rbac')];

    const result = validateBridges(registry, bridges);
    const detail = result.deadBridges[0].detail;

    expect(detail).toContain('syslog-snmp');
    expect(detail).toContain('ccna');
  });

  it('formatDeadBridgeReport returns a human-readable multiline string', () => {
    const deadBridge = {
      bridge: makeBridge('ccna', 'syslog-snmp', 'az-900', 'azure-monitor'),
      reason: 'source-concept-missing' as const,
      detail: "Concept 'syslog-snmp' nicht in Modul 'ccna' gefunden. Verfügbare Concepts in 'ccna': [acls, ospf]. Meintest du 'acls'?",
    };

    const report = formatDeadBridgeReport(deadBridge);
    expect(report).toContain('❌');
    expect(report).toContain('ccna.syslog-snmp');
    expect(report).toContain('az-900.azure-monitor');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Scenario 11: formatBridgeValidationReport — both valid and invalid paths
// ──────────────────────────────────────────────────────────────────────────────

import { formatBridgeValidationReport } from '@/lib/content/bridge-validator';

describe('formatBridgeValidationReport', () => {
  it('returns success message when all bridges valid', () => {
    const result = {
      valid: true,
      totalBridges: 5,
      validBridges: 5,
      deadBridges: [],
    };
    const report = formatBridgeValidationReport(result);
    expect(report).toContain('✅');
    expect(report).toContain('5');
  });

  it('returns failure report with all dead bridge details when bridges are dead', () => {
    const deadBridgeEntry = {
      bridge: makeBridge('ccna', 'syslog-snmp', 'az-900', 'azure-monitor'),
      reason: 'source-concept-missing' as const,
      detail: "Concept 'syslog-snmp' nicht in Modul 'ccna' gefunden.",
    };
    const result = {
      valid: false,
      totalBridges: 3,
      validBridges: 2,
      deadBridges: [deadBridgeEntry],
    };
    const report = formatBridgeValidationReport(result);
    expect(report).toContain('❌');
    expect(report).toContain('1 von 3');
    expect(report).toContain('ccna.syslog-snmp');
    expect(report).toContain('az-900.azure-monitor');
  });
});


describe('validateBridges: both sides checked per bridge', () => {
  it('reports both dead sides when both source and target concept are missing', () => {
    // This tests the "subnetting ↔ azure-addressing" pattern (both never created)
    const registry = makeRegistry([
      makeModule('ccna', ['vlans']),      // no 'subnetting' concept
      makeModule('az-900', ['vnet-subnet']), // no 'azure-addressing' concept
    ]);
    const bridges = [
      makeBridge('ccna', 'subnetting', 'az-900', 'azure-addressing'),
    ];

    const result = validateBridges(registry, bridges);

    // Should still report exactly ONE dead bridge entry (first failure wins per bridge)
    expect(result.deadBridges).toHaveLength(1);
    expect(result.valid).toBe(false);
    // source-concept-missing takes priority since it's checked first
    expect(result.deadBridges[0].reason).toBe('source-concept-missing');
  });
});

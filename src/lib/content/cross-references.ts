// ============================================================
// Cross-Reference Engine
// Maps concepts between modules so learners can see:
// "You know X from CCNA — in Azure that's called Y"
// ============================================================

import type {
  Concept,
  ConceptBridge,
  CertificationModule,
} from "@/lib/content/types";
import { contentRegistry } from "@/lib/content/content-registry";

// ────────────────────────────────────────────────────────────
// Static bridges between known modules
// Add entries here as new modules are created
// ────────────────────────────────────────────────────────────
const CONCEPT_BRIDGES: ConceptBridge[] = [
  {
    sourceConceptId: "vlan",
    sourceModuleId: "ccna",
    targetConceptId: "vnet-subnet",
    targetModuleId: "az-900",
    bridgeNote:
      "VLANs im CCNA segmentieren lokale Netzwerke auf Layer 2. In Azure übernimmt das VNet Subnet dieselbe Rolle: logische Isolation innerhalb eines Virtual Network.",
  },
  {
    sourceConceptId: "subnetting",
    sourceModuleId: "ccna",
    targetConceptId: "azure-addressing",
    targetModuleId: "az-900",
    bridgeNote:
      "CIDR-Subnetting aus dem CCNA ist identisch mit der Adressplanung für Azure VNet Address Spaces und Subnets.",
  },
  {
    sourceConceptId: "acl",
    sourceModuleId: "ccna",
    targetConceptId: "nsg",
    targetModuleId: "az-900",
    bridgeNote:
      "Cisco ACLs filtern Traffic auf Router-Interfaces. Azure Network Security Groups (NSGs) erfüllen dieselbe Aufgabe für VMs und Subnets in Azure.",
  },
  {
    sourceConceptId: "nat-pat",
    sourceModuleId: "ccna",
    targetConceptId: "azure-nat-gateway",
    targetModuleId: "az-900",
    bridgeNote:
      "PAT/NAT Overload auf dem Edge-Router entspricht dem Azure NAT Gateway: ausgehender Internettraffic vieler interner Ressourcen über eine öffentliche IP.",
  },
  {
    sourceConceptId: "ospf",
    sourceModuleId: "ccna",
    targetConceptId: "azure-route-server",
    targetModuleId: "az-900",
    bridgeNote:
      "OSPF propagiert Routing-Informationen zwischen Cisco Routern. Azure Route Server ermöglicht dynamischen BGP-Austausch zwischen Azure und On-Premises Routern.",
  },
  {
    sourceConceptId: "dhcp",
    sourceModuleId: "ccna",
    targetConceptId: "azure-dhcp",
    targetModuleId: "az-900",
    bridgeNote:
      "DHCP-Server auf Cisco-Geräten vergeben IP-Adressen dynamisch. Azure übernimmt DHCP automatisch für alle VMs innerhalb eines VNets.",
  },
];

// ────────────────────────────────────────────────────────────
// findRelatedConcepts — core cross-reference function
// Returns concepts in targetModuleId that relate to conceptId
// ────────────────────────────────────────────────────────────
export function findRelatedConcepts(
  conceptId: string,
  targetModuleId: string,
): { concept: Concept; bridge: ConceptBridge }[] {
  const matches = CONCEPT_BRIDGES.filter(
    (b) =>
      (b.sourceConceptId === conceptId && b.targetModuleId === targetModuleId) ||
      (b.targetConceptId === conceptId && b.sourceModuleId === targetModuleId),
  );

  const result: { concept: Concept; bridge: ConceptBridge }[] = [];

  for (const bridge of matches) {
    const targetId =
      bridge.targetModuleId === targetModuleId
        ? bridge.targetConceptId
        : bridge.sourceConceptId;
    const moduleId =
      bridge.targetModuleId === targetModuleId
        ? bridge.targetModuleId
        : bridge.sourceModuleId;

    const module = contentRegistry.getModuleSync(moduleId);
    if (!module) continue;

    const concept = module.concepts[targetId];
    if (concept) {
      result.push({ concept, bridge });
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// getConceptBridgesForModule
// Returns all bridges that involve the given module
// ────────────────────────────────────────────────────────────
export function getConceptBridgesForModule(moduleId: string): ConceptBridge[] {
  return CONCEPT_BRIDGES.filter(
    (b) => b.sourceModuleId === moduleId || b.targetModuleId === moduleId,
  );
}

// ────────────────────────────────────────────────────────────
// findConceptsByTag
// Searches across all registered modules for concepts with tag
// ────────────────────────────────────────────────────────────
export function findConceptsByTag(tag: string): { concept: Concept; moduleId: string }[] {
  const results: { concept: Concept; moduleId: string }[] = [];

  for (const [moduleId, module] of contentRegistry.getAllModules()) {
    for (const concept of Object.values(module.concepts)) {
      if (concept.tags.includes(tag)) {
        results.push({ concept, moduleId });
      }
    }
  }

  return results;
}

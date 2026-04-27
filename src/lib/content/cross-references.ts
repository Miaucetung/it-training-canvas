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
    sourceConceptId: "acls",
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
    sourceConceptId: "aaa-radius",
    sourceModuleId: "ccna",
    targetConceptId: "azure-rbac",
    targetModuleId: "az-900",
    bridgeNote:
      "AAA (Authentication, Authorization, Accounting) mit RADIUS im CCNA entspricht konzeptuell Azure RBAC: beides kontrolliert Zugriffsberechtigungen, aber RBAC ist feingranularer und für Cloud-Ressourcen optimiert (kein Accounting, kein RADIUS-Protokoll).",
  },
  {
    sourceConceptId: "stp-redundancy",
    sourceModuleId: "ccna",
    targetConceptId: "azure-availability-zones",
    targetModuleId: "az-900",
    bridgeNote:
      "STP verhindert Switching-Loops durch Redundanz-Management im LAN. Azure Availability Zones sichern Hochverfügbarkeit auf Rechenzentrumsebene — Redundanz als Architekturprinzip auf Cloud-Ebene.",
  },
  {
    sourceConceptId: "syslog-snmp",
    sourceModuleId: "ccna",
    targetConceptId: "azure-monitor",
    targetModuleId: "az-900",
    bridgeNote:
      "Syslog und SNMP sammeln Logs und Metriken von Cisco-Geräten. Azure Monitor ist das Cloud-Äquivalent: zentrales Monitoring aller Azure-Ressourcen mit Log Analytics, Metriken und Alerts.",
  },
  // ── Trilaterale Brücken: CCNA ↔ N10-009 ↔ AZ-900 ──────────
  {
    sourceConceptId: "netplus-monitoring",
    sourceModuleId: "comptia-network-plus",
    targetConceptId: "azure-monitor",
    targetModuleId: "az-900",
    bridgeNote:
      "Network+ SNMP/Syslog ist das vendor-neutrale Fundament. Azure Monitor (AZ-900) ist die Cloud-native Umsetzung: dasselbe Bedürfnis (zentrale Metrik- und Log-Sammlung), unterschiedliche Implementierung. Trilateraler Knoten: CCNA (Cisco-IOS-Syslog) → N10-009 (Konzept) → AZ-900 (Cloud-Plattform).",
  },
  {
    sourceConceptId: "netplus-security-fundamentals",
    sourceModuleId: "comptia-network-plus",
    targetConceptId: "azure-rbac",
    targetModuleId: "az-900",
    bridgeNote:
      "IAM-Konzepte in N10-009 (Authentifizierung, Autorisierung, Least Privilege) sind vendor-neutral. Azure RBAC (AZ-900) implementiert Autorisierung als rollenbasiertes Modell auf Cloud-Ressourcen. N10-009 liefert das Konzept, AZ-900 die Azure-spezifische Umsetzung.",
  },
  {
    sourceConceptId: "netplus-network-concepts",
    sourceModuleId: "comptia-network-plus",
    targetConceptId: "vnet-subnet",
    targetModuleId: "az-900",
    bridgeNote:
      "VPC/Cloud-Networking in N10-009 (Domain 1.2) ist das vendor-neutrale Pendant zu Azure VNet und Subnets (AZ-900). N10-009: Konzept. AZ-900: Microsoft-Implementierung.",
  },
  {
    sourceConceptId: "netplus-switching-vlans",
    sourceModuleId: "comptia-network-plus",
    targetConceptId: "vlans",
    targetModuleId: "ccna",
    bridgeNote:
      "VLANs und 802.1Q in N10-009 vendor-neutral (Tagged/Untagged Port). In CCNA mit Cisco-IOS (Trunk/Access Port, PVST+). Konzepte identisch, Terminologie und Implementierung verschieden.",
  },
  {
    sourceConceptId: "netplus-routing",
    sourceModuleId: "comptia-network-plus",
    targetConceptId: "ospf",
    targetModuleId: "ccna",
    bridgeNote:
      "OSPF in N10-009 vendor-neutral (RFC 2328). In CCNA mit Cisco-IOS-Konfiguration (network-Befehl, DR/BDR, Cisco-Areas). Protokoll identisch, Cisco-Praxis vs. N+-Konzept.",
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

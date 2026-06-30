// ============================================================
// Cross-Reference Engine
// Maps concepts between modules so learners can see:
// "You know X from CCNA — in Azure that's called Y"
// ============================================================

import type {
  Concept,
  ConceptBridge,
} from "@/lib/content/types";
import { contentRegistry } from "@/lib/content/content-registry";

// ────────────────────────────────────────────────────────────
// Static bridges between known modules
// Add entries here as new modules are created
// ────────────────────────────────────────────────────────────
export const CONCEPT_BRIDGES: ConceptBridge[] = [
  // ── Intra-CCNA: DHCP-Relay setzt Inter-VLAN-Routing & Trunking voraus ──
  {
    sourceConceptId: "dhcp-relay",
    sourceModuleId: "ccna",
    targetConceptId: "inter-vlan-routing-roas",
    targetModuleId: "ccna",
    bridgeNote:
      "DHCP-Relay (ip helper-address) lebt auf den Router-Subinterfaces des Inter-VLAN-Routings: Genau dort, wo Router-on-a-Stick die VLAN-Gateways terminiert, fängt der Relay-Agent die Client-Broadcasts ab und setzt das giaddr für die Pool-Auswahl.",
  },
  {
    sourceConceptId: "dhcp-relay",
    sourceModuleId: "ccna",
    targetConceptId: "vlans",
    targetModuleId: "ccna",
    bridgeNote:
      "Ohne korrekten 802.1Q-Trunk zwischen Switch und Router erreichen die getaggten VLAN-Frames die Relay-Subinterfaces nicht. Trunking ist damit die Layer-2-Voraussetzung, bevor DHCP-Relay über VLAN-Grenzen funktioniert.",
  },
  // ── Intra-CCNA: Wildcard-Block-Ausrichtung ⇄ Subnetting (Blockgrößen-Prinzip) ──
  {
    sourceConceptId: "acl-wildcard-alignment",
    sourceModuleId: "ccna",
    targetConceptId: "subnetting-drill",
    targetModuleId: "ccna",
    bridgeNote:
      "Dieselbe Blockgrößen-Logik wie beim Subnetting, nur gespiegelt: Im Subnetting bestimmt die Maske die Schrittweite der Subnetze, bei ACL-Wildcards die Größe und den erlaubten Startwert eines „egal“-Blocks. „Start mod Blockgröße = 0“ ist exakt die Subnetz-Grenz-Regel — wer Magic-Number-Subnetting beherrscht, rechnet Wildcard-Ausrichtung mit demselben Trick.",
  },
  {
    sourceConceptId: "vlans",
    sourceModuleId: "ccna",
    targetConceptId: "vnet-subnet",
    targetModuleId: "az-900",
    bridgeNote:
      "VLANs im CCNA segmentieren lokale Netzwerke auf Layer 2. In Azure übernimmt das VNet Subnet dieselbe Rolle: logische Isolation innerhalb eines Virtual Network.",
  },
  // Bridge 2 (subnetting ↔ azure-addressing) entfernt: keines der beiden Concepts existiert.
  // CCNA hat kein 'subnetting'-Concept (nur 'ipv4-addressing-guide' in ipv4-addressing.ts).
  // AZ-900 hat kein 'azure-addressing'-Concept. Ohne reale Concepts ist eine Bridge nicht validierbar.
  {
    sourceConceptId: "acl-extended",
    sourceModuleId: "ccna",
    targetConceptId: "azure-network-services",
    targetModuleId: "az-900",
    bridgeNote:
      "Cisco ACLs filtern Traffic auf Router-Interfaces nach Quelle/Ziel/Port. Azure Network Services (NSG, Azure Firewall) erfüllen dieselbe Funktion für Cloud-Ressourcen.",
  },
  {
    sourceConceptId: "nat",
    sourceModuleId: "ccna",
    targetConceptId: "azure-connectivity",
    targetModuleId: "az-900",
    bridgeNote:
      "PAT/NAT auf dem Edge-Router ermöglicht ausgehenden Internettraffic vieler interner Hosts über eine öffentliche IP. Azure Connectivity-Optionen (NAT Gateway, Load Balancer Outbound) lösen dasselbe Problem in der Cloud.",
  },
  {
    sourceConceptId: "ospf",
    sourceModuleId: "ccna",
    targetConceptId: "azure-connectivity",
    targetModuleId: "az-900",
    bridgeNote:
      "OSPF propagiert Routing-Informationen zwischen Routern im LAN/WAN. Azure Connectivity-Optionen (VPN Gateway, ExpressRoute, Route Tables) übernehmen dynamisches Routing in der Cloud.",
  },
  {
    sourceConceptId: "security-fundamentals",
    sourceModuleId: "ccna",
    targetConceptId: "azure-rbac",
    targetModuleId: "az-900",
    bridgeNote:
      "AAA-Konzepte (Authentication, Authorization, Accounting) aus dem CCNA-Security-Modul entsprechen konzeptuell Azure RBAC: beides kontrolliert Zugriffsberechtigungen, RBAC ist feingranularer und für Cloud-Ressourcen optimiert.",
  },
  {
    sourceConceptId: "stp",
    sourceModuleId: "ccna",
    targetConceptId: "azure-availability-zones",
    targetModuleId: "az-900",
    bridgeNote:
      "STP verhindert Switching-Loops durch Redundanz-Management im LAN. Azure Availability Zones sichern Hochverfügbarkeit auf Rechenzentrumsebene — Redundanz als Architekturprinzip auf Cloud-Ebene.",
  },
  // Bridge 8 (syslog-snmp ↔ azure-monitor) entfernt: CCNA hat kein Concept 'syslog-snmp'.
  // Monitoring-Concepts in CCNA sind in den Topics beschrieben, aber kein eigenes Concept.
  // Bridge wird hinzugefügt, sobald CCNA ein 'network-monitoring' Concept erhält.
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
    sourceConceptId: "netplus-cloud-networking",
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
      (b.sourceConceptId === conceptId &&
        b.targetModuleId === targetModuleId) ||
      (b.targetConceptId === conceptId && b.sourceModuleId === targetModuleId),
  );

  const result: { concept: Concept; bridge: ConceptBridge }[] = [];

  for (const bridge of matches) {
    // "Other end" = die Seite, die NICHT das angefragte Concept ist.
    // Wichtig für Intra-Modul-Bridges (ccna ↔ ccna): dort sind beide
    // moduleIds gleich, daher muss anhand der conceptId unterschieden
    // werden — sonst würde das Concept als Querverweis auf sich selbst
    // zurückgegeben.
    const queriedIsSource = bridge.sourceConceptId === conceptId;
    const targetId = queriedIsSource
      ? bridge.targetConceptId
      : bridge.sourceConceptId;
    const moduleId = queriedIsSource
      ? bridge.targetModuleId
      : bridge.sourceModuleId;

    const module = contentRegistry.getModuleSync(moduleId);
    if (!module) continue;

    const concept = module.concepts[targetId];
    // Selbst-Referenz ausschließen (Robustheit gegen Self-Bridges)
    if (concept && concept.id !== conceptId) {
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
export function findConceptsByTag(
  tag: string,
): { concept: Concept; moduleId: string }[] {
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

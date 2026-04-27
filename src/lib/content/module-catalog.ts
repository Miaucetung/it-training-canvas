// ============================================================
// Module Catalog — landing page / marketing metadata
// No UI here — pure data that a future landing page consumes.
// Each entry mirrors the CourseMetadata shape from types.ts.
// ============================================================

import { listAvailableModuleIds } from "@/lib/content/content-loader";
import { contentRegistry } from "@/lib/content/content-registry";
import type { CourseMetadata } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// getCatalog — returns metadata for all registered modules
// ────────────────────────────────────────────────────────────
export async function getCatalog(): Promise<CourseMetadata[]> {
  return contentRegistry.listModules();
}

// ────────────────────────────────────────────────────────────
// getAvailableModuleCount — useful for banners / counters
// ────────────────────────────────────────────────────────────
export function getAvailableModuleCount(): number {
  return listAvailableModuleIds().length;
}

// ────────────────────────────────────────────────────────────
// CATALOG_PREVIEW — static snapshot for build-time rendering
// (e.g. SSG / SEO). Keep in sync with actual module metadata.
// ────────────────────────────────────────────────────────────
export const CATALOG_PREVIEW: CourseMetadata[] = [
  {
    slug: "ccna",
    tagline:
      "Cisco CCNA 200-301 — Netzwerkgrundlagen bis OSPF, Security & WLAN",
    objectives: [
      "OSI/TCP-IP Modell verstehen und anwenden",
      "IPv4/IPv6 Adressierung und Subnetting beherrschen",
      "Switching: VLANs, STP, EtherChannel konfigurieren",
      "Routing: Statisch, OSPF Single-Area und Multi-Area",
      "Netzwerksicherheit: ACLs, Port-Security, DHCP Snooping, DAI",
      "WLAN Grundlagen und Cisco Wireless-Architektur",
      "DHCP, NAT/PAT konfigurieren und troubleshooten",
    ],
    targetAudience: [
      "Fachinformatiker Systemintegration (Azubis)",
      "IT-Einsteiger mit Interesse an Netzwerken",
      "CCNA-Prüfungskandidaten",
    ],
    previewImageUrl: "/assets/modules/ccna-preview.png",
    priceCents: 0, // free
    lastUpdated: "2026-04-26",
    certificationBody: "Cisco",
    certValidityMonths: 36,
    featured: true,
    categories: ["networking", "cisco", "enterprise", "certification"],
  },
  {
    slug: "az-900",
    tagline: "Azure Fundamentals — solide Cloud-Grundlagen, sofort prüfungsrelevant",
    objectives: [
      "Cloud-Konzepte (IaaS, PaaS, SaaS, Shared Responsibility) erklären",
      "Azure-Architektur: Regionen, Availability Zones, Ressourcen-Hierarchie",
      "Kernservices: Compute, Networking, Storage verstehen und abgrenzen",
      "Identity & Security: Entra ID, RBAC, Zero Trust, Defender for Cloud, Sentinel",
      "Governance: Management Groups, Azure Policy, Resource Locks, Microsoft Purview",
      "Management Tools: Portal, Cloud Shell, Azure Arc, Bicep, ARM Templates",
      "Monitoring: Azure Advisor, Service Health, Azure Monitor, Log Analytics",
      "Cost Management: Pricing Calculator, Cost Management, Composite SLA",
    ],
    targetAudience: [
      "IT-Einsteiger und Quereinsteiger ohne Azure-Vorwissen",
      "Entwickler und Admins, die eine fundierte Azure-Grundlage aufbauen wollen",
      "AZ-900-Prüfungskandidaten, die prüfungsrelevantes Wissen strukturiert erwerben wollen",
    ],
    previewImageUrl: "/assets/modules/az-900-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-27",
    certificationBody: "Microsoft",
    certValidityMonths: 24,
    featured: true,
    categories: ["cloud", "azure", "microsoft", "certification"],
  },
  // Stubs — uncomment when module is created
  // {
  //   slug: 'comptia-network-plus',
  //   tagline: 'CompTIA Network+ — Hersteller-neutrale Netzwerk-Zertifizierung',
  //   ...
  // },
];

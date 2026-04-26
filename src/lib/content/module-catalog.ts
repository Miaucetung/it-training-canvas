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
    tagline: "Microsoft Azure Fundamentals — Cloud-Grundlagen für den Einstieg",
    objectives: [
      "Cloud-Konzepte (IaaS, PaaS, SaaS) beschreiben",
      "Azure-Kerndienste kennenlernen (Compute, Storage, Networking)",
      "Azure-Preismodelle und SLAs verstehen",
      "Sicherheit und Compliance in Azure",
    ],
    targetAudience: [
      "IT-Einsteiger und Quer­einsteiger",
      "Entwickler ohne Cloud-Hintergrund",
      "AZ-900-Prüfungskandidaten",
    ],
    previewImageUrl: "/assets/modules/az-900-preview.png",
    priceCents: 0,
    lastUpdated: "2026-04-26",
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

// ============================================================
// Content Loader
// Lazy-loads module definitions and registers them.
// Future: swap the static imports for dynamic fetch() calls
// pointing at a CMS/API without changing any component code.
// ============================================================

import { contentRegistry } from "@/lib/content/content-registry";
import type { CertificationModule } from "@/lib/content/types";

// ────────────────────────────────────────────────────────────
// Module factory functions — each import returns a function
// that builds and returns a CertificationModule.
// Dynamic import() makes each module a separate JS chunk.
// ────────────────────────────────────────────────────────────
type ModuleFactory = () => Promise<{ default: CertificationModule }>;

const MODULE_FACTORIES: Record<string, ModuleFactory> = {
  ccna: () => import("@/content/modules/ccna/index"),
  "az-900": () => import("@/content/modules/az-900/index"),
  // Add new modules here — no other files need to change:
  "comptia-network-plus": () => import("@/content/modules/comptia-network-plus/index"),
  // 'az-104': () => import('@/content/modules/az-104/index'),
};

// ────────────────────────────────────────────────────────────
// loadModule — loads and registers a single module on demand
// ────────────────────────────────────────────────────────────
export async function loadModule(id: string): Promise<CertificationModule> {
  if (contentRegistry.isRegistered(id)) {
    return contentRegistry.getModule(id);
  }

  const factory = MODULE_FACTORIES[id];
  if (!factory) {
    throw new Error(
      `[ContentLoader] No factory registered for module '${id}'.`,
    );
  }

  const { default: module } = await factory();
  contentRegistry.register(module);
  return module;
}

// ────────────────────────────────────────────────────────────
// loadAllModules — eager-loads every registered module
// Call this at app startup if you want everything in memory.
// ────────────────────────────────────────────────────────────
export async function loadAllModules(): Promise<void> {
  await Promise.all(Object.keys(MODULE_FACTORIES).map(loadModule));
}

// ────────────────────────────────────────────────────────────
// listAvailableModuleIds — returns IDs without loading content
// ────────────────────────────────────────────────────────────
export function listAvailableModuleIds(): string[] {
  return Object.keys(MODULE_FACTORIES);
}

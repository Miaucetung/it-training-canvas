// ============================================================
// Content Registry — the single source of truth for all modules
// To add a new module: import it here and call register().
// No other core files need to change.
// ============================================================

import type { CertificationModule } from "@/lib/content/types";

class ContentRegistry {
  private readonly modules = new Map<string, CertificationModule>();

  register(module: CertificationModule): void {
    if (this.modules.has(module.id)) {
      console.warn(
        `[ContentRegistry] Module '${module.id}' already registered — overwriting.`,
      );
    }
    this.modules.set(module.id, module);
  }

  getModuleSync(id: string): CertificationModule | undefined {
    return this.modules.get(id);
  }

  async getModule(id: string): Promise<CertificationModule> {
    const module = this.modules.get(id);
    if (!module) {
      throw new Error(
        `[ContentRegistry] Module '${id}' not found. Did you register it?`,
      );
    }
    return module;
  }

  async listModules() {
    return Array.from(this.modules.values()).map((m) => m.metadata);
  }

  getAllModules(): Map<string, CertificationModule> {
    return this.modules;
  }

  isRegistered(id: string): boolean {
    return this.modules.has(id);
  }

  /** Filter modules by vendor (useful for catalog views and tests) */
  listModulesByVendor(vendor: string): CertificationModule[] {
    return Array.from(this.modules.values()).filter((m) => m.vendor === vendor);
  }

  /**
   * TESTING ONLY — resets the registry to empty state.
   * Never call this in production code.
   */
  _resetForTesting(): void {
    (this.modules as Map<string, CertificationModule>).clear();
  }
}

// Singleton — import this in modules to register, in components to query
export const contentRegistry = new ContentRegistry();

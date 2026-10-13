import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { migrateLocalStorageCanvasToV2, V1_STORAGE_KEY, V2_STORAGE_KEY } from "@/lib/topology/migration";

class MemoryStorage implements Storage {
  private d = new Map<string, string>();
  get length() { return this.d.size; }
  clear() { this.d.clear(); }
  getItem(k: string) { return this.d.has(k) ? this.d.get(k)! : null; }
  key(i: number) { return Array.from(this.d.keys())[i] ?? null; }
  removeItem(k: string) { this.d.delete(k); }
  setItem(k: string, v: string) { this.d.set(k, String(v)); }
}

describe("Migrationskonflikt: Beschriftung entspricht dem Verhalten (B-17)", () => {
  it("Backup eines Konflikts enthält den v2-Stand, nicht den v1-Stand", () => {
    const st = new MemoryStorage();
    const v2 = {
      Nets: {
        id: "t", name: "t", version: "2.0", devices: [], links: [],
        metadata: { updatedAt: "2026-01-02T00:00:00.000Z", author: "Nutzer" },
      },
    };
    st.setItem(V2_STORAGE_KEY, JSON.stringify(v2));
    st.setItem(
      V1_STORAGE_KEY,
      JSON.stringify({ Nets: { lastModified: Date.parse("2026-02-01T00:00:00.000Z"), canvasState: { objects: [{ id: "x", type: "text", text: "v1", startPoint: { x: 1, y: 1 }, color: "#fff", width: 1 }], connections: [] } } })
    );
    const res = migrateLocalStorageCanvasToV2({ storage: st });
    expect(res.conflicts).toHaveLength(1);
    expect(JSON.parse(st.getItem(res.conflicts[0].backupKey)!)).toEqual(v2);
  });

  it("die Schaltfläche behauptet nicht, den v1-Stand zu laden", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/canvas-v2/CanvasV2Container.tsx"), "utf8");
    expect(src).not.toContain("Alten Stand (v1) laden");
    expect(src).not.toContain("Lädt die Version aus dem alten Canvas (v1)");
    expect(src).toContain("Gesicherten v2-Stand wiederherstellen");
  });
});

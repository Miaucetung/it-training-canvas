import { describe, it, expect } from "vitest";
import {
  saveNamedTopology,
  TOPOLOGY_LIBRARY_KEY,
  getNamedTopologies,
} from "@/lib/topology/storage-manager";
import { TOPOLOGY_BASIC_LAN } from "@/lib/topology/sample-topologies";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  failKeys: RegExp | null = null;
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(k: string) {
    return this.data.has(k) ? this.data.get(k)! : null;
  }
  key(i: number) {
    return Array.from(this.data.keys())[i] ?? null;
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  setItem(k: string, v: string) {
    if (this.failKeys?.test(k)) throw new Error("boom");
    this.data.set(k, String(v));
  }
  keys() {
    return Array.from(this.data.keys());
  }
}

describe("Topologie-Bibliothek: defekte Daten (B-19)", () => {
  it("sichert eine beschädigte Bibliothek, bevor sie ersetzt wird", () => {
    const st = new MemoryStorage();
    st.setItem(TOPOLOGY_LIBRARY_KEY, '{"a": {"id": "a", "name":'); // abgeschnittenes JSON
    const res = saveNamedTopology(TOPOLOGY_BASIC_LAN, st);
    expect(res.success).toBe(true);
    const backups = st.keys().filter((k) => k.startsWith(`${TOPOLOGY_LIBRARY_KEY}-corrupt-`));
    expect(backups).toHaveLength(1);
    expect(st.getItem(backups[0])).toBe('{"a": {"id": "a", "name":');
    expect(getNamedTopologies(st)).toHaveLength(1);
  });

  it("überschreibt nichts, wenn die Sicherung nicht möglich ist", () => {
    const st = new MemoryStorage();
    st.setItem(TOPOLOGY_LIBRARY_KEY, "not json");
    st.failKeys = /corrupt/;
    const res = saveNamedTopology(TOPOLOGY_BASIC_LAN, st);
    expect(res.success).toBe(false);
    expect(st.getItem(TOPOLOGY_LIBRARY_KEY)).toBe("not json");
  });

  it("Array statt Objekt gilt als defekt", () => {
    const st = new MemoryStorage();
    st.setItem(TOPOLOGY_LIBRARY_KEY, "[1,2,3]");
    expect(saveNamedTopology(TOPOLOGY_BASIC_LAN, st).success).toBe(true);
    expect(st.keys().some((k) => k.includes("-corrupt-"))).toBe(true);
  });

  it("intakte Bibliothek wird ergänzt und nicht gesichert", () => {
    const st = new MemoryStorage();
    expect(saveNamedTopology(TOPOLOGY_BASIC_LAN, st).success).toBe(true);
    expect(saveNamedTopology({ ...TOPOLOGY_BASIC_LAN, id: "second" }, st).success).toBe(true);
    expect(getNamedTopologies(st)).toHaveLength(2);
    expect(st.keys().some((k) => k.includes("-corrupt-"))).toBe(false);
  });
});

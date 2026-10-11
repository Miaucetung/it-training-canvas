// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  deleteNamedTopology,
  generateCleanSvgString,
  getNamedTopologies,
  importTopologyFromJson,
  loadNamedTopology,
  MAX_IMPORT_BYTES,
  saveNamedTopology,
} from "@/lib/topology/storage-manager";
import { TOPOLOGY_BASIC_LAN } from "@/lib/topology/sample-topologies";
import { NetworkTopology } from "@/types/topology";

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("Topology Storage & Export Manager (2d-3)", () => {
  describe("Named Topologies in LocalStorage", () => {
    it("saves and loads a named topology cleanly", () => {
      const storage = new MockStorage();
      const res = saveNamedTopology(TOPOLOGY_BASIC_LAN, storage);
      expect(res.success).toBe(true);

      const loaded = loadNamedTopology(TOPOLOGY_BASIC_LAN.id, storage);
      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(TOPOLOGY_BASIC_LAN.id);
      expect(loaded?.devices).toHaveLength(5);
    });

    it("lists all named topologies with summary statistics", () => {
      const storage = new MockStorage();
      saveNamedTopology(TOPOLOGY_BASIC_LAN, storage);

      const secondTopo: NetworkTopology = {
        ...TOPOLOGY_BASIC_LAN,
        id: "custom-lab-1",
        name: "OSPF Multiarea Labor",
      };
      saveNamedTopology(secondTopo, storage);

      const list = getNamedTopologies(storage);
      expect(list).toHaveLength(2);
      expect(list.some((t) => t.name === "OSPF Multiarea Labor")).toBe(true);
      expect(list[0].deviceCount).toBe(5);
    });

    it("deletes a named topology without affecting others", () => {
      const storage = new MockStorage();
      saveNamedTopology(TOPOLOGY_BASIC_LAN, storage);
      const secondTopo: NetworkTopology = {
        ...TOPOLOGY_BASIC_LAN,
        id: "to-delete",
        name: "Wegwerf-Topologie",
      };
      saveNamedTopology(secondTopo, storage);

      expect(getNamedTopologies(storage)).toHaveLength(2);
      const deleted = deleteNamedTopology("to-delete", storage);
      expect(deleted).toBe(true);

      expect(getNamedTopologies(storage)).toHaveLength(1);
      expect(loadNamedTopology("to-delete", storage)).toBeNull();
    });

    it("handles QuotaExceededError safely with user notification", () => {
      const storage = new MockStorage();
      storage.setItem = () => {
        const err = new DOMException("Quota exceeded", "QuotaExceededError");
        throw err;
      };

      const res = saveNamedTopology(TOPOLOGY_BASIC_LAN, storage);
      expect(res.success).toBe(false);
      expect(res.quotaExceeded).toBe(true);
      expect(res.error).toContain("Speicherlimit im Browser");
    });
  });

  describe("JSON Import Validation", () => {
    it("imports a valid CCNA 2.0 JSON topology successfully", () => {
      const json = JSON.stringify(TOPOLOGY_BASIC_LAN);
      const res = importTopologyFromJson(json);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe(TOPOLOGY_BASIC_LAN.id);
    });

    it("rejects payload exceeding the 2MB size limit", () => {
      // Erzeuge String > 2MB
      const bigString = "x".repeat(MAX_IMPORT_BYTES + 1024);
      const res = importTopologyFromJson(bigString);
      expect(res.success).toBe(false);
      expect(res.error).toContain("überschreitet das maximal zulässige Limit von 2 MB");
    });

    it("rejects malformed non-JSON data with informative error", () => {
      const res = importTopologyFromJson("{ malformed: json, ");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Ungültiges JSON-Dateiformat");
    });

    it("discards unknown fields while preserving user text unmutated in the data model", () => {
      const jsonPayload = JSON.stringify({
        ...TOPOLOGY_BASIC_LAN,
        name: "Test Lab <script>alert('xss')</script>",
        unexpectedUnknownProperty: "should be discarded",
        devices: [
          {
            ...TOPOLOGY_BASIC_LAN.devices[0],
            name: "Router-1<script>malicious()</script>",
            rogueField: "hacker_payload",
            config: {
              ...TOPOLOGY_BASIC_LAN.devices[0].config,
              hostname: "R1-Clean",
              customInjectedValue: 12345,
            },
          },
        ],
      });

      const res = importTopologyFromJson(jsonPayload);
      expect(res.success).toBe(true);
      // Nutzertexte bleiben im Datenmodell unverändert erhalten (Escaping erfolgt erst bei der Ausgabe)
      expect(res.data?.name).toBe("Test Lab <script>alert('xss')</script>");
      expect(res.data?.devices[0].name).toBe("Router-1<script>malicious()</script>");
      // Unbekannte Felder werden von Zod Schema-Validierung verworfen
      expect((res.data as unknown as Record<string, unknown>).unexpectedUnknownProperty).toBeUndefined();
      expect((res.data?.devices[0] as unknown as Record<string, unknown>).rogueField).toBeUndefined();
      expect((res.data?.devices[0].config as unknown as Record<string, unknown>).customInjectedValue).toBeUndefined();
    });
  });

  describe("SVG Export Escaping & Security", () => {
    it("escapes user text characters and removes script tags or event handlers", () => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "800");
      svg.setAttribute("height", "600");

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.textContent = 'R&D Department <SW-1> & "Lab"';
      text.setAttribute("onclick", "alert('clicked')");
      svg.appendChild(text);

      const script = document.createElementNS("http://www.w3.org/2000/svg", "script");
      script.textContent = "window.hacked = true;";
      svg.appendChild(script);

      const cleaned = generateCleanSvgString(svg);
      expect(cleaned).toContain("&amp;");
      expect(cleaned).toContain("&lt;SW-1&gt;");
      expect(cleaned).not.toContain("<script");
      expect(cleaned).not.toContain("window.hacked");
      expect(cleaned).not.toContain("onclick=");
    });
  });
});

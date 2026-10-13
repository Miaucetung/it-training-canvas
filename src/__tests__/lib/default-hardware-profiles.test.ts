import { describe, it, expect } from "vitest";
import { getDefaultInterfacesForType } from "@/lib/topology/topology-operations";

const names = (t: Parameters<typeof getDefaultInterfacesForType>[0]) =>
  getDefaultInterfacesForType(t).map((i) => i.name);

describe("Hardware-Profile (B-11)", () => {
  it("Catalyst 2960-24TT: Fa0/1-24 und Gi0/1-2", () => {
    const n = names("switch-l2");
    for (let i = 1; i <= 24; i++) expect(n).toContain(`Fa0/${i}`);
    expect(n).not.toContain("Fa0/25");
    expect(n).toContain("Gi0/1");
    expect(n).toContain("Gi0/2");
    expect(n.filter((x) => x.startsWith("Fa"))).toHaveLength(24);
  });

  it("Interface-IDs sind eindeutig", () => {
    const ids = getDefaultInterfacesForType("switch-l2").map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ISR 2911: Gi0/0-0/2", () => {
    const n = names("router");
    expect(n.slice(0, 3)).toEqual(["Gi0/0", "Gi0/1", "Gi0/2"]);
  });

  it("Catalyst 3650-24PS: Gi1/0/1-24 und Gi1/1/1-4", () => {
    const n = names("switch-l3");
    expect(n.filter((x) => x.startsWith("Gi1/0/"))).toHaveLength(24);
    expect(n.filter((x) => x.startsWith("Gi1/1/"))).toHaveLength(4);
  });
});

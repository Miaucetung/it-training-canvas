import { describe, it, expect } from "vitest";
import { createNewDevice } from "@/lib/topology/topology-operations";
import { getOspfRouterId } from "@/lib/topology/ospf-neighbors";

describe("Neue Router: keine doppelte Standard-Loopback-IP (B-12)", () => {
  it("Lo0 trägt keine vorbelegte IP", () => {
    const r = createNewDevice("router", 0, 0, "R1");
    expect(r.interfaces.find((i) => i.name === "Lo0")?.ip).toBeUndefined();
  });

  it("zwei neue Router haben keine identische Router-ID", () => {
    const a = createNewDevice("router", 0, 0, "R1");
    const b = createNewDevice("router", 0, 0, "R2");
    expect(getOspfRouterId(a)).toBeNull();
    expect(getOspfRouterId(b)).toBeNull();
    const ips = [a, b].flatMap((d) => d.interfaces.map((i) => i.ip).filter(Boolean));
    expect(new Set(ips).size).toBe(ips.length);
  });
});

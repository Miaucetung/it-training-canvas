import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { computeStructuredRoutingTable } from "@/lib/topology/routing-table";
import type { NetworkTopology } from "@/types/topology";

const eigrp = (): NetworkTopology => buildNetworkTopologyFromLab(LABS.find((l) => l.id === "eigrp")!, CURATED_TOPOLOGIES.eigrp, "target").topology;
const dev = (t: NetworkTopology, n: string) => t.devices.find((d) => d.name === n)!;

describe("Connected- und Local-Routen nur bei line protocol up", () => {
  it("eigrp-Zielzustand: R1 Gi0/2 shutdown → keine C/L-Route für 10.0.13.0/30", () => {
    const t = eigrp();
    const prefixes = computeStructuredRoutingTable(dev(t, "R1"), t).routes.map((r) => `${r.protocol} ${r.prefix}`);
    expect(prefixes).not.toContain("C 10.0.13.0/30");
    expect(prefixes).not.toContain("L 10.0.13.1/32");
    expect(prefixes).toContain("C 10.0.12.0/30");
  });

  it("shutdown an einem Ende: die Gegenseite ist line protocol down (R3 Gi0/1), ihr Netz fehlt auch auf R3", () => {
    const t = eigrp();
    expect(dev(t, "R3").interfaces.find((i) => i.name === "Gi0/1")!.status).toBe("down");
    const prefixes = computeStructuredRoutingTable(dev(t, "R3"), t).routes.map((r) => `${r.protocol} ${r.prefix}`);
    expect(prefixes).not.toContain("C 10.0.13.0/30");
  });
});

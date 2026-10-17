import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { computePortChannels, computeStp, formatShowSpanningTree, portChannelCost } from "@/lib/topology/stp-calc";
import { simulatePing } from "@/lib/topology/simulation/packet-simulator";
import type { ChannelGroupMode, NetworkTopology } from "@/types/topology";

function etherchannel(): NetworkTopology {
  const lab = LABS.find((l) => l.id === "etherchannel")!;
  return buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES.etherchannel, "target").topology;
}
const byName = (t: NetworkTopology, n: string) => t.devices.find((d) => d.name === n)!;

function withChannelModes(t: NetworkTopology, a: ChannelGroupMode, b: ChannelGroupMode): NetworkTopology {
  const c = structuredClone(t);
  for (const i of byName(c, "SW1").interfaces) if (i.channelGroup) i.channelGroup.mode = a;
  for (const i of byName(c, "SW2").interfaces) if (i.channelGroup) i.channelGroup.mode = b;
  return c;
}

describe("Port-Channel in stp-calc", () => {
  it("ein ausgehandelter Port-Channel ist ein logischer Link: Po1 mit beiden Membern auf jedem Switch", () => {
    const t = etherchannel();
    const bundles = computePortChannels(t);
    const sw1 = bundles.get(byName(t, "SW1").id)!;
    expect(sw1).toHaveLength(1);
    expect(sw1[0].iface.name).toBe("Po1");
    expect(sw1[0].members.map((m) => m.name).sort()).toEqual(["Fa0/1", "Fa0/2"]);
  });

  it("STP: keine Member-Ports, Po1 mit Kosten 12 (2× FastEthernet); kein Port blockiert", () => {
    const t = etherchannel();
    const stp = computeStp(t);
    const sw2 = stp.get(byName(t, "SW2").id)!;
    expect(sw2.ports.map((p) => p.iface.name).sort()).toEqual(["Fa0/3", "Po1"]);
    const po = sw2.ports.find((p) => p.iface.name === "Po1")!;
    expect(po.role).toBe("Root");
    expect(po.state).toBe("FWD");
    expect(po.cost).toBe(12);
    expect(sw2.rootPathCost).toBe(12);
    expect([...stp.values()].flatMap((b) => b.ports).some((p) => p.state === "BLK")).toBe(false);
  });

  it("show spanning-tree zeigt Po1 und den Root-Port als Port-channel1", () => {
    const t = etherchannel();
    const out = formatShowSpanningTree(byName(t, "SW2"), t);
    expect(out).toMatch(/^Po1\s+Root FWD 12\s+128\.65\s+P2p$/m);
    expect(out).toContain("Port        65 (Port-channel1)");
    expect(out).not.toMatch(/^Fa0\/[12]\s/m);
  });

  it("inkompatible Modi (passive ↔ passive) bündeln nicht: Member bleiben einzelne Ports, einer blockiert", () => {
    const t = withChannelModes(etherchannel(), "passive", "passive");
    expect(computePortChannels(t).size).toBe(0);
    const sw2 = computeStp(t).get(byName(t, "SW2").id)!;
    expect(sw2.ports.find((p) => p.iface.name === "Fa0/2")?.state).toBe("BLK");
  });

  it("Kosten nach gebündelter Bandbreite", () => {
    const fa = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `f${i}`, name: `Fa0/${i + 1}`, status: "up" as const }));
    const gi = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `g${i}`, name: `Gi0/${i + 1}`, status: "up" as const }));
    expect(portChannelCost(fa(1))).toBe(19);
    expect(portChannelCost(fa(2))).toBe(12);
    expect(portChannelCost(gi(2))).toBe(3);
  });
});

describe("L2-Weiterleitung über den Port-Channel", () => {
  it("der Ping läuft über Po1 (Hop zeigt Po1 und den genutzten Member)", () => {
    const t = etherchannel();
    const r = simulatePing({ topology: t, sourceDeviceId: byName(t, "PC0").id, targetIp: "192.168.1.20" });
    expect(r.success).toBe(true);
    const sw1 = r.forwardHops.find((h) => h.action === "switch" && h.deviceName === "SW1")!;
    expect(sw1.outInterface).toBe("Po1");
    expect(sw1.reason).toMatch(/Member Fa0\/[12]/);
    const sw2 = r.forwardHops.find((h) => h.action === "switch" && h.deviceName === "SW2")!;
    expect(sw2.inInterface).toBe("Po1");
  });

  it("fällt ein Member aus, läuft der Verkehr über den anderen", () => {
    const t = etherchannel();
    const sw1 = byName(t, "SW1");
    const fa1 = sw1.interfaces.find((i) => i.name === "Fa0/1")!;
    fa1.isShutdown = true;
    fa1.status = "admin-down";
    const r = simulatePing({ topology: t, sourceDeviceId: byName(t, "PC0").id, targetIp: "192.168.1.20" });
    expect(r.success).toBe(true);
    expect(r.forwardHops.find((h) => h.action === "switch" && h.deviceName === "SW1")!.reason).toMatch(/Member Fa0\/2/);
  });
});

import { describe, it, expect } from "vitest";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import type { LabTopologyData } from "@/components/labs/types";
import { stpHints } from "@/lib/topology/stp-hints";

type Cmds = Record<string, string[]>;

function build(cmds: Cmds) {
  const names = ["SW1", "SW2", "SW3"];
  const lab = {
    id: "t",
    title: "t",
    steps: [{ title: "s", blocks: names.map((n) => ({ device: n, commands: (cmds[n] ?? []).map((c) => ({ cmd: c })) })) }],
    topology: { description: "", connections: [], devices: [] },
  } as unknown as Parameters<typeof buildNetworkTopologyFromLab>[0];
  const data: LabTopologyData = {
    viewBox: { width: 600, height: 300 },
    devices: names.map((n, i) => ({ id: n.toLowerCase(), name: n, model: "Catalyst 2960", type: "switch-l2" as const, tier: "core" as const, x: 100 + i * 200, y: 100 })),
    links: [
      { id: "l1", from: "sw1", to: "sw2", fromPort: "Fa0/1", toPort: "Fa0/1" },
      { id: "l2", from: "sw2", to: "sw3", fromPort: "Fa0/2", toPort: "Fa0/1" },
    ],
    addressingTable: [],
  };
  const t = buildNetworkTopologyFromLab(lab, data, "target").topology;
  return (n: string) => t.devices.find((d) => d.name === n)!;
}

describe("STP-Makros: der letzte Befehl gilt", () => {
  it("explizite Priority nach root primary gewinnt, root primary nach Priority gewinnt", () => {
    const a = build({ SW1: ["spanning-tree vlan 1 root primary", "spanning-tree vlan 1 priority 4096"] });
    expect(a("SW1").config?.stp).toEqual({ priority: 4096 });
    const b = build({ SW2: ["spanning-tree vlan 1 priority 4096", "spanning-tree vlan 1 root primary"] });
    expect(b("SW2").config?.stp).toMatchObject({ priority: 24576, macro: "primary" });
  });

  it("root secondary = 28672, auch nach einer expliziten Priority", () => {
    const d = build({ SW1: ["spanning-tree vlan 1 priority 4096", "spanning-tree vlan 1 root secondary"] });
    expect(d("SW1").config?.stp).toEqual({ priority: 28672 });
  });

  it("root primary: 24576, wenn keine andere Root eine niedrigere Priority hat (eindeutig)", () => {
    const d = build({ SW1: ["spanning-tree vlan 1 root primary"], SW2: ["spanning-tree vlan 1 root secondary"] });
    expect(d("SW1").config?.stp).toMatchObject({ priority: 24576 });
    expect(d("SW1").config?.stp?.ambiguous).toBeUndefined();
    expect(stpHints(d("SW1"))).toEqual([]);
  });

  it("root primary neben einer Root mit niedrigerer Priority: 4096 darunter, als uneindeutig gekennzeichnet", () => {
    const d = build({ SW1: ["spanning-tree vlan 1 root primary"], SW2: ["spanning-tree vlan 1 priority 8192"] });
    expect(d("SW1").config?.stp).toMatchObject({ priority: 4096, ambiguous: true });
    expect(stpHints(d("SW1"))[0]).toContain("nicht eindeutig");
    expect(d("SW2").config?.stp?.ambiguous).toBeUndefined();
  });

  it("VLANs ohne VLAN 1 ändern die Priority nicht", () => {
    const d = build({ SW1: ["spanning-tree vlan 10 root primary", "spanning-tree vlan 20 priority 4096"] });
    expect(d("SW1").config?.stp).toBeUndefined();
  });
});

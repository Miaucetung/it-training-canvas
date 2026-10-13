import { describe, it, expect } from "vitest";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { computeStp } from "@/lib/topology/stp-calc";
import { TOPOLOGY_STP_TRIANGLE, TOPOLOGY_BASIC_LAN, TOPOLOGY_OSPF } from "@/lib/topology/sample-topologies";
import { createNewDevice } from "@/lib/topology/topology-operations";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

const dev = (id: string) => TOPOLOGY_STP_TRIANGLE.devices.find((d) => d.id === id)!;
const roles = (id: string) =>
  Object.fromEntries(computeStp(TOPOLOGY_STP_TRIANGLE).get(id)!.ports.map((p) => [p.iface.name, `${p.role}/${p.state}`]));

describe("show spanning-tree (B-06)", () => {
  it("STP-Dreieck: SW-A Root, beide Ports DP", () => {
    expect(computeStp(TOPOLOGY_STP_TRIANGLE).get("stp-swa")!.isRoot).toBe(true);
    expect(roles("stp-swa")).toEqual({ "Gi0/1": "Desg/FWD", "Gi0/2": "Desg/FWD" });
  });

  it("STP-Dreieck: SW-B Gi0/1 RP, Gi0/2 DP", () => {
    expect(roles("stp-swb")).toEqual({ "Gi0/1": "Root/FWD", "Gi0/2": "Desg/FWD" });
  });

  it("STP-Dreieck: SW-C Gi0/1 RP, Gi0/2 BLK (Alternate)", () => {
    expect(roles("stp-swc")).toEqual({ "Gi0/1": "Root/FWD", "Gi0/2": "Altn/BLK" });
  });

  it("Ausgabe: Root-Bridge, Root-ID konsistent, IOS-Begriffe", () => {
    const a = CiscoCliGenerator.generateShowSpanningTree(dev("stp-swa"), TOPOLOGY_STP_TRIANGLE);
    const c = CiscoCliGenerator.generateShowSpanningTree(dev("stp-swc"), TOPOLOGY_STP_TRIANGLE);
    expect(a).toContain("This bridge is the root");
    expect(a).toContain("Priority    24577");
    expect(a).toContain("(priority 24576 sys-id-ext 1)");
    expect(c).toContain("Cost        4");
    expect(c).toContain("Port        25 (GigabitEthernet0/1)");
    expect(c).toMatch(/Gi0\/2\s+Altn BLK 4\s+128\.26\s+P2p/);
    expect(c).not.toMatch(/\bBlk\b|\bShr\b/);
    const rootAddr = /Address\s+(\S+)/.exec(c)![1];
    expect(rootAddr).toBe(/Address\s+(\S+)/.exec(a)![1]);
  });

  it("niedrigere Priorität gewinnt die Root-Wahl, nicht die Geräte-ID", () => {
    const t = structuredClone(TOPOLOGY_STP_TRIANGLE);
    t.devices.find((d) => d.id === "stp-swc")!.config!.stp = { priority: 4096 };
    const stp = computeStp(t);
    expect(stp.get("stp-swc")!.isRoot).toBe(true);
    expect(stp.get("stp-swa")!.isRoot).toBe(false);
  });

  it("gleiche Priorität: niedrigere MAC gewinnt", () => {
    const t = structuredClone(TOPOLOGY_STP_TRIANGLE);
    for (const d of t.devices) d.config!.stp = { priority: 32768 };
    expect(computeStp(t).get("stp-swa")!.isRoot).toBe(true);
    t.devices.find((d) => d.id === "stp-swb")!.config!.stp = { priority: 32768, mac: "0000.0000.0001" };
    expect(computeStp(t).get("stp-swb")!.isRoot).toBe(true);
  });

  it("einzelner Switch ist seine eigene Root-Bridge, nur verbundene Ports erscheinen", () => {
    const sw = TOPOLOGY_BASIC_LAN.devices.find((d) => d.type === "switch-l2")!;
    const out = CiscoCliGenerator.generateShowSpanningTree(sw, TOPOLOGY_BASIC_LAN);
    expect(out).toContain("This bridge is the root");
    const portLines = out.split("\n").filter((l) => /P2p$/.test(l));
    expect(portLines.length).toBe(
      TOPOLOGY_BASIC_LAN.links.filter((l) => l.sourceDeviceId === sw.id || l.targetDeviceId === sw.id).length
    );
    expect(portLines.every((l) => l.includes("Desg FWD"))).toBe(true);
  });

  it("Router/PC: keine Fantasie-Ausgabe", () => {
    const r = TOPOLOGY_OSPF.devices.find((d) => d.type === "router")!;
    expect(CiscoCliGenerator.generateShowSpanningTree(r, TOPOLOGY_OSPF)).toMatch(/^%/);
  });

  it("zwei Switches über Fa-Link und Gi-Link: Gi (Kosten 4) wird Root-Port, Fa (19) blockiert", () => {
    const mk = (id: string, prio: number): TopologyDevice => {
      const d = createNewDevice("switch-l2", 0, 0, id);
      d.id = id;
      d.config = { hostname: id, stp: { priority: prio } };
      return d;
    };
    const a = mk("A", 4096);
    const b = mk("B", 32768);
    const t: NetworkTopology = {
      id: "t",
      name: "t",
      version: "2.0",
      devices: [a, b],
      links: [
        { id: "l1", sourceDeviceId: "A", sourceInterfaceId: "if-fa0-1", targetDeviceId: "B", targetInterfaceId: "if-fa0-1", linkType: "ethernet", status: "up" },
        { id: "l2", sourceDeviceId: "A", sourceInterfaceId: "if-gi0-1", targetDeviceId: "B", targetInterfaceId: "if-gi0-1", linkType: "ethernet", status: "up" },
      ],
    };
    const info = computeStp(t).get("B")!;
    expect(info.rootPathCost).toBe(4);
    expect(info.rootPort!.iface.name).toBe("Gi0/1");
    expect(info.ports.find((p) => p.iface.name === "Fa0/1")!.role).toBe("Altn");
  });
});

describe("show vlan brief (B-06)", () => {
  it("erfindet keine VLANs: leerer Switch zeigt nur VLAN 1 und die Standard-Legacy-VLANs", () => {
    const sw = createNewDevice("switch-l2", 0, 0, "SWX");
    const out = CiscoCliGenerator.generateShowVlanBrief(sw);
    expect(out).not.toMatch(/SALES|DEV/);
    const ids = out.split("\n").filter((l) => /^\d+\s/.test(l)).map((l) => l.split(/\s+/)[0]);
    expect(ids).toEqual(["1", "1002", "1003", "1004", "1005"]);
  });

  it("SVI/Loopback erscheinen nicht als Port von VLAN 1", () => {
    const sw = createNewDevice("switch-l2", 0, 0, "SWX");
    const line = CiscoCliGenerator.generateShowVlanBrief(sw)
      .split("\n")
      .find((l) => l.startsWith("1 "))!;
    expect(line).not.toContain("Vlan1");
    expect(line).toContain("Fa0/1");
  });

  it("konfigurierte VLANs mit Access-Ports werden angezeigt", () => {
    const sw = createNewDevice("switch-l2", 0, 0, "SWX");
    sw.config = { hostname: "SWX", vlans: [{ id: 10, name: "SALES" }, { id: 20, name: "HR" }] };
    sw.interfaces.find((i) => i.name === "Fa0/1")!.vlan = 10;
    sw.interfaces.find((i) => i.name === "Fa0/2")!.vlan = 20;
    const out = CiscoCliGenerator.generateShowVlanBrief(sw);
    expect(out).toMatch(/^10\s+SALES\s+active\s+Fa0\/1$/m);
    expect(out).toMatch(/^20\s+HR\s+active\s+Fa0\/2$/m);
    expect(out.split("\n").find((l) => l.startsWith("1 "))).not.toMatch(/Fa0\/1(,|$)/);
  });

  it("Trunk-Ports erscheinen in keinem VLAN", () => {
    const sw = createNewDevice("switch-l2", 0, 0, "SWX");
    sw.interfaces.find((i) => i.name === "Gi0/1")!.mode = "trunk";
    expect(CiscoCliGenerator.generateShowVlanBrief(sw)).not.toContain("Gi0/1");
  });
});

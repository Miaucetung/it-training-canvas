import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { simulateDhcpLeases, simulatePing } from "@/lib/topology/simulation/packet-simulator";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

function labTopology(id: string): NetworkTopology {
  const lab = LABS.find((l) => l.id === id)!;
  return buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], "target").topology;
}
const dev = (t: NetworkTopology, name: string): TopologyDevice => t.devices.find((d) => d.name === name)!;

describe("Simulierte DHCP-Vergabe", () => {
  it("dhcp: niedrigste freie Adresse nach excluded-address, Clients in Topologie-Reihenfolge", () => {
    const { leases } = simulateDhcpLeases(labTopology("dhcp"));
    expect(leases.map((l) => [l.deviceName, l.ip, l.gateway, l.poolName])).toEqual([
      ["PC0", "192.168.1.11/24", "192.168.1.1", "LAN_POOL"],
      ["PC1", "192.168.1.12/24", "192.168.1.1", "LAN_POOL"],
    ]);
  });

  it("vlan-dhcp-nat-roas: Pool je VLAN über das Subinterface, an dem der Discover ankommt", () => {
    const { leases } = simulateDhcpLeases(labTopology("vlan-dhcp-nat-roas"));
    const ip = (n: string) => leases.find((l) => l.deviceName === n)?.ip;
    expect(ip("PC0")).toBe("192.168.10.2/24");
    expect(ip("PC3")).toBe("192.168.10.3/24");
    expect(ip("PC2")).toBe("192.168.20.2/24");
    expect(ip("PC1")).toBe("192.168.30.2/24");
  });

  it("Adressen, die statisch belegt sind, werden übersprungen", () => {
    const t = labTopology("dhcp");
    const r0 = dev(t, "Router0");
    r0.interfaces.push({ id: "x-static", name: "Lo9", status: "up", ip: "192.168.1.11/24" });
    const { leases } = simulateDhcpLeases(t);
    expect(leases[0].ip).toBe("192.168.1.12/24");
  });

  it("ohne L2-Weg zum Server keine Lease (Client im falschen VLAN)", () => {
    const t = labTopology("vlan-dhcp-nat-roas");
    const pc0 = dev(t, "PC0");
    const conn = t.links.find((l) => l.sourceDeviceId === pc0.id || l.targetDeviceId === pc0.id)!;
    const swId = conn.sourceDeviceId === pc0.id ? conn.targetDeviceId : conn.sourceDeviceId;
    const swIfaceId = conn.sourceDeviceId === pc0.id ? conn.targetInterfaceId : conn.sourceInterfaceId;
    const port = t.devices.find((d) => d.id === swId)!.interfaces.find((i) => i.id === swIfaceId)!;
    port.vlan = 999;
    expect(simulateDhcpLeases(t).leases.some((l) => l.deviceName === "PC0")).toBe(false);
  });

  it("die Topologie selbst bleibt unverändert; show ip dhcp binding bleibt leer", () => {
    const t = labTopology("dhcp");
    const before = JSON.stringify(t);
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC0").id, targetDeviceId: dev(t, "PC1").id });
    expect(r.success).toBe(true);
    expect(JSON.stringify(t)).toBe(before);
    expect(dev(t, "PC0").interfaces[0].ip).toBeUndefined();
    const binding = CiscoCliGenerator.getDynamicShowOutputs(dev(t, "Router0"), t)["show ip dhcp binding"];
    expect(binding).toContain("entsteht erst nach DHCP-Anfragen");
    expect(binding).not.toMatch(/\d+\.\d+\.\d+\.\d+/);
  });

  it("Ergebnis und originate-Hops weisen die Vergabe als „simulierte Vergabe“ aus", () => {
    const t = labTopology("dhcp");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC0").id, targetDeviceId: dev(t, "PC1").id });
    expect(r.simulatedLeases?.map((l) => l.deviceName)).toEqual(["PC0", "PC1"]);
    const origin = r.forwardHops.find((h) => h.action === "originate")!;
    expect(origin.packet.srcIp).toBe("192.168.1.11");
    expect(origin.reason).toMatch(/192\.168\.1\.11\/24 per DHCP \(simulierte Vergabe aus Pool LAN_POOL/);
    expect(r.forwardHops[r.forwardHops.length - 1].packet.dstIp).toBe("192.168.1.12");
  });

  it("ohne DHCP-Clients kein simulatedLeases-Feld", () => {
    const t = labTopology("drill-interfaces");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "R1").id, targetIp: "10.0.0.2" });
    expect(r.simulatedLeases).toBeUndefined();
  });
});

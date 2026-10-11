import { describe, expect, it } from "vitest";
import { CiscoCliGenerator, getNetworkAddress } from "@/lib/topology/cisco-cli-generator";
import { TOPOLOGY_OSPF, TOPOLOGY_ROUTER_ON_A_STICK, TOPOLOGY_STP_TRIANGLE } from "@/lib/topology/sample-topologies";
import { NetworkTopology } from "@/types/topology";

describe("Cisco IOS CLI Dynamic Show Generator", () => {
  it("calculates network address and host CIDR correctly", () => {
    const net = getNetworkAddress("192.168.10.1/24");
    expect(net).not.toBeNull();
    expect(net?.network).toBe("192.168.10.0/24");
    expect(net?.ip).toBe("192.168.10.1");
    expect(net?.mask).toBe("255.255.255.0");
  });

  it("generates authentic show ip route with Cisco codes header and connected/local routes", () => {
    const r1 = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === "roas-r1")!;
    const output = CiscoCliGenerator.generateShowIpRoute(r1, TOPOLOGY_ROUTER_ON_A_STICK);

    expect(output).toContain("Codes: L - local, C - connected");
    expect(output).toContain("Gateway of last resort is not set");
    expect(output).toContain("C    192.168.10.0/24 is directly connected, Gi0/0.10");
    expect(output).toContain("L    192.168.10.1/32 is directly connected, Gi0/0.10");
    expect(output).toContain("C    192.168.20.0/24 is directly connected, Gi0/0.20");
    expect(output).toContain("L    192.168.20.1/32 is directly connected, Gi0/0.20");
  });

  it("generates aligned show ip interface brief table", () => {
    const r1 = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === "roas-r1")!;
    const output = CiscoCliGenerator.generateShowIpInterfaceBrief(r1);

    expect(output).toContain("Interface              IP-Address      OK? Method Status                Protocol");
    expect(output).toContain("Gi0/0                  unassigned      YES manual up                    up");
    expect(output).toContain("Gi0/0.10               192.168.10.1    YES manual up                    up");
    expect(output).toContain("Gi0/0.20               192.168.20.1    YES manual up                    up");
  });

  it("generates running-config with dot1q subinterfaces", () => {
    const r1 = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === "roas-r1")!;
    const output = CiscoCliGenerator.generateShowRunningConfig(r1);

    expect(output).toContain("interface Gi0/0");
    expect(output).toContain("no ip address");
    expect(output).toContain("interface Gi0/0.10");
    expect(output).toContain("encapsulation dot1q 10");
    expect(output).toContain("ip address 192.168.10.1 255.255.255.0");
  });

  it("REQUIREMENT TEST: Changing IP in JSON dynamically changes show-command outputs immediately", () => {
    // Clone topology
    const clonedTopo: NetworkTopology = JSON.parse(JSON.stringify(TOPOLOGY_ROUTER_ON_A_STICK));
    const router = clonedTopo.devices.find((d) => d.id === "roas-r1")!;

    // Initial check
    const initialRoute = CiscoCliGenerator.generateShowIpRoute(router, clonedTopo);
    const initialBrief = CiscoCliGenerator.generateShowIpInterfaceBrief(router);
    expect(initialRoute).toContain("192.168.10.0/24");
    expect(initialBrief).toContain("192.168.10.1");

    // Change IP in JSON: 192.168.10.1/24 -> 172.16.50.1/24
    router.interfaces[1].ip = "172.16.50.1/24";

    // Regenerate show outputs
    const updatedRoute = CiscoCliGenerator.generateShowIpRoute(router, clonedTopo);
    const updatedBrief = CiscoCliGenerator.generateShowIpInterfaceBrief(router);
    const updatedConfig = CiscoCliGenerator.generateShowRunningConfig(router);

    // Verify route changed
    expect(updatedRoute).not.toContain("192.168.10.0/24");
    expect(updatedRoute).toContain("C    172.16.50.0/24 is directly connected, Gi0/0.10");
    expect(updatedRoute).toContain("L    172.16.50.1/32 is directly connected, Gi0/0.10");

    // Verify brief changed
    expect(updatedBrief).not.toContain("192.168.10.1");
    expect(updatedBrief).toContain("172.16.50.1");

    // Verify config changed
    expect(updatedConfig).toContain("ip address 172.16.50.1 255.255.255.0");
  });

  it("generates consistent 802.1D Spanning Tree output for switches", () => {
    const swc = TOPOLOGY_STP_TRIANGLE.devices.find((d) => d.id === "stp-swc")!;
    const output = CiscoCliGenerator.generateShowSpanningTree(swc, TOPOLOGY_STP_TRIANGLE);

    expect(output).toContain("Spanning tree enabled protocol ieee");
    expect(output).toContain("Bridge ID  Priority    32768");
    expect(output).toContain("Gi0/1               Root FWD");
    expect(output).toContain("Gi0/2               Blk  BLK");
  });
});

import { describe, expect, it } from "vitest";
import { CiscoCliGenerator, getNetworkAddress } from "@/lib/topology/cisco-cli-generator";
import { TOPOLOGY_OSPF, TOPOLOGY_ROUTER_ON_A_STICK, TOPOLOGY_STP_TRIANGLE } from "@/lib/topology/sample-topologies";
import { NetworkTopology, TopologyDevice } from "@/types/topology";

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

  it("generates OSPF neighbor with FULL/  - (no DR/BDR) on point-to-point networks", () => {
    const r1 = TOPOLOGY_OSPF.devices.find((d) => d.id === "ospf-r1")!;
    const output = CiscoCliGenerator.generateShowIpOspfNeighbor(r1, TOPOLOGY_OSPF);

    expect(output).toContain("Neighbor ID     Pri   State           Dead Time   Address         Interface");
    expect(output).toContain("2.2.2.2");
    expect(output).toContain("FULL/  -");
    expect(output).toContain("10.0.12.2");
    expect(output).toContain("Gi0/0");
    // Ensure no DR or BDR is indicated
    expect(output).not.toContain("FULL/DR");
    expect(output).not.toContain("FULL/BDR");
  });

  it("generates authentic show vlan brief with active ports excluding trunks", () => {
    const sw1 = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === "roas-sw1")!;
    const output = CiscoCliGenerator.generateShowVlanBrief(sw1);

    expect(output).toContain("VLAN Name                             Status    Ports");
    expect(output).toContain("10   SALES");
    expect(output).toContain("20   DEV");
    expect(output).toContain("Fa0/10");
    expect(output).toContain("Fa0/20");
    // Trunk port Gi0/1 must NOT appear in show vlan brief
    expect(output).not.toContain("Gi0/1");
  });

  it("generates authentic show interfaces trunk with native and allowed VLANs", () => {
    const sw1 = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === "roas-sw1")!;
    const output = CiscoCliGenerator.generateShowInterfacesTrunk(sw1);

    expect(output).toContain("Port        Mode             Encapsulation  Status        Native vlan");
    expect(output).toContain("Gi0/1       on               802.1q         trunking      1");
    expect(output).toContain("Port        Vlans allowed on trunk");
    expect(output).toContain("Gi0/1");
  });

  it("generates authentic show etherchannel summary table with protocol and ports", () => {
    const swWithChannel: TopologyDevice = {
      id: "sw-channel",
      name: "SW-Channel",
      type: "switch-l2",
      x: 100,
      y: 100,
      interfaces: [
        { id: "gi01", name: "Gi0/1", status: "up", channelGroup: { id: 1, mode: "active" } },
        { id: "gi02", name: "Gi0/2", status: "up", channelGroup: { id: 1, mode: "active" } },
      ],
    };

    const output = CiscoCliGenerator.generateShowEtherchannelSummary(swWithChannel);

    expect(output).toContain("Flags:  D - down        P - bundled in port-channel");
    expect(output).toContain("Number of channel-groups in use: 1");
    expect(output).toContain("Group  Port-channel  Protocol    Ports");
    expect(output).toContain("Po1(SU)");
    expect(output).toContain("LACP");
    expect(output).toContain("Gi0/1(P)");
    expect(output).toContain("Gi0/2(P)");
  });

  it("keeps Po as (SU) when at least one member port is bundled (P) while another is suspended (s)", () => {
    const swPartial: TopologyDevice = {
      id: "sw-partial",
      name: "SW-Partial",
      type: "switch-l2",
      x: 100,
      y: 100,
      interfaces: [
        { id: "gi01", name: "Gi0/1", status: "up", mode: "trunk", nativeVlan: 1, channelGroup: { id: 1, mode: "active" } },
        { id: "fa010", name: "Fa0/10", status: "up", mode: "access", vlan: 10, channelGroup: { id: 1, mode: "active" } },
      ],
    };

    const output = CiscoCliGenerator.generateShowEtherchannelSummary(swPartial);

    // Po1 remains (SU) because Gi0/1 is bundled (P), while Fa0/10 is suspended (s)
    expect(output).toContain("Po1(SU)");
    expect(output).toContain("Gi0/1(P)");
    expect(output).toContain("Fa0/10(s)");
  });

  it("marks Po as (SD) when no member port is bundled in the channel", () => {
    const swAllDown: TopologyDevice = {
      id: "sw-alldown",
      name: "SW-AllDown",
      type: "switch-l2",
      x: 100,
      y: 100,
      interfaces: [
        { id: "gi01", name: "Gi0/1", status: "down", channelGroup: { id: 1, mode: "active" } },
        { id: "gi02", name: "Gi0/2", status: "down", channelGroup: { id: 1, mode: "active" } },
      ],
    };

    const output = CiscoCliGenerator.generateShowEtherchannelSummary(swAllDown);

    // Po1 becomes (SD) because 0 ports are bundled (both are down)
    expect(output).toContain("Po1(SD)");
    expect(output).toContain("Gi0/1(D)");
    expect(output).toContain("Gi0/2(D)");
  });

  it("generates complete show running-config including SVIs, channel-group and dot1q subinterfaces", () => {
    const mls: TopologyDevice = {
      id: "mls-1",
      name: "MLS-Distribution",
      type: "switch-l3",
      x: 100,
      y: 100,
      interfaces: [
        {
          id: "gi101",
          name: "Gi1/0/1",
          status: "up",
          mode: "trunk",
          nativeVlan: 99,
          allowedVlans: [10, 20, 30],
          channelGroup: { id: 2, mode: "active" },
        },
      ],
      config: {
        hostname: "MLS-DIST-1",
        ipRoutingEnabled: true,
        vlans: [
          { id: 10, name: "SALES" },
          { id: 20, name: "DEV" },
        ],
        svis: [
          { vlan: 10, ip: "192.168.10.1/24" },
          { vlan: 20, ip: "192.168.20.1/24" },
        ],
        defaultGateway: "10.0.0.1",
      },
    };

    const output = CiscoCliGenerator.generateFullShowRunningConfig(mls);

    expect(output).toContain("hostname MLS-DIST-1");
    expect(output).toContain("ip routing");
    expect(output).toContain("vlan 10");
    expect(output).toContain(" name SALES");
    expect(output).toContain("interface Gi1/0/1");
    expect(output).toContain("switchport mode trunk");
    expect(output).toContain("switchport trunk native vlan 99");
    expect(output).toContain("switchport trunk allowed vlan 10,20,30");
    expect(output).toContain("channel-group 2 mode active");
    expect(output).toContain("interface Vlan10");
    expect(output).toContain("ip address 192.168.10.1 255.255.255.0");
    expect(output).toContain("interface Vlan20");
    expect(output).toContain("ip address 192.168.20.1 255.255.255.0");
    expect(output).toContain("end");
  });
});

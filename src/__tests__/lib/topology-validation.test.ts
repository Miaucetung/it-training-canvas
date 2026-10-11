import { describe, expect, it } from "vitest";
import {
  areIpsInSameSubnet,
  checkAccessVlanMismatches,
  checkEtherChannelCompatibility,
  checkNativeVlanMismatches,
  evaluateEtherChannelModes,
  parseIpCidr,
  validateHostGateway,
  validateTopology,
} from "@/lib/topology/topology-validation";
import { NetworkTopology } from "@/types/topology";

describe("Topology Validation & Didactic Network Diagnostics (2d-3)", () => {
  describe("Subnet Math & Host Gateway Validation", () => {
    it("parses CIDR strings accurately into network, broadcast and mask", () => {
      const parsed = parseIpCidr("192.168.1.50/24");
      expect(parsed).not.toBeNull();
      expect(parsed?.ip).toBe("192.168.1.50");
      expect(parsed?.prefix).toBe(24);
      expect(parsed?.networkIp).toBe("192.168.1.0");
      expect(parsed?.broadcastIp).toBe("192.168.1.255");
      expect(parsed?.netmask).toBe("255.255.255.0");
    });

    it("verifies if two IP addresses are in the same subnet", () => {
      expect(areIpsInSameSubnet("10.0.1.10", "10.0.1.1", 24)).toBe(true);
      expect(areIpsInSameSubnet("10.0.1.10", "10.0.2.1", 24)).toBe(false);
      expect(areIpsInSameSubnet("172.16.10.5", "172.16.11.20", 16)).toBe(true);
    });

    it("accepts a valid host gateway in the same subnet", () => {
      const res = validateHostGateway("192.168.10.50/24", "192.168.10.1");
      expect(res.valid).toBe(true);
      expect(res.issue).toBeUndefined();
    });

    it("warns when host gateway is in a different subnet", () => {
      const res = validateHostGateway("192.168.1.10/24", "192.168.2.1");
      expect(res.valid).toBe(false);
      expect(res.issue).toBeDefined();
      expect(res.issue?.code).toBe("HOST_GATEWAY_NOT_IN_SUBNET");
      expect(res.issue?.message).toContain("liegt nicht im Subnetz 192.168.1.0/24");
      expect(res.issue?.didacticExplanation).toContain("ARP-Auflösung");
    });

    it("warns when host specifies its own IP address as default gateway", () => {
      const res = validateHostGateway("192.168.1.10/24", "192.168.1.10");
      expect(res.valid).toBe(false);
      expect(res.issue?.code).toBe("HOST_GATEWAY_NOT_IN_SUBNET");
      expect(res.issue?.title).toContain("Gateway entspricht eigener IP-Adresse");
    });
  });

  describe("Trunk & Access VLAN Mismatch Detection", () => {
    it("detects Trunk Native VLAN mismatch across connected switches", () => {
      const topo: NetworkTopology = {
        id: "vlan-mismatch-test",
        name: "Mismatch Test",
        version: "2.0",
        devices: [
          {
            id: "sw1",
            name: "SW1",
            type: "switch-l2",
            x: 100,
            y: 100,
            interfaces: [
              { id: "sw1-gi01", name: "Gi0/1", status: "up", mode: "trunk", nativeVlan: 1 },
            ],
          },
          {
            id: "sw2",
            name: "SW2",
            type: "switch-l2",
            x: 300,
            y: 100,
            interfaces: [
              { id: "sw2-gi01", name: "Gi0/1", status: "up", mode: "trunk", nativeVlan: 99 },
            ],
          },
        ],
        links: [
          {
            id: "link-trunk",
            sourceDeviceId: "sw1",
            sourceInterfaceId: "sw1-gi01",
            targetDeviceId: "sw2",
            targetInterfaceId: "sw2-gi01",
            linkType: "trunk",
            status: "up",
          },
        ],
      };

      const issues = checkNativeVlanMismatches(topo);
      expect(issues).toHaveLength(1);
      expect(issues[0].code).toBe("TRUNK_NATIVE_VLAN_MISMATCH");
      expect(issues[0].message).toContain("Native VLAN 1");
      expect(issues[0].message).toContain("Native VLAN 99");
      expect(issues[0].didacticExplanation).toContain("%CDP-4-NATIVE_VLAN_MISMATCH");
    });

    it("detects Access VLAN mismatch (VLAN Leaking) between switches", () => {
      const topo: NetworkTopology = {
        id: "access-mismatch-test",
        name: "Access Mismatch Test",
        version: "2.0",
        devices: [
          {
            id: "sw1",
            name: "SW1",
            type: "switch-l2",
            x: 100,
            y: 100,
            interfaces: [
              { id: "sw1-fa01", name: "Fa0/1", status: "up", mode: "access", vlan: 10 },
            ],
          },
          {
            id: "sw2",
            name: "SW2",
            type: "switch-l2",
            x: 300,
            y: 100,
            interfaces: [
              { id: "sw2-fa01", name: "Fa0/1", status: "up", mode: "access", vlan: 20 },
            ],
          },
        ],
        links: [
          {
            id: "link-acc",
            sourceDeviceId: "sw1",
            sourceInterfaceId: "sw1-fa01",
            targetDeviceId: "sw2",
            targetInterfaceId: "sw2-fa01",
            linkType: "ethernet",
            status: "up",
          },
        ],
      };

      const issues = checkAccessVlanMismatches(topo);
      expect(issues).toHaveLength(1);
      expect(issues[0].code).toBe("ACCESS_VLAN_MISMATCH");
      expect(issues[0].message).toContain("VLAN 10");
      expect(issues[0].message).toContain("VLAN 20");
    });
  });

  describe("EtherChannel Mode Compatibility Matrix", () => {
    it("validates LACP active/active and active/passive as operational", () => {
      const activeActive = evaluateEtherChannelModes("active", "active");
      expect(activeActive.compatible).toBe(true);
      expect(activeActive.channelOperational).toBe(true);
      expect(activeActive.protocol).toBe("lacp");

      const activePassive = evaluateEtherChannelModes("active", "passive");
      expect(activePassive.compatible).toBe(true);
      expect(activePassive.channelOperational).toBe(true);
      expect(activePassive.protocol).toBe("lacp");
    });

    it("flags LACP passive/passive as non-operational", () => {
      const passivePassive = evaluateEtherChannelModes("passive", "passive");
      expect(passivePassive.compatible).toBe(false);
      expect(passivePassive.channelOperational).toBe(false);
      expect(passivePassive.explanation).toContain("passive' ↔ 'passive");
    });

    it("validates PAgP desirable/desirable and desirable/auto as operational", () => {
      const desDes = evaluateEtherChannelModes("desirable", "desirable");
      expect(desDes.compatible).toBe(true);
      expect(desDes.channelOperational).toBe(true);
      expect(desDes.protocol).toBe("pagp");

      const desAuto = evaluateEtherChannelModes("desirable", "auto");
      expect(desAuto.compatible).toBe(true);
      expect(desAuto.channelOperational).toBe(true);
    });

    it("flags PAgP auto/auto as non-operational", () => {
      const autoAuto = evaluateEtherChannelModes("auto", "auto");
      expect(autoAuto.compatible).toBe(false);
      expect(autoAuto.channelOperational).toBe(false);
      expect(autoAuto.explanation).toContain("auto' ↔ 'auto");
    });

    it("validates static 'on' mode only with another 'on' mode", () => {
      const onOn = evaluateEtherChannelModes("on", "on");
      expect(onOn.compatible).toBe(true);
      expect(onOn.channelOperational).toBe(true);
      expect(onOn.protocol).toBe("static");

      const onActive = evaluateEtherChannelModes("on", "active");
      expect(onActive.compatible).toBe(false);
      expect(onActive.channelOperational).toBe(false);
    });

    it("flags cross-protocol configuration (LACP active with PAgP desirable) as incompatible", () => {
      const mixed = evaluateEtherChannelModes("active", "desirable");
      expect(mixed.compatible).toBe(false);
      expect(mixed.channelOperational).toBe(false);
      expect(mixed.explanation).toContain("Protokoll-Konflikt");
    });

    it("detects in-topology EtherChannel mismatches across linked switches", () => {
      const topo: NetworkTopology = {
        id: "channel-mismatch-test",
        name: "Channel Mismatch Test",
        version: "2.0",
        devices: [
          {
            id: "sw1",
            name: "SW1",
            type: "switch-l2",
            x: 100,
            y: 100,
            interfaces: [
              {
                id: "sw1-gi01",
                name: "Gi0/1",
                status: "up",
                channelGroup: { id: 1, mode: "passive" },
              },
            ],
          },
          {
            id: "sw2",
            name: "SW2",
            type: "switch-l2",
            x: 300,
            y: 100,
            interfaces: [
              {
                id: "sw2-gi01",
                name: "Gi0/1",
                status: "up",
                channelGroup: { id: 1, mode: "passive" },
              },
            ],
          },
        ],
        links: [
          {
            id: "link-po1",
            sourceDeviceId: "sw1",
            sourceInterfaceId: "sw1-gi01",
            targetDeviceId: "sw2",
            targetInterfaceId: "sw2-gi01",
            linkType: "etherchannel",
            status: "up",
          },
        ],
      };

      const issues = checkEtherChannelCompatibility(topo);
      expect(issues).toHaveLength(1);
      expect(issues[0].code).toBe("ETHERCHANNEL_INCOMPATIBLE_MODES");
      expect(issues[0].message).toContain("passive' ↔ 'passive");
    });
  });

  describe("Whole-Topology Diagnostic Runner", () => {
    it("runs whole topology validation and aggregates host and switch issues without blocking", () => {
      const topo: NetworkTopology = {
        id: "multi-issue-test",
        name: "Multi Issue Test",
        version: "2.0",
        devices: [
          {
            id: "pc1",
            name: "PC1",
            type: "pc",
            x: 100,
            y: 200,
            interfaces: [{ id: "pc1-eth0", name: "eth0", status: "up", ip: "10.0.0.5/24" }],
            config: { hostname: "PC1", defaultGateway: "192.168.1.1" }, // Gateway in wrong subnet
          },
        ],
        links: [],
      };

      const result = validateTopology(topo);
      expect(result.warningsCount).toBe(1);
      expect(result.issues[0].code).toBe("HOST_GATEWAY_NOT_IN_SUBNET");
    });
  });
});

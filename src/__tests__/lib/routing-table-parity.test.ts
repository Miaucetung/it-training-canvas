import { describe, expect, it } from "vitest";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import {
  computeStructuredRoutingTable,
  formatShowIpRoute,
  lookupRouteLpm,
} from "@/lib/topology/routing-table";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { LABS } from "@/components/labs";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { BUILT_IN_CCNA_TOPOLOGIES } from "@/lib/topology/sample-topologies";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

describe("Routing-Tabelle & Longest Prefix Match (LPM)", () => {
  it("CiscoCliGenerator.generateShowIpRoute nutzt formatShowIpRoute(computeStructuredRoutingTable)", () => {
    const topologies: NetworkTopology[] = [
      ...BUILT_IN_CCNA_TOPOLOGIES,
      ...Object.entries(CURATED_TOPOLOGIES).map(([id, data]) => {
        const l = LABS.find((x) => x.id === id);
        return l ? buildNetworkTopologyFromLab(l, data, "target").topology : null;
      }).filter((t): t is NetworkTopology => t !== null),
    ];

    expect(topologies.length).toBeGreaterThan(10);

    for (const topo of topologies) {
      for (const dev of topo.devices) {
        if (dev.type !== "router" && dev.type !== "switch-l3") continue;

        const table = computeStructuredRoutingTable(dev, topo);
        const directText = formatShowIpRoute(table);
        const cliText = CiscoCliGenerator.generateShowIpRoute(dev, topo);

        expect(cliText).toBe(directText);
      }
    }
  });

  describe("lookupRouteLpm", () => {
    // Erstelle ein Testgerät mit mehreren überlappenden Routen:
    // /32 Host-Route (Local)
    // /28 Subnetz
    // /24 Subnetz (Connected)
    // /16 Subnetz (OSPF)
    // 0.0.0.0/0 Default-Route (Static)
    const testDevice: TopologyDevice = {
      id: "R1",
      name: "R1",
      type: "router",
      x: 0,
      y: 0,
      interfaces: [
        {
          id: "i1",
          name: "Gi0/0",
          ip: "192.168.1.1/24",
          status: "up",
        },
        {
          id: "i2",
          name: "Gi0/1",
          ip: "10.0.0.1/30",
          status: "up",
        },
      ],
      config: {
        hostname: "R1",
        ipRoutes: [
          // Statische Route für spezifischeres Subnetz /28 via 10.0.0.2
          { network: "192.168.1.128/28", nextHop: "10.0.0.2" },
          // Default Route via 10.0.0.2
          { network: "0.0.0.0/0", nextHop: "10.0.0.2" },
        ],
      },
    };

    const testTopology: NetworkTopology = {
      id: "test-topo",
      name: "Test Topo",
      version: "2.0",
      devices: [testDevice],
      links: [],
    };

    const table = computeStructuredRoutingTable(testDevice, testTopology);

    it("wählt /32 Local-Route bei exaktem Host-Match (eigene IP)", () => {
      const match = lookupRouteLpm(table, "192.168.1.1");
      expect(match).not.toBeNull();
      expect(match!.entry.prefix).toBe("192.168.1.1/32");
      expect(match!.entry.protocol).toBe("L");
      expect(match!.selectedVia.ifaceName).toBe("Gi0/0");
    });

    it("wählt /28 vor übergeordnetem /24 Subnetz (LPM)", () => {
      // 192.168.1.130 liegt sowohl in 192.168.1.0/24 als auch in 192.168.1.128/28
      const match = lookupRouteLpm(table, "192.168.1.130");
      expect(match).not.toBeNull();
      expect(match!.entry.prefix).toBe("192.168.1.128/28");
      expect(match!.entry.protocol).toBe("S");
      expect(match!.selectedVia.nextHop).toBe("10.0.0.2");
      expect(match!.selectedVia.ifaceName).toBe("Gi0/1");
    });

    it("wählt /24 Connected für andere Adressen im LAN", () => {
      // 192.168.1.50 liegt in 192.168.1.0/24, aber nicht in /28
      const match = lookupRouteLpm(table, "192.168.1.50");
      expect(match).not.toBeNull();
      expect(match!.entry.prefix).toBe("192.168.1.0/24");
      expect(match!.entry.protocol).toBe("C");
      expect(match!.selectedVia.ifaceName).toBe("Gi0/0");
    });

    it("fällt auf 0.0.0.0/0 zurück, wenn kein spezifischeres Netz passt", () => {
      // 8.8.8.8 matcht nur die Default Route
      const match = lookupRouteLpm(table, "8.8.8.8");
      expect(match).not.toBeNull();
      expect(match!.entry.prefix).toBe("0.0.0.0/0");
      expect(match!.entry.isDefault).toBe(true);
      expect(match!.selectedVia.nextHop).toBe("10.0.0.2");
    });

    it("liefert null, wenn keine Route und kein Gateway of Last Resort existiert", () => {
      const devNoDefault: TopologyDevice = {
        ...testDevice,
        config: { hostname: "R1", ipRoutes: [] },
      };
      const tableNoDefault = computeStructuredRoutingTable(devNoDefault, testTopology);
      const match = lookupRouteLpm(tableNoDefault, "8.8.8.8");
      expect(match).toBeNull();
    });

    it("wählt bei ECMP deterministisch den ersten Pfad und setzt isEcmp mit Hinweis", () => {
      // Konstruiere künstliche ECMP Route mit zwei Vias
      const ecmpTable = {
        ...table,
        routes: [
          {
            prefix: "172.16.0.0/16",
            protocol: "O" as const,
            ad: 110,
            metric: 2,
            vias: [
              { nextHop: "10.0.0.2", ifaceName: "Gi0/1" },
              { nextHop: "10.0.0.6", ifaceName: "Gi0/2" },
            ],
            isDefault: false,
            formattedLine: "O    172.16.0.0/16 ...",
          },
        ],
      };

      const match = lookupRouteLpm(ecmpTable, "172.16.1.1");
      expect(match).not.toBeNull();
      expect(match!.isEcmp).toBe(true);
      expect(match!.allVias.length).toBe(2);
      expect(match!.selectedVia.nextHop).toBe("10.0.0.2");
      expect(match!.notice).toContain("ECMP: 2 gleichwertige Pfade");
      expect(match!.notice).toContain("10.0.0.2");
    });
  });
});

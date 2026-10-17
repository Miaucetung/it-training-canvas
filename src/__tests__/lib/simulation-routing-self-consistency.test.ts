import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { simulatePing } from "@/lib/topology/simulation/packet-simulator";
import { computeStructuredRoutingTable, lookupRouteLpm } from "@/lib/topology/routing-table";
import { normalizeInterfaceName } from "@/lib/topology/hardware-profiles";

describe("Selbstkonsistenz: Simulator folgt der LPM-Entscheidung der Routing-Tabelle", () => {
  describe("Hinweis: der Simulator nutzt dieselbe Funktion; der Test sichert nur ab, dass die Hops sie nicht umgehen. Erwartungen aus den Labs prüft simulation-oracle.test.ts.", () => {
    it("stimmt für jeden simulierten Hop exakt mit der Routing-Tabelle (LPM) überein", () => {
      let totalTopologies = 0;
      let totalPings = 0;
      let totalRouterHops = 0;
      let matchingRouterHops = 0;

      for (const lab of LABS) {
        const cur = CURATED_TOPOLOGIES[lab.id];
        if (!cur) continue;

        let topo;
        try {
          const res = buildNetworkTopologyFromLab(lab, cur, "target");
          topo = res.topology;
        } catch {
          continue;
        }

        totalTopologies++;

        // Finde alle Geräte mit konfigurierter IP-Adresse
        const ipDevices = topo.devices.filter(
          (d) => d.interfaces.some((i) => !!i.ip) || (d.config?.svis && d.config.svis.length > 0)
        );

        for (let i = 0; i < ipDevices.length; i++) {
          for (let j = 0; j < ipDevices.length; j++) {
            if (i === j) continue;
            const src = ipDevices[i];
            const dst = ipDevices[j];

            const simRes = simulatePing({
              topology: topo,
              sourceDeviceId: src.id,
              targetDeviceId: dst.id,
            });

            totalPings++;

            // Prüfe jeden Hop, der eine Routing-Entscheidung durchführt
            for (const hop of simRes.allHops) {
              if (hop.action === "route" && hop.outInterface) {
                const dev = topo.devices.find((d) => d.id === hop.deviceId);
                if (!dev) continue;

                totalRouterHops++;
                const table = computeStructuredRoutingTable(dev, topo);
                const lpmMatch = lookupRouteLpm(table, hop.packet.dstIp);

                expect(lpmMatch).not.toBeNull();
                if (lpmMatch && lpmMatch.selectedVia.ifaceName) {
                  const normHopIface = normalizeInterfaceName(hop.outInterface);
                  const normLpmIface = normalizeInterfaceName(lpmMatch.selectedVia.ifaceName);
                  expect(normHopIface).toBe(normLpmIface);
                  matchingRouterHops++;
                }
              }
            }
          }
        }
      }

      console.log(`[Konsistenztest] Topologien: ${totalTopologies}, Pings: ${totalPings}, Router-Hops: ${totalRouterHops}, Übereinstimmend: ${matchingRouterHops}`);
      expect(totalTopologies).toBeGreaterThan(20);
      expect(totalRouterHops).toBeGreaterThan(100);
      expect(matchingRouterHops).toBe(totalRouterHops);
    });
  });
});

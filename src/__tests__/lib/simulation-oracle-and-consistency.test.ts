import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { simulatePing, findDeviceByIp } from "@/lib/topology/simulation/packet-simulator";
import { computeStructuredRoutingTable, lookupRouteLpm } from "@/lib/topology/routing-table";
import { normalizeInterfaceName } from "@/lib/topology/hardware-profiles";

describe("Phase 1: Lab-Orakel & Routing-Konsistenztest", () => {
  describe("1. Konsistenztest über alle Lab-Topologien (Routing-Tabelle LPM vs. Simulations-Weg)", () => {
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

  describe("2. Lab-Orakel: Verifikation aller Labs mit erwartetem Ping im Zielzustand", () => {
    it("führt alle in Lab-Texten erwarteten Pings aus und berichtet das Ergebnis", () => {
      interface OracleResult {
        labId: string;
        labTitle: string;
        sourceDevice: string;
        targetIpOrDevice: string;
        expected: "success" | "deny";
        actualStatus: string;
        actualSummary: string;
        success: boolean;
        dropReason?: string;
        notes?: string;
      }

      const results: OracleResult[] = [];

      for (const lab of LABS) {
        const cur = CURATED_TOPOLOGIES[lab.id];
        if (!cur) continue;

        let topo;
        try {
          const built = buildNetworkTopologyFromLab(lab, cur, "target");
          topo = built.topology;
        } catch {
          continue;
        }

        // Durchsuche Lab-Schritte und Verifikation nach Ping-Befehlen
        const pingCommands: Array<{ sourceDevName: string; target: string; expected: "success" | "deny"; context: string }> = [];

        // 1. In Steps
        for (const step of lab.steps ?? []) {
          for (const block of step.blocks ?? []) {
            for (const cmd of block.commands ?? []) {
              const pingMatch = cmd.cmd.match(/^ping\s+([0-9.]+|[A-Za-z0-9_-]+)/i);
              if (pingMatch) {
                const target = pingMatch[1];
                const isDeny = /fail|deny|block|verwerf|nicht erreichbar|unreachable/i.test(step.title + " " + (cmd.explanation ?? ""));
                pingCommands.push({
                  sourceDevName: block.device,
                  target,
                  expected: isDeny ? "deny" : "success",
                  context: `${step.title}: ${cmd.cmd}`,
                });
              }
            }
          }
        }

        // 2. In verifyCommands
        for (const vCmd of lab.verifyCommands ?? []) {
          const pingMatch = vCmd.cmd.match(/^ping\s+([0-9.]+|[A-Za-z0-9_-]+)/i);
          if (pingMatch) {
            const target = pingMatch[1];
            const isDeny = /fail|deny|block|verwerf|nicht erreichbar|unreachable|U\.U\.U|\.\.\.\.\./i.test(vCmd.expected + " " + (vCmd.explanation ?? ""));
            const defaultDev = topo.devices.find((d) => d.type === "pc") ?? topo.devices[0];
            pingCommands.push({
              sourceDevName: defaultDev?.name ?? "Host",
              target,
              expected: isDeny ? "deny" : "success",
              context: `Verify: ${vCmd.cmd}`,
            });
          }
        }

        for (const item of pingCommands) {
          // Finde Quellgerät
          const srcDev = topo.devices.find(
            (d) => d.name.toLowerCase() === item.sourceDevName.toLowerCase() || d.config?.hostname?.toLowerCase() === item.sourceDevName.toLowerCase()
          );

          if (!srcDev) continue;

          // Ziel kann IP oder Gerätename sein
          const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(item.target);
          let targetDevId: string | undefined;
          let targetIp: string | undefined;

          if (isIp) {
            targetIp = item.target;
            const found = findDeviceByIp(topo, targetIp);
            if (found) targetDevId = found.device.id;
          } else {
            const tgtDev = topo.devices.find(
              (d) => d.name.toLowerCase() === item.target.toLowerCase() || d.config?.hostname?.toLowerCase() === item.target.toLowerCase()
            );
            if (tgtDev) targetDevId = tgtDev.id;
          }

          if (!targetDevId && !targetIp) continue;

          const sim = simulatePing({
            topology: topo,
            sourceDeviceId: srcDev.id,
            targetDeviceId: targetDevId,
            targetIp,
          });

          results.push({
            labId: lab.id,
            labTitle: lab.title,
            sourceDevice: srcDev.name,
            targetIpOrDevice: item.target,
            expected: item.expected,
            actualStatus: sim.status,
            actualSummary: sim.iosSummary,
            success: sim.success,
            dropReason: sim.forwardHops.find((h) => h.status === "dropped")?.dropReason ?? (sim.success ? undefined : sim.status),
            notes: sim.explanation,
          });
        }
      }

      console.log(`[Lab-Orakel] Ausgewertete Ping-Erwartungen: ${results.length}`);
      const successful = results.filter((r) => (r.expected === "success" && r.success) || (r.expected === "deny" && !r.success));
      console.log(`[Lab-Orakel] Übereinstimmend mit Didaktik: ${successful.length} / ${results.length}`);

      // Gib die Ergebnisse als strukturierte Tabelle aus
      for (const r of results) {
        const match = (r.expected === "success" && r.success) || (r.expected === "deny" && !r.success);
        console.log(`- Lab ${r.labId} (${r.sourceDevice} -> ${r.targetIpOrDevice}): Erwartet ${r.expected}, Ergebnis ${r.actualSummary} (${r.actualStatus}) [${match ? "OK" : "ABWEICHUNG: " + r.dropReason}]`);
      }

      expect(results.length).toBeGreaterThan(10);
    });
  });
});

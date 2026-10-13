import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { computeOspfNeighbors } from "@/lib/topology/ospf-neighbors";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

/**
 * Baut aus der kuratierten OSPF-Lab-Topologie und den Befehlen des Labs (router-id, passive-interface,
 * kein 'ip ospf network') ein Netzwerkmodell. Das Lab setzt keinen Netztyp -> broadcast mit DR/BDR-Wahl.
 */
function buildFromLab(): NetworkTopology {
  const lab = LABS.find((l) => l.id === "ospf")!;
  const topo = lab.structuredTopology!;
  const cmds = new Map<string, string>();
  for (const step of lab.steps)
    for (const b of step.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>)
      cmds.set(b.device, (cmds.get(b.device) ?? "") + "\n" + b.commands.map((c) => c.cmd).join("\n"));

  const short = (n: string) => n.replace("GigabitEthernet", "Gi");
  const devices: TopologyDevice[] = topo.devices
    .filter((d) => d.type === "router")
    .map((d) => {
      const text = cmds.get(d.name) ?? "";
      const rid = /router-id\s+(\S+)/.exec(text)?.[1];
      const passive = [...text.matchAll(/passive-interface\s+(\S+)/g)].map((m) => short(m[1]));
      const rows = topo.addressingTable.filter((r) => r.device === d.name);
      const prefix = (mask: string) => mask.split(".").reduce((a, o) => a + Number(o).toString(2).replace(/0/g, "").length, 0);
      return {
        id: d.id,
        name: d.name,
        type: "router",
        x: 0,
        y: 0,
        interfaces: rows.map((r) => ({
          id: `${d.id}-${short(r.interface)}`,
          name: short(r.interface),
          ip: `${r.ip}/${prefix(r.subnetMask)}`,
          status: "up" as const,
          ospf: { area: 0, passive: passive.includes(short(r.interface)) },
        })),
        config: { hostname: d.name, routingProtocols: ["OSPF 1 Area 0"], ospf: { routerId: rid } },
      };
    });
  const links = topo.links
    .filter((l) => devices.some((d) => d.id === l.from) && devices.some((d) => d.id === l.to))
    .map((l) => ({
      id: l.id,
      sourceDeviceId: l.from,
      sourceInterfaceId: `${l.from}-${l.fromPort}`,
      targetDeviceId: l.to,
      targetInterfaceId: `${l.to}-${l.toPort}`,
      linkType: "ethernet" as const,
      status: "up" as const,
    }));
  return { id: "lab-ospf", name: "ospf", version: "2.0", devices, links };
}

describe("OSPF-Lab: broadcast mit DR/BDR (Konfiguration ist maßgeblich)", () => {
  const net = buildFromLab();
  const out = (id: string) => CiscoCliGenerator.generateShowIpOspfNeighbor(net.devices.find((d) => d.id === id)!, net);
  const rows = (id: string) => out(id).split("\n").slice(1);

  it("R3 Gi0/1 liegt am Link zu R1, Gi0/2 am Link zu R2", () => {
    const l13 = net.links.find((l) => l.id === "link-r1-r3")!;
    const l23 = net.links.find((l) => l.id === "link-r2-r3")!;
    expect(l13.targetInterfaceId).toBe("r3-Gi0/1");
    expect(l23.targetInterfaceId).toBe("r3-Gi0/2");
  });

  it("R1 sieht R2 und R3 als FULL/DR", () => {
    const r = rows("r1");
    expect(r).toHaveLength(2);
    expect(r.find((l) => l.startsWith("2.2.2.2"))).toMatch(/FULL\/DR\s+\S+\s+10\.0\.12\.2\s+Gi0\/1$/);
    expect(r.find((l) => l.startsWith("3.3.3.3"))).toMatch(/FULL\/DR\s+\S+\s+10\.0\.13\.2\s+Gi0\/2$/);
  });

  it("R2 sieht R1 als FULL/BDR und R3 als FULL/DR", () => {
    const r = rows("r2");
    expect(r.find((l) => l.startsWith("1.1.1.1"))).toMatch(/FULL\/BDR\s+\S+\s+10\.0\.12\.1\s+Gi0\/1$/);
    expect(r.find((l) => l.startsWith("3.3.3.3"))).toMatch(/FULL\/DR\s+\S+\s+10\.0\.23\.2\s+Gi0\/2$/);
  });

  it("R3 (höchste Router-ID) ist an beiden Links DR; Nachbarn sind BDR", () => {
    const r = rows("r3");
    expect(r.find((l) => l.startsWith("1.1.1.1"))).toMatch(/FULL\/BDR\s+\S+\s+10\.0\.13\.1\s+Gi0\/1$/);
    expect(r.find((l) => l.startsWith("2.2.2.2"))).toMatch(/FULL\/BDR\s+\S+\s+10\.0\.23\.1\s+Gi0\/2$/);
  });

  it("niemals 'FULL/  -' (das wäre point-to-point) und keine LAN-Nachbarn", () => {
    for (const id of ["r1", "r2", "r3"]) {
      expect(out(id)).not.toContain("FULL/  -");
      expect(rows(id)).toHaveLength(2);
    }
  });

  it("Adressierungstabelle nennt dieselben Rollen wie die Berechnung", () => {
    const topo = LABS.find((l) => l.id === "ospf")!.structuredTopology!;
    for (const d of net.devices) {
      for (const adj of computeOspfNeighbors(d, net)) {
        // Rolle des Nachbarn DR => eigene Rolle BDR und umgekehrt (zwei Router je Segment)
        const own = adj.neighborRole === "DR" ? "BDR" : "DR";
        const row = topo.addressingTable.find(
          (r) => r.device === d.name && `Gi${r.interface.replace("GigabitEthernet", "")}` === adj.localInterface.name
        )!;
        expect(row.description, `${d.name} ${adj.localInterface.name}`).toContain(`· ${own} (Router-ID ${d.config!.ospf!.routerId})`);
        expect(row.description).toContain("broadcast");
      }
    }
  });
});

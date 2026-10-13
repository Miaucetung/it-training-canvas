import { describe, it, expect } from "vitest";
import {
  computeOspfNeighbors,
  formatOspfNeighborTable,
  getOspfRouterId,
  OSPF_NEIGHBOR_HEADER,
} from "@/lib/topology/ospf-neighbors";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { TOPOLOGY_OSPF, TOPOLOGY_BASIC_LAN } from "@/lib/topology/sample-topologies";
import type { InterfaceOspfConfig, NetworkTopology, TopologyDevice } from "@/types/topology";

interface IfaceSpec {
  ip?: string;
  status?: "up" | "down" | "admin-down";
  ospf?: InterfaceOspfConfig;
  name?: string;
}

function router(
  id: string,
  ifaces: IfaceSpec[],
  opts: { routerId?: string; ospf?: boolean; type?: TopologyDevice["type"] } = {}
): TopologyDevice {
  return {
    id,
    name: id,
    type: opts.type ?? "router",
    x: 0,
    y: 0,
    interfaces: ifaces.map((i, n) => ({
      id: `${id}-if${n}`,
      name: i.name ?? `Gi0/${n}`,
      ip: i.ip,
      status: i.status ?? "up",
      ospf: i.ospf,
    })),
    config: {
      hostname: id,
      routingProtocols: opts.ospf === false ? [] : ["OSPF 1"],
      ospf: opts.routerId ? { routerId: opts.routerId } : undefined,
    },
  };
}

function topo(devices: TopologyDevice[]): NetworkTopology {
  const [a, b] = devices;
  return {
    id: "t",
    name: "t",
    version: "2.0",
    devices,
    links: [
      {
        id: "l1",
        sourceDeviceId: a.id,
        sourceInterfaceId: `${a.id}-if0`,
        targetDeviceId: b.id,
        targetInterfaceId: `${b.id}-if0`,
        linkType: "ethernet",
        status: "up",
      },
    ],
  };
}

const pair = (
  a: Partial<IfaceSpec> = {},
  b: Partial<IfaceSpec> = {},
  optsA: { ospf?: boolean } = {},
  optsB: { ospf?: boolean } = {}
) =>
  topo([
    router("R1", [{ ip: "10.0.0.1/30", ...a }, { ip: "1.1.1.1/32", name: "Lo0" }], optsA),
    router("R2", [{ ip: "10.0.0.2/30", ...b }, { ip: "2.2.2.2/32", name: "Lo0" }], optsB),
  ]);

const neighbors = (t: NetworkTopology, id = "R1") =>
  computeOspfNeighbors(t.devices.find((d) => d.id === id)!, t);

describe("OSPF-Nachbarschaften (B-01)", () => {
  describe("positiv", () => {
    it("bildet FULL/  - bei point-to-point", () => {
      const p2p = { ospf: { networkType: "point-to-point" as const } };
      const t = pair(p2p, p2p);
      const out = CiscoCliGenerator.generateShowIpOspfNeighbor(t.devices[0], t);
      const lines = out.split("\n");
      expect(lines[0]).toBe(OSPF_NEIGHBOR_HEADER);
      expect(lines).toHaveLength(2);
      expect(lines[1]).toContain("FULL/  -");
      expect(lines[1]).toContain("10.0.0.2");
      expect(lines[1].startsWith("2.2.2.2".padEnd(16))).toBe(true);
    });

    it("broadcast: höhere Router-ID wird DR, die andere BDR", () => {
      const t = pair();
      expect(neighbors(t, "R1")[0].neighborRole).toBe("DR");
      expect(neighbors(t, "R2")[0].neighborRole).toBe("BDR");
      expect(formatOspfNeighborTable(neighbors(t, "R1"))).toContain("FULL/DR");
      expect(formatOspfNeighborTable(neighbors(t, "R2"))).toContain("FULL/BDR");
    });

    it("broadcast: höhere Priorität schlägt höhere Router-ID", () => {
      const t = pair({ ospf: { priority: 100 } });
      expect(neighbors(t, "R2")[0].neighborRole).toBe("DR");
      expect(neighbors(t, "R1")[0].neighborRole).toBe("BDR");
    });

    it("broadcast: Priorität 0 ist nie DR/BDR", () => {
      const t = pair({}, { ospf: { priority: 0 } });
      const fromR1 = neighbors(t, "R1")[0];
      expect(fromR1.neighborRole).toBe("DROTHER");
      expect(fromR1.state).toBe("FULL");
      expect(neighbors(t, "R2")[0].neighborRole).toBe("DR");
    });

    it("broadcast: beide Priorität 0 -> 2WAY/DROTHER", () => {
      const t = pair({ ospf: { priority: 0 } }, { ospf: { priority: 0 } });
      const n = neighbors(t, "R1")[0];
      expect(n.state).toBe("2WAY");
      expect(formatOspfNeighborTable([n])).toContain("2WAY/DROTHER");
    });

    it("L3-Switch zählt als Nachbar", () => {
      const t = topo([
        router("R1", [{ ip: "10.0.0.1/30" }], { routerId: "1.1.1.1" }),
        router("MLS", [{ ip: "10.0.0.2/30" }], { routerId: "9.9.9.9", type: "switch-l3" }),
      ]);
      expect(neighbors(t)).toHaveLength(1);
    });

    it("Beispieltopologie: R1 sieht genau R2, R2 genau R1", () => {
      const r1 = TOPOLOGY_OSPF.devices.find((d) => d.id === "ospf-r1")!;
      const r2 = TOPOLOGY_OSPF.devices.find((d) => d.id === "ospf-r2")!;
      const t1 = CiscoCliGenerator.generateShowIpOspfNeighbor(r1, TOPOLOGY_OSPF).split("\n");
      const t2 = CiscoCliGenerator.generateShowIpOspfNeighbor(r2, TOPOLOGY_OSPF).split("\n");
      expect(t1).toHaveLength(2);
      expect(t1[1]).toContain("2.2.2.2");
      expect(t1[1]).toContain("FULL/  -");
      expect(t1[1]).toContain("Gi0/0");
      expect(t2).toHaveLength(2);
      expect(t2[1]).toContain("1.1.1.1");
    });
  });

  describe("negativ: leere Tabelle, nie Platzhalter", () => {
    const expectEmpty = (t: NetworkTopology) => {
      const out = CiscoCliGenerator.generateShowIpOspfNeighbor(t.devices[0], t);
      expect(out).toBe(OSPF_NEIGHBOR_HEADER);
    };

    it("kein OSPF auf der Gegenseite", () => expectEmpty(pair({}, {}, {}, { ospf: false })));
    it("kein OSPF auf dem eigenen Gerät", () => expectEmpty(pair({}, {}, { ospf: false })));
    it("Interface passive (eigene Seite)", () => expectEmpty(pair({ ospf: { passive: true } })));
    it("Interface passive (Gegenseite)", () => expectEmpty(pair({}, { ospf: { passive: true } })));
    it("OSPF auf dem Interface deaktiviert", () => expectEmpty(pair({}, { ospf: { enabled: false } })));
    it("Link down", () => {
      const t = pair();
      t.links[0].status = "down";
      expectEmpty(t);
    });
    it("Interface down", () => expectEmpty(pair({}, { status: "down" })));
    it("Interface admin-down", () => expectEmpty(pair({ status: "admin-down" })));
    it("anderes Subnetz", () => expectEmpty(pair({}, { ip: "10.0.1.2/30" })));
    it("anderes Präfix", () => expectEmpty(pair({}, { ip: "10.0.0.2/24" })));
    it("andere Area", () => expectEmpty(pair({ ospf: { area: 0 } }, { ospf: { area: 1 } })));
    it("inkompatibler Netztyp", () =>
      expectEmpty(
        pair({ ospf: { networkType: "point-to-point" } }, { ospf: { networkType: "broadcast" } })
      ));
    it("identische Router-ID", () => {
      const t = topo([
        router("R1", [{ ip: "10.0.0.1/30" }], { routerId: "5.5.5.5" }),
        router("R2", [{ ip: "10.0.0.2/30" }], { routerId: "5.5.5.5" }),
      ]);
      expectEmpty(t);
    });
    it("Layer-2-Switch am anderen Ende", () => {
      const t = topo([
        router("R1", [{ ip: "10.0.0.1/30" }]),
        router("SW", [{}], { type: "switch-l2" }),
      ]);
      expectEmpty(t);
    });
    it("Interface ohne IP", () => expectEmpty(pair({ ip: undefined })));

    it("Basic-LAN: kein Gerät hat Nachbarn", () => {
      for (const d of TOPOLOGY_BASIC_LAN.devices) {
        expect(CiscoCliGenerator.generateShowIpOspfNeighbor(d, TOPOLOGY_BASIC_LAN)).toBe(OSPF_NEIGHBOR_HEADER);
      }
    });

    it("OSPF-Beispiel: Switches und PCs haben keine Nachbarn", () => {
      for (const d of TOPOLOGY_OSPF.devices.filter((x) => x.type !== "router")) {
        expect(CiscoCliGenerator.generateShowIpOspfNeighbor(d, TOPOLOGY_OSPF)).toBe(OSPF_NEIGHBOR_HEADER);
      }
    });

    it("show ip route lernt keine OSPF-Routen ohne Nachbarschaft", () => {
      const t = pair({ ospf: { passive: true } });
      const out = CiscoCliGenerator.generateShowIpRoute(t.devices[0], t);
      expect(out).not.toMatch(/^O\s/m);
    });
  });

  describe("Router-ID nach IOS-Regel", () => {
    it("manuell vor Loopback vor Interface-IP", () => {
      const d = router(
        "R",
        [{ ip: "10.9.9.9/24" }, { ip: "3.3.3.3/32", name: "Lo0" }, { ip: "4.4.4.4/32", name: "Lo1" }],
        { routerId: "7.7.7.7" }
      );
      expect(getOspfRouterId(d)).toBe("7.7.7.7");
      delete d.config!.ospf;
      expect(getOspfRouterId(d)).toBe("4.4.4.4");
      d.interfaces = d.interfaces.filter((i) => !i.name.startsWith("Lo"));
      expect(getOspfRouterId(d)).toBe("10.9.9.9");
    });

    it("numerischer (nicht lexikalischer) Vergleich", () => {
      const d = router("R", [{ ip: "9.0.0.1/24" }, { ip: "10.0.0.1/24", name: "Gi0/1" }]);
      expect(getOspfRouterId(d)).toBe("10.0.0.1");
    });

    it("inaktive Interfaces zählen nicht", () => {
      const d = router("R", [{ ip: "10.0.0.1/24" }, { ip: "200.0.0.1/24", status: "down", name: "Gi0/1" }]);
      expect(getOspfRouterId(d)).toBe("10.0.0.1");
    });

    it("ohne IP keine Router-ID", () => {
      expect(getOspfRouterId(router("R", [{}]))).toBeNull();
    });

    it("ungültige manuelle Router-ID wird ignoriert", () => {
      const d = router("R", [{ ip: "10.0.0.1/24" }], { routerId: "bogus" });
      expect(getOspfRouterId(d)).toBe("10.0.0.1");
    });
  });
});

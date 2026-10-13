import { describe, it, expect } from "vitest";
import { computeOspfNeighbors } from "@/lib/topology/ospf-neighbors";
import type { InterfaceMode, InterfaceOspfConfig, NetworkTopology, TopologyDevice, TopologyLink } from "@/types/topology";

interface RSpec {
  id: string;
  ip: string;
  priority?: number;
  rid?: string;
  passive?: boolean;
  area?: number;
  status?: "up" | "down";
  networkType?: InterfaceOspfConfig["networkType"];
}

const router = (s: RSpec): TopologyDevice => ({
  id: s.id,
  name: s.id,
  type: "router",
  x: 0,
  y: 0,
  interfaces: [
    {
      id: `${s.id}-i0`,
      name: "Gi0/1",
      ip: s.ip,
      status: s.status ?? "up",
      ospf: { area: s.area ?? 0, priority: s.priority, passive: s.passive, networkType: s.networkType },
    },
  ],
  config: { hostname: s.id, routingProtocols: ["OSPF 1"], ospf: { routerId: s.rid ?? `${s.id.replace(/\D/g, "")}.${s.id.replace(/\D/g, "")}.${s.id.replace(/\D/g, "")}.${s.id.replace(/\D/g, "")}` } },
});

interface PortSpec {
  mode?: InterfaceMode;
  vlan?: number;
  nativeVlan?: number;
  allowedVlans?: number[];
  status?: "up" | "down";
  portRole?: "BLK";
}

const sw = (id: string, ports: PortSpec[], type: TopologyDevice["type"] = "switch-l2"): TopologyDevice => ({
  id,
  name: id,
  type,
  x: 0,
  y: 0,
  interfaces: ports.map((p, n) => ({
    id: `${id}-p${n}`,
    name: `Fa0/${n + 1}`,
    status: p.status ?? "up",
    mode: p.mode,
    vlan: p.vlan,
    nativeVlan: p.nativeVlan,
    allowedVlans: p.allowedVlans,
    portRole: p.portRole,
  })),
  config: { hostname: id },
});

const lnk = (id: string, a: string, ai: string, b: string, bi: string, status: TopologyLink["status"] = "up"): TopologyLink => ({
  id,
  sourceDeviceId: a,
  sourceInterfaceId: ai,
  targetDeviceId: b,
  targetInterfaceId: bi,
  linkType: "ethernet",
  status,
});

const topo = (devices: TopologyDevice[], links: TopologyLink[]): NetworkTopology => ({ id: "t", name: "t", version: "2.0", devices, links });

/** R1..R4 an einem Switch (Ports 0..3), Segment 10.1.0.0/29 */
function star(
  routers: RSpec[],
  ports: PortSpec[] = routers.map(() => ({})),
  opts: { swType?: TopologyDevice["type"]; linkStatus?: TopologyLink["status"] } = {}
) {
  const devices = [...routers.map(router), sw("Sw1", ports, opts.swType)];
  const links = routers.map((r, n) => lnk(`l${n}`, r.id, `${r.id}-i0`, "Sw1", `Sw1-p${n}`, n === 0 ? (opts.linkStatus ?? "up") : "up"));
  return topo(devices, links);
}

const RS: RSpec[] = [
  { id: "R1", ip: "10.1.0.1/29", priority: 255, rid: "192.168.254.1" },
  { id: "R2", ip: "10.1.0.2/29", priority: 100, rid: "192.168.254.2" },
  { id: "R3", ip: "10.1.0.3/29", priority: 0, rid: "192.168.254.3" },
  { id: "R4", ip: "10.1.0.4/29", rid: "192.168.254.4" },
];

const view = (t: NetworkTopology, id: string) =>
  Object.fromEntries(computeOspfNeighbors(t.devices.find((d) => d.id === id)!, t).map((a) => [a.neighbor.name, `${a.state}/${a.neighborRole}`]));

describe("OSPF über L2-Switch-Segmente", () => {
  describe("positiv", () => {
    it("Wahl nach Priority: R1 DR, R2 BDR, R3 (Priority 0) und R4 DROTHER", () => {
      const t = star(RS);
      expect(view(t, "R1")).toEqual({ R2: "FULL/BDR", R3: "FULL/DROTHER", R4: "FULL/DROTHER" });
      expect(view(t, "R4")).toEqual({ R1: "FULL/DR", R2: "FULL/BDR", R3: "2WAY/DROTHER" });
      expect(view(t, "R3")).toEqual({ R1: "FULL/DR", R2: "FULL/BDR", R4: "2WAY/DROTHER" });
    });

    it("bei gleicher Priority entscheidet die höhere Router-ID", () => {
      const t = star(RS.map((r) => ({ ...r, priority: 1 })));
      // R4 (…254.4) = DR, R3 (…254.3) = BDR
      expect(view(t, "R1")).toEqual({ R2: "2WAY/DROTHER", R3: "FULL/BDR", R4: "FULL/DR" });
    });

    it("Priority 0 nimmt nicht teil: sind alle 0, gibt es keinen DR und nur 2WAY", () => {
      const t = star(RS.map((r) => ({ ...r, priority: 0 })));
      expect(view(t, "R1")).toEqual({ R2: "2WAY/DROTHER", R3: "2WAY/DROTHER", R4: "2WAY/DROTHER" });
    });

    it("nur ein Teilnehmer mit Priority > 0: er ist DR, es gibt keinen BDR", () => {
      const t = star(RS.map((r, i) => ({ ...r, priority: i === 1 ? 5 : 0 })));
      expect(view(t, "R1")).toEqual({ R2: "FULL/DR", R3: "2WAY/DROTHER", R4: "2WAY/DROTHER" });
    });

    it("zwei Switches über einen Trunk im selben VLAN bilden ein Segment", () => {
      const devices = [
        router(RS[0]),
        router(RS[1]),
        sw("SwA", [{ mode: "access", vlan: 10 }, { mode: "trunk", allowedVlans: [10, 20] }]),
        sw("SwB", [{ mode: "trunk", allowedVlans: [10, 20] }, { mode: "access", vlan: 10 }]),
      ];
      const links = [
        lnk("l0", "R1", "R1-i0", "SwA", "SwA-p0"),
        lnk("l1", "SwA", "SwA-p1", "SwB", "SwB-p0"),
        lnk("l2", "SwB", "SwB-p1", "R2", "R2-i0"),
      ];
      expect(view(topo(devices, links), "R1")).toEqual({ R2: "FULL/BDR" });
    });

    it("Trunk mit nativem VLAN: Router ungetaggt im nativen VLAN ist erreichbar", () => {
      const devices = [router(RS[0]), router(RS[1]), sw("Sw1", [{ mode: "trunk", nativeVlan: 99, allowedVlans: [99] }, { mode: "access", vlan: 99 }])];
      const links = [lnk("l0", "R1", "R1-i0", "Sw1", "Sw1-p0"), lnk("l1", "R2", "R2-i0", "Sw1", "Sw1-p1")];
      expect(view(topo(devices, links), "R1")).toEqual({ R2: "FULL/BDR" });
    });

    it("parallele Switch-Wege: ein STP-geblockter Link wird ignoriert, der andere trägt das Segment", () => {
      const devices = [
        router(RS[0]),
        router(RS[1]),
        sw("SwA", [{}, {}, {}]),
        sw("SwB", [{}, {}, { portRole: "BLK" }]),
      ];
      const links = [
        lnk("l0", "R1", "R1-i0", "SwA", "SwA-p0"),
        lnk("l1", "R2", "R2-i0", "SwB", "SwB-p0"),
        lnk("l2", "SwA", "SwA-p1", "SwB", "SwB-p1"),
        lnk("l3", "SwA", "SwA-p2", "SwB", "SwB-p2", "stp-blocking"),
      ];
      expect(view(topo(devices, links), "R1")).toEqual({ R2: "FULL/BDR" });
    });
  });

  describe("negativ: keine Nachbarschaft, nichts erfunden", () => {
    it("Router in unterschiedlichen VLANs am selben Switch", () => {
      const t = star(RS.slice(0, 2), [{ mode: "access", vlan: 10 }, { mode: "access", vlan: 20 }]);
      expect(view(t, "R1")).toEqual({});
    });

    it("Trunk erlaubt das VLAN nicht", () => {
      const devices = [
        router(RS[0]),
        router(RS[1]),
        sw("SwA", [{ mode: "access", vlan: 10 }, { mode: "trunk", allowedVlans: [20] }]),
        sw("SwB", [{ mode: "trunk", allowedVlans: [20] }, { mode: "access", vlan: 10 }]),
      ];
      const links = [lnk("l0", "R1", "R1-i0", "SwA", "SwA-p0"), lnk("l1", "SwA", "SwA-p1", "SwB", "SwB-p0"), lnk("l2", "SwB", "SwB-p1", "R2", "R2-i0")];
      expect(view(topo(devices, links), "R1")).toEqual({});
    });

    it("Switch-Port heruntergefahren oder Link down", () => {
      expect(view(star(RS.slice(0, 2), [{}, { status: "down" }]), "R1")).toEqual({});
      const devices = [router(RS[0]), router(RS[1]), sw("Sw1", [{}, {}])];
      const links = [lnk("l0", "R1", "R1-i0", "Sw1", "Sw1-p0"), lnk("l1", "R2", "R2-i0", "Sw1", "Sw1-p1", "down")];
      expect(view(topo(devices, links), "R1")).toEqual({});
    });

    it("einziger Weg ist STP-geblockt", () => {
      const devices = [router(RS[0]), router(RS[1]), sw("SwA", [{}, {}]), sw("SwB", [{}, {}])];
      const links = [
        lnk("l0", "R1", "R1-i0", "SwA", "SwA-p0"),
        lnk("l1", "SwA", "SwA-p1", "SwB", "SwB-p0", "stp-blocking"),
        lnk("l2", "SwB", "SwB-p1", "R2", "R2-i0"),
      ];
      expect(view(topo(devices, links), "R1")).toEqual({});
    });

    it("L3-Switch im Pfad oder routed Port: nicht bestimmbar, keine Nachbarn", () => {
      expect(view(star(RS.slice(0, 2), [{}, {}], { swType: "switch-l3" }), "R1")).toEqual({});
      expect(view(star(RS.slice(0, 2), [{ mode: "routed" }, {}]), "R1")).toEqual({});
    });

    it("unterschiedliche Area, anderes Subnetz, passive Interface, gleiche Router-ID", () => {
      expect(view(star([RS[0], { ...RS[1], area: 1 }]), "R1")).toEqual({});
      expect(view(star([RS[0], { ...RS[1], ip: "10.2.0.2/29" }]), "R1")).toEqual({});
      expect(view(star([RS[0], { ...RS[1], passive: true }]), "R1")).toEqual({});
      expect(view(star([RS[0], { ...RS[1], rid: RS[0].rid }]), "R1")).toEqual({});
    });

    it("Router mit ausgeschaltetem Interface nimmt nicht an der Wahl teil", () => {
      const t = star(RS.map((r, i) => (i === 0 ? { ...r, status: "down" as const } : r)));
      expect(view(t, "R2")).toEqual({ R3: "FULL/DROTHER", R4: "FULL/BDR" });
    });

    it("anderer Netztyp (point-to-point) mit Broadcast-Partner", () => {
      expect(view(star([RS[0], { ...RS[1], networkType: "point-to-point" }]), "R1")).toEqual({});
    });
  });

  describe("Router-on-a-Stick am Trunk (dot1q-Subinterface)", () => {
    const mk = (opts: { subVlan?: number; allowed?: number[]; subName?: string } = {}) => {
      const r1 = router({ id: "R1", ip: "10.1.0.1/29", priority: 1, rid: "1.1.1.1" });
      const r2: TopologyDevice = {
        id: "R2",
        name: "R2",
        type: "router",
        x: 0,
        y: 0,
        interfaces: [
          { id: "R2-i0", name: "Gi0/0", status: "up", mode: "routed" },
          { id: "R2-i0s", name: opts.subName ?? "Gi0/0.10", ip: "10.1.0.2/29", vlan: opts.subVlan ?? 10, mode: "routed", status: "up", ospf: { area: 0 } },
        ],
        config: { hostname: "R2", routingProtocols: ["OSPF 1"], ospf: { routerId: "2.2.2.2" } },
      };
      const s = sw("sw1", [{ mode: "access", vlan: 10 }, { mode: "trunk", allowedVlans: opts.allowed ?? [10, 20] }]);
      return topo([r1, r2, s], [lnk("l1", "R1", "R1-i0", "sw1", "sw1-p0"), lnk("l2", "R2", "R2-i0", "sw1", "sw1-p1")]);
    };
    it("positiv: Subinterface des passenden VLANs bildet die Nachbarschaft", () => {
      expect(view(mk(), "R1")).toEqual({ R2: "FULL/DR" }); // höhere Router-ID 2.2.2.2
    });
    it("negativ: falsches VLAN am Subinterface, VLAN nicht erlaubt, Subinterface zu anderem Port", () => {
      expect(view(mk({ subVlan: 20 }), "R1")).toEqual({});
      expect(view(mk({ allowed: [20] }), "R1")).toEqual({});
      expect(view(mk({ subName: "Gi0/1.10" }), "R1")).toEqual({});
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  LINK_LOCAL_UNKNOWN,
  computeEigrpv6Neighbors,
  computeIpv6Routes,
  computeOspfv3Neighbors,
  formatEigrpv6NeighborTable,
  formatIpv6,
  formatOspfv3NeighborTable,
  formatShowIpv6InterfaceBrief,
  formatShowIpv6Route,
  ipv6Hints,
  parseIpv6,
} from "@/lib/topology/ipv6-routing";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import type { DeviceConfig, NetworkTopology, TopologyDevice, TopologyInterface, TopologyLink } from "@/types/topology";

interface IfSpec {
  name?: string;
  ipv6?: string;
  ll?: string;
  ip?: string;
  area?: number;
  priority?: number;
  passive?: boolean;
  asn?: number;
  status?: "up" | "down" | "admin-down";
}

function router(id: string, ifs: IfSpec[], cfg: Partial<DeviceConfig> = {}, withOspf = false): TopologyDevice {
  const interfaces: TopologyInterface[] = ifs.map((s, n) => ({
    id: `${id}-i${n}`,
    name: s.name ?? `Gi0/${n}`,
    ipv6: s.ipv6,
    ipv6LinkLocal: s.ll,
    ip: s.ip,
    status: s.status ?? "up",
    ...(s.area !== undefined || withOspf ? { ospfv3: { processId: 1, area: s.area ?? 0, priority: s.priority, passive: s.passive } } : {}),
    ...(s.asn !== undefined ? { eigrpv6: { asn: s.asn } } : {}),
  }));
  return { id, name: id, type: "router", x: 0, y: 0, interfaces, config: { hostname: id, ipv6RoutingEnabled: true, ...cfg } };
}

const sw = (id: string, ports: Array<Partial<TopologyInterface>>): TopologyDevice => ({
  id,
  name: id,
  type: "switch-l2",
  x: 0,
  y: 0,
  interfaces: ports.map((p, n) => ({ id: `${id}-p${n}`, name: `Fa0/${n + 1}`, status: "up" as const, ...p })),
  config: { hostname: id },
});

const lnk = (id: string, a: string, ai: number | string, b: string, bi: number | string, status: TopologyLink["status"] = "up"): TopologyLink => ({
  id,
  sourceDeviceId: a,
  sourceInterfaceId: typeof ai === "number" ? (a.startsWith("sw") ? `${a}-p${ai}` : `${a}-i${ai}`) : ai,
  targetDeviceId: b,
  targetInterfaceId: typeof bi === "number" ? (b.startsWith("sw") ? `${b}-p${bi}` : `${b}-i${bi}`) : bi,
  linkType: "ethernet",
  status,
});

const topo = (devices: TopologyDevice[], links: TopologyLink[]): NetworkTopology => ({ id: "t", name: "t", version: "2.0", devices, links });
const dev = (t: NetworkTopology, id: string) => t.devices.find((d) => d.id === id)!;

/** R1 -- R2, Transit 2001:db8:12::/64, je ein LAN */
function pair(a: Partial<IfSpec> = {}, b: Partial<IfSpec> = {}, cfgA: Partial<DeviceConfig> = {}, cfgB: Partial<DeviceConfig> = {}): NetworkTopology {
  const r1 = router("R1", [{ ipv6: "2001:db8:12::1/64", area: 0, asn: 1, ...a }, { ipv6: "2001:db8:1::1/64", area: 0, asn: 1 }], cfgA);
  const r2 = router("R2", [{ ipv6: "2001:db8:12::2/64", area: 0, asn: 1, ...b }, { ipv6: "2001:db8:2::1/64", area: 0, asn: 1 }], cfgB);
  const host = (id: string): TopologyDevice => ({ id, name: id, type: "pc", x: 0, y: 0, interfaces: [{ id: `${id}-i0`, name: "Fa0", status: "up" }], config: { hostname: id } });
  return topo([r1, r2, host("H1"), host("H2")], [lnk("l", "R1", 0, "R2", 0), lnk("lh1", "R1", 1, "H1", 0), lnk("lh2", "R2", 1, "H2", 0)]);
}

const OSPF3 = { ospfv3: { processId: 1, routerId: "1.1.1.1" } };
const OSPF3_R2 = { ospfv3: { processId: 1, routerId: "2.2.2.2" } };
const EIGRP = { eigrpv6: { asn: 1, routerId: "1.1.1.1", shutdown: false } };
const EIGRP_R2 = { eigrpv6: { asn: 1, routerId: "2.2.2.2", shutdown: false } };

describe("IPv6-Adressen", () => {
  it("Schreibweise wie IOS", () => {
    expect(formatIpv6(parseIpv6("2001:db8:0:0:0:0:0:1")!)).toBe("2001:DB8::1");
    expect(formatIpv6(parseIpv6("fd00::2")!)).toBe("FD00::2");
    expect(formatIpv6(parseIpv6("::")!)).toBe("::");
    expect(formatIpv6(parseIpv6("2001:db8:cca1:254::1:1")!)).toBe("2001:DB8:CCA1:254::1:1");
  });
  it("ungültige Adressen", () => {
    for (const bad of ["", "1::2::3", "2001:db8", "gggg::1", "1:2:3:4:5:6:7:8:9"]) expect(parseIpv6(bad), bad).toBeNull();
  });
});

describe("show ipv6 interface brief", () => {
  it("globale Adresse aus dem Lab, Link-Local nur wenn konfiguriert, sonst gekennzeichnet", () => {
    const t = pair({ ll: "fe80::1" });
    const out = formatShowIpv6InterfaceBrief(dev(t, "R1"), t);
    expect(out).toContain("GigabitEthernet0/0     [up/up]\n    FE80::1\n    2001:DB8:12::1");
    expect(out).toContain(`GigabitEthernet0/1     [up/up]\n    ${LINK_LOCAL_UNKNOWN}\n    2001:DB8:1::1`);
  });
  it("Interfaces ohne IPv6 sind unassigned, abgeschaltete administratively down", () => {
    const r = router("R1", [{ ipv6: "2001:db8::1/64", status: "admin-down" }, {}]);
    const t = topo([r], []);
    expect(formatShowIpv6InterfaceBrief(r, t)).toBe(`GigabitEthernet0/0     [administratively down/down]\n    ${LINK_LOCAL_UNKNOWN}\n    2001:DB8::1\nGigabitEthernet0/1     [down/down]\n    unassigned`);
  });
});

describe("show ipv6 route", () => {
  it("ohne ipv6 unicast-routing kein IPv6-Routing", () => {
    const t = pair({}, {}, { ipv6RoutingEnabled: false });
    expect(formatShowIpv6Route(dev(t, "R1"), t)).toMatch(/^% IPv6 routing not enabled/);
    expect(computeIpv6Routes(dev(t, "R1"), t).routes).toEqual([]);
  });

  it("Connected, Local und LC für /128", () => {
    const r = router("R1", [{ ipv6: "2001:db8:1::1/64" }, { name: "Lo0", ipv6: "2001:db8:ff::1/128" }]);
    const peer = router("R2", [{ ipv6: "2001:db8:1::2/64" }]);
    const t = topo([r, peer], [lnk("l", "R1", 0, "R2", 0)]);
    const out = formatShowIpv6Route(r, t);
    expect(out).toContain("C   2001:DB8:1::/64 [0/0]\n     via GigabitEthernet0/0, directly connected");
    expect(out).toContain("L   2001:DB8:1::1/128 [0/0]\n     via GigabitEthernet0/0, receive");
    expect(out).toContain("LC  2001:DB8:FF::1/128 [0/0]\n     via Loopback0, receive");
  });

  it("Static: Next-Hop im angeschlossenen Präfix wird installiert, unauflösbarer nicht", () => {
    const t = pair({}, {}, { ipv6Routes: [{ prefix: "2001:db8:2::/64", nextHop: "2001:db8:12::2" }, { prefix: "2001:db8:9::/64", nextHop: "2001:db8:99::2" }, { prefix: "::/0", nextHop: "2001:db8:12::2" }] });
    const out = formatShowIpv6Route(dev(t, "R1"), t);
    expect(out).toContain("S   2001:DB8:2::/64 [1/0]\n     via 2001:DB8:12::2");
    expect(out).toContain("S   ::/0 [1/0]\n     via 2001:DB8:12::2");
    expect(out).not.toContain("2001:DB8:9::/64");
  });

  it("Static über Interface und Floating Static (höhere AD) wird von der besseren Route verdrängt", () => {
    const t = pair({}, {}, {
      ipv6Routes: [
        { prefix: "2001:db8:2::/64", nextHop: "2001:db8:12::2", distance: 200 },
        { prefix: "2001:db8:2::/64", outInterface: "Gi0/0" },
        { prefix: "2001:db8:7::/64", nextHop: "2001:db8:12::2", distance: 200 },
      ],
    });
    const out = formatShowIpv6Route(dev(t, "R1"), t);
    expect(out).toContain("S   2001:DB8:2::/64 [1/0]\n     via GigabitEthernet0/0, directly connected");
    expect(out).toContain("S   2001:DB8:7::/64 [200/0]");
  });

  it("Static fällt weg, wenn das Interface down ist", () => {
    const t = pair({ status: "down" }, {}, { ipv6Routes: [{ prefix: "2001:db8:2::/64", nextHop: "2001:db8:12::2" }] });
    expect(formatShowIpv6Route(dev(t, "R1"), t)).not.toContain("2001:DB8:2::/64");
  });

  it("OSPFv3: O-Route mit Kosten 2, Next-Hop Link-Local nicht bestimmbar bzw. konfiguriert", () => {
    const t = pair({}, {}, OSPF3, OSPF3_R2);
    const out = formatShowIpv6Route(dev(t, "R1"), t);
    expect(out).toContain(`O   2001:DB8:2::/64 [110/2]\n     via ${LINK_LOCAL_UNKNOWN}, GigabitEthernet0/0`);
    const t2 = pair({}, { ll: "fe80::2" }, OSPF3, OSPF3_R2);
    expect(formatShowIpv6Route(dev(t2, "R1"), t2)).toContain("via FE80::2, GigabitEthernet0/0");
  });

  it("OSPFv3: Serial kostet 64", () => {
    const t = pair({ name: "Se0/0/0" }, { name: "Se0/0/0" }, OSPF3, OSPF3_R2);
    expect(formatShowIpv6Route(dev(t, "R1"), t)).toContain("O   2001:DB8:2::/64 [110/65]");
  });

  it("OSPFv3: passive Interfaces werden weiterhin angekündigt", () => {
    const t = pair({}, {}, OSPF3, OSPF3_R2);
    dev(t, "R2").interfaces[1].ospfv3!.passive = true;
    expect(formatShowIpv6Route(dev(t, "R1"), t)).toContain("2001:DB8:2::/64 [110/2]");
  });

  it("EIGRPv6: D-Route [90/3072] bei GigabitEthernet und niedrigere AD als OSPFv3", () => {
    const t = pair({}, {}, { ...OSPF3, ...EIGRP }, { ...OSPF3_R2, ...EIGRP_R2 });
    const out = formatShowIpv6Route(dev(t, "R1"), t);
    expect(out).toContain("D   2001:DB8:2::/64 [90/3072]");
    expect(out).not.toContain("[110/");
  });

  it("EIGRPv6: ohne Prozess auf einer Seite keine D-Route", () => {
    const t = pair({}, {}, EIGRP, { eigrpv6: { asn: 1, routerId: "2.2.2.2", shutdown: true } });
    expect(formatShowIpv6Route(dev(t, "R1"), t)).not.toContain("D   ");
  });
});

describe("show ipv6 ospf neighbor", () => {
  it("Nachbar auf direktem Link, Router-ID und Rollen", () => {
    const t = pair({}, {}, OSPF3, OSPF3_R2);
    const adj = computeOspfv3Neighbors(dev(t, "R1"), t);
    expect(adj).toHaveLength(1);
    expect(adj[0]).toMatchObject({ neighborRouterId: "2.2.2.2", state: "FULL", neighborRole: "DR" });
    const out = formatOspfv3NeighborTable(dev(t, "R1"), adj);
    expect(out).toContain("OSPFv3 Router with ID (1.1.1.1) (Process ID 1)");
    expect(out).toContain("2.2.2.2           1   FULL/DR");
  });

  it("über Switch-Segment mit DR/BDR-Wahl (Priority 255 / 100 / 0 / Default)", () => {
    const rs = [255, 100, 0, undefined].map((prio, n) => router(`R${n + 1}`, [{ ipv6: `2001:db8:a::${n + 1}/64`, area: 0, priority: prio }], { ospfv3: { processId: 1, routerId: `${n + 1}.${n + 1}.${n + 1}.${n + 1}` } }));
    const s = sw("sw1", [{}, {}, {}, {}]);
    const t = topo([...rs, s], rs.map((r, n) => lnk(`l${n}`, r.id, 0, "sw1", n)));
    const view = (id: string) => Object.fromEntries(computeOspfv3Neighbors(dev(t, id), t).map((a) => [a.neighbor.id, `${a.state}/${a.neighborRole}`]));
    expect(view("R1")).toEqual({ R2: "FULL/BDR", R3: "FULL/DROTHER", R4: "FULL/DROTHER" });
    expect(view("R4")).toEqual({ R1: "FULL/DR", R2: "FULL/BDR", R3: "2WAY/DROTHER" });
  });

  it("negativ: unterschiedliche VLANs, passive, andere Area, STP-geblockter Weg", () => {
    const mk = (portsB: Array<Partial<TopologyInterface>>, a2: Partial<IfSpec> = {}, status: TopologyLink["status"] = "up") => {
      const r1 = router("R1", [{ ipv6: "2001:db8:a::1/64", area: 0 }], OSPF3);
      const r2 = router("R2", [{ ipv6: "2001:db8:a::2/64", area: 0, ...a2 }], OSPF3_R2);
      return topo([r1, r2, sw("sw1", portsB)], [lnk("l1", "R1", 0, "sw1", 0), lnk("l2", "R2", 0, "sw1", 1, status)]);
    };
    expect(computeOspfv3Neighbors(dev(mk([{ mode: "access", vlan: 10 }, { mode: "access", vlan: 10 }]), "R1"), mk([{ mode: "access", vlan: 10 }, { mode: "access", vlan: 10 }]))).toHaveLength(1);
    const diff = mk([{ mode: "access", vlan: 10 }, { mode: "access", vlan: 20 }]);
    expect(computeOspfv3Neighbors(dev(diff, "R1"), diff)).toEqual([]);
    const passive = mk([{}, {}], { passive: true });
    expect(computeOspfv3Neighbors(dev(passive, "R1"), passive)).toEqual([]);
    const area = mk([{}, {}], { area: 1 });
    expect(computeOspfv3Neighbors(dev(area, "R1"), area)).toEqual([]);
    const blocked = mk([{}, {}], {}, "stp-blocking");
    expect(computeOspfv3Neighbors(dev(blocked, "R1"), blocked)).toEqual([]);
  });

  it("ohne ipv6 unicast-routing keine Nachbarn und Hinweis", () => {
    const t = pair({}, {}, { ...OSPF3, ipv6RoutingEnabled: false }, OSPF3_R2);
    expect(computeOspfv3Neighbors(dev(t, "R1"), t)).toEqual([]);
    expect(formatOspfv3NeighborTable(dev(t, "R1"), [])).toMatch(/^% IPv6 routing not enabled/);
    expect(ipv6Hints(dev(t, "R1")).join(" ")).toContain("ipv6 unicast-routing fehlt");
  });

  it("ohne IPv4 und ohne manuelle router-id: keine Nachbarschaft, Hinweis; mit IPv4 wird die Router-ID abgeleitet", () => {
    const noId = pair({}, {}, { ospfv3: { processId: 1 } }, OSPF3_R2);
    expect(computeOspfv3Neighbors(dev(noId, "R1"), noId)).toEqual([]);
    expect(computeOspfv3Neighbors(dev(noId, "R2"), noId)).toEqual([]); // R1 hat keine ID, also keine Nachbarschaft
    expect(formatOspfv3NeighborTable(dev(noId, "R1"), [])).toContain("keine Router-ID bestimmbar");
    expect(ipv6Hints(dev(noId, "R1")).join(" ")).toContain("OSPFv3: keine Router-ID bestimmbar");

    const v4 = pair({}, {}, { ospfv3: { processId: 1 } }, OSPF3_R2);
    dev(v4, "R1").interfaces[1].ip = "192.168.1.1/24";
    const adj = computeOspfv3Neighbors(dev(v4, "R2"), v4);
    expect(adj).toHaveLength(1);
    expect(adj[0].neighborRouterId).toBe("192.168.1.1");
    expect(ipv6Hints(dev(v4, "R1"))).toEqual([]);
  });
});

describe("show ipv6 eigrp neighbors", () => {
  it("Nachbar nur mit gleicher AS auf beiden Seiten und aktivem Prozess", () => {
    const ok = pair({}, {}, EIGRP, EIGRP_R2);
    expect(computeEigrpv6Neighbors(dev(ok, "R1"), ok)).toHaveLength(1);
    const asMismatch = pair({}, { asn: 2 }, EIGRP, { eigrpv6: { asn: 2, routerId: "2.2.2.2", shutdown: false } });
    expect(computeEigrpv6Neighbors(dev(asMismatch, "R1"), asMismatch)).toEqual([]);
    const ifaceOff = pair({}, { asn: undefined }, EIGRP, EIGRP_R2);
    dev(ifaceOff, "R2").interfaces[0].eigrpv6 = undefined;
    expect(computeEigrpv6Neighbors(dev(ifaceOff, "R1"), ifaceOff)).toEqual([]);
  });

  it("shutdown-Prozess (no shutdown fehlt) bildet keine Nachbarschaft und erzeugt Hinweis", () => {
    const t = pair({}, {}, { eigrpv6: { asn: 1, routerId: "1.1.1.1", shutdown: true } }, EIGRP_R2);
    expect(computeEigrpv6Neighbors(dev(t, "R1"), t)).toEqual([]);
    expect(computeEigrpv6Neighbors(dev(t, "R2"), t)).toEqual([]);
    expect(formatEigrpv6NeighborTable(dev(t, "R1"), [])).toContain("shutdown");
    expect(ipv6Hints(dev(t, "R1")).join(" ")).toContain("no shutdown fehlt");
  });

  it("ohne IPv4 und ohne eigrp router-id: keine Nachbarschaft und Hinweis", () => {
    const t = pair({}, {}, { eigrpv6: { asn: 1, shutdown: false } }, EIGRP_R2);
    expect(computeEigrpv6Neighbors(dev(t, "R2"), t)).toEqual([]);
    expect(formatEigrpv6NeighborTable(dev(t, "R1"), [])).toContain("ohne Router-ID");
    expect(ipv6Hints(dev(t, "R1")).join(" ")).toContain("EIGRPv6: keine Router-ID bestimmbar");
  });

  it("über Switch-Segment, mit Link-Local-Kennzeichnung und ohne erfundene Laufzeitwerte", () => {
    const r1 = router("R1", [{ ipv6: "2001:db8:a::1/64", asn: 1, ll: "fe80::1" }], EIGRP);
    const r2 = router("R2", [{ ipv6: "2001:db8:a::2/64", asn: 1 }], EIGRP_R2);
    const t = topo([r1, r2, sw("sw1", [{}, {}])], [lnk("l1", "R1", 0, "sw1", 0), lnk("l2", "R2", 0, "sw1", 1)]);
    const n = computeEigrpv6Neighbors(r1, t);
    expect(n).toHaveLength(1);
    const out = formatEigrpv6NeighborTable(r1, n);
    expect(out).toContain("EIGRP-IPv6 Neighbors for AS(1)");
    expect(out).toContain(LINK_LOCAL_UNKNOWN);
    expect(out).toContain("Laufzeitwerte");
    expect(formatEigrpv6NeighborTable(r2, computeEigrpv6Neighbors(r2, t))).not.toContain("FE80::2");
  });
});

describe("Integration in die show-Ausgaben", () => {
  it("IPv6-Ausgaben nur bei IPv6-Konfiguration; v3 erzeugt keine OSPFv2-Ausgabe", () => {
    const t = pair({}, {}, { ...OSPF3, ...EIGRP, routingProtocols: ["OSPFv3 1 Area 0", "EIGRPv6 1"] }, OSPF3_R2);
    const keys = Object.keys(CiscoCliGenerator.getDynamicShowOutputs(dev(t, "R1"), t));
    expect(keys).toEqual(expect.arrayContaining(["show ipv6 interface brief", "show ipv6 route", "show ipv6 ospf neighbor", "show ipv6 eigrp neighbors"]));
    expect(keys).not.toContain("show ip ospf neighbor");
    const v4only = topo([{ ...router("R9", [{ ip: "10.0.0.1/24" }], {}), config: { hostname: "R9" } }], []);
    expect(Object.keys(CiscoCliGenerator.getDynamicShowOutputs(v4only.devices[0], v4only)).some((k) => k.includes("ipv6"))).toBe(false);
  });
});

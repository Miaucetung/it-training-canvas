import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, getLabDeviceCli } from "@/components/labs/lab-to-network";
import { computeOspfNeighbors, getOspfRouterId } from "@/lib/topology/ospf-neighbors";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return { lab, ...buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state) };
};

describe("Paket 2 Routing – labspezifische Prüfungen", () => {
  it("floating-static: ISP-MPLS und DSL-Modem sind als „im Lab nicht angegeben“ markiert und ohne Konfiguration", () => {
    const { lab, topology } = build("floating-static");
    for (const name of ["ISP-MPLS", "DSL-Modem"]) {
      const d = topology.devices.find((x) => x.name === name)!;
      expect(d.assumed, name).toBe(true);
      expect(d.interfaces.every((i) => !i.ip), name).toBe(true);
      expect(d.config?.labCli, name).toBeUndefined();
      expect(getLabDeviceCli(lab, name), name).toBe("");
    }
    const r1 = getLabDeviceCli(lab, "R1");
    expect(r1).toContain("ip route 0.0.0.0 0.0.0.0 10.1.1.1");
    expect(r1).toContain("ip route 0.0.0.0 0.0.0.0 10.2.2.1 200");
  });

  it("floating-static: Next-Hops liegen im jeweiligen /30 des R1-Interfaces", () => {
    const { topology } = build("floating-static");
    const r1 = topology.devices.find((d) => d.name === "R1")!;
    expect(r1.interfaces.find((i) => i.name === "Gi0/0")?.ip).toBe("10.1.1.2/30");
    expect(r1.interfaces.find((i) => i.name === "Gi0/1")?.ip).toBe("10.2.2.2/30");
  });

  it("static-routing: R1 und R2 tragen die Routen des Labs im CLI-Export", () => {
    const { lab } = build("static-routing");
    expect(getLabDeviceCli(lab, "R1")).toMatch(/ip route 192\.168\.2\.0 255\.255\.255\.0 10\.0\.0\.2/);
    expect(getLabDeviceCli(lab, "R2")).toMatch(/ip route 192\.168\.1\.0 255\.255\.255\.0 10\.0\.0\.1/);
  });

  it("rip-v1 / rip-v2: gleiche Struktur, WAN-Masken /24 bzw. /30 laut Lab", () => {
    const v1 = build("rip-v1").topology.devices.find((d) => d.name === "R1")!;
    const v2 = build("rip-v2").topology.devices.find((d) => d.name === "R1")!;
    expect(v1.interfaces.find((i) => i.name === "Gi0/1")?.ip).toMatch(/\/24$/);
    expect(v2.interfaces.find((i) => i.name === "Gi0/1")?.ip).toMatch(/\/30$/);
  });

  it("rip-v2-passive: Segment 10.0.0.8/29 mit R2, R3, R4 über SW1; SW1 ohne Konfiguration", () => {
    const { lab, topology } = build("rip-v2-passive");
    const ip = (dev: string, ifc: string) => topology.devices.find((d) => d.name === dev)!.interfaces.find((i) => i.name === ifc)?.ip;
    expect(ip("R2", "Gi0/0")).toBe("10.0.0.9/29");
    expect(ip("R3", "Gi0/1")).toBe("10.0.0.10/29");
    expect(ip("R4", "Gi0/1")).toBe("10.0.0.11/29");
    expect(topology.devices.find((d) => d.name === "SW1")).toBeDefined();
    expect(getLabDeviceCli(lab, "R1")).toContain("passive-interface");
  });

  it("ospf-multiarea: R2 ist ABR mit Area 0 und Area 1", () => {
    const { topology } = build("ospf-multiarea");
    const r2 = topology.devices.find((d) => d.name === "R2")!;
    const areas = r2.interfaces.filter((i) => i.ospf).map((i) => i.ospf!.area);
    expect(new Set(areas)).toEqual(new Set([0, 1]));
  });

  it("ospf-rid-wildcard: Router-ID ist die Loopback-Adresse", () => {
    const { topology } = build("ospf-rid-wildcard");
    const rid = (n: string) => getOspfRouterId(topology.devices.find((d) => d.name === n)!);
    expect(rid("R1")).toBe("1.1.1.1");
    expect(rid("R2")).toBe("2.2.2.2");
    expect(rid("R3")).toBe("3.3.3.3");
  });

  it("ospf-dr-bdr-election: Priorities 255/100/0/Default, Router-ID = Loopback, Wahl über Sw1: R1 DR, R2 BDR", () => {
    const { topology } = build("ospf-dr-bdr-election");
    const r = (n: string) => topology.devices.find((d) => d.name === n)!;
    const prio = (n: string) => r(n).interfaces.find((i) => i.name === "Gi0/1")!.ospf;
    expect(prio("R1")).toMatchObject({ area: 0, networkType: "broadcast", priority: 255 });
    expect(prio("R2")).toMatchObject({ priority: 100 });
    expect(prio("R3")).toMatchObject({ priority: 0 });
    expect(prio("R4")?.priority).toBeUndefined();
    expect(getOspfRouterId(r("R1"))).toBe("192.168.254.1");
    expect(getOspfRouterId(r("R4"))).toBe("192.168.254.4");
    const seen = (n: string) => Object.fromEntries(computeOspfNeighbors(r(n), topology).map((a) => [a.neighbor.name, `${a.state}/${a.neighborRole}`]));
    expect(seen("R1")).toEqual({ R2: "FULL/BDR", R3: "FULL/DROTHER", R4: "FULL/DROTHER" });
    expect(seen("R4")).toEqual({ R1: "FULL/DR", R2: "FULL/BDR", R3: "2WAY/DROTHER" });
  });

  it("ospf-dr-bdr-election: Server-IPs stammen aus der Server-Zeile des Labs", () => {
    const { topology } = build("ospf-dr-bdr-election");
    const ip = (n: string) => topology.devices.find((d) => d.name === n)!.interfaces.find((i) => i.ip)?.ip;
    expect(ip("Server0")).toBe("192.168.2.11/24");
    expect(ip("Server1")).toBe("192.168.3.11/24");
    expect(ip("Server2")).toBe("192.168.4.11/24");
  });

  it("eigrp: Dreieck mit drei /30-Links und zwei LANs", () => {
    const { topology } = build("eigrp");
    const transit = topology.links.filter((l) => /^10\.0\./.test(topology.devices.find((d) => d.id === l.sourceDeviceId)!.interfaces.find((i) => i.id === l.sourceInterfaceId)?.ip ?? ""));
    expect(transit).toHaveLength(3);
  });

  it("drill-interfaces: nur der WAN-Link wird gezeichnet, LAN-Interfaces stehen nur in der Tabelle", () => {
    const data = CURATED_TOPOLOGIES["drill-interfaces"];
    expect(data.links).toHaveLength(1);
    expect(data.addressingTable).toHaveLength(6);
  });

  it("drill-pc-ips: sechs PCs 192.168.50.11–.16 mit Gateway .50.1, SW1 ohne erfundene Konfiguration", () => {
    const { lab, topology } = build("drill-pc-ips");
    for (let i = 0; i < 6; i++) {
      const pc = topology.devices.find((d) => d.name === `PC${i}`)!;
      expect(pc.interfaces.find((x) => x.ip)?.ip, pc.name).toBe(`192.168.50.${11 + i}/24`);
      expect(pc.config?.defaultGateway, pc.name).toBe("192.168.50.1");
    }
    expect(getLabDeviceCli(lab, "SW1")).toBe("");
  });

  it("angenommene Switch-Ports werden gekennzeichnet, im Lab genannte nicht", () => {
    const assumed = (id: string) =>
      build(id).topology.devices.flatMap((d) => d.interfaces.filter((i) => i.assumed).map((i) => `${d.name} ${i.name}`));
    expect(assumed("ospf-dr-bdr-election")).toEqual(["Sw1 Fa0/1", "Sw1 Fa0/2", "Sw1 Fa0/3", "Sw1 Fa0/4"]);
    expect(assumed("rip-v2-passive")).toEqual(expect.arrayContaining(["SW1 Gi0/1", "SW1 Fa0/1", "SW1 Fa0/2"]));
    expect(assumed("drill-pc-ips")).toEqual([]); // „SW1 Fa0/1–Fa0/6“ steht im Lab
    expect(assumed("ospf-multiarea")).toEqual([]); // keine Switches
  });
});

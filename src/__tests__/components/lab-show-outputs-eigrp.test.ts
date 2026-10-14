import { describe, it, expect } from "vitest";
import { parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { computeEigrpNeighbors, computeEigrpRoutes, computeOspfExternalRoutes, eigrpHints } from "@/lib/topology/eigrp-ipv4";
import { computeOspfNeighbors } from "@/lib/topology/ospf-neighbors";
import type { NetworkTopology } from "@/types/topology";
import { editedLab, labOf, showOutputs, topologyOf } from "../helpers/lab-edit";

const eigrpLab = labOf("eigrp");
const coLab = labOf("co-acl-nat-isp");
const dev = (t: NetworkTopology, n: string) => t.devices.find((d) => d.name === n)!;
/** eigrp-Lab ohne den abschließenden Failover-Test (R1 Gi0/2 shutdown) */
const noFailover = () => {
  let inGi2 = false;
  return editedLab(eigrpLab, (d, l) => {
    if (/^interface /i.test(l)) inGi2 = d === "R1" && /^interface gi0\/2$/i.test(l);
    return inGi2 && l === "shutdown" ? null : l;
  });
};

describe("EIGRP für IPv4: Nachbarn und Routen (eigrp-Lab)", () => {
  it("Zielzustand: R1 Gi0/2 ist am Ende abgeschaltet, R1 lernt R3-LAN über R2", () => {
    const t = topologyOf(eigrpLab);
    expect(computeEigrpNeighbors(dev(t, "R1"), t)).toHaveLength(1);
    const route = showOutputs(t, "R1")["show ip route"];
    expect(route).toMatch(/D\s+192\.168\.3\.0\/24 \[90\/3328\] via 10\.0\.12\.2, Gi0\/1/);
    expect(route).toMatch(/D\s+10\.0\.23\.0\/30 \[90\/3072\] via 10\.0\.12\.2, Gi0\/1/);
    expect(route).not.toMatch(/D\s+10\.0\.13\.0/);
    expect(route).toContain("Uptime ist ein Laufzeitwert");
  });

  it("ohne Failover-Shutdown: R1 erreicht R3 direkt mit Metrik 3072", () => {
    const t = topologyOf(noFailover());
    const r1 = showOutputs(t, "R1");
    expect(r1["show ip route"]).toMatch(/D\s+192\.168\.3\.0\/24 \[90\/3072\] via 10\.0\.13\.2, Gi0\/2/);
    expect(r1["show ip route"]).toMatch(/D\s+10\.0\.23\.0\/30 \[90\/3072\]/);
    expect(r1["show ip eigrp neighbors"]).toContain("EIGRP-IPv4 Neighbors for AS(100)");
    expect(computeEigrpNeighbors(dev(t, "R1"), t).map((n) => n.neighbor.name).sort()).toEqual(["R2", "R3"]);
    expect(r1["show ip eigrp neighbors"]).toContain("Laufzeitwerte");
    expect(showOutputs(t, "R2")["show ip route"]).toMatch(/D\s+192\.168\.1\.0\/24 \[90\/3072\] via 10\.0\.12\.1, Gi0\/1/);
  });

  it("show ip route eigrp zeigt nur D-Routen", () => {
    const text = showOutputs(topologyOf(noFailover()), "R1")["show ip route eigrp"];
    expect(text.split("\n").every((l) => /^(D|\s+\[90\/)/.test(l))).toBe(true);
    expect(text).toContain("192.168.3.0/24");
  });

  it("negativ: Geräte ohne EIGRP und der Startzustand haben keine EIGRP-Ausgaben", () => {
    const t = topologyOf(eigrpLab);
    for (const n of ["SW1", "SW3", "PC0", "PC1"]) expect(Object.keys(showOutputs(t, n)).some((k) => k.includes("eigrp")), n).toBe(false);
    const start = topologyOf(eigrpLab, "start");
    expect(Object.keys(showOutputs(start, "R1")).some((k) => k.includes("eigrp"))).toBe(false);
  });

  it("negativ: andere AS-Nummer verhindert die Nachbarschaft, der Hinweis nennt sie", () => {
    const t = topologyOf(editedLab(eigrpLab, (d, l) => (d === "R2" && l === "router eigrp 100" ? "router eigrp 200" : l)));
    expect(computeEigrpNeighbors(dev(t, "R1"), t).map((n) => n.neighbor.name)).not.toContain("R2");
    expect(eigrpHints(dev(t, "R1"), t).join(" ")).toContain("andere AS-Nummer (200 statt 100)");
    expect(showOutputs(t, "R1")["show ip route"]).not.toMatch(/D\s+10\.0\.23/);
  });

  it("negativ: passive-interface auf einem Router-Link statt auf dem LAN", () => {
    const t = topologyOf(editedLab(noFailover(), (d, l) => (d === "R1" && l === "passive-interface GigabitEthernet0/0" ? "passive-interface GigabitEthernet0/1" : l)));
    expect(computeEigrpNeighbors(dev(t, "R1"), t).map((n) => n.neighbor.name)).toEqual(["R3"]);
    expect(eigrpHints(dev(t, "R1"), t).join(" ")).toContain("Gi0/1 ist passive");
  });

  it("negativ: fehlendes network-Statement auf der Gegenseite", () => {
    const t = topologyOf(editedLab(noFailover(), (d, l) => (d === "R3" && l === "network 10.0.13.0 0.0.0.3" ? null : l)));
    expect(computeEigrpNeighbors(dev(t, "R1"), t).map((n) => n.neighbor.name)).toEqual(["R2"]);
    expect(eigrpHints(dev(t, "R1"), t).join(" ")).toContain("auf der Gegenseite fehlt ein passendes network-Statement");
  });

  it("negativ: unterschiedliche K-Werte — keine Nachbarschaft; abweichende K-Werte machen die Metrik nicht bestimmbar", () => {
    const t = topologyOf(editedLab(noFailover(), (d, l) => (d === "R2" && l === "no auto-summary" ? "no auto-summary\nmetric weights 0 1 1 1 0 0" : l)));
    expect(computeEigrpNeighbors(dev(t, "R1"), t).map((n) => n.neighbor.name)).toEqual(["R3"]);
    expect(eigrpHints(dev(t, "R1"), t).join(" ")).toContain("unterschiedliche K-Werte");
    expect(eigrpHints(dev(t, "R2"), t).join(" ")).toContain("Metrik der EIGRP-Routen ist nicht bestimmbar");
  });

  it("abweichende K-Werte auf allen Routern: Nachbarschaften bleiben, die Metrik ist nicht bestimmbar", () => {
    const t = topologyOf(editedLab(noFailover(), (d, l) => (l === "no auto-summary" ? "no auto-summary\nmetric weights 0 1 1 1 0 0" : l)));
    expect(computeEigrpNeighbors(dev(t, "R1"), t)).toHaveLength(2);
    expect(showOutputs(t, "R1")["show ip route"]).toContain("[90/nicht bestimmbar]");
  });

  it("negativ: die Hosts im LAN (passive) bilden keine Nachbarschaft und bleiben als Netz erreichbar", () => {
    const t = topologyOf(noFailover());
    expect(computeEigrpNeighbors(dev(t, "R1"), t).some((n) => n.localInterface.name === "Gi0/0")).toBe(false);
    expect(showOutputs(t, "R3")["show ip route"]).toMatch(/D\s+192\.168\.1\.0\/24/);
  });

  it("Parser: network mit und ohne Wildcard, passive-interface, K-Werte, redistribute", () => {
    const lab = {
      steps: [
        {
          blocks: [
            {
              device: "R",
              commands: [
                {
                  cmd: [
                    "router eigrp 7",
                    "network 10.0.0.0",
                    "network 192.168.1.0 0.0.0.255",
                    "passive-interface default",
                    "no passive-interface gi0/1",
                    "metric weights 0 1 0 1 0 0",
                    "redistribute ospf 100 metric 10000 1 255 1 1500",
                    "redistribute static",
                    "exit",
                  ].join("\n"),
                },
              ],
            },
          ],
        },
      ],
    };
    const e = parseLabDeviceConfig(lab as never, "R").eigrp;
    expect(e?.asn).toBe(7);
    expect(e?.networks).toEqual([{ net: "10.0.0.0" }, { net: "192.168.1.0", wildcard: "0.0.0.255" }]);
    expect(e?.passiveDefault).toBe(true);
    expect(e?.noPassive).toEqual(["Gi0/1"]);
    expect(e?.kValues).toEqual([1, 0, 1, 0, 0]);
    expect(e?.redistribute).toEqual([
      { source: "ospf", id: 100, vector: [10000, 1, 255, 1, 1500], subnets: false },
      { source: "static", subnets: false },
    ]);
  });
});

describe("Redistribution EIGRP ↔ OSPF (co-acl-nat-isp)", () => {
  it("ISP-MUMBAI sieht jetzt beide Seiten: EIGRP-Nachbar CO-1 über Et0/0.99, OSPF-Nachbar CO-2 über Et0/0.199", () => {
    const t = topologyOf(coLab);
    const isp = dev(t, "ISP-MUMBAI");
    expect(computeEigrpNeighbors(isp, t).map((n) => `${n.neighbor.name} ${n.localInterface.name}`)).toEqual(["CO-1 Et0/0.99"]);
    expect(computeOspfNeighbors(isp, t).map((n) => `${n.neighbor.name} ${n.localInterface.name}`)).toEqual(["CO-2 Et0/0.199"]);
  });

  it("CO-1 lernt die OSPF-Netze als D EX mit der Metrik aus dem Lab (10000 1 255 1 1500)", () => {
    const route = showOutputs(topologyOf(coLab), "CO-1")["show ip route"];
    for (const net of ["172.16.10.0/24", "200.10.20.0/24", "45.35.55.0/24"]) {
      expect(route).toMatch(new RegExp(`D EX ${net.replace(/\./g, "\\.")} \\[170/281856\\] via 20\\.30\\.10\\.20, Et0/1`));
    }
    expect(route).not.toMatch(/D EX 192\.168\.10/);
  });

  it("CO-2 lernt die EIGRP-Netze als O E2; ohne metric im Lab „nicht bestimmbar“", () => {
    const route = showOutputs(topologyOf(coLab), "CO-2")["show ip route"];
    expect(route).toMatch(/O E2 192\.168\.10\.0\/24 \[110\/nicht bestimmbar\] via 45\.35\.55\.75, Et0\/1/);
    expect(route).toMatch(/O E2 20\.30\.10\.0\/24 \[110\/nicht bestimmbar\] via 45\.35\.55\.75, Et0\/1/);
    expect(route).toMatch(/O\s+200\.10\.20\.0\/24 \[110\/2\]/);
  });

  it("ISP-MUMBAI: interne D-Route mit Metrik aus Standardwerten (2× Ethernet), eigene Redistribution erscheint nicht als externe Route", () => {
    const route = showOutputs(topologyOf(coLab), "ISP-MUMBAI")["show ip route"];
    expect(route).toMatch(/D\s+192\.168\.10\.0\/24 \[90\/307200\] via 20\.30\.10\.10, Et0\/0\.99/);
    expect(route).not.toMatch(/D EX|O E2/);
  });

  it("negativ: ohne metric bei redistribute ospf gibt EIGRP nichts weiter", () => {
    const t = topologyOf(editedLab(coLab, (d, l) => (d === "ISP-MUMBAI" && l.startsWith("redistribute ospf 100") ? "redistribute ospf 100" : l)));
    expect(showOutputs(t, "CO-1")["show ip route"]).not.toMatch(/D EX/);
    expect(eigrpHints(dev(t, "ISP-MUMBAI"), t).join(" ")).toContain("ohne metric gibt EIGRP die Routen nicht weiter");
  });

  it("negativ: ohne subnets werden nur klassische Netze nach OSPF übernommen", () => {
    const t = topologyOf(editedLab(coLab, (d, l) => (d === "ISP-MUMBAI" && l === "redistribute eigrp 199 subnets" ? "redistribute eigrp 199" : l)));
    const route = showOutputs(t, "CO-2")["show ip route"];
    expect(route).toContain("O E2 192.168.10.0/24");
    expect(route).not.toContain("20.30.10.0/24");
  });

  it("OSPF E1: Seed-Metrik plus Pfadkosten (metric 50, metric-type 1, Ethernet = 10)", () => {
    const t = topologyOf(editedLab(coLab, (d, l) => (d === "ISP-MUMBAI" && l === "redistribute eigrp 199 subnets" ? "redistribute eigrp 199 metric 50 metric-type 1 subnets" : l)));
    const routes = computeOspfExternalRoutes(dev(t, "CO-2"), t);
    const r = routes.find((x) => x.network === "192.168.10.0/24");
    expect(r?.type).toBe(1);
    expect(r?.metric).toBe(60);
    expect(showOutputs(t, "CO-2")["show ip route"]).toContain("O E1 192.168.10.0/24 [110/60]");
  });

  it("OSPF E2 mit Seed-Metrik: die Metrik bleibt unverändert", () => {
    const t = topologyOf(editedLab(coLab, (d, l) => (d === "ISP-MUMBAI" && l === "redistribute eigrp 199 subnets" ? "redistribute eigrp 199 metric 50 subnets" : l)));
    expect(showOutputs(t, "CO-2")["show ip route"]).toContain("O E2 192.168.10.0/24 [110/50]");
  });

  it("negativ: ohne Redistribution gibt es keine externen Routen; Verbindung getrennt (Trunk-Port aus) auch nicht", () => {
    const none = topologyOf(editedLab(coLab, (d, l) => (d === "ISP-MUMBAI" && l.startsWith("redistribute") ? null : l)));
    expect(showOutputs(none, "CO-1")["show ip route"]).not.toMatch(/D EX/);
    expect(showOutputs(none, "CO-2")["show ip route"]).not.toMatch(/O E/);
    expect(computeEigrpRoutes(dev(none, "CO-1"), none)).toEqual([]);
  });

  it("Parser: redistribute mit Metrik, Typ, subnets und route-map", () => {
    const lab = { steps: [{ blocks: [{ device: "R", commands: [{ cmd: "router ospf 5\nredistribute eigrp 7 metric 30 metric-type 1 subnets route-map RM\nredistribute connected\nredistribute rip subnets" }] }] }] };
    const o = parseLabDeviceConfig(lab as never, "R").ospf;
    expect(o?.redistribute).toEqual([
      { source: "eigrp", id: 7, metric: 30, metricType: 1, subnets: true, routeMap: "RM" },
      { source: "connected", subnets: false },
      { source: "rip", subnets: true },
    ]);
  });
});

describe("OSPF/EIGRP über Router-on-a-Stick (lokale Subinterfaces)", () => {
  it("beide Seiten der Trunk-Verbindung sehen sich (Nachbarschaft ist symmetrisch)", () => {
    const t = topologyOf(coLab);
    const co2 = computeOspfNeighbors(dev(t, "CO-2"), t).map((n) => n.neighbor.name);
    const isp = computeOspfNeighbors(dev(t, "ISP-MUMBAI"), t).map((n) => n.neighbor.name);
    expect(co2).toEqual(["ISP-MUMBAI"]);
    expect(isp).toEqual(["CO-2"]);
    expect(showOutputs(t, "ISP-MUMBAI")["show ip ospf neighbor"]).toContain("45.35.55.65");
  });

  it("negativ: andere VLAN-Zuordnung am Switch trennt die Nachbarschaft", () => {
    const t = topologyOf(editedLab(coLab, (d, l) => (d === "ISP-SW" && l === "switchport access vlan 199" ? "switchport access vlan 99" : l)));
    expect(computeOspfNeighbors(dev(t, "ISP-MUMBAI"), t).map((n) => n.neighbor.name)).not.toContain("CO-2");
  });
});

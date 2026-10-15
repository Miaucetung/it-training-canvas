import { describe, it, expect } from "vitest";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { LABS } from "@/components/labs";
import { parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { computeEigrpRoutes, computeOspfExternalRoutes, eigrpHints } from "@/lib/topology/eigrp-ipv4";
import { computeOspfRoutes, ospfInterfaceCost, ospfRedistributionHints, ospfSeedMetric } from "@/lib/topology/ospf-routes";
import type { NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";
import { editedLab, labOf, showOutputs, topologyOf } from "../helpers/lab-edit";

const dev = (t: NetworkTopology, n: string) => t.devices.find((d) => d.name === n)!;
const route = (t: NetworkTopology, n: string) => showOutputs(t, n)["show ip route"];
const ospfLab = labOf("ospf");
const multiLab = labOf("ospf-multiarea");
const coLab = labOf("co-acl-nat-isp");
const iface = (name: string, extra: Partial<TopologyInterface> = {}): TopologyInterface => ({ id: name, name, status: "up", ...extra });
const device = (cfg: Partial<NonNullable<TopologyDevice["config"]>> = {}): TopologyDevice => ({ id: "d", name: "d", type: "router", x: 0, y: 0, interfaces: [], config: { hostname: "d", ...cfg } });

describe("OSPF-Kosten je Interface", () => {
  it("Referenzbandbreite 100 Mbit/s: Gigabit/Fast 1, Ethernet 10, Serial 64, Tunnel 1000, Loopback 1", () => {
    const d = device();
    expect(ospfInterfaceCost(d, iface("Gi0/0"))).toBe(1);
    expect(ospfInterfaceCost(d, iface("Fa0/1"))).toBe(1);
    expect(ospfInterfaceCost(d, iface("Et0/0"))).toBe(10);
    expect(ospfInterfaceCost(d, iface("Se0/0/0"))).toBe(64);
    expect(ospfInterfaceCost(d, iface("Tu12"))).toBe(1000);
    expect(ospfInterfaceCost(d, iface("Lo0"))).toBe(1);
  });

  it("auto-cost reference-bandwidth, bandwidth am Interface und ip ospf cost haben Vorrang", () => {
    expect(ospfInterfaceCost(device({ ospf: { referenceBandwidthMbps: 10000 } }), iface("Gi0/0"))).toBe(10);
    expect(ospfInterfaceCost(device({ ospf: { referenceBandwidthMbps: 1000 } }), iface("Fa0/0"))).toBe(10);
    expect(ospfInterfaceCost(device(), iface("Gi0/0", { bandwidthKbps: 1000 }))).toBe(100);
    expect(ospfInterfaceCost(device(), iface("Gi0/0", { ospf: { cost: 77 } }))).toBe(77);
    expect(ospfInterfaceCost(device({ ospf: { referenceBandwidthMbps: 1000 } }), iface("Gi0/0", { ospf: { cost: 5 } }))).toBe(5);
  });

  it("Parser: ip ospf cost und auto-cost reference-bandwidth", () => {
    const lab = { steps: [{ blocks: [{ device: "R", commands: [{ cmd: "interface gi0/1\nip ospf cost 50\nrouter ospf 1\nauto-cost reference-bandwidth 1000" }] }] }] };
    const cfg = parseLabDeviceConfig(lab as never, "R");
    expect(cfg.ifaces.get("Gi0/1")?.ospfCost).toBe(50);
    expect(cfg.ospf?.referenceBandwidthMbps).toBe(1000);
  });
});

describe("OSPF-Routen: Kosten über den Pfad, Transit, keine feste Uptime", () => {
  it("ospf-Lab: Kosten = Ausgangs-Interface + Ziel-Interface; gleich günstige Pfade als zwei Zeilen", () => {
    const text = route(topologyOf(ospfLab), "R1");
    expect(text).toMatch(/O\s+192\.168\.2\.0\/24 \[110\/2\] via 10\.0\.12\.2, Gi0\/1/);
    expect(text).toMatch(/O\s+192\.168\.3\.0\/24 \[110\/2\] via 10\.0\.13\.2, Gi0\/2/);
    expect(text).toMatch(/O\s+10\.0\.23\.0\/30 \[110\/2\] via 10\.0\.12\.2, Gi0\/1\n\s+\[110\/2\] via 10\.0\.13\.2, Gi0\/2/);
  });

  it("Transit über mehrere Router (ospf-multiarea): Kosten addieren sich, Netze aus fremden Areas als O IA", () => {
    const r1 = route(topologyOf(multiLab), "R1");
    expect(r1).toMatch(/O IA 192\.168\.3\.0\/24 \[110\/3\] via 10\.0\.0\.2, Gi0\/0/);
    expect(r1).toMatch(/O IA 10\.0\.0\.4\/30 \[110\/2\]/);
    const r2 = route(topologyOf(multiLab), "R2");
    expect(r2).toMatch(/O\s+192\.168\.1\.0\/24 \[110\/2\]/);
    expect(r2).not.toContain("O IA");
  });

  it("ip ospf cost im Lab verschiebt den günstigsten Pfad", () => {
    const t = topologyOf(editedLab(ospfLab, (d, l) => (d === "R1" && l === "interface Gi0/1" ? "interface Gi0/1\nip ospf cost 50" : l)));
    const r1 = route(t, "R1");
    expect(r1).toMatch(/O\s+192\.168\.2\.0\/24 \[110\/3\] via 10\.0\.13\.2, Gi0\/2/);
    expect(r1).not.toMatch(/192\.168\.2\.0\/24 \[110\/51\]/);
  });

  it("auto-cost reference-bandwidth 10000 auf allen Routern: Gigabit-Kosten 10", () => {
    const t = topologyOf(editedLab(ospfLab, (_d, l) => (l === "router ospf 1" ? "router ospf 1\nauto-cost reference-bandwidth 10000" : l)));
    expect(route(t, "R1")).toMatch(/O\s+192\.168\.2\.0\/24 \[110\/20\] via 10\.0\.12\.2, Gi0\/1/);
  });

  it("Tunnel kostet 1000: gre-tunnel zeigt 1001", () => {
    expect(route(topologyOf(labOf("gre-tunnel")), "R1-1")).toMatch(/O\s+192\.168\.2\.0\/24 \[110\/1001\] via 216\.145\.12\.2, Tu12/);
  });

  it("negativ: ausgefallene Verbindung — der Umweg wird genommen, ein vom Netz getrennter Router liefert keine Route", () => {
    let inGi1 = false;
    const t = topologyOf(
      editedLab(ospfLab, (d, l) => {
        if (/^interface /i.test(l)) inGi1 = d === "R1" && /^interface gi0\/1$/i.test(l);
        return inGi1 && l === "no shutdown" ? "shutdown" : l;
      })
    );
    const r1 = route(t, "R1");
    expect(r1).toMatch(/O\s+192\.168\.2\.0\/24 \[110\/3\] via 10\.0\.13\.2, Gi0\/2/);
    expect(computeOspfRoutes(dev(t, "R1"), t).every((r) => r.vias.every((v) => v.iface.name !== "Gi0/1"))).toBe(true);
  });

  it("negativ: Geräte ohne OSPF haben keine O-Routen; keine eigenen Netze als O-Route", () => {
    const t = topologyOf(ospfLab);
    expect(computeOspfRoutes(dev(t, "PC0"), t)).toEqual([]);
    expect(route(t, "R1")).not.toMatch(/O\s+192\.168\.1\.0\/24/);
  });

  it("die feste Uptime 00:14:22 kommt in keinem Lab mehr vor; Hinweis „nicht bestimmbar“ bei O- und D-Routen", () => {
    let withO = 0;
    for (const lab of LABS.filter((l) => CURATED_TOPOLOGIES[l.id])) {
      const t = topologyOf(lab);
      for (const d of t.devices) {
        const text = showOutputs(t, d.name)["show ip route"];
        if (!text) continue;
        expect(text, `${lab.id} ${d.name}`).not.toContain("00:14:22");
        if (/^(O|D)/m.test(text)) {
          withO++;
          expect(text, `${lab.id} ${d.name}`).toContain("Uptime ist ein Laufzeitwert und nicht bestimmbar");
        }
      }
    }
    expect(withO).toBeGreaterThan(5);
  });
});

describe("Redistribution nach OSPF ohne metric: IOS-Standard", () => {
  const withRed = (line: string) => topologyOf(editedLab(coLab, (d, l) => (d === "ISP-MUMBAI" && l === "redistribute eigrp 199 subnets" ? line : l)));

  it("Standard 20, Typ E2, mit Hinweis „Standardwert“", () => {
    const t = withRed("redistribute eigrp 199 subnets");
    const text = route(t, "CO-2");
    expect(text).toContain("O E2 192.168.10.0/24 [110/20]");
    expect(text).toContain("IOS-Standardwert");
    expect(ospfRedistributionHints(dev(t, "ISP-MUMBAI")).join(" ")).toContain("Standardwert 20, Typ 2");
  });

  it("Quelle BGP: Standard 1", () => {
    expect(ospfSeedMetric({ source: "bgp", subnets: true })).toEqual({ metric: 1, isDefault: true });
    expect(ospfSeedMetric({ source: "eigrp", subnets: true })).toEqual({ metric: 20, isDefault: true });
  });

  it("negativ: mit metric im Lab gilt dieser Wert und es steht kein Standardwert-Hinweis da", () => {
    const t = withRed("redistribute eigrp 199 metric 50 subnets");
    const text = route(t, "CO-2");
    expect(text).toContain("O E2 192.168.10.0/24 [110/50]");
    expect(text).not.toContain("IOS-Standardwert");
    expect(ospfRedistributionHints(dev(t, "ISP-MUMBAI"))).toEqual([]);
  });

  it("E1 ohne metric: Standard 20 plus Pfadkosten", () => {
    const t = withRed("redistribute eigrp 199 metric-type 1 subnets");
    const r = computeOspfExternalRoutes(dev(t, "CO-2"), t).find((x) => x.network === "192.168.10.0/24");
    expect(r).toMatchObject({ type: 1, metric: 30, defaultMetric: true });
    expect(route(t, "CO-2")).toContain("O E1 192.168.10.0/24 [110/30]");
  });
});

describe("Redistribution nach EIGRP ohne metric", () => {
  const eigrpRed = (line: string, extra?: (d: string, l: string) => string | null) =>
    topologyOf(
      editedLab(coLab, (d, l) => {
        const custom = extra?.(d, l);
        if (custom !== undefined && custom !== null) return custom;
        return d === "ISP-MUMBAI" && l === "redistribute ospf 100 metric 10000 1 255 1 1500" ? line : l;
      })
    );

  it("connected ohne metric: Routen werden übernommen, Seed-Metrik aus dem Interface", () => {
    const t = eigrpRed("redistribute connected");
    const text = route(t, "CO-1");
    expect(text).toMatch(/D EX 200\.10\.20\.0\/24 \[170\/307200\] via 20\.30\.10\.20, Et0\/1/);
    expect(text).toMatch(/D EX 45\.35\.55\.0\/24 \[170\/307200\]/);
    expect(text).not.toMatch(/172\.16\.10\.0\/24/);
    expect(eigrpHintsText(t, "ISP-MUMBAI")).toContain("Seed-Metrik stammt aus Bandbreite und Verzögerung");
  });

  it("static ohne metric: übernommen, Metrik aus dem Ausgangs-Interface", () => {
    const t = eigrpRed("redistribute static", (d, l) => (d === "ISP-MUMBAI" && l === "ip route 0.0.0.0 0.0.0.0 null0" ? "ip route 0.0.0.0 0.0.0.0 null0\nip route 10.9.9.0 255.255.255.0 20.30.10.10" : null));
    expect(route(t, "CO-1")).toMatch(/D EX 10\.9\.9\.0\/24 \[170\/307200\] via 20\.30\.10\.20, Et0\/1/);
    expect(route(t, "CO-1")).not.toContain("0.0.0.0/0");
  });

  it("negativ: static auf Null0 ohne metric — kein Interface-Vektor, keine Route", () => {
    const t = eigrpRed("redistribute static", (d, l) => (d === "ISP-MUMBAI" && l === "ip route 0.0.0.0 0.0.0.0 null0" ? "ip route 0.0.0.0 0.0.0.0 null0\nip route 10.8.8.0 255.255.255.0 null0" : null));
    expect(route(t, "CO-1")).not.toContain("10.8.8.0");
  });

  it("negativ: dynamische Quelle (OSPF) ohne metric — keine Weitergabe, Hinweis", () => {
    const t = eigrpRed("redistribute ospf 100");
    expect(route(t, "CO-1")).not.toMatch(/D EX/);
    expect(computeEigrpRoutes(dev(t, "CO-1"), t).filter((r) => r.external)).toEqual([]);
    expect(eigrpHintsText(t, "ISP-MUMBAI")).toContain("aus dynamischen Quellen nicht weiter");
  });

  it("mit metric bleibt der Lab-Wert maßgeblich (Vektor aus dem Lab, nicht aus dem Interface)", () => {
    const t = eigrpRed("redistribute connected metric 10000 1 255 1 1500");
    expect(route(t, "CO-1")).toMatch(/D EX 200\.10\.20\.0\/24 \[170\/281856\]/);
  });
});

function eigrpHintsText(t: NetworkTopology, name: string): string {
  return eigrpHints(dev(t, name), t).join(" ");
}

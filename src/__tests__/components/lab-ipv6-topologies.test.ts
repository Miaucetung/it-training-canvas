import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, getLabDeviceCli } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { resolveHardwareProfile } from "@/lib/topology/hardware-profiles";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return { lab, ...buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state) };
};
const dev = (t: ReturnType<typeof build>, n: string) => t.topology.devices.find((d) => d.name === n)!;
const v6 = (t: ReturnType<typeof build>, n: string, ifc: string) => dev(t, n).interfaces.find((i) => i.name === ifc)?.ipv6;

describe("Paket 3 IPv6 – labspezifische Prüfungen", () => {
  it("ipv6: Adressen, PC-Gateway und Statische Routen im CLI-Export", () => {
    const t = build("ipv6");
    expect(v6(t, "R1", "Gi0/0")).toBe("2001:db8:1::1/64");
    expect(v6(t, "R1", "Gi0/1")).toBe("2001:db8:12::1/64");
    expect(v6(t, "R2", "Gi0/1")).toBe("2001:db8:12::2/64");
    expect(v6(t, "PC0", "Fa0")).toBe("2001:db8:1::10/64");
    expect(dev(t, "PC0").config?.defaultGatewayV6).toBe("2001:db8:1::1");
    expect(getLabDeviceCli(t.lab, "R1")).toContain("ipv6 route 2001:db8:2::/64 2001:db8:12::2");
    expect(getLabDeviceCli(t.lab, "R1")).toContain("ipv6 unicast-routing");
  });

  it("ipv6-static: 2911 mit zweiter HWIC-2T (Se0/1/0), Loopbacks als /128, Internet-Seite ohne erfundene Adresse", () => {
    const t = build("ipv6-static");
    expect(t.problems).toEqual([]);
    expect(resolveHardwareProfile("Cisco 2911 · 2×HWIC-2T", "router")?.ports).toContain("Se0/1/0");
    expect(v6(t, "R1-1", "Se0/0/0")).toBe("2001:DB8:CCA1:1::2/64");
    expect(v6(t, "R2-1", "Se0/1/0")).toBe("2001:DB8:CCA2:2::2/64");
    expect(v6(t, "R1-1", "Lo0")).toBe("2001:DB8:CCA1:254::1:1/128");
    const inet = dev(t, "Internet");
    expect(inet.interfaces.every((i) => !i.ipv6 && !i.ip)).toBe(true);
    expect(getLabDeviceCli(t.lab, "Internet")).toContain("ipv6 route 2001:DB8:CCA1:254::1:1/128 2001:DB8:CCA1:1::2");
  });

  it("ospfv3-ipv6 / ipv6-ospfv3-eigrpv6: Protokolle werden benannt, aber keine OSPFv2-Ausgabe erzeugt", () => {
    for (const id of ["ospfv3-ipv6", "ipv6-ospfv3-eigrpv6"]) {
      const t = build(id);
      const r1 = dev(t, "R1");
      expect(r1.config?.routingProtocols?.some((p) => p.startsWith("OSPFv3")), id).toBe(true);
      expect(Object.keys(CiscoCliGenerator.getDynamicShowOutputs(r1, t.topology)), id).not.toContain("show ip ospf neighbor");
    }
    expect(dev(build("ipv6-ospfv3-eigrpv6"), "R2").config?.routingProtocols).toContain("EIGRPv6 1");
  });

  it("ipv6-ospfv3-eigrpv6: /127-Backbone laut Konfiguration, PC-Adressen aus dem Geräte-Label, kein PC-Gateway erfunden", () => {
    const t = build("ipv6-ospfv3-eigrpv6");
    expect(v6(t, "R1", "Gi0/1")).toBe("FD00::2/127");
    expect(v6(t, "R2", "Gi0/2")).toBe("FD00::3/127");
    expect(v6(t, "R3", "Gi0/1")).toBe("FD00::7/127");
    expect(v6(t, "PC2", "Fa0")).toBe("FDAA::0101/64");
    expect(v6(t, "PC0", "Fa0")).toBe("FDCC::0101/64");
    expect(dev(t, "PC2").config?.defaultGatewayV6).toBeUndefined();
  });

  it("Startzustand ohne IPv6", () => {
    const t = build("ipv6", "start");
    expect(t.topology.devices.every((d) => d.interfaces.every((i) => !i.ipv6))).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, getLabDeviceCli } from "@/components/labs/lab-to-network";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return { lab, ...buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state) };
};
type Built = ReturnType<typeof build>;
const dev = (t: Built, n: string) => t.topology.devices.find((d) => d.name === n)!;
const ip = (t: Built, n: string, ifc: string) => dev(t, n).interfaces.find((i) => i.name === ifc)?.ip;

describe("Paket 7 Campus – labspezifische Prüfungen", () => {
  it("vlan-dhcp-nat-roas: Router0 mit drei Subinterfaces, NAT und DHCP-Pools im Export, PCs nur mit Netz", () => {
    const t = build("vlan-dhcp-nat-roas");
    expect(t.problems).toEqual([]);
    expect(ip(t, "Router0", "Gi0/0.10")).toBe("192.168.10.1/24");
    expect(ip(t, "Router0", "Gi0/0.30")).toBe("192.168.30.1/24");
    expect(ip(t, "Router0", "Gi0/1")).toBe("200.0.0.1/30");
    const cli = getLabDeviceCli(t.lab, "Router0");
    for (const needle of ["ip nat inside source list 1 interface GigabitEthernet0/1 overload", "ip dhcp pool VLAN20", "ip nat outside"]) expect(cli).toContain(needle);
    const nets: Record<string, string> = { PC0: "192.168.10.0/24", PC3: "192.168.10.0/24", PC2: "192.168.20.0/24", PC4: "192.168.20.0/24", PC1: "192.168.30.0/24", C5: "192.168.30.0/24" };
    for (const [name, net] of Object.entries(nets)) {
      expect(dev(t, name).interfaces[0].dhcp, name).toEqual({ network: net });
      expect(dev(t, name).interfaces[0].ip, name).toBeUndefined();
    }
    expect(t.topology.devices.filter((d) => d.type === "pc")).toHaveLength(6);
  });

  it("vlan-dhcp-nat-roas: VTP und Trunks laut Lab (SW1 on, SW2 desirable), Access-Ports in den VLANs", () => {
    const t = build("vlan-dhcp-nat-roas");
    expect(t.topology.links.filter((l) => l.linkType === "trunk")).toHaveLength(2);
    expect(getLabDeviceCli(t.lab, "SW1")).toContain("vtp mode server");
    expect(getLabDeviceCli(t.lab, "SW2")).toContain("switchport mode dynamic desirable");
    expect(dev(t, "SW2").interfaces.find((i) => i.name === "Fa0/15")).toMatchObject({ mode: "access", vlan: 30 });
    expect(dev(t, "SW1").interfaces.find((i) => i.name === "Fa0/11")).toMatchObject({ mode: "access", vlan: 20 });
    expect(dev(t, "SW1").interfaces.filter((i) => i.assumed)).toEqual([]);
  });

  it("vlan-vtp-dhcp-campus: R1 mit Native-Subinterface, drei Switches, neun DHCP-PCs", () => {
    const t = build("vlan-vtp-dhcp-campus");
    expect(t.problems).toEqual([]);
    expect(ip(t, "R1", "Gi0/0.1")).toBe("192.168.1.1/24");
    expect(ip(t, "R1", "Gi0/0.100")).toBe("10.10.100.1/24");
    expect(ip(t, "SW1", "Vlan1")).toBe("192.168.1.2/24");
    expect(ip(t, "SW3", "Vlan1")).toBe("192.168.1.4/24");
    expect(getLabDeviceCli(t.lab, "R1")).toContain("encapsulation dot1Q 1 native");
    expect(getLabDeviceCli(t.lab, "SW3")).toContain("vtp mode client");
    expect(getLabDeviceCli(t.lab, "SW1")).toContain("vtp mode server");
    expect(t.topology.links.filter((l) => l.linkType === "trunk")).toHaveLength(3);
    const pcs = t.topology.devices.filter((d) => d.type === "pc");
    expect(pcs).toHaveLength(9);
    expect(dev(t, "PC Blau (an SW2)").interfaces[0].dhcp).toEqual({ network: "10.10.110.0/24" });
    expect(dev(t, "PC Grün (an SW3)").interfaces[0].dhcp).toEqual({ network: "10.10.120.0/24" });
    expect(pcs.every((p) => !p.interfaces[0].ip)).toBe(true);
  });

  it("Startzustand: keine DHCP-Netze, keine Adressen", () => {
    for (const id of ["vlan-dhcp-nat-roas", "vlan-vtp-dhcp-campus"]) {
      const t = build(id, "start");
      expect(t.topology.devices.every((d) => d.interfaces.every((i) => !i.dhcp && !i.ip)), id).toBe(true);
    }
  });
});

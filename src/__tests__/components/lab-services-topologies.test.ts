import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, getLabDeviceCli } from "@/components/labs/lab-to-network";
import { computeOspfNeighbors } from "@/lib/topology/ospf-neighbors";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return { lab, ...buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state) };
};
type Built = ReturnType<typeof build>;
const dev = (t: Built, n: string) => t.topology.devices.find((d) => d.name === n)!;
const ip = (t: Built, n: string, ifc?: string) => dev(t, n).interfaces.find((i) => (ifc ? i.name === ifc : i.ip))?.ip;

describe("Paket 4 Services – labspezifische Prüfungen", () => {
  it("dhcp: Clients zeigen nur das Netz, keine erfundene Adresse; Startzustand ohne DHCP", () => {
    const t = build("dhcp");
    for (const pc of ["PC0", "PC1"]) {
      const i = dev(t, pc).interfaces[0];
      expect(i.ip).toBeUndefined();
      expect(i.dhcp).toEqual({ network: "192.168.1.0/24" });
    }
    expect(build("dhcp", "start").topology.devices.every((d) => d.interfaces.every((i) => !i.dhcp))).toBe(true);
    const cli = getLabDeviceCli(t.lab, "Router0");
    expect(cli).toContain("ip dhcp excluded-address 192.168.1.1 192.168.1.10");
    expect(cli).toContain("ip dhcp pool LAN_POOL");
  });

  it("dhcp-relay: Subinterfaces mit helper-address, Server statisch, Clients nur mit Netz; Client Gelb gibt es nicht", () => {
    const t = build("dhcp-relay");
    expect(ip(t, "R1", "Gi0/0.51")).toBe("172.16.51.1/24");
    expect(ip(t, "R1", "Gi0/0.71")).toBe("192.168.2.1/24");
    expect(getLabDeviceCli(t.lab, "R1")).toContain("ip helper-address 192.168.2.11");
    expect(ip(t, "DHCP-Server")).toBe("192.168.2.11/24");
    expect(dev(t, "DHCP-Server").config?.defaultGateway).toBe("192.168.2.1");
    expect(dev(t, "Client Rot").interfaces[0].dhcp?.network).toBe("172.16.51.0/24");
    expect(dev(t, "Client Blau").interfaces[0].dhcp?.network).toBe("172.16.61.0/24");
    expect(t.topology.devices.some((d) => /gelb/i.test(d.name))).toBe(false);
    expect(t.topology.links.filter((l) => l.linkType === "trunk")).toHaveLength(2);
  });

  it("NAT-Labs: inside/outside, Pool-/Overload-/Static-Befehle im Export; Adressen der Zusatz-PCs nur aus dem Label", () => {
    const pat = getLabDeviceCli(build("nat-pat").lab, "NAT-Router");
    expect(pat).toContain("ip nat inside source list 1 interface GigabitEthernet0/1 overload");
    const dyn = getLabDeviceCli(build("dynamic-nat").lab, "NAT-Router");
    expect(dyn).toContain("ip nat pool PUBLIC-POOL 200.0.0.10 200.0.0.12 netmask 255.255.255.0");
    expect(dyn).not.toContain("overload");
    const pool = getLabDeviceCli(build("nat-pool-overload").lab, "NAT-Router");
    expect(pool).toContain("ip nat inside source list 1 pool DYNAMIC-POOL overload");
    const stat = getLabDeviceCli(build("static-nat").lab, "NAT-Router");
    expect(stat.match(/ip nat inside source static/g)).toHaveLength(3);
    for (const id of ["nat-pat", "dynamic-nat", "nat-pool-overload", "static-nat"]) {
      const t = build(id);
      expect(ip(t, "PC0")).toBe("192.168.1.10/24");
      expect(ip(t, "PC0(1)")).toBe("192.168.1.11/24");
      expect(ip(t, "PC0(2)")).toBe("192.168.1.12/24");
      expect(dev(t, "PC0").config?.defaultGateway).toBe("192.168.1.1");
      expect(dev(t, "PC0(1)").config?.defaultGateway).toBeUndefined(); // Gateway nennt das Lab nur für PC0
      expect(getLabDeviceCli(t.lab, "NAT-Router")).toMatch(/ip nat inside\n[\s\S]*ip nat outside|interface GigabitEthernet0\/0\n\s*ip address[^\n]*\n\s*ip nat inside/);
    }
    const p = build("nat-pool-overload");
    expect(ip(p, "NAT-Router", "Gi0/1")).toBe("200.0.0.5/29");
    expect(ip(p, "ISP", "Gi0/2")).toBe("200.0.0.6/29");
  });

  it("ntp-syslog-snmp: Verteiler ist angenommen und ohne Export; Serveradressen stammen aus SW1-Befehlen", () => {
    const t = build("ntp-syslog-snmp");
    const dist = dev(t, "Verteiler");
    expect(dist.assumed).toBe(true);
    expect(dist.config?.labCli).toBeUndefined();
    expect(ip(t, "SW1", "Vlan99")).toBe("10.0.0.2/24");
    expect(ip(t, "SW1", "Lo0")).toBe("10.0.0.1/32");
    const cli = getLabDeviceCli(t.lab, "SW1");
    for (const needle of ["ntp server 10.0.0.10 key 1 prefer", "logging host 10.0.0.20", "snmp-server host 10.0.0.30 version 2c CCNAmon"]) expect(cli).toContain(needle);
    expect(dev(t, "NTP-Server").interfaces[0].ip).toBe("10.0.0.10/24");
    expect(dev(t, "Syslog-Server").interfaces[0].ip).toBe("10.0.0.20/24");
    expect(dev(t, "SNMP-Manager").interfaces[0].ip).toBe("10.0.0.30/24");
    for (const s of ["NTP-Server", "Syslog-Server", "SNMP-Manager"]) expect(dev(t, s).config?.defaultGateway).toBeUndefined();
    expect(t.topology.links).toHaveLength(4);
  });

  it("hsrp: Verteiler angenommen, virtuelle IP nur als Gateway des PCs, HSRP-Befehle im Export", () => {
    const t = build("hsrp");
    expect(dev(t, "Verteiler").assumed).toBe(true);
    expect(dev(t, "PC0").config?.defaultGateway).toBe("192.168.1.1");
    for (const r of ["R1", "R2"]) expect(dev(t, r).interfaces.some((i) => i.ip === "192.168.1.1/24")).toBe(false);
    expect(getLabDeviceCli(t.lab, "R1")).toContain("standby 1 priority 110");
    expect(getLabDeviceCli(t.lab, "R2")).not.toContain("standby 1 priority");
    expect(getLabDeviceCli(t.lab, "R2")).toContain("standby 1 ip 192.168.1.1");
  });

  it("gre-tunnel: Tunnel-Link, Tu12 mit /30 und OSPF-Nachbarschaft über den Tunnel (point-to-point)", () => {
    const t = build("gre-tunnel");
    expect(t.problems).toEqual([]);
    const tun = t.topology.links.filter((l) => l.linkType === "tunnel");
    expect(tun).toHaveLength(1);
    expect(ip(t, "R1-1", "Tu12")).toBe("216.145.12.1/30");
    expect(ip(t, "R2-1", "Tu12")).toBe("216.145.12.2/30");
    expect(t.topology.links.filter((l) => l.linkType === "serial")).toHaveLength(2);
    const adj = computeOspfNeighbors(dev(t, "R1-1"), t.topology);
    expect(adj).toHaveLength(1);
    expect(adj[0]).toMatchObject({ state: "FULL", networkType: "point-to-point", neighborRole: "-" });
    expect(adj[0].neighbor.name).toBe("R2-1");
  });

  it("ipsec-s2s-vpn: 14 Geräte, Crypto-Befehle im Export, Tunnel nur als Textmarke, SW2-Uplink Gi0/2 laut Lab", () => {
    const t = build("ipsec-s2s-vpn");
    expect(t.problems).toEqual([]);
    expect(t.topology.devices).toHaveLength(14);
    expect(t.topology.links.some((l) => l.linkType === "tunnel")).toBe(false);
    expect(CURATED_TOPOLOGIES["ipsec-s2s-vpn"].notes?.[0].text).toContain("100.0.0.1 ↔ Bremen 200.0.0.1");
    expect(getLabDeviceCli(t.lab, "Hamburg")).toContain("crypto map IPSEC-MAP 10 ipsec-isakmp");
    expect(getLabDeviceCli(t.lab, "Bremen")).toContain("set peer 100.0.0.1");
    expect(getLabDeviceCli(t.lab, "Internet1")).toContain("ip route 47.11.8.0 255.255.255.0 1.1.1.2");
    const assumed = (n: string) => dev(t, n).interfaces.filter((i) => i.assumed).map((i) => i.name);
    // Uplinks stehen im Geräte-Label, die Access-Ports in `interface range FastEthernet0/1-24`
    expect(assumed("SW2")).toEqual([]);
    expect(assumed("SW1")).toEqual([]);
    expect(ip(t, "SW1", "Vlan1")).toBe("192.168.1.2/24");
  });
});

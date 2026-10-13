import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, getLabDeviceCli } from "@/components/labs/lab-to-network";
import { computeOspfNeighbors } from "@/lib/topology/ospf-neighbors";
import { computeStp } from "@/lib/topology/stp-calc";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return { lab, ...buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state) };
};
type Built = ReturnType<typeof build>;
const dev = (t: Built, n: string) => t.topology.devices.find((d) => d.name === n)!;
const ip = (t: Built, n: string, ifc?: string) => dev(t, n).interfaces.find((i) => (ifc ? i.name === ifc : i.ip))?.ip;

describe("Paket 5 Security – labspezifische Prüfungen", () => {
  it("ssh / device-hardening / aaa: Management-Adressen aus der Konfiguration, Hardening-Befehle im Export", () => {
    const ssh = build("ssh");
    expect(ip(ssh, "R1", "Gi0/0")).toBe("192.168.1.1/24");
    expect(ip(ssh, "Admin-PC")).toBe("192.168.1.10/24");
    expect(getLabDeviceCli(ssh.lab, "R1")).toContain("transport input ssh");

    const hard = build("device-hardening");
    expect(ip(hard, "SW1", "Vlan1")).toBe("192.168.1.254/24");
    expect(dev(hard, "Admin-PC").config?.defaultGateway).toBe("192.168.1.254");
    const cli = getLabDeviceCli(hard.lab, "SW1");
    for (const needle of ["login block-for 120 attempts 5 within 60", "access-class 10 in", "no cdp run"]) expect(cli).toContain(needle);

    const aaa = build("aaa-radius-tacacs");
    expect(ip(aaa, "SW1", "Vlan1")).toBe("192.168.1.254/24");
    // Der RADIUS-Server liegt laut Lab nicht im Management-Netz; Maske und Weg sind nicht angegeben, also keine Adresse am Interface
    expect(dev(aaa, "RADIUS-Server").interfaces[0].ip).toBeUndefined();
    expect(getLabDeviceCli(aaa.lab, "SW1")).toContain("address ipv4 10.0.0.50 auth-port 1812 acct-port 1813");
  });

  it("port-security, stp-hardening, vlan-hopping: spätere physische Aktionen sind nicht angeschlossene Geräte", () => {
    for (const [id, name] of [["port-security", "PC3"], ["stp-hardening", "Rogue-Switch"], ["vlan-hopping", "Angreifer-Switch"]] as const) {
      const t = build(id);
      const d = dev(t, name);
      expect(t.topology.links.some((l) => l.sourceDeviceId === d.id || l.targetDeviceId === d.id), `${id}: ${name}`).toBe(false);
      expect(CURATED_TOPOLOGIES[id].notes?.some((n) => n.text.includes("nicht angeschlossen")), id).toBe(true);
    }
    const ps = getLabDeviceCli(build("port-security").lab, "SW1");
    expect(ps).toContain("switchport port-security violation shutdown");
    expect(ps).toContain("switchport port-security violation restrict");
  });

  it("stp-hardening: Core (root primary) ist Root, Dist1 (root secondary) gewinnt gegen Dist2, genau ein Port blockiert Dist1–Dist2", () => {
    const t = build("stp-hardening");
    expect(t.problems).toEqual([]);
    expect(dev(t, "Core").config?.stp?.priority).toBe(24576); // letzter Befehl gilt: `root primary` nach `priority 4096`; die anderen Switches haben mehr, also eindeutig
    expect(dev(t, "Core").config?.stp?.ambiguous).toBeUndefined();
    expect(dev(t, "Dist1").config?.stp?.priority).toBe(28672); // root secondary
    const stp = computeStp(t.topology);
    const roles = (name: string) => Object.fromEntries(stp.get(dev(t, name).id)!.ports.map((p) => [p.iface.name, p.role]));
    expect(roles("Core")).toMatchObject({ "Gi0/1": "Desg", "Gi0/2": "Desg" });
    expect(roles("Dist1")["Gi0/1"]).toBe("Root");
    expect(roles("Dist1")["Gi0/3"]).toBe("Desg");
    expect(roles("Dist2")["Gi0/3"]).toBe("Altn");
    expect(t.topology.links.filter((l) => l.status === "stp-blocking")).toHaveLength(1);
  });

  it("vlan-hopping: Trunk mit nativem VLAN 999 und erlaubten VLANs 10,20, Access-Ports in VLAN 10", () => {
    const t = build("vlan-hopping");
    const trunk = dev(t, "SW1").interfaces.find((i) => i.name === "Gi0/1")!;
    expect(trunk).toMatchObject({ mode: "trunk", nativeVlan: 999, allowedVlans: [10, 20] });
    expect(dev(t, "SW1").interfaces.find((i) => i.name === "Fa0/1")).toMatchObject({ mode: "access", vlan: 10 });
    expect(t.topology.links.filter((l) => l.linkType === "trunk")).toHaveLength(1);
  });

  it("acl-standard / acl-extended: ACLs im Export, fehlender Verteiler ist angenommen", () => {
    const std = build("acl-standard");
    expect(getLabDeviceCli(std.lab, "R1")).toContain("access-list 10 deny 192.168.2.0 0.0.0.255");
    expect(getLabDeviceCli(std.lab, "R1")).toMatch(/interface GigabitEthernet0\/2\n\s*ip access-group 10 out/);
    expect(ip(std, "Server")).toBe("192.168.3.100/24");

    const ext = build("acl-extended");
    expect(dev(ext, "Verteiler").assumed).toBe(true);
    expect(dev(ext, "Verteiler").config?.labCli).toBeUndefined();
    expect(getLabDeviceCli(ext.lab, "R1")).toContain("deny tcp host 192.168.1.20 host 192.168.2.100 eq 80");
  });

  it("dhcp-snooping-dai: Clients nur mit Netz, Angreifer statisch aus dem Lab-Text, Trust-Befehle im Export", () => {
    const t = build("dhcp-snooping-dai");
    expect(dev(t, "PC1").interfaces[0].dhcp?.network).toBe("192.168.10.0/24");
    expect(dev(t, "PC1").interfaces[0].ip).toBeUndefined();
    expect(ip(t, "Angreifer")).toBe("192.168.10.99/24");
    const cli = getLabDeviceCli(t.lab, "SW1");
    expect(cli).toContain("ip dhcp snooping trust");
    expect(cli).toContain("ip arp inspection trust");
  });

  it("co-acl-nat-isp: Ethernet0/0-Profil, nicht konfigurierte und fehlende Geräte gestrichelt, Config schlägt Verbindungstext", () => {
    const t = build("co-acl-nat-isp");
    expect(t.problems).toEqual([]);
    expect(ip(t, "CO-1", "Et0/1")).toBe("20.30.10.10/24");
    expect(ip(t, "CO-2", "Et0/0")).toBe("172.16.10.254/24");
    expect(ip(t, "ISP-MUMBAI", "Et0/0.99")).toBe("20.30.10.20/24");
    expect(ip(t, "ISP-MUMBAI", "Et0/0.199")).toBe("45.35.55.75/24");
    expect(dev(t, "SW1")).toMatchObject({ assumed: true, assumedReason: "not-configured" });
    expect(dev(t, "SW2")).toMatchObject({ assumed: true, assumedReason: "not-configured" });
    expect(dev(t, "Internet-Segment").assumed).toBe(true);
    expect(dev(t, "Internet-Segment").assumedReason).toBeUndefined();
    // Konfiguration: ISP-SW Ethernet0/0 = VLAN 99 (der Verbindungstext nennt Fa0/1)
    const sw = dev(t, "ISP-SW");
    expect(sw.interfaces.find((i) => i.name === "Et0/0")).toMatchObject({ mode: "access", vlan: 99 });
    expect(sw.interfaces.find((i) => i.name === "Et0/1")).toMatchObject({ mode: "access", vlan: 199 });
    expect(sw.interfaces.find((i) => i.name === "Et0/2")?.mode).toBe("trunk");
    expect(t.topology.devices.filter((d) => d.type === "pc")).toHaveLength(13);
    expect(getLabDeviceCli(t.lab, "CO-1")).toContain("ip nat inside source static 192.168.10.100 20.30.10.100");
  });

  it("co-acl-nat-isp: OSPF-Nachbarschaft CO-2 ↔ ISP-MUMBAI über ISP-SW (Access-Port, Trunk, dot1q-Subinterface)", () => {
    const t = build("co-acl-nat-isp");
    const adj = computeOspfNeighbors(dev(t, "CO-2"), t.topology);
    expect(adj).toHaveLength(1);
    expect(adj[0].neighbor.name).toBe("ISP-MUMBAI");
    expect(adj[0]).toMatchObject({ state: "FULL", neighborRole: "DR" }); // höhere Router-ID 200.10.20.1
    // CO-1 spricht EIGRP (nicht modelliert): keine erfundene OSPF-Nachbarschaft
    expect(computeOspfNeighbors(dev(t, "CO-1"), t.topology)).toEqual([]);
  });
});

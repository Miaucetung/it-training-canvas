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
const ip = (t: Built, n: string, ifc?: string) => dev(t, n).interfaces.find((i) => (ifc ? i.name === ifc : i.ip))?.ip;

describe("Paket 6 Operations/Automation – labspezifische Prüfungen", () => {
  it("ios-backup-upgrade: nur die Beispieladresse des TFTP-Servers, keine erfundene R1-Adresse oder Maske", () => {
    const t = build("ios-backup-upgrade");
    expect(t.problems).toEqual([]);
    expect(dev(t, "R1").interfaces.every((i) => !i.ip)).toBe(true);
    expect(dev(t, "TFTP-Server").interfaces[0].ip).toBeUndefined(); // Maske nennt das Lab nicht
    const cli = getLabDeviceCli(t.lab, "R1");
    expect(cli).toContain("copy running-config tftp:");
    expect(cli).toContain("boot system flash:c2900-universalk9-mz.SPA.bin");
  });

  it("netflow: Gi0/0 und Loopback0 aus dem Lab, Collector im selben Netz, Flow-Befehle im Export", () => {
    const t = build("netflow");
    expect(ip(t, "R1", "Gi0/0")).toBe("10.0.0.1/24");
    expect(ip(t, "R1", "Lo0")).toBe("10.0.0.254/32");
    expect(ip(t, "Flow-Collector")).toBe("10.0.0.60/24");
    expect(dev(t, "Flow-Collector").config?.defaultGateway).toBe("10.0.0.1");
    const cli = getLabDeviceCli(t.lab, "R1");
    for (const needle of ["flow exporter FNF-EXP", "transport udp 9996", "ip flow monitor FNF-MON input"]) expect(cli).toContain(needle);
    expect(CURATED_TOPOLOGIES.netflow.notes?.[0].text).toContain("Port nicht genannt");
  });

  it("restconf / netconf-yang: IOS-XE-Profil, Management-Adressen, Aktivierungsbefehle", () => {
    for (const [id, needle] of [["restconf", "restconf"], ["netconf-yang", "netconf-yang"]] as const) {
      const t = build(id);
      expect(t.problems, id).toEqual([]);
      expect(dev(t, "R1").label, id).toBe("Cisco IOS-XE Router");
      expect(ip(t, "R1", "Gi0/0"), id).toBe("10.0.0.1/24");
      expect(ip(t, "Admin-PC"), id).toBe("10.0.0.10/24");
      expect(getLabDeviceCli(t.lab, "R1"), id).toContain(needle);
    }
  });

  it("dhcp-troubleshoot-lab: Zielzustand mit Fix, Startzustand ohne Konfiguration und mit drei markierten Fehlern", () => {
    const target = build("dhcp-troubleshoot-lab");
    const start = build("dhcp-troubleshoot-lab", "start");
    expect(ip(target, "SW1", "Vlan1")).toBe("192.168.2.50/24");
    expect(ip(start, "SW1", "Vlan1")).toBeUndefined();
    const faults = (t: Built) => (t.topology.annotations ?? []).filter((a) => a.author === "Beabsichtigter Fehler");
    expect(faults(start)).toHaveLength(3);
    expect(faults(target)).toHaveLength(0);
    // Server-Adresse nur aus helper-address, Clients ohne erfundenes Netz
    expect(dev(target, "DHCP-Server").interfaces[0].ip).toBeUndefined();
    for (const c of ["Client Rot", "Client Blau"]) {
      expect(dev(target, c).interfaces[0].ip, c).toBeUndefined();
      expect(dev(target, c).interfaces[0].dhcp, c).toBeUndefined();
    }
    expect(getLabDeviceCli(target.lab, "R1")).toContain("ip helper-address 192.168.2.11");
    expect(dev(target, "SW1").interfaces.filter((i) => i.assumed).map((i) => i.name)).toEqual(["Fa0/1", "Fa0/2", "Fa0/3", "Gi0/1"]);
  });

  it("Textmarken erscheinen als Canvas-Notizen (z. B. IPSec-Tunnel), unabhängig vom Zustand", () => {
    for (const state of ["target", "start"] as const) {
      const notes = (build("ipsec-s2s-vpn", state).topology.annotations ?? []).filter((a) => a.author === "Lab-Hinweis");
      expect(notes, state).toHaveLength(1);
      expect(notes[0].text).toContain("IPSec-Tunnel");
    }
  });
});

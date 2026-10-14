import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { computeVtpSync, evaluateTrunk, formatShowVtpStatus } from "@/lib/topology/vtp-status";
import { formatShowIpDhcpPool } from "@/lib/topology/dhcp-outputs";
import type { DeviceVtpConfig, NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state);
};
const outputs = (id: string, name: string, state: "target" | "start" = "target") => {
  const t = build(id, state);
  const d = t.topology.devices.find((x) => x.name === name)!;
  return CiscoCliGenerator.getDynamicShowOutputs(d, t.topology);
};

describe("show ip dhcp pool / binding aus der Lab-Konfiguration", () => {
  it("dhcp: Pool, Gateway, DNS und ausgeschlossene Adressen aus dem Lab", () => {
    const o = outputs("dhcp", "Router0");
    const pool = o["show ip dhcp pool"];
    expect(pool).toContain("Pool LAN_POOL :");
    expect(pool).toContain("192.168.1.0/24");
    expect(pool).toMatch(/Total addresses\s+: 254/);
    expect(pool).toMatch(/Excluded addresses\s+: 10/);
    expect(pool).toMatch(/Default router\s+: 192\.168\.1\.1/);
    expect(pool).toMatch(/DNS server\s+: 8\.8\.8\.8/);
    expect(pool).toContain("192.168.1.1 - 192.168.1.10");
  });

  it("dhcp: Bindungen leer mit Hinweis, keine erfundene Client-Adresse", () => {
    const binding = outputs("dhcp", "Router0")["show ip dhcp binding"];
    expect(binding).toContain("entsteht erst nach DHCP-Anfragen");
    expect(binding).not.toMatch(/\d+\.\d+\.\d+\.\d+/);
    expect(outputs("dhcp", "Router0")["show ip dhcp pool"]).toContain("0 (entsteht erst nach DHCP-Anfragen)");
  });

  it("vlan-vtp-dhcp-campus: mehrere Pools, überlappende Ausschlüsse nur einmal gezählt", () => {
    const pool = outputs("vlan-vtp-dhcp-campus", "R1")["show ip dhcp pool"];
    for (const p of ["MGMT", "VLAN100", "VLAN110", "VLAN120"]) expect(pool).toContain(`Pool ${p} :`);
    expect(pool).toMatch(/Excluded addresses\s+: 155/);
  });

  it("negativ: Geräte ohne Pool bekommen weder pool- noch binding-Ausgabe", () => {
    const t = build("dhcp");
    for (const d of t.topology.devices.filter((x) => x.name !== "Router0")) {
      const o = CiscoCliGenerator.getDynamicShowOutputs(d, t.topology);
      expect(o["show ip dhcp pool"], d.name).toBeUndefined();
      expect(o["show ip dhcp binding"], d.name).toBeUndefined();
    }
  });

  it("negativ: im Startzustand gibt es keine Pool-Ausgabe", () => {
    expect(outputs("dhcp", "Router0", "start")["show ip dhcp pool"]).toBeUndefined();
  });

  it("negativ: Pool ohne network-Befehl nennt Netz und Zähler nicht", () => {
    const dev = { config: { hostname: "R", dhcpPools: [{ name: "X" }], dhcpExcluded: [{ from: "10.0.0.1", to: "10.0.0.5" }] } } as unknown as TopologyDevice;
    const text = formatShowIpDhcpPool(dev);
    expect(text).toMatch(/Network\s+: im Lab nicht angegeben/);
    expect(text).toMatch(/Total addresses\s+: nicht bestimmbar/);
    expect(text).toMatch(/Excluded addresses\s+: nicht bestimmbar/);
  });

  it("Parser: Pool-Unterbefehle enden mit dem nächsten fremden Befehl", () => {
    const lab = {
      steps: [
        {
          blocks: [
            {
              device: "R1",
              commands: [{ cmd: "ip dhcp pool A\nnetwork 10.0.0.0 255.255.255.0\ndefault-router 10.0.0.1\ninterface g0/0\nip address 10.0.0.1 255.255.255.0\nnetwork 1.1.1.0 255.255.255.0" }],
            },
          ],
        },
      ],
    };
    const cfg = parseLabDeviceConfig(lab as never, "R1");
    expect(cfg.dhcpPools).toEqual([{ name: "A", network: "10.0.0.0/24", defaultRouter: "10.0.0.1" }]);
  });
});

describe("show vtp status aus der Lab-Konfiguration", () => {
  it("vtp-dtp: Modus, Domain aus der Konfiguration, Revision als verlaufsabhängig, Version nicht erfunden", () => {
    const sw1 = outputs("vtp-dtp", "SW1")["show vtp status"];
    expect(sw1).toMatch(/VTP Operating Mode\s+: Server/);
    expect(sw1).toMatch(/VTP Domain Name\s+: CCNA-LAB/);
    expect(sw1).toMatch(/Configuration Revision\s+: abhängig vom Verlauf/);
    expect(sw1).toMatch(/VTP version running\s+: im Lab nicht angegeben/);
    expect(sw1).toMatch(/Number of existing VLANs\s+: 7/);
  });

  it("vtp-dtp: desirable ↔ trunk nonegotiate ergibt keinen Trunk, Clients synchronisieren nicht", () => {
    for (const name of ["SW2", "SW3"]) {
      const o = outputs("vtp-dtp", name)["show vtp status"];
      expect(o, name).toMatch(/VTP Operating Mode\s+: Client/);
      expect(o, name).toContain("Keine Synchronisation");
      expect(o, name).toContain("nonegotiate");
      expect(o, name).toMatch(/Number of existing VLANs\s+: 5 \(nur Standard-VLANs/);
    }
  });

  it("vlan-dhcp-nat-roas: Trunk on ↔ desirable funktioniert, Client erhält die VLANs des Servers", () => {
    const o = outputs("vlan-dhcp-nat-roas", "SW2")["show vtp status"];
    expect(o).toMatch(/VTP Operating Mode\s+: Client/);
    expect(o).toContain("Synchronisiert mit VTP-Server: SW1");
    expect(o).toMatch(/Number of existing VLANs\s+: 8/);
  });

  it("vlan-vtp-dhcp-campus: Client SW3 synchronisiert über die Trunk-Kette", () => {
    const o = outputs("vlan-vtp-dhcp-campus", "SW3")["show vtp status"];
    expect(o).toMatch(/VTP Operating Mode\s+: Client/);
    expect(o).toContain("Synchronisiert mit VTP-Server");
  });

  it("negativ: Router, PCs und Switches ohne VTP-Befehle haben keine show vtp status-Ausgabe", () => {
    const t = build("dhcp");
    for (const d of t.topology.devices) {
      expect(CiscoCliGenerator.getDynamicShowOutputs(d, t.topology)["show vtp status"], d.name).toBeUndefined();
    }
  });

  it("negativ: Startzustand ohne VTP-Ausgabe", () => {
    expect(outputs("vtp-dtp", "SW1", "start")["show vtp status"]).toBeUndefined();
  });

  it("Parser: switchport mode — der letzte Befehl gilt, nonegotiate wird erfasst", () => {
    const lab = {
      steps: [
        { blocks: [{ device: "S", commands: [{ cmd: "interface gi0/1\nswitchport mode dynamic desirable\nswitchport mode trunk\nswitchport nonegotiate\ninterface gi0/2\nswitchport mode trunk\nswitchport mode dynamic auto" }] }] },
      ],
    };
    const cfg = parseLabDeviceConfig(lab as never, "S");
    expect(cfg.ifaces.get("Gi0/1")).toMatchObject({ mode: "trunk", nonegotiate: true });
    expect(cfg.ifaces.get("Gi0/1")?.dtp).toBeUndefined();
    expect(cfg.ifaces.get("Gi0/2")).toMatchObject({ dtp: "auto" });
    expect(cfg.ifaces.get("Gi0/2")?.mode).toBeUndefined();
  });

  it("Parser: vtp-Befehle landen in der Konfiguration", () => {
    const lab = { steps: [{ blocks: [{ device: "S", commands: [{ cmd: "vtp domain D1\nvtp mode client\nvtp password pw\nvtp version 2" }] }] }] };
    expect(parseLabDeviceConfig(lab as never, "S").vtp).toEqual({ domain: "D1", mode: "client", password: "pw", version: 2 });
  });
});

describe("VTP-Synchronisation und Trunk-Auswertung (synthetisch)", () => {
  const iface = (id: string, extra: Partial<TopologyInterface> = {}): TopologyInterface => ({ id, name: id, status: "up", ...extra });
  const sw = (name: string, vtp: DeviceVtpConfig | undefined, port: Partial<TopologyInterface>, ports = 1): TopologyDevice => ({
    id: name,
    name,
    type: "switch-l2",
    x: 0,
    y: 0,
    interfaces: Array.from({ length: ports }, (_, i) => iface(`${name}-p${i}`, port)),
    config: { hostname: name, vtp, vlans: name === "S1" ? [{ id: 10, name: "A" }, { id: 20, name: "B" }] : undefined },
  });
  const link = (a: TopologyDevice, ai: number, b: TopologyDevice, bi: number) => ({
    id: `${a.name}-${b.name}`,
    sourceDeviceId: a.id,
    sourceInterfaceId: a.interfaces[ai].id,
    targetDeviceId: b.id,
    targetInterfaceId: b.interfaces[bi].id,
    linkType: "trunk" as const,
    status: "up" as const,
  });
  const topo = (devices: TopologyDevice[], links: ReturnType<typeof link>[]): NetworkTopology => ({ id: "t", name: "t", version: "2.0", devices, links });
  const pair = (serverVtp: DeviceVtpConfig, clientVtp: DeviceVtpConfig | undefined, port: Partial<TopologyInterface> = { mode: "trunk" }) => {
    const s1 = sw("S1", serverVtp, port);
    const c = sw("C1", clientVtp, port);
    return { s1, c, t: topo([s1, c], [link(s1, 0, c, 0)]) };
  };
  const srv: DeviceVtpConfig = { domain: "D", mode: "server", password: "p" };
  const cli: DeviceVtpConfig = { domain: "D", mode: "client", password: "p" };

  it("positiv: gleiche Domain und Passwort über Trunk synchronisieren", () => {
    const { c, t, s1 } = pair(srv, cli);
    expect(computeVtpSync(c, t).servers).toEqual([s1]);
    expect(formatShowVtpStatus(c, t)).toMatch(/Number of existing VLANs\s+: 7/);
  });

  it("negativ: andere Domain", () => {
    const { c, t } = pair(srv, { ...cli, domain: "X" });
    const r = computeVtpSync(c, t);
    expect(r.servers).toEqual([]);
    expect(r.blockers.join("\n")).toContain("andere VTP-Domain");
    expect(formatShowVtpStatus(c, t)).toContain("Keine Synchronisation");
  });

  it("negativ: anderes Passwort", () => {
    const { c, t } = pair(srv, { ...cli, password: "q" });
    expect(computeVtpSync(c, t).blockers.join("\n")).toContain("Passwort");
    expect(computeVtpSync(c, t).servers).toEqual([]);
  });

  it("negativ: Access-Port statt Trunk, Port heruntergefahren, auto ↔ auto", () => {
    expect(computeVtpSync(pair(srv, cli, { mode: "access" }).c, pair(srv, cli, { mode: "access" }).t).servers).toEqual([]);
    const down = pair(srv, cli, { mode: "trunk", status: "admin-down", isShutdown: true });
    expect(computeVtpSync(down.c, down.t).servers).toEqual([]);
    const auto = pair(srv, cli, { dtp: "auto" });
    expect(computeVtpSync(auto.c, auto.t).servers).toEqual([]);
  });

  it("negativ: Client ohne Domain im Lab — Synchronisation nicht bestimmbar", () => {
    const { c, t } = pair(srv, { mode: "client" });
    expect(computeVtpSync(c, t).servers).toEqual([]);
    expect(formatShowVtpStatus(c, t)).toContain("nicht bestimmbar");
  });

  it("negativ: Transparent erhält keine VLANs und meldet das", () => {
    const { c, t } = pair(srv, { ...cli, mode: "transparent" });
    const text = formatShowVtpStatus(c, t);
    expect(text).toMatch(/VTP Operating Mode\s+: Transparent/);
    expect(text).toContain("keine Synchronisation");
  });

  it("Kette Server — Client — Client: zweiter Client synchronisiert über den ersten", () => {
    const s1 = sw("S1", srv, { mode: "trunk" });
    const c1 = sw("C1", cli, { mode: "trunk" }, 2);
    const c2 = sw("C2", cli, { mode: "trunk" });
    const t = topo([s1, c1, c2], [link(s1, 0, c1, 0), link(c1, 1, c2, 0)]);
    expect(computeVtpSync(c2, t).servers).toEqual([s1]);
    const cut = topo([s1, c1, { ...c2, interfaces: [iface("C2-p0", { mode: "access" })] }], [link(s1, 0, c1, 0), link(c1, 1, c2, 0)]);
    expect(computeVtpSync(cut.devices[2], cut).servers).toEqual([]);
  });

  it("DTP-Tabelle", () => {
    const k = (p: Partial<TopologyInterface>) => iface("x", p);
    expect(evaluateTrunk(k({ dtp: "desirable" }), k({ dtp: "auto" })).trunk).toBe(true);
    expect(evaluateTrunk(k({ dtp: "desirable" }), k({ dtp: "desirable" })).trunk).toBe(true);
    expect(evaluateTrunk(k({ dtp: "auto" }), k({ dtp: "auto" })).trunk).toBe(false);
    expect(evaluateTrunk(k({ mode: "trunk" }), k({ dtp: "auto" })).trunk).toBe(true);
    expect(evaluateTrunk(k({ mode: "trunk" }), k({})).trunk).toBe(true);
    expect(evaluateTrunk(k({ mode: "trunk", nonegotiate: true }), k({ dtp: "desirable" })).trunk).toBe(false);
    expect(evaluateTrunk(k({ mode: "trunk", nonegotiate: true }), k({ mode: "trunk", nonegotiate: true })).trunk).toBe(true);
    expect(evaluateTrunk(k({ mode: "access" }), k({ mode: "trunk" })).trunk).toBe(false);
  });
});

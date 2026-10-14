import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { formatShowIpNatTranslations, natHints } from "@/lib/topology/nat-outputs";
import type { TopologyDevice } from "@/types/topology";

const build = (id: string, state: "target" | "start" = "target") => {
  const lab = LABS.find((l) => l.id === id)!;
  return buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], state);
};
const nat = (id: string, name: string, state: "target" | "start" = "target") => {
  const t = build(id, state);
  const d = t.topology.devices.find((x) => x.name === name)!;
  return CiscoCliGenerator.getDynamicShowOutputs(d, t.topology)["show ip nat translations"];
};
const ADDR = /\d+\.\d+\.\d+\.\d+/g;

describe("show ip nat translations aus der Lab-Konfiguration", () => {
  it("static-nat: drei statische Einträge laut Lab", () => {
    const o = nat("static-nat", "NAT-Router");
    expect(o).toMatch(/---\s+200\.0\.0\.10\s+192\.168\.1\.10\s+---\s+---/);
    expect(o).toMatch(/---\s+200\.0\.0\.11\s+192\.168\.1\.11/);
    expect(o).toMatch(/---\s+200\.0\.0\.12\s+192\.168\.1\.12/);
    expect(o.split("\n").filter((l) => l.startsWith("---"))).toHaveLength(3);
    expect(o).not.toContain("Dynamisch");
  });

  it("co-acl-nat-isp: je Router vier statische Einträge mit den Adressen des jeweiligen Routers", () => {
    const co1 = nat("co-acl-nat-isp", "CO-1");
    const co2 = nat("co-acl-nat-isp", "CO-2");
    expect(co1.split("\n").filter((l) => l.startsWith("---"))).toHaveLength(4);
    expect(co1).toContain("20.30.10.100");
    expect(co1).not.toContain("45.35.55");
    expect(co2).toContain("45.35.55.100");
    expect(co2).not.toContain("20.30.10");
  });

  it("dynamische Regeln: keine erfundenen Übersetzungen, Hinweis „entstehen erst nach Verkehr“", () => {
    for (const [id, text] of [
      ["nat-pat", "Interface Gi0/1, Overload (PAT)"],
      ["dynamic-nat", "Pool PUBLIC-POOL (200.0.0.10 - 200.0.0.12)"],
      ["nat-pool-overload", "Pool DYNAMIC-POOL (200.0.0.1 - 200.0.0.4), Overload (PAT)"],
      ["vlan-dhcp-nat-roas", "Interface Gi0/1, Overload (PAT)"],
    ] as const) {
      const o = nat(id, id === "vlan-dhcp-nat-roas" ? "Router0" : "NAT-Router");
      expect(o, id).toContain(text);
      expect(o, id).toContain("entstehen erst nach Verkehr");
      expect(o.split("\n").filter((l) => l.startsWith("---") || /^tcp|^udp|^icmp/.test(l)), id).toEqual([]);
    }
  });

  it("dynamic-nat: die Tabelle nennt nur Adressen aus der Pool-Konfiguration", () => {
    const o = nat("dynamic-nat", "NAT-Router");
    const found = new Set(o.match(ADDR));
    expect([...found].sort()).toEqual(["200.0.0.10", "200.0.0.12"]);
  });

  it("negativ: Geräte ohne NAT-Konfiguration haben keine Ausgabe", () => {
    const t = build("static-nat");
    for (const d of t.topology.devices.filter((x) => x.name !== "NAT-Router")) {
      expect(CiscoCliGenerator.getDynamicShowOutputs(d, t.topology)["show ip nat translations"], d.name).toBeUndefined();
    }
  });

  it("negativ: Startzustand ohne NAT-Ausgabe", () => {
    expect(nat("static-nat", "NAT-Router", "start")).toBeUndefined();
  });

  it("Parser: statisch mit Port, Pool mit Maske, Regel mit Interface, inside/outside je Interface", () => {
    const lab = {
      steps: [
        {
          blocks: [
            {
              device: "R",
              commands: [
                {
                  cmd: [
                    "interface gi0/0",
                    "ip nat inside",
                    "interface gi0/1",
                    "ip nat outside",
                    "ip nat pool P 1.1.1.1 1.1.1.5 netmask 255.255.255.0",
                    "ip nat inside source static tcp 10.0.0.5 80 1.1.1.9 8080",
                    "ip nat inside source static 10.0.0.6 1.1.1.10",
                    "ip nat inside source list 7 pool P overload",
                    "ip nat inside source list 8 interface GigabitEthernet0/1 overload",
                  ].join("\n"),
                },
              ],
            },
          ],
        },
      ],
    };
    const cfg = parseLabDeviceConfig(lab as never, "R");
    expect(cfg.nat?.statics).toEqual([
      { local: "10.0.0.5", global: "1.1.1.9", protocol: "tcp", localPort: 80, globalPort: 8080 },
      { local: "10.0.0.6", global: "1.1.1.10" },
    ]);
    expect(cfg.nat?.pools).toEqual([{ name: "P", start: "1.1.1.1", end: "1.1.1.5", netmask: "255.255.255.0" }]);
    expect(cfg.nat?.rules).toEqual([
      { acl: "7", pool: "P", overload: true },
      { acl: "8", interface: "Gi0/1", overload: true },
    ]);
    expect(cfg.ifaces.get("Gi0/0")?.natSide).toBe("inside");
    expect(cfg.ifaces.get("Gi0/1")?.natSide).toBe("outside");
  });

  it("Ausgabe: statischer Eintrag mit Port, Pool im Lab nicht definiert", () => {
    const dev = {
      config: {
        hostname: "R",
        nat: {
          statics: [{ local: "10.0.0.5", global: "1.1.1.9", protocol: "tcp", localPort: 80, globalPort: 8080 }],
          pools: [],
          rules: [{ acl: "7", pool: "FEHLT", overload: false }],
          insideInterfaces: ["Gi0/0"],
          outsideInterfaces: ["Gi0/1"],
        },
      },
    } as unknown as TopologyDevice;
    const o = formatShowIpNatTranslations(dev);
    expect(o).toMatch(/tcp\s+1\.1\.1\.9:8080\s+10\.0\.0\.5:80/);
    expect(o).toContain("Pool FEHLT (im Lab nicht definiert)");
  });

  it("Hinweise: fehlendes inside/outside und Pool ohne Overload", () => {
    const base = { statics: [], pools: [{ name: "P", start: "1.1.1.1", end: "1.1.1.2" }], rules: [{ acl: "1", pool: "P", overload: false }] };
    const none = { config: { nat: { ...base, insideInterfaces: [], outsideInterfaces: [] } } } as unknown as TopologyDevice;
    expect(natHints(none).join(" ")).toContain("ip nat inside und ip nat outside fehlt");
    expect(natHints(none).join(" ")).toContain("ohne Overload");
    const ok = { config: { nat: { ...base, rules: [{ acl: "1", pool: "P", overload: true }], insideInterfaces: ["Gi0/0"], outsideInterfaces: ["Gi0/1"] } } } as unknown as TopologyDevice;
    expect(natHints(ok).join(" ")).not.toContain("fehlt");
    expect(natHints(ok).join(" ")).not.toContain("ohne Overload");
  });

  it("negativ: nur inside/outside ohne NAT-Regeln erzeugt keine Übersetzungstabelle", () => {
    const only = { type: "router", config: { nat: { statics: [], pools: [], rules: [], insideInterfaces: ["Gi0/0"], outsideInterfaces: [] } } } as unknown as TopologyDevice;
    expect(natHints(only)).toEqual([]);
  });
});

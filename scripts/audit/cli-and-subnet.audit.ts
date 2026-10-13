import { describe, it } from "vitest";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { BUILT_IN_CCNA_TOPOLOGIES } from "@/lib/topology/sample-topologies";
import { calculateSubnet } from "@/lib/subnet-calc";
import { createNewDevice, validateLinkConnection } from "@/lib/topology/topology-operations";
import { evaluateEtherChannelModes } from "@/lib/topology/topology-validation";

const log = (...a: unknown[]) => console.log(...a);

describe("AUDIT Subnetzrechner", () => {
  it("Grenzfaelle", () => {
    for (const i of ["0.0.0.0/0", "10.1.2.3/8", "192.168.1.77/24", "192.168.1.5/30", "192.168.1.4/31", "192.168.1.9/32",
      "1.2.3.4/33", "1.2.3.4/-1", "256.1.1.1/24", "1.2.3/24", "abc", "", "1.2.3.4/", "1.2.3.4/024", "1.2.3.4/ 8", "01.2.3.4/24", "1.2.3.4", "224.0.0.1/4", "127.0.0.1/8", "172.32.0.1/12", "10.0.0.1/1e1"]) {
      const r: any = calculateSubnet(i);
      log(`${JSON.stringify(i).padEnd(22)} -> ${r.isValid ? `net=${r.networkAddress} bc=${r.broadcastAddress} first=${r.firstUsableHost} last=${r.lastUsableHost} hosts=${r.usableHosts} mask=${r.subnetMask} wc=${r.wildcardMask} class=${r.ipClass} priv=${r.isPrivate}` : "ERR " + r.errorMessage}`);
    }
  });
});

describe("AUDIT CLI-Generator", () => {
  it("Beispieltopologien", () => {
    for (const t of BUILT_IN_CCNA_TOPOLOGIES) {
      log(`\n######## ${t.id}`);
      for (const d of t.devices.filter((d) => d.type === "router" || d.type.startsWith("switch"))) {
        log(`--- ${d.name} :: show ip route`); log(CiscoCliGenerator.generateShowIpRoute(d, t).split("\n").filter((l) => /^[CLOSDR]\s|^\(/.test(l)).join("\n"));
        log(`--- ${d.name} :: show ip ospf neighbor`); log(CiscoCliGenerator.generateShowIpOspfNeighbor(d, t));
        if (d.type.startsWith("switch")) { log(`--- ${d.name} :: show spanning-tree`); log(CiscoCliGenerator.generateShowSpanningTree(d, t)); log(`--- ${d.name} :: show vlan brief`); log(CiscoCliGenerator.generateShowVlanBrief(d)); log(`--- ${d.name} :: trunk`); log(CiscoCliGenerator.generateShowInterfacesTrunk(d)); }
      }
    }
  });
  it("neu erzeugtes Geraet ohne Konfiguration", () => {
    const sw = createNewDevice("switch-l2", 0, 0, "SWX");
    const r1 = createNewDevice("router", 0, 0, "R1"); const r2 = createNewDevice("router", 0, 0, "R2");
    log("neue Switch-Ports:", sw.interfaces.map((i) => i.name).join(","));
    log("Loopback R1/R2:", r1.interfaces.find((i) => i.name === "Lo0")?.ip, r2.interfaces.find((i) => i.name === "Lo0")?.ip);
    log("--- show vlan brief leerer Switch\n" + CiscoCliGenerator.generateShowVlanBrief(sw));
    log("--- show spanning-tree leerer Switch\n" + CiscoCliGenerator.generateShowSpanningTree(sw, { devices: [sw], links: [] } as any));
    log("--- show ip int br Router\n" + CiscoCliGenerator.generateShowIpInterfaceBrief(r1));
  });
  it("EtherChannel-Matrix", () => {
    const m = ["active", "passive", "desirable", "auto", "on"] as const;
    for (const a of m) log(m.map((b) => `${a}/${b}=${evaluateEtherChannelModes(a, b).channelOperational ? "UP" : "DOWN"}`).join("  "));
  });
  it("Link-Regeln", () => {
    const mk = (t: any, n: string) => createNewDevice(t, 0, 0, n);
    const r1 = mk("router", "R1"), r2 = mk("router", "R2"), sw = mk("switch-l2", "SW"), ap = mk("access-point", "AP"), wlc = mk("wlc", "WLC"), pc = mk("pc", "PC"), srv = mk("server", "SRV"), cloud = mk("cloud", "CL"), l3 = mk("switch-l3", "L3");
    const t = (a: any, b: any, lt: any, ai?: string, bi?: string) => validateLinkConnection(a, b, ai ?? a.interfaces[0].id, bi ?? b.interfaces[0].id, lt, []);
    const out = (n: string, v: any) => log(n.padEnd(52), v.valid ? "ERLAUBT" : "ABGELEHNT: " + v.error);
    out("wireless AP<->PC", t(ap, pc, "wireless", ap.interfaces[1].id, pc.interfaces[1].id));
    out("wireless AP<->SW", t(ap, sw, "wireless"));
    out("wireless WLC<->PC", t(wlc, pc, "wireless"));
    out("wireless PC<->PC", t(pc, mk("pc", "PC2"), "wireless"));
    out("wireless AP<->Server", t(ap, srv, "wireless"));
    out("wireless AP<->AP", t(ap, mk("access-point", "AP2"), "wireless"));
    out("serial R<->R (Gi0/0 <-> Gi0/0!)", t(r1, r2, "serial"));
    out("serial R<->R (Se<->Se)", t(r1, r2, "serial", r1.interfaces.find((i) => i.name.startsWith("Se"))!.id, r2.interfaces.find((i) => i.name.startsWith("Se"))!.id));
    out("serial R<->Cloud", t(r1, cloud, "serial"));
    out("serial R<->SW", t(r1, sw, "serial"));
    out("serial L3<->R", t(l3, r1, "serial"));
    out("ethernet WLC<->SW", t(wlc, sw, "ethernet"));
    out("ethernet AP Radio0 <->SW", t(ap, sw, "ethernet", ap.interfaces[1].id));
    out("ethernet R Se0/1/0 <-> SW Fa0/1 (Serial-Port an Ethernet)", t(r1, sw, "ethernet", r1.interfaces.find((i) => i.name.startsWith("Se"))!.id));
    out("ethernet PC<->PC", t(pc, mk("pc", "PC2"), "ethernet"));
  });
});

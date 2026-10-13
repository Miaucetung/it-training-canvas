import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, getLabDeviceCli, parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { networkTopologySchema } from "@/types/topology";
import { validateTopology } from "@/lib/topology/topology-validation";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { computeStp } from "@/lib/topology/stp-calc";
import { normalizeInterfaceName } from "@/lib/topology/hardware-profiles";

/**
 * Datengetriebene Prüfung ALLER kuratierten Lab-Topologien (jedes neue Lab wird automatisch erfasst):
 * Schema, Hardware-Profil, Abgleich mit den Befehlen des Labs, Validierung, erfundene Werte in show-Ausgaben.
 */

// Erwartete Validierungsmeldungen je Lab (Standard: keine).
const EXPECTED_ISSUES: Record<string, string[]> = {};

// Zeilen der Verbindungsliste, die dem Lab-Text selbst widersprechen (Konfiguration gilt, siehe Bericht).
const KNOWN_CONNECTION_CONTRADICTIONS: Record<string, string[]> = {
  ospf: ["R2 Gi0/2 ↔ R3 Gi0/1  (10.0.23.0/30)", "R1 Gi0/2 ↔ R3 Gi0/2  (10.0.13.0/30)"],
};

const labIds = Object.keys(CURATED_TOPOLOGIES);
const lab = (id: string) => LABS.find((l) => l.id === id)!;

function ipv4Tokens(text: string): string[] {
  return [...text.matchAll(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/g)].map((m) => m[1]);
}

function cidrMask(prefix: number): string {
  const bits = "1".repeat(prefix).padEnd(32, "0");
  return [0, 8, 16, 24].map((i) => parseInt(bits.slice(i, i + 8), 2)).join(".");
}

function networkOf(ip: string, prefix: number): string {
  const o = ip.split(".").map(Number);
  const m = cidrMask(prefix).split(".").map(Number);
  return o.map((x, i) => x & m[i]).join(".");
}

describe.each(labIds)("Lab-Topologie %s als Netzwerk-Vorlage", (id) => {
  const l = lab(id);
  const data = CURATED_TOPOLOGIES[id];
  const target = buildNetworkTopologyFromLab(l, data, "target");
  const start = buildNetworkTopologyFromLab(l, data, "start");

  it("Schema gültig, Kategorie und Rücksprung-Metadaten gesetzt", () => {
    const parsed = networkTopologySchema.safeParse(target.topology);
    expect(parsed.success, parsed.success ? "" : parsed.error.message).toBe(true);
    expect(target.topology.category).toBe("teaching-labs");
    expect(target.topology.metadata?.labId).toBe(id);
    expect(target.topology.metadata?.labState).toBe("target");
    expect(start.topology.metadata?.labState).toBe("start");
  });

  it("alle Interfaces existieren im Hardware-Profil", () => {
    expect(target.problems).toEqual([]);
    expect(start.problems).toEqual([]);
  });

  it("jede Verbindung des Diagramms verbindet zwei existierende Interfaces, kein Interface doppelt belegt", () => {
    const used = new Set<string>();
    for (const link of target.topology.links) {
      for (const [dev, ifc] of [
        [link.sourceDeviceId, link.sourceInterfaceId],
        [link.targetDeviceId, link.targetInterfaceId],
      ]) {
        const d = target.topology.devices.find((x) => x.id === dev)!;
        expect(d.interfaces.some((i) => i.id === ifc), `${link.id}: ${ifc}`).toBe(true);
        expect(used.has(`${dev}|${ifc}`), `doppelt: ${dev} ${ifc}`).toBe(false);
        used.add(`${dev}|${ifc}`);
      }
    }
  });

  it("Verbindungsliste des Labs stimmt mit den Links überein (Port-Paare)", () => {
    const names = data.devices.map((d) => d.name).sort((a, b) => b.length - a.length);
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRe = new RegExp(`^(${names.map(esc).join("|")})(?:\\s+([A-Za-z]+\\d+(?:/\\d+)+))?\\s*$`);
    const idOf = (n: string) => data.devices.find((d) => d.name === n)!.id;
    const portOn = (linkEnd: "from" | "to", link: (typeof data.links)[number]) => normalizeInterfaceName(linkEnd === "from" ? link.fromPort : link.toPort);
    const contradictions = KNOWN_CONNECTION_CONTRADICTIONS[id] ?? [];
    let verified = 0;

    for (const lineRaw of l.topology.connections) {
      if (contradictions.includes(lineRaw)) continue;
      for (const part of lineRaw.split(",")) {
        const segs = part.split(/\s*[↔→]\s*/).map((s) => s.replace(/\(.*?\)/g, "").trim());
        const parsed = segs.map((s) => nameRe.exec(s));
        if (segs.length < 2 || parsed.some((p) => !p)) continue;
        for (let i = 0; i + 1 < parsed.length; i++) {
          const [, xn, xp] = parsed[i]!;
          const [, yn, yp] = parsed[i + 1]!;
          const found = data.links.find((k) => {
            const direct = k.from === idOf(xn) && k.to === idOf(yn);
            const reverse = k.from === idOf(yn) && k.to === idOf(xn);
            if (!direct && !reverse) return false;
            const px = direct ? portOn("from", k) : portOn("to", k);
            const py = direct ? portOn("to", k) : portOn("from", k);
            return (!xp || normalizeInterfaceName(xp) === px) && (!yp || normalizeInterfaceName(yp) === py);
          });
          expect(found, `"${part.trim()}": keine passende Verbindung ${xn}${xp ? " " + xp : ""} ↔ ${yn}${yp ? " " + yp : ""}`).toBeDefined();
          verified++;
        }
      }
    }
    expect(verified, "mindestens eine Verbindungszeile wurde automatisch abgeglichen").toBeGreaterThan(0);
  });

  it("jede IP/Maske der Adressierungstabelle stimmt mit den Befehlen des Labs überein (Interfaces und Hosts)", () => {
    for (const row of data.addressingTable) {
      const cfg = parseLabDeviceConfig(l, row.device);
      const key = normalizeInterfaceName(row.interface);
      const ifc = cfg.ifaces.get(key);
      const prefix = row.subnetMask.split(".").reduce((a, o) => a + Number(o).toString(2).replace(/0/g, "").length, 0);
      if (ifc?.ip) {
        expect(ifc.ip, `${row.device} ${row.interface}`).toBe(`${row.ip}/${prefix}`);
      } else {
        expect(cfg.hostIp?.ip, `${row.device} ${row.interface}: weder Interface- noch Desktop-Konfiguration`).toBe(row.ip);
        if (row.defaultGateway && row.defaultGateway !== "N/A") expect(cfg.hostIp?.gateway).toBe(row.defaultGateway);
      }
    }
  });

  it("Validierung liefert das erwartete Ergebnis", () => {
    const v = validateTopology(target.topology);
    expect(v.issues.map((i) => i.code)).toEqual(EXPECTED_ISSUES[id] ?? []);
  });

  it("Startzustand enthält keine Konfiguration, aber dieselben Geräte und Links", () => {
    expect(start.topology.devices.map((d) => d.id)).toEqual(target.topology.devices.map((d) => d.id));
    expect(start.topology.links.length).toBe(target.topology.links.length);
    for (const d of start.topology.devices) {
      expect(d.interfaces.filter((i) => i.ip), `${d.name} hat IP im Startzustand`).toEqual([]);
      expect(d.config?.vlans, d.name).toBeUndefined();
      expect(d.config?.hostname).toBe(d.name);
    }
  });

  it("CLI-Export enthält Befehle ohne Prompt für jedes Router-/Switch-Gerät", () => {
    for (const d of data.devices.filter((x) => x.type === "router" || x.type.startsWith("switch"))) {
      const cli = getLabDeviceCli(l, d.name);
      expect(cli.length, d.name).toBeGreaterThan(0);
      for (const line of cli.split("\n")) {
        expect(line, `${d.name}: Prompt in "${line}"`).not.toMatch(/^[\w.-]+(\([\w-]+\))?[#>]/);
      }
      expect(target.topology.devices.find((x) => x.id === d.id)!.config?.labCli).toBe(cli);
    }
  });

  it("show-Ausgaben des CLI-Generators enthalten keine erfundenen IP-Adressen", () => {
    const allowed = new Set<string>(["0.0.0.0", "255.255.255.255"]);
    for (const d of target.topology.devices) {
      for (const i of d.interfaces) {
        if (!i.ip) continue;
        const [ip, p] = i.ip.split("/");
        const prefix = Number(p);
        allowed.add(ip);
        allowed.add(networkOf(ip, prefix));
        allowed.add(cidrMask(prefix));
      }
      if (d.config?.defaultGateway) allowed.add(d.config.defaultGateway);
      if (d.config?.ospf?.routerId) allowed.add(d.config.ospf.routerId); // im Lab konfigurierte Router-ID
    }
    for (const d of target.topology.devices) {
      const outputs = CiscoCliGenerator.getDynamicShowOutputs(d, target.topology);
      for (const [cmd, out] of Object.entries(outputs)) {
        for (const ip of ipv4Tokens(out)) {
          expect(allowed.has(ip), `${d.name} "${cmd}": erfundene IP ${ip}`).toBe(true);
        }
      }
    }
  });

  it("show vlan brief nennt nur VLANs, die das Lab anlegt", () => {
    for (const d of target.topology.devices.filter((x) => x.type.startsWith("switch"))) {
      const out = CiscoCliGenerator.generateShowVlanBrief(d);
      const ids = out.split("\n").filter((ln) => /^\d+\s/.test(ln)).map((ln) => Number(ln.split(/\s+/)[0]));
      const expected = new Set([1, 1002, 1003, 1004, 1005, ...(d.config?.vlans ?? []).map((v) => v.id)]);
      for (const vid of ids) expect(expected.has(vid), `${d.name}: VLAN ${vid}`).toBe(true);
    }
  });
});

describe("Lab stp: Spanning-Tree-Ergebnis folgt aus dem Lab (priority 4096 auf SW1)", () => {
  const { topology } = buildNetworkTopologyFromLab(lab("stp"), CURATED_TOPOLOGIES.stp, "target");
  const stp = computeStp(topology);

  it("SW1 ist Root-Bridge, alle Switch-Ports Designated", () => {
    const sw1 = stp.get("sw1")!;
    expect(sw1.priority).toBe(4096);
    expect(sw1.isRoot).toBe(true);
    expect(sw1.ports.every((p) => p.role === "Desg" && p.state === "FWD")).toBe(true);
  });

  it("SW2: Gi0/1 Root-Port, Gi0/2 Alternate/Blocking (Loop aufgelöst)", () => {
    const sw2 = stp.get("sw2")!;
    const byName = Object.fromEntries(sw2.ports.map((p) => [p.iface.name, `${p.role}/${p.state}`]));
    expect(byName["Gi0/1"]).toBe("Root/FWD");
    expect(byName["Gi0/2"]).toBe("Altn/BLK");
    expect(byName["Fa0/1"]).toBe("Desg/FWD");
  });
});

describe("Lab etherchannel: Bundle aus dem Lab", () => {
  const { topology } = buildNetworkTopologyFromLab(lab("etherchannel"), CURATED_TOPOLOGIES.etherchannel, "target");

  it("beide Switches bündeln Fa0/1-2 als Po1 (LACP active)", () => {
    for (const id of ["sw1", "sw2"]) {
      const d = topology.devices.find((x) => x.id === id)!;
      expect(d.config?.portChannels).toEqual([{ id: 1, mode: "active", protocol: "lacp", members: ["Fa0/1", "Fa0/2"] }]);
      const out = CiscoCliGenerator.generateShowEtherchannelSummary(d);
      expect(out).toMatch(/1\s+Po1\(SU\)\s+LACP\s+Fa0\/1\(P\)\s+Fa0\/2\(P\)/);
    }
    expect(topology.links.filter((k) => k.linkType === "etherchannel")).toHaveLength(2);
  });
});

describe("Lab ivr-svi: SVIs und ip routing aus dem Lab", () => {
  const { topology } = buildNetworkTopologyFromLab(lab("ivr-svi"), CURATED_TOPOLOGIES["ivr-svi"], "target");
  const mls = topology.devices.find((d) => d.id === "mls1")!;

  it("MLS1 routet und hat beide SVIs", () => {
    expect(mls.config?.ipRoutingEnabled).toBe(true);
    expect(mls.config?.svis?.map((s) => `${s.vlan} ${s.ip}`)).toEqual(["10 192.168.10.254/24", "20 192.168.20.254/24"]);
    const route = CiscoCliGenerator.generateShowIpRoute(mls, topology);
    expect(route).toContain("C    192.168.10.0/24 is directly connected, Vlan10");
    expect(route).toContain("L    192.168.20.254/32 is directly connected, Vlan20");
  });
});

describe("Lab vtp-dtp: VLAN-Datenbank des Servers", () => {
  const { topology } = buildNetworkTopologyFromLab(lab("vtp-dtp"), CURATED_TOPOLOGIES["vtp-dtp"], "target");

  it("SW1 legt VLAN 10 VERWALTUNG und 20 TECHNIK an, SW2/SW3 haben lokal keine (VTP-Client)", () => {
    const names = (id: string) => topology.devices.find((d) => d.id === id)!.config?.vlans?.map((v) => `${v.id} ${v.name}`);
    expect(names("sw1")).toEqual(["10 VERWALTUNG", "20 TECHNIK"]);
    expect(names("sw2")).toBeUndefined();
    expect(names("sw3")).toBeUndefined();
  });
});

describe("Lab ospf: Konverter liefert dieselben Nachbarschaften wie die Konfiguration verlangt", () => {
  const { topology } = buildNetworkTopologyFromLab(lab("ospf"), CURATED_TOPOLOGIES.ospf, "target");
  const rows = (id: string) =>
    CiscoCliGenerator.generateShowIpOspfNeighbor(topology.devices.find((d) => d.id === id)!, topology).split("\n").slice(1);

  it("broadcast mit DR/BDR, LAN-Interfaces passive", () => {
    expect(rows("r1").map((r) => r.split(/\s+/).slice(0, 3).join(" ")).sort()).toEqual(["2.2.2.2 1 FULL/DR", "3.3.3.3 1 FULL/DR"]);
    expect(rows("r2").map((r) => r.split(/\s+/)[2]).sort()).toEqual(["FULL/BDR", "FULL/DR"]);
    expect(rows("r3").map((r) => r.split(/\s+/)[2])).toEqual(["FULL/BDR", "FULL/BDR"]);
    const r1 = topology.devices.find((d) => d.id === "r1")!;
    expect(r1.interfaces.find((i) => i.name === "Gi0/0")!.ospf?.passive).toBe(true);
  });
});

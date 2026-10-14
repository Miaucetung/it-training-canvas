import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, expandDeviceNames, labDhcpPoolNetworks, getLabDeviceCli, parseLabDeviceConfig } from "@/components/labs/lab-to-network";
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

/** Alle Befehle des Labs als ein Text */
function allCommandText(lab: (typeof LABS)[number]): string {
  return lab.steps.flatMap((st) => (st.blocks as Array<{ commands: Array<{ cmd: string }> }>).flatMap((b) => b.commands.map((c) => c.cmd))).join("\n");
}

/** Netze (Adresse/Präfix), die der Lab-Text selbst nennt: `ip address`, `network ... <maske>` eines DHCP-Pools, Interface-Adressen mit Subnetzmaske */
function labNetworks(lab: (typeof LABS)[number]): Set<string> {
  const nets = new Set<string>();
  const text = allCommandText(lab);
  const prefixOf = (mask: string) => mask.split(".").reduce((a, o) => a + Number(o).toString(2).replace(/0/g, "").length, 0);
  for (const m of text.matchAll(/(?:ip address|^\s*network)\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})/gm)) {
    const p = prefixOf(m[2]);
    nets.add(`${networkOf(m[1], p)}/${p}`);
  }
  return nets;
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
    for (const z of target.topology.subnetZones ?? []) expect(z.labelCorner, z.id).toBeDefined();
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
    const nameRe = new RegExp(`^(${names.map(esc).join("|")})(?:\\s+([A-Za-z]+\\d+(?:/\\d+)+))?(?:\\s+(?:\\d+(?:\\.\\d+){3}|[0-9A-Fa-f:]*::[0-9A-Fa-f:]*)(?:/\\d+)?)?\\s*$`);
    const idOf = (n: string) => data.devices.find((d) => d.name === n)!.id;
    const portOn = (linkEnd: "from" | "to", link: (typeof data.links)[number]) => normalizeInterfaceName(linkEnd === "from" ? link.fromPort : link.toPort);
    const contradictions = KNOWN_CONNECTION_CONTRADICTIONS[id] ?? [];
    let verified = 0;

    for (const lineRaw of l.topology.connections) {
      if (contradictions.includes(lineRaw)) continue;
      const range = /^(\D+?)(\d+)[–-]\D+?(\d+)\s*→\s*(\S+)\s+([A-Za-z]+\d+\/)(\d+)[–-][A-Za-z]+\d+\/(\d+)/.exec(lineRaw);
      if (range) {
        const [, base, from, to, sw, ifPrefix, portFrom] = range;
        for (let k = 0; k <= Number(to) - Number(from); k++) {
          const hostId = idOf(`${base}${Number(from) + k}`);
          const swId = idOf(sw);
          const swPort = normalizeInterfaceName(`${ifPrefix}${Number(portFrom) + k}`);
          const found = data.links.find(
            (x) => (x.from === hostId && x.to === swId && normalizeInterfaceName(x.toPort) === swPort) || (x.to === hostId && x.from === swId && normalizeInterfaceName(x.fromPort) === swPort),
          );
          expect(found, `"${lineRaw}": ${base}${Number(from) + k} ↔ ${sw} ${swPort} fehlt`).toBeDefined();
          verified++;
        }
        continue;
      }
      const fan = /^(\D+?)(\d+)\.\.\D+?(\d+)\s+([A-Za-z]+\d+(?:\/\d+)+)\s*→\s*(\w+)/.exec(lineRaw);
      if (fan) {
        const [, base, from, to, port, hub] = fan;
        for (let k = Number(from); k <= Number(to); k++) {
          const found = data.links.find((x) => {
            const direct = x.from === idOf(`${base}${k}`) && x.to === idOf(hub) && normalizeInterfaceName(x.fromPort) === normalizeInterfaceName(port);
            const reverse = x.to === idOf(`${base}${k}`) && x.from === idOf(hub) && normalizeInterfaceName(x.toPort) === normalizeInterfaceName(port);
            return direct || reverse;
          });
          expect(found, `"${lineRaw}": ${base}${k} ${port} ↔ ${hub} fehlt`).toBeDefined();
          verified++;
        }
        continue;
      }
      for (const part of lineRaw.replace(/\(.*?\)/g, "").replace(/\s*─{2,}\s*/g, " ↔ ").split(/,|\s[—·]\s/)) {
        const segs = part
          .split(/\s*[↔→]\s*/)
          .map((s) => s.replace(/\(.*?\)/g, "").trim())
          .filter((s) => !/^\d+(?:\.\d+){3}(?:\/\d+)?$/.test(s));
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
    if (verified === 0) {
      // Zeilen ohne Paar ("R1 Gi0/0 — 192.168.1.2/24"): der genannte Port muss an einem Link des Geräts hängen
      const portRe = new RegExp(`\\b(${names.map(esc).join("|")})\\s+([A-Za-z]+\\d+(?:/\\d+)+)`, "g");
      for (const lineRaw of l.topology.connections) {
        for (const m of lineRaw.matchAll(portRe)) {
          const used = data.links.some(
            (k) => (k.from === idOf(m[1]) && normalizeInterfaceName(k.fromPort) === normalizeInterfaceName(m[2])) || (k.to === idOf(m[1]) && normalizeInterfaceName(k.toPort) === normalizeInterfaceName(m[2])),
          );
          expect(used, `"${lineRaw}": ${m[1]} ${m[2]} hängt an keinem Link`).toBe(true);
          verified++;
        }
      }
    }
    if (verified === 0) {
      // Zeilen ganz ohne Port ("Admin-PC → R1 Mgmt …"): die genannten Geräte müssen über einen Link verbunden sein
      const namesRe = new RegExp(`(${names.map(esc).join("|")})`, "g");
      for (const lineRaw of l.topology.connections) {
        const found = [...lineRaw.matchAll(namesRe)].map((m) => m[1]);
        for (let i = 0; i + 1 < found.length; i++) {
          if (found[i] === found[i + 1]) continue;
          const a = idOf(found[i]);
          const b = idOf(found[i + 1]);
          expect(data.links.some((k) => (k.from === a && k.to === b) || (k.from === b && k.to === a)), `"${lineRaw}": ${found[i]} ↔ ${found[i + 1]} fehlt`).toBe(true);
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
      if (row.ip.includes(":")) {
        // IPv6: Adresse + Präfix (/64) gegen `ipv6 address`, Desktop-Zeile oder Geräte-Label des Labs
        const want = `${row.ip}${row.subnetMask}`.toLowerCase();
        const have = ifc?.ipv6 ?? cfg.hostIpv6?.ip;
        if (have) expect(have.toLowerCase(), `${row.device} ${row.interface}`).toBe(want);
        else expect(l.topology.devices.map((x) => x.label).join(" ").toLowerCase(), `${row.device}: IPv6 nur im Geräte-Label erlaubt`).toContain(want);
        if (row.defaultGateway && row.defaultGateway !== "N/A" && !/^im Lab nicht angegeben/.test(row.defaultGateway)) {
          expect(cfg.hostIpv6?.gateway?.toLowerCase()).toBe(row.defaultGateway.toLowerCase());
        }
        continue;
      }
      // DHCP-Client: konkrete Adresse entsteht zur Laufzeit; Desktop steht auf DHCP, das Netz nennt der Lab-Text
      // DHCP-Client ohne Netzangabe im Lab: der Lab-Text lässt ihn die Adresse per ipconfig /renew beziehen
      if (row.ip === "DHCP (Netz im Lab nicht angegeben)") {
        const own = l.steps.flatMap((st) => (st.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>).filter((b) => expandDeviceNames(b.device).includes(row.device)).flatMap((b) => b.commands.map((c) => c.cmd))).join("\n");
        expect(own, `${row.device}: kein ipconfig /renew im Lab`).toContain("ipconfig /renew");
        continue;
      }
      const dhcp = /^DHCP \((\S+)\)$/.exec(row.ip);
      if (dhcp) {
        expect(cfg.hostDhcp || labDhcpPoolNetworks(l).has(dhcp[1]), `${row.device}: weder Desktop auf DHCP noch DHCP-Pool für ${dhcp[1]} im Lab`).toBe(true);
        expect(labNetworks(l), `${row.device}: Netz ${dhcp[1]} kommt im Lab nicht vor`).toContain(dhcp[1]);
        continue;
      }
      // Adresse, die das Lab nur in einem anderen Befehl nennt (z. B. `ntp server 10.0.0.10`)
      const referenced = /Adresse aus `([^`]+)`/.exec(row.description ?? "");
      if (referenced) {
        expect(allCommandText(l), `${row.device}: Befehl fehlt`).toContain(referenced[1]);
        expect(referenced[1], `${row.device}: Adresse nicht im Befehl`).toContain(row.ip);
        continue;
      }
      const prefix = row.subnetMask.split(".").reduce((a, o) => a + Number(o).toString(2).replace(/0/g, "").length, 0);
      if (!ifc?.ip && !cfg.hostIp) {
        // keine Interface-/Desktop-Konfiguration: Adresse nur im Geräte-Label des Labs ("PC0(1) (192.168.1.11/24)")
        expect(l.topology.devices.map((x) => x.label).join(" "), `${row.device}: Adresse nur im Geräte-Label erlaubt`).toContain(`(${row.ip}/${prefix})`);
        continue;
      }
      if (ifc?.ip) {
        expect(ifc.ip, `${row.device} ${row.interface}`).toBe(`${row.ip}/${prefix}`);
      } else {
        expect(cfg.hostIp?.ip, `${row.device} ${row.interface}: weder Interface- noch Desktop-Konfiguration`).toBe(row.ip);
        if (row.defaultGateway && row.defaultGateway !== "N/A" && !/^im Lab nicht angegeben/.test(row.defaultGateway)) expect(cfg.hostIp?.gateway).toBe(row.defaultGateway);
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
      expect(d.interfaces.filter((i) => i.ipv6), `${d.name} hat IPv6 im Startzustand`).toEqual([]);
      expect(d.config?.vlans, d.name).toBeUndefined();
      expect(d.config?.hostname).toBe(d.name);
    }
  });

  it("CLI-Export enthält Befehle ohne Prompt für jedes Router-/Switch-Gerät", () => {
    for (const d of data.devices.filter((x) => !x.assumed && (x.type === "router" || x.type.startsWith("switch")))) {
      const cli = getLabDeviceCli(l, d.name);
      const configuredInLab = l.steps.some((st) => (st.blocks as Array<{ device: string }>).some((b) => expandDeviceNames(b.device).includes(d.name)));
      if (configuredInLab) expect(cli.length, d.name).toBeGreaterThan(0);
      else expect(cli, `${d.name}: im Lab nicht konfiguriert, kein erfundener Export`).toBe("");
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
      if (d.config?.ospfv3?.routerId) allowed.add(d.config.ospfv3.routerId); // OSPFv3-Router-ID aus dem Lab
      if (d.config?.eigrpv6?.routerId) allowed.add(d.config.eigrpv6.routerId); // EIGRPv6-Router-ID aus dem Lab
      // DHCP-Konfiguration des Geräts (Pool-Gateway, DNS, ausgeschlossene Bereiche) steht im Lab
      for (const pool of d.config?.dhcpPools ?? []) {
        if (pool.defaultRouter) allowed.add(pool.defaultRouter);
        for (const dns of pool.dnsServers ?? []) allowed.add(dns);
        if (pool.network) {
          const [net, p] = pool.network.split("/");
          allowed.add(net);
          allowed.add(cidrMask(Number(p)));
        }
      }
      // NAT-Konfiguration des Geräts (statische Zuordnungen, Pools) steht im Lab
      for (const st of d.config?.nat?.statics ?? []) {
        allowed.add(st.local);
        allowed.add(st.global);
      }
      for (const pl of d.config?.nat?.pools ?? []) {
        allowed.add(pl.start);
        allowed.add(pl.end);
      }
      for (const e of d.config?.dhcpExcluded ?? []) {
        allowed.add(e.from);
        allowed.add(e.to);
      }
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

  it("Rollen werden im Canvas angezeigt: SW2 Gi0/1 RP, Gi0/2 BLK, blockierter Link markiert", () => {
    const sw2 = topology.devices.find((d) => d.id === "sw2")!;
    expect(sw2.interfaces.find((i) => i.name === "Gi0/1")!.portRole).toBe("RP");
    expect(sw2.interfaces.find((i) => i.name === "Gi0/2")!.portRole).toBe("BLK");
    expect(topology.links.find((l) => l.id === "link-sw1-sw2-2")!.status).toBe("stp-blocking");
    expect(topology.links.find((l) => l.id === "link-sw1-sw2-1")!.status).toBe("up");
  });

  it("andere Labs ohne spanning-tree-Konfiguration zeigen keine Rollen", () => {
    const t = buildNetworkTopologyFromLab(lab("vtp-dtp"), CURATED_TOPOLOGIES["vtp-dtp"], "target").topology;
    expect(t.devices.flatMap((d) => d.interfaces).some((i) => i.portRole)).toBe(false);
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

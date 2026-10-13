import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { expandDeviceNames } from "@/components/labs/lab-to-network";

/**
 * Der Lab-Text (CLI-Befehle) ist die Quelle der Wahrheit. Die strukturierte Topologie
 * (Adressierungstabelle, Links, VLANs) muss dazu passen.
 */
const LAB_IDS = Object.keys(CURATED_TOPOLOGIES);

// Widersprüche im Lab-Text (z. B. ospf: Verbindungsliste vs. Konfiguration): die Konfiguration gilt.
const KNOWN_LAB_TEXT_CONTRADICTIONS = new Set<string>();

const shortIf = (name: string) =>
  name
    .toLowerCase()
    .replace("gigabitethernet", "gi")
    .replace("fastethernet", "fa")
    .replace(/\s*\(.*\)$/, "");

interface Cmd {
  device: string;
  cmd: string;
}

function commands(labId: string): Cmd[] {
  const lab = LABS.find((l) => l.id === labId)!;
  const out: Cmd[] = [];
  for (const step of lab.steps) {
    for (const block of step.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>) {
      for (const c of block.commands) out.push({ device: block.device, cmd: c.cmd });
    }
  }
  return out;
}

/** device|interface -> "ip mask" aus 'interface X' / 'ip address A M' */
function configuredAddresses(labId: string): Map<string, string> {
  const map = new Map<string, string>();
  const currentByDevice = new Map<string, string>();
  for (const { device, cmd } of commands(labId)) {
    let current: string | null = currentByDevice.get(device) ?? null;
    for (const raw of cmd.split("\n")) {
      const line = raw.trim();
      const im = /^interface\s+(\S+)(?:\s+(\d+))?/i.exec(line);
      if (im) {
        current = shortIf(/^(?:vlan|loopback)$/i.test(im[1]) && im[2] ? `${im[1]}${im[2]}` : im[1]);
        continue;
      }
      const am = /^ip address\s+(\S+)\s+(\S+)/i.exec(line);
      if (am && current) map.set(`${device}|${current}`, `${am[1]} ${am[2]}`);
    }
    if (current) currentByDevice.set(device, current);
  }
  return map;
}

/** device -> IP aus 'IP Address: x' bzw. 'IP-Adresse: x' (Packet-Tracer-Desktop); Mehrgeräteblöcke (PC1–PC5) der Reihe nach */
function pcAddresses(labId: string): Map<string, string> {
  const map = new Map<string, string>();
  const perBlock = new Map<string, string[]>();
  for (const { device, cmd } of commands(labId)) {
    const ips = [...cmd.matchAll(/IP(?: Address|-Adresse):\s*(\S+)/gi)].map((m) => m[1]);
    if (ips.length) perBlock.set(device, [...(perBlock.get(device) ?? []), ...ips]);
  }
  for (const [device, ips] of perBlock) {
    const names = expandDeviceNames(device);
    ips.forEach((ip, i) => {
      const name = names.length > 1 ? names[i] : names[0];
      if (name) map.set(name, ip);
    });
  }
  return map;
}

describe("Lab-Topologie entspricht dem Lab-Text (B-03)", () => {
  for (const id of LAB_IDS) {
    const lab = LABS.find((l) => l.id === id)!;
    const topo = lab.structuredTopology!;

    it(`${id}: Router-/Switch-Interfaces stimmen mit den ip-address-Befehlen überein`, () => {
      const cfg = configuredAddresses(id);
      for (const row of topo.addressingTable) {
        if (/pc|server/i.test(row.interface) || row.interface.startsWith("FastEthernet0")) continue;
        const key = `${row.device}|${shortIf(row.interface)}`;
        if (KNOWN_LAB_TEXT_CONTRADICTIONS.has(`${id}|${key}`)) continue;
        expect(cfg.has(key), `${id}: ${key} fehlt im Lab-Text`).toBe(true);
        expect(`${row.ip} ${row.subnetMask}`, key).toBe(cfg.get(key));
      }
    });

    it(`${id}: PC-Adressen stimmen mit den Desktop-Einstellungen überein`, () => {
      const pcs = pcAddresses(id);
      for (const [device, ip] of pcs) {
        const row = topo.addressingTable.find((r) => r.device === device && r.interface.startsWith("FastEthernet"));
        expect(row, `${id}: ${device} fehlt in der Adressierungstabelle`).toBeDefined();
        expect(row!.ip, `${id}: ${device}`).toBe(ip);
      }
    });

    it(`${id}: jede IP der Tabelle kommt im Lab-Text vor`, () => {
      const text = commands(id).map((c) => c.cmd).join("\n");
      for (const row of topo.addressingTable) {
        expect(text, `${id}: ${row.device} ${row.interface}`).toContain(row.ip);
      }
    });
  }

  it("vlan-trunking: nur VLANs, die das Lab anlegt (10 SALES, 20 HR), kein VLAN 99", () => {
    const topo = LABS.find((l) => l.id === "vlan-trunking")!.structuredTopology!;
    expect(topo.vlans!.map((v) => [v.id, v.name])).toEqual([
      [10, "SALES"],
      [20, "HR"],
    ]);
    expect(topo.addressingTable.some((r) => /vlan99/i.test(r.interface))).toBe(false);
    const names = topo.devices.map((d) => d.name).sort();
    expect(names).toEqual(["PC0", "PC1", "PC2", "PC3", "SW1", "SW2"]);
  });

  it("roas: PCs hängen an Fa0/1 und Fa0/2, VLAN-Namen wie im Lab, kein Switch-SVI", () => {
    const topo = LABS.find((l) => l.id === "roas")!.structuredTopology!;
    const ports = topo.links.filter((l) => l.fromPort.startsWith("Fa")).map((l) => l.fromPort);
    expect(ports).toEqual(["Fa0/1", "Fa0/2"]);
    expect(topo.vlans!.map((v) => v.name)).toEqual(["VLAN10", "VLAN20"]);
    expect(topo.addressingTable.some((r) => /svi/i.test(r.interface))).toBe(false);
  });

  it("basic-ip: PC1 hat 192.168.1.20", () => {
    const topo = LABS.find((l) => l.id === "basic-ip")!.structuredTopology!;
    expect(topo.addressingTable.find((r) => r.device === "PC1")!.ip).toBe("192.168.1.20");
  });

  it("ospf: Transitnetze der Legende sind die echten /30-Netze", () => {
    const topo = LABS.find((l) => l.id === "ospf")!.structuredTopology!;
    expect(JSON.stringify(topo.vlans)).not.toContain("10.0.0.0/24");
  });

  it("ospf: Router-Modell hat die verwendeten Gi-Ports (2911: Gi0/0-0/2)", () => {
    const topo = LABS.find((l) => l.id === "ospf")!.structuredTopology!;
    for (const d of topo.devices.filter((x) => x.type === "router")) expect(d.model).toMatch(/^Cisco 2911/);
  });
});

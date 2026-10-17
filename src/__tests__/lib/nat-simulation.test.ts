import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { simulatePing } from "@/lib/topology/simulation/packet-simulator";
import { formatNatTranslations, type NatTable } from "@/lib/topology/simulation/nat-simulation";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

function labTopology(id: string): NetworkTopology {
  const lab = LABS.find((l) => l.id === id)!;
  return buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], "target").topology;
}
const dev = (t: NetworkTopology, name: string): TopologyDevice => t.devices.find((d) => d.name === name)!;

function pinger(t: NetworkTopology) {
  const arpCache = {};
  const natTranslations: NatTable = {};
  const ping = (from: string, targetIp: string) =>
    simulatePing({ topology: t, sourceDeviceId: dev(t, from).id, targetIp, arpCache, natTranslations });
  return { ping, natTranslations };
}

describe("PAT (overload auf die Interface-Adresse)", () => {
  it("nat-pat: PC0 → 47.11.8.15 wird auf die Gi0/1-Adresse übersetzt und die Antwort zurück", () => {
    const t = labTopology("nat-pat");
    const { ping, natTranslations } = pinger(t);
    const r = ping("PC0", "47.11.8.15");
    expect(r.success).toBe(true);
    const out = r.forwardHops.find((h) => h.action === "nat-inside-to-outside")!;
    expect(out.reason).toMatch(/PAT, ICMP-ID 1 → 1/);
    expect(out.reason).toMatch(/list 1 interface Gi0\/1 overload; neuer Eintrag/);
    const back = r.returnHops.find((h) => h.action === "nat-outside-to-inside")!;
    expect(back.natTranslation?.afterIp).toBe("192.168.1.10");
    const entries = natTranslations[dev(t, "NAT-Router").id];
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ kind: "pat", insideLocal: "192.168.1.10", insideGlobal: out.natTranslation!.afterIp, globalPort: 1 });
  });

  it("vlan-dhcp-nat-roas: zweiter Host mit gleicher ICMP-ID erhält den nächsten freien Port", () => {
    const t = labTopology("vlan-dhcp-nat-roas");
    const { ping, natTranslations } = pinger(t);
    expect(ping("PC0", "47.11.8.15").success).toBe(true);
    expect(ping("PC3", "47.11.8.15").success).toBe(true);
    const entries = natTranslations[dev(t, "Router0").id];
    expect(entries.map((e) => [e.insideLocal, e.localPort, e.globalPort])).toEqual([
      ["192.168.10.2", 1, 1],
      ["192.168.10.3", 1, 2],
    ]);
  });

  it("ein erneuter Ping nutzt den bestehenden Eintrag", () => {
    const t = labTopology("nat-pat");
    const { ping, natTranslations } = pinger(t);
    ping("PC0", "47.11.8.15");
    const r = ping("PC0", "47.11.8.15");
    expect(r.forwardHops.find((h) => h.action === "nat-inside-to-outside")!.reason).toMatch(/bestehender Eintrag/);
    expect(natTranslations[dev(t, "NAT-Router").id]).toHaveLength(1);
  });
});

describe("Dynamisches NAT aus dem Pool", () => {
  it("dynamic-nat: niedrigste freie Pool-Adresse, danach von außen erreichbar", () => {
    const t = labTopology("dynamic-nat");
    const { ping, natTranslations } = pinger(t);
    expect(ping("Webserver", "200.0.0.10").success).toBe(false);
    expect(ping("PC0", "47.11.8.15").success).toBe(true);
    expect(natTranslations[dev(t, "NAT-Router").id][0]).toMatchObject({ kind: "dynamic", insideLocal: "192.168.1.10", insideGlobal: "200.0.0.10" });
    const r = ping("Webserver", "200.0.0.10");
    expect(r.success).toBe(true);
    expect(r.forwardHops.find((h) => h.action === "nat-outside-to-inside")!.reason).toMatch(/200\.0\.0\.10 → 192\.168\.1\.10 \(dynamisch/);
  });

  it("erschöpfter Pool: das Paket wird verworfen (nat-pool-exhausted)", () => {
    const t = labTopology("dynamic-nat");
    const { ping, natTranslations } = pinger(t);
    const natId = dev(t, "NAT-Router").id;
    natTranslations[natId] = ["200.0.0.10", "200.0.0.11", "200.0.0.12"].map((g, k) => ({
      kind: "dynamic" as const,
      protocol: "icmp" as const,
      insideLocal: `192.168.1.${50 + k}`,
      insideGlobal: g,
      outsideLocal: "47.11.8.15",
      outsideGlobal: "47.11.8.15",
      localPort: 1,
      globalPort: 1,
      rule: "list 1 pool PUBLIC-POOL",
    }));
    const r = ping("PC0", "47.11.8.15");
    expect(r.success).toBe(false);
    expect(r.allHops.find((h) => h.status === "dropped")?.dropReason).toBe("nat-pool-exhausted");
  });

  it("nat-pool-overload: PAT auf die erste Pool-Adresse", () => {
    const t = labTopology("nat-pool-overload");
    const { ping, natTranslations } = pinger(t);
    expect(ping("PC0", "47.11.8.15").success).toBe(true);
    expect(natTranslations[dev(t, "NAT-Router").id][0]).toMatchObject({ kind: "pat", insideGlobal: "200.0.0.1" });
  });
});

describe("show ip nat translations (Simulationszustand)", () => {
  it("formatiert PAT- und dynamische Einträge wie IOS", () => {
    const out = formatNatTranslations([
      { kind: "pat", protocol: "icmp", insideLocal: "192.168.10.3", insideGlobal: "200.0.0.1", outsideLocal: "47.11.8.15", outsideGlobal: "47.11.8.15", localPort: 1, globalPort: 2, rule: "" },
      { kind: "dynamic", protocol: "icmp", insideLocal: "192.168.1.10", insideGlobal: "200.0.0.10", outsideLocal: "47.11.8.15", outsideGlobal: "47.11.8.15", localPort: 1, globalPort: 1, rule: "" },
    ]);
    const lines = out.split("\n");
    expect(lines[0]).toMatch(/^Pro\s+Inside global\s+Inside local\s+Outside local\s+Outside global$/);
    expect(lines[1]).toMatch(/^icmp 200\.0\.0\.1:2\s+192\.168\.10\.3:1\s+47\.11\.8\.15:1\s+47\.11\.8\.15:2$/);
    expect(lines[3]).toMatch(/^---\s+200\.0\.0\.10\s+192\.168\.1\.10\s+---\s+---$/);
  });

  it("statisches NAT legt keine Einträge in der Simulationstabelle an", () => {
    const t = labTopology("static-nat");
    const { ping, natTranslations } = pinger(t);
    expect(ping("PC0", "47.11.8.15").success).toBe(true);
    expect(natTranslations[dev(t, "NAT-Router").id] ?? []).toHaveLength(0);
  });
});

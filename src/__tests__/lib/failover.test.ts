import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { analyzeFailover, applyFailoverAction, convergenceTimeline, type FailoverAction } from "@/lib/topology/failover";
import type { NetworkTopology, TopologyDevice, TopologyInterface, TopologyLink } from "@/types/topology";

const lab = (id: string): NetworkTopology => buildNetworkTopologyFromLab(LABS.find((l) => l.id === id)!, CURATED_TOPOLOGIES[id], "target").topology;
const dev = (t: NetworkTopology, name: string): TopologyDevice => t.devices.find((d) => d.name === name || d.config?.hostname === name)!;
const ifc = (t: NetworkTopology, d: string, i: string): TopologyInterface => dev(t, d).interfaces.find((x) => x.name === i)!;
const linkAt = (t: NetworkTopology, d: string, i: string): TopologyLink => {
  const device = dev(t, d);
  const iface = ifc(t, d, i);
  return t.links.find((l) => (l.sourceDeviceId === device.id && l.sourceInterfaceId === iface.id) || (l.targetDeviceId === device.id && l.targetInterfaceId === iface.id))!;
};
const shut = (t: NetworkTopology, d: string, i: string, on = true): FailoverAction => ({ kind: on ? "shutdown" : "no-shutdown", deviceId: dev(t, d).id, ifaceId: ifc(t, d, i).id });

function triangle(): NetworkTopology {
  const sw = (n: number, priority?: number): TopologyDevice => ({
    id: `sw${n}`,
    name: `SW${n}`,
    type: "switch-l2",
    x: n * 100,
    y: 0,
    interfaces: [1, 2].map((p) => ({ id: `sw${n}-gi${p}`, name: `Gi0/${p}`, status: "up" as const, mode: "trunk" as const })),
    config: { hostname: `SW${n}`, ...(priority ? { stp: { priority } } : {}) },
  });
  const link = (id: string, a: string, ai: string, b: string, bi: string): TopologyLink => ({
    id, sourceDeviceId: a, sourceInterfaceId: ai, targetDeviceId: b, targetInterfaceId: bi, linkType: "trunk", status: "up",
  });
  return {
    id: "t",
    name: "Dreieck",
    devices: [sw(1, 4096), sw(2), sw(3)],
    links: [link("l12", "sw1", "sw1-gi1", "sw2", "sw2-gi1"), link("l13", "sw1", "sw1-gi2", "sw3", "sw3-gi1"), link("l23", "sw2", "sw2-gi2", "sw3", "sw3-gi2")],
  } as NetworkTopology;
}

describe("Aktionen: Leitungszustand", () => {
  it("Verbindung trennen: beide Enden down, Link down; die Ausgangstopologie bleibt unverändert", () => {
    const t = lab("stp");
    const before = JSON.stringify(t);
    const link = linkAt(t, "SW2", "Gi0/1");
    const after = applyFailoverAction(t, { kind: "link-down", linkId: link.id });
    expect(JSON.stringify(t)).toBe(before);
    expect(after.links.find((l) => l.id === link.id)!.status).toBe("down");
    expect(ifc(after, "SW1", "Gi0/1").status).toBe("down");
    expect(ifc(after, "SW2", "Gi0/1").status).toBe("down");
    const back = applyFailoverAction(after, { kind: "link-up", linkId: link.id });
    expect(back.links.find((l) => l.id === link.id)!.status).toBe("up");
    expect(ifc(back, "SW2", "Gi0/1").status).toBe("up");
  });

  it("shutdown: eigenes Ende administratively down, Gegenseite down, Link admin-down; no shutdown stellt her", () => {
    const t = lab("eigrp");
    const up = applyFailoverAction(t, shut(t, "R1", "Gi0/2", false));
    expect(ifc(up, "R1", "Gi0/2").status).toBe("up");
    expect(ifc(up, "R3", "Gi0/1").status).toBe("up");
    expect(linkAt(up, "R1", "Gi0/2").status).toBe("up");
    const down = applyFailoverAction(up, shut(up, "R1", "Gi0/2"));
    expect(ifc(down, "R1", "Gi0/2").status).toBe("admin-down");
    expect(ifc(down, "R3", "Gi0/1").status).toBe("down");
    expect(linkAt(down, "R1", "Gi0/2").status).toBe("admin-down");
  });

  it("getrenntes Kabel bleibt down, auch wenn ein Ende no shutdown bekommt", () => {
    const t = lab("eigrp");
    const cut = applyFailoverAction(t, { kind: "link-down", linkId: linkAt(t, "R1", "Gi0/2").id });
    const noShut = applyFailoverAction(cut, shut(cut, "R1", "Gi0/2", false));
    expect(linkAt(noShut, "R1", "Gi0/2").status).toBe("down");
    expect(ifc(noShut, "R1", "Gi0/2").status).toBe("down");
  });

  it("Subinterfaces folgen dem physischen Interface (roas: Gi0/0 getrennt → Gi0/0.10 down)", () => {
    const t = lab("roas");
    const after = applyFailoverAction(t, { kind: "link-down", linkId: linkAt(t, "Router0", "Gi0/0").id });
    expect(ifc(after, "Router0", "Gi0/0.10").status).toBe("down");
    expect(ifc(after, "Router0", "Gi0/0.20").status).toBe("down");
  });

  it("STP-Anzeige wird neu berechnet: der blockierte Link wird nach dem Ausfall des Root-Links Forwarding", () => {
    const t = lab("stp");
    expect(linkAt(t, "SW2", "Gi0/2").status).toBe("stp-blocking");
    const after = applyFailoverAction(t, { kind: "link-down", linkId: linkAt(t, "SW2", "Gi0/1").id });
    expect(linkAt(after, "SW2", "Gi0/2").status).toBe("up");
    expect(ifc(after, "SW2", "Gi0/2").portRole).toBe("RP");
  });
});

describe("Vorher/Nachher", () => {
  it("eigrp: weggefallene bzw. geänderte Route nach shutdown Gi0/2", () => {
    const base = applyFailoverAction(lab("eigrp"), shut(lab("eigrp"), "R1", "Gi0/2", false));
    const a = analyzeFailover(base, [shut(base, "R1", "Gi0/2")]);
    expect(a.title).toBe("R1 Gi0/2: shutdown");
    const r = a.changes.find((c) => c.deviceName === "R1" && c.subject === "192.168.3.0/24")!;
    expect(r.kind).toBe("route-changed");
    expect(r.before).toMatch(/via 10\.0\.13\.2/);
    expect(r.after).toMatch(/via 10\.0\.12\.2/);
    const transit = a.changes.find((c) => c.deviceName === "R1" && c.subject === "10.0.13.0/30")!;
    expect(transit.kind).toBe("route-removed");
    expect(transit.before).toMatch(/^C 10\.0\.13\.0\/30/);
  });

  it("stp: Rollenwechsel Altn BLK → Root FWD", () => {
    const t = lab("stp");
    const a = analyzeFailover(t, [{ kind: "link-down", linkId: linkAt(t, "SW2", "Gi0/1").id }]);
    const c = a.changes.find((x) => x.kind === "stp-port" && x.deviceName === "SW2" && x.subject === "Gi0/2")!;
    expect([c.before, c.after]).toEqual(["Altn BLK 4", "Root FWD 4"]);
  });
});

describe("Konvergenz (vereinfachtes Modell)", () => {
  const timeOf = (t: NetworkTopology, actions: FailoverAction[], device: string, subject: string) => {
    const a = analyzeFailover(t, actions);
    const ev = convergenceTimeline(a.before, a.after, a.actions, a.changes, "realistisch");
    return ev.find((e) => e.change.deviceName === device && e.change.subject === subject && e.change.kind !== "interface");
  };

  it("Modus „sofort“: alle Änderungen bei t = 0", () => {
    const t = lab("stp");
    const a = analyzeFailover(t, [{ kind: "link-down", linkId: linkAt(t, "SW2", "Gi0/1").id }]);
    expect(convergenceTimeline(a.before, a.after, a.actions, a.changes, "sofort").every((e) => e.t === 0)).toBe(true);
  });

  it("STP 802.1D indirekter Ausfall: Max Age + 2 × Forward Delay = 50 s", () => {
    const t = triangle();
    const ev = timeOf(t, [{ kind: "link-down", linkId: "l12" }], "SW3", "Gi0/2")!;
    expect(ev.change.before).toBe("Altn BLK 4");
    expect(ev.change.after).toBe("Desg FWD 4");
    expect(ev.t).toBe(50);
  });

  it("RSTP (rapid-pvst auf allen Switches): direkter Ausfall sofort", () => {
    const t = lab("stp");
    for (const d of t.devices) if (d.type.startsWith("switch") && d.config) d.config.labCli = `${d.config.labCli ?? ""}\nspanning-tree mode rapid-pvst`;
    expect(timeOf(t, [{ kind: "link-down", linkId: linkAt(t, "SW2", "Gi0/1").id }], "SW2", "Gi0/2")!.t).toBe(0);
  });

  it("HSRP mit Lab-Timern 1/3: Kabel am Active getrennt → Hold Time 3 s; shutdown → sofort; Preempt-Rückkehr → Hello 1 s", () => {
    const base = lab("hsrp");
    for (const g of ifc(base, "R1", "Gi0/0").hsrp!.groups) delete g.track; // ohne das im Lab nicht verbundene Tracking-Interface
    const t = applyFailoverAction(base, shut(base, "R1", "Gi0/0", false));
    const cut = timeOf(t, [{ kind: "link-down", linkId: linkAt(t, "R1", "Gi0/0").id }], "R2", "Gi0/0 Gruppe 1")!;
    expect(cut.change.after).toMatch(/^Active/);
    expect(cut.t).toBe(3);
    expect(timeOf(t, [shut(t, "R1", "Gi0/0")], "R2", "Gi0/0 Gruppe 1")!.t).toBe(0);
    const down = applyFailoverAction(t, shut(t, "R1", "Gi0/0"));
    const back = timeOf(down, [shut(down, "R1", "Gi0/0", false)], "R1", "Gi0/0 Gruppe 1")!;
    expect(back.change.after).toMatch(/^Active/);
    expect(back.t).toBe(1);
  });

  it("EIGRP nach Wiederherstellung: erstes Hello (5 s)", () => {
    const t = lab("eigrp");
    expect(timeOf(t, [shut(t, "R1", "Gi0/2", false)], "R1", "192.168.3.0/24")!.t).toBe(5);
  });
});

import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";
import { findConnectedLinkForInterface, simulatePing } from "@/lib/topology/simulation/packet-simulator";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

function labTopology(id: string): NetworkTopology {
  const lab = LABS.find((l) => l.id === id)!;
  return buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[id], "target").topology;
}
const dev = (t: NetworkTopology, name: string): TopologyDevice => t.devices.find((d) => d.name === name)!;

describe("Subinterface-Link-Suche", () => {
  it("Gi0/0.10 hängt am Link von Gi0/0 (roas)", () => {
    const t = labTopology("roas");
    const r0 = dev(t, "Router0");
    const sub = r0.interfaces.find((i) => i.name === "Gi0/0.10")!;
    const conn = findConnectedLinkForInterface(t, r0.id, sub.id);
    expect(conn?.remoteDevice.name).toBe("Switch0");
    expect(conn?.remoteIface.name).toBe("Gi0/1");
  });

  it("Ports ohne eindeutigen Namen („–“) werden über die ID zugeordnet, nicht über den Namen", () => {
    const t = labTopology("co-acl-nat-isp");
    const net = dev(t, "Internet-Segment");
    const seen = new Set<string>();
    for (const i of net.interfaces) {
      const conn = findConnectedLinkForInterface(t, net.id, i.id);
      if (conn) seen.add(conn.remoteDevice.name);
    }
    // jeder Port führt zu einem anderen Gerät
    expect(seen.size).toBe(net.interfaces.filter((i) => findConnectedLinkForInterface(t, net.id, i.id)).length);
    expect(seen.has("WEB-1")).toBe(true);
    expect(seen.has("ISP-MUMBAI")).toBe(true);
  });
});

describe("VLAN-Tag über Trunks", () => {
  it("roas: Frame trägt das 802.1Q-Tag des Subinterfaces, der Router empfängt auf Gi0/0.10 und sendet auf Gi0/0.20", () => {
    const t = labTopology("roas");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC0").id, targetIp: "192.168.20.10" });
    expect(r.success).toBe(true);
    const route = r.forwardHops.find((h) => h.action === "route" && h.deviceName === "Router0")!;
    expect(route.inInterface).toBe("Gi0/0.10");
    expect(route.outInterface).toBe("Gi0/0.20");
    expect(r.forwardHops.some((h) => h.action === "switch" && /802\.1Q-Tag 10/.test(h.reason))).toBe(true);
    expect(r.forwardHops.some((h) => h.action === "switch" && h.inInterface === "Gi0/1" && /VLAN 20/.test(h.reason))).toBe(true);
  });

  it("vlan-trunking: gleiches VLAN über den Trunk erreichbar, anderes VLAN ohne Router nicht", () => {
    const t = labTopology("vlan-trunking");
    const pc0 = dev(t, "PC0").id;
    expect(simulatePing({ topology: t, sourceDeviceId: pc0, targetIp: "192.168.10.20" }).success).toBe(true);
    expect(simulatePing({ topology: t, sourceDeviceId: pc0, targetIp: "192.168.20.10" }).success).toBe(false);
  });

  it("vtp-dtp: desirable ↔ trunk nonegotiate ergibt keinen Trunk (gemeinsame DTP-Auswertung)", () => {
    const t = labTopology("vtp-dtp");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC0").id, targetIp: "192.168.10.20" });
    expect(r.success).toBe(false);
    expect(r.allHops.find((h) => h.status === "dropped")?.dropReason).toBe("vlan-mismatch");
  });
});

describe("Quell-IP von Router-Pings", () => {
  it("Router nimmt die Adresse des Ausgangsinterfaces (drill-interfaces R1 → 10.0.0.2: Quelle 10.0.0.1)", () => {
    const t = labTopology("drill-interfaces");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "R1").id, targetIp: "10.0.0.2" });
    expect(r.success).toBe(true);
    expect(r.forwardHops[0].packet.srcIp).toBe("10.0.0.1");
  });

  it("ping … source <ip>: gültige Adresse wird verwendet", () => {
    const t = labTopology("drill-interfaces");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "R1").id, targetIp: "10.0.0.2", sourceIp: "192.168.10.1" });
    expect(r.forwardHops[0].packet.srcIp).toBe("192.168.10.1");
  });

  it("ping … source <ip>: fremde Adresse ist ungültig (IOS: Invalid source address)", () => {
    const t = labTopology("co-acl-nat-isp");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "CO-1").id, targetIp: "200.10.20.20", sourceIp: "192.168.10.1" });
    expect(r.success).toBe(false);
    expect(r.status).toBe("invalid-source");
    expect(r.iosSummary).toBe("% Invalid source address");
  });
});

describe("STP-bewusste Egress-Auswahl", () => {
  it("stp: der Weg nutzt den Forwarding-Link Gi0/1, nicht den blockierten Gi0/2", () => {
    const t = labTopology("stp");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC0").id, targetIp: "192.168.1.20" });
    expect(r.success).toBe(true);
    const sw1 = r.forwardHops.find((h) => h.action === "switch" && h.deviceName === "SW1")!;
    expect(sw1.outInterface).toBe("Gi0/1");
  });
});

describe("Link-ID je Hop (Pfad-Hervorhebung)", () => {
  it("jeder weiterleitende Hop trägt die ID des tatsächlich genutzten Links, auch bei Ports ohne Namen", () => {
    const t = labTopology("co-acl-nat-isp");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "VPC-9").id, targetIp: "200.10.20.20" });
    expect(r.success).toBe(true);
    const forwarding = r.allHops.filter((h) => h.action === "switch" || h.action === "route" || h.action === "originate");
    for (const h of forwarding) {
      expect(h.linkId, `${h.deviceName} ${h.action}`).toBeTruthy();
      const link = t.links.find((l) => l.id === h.linkId)!;
      expect([link.sourceDeviceId, link.targetDeviceId]).toContain(h.deviceId);
    }
  });
});

describe("SVIs als L3-Endpunkt der VLAN-Domäne", () => {
  it("ivr-svi: Eingang über Gi1/0/1 landet auf Vlan10, Ausgang über Vlan20 läuft per L2 zu PC-Mrkt", () => {
    const t = labTopology("ivr-svi");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC-Sales").id, targetIp: "192.168.20.1" });
    expect(r.success).toBe(true);
    const route = r.forwardHops.find((h) => h.action === "route" && h.deviceName === "MLS1")!;
    expect(route.inInterface).toBe("Vlan10");
    expect(route.outInterface).toBe("Vlan20");
    const l2 = r.forwardHops.find((h) => h.action === "switch" && h.deviceName === "MLS1")!;
    expect(l2.inInterface).toBe("Vlan20");
    expect(l2.outInterface).toBe("Gi1/0/2");
  });

  it("Ping auf das SVI selbst endet am SVI (basic-ip: Switch0 Vlan1)", () => {
    const t = labTopology("basic-ip");
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC0").id, targetIp: "192.168.1.2" });
    expect(r.success).toBe(true);
    expect(r.forwardHops[r.forwardHops.length - 1].inInterface).toBe("Vlan1");
  });

  it("Autostate: ohne aktiven Port im VLAN ist das SVI down", () => {
    const t = labTopology("ivr-svi");
    const port = dev(t, "MLS1").interfaces.find((i) => i.name === "Gi1/0/2")!;
    port.isShutdown = true;
    port.status = "admin-down";
    const r = simulatePing({ topology: t, sourceDeviceId: dev(t, "PC-Sales").id, targetIp: "192.168.20.1" });
    expect(r.success).toBe(false);
    expect(r.allHops.find((h) => h.status === "dropped")?.reason).toMatch(/Vlan20 auf MLS1 ist down/);
  });
});

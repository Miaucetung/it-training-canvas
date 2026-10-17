import { describe, it, expect } from "vitest";
import {
  simulatePing,
  getSymbolicMac,
  clearArpCache,
} from "@/lib/topology/simulation/packet-simulator";
import type { NetworkTopology, TopologyDevice, TopologyLink } from "@/types/topology";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab } from "@/components/labs/lab-to-network";

function createSimpleTopology(): NetworkTopology {
  const pc1: TopologyDevice = {
    id: "pc1",
    name: "PC1",
    type: "pc",
    x: 100,
    y: 100,
    interfaces: [{ id: "pc1-eth0", name: "Eth0", status: "up", ip: "192.168.1.10/24" }],
    config: { hostname: "PC1", defaultGateway: "192.168.1.1" },
  };

  const r1: TopologyDevice = {
    id: "r1",
    name: "R1",
    type: "router",
    x: 300,
    y: 100,
    interfaces: [
      { id: "r1-gi00", name: "Gi0/0", status: "up", ip: "192.168.1.1/24" },
      { id: "r1-gi01", name: "Gi0/1", status: "up", ip: "10.0.0.1/30" },
    ],
    config: {
      hostname: "R1",
      ipRoutes: [{ network: "192.168.2.0/24", nextHop: "10.0.0.2", outInterface: "Gi0/1" }],
    },
  };

  const r2: TopologyDevice = {
    id: "r2",
    name: "R2",
    type: "router",
    x: 500,
    y: 100,
    interfaces: [
      { id: "r2-gi00", name: "Gi0/0", status: "up", ip: "10.0.0.2/30" },
      { id: "r2-gi01", name: "Gi0/1", status: "up", ip: "192.168.2.1/24" },
    ],
    config: {
      hostname: "R2",
      ipRoutes: [{ network: "192.168.1.0/24", nextHop: "10.0.0.1", outInterface: "Gi0/0" }],
    },
  };

  const pc2: TopologyDevice = {
    id: "pc2",
    name: "PC2",
    type: "pc",
    x: 700,
    y: 100,
    interfaces: [{ id: "pc2-eth0", name: "Eth0", status: "up", ip: "192.168.2.10/24" }],
    config: { hostname: "PC2", defaultGateway: "192.168.2.1" },
  };

  const links: TopologyLink[] = [
    {
      id: "l1",
      sourceDeviceId: "pc1",
      sourceInterfaceId: "pc1-eth0",
      targetDeviceId: "r1",
      targetInterfaceId: "r1-gi00",
      linkType: "ethernet",
      status: "up",
    },
    {
      id: "l2",
      sourceDeviceId: "r1",
      sourceInterfaceId: "r1-gi01",
      targetDeviceId: "r2",
      targetInterfaceId: "r2-gi00",
      linkType: "ethernet",
      status: "up",
    },
    {
      id: "l3",
      sourceDeviceId: "r2",
      sourceInterfaceId: "r2-gi01",
      targetDeviceId: "pc2",
      targetInterfaceId: "pc2-eth0",
      linkType: "ethernet",
      status: "up",
    },
  ];

  return {
    id: "test-topo",
    name: "Test",
    version: "2.0",
    devices: [pc1, r1, r2, pc2],
    links,
  };
}

describe("Symbolische MAC-Adressen (Vorgabe 4)", () => {
  it("erzeugt 'MAC(Gerät Interface)' wenn keine explizite MAC existiert", () => {
    const topo = createSimpleTopology();
    const r1 = topo.devices.find((d) => d.id === "r1")!;
    expect(getSymbolicMac(r1, "Gi0/0")).toBe("MAC(R1 Gi0/0)");
  });

  it("nutzt explizite MAC wenn sie in den Daten steht", () => {
    const topo = createSimpleTopology();
    const r1 = topo.devices.find((d) => d.id === "r1")!;
    r1.interfaces[0].mac = "0050.7966.1111";
    expect(getSymbolicMac(r1, "Gi0/0")).toBe("0050.7966.1111");
  });
});

describe("ARP-Verhalten (Vorgabe 5)", () => {
  it("Cisco-Router als Quelle verliert erstes Echo (.!!!!) während ARP-Auflösung", () => {
    const topo = createSimpleTopology();
    const arpCache = clearArpCache();

    // R1 pingt R2 direkt (10.0.0.2)
    const res = simulatePing({
      topology: topo,
      sourceDeviceId: "r1",
      targetDeviceId: "r2",
      arpCache,
    });

    expect(res.success).toBe(true);
    expect(res.iosSummary).toBe(".!!!!");
    expect(res.arpResolvedThisRun).toBe(true);
    expect(res.routerArpLoss).toBe(true);
    expect(arpCache["r1"]["10.0.0.2"]).toBe("MAC(R2 Gi0/0)");
  });

  it("PC als Quelle hält Paket während eigener ARP-Auflösung zurück (kein Paketverlust, !!!!!)", () => {
    // 2 PCs direkt im selben Subnetz
    const pcA: TopologyDevice = {
      id: "pca",
      name: "PC-A",
      type: "pc",
      x: 100,
      y: 100,
      interfaces: [{ id: "pca-eth0", name: "Eth0", status: "up", ip: "192.168.1.10/24" }],
      config: { hostname: "PC-A" },
    };
    const pcB: TopologyDevice = {
      id: "pcb",
      name: "PC-B",
      type: "pc",
      x: 300,
      y: 100,
      interfaces: [{ id: "pcb-eth0", name: "Eth0", status: "up", ip: "192.168.1.20/24" }],
      config: { hostname: "PC-B" },
    };
    const link: TopologyLink = {
      id: "l-pc",
      sourceDeviceId: "pca",
      sourceInterfaceId: "pca-eth0",
      targetDeviceId: "pcb",
      targetInterfaceId: "pcb-eth0",
      linkType: "ethernet",
      status: "up",
    };
    const lanTopo: NetworkTopology = {
      id: "lan-topo",
      name: "LAN",
      version: "2.0",
      devices: [pcA, pcB],
      links: [link],
    };

    const arpCache = clearArpCache();
    const res = simulatePing({
      topology: lanTopo,
      sourceDeviceId: "pca",
      targetDeviceId: "pcb",
      arpCache,
    });

    expect(res.success).toBe(true);
    // PC puffert Paket: Erfolgsrate 100%, kein Verlust!
    expect(res.iosSummary).toBe("!!!!!");
    expect(res.arpResolvedThisRun).toBe(true);
    expect(res.routerArpLoss).toBe(false);
    expect(arpCache["pca"]["192.168.1.20"]).toBe("MAC(PC-B Eth0)");
  });

  it("PC über Router: Wenn Router ARP auflösen muss, geht das erste Echo verloren (.!!!!)", () => {
    const topo = createSimpleTopology();
    const arpCache = clearArpCache();

    // 1. Lauf: PC1 -> PC2 (R1 & R2 müssen ARP auflösen) -> .!!!!
    const res1 = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
      arpCache,
    });

    expect(res1.success).toBe(true);
    expect(res1.iosSummary).toBe(".!!!!");
    expect(res1.arpResolvedThisRun).toBe(true);
    expect(res1.routerArpLoss).toBe(true);

    // 2. Lauf: Aufgelöster ARP-Cache -> alle 5 Echos erfolgreich (!!!!!)
    const res2 = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
      arpCache,
    });

    expect(res2.success).toBe(true);
    expect(res2.iosSummary).toBe("!!!!!");
    expect(res2.arpResolvedThisRun).toBe(false);
    expect(res2.routerArpLoss).toBe(false);
  });
});

describe("Fehlerursachen & Drop-Gründe", () => {
  it("erkennt fehlendes Default Gateway (no-gateway)", () => {
    const topo = createSimpleTopology();
    const pc1 = topo.devices.find((d) => d.id === "pc1")!;
    delete pc1.config!.defaultGateway;

    const res = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
    });

    expect(res.success).toBe(false);
    expect(res.forwardHops[0].dropReason).toBe("no-gateway");
  });

  it("erkennt Default Gateway im falschen Subnetz (wrong-subnet)", () => {
    const topo = createSimpleTopology();
    const pc1 = topo.devices.find((d) => d.id === "pc1")!;
    pc1.config!.defaultGateway = "192.168.99.1";

    const res = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
    });

    expect(res.success).toBe(false);
    expect(res.forwardHops[0].dropReason).toBe("wrong-subnet");
  });

  it("erkennt fehlende Route im Router (no-route)", () => {
    const topo = createSimpleTopology();
    const r1 = topo.devices.find((d) => d.id === "r1")!;
    r1.config!.ipRoutes = []; // Route zu 192.168.2.0/24 entfernt

    const res = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
    });

    expect(res.success).toBe(false);
    expect(res.status).toBe("no-route");
    expect(res.iosSummary).toBe("U.U.U");
  });

  it("erkennt deaktiviertes Interface (interface-down)", () => {
    const topo = createSimpleTopology();
    topo.links[0].status = "down";

    const res = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
    });

    expect(res.success).toBe(false);
    const dropHop = res.forwardHops.find((h) => h.status === "dropped");
    expect(dropHop?.dropReason).toBe("interface-down");
  });
});

describe("Cisco NAT Order of Operations (Vorgabe 1)", () => {
  function createNatTopology(): NetworkTopology {
    // Host (192.168.1.10) -> [Gi0/0 inside] Router [Gi0/1 outside] (203.0.113.1) -> Server (203.0.113.100)
    const host: TopologyDevice = {
      id: "host",
      name: "Host",
      type: "pc",
      x: 100,
      y: 100,
      interfaces: [{ id: "host-eth0", name: "Eth0", status: "up", ip: "192.168.1.10/24" }],
      config: { hostname: "Host", defaultGateway: "192.168.1.1" },
    };

    const router: TopologyDevice = {
      id: "r1",
      name: "R1",
      type: "router",
      x: 300,
      y: 100,
      interfaces: [
        { id: "r1-gi00", name: "Gi0/0", status: "up", ip: "192.168.1.1/24" },
        { id: "r1-gi01", name: "Gi0/1", status: "up", ip: "203.0.113.1/24" },
      ],
      config: {
        hostname: "R1",
        nat: {
          insideInterfaces: ["Gi0/0"],
          outsideInterfaces: ["Gi0/1"],
          statics: [
            {
              local: "192.168.1.10",
              global: "203.0.113.50",
            },
          ],
          pools: [],
          rules: [],
        },
      },
    };

    const server: TopologyDevice = {
      id: "srv",
      name: "Server",
      type: "server",
      x: 500,
      y: 100,
      interfaces: [{ id: "srv-eth0", name: "Eth0", status: "up", ip: "203.0.113.100/24" }],
      config: { hostname: "Server", defaultGateway: "203.0.113.1" },
    };

    const links: TopologyLink[] = [
      {
        id: "l1",
        sourceDeviceId: "host",
        sourceInterfaceId: "host-eth0",
        targetDeviceId: "r1",
        targetInterfaceId: "r1-gi00",
        linkType: "ethernet",
        status: "up",
      },
      {
        id: "l2",
        sourceDeviceId: "r1",
        sourceInterfaceId: "r1-gi01",
        targetDeviceId: "srv",
        targetInterfaceId: "srv-eth0",
        linkType: "ethernet",
        status: "up",
      },
    ];

    return {
      id: "nat-topo",
      name: "NAT Topology",
      version: "2.0",
      devices: [host, router, server],
      links,
    };
  }

  it("Inside → Outside: Ausgangs-ACL sieht die übersetzte globale Adresse (203.0.113.50)", () => {
    const topo = createNatTopology();
    const router = topo.devices.find((d) => d.id === "r1")!;

    // Ausgangs-ACL auf Gi0/1 (Outbound):
    // Test A: Erlaubt explizit die übersetzte Adresse 203.0.113.50 -> Ping muss durchgehen
    router.interfaces[1].outboundAcl = "OUT_ACL";
    router.config!.accessLists = {
      OUT_ACL: [
        "permit ip host 203.0.113.50 any",
        "deny ip any any",
      ],
    };

    const resPermit = simulatePing({
      topology: topo,
      sourceDeviceId: "host",
      targetDeviceId: "srv",
    });

    expect(resPermit.success).toBe(true);

    // Test B: Ausgangs-ACL prüft auf die unübersetzte private Adresse 192.168.1.10.
    // Da Inside->Outside NAT VOR der Ausgangs-ACL übersetzt, sieht die Ausgangs-ACL
    // nur 203.0.113.50 und muss das Paket verwerfen (deny ip any any greift)!
    router.config!.accessLists = {
      OUT_ACL: [
        "permit ip host 192.168.1.10 any",
        "deny ip any any",
      ],
    };

    const resDeny = simulatePing({
      topology: topo,
      sourceDeviceId: "host",
      targetDeviceId: "srv",
    });

    expect(resDeny.success).toBe(false);
    const dropHop = resDeny.forwardHops.find((h) => h.status === "dropped");
    expect(dropHop?.dropReason).toBe("acl-deny");
  });

  it("Outside → Inside: Eingangs-ACL sieht die unübersetzte globale Ziel-Adresse", () => {
    const topo = createNatTopology();
    const router = topo.devices.find((d) => d.id === "r1")!;

    // Eingangs-ACL auf Gi0/1 (Inbound aus Sicht von Server Richtung NAT):
    // Test A: Erlaubt unübersetzte Public-IP 203.0.113.50 -> Erlaubt
    router.interfaces[1].inboundAcl = "IN_ACL";
    router.config!.accessLists = {
      IN_ACL: [
        "permit ip any host 203.0.113.50",
        "deny ip any any",
      ],
    };

    // Server pingt die öffentliche NAT-IP 203.0.113.50 an
    const resPermit = simulatePing({
      topology: topo,
      sourceDeviceId: "srv",
      targetIp: "203.0.113.50",
    });

    expect(resPermit.success).toBe(true);

    // Test B: Eingangs-ACL prüft auf die private Adresse 192.168.1.10.
    // Da Outside->Inside NAT erst NACH der Eingangs-ACL übersetzt, sieht die
    // Eingangs-ACL noch 203.0.113.50 und muss verwerfen!
    router.config!.accessLists = {
      IN_ACL: [
        "permit ip any host 192.168.1.10",
        "deny ip any any",
      ],
    };

    const resDeny = simulatePing({
      topology: topo,
      sourceDeviceId: "srv",
      targetIp: "203.0.113.50",
    });

    expect(resDeny.success).toBe(false);
    const dropHop = resDeny.forwardHops.find((h) => h.status === "dropped");
    expect(dropHop?.dropReason).toBe("acl-deny");
  });
});

describe("TTL Expiration & STP Blocking", () => {
  it("verwirft Paket wenn TTL auf 0 dekrementiert wird", () => {
    const topo = createSimpleTopology();
    const res = simulatePing({
      topology: topo,
      sourceDeviceId: "pc1",
      targetDeviceId: "pc2",
      ttl: 1, // Startet mit TTL 1 -> wird auf R1 auf 0 dekrementiert
    });

    expect(res.success).toBe(false);
    expect(res.forwardHops.some((h) => h.dropReason === "ttl-expired")).toBe(true);
  });
});

describe("Lab-Topologien & Orakel-Prüfung", () => {
  it("acl-standard Lab: PC0 (192.168.1.10) erreicht Server, PC1 (192.168.2.10) wird geblockt", () => {
    const labData = LABS.find((l) => l.id === "acl-standard")!;
    const cur = CURATED_TOPOLOGIES["acl-standard"];
    const { topology } = buildNetworkTopologyFromLab(labData, cur, "target");

    const pc0 = topology.devices.find((d) => d.name === "PC0")!;
    const pc1 = topology.devices.find((d) => d.name === "PC1")!;
    const server = topology.devices.find((d) => d.name === "Server")!;

    // 1. PC0 -> Server: per ACL 10 permit 192.168.1.0 0.0.0.255 erlaubt!
    const resPC0 = simulatePing({
      topology,
      sourceDeviceId: pc0.id,
      targetDeviceId: server.id,
    });
    expect(resPC0.success).toBe(true);

    // 2. PC1 -> Server: per ACL 10 deny 192.168.2.0 0.0.0.255 geblockt!
    const resPC1 = simulatePing({
      topology,
      sourceDeviceId: pc1.id,
      targetDeviceId: server.id,
    });
    expect(resPC1.success).toBe(false);
    const dropHop = resPC1.forwardHops.find((h) => h.status === "dropped");
    expect(dropHop?.dropReason).toBe("acl-deny");
  });

  it("co-acl-nat-isp Lab: VPC-9 darf WEB-1 anpingen, aber nicht SERVER-1", () => {
    const labData = LABS.find((l) => l.id === "co-acl-nat-isp")!;
    const cur = CURATED_TOPOLOGIES["co-acl-nat-isp"];
    const { topology } = buildNetworkTopologyFromLab(labData, cur, "target");

    const vpc9 = topology.devices.find((d) => d.name === "VPC-9")!;
    const web1 = topology.devices.find((d) => d.name === "WEB-1")!;
    const srv1 = topology.devices.find((d) => d.name === "SERVER-1")!;

    // 1. VPC-9 -> WEB-1: ACL in-out erlaubt ICMP echo zu 200.10.20.20
    const resWeb1 = simulatePing({
      topology,
      sourceDeviceId: vpc9.id,
      targetDeviceId: web1.id,
    });
    const forwardOk = resWeb1.forwardHops.length > 0 && !resWeb1.forwardHops.some((h) => h.status === "dropped");
    expect(forwardOk).toBe(true);

    // 2. VPC-9 -> SERVER-1 (200.10.20.40): In ACL in-out ist nur TCP 80/443 für R-PC erlaubt, ICMP von VPC-9 wird verworfen
    const resSrv1 = simulatePing({
      topology,
      sourceDeviceId: vpc9.id,
      targetDeviceId: srv1.id,
    });
    expect(resSrv1.success).toBe(false);
    expect(resSrv1.forwardHops.some((h) => h.dropReason === "acl-deny")).toBe(true);
  });
});


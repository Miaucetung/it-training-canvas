import type { LabTopologyData } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/** Paket 2 (Teil 2): OSPF-Varianten, EIGRP und die beiden Drills. Portkonvention siehe routing-labs.ts. */
const R = "Cisco 2911";
const SW = "Catalyst 2960";
const PC = "PC-PT";

export const ROUTING_MORE_TOPOLOGIES: Record<string, LabTopologyData> = {
  // ─────────────────────────────────────────────────────────────
  // OSPF Single-Area: Loopback-RID & Wildcard (ospf-rid-wildcard)
  // ─────────────────────────────────────────────────────────────
  "ospf-rid-wildcard": {
    viewBox: { width: 940, height: 560 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 200, 100),
      device("r2", "R2", R, "router", "gateway", 470, 100),
      device("r3", "R3", R, "router", "gateway", 740, 100),
      endpoint("pc-l", "PC-links", PC, "pc", 200, 320),
      endpoint("pc-r", "PC-rechts", PC, "pc", 740, 320),
    ],
    zones: [
      zone("zone-lan1", "LAN 192.168.1.0/24", "emerald", 80, 240, 240, 200),
      zone("zone-lan4", "LAN 192.168.4.0/24", "amber", 620, 240, 240, 200),
    ],
    vlans: [
      { id: 1, name: "LAN links", colorTheme: "emerald", subnet: "192.168.1.0/24" },
      { id: 4, name: "LAN rechts", colorTheme: "amber", subnet: "192.168.4.0/24" },
    ],
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/2", {
        cableType: "copper-cross",
        fromIp: "192.168.10.1",
        toIp: "192.168.10.2",
        subnetLabel: "192.168.10.0/30",
        subnetLabelPos: { x: 335, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r2-r3", "r2", "Gi0/1", "r3", "Gi0/2", {
        cableType: "copper-cross",
        fromIp: "192.168.20.1",
        toIp: "192.168.20.2",
        subnetLabel: "192.168.20.0/30",
        subnetLabelPos: { x: 605, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r1-pcl", "r1", "Gi0/0", "pc-l", "Fa0", { fromIp: "192.168.1.254", toIp: "192.168.1.11", fromPortOffset: 66, toPortOffset: 60, toPortSide: 14 }),
      link("link-r3-pcr", "r3", "Gi0/0", "pc-r", "Fa0", { fromIp: "192.168.4.254", toIp: "192.168.4.11", fromPortOffset: 66, toPortOffset: 60, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Lo0", "1.1.1.1", "255.255.255.255", "Loopback", "Router-ID R1"),
      ifRow("R1", "Gi0/0", "192.168.1.254", "255.255.255.0", "LAN links", "passive-interface"),
      ifRow("R1", "Gi0/1", "192.168.10.1", "255.255.255.252", "Transit", "Link zu R2 Gi0/2"),
      ifRow("R2", "Lo0", "2.2.2.2", "255.255.255.255", "Loopback", "Router-ID R2"),
      ifRow("R2", "Gi0/2", "192.168.10.2", "255.255.255.252", "Transit", "Link zu R1 Gi0/1"),
      ifRow("R2", "Gi0/1", "192.168.20.1", "255.255.255.252", "Transit", "Link zu R3 Gi0/2"),
      ifRow("R3", "Lo0", "3.3.3.3", "255.255.255.255", "Loopback", "Router-ID R3"),
      ifRow("R3", "Gi0/2", "192.168.20.2", "255.255.255.252", "Transit", "Link zu R2 Gi0/1"),
      ifRow("R3", "Gi0/0", "192.168.4.254", "255.255.255.0", "LAN rechts", "passive-interface"),
      tableRow("PC-links", "FastEthernet0", "192.168.1.11", "255.255.255.0", "192.168.1.254", "LAN links", "Host an R1 Gi0/0"),
      tableRow("PC-rechts", "FastEthernet0", "192.168.4.11", "255.255.255.0", "192.168.4.254", "LAN rechts", "Host an R3 Gi0/0"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // OSPF Multi-Area (ospf-multiarea)
  // ─────────────────────────────────────────────────────────────
  "ospf-multiarea": {
    viewBox: { width: 760, height: 430 },
    devices: [
      device("r1", "R1", `${R} · Area 0`, "router", "gateway", 160, 100),
      device("r2", "R2", `${R} · ABR`, "router", "gateway", 380, 100),
      device("r3", "R3", `${R} · Area 1`, "router", "gateway", 600, 100),
      endpoint("pc0", "PC0", PC, "pc", 160, 300),
      endpoint("pc1", "PC1", PC, "pc", 600, 300),
    ],
    zones: [
      zone("zone-lan1", "LAN 192.168.1.0/24 · Area 0", "emerald", 40, 230, 240, 170),
      zone("zone-lan3", "LAN 192.168.3.0/24 · Area 1", "amber", 480, 230, 240, 170),
    ],
    links: [
      link("link-r1-r2", "r1", "Gi0/0", "r2", "Gi0/0", {
        cableType: "copper-cross",
        fromIp: "10.0.0.1",
        toIp: "10.0.0.2",
        subnetLabel: "10.0.0.0/30 · Area 0",
        subnetLabelPos: { x: 270, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r2-r3", "r2", "Gi0/1", "r3", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.0.5",
        toIp: "10.0.0.6",
        subnetLabel: "10.0.0.4/30 · Area 1",
        subnetLabelPos: { x: 490, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r1-pc0", "r1", "Gi0/2", "pc0", "Fa0", { fromIp: "192.168.1.1", toIp: "192.168.1.10", fromPortOffset: 66, toPortOffset: 60, toPortSide: 14 }),
      link("link-r3-pc1", "r3", "Gi0/2", "pc1", "Fa0", { fromIp: "192.168.3.1", toIp: "192.168.3.10", fromPortOffset: 66, toPortOffset: 60, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "10.0.0.1", "255.255.255.252", "Area 0", "Link zu R2"),
      ifRow("R1", "Gi0/2", "192.168.1.1", "255.255.255.0", "Area 0", "LAN, passive-interface"),
      ifRow("R2", "Gi0/0", "10.0.0.2", "255.255.255.252", "Area 0", "Link zu R1"),
      ifRow("R2", "Gi0/1", "10.0.0.5", "255.255.255.252", "Area 1", "Link zu R3"),
      ifRow("R3", "Gi0/1", "10.0.0.6", "255.255.255.252", "Area 1", "Link zu R2"),
      ifRow("R3", "Gi0/2", "192.168.3.1", "255.255.255.0", "Area 1", "LAN, passive-interface"),
      tableRow("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "Area 0", "Host an R1 Gi0/2"),
      tableRow("PC1", "FastEthernet0", "192.168.3.10", "255.255.255.0", "192.168.3.1", "Area 1", "Host an R3 Gi0/2"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // OSPF DR/BDR-Wahl, Multi-Access (ospf-dr-bdr-election)
  // Sw1-Ports sind im Lab nicht angegeben: Konvention Fa0/1..Fa0/4 in Routerreihenfolge.
  // ─────────────────────────────────────────────────────────────
  "ospf-dr-bdr-election": {
    viewBox: { width: 940, height: 600 },
    devices: [
      device("sw1", "Sw1", SW, "switch-l2", "core", 470, 80),
      ...[1, 2, 3, 4].map((n) => device(`r${n}`, `R${n}`, R, "router", "gateway", 130 + (n - 1) * 230, 280)),
      endpoint("pc0", "PC0", PC, "pc", 130, 480),
      endpoint("srv0", "Server0", "Server-PT", "server", 360, 480),
      endpoint("srv1", "Server1", "Server-PT", "server", 590, 480),
      endpoint("srv2", "Server2", "Server-PT", "server", 820, 480),
    ],
    zones: [
      zone("zone-seg", "Segment 10.1.0.0/29", "emerald", 330, 20, 280, 140),
      zone("zone-lan1", "LAN 192.168.1.0/24", "blue", 30, 410, 200, 170),
      zone("zone-lan2", "LAN 192.168.2.0/24", "amber", 260, 410, 200, 170),
      zone("zone-lan3", "LAN 192.168.3.0/24", "violet", 490, 410, 200, 170),
      zone("zone-lan4", "LAN 192.168.4.0/24", "rose", 720, 410, 200, 170),
    ],
    links: [
      ...[1, 2, 3, 4].map((n) =>
        link(`link-r${n}-sw1`, `r${n}`, "Gi0/1", "sw1", `Fa0/${n}`, {
          fromIp: `10.1.0.${n}`,
          fromPortOffset: 70,
          fromPortSide: n <= 2 ? 14 : -14,
          toPortOffset: [170, 100, 100, 170][n - 1],
          toPortSide: n <= 2 ? -14 : 14,
        }),
      ),
      link("link-r1-pc0", "r1", "Gi0/0", "pc0", "Fa0", { fromIp: "192.168.1.254", toIp: "192.168.1.11", fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
      link("link-r2-srv0", "r2", "Gi0/0", "srv0", "Fa0", { fromIp: "192.168.2.254", toIp: "192.168.2.11", fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
      link("link-r3-srv1", "r3", "Gi0/0", "srv1", "Fa0", { fromIp: "192.168.3.254", toIp: "192.168.3.11", fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
      link("link-r4-srv2", "r4", "Gi0/0", "srv2", "Fa0", { fromIp: "192.168.4.254", toIp: "192.168.4.11", fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
    ],
    addressingTable: [
      ...[1, 2, 3, 4].flatMap((n) => [
        ifRow(`R${n}`, "Lo0", `192.168.254.${n}`, "255.255.255.255", "Loopback", "Router-ID (Loopback, laut Lab)"),
        ifRow(`R${n}`, "Gi0/1", `10.1.0.${n}`, "255.255.255.248", "Segment", "gemeinsames Segment über Sw1"),
        ifRow(`R${n}`, "Gi0/0", `192.168.${n}.254`, "255.255.255.0", `LAN ${n}`, "passive-interface"),
      ]),
      tableRow("PC0", "FastEthernet0", "192.168.1.11", "255.255.255.0", "192.168.1.254", "LAN 1", "Host an R1 Gi0/0"),
      tableRow("Server0", "FastEthernet0", "192.168.2.11", "255.255.255.0", "192.168.2.254", "LAN 2", "Server an R2 Gi0/0"),
      tableRow("Server1", "FastEthernet0", "192.168.3.11", "255.255.255.0", "192.168.3.254", "LAN 3", "Server an R3 Gi0/0"),
      tableRow("Server2", "FastEthernet0", "192.168.4.11", "255.255.255.0", "192.168.4.254", "LAN 4", "Server an R4 Gi0/0"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // EIGRP Grundlagen (eigrp)
  // ─────────────────────────────────────────────────────────────
  eigrp: {
    viewBox: { width: 940, height: 560 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 200, 100),
      device("r3", "R3", R, "router", "gateway", 740, 100),
      device("r2", "R2", R, "router", "distribution", 470, 260),
      device("sw1", "SW1", SW, "switch-l2", "access", 200, 260),
      device("sw3", "SW3", SW, "switch-l2", "access", 740, 260),
      endpoint("pc0", "PC0", PC, "pc", 200, 420),
      endpoint("pc1", "PC1", PC, "pc", 740, 420),
    ],
    zones: [
      zone("zone-lan1", "LAN 192.168.1.0/24", "emerald", 80, 340, 240, 190),
      zone("zone-lan3", "LAN 192.168.3.0/24", "amber", 620, 340, 240, 190),
    ],
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.12.1",
        toIp: "10.0.12.2",
        subnetLabel: "10.0.12.0/30",
        subnetLabelPos: { x: 300, y: 220 },
        fromPortOffset: 120,
        fromPortSide: 14,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r2-r3", "r2", "Gi0/2", "r3", "Gi0/2", {
        cableType: "copper-cross",
        fromIp: "10.0.23.1",
        toIp: "10.0.23.2",
        subnetLabel: "10.0.23.0/30",
        subnetLabelPos: { x: 640, y: 220 },
        fromPortOffset: 80,
        fromPortSide: -14,
        toPortOffset: 120,
        toPortSide: -14,
      }),
      link("link-r1-r3", "r1", "Gi0/2", "r3", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.13.1",
        toIp: "10.0.13.2",
        subnetLabel: "10.0.13.0/30",
        subnetLabelPos: { x: 470, y: 100 },
        fromPortOffset: 70,
        toPortOffset: 70,
        toPortSide: 14,
      }),
      link("link-r1-sw1", "r1", "Gi0/0", "sw1", "Gi0/1", { fromIp: "192.168.1.1", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw1-pc0", "sw1", "Fa0/1", "pc0", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 70, toPortOffset: 60 }),
      link("link-r3-sw3", "r3", "Gi0/0", "sw3", "Gi0/1", { fromIp: "192.168.3.1", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw3-pc1", "sw3", "Fa0/1", "pc1", "Fa0", { toIp: "192.168.3.10", fromPortOffset: 70, toPortOffset: 60 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.1", "255.255.255.0", "LAN 1", "Gateway LAN 1, passive-interface"),
      ifRow("R1", "Gi0/1", "10.0.12.1", "255.255.255.252", "Dreieck", "Link zu R2"),
      ifRow("R1", "Gi0/2", "10.0.13.1", "255.255.255.252", "Dreieck", "Link zu R3"),
      ifRow("R2", "Gi0/1", "10.0.12.2", "255.255.255.252", "Dreieck", "Link zu R1"),
      ifRow("R2", "Gi0/2", "10.0.23.1", "255.255.255.252", "Dreieck", "Link zu R3"),
      ifRow("R3", "Gi0/1", "10.0.13.2", "255.255.255.252", "Dreieck", "Link zu R1"),
      ifRow("R3", "Gi0/2", "10.0.23.2", "255.255.255.252", "Dreieck", "Link zu R2"),
      ifRow("R3", "Gi0/0", "192.168.3.1", "255.255.255.0", "LAN 3", "Gateway LAN 3, passive-interface"),
      tableRow("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "LAN 1", "Host an SW1"),
      tableRow("PC1", "FastEthernet0", "192.168.3.10", "255.255.255.0", "192.168.3.1", "LAN 3", "Host an SW3"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Drill: Router-Interfaces hochziehen (drill-interfaces)
  // Gi0/0 und Gi0/2 haben im Lab Adressen, aber keinen angeschlossenen Nachbarn.
  // ─────────────────────────────────────────────────────────────
  "drill-interfaces": {
    viewBox: { width: 760, height: 330 },
    devices: [device("r1", "R1", R, "router", "gateway", 240, 150), device("r2", "R2", R, "router", "gateway", 520, 150)],
    zones: [],
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.0.1",
        toIp: "10.0.0.2",
        subnetLabel: "10.0.0.0/30 · für den Schluss-Ping",
        subnetLabelPos: { x: 380, y: 110 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.10.1", "255.255.255.0", "LAN-BUERO", "LAN-BUERO (nicht angeschlossen)"),
      ifRow("R1", "Gi0/1", "10.0.0.1", "255.255.255.252", "WAN", "WAN-ZU-R2"),
      ifRow("R1", "Gi0/2", "192.168.20.1", "255.255.255.0", "LAN-LABOR", "LAN-LABOR (nicht angeschlossen)"),
      ifRow("R2", "Gi0/0", "192.168.30.1", "255.255.255.0", "LAN-BUERO", "LAN-BUERO (nicht angeschlossen)"),
      ifRow("R2", "Gi0/1", "10.0.0.2", "255.255.255.252", "WAN", "WAN-ZU-R1"),
      ifRow("R2", "Gi0/2", "192.168.40.1", "255.255.255.0", "LAN-LABOR", "LAN-LABOR (nicht angeschlossen)"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Drill: 6 PCs durchnummerieren (drill-pc-ips)
  // ─────────────────────────────────────────────────────────────
  "drill-pc-ips": {
    viewBox: { width: 1000, height: 450 },
    devices: [
      device("sw1", "SW1", SW, "switch-l2", "access", 500, 100),
      ...[0, 1, 2, 3, 4, 5].map((i) => endpoint(`pc${i}`, `PC${i}`, PC, "pc", 100 + i * 160, 340)),
    ],
    zones: [zone("zone-lan", "LAN 192.168.50.0/24", "blue", 10, 270, 980, 170)],
    vlans: [{ id: 1, name: "LAN", colorTheme: "blue", subnet: "192.168.50.0/24" }],
    links: [0, 1, 2, 3, 4, 5].map((i) =>
      link(`link-sw1-pc${i}`, "sw1", `Fa0/${i + 1}`, `pc${i}`, "Fa0", {
        toIp: `192.168.50.${11 + i}`,
        fromPortOffset: 130,
        fromPortSide: -14,
        toPortOffset: 90,
        toPortSide: i < 3 ? -14 : 14,
      }),
    ),
    addressingTable: [0, 1, 2, 3, 4, 5].map((i) =>
      tableRow(`PC${i}`, "FastEthernet0", `192.168.50.${11 + i}`, "255.255.255.0", "192.168.50.1", 1, `Host an SW1 Fa0/${i + 1}`),
    ),
  },
};

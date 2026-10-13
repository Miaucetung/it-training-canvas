import type { LabTopologyData } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/**
 * Paket 2 (Routing): static-routing, floating-static, rip-v1, rip-v2, rip-v2-passive,
 * ospf-rid-wildcard, ospf-dr-bdr-election, ospf-multiarea, eigrp, drill-interfaces, drill-pc-ips.
 *
 * Konvention bei nicht genannten Ports (im Lab-Text offen): Switch-Uplink = Gi0/1,
 * Endgeräte an Fa0/1, Fa0/2, ... in der Reihenfolge der Geräteliste.
 */
const R = "Cisco 2911";
const SW = "Catalyst 2960";
const PC = "PC-PT";

const lan = (name: string, net: string) => `${name} ${net}`;

export const ROUTING_LABS_TOPOLOGIES: Record<string, LabTopologyData> = {
  // ─────────────────────────────────────────────────────────────
  // Statisches Routing (static-routing)
  // ─────────────────────────────────────────────────────────────
  "static-routing": {
    viewBox: { width: 940, height: 560 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 240, 100),
      device("r2", "R2", R, "router", "gateway", 700, 100),
      device("sw1", "SW1", SW, "switch-l2", "access", 240, 260),
      device("sw2", "SW2", SW, "switch-l2", "access", 700, 260),
      endpoint("pc0", "PC0", PC, "pc", 140, 420),
      endpoint("pc1", "PC1", PC, "pc", 340, 420),
      endpoint("pc2", "PC2", PC, "pc", 600, 420),
      endpoint("pc3", "PC3", PC, "pc", 800, 420),
    ],
    zones: [
      zone("zone-lan1", lan("LAN", "192.168.1.0/24"), "blue", 60, 340, 360, 190),
      zone("zone-lan2", lan("LAN", "192.168.2.0/24"), "amber", 520, 340, 360, 190),
    ],
    vlans: [
      { id: 1, name: "LAN 1", colorTheme: "blue", subnet: "192.168.1.0/24" },
      { id: 2, name: "LAN 2", colorTheme: "amber", subnet: "192.168.2.0/24" },
    ],
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.0.1",
        toIp: "10.0.0.2",
        subnetLabel: "WAN 10.0.0.0/30",
        subnetLabelPos: { x: 470, y: 100 },
        fromPortOffset: 70,
        toPortOffset: 70,
        toPortSide: 14,
      }),
      link("link-r1-sw1", "r1", "Gi0/0", "sw1", "Gi0/1", { fromIp: "192.168.1.1", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw1-pc0", "sw1", "Fa0/1", "pc0", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw1-pc1", "sw1", "Fa0/2", "pc1", "Fa0", { toIp: "192.168.1.20", fromPortOffset: 70, fromPortSide: 14, toPortOffset: 80 }),
      link("link-r2-sw2", "r2", "Gi0/0", "sw2", "Gi0/1", { fromIp: "192.168.2.1", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw2-pc2", "sw2", "Fa0/1", "pc2", "Fa0", { toIp: "192.168.2.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw2-pc3", "sw2", "Fa0/2", "pc3", "Fa0", { toIp: "192.168.2.20", fromPortOffset: 70, fromPortSide: 14, toPortOffset: 80 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.1", "255.255.255.0", "LAN 1", "Gateway LAN 1"),
      ifRow("R1", "Gi0/1", "10.0.0.1", "255.255.255.252", "WAN", "WAN-Link zu R2"),
      ifRow("R2", "Gi0/0", "192.168.2.1", "255.255.255.0", "LAN 2", "Gateway LAN 2"),
      ifRow("R2", "Gi0/1", "10.0.0.2", "255.255.255.252", "WAN", "WAN-Link zu R1"),
      tableRow("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "LAN 1", "Host an SW1"),
      tableRow("PC1", "FastEthernet0", "192.168.1.20", "255.255.255.0", "192.168.1.1", "LAN 1", "Host an SW1"),
      tableRow("PC2", "FastEthernet0", "192.168.2.10", "255.255.255.0", "192.168.2.1", "LAN 2", "Host an SW2"),
      tableRow("PC3", "FastEthernet0", "192.168.2.20", "255.255.255.0", "192.168.2.1", "LAN 2", "Host an SW2"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Floating Static Route (floating-static)
  // ─────────────────────────────────────────────────────────────
  "floating-static": {
    viewBox: { width: 760, height: 430 },
    devices: [
      { ...device("isp", "ISP-MPLS", "Next-Hop 10.1.1.1", "cloud", "wan", 240, 100), assumed: true },
      { ...device("dsl", "DSL-Modem", "Next-Hop 10.2.2.1", "cloud", "wan", 520, 100), assumed: true },
      device("r1", "R1", `${R} · Branch`, "router", "gateway", 380, 290),
    ],
    zones: [],
    links: [
      link("link-r1-isp", "r1", "Gi0/0", "isp", "–", {
        cableType: "copper-cross",
        fromIp: "10.1.1.2",
        subnetLabel: "10.1.1.0/30 · AD 1 (primär)",
        subnetLabelPos: { x: 200, y: 200 },
        fromPortOffset: 70,
        fromPortSide: 14,
        toPortOffset: 110,
      }),
      link("link-r1-dsl", "r1", "Gi0/1", "dsl", "–", {
        cableType: "copper-cross",
        fromIp: "10.2.2.2",
        subnetLabel: "10.2.2.0/30 · AD 200 (Floating)",
        subnetLabelPos: { x: 600, y: 210 },
        fromPortOffset: 70,
        fromPortSide: -14,
        toPortOffset: 110,
      }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "10.1.1.2", "255.255.255.252", "MPLS", "MPLS-PRIMARY, Next-Hop 10.1.1.1"),
      ifRow("R1", "Gi0/1", "10.2.2.2", "255.255.255.252", "DSL", "DSL-BACKUP, Next-Hop 10.2.2.1"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // RIPv1 (rip-v1) und RIPv2 (rip-v2): gleiche Topologie, andere WAN-Masken
  // ─────────────────────────────────────────────────────────────
  "rip-v1": ripTriangleChain("/24", "10.0.12.0/24", "10.0.23.0/24", "255.255.255.0"),
  "rip-v2": ripTriangleChain("/30", "10.0.12.0/30", "10.0.23.0/30", "255.255.255.252"),

  // ─────────────────────────────────────────────────────────────
  // RIPv2 + Passive Interface, 4 Router (rip-v2-passive)
  // ─────────────────────────────────────────────────────────────
  "rip-v2-passive": {
    viewBox: { width: 900, height: 720 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 100, 100),
      device("r2", "R2", R, "router", "gateway", 550, 100),
      device("sw1", "SW1", SW, "switch-l2", "access", 550, 280),
      device("r3", "R3", R, "router", "distribution", 400, 440),
      device("r4", "R4", R, "router", "distribution", 700, 440),
      endpoint("pc0", "PC0", PC, "pc", 100, 620),
      endpoint("srv0", "Server0", "Server-PT", "server", 400, 620),
      endpoint("srv1", "Server1", "Server-PT", "server", 700, 620),
    ],
    zones: [
      zone("zone-lan-pc0", lan("LAN", "172.16.0.0/24"), "blue", 10, 540, 220, 170),
      zone("zone-lan-srv0", lan("LAN", "192.168.0.0/24"), "emerald", 290, 540, 220, 170),
      zone("zone-lan-srv1", lan("LAN", "192.168.1.0/24"), "amber", 590, 540, 220, 170),
    ],
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.1.0.1",
        toIp: "10.1.0.2",
        subnetLabel: "10.1.0.0/30",
        subnetLabelPos: { x: 325, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r1-pc0", "r1", "Gi0/0", "pc0", "Fa0", { fromIp: "172.16.0.254", toIp: "172.16.0.101", fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-r2-sw1", "r2", "Gi0/0", "sw1", "Gi0/1", { fromIp: "10.0.0.9", fromPortOffset: 80, toPortOffset: 56 }),
      link("link-sw1-r3", "sw1", "Fa0/1", "r3", "Gi0/1", { toIp: "10.0.0.10", fromPortOffset: 100, fromPortSide: 14, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-r4", "sw1", "Fa0/2", "r4", "Gi0/1", { toIp: "10.0.0.11", fromPortOffset: 100, toPortOffset: 90 }),
      link("link-r3-srv0", "r3", "Gi0/0", "srv0", "Fa0", { fromIp: "192.168.0.254", toIp: "192.168.0.11", fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
      link("link-r4-srv1", "r4", "Gi0/0", "srv1", "Fa0", { fromIp: "192.168.1.254", toIp: "192.168.1.11", fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "172.16.0.254", "255.255.255.0", "LAN PC0", "passive-interface"),
      ifRow("R1", "Gi0/1", "10.1.0.1", "255.255.255.252", "Transit", "Link zu R2"),
      ifRow("R2", "Gi0/1", "10.1.0.2", "255.255.255.252", "Transit", "Link zu R1"),
      ifRow("R2", "Gi0/0", "10.0.0.9", "255.255.255.248", "Segment", "Segment 10.0.0.8/29 über SW1"),
      ifRow("R3", "Gi0/1", "10.0.0.10", "255.255.255.248", "Segment", "Segment 10.0.0.8/29 über SW1"),
      ifRow("R3", "Gi0/0", "192.168.0.254", "255.255.255.0", "LAN Server0", "passive-interface"),
      ifRow("R4", "Gi0/1", "10.0.0.11", "255.255.255.248", "Segment", "Segment 10.0.0.8/29 über SW1"),
      ifRow("R4", "Gi0/0", "192.168.1.254", "255.255.255.0", "LAN Server1", "passive-interface"),
      tableRow("PC0", "FastEthernet0", "172.16.0.101", "255.255.255.0", "172.16.0.254", "LAN PC0", "Host an R1 Gi0/0"),
      tableRow("Server0", "FastEthernet0", "192.168.0.11", "255.255.255.0", "192.168.0.254", "LAN Server0", "Server an R3 Gi0/0"),
      tableRow("Server1", "FastEthernet0", "192.168.1.11", "255.255.255.0", "192.168.1.254", "LAN Server1", "Server an R4 Gi0/0"),
    ],
  },
};

function ripTriangleChain(maskLabel: string, net12: string, net23: string, wanMask: string): LabTopologyData {
  const x = [140, 470, 800];
  const names = ["R1", "R2", "R3"];
  return {
    viewBox: { width: 940, height: 560 },
    devices: [
      ...names.map((n, i) => device(`r${i + 1}`, n, R, "router", "gateway", x[i], 100)),
      ...names.map((_, i) => device(`sw${i + 1}`, `SW${i + 1}`, SW, "switch-l2", "access", x[i], 260)),
      ...names.map((_, i) => endpoint(`pc${i}`, `PC${i}`, PC, "pc", x[i], 420)),
    ],
    zones: names.map((_, i) =>
      zone(`zone-lan${i + 1}`, lan("LAN", `192.168.${i + 1}.0/24`), (["blue", "amber", "emerald"] as const)[i], x[i] - 120, 340, 240, 190),
    ),
    vlans: names.map((n, i) => ({ id: i + 1, name: `${n}-LAN`, colorTheme: (["blue", "amber", "emerald"] as const)[i], subnet: `192.168.${i + 1}.0/24` })),
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.12.1",
        toIp: "10.0.12.2",
        subnetLabel: net12,
        subnetLabelPos: { x: 305, y: 100 },
        fromPortOffset: 70,
        toPortOffset: 70,
        toPortSide: 14,
      }),
      link("link-r2-r3", "r2", "Gi0/2", "r3", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "10.0.23.1",
        toIp: "10.0.23.2",
        subnetLabel: net23,
        subnetLabelPos: { x: 635, y: 100 },
        fromPortOffset: 70,
        toPortOffset: 70,
        toPortSide: 14,
      }),
      ...names.flatMap((_, i) => [
        link(`link-r${i + 1}-sw${i + 1}`, `r${i + 1}`, "Gi0/0", `sw${i + 1}`, "Gi0/1", { fromIp: `192.168.${i + 1}.1`, fromPortOffset: 70, toPortOffset: 56 }),
        link(`link-sw${i + 1}-pc${i}`, `sw${i + 1}`, "Fa0/1", `pc${i}`, "Fa0", { toIp: `192.168.${i + 1}.10`, fromPortOffset: 70, toPortOffset: 60 }),
      ]),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.1", "255.255.255.0", "R1-LAN", "Gateway LAN 1"),
      ifRow("R1", "Gi0/1", "10.0.12.1", wanMask, "WAN", `Link zu R2 (${maskLabel})`),
      ifRow("R2", "Gi0/0", "192.168.2.1", "255.255.255.0", "R2-LAN", "Gateway LAN 2"),
      ifRow("R2", "Gi0/1", "10.0.12.2", wanMask, "WAN", `Link zu R1 (${maskLabel})`),
      ifRow("R2", "Gi0/2", "10.0.23.1", wanMask, "WAN", `Link zu R3 (${maskLabel})`),
      ifRow("R3", "Gi0/0", "192.168.3.1", "255.255.255.0", "R3-LAN", "Gateway LAN 3"),
      ifRow("R3", "Gi0/1", "10.0.23.2", wanMask, "WAN", `Link zu R2 (${maskLabel})`),
      ...names.map((_, i) => tableRow(`PC${i}`, "FastEthernet0", `192.168.${i + 1}.10`, "255.255.255.0", `192.168.${i + 1}.1`, `R${i + 1}-LAN`, `Host an SW${i + 1}`)),
    ],
  };
}

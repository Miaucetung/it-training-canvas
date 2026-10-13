import type { LabTopologyData } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/**
 * Paket 3: IPv6-Labs. Die Adressen stehen als Adresse ohne Präfix in `ip`, das Präfix (/64, /127, /128) in `subnetMask`.
 * Router-PC-Verbindungen sind direkt (Cross-Kabel), wie im Lab beschrieben.
 */
const R = "Cisco 2911";
const R2H = "Cisco 2911 · 2×HWIC-2T";
const PC = "PC-PT";

const v6 = (deviceName: string, iface: string, ip: string, prefix: number, zoneName: string, description: string) =>
  ifRow(deviceName, iface, ip, `/${prefix}`, zoneName, description);

const v6Host = (name: string, ip: string, gateway: string, zoneName: string, description: string) =>
  tableRow(name, "FastEthernet0", ip, "/64", gateway, zoneName, description);

/** Zwei Router (oben), je ein PC direkt darunter (ipv6, ospfv3-ipv6). */
function twoRoutersTwoPcs(id: "ipv6" | "ospfv3-ipv6"): LabTopologyData {
  const ospf = id === "ospfv3-ipv6";
  const transit = ospf ? "2001:db8::/64" : "2001:db8:12::/64";
  const r1t = ospf ? "2001:db8::1" : "2001:db8:12::1";
  const r2t = ospf ? "2001:db8::2" : "2001:db8:12::2";
  const lan1 = ospf ? "2001:db8:1::" : "2001:db8:1::";
  const r1PortT = ospf ? "Gi0/0" : "Gi0/1";
  const r1PortLan = ospf ? "Gi0/1" : "Gi0/0";
  const r2PortLan = ospf ? "Gi0/1" : "Gi0/0";
  const r2PortT = ospf ? "Gi0/0" : "Gi0/1";
  const extraR1 = ospf ? "OSPFv3 Area 0, Router-ID 1.1.1.1" : "";
  const extraR2 = ospf ? "OSPFv3 Area 0, Router-ID 2.2.2.2" : "";
  const lanNote = ospf ? ", passive-interface" : "";
  return {
    viewBox: { width: 940, height: 470 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 240, 100),
      device("r2", "R2", R, "router", "gateway", 700, 100),
      endpoint("pc0", "PC0", PC, "pc", 240, 340),
      endpoint("pc1", "PC1", PC, "pc", 700, 340),
    ],
    zones: [
      zone("zone-lan1", "LAN 2001:db8:1::/64", "blue", 100, 260, 280, 190),
      zone("zone-lan2", "LAN 2001:db8:2::/64", "amber", 560, 260, 280, 190),
    ],
    links: [
      link("link-r1-r2", "r1", r1PortT, "r2", r2PortT, {
        cableType: "copper-cross",
        fromIp: r1t,
        toIp: r2t,
        subnetLabel: transit,
        subnetLabelPos: { x: 470, y: 60 },
        fromPortOffset: 100,
        toPortOffset: 100,
        toPortSide: 14,
      }),
      link("link-r1-pc0", "r1", r1PortLan, "pc0", "Fa0", {
        cableType: "copper-cross",
        fromIp: `${lan1}1`,
        toIp: `${lan1}10`,
        fromPortOffset: 70,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-r2-pc1", "r2", r2PortLan, "pc1", "Fa0", {
        cableType: "copper-cross",
        fromIp: "2001:db8:2::1",
        toIp: "2001:db8:2::10",
        fromPortOffset: 70,
        toPortOffset: 80,
        toPortSide: 14,
      }),
    ],
    addressingTable: [
      v6("R1", r1PortLan, "2001:db8:1::1", 64, "LAN 1", `Gateway LAN 1${lanNote}`),
      v6("R1", r1PortT, r1t, 64, "Transit", `Link zu R2${extraR1 ? `, ${extraR1}` : ""}`),
      v6("R2", r2PortLan, "2001:db8:2::1", 64, "LAN 2", `Gateway LAN 2${lanNote}`),
      v6("R2", r2PortT, r2t, 64, "Transit", `Link zu R1${extraR2 ? `, ${extraR2}` : ""}`),
      v6Host("PC0", "2001:db8:1::10", "2001:db8:1::1", "LAN 1", `Host an R1 ${r1PortLan}`),
      v6Host("PC1", "2001:db8:2::10", "2001:db8:2::1", "LAN 2", `Host an R2 ${r2PortLan}`),
    ],
  };
}

export const IPV6_LABS_TOPOLOGIES: Record<string, LabTopologyData> = {
  ipv6: twoRoutersTwoPcs("ipv6"),
  "ospfv3-ipv6": twoRoutersTwoPcs("ospfv3-ipv6"),

  // ─────────────────────────────────────────────────────────────
  // IPv6 Static Routing (ipv6-static)
  // Die Internet-Seite der Serial-Links ist im Lab nicht konfiguriert; die Adresse ::1 ergibt sich nur als Next-Hop.
  // ─────────────────────────────────────────────────────────────
  "ipv6-static": {
    viewBox: { width: 940, height: 470 },
    devices: [
      device("inet", "Internet", R2H, "router", "wan", 470, 100),
      device("r1", "R1-1", R, "router", "gateway", 200, 310),
      device("r2", "R2-1", R2H, "router", "gateway", 740, 310),
    ],
    zones: [],
    links: [
      link("link-inet-r1", "inet", "Se0/0/0", "r1", "Se0/0/0", {
        cableType: "serial",
        toIp: "2001:DB8:CCA1:1::2",
        subnetLabel: "2001:DB8:CCA1:1::/64",
        subnetLabelPos: { x: 200, y: 190 },
        fromPortOffset: 110,
        fromPortSide: 14,
        toPortOffset: 120,
        toPortSide: -14,
      }),
      link("link-inet-r2", "inet", "Se0/1/0", "r2", "Se0/1/0", {
        cableType: "serial",
        toIp: "2001:DB8:CCA2:2::2",
        subnetLabel: "2001:DB8:CCA2:2::/64",
        subnetLabelPos: { x: 740, y: 190 },
        fromPortOffset: 110,
        fromPortSide: -14,
        toPortOffset: 120,
        toPortSide: 14,
      }),
    ],
    addressingTable: [
      v6("R1-1", "Se0/0/0", "2001:DB8:CCA1:1::2", 64, "Serial", "Link zum Internet-Router, Next-Hop 2001:DB8:CCA1:1::1 (dort nicht konfiguriert)"),
      v6("R1-1", "Lo0", "2001:DB8:CCA1:254::1:1", 128, "Loopback", "Loopback0 (nur in der Tabelle)"),
      v6("R2-1", "Se0/1/0", "2001:DB8:CCA2:2::2", 64, "Serial", "Link zum Internet-Router, Next-Hop 2001:DB8:CCA2:2::1 (dort nicht konfiguriert)"),
      v6("R2-1", "Lo0", "2001:DB8:CCA2:254::2:1", 128, "Loopback", "Loopback0 (nur in der Tabelle)"),
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // IPv6 Routing: OSPFv3 + EIGRPv6 (ipv6-ospfv3-eigrpv6)
  // PC-Adressen stehen nur im Geräte-Label des Labs, ein PC-Gateway wird nicht genannt.
  // ─────────────────────────────────────────────────────────────
  "ipv6-ospfv3-eigrpv6": {
    viewBox: { width: 1000, height: 520 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 150, 130),
      device("r2", "R2", R, "router", "gateway", 500, 130),
      device("r3", "R3", R, "router", "gateway", 850, 130),
      endpoint("pc2", "PC2", PC, "pc", 150, 400),
      endpoint("pc1", "PC1", PC, "pc", 500, 400),
      endpoint("pc0", "PC0", PC, "pc", 850, 400),
    ],
    zones: [
      zone("zone-lan1", "LAN FDAA::/64", "blue", 40, 330, 220, 170),
      zone("zone-lan2", "LAN FDBB::/64", "amber", 390, 330, 220, 170),
      zone("zone-lan3", "LAN FDCC::/64", "emerald", 740, 330, 220, 170),
    ],
    links: [
      link("link-r1-r2", "r1", "Gi0/1", "r2", "Gi0/2", {
        cableType: "copper-cross",
        fromIp: "FD00::2",
        toIp: "FD00::3",
        subnetLabel: "FD00::2/127",
        subnetLabelPos: { x: 325, y: 92 },
        fromPortOffset: 90,
        toPortOffset: 90,
        toPortSide: 14,
      }),
      link("link-r2-r3", "r2", "Gi0/1", "r3", "Gi0/2", {
        cableType: "copper-cross",
        fromIp: "FD00::4",
        toIp: "FD00::5",
        subnetLabel: "FD00::4/127",
        subnetLabelPos: { x: 675, y: 92 },
        fromPortOffset: 90,
        toPortOffset: 90,
        toPortSide: 14,
      }),
      link("link-r1-r3", "r1", "Gi0/2", "r3", "Gi0/1", {
        cableType: "copper-cross",
        fromIp: "FD00::6",
        toIp: "FD00::7",
        subnetLabel: "FD00::6/127",
        subnetLabelPos: { x: 500, y: 22 },
        bendPoints: [
          { x: 150, y: 50 },
          { x: 850, y: 50 },
        ],
        fromPortOffset: 50,
        fromPortSide: 14,
        toPortOffset: 50,
        toPortSide: -14,
      }),
      link("link-r1-pc2", "r1", "Gi0/0", "pc2", "Fa0", { cableType: "copper-cross", fromIp: "FDAA::FFFF", toIp: "FDAA::0101", fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-r2-pc1", "r2", "Gi0/0", "pc1", "Fa0", { cableType: "copper-cross", fromIp: "FDBB::FFFF", toIp: "FDBB::0101", fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-r3-pc0", "r3", "Gi0/0", "pc0", "Fa0", { cableType: "copper-cross", fromIp: "FDCC::FFFF", toIp: "FDCC::0101", fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
    ],
    addressingTable: [
      v6("R1", "Gi0/0", "FDAA::FFFF", 64, "LAN FDAA", "Gateway LAN, OSPFv3 passive"),
      v6("R1", "Gi0/1", "FD00::2", 127, "Backbone", "Link zu R2 Gi0/2, OSPFv3 + EIGRPv6"),
      v6("R1", "Gi0/2", "FD00::6", 127, "Backbone", "Link zu R3 Gi0/1, OSPFv3 + EIGRPv6"),
      v6("R2", "Gi0/0", "FDBB::FFFF", 64, "LAN FDBB", "Gateway LAN, OSPFv3 passive"),
      v6("R2", "Gi0/1", "FD00::4", 127, "Backbone", "Link zu R3 Gi0/2, OSPFv3 + EIGRPv6"),
      v6("R2", "Gi0/2", "FD00::3", 127, "Backbone", "Link zu R1 Gi0/1, OSPFv3 + EIGRPv6"),
      v6("R3", "Gi0/0", "FDCC::FFFF", 64, "LAN FDCC", "Gateway LAN, OSPFv3 passive"),
      v6("R3", "Gi0/1", "FD00::7", 127, "Backbone", "Link zu R1 Gi0/2, OSPFv3 + EIGRPv6"),
      v6("R3", "Gi0/2", "FD00::5", 127, "Backbone", "Link zu R2 Gi0/1, OSPFv3 + EIGRPv6"),
      v6Host("PC2", "FDAA::0101", "im Lab nicht angegeben", "LAN FDAA", "Host an R1 Gi0/0 (Adresse aus dem Geräte-Label)"),
      v6Host("PC1", "FDBB::0101", "im Lab nicht angegeben", "LAN FDBB", "Host an R2 Gi0/0 (Adresse aus dem Geräte-Label)"),
      v6Host("PC0", "FDCC::0101", "im Lab nicht angegeben", "LAN FDCC", "Host an R3 Gi0/0 (Adresse aus dem Geräte-Label)"),
    ],
  },
};

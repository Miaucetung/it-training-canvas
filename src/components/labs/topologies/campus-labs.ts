import type { LabTopologyData, LabTopologyDevice } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/**
 * Paket 7: Campus. Beide Labs sind DHCP-Szenarien: PCs zeigen nur das Netz des Pools („DHCP (Netz)“).
 * PC-Namen folgen dem Lab-Text (uneinheitlich in vlan-dhcp-nat-roas: PC3, PC4, C5, PC0, PC2, PC1).
 */
const R = "Cisco 2911";
const SW = "Catalyst 2960";
const PC = "PC-PT";

const client = (id: string, name: string, vlanText: string, x: number, y: number, network: string): LabTopologyDevice => ({
  ...endpoint(id, name, `${PC} · ${vlanText}`, "pc", x, y),
  dhcpNetwork: network,
});

const dhcpRow = (name: string, network: string, gateway: string, vlan: number, desc: string) =>
  tableRow(name, "FastEthernet0", `DHCP (${network})`, "–", gateway, vlan, desc);

// ───────────────────────────── VLAN + DHCP + NAT: Campus mit Internetzugang
const ROAS_NET = { 10: "192.168.10.0/24", 20: "192.168.20.0/24", 30: "192.168.30.0/24" } as const;

const vlanDhcpNatRoas: LabTopologyData = {
  viewBox: { width: 1160, height: 640 },
  devices: [
    device("r0", "Router0", `${R} · RoaS, DHCP, NAT`, "router", "gateway", 260, 100),
    device("isp", "ISP", R, "router", "gateway", 520, 100),
    device("inet", "INTERNET", R, "router", "gateway", 780, 100),
    device("web", "Webserver", "Server-PT", "server", "wan", 1040, 100),
    device("sw2", "SW2", `${SW} · VTP-Client`, "switch-l2", "access", 260, 270),
    device("sw1", "SW1", `${SW} · VTP-Server`, "switch-l2", "access", 700, 270),
    client("pc0", "PC0", "VLAN 10", 100, 470, ROAS_NET[10]),
    client("pc2", "PC2", "VLAN 20", 260, 470, ROAS_NET[20]),
    client("pc1", "PC1", "VLAN 30", 420, 470, ROAS_NET[30]),
    client("pc3", "PC3", "VLAN 10", 540, 470, ROAS_NET[10]),
    client("pc4", "PC4", "VLAN 20", 700, 470, ROAS_NET[20]),
    client("c5", "C5", "VLAN 30", 860, 470, ROAS_NET[30]),
  ],
  zones: [
    zone("zone-sw2", "SW2 · Access-Ports VLAN 10 / 20 / 30", "blue", 20, 400, 480, 200),
    zone("zone-sw1", "SW1 · Access-Ports VLAN 10 / 20 / 30", "emerald", 520, 400, 420, 200),
  ],
  vlans: [
    { id: 10, name: "Blau", colorTheme: "blue", subnet: ROAS_NET[10] },
    { id: 20, name: "Grün", colorTheme: "emerald", subnet: ROAS_NET[20] },
    { id: 30, name: "Gelb", colorTheme: "amber", subnet: ROAS_NET[30] },
  ],
  links: [
    link("link-r0-isp", "r0", "Gi0/1", "isp", "Gi0/2", { cableType: "copper-cross", fromIp: "200.0.0.1", toIp: "200.0.0.2", subnetLabel: "200.0.0.0/30", subnetLabelPos: { x: 390, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
    link("link-isp-inet", "isp", "Gi0/1", "inet", "Gi0/2", { cableType: "copper-cross", fromIp: "1.1.1.1", toIp: "1.1.1.2", subnetLabel: "1.1.1.0/30", subnetLabelPos: { x: 650, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
    link("link-inet-web", "inet", "Gi0/0", "web", "Fa0", { cableType: "copper-cross", fromIp: "47.11.8.1", toIp: "47.11.8.15", subnetLabel: "47.11.8.0/24", subnetLabelPos: { x: 910, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
    link("link-r0-sw2", "r0", "Gi0/0", "sw2", "Gi0/1", { isTrunk: true, fromPortOffset: 70, toPortOffset: 50, subnetLabel: "Trunk (Router-on-a-Stick)", subnetLabelPos: { x: 380, y: 190 } }),
    link("link-sw2-sw1", "sw2", "Gi0/2", "sw1", "Gi0/1", { isTrunk: true, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14, subnetLabel: "Trunk (DTP: SW1 on, SW2 desirable)", subnetLabelPos: { x: 480, y: 232 } }),
    link("link-sw2-pc0", "sw2", "Fa0/1", "pc0", "Fa0", { toIp: "DHCP", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
    link("link-sw2-pc2", "sw2", "Fa0/11", "pc2", "Fa0", { toIp: "DHCP", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
    link("link-sw2-pc1", "sw2", "Fa0/15", "pc1", "Fa0", { toIp: "DHCP", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
    link("link-sw1-pc3", "sw1", "Fa0/1", "pc3", "Fa0", { toIp: "DHCP", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
    link("link-sw1-pc4", "sw1", "Fa0/11", "pc4", "Fa0", { toIp: "DHCP", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
    link("link-sw1-c5", "sw1", "Fa0/15", "c5", "Fa0", { toIp: "DHCP", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
  ],
  addressingTable: [
    ifRow("Router0", "Gi0/0.10", "192.168.10.1", "255.255.255.0", 10, "Gateway Blau, ip nat inside, DHCP-Pool VLAN10"),
    ifRow("Router0", "Gi0/0.20", "192.168.20.1", "255.255.255.0", 20, "Gateway Grün, ip nat inside, DHCP-Pool VLAN20"),
    ifRow("Router0", "Gi0/0.30", "192.168.30.1", "255.255.255.0", 30, "Gateway Gelb, ip nat inside, DHCP-Pool VLAN30"),
    ifRow("Router0", "Gi0/1", "200.0.0.1", "255.255.255.252", "WAN", "ip nat outside, PAT über das Interface (overload)"),
    ifRow("ISP", "Gi0/2", "200.0.0.2", "255.255.255.252", "WAN", "Link zu Router0"),
    ifRow("ISP", "Gi0/1", "1.1.1.1", "255.255.255.252", "WAN", "Link zu INTERNET"),
    ifRow("INTERNET", "Gi0/2", "1.1.1.2", "255.255.255.252", "WAN", "Link zum ISP"),
    ifRow("INTERNET", "Gi0/0", "47.11.8.1", "255.255.255.0", "Webserver-Netz", "Gateway des Webservers"),
    tableRow("Webserver", "FastEthernet0", "47.11.8.15", "255.255.255.0", "47.11.8.1", "Webserver-Netz", "Ziel der Tests"),
    dhcpRow("PC0", ROAS_NET[10], "per DHCP (192.168.10.1)", 10, "SW2 Fa0/1"),
    dhcpRow("PC2", ROAS_NET[20], "per DHCP (192.168.20.1)", 20, "SW2 Fa0/11"),
    dhcpRow("PC1", ROAS_NET[30], "per DHCP (192.168.30.1)", 30, "SW2 Fa0/15"),
    dhcpRow("PC3", ROAS_NET[10], "per DHCP (192.168.10.1)", 10, "SW1 Fa0/1"),
    dhcpRow("PC4", ROAS_NET[20], "per DHCP (192.168.20.1)", 20, "SW1 Fa0/11"),
    dhcpRow("C5", ROAS_NET[30], "per DHCP (192.168.30.1)", 30, "SW1 Fa0/15"),
  ],
};

// ───────────────────────────── Campus: VTP + RoaS + zentrales DHCP (3 Switches)
const CAMPUS_NET = { 100: "10.10.100.0/24", 110: "10.10.110.0/24", 120: "10.10.120.0/24" } as const;
const CAMPUS_VLAN = [
  { vlan: 100, color: "Rot", fa: "Fa0/1" },
  { vlan: 110, color: "Blau", fa: "Fa0/2" },
  { vlan: 120, color: "Grün", fa: "Fa0/3" },
] as const;
const SWITCH_X = { sw1: 300, sw2: 850, sw3: 1400 } as const;
const PC_OFFSETS = [-180, 0, 180];

const campusPcs = (Object.keys(SWITCH_X) as Array<keyof typeof SWITCH_X>).flatMap((sw) =>
  CAMPUS_VLAN.map((v, i) => client(`pc-${v.color.toLowerCase()}-${sw}`, `PC ${v.color} (an ${sw.toUpperCase()})`, `VLAN ${v.vlan}`, SWITCH_X[sw] + PC_OFFSETS[i], 470, CAMPUS_NET[v.vlan])),
);

const vlanVtpDhcpCampus: LabTopologyData = {
  viewBox: { width: 1700, height: 600 },
  devices: [
    device("r1", "R1", `${R} · RoaS, DHCP`, "router", "gateway", 300, 100),
    device("sw1", "SW1", `${SW} · VTP-Server`, "switch-l2", "access", SWITCH_X.sw1, 270),
    device("sw2", "SW2", `${SW} · VTP-Server`, "switch-l2", "access", SWITCH_X.sw2, 270),
    device("sw3", "SW3", `${SW} · VTP-Client`, "switch-l2", "access", SWITCH_X.sw3, 270),
    ...campusPcs,
  ],
  zones: (Object.keys(SWITCH_X) as Array<keyof typeof SWITCH_X>).map((sw) =>
    zone(`zone-${sw}`, `${sw.toUpperCase()} · Access-Ports VLAN 100 / 110 / 120`, "blue", SWITCH_X[sw] - 260, 400, 520, 190),
  ),
  vlans: [
    { id: 100, name: "Rot", colorTheme: "rose", subnet: CAMPUS_NET[100] },
    { id: 110, name: "Blau", colorTheme: "blue", subnet: CAMPUS_NET[110] },
    { id: 120, name: "Grün", colorTheme: "emerald", subnet: CAMPUS_NET[120] },
  ],
  links: [
    link("link-r1-sw1", "r1", "Gi0/0", "sw1", "Gi0/1", { isTrunk: true, fromPortOffset: 70, toPortOffset: 50, subnetLabel: "Trunk (Native VLAN 1)", subnetLabelPos: { x: 420, y: 190 } }),
    link("link-sw1-sw2", "sw1", "Gi0/2", "sw2", "Gi0/1", { isTrunk: true, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14, subnetLabel: "Trunk", subnetLabelPos: { x: 575, y: 232 } }),
    link("link-sw2-sw3", "sw2", "Gi0/2", "sw3", "Gi0/1", { isTrunk: true, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14, subnetLabel: "Trunk", subnetLabelPos: { x: 1125, y: 232 } }),
    ...(Object.keys(SWITCH_X) as Array<keyof typeof SWITCH_X>).flatMap((sw) =>
      CAMPUS_VLAN.map((v, i) =>
        link(`link-${sw}-${v.color.toLowerCase()}`, sw, v.fa, `pc-${v.color.toLowerCase()}-${sw}`, "Fa0", { toIp: "DHCP", fromPortOffset: i === 1 ? 70 : 120, toPortOffset: 80, toPortSide: 14 }),
      ),
    ),
  ],
  addressingTable: [
    ifRow("R1", "Gi0/0.1", "192.168.1.1", "255.255.255.0", 1, "Management, Native VLAN, DHCP-Pool MGMT"),
    ifRow("R1", "Gi0/0.100", "10.10.100.1", "255.255.255.0", 100, "Gateway Rot, DHCP-Pool VLAN100"),
    ifRow("R1", "Gi0/0.110", "10.10.110.1", "255.255.255.0", 110, "Gateway Blau, DHCP-Pool VLAN110"),
    ifRow("R1", "Gi0/0.120", "10.10.120.1", "255.255.255.0", 120, "Gateway Grün, DHCP-Pool VLAN120"),
    tableRow("SW1", "Vlan1", "192.168.1.2", "255.255.255.0", "192.168.1.1", 1, "Management-SVI, VTP-Server"),
    tableRow("SW2", "Vlan1", "192.168.1.3", "255.255.255.0", "192.168.1.1", 1, "Management-SVI, VTP-Server"),
    tableRow("SW3", "Vlan1", "192.168.1.4", "255.255.255.0", "192.168.1.1", 1, "Management-SVI, VTP-Client"),
    ...(Object.keys(SWITCH_X) as Array<keyof typeof SWITCH_X>).flatMap((sw) =>
      CAMPUS_VLAN.map((v) => dhcpRow(`PC ${v.color} (an ${sw.toUpperCase()})`, CAMPUS_NET[v.vlan], `per DHCP (10.10.${v.vlan}.1)`, v.vlan, `${sw.toUpperCase()} ${v.fa}`)),
    ),
  ],
};

export const CAMPUS_LABS_TOPOLOGIES: Record<string, LabTopologyData> = {
  "vlan-dhcp-nat-roas": vlanDhcpNatRoas,
  "vlan-vtp-dhcp-campus": vlanVtpDhcpCampus,
};

import type { LabTopologyData, LabTopologyDevice } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/**
 * Paket 5: Security. Physische Aktionen aus den Labs (PC3, Rogue-Switch, Angreifer-Switch) sind als nicht angeschlossene Geräte
 * gezeichnet, mit Textmarke. Im Lab genannte, aber nicht konfigurierte Geräte sind gestrichelt („im Lab nicht konfiguriert“).
 */
const R = "Cisco 2911";
const SW = "Catalyst 2960";
const SW4 = "Catalyst 2960 (4×Gi)";
const PC = "PC-PT";
const SRV = "Server-PT";
const IOL_R = "Cisco IOL Router";
const IOL_SW = "Cisco IOL Switch";

const notConfigured = (d: LabTopologyDevice): LabTopologyDevice => ({ ...d, assumed: true, assumedReason: "not-configured" });
const notSpecified = (d: LabTopologyDevice): LabTopologyDevice => ({ ...d, assumed: true });

const v = (name: string, iface: string, ip: string, mask: string, gw: string, zoneName: string | number, desc: string) =>
  tableRow(name, iface, ip, mask, gw, zoneName, desc);

export const SECURITY_LABS_TOPOLOGIES: Record<string, LabTopologyData> = {
  // ───────────────────────────── SSH
  ssh: {
    viewBox: { width: 760, height: 480 },
    devices: [device("r1", "R1", R, "router", "gateway", 380, 100), endpoint("admin", "Admin-PC", PC, "pc", 380, 320)],
    zones: [zone("zone-lan", "LAN 192.168.1.0/24", "blue", 200, 230, 360, 220)],
    notes: [{ id: "note-variant", text: "Lab: „direkt oder via Switch“, hier direkt gezeichnet", x: 380, y: 440 }],
    links: [link("link-r1-admin", "r1", "Gi0/0", "admin", "Fa0", { cableType: "copper-cross", fromIp: "192.168.1.1", toIp: "192.168.1.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 })],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.1", "255.255.255.0", "LAN", "Gateway und SSH-Ziel (vty 0 4: login local, transport input ssh)"),
      v("Admin-PC", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "LAN", "SSH-Client (ssh -l admin 192.168.1.1)"),
    ],
  },

  // ───────────────────────────── Device Hardening
  "device-hardening": {
    viewBox: { width: 760, height: 480 },
    devices: [device("sw1", "SW1", SW, "switch-l2", "core", 380, 100), endpoint("admin", "Admin-PC", PC, "pc", 380, 320)],
    zones: [zone("zone-mgmt", "Management 192.168.1.0/24 (einziges erlaubtes Subnetz)", "blue", 120, 230, 520, 220)],
    links: [link("link-sw1-admin", "sw1", "Fa0/1", "admin", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 })],
    addressingTable: [
      v("SW1", "Vlan1", "192.168.1.254", "255.255.255.0", "N/A", 1, "Management-SVI, vty 0 15 nur SSH, access-class 10"),
      v("Admin-PC", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.254", 1, "Admin-Zugang (ssh -l admin 192.168.1.254)"),
    ],
  },

  // ───────────────────────────── Port Security
  "port-security": {
    viewBox: { width: 980, height: 480 },
    devices: [
      device("sw1", "SW1", SW, "switch-l2", "access", 360, 100),
      endpoint("pc1", "PC1", PC, "pc", 200, 330),
      endpoint("pc2", "PC2", PC, "pc", 520, 330),
      endpoint("pc3", "PC3", PC, "pc", 800, 330),
    ],
    zones: [zone("zone-lan", "LAN 192.168.1.0/24", "blue", 60, 250, 600, 220)],
    notes: [{ id: "note-pc3", text: "PC3: zunächst nicht angeschlossen (Gegenprobe: ersetzt PC1 an Fa0/1)", x: 790, y: 430 }],
    links: [
      link("link-sw1-pc1", "sw1", "Fa0/1", "pc1", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 120, toPortOffset: 90, toPortSide: 14, subnetLabel: "max 1 · sticky · shutdown", subnetLabelPos: { x: 110, y: 230 } }),
      link("link-sw1-pc2", "sw1", "Fa0/2", "pc2", "Fa0", { toIp: "192.168.1.20", fromPortOffset: 120, toPortOffset: 90, toPortSide: 14, subnetLabel: "max 2 · sticky · restrict", subnetLabelPos: { x: 640, y: 230 } }),
    ],
    addressingTable: [
      v("PC1", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", 1, "Host an SW1 Fa0/1 (Port Security: maximum 1, sticky, violation shutdown)"),
      v("PC2", "FastEthernet0", "192.168.1.20", "255.255.255.0", "192.168.1.1", 1, "Host an SW1 Fa0/2 (Port Security: maximum 2, sticky, violation restrict)"),
    ],
  },

  // ───────────────────────────── Standard ACL
  "acl-standard": {
    viewBox: { width: 940, height: 500 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 470, 100),
      endpoint("pc0", "PC0", PC, "pc", 200, 340),
      endpoint("pc1", "PC1", PC, "pc", 470, 340),
      endpoint("srv", "Server", SRV, "server", 740, 340),
    ],
    zones: [
      zone("zone-1", "LAN 192.168.1.0/24", "blue", 80, 270, 240, 220),
      zone("zone-2", "LAN 192.168.2.0/24", "amber", 350, 270, 240, 220),
      zone("zone-3", "LAN 192.168.3.0/24", "emerald", 620, 270, 240, 220),
    ],
    links: [
      link("link-r1-pc0", "r1", "Gi0/0", "pc0", "Fa0", { cableType: "copper-cross", fromIp: "192.168.1.1", toIp: "192.168.1.10", fromPortOffset: 130, toPortOffset: 90, toPortSide: 14 }),
      link("link-r1-pc1", "r1", "Gi0/1", "pc1", "Fa0", { cableType: "copper-cross", fromIp: "192.168.2.1", toIp: "192.168.2.10", fromPortOffset: 70, toPortOffset: 90, toPortSide: 14 }),
      link("link-r1-srv", "r1", "Gi0/2", "srv", "Fa0", { cableType: "copper-cross", fromIp: "192.168.3.1", toIp: "192.168.3.100", fromPortOffset: 130, toPortOffset: 90, toPortSide: 14, subnetLabel: "ACL 10 out", subnetLabelPos: { x: 790, y: 200 } }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.1", "255.255.255.0", "LAN 1", "Gateway PC0 (erlaubt)"),
      ifRow("R1", "Gi0/1", "192.168.2.1", "255.255.255.0", "LAN 2", "Gateway PC1 (geblockt)"),
      ifRow("R1", "Gi0/2", "192.168.3.1", "255.255.255.0", "LAN 3", "Gateway Server, ip access-group 10 out"),
      v("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "LAN 1", "erlaubt (ACL 10 permit 192.168.1.0/24)"),
      v("PC1", "FastEthernet0", "192.168.2.10", "255.255.255.0", "192.168.2.1", "LAN 2", "geblockt (ACL 10 deny 192.168.2.0/24)"),
      v("Server", "FastEthernet0", "192.168.3.100", "255.255.255.0", "192.168.3.1", "LAN 3", "Ziel der Tests"),
    ],
  },

  // ───────────────────────────── Extended ACL
  // Beide PCs hängen laut Lab am selben Port Gi0/0; der Verteiler dazwischen fehlt im Lab.
  "acl-extended": {
    viewBox: { width: 940, height: 580 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 470, 100),
      notSpecified(device("dist", "Verteiler", "", "switch-l2", "access", 250, 290)),
      endpoint("pc0", "PC0", PC, "pc", 120, 480),
      endpoint("pc1", "PC1", PC, "pc", 380, 480),
      endpoint("web", "Web-Server", SRV, "server", 760, 480),
    ],
    zones: [
      zone("zone-1", "LAN 192.168.1.0/24", "blue", 20, 210, 470, 340),
      zone("zone-2", "LAN 192.168.2.0/24", "amber", 600, 400, 320, 160),
    ],
    links: [
      link("link-r1-dist", "r1", "Gi0/0", "dist", "–", { fromIp: "192.168.1.1", fromPortOffset: 130, toPortOffset: 70, subnetLabel: "ACL BLOCK_PC1_HTTP in", subnetLabelPos: { x: 210, y: 180 } }),
      link("link-dist-pc0", "dist", "–", "pc0", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 110, toPortOffset: 90, toPortSide: 14 }),
      link("link-dist-pc1", "dist", "–", "pc1", "Fa0", { toIp: "192.168.1.20", fromPortOffset: 110, toPortOffset: 90, toPortSide: 14 }),
      link("link-r1-web", "r1", "Gi0/1", "web", "Fa0", { cableType: "copper-cross", fromIp: "192.168.2.1", toIp: "192.168.2.100", fromPortOffset: 150, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.1", "255.255.255.0", "LAN 1", "Gateway PC0/PC1, ip access-group BLOCK_PC1_HTTP in"),
      ifRow("R1", "Gi0/1", "192.168.2.1", "255.255.255.0", "LAN 2", "Gateway Web-Server"),
      v("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "LAN 1", "nicht gesperrt"),
      v("PC1", "FastEthernet0", "192.168.1.20", "255.255.255.0", "192.168.1.1", "LAN 1", "HTTP zum Web-Server gesperrt (deny tcp host 192.168.1.20 host 192.168.2.100 eq 80)"),
      v("Web-Server", "FastEthernet0", "192.168.2.100", "255.255.255.0", "192.168.2.1", "LAN 2", "Webserver (Port 80)"),
    ],
  },

  // ───────────────────────────── DHCP Snooping + DAI
  "dhcp-snooping-dai": {
    viewBox: { width: 800, height: 580 },
    devices: [
      device("r1", "R1", `${R} · DHCP-Server`, "router", "gateway", 360, 100),
      device("sw1", "SW1", `${SW} · Access`, "switch-l2", "access", 360, 290),
      { ...endpoint("pc1", "PC1", PC, "pc", 140, 480), dhcpNetwork: "192.168.10.0/24" },
      { ...endpoint("pc2", "PC2", PC, "pc", 360, 480), dhcpNetwork: "192.168.10.0/24" },
      endpoint("rogue", "Angreifer", PC, "pc", 600, 480),
    ],
    zones: [zone("zone-lan", "LAN 192.168.10.0/24", "blue", 40, 220, 700, 330)],
    links: [
      link("link-r1-sw1", "r1", "Gi0/0", "sw1", "Gi0/1", { fromIp: "192.168.10.1", fromPortOffset: 70, toPortOffset: 56, subnetLabel: "Uplink: trusted (Snooping + DAI)", subnetLabelPos: { x: 560, y: 195 } }),
      link("link-sw1-pc1", "sw1", "Fa0/1", "pc1", "Fa0", { toIp: "DHCP", fromPortOffset: 120, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw1-pc2", "sw1", "Fa0/2", "pc2", "Fa0", { toIp: "DHCP", fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw1-rogue", "sw1", "Fa0/3", "rogue", "Fa0", { toIp: "192.168.10.99", fromPortOffset: 120, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.10.1", "255.255.255.0", "LAN", "DHCP-Pool VLAN10 (ausgenommen .1–.10), Gateway"),
      tableRow("PC1", "FastEthernet0", "DHCP (192.168.10.0/24)", "–", "per DHCP (192.168.10.1)", "LAN", "untrusted (SW1 Fa0/1)"),
      tableRow("PC2", "FastEthernet0", "DHCP (192.168.10.0/24)", "–", "per DHCP (192.168.10.1)", "LAN", "untrusted (SW1 Fa0/2)"),
      tableRow("Angreifer", "FastEthernet0", "192.168.10.99", "255.255.255.0", "im Lab nicht angegeben", "LAN", "Rogue-DHCP-Server an SW1 Fa0/3, untrusted (Gegenprobe)"),
    ],
  },

  // ───────────────────────────── STP Root-Bridge Hardening
  "stp-hardening": {
    viewBox: { width: 1100, height: 480 },
    devices: [
      device("core", "Core", SW4, "switch-l2", "core", 470, 100),
      device("d1", "Dist1", SW4, "switch-l2", "distribution", 250, 290),
      device("d2", "Dist2", SW4, "switch-l2", "distribution", 690, 290),
      device("rogue", "Rogue-Switch", SW4, "switch-l2", "access", 960, 290),
    ],
    zones: [],
    notes: [{ id: "note-rogue", text: "Rogue-Switch: zunächst nicht angeschlossen (Gegenprobe: an Core Gi0/1, Priority 0)", x: 900, y: 420 }],
    links: [
      link("link-core-d1", "core", "Gi0/1", "d1", "Gi0/1", { isTrunk: true, fromPortOffset: 160, fromPortSide: 14, toPortOffset: 110, toPortSide: 14, subnetLabel: "Root Guard", subnetLabelPos: { x: 270, y: 150 } }),
      link("link-core-d2", "core", "Gi0/2", "d2", "Gi0/1", { isTrunk: true, fromPortOffset: 160, fromPortSide: -14, toPortOffset: 110, toPortSide: -14, subnetLabel: "Root Guard", subnetLabelPos: { x: 670, y: 150 } }),
      link("link-d1-d2", "d1", "Gi0/3", "d2", "Gi0/3", { isTrunk: true, fromPortOffset: 90, toPortOffset: 90, toPortSide: 14, subnetLabel: "wird per STP blockiert", subnetLabelPos: { x: 470, y: 330 } }),
    ],
    addressingTable: [],
  },

  // ───────────────────────────── VLAN-Hopping & Mitigation
  "vlan-hopping": {
    viewBox: { width: 1100, height: 500 },
    devices: [
      device("sw1", "SW1", SW, "switch-l2", "access", 300, 100),
      device("sw2", "SW2", SW, "switch-l2", "access", 760, 100),
      endpoint("att", "Angreifer-PC", PC, "pc", 150, 340),
      endpoint("pc0", "PC0", PC, "pc", 450, 340),
      endpoint("pc1", "PC1", PC, "pc", 760, 340),
      device("attsw", "Angreifer-Switch", SW, "switch-l2", "distribution", 1000, 340),
    ],
    zones: [
      zone("zone-1", "VLAN 10 DATA · 192.168.10.0/24", "blue", 50, 260, 500, 220, 10),
      zone("zone-2", "VLAN 10 DATA · 192.168.10.0/24", "blue", 640, 260, 240, 220, 10),
    ],
    vlans: [{ id: 10, name: "DATA", colorTheme: "blue", subnet: "192.168.10.0/24" }],
    notes: [{ id: "note-att", text: "Angreifer-Switch: zunächst nicht angeschlossen (Gegenprobe an SW1 Fa0/1)", x: 990, y: 440 }],
    links: [
      link("link-sw1-sw2", "sw1", "Gi0/1", "sw2", "Gi0/1", { isTrunk: true, fromPortOffset: 70, toPortOffset: 70, toPortSide: 14, subnetLabel: "Trunk · nativ 999 · erlaubt 10,20", subnetLabelPos: { x: 530, y: 60 } }),
      link("link-sw1-att", "sw1", "Fa0/1", "att", "Fa0", { toIp: "192.168.10.99", fromPortOffset: 120, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-pc0", "sw1", "Fa0/2", "pc0", "Fa0", { toIp: "192.168.10.10", fromPortOffset: 120, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw2-pc1", "sw2", "Fa0/1", "pc1", "Fa0", { toIp: "192.168.10.20", fromPortOffset: 100, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      v("Angreifer-PC", "FastEthernet0", "192.168.10.99", "255.255.255.0", "192.168.10.1", 10, "SW1 Fa0/1 (VLAN 10, gehärtet: nonegotiate, PortFast, BPDU Guard)"),
      v("PC0", "FastEthernet0", "192.168.10.10", "255.255.255.0", "192.168.10.1", 10, "SW1 Fa0/2 (VLAN 10)"),
      v("PC1", "FastEthernet0", "192.168.10.20", "255.255.255.0", "192.168.10.1", 10, "SW2 Fa0/1 (VLAN 10)"),
    ],
  },

  // ───────────────────────────── AAA mit RADIUS
  // „SW1 Mgmt → RADIUS-Server (10.0.0.50)“: Port und Maske nennt das Lab nicht; der Server liegt nicht in 192.168.1.0/24.
  "aaa-radius-tacacs": {
    viewBox: { width: 940, height: 500 },
    devices: [
      device("sw1", "SW1", SW, "switch-l2", "core", 470, 100),
      endpoint("radius", "RADIUS-Server", SRV, "server", 200, 340),
      endpoint("admin", "Admin-PC", PC, "pc", 740, 340),
    ],
    zones: [zone("zone-mgmt", "Management 192.168.1.0/24", "blue", 560, 260, 360, 220)],
    notes: [{ id: "note-radius", text: "RADIUS 10.0.0.50 liegt nicht in 192.168.1.0/24, Weg dorthin nennt das Lab nicht", x: 250, y: 440 }],
    links: [
      link("link-sw1-radius", "sw1", "Gi0/1", "radius", "Fa0", { toIp: "10.0.0.50", fromPortOffset: 150, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-admin", "sw1", "Fa0/1", "admin", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 150, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      v("SW1", "Vlan1", "192.168.1.254", "255.255.255.0", "N/A", 1, "Management-SVI, AAA (RADIUS, lokaler Fallback)"),
      v("RADIUS-Server", "FastEthernet0", "10.0.0.50", "im Lab nicht angegeben", "im Lab nicht angegeben", "extern", "Adresse aus `address ipv4 10.0.0.50 auth-port 1812 acct-port 1813`"),
      v("Admin-PC", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.254", 1, "SSH-Client (ssh -l localadmin 192.168.1.254)"),
    ],
  },

  // ───────────────────────────── ACL + Static NAT, Dual-Site mit ISP (IOL, Ethernet0/0-Namen)
  "co-acl-nat-isp": coAclNatIsp(),
};

function coAclNatIsp(): LabTopologyData {
  const co1Hosts: Array<[string, string, string]> = [
    ["vpc9", "VPC-9", "192.168.10.1"],
    ["vpc10", "VPC-10", "192.168.10.2"],
    ["vpc11", "VPC-11", "192.168.10.3"],
    ["rpc", "R-PC", "192.168.10.100"],
  ];
  const co2Hosts: Array<[string, string, string]> = [
    ["vpc12", "VPC-12", "172.16.10.1"],
    ["vpc13", "VPC-13", "172.16.10.2"],
    ["vpc14", "VPC-14", "172.16.10.3"],
    ["intsrv", "INT_SRV", "172.16.10.100"],
  ];
  const netHosts: Array<[string, string, string]> = [
    ["dns", "DNS_SERVER", "200.10.20.10"],
    ["web1", "WEB-1", "200.10.20.20"],
    ["web2", "WEB-2", "200.10.20.30"],
    ["srv1", "SERVER-1", "200.10.20.40"],
    ["user", "USER_PC", "200.10.20.50"],
  ];
  const co1X = [70, 200, 330, 460];
  const co2X = [1300, 1430, 1560, 1690];
  const netX = [560, 720, 880, 1040, 1200];
  const Y = 650;

  const devices: LabTopologyDevice[] = [
    device("co1", "CO-1", IOL_R, "router", "gateway", 270, 100),
    device("co2", "CO-2", IOL_R, "router", "gateway", 1500, 100),
    device("ispsw", "ISP-SW", IOL_SW, "switch-l2", "core", 880, 100),
    device("isp", "ISP-MUMBAI", IOL_R, "router", "wan", 880, 270),
    notConfigured(device("sw1", "SW1", "", "switch-l2", "access", 270, 270)),
    notConfigured(device("sw2", "SW2", "", "switch-l2", "access", 1500, 270)),
    notSpecified(device("net", "Internet-Segment", "", "switch-l2", "distribution", 880, 440)),
    ...co1Hosts.map(([id, name], i) => endpoint(id, name, PC, "pc", co1X[i], Y)),
    ...co2Hosts.map(([id, name], i) => endpoint(id, name, PC, "pc", co2X[i], Y)),
    ...netHosts.map(([id, name], i) => endpoint(id, name, PC, "pc", netX[i], Y)),
  ];

  const links = [
    link("link-co1-ispsw", "co1", "Et0/1", "ispsw", "Et0/0", { fromIp: "20.30.10.10", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14, subnetLabel: "VLAN 99 · 20.30.10.0/24", subnetLabelPos: { x: 575, y: 60 } }),
    link("link-co2-ispsw", "co2", "Et0/1", "ispsw", "Et0/1", { fromIp: "45.35.55.65", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14, subnetLabel: "VLAN 199 · 45.35.55.0/24", subnetLabelPos: { x: 1190, y: 60 } }),
    link("link-ispsw-isp", "ispsw", "Et0/2", "isp", "Et0/0", { isTrunk: true, fromPortOffset: 70, toPortOffset: 70, toPortSide: 14, subnetLabel: "Trunk (dot1q 99, 199)", subnetLabelPos: { x: 1010, y: 185 } }),
    link("link-isp-net", "isp", "Et0/1", "net", "–", { fromIp: "200.10.20.1", fromPortOffset: 70, toPortOffset: 50, toPortSide: 14, subnetLabel: "200.10.20.0/24", subnetLabelPos: { x: 1010, y: 355 } }),
    link("link-co1-sw1", "co1", "Et0/0", "sw1", "–", { fromIp: "192.168.10.254", fromPortOffset: 70, toPortOffset: 50 }),
    link("link-co2-sw2", "co2", "Et0/0", "sw2", "–", { fromIp: "172.16.10.254", fromPortOffset: 70, toPortOffset: 50 }),
    ...co1Hosts.map(([id, , ip], i) => link(`link-sw1-${id}`, "sw1", "–", id, "Fa0", { toIp: ip, fromPortOffset: [150, 110, 110, 150][i], toPortOffset: 90, toPortSide: 14 })),
    ...co2Hosts.map(([id, , ip], i) => link(`link-sw2-${id}`, "sw2", "–", id, "Fa0", { toIp: ip, fromPortOffset: [150, 110, 110, 150][i], toPortOffset: 90, toPortSide: 14 })),
    ...netHosts.map(([id, , ip], i) => link(`link-net-${id}`, "net", "–", id, "Fa0", { toIp: ip, fromPortOffset: [180, 130, 90, 130, 180][i], toPortOffset: 90, toPortSide: 14 })),
  ];

  const rows = [
    ifRow("CO-1", "Et0/0", "192.168.10.254", "255.255.255.0", "LAN CO-1", "Gateway, NAT inside, ACL in-out in"),
    ifRow("CO-1", "Et0/1", "20.30.10.10", "255.255.255.0", "VLAN 99", "NAT outside, statisch 192.168.10.x → 20.30.10.x, ACL out-in in"),
    ifRow("CO-2", "Et0/0", "172.16.10.254", "255.255.255.0", "LAN CO-2", "Gateway, NAT inside, ACL lan-wan in"),
    ifRow("CO-2", "Et0/1", "45.35.55.65", "255.255.255.0", "VLAN 199", "NAT outside, statisch 172.16.10.x → 45.35.55.x, ACL wan-lan in"),
    ifRow("ISP-MUMBAI", "Et0/0.99", "20.30.10.20", "255.255.255.0", 99, "Subinterface zu CO-1 (dot1q 99)"),
    ifRow("ISP-MUMBAI", "Et0/0.199", "45.35.55.75", "255.255.255.0", 199, "Subinterface zu CO-2 (dot1q 199)"),
    ifRow("ISP-MUMBAI", "Et0/1", "200.10.20.1", "255.255.255.0", "Internet", "Gateway des Internet-Segments"),
    ...co1Hosts.map(([, name, ip]) => v(name, "FastEthernet0", ip, "255.255.255.0", "192.168.10.254", "LAN CO-1", name === "R-PC" ? "Admin-Rechner (Telnet/SSH/Web erlaubt)" : "Host im LAN CO-1")),
    ...co2Hosts.map(([, name, ip]) => v(name, "FastEthernet0", ip, "255.255.255.0", "172.16.10.254", "LAN CO-2", name === "INT_SRV" ? "interner Server (SSH/Telnet/Web aus dem Internet)" : "Host im LAN CO-2")),
    ...netHosts.map(([, name, ip]) => v(name, "FastEthernet0", ip, "255.255.255.0", "200.10.20.1", "Internet", "Host im Internet-Segment")),
  ];

  return {
    viewBox: { width: 1780, height: 780 },
    devices,
    zones: [
      zone("zone-co1", "LAN CO-1 192.168.10.0/24", "blue", 20, 570, 520, 200),
      zone("zone-net", "Internet 200.10.20.0/24", "emerald", 500, 570, 760, 200),
      zone("zone-co2", "LAN CO-2 172.16.10.0/24", "amber", 1240, 570, 520, 200),
    ],
    vlans: [
      { id: 99, name: "CO-1 ↔ ISP", colorTheme: "indigo", subnet: "20.30.10.0/24" },
      { id: 199, name: "CO-2 ↔ ISP", colorTheme: "violet", subnet: "45.35.55.0/24" },
    ],
    links,
    addressingTable: rows,
  };
}

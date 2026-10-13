import type { LabTopologyData, LabTopologyDevice } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/**
 * Paket 4: Services (DHCP, NAT, NTP/Syslog/SNMP, HSRP, GRE, IPSec).
 * Portkonvention für im Lab nicht genannte Switch-Ports: Uplink Gi0/1, Endgeräte Fa0/1.. in Reihenfolge (als „angenommen“ markiert).
 * DHCP-Clients zeigen „DHCP (Netz)“; konkrete Adressen entstehen zur Laufzeit.
 */
const R = "Cisco 2911";
const SW = "Catalyst 2960";
const PC = "PC-PT";
const SRV = "Server-PT";

const dhcpClient = (id: string, name: string, x: number, y: number, network: string): LabTopologyDevice => ({
  ...endpoint(id, name, PC, "pc", x, y),
  dhcpNetwork: network,
});

const dhcpRow = (name: string, network: string, gateway: string, desc: string) =>
  tableRow(name, "FastEthernet0", `DHCP (${network})`, "–", gateway, 1, desc);

// ---------------------------------------------------------------------------
// NAT-Familie: gleiche Struktur, andere Adressen
// ---------------------------------------------------------------------------
interface NatOpts {
  sw: string; // "SW1" | "SW"
  natOut: { ip: string; mask: string; ispPort: string; ispIp: string; subnet: string; desc: string };
  ispToInternet: { ispPort: string; ispIp: string; internetPort: string; internetIp: string };
  natInDesc: string;
  pcGateway: boolean;
  pcNames: [string, string, string];
  extraNatRow?: string;
}

function natLab(o: NatOpts): LabTopologyData {
  const [p0, p1, p2] = o.pcNames;
  return {
    viewBox: { width: 1200, height: 620 },
    devices: [
      device("nat", "NAT-Router", R, "router", "gateway", 260, 100),
      device("isp", "ISP", R, "router", "gateway", 520, 100),
      device("inet", "INTERNET", R, "router", "gateway", 780, 100),
      device("web", "Webserver", SRV, "server", "wan", 1040, 100),
      device("sw", o.sw, SW, "switch-l2", "access", 260, 270),
      endpoint("pc0", p0, PC, "pc", 110, 470),
      endpoint("pc1", p1, PC, "pc", 260, 470),
      endpoint("pc2", p2, PC, "pc", 410, 470),
    ],
    zones: [zone("zone-lan", "LAN 192.168.1.0/24 (inside)", "blue", 30, 200, 460, 400)],
    links: [
      link("link-nat-isp", "nat", "Gi0/1", "isp", o.natOut.ispPort, {
        cableType: "copper-cross",
        fromIp: o.natOut.ip,
        toIp: o.natOut.ispIp,
        subnetLabel: o.natOut.subnet,
        subnetLabelPos: { x: 390, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-isp-inet", "isp", o.ispToInternet.ispPort, "inet", o.ispToInternet.internetPort, {
        cableType: "copper-cross",
        fromIp: o.ispToInternet.ispIp,
        toIp: o.ispToInternet.internetIp,
        subnetLabel: "1.1.1.0/30",
        subnetLabelPos: { x: 650, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-inet-web", "inet", "Gi0/0", "web", "Fa0", {
        cableType: "copper-cross",
        fromIp: "47.11.8.1",
        toIp: "47.11.8.15",
        subnetLabel: "47.11.8.0/24",
        subnetLabelPos: { x: 910, y: 60 },
        fromPortOffset: 80,
        toPortOffset: 80,
        toPortSide: 14,
      }),
      link("link-nat-sw", "nat", "Gi0/0", "sw", "Gi0/1", { fromIp: "192.168.1.1", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw-pc0", "sw", "Fa0/1", "pc0", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw-pc1", "sw", "Fa0/2", "pc1", "Fa0", { toIp: "192.168.1.11", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw-pc2", "sw", "Fa0/3", "pc2", "Fa0", { toIp: "192.168.1.12", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("NAT-Router", "Gi0/0", "192.168.1.1", "255.255.255.0", "inside", o.natInDesc),
      ifRow("NAT-Router", "Gi0/1", o.natOut.ip, o.natOut.mask, "outside", o.natOut.desc),
      ifRow("ISP", o.natOut.ispPort, o.natOut.ispIp, o.natOut.mask, "WAN", "Link zum NAT-Router"),
      ifRow("ISP", o.ispToInternet.ispPort, o.ispToInternet.ispIp, "255.255.255.252", "WAN", "Link zu INTERNET"),
      ifRow("INTERNET", o.ispToInternet.internetPort, o.ispToInternet.internetIp, "255.255.255.252", "WAN", "Link zum ISP"),
      ifRow("INTERNET", "Gi0/0", "47.11.8.1", "255.255.255.0", "Webserver-Netz", "Gateway des Webservers"),
      tableRow(p0, "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "inside", "Host im LAN"),
      tableRow(p1, "FastEthernet0", "192.168.1.11", "255.255.255.0", o.pcGateway ? "192.168.1.1" : "im Lab nicht angegeben", "inside", "Adresse aus dem Geräte-Label"),
      tableRow(p2, "FastEthernet0", "192.168.1.12", "255.255.255.0", o.pcGateway ? "192.168.1.1" : "im Lab nicht angegeben", "inside", "Adresse aus dem Geräte-Label"),
      tableRow("Webserver", "FastEthernet0", "47.11.8.15", "255.255.255.0", "47.11.8.1", "Webserver-Netz", "Ziel der Tests"),
    ],
  };
}

export const SERVICES_LABS_TOPOLOGIES: Record<string, LabTopologyData> = {
  // ───────────────────────────── DHCPv4 auf Router
  dhcp: {
    viewBox: { width: 760, height: 620 },
    devices: [
      device("r0", "Router0", R, "router", "gateway", 380, 100),
      device("sw0", "Switch0", SW, "switch-l2", "access", 380, 270),
      dhcpClient("pc0", "PC0", 240, 470, "192.168.1.0/24"),
      dhcpClient("pc1", "PC1", 520, 470, "192.168.1.0/24"),
    ],
    zones: [zone("zone-lan", "LAN 192.168.1.0/24 · DHCP-Pool LAN_POOL", "blue", 100, 200, 560, 400)],
    links: [
      link("link-r0-sw0", "r0", "Gi0/0", "sw0", "Gi0/1", { fromIp: "192.168.1.1", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw0-pc0", "sw0", "Fa0/1", "pc0", "Fa0", { toIp: "DHCP", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw0-pc1", "sw0", "Fa0/2", "pc1", "Fa0", { toIp: "DHCP", fromPortOffset: 110, toPortOffset: 80, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("Router0", "Gi0/0", "192.168.1.1", "255.255.255.0", "LAN", "Gateway, DHCP-Pool LAN_POOL (ausgenommen .1–.10, DNS 8.8.8.8)"),
      dhcpRow("PC0", "192.168.1.0/24", "per DHCP (192.168.1.1)", "DHCP-Client an Switch0"),
      dhcpRow("PC1", "192.168.1.0/24", "per DHCP (192.168.1.1)", "DHCP-Client an Switch0"),
    ],
  },

  // ───────────────────────────── DHCP Relay über VLAN-Grenzen
  "dhcp-relay": {
    viewBox: { width: 1160, height: 640 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 560, 100),
      device("sw1", "SW1", `${SW} · VTP-Server`, "switch-l2", "access", 560, 270),
      device("sw2", "SW2", `${SW} · VTP-Client`, "switch-l2", "access", 1040, 270),
      endpoint("srv", "DHCP-Server", SRV, "server", 110, 480),
      // im Lab genannt, aber ohne Konfiguration und ohne Port: gestrichelt, ohne Export
      { ...endpoint("gelb", "Client Gelb", PC, "pc", 280, 480), assumed: true, assumedReason: "not-configured" },
      dhcpClient("rot", "Client Rot", 560, 480, "172.16.51.0/24"),
      dhcpClient("blau", "Client Blau", 830, 480, "172.16.61.0/24"),
      { ...endpoint("sw2-hosts", "Endgeräte SW2", PC, "pc", 1040, 480), assumed: true, assumedReason: "not-configured" },
    ],
    zones: [
      zone("zone-71", "VLAN 71 Gelb · 192.168.2.0/24", "amber", 10, 410, 340, 210, 71),
      zone("zone-51", "VLAN 51 Rot · 172.16.51.0/24", "rose", 430, 410, 260, 210, 51),
      zone("zone-61", "VLAN 61 Blau · 172.16.61.0/24", "blue", 710, 410, 250, 210, 61),
    ],
    vlans: [
      { id: 51, name: "Rot", colorTheme: "rose", subnet: "172.16.51.0/24" },
      { id: 61, name: "Blau", colorTheme: "blue", subnet: "172.16.61.0/24" },
      { id: 71, name: "Gelb", colorTheme: "amber", subnet: "192.168.2.0/24" },
    ],
    links: [
      link("link-r1-sw1", "r1", "Gi0/0", "sw1", "Gi0/1", { isTrunk: true, fromPortOffset: 70, toPortOffset: 56, subnetLabel: "Trunk 802.1Q", subnetLabelPos: { x: 640, y: 190 } }),
      link("link-sw1-sw2", "sw1", "Gi0/2", "sw2", "Gi0/1", { isTrunk: true, fromPortOffset: 70, toPortOffset: 70, toPortSide: 14, subnetLabel: "Trunk 802.1Q", subnetLabelPos: { x: 820, y: 230 } }),
      link("link-sw1-srv", "sw1", "Fa0/24", "srv", "Fa0", { toIp: "192.168.2.11", fromPortOffset: 140, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-rot", "sw1", "Fa0/1", "rot", "Fa0", { toIp: "DHCP", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw1-blau", "sw1", "Fa0/11", "blau", "Fa0", { toIp: "DHCP", fromPortOffset: 140, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0.51", "172.16.51.1", "255.255.255.0", 51, "Gateway Rot, ip helper-address 192.168.2.11"),
      ifRow("R1", "Gi0/0.61", "172.16.61.1", "255.255.255.0", 61, "Gateway Blau, ip helper-address 192.168.2.11"),
      ifRow("R1", "Gi0/0.71", "192.168.2.1", "255.255.255.0", 71, "Gateway Gelb (Server-VLAN)"),
      tableRow("DHCP-Server", "FastEthernet0", "192.168.2.11", "255.255.255.0", "192.168.2.1", 71, "statisch, Pools Rot und Blau"),
      dhcpRow("Client Rot", "172.16.51.0/24", "per DHCP (172.16.51.1)", "DHCP-Client (VLAN 51) an SW1 Fa0/1"),
      dhcpRow("Client Blau", "172.16.61.0/24", "per DHCP (172.16.61.1)", "DHCP-Client (VLAN 61) an SW1 Fa0/11"),
    ],
  },

  // ───────────────────────────── NAT / PAT (Overload)
  "nat-pat": natLab({
    sw: "SW1",
    natOut: { ip: "200.0.0.1", mask: "255.255.255.252", ispPort: "Gi0/2", ispIp: "200.0.0.2", subnet: "200.0.0.0/30", desc: "outside, PAT über das Interface (overload)" },
    ispToInternet: { ispPort: "Gi0/1", ispIp: "1.1.1.1", internetPort: "Gi0/2", internetIp: "1.1.1.2" },
    natInDesc: "inside, Gateway LAN, ACL 1 erlaubt 192.168.1.0/24",
    pcGateway: false,
    pcNames: ["PC0", "PC0(1)", "PC0(2)"],
  }),

  // ───────────────────────────── Dynamisches NAT (Pool)
  "dynamic-nat": natLab({
    sw: "SW",
    natOut: { ip: "200.0.0.253", mask: "255.255.255.0", ispPort: "Gi0/1", ispIp: "200.0.0.254", subnet: "200.0.0.0/24", desc: "outside, NAT-Pool PUBLIC-POOL 200.0.0.10–200.0.0.12" },
    ispToInternet: { ispPort: "Gi0/2", ispIp: "1.1.1.1", internetPort: "Gi0/2", internetIp: "1.1.1.2" },
    natInDesc: "inside, Gateway LAN, ACL 1 erlaubt 192.168.1.0/24",
    pcGateway: false,
    pcNames: ["PC0", "PC0(1)", "PC0(2)"],
  }),

  // ───────────────────────────── Dynamic NAT: Pool + Overload
  "nat-pool-overload": natLab({
    sw: "SW1",
    natOut: { ip: "200.0.0.5", mask: "255.255.255.248", ispPort: "Gi0/2", ispIp: "200.0.0.6", subnet: "200.0.0.0/29", desc: "outside, Pool DYNAMIC-POOL 200.0.0.1–200.0.0.4 mit overload" },
    ispToInternet: { ispPort: "Gi0/1", ispIp: "1.1.1.1", internetPort: "Gi0/2", internetIp: "1.1.1.2" },
    natInDesc: "inside, Gateway LAN, ACL 1 erlaubt 192.168.1.0/24",
    pcGateway: false,
    pcNames: ["PC0", "PC0(1)", "PC0(2)"],
  }),

  // ───────────────────────────── Statisches NAT
  "static-nat": natLab({
    sw: "SW",
    natOut: { ip: "200.0.0.253", mask: "255.255.255.0", ispPort: "Gi0/1", ispIp: "200.0.0.254", subnet: "200.0.0.0/24", desc: "outside, statisch 192.168.1.10/.11/.12 → 200.0.0.10/.11/.12" },
    ispToInternet: { ispPort: "Gi0/2", ispIp: "1.1.1.1", internetPort: "Gi0/2", internetIp: "1.1.1.2" },
    natInDesc: "inside, Gateway LAN",
    pcGateway: false,
    pcNames: ["PC0", "PC0(1)", "PC0(2)"],
  }),

  // ───────────────────────────── NTP + Syslog + SNMPv2c
  // Der Verteiler zwischen SW1 Gi0/1 und den drei Servern ist im Lab nicht angegeben.
  "ntp-syslog-snmp": {
    viewBox: { width: 940, height: 620 },
    devices: [
      device("sw1", "SW1", "Catalyst 3560-24PS", "switch-l3", "core", 470, 100),
      { ...device("dist", "Verteiler", "", "switch-l2", "access", 470, 270), assumed: true },
      endpoint("ntp", "NTP-Server", SRV, "server", 250, 470),
      endpoint("syslog", "Syslog-Server", SRV, "server", 470, 470),
      endpoint("snmp", "SNMP-Manager", SRV, "server", 690, 470),
    ],
    zones: [zone("zone-99", "Server-VLAN 99 (MGMT) · 10.0.0.0/24", "blue", 120, 190, 700, 410, 99)],
    vlans: [{ id: 99, name: "MGMT", colorTheme: "blue", subnet: "10.0.0.0/24" }],
    links: [
      link("link-sw1-dist", "sw1", "Gi0/1", "dist", "–", { fromPortOffset: 80, toPortOffset: 60 }),
      link("link-dist-ntp", "dist", "–", "ntp", "Fa0", { toIp: "10.0.0.10", fromPortOffset: 130, toPortOffset: 90, toPortSide: 14 }),
      link("link-dist-syslog", "dist", "–", "syslog", "Fa0", { toIp: "10.0.0.20", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-dist-snmp", "dist", "–", "snmp", "Fa0", { toIp: "10.0.0.30", fromPortOffset: 130, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      tableRow("SW1", "Vlan99", "10.0.0.2", "255.255.255.0", "N/A", 99, "Management-SVI (VLAN 99 MGMT), Gi0/1 ist Access-Port in VLAN 99"),
      tableRow("SW1", "Loopback0", "10.0.0.1", "255.255.255.255", "N/A", "Loopback", "Quelle für NTP und Syslog"),
      tableRow("NTP-Server", "FastEthernet0", "10.0.0.10", "255.255.255.0", "im Lab nicht angegeben", 99, "Adresse aus `ntp server 10.0.0.10`"),
      tableRow("Syslog-Server", "FastEthernet0", "10.0.0.20", "255.255.255.0", "im Lab nicht angegeben", 99, "Adresse aus `logging host 10.0.0.20`"),
      tableRow("SNMP-Manager", "FastEthernet0", "10.0.0.30", "255.255.255.0", "im Lab nicht angegeben", 99, "Adresse aus `snmp-server host 10.0.0.30`"),
    ],
  },

  // ───────────────────────────── HSRP
  // Switch zwischen R1, R2 und PC0 ist im Lab nicht angegeben.
  hsrp: {
    viewBox: { width: 940, height: 580 },
    devices: [
      device("r1", "R1", R, "router", "gateway", 240, 100),
      device("r2", "R2", R, "router", "gateway", 700, 100),
      { ...device("dist", "Verteiler", "", "switch-l2", "access", 470, 270), assumed: true },
      endpoint("pc0", "PC0", PC, "pc", 470, 450),
    ],
    zones: [zone("zone-lan", "LAN 192.168.1.0/24 · HSRP 1 · virtuelle IP 192.168.1.1", "blue", 100, 190, 740, 370)],
    links: [
      link("link-r1-dist", "r1", "Gi0/0", "dist", "–", { fromIp: "192.168.1.2", fromPortOffset: 90, toPortOffset: 70 }),
      link("link-r2-dist", "r2", "Gi0/0", "dist", "–", { fromIp: "192.168.1.3", fromPortOffset: 90, fromPortSide: 14, toPortOffset: 70 }),
      link("link-dist-pc0", "dist", "–", "pc0", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1", "Gi0/0", "192.168.1.2", "255.255.255.0", "LAN", "HSRP 1 Active, Priority 110, preempt, virtuelle IP 192.168.1.1"),
      ifRow("R2", "Gi0/0", "192.168.1.3", "255.255.255.0", "LAN", "HSRP 1 Standby, Priority 100 (Default), preempt, virtuelle IP 192.168.1.1"),
      tableRow("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "LAN", "Gateway = virtuelle HSRP-IP"),
    ],
  },

  // ───────────────────────────── GRE-Tunnel
  "gre-tunnel": {
    viewBox: { width: 1000, height: 620 },
    devices: [
      device("inet", "Internet", R, "router", "wan", 500, 100),
      device("r1", "R1-1", R, "router", "gateway", 200, 290),
      device("r2", "R2-1", R, "router", "gateway", 800, 290),
      endpoint("pc0", "PC0", PC, "pc", 200, 490),
      endpoint("pc1", "PC1", PC, "pc", 800, 490),
    ],
    zones: [
      zone("zone-site1", "Site 1 · 192.168.1.0/24", "blue", 80, 410, 240, 190),
      zone("zone-site2", "Site 2 · 192.168.2.0/24", "amber", 680, 410, 240, 190),
    ],
    links: [
      link("link-inet-r1", "inet", "Se0/0/0", "r1", "Se0/0/0", { cableType: "serial", fromIp: "1.1.1.1", toIp: "1.1.1.2", fromPortOffset: 100, fromPortSide: 14, toPortOffset: 110, toPortSide: -14, subnetLabel: "1.1.1.0/30", subnetLabelPos: { x: 300, y: 150 } }),
      link("link-inet-r2", "inet", "Se0/0/1", "r2", "Se0/0/0", { cableType: "serial", fromIp: "2.2.2.1", toIp: "2.2.2.2", fromPortOffset: 100, fromPortSide: -14, toPortOffset: 110, toPortSide: 14, subnetLabel: "2.2.2.0/30", subnetLabelPos: { x: 700, y: 150 } }),
      link("link-tunnel", "r1", "Tu12", "r2", "Tu12", {
        cableType: "tunnel",
        fromIp: "216.145.12.1",
        toIp: "216.145.12.2",
        subnetLabel: "Tunnel12 (GRE) 216.145.12.0/30",
        subnetLabelPos: { x: 500, y: 290 },
        fromPortOffset: 100,
        toPortOffset: 100,
        toPortSide: 14,
      }),
      link("link-r1-pc0", "r1", "Gi0/0", "pc0", "Fa0", { cableType: "copper-cross", fromIp: "192.168.1.1", toIp: "192.168.1.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-r2-pc1", "r2", "Gi0/0", "pc1", "Fa0", { cableType: "copper-cross", fromIp: "192.168.2.1", toIp: "192.168.2.10", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("R1-1", "Gi0/0", "192.168.1.1", "255.255.255.0", "Site 1", "Gateway LAN, OSPF"),
      ifRow("R1-1", "Se0/0/0", "1.1.1.2", "255.255.255.252", "Internet", "öffentliches Interface, Tunnel-Quelle"),
      ifRow("R1-1", "Tu12", "216.145.12.1", "255.255.255.252", "Tunnel", "GRE-Tunnel zu R2-1 (Ziel 2.2.2.2), OSPF"),
      ifRow("R2-1", "Gi0/0", "192.168.2.1", "255.255.255.0", "Site 2", "Gateway LAN, OSPF"),
      ifRow("R2-1", "Se0/0/0", "2.2.2.2", "255.255.255.252", "Internet", "öffentliches Interface, Tunnel-Quelle"),
      ifRow("R2-1", "Tu12", "216.145.12.2", "255.255.255.252", "Tunnel", "GRE-Tunnel zu R1-1 (Ziel 1.1.1.2), OSPF"),
      ifRow("Internet", "Se0/0/0", "1.1.1.1", "255.255.255.252", "Internet", "Link zu R1-1"),
      ifRow("Internet", "Se0/0/1", "2.2.2.1", "255.255.255.252", "Internet", "Link zu R2-1"),
      tableRow("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.1", "Site 1", "Host an R1-1 Gi0/0"),
      tableRow("PC1", "FastEthernet0", "192.168.2.10", "255.255.255.0", "192.168.2.1", "Site 2", "Host an R2-1 Gi0/0"),
    ],
  },

  // ───────────────────────────── IPSec Site-to-Site: Hamburg ↔ Bremen
  "ipsec-s2s-vpn": {
    viewBox: { width: 1290, height: 640 },
    devices: [
      device("hh", "Hamburg", R, "router", "gateway", 180, 100),
      device("isp1", "ISP1", R, "router", "gateway", 410, 100),
      device("i1", "Internet1", R, "router", "gateway", 640, 100),
      device("isp2", "ISP2", R, "router", "gateway", 870, 100),
      device("hb", "Bremen", R, "router", "gateway", 1100, 100),
      device("sw1", "SW1", SW, "switch-l2", "access", 180, 270),
      device("sw2", "SW2", SW, "switch-l2", "access", 1100, 270),
      device("i2", "Internet2", R, "router", "core", 640, 290),
      endpoint("pc0", "PC0", PC, "pc", 40, 490),
      endpoint("pc1", "PC1", PC, "pc", 180, 490),
      endpoint("dhcp", "DHCP-Server", SRV, "server", 320, 490),
      endpoint("web", "Webserver", SRV, "server", 640, 490),
      endpoint("pc2", "PC2", PC, "pc", 1010, 490),
      endpoint("pc3", "PC3", PC, "pc", 1190, 490),
    ],
    zones: [
      zone("zone-hh", "LAN Hamburg 192.168.1.0/24", "blue", 10, 410, 370, 220),
      zone("zone-hb", "LAN Bremen 192.168.2.0/24", "amber", 920, 410, 360, 220),
    ],
    notes: [{ id: "note-ipsec", text: "IPSec-Tunnel: Hamburg 100.0.0.1 ↔ Bremen 200.0.0.1 (über das Provider-Internet)", x: 640, y: 28 }],
    links: [
      link("link-hh-isp1", "hh", "Gi0/1", "isp1", "Gi0/2", { cableType: "copper-cross", fromIp: "100.0.0.1", toIp: "100.0.0.2", subnetLabel: "100.0.0.0/30", subnetLabelPos: { x: 295, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-isp1-i1", "isp1", "Gi0/1", "i1", "Gi0/2", { cableType: "copper-cross", fromIp: "2.2.2.1", toIp: "2.2.2.2", subnetLabel: "2.2.2.0/30", subnetLabelPos: { x: 525, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-i1-isp2", "i1", "Gi0/0", "isp2", "Gi0/1", { cableType: "copper-cross", fromIp: "3.3.3.1", toIp: "3.3.3.2", subnetLabel: "3.3.3.0/30", subnetLabelPos: { x: 755, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-isp2-hb", "isp2", "Gi0/2", "hb", "Gi0/1", { cableType: "copper-cross", fromIp: "200.0.0.2", toIp: "200.0.0.1", subnetLabel: "200.0.0.0/30", subnetLabelPos: { x: 985, y: 60 }, fromPortOffset: 80, toPortOffset: 80, toPortSide: 14 }),
      link("link-i1-i2", "i1", "Gi0/1", "i2", "Gi0/2", { cableType: "copper-cross", fromIp: "1.1.1.1", toIp: "1.1.1.2", subnetLabel: "1.1.1.0/30", subnetLabelPos: { x: 720, y: 195 }, fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
      link("link-i2-web", "i2", "Gi0/0", "web", "Fa0", { cableType: "copper-cross", fromIp: "47.11.8.1", toIp: "47.11.8.15", subnetLabel: "47.11.8.0/24", subnetLabelPos: { x: 740, y: 390 }, fromPortOffset: 70, toPortOffset: 70, toPortSide: 14 }),
      link("link-hh-sw1", "hh", "Gi0/0", "sw1", "Gi0/1", { fromIp: "192.168.1.254", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw1-pc0", "sw1", "Fa0/1", "pc0", "Fa0", { toIp: "192.168.1.10", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-pc1", "sw1", "Fa0/2", "pc1", "Fa0", { toIp: "192.168.1.20", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-dhcp", "sw1", "Fa0/24", "dhcp", "Fa0", { toIp: "192.168.1.11", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14 }),
      link("link-hb-sw2", "hb", "Gi0/0", "sw2", "Gi0/2", { fromIp: "192.168.2.254", fromPortOffset: 70, toPortOffset: 56 }),
      link("link-sw2-pc2", "sw2", "Fa0/1", "pc2", "Fa0", { toIp: "192.168.2.10", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw2-pc3", "sw2", "Fa0/2", "pc3", "Fa0", { toIp: "192.168.2.20", fromPortOffset: 90, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      ifRow("Hamburg", "Gi0/0", "192.168.1.254", "255.255.255.0", "LAN Hamburg", "Gateway LAN"),
      ifRow("Hamburg", "Gi0/1", "100.0.0.1", "255.255.255.252", "WAN", "Tunnel-Endpunkt, crypto map IPSEC-MAP"),
      ifRow("ISP1", "Gi0/2", "100.0.0.2", "255.255.255.252", "WAN", "Link zu Hamburg"),
      ifRow("ISP1", "Gi0/1", "2.2.2.1", "255.255.255.252", "Core", "Link zu Internet1"),
      ifRow("Internet1", "Gi0/2", "2.2.2.2", "255.255.255.252", "Core", "Link zu ISP1"),
      ifRow("Internet1", "Gi0/1", "1.1.1.1", "255.255.255.252", "Core", "Link zu Internet2"),
      ifRow("Internet1", "Gi0/0", "3.3.3.1", "255.255.255.252", "Core", "Link zu ISP2"),
      ifRow("Internet2", "Gi0/2", "1.1.1.2", "255.255.255.252", "Core", "Link zu Internet1"),
      ifRow("Internet2", "Gi0/0", "47.11.8.1", "255.255.255.0", "Webserver-Netz", "Gateway Webserver"),
      ifRow("ISP2", "Gi0/1", "3.3.3.2", "255.255.255.252", "Core", "Link zu Internet1"),
      ifRow("ISP2", "Gi0/2", "200.0.0.2", "255.255.255.252", "WAN", "Link zu Bremen"),
      ifRow("Bremen", "Gi0/0", "192.168.2.254", "255.255.255.0", "LAN Bremen", "Gateway LAN"),
      ifRow("Bremen", "Gi0/1", "200.0.0.1", "255.255.255.252", "WAN", "Tunnel-Endpunkt, crypto map IPSEC-MAP"),
      tableRow("SW1", "Vlan1", "192.168.1.2", "255.255.255.0", "192.168.1.254", 1, "Management-SVI, default-gateway Hamburg"),
      tableRow("SW2", "Vlan1", "192.168.2.2", "255.255.255.0", "192.168.2.254", 1, "Management-SVI, default-gateway Bremen"),
      tableRow("PC0", "FastEthernet0", "192.168.1.10", "255.255.255.0", "192.168.1.254", "LAN Hamburg", "Host an SW1"),
      tableRow("PC1", "FastEthernet0", "192.168.1.20", "255.255.255.0", "192.168.1.254", "LAN Hamburg", "Host an SW1"),
      tableRow("DHCP-Server", "FastEthernet0", "192.168.1.11", "255.255.255.0", "192.168.1.254", "LAN Hamburg", "statisch, an SW1 Fa0/24"),
      tableRow("PC2", "FastEthernet0", "192.168.2.10", "255.255.255.0", "192.168.2.254", "LAN Bremen", "Host an SW2"),
      tableRow("PC3", "FastEthernet0", "192.168.2.20", "255.255.255.0", "192.168.2.254", "LAN Bremen", "Host an SW2"),
      tableRow("Webserver", "FastEthernet0", "47.11.8.15", "255.255.255.0", "47.11.8.1", "Webserver-Netz", "an Internet2"),
    ],
  },
};

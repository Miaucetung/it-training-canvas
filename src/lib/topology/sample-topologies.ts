import { NetworkTopology } from "@/types/topology";

// ============================================================================
// CCNA 200-301 Curated Reference Topologies (Schema Version 2.0)
// ============================================================================

/** 1. Basic Enterprise LAN (Router, Switch, 2 PCs, Server) */
export const TOPOLOGY_BASIC_LAN: NetworkTopology = {
  id: "ccna-basic-lan",
  name: "Einfaches Unternehmens-LAN",
  description: "Klassisches SOHO/Branch-LAN mit Router R1 als Default Gateway (192.168.1.1/24), Access-Switch SW1, zwei Clients und Webserver.",
  version: "2.0",
  category: "fundamentals",
  devices: [
    {
      id: "r1",
      name: "R1 (Gateway)",
      type: "router",
      x: 380,
      y: 60,
      interfaces: [
        { id: "r1-gi00", name: "Gi0/0", ip: "192.168.1.1/24", mac: "00:50:79:66:68:01", status: "up" },
        { id: "r1-gi01", name: "Gi0/1", ip: "203.0.113.2/30", status: "up" },
      ],
      config: {
        hostname: "R1-Gateway",
        defaultGateway: "203.0.113.1",
        showOutputs: {
          "show ip interface brief": "Interface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     192.168.1.1     YES manual up                    up\nGigabitEthernet0/1     203.0.113.2     YES manual up                    up",
          "show ip route": "Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP\n       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area\n\nGateway of last resort is 203.0.113.1 to network 0.0.0.0\n\nS*    0.0.0.0/0 [1/0] via 203.0.113.1\nC     192.168.1.0/24 is directly connected, GigabitEthernet0/0\nC     203.0.113.0/30 is directly connected, GigabitEthernet0/1",
        },
      },
    },
    {
      id: "sw1",
      name: "SW1 (Access)",
      type: "switch-l2",
      x: 380,
      y: 190,
      interfaces: [
        { id: "sw1-gi01", name: "Gi0/1", status: "up" },
        { id: "sw1-fa01", name: "Fa0/1", vlan: 1, mode: "access", status: "up" },
        { id: "sw1-fa02", name: "Fa0/2", vlan: 1, mode: "access", status: "up" },
        { id: "sw1-fa03", name: "Fa0/3", vlan: 1, mode: "access", status: "up" },
      ],
      config: {
        hostname: "SW1-Access",
        showOutputs: {
          "show mac address-table": "          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   1    0050.7966.6801    DYNAMIC     Gi0/1\n   1    0050.7966.6802    DYNAMIC     Fa0/1\n   1    0050.7966.6803    DYNAMIC     Fa0/2\n   1    0050.7966.6804    DYNAMIC     Fa0/3",
        },
      },
    },
    {
      id: "pc1",
      name: "PC-1 (Finanzen)",
      type: "pc",
      x: 180,
      y: 330,
      interfaces: [
        { id: "pc1-eth0", name: "eth0", ip: "192.168.1.10/24", mac: "00:50:79:66:68:02", status: "up" },
      ],
      config: { hostname: "PC1", defaultGateway: "192.168.1.1" },
    },
    {
      id: "pc2",
      name: "PC-2 (Marketing)",
      type: "pc",
      x: 380,
      y: 330,
      interfaces: [
        { id: "pc2-eth0", name: "eth0", ip: "192.168.1.20/24", mac: "00:50:79:66:68:03", status: "up" },
      ],
      config: { hostname: "PC2", defaultGateway: "192.168.1.1" },
    },
    {
      id: "srv1",
      name: "SRV-1 (Intranet)",
      type: "server",
      x: 580,
      y: 330,
      interfaces: [
        { id: "srv1-eth0", name: "eth0", ip: "192.168.1.100/24", mac: "00:50:79:66:68:04", status: "up" },
      ],
      config: { hostname: "SRV-Intranet", defaultGateway: "192.168.1.1" },
    },
  ],
  links: [
    {
      id: "link-r1-sw1",
      sourceDeviceId: "r1",
      sourceInterfaceId: "r1-gi00",
      targetDeviceId: "sw1",
      targetInterfaceId: "sw1-gi01",
      linkType: "ethernet",
      status: "up",
      label: "Gi0/0 ↔ Gi0/1",
      bandwidth: "1 Gbps",
    },
    {
      id: "link-sw1-pc1",
      sourceDeviceId: "sw1",
      sourceInterfaceId: "sw1-fa01",
      targetDeviceId: "pc1",
      targetInterfaceId: "pc1-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Fa0/1",
    },
    {
      id: "link-sw1-pc2",
      sourceDeviceId: "sw1",
      sourceInterfaceId: "sw1-fa02",
      targetDeviceId: "pc2",
      targetInterfaceId: "pc2-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Fa0/2",
    },
    {
      id: "link-sw1-srv1",
      sourceDeviceId: "sw1",
      sourceInterfaceId: "sw1-fa03",
      targetDeviceId: "srv1",
      targetInterfaceId: "srv1-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Fa0/3",
    },
  ],
  subnetZones: [
    {
      id: "zone-lan",
      name: "LAN Subnetz",
      cidr: "192.168.1.0/24",
      color: "#10B981",
      x: 120,
      y: 150,
      width: 540,
      height: 250,
    },
  ],
};

/** 2. Router-on-a-Stick (802.1Q Inter-VLAN Routing) */
export const TOPOLOGY_ROUTER_ON_A_STICK: NetworkTopology = {
  id: "ccna-router-on-a-stick",
  name: "Router-on-a-Stick (Inter-VLAN)",
  description: "802.1Q Trunk-Link zwischen R1 und SW1; Subinterfaces Gi0/0.10 (encapsulation dot1q 10) und Gi0/0.20 (encapsulation dot1q 20) ermöglichen Inter-VLAN-Routing.",
  version: "2.0",
  category: "switching",
  devices: [
    {
      id: "roas-r1",
      name: "R1 (Inter-VLAN)",
      type: "router",
      x: 360,
      y: 50,
      interfaces: [
        { id: "r1-gi00", name: "Gi0/0", status: "up", description: "Physical Trunk (no ip address)" },
        { id: "r1-sub10", name: "Gi0/0.10", ip: "192.168.10.1/24", vlan: 10, status: "up", description: "encapsulation dot1q 10" },
        { id: "r1-sub20", name: "Gi0/0.20", ip: "192.168.20.1/24", vlan: 20, status: "up", description: "encapsulation dot1q 20" },
      ],
      config: {
        hostname: "R1-ROAS",
        showOutputs: {
          "show ip route": "Codes: C - connected, S - static, R - RIP, O - OSPF\n\nC    192.168.10.0/24 is directly connected, GigabitEthernet0/0.10\nC    192.168.20.0/24 is directly connected, GigabitEthernet0/0.20",
          "show running-config interface GigabitEthernet0/0": "interface GigabitEthernet0/0\n no ip address\n no shutdown\n!\ninterface GigabitEthernet0/0.10\n encapsulation dot1q 10\n ip address 192.168.10.1 255.255.255.0\n!\ninterface GigabitEthernet0/0.20\n encapsulation dot1q 20\n ip address 192.168.20.1 255.255.255.0",
          "show ip interface brief": "Interface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0     unassigned      YES manual up                    up\nGigabitEthernet0/0.10  192.168.10.1    YES manual up                    up\nGigabitEthernet0/0.20  192.168.20.1    YES manual up                    up",
        },
      },
    },
    {
      id: "roas-sw1",
      name: "SW1 (Trunk Switch)",
      type: "switch-l2",
      x: 360,
      y: 190,
      interfaces: [
        { id: "sw1-trunk", name: "Gi0/1", mode: "trunk", status: "up", description: "switchport mode trunk" },
        { id: "sw1-fa10", name: "Fa0/10", vlan: 10, mode: "access", status: "up", description: "switchport access vlan 10" },
        { id: "sw1-fa20", name: "Fa0/20", vlan: 20, mode: "access", status: "up", description: "switchport access vlan 20" },
      ],
      config: {
        hostname: "SW1",
        vlans: [
          { id: 10, name: "SALES" },
          { id: 20, name: "DEV" },
        ],
        showOutputs: {
          "show interfaces trunk": "Port        Mode             Encapsulation  Status        Native vlan\nGi0/1       on               802.1q         trunking      1\n\nPort        Vlans allowed on trunk\nGi0/1       10,20\n\nPort        Vlans in spanning tree forwarding state and not pruned\nGi0/1       10,20",
          "show vlan brief": "VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n1    default                          active    Fa0/1-9, Fa0/11-19, Fa0/21-24\n10   SALES                            active    Fa0/10\n20   DEV                              active    Fa0/20",
        },
      },
    },
    {
      id: "roas-pc10",
      name: "PC1 (VLAN 10)",
      type: "pc",
      x: 200,
      y: 330,
      interfaces: [
        { id: "pc10-eth0", name: "eth0", ip: "192.168.10.50/24", vlan: 10, status: "up" },
      ],
      config: { hostname: "PC-Sales", defaultGateway: "192.168.10.1" },
    },
    {
      id: "roas-pc20",
      name: "PC2 (VLAN 20)",
      type: "pc",
      x: 520,
      y: 330,
      interfaces: [
        { id: "pc20-eth0", name: "eth0", ip: "192.168.20.50/24", vlan: 20, status: "up" },
      ],
      config: { hostname: "PC-Dev", defaultGateway: "192.168.20.1" },
    },
  ],
  links: [
    {
      id: "link-trunk",
      sourceDeviceId: "roas-r1",
      sourceInterfaceId: "r1-gi00",
      targetDeviceId: "roas-sw1",
      targetInterfaceId: "sw1-trunk",
      linkType: "trunk",
      status: "up",
      label: "802.1Q Trunk (VLAN 10, 20)",
      vlansAllowed: [10, 20],
      animated: true,
    },
    {
      id: "link-vlan10",
      sourceDeviceId: "roas-sw1",
      sourceInterfaceId: "sw1-fa10",
      targetDeviceId: "roas-pc10",
      targetInterfaceId: "pc10-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Access VLAN 10",
    },
    {
      id: "link-vlan20",
      sourceDeviceId: "roas-sw1",
      sourceInterfaceId: "sw1-fa20",
      targetDeviceId: "roas-pc20",
      targetInterfaceId: "pc20-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Access VLAN 20",
    },
  ],
  vlans: [
    { id: 10, name: "SALES", color: "#3B82F6", subnet: "192.168.10.0/24" },
    { id: 20, name: "DEV", color: "#8B5CF6", subnet: "192.168.20.0/24" },
  ],
};

/** 3. Spanning Tree Protocol (STP Dreieck mit Blocking Port - 802.1D) */
export const TOPOLOGY_STP_TRIANGLE: NetworkTopology = {
  id: "ccna-stp-triangle",
  name: "Spanning Tree (802.1D STP) Schleifenvermeidung",
  description: "Klassisches 3-Switch-Dreieck nach 802.1D. SW-A ist Root Bridge (Prio 24576). Port Gi0/2 an SW-C in Richtung SW-B ist im Zustand Blocking (BLK), um Broadcast-Stürme zu verhindern.",
  version: "2.0",
  category: "switching",
  devices: [
    {
      id: "stp-swa",
      name: "SW-A (Root Bridge)",
      type: "switch-l2",
      x: 380,
      y: 60,
      interfaces: [
        { id: "swa-gi01", name: "Gi0/1", status: "up", portRole: "DP", description: "Designated Port (FWD)" },
        { id: "swa-gi02", name: "Gi0/2", status: "up", portRole: "DP", description: "Designated Port (FWD)" },
      ],
      config: {
        hostname: "SW-A",
        stp: { priority: 24576 },
      },
    },
    {
      id: "stp-swb",
      name: "SW-B",
      type: "switch-l2",
      x: 180,
      y: 280,
      interfaces: [
        { id: "swb-gi01", name: "Gi0/1", status: "up", portRole: "RP", description: "Root Port (FWD)" },
        { id: "swb-gi02", name: "Gi0/2", status: "up", portRole: "DP", description: "Designated Port (FWD)" },
      ],
      config: {
        hostname: "SW-B",
        stp: { priority: 28672 },
      },
    },
    {
      id: "stp-swc",
      name: "SW-C",
      type: "switch-l2",
      x: 580,
      y: 280,
      interfaces: [
        { id: "swc-gi01", name: "Gi0/1", status: "up", portRole: "RP", description: "Root Port (FWD - Richtung SW-A)" },
        { id: "swc-gi02", name: "Gi0/2", status: "up", portRole: "BLK", description: "Blocking Port (BLK - Richtung SW-B)" },
      ],
      config: {
        hostname: "SW-C",
        stp: { priority: 32768 },
      },
    },
  ],
  links: [
    {
      id: "link-swa-swb",
      sourceDeviceId: "stp-swa",
      sourceInterfaceId: "swa-gi01",
      targetDeviceId: "stp-swb",
      targetInterfaceId: "swb-gi01",
      linkType: "trunk",
      status: "stp-forwarding",
      label: "FWD (Root Port SW-B)",
    },
    {
      id: "link-swa-swc",
      sourceDeviceId: "stp-swa",
      sourceInterfaceId: "swa-gi02",
      targetDeviceId: "stp-swc",
      targetInterfaceId: "swc-gi01",
      linkType: "trunk",
      status: "stp-forwarding",
      label: "FWD (Root Port SW-C)",
    },
    {
      id: "link-swb-swc",
      sourceDeviceId: "stp-swb",
      sourceInterfaceId: "swb-gi02",
      targetDeviceId: "stp-swc",
      targetInterfaceId: "swc-gi02",
      linkType: "trunk",
      status: "stp-blocking",
      label: "BLK (SW-C Gi0/2 Richtung SW-B)",
    },
  ],
};

/** 4. OSPFv2 Multi-Router Routing mit LANs und P2P Point-to-Point */
export const TOPOLOGY_OSPF: NetworkTopology = {
  id: "ccna-ospf-routing",
  name: "OSPFv2 Point-to-Point Routing mit LANs",
  description: "Zwei Router R1 und R2 in OSPF Area 0. Das Transitnetz ist Ethernet mit 'ip ospf network point-to-point'. Dahinter je ein Kunden-LAN (192.168.1.0/24 und 192.168.2.0/24), wodurch OSPF-Routen (O) in der Routingtabelle gelernt werden.",
  version: "2.0",
  category: "routing",
  devices: [
    {
      id: "ospf-r1",
      name: "R1 (Area 0)",
      type: "router",
      x: 320,
      y: 120,
      interfaces: [
        { id: "r1-transit", name: "Gi0/0", ip: "10.0.12.1/30", status: "up", description: "ip ospf network point-to-point", ospf: { area: 0, networkType: "point-to-point" } },
        { id: "r1-lan", name: "Gi0/1", ip: "192.168.1.1/24", status: "up", description: "LAN 1 Gateway", ospf: { area: 0, passive: true } },
        { id: "r1-loopback", name: "Lo0", ip: "1.1.1.1/32", status: "up", description: "OSPF Router-ID" },
      ],
      config: {
        hostname: "R1",
        routingProtocols: ["OSPF 1 Area 0"],
      },
    },
    {
      id: "ospf-sw1",
      name: "SW1 (LAN 1)",
      type: "switch-l2",
      x: 140,
      y: 240,
      interfaces: [
        { id: "sw1-up", name: "Gi0/1", status: "up" },
        { id: "sw1-down", name: "Fa0/1", status: "up" },
        { id: "sw1-fa2", name: "Fa0/2", status: "up" },
        { id: "sw1-fa3", name: "Fa0/3", status: "up" },
      ],
      config: { hostname: "SW1" },
    },
    {
      id: "ospf-pc1",
      name: "PC1 (LAN 1)",
      type: "pc",
      x: 140,
      y: 380,
      interfaces: [
        { id: "pc1-eth0", name: "eth0", ip: "192.168.1.10/24", status: "up" },
      ],
      config: { hostname: "PC1", defaultGateway: "192.168.1.1" },
    },
    {
      id: "ospf-r2",
      name: "R2 (Area 0)",
      type: "router",
      x: 560,
      y: 120,
      interfaces: [
        { id: "r2-transit", name: "Gi0/0", ip: "10.0.12.2/30", status: "up", description: "ip ospf network point-to-point", ospf: { area: 0, networkType: "point-to-point" } },
        { id: "r2-lan", name: "Gi0/1", ip: "192.168.2.1/24", status: "up", description: "LAN 2 Gateway", ospf: { area: 0, passive: true } },
        { id: "r2-loopback", name: "Lo0", ip: "2.2.2.2/32", status: "up", description: "OSPF Router-ID" },
      ],
      config: {
        hostname: "R2",
        routingProtocols: ["OSPF 1 Area 0"],
      },
    },
    {
      id: "ospf-sw2",
      name: "SW2 (LAN 2)",
      type: "switch-l2",
      x: 740,
      y: 240,
      interfaces: [
        { id: "sw2-up", name: "Gi0/1", status: "up" },
        { id: "sw2-down", name: "Fa0/1", status: "up" },
        { id: "sw2-fa2", name: "Fa0/2", status: "up" },
        { id: "sw2-fa3", name: "Fa0/3", status: "up" },
      ],
      config: { hostname: "SW2" },
    },
    {
      id: "ospf-pc2",
      name: "PC2 (LAN 2)",
      type: "pc",
      x: 740,
      y: 380,
      interfaces: [
        { id: "pc2-eth0", name: "eth0", ip: "192.168.2.10/24", status: "up" },
      ],
      config: { hostname: "PC2", defaultGateway: "192.168.2.1" },
    },
  ],
  links: [
    {
      id: "link-ospf-transit",
      sourceDeviceId: "ospf-r1",
      sourceInterfaceId: "r1-transit",
      targetDeviceId: "ospf-r2",
      targetInterfaceId: "r2-transit",
      linkType: "ethernet",
      status: "up",
      label: "10.0.12.0/30 (P2P Area 0)",
      bandwidth: "1 Gbps",
      animated: true,
    },
    {
      id: "link-r1-sw1",
      sourceDeviceId: "ospf-r1",
      sourceInterfaceId: "r1-lan",
      targetDeviceId: "ospf-sw1",
      targetInterfaceId: "sw1-up",
      linkType: "ethernet",
      status: "up",
      label: "Gi0/1 ↔ Gi0/1",
    },
    {
      id: "link-sw1-pc1",
      sourceDeviceId: "ospf-sw1",
      sourceInterfaceId: "sw1-down",
      targetDeviceId: "ospf-pc1",
      targetInterfaceId: "pc1-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Fa0/1 ↔ eth0",
    },
    {
      id: "link-r2-sw2",
      sourceDeviceId: "ospf-r2",
      sourceInterfaceId: "r2-lan",
      targetDeviceId: "ospf-sw2",
      targetInterfaceId: "sw2-up",
      linkType: "ethernet",
      status: "up",
      label: "Gi0/1 ↔ Gi0/1",
    },
    {
      id: "link-sw2-pc2",
      sourceDeviceId: "ospf-sw2",
      sourceInterfaceId: "sw2-down",
      targetDeviceId: "ospf-pc2",
      targetInterfaceId: "pc2-eth0",
      linkType: "ethernet",
      status: "up",
      label: "Fa0/1 ↔ eth0",
    },
  ],
  subnetZones: [
    {
      id: "zone-lan1",
      name: "LAN 1",
      cidr: "192.168.1.0/24",
      color: "#0EA5E9",
      x: 100,
      y: 190,
      width: 170,
      height: 250,
    },
    {
      id: "zone-lan2",
      name: "LAN 2",
      cidr: "192.168.2.0/24",
      color: "#8B5CF6",
      x: 700,
      y: 190,
      width: 170,
      height: 250,
    },
    {
      id: "zone-transit",
      name: "OSPF Backbone Transit",
      cidr: "10.0.12.0/30",
      color: "#10B981",
      x: 290,
      y: 70,
      width: 380,
      height: 120,
    },
  ],
};

export const BUILT_IN_CCNA_TOPOLOGIES: NetworkTopology[] = [
  TOPOLOGY_BASIC_LAN,
  TOPOLOGY_ROUTER_ON_A_STICK,
  TOPOLOGY_STP_TRIANGLE,
  TOPOLOGY_OSPF,
];

// ============================================================================
// Benchmark Generator (Requirement 5: 50 Devices, 80 Links)
// ============================================================================

export function generateBenchmarkTopology(deviceCount = 50, linkCount = 80): NetworkTopology {
  const devices = [];
  const types = ["router", "switch-l2", "switch-l3", "server", "pc"] as const;

  const cols = 10;
  const spacingX = 140;
  const spacingY = 120;

  for (let i = 0; i < deviceCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const type = types[i % types.length];

    devices.push({
      id: `bench-dev-${i + 1}`,
      name: `${type.toUpperCase()}-${i + 1}`,
      type,
      x: 80 + col * spacingX,
      y: 60 + row * spacingY,
      interfaces: [
        { id: `if-${i}-1`, name: "Gi0/1", ip: `10.${Math.floor(i / 254)}.${i % 254}.1/24`, status: "up" as const },
        { id: `if-${i}-2`, name: "Gi0/2", status: "up" as const },
      ],
      config: { hostname: `BENCH-${i + 1}` },
    });
  }

  const links = [];
  let currentLink = 0;

  // Linear backbone links
  for (let i = 0; i < deviceCount - 1 && currentLink < linkCount; i++) {
    links.push({
      id: `bench-link-${currentLink++}`,
      sourceDeviceId: devices[i].id,
      sourceInterfaceId: devices[i].interfaces[0].id,
      targetDeviceId: devices[i + 1].id,
      targetInterfaceId: devices[i + 1].interfaces[1].id,
      linkType: "ethernet" as const,
      status: "up" as const,
      animated: i % 3 === 0, // Animate every 3rd link for performance profiling
    });
  }

  // Cross links to reach desired linkCount
  while (currentLink < linkCount) {
    const src = Math.floor(Math.random() * deviceCount);
    let tgt = Math.floor(Math.random() * deviceCount);
    if (src === tgt) tgt = (src + 1) % deviceCount;

    links.push({
      id: `bench-link-${currentLink++}`,
      sourceDeviceId: devices[src].id,
      sourceInterfaceId: devices[src].interfaces[0].id,
      targetDeviceId: devices[tgt].id,
      targetInterfaceId: devices[tgt].interfaces[1].id,
      linkType: "trunk" as const,
      status: "up" as const,
    });
  }

  return {
    id: `bench-${deviceCount}-devices`,
    name: `Stress Benchmark (${deviceCount} Devices, ${linkCount} Links)`,
    description: "Künstliche Groß-Topologie zur Messung von Rendering-Performance, Frame-Rate und Zoom/Pan auf Mobilgeräten.",
    version: "2.0",
    devices,
    links,
  };
}

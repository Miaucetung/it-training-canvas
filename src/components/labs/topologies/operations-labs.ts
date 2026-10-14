import type { LabTopologyData, LabTopologyDevice } from "../types";
import { device, endpoint, ifRow, link, tableRow, zone } from "./builders";

/**
 * Paket 6: Operations und Automation.
 * Fehlersuche-Labs (dhcp-troubleshoot-lab) zeigen die beabsichtigten Fehler als markierte Hinweise (im Startzustand des Canvas),
 * Labs ohne Netz (password-recovery, layer1-issues, troubleshooting-cheat) und die Drills ohne Topologie bekommen keine Vorlage.
 */
const R = "Cisco 2911";
const XE = "Cisco IOS-XE Router";
const SW = "Catalyst 2960";
const PC = "PC-PT";
const SRV = "Server-PT";

/** Router mit einem Endgerät darunter (Management-/Collector-/TFTP-Labs). */
function routerAndHost(opts: {
  model: string;
  hostId: string;
  hostName: string;
  hostType: LabTopologyDevice["type"];
  hostIp: string;
  routerIp?: string;
  note: string;
  /** Lab nennt nur „Mgmt“ ohne Port: Router-Port Gi0/0 ist angenommen */
  assumedRouterPort?: boolean;
  rows: LabTopologyData["addressingTable"];
}): LabTopologyData {
  return {
    viewBox: { width: 880, height: 480 },
    devices: [
      device("r1", "R1", opts.model, "router", "gateway", 440, 100),
      endpoint(opts.hostId, opts.hostName, opts.hostType === "server" ? SRV : PC, opts.hostType, 440, 330),
    ],
    zones: [],
    notes: [{ id: "note-port", text: opts.note, x: 440, y: 450 }],
    links: [
      link(`link-r1-${opts.hostId}`, "r1", "Gi0/0", opts.hostId, "Fa0", {
        cableType: "copper-cross",
        ...(opts.routerIp ? { fromIp: opts.routerIp } : {}),
        toIp: opts.hostIp,
        fromPortOffset: 70,
        toPortOffset: 80,
        toPortSide: 14,
        ...(opts.assumedRouterPort ? { assumedPorts: ["from" as const] } : {}),
      }),
    ],
    addressingTable: opts.rows,
  };
}

export const OPERATIONS_LABS_TOPOLOGIES: Record<string, LabTopologyData> = {
  // ───────────────────────────── IOS-Backup & Upgrade (TFTP)
  "ios-backup-upgrade": routerAndHost({
    model: R,
    hostId: "tftp",
    hostName: "TFTP-Server",
    hostType: "server",
    hostIp: "10.1.1.10",
    note: "Subnetz nur als Beispiel genannt („z. B. 10.1.1.0/24“); R1-Adresse im Lab nicht angegeben",
    rows: [
      tableRow("TFTP-Server", "FastEthernet0", "10.1.1.10", "im Lab nicht angegeben", "im Lab nicht angegeben", "Beispielnetz", "Adresse aus `ping 10.1.1.10`; Ziel für copy running-config tftp: und copy flash: tftp:"),
    ],
  }),

  // ───────────────────────────── NetFlow / Flexible NetFlow
  netflow: routerAndHost({
    model: R,
    hostId: "collector",
    hostName: "Flow-Collector",
    hostType: "server",
    hostIp: "10.0.0.60",
    routerIp: "10.0.0.1",
    assumedRouterPort: true,
    note: "Lab: „R1 Mgmt → Collector“, Port nicht genannt; hier Gi0/0 (gleiches Subnetz 10.0.0.0/24)",
    rows: [
      ifRow("R1", "Gi0/0", "10.0.0.1", "255.255.255.0", "LAN", "Flow Monitor FNF-MON input/output (wird beobachtet)"),
      ifRow("R1", "Lo0", "10.0.0.254", "255.255.255.255", "Loopback", "Quelle des Flow Exporters FNF-EXP (UDP 9996)"),
      tableRow("Flow-Collector", "FastEthernet0", "10.0.0.60", "255.255.255.0", "10.0.0.1", "LAN", "Ziel des Exporters (10.0.0.60:9996)"),
    ],
  }),

  // ───────────────────────────── REST API mit RESTCONF
  restconf: routerAndHost({
    model: XE,
    hostId: "admin",
    hostName: "Admin-PC",
    hostType: "pc",
    hostIp: "10.0.0.10",
    routerIp: "10.0.0.1",
    assumedRouterPort: true,
    note: "Lab: „Admin-PC → R1 Mgmt 10.0.0.1:443“, Port nicht genannt; hier Gi0/0 (10.0.0.1)",
    rows: [
      ifRow("R1", "Gi0/0", "10.0.0.1", "255.255.255.0", "Management", "RESTCONF über HTTPS (443), IOS-XE"),
      tableRow("Admin-PC", "FastEthernet0", "10.0.0.10", "255.255.255.0", "10.0.0.1", "Management", "curl-Client"),
    ],
  }),

  // ───────────────────────────── NETCONF + YANG
  "netconf-yang": routerAndHost({
    model: XE,
    hostId: "admin",
    hostName: "Admin-PC",
    hostType: "pc",
    hostIp: "10.0.0.10",
    routerIp: "10.0.0.1",
    assumedRouterPort: true,
    note: "Lab: „Admin-PC → R1 Mgmt 10.0.0.1:830“, Port nicht genannt; hier Gi0/0 (10.0.0.1)",
    rows: [
      ifRow("R1", "Gi0/0", "10.0.0.1", "255.255.255.0", "Management", "NETCONF über SSH (830), IOS-XE"),
      tableRow("Admin-PC", "FastEthernet0", "10.0.0.10", "255.255.255.0", "10.0.0.1", "Management", "Python-Client (ncclient)"),
    ],
  }),

  // ───────────────────────────── DHCP Troubleshooting: 3 Fehler finden
  // Das Lab nennt nur die drei Korrekturen, nicht die Ausgangskonfiguration; der Startzustand ist daher nur ohne Konfiguration dargestellt.
  "dhcp-troubleshoot-lab": {
    viewBox: { width: 1000, height: 640 },
    devices: [
      device("r1", "R1", `${R} · DHCP-Relay`, "router", "gateway", 440, 100),
      device("sw1", "SW1", SW, "switch-l2", "access", 440, 280),
      endpoint("srv", "DHCP-Server", SRV, "server", 160, 490),
      endpoint("rot", "Client Rot", PC, "pc", 440, 490),
      endpoint("blau", "Client Blau", PC, "pc", 720, 490),
    ],
    zones: [
      zone("zone-71", "VLAN 71 · Server", "amber", 20, 410, 280, 220, 71),
      zone("zone-51", "VLAN 51 Rot", "rose", 320, 410, 240, 220, 51),
      zone("zone-61", "VLAN 61 Blau", "blue", 600, 410, 240, 220, 61),
    ],
    vlans: [
      { id: 51, name: "Rot", colorTheme: "rose", subnet: "VLAN 51" },
      { id: 61, name: "Blau", colorTheme: "blue", subnet: "VLAN 61" },
      { id: 71, name: "Server", colorTheme: "amber", subnet: "VLAN 71" },
    ],
    notes: [
      { id: "fault-1", kind: "fault", onlyIn: "start", text: "Fehler 1: helper-address fehlt (R1 Gi0/0.51)", x: 780, y: 100 },
      { id: "fault-2", kind: "fault", onlyIn: "start", text: "Fehler 2: Pool Blau startet bei .1 (= Gateway)", x: 180, y: 200 },
      { id: "fault-3", kind: "fault", onlyIn: "start", text: "Fehler 3: SVI VLAN 1 ohne IP 192.168.2.50", x: 760, y: 280 },
    ],
    links: [
      link("link-r1-sw1", "r1", "Gi0/0", "sw1", "Gi0/1", { isTrunk: true, fromPortOffset: 70, toPortOffset: 56, subnetLabel: "Trunk", subnetLabelPos: { x: 520, y: 190 } }),
      link("link-sw1-srv", "sw1", "Fa0/1", "srv", "Fa0", { toIp: "192.168.2.11", fromPortOffset: 140, toPortOffset: 90, toPortSide: 14 }),
      link("link-sw1-rot", "sw1", "Fa0/2", "rot", "Fa0", { toIp: "DHCP", fromPortOffset: 70, toPortOffset: 80, toPortSide: 14 }),
      link("link-sw1-blau", "sw1", "Fa0/3", "blau", "Fa0", { toIp: "DHCP", fromPortOffset: 140, toPortOffset: 90, toPortSide: 14 }),
    ],
    addressingTable: [
      tableRow("SW1", "Vlan1", "192.168.2.50", "255.255.255.0", "N/A", 1, "Management-SVI nach Fehler 3 (Fix: ip address + no shutdown)"),
      tableRow("DHCP-Server", "FastEthernet0", "192.168.2.11", "im Lab nicht angegeben", "im Lab nicht angegeben", 71, "Adresse aus `ip helper-address 192.168.2.11`"),
      tableRow("Client Rot", "FastEthernet0", "DHCP (Netz im Lab nicht angegeben)", "–", "per DHCP", 51, "Fehler 1: APIPA 169.254.x.x ohne helper-address"),
      tableRow("Client Blau", "FastEthernet0", "DHCP (Netz im Lab nicht angegeben)", "–", "per DHCP", 61, "Fehler 2: Pool-Start = Gateway 172.16.61.1 (Adresskonflikt)"),
    ],
  },
};

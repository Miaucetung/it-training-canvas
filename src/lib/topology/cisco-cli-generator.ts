import {
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
} from "@/types/topology";

/**
 * Wandelt CIDR-Präfixlänge in eine Subnetzmaske um (z. B. 24 -> "255.255.255.0")
 */
export function cidrToSubnetMask(cidr: number): string {
  const mask = [];
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(Math.max(cidr - i * 8, 0), 8);
    mask.push(256 - Math.pow(2, 8 - bits));
  }
  return mask.join(".");
}

/**
 * Berechnet die Netzadresse aus einer IP/CIDR (z. B. "192.168.10.1/24" -> "192.168.10.0/24")
 */
export function getNetworkAddress(ipCidr: string): { network: string; ip: string; cidr: number; mask: string } | null {
  const parts = ipCidr.split("/");
  if (parts.length !== 2) return null;
  const ip = parts[0].trim();
  const cidr = parseInt(parts[1].trim(), 10);
  if (isNaN(cidr) || cidr < 0 || cidr > 32) return null;

  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) return null;

  const ipNum = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const netNum = (ipNum & maskNum) >>> 0;

  const netOctets = [
    (netNum >>> 24) & 255,
    (netNum >>> 16) & 255,
    (netNum >>> 8) & 255,
    netNum & 255,
  ];

  return {
    network: `${netOctets.join(".")}/${cidr}`,
    ip,
    cidr,
    mask: cidrToSubnetMask(cidr),
  };
}

/**
 * Standard Cisco IOS Show-Commands Generator
 */
export class CiscoCliGenerator {
  /**
   * Generiert Cisco IOS 'show ip route'
   */
  static generateShowIpRoute(device: TopologyDevice, topology: NetworkTopology): string {
    const codesHeader = [
      "Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP",
      "       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area",
      "       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2",
      "       E1 - OSPF external type 1, E2 - OSPF external type 2",
      "       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2",
      "       ia - IS-IS inter area, * - candidate default, U - per-user static route",
      "       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP",
      "       a - application route",
      "       + - replicated route, % - next hop override, p - overrides from PfR",
      "",
      "Gateway of last resort is not set",
      "",
    ].join("\n");

    const routes: string[] = [];

    // 1. Lokale und Direkt verbundene Routen (C und L)
    for (const iface of device.interfaces) {
      if (!iface.ip) continue;
      const netInfo = getNetworkAddress(iface.ip);
      if (!netInfo) continue;

      const ifName = iface.name.startsWith("Gi") || iface.name.startsWith("Fa")
        ? iface.name
        : `GigabitEthernet${iface.name}`;

      // Connected Route
      routes.push(`C    ${netInfo.network} is directly connected, ${iface.name}`);

      // Local Route (/32 für die Host-IP)
      if (netInfo.cidr < 32) {
        routes.push(`L    ${netInfo.ip}/32 is directly connected, ${iface.name}`);
      }
    }

    // 2. OSPF Routen ermitteln, falls OSPF aktiv ist
    const isOspfActive = device.config?.routingProtocols?.some((p) => p.toLowerCase().includes("ospf"));
    if (isOspfActive) {
      // Finde Nachbar-Router über gemeinsame Links
      for (const link of topology.links) {
        let neighborDeviceId: string | null = null;
        let localInterfaceId: string | null = null;

        if (link.sourceDeviceId === device.id) {
          neighborDeviceId = link.targetDeviceId;
          localInterfaceId = link.sourceInterfaceId;
        } else if (link.targetDeviceId === device.id) {
          neighborDeviceId = link.sourceDeviceId;
          localInterfaceId = link.targetInterfaceId;
        }

        if (!neighborDeviceId) continue;
        const neighbor = topology.devices.find((d) => d.id === neighborDeviceId);
        if (!neighbor || !neighbor.config?.routingProtocols?.some((p) => p.toLowerCase().includes("ospf"))) {
          continue;
        }

        const localIface = device.interfaces.find((i) => i.id === localInterfaceId);
        const neighborTransitIface = neighbor.interfaces.find((i) => {
          if (!i.ip) return false;
          return link.sourceInterfaceId === i.id || link.targetInterfaceId === i.id;
        });

        const nextHopIp = neighborTransitIface?.ip?.split("/")[0] || "10.0.12.2";

        // Alle Netze des Nachbarn (inkl. Loopbacks und LANs), die nicht auf diesem Router existieren
        for (const nIface of neighbor.interfaces) {
          if (!nIface.ip) continue;
          const nNet = getNetworkAddress(nIface.ip);
          if (!nNet) continue;

          // Ist dieses Netz schon lokal vorhanden?
          const isLocal = device.interfaces.some((i) => {
            const myNet = i.ip ? getNetworkAddress(i.ip) : null;
            return myNet?.network === nNet.network;
          });

          if (!isLocal) {
            routes.push(
              `O    ${nNet.network} [110/2] via ${nextHopIp}, 00:14:22, ${localIface?.name || "GigabitEthernet0/0/0"}`
            );
          }
        }
      }
    }

    if (routes.length === 0) {
      return codesHeader + "(Keine aktiven IPv4-Routen konfiguriert)";
    }

    // Sortierung nach Netzwerk-Präfix
    routes.sort((a, b) => a.localeCompare(b));
    return codesHeader + routes.join("\n");
  }

  /**
   * Generiert Cisco IOS 'show ip interface brief'
   */
  static generateShowIpInterfaceBrief(device: TopologyDevice): string {
    const header = "Interface              IP-Address      OK? Method Status                Protocol\n";
    const lines: string[] = [];

    for (const iface of device.interfaces) {
      const nameCol = iface.name.padEnd(23, " ");
      const ipOnly = iface.ip ? iface.ip.split("/")[0] : "unassigned";
      const ipCol = ipOnly.padEnd(16, " ");
      const okCol = "YES manual ".padEnd(11, " ");

      let statusStr = "up                    up      ";
      if (iface.status === "admin-down") {
        statusStr = "administratively down down    ";
      } else if (iface.status === "down") {
        statusStr = "down                  down    ";
      }

      lines.push(`${nameCol}${ipCol}${okCol}${statusStr}`);
    }

    return header + lines.join("\n");
  }

  /**
   * Generiert Cisco IOS 'show running-config interface'
   */
  static generateShowRunningConfig(device: TopologyDevice, primaryIfaceName?: string): string {
    const targetIface = primaryIfaceName
      ? device.interfaces.find((i) => i.name.toLowerCase() === primaryIfaceName.toLowerCase()) || device.interfaces[0]
      : device.interfaces[0];

    if (!targetIface) return "! Keine Interfaces vorhanden";

    const lines: string[] = [];
    const baseName = targetIface.name.split(".")[0];

    // Hauptinterface
    const isPhysicalTrunk = device.interfaces.some((i) => i.name.startsWith(baseName + "."));
    lines.push(`interface ${baseName}`);
    if (isPhysicalTrunk) {
      lines.push(" no ip address");
      lines.push(" no shutdown");
    } else if (targetIface.ip) {
      const net = getNetworkAddress(targetIface.ip);
      if (net) {
        lines.push(` ip address ${net.ip} ${net.mask}`);
      }
    }
    if (targetIface.description?.includes("point-to-point")) {
      lines.push(" ip ospf network point-to-point");
    }
    lines.push("!");

    // Subinterfaces (z. B. bei Router-on-a-Stick)
    const subinterfaces = device.interfaces.filter((i) => i.name.startsWith(baseName + "."));
    for (const sub of subinterfaces) {
      lines.push(`interface ${sub.name}`);
      if (sub.vlan) {
        lines.push(` encapsulation dot1q ${sub.vlan}`);
      }
      if (sub.ip) {
        const net = getNetworkAddress(sub.ip);
        if (net) {
          lines.push(` ip address ${net.ip} ${net.mask}`);
        }
      }
      lines.push("!");
    }

    return lines.join("\n");
  }

  /**
   * Generiert Cisco IOS 'show spanning-tree' für 802.1D Switches
   */
  static generateShowSpanningTree(device: TopologyDevice, topology: NetworkTopology): string {
    const isRoot = device.name.includes("Root") || device.id.includes("swa");
    const bridgePriority = isRoot ? 24576 : device.id.includes("swb") ? 28672 : 32768;
    const rootAddress = "0050.7966.0001";
    const myAddress = isRoot
      ? "0050.7966.0001"
      : device.id.includes("swb")
        ? "0050.7966.0002"
        : "0050.7966.0003";

    const lines = [
      "VLAN0001",
      `  Spanning tree enabled protocol ieee`,
      `  Root ID    Priority    24576`,
      `             Address     ${rootAddress}`,
      isRoot
        ? "             This bridge is the root\n             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec"
        : `             Cost        4\n             Port        1 (GigabitEthernet0/1)`,
      `  Bridge ID  Priority    ${bridgePriority}`,
      `             Address     ${myAddress}`,
      `             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec`,
      "",
      "Interface           Role Sts Cost      Prio.Nbr Type",
      "------------------- ---- --- --------- -------- --------------------------------",
    ];

    for (let i = 0; i < device.interfaces.length; i++) {
      const iface = device.interfaces[i];
      let role = "Desg";
      let sts = "FWD";

      if (iface.description?.includes("Root")) {
        role = "Root";
        sts = "FWD";
      } else if (iface.description?.includes("Blocking") || iface.description?.includes("BLK")) {
        role = "Blk ";
        sts = "BLK";
      }

      lines.push(`${iface.name.padEnd(20, " ")}${role} ${sts} 4         128.${i + 1}    Shr`);
    }

    return lines.join("\n");
  }

  /**
   * Generiert Cisco IOS 'show ip ospf neighbor'
   */
  static generateShowIpOspfNeighbor(device: TopologyDevice, topology: NetworkTopology): string {
    const header = "Neighbor ID     Pri   State           Dead Time   Address         Interface\n";
    const lines: string[] = [];

    for (const link of topology.links) {
      let neighborId: string | null = null;
      let localIfaceId: string | null = null;

      if (link.sourceDeviceId === device.id) {
        neighborId = link.targetDeviceId;
        localIfaceId = link.sourceInterfaceId;
      } else if (link.targetDeviceId === device.id) {
        neighborId = link.sourceDeviceId;
        localIfaceId = link.targetInterfaceId;
      }

      if (!neighborId) continue;
      const neighbor = topology.devices.find((d) => d.id === neighborId);
      if (!neighbor) continue;

      const localIface = device.interfaces.find((i) => i.id === localIfaceId);
      const neighborTransit = neighbor.interfaces.find((i) => link.sourceInterfaceId === i.id || link.targetInterfaceId === i.id);

      const nId = neighbor.interfaces.find((i) => i.name.startsWith("Lo"))?.ip?.split("/")[0] || "2.2.2.2";
      const nAddr = neighborTransit?.ip?.split("/")[0] || "10.0.12.2";

      lines.push(
        `${nId.padEnd(16, " ")}0   FULL/  -        00:00:35    ${nAddr.padEnd(16, " ")}${localIface?.name || "Gi0/0/0"}`
      );
    }

    return lines.length > 0 ? header + lines.join("\n") : header + "% Kein OSPF-Nachbar auf den konfigurierten Interfaces";
  }

  /**
   * Gibt alle relevanten Show-Ausgaben für ein Gerät dynamisch generiert zurück
   */
  static getDynamicShowOutputs(device: TopologyDevice, topology: NetworkTopology): Record<string, string> {
    const outputs: Record<string, string> = {};

    if (device.type === "router") {
      outputs["show ip route"] = this.generateShowIpRoute(device, topology);
      outputs["show ip interface brief"] = this.generateShowIpInterfaceBrief(device);
      outputs["show running-config interface"] = this.generateShowRunningConfig(device);
      if (device.config?.routingProtocols?.some((p) => p.includes("OSPF"))) {
        outputs["show ip ospf neighbor"] = this.generateShowIpOspfNeighbor(device, topology);
      }
    } else if (device.type.startsWith("switch")) {
      outputs["show spanning-tree"] = this.generateShowSpanningTree(device, topology);
      outputs["show ip interface brief"] = this.generateShowIpInterfaceBrief(device);
    } else {
      outputs["show ip interface brief"] = this.generateShowIpInterfaceBrief(device);
    }

    // Falls zusätzlich statische custom ShowOutputs vorhanden sind, zusammenführen
    if (device.config?.showOutputs) {
      for (const [k, v] of Object.entries(device.config.showOutputs)) {
        if (!outputs[k]) outputs[k] = v;
      }
    }

    return outputs;
  }
}

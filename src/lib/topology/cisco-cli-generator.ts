import {
  NetworkTopology,
  TopologyDevice,
} from "@/types/topology";
import { checkEtherChannelMemberConsistency } from "./topology-validation";
import { formatShowSpanningTree } from "./stp-calc";
import { computeOspfNeighbors, formatOspfNeighborTable, resolveInterfaceOspf } from "./ospf-neighbors";
import {
  computeEigrpv6Neighbors,
  computeOspfv3Neighbors,
  formatEigrpv6NeighborTable,
  formatOspfv3NeighborTable,
  formatShowIpv6InterfaceBrief,
  formatShowIpv6Route,
  hasIpv6Config,
} from "./ipv6-routing";
import { formatShowIpDhcpBinding, formatShowIpDhcpPool, hasDhcpPools } from "./dhcp-outputs";
import { formatShowVtpStatus, hasVtpConfig } from "./vtp-status";

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

      // Connected Route
      routes.push(`C    ${netInfo.network} is directly connected, ${iface.name}`);

      // Local Route (/32 für die Host-IP)
      if (netInfo.cidr < 32) {
        routes.push(`L    ${netInfo.ip}/32 is directly connected, ${iface.name}`);
      }
    }

    // 2. OSPF-Routen nur über echte Nachbarschaften (siehe ospf-neighbors.ts)
    for (const adj of computeOspfNeighbors(device, topology)) {
      for (const nIface of adj.neighbor.interfaces) {
        if (!nIface.ip || !resolveInterfaceOspf(adj.neighbor, nIface)) continue;
        if (nIface.status !== "up" || nIface.isShutdown) continue;
        const nNet = getNetworkAddress(nIface.ip);
        if (!nNet) continue;

        // Ist dieses Netz schon lokal vorhanden?
        const isLocal = device.interfaces.some((i) => {
          const myNet = i.ip ? getNetworkAddress(i.ip) : null;
          return myNet?.network === nNet.network;
        });

        if (!isLocal) {
          routes.push(
            `O    ${nNet.network} [110/2] via ${adj.neighborAddress}, 00:14:22, ${adj.localInterface.name}`
          );
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
    return formatShowSpanningTree(device, topology);
  }

  /**
   * Generiert Cisco IOS 'show ip ospf neighbor'
   */
  static generateShowIpOspfNeighbor(device: TopologyDevice, topology: NetworkTopology): string {
    return formatOspfNeighborTable(computeOspfNeighbors(device, topology));
  }

  /**
   * Generiert Cisco IOS 'show vlan brief'
   */
  static generateShowVlanBrief(device: TopologyDevice): string {
    const header = [
      "VLAN Name                             Status    Ports",
      "---- -------------------------------- --------- -------------------------------",
    ];

    // Standard-VLANs und benutzerdefinierte VLANs
    // VLAN 1 existiert immer; weitere VLANs nur, wenn sie konfiguriert sind (keine erfundenen Beispiel-VLANs)
    const configured = (device.config?.vlans ?? []).filter((v) => v.id !== 1);
    const vlans = [{ id: 1, name: "default" }, ...configured].sort((x, y) => x.id - y.id);

    const lines: string[] = [];

    // Finde Interfaces im Access-Modus für jedes VLAN (Trunk-Ports tauchen nicht auf!)
    for (const v of vlans) {
      const accessPorts = device.interfaces
        .filter(
          (i) =>
            !/^(vlan|lo|loopback|po|port-channel)\d*/i.test(i.name) &&
            i.mode !== "trunk" &&
            i.mode !== "routed" &&
            (i.vlan === v.id || (v.id === 1 && !i.vlan))
        )
        .map((i) => i.name);

      const portsStr = accessPorts.length > 0 ? accessPorts.join(", ") : "";
      const vlanIdStr = v.id.toString().padEnd(4, " ");
      const vlanNameStr = v.name.padEnd(32, " ");
      const statusStr = "active   ".padEnd(10, " ");

      lines.push(`${vlanIdStr} ${vlanNameStr} ${statusStr} ${portsStr}`);
    }

    // Default Cisco Legacy VLANs
    lines.push("1002 fddi-default                     act/unsup");
    lines.push("1003 token-ring-default               act/unsup");
    lines.push("1004 fddinet-default                  act/unsup");
    lines.push("1005 trnet-default                    act/unsup");

    return [...header, ...lines].join("\n");
  }

  /**
   * Generiert Cisco IOS 'show interfaces trunk'
   */
  static generateShowInterfacesTrunk(device: TopologyDevice): string {
    const trunkInterfaces = device.interfaces.filter((i) => i.mode === "trunk");

    if (trunkInterfaces.length === 0) {
      return "% Keine aktiven 802.1Q Trunk-Interfaces auf diesem Switch konfiguriert";
    }

    const lines: string[] = [
      "Port        Mode             Encapsulation  Status        Native vlan",
    ];

    for (const iface of trunkInterfaces) {
      const portCol = iface.name.padEnd(12, " ");
      const modeCol = "on          ".padEnd(17, " ");
      const encapCol = "802.1q        ".padEnd(15, " ");
      const statusCol = "trunking      ".padEnd(14, " ");
      const nativeCol = (iface.nativeVlan ?? 1).toString();
      lines.push(`${portCol}${modeCol}${encapCol}${statusCol}${nativeCol}`);
    }

    lines.push("");
    lines.push("Port        Vlans allowed on trunk");
    for (const iface of trunkInterfaces) {
      const portCol = iface.name.padEnd(12, " ");
      const allowed = iface.allowedVlans && iface.allowedVlans.length > 0
        ? iface.allowedVlans.join(",")
        : "1-4094";
      lines.push(`${portCol}${allowed}`);
    }

    lines.push("");
    lines.push("Port        Vlans in spanning tree forwarding state and not pruned");
    for (const iface of trunkInterfaces) {
      const portCol = iface.name.padEnd(12, " ");
      const allowed = iface.allowedVlans && iface.allowedVlans.length > 0
        ? iface.allowedVlans.join(",")
        : "1,10,20";
      lines.push(`${portCol}${allowed}`);
    }

    return lines.join("\n");
  }

  /**
   * Generiert Cisco IOS 'show etherchannel summary'
   */
  static generateShowEtherchannelSummary(device: TopologyDevice): string {
    // Ermittle Channel Groups aus Interfaces oder device.config.portChannels
    const channelMap = new Map<number, { mode: string; protocol: string; ports: string[] }>();

    for (const iface of device.interfaces) {
      if (iface.channelGroup) {
        const id = iface.channelGroup.id;
        const mode = iface.channelGroup.mode;
        const protocol = mode === "active" || mode === "passive" ? "LACP" : mode === "desirable" || mode === "auto" ? "PAgP" : "-";
        const entry = channelMap.get(id) || { mode, protocol, ports: [] };
        entry.ports.push(`${iface.name}(P)`);
        channelMap.set(id, entry);
      }
    }

    if (device.config?.portChannels) {
      for (const pc of device.config.portChannels) {
        const protocol = pc.mode === "active" || pc.mode === "passive" ? "LACP" : pc.mode === "desirable" || pc.mode === "auto" ? "PAgP" : "-";
        const entry = channelMap.get(pc.id) || { mode: pc.mode, protocol, ports: [] };
        for (const m of pc.members) {
          if (!entry.ports.some((p) => p.startsWith(m))) {
            entry.ports.push(`${m}(P)`);
          }
        }
        channelMap.set(pc.id, entry);
      }
    }

    const header = [
      "Flags:  D - down        P - bundled in port-channel",
      "        I - stand-alone s - suspended",
      "        H - Hot-standby (LACP only)",
      "        R - Layer3      S - Layer2",
      "        U - in use      f - failed to allocate aggregator",
      "        M - not in use, minimum links not met",
      "        u - unsuitable for bundling",
      "        w - waiting to be aggregated",
      "        d - default port",
      "",
      `Number of channel-groups in use: ${channelMap.size}`,
      `Number of aggregators:           ${channelMap.size}`,
      "",
      "Group  Port-channel  Protocol    Ports",
      "------+-------------+-----------+-----------------------------------------------",
    ];

    if (channelMap.size === 0) {
      return [...header, "% Keine konfigurierten EtherChannels vorhanden"].join("\n");
    }

    const rows: string[] = [];
    for (const [id, data] of channelMap.entries()) {
      const consistency = checkEtherChannelMemberConsistency(device, id);
      const grpCol = id.toString().padEnd(7, " ");

      const portStrings: string[] = [];
      let bundledCount = 0;
      for (const iface of device.interfaces) {
        if (iface.channelGroup?.id === id) {
          const isSuspended = consistency.inconsistentPorts.some((p) => p.iface.id === iface.id) || (iface.status as string) === "suspended";
          const isDown = iface.status === "down" || iface.status === "admin-down";

          if (isDown) {
            portStrings.push(`${iface.name}(D)`);
          } else if (isSuspended) {
            portStrings.push(`${iface.name}(s)`);
          } else {
            portStrings.push(`${iface.name}(P)`);
            bundledCount++;
          }
        }
      }

      // Fallback falls Interfaces nicht direkt auf dem Device gefunden wurden, sondern aus data.ports
      if (portStrings.length === 0 && data.ports.length > 0) {
        for (const p of data.ports) {
          if (p.includes("(P)")) bundledCount++;
        }
      }

      // Cisco Regel: Po bleibt (SU), solange mindestens ein Member gebündelt ist (P).
      // (SD) nur, wenn kein Member gebündelt ist.
      const poStatus = bundledCount > 0 ? `Po${id}(SU)` : `Po${id}(SD)`;
      const poCol = poStatus.padEnd(14, " ");
      const protoCol = data.protocol.padEnd(12, " ");

      const portsCol = (portStrings.length > 0 ? portStrings : data.ports).join("    ");
      rows.push(`${grpCol}${poCol}${protoCol}${portsCol}`);
    }

    return [...header, ...rows].join("\n");
  }

  /**
   * Generiert eine vollständige Cisco IOS 'show running-config'
   */
  static generateFullShowRunningConfig(device: TopologyDevice): string {
    const lines: string[] = [
      "Building configuration...",
      "",
      `Current configuration : ${Math.floor(1200 + Math.random() * 400)} bytes`,
      "!",
      "version 15.4",
      "no service timestamps log datetime msec",
      "no service password-encryption",
      "!",
      `hostname ${device.config?.hostname || device.name.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
      "!",
    ];

    if (device.config?.domain) {
      lines.push(`ip domain-name ${device.config.domain}`);
      lines.push("!");
    }

    // L3 Switch / Router Routing
    if (device.type === "switch-l3" && device.config?.ipRoutingEnabled !== false) {
      lines.push("ip routing");
      lines.push("!");
    }

    // VLANs
    if (device.config?.vlans && device.config.vlans.length > 0) {
      for (const v of device.config.vlans) {
        if (v.id === 1) continue;
        lines.push(`vlan ${v.id}`);
        lines.push(` name ${v.name}`);
        lines.push("!");
      }
    }

    // Physische Interfaces & Subinterfaces
    for (const iface of device.interfaces) {
      lines.push(`interface ${iface.name}`);
      if (iface.description) {
        lines.push(` description ${iface.description}`);
      }

      if (iface.mode === "trunk") {
        lines.push(" switchport mode trunk");
        if (iface.nativeVlan && iface.nativeVlan !== 1) {
          lines.push(` switchport trunk native vlan ${iface.nativeVlan}`);
        }
        if (iface.allowedVlans && iface.allowedVlans.length > 0) {
          lines.push(` switchport trunk allowed vlan ${iface.allowedVlans.join(",")}`);
        }
      } else if (iface.mode === "access" || iface.vlan) {
        lines.push(" switchport mode access");
        if (iface.vlan) {
          lines.push(` switchport access vlan ${iface.vlan}`);
        }
      } else if (iface.ip) {
        const net = getNetworkAddress(iface.ip);
        if (net) lines.push(` ip address ${net.ip} ${net.mask}`);
      } else {
        lines.push(" no ip address");
      }

      if (iface.channelGroup) {
        lines.push(` channel-group ${iface.channelGroup.id} mode ${iface.channelGroup.mode}`);
      }

      if (iface.status === "admin-down" || iface.isShutdown) {
        lines.push(" shutdown");
      } else {
        lines.push(" no shutdown");
      }
      lines.push("!");

      // Dot1Q Subinterfaces (Router-on-a-Stick)
      if (iface.subinterfaces && iface.subinterfaces.length > 0) {
        for (const sub of iface.subinterfaces) {
          lines.push(`interface ${sub.name}`);
          lines.push(` encapsulation dot1q ${sub.vlan}`);
          if (sub.ip) {
            const net = getNetworkAddress(sub.ip);
            if (net) lines.push(` ip address ${net.ip} ${net.mask}`);
          }
          if (sub.isShutdown) lines.push(" shutdown");
          else lines.push(" no shutdown");
          lines.push("!");
        }
      }
    }

    // SVIs (Switched Virtual Interfaces)
    if (device.config?.svis && device.config.svis.length > 0) {
      for (const svi of device.config.svis) {
        lines.push(`interface Vlan${svi.vlan}`);
        if (svi.description) lines.push(` description ${svi.description}`);
        const net = getNetworkAddress(svi.ip);
        if (net) lines.push(` ip address ${net.ip} ${net.mask}`);
        lines.push(" no shutdown");
        lines.push("!");
      }
    }

    // Default Gateway / Default Route
    if (device.config?.defaultGateway) {
      if (device.type.startsWith("switch")) {
        lines.push(`ip default-gateway ${device.config.defaultGateway}`);
      } else {
        lines.push(`ip route 0.0.0.0 0.0.0.0 ${device.config.defaultGateway}`);
      }
      lines.push("!");
    }

    lines.push("end");
    return lines.join("\n");
  }

  /**
   * Gibt alle relevanten Show-Ausgaben für ein Gerät dynamisch generiert zurück
   */
  static getDynamicShowOutputs(device: TopologyDevice, topology: NetworkTopology): Record<string, string> {
    const outputs: Record<string, string> = {};

    // Vollständige running-config für alle Geräte
    outputs["show running-config"] = this.generateFullShowRunningConfig(device);
    outputs["show running-config interface"] = this.generateShowRunningConfig(device);
    outputs["show ip interface brief"] = this.generateShowIpInterfaceBrief(device);

    if (device.type === "router") {
      outputs["show ip route"] = this.generateShowIpRoute(device, topology);
      if (device.config?.routingProtocols?.some((p) => /^OSPF(?!v3)/i.test(p))) {
        outputs["show ip ospf neighbor"] = this.generateShowIpOspfNeighbor(device, topology);
      }
    } else if (device.type.startsWith("switch")) {
      outputs["show spanning-tree"] = this.generateShowSpanningTree(device, topology);
      outputs["show vlan brief"] = this.generateShowVlanBrief(device);
      outputs["show interfaces trunk"] = this.generateShowInterfacesTrunk(device);
      outputs["show etherchannel summary"] = this.generateShowEtherchannelSummary(device);
      if (device.type === "switch-l3") {
        outputs["show ip route"] = this.generateShowIpRoute(device, topology);
      }
    }

    if ((device.type === "router" || device.type === "switch-l3") && hasDhcpPools(device)) {
      outputs["show ip dhcp pool"] = formatShowIpDhcpPool(device);
      outputs["show ip dhcp binding"] = formatShowIpDhcpBinding();
    }
    if (hasVtpConfig(device)) outputs["show vtp status"] = formatShowVtpStatus(device, topology);

    // IPv6: nur für Router und L3-Switches mit IPv6-Konfiguration
    if ((device.type === "router" || device.type === "switch-l3") && hasIpv6Config(device)) {
      outputs["show ipv6 interface brief"] = formatShowIpv6InterfaceBrief(device, topology);
      outputs["show ipv6 route"] = formatShowIpv6Route(device, topology);
      if (device.config?.ospfv3) {
        outputs["show ipv6 ospf neighbor"] = formatOspfv3NeighborTable(device, computeOspfv3Neighbors(device, topology));
      }
      if (device.config?.eigrpv6) {
        outputs["show ipv6 eigrp neighbors"] = formatEigrpv6NeighborTable(device, computeEigrpv6Neighbors(device, topology));
      }
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

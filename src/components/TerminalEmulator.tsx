import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  buildARPTable,
  checkConnectivity,
  isValidIp,
  maskToCidr,
  performDHCP,
  resolveDNS,
  validateTopology,
} from "@/lib/networking-engine";
import {
  CanvasConnection,
  DrawingObject,
  ShapeConfig,
  TerminalCommand,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Copy,
  Terminal as TerminalIcon,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TerminalEmulatorProps {
  shape: DrawingObject | null;
  onClose: () => void;
  onUpdateHistory: (shapeId: string, history: TerminalCommand[]) => void;
  onUpdateConfig?: (shapeId: string, config: ShapeConfig) => void;
  allObjects?: DrawingObject[];
  allConnections?: CanvasConnection[];
  theme: "light" | "dark";
}

type CommandHandler = (
  args: string[],
  config: ShapeConfig | undefined,
  shape: DrawingObject | null,
  allObjects: DrawingObject[],
  allConnections: CanvasConnection[],
  updateConfig?: (config: ShapeConfig) => void,
) => { output: string; exitCode: number };

// ============================================================
// Command Registry — IOS-like + Linux CLI
// ============================================================

const COMMANDS: Record<string, CommandHandler> = {
  help: () => ({
    output: `Verfügbare Befehle:
  ─── Netzwerk ────────────────────────────────────────
  ifconfig / ip addr         Netzwerk-Interfaces anzeigen
  ping <ip|hostname>         ICMP Echo an Host senden
  traceroute <ip>            Route zum Ziel verfolgen
  arp -a                     ARP-Tabelle anzeigen
  netstat                    Offene Ports anzeigen
  nslookup <hostname>        DNS-Auflösung

  ─── Routing (IOS-Style) ─────────────────────────────
  show ip route              Routing-Tabelle anzeigen
  show arp                   ARP-Tabelle (IOS)
  show interfaces            Interface-Status anzeigen
  show interfaces brief      Interface-Übersicht
  show vlan                  VLAN-Konfiguration anzeigen
  show running-config        Aktuelle Konfiguration
  show ip nat translations   NAT-Übersetzungen
  show spanning-tree         STP-Status anzeigen
  show ip access-lists       ACL-Regeln anzeigen

  ─── Konfiguration (IOS-Style) ───────────────────────
  configure terminal         Konfigurationsmodus
  ip route <net> <mask> <nh> Statische Route hinzufügen
  no ip route <net> <mask>   Route entfernen
  ip link set <if> up/down   Interface aktivieren/deaktivieren
  ip address <ip> <mask>     IP-Adresse setzen
  hostname <name>            Hostname ändern

  ─── DHCP ────────────────────────────────────────────
  dhclient                   DHCP-Adresse anfordern

  ─── System ──────────────────────────────────────────
  hostname                   Hostname anzeigen
  whoami                     Benutzer anzeigen
  uptime                     Betriebszeit anzeigen
  free                       Arbeitsspeicher anzeigen
  df                         Festplattenplatz anzeigen
  ls [pfad]                  Verzeichnisinhalt
  cat <datei>                Dateiinhalt anzeigen

  ─── Container ───────────────────────────────────────
  docker ps                  Container auflisten
  docker images              Images auflisten
  kubectl get pods           Kubernetes Pods
  kubectl get services       Kubernetes Services

  ─── Sonstiges ───────────────────────────────────────
  clear                      Terminal leeren
  exit                       Terminal schließen
  validate                   Topologie validieren`,
    exitCode: 0,
  }),

  // ── Network Commands ──────────────────────────────────
  hostname: (args, config, shape, _ao, _ac, updateConfig) => {
    if (args.length > 0 && updateConfig) {
      const newHostname = args.join(" ");
      updateConfig({ ...config, hostname: newHostname });
      return { output: `Hostname geändert zu: ${newHostname}`, exitCode: 0 };
    }
    return { output: config?.hostname || "localhost", exitCode: 0 };
  },

  ifconfig: (_, config) => {
    const interfaces = config?.interfaces || [];
    if (interfaces.length === 0) {
      // Fallback to simple view
      return {
        output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet ${config?.ipAddress || "nicht konfiguriert"}  netmask ${config?.subnetMask || "255.255.255.0"}
        ether ${config?.mac || "00:00:00:00:00:00"}  txqueuelen 1000  (Ethernet)
        RX packets 1234567  bytes 123456789 (117.7 MiB)
        TX packets 987654  bytes 98765432 (94.1 MiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`,
        exitCode: 0,
      };
    }

    let output = "";
    for (const iface of interfaces) {
      const flags =
        iface.status === "up"
          ? "UP,BROADCAST,RUNNING,MULTICAST"
          : "BROADCAST,MULTICAST";
      const statusColor = iface.status === "up" ? "" : " [DOWN]";
      output += `${iface.name}: flags=<${flags}>${statusColor}  mtu ${iface.mtu}
        ${iface.ipAddress ? `inet ${iface.ipAddress}  netmask ${iface.subnetMask || "255.255.255.0"}` : "no ip address"}
        ether ${iface.macAddress}  (Ethernet)
        Speed: ${iface.speed}Mbps  Duplex: ${iface.duplex}${iface.vlan ? `  VLAN: ${iface.vlan}` : ""}${iface.mode ? `  Mode: ${iface.mode}` : ""}
`;
    }
    output += `\nlo: flags=<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`;
    return { output, exitCode: 0 };
  },

  ip: (args, config, shape, allObjects, allConnections, updateConfig) => {
    if (args[0] === "addr" || args[0] === "a") {
      const interfaces = config?.interfaces || [];
      if (interfaces.length === 0) {
        const ip = config?.ipAddress || "nicht konfiguriert";
        const cidr = config?.subnetMask ? maskToCidr(config.subnetMask) : 24;
        return {
          output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    inet ${ip}/${cidr} scope global eth0`,
          exitCode: 0,
        };
      }
      let output = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n`;
      interfaces.forEach((iface, idx) => {
        const state = iface.status === "up" ? "UP" : "DOWN";
        const cidr = iface.subnetMask ? maskToCidr(iface.subnetMask) : "?";
        output += `${idx + 2}: ${iface.name}: <BROADCAST,MULTICAST,${state}> mtu ${iface.mtu} state ${state}\n    link/ether ${iface.macAddress}\n`;
        if (iface.ipAddress) {
          output += `    inet ${iface.ipAddress}/${cidr} scope global ${iface.name}\n`;
        }
      });
      return { output, exitCode: 0 };
    }
    if (args[0] === "route") {
      return COMMANDS["show"](
        ["ip", "route"],
        config,
        shape,
        allObjects,
        allConnections,
      );
    }
    if (args[0] === "link" && args[1] === "set" && args.length >= 4) {
      const ifName = args[2];
      const action = args[3]; // "up" or "down"
      if (!updateConfig || !config)
        return { output: "Konfiguration nicht möglich", exitCode: 1 };

      const interfaces = [...(config.interfaces || [])];
      const iface = interfaces.find((i) => i.name === ifName);
      if (!iface)
        return { output: `Interface ${ifName} nicht gefunden`, exitCode: 1 };

      if (action === "up") {
        iface.status = "up";
        updateConfig({ ...config, interfaces });
        return { output: `Interface ${ifName} ist jetzt UP`, exitCode: 0 };
      } else if (action === "down") {
        iface.status = "down";
        updateConfig({ ...config, interfaces });
        return { output: `Interface ${ifName} ist jetzt DOWN`, exitCode: 0 };
      }
      return { output: "Usage: ip link set <interface> up|down", exitCode: 1 };
    }
    if (args[0] === "address" && args.length >= 3) {
      // ip address <ip> <mask> [dev <interface>]
      const newIp = args[1];
      const newMask = args[2];
      if (!isValidIp(newIp))
        return { output: `Ungültige IP: ${newIp}`, exitCode: 1 };
      if (!updateConfig || !config)
        return { output: "Konfiguration nicht möglich", exitCode: 1 };
      updateConfig({ ...config, ipAddress: newIp, subnetMask: newMask });
      return { output: `IP-Adresse gesetzt: ${newIp} ${newMask}`, exitCode: 0 };
    }
    return { output: "Usage: ip [addr|route|link|address]", exitCode: 1 };
  },

  ping: (args, config, shape, allObjects, allConnections) => {
    const host = args[0];
    if (!host) return { output: "Usage: ping <ip|hostname>", exitCode: 1 };

    let targetIp = host;

    // DNS resolution if not an IP
    if (!isValidIp(host) && shape) {
      const dnsResult = resolveDNS(host, shape, allObjects, allConnections);
      if (!dnsResult.resolved) {
        return {
          output: `ping: ${host}: Name or service not known\n${dnsResult.steps.join("\n")}`,
          exitCode: 2,
        };
      }
      targetIp = dnsResult.ip!;
    }

    if (!config?.ipAddress) {
      return {
        output: "ping: Keine IP-Adresse konfiguriert auf diesem Gerät",
        exitCode: 1,
      };
    }

    // Find target shape
    const targetShape = allObjects.find(
      (o) => o.config?.ipAddress?.split("/")[0] === targetIp,
    );

    if (!targetShape || !shape) {
      return {
        output: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\nFrom ${config.ipAddress}: icmp_seq=1 Destination Host Unreachable\n\n--- ${targetIp} ping statistics ---\n3 packets transmitted, 0 received, 100% packet loss`,
        exitCode: 1,
      };
    }

    // Use real connectivity check
    const result = checkConnectivity(
      shape.id,
      targetShape.id,
      allObjects,
      allConnections,
    );

    if (!result.reachable) {
      const hopsInfo = result.hops
        .map((h) => `  ${h.ip} (${h.action}${h.detail ? ": " + h.detail : ""})`)
        .join("\n");

      return {
        output: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.\n\n--- Fehler: ${result.error} ---\n${result.errorCode ? `Code: ${result.errorCode}` : ""}\n\nRoute:\n${hopsInfo}\n\n--- ${targetIp} ping statistics ---\n3 packets transmitted, 0 received, 100% packet loss`,
        exitCode: 1,
      };
    }

    const latency = result.latencyMs;
    const times = [latency * 0.9, latency, latency * 1.1].map((t) =>
      t.toFixed(3),
    );

    return {
      output: `PING ${targetIp} (${targetIp}) 56(84) bytes of data.
64 bytes from ${targetIp}: icmp_seq=1 ttl=${64 - result.hops.length + 1} time=${times[0]} ms
64 bytes from ${targetIp}: icmp_seq=2 ttl=${64 - result.hops.length + 1} time=${times[1]} ms
64 bytes from ${targetIp}: icmp_seq=3 ttl=${64 - result.hops.length + 1} time=${times[2]} ms

--- ${targetIp} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2000ms
rtt min/avg/max/mdev = ${times[0]}/${times[1]}/${times[2]}/${(latency * 0.05).toFixed(3)} ms`,
      exitCode: 0,
    };
  },

  traceroute: (args, config, shape, allObjects, allConnections) => {
    const host = args[0];
    if (!host) return { output: "Usage: traceroute <ip>", exitCode: 1 };
    if (!shape || !config?.ipAddress)
      return { output: "Keine IP konfiguriert", exitCode: 1 };

    const targetShape = allObjects.find(
      (o) => o.config?.ipAddress?.split("/")[0] === host,
    );
    if (!targetShape)
      return { output: `traceroute: ${host}: Host not found`, exitCode: 1 };

    const result = checkConnectivity(
      shape.id,
      targetShape.id,
      allObjects,
      allConnections,
    );
    let output = `traceroute to ${host}, 30 hops max, 60 byte packets\n`;

    if (!result.reachable) {
      output += result.hops
        .map(
          (h, i) =>
            ` ${i + 1}  ${h.ip || "* * *"}  ${(2 + Math.random() * 3).toFixed(3)} ms  ${h.action}${h.detail ? " (" + h.detail + ")" : ""}`,
        )
        .join("\n");
      output += `\n     * * * Ziel nicht erreichbar: ${result.error}`;
    } else {
      output += result.hops
        .slice(1)
        .map(
          (h, i) =>
            ` ${i + 1}  ${h.ip}  ${(2 + Math.random() * 3).toFixed(3)} ms  ${(2 + Math.random() * 3).toFixed(3)} ms  ${(2 + Math.random() * 3).toFixed(3)} ms`,
        )
        .join("\n");
    }

    return { output, exitCode: result.reachable ? 0 : 1 };
  },

  arp: (args, config, shape, allObjects, allConnections) => {
    if (args[0] === "-a" || args.length === 0) {
      if (!shape) return { output: "Kein Gerät ausgewählt", exitCode: 1 };
      const entries = buildARPTable(shape, allObjects, allConnections);
      if (entries.length === 0)
        return { output: "ARP-Tabelle ist leer", exitCode: 0 };

      let output = "";
      entries.forEach((e) => {
        output += `${e.ipAddress.padEnd(16)} ${e.macAddress.padEnd(20)} ${e.type.padEnd(10)} ${e.interface}\n`;
      });
      return { output, exitCode: 0 };
    }
    return { output: "Usage: arp -a", exitCode: 1 };
  },

  nslookup: (args, config, shape, allObjects, allConnections) => {
    const host = args[0];
    if (!host) return { output: "Usage: nslookup <hostname>", exitCode: 1 };
    if (!shape) return { output: "Kein Gerät", exitCode: 1 };

    const result = resolveDNS(host, shape, allObjects, allConnections);
    let output = `Server:  ${config?.dns?.[0] || "unbekannt"}\nAddress: ${config?.dns?.[0] || "unbekannt"}#53\n\n`;

    if (result.resolved) {
      output += `Name:\t${host}\nAddress: ${result.ip}\nType:\t${result.recordType || "A"}`;
    } else {
      output += result.steps.join("\n");
      output += `\n** server can't find ${host}: NXDOMAIN`;
    }
    return { output, exitCode: result.resolved ? 0 : 1 };
  },

  dhclient: (args, config, shape, allObjects, allConnections, updateConfig) => {
    if (!shape) return { output: "Kein Gerät", exitCode: 1 };

    const result = performDHCP(shape, allObjects, allConnections);
    let output = result.steps.join("\n");

    if (result.success && updateConfig) {
      output += `\n\nBound to ${result.assignedIp}`;
      output += `\n  IP:      ${result.assignedIp}`;
      output += `\n  Mask:    ${result.subnetMask}`;
      output += `\n  Gateway: ${result.gateway}`;
      output += `\n  DNS:     ${result.dns?.join(", ")}`;
      output += `\n  Lease:   ${result.leaseTime}s`;

      // Actually apply the IP
      updateConfig({
        ...config,
        ipAddress: result.assignedIp,
        subnetMask: result.subnetMask,
        gateway: result.gateway,
        dns: result.dns,
      });
    }

    return { output, exitCode: result.success ? 0 : 1 };
  },

  // ── Show Commands (IOS-Style) ─────────────────────────
  show: (args, config, shape, allObjects, allConnections) => {
    const sub = args.join(" ").toLowerCase();

    if (sub === "ip route" || sub === "ip routes") {
      const rt = config?.routingTable;
      if (!rt || rt.entries.length === 0) {
        return {
          output:
            "Keine Routen konfiguriert.\nVerwende: ip route <network> <mask> <next-hop>",
          exitCode: 0,
        };
      }
      let output =
        "Codes: C - connected, S - static, O - OSPF, R - RIP, B - BGP\n\n";
      for (const entry of rt.entries) {
        const code =
          entry.protocol === "connected"
            ? "C"
            : entry.protocol === "static"
              ? "S"
              : entry.protocol === "ospf"
                ? "O"
                : "S";
        const cidr = maskToCidr(entry.netmask);
        output += `${code}    ${entry.destination}/${cidr} `;
        if (entry.nextHop === "directly connected") {
          output += `is directly connected, ${entry.interface}\n`;
        } else {
          output += `via ${entry.nextHop}, metric ${entry.metric}\n`;
        }
      }
      return { output, exitCode: 0 };
    }

    if (sub === "arp") {
      if (!shape) return { output: "Kein Gerät", exitCode: 1 };
      const entries = buildARPTable(shape, allObjects, allConnections);
      if (entries.length === 0)
        return { output: "ARP-Tabelle ist leer", exitCode: 0 };
      let output =
        "Protocol  Address          Age (sec)  Hardware Addr      Type   Interface\n";
      for (const e of entries) {
        output += `Internet  ${e.ipAddress.padEnd(16)} ${String(e.age).padEnd(10)} ${e.macAddress.padEnd(18)} ${e.type.padEnd(6)} ${e.interface}\n`;
      }
      return { output, exitCode: 0 };
    }

    if (sub === "interfaces" || sub === "interface") {
      const interfaces = config?.interfaces || [];
      if (interfaces.length === 0)
        return { output: "Keine Interfaces konfiguriert", exitCode: 0 };
      let output = "";
      for (const iface of interfaces) {
        output += `${iface.name} is ${iface.status === "up" ? "up" : "administratively down"}, line protocol is ${iface.status === "up" ? "up" : "down"}
  Hardware is Ethernet, address is ${iface.macAddress}
  ${iface.ipAddress ? `Internet address is ${iface.ipAddress}/${iface.subnetMask ? maskToCidr(iface.subnetMask) : "24"}` : "  No Internet address configured"}
  MTU ${iface.mtu} bytes, BW ${iface.speed === "auto" ? "1000" : iface.speed}000 Kbit/sec, DLY 10 usec
  Speed ${iface.speed}Mbps, ${iface.duplex}-duplex${iface.vlan ? `, VLAN ${iface.vlan}` : ""}${iface.mode ? `, Mode: ${iface.mode}` : ""}${iface.description ? `\n  Description: ${iface.description}` : ""}
`;
      }
      return { output, exitCode: 0 };
    }

    if (sub === "interfaces brief" || sub === "ip interface brief") {
      const interfaces = config?.interfaces || [];
      if (interfaces.length === 0)
        return { output: "Keine Interfaces konfiguriert", exitCode: 0 };
      let output =
        "Interface        IP-Address      OK? Method Status                Protocol\n";
      for (const iface of interfaces) {
        output += `${iface.name.padEnd(17)}${(iface.ipAddress || "unassigned").padEnd(16)}YES manual ${iface.status === "up" ? "up" : "administratively down"}\n`;
      }
      return { output, exitCode: 0 };
    }

    if (sub === "vlan" || sub === "vlan brief") {
      const vlans = config?.vlans || [];
      if (vlans.length === 0)
        return { output: "Keine VLANs konfiguriert", exitCode: 0 };
      let output =
        "VLAN Name                             Status\n---- -------------------------------- ---------\n";
      for (const vlan of vlans) {
        output += `${String(vlan.id).padEnd(5)}${vlan.name.padEnd(33)}${vlan.status}\n`;
      }
      // Show port assignments
      const interfaces = config?.interfaces || [];
      const accessPorts = interfaces.filter(
        (i) => i.mode === "access" && i.vlan,
      );
      if (accessPorts.length > 0) {
        output += "\nVLAN Ports\n---- ------\n";
        const vlanPorts: Record<number, string[]> = {};
        accessPorts.forEach((p) => {
          if (!vlanPorts[p.vlan!]) vlanPorts[p.vlan!] = [];
          vlanPorts[p.vlan!].push(p.name);
        });
        Object.entries(vlanPorts).forEach(([vid, ports]) => {
          output += `${vid.padEnd(5)}${ports.join(", ")}\n`;
        });
      }
      return { output, exitCode: 0 };
    }

    if (sub === "running-config" || sub === "run") {
      let output = `!\nhostname ${config?.hostname || "Router"}\n!\n`;
      // Interfaces
      const interfaces = config?.interfaces || [];
      for (const iface of interfaces) {
        output += `interface ${iface.name}\n`;
        if (iface.ipAddress)
          output += ` ip address ${iface.ipAddress} ${iface.subnetMask || "255.255.255.0"}\n`;
        if (iface.description) output += ` description ${iface.description}\n`;
        if (iface.mode === "access" && iface.vlan)
          output += ` switchport mode access\n switchport access vlan ${iface.vlan}\n`;
        if (iface.mode === "trunk")
          output += ` switchport mode trunk\n${iface.trunkVlans ? " switchport trunk allowed vlan " + iface.trunkVlans.join(",") + "\n" : ""}`;
        if (iface.status !== "up") output += ` shutdown\n`;
        output += `!\n`;
      }
      // Routes
      const rt = config?.routingTable;
      if (rt) {
        for (const entry of rt.entries.filter((e) => e.protocol === "static")) {
          output += `ip route ${entry.destination} ${entry.netmask} ${entry.nextHop}\n`;
        }
      }
      // ACLs
      if (config?.acls) {
        for (const acl of config.acls) {
          output += `!\naccess-list ${acl.name}\n`;
          for (const rule of acl.rules) {
            output += ` ${rule.id} ${rule.action} ${rule.protocol} ${rule.sourceIp} ${rule.destinationIp}${rule.destinationPort ? " eq " + rule.destinationPort : ""}\n`;
          }
        }
      }
      // NAT
      if (config?.natConfig?.enabled) {
        for (const rule of config.natConfig.rules) {
          if (rule.type === "static") {
            output += `ip nat inside source static ${rule.insideLocal} ${rule.insideGlobal}\n`;
          }
        }
      }
      // DHCP
      if (config?.dhcpServer?.enabled) {
        for (const pool of config.dhcpServer.pools) {
          output += `!\nip dhcp pool ${pool.name}\n`;
          output += ` network ${pool.network} ${pool.netmask}\n`;
          output += ` default-router ${pool.defaultGateway}\n`;
          output += ` dns-server ${pool.dnsServers.join(" ")}\n`;
          output += ` lease ${pool.leaseTime}\n`;
        }
      }
      output += "!\nend\n";
      return { output, exitCode: 0 };
    }

    if (sub === "ip nat translations") {
      const nat = config?.natConfig;
      if (!nat?.enabled)
        return { output: "NAT ist nicht aktiviert", exitCode: 0 };
      let output =
        "Pro  Inside global    Inside local     Outside local    Outside global\n";
      for (const rule of nat.rules) {
        output += `${(rule.protocol || "---").padEnd(5)}${rule.insideGlobal.padEnd(17)}${rule.insideLocal.padEnd(17)}---              ---\n`;
      }
      for (const t of nat.translations) {
        output += `${(t.protocol || "---").padEnd(5)}${t.insideGlobal.padEnd(17)}${t.insideLocal.padEnd(17)}---              ---\n`;
      }
      return { output, exitCode: 0 };
    }

    if (sub === "spanning-tree" || sub === "spanning-tree detail") {
      const stp = config?.stpConfig;
      if (!stp?.enabled)
        return {
          output: "STP ist nicht aktiviert auf diesem Gerät",
          exitCode: 0,
        };
      let output = `VLAN0001\n  Spanning tree enabled protocol ieee\n  Root ID    Priority  ${stp.rootBridgeId ? `${stp.rootBridgeId.split("-")[0] || stp.priority}` : stp.priority}\n             Address   ${stp.rootBridgeId || stp.bridgeId}\n`;
      if (stp.rootCost === 0) {
        output += `             This bridge is the root\n`;
      } else {
        output += `             Cost      ${stp.rootCost}\n`;
      }
      output += `\n  Bridge ID  Priority  ${stp.priority}\n             Address   ${stp.bridgeId}\n\n`;
      output += `Interface        Role Sts Cost  Prio\n`;
      output += `---------------- ---- --- ----- ----\n`;
      for (const [ifName, ps] of Object.entries(stp.portStates || {})) {
        output += `${ifName.padEnd(17)}${ps.role.slice(0, 4).padEnd(5)}${ps.state.slice(0, 3).toUpperCase().padEnd(4)}${String(ps.cost).padEnd(6)}${ps.priority}\n`;
      }
      return { output, exitCode: 0 };
    }

    if (sub === "ip access-lists" || sub === "access-lists") {
      const acls = config?.acls;
      if (!acls || acls.length === 0)
        return { output: "Keine ACLs konfiguriert", exitCode: 0 };
      let output = "";
      for (const acl of acls) {
        output += `Access list ${acl.name}:\n`;
        for (const rule of acl.rules) {
          output += `  ${rule.id} ${rule.action} ${rule.protocol} ${rule.sourceIp}${rule.sourcePort ? ":" + rule.sourcePort : ""} → ${rule.destinationIp}${rule.destinationPort ? ":" + rule.destinationPort : ""} (${rule.hitCount} matches)${rule.description ? " // " + rule.description : ""}\n`;
        }
      }
      return { output, exitCode: 0 };
    }

    return {
      output: `Unbekannter show-Befehl: show ${args.join(" ")}\nSiehe 'help' für verfügbare Befehle`,
      exitCode: 1,
    };
  },

  // ── Static Route Management ───────────────────────────
  configure: (args) => {
    if (args[0] === "terminal" || args[0] === "t") {
      return {
        output: "Konfigurationsmodus aktiv. Befehle: ip route, hostname, etc.",
        exitCode: 0,
      };
    }
    return { output: "Usage: configure terminal", exitCode: 1 };
  },

  // "ip" command is already defined above, but we need "ip route add" logic
  // This is handled via the main 'ip' handler or dedicated:

  netstat: (_, config) => {
    const ports = config?.ports || [];
    let output = `Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\n`;
    ports.forEach((p) => {
      if (p.status === "open") {
        output += `${p.protocol.toLowerCase()}        0      0 0.0.0.0:${p.port}            0.0.0.0:*               LISTEN\n`;
      }
    });
    return { output: output || "No active connections", exitCode: 0 };
  },

  validate: (args, config, shape, allObjects, allConnections) => {
    const warnings = validateTopology(allObjects, allConnections);
    if (warnings.length === 0)
      return {
        output: "✓ Topologie ist in Ordnung. Keine Probleme gefunden.",
        exitCode: 0,
      };

    let output = `Topologie-Validierung: ${warnings.length} Problem(e) gefunden\n${"─".repeat(60)}\n`;
    for (const w of warnings) {
      const icon =
        w.severity === "error" ? "✗" : w.severity === "warning" ? "⚠" : "ℹ";
      output += `${icon} [${w.severity.toUpperCase()}] ${w.message}\n`;
      if (w.fix) output += `  Fix: ${w.fix}\n`;
    }
    return {
      output,
      exitCode: warnings.some((w) => w.severity === "error") ? 1 : 0,
    };
  },

  // ── System Commands ───────────────────────────────────
  whoami: () => ({ output: "root", exitCode: 0 }),

  uptime: () => ({
    output: ` ${new Date().toLocaleTimeString()}  up 42 days, 3:21,  1 user,  load average: 0.15, 0.10, 0.05`,
    exitCode: 0,
  }),

  free: () => ({
    output: `              total        used        free      shared  buff/cache   available\nMem:        8053096     2156780     3521428      123456     2374888     5485432\nSwap:       2097148           0     2097148`,
    exitCode: 0,
  }),

  df: () => ({
    output: `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   15G   33G  32% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm\n/dev/sdb1       100G   42G   53G  45% /data`,
    exitCode: 0,
  }),

  ls: (args) => {
    const path = args[0] || ".";
    if (path === "/" || path === "") {
      return {
        output: `bin   dev  home  lib64  mnt  proc  run   srv  tmp  var\nboot  etc  lib   media  opt  root  sbin  sys  usr`,
        exitCode: 0,
      };
    }
    return { output: `bin  config  data  logs  scripts`, exitCode: 0 };
  },

  cat: (args, config) => {
    const file = args[0];
    if (!file) return { output: "cat: missing operand", exitCode: 1 };
    if (file.includes("config") || file.includes(".conf")) {
      return {
        output: `# Configuration file\nserver {\n    listen 80;\n    server_name ${config?.hostname || "localhost"};\n    root /var/www/html;\n}`,
        exitCode: 0,
      };
    }
    if (file === "/etc/resolv.conf") {
      const dns = config?.dns || [];
      return {
        output:
          dns.length > 0
            ? dns.map((d) => `nameserver ${d}`).join("\n")
            : "# No DNS configured",
        exitCode: 0,
      };
    }
    if (file === "/etc/hostname") {
      return { output: config?.hostname || "localhost", exitCode: 0 };
    }
    return { output: `cat: ${file}: No such file or directory`, exitCode: 1 };
  },

  // ── Container Commands ────────────────────────────────
  docker: (args) => {
    if (args[0] === "ps") {
      return {
        output: `CONTAINER ID   IMAGE          COMMAND                  CREATED       STATUS       PORTS                    NAMES\na1b2c3d4e5f6   nginx:latest   "/docker-entrypoint.…"   2 hours ago   Up 2 hours   0.0.0.0:80->80/tcp       web\nb2c3d4e5f6a7   redis:alpine   "docker-entrypoint.s…"   3 hours ago   Up 3 hours   0.0.0.0:6379->6379/tcp   cache\nc3d4e5f6a7b8   mysql:8.0      "docker-entrypoint.s…"   1 day ago     Up 1 day     3306/tcp                 database`,
        exitCode: 0,
      };
    }
    if (args[0] === "images") {
      return {
        output: `REPOSITORY   TAG       IMAGE ID       CREATED        SIZE\nnginx        latest    a1b2c3d4e5f6   2 weeks ago    142MB\nredis        alpine    b2c3d4e5f6a7   3 weeks ago    28.5MB\nmysql        8.0       c3d4e5f6a7b8   1 month ago    565MB`,
        exitCode: 0,
      };
    }
    return { output: "Usage: docker [ps|images|run|stop|rm]", exitCode: 1 };
  },

  kubectl: (args) => {
    if (args[0] === "get" && args[1] === "pods") {
      return {
        output: `NAME                          READY   STATUS    RESTARTS   AGE\nnginx-deployment-abc123       1/1     Running   0          2d\nredis-master-def456           1/1     Running   0          5d\nmysql-statefulset-0           1/1     Running   1          7d`,
        exitCode: 0,
      };
    }
    if (args[0] === "get" && args[1] === "services") {
      return {
        output: `NAME         TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE\nkubernetes   ClusterIP   10.96.0.1      <none>        443/TCP    30d\nnginx        NodePort    10.96.100.1    <none>        80:30080   2d\nredis        ClusterIP   10.96.100.2    <none>        6379/TCP   5d`,
        exitCode: 0,
      };
    }
    return {
      output: "Usage: kubectl get [pods|services|deployments|nodes]",
      exitCode: 1,
    };
  },

  systemctl: (args) => {
    const action = args[0];
    const service = args[1] || "nginx";
    if (action === "status") {
      return {
        output: `● ${service}.service - ${service.charAt(0).toUpperCase() + service.slice(1)} Service\n   Loaded: loaded (/lib/systemd/system/${service}.service; enabled)\n   Active: active (running) since Mon; 2 days ago\n Main PID: 1234 (${service})\n    Tasks: 4 (limit: 4915)\n   Memory: 8.5M`,
        exitCode: 0,
      };
    }
    if (action === "start" || action === "stop" || action === "restart") {
      return { output: "", exitCode: 0 };
    }
    return {
      output: `Usage: systemctl [start|stop|restart|status] <service>`,
      exitCode: 1,
    };
  },

  clear: () => ({ output: "__CLEAR__", exitCode: 0 }),
  exit: () => ({ output: "__EXIT__", exitCode: 0 }),
};

// ============================================================
// Terminal Component
// ============================================================

export function TerminalEmulator({
  shape,
  onClose,
  onUpdateHistory,
  onUpdateConfig,
  allObjects = [],
  allConnections = [],
  theme,
}: TerminalEmulatorProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalCommand[]>(
    shape?.terminalHistory || [],
  );
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hostname = shape?.config?.hostname || shape?.label || "device";

  const updateConfig = useCallback(
    (newConfig: ShapeConfig) => {
      if (shape && onUpdateConfig) {
        onUpdateConfig(shape.id, newConfig);
      }
    },
    [shape, onUpdateConfig],
  );

  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      const [baseCmd, ...args] = trimmed.split(/\s+/);
      const cmdLower = baseCmd.toLowerCase();

      // Handle special compound commands
      let handler: CommandHandler | undefined;

      // "ip route add" → modify routing table
      if (
        cmdLower === "ip" &&
        args[0] === "route" &&
        args.length >= 4 &&
        args[1] !== undefined
      ) {
        // ip route <dest> <mask> <nexthop>
        if (args[1] !== "add" && isValidIp(args[1])) {
          // Direct: ip route 192.168.2.0 255.255.255.0 10.0.0.1
          const dest = args[1];
          const mask = args[2];
          const nextHop = args[3];
          if (shape && onUpdateConfig) {
            const rt = { ...(shape.config?.routingTable || { entries: [] }) };
            rt.entries = [
              ...rt.entries,
              {
                destination: dest,
                netmask: mask,
                nextHop,
                interface: "Gi0/0",
                metric: 1,
                protocol: "static" as const,
              },
            ];
            onUpdateConfig(shape.id, { ...shape.config, routingTable: rt });
          }
          const result = {
            output: `Statische Route hinzugefügt: ${dest} ${mask} via ${nextHop}`,
            exitCode: 0,
          };
          const newCommand: TerminalCommand = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            command: trimmed,
            output: result.output,
            exitCode: result.exitCode,
          };
          const newHistory = [...history, newCommand];
          setHistory(newHistory);
          if (shape) onUpdateHistory(shape.id, newHistory);
          return;
        }
      }

      // "no ip route" → remove route
      if (cmdLower === "no" && args[0] === "ip" && args[1] === "route") {
        const dest = args[2];
        const mask = args[3];
        if (shape && onUpdateConfig && dest && mask) {
          const rt = { ...(shape.config?.routingTable || { entries: [] }) };
          rt.entries = rt.entries.filter(
            (e) => !(e.destination === dest && e.netmask === mask),
          );
          onUpdateConfig(shape.id, { ...shape.config, routingTable: rt });
        }
        const result = {
          output: `Route entfernt: ${dest} ${mask}`,
          exitCode: 0,
        };
        const newCommand: TerminalCommand = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          command: trimmed,
          output: result.output,
          exitCode: result.exitCode,
        };
        const newHistory = [...history, newCommand];
        setHistory(newHistory);
        if (shape) onUpdateHistory(shape.id, newHistory);
        return;
      }

      handler = COMMANDS[cmdLower];

      let result: { output: string; exitCode: number };
      if (handler) {
        result = handler(
          args,
          shape?.config,
          shape,
          allObjects,
          allConnections,
          onUpdateConfig ? updateConfig : undefined,
        );
      } else {
        result = {
          output: `bash: ${baseCmd}: command not found\nSiehe 'help' für verfügbare Befehle.`,
          exitCode: 127,
        };
      }

      if (result.output === "__CLEAR__") {
        setHistory([]);
        return;
      }

      if (result.output === "__EXIT__") {
        onClose();
        return;
      }

      const newCommand: TerminalCommand = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        command: trimmed,
        output: result.output,
        exitCode: result.exitCode,
      };

      const newHistory = [...history, newCommand];
      setHistory(newHistory);
      if (shape) {
        onUpdateHistory(shape.id, newHistory);
      }
    },
    [
      history,
      shape,
      onUpdateHistory,
      onClose,
      allObjects,
      allConnections,
      onUpdateConfig,
      updateConfig,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const commands = history.filter((h) => h.command);
      if (commands.length > 0) {
        const newIndex =
          historyIndex < commands.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commands[commands.length - 1 - newIndex]?.command || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const commands = history.filter((h) => h.command);
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commands[commands.length - 1 - newIndex]?.command || "");
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      // Tab completion
      e.preventDefault();
      const partial = input.toLowerCase();
      const matches = Object.keys(COMMANDS).filter((c) =>
        c.startsWith(partial),
      );
      if (matches.length === 1) {
        setInput(matches[0] + " ");
      } else if (matches.length > 1) {
        // Show possible completions
        const newCommand: TerminalCommand = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          command: "",
          output: matches.join("  "),
          exitCode: 0,
        };
        setHistory([...history, newCommand]);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-[600px] max-w-[95vw] h-[400px] rounded-xl shadow-2xl border overflow-hidden z-50 flex flex-col",
        theme === "dark"
          ? "bg-slate-950 border-slate-700"
          : "bg-slate-900 border-slate-300",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <TerminalIcon size={16} className="text-green-500" />
          <span className="text-sm font-medium text-white">
            {hostname}@terminal
          </span>
          {shape?.status && (
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                shape.status === "running" && "bg-green-500",
                shape.status === "stopped" && "bg-slate-500",
                shape.status === "error" && "bg-red-500",
              )}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHistory([])}
            className="h-6 w-6 text-slate-400 hover:text-white"
            title="Clear"
          >
            <Trash size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const text = history
                .map((h) => `$ ${h.command}\n${h.output}`)
                .join("\n\n");
              navigator.clipboard.writeText(text);
            }}
            className="h-6 w-6 text-slate-400 hover:text-white"
            title="Copy"
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="font-mono text-sm text-green-400 space-y-2">
          {/* Welcome message */}
          {history.length === 0 && (
            <div className="text-slate-500">
              Welcome to {hostname}. Type 'help' for available commands.
            </div>
          )}

          {/* Command History */}
          {history.map((cmd) => (
            <div key={cmd.id} className="space-y-1">
              {cmd.command && (
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">root@{hostname}</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-slate-500">$</span>
                  <span className="text-white">{cmd.command}</span>
                </div>
              )}
              {cmd.output && (
                <pre
                  className={cn(
                    "whitespace-pre-wrap pl-4",
                    cmd.exitCode === 0 ? "text-slate-300" : "text-red-400",
                  )}
                >
                  {cmd.output}
                </pre>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-700 bg-slate-900">
        <span className="text-cyan-400 font-mono text-sm">root@{hostname}</span>
        <span className="text-slate-500 font-mono text-sm">:</span>
        <span className="text-blue-400 font-mono text-sm">~</span>
        <span className="text-slate-500 font-mono text-sm">$</span>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none text-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
          placeholder=""
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

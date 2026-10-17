import type {
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
} from "@/types/topology";
import { computeStructuredRoutingTable, lookupRouteLpm, getNetworkAddress } from "../routing-table";
import { computeStp, isSwitch, type StpBridgeInfo, type StpPortInfo } from "../stp-calc";
import { computeHsrp, hasHsrpConfig } from "../hsrp";
import { evaluateAcl } from "./acl-evaluator";
import type {
  SimulatedPacket,
  HopStep,
  SimulationResult,
  SimulationOptions,
  DropReasonCode,
} from "./types";
import { normalizeInterfaceName } from "../hardware-profiles";
import { isLinkUsable, isInterfaceActive } from "../ospf-neighbors";

/**
 * Gibt eine eindeutige symbolische MAC-Adresse zurück (z. B. "MAC(R1 Gi0/0)"),
 * es sei denn, in den Gerätedaten steht eine explizite MAC.
 * Vorgabe: Keine erfundenen Hex-Werte wie aaaa.bbbb.cccc!
 */
export function getSymbolicMac(device: TopologyDevice, iface?: TopologyInterface | string): string {
  const ifaceObj =
    typeof iface === "string"
      ? device.interfaces.find(
          (i) => i.name === iface || normalizeInterfaceName(i.name) === normalizeInterfaceName(iface),
        )
      : iface ?? device.interfaces[0];

  if (ifaceObj?.mac) return ifaceObj.mac;
  if (device.config?.stp?.mac) return device.config.stp.mac;

  const ifPart = ifaceObj ? ` ${ifaceObj.name}` : "";
  return `MAC(${device.name}${ifPart})`;
}

/** Ermittelt die IP-Adresse (ohne Subnetz-Präfix) eines Interfaces */
function cleanIp(ipWithCidr?: string): string {
  if (!ipWithCidr) return "";
  return ipWithCidr.split("/")[0].trim();
}

/** Findet ein Gerät und Interface anhand einer Ziel-IP im Netzwerk */
export function findDeviceByIp(
  topology: NetworkTopology,
  ip: string,
): { device: TopologyDevice; iface: TopologyInterface } | null {
  for (const d of topology.devices) {
    for (const ifc of d.interfaces) {
      if (cleanIp(ifc.ip) === ip) {
        return { device: d, iface: ifc };
      }
    }
    // L3 SVIs
    if (d.config?.svis) {
      for (const svi of d.config.svis) {
        if (cleanIp(svi.ip) === ip) {
          // Virtuelles oder repräsentatives SVI-Interface
          const existing = d.interfaces.find((i) => i.name === `Vlan${svi.vlan}`);
          const iface = existing ?? {
            id: `${d.id}-vlan${svi.vlan}`,
            name: `Vlan${svi.vlan}`,
            status: "up",
            ip: svi.ip,
          };
          return { device: d, iface };
        }
      }
    }
  }
  return null;
}

/** Findet das primäre Interface eines Geräts (mit IP oder erstes Interface) */
export function getPrimaryInterface(device: TopologyDevice): TopologyInterface | undefined {
  return device.interfaces.find((i) => !!i.ip) ?? device.interfaces[0];
}

/**
 * Löst HSRP auf: falls die Next-Hop-IP eine HSRP-VIP ist,
 * wird der Active-Router dafür ausgewählt.
 */
function resolveHsrpTarget(
  topology: NetworkTopology,
  ip: string,
): { activeDevice: TopologyDevice; activeIface: TopologyInterface } | null {
  for (const d of topology.devices) {
    if (!hasHsrpConfig(d)) continue;
    const hsrpRows = computeHsrp(d, topology);
    for (const row of hsrpRows) {
      if (cleanIp(row.virtualIp) === ip && row.state === "Active") {
        return { activeDevice: d, activeIface: row.iface };
      }
    }
  }
  return null;
}

/**
 * Löst ein Ziel hinter NAT auf: falls eine globale IP angepingt wird,
 * wird das reale Zielgerät (mit der lokalen IP) dahinter ermittelt.
 */
function resolveNatTarget(
  topology: NetworkTopology,
  ip: string,
): { targetDevice: TopologyDevice; targetIface: TopologyInterface } | null {
  for (const d of topology.devices) {
    const statics = d.config?.nat?.statics;
    if (!statics) continue;
    const match = statics.find((s) => s.global === ip);
    if (match) {
      const insideTarget = findDeviceByIp(topology, match.local);
      if (insideTarget) {
        return { targetDevice: insideTarget.device, targetIface: insideTarget.iface };
      }
    }
  }
  return null;
}

/**
 * Findet den Link, der an einem bestimmten Interface eines Geräts angeschlossen ist.
 */
function findConnectedLinkForInterface(
  topology: NetworkTopology,
  deviceId: string,
  ifaceIdOrName: string,
): { link: TopologyLink; remoteDevice: TopologyDevice; remoteIface: TopologyInterface } | null {
  const dev = topology.devices.find((d) => d.id === deviceId);
  if (!dev) return null;
  const iface = dev.interfaces.find((i) => i.id === ifaceIdOrName || i.name === ifaceIdOrName);
  if (!iface) return null;

  for (const link of topology.links) {
    const isSource = link.sourceDeviceId === deviceId && link.sourceInterfaceId === iface.id;
    const isTarget = link.targetDeviceId === deviceId && link.targetInterfaceId === iface.id;
    if (isSource || isTarget) {
      const remoteDevId = isSource ? link.targetDeviceId : link.sourceDeviceId;
      const remoteIfaceId = isSource ? link.targetInterfaceId : link.sourceInterfaceId;
      const remoteDevice = topology.devices.find((d) => d.id === remoteDevId);
      const remoteIface = remoteDevice?.interfaces.find((i) => i.id === remoteIfaceId);
      if (remoteDevice && remoteIface) {
        return { link, remoteDevice, remoteIface };
      }
    }
  }
  return null;
}

/**
 * L2-Switching-Pfadsuche: Traversiert Switches, bis das L3-Zielgerät erreicht wird.
 */
function traverseL2Segment(
  topology: NetworkTopology,
  startDevice: TopologyDevice,
  startIface: TopologyInterface,
  targetDevice: TopologyDevice,
  packet: SimulatedPacket,
  hops: HopStep[],
  stpData: Map<string, StpBridgeInfo>,
  maxSteps: number = 10,
): { currentDevice: TopologyDevice; currentIface: TopologyInterface; dropped?: boolean; dropReason?: DropReasonCode; explanation?: string } {
  let currDev = startDevice;
  let currIf = startIface;
  let steps = 0;

  while (isSwitch(currDev) && currDev.id !== targetDevice.id && steps < maxSteps) {
    steps++;
    const swInfo = stpData.get(currDev.id);

    // Ingress Port STP prüfen
    const inPortStp = swInfo?.ports?.find(
      (p: StpPortInfo) => p.iface.id === currIf.id || p.iface.name === currIf.name,
    );
    if (inPortStp && inPortStp.state === "BLK") {
      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currDev.id,
        deviceName: currDev.name,
        inInterface: currIf.name,
        action: "drop",
        reason: `Port ${currIf.name} auf Switch ${currDev.name} ist durch STP blockiert (BLK/ALT).`,
        packet: { ...packet },
        status: "dropped",
        dropReason: "stp-blocked",
      });
      return { currentDevice: currDev, currentIface: currIf, dropped: true, dropReason: "stp-blocked", explanation: `STP-Blocking auf ${currDev.name} ${currIf.name}` };
    }

    // VLAN bestimmen
    const vlan = currIf.mode === "trunk" ? currIf.nativeVlan ?? 1 : currIf.vlan ?? 1;

    // Finde Egress-Port in Richtung targetDevice
    // Suche Link, der weiterführt
    let foundNext: { link: TopologyLink; egressIface: TopologyInterface; nextDev: TopologyDevice; nextIface: TopologyInterface } | null = null;

    for (const ifc of currDev.interfaces) {
      if (ifc.id === currIf.id) continue;
      const conn = findConnectedLinkForInterface(topology, currDev.id, ifc.id);
      if (!conn) continue;

      // Prüfe, ob dieser Port das VLAN transportiert
      if (ifc.mode === "trunk") {
        if (ifc.allowedVlans && !ifc.allowedVlans.includes(vlan)) continue;
      } else {
        if (ifc.vlan && ifc.vlan !== vlan) continue;
      }

      // Wenn der Link direkt zum targetDevice führt:
      if (conn.remoteDevice.id === targetDevice.id) {
        foundNext = { link: conn.link, egressIface: ifc, nextDev: conn.remoteDevice, nextIface: conn.remoteIface };
        break;
      }
      // Oder zu einem weiteren Switch:
      if (isSwitch(conn.remoteDevice) && !hops.some((h) => h.deviceId === conn.remoteDevice.id)) {
        foundNext = { link: conn.link, egressIface: ifc, nextDev: conn.remoteDevice, nextIface: conn.remoteIface };
      }
    }

    if (!foundNext) {
      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currDev.id,
        deviceName: currDev.name,
        inInterface: currIf.name,
        action: "drop",
        reason: `Switch ${currDev.name}: Kein Egress-Port im VLAN ${vlan} in Richtung Ziel ${targetDevice.name} gefunden.`,
        packet: { ...packet },
        status: "dropped",
        dropReason: "vlan-mismatch",
      });
      return { currentDevice: currDev, currentIface: currIf, dropped: true, dropReason: "vlan-mismatch", explanation: `VLAN ${vlan} Mismatch auf ${currDev.name}` };
    }

    // Egress Port STP prüfen
    const outPortStp = swInfo?.ports?.find(
      (p: StpPortInfo) => p.iface.id === foundNext.egressIface.id || p.iface.name === foundNext.egressIface.name,
    );
    if (outPortStp && outPortStp.state === "BLK") {
      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currDev.id,
        deviceName: currDev.name,
        inInterface: currIf.name,
        outInterface: foundNext.egressIface.name,
        action: "drop",
        reason: `Ausgangs-Port ${foundNext.egressIface.name} auf Switch ${currDev.name} ist durch STP blockiert (BLK/ALT).`,
        packet: { ...packet },
        status: "dropped",
        dropReason: "stp-blocked",
      });
      return { currentDevice: currDev, currentIface: foundNext.egressIface, dropped: true, dropReason: "stp-blocked", explanation: `STP-Blocking auf ${currDev.name} ${foundNext.egressIface.name}` };
    }

    // Link Usable prüfen
    if (!isLinkUsable(foundNext.link)) {
      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currDev.id,
        deviceName: currDev.name,
        inInterface: currIf.name,
        outInterface: foundNext.egressIface.name,
        action: "drop",
        reason: `Link an ${currDev.name} ${foundNext.egressIface.name} ist inaktiv oder getrennt.`,
        packet: { ...packet },
        status: "dropped",
        dropReason: "interface-down",
      });
      return { currentDevice: currDev, currentIface: foundNext.egressIface, dropped: true, dropReason: "interface-down", explanation: `Link down an ${currDev.name} ${foundNext.egressIface.name}` };
    }

    // Switch Hop erfassen
    hops.push({
      stepNumber: hops.length + 1,
      deviceId: currDev.id,
      deviceName: currDev.name,
      inInterface: currIf.name,
      outInterface: foundNext.egressIface.name,
      action: "switch",
      reason: `Switch ${currDev.name}: Frame von ${currIf.name} (VLAN ${vlan}) an ${foundNext.egressIface.name} weitergeleitet (STP Forwarding).`,
      packet: { ...packet },
      packetOut: { ...packet },
      status: "ok",
    });

    currDev = foundNext.nextDev;
    currIf = foundNext.nextIface;
  }

  return { currentDevice: currDev, currentIface: currIf };
}

/**
 * Führt einen Hop-by-Hop-Trace für ein Paket in einer Richtung durch.
 */
function tracePath(
  topology: NetworkTopology,
  sourceDevice: TopologyDevice,
  sourceIface: TopologyInterface,
  targetDevice: TopologyDevice,
  targetIface: TopologyInterface,
  initialPacket: SimulatedPacket,
  arpCache: Record<string, Record<string, string>>,
  stpData: Map<string, StpBridgeInfo>,
  isReturnPath: boolean = false,
): { hops: HopStep[]; success: boolean; dropReason?: DropReasonCode; explanation?: string; arpResolvedThisRun: boolean; finalPacket: SimulatedPacket } {
  const hops: HopStep[] = [];
  let currentDev = sourceDevice;
  let currentInIf: TopologyInterface | undefined = undefined;
  const packet: SimulatedPacket = { ...initialPacket };
  let arpResolvedThisRun = false;
  let hopsCount = 0;
  const MAX_HOPS = 20;

  // 1. Host-Gateway-Entscheidung am Ursprungsgerät
  const isHost = sourceDevice.type === "pc" || sourceDevice.type === "server";
  let nextHopIp = packet.dstIp;

  if (isHost) {
    const srcNetInfo = sourceIface.ip ? getNetworkAddress(sourceIface.ip) : null;
    if (srcNetInfo) {
      const destNetInfo = getNetworkAddress(`${packet.dstIp}/${srcNetInfo.cidr}`);
      const isLocalSubnet = destNetInfo && destNetInfo.network === srcNetInfo.network;

      if (isLocalSubnet) {
        nextHopIp = packet.dstIp;
        hops.push({
          stepNumber: 1,
          deviceId: sourceDevice.id,
          deviceName: sourceDevice.name,
          outInterface: sourceIface.name,
          action: "originate",
          reason: `Ziel ${packet.dstIp} liegt im lokalen Subnetz ${srcNetInfo.network}. Direkte ARP/L2-Zustellung.`,
          packet: { ...packet },
          status: "ok",
        });
      } else {
        const gw = sourceDevice.config?.defaultGateway;
        if (!gw) {
          hops.push({
            stepNumber: 1,
            deviceId: sourceDevice.id,
            deviceName: sourceDevice.name,
            action: "drop",
            reason: `Host ${sourceDevice.name} hat kein Default Gateway konfiguriert; Ziel ${packet.dstIp} liegt außerhalb des lokalen Subnetzes.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "no-gateway",
          });
          return { hops, success: false, dropReason: "no-gateway", explanation: `Kein Default Gateway auf ${sourceDevice.name}`, arpResolvedThisRun, finalPacket: packet };
        }

        const gwNetInfo = getNetworkAddress(`${gw}/${srcNetInfo.cidr}`);
        if (!gwNetInfo || gwNetInfo.network !== srcNetInfo.network) {
          hops.push({
            stepNumber: 1,
            deviceId: sourceDevice.id,
            deviceName: sourceDevice.name,
            action: "drop",
            reason: `Konfiguriertes Default Gateway ${gw} liegt nicht im Subnetz ${srcNetInfo.network} des Hosts.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "wrong-subnet",
          });
          return { hops, success: false, dropReason: "wrong-subnet", explanation: `Gateway ${gw} liegt in anderem Subnetz`, arpResolvedThisRun, finalPacket: packet };
        }

        nextHopIp = gw;
        hops.push({
          stepNumber: 1,
          deviceId: sourceDevice.id,
          deviceName: sourceDevice.name,
          outInterface: sourceIface.name,
          action: "originate",
          reason: `Ziel ${packet.dstIp} liegt außerhalb des Subnetzes. Paket wird an Default Gateway ${gw} gesendet.`,
          packet: { ...packet },
          status: "ok",
        });
      }
    }
  }

  // Iteriere über Hops bis zum Zielgerät
  let outIface = sourceIface;

  while (currentDev.id !== targetDevice.id && hopsCount < MAX_HOPS) {
    hopsCount++;

    // Wenn aktuelles Gerät ein Router ist und nicht die Quelle:
    if (currentDev.type === "router" || (currentDev.type === "switch-l3" && currentDev.config?.ipRoutingEnabled)) {
      if (!currentInIf) {
        currentInIf = currentDev.interfaces[0];
      }

      // TTL prüfen
      packet.ttl--;
      if (packet.ttl <= 0) {
        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          inInterface: currentInIf.name,
          action: "drop",
          reason: `TTL auf 0 dekrementiert (Time to Live Expired).`,
          packet: { ...packet },
          status: "dropped",
          dropReason: "ttl-expired",
        });
        return { hops, success: false, dropReason: "ttl-expired", explanation: `TTL abgelaufen auf ${currentDev.name}`, arpResolvedThisRun, finalPacket: packet };
      }

      // Interface-Status prüfen
      if (!isInterfaceActive(currentInIf)) {
        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          inInterface: currentInIf.name,
          action: "drop",
          reason: `Eingangs-Interface ${currentInIf.name} auf ${currentDev.name} ist down oder shutdown.`,
          packet: { ...packet },
          status: "dropped",
          dropReason: "interface-down",
        });
        return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${currentInIf.name} ist down`, arpResolvedThisRun, finalPacket: packet };
      }

      // NAT-Richtung bestimmen
      const natCfg = currentDev.config?.nat;
      const isInsideIn = natCfg?.insideInterfaces?.includes(currentInIf.name) ?? false;
      const isOutsideIn = natCfg?.outsideInterfaces?.includes(currentInIf.name) ?? false;

      // ─── NAT ORDER OF OPERATION ───────────────────────────────────────────
      if (isOutsideIn) {
        // Richtungsfluss: OUTSIDE → INSIDE
        // 1. Eingangs-ACL (sieht unübersetzte Adresse)
        if (currentInIf.inboundAcl) {
          const aclRes = evaluateAcl(
            currentInIf.inboundAcl,
            currentDev.config?.accessLists?.[currentInIf.inboundAcl],
            packet,
            "in",
          );
          if (aclRes.action === "deny") {
            hops.push({
              stepNumber: hops.length + 1,
              deviceId: currentDev.id,
              deviceName: currentDev.name,
              inInterface: currentInIf.name,
              action: "drop",
              reason: aclRes.reason,
              packet: { ...packet },
              status: "dropped",
              dropReason: "acl-deny",
            });
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, finalPacket: packet };
          }
        }

        // 2. NAT Outside-to-Inside (global -> local)
        let natInfo: { beforeIp: string; afterIp: string; direction: "outside-to-inside" } | undefined;
        if (natCfg) {
          const staticMatch = natCfg.statics.find((s) => s.global === packet.dstIp);
          if (staticMatch) {
            const before = packet.dstIp;
            packet.dstIp = staticMatch.local;
            natInfo = { direction: "outside-to-inside", beforeIp: before, afterIp: packet.dstIp };
            hops.push({
              stepNumber: hops.length + 1,
              deviceId: currentDev.id,
              deviceName: currentDev.name,
              inInterface: currentInIf.name,
              action: "nat-outside-to-inside",
              reason: `NAT Outside-to-Inside: Ziel-IP ${before} → ${packet.dstIp} (statisch).`,
              packet: { ...packet, dstIp: before },
              packetOut: { ...packet },
              natTranslation: natInfo,
              status: "ok",
            });
          }
        }

        // 3. Routing (Lookup auf übersetzte Ziel-IP)
        const table = computeStructuredRoutingTable(currentDev, topology);
        const routeMatch = lookupRouteLpm(table, packet.dstIp);
        if (!routeMatch) {
          hops.push({
            stepNumber: hops.length + 1,
            deviceId: currentDev.id,
            deviceName: currentDev.name,
            inInterface: currentInIf.name,
            action: "drop",
            reason: `Keine Route zu ${packet.dstIp} in der Routing-Tabelle von ${currentDev.name}.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "no-route",
          });
          return { hops, success: false, dropReason: "no-route", explanation: `Keine Route zu ${packet.dstIp} auf ${currentDev.name}`, arpResolvedThisRun, finalPacket: packet };
        }

        const egressIfaceName = routeMatch.selectedVia.ifaceName;
        const egressIface = currentDev.interfaces.find((i) => i.name === egressIfaceName || (egressIfaceName && normalizeInterfaceName(i.name) === normalizeInterfaceName(egressIfaceName)));
        if (!egressIface) {
          hops.push({
            stepNumber: hops.length + 1,
            deviceId: currentDev.id,
            deviceName: currentDev.name,
            inInterface: currentInIf.name,
            action: "drop",
            reason: `Ausgangs-Interface ${egressIfaceName} nicht gefunden.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "no-route",
          });
          return { hops, success: false, dropReason: "no-route", explanation: `Interface ${egressIfaceName} fehlt`, arpResolvedThisRun, finalPacket: packet };
        }
        outIface = egressIface;
        nextHopIp = routeMatch.selectedVia.nextHop ?? packet.dstIp;

        // 4. Ausgangs-ACL (sieht übersetzte Adresse)
        if (outIface.outboundAcl) {
          const aclRes = evaluateAcl(
            outIface.outboundAcl,
            currentDev.config?.accessLists?.[outIface.outboundAcl],
            packet,
            "out",
          );
          if (aclRes.action === "deny") {
            hops.push({
              stepNumber: hops.length + 1,
              deviceId: currentDev.id,
              deviceName: currentDev.name,
              inInterface: currentInIf.name,
              outInterface: outIface.name,
              action: "drop",
              reason: aclRes.reason,
              packet: { ...packet },
              status: "dropped",
              dropReason: "acl-deny",
            });
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, finalPacket: packet };
          }
        }

        // 5. Ausgangs-Interface prüfen
        if (!isInterfaceActive(outIface)) {
          hops.push({
            stepNumber: hops.length + 1,
            deviceId: currentDev.id,
            deviceName: currentDev.name,
            inInterface: currentInIf.name,
            outInterface: outIface.name,
            action: "drop",
            reason: `Ausgangs-Interface ${outIface.name} auf ${currentDev.name} ist down oder shutdown.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "interface-down",
          });
          return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${outIface.name} ist down`, arpResolvedThisRun, finalPacket: packet };
        }

        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          inInterface: currentInIf.name,
          outInterface: outIface.name,
          action: "route",
          reason: `Routing: Route via ${routeMatch.entry.protocol} zu ${routeMatch.entry.prefix} über ${outIface.name}${routeMatch.selectedVia.nextHop ? ` (Next-Hop: ${routeMatch.selectedVia.nextHop})` : ""}.`,
          packet: { ...packet },
          packetOut: { ...packet },
          status: "ok",
        });
      } else {
        // INSIDE → OUTSIDE oder STANDARD-ROUTING
        // 1. Eingangs-ACL
        if (currentInIf.inboundAcl) {
          const aclRes = evaluateAcl(
            currentInIf.inboundAcl,
            currentDev.config?.accessLists?.[currentInIf.inboundAcl],
            packet,
            "in",
          );
          if (aclRes.action === "deny") {
            hops.push({
              stepNumber: hops.length + 1,
              deviceId: currentDev.id,
              deviceName: currentDev.name,
              inInterface: currentInIf.name,
              action: "drop",
              reason: aclRes.reason,
              packet: { ...packet },
              status: "dropped",
              dropReason: "acl-deny",
            });
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, finalPacket: packet };
          }
        }

        // 2. Routing Lookup
        const table = computeStructuredRoutingTable(currentDev, topology);
        const routeMatch = lookupRouteLpm(table, packet.dstIp);
        if (!routeMatch) {
          hops.push({
            stepNumber: hops.length + 1,
            deviceId: currentDev.id,
            deviceName: currentDev.name,
            inInterface: currentInIf.name,
            action: "drop",
            reason: `Keine Route zu ${packet.dstIp} in der Routing-Tabelle von ${currentDev.name}.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "no-route",
          });
          return { hops, success: false, dropReason: "no-route", explanation: `Keine Route zu ${packet.dstIp} auf ${currentDev.name}`, arpResolvedThisRun, finalPacket: packet };
        }

        const egressIfaceName = routeMatch.selectedVia.ifaceName;
        const egressIface = currentDev.interfaces.find((i) => i.name === egressIfaceName || (egressIfaceName && normalizeInterfaceName(i.name) === normalizeInterfaceName(egressIfaceName)));
        if (!egressIface) {
          hops.push({
            stepNumber: hops.length + 1,
            deviceId: currentDev.id,
            deviceName: currentDev.name,
            inInterface: currentInIf.name,
            action: "drop",
            reason: `Ausgangs-Interface ${egressIfaceName} nicht gefunden.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "no-route",
          });
          return { hops, success: false, dropReason: "no-route", explanation: `Interface ${egressIfaceName} fehlt`, arpResolvedThisRun, finalPacket: packet };
        }
        outIface = egressIface;
        nextHopIp = routeMatch.selectedVia.nextHop ?? packet.dstIp;

        // 3. NAT Inside-to-Outside (local -> global)
        const isOutsideOut = natCfg?.outsideInterfaces?.includes(outIface.name) ?? false;
        if (isInsideIn && isOutsideOut && natCfg) {
          const staticMatch = natCfg.statics.find((s) => s.local === packet.srcIp);
          if (staticMatch) {
            const before = packet.srcIp;
            packet.srcIp = staticMatch.global;
            const natInfo = { direction: "inside-to-outside" as const, beforeIp: before, afterIp: packet.srcIp };
            hops.push({
              stepNumber: hops.length + 1,
              deviceId: currentDev.id,
              deviceName: currentDev.name,
              inInterface: currentInIf.name,
              outInterface: outIface.name,
              action: "nat-inside-to-outside",
              reason: `NAT Inside-to-Outside: Quell-IP ${before} → ${packet.srcIp} (statisch).`,
              packet: { ...packet, srcIp: before },
              packetOut: { ...packet },
              natTranslation: natInfo,
              status: "ok",
            });
          }
        }

        // 4. Ausgangs-ACL (sieht bei Inside->Outside bereits die übersetzte Quell-Adresse!)
        if (outIface.outboundAcl) {
          const aclRes = evaluateAcl(
            outIface.outboundAcl,
            currentDev.config?.accessLists?.[outIface.outboundAcl],
            packet,
            "out",
          );
          if (aclRes.action === "deny") {
            hops.push({
              stepNumber: hops.length + 1,
              deviceId: currentDev.id,
              deviceName: currentDev.name,
              inInterface: currentInIf.name,
              outInterface: outIface.name,
              action: "drop",
              reason: aclRes.reason,
              packet: { ...packet },
              status: "dropped",
              dropReason: "acl-deny",
            });
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, finalPacket: packet };
          }
        }

        // 5. Ausgangs-Interface prüfen
        if (!isInterfaceActive(outIface)) {
          hops.push({
            stepNumber: hops.length + 1,
            deviceId: currentDev.id,
            deviceName: currentDev.name,
            inInterface: currentInIf.name,
            outInterface: outIface.name,
            action: "drop",
            reason: `Ausgangs-Interface ${outIface.name} auf ${currentDev.name} ist down oder shutdown.`,
            packet: { ...packet },
            status: "dropped",
            dropReason: "interface-down",
          });
          return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${outIface.name} ist down`, arpResolvedThisRun, finalPacket: packet };
        }

        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          inInterface: currentInIf.name,
          outInterface: outIface.name,
          action: "route",
          reason: `Routing: Route via ${routeMatch.entry.protocol} zu ${routeMatch.entry.prefix} über ${outIface.name}${routeMatch.selectedVia.nextHop ? ` (Next-Hop: ${routeMatch.selectedVia.nextHop})` : ""}.`,
          packet: { ...packet },
          packetOut: { ...packet },
          status: "ok",
        });
      }
    }

    // Finde den nächsten physischen Link ausgehend von outIface
    const linkConn = findConnectedLinkForInterface(topology, currentDev.id, outIface.id);
    if (!linkConn) {
      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currentDev.id,
        deviceName: currentDev.name,
        outInterface: outIface.name,
        action: "drop",
        reason: `Keine Verbindung am Interface ${outIface.name} von ${currentDev.name}.`,
        packet: { ...packet },
        status: "dropped",
        dropReason: "interface-down",
      });
      return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${outIface.name} ist nicht verkabelt`, arpResolvedThisRun, finalPacket: packet };
    }

    if (!isLinkUsable(linkConn.link)) {
      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currentDev.id,
        deviceName: currentDev.name,
        outInterface: outIface.name,
        action: "drop",
        reason: `Verbindung an Interface ${outIface.name} von ${currentDev.name} ist getrennt oder down.`,
        packet: { ...packet },
        status: "dropped",
        dropReason: "interface-down",
      });
      return { hops, success: false, dropReason: "interface-down", explanation: `Verbindung an ${outIface.name} ist inaktiv`, arpResolvedThisRun, finalPacket: packet };
    }

    // ARP-Schritt für Next-Hop-IP prüfen
    arpCache[currentDev.id] ??= {};
    if (!arpCache[currentDev.id][nextHopIp]) {
      // Neuer ARP-Eintrag
      const resolvedMac = getSymbolicMac(linkConn.remoteDevice, linkConn.remoteIface);
      arpCache[currentDev.id][nextHopIp] = resolvedMac;
      arpResolvedThisRun = true;

      hops.push({
        stepNumber: hops.length + 1,
        deviceId: currentDev.id,
        deviceName: currentDev.name,
        outInterface: outIface.name,
        action: "arp-resolve",
        reason: `ARP-Auflösung für ${nextHopIp}: Broadcast ARP-Request → Antwort mit ${resolvedMac} (im ARP-Cache hinterlegt). Erstes ICMP-Echo geht während ARP-Auflösung verloren (Cisco IOS Verhalten: .!!!!).`,
        packet: { ...packet, dstMac: resolvedMac },
        packetOut: { ...packet, dstMac: resolvedMac },
        status: "ok",
      });
    }

    // Aktualisiere L2-MAC-Adressen im Paket
    packet.srcMac = getSymbolicMac(currentDev, outIface);
    packet.dstMac = arpCache[currentDev.id][nextHopIp] ?? getSymbolicMac(linkConn.remoteDevice, linkConn.remoteIface);

    // Wenn der nächste Hop ein L2-Switch ist, durchquere das L2-Segment
    if (isSwitch(linkConn.remoteDevice)) {
      const nextHopDev = findDeviceByIp(topology, nextHopIp)?.device ?? targetDevice;
      const l2Result = traverseL2Segment(
        topology,
        linkConn.remoteDevice,
        linkConn.remoteIface,
        nextHopDev,
        packet,
        hops,
        stpData,
      );
      if (l2Result.dropped) {
        return { hops, success: false, dropReason: l2Result.dropReason, explanation: l2Result.explanation, arpResolvedThisRun, finalPacket: packet };
      }
      currentDev = l2Result.currentDevice;
      currentInIf = l2Result.currentIface;
    } else {
      currentDev = linkConn.remoteDevice;
      currentInIf = linkConn.remoteIface;
    }
  }

  // Am Ziel angekommen
  if (currentDev.id === targetDevice.id) {
    hops.push({
      stepNumber: hops.length + 1,
      deviceId: targetDevice.id,
      deviceName: targetDevice.name,
      inInterface: currentInIf?.name ?? targetIface.name,
      action: "deliver",
      reason: isReturnPath
        ? `ICMP Echo Reply erfolgreich empfangen auf ${targetDevice.name}.`
        : `ICMP Echo Request erfolgreich zugestellt an Ziel ${targetDevice.name} (${packet.dstIp}).`,
      packet: { ...packet },
      packetOut: { ...packet },
      status: "ok",
    });
    return { hops, success: true, arpResolvedThisRun, finalPacket: packet };
  }

  return { hops, success: false, dropReason: "unreachable", explanation: "Ziel nicht erreicht (Max Hops überschritten).", arpResolvedThisRun, finalPacket: packet };
}

/**
 * Simuliert einen Ping (ICMP Echo + Echo Reply) im Canvas v2.
 * Berechnet Hin- und Rückweg Hop für Hop nach Cisco-Standard.
 */
export function simulatePing(options: SimulationOptions): SimulationResult {
  const { topology, sourceDeviceId, targetDeviceId, targetIp } = options;
  const arpCache = options.arpCache ?? {};

  const sourceDevice = topology.devices.find((d) => d.id === sourceDeviceId);
  if (!sourceDevice) {
    return {
      success: false,
      status: "no-route",
      iosSummary: ".....",
      explanation: "Quellgerät nicht gefunden.",
      forwardHops: [],
      returnHops: [],
      allHops: [],
      arpResolvedThisRun: false,
      arpCache,
    };
  }

  // Zielgerät und Ziel-IP ermitteln
  let targetDev: TopologyDevice | null = null;
  let targetIfc: TopologyInterface | null = null;
  let resolvedTargetIp = targetIp;

  if (targetDeviceId) {
    targetDev = topology.devices.find((d) => d.id === targetDeviceId) ?? null;
    if (targetDev) {
      targetIfc = getPrimaryInterface(targetDev) ?? null;
      if (targetIfc && !resolvedTargetIp) {
        resolvedTargetIp = cleanIp(targetIfc.ip);
      }
    }
  } else if (targetIp) {
    // HSRP prüfen
    const hsrpTarget = resolveHsrpTarget(topology, targetIp);
    if (hsrpTarget) {
      targetDev = hsrpTarget.activeDevice;
      targetIfc = hsrpTarget.activeIface;
    } else {
      const match = findDeviceByIp(topology, targetIp);
      if (match) {
        targetDev = match.device;
        targetIfc = match.iface;
      } else {
        const natTarget = resolveNatTarget(topology, targetIp);
        if (natTarget) {
          targetDev = natTarget.targetDevice;
          targetIfc = natTarget.targetIface;
        }
      }
    }
  }

  if (!targetDev || !targetIfc || !resolvedTargetIp) {
    return {
      success: false,
      status: "unreachable",
      iosSummary: "U.U.U",
      explanation: `Ziel ${targetIp ?? targetDeviceId} im Netzwerk nicht erreichbar oder hat keine IP-Adresse.`,
      forwardHops: [],
      returnHops: [],
      allHops: [],
      arpResolvedThisRun: false,
      arpCache,
    };
  }

  const sourceIface = options.sourceInterfaceId
    ? sourceDevice.interfaces.find((i) => i.id === options.sourceInterfaceId) ?? getPrimaryInterface(sourceDevice)
    : getPrimaryInterface(sourceDevice);

  if (!sourceIface || !sourceIface.ip) {
    return {
      success: false,
      status: "no-gateway",
      iosSummary: ".....",
      explanation: `Quellgerät ${sourceDevice.name} hat kein konfiguriertes Interface mit IP-Adresse.`,
      forwardHops: [],
      returnHops: [],
      allHops: [],
      arpResolvedThisRun: false,
      arpCache,
    };
  }

  const stpData = computeStp(topology);

  // Erstelle ICMP Echo Request Paket
  const echoRequest: SimulatedPacket = {
    id: `pkt-${Date.now()}-req`,
    type: "icmp-echo",
    srcIp: cleanIp(sourceIface.ip),
    dstIp: resolvedTargetIp,
    protocol: options.protocol ?? "icmp",
    icmpType: "echo",
    dstPort: options.port,
    ttl: options.ttl ?? 128,
    srcMac: getSymbolicMac(sourceDevice, sourceIface),
    dstMac: "FFFF.FFFF.FFFF",
  };

  // Trace Hinweg (Forward Path)
  const forwardTrace = tracePath(
    topology,
    sourceDevice,
    sourceIface,
    targetDev,
    targetIfc,
    echoRequest,
    arpCache,
    stpData,
    false,
  );

  if (!forwardTrace.success) {
    return {
      success: false,
      status: forwardTrace.dropReason === "no-route" ? "no-route" : "timeout",
      iosSummary: forwardTrace.dropReason === "no-route" ? "U.U.U" : ".....",
      explanation: forwardTrace.explanation ?? "Paket auf dem Hinweg verworfen.",
      forwardHops: forwardTrace.hops,
      returnHops: [],
      allHops: forwardTrace.hops,
      arpResolvedThisRun: forwardTrace.arpResolvedThisRun,
      arpCache,
    };
  }

  // Erstelle ICMP Echo Reply Paket
  const echoReply: SimulatedPacket = {
    id: `pkt-${Date.now()}-rep`,
    type: "icmp-echo-reply",
    srcIp: forwardTrace.finalPacket.dstIp,
    dstIp: forwardTrace.finalPacket.srcIp,
    protocol: options.protocol ?? "icmp",
    icmpType: "echo-reply",
    ttl: 128,
    srcMac: getSymbolicMac(targetDev, targetIfc),
    dstMac: "FFFF.FFFF.FFFF",
  };

  // Trace Rückweg (Return Path)
  const returnTrace = tracePath(
    topology,
    targetDev,
    targetIfc,
    sourceDevice,
    sourceIface,
    echoReply,
    arpCache,
    stpData,
    true,
  );

  const allHops = [...forwardTrace.hops, ...returnTrace.hops];
  const anyArpResolved = forwardTrace.arpResolvedThisRun || returnTrace.arpResolvedThisRun;

  if (!returnTrace.success) {
    return {
      success: false,
      status: "timeout",
      iosSummary: ".....",
      explanation: returnTrace.explanation ?? "Antwortpaket auf dem Rückweg verworfen.",
      forwardHops: forwardTrace.hops,
      returnHops: returnTrace.hops,
      allHops,
      arpResolvedThisRun: anyArpResolved,
      arpCache,
    };
  }

  // Beide Richtungen erfolgreich!
  return {
    success: true,
    status: "success",
    iosSummary: anyArpResolved ? ".!!!!" : "!!!!!",
    explanation: anyArpResolved
      ? `Erfolgreich (Erfolgsrate 80%, 4/5): Erstes Echo-Paket ging während der ARP-Auflösung verloren (.!!!!).`
      : `Erfolgreich (Erfolgsrate 100%, 5/5): Alle ICMP Echo Replies empfangen (!!!!!).`,
    forwardHops: forwardTrace.hops,
    returnHops: returnTrace.hops,
    allHops,
    arpResolvedThisRun: anyArpResolved,
    arpCache,
  };
}

/**
 * Setzt den ARP-Cache der Simulation zurück.
 */
export function clearArpCache(): Record<string, Record<string, string>> {
  return {};
}

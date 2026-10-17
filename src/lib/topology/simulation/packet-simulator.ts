import type {
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
} from "@/types/topology";
import { computeStructuredRoutingTable, lookupRouteLpm, getNetworkAddress } from "../routing-table";
import { computePortChannels, computeStp, isSwitch, type PortChannelBundle, type StpBridgeInfo } from "../stp-calc";
import { computeHsrp, hasHsrpConfig } from "../hsrp";
import { computeTunnelState, isTunnelInterface } from "../gre-tunnel";
import { hasNatConfig } from "../nat-outputs";
import { evaluateAcl } from "./acl-evaluator";
import type {
  SimulatedPacket,
  HopStep,
  SimulationResult,
  SimulationOptions,
  DropReasonCode,
} from "./types";
import { normalizeInterfaceName } from "../hardware-profiles";
import { evaluateTrunk } from "../vtp-status";
import {
  isLinkUsable,
  isInterfaceActive,
  findLinkEnd,
  portCarriesVlan,
  untaggedVlan,
} from "../ospf-neighbors";

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

/**
 * Ausgangsinterface eines Routers zum Ziel laut Routing-Tabelle (LPM); IOS nimmt dessen Adresse als Quelle.
 * Ohne Route oder ohne IP am Ausgangsinterface: undefined.
 */
export function egressInterfaceFor(device: TopologyDevice, topology: NetworkTopology, dstIp: string): TopologyInterface | undefined {
  const match = lookupRouteLpm(computeStructuredRoutingTable(device, topology), dstIp);
  const name = match?.selectedVia.ifaceName;
  if (!name) return undefined;
  const iface = device.interfaces.find((i) => i.name === name || normalizeInterfaceName(i.name) === normalizeInterfaceName(name));
  return iface?.ip ? iface : undefined;
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
 * Gerät, das im L2-Segment auf eine IP antwortet (ARP): eigene Interface-/SVI-Adresse,
 * aktive HSRP-VIP oder eine Static-NAT-Adresse (Inside Global), die der NAT-Router auf der Outside-Seite beantwortet.
 */
export function findL2OwnerOf(topology: NetworkTopology, ip: string): TopologyDevice | undefined {
  const own = findDeviceByIp(topology, ip);
  if (own) return own.device;
  const hsrp = resolveHsrpTarget(topology, ip);
  if (hsrp) return hsrp.activeDevice;
  return topology.devices.find((d) => d.config?.nat?.statics?.some((st) => st.global === ip));
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
 * Subinterfaces (z. B. Gi0/0.10) hängen am Link ihres physischen Interfaces (Gi0/0).
 * Nutzt die zentrale Funktion findLinkEnd() aus ospf-neighbors.ts.
 */
export function findConnectedLinkForInterface(
  topology: NetworkTopology,
  deviceId: string,
  ifaceIdOrName: string,
): { link: TopologyLink; remoteDevice: TopologyDevice; remoteIface: TopologyInterface } | null {
  const device = topology.devices.find((d) => d.id === deviceId);
  const norm = normalizeInterfaceName(ifaceIdOrName);
  const iface = device?.interfaces.find(
    (i) => i.id === ifaceIdOrName || i.name === ifaceIdOrName || normalizeInterfaceName(i.name) === norm,
  );
  const name = iface?.name ?? ifaceIdOrName;
  const isSub = name.includes(".");
  const physicalName = isSub ? name.slice(0, name.indexOf(".")) : name;
  // Subinterface: das physische Interface trägt den Link. Ports ohne eindeutigen Namen (z. B. „–“) nur über die ID zuordnen.
  const physical = isSub
    ? device?.interfaces.find((i) => normalizeInterfaceName(i.name) === normalizeInterfaceName(physicalName))
    : iface;

  for (const link of topology.links) {
    const end = findLinkEnd(topology, link, deviceId);
    if (!end) continue;
    const matches = physical
      ? end.local.id === physical.id
      : normalizeInterfaceName(end.local.name) === normalizeInterfaceName(physicalName);
    if (matches) return { link, remoteDevice: end.remoteDevice, remoteIface: end.remote };
  }
  return null;
}

/** VLAN-Tag eines Frames, das über ein Router-Interface gesendet wird (Subinterface mit dot1Q), sonst ungetaggt. */
export function egressFrameVlan(iface: TopologyInterface): number | null {
  return iface.name.includes(".") && iface.vlan !== undefined ? iface.vlan : null;
}

/** Eingangs-Interface eines L3-Geräts für ein Frame: bei Tag das passende Subinterface, sonst das physische Interface. */
function l3IngressInterface(device: TopologyDevice, physical: TopologyInterface, frameVlan: number | null): TopologyInterface {
  if (frameVlan === null) return physical;
  const sub = device.interfaces.find(
    (i) =>
      i.name.includes(".") &&
      normalizeInterfaceName(i.name.slice(0, i.name.indexOf("."))) === normalizeInterfaceName(physical.name) &&
      i.vlan === frameVlan,
  );
  return sub ?? physical;
}

function stpStateOf(stpData: Map<string, StpBridgeInfo>, device: TopologyDevice, iface: TopologyInterface): "FWD" | "BLK" | undefined {
  return stpData.get(device.id)?.ports?.find((p) => p.iface.id === iface.id || p.iface.name === iface.name)?.state;
}

/**
 * Betriebsmodus eines Switch-Ports: statisch konfiguriert (trunk/access) oder per DTP ausgehandelt
 * (evaluateTrunk aus vtp-status.ts; nur zwischen Switches, Router sprechen kein DTP).
 */
function operationalPort(topology: NetworkTopology, device: TopologyDevice, iface: TopologyInterface): TopologyInterface {
  if (iface.mode === "trunk" || iface.mode === "access" || iface.mode === "routed") return iface;
  const conn = findConnectedLinkForInterface(topology, device.id, iface.id);
  const trunk = !!conn && isSwitch(conn.remoteDevice) && evaluateTrunk(iface, conn.remoteIface).trunk;
  return { ...iface, mode: trunk ? "trunk" : "access" };
}

/** VLAN eines Frames im Switch: Access-Port bestimmt das VLAN, ein Trunk übernimmt das Tag (ungetaggt = natives VLAN). */
function ingressVlan(inIface: TopologyInterface, frameVlan: number | null): number {
  return inIface.mode === "trunk" ? (frameVlan ?? inIface.nativeVlan ?? 1) : (untaggedVlan(inIface) ?? 1);
}

interface L2Step {
  device: TopologyDevice;
  /** Eingangs-Port wie in show-Ausgaben (bei Port-Channel-Membern das logische PoN) */
  inIface: TopologyInterface;
  /** Ausgangs-Port wie in show-Ausgaben (bei Port-Channel-Membern das logische PoN) */
  outIface: TopologyInterface;
  vlan: number;
  /** Member des Port-Channels, über den das Frame tatsächlich läuft */
  viaMember?: TopologyInterface;
  linkId: string;
}

/** Member-Interface-ID → Port-Channel (aus computePortChannels in stp-calc.ts). */
function portChannelMemberMap(topology: NetworkTopology): Map<string, PortChannelBundle> {
  const map = new Map<string, PortChannelBundle>();
  for (const list of computePortChannels(topology).values()) {
    for (const b of list) for (const m of b.members) map.set(m.id, b);
  }
  return map;
}

/**
 * Sucht im L2-Segment einen Weg vom Eingangs-Port des ersten Switches zum Zielgerät (Breitensuche).
 * Berücksichtigt VLAN-Zugehörigkeit (Access-VLAN, Trunk mit Tag/nativem VLAN, Allowed-VLANs),
 * Link-Status und STP-Portzustände auf beiden Seiten eines Links.
 */
function findL2Path(
  topology: NetworkTopology,
  startDevice: TopologyDevice,
  startIface: TopologyInterface,
  frameVlan: number | null,
  targetDevice: TopologyDevice,
  stpData: Map<string, StpBridgeInfo>,
  respectStp: boolean,
): { steps: L2Step[]; arrivalIface: TopologyInterface; arrivalVlan: number | null } | null {
  interface Node {
    device: TopologyDevice;
    inIface: TopologyInterface;
    frameVlan: number | null;
    path: L2Step[];
  }
  const queue: Node[] = [{ device: startDevice, inIface: startIface, frameVlan, path: [] }];
  const visited = new Set<string>();
  // Port-Channel: STP-Zustand und Anzeige gelten für das logische PoN, nicht für einzelne Member
  const bundleOf = portChannelMemberMap(topology);
  const logical = (iface: TopologyInterface) => bundleOf.get(iface.id)?.iface ?? iface;

  while (queue.length > 0) {
    const node = queue.shift()!;
    const device = node.device;
    const inIface = operationalPort(topology, device, node.inIface);
    if (respectStp && stpStateOf(stpData, device, logical(inIface)) === "BLK") continue;

    const vlan = ingressVlan(inIface, node.frameVlan);
    const key = `${device.id}|${vlan}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const usedBundles = new Set<string>();
    for (const rawOut of device.interfaces) {
      if (rawOut.id === inIface.id) continue;
      const bundle = bundleOf.get(rawOut.id);
      // Frames verlassen ein Bündel nicht über das Bündel, über das sie gekommen sind
      if (bundle && (usedBundles.has(bundle.iface.id) || bundleOf.get(inIface.id)?.iface.id === bundle.iface.id)) continue;
      const out = operationalPort(topology, device, rawOut);
      if (!portCarriesVlan(out, vlan)) continue;
      const conn = findConnectedLinkForInterface(topology, device.id, out.id);
      if (!conn) continue;
      if (!isLinkUsable(conn.link) || !isInterfaceActive(out)) continue;
      if (
        respectStp &&
        (stpStateOf(stpData, device, logical(out)) === "BLK" ||
          stpStateOf(stpData, conn.remoteDevice, logical(conn.remoteIface)) === "BLK")
      ) {
        continue;
      }
      if (bundle) usedBundles.add(bundle.iface.id);

      const outTagged = out.mode === "trunk" && vlan !== (out.nativeVlan ?? 1);
      const nextFrameVlan = outTagged ? vlan : null;
      const step: L2Step = {
        device,
        inIface: logical(inIface),
        outIface: logical(out),
        vlan,
        linkId: conn.link.id,
        ...(bundle ? { viaMember: rawOut } : {}),
      };
      if (conn.remoteDevice.id === targetDevice.id) {
        return { steps: [...node.path, step], arrivalIface: conn.remoteIface, arrivalVlan: nextFrameVlan };
      }
      if (isSwitch(conn.remoteDevice)) {
        queue.push({ device: conn.remoteDevice, inIface: conn.remoteIface, frameVlan: nextFrameVlan, path: [...node.path, step] });
      }
    }
  }
  return null;
}

/**
 * L2-Switching: durchquert das Switch-Segment vom Eingangs-Port bis zum Zielgerät.
 * Nutzt computeStp(), untaggedVlan() und portCarriesVlan() aus den gemeinsamen Modulen.
 */
function traverseL2Segment(
  topology: NetworkTopology,
  startDevice: TopologyDevice,
  startIface: TopologyInterface,
  targetDevice: TopologyDevice,
  packet: SimulatedPacket,
  hops: HopStep[],
  stpData: Map<string, StpBridgeInfo>,
  frameVlan: number | null = null,
): { currentDevice: TopologyDevice; currentIface: TopologyInterface; dropped?: boolean; dropReason?: DropReasonCode; explanation?: string } {
  if (startDevice.id === targetDevice.id) {
    return { currentDevice: startDevice, currentIface: l3IngressInterface(startDevice, startIface, frameVlan) };
  }

  const found = findL2Path(topology, startDevice, startIface, frameVlan, targetDevice, stpData, true);
  if (!found) {
    // Ursache: gäbe es ohne STP einen Weg, blockiert STP; sonst passt das VLAN nicht
    const withoutStp = findL2Path(topology, startDevice, startIface, frameVlan, targetDevice, stpData, false);
    const vlan = ingressVlan(operationalPort(topology, startDevice, startIface), frameVlan);
    const dropReason: DropReasonCode = withoutStp ? "stp-blocked" : "vlan-mismatch";
    const reason = withoutStp
      ? `Switch ${startDevice.name}: Jeder Weg zu ${targetDevice.name} in VLAN ${vlan} führt über einen durch STP blockierten Port.`
      : `Switch ${startDevice.name}: Kein Weg im VLAN ${vlan} in Richtung ${targetDevice.name} (Access-VLAN, Trunk oder Allowed-VLANs passen nicht).`;
    hops.push({
      stepNumber: hops.length + 1,
      deviceId: startDevice.id,
      deviceName: startDevice.name,
      inInterface: startIface.name,
      action: "drop",
      reason,
      packet: { ...packet },
      status: "dropped",
      dropReason,
    });
    return {
      currentDevice: startDevice,
      currentIface: startIface,
      dropped: true,
      dropReason,
      explanation: withoutStp ? `STP-Blocking auf dem Weg zu ${targetDevice.name}` : `VLAN ${vlan} Mismatch auf ${startDevice.name}`,
    };
  }

  for (const s of found.steps) {
    const tagged = s.outIface.mode === "trunk" && s.vlan !== (s.outIface.nativeVlan ?? 1);
    const trunkNote = s.outIface.mode === "trunk" ? (tagged ? ` (Trunk, 802.1Q-Tag ${s.vlan})` : " (Trunk, natives VLAN ungetaggt)") : "";
    const bundleNote = s.viaMember ? ` Port-Channel ${s.outIface.name} ist ein logischer Link; das Frame läuft über den Member ${s.viaMember.name}.` : "";
    hops.push({
      stepNumber: hops.length + 1,
      deviceId: s.device.id,
      deviceName: s.device.name,
      inInterface: s.inIface.name,
      outInterface: s.outIface.name,
      linkId: s.linkId,
      action: "switch",
      reason: `Switch ${s.device.name}: Frame von ${s.inIface.name} (VLAN ${s.vlan}) an ${s.outIface.name} weitergeleitet${trunkNote}.${bundleNote}`,
      packet: { ...packet },
      packetOut: { ...packet },
      status: "ok",
    });
  }
  return { currentDevice: targetDevice, currentIface: l3IngressInterface(targetDevice, found.arrivalIface, found.arrivalVlan) };
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
): {
  hops: HopStep[];
  success: boolean;
  dropReason?: DropReasonCode;
  explanation?: string;
  arpResolvedThisRun: boolean;
  routerArpLoss: boolean;
  finalPacket: SimulatedPacket;
} {
  const hops: HopStep[] = [];
  let currentDev = sourceDevice;
  let currentInIf: TopologyInterface | undefined = undefined;
  const packet: SimulatedPacket = { ...initialPacket };
  let arpResolvedThisRun = false;
  let routerArpLoss = false;
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
          return { hops, success: false, dropReason: "no-gateway", explanation: `Kein Default Gateway auf ${sourceDevice.name}`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "wrong-subnet", explanation: `Gateway ${gw} liegt in anderem Subnetz`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
      // Vom Router selbst erzeugte Pakete: keine TTL-Verringerung, keine Eingangs-ACL, keine NAT-Inside-Prüfung
      const originatedHere = currentDev.id === sourceDevice.id && !isHost && currentInIf === undefined;
      if (!currentInIf) {
        currentInIf = currentDev.interfaces[0];
      }

      // TTL prüfen
      if (!originatedHere) packet.ttl--;
      if (!originatedHere && packet.ttl <= 0) {
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
        return { hops, success: false, dropReason: "ttl-expired", explanation: `TTL abgelaufen auf ${currentDev.name}`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
      }

      // Interface-Status prüfen
      if (!originatedHere && !isInterfaceActive(currentInIf)) {
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
        return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${currentInIf.name} ist down`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
      }

      // NAT-Richtung bestimmen
      const natCfg = hasNatConfig(currentDev) ? currentDev.config?.nat : undefined;
      const isInsideIn = !originatedHere && (natCfg?.insideInterfaces?.includes(currentInIf.name) ?? false);
      const isOutsideIn = !originatedHere && (natCfg?.outsideInterfaces?.includes(currentInIf.name) ?? false);

      // ─── NAT ORDER OF OPERATION ───────────────────────────────────────────
      if (isOutsideIn) {
        // Richtungsfluss: OUTSIDE → INSIDE
        // 1. Eingangs-ACL (sieht unübersetzte Adresse)
        if (!originatedHere && currentInIf.inboundAcl) {
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
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "no-route", explanation: `Keine Route zu ${packet.dstIp} auf ${currentDev.name}`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "no-route", explanation: `Interface ${egressIfaceName} fehlt`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
        }
        outIface = egressIface;
        nextHopIp = routeMatch.selectedVia.nextHop ?? packet.dstIp;

        // 4. Ausgangs-ACL (sieht übersetzte Adresse)
        if (!originatedHere && outIface.outboundAcl) {
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
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${outIface.name} ist down`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
        if (!originatedHere && currentInIf.inboundAcl) {
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
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "no-route", explanation: `Keine Route zu ${packet.dstIp} auf ${currentDev.name}`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "no-route", explanation: `Interface ${egressIfaceName} fehlt`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
        if (!originatedHere && outIface.outboundAcl) {
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
            return { hops, success: false, dropReason: "acl-deny", explanation: aclRes.reason, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
          return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${outIface.name} ist down`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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

    // 6. GRE-Tunnel-Weiterleitung falls outIface ein Tunnel-Interface ist
    if (isTunnelInterface(outIface)) {
      const tState = computeTunnelState(currentDev, outIface, topology);
      if (tState.lineProtocol !== "up") {
        const reasonMsg = tState.notes[0] ?? `Tunnel ${outIface.name} auf ${currentDev.name} ist nicht betriebsbereit (line protocol is ${tState.lineProtocol}).`;
        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          inInterface: currentInIf?.name,
          outInterface: outIface.name,
          action: "drop",
          reason: reasonMsg,
          packet: { ...packet },
          status: "dropped",
          dropReason: "interface-down",
        });
        return { hops, success: false, dropReason: "interface-down", explanation: reasonMsg, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
      }

      const destIp = outIface.tunnel?.destination;
      const remoteTarget = destIp ? findDeviceByIp(topology, destIp) : null;
      if (remoteTarget) {
        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          inInterface: currentInIf?.name,
          outInterface: outIface.name,
          action: "route",
          reason: `GRE-Tunnel: Paket wird über ${outIface.name} nach ${destIp} (${remoteTarget.device.name}) gekapselt und transportiert.`,
          packet: { ...packet },
          packetOut: { ...packet },
          status: "ok",
        });

        currentDev = remoteTarget.device;
        const remoteTunIface = currentDev.interfaces.find(
          (i) => isTunnelInterface(i) && (i.tunnel?.destination === tState.sourceIp || !i.tunnel?.destination)
        ) ?? remoteTarget.iface;
        currentInIf = remoteTunIface;
        continue;
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
      return { hops, success: false, dropReason: "interface-down", explanation: `Interface ${outIface.name} ist nicht verkabelt`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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
      return { hops, success: false, dropReason: "interface-down", explanation: `Verbindung an ${outIface.name} ist inaktiv`, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
    }

    // Hops dieses Geräts, die über diesen Link hinausgehen, erhalten die Link-ID (Pfad-Hervorhebung)
    for (let k = hops.length - 1; k >= 0 && hops[k].deviceId === currentDev.id; k--) {
      if (hops[k].outInterface && !hops[k].linkId) hops[k].linkId = linkConn.link.id;
    }

    // ARP-Schritt für Next-Hop-IP prüfen
    arpCache[currentDev.id] ??= {};
    if (!arpCache[currentDev.id][nextHopIp]) {
      const isRouter = currentDev.type === "router" || (currentDev.type === "switch-l3" && currentDev.config?.ipRoutingEnabled !== false);
      const resolvedMac = getSymbolicMac(linkConn.remoteDevice, linkConn.remoteIface);
      arpCache[currentDev.id][nextHopIp] = resolvedMac;
      arpResolvedThisRun = true;

      if (isRouter) {
        routerArpLoss = true;
        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          outInterface: outIface.name,
          linkId: linkConn.link.id,
          action: "arp-resolve",
          reason: `ARP-Auflösung auf Router ${currentDev.name} für ${nextHopIp}: Broadcast ARP-Request → Antwort mit ${resolvedMac} (im ARP-Cache hinterlegt). Erstes ICMP-Echo geht während der IOS-ARP-Auflösung verloren (Cisco-Verhalten: .!!!!).`,
          packet: { ...packet, dstMac: resolvedMac },
          packetOut: { ...packet, dstMac: resolvedMac },
          status: "ok",
        });
      } else {
        hops.push({
          stepNumber: hops.length + 1,
          deviceId: currentDev.id,
          deviceName: currentDev.name,
          outInterface: outIface.name,
          linkId: linkConn.link.id,
          action: "arp-resolve",
          reason: `ARP-Auflösung auf Host ${currentDev.name} für ${nextHopIp}: Broadcast ARP-Request → Antwort mit ${resolvedMac}. Host puffert das Paket während der ARP-Auflösung (kein Paketverlust).`,
          packet: { ...packet, dstMac: resolvedMac },
          packetOut: { ...packet, dstMac: resolvedMac },
          status: "ok",
        });
      }
    }

    // Aktualisiere L2-MAC-Adressen im Paket
    packet.srcMac = getSymbolicMac(currentDev, outIface);
    packet.dstMac = arpCache[currentDev.id][nextHopIp] ?? getSymbolicMac(linkConn.remoteDevice, linkConn.remoteIface);

    // Wenn der nächste Hop ein L2-Switch ist, durchquere das L2-Segment
    if (isSwitch(linkConn.remoteDevice)) {
      const nextHopDev = findL2OwnerOf(topology, nextHopIp) ?? targetDevice;
      const l2Result = traverseL2Segment(
        topology,
        linkConn.remoteDevice,
        linkConn.remoteIface,
        nextHopDev,
        packet,
        hops,
        stpData,
        egressFrameVlan(outIface),
      );
      if (l2Result.dropped) {
        return { hops, success: false, dropReason: l2Result.dropReason, explanation: l2Result.explanation, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
      }
      currentDev = l2Result.currentDevice;
      currentInIf = l2Result.currentIface;
    } else {
      currentDev = linkConn.remoteDevice;
      currentInIf = l3IngressInterface(linkConn.remoteDevice, linkConn.remoteIface, egressFrameVlan(outIface));
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
    return { hops, success: true, arpResolvedThisRun, routerArpLoss, finalPacket: packet };
  }

  return { hops, success: false, dropReason: "unreachable", explanation: "Ziel nicht erreicht (Max Hops überschritten).", arpResolvedThisRun, routerArpLoss, finalPacket: packet };
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

  // Quell-Interface: explizit (Interface oder `source <ip>`), bei Routern das Ausgangsinterface zum Ziel (IOS-Verhalten)
  let sourceIface: TopologyInterface | undefined;
  if (options.sourceInterfaceId) {
    sourceIface = sourceDevice.interfaces.find((i) => i.id === options.sourceInterfaceId) ?? getPrimaryInterface(sourceDevice);
  } else if (options.sourceIp) {
    sourceIface = sourceDevice.interfaces.find((i) => cleanIp(i.ip) === options.sourceIp && isInterfaceActive(i));
    if (!sourceIface) {
      return {
        success: false,
        status: "invalid-source",
        iosSummary: "% Invalid source address",
        explanation: `% Invalid source address- IP address not on any of our up interfaces: ${options.sourceIp} gehört zu keinem aktiven Interface von ${sourceDevice.name}.`,
        forwardHops: [],
        returnHops: [],
        allHops: [],
        arpResolvedThisRun: false,
        arpCache,
      };
    }
  } else if (sourceDevice.type === "router" || sourceDevice.type === "switch-l3") {
    sourceIface = egressInterfaceFor(sourceDevice, topology, resolvedTargetIp) ?? getPrimaryInterface(sourceDevice);
  } else {
    sourceIface = getPrimaryInterface(sourceDevice);
  }

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
      routerArpLoss: forwardTrace.routerArpLoss,
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
  const anyRouterArpLoss = forwardTrace.routerArpLoss || returnTrace.routerArpLoss;

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
      routerArpLoss: anyRouterArpLoss,
      arpCache,
    };
  }

  // Beide Richtungen erfolgreich!
  return {
    success: true,
    status: "success",
    iosSummary: anyRouterArpLoss ? ".!!!!" : "!!!!!",
    explanation: anyRouterArpLoss
      ? `Erfolgreich (Erfolgsrate 80%, 4/5): Erstes Echo-Paket ging während der ARP-Auflösung auf einem Cisco-Router verloren (.!!!!).`
      : anyArpResolved
      ? `Erfolgreich (Erfolgsrate 100%, 5/5): Host puffert Pakete während eigener ARP-Auflösung; alle ICMP Echo Replies empfangen (!!!!!).`
      : `Erfolgreich (Erfolgsrate 100%, 5/5): Alle ICMP Echo Replies empfangen (!!!!!).`,
    forwardHops: forwardTrace.hops,
    returnHops: returnTrace.hops,
    allHops,
    arpResolvedThisRun: anyArpResolved,
    routerArpLoss: anyRouterArpLoss,
    arpCache,
  };
}

/**
 * Setzt den ARP-Cache der Simulation zurück.
 */
export function clearArpCache(): Record<string, Record<string, string>> {
  return {};
}

import type {
  NetworkTopology,
  OspfNetworkType,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
} from "@/types/topology";
import { ipToNumber, isValidIpv4, parseIpCidr } from "./topology-validation";

export type OspfNeighborRole = "DR" | "BDR" | "DROTHER" | "-";

export interface OspfInterfaceState {
  area: number;
  networkType: OspfNetworkType;
  passive: boolean;
  priority: number;
}

export interface OspfAdjacency {
  link: TopologyLink;
  localInterface: TopologyInterface;
  neighbor: TopologyDevice;
  neighborInterface: TopologyInterface;
  neighborRouterId: string;
  neighborAddress: string;
  neighborPriority: number;
  networkType: OspfNetworkType;
  /** Rolle des Nachbarn auf dem Segment ("-" bei point-to-point) */
  neighborRole: OspfNeighborRole;
  /** FULL, oder 2WAY wenn beide DROTHER sind */
  state: "FULL" | "2WAY";
}

const DEFAULT_PRIORITY = 1;

function isL3Capable(device: TopologyDevice): boolean {
  if (device.type === "router") return true;
  return device.type === "switch-l3" && device.config?.ipRoutingEnabled !== false;
}

function ospfProtocolEntry(device: TopologyDevice): string | undefined {
  return device.config?.routingProtocols?.find((p) => /^ospf(?!v3)/i.test(p));
}

export function deviceRunsOspf(device: TopologyDevice): boolean {
  if (!isL3Capable(device)) return false;
  return ospfProtocolEntry(device) !== undefined || device.config?.ospf !== undefined;
}

function isInterfaceActive(iface: TopologyInterface): boolean {
  return iface.status === "up" && !iface.isShutdown;
}

/**
 * Router-ID nach IOS-Regel: manuell konfiguriert > höchste Loopback-IP >
 * höchste IP eines aktiven (up) Interfaces. Ohne IP-Adresse: null.
 */
export function getOspfRouterId(device: TopologyDevice): string | null {
  const manual = device.config?.ospf?.routerId?.trim();
  if (manual && isValidIpv4(manual)) return manual;

  const highest = (ifaces: TopologyInterface[]): string | null => {
    let best: string | null = null;
    for (const iface of ifaces) {
      const ip = iface.ip?.split("/")[0];
      if (!ip || !isValidIpv4(ip)) continue;
      if (best === null || ipToNumber(ip) > ipToNumber(best)) best = ip;
    }
    return best;
  };

  const loopbacks = device.interfaces.filter(
    (i) => /^lo(opback)?\d+/i.test(i.name) && !i.isShutdown && i.status !== "admin-down"
  );
  return highest(loopbacks) ?? highest(device.interfaces.filter(isInterfaceActive));
}

/**
 * Effektive OSPF-Parameter eines Interfaces, oder null wenn das Interface
 * nicht an OSPF teilnimmt (kein OSPF auf dem Gerät, keine IP, explizit deaktiviert).
 */
export function resolveInterfaceOspf(
  device: TopologyDevice,
  iface: TopologyInterface
): OspfInterfaceState | null {
  if (!deviceRunsOspf(device)) return null;
  if (!iface.ip || !parseIpCidr(iface.ip)) return null;
  if (iface.ospf?.enabled === false) return null;

  const areaFromProtocol = /area\s+(\d+)/i.exec(ospfProtocolEntry(device) ?? "")?.[1];
  const legacyP2p = /point-to-point/i.test(iface.description ?? "");

  return {
    area: iface.ospf?.area ?? (areaFromProtocol !== undefined ? Number(areaFromProtocol) : 0),
    networkType: iface.ospf?.networkType ?? (legacyP2p ? "point-to-point" : "broadcast"),
    passive: iface.ospf?.passive ?? false,
    priority: iface.ospf?.priority ?? DEFAULT_PRIORITY,
  };
}

function isLinkUsable(link: TopologyLink): boolean {
  return link.status === "up" || link.status === "stp-forwarding";
}

function sameSubnet(ipA: string, ipB: string): boolean {
  const a = parseIpCidr(ipA);
  const b = parseIpCidr(ipB);
  return !!a && !!b && a.prefix === b.prefix && a.networkIp === b.networkIp && a.ip !== b.ip;
}

/** Ein Router-Interface am gemeinsamen Broadcast-Segment. */
interface SegmentPeer {
  device: TopologyDevice;
  iface: TopologyInterface;
}

interface LinkEnd {
  local: TopologyInterface;
  remote: TopologyInterface;
  remoteDevice: TopologyDevice;
}

function findLinkEnd(topology: NetworkTopology, link: TopologyLink, deviceId: string): LinkEnd | null {
  const sourceSide = link.sourceDeviceId === deviceId;
  if (!sourceSide && link.targetDeviceId !== deviceId) return null;
  const remoteDevice = topology.devices.find((d) => d.id === (sourceSide ? link.targetDeviceId : link.sourceDeviceId));
  const localDevice = topology.devices.find((d) => d.id === deviceId);
  if (!remoteDevice || !localDevice) return null;
  const local = localDevice.interfaces.find((i) => i.id === (sourceSide ? link.sourceInterfaceId : link.targetInterfaceId));
  const remote = remoteDevice.interfaces.find((i) => i.id === (sourceSide ? link.targetInterfaceId : link.sourceInterfaceId));
  return local && remote ? { local, remote, remoteDevice } : null;
}

/** VLAN der ungetaggten Frames an einem Switch-Port; null, wenn nicht bestimmbar (z. B. routed). */
function untaggedVlan(iface: TopologyInterface): number | null {
  if (iface.mode === "trunk") return iface.nativeVlan ?? 1;
  if (iface.mode === "routed") return null;
  return iface.vlan ?? 1; // access oder unkonfiguriert (IOS-Default: VLAN 1)
}

/** Transportiert der Port das VLAN? */
function portCarriesVlan(iface: TopologyInterface, vlan: number): boolean {
  if (iface.mode === "routed") return false;
  if (iface.mode === "trunk") return iface.allowedVlans === undefined || iface.allowedVlans.includes(vlan) || (iface.nativeVlan ?? 1) === vlan;
  return (iface.vlan ?? 1) === vlan;
}

function isBlockedByStp(link: TopologyLink, ...ifaces: TopologyInterface[]): boolean {
  return link.status === "stp-blocking" || ifaces.some((i) => i.portRole === "BLK" || i.portRole === "ALT");
}

/**
 * Router, die über L2-Switches (Access-Ports/Trunks, Links up, keine STP-geblockten Pfade) im selben VLAN
 * mit dem Router-Interface verbunden sind. `null` = nicht bestimmbar (z. B. L3-Switch oder routed Port im Pfad).
 * Direkt verbundene Router bilden ein Segment aus genau diesen beiden.
 */
function collectSegmentPeers(
  topology: NetworkTopology,
  device: TopologyDevice,
  local: TopologyInterface,
  first: LinkEnd,
  firstLink: TopologyLink
): SegmentPeer[] | null {
  const peers: SegmentPeer[] = [];
  const { remoteDevice, remote } = first;
  if (remoteDevice.type !== "switch-l2") {
    return isL3Capable(remoteDevice) ? [{ device: remoteDevice, iface: remote }] : [];
  }
  const vlan = untaggedVlan(remote);
  if (vlan === null) return null;
  if (!isInterfaceActive(remote) || isBlockedByStp(firstLink, remote, local)) return [];

  const visitedSwitches = new Set<string>([remoteDevice.id]);
  const queue: Array<{ sw: TopologyDevice; inPort: TopologyInterface }> = [{ sw: remoteDevice, inPort: remote }];
  let undeterminable = false;
  while (queue.length > 0) {
    const { sw, inPort } = queue.shift()!;
    for (const link of topology.links) {
      const end = findLinkEnd(topology, link, sw.id);
      if (!end || end.local.id === inPort.id) continue;
      if (end.remoteDevice.id === device.id && end.remote.id === local.id) continue;
      if (!isLinkUsable(link) || !isInterfaceActive(end.local) || !isInterfaceActive(end.remote)) continue;
      if (isBlockedByStp(link, end.local, end.remote)) continue;
      if (!portCarriesVlan(end.local, vlan)) continue;

      if (end.remoteDevice.type === "switch-l2") {
        if (!portCarriesVlan(end.remote, vlan)) continue;
        // Access <-> Trunk-Mischfall: nur sicher, wenn das VLAN auf dem Trunk ungetaggt (nativ) ist
        const mixed = (end.local.mode === "trunk") !== (end.remote.mode === "trunk");
        if (mixed && untaggedVlan(end.local) !== untaggedVlan(end.remote)) continue;
        if (!visitedSwitches.has(end.remoteDevice.id)) {
          visitedSwitches.add(end.remoteDevice.id);
          queue.push({ sw: end.remoteDevice, inPort: end.remote });
        }
      } else if (isL3Capable(end.remoteDevice)) {
        if (end.remoteDevice.type === "switch-l3") {
          undeterminable = true;
          continue;
        }
        // Router hängt ungetaggt am Switch-Port: der Port muss das VLAN ungetaggt führen
        if (untaggedVlan(end.local) !== vlan) continue;
        peers.push({ device: end.remoteDevice, iface: end.remote });
      }
    }
  }
  return undeterminable ? null : peers;
}

/**
 * Ermittelt die echten OSPF-Nachbarschaften eines Geräts. Eine Nachbarschaft entsteht nur, wenn:
 * beide Enden Router bzw. L3-Switch sind, OSPF auf beiden Interfaces aktiv ist (nicht passive),
 * beide Interfaces und alle Links dazwischen up sind, beide im selben Subnetz liegen, dieselbe Area und einen
 * kompatiblen Netztyp haben und die Router-IDs verschieden sind. Router sind direkt oder über L2-Switches
 * (gleiches VLAN, Access/Trunk, keine STP-geblockten Pfade) verbunden; im Broadcast-Segment gilt die
 * DR/BDR-Wahl über alle Teilnehmer (Priority, dann Router-ID, Priority 0 nimmt nicht teil).
 * FULL besteht, wenn mindestens eine Seite DR oder BDR ist, sonst 2WAY.
 */
export function computeOspfNeighbors(device: TopologyDevice, topology: NetworkTopology): OspfAdjacency[] {
  const result: OspfAdjacency[] = [];
  if (!deviceRunsOspf(device)) return result;
  const myRid = getOspfRouterId(device);
  if (!myRid) return result;

  for (const link of topology.links) {
    const first = findLinkEnd(topology, link, device.id);
    if (!first) continue;
    const { local } = first;
    if (!isLinkUsable(link)) continue;
    if (!isInterfaceActive(local)) continue;
    const mine = resolveInterfaceOspf(device, local);
    if (!mine || mine.passive) continue;

    const candidates = collectSegmentPeers(topology, device, local, first, link);
    if (!candidates) continue;

    // Teilnehmer, die zu meinem Interface passen (gleiche Area, Netztyp, Subnetz, aktiv, nicht passive)
    const group: Array<{ peer: SegmentPeer; rid: string; priority: number }> = [];
    const seenRids = new Set<string>([myRid]);
    for (const peer of candidates) {
      if (peer.device.id === device.id || !deviceRunsOspf(peer.device)) continue;
      if (!isInterfaceActive(peer.iface) || !peer.iface.ip || !local.ip) continue;
      const theirs = resolveInterfaceOspf(peer.device, peer.iface);
      if (!theirs || theirs.passive) continue;
      if (mine.area !== theirs.area || mine.networkType !== theirs.networkType) continue;
      if (!sameSubnet(local.ip, peer.iface.ip)) continue;
      const rid = getOspfRouterId(peer.device);
      if (!rid || seenRids.has(rid)) continue;
      seenRids.add(rid);
      group.push({ peer, rid, priority: theirs.priority });
    }
    if (group.length === 0) continue;

    if (mine.networkType === "point-to-point") {
      // point-to-point kennt keine Wahl; mehr als ein Partner ist nicht bestimmbar
      if (group.length !== 1) continue;
      const g = group[0];
      result.push({
        link,
        localInterface: local,
        neighbor: g.peer.device,
        neighborInterface: g.peer.iface,
        neighborRouterId: g.rid,
        neighborAddress: g.peer.iface.ip!.split("/")[0],
        neighborPriority: 0,
        networkType: mine.networkType,
        neighborRole: "-",
        state: "FULL",
      });
      continue;
    }

    // Broadcast: Wahl über alle Teilnehmer (ich + Gruppe)
    const members = [{ rid: myRid, priority: mine.priority }, ...group.map((g) => ({ rid: g.rid, priority: g.priority }))];
    const eligible = members
      .filter((m) => m.priority > 0)
      .sort((x, y) => y.priority - x.priority || ipToNumber(y.rid) - ipToNumber(x.rid));
    const dr = eligible[0]?.rid;
    const bdr = eligible[1]?.rid;
    const roleOf = (rid: string): OspfNeighborRole => (rid === dr ? "DR" : rid === bdr ? "BDR" : "DROTHER");
    const myRole = roleOf(myRid);

    for (const g of group) {
      const role = roleOf(g.rid);
      result.push({
        link,
        localInterface: local,
        neighbor: g.peer.device,
        neighborInterface: g.peer.iface,
        neighborRouterId: g.rid,
        neighborAddress: g.peer.iface.ip!.split("/")[0],
        neighborPriority: g.priority,
        networkType: mine.networkType,
        neighborRole: role,
        state: myRole !== "DROTHER" || role !== "DROTHER" ? "FULL" : "2WAY",
      });
    }
  }
  return result;
}

export const OSPF_NEIGHBOR_HEADER =
  "Neighbor ID     Pri   State           Dead Time   Address         Interface";

export function formatOspfNeighborTable(adjacencies: OspfAdjacency[]): string {
  const rows = adjacencies.map((a) => {
    const stateCol = `${a.state}/${a.neighborRole === "-" ? "  -" : a.neighborRole}`;
    return (
      a.neighborRouterId.padEnd(16, " ") +
      String(a.neighborPriority).padStart(3, " ") +
      "   " +
      stateCol.padEnd(16, " ") +
      "00:00:36".padEnd(12, " ") +
      a.neighborAddress.padEnd(16, " ") +
      a.localInterface.name
    );
  });
  return [OSPF_NEIGHBOR_HEADER, ...rows].join("\n");
}

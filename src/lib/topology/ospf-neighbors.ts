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
  return device.config?.routingProtocols?.find((p) => /ospf/i.test(p));
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

function electRoles(
  a: { rid: string; priority: number },
  b: { rid: string; priority: number }
): { a: OspfNeighborRole; b: OspfNeighborRole } {
  const eligible = [a, b].filter((x) => x.priority > 0);
  if (eligible.length === 0) return { a: "DROTHER", b: "DROTHER" };
  eligible.sort((x, y) => y.priority - x.priority || ipToNumber(y.rid) - ipToNumber(x.rid));
  const dr = eligible[0];
  const bdr = eligible[1];
  const role = (x: typeof a): OspfNeighborRole => (x === dr ? "DR" : x === bdr ? "BDR" : "DROTHER");
  return { a: role(a), b: role(b) };
}

/**
 * Ermittelt die echten OSPF-Nachbarschaften eines Geräts. Eine Nachbarschaft entsteht nur, wenn:
 * beide Enden Router bzw. L3-Switch sind, OSPF auf beiden Interfaces aktiv ist (nicht passive),
 * beide Interfaces und der Link up sind, beide im selben Subnetz liegen, dieselbe Area und einen
 * kompatiblen Netztyp haben und die Router-IDs verschieden sind.
 * Nur direkte Links werden betrachtet (kein L2-Segment über Switches hinweg).
 */
export function computeOspfNeighbors(device: TopologyDevice, topology: NetworkTopology): OspfAdjacency[] {
  const result: OspfAdjacency[] = [];
  if (!deviceRunsOspf(device)) return result;
  const myRid = getOspfRouterId(device);
  if (!myRid) return result;

  for (const link of topology.links) {
    let localId: string;
    let neighborDeviceId: string;
    let neighborIfaceId: string;
    if (link.sourceDeviceId === device.id) {
      localId = link.sourceInterfaceId;
      neighborDeviceId = link.targetDeviceId;
      neighborIfaceId = link.targetInterfaceId;
    } else if (link.targetDeviceId === device.id) {
      localId = link.targetInterfaceId;
      neighborDeviceId = link.sourceDeviceId;
      neighborIfaceId = link.sourceInterfaceId;
    } else {
      continue;
    }
    if (!isLinkUsable(link)) continue;

    const neighbor = topology.devices.find((d) => d.id === neighborDeviceId);
    if (!neighbor || neighbor.id === device.id || !deviceRunsOspf(neighbor)) continue;

    const localIface = device.interfaces.find((i) => i.id === localId);
    const neighborIface = neighbor.interfaces.find((i) => i.id === neighborIfaceId);
    if (!localIface || !neighborIface) continue;
    if (!isInterfaceActive(localIface) || !isInterfaceActive(neighborIface)) continue;

    const mine = resolveInterfaceOspf(device, localIface);
    const theirs = resolveInterfaceOspf(neighbor, neighborIface);
    if (!mine || !theirs) continue;
    if (mine.passive || theirs.passive) continue;
    if (mine.area !== theirs.area) continue;
    if (mine.networkType !== theirs.networkType) continue;
    if (!sameSubnet(localIface.ip!, neighborIface.ip!)) continue;

    const neighborRid = getOspfRouterId(neighbor);
    if (!neighborRid || neighborRid === myRid) continue;

    let role: OspfNeighborRole = "-";
    let state: OspfAdjacency["state"] = "FULL";
    if (mine.networkType === "broadcast") {
      const roles = electRoles(
        { rid: myRid, priority: mine.priority },
        { rid: neighborRid, priority: theirs.priority }
      );
      role = roles.b;
      if (roles.a === "DROTHER" && roles.b === "DROTHER") state = "2WAY";
    }

    result.push({
      link,
      localInterface: localIface,
      neighbor,
      neighborInterface: neighborIface,
      neighborRouterId: neighborRid,
      neighborAddress: neighborIface.ip!.split("/")[0],
      neighborPriority: mine.networkType === "point-to-point" ? 0 : theirs.priority,
      networkType: mine.networkType,
      neighborRole: role,
      state,
    });
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

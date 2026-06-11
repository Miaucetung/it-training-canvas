/**
 * Networking Engine — Real IP/subnet math, ARP, DHCP, DNS, ACL, NAT, STP
 * Replaces mock-based simulation with actual network logic.
 */
import {
  ACLConfig,
  ACLRule,
  ARPEntry,
  CanvasConnection,
  DrawingObject,
  NetworkInterface,
  PDUFrame,
  PDUInspection,
  RoutingTable,
  RoutingTableEntry,
  STPConfig,
  STPPortState,
} from "@/lib/types";

// ============================================================
// IP Utilities
// ============================================================

/** Parse dotted-quad IP to 32-bit number */
export function ipToNumber(ip: string): number {
  const parts = ip
    .split("/")[0] // strip CIDR
    .split(".")
    .map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
    return 0;
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}

/** Convert 32-bit number back to dotted-quad */
export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

/** Parse subnet mask to prefix length (e.g. "255.255.255.0" → 24) */
export function maskToCidr(mask: string): number {
  const n = ipToNumber(mask);
  let bits = 0;
  let val = n;
  while (val & 0x80000000) {
    bits++;
    val <<= 1;
  }
  return bits;
}

/** Prefix length to subnet mask number */
export function cidrToMask(cidr: number): number {
  if (cidr <= 0) return 0;
  if (cidr >= 32) return 0xffffffff;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

/** Get network address from IP + mask */
export function getNetworkAddress(ip: string, mask: string): string {
  return numberToIp((ipToNumber(ip) & ipToNumber(mask)) >>> 0);
}

/** Get broadcast address from IP + mask */
export function getBroadcastAddress(ip: string, mask: string): string {
  const net = ipToNumber(ip) & ipToNumber(mask);
  const wildcard = ~ipToNumber(mask) & 0xffffffff;
  return numberToIp((net | wildcard) >>> 0);
}

/** Check if two IPs are on the same subnet */
export function isSameSubnet(ip1: string, ip2: string, mask: string): boolean {
  const m = ipToNumber(mask);
  return (ipToNumber(ip1) & m) === (ipToNumber(ip2) & m);
}

/** Check if IP is valid dotted-quad */
export function isValidIp(ip: string): boolean {
  const clean = ip.split("/")[0];
  const parts = clean.split(".").map(Number);
  return (
    parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)
  );
}

/** Generate a random MAC address */
export function generateMAC(): string {
  const hex = () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  return `00:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

/** IP from config, fallback-safe */
function getIp(obj: DrawingObject): string {
  return obj.config?.ipAddress?.split("/")[0] || "";
}

function getMask(obj: DrawingObject): string {
  if (obj.config?.subnetMask) return obj.config.subnetMask;
  // Try CIDR notation from ipAddress
  const parts = obj.config?.ipAddress?.split("/");
  if (parts && parts.length === 2) {
    return numberToIp(cidrToMask(parseInt(parts[1])));
  }
  return "255.255.255.0";
}

function getMAC(obj: DrawingObject): string {
  return obj.config?.mac || generateMAC();
}

// ============================================================
// Connectivity Check — Real subnet/gateway validation
// ============================================================

export interface ConnectivityResult {
  reachable: boolean;
  hops: ConnectivityHop[];
  error?: string;
  errorCode?:
    | "NO_IP"
    | "NO_PATH"
    | "SUBNET_MISMATCH"
    | "NO_GATEWAY"
    | "NO_ROUTE"
    | "INTERFACE_DOWN"
    | "ACL_DENIED"
    | "CABLE_MISMATCH"
    | "VLAN_MISMATCH"
    | "DESTINATION_UNREACHABLE"
    | "TTL_EXPIRED";
  latencyMs: number;
}

export interface ConnectivityHop {
  shapeId: string;
  ip: string;
  mac: string;
  action: string; // "forward" | "route" | "switch" | "arp-request" | "arp-reply" | "nat" | "drop"
  detail?: string;
}

/**
 * Real ping check: validates IP config, subnets, routing tables, interfaces,
 * ACLs, VLANs, NAT, and cable types.
 */
export function checkConnectivity(
  sourceId: string,
  targetId: string,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): ConnectivityResult {
  const source = objects.find((o) => o.id === sourceId);
  const target = objects.find((o) => o.id === targetId);

  if (!source || !target)
    return {
      reachable: false,
      hops: [],
      error: "Shape not found",
      errorCode: "NO_IP",
      latencyMs: 0,
    };

  const srcIp = getIp(source);
  const dstIp = getIp(target);
  if (!srcIp || !dstIp)
    return {
      reachable: false,
      hops: [],
      error: "IP-Adresse nicht konfiguriert",
      errorCode: "NO_IP",
      latencyMs: 0,
    };

  const hops: ConnectivityHop[] = [];
  const visited = new Set<string>();
  let currentId = sourceId;
  let currentIp = srcIp;
  let ttl = 64;
  let totalLatency = 0;

  hops.push({
    shapeId: sourceId,
    ip: srcIp,
    mac: getMAC(source),
    action: "origin",
    detail: `ICMP Echo Request an ${dstIp}`,
  });

  // Walk the path
  while (currentId !== targetId && ttl > 0) {
    visited.add(currentId);
    ttl--;

    if (ttl <= 0) {
      return {
        reachable: false,
        hops,
        error: "TTL abgelaufen",
        errorCode: "TTL_EXPIRED",
        latencyMs: totalLatency,
      };
    }

    const currentObj = objects.find((o) => o.id === currentId)!;
    const currentMask = getMask(currentObj);

    // Check: are we on the same subnet as target?
    const sameSubnet = isSameSubnet(currentIp, dstIp, currentMask);

    // Find next hop
    let nextHopId: string | null = null;
    let nextConn: CanvasConnection | null = null;

    if (sameSubnet) {
      // Direct delivery — find target through connections
      const directPath = findDirectPath(
        currentId,
        targetId,
        objects,
        connections,
        visited,
      );
      if (directPath.length >= 2) {
        nextHopId = directPath[1];
        nextConn =
          connections.find(
            (c) =>
              (c.sourceShapeId === currentId &&
                c.targetShapeId === nextHopId) ||
              (c.targetShapeId === currentId && c.sourceShapeId === nextHopId),
          ) || null;
      }
    } else {
      // Need routing — check routing table
      const gateway = findNextHopFromRouting(currentObj, dstIp);
      if (!gateway) {
        // Try default gateway from config
        const gw = currentObj.config?.gateway;
        if (!gw) {
          return {
            reachable: false,
            hops,
            error: `Kein Gateway konfiguriert auf ${currentObj.config?.hostname || currentId.slice(0, 8)}`,
            errorCode: "NO_GATEWAY",
            latencyMs: totalLatency,
          };
        }
        // Find shape that has the gateway IP
        const gwShape = objects.find((o) => getIp(o) === gw);
        if (!gwShape) {
          return {
            reachable: false,
            hops,
            error: `Gateway ${gw} nicht erreichbar`,
            errorCode: "NO_ROUTE",
            latencyMs: totalLatency,
          };
        }
        nextHopId = gwShape.id;
      } else {
        const gwShape = objects.find((o) => getIp(o) === gateway);
        if (!gwShape) {
          return {
            reachable: false,
            hops,
            error: `Next-Hop ${gateway} nicht erreichbar`,
            errorCode: "NO_ROUTE",
            latencyMs: totalLatency,
          };
        }
        nextHopId = gwShape.id;
      }

      // Check connection exists between current and next hop
      nextConn =
        connections.find(
          (c) =>
            (c.sourceShapeId === currentId && c.targetShapeId === nextHopId) ||
            (c.targetShapeId === currentId && c.sourceShapeId === nextHopId),
        ) || null;

      // If no direct link, try finding via connected switches/intermediate L2 devices
      if (!nextConn && nextHopId) {
        const indirectPath = findDirectPath(
          currentId,
          nextHopId,
          objects,
          connections,
          new Set(),
        );
        if (indirectPath.length >= 2) {
          nextHopId = indirectPath[1];
          nextConn =
            connections.find(
              (c) =>
                (c.sourceShapeId === currentId &&
                  c.targetShapeId === nextHopId) ||
                (c.targetShapeId === currentId &&
                  c.sourceShapeId === nextHopId),
            ) || null;
        }
      }
    }

    if (!nextHopId || !nextConn) {
      return {
        reachable: false,
        hops,
        error: `Kein Pfad von ${currentObj.config?.hostname || currentIp} zum Ziel`,
        errorCode: "NO_PATH",
        latencyMs: totalLatency,
      };
    }

    // Check interface status
    const ifDown = checkInterfaceDown(currentObj, nextConn);
    if (ifDown) {
      return {
        reachable: false,
        hops,
        error: ifDown,
        errorCode: "INTERFACE_DOWN",
        latencyMs: totalLatency,
      };
    }

    // Check cable type compatibility
    const cableError = checkCableType(currentObj, nextHopId, objects, nextConn);
    if (cableError) {
      return {
        reachable: false,
        hops,
        error: cableError,
        errorCode: "CABLE_MISMATCH",
        latencyMs: totalLatency,
      };
    }

    // Check VLAN compatibility on L2 path
    const vlanError = checkVlanCompat(currentObj, nextHopId, objects);
    if (vlanError) {
      return {
        reachable: false,
        hops,
        error: vlanError,
        errorCode: "VLAN_MISMATCH",
        latencyMs: totalLatency,
      };
    }

    // Check ACL
    const aclDeny = checkACL(currentObj, srcIp, dstIp, "icmp");
    if (aclDeny) {
      hops.push({
        shapeId: currentId,
        ip: currentIp,
        mac: getMAC(currentObj),
        action: "drop",
        detail: `ACL denied: ${aclDeny}`,
      });
      return {
        reachable: false,
        hops,
        error: `Paket durch ACL blockiert: ${aclDeny}`,
        errorCode: "ACL_DENIED",
        latencyMs: totalLatency,
      };
    }

    const nextObj = objects.find((o) => o.id === nextHopId)!;
    const nextIp = getIp(nextObj) || nextHopId.slice(0, 8);
    const isRouter =
      nextObj.shapeId?.toLowerCase().includes("router") ||
      nextObj.shapeId?.toLowerCase().includes("gateway") ||
      nextObj.shapeId?.toLowerCase().includes("firewall");
    const isSwitch = nextObj.shapeId?.toLowerCase().includes("switch");

    totalLatency += 2 + Math.random() * 3; // 2-5ms per hop

    if (isSwitch) {
      hops.push({
        shapeId: nextHopId,
        ip: nextIp,
        mac: getMAC(nextObj),
        action: "switch",
        detail: `Frame weitergeleitet (L2 Switch)`,
      });
    } else if (isRouter) {
      // Check NAT
      const natInfo = checkNAT(nextObj, srcIp, dstIp);
      hops.push({
        shapeId: nextHopId,
        ip: nextIp,
        mac: getMAC(nextObj),
        action: "route",
        detail: natInfo
          ? `Routing + NAT: ${natInfo}`
          : `Routing zum Zielnetz (TTL=${ttl})`,
      });
    } else {
      hops.push({
        shapeId: nextHopId,
        ip: nextIp,
        mac: getMAC(nextObj),
        action: "forward",
        detail:
          nextHopId === targetId
            ? "Ziel erreicht"
            : `Weiterleitung über ${nextObj.config?.hostname || nextObj.label || ""}`,
      });
    }

    if (visited.has(nextHopId)) {
      return {
        reachable: false,
        hops,
        error: "Routing-Schleife erkannt",
        errorCode: "TTL_EXPIRED",
        latencyMs: totalLatency,
      };
    }

    currentId = nextHopId;
    currentIp = nextIp;
  }

  return {
    reachable: true,
    hops,
    latencyMs: Math.round(totalLatency * 100) / 100,
  };
}

// ============================================================
// Routing Logic
// ============================================================

/** Find next hop from routing table */
function findNextHopFromRouting(
  shape: DrawingObject,
  destinationIp: string,
): string | null {
  const rt = shape.config?.routingTable;
  if (!rt || rt.entries.length === 0) return null;

  // Sort by specificity (longest prefix match)
  const sorted = [...rt.entries].sort(
    (a, b) => maskToCidr(b.netmask) - maskToCidr(a.netmask),
  );

  for (const entry of sorted) {
    if (entry.destination === "0.0.0.0" && entry.netmask === "0.0.0.0") {
      // Default route
      return entry.nextHop === "directly connected" ? null : entry.nextHop;
    }
    const destNet = ipToNumber(entry.destination) & ipToNumber(entry.netmask);
    const targetNet = ipToNumber(destinationIp) & ipToNumber(entry.netmask);
    if (destNet === targetNet) {
      return entry.nextHop === "directly connected" ? null : entry.nextHop;
    }
  }
  return null;
}

/** Find a path between shapes through connections (BFS, L2 forwarding) */
function findDirectPath(
  sourceId: string,
  targetId: string,
  objects: DrawingObject[],
  connections: CanvasConnection[],
  excluded: Set<string>,
): string[] {
  const adjacency: Record<string, string[]> = {};
  connections.forEach((conn) => {
    if (conn.status === "inactive") return;
    if (!adjacency[conn.sourceShapeId]) adjacency[conn.sourceShapeId] = [];
    if (!adjacency[conn.targetShapeId]) adjacency[conn.targetShapeId] = [];
    adjacency[conn.sourceShapeId].push(conn.targetShapeId);
    adjacency[conn.targetShapeId].push(conn.sourceShapeId);
  });

  const visited = new Set<string>(excluded);
  visited.delete(sourceId); // Don't exclude source itself
  const queue: { id: string; path: string[] }[] = [
    { id: sourceId, path: [sourceId] },
  ];
  visited.add(sourceId);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    for (const neighbor of adjacency[id] || []) {
      if (neighbor === targetId) return [...path, neighbor];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ id: neighbor, path: [...path, neighbor] });
      }
    }
  }
  return [];
}

// ============================================================
// Interface Status Check
// ============================================================

function checkInterfaceDown(
  shape: DrawingObject,
  conn: CanvasConnection,
): string | null {
  const interfaces = shape.config?.interfaces;
  if (!interfaces || interfaces.length === 0) return null;

  // Find the interface connected through this port
  const portName =
    shape.id === conn.sourceShapeId ? conn.sourcePort : conn.targetPort;
  const iface = interfaces.find(
    (i) => i.name === portName || i.description === portName,
  );
  if (iface && (iface.status === "down" || iface.status === "admin-down")) {
    return `Interface ${iface.name} ist ${iface.status} auf ${shape.config?.hostname || shape.label || "Gerät"}`;
  }
  return null;
}

// ============================================================
// Cable Type Validation
// ============================================================

function checkCableType(
  currentObj: DrawingObject,
  nextHopId: string,
  objects: DrawingObject[],
  conn: CanvasConnection,
): string | null {
  if (!conn.cableType) return null; // No cable type set = works

  const nextObj = objects.find((o) => o.id === nextHopId);
  if (!nextObj) return null;

  const srcType = currentObj.shapeId?.toLowerCase() || "";
  const dstType = nextObj.shapeId?.toLowerCase() || "";

  // Same-type devices (switch-switch, router-router) need crossover
  const srcIsSwitch = srcType.includes("switch");
  const dstIsSwitch = dstType.includes("switch");
  const srcIsRouter = srcType.includes("router") || srcType.includes("gateway");
  const dstIsRouter = dstType.includes("router") || dstType.includes("gateway");
  const srcIsPC =
    srcType.includes("computer") ||
    srcType.includes("server") ||
    srcType.includes("pc");
  const dstIsPC =
    dstType.includes("computer") ||
    dstType.includes("server") ||
    dstType.includes("pc");

  const sameLikeDevices =
    (srcIsSwitch && dstIsSwitch) ||
    (srcIsRouter && dstIsRouter) ||
    (srcIsPC && dstIsPC) ||
    (srcIsRouter && dstIsPC) ||
    (srcIsPC && dstIsRouter);

  if (sameLikeDevices && conn.cableType === "straight-through") {
    return `Falscher Kabeltyp: Gleichartige Geräte benötigen ein Crossover-Kabel (aktuell: Straight-Through)`;
  }

  if (!sameLikeDevices && conn.cableType === "crossover") {
    // Switch to PC/Router needs straight-through
    if (
      (srcIsSwitch && (dstIsPC || dstIsRouter)) ||
      (dstIsSwitch && (srcIsPC || srcIsRouter))
    ) {
      return `Falscher Kabeltyp: Switch zu Endgerät benötigt ein Straight-Through-Kabel (aktuell: Crossover)`;
    }
  }

  if (
    conn.cableType === "console" &&
    !(srcType.includes("computer") || dstType.includes("computer"))
  ) {
    return `Console-Kabel: Kann nur zwischen PC und Netzwerkgerät verwendet werden`;
  }

  return null;
}

// ============================================================
// VLAN Check
// ============================================================

function checkVlanCompat(
  currentObj: DrawingObject,
  nextHopId: string,
  objects: DrawingObject[],
): string | null {
  const nextObj = objects.find((o) => o.id === nextHopId);
  if (!nextObj) return null;

  const srcInterfaces = currentObj.config?.interfaces;
  const dstInterfaces = nextObj.config?.interfaces;
  if (!srcInterfaces || !dstInterfaces) return null;

  // Check if any configured interfaces have matching VLANs
  const srcVlans = srcInterfaces
    .filter((i) => i.mode === "access" && i.vlan)
    .map((i) => i.vlan!);
  const dstVlans = dstInterfaces
    .filter((i) => i.mode === "access" && i.vlan)
    .map((i) => i.vlan!);

  if (srcVlans.length > 0 && dstVlans.length > 0) {
    const commonVlan = srcVlans.some((v) => dstVlans.includes(v));
    if (!commonVlan) {
      return `VLAN-Konflikt: Geräte in unterschiedlichen VLANs (${srcVlans.join(",")} vs ${dstVlans.join(",")})`;
    }
  }

  return null;
}

// ============================================================
// ACL (Access Control List) Engine
// ============================================================

function checkACL(
  shape: DrawingObject,
  srcIp: string,
  dstIp: string,
  protocol: string,
  srcPort?: number,
  dstPort?: number,
): string | null {
  const acls = shape.config?.acls;
  if (!acls || acls.length === 0) return null;

  for (const acl of acls) {
    for (const rule of acl.rules.sort((a, b) => a.id - b.id)) {
      if (matchesACLRule(rule, srcIp, dstIp, protocol, srcPort, dstPort)) {
        if (rule.action === "deny") {
          rule.hitCount++;
          return `${acl.name} Rule ${rule.id}: deny ${protocol} ${srcIp} → ${dstIp}${rule.description ? ` (${rule.description})` : ""}`;
        }
        rule.hitCount++;
        return null; // permit
      }
    }
  }
  // Implicit deny at end of ACL
  return null; // No ACL match = allow (like no ACL applied)
}

function matchesACLRule(
  rule: ACLRule,
  srcIp: string,
  dstIp: string,
  protocol: string,
  srcPort?: number,
  dstPort?: number,
): boolean {
  // Protocol check
  if (rule.protocol !== "any" && rule.protocol !== "ip") {
    if (rule.protocol !== protocol.toLowerCase()) return false;
  }

  // Source IP check
  if (rule.sourceIp !== "any") {
    if (!matchIpWithWildcard(srcIp, rule.sourceIp)) return false;
  }

  // Destination IP check
  if (rule.destinationIp !== "any") {
    if (!matchIpWithWildcard(dstIp, rule.destinationIp)) return false;
  }

  // Port check
  if (rule.sourcePort && rule.sourcePort !== "any" && srcPort) {
    if (!matchPort(srcPort, rule.sourcePort)) return false;
  }
  if (rule.destinationPort && rule.destinationPort !== "any" && dstPort) {
    if (!matchPort(dstPort, rule.destinationPort)) return false;
  }

  return true;
}

function matchIpWithWildcard(ip: string, ruleIp: string): boolean {
  if (ruleIp === "any") return true;
  // CIDR notation
  if (ruleIp.includes("/")) {
    const [net, cidrStr] = ruleIp.split("/");
    const cidr = parseInt(cidrStr);
    const mask = cidrToMask(cidr);
    return (ipToNumber(ip) & mask) === (ipToNumber(net) & mask);
  }
  // Exact match
  return ip === ruleIp;
}

function matchPort(port: number, rulePort: string): boolean {
  if (rulePort.includes("-")) {
    const [min, max] = rulePort.split("-").map(Number);
    return port >= min && port <= max;
  }
  return port === parseInt(rulePort);
}

/** Evaluate all ACL rules for a shape (for display purposes) */
export function evaluateACLs(shape: DrawingObject): ACLConfig[] {
  return shape.config?.acls || [];
}

// ============================================================
// NAT Engine
// ============================================================

function checkNAT(
  shape: DrawingObject,
  srcIp: string,
  _dstIp: string,
): string | null {
  const nat = shape.config?.natConfig;
  if (!nat || !nat.enabled) return null;

  for (const rule of nat.rules) {
    if (rule.type === "static" && rule.insideLocal === srcIp) {
      return `Static NAT: ${srcIp} → ${rule.insideGlobal}`;
    }
    if (rule.type === "pat" && rule.insideLocal === "any") {
      return `PAT: ${srcIp} → ${rule.insideGlobal} (Port Translation)`;
    }
    if (rule.type === "dynamic") {
      if (matchIpWithWildcard(srcIp, rule.insideLocal) && rule.insideGlobal) {
        return `Dynamic NAT: ${srcIp} → ${rule.insideGlobal}`;
      }
    }
  }
  return null;
}

/** Apply NAT translation to a packet (returns translated IP or original) */
export function applyNAT(
  shape: DrawingObject,
  srcIp: string,
  direction: "inside-to-outside" | "outside-to-inside",
): { translatedIp: string; translatedPort?: number } {
  const nat = shape.config?.natConfig;
  if (!nat || !nat.enabled) return { translatedIp: srcIp };

  for (const rule of nat.rules) {
    if (direction === "inside-to-outside") {
      if (rule.type === "static" && rule.insideLocal === srcIp) {
        return {
          translatedIp: rule.insideGlobal,
          translatedPort: rule.outsidePort,
        };
      }
    } else {
      if (rule.type === "static" && rule.insideGlobal === srcIp) {
        return {
          translatedIp: rule.insideLocal,
          translatedPort: rule.insidePort,
        };
      }
    }
  }
  return { translatedIp: srcIp };
}

// ============================================================
// ARP Engine
// ============================================================

/** Simulate ARP resolution */
export function resolveARP(
  sourceShape: DrawingObject,
  targetIp: string,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): {
  resolved: boolean;
  mac?: string;
  steps: string[];
} {
  const steps: string[] = [];

  // Check ARP cache first
  const cached = sourceShape.config?.arpTable?.entries.find(
    (e) => e.ipAddress === targetIp,
  );
  if (cached) {
    steps.push(`ARP Cache Hit: ${targetIp} → ${cached.macAddress}`);
    return { resolved: true, mac: cached.macAddress, steps };
  }

  steps.push(`ARP Cache Miss für ${targetIp}`);
  steps.push(
    `Sende ARP Request: "Wer hat ${targetIp}? Sag es ${getIp(sourceShape)}"`,
  );

  // Find the target shape
  const targetShape = objects.find((o) => getIp(o) === targetIp);
  if (!targetShape) {
    steps.push(`Keine ARP Antwort für ${targetIp} (Gerät nicht gefunden)`);
    return { resolved: false, steps };
  }

  // Check reachability (must be connected)
  const path = findDirectPath(
    sourceShape.id,
    targetShape.id,
    objects,
    connections,
    new Set(),
  );
  if (path.length === 0) {
    steps.push(`ARP Request konnte Ziel nicht erreichen (kein L2-Pfad)`);
    return { resolved: false, steps };
  }

  const mac = getMAC(targetShape);
  steps.push(`ARP Reply von ${targetIp}: "${targetIp} ist bei ${mac}"`);
  steps.push(`ARP-Tabelle aktualisiert`);

  return { resolved: true, mac, steps };
}

/** Build ARP table for a shape */
export function buildARPTable(
  shape: DrawingObject,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): ARPEntry[] {
  const entries: ARPEntry[] = shape.config?.arpTable?.entries || [];
  const shapeIp = getIp(shape);
  const shapeMask = getMask(shape);

  // Find all directly connected devices on same subnet
  const neighbors = findConnectedShapes(shape.id, connections);
  for (const neighborId of neighbors) {
    const neighbor = objects.find((o) => o.id === neighborId);
    if (!neighbor) continue;
    const nIp = getIp(neighbor);
    if (!nIp) continue;
    if (shapeIp && isSameSubnet(shapeIp, nIp, shapeMask)) {
      if (!entries.find((e) => e.ipAddress === nIp)) {
        entries.push({
          ipAddress: nIp,
          macAddress: getMAC(neighbor),
          interface: "eth0",
          type: "dynamic",
          age: Math.floor(Math.random() * 300),
        });
      }
    }
  }
  return entries;
}

/** Get directly connected shape IDs */
function findConnectedShapes(
  shapeId: string,
  connections: CanvasConnection[],
): string[] {
  const result: string[] = [];
  connections.forEach((c) => {
    if (c.sourceShapeId === shapeId) result.push(c.targetShapeId);
    if (c.targetShapeId === shapeId) result.push(c.sourceShapeId);
  });
  return [...new Set(result)];
}

// ============================================================
// DHCP Engine
// ============================================================

export interface DHCPResult {
  success: boolean;
  assignedIp?: string;
  subnetMask?: string;
  gateway?: string;
  dns?: string[];
  leaseTime?: number;
  steps: string[];
}

/** Simulate DHCP DORA process */
export function performDHCP(
  clientShape: DrawingObject,
  objects: DrawingObject[],
  connections: CanvasConnection[],
): DHCPResult {
  const steps: string[] = [];

  // Find a DHCP server on the network
  const dhcpServer = objects.find(
    (o) =>
      o.config?.dhcpServer?.enabled && o.config.dhcpServer.pools.length > 0,
  );

  if (!dhcpServer) {
    steps.push("DHCP Discover gesendet (Broadcast)...");
    steps.push("Kein DHCP-Server gefunden!");
    return { success: false, steps };
  }

  // Check connectivity
  const path = findDirectPath(
    clientShape.id,
    dhcpServer.id,
    objects,
    connections,
    new Set(),
  );
  if (path.length === 0) {
    steps.push("DHCP Discover gesendet (Broadcast)...");
    steps.push("DHCP-Server nicht erreichbar (kein L2-Pfad)");
    return { success: false, steps };
  }

  const pool = dhcpServer.config!.dhcpServer!.pools[0];
  const leases = dhcpServer.config!.dhcpServer!.leases || [];

  // Find available IP in range
  const startNum = ipToNumber(pool.rangeStart);
  const endNum = ipToNumber(pool.rangeEnd);
  const excluded = new Set([
    ...pool.excludedAddresses,
    ...leases.map((l) => l.ipAddress),
  ]);

  let assignedIp: string | null = null;
  for (let i = startNum; i <= endNum; i++) {
    const candidate = numberToIp(i);
    if (!excluded.has(candidate)) {
      assignedIp = candidate;
      break;
    }
  }

  if (!assignedIp) {
    steps.push("DHCP Discover → DHCP-Server hat keine freien Adressen");
    return { success: false, steps };
  }

  const clientMac = getMAC(clientShape);

  steps.push(
    `1. DISCOVER: Client (${clientMac}) sendet Broadcast an 255.255.255.255`,
  );
  steps.push(`2. OFFER: Server (${getIp(dhcpServer)}) bietet ${assignedIp} an`);
  steps.push(`3. REQUEST: Client bestätigt ${assignedIp}`);
  steps.push(`4. ACK: Server bestätigt Lease (${pool.leaseTime}s)`);

  return {
    success: true,
    assignedIp,
    subnetMask: pool.netmask,
    gateway: pool.defaultGateway,
    dns: pool.dnsServers,
    leaseTime: pool.leaseTime,
    steps,
  };
}

// ============================================================
// DNS Engine
// ============================================================

export interface DNSResult {
  resolved: boolean;
  ip?: string;
  steps: string[];
  recordType?: string;
}

/** Simulate DNS resolution */
export function resolveDNS(
  hostname: string,
  clientShape: DrawingObject,
  objects: DrawingObject[],
  _connections: CanvasConnection[],
): DNSResult {
  const steps: string[] = [];

  // Find DNS server
  const dnsServerIp = clientShape.config?.dns?.[0];
  if (!dnsServerIp) {
    steps.push(
      `Kein DNS-Server konfiguriert auf ${clientShape.config?.hostname || "Client"}`,
    );
    return { resolved: false, steps };
  }

  const dnsServer = objects.find((o) => getIp(o) === dnsServerIp);
  if (!dnsServer) {
    steps.push(`DNS-Server ${dnsServerIp} nicht gefunden`);
    return { resolved: false, steps };
  }

  steps.push(`DNS-Anfrage: ${hostname} → ${dnsServerIp}`);

  // Check if server has DNS records
  const dnsConfig = dnsServer.config?.dnsServer;
  if (!dnsConfig || !dnsConfig.enabled) {
    steps.push(`Server ${dnsServerIp} ist kein DNS-Server`);
    return { resolved: false, steps };
  }

  // Look up record
  const record = dnsConfig.records.find(
    (r) => r.name === hostname || r.name === hostname + "." + dnsConfig.domain,
  );

  if (record) {
    steps.push(
      `DNS Antwort: ${hostname} → ${record.value} (${record.type}, TTL ${record.ttl})`,
    );
    return {
      resolved: true,
      ip: record.value,
      steps,
      recordType: record.type,
    };
  }

  // Check CNAME chains
  const cname = dnsConfig.records.find(
    (r) => r.name === hostname && r.type === "CNAME",
  );
  if (cname) {
    steps.push(`CNAME: ${hostname} → ${cname.value}`);
    const aRecord = dnsConfig.records.find(
      (r) => r.name === cname.value && r.type === "A",
    );
    if (aRecord) {
      steps.push(`A Record: ${cname.value} → ${aRecord.value}`);
      return { resolved: true, ip: aRecord.value, steps, recordType: "A" };
    }
  }

  // Try forwarders (simulated)
  if (dnsConfig.forwarders.length > 0) {
    steps.push(`Weiterleitung an ${dnsConfig.forwarders[0]}...`);
    steps.push(`Kein Eintrag für ${hostname} gefunden`);
  } else {
    steps.push(`Kein DNS-Eintrag für ${hostname}`);
  }

  return { resolved: false, steps };
}

// ============================================================
// STP Engine
// ============================================================

/** Calculate STP states for all switches in the network */
export function calculateSTP(
  objects: DrawingObject[],
  connections: CanvasConnection[],
): Map<string, STPConfig> {
  const switches = objects.filter(
    (o) =>
      o.shapeId?.toLowerCase().includes("switch") &&
      o.config?.stpConfig?.enabled,
  );

  if (switches.length === 0) return new Map();

  const result = new Map<string, STPConfig>();

  // Find root bridge (lowest bridge ID = priority + MAC)
  let rootSwitch = switches[0];
  for (const sw of switches) {
    const stp = sw.config!.stpConfig!;
    const rootStp = rootSwitch.config!.stpConfig!;
    if (
      stp.priority < rootStp.priority ||
      (stp.priority === rootStp.priority && stp.bridgeId < rootStp.bridgeId)
    ) {
      rootSwitch = sw;
    }
  }

  const rootBridgeId = rootSwitch.config!.stpConfig!.bridgeId;

  for (const sw of switches) {
    const stp = { ...sw.config!.stpConfig! };
    stp.rootBridgeId = rootBridgeId;

    // Calculate root cost
    if (sw.id === rootSwitch.id) {
      stp.rootCost = 0;
      // Root bridge: all ports are designated/forwarding
      const portStates: Record<string, STPPortState> = {};
      const connectedPorts = findConnectedShapes(sw.id, connections);
      connectedPorts.forEach((neighborId, idx) => {
        const ifName = `Gi0/${idx}`;
        portStates[ifName] = {
          interface: ifName,
          state: "forwarding",
          cost: 19, // Gigabit default
          role: "designated",
          priority: 128,
        };
      });
      stp.portStates = portStates;
    } else {
      // Calculate cost to root
      const path = findDirectPath(
        sw.id,
        rootSwitch.id,
        objects,
        connections,
        new Set(),
      );
      stp.rootCost = (path.length - 1) * 19; // 19 per hop (Gigabit)

      // Determine port roles
      const portStates: Record<string, STPPortState> = {};
      const connectedPorts = findConnectedShapes(sw.id, connections);
      let rootPortAssigned = false;

      connectedPorts.forEach((neighborId, idx) => {
        const ifName = `Gi0/${idx}`;
        const neighbor = objects.find((o) => o.id === neighborId);
        const isNeighborSwitch = neighbor?.shapeId
          ?.toLowerCase()
          .includes("switch");

        if (!isNeighborSwitch) {
          // Port to end device = designated forwarding
          portStates[ifName] = {
            interface: ifName,
            state: "forwarding",
            cost: 19,
            role: "designated",
            priority: 128,
          };
          return;
        }

        // Check if this port leads to root bridge
        const pathViaThis = findDirectPath(
          neighborId,
          rootSwitch.id,
          objects,
          connections,
          new Set([sw.id]),
        );

        if (!rootPortAssigned && pathViaThis.length > 0) {
          // This is the root port
          portStates[ifName] = {
            interface: ifName,
            state: "forwarding",
            cost: 19,
            role: "root",
            priority: 128,
          };
          rootPortAssigned = true;
        } else {
          // Check if we need to block (redundant path)
          const neighborStp = neighbor!.config?.stpConfig;
          if (
            neighborStp &&
            (neighborStp.priority > stp.priority ||
              (neighborStp.priority === stp.priority &&
                neighborStp.bridgeId > stp.bridgeId))
          ) {
            portStates[ifName] = {
              interface: ifName,
              state: "forwarding",
              cost: 19,
              role: "designated",
              priority: 128,
            };
          } else {
            portStates[ifName] = {
              interface: ifName,
              state: "blocking",
              cost: 19,
              role: "alternate",
              priority: 128,
            };
          }
        }
      });

      stp.portStates = portStates;
    }

    result.set(sw.id, stp);
  }

  return result;
}

// ============================================================
// PDU Inspector — Build protocol headers for each hop
// ============================================================

export function buildPDUInspection(
  sourceShape: DrawingObject,
  targetShape: DrawingObject,
  protocol: string,
  hopIndex: number,
  hop: ConnectivityHop,
): PDUInspection {
  const frames: PDUFrame[] = [];

  // L1 — Physical
  frames.push({
    layer: "L1",
    name: "Physical",
    fields: [
      { name: "Medium", value: "Ethernet / UTP", size: "-" },
      {
        name: "Signaling",
        value: "Base-T",
        description: "Electrical signaling",
      },
    ],
  });

  // L2 — Data Link (Ethernet Frame)
  frames.push({
    layer: "L2",
    name: "Ethernet II Frame",
    fields: [
      {
        name: "Destination MAC",
        value: hop.mac || "FF:FF:FF:FF:FF:FF",
        size: "6 bytes",
      },
      {
        name: "Source MAC",
        value: sourceShape.config?.mac || generateMAC(),
        size: "6 bytes",
      },
      {
        name: "EtherType",
        value: protocol === "arp" ? "0x0806 (ARP)" : "0x0800 (IPv4)",
        size: "2 bytes",
      },
      {
        name: "FCS",
        value: "0x" + Math.random().toString(16).slice(2, 10),
        size: "4 bytes",
      },
    ],
  });

  // L3 — Network (IP Header)
  const srcIp = getIp(sourceShape) || "0.0.0.0";
  const dstIp = getIp(targetShape) || "0.0.0.0";
  frames.push({
    layer: "L3",
    name: "IPv4 Header",
    fields: [
      { name: "Version", value: "4", size: "4 bits" },
      {
        name: "IHL",
        value: "5",
        size: "4 bits",
        description: "Header Length (20 bytes)",
      },
      { name: "DSCP", value: "0", size: "6 bits" },
      { name: "Total Length", value: "84", size: "2 bytes" },
      { name: "TTL", value: String(64 - hopIndex), size: "1 byte" },
      {
        name: "Protocol",
        value: protocolToNumber(protocol),
        size: "1 byte",
      },
      { name: "Source IP", value: srcIp, size: "4 bytes" },
      { name: "Destination IP", value: dstIp, size: "4 bytes" },
      {
        name: "Header Checksum",
        value: "0x" + Math.random().toString(16).slice(2, 6),
        size: "2 bytes",
      },
    ],
  });

  // L4 — Transport
  const proto = protocol.toUpperCase();
  if (
    proto === "TCP" ||
    proto === "HTTP" ||
    proto === "HTTPS" ||
    proto === "SSH"
  ) {
    const dstPort = getDefaultPort(protocol);
    frames.push({
      layer: "L4",
      name: "TCP Segment",
      fields: [
        {
          name: "Source Port",
          value: String(49152 + Math.floor(Math.random() * 16383)),
          size: "2 bytes",
        },
        { name: "Destination Port", value: String(dstPort), size: "2 bytes" },
        {
          name: "Sequence Number",
          value: String(Math.floor(Math.random() * 4294967295)),
          size: "4 bytes",
        },
        { name: "ACK Number", value: "0", size: "4 bytes" },
        {
          name: "Flags",
          value: "SYN",
          size: "6 bits",
          description: "Connection setup",
        },
        { name: "Window Size", value: "65535", size: "2 bytes" },
      ],
    });
  } else if (proto === "UDP" || proto === "DNS") {
    frames.push({
      layer: "L4",
      name: "UDP Datagram",
      fields: [
        {
          name: "Source Port",
          value: String(49152 + Math.floor(Math.random() * 16383)),
          size: "2 bytes",
        },
        {
          name: "Destination Port",
          value: String(getDefaultPort(protocol)),
          size: "2 bytes",
        },
        { name: "Length", value: "64", size: "2 bytes" },
        {
          name: "Checksum",
          value: "0x" + Math.random().toString(16).slice(2, 6),
          size: "2 bytes",
        },
      ],
    });
  } else if (proto === "ICMP" || proto === "PING") {
    frames.push({
      layer: "L4",
      name: "ICMP Message",
      fields: [
        {
          name: "Type",
          value: "8",
          size: "1 byte",
          description: "Echo Request",
        },
        { name: "Code", value: "0", size: "1 byte" },
        {
          name: "Identifier",
          value: String(Math.floor(Math.random() * 65535)),
          size: "2 bytes",
        },
        { name: "Sequence", value: String(hopIndex + 1), size: "2 bytes" },
        { name: "Data", value: "abcdefghijklmnop...", size: "48 bytes" },
      ],
    });
  }

  // L7 — Application
  if (proto === "HTTP") {
    frames.push({
      layer: "L7",
      name: "HTTP Request",
      fields: [
        { name: "Method", value: "GET" },
        { name: "URI", value: "/" },
        { name: "Version", value: "HTTP/1.1" },
        { name: "Host", value: dstIp },
        { name: "User-Agent", value: "IT-Training-Client/1.0" },
      ],
    });
  } else if (proto === "DNS") {
    frames.push({
      layer: "L7",
      name: "DNS Query",
      fields: [
        {
          name: "Transaction ID",
          value: "0x" + Math.random().toString(16).slice(2, 6),
        },
        { name: "Flags", value: "0x0100 (Standard Query)" },
        { name: "Questions", value: "1" },
        { name: "Type", value: "A (Host Address)" },
        { name: "Class", value: "IN (Internet)" },
      ],
    });
  } else if (proto === "SSH") {
    frames.push({
      layer: "L7",
      name: "SSH Protocol",
      fields: [
        { name: "Protocol", value: "SSH-2.0-OpenSSH_9.0" },
        { name: "Key Exchange", value: "curve25519-sha256" },
        { name: "Cipher", value: "aes256-gcm" },
      ],
    });
  }

  return {
    traceId: `pdu-${Date.now()}`,
    stepIndex: hopIndex,
    frames,
  };
}

function protocolToNumber(protocol: string): string {
  const map: Record<string, string> = {
    icmp: "1 (ICMP)",
    ping: "1 (ICMP)",
    tcp: "6 (TCP)",
    http: "6 (TCP)",
    https: "6 (TCP)",
    ssh: "6 (TCP)",
    udp: "17 (UDP)",
    dns: "17 (UDP)",
  };
  return map[protocol.toLowerCase()] || "0";
}

function getDefaultPort(protocol: string): number {
  const map: Record<string, number> = {
    http: 80,
    https: 443,
    ssh: 22,
    dns: 53,
    tcp: 80,
    udp: 53,
    ftp: 21,
    smtp: 25,
    telnet: 23,
  };
  return map[protocol.toLowerCase()] || 0;
}

// ============================================================
// Default configurations for new shapes
// ============================================================

/** Generate default interfaces for a shape based on its type */
export function getDefaultInterfaces(shapeId: string): NetworkInterface[] {
  const id = shapeId?.toLowerCase() || "";
  if (id.includes("router") || id.includes("gateway")) {
    return [
      {
        name: "Gi0/0",
        macAddress: generateMAC(),
        status: "up",
        speed: "1000",
        duplex: "full",
        mtu: 1500,
      },
      {
        name: "Gi0/1",
        macAddress: generateMAC(),
        status: "up",
        speed: "1000",
        duplex: "full",
        mtu: 1500,
      },
      {
        name: "Gi0/2",
        macAddress: generateMAC(),
        status: "down",
        speed: "auto",
        duplex: "auto",
        mtu: 1500,
      },
    ];
  }

  if (id.includes("switch")) {
    return Array.from({ length: 8 }, (_, i) => ({
      name: `Fa0/${i}`,
      macAddress: generateMAC(),
      status: i < 4 ? ("up" as const) : ("down" as const),
      speed: "100" as const,
      duplex: "full" as const,
      mode: "access" as const,
      vlan: 1,
      mtu: 1500,
    }));
  }

  if (id.includes("firewall")) {
    return [
      {
        name: "eth0/0",
        macAddress: generateMAC(),
        status: "up",
        speed: "1000",
        duplex: "full",
        description: "Outside",
        mtu: 1500,
      },
      {
        name: "eth0/1",
        macAddress: generateMAC(),
        status: "up",
        speed: "1000",
        duplex: "full",
        description: "Inside",
        mtu: 1500,
      },
      {
        name: "eth0/2",
        macAddress: generateMAC(),
        status: "down",
        speed: "1000",
        duplex: "full",
        description: "DMZ",
        mtu: 1500,
      },
    ];
  }

  // Default: single interface for servers/PCs
  return [
    {
      name: "eth0",
      macAddress: generateMAC(),
      status: "up",
      speed: "1000",
      duplex: "full",
      mtu: 1500,
    },
  ];
}

/** Generate default routing table for a router */
export function getDefaultRoutingTable(shape: DrawingObject): RoutingTable {
  const entries: RoutingTableEntry[] = [];
  const ip = getIp(shape);
  const mask = getMask(shape);

  if (ip && mask) {
    entries.push({
      destination: getNetworkAddress(ip, mask),
      netmask: mask,
      nextHop: "directly connected",
      interface: "Gi0/0",
      metric: 0,
      protocol: "connected",
    });
  }

  return { entries };
}

// ============================================================
// Topology Validation — Warnings for common misconfigurations
// ============================================================

export interface TopologyWarning {
  severity: "error" | "warning" | "info";
  shapeId: string;
  message: string;
  fix?: string;
}

/** Validate entire topology and return warnings */
export function validateTopology(
  objects: DrawingObject[],
  connections: CanvasConnection[],
): TopologyWarning[] {
  const warnings: TopologyWarning[] = [];
  const shapes = objects.filter((o) => o.type === "shape" && o.shapeId);

  for (const shape of shapes) {
    const ip = getIp(shape);
    const mask = getMask(shape);
    const gw = shape.config?.gateway;

    // No IP configured
    if (
      !ip &&
      shape.shapeId &&
      !shape.shapeId.toLowerCase().includes("switch")
    ) {
      warnings.push({
        severity: "warning",
        shapeId: shape.id,
        message: `${shape.config?.hostname || shape.label || shape.shapeId}: Keine IP-Adresse konfiguriert`,
        fix: "Doppelklick → Netzwerk Tab → IP-Adresse eingeben",
      });
    }

    // Check gateway reachability
    if (gw && ip) {
      if (!isSameSubnet(ip, gw, mask)) {
        warnings.push({
          severity: "error",
          shapeId: shape.id,
          message: `${shape.config?.hostname || shape.label || shape.shapeId}: Gateway ${gw} ist nicht im selben Subnetz (${getNetworkAddress(ip, mask)}/${maskToCidr(ipToNumber(mask).toString() === mask ? mask : mask)})`,
          fix: `Gateway muss im Netz ${getNetworkAddress(ip, mask)} liegen`,
        });
      }
      // Check gateway exists
      const gwExists = shapes.some((s) => getIp(s) === gw);
      if (!gwExists) {
        warnings.push({
          severity: "error",
          shapeId: shape.id,
          message: `${shape.config?.hostname || shape.label || shape.shapeId}: Gateway ${gw} existiert nicht im Netzwerk`,
          fix: "Einen Router/Gateway mit dieser IP-Adresse platzieren",
        });
      }
    }

    // Duplicate IP check
    if (ip) {
      const duplicates = shapes.filter(
        (s) => s.id !== shape.id && getIp(s) === ip,
      );
      if (duplicates.length > 0) {
        warnings.push({
          severity: "error",
          shapeId: shape.id,
          message: `IP-Konflikt: ${ip} wird von mehreren Geräten verwendet`,
          fix: "Eindeutige IP-Adressen vergeben",
        });
      }
    }

    // Interface down but has connections
    if (shape.config?.interfaces) {
      const connectedPorts = connections.filter(
        (c) => c.sourceShapeId === shape.id || c.targetShapeId === shape.id,
      );
      if (
        connectedPorts.length > 0 &&
        shape.config.interfaces.every((i) => i.status !== "up")
      ) {
        warnings.push({
          severity: "warning",
          shapeId: shape.id,
          message: `${shape.config?.hostname || shape.label || shape.shapeId}: Alle Interfaces sind down`,
          fix: 'Terminal: "ip link set <interface> up"',
        });
      }
    }
  }

  // Check for isolated shapes (no connections)
  for (const shape of shapes) {
    const hasConnection = connections.some(
      (c) => c.sourceShapeId === shape.id || c.targetShapeId === shape.id,
    );
    if (!hasConnection) {
      warnings.push({
        severity: "info",
        shapeId: shape.id,
        message: `${shape.config?.hostname || shape.label || shape.shapeId}: Nicht mit dem Netzwerk verbunden`,
        fix: "Verbindungs-Tool verwenden um Kabel zu ziehen",
      });
    }
  }

  return warnings;
}

// Connection Compatibility & Auto-Validation Engine
// Determines which shapes can connect, recommended cable/connection types,
// and validates network topology.

import { CableType, DrawingObject, ShapeConfig } from "./types";
import { ConnectionType } from "./shape-properties";

// ============================================================
// Shape Roles & Categories
// ============================================================

export type DeviceRole =
  | "router"
  | "switch"
  | "firewall"
  | "loadbalancer"
  | "access-point"
  | "hub"
  | "modem"
  | "endpoint"
  | "server"
  | "storage"
  | "cloud"
  | "container"
  | "security"
  | "infrastructure"
  | "generic";

export function getDeviceRole(shapeId?: string): DeviceRole {
  if (!shapeId) return "generic";
  const id = shapeId.toLowerCase();

  if (id.includes("router") || id === "nat-gateway" || id === "internet-gateway") return "router";
  if (id.includes("switch") || id === "hub") return "switch";
  if (id.includes("firewall")) return "firewall";
  if (id.includes("loadbalancer")) return "loadbalancer";
  if (id.includes("access-point") || id === "wap") return "access-point";
  if (id === "hub") return "hub";
  if (id === "modem" || id === "dsl-modem") return "modem";
  if (id.includes("computer") || id.includes("laptop") || id.includes("smartphone") || id.includes("printer") || id.includes("ip-phone") || id.includes("tablet") || id.includes("workstation")) return "endpoint";
  if (id.includes("server") || id.includes("rack") || id.includes("virtualmachine") || id.includes("dns-server") || id.includes("dhcp-server") || id.includes("ad-server") || id.includes("mail-server") || id.includes("web-server") || id.includes("file-server") || id.includes("proxy")) return "server";
  if (id.includes("database") || id.includes("storage") || id.includes("harddisk") || id.includes("nas") || id.includes("san")) return "storage";
  if (id.includes("cloud") || id.includes("azure") || id.includes("aws")) return "cloud";
  if (id.includes("docker") || id.includes("container") || id.includes("kubernetes") || id.includes("pod")) return "container";
  if (id.includes("lock") || id.includes("shield") || id.includes("key") || id.includes("certificate") || id.includes("ids") || id.includes("ips")) return "security";
  if (id.includes("vpc") || id.includes("backbone") || id.includes("peering") || id.includes("transit") || id.includes("data-center") || id.includes("vpn") || id.includes("private-link") || id.includes("region") || id.includes("availability") || id.includes("edge-location") || id.includes("cdn")) return "infrastructure";

  return "generic";
}

// ============================================================
// Compatibility Matrix
// ============================================================

interface CompatibilityRule {
  allowed: boolean;
  recommendedConnection: ConnectionType;
  recommendedCable: CableType;
  reason?: string;
  warning?: string;
}

const DEFAULT_RULE: CompatibilityRule = {
  allowed: true,
  recommendedConnection: "ethernet",
  recommendedCable: "straight-through",
};

// Matrix: [source][target] → rule
const COMPATIBILITY: Record<string, Record<string, Partial<CompatibilityRule>>> = {
  router: {
    router: { recommendedCable: "crossover", recommendedConnection: "fiber" },
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    firewall: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    loadbalancer: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    modem: { recommendedCable: "straight-through", recommendedConnection: "serial" },
    server: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    endpoint: { recommendedCable: "straight-through", recommendedConnection: "ethernet", warning: "Endgeräte sollten über einen Switch verbunden werden" },
    cloud: { recommendedConnection: "vpn", recommendedCable: "fiber" },
    infrastructure: { recommendedConnection: "fiber", recommendedCable: "fiber" },
    "access-point": { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    hub: { recommendedCable: "straight-through", recommendedConnection: "ethernet", warning: "Hubs sind veraltet – besser Switch verwenden" },
  },
  switch: {
    switch: { recommendedCable: "crossover", recommendedConnection: "ethernet", warning: "Trunk-Verbindung konfigurieren für VLANs" },
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    firewall: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    server: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    endpoint: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    storage: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    "access-point": { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    hub: { recommendedCable: "crossover", recommendedConnection: "ethernet", warning: "Hubs sind veraltet" },
    loadbalancer: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
  },
  firewall: {
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    server: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    loadbalancer: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    cloud: { recommendedConnection: "vpn", recommendedCable: "fiber" },
  },
  endpoint: {
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    "access-point": { recommendedConnection: "wifi", recommendedCable: "straight-through" },
    hub: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    endpoint: { recommendedCable: "crossover", recommendedConnection: "ethernet", warning: "Direkte PC-zu-PC Verbindung – Crossover-Kabel nötig" },
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet", warning: "Endgeräte sollten über einen Switch verbunden werden" },
    server: { recommendedCable: "straight-through", recommendedConnection: "ethernet", warning: "Besser über Switch verbinden" },
  },
  server: {
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    server: { recommendedCable: "crossover", recommendedConnection: "ethernet" },
    storage: { recommendedCable: "fiber", recommendedConnection: "fiber" },
    loadbalancer: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    cloud: { recommendedConnection: "https", recommendedCable: "fiber" },
    container: { recommendedConnection: "api", recommendedCable: "straight-through" },
  },
  storage: {
    server: { recommendedCable: "fiber", recommendedConnection: "fiber" },
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    storage: { recommendedCable: "fiber", recommendedConnection: "fiber", warning: "Storage-Replikation" },
  },
  cloud: {
    cloud: { recommendedConnection: "vnet-peering", recommendedCable: "fiber" },
    router: { recommendedConnection: "vpn", recommendedCable: "fiber" },
    firewall: { recommendedConnection: "vpn", recommendedCable: "fiber" },
    server: { recommendedConnection: "https", recommendedCable: "fiber" },
    infrastructure: { recommendedConnection: "vnet-peering", recommendedCable: "fiber" },
  },
  container: {
    container: { recommendedConnection: "api", recommendedCable: "straight-through" },
    server: { recommendedConnection: "api", recommendedCable: "straight-through" },
    cloud: { recommendedConnection: "https", recommendedCable: "fiber" },
    storage: { recommendedConnection: "api", recommendedCable: "straight-through" },
  },
  "access-point": {
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    endpoint: { recommendedConnection: "wifi", recommendedCable: "straight-through" },
  },
  modem: {
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    infrastructure: { recommendedCable: "serial", recommendedConnection: "serial" },
  },
  loadbalancer: {
    server: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    switch: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    firewall: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    router: { recommendedCable: "straight-through", recommendedConnection: "ethernet" },
    cloud: { recommendedConnection: "https", recommendedCable: "fiber" },
    container: { recommendedConnection: "api", recommendedCable: "straight-through" },
  },
};

export function getConnectionCompatibility(
  sourceShapeId: string | undefined,
  targetShapeId: string | undefined,
): CompatibilityRule {
  const sourceRole = getDeviceRole(sourceShapeId);
  const targetRole = getDeviceRole(targetShapeId);

  const sourceRules = COMPATIBILITY[sourceRole];
  if (sourceRules) {
    const rule = sourceRules[targetRole];
    if (rule) return { ...DEFAULT_RULE, ...rule };
  }

  // Try reverse
  const targetRules = COMPATIBILITY[targetRole];
  if (targetRules) {
    const rule = targetRules[sourceRole];
    if (rule) return { ...DEFAULT_RULE, ...rule };
  }

  return DEFAULT_RULE;
}

// ============================================================
// Topology Validation
// ============================================================

export interface TopologyIssue {
  severity: "error" | "warning" | "info";
  shapeId?: string;
  connectionId?: string;
  message: string;
  suggestion?: string;
  autoFixable?: boolean;
}

interface ConnectionInfo {
  id: string;
  sourceId: string;
  targetId: string;
  connectionType?: ConnectionType;
  cableType?: CableType;
}

export function validateTopology(
  shapes: DrawingObject[],
  connections: ConnectionInfo[],
): TopologyIssue[] {
  const issues: TopologyIssue[] = [];
  const shapeMap = new Map(shapes.filter(s => s.type === "shape").map(s => [s.id, s]));

  // 1. Unconnected network devices
  const connectedShapes = new Set<string>();
  connections.forEach(c => {
    connectedShapes.add(c.sourceId);
    connectedShapes.add(c.targetId);
  });

  shapeMap.forEach((shape, id) => {
    const role = getDeviceRole(shape.shapeId);
    if (["router", "switch", "firewall", "server", "endpoint", "loadbalancer"].includes(role) && !connectedShapes.has(id)) {
      issues.push({
        severity: "warning",
        shapeId: id,
        message: `${shape.label || shape.shapeId} ist nicht verbunden`,
        suggestion: "Verbinde das Gerät mit dem Netzwerk",
      });
    }
  });

  // 2. Endpoints connected directly to routers (should go through switch)
  connections.forEach(conn => {
    const source = shapeMap.get(conn.sourceId);
    const target = shapeMap.get(conn.targetId);
    if (!source || !target) return;

    const sourceRole = getDeviceRole(source.shapeId);
    const targetRole = getDeviceRole(target.shapeId);

    if (
      (sourceRole === "endpoint" && targetRole === "router") ||
      (sourceRole === "router" && targetRole === "endpoint")
    ) {
      issues.push({
        severity: "warning",
        connectionId: conn.id,
        message: `Endgerät direkt am Router – besser über einen Switch verbinden`,
        suggestion: "Einen Switch zwischen Endgerät und Router platzieren",
      });
    }
  });

  // 3. Missing gateway on endpoints
  shapeMap.forEach((shape, id) => {
    const role = getDeviceRole(shape.shapeId);
    if (role === "endpoint" || role === "server") {
      if (shape.config?.ipAddress && !shape.config?.gateway) {
        issues.push({
          severity: "warning",
          shapeId: id,
          message: `${shape.label || shape.shapeId} hat eine IP aber kein Gateway`,
          suggestion: "Gateway-Adresse konfigurieren",
          autoFixable: true,
        });
      }
    }
  });

  // 4. Duplicate IPs
  const ipMap = new Map<string, string[]>();
  shapeMap.forEach((shape, id) => {
    const ip = shape.config?.ipAddress;
    if (ip) {
      const list = ipMap.get(ip) || [];
      list.push(id);
      ipMap.set(ip, list);
    }
    // Also check interfaces
    shape.config?.interfaces?.forEach(iface => {
      if (iface.ipAddress) {
        const list = ipMap.get(iface.ipAddress) || [];
        list.push(id);
        ipMap.set(iface.ipAddress, list);
      }
    });
  });

  ipMap.forEach((ids, ip) => {
    if (ids.length > 1) {
      issues.push({
        severity: "error",
        message: `Doppelte IP-Adresse ${ip} auf ${ids.length} Geräten`,
        suggestion: "Jedes Gerät braucht eine eindeutige IP",
      });
    }
  });

  // 5. Wrong cable type
  connections.forEach(conn => {
    const source = shapeMap.get(conn.sourceId);
    const target = shapeMap.get(conn.targetId);
    if (!source || !target) return;

    const compat = getConnectionCompatibility(source.shapeId, target.shapeId);
    if (conn.cableType && conn.cableType !== compat.recommendedCable) {
      const sourceRole = getDeviceRole(source.shapeId);
      const targetRole = getDeviceRole(target.shapeId);

      // Only warn for technically wrong cables
      if (
        (sourceRole === targetRole && (sourceRole === "switch" || sourceRole === "router" || sourceRole === "endpoint") && conn.cableType === "straight-through")
      ) {
        issues.push({
          severity: "warning",
          connectionId: conn.id,
          message: `Gleiche Gerätetypen benötigen ein Crossover-Kabel`,
          suggestion: `Empfohlen: ${compat.recommendedCable}`,
          autoFixable: true,
        });
      }
    }
  });

  // 6. Subnet mismatch on connected devices
  connections.forEach(conn => {
    const source = shapeMap.get(conn.sourceId);
    const target = shapeMap.get(conn.targetId);
    if (!source || !target) return;

    const srcIp = source.config?.ipAddress;
    const tgtIp = target.config?.ipAddress;
    const srcMask = source.config?.subnetMask;
    const tgtMask = target.config?.subnetMask;

    if (srcIp && tgtIp && srcMask && tgtMask) {
      const srcNet = getNetworkAddress(srcIp, srcMask);
      const tgtNet = getNetworkAddress(tgtIp, tgtMask);

      if (srcNet && tgtNet && srcNet !== tgtNet) {
        const sourceRole = getDeviceRole(source.shapeId);
        const targetRole = getDeviceRole(target.shapeId);

        // Routers are expected to bridge subnets
        if (sourceRole !== "router" && targetRole !== "router") {
          issues.push({
            severity: "error",
            connectionId: conn.id,
            message: `Unterschiedliche Subnetze: ${srcIp}/${srcMask} ↔ ${tgtIp}/${tgtMask}`,
            suggestion: "Geräte im gleichen Subnetz müssen die gleiche Netzwerkadresse haben",
          });
        }
      }
    }
  });

  // 7. No default gateway in network (no router)
  const hasRouter = [...shapeMap.values()].some(s => getDeviceRole(s.shapeId) === "router");
  const hasEndpoints = [...shapeMap.values()].some(s => getDeviceRole(s.shapeId) === "endpoint");
  if (hasEndpoints && !hasRouter) {
    issues.push({
      severity: "info",
      message: "Kein Router im Netzwerk – Geräte können nur lokal kommunizieren",
      suggestion: "Einen Router hinzufügen für Internetzugang",
    });
  }

  // 8. Switch without uplink
  shapeMap.forEach((shape, id) => {
    if (getDeviceRole(shape.shapeId) === "switch") {
      const switchConns = connections.filter(c => c.sourceId === id || c.targetId === id);
      const hasUplink = switchConns.some(c => {
        const otherId = c.sourceId === id ? c.targetId : c.sourceId;
        const other = shapeMap.get(otherId);
        if (!other) return false;
        const role = getDeviceRole(other.shapeId);
        return role === "router" || role === "firewall" || role === "switch";
      });

      if (!hasUplink && switchConns.length > 0) {
        issues.push({
          severity: "warning",
          shapeId: id,
          message: `${shape.label || "Switch"} hat keinen Uplink zu Router/Firewall`,
          suggestion: "Switch mit einem Router oder Firewall verbinden",
        });
      }
    }
  });

  return issues;
}

// ============================================================
// Auto-Configuration Helpers
// ============================================================

export interface AutoConfigSuggestion {
  shapeId: string;
  field: string;
  currentValue: string | undefined;
  suggestedValue: string;
  reason: string;
}

export function generateAutoConfig(
  shape: DrawingObject,
  allShapes: DrawingObject[],
  connections: ConnectionInfo[],
): AutoConfigSuggestion[] {
  const suggestions: AutoConfigSuggestion[] = [];
  const role = getDeviceRole(shape.shapeId);

  // Find connected shapes
  const connectedIds = connections
    .filter(c => c.sourceId === shape.id || c.targetId === shape.id)
    .map(c => c.sourceId === shape.id ? c.targetId : c.sourceId);

  const connectedShapes = connectedIds
    .map(id => allShapes.find(s => s.id === id))
    .filter((s): s is DrawingObject => !!s);

  // Find router in connected shapes
  const connectedRouter = connectedShapes.find(s => getDeviceRole(s.shapeId) === "router");

  // Suggest IP if missing
  if (!shape.config?.ipAddress && ["endpoint", "server", "router", "switch", "firewall"].includes(role)) {
    // Try to determine subnet from connected devices
    const connectedIps = connectedShapes
      .map(s => s.config?.ipAddress)
      .filter((ip): ip is string => !!ip);

    if (connectedIps.length > 0) {
      const refIp = connectedIps[0];
      const parts = refIp.split(".");
      if (parts.length === 4) {
        // Suggest next available IP in the subnet
        const existingLast = allShapes
          .map(s => s.config?.ipAddress)
          .filter((ip): ip is string => !!ip && ip.startsWith(`${parts[0]}.${parts[1]}.${parts[2]}.`))
          .map(ip => parseInt(ip.split(".")[3]))
          .filter(n => !isNaN(n));

        const maxLast = Math.max(1, ...existingLast);
        const nextIp = role === "router"
          ? `${parts[0]}.${parts[1]}.${parts[2]}.1`
          : `${parts[0]}.${parts[1]}.${parts[2]}.${Math.min(maxLast + 1, 254)}`;

        suggestions.push({
          shapeId: shape.id,
          field: "ipAddress",
          currentValue: undefined,
          suggestedValue: nextIp,
          reason: `Basierend auf verbundenem Gerät (${refIp})`,
        });
      }
    } else {
      // Default subnet per role
      const defaultIps: Record<string, string> = {
        router: "192.168.1.1",
        firewall: "192.168.1.1",
        switch: "192.168.1.2",
        server: "192.168.1.10",
        endpoint: "192.168.1.100",
      };
      if (defaultIps[role]) {
        suggestions.push({
          shapeId: shape.id,
          field: "ipAddress",
          currentValue: undefined,
          suggestedValue: defaultIps[role],
          reason: "Standard-IP für diesen Gerätetyp",
        });
      }
    }
  }

  // Suggest subnet mask if missing
  if (!shape.config?.subnetMask && shape.config?.ipAddress) {
    suggestions.push({
      shapeId: shape.id,
      field: "subnetMask",
      currentValue: undefined,
      suggestedValue: "255.255.255.0",
      reason: "Standard /24 Subnetz",
    });
  }

  // Suggest gateway if missing
  if (!shape.config?.gateway && role !== "router" && shape.config?.ipAddress) {
    if (connectedRouter?.config?.ipAddress) {
      suggestions.push({
        shapeId: shape.id,
        field: "gateway",
        currentValue: undefined,
        suggestedValue: connectedRouter.config.ipAddress,
        reason: `Gateway vom verbundenen Router (${connectedRouter.label || connectedRouter.shapeId})`,
      });
    } else {
      const ip = shape.config.ipAddress;
      const parts = ip.split(".");
      if (parts.length === 4) {
        suggestions.push({
          shapeId: shape.id,
          field: "gateway",
          currentValue: undefined,
          suggestedValue: `${parts[0]}.${parts[1]}.${parts[2]}.1`,
          reason: "Standard-Gateway (.1) im Subnetz",
        });
      }
    }
  }

  // Suggest hostname if missing
  if (!shape.config?.hostname) {
    const label = shape.label || shape.shapeId || "device";
    const hostname = label.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 15);
    suggestions.push({
      shapeId: shape.id,
      field: "hostname",
      currentValue: undefined,
      suggestedValue: hostname,
      reason: "Abgeleitet vom Label",
    });
  }

  return suggestions;
}

// ============================================================
// Recommended Default Ports per Device Role
// ============================================================

export function getDefaultPorts(shapeId?: string): { port: number; protocol: string; service: string; status: "open" | "closed" }[] {
  const role = getDeviceRole(shapeId);
  switch (role) {
    case "server":
      if (shapeId?.includes("web-server")) return [
        { port: 80, protocol: "TCP", service: "HTTP", status: "open" },
        { port: 443, protocol: "TCP", service: "HTTPS", status: "open" },
      ];
      if (shapeId?.includes("mail-server")) return [
        { port: 25, protocol: "TCP", service: "SMTP", status: "open" },
        { port: 143, protocol: "TCP", service: "IMAP", status: "open" },
        { port: 993, protocol: "TCP", service: "IMAPS", status: "open" },
      ];
      if (shapeId?.includes("dns-server")) return [
        { port: 53, protocol: "UDP", service: "DNS", status: "open" },
        { port: 53, protocol: "TCP", service: "DNS", status: "open" },
      ];
      if (shapeId?.includes("dhcp-server")) return [
        { port: 67, protocol: "UDP", service: "DHCP", status: "open" },
        { port: 68, protocol: "UDP", service: "DHCP", status: "open" },
      ];
      if (shapeId?.includes("file-server")) return [
        { port: 445, protocol: "TCP", service: "SMB", status: "open" },
        { port: 139, protocol: "TCP", service: "NetBIOS", status: "open" },
      ];
      if (shapeId?.includes("ad-server")) return [
        { port: 389, protocol: "TCP", service: "LDAP", status: "open" },
        { port: 636, protocol: "TCP", service: "LDAPS", status: "open" },
        { port: 88, protocol: "TCP", service: "Kerberos", status: "open" },
        { port: 53, protocol: "UDP", service: "DNS", status: "open" },
      ];
      if (shapeId?.includes("proxy")) return [
        { port: 3128, protocol: "TCP", service: "HTTP Proxy", status: "open" },
        { port: 8080, protocol: "TCP", service: "HTTP Alt", status: "open" },
      ];
      return [
        { port: 22, protocol: "TCP", service: "SSH", status: "open" },
        { port: 80, protocol: "TCP", service: "HTTP", status: "open" },
        { port: 443, protocol: "TCP", service: "HTTPS", status: "open" },
      ];
    case "firewall":
      return [
        { port: 443, protocol: "TCP", service: "HTTPS Mgmt", status: "open" },
        { port: 22, protocol: "TCP", service: "SSH", status: "open" },
      ];
    case "router":
      return [
        { port: 22, protocol: "TCP", service: "SSH", status: "open" },
        { port: 23, protocol: "TCP", service: "Telnet", status: "closed" },
        { port: 161, protocol: "UDP", service: "SNMP", status: "open" },
      ];
    case "switch":
      return [
        { port: 22, protocol: "TCP", service: "SSH", status: "open" },
        { port: 161, protocol: "UDP", service: "SNMP", status: "open" },
      ];
    case "storage":
      return [
        { port: 3260, protocol: "TCP", service: "iSCSI", status: "open" },
        { port: 2049, protocol: "TCP", service: "NFS", status: "open" },
      ];
    default:
      return [];
  }
}

// ============================================================
// Helpers
// ============================================================

function getNetworkAddress(ip: string, mask: string): string | null {
  const ipParts = ip.split(".").map(Number);
  const maskParts = mask.split(".").map(Number);
  if (ipParts.length !== 4 || maskParts.length !== 4) return null;
  if (ipParts.some(isNaN) || maskParts.some(isNaN)) return null;
  return ipParts.map((p, i) => (p & maskParts[i]).toString()).join(".");
}

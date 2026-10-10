import { DrawingObject, CanvasConnection, ShapeConfig } from "@/lib/types";
import {
  DeviceType,
  LinkType,
  LinkStatus,
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
  TopologySubnetZone,
} from "@/types/topology";

// ============================================================================
// Legacy Canvas → NetworkTopology Migration Engine
// ============================================================================

const LEGACY_SHAPE_TO_DEVICE_TYPE: Record<string, DeviceType> = {
  router: "router",
  switch: "switch-l2",
  "switch-l2": "switch-l2",
  "switch-l3": "switch-l3",
  loadbalancer: "switch-l3",
  computer: "pc",
  pc: "pc",
  client: "pc",
  workstation: "pc",
  server: "server",
  "web-server": "server",
  "database-server": "server",
  firewall: "firewall",
  "access-point": "access-point",
  ap: "access-point",
  wlc: "wlc",
  cloud: "cloud",
  gateway: "router",
};

const LEGACY_CONNECTION_TYPE_MAP: Record<string, LinkType> = {
  ethernet: "ethernet",
  fiber: "ethernet",
  serial: "serial",
  trunk: "trunk",
  etherchannel: "etherchannel",
  wifi: "wireless",
  wireless: "wireless",
  vpn: "serial",
};

export function migrateLegacyShapeToDevice(obj: DrawingObject): TopologyDevice | null {
  if (obj.type !== "shape") return null;

  const shapeId = (obj.shapeId || "router").toLowerCase();
  const deviceType: DeviceType = LEGACY_SHAPE_TO_DEVICE_TYPE[shapeId] || "router";

  const x = obj.startPoint ? obj.startPoint.x : 0;
  const y = obj.startPoint ? obj.startPoint.y : 0;
  const width = obj.shapeWidth || 80;
  const height = obj.shapeHeight || 60;

  // Extract IP / Interface configuration from legacy config object
  const interfaces: TopologyInterface[] = [];
  const cfg = obj.config as (ShapeConfig & { network?: Record<string, any> }) | undefined;
  const ipAddress = cfg?.ipAddress || cfg?.network?.ipAddress;
  const subnetMask = cfg?.subnetMask || cfg?.network?.subnetMask;
  const macAddress = cfg?.mac || cfg?.network?.macAddress || cfg?.network?.mac;
  const gateway = cfg?.gateway || cfg?.network?.gateway;
  const dnsServers = cfg?.dns
    ? (Array.isArray(cfg.dns) ? cfg.dns : [cfg.dns])
    : (cfg?.network?.dns ? (Array.isArray(cfg.network.dns) ? cfg.network.dns : [cfg.network.dns]) : undefined);

  if (ipAddress) {
    interfaces.push({
      id: "if-primary",
      name: deviceType === "router" ? "Gi0/0/0" : deviceType === "pc" ? "eth0" : "Vlan1",
      ip: ipAddress + (subnetMask ? ` (${subnetMask})` : ""),
      mac: macAddress,
      status: "up",
    });
  } else {
    // Generate standard default interface for the device type
    interfaces.push({
      id: "if-default",
      name: deviceType === "router" ? "Gi0/0/0" : deviceType === "pc" ? "eth0" : "Gi0/1",
      status: "up",
    });
  }

  return {
    id: obj.id,
    name: obj.label || `${deviceType.toUpperCase()}-${obj.id.slice(-4)}`,
    type: deviceType,
    x,
    y,
    width,
    height,
    interfaces,
    status: obj.status === "error" ? "error" : obj.status === "warning" ? "warning" : "active",
    label: obj.label,
    config: {
      hostname: obj.label || `${deviceType.toUpperCase()}-${obj.id.slice(-4)}`,
      defaultGateway: gateway,
      dnsServers: dnsServers,
    },
  };
}

export function migrateLegacyConnectionToLink(conn: CanvasConnection): TopologyLink {
  const linkType: LinkType =
    LEGACY_CONNECTION_TYPE_MAP[(conn.connectionType || "").toLowerCase()] || "ethernet";

  const status: LinkStatus =
    conn.status === "error"
      ? "down"
      : conn.status === "inactive"
        ? "down"
        : "up";

  return {
    id: conn.id,
    sourceDeviceId: conn.sourceShapeId,
    sourceInterfaceId: conn.sourcePort || "port-src",
    targetDeviceId: conn.targetShapeId,
    targetInterfaceId: conn.targetPort || "port-tgt",
    linkType,
    status,
    label: conn.label,
    bandwidth: conn.bandwidth || "1 Gbps",
    animated: conn.animated ?? false,
  };
}

export function migrateLegacyCanvasToTopology(
  objects: DrawingObject[],
  connections: CanvasConnection[],
  topologyMeta?: { id?: string; name?: string; description?: string }
): NetworkTopology {
  const devices: TopologyDevice[] = [];
  const subnetZones: TopologySubnetZone[] = [];

  for (const obj of objects) {
    if (obj.type === "shape") {
      const device = migrateLegacyShapeToDevice(obj);
      if (device) devices.push(device);
    } else if (obj.type === "rectangle" && obj.startPoint && obj.endPoint) {
      const x = Math.min(obj.startPoint.x, obj.endPoint.x);
      const y = Math.min(obj.startPoint.y, obj.endPoint.y);
      const width = Math.abs(obj.endPoint.x - obj.startPoint.x);
      const height = Math.abs(obj.endPoint.y - obj.startPoint.y);
      subnetZones.push({
        id: obj.id,
        name: obj.label || "Subnetz-Zone",
        cidr: obj.label || "192.168.0.0/24",
        color: obj.color || "#3B82F6",
        x,
        y,
        width,
        height,
      });
    }
  }

  // Filter links so both endpoints refer to existing migrated devices
  const deviceIdSet = new Set(devices.map((d) => d.id));
  const links: TopologyLink[] = connections
    .filter((c) => deviceIdSet.has(c.sourceShapeId) && deviceIdSet.has(c.targetShapeId))
    .map(migrateLegacyConnectionToLink);

  return {
    id: topologyMeta?.id || `topology-${Date.now()}`,
    name: topologyMeta?.name || "Migrierte Topologie",
    description: topologyMeta?.description || "Automatisch aus dem bestehenden Canvas migriert",
    version: "2.0",
    devices,
    links,
    subnetZones: subnetZones.length > 0 ? subnetZones : undefined,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Migration-Engine",
    },
  };
}

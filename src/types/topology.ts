import { z } from "zod";

// ============================================================================
// CCNA 200-301 Network Topology Data Model & TypeScript Types
// ============================================================================

export type DeviceType =
  | "router"
  | "switch-l2"
  | "switch-l3"
  | "firewall"
  | "access-point"
  | "wlc"
  | "server"
  | "pc"
  | "laptop"
  | "cloud";

export type InterfaceStatus = "up" | "down" | "admin-down";
export type InterfaceMode = "access" | "trunk" | "routed";
export type ChannelGroupMode = "on" | "active" | "passive" | "desirable" | "auto";

export type LinkType =
  | "ethernet"
  | "serial"
  | "trunk"
  | "etherchannel"
  | "wireless";

export type LinkStatus =
  | "up"
  | "down"
  | "admin-down"
  | "stp-forwarding"
  | "stp-blocking"
  | "stp-learning"
  | "stp-listening";

export interface TopologySubinterface {
  id: string;
  name: string; // e.g. "Gi0/0.10"
  vlan: number;
  ip?: string; // e.g. "192.168.10.1/24"
  description?: string;
  isShutdown?: boolean;
}

export interface InterfaceChannelGroup {
  id: number; // 1-6
  mode: ChannelGroupMode;
}

export interface TopologyInterface {
  id: string;
  name: string; // e.g. "Gi0/0", "Fa0/1"
  ip?: string; // e.g. "192.168.1.1/24"
  mac?: string; // e.g. "00:50:79:66:68:01"
  vlan?: number; // Access VLAN, e.g. 10
  allowedVlans?: number[]; // Trunk Allowed VLANs, e.g. [10, 20]
  nativeVlan?: number; // Trunk Native VLAN, e.g. 1
  mode?: InterfaceMode;
  status: InterfaceStatus;
  portRole?: "RP" | "DP" | "BLK" | "ALT";
  description?: string;
  channelGroup?: InterfaceChannelGroup;
  subinterfaces?: TopologySubinterface[];
  isShutdown?: boolean;
}

export interface DeviceSvi {
  vlan: number;
  ip: string;
  status?: "up" | "down" | "admin-down";
  description?: string;
}

export interface DevicePortChannel {
  id: number;
  mode: ChannelGroupMode;
  protocol?: "lacp" | "pagp" | "static";
  members: string[];
}

export interface DeviceConfig {
  hostname: string;
  domain?: string;
  defaultGateway?: string;
  dnsServers?: string[];
  ipRoutingEnabled?: boolean; // Für L3 Switch
  svis?: DeviceSvi[]; // Für L3 Switch
  portChannels?: DevicePortChannel[];
  routingProtocols?: string[]; // e.g. ["OSPF 1", "Static"]
  routingTable?: Array<{
    network: string; // "192.168.2.0/24"
    nextHop?: string; // "10.0.0.2"
    interface?: string; // "Gi0/0/1"
    metric?: number;
    adminDistance?: number;
    type: "C" | "S" | "O" | "B" | "L"; // Connected, Static, OSPF, BGP, Local
  }>;
  macAddressTable?: Array<{
    vlan: number;
    mac: string;
    port: string;
    type: "DYNAMIC" | "STATIC";
  }>;
  vlans?: Array<{
    id: number;
    name: string;
  }>;
  showOutputs?: Record<string, string>; // Pre-computed CLI outputs for device click panel
}

export interface TopologyDevice {
  id: string;
  name: string;
  type: DeviceType;
  x: number;
  y: number;
  width?: number; // Default: 80
  height?: number; // Default: 60
  interfaces: TopologyInterface[];
  config?: DeviceConfig;
  status?: "active" | "inactive" | "warning" | "error";
  label?: string;
}

export interface TopologyLink {
  id: string;
  sourceDeviceId: string;
  sourceInterfaceId: string;
  targetDeviceId: string;
  targetInterfaceId: string;
  linkType: LinkType;
  status: LinkStatus;
  label?: string;
  bandwidth?: string; // e.g. "1 Gbps", "100 Mbps"
  vlansAllowed?: number[]; // e.g. [10, 20, 30] for trunks
  animated?: boolean;
}

export interface TopologyVlan {
  id: number;
  name: string;
  color: string;
  subnet?: string;
}

export interface TopologySubnetZone {
  id: string;
  name: string;
  cidr: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TopologyAnnotationType =
  | "text"
  | "note"
  | "box"
  | "circle"
  | "arrow"
  | "line"
  | "freehand"
  | "callout";

export interface TopologyAnnotation {
  id: string;
  type: TopologyAnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  points?: Array<{ x: number; y: number }>;
  text?: string;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  targetDeviceId?: string;
  author?: string;
  createdAt?: string;
}

export interface NetworkTopology {
  id: string;
  name: string;
  description?: string;
  version: "2.0";
  category?: "fundamentals" | "switching" | "routing" | "security" | "services" | "wireless";
  devices: TopologyDevice[];
  links: TopologyLink[];
  vlans?: TopologyVlan[];
  subnetZones?: TopologySubnetZone[];
  annotations?: TopologyAnnotation[];
  unmapped?: unknown[];
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    author?: string;
    learningPathId?: string;
    topicId?: string;
  };
}

// ============================================================================
// Runtime Zod Validation Schema
// ============================================================================

export const topologySubinterfaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  vlan: z.number().int().min(1).max(4094),
  ip: z.string().optional(),
  description: z.string().optional(),
  isShutdown: z.boolean().optional(),
});

export const interfaceChannelGroupSchema = z.object({
  id: z.number().int().min(1).max(64),
  mode: z.enum(["on", "active", "passive", "desirable", "auto"]),
});

export const topologyInterfaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ip: z.string().optional(),
  mac: z.string().optional(),
  vlan: z.number().int().min(1).max(4094).optional(),
  allowedVlans: z.array(z.number().int().min(1).max(4094)).optional(),
  nativeVlan: z.number().int().min(1).max(4094).optional(),
  mode: z.enum(["access", "trunk", "routed"]).optional(),
  status: z.enum(["up", "down", "admin-down"]).default("up"),
  portRole: z.enum(["RP", "DP", "BLK", "ALT"]).optional(),
  description: z.string().optional(),
  channelGroup: interfaceChannelGroupSchema.optional(),
  subinterfaces: z.array(topologySubinterfaceSchema).optional(),
  isShutdown: z.boolean().optional(),
});

export const deviceSviSchema = z.object({
  vlan: z.number().int().min(1).max(4094),
  ip: z.string(),
  status: z.enum(["up", "down", "admin-down"]).optional(),
  description: z.string().optional(),
});

export const devicePortChannelSchema = z.object({
  id: z.number().int().min(1).max(64),
  mode: z.enum(["on", "active", "passive", "desirable", "auto"]),
  protocol: z.enum(["lacp", "pagp", "static"]).optional(),
  members: z.array(z.string()),
});

export const deviceConfigSchema = z.object({
  hostname: z.string(),
  domain: z.string().optional(),
  defaultGateway: z.string().optional(),
  dnsServers: z.array(z.string()).optional(),
  ipRoutingEnabled: z.boolean().optional(),
  svis: z.array(deviceSviSchema).optional(),
  portChannels: z.array(devicePortChannelSchema).optional(),
  routingProtocols: z.array(z.string()).optional(),
  routingTable: z
    .array(
      z.object({
        network: z.string(),
        nextHop: z.string().optional(),
        interface: z.string().optional(),
        metric: z.number().optional(),
        adminDistance: z.number().optional(),
        type: z.enum(["C", "S", "O", "B", "L"]),
      })
    )
    .optional(),
  macAddressTable: z
    .array(
      z.object({
        vlan: z.number().int(),
        mac: z.string(),
        port: z.string(),
        type: z.enum(["DYNAMIC", "STATIC"]),
      })
    )
    .optional(),
  vlans: z
    .array(
      z.object({
        id: z.number().int(),
        name: z.string(),
      })
    )
    .optional(),
  showOutputs: z.record(z.string(), z.string()).optional(),
});

export const topologyDeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "router",
    "switch-l2",
    "switch-l3",
    "firewall",
    "access-point",
    "wlc",
    "server",
    "pc",
    "laptop",
    "cloud",
  ]),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  interfaces: z.array(topologyInterfaceSchema).default([]),
  config: deviceConfigSchema.optional(),
  status: z.enum(["active", "inactive", "warning", "error"]).optional(),
  label: z.string().optional(),
});

export const topologyLinkSchema = z.object({
  id: z.string(),
  sourceDeviceId: z.string(),
  sourceInterfaceId: z.string(),
  targetDeviceId: z.string(),
  targetInterfaceId: z.string(),
  linkType: z.enum(["ethernet", "serial", "trunk", "etherchannel", "wireless"]),
  status: z.enum([
    "up",
    "down",
    "admin-down",
    "stp-forwarding",
    "stp-blocking",
    "stp-learning",
    "stp-listening",
  ]).default("up"),
  label: z.string().optional(),
  bandwidth: z.string().optional(),
  vlansAllowed: z.array(z.number().int()).optional(),
  animated: z.boolean().optional(),
});

export const topologyAnnotationSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "note", "box", "circle", "arrow", "line", "freehand", "callout"]),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  endX: z.number().optional(),
  endY: z.number().optional(),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  text: z.string().optional(),
  color: z.string().optional(),
  fillColor: z.string().optional(),
  strokeWidth: z.number().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  targetDeviceId: z.string().optional(),
  author: z.string().optional(),
  createdAt: z.string().optional(),
});

export const networkTopologySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.literal("2.0"),
  category: z
    .enum(["fundamentals", "switching", "routing", "security", "services", "wireless"])
    .optional(),
  devices: z.array(topologyDeviceSchema),
  links: z.array(topologyLinkSchema),
  vlans: z
    .array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        color: z.string(),
        subnet: z.string().optional(),
      })
    )
    .optional(),
  subnetZones: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        cidr: z.string(),
        color: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
      })
    )
    .optional(),
  annotations: z.array(topologyAnnotationSchema).optional(),
  unmapped: z.array(z.unknown()).optional(),
  metadata: z
    .object({
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
      author: z.string().optional(),
      learningPathId: z.string().optional(),
      topicId: z.string().optional(),
    })
    .optional(),
});

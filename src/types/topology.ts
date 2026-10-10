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
  | "cloud";

export type InterfaceStatus = "up" | "down" | "admin-down";
export type InterfaceMode = "access" | "trunk" | "routed";

export type LinkType =
  | "ethernet"
  | "serial"
  | "trunk"
  | "etherchannel"
  | "wireless";

export type LinkStatus =
  | "up"
  | "down"
  | "stp-forwarding"
  | "stp-blocking"
  | "stp-learning"
  | "stp-listening";

export interface TopologyInterface {
  id: string;
  name: string; // e.g. "Gi0/0/0", "Fa0/1"
  ip?: string; // e.g. "192.168.1.1/24"
  mac?: string; // e.g. "00:50:79:66:68:01"
  vlan?: number; // e.g. 10
  mode?: InterfaceMode;
  status: InterfaceStatus;
  description?: string;
}

export interface DeviceConfig {
  hostname: string;
  domain?: string;
  defaultGateway?: string;
  dnsServers?: string[];
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

export const topologyInterfaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ip: z.string().optional(),
  mac: z.string().optional(),
  vlan: z.number().int().min(1).max(4094).optional(),
  mode: z.enum(["access", "trunk", "routed"]).optional(),
  status: z.enum(["up", "down", "admin-down"]).default("up"),
  description: z.string().optional(),
});

export const deviceConfigSchema = z.object({
  hostname: z.string(),
  domain: z.string().optional(),
  defaultGateway: z.string().optional(),
  dnsServers: z.array(z.string()).optional(),
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

// Shape Properties System für interaktive IT-Komponenten
// Ermöglicht Simulation und didaktische Features

export type ShapeStatus =
  | "active"
  | "inactive"
  | "error"
  | "warning"
  | "pending";

export type NetworkProtocol =
  | "tcp"
  | "udp"
  | "icmp"
  | "http"
  | "https"
  | "ssh"
  | "rdp"
  | "ftp"
  | "dns"
  | "dhcp";

export type ConnectionType =
  | "ethernet"
  | "fiber"
  | "wifi"
  | "serial"
  | "usb"
  | "api"
  | "https"
  | "ssh"
  | "vpn"
  | "vnet-peering";

// Basis-Properties für alle Shapes
export interface BaseShapeProperties {
  name: string;
  description?: string;
  status: ShapeStatus;
  tags?: string[];
}

// Netzwerk-Gerät Properties
export interface NetworkDeviceProperties extends BaseShapeProperties {
  type: "network";
  hostname?: string;
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
  macAddress?: string;
  ports?: NetworkPort[];
  routingTable?: RoutingEntry[];
  vlan?: number;
}

export interface NetworkPort {
  id: string;
  number: number;
  name: string;
  status: "up" | "down" | "admin-down";
  speed: "10M" | "100M" | "1G" | "10G" | "25G" | "40G" | "100G";
  duplex: "full" | "half" | "auto";
  vlan?: number;
}

export interface RoutingEntry {
  network: string;
  mask: string;
  nextHop: string;
  interface: string;
  metric: number;
}

// Server Properties
export interface ServerProperties extends BaseShapeProperties {
  type: "server";
  hostname?: string;
  os?: string;
  ipAddress?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  services?: ServiceInfo[];
}

export interface ServiceInfo {
  name: string;
  port: number;
  protocol: NetworkProtocol;
  status: "running" | "stopped" | "failed";
}

// Cloud Resource Properties
export interface CloudResourceProperties extends BaseShapeProperties {
  type: "cloud";
  provider: "azure" | "aws" | "gcp";
  resourceType: string;
  region?: string;
  resourceGroup?: string;
  sku?: string;
  cost?: {
    hourly: number;
    monthly: number;
    currency: string;
  };
  publicEndpoint?: string;
  privateEndpoint?: string;
}

// Azure-spezifische Properties
export interface AzureVMProperties extends CloudResourceProperties {
  resourceType: "virtual-machine";
  vmSize?: string;
  image?: string;
  availabilityZone?: number;
  publicIP?: string;
  privateIP?: string;
  nsg?: string;
  vnet?: string;
  subnet?: string;
}

export interface AzureVNetProperties extends CloudResourceProperties {
  resourceType: "virtual-network";
  addressSpace?: string[];
  subnets?: {
    name: string;
    addressPrefix: string;
    nsg?: string;
  }[];
  dnsServers?: string[];
  peerings?: string[];
}

// Container Properties
export interface ContainerProperties extends BaseShapeProperties {
  type: "container";
  image?: string;
  tag?: string;
  ports?: { container: number; host: number; protocol: "tcp" | "udp" }[];
  environment?: Record<string, string>;
  volumes?: { source: string; target: string }[];
  resources?: {
    cpuLimit?: string;
    memoryLimit?: string;
  };
}

// Kubernetes Properties
export interface KubernetesResourceProperties extends BaseShapeProperties {
  type: "kubernetes";
  kind:
    | "Pod"
    | "Deployment"
    | "Service"
    | "Ingress"
    | "ConfigMap"
    | "Secret"
    | "PersistentVolume";
  namespace?: string;
  labels?: Record<string, string>;
  replicas?: number;
  selector?: Record<string, string>;
}

// Connection zwischen Shapes
export interface ShapeConnection {
  id: string;
  sourceShapeId: string;
  sourcePort: string; // Position: 'top' | 'right' | 'bottom' | 'left'
  targetShapeId: string;
  targetPort: string;
  connectionType: ConnectionType;
  bandwidth?: string;
  latency?: number; // in ms
  status: "active" | "inactive" | "error";
  animated?: boolean;
  label?: string;
  bidirectional?: boolean;
  protocol?: NetworkProtocol;
  color?: string;
}

// Union Type für alle Properties
export type ShapeProperties =
  | NetworkDeviceProperties
  | ServerProperties
  | CloudResourceProperties
  | AzureVMProperties
  | AzureVNetProperties
  | ContainerProperties
  | KubernetesResourceProperties
  | BaseShapeProperties;

// Property-Definition für UI-Rendering
export interface PropertyField {
  key: string;
  label: string;
  type:
    | "text"
    | "number"
    | "select"
    | "boolean"
    | "ip"
    | "color"
    | "textarea"
    | "tags";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  validation?: RegExp;
  group?: string;
  helpText?: string;
}

// Property-Schema pro Shape-Kategorie
export const SHAPE_PROPERTY_SCHEMAS: Record<string, PropertyField[]> = {
  network: [
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    { key: "hostname", label: "Hostname", type: "text", group: "Netzwerk" },
    {
      key: "ipAddress",
      label: "IP-Adresse",
      type: "ip",
      placeholder: "192.168.1.1",
      group: "Netzwerk",
    },
    {
      key: "subnetMask",
      label: "Subnetzmaske",
      type: "ip",
      placeholder: "255.255.255.0",
      group: "Netzwerk",
    },
    { key: "gateway", label: "Gateway", type: "ip", group: "Netzwerk" },
    {
      key: "macAddress",
      label: "MAC-Adresse",
      type: "text",
      placeholder: "AA:BB:CC:DD:EE:FF",
      group: "Netzwerk",
    },
    { key: "vlan", label: "VLAN", type: "number", group: "Netzwerk" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Aktiv" },
        { value: "inactive", label: "○ Inaktiv" },
        { value: "error", label: "● Fehler" },
        { value: "warning", label: "● Warnung" },
      ],
      group: "Status",
    },
    {
      key: "description",
      label: "Beschreibung",
      type: "textarea",
      group: "Allgemein",
    },
  ],
  server: [
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    { key: "hostname", label: "Hostname", type: "text", group: "System" },
    {
      key: "os",
      label: "Betriebssystem",
      type: "select",
      options: [
        { value: "windows-server-2022", label: "Windows Server 2022" },
        { value: "windows-server-2019", label: "Windows Server 2019" },
        { value: "ubuntu-22.04", label: "Ubuntu 22.04 LTS" },
        { value: "ubuntu-20.04", label: "Ubuntu 20.04 LTS" },
        { value: "debian-12", label: "Debian 12" },
        { value: "rhel-9", label: "RHEL 9" },
        { value: "centos-stream-9", label: "CentOS Stream 9" },
      ],
      group: "System",
    },
    { key: "ipAddress", label: "IP-Adresse", type: "ip", group: "Netzwerk" },
    {
      key: "cpu",
      label: "CPU",
      type: "text",
      placeholder: "4 vCPU",
      group: "Hardware",
    },
    {
      key: "memory",
      label: "RAM",
      type: "text",
      placeholder: "16 GB",
      group: "Hardware",
    },
    {
      key: "storage",
      label: "Storage",
      type: "text",
      placeholder: "500 GB SSD",
      group: "Hardware",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Running" },
        { value: "inactive", label: "○ Stopped" },
        { value: "pending", label: "◐ Starting" },
        { value: "error", label: "● Error" },
      ],
      group: "Status",
    },
  ],
  cloud: [
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    {
      key: "region",
      label: "Region",
      type: "select",
      options: [
        { value: "westeurope", label: "West Europe" },
        { value: "northeurope", label: "North Europe" },
        { value: "germanywestcentral", label: "Germany West Central" },
        { value: "eastus", label: "East US" },
        { value: "westus", label: "West US" },
      ],
      group: "Cloud",
    },
    {
      key: "resourceGroup",
      label: "Resource Group",
      type: "text",
      group: "Cloud",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Deployed" },
        { value: "pending", label: "◐ Deploying" },
        { value: "inactive", label: "○ Deallocated" },
        { value: "error", label: "● Failed" },
      ],
      group: "Status",
    },
  ],
  azure: [
    {
      key: "name",
      label: "Resource Name",
      type: "text",
      required: true,
      group: "Azure",
    },
    {
      key: "resourceGroup",
      label: "Resource Group",
      type: "text",
      group: "Azure",
    },
    {
      key: "region",
      label: "Region",
      type: "select",
      options: [
        { value: "westeurope", label: "West Europe" },
        { value: "northeurope", label: "North Europe" },
        { value: "germanywestcentral", label: "Germany West Central" },
        { value: "switzerlandnorth", label: "Switzerland North" },
      ],
      group: "Azure",
    },
    {
      key: "vmSize",
      label: "VM Size",
      type: "select",
      options: [
        { value: "Standard_B1s", label: "B1s (1 vCPU, 1 GB)" },
        { value: "Standard_B2s", label: "B2s (2 vCPU, 4 GB)" },
        { value: "Standard_D2s_v5", label: "D2s v5 (2 vCPU, 8 GB)" },
        { value: "Standard_D4s_v5", label: "D4s v5 (4 vCPU, 16 GB)" },
      ],
      group: "Compute",
    },
    { key: "publicIP", label: "Public IP", type: "ip", group: "Netzwerk" },
    { key: "privateIP", label: "Private IP", type: "ip", group: "Netzwerk" },
    { key: "vnet", label: "Virtual Network", type: "text", group: "Netzwerk" },
    { key: "subnet", label: "Subnet", type: "text", group: "Netzwerk" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Running" },
        { value: "inactive", label: "○ Stopped" },
        { value: "pending", label: "◐ Starting" },
        { value: "error", label: "● Failed" },
      ],
      group: "Status",
    },
  ],
  aws: [
    {
      key: "name",
      label: "Resource Name",
      type: "text",
      required: true,
      group: "AWS",
    },
    {
      key: "region",
      label: "Region",
      type: "select",
      options: [
        { value: "eu-central-1", label: "EU (Frankfurt)" },
        { value: "eu-west-1", label: "EU (Ireland)" },
        { value: "us-east-1", label: "US East (N. Virginia)" },
        { value: "us-west-2", label: "US West (Oregon)" },
      ],
      group: "AWS",
    },
    {
      key: "instanceType",
      label: "Instance Type",
      type: "select",
      options: [
        { value: "t3.micro", label: "t3.micro (1 vCPU, 1 GB)" },
        { value: "t3.small", label: "t3.small (2 vCPU, 2 GB)" },
        { value: "t3.medium", label: "t3.medium (2 vCPU, 4 GB)" },
        { value: "m5.large", label: "m5.large (2 vCPU, 8 GB)" },
      ],
      group: "Compute",
    },
    { key: "vpc", label: "VPC", type: "text", group: "Netzwerk" },
    {
      key: "securityGroup",
      label: "Security Group",
      type: "text",
      group: "Netzwerk",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Running" },
        { value: "inactive", label: "○ Stopped" },
        { value: "pending", label: "◐ Pending" },
        { value: "error", label: "● Terminated" },
      ],
      group: "Status",
    },
  ],
  containers: [
    {
      key: "name",
      label: "Container Name",
      type: "text",
      required: true,
      group: "Container",
    },
    {
      key: "image",
      label: "Image",
      type: "text",
      placeholder: "nginx:latest",
      group: "Container",
    },
    {
      key: "tag",
      label: "Tag",
      type: "text",
      placeholder: "latest",
      group: "Container",
    },
    {
      key: "cpuLimit",
      label: "CPU Limit",
      type: "text",
      placeholder: "0.5",
      group: "Resources",
    },
    {
      key: "memoryLimit",
      label: "Memory Limit",
      type: "text",
      placeholder: "512Mi",
      group: "Resources",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Running" },
        { value: "inactive", label: "○ Stopped" },
        { value: "pending", label: "◐ Creating" },
        { value: "error", label: "● Error" },
      ],
      group: "Status",
    },
  ],
  infrastructure: [
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    {
      key: "description",
      label: "Beschreibung",
      type: "textarea",
      group: "Allgemein",
    },
    { key: "region", label: "Region", type: "text", group: "Infrastruktur" },
    {
      key: "availabilityZone",
      label: "Availability Zone",
      type: "text",
      group: "Infrastruktur",
    },
    {
      key: "cidr",
      label: "CIDR Block",
      type: "text",
      placeholder: "10.0.0.0/16",
      group: "Netzwerk",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Active" },
        { value: "inactive", label: "○ Inactive" },
        { value: "pending", label: "◐ Provisioning" },
      ],
      group: "Status",
    },
  ],
  security: [
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    {
      key: "type",
      label: "Security Type",
      type: "select",
      options: [
        { value: "firewall", label: "Firewall" },
        { value: "waf", label: "Web Application Firewall" },
        { value: "ids", label: "Intrusion Detection" },
        { value: "ips", label: "Intrusion Prevention" },
        { value: "vpn", label: "VPN Gateway" },
      ],
      group: "Security",
    },
    { key: "rules", label: "Regeln", type: "number", group: "Security" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Aktiv" },
        { value: "warning", label: "● Warnung" },
        { value: "error", label: "● Alarm" },
      ],
      group: "Status",
    },
  ],
  storage: [
    {
      key: "name",
      label: "Name",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    {
      key: "type",
      label: "Storage Type",
      type: "select",
      options: [
        { value: "block", label: "Block Storage" },
        { value: "object", label: "Object Storage" },
        { value: "file", label: "File Storage" },
        { value: "database", label: "Database" },
      ],
      group: "Storage",
    },
    {
      key: "capacity",
      label: "Kapazität",
      type: "text",
      placeholder: "500 GB",
      group: "Storage",
    },
    { key: "iops", label: "IOPS", type: "number", group: "Performance" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "● Online" },
        { value: "inactive", label: "○ Offline" },
        { value: "warning", label: "● Degraded" },
        { value: "error", label: "● Failed" },
      ],
      group: "Status",
    },
  ],
  diagrams: [
    {
      key: "name",
      label: "Label",
      type: "text",
      required: true,
      group: "Allgemein",
    },
    {
      key: "description",
      label: "Beschreibung",
      type: "textarea",
      group: "Allgemein",
    },
  ],
  arrows: [
    { key: "label", label: "Label", type: "text", group: "Verbindung" },
    {
      key: "protocol",
      label: "Protokoll",
      type: "select",
      options: [
        { value: "tcp", label: "TCP" },
        { value: "udp", label: "UDP" },
        { value: "http", label: "HTTP" },
        { value: "https", label: "HTTPS" },
        { value: "ssh", label: "SSH" },
      ],
      group: "Verbindung",
    },
    {
      key: "bandwidth",
      label: "Bandbreite",
      type: "text",
      placeholder: "1 Gbps",
      group: "Verbindung",
    },
  ],
};

// Default Properties für neue Shapes
export function getDefaultProperties(
  category: string,
): Partial<ShapeProperties> {
  return {
    name: "Neues Element",
    status: "active" as ShapeStatus,
    description: "",
  };
}

// Status-Farben
export const STATUS_COLORS: Record<ShapeStatus, string> = {
  active: "#10B981", // Green
  inactive: "#6B7280", // Gray
  error: "#EF4444", // Red
  warning: "#F59E0B", // Orange
  pending: "#3B82F6", // Blue
};

// Connection Type Farben
export const CONNECTION_COLORS: Record<ConnectionType, string> = {
  ethernet: "#3B82F6",
  fiber: "#F59E0B",
  wifi: "#10B981",
  serial: "#6B7280",
  usb: "#8B5CF6",
  api: "#EC4899",
  https: "#10B981",
  ssh: "#EF4444",
  vpn: "#6366F1",
  "vnet-peering": "#0078D4",
};

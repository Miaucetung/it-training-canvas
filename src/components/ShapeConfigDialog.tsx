import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  generateMAC,
  getDefaultInterfaces,
  getDefaultRoutingTable,
} from "@/lib/networking-engine";
import {
  ACLRule,
  DHCPPool,
  DNSRecord,
  DrawingObject,
  NATRule,
  NetworkInterface,
  ShapeConfig,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Cloud,
  Cpu,
  Database,
  GlobeSimple,
  HardDrive,
  Network,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";

interface ShapeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shape: DrawingObject | null;
  onSave: (
    shapeId: string,
    config: ShapeConfig,
    status: DrawingObject["status"],
  ) => void;
  theme: "light" | "dark";
}

// Determine config type based on shapeId
function getShapeType(
  shapeId?: string,
): "network" | "cloud" | "server" | "container" | "generic" {
  if (!shapeId) return "generic";
  const id = shapeId.toLowerCase();
  if (
    id.includes("router") ||
    id.includes("switch") ||
    id.includes("firewall") ||
    id.includes("network") ||
    id.includes("access-point") ||
    id.includes("hub") ||
    id.includes("modem") ||
    id.includes("loadbalancer") ||
    id === "computer" ||
    id === "laptop" ||
    id === "smartphone" ||
    id === "tablet" ||
    id === "ip-phone" ||
    id === "printer"
  ) {
    return "network";
  }
  if (
    id.includes("azure") ||
    id.includes("aws") ||
    id.includes("cloud") ||
    id.includes("vm")
  ) {
    return "cloud";
  }
  if (
    id.includes("server") ||
    id.includes("database") ||
    id.includes("storage") ||
    id.includes("proxy") ||
    id.includes("nas") ||
    id.includes("san") ||
    id === "rack"
  ) {
    return "server";
  }
  if (
    id.includes("docker") ||
    id.includes("kubernetes") ||
    id.includes("container") ||
    id.includes("pod")
  ) {
    return "container";
  }
  return "generic";
}

export function ShapeConfigDialog({
  open,
  onOpenChange,
  shape,
  onSave,
  theme,
}: ShapeConfigDialogProps) {
  // ALL hooks MUST be called before any conditional return
  const [config, setConfig] = useState<ShapeConfig>(shape?.config || {});
  const [status, setStatus] = useState<DrawingObject["status"]>(
    shape?.status || "stopped",
  );
  const [newPort, setNewPort] = useState({
    port: 80,
    protocol: "TCP",
    service: "HTTP",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newRoute, setNewRoute] = useState<{
    dest: string;
    mask: string;
    nh: string;
  }>({
    dest: "",
    mask: "255.255.255.0",
    nh: "",
  });
  const [newVlan, setNewVlan] = useState<{ id: number; name: string }>({
    id: 10,
    name: "",
  });
  const [newAclRule, setNewAclRule] = useState<Partial<ACLRule>>({
    action: "permit",
    protocol: "ip",
    sourceIp: "any",
    destinationIp: "any",
  });
  const [newNatRule, setNewNatRule] = useState<Partial<NATRule>>({
    type: "static",
    insideLocal: "",
    insideGlobal: "",
  });
  const [newDnsRecord, setNewDnsRecord] = useState<Partial<DNSRecord>>({
    name: "",
    type: "A",
    value: "",
    ttl: 3600,
  });

  if (!shape) return null;

  const shapeType = getShapeType(shape.shapeId);

  const isValidIp = (ip: string) =>
    !ip || /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(ip);
  const isValidPort = (port: number) => port >= 0 && port <= 65535;

  const handleSave = () => {
    const errors: string[] = [];
    if (config.ipAddress && !isValidIp(config.ipAddress))
      errors.push("Ungültige IP-Adresse");
    if (config.subnetMask && !isValidIp(config.subnetMask))
      errors.push("Ungültige Subnetzmaske");
    if (config.gateway && !isValidIp(config.gateway))
      errors.push("Ungültiges Gateway");
    if (config.ports?.some((p) => !isValidPort(p.port)))
      errors.push("Port muss zwischen 0 und 65535 liegen");
    if (config.containerPort && !isValidPort(config.containerPort))
      errors.push("Container-Port muss zwischen 0 und 65535 liegen");
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    onSave(shape.id, config, status);
  };

  const addPort = () => {
    const ports = config.ports || [];
    setConfig({
      ...config,
      ports: [...ports, { ...newPort, status: "open" as const }],
    });
    setNewPort({ port: 80, protocol: "TCP", service: "HTTP" });
  };

  const removePort = (index: number) => {
    const ports = [...(config.ports || [])];
    ports.splice(index, 1);
    setConfig({ ...config, ports });
  };

  const isNetworkDevice = shapeType === "network" || shapeType === "server";
  const isSwitch = shape.shapeId?.toLowerCase().includes("switch");
  const isRouter =
    shape.shapeId?.toLowerCase().includes("router") ||
    shape.shapeId?.toLowerCase().includes("gateway") ||
    shape.shapeId?.toLowerCase().includes("firewall");

  // Initialize interfaces if not present
  const initInterfaces = () => {
    if (!config.interfaces || config.interfaces.length === 0) {
      setConfig({
        ...config,
        interfaces: getDefaultInterfaces(shape.shapeId || ""),
      });
    }
  };

  // Initialize routing table
  const initRouting = () => {
    if (!config.routingTable || config.routingTable.entries.length === 0) {
      setConfig({
        ...config,
        routingTable: getDefaultRoutingTable(shape),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl max-h-[90vh] overflow-y-auto",
          theme === "dark" ? "bg-slate-900 border-slate-700" : "bg-white",
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {shapeType === "network" && (
              <Network size={24} className="text-blue-500" />
            )}
            {shapeType === "cloud" && (
              <Cloud size={24} className="text-sky-500" />
            )}
            {shapeType === "server" && (
              <Database size={24} className="text-purple-500" />
            )}
            {shapeType === "container" && (
              <Cpu size={24} className="text-cyan-500" />
            )}
            {shapeType === "generic" && (
              <GlobeSimple size={24} className="text-slate-500" />
            )}
            <span>{shape.label || shape.shapeId || "Konfiguration"}</span>
            <Badge
              variant="outline"
              className={cn(
                status === "running" && "border-green-500 text-green-500",
                status === "stopped" && "border-slate-500 text-slate-500",
                status === "error" && "border-red-500 text-red-500",
                status === "pending" && "border-amber-500 text-amber-500",
                status === "warning" && "border-orange-500 text-orange-500",
              )}
            >
              {status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Konfigurieren Sie die Eigenschaften und den Status dieses Elements.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="flex flex-wrap h-auto gap-1 w-full justify-start bg-transparent p-0">
            <TabsTrigger value="general" className="text-xs">
              Allgemein
            </TabsTrigger>
            {isNetworkDevice && (
              <TabsTrigger value="network" className="text-xs">
                Netzwerk
              </TabsTrigger>
            )}
            {(shapeType === "cloud" || shapeType === "server") && (
              <TabsTrigger value="resources" className="text-xs">
                Ressourcen
              </TabsTrigger>
            )}
            {shapeType === "container" && (
              <TabsTrigger value="container" className="text-xs">
                Container
              </TabsTrigger>
            )}
            <TabsTrigger value="ports" className="text-xs">
              Ports
            </TabsTrigger>
            {isNetworkDevice && (
              <>
                <TabsTrigger
                  value="interfaces"
                  className="text-xs"
                  onClick={initInterfaces}
                >
                  Interfaces
                </TabsTrigger>
                <TabsTrigger
                  value="routing"
                  className="text-xs"
                  onClick={initRouting}
                >
                  Routing
                </TabsTrigger>
                {(isSwitch || isRouter) && (
                  <TabsTrigger value="vlans" className="text-xs">
                    VLANs
                  </TabsTrigger>
                )}
                {isRouter && (
                  <>
                    <TabsTrigger value="dhcp" className="text-xs">
                      DHCP
                    </TabsTrigger>
                    <TabsTrigger value="dns" className="text-xs">
                      DNS
                    </TabsTrigger>
                    <TabsTrigger value="acl" className="text-xs">
                      ACL
                    </TabsTrigger>
                    <TabsTrigger value="nat" className="text-xs">
                      NAT
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger value="stp" className="text-xs">
                  STP
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as DrawingObject["status"])}
                >
                  <SelectTrigger
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectItem value="running">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Running
                      </span>
                    </SelectItem>
                    <SelectItem value="stopped">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        Stopped
                      </span>
                    </SelectItem>
                    <SelectItem value="error">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Error
                      </span>
                    </SelectItem>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Pending
                      </span>
                    </SelectItem>
                    <SelectItem value="warning">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        Warning
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hostname</Label>
                <Input
                  value={config.hostname || ""}
                  onChange={(e) =>
                    setConfig({ ...config, hostname: e.target.value })
                  }
                  placeholder="z.B. server-01"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={config.description || ""}
                onChange={(e) =>
                  setConfig({ ...config, description: e.target.value })
                }
                placeholder="Beschreibung des Elements..."
                className={cn(
                  "min-h-[80px]",
                  theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                value={config.tags?.join(", ") || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="production, web, frontend (kommagetrennt)"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                }
              />
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IP-Adresse</Label>
                <Input
                  value={config.ipAddress || ""}
                  onChange={(e) =>
                    setConfig({ ...config, ipAddress: e.target.value })
                  }
                  placeholder="192.168.1.1"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Subnetzmaske</Label>
                <Input
                  value={config.subnetMask || ""}
                  onChange={(e) =>
                    setConfig({ ...config, subnetMask: e.target.value })
                  }
                  placeholder="255.255.255.0"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Gateway</Label>
                <Input
                  value={config.gateway || ""}
                  onChange={(e) =>
                    setConfig({ ...config, gateway: e.target.value })
                  }
                  placeholder="192.168.1.254"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>MAC-Adresse</Label>
                <Input
                  value={config.mac || ""}
                  onChange={(e) =>
                    setConfig({ ...config, mac: e.target.value })
                  }
                  placeholder="00:1A:2B:3C:4D:5E"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>DNS-Server</Label>
              <Input
                value={config.dns?.join(", ") || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dns: e.target.value
                      .split(",")
                      .map((d) => d.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="8.8.8.8, 8.8.4.4"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                }
              />
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={config.region || ""}
                  onValueChange={(v) => setConfig({ ...config, region: v })}
                >
                  <SelectTrigger
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                    <SelectItem value="us-east-1">
                      US East (N. Virginia)
                    </SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="ap-southeast-1">
                      Asia Pacific (Singapore)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Instance Type</Label>
                <Select
                  value={config.instanceType || ""}
                  onValueChange={(v) =>
                    setConfig({ ...config, instanceType: v })
                  }
                >
                  <SelectTrigger
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectItem value="t3.micro">
                      t3.micro (1 vCPU, 1GB)
                    </SelectItem>
                    <SelectItem value="t3.small">
                      t3.small (2 vCPU, 2GB)
                    </SelectItem>
                    <SelectItem value="t3.medium">
                      t3.medium (2 vCPU, 4GB)
                    </SelectItem>
                    <SelectItem value="t3.large">
                      t3.large (2 vCPU, 8GB)
                    </SelectItem>
                    <SelectItem value="m5.large">
                      m5.large (2 vCPU, 8GB)
                    </SelectItem>
                    <SelectItem value="m5.xlarge">
                      m5.xlarge (4 vCPU, 16GB)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Cpu size={14} /> CPU (vCPU)
                </Label>
                <Input
                  type="number"
                  value={config.cpu || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cpu: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="2"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Database size={14} /> RAM (GB)
                </Label>
                <Input
                  type="number"
                  value={config.memory || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      memory: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="4"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <HardDrive size={14} /> Storage (GB)
                </Label>
                <Input
                  type="number"
                  value={config.storage || ""}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      storage: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="100"
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Betriebssystem</Label>
              <Select
                value={config.os || ""}
                onValueChange={(v) => setConfig({ ...config, os: v })}
              >
                <SelectTrigger
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                >
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                >
                  <SelectItem value="ubuntu-22.04">Ubuntu 22.04 LTS</SelectItem>
                  <SelectItem value="ubuntu-20.04">Ubuntu 20.04 LTS</SelectItem>
                  <SelectItem value="debian-11">Debian 11</SelectItem>
                  <SelectItem value="centos-8">CentOS 8</SelectItem>
                  <SelectItem value="rhel-8">RHEL 8</SelectItem>
                  <SelectItem value="windows-2022">
                    Windows Server 2022
                  </SelectItem>
                  <SelectItem value="windows-2019">
                    Windows Server 2019
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Container Tab */}
          <TabsContent value="container" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Image</Label>
              <Input
                value={config.image || ""}
                onChange={(e) =>
                  setConfig({ ...config, image: e.target.value })
                }
                placeholder="nginx:latest"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Container Port</Label>
              <Input
                type="number"
                value={config.containerPort || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    containerPort: parseInt(e.target.value) || undefined,
                  })
                }
                placeholder="80"
                className={
                  theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Environment Variables</Label>
              <Textarea
                value={
                  config.environment
                    ? Object.entries(config.environment)
                        .map(([k, v]) => `${k}=${v}`)
                        .join("\n")
                    : ""
                }
                onChange={(e) => {
                  const env: Record<string, string> = {};
                  e.target.value.split("\n").forEach((line) => {
                    const [key, ...rest] = line.split("=");
                    if (key && rest.length) {
                      env[key.trim()] = rest.join("=").trim();
                    }
                  });
                  setConfig({ ...config, environment: env });
                }}
                placeholder="KEY=value&#10;ANOTHER_KEY=another_value"
                className={cn(
                  "min-h-[100px] font-mono text-sm",
                  theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                )}
              />
            </div>
          </TabsContent>

          {/* Ports Tab */}
          <TabsContent value="ports" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={newPort.port}
                onChange={(e) =>
                  setNewPort({
                    ...newPort,
                    port: parseInt(e.target.value) || 80,
                  })
                }
                placeholder="Port"
                className={cn(
                  "w-24",
                  theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                )}
              />
              <Select
                value={newPort.protocol}
                onValueChange={(v) => setNewPort({ ...newPort, protocol: v })}
              >
                <SelectTrigger
                  className={cn(
                    "w-24",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                  }
                >
                  <SelectItem value="TCP">TCP</SelectItem>
                  <SelectItem value="UDP">UDP</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={newPort.service}
                onChange={(e) =>
                  setNewPort({ ...newPort, service: e.target.value })
                }
                placeholder="Service"
                className={cn(
                  "flex-1",
                  theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                )}
              />
              <Button onClick={addPort} size="icon" variant="outline">
                <Plus size={16} />
              </Button>
            </div>

            <Separator />

            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {(config.ports || []).map((port, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    theme === "dark" ? "bg-slate-800" : "bg-slate-100",
                  )}
                >
                  <Badge variant="outline" className="font-mono">
                    {port.port}
                  </Badge>
                  <Badge variant="secondary">{port.protocol}</Badge>
                  <span className="flex-1 text-sm">{port.service}</span>
                  <Select
                    value={port.status}
                    onValueChange={(v) => {
                      const ports = [...(config.ports || [])];
                      ports[index] = {
                        ...port,
                        status: v as "open" | "closed" | "filtered",
                      };
                      setConfig({ ...config, ports });
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-28 h-7 text-xs",
                        theme === "dark" ? "bg-slate-700" : "",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                      }
                    >
                      <SelectItem value="open">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Open
                        </span>
                      </SelectItem>
                      <SelectItem value="closed">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Closed
                        </span>
                      </SelectItem>
                      <SelectItem value="filtered">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Filtered
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePort(index)}
                    className="h-7 w-7 text-red-500 hover:text-red-400"
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
              {(!config.ports || config.ports.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Ports konfiguriert
                </p>
              )}
            </div>
          </TabsContent>

          {/* Interfaces Tab */}
          <TabsContent value="interfaces" className="space-y-4 mt-4">
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {(config.interfaces || []).map((iface, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border space-y-2",
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700"
                      : "bg-slate-50 border-slate-200",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">
                      {iface.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        iface.status === "up" &&
                          "border-green-500 text-green-500",
                        iface.status === "down" &&
                          "border-red-500 text-red-500",
                        iface.status === "admin-down" &&
                          "border-slate-500 text-slate-500",
                      )}
                    >
                      {iface.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">IP-Adresse</Label>
                      <Input
                        value={iface.ipAddress || ""}
                        onChange={(e) => {
                          const ifaces = [...(config.interfaces || [])];
                          ifaces[index] = {
                            ...iface,
                            ipAddress: e.target.value,
                          };
                          setConfig({ ...config, interfaces: ifaces });
                        }}
                        placeholder="192.168.1.1"
                        className={cn(
                          "h-7 text-xs",
                          theme === "dark"
                            ? "bg-slate-700 border-slate-600"
                            : "",
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Subnetzmaske</Label>
                      <Input
                        value={iface.subnetMask || ""}
                        onChange={(e) => {
                          const ifaces = [...(config.interfaces || [])];
                          ifaces[index] = {
                            ...iface,
                            subnetMask: e.target.value,
                          };
                          setConfig({ ...config, interfaces: ifaces });
                        }}
                        placeholder="255.255.255.0"
                        className={cn(
                          "h-7 text-xs",
                          theme === "dark"
                            ? "bg-slate-700 border-slate-600"
                            : "",
                        )}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">MAC</Label>
                      <div className="font-mono text-xs text-muted-foreground p-1">
                        {iface.macAddress}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Speed</Label>
                      <Select
                        value={iface.speed}
                        onValueChange={(v) => {
                          const ifaces = [...(config.interfaces || [])];
                          ifaces[index] = {
                            ...iface,
                            speed: v as NetworkInterface["speed"],
                          };
                          setConfig({ ...config, interfaces: ifaces });
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 text-xs",
                            theme === "dark"
                              ? "bg-slate-700 border-slate-600"
                              : "",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            theme === "dark"
                              ? "bg-slate-800 border-slate-600"
                              : ""
                          }
                        >
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="10">10 Mbps</SelectItem>
                          <SelectItem value="100">100 Mbps</SelectItem>
                          <SelectItem value="1000">1 Gbps</SelectItem>
                          <SelectItem value="10000">10 Gbps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={iface.status}
                        onValueChange={(v) => {
                          const ifaces = [...(config.interfaces || [])];
                          ifaces[index] = {
                            ...iface,
                            status: v as NetworkInterface["status"],
                          };
                          setConfig({ ...config, interfaces: ifaces });
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-7 text-xs",
                            theme === "dark"
                              ? "bg-slate-700 border-slate-600"
                              : "",
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          className={
                            theme === "dark"
                              ? "bg-slate-800 border-slate-600"
                              : ""
                          }
                        >
                          <SelectItem value="up">Up</SelectItem>
                          <SelectItem value="down">Down</SelectItem>
                          <SelectItem value="admin-down">Admin Down</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(isSwitch || isRouter) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Mode</Label>
                        <Select
                          value={iface.mode || "access"}
                          onValueChange={(v) => {
                            const ifaces = [...(config.interfaces || [])];
                            ifaces[index] = {
                              ...iface,
                              mode: v as "access" | "trunk",
                            };
                            setConfig({ ...config, interfaces: ifaces });
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-7 text-xs",
                              theme === "dark"
                                ? "bg-slate-700 border-slate-600"
                                : "",
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            className={
                              theme === "dark"
                                ? "bg-slate-800 border-slate-600"
                                : ""
                            }
                          >
                            <SelectItem value="access">Access</SelectItem>
                            <SelectItem value="trunk">Trunk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">VLAN</Label>
                        <Input
                          type="number"
                          value={iface.vlan || 1}
                          onChange={(e) => {
                            const ifaces = [...(config.interfaces || [])];
                            ifaces[index] = {
                              ...iface,
                              vlan: parseInt(e.target.value) || 1,
                            };
                            setConfig({ ...config, interfaces: ifaces });
                          }}
                          className={cn(
                            "h-7 text-xs",
                            theme === "dark"
                              ? "bg-slate-700 border-slate-600"
                              : "",
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {(!config.interfaces || config.interfaces.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Klicken Sie auf den &quot;Interfaces&quot;-Tab, um
                  Standard-Interfaces zu initialisieren.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Routing Tab */}
          <TabsContent value="routing" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Ziel-Netzwerk</Label>
                <Input
                  value={newRoute.dest}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, dest: e.target.value })
                  }
                  placeholder="192.168.2.0"
                  className={cn(
                    "h-8 text-xs",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Maske</Label>
                <Input
                  value={newRoute.mask}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, mask: e.target.value })
                  }
                  placeholder="255.255.255.0"
                  className={cn(
                    "h-8 text-xs",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Next Hop</Label>
                <Input
                  value={newRoute.nh}
                  onChange={(e) =>
                    setNewRoute({ ...newRoute, nh: e.target.value })
                  }
                  placeholder="192.168.1.254"
                  className={cn(
                    "h-8 text-xs",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!newRoute.dest || !newRoute.nh) return;
                  const rt = config.routingTable || { entries: [] };
                  setConfig({
                    ...config,
                    routingTable: {
                      entries: [
                        ...rt.entries,
                        {
                          destination: newRoute.dest,
                          netmask: newRoute.mask,
                          nextHop: newRoute.nh,
                          interface: "eth0",
                          metric: 1,
                          protocol: "static" as const,
                        },
                      ],
                    },
                  });
                  setNewRoute({ dest: "", mask: "255.255.255.0", nh: "" });
                }}
              >
                <Plus size={14} />
              </Button>
            </div>

            <Separator />

            <div className="space-y-1 max-h-[250px] overflow-y-auto">
              <div
                className={cn(
                  "grid grid-cols-5 gap-2 text-xs font-medium px-2 py-1",
                  theme === "dark" ? "text-slate-400" : "text-slate-600",
                )}
              >
                <span>Ziel</span>
                <span>Maske</span>
                <span>Next Hop</span>
                <span>Protokoll</span>
                <span></span>
              </div>
              {(config.routingTable?.entries || []).map((route, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-5 gap-2 text-xs font-mono items-center px-2 py-1 rounded",
                    theme === "dark" ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <span>{route.destination}</span>
                  <span>{route.netmask}</span>
                  <span>{route.nextHop}</span>
                  <Badge variant="outline" className="text-[10px] w-fit">
                    {route.protocol}
                  </Badge>
                  {route.protocol === "static" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => {
                        const entries = [
                          ...(config.routingTable?.entries || []),
                        ];
                        entries.splice(index, 1);
                        setConfig({ ...config, routingTable: { entries } });
                      }}
                    >
                      <Trash size={12} />
                    </Button>
                  )}
                </div>
              ))}
              {(!config.routingTable?.entries ||
                config.routingTable.entries.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Routen konfiguriert
                </p>
              )}
            </div>
          </TabsContent>

          {/* VLANs Tab */}
          <TabsContent value="vlans" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">VLAN ID</Label>
                <Input
                  type="number"
                  value={newVlan.id}
                  onChange={(e) =>
                    setNewVlan({
                      ...newVlan,
                      id: parseInt(e.target.value) || 1,
                    })
                  }
                  className={cn(
                    "h-8 text-xs w-24",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={newVlan.name}
                  onChange={(e) =>
                    setNewVlan({ ...newVlan, name: e.target.value })
                  }
                  placeholder="z.B. MANAGEMENT"
                  className={cn(
                    "h-8 text-xs",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!newVlan.name || newVlan.id < 1 || newVlan.id > 4094)
                    return;
                  const vlans = config.vlans || [];
                  if (vlans.some((v) => v.id === newVlan.id)) return;
                  setConfig({
                    ...config,
                    vlans: [
                      ...vlans,
                      {
                        id: newVlan.id,
                        name: newVlan.name,
                        status: "active" as const,
                      },
                    ],
                  });
                  setNewVlan({ id: newVlan.id + 10, name: "" });
                }}
              >
                <Plus size={14} />
              </Button>
            </div>

            <Separator />

            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {(config.vlans || []).map((vlan, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded",
                    theme === "dark" ? "bg-slate-800" : "bg-slate-50",
                  )}
                >
                  <Badge variant="outline" className="font-mono text-xs">
                    {vlan.id}
                  </Badge>
                  <span className="text-sm flex-1">{vlan.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {vlan.status}
                  </Badge>
                  {vlan.id !== 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => {
                        const vlans = [...(config.vlans || [])];
                        vlans.splice(index, 1);
                        setConfig({ ...config, vlans });
                      }}
                    >
                      <Trash size={12} />
                    </Button>
                  )}
                </div>
              ))}
              {(!config.vlans || config.vlans.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine VLANs konfiguriert. VLAN 1 (default) ist immer
                  vorhanden.
                </p>
              )}
            </div>
          </TabsContent>

          {/* DHCP Tab */}
          <TabsContent value="dhcp" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">DHCP Server</Label>
              <Button
                variant={config.dhcpServer?.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setConfig({
                    ...config,
                    dhcpServer: {
                      enabled: !config.dhcpServer?.enabled,
                      pools: config.dhcpServer?.pools || [],
                      leases: config.dhcpServer?.leases || [],
                    },
                  })
                }
              >
                {config.dhcpServer?.enabled ? "Aktiviert" : "Deaktiviert"}
              </Button>
            </div>

            {config.dhcpServer?.enabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Pool hinzufügen</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Pool-Name (z.B. LAN-POOL)"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                      id="dhcp-pool-name"
                    />
                    <Input
                      placeholder="Netzwerk (z.B. 192.168.1.0)"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                      id="dhcp-pool-network"
                    />
                    <Input
                      placeholder="Start (z.B. 192.168.1.100)"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                      id="dhcp-pool-start"
                    />
                    <Input
                      placeholder="Ende (z.B. 192.168.1.200)"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                      id="dhcp-pool-end"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const nameEl = document.getElementById(
                        "dhcp-pool-name",
                      ) as HTMLInputElement;
                      const netEl = document.getElementById(
                        "dhcp-pool-network",
                      ) as HTMLInputElement;
                      const startEl = document.getElementById(
                        "dhcp-pool-start",
                      ) as HTMLInputElement;
                      const endEl = document.getElementById(
                        "dhcp-pool-end",
                      ) as HTMLInputElement;
                      if (!nameEl?.value || !netEl?.value) return;
                      const pool: DHCPPool = {
                        name: nameEl.value,
                        network: netEl.value,
                        netmask: "255.255.255.0",
                        defaultGateway: config.gateway || "",
                        dnsServers: config.dns || ["8.8.8.8"],
                        leaseTime: 86400,
                        rangeStart: startEl?.value || "",
                        rangeEnd: endEl?.value || "",
                        excludedAddresses: [],
                      };
                      setConfig({
                        ...config,
                        dhcpServer: {
                          ...config.dhcpServer!,
                          pools: [...(config.dhcpServer?.pools || []), pool],
                        },
                      });
                      nameEl.value = "";
                      netEl.value = "";
                      if (startEl) startEl.value = "";
                      if (endEl) endEl.value = "";
                    }}
                  >
                    <Plus size={14} className="mr-1" /> Pool erstellen
                  </Button>
                </div>

                {(config.dhcpServer.pools || []).map((pool, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border space-y-1",
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700"
                        : "bg-slate-50 border-slate-200",
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{pool.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => {
                          const pools = [...(config.dhcpServer?.pools || [])];
                          pools.splice(index, 1);
                          setConfig({
                            ...config,
                            dhcpServer: { ...config.dhcpServer!, pools },
                          });
                        }}
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Network: {pool.network}/{pool.netmask} | Range:{" "}
                      {pool.rangeStart} - {pool.rangeEnd}
                    </div>
                  </div>
                ))}

                {(config.dhcpServer.leases || []).length > 0 && (
                  <>
                    <Label className="text-sm font-medium">Aktive Leases</Label>
                    {config.dhcpServer.leases.map((lease, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono text-muted-foreground"
                      >
                        {lease.ipAddress} → {lease.macAddress} ({lease.hostname}
                        )
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* DNS Tab */}
          <TabsContent value="dns" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">DNS Server</Label>
              <Button
                variant={config.dnsServer?.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setConfig({
                    ...config,
                    dnsServer: {
                      enabled: !config.dnsServer?.enabled,
                      domain: config.dnsServer?.domain || "local",
                      records: config.dnsServer?.records || [],
                      forwarders: config.dnsServer?.forwarders || ["8.8.8.8"],
                    },
                  })
                }
              >
                {config.dnsServer?.enabled ? "Aktiviert" : "Deaktiviert"}
              </Button>
            </div>

            {config.dnsServer?.enabled && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Domain</Label>
                    <Input
                      value={config.dnsServer.domain}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dnsServer: {
                            ...config.dnsServer!,
                            domain: e.target.value,
                          },
                        })
                      }
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Forwarders</Label>
                    <Input
                      value={config.dnsServer.forwarders.join(", ")}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dnsServer: {
                            ...config.dnsServer!,
                            forwarders: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        })
                      }
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 items-end">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={newDnsRecord.name || ""}
                      onChange={(e) =>
                        setNewDnsRecord({
                          ...newDnsRecord,
                          name: e.target.value,
                        })
                      }
                      placeholder="www.example.com"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                  <div className="space-y-1 w-20">
                    <Label className="text-xs">Typ</Label>
                    <Select
                      value={newDnsRecord.type || "A"}
                      onValueChange={(v) =>
                        setNewDnsRecord({
                          ...newDnsRecord,
                          type: v as DNSRecord["type"],
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-xs",
                          theme === "dark"
                            ? "bg-slate-800 border-slate-600"
                            : "",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === "dark"
                            ? "bg-slate-800 border-slate-600"
                            : ""
                        }
                      >
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="CNAME">CNAME</SelectItem>
                        <SelectItem value="MX">MX</SelectItem>
                        <SelectItem value="NS">NS</SelectItem>
                        <SelectItem value="PTR">PTR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Wert</Label>
                    <Input
                      value={newDnsRecord.value || ""}
                      onChange={(e) =>
                        setNewDnsRecord({
                          ...newDnsRecord,
                          value: e.target.value,
                        })
                      }
                      placeholder="192.168.1.10"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!newDnsRecord.name || !newDnsRecord.value) return;
                      setConfig({
                        ...config,
                        dnsServer: {
                          ...config.dnsServer!,
                          records: [
                            ...(config.dnsServer?.records || []),
                            {
                              name: newDnsRecord.name!,
                              type: (newDnsRecord.type ||
                                "A") as DNSRecord["type"],
                              value: newDnsRecord.value!,
                              ttl: newDnsRecord.ttl || 3600,
                            },
                          ],
                        },
                      });
                      setNewDnsRecord({
                        name: "",
                        type: "A",
                        value: "",
                        ttl: 3600,
                      });
                    }}
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {(config.dnsServer.records || []).map((record, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-xs font-mono px-2 py-1 rounded",
                        theme === "dark" ? "bg-slate-800" : "bg-slate-50",
                      )}
                    >
                      <Badge variant="outline" className="text-[10px]">
                        {record.type}
                      </Badge>
                      <span className="flex-1">{record.name}</span>
                      <span className="text-muted-foreground">
                        → {record.value}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-red-500"
                        onClick={() => {
                          const records = [
                            ...(config.dnsServer?.records || []),
                          ];
                          records.splice(index, 1);
                          setConfig({
                            ...config,
                            dnsServer: { ...config.dnsServer!, records },
                          });
                        }}
                      >
                        <Trash size={10} />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* ACL Tab */}
          <TabsContent value="acl" className="space-y-4 mt-4">
            <div className="flex gap-2 items-end flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Aktion</Label>
                <Select
                  value={newAclRule.action || "permit"}
                  onValueChange={(v) =>
                    setNewAclRule({
                      ...newAclRule,
                      action: v as "permit" | "deny",
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 text-xs w-24",
                      theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="deny">Deny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Protokoll</Label>
                <Select
                  value={newAclRule.protocol || "ip"}
                  onValueChange={(v) =>
                    setNewAclRule({
                      ...newAclRule,
                      protocol: v as ACLRule["protocol"],
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 text-xs w-20",
                      theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark" ? "bg-slate-800 border-slate-600" : ""
                    }
                  >
                    <SelectItem value="ip">IP</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="icmp">ICMP</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Quelle</Label>
                <Input
                  value={newAclRule.sourceIp || ""}
                  onChange={(e) =>
                    setNewAclRule({ ...newAclRule, sourceIp: e.target.value })
                  }
                  placeholder="any / 192.168.1.0/24"
                  className={cn(
                    "h-8 text-xs",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Ziel</Label>
                <Input
                  value={newAclRule.destinationIp || ""}
                  onChange={(e) =>
                    setNewAclRule({
                      ...newAclRule,
                      destinationIp: e.target.value,
                    })
                  }
                  placeholder="any / 10.0.0.0/8"
                  className={cn(
                    "h-8 text-xs",
                    theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                  )}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const acls = config.acls || [{ name: "DEFAULT", rules: [] }];
                  const rule: ACLRule = {
                    id: (acls[0].rules.length + 1) * 10,
                    action: (newAclRule.action || "permit") as
                      | "permit"
                      | "deny",
                    protocol: (newAclRule.protocol ||
                      "ip") as ACLRule["protocol"],
                    sourceIp: newAclRule.sourceIp || "any",
                    destinationIp: newAclRule.destinationIp || "any",
                    sourcePort: newAclRule.sourcePort,
                    destinationPort: newAclRule.destinationPort,
                    hitCount: 0,
                  };
                  acls[0] = { ...acls[0], rules: [...acls[0].rules, rule] };
                  setConfig({ ...config, acls });
                  setNewAclRule({
                    action: "permit",
                    protocol: "ip",
                    sourceIp: "any",
                    destinationIp: "any",
                  });
                }}
              >
                <Plus size={14} />
              </Button>
            </div>

            <Separator />

            <div className="space-y-1 max-h-[250px] overflow-y-auto">
              {(config.acls || []).flatMap((acl) =>
                acl.rules.map((rule, index) => (
                  <div
                    key={`${acl.name}-${index}`}
                    className={cn(
                      "flex items-center gap-2 text-xs font-mono px-2 py-1 rounded",
                      theme === "dark" ? "bg-slate-800" : "bg-slate-50",
                    )}
                  >
                    <Badge variant="outline" className="text-[10px]">
                      {rule.id}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-[10px]",
                        rule.action === "permit"
                          ? "bg-green-600"
                          : "bg-red-600",
                      )}
                    >
                      {rule.action}
                    </Badge>
                    <span>{rule.protocol}</span>
                    <span>{rule.sourceIp}</span>
                    <span>→</span>
                    <span>{rule.destinationIp}</span>
                    <span className="flex-1" />
                    <span className="text-muted-foreground">
                      ({rule.hitCount} hits)
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-red-500"
                      onClick={() => {
                        const acls = [...(config.acls || [])];
                        const aclIdx = acls.findIndex(
                          (a) => a.name === acl.name,
                        );
                        if (aclIdx >= 0) {
                          const rules = [...acls[aclIdx].rules];
                          rules.splice(index, 1);
                          acls[aclIdx] = { ...acls[aclIdx], rules };
                          setConfig({ ...config, acls });
                        }
                      }}
                    >
                      <Trash size={10} />
                    </Button>
                  </div>
                )),
              )}
              {(!config.acls ||
                config.acls.every((a) => a.rules.length === 0)) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine ACL-Regeln. Implizit: deny any any
                </p>
              )}
            </div>
          </TabsContent>

          {/* NAT Tab */}
          <TabsContent value="nat" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">NAT</Label>
              <Button
                variant={config.natConfig?.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setConfig({
                    ...config,
                    natConfig: {
                      enabled: !config.natConfig?.enabled,
                      insideInterface:
                        config.natConfig?.insideInterface || "eth0",
                      outsideInterface:
                        config.natConfig?.outsideInterface || "eth1",
                      rules: config.natConfig?.rules || [],
                      translations: config.natConfig?.translations || [],
                    },
                  })
                }
              >
                {config.natConfig?.enabled ? "Aktiviert" : "Deaktiviert"}
              </Button>
            </div>

            {config.natConfig?.enabled && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Inside Interface</Label>
                    <Input
                      value={config.natConfig.insideInterface}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          natConfig: {
                            ...config.natConfig!,
                            insideInterface: e.target.value,
                          },
                        })
                      }
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Outside Interface</Label>
                    <Input
                      value={config.natConfig.outsideInterface}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          natConfig: {
                            ...config.natConfig!,
                            outsideInterface: e.target.value,
                          },
                        })
                      }
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Typ</Label>
                    <Select
                      value={newNatRule.type || "static"}
                      onValueChange={(v) =>
                        setNewNatRule({
                          ...newNatRule,
                          type: v as NATRule["type"],
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-xs w-24",
                          theme === "dark"
                            ? "bg-slate-800 border-slate-600"
                            : "",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === "dark"
                            ? "bg-slate-800 border-slate-600"
                            : ""
                        }
                      >
                        <SelectItem value="static">Static</SelectItem>
                        <SelectItem value="dynamic">Dynamic</SelectItem>
                        <SelectItem value="pat">PAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Inside Local</Label>
                    <Input
                      value={newNatRule.insideLocal || ""}
                      onChange={(e) =>
                        setNewNatRule({
                          ...newNatRule,
                          insideLocal: e.target.value,
                        })
                      }
                      placeholder="192.168.1.10"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Inside Global</Label>
                    <Input
                      value={newNatRule.insideGlobal || ""}
                      onChange={(e) =>
                        setNewNatRule({
                          ...newNatRule,
                          insideGlobal: e.target.value,
                        })
                      }
                      placeholder="203.0.113.10"
                      className={cn(
                        "h-8 text-xs",
                        theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                      )}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!newNatRule.insideLocal || !newNatRule.insideGlobal)
                        return;
                      const rules = config.natConfig?.rules || [];
                      setConfig({
                        ...config,
                        natConfig: {
                          ...config.natConfig!,
                          rules: [
                            ...rules,
                            {
                              id: rules.length + 1,
                              type: (newNatRule.type ||
                                "static") as NATRule["type"],
                              insideLocal: newNatRule.insideLocal!,
                              insideGlobal: newNatRule.insideGlobal!,
                            },
                          ],
                        },
                      });
                      setNewNatRule({
                        type: "static",
                        insideLocal: "",
                        insideGlobal: "",
                      });
                    }}
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {(config.natConfig.rules || []).map((rule, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-xs font-mono px-2 py-1 rounded",
                        theme === "dark" ? "bg-slate-800" : "bg-slate-50",
                      )}
                    >
                      <Badge variant="outline" className="text-[10px]">
                        {rule.type}
                      </Badge>
                      <span>{rule.insideLocal}</span>
                      <span>→</span>
                      <span>{rule.insideGlobal}</span>
                      <span className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-red-500"
                        onClick={() => {
                          const rules = [...(config.natConfig?.rules || [])];
                          rules.splice(index, 1);
                          setConfig({
                            ...config,
                            natConfig: { ...config.natConfig!, rules },
                          });
                        }}
                      >
                        <Trash size={10} />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* STP Tab */}
          <TabsContent value="stp" className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Spanning Tree</Label>
              <Button
                variant={config.stpConfig?.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setConfig({
                    ...config,
                    stpConfig: {
                      enabled: !config.stpConfig?.enabled,
                      priority: config.stpConfig?.priority || 32768,
                      bridgeId:
                        config.stpConfig?.bridgeId ||
                        `32768.${config.mac || generateMAC()}`,
                      portStates: config.stpConfig?.portStates || {},
                    },
                  })
                }
              >
                {config.stpConfig?.enabled ? "Aktiviert" : "Deaktiviert"}
              </Button>
            </div>

            {config.stpConfig?.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Bridge Priority</Label>
                    <Select
                      value={String(config.stpConfig.priority)}
                      onValueChange={(v) =>
                        setConfig({
                          ...config,
                          stpConfig: {
                            ...config.stpConfig!,
                            priority: parseInt(v),
                            bridgeId: `${v}.${config.mac || generateMAC()}`,
                          },
                        })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-xs",
                          theme === "dark"
                            ? "bg-slate-800 border-slate-600"
                            : "",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === "dark"
                            ? "bg-slate-800 border-slate-600"
                            : ""
                        }
                      >
                        {[
                          0, 4096, 8192, 12288, 16384, 20480, 24576, 28672,
                          32768, 36864, 40960, 45056, 49152, 53248, 57344,
                          61440,
                        ].map((p) => (
                          <SelectItem key={p} value={String(p)}>
                            {p}
                            {p === 32768 ? " (default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bridge ID</Label>
                    <div
                      className={cn(
                        "text-xs font-mono p-2 rounded",
                        theme === "dark" ? "bg-slate-800" : "bg-slate-100",
                      )}
                    >
                      {config.stpConfig.bridgeId}
                    </div>
                  </div>
                </div>

                {config.stpConfig.rootBridgeId && (
                  <div
                    className={cn(
                      "p-3 rounded-lg border",
                      theme === "dark"
                        ? "bg-slate-800 border-slate-700"
                        : "bg-blue-50 border-blue-200",
                    )}
                  >
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="font-medium">Root Bridge:</span>{" "}
                        {config.stpConfig.rootBridgeId}
                      </div>
                      <div>
                        <span className="font-medium">Root Cost:</span>{" "}
                        {config.stpConfig.rootCost || 0}
                      </div>
                    </div>
                  </div>
                )}

                {Object.keys(config.stpConfig.portStates || {}).length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Port States</Label>
                    {Object.entries(config.stpConfig.portStates).map(
                      ([portName, state]) => (
                        <div
                          key={portName}
                          className={cn(
                            "flex items-center gap-2 text-xs px-2 py-1 rounded",
                            theme === "dark" ? "bg-slate-800" : "bg-slate-50",
                          )}
                        >
                          <span className="font-mono w-20">
                            {state.interface}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              state.state === "forwarding" &&
                                "border-green-500 text-green-500",
                              state.state === "blocking" &&
                                "border-red-500 text-red-500",
                              state.state === "listening" &&
                                "border-amber-500 text-amber-500",
                              state.state === "learning" &&
                                "border-blue-500 text-blue-500",
                            )}
                          >
                            {state.state}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {state.role}
                          </Badge>
                          <span className="text-muted-foreground">
                            cost: {state.cost}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          {validationErrors.length > 0 && (
            <div className="flex-1 text-xs text-red-400 space-y-0.5">
              {validationErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

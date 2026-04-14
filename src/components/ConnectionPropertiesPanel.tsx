import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { CONNECTION_COLORS, ConnectionType } from "@/lib/shape-properties";
import { CableType, CanvasConnection, DrawingObject } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowsLeftRight,
  GitBranch,
  Lightning,
  Trash,
  X,
} from "@phosphor-icons/react";

interface ConnectionPropertiesPanelProps {
  connection: CanvasConnection | null;
  objects: DrawingObject[];
  onUpdateConnection: (id: string, updates: Partial<CanvasConnection>) => void;
  onDeleteConnection: (id: string) => void;
  onClose: () => void;
  theme: "light" | "dark";
}

export function ConnectionPropertiesPanel({
  connection,
  objects,
  onUpdateConnection,
  onDeleteConnection,
  onClose,
  theme,
}: ConnectionPropertiesPanelProps) {
  if (!connection) return null;

  const sourceObj = objects.find((o) => o.id === connection.sourceShapeId);
  const targetObj = objects.find((o) => o.id === connection.targetShapeId);

  const connectionTypes: {
    value: ConnectionType;
    label: string;
    color: string;
  }[] = [
    { value: "ethernet", label: "Ethernet", color: CONNECTION_COLORS.ethernet },
    { value: "fiber", label: "Glasfaser", color: CONNECTION_COLORS.fiber },
    { value: "wifi", label: "WiFi", color: CONNECTION_COLORS.wifi },
    { value: "api", label: "API", color: CONNECTION_COLORS.api },
    { value: "https", label: "HTTPS", color: CONNECTION_COLORS.https },
    { value: "ssh", label: "SSH", color: CONNECTION_COLORS.ssh },
    { value: "vpn", label: "VPN", color: CONNECTION_COLORS.vpn },
    {
      value: "vnet-peering",
      label: "VNet Peering",
      color: CONNECTION_COLORS["vnet-peering"],
    },
  ];

  const statusOptions = [
    { value: "active", label: "Aktiv", color: "#22C55E" },
    { value: "inactive", label: "Inaktiv", color: "#64748B" },
    { value: "error", label: "Fehler", color: "#EF4444" },
  ];

  return (
    <div
      className={cn(
        "fixed right-4 top-20 w-80 rounded-xl shadow-2xl border overflow-hidden z-50",
        theme === "dark"
          ? "bg-slate-900/95 border-slate-700 backdrop-blur-xl"
          : "bg-white/95 border-slate-200 backdrop-blur-xl",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          theme === "dark"
            ? "border-slate-700 bg-slate-800/50"
            : "border-slate-200 bg-slate-50",
        )}
      >
        <div className="flex items-center gap-3">
          <GitBranch
            size={20}
            className={cn(
              connection.status === "active"
                ? "text-green-500"
                : connection.status === "error"
                  ? "text-red-500"
                  : "text-slate-500",
            )}
          />
          <div>
            <h3
              className={cn(
                "font-semibold text-sm",
                theme === "dark" ? "text-white" : "text-slate-900",
              )}
            >
              Verbindung
            </h3>
            <p
              className={cn(
                "text-xs",
                theme === "dark" ? "text-slate-400" : "text-slate-500",
              )}
            >
              {connection.connectionType || "Standard"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cn(
            "h-7 w-7",
            theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-200",
          )}
        >
          <X size={16} />
        </Button>
      </div>

      {/* Connection Endpoints */}
      <div
        className={cn(
          "px-4 py-3 border-b",
          theme === "dark" ? "border-slate-700" : "border-slate-200",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <Badge variant="outline" className="text-xs">
              {sourceObj?.label ||
                sourceObj?.shapeId?.split("-")[1] ||
                "Quelle"}
            </Badge>
            <p
              className={cn(
                "text-xs mt-1",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
            >
              {connection.sourcePort}
            </p>
          </div>
          <ArrowsLeftRight
            size={20}
            className={
              connection.bidirectional ? "text-blue-500" : "text-slate-400"
            }
          />
          <div className="flex-1 text-center">
            <Badge variant="outline" className="text-xs">
              {targetObj?.label || targetObj?.shapeId?.split("-")[1] || "Ziel"}
            </Badge>
            <p
              className={cn(
                "text-xs mt-1",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
            >
              {connection.targetPort}
            </p>
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-4">
        {/* Connection Type */}
        <div>
          <Label className="text-xs">Verbindungstyp</Label>
          <Select
            value={connection.connectionType}
            onValueChange={(v) =>
              onUpdateConnection(connection.id, { connectionType: v })
            }
          >
            <SelectTrigger
              className={cn(
                "mt-1 h-9",
                theme === "dark"
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={
                theme === "dark" ? "bg-slate-800 border-slate-600" : ""
              }
            >
              {connectionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label className="text-xs">Status</Label>
          <Select
            value={connection.status}
            onValueChange={(v) =>
              onUpdateConnection(connection.id, {
                status: v as "active" | "inactive" | "error",
              })
            }
          >
            <SelectTrigger
              className={cn(
                "mt-1 h-9",
                theme === "dark"
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={
                theme === "dark" ? "bg-slate-800 border-slate-600" : ""
              }
            >
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Label */}
        <div>
          <Label className="text-xs">Beschriftung</Label>
          <Input
            value={connection.label || ""}
            onChange={(e) =>
              onUpdateConnection(connection.id, { label: e.target.value })
            }
            placeholder="z.B. 1 Gbit/s"
            className={cn(
              "mt-1 h-9",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        </div>

        {/* Bandwidth */}
        <div>
          <Label className="text-xs">Bandbreite</Label>
          <Input
            value={connection.bandwidth || ""}
            onChange={(e) =>
              onUpdateConnection(connection.id, { bandwidth: e.target.value })
            }
            placeholder="z.B. 1 Gbit/s"
            className={cn(
              "mt-1 h-9",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        </div>

        {/* Protocol */}
        <div>
          <Label className="text-xs">Protokoll</Label>
          <Input
            value={connection.protocol || ""}
            onChange={(e) =>
              onUpdateConnection(connection.id, { protocol: e.target.value })
            }
            placeholder="z.B. TCP/IP"
            className={cn(
              "mt-1 h-9",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        </div>

        {/* Cable Type */}
        <div>
          <Label className="text-xs">Kabeltyp</Label>
          <Select
            value={connection.cableType || "straight-through"}
            onValueChange={(v) =>
              onUpdateConnection(connection.id, {
                cableType: v as CableType,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "mt-1 h-9",
                theme === "dark"
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              className={
                theme === "dark" ? "bg-slate-800 border-slate-600" : ""
              }
            >
              <SelectItem value="straight-through">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-blue-500" />
                  Straight-Through (Patch)
                </div>
              </SelectItem>
              <SelectItem value="crossover">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-0.5 bg-orange-500"
                    style={{ borderTop: "1px dashed" }}
                  />
                  Crossover
                </div>
              </SelectItem>
              <SelectItem value="fiber">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-yellow-500" />
                  Glasfaser (Fiber)
                </div>
              </SelectItem>
              <SelectItem value="serial">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-red-500" />
                  Seriell (WAN)
                </div>
              </SelectItem>
              <SelectItem value="console">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-cyan-500" />
                  Konsole
                </div>
              </SelectItem>
              <SelectItem value="rollover">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-purple-500" />
                  Rollover
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className={theme === "dark" ? "bg-slate-700" : ""} />

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Bidirektional</Label>
            <Switch
              checked={connection.bidirectional || false}
              onCheckedChange={(v) =>
                onUpdateConnection(connection.id, { bidirectional: v })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1">
              <Lightning size={12} />
              Animation
            </Label>
            <Switch
              checked={connection.animated || false}
              onCheckedChange={(v) =>
                onUpdateConnection(connection.id, { animated: v })
              }
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <Label className="text-xs">Farbe (optional)</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={
                connection.color ||
                CONNECTION_COLORS[
                  connection.connectionType as ConnectionType
                ] ||
                "#3B82F6"
              }
              onChange={(e) =>
                onUpdateConnection(connection.id, { color: e.target.value })
              }
              className="w-9 h-9 rounded cursor-pointer border-0"
            />
            <Input
              value={connection.color || ""}
              onChange={(e) =>
                onUpdateConnection(connection.id, { color: e.target.value })
              }
              placeholder="Auto"
              className={cn(
                "h-9 flex-1",
                theme === "dark"
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300",
              )}
            />
            {connection.color && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onUpdateConnection(connection.id, { color: undefined })
                }
                className="h-9"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <Separator className={theme === "dark" ? "bg-slate-700" : ""} />

        {/* Delete */}
        <Button
          variant="outline"
          className="w-full text-red-500 hover:bg-red-500/10 border-red-500/30"
          onClick={() => onDeleteConnection(connection.id)}
        >
          <Trash size={14} className="mr-2" />
          Verbindung löschen
        </Button>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getDefaultProperties,
  PropertyField,
  SHAPE_PROPERTY_SCHEMAS,
  STATUS_COLORS,
} from "@/lib/shape-properties";
import { DrawingObject, ShapeCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowFatLineDown,
  ArrowFatLineUp,
  ArrowsClockwise,
  CaretDown,
  CaretUp,
  Copy,
  FloppyDisk,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

interface ShapePropertiesPanelProps {
  selectedObject: DrawingObject | null;
  onUpdateObject: (id: string, updates: Partial<DrawingObject>) => void;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onClose: () => void;
  theme: "light" | "dark";
}

export function ShapePropertiesPanel({
  selectedObject,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject,
  onBringToFront,
  onSendToBack,
  onClose,
  theme,
}: ShapePropertiesPanelProps) {
  const [localProperties, setLocalProperties] = useState<Record<string, any>>(
    {},
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Allgemein", "Status"]),
  );
  const [isDirty, setIsDirty] = useState(false);

  // Initialize local properties when object changes
  useEffect(() => {
    if (selectedObject) {
      const existingProps = (selectedObject as any).properties || {};
      const defaults = getDefaultProperties(
        selectedObject.shapeId?.split("-")[0] || "diagrams",
      );
      setLocalProperties({
        name: selectedObject.label || existingProps.name || defaults.name,
        ...defaults,
        ...existingProps,
      });
      setIsDirty(false);
    }
  }, [selectedObject?.id]);

  // Get property schema based on shape category
  const propertySchema = useMemo(() => {
    if (!selectedObject?.shapeId) return SHAPE_PROPERTY_SCHEMAS.diagrams;

    // Extract category from shapeId (e.g., "network-router" -> "network")
    const category = selectedObject.shapeId.split("-")[0] as ShapeCategory;
    return SHAPE_PROPERTY_SCHEMAS[category] || SHAPE_PROPERTY_SCHEMAS.diagrams;
  }, [selectedObject?.shapeId]);

  // Group properties by their group field
  const groupedProperties = useMemo(() => {
    const groups: Record<string, PropertyField[]> = {};
    propertySchema.forEach((field) => {
      const groupName = field.group || "Allgemein";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(field);
    });
    return groups;
  }, [propertySchema]);

  const handlePropertyChange = (key: string, value: any) => {
    setLocalProperties((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);

    // Auto-save certain properties immediately
    if (selectedObject && (key === "status" || key === "name")) {
      const updates: Partial<DrawingObject> = {
        label: key === "name" ? value : localProperties.name,
      };

      // Store all properties
      (updates as any).properties = {
        ...localProperties,
        [key]: value,
      };

      onUpdateObject(selectedObject.id, updates);
    }
  };

  const handleSave = () => {
    if (!selectedObject) return;

    const updates: Partial<DrawingObject> = {
      label: localProperties.name,
    };

    (updates as any).properties = localProperties;

    onUpdateObject(selectedObject.id, updates);
    setIsDirty(false);
  };

  const handleRotate = () => {
    if (!selectedObject) return;
    const currentRotation = selectedObject.rotation || 0;
    onUpdateObject(selectedObject.id, {
      rotation: (currentRotation + 90) % 360,
    });
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const renderPropertyField = (field: PropertyField) => {
    const value = localProperties[field.key] ?? "";

    switch (field.type) {
      case "text":
      case "ip":
        return (
          <Input
            id={field.key}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "h-8 text-sm",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        );

      case "number":
        return (
          <Input
            id={field.key}
            type="number"
            value={value}
            onChange={(e) =>
              handlePropertyChange(field.key, parseFloat(e.target.value) || 0)
            }
            placeholder={field.placeholder}
            className={cn(
              "h-8 text-sm",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={cn(
              "text-sm resize-none",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(v) => handlePropertyChange(field.key, v)}
          >
            <SelectTrigger
              className={cn(
                "h-8 text-sm",
                theme === "dark"
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300",
              )}
            >
              <SelectValue placeholder="Auswählen..." />
            </SelectTrigger>
            <SelectContent
              className={
                theme === "dark" ? "bg-slate-800 border-slate-600" : ""
              }
            >
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <Switch
            id={field.key}
            checked={!!value}
            onCheckedChange={(v) => handlePropertyChange(field.key, v)}
          />
        );

      case "color":
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value || "#3B82F6"}
              onChange={(e) => handlePropertyChange(field.key, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <Input
              value={value}
              onChange={(e) => handlePropertyChange(field.key, e.target.value)}
              placeholder="#3B82F6"
              className={cn(
                "h-8 text-sm flex-1",
                theme === "dark"
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300",
              )}
            />
          </div>
        );

      default:
        return (
          <Input
            id={field.key}
            value={value}
            onChange={(e) => handlePropertyChange(field.key, e.target.value)}
            className={cn(
              "h-8 text-sm",
              theme === "dark"
                ? "bg-slate-800 border-slate-600"
                : "bg-white border-slate-300",
            )}
          />
        );
    }
  };

  if (!selectedObject) return null;

  const statusColor =
    STATUS_COLORS[localProperties.status as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.active;

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
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: statusColor }}
          />
          <div>
            <h3
              className={cn(
                "font-semibold text-sm",
                theme === "dark" ? "text-white" : "text-slate-900",
              )}
            >
              {localProperties.name || "Element"}
            </h3>
            <p
              className={cn(
                "text-xs",
                theme === "dark" ? "text-slate-400" : "text-slate-500",
              )}
            >
              {selectedObject.shapeId || selectedObject.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isDirty && (
            <Badge
              variant="outline"
              className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30"
            >
              Ungespeichert
            </Badge>
          )}
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
      </div>

      {/* Quick Actions */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 border-b",
          theme === "dark" ? "border-slate-700" : "border-slate-200",
        )}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
          className={cn(
            "h-7 text-xs gap-1",
            theme === "dark" ? "border-slate-600" : "",
          )}
        >
          <FloppyDisk size={14} />
          Speichern
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectedObject && onDuplicateObject(selectedObject.id)}
          className={cn(
            "h-7 text-xs gap-1",
            theme === "dark" ? "border-slate-600" : "",
          )}
        >
          <Copy size={14} />
          Kopieren
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          className={cn(
            "h-7 text-xs gap-1",
            theme === "dark" ? "border-slate-600" : "",
          )}
        >
          <ArrowsClockwise size={14} />
          90°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectedObject && onDeleteObject(selectedObject.id)}
          className={cn(
            "h-7 text-xs gap-1 text-red-500 hover:bg-red-500/10",
            theme === "dark" ? "border-slate-600" : "",
          )}
        >
          <Trash size={14} />
        </Button>
      </div>

      {/* Properties */}
      <ScrollArea className="h-[calc(100vh-300px)] max-h-[500px]">
        <div className="p-4 space-y-4">
          {/* Visual Properties */}
          <div>
            <h4
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-3",
                theme === "dark" ? "text-slate-400" : "text-slate-500",
              )}
            >
              Darstellung
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Farbe</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={selectedObject.color || "#3B82F6"}
                    onChange={(e) =>
                      onUpdateObject(selectedObject.id, {
                        color: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Rotation</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={selectedObject.rotation || 0}
                    onChange={(e) =>
                      onUpdateObject(selectedObject.id, {
                        rotation: parseInt(e.target.value) || 0,
                      })
                    }
                    className={cn(
                      "h-8 text-sm w-16",
                      theme === "dark" ? "bg-slate-800 border-slate-600" : "",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      theme === "dark" ? "text-slate-400" : "text-slate-500",
                    )}
                  >
                    °
                  </span>
                </div>
              </div>
            </div>

            {/* Shadow Toggle */}
            <div className="flex items-center justify-between mt-3">
              <Label className="text-xs">Schatten</Label>
              <Switch
                checked={selectedObject.shadow || false}
                onCheckedChange={(v) =>
                  onUpdateObject(selectedObject.id, { shadow: v })
                }
              />
            </div>

            {/* Layer Controls */}
            <div className="mt-3">
              <Label className="text-xs">Ebene</Label>
              <div className="flex items-center gap-2 mt-1">
                <Select
                  value={selectedObject.layer || "default"}
                  onValueChange={(v) =>
                    onUpdateObject(selectedObject.id, {
                      layer: v as "background" | "default" | "foreground",
                    })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 text-xs flex-1",
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
                    <SelectItem value="background">Hintergrund</SelectItem>
                    <SelectItem value="default">Standard</SelectItem>
                    <SelectItem value="foreground">Vordergrund</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onBringToFront(selectedObject.id)}
                  title="Nach vorne bringen"
                  className={cn(
                    "h-8 w-8",
                    theme === "dark"
                      ? "border-slate-600 hover:bg-slate-700"
                      : "",
                  )}
                >
                  <ArrowFatLineUp size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSendToBack(selectedObject.id)}
                  title="Nach hinten senden"
                  className={cn(
                    "h-8 w-8",
                    theme === "dark"
                      ? "border-slate-600 hover:bg-slate-700"
                      : "",
                  )}
                >
                  <ArrowFatLineDown size={14} />
                </Button>
              </div>
            </div>

            {/* Lock & Visibility */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="locked"
                  checked={selectedObject.locked || false}
                  onCheckedChange={(v) =>
                    onUpdateObject(selectedObject.id, { locked: v })
                  }
                />
                <Label htmlFor="locked" className="text-xs">
                  Gesperrt
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="visible"
                  checked={selectedObject.visible !== false}
                  onCheckedChange={(v) =>
                    onUpdateObject(selectedObject.id, { visible: v })
                  }
                />
                <Label htmlFor="visible" className="text-xs">
                  Sichtbar
                </Label>
              </div>
            </div>
          </div>

          <Separator className={theme === "dark" ? "bg-slate-700" : ""} />

          {/* Property Groups */}
          {Object.entries(groupedProperties).map(([groupName, fields]) => (
            <div key={groupName}>
              <button
                onClick={() => toggleGroup(groupName)}
                className={cn(
                  "flex items-center justify-between w-full text-left py-1",
                  theme === "dark" ? "text-slate-300" : "text-slate-700",
                )}
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  {groupName}
                </h4>
                {expandedGroups.has(groupName) ? (
                  <CaretUp size={14} />
                ) : (
                  <CaretDown size={14} />
                )}
              </button>

              {expandedGroups.has(groupName) && (
                <div className="space-y-3 mt-2">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <Label
                        htmlFor={field.key}
                        className={cn(
                          "text-xs mb-1 flex items-center gap-1",
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-600",
                        )}
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      {renderPropertyField(field)}
                      {field.helpText && (
                        <p
                          className={cn(
                            "text-xs mt-1",
                            theme === "dark"
                              ? "text-slate-500"
                              : "text-slate-400",
                          )}
                        >
                          {field.helpText}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Size Properties for shapes */}
          {selectedObject.shapeWidth && selectedObject.shapeHeight && (
            <>
              <Separator className={theme === "dark" ? "bg-slate-700" : ""} />
              <div>
                <h4
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider mb-3",
                    theme === "dark" ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  Größe
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Breite</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[selectedObject.shapeWidth]}
                        onValueChange={([v]) =>
                          onUpdateObject(selectedObject.id, { shapeWidth: v })
                        }
                        min={20}
                        max={300}
                        step={10}
                        className="flex-1"
                      />
                      <span
                        className={cn(
                          "text-xs w-8 text-right",
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-500",
                        )}
                      >
                        {selectedObject.shapeWidth}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Höhe</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[selectedObject.shapeHeight]}
                        onValueChange={([v]) =>
                          onUpdateObject(selectedObject.id, { shapeHeight: v })
                        }
                        min={20}
                        max={300}
                        step={10}
                        className="flex-1"
                      />
                      <span
                        className={cn(
                          "text-xs w-8 text-right",
                          theme === "dark"
                            ? "text-slate-400"
                            : "text-slate-500",
                        )}
                      >
                        {selectedObject.shapeHeight}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Debug Info (collapsed by default) */}
          <details
            className={cn(
              "mt-4 text-xs",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          >
            <summary className="cursor-pointer hover:text-slate-300">
              Debug Info
            </summary>
            <pre className="mt-2 p-2 rounded bg-slate-800/50 overflow-x-auto">
              {JSON.stringify(
                {
                  id: selectedObject.id,
                  type: selectedObject.type,
                  shapeId: selectedObject.shapeId,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </div>
      </ScrollArea>
    </div>
  );
}

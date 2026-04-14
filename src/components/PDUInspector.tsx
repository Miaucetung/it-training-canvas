import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { buildPDUInspection, ConnectivityHop } from "@/lib/networking-engine";
import { DrawingObject, PDUFrame, PDUInspection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CaretDown, CaretRight, X } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";

interface PDUInspectorProps {
  sourceShape: DrawingObject | null;
  targetShape: DrawingObject | null;
  protocol?: string;
  hopIndex?: number;
  hop?: ConnectivityHop;
  onClose: () => void;
  theme: "light" | "dark";
}

const LAYER_COLORS: Record<string, string> = {
  L1: "bg-slate-600",
  L2: "bg-blue-600",
  L3: "bg-green-600",
  L4: "bg-orange-600",
  L7: "bg-red-600",
};

const LAYER_LABELS: Record<string, string> = {
  L1: "1 — Physical",
  L2: "2 — Data Link",
  L3: "3 — Network",
  L4: "4 — Transport",
  L7: "7 — Application",
};

const DEFAULT_HOP: ConnectivityHop = {
  shapeId: "",
  ip: "0.0.0.0",
  mac: "00:00:00:00:00:00",
  action: "forward",
};

export function PDUInspector({
  sourceShape,
  targetShape,
  protocol = "ICMP",
  hopIndex = 0,
  hop,
  onClose,
  theme,
}: PDUInspectorProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(
    new Set(["L2", "L3", "L4"]),
  );

  const pdu: PDUInspection | null = useMemo(() => {
    if (!sourceShape || !targetShape) return null;
    return buildPDUInspection(
      sourceShape,
      targetShape,
      protocol,
      hopIndex,
      hop || DEFAULT_HOP,
    );
  }, [sourceShape, targetShape, protocol, hopIndex, hop]);

  const toggleLayer = useCallback((layer: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  }, []);

  if (!pdu) return null;

  const srcIp = sourceShape?.config?.ipAddress || "?";
  const dstIp = targetShape?.config?.ipAddress || "?";

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-[420px] max-h-[500px] rounded-lg border shadow-xl z-50",
        theme === "dark"
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : "bg-white border-slate-200 text-slate-900",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b",
          theme === "dark" ? "border-slate-700" : "border-slate-200",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">PDU Inspector</span>
          <Badge variant="outline" className="text-xs">
            {protocol}
          </Badge>
          {hop && (
            <Badge variant="secondary" className="text-xs">
              Hop {hopIndex + 1}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      </div>

      {/* Source → Target */}
      <div
        className={cn(
          "px-4 py-2 text-xs font-mono",
          theme === "dark" ? "bg-slate-800" : "bg-slate-50",
        )}
      >
        <span className="text-blue-500">{srcIp}</span>
        <span className="mx-2">→</span>
        <span className="text-green-500">{dstIp}</span>
        <span className="ml-2 text-muted-foreground">({protocol})</span>
      </div>

      {/* Frames (OSI Layers) */}
      <ScrollArea className="max-h-[380px]">
        <div className="p-2 space-y-1">
          {pdu.frames.map((frame: PDUFrame) => {
            const isExpanded = expandedLayers.has(frame.layer);
            return (
              <div key={frame.layer} className="rounded overflow-hidden">
                {/* Layer Header */}
                <button
                  onClick={() => toggleLayer(frame.layer)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white",
                    LAYER_COLORS[frame.layer] || "bg-slate-600",
                  )}
                >
                  {isExpanded ? (
                    <CaretDown size={12} />
                  ) : (
                    <CaretRight size={12} />
                  )}
                  <span className="font-medium">
                    {LAYER_LABELS[frame.layer] || frame.layer}
                  </span>
                  <span className="ml-auto opacity-80">{frame.name}</span>
                </button>

                {/* Layer Fields */}
                {isExpanded && (
                  <div
                    className={cn(
                      "px-3 py-1 space-y-0.5",
                      theme === "dark" ? "bg-slate-800/50" : "bg-slate-50",
                    )}
                  >
                    {frame.fields.map((field, fi) => (
                      <div
                        key={fi}
                        className="flex items-center justify-between text-xs font-mono py-0.5"
                      >
                        <span className="text-muted-foreground">
                          {field.name}
                          {field.size && (
                            <span className="ml-1 opacity-50">
                              ({field.size})
                            </span>
                          )}
                        </span>
                        <span>{field.value}</span>
                      </div>
                    ))}
                    {frame.fields.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">
                        Keine Header-Daten
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Raw data */}
        {pdu.rawData && (
          <>
            <Separator className="mx-2" />
            <div
              className={cn(
                "px-4 py-2",
                theme === "dark" ? "bg-slate-800/30" : "bg-slate-50/50",
              )}
            >
              <div className="text-[10px] font-mono text-muted-foreground leading-tight whitespace-pre">
                <span className="font-medium text-xs">Hex Dump:</span>
                <br />
                {pdu.rawData}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}

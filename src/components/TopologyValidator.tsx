import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  validateTopology,
  type TopologyIssue,
} from "@/lib/connection-compatibility";
import type { ConnectionType } from "@/lib/shape-properties";
import type { CableType } from "@/lib/types";
import type { CanvasConnection, DrawingObject } from "@/lib/types";
import { CheckCircle, Warning, XCircle, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TopologyValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objects: DrawingObject[];
  connections: CanvasConnection[];
  theme: "light" | "dark";
  onSelectObject?: (id: string) => void;
}

export function TopologyValidator({
  open,
  onOpenChange,
  objects,
  connections,
  theme,
  onSelectObject,
}: TopologyValidatorProps) {
  const issues = useMemo<TopologyIssue[]>(() => {
    const connInfo = connections.map((c) => ({
      id: c.id,
      sourceId: c.sourceShapeId,
      targetId: c.targetShapeId,
      connectionType: c.connectionType as ConnectionType,
      cableType: c.cableType as CableType | undefined,
    }));
    return validateTopology(objects, connInfo);
  }, [objects, connections]);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  const labelFor = (id?: string) => {
    if (!id) return undefined;
    const o = objects.find((x) => x.id === id);
    return o?.label || o?.shapeId || id.slice(0, 8);
  };

  const renderIssue = (issue: TopologyIssue, idx: number) => {
    const Icon =
      issue.severity === "error"
        ? XCircle
        : issue.severity === "warning"
          ? Warning
          : Info;
    const color =
      issue.severity === "error"
        ? "text-red-500"
        : issue.severity === "warning"
          ? "text-amber-500"
          : "text-blue-500";
    const targetId = issue.shapeId;
    const targetLabel = labelFor(issue.shapeId);

    return (
      <button
        key={idx}
        onClick={() => targetId && onSelectObject?.(targetId)}
        disabled={!targetId}
        className={cn(
          "w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors",
          theme === "dark"
            ? "bg-slate-800/40 border-slate-700 hover:bg-slate-800"
            : "bg-slate-50 border-slate-200 hover:bg-slate-100",
          !targetId && "cursor-default opacity-90",
        )}
      >
        <Icon size={18} className={cn("shrink-0 mt-0.5", color)} />
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-medium",
              theme === "dark" ? "text-slate-200" : "text-slate-800",
            )}
          >
            {issue.message}
            {targetLabel && (
              <Badge variant="outline" className="ml-2 text-[10px]">
                {targetLabel}
              </Badge>
            )}
          </div>
          {issue.suggestion && (
            <div
              className={cn(
                "text-xs mt-1",
                theme === "dark" ? "text-slate-400" : "text-slate-600",
              )}
            >
              → {issue.suggestion}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[80vh]",
          theme === "dark" ? "bg-slate-900 border-slate-700" : "",
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "flex items-center gap-2",
              theme === "dark" ? "text-white" : "",
            )}
          >
            Topologie-Prüfung
            <div className="flex gap-2 ml-auto text-xs font-normal">
              <Badge variant="destructive">{errors.length} Fehler</Badge>
              <Badge className="bg-amber-500 hover:bg-amber-600">
                {warnings.length} Warnungen
              </Badge>
              <Badge variant="secondary">{infos.length} Hinweise</Badge>
            </div>
          </DialogTitle>
          <DialogDescription
            className={theme === "dark" ? "text-slate-400" : ""}
          >
            Validierung der Verkabelung, IP-Konfiguration und Best Practices.
          </DialogDescription>
        </DialogHeader>

        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle size={48} className="text-emerald-500" />
            <div
              className={cn(
                "text-lg font-semibold",
                theme === "dark" ? "text-slate-100" : "text-slate-800",
              )}
            >
              Keine Probleme gefunden
            </div>
            <div
              className={cn(
                "text-sm",
                theme === "dark" ? "text-slate-400" : "text-slate-600",
              )}
            >
              Deine Topologie sieht sauber aus.
            </div>
          </div>
        ) : (
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-4 pr-3">
              {errors.length > 0 && (
                <section>
                  <h3
                    className={cn(
                      "text-xs font-semibold uppercase mb-2",
                      "text-red-500",
                    )}
                  >
                    Fehler ({errors.length})
                  </h3>
                  <div className="space-y-2">
                    {errors.map((i, idx) => renderIssue(i, idx))}
                  </div>
                </section>
              )}
              {warnings.length > 0 && (
                <section>
                  <h3
                    className={cn(
                      "text-xs font-semibold uppercase mb-2",
                      "text-amber-500",
                    )}
                  >
                    Warnungen ({warnings.length})
                  </h3>
                  <div className="space-y-2">
                    {warnings.map((i, idx) => renderIssue(i, idx))}
                  </div>
                </section>
              )}
              {infos.length > 0 && (
                <section>
                  <h3
                    className={cn(
                      "text-xs font-semibold uppercase mb-2",
                      "text-blue-500",
                    )}
                  >
                    Hinweise ({infos.length})
                  </h3>
                  <div className="space-y-2">
                    {infos.map((i, idx) => renderIssue(i, idx))}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

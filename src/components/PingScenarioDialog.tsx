import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { simulatePacketTrace } from "@/lib/network-simulator";
import {
  CanvasConnection,
  DrawingObject,
  PacketFlowStep,
  PacketFlowTrace,
} from "@/lib/types";
import {
  ArrowRight,
  ArrowsClockwise,
  CheckCircle,
  Lightning,
  Play,
  SkipForward,
  XCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PingScenarioDialogProps {
  open: boolean;
  onClose: () => void;
  objects: DrawingObject[];
  connections: CanvasConnection[];
  initialSourceId?: string;
  initialTargetId?: string;
}

/**
 * Focused, intuitive ping visualizer.
 * - One question at a time
 * - Big animated path
 * - Per-hop card with plain-language verdict
 * - On failure: stops at faulty hop with red flash + reason
 */
export function PingScenarioDialog({
  open,
  onClose,
  objects,
  connections,
  initialSourceId,
  initialTargetId,
}: PingScenarioDialogProps) {
  const endpoints = useMemo(
    () =>
      objects.filter(
        (o) => o.type === "shape" && (o.config?.ipAddress || o.label),
      ),
    [objects],
  );

  const [sourceId, setSourceId] = useState(initialSourceId || "");
  const [targetId, setTargetId] = useState(initialTargetId || "");
  const [trace, setTrace] = useState<PacketFlowTrace | null>(null);
  const [stepIdx, setStepIdx] = useState(-1);
  const [autoPlay, setAutoPlay] = useState(false);

  // Default selection
  useEffect(() => {
    if (open && !sourceId && endpoints.length >= 2) {
      setSourceId(endpoints[0].id);
      setTargetId(endpoints[endpoints.length - 1].id);
    }
  }, [open, endpoints, sourceId]);

  const labelFor = useCallback(
    (id: string) =>
      objects.find((o) => o.id === id)?.label ||
      objects.find((o) => o.id === id)?.shapeId ||
      id.slice(0, 8),
    [objects],
  );

  const runPing = useCallback(() => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const t = simulatePacketTrace(
      sourceId,
      targetId,
      "PING",
      objects,
      connections,
    );
    setTrace(t);
    setStepIdx(t.steps.length > 0 ? 0 : -1);
    setAutoPlay(true);
  }, [sourceId, targetId, objects, connections]);

  // Auto-advance steps
  useEffect(() => {
    if (!autoPlay || !trace || stepIdx < 0) return;
    if (stepIdx >= trace.steps.length - 1) {
      setAutoPlay(false);
      return;
    }
    const step = trace.steps[stepIdx];
    if (step.status === "dropped") {
      setAutoPlay(false); // stop at failure so user can read
      return;
    }
    const t = setTimeout(() => setStepIdx((i) => i + 1), 1200);
    return () => clearTimeout(t);
  }, [autoPlay, stepIdx, trace]);

  const reset = () => {
    setTrace(null);
    setStepIdx(-1);
    setAutoPlay(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightning size={22} weight="fill" className="text-cyan-400" />
            Ping Szenario — Schritt für Schritt
          </DialogTitle>
        </DialogHeader>

        {/* Source / Target picker */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Von</label>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Quelle wählen" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {endpoints.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {labelFor(o.id)}
                    {o.config?.ipAddress ? ` (${o.config.ipAddress})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ArrowRight size={20} className="text-slate-500 mb-2" />
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nach</label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Ziel wählen" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {endpoints.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {labelFor(o.id)}
                    {o.config?.ipAddress ? ` (${o.config.ipAddress})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={runPing}
            disabled={!sourceId || !targetId || sourceId === targetId}
            className="bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            <Play size={16} weight="fill" className="mr-1" />
            Ping
          </Button>
        </div>

        {/* Result area */}
        {trace && (
          <div className="mt-4 space-y-4">
            {/* Verdict banner */}
            <ResultBanner trace={trace} />

            {/* Hop chain */}
            <HopChain
              trace={trace}
              currentIdx={stepIdx}
              labelFor={labelFor}
            />

            {/* Active hop detail card */}
            {stepIdx >= 0 && trace.steps[stepIdx] && (
              <HopDetailCard
                step={trace.steps[stepIdx]}
                hopNum={stepIdx + 1}
                total={trace.steps.length}
                labelFor={labelFor}
              />
            )}

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStepIdx((i) =>
                      Math.min((trace?.steps.length || 1) - 1, i + 1),
                    )
                  }
                  disabled={stepIdx >= trace.steps.length - 1}
                  className="border-slate-700 bg-slate-800"
                >
                  <SkipForward size={14} className="mr-1" />
                  Nächster Hop
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStepIdx(0);
                    setAutoPlay(true);
                  }}
                  className="border-slate-700 bg-slate-800"
                >
                  <Play size={14} className="mr-1" />
                  Replay
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-slate-400"
              >
                <ArrowsClockwise size={14} className="mr-1" />
                Neu
              </Button>
            </div>
          </div>
        )}

        {!trace && (
          <div className="mt-6 p-6 rounded-lg border border-dashed border-slate-700 text-center text-slate-400 text-sm">
            Wähle Quelle und Ziel und klicke <b>Ping</b>.<br />
            Du siehst dann <b>jeden Hop einzeln</b> mit Erklärung — und bei
            Fehler genau wo&apos;s hakt.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function ResultBanner({ trace }: { trace: PacketFlowTrace }) {
  if (trace.steps.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <XCircle size={28} weight="fill" className="text-red-400 shrink-0" />
        <div>
          <div className="font-semibold text-red-300">Kein Pfad gefunden</div>
          <div className="text-xs text-red-200/70">
            Quelle und Ziel sind nicht verbunden oder L2/L3 falsch konfiguriert.
          </div>
        </div>
      </div>
    );
  }
  if (trace.success) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <CheckCircle
          size={28}
          weight="fill"
          className="text-emerald-400 shrink-0"
        />
        <div>
          <div className="font-semibold text-emerald-300">
            Ping erfolgreich — {trace.steps.length} Hop
            {trace.steps.length === 1 ? "" : "s"}
          </div>
          <div className="text-xs text-emerald-200/70">
            ICMP Echo Reply zurückerhalten.
          </div>
        </div>
      </div>
    );
  }
  const lastStep = trace.steps[trace.steps.length - 1];
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
      <XCircle size={28} weight="fill" className="text-red-400 shrink-0" />
      <div>
        <div className="font-semibold text-red-300">
          Ping fehlgeschlagen bei Hop {trace.steps.length}
        </div>
        <div className="text-xs text-red-200/70">
          {lastStep.data.detail || "Paket konnte nicht weitergeleitet werden."}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function HopChain({
  trace,
  currentIdx,
  labelFor,
}: {
  trace: PacketFlowTrace;
  currentIdx: number;
  labelFor: (id: string) => string;
}) {
  // Build node sequence: from + each step.to
  const nodes: string[] =
    trace.steps.length === 0
      ? []
      : [
          trace.steps[0].fromShapeId,
          ...trace.steps.map((s) => s.toShapeId),
        ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {nodes.map((id, i) => {
        const reached = i <= currentIdx + 1;
        const isCurrent = i === currentIdx + 1;
        const stepBefore = i > 0 ? trace.steps[i - 1] : null;
        const failed = stepBefore?.status === "dropped";
        return (
          <div key={`${id}-${i}`} className="flex items-center gap-2 shrink-0">
            {i > 0 && (
              <div
                className={`h-0.5 w-10 transition-colors ${
                  failed
                    ? "bg-red-500"
                    : reached
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                }`}
              />
            )}
            <div
              className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                isCurrent
                  ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 scale-110 shadow-lg shadow-cyan-500/30"
                  : reached && !failed
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                    : failed && i === currentIdx + 1
                      ? "border-red-500 bg-red-500/10 text-red-300"
                      : "border-slate-700 bg-slate-800 text-slate-400"
              }`}
            >
              {labelFor(id)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function HopDetailCard({
  step,
  hopNum,
  total,
  labelFor,
}: {
  step: PacketFlowStep;
  hopNum: number;
  total: number;
  labelFor: (id: string) => string;
}) {
  const ok = step.status !== "dropped";
  return (
    <div
      className={`p-4 rounded-lg border ${
        ok
          ? "border-cyan-500/30 bg-cyan-500/5"
          : "border-red-500/40 bg-red-500/10"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white">
          Hop {hopNum} / {total}: {labelFor(step.fromShapeId)}{" "}
          <ArrowRight size={14} className="inline text-slate-400" />{" "}
          {labelFor(step.toShapeId)}
        </div>
        {ok ? (
          <CheckCircle
            size={20}
            weight="fill"
            className="text-emerald-400"
          />
        ) : (
          <XCircle size={20} weight="fill" className="text-red-400" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Aktion" value={step.data.action || step.protocol} />
        <Field label="Layer" value={step.layer} />
        <Field label="Quelle IP" value={step.data.srcIp} />
        <Field label="Ziel IP" value={step.data.dstIp} />
        <Field label="TTL" value={step.data.ttl} />
        <Field label="Dauer" value={`${step.duration} ms`} />
      </div>
      {step.data.detail && (
        <div
          className={`mt-3 text-xs leading-relaxed ${
            ok ? "text-slate-300" : "text-red-200"
          }`}
        >
          <span className="opacity-60">Erklärung: </span>
          {step.data.detail}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between px-2 py-1 rounded bg-slate-800/50">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-mono">{value || "—"}</span>
    </div>
  );
}

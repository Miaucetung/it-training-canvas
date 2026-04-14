import { simulatePacketTrace } from "@/lib/network-simulator";
import {
  CanvasConnection,
  DrawingObject,
  NetworkSimConfig,
  PacketFlowTrace,
} from "@/lib/types";
import {
  ArrowRight,
  CaretDown,
  CaretRight,
  CheckCircle,
  Lightning,
  MagnifyingGlass,
  Play,
  Sliders,
  Spinner,
  Stop,
  Warning,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PacketFlowVisualizerProps {
  objects: DrawingObject[];
  connections: CanvasConnection[];
  theme: "light" | "dark";
  onClose: () => void;
  onHighlightConnection?: (connectionId: string | null) => void;
  onInspectPDU?: (
    sourceId: string,
    targetId: string,
    protocol: string,
    hopIndex: number,
  ) => void;
}

export function PacketFlowVisualizer({
  objects,
  connections,
  theme,
  onClose,
  onHighlightConnection,
  onInspectPDU,
}: PacketFlowVisualizerProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";
  const inputBg = isDark ? "bg-slate-800" : "bg-slate-50";

  const shapes = objects.filter((obj) => obj.type === "shape");

  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [protocol, setProtocol] = useState("PING");
  const [traces, setTraces] = useState<PacketFlowTrace[]>([]);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingStepIndex, setAnimatingStepIndex] = useState(-1);
  const [showConfig, setShowConfig] = useState(false);
  const [networkConfig, setNetworkConfig] = useState<NetworkSimConfig>({
    latencyMs: 20,
    packetLossPercent: 0,
    bandwidthMbps: 1000,
    jitterMs: 2,
  });

  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSimulate = useCallback(() => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const trace = simulatePacketTrace(
      sourceId,
      targetId,
      protocol,
      objects,
      connections,
      networkConfig,
    );

    setTraces((prev) => [trace, ...prev].slice(0, 20));
    setExpandedTrace(trace.id);

    // Animate through steps
    setIsAnimating(true);
    setAnimatingStepIndex(0);

    let stepIdx = 0;
    const animateNext = () => {
      if (stepIdx < trace.steps.length) {
        setAnimatingStepIndex(stepIdx);
        const step = trace.steps[stepIdx];
        onHighlightConnection?.(step.connectionId);
        stepIdx++;
        animationTimerRef.current = setTimeout(
          animateNext,
          Math.max(200, step.duration * 5),
        );
      } else {
        setIsAnimating(false);
        setAnimatingStepIndex(-1);
        onHighlightConnection?.(null);
      }
    };
    animateNext();
  }, [
    sourceId,
    targetId,
    protocol,
    objects,
    connections,
    networkConfig,
    onHighlightConnection,
  ]);

  const stopAnimation = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    setIsAnimating(false);
    setAnimatingStepIndex(-1);
    onHighlightConnection?.(null);
  }, [onHighlightConnection]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  const getShapeLabel = (shapeId: string) => {
    const shape = objects.find((o) => o.id === shapeId);
    return shape?.label || shape?.shapeId || shapeId.slice(0, 10);
  };

  const STATUS_ICONS: Record<string, React.ReactNode> = {
    delivered: (
      <CheckCircle size={14} className="text-green-400" weight="fill" />
    ),
    dropped: <XCircle size={14} className="text-red-400" weight="fill" />,
    timeout: <Warning size={14} className="text-amber-400" weight="fill" />,
    "in-transit": <Spinner size={14} className="text-blue-400 animate-spin" />,
    pending: (
      <span
        className={`w-2 h-2 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"}`}
      />
    ),
  };

  const LAYER_COLORS: Record<string, string> = {
    L2: "text-emerald-400",
    L3: "text-blue-400",
    L4: "text-purple-400",
    L7: "text-amber-400",
  };

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 w-[420px] max-w-[95vw] z-40 ${bg} ${border} border-l shadow-2xl flex flex-col`}
    >
      {/* Header */}
      <div className={`px-5 py-4 border-b ${border}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightning size={20} className="text-cyan-400" weight="fill" />
            <h3 className={`font-bold ${text}`}>Packet Flow</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${textMuted} hover:bg-slate-700/30`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Source/Target Selection */}
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs ${inputBg} ${text} border ${border}`}
            >
              <option value="">Quelle wählen...</option>
              {shapes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || s.shapeId || s.id.slice(0, 12)}
                </option>
              ))}
            </select>
            <ArrowRight size={16} className={textMuted} />
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs ${inputBg} ${text} border ${border}`}
            >
              <option value="">Ziel wählen...</option>
              {shapes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label || s.shapeId || s.id.slice(0, 12)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs ${inputBg} ${text} border ${border}`}
            >
              <option value="PING">PING (ICMP)</option>
              <option value="TCP">TCP</option>
              <option value="UDP">UDP</option>
              <option value="HTTP">HTTP</option>
              <option value="HTTPS">HTTPS</option>
              <option value="DNS">DNS</option>
              <option value="SSH">SSH</option>
            </select>

            {isAnimating ? (
              <button
                onClick={stopAnimation}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors flex items-center gap-1"
              >
                <Stop size={14} weight="fill" /> Stopp
              </button>
            ) : (
              <button
                onClick={handleSimulate}
                disabled={!sourceId || !targetId || sourceId === targetId}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-medium hover:bg-cyan-500/30 disabled:opacity-30 transition-colors flex items-center gap-1"
              >
                <Play size={14} weight="fill" /> Senden
              </button>
            )}

            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1.5 rounded-lg transition-colors ${showConfig ? "bg-indigo-500/20 text-indigo-300" : `${textMuted} hover:bg-slate-700/30`}`}
            >
              <Sliders size={16} />
            </button>
          </div>

          {/* Network Config */}
          {showConfig && (
            <div
              className={`p-3 rounded-lg ${cardBg} border ${border} space-y-2`}
            >
              <h4 className={`text-xs font-semibold ${text}`}>
                Netzwerk-Konfiguration
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[10px] ${textMuted}`}>
                    Latenz (ms)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={networkConfig.latencyMs}
                    onChange={(e) =>
                      setNetworkConfig((p) => ({
                        ...p,
                        latencyMs: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className={`w-full px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textMuted}`}>
                    Paketverlust (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={networkConfig.packetLossPercent}
                    onChange={(e) =>
                      setNetworkConfig((p) => ({
                        ...p,
                        packetLossPercent: Math.max(
                          0,
                          Math.min(100, parseInt(e.target.value) || 0),
                        ),
                      }))
                    }
                    className={`w-full px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textMuted}`}>
                    Bandbreite (Mbps)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={networkConfig.bandwidthMbps}
                    onChange={(e) =>
                      setNetworkConfig((p) => ({
                        ...p,
                        bandwidthMbps: Math.max(
                          1,
                          parseInt(e.target.value) || 1,
                        ),
                      }))
                    }
                    className={`w-full px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] ${textMuted}`}>
                    Jitter (ms)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={networkConfig.jitterMs}
                    onChange={(e) =>
                      setNetworkConfig((p) => ({
                        ...p,
                        jitterMs: Math.max(0, parseInt(e.target.value) || 0),
                      }))
                    }
                    className={`w-full px-2 py-1 rounded text-xs ${inputBg} ${text} border ${border}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Traces */}
      <div className="flex-1 overflow-y-auto">
        {traces.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-full ${textMuted}`}
          >
            <Lightning size={48} className="opacity-20 mb-3" />
            <p className="text-sm">Keine Packet Traces</p>
            <p className="text-xs mt-1">
              Wähle Quelle & Ziel und sende ein Paket
            </p>
          </div>
        ) : (
          traces.map((trace) => {
            const isExpanded = expandedTrace === trace.id;
            return (
              <div key={trace.id} className={`border-b ${border}`}>
                <button
                  onClick={() => setExpandedTrace(isExpanded ? null : trace.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-800/30 transition-colors`}
                >
                  {trace.success ? (
                    <CheckCircle
                      size={18}
                      className="text-green-400 shrink-0"
                      weight="fill"
                    />
                  ) : (
                    <XCircle
                      size={18}
                      className="text-red-400 shrink-0"
                      weight="fill"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium ${text} truncate`}>
                      {trace.protocol} {getShapeLabel(trace.sourceShapeId)} →{" "}
                      {getShapeLabel(trace.targetShapeId)}
                    </div>
                    <div className={`text-[10px] ${textMuted}`}>
                      {trace.steps.length} Hops •{" "}
                      {trace.completedAt
                        ? `${trace.completedAt - trace.startedAt}ms`
                        : "N/A"}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${trace.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                  >
                    {trace.success ? "OK" : "FAIL"}
                  </span>
                  {isExpanded ? (
                    <CaretDown size={14} className={textMuted} />
                  ) : (
                    <CaretRight size={14} className={textMuted} />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-1">
                    {trace.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs transition-colors ${
                          animatingStepIndex === idx && isAnimating
                            ? "bg-cyan-500/10 border border-cyan-500/30"
                            : cardBg
                        }`}
                        onMouseEnter={() =>
                          onHighlightConnection?.(step.connectionId)
                        }
                        onMouseLeave={() => onHighlightConnection?.(null)}
                      >
                        {/* Timeline */}
                        <div className="flex flex-col items-center shrink-0 w-5">
                          <div className="w-0.5 h-2 bg-slate-700" />
                          {STATUS_ICONS[step.status]}
                          <div className="w-0.5 h-2 bg-slate-700" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={text}>
                              {getShapeLabel(step.fromShapeId)} →{" "}
                              {getShapeLabel(step.toShapeId)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${LAYER_COLORS[step.layer] || textMuted} bg-slate-700/50`}
                            >
                              {step.layer}
                            </span>
                          </div>
                          <div
                            className={`flex gap-3 ${textMuted} text-[10px]`}
                          >
                            <span>{step.duration}ms</span>
                            <span>TTL: {step.data.ttl}</span>
                            <span>
                              {step.data.srcIp} → {step.data.dstIp}
                            </span>
                            {step.data.retransmission && (
                              <span className="text-amber-400">
                                Retransmission
                              </span>
                            )}
                          </div>
                        </div>
                        {onInspectPDU && (
                          <button
                            onClick={() =>
                              onInspectPDU(
                                trace.sourceShapeId,
                                trace.targetShapeId,
                                trace.protocol,
                                idx,
                              )
                            }
                            className={`shrink-0 px-2 py-1 rounded text-[10px] font-medium hover:bg-cyan-500/20 transition-colors ${isDark ? "text-cyan-400 border-cyan-400/30" : "text-cyan-600 border-cyan-600/30"} border`}
                            title="PDU Inspector öffnen"
                          >
                            <MagnifyingGlass
                              size={12}
                              className="inline mr-0.5"
                            />
                            PDU
                          </button>
                        )}
                      </div>
                    ))}

                    {trace.steps.length === 0 && (
                      <div className={`text-center py-4 ${textMuted} text-xs`}>
                        <XCircle
                          size={20}
                          className="mx-auto mb-1 text-red-400"
                        />
                        Kein Pfad gefunden. Shapes sind nicht verbunden.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      {traces.length > 0 && (
        <div
          className={`px-5 py-3 border-t ${border} flex items-center justify-between text-xs ${textMuted}`}
        >
          <span>{traces.length} Traces</span>
          <span>
            {traces.filter((t) => t.success).length} OK /{" "}
            {traces.filter((t) => !t.success).length} Failed
          </span>
          <button
            onClick={() => setTraces([])}
            className="hover:text-red-400 transition-colors"
          >
            Alle löschen
          </button>
        </div>
      )}
    </div>
  );
}

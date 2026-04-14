import { generateShapeMetrics } from "@/lib/network-simulator";
import { DrawingObject, MetricDataPoint, ShapeMetrics } from "@/lib/types";
import {
  ArrowsClockwise,
  ChartLine,
  Cpu,
  HardDrive,
  Memory,
  Pulse,
  WifiHigh,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface MetricsDashboardProps {
  objects: DrawingObject[];
  theme: "light" | "dark";
  onClose: () => void;
}

type MetricKey =
  | "cpu"
  | "memory"
  | "networkIn"
  | "networkOut"
  | "diskRead"
  | "diskWrite"
  | "latency"
  | "requestsPerSec"
  | "errorRate";

const METRIC_CONFIG: Record<
  MetricKey,
  { label: string; unit: string; color: string; icon: React.ReactNode }
> = {
  cpu: { label: "CPU", unit: "%", color: "#3b82f6", icon: <Cpu size={14} /> },
  memory: {
    label: "Memory",
    unit: "%",
    color: "#8b5cf6",
    icon: <Memory size={14} />,
  },
  networkIn: {
    label: "Net In",
    unit: "Mbps",
    color: "#10b981",
    icon: <WifiHigh size={14} />,
  },
  networkOut: {
    label: "Net Out",
    unit: "Mbps",
    color: "#06b6d4",
    icon: <WifiHigh size={14} />,
  },
  diskRead: {
    label: "Disk Read",
    unit: "MB/s",
    color: "#f59e0b",
    icon: <HardDrive size={14} />,
  },
  diskWrite: {
    label: "Disk Write",
    unit: "MB/s",
    color: "#ef4444",
    icon: <HardDrive size={14} />,
  },
  latency: {
    label: "Latency",
    unit: "ms",
    color: "#ec4899",
    icon: <Pulse size={14} />,
  },
  requestsPerSec: {
    label: "Req/s",
    unit: "req/s",
    color: "#14b8a6",
    icon: <ChartLine size={14} />,
  },
  errorRate: {
    label: "Errors",
    unit: "%",
    color: "#ef4444",
    icon: <Pulse size={14} />,
  },
};

function MiniChart({
  data,
  color,
  width = 200,
  height = 60,
  showArea = true,
  theme,
}: {
  data: MetricDataPoint[];
  color: string;
  width?: number;
  height?: number;
  showArea?: boolean;
  theme: "light" | "dark";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const values = data.map((d) => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;

    const padding = 2;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Draw area
    if (showArea) {
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      data.forEach((d, i) => {
        const x = padding + (i / (data.length - 1)) * chartW;
        const y = padding + chartH - ((d.value - minVal) / range) * chartH;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(padding + chartW, height - padding);
      ctx.closePath();
      ctx.fillStyle = color + "15";
      ctx.fill();
    }

    // Draw line
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartW;
      const y = padding + chartH - ((d.value - minVal) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw latest value dot
    const lastX = padding + chartW;
    const lastY =
      padding +
      chartH -
      ((values[values.length - 1] - minVal) / range) * chartH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color, width, height, showArea, theme]);

  return <canvas ref={canvasRef} style={{ width, height }} className="block" />;
}

export function MetricsDashboard({
  objects,
  theme,
  onClose,
}: MetricsDashboardProps) {
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const border = isDark ? "border-slate-700" : "border-slate-200";
  const text = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg = isDark ? "bg-slate-800/50" : "bg-slate-50";

  const shapes = useMemo(
    () => objects.filter((obj) => obj.type === "shape"),
    [objects],
  );

  const [selectedShapeId, setSelectedShapeId] = useState<string>(
    shapes[0]?.id || "",
  );
  const [metrics, setMetrics] = useState<Record<string, ShapeMetrics>>({});
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>([
    "cpu",
    "memory",
    "networkIn",
    "latency",
  ]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refreshMetrics = useCallback(() => {
    const newMetrics: Record<string, ShapeMetrics> = {};
    shapes.forEach((shape) => {
      newMetrics[shape.id] = generateShapeMetrics(shape.id, shape);
    });
    setMetrics(newMetrics);
  }, [shapes]);

  useEffect(() => {
    refreshMetrics();
  }, [shapes.length]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshMetrics]);

  const selectedMetrics = metrics[selectedShapeId];
  const selectedShape = shapes.find((s) => s.id === selectedShapeId);

  const getLatestValue = (data: MetricDataPoint[]) => {
    if (data.length === 0) return 0;
    return data[data.length - 1].value;
  };

  const getAvgValue = (data: MetricDataPoint[]) => {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.value, 0) / data.length;
  };

  const toggleMetric = useCallback((key: MetricKey) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  // Overview: aggregate metrics across all shapes
  const overview = useMemo(() => {
    const allMetrics = Object.values(metrics);
    if (allMetrics.length === 0) return null;

    const avgCpu =
      allMetrics.reduce((s, m) => s + getLatestValue(m.cpu), 0) /
      allMetrics.length;
    const avgMem =
      allMetrics.reduce((s, m) => s + getLatestValue(m.memory), 0) /
      allMetrics.length;
    const totalNet = allMetrics.reduce(
      (s, m) => s + getLatestValue(m.networkIn) + getLatestValue(m.networkOut),
      0,
    );
    const avgLatency =
      allMetrics.reduce((s, m) => s + getLatestValue(m.latency), 0) /
      allMetrics.length;
    const errorShapes = allMetrics.filter(
      (m) => getLatestValue(m.errorRate) > 5,
    ).length;

    return { avgCpu, avgMem, totalNet, avgLatency, errorShapes };
  }, [metrics]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative ml-auto w-[850px] max-w-[95vw] h-full ${bg} ${border} border-l flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <ChartLine size={20} className="text-purple-400" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${text}`}>Metrics Dashboard</h2>
              <p className={`text-xs ${textMuted}`}>
                {shapes.length} Shapes überwacht
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                autoRefresh
                  ? "bg-green-500/20 text-green-300"
                  : `${textMuted} hover:text-white`
              }`}
            >
              <ArrowsClockwise
                size={14}
                className={autoRefresh ? "animate-spin" : ""}
              />
              {autoRefresh ? "Live" : "Pausiert"}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-slate-700/50 ${textMuted}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        {shapes.length === 0 ? (
          <div
            className={`flex-1 flex flex-col items-center justify-center ${textMuted}`}
          >
            <ChartLine size={48} className="opacity-20 mb-3" />
            <p className="text-sm font-medium">Keine Shapes vorhanden</p>
            <p className="text-xs mt-1">
              Platziere Shapes auf dem Canvas um Metriken zu sehen
            </p>
          </div>
        ) : (
          <>
            {overview && (
              <div className={`px-6 py-3 border-b ${border} flex gap-3`}>
                <OverviewCard
                  label="Avg CPU"
                  value={`${overview.avgCpu.toFixed(1)}%`}
                  color="#3b82f6"
                  isDark={isDark}
                />
                <OverviewCard
                  label="Avg RAM"
                  value={`${overview.avgMem.toFixed(1)}%`}
                  color="#8b5cf6"
                  isDark={isDark}
                />
                <OverviewCard
                  label="Net Total"
                  value={`${overview.totalNet.toFixed(0)} Mbps`}
                  color="#10b981"
                  isDark={isDark}
                />
                <OverviewCard
                  label="Avg Latency"
                  value={`${overview.avgLatency.toFixed(1)}ms`}
                  color="#ec4899"
                  isDark={isDark}
                />
                <OverviewCard
                  label="Errors"
                  value={`${overview.errorShapes}`}
                  color={overview.errorShapes > 0 ? "#ef4444" : "#10b981"}
                  isDark={isDark}
                />
              </div>
            )}

            <div className="flex-1 flex overflow-hidden">
              {/* Shape List */}
              <div className={`w-56 border-r ${border} overflow-y-auto`}>
                {shapes.map((shape) => {
                  const m = metrics[shape.id];
                  const cpuVal = m ? getLatestValue(m.cpu) : 0;
                  const isSelected = shape.id === selectedShapeId;

                  return (
                    <button
                      key={shape.id}
                      onClick={() => setSelectedShapeId(shape.id)}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-left border-b ${border} transition-colors ${
                        isSelected
                          ? isDark
                            ? "bg-indigo-500/10"
                            : "bg-indigo-50"
                          : "hover:bg-slate-800/30"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          shape.status === "running"
                            ? "bg-green-500"
                            : shape.status === "error"
                              ? "bg-red-500 animate-pulse"
                              : shape.status === "stopped"
                                ? "bg-slate-500"
                                : "bg-amber-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${text} truncate`}>
                          {shape.label || shape.shapeId || "Shape"}
                        </div>
                        <div className={`text-[10px] ${textMuted}`}>
                          CPU: {cpuVal.toFixed(0)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
                {shapes.length === 0 && (
                  <div className={`p-4 text-center text-xs ${textMuted}`}>
                    Keine Shapes
                  </div>
                )}
              </div>

              {/* Metrics Detail */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedMetrics && selectedShape ? (
                  <>
                    {/* Shape Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedShape.status === "running"
                            ? "bg-green-500"
                            : selectedShape.status === "error"
                              ? "bg-red-500"
                              : "bg-slate-500"
                        }`}
                      />
                      <h3 className={`text-sm font-semibold ${text}`}>
                        {selectedShape.label || selectedShape.shapeId}
                      </h3>
                      <span className={`text-xs ${textMuted}`}>
                        {selectedShape.config?.ipAddress || "N/A"} •{" "}
                        {selectedShape.status || "unknown"}
                      </span>
                    </div>

                    {/* Metric Toggle */}
                    <div className="flex gap-1.5 flex-wrap">
                      {(
                        Object.entries(METRIC_CONFIG) as [
                          MetricKey,
                          (typeof METRIC_CONFIG)[MetricKey],
                        ][]
                      ).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => toggleMetric(key)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                            activeMetrics.includes(key)
                              ? `border`
                              : `${cardBg} ${textMuted} hover:opacity-80`
                          }`}
                          style={
                            activeMetrics.includes(key)
                              ? {
                                  borderColor: config.color + "50",
                                  backgroundColor: config.color + "15",
                                  color: config.color,
                                }
                              : undefined
                          }
                        >
                          {config.icon}
                          {config.label}
                        </button>
                      ))}
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {activeMetrics.map((key) => {
                        const config = METRIC_CONFIG[key];
                        const data = selectedMetrics[key] as MetricDataPoint[];
                        const latest = getLatestValue(data);
                        const avg = getAvgValue(data);
                        const max =
                          data.length > 0
                            ? Math.max(...data.map((d) => d.value))
                            : 0;

                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-xl ${cardBg} border ${border}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <span style={{ color: config.color }}>
                                  {config.icon}
                                </span>
                                <span className={`text-xs font-medium ${text}`}>
                                  {config.label}
                                </span>
                              </div>
                              <span
                                className="text-sm font-bold"
                                style={{ color: config.color }}
                              >
                                {latest.toFixed(1)} {config.unit}
                              </span>
                            </div>

                            <MiniChart
                              data={data}
                              color={config.color}
                              width={250}
                              height={50}
                              theme={theme}
                            />

                            <div
                              className={`flex justify-between mt-2 text-[10px] ${textMuted}`}
                            >
                              <span>Avg: {avg.toFixed(1)}</span>
                              <span>Max: {max.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div
                    className={`flex flex-col items-center justify-center h-full ${textMuted}`}
                  >
                    <ChartLine size={48} className="opacity-20 mb-3" />
                    <p className="text-sm">
                      Shape auswählen um Metriken zu sehen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OverviewCard({
  label,
  value,
  color,
  isDark,
}: {
  label: string;
  value: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex-1 p-3 rounded-xl ${isDark ? "bg-slate-800/50" : "bg-slate-50"} border ${isDark ? "border-slate-700" : "border-slate-200"}`}
    >
      <p
        className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"} mb-0.5`}
      >
        {label}
      </p>
      <p className="text-sm font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

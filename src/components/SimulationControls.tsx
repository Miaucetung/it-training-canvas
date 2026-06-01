import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { simulatePacketTrace } from "@/lib/network-simulator";
import { CanvasConnection, DrawingObject } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle,
  FastForward,
  Lightning,
  Pause,
  Play,
  Rewind,
  Stop,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface PacketData {
  id: string;
  sourceId: string;
  targetId: string;
  connectionId: string;
  protocol: string;
  data: string;
  progress: number; // 0-1
  status: "sending" | "received" | "error" | "dropped";
}

export interface SimulationState {
  isRunning: boolean;
  speed: number; // 0.5x - 4x
  packets: PacketData[];
  logs: SimulationLog[];
  mode: "manual" | "auto" | "step";
}

export interface SimulationLog {
  id: string;
  timestamp: number;
  type: "info" | "success" | "warning" | "error";
  source?: string;
  target?: string;
  message: string;
}

interface SimulationControlsProps {
  objects: DrawingObject[];
  connections: CanvasConnection[];
  simulationState: SimulationState;
  onSimulationChange: (state: SimulationState) => void;
  onPacketSend: (sourceId: string, targetId: string, data: string) => void;
  theme: "light" | "dark";
}

export function SimulationControls({
  objects,
  connections,
  simulationState,
  onSimulationChange,
  onPacketSend,
  theme,
}: SimulationControlsProps) {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [packetData, setPacketData] = useState("PING");

  const shapes = objects.filter((obj) => obj.type === "shape");

  const handlePlay = () => {
    onSimulationChange({
      ...simulationState,
      isRunning: true,
    });
  };

  const handlePause = () => {
    onSimulationChange({
      ...simulationState,
      isRunning: false,
    });
  };

  const handleStop = () => {
    onSimulationChange({
      ...simulationState,
      isRunning: false,
      packets: [],
      logs: [],
    });
  };

  const handleSpeedChange = (value: number[]) => {
    onSimulationChange({
      ...simulationState,
      speed: value[0],
    });
  };

  const handleSendPacket = () => {
    if (selectedSource && selectedTarget) {
      onPacketSend(selectedSource, selectedTarget, packetData);
    }
  };

  const getStatusIcon = (type: SimulationLog["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle size={14} className="text-green-500" />;
      case "warning":
        return <Warning size={14} className="text-amber-500" />;
      case "error":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Lightning size={14} className="text-blue-500" />;
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-28 left-1/2 -translate-x-1/2 z-40",
        "flex flex-col gap-2 p-4 rounded-xl shadow-2xl border",
        "backdrop-blur-xl max-w-[calc(100vw-2rem)]",
        theme === "dark"
          ? "bg-slate-900/95 border-slate-700"
          : "bg-white/95 border-slate-200",
      )}
    >
      {/* Main Controls */}
      <div className="flex items-center gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleSpeedChange([Math.max(0.5, simulationState.speed - 0.5)])
            }
            className="h-8 w-8"
          >
            <Rewind size={16} />
          </Button>

          {simulationState.isRunning ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePause}
              className="h-10 w-10"
            >
              <Pause size={20} weight="fill" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              className="h-10 w-10 text-green-500 hover:text-green-400"
            >
              <Play size={20} weight="fill" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleStop}
            className="h-8 w-8 text-red-500 hover:text-red-400"
          >
            <Stop size={16} weight="fill" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleSpeedChange([Math.min(4, simulationState.speed + 0.5)])
            }
            className="h-8 w-8"
          >
            <FastForward size={16} />
          </Button>
        </div>

        {/* Speed Indicator */}
        <div className="flex items-center gap-2 px-3">
          <span
            className={cn(
              "text-xs",
              theme === "dark" ? "text-slate-400" : "text-slate-500",
            )}
          >
            Geschwindigkeit:
          </span>
          <Badge variant="outline" className="font-mono">
            {simulationState.speed}x
          </Badge>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "w-px h-8",
            theme === "dark" ? "bg-slate-700" : "bg-slate-200",
          )}
        />

        {/* Packet Injection */}
        <div className="flex items-center gap-2">
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger
              className={cn(
                "w-32 h-8 text-xs",
                theme === "dark" ? "bg-slate-800 border-slate-600" : "",
              )}
            >
              <SelectValue placeholder="Quelle" />
            </SelectTrigger>
            <SelectContent
              className={
                theme === "dark" ? "bg-slate-800 border-slate-600" : ""
              }
            >
              {shapes.map((shape) => (
                <SelectItem key={shape.id} value={shape.id}>
                  {shape.label || shape.shapeId || "Shape"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ArrowRight
            size={16}
            className={theme === "dark" ? "text-slate-500" : "text-slate-400"}
          />

          <Select value={selectedTarget} onValueChange={setSelectedTarget}>
            <SelectTrigger
              className={cn(
                "w-32 h-8 text-xs",
                theme === "dark" ? "bg-slate-800 border-slate-600" : "",
              )}
            >
              <SelectValue placeholder="Ziel" />
            </SelectTrigger>
            <SelectContent
              className={
                theme === "dark" ? "bg-slate-800 border-slate-600" : ""
              }
            >
              {shapes.map((shape) => (
                <SelectItem key={shape.id} value={shape.id}>
                  {shape.label || shape.shapeId || "Shape"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={packetData} onValueChange={setPacketData}>
            <SelectTrigger
              className={cn(
                "w-24 h-8 text-xs",
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
              <SelectItem value="PING">PING</SelectItem>
              <SelectItem value="HTTP">HTTP</SelectItem>
              <SelectItem value="TCP">TCP SYN</SelectItem>
              <SelectItem value="UDP">UDP</SelectItem>
              <SelectItem value="DNS">DNS</SelectItem>
              <SelectItem value="ICMP">ICMP</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={handleSendPacket}
            disabled={
              !selectedSource ||
              !selectedTarget ||
              selectedSource === selectedTarget
            }
            className="h-8 gap-1"
          >
            <Lightning size={14} />
            Senden
          </Button>
        </div>

        {/* Active Packets */}
        {simulationState.packets.length > 0 && (
          <>
            <div
              className={cn(
                "w-px h-8",
                theme === "dark" ? "bg-slate-700" : "bg-slate-200",
              )}
            />
            <Badge variant="secondary" className="gap-1">
              <Lightning size={12} />
              {simulationState.packets.length} aktiv
            </Badge>
          </>
        )}
      </div>

      {/* Log Panel (collapsible) */}
      {simulationState.logs.length > 0 && (
        <div
          className={cn(
            "mt-2 max-h-32 overflow-y-auto rounded-lg p-2 text-xs space-y-1",
            theme === "dark" ? "bg-slate-800/50" : "bg-slate-100",
          )}
        >
          {simulationState.logs
            .slice(-5)
            .reverse()
            .map((log) => (
              <div key={log.id} className="flex items-center gap-2">
                {getStatusIcon(log.type)}
                <span
                  className={
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }
                >
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={
                    theme === "dark" ? "text-slate-200" : "text-slate-700"
                  }
                >
                  {log.message}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// Hook for managing simulation state
export function useSimulation(
  objects: DrawingObject[],
  connections: CanvasConnection[],
  onObjectsChange: (objects: DrawingObject[]) => void,
  onConnectionsChange: (connections: CanvasConnection[]) => void,
) {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    speed: 1,
    packets: [],
    logs: [],
    mode: "manual",
  });

  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Animation loop for packet movement
  useEffect(() => {
    if (!simulationState.isRunning || simulationState.packets.length === 0) {
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      setSimulationState((prev) => {
        const updatedPackets = prev.packets
          .map((packet) => {
            const newProgress = packet.progress + delta * prev.speed * 0.5;
            if (newProgress >= 1) {
              // Packet arrived
              return { ...packet, progress: 1, status: "received" as const };
            }
            return { ...packet, progress: newProgress };
          })
          .filter(
            (packet) => packet.progress < 1 || packet.status !== "received",
          );

        // Log completed packets
        const completedPackets = prev.packets.filter(
          (p) =>
            p.progress < 1 &&
            (updatedPackets.find((u) => u.id === p.id)?.progress ?? 0) >= 1,
        );

        const newLogs = completedPackets.map((packet) => ({
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          type: "success" as const,
          source: packet.sourceId,
          target: packet.targetId,
          message: `${packet.protocol} Paket empfangen`,
        }));

        return {
          ...prev,
          packets: updatedPackets,
          logs: [...prev.logs, ...newLogs].slice(-50), // Keep last 50 logs
        };
      });

      if (simulationState.isRunning) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulationState.isRunning, simulationState.packets.length]);

  const sendPacket = useCallback(
    (sourceId: string, targetId: string, data: string) => {
      // ─── Single source of truth: shared trace engine ───
      // Both PacketFlowVisualizer and SimulationControls now agree on
      // whether a ping really succeeds (VLAN/Trunk/L3/ARP-aware).
      const trace = simulatePacketTrace(
        sourceId,
        targetId,
        data,
        objects,
        connections,
      );

      const sourceLabel =
        objects.find((o) => o.id === sourceId)?.label || sourceId.slice(0, 8);
      const targetLabel =
        objects.find((o) => o.id === targetId)?.label || targetId.slice(0, 8);

      const logs: SimulationLog[] = [];
      const packets: PacketData[] = [];
      const now = Date.now();

      if (trace.steps.length === 0) {
        logs.push({
          id: `log-${now}-nopath`,
          timestamp: now,
          type: "error",
          source: sourceId,
          target: targetId,
          message: `${data}: Kein Pfad von ${sourceLabel} nach ${targetLabel} (keine Verbindung / falsche L2/L3-Konfig)`,
        });
      } else {
        // Per-hop packet animations and per-hop logs
        trace.steps.forEach((step, idx) => {
          packets.push({
            id: `packet-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            sourceId: step.fromShapeId,
            targetId: step.toShapeId,
            connectionId: step.connectionId,
            protocol: data,
            data,
            progress: 0,
            status: step.status === "dropped" ? "dropped" : "sending",
          });

          if (step.status === "dropped") {
            logs.push({
              id: `log-${now}-${idx}-drop`,
              timestamp: now + idx,
              type: "error",
              source: step.fromShapeId,
              target: step.toShapeId,
              message: `Hop ${idx + 1}: ${step.data.detail || "Paket verworfen"}`,
            });
          }
        });

        logs.push({
          id: `log-${now}-final`,
          timestamp: now + trace.steps.length,
          type: trace.success ? "success" : "error",
          source: sourceId,
          target: targetId,
          message: trace.success
            ? `${data} ${sourceLabel} → ${targetLabel}: ${trace.steps.length} Hop(s) erfolgreich`
            : `${data} ${sourceLabel} → ${targetLabel} FEHLGESCHLAGEN: ${
                trace.steps[trace.steps.length - 1]?.data.detail ||
                "Ziel nicht erreichbar"
              }`,
        });
      }

      setSimulationState((prev) => ({
        ...prev,
        packets: [...prev.packets, ...packets],
        logs: [...prev.logs, ...logs].slice(-50),
      }));
    },
    [objects, connections],
  );

  return {
    simulationState,
    setSimulationState,
    sendPacket,
  };
}

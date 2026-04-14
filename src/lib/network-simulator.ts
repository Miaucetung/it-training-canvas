import {
  CanvasConnection,
  DrawingObject,
  MetricDataPoint,
  NetworkSimConfig,
  PacketFlowStep,
  PacketFlowTrace,
  ShapeMetrics,
} from "@/lib/types";

import { checkConnectivity, generateMAC } from "@/lib/networking-engine";

/**
 * Network Simulator Engine
 * Simulates packet flow, network conditions, and generates metrics
 */

const DEFAULT_NETWORK_CONFIG: NetworkSimConfig = {
  latencyMs: 20,
  packetLossPercent: 0,
  bandwidthMbps: 1000,
  jitterMs: 2,
};

// Protocol definitions with typical behavior
const PROTOCOL_CONFIGS: Record<
  string,
  { layer: PacketFlowStep["layer"]; defaultPort: number; reliable: boolean }
> = {
  ICMP: { layer: "L3", defaultPort: 0, reliable: false },
  TCP: { layer: "L4", defaultPort: 80, reliable: true },
  UDP: { layer: "L4", defaultPort: 53, reliable: false },
  HTTP: { layer: "L7", defaultPort: 80, reliable: true },
  HTTPS: { layer: "L7", defaultPort: 443, reliable: true },
  DNS: { layer: "L7", defaultPort: 53, reliable: false },
  SSH: { layer: "L7", defaultPort: 22, reliable: true },
  PING: { layer: "L3", defaultPort: 0, reliable: false },
};

/**
 * Find path between two shapes using connections (BFS)
 */
export function findPath(
  sourceId: string,
  targetId: string,
  connections: CanvasConnection[],
): string[] {
  if (sourceId === targetId) return [sourceId];

  const adjacency: Record<
    string,
    { neighborId: string; connectionId: string }[]
  > = {};

  connections.forEach((conn) => {
    if (!adjacency[conn.sourceShapeId]) adjacency[conn.sourceShapeId] = [];
    if (!adjacency[conn.targetShapeId]) adjacency[conn.targetShapeId] = [];

    adjacency[conn.sourceShapeId].push({
      neighborId: conn.targetShapeId,
      connectionId: conn.id,
    });
    // Bidirectional
    adjacency[conn.targetShapeId].push({
      neighborId: conn.sourceShapeId,
      connectionId: conn.id,
    });
  });

  const visited = new Set<string>();
  const queue: { nodeId: string; path: string[] }[] = [
    { nodeId: sourceId, path: [sourceId] },
  ];
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency[current.nodeId] || [];

    for (const neighbor of neighbors) {
      if (neighbor.neighborId === targetId) {
        return [...current.path, targetId];
      }
      if (!visited.has(neighbor.neighborId)) {
        visited.add(neighbor.neighborId);
        queue.push({
          nodeId: neighbor.neighborId,
          path: [...current.path, neighbor.neighborId],
        });
      }
    }
  }

  return []; // No path found
}

/**
 * Find the connection between two adjacent shapes
 */
function findConnectionBetween(
  shapeA: string,
  shapeB: string,
  connections: CanvasConnection[],
): CanvasConnection | undefined {
  return connections.find(
    (c) =>
      (c.sourceShapeId === shapeA && c.targetShapeId === shapeB) ||
      (c.sourceShapeId === shapeB && c.targetShapeId === shapeA),
  );
}

/**
 * Simulate a packet trace between two shapes.
 * Uses the real networking engine for connectivity checks,
 * then builds PacketFlowSteps for the visualizer.
 */
export function simulatePacketTrace(
  sourceId: string,
  targetId: string,
  protocol: string,
  objects: DrawingObject[],
  connections: CanvasConnection[],
  networkConfig: NetworkSimConfig = DEFAULT_NETWORK_CONFIG,
): PacketFlowTrace {
  const protocolConfig = PROTOCOL_CONFIGS[protocol] || PROTOCOL_CONFIGS.TCP;
  const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const startTime = Date.now();

  // Check if source and target have IPs configured
  const sourceObj = objects.find((o) => o.id === sourceId);
  const targetObj = objects.find((o) => o.id === targetId);
  const srcIp = sourceObj?.config?.ipAddress;
  const dstIp = targetObj?.config?.ipAddress;
  const hasIPs = Boolean(srcIp && dstIp);

  // Try real connectivity engine when IPs are configured
  let useRealEngine = false;
  let result: ReturnType<typeof checkConnectivity> | null = null;

  if (hasIPs) {
    result = checkConnectivity(sourceId, targetId, objects, connections);
    if (result.reachable && result.hops.length >= 2) {
      useRealEngine = true;
    }
  }

  // Fallback: use BFS path-finding for unconfigured shapes or when engine can't route
  if (!useRealEngine) {
    const path = findPath(sourceId, targetId, connections);

    if (path.length < 2) {
      return {
        id: traceId,
        name: `${protocol} ${sourceObj?.label || sourceId.slice(0, 8)} → ${targetObj?.label || targetId.slice(0, 8)}`,
        steps: [],
        startedAt: startTime,
        completedAt: startTime,
        sourceShapeId: sourceId,
        targetShapeId: targetId,
        protocol,
        success: false,
      };
    }

    // Build steps from BFS path
    const steps: PacketFlowStep[] = [];
    let cumulativeTime = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const fromId = path[i];
      const toId = path[i + 1];
      const conn = findConnectionBetween(fromId, toId, connections);
      const fromObj = objects.find((o) => o.id === fromId);
      const toObj = objects.find((o) => o.id === toId);

      const jitter = (Math.random() - 0.5) * 2 * networkConfig.jitterMs;
      const hopLatency = networkConfig.latencyMs + jitter;
      const isDropped = Math.random() * 100 < networkConfig.packetLossPercent;

      const step: PacketFlowStep = {
        id: `step-${traceId}-${i}`,
        fromShapeId: fromId,
        toShapeId: toId,
        connectionId: conn?.id || "",
        protocol,
        layer: protocolConfig.layer,
        data: {
          srcIp: fromObj?.config?.ipAddress || `10.0.${i}.1`,
          dstIp: toObj?.config?.ipAddress || `10.0.${i + 1}.1`,
          srcMac: fromObj?.config?.mac || generateMAC(),
          dstMac: toObj?.config?.mac || generateMAC(),
          ttl: String(64 - i),
          protocol,
          port: String(protocolConfig.defaultPort),
          action: "forward",
          detail: !hasIPs
            ? "Simuliert (keine IP-Konfiguration)"
            : result?.error || "",
        },
        timestamp: startTime + cumulativeTime,
        duration: Math.max(1, Math.round(hopLatency)),
        status: isDropped ? "dropped" : "delivered",
      };

      steps.push(step);
      cumulativeTime += hopLatency;

      if (isDropped) {
        if (protocolConfig.reliable) {
          const retryStep: PacketFlowStep = {
            ...step,
            id: `step-${traceId}-${i}-retry`,
            timestamp: startTime + cumulativeTime + 100,
            duration: Math.max(1, Math.round(hopLatency)),
            status: "delivered",
            data: { ...step.data, retransmission: "true" },
          };
          steps.push(retryStep);
          cumulativeTime += hopLatency + 100;
        } else {
          break;
        }
      }
    }

    const allDelivered = steps.every(
      (s) => s.status === "delivered" || s.id.includes("-retry"),
    );
    return {
      id: traceId,
      name: `${protocol} ${sourceObj?.label || sourceId.slice(0, 8)} → ${targetObj?.label || targetId.slice(0, 8)}`,
      steps,
      startedAt: startTime,
      completedAt: startTime + cumulativeTime,
      sourceShapeId: sourceId,
      targetShapeId: targetId,
      protocol,
      success: allDelivered,
    };
  }

  // Real engine path — build steps from connectivity hops
  const steps: PacketFlowStep[] = [];
  let cumulativeTime = 0;

  for (let i = 0; i < result!.hops.length - 1; i++) {
    const hop = result!.hops[i];
    const nextHop = result!.hops[i + 1];

    const conn = connections.find(
      (c) =>
        (c.sourceShapeId === hop.shapeId &&
          c.targetShapeId === nextHop.shapeId) ||
        (c.sourceShapeId === nextHop.shapeId &&
          c.targetShapeId === hop.shapeId),
    );

    const jitter = (Math.random() - 0.5) * 2 * networkConfig.jitterMs;
    const hopLatency = networkConfig.latencyMs + jitter;
    const isDropped = Math.random() * 100 < networkConfig.packetLossPercent;

    const step: PacketFlowStep = {
      id: `step-${traceId}-${i}`,
      fromShapeId: hop.shapeId,
      toShapeId: nextHop.shapeId,
      connectionId: conn?.id || "",
      protocol,
      layer: protocolConfig.layer,
      data: {
        srcIp: hop.ip || "0.0.0.0",
        dstIp: nextHop.ip || "0.0.0.0",
        srcMac: hop.mac || generateMAC(),
        dstMac: nextHop.mac || generateMAC(),
        ttl: String(64 - i),
        protocol,
        port: String(protocolConfig.defaultPort),
        action: nextHop.action,
        detail: nextHop.detail || "",
      },
      timestamp: startTime + cumulativeTime,
      duration: Math.max(1, Math.round(hopLatency)),
      status: isDropped ? "dropped" : "delivered",
    };

    steps.push(step);
    cumulativeTime += hopLatency;

    if (isDropped) {
      if (protocolConfig.reliable) {
        const retryStep: PacketFlowStep = {
          ...step,
          id: `step-${traceId}-${i}-retry`,
          timestamp: startTime + cumulativeTime + 100,
          duration: Math.max(1, Math.round(hopLatency)),
          status: "delivered",
          data: { ...step.data, retransmission: "true" },
        };
        steps.push(retryStep);
        cumulativeTime += hopLatency + 100;
      } else {
        break;
      }
    }
  }

  return {
    id: traceId,
    name: `${protocol} ${sourceObj?.label || sourceId.slice(0, 8)} → ${targetObj?.label || targetId.slice(0, 8)}`,
    steps,
    startedAt: startTime,
    completedAt: startTime + cumulativeTime,
    sourceShapeId: sourceId,
    targetShapeId: targetId,
    protocol,
    success: result!.reachable,
  };
}

/**
 * Generate simulated metrics for a shape
 */
export function generateShapeMetrics(
  shapeId: string,
  shape: DrawingObject,
  durationMinutes: number = 5,
  intervalSec: number = 10,
): ShapeMetrics {
  const now = Date.now();
  const points = Math.floor((durationMinutes * 60) / intervalSec);

  const isRunning = shape.status === "running";
  const isError = shape.status === "error";
  const baseCpu = isRunning
    ? 20 + Math.random() * 30
    : isError
      ? 85 + Math.random() * 15
      : 0;
  const baseMem = isRunning
    ? 40 + Math.random() * 20
    : isError
      ? 90 + Math.random() * 10
      : 0;
  const baseNet = isRunning ? 50 + Math.random() * 200 : 0;

  function generateSeries(
    base: number,
    variance: number,
    trend: number = 0,
  ): MetricDataPoint[] {
    const data: MetricDataPoint[] = [];
    let current = base;
    for (let i = 0; i < points; i++) {
      current = Math.max(
        0,
        Math.min(100, base + (Math.random() - 0.5) * variance + trend * i),
      );
      data.push({
        timestamp: now - (points - i) * intervalSec * 1000,
        value: Math.round(current * 100) / 100,
      });
    }
    return data;
  }

  return {
    shapeId,
    cpu: generateSeries(baseCpu, 15, isError ? 0.5 : 0),
    memory: generateSeries(baseMem, 8, 0.1),
    networkIn: generateSeries(baseNet, 80),
    networkOut: generateSeries(baseNet * 0.7, 60),
    diskRead: generateSeries(isRunning ? 10 : 0, 20),
    diskWrite: generateSeries(isRunning ? 5 : 0, 15),
    latency: generateSeries(isRunning ? 15 : 0, 10),
    requestsPerSec: generateSeries(isRunning ? 100 : 0, 50),
    errorRate: generateSeries(isError ? 15 : isRunning ? 0.5 : 0, 3),
  };
}

/**
 * Cloud pricing data (simplified)
 */
export const CLOUD_PRICING: Record<
  string,
  Record<
    string,
    { monthly: number; hourly: number; vcpu: number; memGb: number }
  >
> = {
  aws: {
    "t3.micro": { monthly: 7.59, hourly: 0.0104, vcpu: 2, memGb: 1 },
    "t3.small": { monthly: 15.18, hourly: 0.0208, vcpu: 2, memGb: 2 },
    "t3.medium": { monthly: 30.37, hourly: 0.0416, vcpu: 2, memGb: 4 },
    "t3.large": { monthly: 60.74, hourly: 0.0832, vcpu: 2, memGb: 8 },
    "m5.large": { monthly: 69.12, hourly: 0.096, vcpu: 2, memGb: 8 },
    "m5.xlarge": { monthly: 138.24, hourly: 0.192, vcpu: 4, memGb: 16 },
    "c5.large": { monthly: 62.05, hourly: 0.085, vcpu: 2, memGb: 4 },
    "r5.large": { monthly: 90.72, hourly: 0.126, vcpu: 2, memGb: 16 },
    "S3 Standard/GB": { monthly: 0.023, hourly: 0, vcpu: 0, memGb: 0 },
    "RDS db.t3.micro": { monthly: 12.41, hourly: 0.017, vcpu: 2, memGb: 1 },
    "Lambda (1M req)": { monthly: 0.2, hourly: 0, vcpu: 0, memGb: 0 },
  },
  azure: {
    B2s: { monthly: 30.37, hourly: 0.0416, vcpu: 2, memGb: 4 },
    B4ms: { monthly: 121.18, hourly: 0.166, vcpu: 4, memGb: 16 },
    D2s_v3: { monthly: 70.08, hourly: 0.096, vcpu: 2, memGb: 8 },
    D4s_v3: { monthly: 140.16, hourly: 0.192, vcpu: 4, memGb: 16 },
    E2s_v3: { monthly: 91.98, hourly: 0.126, vcpu: 2, memGb: 16 },
    F2s_v2: { monthly: 61.32, hourly: 0.084, vcpu: 2, memGb: 4 },
    "Blob Storage/GB": { monthly: 0.018, hourly: 0, vcpu: 0, memGb: 0 },
    "SQL DB Basic": { monthly: 4.9, hourly: 0.0068, vcpu: 0, memGb: 0 },
    "Functions (1M)": { monthly: 0.2, hourly: 0, vcpu: 0, memGb: 0 },
  },
  gcp: {
    "e2-micro": { monthly: 6.11, hourly: 0.0084, vcpu: 2, memGb: 1 },
    "e2-small": { monthly: 12.23, hourly: 0.0168, vcpu: 2, memGb: 2 },
    "e2-medium": { monthly: 24.46, hourly: 0.0335, vcpu: 2, memGb: 4 },
    "n1-standard-1": { monthly: 24.27, hourly: 0.0475, vcpu: 1, memGb: 3.75 },
    "n1-standard-2": { monthly: 48.55, hourly: 0.095, vcpu: 2, memGb: 7.5 },
    "Cloud Storage/GB": { monthly: 0.02, hourly: 0, vcpu: 0, memGb: 0 },
    "Cloud SQL Small": { monthly: 7.67, hourly: 0.0105, vcpu: 0, memGb: 0 },
  },
};

/**
 * Detect cloud provider from shape
 */
export function detectCloudProvider(
  shape: DrawingObject,
): "aws" | "azure" | "gcp" | "on-premise" {
  const shapeId = (shape.shapeId || "").toLowerCase();
  const label = (shape.label || "").toLowerCase();
  const combined = shapeId + " " + label;

  if (
    combined.includes("aws") ||
    combined.includes("amazon") ||
    combined.includes("ec2") ||
    combined.includes("s3")
  )
    return "aws";
  if (combined.includes("azure") || combined.includes("microsoft"))
    return "azure";
  if (
    combined.includes("gcp") ||
    combined.includes("google") ||
    combined.includes("cloud-run")
  )
    return "gcp";
  return "on-premise";
}

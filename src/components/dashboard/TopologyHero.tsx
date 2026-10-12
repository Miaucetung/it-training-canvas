import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle,
  MagnifyingGlass,
  Presentation,
  Pulse,
  ShareNetwork,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface TopologyHeroProps {
  onSelectTopic: (topicId: string) => void;
  onOpenSimulator: (simId: "vlan" | "stp" | "routing" | "osi") => void;
  onOpenCanvasV2: () => void;
  onOpenCommandPalette: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  hasProgress: boolean;
  lastActiveTopicTitle?: string;
  lastActiveTopicId?: string;
  completedTopicCount: number;
  totalTopicCount: number;
}

interface DeviceNode {
  id: string;
  name: string;
  type: "router" | "switch" | "server" | "host";
  ip: string;
  mac: string;
  x: number;
  y: number;
  role: string;
  details: string;
  actionText: string;
  onAction: () => void;
}

export function TopologyHero({
  onSelectTopic,
  onOpenSimulator,
  onOpenCanvasV2,
  onOpenCommandPalette,
  isPresentationMode,
  onTogglePresentationMode,
  hasProgress,
  lastActiveTopicTitle,
  lastActiveTopicId,
  completedTopicCount,
  totalTopicCount,
}: TopologyHeroProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("sw1");
  const [pingState, setPingState] = useState<"idle" | "request" | "reply" | "done">("idle");
  const [pingPacketPos, setPingPacketPos] = useState<{ x: number; y: number } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  // Defined topology layout coordinates (viewBox 0 0 460 250)
  const nodes: Record<string, DeviceNode> = {
    r1: {
      id: "r1",
      name: "R1-Gateway",
      type: "router",
      ip: "192.168.10.1/24",
      mac: "00:1A:A1:00:00:01",
      x: 230,
      y: 38,
      role: "Cisco ISR 4331 Default Gateway",
      details: "Default Gateway 192.168.10.1 • OSPF Process 1 Area 0 • Gi0/0/0 Subinterfaces (RoAS)",
      actionText: "Routing-Simulator öffnen",
      onAction: () => onOpenSimulator("routing"),
    },
    sw1: {
      id: "sw1",
      name: "SW1-Core",
      type: "switch",
      ip: "192.168.10.2 (SVI)",
      mac: "00:1A:A1:00:00:02",
      x: 230,
      y: 114,
      role: "Cisco Catalyst 2960 Layer-2 Switch",
      details: "VLAN 10 (Clients), VLAN 20 (Server) • 802.1Q Trunk zu R1 (Gi0/1) • STP Root Bridge",
      actionText: "VLAN-Simulator öffnen",
      onAction: () => onOpenSimulator("vlan"),
    },
    pc1: {
      id: "pc1",
      name: "PC1-Client",
      type: "host",
      ip: "192.168.10.50/24",
      mac: "00:1A:A1:00:00:11",
      x: 80,
      y: 176,
      role: "Windows Workstation (VLAN 10)",
      details: "IP 192.168.10.50 per DHCP Lease • Gateway 192.168.10.1 • Port Fa0/1 Access VLAN 10",
      actionText: "Lektion Subnetting öffnen",
      onAction: () => onSelectTopic("subnet-segmentation"),
    },
    srv1: {
      id: "srv1",
      name: "SRV1-Infra",
      type: "server",
      ip: "192.168.10.10/24",
      mac: "00:1A:A1:00:00:22",
      x: 380,
      y: 176,
      role: "Linux DNS & Syslog Server (VLAN 20)",
      details: "DNS Server (Port 53), Syslog Collector (Port 514) • Port Fa0/2 Access VLAN 20",
      actionText: "Lektion IP-Dienste öffnen",
      onAction: () => onSelectTopic("dhcp-nat"),
    },
  };

  const activeNode = nodes[selectedNodeId] || nodes.sw1;

  // Single-run illustrative Ping animation (PC1 -> SW1 -> SRV1 -> SW1 -> PC1)
  const handleStartPing = () => {
    if (pingState === "request" || pingState === "reply") return;
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);

    if (prefersReducedMotion) {
      setPingState("done");
      return;
    }

    setPingState("request");
    setPingPacketPos({ x: nodes.pc1.x, y: nodes.pc1.y });

    // Step 1: PC1 -> SW1 (500ms)
    setTimeout(() => {
      setPingPacketPos({ x: nodes.sw1.x, y: nodes.sw1.y });
    }, 150);

    // Step 2: SW1 -> SRV1 (600ms)
    setTimeout(() => {
      setPingPacketPos({ x: nodes.srv1.x, y: nodes.srv1.y });
    }, 700);

    // Step 3: Echo Reply: SRV1 -> SW1 -> PC1
    setTimeout(() => {
      setPingState("reply");
      setPingPacketPos({ x: nodes.sw1.x, y: nodes.sw1.y });
    }, 1300);

    setTimeout(() => {
      setPingPacketPos({ x: nodes.pc1.x, y: nodes.pc1.y });
    }, 1900);

    // Step 4: Finish animation
    setTimeout(() => {
      setPingState("done");
      setPingPacketPos(null);
    }, 2500);
  };

  return (
    <section
      aria-label="CCNA 200-301 Einstiegsbereich"
      className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 sm:p-7 shadow-sm transition-colors"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
        {/* Left Column: Heading, Primary CTA, Navigation shortcuts */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Cisco CCNA 200-301 v1.1
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Offizieller Cisco-Blueprint
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3 font-sans">
            CCNA 200-301 Lernplattform
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 font-sans">
            Strukturierte Fachvorbereitung auf das Cisco-Examen: 1.055 Fragen, 81 Drag-and-Drop-Aufgaben und 5 interaktive Protokoll-Simulatoren.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            {hasProgress && lastActiveTopicId ? (
              <button
                type="button"
                onClick={() => onSelectTopic(lastActiveTopicId)}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span>Weiterlernen: {lastActiveTopicTitle || "Aktuelle Lektion"}</span>
                <ArrowRight weight="bold" className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTopic("networking-fundamentals")}
                className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-sm transition-all shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span>Jetzt starten: Network Fundamentals</span>
                <ArrowRight weight="bold" className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCanvasV2}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-surface-elevated hover:bg-surface text-foreground font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <ShareNetwork weight="bold" className="h-4 w-4 text-primary" />
              <span>Canvas v2 öffnen</span>
            </button>
          </div>

          {/* Progress / Status Hint */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
            <span className="tabular-nums font-mono">
              <strong className="text-foreground font-semibold">{completedTopicCount}</strong> von{" "}
              {totalTopicCount} Lektionen abgeschlossen
            </span>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground transition-colors font-mono text-[11px]"
                title="Befehlspalette öffnen (Strg+K)"
              >
                <MagnifyingGlass className="h-3.5 w-3.5" />
                <span>Strg+K</span>
              </button>

              <button
                type="button"
                onClick={onTogglePresentationMode}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors text-[11px] font-medium",
                  isPresentationMode
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold"
                    : "border-border bg-surface-elevated hover:bg-surface text-muted-foreground hover:text-foreground"
                )}
                title="Dozenten-Präsentationsmodus umschalten (P)"
              >
                <Presentation className="h-3.5 w-3.5" />
                <span>{isPresentationMode ? "Präsentation an" : "Beamer (P)"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Topology */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="relative rounded-lg border border-border bg-surface-elevated/60 p-3 sm:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
                  Interaktive Topologie
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartPing}
                disabled={pingState === "request" || pingState === "reply"}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all",
                  pingState === "request" || pingState === "reply"
                    ? "bg-primary/20 text-primary cursor-not-allowed"
                    : "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                )}
              >
                <Pulse className="h-3.5 w-3.5" weight="bold" />
                <span>
                  {pingState === "request" || pingState === "reply"
                    ? "Ping läuft..."
                    : "Ping testen (PC1 → SRV1)"}
                </span>
              </button>
            </div>

            {/* SVG Canvas Topology */}
            <div className="relative w-full aspect-[460/235]">
              <svg
                viewBox="0 0 460 235"
                className="w-full h-full select-none"
                role="img"
                aria-label="Cisco CCNA Topologie: R1-Gateway, SW1-Core, PC1-Client und SRV1-Server"
              >
                <defs>
                  {/* Subtle Grid pattern */}
                  <pattern id="topology-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="currentColor" className="text-muted-foreground/15" />
                  </pattern>
                </defs>

                <rect width="460" height="235" fill="url(#topology-grid)" rx="6" />

                {/* Link Lines */}
                {/* Link Lines */}
                {/* R1 <-> SW1 (Trunk) */}
                <line
                  x1={nodes.r1.x}
                  y1={nodes.r1.y + 18}
                  x2={nodes.sw1.x}
                  y2={nodes.sw1.y - 18}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={cn(
                    "transition-colors",
                    selectedNodeId === "r1" || selectedNodeId === "sw1"
                      ? "text-primary stroke-primary"
                      : "text-border"
                  )}
                />
                <text
                  x={nodes.r1.x - 8}
                  y={(nodes.r1.y + nodes.sw1.y) / 2 + 3}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px] font-mono font-medium"
                >
                  Gi0/1 (Trunk)
                </text>

                {/* SW1 <-> PC1 (VLAN 10 Access) */}
                <line
                  x1={nodes.sw1.x - 20}
                  y1={nodes.sw1.y + 10}
                  x2={nodes.pc1.x + 20}
                  y2={nodes.pc1.y - 10}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "transition-colors",
                    selectedNodeId === "pc1" || selectedNodeId === "sw1"
                      ? "text-primary stroke-primary"
                      : "text-border"
                  )}
                />
                <text
                  x={(nodes.sw1.x + nodes.pc1.x) / 2 - 20}
                  y={(nodes.sw1.y + nodes.pc1.y) / 2 + 16}
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  Fa0/1 (VLAN 10)
                </text>

                {/* SW1 <-> SRV1 (VLAN 20 Access) */}
                <line
                  x1={nodes.sw1.x + 20}
                  y1={nodes.sw1.y + 10}
                  x2={nodes.srv1.x - 20}
                  y2={nodes.srv1.y - 10}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn(
                    "transition-colors",
                    selectedNodeId === "srv1" || selectedNodeId === "sw1"
                      ? "text-primary stroke-primary"
                      : "text-border"
                  )}
                />
                <text
                  x={(nodes.sw1.x + nodes.srv1.x) / 2 + 10}
                  y={(nodes.sw1.y + nodes.srv1.y) / 2 + 16}
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  Fa0/2 (VLAN 20)
                </text>

                {/* Ping Packet Light Pulse (Only during active ping) */}
                {pingPacketPos && !prefersReducedMotion && (
                  <g
                    transform={`translate(${pingPacketPos.x}, ${pingPacketPos.y})`}
                    className="transition-transform duration-500 ease-in-out pointer-events-none"
                  >
                    <circle r="7" className="fill-amber-400 animate-ping opacity-75" />
                    <circle r="5" className="fill-amber-400 shadow-md" />
                  </g>
                )}

                {/* Node R1 (Router) */}
                <g
                  transform={`translate(${nodes.r1.x}, ${nodes.r1.y})`}
                  onClick={() => setSelectedNodeId("r1")}
                  className="cursor-pointer focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label="Router R1 Gateway"
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedNodeId("r1")}
                >
                  <circle
                    r="18"
                    className={cn(
                      "transition-all",
                      selectedNodeId === "r1"
                        ? "fill-primary text-primary-foreground stroke-primary stroke-2"
                        : "fill-surface stroke-border stroke-2 hover:stroke-primary"
                    )}
                  />
                  {/* Cisco Router 4 arrows icon */}
                  <path
                    d="M-7 -2.5 L-1.5 -2.5 M-1.5 -5 L1.5 -2.5 L-1.5 0 Z M7 2.5 L1.5 2.5 M1.5 5 L-1.5 2.5 L1.5 0 Z M-2.5 -7 L-2.5 -1.5 M-5 -1.5 L-2.5 1.5 L0 -1.5 Z M2.5 7 L2.5 1.5 M5 1.5 L2.5 -1.5 L0 1.5 Z"
                    className={cn(
                      selectedNodeId === "r1" ? "stroke-primary-foreground fill-primary-foreground" : "stroke-foreground fill-foreground"
                    )}
                    strokeWidth="1.2"
                  />
                  <text x="24" y="-2" textAnchor="start" className="text-[11px] font-bold fill-foreground font-mono">
                    R1
                  </text>
                  <text x="24" y="10" textAnchor="start" className="text-[8.5px] fill-muted-foreground font-mono">
                    192.168.10.1
                  </text>
                </g>

                {/* Node SW1 (Switch) */}
                <g
                  transform={`translate(${nodes.sw1.x}, ${nodes.sw1.y})`}
                  onClick={() => setSelectedNodeId("sw1")}
                  className="cursor-pointer focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label="Switch SW1 Core"
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedNodeId("sw1")}
                >
                  <rect
                    x="-18"
                    y="-13"
                    width="36"
                    height="26"
                    rx="4"
                    className={cn(
                      "transition-all",
                      selectedNodeId === "sw1"
                        ? "fill-primary text-primary-foreground stroke-primary stroke-2"
                        : "fill-surface stroke-border stroke-2 hover:stroke-primary"
                    )}
                  />
                  {/* Switch bidirectional arrows */}
                  <path
                    d="M-10 -3 L10 -3 M6 -6 L10 -3 L6 0 M10 3 L-10 3 M-6 0 L-10 3 L-6 6"
                    className={cn(
                      selectedNodeId === "sw1" ? "stroke-primary-foreground" : "stroke-foreground"
                    )}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <text x="24" y="-2" textAnchor="start" className="text-[11px] font-bold fill-foreground font-mono">
                    SW1
                  </text>
                  <text x="24" y="10" textAnchor="start" className="text-[8.5px] fill-muted-foreground font-mono">
                    Catalyst 2960
                  </text>
                </g>

                {/* Node PC1 (Client Workstation) */}
                <g
                  transform={`translate(${nodes.pc1.x}, ${nodes.pc1.y})`}
                  onClick={() => setSelectedNodeId("pc1")}
                  className="cursor-pointer focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label="Workstation PC1 Client"
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedNodeId("pc1")}
                >
                  <rect
                    x="-18"
                    y="-14"
                    width="36"
                    height="28"
                    rx="3"
                    className={cn(
                      "transition-all",
                      selectedNodeId === "pc1"
                        ? "fill-primary text-primary-foreground stroke-primary stroke-2"
                        : "fill-surface stroke-border stroke-2 hover:stroke-primary"
                    )}
                  />
                  <rect
                    x="-12"
                    y="-10"
                    width="24"
                    height="16"
                    rx="1"
                    className={selectedNodeId === "pc1" ? "fill-primary-foreground/30" : "fill-muted-foreground/20"}
                  />
                  <line
                    x1="-6"
                    y1="10"
                    x2="6"
                    y2="10"
                    className={selectedNodeId === "pc1" ? "stroke-primary-foreground" : "stroke-foreground"}
                    strokeWidth="2"
                  />
                  <text y="25" textAnchor="middle" className="text-[11px] font-bold fill-foreground font-mono">
                    PC1
                  </text>
                  <text y="35" textAnchor="middle" className="text-[8.5px] fill-muted-foreground font-mono">
                    .50 (VLAN 10)
                  </text>
                </g>

                {/* Node SRV1 (Server) */}
                <g
                  transform={`translate(${nodes.srv1.x}, ${nodes.srv1.y})`}
                  onClick={() => setSelectedNodeId("srv1")}
                  className="cursor-pointer focus:outline-none"
                  tabIndex={0}
                  role="button"
                  aria-label="Server SRV1 Infra"
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedNodeId("srv1")}
                >
                  <rect
                    x="-16"
                    y="-16"
                    width="32"
                    height="32"
                    rx="4"
                    className={cn(
                      "transition-all",
                      selectedNodeId === "srv1"
                        ? "fill-primary text-primary-foreground stroke-primary stroke-2"
                        : "fill-surface stroke-border stroke-2 hover:stroke-primary"
                    )}
                  />
                  <line
                    x1="-10"
                    y1="-8"
                    x2="10"
                    y2="-8"
                    className={selectedNodeId === "srv1" ? "stroke-primary-foreground" : "stroke-foreground"}
                    strokeWidth="1.5"
                  />
                  <line
                    x1="-10"
                    y1="0"
                    x2="10"
                    y2="0"
                    className={selectedNodeId === "srv1" ? "stroke-primary-foreground" : "stroke-foreground"}
                    strokeWidth="1.5"
                  />
                  <line
                    x1="-10"
                    y1="8"
                    x2="10"
                    y2="8"
                    className={selectedNodeId === "srv1" ? "stroke-primary-foreground" : "stroke-foreground"}
                    strokeWidth="1.5"
                  />
                  <text y="27" textAnchor="middle" className="text-[11px] font-bold fill-foreground font-mono">
                    SRV1
                  </text>
                  <text y="37" textAnchor="middle" className="text-[8.5px] fill-muted-foreground font-mono">
                    .10 (VLAN 20)
                  </text>
                </g>
              </svg>
            </div>

            {/* Ping Feedback Badge */}
            {pingState === "done" && (
              <div
                className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between"
                aria-live="polite"
              >
                <div className="flex items-center gap-1.5 font-mono">
                  <CheckCircle className="h-4 w-4" weight="bold" />
                  <span>Ping erfolgreich: 4 Pakete empfangen, RTT 1.2ms (ICMP Echo Reply)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPingState("idle")}
                  className="text-[11px] underline hover:no-underline ml-2"
                >
                  Ausblenden
                </button>
              </div>
            )}

            {/* Selected Device Technical Inspector Details */}
            <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <strong className="text-foreground font-semibold font-mono">{activeNode.name}</strong>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-muted-foreground font-mono">
                    {activeNode.ip}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">{activeNode.details}</p>
              </div>

              <button
                type="button"
                onClick={activeNode.onAction}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-elevated hover:bg-surface border border-border text-xs text-foreground font-medium transition-colors shrink-0"
              >
                <span>{activeNode.actionText}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

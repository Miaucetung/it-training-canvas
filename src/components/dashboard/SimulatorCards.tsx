import {
  ArrowRight,
  ArrowsSplit,
  GitFork,
  HardDrives,
  ShareNetwork,
  TreeStructure,
} from "@phosphor-icons/react";

interface SimulatorCardsProps {
  onOpenSimulator: (simId: "vlan" | "stp" | "routing" | "osi") => void;
  onOpenCanvasV2: () => void;
}

export function SimulatorCards({
  onOpenSimulator,
  onOpenCanvasV2,
}: SimulatorCardsProps) {
  const simulators = [
    {
      id: "vlan",
      title: "VLAN- & Trunk-Simulator",
      subtitle: "Layer 2 Switching",
      description:
        "Ethernet-Frames mit 802.1Q-Tags, Access- und Trunk-Ports sowie Native VLANs im Live-Betrieb verfolgen.",
      icon: GitFork,
      action: () => onOpenSimulator("vlan"),
    },
    {
      id: "stp",
      title: "Spanning-Tree-Simulator",
      subtitle: "Loop Prevention",
      description:
        "Root-Bridge-Wahl, Port-Rollen (Root, Designated, Blocked) und STP/RSTP Konvergenzzeiten Schritt für Schritt verstehen.",
      icon: TreeStructure,
      action: () => onOpenSimulator("stp"),
    },
    {
      id: "routing",
      title: "Routing- & OSPF-Simulator",
      subtitle: "Layer 3 Forwarding",
      description:
        "Routingtabellen, Longest Prefix Matches und den Austausch von OSPF Link-State Advertisements analysieren.",
      icon: ArrowsSplit,
      action: () => onOpenSimulator("routing"),
    },
    {
      id: "osi",
      title: "OSI- & TCP/IP-Simulator",
      subtitle: "Protocol Stacks",
      description:
        "Datenkapselung von Application (Layer 7) bis Physical (Layer 1) mit echten Headern und Prüfsummen visualisieren.",
      icon: HardDrives,
      action: () => onOpenSimulator("osi"),
    },
    {
      id: "canvas-v2",
      title: "Topologie-Canvas v2",
      subtitle: "Packet-Tracer Engine",
      description:
        "Freie Netzwerkarchitekturen entwerfen, Cisco-Geräte per CLI konfigurieren und Paketflüsse interaktiv testen.",
      icon: ShareNetwork,
      action: onOpenCanvasV2,
    },
  ];

  return (
    <section aria-label="Interaktive Protokoll-Simulatoren" className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground font-sans">
          Protokoll-Simulatoren & Praxis
        </h2>
        <p className="text-xs text-muted-foreground">
          Visuelle Simulationen für komplexe Layer-2 und Layer-3 Netzwerkabläufe
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {simulators.map((sim) => {
          const Icon = sim.icon;
          return (
            <div
              key={sim.id}
              className="rounded-lg border border-border bg-surface p-3.5 flex flex-col justify-between hover:border-primary/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" weight="bold" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-surface-elevated">
                    {sim.subtitle}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-foreground mb-1 font-sans group-hover:text-primary transition-colors">
                  {sim.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  {sim.description}
                </p>
              </div>

              <button
                type="button"
                onClick={sim.action}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded bg-surface-elevated hover:bg-surface border border-border text-foreground font-medium text-xs transition-colors"
              >
                <span>Simulator starten</span>
                <ArrowRight className="h-3 w-3 text-primary" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

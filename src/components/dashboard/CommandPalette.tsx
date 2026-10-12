import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowsSplit,
  BookOpen,
  Calculator,
  GitFork,
  HardDrives,
  ListChecks,
  MagnifyingGlass,
  ShareNetwork,
  Target,
  Terminal,
  TreeStructure,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface CommandItem {
  id: string;
  category: "Themen" | "Simulatoren" | "Werkzeuge" | "IOS-Befehle";
  title: string;
  description: string;
  keywords: string[];
  action: () => void;
  icon?: React.ElementType;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectTopic: (topicId: string) => void;
  onOpenSimulator: (simId: "vlan" | "stp" | "routing" | "osi") => void;
  onOpenCanvasV2: () => void;
  onOpenWeaknessDrill: () => void;
  onOpenDragDropTrainer: () => void;
  onOpenSubnetDrill: () => void;
  onOpenExamPrep: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onSelectTopic,
  onOpenSimulator,
  onOpenCanvasV2,
  onOpenWeaknessDrill,
  onOpenDragDropTrainer,
  onOpenSubnetDrill,
  onOpenExamPrep,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // All searchable command items
  const allItems: CommandItem[] = useMemo(
    () => [
      // Simulatoren
      {
        id: "sim-vlan",
        category: "Simulatoren",
        title: "VLAN- & Trunk-Simulator",
        description: "802.1Q Tags, Access/Trunk-Ports und Frames analysieren",
        keywords: ["vlan", "trunk", "802.1q", "switching", "access"],
        action: () => onOpenSimulator("vlan"),
        icon: GitFork,
      },
      {
        id: "sim-stp",
        category: "Simulatoren",
        title: "Spanning-Tree-Simulator",
        description: "Root Bridge, Port-Rollen und STP-Topologie prüfen",
        keywords: ["stp", "spanning-tree", "root", "bpdu", "rstp"],
        action: () => onOpenSimulator("stp"),
        icon: TreeStructure,
      },
      {
        id: "sim-routing",
        category: "Simulatoren",
        title: "Routing- & OSPF-Simulator",
        description: "Routingtabellen, Longest Match und OSPF Link-States",
        keywords: ["routing", "ospf", "route", "lsa", "metric"],
        action: () => onOpenSimulator("routing"),
        icon: ArrowsSplit,
      },
      {
        id: "sim-osi",
        category: "Simulatoren",
        title: "OSI- & TCP/IP-Simulator",
        description: "Kapselung über alle 7 Schichten visualisieren",
        keywords: ["osi", "tcp", "ip", "encapsulation", "layer"],
        action: () => onOpenSimulator("osi"),
        icon: HardDrives,
      },
      {
        id: "sim-canvas-v2",
        category: "Simulatoren",
        title: "Topologie-Canvas v2",
        description: "Packet-Tracer-Stil Netzwerkplaner",
        keywords: ["canvas", "topology", "packet tracer", "netzwerkplan"],
        action: onOpenCanvasV2,
        icon: ShareNetwork,
      },

      // Werkzeuge & Drills
      {
        id: "tool-weakness",
        category: "Werkzeuge",
        title: "Schwächen-Drill",
        description: "Prüfungsfragen mit Fehlern gezielt wiederholen",
        keywords: ["drill", "schwächen", "fehler", "fragen", "wiederholen"],
        action: onOpenWeaknessDrill,
        icon: Target,
      },
      {
        id: "tool-dragdrop",
        category: "Werkzeuge",
        title: "Drag-and-Drop Trainer",
        description: "81 interaktive Zuordnungsaufgaben für CCNA 200-301",
        keywords: ["drag", "drop", "labs", "zuordnung", "interaktiv"],
        action: onOpenDragDropTrainer,
        icon: ListChecks,
      },
      {
        id: "tool-subnet-drill",
        category: "Werkzeuge",
        title: "Subnetting-Drill",
        description: "Präfixe, Masken und Blockgrößen im Minutentakt üben",
        keywords: ["subnet", "subnetting", "cidr", "maske", "vlsm"],
        action: onOpenSubnetDrill,
        icon: Calculator,
      },
      {
        id: "tool-exam-prep",
        category: "Werkzeuge",
        title: "Prüfungsvorbereitung (1.055 Fragen)",
        description: "Vollständiger CCNA 200-301 Multiple-Choice-Fragenpool",
        keywords: ["exam", "prüfung", "fragen", "test", "ccna"],
        action: onOpenExamPrep,
        icon: BookOpen,
      },

      // Kern-Themen
      {
        id: "topic-fundamentals",
        category: "Themen",
        title: "1.0 Netzwerkgrundlagen & OSI-Modell",
        description: "OSI, TCP/IP, Kabel, Topologien & Virtualisierung",
        keywords: ["fundamentals", "osi", "tcp", "ip", "kabel", "grundlagen"],
        action: () => onSelectTopic("networking-fundamentals"),
        icon: BookOpen,
      },
      {
        id: "topic-subnetting",
        category: "Themen",
        title: "1.6 Subnetz-Segmentierung & VLSM",
        description: "IPv4 Adressplanung, Blockgrößen & Hostbereiche",
        keywords: ["subnetting", "vlsm", "ipv4", "cidr", "berechnung"],
        action: () => onSelectTopic("subnet-segmentation"),
        icon: BookOpen,
      },
      {
        id: "topic-ipv6",
        category: "Themen",
        title: "1.8 IPv6 Adressierung & Autokonfiguration",
        description: "GUA, ULA, Link-Local, SLAAC und EUI-64",
        keywords: ["ipv6", "slaac", "link-local", "eui-64", "adressen"],
        action: () => onSelectTopic("ipv6"),
        icon: BookOpen,
      },
      {
        id: "topic-switching",
        category: "Themen",
        title: "2.1 Switching, VLANs & 802.1Q Trunks",
        description: "Switch-Ports, Access vs. Trunk, Native VLAN",
        keywords: ["vlan", "switching", "trunk", "802.1q", "dtp"],
        action: () => onSelectTopic("switching-vlans"),
        icon: BookOpen,
      },
      {
        id: "topic-stp",
        category: "Themen",
        title: "2.5 Spanning Tree Protocol (STP & RSTP)",
        description: "Root Bridge, PVST+, PortFast und BPDU Guard",
        keywords: ["stp", "rstp", "pvst", "spanning-tree", "loop"],
        action: () => onSelectTopic("stp"),
        icon: BookOpen,
      },
      {
        id: "topic-etherchannel",
        category: "Themen",
        title: "2.4 EtherChannel (LACP & PAgP)",
        description: "Link-Aggregation, Channel-Groups und Load Balancing",
        keywords: ["etherchannel", "lacp", "pagp", "bundling"],
        action: () => onSelectTopic("etherchannel"),
        icon: BookOpen,
      },
      {
        id: "topic-wlan",
        category: "Themen",
        title: "2.6 Cisco Wireless Architekturen",
        description: "WLC, AP-Modi, CAPWAP, WPA3 und Roaming",
        keywords: ["wlan", "wireless", "wlc", "ap", "wpa3", "wifi"],
        action: () => onSelectTopic("wlan"),
        icon: BookOpen,
      },
      {
        id: "topic-routing",
        category: "Themen",
        title: "3.4 OSPFv2 Routing & Konfiguration",
        description: "Single-Area OSPF, Router-ID, DR/BDR, Link-States",
        keywords: ["ospf", "routing", "router", "lsa", "metric"],
        action: () => onSelectTopic("routing-ospf"),
        icon: BookOpen,
      },
      {
        id: "topic-nat",
        category: "Themen",
        title: "4.1 Network Address Translation (NAT/PAT)",
        description: "Static NAT, Dynamic NAT, Overload (PAT)",
        keywords: ["nat", "pat", "overload", "translation", "inside"],
        action: () => onSelectTopic("nat"),
        icon: BookOpen,
      },
      {
        id: "topic-acl",
        category: "Themen",
        title: "5.5 Access Control Lists (ACLs)",
        description: "Standard & Extended IPv4 ACLs, Wildcard-Masken",
        keywords: ["acl", "security", "firewall", "filter", "access-list"],
        action: () => onSelectTopic("acl"),
        icon: BookOpen,
      },
      {
        id: "topic-automation",
        category: "Themen",
        title: "6.0 Automatisierung, REST & Ansible",
        description: "Cisco DNA Center, JSON, YAML, REST-APIs",
        keywords: ["automation", "rest", "api", "json", "yaml", "ansible"],
        action: () => onSelectTopic("automation"),
        icon: BookOpen,
      },

      // Cisco IOS Quick Reference Commands
      {
        id: "cmd-ip-route",
        category: "IOS-Befehle",
        title: "show ip route",
        description: "Zeigt die IPv4-Routingtabelle mit Protokoll-Codes an",
        keywords: ["show ip route", "routing", "tabelle", "gateway"],
        action: () => onOpenSimulator("routing"),
        icon: Terminal,
      },
      {
        id: "cmd-ip-int-br",
        category: "IOS-Befehle",
        title: "show ip interface brief",
        description: "Status (up/up) und IP-Adressen aller Interfaces anzeigen",
        keywords: ["show ip interface brief", "status", "interfaces", "ports"],
        action: () => onSelectTopic("ios-cli"),
        icon: Terminal,
      },
      {
        id: "cmd-vlan-br",
        category: "IOS-Befehle",
        title: "show vlan brief",
        description: "Zugeordnete Ports und VLAN-Namen auf dem Switch prüfen",
        keywords: ["show vlan brief", "vlan", "ports", "switch"],
        action: () => onOpenSimulator("vlan"),
        icon: Terminal,
      },
      {
        id: "cmd-stp",
        category: "IOS-Befehle",
        title: "show spanning-tree",
        description: "Root-Bridge-ID, Port-Rollen und STP-Status prüfen",
        keywords: ["show spanning-tree", "stp", "root bridge", "blocking"],
        action: () => onOpenSimulator("stp"),
        icon: Terminal,
      },
      {
        id: "cmd-ospf-neigh",
        category: "IOS-Befehle",
        title: "show ip ospf neighbor",
        description: "OSPF-Nachbarschaften und Zustände (FULL, 2-WAY) verifizieren",
        keywords: ["show ip ospf neighbor", "ospf", "neighbor", "dr", "bdr"],
        action: () => onSelectTopic("routing-ospf"),
        icon: Terminal,
      },
    ],
    [
      onSelectTopic,
      onOpenSimulator,
      onOpenCanvasV2,
      onOpenWeaknessDrill,
      onOpenDragDropTrainer,
      onOpenSubnetDrill,
      onOpenExamPrep,
    ]
  );

  // Filtered results
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 10);
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  // Keyboard navigation within command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredItems[selectedIndex];
      if (current) {
        current.action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="CCNA Befehlspalette"
    >
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-elevated/40">
          <MagnifyingGlass className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Thema, Simulator, Tool oder Cisco-Befehl suchen (z. B. 'OSPF', 'VLAN', 'show ip route')..."
            aria-label="Suchbegriff eingeben"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-surface-elevated"
            title="Schließen (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[360px] overflow-y-auto p-2 divide-y divide-border/40 space-y-1"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon || BookOpen;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs",
                    isSelected
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-surface-elevated text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-7 w-7 rounded flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-surface-elevated text-primary"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" weight="bold" />
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">
                        {item.title}
                      </div>
                      <div
                        className={cn(
                          "text-[11px] truncate",
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-surface-elevated text-muted-foreground"
                    )}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Keine Treffer für „{query}“ gefunden.
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2 border-t border-border bg-surface-elevated/40 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigieren</span>
            <span>•</span>
            <span>↵ Auswählen</span>
            <span>•</span>
            <span>Esc Schließen</span>
          </div>
          <span>CCNA 200-301</span>
        </div>
      </div>
    </div>
  );
}

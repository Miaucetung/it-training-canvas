export type ToolEngineSupport = "both" | "v1_only" | "v2_only" | "independent";

export interface NavToolDefinition {
  id: string;
  name: string;
  category: "simulators" | "tools" | "practice" | "learn";
  description: string;
  engineSupport: ToolEngineSupport;
  engineNotice?: string;
  subjects: string[] | "all"; // Array of subject IDs where this tool is relevant, or "all"
  icon: string;
  isCanvasAction?: boolean; // If true, flips to canvas when invoked
  dialogTarget: string; // Name of component or view opened
}

export const NAVIGATION_ITEMS: NavToolDefinition[] = [
  // --- SIMULATOREN ---
  {
    id: "vlan-simulator",
    name: "VLAN- und Trunk-Simulator",
    category: "simulators",
    description: "Frames, Access-/Trunk-Ports & 802.1Q-Tags analysieren",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "TreeStructure",
    dialogTarget: "VlanSimulatorDialog",
  },
  {
    id: "stp-simulator",
    name: "Spanning-Tree-Simulator (STP/RSTP)",
    category: "simulators",
    description: "Root-Bridge-Wahl, Port-Rollen & BPDUs Schritt für Schritt",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "GitFork",
    dialogTarget: "StpSimulatorDialog",
  },
  {
    id: "osi-simulator",
    name: "OSI- und TCP/IP-Simulator",
    category: "simulators",
    description: "Kapselung durch alle 7 Schichten (L1–L7) & PDU-Header",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking", "Security"],
    icon: "Stack",
    dialogTarget: "OsiSimulatorDialog",
  },
  {
    id: "routing-simulator",
    name: "Routing- und OSPF-Simulator",
    category: "simulators",
    description: "Routingtabellen, Pfadwahl & OSPF-Konvergenz",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Compass",
    dialogTarget: "RoutingSimulatorDialog",
  },
  {
    id: "ping-test",
    name: "Geführter Ping-Test",
    category: "simulators",
    description: "ARP & ICMP Schritt für Schritt auf dem Canvas",
    engineSupport: "v1_only",
    engineNotice: "Der geführte Ping-Test ist aktuell nur für Canvas-v1-Topologien verfügbar. Schalte im Canvas auf v1 um.",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Lightning",
    isCanvasAction: true,
    dialogTarget: "PingScenarioDialog",
  },
  {
    id: "packet-flow",
    name: "Paketfluss-Visualisierer (Canvas v2)",
    category: "simulators",
    description: "Hop-by-Hop-Verfolgung über Kabelverbindungen (In Vorbereitung)",
    engineSupport: "v2_only",
    engineNotice: "Die Paketfluss-Visualisierung ist für Topologie-Canvas v2 konzipiert.",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Lightning",
    dialogTarget: "Canvas v2 PacketFlow Engine",
  },
  {
    id: "simulation-hud",
    name: "Topologie-Simulation (HUD)",
    category: "simulators",
    description: "Play/Pause, Step & Pakete senden in Echtzeit",
    engineSupport: "v1_only",
    engineNotice: "Das Simulations-HUD steuert die Animationen in Canvas v1. Schalte im Canvas auf v1 um.",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Pulse",
    isCanvasAction: true,
    dialogTarget: "SimulationHUD / SimulationControls",
  },

  // --- WERKZEUGE: SUBNETTING & RECHNER ---
  {
    id: "subnetting-drill",
    name: "Subnetting-Drill (Schnellrechnen)",
    category: "tools",
    description: "Gegen die Uhr Subnetze und Hostbereiche berechnen",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking", "Security"],
    icon: "Timer",
    dialogTarget: "SubnettingDrillModal",
  },
  {
    id: "subnetting-quiz",
    name: "Subnetting-Quiz (Fragen)",
    category: "tools",
    description: "Multiple-Choice zu Usable Ranges, Masken & Broadcast",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking", "Security"],
    icon: "Question",
    dialogTarget: "SubnettingQuizModal",
  },
  {
    id: "subnetting-cheatsheet",
    name: "Subnetting-Übersicht & Rechner",
    category: "tools",
    description: "VLSM, Blockgrößen, Präfixtabelle & Umrechner",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking", "Security"],
    icon: "FileText",
    dialogTarget: "SubnettingCheatsheetModal",
  },
  {
    id: "ipv4-subnet-table",
    name: "IPv4-Subnetz-Tabelle",
    category: "tools",
    description: "CIDR, Subnetzmasken, Wildcard & Binär-Übersicht",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking", "Security"],
    icon: "Table",
    dialogTarget: "IPv4SubnetTableModal",
  },
  {
    id: "ipv6-calculator",
    name: "IPv6-Präfix- & EUI-64-Rechner",
    category: "tools",
    description: "Adressen komprimieren/expandieren, EUI-64 & Subnetze",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Calculator",
    dialogTarget: "IPv6CalculatorDialog",
  },

  // --- WERKZEUGE: DRILLS & LABS ---
  {
    id: "routing-drill",
    name: "Routing-Trainer (ip route)",
    category: "tools",
    description: "ip route, Next-Hop & Longest-Prefix-Match trainieren",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Compass",
    dialogTarget: "RoutingDrillModal",
  },
  {
    id: "ospf-wildcard-drill",
    name: "OSPF- und Wildcard-Trainer",
    category: "tools",
    description: "Wildcard-Masken, Area-Zuweisung & DR/BDR üben",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI"],
    icon: "TreeStructure",
    dialogTarget: "OspfWildcardDrillModal",
  },
  {
    id: "acl-drill",
    name: "Access-List-Trainer (ACL)",
    category: "tools",
    description: "Standard- und Extended-ACLs regelbasiert trainieren",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Security"],
    icon: "ShieldCheck",
    dialogTarget: "AclDrillModal",
  },

  // --- WERKZEUGE: CISCO IOS & PRAXIS ---
  {
    id: "cli-glossary",
    name: "Cisco-IOS-Befehlsreferenz",
    category: "tools",
    description: "IOS-Befehlssyntax, Modi und Parameter nachschlagen",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI"],
    icon: "BookOpen",
    dialogTarget: "CliGlossaryModal",
  },
  {
    id: "terminal",
    name: "Cisco-IOS-Terminal (Konsole)",
    category: "tools",
    description: "Interaktive IOS-Konsole für selektiertes Netzwerkgerät",
    engineSupport: "both",
    subjects: ["CCNA", "FISI"],
    icon: "Terminal",
    isCanvasAction: true,
    dialogTarget: "TerminalEmulator Dialog",
  },
  {
    id: "labs",
    name: "Geführte Praxis-Labs",
    category: "tools",
    description: "Schritt-für-Schritt konfigurieren und verifizieren",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI"],
    icon: "GraduationCap",
    dialogTarget: "LabScenariosDialog",
  },
  {
    id: "verkabelung-trainer",
    name: "Verkabelungs-Trainer (Kabel & Ports)",
    category: "tools",
    description: "Kabeltypen, Medien und Port-Zuordnungen üben",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Plugs",
    dialogTarget: "VerkabelungTrainerModal",
  },

  // --- WERKZEUGE: CLOUD ---
  {
    id: "cost-calculator",
    name: "Cloud-Kosten-Rechner",
    category: "tools",
    description: "VM-, Speicher- und Transferkosten für Cloud-Ressourcen kalkulieren",
    engineSupport: "independent",
    subjects: ["Azure", "AWS"],
    icon: "CurrencyDollar",
    dialogTarget: "CostCalculator Dialog",
  },

  // --- WERKZEUGE: CANVAS & KOLLABORATION ---
  {
    id: "add-device",
    name: "Gerät hinzufügen",
    category: "tools",
    description: "Router, Switch, PC oder Server auf der Arbeitsfläche platzieren",
    engineSupport: "v1_only",
    engineNotice: "Geräte werden im Canvas v2 direkt über die Geräte-Palette in der linken Seitenleiste hinzugefügt.",
    subjects: "all",
    icon: "Plus",
    isCanvasAction: true,
    dialogTarget: "ShapePicker Modal (v1)",
  },
  {
    id: "topology-validator",
    name: "Topologie-Diagnose",
    category: "tools",
    description: "Integritätsprüfung, Subnetzkonflikte und Konfigurationsfehler",
    engineSupport: "v1_only",
    engineNotice: "Die Topologie-Diagnose prüft aktuell Canvas-v1-Topologien. Canvas v2 besitzt eine integrierte Echtzeit-Validierung.",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Stethoscope",
    isCanvasAction: true,
    dialogTarget: "TopologyValidator Dialog",
  },
  {
    id: "topologie-explorer",
    name: "Topologie-Explorer (Referenznetze)",
    category: "tools",
    description: "Vorkonfigurierte Referenz-Netzwerktopologien erkunden",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Network",
    dialogTarget: "TopologieExplorerModal",
  },
  {
    id: "metrics",
    name: "Live-Metriken",
    category: "tools",
    description: "Objektanzahl, Verbindungsstatus und Durchsatz-Metriken",
    engineSupport: "v1_only",
    engineNotice: "Live-Metriken sind aktuell nur für Canvas v1 verfügbar.",
    subjects: "all",
    icon: "ChartLine",
    isCanvasAction: true,
    dialogTarget: "MetricsDashboard Overlay",
  },
  {
    id: "annotations",
    name: "Topologie-Notizen",
    category: "tools",
    description: "Kommentare und Dokumentationsnotizen an Geräten anheften",
    engineSupport: "v1_only",
    engineNotice: "Notizen sind aktuell nur für Canvas v1 verfügbar.",
    subjects: "all",
    icon: "Notepad",
    isCanvasAction: true,
    dialogTarget: "Canvas Annotations Overlay",
  },
  {
    id: "templates",
    name: "Topologie-Vorlagen",
    category: "tools",
    description: "Netzwerkmuster (Router-on-a-Stick, Drei-Schichten, etc.) laden",
    engineSupport: "v1_only",
    engineNotice: "Vorlagen sind für Canvas v1 verfügbar. Canvas v2 besitzt eine eigene Vorlagen-Verwaltung in der Toolbar.",
    subjects: "all",
    icon: "FolderOpen",
    dialogTarget: "TemplateGallery Dialog",
  },
  {
    id: "share-export",
    name: "Teilen und Exportieren",
    category: "tools",
    description: "Topologie als JSON/PNG exportieren oder per Link teilen",
    engineSupport: "v1_only",
    engineNotice: "Der globale Export-Dialog exportiert Canvas v1. Canvas v2 besitzt eigene Export-Funktionen (PNG/JSON/SVG) in der oberen Toolbar.",
    subjects: "all",
    icon: "Export",
    dialogTarget: "ShareExportDialog",
  },

  // --- ÜBEN & PRÜFEN ---
  {
    id: "exam-prep",
    name: "Prüfungsfragen-Trainer",
    category: "practice",
    description: "Lern- und Prüfungsmodus mit ausführlichen Erklärungen",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Target",
    dialogTarget: "ExamPrepDialog",
  },
  {
    id: "dragdrop-trainer",
    name: "Drag-and-Drop-Trainer",
    category: "practice",
    description: "Zuordnungsfragen mit originalen CCNA-Exhibits",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Stack",
    dialogTarget: "DragDropTrainerDialog",
  },
  {
    id: "prioritized-learning",
    name: "Priorisiertes Lernen (Blueprint)",
    category: "practice",
    description: "Fragen nach offizieller CCNA-Prüfungsgewichtung sortiert",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "ChartLine",
    dialogTarget: "PrioritizedLearningDialog",
  },
  {
    id: "weakness-drill",
    name: "Gezielter Schwächen-Drill",
    category: "practice",
    description: "Wiederholung bisher falsch beantworteter Prüfungsfragen",
    engineSupport: "independent",
    subjects: ["CCNA", "FISI", "Networking"],
    icon: "Lightning",
    dialogTarget: "ExamPrepDialog (Schwächen-Modus)",
  },

  // --- LERNEN ---
  {
    id: "overview",
    name: "Themenübersicht & Module",
    category: "learn",
    description: "Alle Lernmodule und Lektionen des gewählten Fachs",
    engineSupport: "independent",
    subjects: "all",
    icon: "BookOpen",
    dialogTarget: "TopicListPanel / Dashboard",
  },
  {
    id: "learning-paths",
    name: "Lernpfade",
    category: "learn",
    description: "Strukturierte Schritt-für-Schritt-Lehrpfade",
    engineSupport: "independent",
    subjects: "all",
    icon: "Compass",
    dialogTarget: "LearningPathOverview",
  },
  {
    id: "progress",
    name: "Mein Lernfortschritt",
    category: "learn",
    description: "Absolvierte Lektionen, Quizzes und Erfolgsstatistiken",
    engineSupport: "independent",
    subjects: "all",
    icon: "ChartLine",
    dialogTarget: "ProgressTracker / Account Dialog",
  },
];

/**
 * Filtert Werkzeuge nach Fachzugehörigkeit.
 */
export function isToolSupportedForSubject(toolId: string, currentSubject: string): boolean {
  const item = NAVIGATION_ITEMS.find((t) => t.id === toolId);
  if (!item) return true;
  if (item.subjects === "all") return true;
  return item.subjects.includes(currentSubject);
}

/**
 * Prüft ob ein Werkzeug mit der aktuellen Canvas-Engine kompatibel ist.
 */
export function getToolEngineStatus(
  toolId: string,
  canvasEngine: "v1" | "v2"
): { isAvailable: boolean; notice?: string; requiresV1: boolean } {
  const item = NAVIGATION_ITEMS.find((t) => t.id === toolId);
  if (!item) return { isAvailable: true, requiresV1: false };

  if (item.engineSupport === "v1_only" && canvasEngine === "v2") {
    return {
      isAvailable: false,
      notice: item.engineNotice || "Dieses Werkzeug ist aktuell nur im Canvas v1 verfügbar.",
      requiresV1: true,
    };
  }

  if (item.engineSupport === "v2_only" && canvasEngine === "v1") {
    return {
      isAvailable: false,
      notice: item.engineNotice || "Dieses Werkzeug ist aktuell nur im Canvas v2 verfügbar.",
      requiresV1: false,
    };
  }

  return { isAvailable: true, requiresV1: false };
}

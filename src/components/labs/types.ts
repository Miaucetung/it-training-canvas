import type { ExhibitData } from "@/types/exhibit";

export interface CommandBlock {
  device: string;      // z. B. "Router0"
  mode: string;        // z. B. "privileged" | "global" | "interface"
  modeLabel: string;   // z. B. "Router#" | "Router(config)#"
  commands: Array<{
    cmd: string;
    explanation: string;
  }>;
}

export interface LabStep {
  title: string;
  blocks: CommandBlock[];
}

/** Ein Zeileneintrag in der normierten Adressierungstabelle des Labs */
export interface LabAddressingEntry {
  device: string;          // z. B. "R1"
  interface: string;       // z. B. "G0/0/0" oder "VLAN 10"
  ip: string;              // z. B. "192.168.1.1" oder "DHCP"
  subnetMask: string;      // z. B. "255.255.255.0" oder "/24"
  defaultGateway?: string; // z. B. "N/A" oder "192.168.1.1"
  vlan?: string | number;  // z. B. "10", "VLAN 10" oder "N/A"
  description?: string;    // z. B. "LAN Gateway", "Uplink zu SW1"
}

/** Dezent hinterlegte Subnetz- oder Broadcast-Zone im Diagramm */
export interface LabSubnetZone {
  id: string;
  label: string;           // z. B. "VLAN 10 · Sales · 192.168.10.0/24"
  vlan?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  colorTheme?: "indigo" | "blue" | "amber" | "emerald" | "violet" | "rose" | "slate";
  description?: string;
}

/** Netzwerk-Gerät in der Cisco-Press-Topologie */
export interface LabTopologyDevice {
  id: string;              // Eindeutige ID im Lab, z. B. "r1", "sw1", "pc1"
  name: string;            // Anzeigename, z. B. "R1"
  type: "router" | "switch-l2" | "switch-l3" | "firewall" | "server" | "pc" | "cloud" | "access-point";
  tier: "wan" | "gateway" | "core" | "distribution" | "access" | "endpoint";
  /** Im Lab nicht angegeben, aber für die Topologie nötig: gestrichelt, ohne Konfiguration, ohne CLI-Export */
  assumed?: boolean;
  /** nicht angegeben (fehlt im Lab, Standard) oder nicht konfiguriert (im Lab genannt, aber ohne Konfiguration) */
  assumedReason?: "not-specified" | "not-configured";
  /** DHCP-Client: Netz aus dem Lab (z. B. "192.168.1.0/24"); konkrete Adresse entsteht erst zur Laufzeit */
  dhcpNetwork?: string;
  x: number;
  y: number;
  model?: string;          // z. B. "Cisco 2901", "WS-C2960-24TT-L"
  highlightGroup?: string; // Gruppe zur verknüpften Hervorhebung
}

/** Verbindung zwischen Geräten mit Port- und IP-Labeling an beiden Enden */
export interface LabTopologyLink {
  id: string;
  from: string;            // Device-ID
  to: string;              // Device-ID
  fromPort: string;        // z. B. "Gi0/0"
  toPort: string;          // z. B. "Gi0/1"
  fromIp?: string;         // z. B. "192.168.1.1"
  toIp?: string;           // z. B. "192.168.1.2"
  cableType?: "copper-straight" | "copper-cross" | "serial" | "fiber" | "tunnel";
  isTrunk?: boolean;       // Hebt 802.1Q-Trunk optisch hervor
  vlan?: number;
  /** Optionale orthogonale Knickpunkte für rechtwinklige Linienführung */
  bendPoints?: Array<{ x: number; y: number }>;
  subnetLabel?: string;    // z. B. "10.0.12.0/30"
  /** Spezifischer Abstand der Port-Labels entlang des Link-Segments (in Pixel) */
  fromPortOffset?: number;
  toPortOffset?: number;
  /** Spezifischer seitlicher Versatz (+ oder -) */
  fromPortSide?: number;
  toPortSide?: number;
  /** Spezifische Koordinate für das Subnetz-Badge auf der Verbindung */
  subnetLabelPos?: { x: number; y: number };
}

/** VLAN-Definition für Legende und einheitliche Farbcodierung */
export interface LabTopologyVlan {
  id: number;
  name: string;            // z. B. "Sales"
  colorTheme: "indigo" | "blue" | "amber" | "emerald" | "violet" | "rose";
  subnet: string;          // z. B. "192.168.10.0/24"
}

/** Vollständiges, hochpräzises Topologie- und Adressierungsmodell */
export interface LabTopologyData {
  viewBox: { width: number; height: number };
  devices: LabTopologyDevice[];
  links: LabTopologyLink[];
  zones?: LabSubnetZone[];
  vlans?: LabTopologyVlan[];
  /** Freie Textmarken im Diagramm (z. B. logischer IPSec-Tunnel ohne eigenes Interface) */
  notes?: Array<{ id: string; text: string; x: number; y: number }>;
  addressingTable: LabAddressingEntry[];
}

export interface LabScenario {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  difficulty: "Drill" | "Anfänger" | "Mittel" | "Fortgeschritten";
  duration: string;
  /** Warum dieses Lab? Welches Problem es löst und wofür das Szenario gebraucht wird. */
  context?: { problem: string; purpose: string };
  topology: {
    description: string;
    devices: Array<{ type: string; label: string; count: number }>;
    connections: string[];
    hint: string;
    /** Optionales visuelles Netzwerkdiagramm (SVG/JSX), wird unter dem Hint angezeigt. */
    topologyDiagram?: React.ReactNode;
  };
  /** Neues strukturiertes Cisco-Press Topologie- & Adressmodell */
  structuredTopology?: LabTopologyData;
  steps: LabStep[];
  verifyCommands: Array<{ cmd: string; expected: string; explanation?: string }>;
  /** Kurz-Glossar der im Lab verwendeten Fachbegriffe. */
  glossary?: Array<{ term: string; def: string }>;
  /** Strukturierte Exhibits (Topologie/Adressplan/CLI), gerendert über ExhibitRenderer. */
  exhibits?: ExhibitData[];
}

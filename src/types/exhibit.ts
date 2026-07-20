// ============================================================
// Exhibit-Datentypen (strukturierte Grafiken/CLI/Tabellen zu Fragen).
// Rückwärtskompatibel: CCNAQuestion.exhibit ist `boolean | ExhibitData`.
// ============================================================

export type ExhibitType = "cli" | "topology" | "table" | "none";

export interface CLIExhibit {
  type: "cli";
  content: string;
  highlight?: string[]; // Zeilentexte, die grün hervorgehoben werden
}

export interface TopologyDevice {
  id: string;
  type: "router" | "multilayer-switch" | "switch" | "pc" | "firewall" | "cloud";
  label: string;
  x: number;
  y: number;
}

export interface TopologyLink {
  from: string;
  to: string;
  labelFrom?: string;
  labelTo?: string;
  subnet?: string;
}

export interface TopologyLabel {
  text: string;
  attachTo: string;
  position: "above" | "below" | "left" | "right";
}

export interface TopologyExhibit {
  type: "topology";
  devices: TopologyDevice[];
  links: TopologyLink[];
  labels?: TopologyLabel[];
}

export interface TableExhibit {
  type: "table";
  headers: string[];
  rows: string[][];
}

/** RF-Abdeckungszonen (z. B. 2,4-GHz-Kanalüberlappung, Q0173). */
export interface ZoneCircle {
  id: string;
  label: string;
  /** WLAN-Kanal; Zonen mit gleichem Kanal erhalten dasselbe Füllmuster. */
  channel: number;
  x: number;
  y: number;
  r?: number;
}

export interface WirelessZonesExhibit {
  type: "wireless-zones";
  zones: ZoneCircle[];
}

export interface NoneExhibit {
  type: "none";
}

export type ExhibitData =
  | CLIExhibit
  | TopologyExhibit
  | TableExhibit
  | WirelessZonesExhibit
  | NoneExhibit;

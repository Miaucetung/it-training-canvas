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

export interface NoneExhibit {
  type: "none";
}

export type ExhibitData =
  | CLIExhibit
  | TopologyExhibit
  | TableExhibit
  | NoneExhibit;

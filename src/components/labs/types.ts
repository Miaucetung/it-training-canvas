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
  steps: LabStep[];
  verifyCommands: Array<{ cmd: string; expected: string; explanation?: string }>;
  /** Kurz-Glossar der im Lab verwendeten Fachbegriffe. */
  glossary?: Array<{ term: string; def: string }>;
  /** Strukturierte Exhibits (Topologie/Adressplan/CLI), gerendert über ExhibitRenderer. */
  exhibits?: ExhibitData[];
}

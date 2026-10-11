import { useState, useCallback, useMemo } from "react";
import { Copy, Check, Terminal as TerminalIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Universeller Regex für Cisco IOS Prompts in allen Betriebsmodi:
 * - User EXEC: R1>
 * - Privileged EXEC: R1#
 * - Global Config: R1(config)#
 * - Interface Config: R1(config-if)#
 * - Sub-Interface Config: R1(config-subif)#
 * - Routing Protocol Config: R1(config-router)#
 * - Line Config: R1(config-line)#
 * - VLAN Config: Switch(config-vlan)#
 * - Beliebige Hostnamen mit Bindestrichen und Ziffern: Core-SW-01(config-if)#, ISR-4331-GW1#
 */
export const CISCO_PROMPT_REGEX = /^([A-Za-z0-9_.-]+(?:\([A-Za-z0-9_.-]+\))?[>#])(?:\s+(.*)|\s*)$/;

/**
 * Parst mehrzeiligen Cisco-Text und liefert ausschließlich die Befehle zurück:
 * - Entfernt Prompts
 * - Zeilen, die nur aus einem Prompt bestehen (z. B. "R1#"), erzeugen keine Leerzeile
 * - "--More--" wird als Paging-Ausgabe behandelt und ignoriert
 * - In IOS ist ausschließlich "!" das Kommentarzeichen ("#" ist kein Kommentar)
 * - Entfernt Ausgaben (Zeilen ohne Prompt)
 * - Exakt eine Zeile pro Befehl
 */
export function extractCiscoCommands(rawText: string): string {
  if (!rawText) return "";
  const lines = rawText.split(/\r?\n/);
  const promptCommands: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("--More--")) continue;

    const match = trimmed.match(CISCO_PROMPT_REGEX);
    if (match) {
      const cmd = match[2] ? match[2].trim() : "";
      if (cmd.length > 0) {
        promptCommands.push(cmd);
      }
      // Nackte Prompts (cmd ist leer) erzeugen absichtlich keine Leerzeile
      continue;
    }
  }

  if (promptCommands.length > 0) {
    return promptCommands.join("\n");
  }

  // Falls keine Prompts gefunden wurden (z. B. reines Konfigurations-Snippet):
  // In IOS ist ausschließlich '!' ein Kommentarzeichen ('#' ist KEIN Kommentar!).
  // Paging-Ausgaben wie '--More--' und Leerzeilen werden entfernt.
  return lines
    .map((l) => l.trim())
    .filter(
      (l) => l.length > 0 && !l.startsWith("!") && !l.startsWith("--More--"),
    )
    .join("\n");
}

export interface CiscoTerminalProps {
  title?: string;
  prompt?: string;
  command?: string;
  output?: string;
  content?: string;
  children?: React.ReactNode;
  className?: string;
  showCopy?: boolean;
}

interface ParsedLine {
  type: "prompt-cmd" | "output";
  prompt?: string;
  command?: string;
  text?: string;
}

/**
 * Standardisierte Cisco-CLI- und Terminal-Komponente.
 *
 * Regeln (Phase R2 / Section 7.1):
 * - Bleibt in BEIDEN Themes dunkel (bg-terminal-bg, text-terminal-fg)
 * - Nur der umgebende Rahmen passt sich an das gewählte Theme an (border-terminal-border)
 * - Prompt-Erkennung für alle IOS-Modi
 * - Kopier-Funktion liefert alle Befehle ohne Prompts und ohne Ausgaben (1 Zeile pro Befehl)
 */
export function CiscoTerminal({
  title = "Cisco IOS CLI",
  prompt = "Router#",
  command,
  output,
  content,
  children,
  className,
  showCopy = true,
}: CiscoTerminalProps) {
  const [copied, setCopied] = useState(false);

  // Mehrzeiliger Inhalt wenn content oder string-children übergeben wurden
  const rawText = typeof children === "string" ? children : content;

  const parsedLines = useMemo((): ParsedLine[] | null => {
    if (!rawText) return null;
    const lines = rawText.split(/\r?\n/);
    return lines.map((line) => {
      const match = line.match(CISCO_PROMPT_REGEX);
      if (match && match[2] !== undefined) {
        return {
          type: "prompt-cmd",
          prompt: match[1],
          command: match[2],
        };
      }
      return {
        type: "output",
        text: line,
      };
    });
  }, [rawText]);

  const handleCopy = useCallback(async () => {
    let textToCopy = "";

    if (rawText) {
      textToCopy = extractCiscoCommands(rawText);
    } else if (command) {
      textToCopy = command.trim();
    } else if (output) {
      textToCopy = extractCiscoCommands(output);
    }

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [rawText, command, output]);

  return (
    <div
      data-slot="cisco-terminal"
      className={cn(
        "rounded-xl border border-terminal-border bg-terminal-bg text-terminal-fg shadow-md overflow-hidden font-mono text-xs my-3",
        className
      )}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-terminal-border bg-surface-sunken/40 text-terminal-muted select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-terminal-prompt" aria-hidden />
          <span className="font-sans font-medium text-xs text-terminal-muted">{title}</span>
        </div>

        {showCopy && (command || rawText || output) && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans text-terminal-muted hover:text-terminal-cmd hover:bg-terminal-selection transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            title="Befehle ohne Prompts und ohne Ausgaben in die Zwischenablage kopieren"
            aria-label={copied ? "Befehle kopiert" : "Befehle kopieren"}
          >
            {copied ? (
              <>
                <Check size={12} className="text-status-success-fg" weight="bold" />
                <span className="text-status-success-fg font-medium">Kopiert</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Kopieren</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Terminal Body */}
      <div className="p-3.5 space-y-1.5 overflow-x-auto selection:bg-terminal-selection selection:text-white leading-relaxed">
        {parsedLines ? (
          <div className="space-y-1 font-mono text-xs leading-relaxed">
            {parsedLines.map((pl, idx) => {
              if (pl.type === "prompt-cmd") {
                return (
                  <div key={idx} className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-terminal-prompt font-semibold select-none shrink-0">
                      {pl.prompt}
                    </span>
                    {pl.command ? (
                      <span className="text-terminal-cmd font-bold tracking-tight">
                        {pl.command}
                      </span>
                    ) : null}
                  </div>
                );
              }
              return (
                <div key={idx} className="text-terminal-fg opacity-95 whitespace-pre-wrap">
                  {pl.text}
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {/* Single Command + Prompt */}
            {(prompt || command) && (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                {prompt && (
                  <span className="text-terminal-prompt font-semibold select-none shrink-0">
                    {prompt}
                  </span>
                )}
                {command && (
                  <span className="text-terminal-cmd font-bold tracking-tight">
                    {command}
                  </span>
                )}
              </div>
            )}

            {/* Command Output */}
            {output && (
              <pre className="text-terminal-fg whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-95">
                {output}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CiscoTerminal;

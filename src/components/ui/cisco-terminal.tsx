import { useState, useCallback } from "react";
import { Copy, Check, Terminal as TerminalIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface CiscoTerminalProps {
  title?: string;
  prompt?: string;
  command?: string;
  output?: string;
  className?: string;
  showCopy?: boolean;
}

/**
 * Standardisierte Cisco-CLI- und Terminal-Komponente.
 *
 * Regeln (Phase R2 / Section 7.1):
 * - Bleibt in BEIDEN Themes dunkel (--terminal-bg: #0B0F19, --terminal-fg: #E2E8F0)
 * - Nur der umgebende Rahmen passt sich an das gewählte Theme an (--terminal-border)
 * - Exakte Drei-Elemente-Trennung: Prompt, Befehl, Ausgabe
 * - Der Kopier-Button kopiert ausschließlich den Befehl, niemals den Prompt!
 */
export function CiscoTerminal({
  title = "Cisco IOS CLI",
  prompt = "Router#",
  command,
  output,
  className,
  showCopy = true,
}: CiscoTerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const textToCopy = command || output || "";
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [command, output]);

  return (
    <div
      data-slot="cisco-terminal"
      className={cn(
        "rounded-xl border border-[var(--terminal-border)] bg-[var(--terminal-bg)] text-[var(--terminal-fg)] shadow-md overflow-hidden font-mono text-xs my-3",
        className
      )}
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--terminal-border)] bg-[var(--surface-sunken)]/40 text-[var(--terminal-muted)] select-none">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[var(--terminal-prompt)]" aria-hidden />
          <span className="font-sans font-medium text-xs text-[var(--terminal-muted)]">{title}</span>
        </div>

        {showCopy && (command || output) && (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans text-[var(--terminal-muted)] hover:text-[var(--terminal-cmd)] hover:bg-[var(--terminal-selection)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            title="Befehl ohne Prompt in die Zwischenablage kopieren"
            aria-label={copied ? "Befehl kopiert" : "Befehl kopieren"}
          >
            {copied ? (
              <>
                <Check size={12} className="text-[var(--status-success-fg)]" weight="bold" />
                <span className="text-[var(--status-success-fg)] font-medium">Kopiert</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Befehl kopieren</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Terminal Body */}
      <div className="p-3.5 space-y-2 overflow-x-auto selection:bg-[var(--terminal-selection)] selection:text-white leading-relaxed">
        {/* Command Line (Prompt + Command) */}
        {(prompt || command) && (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            {prompt && (
              <span className="text-[var(--terminal-prompt)] font-semibold select-none shrink-0">
                {prompt}
              </span>
            )}
            {command && (
              <span className="text-[var(--terminal-cmd)] font-bold tracking-tight">
                {command}
              </span>
            )}
          </div>
        )}

        {/* Command Output */}
        {output && (
          <pre className="text-[var(--terminal-fg)] whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-95">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}

export default CiscoTerminal;

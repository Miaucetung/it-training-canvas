import { splitCliOption } from "@/lib/cli-option";

interface CliOptionTextProps {
  text: string;
  /** Klassen für normale Antworttexte und Einzelbefehle: unverändert wie bisher */
  className?: string;
  /** Klassen des äußeren Elements bei CLI-Blöcken (muss im Flex-Layout schrumpfen dürfen) */
  cliClassName?: string;
}

/**
 * Text einer Antwortoption. Erkannte CLI-Blöcke (mehrere Prompts, mehrzeilige Konfiguration, show-Ausgabe)
 * erscheinen in Monospace mit Zeilenumbrüchen; der Options-Button bekommt `overflow-x-auto` (`cliButtonClass`), eine breite
 * Zeile scrollt also innerhalb der Option und nicht die Seite. Der Button ist fokussierbar, damit der Bereich per Tastatur
 * erreichbar bleibt (ein scrollbarer Bereich in einem Button wäre sonst nicht per Tastatur erreichbar).
 * Alle anderen Optionen (Einzelbefehle, normale Antworttexte) werden genau wie vorher gerendert.
 */
export function CliOptionText({ text, className, cliClassName }: CliOptionTextProps) {
  const lines = splitCliOption(text);
  if (!lines) return <span className={className}>{text}</span>;
  return (
    <span className={`min-w-0 max-w-full ${cliClassName ?? ""}`.trim()}>
      <span data-cli-option="" className="block whitespace-pre font-mono text-xs leading-relaxed">
        {lines.join("\n")}
      </span>
    </span>
  );
}

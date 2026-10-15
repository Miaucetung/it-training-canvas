import type { CLIExhibit as CLIExhibitData } from "@/types/exhibit";

// Zeilenweises Syntax-Highlighting für IOS-CLI-/show-Output.
function lineClass(line: string, highlight: string[] | undefined, revealed: boolean): string {
  const base = "block whitespace-pre";
  const hot = revealed && highlight?.includes(line) ? " bg-green-900/40 rounded px-1 -mx-1" : "";
  const trimmed = line.trimStart();

  let color = "text-gray-200";
  if (/^Router\(config|^Switch\(config|^Router#|^Switch#|^Router>|^Switch>/.test(trimmed)) {
    color = "text-gray-400";
  } else if (/^C[\s\t]/.test(line)) {
    color = "text-green-400";
  } else if (/^O[\s\t]/.test(line)) {
    color = "text-blue-400";
  } else if (/^B\*?[\s\t]/.test(line)) {
    color = "text-yellow-400";
  } else if (/^S\*?[\s\t]/.test(line)) {
    color = "text-red-400";
  }
  return `${base} ${color}${hot}`;
}

export function CLIExhibit({ exhibit, revealed = false }: { exhibit: CLIExhibitData; revealed?: boolean }) {
  const lines = exhibit.content.replace(/\r\n/g, "\n").split("\n");
  return (
    <div
      role="region"
      aria-label="CLI-Ausgabe"
      tabIndex={0}
      className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <pre className="font-mono text-sm leading-relaxed">
        {lines.map((line, i) => (
          <span key={i} className={lineClass(line, exhibit.highlight, revealed)}>
            {line === "" ? " " : line}
          </span>
        ))}
      </pre>
    </div>
  );
}

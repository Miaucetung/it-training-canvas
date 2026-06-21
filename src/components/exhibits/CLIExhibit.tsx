import type { CLIExhibit as CLIExhibitData } from "@/types/exhibit";

// Zeilenweises Syntax-Highlighting für IOS-CLI-/show-Output.
function lineClass(line: string, highlight: string[] | undefined): string {
  const base = "block whitespace-pre";
  const hot = highlight?.includes(line) ? " bg-green-900/40 rounded px-1 -mx-1" : "";
  const trimmed = line.trimStart();

  let color = "text-gray-200";
  if (/^Router\(config|^Switch\(config|^Router#|^Switch#|^Router>|^Switch>/.test(trimmed)) {
    color = "text-gray-500";
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

export function CLIExhibit({ exhibit }: { exhibit: CLIExhibitData }) {
  const lines = exhibit.content.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
      <pre className="font-mono text-sm leading-relaxed">
        {lines.map((line, i) => (
          <span key={i} className={lineClass(line, exhibit.highlight)}>
            {line === "" ? " " : line}
          </span>
        ))}
      </pre>
    </div>
  );
}

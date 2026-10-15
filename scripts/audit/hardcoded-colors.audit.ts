import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALLOWED_ALWAYS_DARK, COLOR, HEX_ARBITRARY, walkSources } from "../../src/__tests__/helpers/hardcoded-colors";

// Analyse (nur lesend): fest eingetragene Tailwind-Farbklassen für Text und Flächen außerhalb der Design-Tokens.
// Aufruf: npx vitest run -c scripts/audit/vitest.audit.config.ts scripts/audit/hardcoded-colors.audit.ts --disableConsoleIntercept
// Ausgabe: docs/a11y/HARDCODED-FARBKLASSEN.md (Datei, Zeile, Klassen) und .local/hardcoded-colors.json

const root = path.resolve("src");

interface Hit {
  line: number;
  classes: string[];
}

describe("Analyse: fest eingetragene Farbklassen", () => {
  it("schreibt die Liste", () => {
    const files: Array<{ file: string; area: string; hits: Hit[]; count: number }> = [];
    const byUtility = new Map<string, number>();
    const byHue = new Map<string, number>();
    for (const f of walkSources(root)) {
      const rel = path.relative(process.cwd(), f).replace(/\\/g, "/");
      if (rel in ALLOWED_ALWAYS_DARK) continue;
      const lines = fs.readFileSync(f, "utf8").split(/\r?\n/);
      const hits: Hit[] = [];
      let count = 0;
      lines.forEach((text, i) => {
        const classes: string[] = [];
        for (const m of text.matchAll(COLOR)) {
          classes.push(m[0]);
          byUtility.set(m[2], (byUtility.get(m[2]) ?? 0) + 1);
          const hue = m[3].includes("-") ? m[3].split("-")[0] : m[3];
          byHue.set(hue, (byHue.get(hue) ?? 0) + 1);
        }
        for (const m of text.matchAll(HEX_ARBITRARY)) {
          classes.push(m[0]);
          byUtility.set(`${m[2]} (Hex)`, (byUtility.get(`${m[2]} (Hex)`) ?? 0) + 1);
        }
        if (classes.length) {
          hits.push({ line: i + 1, classes });
          count += classes.length;
        }
      });
      if (count > 0) {
        const area = rel.startsWith("src/components/canvas-v2/") || rel.startsWith("src/lib/topology/") ? "Canvas (nur auflisten)" : "übrige App";
        files.push({ file: rel, area, hits, count });
      }
    }
    files.sort((a, b) => b.count - a.count);
    const total = files.reduce((a, f) => a + f.count, 0);
    const canvas = files.filter((f) => f.area.startsWith("Canvas"));
    const rest = files.filter((f) => !f.area.startsWith("Canvas"));

    const md: string[] = [];
    md.push("# Fest eingetragene Tailwind-Farbklassen (Text und Flächen)", "");
    md.push("Erzeugt von `scripts/audit/hardcoded-colors.audit.ts` (nur lesend). Es wurde nichts ersetzt.", "");
    md.push("## Erfassung", "");
    md.push("- Gesucht werden Klassen `text-*`, `bg-*`, `from-*`, `via-*`, `to-*` mit Farbpalette und Stufe (`text-zinc-500`, `bg-sky-500/10`, `dark:text-gray-300`, `hover:bg-purple-600` …) sowie `text-white`, `bg-black` usw. und beliebige Hex-Werte (`bg-[#0f172a]`). Varianten (`dark:`, `hover:`, `md:` …) zählen mit.");
    md.push("- Nicht gesucht werden Token-Klassen (`text-muted-foreground`, `bg-card`, `text-accent-primary-fg`, `bg-status-*` …) und `border-*`/`ring-*`/`fill-*`/`stroke-*`.");
    md.push("- Ausgenommen sind die in `ALLOWED_ALWAYS_DARK` benannten, bewusst immer dunklen Dateien (Lab-Dialog, CLI-Exhibit, Terminal-Emulator). Die Sperrklinke (`src/__tests__/build/hardcoded-colors-ratchet.test.ts`) hält je Datei die Obergrenze aus `src/__tests__/fixtures/hardcoded-colors-baseline.json`.");
    md.push("- Durchsucht werden alle `.tsx`/`.ts`/`.css` unter `src/` außer `__tests__`. Ein Treffer ist keine Fehlerliste: manche Stellen sind gewollt (Terminal-Blöcke bewusst dunkel, Statusfarben wie `text-green-500`); entschieden wird danach.", "");
    md.push("## Zusammenfassung", "");
    md.push(`${total} Klassen in ${files.length} Dateien; davon Canvas-Code (\`src/components/canvas-v2/\`, \`src/lib/topology/\`): ${canvas.reduce((a, f) => a + f.count, 0)} in ${canvas.length} Dateien (nur aufgelistet, Gemini arbeitet dort), übrige App: ${rest.reduce((a, f) => a + f.count, 0)} in ${rest.length} Dateien.`, "");
    md.push("| Präfix | Treffer |", "|---|---:|");
    for (const [k, v] of [...byUtility.entries()].sort((a, b) => b[1] - a[1])) md.push(`| ${k.includes("Hex") ? `\`${k.split(" ")[0]}-[#…]\`` : `\`${k}-*\``} | ${v} |`);
    md.push("", "| Farbfamilie | Treffer |", "|---|---:|");
    for (const [k, v] of [...byHue.entries()].sort((a, b) => b[1] - a[1])) md.push(`| ${k} | ${v} |`);
    md.push("");
    const section = (title: string, list: typeof files) => {
      md.push(`## ${title}`, "");
      md.push("| Datei | Treffer |", "|---|---:|");
      for (const f of list) md.push(`| ${f.file} | ${f.count} |`);
      md.push("");
    };
    section("Übersicht: übrige App (nach Trefferzahl)", rest);
    section("Übersicht: Canvas-Code (nur aufgelistet)", canvas);
    md.push("## Einzelne Stellen (Datei, Zeile, Klassen)", "");
    for (const f of [...rest, ...canvas]) {
      md.push(`### ${f.file}${f.area.startsWith("Canvas") ? " (Canvas, nur aufgelistet)" : ""}`, "");
      for (const h of f.hits) md.push(`- ${h.line}: ${[...new Set(h.classes)].map((c) => `\`${c}\``).join(" ")}`);
      md.push("");
    }
    fs.mkdirSync(path.resolve("docs/a11y"), { recursive: true });
    fs.writeFileSync(path.resolve("docs/a11y/HARDCODED-FARBKLASSEN.md"), md.join("\n"), "utf8");
    fs.mkdirSync(path.resolve(".local"), { recursive: true });
    fs.writeFileSync(path.resolve(".local/hardcoded-colors.json"), JSON.stringify(files, null, 1), "utf8");
    console.log(`Klassen: ${total}, Dateien: ${files.length}, Canvas: ${canvas.length} Dateien`);
  });
});

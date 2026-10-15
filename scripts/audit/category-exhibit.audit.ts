import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ccnaQuestions } from "../../src/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "../../src/data/ccnaQuestionsClassified";
import { categorizeQuestion, getExhibitList } from "../../src/lib/ccna-question-pool";
import type { ExhibitData } from "../../src/types/exhibit";

// Analyse (nur lesend): Wie viele Fragen wechseln die abgeleitete Kategorie, wenn der Text von CLI-Exhibits einfließt?
// Aufruf: npx vitest run -c scripts/audit/vitest.audit.config.ts scripts/audit/category-exhibit.audit.ts --disableConsoleIntercept
// Ausgabe: docs/fragen-darstellung/ANALYSE-KATEGORIE-AUS-EXHIBIT.md

const FALLBACK = "Grundlagen & Sonstige";
const cliText = (exhibit: unknown): string =>
  getExhibitList(exhibit as never)
    .filter((e: ExhibitData) => e.type === "cli")
    .map((e) => (e as { content: string }).content)
    .join("\n");

interface Change {
  id: string;
  before: string;
  after: string;
  cliOnly: string;
  group: "Rückfall → Kategorie" | "Kategorie → andere Kategorie";
}

describe("Analyse: Kategorie mit CLI-Exhibit-Text", () => {
  it("schreibt den Bericht", () => {
    const rows: Record<string, { total: number; withCli: number; changes: Change[] }> = {};
    for (const [name, list] of [
      ["ccnaQuestions", ccnaQuestions],
      ["ccnaQuestionsClassified", ccnaQuestionsClassified],
    ] as const) {
      const r = { total: list.length, withCli: 0, changes: [] as Change[] };
      for (const q of list) {
        const cli = cliText(q.exhibit);
        if (!cli) continue;
        r.withCli++;
        const before = categorizeQuestion(q.question);
        const after = categorizeQuestion(`${q.question} ${cli}`);
        if (before !== after) {
          r.changes.push({ id: q.id, before, after, cliOnly: categorizeQuestion(cli), group: before === FALLBACK ? "Rückfall → Kategorie" : "Kategorie → andere Kategorie" });
        }
      }
      rows[name] = r;
    }

    const exam = rows.ccnaQuestions;
    const fb = exam.changes.filter((c) => c.group === "Rückfall → Kategorie");
    const between = exam.changes.filter((c) => c.group !== "Rückfall → Kategorie");
    const pairs = new Map<string, number>();
    for (const c of exam.changes) pairs.set(`${c.before} → ${c.after}`, (pairs.get(`${c.before} → ${c.after}`) ?? 0) + 1);

    const md: string[] = [];
    md.push("# Analyse: Kategorie-Ableitung mit dem Text von CLI-Exhibits", "");
    md.push("Erzeugt von `scripts/audit/category-exhibit.audit.ts` (nur lesend). Es wurde nichts geändert.", "");
    md.push("## Fragestellung", "");
    md.push("`categorizeQuestion` (`src/lib/ccna-question-pool.ts`) leitet die Kategorie nur aus dem Fragetext ab; sie wird für den Kategorie-Filter im Prüfungstrainer und für die Domain-Analyse im Quiz verwendet. Seit dem Umzug der CLI-Ausgabe von q0829 ins Exhibit fehlt deren Text bei der Ableitung (q0829 wechselte von „Geräte & Medien“ zu „Grundlagen & Sonstige“). Geprüft wurde, was passiert, wenn der Text von CLI-Exhibits mit einfließt.", "");
    md.push("## Ergebnis", "");
    md.push("| Pool | Fragen | davon mit CLI-Exhibit | Kategorie wechselt |", "|---|---:|---:|---:|");
    for (const [name, r] of Object.entries(rows)) md.push(`| ${name} | ${r.total} | ${r.withCli} | ${r.changes.length} |`);
    md.push("", `**Es ändert sich nicht nur q0829:** im Prüfungspool wechseln ${exam.changes.length} von ${exam.withCli} Fragen mit CLI-Exhibit die Kategorie (im klassifizierten Pool gleich viele). Deshalb wurde nichts umgesetzt.`, "");
    md.push(`- **Rückfall → Kategorie** (Frage fällt heute in „${FALLBACK}“, mit CLI-Text bekäme sie eine Fachkategorie): ${fb.length} Fragen.`);
    md.push(`- **Kategorie → andere Kategorie** (heute schon einer Fachkategorie zugeordnet, die CLI-Wörter verschieben sie): ${between.length} Fragen.`, "");
    md.push("| Wechsel | Fragen |", "|---|---:|");
    for (const [k, v] of [...pairs.entries()].sort((a, b) => b[1] - a[1])) md.push(`| ${k} | ${v} |`);
    md.push("");
    md.push("## Einschätzung", "");
    md.push("- Der Fall q0829 gehört zur ersten Gruppe („Grundlagen & Sonstige“ → „Geräte & Medien“) und stellt den Zustand vor dem Umzug wieder her.");
    md.push("- Die erste Gruppe ist überwiegend plausibel (Frage „Refer to the exhibit …“ ohne Fachwort im Text, die CLI-Ausgabe nennt VLANs, Routen usw.), aber nicht durchgehend: q0103 (`ipconfig /all` eines Windows-PCs) würde wegen der Zeile „Wireless LAN adapter“ nach „Wireless“ wandern.");
    md.push("- Die zweite Gruppe ist heikel: die Schlüsselwörter der Kategorie-Regeln stehen auch in beliebigen CLI-Texten (Subnetzmasken `255.255…` und Port-Namen wie `fe1/34` treffen die Regel „IPv4 & Subnetting“, `password`/`nat` die Regel „Security“, `static`/`metric`/`route` die Regel „Routing“), und die Reihenfolge der Regeln entscheidet. Dort verschiebt der CLI-Text Fragen, deren Thema der Fragetext richtig trifft: die JSON-Schema-Fragen q1062–q1066, q1082, q1084, q1085 („Architektur & Automation“) würden wegen Port-Namen wie `fe1/34` nach „IPv4“ bzw. wegen `firewall` nach „Security“ wandern; q0590 (NAT-Konfiguration) würde wegen des Wortes `static` nach „Routing“ wandern.");
    md.push("");
    md.push("## Entscheidungsvorlage", "");
    md.push("1. **Nichts ändern** (Stand jetzt): nur q0829 hat die Kategorie gewechselt.");
    md.push(`2. **Nur Rückfallfälle** (${fb.length} Fragen): der CLI-Text wird nur herangezogen, wenn der Fragetext allein in „${FALLBACK}“ fällt. Eine Frage, die schon eine Fachkategorie hat, bleibt unverändert.`);
    md.push("3. **Alle** (" + exam.changes.length + " Fragen): der CLI-Text fließt immer ein; größte Änderung, die zweite Gruppe wird verschoben.");
    md.push("4. **Nur q0829** zurücksetzen: dafür bräuchte es ein ausdrückliches Kategorie-Feld an der Frage (Datenänderung, Snapshot-Feld `meta`) und ist nur für den einen Fall sinnvoll.", "");
    md.push("## Liste der Wechsel (Prüfungspool; der klassifizierte Pool hat dieselben Wechsel mit den Großbuchstaben-IDs)", "");
    md.push("| Frage | jetzt (nur Fragetext) | mit CLI-Text | Kategorie nur aus dem CLI-Text | Gruppe |", "|---|---|---|---|---|");
    for (const c of exam.changes) md.push(`| ${c.id} | ${c.before} | ${c.after} | ${c.cliOnly} | ${c.group} |`);
    md.push("");
    fs.writeFileSync(path.resolve("docs/fragen-darstellung/ANALYSE-KATEGORIE-AUS-EXHIBIT.md"), md.join("\n"), "utf8");
    console.log(`Wechsel: ${exam.changes.length} (Rückfall ${fb.length}, zwischen Kategorien ${between.length}); klassifiziert ${rows.ccnaQuestionsClassified.changes.length}`);
  });
});

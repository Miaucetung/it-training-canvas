import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ccnaQuestions } from "../../src/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "../../src/data/ccnaQuestionsClassified";
import { classifyOption, type OptionCliKind } from "../../src/__tests__/helpers/option-cli";

// Analyse (nur lesend): CLI-Inhalte in den Antwortoptionen, die als Fließtext erscheinen.
// Aufruf: npx vitest run -c scripts/audit/vitest.audit.config.ts scripts/audit/option-cli-analysis.audit.ts --disableConsoleIntercept
// Ausgabe: docs/fragen-darstellung/ANALYSE-CLI-IN-OPTIONEN.md und .local/option-cli-findings.json

const KINDS: OptionCliKind[] = ["mehrzeilig mit Prompts", "Konfiguration ohne Prompt", "show-Ausgabe", "Zeilenumbruch bereits im Text", "Einzelbefehl", "kein CLI"];
const BLOCKS: OptionCliKind[] = ["mehrzeilig mit Prompts", "Konfiguration ohne Prompt", "show-Ausgabe", "Zeilenumbruch bereits im Text"];
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/`/g, "'");
const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

interface PoolStat {
  name: string;
  options: number;
  byKind: Record<string, number>;
  questionsByKind: Record<string, Set<string>>;
  idsByKind: Record<string, Map<string, number[]>>;
  examples: Record<string, Array<{ id: string; index: number; text: string }>>;
  longest: number;
}

function stat(name: string, list: Array<{ id: string; options: string[] }>): PoolStat {
  const s: PoolStat = { name, options: 0, byKind: {}, questionsByKind: {}, idsByKind: {}, examples: {}, longest: 0 };
  for (const q of list) {
    q.options.forEach((o, i) => {
      s.options++;
      const k = classifyOption(o).kind;
      s.byKind[k] = (s.byKind[k] ?? 0) + 1;
      (s.questionsByKind[k] ??= new Set()).add(q.id);
      const m = (s.idsByKind[k] ??= new Map());
      m.set(q.id, [...(m.get(q.id) ?? []), i]);
      if (BLOCKS.includes(k)) {
        (s.examples[k] ??= []).push({ id: q.id, index: i, text: o });
        s.longest = Math.max(s.longest, o.length);
      }
    });
  }
  return s;
}

describe("Analyse: CLI-Inhalte in Antwortoptionen", () => {
  it("schreibt den Bericht", () => {
    const exam = stat("ccnaQuestions", ccnaQuestions);
    const cls = stat("ccnaQuestionsClassified", ccnaQuestionsClassified);
    const letter = (i: number) => String.fromCharCode(65 + i);
    const md: string[] = [];
    md.push("# Analyse: CLI-Inhalte in den Antwortoptionen", "");
    md.push("Erzeugt von `scripts/audit/option-cli-analysis.audit.ts` (nur lesend, Erkennung in `src/__tests__/helpers/option-cli.ts`). Es wurde nichts geändert.", "");
    md.push("## Erkennung", "");
    md.push("Jede Option wird einzeln eingeordnet (Reihenfolge der Prüfung):", "");
    md.push("1. **Zeilenumbruch bereits im Text:** die Option enthält schon `\\n`.");
    md.push("2. **show-Ausgabe:** typische Ausgabemerkmale (`line protocol is`, `Hardware is`, `Gateway of last resort`, `Codes:`, `[AD/Metrik] via`, MAC-/Nachbar-Tabellenköpfe).");
    md.push("3. **mehrzeilig mit Prompts:** mindestens zwei Prompts (`Router(config)#`, `R15(config-line)#`, `R7#`) in einer Option.");
    md.push("4. **Konfiguration ohne Prompt:** mindestens drei verschiedene IOS-Konfigurationsbefehle (`interface`, `ip address`, `switchport`, `network` …) in einer Option.");
    md.push("5. **Einzelbefehl:** genau ein Prompt oder ein Befehl, z. B. `no shutdown`; das ist normale Kurzantwort und kein Problem.");
    md.push("6. **kein CLI:** übrige Optionen (Fließtext-Antworten).", "");

    md.push("## Zahlen", "");
    md.push("| Einordnung | Optionen (Prüfungspool) | Fragen (Prüfungspool) | Optionen (klassifiziert) | Fragen (klassifiziert) |", "|---|---:|---:|---:|---:|");
    for (const k of KINDS) {
      md.push(`| ${k} | ${exam.byKind[k] ?? 0} | ${exam.questionsByKind[k]?.size ?? 0} | ${cls.byKind[k] ?? 0} | ${cls.questionsByKind[k]?.size ?? 0} |`);
    }
    md.push(`| **alle Optionen** | ${exam.options} | ${ccnaQuestions.length} | ${cls.options} | ${ccnaQuestionsClassified.length} |`, "");
    const blockOptsExam = BLOCKS.reduce((a, k) => a + (exam.byKind[k] ?? 0), 0);
    const blockQsExam = new Set(BLOCKS.flatMap((k) => [...(exam.questionsByKind[k] ?? [])])).size;
    md.push(`**Mehrzeilige Konfigurationen oder Ausgaben in Optionen, die als Fließtext erscheinen (ohne Einzelbefehle): ${blockOptsExam} Optionen in ${blockQsExam} Fragen** (Prüfungspool; der klassifizierte Pool hat dieselben Optionen mit Abweichungen in wenigen Fragen). Die längste Option hat ${exam.longest} Zeichen.`, "");
    md.push("Beide Pools speichern die Optionen als **einzeilige Texte**; nur 4 Optionen in 1 Frage tragen Zeilenumbrüche. Die Zeilen sind in den Daten also nicht erhalten, aber an den Prompts bzw. Befehlsanfängen erkennbar.", "");

    md.push("## Betroffene Fragen", "");
    for (const k of BLOCKS) {
      const ids = exam.idsByKind[k];
      if (!ids || ids.size === 0) continue;
      md.push(`### ${k}: ${exam.byKind[k]} Optionen in ${ids.size} Fragen`, "");
      md.push([...ids.entries()].map(([id, idx]) => `${id} (${idx.map(letter).join("")})`).join(", "), "");
      const onlyCls = [...(cls.idsByKind[k]?.keys() ?? [])].filter((id) => !ids.has(id.toLowerCase())).slice(0, 40);
      if (onlyCls.length > 0) md.push(`Zusätzlich im klassifizierten Pool eingeordnet: ${onlyCls.join(", ")}.`, "");
    }

    md.push("## Beispiele (Wortlaut unverändert)", "");
    md.push("| Frage | Option | Einordnung | Text |", "|---|---|---|---|");
    for (const k of BLOCKS) {
      for (const ex of (exam.examples[k] ?? []).slice(0, 3)) md.push(`| ${ex.id} | ${letter(ex.index)} | ${k} | ${cell(cut(ex.text, 190))} |`);
    }
    md.push("");

    md.push("## Darstellungsvorschlag ohne Inhaltsänderung", "");
    md.push("**Grundsatz:** Die Daten bleiben unverändert (eine Option = ein String, Reihenfolge, Index und Lösung bleiben). Nur die Anzeige ändert sich; der Snapshot-Test bleibt ohne Aktualisierung grün.", "");
    md.push("1. **Reine Anzeigefunktion** `splitCliOption(text): string[]`: zerlegt eine als CLI erkannte Option in Zeilen und ändert dabei kein Zeichen, es entfallen nur die Leerzeichen an den Schnittstellen.");
    md.push("   - *mehrzeilig mit Prompts:* neue Zeile vor jedem Prompt (`Name(config…)#`, `R7#`). Der Trenner „ - “ vor einem Prompt (Aufzählungszeichen aus dem PDF) bleibt als letztes Zeichen der vorherigen Zeile stehen.");
    md.push("   - *Konfiguration ohne Prompt:* neue Zeile vor den Befehlsanfängen aus einer festen Liste (`interface`, `description`, `ip address`, `no shutdown`, `switchport …`, `encapsulation`, `network`, `router …`, `access-list` …). Bei Mehrdeutigkeit (ein Befehlswort im Fließtext) wird nicht getrennt.");
    md.push("   - *show-Ausgabe:* wie im Fragetext die IOS-Zeilenanfänge (`show interfaces`) bzw. Spaltenköpfe.");
    md.push("2. **Rendering:** erkannte Optionen erscheinen im Antwortfeld in Monospace (`font-mono text-xs`, `whitespace-pre-wrap`, dunkel/hell wie die CLI-Exhibits), mit dem Buchstaben links. Einzelbefehle und Fließtext bleiben wie bisher. Gilt in Prüfungstrainer, priorisiertem Lernen und Quiz.");
    md.push("3. **Nachweis:** Test über alle erkannten Optionen beider Pools: die zusammengesetzten Zeilen ergeben ohne Leerraum-Unterschiede genau den Originaltext; der Inhalts-Snapshot bleibt unverändert; `question-rendering.mjs` prüft bei 390 px weiterhin auf abgeschnittene Texte und horizontales Scrollen (`pre-wrap` verhindert beides).");
    md.push("4. **Grenzen:** Die Zerlegung ist eine Heuristik für die Anzeige, kein Parser. Wo sie unsicher ist, bleibt der Fließtext. Tippfehler im Original (`name-serveer`, `contig`, `015`) bleiben sichtbar und unkorrigiert.");
    md.push("5. **Alternative (nicht empfohlen):** Zeilenumbrüche in die Datenstrings schreiben. Das ändert den Snapshot für ca. " + `${blockOptsExam}` + " Optionen, braucht dieselbe Heuristik und lässt sich nicht rückgängig machen, ohne die Daten erneut zu ändern.", "");
    md.push("Aufwand grob: eine Funktion mit Tests (rund 150 Zeilen), eine Komponente für die Optionsanzeige in den drei Dialogen und ein Lauf von `question-rendering.mjs`.", "");

    fs.mkdirSync(path.resolve(".local"), { recursive: true });
    fs.writeFileSync(path.resolve("docs/fragen-darstellung/ANALYSE-CLI-IN-OPTIONEN.md"), md.join("\n") + "\n", "utf8");
    fs.writeFileSync(
      path.resolve(".local/option-cli-findings.json"),
      JSON.stringify({ exam: { byKind: exam.byKind, ids: Object.fromEntries(BLOCKS.map((k) => [k, [...(exam.idsByKind[k]?.keys() ?? [])]])) }, classified: { byKind: cls.byKind } }, null, 1),
      "utf8"
    );
    console.log(`Blockoptionen Prüfungspool: ${blockOptsExam} in ${blockQsExam} Fragen`);
  });
});

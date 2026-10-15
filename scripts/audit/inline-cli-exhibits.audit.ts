import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ccnaQuestions } from "../../src/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "../../src/data/ccnaQuestionsClassified";
import { detectInlineCli, detectValueList, exhibitState, normalizeWhitespace, type InlineCliDetection } from "../../src/__tests__/helpers/inline-cli";

// Analyse (nur lesend): findet Fragen, deren Fragetext CLI-Ausgaben enthält statt eines CLI-Exhibits.
// Aufruf: npx vitest run -c scripts/audit/vitest.audit.config.ts scripts/audit/inline-cli-exhibits.audit.ts --disableConsoleIntercept
// Ausgabe: .local/inline-cli-findings.json und docs/fragen-darstellung/INLINE-CLI-ANALYSE.md

interface PoolHit {
  pool: "ccnaQuestions" | "ccnaQuestionsClassified";
  id: string;
  det: InlineCliDetection;
  state: string;
  textLength: number;
  lineBreaksInText: number;
}

const cut = (s: string, n: number, fromEnd = false) => {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return fromEnd ? `…${t.slice(-n)}` : `${t.slice(0, n)}…`;
};
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/`/g, "'");

describe("Analyse: CLI-Ausgaben im Fragetext", () => {
  it("schreibt Fundliste und Bericht", () => {
    const hits: PoolHit[] = [];
    for (const [pool, list] of [
      ["ccnaQuestions", ccnaQuestions],
      ["ccnaQuestionsClassified", ccnaQuestionsClassified],
    ] as const) {
      for (const q of list) {
        const det = detectInlineCli(q.question) ?? (pool === "ccnaQuestionsClassified" ? detectValueList(q.question) : null);
        if (!det) continue;
        hits.push({ pool, id: q.id, det, state: exhibitState(q.exhibit, det.cli), textLength: q.question.length, lineBreaksInText: (q.question.match(/\n/g) ?? []).length });
      }
    }

    // je Frage (ID ohne Groß-/Kleinschreibung) beide Pools zusammenführen
    const byId = new Map<string, PoolHit[]>();
    for (const h of hits) byId.set(h.id.toLowerCase(), [...(byId.get(h.id.toLowerCase()) ?? []), h]);
    const exam = new Map(ccnaQuestions.map((q) => [q.id.toLowerCase(), q.question]));
    const cls = new Map(ccnaQuestionsClassified.map((q) => [q.id.toLowerCase(), q.question]));

    const rows = [...byId.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, hs]) => {
      const ref = hs[0];
      const sameText = exam.has(id) && cls.has(id) ? normalizeWhitespace(exam.get(id)!) === normalizeWhitespace(cls.get(id)!) : null;
      const lines = cls.get(id)?.split("\n").length ?? 0;
      return { id, hs, ref, sameText, lines };
    });

    fs.mkdirSync(path.resolve(".local"), { recursive: true });
    fs.writeFileSync(
      path.resolve(".local/inline-cli-findings.json"),
      JSON.stringify(rows.map((r) => ({ id: r.id, pools: r.hs.map((h) => ({ pool: h.pool, id: h.id, kind: h.det.kind, isBlock: h.det.isBlock, state: h.state, markers: h.det.markers })), head: r.ref.det.head, cli: r.ref.det.cli, tail: r.ref.det.tail })), null, 2),
      "utf8"
    );

    const blocks = rows.filter((r) => r.ref.det.isBlock);
    const others = rows.filter((r) => !r.ref.det.isBlock);
    const md: string[] = [];
    md.push("# Analyse: CLI-Ausgaben im Fragetext statt im Exhibit", "");
    md.push("Erzeugt von `scripts/audit/inline-cli-exhibits.audit.ts` (nur lesend, Erkennung in `src/__tests__/helpers/inline-cli.ts`). Es wurde nichts geändert.", "");
    md.push("## Vorgehen der Erkennung", "");
    md.push("- Geprüft werden alle Fragetexte in `ccnaQuestions` (1081) und `ccnaQuestionsClassified` (1055).");
    md.push("- **show-Ausgabe:** Interface-Statuszeile (`… is up, line protocol is …`), `Codes:`-Kopf einer Routing-Tabelle, `Gateway of last resort`, MAC-/Nachbar-/Interface-Tabellenköpfe oder Routenzeilen mit `[AD/Metrik] via`, zusammen mit weiteren typischen Zeilen (`Hardware is`, `MTU … bytes`, `packets input` …).");
    md.push("- **Konfigurationszeilen:** mindestens vier verschiedene IOS-Konfigurationsbefehle (`hostname`, `ip domain name`, `line vty`, `transport input`, `login local` …) im Text.");
    md.push("- **Prompt-Befehl im Satz:** Einzelbefehl mit Prompt (`City(config-router)# network …`) mitten im Satz; kein Block.");
    md.push("- **Wertliste aus der Grafik:** vier und mehr Zeilen mit MAC-Adressen, BIDs oder Prioritäten; nur über die Zeilenstruktur des klassifizierten Pools erkennbar.");
    md.push("- Beide Pools enthalten dieselben Fragetexte; der klassifizierte Pool hat noch die Zeilenumbrüche aus dem PDF, der Prüfungspool nicht (Abschnitt „Zeilenumbrüche“).", "");
    md.push(`## Ergebnis: ${blocks.length} Fragen mit CLI-Block im Fragetext, ${others.length} Randfälle`, "");
    md.push("### Zu verschieben (CLI-Block im Text)", "");
    md.push("| Frage-ID | Art | Exhibit heute | Vorschlag Trennung | Zeilen |", "|---|---|---|---|---|");
    for (const r of blocks) {
      const d = r.ref.det;
      const states = [...new Set(r.hs.map((h) => h.state))].join(" / ");
      md.push(`| ${r.hs.map((h) => h.id).join(" / ")} | ${d.kind} | ${states} | Text davor: „${cell(cut(d.head, 60, true))}“ → CLI-Block ab „${cell(cut(d.cli, 50))}“ (${normalizeWhitespace(d.cli).length} Zeichen) → Text danach: „${cell(cut(d.tail, 60))}“ | ${r.lines > 1 ? `${r.lines} Zeilen im klassifizierten Pool` : "keine Umbrüche"} |`);
    }
    md.push("", "### Randfälle (kein eigener CLI-Block; Entscheidung nötig)", "");
    md.push("| Frage-ID | Art | Exhibit heute | Fundstelle |", "|---|---|---|---|");
    for (const r of others) {
      const d = r.ref.det;
      md.push(`| ${r.hs.map((h) => h.id).join(" / ")} | ${d.kind} | ${[...new Set(r.hs.map((h) => h.state))].join(" / ")} | ${cell(cut(d.markers.join(" · "), 110))} |`);
    }
    md.push("", "## Zeilenumbrüche", "");
    const both = [...exam.keys()].filter((k) => cls.has(k));
    const equal = both.filter((k) => normalizeWhitespace(exam.get(k)!) === normalizeWhitespace(cls.get(k)!)).length;
    md.push(`- ${both.length} Fragen haben in beiden Pools einen Text; bei ${equal} ist der Text bis auf Leerraum identisch. Der klassifizierte Pool trägt die ursprünglichen Zeilenumbrüche aus dem PDF, der Prüfungspool hat alles in einer Zeile.`);
    md.push("- Für die Umsetzung sind die Umbrüche der gefundenen Fragen daher **nicht zu raten**: sie lassen sich für beide Pools aus dem klassifizierten Pool übernehmen und mit den typischen IOS-Zeilenanfängen gegenprüfen (Interface-Statuszeile, `Hardware is`, `MTU`, `reliability`, `Encapsulation`, `Keepalive`, `Auto-duplex`, `ARP type`, `Last input`, `Last clearing`, `Queueing`, `Output queue`, `5 minute`, Zähler mit führender Zahl …). Nur wo der klassifizierte Pool keinen passenden Text hat, bleibt die Heuristik.");
    md.push("", "## Anmerkungen", "");
    md.push("- Die Beispiel-ID `q0042` aus dem Auftrag enthält keine CLI-Ausgabe (TCP/UDP-Frage). Gemeint ist vermutlich `q0829` (FastEthernet0/13).");
    md.push("- Nicht untersucht werden CLI-Ausgaben in den Antwortoptionen (z. B. Konfigurationsvarianten als Optionen); das ist eine andere Darstellung und bräuchte eine eigene Entscheidung.");
    md.push("- Einzelne Befehle, die im Satz genannt werden (`show ip route`, `ip route 172.16.3.0 …`), sind Fließtext und keine CLI-Ausgabe; sie gelten nicht als Fund.");
    md.push("- Die Erkennung ist bewusst konservativ; ein Treffer ist ein Vorschlag, keine automatische Änderung.");
    fs.writeFileSync(path.resolve("docs/fragen-darstellung/INLINE-CLI-ANALYSE.md"), md.join("\n") + "\n", "utf8");
    console.log(`Blöcke: ${blocks.length}, Randfälle: ${others.length}`);
    for (const r of rows) console.log(`${r.id} ${r.ref.det.kind} block=${r.ref.det.isBlock} pools=${r.hs.length} state=${r.ref.state}`);
  });
});

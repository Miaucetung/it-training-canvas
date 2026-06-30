// ============================================================
// didactic-blocks — Tokenizer für Lerninhalte (Concept.content)
// ----------------------------------------------------------
// Zerlegt einen Markdown-String in eine Sequenz aus:
//   - "markdown"  : normaler Markdown-Abschnitt
//   - "slide"     : :::slide:<slug>:::   (interaktive Auffrischungs-Slide)
//   - "callout"   : :::<variant> [Titel] … :::   (didaktische Lernkarte)
//
// Die Callout-Taxonomie ist lernwissenschaftlich motiviert (Signaling,
// Concrete-before-Abstract, Retrieval). Eine einzige Quelle (der
// content-String) speist sowohl die App-Ansicht (TopicDetailPanel) als
// auch den PDF/MD-Export (lesson-exporter) — beide nutzen diesen Parser.
// ============================================================

export type DidacticVariant =
  | "kernidee" // 🎯 Mental Model / das große „Warum" zuerst
  | "analogie" // 🔁 vertraute Analogie (concrete-before-abstract)
  | "merke" //    🔑 Merksatz / Key-Takeaway (Signaling)
  | "falle" //    ⚠️ Prüfungsfalle / Misconception
  | "check" //    🧠 Selbst-Check (Retrieval, einklappbare Lösung)
  | "tipp"; //    💡 Praxistipp

export const DIDACTIC_VARIANTS: readonly DidacticVariant[] = [
  "kernidee",
  "analogie",
  "merke",
  "falle",
  "check",
  "tipp",
];

export interface MarkdownToken {
  kind: "markdown";
  text: string;
}
export interface SlideToken {
  kind: "slide";
  slug: string;
}
export interface CalloutToken {
  kind: "callout";
  variant: DidacticVariant;
  /** Optionaler Titel hinter dem Open-Tag (z. B. die Frage beim Selbst-Check). */
  title?: string;
  body: string;
}
export type ContentToken = MarkdownToken | SlideToken | CalloutToken;

const SLIDE_RE = /^:::slide:([a-z0-9-]+):::[ \t]*$/;
const OPEN_RE = new RegExp(
  `^:::(${DIDACTIC_VARIANTS.join("|")})(?:[ \\t]+(.*?))?[ \\t]*$`,
);
const CLOSE_RE = /^:::[ \t]*$/;

/**
 * Zerlegt Concept-Content in Tokens. Reine Funktion, vollständig testbar.
 * Robust gegen nicht geschlossene Callouts (Rest wird als Body übernommen).
 */
export function parseDidacticContent(md: string): ContentToken[] {
  const tokens: ContentToken[] = [];
  const lines = md.split("\n");

  let mdBuf: string[] = [];
  let inCallout = false;
  let variant: DidacticVariant = "merke";
  let title: string | undefined;
  let bodyBuf: string[] = [];

  const flushMd = () => {
    if (mdBuf.length === 0) return;
    const text = mdBuf.join("\n");
    if (text.trim()) tokens.push({ kind: "markdown", text });
    mdBuf = [];
  };
  const flushCallout = () => {
    tokens.push({
      kind: "callout",
      variant,
      title: title?.trim() || undefined,
      body: bodyBuf.join("\n").trim(),
    });
    bodyBuf = [];
    title = undefined;
    inCallout = false;
  };

  for (const line of lines) {
    if (inCallout) {
      if (CLOSE_RE.test(line)) {
        flushCallout();
      } else {
        bodyBuf.push(line);
      }
      continue;
    }

    const slide = SLIDE_RE.exec(line);
    if (slide) {
      flushMd();
      tokens.push({ kind: "slide", slug: slide[1] });
      continue;
    }

    const open = OPEN_RE.exec(line);
    if (open) {
      flushMd();
      inCallout = true;
      variant = open[1] as DidacticVariant;
      title = open[2];
      continue;
    }

    mdBuf.push(line);
  }

  // Nicht geschlossener Callout am Ende → trotzdem ausgeben.
  if (inCallout) flushCallout();
  flushMd();

  return tokens;
}

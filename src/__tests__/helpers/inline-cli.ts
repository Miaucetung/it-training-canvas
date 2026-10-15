import type { ExhibitData } from "@/types/exhibit";

/**
 * Erkennung von CLI-Ausgaben, die im Fragetext statt in einem Exhibit stehen.
 * Wird vom Analyse-Skript (scripts/audit/inline-cli-exhibits.audit.ts) und später von Tests verwendet.
 */

export type InlineCliKind = "show-Ausgabe" | "Konfigurationszeilen" | "Prompt-Befehl im Satz" | "Wertliste aus der Grafik";

export interface InlineCliDetection {
  kind: InlineCliKind;
  /** gefundene Merkmale (zur Nachvollziehbarkeit) */
  markers: string[];
  /** Zerlegung des Originaltexts: head + cli + tail ergibt (bis auf Leerraum) den Originaltext */
  head: string;
  cli: string;
  tail: string;
  /** true: eigener CLI-Block, der ins Exhibit gehört; false: nur Hinweis, kein Block */
  isBlock: boolean;
}

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
export const normalizeWhitespace = norm;

/** Starke Anfänge einer show-Ausgabe: gefunden wird der Beginn der ersten CLI-Zeile. */
const SHOW_STARTS: Array<{ name: string; re: RegExp }> = [
  { name: "Interface-Statuszeile (… is up, line protocol is …)", re: /\b[A-Za-z][A-Za-z-]*\d+(?:\/\d+)*(?:\.\d+)? is (?:up|down|administratively down), line protocol is/ },
  { name: "Routing-Tabelle (Codes:)", re: /\bCodes: [A-Z]{1,2} - / },
  { name: "Gateway of last resort", re: /\bGateway of last resort\b/ },
  { name: "MAC-Tabelle (Vlan Mac Address)", re: /\bVlan\s+Mac Address\s+Type\s+Ports\b/ },
  { name: "OSPF-Nachbarn (Neighbor ID Pri)", re: /\bNeighbor ID\s+Pri\b/ },
  { name: "Interface-Tabelle (IP-Address OK?)", re: /\bInterface\s+IP-Address\s+OK\?/ },
  { name: "Routen-Zeile ([AD/Metrik] via)", re: /\b[CLSODRBEM*]\*?\s+\d+\.\d+\.\d+\.\d+\/\d+\s+\[\d+\/\d+\] via / },
];

const SHOW_BODY: RegExp[] = [/\bHardware is /, /\bMTU \d+ bytes/, /\bpackets input\b/, /\bEncapsulation [A-Z]+/, /\bQueueing strategy\b/, /\binput errors\b/];

const CONFIG_KEYWORDS = [
  "hostname",
  "service password-encryption",
  "ip domain name",
  "ip domain-name",
  "ip name-server",
  "crypto key generate",
  "username",
  "line vty",
  "transport input",
  "login local",
  "enable secret",
  "interface ",
  "ip address",
  "no shutdown",
  "router ospf",
  "router eigrp",
  "switchport mode",
  "switchport access",
  "spanning-tree",
  "access-list",
  "banner motd",
  "ntp server",
  "snmp-server",
];

const QUESTION_START = /(?:Refer to the exhibit\.|(?:What|Which|Why|How|Where|When|Who|An? |The |Based on|If |In |Drag|Match)\b)/;

/** Letzter Fragesatz hinter dem CLI-Bereich (endet mit ?), sonst leer. */
function trailingQuestion(text: string, from: number): number {
  const rest = text.slice(from);
  const m = /(?:^|[.?!]\s+|\s)((?:What|Which|Why|How|Where|When|Who)\b[^?]*\?(?:\s*\([^)]*\))?\s*)$/.exec(rest);
  if (!m) return -1;
  return from + rest.length - m[1].length;
}

function configRegion(text: string): { start: number; end: number; hits: string[] } | null {
  const lower = text;
  const hits = CONFIG_KEYWORDS.filter((k) => lower.includes(k));
  if (hits.length < 4) return null;
  // Bereich: vom ersten bis zum letzten Konfigurationsschlüsselwort; danach beginnt wieder Fließtext
  const positions = hits.flatMap((k) => {
    const out: number[] = [];
    let i = lower.indexOf(k);
    while (i !== -1) {
      out.push(i);
      i = lower.indexOf(k, i + 1);
    }
    return out;
  });
  const start = Math.min(...positions);
  const lastKeyword = Math.max(...positions);
  const q = QUESTION_START.exec(text.slice(lastKeyword));
  const end = q ? lastKeyword + q.index : text.length;
  return { start, end, hits };
}

export function detectInlineCli(text: string): InlineCliDetection | null {
  // 1. show-Ausgabe
  const starts = SHOW_STARTS.map((s) => ({ s, m: s.re.exec(text) })).filter((x) => x.m);
  const bodyHits = SHOW_BODY.filter((r) => r.test(text));
  if (starts.length > 0 && (bodyHits.length >= 2 || starts.some((x) => /Codes:|Gateway|Vlan Mac|Neighbor ID|IP-Address|via/.test(x.s.name)))) {
    const first = starts.reduce((a, b) => (a.m!.index <= b.m!.index ? a : b));
    const start = first.m!.index;
    const tailAt = trailingQuestion(text, start);
    const end = tailAt === -1 ? text.length : tailAt;
    return {
      kind: "show-Ausgabe",
      markers: [...starts.map((x) => x.s.name), ...bodyHits.map((r) => r.source)],
      head: text.slice(0, start),
      cli: text.slice(start, end),
      tail: text.slice(end),
      isBlock: true,
    };
  }
  // 2. Konfigurationszeilen
  const cfg = configRegion(text);
  if (cfg) {
    return { kind: "Konfigurationszeilen", markers: cfg.hits, head: text.slice(0, cfg.start), cli: text.slice(cfg.start, cfg.end), tail: text.slice(cfg.end), isBlock: true };
  }
  // 3. Prompt-Befehl im Fließtext (Einzelzeile, kein Block)
  const prompt = /([A-Za-z][\w-]*(?:\([a-z-]+\))?#\s?[a-z].*?)(?=[.?!]\s+[A-Z]|$)/.exec(text);
  if (prompt) return { kind: "Prompt-Befehl im Satz", markers: [prompt[1].trim()], head: text.slice(0, prompt.index), cli: prompt[1], tail: text.slice(prompt.index + prompt[1].length), isBlock: false };
  return null;
}

/** Wertlisten aus der Grafik (Geräte mit MAC/BID/Priority) im Text: nur über die Zeilenstruktur des klassifizierten Pools erkennbar. */
export function detectValueList(text: string): InlineCliDetection | null {
  const lines = text.split("\n");
  const rows = lines.filter((l) => /(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}|\bBID\b|priority\s*\d+|^[A-Za-z][\w -]*\d\s*[:-]?\s*$/.test(l));
  if (lines.length < 4 || rows.length < 2) return null;
  const firstRow = lines.findIndex((l) => rows.includes(l));
  return {
    kind: "Wertliste aus der Grafik",
    markers: rows.slice(0, 2),
    head: lines.slice(0, firstRow).join("\n"),
    cli: lines.slice(firstRow).join("\n"),
    tail: "",
    isBlock: false,
  };
}

export type ExhibitState = "keins" | "CLI-Exhibit vorhanden (Inhalt gleich)" | "CLI-Exhibit vorhanden (Inhalt abweichend)" | "anderes Exhibit vorhanden" | "Exhibit-Hinweis ohne Daten (true)";

export function exhibitState(exhibit: unknown, cli: string): ExhibitState {
  if (exhibit === true) return "Exhibit-Hinweis ohne Daten (true)";
  if (!exhibit || exhibit === false) return "keins";
  const list = (Array.isArray(exhibit) ? exhibit : [exhibit]) as ExhibitData[];
  const clis = list.filter((e): e is Extract<ExhibitData, { type: "cli" }> => e.type === "cli");
  if (clis.length === 0) return "anderes Exhibit vorhanden";
  return clis.some((c) => norm(c.content) === norm(cli)) ? "CLI-Exhibit vorhanden (Inhalt gleich)" : "CLI-Exhibit vorhanden (Inhalt abweichend)";
}

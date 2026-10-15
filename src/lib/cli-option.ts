/**
 * Anzeige von Antwortoptionen, die CLI-Inhalt enthalten.
 *
 * Reine Anzeigelogik: die Option bleibt in den Daten ein einzelner String. `splitCliOption` liefert nur für
 * erkannte Fälle (mehrere Prompts, mehrzeilige Konfiguration, show-Ausgabe, schon vorhandene Umbrüche) Zeilen;
 * es entfernt oder ändert kein Zeichen (außer den Leerzeichen an den Schnittstellen). Einzelbefehle und
 * normale Antworttexte ergeben `null` und werden unverändert dargestellt.
 */

export type OptionCliKind = "Zeilenumbruch bereits im Text" | "mehrzeilig mit Prompts" | "Konfiguration ohne Prompt" | "show-Ausgabe" | "Einzelbefehl" | "kein CLI";

const PROMPT = /(?:^|\s)([A-Za-z][\w-]*)(\((?:config|config-[a-z0-9-]+)\))?#\s?(?=[A-Za-z!])/g;

/** Befehle, die für die Einordnung gezählt werden (unverändert aus der Analyse). */
const CLASSIFY_COMMANDS = [
  "hostname",
  "interface ",
  "ip address",
  "no shutdown",
  "shutdown",
  "switchport",
  "router ospf",
  "router eigrp",
  "router rip",
  "network ",
  "access-list",
  "ip access-group",
  "ip route",
  "line vty",
  "line console",
  "transport input",
  "login",
  "crypto ",
  "ip ssh",
  "ip domain",
  "enable secret",
  "spanning-tree",
  "vlan ",
  "ntp ",
  "snmp-server",
  "logging ",
  "ip dhcp",
  "ip nat",
  "standby ",
  "channel-group",
  "description ",
  "duplex",
  "speed ",
  "banner ",
  "username ",
  "ip helper-address",
  "passive-interface",
  "default-information",
  "redistribute",
  "ip ospf",
  "encapsulation",
  "service ",
  "permit ",
  "deny ",
];

const SHOW_MARKERS = [/line protocol is/, /Hardware is /, /Gateway of last resort/, /Codes: [A-Z] - /, /\[\d+\/\d+\] via /, /Vlan\s+Mac Address/, /Neighbor ID\s+Pri/];

/**
 * Befehlsanfänge einer IOS-Konfiguration für die Zeilenaufteilung (optional mit vorangestelltem `no `).
 * Bewusst nur eindeutige Anfänge: allgemeine Wörter wie `vlan`, `name`, `password`, `line` stehen auch in
 * Argumenten (`switchport access vlan 10`, `ip domain name x`) und trennen sonst falsch.
 */
const COMMAND_START_PATTERNS = [
  "interface",
  "hostname",
  "description",
  "ip address",
  "ipv6 address",
  "shutdown",
  "switchport",
  "(?<!trunk )encapsulation",
  "ip ospf",
  "ip helper-address",
  "ip access-group",
  "ip access-list",
  "ip route",
  "ip nat",
  "ip dhcp",
  "ip domain[- ]name",
  "ip name-server",
  "ip ssh",
  "router (?:ospf|eigrp|rip|bgp)",
  "network (?=\\d)",
  "passive-interface",
  "(?<!ip )access-list",
  "channel-group",
  "duplex",
  "speed",
  "spanning-tree",
  "line (?:vty|console)",
  "transport input",
  "login (?:local|authentication)",
  "enable (?:secret|password)",
  "service password-encryption",
  "crypto (?:key|isakmp|ipsec|map)",
  "username",
  "banner",
  "ntp (?=[a-z])",
  "snmp-server",
  "logging",
  "standby",
  "clock",
  "bandwidth",
  "cdp",
  "lldp",
];

const COMMAND_STARTS = new RegExp(`(?<=\\s)(?<!\\bno )(?=(?:no )?(?:${COMMAND_START_PATTERNS.join("|")}))`, "g");
/** Prompt in der Aufteilung etwas toleranter als in der Einordnung (PDF-Reste wie „SW1(config- if)#“). */
const PROMPT_SPLIT = /(?<!\S)[A-Za-z][\w-]*(?:\((?:config|config-)[a-z0-9 -]*\))?#(?=\s?[A-Za-z!])/g;

/** Routen-/Ausgabezeilen einer show-Ausgabe: Code (C, S, O, o E2 …) vor einem Präfix, sowie die Zeile „Gateway of last resort“. */
const ROUTE_LINE_START = /(?<=\s)(?=(?:[CLSRMBDOo]\*?)(?: (?:E1|E2|IA|N1|N2|EX))? \d+\.\d+\.\d+\.\d+\/\d+)/g;

export interface OptionCli {
  kind: OptionCliKind;
  prompts: number;
  commands: number;
}

export function promptCount(text: string): number {
  return [...text.matchAll(PROMPT)].length;
}

export function commandCount(text: string): number {
  const lower = text.toLowerCase();
  return CLASSIFY_COMMANDS.filter((c) => lower.includes(c)).length;
}

/** Ordnet eine Option ein: nur die Block-Arten (siehe `isCliBlockKind`) werden anders dargestellt. */
export function classifyOption(text: string): OptionCli {
  const prompts = promptCount(text);
  const commands = commandCount(text);
  if (text.includes("\n")) return { kind: "Zeilenumbruch bereits im Text", prompts, commands };
  if (SHOW_MARKERS.some((r) => r.test(text))) return { kind: "show-Ausgabe", prompts, commands };
  if (prompts >= 2) return { kind: "mehrzeilig mit Prompts", prompts, commands };
  if (commands >= 3) return { kind: "Konfiguration ohne Prompt", prompts, commands };
  if (prompts === 1 || commands >= 1) return { kind: "Einzelbefehl", prompts, commands };
  return { kind: "kein CLI", prompts, commands };
}

export const isCliBlockKind = (k: OptionCliKind) => k === "mehrzeilig mit Prompts" || k === "Konfiguration ohne Prompt" || k === "show-Ausgabe" || k === "Zeilenumbruch bereits im Text";

const cutAt = (text: string, indexes: number[]): string[] => {
  const cuts = [...new Set(indexes)].filter((i) => i > 0 && i < text.length).sort((a, b) => a - b);
  const out: string[] = [];
  let from = 0;
  for (const c of [...cuts, text.length]) {
    const part = text.slice(from, c).trim();
    if (part) out.push(part);
    from = c;
  }
  return out;
};

const startIndexes = (text: string, re: RegExp): number[] => [...text.matchAll(re)].map((m) => m.index ?? 0);

/** Teilt zusätzlich an Befehlsanfängen; der erste Befehl einer Zeile bleibt (Prompt oder erstes Wort) zusammen mit seinen Argumenten. */
function splitAtCommands(line: string): string[] {
  // Ein alleinstehendes „!“ ist ein Trenner der Konfiguration und bekommt eine eigene Zeile
  const bangs = [...line.matchAll(/(?<=\s)!(?=\s|$)/g)].flatMap((m) => [m.index ?? 0, (m.index ?? 0) + 1]);
  return cutAt(line, [...startIndexes(line, COMMAND_STARTS), ...bangs]);
}

function splitPromptOption(text: string): string[] {
  const segments = cutAt(text, startIndexes(text, PROMPT_SPLIT));
  // Nach dem Prompt können mehrere Befehle in einer Zeile stehen („R7# interface … ip address …“)
  return segments.flatMap((seg) => {
    const promptEnd = /^[A-Za-z][\w-]*(?:\((?:config|config-)[a-z0-9 -]*\))?#\s?/.exec(seg)?.[0].length ?? 0;
    const rest = seg.slice(promptEnd);
    if (!rest) return [seg];
    const parts = splitAtCommands(rest);
    if (parts.length <= 1) return [seg];
    return [seg.slice(0, promptEnd) + parts[0], ...parts.slice(1)];
  });
}

function splitShowOption(text: string): string[] {
  // „Gateway of last resort is … to network 0.0.0.0“ endet vor der ersten Routenzeile
  return cutAt(text, startIndexes(text, ROUTE_LINE_START));
}

/** Wird die Option als CLI-Block dargestellt? */
export const isCliOption = (text: string): boolean => isCliBlockKind(classifyOption(text).kind);

/**
 * Zusätzliche Klasse für den Options-Button bei CLI-Blöcken (mit führendem Leerzeichen, sonst leer): der Button
 * selbst scrollt, nicht die Seite. Der Button ist fokussierbar; ein eigener Scrollbereich im Button wäre per
 * Tastatur nicht erreichbar (axe: scrollable-region-focusable).
 */
export const cliButtonClass = (text: string): string => (isCliOption(text) ? " overflow-x-auto" : "");

/**
 * Zeilen einer als CLI-Block erkannten Option; `null` für Einzelbefehle und normale Antwortsätze.
 * Die Zeilen ergeben, mit je einem Leerzeichen verbunden, den Originaltext (bei bestehenden Umbrüchen mit `\n`).
 */
export function splitCliOption(text: string): string[] | null {
  const { kind } = classifyOption(text);
  if (!isCliBlockKind(kind)) return null;
  switch (kind) {
    case "Zeilenumbruch bereits im Text":
      return text.split("\n");
    case "mehrzeilig mit Prompts":
      return splitPromptOption(text);
    case "Konfiguration ohne Prompt":
      return splitAtCommands(text);
    default:
      return splitShowOption(text);
  }
}

/**
 * Klassifizierung von Antwortoptionen, die CLI-Inhalt enthalten (nur Analyse, keine Datenänderung).
 */
export type OptionCliKind = "Zeilenumbruch bereits im Text" | "mehrzeilig mit Prompts" | "Konfiguration ohne Prompt" | "show-Ausgabe" | "Einzelbefehl" | "kein CLI";

const PROMPT = /(?:^|\s)([A-Za-z][\w-]*)(\((?:config|config-[a-z0-9-]+)\))?#\s?(?=[A-Za-z!])/g;

const COMMANDS = [
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
  return COMMANDS.filter((c) => lower.includes(c)).length;
}

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

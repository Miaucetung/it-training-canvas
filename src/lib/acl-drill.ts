// ============================================================
// ACL-Drill — reine, testbare Generatoren & Validatoren.
// Vier Modi decken alle CCNA-ACL-Szenarien ab:
//   1) "wildcard"  — Adress-/Wildcard-Angabe (host / any / Subnetz) schreiben
//   2) "match"     — ACL-Liste + Paket lesen → permit/deny (First-Match + implizites deny)
//   3) "build"     — Standard- ODER Extended-ACE aus einer Anforderung schreiben
//   4) "placement" — Interface + Richtung wählen (Standard→Ziel/out, Extended→Quelle/in)
// ============================================================

import { cidrToWildcard, ipToInt, networkAddress } from "@/lib/ospf-wildcard-drill";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function isIp(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) && s.split(".").every((o) => +o <= 255);
}

/** Trifft die Wildcard-Angabe (addr/wild) die IP? (Bits in wild = "don't care"). */
export function wildcardMatches(addr: string, wild: string, ip: string): boolean {
  const inv = (~ipToInt(wild)) >>> 0;
  return (((ipToInt(ip) ^ ipToInt(addr)) >>> 0) & inv) === 0;
}

// Port-Namen ↔ Nummern (beide Schreibweisen werden akzeptiert).
const PORT_ALIASES: Record<string, string> = {
  "20": "20", "ftp-data": "20",
  "21": "21", ftp: "21",
  "22": "22", ssh: "22",
  "23": "23", telnet: "23",
  "25": "25", smtp: "25",
  "53": "53", domain: "53",
  "80": "80", www: "80", http: "80",
  "110": "110", pop3: "110",
  "443": "443", https: "443",
  "3389": "3389", rdp: "3389",
};
const PORT_LABEL: Record<string, string> = {
  "20": "FTP-Data", "21": "FTP", "22": "SSH", "23": "Telnet", "25": "SMTP",
  "53": "DNS", "80": "HTTP", "110": "POP3", "443": "HTTPS", "3389": "RDP",
};
function normPort(p: string): string {
  return PORT_ALIASES[p.toLowerCase()] ?? p;
}

/** Normalform einer Adress-/Wildcard-Angabe: "host X" | "any" | "X W". */
function canonAddr(ip: string, wild: string): string {
  if (wild === "0.0.0.0") return `host ${ip}`;
  if (wild === "255.255.255.255") return "any";
  return `${ip} ${wild}`;
}

// ── gemeinsamer Parser: Adress-Spec aus Token-Strom lesen ──
interface Cursor {
  toks: string[];
  i: number;
}
function takeAddr(c: Cursor, allowLoneIp: boolean): string | null {
  const t = c.toks[c.i];
  if (!t) return null;
  if (t === "any") {
    c.i++;
    return "any";
  }
  if (t === "host") {
    const ip = c.toks[c.i + 1];
    if (!ip || !isIp(ip)) return null;
    c.i += 2;
    return `host ${ip}`;
  }
  if (isIp(t)) {
    const w = c.toks[c.i + 1];
    if (w && isIp(w)) {
      c.i += 2;
      return canonAddr(t, w);
    }
    if (allowLoneIp) {
      // Standard-ACL erlaubt "access-list 10 permit 1.1.1.1" = host
      c.i += 1;
      return `host ${t}`;
    }
  }
  return null;
}

// ============================================================
// Modus 1: Wildcard / Adress-Angabe schreiben
// ============================================================
export interface AclWildcardTask {
  kind: "wildcard";
  target: "host" | "subnet" | "any";
  prompt: string;
  /** Normalform der akzeptierten Lösung. */
  canonical: string;
  display: string;
  hint: string;
}

function randHost(): string {
  const a = pick([10, 172, 192]);
  if (a === 10) return `10.${randInt(0, 60)}.${randInt(0, 250)}.${randInt(1, 250)}`;
  if (a === 172) return `172.${randInt(16, 31)}.${randInt(0, 250)}.${randInt(1, 250)}`;
  return `192.168.${randInt(0, 250)}.${randInt(1, 250)}`;
}

export function generateAclWildcardTask(_id = 0): AclWildcardTask {
  const target = pick<AclWildcardTask["target"]>(["host", "subnet", "any"]);
  if (target === "any") {
    return {
      kind: "wildcard", target,
      prompt: "Welche Adress-/Wildcard-Angabe trifft JEDE beliebige Adresse?",
      canonical: "any",
      display: "any  (≙ 0.0.0.0 255.255.255.255)",
      hint: "Das Schlüsselwort `any` ersetzt `0.0.0.0 255.255.255.255` (alle Bits egal).",
    };
  }
  if (target === "host") {
    const ip = randHost();
    return {
      kind: "wildcard", target,
      prompt: `Welche Adress-/Wildcard-Angabe trifft GENAU den einen Host ${ip}?`,
      canonical: `host ${ip}`,
      display: `host ${ip}  (≙ ${ip} 0.0.0.0)`,
      hint: "Ein einzelner Host = `host <ip>` oder `<ip> 0.0.0.0` (kein Bit egal).",
    };
  }
  const cidr = pick([24, 25, 26, 27, 28, 16, 20]);
  const host = randHost();
  const net = networkAddress(host, cidr);
  const wild = cidrToWildcard(cidr);
  return {
    kind: "wildcard", target,
    prompt: `Welche Adress-/Wildcard-Angabe trifft GENAU alle Hosts im Subnetz ${net}/${cidr}?`,
    canonical: `${net} ${wild}`,
    display: `${net} ${wild}`,
    hint: `Netzadresse ${net}, Wildcard = invertierte /${cidr}-Maske = ${wild}.`,
  };
}

export interface AclCheck {
  ok: boolean;
  normalized: string;
  reason?: string;
}

export function checkAclWildcard(input: string, task: AclWildcardTask): AclCheck {
  const toks = input.trim().toLowerCase().replace(/\s+/g, " ").split(" ").filter(Boolean);
  const c: Cursor = { toks, i: 0 };
  const got = takeAddr(c, false);
  if (got === null || c.i !== toks.length) {
    return { ok: false, normalized: input.trim(), reason: "Erwartet: `host <ip>`, `any` oder `<netz> <wildcard>`." };
  }
  if (got !== task.canonical) {
    return { ok: false, normalized: got, reason: `Erwartet ${task.display}.` };
  }
  return { ok: true, normalized: got };
}

// ============================================================
// Modus 2: ACL lesen → permit / deny
// ============================================================
interface Ace {
  action: "permit" | "deny";
  proto: "ip" | "tcp" | "udp" | "icmp";
  src: { ip: string; wild: string };
  dst?: { ip: string; wild: string };
  port?: string; // nur tcp/udp
}
interface Packet {
  src: string;
  dst: string;
  proto: "tcp" | "udp" | "icmp";
  port: string;
}

function aceMatches(ace: Ace, p: Packet): boolean {
  if (ace.proto !== "ip" && ace.proto !== p.proto) return false;
  if (!wildcardMatches(ace.src.ip, ace.src.wild, p.src)) return false;
  if (ace.dst && !wildcardMatches(ace.dst.ip, ace.dst.wild, p.dst)) return false;
  if (ace.port && ace.port !== p.port) return false;
  return true;
}

/** First-Match-Auswertung. matchedIndex = -1 → implizites deny am Ende. */
export function evaluateAcl(aces: Ace[], p: Packet): { result: "permit" | "deny"; matchedIndex: number } {
  for (let i = 0; i < aces.length; i++) {
    if (aceMatches(aces[i], p)) return { result: aces[i].action, matchedIndex: i };
  }
  return { result: "deny", matchedIndex: -1 };
}

function specToString(s: { ip: string; wild: string }): string {
  return canonAddr(s.ip, s.wild);
}
function aceToString(ace: Ace, n: number): string {
  if (ace.proto === "ip" && !ace.dst) {
    // Standard
    return `access-list ${n} ${ace.action} ${specToString(ace.src)}`;
  }
  const portPart = ace.port ? ` eq ${ace.port}` : "";
  return `access-list ${n} ${ace.action} ${ace.proto} ${specToString(ace.src)} ${specToString(ace.dst!)}${portPart}`;
}

export interface AclMatchTask {
  kind: "match";
  type: "standard" | "extended";
  aclNumber: number;
  lines: string[];
  packetText: string;
  result: "permit" | "deny";
  matchedIndex: number;
  explanation: string;
}

function subnetSpec(): { ip: string; wild: string; cidr: number } {
  const cidr = pick([24, 25, 26, 27]);
  const host = randHost();
  return { ip: networkAddress(host, cidr), wild: cidrToWildcard(cidr), cidr };
}

export function generateAclMatchTask(_id = 0): AclMatchTask {
  const type = pick<"standard" | "extended">(["standard", "extended"]);
  if (type === "standard") {
    const n = pick([1, 10, 20, 99]);
    const sub = subnetSpec();
    const blockedHost = `${sub.ip.split(".").slice(0, 3).join(".")}.${randInt(1, 250)}`;
    // ACL: deny ein Host, permit dessen Subnetz (implizites deny für Rest)
    const aces: Ace[] = [
      { action: "deny", proto: "ip", src: { ip: blockedHost, wild: "0.0.0.0" } },
      { action: "permit", proto: "ip", src: { ip: sub.ip, wild: sub.wild } },
    ];
    // Paket: würfle Quelle aus { blockierter Host, anderer Host im Subnetz, Host außerhalb }
    const scenario = pick(["blocked", "insub", "outside"]);
    let src: string;
    if (scenario === "blocked") src = blockedHost;
    else if (scenario === "insub") {
      do {
        src = `${sub.ip.split(".").slice(0, 3).join(".")}.${randInt(1, 250)}`;
      } while (src === blockedHost || !wildcardMatches(sub.ip, sub.wild, src));
    } else src = randHost();
    const p: Packet = { src, dst: "0.0.0.0", proto: "tcp", port: "0" };
    const ev = evaluateAcl(aces, p);
    const explanation =
      ev.matchedIndex === -1
        ? `Quelle ${src} trifft keine Zeile → das **implizite deny any** am Listenende greift.`
        : `Quelle ${src} trifft zuerst Zeile ${ev.matchedIndex + 1} (\`${aces[ev.matchedIndex].action}\`) → First-Match entscheidet.`;
    return {
      kind: "match", type, aclNumber: n,
      lines: aces.map((a) => aceToString(a, n)),
      packetText: `Paket von Quelle ${src}`,
      result: ev.result, matchedIndex: ev.matchedIndex, explanation,
    };
  }

  // Extended
  const n = pick([100, 110, 120]);
  const srcSub = subnetSpec();
  const server = randHost();
  const port = pick(["23", "80", "443", "22"]);
  // ACL: deny <port> von srcSub zu server, permit ip any any
  const aces: Ace[] = [
    {
      action: "deny", proto: "tcp",
      src: { ip: srcSub.ip, wild: srcSub.wild },
      dst: { ip: server, wild: "0.0.0.0" }, port,
    },
    { action: "permit", proto: "ip", src: { ip: "0.0.0.0", wild: "255.255.255.255" }, dst: { ip: "0.0.0.0", wild: "255.255.255.255" } },
  ];
  // Paket-Varianten
  const scen = pick(["hit-deny", "wrong-port", "wrong-src"]);
  let src = `${srcSub.ip.split(".").slice(0, 3).join(".")}.${randInt(1, 250)}`;
  while (!wildcardMatches(srcSub.ip, srcSub.wild, src)) src = `${srcSub.ip.split(".").slice(0, 3).join(".")}.${randInt(1, 250)}`;
  let pkt: Packet;
  if (scen === "hit-deny") pkt = { src, dst: server, proto: "tcp", port };
  else if (scen === "wrong-port") pkt = { src, dst: server, proto: "tcp", port: pick(["80", "443", "22", "23"].filter((x) => x !== port)) };
  else pkt = { src: randHost(), dst: server, proto: "tcp", port };
  const ev = evaluateAcl(aces, pkt);
  const pLabel = PORT_LABEL[pkt.port] ?? pkt.port;
  const explanation =
    ev.matchedIndex === 0
      ? `Quelle, Ziel, Protokoll UND Port (${pLabel}) passen auf Zeile 1 \`deny\` → blockiert.`
      : `Zeile 1 passt nicht (anderer Port/Quelle), also greift Zeile 2 \`permit ip any any\`.`;
  return {
    kind: "match", type, aclNumber: n,
    lines: aces.map((a) => aceToString(a, n)),
    packetText: `TCP-Paket  ${pkt.src} → ${pkt.dst}  Port ${pkt.port} (${pLabel})`,
    result: ev.result, matchedIndex: ev.matchedIndex, explanation,
  };
}

// ============================================================
// Modus 3: ACE aus Anforderung schreiben (Standard ODER Extended)
// ============================================================
export interface AclBuildTask {
  kind: "build";
  variant: "standard" | "extended";
  aclNumber: number;
  prompt: string;
  canonical: string;
  display: string;
  hint: string;
}

function canonicalizeAce(input: string, variant: "standard" | "extended", n: number): string | null {
  let s = input.trim().toLowerCase().replace(/\s+/g, " ");
  s = s.replace(/^\S+[#>]\s*/, ""); // evtl. Prompt entfernen
  const toks = s.split(" ").filter(Boolean);
  const c: Cursor = { toks, i: 0 };
  if (toks[c.i] !== "access-list") return null;
  c.i++;
  if (toks[c.i] !== String(n)) return null;
  c.i++;
  const action = toks[c.i];
  if (action !== "permit" && action !== "deny") return null;
  c.i++;

  if (variant === "standard") {
    const src = takeAddr(c, true);
    if (src === null || c.i !== toks.length) return null;
    return `access-list ${n} ${action} ${src}`;
  }

  // extended
  const proto = toks[c.i];
  if (!["ip", "tcp", "udp", "icmp"].includes(proto)) return null;
  c.i++;
  const src = takeAddr(c, false);
  if (src === null) return null;
  const dst = takeAddr(c, false);
  if (dst === null) return null;
  let portPart = "";
  if (c.i < toks.length) {
    if (toks[c.i] !== "eq") return null;
    const port = toks[c.i + 1];
    if (!port) return null;
    portPart = ` eq ${normPort(port)}`;
    c.i += 2;
  }
  if (c.i !== toks.length) return null;
  return `access-list ${n} ${action} ${proto} ${src} ${dst}${portPart}`;
}

export function generateAclBuildTask(_id = 0): AclBuildTask {
  const variant = pick<"standard" | "extended">(["standard", "extended"]);
  if (variant === "standard") {
    const n = pick([1, 10, 20, 50, 99]);
    const kind = pick(["host", "subnet", "any"]);
    if (kind === "host") {
      const ip = randHost();
      const action = pick<"permit" | "deny">(["permit", "deny"]);
      return {
        kind: "build", variant, aclNumber: n,
        prompt: `Standard-ACL ${n}: ${action === "deny" ? "Sperre" : "Erlaube"} genau den Host ${ip}.`,
        canonical: `access-list ${n} ${action} host ${ip}`,
        display: `access-list ${n} ${action} host ${ip}`,
        hint: "Standard-ACL filtert nur die Quelle. `host <ip>` = ein Host (≙ `<ip> 0.0.0.0`).",
      };
    }
    if (kind === "subnet") {
      const cidr = pick([24, 25, 26, 27, 28]);
      const net = networkAddress(randHost(), cidr);
      const wild = cidrToWildcard(cidr);
      return {
        kind: "build", variant, aclNumber: n,
        prompt: `Standard-ACL ${n}: Erlaube alle Hosts aus dem Subnetz ${net}/${cidr}.`,
        canonical: `access-list ${n} permit ${net} ${wild}`,
        display: `access-list ${n} permit ${net} ${wild}`,
        hint: `Quelle = Netzadresse ${net} mit Wildcard ${wild} (/${cidr} invertiert).`,
      };
    }
    return {
      kind: "build", variant, aclNumber: n,
      prompt: `Standard-ACL ${n}: Erlaube jeglichen restlichen Verkehr (alle Quellen).`,
      canonical: `access-list ${n} permit any`,
      display: `access-list ${n} permit any`,
      hint: "`any` ersetzt `0.0.0.0 255.255.255.255`. Pflicht, sonst sperrt das implizite deny alles.",
    };
  }

  // Extended
  const n = pick([100, 110, 120, 150]);
  const cidr = pick([24, 25, 26]);
  const srcNet = networkAddress(randHost(), cidr);
  const srcWild = cidrToWildcard(cidr);
  const server = randHost();
  const svc = pick(["23", "80", "443", "22", "53"]);
  const svcLabel = PORT_LABEL[svc];
  const scenario = pick(["deny-svc", "permit-svc"]);
  const action = scenario === "deny-svc" ? "deny" : "permit";
  const proto = svc === "53" ? pick(["tcp", "udp"]) : "tcp";
  return {
    kind: "build", variant, aclNumber: n,
    prompt: `Extended-ACL ${n}: ${action === "deny" ? "Sperre" : "Erlaube"} ${svcLabel}-Zugriff vom Subnetz ${srcNet}/${cidr} zum Server ${server}.`,
    canonical: `access-list ${n} ${action} ${proto} ${srcNet} ${srcWild} host ${server} eq ${svc}`,
    display: `access-list ${n} ${action} ${proto} ${srcNet} ${srcWild} host ${server} eq ${svc}`,
    hint: `Extended: \`access-list ${n} ${action} ${proto} <quelle> <ziel> eq <port>\`. ${svcLabel} = Port ${svc}; \`eq ${svcLabel.toLowerCase()}\` wird auch akzeptiert.`,
  };
}

export function checkAclBuild(input: string, task: AclBuildTask): AclCheck {
  const canon = canonicalizeAce(input, task.variant, task.aclNumber);
  if (canon === null) {
    return {
      ok: false, normalized: input.trim(),
      reason: task.variant === "standard"
        ? `Format: access-list ${task.aclNumber} permit|deny <quelle>.`
        : `Format: access-list ${task.aclNumber} permit|deny <proto> <quelle> <ziel> [eq <port>].`,
    };
  }
  if (canon !== task.canonical) {
    return { ok: false, normalized: canon, reason: `Erwartet: ${task.display}.` };
  }
  return { ok: true, normalized: canon };
}

// ============================================================
// Modus 4: Platzierung — Interface + Richtung
// ============================================================
export interface AclPlacementTask {
  kind: "placement";
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function generateAclPlacementTask(_id = 0): AclPlacementTask {
  const variant = pick<"standard" | "extended">(["standard", "extended"]);
  const srcSite = pick(["der Buchhaltung", "dem Vertrieb", "dem Gäste-WLAN", "der Filiale"]);
  const dstSite = pick(["dem Internet", "dem Server-Subnetz", "dem Rechenzentrum"]);
  if (variant === "standard") {
    const correct = "Auf dem Router-Interface NAHE AM ZIEL, Richtung out";
    const options = [
      correct,
      "Auf dem Router-Interface nahe an der Quelle, Richtung in",
      "Auf dem Quell-Interface, Richtung out",
      "Egal — Standard-ACLs wirken überall gleich",
    ].sort(() => Math.random() - 0.5);
    return {
      kind: "placement",
      scenario: `Eine **Standard-ACL** soll Verkehr von ${srcSite} zu ${dstSite} steuern. Wo platzierst du sie?`,
      options,
      correctIndex: options.indexOf(correct),
      explanation:
        "Standard-ACLs filtern nur die Quell-IP. Zu nah an der Quelle würden sie ALLE Verbindungen dieser Quelle kappen — daher **nahe am Ziel** und meist **out**.",
    };
  }
  const correct = "Auf dem Router-Interface NAHE AN DER QUELLE, Richtung in";
  const options = [
    correct,
    "Auf dem Router-Interface nahe am Ziel, Richtung out",
    "Auf dem Ziel-Interface, Richtung in",
    "Egal — Extended-ACLs wirken überall gleich",
  ].sort(() => Math.random() - 0.5);
  return {
    kind: "placement",
    scenario: `Eine **Extended-ACL** soll bestimmten Verkehr von ${srcSite} zu ${dstSite} blockieren. Wo platzierst du sie?`,
    options,
    correctIndex: options.indexOf(correct),
    explanation:
      "Extended-ACLs matchen Quelle, Ziel, Protokoll und Port — also kann man unerwünschten Verkehr **so früh wie möglich** verwerfen: **nahe an der Quelle**, meist **in**. Das spart Bandbreite auf dem Pfad.",
  };
}

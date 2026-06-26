// ============================================================
// OSPF- & Wildcard-Drill — reine, testbare Generatoren & Validatoren.
// Drei Modi:
//   1) "wildcard"     — zu Präfix/Maske die Wildcard-Maske tippen
//   2) "ospf-network" — den vollständigen `network … wildcard area N`-Befehl tippen
//   3) "dr-bdr"       — aus Priority + Router-ID den DR (bzw. BDR) bestimmen
// ============================================================

import { cidrToOctets, octetsToString } from "@/lib/subnet-reference";

export function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, o) => ((acc << 8) | (parseInt(o, 10) & 0xff)) >>> 0, 0) >>> 0;
}

/** Dezimale Subnetzmaske zu einer Präfixlänge. */
export function maskString(cidr: number): string {
  return octetsToString(cidrToOctets(cidr));
}

/** Wildcard-Maske (invertierte Subnetzmaske) zu einer Präfixlänge. */
export function cidrToWildcard(cidr: number): string {
  return cidrToOctets(cidr)
    .map((o) => 255 - o)
    .join(".");
}

/** Netzadresse von ip bei Präfixlänge cidr (als gepunkteter String). */
export function networkAddress(ip: string, cidr: number): string {
  const m = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const net = (ipToInt(ip) & m) >>> 0;
  return octetsToString([(net >>> 24) & 0xff, (net >>> 16) & 0xff, (net >>> 8) & 0xff, net & 0xff]);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

// ── Modus 1: Wildcard schreiben ─────────────────────────────
export interface WildcardTask {
  kind: "wildcard";
  /** Vorgabe-Art: aus Präfix (/24) oder aus dezimaler Maske. */
  given: "prefix" | "mask";
  cidr: number;
  prompt: string;
  expected: string; // Wildcard
  hint: string;
}

const WILDCARD_CIDRS = [8, 16, 24, 25, 26, 27, 28, 29, 30];

export function generateWildcardTask(_id = 0): WildcardTask {
  const cidr = pick(WILDCARD_CIDRS);
  const given = pick<WildcardTask["given"]>(["prefix", "mask"]);
  const expected = cidrToWildcard(cidr);
  if (given === "mask") {
    const mask = maskString(cidr);
    return {
      kind: "wildcard", given, cidr,
      prompt: `Wie lautet die Wildcard-Maske zur Subnetzmaske ${mask} (/${cidr})?`,
      expected,
      hint: `Wildcard = invertierte Maske: 255 − jedes Oktett. ${mask} → ${expected}.`,
    };
  }
  return {
    kind: "wildcard", given, cidr,
    prompt: `Wie lautet die Wildcard-Maske für ein /${cidr}-Netz?`,
    expected,
    hint: `/${cidr} → Maske ${maskString(cidr)} → invertiert ${expected}.`,
  };
}

export interface WildcardCheck {
  ok: boolean;
  normalized: string;
  reason?: string;
}

export function checkWildcard(input: string, task: WildcardTask): WildcardCheck {
  const norm = input.trim().replace(/\s+/g, "");
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(norm)) {
    return { ok: false, normalized: norm, reason: "Erwartet wird eine Wildcard im Format A.B.C.D." };
  }
  if (norm !== task.expected) {
    return { ok: false, normalized: norm, reason: `Erwartet ${task.expected}.` };
  }
  return { ok: true, normalized: norm };
}

// ── Modus 2: OSPF network-Befehl ────────────────────────────
export interface OspfNetworkTask {
  kind: "ospf-network";
  ip: string;
  cidr: number;
  net: string;
  wildcard: string;
  area: number;
  prompt: string;
  expected: string;
  hint: string;
}

export function generateOspfNetworkTask(_id = 0): OspfNetworkTask {
  const cidr = pick([24, 25, 26, 30]);
  const a = pick([10, 172, 192]);
  let host: string;
  if (a === 10) host = `10.${randInt(0, 40)}.${randInt(0, 250)}.${randInt(1, 250)}`;
  else if (a === 172) host = `172.${randInt(16, 31)}.${randInt(0, 250)}.${randInt(1, 250)}`;
  else host = `192.168.${randInt(0, 250)}.${randInt(1, 250)}`;
  const net = networkAddress(host, cidr);
  const wildcard = cidrToWildcard(cidr);
  const area = pick([0, 0, 0, 1, 2, 51]);
  return {
    kind: "ospf-network", ip: host, cidr, net, wildcard, area,
    prompt: `Das Interface hat die Adresse ${host}/${cidr}. Schreibe den OSPF-network-Befehl, um genau dieses Netz in Area ${area} anzukündigen.`,
    expected: `network ${net} ${wildcard} area ${area}`,
    hint: `Netzadresse von ${host}/${cidr} = ${net}; /${cidr} → Wildcard ${wildcard}.`,
  };
}

export interface OspfNetworkCheck {
  ok: boolean;
  normalized: string;
  reason?: string;
}

export function checkOspfNetwork(input: string, task: OspfNetworkTask): OspfNetworkCheck {
  const norm = input.trim().toLowerCase().replace(/\s+/g, " ");
  const stripped = norm.replace(/^\S*#\s*/, "");
  const toks = stripped.split(" ").filter(Boolean);
  if (toks[0] !== "network") {
    return { ok: false, normalized: norm, reason: "Befehl muss mit „network“ beginnen." };
  }
  const exp = ["network", task.net, task.wildcard, "area", String(task.area)];
  // erwartete Token: network <net> <wild> area <id>  → 5 Token
  if (toks.length !== 5) {
    return { ok: false, normalized: norm, reason: "Format: network <netz> <wildcard> area <id>." };
  }
  const labels = ["", "Netzadresse", "Wildcard-Maske", "Schlüsselwort „area“", "Area-ID"];
  for (let i = 1; i < exp.length; i++) {
    if (toks[i] !== exp[i].toLowerCase()) {
      return { ok: false, normalized: norm, reason: `${labels[i]} stimmt nicht (erwartet ${exp[i]}).` };
    }
  }
  return { ok: true, normalized: norm };
}

// ── Modus 3: DR/BDR-Wahl ────────────────────────────────────
export interface DrRouter {
  name: string;
  priority: number;
  rid: string;
}
export interface DrBdrTask {
  kind: "dr-bdr";
  routers: DrRouter[];
  options: string[]; // Router-Namen + evtl. "Kein DR"
  correctIndex: number; // Index in options des DR
  drName: string | null;
  bdrName: string | null;
  explanation: string;
}

const NO_DR = "Kein DR (alle Priority 0)";

/** Bestimmt DR und BDR nach OSPF-Regeln: höchste Priority (>0), Tiebreaker höchste RID. */
export function electDrBdr(routers: DrRouter[]): { dr: DrRouter | null; bdr: DrRouter | null } {
  const eligible = routers.filter((r) => r.priority > 0);
  const ranked = [...eligible].sort((a, b) =>
    b.priority - a.priority || ipToInt(b.rid) - ipToInt(a.rid),
  );
  return { dr: ranked[0] ?? null, bdr: ranked[1] ?? null };
}

export function generateDrBdrTask(_id = 0): DrBdrTask {
  const n = randInt(3, 4);
  // RIDs als Loopback-Stil 192.168.254.x (eindeutig)
  const ridPool = [1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5).slice(0, n);
  // Szenario: entweder Priority-Gleichstand (RID entscheidet) oder unterschiedliche Priorities
  const tieScenario = Math.random() < 0.5;
  const routers: DrRouter[] = ridPool.map((x, i) => {
    let priority: number;
    if (tieScenario) {
      priority = 1; // alle gleich → RID-Tiebreaker
    } else {
      priority = pick([0, 1, 1, 10, 100, 255]);
    }
    return { name: `R${i + 1}`, priority, rid: `192.168.254.${x}` };
  });
  // Mindestens ein wählbarer Router, sonst Szenario "Kein DR"
  const { dr, bdr } = electDrBdr(routers);

  const options = [...routers.map((r) => r.name)];
  let correctIndex: number;
  if (!dr) {
    options.push(NO_DR);
    correctIndex = options.length - 1;
  } else {
    correctIndex = options.indexOf(dr.name);
  }

  let explanation: string;
  if (!dr) {
    explanation = "Alle Router haben Priority 0 → keiner ist wählbar, es gibt keinen DR/BDR.";
  } else if (tieScenario) {
    explanation =
      `Alle Priorities gleich (1) → die höchste Router-ID gewinnt. ${dr.name} hat die höchste RID ${dr.rid} → DR` +
      (bdr ? `, ${bdr.name} (${bdr.rid}) → BDR.` : ".");
  } else {
    explanation =
      `Höchste Priority gewinnt: ${dr.name} (Priority ${dr.priority}) → DR` +
      (bdr ? `, ${bdr.name} (Priority ${bdr.priority}${bdr.priority === dr.priority ? `, RID ${bdr.rid}` : ""}) → BDR. ` : ". ") +
      "Bei Priority-Gleichstand entscheidet die höhere RID; Priority 0 = nie wählbar.";
  }

  return {
    kind: "dr-bdr",
    routers,
    options,
    correctIndex,
    drName: dr?.name ?? null,
    bdrName: bdr?.name ?? null,
    explanation,
  };
}

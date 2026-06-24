// ============================================================
// Routing-Endlos-Lab — reine, testbare Aufgaben-Generatoren & Validatoren.
// Zwei Modi:
//   1) "ip-route"      — den passenden ip route-Befehl tippen
//   2) "longest-match" — aus einer Routing-Tabelle die genutzte Route wählen
// ============================================================

import { cidrToOctets, octetsToString } from "@/lib/subnet-reference";

export function ipToInt(ip: string): number {
  return (
    ip.split(".").reduce((acc, o) => ((acc << 8) | (parseInt(o, 10) & 0xff)) >>> 0, 0) >>> 0
  );
}

export function maskString(cidr: number): string {
  return octetsToString(cidrToOctets(cidr));
}

/** Netzadresse von ip bei Präfixlänge cidr (als 32-Bit-Integer). */
export function networkAddr(ipInt: number, cidr: number): number {
  const m = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  return (ipInt & m) >>> 0;
}

/** Liegt die Host-IP im Netz net/cidr? */
export function contains(net: string, cidr: number, ip: string): boolean {
  return networkAddr(ipToInt(ip), cidr) === networkAddr(ipToInt(net), cidr);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

// ── Modus 1: ip route schreiben ─────────────────────────────
export interface IpRouteTask {
  kind: "ip-route";
  scenario: "normal" | "default" | "floating" | "host";
  prompt: string;
  net: string;
  cidr: number;
  mask: string;
  nextHop: string;
  ad: number | null;
  expected: string;
  hint: string;
}

function randNet(): { net: string; cidr: number } {
  const cidr = pick([24, 25, 26, 27, 30]);
  const a = pick([10, 172, 192]);
  let net: string;
  if (a === 10) net = `10.${randInt(0, 50)}.${randInt(0, 250)}.0`;
  else if (a === 172) net = `172.${randInt(16, 31)}.${randInt(0, 250)}.0`;
  else net = `192.168.${randInt(0, 250)}.0`;
  // letztes Oktett auf Subnetzgrenze ausrichten
  const block = Math.pow(2, 32 - cidr) > 256 ? 256 : Math.pow(2, 32 - cidr);
  const parts = net.split(".").map(Number);
  parts[3] = Math.floor(parts[3] / block) * block;
  return { net: parts.join("."), cidr };
}

export function generateIpRouteTask(_id = 0): IpRouteTask {
  const scenario = pick<IpRouteTask["scenario"]>(["normal", "default", "floating", "host"]);
  const nextHop = `10.0.${randInt(0, 9)}.${randInt(1, 254)}`;
  if (scenario === "default") {
    return {
      kind: "ip-route", scenario,
      prompt: `Konfiguriere eine Default-Route ("Gateway of last resort") über den Next-Hop ${nextHop}.`,
      net: "0.0.0.0", cidr: 0, mask: "0.0.0.0", nextHop, ad: null,
      expected: `ip route 0.0.0.0 0.0.0.0 ${nextHop}`,
      hint: "Default-Route = Ziel 0.0.0.0 mit Maske 0.0.0.0.",
    };
  }
  if (scenario === "host") {
    const host = `10.${randInt(1, 50)}.${randInt(0, 250)}.${randInt(1, 254)}`;
    return {
      kind: "ip-route", scenario,
      prompt: `Konfiguriere eine Host-Route (/32) zu genau ${host} über ${nextHop}.`,
      net: host, cidr: 32, mask: "255.255.255.255", nextHop, ad: null,
      expected: `ip route ${host} 255.255.255.255 ${nextHop}`,
      hint: "Host-Route = /32 = Maske 255.255.255.255.",
    };
  }
  const { net, cidr } = randNet();
  const mask = maskString(cidr);
  if (scenario === "floating") {
    const ad = pick([120, 130, 150, 200, 250]);
    return {
      kind: "ip-route", scenario,
      prompt: `Konfiguriere eine Floating-Static-Backup-Route zu ${net}/${cidr} über ${nextHop} mit Administrative Distance ${ad}.`,
      net, cidr, mask, nextHop, ad,
      expected: `ip route ${net} ${mask} ${nextHop} ${ad}`,
      hint: "Floating Static = AD am Ende anhängen (höher als das Protokoll).",
    };
  }
  return {
    kind: "ip-route", scenario: "normal",
    prompt: `Konfiguriere eine statische Route zum Netz ${net}/${cidr} über den Next-Hop ${nextHop}.`,
    net, cidr, mask, nextHop, ad: null,
    expected: `ip route ${net} ${mask} ${nextHop}`,
    hint: `/${cidr} → dezimale Maske ${mask}.`,
  };
}

export interface IpRouteCheck {
  ok: boolean;
  reason?: string;
  normalized: string;
}

/** Prüft den getippten Befehl tolerant (Whitespace/Groß-Klein, ip route optional doppelt). */
export function checkIpRoute(input: string, task: IpRouteTask): IpRouteCheck {
  const norm = input.trim().toLowerCase().replace(/\s+/g, " ");
  // führenden CLI-Prompt (z. B. "r1(config)#") und optionales "do" entfernen
  const stripped = norm.replace(/^\S*#\s*/, "").replace(/^do\s+/, "");
  const toks = stripped.split(" ").filter(Boolean);
  if (toks[0] !== "ip" || toks[1] !== "route") {
    return { ok: false, normalized: norm, reason: "Befehl muss mit „ip route“ beginnen." };
  }
  const args = toks.slice(2);
  const exp = [task.net, task.mask, task.nextHop, ...(task.ad != null ? [String(task.ad)] : [])];
  if (args.length !== exp.length) {
    return { ok: false, normalized: norm, reason: task.ad != null ? "AD nicht vergessen." : "Anzahl Argumente passt nicht." };
  }
  for (let i = 0; i < exp.length; i++) {
    if (args[i] !== exp[i]) {
      const labels = ["Ziel-Netz", "Subnetzmaske", "Next-Hop", "AD"];
      return { ok: false, normalized: norm, reason: `${labels[i]} stimmt nicht (erwartet ${exp[i]}).` };
    }
  }
  return { ok: true, normalized: norm };
}

// ── Modus 2: Longest-Prefix-Match ───────────────────────────
export interface RouteEntry {
  proto: string;
  net: string;
  cidr: number;
  ad: number;
  metric: number;
  nextHop: string;
  iface: string;
}
export interface MatchTask {
  kind: "longest-match";
  table: RouteEntry[];
  dest: string;
  correctIndex: number; // Index in table; -1 = "verworfen (kein Match)"
  explanation: string;
}

const IFACES = ["GigabitEthernet0/0", "GigabitEthernet0/1", "Serial0/0/0", "Serial0/0/1"];

export function generateMatchTask(_id = 0): MatchTask {
  // gemeinsames Basisnetz, mehrere Präfixlängen, plus Ablenker + Default
  const base = `10.${randInt(10, 60)}.${randInt(0, 200)}.0`;
  const cidrs = [16, 24, 26, 28].sort(() => Math.random() - 0.5).slice(0, 3);
  const baseInt = ipToInt(base);
  const table: RouteEntry[] = cidrs.map((cidr, i) => {
    const netInt = networkAddr(baseInt, cidr);
    return {
      proto: pick(["O", "D", "R", "S"]),
      net: octetsToString([(netInt >>> 24) & 0xff, (netInt >>> 16) & 0xff, (netInt >>> 8) & 0xff, netInt & 0xff]),
      cidr,
      ad: pick([110, 90, 120, 1]),
      metric: randInt(2, 200),
      nextHop: `10.0.${randInt(0, 9)}.${randInt(1, 254)}`,
      iface: IFACES[i % IFACES.length],
    };
  });
  // Ablenker-Netz (anderes Basisnetz, deckt das Ziel NICHT)
  table.push({
    proto: "O", net: `192.168.${randInt(0, 50)}.0`, cidr: 24, ad: 110, metric: 20,
    nextHop: `10.0.9.${randInt(1, 254)}`, iface: "GigabitEthernet0/2",
  });
  // Default-Route
  const def: RouteEntry = {
    proto: "S*", net: "0.0.0.0", cidr: 0, ad: 1, metric: 0,
    nextHop: `203.0.113.${randInt(1, 254)}`, iface: "Serial0/0/1",
  };
  table.push(def);

  // Ziel-IP: liegt im engsten Präfix (damit Longest-Match eindeutig ist)
  const tightest = [...table].filter((r) => r.cidr > 0).sort((a, b) => b.cidr - a.cidr)[0];
  const tInt = ipToInt(tightest.net);
  const dest = octetsToString([
    (tInt >>> 24) & 0xff, (tInt >>> 16) & 0xff, (tInt >>> 8) & 0xff, ((tInt & 0xff) + 1) & 0xff,
  ]);

  // korrekte Route = längstes Präfix, das dest enthält
  let best = -1, bestLen = -1;
  table.forEach((r, i) => {
    if (r.cidr === 0) return;
    if (contains(r.net, r.cidr, dest) && r.cidr > bestLen) { best = i; bestLen = r.cidr; }
  });
  const defIdx = table.findIndex((r) => r.cidr === 0);
  const correctIndex = best >= 0 ? best : defIdx;
  const chosen = table[correctIndex];
  const explanation =
    best >= 0
      ? `${dest} liegt im längsten passenden Präfix ${chosen.net}/${chosen.cidr}. Longest Prefix Match gewinnt → via ${chosen.nextHop}, ${chosen.iface}.`
      : `Keine spezifische Route enthält ${dest} → Default-Route 0.0.0.0/0 via ${chosen.nextHop}.`;

  // Tabelle in Anzeige-Reihenfolge mischen
  const order = table.map((_, i) => i).sort(() => Math.random() - 0.5);
  const shuffled = order.map((i) => table[i]);
  return {
    kind: "longest-match",
    table: shuffled,
    dest,
    correctIndex: order.indexOf(correctIndex),
    explanation,
  };
}

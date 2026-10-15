import { createHash } from "node:crypto";
import { ccnaDragDropQuestions, type DragDropQuestion } from "@/data/ccnaDragDrop";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";

/**
 * Inhalts-Snapshot der Prüfungsfragen: je Frage Prüfsummen von Fragetext, Optionen, Lösung, Exhibit-Inhalten
 * (Gerätenamen, Interface-Namen, Subnetze, Label-Texte, Verbindungen, CLI, Tabellen, Zonen) und übrigen Feldern.
 * Reine Layout-Felder (Koordinaten x/y/r, Label-Position) gehen nicht ein: Layout-Korrekturen ändern keine Prüfsumme.
 */

export const SNAPSHOT_VERSION = 1;
export type FieldHashes = Record<string, string>;
export interface ContentSnapshot {
  version: number;
  pools: Record<string, Record<string, FieldHashes>>;
}

const sortKeys = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === "object") {
    return Object.fromEntries(
      Object.keys(v as Record<string, unknown>)
        .sort()
        .map((k) => [k, sortKeys((v as Record<string, unknown>)[k])])
    );
  }
  return v;
};

export const hashOf = (v: unknown): string =>
  createHash("sha256")
    .update(JSON.stringify(sortKeys(v)) ?? "undefined")
    .digest("hex")
    .slice(0, 16);

const ABSENT = "-";
const omit = (o: Record<string, unknown>, keys: string[]): Record<string, unknown> => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k)));

type Obj = Record<string, unknown>;
const asObjs = (v: unknown): Obj[] => (Array.isArray(v) ? (v as Obj[]) : []);

/** Exhibit-Feld einer Frage als Liste einzelner Exhibit-Objekte plus Art-Kennung. */
function exhibitParts(field: unknown): { kinds: string[]; items: Obj[] } {
  if (field === undefined || field === null) return { kinds: ["fehlt"], items: [] };
  if (typeof field === "boolean") return { kinds: [`bool:${field}`], items: [] };
  const list = Array.isArray(field) ? (field as unknown[]) : [field];
  const kinds: string[] = [];
  const items: Obj[] = [];
  for (const e of list) {
    if (e && typeof e === "object") {
      const o = e as Obj;
      if ("needsExhibit" in o) kinds.push("needsExhibit");
      else {
        kinds.push(String(o.type ?? "unbekannt"));
        items.push(o);
      }
    } else kinds.push(`roh:${String(e)}`);
  }
  return { kinds, items };
}

/** Exhibit ohne Layout-Felder: Geräte x/y, Label-Position, Zonen x/y/r. */
function stripLayout(e: Obj): Obj {
  if (e.type === "topology") {
    return {
      ...e,
      devices: asObjs(e.devices).map((d) => omit(d, ["x", "y"])),
      labels: e.labels === undefined ? undefined : asObjs(e.labels).map((l) => omit(l, ["position"])),
    };
  }
  if (e.type === "wireless-zones") return { ...e, zones: asObjs(e.zones).map((z) => omit(z, ["x", "y", "r"])) };
  return e;
}

function exhibitHashes(field: unknown): FieldHashes {
  const { kinds, items } = exhibitParts(field);
  const pick = (type: string) => items.filter((i) => i.type === type);
  const topo = pick("topology");
  const cli = pick("cli");
  const table = pick("table");
  const zones = pick("wireless-zones");
  const maybe = (arr: unknown[]) => (arr.length === 0 ? ABSENT : hashOf(arr));
  return {
    exhibitKind: kinds.join("+"),
    exhibitDevices: maybe(topo.flatMap((t) => asObjs(t.devices).map((d) => omit(d, ["x", "y"])))),
    exhibitLinks: maybe(topo.flatMap((t) => asObjs(t.links).map((l) => ({ from: l.from, to: l.to })))),
    exhibitInterfaces: maybe(topo.flatMap((t) => asObjs(t.links).map((l) => ({ labelFrom: l.labelFrom, labelTo: l.labelTo })))),
    exhibitSubnets: maybe(topo.flatMap((t) => asObjs(t.links).map((l) => l.subnet))),
    exhibitLabels: maybe(topo.flatMap((t) => asObjs(t.labels).map((l) => omit(l, ["position"])))),
    exhibitCli: maybe(cli),
    exhibitTable: maybe(table),
    exhibitZones: maybe(zones.flatMap((z) => asObjs(z.zones).map((x) => omit(x, ["x", "y", "r"])))),
    exhibitAll: hashOf(items.map(stripLayout)),
  };
}

const HANDLED = ["id", "question", "options", "correct", "exhibit"];

export function snapshotQuestion(q: object): FieldHashes {
  const o = q as Obj;
  return {
    text: hashOf(o.question),
    options: hashOf(o.options),
    correct: hashOf(o.correct),
    meta: hashOf(omit(o, HANDLED)),
    ...exhibitHashes(o.exhibit),
  };
}

export function snapshotDragDrop(q: DragDropQuestion): FieldHashes {
  const o = q as unknown as Obj;
  return {
    instruction: hashOf(q.instruction),
    context: q.context === undefined ? ABSENT : hashOf(q.context),
    targets: hashOf(q.targets),
    items: hashOf(q.items),
    explanation: q.explanation === undefined ? ABSENT : hashOf(q.explanation),
    meta: hashOf(omit(o, ["id", "instruction", "context", "targets", "items", "explanation"])),
  };
}

export function buildSnapshot(): ContentSnapshot {
  // doppelte IDs innerhalb eines Pools bekommen das Suffix ~2, ~3 (Reihenfolge der Datei)
  const pool = (list: Array<{ id: string }>, fn: (q: never) => FieldHashes) => {
    const seen = new Map<string, number>();
    return Object.fromEntries(
      list.map((q) => {
        const n = (seen.get(q.id) ?? 0) + 1;
        seen.set(q.id, n);
        return [n === 1 ? q.id : `${q.id}~${n}`, fn(q as never)];
      })
    );
  };
  return {
    version: SNAPSHOT_VERSION,
    pools: {
      ccnaQuestions: pool(ccnaQuestions, snapshotQuestion),
      ccnaQuestionsClassified: pool(ccnaQuestionsClassified, snapshotQuestion),
      ccnaDragDrop: pool(ccnaDragDropQuestions, snapshotDragDrop),
    },
  };
}

/** Vergleicht zwei Snapshots; jede Abweichung nennt Pool, Frage-ID und Feld. */
export function compareSnapshots(expected: ContentSnapshot, actual: ContentSnapshot): string[] {
  const violations: string[] = [];
  if (expected.version !== actual.version) violations.push(`Snapshot-Version ${expected.version} erwartet, ${actual.version} berechnet`);
  const names = new Set([...Object.keys(expected.pools), ...Object.keys(actual.pools)]);
  for (const name of names) {
    const exp = expected.pools[name];
    const act = actual.pools[name];
    if (!exp) {
      violations.push(`${name}: Pool fehlt im Snapshot`);
      continue;
    }
    if (!act) {
      violations.push(`${name}: Pool fehlt im Code`);
      continue;
    }
    for (const id of Object.keys(exp)) {
      if (!act[id]) {
        violations.push(`${name} ${id}: Frage entfernt`);
        continue;
      }
      const fields = new Set([...Object.keys(exp[id]), ...Object.keys(act[id])]);
      for (const f of fields) if (exp[id][f] !== act[id][f]) violations.push(`${name} ${id}: ${f} geändert`);
    }
    for (const id of Object.keys(act)) if (!exp[id]) violations.push(`${name} ${id}: Frage neu (nicht im Snapshot)`);
  }
  return violations;
}

import { describe, it } from "vitest";
import { BLUEPRINT_DOMAINS } from "@/lib/dashboard-blueprint-config";
import ccnaModule from "@/content/modules/ccna";

describe("AUDIT Blueprint-Zuordnung", () => {
  it("Lektion -> Bereich", () => {
    const topics: any[] = (ccnaModule as any).topics;
    console.log("Anzahl Lektionen:", topics.length);
    const domOf = new Map<string, string[]>();
    for (const d of BLUEPRINT_DOMAINS) for (const id of d.topicIds) domOf.set(id, [...(domOf.get(id) ?? []), `${d.number} ${d.title}`]);
    console.log("\n| Lektion (id) | Titel | Bereich(e) in dashboard-blueprint-config |\n|---|---|---|");
    for (const t of topics) console.log(`| ${t.id} | ${t.title} | ${(domOf.get(t.id) ?? ["— KEINER —"]).join("; ")} |`);
    const ids = new Set(topics.map((t) => t.id));
    console.log("\nIDs in Config ohne existierende Lektion:", JSON.stringify([...domOf.keys()].filter((k) => !ids.has(k))));
    console.log("Lektionen ohne Bereich:", JSON.stringify(topics.filter((t) => !domOf.has(t.id)).map((t) => t.id)));
    console.log("Subtopics mit topicId ausserhalb topicIds der Domain / unbekannt:");
    for (const d of BLUEPRINT_DOMAINS) for (const s of d.subtopics) if (s.topicId && !d.topicIds.includes(s.topicId)) console.log(" ", d.number, s.code, s.topicId);
    console.log("Summe Gewichte:", BLUEPRINT_DOMAINS.reduce((a, d) => a + d.weightPercent, 0));
  });
});

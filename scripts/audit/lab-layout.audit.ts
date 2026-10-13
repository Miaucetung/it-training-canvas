import { describe, it } from "vitest";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { boxesOverlap, buildBoxes, offGridProblems, zoneBadgeProblems } from "@/components/labs/topology-geometry";

// Listet Layout-Probleme (Überlappungen, Zonen-Beschriftung, Raster) je Lab. Aufruf mit AUDIT_LABS=a,b (optional).
describe("AUDIT lab-layout", () => {
  it("dump", () => {
    const ids = (process.env.AUDIT_LABS ?? Object.keys(CURATED_TOPOLOGIES).join(",")).split(",");
    for (const id of ids) {
      const t = CURATED_TOPOLOGIES[id];
      const boxes = buildBoxes(t);
      const overlaps: string[] = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (boxesOverlap(boxes[i], boxes[j])) overlaps.push(`${boxes[i].id}~${boxes[j].id}`);
      console.log(`${id}: overlaps=${JSON.stringify(overlaps)} zones=${JSON.stringify(zoneBadgeProblems(t))} grid=${JSON.stringify(offGridProblems(t))}`);
    }
  });
});

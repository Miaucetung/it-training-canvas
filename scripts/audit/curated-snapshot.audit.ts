import { describe, it } from "vitest";
import { writeFileSync } from "node:fs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";

describe("AUDIT snapshot", () => {
  it("schreibt JSON der kuratierten Topologien", () => {
    const out = process.env.AUDIT_SNAPSHOT_OUT!;
    const ids = (process.env.AUDIT_SNAPSHOT_IDS ?? "").split(",").filter(Boolean);
    const pick = Object.fromEntries(Object.entries(CURATED_TOPOLOGIES).filter(([k]) => !ids.length || ids.includes(k)));
    writeFileSync(out, JSON.stringify(pick, null, 1));
  });
});

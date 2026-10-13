import { describe, it } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";

describe("AUDIT labs", () => {
  it("zaehlt Labs und prueft IDs", () => {
    const ids = LABS.map((l) => l.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    console.log("LABS.length =", LABS.length);
    console.log("Duplikate:", JSON.stringify(dup));
    console.log("kuratierte Topologien:", Object.keys(CURATED_TOPOLOGIES).join(", "));
    const missing = Object.keys(CURATED_TOPOLOGIES).filter((id) => !ids.includes(id));
    console.log("kuratiert ohne Lab:", JSON.stringify(missing));
    console.log("Lab-IDs:\n" + ids.join("\n"));
  });
});

import { LABS_ORDERED } from "@/components/labs";
import { DRILL_LABS } from "@/components/labs/drills";
import { LAYER2_LABS } from "@/components/labs/layer2";
import { ROUTING_LABS } from "@/components/labs/routing";
import { IPV6_LABS } from "@/components/labs/ipv6";
import { SERVICES_LABS } from "@/components/labs/services";
import { SECURITY_LABS } from "@/components/labs/security";
import { AUTOMATION_LABS } from "@/components/labs/automation";
import { OPERATIONS_LABS } from "@/components/labs/operations";
import { CAMPUS_LABS } from "@/components/labs/campus";

describe("AUDIT labs: Katalog/Badge", () => {
  it("LABS_ORDERED vs LABS vs Kategorien", () => {
    const cats = [DRILL_LABS, LAYER2_LABS, ROUTING_LABS, IPV6_LABS, SERVICES_LABS, SECURITY_LABS, AUTOMATION_LABS, OPERATIONS_LABS, CAMPUS_LABS];
    const sum = cats.reduce((a, c) => a + c.length, 0);
    console.log("LABS_ORDERED.length =", LABS_ORDERED.length);
    console.log("Summe Kategorie-Arrays =", sum, cats.map((c) => c.length).join("+"));
    const inCat = new Set(cats.flat().map((l) => l.id));
    console.log("Labs ohne Kategorie:", JSON.stringify(LABS.filter((l) => !inCat.has(l.id)).map((l) => l.id)));
  });
});

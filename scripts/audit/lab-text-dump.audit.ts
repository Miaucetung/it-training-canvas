import { describe, it } from "vitest";
import { LABS } from "@/components/labs";

// Gibt Topologie-Beschreibung (connections/devices/hint) und ALLE CLI-Blöcke der vier Labs aus.
describe("AUDIT lab-text", () => {
  it("dump", () => {
    for (const id of ["basic-ip", "vlan-trunking", "roas", "ospf"]) {
      const lab = LABS.find((l) => l.id === id)!;
      console.log(`\n===== ${id}`);
      console.log("DEVICES:", JSON.stringify(lab.topology.devices));
      console.log("CONNECTIONS:", JSON.stringify(lab.topology.connections));
      console.log("DESC:", lab.topology.description);
      for (const s of lab.steps) {
        console.log(`-- STEP ${s.title}`);
        for (const b of s.blocks as any[]) {
          console.log(`  [${b.device}] ${b.modeLabel}`);
          for (const c of b.commands) console.log("     " + String(c.cmd).replace(/\n/g, "\n     "));
        }
      }
    }
  });
});

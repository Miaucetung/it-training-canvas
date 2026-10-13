import { describe, it } from "vitest";
import { LABS } from "@/components/labs";

// Gibt Topologie-Beschreibung und ALLE CLI-Blöcke der Labs aus (IDs per Umgebungsvariable AUDIT_LABS, kommagetrennt).
describe("AUDIT lab-text", () => {
  it("dump", () => {
    const ids = (process.env.AUDIT_LABS ?? "basic-ip,vlan-trunking,roas,ospf").split(",");
    for (const id of ids) {
      const lab = LABS.find((l) => l.id === id)!;
      console.log(`\n===== ${id} :: ${lab.title}`);
      console.log("DEVICES:", JSON.stringify(lab.topology.devices));
      console.log("CONNECTIONS:", JSON.stringify(lab.topology.connections));
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

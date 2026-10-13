import { describe, it } from "vitest";
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

// Bestandsaufnahme aller Labs: Topologie-Angaben, Konfigurationsblöcke, IPs, Interfaces.
const CATS: Array<[string, { id: string }[]]> = [
  ["drills", DRILL_LABS],
  ["layer2", LAYER2_LABS],
  ["routing", ROUTING_LABS],
  ["ipv6", IPV6_LABS],
  ["services", SERVICES_LABS],
  ["security", SECURITY_LABS],
  ["automation", AUTOMATION_LABS],
  ["operations", OPERATIONS_LABS],
  ["campus", CAMPUS_LABS],
];

describe("AUDIT lab-inventar", () => {
  it("dump", () => {
    for (const lab of LABS_ORDERED as any[]) {
      const cat = CATS.find(([, arr]) => arr.some((l) => l.id === lab.id))?.[0];
      const t = lab.topology;
      const devs = new Map<string, { ifaces: Set<string>; ips: Set<string>; cmds: number; vlans: Set<string> }>();
      for (const s of lab.steps) {
        for (const b of s.blocks as any[]) {
          const d = devs.get(b.device) ?? { ifaces: new Set(), ips: new Set(), cmds: 0, vlans: new Set() };
          for (const c of b.commands) {
            const cmd = String(c.cmd);
            d.cmds++;
            for (const m of cmd.matchAll(/^\s*interface\s+(?:range\s+)?(\S+(?:\s*-\s*\S+)?)/gim)) d.ifaces.add(m[1]);
            for (const m of cmd.matchAll(/(?:ip|ipv6) address\s+([0-9a-fA-F:.\/]+)(?:\s+([0-9.]+))?/g)) d.ips.add(m[1] + (m[2] ? " " + m[2] : ""));
            for (const m of cmd.matchAll(/IP(?:v[46])?[- ]?Add?ress?e?\s*:\s*(\S+)/gi)) d.ips.add(m[1]);
            if (/DHCP/i.test(cmd) && /^\s*(IP|Desktop)/im.test(cmd)) d.ips.add("(DHCP)");
            for (const m of cmd.matchAll(/^\s*vlan\s+(\d+)/gim)) d.vlans.add(m[1]);
          }
          devs.set(b.device, d);
        }
      }
      console.log(`\n### ${lab.id} | ${cat} | ${lab.title} | ${lab.difficulty} | steps=${lab.steps.length} | structured=${lab.structuredTopology ? "ja" : "nein"}`);
      console.log(`  TOPO.devices: ${JSON.stringify(t?.devices?.map((d: any) => `${d.count}x ${d.type}:${d.label}`))}`);
      console.log(`  TOPO.connections: ${JSON.stringify(t?.connections)}`);
      console.log(`  TOPO.diagramJSX: ${t?.topologyDiagram ? "ja" : "nein"}`);
      for (const [name, d] of devs) {
        console.log(`  [${name}] cmds=${d.cmds} if=${[...d.ifaces].join(",")} ip=${[...d.ips].join(",")} vlan=${[...d.vlans].join(",")}`);
      }
    }
  });
});

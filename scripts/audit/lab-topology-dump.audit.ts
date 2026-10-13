import { describe, it } from "vitest";
import { LABS } from "@/components/labs";

// Gibt Topologie (strukturiert) und CLI-Befehle (ip address / vlan / switchport / network / interface) je Lab aus.
describe("AUDIT lab-topologie-dump", () => {
  it("dump", () => {
    for (const id of ["basic-ip", "vlan-trunking", "roas", "ospf"]) {
      const lab = LABS.find((l) => l.id === id)!;
      const t = lab.structuredTopology!;
      console.log(`\n===== ${id} :: ${lab.title ?? ""}`);
      console.log("DEVICES:", t.devices.map((d) => `${d.name}[${d.type}${d.model ? "," + d.model : ""}]`).join(" "));
      for (const l of t.links) {
        const a = t.devices.find((d) => d.id === l.from)?.name, b = t.devices.find((d) => d.id === l.to)?.name;
        console.log(`LINK ${a}:${l.fromPort}(${l.fromIp ?? ""}) <-> ${b}:${l.toPort}(${l.toIp ?? ""}) ${l.isTrunk ? "TRUNK" : ""} vlan=${l.vlan ?? ""} ${l.subnetLabel ?? ""} ${l.cableType ?? ""}`);
      }
      console.log("VLANS:", JSON.stringify(t.vlans));
      for (const r of t.addressingTable) console.log(`ADDR ${r.device} ${r.interface} ${r.ip} ${r.subnetMask} gw=${r.defaultGateway ?? ""} vlan=${r.vlan ?? ""}`);
      console.log("--- CLI-Zeilen im Lab");
      for (const s of lab.steps) for (const b of s.blocks as any[]) {
        const lines: string[] = (b.commands ?? b.lines ?? []).map((c: any) => (typeof c === "string" ? c : c.cmd ?? c.command ?? JSON.stringify(c)));
        const dev = b.device ?? b.deviceName ?? "";
        for (const ln of lines) if (/^(hostname|interface|int |ip address|ipv6|vlan|name|switchport|network|router|encapsulation|ip default|ip route|passive|no shut)/i.test(ln.trim())) console.log(`  [${dev}] ${ln}`);
      }
    }
  });
});

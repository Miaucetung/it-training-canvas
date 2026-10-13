import { describe, it } from "vitest";
import { LABS } from "@/components/labs";

describe("AUDIT lab-topo-full", () => {
  it("dump", () => {
    for (const id of ["vlan-dhcp-nat-roas", "ipsec-s2s-vpn", "co-acl-nat-isp", "nat-pat", "ospf-dr-bdr-election", "ipv6-ospfv3-eigrpv6", "dhcp-relay", "ntp-syslog-snmp"]) {
      const t = (LABS.find((l) => l.id === id) as any).topology;
      console.log(`\n== ${id}\nDEVICES: ${JSON.stringify(t.devices.map((d: any) => `${d.count}x ${d.type}:${d.label}`), null, 0)}\nCONN:\n- ${t.connections.join("\n- ")}`);
    }
  });
});

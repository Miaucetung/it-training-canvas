import type { TopologyDevice } from "@/types/topology";

const ipToInt = (ip: string): number => ip.split(".").reduce((acc, o) => acc * 256 + Number(o), 0);

export function hasDhcpPools(device: TopologyDevice): boolean {
  return (device.config?.dhcpPools?.length ?? 0) > 0;
}

/** Host-Bereich eines Pool-Netzes ("a.b.c.d/p"): erste und letzte vergebbare Adresse. */
function hostRange(network: string): { first: number; last: number } | null {
  const m = /^(\d+(?:\.\d+){3})\/(\d+)$/.exec(network);
  if (!m) return null;
  const p = Number(m[2]);
  if (p > 30) return null;
  const size = 2 ** (32 - p);
  const net = Math.floor(ipToInt(m[1]) / size) * size;
  return { first: net + 1, last: net + size - 2 };
}

/** Anzahl der Adressen im Host-Bereich, die von `ip dhcp excluded-address` abgedeckt werden (überlappende Bereiche zählen einmal). */
function excludedInRange(range: { first: number; last: number }, excluded: Array<{ from: string; to: string }>): number {
  const spans = excluded
    .map((e) => [Math.max(ipToInt(e.from), range.first), Math.min(ipToInt(e.to), range.last)] as const)
    .filter(([a, b]) => a <= b)
    .sort((x, y) => x[0] - y[0]);
  let total = 0;
  let curEnd = -1;
  for (const [a, b] of spans) {
    const start = Math.max(a, curEnd + 1);
    if (b >= start) total += b - start + 1;
    curEnd = Math.max(curEnd, b);
  }
  return total;
}

const row = (label: string, value: string) => ` ${label.padEnd(30)} : ${value}`;

export function formatShowIpDhcpPool(device: TopologyDevice): string {
  const pools = device.config?.dhcpPools ?? [];
  const excluded = device.config?.dhcpExcluded ?? [];
  const blocks = pools.map((pool) => {
    const range = pool.network ? hostRange(pool.network) : null;
    const lines = [`Pool ${pool.name} :`];
    lines.push(row("Network", pool.network ?? "im Lab nicht angegeben"));
    lines.push(row("Total addresses", range ? String(range.last - range.first + 1) : "nicht bestimmbar"));
    lines.push(row("Leased addresses", "0 (entsteht erst nach DHCP-Anfragen)"));
    lines.push(row("Excluded addresses", range ? String(excludedInRange(range, excluded)) : "nicht bestimmbar"));
    if (pool.defaultRouter) lines.push(row("Default router", pool.defaultRouter));
    if (pool.dnsServers?.length) lines.push(row("DNS server", pool.dnsServers.join(" ")));
    if (pool.lease) lines.push(row("Lease", pool.lease));
    return lines.join("\n");
  });
  if (excluded.length > 0) {
    blocks.push(
      ["Ausgeschlossene Adressen (ip dhcp excluded-address):", ...excluded.map((e) => (e.from === e.to ? ` ${e.from}` : ` ${e.from} - ${e.to}`))].join("\n")
    );
  }
  return blocks.join("\n\n");
}

export function formatShowIpDhcpBinding(): string {
  return [
    "Bindings from all pools not associated with VRF:",
    "IP address          Client-ID/              Lease expiration        Type",
    "                    Hardware address/",
    "                    User name",
    "(keine Bindungen: entsteht erst nach DHCP-Anfragen; die vergebene Adresse hängt von der Reihenfolge der Anfragen ab)",
  ].join("\n");
}

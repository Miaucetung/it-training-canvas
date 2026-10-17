import type { NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";

/**
 * Simulierte DHCP-Vergabe für die Paket-Simulation.
 *
 * Deterministisch: Clients in der Reihenfolge der Topologie, je Client die niedrigste freie Adresse des Pools
 * nach `ip dhcp excluded-address`, ohne Netz-/Broadcast-Adresse und ohne Adressen, die bereits statisch auf einem
 * Interface liegen (IOS erkennt solche Konflikte per Ping und vergibt sie nicht).
 * Die Vergabe gilt nur innerhalb der Simulation; die Topologie selbst (und `show ip dhcp binding`) bleibt unverändert.
 */

export interface SimulatedLease {
  deviceId: string;
  deviceName: string;
  ifaceName: string;
  /** Adresse mit Präfix, z. B. "192.168.1.11/24" */
  ip: string;
  gateway?: string;
  poolName: string;
  serverName: string;
}

/** Erreichbarkeit: Eingangs-Interface des Servers, an dem der DHCP-Discover des Clients ankommt (oder null). */
export type DhcpReachability = (client: TopologyDevice, clientIface: TopologyInterface, server: TopologyDevice) => TopologyInterface | null;

const ipToInt = (ip: string): number => ip.split(".").reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0;
const intToIp = (n: number): string => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

function parseCidr(cidr: string): { net: number; prefix: number } | null {
  const [ip, p] = cidr.split("/");
  const prefix = Number(p);
  if (!ip || Number.isNaN(prefix)) return null;
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return { net: (ipToInt(ip) & mask) >>> 0, prefix };
}

function inNetwork(ip: string, net: { net: number; prefix: number }): boolean {
  const mask = net.prefix === 0 ? 0 : (~0 << (32 - net.prefix)) >>> 0;
  return ((ipToInt(ip.split("/")[0]) & mask) >>> 0) === net.net;
}

export function assignSimulatedLeases(
  topology: NetworkTopology,
  reach: DhcpReachability,
): { topology: NetworkTopology; leases: SimulatedLease[] } {
  const clients = topology.devices.flatMap((d) =>
    d.interfaces.filter((i) => i.dhcp && !i.ip).map((i) => ({ device: d, iface: i })),
  );
  if (clients.length === 0) return { topology, leases: [] };

  const t: NetworkTopology = structuredClone(topology);
  const used = new Set<number>();
  for (const d of t.devices) {
    for (const i of d.interfaces) if (i.ip) used.add(ipToInt(i.ip.split("/")[0]));
    for (const svi of d.config?.svis ?? []) if (svi.ip) used.add(ipToInt(svi.ip.split("/")[0]));
  }

  const leases: SimulatedLease[] = [];
  for (const { device, iface } of clients) {
    const client = t.devices.find((d) => d.id === device.id)!;
    const clientIface = client.interfaces.find((i) => i.id === iface.id)!;
    let leased = false;
    for (const server of t.devices) {
      if (leased) break;
      for (const pool of server.config?.dhcpPools ?? []) {
        if (!pool.network) continue;
        const net = parseCidr(pool.network);
        if (!net) continue;
        // Discover muss das Server-Interface im Pool-Netz erreichen
        const arrival = reach(client, clientIface, server);
        if (!arrival?.ip || !inNetwork(arrival.ip, net)) continue;

        const excluded = (n: number) =>
          (server.config?.dhcpExcluded ?? []).some((x) => n >= ipToInt(x.from) && n <= ipToInt(x.to));
        const size = 2 ** (32 - net.prefix);
        for (let k = 1; k < size - 1; k++) {
          const candidate = (net.net + k) >>> 0;
          if (excluded(candidate) || used.has(candidate)) continue;
          used.add(candidate);
          const ip = `${intToIp(candidate)}/${net.prefix}`;
          clientIface.ip = ip;
          if (pool.defaultRouter && !client.config?.defaultGateway) {
            client.config = { ...(client.config ?? { hostname: client.name }), defaultGateway: pool.defaultRouter };
          }
          leases.push({
            deviceId: client.id,
            deviceName: client.name,
            ifaceName: clientIface.name,
            ip,
            ...(pool.defaultRouter ? { gateway: pool.defaultRouter } : {}),
            poolName: pool.name,
            serverName: server.config?.hostname ?? server.name,
          });
          leased = true;
          break;
        }
        if (leased) break;
      }
    }
  }
  return { topology: t, leases };
}

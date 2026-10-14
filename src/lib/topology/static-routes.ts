import type { DeviceStaticRoute, TopologyDevice } from "@/types/topology";

const ipToNum = (ip: string) => ip.split(".").reduce((a, o) => a * 256 + Number(o), 0);

function cidrParts(cidr: string): { net: number; prefix: number } | null {
  const m = /^(\d+(?:\.\d+){3})\/(\d+)$/.exec(cidr);
  if (!m) return null;
  const prefix = Number(m[2]);
  const size = 2 ** (32 - prefix);
  return { net: Math.floor(ipToNum(m[1]) / size) * size, prefix };
}

export function ipInCidr(ip: string, cidr: string): boolean {
  const c = cidrParts(cidr);
  if (!c) return false;
  const size = 2 ** (32 - c.prefix);
  return Math.floor(ipToNum(ip) / size) * size === c.net;
}

const interfaceUp = (device: TopologyDevice, name: string) => {
  const i = device.interfaces.find((x) => x.name === name);
  return !!i && i.status === "up" && !i.isShutdown;
};

/** Verbundenes Netz (Interface up, mit IP), das die Adresse enthält. */
export function connectedInterfaceFor(device: TopologyDevice, ip: string): string | null {
  for (const i of device.interfaces) {
    if (!i.ip || i.status !== "up" || i.isShutdown) continue;
    if (ipInCidr(ip, i.ip)) return i.name;
  }
  return null;
}

export interface InstalledStaticRoute {
  route: DeviceStaticRoute;
  distance: number;
  /** ausgehendes Interface (aus dem Next Hop abgeleitet oder angegeben) */
  outInterface: string;
}

/** Statische Routen, die in die Routing-Tabelle gelangen: der Next Hop muss in einem aktiven verbundenen Netz liegen, ein angegebenes Interface muss aktiv sein. */
export function installedStaticRoutes(device: TopologyDevice): InstalledStaticRoute[] {
  const out: InstalledStaticRoute[] = [];
  for (const route of device.config?.ipRoutes ?? []) {
    const distance = route.distance ?? 1;
    if (route.outInterface && !route.nextHop) {
      if (/^null0$/i.test(route.outInterface)) out.push({ route, distance, outInterface: "Null0" });
      else if (interfaceUp(device, route.outInterface)) out.push({ route, distance, outInterface: route.outInterface });
      continue;
    }
    if (route.nextHop) {
      const via = route.outInterface && interfaceUp(device, route.outInterface) ? route.outInterface : connectedInterfaceFor(device, route.nextHop);
      if (via) out.push({ route, distance, outInterface: via });
    }
  }
  return out;
}

/** Kennt das Gerät einen Weg zur Adresse (verbundenes Netz oder installierte statische Route, auch Default)? */
export function hasRouteTo(device: TopologyDevice, ip: string): boolean {
  if (connectedInterfaceFor(device, ip)) return true;
  return installedStaticRoutes(device).some((r) => ipInCidr(ip, r.route.network));
}

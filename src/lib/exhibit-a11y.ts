import type { TopologyExhibit, WirelessZonesExhibit } from "@/types/exhibit";

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Zugänglicher Name einer Topologie-Grafik, nur aus den Daten: Gerätenamen und Zahl der Verbindungen. */
export function topologyAriaLabel(exhibit: Pick<TopologyExhibit, "devices" | "links">): string {
  const names = exhibit.devices.map((d) => clean(d.label)).filter(Boolean);
  const parts = [...names, plural(exhibit.links.length, "Verbindung", "Verbindungen")];
  return `Topologie: ${parts.join(", ")}`;
}

/** Zugänglicher Name einer Funkzonen-Grafik, nur aus den Daten: Zonennamen und Kanäle. */
export function wirelessZonesAriaLabel(exhibit: Pick<WirelessZonesExhibit, "zones">): string {
  const names = exhibit.zones.map((z) => clean(z.label)).filter(Boolean);
  const channels = [...new Set(exhibit.zones.map((z) => z.channel))].sort((a, b) => a - b);
  const parts = [...names, `Kanal ${channels.join(", ")}`];
  return `Funkzonen: ${parts.join(", ")}`;
}

import type { DeviceNatStatic, TopologyDevice } from "@/types/topology";

export function hasNatConfig(device: TopologyDevice): boolean {
  const nat = device.config?.nat;
  return !!nat && (nat.statics.length > 0 || nat.rules.length > 0 || nat.pools.length > 0);
}

const col = (v: string, w: number) => v.padEnd(w);

function staticRow(s: DeviceNatStatic): string {
  const withPort = (ip: string, port?: number) => (port !== undefined ? `${ip}:${port}` : ip);
  const proto = s.protocol ?? "---";
  return `${col(proto, 5)}${col(withPort(s.global, s.globalPort), 24)}${col(withPort(s.local, s.localPort), 24)}${col("---", 19)}---`;
}

/**
 * `show ip nat translations`: statische Einträge stehen mit der Konfiguration in der Tabelle.
 * Dynamische Übersetzungen entstehen erst durch Verkehr und werden nicht erfunden.
 */
export function formatShowIpNatTranslations(device: TopologyDevice): string {
  const nat = device.config?.nat;
  if (!nat) return "";
  const lines = [`${col("Pro", 5)}${col("Inside global", 24)}${col("Inside local", 24)}${col("Outside local", 19)}Outside global`];
  for (const s of nat.statics) lines.push(staticRow(s));
  const notes: string[] = [];
  for (const r of nat.rules) {
    const pool = r.pool ? nat.pools.find((p) => p.name === r.pool) : undefined;
    const target = r.pool
      ? `Pool ${r.pool}${pool ? ` (${pool.start} - ${pool.end})` : " (im Lab nicht definiert)"}`
      : `Interface ${r.interface}`;
    notes.push(`% Dynamisch: ACL ${r.acl} → ${target}${r.overload ? ", Overload (PAT)" : ""}: Einträge entstehen erst nach Verkehr.`);
  }
  if (notes.length > 0) lines.push("", ...notes);
  if (nat.statics.length === 0 && notes.length === 0) lines.push("", "% Keine Übersetzungen konfiguriert.");
  return lines.join("\n");
}

/** Hinweise für den Inspector. */
export function natHints(device: TopologyDevice): string[] {
  const nat = device.config?.nat;
  if (!nat || !hasNatConfig(device)) return [];
  const hints: string[] = [];
  if (nat.insideInterfaces.length === 0 || nat.outsideInterfaces.length === 0) {
    const missing = [nat.insideInterfaces.length === 0 ? "ip nat inside" : "", nat.outsideInterfaces.length === 0 ? "ip nat outside" : ""].filter(Boolean).join(" und ");
    hints.push(`NAT ist konfiguriert, aber ${missing} fehlt an den Interfaces: es wird nicht übersetzt.`);
  }
  if (nat.rules.some((r) => r.pool && !r.overload)) {
    hints.push("Dynamisches NAT ohne Overload: pro privater Adresse wird eine Pool-Adresse belegt; die Anzahl gleichzeitiger Hosts ist durch den Pool begrenzt.");
  }
  if (nat.rules.length > 0) hints.push("Dynamische Übersetzungen erscheinen erst nach Verkehr in der Tabelle.");
  return hints;
}

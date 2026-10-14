import type { DeviceCryptoMapEntry, NetworkTopology, TopologyDevice, TopologyInterface } from "@/types/topology";
import { longInterfaceName } from "./gre-tunnel";

const baseIp = (cidr?: string) => (cidr ?? "").split("/")[0];
const nameOf = (d: TopologyDevice) => d.config?.hostname ?? d.name;

export function hasCryptoConfig(device: TopologyDevice): boolean {
  const c = device.config?.crypto;
  return !!c && (c.maps.length > 0 || c.policies.length > 0 || c.keys.length > 0 || c.transformSets.length > 0);
}

const interfacesUsing = (device: TopologyDevice, mapName: string): TopologyInterface[] => device.interfaces.filter((i) => i.cryptoMap === mapName);

function ownerOf(topology: NetworkTopology, ip: string): { device: TopologyDevice; iface: TopologyInterface } | null {
  for (const d of topology.devices) {
    const i = d.interfaces.find((x) => baseIp(x.ip) === ip);
    if (i) return { device: d, iface: i };
  }
  return null;
}

/** `permit ip A W B W` -> gespiegelt `permit ip B W A W`; null, wenn die Zeile nicht in diesem einfachen Format steht. */
function mirrorAcl(line: string): string | null {
  const m = /^access-list\s+(\S+)\s+(permit|deny)\s+(\S+)\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})\s+(\d+(?:\.\d+){3})$/i.exec(line);
  return m ? `${m[2]} ${m[3]} ${m[6]} ${m[7]} ${m[4]} ${m[5]}` : null;
}
function aclBody(line: string): string | null {
  const m = /^access-list\s+\S+\s+(.+)$/i.exec(line);
  return m ? m[1] : null;
}

/** Konfigurationsprüfung gegen die Gegenstelle im Lab; nur Aussagen, die aus beiden Konfigurationen folgen. */
export function cryptoDiagnostics(device: TopologyDevice, topology: NetworkTopology): string[] {
  const cfg = device.config?.crypto;
  if (!cfg) return [];
  const notes: string[] = [];
  for (const entry of cfg.maps) {
    const applied = interfacesUsing(device, entry.name);
    if (applied.length === 0) notes.push(`Crypto Map ${entry.name} ist auf keinem Interface angewendet (crypto map ${entry.name} am WAN-Interface fehlt).`);
    for (const ts of entry.transformSets) if (!cfg.transformSets.some((t) => t.name === ts)) notes.push(`Transform-Set ${ts} ist im Lab nicht definiert.`);
    if (entry.transformSets.length === 0) notes.push(`Crypto Map ${entry.name} ${entry.seq} nennt kein Transform-Set.`);
    if (!entry.acl) notes.push(`Crypto Map ${entry.name} ${entry.seq} hat kein match address: kein Verkehr wird verschlüsselt.`);
    else if (!device.config?.accessLists?.[entry.acl]) notes.push(`Die Crypto-ACL ${entry.acl} ist im Lab nicht definiert.`);
    if (entry.peers.length === 0) notes.push(`Crypto Map ${entry.name} ${entry.seq} hat kein set peer.`);

    for (const peerIp of entry.peers) {
      if (!cfg.keys.some((k) => k.address === peerIp)) notes.push(`Kein Pre-Shared Key für den Peer ${peerIp} (crypto isakmp key … address ${peerIp}).`);
      if (cfg.policies.length === 0) notes.push("Keine ISAKMP-Policy im Lab: IKE Phase 1 kann nicht ausgehandelt werden.");
      const owner = ownerOf(topology, peerIp);
      if (!owner) {
        notes.push(`Der Peer ${peerIp} gehört keinem Gerät im Lab.`);
        continue;
      }
      const remote = owner.device.config?.crypto;
      if (!remote) {
        notes.push(`${nameOf(owner.device)} hat im Lab keine Crypto-Konfiguration.`);
        continue;
      }
      const rname = nameOf(owner.device);
      const myIps = applied.map((i) => baseIp(i.ip)).filter(Boolean);
      const remoteEntry: DeviceCryptoMapEntry | undefined = remote.maps.find((r) => r.peers.some((p) => myIps.includes(p)));
      if (!remoteEntry) {
        notes.push(`${rname} hat keinen Crypto-Map-Eintrag mit set peer ${myIps.join("/") || "<diese WAN-Adresse>"}.`);
      } else {
        if (!interfacesUsing(owner.device, remoteEntry.name).some((i) => baseIp(i.ip) === peerIp)) {
          notes.push(`${rname} wendet die Crypto Map nicht auf das Interface mit ${peerIp} an.`);
        }
        const mine = entry.transformSets.map((n) => cfg.transformSets.find((t) => t.name === n)).filter((t) => !!t);
        const theirs = remoteEntry.transformSets.map((n) => remote.transformSets.find((t) => t.name === n)).filter((t) => !!t);
        if (mine.length > 0 && theirs.length > 0 && !mine.some((a) => theirs.some((b) => a!.transform.toLowerCase() === b!.transform.toLowerCase()))) {
          notes.push(`Transform-Sets passen nicht zusammen: ${mine.map((t) => `${t!.name}: ${t!.transform}`).join(", ")} ↔ ${rname} ${theirs.map((t) => `${t!.name}: ${t!.transform}`).join(", ")} (Namen sind lokal, Parameter müssen übereinstimmen).`);
        }
        if ((entry.pfs ?? "") !== (remoteEntry.pfs ?? "")) notes.push(`PFS weicht ab: ${entry.pfs ?? "kein"} ↔ ${rname} ${remoteEntry.pfs ?? "kein"}.`);
        const myAcl = entry.acl ? device.config?.accessLists?.[entry.acl] : undefined;
        const theirAcl = remoteEntry.acl ? owner.device.config?.accessLists?.[remoteEntry.acl] : undefined;
        if (myAcl && theirAcl) {
          const theirBodies = new Set(theirAcl.map(aclBody));
          for (const line of myAcl) {
            const mirror = mirrorAcl(line);
            if (mirror === null) {
              notes.push(`Crypto-ACL-Zeile „${line}“: Spiegelung nicht prüfbar.`);
            } else if (!theirBodies.has(mirror)) {
              notes.push(`Die Crypto-ACL von ${rname} spiegelt „${line}“ nicht (erwartet: ${mirror}).`);
            }
          }
        }
      }
      const myKey = cfg.keys.find((k) => k.address === peerIp);
      const theirKey = remote.keys.find((k) => myIps.includes(k.address));
      if (myKey && theirKey && myKey.key !== theirKey.key) notes.push(`Pre-Shared Key stimmt nicht überein (${nameOf(device)} ↔ ${rname}).`);
      if (myKey && !theirKey) notes.push(`${rname} hat keinen Pre-Shared Key für ${myIps.join("/") || "diese WAN-Adresse"}.`);
      if (cfg.policies.length > 0 && remote.policies.length > 0) {
        const norm = (v?: string) => (v ?? "Standard").toLowerCase();
        const same = cfg.policies.some((a) => remote.policies.some((b) => norm(a.encryption) === norm(b.encryption) && norm(a.hash) === norm(b.hash) && norm(a.authentication) === norm(b.authentication) && norm(a.group) === norm(b.group)));
        if (!same) notes.push(`Keine passende ISAKMP-Policy: Verschlüsselung, Hash, Authentifizierung und DH-Gruppe müssen bei einer Policy beider Seiten übereinstimmen (${nameOf(device)} ↔ ${rname}).`);
      }
    }
  }
  return [...new Set(notes)];
}

export function formatShowCryptoMap(device: TopologyDevice, topology: NetworkTopology): string {
  const cfg = device.config?.crypto;
  if (!cfg || cfg.maps.length === 0) return "";
  const blocks: string[] = [];
  for (const e of cfg.maps) {
    const lines = [`Crypto Map "${e.name}" ${e.seq} ipsec-isakmp`];
    for (const p of e.peers) lines.push(`        Peer = ${p}`);
    if (e.acl) {
      const acl = device.config?.accessLists?.[e.acl];
      lines.push(`        Extended IP access list ${e.acl}`);
      if (acl) for (const l of acl) lines.push(`            ${l}`);
      else lines.push("            (im Lab nicht definiert)");
    } else {
      lines.push("        (kein match address im Lab)");
    }
    if (e.lifetimeSeconds !== undefined) lines.push(`        Security association lifetime: ${e.lifetimeSeconds} seconds`);
    lines.push(`        PFS (Y/N): ${e.pfs ? "Y" : "N"}`);
    if (e.pfs) lines.push(`        DH group:  ${e.pfs}`);
    lines.push("        Transform sets={");
    for (const n of e.transformSets) {
      const ts = cfg.transformSets.find((t) => t.name === n);
      lines.push(`                ${n}: { ${ts ? ts.transform : "im Lab nicht definiert"} }${ts?.mode ? ` (mode ${ts.mode})` : ""}`);
    }
    lines.push("        }");
    const used = interfacesUsing(device, e.name);
    lines.push(`        Interfaces using crypto map ${e.name}:`);
    if (used.length > 0) for (const i of used) lines.push(`                ${longInterfaceName(i.name)}`);
    else lines.push("                (keines)");
    blocks.push(lines.join("\n"));
  }
  const notes = cryptoDiagnostics(device, topology);
  if (notes.length > 0) blocks.push(["% Prüfung der Konfiguration:", ...notes.map((n) => `%   ${n}`)].join("\n"));
  return blocks.join("\n\n");
}

const NO_TRAFFIC = "entsteht erst nach Verkehr (interesting traffic gemäß Crypto-ACL)";

export function formatShowCryptoIsakmpSa(device: TopologyDevice, topology: NetworkTopology): string {
  const lines = ["IPv4 Crypto ISAKMP SA", "dst             src             state          conn-id status", "", `% Keine ISAKMP-SA: ${NO_TRAFFIC}.`];
  const notes = cryptoDiagnostics(device, topology);
  if (notes.length > 0) lines.push("% Falls auch nach Verkehr keine SA entsteht, kommen diese Punkte in Frage:", ...notes.map((n) => `%   ${n}`));
  return lines.join("\n");
}

export function formatShowCryptoIpsecSa(device: TopologyDevice): string {
  const cfg = device.config?.crypto;
  const applied = (cfg?.maps ?? []).flatMap((e) => interfacesUsing(device, e.name).map((i) => ({ e, i })));
  if (applied.length === 0) return "% Crypto Map auf keinem Interface angewendet: es können keine IPsec-SAs entstehen.";
  const lines: string[] = [];
  for (const { e, i } of applied) {
    lines.push(`interface: ${longInterfaceName(i.name)}`, `    Crypto map tag: ${e.name}, local addr ${baseIp(i.ip) || "nicht bestimmbar"}`, "");
  }
  lines.push(`% Keine IPsec-SAs: ${NO_TRAFFIC}. Paket- und SPI-Zähler sind Laufzeitwerte und werden nicht ausgegeben.`);
  return lines.join("\n");
}

export function cryptoOutputs(device: TopologyDevice, topology: NetworkTopology): Record<string, string> {
  const out: Record<string, string> = {};
  if (!hasCryptoConfig(device)) return out;
  if ((device.config?.crypto?.maps.length ?? 0) > 0) {
    out["show crypto map"] = formatShowCryptoMap(device, topology);
    out["show crypto isakmp sa"] = formatShowCryptoIsakmpSa(device, topology);
    out["show crypto ipsec sa"] = formatShowCryptoIpsecSa(device);
  }
  return out;
}

export function cryptoHints(device: TopologyDevice, topology: NetworkTopology): string[] {
  if (!hasCryptoConfig(device)) return [];
  return [...cryptoDiagnostics(device, topology), "IPsec-SAs entstehen erst nach Verkehr, der zur Crypto-ACL passt."];
}

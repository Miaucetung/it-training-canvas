import { describe, it, expect } from "vitest";
import { LABS } from "@/components/labs";
import { CURATED_TOPOLOGIES } from "@/components/labs/curated-topologies";
import { buildNetworkTopologyFromLab, parseLabDeviceConfig } from "@/components/labs/lab-to-network";
import { CiscoCliGenerator } from "@/lib/topology/cisco-cli-generator";
import { computeTunnelState, greHints } from "@/lib/topology/gre-tunnel";
import { cryptoDiagnostics, cryptoHints } from "@/lib/topology/ipsec";
import { hasRouteTo, installedStaticRoutes } from "@/lib/topology/static-routes";
import type { NetworkTopology, TopologyDevice } from "@/types/topology";

type LabLike = (typeof LABS)[number];

/** Lab mit geänderten Befehlen: `edit` liefert die neue Zeile, `null` entfernt sie. */
function edited(lab: LabLike, edit: (device: string, line: string) => string | null): LabLike {
  return {
    ...lab,
    steps: lab.steps.map((st) => ({
      ...st,
      blocks: (st.blocks as Array<{ device: string; commands: Array<{ cmd: string }> }>).map((b) => ({
        ...b,
        commands: b.commands.map((c) => ({
          ...c,
          cmd: String(c.cmd)
            .split("\n")
            .map((l) => edit(b.device, l.trim()))
            .filter((l): l is string => l !== null)
            .join("\n"),
        })),
      })),
    })),
  } as LabLike;
}
const labOf = (id: string) => LABS.find((l) => l.id === id)!;
const topo = (lab: LabLike, state: "target" | "start" = "target") => buildNetworkTopologyFromLab(lab, CURATED_TOPOLOGIES[lab.id], state).topology;
const dev = (t: NetworkTopology, n: string) => t.devices.find((d) => d.name === n)!;
const out = (t: NetworkTopology, n: string) => CiscoCliGenerator.getDynamicShowOutputs(dev(t, n), t);

describe("statische Routen", () => {
  it("show ip route nennt Default-Route und Gateway of last resort (gre-tunnel)", () => {
    const t = topo(labOf("gre-tunnel"));
    const route = out(t, "R1-1")["show ip route"];
    expect(route).toMatch(/S\*\s+0\.0\.0\.0\/0 \[1\/0\] via 1\.1\.1\.1/);
    expect(route).toContain("Gateway of last resort is 1.1.1.1 to network 0.0.0.0");
  });

  it("Geräte ohne statische Route behalten 'Gateway of last resort is not set'", () => {
    const route = out(topo(labOf("gre-tunnel")), "Internet")["show ip route"];
    expect(route).toContain("Gateway of last resort is not set");
    expect(route).not.toMatch(/^S/m);
  });

  it("Parser: Next Hop, Interface, Distanz", () => {
    const lab = { steps: [{ blocks: [{ device: "R", commands: [{ cmd: "ip route 10.0.0.0 255.255.255.0 1.1.1.1 5\nip route 10.1.0.0 255.255.0.0 se0/0/0\nip route 0.0.0.0 0.0.0.0 gi0/1 9.9.9.9" }] }] }] };
    expect(parseLabDeviceConfig(lab as never, "R").ipRoutes).toEqual([
      { network: "10.0.0.0/24", nextHop: "1.1.1.1", distance: 5 },
      { network: "10.1.0.0/16", outInterface: "Se0/0/0" },
      { network: "0.0.0.0/0", outInterface: "Gi0/1", nextHop: "9.9.9.9" },
    ]);
  });

  it("negativ: Next Hop außerhalb eines aktiven verbundenen Netzes wird nicht installiert", () => {
    const d = {
      id: "r",
      name: "r",
      type: "router",
      x: 0,
      y: 0,
      interfaces: [
        { id: "a", name: "Gi0/0", status: "up", ip: "10.0.0.1/24" },
        { id: "b", name: "Gi0/1", status: "admin-down", isShutdown: true, ip: "20.0.0.1/24" },
      ],
      config: { hostname: "r", ipRoutes: [{ network: "1.0.0.0/8", nextHop: "10.0.0.2" }, { network: "2.0.0.0/8", nextHop: "20.0.0.2" }, { network: "3.0.0.0/8", nextHop: "30.0.0.2" }, { network: "4.0.0.0/8", outInterface: "Gi0/1" }] },
    } as unknown as TopologyDevice;
    expect(installedStaticRoutes(d).map((r) => r.route.network)).toEqual(["1.0.0.0/8"]);
    expect(hasRouteTo(d, "1.2.3.4")).toBe(true);
    expect(hasRouteTo(d, "2.2.2.2")).toBe(false);
  });
});

describe("show interfaces tunnel (gre-tunnel)", () => {
  it("beide Tunnelenden up/up mit Source, Destination und GRE/IP aus der Konfiguration", () => {
    const t = topo(labOf("gre-tunnel"));
    const r1 = out(t, "R1-1")["show interfaces tunnel 12"];
    expect(r1).toContain("Tunnel12 is up, line protocol is up");
    expect(r1).toContain("Internet address is 216.145.12.1/30");
    expect(r1).toContain("Tunnel source 1.1.1.2 (Serial0/0/0), destination 2.2.2.2");
    expect(r1).toContain("Tunnel protocol/transport GRE/IP");
    expect(r1).toContain("Gegenstelle wird nicht geprüft");
    const r2 = out(t, "R2-1")["show interfaces tunnel 12"];
    expect(r2).toContain("Tunnel source 2.2.2.2 (Serial0/0/0), destination 1.1.1.2");
    expect(greHints(dev(t, "R1-1"), t)).toEqual([]);
  });

  it("keine erfundenen Zähler oder MTU-Werte", () => {
    const text = out(topo(labOf("gre-tunnel")), "R1-1")["show interfaces tunnel 12"];
    expect(text).not.toMatch(/packets input|MTU \d|BW \d|txload/);
  });

  it("negativ: Geräte ohne Tunnel und der Startzustand haben keine Tunnel-Ausgabe", () => {
    const t = topo(labOf("gre-tunnel"));
    for (const n of ["Internet", "PC0", "PC1"]) expect(Object.keys(out(t, n)).some((k) => k.includes("tunnel")), n).toBe(false);
    const start = topo(labOf("gre-tunnel"), "start");
    expect(Object.keys(out(start, "R1-1")).some((k) => k.includes("tunnel"))).toBe(false);
  });

  it("falsches Ziel (gehört keinem Gerät): Tunnel bleibt up/up, der Hinweis nennt den Fehler", () => {
    const t = topo(edited(labOf("gre-tunnel"), (d, l) => (d === "R1-1" && l === "tunnel destination 2.2.2.2" ? "tunnel destination 9.9.9.9" : l)));
    const text = out(t, "R1-1")["show interfaces tunnel 12"];
    expect(text).toContain("line protocol is up");
    expect(text).toContain("Das Ziel 9.9.9.9 gehört keinem Gerät im Lab");
    expect(greHints(dev(t, "R1-1"), t).join(" ")).toContain("9.9.9.9");
  });

  it("Ziel zeigt auf ein Gerät ohne passenden Rück-Tunnel", () => {
    const t = topo(edited(labOf("gre-tunnel"), (d, l) => (d === "R1-1" && l === "tunnel destination 2.2.2.2" ? "tunnel destination 1.1.1.1" : l)));
    expect(out(t, "R1-1")["show interfaces tunnel 12"]).toContain("Internet hat im Lab keinen passenden Tunnel zurück");
  });

  it("Gegenstelle zeigt auf eine andere Quelladresse", () => {
    const t = topo(edited(labOf("gre-tunnel"), (d, l) => (d === "R2-1" && l === "tunnel destination 1.1.1.2" ? "tunnel destination 1.1.1.1" : l)));
    expect(out(t, "R1-1")["show interfaces tunnel 12"]).toContain("zeigt mit seinem Tunnel auf 1.1.1.1 statt auf 1.1.1.2");
  });

  it("negativ: Tunnel mit shutdown ist administratively down", () => {
    let inTunnel = false;
    const t = topo(
      edited(labOf("gre-tunnel"), (d, l) => {
        if (/^interface /i.test(l)) inTunnel = /^interface tunnel/i.test(l);
        return d === "R1-1" && inTunnel && l === "no shutdown" ? "shutdown" : l;
      })
    );
    const text = out(t, "R1-1")["show interfaces tunnel 12"];
    expect(text).toContain("Tunnel12 is administratively down, line protocol is down");
  });

  it("negativ: Quell-Interface nicht verfügbar oder keine Quelle — down", () => {
    const noSource = topo(edited(labOf("gre-tunnel"), (d, l) => (d === "R1-1" && l === "tunnel source se0/0/0" ? null : l)));
    expect(out(noSource, "R1-1")["show interfaces tunnel 12"]).toContain("line protocol is down");
    expect(out(noSource, "R1-1")["show interfaces tunnel 12"]).toContain("Kein tunnel source");
    const missing = topo(edited(labOf("gre-tunnel"), (d, l) => (d === "R1-1" && l === "tunnel source se0/0/0" ? "tunnel source gi0/2" : l)));
    expect(out(missing, "R1-1")["show interfaces tunnel 12"]).toContain("line protocol is down");
  });

  it("ohne Route zum Ziel: ohne dynamisches Routing down, mit Routing-Protokoll nicht bestimmbar", () => {
    const noRoute = edited(labOf("gre-tunnel"), (d, l) => (d === "R1-1" && l === "ip route 0.0.0.0 0.0.0.0 1.1.1.1" ? null : l));
    const t = topo(noRoute);
    const state = computeTunnelState(dev(t, "R1-1"), dev(t, "R1-1").interfaces.find((i) => i.name === "Tu12")!, t);
    expect(state.lineProtocol).toBe("nicht bestimmbar");
    expect(out(t, "R1-1")["show interfaces tunnel 12"]).toContain("nicht bestimmbar");
    const d = dev(t, "R1-1");
    const noProto = { ...t, devices: t.devices.map((x) => (x.id === d.id ? { ...x, config: { ...x.config!, routingProtocols: [] } } : x)) };
    const s2 = computeTunnelState(noProto.devices.find((x) => x.id === d.id)!, d.interfaces.find((i) => i.name === "Tu12")!, noProto);
    expect(s2.lineProtocol).toBe("down");
    expect(s2.notes.join(" ")).toContain("Keine Route");
  });

  it("Parser: tunnel source/destination/mode", () => {
    const lab = { steps: [{ blocks: [{ device: "R", commands: [{ cmd: "interface tunnel 3\ntunnel source 5.5.5.5\ntunnel destination 6.6.6.6\ntunnel mode ipsec ipv4" }] }] }] };
    expect(parseLabDeviceConfig(lab as never, "R").ifaces.get("Tu3")).toMatchObject({ tunnelSource: "5.5.5.5", tunnelDestination: "6.6.6.6", tunnelMode: "ipsec ipv4" });
  });
});

describe("IPsec: show crypto map / isakmp sa / ipsec sa (ipsec-s2s-vpn)", () => {
  const lab = labOf("ipsec-s2s-vpn");

  it("show crypto map folgt der Konfiguration; die Gegenstelle passt, keine Prüfhinweise", () => {
    const t = topo(lab);
    const map = out(t, "Hamburg")["show crypto map"];
    expect(map).toContain('Crypto Map "IPSEC-MAP" 10 ipsec-isakmp');
    expect(map).toContain("Peer = 200.0.0.1");
    expect(map).toContain("access-list 100 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255");
    expect(map).toContain("Security association lifetime: 86400 seconds");
    expect(map).toMatch(/PFS \(Y\/N\): Y/);
    expect(map).toContain("DH group:  group5");
    expect(map).toContain("HH-HB: { esp-aes 256 esp-sha-hmac }");
    expect(map).toMatch(/Interfaces using crypto map IPSEC-MAP:\s+GigabitEthernet0\/1/);
    expect(map).not.toContain("Prüfung der Konfiguration");
    expect(out(t, "Bremen")["show crypto map"]).toContain("Peer = 100.0.0.1");
    expect(cryptoDiagnostics(dev(t, "Hamburg"), t)).toEqual([]);
  });

  it("SAs entstehen erst nach Verkehr: leer mit Hinweis, keine erfundenen Zähler", () => {
    const o = out(topo(lab), "Hamburg");
    expect(o["show crypto isakmp sa"]).toContain("entsteht erst nach Verkehr");
    expect(o["show crypto ipsec sa"]).toContain("entsteht erst nach Verkehr");
    expect(o["show crypto ipsec sa"]).toContain("Crypto map tag: IPSEC-MAP, local addr 100.0.0.1");
    for (const k of ["show crypto isakmp sa", "show crypto ipsec sa"]) expect(o[k]).not.toMatch(/#pkts|spi:|QM_IDLE|ACTIVE/);
  });

  it("negativ: Geräte ohne Crypto-Konfiguration und der Startzustand haben keine crypto-Ausgaben", () => {
    const t = topo(lab);
    for (const n of ["ISP1", "Internet1", "ISP2", "SW1", "PC0"]) expect(Object.keys(out(t, n)).some((k) => k.includes("crypto")), n).toBe(false);
    const start = topo(lab, "start");
    expect(Object.keys(out(start, "Hamburg")).some((k) => k.includes("crypto"))).toBe(false);
  });

  it("negativ: Crypto Map nicht auf dem WAN-Interface angewendet", () => {
    const t = topo(edited(lab, (d, l) => (d === "Hamburg" && l === "crypto map IPSEC-MAP" ? null : l)));
    expect(out(t, "Hamburg")["show crypto map"]).toContain("ist auf keinem Interface angewendet");
    expect(out(t, "Hamburg")["show crypto ipsec sa"]).toContain("auf keinem Interface angewendet");
    expect(cryptoHints(dev(t, "Hamburg"), t).join(" ")).toContain("keinem Interface");
  });

  it("negativ: Pre-Shared Key weicht ab oder fehlt", () => {
    const wrong = topo(edited(lab, (d, l) => (d === "Bremen" && l.startsWith("crypto isakmp key") ? "crypto isakmp key anders address 100.0.0.1" : l)));
    expect(cryptoDiagnostics(dev(wrong, "Hamburg"), wrong).join(" ")).toContain("Pre-Shared Key stimmt nicht überein");
    const missing = topo(edited(lab, (d, l) => (d === "Bremen" && l.startsWith("crypto isakmp key") ? null : l)));
    expect(cryptoDiagnostics(dev(missing, "Hamburg"), missing).join(" ")).toContain("Bremen hat keinen Pre-Shared Key");
    expect(cryptoDiagnostics(dev(missing, "Bremen"), missing).join(" ")).toContain("Kein Pre-Shared Key für den Peer 100.0.0.1");
  });

  it("negativ: Crypto-ACL nicht gespiegelt", () => {
    const t = topo(edited(lab, (d, l) => (d === "Bremen" && l.startsWith("access-list 100") ? "access-list 100 permit ip 192.168.2.0 0.0.0.255 192.168.7.0 0.0.0.255" : l)));
    const notes = cryptoDiagnostics(dev(t, "Hamburg"), t).join(" ");
    expect(notes).toContain("spiegelt");
    expect(notes).toContain("192.168.1.0 0.0.0.255");
  });

  it("negativ: Transform-Set-Parameter oder PFS unterschiedlich", () => {
    const ts = topo(edited(lab, (d, l) => (d === "Bremen" && l.startsWith("crypto ipsec transform-set") ? "crypto ipsec transform-set HB-HH esp-3des esp-md5-hmac" : l)));
    expect(cryptoDiagnostics(dev(ts, "Hamburg"), ts).join(" ")).toContain("Transform-Sets passen nicht zusammen");
    const pfs = topo(edited(lab, (d, l) => (d === "Bremen" && l === "set pfs group5" ? null : l)));
    expect(cryptoDiagnostics(dev(pfs, "Hamburg"), pfs).join(" ")).toContain("PFS weicht ab");
  });

  it("negativ: ISAKMP-Policy ohne gemeinsame DH-Gruppe", () => {
    const t = topo(edited(lab, (d, l) => (d === "Bremen" && l === "group 5" ? "group 2" : l)));
    expect(cryptoDiagnostics(dev(t, "Hamburg"), t).join(" ")).toContain("Keine passende ISAKMP-Policy");
  });

  it("negativ: Peer gehört keinem Gerät, Transform-Set/ACL fehlen", () => {
    const peer = topo(edited(lab, (d, l) => (d === "Hamburg" && l === "set peer 200.0.0.1" ? "set peer 9.9.9.9" : l)));
    expect(cryptoDiagnostics(dev(peer, "Hamburg"), peer).join(" ")).toContain("Der Peer 9.9.9.9 gehört keinem Gerät im Lab");
    const noTs = topo(edited(lab, (d, l) => (d === "Hamburg" && l.startsWith("crypto ipsec transform-set") ? null : l)));
    expect(cryptoDiagnostics(dev(noTs, "Hamburg"), noTs).join(" ")).toContain("Transform-Set HH-HB ist im Lab nicht definiert");
    const noAcl = topo(edited(lab, (d, l) => (d === "Hamburg" && l.startsWith("access-list 100") ? null : l)));
    expect(cryptoDiagnostics(dev(noAcl, "Hamburg"), noAcl).join(" ")).toContain("Crypto-ACL 100 ist im Lab nicht definiert");
  });

  it("Parser: Policy, Key, Transform-Set, Map und ACL", () => {
    const labLike = {
      steps: [
        {
          blocks: [
            {
              device: "R",
              commands: [
                {
                  cmd: [
                    "crypto isakmp policy 10",
                    "encryption aes 256",
                    "hash sha",
                    "authentication pre-share",
                    "group 5",
                    "lifetime 86400",
                    "exit",
                    "crypto isakmp key geheim! address 1.2.3.4",
                    "crypto ipsec transform-set TS esp-aes 256 esp-sha-hmac",
                    "access-list 100 permit ip 10.0.0.0 0.0.0.255 10.1.0.0 0.0.0.255",
                    "crypto map M 10 ipsec-isakmp",
                    "set peer 1.2.3.4",
                    "set pfs group5",
                    "set security-association lifetime seconds 3600",
                    "set transform-set TS",
                    "match address 100",
                    "interface gi0/1",
                    "crypto map M",
                  ].join("\n"),
                },
              ],
            },
          ],
        },
      ],
    };
    const cfg = parseLabDeviceConfig(labLike as never, "R");
    expect(cfg.crypto?.policies).toEqual([{ priority: 10, encryption: "aes 256", hash: "sha", authentication: "pre-share", group: "5", lifetime: 86400 }]);
    expect(cfg.crypto?.keys).toEqual([{ key: "geheim!", address: "1.2.3.4" }]);
    expect(cfg.crypto?.transformSets).toEqual([{ name: "TS", transform: "esp-aes 256 esp-sha-hmac" }]);
    expect(cfg.crypto?.maps).toEqual([{ name: "M", seq: 10, peers: ["1.2.3.4"], transformSets: ["TS"], acl: "100", pfs: "group5", lifetimeSeconds: 3600 }]);
    expect(cfg.accessLists["100"]).toEqual(["access-list 100 permit ip 10.0.0.0 0.0.0.255 10.1.0.0 0.0.0.255"]);
    expect(cfg.ifaces.get("Gi0/1")?.cryptoMap).toBe("M");
  });
});

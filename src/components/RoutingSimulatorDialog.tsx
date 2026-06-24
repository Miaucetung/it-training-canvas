// ============================================================
// RoutingSimulatorDialog — Interaktiver Routing- & OSPF-Trainer
// ------------------------------------------------------------
// 4 Tabs:
//   1) Paketreise  — Hop-by-Hop von PC1 → R1 → R2 → R3 → PC2
//      (zeigt Routing-Tabelle-Lookup, MAC-Rewrite, TTL, ARP)
//   2) Routing-Tabelle & AD — vergleich Static/OSPF/RIP/Connected
//   3) OSPF Neighbor-States — Down → Init → 2-Way → ExStart →
//      Exchange → Loading → Full (mit Paket-Animation)
//   4) OSPF SPF / Cost — Best-Path-Berechnung mit verstellbaren
//      Link-Kosten (Dijkstra-Visualisierung)
//
// Self-contained: erklärt alle Grundlagen, kein Vorwissen nötig.
// ============================================================

import { ArrowRight, Pause, Play, SkipForward, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

type Tab = "journey" | "traceroute" | "table" | "neighbor" | "spf";

// ════════════════════════════════════════════════════════════
// Tab-Daten 1: Paketreise (Hop-by-Hop)
// ════════════════════════════════════════════════════════════

interface HopState {
  /** Wo befindet sich das Paket aktuell? */
  location: "pc1" | "r1" | "r2" | "r3" | "pc2";
  /** Was passiert hier (Erklärung) */
  title: string;
  description: string;
  /** Schlüsselfelder im Paket */
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  ttl: number;
  /** Welche Routing-Tabelle-Zeile triggert die Entscheidung? */
  routeHit?: { dest: string; nextHop: string; iface: string; ad: number; metric: number };
  /** Routing-Aktion (Layer-3-Logik) */
  action: string;
}

const PC1_MAC = "aa:aa:aa:aa:aa:01";
const PC2_MAC = "bb:bb:bb:bb:bb:02";
const R1_LAN_MAC = "cc:cc:cc:11:00:01";
const R1_WAN_MAC = "cc:cc:cc:11:00:02";
const R2_WAN1_MAC = "cc:cc:cc:22:00:01";
const R2_WAN2_MAC = "cc:cc:cc:22:00:02";
const R3_WAN_MAC = "cc:cc:cc:33:00:01";
const R3_LAN_MAC = "cc:cc:cc:33:00:02";

const HOPS: HopState[] = [
  {
    location: "pc1",
    title: "1. PC1 prüft: lokales Netz oder nicht?",
    description:
      "PC1 (192.168.1.10/24) will 192.168.4.10 erreichen. Vergleich mit eigener Subnetzmaske: 192.168.4.10 liegt NICHT im eigenen Netz (192.168.1.0/24). → Paket muss zum Default-Gateway. PC1 macht ARP für 192.168.1.1 (R1).",
    srcMac: PC1_MAC,
    dstMac: R1_LAN_MAC,
    srcIp: "192.168.1.10",
    dstIp: "192.168.4.10",
    ttl: 64,
    action: "Frame bauen: Dst-MAC = Gateway-MAC. IP-Header: TTL=64. Frame raus an Switch → R1.",
  },
  {
    location: "r1",
    title: "2. R1 empfängt — Layer-3-Lookup",
    description:
      "R1 sieht: 'Frame ist für meine MAC' → öffnet IP-Header. Ziel-IP = 192.168.4.10. Sucht in der Routing-Tabelle nach dem längsten passenden Präfix (Longest Prefix Match). Treffer: O 192.168.4.0/24 [110/3] via 10.0.12.2.",
    srcMac: R1_WAN_MAC,
    dstMac: R2_WAN1_MAC,
    srcIp: "192.168.1.10",
    dstIp: "192.168.4.10",
    ttl: 63,
    routeHit: { dest: "192.168.4.0/24", nextHop: "10.0.12.2", iface: "Gi0/1", ad: 110, metric: 3 },
    action:
      "TTL um 1 senken (64 → 63). Neuen Frame bauen: Src-MAC = Gi0/1, Dst-MAC = R2 (ARP für 10.0.12.2). IP-Adressen bleiben gleich!",
  },
  {
    location: "r2",
    title: "3. R2 — Transit-Router",
    description:
      "R2 empfängt das Frame. Layer-2-Header weg, IP-Header lesen: 192.168.4.10. Routing-Tabelle sagt: O 192.168.4.0/24 [110/2] via 10.0.23.2 (R3). Wieder MAC-Rewrite, TTL um 1 runter.",
    srcMac: R2_WAN2_MAC,
    dstMac: R3_WAN_MAC,
    srcIp: "192.168.1.10",
    dstIp: "192.168.4.10",
    ttl: 62,
    routeHit: { dest: "192.168.4.0/24", nextHop: "10.0.23.2", iface: "Gi0/2", ad: 110, metric: 2 },
    action: "TTL 63 → 62. MAC-Rewrite. Frame an R3.",
  },
  {
    location: "r3",
    title: "4. R3 — letzter Hop vor dem Ziel",
    description:
      "R3 schaut Routing-Tabelle: 192.168.4.10 fällt in 192.168.4.0/24 — und dieses Netz hängt DIREKT an Gi0/0 (Code C = connected, AD 0). R3 macht ARP für 192.168.4.10 und baut den finalen Frame mit der echten Ziel-MAC.",
    srcMac: R3_LAN_MAC,
    dstMac: PC2_MAC,
    srcIp: "192.168.1.10",
    dstIp: "192.168.4.10",
    ttl: 61,
    routeHit: { dest: "192.168.4.0/24", nextHop: "directly connected", iface: "Gi0/0", ad: 0, metric: 0 },
    action: "TTL 62 → 61. ARP-Lookup für 192.168.4.10 → MAC von PC2. Frame raus an LAN-Switch.",
  },
  {
    location: "pc2",
    title: "5. PC2 empfängt das Paket",
    description:
      "PC2 sieht 'Frame ist für meine MAC' → öffnet IP-Header → Ziel-IP = eigene IP → öffnet TCP/UDP → liefert Daten an die Anwendung. Antwort läuft den gleichen Weg rückwärts.",
    srcMac: R3_LAN_MAC,
    dstMac: PC2_MAC,
    srcIp: "192.168.1.10",
    dstIp: "192.168.4.10",
    ttl: 61,
    action: "Paket vollständig zugestellt. Beachte: IP-Adressen sind über ALLE Hops gleich geblieben — nur MAC und TTL ändern sich!",
  },
];

// ════════════════════════════════════════════════════════════
// Tab-Daten 2: AD-Tabelle
// ════════════════════════════════════════════════════════════

interface RouteSource {
  id: string;
  protocol: string;
  ad: number;
  color: string;
  description: string;
  metric: string;
  enabled: boolean;
}

const DEFAULT_ROUTES: RouteSource[] = [
  { id: "connected", protocol: "Connected (C)", ad: 0, color: "#10b981", description: "Direkt am Router-Interface — kein 'Lernen' nötig.", metric: "0", enabled: true },
  { id: "static", protocol: "Static (S)", ad: 1, color: "#3b82f6", description: "Vom Administrator manuell konfiguriert mit 'ip route ...'.", metric: "0", enabled: true },
  { id: "eigrp", protocol: "EIGRP (D)", ad: 90, color: "#8b5cf6", description: "Cisco-proprietäres hybrides Protokoll.", metric: "2816", enabled: false },
  { id: "ospf", protocol: "OSPF (O)", ad: 110, color: "#f59e0b", description: "Link-State, open standard, Dijkstra.", metric: "20", enabled: true },
  { id: "rip", protocol: "RIP (R)", ad: 120, color: "#ef4444", description: "Distance-Vector, max 15 Hops — selten produktiv.", metric: "3", enabled: false },
];

// ════════════════════════════════════════════════════════════
// Tab-Daten 3: OSPF Neighbor States
// ════════════════════════════════════════════════════════════

interface NeighborStep {
  state: "Down" | "Init" | "2-Way" | "ExStart" | "Exchange" | "Loading" | "Full";
  packet: string;
  direction: "→" | "←" | "↔" | "—";
  what: string;
  why: string;
  troubleshoot?: string;
}

const NEIGHBOR_STEPS: NeighborStep[] = [
  {
    state: "Down",
    packet: "—",
    direction: "—",
    what: "Noch keine Hello-Pakete empfangen. OSPF ist konfiguriert, aber niemand antwortet.",
    why: "Startzustand. Sobald 'router ospf' + 'network ...' eingegeben werden und ein Interface up ist, beginnt das Senden von Hellos.",
    troubleshoot: "Interface up? 'no shutdown'? Subnetz im 'network'-Befehl mit korrekter Wildcard-Maske?",
  },
  {
    state: "Init",
    packet: "Hello (224.0.0.5)",
    direction: "→",
    what: "R1 sendet alle 10s Hello-Pakete an die Multicast 224.0.0.5. R2 hat noch nicht zurück geantwortet.",
    why: "Hello enthält: Router-ID, Area-ID, Hello/Dead-Timer, Subnetzmaske, Authentifizierung, Liste bekannter Neighbors.",
    troubleshoot: "Bleibt es bei Init? → Firewall blockiert Multicast oder ein Hello-Parameter passt nicht (Area, Timer, Maske, Auth).",
  },
  {
    state: "2-Way",
    packet: "Hello mit eigener Router-ID",
    direction: "↔",
    what: "R2 antwortet mit Hello, in dem R1's Router-ID in der Neighbor-Liste steht. R1 sieht: 'Er kennt mich' → 2-Way.",
    why: "Bei Ethernet (Broadcast) findet jetzt die DR/BDR-Wahl statt. DROther bleiben untereinander absichtlich in 2-Way — das ist KEIN Fehler!",
    troubleshoot: "Hängt bei 2-Way und keiner ist DR? → Beide Router haben Priority 0 gesetzt. Mindestens einer braucht Priority > 0.",
  },
  {
    state: "ExStart",
    packet: "DBD (leer)",
    direction: "↔",
    what: "Master/Slave-Wahl per Router-ID. Höhere RID = Master. Master gibt die DBD-Sequenznummer vor.",
    why: "Vor dem eigentlichen Datenbankaustausch muss klar sein, wer den Takt vorgibt.",
    troubleshoot: "Bleibt bei ExStart? → Router-ID-Konflikt: zwei Router haben zufällig die gleiche RID konfiguriert.",
  },
  {
    state: "Exchange",
    packet: "DBD (Inhalt)",
    direction: "↔",
    what: "Beide schicken DBD-Pakete mit einer Zusammenfassung ihrer LSDB (welche LSAs sie kennen, ohne den Vollinhalt).",
    why: "So weiß jeder, welche LSAs ihm im Vergleich zum Nachbarn fehlen.",
    troubleshoot: "Bleibt bei Exchange? → MTU-Mismatch! DBD-Paket passt nicht durch. 'show ip ospf interface' → MTU prüfen.",
  },
  {
    state: "Loading",
    packet: "LSR / LSU / LSAck",
    direction: "↔",
    what: "Fehlende LSAs werden angefordert (LSR = Link State Request) und vollständig übertragen (LSU = Link State Update), Empfang bestätigt (LSAck).",
    why: "Erst nach Loading sind beide LSDBs identisch.",
  },
  {
    state: "Full",
    packet: "Hello (alle 10s, Keepalive)",
    direction: "↔",
    what: "Adjacency komplett. Beide haben identische LSDB. Dijkstra-Algorithmus läuft jetzt lokal und füllt die Routing-Tabelle.",
    why: "Zielzustand. Nur jetzt darf der Router OSPF-Routen in die Routing-Tabelle einbauen.",
  },
];

// ════════════════════════════════════════════════════════════
// Tab-Daten 4: SPF / Best Path
// ════════════════════════════════════════════════════════════

interface SpfNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface SpfEdge {
  from: string;
  to: string;
  defaultCost: number;
}

const SPF_NODES: SpfNode[] = [
  { id: "R1", label: "R1", x: 80, y: 200 },
  { id: "R2", label: "R2", x: 290, y: 80 },
  { id: "R3", label: "R3", x: 290, y: 320 },
  { id: "R4", label: "R4", x: 500, y: 200 },
];

const SPF_EDGES: SpfEdge[] = [
  { from: "R1", to: "R2", defaultCost: 1 },
  { from: "R1", to: "R3", defaultCost: 10 },
  { from: "R2", to: "R4", defaultCost: 1 },
  { from: "R3", to: "R4", defaultCost: 1 },
  { from: "R2", to: "R3", defaultCost: 5 },
];

/** Dijkstra: kürzester Pfad zwischen src und dst */
function dijkstra(
  nodes: SpfNode[],
  edges: { from: string; to: string; cost: number }[],
  src: string,
  dst: string,
): { path: string[]; cost: number } {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const Q = new Set<string>();
  for (const n of nodes) {
    dist.set(n.id, Infinity);
    prev.set(n.id, null);
    Q.add(n.id);
  }
  dist.set(src, 0);

  while (Q.size > 0) {
    let u: string | null = null;
    let uDist = Infinity;
    for (const id of Q) {
      const d = dist.get(id)!;
      if (d < uDist) {
        uDist = d;
        u = id;
      }
    }
    if (u === null || uDist === Infinity) break;
    if (u === dst) break;
    Q.delete(u);

    for (const e of edges) {
      let neighbor: string | null = null;
      if (e.from === u) neighbor = e.to;
      else if (e.to === u) neighbor = e.from;
      if (!neighbor || !Q.has(neighbor)) continue;
      const alt = uDist + e.cost;
      if (alt < dist.get(neighbor)!) {
        dist.set(neighbor, alt);
        prev.set(neighbor, u);
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = dst;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }
  if (path[0] !== src) return { path: [], cost: Infinity };
  return { path, cost: dist.get(dst) ?? Infinity };
}

// ════════════════════════════════════════════════════════════
// Komponente
// ════════════════════════════════════════════════════════════

export function RoutingSimulatorDialog({ dark, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("journey");

  // ESC schließt
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[1280px] max-h-[94vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b ${
            dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                dark ? "bg-sky-500/20 text-sky-300" : "bg-sky-100 text-sky-700"
              }`}
            >
              🛣️
            </div>
            <div>
              <h2 className="text-lg font-semibold">Routing &amp; OSPF Simulator</h2>
              <p className="text-xs opacity-70">
                Pakete folgen, Routing-Tabelle lesen, OSPF-Adjacency &amp; SPF interaktiv verstehen
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Schließen" className="p-2 rounded-lg hover:bg-slate-500/20">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tab-Bar */}
        <div
          className={`sticky top-[73px] z-10 flex flex-wrap gap-1 px-6 py-2 border-b ${
            dark ? "bg-slate-900/95 border-slate-700" : "bg-white/95 border-slate-200"
          }`}
        >
          {(
            [
              { id: "journey", label: "1 · Paketreise" },
              { id: "traceroute", label: "2 · Traceroute (TTL)" },
              { id: "table", label: "3 · Routing-Tabelle & AD" },
              { id: "neighbor", label: "4 · OSPF Neighbor-States" },
              { id: "spf", label: "5 · OSPF SPF / Cost" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.id
                  ? dark
                    ? "bg-sky-500 text-white"
                    : "bg-sky-600 text-white"
                  : dark
                    ? "hover:bg-slate-800 text-slate-300"
                    : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === "journey" && <JourneyTab dark={dark} />}
          {tab === "traceroute" && <TracerouteTab dark={dark} />}
          {tab === "table" && <TableTab dark={dark} />}
          {tab === "neighbor" && <NeighborTab dark={dark} />}
          {tab === "spf" && <SpfTab dark={dark} />}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 1: Paketreise
// ════════════════════════════════════════════════════════════

function JourneyTab({ dark }: { dark: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setStep((s) => {
        if (s >= HOPS.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 2400);
    return () => window.clearInterval(t);
  }, [playing]);

  const hop = HOPS[step];

  const subText = dark ? "text-slate-400" : "text-slate-600";
  const cardBg = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200";

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h3 className="font-semibold mb-1">So liest du diesen Tab</h3>
        <p className={`text-sm ${subText}`}>
          PC1 (192.168.1.10) pingt PC2 (192.168.4.10). Wir verfolgen das Paket über 3 Router. Achte auf
          drei Dinge: <strong>1)</strong> Die IP-Adressen bleiben über alle Hops gleich. <strong>2)</strong> Die
          MAC-Adressen werden bei jedem Router neu geschrieben (Layer-2 ist immer nur zum nächsten Gerät).
          <strong> 3)</strong> Der TTL-Wert sinkt bei jedem Router um 1 — bei TTL=0 wird das Paket verworfen.
        </p>
      </div>

      {/* Topologie SVG */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <svg viewBox="0 0 800 200" className="w-full h-auto" style={{ maxHeight: 260 }}>
          {/* Subnetz-Labels */}
          <text x="80" y="20" textAnchor="middle" fontSize="11" fill={dark ? "#94a3b8" : "#475569"}>
            192.168.1.0/24
          </text>
          <text x="265" y="20" textAnchor="middle" fontSize="11" fill={dark ? "#94a3b8" : "#475569"}>
            10.0.12.0/30
          </text>
          <text x="450" y="20" textAnchor="middle" fontSize="11" fill={dark ? "#94a3b8" : "#475569"}>
            10.0.23.0/30
          </text>
          <text x="700" y="20" textAnchor="middle" fontSize="11" fill={dark ? "#94a3b8" : "#475569"}>
            192.168.4.0/24
          </text>

          {/* Links */}
          <line x1="80" y1="115" x2="180" y2="115" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth="3" />
          <line x1="220" y1="115" x2="350" y2="115" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth="3" />
          <line x1="390" y1="115" x2="530" y2="115" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth="3" />
          <line x1="570" y1="115" x2="700" y2="115" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth="3" />

          {/* PC1 */}
          <DeviceIcon x={50} y={90} kind="pc" label="PC1" active={hop.location === "pc1"} dark={dark} />
          <text x="80" y="170" textAnchor="middle" fontSize="10" fill={dark ? "#cbd5e1" : "#475569"}>
            .10
          </text>

          {/* R1 */}
          <DeviceIcon x={180} y={90} kind="router" label="R1" active={hop.location === "r1"} dark={dark} />
          <text x="200" y="170" textAnchor="middle" fontSize="10" fill={dark ? "#cbd5e1" : "#475569"}>
            .1 / .1
          </text>

          {/* R2 */}
          <DeviceIcon x={350} y={90} kind="router" label="R2" active={hop.location === "r2"} dark={dark} />
          <text x="370" y="170" textAnchor="middle" fontSize="10" fill={dark ? "#cbd5e1" : "#475569"}>
            .2 / .1
          </text>

          {/* R3 */}
          <DeviceIcon x={530} y={90} kind="router" label="R3" active={hop.location === "r3"} dark={dark} />
          <text x="550" y="170" textAnchor="middle" fontSize="10" fill={dark ? "#cbd5e1" : "#475569"}>
            .2 / .1
          </text>

          {/* PC2 */}
          <DeviceIcon x={700} y={90} kind="pc" label="PC2" active={hop.location === "pc2"} dark={dark} />
          <text x="730" y="170" textAnchor="middle" fontSize="10" fill={dark ? "#cbd5e1" : "#475569"}>
            .10
          </text>

          {/* Paket-Animation */}
          <PacketDot location={hop.location} />
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={`px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 ${
            dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          ← Zurück
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${
            dark ? "bg-sky-500 hover:bg-sky-400 text-white" : "bg-sky-600 hover:bg-sky-700 text-white"
          }`}
        >
          {playing ? <Pause size={14} weight="bold" /> : <Play size={14} weight="bold" />}
          {playing ? "Pause" : "Auto-Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(HOPS.length - 1, s + 1))}
          disabled={step === HOPS.length - 1}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 ${
            dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          Weiter <SkipForward size={14} weight="bold" />
        </button>
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className={`px-3 py-1.5 rounded-md text-sm ${
            dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          Reset
        </button>
        <span className={`text-xs ml-auto ${subText}`}>
          Schritt {step + 1} / {HOPS.length}
        </span>
      </div>

      {/* Aktueller Hop: Beschreibung */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h3 className="font-semibold mb-2">{hop.title}</h3>
        <p className={`text-sm ${subText} mb-3`}>{hop.description}</p>
        <div className={`text-xs italic ${dark ? "text-sky-300" : "text-sky-700"}`}>→ {hop.action}</div>
      </div>

      {/* Frame-/Paket-Felder */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className={`rounded-lg border p-4 ${cardBg}`}>
          <div className="text-xs font-semibold uppercase mb-2 opacity-70">Layer-2 (Frame-Header)</div>
          <FieldRow label="Source MAC" value={hop.srcMac} dark={dark} highlight />
          <FieldRow label="Dest MAC" value={hop.dstMac} dark={dark} highlight />
          <div className={`text-[11px] mt-2 ${subText}`}>
            MACs ändern sich bei JEDEM Hop — das ist der Kern des Layer-2-Hopping.
          </div>
        </div>
        <div className={`rounded-lg border p-4 ${cardBg}`}>
          <div className="text-xs font-semibold uppercase mb-2 opacity-70">Layer-3 (IP-Header)</div>
          <FieldRow label="Source IP" value={hop.srcIp} dark={dark} />
          <FieldRow label="Dest IP" value={hop.dstIp} dark={dark} />
          <FieldRow label="TTL" value={String(hop.ttl)} dark={dark} highlight />
          <div className={`text-[11px] mt-2 ${subText}`}>
            IPs bleiben über alle Hops gleich. TTL sinkt pro Router um 1.
          </div>
        </div>
      </div>

      {/* Routing-Tabelle des aktuellen Routers */}
      {hop.routeHit && (
        <div className={`rounded-lg border p-4 ${cardBg}`}>
          <div className="text-xs font-semibold uppercase mb-2 opacity-70">Routing-Tabellen-Treffer (Longest Prefix Match)</div>
          <div className="font-mono text-xs overflow-x-auto">
            <div className={`px-2 py-1 rounded ${dark ? "bg-amber-500/20 text-amber-200" : "bg-amber-100 text-amber-900"}`}>
              <span className="opacity-70">Code</span> <strong>O</strong>
              {"   "}
              {hop.routeHit.dest}
              {"   "}[<strong>{hop.routeHit.ad}</strong>/{hop.routeHit.metric}]{"   "}
              via <strong>{hop.routeHit.nextHop}</strong>, {hop.routeHit.iface}
            </div>
          </div>
          <div className={`text-[11px] mt-2 ${subText}`}>
            <strong>O</strong> = via OSPF gelernt · <strong>AD 110</strong> = Vertrauen ins Protokoll · <strong>Metric</strong> = OSPF-Cost
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hilfskomponenten Tab 1 ──────────────────────────────────

function DeviceIcon({
  x,
  y,
  kind,
  label,
  active,
  dark,
}: {
  x: number;
  y: number;
  kind: "pc" | "router";
  label: string;
  active: boolean;
  dark: boolean;
}) {
  const fill = active ? "#0ea5e9" : dark ? "#334155" : "#e2e8f0";
  const stroke = active ? "#7dd3fc" : dark ? "#64748b" : "#94a3b8";
  const txt = active ? "#fff" : dark ? "#cbd5e1" : "#334155";

  if (kind === "pc") {
    return (
      <g>
        <rect x={x} y={y} width="60" height="40" rx="4" fill={fill} stroke={stroke} strokeWidth="2" />
        <rect x={x + 8} y={y + 6} width="44" height="20" fill={dark ? "#1e293b" : "#fff"} />
        <text x={x + 30} y={y + 56} textAnchor="middle" fontSize="11" fill={txt} fontWeight="bold">
          {label}
        </text>
      </g>
    );
  }
  // Router
  return (
    <g>
      <circle cx={x + 30} cy={y + 20} r="22" fill={fill} stroke={stroke} strokeWidth="2" />
      <text x={x + 30} y={y + 25} textAnchor="middle" fontSize="11" fill={txt} fontWeight="bold">
        {label}
      </text>
    </g>
  );
}

function PacketDot({ location }: { location: HopState["location"] }) {
  const positions: Record<HopState["location"], { x: number; y: number }> = {
    pc1: { x: 80, y: 115 },
    r1: { x: 200, y: 115 },
    r2: { x: 370, y: 115 },
    r3: { x: 550, y: 115 },
    pc2: { x: 730, y: 115 },
  };
  const p = positions[location];
  return (
    <g style={{ transition: "all 0.6s ease-in-out", transform: `translate(${p.x - 80}px, ${p.y - 115}px)` }}>
      <circle cx={80} cy={115} r="10" fill="#10b981" stroke="#fff" strokeWidth="2">
        <animate attributeName="r" values="10;14;10" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <text x={80} y={119} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">
        📦
      </text>
    </g>
  );
}

function FieldRow({ label, value, dark, highlight }: { label: string; value: string; dark: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-xs">
      <span className={dark ? "text-slate-400" : "text-slate-600"}>{label}</span>
      <span
        className={`font-mono ${
          highlight
            ? dark
              ? "text-emerald-300 font-semibold"
              : "text-emerald-700 font-semibold"
            : dark
              ? "text-slate-200"
              : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 5: Traceroute (TTL-Trick)
// ════════════════════════════════════════════════════════════

interface TraceHop {
  node: "r1" | "r2" | "r3" | "server";
  cx: number;
  ip: string;
  role: string;
  rtt: [string, string, string];
  reply: string;
  isTarget?: boolean;
}

const TRACE: TraceHop[] = [
  { node: "r1", cx: 220, ip: "192.168.1.1", role: "Default-Gateway (LAN)", rtt: ["1 ms", "1 ms", "2 ms"], reply: "ICMP Time Exceeded (Type 11)" },
  { node: "r2", cx: 380, ip: "100.64.0.1", role: "ISP-Zugangsrouter", rtt: ["11 ms", "12 ms", "11 ms"], reply: "ICMP Time Exceeded (Type 11)" },
  { node: "r3", cx: 540, ip: "203.0.113.9", role: "Backbone / Transit", rtt: ["18 ms", "17 ms", "18 ms"], reply: "ICMP Time Exceeded (Type 11)" },
  { node: "server", cx: 700, ip: "8.8.8.8", role: "Ziel-Host", rtt: ["19 ms", "18 ms", "19 ms"], reply: "Echo Reply — Ziel erreicht ✓", isTarget: true },
];

function TracerouteTab({ dark }: { dark: boolean }) {
  const [step, setStep] = useState(0); // aktueller Probe-Index (0 = TTL 1 → R1)
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      setStep((s) => {
        if (s >= TRACE.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 2200);
    return () => window.clearInterval(t);
  }, [playing]);

  const ttl = step + 1;
  const hop = TRACE[step];
  const subText = dark ? "text-slate-400" : "text-slate-600";
  const cardBg = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200";
  const nodes: Array<{ key: TraceHop["node"]; cx: number; kind: "pc" | "router"; label: string }> = [
    { key: "r1", cx: 220, kind: "router", label: "R1" },
    { key: "r2", cx: 380, kind: "router", label: "R2" },
    { key: "r3", cx: 540, kind: "router", label: "R3" },
    { key: "server", cx: 700, kind: "pc", label: "Server" },
  ];
  const line = dark ? "#475569" : "#cbd5e1";
  const linkColor = (toCx: number) => (toCx <= hop.cx ? "#0ea5e9" : line);

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h3 className="font-semibold mb-1">Der Traceroute-Trick</h3>
        <p className={`text-sm ${subText}`}>
          Traceroute schickt absichtlich Pakete mit zu kleiner <strong>TTL</strong>: zuerst TTL=1, dann 2, 3 …
          Jeder Router zieht 1 ab — wird die TTL <strong>0</strong>, verwirft er das Paket und meldet sich mit
          <strong> ICMP Time Exceeded</strong>. So verrät jeder Hop nacheinander seine IP. Erst das Ziel antwortet
          „normal“ → Trace fertig.
        </p>
      </div>

      {/* Topologie */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <div className={`mb-1 text-center text-xs ${subText}`}>
          Sonde mit <span className="font-mono font-semibold">TTL = {ttl}</span> → verfällt bei Hop {ttl}
        </div>
        <svg viewBox="0 0 760 190" className="w-full h-auto" style={{ maxHeight: 230 }}>
          {/* Links + TTL-Werte je Segment für die aktuelle Sonde */}
          {nodes.map((n, i) => {
            const fromCx = i === 0 ? 70 : nodes[i - 1].cx;
            const ttlAtSeg = ttl - i; // TTL beim Eintreffen an Knoten i
            const reached = n.cx <= hop.cx;
            return (
              <g key={n.key}>
                <line x1={fromCx + 30} y1="110" x2={n.cx - 30} y2="110" stroke={linkColor(n.cx)} strokeWidth="3" />
                {reached && (
                  <text x={(fromCx + n.cx) / 2} y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill={ttlAtSeg <= 0 ? "#ef4444" : "#0ea5e9"}>
                    {Math.max(ttlAtSeg, 0)}
                  </text>
                )}
              </g>
            );
          })}

          {/* PC */}
          <DeviceIcon x={40} y={85} kind="pc" label="PC" active={false} dark={dark} />
          <text x={70} y="165" textAnchor="middle" fontSize="10" fill={dark ? "#cbd5e1" : "#475569"}>
            192.168.1.10
          </text>

          {/* Hops */}
          {nodes.map((n) => (
            <g key={n.key}>
              <DeviceIcon x={n.cx - 30} y={85} kind={n.kind} label={n.label} active={n.key === hop.node} dark={dark} />
              <text x={n.cx} y="165" textAnchor="middle" fontSize="10" fill={n.key === hop.node ? "#0ea5e9" : dark ? "#cbd5e1" : "#475569"}>
                {TRACE.find((t) => t.node === n.key)?.ip}
              </text>
            </g>
          ))}

          {/* Paket-Dot am Verfall-Hop */}
          <g style={{ transition: "all 0.6s ease-in-out", transform: `translateX(${hop.cx - 70}px)` }}>
            <circle cx={70} cy={110} r="11" fill={hop.isTarget ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth="2">
              <animate attributeName="r" values="11;15;11" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <text x={70} y={114} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">
              {hop.isTarget ? "✓" : "0"}
            </text>
          </g>
        </svg>
      </div>

      {/* Erklärung aktueller Hop */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <div className="flex items-center justify-between">
          <span className="font-semibold">
            Sonde {ttl}: {hop.role}
          </span>
          <span className="font-mono text-xs">{hop.ip}</span>
        </div>
        <p className={`mt-1 text-sm ${subText}`}>
          PC sendet TTL={ttl}. An jedem Router −1 → bei <strong>{hop.isTarget ? "Server" : hop.node.toUpperCase()}</strong>{" "}
          {hop.isTarget ? (
            <>erreicht das Paket das Ziel und bekommt eine <strong>{hop.reply}</strong>.</>
          ) : (
            <>wird TTL=0 → Paket verworfen, Antwort: <strong>{hop.reply}</strong> von {hop.ip}.</>
          )}
        </p>
      </div>

      {/* Output */}
      <div className={`rounded-lg border p-3 font-mono text-xs ${dark ? "bg-slate-950 border-slate-700 text-slate-200" : "bg-slate-900 border-slate-700 text-slate-100"}`}>
        <div className="text-slate-400">C:\&gt; tracert 8.8.8.8</div>
        <div className="text-slate-400 mb-1">Routenverfolgung zu 8.8.8.8 über maximal 30 Hops:</div>
        {TRACE.slice(0, step + 1).map((t, i) => (
          <div key={t.node} className={t.isTarget ? "text-emerald-400" : ""}>
            {String(i + 1).padStart(2, " ")}   {t.rtt.join("   ")}   {t.ip}
            {t.isTarget ? "   ← Ziel" : ""}
          </div>
        ))}
        {step >= TRACE.length - 1 && <div className="text-emerald-400">Ablaufverfolgung beendet.</div>}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={`px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-40 ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"}`}
        >
          ← Zurück
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${dark ? "bg-sky-500 hover:bg-sky-400 text-white" : "bg-sky-600 hover:bg-sky-700 text-white"}`}
        >
          {playing ? <Pause size={14} weight="bold" /> : <Play size={14} weight="bold" />}
          {playing ? "Pause" : "Auto-Play"}
        </button>
        <button
          onClick={() => setStep((s) => Math.min(TRACE.length - 1, s + 1))}
          disabled={step >= TRACE.length - 1}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 disabled:opacity-40 ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"}`}
        >
          Weiter <ArrowRight size={14} weight="bold" />
        </button>
        <button
          onClick={() => { setStep(0); setPlaying(false); }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 ${dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"}`}
        >
          <SkipForward size={14} weight="bold" style={{ transform: "scaleX(-1)" }} /> Reset
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 2: Routing-Tabelle & Administrative Distance
// ════════════════════════════════════════════════════════════

function TableTab({ dark }: { dark: boolean }) {
  const [routes, setRoutes] = useState<RouteSource[]>(DEFAULT_ROUTES);
  const subText = dark ? "text-slate-400" : "text-slate-600";
  const cardBg = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200";

  const enabled = routes.filter((r) => r.enabled);
  const winner = enabled.sort((a, b) => a.ad - b.ad)[0] ?? null;

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h3 className="font-semibold mb-1">Wer gewinnt? Die Administrative Distance entscheidet.</h3>
        <p className={`text-sm ${subText}`}>
          Wenn mehrere Routing-Protokolle DENSELBEN Zielprefix kennen, vergleicht der Router NICHT die Metrik —
          sondern zuerst die <strong>Administrative Distance (AD)</strong>. Niedrigere AD = vertrauenswürdiger
          = gewinnt. Erst bei AD-Gleichstand entscheidet die Metrik. Toggle die Routenquellen unten und sieh,
          welche Route in die Routing-Tabelle (RIB) eingebaut wird.
        </p>
      </div>

      {/* Quellen-Toggles */}
      <div className="grid md:grid-cols-2 gap-3">
        {routes.map((r, idx) => (
          <button
            key={r.id}
            onClick={() => setRoutes((rs) => rs.map((x, i) => (i === idx ? { ...x, enabled: !x.enabled } : x)))}
            className={`text-left rounded-lg border p-3 transition-colors ${
              r.enabled
                ? dark
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-300 shadow-sm"
                : dark
                  ? "bg-slate-900/50 border-slate-800 opacity-50"
                  : "bg-slate-100/50 border-slate-200 opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                <span className="font-semibold text-sm">{r.protocol}</span>
              </div>
              <span className={`text-xs font-mono ${dark ? "text-amber-300" : "text-amber-700"}`}>AD {r.ad}</span>
            </div>
            <div className={`text-xs ${subText}`}>{r.description}</div>
            <div className={`text-[11px] mt-1 ${subText}`}>
              Metric: <span className="font-mono">{r.metric}</span> · {r.enabled ? "✓ aktiv" : "○ inaktiv"}
            </div>
          </button>
        ))}
      </div>

      {/* Winner */}
      <div
        className={`rounded-lg border p-4 ${
          winner ? (dark ? "bg-emerald-500/10 border-emerald-500/40" : "bg-emerald-50 border-emerald-300") : cardBg
        }`}
      >
        <div className="text-xs font-semibold uppercase mb-2 opacity-70">Was steht in der Routing-Tabelle?</div>
        {winner ? (
          <>
            <div className="font-mono text-sm">
              <strong>{winner.protocol.charAt(0)}</strong>
              {"   "}10.0.0.0/8{"   "}[<strong>{winner.ad}</strong>/{winner.metric}]{"   "}
              via 192.168.1.2, GigabitEthernet0/0
            </div>
            <div className={`text-xs mt-2 ${subText}`}>
              ✅ <strong>{winner.protocol}</strong> hat die niedrigste AD ({winner.ad}) — diese Route wird in die
              Routing-Tabelle eingebaut. Die anderen Quellen werden ignoriert (bleiben aber in der jeweiligen
              Protokoll-Datenbank).
            </div>
          </>
        ) : (
          <div className={`text-sm ${subText}`}>
            ❌ Keine Quelle aktiv — Ziel <strong>10.0.0.0/8</strong> nicht erreichbar. Paket wird verworfen
            (oder Default-Route greift).
          </div>
        )}
      </div>

      {/* AD-Cheat-Sheet */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h4 className="font-semibold text-sm mb-2">Merksatz: AD-Werte auswendig können</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            ["Connected", "0"],
            ["Static", "1"],
            ["eBGP", "20"],
            ["EIGRP intern", "90"],
            ["IGRP", "100"],
            ["OSPF", "110"],
            ["IS-IS", "115"],
            ["RIP", "120"],
            ["EIGRP extern", "170"],
            ["iBGP", "200"],
            ["Unknown", "255 (= unreachable)"],
          ].map(([proto, ad]) => (
            <div
              key={proto}
              className={`flex items-center justify-between px-2 py-1 rounded ${
                dark ? "bg-slate-900/60" : "bg-white"
              }`}
            >
              <span>{proto}</span>
              <span className="font-mono font-semibold">{ad}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 3: OSPF Neighbor States
// ════════════════════════════════════════════════════════════

function NeighborTab({ dark }: { dark: boolean }) {
  const [step, setStep] = useState(0);
  const subText = dark ? "text-slate-400" : "text-slate-600";
  const cardBg = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200";

  const cur = NEIGHBOR_STEPS[step];

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h3 className="font-semibold mb-1">Wie zwei OSPF-Router Freunde werden</h3>
        <p className={`text-sm ${subText}`}>
          OSPF baut eine sogenannte <strong>Adjacency</strong> auf — eine vollständig synchronisierte
          Beziehung — in 7 klar definierten Zuständen. Erst im finalen Zustand <strong>Full</strong> dürfen
          OSPF-gelernte Routen in die Routing-Tabelle. Bleibt der State irgendwo hängen, ist das ein
          Konfigurationsproblem (siehe „Häufige Stolpersteine" pro Schritt).
        </p>
      </div>

      {/* State-Machine SVG */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <div className="flex flex-wrap items-center justify-center gap-1 mb-4">
          {NEIGHBOR_STEPS.map((s, i) => (
            <div key={s.state} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  i === step
                    ? dark
                      ? "bg-sky-500 text-white"
                      : "bg-sky-600 text-white"
                    : i < step
                      ? dark
                        ? "bg-emerald-500/30 text-emerald-200"
                        : "bg-emerald-100 text-emerald-800"
                      : dark
                        ? "bg-slate-700 text-slate-400"
                        : "bg-slate-200 text-slate-600"
                }`}
              >
                {s.state}
              </button>
              {i < NEIGHBOR_STEPS.length - 1 && (
                <ArrowRight size={12} weight="bold" className="mx-0.5 opacity-50" />
              )}
            </div>
          ))}
        </div>

        {/* Router-Paar mit Paket-Animation */}
        <svg viewBox="0 0 600 160" className="w-full h-auto" style={{ maxHeight: 180 }}>
          {/* R1 */}
          <circle cx="100" cy="80" r="32" fill="#0ea5e9" stroke="#7dd3fc" strokeWidth="2" />
          <text x="100" y="84" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">
            R1
          </text>
          <text x="100" y="130" textAnchor="middle" fontSize="11" fill={dark ? "#cbd5e1" : "#475569"}>
            RID 1.1.1.1
          </text>
          <text x="100" y="146" textAnchor="middle" fontSize="10" fill={dark ? "#94a3b8" : "#64748b"}>
            State: {cur.state}
          </text>

          {/* R2 */}
          <circle cx="500" cy="80" r="32" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="2" />
          <text x="500" y="84" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="bold">
            R2
          </text>
          <text x="500" y="130" textAnchor="middle" fontSize="11" fill={dark ? "#cbd5e1" : "#475569"}>
            RID 2.2.2.2
          </text>
          <text x="500" y="146" textAnchor="middle" fontSize="10" fill={dark ? "#94a3b8" : "#64748b"}>
            State: {cur.state}
          </text>

          {/* Link */}
          <line x1="132" y1="80" x2="468" y2="80" stroke={dark ? "#475569" : "#cbd5e1"} strokeWidth="2" />

          {/* Paket-Pfeil */}
          {cur.direction !== "—" && (
            <g key={step}>
              <text x="300" y="50" textAnchor="middle" fontSize="11" fontWeight="bold" fill={dark ? "#fbbf24" : "#b45309"}>
                {cur.packet}
              </text>
              {cur.direction === "→" && (
                <>
                  <circle cx="150" cy="80" r="8" fill="#10b981">
                    <animate attributeName="cx" from="150" to="450" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {cur.direction === "←" && (
                <circle cx="450" cy="80" r="8" fill="#10b981">
                  <animate attributeName="cx" from="450" to="150" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
              {cur.direction === "↔" && (
                <>
                  <circle cx="150" cy="70" r="7" fill="#10b981">
                    <animate attributeName="cx" from="150" to="450" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="450" cy="90" r="7" fill="#a855f7">
                    <animate attributeName="cx" from="450" to="150" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Erklärung */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <div className="flex items-baseline gap-3 mb-2">
          <h3 className="text-lg font-semibold">{cur.state}</h3>
          <span className={`text-xs ${subText}`}>Schritt {step + 1} / {NEIGHBOR_STEPS.length}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className={`text-xs uppercase font-semibold mb-1 ${subText}`}>Was passiert</div>
            <p>{cur.what}</p>
          </div>
          <div>
            <div className={`text-xs uppercase font-semibold mb-1 ${subText}`}>Warum / Hintergrund</div>
            <p>{cur.why}</p>
          </div>
        </div>
        {cur.troubleshoot && (
          <div
            className={`mt-3 rounded p-2 text-xs ${
              dark ? "bg-rose-500/10 text-rose-200 border border-rose-500/30" : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            ⚠ <strong>Häufige Stolperstelle:</strong> {cur.troubleshoot}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className={`px-3 py-1.5 rounded-md text-sm disabled:opacity-40 ${
            dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          ← Vorheriger State
        </button>
        <button
          onClick={() => setStep((s) => Math.min(NEIGHBOR_STEPS.length - 1, s + 1))}
          disabled={step === NEIGHBOR_STEPS.length - 1}
          className={`px-3 py-1.5 rounded-md text-sm disabled:opacity-40 ${
            dark ? "bg-sky-500 hover:bg-sky-400 text-white" : "bg-sky-600 hover:bg-sky-700 text-white"
          }`}
        >
          Nächster State →
        </button>
        <button
          onClick={() => setStep(0)}
          className={`ml-auto px-3 py-1.5 rounded-md text-sm ${
            dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Tab 4: SPF / Cost
// ════════════════════════════════════════════════════════════

function SpfTab({ dark }: { dark: boolean }) {
  const [costs, setCosts] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    SPF_EDGES.forEach((e) => (o[`${e.from}-${e.to}`] = e.defaultCost));
    return o;
  });
  const [src, setSrc] = useState("R1");
  const [dst, setDst] = useState("R4");

  const subText = dark ? "text-slate-400" : "text-slate-600";
  const cardBg = dark ? "bg-slate-800/60 border-slate-700" : "bg-slate-50 border-slate-200";

  const result = useMemo(() => {
    const edges = SPF_EDGES.map((e) => ({
      from: e.from,
      to: e.to,
      cost: costs[`${e.from}-${e.to}`] ?? e.defaultCost,
    }));
    return dijkstra(SPF_NODES, edges, src, dst);
  }, [costs, src, dst]);

  const isOnPath = (a: string, b: string) => {
    for (let i = 0; i < result.path.length - 1; i++) {
      if ((result.path[i] === a && result.path[i + 1] === b) || (result.path[i] === b && result.path[i + 1] === a)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h3 className="font-semibold mb-1">Dijkstra zu Fuß: niedrigste Cost-Summe gewinnt</h3>
        <p className={`text-sm ${subText}`}>
          OSPF berechnet auf jedem Router den <strong>Shortest Path Tree</strong> mit Dijkstra. Die Metrik
          („Cost") wird pro Interface berechnet als <code>Referenz-Bandbreite ÷ Interface-Bandbreite</code>.
          Standard-Referenz: 100 Mbit/s — deshalb empfiehlt sich
          <code> auto-cost reference-bandwidth 100000</code>, damit GigE und 10GigE unterschieden werden.
          Stell die Kosten unten ein und sieh, wie sich der beste Pfad anpasst.
        </p>
      </div>

      {/* Source/Dest-Auswahl */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className={subText}>Von:</span>
          <select
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            className={`px-2 py-1 rounded border ${
              dark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
            }`}
          >
            {SPF_NODES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className={subText}>Nach:</span>
          <select
            value={dst}
            onChange={(e) => setDst(e.target.value)}
            className={`px-2 py-1 rounded border ${
              dark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-300"
            }`}
          >
            {SPF_NODES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            const o: Record<string, number> = {};
            SPF_EDGES.forEach((e) => (o[`${e.from}-${e.to}`] = e.defaultCost));
            setCosts(o);
          }}
          className={`ml-auto px-3 py-1.5 rounded-md text-xs ${
            dark ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-200 hover:bg-slate-300"
          }`}
        >
          Kosten zurücksetzen
        </button>
      </div>

      {/* SVG: Graph */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <svg viewBox="0 0 580 400" className="w-full h-auto" style={{ maxHeight: 420 }}>
          {/* Edges zuerst */}
          {SPF_EDGES.map((e) => {
            const a = SPF_NODES.find((n) => n.id === e.from)!;
            const b = SPF_NODES.find((n) => n.id === e.to)!;
            const onPath = isOnPath(e.from, e.to);
            const cost = costs[`${e.from}-${e.to}`] ?? e.defaultCost;
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={onPath ? "#10b981" : dark ? "#475569" : "#cbd5e1"}
                  strokeWidth={onPath ? 4 : 2}
                />
                <rect
                  x={mx - 18}
                  y={my - 10}
                  width="36"
                  height="20"
                  rx="4"
                  fill={onPath ? "#10b981" : dark ? "#0f172a" : "#fff"}
                  stroke={onPath ? "#10b981" : dark ? "#64748b" : "#94a3b8"}
                  strokeWidth="1"
                />
                <text
                  x={mx}
                  y={my + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={onPath ? "#fff" : dark ? "#cbd5e1" : "#334155"}
                >
                  {cost}
                </text>
              </g>
            );
          })}
          {/* Nodes */}
          {SPF_NODES.map((n) => {
            const isSrc = n.id === src;
            const isDst = n.id === dst;
            const onPath = result.path.includes(n.id);
            const fill = isSrc ? "#0ea5e9" : isDst ? "#f59e0b" : onPath ? "#10b981" : dark ? "#334155" : "#e2e8f0";
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="28" fill={fill} stroke="#fff" strokeWidth="2" />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill={isSrc || isDst || onPath ? "#fff" : dark ? "#cbd5e1" : "#334155"}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Slider für jede Kante */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <div className="text-xs font-semibold uppercase mb-2 opacity-70">Link-Kosten anpassen</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {SPF_EDGES.map((e) => {
            const key = `${e.from}-${e.to}`;
            const val = costs[key] ?? e.defaultCost;
            return (
              <label key={key} className="flex items-center gap-2 text-sm">
                <span className={`font-mono w-16 ${subText}`}>
                  {e.from}↔{e.to}
                </span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={val}
                  onChange={(ev) => setCosts((c) => ({ ...c, [key]: Number(ev.target.value) }))}
                  className="flex-1"
                />
                <span className="font-mono w-10 text-right">{val}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Ergebnis */}
      <div
        className={`rounded-lg border p-4 ${
          result.path.length > 0
            ? dark
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-emerald-50 border-emerald-300"
            : cardBg
        }`}
      >
        <div className="text-xs font-semibold uppercase mb-2 opacity-70">Bester Pfad (Dijkstra)</div>
        {result.path.length > 0 && result.cost !== Infinity ? (
          <>
            <div className="font-mono text-lg">{result.path.join("  →  ")}</div>
            <div className={`text-sm mt-1 ${subText}`}>
              Gesamt-Cost: <strong>{result.cost}</strong>
            </div>
            <div className={`text-xs mt-2 ${subText}`}>
              In der Routing-Tabelle erscheint dieser Pfad als <code>O</code>-Eintrag mit Metric ={" "}
              <strong>{result.cost}</strong>.
            </div>
          </>
        ) : (
          <div className={`text-sm ${subText}`}>Kein Pfad zwischen {src} und {dst} gefunden.</div>
        )}
      </div>

      {/* Praxis-Hinweis */}
      <div className={`rounded-lg border p-4 ${cardBg}`}>
        <h4 className="font-semibold text-sm mb-2">Praxis-Tipp: Cost manuell setzen</h4>
        <pre className={`text-xs font-mono overflow-x-auto p-2 rounded ${dark ? "bg-slate-900" : "bg-slate-100"}`}>
{`R1(config)# interface Gi0/1
R1(config-if)# ip ospf cost 5         ! überschreibt die berechnete Cost

R1(config)# router ospf 1
R1(config-router)# auto-cost reference-bandwidth 100000
! → empfohlen, damit GigE/10GigE unterscheidbar bleiben.
! → MUSS auf ALLEN Routern der Area identisch sein, sonst asymmetrisches Routing!`}
        </pre>
      </div>
    </div>
  );
}

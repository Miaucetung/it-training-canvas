// ============================================================
// OsiSimulatorDialog — Interaktiver OSI-Encapsulation-Simulator
// ----------------------------------------------------------
// Animiert Encapsulation (Send) & Decapsulation (Receive)
// über alle 7 OSI-Schichten am Beispiel HTTP GET → Webserver.
// Pro Schicht: PDU-Name, Header-Aufbau (Bytes), logische &
// physikalische Abläufe, Cisco-Geräte und Hex-Beispiele.
// ============================================================

import {
  ArrowDown,
  ArrowUp,
  Pause,
  Play,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { ModalPortal } from "@/components/ui/modal-portal";

interface Props {
  dark?: boolean;
  onClose: () => void;
}

// ── Layer-Definitionen ──────────────────────────────────────
type Direction = "send" | "receive";

interface HeaderField {
  name: string;
  bytes: string; // z.B. "2" oder "4"
  value: string;
  explain: string;
}

interface LayerDef {
  num: number;
  name: string;
  shortName: string;
  pdu: string; // PDU-Bezeichnung
  color: string;
  protocols: string[];
  devices: string[];
  logicalRole: string;
  physicalRole: string;
  encapAction: string; // was passiert beim Senden
  decapAction: string; // was passiert beim Empfangen
  /** Headerstruktur (für Visualisierung) */
  headerFields: HeaderField[];
  /** Bytes Overhead, die diese Schicht beim Encap hinzufügt */
  headerBytes: number;
  trailerBytes?: number;
  /** Beispiel-Hex-Dump (gekürzt) */
  hexExample?: string;
}

const LAYERS: LayerDef[] = [
  {
    num: 7,
    name: "Application",
    shortName: "App",
    pdu: "Data",
    color: "var(--osi-layer-7)",
    protocols: ["HTTP/HTTPS", "DNS", "FTP", "SMTP", "SSH", "DHCP"],
    devices: ["Browser", "Mail-Client", "Webserver"],
    logicalRole:
      "Stellt Netzwerk-Dienste für Anwendungen bereit. Der Browser erzeugt hier den HTTP-Request — ein klar lesbarer Text wie 'GET /index.html HTTP/1.1'. Auf dieser Schicht spricht der User die 'Sprache' der Anwendung (HTML, JSON, …).",
    physicalRole:
      "Keine physikalische Komponente. Software-Library (z. B. libcurl, browser-engine) übergibt die Nutzdaten an das Betriebssystem.",
    encapAction:
      "Anwendung erzeugt Nutzdaten und übergibt sie an die Session-/Transport-Schicht.",
    decapAction:
      "Application empfängt die rohen Nutzdaten (z. B. HTML) und stellt sie dar.",
    headerBytes: 0,
    headerFields: [
      {
        name: "Methode",
        bytes: "var",
        value: "GET",
        explain: "HTTP-Methode (GET/POST/PUT/DELETE)",
      },
      {
        name: "Pfad",
        bytes: "var",
        value: "/index.html",
        explain: "Angeforderte Ressource",
      },
      {
        name: "Host-Header",
        bytes: "var",
        value: "Host: example.com",
        explain: "Virtual-Host-Trennung — welcher Webserver soll antworten",
      },
    ],
    hexExample:
      "47 45 54 20 2f 69 6e 64 65 78 2e 68 74 6d 6c 20  GET /index.html\n48 54 54 50 2f 31 2e 31 0d 0a                    HTTP/1.1..",
  },
  {
    num: 6,
    name: "Presentation",
    shortName: "Pres",
    pdu: "Data",
    color: "var(--osi-layer-6)",
    protocols: ["TLS/SSL", "ASCII", "UTF-8", "JPEG", "Gzip"],
    devices: ["Betriebssystem", "TLS-Bibliothek (OpenSSL)"],
    logicalRole:
      "Übersetzt zwischen Anwendungsdarstellung und Netzwerkformat. Verschlüsselt mit TLS, komprimiert mit gzip, kodiert Zeichen (UTF-8/ASCII), serialisiert (JSON/XML).",
    physicalRole:
      "Reine Software — die CPU rechnet z. B. AES-GCM für TLS. In Hardware: TLS-Offload auf NICs (Intel QAT).",
    encapAction:
      "Daten werden in das Netzwerk-Format konvertiert: TLS-Encrypt, gzip-Compress, UTF-8-Encode.",
    decapAction:
      "Empfänger entschlüsselt TLS, dekomprimiert gzip, decodiert UTF-8.",
    headerBytes: 0,
    headerFields: [
      {
        name: "TLS-Record-Type",
        bytes: "1",
        value: "0x17",
        explain: "0x17 = Application Data",
      },
      {
        name: "TLS-Version",
        bytes: "2",
        value: "0x0303",
        explain: "TLS 1.2/1.3",
      },
      {
        name: "Länge",
        bytes: "2",
        value: "0x0145",
        explain: "Nutzlast-Länge in Bytes",
      },
    ],
  },
  {
    num: 5,
    name: "Session",
    shortName: "Sess",
    pdu: "Data",
    color: "var(--osi-layer-5)",
    protocols: ["NetBIOS", "RPC", "PPTP", "SOCKS"],
    devices: ["Betriebssystem"],
    logicalRole:
      "Öffnet, verwaltet und schließt logische Dialoge zwischen Anwendungen. Steuert Halb-/Vollduplex, Synchronisationspunkte und Wiederaufnahme abgebrochener Sessions.",
    physicalRole:
      "Reine Software-Schicht — vom OS verwaltete Datenstrukturen.",
    encapAction: "Session-Kontext (z. B. SSL-Session-ID) wird verknüpft.",
    decapAction:
      "Empfänger ordnet eingehende Daten der richtigen Session zu.",
    headerBytes: 0,
    headerFields: [
      {
        name: "Session-ID",
        bytes: "var",
        value: "0x4f8a...",
        explain: "Eindeutige Session-Kennung",
      },
    ],
  },
  {
    num: 4,
    name: "Transport",
    shortName: "TCP",
    pdu: "Segment",
    color: "var(--osi-layer-4)",
    protocols: ["TCP", "UDP", "QUIC"],
    devices: ["Betriebssystem-Kernel"],
    logicalRole:
      "Ende-zu-Ende-Kommunikation. TCP garantiert Zustellung (3-Wege-Handshake, ACKs, Retransmit, Flow-Control). UDP überträgt unzuverlässig aber schnell. Multiplexing über Ports (16 Bit, 0–65535).",
    physicalRole:
      "Berechnet im Linux-/Windows-Kernel. NICs bieten 'TCP-Segmentation-Offload' (TSO/LSO) — der NIC zerlegt große Buffer in MTU-Segmente.",
    encapAction:
      "Daten werden in Segmente zerteilt (≤ MSS, typisch 1460 B). 20-Byte-TCP-Header mit Source-/Dest-Port, Seq-Nr, ACK-Nr, Flags, Checksumme angehängt.",
    decapAction:
      "Empfänger sortiert Segmente nach Seq-Nr, bestätigt mit ACKs, setzt Bytestrom für die Anwendung zusammen.",
    headerBytes: 20,
    headerFields: [
      {
        name: "Source Port",
        bytes: "2",
        value: "49152",
        explain: "Zufälliger Ephemeral-Port des Clients",
      },
      {
        name: "Dest Port",
        bytes: "2",
        value: "80",
        explain: "HTTP-Wellknown-Port",
      },
      {
        name: "Sequence Nr",
        bytes: "4",
        value: "0x1a2b3c4d",
        explain: "Bytenummer dieses Segments im Bytestrom",
      },
      {
        name: "ACK Nr",
        bytes: "4",
        value: "0x5e6f7a8b",
        explain: "Nächstes erwartetes Byte des Gegenübers",
      },
      {
        name: "Flags",
        bytes: "1",
        value: "PSH+ACK",
        explain: "SYN/ACK/FIN/PSH/RST/URG — Verbindungssteuerung",
      },
      {
        name: "Window",
        bytes: "2",
        value: "65535",
        explain: "Wie viele Bytes der Empfänger noch puffern kann",
      },
      {
        name: "Checksum",
        bytes: "2",
        value: "0xa1b2",
        explain: "Prüfsumme über Header + Daten",
      },
    ],
    hexExample:
      "c0 00 00 50 1a 2b 3c 4d 5e 6f 7a 8b 50 18 ff ff  ...P.+<M^oz.P...\na1 b2 00 00                                       ....",
  },
  {
    num: 3,
    name: "Network",
    shortName: "IP",
    pdu: "Packet",
    color: "var(--osi-layer-3)",
    protocols: ["IPv4", "IPv6", "ICMP", "OSPF", "EIGRP"],
    devices: ["Router", "L3-Switch", "Firewall"],
    logicalRole:
      "Logische Adressierung mit IP-Adressen, Routing zwischen Netzen. TTL verhindert Endlos-Schleifen. Fragmentation, falls Paket größer als MTU des nächsten Links.",
    physicalRole:
      "Router führen Longest-Prefix-Match in der Routing-Tabelle aus — heute in ASIC/TCAM-Hardware in nanosekunden. TTL wird bei jedem Hop um 1 dekrementiert; bei 0 → ICMP Time-Exceeded.",
    encapAction:
      "20-Byte-IPv4-Header (40 B bei IPv6) angehängt: Source-IP, Dest-IP, TTL=64, Protocol=6 (TCP), Checksumme.",
    decapAction:
      "Router prüft Dest-IP gegen Routing-Tabelle, verringert TTL, schreibt L2-Header neu. Endgerät: prüft eigene IP und reicht an L4 weiter.",
    headerBytes: 20,
    headerFields: [
      {
        name: "Version",
        bytes: "0.5",
        value: "4",
        explain: "IPv4 oder IPv6 (im selben Halbbyte: IHL)",
      },
      {
        name: "TTL",
        bytes: "1",
        value: "64",
        explain: "Maximale Hop-Anzahl — verhindert Loops",
      },
      {
        name: "Protocol",
        bytes: "1",
        value: "6",
        explain: "6 = TCP, 17 = UDP, 1 = ICMP, 89 = OSPF",
      },
      {
        name: "Header-Checksum",
        bytes: "2",
        value: "0xb1c2",
        explain: "Nur über den Header — bei jedem Hop neu berechnet",
      },
      {
        name: "Source IP",
        bytes: "4",
        value: "192.168.1.42",
        explain: "Absender (privates Netz)",
      },
      {
        name: "Dest IP",
        bytes: "4",
        value: "93.184.216.34",
        explain: "Ziel (example.com)",
      },
    ],
    hexExample:
      "45 00 02 d4 0a 1b 40 00 40 06 b1 c2 c0 a8 01 2a  E.....@.@......*\n5d b8 d8 22                                       ]..\"",
  },
  {
    num: 2,
    name: "Data Link",
    shortName: "Eth",
    pdu: "Frame",
    color: "var(--osi-layer-2)",
    protocols: ["Ethernet", "802.11 WLAN", "PPP", "HDLC"],
    devices: ["Switch", "Bridge", "Wireless AP", "NIC"],
    logicalRole:
      "Lokale Adressierung mit MAC. Frame-Definition mit Preamble, SFD, Header (Ziel-MAC, Quell-MAC, EtherType), Payload und FCS-Trailer (CRC32). Bei VLAN: 802.1Q-Tag dazwischen.",
    physicalRole:
      "Switch-ASIC liest in <1 µs Ziel-MAC und schreibt den Frame auf den korrekten Ausgangsport. ARP fragt zuerst per Broadcast: 'Wem gehört IP 93.184.216.34?' → MAC für den Next-Hop. CRC32-Trailer wird hardware-berechnet.",
    encapAction:
      "14-Byte-Ethernet-Header (Dest-MAC, Src-MAC, EtherType 0x0800 für IPv4) + 4-Byte-FCS-Trailer (CRC32). Bei VLAN: +4 B 802.1Q-Tag.",
    decapAction:
      "NIC prüft Ziel-MAC (Unicast = eigene MAC oder Broadcast). FCS wird verifiziert — bei Fehler: Frame verworfen. Payload geht an L3.",
    headerBytes: 14,
    trailerBytes: 4,
    headerFields: [
      {
        name: "Preamble + SFD",
        bytes: "8",
        value: "AA AA … AB",
        explain: "Synchronisation des Empfängers — vom NIC verarbeitet, nicht Teil des FCS",
      },
      {
        name: "Dest MAC",
        bytes: "6",
        value: "00:1b:21:3c:4d:5e",
        explain: "Ziel-MAC (Next-Hop-Router, NICHT Webserver!)",
      },
      {
        name: "Source MAC",
        bytes: "6",
        value: "00:0c:29:11:22:33",
        explain: "MAC des sendenden Adapters",
      },
      {
        name: "EtherType",
        bytes: "2",
        value: "0x0800",
        explain: "0x0800 = IPv4, 0x86DD = IPv6, 0x8100 = 802.1Q VLAN",
      },
      {
        name: "Payload",
        bytes: "46–1500",
        value: "IP-Paket",
        explain: "MTU: standard 1500 B (Jumbo: bis 9000 B)",
      },
      {
        name: "FCS (CRC32)",
        bytes: "4",
        value: "0xdeadbeef",
        explain: "Trailer — Bit-Fehler-Erkennung über gesamtes Frame",
      },
    ],
    hexExample:
      "00 1b 21 3c 4d 5e 00 0c 29 11 22 33 08 00         ..!<M^..)\"3..\n[IP-Paket]\nde ad be ef                                       ....",
  },
  {
    num: 1,
    name: "Physical",
    shortName: "PHY",
    pdu: "Bit",
    color: "var(--osi-layer-1)",
    protocols: ["10/100/1000BASE-T", "1000BASE-SX", "802.11 PHY", "DOCSIS"],
    devices: ["Kabel (Cat6a, OM4)", "Hub", "Repeater", "Transceiver (SFP+)"],
    logicalRole:
      "Codierung von 1en und 0en: 4B5B, 8B/10B, NRZ, PAM-4. Definiert Pin-Belegung, Spannungen, Wellenlängen, Modulation, Symbolrate.",
    physicalRole:
      "Echte Elektronen oder Photonen wandern durch Kupfer/Glasfaser. NIC-PHY-Chip moduliert das Signal. 1000BASE-T nutzt alle 4 Adernpaare gleichzeitig mit PAM-5. Glasfaser nutzt OSI-Schicht 1 mit Lichtimpulsen (typ. 850 nm Multi-Mode, 1310/1550 nm Single-Mode).",
    encapAction:
      "Der NIC-PHY wandelt das Frame in elektrische/optische Symbole und sendet sie auf das Medium.",
    decapAction:
      "Empfänger-PHY tastet die Signale ab, rekonstruiert Bits und übergibt das Frame an L2.",
    headerBytes: 0,
    headerFields: [
      {
        name: "Symbolrate",
        bytes: "—",
        value: "125 MBd",
        explain: "1000BASE-T: 125 Megabaud pro Adernpaar × 4 Paare = 1 Gbit/s",
      },
      {
        name: "Codierung",
        bytes: "—",
        value: "PAM-5",
        explain: "5 Spannungspegel pro Symbol — robuster gegen Störungen",
      },
      {
        name: "Reichweite",
        bytes: "—",
        value: "100 m",
        explain: "Cat5e/6: 100 m max., Glasfaser SM: bis 80 km",
      },
    ],
  },
];

// ── Cumulative bytes for visualization ─────────────────────
function cumulativeBytes(uptoLayerIdx: number): number {
  // direction: send → from layer idx 0 (App) down to L1
  // We compute total bytes after this layer has wrapped
  let total = 50; // assume 50 B HTTP payload
  for (let i = 0; i <= uptoLayerIdx; i++) {
    total += LAYERS[i].headerBytes + (LAYERS[i].trailerBytes ?? 0);
  }
  return total;
}

// ── Component ───────────────────────────────────────────────
export function OsiSimulatorDialog({ onClose }: Props) {
  const [direction, setDirection] = useState<Direction>("send");
  const [step, setStep] = useState(0); // 0..6
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1500); // ms per step

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setStep((s) => {
        if (s >= 6) {
          setRunning(false);
          return s;
        }
        return s + 1;
      });
    }, speed);
    return () => window.clearInterval(t);
  }, [running, speed]);

  // Reset step on direction change
  useEffect(() => {
    setStep(0);
    setRunning(false);
  }, [direction]);

  // For "send" direction: active layer is LAYERS[step] (L7 → L1)
  // For "receive" direction: we reverse — active layer is LAYERS[6 - step] (L1 → L7)
  const activeLayerIdx = direction === "send" ? step : 6 - step;
  const activeLayer = LAYERS[activeLayerIdx];

  const reset = () => {
    setStep(0);
    setRunning(false);
  };

  const playPause = () => setRunning((r) => !r);

  // Determine which layers are "wrapped" (i.e. their header is currently visible)
  // In send: layers 0..step have wrapped → growing PDU
  // In receive: layers 6..(6-step) have been unwrapped → shrinking PDU
  const wrappedLayerIdxs = useMemo(() => {
    if (direction === "send") {
      // layers 0..step have added their header
      return new Set(Array.from({ length: step + 1 }, (_, i) => i));
    } else {
      // Start with all wrapped (since receive starts at L1)
      // After step k (k=0..6), layers (6-k+1)..6 are still wrapped
      // Wait: at step 0 we're at L1, we haven't unwrapped yet → all layers 0..6 are wrapped (incoming frame)
      // At step 6 we reach L7 → nothing is wrapped anymore
      const stillWrapped = new Set<number>();
      for (let i = 0; i < 7; i++) {
        if (i < 6 - step) stillWrapped.add(i); // 6-step is the layer being unwrapped now
      }
      // Also include the currently-being-unwrapped layer so it shows highlighted in the stack
      return stillWrapped;
    }
  }, [direction, step]);

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="OSI-Simulator"
        className="fixed inset-0 z-dialog flex items-center justify-center bg-black/60 p-3"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-[1200px] max-h-[94vh] overflow-y-auto rounded-2xl border shadow-2xl bg-card border-border text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-card border-border"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-status-trunk-bg text-status-trunk-fg"
              >
                📦
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  OSI Encapsulation Simulator
                </h2>
                <p className="text-xs text-muted-foreground">
                  Beispiel: Browser ruft <code>http://example.com/index.html</code> ab
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="p-2 rounded-lg hover:bg-muted"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Toolbar */}
          <div
            className="sticky top-[73px] z-10 flex flex-wrap items-center gap-3 px-6 py-3 border-b bg-card/95 border-border"
          >
            <div
              className="inline-flex rounded-lg overflow-hidden border border-border"
            >
              <button
                onClick={() => setDirection("send")}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${
                  direction === "send"
                    ? "bg-status-trunk-solid text-on-status-trunk-solid"
                    : "hover:bg-muted"
                }`}
              >
                <ArrowDown size={14} weight="bold" /> Encapsulation (Send)
              </button>
              <button
                onClick={() => setDirection("receive")}
                className={`px-3 py-1.5 text-sm flex items-center gap-1.5 ${
                  direction === "receive"
                    ? "bg-status-success-solid text-on-status-success-solid"
                    : "hover:bg-muted"
                }`}
              >
                <ArrowUp size={14} weight="bold" /> Decapsulation (Receive)
              </button>
            </div>

            <div className="h-6 w-px bg-muted-foreground/30" />

            <button
              onClick={playPause}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold bg-accent-primary/15 hover:bg-accent-primary/25 text-accent-primary-fg"
            >
              {running ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
              {running ? "Pause" : step >= 6 ? "Neu starten" : "Play"}
            </button>

            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg text-sm border border-border hover:bg-muted"
            >
              ↺ Reset
            </button>

            <div className="flex items-center gap-2 text-xs ml-auto">
              <span className="text-muted-foreground">Schritt:</span>
              <input
                type="range"
                aria-label="Schritt"
                min={0}
                max={6}
                value={step}
                onChange={(e) => {
                  setStep(Number(e.target.value));
                  setRunning(false);
                }}
                className="w-32"
              />
              <span className="font-mono w-12">
                {step + 1}/7
              </span>
              <span className="text-muted-foreground ml-3">Speed:</span>
              <select
                aria-label="Geschwindigkeit"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="text-xs rounded px-2 py-1 border bg-card border-border text-foreground"
              >
                <option value={3000}>0.3×</option>
                <option value={1500}>1×</option>
                <option value={750}>2×</option>
                <option value={300}>4×</option>
              </select>
            </div>
          </div>

          {/* Body */}
          <div className="grid lg:grid-cols-[420px_1fr] gap-5 p-6">
            {/* Layer-Stack */}
            <div
              className="rounded-xl border p-4 border-border bg-muted/40"
            >
              <div className="text-xs text-muted-foreground mb-2">
                {direction === "send"
                  ? "Daten gehen DOWN durch den Stack — jede Schicht hängt einen Header an."
                  : "Daten kommen vom Kabel UP durch den Stack — jede Schicht streift ihren Header ab."}
              </div>
              <div className="space-y-1.5">
                {LAYERS.map((l, i) => {
                  const active = i === activeLayerIdx;
                  const wrapped = wrappedLayerIdxs.has(i);
                  return (
                    <button
                      key={l.num}
                      onClick={() => {
                        setStep(direction === "send" ? i : 6 - i);
                        setRunning(false);
                      }}
                      className={`w-full text-left rounded-lg p-2.5 transition-all border ${
                        active
                          ? "ring-2 scale-[1.02] bg-card border-border"
                          : wrapped
                            ? "bg-card border-border"
                            : "bg-muted/40 border-dashed border-border"
                      }`}
                      style={{
                        borderLeftWidth: 5,
                        borderLeftColor: l.color,
                        ...(active ? { boxShadow: `0 0 0 2px ${l.color}` } : {}),
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold font-mono w-5 text-center"
                            style={{ color: l.color }}
                          >
                            L{l.num}
                          </span>
                          <span className="text-sm font-semibold">{l.name}</span>
                        </div>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: `color-mix(in srgb, ${l.color} 10%, transparent)`,
                            color: l.color,
                          }}
                        >
                          {l.pdu}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                        {l.protocols.slice(0, 3).join(" · ")}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* PDU-Größe */}
              <div
                className="mt-4 rounded-lg p-3 text-xs bg-accent-primary/10 border border-accent-primary/30"
              >
                <div className="font-semibold mb-1">Aktuelle PDU-Größe</div>
                <div className="font-mono">
                  {direction === "send"
                    ? `${cumulativeBytes(activeLayerIdx)} Bytes nach L${activeLayer.num}`
                    : `${cumulativeBytes(activeLayerIdx)} Bytes vor L${activeLayer.num}-Decap`}
                </div>
                <div className="text-muted-foreground mt-1">
                  Annahme: 50 B HTTP-Payload + Header pro Schicht
                </div>
              </div>
            </div>

            {/* Detail */}
            <div className="space-y-4">
              {/* Animierte Frame-Darstellung */}
              <div
                className="rounded-xl border p-4 border-border bg-muted/40"
              >
                <div className="text-xs text-muted-foreground mb-2">
                  Aktuelle PDU-Struktur (visuell)
                </div>
                <div className="flex items-stretch gap-1 overflow-x-auto py-2">
                  {/* Header der gewrappten Layers (von außen nach innen) */}
                  {LAYERS.filter((_, i) => wrappedLayerIdxs.has(i) && LAYERS[i].headerBytes > 0).map((l) => (
                    <div
                      key={`h-${l.num}`}
                      className="flex flex-col items-center justify-center px-2 py-3 rounded text-xs font-mono whitespace-nowrap"
                      style={{
                        background: `color-mix(in srgb, ${l.color} 10%, transparent)`,
                        color: l.color,
                        border: `1.5px solid ${l.color}`,
                        minWidth: 70,
                      }}
                    >
                      <div className="font-bold">L{l.num}-HDR</div>
                      <div className="text-[10px]">{l.headerBytes} B</div>
                    </div>
                  ))}
                  {/* Payload */}
                  <div
                    className="flex flex-col items-center justify-center px-4 py-3 rounded text-xs font-mono bg-muted text-foreground"
                    style={{ minWidth: 100 }}
                  >
                    <div className="font-bold">PAYLOAD</div>
                    <div className="text-[10px]">~50 B</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      GET /index.html
                    </div>
                  </div>
                  {/* Trailer der gewrappten Layers (umgekehrt: innerster zuerst → äußerster letzter) */}
                  {LAYERS.filter((_, i) => wrappedLayerIdxs.has(i) && (LAYERS[i].trailerBytes ?? 0) > 0)
                    .slice()
                    .reverse()
                    .map((l) => (
                      <div
                        key={`t-${l.num}`}
                        className="flex flex-col items-center justify-center px-2 py-3 rounded text-xs font-mono whitespace-nowrap"
                        style={{
                          background: `color-mix(in srgb, ${l.color} 10%, transparent)`,
                          color: l.color,
                          border: `1.5px solid ${l.color}`,
                          minWidth: 70,
                        }}
                      >
                        <div className="font-bold">L{l.num}-FCS</div>
                        <div className="text-[10px]">{l.trailerBytes} B</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Aktuelle Schicht — Detail */}
              <div
                className="rounded-xl border-2 p-5 space-y-4"
                style={{ borderColor: activeLayer.color }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-2xl font-bold font-mono"
                        style={{ color: activeLayer.color }}
                      >
                        L{activeLayer.num}
                      </span>
                      <h3 className="text-xl font-semibold">
                        {activeLayer.name}
                      </h3>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      PDU: <strong>{activeLayer.pdu}</strong> · Header: {activeLayer.headerBytes} B
                      {activeLayer.trailerBytes ? ` + Trailer: ${activeLayer.trailerBytes} B` : ""}
                    </div>
                  </div>
                  <div
                    className="text-xs px-2 py-1 rounded font-mono"
                    style={{
                      background: `color-mix(in srgb, ${activeLayer.color} 15%, transparent)`,
                      color: activeLayer.color,
                    }}
                  >
                    {direction === "send" ? "→ Encapsulation" : "← Decapsulation"}
                  </div>
                </div>

                {/* Aktion */}
                <div
                  className="rounded-lg p-3"
                  style={{
                    background:
                      direction === "send"
                        ? `color-mix(in srgb, ${activeLayer.color} 8%, transparent)`
                        : `color-mix(in srgb, ${activeLayer.color} 6%, transparent)`,
                    borderLeft: `3px solid ${activeLayer.color}`,
                  }}
                >
                  <div className="text-xs font-semibold mb-1 uppercase tracking-wide">
                    Was passiert genau?
                  </div>
                  <p className="text-sm">
                    {direction === "send"
                      ? activeLayer.encapAction
                      : activeLayer.decapAction}
                  </p>
                </div>

                {/* Logical / Physical */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div
                    className="rounded-lg p-3 border bg-accent-primary/5 border-accent-primary/30"
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-wide mb-1 text-accent-primary-fg"
                    >
                      🧠 Logischer Ablauf
                    </div>
                    <p className="text-sm leading-snug">
                      {activeLayer.logicalRole}
                    </p>
                  </div>
                  <div
                    className="rounded-lg p-3 border bg-status-blocking-bg border-status-blocking-border/30"
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-wide mb-1 text-status-blocking-fg"
                    >
                      ⚙ Physischer Ablauf
                    </div>
                    <p className="text-sm leading-snug">
                      {activeLayer.physicalRole}
                    </p>
                  </div>
                </div>

                {/* Header-Felder */}
                <div>
                  <div className="text-sm font-semibold mb-2">
                    Header-Felder ({activeLayer.headerBytes} Byte
                    {activeLayer.trailerBytes ? ` + ${activeLayer.trailerBytes} B Trailer` : ""})
                  </div>
                  <div
                    className="rounded-lg border overflow-hidden border-border"
                  >
                    <table className="w-full text-xs">
                      <thead
                        className="text-left bg-muted text-muted-foreground"
                      >
                        <tr>
                          <th className="py-1.5 px-2">Feld</th>
                          <th className="py-1.5 px-2">Bytes</th>
                          <th className="py-1.5 px-2">Beispielwert</th>
                          <th className="py-1.5 px-2">Erklärung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeLayer.headerFields.map((f, i) => (
                          <tr
                            key={i}
                            className="border-t border-border"
                          >
                            <td className="py-1.5 px-2 font-mono font-semibold">
                              {f.name}
                            </td>
                            <td className="py-1.5 px-2 font-mono text-muted-foreground">
                              {f.bytes}
                            </td>
                            <td
                              className="py-1.5 px-2 font-mono"
                              style={{ color: activeLayer.color }}
                            >
                              {f.value}
                            </td>
                            <td className="py-1.5 px-2">
                              {f.explain}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Protokolle & Geräte */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold mb-1">Protokolle</div>
                    <div className="flex flex-wrap gap-1">
                      {activeLayer.protocols.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded font-mono bg-muted"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Cisco-Geräte / Komponenten</div>
                    <div className="flex flex-wrap gap-1">
                      {activeLayer.devices.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded bg-muted"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hex Example */}
                {activeLayer.hexExample && (
                  <div>
                    <div className="text-sm font-semibold mb-2">
                      Hex-Beispiel (auf dem Draht)
                    </div>
                    <pre
                      className="rounded-lg p-3 text-[11px] font-mono leading-relaxed overflow-x-auto bg-terminal-bg text-terminal-fg border border-terminal-border"
                    >
                      {activeLayer.hexExample}
                    </pre>
                  </div>
                )}
              </div>

              {/* Lernzusammenfassung */}
              <div
                className="rounded-xl border p-4 text-xs border-status-trunk-border/30 bg-status-trunk-bg text-status-trunk-fg"
              >
                <div className="font-semibold mb-2">💡 Merke</div>
                <ul className="space-y-1 list-disc ml-5">
                  <li>
                    <strong>Encapsulation</strong> = Sender hängt Header von oben (L7) nach unten (L1) an
                  </li>
                  <li>
                    <strong>Decapsulation</strong> = Empfänger streift Header von unten (L1) nach oben (L7) ab
                  </li>
                  <li>
                    <strong>MAC ändert sich</strong> bei jedem Hop (Router schreibt L2 neu) — <strong>IP bleibt gleich</strong>
                  </li>
                  <li>
                    <strong>TTL</strong> wird bei jedem Hop um 1 verringert
                  </li>
                  <li>
                    Eselsbrücke L7→L1: <em>All People Seem To Need Data Processing</em>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

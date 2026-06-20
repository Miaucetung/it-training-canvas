import { useMemo, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cidrRow } from "@/lib/subnet-reference";

// ============================================================
// Subnetting-Cheatsheet — Referenz + interaktiver Rechner.
// Default-Export, keine Pflicht-Props. Adaptiert über shadcn-Tokens
// automatisch an Light/Dark (.dark-Klasse am Root).
// ============================================================

const EXAM_FREQUENT = new Set([25, 28, 29, 30]);
const CHEAT_CIDRS = [24, 25, 26, 27, 28, 29, 30, 32];

const VLSM_PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6"];

/** Blockgröße im letzten Oktett (256 für /≤24). */
function blockSize(cidr: number): number {
  return Math.pow(2, 32 - cidr) > 256 ? 256 : Math.pow(2, 32 - cidr);
}

function maskLastOctet(cidr: number): number {
  return 256 - blockSize(cidr);
}

// ── kleine Bausteine ────────────────────────────────────────

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="scroll-mt-16">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 font-mono text-xs font-bold text-primary">
            {n}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">{children}</CardContent>
    </Card>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  );
}

// ── Section 6: interaktiver Rechner ─────────────────────────

function PracticeWidget() {
  const [ipOctet, setIpOctet] = useState("214");
  const [cidr, setCidr] = useState(29);
  const [ip2Octet, setIp2Octet] = useState("");

  const result = useMemo(() => {
    const ip = Number.parseInt(ipOctet, 10);
    if (Number.isNaN(ip) || ip < 0 || ip > 255) return null;
    const block = blockSize(cidr);
    const network = Math.floor(ip / block) * block;
    const broadcast = network + block - 1;

    let secondSame: boolean | null = null;
    const ip2 = Number.parseInt(ip2Octet, 10);
    if (!Number.isNaN(ip2) && ip2 >= 0 && ip2 <= 255) {
      secondSame = Math.floor(ip2 / block) * block === network;
    }
    return { ip, block, network, broadcast, secondSame, ip2 };
  }, [ipOctet, cidr, ip2Octet]);

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/50";
  const labelCls = "mb-1 block text-xs font-medium text-muted-foreground";

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="cs-ip">
            Host-IP (letztes Oktett)
          </label>
          <input
            id="cs-ip"
            type="number"
            min={0}
            max={255}
            inputMode="numeric"
            value={ipOctet}
            onChange={(e) => setIpOctet(e.target.value)}
            className={inputCls}
            placeholder="z. B. 214"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="cs-cidr">
            Präfix (CIDR)
          </label>
          <select
            id="cs-cidr"
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className={inputCls}
          >
            {[24, 25, 26, 27, 28, 29, 30, 31, 32].map((c) => (
              <option key={c} value={c}>
                /{c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="cs-ip2">
            2. IP prüfen (optional)
          </label>
          <input
            id="cs-ip2"
            type="number"
            min={0}
            max={255}
            inputMode="numeric"
            value={ip2Octet}
            onChange={(e) => setIp2Octet(e.target.value)}
            className={inputCls}
            placeholder="gleiches Subnetz?"
          />
        </div>
      </div>

      {result ? (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-sm sm:grid-cols-4">
          <Stat label="Blockgröße" value={String(result.block)} />
          <Stat label="Netzadresse" value={`.${result.network}`} accent="text-emerald-600 dark:text-emerald-400" />
          <Stat label="Broadcast" value={`.${result.broadcast}`} accent="text-rose-600 dark:text-rose-400" />
          <Stat label="Bereich" value={`.${result.network}–.${result.broadcast}`} />
          <div className="col-span-2 sm:col-span-4">
            <span className="text-xs text-muted-foreground">Maske: </span>
            <span className="font-mono">{cidrRow(cidr).mask}</span>
          </div>
          {result.secondSame !== null && (
            <div className="col-span-2 sm:col-span-4">
              <Badge
                variant={result.secondSame ? "default" : "destructive"}
                className="font-mono"
              >
                {result.secondSame
                  ? `.${result.ip2} liegt im selben Subnetz ✓`
                  : `.${result.ip2} liegt NICHT im selben Subnetz ✗`}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-xs text-rose-500">
          Bitte ein gültiges Oktett (0–255) eingeben.
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono font-semibold ${accent ?? "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

// ── Section 4: VLSM-Balken ──────────────────────────────────

interface VlsmSeg {
  prefix: string;
  start: number;
  block: number;
}
const VLSM_SEGMENTS: VlsmSeg[] = [
  { prefix: "10.10.13.0/25", start: 0, block: 128 },
  { prefix: "10.10.13.128/28", start: 128, block: 16 },
  { prefix: "10.10.13.144/28", start: 144, block: 16 },
  { prefix: "10.10.13.160/29", start: 160, block: 8 },
  { prefix: "10.10.13.208/29", start: 208, block: 8 },
];
const HIGHLIGHT_DOT = 214; // .214 — fällt in 10.10.13.208/29

function VlsmChart() {
  return (
    <div className="space-y-3">
      {/* Track: 0–255 (das /24) */}
      <div className="relative h-10 w-full overflow-hidden rounded-lg border border-border bg-muted/50">
        {VLSM_SEGMENTS.map((s, i) => (
          <div
            key={s.prefix}
            className="absolute top-0 flex h-full items-center justify-center overflow-hidden text-[10px] font-semibold text-white"
            style={{
              left: `${(s.start / 256) * 100}%`,
              width: `${(s.block / 256) * 100}%`,
              backgroundColor: VLSM_PALETTE[i % VLSM_PALETTE.length],
              borderRight: "1px solid rgba(255,255,255,0.25)",
            }}
            title={s.prefix}
          >
            <span className="truncate px-1">/{s.prefix.split("/")[1]}</span>
          </div>
        ))}
        {/* Highlight-Punkt .214 */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground"
          style={{ left: `${(HIGHLIGHT_DOT / 256) * 100}%` }}
          title={`.${HIGHLIGHT_DOT}`}
        />
        <div
          className="absolute -top-0.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: `${(HIGHLIGHT_DOT / 256) * 100}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>.0</span>
        <span>.128</span>
        <span>.255</span>
      </div>

      {/* Legende */}
      <ul className="space-y-1.5">
        {VLSM_SEGMENTS.map((s, i) => (
          <li key={s.prefix} className="flex items-center gap-2 text-xs">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: VLSM_PALETTE[i % VLSM_PALETTE.length] }}
            />
            <span className="font-mono font-semibold">{s.prefix}</span>
            <span className="font-mono text-muted-foreground">
              .{s.start}–.{s.start + s.block - 1}
            </span>
            <Badge variant="secondary" className="font-mono">
              {s.block} Adr.
            </Badge>
            {s.start <= HIGHLIGHT_DOT && HIGHLIGHT_DOT <= s.start + s.block - 1 && (
              <Badge className="font-mono">enthält .{HIGHLIGHT_DOT}</Badge>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── /29-Grenzen-Sequenz ─────────────────────────────────────
const SEQ_29: string[] = Array.from({ length: 256 / 8 }, (_, i) => {
  const s = i * 8;
  return `.${s}–.${s + 7}`;
});

// ── Hauptkomponente ─────────────────────────────────────────

export default function SubnettingCheatsheet() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">Subnetting-Cheatsheet</h1>
        <p className="text-sm text-muted-foreground">
          Blockgrößen, Grenzen, VLSM und die schnelle Kopfrechen-Methode für die
          CCNA-Prüfung.
        </p>
      </header>

      {/* Sticky Mini-Referenz */}
      <div className="sticky top-0 z-10 -mx-4 border-y border-border bg-background/90 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
          <span className="font-semibold text-muted-foreground">Blockgrößen:</span>
          {[24, 25, 26, 27, 28, 29, 30, 31, 32].map((c) => (
            <span key={c} className="whitespace-nowrap">
              <span className="text-primary">/{c}</span>
              <span className="text-muted-foreground">:</span>
              {blockSize(c)}
            </span>
          ))}
        </div>
      </div>

      {/* Section 1 — Blockgrößen-Tabelle */}
      <Section n={1} title="Blockgrößen-Tabelle">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">CIDR</th>
                <th className="py-2 pr-3 font-semibold">Subnetzmaske</th>
                <th className="py-2 pr-3 text-right font-semibold">Blockgröße</th>
                <th className="py-2 pr-3 text-right font-semibold">Nutzbare Hosts</th>
                <th className="py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {CHEAT_CIDRS.map((c) => {
                const r = cidrRow(c);
                const hot = EXAM_FREQUENT.has(c);
                return (
                  <tr
                    key={c}
                    className={`border-b border-border/60 ${
                      hot ? "bg-amber-50 dark:bg-amber-500/10" : ""
                    }`}
                  >
                    <td className="py-1.5 pr-3 font-mono font-semibold text-primary">
                      /{c}
                    </td>
                    <td className="py-1.5 pr-3 font-mono">{r.mask}</td>
                    <td className="py-1.5 pr-3 text-right font-mono">{r.blockSize}</td>
                    <td className="py-1.5 pr-3 text-right font-mono">
                      {c === 32 ? "1 (Host)" : r.usableHosts}
                    </td>
                    <td className="py-1.5">
                      {hot && (
                        <Badge variant="secondary" className="text-[10px]">
                          prüfungsrelevant
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Section 2 — Blockgrößen-Trick */}
      <Section n={2} title="Der Blockgrößen-Trick">
        <p>
          Die Blockgröße ist <strong>256 minus das letzte Oktett der Subnetzmaske</strong>.
          Kein Taschenrechner nötig.
        </p>
        <div className="rounded-lg bg-muted p-3 font-mono text-sm">
          Blockgröße = 256 − (letztes Oktett der Maske)
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[25, 28, 29].map((c) => (
            <div
              key={c}
              className="rounded-lg border border-border p-3 font-mono text-sm"
            >
              <div className="text-muted-foreground">/{c}</div>
              <div>
                256 − {maskLastOctet(c)} ={" "}
                <span className="font-bold text-primary">{blockSize(c)}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 3 — Subnetzgrenzen finden */}
      <Section n={3} title="Subnetzgrenzen finden">
        <p>
          Subnetze beginnen <strong>immer bei Vielfachen der Blockgröße</strong>. Für
          /29 (Blockgröße <Code>8</Code>):
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SEQ_29.map((rng) => (
            <span
              key={rng}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]"
            >
              {rng}
            </span>
          ))}
        </div>
        <div className="rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed">
          Netzadresse = ⌊ IP ÷ Blockgröße ⌋ × Blockgröße
          <br />
          Broadcast&nbsp;&nbsp;&nbsp;= Netzadresse + Blockgröße − 1
        </div>
        <div className="space-y-2">
          {[
            {
              ip: "10.10.13.214 /29",
              steps: "Blockgröße 8 → ⌊214 ÷ 8⌋ = 26 → 26 × 8 = 208",
              range: ".208–.215",
            },
            {
              ip: "10.10.13.10 /25",
              steps: "Blockgröße 128 → ⌊10 ÷ 128⌋ = 0 → 0 × 128 = 0",
              range: ".0–.127",
            },
          ].map((ex) => (
            <div
              key={ex.ip}
              className="rounded-lg border border-border p-3 font-mono text-xs"
            >
              <div className="font-semibold text-primary">{ex.ip}</div>
              <div className="text-muted-foreground">{ex.steps}</div>
              <div>
                → Bereich <span className="font-bold">{ex.range}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 4 — VLSM */}
      <Section n={4} title="VLSM erklärt">
        <p>
          <strong>VLSM</strong> (Variable Length Subnet Masking) =
          <strong> verschiedene Blockgrößen im selben Adressraum</strong>. So wird der
          Adressraum bedarfsgerecht aufgeteilt statt verschwendet.
        </p>
        <VlsmChart />
      </Section>

      {/* Section 5 — Kopfrechen-Check */}
      <Section n={5} title="Schnell-Check im Kopf (Prüfungstechnik)">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Maske lesen → Blockgröße bestimmen (<Code>256 − letztes Oktett</Code>).
          </li>
          <li>Letztes Oktett der Host-IP durch die Blockgröße teilen → Ganzzahlanteil.</li>
          <li>Wieder multiplizieren → <strong>Netzadresse</strong>.</li>
          <li>Blockgröße − 1 addieren → <strong>Broadcast</strong>.</li>
          <li>
            Prüfen: Liegt die Ziel-IP zwischen Netzadresse und Broadcast?
          </li>
        </ol>
      </Section>

      {/* Section 6 — Übungs-Widget */}
      <Section n={6} title="Übungsrechner">
        <p className="text-muted-foreground">
          Host-IP (letztes Oktett) und Präfix wählen — optional eine zweite IP auf
          „gleiches Subnetz" prüfen.
        </p>
        <PracticeWidget />
      </Section>
    </div>
  );
}

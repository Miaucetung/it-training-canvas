import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DrillMode = "identify-range" | "identify-subnet";

interface SubnetQuestion {
  id: string;
  ip: string; // e.g. "172.28.228.144"
  cidr: number; // e.g. 29
  // computed
  networkAddr: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  blockSize: number;
  usableHosts: number; // nutzbare Hosts im gesamten Subnetz (nicht block-2!)
}

interface DrillQuestion {
  subnet: SubnetQuestion;
  mode: DrillMode;
  options: string[];
  correct: string;
  explanation: string;
}

// ─── Math ─────────────────────────────────────────────────────────────────────

function calcSubnet(ip: string, cidr: number): SubnetQuestion {
  const octets = ip.split(".").map(Number);

  // /1–/8 → oct0, /9–/16 → oct1, /17–/24 → oct2, /25–/32 → oct3
  const activeOctetIdx = Math.floor((cidr - 1) / 8); // 0-based
  const bitsInOctet = cidr - activeOctetIdx * 8;
  const maskOctet = 256 - Math.pow(2, 8 - bitsInOctet);
  const blockSize = 256 - maskOctet;

  // network address
  const netOctets = [...octets];
  netOctets[activeOctetIdx] =
    Math.floor(octets[activeOctetIdx] / blockSize) * blockSize;
  for (let i = activeOctetIdx + 1; i < 4; i++) netOctets[i] = 0;

  // broadcast
  const bcOctets = [...netOctets];
  bcOctets[activeOctetIdx] = netOctets[activeOctetIdx] + blockSize - 1;
  for (let i = activeOctetIdx + 1; i < 4; i++) bcOctets[i] = 255;

  // first/last host
  const firstOctets = [...netOctets];
  firstOctets[3] += 1;
  const lastOctets = [...bcOctets];
  lastOctets[3] -= 1;

  // Nutzbare Hosts über das GESAMTE Subnetz (gilt auch bei Maske im 3. Oktett):
  // /31 = 2 (P2P), /32 = 1, sonst 2^(32-cidr) − 2.
  const usableHosts =
    cidr >= 32 ? 1 : cidr === 31 ? 2 : Math.pow(2, 32 - cidr) - 2;

  return {
    id: `${ip}/${cidr}`,
    ip,
    cidr,
    networkAddr: netOctets.join("."),
    broadcast: bcOctets.join("."),
    firstHost: firstOctets.join("."),
    lastHost: lastOctets.join("."),
    blockSize,
    usableHosts,
  };
}

function formatRange(q: SubnetQuestion): string {
  return `${q.firstHost} – ${q.lastHost}`;
}

// ─── Question Bank ────────────────────────────────────────────────────────────

const BASE_IPS = [
  "172.28.228.144",
  "10.10.13.208",
  "192.168.1.100",
  "10.0.0.64",
  "172.16.50.32",
  "192.168.100.200",
  "10.255.128.16",
  "172.20.15.80",
];

const CIDRS = [18, 21, 23, 25, 27, 28, 29, 30];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(forceMode?: DrillMode): DrillQuestion {
  const ip = BASE_IPS[Math.floor(Math.random() * BASE_IPS.length)];
  const cidr = CIDRS[Math.floor(Math.random() * CIDRS.length)];
  const subnet = calcSubnet(ip, cidr);
  const mode: DrillMode =
    forceMode ??
    (["identify-range", "identify-subnet"][
      Math.floor(Math.random() * 2)
    ] as DrillMode);

  if (mode === "identify-range") {
    // plausible falsche Ranges erzeugen (im 4. Oktett verschoben),
    // Duplikate und Treffer auf die korrekte Antwort herausfiltern.
    const correct = formatRange(subnet);
    const wrongs = new Set<string>();
    for (const off of shuffle([-16, -8, 8, 16, 32, -32, 64, -64])) {
      if (wrongs.size >= 3) break;
      const fakeFirst = subnet.firstHost.split(".").map(Number);
      fakeFirst[3] = Math.max(1, Math.min(253, fakeFirst[3] + off));
      const fakeLast = subnet.lastHost.split(".").map(Number);
      fakeLast[3] = Math.max(2, Math.min(254, fakeLast[3] + off));
      const candidate = `${fakeFirst.join(".")} – ${fakeLast.join(".")}`;
      if (candidate !== correct) wrongs.add(candidate);
    }
    const options = shuffle([correct, ...wrongs]);

    const maskOctetIdx = Math.floor((cidr - 1) / 8);
    const bitsInOctet = cidr - maskOctetIdx * 8;
    const maskOctet = 256 - Math.pow(2, 8 - bitsInOctet);
    const blockSize = 256 - maskOctet;
    const activeVal = subnet.ip.split(".").map(Number)[maskOctetIdx];

    return {
      subnet,
      mode,
      options,
      correct,
      explanation: `Blockgröße: 256 − ${maskOctet} = ${blockSize}. Oktett ${maskOctetIdx + 1}: floor(${activeVal} ÷ ${blockSize}) × ${blockSize} = ${Math.floor(activeVal / blockSize) * blockSize}. Netz: ${subnet.networkAddr} → Broadcast: ${subnet.broadcast} → Usable: ${correct}`,
    };
  } else {
    // identify-subnet: gegeben eine Range, welches /CIDR passt?
    const correct = `${ip}/${cidr}`;
    const wrongCidrs = shuffle(CIDRS.filter((c) => c !== cidr)).slice(0, 3);
    const options = shuffle([
      correct,
      ...wrongCidrs.map((c) => `${ip}/${c}`),
    ]);
    return {
      subnet,
      mode,
      options,
      correct,
      explanation: `Usable Range ${formatRange(subnet)} → Blockgröße ${subnet.blockSize} → Maske /${cidr}. Netz: ${subnet.networkAddr}, Broadcast: ${subnet.broadcast}.`,
    };
  }
}

// ─── Stat tracking ────────────────────────────────────────────────────────────

interface Stats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubnettingDrill() {
  const [question, setQuestion] = useState<DrillQuestion>(() =>
    generateQuestion(),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
  });
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [filterMode, setFilterMode] = useState<DrillMode | "mixed">("mixed");

  const answered = selected !== null;
  const isCorrect = selected === question.correct;

  const next = useCallback(() => {
    setSelected(null);
    setQuestion(
      generateQuestion(filterMode === "mixed" ? undefined : filterMode),
    );
  }, [filterMode]);

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    const correct = opt === question.correct;
    setStats((prev) => {
      const newStreak = correct ? prev.streak + 1 : 0;
      return {
        total: prev.total + 1,
        correct: prev.correct + (correct ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });
  };

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  // Block-Größen-Referenz
  const blockRef = [
    { cidr: 18, mask: 192, block: 64, octet: 3 },
    { cidr: 21, mask: 248, block: 8, octet: 3 },
    { cidr: 23, mask: 254, block: 2, octet: 3 },
    { cidr: 25, mask: 128, block: 128, octet: 4 },
    { cidr: 27, mask: 224, block: 32, octet: 4 },
    { cidr: 28, mask: 240, block: 16, octet: 4 },
    { cidr: 29, mask: 248, block: 8, octet: 4 },
    { cidr: 30, mask: 252, block: 4, octet: 4 },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Subnetting Drill
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Blockgröße → Netzgrenzen → Usable Range
          </p>
        </div>
        <button
          onClick={() => setShowCheatsheet((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-md border border-border
                     text-muted-foreground hover:bg-muted
                     transition-colors"
        >
          {showCheatsheet ? "Cheatsheet ▲" : "Cheatsheet ▼"}
        </button>
      </div>

      {/* ── Cheatsheet collapsible ── */}
      {showCheatsheet && (
        <div className="rounded-xl border border-border
                        bg-muted p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Formel
          </p>
          <code className="block text-xs bg-muted rounded-lg p-3
                           border border-border
                           text-foreground leading-relaxed whitespace-pre-wrap">
            {`Blockgröße  = 256 − Maskenoktett
Netzadresse = floor(IP-Oktett ÷ Blockgröße) × Blockgröße
Broadcast   = Netzadresse + Blockgröße − 1
Usable      = Netz+1  →  Broadcast−1`}
          </code>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">
            Referenz
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-1 pr-4">CIDR</th>
                  <th className="text-left py-1 pr-4">Maskenoktett</th>
                  <th className="text-left py-1 pr-4">Blockgröße</th>
                  <th className="text-left py-1">aktives Oktett</th>
                </tr>
              </thead>
              <tbody>
                {blockRef.map((r) => (
                  <tr
                    key={r.cidr}
                    className={`border-t border-border
                      ${[25, 28, 29, 30].includes(r.cidr)
                        ? "text-accent-primary-fg"
                        : "text-muted-foreground"
                      }`}
                  >
                    <td className="py-1 pr-4">/{r.cidr}</td>
                    <td className="py-1 pr-4">.{r.mask}</td>
                    <td className="py-1 pr-4">{r.block}</td>
                    <td className="py-1">{r.octet}. Oktett</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Blau = 4. Oktett · Schwarz = 3. Oktett (Falle!)
          </p>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          Fragen:{" "}
          <span className="font-semibold text-muted-foreground">
            {stats.total}
          </span>
        </span>
        <span>
          Richtig:{" "}
          <span className="font-semibold text-status-success-fg">
            {stats.correct}
          </span>
        </span>
        {accuracy !== null && (
          <span>
            Quote:{" "}
            <span
              className={`font-semibold ${
                accuracy >= 80
                  ? "text-status-success-fg"
                  : accuracy >= 60
                    ? "text-status-warning-fg"
                    : "text-status-error-fg"
              }`}
            >
              {accuracy}%
            </span>
          </span>
        )}
        {stats.streak >= 3 && (
          <span className="text-status-blocking-fg font-semibold">
            🔥 {stats.streak}er Serie
          </span>
        )}
        {stats.total > 0 && stats.bestStreak >= 5 && (
          <span className="text-status-trunk-fg text-xs">
            Beststreak: {stats.bestStreak}
          </span>
        )}
      </div>

      {/* ── Mode filter ── */}
      <div className="flex gap-2 text-xs">
        {(["mixed", "identify-range", "identify-subnet"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setFilterMode(m)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              filterMode === m
                ? "bg-accent-solid border-accent-solid text-on-accent-solid"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {m === "mixed"
              ? "Gemischt"
              : m === "identify-range"
                ? "Range bestimmen"
                : "Subnetz bestimmen"}
          </button>
        ))}
      </div>

      {/* ── Question card ── */}
      <div className="rounded-xl border border-border
                      bg-card p-5 space-y-4">
        {/* Question type badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-primary/10
                           text-accent-primary-fg border border-accent-primary font-medium">
            {question.mode === "identify-range"
              ? "Usable Range bestimmen"
              : "Subnetz bestimmen"}
          </span>
        </div>

        {/* Stem */}
        {question.mode === "identify-range" ? (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Subnetz:</p>
            <p className="font-mono text-xl font-bold text-foreground tracking-tight">
              {question.subnet.ip}
              <span className="text-accent-primary-fg">
                /{question.subnet.cidr}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Welcher usable host range gehört dazu?
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Usable Range:
            </p>
            <p className="font-mono text-base font-bold text-foreground">
              {formatRange(question.subnet)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Welches Subnetz ({question.subnet.ip}/?) gehört dazu?
            </p>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = selected === opt;
            const isRight = opt === question.correct;
            let cls =
              "w-full text-left px-4 py-3 rounded-lg border font-mono text-sm transition-all ";

            if (!answered) {
              cls +=
                "border-border hover:border-accent-primary " +
                "hover:bg-accent-primary/10 text-foreground cursor-pointer";
            } else if (isRight) {
              cls +=
                "border-status-success-border bg-status-success-bg text-status-success-fg";
            } else if (isSelected && !isRight) {
              cls +=
                "border-status-error-border bg-status-error-bg text-status-error-fg";
            } else {
              cls +=
                "border-border text-muted-foreground";
            }

            return (
              <button key={opt} className={cls} onClick={() => handleSelect(opt)}>
                <span className="flex items-center gap-3">
                  {answered && isRight && (
                    <span className="text-green-500 font-bold">✓</span>
                  )}
                  {answered && isSelected && !isRight && (
                    <span className="text-status-error-fg font-bold">✗</span>
                  )}
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div
            className={`rounded-lg p-4 text-sm leading-relaxed space-y-2 ${
              isCorrect
                ? "bg-status-success-bg border border-status-success-border"
                : "bg-status-blocking-bg border border-status-blocking-border"
            }`}
          >
            <p
              className={`font-semibold ${
                isCorrect
                  ? "text-status-success-fg"
                  : "text-status-blocking-fg"
              }`}
            >
              {isCorrect ? "✓ Richtig!" : "✗ Falsch — Rechenweg:"}
            </p>
            <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">
              {question.explanation}
            </p>
            {/* Quick calc breakdown */}
            <div className="mt-2 pt-2 border-t border-border
                            font-mono text-xs text-muted-foreground space-y-0.5">
              <div>Netzadresse : {question.subnet.networkAddr}</div>
              <div>Broadcast   : {question.subnet.broadcast}</div>
              <div>First host  : {question.subnet.firstHost}</div>
              <div>Last host   : {question.subnet.lastHost}</div>
              <div>Hosts/Netz  : {question.subnet.usableHosts}</div>
            </div>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button
            onClick={next}
            className="w-full py-2.5 rounded-lg bg-accent-solid hover:opacity-90
                       text-on-accent-solid text-sm font-medium transition-colors"
          >
            Nächste Frage →
          </button>
        )}
      </div>

      {/* ── Reset ── */}
      {stats.total > 0 && (
        <div className="text-center">
          <button
            onClick={() => {
              setStats({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
              setSelected(null);
              setQuestion(
                generateQuestion(filterMode === "mixed" ? undefined : filterMode),
              );
            }}
            className="text-xs text-muted-foreground hover:text-muted-foreground underline underline-offset-2 transition-colors"
          >
            Stats zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}

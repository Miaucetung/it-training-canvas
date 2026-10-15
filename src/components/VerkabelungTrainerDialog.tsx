// ============================================================
// VerkabelungTrainerDialog — Interaktive Verkabelungs-Übungen
// Tabs: Pin-Trainer (T568A/B) · Kabel-Wizard · Kategorie-Tabelle
// ============================================================

import { X } from "@phosphor-icons/react";
import { useState } from "react";
import { ModalPortal } from "@/components/ui/modal-portal";

interface Props {
  dark?: boolean;
  onClose: () => void;
}

type Tab = "pin" | "wizard" | "kategorie";

// ── Pin colours per TIA/EIA position (1-indexed) ──────────────
const T568A_WIRES = [
  { label: "W-Grün", bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  { label: "Grün",   bg: "#6ee7b7", border: "#059669", text: "#064e3b" },
  { label: "W-Orange",bg:"#fff7ed", border: "#f97316", text: "#7c2d12" },
  { label: "Blau",   bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" },
  { label: "W-Blau", bg: "#eff6ff", border: "#93c5fd", text: "#1e40af" },
  { label: "Orange", bg: "#ffedd5", border: "#fb923c", text: "#9a3412" },
  { label: "W-Braun",bg: "#fef3c7", border: "#d97706", text: "#78350f" },
  { label: "Braun",  bg: "#d6b899", border: "#92400e", text: "#451a03" },
];

const T568B_WIRES = [
  { label: "W-Orange",bg:"#fff7ed", border: "#f97316", text: "#7c2d12" },
  { label: "Orange", bg: "#ffedd5", border: "#fb923c", text: "#9a3412" },
  { label: "W-Grün", bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  { label: "Blau",   bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" },
  { label: "W-Blau", bg: "#eff6ff", border: "#93c5fd", text: "#1e40af" },
  { label: "Grün",   bg: "#6ee7b7", border: "#059669", text: "#064e3b" },
  { label: "W-Braun",bg: "#fef3c7", border: "#d97706", text: "#78350f" },
  { label: "Braun",  bg: "#d6b899", border: "#92400e", text: "#451a03" },
];

// ── Kabel-Wizard Szenarien ─────────────────────────────────────
const CABLE_SCENARIOS = [
  {
    label: "PC ↔ Switch",
    from: "PC (MDI)",
    to: "Switch (MDI-X)",
    cable: "Straight-through",
    color: "var(--accent-primary)",
    reason: "PC hat MDI-Stecker, Switch hat MDI-X. Senden und Empfangen liegen auf verschiedenen Pins — kein Kreuzen nötig.",
    pins: "TX(PC)→RX(Switch), RX(PC)←TX(Switch) — Pins 1/2 ↔ 1/2, 3/6 ↔ 3/6",
    note: "Heute: Auto-MDI-X macht das automatisch. Crossover ist für PC↔Switch meist nicht mehr nötig.",
  },
  {
    label: "Switch ↔ Switch",
    from: "Switch (MDI-X)",
    to: "Switch (MDI-X)",
    cable: "Crossover",
    color: "#f59e0b",
    reason: "Beide Switches haben MDI-X-Stecker. TX und RX liegen auf denselben Pins → Kabel muss kreuzen.",
    pins: "TX(SW1) Pin 1/2 → RX(SW2) Pin 3/6 (und umgekehrt)",
    note: "Heute: Moderne Switches mit Auto-MDI-X erkennen das automatisch und schalten intern um.",
  },
  {
    label: "Router ↔ Router",
    from: "Router (MDI)",
    to: "Router (MDI)",
    cable: "Crossover",
    color: "#f59e0b",
    reason: "Beide Router haben MDI-Stecker. TX und RX auf denselben Pins → Kabel kreuzt.",
    pins: "Pin 1/2 → Pin 3/6 (Crossover-Schema)",
    note: "Direkte Router-to-Router-Verbindungen sind selten — normalerweise über Switch-Backplane.",
  },
  {
    label: "PC ↔ Router",
    from: "PC (MDI)",
    to: "Router (MDI)",
    cable: "Crossover",
    color: "#f59e0b",
    reason: "Beide Geräte haben MDI-Stecker (senden auf Pin 1/2). Kabel muss kreuzen.",
    pins: "Pin 1/2 → Pin 3/6",
    note: "Konfiguration: Direkte Back-to-Back-Verbindung, z.B. im Cisco CCNA Lab.",
  },
  {
    label: "Konsole ↔ Cisco-Gerät",
    from: "PC COM/USB",
    to: "Cisco Console Port (RJ45)",
    cable: "Rollover (Konsolen-Kabel)",
    color: "#10b981",
    reason: "Das Rollover-Kabel kehrt alle Pins um: Pin 1 ↔ Pin 8, Pin 2 ↔ Pin 7, usw.",
    pins: "1↔8, 2↔7, 3↔6, 4↔5 (vollständige Umkehrung)",
    note: "Für Management-Zugang (initial setup). Meistens hellblau (Cisco-Standard). USB-Adapter oder USB-C-Version heute verbreitet.",
  },
  {
    label: "PC ↔ PC (direkt)",
    from: "PC (MDI)",
    to: "PC (MDI)",
    cable: "Crossover",
    color: "#f59e0b",
    reason: "Beide PCs senden auf Pin 1/2 (MDI). Kabel muss kreuzen.",
    pins: "Pin 1/2 → Pin 3/6",
    note: "Heute: Auto-MDI-X macht das automatisch. Nur noch in Sonderfällen manuell nötig.",
  },
];

// ── Kategorien-Tabelle ─────────────────────────────────────────
const KATEGORIEN = [
  { kat: "Cat 5e", bw: "1 Gbit/s", freq: "100 MHz", laenge: "100 m", anwendung: "Standard GbE, ältere Installationen" },
  { kat: "Cat 6",  bw: "1 Gbit/s (bis 55 m: 10G)", freq: "250 MHz", laenge: "100 m (10G: 55 m)", anwendung: "Aktuelle Büroverkabelung, 10GbE bis 55 m" },
  { kat: "Cat 6a", bw: "10 Gbit/s", freq: "500 MHz", laenge: "100 m", anwendung: "10GbE auf voller Länge, Rechenzentrum-Access" },
  { kat: "Cat 7",  bw: "10 Gbit/s", freq: "600 MHz", laenge: "100 m", anwendung: "Industrieumgebung, S/FTP, GG45/TERA Stecker" },
  { kat: "Cat 7a", bw: "40 Gbit/s (bis 50 m)", freq: "1000 MHz", laenge: "100 m", anwendung: "Zukunftssicher, Datacenter, 40GbE" },
  { kat: "Cat 8",  bw: "25/40 Gbit/s", freq: "2000 MHz", laenge: "30 m", anwendung: "Datacenter Top-of-Rack, sehr kurze Strecken" },
];

// ── PinTrainer Component ───────────────────────────────────────
function PinTrainer() {
  const [standard, setStandard] = useState<"A" | "B">("B");
  const [userOrder, setUserOrder] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const wires = standard === "A" ? T568A_WIRES : T568B_WIRES;
  const correct = [0, 1, 2, 3, 4, 5, 6, 7];

  function shuffle() {
    const arr = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setUserOrder(arr);
    setChecked(false);
  }

  function checkAnswer() {
    const correct2 = correct.every((v, i) => userOrder[i] === v);
    if (correct2) setScore((s) => s + 1);
    setChecked(true);
  }

  function reset() {
    setUserOrder([0, 1, 2, 3, 4, 5, 6, 7]);
    setChecked(false);
  }

  function moveWire(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    const next = [...userOrder];
    const tmp = next[fromIdx];
    next[fromIdx] = next[toIdx];
    next[toIdx] = tmp;
    setUserOrder(next);
    setChecked(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground">Standard:</span>
        {(["A", "B"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStandard(s); reset(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              standard === s
                ? "bg-accent-solid text-on-accent-solid"
                : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            T568{s}
          </button>
        ))}
        <span className="text-xs text-muted-foreground">Score: {score}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Klicke zwei Adern zum Tauschen, bis die Reihenfolge für <strong>T568{standard}</strong> stimmt (Pin 1 = links).
      </p>

      {/* RJ45 visual */}
      <div className="flex gap-1 items-end justify-center flex-wrap">
        {userOrder.map((wireIdx, pinIdx) => {
          const w = wires[wireIdx];
          const isCorrect = wireIdx === correct[pinIdx];
          return (
            <button
              key={pinIdx}
              onClick={() => {
                if (dragging === null) {
                  setDragging(pinIdx);
                } else {
                  moveWire(dragging, pinIdx);
                  setDragging(null);
                }
              }}
              style={{
                background: w.bg,
                borderColor: dragging === pinIdx ? "var(--accent-primary)" : (checked ? (isCorrect ? "var(--status-success-border)" : "var(--status-error-border)") : w.border),
                color: w.text,
              }}
              className={`w-14 h-16 rounded-lg border-2 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                dragging === pinIdx ? "ring-2 ring-ring scale-105" : "hover:scale-105"
              }`}
            >
              <span className="text-[9px]">Pin {pinIdx + 1}</span>
              <span className="text-center leading-tight">{w.label}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <div className={`rounded-lg px-3 py-2 text-xs text-center font-semibold ${
          userOrder.every((v, i) => v === correct[i])
            ? "bg-status-success-bg text-status-success-fg"
            : "bg-status-error-bg text-status-error-fg"
        }`}>
          {userOrder.every((v, i) => v === correct[i])
            ? "✅ Korrekt! T568" + standard + " Belegung stimmt."
            : "❌ Nicht ganz — rote Pins sind falsch. Versuche es nochmal."}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={shuffle} className={`px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground hover:bg-muted/70`}>
          🔀 Mischen
        </button>
        <button onClick={checkAnswer} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-solid text-on-accent-solid hover:opacity-90">
          ✔ Prüfen
        </button>
        <button onClick={reset} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-muted-foreground">
          Zurücksetzen
        </button>
      </div>

      <div className="rounded-xl border p-3 text-xs space-y-1 bg-muted border-border">
        <div className="font-semibold mb-2 text-muted-foreground">Referenz: T568{standard} Belegung</div>
        {wires.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 text-center font-mono text-muted-foreground">{i + 1}</span>
            <span className="w-3 h-3 rounded-full border flex-shrink-0" style={{ background: w.bg, borderColor: w.border }} />
            <span className={"text-muted-foreground"}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CableWizard Component ──────────────────────────────────────
function CableWizard() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Wähle ein Verbindungsszenario, um zu sehen, welches Kabel benötigt wird und warum.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CABLE_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`rounded-xl border p-3 text-left text-xs transition-all ${
              selected === i
                ? "ring-2 ring-ring"
                : "hover:scale-105"
            } bg-card border-border shadow-sm`}
          >
            <div className="font-semibold text-foreground">{s.label}</div>
            <div className="text-muted-foreground mt-0.5">{s.from}</div>
            <div className="text-muted-foreground">→ {s.to}</div>
          </button>
        ))}
      </div>

      {selected !== null && (() => {
        const s = CABLE_SCENARIOS[selected];
        return (
          <div className={`rounded-xl border p-4 space-y-3 bg-card border-border shadow-sm`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <div>
                <span className="text-sm font-bold text-foreground">{s.cable}</span>
                <span className="text-xs ml-2 text-muted-foreground">{s.label}</span>
              </div>
            </div>

            {/* Animated connector diagram */}
            <div className="rounded-lg p-3 font-mono text-xs space-y-1 bg-muted border border-border">
              <div className={"text-muted-foreground"}>
                {s.from} ──{s.cable === "Rollover (Konsolen-Kabel)" ? "Rollover" : s.cable === "Crossover" ? "Crossover" : "──────"}──▶ {s.to}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.pins}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold mb-1 text-muted-foreground">Warum?</div>
              <p className="text-xs text-muted-foreground">{s.reason}</p>
            </div>

            {s.note && (
              <div className="text-xs rounded-lg px-3 py-2 bg-status-warning-bg text-status-warning-fg border border-status-warning-border/30">
                💡 {s.note}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── KategorieTabelle Component ─────────────────────────────────
function KategorieTabelle() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Klicke eine Kategorie für Details. Alle Werte gelten für Twisted-Pair-Kupfer (U/UTP, F/UTP oder S/FTP).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className={"bg-muted"}>
              {["Kategorie", "Bandbreite", "Frequenz", "Max. Länge", "Anwendung"].map(h => (
                <th key={h} className="px-2 py-2 text-left font-semibold border border-border text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {KATEGORIEN.map((k) => (
              <tr
                key={k.kat}
                onClick={() => setSelected(selected === k.kat ? null : k.kat)}
                className={`cursor-pointer transition-colors ${
                  selected === k.kat
                    ? "bg-accent-primary/40"
                    : "hover:bg-muted/50"
                }`}
              >
                <td className="px-2 py-1.5 border font-semibold border-border text-accent-primary-fg">{k.kat}</td>
                <td className="px-2 py-1.5 border border-border text-muted-foreground">{k.bw}</td>
                <td className="px-2 py-1.5 border border-border text-muted-foreground">{k.freq}</td>
                <td className="px-2 py-1.5 border border-border text-muted-foreground">{k.laenge}</td>
                <td className="px-2 py-1.5 border border-border text-muted-foreground text-[10px]">{k.anwendung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs rounded-xl border p-3 bg-muted border-border text-muted-foreground">
        <strong>Merkhilfe:</strong> Cat 5e = GbE · Cat 6a = 10GbE/100m · Cat 8 = 40GbE aber nur 30m (Datacenter)
      </div>
    </div>
  );
}

// ── Main Dialog ────────────────────────────────────────────────

export function VerkabelungTrainerDialog({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>("pin");

  const tabs: { id: Tab; label: string }[] = [
    { id: "pin",      label: "Pin-Trainer" },
    { id: "wizard",   label: "Kabel-Wizard" },
    { id: "kategorie",label: "Kategorien" },
  ];

  return (
    <ModalPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Verkabelungs-Trainer"
        className="fixed inset-0 z-dialog flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <div
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-card text-foreground"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 border-border">
            <div className="flex-1">
              <h2 className="font-bold text-base">🔌 Verkabelungs-Trainer</h2>
              <p className="text-xs mt-0.5 text-muted-foreground">
                Interaktive Pinbelegungs-Übungen, Kabeltyp-Wizard & Kategorie-Vergleich
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Schließen"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b flex-shrink-0 border-border">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-accent-primary text-accent-primary-fg"
                    : "border-transparent text-muted-foreground hover:text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {tab === "pin"       && <PinTrainer />}
            {tab === "wizard"    && <CableWizard />}
            {tab === "kategorie" && <KategorieTabelle />}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

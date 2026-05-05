// ============================================================
// VerkabelungTrainerDialog — Interaktive Verkabelungs-Übungen
// Tabs: Pin-Trainer (T568A/B) · Kabel-Wizard · Kategorie-Tabelle
// ============================================================

import { X } from "@phosphor-icons/react";
import { useState } from "react";

interface Props {
  dark: boolean;
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
    color: "#6366f1",
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
function PinTrainer({ dark }: { dark: boolean }) {
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
        <span className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>Standard:</span>
        {(["A", "B"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStandard(s); reset(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              standard === s
                ? "bg-indigo-600 text-white"
                : dark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            T568{s}
          </button>
        ))}
        <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>Score: {score}</span>
      </div>

      <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
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
                borderColor: dragging === pinIdx ? "#6366f1" : (checked ? (isCorrect ? "#22c55e" : "#ef4444") : w.border),
                color: w.text,
              }}
              className={`w-14 h-16 rounded-lg border-2 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                dragging === pinIdx ? "ring-2 ring-indigo-400 scale-105" : "hover:scale-105"
              }`}
            >
              <span className="text-[9px] opacity-60">Pin {pinIdx + 1}</span>
              <span className="text-center leading-tight">{w.label}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <div className={`rounded-lg px-3 py-2 text-xs text-center font-semibold ${
          userOrder.every((v, i) => v === correct[i])
            ? dark ? "bg-green-900/40 text-green-300" : "bg-green-50 text-green-700"
            : dark ? "bg-red-900/40 text-red-300" : "bg-red-50 text-red-700"
        }`}>
          {userOrder.every((v, i) => v === correct[i])
            ? "✅ Korrekt! T568" + standard + " Belegung stimmt."
            : "❌ Nicht ganz — rote Pins sind falsch. Versuche es nochmal."}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={shuffle} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${dark ? "bg-slate-700 text-slate-200 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
          🔀 Mischen
        </button>
        <button onClick={checkAnswer} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500">
          ✔ Prüfen
        </button>
        <button onClick={reset} className={`px-3 py-1.5 rounded-lg text-xs ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
          Zurücksetzen
        </button>
      </div>

      <div className={`rounded-xl border p-3 text-xs space-y-1 ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
        <div className={`font-semibold mb-2 ${dark ? "text-slate-300" : "text-slate-700"}`}>Referenz: T568{standard} Belegung</div>
        {wires.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`w-4 text-center font-mono ${dark ? "text-slate-400" : "text-slate-500"}`}>{i + 1}</span>
            <span className="w-3 h-3 rounded-full border flex-shrink-0" style={{ background: w.bg, borderColor: w.border }} />
            <span className={dark ? "text-slate-300" : "text-slate-700"}>{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CableWizard Component ──────────────────────────────────────
function CableWizard({ dark }: { dark: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
        Wähle ein Verbindungsszenario, um zu sehen, welches Kabel benötigt wird und warum.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {CABLE_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`rounded-xl border p-3 text-left text-xs transition-all ${
              selected === i
                ? "ring-2 ring-indigo-500"
                : "hover:scale-105"
            } ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}
          >
            <div className={`font-semibold ${dark ? "text-slate-200" : "text-slate-800"}`}>{s.label}</div>
            <div className="text-slate-500 mt-0.5">{s.from}</div>
            <div className="text-slate-500">→ {s.to}</div>
          </button>
        ))}
      </div>

      {selected !== null && (() => {
        const s = CABLE_SCENARIOS[selected];
        return (
          <div className={`rounded-xl border p-4 space-y-3 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <div>
                <span className={`text-sm font-bold ${dark ? "text-white" : "text-slate-900"}`}>{s.cable}</span>
                <span className={`text-xs ml-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</span>
              </div>
            </div>

            {/* Animated connector diagram */}
            <div className={`rounded-lg p-3 font-mono text-xs space-y-1 ${dark ? "bg-slate-900 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
              <div className={dark ? "text-slate-300" : "text-slate-700"}>
                {s.from} ──{s.cable === "Rollover (Konsolen-Kabel)" ? "Rollover" : s.cable === "Crossover" ? "Crossover" : "──────"}──▶ {s.to}
              </div>
              <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {s.pins}
              </div>
            </div>

            <div>
              <div className={`text-xs font-semibold mb-1 ${dark ? "text-slate-300" : "text-slate-700"}`}>Warum?</div>
              <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>{s.reason}</p>
            </div>

            {s.note && (
              <div className={`text-xs rounded-lg px-3 py-2 ${dark ? "bg-amber-900/30 text-amber-300 border border-amber-700/30" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
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
function KategorieTabelle({ dark }: { dark: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>
        Klicke eine Kategorie für Details. Alle Werte gelten für Twisted-Pair-Kupfer (U/UTP, F/UTP oder S/FTP).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className={dark ? "bg-slate-700" : "bg-slate-100"}>
              {["Kategorie", "Bandbreite", "Frequenz", "Max. Länge", "Anwendung"].map(h => (
                <th key={h} className={`px-2 py-2 text-left font-semibold border ${dark ? "border-slate-600 text-slate-200" : "border-slate-200 text-slate-700"}`}>{h}</th>
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
                    ? dark ? "bg-indigo-900/40" : "bg-indigo-50"
                    : dark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                }`}
              >
                <td className={`px-2 py-1.5 border font-semibold ${dark ? "border-slate-700 text-indigo-300" : "border-slate-200 text-indigo-700"}`}>{k.kat}</td>
                <td className={`px-2 py-1.5 border ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>{k.bw}</td>
                <td className={`px-2 py-1.5 border ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>{k.freq}</td>
                <td className={`px-2 py-1.5 border ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>{k.laenge}</td>
                <td className={`px-2 py-1.5 border ${dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"} text-[10px]`}>{k.anwendung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={`text-xs rounded-xl border p-3 ${dark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
        <strong>Merkhilfe:</strong> Cat 5e = GbE · Cat 6a = 10GbE/100m · Cat 8 = 40GbE aber nur 30m (Datacenter)
      </div>
    </div>
  );
}

// ── Main Dialog ────────────────────────────────────────────────

export function VerkabelungTrainerDialog({ dark, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("pin");

  const tabs: { id: Tab; label: string }[] = [
    { id: "pin",      label: "Pin-Trainer" },
    { id: "wizard",   label: "Kabel-Wizard" },
    { id: "kategorie",label: "Kategorien" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
          dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex-1">
            <h2 className="font-bold text-base">🔌 Verkabelungs-Trainer</h2>
            <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Interaktive Pinbelegungs-Übungen, Kabeltyp-Wizard & Kategorie-Vergleich
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className={`p-1.5 rounded-lg ${dark ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b flex-shrink-0 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? dark ? "border-indigo-400 text-indigo-300" : "border-indigo-600 text-indigo-700"
                  : dark ? "border-transparent text-slate-400 hover:text-slate-200" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "pin"       && <PinTrainer dark={dark} />}
          {tab === "wizard"    && <CableWizard dark={dark} />}
          {tab === "kategorie" && <KategorieTabelle dark={dark} />}
        </div>
      </div>
    </div>
  );
}

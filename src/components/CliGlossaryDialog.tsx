// ============================================================
// CliGlossaryDialog — Glossar aller relevanten Cisco IOS-CLI-Befehle
// Mit Kategorien-Filter, Volltextsuche und Copy-to-Clipboard pro Befehl.
// ============================================================

import { X, MagnifyingGlass, Copy, Check, Warning } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { ENTRIES, CATEGORIES, PT_LIMITS_CATEGORY, type Category } from "@/content/ccna/cli-glossary";

interface Props {
  dark: boolean;
  onClose: () => void;
}

function CopyButton({ text, dark }: { text: string; dark: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {
          // Clipboard nicht verfügbar (z. B. unsicherer Kontext)
        }
      }}
      title={copied ? "Kopiert!" : "Befehl in Zwischenablage kopieren"}
      aria-label="Befehl kopieren"
      className={`shrink-0 p-1.5 rounded-md border transition-colors ${
        copied
          ? dark
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            : "bg-emerald-50 border-emerald-300 text-emerald-700"
          : dark
            ? "border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            : "border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
    </button>
  );
}

export function CliGlossaryDialog({ dark, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "Alle">("Alle");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((e) => {
      // Packet-Tracer-Limits sind in der Prüfung falsch — sie dürfen nur
      // sichtbar werden, wenn der Chip explizit aktiv ist, nie beiläufig
      // über "Alle" oder eine Volltextsuche.
      if (e.category === PT_LIMITS_CATEGORY && activeCat !== PT_LIMITS_CATEGORY) return false;
      if (activeCat !== "Alle" && e.category !== activeCat) return false;
      if (!q) return true;
      return (
        e.cmd.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.mode.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCat]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          dark ? "border-slate-700" : "border-slate-200"
        }`}>
          <div>
            <h2 className="text-lg font-semibold">Cisco IOS — CLI-Glossar</h2>
            <p className="text-xs opacity-70">
              {ENTRIES.length} Befehle · Suche, Filter & 1-Klick-Kopie pro Eintrag
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-2 rounded-lg hover:bg-slate-500/20"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Search + Filter */}
        <div className={`px-6 py-3 border-b space-y-3 ${
          dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            dark ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-50"
          }`}>
            <MagnifyingGlass size={16} className="opacity-60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Befehl, Beschreibung, Modus oder Kategorie suchen …"
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs opacity-60 hover:opacity-100"
              >
                löschen
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["Alle", ...CATEGORIES] as const).map((c) => {
              const active = activeCat === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? dark
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                        : "bg-cyan-100 border-cyan-300 text-cyan-900"
                      : dark
                        ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c}
                </button>
              );
            })}
            {/* Separat angehängt und optisch abgesetzt: Simulator-Verhalten
                ist in der Prüfung falsch und soll nicht wie eine normale
                Kategorie neben echter IOS-Syntax wirken. */}
            <button
              onClick={() => setActiveCat(activeCat === PT_LIMITS_CATEGORY ? "Alle" : PT_LIMITS_CATEGORY)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activeCat === PT_LIMITS_CATEGORY
                  ? dark
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                    : "bg-amber-100 border-amber-400 text-amber-900"
                  : dark
                    ? "border-amber-800 text-amber-500/80 hover:bg-amber-500/10"
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
              }`}
            >
              <Warning size={12} weight="bold" />
              {PT_LIMITS_CATEGORY}
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-sm">
              Keine Befehle gefunden.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((e, i) => {
                const isPtLimit = e.category === PT_LIMITS_CATEGORY;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                      isPtLimit
                        ? dark
                          ? "border-amber-800 bg-amber-500/10 hover:bg-amber-500/15"
                          : "border-amber-300 bg-amber-50 hover:bg-amber-100"
                        : dark
                          ? "border-slate-700 bg-slate-800/40 hover:bg-slate-800/70"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className={`text-sm font-mono font-semibold ${
                          isPtLimit
                            ? dark ? "text-amber-300" : "text-amber-800"
                            : dark ? "text-cyan-300" : "text-cyan-700"
                        }`}>
                          {e.cmd}
                        </code>
                        {!isPtLimit && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            dark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                          }`}>
                            {e.mode}
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isPtLimit
                            ? dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"
                            : dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {e.category}
                        </span>
                        {isPtLimit && (
                          <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            dark ? "bg-amber-500/25 text-amber-200" : "bg-amber-200 text-amber-900"
                          }`}>
                            <Warning size={10} weight="bold" />
                            Simulator-Verhalten, nicht prüfungsrelevant
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-80 mt-1">{e.desc}</div>
                      {e.example && (
                        <pre className={`text-[11px] font-mono mt-1.5 px-2 py-1.5 rounded whitespace-pre-wrap ${
                          dark ? "bg-slate-950 text-slate-300" : "bg-slate-900 text-slate-100"
                        }`}>
                          {e.example}
                        </pre>
                      )}
                      {e.verifyWith && e.verifyWith.length > 0 && (
                        <div className="text-[11px] mt-1 opacity-75">
                          <span className="font-semibold">Verifikation:</span>{" "}
                          <code className="font-mono">{e.verifyWith.join(", ")}</code>
                        </div>
                      )}
                      {e.pitfall && (
                        <div className={`text-[11px] mt-1 ${dark ? "text-amber-400" : "text-amber-700"}`}>
                          <span className="font-semibold">Pitfall:</span> {e.pitfall}
                        </div>
                      )}
                      {e.ptNote && (
                        <div className={`text-[11px] mt-1 flex items-start gap-1 ${dark ? "text-amber-400/90" : "text-amber-700"}`}>
                          <Warning size={11} weight="bold" className="mt-0.5 shrink-0" />
                          <span><span className="font-semibold">Packet Tracer:</span> {e.ptNote}</span>
                        </div>
                      )}
                    </div>
                    {!isPtLimit && <CopyButton text={e.cmd} dark={dark} />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t text-xs flex items-center justify-between ${
          dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"
        }`}>
          <span>{filtered.length} von {ENTRIES.length} Befehlen</span>
          <span>Tipp: Im IOS-Terminal mit <code className="font-mono">?</code> kontextsensitive Hilfe abrufen.</span>
        </div>
      </div>
    </div>
  );
}

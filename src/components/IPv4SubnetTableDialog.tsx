import { X } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  blockSizeTable,
  cidrTable,
  octetTable,
} from "@/lib/subnet-reference";

interface Props {
  dark: boolean;
  onClose: () => void;
}

type Tab = "cidr" | "block" | "octet";

export function IPv4SubnetTableDialog({ dark, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("cidr");
  const cidr = useMemo(() => cidrTable(), []);
  const blocks = useMemo(() => blockSizeTable(), []);
  const octets = useMemo(() => octetTable(), []);

  const panel = dark
    ? "bg-zinc-900 border-zinc-700 text-zinc-100"
    : "bg-white border-zinc-200 text-zinc-900";
  const headRow = dark ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600";
  const border = dark ? "border-zinc-700/60" : "border-zinc-200";
  const muted = dark ? "text-zinc-500" : "text-zinc-400";
  const mono = "font-mono tabular-nums";

  const fmt = (n: number) => n.toLocaleString("de-DE");

  function TabBtn({ id, label }: { id: Tab; label: string }) {
    return (
      <button
        onClick={() => setTab(id)}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          tab === id
            ? dark
              ? "bg-sky-500/20 text-sky-300"
              : "bg-sky-100 text-sky-700"
            : dark
              ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border shadow-2xl ${panel}`}>
        {/* Header */}
        <div className={`flex shrink-0 items-center justify-between border-b px-5 py-4 ${border}`}>
          <div>
            <h2 className="text-base font-semibold">IPv4-Subnetting-Referenz</h2>
            <p className={`text-xs ${muted}`}>
              Subnetzmaske · CIDR · Binär · Blockgröße · Hosts
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${dark ? "hover:bg-zinc-700" : "hover:bg-zinc-100"}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex shrink-0 gap-1.5 border-b px-5 py-2.5 ${border}`}>
          <TabBtn id="cidr" label="CIDR /0–/32" />
          <TabBtn id="block" label="Blockgrößen 1–256" />
          <TabBtn id="octet" label="Oktett 0–255 (Binär)" />
        </div>

        {/* Content */}
        <div className="overflow-auto p-5">
          {tab === "cidr" && (
            <table className="w-full text-xs">
              <thead>
                <tr className={headRow}>
                  <th className="px-2 py-2 text-left font-semibold">CIDR</th>
                  <th className="px-2 py-2 text-left font-semibold">Subnetzmaske</th>
                  <th className="px-2 py-2 text-left font-semibold">Binär</th>
                  <th className="px-2 py-2 text-left font-semibold">Wildcard</th>
                  <th className="px-2 py-2 text-right font-semibold">Adressen (Block)</th>
                  <th className="px-2 py-2 text-right font-semibold">Nutzbare Hosts</th>
                </tr>
              </thead>
              <tbody>
                {cidr.map((r) => (
                  <tr key={r.cidr} className={`border-b ${border}`}>
                    <td className={`px-2 py-1.5 ${mono} font-semibold ${dark ? "text-sky-400" : "text-sky-600"}`}>/{r.cidr}</td>
                    <td className={`px-2 py-1.5 ${mono}`}>{r.mask}</td>
                    <td className={`px-2 py-1.5 ${mono} ${muted} text-[10px]`}>{r.maskBinary}</td>
                    <td className={`px-2 py-1.5 ${mono} ${muted}`}>{r.wildcard}</td>
                    <td className={`px-2 py-1.5 text-right ${mono}`}>{fmt(r.blockSize)}</td>
                    <td className={`px-2 py-1.5 text-right ${mono}`}>
                      {r.cidr === 31 ? "2 (P2P)" : r.cidr === 32 ? "1 (Host)" : fmt(r.usableHosts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "block" && (
            <>
              <p className={`mb-3 text-xs ${muted}`}>
                „Magic Numbers" im letzten Oktett: Blockgröße = Anzahl Adressen pro Subnetz.
                Maskenoktett = 256 − Blockgröße.
              </p>
              <table className="w-full text-xs">
                <thead>
                  <tr className={headRow}>
                    <th className="px-2 py-2 text-right font-semibold">Blockgröße</th>
                    <th className="px-2 py-2 text-left font-semibold">CIDR</th>
                    <th className="px-2 py-2 text-left font-semibold">Subnetzmaske</th>
                    <th className="px-2 py-2 text-left font-semibold">Maskenoktett (dez)</th>
                    <th className="px-2 py-2 text-left font-semibold">Binär</th>
                    <th className="px-2 py-2 text-right font-semibold">Nutzbare Hosts</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((r) => (
                    <tr key={r.cidr} className={`border-b ${border}`}>
                      <td className={`px-2 py-1.5 text-right ${mono} font-semibold`}>{fmt(r.blockSize)}</td>
                      <td className={`px-2 py-1.5 ${mono} ${dark ? "text-sky-400" : "text-sky-600"}`}>/{r.cidr}</td>
                      <td className={`px-2 py-1.5 ${mono}`}>{r.mask}</td>
                      <td className={`px-2 py-1.5 ${mono}`}>{r.maskOctet}</td>
                      <td className={`px-2 py-1.5 ${mono} ${muted}`}>{r.maskOctetBinary}</td>
                      <td className={`px-2 py-1.5 text-right ${mono}`}>
                        {r.cidr === 31 ? "2 (P2P)" : r.cidr === 32 ? "1 (Host)" : fmt(r.usableHosts)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === "octet" && (
            <>
              <p className={`mb-3 text-xs ${muted}`}>
                Dezimal ↔ 8-Bit-Binär für jedes Oktett. Hervorgehoben =
                gültiges Subnetzmasken-Oktett (0, 128, 192, 224, 240, 248, 252, 254, 255).
              </p>
              <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
                {octets.map((r) => (
                  <div
                    key={r.dec}
                    className={`flex items-center justify-between border-b px-1 py-0.5 ${border} ${
                      r.isMaskOctet
                        ? dark
                          ? "bg-sky-500/10 text-sky-300"
                          : "bg-sky-50 text-sky-700"
                        : ""
                    }`}
                  >
                    <span className={`${mono} text-xs font-semibold`}>{r.dec}</span>
                    <span className={`${mono} text-[10px] ${r.isMaskOctet ? "" : muted}`}>{r.bin}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

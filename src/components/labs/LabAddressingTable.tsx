import React from "react";
import { cn } from "@/lib/utils";
import type { LabAddressingEntry } from "./types";

interface LabAddressingTableProps {
  entries: LabAddressingEntry[];
  selectedDevice?: string | null;
  onSelectDevice?: (deviceName: string | null) => void;
  className?: string;
  theme?: "dark" | "light";
}

export const LabAddressingTable: React.FC<LabAddressingTableProps> = ({
  entries,
  selectedDevice = null,
  onSelectDevice,
  className,
  theme = "dark",
}) => {
  const isLight = theme === "light";

  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden transition-colors shadow-xs",
        isLight
          ? "bg-white border-slate-300/80 text-slate-800"
          : "bg-slate-900/90 border-slate-800 text-slate-200",
        className,
      )}
    >
      <div
        className={cn(
          "px-4 py-2.5 border-b flex items-center justify-between",
          isLight
            ? "bg-slate-100/80 border-slate-200 text-slate-700"
            : "bg-slate-950/80 border-slate-800 text-slate-300",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider font-sans">
            Adressierungstabelle
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {entries.length} Interfaces konfiguriert
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr
              className={cn(
                "border-b font-mono font-semibold text-[11px]",
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-600"
                  : "bg-slate-950/40 border-slate-800/80 text-slate-400",
              )}
            >
              <th className="py-2.5 px-3">Gerät</th>
              <th className="py-2.5 px-3">Interface</th>
              <th className="py-2.5 px-3">IP-Adresse</th>
              <th className="py-2.5 px-3">Subnetzmaske</th>
              <th className="py-2.5 px-3">Default Gateway</th>
              <th className="py-2.5 px-3">VLAN / Zweck</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 font-mono text-[11.5px]">
            {entries.map((entry, idx) => {
              const isSelected = selectedDevice === entry.device;

              return (
                <tr
                  key={idx}
                  onClick={() =>
                    onSelectDevice?.(isSelected ? null : entry.device)
                  }
                  className={cn(
                    "cursor-pointer transition-colors duration-150 group",
                    isSelected
                      ? isLight
                        ? "bg-sky-100/90 font-medium text-sky-950 border-l-4 border-l-sky-500"
                        : "bg-sky-950/50 font-medium text-sky-200 border-l-4 border-l-sky-400"
                      : isLight
                        ? "hover:bg-slate-100/70 border-l-4 border-l-transparent"
                        : "hover:bg-slate-800/40 border-l-4 border-l-transparent",
                  )}
                  title={`Klick um ${entry.device} in der Topologie hervorzuheben`}
                >
                  <td className="py-2 px-3 font-bold font-sans">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded",
                        isSelected
                          ? "bg-sky-500/20 text-sky-400"
                          : "text-slate-200",
                      )}
                    >
                      {entry.device}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-cyan-400 font-semibold">
                    {entry.interface}
                  </td>
                  <td className="py-2 px-3 text-emerald-400 font-medium">
                    {entry.ip}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {entry.subnetMask}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {entry.defaultGateway || "N/A"}
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-sans text-xs">
                    {entry.vlan ? (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono mr-1.5 text-indigo-300">
                        {typeof entry.vlan === "number"
                          ? `VLAN ${entry.vlan}`
                          : entry.vlan}
                      </span>
                    ) : null}
                    <span className="opacity-80">{entry.description || "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


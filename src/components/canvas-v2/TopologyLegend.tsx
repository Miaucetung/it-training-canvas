import React from "react";

interface TopologyLegendProps {
  theme?: "dark" | "light";
  onClose?: () => void;
}

export const TopologyLegend: React.FC<TopologyLegendProps> = ({
  theme = "dark",
  onClose,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      role="region"
      aria-label="Topologie-Legende"
      className={`p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-xs select-none ${
        isDark
          ? "bg-slate-900/95 border-slate-700/80 text-slate-200"
          : "bg-white/95 border-slate-200 text-slate-800"
      }`}
    >
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-700/50">
        <span className="font-bold text-[11px] uppercase tracking-wider text-sky-400">
          Cisco Topologie-Legende
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-1"
            aria-label="Legende schließen"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
        {/* Link-Typen */}
        <div className="space-y-1.5">
          <p className="font-semibold text-[10px] uppercase text-slate-400">Link-Typen</p>
          <div className="flex items-center gap-2">
            <svg width="24" height="8" className="shrink-0">
              <line x1="0" y1="4" x2="24" y2="4" stroke="#38BDF8" strokeWidth="2.5" />
            </svg>
            <span>Ethernet (Fast / Gig)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="8" className="shrink-0">
              <path d="M0 4 L6 1 L12 7 L18 1 L24 4" stroke="#DC2626" strokeWidth="2" fill="none" />
            </svg>
            <span>Serial (WAN / Blitz)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="8" className="shrink-0">
              <line x1="0" y1="4" x2="24" y2="4" stroke="#818CF8" strokeWidth="3" strokeDasharray="5 2" />
            </svg>
            <span>802.1Q Trunk</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="8" className="shrink-0">
              <line x1="0" y1="2" x2="24" y2="2" stroke="#34D399" strokeWidth="1.5" />
              <line x1="0" y1="6" x2="24" y2="6" stroke="#34D399" strokeWidth="1.5" />
            </svg>
            <span>EtherChannel (LACP)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="8" className="shrink-0">
              <line x1="0" y1="4" x2="24" y2="4" stroke="#06B6D4" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
            <span>Wireless (WLAN)</span>
          </div>
        </div>

        {/* Status-Symbole (Barrierefreiheit) */}
        <div className="space-y-1.5">
          <p className="font-semibold text-[10px] uppercase text-slate-400">Status-Symbole</p>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Up / Forwarding (FWD)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" className="shrink-0">
              <circle cx="7" cy="7" r="6" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1" />
              <path d="M4 4 L10 10 M10 4 L4 10" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Down (Rotes X-Symbol)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" className="shrink-0">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
              <circle cx="7" cy="6" r="1.5" fill="#E2E8F0" />
            </svg>
            <span>Admin-Down (Schloss)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="14" height="14" className="shrink-0">
              <circle cx="7" cy="7" r="6" fill="#7C2D12" stroke="#F97316" strokeWidth="1" />
              <line x1="5" y1="4" x2="5" y2="10" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="4" x2="9" y2="10" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>STP Blocking (BLK ||)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

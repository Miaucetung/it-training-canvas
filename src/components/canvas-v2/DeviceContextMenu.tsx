import React, { useEffect, useRef } from "react";
import { TopologyDevice } from "@/types/topology";
import { PlugsConnected, Sliders, Trash, X } from "@phosphor-icons/react";

interface DeviceContextMenuProps {
  device: TopologyDevice;
  x: number;
  y: number;
  theme?: "dark" | "light";
  onConnect: () => void;
  onConfigure: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const DeviceContextMenu: React.FC<DeviceContextMenuProps> = ({
  device,
  x,
  y,
  theme = "dark",
  onConnect,
  onConfigure,
  onDelete,
  onClose,
}) => {
  const isDark = theme === "dark";
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("touchstart", handleOutside);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("touchstart", handleOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.min(window.innerWidth - 220, Math.max(10, x))}px`, top: `${Math.min(window.innerHeight - 200, Math.max(10, y))}px` }}
      className={`fixed z-50 w-52 rounded-2xl border shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100 ${
        isDark
          ? "bg-slate-900/98 border-slate-700/80 text-white"
          : "bg-white/98 border-slate-200 text-slate-900"
      } backdrop-blur-md text-xs`}
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 pb-2 mb-1 border-b border-slate-700/40">
        <div className="font-bold truncate text-[11px] text-sky-400">
          {device.name}
        </div>
        <button aria-label="Schließen" onClick={onClose} className="p-0.5 rounded text-slate-400 hover:text-white">
          <X size={13} />
        </button>
      </div>

      <div className="space-y-0.5">
        <button
          onClick={() => {
            onConnect();
            onClose();
          }}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium transition-colors ${
            isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
          }`}
        >
          <PlugsConnected size={15} className="text-sky-400" />
          <span>Verbinden...</span>
        </button>

        <button
          onClick={() => {
            onConfigure();
            onClose();
          }}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium transition-colors ${
            isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-100 text-slate-800"
          }`}
        >
          <Sliders size={15} className="text-emerald-400" />
          <span>Konfigurieren / CLI</span>
        </button>

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left font-medium text-red-400 hover:bg-red-500/15 transition-colors"
        >
          <Trash size={15} className="text-red-400" />
          <span>Löschen (Entf)</span>
        </button>
      </div>
    </div>
  );
};

import { X } from "@phosphor-icons/react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

// Eingebettete, eigenständige Animation (Artifact) — wird als statisches
// Asset aus public/embeds/ in einem iframe ausgeführt.
const EMBED_SRC = `${import.meta.env.BASE_URL}embeds/router-on-a-stick.html`;

export function RouterOnAStickDialog({ dark, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Router-on-a-Stick — Animation"
      onClick={onClose}
    >
      <div
        className={`flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex shrink-0 items-center justify-between border-b px-5 py-3 ${
            dark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <div>
            <h2 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
              Router-on-a-Stick — Animation
            </h2>
            <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Inter-VLAN-Routing über einen einzigen Trunk-Link · interaktive Timeline
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1.5 transition-colors ${
              dark ? "text-slate-400 hover:bg-slate-700 hover:text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
            aria-label="Schließen"
          >
            <X size={16} />
          </button>
        </div>

        {/* Animation (16:9, skaliert sich selbst in den Container) */}
        <div className={`min-h-0 flex-1 ${dark ? "bg-[#0B1120]" : "bg-slate-100"}`}>
          <div className="mx-auto aspect-video w-full" style={{ maxHeight: "82vh" }}>
            <iframe
              src={EMBED_SRC}
              title="Router-on-a-Stick Animation"
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

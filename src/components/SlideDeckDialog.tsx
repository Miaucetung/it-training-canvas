import { ArrowSquareOut, X } from "@phosphor-icons/react";

interface Props {
  dark: boolean;
  onClose: () => void;
  /** 1-indizierte Start-Slide (Deep-Link via #<n>). */
  startSlide?: number;
  title?: string;
  subtitle?: string;
}

// Claude-Slide-Deck (Artifact) als statisches Asset aus public/embeds/.
// Deep-Link auf eine Slide über den #<int>-Hash der iframe-URL.
const BASE = `${import.meta.env.BASE_URL}embeds/ccna-reference-slides/index.html`;

export function SlideDeckDialog({
  dark,
  onClose,
  startSlide = 1,
  title = "CCNA Reference Slides",
  subtitle = "10 Referenz-Slides im Claude-Design · ← → zum Blättern",
}: Props) {
  const src = `${BASE}#${Math.max(1, startSlide)}`;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
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
              {title}
            </h2>
            <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                dark ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"
              }`}
              title="In neuem Tab öffnen"
            >
              <ArrowSquareOut size={14} /> Vollbild
            </a>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-md p-1.5 transition-colors ${
                dark ? "text-slate-400 hover:bg-slate-700" : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-label="Schließen"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Deck (16:9) */}
        <div className="min-h-0 flex-1 bg-[#06101e]">
          <div className="mx-auto h-full w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              key={src}
              src={src}
              title={title}
              className="h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}

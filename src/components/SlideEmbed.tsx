import { ArrowSquareOut } from "@phosphor-icons/react";

interface Props {
  slug: string;
  dark: boolean;
}

// Inline-Einzel-Slide (Claude-Design) als Auffrischung zwischen Textabschnitten.
// Statisches Asset aus public/embeds/ccna-slides/<slug>.html (je eine Slide).
const LABELS: Record<string, string> = {
  stp: "Spanning Tree Protocol",
  osi: "OSI-Modell",
  "switch-commands": "Switch-Befehle",
  "vlan-segmentation": "VLAN-Segmentierung",
  subnetting: "Subnetting berechnen",
  "native-vlan": "Native VLAN",
  "console-access": "Konsolen-Zugang",
  "routing-grundlagen": "Routing-Grundlagen",
  rip: "RIP",
  eigrp: "EIGRP",
  "ospf-basics": "OSPF-Grundlagen",
  "ospf-areas": "OSPF-Areas",
};

export function SlideEmbed({ slug, dark }: Props) {
  const src = `${import.meta.env.BASE_URL}embeds/ccna-slides/${slug}.html`;
  const label = LABELS[slug] ?? slug;

  return (
    <figure
      className={`my-4 overflow-hidden rounded-xl border ${
        dark ? "border-slate-700 bg-[#080b12]" : "border-slate-200 bg-[#080b12]"
      }`}
    >
      <figcaption
        className={`flex items-center justify-between px-3 py-1.5 text-[11px] ${
          dark ? "bg-slate-800/70 text-slate-300" : "bg-slate-800 text-slate-200"
        }`}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <span aria-hidden>📊</span> Auffrischung · {label}
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 opacity-80 hover:opacity-100"
          title="In neuem Tab öffnen"
        >
          <ArrowSquareOut size={12} /> Vollbild
        </a>
      </figcaption>
      <div className="w-full" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          src={src}
          title={`Slide: ${label}`}
          loading="lazy"
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>
    </figure>
  );
}

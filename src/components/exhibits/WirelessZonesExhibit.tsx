import type { WirelessZonesExhibit as WirelessZonesExhibitData } from "@/types/exhibit";

// Farbkonvention wie TopologyExhibit: muted-foreground für sichtbare Strokes,
// --border nur für Hairlines (im Light-Mode zu hell für Diagramm-Linien).
const STROKE = "var(--muted-foreground, #64748b)";
const TEXT = "var(--foreground, #e5e7eb)";

const DEFAULT_R = 90;

/** Ein Füllmuster pro Kanal — Zonen mit gleichem Kanal sehen gleich aus. */
const CHANNEL_PATTERNS: Record<number, (id: string) => React.ReactElement> = {
  1: (id) => (
    <pattern id={id} width={8} height={8} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
      <line x1={0} y1={0} x2={0} y2={8} style={{ stroke: STROKE }} strokeWidth={1} opacity={0.55} />
    </pattern>
  ),
  6: (id) => (
    <pattern id={id} width={8} height={8} patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
      <line x1={0} y1={0} x2={0} y2={8} style={{ stroke: STROKE }} strokeWidth={1} opacity={0.55} />
    </pattern>
  ),
  11: (id) => (
    <pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse">
      <path d="M 0 4 L 4 0 L 8 4 L 4 8 Z" fill="none" style={{ stroke: STROKE }} strokeWidth={0.8} opacity={0.55} />
    </pattern>
  ),
};

// Fallback für Kanäle ohne eigenes Muster (Punkte).
function fallbackPattern(id: string) {
  return (
    <pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse">
      <circle cx={4} cy={4} r={1} style={{ fill: STROKE }} opacity={0.55} />
    </pattern>
  );
}

export function WirelessZonesExhibit({ exhibit }: { exhibit: WirelessZonesExhibitData }) {
  const { zones } = exhibit;
  if (zones.length === 0) return null;

  const channels = [...new Set(zones.map((z) => z.channel))].sort((a, b) => a - b);
  const patternId = (ch: number) => `zone-ch-${ch}`;

  const rOf = (z: WirelessZonesExhibitData["zones"][number]) => z.r ?? DEFAULT_R;
  const minX = Math.min(...zones.map((z) => z.x - rOf(z))) - 20;
  const minY = Math.min(...zones.map((z) => z.y - rOf(z))) - 20;
  const maxX = Math.max(...zones.map((z) => z.x + rOf(z))) + 20;
  // Platz für die Kanal-Legende unter den Zonen
  const legendR = 34;
  const legendY = Math.max(...zones.map((z) => z.y + rOf(z))) + 70;
  const maxY = legendY + legendR + 30;

  return (
    <div className="bg-card p-2">
      <svg
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        className="w-full h-auto"
        style={{ maxHeight: 420 }}
        role="img"
      >
        <defs>
          {channels.map((ch) => (
            <g key={ch}>{(CHANNEL_PATTERNS[ch] ?? fallbackPattern)(patternId(ch))}</g>
          ))}
        </defs>

        {zones.map((z) => (
          <g key={z.id}>
            <circle
              cx={z.x}
              cy={z.y}
              r={rOf(z)}
              fill={`url(#${patternId(z.channel)})`}
              style={{ stroke: STROKE }}
              strokeWidth={1.5}
            />
            <text x={z.x} y={z.y} textAnchor="middle" dy={4} fontSize={13} fontWeight={600} style={{ fill: TEXT }}>
              {z.label}
            </text>
          </g>
        ))}

        {/* Legende: ein Kreis pro Kanal */}
        {channels.map((ch, i) => {
          const cx = minX + 60 + i * 110;
          return (
            <g key={ch}>
              <circle
                cx={cx}
                cy={legendY}
                r={legendR}
                fill={`url(#${patternId(ch)})`}
                style={{ stroke: STROKE }}
                strokeWidth={1.5}
              />
              <text x={cx} y={legendY - 4} textAnchor="middle" fontSize={11} style={{ fill: TEXT }}>
                Channel
              </text>
              <text x={cx} y={legendY + 12} textAnchor="middle" fontSize={12} fontWeight={600} style={{ fill: TEXT }}>
                {ch}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

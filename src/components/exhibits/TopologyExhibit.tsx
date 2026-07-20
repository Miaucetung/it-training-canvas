import type {
  TopologyExhibit as TopologyExhibitData,
  TopologyDevice,
} from "@/types/exhibit";

// Farben über shadcn-CSS-Variablen (dark-mode-fähig); Fallbacks falls Token fehlt.
// STROKE bewusst muted-foreground statt border: --border ist im Light-Mode zu
// hell (oklch 0.922) — Icons und Links wären auf Weiß praktisch unsichtbar.
const FILL = "var(--card, #1a2230)";
const STROKE = "var(--muted-foreground, #64748b)";
const HAIRLINE = "var(--border, #2b3647)";
const TEXT = "var(--foreground, #e5e7eb)";
const TEXT_MUTED = "var(--muted-foreground, #94a3b8)";
const ACCENT = "var(--primary, #6366f1)";

// ── Geräte-Icons (zentriert auf 0,0) ────────────────────────
function DeviceIcon({ type }: { type: TopologyDevice["type"] }) {
  const stroke = { stroke: STROKE, fill: FILL } as const;
  switch (type) {
    case "router":
      return (
        <g>
          {[
            [0, -30, 0, -22],
            [0, 22, 0, 30],
            [-30, 0, -22, 0],
            [22, 0, 30, 0],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: STROKE }} strokeWidth={2} />
          ))}
          <circle r={22} style={stroke} strokeWidth={2} />
          <path d="M -9 -9 L 9 9 M 9 -9 L -9 9" style={{ stroke: ACCENT }} strokeWidth={2} fill="none" />
        </g>
      );
    case "multilayer-switch":
      return (
        <g>
          {[-14, -4, 6, 16].map((x) => (
            <line key={x} x1={x} y1={-22} x2={x} y2={-15} style={{ stroke: STROKE }} strokeWidth={2} />
          ))}
          <rect x={-22} y={-15} width={44} height={30} rx={3} style={stroke} strokeWidth={2} />
          <circle r={8} style={{ fill: "none", stroke: ACCENT }} strokeWidth={1.5} />
          <text textAnchor="middle" dy={3.5} fontSize={9} fontWeight={700} style={{ fill: ACCENT }}>
            Si
          </text>
        </g>
      );
    case "switch":
      return (
        <g>
          {[-14, -4, 6, 16].map((x) => (
            <line key={x} x1={x} y1={-20} x2={x} y2={-13} style={{ stroke: STROKE }} strokeWidth={2} />
          ))}
          <rect x={-22} y={-13} width={44} height={26} rx={3} style={stroke} strokeWidth={2} />
          <path d="M -12 0 L 12 0 M 4 -5 L 12 0 L 4 5" style={{ stroke: TEXT_MUTED }} strokeWidth={1.5} fill="none" />
        </g>
      );
    case "pc":
      return (
        <g>
          <rect x={-18} y={-16} width={36} height={24} rx={2} style={stroke} strokeWidth={2} />
          <rect x={-14} y={-12} width={28} height={16} rx={1} style={{ fill: STROKE }} />
          <line x1={0} y1={8} x2={0} y2={13} style={{ stroke: STROKE }} strokeWidth={2} />
          <line x1={-9} y1={13} x2={9} y2={13} style={{ stroke: STROKE }} strokeWidth={2} />
        </g>
      );
    case "firewall":
      return (
        <g>
          <rect x={-22} y={-15} width={44} height={30} rx={2} style={stroke} strokeWidth={2} />
          <line x1={-22} y1={-5} x2={22} y2={-5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={-22} y1={5} x2={22} y2={5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={-7} y1={-15} x2={-7} y2={-5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={7} y1={-15} x2={7} y2={-5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={0} y1={-5} x2={0} y2={5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={-14} y1={-5} x2={-14} y2={5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={14} y1={-5} x2={14} y2={5} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={-7} y1={5} x2={-7} y2={15} style={{ stroke: STROKE }} strokeWidth={1} />
          <line x1={7} y1={5} x2={7} y2={15} style={{ stroke: STROKE }} strokeWidth={1} />
        </g>
      );
    case "cloud":
      return (
        <g style={stroke} strokeWidth={2}>
          <ellipse cx={-12} cy={2} rx={16} ry={12} />
          <ellipse cx={12} cy={2} rx={16} ry={12} />
          <ellipse cx={0} cy={-6} rx={16} ry={13} />
          <rect x={-26} y={2} width={52} height={12} style={{ fill: FILL, stroke: "none" }} />
          <line x1={-26} y1={14} x2={26} y2={14} style={{ stroke: STROKE }} strokeWidth={2} />
        </g>
      );
  }
}

export function TopologyExhibit({ exhibit }: { exhibit: TopologyExhibitData }) {
  const { devices, links, labels } = exhibit;
  if (devices.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-500">
        Topologie wird nachgereicht.
      </div>
    );
  }

  const byId = new Map(devices.map((d) => [d.id, d]));
  const minX = Math.min(...devices.map((d) => d.x)) - 60;
  const minY = Math.min(...devices.map((d) => d.y)) - 60;
  const maxX = Math.max(...devices.map((d) => d.x)) + 60;
  const maxY = Math.max(...devices.map((d) => d.y)) + 60;
  const w = maxX - minX;
  const h = maxY - minY;

  return (
    <div className="bg-card p-2">
      <svg
        viewBox={`${minX} ${minY} ${w} ${h}`}
        className="w-full h-auto"
        style={{ maxHeight: 420 }}
        role="img"
      >
        {/* Links zuerst (unter den Geräten) */}
        {links.map((link, i) => {
          const a = byId.get(link.from);
          const b = byId.get(link.to);
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const fx = a.x + ux * 40;
          const fy = a.y + uy * 40;
          const tx = b.x - ux * 40;
          const ty = b.y - uy * 40;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: STROKE }} strokeWidth={2} />
              {link.subnet && (
                <g>
                  <rect
                    x={mx - link.subnet.length * 3.4 - 4}
                    y={my - 9}
                    width={link.subnet.length * 6.8 + 8}
                    height={18}
                    rx={9}
                    style={{ fill: FILL, stroke: HAIRLINE }}
                    strokeWidth={1}
                  />
                  <text x={mx} y={my} textAnchor="middle" dy={3.5} fontSize={10} fontFamily="monospace" style={{ fill: TEXT_MUTED }}>
                    {link.subnet}
                  </text>
                </g>
              )}
              {link.labelFrom && (
                <text x={fx} y={fy - 5} textAnchor="middle" fontSize={10} fontFamily="monospace" style={{ fill: TEXT_MUTED }}>
                  {link.labelFrom}
                </text>
              )}
              {link.labelTo && (
                <text x={tx} y={ty - 5} textAnchor="middle" fontSize={10} fontFamily="monospace" style={{ fill: TEXT_MUTED }}>
                  {link.labelTo}
                </text>
              )}
            </g>
          );
        })}

        {/* Geräte */}
        {devices.map((d) => (
          <g key={d.id} transform={`translate(${d.x},${d.y})`}>
            <DeviceIcon type={d.type} />
            <text textAnchor="middle" y={42} fontSize={12} fontWeight={600} style={{ fill: TEXT }}>
              {d.label}
            </text>
          </g>
        ))}

        {/* freie Labels */}
        {labels?.map((lab, i) => {
          const d = byId.get(lab.attachTo);
          if (!d) return null;
          const off = 50;
          const pos = {
            above: { x: d.x, y: d.y - off, anchor: "middle" as const },
            below: { x: d.x, y: d.y + off, anchor: "middle" as const },
            left: { x: d.x - off, y: d.y, anchor: "end" as const },
            right: { x: d.x + off, y: d.y, anchor: "start" as const },
          }[lab.position];
          return (
            <text key={i} x={pos.x} y={pos.y} textAnchor={pos.anchor} dy={3.5} fontSize={11} style={{ fill: TEXT_MUTED }}>
              {lab.text}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

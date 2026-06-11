import { ShapeCategory, ShapeDefinition } from "./types";

// Kategorien für die Shape-Library
export const SHAPE_CATEGORIES: Record<
  ShapeCategory,
  { name: string; icon: string; color: string }
> = {
  network: { name: "Netzwerk", icon: "WifiHigh", color: "#10B981" },
  cloud: { name: "Cloud", icon: "Cloud", color: "#3B82F6" },
  server: { name: "Server", icon: "HardDrives", color: "#6366F1" },
  storage: { name: "Speicher", icon: "Database", color: "#F59E0B" },
  security: { name: "Security", icon: "ShieldCheck", color: "#EF4444" },
  containers: { name: "Container", icon: "Cube", color: "#2496ED" },
  arrows: { name: "Pfeile", icon: "ArrowRight", color: "#64748B" },
  diagrams: { name: "Diagramme", icon: "ChartBar", color: "#8B5CF6" },
  azure: { name: "Azure", icon: "Cloud", color: "#0078D4" },
  aws: { name: "AWS", icon: "Cloud", color: "#FF9900" },
  infrastructure: { name: "Infrastruktur", icon: "Globe", color: "#0EA5E9" },
};

// IT-Shape Definitionen
export const IT_SHAPES: ShapeDefinition[] = [
  // ========== NETZWERK ==========
  {
    id: "router",
    name: "Router",
    category: "network",
    icon: "router",
    color: "#10B981",
    width: 80,
    height: 60,
    svgPath: `<!-- router-ht -->
      <defs>
        <linearGradient id="rt-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
        <radialGradient id="rt-glow" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0" stop-color="currentColor" stop-opacity="0.4"/>
          <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <line x1="20" y1="6" x2="20" y2="18" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="20" cy="5" r="2" fill="currentColor"/>
      <line x1="60" y1="6" x2="60" y2="18" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="60" cy="5" r="2" fill="currentColor"/>
      <rect x="4" y="17" width="72" height="37" rx="6" fill="url(#rt-body)" stroke="currentColor" stroke-width="1.6"/>
      <rect x="6" y="19" width="68" height="8" rx="4" fill="#FFFFFF" opacity="0.05"/>
      <circle cx="40" cy="35" r="13" fill="url(#rt-glow)"/>
      <circle cx="40" cy="35" r="10.5" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.85"/>
      <path d="M33 31.5 H47 M43.5 28.5 L47 31.5 L43.5 34.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M47 38.5 H33 M36.5 35.5 L33 38.5 L36.5 41.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="66" cy="23.5" r="2.8" fill="#22C55E" opacity="0.25"/>
      <circle cx="66" cy="23.5" r="1.4" fill="#22C55E"/>
      <circle cx="71" cy="23.5" r="2.8" fill="#F59E0B" opacity="0.25"/>
      <circle cx="71" cy="23.5" r="1.4" fill="#F59E0B"/>
      <rect x="10" y="46" width="6" height="4" rx="1" fill="currentColor" opacity="0.55"/>
      <rect x="19" y="46" width="6" height="4" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="28" y="46" width="6" height="4" rx="1" fill="currentColor" opacity="0.55"/>
      <line x1="52" y1="46" x2="70" y2="46" stroke="currentColor" stroke-width="1" opacity="0.35"/>
      <line x1="52" y1="49" x2="70" y2="49" stroke="currentColor" stroke-width="1" opacity="0.35"/>
    `,
    label: "Router",
  },
  {
    id: "switch",
    name: "Switch",
    category: "network",
    icon: "switch",
    color: "#10B981",
    width: 100,
    height: 40,
    svgPath: `<!-- switch-ht -->
      <defs>
        <linearGradient id="sw-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
      </defs>
      <rect x="3" y="6" width="94" height="28" rx="5" fill="url(#sw-body)" stroke="currentColor" stroke-width="1.6"/>
      <rect x="5" y="8" width="90" height="6" rx="3" fill="#FFFFFF" opacity="0.05"/>
      <path d="M10 16 H26 M22.5 13 L26 16 L22.5 19 M13.5 13 L10 16 L13.5 19" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 24 H26 M22.5 21 L26 24 L22.5 27 M13.5 21 L10 24 L13.5 27" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
      <circle cx="39" cy="14" r="1.3" fill="#22C55E"/>
      <circle cx="47" cy="14" r="1.3" fill="#22C55E"/>
      <circle cx="55" cy="14" r="1.3" fill="#0F1B30" stroke="currentColor" stroke-width="0.5"/>
      <circle cx="63" cy="14" r="1.3" fill="#22C55E"/>
      <circle cx="71" cy="14" r="1.3" fill="#F59E0B"/>
      <circle cx="79" cy="14" r="1.3" fill="#0F1B30" stroke="currentColor" stroke-width="0.5"/>
      <circle cx="87" cy="14" r="1.3" fill="#22C55E"/>
      <rect x="36" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="44" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="52" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.25"/>
      <rect x="60" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      <rect x="68" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.45"/>
      <rect x="76" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.25"/>
      <rect x="84" y="19" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
      <line x1="36" y1="29" x2="90" y2="29" stroke="currentColor" stroke-width="0.8" opacity="0.3"/>
    `,
    label: "Switch",
  },
  {
    id: "firewall",
    name: "Firewall",
    category: "network",
    icon: "firewall",
    color: "#EF4444",
    width: 60,
    height: 70,
    svgPath: `<!-- firewall-ht -->
      <defs>
        <linearGradient id="fw-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2A1620"/>
          <stop offset="1" stop-color="#120B14"/>
        </linearGradient>
        <radialGradient id="fw-glow" cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stop-color="currentColor" stop-opacity="0.35"/>
          <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect x="4" y="5" width="52" height="60" rx="6" fill="url(#fw-body)" stroke="currentColor" stroke-width="1.6"/>
      <rect x="6" y="7" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.05"/>
      <g stroke="currentColor" stroke-width="1.2" opacity="0.55">
        <line x1="8" y1="18" x2="52" y2="18"/>
        <line x1="8" y1="27" x2="52" y2="27"/>
        <line x1="8" y1="36" x2="52" y2="36"/>
        <line x1="20" y1="9" x2="20" y2="18"/>
        <line x1="36" y1="9" x2="36" y2="18"/>
        <line x1="14" y1="18" x2="14" y2="27"/>
        <line x1="30" y1="18" x2="30" y2="27"/>
        <line x1="46" y1="18" x2="46" y2="27"/>
        <line x1="20" y1="27" x2="20" y2="36"/>
        <line x1="36" y1="27" x2="36" y2="36"/>
      </g>
      <circle cx="30" cy="50" r="12" fill="url(#fw-glow)"/>
      <path d="M30 41 Q34 46 33 50.5 Q35.5 49 35.5 53.5 Q35.5 59 30 59 Q24.5 59 24.5 53.5 Q24.5 49.5 27.5 47 Q27 44 30 41 Z" fill="currentColor"/>
      <circle cx="30" cy="54" r="2.2" fill="#FDBA74"/>
      <circle cx="48" cy="60" r="1.4" fill="#22C55E"/>
    `,
    label: "Firewall",
  },
  {
    id: "loadbalancer",
    name: "Load Balancer",
    category: "network",
    icon: "loadbalancer",
    color: "#8B5CF6",
    width: 80,
    height: 60,
    svgPath: `<!-- loadbalancer-ht -->
      <defs>
        <linearGradient id="lb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#241B3E"/>
          <stop offset="1" stop-color="#100B1E"/>
        </linearGradient>
      </defs>
      <rect x="5" y="13" width="70" height="34" rx="17" fill="url(#lb-body)" stroke="currentColor" stroke-width="1.6"/>
      <rect x="8" y="15" width="64" height="8" rx="4" fill="#FFFFFF" opacity="0.05"/>
      <circle cx="24" cy="30" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="24" cy="30" r="2.6" fill="currentColor"/>
      <path d="M31 30 C42 30 42 20 52 20" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M31 30 H52" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M31 30 C42 30 42 40 52 40" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="58" cy="20" r="3.4" fill="#22C55E" opacity="0.25"/>
      <circle cx="58" cy="20" r="1.8" fill="#22C55E"/>
      <circle cx="58" cy="30" r="3.4" fill="#22C55E" opacity="0.25"/>
      <circle cx="58" cy="30" r="1.8" fill="#22C55E"/>
      <circle cx="58" cy="40" r="3.4" fill="#F59E0B" opacity="0.25"/>
      <circle cx="58" cy="40" r="1.8" fill="#F59E0B"/>
    `,
    label: "Load Balancer",
  },
  {
    id: "computer",
    name: "Computer",
    category: "network",
    icon: "computer",
    color: "#64748B",
    width: 60,
    height: 55,
    svgPath: `<!-- computer-ht -->
      <defs>
        <linearGradient id="pc-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
        <linearGradient id="pc-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0EA5E9" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#0EA5E9" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="52" height="37" rx="4" fill="url(#pc-body)" stroke="currentColor" stroke-width="1.6"/>
      <rect x="8" y="8" width="44" height="29" rx="2" fill="url(#pc-screen)"/>
      <path d="M10 8 L24 8 L15 37 L10 37 Z" fill="#FFFFFF" opacity="0.07"/>
      <line x1="12" y1="14" x2="34" y2="14" stroke="#E0F2FE" stroke-width="1.6" opacity="0.75"/>
      <line x1="12" y1="19" x2="27" y2="19" stroke="#BAE6FD" stroke-width="1.2" opacity="0.45"/>
      <line x1="12" y1="23" x2="31" y2="23" stroke="#BAE6FD" stroke-width="1.2" opacity="0.3"/>
      <circle cx="49" cy="34" r="1.5" fill="#22C55E"/>
      <rect x="25" y="42" width="10" height="4" fill="currentColor" opacity="0.45"/>
      <rect x="16" y="46" width="28" height="5" rx="2.5" fill="url(#pc-body)" stroke="currentColor" stroke-width="1.3"/>
    `,
    label: "PC",
  },
  {
    id: "laptop",
    name: "Laptop",
    category: "network",
    icon: "laptop",
    color: "#64748B",
    width: 70,
    height: 50,
    svgPath: `<!-- laptop-ht -->
      <defs>
        <linearGradient id="lp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
        <linearGradient id="lp-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0EA5E9" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#0EA5E9" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <rect x="11" y="4" width="48" height="32" rx="3" fill="url(#lp-body)" stroke="currentColor" stroke-width="1.5"/>
      <rect x="14" y="7" width="42" height="26" rx="1.5" fill="url(#lp-screen)"/>
      <path d="M16 7 L27 7 L20 33 L16 33 Z" fill="#FFFFFF" opacity="0.07"/>
      <line x1="18" y1="13" x2="41" y2="13" stroke="#E0F2FE" stroke-width="1.4" opacity="0.75"/>
      <line x1="18" y1="18" x2="35" y2="18" stroke="#BAE6FD" stroke-width="1.1" opacity="0.45"/>
      <path d="M5 41 L11 36 L59 36 L65 41 Z" fill="url(#lp-body)" stroke="currentColor" stroke-width="1.4"/>
      <rect x="4" y="41" width="62" height="4.5" rx="2.2" fill="#101A30" stroke="currentColor" stroke-width="1.4"/>
      <rect x="28" y="37.5" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.12"/>
    `,
    label: "Laptop",
  },
  {
    id: "smartphone",
    name: "Smartphone",
    category: "network",
    icon: "smartphone",
    color: "#64748B",
    width: 35,
    height: 60,
    svgPath: `<!-- smartphone-ht -->
      <defs>
        <linearGradient id="sp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
        <linearGradient id="sp-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0EA5E9" stop-opacity="0.4"/>
          <stop offset="1" stop-color="#0EA5E9" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <rect x="4.5" y="3" width="26" height="54" rx="6" fill="url(#sp-body)" stroke="currentColor" stroke-width="1.5"/>
      <rect x="7" y="9" width="21" height="41" rx="2.5" fill="url(#sp-screen)"/>
      <path d="M8 9 L17 9 L11 50 L8 50 Z" fill="#FFFFFF" opacity="0.06"/>
      <circle cx="17.5" cy="6" r="1.1" fill="currentColor" opacity="0.7"/>
      <line x1="10" y1="16" x2="22" y2="16" stroke="#E0F2FE" stroke-width="1.2" opacity="0.7"/>
      <line x1="10" y1="21" x2="19" y2="21" stroke="#BAE6FD" stroke-width="1" opacity="0.4"/>
      <rect x="12" y="52.5" width="11" height="1.8" rx="0.9" fill="currentColor" opacity="0.6"/>
    `,
    label: "Mobile",
  },

  // ========== NETZWERK (Zusätzlich) ==========
  {
    id: "access-point",
    name: "Access Point",
    category: "network",
    icon: "accesspoint",
    color: "#10B981",
    width: 60,
    height: 55,
    svgPath: `<!-- access-point-ht -->
      <defs>
        <linearGradient id="ap-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
      </defs>
      <path d="M14 24 Q30 9 46 24" stroke="currentColor" stroke-width="1.8" fill="none" opacity="0.9" stroke-linecap="round"/>
      <path d="M19 29 Q30 19 41 29" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6" stroke-linecap="round"/>
      <path d="M24 33 Q30 27.5 36 33" stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.4" stroke-linecap="round"/>
      <ellipse cx="30" cy="44" rx="20" ry="7.5" fill="url(#ap-body)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="30" cy="41.5" rx="20" ry="7.5" fill="url(#ap-body)" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="30" cy="40" rx="13" ry="4" fill="#FFFFFF" opacity="0.05"/>
      <circle cx="30" cy="40.5" r="3.2" fill="#22C55E" opacity="0.25"/>
      <circle cx="30" cy="40.5" r="1.6" fill="#22C55E"/>
      <line x1="20" y1="53.5" x2="40" y2="53.5" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>
    `,
    label: "AP",
  },
  {
    id: "hub",
    name: "Hub",
    category: "network",
    icon: "hub",
    color: "#94A3B8",
    width: 90,
    height: 40,
    svgPath: `<!-- hub-ht -->
      <defs>
        <linearGradient id="hb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#222B3D"/>
          <stop offset="1" stop-color="#0B1220"/>
        </linearGradient>
      </defs>
      <rect x="3" y="7" width="84" height="26" rx="5" fill="url(#hb-body)" stroke="currentColor" stroke-width="1.5"/>
      <rect x="5" y="9" width="80" height="5" rx="2.5" fill="#FFFFFF" opacity="0.05"/>
      <line x1="14" y1="20" x2="76" y2="20" stroke="currentColor" stroke-width="1.6" opacity="0.6"/>
      <circle cx="20" cy="20" r="4.5" fill="#0B1322" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="1.6" fill="currentColor"/>
      <circle cx="45" cy="20" r="4.5" fill="#0B1322" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="45" cy="20" r="1.6" fill="currentColor"/>
      <circle cx="70" cy="20" r="4.5" fill="#0B1322" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="70" cy="20" r="1.6" fill="currentColor"/>
      <circle cx="81" cy="12" r="1.3" fill="#F59E0B"/>
    `,
    label: "Hub",
  },
  {
    id: "modem",
    name: "Modem",
    category: "network",
    icon: "modem",
    color: "#64748B",
    width: 60,
    height: 45,
    svgPath: `<!-- modem-ht -->
      <defs>
        <linearGradient id="md-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
      </defs>
      <line x1="48" y1="4" x2="48" y2="13" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="48" cy="3.4" r="1.8" fill="currentColor"/>
      <rect x="4" y="12" width="52" height="28" rx="5" fill="url(#md-body)" stroke="currentColor" stroke-width="1.5"/>
      <rect x="6" y="14" width="48" height="6" rx="3" fill="#FFFFFF" opacity="0.05"/>
      <circle cx="14" cy="26" r="2.8" fill="#22C55E" opacity="0.25"/>
      <circle cx="14" cy="26" r="1.4" fill="#22C55E"/>
      <circle cx="26" cy="26" r="2.8" fill="#22C55E" opacity="0.25"/>
      <circle cx="26" cy="26" r="1.4" fill="#22C55E"/>
      <circle cx="38" cy="26" r="2.8" fill="#F59E0B" opacity="0.25"/>
      <circle cx="38" cy="26" r="1.4" fill="#F59E0B"/>
      <rect x="11" y="31" width="6" height="1.4" rx="0.7" fill="currentColor" opacity="0.35"/>
      <rect x="23" y="31" width="6" height="1.4" rx="0.7" fill="currentColor" opacity="0.35"/>
      <rect x="35" y="31" width="6" height="1.4" rx="0.7" fill="currentColor" opacity="0.35"/>
      <rect x="46" y="29" width="7" height="6" rx="1" fill="currentColor" opacity="0.4"/>
    `,
    label: "Modem",
  },
  {
    id: "ip-phone",
    name: "IP-Telefon",
    category: "network",
    icon: "ipphone",
    color: "#10B981",
    width: 50,
    height: 55,
    svgPath: `<!-- ip-phone-ht -->
      <defs>
        <linearGradient id="ph-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
        <linearGradient id="ph-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0EA5E9" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#0EA5E9" stop-opacity="0.08"/>
        </linearGradient>
      </defs>
      <path d="M36 14 Q40 4 46 7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="46.5" cy="6.5" r="2.6" fill="url(#ph-body)" stroke="currentColor" stroke-width="1.2"/>
      <rect x="4" y="13" width="42" height="39" rx="5" fill="url(#ph-body)" stroke="currentColor" stroke-width="1.5"/>
      <rect x="6" y="15" width="38" height="6" rx="3" fill="#FFFFFF" opacity="0.05"/>
      <rect x="9" y="19" width="23" height="11" rx="2" fill="url(#ph-screen)"/>
      <circle cx="38.5" cy="23" r="1.4" fill="#22C55E"/>
      <rect x="9" y="34" width="8" height="5" rx="1.2" fill="currentColor" opacity="0.45"/>
      <rect x="20" y="34" width="8" height="5" rx="1.2" fill="currentColor" opacity="0.45"/>
      <rect x="31" y="34" width="8" height="5" rx="1.2" fill="currentColor" opacity="0.45"/>
      <rect x="9" y="41" width="8" height="5" rx="1.2" fill="currentColor" opacity="0.45"/>
      <rect x="20" y="41" width="8" height="5" rx="1.2" fill="currentColor" opacity="0.45"/>
      <rect x="31" y="41" width="8" height="5" rx="1.2" fill="currentColor" opacity="0.45"/>
    `,
    label: "IP Phone",
  },
  {
    id: "printer",
    name: "Drucker",
    category: "network",
    icon: "printer",
    color: "#64748B",
    width: 60,
    height: 55,
    svgPath: `
      <rect x="5" y="20" width="50" height="25" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="12" y="5" width="36" height="15" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
      <rect x="10" y="45" width="40" height="8" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <rect x="38" y="28" width="12" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="32" r="2" fill="#22C55E"/>
    `,
    label: "Printer",
  },
  {
    id: "tablet",
    name: "Tablet",
    category: "network",
    icon: "tablet",
    color: "#64748B",
    width: 45,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="35" height="50" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="8" y="10" width="29" height="38" fill="currentColor" opacity="0.1"/>
      <circle cx="22.5" cy="52" r="2" fill="currentColor" opacity="0.5"/>
    `,
    label: "Tablet",
  },

  // ========== SERVER ==========
  {
    id: "server",
    name: "Server",
    category: "server",
    icon: "server",
    color: "#6366F1",
    width: 60,
    height: 80,
    svgPath: `<!-- server-ht -->
      <defs>
        <linearGradient id="sv-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#26334F"/>
          <stop offset="1" stop-color="#0B1322"/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="52" height="72" rx="5" fill="url(#sv-body)" stroke="currentColor" stroke-width="1.6"/>
      <rect x="6" y="6" width="48" height="7" rx="3.5" fill="#FFFFFF" opacity="0.05"/>
      <rect x="8" y="10" width="44" height="14" rx="2" fill="#0B1322" stroke="currentColor" stroke-width="1" opacity="0.95"/>
      <line x1="12" y1="15" x2="32" y2="15" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
      <line x1="12" y1="19" x2="32" y2="19" stroke="currentColor" stroke-width="1.2" opacity="0.3"/>
      <circle cx="45" cy="17" r="2.6" fill="#22C55E" opacity="0.25"/>
      <circle cx="45" cy="17" r="1.3" fill="#22C55E"/>
      <rect x="8" y="28" width="44" height="14" rx="2" fill="#0B1322" stroke="currentColor" stroke-width="1" opacity="0.95"/>
      <line x1="12" y1="33" x2="32" y2="33" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
      <line x1="12" y1="37" x2="32" y2="37" stroke="currentColor" stroke-width="1.2" opacity="0.3"/>
      <circle cx="45" cy="35" r="2.6" fill="#22C55E" opacity="0.25"/>
      <circle cx="45" cy="35" r="1.3" fill="#22C55E"/>
      <rect x="8" y="46" width="44" height="14" rx="2" fill="#0B1322" stroke="currentColor" stroke-width="1" opacity="0.95"/>
      <line x1="12" y1="51" x2="32" y2="51" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
      <line x1="12" y1="55" x2="32" y2="55" stroke="currentColor" stroke-width="1.2" opacity="0.3"/>
      <circle cx="45" cy="53" r="2.6" fill="#F59E0B" opacity="0.25"/>
      <circle cx="45" cy="53" r="1.3" fill="#F59E0B"/>
      <line x1="10" y1="65" x2="50" y2="65" stroke="currentColor" stroke-width="1" opacity="0.25"/>
      <line x1="10" y1="68" x2="50" y2="68" stroke="currentColor" stroke-width="1" opacity="0.25"/>
      <line x1="10" y1="71" x2="50" y2="71" stroke="currentColor" stroke-width="1" opacity="0.25"/>
      <circle cx="48" cy="71" r="1.3" fill="#22C55E"/>
    `,
    label: "Server",
  },
  {
    id: "rack",
    name: "Server Rack",
    category: "server",
    icon: "rack",
    color: "#6366F1",
    width: 70,
    height: 100,
    svgPath: `
      <rect x="5" y="5" width="60" height="90" rx="3" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="50" height="15" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="28" width="50" height="15" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="46" width="50" height="15" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="64" width="50" height="15" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="54" cy="17" r="2" fill="#22C55E"/>
      <circle cx="54" cy="35" r="2" fill="#22C55E"/>
      <circle cx="54" cy="53" r="2" fill="#F59E0B"/>
      <circle cx="54" cy="71" r="2" fill="#EF4444"/>
      <line x1="15" y1="17" x2="45" y2="17" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="35" x2="45" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="53" x2="45" y2="53" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="71" x2="45" y2="71" stroke="currentColor" stroke-width="2"/>
    `,
    label: "Rack",
  },
  {
    id: "virtualmachine",
    name: "VM",
    category: "server",
    icon: "vm",
    color: "#8B5CF6",
    width: 70,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="60" height="50" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/>
      <rect x="12" y="12" width="46" height="36" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
      <text x="35" y="35" text-anchor="middle" fill="currentColor" font-size="12" font-weight="bold">VM</text>
    `,
    label: "VM",
  },

  // ========== SERVER (Zusätzlich) ==========
  {
    id: "dns-server",
    name: "DNS Server",
    category: "server",
    icon: "dnsserver",
    color: "#6366F1",
    width: 60,
    height: 80,
    svgPath: `
      <rect x="5" y="5" width="50" height="70" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="26" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="16" r="3" fill="#22C55E"/>
      <circle cx="44" cy="32" r="3" fill="#22C55E"/>
      <text x="30" y="56" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">DNS</text>
    `,
    label: "DNS Server",
  },
  {
    id: "dhcp-server",
    name: "DHCP Server",
    category: "server",
    icon: "dhcpserver",
    color: "#6366F1",
    width: 60,
    height: 80,
    svgPath: `
      <rect x="5" y="5" width="50" height="70" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="26" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="16" r="3" fill="#3B82F6"/>
      <circle cx="44" cy="32" r="3" fill="#3B82F6"/>
      <text x="30" y="56" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">DHCP</text>
    `,
    label: "DHCP Server",
  },
  {
    id: "ad-server",
    name: "Active Directory",
    category: "server",
    icon: "adserver",
    color: "#0078D4",
    width: 60,
    height: 80,
    svgPath: `
      <rect x="5" y="5" width="50" height="70" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="26" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="16" r="3" fill="#0078D4"/>
      <circle cx="44" cy="32" r="3" fill="#0078D4"/>
      <text x="30" y="56" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">AD</text>
    `,
    label: "AD Server",
  },
  {
    id: "web-server",
    name: "Web Server",
    category: "server",
    icon: "webserver",
    color: "#22C55E",
    width: 60,
    height: 80,
    svgPath: `
      <rect x="5" y="5" width="50" height="70" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="26" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="16" r="3" fill="#22C55E"/>
      <circle cx="44" cy="32" r="3" fill="#22C55E"/>
      <text x="30" y="56" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">WWW</text>
    `,
    label: "Web Server",
  },
  {
    id: "file-server",
    name: "File Server",
    category: "server",
    icon: "fileserver",
    color: "#F59E0B",
    width: 60,
    height: 80,
    svgPath: `
      <rect x="5" y="5" width="50" height="70" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="26" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="42" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="16" r="3" fill="#F59E0B"/>
      <circle cx="44" cy="32" r="3" fill="#F59E0B"/>
      <circle cx="44" cy="48" r="3" fill="#F59E0B"/>
      <text x="30" y="70" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">FILE</text>
    `,
    label: "File Server",
  },
  {
    id: "mail-server",
    name: "Mail Server",
    category: "server",
    icon: "mailserver",
    color: "#EC4899",
    width: 60,
    height: 80,
    svgPath: `
      <rect x="5" y="5" width="50" height="70" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="26" width="40" height="12" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="44" cy="16" r="3" fill="#EC4899"/>
      <circle cx="44" cy="32" r="3" fill="#EC4899"/>
      <path d="M15 52 L30 62 L45 52 Z" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="1.5"/>
      <rect x="15" y="52" width="30" height="15" rx="2" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
    `,
    label: "Mail Server",
  },
  {
    id: "proxy",
    name: "Proxy Server",
    category: "server",
    icon: "proxy",
    color: "#8B5CF6",
    width: 60,
    height: 70,
    svgPath: `
      <rect x="5" y="5" width="50" height="60" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="28" r="12" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <path d="M22 28 L30 22 L38 28 L30 34 Z" fill="currentColor" opacity="0.5"/>
      <text x="30" y="55" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">PROXY</text>
    `,
    label: "Proxy",
  },

  // ========== STORAGE (Zusätzlich) ==========
  {
    id: "nas",
    name: "NAS",
    category: "storage",
    icon: "nas",
    color: "#F59E0B",
    width: 70,
    height: 55,
    svgPath: `
      <rect x="5" y="5" width="60" height="45" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="18" height="35" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="31" y="10" width="18" height="35" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="52" y="10" width="10" height="35" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="19" cy="40" r="2" fill="#22C55E"/>
      <circle cx="40" cy="40" r="2" fill="#22C55E"/>
      <circle cx="57" cy="40" r="2" fill="#F59E0B"/>
    `,
    label: "NAS",
  },
  {
    id: "san",
    name: "SAN",
    category: "storage",
    icon: "san",
    color: "#F59E0B",
    width: 80,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="70" height="50" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="60" height="15" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="28" width="60" height="15" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="62" cy="17" r="3" fill="#22C55E"/>
      <circle cx="62" cy="35" r="3" fill="#22C55E"/>
      <line x1="15" y1="17" x2="50" y2="17" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="35" x2="50" y2="35" stroke="currentColor" stroke-width="2"/>
      <text x="40" y="52" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">SAN</text>
    `,
    label: "SAN",
  },

  // ========== SECURITY (Zusätzlich) ==========
  {
    id: "ids-ips",
    name: "IDS/IPS",
    category: "security",
    icon: "idsips",
    color: "#EF4444",
    width: 60,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="50" height="50" rx="4" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="25" r="12" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <path d="M24 25 L30 19 L36 25 L30 31 Z" fill="currentColor" opacity="0.5"/>
      <text x="30" y="50" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">IDS/IPS</text>
    `,
    label: "IDS/IPS",
  },

  // ========== STORAGE ==========
  {
    id: "database",
    name: "Datenbank",
    category: "storage",
    icon: "database",
    color: "#F59E0B",
    width: 60,
    height: 70,
    svgPath: `
      <ellipse cx="30" cy="15" rx="25" ry="10" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <path d="M5 15 L5 55 Q5 65 30 65 Q55 65 55 55 L55 15" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="30" cy="55" rx="25" ry="10" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="30" cy="35" rx="25" ry="10" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    `,
    label: "DB",
  },
  {
    id: "storage",
    name: "Storage",
    category: "storage",
    icon: "storage",
    color: "#F59E0B",
    width: 80,
    height: 50,
    svgPath: `
      <rect x="5" y="5" width="70" height="40" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="25" height="30" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="40" y="10" width="25" height="30" rx="2" fill="currentColor" opacity="0.3"/>
      <line x1="15" y1="20" x2="30" y2="20" stroke="currentColor" stroke-width="1.5"/>
      <line x1="15" y1="25" x2="30" y2="25" stroke="currentColor" stroke-width="1.5"/>
      <line x1="15" y1="30" x2="30" y2="30" stroke="currentColor" stroke-width="1.5"/>
      <line x1="45" y1="20" x2="60" y2="20" stroke="currentColor" stroke-width="1.5"/>
      <line x1="45" y1="25" x2="60" y2="25" stroke="currentColor" stroke-width="1.5"/>
      <line x1="45" y1="30" x2="60" y2="30" stroke="currentColor" stroke-width="1.5"/>
    `,
    label: "Storage",
  },
  {
    id: "harddisk",
    name: "Festplatte",
    category: "storage",
    icon: "harddisk",
    color: "#64748B",
    width: 60,
    height: 50,
    svgPath: `
      <rect x="5" y="5" width="50" height="40" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="40" cy="25" r="12" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="40" cy="25" r="4" fill="currentColor"/>
      <rect x="10" y="12" width="15" height="6" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="10" y="22" width="15" height="6" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="10" y="32" width="15" height="6" rx="1" fill="currentColor" opacity="0.4"/>
    `,
    label: "HDD",
  },

  // ========== CLOUD ==========
  {
    id: "cloud",
    name: "Cloud",
    category: "cloud",
    icon: "cloud",
    color: "#3B82F6",
    width: 90,
    height: 60,
    svgPath: `<!-- cloud-ht -->
      <defs>
        <linearGradient id="cl-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="currentColor" stop-opacity="0.38"/>
          <stop offset="1" stop-color="currentColor" stop-opacity="0.07"/>
        </linearGradient>
      </defs>
      <path d="M20 50 Q5 50 5 38 Q5 26 18 26 Q18 15 35 15 Q52 15 55 26 Q75 20 80 35 Q90 35 85 48 Q83 55 70 55 L20 55 Q10 55 10 48 Z"
            fill="url(#cl-fill)" stroke="currentColor" stroke-width="1.8"/>
      <path d="M18 26 Q22 20 30 19" stroke="#FFFFFF" stroke-width="1.4" opacity="0.18" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="40" r="2.2" fill="currentColor"/>
      <circle cx="48" cy="33" r="2.2" fill="currentColor"/>
      <circle cx="63" cy="41" r="2.2" fill="currentColor"/>
      <path d="M32 40 L48 33 L63 41" stroke="currentColor" stroke-width="1.2" opacity="0.55" fill="none"/>
    `,
    label: "Cloud",
  },
  {
    id: "cloudserver",
    name: "Cloud Server",
    category: "cloud",
    icon: "cloudserver",
    color: "#3B82F6",
    width: 90,
    height: 70,
    svgPath: `
      <path d="M20 40 Q5 40 5 30 Q5 20 18 20 Q18 10 35 10 Q52 10 55 20 Q75 15 80 28 Q90 28 85 38 Q83 45 70 45 L20 45 Q10 45 10 40 Z"
            fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
      <rect x="25" y="48" width="40" height="18" rx="2" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="58" cy="57" r="3" fill="#22C55E"/>
      <line x1="30" y1="54" x2="50" y2="54" stroke="currentColor" stroke-width="1.5"/>
      <line x1="30" y1="60" x2="50" y2="60" stroke="currentColor" stroke-width="1.5"/>
    `,
    label: "Cloud Server",
  },
  {
    id: "clouddb",
    name: "Cloud DB",
    category: "cloud",
    icon: "clouddb",
    color: "#3B82F6",
    width: 90,
    height: 70,
    svgPath: `
      <path d="M20 35 Q5 35 5 25 Q5 15 18 15 Q18 5 35 5 Q52 5 55 15 Q75 10 80 23 Q90 23 85 33 Q83 40 70 40 L20 40 Q10 40 10 35 Z"
            fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="45" cy="50" rx="20" ry="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M25 50 L25 62 Q25 68 45 68 Q65 68 65 62 L65 50" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.5"/>
      <ellipse cx="45" cy="62" rx="20" ry="6" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1"/>
    `,
    label: "Cloud DB",
  },

  // ========== CONTAINERS ==========
  {
    id: "docker",
    name: "Docker",
    category: "containers",
    icon: "docker",
    color: "#2496ED",
    width: 70,
    height: 55,
    svgPath: `
      <rect x="5" y="25" width="60" height="25" rx="3" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <rect x="8" y="5" width="12" height="18" rx="1" fill="currentColor" opacity="0.5"/>
      <rect x="22" y="5" width="12" height="18" rx="1" fill="currentColor" opacity="0.5"/>
      <rect x="36" y="5" width="12" height="18" rx="1" fill="currentColor" opacity="0.5"/>
      <rect x="50" y="12" width="12" height="11" rx="1" fill="currentColor" opacity="0.5"/>
      <rect x="10" y="28" width="10" height="8" rx="1" fill="currentColor" opacity="0.2"/>
      <rect x="23" y="28" width="10" height="8" rx="1" fill="currentColor" opacity="0.2"/>
      <rect x="36" y="28" width="10" height="8" rx="1" fill="currentColor" opacity="0.2"/>
      <rect x="49" y="28" width="10" height="8" rx="1" fill="currentColor" opacity="0.2"/>
    `,
    label: "Docker",
  },
  {
    id: "container",
    name: "Container",
    category: "containers",
    icon: "container",
    color: "#2496ED",
    width: 60,
    height: 50,
    svgPath: `
      <rect x="5" y="5" width="50" height="40" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>
      <rect x="10" y="10" width="20" height="14" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="32" y="10" width="18" height="14" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="10" y="26" width="40" height="14" rx="2" fill="currentColor" opacity="0.4"/>
    `,
    label: "Container",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "containers",
    icon: "kubernetes",
    color: "#326CE5",
    width: 60,
    height: 60,
    svgPath: `
      <polygon points="30,5 55,20 55,45 30,60 5,45 5,20" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="32" r="12" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M30 20 L30 44" stroke="currentColor" stroke-width="2"/>
      <path d="M18 26 L42 38" stroke="currentColor" stroke-width="2"/>
      <path d="M42 26 L18 38" stroke="currentColor" stroke-width="2"/>
    `,
    label: "K8s",
  },
  {
    id: "pod",
    name: "Pod",
    category: "containers",
    icon: "pod",
    color: "#326CE5",
    width: 70,
    height: 45,
    svgPath: `
      <rect x="5" y="5" width="60" height="35" rx="6" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="18" height="25" rx="3" fill="currentColor" opacity="0.35"/>
      <rect x="31" y="10" width="18" height="25" rx="3" fill="currentColor" opacity="0.35"/>
      <rect x="52" y="10" width="10" height="25" rx="3" fill="currentColor" opacity="0.35"/>
    `,
    label: "Pod",
  },

  // ========== SECURITY ==========
  {
    id: "lock",
    name: "Schloss",
    category: "security",
    icon: "lock",
    color: "#EF4444",
    width: 50,
    height: 60,
    svgPath: `
      <rect x="8" y="25" width="34" height="30" rx="4" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <path d="M15 25 L15 18 Q15 5 25 5 Q35 5 35 18 L35 25" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="25" cy="40" r="5" fill="currentColor"/>
      <rect x="23" y="43" width="4" height="8" fill="currentColor"/>
    `,
    label: "Lock",
  },
  {
    id: "shield",
    name: "Schild",
    category: "security",
    icon: "shield",
    color: "#EF4444",
    width: 50,
    height: 60,
    svgPath: `
      <path d="M25 5 L45 12 L45 30 Q45 50 25 58 Q5 50 5 30 L5 12 Z" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
      <path d="M18 30 L23 35 L35 23" stroke="currentColor" stroke-width="3" fill="none"/>
    `,
    label: "Security",
  },
  {
    id: "key",
    name: "Schlüssel",
    category: "security",
    icon: "key",
    color: "#F59E0B",
    width: 60,
    height: 30,
    svgPath: `
      <circle cx="15" cy="15" r="10" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <circle cx="15" cy="15" r="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1"/>
      <rect x="23" y="12" width="32" height="6" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <rect x="45" y="18" width="6" height="8" fill="currentColor"/>
      <rect x="38" y="18" width="4" height="6" fill="currentColor"/>
    `,
    label: "Key",
  },
  {
    id: "certificate",
    name: "Zertifikat",
    category: "security",
    icon: "certificate",
    color: "#22C55E",
    width: 50,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="40" height="50" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="15" x2="38" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="22" x2="38" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
      <line x1="12" y1="28" x2="30" y2="28" stroke="currentColor" stroke-width="1.5" opacity="0.6"/>
      <circle cx="25" cy="43" r="8" fill="#22C55E" opacity="0.5" stroke="#22C55E" stroke-width="2"/>
      <path d="M21 43 L24 46 L30 40" stroke="#22C55E" stroke-width="2" fill="none"/>
    `,
    label: "Cert",
  },

  // ========== PFEILE & VERBINDUNGEN ==========
  {
    id: "arrow-right",
    name: "Pfeil rechts",
    category: "arrows",
    icon: "arrowright",
    color: "#64748B",
    width: 80,
    height: 30,
    svgPath: `
      <line x1="5" y1="15" x2="65" y2="15" stroke="currentColor" stroke-width="3"/>
      <polygon points="60,5 75,15 60,25" fill="currentColor"/>
    `,
  },
  {
    id: "arrow-bidirectional",
    name: "Bidirektional",
    category: "arrows",
    icon: "arrowboth",
    color: "#64748B",
    width: 80,
    height: 30,
    svgPath: `
      <line x1="20" y1="15" x2="60" y2="15" stroke="currentColor" stroke-width="3"/>
      <polygon points="20,5 5,15 20,25" fill="currentColor"/>
      <polygon points="60,5 75,15 60,25" fill="currentColor"/>
    `,
  },
  {
    id: "connector-curved",
    name: "Gebogene Verbindung",
    category: "arrows",
    icon: "connectorcurved",
    color: "#64748B",
    width: 80,
    height: 50,
    svgPath: `
      <path d="M5 10 Q40 10 40 25 Q40 40 75 40" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="5" cy="10" r="4" fill="currentColor"/>
      <circle cx="75" cy="40" r="4" fill="currentColor"/>
    `,
  },
  {
    id: "dataflow",
    name: "Datenfluss",
    category: "arrows",
    icon: "dataflow",
    color: "#3B82F6",
    width: 80,
    height: 30,
    svgPath: `
      <line x1="5" y1="15" x2="65" y2="15" stroke="currentColor" stroke-width="2" stroke-dasharray="8 4"/>
      <polygon points="60,8 75,15 60,22" fill="currentColor"/>
      <circle cx="20" cy="15" r="3" fill="currentColor"/>
      <circle cx="40" cy="15" r="3" fill="currentColor"/>
    `,
  },

  // ========== DIAGRAMME ==========
  {
    id: "process",
    name: "Prozess",
    category: "diagrams",
    icon: "process",
    color: "#8B5CF6",
    width: 80,
    height: 50,
    svgPath: `
      <rect x="5" y="5" width="70" height="40" rx="5" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
    `,
    label: "Prozess",
  },
  {
    id: "decision",
    name: "Entscheidung",
    category: "diagrams",
    icon: "decision",
    color: "#F59E0B",
    width: 60,
    height: 60,
    svgPath: `
      <polygon points="30,5 55,30 30,55 5,30" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
    `,
    label: "?",
  },
  {
    id: "startend",
    name: "Start/Ende",
    category: "diagrams",
    icon: "startend",
    color: "#22C55E",
    width: 70,
    height: 40,
    svgPath: `
      <rect x="5" y="5" width="60" height="30" rx="15" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
    `,
    label: "Start",
  },
  {
    id: "document",
    name: "Dokument",
    category: "diagrams",
    icon: "document",
    color: "#64748B",
    width: 60,
    height: 60,
    svgPath: `
      <path d="M5 5 L55 5 L55 48 Q30 38 5 48 Z" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="15" x2="48" y2="15" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <line x1="12" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <line x1="12" y1="29" x2="40" y2="29" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    `,
    label: "Doc",
  },
  {
    id: "comment",
    name: "Kommentar",
    category: "diagrams",
    icon: "comment",
    color: "#F59E0B",
    width: 80,
    height: 50,
    svgPath: `
      <path d="M5 5 L75 5 L75 35 L25 35 L15 45 L15 35 L5 35 Z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="14" x2="68" y2="14" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <line x1="12" y1="22" x2="60" y2="22" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
    `,
  },

  // ========== AZURE ==========
  {
    id: "azure-vm",
    name: "Azure VM",
    category: "azure",
    icon: "azurevm",
    color: "#0078D4",
    width: 60,
    height: 55,
    svgPath: `
      <rect x="5" y="5" width="50" height="45" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="40" height="25" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="22" y="38" width="16" height="3" fill="currentColor"/>
      <rect x="18" y="43" width="24" height="4" rx="1" fill="currentColor" opacity="0.5"/>
      <text x="30" y="26" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">VM</text>
    `,
    label: "Azure VM",
  },
  {
    id: "azure-storage",
    name: "Azure Storage",
    category: "azure",
    icon: "azurestorage",
    color: "#0078D4",
    width: 60,
    height: 50,
    svgPath: `
      <rect x="5" y="5" width="50" height="40" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="10" width="14" height="12" rx="2" fill="currentColor" opacity="0.5"/>
      <rect x="26" y="10" width="14" height="12" rx="2" fill="currentColor" opacity="0.5"/>
      <rect x="42" y="10" width="10" height="12" rx="2" fill="currentColor" opacity="0.5"/>
      <rect x="10" y="26" width="42" height="14" rx="2" fill="currentColor" opacity="0.5"/>
    `,
    label: "Storage",
  },
  {
    id: "azure-function",
    name: "Azure Function",
    category: "azure",
    icon: "azurefunction",
    color: "#0078D4",
    width: 55,
    height: 55,
    svgPath: `
      <polygon points="27.5,5 50,16 50,44 27.5,55 5,44 5,16" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <path d="M20 20 L35 30 L20 40" stroke="currentColor" stroke-width="3" fill="none"/>
    `,
    label: "Function",
  },

  // ========== AZURE (Zusätzlich) ==========
  {
    id: "azure-vnet",
    name: "Azure VNet",
    category: "azure",
    icon: "azurevnet",
    color: "#0078D4",
    width: 120,
    height: 80,
    svgPath: `
      <rect x="3" y="3" width="114" height="74" rx="6" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="2"/>
      <rect x="8" y="8" width="104" height="18" rx="3" fill="currentColor" opacity="0.2"/>
      <text x="60" y="21" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">VNet</text>
      <rect x="12" y="32" width="45" height="22" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1"/>
      <text x="34" y="46" text-anchor="middle" fill="currentColor" font-size="7">Subnet</text>
      <rect x="63" y="32" width="45" height="22" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1"/>
      <text x="85" y="46" text-anchor="middle" fill="currentColor" font-size="7">Subnet</text>
      <rect x="12" y="58" width="96" height="14" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="60" y="68" text-anchor="middle" fill="currentColor" font-size="7">NSG</text>
    `,
    label: "Azure VNet",
  },
  {
    id: "azure-nsg",
    name: "Azure NSG",
    category: "azure",
    icon: "azurensg",
    color: "#0078D4",
    width: 55,
    height: 55,
    svgPath: `
      <path d="M27.5 5 L50 16 L50 44 L27.5 55 L5 44 L5 16 Z" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <path d="M20 25 L27.5 20 L35 25 L27.5 30 Z" fill="currentColor" opacity="0.5"/>
      <line x1="17" y1="35" x2="38" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="17" y1="40" x2="38" y2="40" stroke="currentColor" stroke-width="1.5"/>
    `,
    label: "NSG",
  },
  {
    id: "azure-app-service",
    name: "Azure App Service",
    category: "azure",
    icon: "azureappservice",
    color: "#0078D4",
    width: 60,
    height: 55,
    svgPath: `
      <rect x="5" y="5" width="50" height="45" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="22" r="10" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M25 22 L30 18 L35 22 L30 26 Z" fill="currentColor"/>
      <text x="30" y="45" text-anchor="middle" fill="currentColor" font-size="7" font-weight="bold">App Svc</text>
    `,
    label: "App Service",
  },
  {
    id: "azure-sql",
    name: "Azure SQL",
    category: "azure",
    icon: "azuresql",
    color: "#0078D4",
    width: 60,
    height: 65,
    svgPath: `
      <ellipse cx="30" cy="15" rx="22" ry="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <path d="M8 15 L8 48 Q8 56 30 56 Q52 56 52 48 L52 15" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="30" cy="48" rx="22" ry="8" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <text x="30" y="35" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">SQL</text>
    `,
    label: "Azure SQL",
  },
  {
    id: "azure-aks",
    name: "Azure AKS",
    category: "azure",
    icon: "azureaks",
    color: "#326CE5",
    width: 60,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="50" height="50" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <polygon points="30,12 48,24 48,40 30,52 12,40 12,24" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="30" cy="32" r="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1"/>
      <text x="30" y="36" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">AKS</text>
    `,
    label: "AKS",
  },

  // ========== AWS ==========
  {
    id: "aws-ec2",
    name: "AWS EC2",
    category: "aws",
    icon: "awsec2",
    color: "#FF9900",
    width: 60,
    height: 60,
    svgPath: `
      <rect x="5" y="5" width="50" height="50" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="12" y="12" width="36" height="36" rx="2" fill="currentColor" opacity="0.3"/>
      <text x="30" y="35" text-anchor="middle" fill="currentColor" font-size="11" font-weight="bold">EC2</text>
    `,
    label: "EC2",
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    category: "aws",
    icon: "awss3",
    color: "#569A31",
    width: 60,
    height: 50,
    svgPath: `
      <ellipse cx="30" cy="12" rx="25" ry="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <path d="M5 12 L5 38 Q5 46 30 46 Q55 46 55 38 L55 12" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="30" cy="38" rx="25" ry="8" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <text x="30" y="30" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">S3</text>
    `,
    label: "S3",
  },
  {
    id: "aws-lambda",
    name: "AWS Lambda",
    category: "aws",
    icon: "awslambda",
    color: "#FF9900",
    width: 55,
    height: 55,
    svgPath: `
      <polygon points="27.5,5 50,30 27.5,55 5,30" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <text x="27.5" y="35" text-anchor="middle" fill="currentColor" font-size="12" font-weight="bold">λ</text>
    `,
    label: "Lambda",
  },

  // ========== AWS (Zusätzlich) ==========
  {
    id: "aws-vpc",
    name: "AWS VPC",
    category: "aws",
    icon: "awsvpc",
    color: "#FF9900",
    width: 120,
    height: 80,
    svgPath: `
      <rect x="3" y="3" width="114" height="74" rx="6" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="2"/>
      <rect x="8" y="8" width="104" height="18" rx="3" fill="currentColor" opacity="0.2"/>
      <text x="60" y="21" text-anchor="middle" fill="currentColor" font-size="10" font-weight="bold">VPC</text>
      <rect x="12" y="32" width="45" height="22" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1"/>
      <text x="34" y="46" text-anchor="middle" fill="currentColor" font-size="7">Subnet</text>
      <rect x="63" y="32" width="45" height="22" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1"/>
      <text x="85" y="46" text-anchor="middle" fill="currentColor" font-size="7">Subnet</text>
    `,
    label: "AWS VPC",
  },
  {
    id: "aws-rds",
    name: "AWS RDS",
    category: "aws",
    icon: "awsrds",
    color: "#3B48CC",
    width: 60,
    height: 65,
    svgPath: `
      <ellipse cx="30" cy="15" rx="22" ry="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <path d="M8 15 L8 48 Q8 56 30 56 Q52 56 52 48 L52 15" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="30" cy="48" rx="22" ry="8" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <text x="30" y="35" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">RDS</text>
    `,
    label: "RDS",
  },
  {
    id: "aws-cloudfront",
    name: "AWS CloudFront",
    category: "aws",
    icon: "awscf",
    color: "#8B5CF6",
    width: 60,
    height: 60,
    svgPath: `
      <circle cx="30" cy="30" r="25" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="30" r="12" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.5"/>
      <path d="M30 5 L30 18" stroke="currentColor" stroke-width="2"/>
      <path d="M30 42 L30 55" stroke="currentColor" stroke-width="2"/>
      <path d="M5 30 L18 30" stroke="currentColor" stroke-width="2"/>
      <path d="M42 30 L55 30" stroke="currentColor" stroke-width="2"/>
      <text x="30" y="34" text-anchor="middle" fill="currentColor" font-size="6" font-weight="bold">CDN</text>
    `,
    label: "CloudFront",
  },
  {
    id: "aws-route53",
    name: "AWS Route 53",
    category: "aws",
    icon: "awsroute53",
    color: "#8B5CF6",
    width: 55,
    height: 55,
    svgPath: `
      <polygon points="27.5,5 50,16 50,44 27.5,55 5,44 5,16" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <text x="27.5" y="28" text-anchor="middle" fill="currentColor" font-size="7" font-weight="bold">Route</text>
      <text x="27.5" y="40" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">53</text>
    `,
    label: "Route 53",
  },

  // ========== INFRASTRUKTUR ==========
  {
    id: "availability-zone",
    name: "Availability Zone",
    category: "infrastructure",
    icon: "az",
    color: "#0EA5E9",
    width: 120,
    height: 80,
    svgPath: `
      <rect x="3" y="3" width="114" height="74" rx="6" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2" stroke-dasharray="4,2"/>
      <rect x="8" y="8" width="104" height="20" rx="3" fill="currentColor" opacity="0.2"/>
      <text x="60" y="22" text-anchor="middle" fill="currentColor" font-size="11" font-weight="bold">AZ</text>
      <line x1="15" y1="40" x2="105" y2="40" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <rect x="15" y="50" width="25" height="20" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/>
      <rect x="47" y="50" width="25" height="20" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/>
      <rect x="80" y="50" width="25" height="20" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/>
    `,
    label: "Availability Zone",
  },
  {
    id: "region",
    name: "Region",
    category: "infrastructure",
    icon: "region",
    color: "#22C55E",
    width: 140,
    height: 100,
    svgPath: `
      <rect x="3" y="3" width="134" height="94" rx="8" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="2"/>
      <rect x="8" y="8" width="124" height="22" rx="4" fill="currentColor" opacity="0.15"/>
      <text x="70" y="23" text-anchor="middle" fill="currentColor" font-size="12" font-weight="bold">REGION</text>
      <circle cx="20" cy="18" r="6" fill="currentColor" opacity="0.3"/>
      <rect x="15" y="40" width="50" height="50" rx="4" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="40" y="68" text-anchor="middle" fill="currentColor" font-size="8">AZ-a</text>
      <rect x="75" y="40" width="50" height="50" rx="4" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="100" y="68" text-anchor="middle" fill="currentColor" font-size="8">AZ-b</text>
    `,
    label: "Region",
  },
  {
    id: "edge-location",
    name: "Edge Location",
    category: "infrastructure",
    icon: "edge",
    color: "#F59E0B",
    width: 70,
    height: 70,
    svgPath: `
      <polygon points="35,5 65,25 55,65 15,65 5,25" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <circle cx="35" cy="35" r="15" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="35" cy="35" r="6" fill="currentColor"/>
      <line x1="35" y1="5" x2="35" y2="20" stroke="currentColor" stroke-width="2"/>
      <line x1="65" y1="25" x2="50" y2="30" stroke="currentColor" stroke-width="2"/>
      <line x1="5" y1="25" x2="20" y2="30" stroke="currentColor" stroke-width="2"/>
    `,
    label: "Edge Location",
  },
  {
    id: "backbone",
    name: "Backbone",
    category: "infrastructure",
    icon: "backbone",
    color: "#8B5CF6",
    width: 160,
    height: 40,
    svgPath: `
      <rect x="3" y="12" width="154" height="16" rx="8" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="25" cy="20" r="8" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="2"/>
      <circle cx="55" cy="20" r="8" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="2"/>
      <circle cx="85" cy="20" r="8" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="2"/>
      <circle cx="115" cy="20" r="8" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="2"/>
      <circle cx="140" cy="20" r="8" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="2"/>
      <line x1="33" y1="20" x2="47" y2="20" stroke="currentColor" stroke-width="3"/>
      <line x1="63" y1="20" x2="77" y2="20" stroke="currentColor" stroke-width="3"/>
      <line x1="93" y1="20" x2="107" y2="20" stroke="currentColor" stroke-width="3"/>
      <line x1="123" y1="20" x2="132" y2="20" stroke="currentColor" stroke-width="3"/>
    `,
    label: "Backbone",
  },
  {
    id: "global-peering",
    name: "Global Peering",
    category: "infrastructure",
    icon: "peering",
    color: "#EC4899",
    width: 80,
    height: 80,
    svgPath: `
      <circle cx="40" cy="40" r="35" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="40" cy="40" rx="35" ry="15" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <ellipse cx="40" cy="40" rx="15" ry="35" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <circle cx="40" cy="10" r="5" fill="currentColor"/>
      <circle cx="40" cy="70" r="5" fill="currentColor"/>
      <circle cx="10" cy="40" r="5" fill="currentColor"/>
      <circle cx="70" cy="40" r="5" fill="currentColor"/>
      <line x1="15" y1="40" x2="65" y2="40" stroke="currentColor" stroke-width="2" stroke-dasharray="3,2"/>
      <line x1="40" y1="15" x2="40" y2="65" stroke="currentColor" stroke-width="2" stroke-dasharray="3,2"/>
    `,
    label: "Global Peering",
  },
  {
    id: "vpc",
    name: "VPC",
    category: "infrastructure",
    icon: "vpc",
    color: "#6366F1",
    width: 130,
    height: 90,
    svgPath: `
      <rect x="3" y="3" width="124" height="84" rx="6" fill="currentColor" opacity="0.08" stroke="currentColor" stroke-width="2"/>
      <rect x="8" y="8" width="114" height="18" rx="3" fill="currentColor" opacity="0.2"/>
      <text x="65" y="21" text-anchor="middle" fill="currentColor" font-size="11" font-weight="bold">VPC</text>
      <rect x="12" y="32" width="45" height="25" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1"/>
      <text x="34" y="48" text-anchor="middle" fill="currentColor" font-size="7">Subnet A</text>
      <rect x="73" y="32" width="45" height="25" rx="3" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1"/>
      <text x="95" y="48" text-anchor="middle" fill="currentColor" font-size="7">Subnet B</text>
      <rect x="12" y="62" width="106" height="20" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="65" y="75" text-anchor="middle" fill="currentColor" font-size="7">Route Table</text>
    `,
    label: "VPC",
  },
  {
    id: "internet-gateway",
    name: "Internet Gateway",
    category: "infrastructure",
    icon: "igw",
    color: "#0EA5E9",
    width: 60,
    height: 70,
    svgPath: `
      <rect x="10" y="25" width="40" height="40" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <circle cx="30" cy="10" r="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <line x1="30" y1="18" x2="30" y2="25" stroke="currentColor" stroke-width="2"/>
      <path d="M20 40 L30 35 L40 40" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M20 50 L30 45 L40 50" stroke="currentColor" stroke-width="2" fill="none"/>
      <line x1="30" y1="55" x2="30" y2="65" stroke="currentColor" stroke-width="2"/>
      <path d="M25 62 L30 68 L35 62" stroke="currentColor" stroke-width="2" fill="none"/>
    `,
    label: "IGW",
  },
  {
    id: "nat-gateway",
    name: "NAT Gateway",
    category: "infrastructure",
    icon: "nat",
    color: "#10B981",
    width: 60,
    height: 60,
    svgPath: `
      <rect x="10" y="10" width="40" height="40" rx="4" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <text x="30" y="35" text-anchor="middle" fill="currentColor" font-size="11" font-weight="bold">NAT</text>
      <line x1="5" y1="30" x2="10" y2="30" stroke="currentColor" stroke-width="2"/>
      <line x1="50" y1="30" x2="55" y2="30" stroke="currentColor" stroke-width="2"/>
      <path d="M2 27 L5 30 L2 33" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M58 27 L55 30 L58 33" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(180, 56.5, 30)"/>
    `,
    label: "NAT Gateway",
  },
  {
    id: "direct-connect",
    name: "Direct Connect",
    category: "infrastructure",
    icon: "directconnect",
    color: "#F97316",
    width: 80,
    height: 50,
    svgPath: `
      <rect x="5" y="10" width="25" height="30" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="50" y="10" width="25" height="30" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <line x1="30" y1="20" x2="50" y2="20" stroke="currentColor" stroke-width="3"/>
      <line x1="30" y1="30" x2="50" y2="30" stroke="currentColor" stroke-width="3"/>
      <circle cx="40" cy="25" r="8" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <text x="40" y="29" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">DX</text>
    `,
    label: "Direct Connect",
  },
  {
    id: "cdn-pop",
    name: "CDN PoP",
    category: "infrastructure",
    icon: "cdn",
    color: "#F59E0B",
    width: 70,
    height: 60,
    svgPath: `
      <circle cx="35" cy="25" r="20" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <circle cx="35" cy="25" r="10" fill="currentColor" opacity="0.3"/>
      <line x1="35" y1="5" x2="35" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="55" y1="25" x2="45" y2="25" stroke="currentColor" stroke-width="2"/>
      <line x1="35" y1="45" x2="35" y2="35" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="25" x2="25" y2="25" stroke="currentColor" stroke-width="2"/>
      <text x="35" y="55" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">PoP</text>
    `,
    label: "CDN PoP",
  },
  {
    id: "transit-gateway",
    name: "Transit Gateway",
    category: "infrastructure",
    icon: "tgw",
    color: "#8B5CF6",
    width: 80,
    height: 80,
    svgPath: `
      <circle cx="40" cy="40" r="25" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="2"/>
      <text x="40" y="44" text-anchor="middle" fill="currentColor" font-size="9" font-weight="bold">TGW</text>
      <line x1="40" y1="5" x2="40" y2="15" stroke="currentColor" stroke-width="2"/>
      <line x1="40" y1="65" x2="40" y2="75" stroke="currentColor" stroke-width="2"/>
      <line x1="5" y1="40" x2="15" y2="40" stroke="currentColor" stroke-width="2"/>
      <line x1="65" y1="40" x2="75" y2="40" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="15" x2="22" y2="22" stroke="currentColor" stroke-width="2"/>
      <line x1="58" y1="58" x2="65" y2="65" stroke="currentColor" stroke-width="2"/>
      <line x1="65" y1="15" x2="58" y2="22" stroke="currentColor" stroke-width="2"/>
      <line x1="15" y1="65" x2="22" y2="58" stroke="currentColor" stroke-width="2"/>
    `,
    label: "Transit Gateway",
  },
  {
    id: "data-center",
    name: "Data Center",
    category: "infrastructure",
    icon: "datacenter",
    color: "#475569",
    width: 90,
    height: 70,
    svgPath: `
      <rect x="5" y="10" width="80" height="55" rx="4" fill="currentColor" opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <rect x="10" y="15" width="70" height="12" fill="currentColor" opacity="0.2"/>
      <rect x="10" y="30" width="70" height="12" fill="currentColor" opacity="0.2"/>
      <rect x="10" y="45" width="70" height="12" fill="currentColor" opacity="0.2"/>
      <circle cx="72" cy="21" r="3" fill="#22C55E"/>
      <circle cx="72" cy="36" r="3" fill="#22C55E"/>
      <circle cx="72" cy="51" r="3" fill="#F59E0B"/>
      <line x1="15" y1="21" x2="60" y2="21" stroke="currentColor" stroke-width="1"/>
      <line x1="15" y1="36" x2="60" y2="36" stroke="currentColor" stroke-width="1"/>
      <line x1="15" y1="51" x2="60" y2="51" stroke="currentColor" stroke-width="1"/>
    `,
    label: "Data Center",
  },
  {
    id: "vpn-connection",
    name: "VPN Connection",
    category: "infrastructure",
    icon: "vpn",
    color: "#0EA5E9",
    width: 100,
    height: 40,
    svgPath: `
      <rect x="5" y="10" width="25" height="20" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <rect x="70" y="10" width="25" height="20" rx="3" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="2"/>
      <line x1="30" y1="20" x2="70" y2="20" stroke="currentColor" stroke-width="2" stroke-dasharray="5,3"/>
      <ellipse cx="50" cy="20" rx="12" ry="8" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1"/>
      <text x="50" y="24" text-anchor="middle" fill="currentColor" font-size="8" font-weight="bold">VPN</text>
    `,
    label: "VPN",
  },
  {
    id: "private-link",
    name: "Private Link",
    category: "infrastructure",
    icon: "privatelink",
    color: "#6366F1",
    width: 80,
    height: 35,
    svgPath: `
      <rect x="5" y="8" width="70" height="20" rx="10" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="2"/>
      <circle cx="20" cy="18" r="6" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="1"/>
      <circle cx="60" cy="18" r="6" fill="currentColor" opacity="0.4" stroke="currentColor" stroke-width="1"/>
      <line x1="26" y1="18" x2="54" y2="18" stroke="currentColor" stroke-width="2"/>
      <path d="M35 14 L40 18 L35 22" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M45 14 L40 18 L45 22" stroke="currentColor" stroke-width="2" fill="none"/>
    `,
    label: "Private Link",
  },
];

// Helper-Funktion um Shapes nach Kategorie zu gruppieren
export function getShapesByCategory(): Record<
  ShapeCategory,
  ShapeDefinition[]
> {
  const grouped: Record<ShapeCategory, ShapeDefinition[]> = {
    network: [],
    cloud: [],
    server: [],
    storage: [],
    security: [],
    containers: [],
    arrows: [],
    diagrams: [],
    azure: [],
    aws: [],
    infrastructure: [],
  };

  IT_SHAPES.forEach((shape) => {
    grouped[shape.category].push(shape);
  });

  return grouped;
}

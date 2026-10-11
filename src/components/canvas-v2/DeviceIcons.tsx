import React from "react";
import { DeviceType } from "@/types/topology";

interface DeviceIconProps {
  type: DeviceType;
  size?: number;
  className?: string;
  status?: "active" | "warning" | "error" | "inactive" | "disabled";
}

/**
 * Handgezeichnete, mathematisch präzise Cisco-Style Netzwerk-Icons im SVG-Vektorformat.
 * Alle Linien nutzen vector-effect="non-scaling-stroke", damit sie bei Zoom
 * auf allen Pixeldichten messerscharf und exakt gleich dick bleiben.
 */
export const DeviceIcon: React.FC<DeviceIconProps> = ({
  type,
  size = 48,
  className = "",
  status = "active",
}) => {
  const statusColor =
    status === "error"
      ? "#EF4444"
      : status === "warning"
        ? "#F59E0B"
        : status === "disabled" || status === "inactive"
          ? "#64748B"
          : undefined;

  switch (type) {
    case "router":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Cisco Router"
        >
          {/* 3D-Zylinder Gehäuse */}
          <ellipse
            cx="32"
            cy="46"
            rx="26"
            ry="11"
            fill={statusColor || "#0284C7"}
            opacity="0.85"
          />
          <path
            d="M6 18 C6 29 58 29 58 18 L58 46 C58 57 6 57 6 46 Z"
            fill={statusColor || "#0369A1"}
          />
          <ellipse
            cx="32"
            cy="18"
            rx="26"
            ry="11"
            fill={statusColor || "#0EA5E9"}
            stroke="#BAE6FD"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Cisco 4-Wege-Pfeile (2 rein, 2 raus) */}
          <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
            {/* Pfeil links nach innen */}
            <path d="M14 18 L24 18 M20 15 L24 18 L20 21" />
            {/* Pfeil rechts nach aussen */}
            <path d="M28 18 L48 18 M44 15 L48 18 L44 21" />
            {/* Pfeil oben nach unten (innen) */}
            <path d="M32 11 L32 15 M29 13 L32 16 L35 13" />
            {/* Pfeil unten nach aussen */}
            <path d="M32 21 L32 25 M29 23 L32 26 L35 23" />
          </g>
        </svg>
      );

    case "switch-l2":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Cisco Layer 2 Switch"
        >
          {/* Quader Gehäuse */}
          <rect
            x="6"
            y="20"
            width="52"
            height="24"
            rx="4"
            fill={statusColor || "#1D4ED8"}
            stroke="#93C5FD"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Frontpanel Vertiefung */}
          <rect x="10" y="24" width="44" height="16" rx="2" fill="#1E3A8A" opacity="0.6" />
          {/* Zwei gegenläufige Pfeile (oben rechts, unten links) */}
          <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
            {/* Oberer Pfeil: nach rechts */}
            <path d="M16 29 L46 29 M41 26 L46 29 L41 32" />
            {/* Unterer Pfeil: nach links */}
            <path d="M46 35 L16 35 M21 32 L16 35 L21 38" />
          </g>
        </svg>
      );

    case "switch-l3":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Cisco Layer 3 Switch (Multilayer)"
        >
          {/* Quader Gehäuse */}
          <rect
            x="6"
            y="18"
            width="52"
            height="28"
            rx="4"
            fill={statusColor || "#4338CA"}
            stroke="#C7D2FE"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* 4 radiale Routing-Pfeile im Kreuz */}
          <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
            <path d="M20 32 L44 32 M39 28 L44 32 L39 36" />
            <path d="M44 32 L20 32 M25 28 L20 32 L25 36" />
            <path d="M32 23 L32 41 M28 27 L32 23 L36 27" />
            <path d="M32 23 L32 41 M28 37 L32 41 L36 37" />
          </g>
          {/* L3 Kennzeichnung Badge */}
          <rect x="42" y="14" width="16" height="10" rx="3" fill="#312E81" stroke="#A5B4FC" strokeWidth="1" />
          <text x="45" y="22" fill="#E0E7FF" fontSize="7" fontWeight="bold" fontFamily="'IBM Plex Mono', monospace">L3</text>
        </svg>
      );

    case "firewall":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Cisco Firewall / ASA / FTD"
        >
          {/* Backsteinmauer-Körper */}
          <rect
            x="8"
            y="14"
            width="48"
            height="36"
            rx="3"
            fill={statusColor || "#DC2626"}
            stroke="#FCA5A5"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Ziegelstein-Linien */}
          <g stroke="#7F1D1D" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
            {/* Horizontale Fugen */}
            <line x1="8" y1="23" x2="56" y2="23" />
            <line x1="8" y1="32" x2="56" y2="32" />
            <line x1="8" y1="41" x2="56" y2="41" />
            {/* Reihe 1 vertikale Fugen */}
            <line x1="20" y1="14" x2="20" y2="23" />
            <line x1="36" y1="14" x2="36" y2="23" />
            <line x1="50" y1="14" x2="50" y2="23" />
            {/* Reihe 2 versetzte Fugen */}
            <line x1="14" y1="23" x2="14" y2="32" />
            <line x1="28" y1="23" x2="28" y2="32" />
            <line x1="44" y1="23" x2="44" y2="32" />
            {/* Reihe 3 vertikale Fugen */}
            <line x1="22" y1="32" x2="22" y2="41" />
            <line x1="38" y1="32" x2="38" y2="41" />
            {/* Reihe 4 versetzte Fugen */}
            <line x1="16" y1="41" x2="16" y2="50" />
            <line x1="32" y1="41" x2="32" y2="50" />
            <line x1="48" y1="41" x2="48" y2="50" />
          </g>
          {/* Flammen- / Schild-Symbol */}
          <path
            d="M32 20 C32 20 38 25 38 31 C38 35 35 38 32 38 C29 38 26 35 26 31 C26 27 30 24 32 20 Z"
            fill="#FEF08A"
            opacity="0.9"
          />
        </svg>
      );

    case "access-point":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Wireless Access Point"
        >
          {/* AP Sockel */}
          <ellipse cx="32" cy="46" rx="20" ry="8" fill={statusColor || "#0D9488"} />
          <path d="M12 42 L32 26 L52 42" stroke={statusColor || "#14B8A6"} strokeWidth="2" fill="none" />
          {/* Antennen-Mast */}
          <line x1="32" y1="26" x2="32" y2="16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="32" cy="15" r="2.5" fill="#FACC15" />
          {/* Funkwellen */}
          <path
            d="M24 11 C28 8 36 8 40 11"
            stroke="#2DD4BF"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M19 7 C26 3 38 3 45 7"
            stroke="#2DD4BF"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );

    case "wlc":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Wireless LAN Controller"
        >
          {/* Controller Chassis */}
          <rect
            x="8"
            y="20"
            width="48"
            height="26"
            rx="4"
            fill={statusColor || "#6D28D9"}
            stroke="#DDD6FE"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <rect x="12" y="24" width="40" height="18" rx="2" fill="#4C1D95" opacity="0.6" />
          {/* Frontpanel LEDs & WLAN-Knoten */}
          <circle cx="18" cy="33" r="2.5" fill="#34D399" />
          <circle cx="26" cy="33" r="2.5" fill="#38BDF8" />
          {/* WLC Schriftzug */}
          <text x="33" y="36" fill="#F5F3FF" fontSize="9" fontWeight="bold" fontFamily="'IBM Plex Mono', monospace">
            WLC
          </text>
        </svg>
      );

    case "server":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Server"
        >
          {/* Rackmount Einschub 1 */}
          <rect
            x="10"
            y="12"
            width="44"
            height="11"
            rx="2"
            fill={statusColor || "#334155"}
            stroke="#94A3B8"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="16" cy="17.5" r="1.5" fill="#22C55E" />
          <line x1="22" y1="17.5" x2="48" y2="17.5" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Rackmount Einschub 2 */}
          <rect
            x="10"
            y="26"
            width="44"
            height="11"
            rx="2"
            fill={statusColor || "#334155"}
            stroke="#94A3B8"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="16" cy="31.5" r="1.5" fill="#22C55E" />
          <line x1="22" y1="31.5" x2="48" y2="31.5" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Rackmount Einschub 3 */}
          <rect
            x="10"
            y="40"
            width="44"
            height="11"
            rx="2"
            fill={statusColor || "#334155"}
            stroke="#94A3B8"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="16" cy="45.5" r="1.5" fill="#38BDF8" />
          <line x1="22" y1="45.5" x2="48" y2="45.5" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 2" />
        </svg>
      );

    case "pc":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="PC / Workstation"
        >
          {/* Monitor Gehäuse */}
          <rect
            x="10"
            y="12"
            width="44"
            height="28"
            rx="3"
            fill={statusColor || "#1E293B"}
            stroke="#60A5FA"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Bildschirm Display */}
          <rect x="14" y="15" width="36" height="20" rx="1.5" fill="#0F172A" />
          <path d="M17 20 L23 20 M17 24 L27 24 M17 28 L21 28" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
          {/* Standfuß */}
          <path d="M30 40 L34 40 L36 47 L28 47 Z" fill="#475569" />
          <rect x="22" y="47" width="20" height="3" rx="1.5" fill="#64748B" />
          {/* Tastatur Silhouette */}
          <rect x="14" y="52" width="36" height="4" rx="1" fill="#334155" />
        </svg>
      );

    case "laptop":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Laptop Client (WLAN & Ethernet)"
        >
          {/* Display Deckel */}
          <rect
            x="14"
            y="14"
            width="36"
            height="26"
            rx="3"
            fill={statusColor || "#1E293B"}
            stroke="#38BDF8"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          {/* Display Screen */}
          <rect x="17" y="17" width="30" height="19" rx="1.5" fill="#0F172A" />
          {/* Wi-Fi Funkwellen-Indikator auf Bildschirm */}
          <path
            d="M32 23 C29 23 27 25 25 27 M32 26 C30 26 29 27 28 28 M32 30 A1 1 0 1 1 31.99 30"
            stroke="#38BDF8"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* Webcam */}
          <circle cx="32" cy="15.5" r="0.8" fill="#94A3B8" />
          {/* Scharnier */}
          <rect x="26" y="39.5" width="12" height="2" rx="0.5" fill="#64748B" />
          {/* Basis Gehäuse / Tastaturdeckel */}
          <path
            d="M8 43 L12 40 L52 40 L56 43 L54 49 C54 50.5 52.5 51 51 51 L13 51 C11.5 51 10 50.5 10 49 Z"
            fill={statusColor || "#334155"}
            stroke="#60A5FA"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          {/* Tastaturfeld */}
          <polygon points="15,42 49,42 48,46 16,46" fill="#1E293B" />
          {/* Trackpad */}
          <rect x="27" y="47" width="10" height="3" rx="0.8" fill="#475569" />
        </svg>
      );

    case "cloud":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          role="img"
          aria-label="Cloud WAN / Internet"
        >
          {/* Wolkenumriss */}
          <path
            d="M18 42 C12 42 8 37 8 32 C8 27 12 23 17 23 C18 17 24 13 31 13 C38 13 44 18 46 24 C51 24 56 28 56 33 C56 38 52 42 46 42 Z"
            fill={statusColor || "#0284C7"}
            opacity="0.85"
            stroke="#7DD3FC"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
          {/* WAN Schriftzug */}
          <text x="23" y="32" fill="#F0F9FF" fontSize="10" fontWeight="bold" fontFamily="'IBM Plex Mono', monospace">
            WAN
          </text>
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill="#64748B" />
        </svg>
      );
  }
};

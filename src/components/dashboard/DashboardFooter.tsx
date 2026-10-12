import React from "react";
import { ShieldCheck } from "@phosphor-icons/react";

export function DashboardFooter() {
  return (
    <footer className="mt-8 pt-6 pb-12 border-t border-border/80 text-muted-foreground text-xs font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <p className="leading-relaxed">
            <strong>Rechtlicher Hinweis:</strong> Cisco®, CCNA®, Cisco IOS® und Cisco DNA Center® sind eingetragene Marken oder Warenzeichen von Cisco Systems, Inc. in den USA und anderen Ländern. Diese unabhängige Lernplattform steht in keiner geschäftlichen oder offiziellen Verbindung zu Cisco Systems und dient ausschließlich der beruflichen Aus- und Weiterbildung (FISI, IT-Ausbildung, Fachinformatiker).
          </p>
          <p className="text-[11px] text-muted-foreground/80 font-mono">
            CCNA 200-301 v1.1 Blueprint-Ausrichtung • 1.055 Fragen • 81 Drag-and-Drop Aufgaben • Offline-fähig
          </p>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground shrink-0 self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4 text-primary" weight="bold" />
          <span>CCNA 200-301 Edition</span>
        </div>
      </div>
    </footer>
  );
}


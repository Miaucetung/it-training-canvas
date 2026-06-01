import { Button } from "@/components/ui/button";
import {
  CaretRight,
  CheckCircle,
  Lightning,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "it-canvas:onboarding:v1:dismissed";

interface Step {
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
  hint?: string;
}

const STEPS: Step[] = [
  {
    icon: <SquaresFour size={28} className="text-indigo-400" weight="fill" />,
    title: "Willkommen im IT-Training-Canvas",
    body: (
      <>
        <p>
          Hier baust und verstehst du Netzwerke <b>visuell</b>: Vorlagen laden,
          Geräte verbinden, Konfiguration ausprobieren, Pakete in Bewegung
          sehen.
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Diese kurze Tour zeigt dir die wichtigsten 3 Funktionen.
        </p>
      </>
    ),
  },
  {
    icon: (
      <Lightning size={28} className="text-cyan-400" weight="fill" />
    ),
    title: '"Ping testen" — geführte Analyse',
    body: (
      <>
        <p>
          Oben in der Topbar findest du den <b>„Ping testen"</b>-Button.
        </p>
        <p className="text-slate-300 text-sm mt-2">
          Wähle Quelle und Ziel — die App führt dich <b>Hop für Hop</b> durch
          das Paket: VLAN-Checks, Routing, Fehler werden mit klarer Erklärung
          angezeigt. Bei Misserfolg stoppt sie genau an der defekten Stelle.
        </p>
      </>
    ),
    hint: "Cyan-farbener Button oben in der Mitte der Topbar.",
  },
  {
    icon: (
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/30 text-cyan-200 text-xs font-bold">
        Simple ↔ Detail
      </div>
    ),
    title: "Anzeige aufgeräumt halten",
    body: (
      <>
        <p>
          Oben rechts kannst du zwischen <b>Simple</b> und <b>Detail</b>{" "}
          umschalten.
        </p>
        <p className="text-slate-300 text-sm mt-2">
          <b>Simple</b> blendet alle Verbindungs-Labels aus — perfekt für
          Übersicht und Topologie-Erklärung. <b>Detail</b> zeigt alle
          Port-Bezeichnungen, VLANs und Befehls-Hinweise.
        </p>
      </>
    ),
    hint: "Cyan-farbener Toggle oben rechts im Canvas.",
  },
  {
    icon: (
      <CheckCircle size={28} className="text-emerald-400" weight="fill" />
    ),
    title: "Los geht's",
    body: (
      <>
        <p>
          Tipp: Öffne <b>Vorlagen</b> in der Topbar und lade z. B.{" "}
          <i>„VLAN + Trunk + Router-on-a-Stick"</i> — dann probier einen Ping
          aus.
        </p>
        <p className="text-slate-400 text-sm mt-3">
          Du kannst diese Tour jederzeit über{" "}
          <code className="px-1 py-0.5 rounded bg-slate-700/50">?</code> oder{" "}
          <b>Tastatur-Kürzel</b> erneut starten.
        </p>
      </>
    ),
  },
];

interface OnboardingTourProps {
  /** Force open (e.g. from a help button). */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingTour({ forceOpen, onClose }: OnboardingTourProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIdx(0);
      setOpen(true);
      return;
    }
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setOpen(true);
    } catch {
      /* localStorage unavailable — skip */
    }
  }, [forceOpen]);

  const close = (dismissPermanent: boolean) => {
    setOpen(false);
    if (dismissPermanent) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    onClose?.();
  };

  if (!open) return null;
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6">
        <button
          onClick={() => close(true)}
          aria-label="Tour schließen"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          {step.icon}
          <h2 className="text-lg font-bold text-white">{step.title}</h2>
        </div>

        <div className="text-slate-200 leading-relaxed space-y-2">
          {step.body}
        </div>

        {step.hint && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
            💡 {step.hint}
          </div>
        )}

        {/* Progress dots */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx
                  ? "w-6 bg-cyan-400"
                  : i < idx
                    ? "w-1.5 bg-cyan-400/50"
                    : "w-1.5 bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => close(true)}
            className="text-slate-400 hover:text-white"
          >
            Überspringen
          </Button>
          <div className="flex items-center gap-2">
            {idx > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIdx((i) => i - 1)}
                className="border-slate-700 bg-slate-800 text-slate-200"
              >
                Zurück
              </Button>
            )}
            {isLast ? (
              <Button
                onClick={() => close(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Loslegen
              </Button>
            ) : (
              <Button
                onClick={() => setIdx((i) => i + 1)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Weiter <CaretRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

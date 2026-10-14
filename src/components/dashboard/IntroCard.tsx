import { useState } from "react";
import { X } from "@phosphor-icons/react";

export const INTRO_DISMISSED_KEY = "ccna-dashboard-intro-v1-dismissed";

/**
 * Prüfungsangaben ausschließlich aus offiziellen Cisco-Quellen (abgerufen am 2026-10-14):
 * - Prüfungsseite: https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/exams-and-training.html
 *   (120 Minuten, Version v1.1, Bewertung bestanden/nicht bestanden; Fragenzahl und Bestehensgrenze nennt Cisco dort nicht)
 * - Prüfungsthemen v1.1 (PDF): https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf
 *   (sechs Bereiche mit 20/20/25/10/15/10 %)
 */
export const CISCO_EXAM_PAGE = "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/exams-and-training.html";
export const CISCO_EXAM_TOPICS_PDF = "https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf";
export const CISCO_FACTS_DATE = "14.10.2026";

export function isIntroDismissed(): boolean {
  try {
    return window.localStorage.getItem(INTRO_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismissed(): void {
  try {
    window.localStorage.setItem(INTRO_DISMISSED_KEY, "1");
  } catch {
    // ignorieren
  }
}

interface IntroCardProps {
  /** Karte sichtbar (beim ersten Besuch oder über „?“) */
  open: boolean;
  onClose: () => void;
}

/** Schlichte Einführung („So funktioniert die App“), schließbar und über „?“ wieder aufrufbar. Keine Tour, kein Overlay. */
export function IntroCard({ open, onClose }: IntroCardProps) {
  const [examOpen, setExamOpen] = useState(false);
  if (!open) return null;
  return (
    <section aria-label="So funktioniert die App" className="rounded-xl border border-border bg-surface-elevated p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-foreground font-sans">So funktioniert die App</h2>
        <button
          type="button"
          onClick={() => {
            persistDismissed();
            onClose();
          }}
          aria-label="Einführung schließen"
          className="p-1 rounded text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ol className="mt-2 space-y-1.5 text-sm text-foreground list-decimal list-inside">
        <li>
          <strong>Verstehen:</strong> Jeder Schritt beginnt mit einer Lektion.
        </li>
        <li>
          <strong>Üben:</strong> Danach prüfst du dich mit Übungsfragen.
        </li>
        <li>
          <strong>Anwenden:</strong> Zum Schluss baust du das Thema in einem Lab oder Simulator nach.
        </li>
      </ol>
      <p className="mt-2 text-sm text-muted-foreground">Den nächsten Schritt zeigt dir die Karte „Nächster Schritt“. Über das „?“ oben rufst du diese Hilfe wieder auf.</p>

      <div className="mt-3">
        <button
          type="button"
          aria-expanded={examOpen}
          onClick={() => setExamOpen((v) => !v)}
          className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Was ist die CCNA und wie ist die Prüfung aufgebaut?
        </button>
        {examOpen && (
          <div className="mt-2 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
            <p>
              Die <strong className="text-foreground">CCNA</strong> (Cisco Certified Network Associate) ist eine Netzwerk-Zertifizierung von Cisco. Geprüft wird in der Prüfung <strong className="text-foreground">200-301</strong> (aktuell Version 1.1); sie dauert
              120 Minuten. Cisco wertet mit bestanden oder nicht bestanden.
            </p>
            <p>
              Die Prüfung hat sechs Bereiche: Network Fundamentals (20 %), Network Access (20 %), IP Connectivity (25 %), IP Services (10 %), Security Fundamentals (15 %) sowie Automation and Programmability (10 %).
            </p>
            <p>Zur Zahl der Fragen und zur Bestehensgrenze veröffentlicht Cisco keine Angaben.</p>
            <p className="text-xs">
              Quelle: Cisco, abgerufen am {CISCO_FACTS_DATE}:{" "}
              <a href={CISCO_EXAM_PAGE} target="_blank" rel="noreferrer" className="text-primary underline">
                Prüfungsseite
              </a>
              ,{" "}
              <a href={CISCO_EXAM_TOPICS_PDF} target="_blank" rel="noreferrer" className="text-primary underline">
                Prüfungsthemen v1.1 (PDF)
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

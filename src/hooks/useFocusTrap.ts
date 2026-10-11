import { useEffect, useRef } from "react";

/**
 * useFocusTrap: WCAG 2.1 AA konformes Fokus-Management für Modaldialoge.
 * - Fängt den Tastatur-Fokus innerhalb des Dialog-Containers (Cycle Tab / Shift+Tab)
 * - Schließt den Dialog bei Escape
 * - Setzt den Fokus beim Schließen exakt auf das auslösende Element zurück (Return-Focus)
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose: () => void
) {
  const containerRef = useRef<T | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Speichere das vorher im Dokument aktive Element (Return-Focus Ziel)
    if (typeof document !== "undefined" && document.activeElement) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
    }

    // 2. Fokussiere nach Mount das erste interaktive Element im Dialog
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = Array.from(focusables).find(
          (el) => !el.hasAttribute("disabled") && (el.offsetParent !== null || el.tagName === "INPUT")
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 30);

    // 3. Tab-Falle (Focus Trap) & Escape-Handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(
          (el) => !el.hasAttribute("disabled") && (el.offsetParent !== null || el.tagName === "INPUT")
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === containerRef.current) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      // 4. Return-Focus auf das zuvor fokussierte Element
      if (
        previouslyFocusedRef.current &&
        typeof previouslyFocusedRef.current.focus === "function"
      ) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}

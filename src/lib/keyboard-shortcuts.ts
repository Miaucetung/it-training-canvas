const EDITABLE_ROLES = ["textbox", "combobox", "searchbox", "spinbutton", "listbox", "slider"]
  .map((r) => `[role="${r}"]`)
  .join(", ");
const MODAL_SELECTOR = '[aria-modal="true"], [role="alertdialog"]';

/** Fokus liegt in einem Element, in dem Tasten Text oder Werte bearbeiten. */
export function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return typeof el.closest === "function" && el.closest(EDITABLE_ROLES) !== null;
}

/** Ist irgendwo ein modaler Dialog geöffnet? */
export function isModalOpen(): boolean {
  return typeof document !== "undefined" && document.querySelector(MODAL_SELECTOR) !== null;
}

/**
 * Einzeltasten-Kürzel (z. B. "P") dürfen nur auslösen, wenn:
 * - keine Strg/Cmd/Alt-Kombination (Strg+P = Drucken bleibt dem Browser),
 * - der Fokus nicht in einem Eingabeelement, Select oder Textfeld-Widget liegt,
 * - kein modaler Dialog offen ist (außer das Kürzel gehört zu diesem Dialog: allowInModal).
 */
export function shouldIgnoreSingleKeyShortcut(
  e: KeyboardEvent,
  options: { allowInModal?: boolean } = {}
): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true;
  if (isEditableTarget(e.target)) return true;
  if (!options.allowInModal && isModalOpen()) return true;
  return false;
}

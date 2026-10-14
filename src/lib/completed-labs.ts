import { useCallback, useEffect, useState } from "react";

/** Erledigte Labs (Speicher des Lab-Dialogs, Nutzer markieren sie dort selbst). */
export const COMPLETED_LABS_KEY = "ccna-completed-labs-v1";
export const COMPLETED_LABS_EVENT = "ccna-completed-labs-changed";

export function loadCompletedLabs(): Set<string> {
  try {
    const raw = window.localStorage.getItem(COMPLETED_LABS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** Reaktiv: gleicher Tab per Ereignis (vom Lab-Dialog), andere Tabs per storage-Ereignis. */
export function useCompletedLabs(): Set<string> {
  const [labs, setLabs] = useState<Set<string>>(() => loadCompletedLabs());
  const refresh = useCallback(() => setLabs(loadCompletedLabs()), []);
  useEffect(() => {
    window.addEventListener(COMPLETED_LABS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(COMPLETED_LABS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return labs;
}

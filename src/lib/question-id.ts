/** Ergebnis-IDs der Prüfungsvorbereitung tragen den Sitzungsindex ("q0123#4"); gespeichert wird nur die Basis-ID. */
export function toBaseQuestionId(id: string): string {
  const i = id.indexOf("#");
  return i === -1 ? id : id.slice(0, i);
}

/** Liest eine gespeicherte ID-Liste; Einträge mit "#idx" werden auf die Basis-ID zurückgeführt, Fremdes verworfen. */
export function normalizeStoredQuestionIds(raw: unknown): Set<string> {
  const out = new Set<string>();
  if (!Array.isArray(raw)) return out;
  for (const v of raw) {
    if (typeof v !== "string") continue;
    const base = toBaseQuestionId(v);
    if (base) out.add(base);
  }
  return out;
}

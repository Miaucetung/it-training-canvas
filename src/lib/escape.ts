const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeXml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => XML_ENTITIES[c]);
}

export function escapeHtml(value: unknown): string {
  return escapeXml(value);
}

/** Erlaubt nur Zahlen in numerischen SVG-Attributen. */
export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Erlaubt nur gängige CSS-Farbwerte (hex, rgb[a], hsl[a], Namen) in Attributen. */
export function safeColor(value: unknown, fallback = "#000000"): string {
  const s = String(value ?? "").trim();
  return /^(#[0-9a-fA-F]{3,8}|(rgb|hsl)a?\([0-9.,%\s/]+\)|[a-zA-Z]{1,30})$/.test(s) ? s : fallback;
}

const FORBIDDEN_SVG_TAGS = ["script", "foreignobject", "iframe", "object", "embed", "style", "animate", "set"];

/**
 * Bereinigt ein SVG-Fragment (innerer Teil eines <svg>): entfernt Skripte, Event-Handler
 * und javascript:-URIs. Gibt bei nicht parsbarem Markup einen leeren String zurück.
 */
export function sanitizeSvgFragment(fragment: string): string {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${fragment}</svg>`,
    "image/svg+xml",
  );
  if (doc.getElementsByTagName("parsererror").length > 0) return "";
  const root = doc.documentElement;
  root.querySelectorAll("*").forEach((el) => {
    if (FORBIDDEN_SVG_TAGS.includes(el.localName.toLowerCase())) {
      el.remove();
      return;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || value.startsWith("javascript:") || value.startsWith("data:text/html")) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return new XMLSerializer()
    .serializeToString(root)
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "");
}

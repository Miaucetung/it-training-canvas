// Aufruf: node scripts/audit/contrast-fix-candidates.mjs
// Sucht für Farbpaare unter 4,5 : 1 die kleinste Verschiebung (Abdunkeln Richtung Schwarz, in 1-%-Schritten).
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const lum = ([r, g, b]) => {
  const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const darken = (rgb, t) => rgb.map((v) => v * (1 - t));

function search(label, color, against) {
  const base = hex(color);
  const bgs = against.map(hex);
  for (let t = 0; t <= 0.6; t += 0.01) {
    const c = darken(base, t);
    if (bgs.every((bg) => ratio(c, bg) >= 4.5)) {
      console.log(
        `${label}: ${color} -> ${toHex(c)} (${Math.round(t * 100)} % dunkler); ` +
          bgs.map((bg, i) => `${against[i]}: ${ratio(base, bg).toFixed(2)} -> ${ratio(c, bg).toFixed(2)}`).join(", ")
      );
      return;
    }
  }
  console.log(label, "keine Lösung");
}

search("light success-solid (weiß darauf)", "#059669", ["#FFFFFF"]);
search("light warning-solid (weiß darauf)", "#D97706", ["#FFFFFF"]);
search("light blocking-solid (weiß darauf)", "#EA580C", ["#FFFFFF"]);
search("light text-muted auf app-bg + surface-elevated", "#64748B", ["#F3F4F6", "#E9EDF2"]);
search("light text-muted nur app-bg", "#64748B", ["#F3F4F6"]);

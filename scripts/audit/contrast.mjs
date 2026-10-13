// Aufruf: node scripts/audit/contrast.mjs
// Liest Tokens aus src/index.css (:root = light, .dark = dark), berechnet WCAG-2.x-Kontraste neu
// und vergleicht sie mit den Werten der Tabelle in docs/redesign-konzept.md.
import { readFileSync } from "node:fs";

const css = readFileSync("src/index.css", "utf8");
const doc = readFileSync("docs/redesign-konzept.md", "utf8");

function block(selector) {
  const start = css.indexOf(selector + " {");
  let depth = 0, i = css.indexOf("{", start), j = i;
  for (; j < css.length; j++) { if (css[j] === "{") depth++; if (css[j] === "}" && --depth === 0) break; }
  return css.slice(i + 1, j);
}
const parse = (b) => Object.fromEntries([...b.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().replace(/\s*\/\*.*$/, "")]));
const light = parse(block(":root"));
const dark = { ...light, ...parse(block(".dark"))};

const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map((c) => c + c).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
function resolve(map, v, depth = 0) { const m = /^var\(--([\w-]+)\)$/.exec(v); return m && depth < 5 ? resolve(map, map[m[1]], depth + 1) : v; }
function rgbOf(map, v, under) {
  v = resolve(map, v);
  const m = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(v);
  if (m) { const a = m[4] === undefined ? 1 : +m[4]; const u = under ?? [255, 255, 255]; return [0, 1, 2].map((k) => Math.round(a * +m[k + 1] + (1 - a) * u[k])); }
  return hex(v);
}
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// 1) Doc-Tabelle gegen Neuberechnung
const rows = [...doc.matchAll(/^\|\s*\*\*(Light|Dark)\s+`--([\w-]+)`\*\*\s*\|\s*`(#[0-9A-Fa-f]{6})`\s*\|\s*`--([\w-]+)`\s*\(`(#[0-9A-Fa-f]{6})`\)\s*\|\s*\*\*([\d,]+)\s*:\s*1\*\*/gm)];
let bad = 0, hexBad = 0;
console.log(`# 1) Doc-Tabelle: ${rows.length} Zeilen geparst\n`);
console.log("| Modus | Vordergrund | Hintergrund | Doc | berechnet | Δ | Token-Hex = CSS? |\n|---|---|---|---|---|---|---|");
for (const [, mode, fg, fgHex, bg, bgHex, claimed] of rows) {
  const map = mode === "Light" ? light : dark;
  const calc = ratio(hex(fgHex), hex(bgHex));
  const cl = parseFloat(claimed.replace(",", "."));
  const d = calc - cl;
  const cssFg = map[fg] && rgbOf(map, map[fg]).join(), cssBg = map[bg] && rgbOf(map, map[bg]).join();
  const hexOk = cssFg === hex(fgHex).join() && cssBg === hex(bgHex).join();
  if (!hexOk) hexBad++;
  if (Math.abs(d) > 0.05) bad++;
  if (Math.abs(d) > 0.05 || !hexOk) console.log(`| ${mode} | ${fg} ${fgHex} | ${bg} ${bgHex} | ${cl.toFixed(2)} | ${calc.toFixed(2)} | ${d >= 0 ? "+" : ""}${d.toFixed(2)} | ${hexOk ? "ja" : "NEIN (CSS: " + map[fg] + " / " + map[bg] + ")"} |`);
}
console.log(`\nAbweichung > 0,05: ${bad} von ${rows.length}; Hex im Doc ≠ CSS: ${hexBad}\n`);

// 2) Alle Text/Hintergrund-Kombinationen aus den Tokens (beide Themes)
console.log("# 2) Tokenpaare mit Kontrast unter Soll\n");
const textTokens = ["text-primary", "text-secondary", "text-muted", "accent-primary-fg", "status-success-fg", "status-warning-fg", "status-error-fg", "status-trunk-fg", "status-blocking-fg", "terminal-muted"];
const bgTokens = ["app-bg", "surface", "surface-elevated", "surface-sunken", "status-success-bg", "status-warning-bg", "status-error-bg", "status-trunk-bg", "status-blocking-bg"];
console.log("| Modus | Text | Hintergrund | Kontrast | Soll 4,5 |\n|---|---|---|---|---|");
for (const [name, map] of [["Light", light], ["Dark", dark]]) {
  const base = rgbOf(map, map["surface"]);
  for (const t of textTokens) for (const b of bgTokens) {
    if (!map[t] || !map[b]) continue;
    const bgc = rgbOf(map, map[b], base);
    const c = ratio(rgbOf(map, map[t], bgc), bgc);
    if (c < 4.5) console.log(`| ${name} | ${t} ${map[t]} | ${b} ${map[b]} | ${c.toFixed(2)} | ${c < 3 ? "UNTER 3,0" : "unter 4,5"} |`);
  }
}
console.log("\n# 3) on-*-solid auf *-solid (Buttons/Badges, Soll 4,5)\n");
console.log("| Modus | Paar | Kontrast |\n|---|---|---|");
for (const [name, map] of [["Light", light], ["Dark", dark]]) {
  for (const k of Object.keys(map).filter((k) => k.endsWith("-solid") && !k.startsWith("on-"))) {
    const on = map["on-" + k]; if (!on) continue;
    const c = ratio(rgbOf(map, on), rgbOf(map, map[k]));
    console.log(`| ${name} | on-${k} ${on} auf ${map[k]} | ${c.toFixed(2)}${c < 4.5 ? "  ← UNTER 4,5" : ""} |`);
  }
  const pf = ratio(rgbOf(map, map["primary-foreground"]), rgbOf(map, map["primary"]));
  console.log(`| ${name} | primary-foreground ${map["primary-foreground"]} auf primary ${resolve(map, map["primary"])} | ${pf.toFixed(2)}${pf < 4.5 ? "  ← UNTER 4,5" : ""} |`);
  const df = ratio(rgbOf(map, map["destructive-foreground"]), rgbOf(map, map["destructive"]));
  console.log(`| ${name} | destructive-foreground auf destructive ${resolve(map, map["destructive"])} | ${df.toFixed(2)}${df < 4.5 ? "  ← UNTER 4,5" : ""} |`);
}

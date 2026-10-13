import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("Keine Anfragen an externe Schrift-Server (B-10)", () => {
  const files = [
    ...walk(resolve(root, "public/embeds")).filter((f) => /\.(html|css)$/.test(f)),
    resolve(root, "index.html"),
    ...walk(resolve(root, "src")).filter((f) => f.endsWith(".css")),
  ];

  it("keine Google-Fonts-Hosts in HTML/CSS", () => {
    const offenders = files.filter((f) => /fonts\.(googleapis|gstatic)\.com/.test(readFileSync(f, "utf8")));
    expect(offenders.map((f) => f.replace(root, ""))).toEqual([]);
  });

  it("Slide-Embeds laden die lokale fonts.css, und alle referenzierten Schriftdateien existieren", () => {
    const dir = resolve(root, "public/embeds/ccna-slides");
    const slides = readdirSync(dir).filter((f) => f.endsWith(".html"));
    expect(slides.length).toBeGreaterThanOrEqual(13);
    for (const s of slides) expect(readFileSync(join(dir, s), "utf8"), s).toContain('href="fonts/fonts.css"');
    const css = readFileSync(join(dir, "fonts/fonts.css"), "utf8");
    const urls = [...css.matchAll(/url\('\.\/([^']+)'\)/g)].map((m) => m[1]);
    expect(urls.length).toBe(7);
    for (const u of urls) expect(existsSync(join(dir, "fonts", u)), u).toBe(true);
  });
});

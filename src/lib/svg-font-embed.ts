import sans400 from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2?url";
import sans500 from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2?url";
import sans700 from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff2?url";
import mono400 from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url";
import mono700 from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-700-normal.woff2?url";

/**
 * Ein SVG, das als <img> gerendert wird (PNG-Export), sieht die Webfonts der Seite nicht.
 * Deshalb werden die benötigten Schnitte als data:-URI direkt im SVG eingebettet.
 */
const FACES: Array<{ family: string; weight: number; url: string }> = [
  { family: "IBM Plex Sans", weight: 400, url: sans400 },
  { family: "IBM Plex Sans", weight: 500, url: sans500 },
  { family: "IBM Plex Sans", weight: 700, url: sans700 },
  { family: "IBM Plex Mono", weight: 400, url: mono400 },
  { family: "IBM Plex Mono", weight: 700, url: mono700 },
];

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function buildFontFaceCss(faces: Array<{ family: string; weight: number; base64: string }>): string {
  return faces
    .map(
      (f) =>
        `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};src:url(data:font/woff2;base64,${f.base64}) format('woff2');}`
    )
    .join("");
}

let cache: Promise<string> | null = null;

/** CSS mit den eingebetteten IBM-Plex-Schnitten; leer, falls die Dateien nicht geladen werden können. */
export function getEmbeddedFontCss(): Promise<string> {
  if (!cache) {
    cache = (async () => {
      try {
        const faces = await Promise.all(
          FACES.map(async (f) => {
            const res = await fetch(f.url);
            if (!res.ok) throw new Error(`Schrift ${f.url}: HTTP ${res.status}`);
            return { family: f.family, weight: f.weight, base64: toBase64(await res.arrayBuffer()) };
          })
        );
        return buildFontFaceCss(faces);
      } catch {
        cache = null; // beim nächsten Export erneut versuchen
        return "";
      }
    })();
  }
  return cache;
}

/** Fügt die @font-face-Regeln direkt hinter dem öffnenden <svg>-Tag ein. */
export function injectFontCssIntoSvg(svg: string, css: string): string {
  if (!css) return svg;
  return svg.replace(/<svg\b[^>]*>/, (open) => `${open}<defs><style type="text/css">${css}</style></defs>`);
}

export async function embedFontsInSvg(svg: string): Promise<string> {
  return injectFontCssIntoSvg(svg, await getEmbeddedFontCss());
}

import { describe, it, expect, vi, afterEach } from "vitest";
import { buildFontFaceCss, getEmbeddedFontCss, injectFontCssIntoSvg } from "@/lib/svg-font-embed";

describe("Schrift-Einbettung für SVG→PNG (B-31)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("erzeugt @font-face mit data:-URI", () => {
    const css = buildFontFaceCss([{ family: "IBM Plex Sans", weight: 700, base64: "QUJD" }]);
    expect(css).toContain("font-family:'IBM Plex Sans'");
    expect(css).toContain("font-weight:700");
    expect(css).toContain("url(data:font/woff2;base64,QUJD)");
  });

  it("fügt das CSS direkt hinter dem öffnenden svg-Tag ein", () => {
    const svg = '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="10"><rect/></svg>';
    const out = injectFontCssIntoSvg(svg, "@font-face{}");
    expect(out).toContain('width="10"><defs><style type="text/css">@font-face{}</style></defs><rect/>');
    expect(injectFontCssIntoSvg(svg, "")).toBe(svg);
  });

  it("lädt alle Schnitte per fetch und kodiert sie base64", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new Uint8Array([65, 66, 67]).buffer }));
    vi.stubGlobal("fetch", fetchMock);
    const css = await getEmbeddedFontCss();
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(css.match(/@font-face/g)).toHaveLength(5);
    expect(css).toContain("QUJD");
    expect(css).toContain("IBM Plex Mono");
  });
});

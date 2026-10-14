// @vitest-environment node
import { describe, it, expect } from "vitest";
import { build } from "vite";
import type { OutputChunk, RollupOutput } from "rollup";

const HOOKS = ["__auditApp", "__quizDialogState", "__dragDropState", "__examPrepState", "__prioritizedLearningState", "__AUDIT_NO_SHUFFLE__"];

async function bundleText(auditFlag: string | undefined): Promise<string> {
  const prev = process.env.VITE_AUDIT_HOOKS;
  const prevNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  if (auditFlag === undefined) delete process.env.VITE_AUDIT_HOOKS;
  else process.env.VITE_AUDIT_HOOKS = auditFlag;
  try {
    const result = await build({
      mode: "production",
      logLevel: "silent",
      build: { write: false, minify: false, reportCompressedSize: false },
    });
    const outputs = (Array.isArray(result) ? result : [result]) as RollupOutput[];
    return outputs
      .flatMap((o) => o.output)
      .filter((o): o is OutputChunk => o.type === "chunk")
      .map((c) => c.code)
      .join("\n");
  } finally {
    process.env.NODE_ENV = prevNodeEnv;
    if (prev === undefined) delete process.env.VITE_AUDIT_HOOKS;
    else process.env.VITE_AUDIT_HOOKS = prev;
  }
}

describe("Audit-Hooks im Bundle", () => {
  it("Produktionsbuild enthält keinen der Hooks", async () => {
    const js = await bundleText(undefined);
    expect(js.length).toBeGreaterThan(100_000);
    for (const h of HOOKS) expect(js.includes(h), h).toBe(false);
  }, 300_000);

  it("Audit-Build mit VITE_AUDIT_HOOKS=1 enthält die Hooks", async () => {
    const js = await bundleText("1");
    for (const h of HOOKS.filter((x) => x !== "__AUDIT_NO_SHUFFLE__")) expect(js.includes(h), h).toBe(true);
  }, 300_000);
});

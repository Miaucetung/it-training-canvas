import { describe, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildSnapshot } from "../../src/__tests__/helpers/content-snapshot";

// Schreibt den Inhalts-Snapshot nur auf ausdrückliche Anforderung: `npm run snapshot:content:update`
// (setzt UPDATE_CONTENT_SNAPSHOT=1). Ohne diese Variable passiert nichts.
describe("Inhalts-Snapshot der Prüfungsfragen", () => {
  it("aktualisiert src/__tests__/fixtures/content-snapshot.json nur auf ausdrücklichen Aufruf", () => {
    if (process.env.UPDATE_CONTENT_SNAPSHOT !== "1") {
      console.log("Snapshot nicht aktualisiert (UPDATE_CONTENT_SNAPSHOT=1 fehlt). Aufruf: npm run snapshot:content:update");
      return;
    }
    const target = path.resolve("src/__tests__/fixtures/content-snapshot.json");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(buildSnapshot(), null, 1) + "\n", "utf8");
    const snap = buildSnapshot();
    console.log(`Snapshot geschrieben: ${Object.entries(snap.pools).map(([k, v]) => `${k} ${Object.keys(v).length}`).join(", ")}`);
  });
});

import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(".local/rendering_audit_results.json", "utf8"));
const overlaps = data.filter((f) => f.defectType.includes("4. Überlappung"));

console.log("Total overlap findings across all passes:", overlaps.length);

const pairs = new Map();
const qidSet = new Set();

for (const o of overlaps) {
  qidSet.add(o.qid);
  const m = o.metric.match(/Label "(.*)" überlappt mit "(.*)" \(Kollisionsfläche: (.*)px²\)/);
  if (m) {
    const key = [m[1], m[2]].sort().join(" <---> ");
    if (!pairs.has(key)) {
      pairs.set(key, { count: 0, sampleQid: o.qid, area: parseFloat(m[3]) });
    }
    pairs.get(key).count++;
  }
}

console.log(`Unique questions with overlap: ${qidSet.size}`);
console.log(`Unique overlapping label pairs: ${pairs.size}\n`);

// Sort by frequency
const sortedPairs = Array.from(pairs.entries()).sort((a, b) => b[1].count - a[1].count);

console.log("Top 25 most frequent collisions:");
sortedPairs.slice(0, 25).forEach(([pair, info], idx) => {
  console.log(`${idx + 1}. [${info.count}x] ${pair} (Sample: ${info.sampleQid}, Area: ${info.area}px²)`);
});

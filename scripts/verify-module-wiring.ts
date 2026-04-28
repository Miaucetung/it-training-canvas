// Generic wiring verifier. Run: npx tsx scripts/verify-module-wiring.ts <moduleId>
import "../src/content/modules/ccna";
import "../src/content/modules/comptia-network-plus";
import { contentRegistry } from "../src/lib/content/content-registry";

const id = process.argv[2];
if (!id) {
  console.error("Usage: verify-module-wiring.ts <moduleId>");
  process.exit(2);
}
const m = contentRegistry.getModuleSync(id);
if (!m) {
  console.error(`FAIL: module ${id} not registered`);
  process.exit(1);
}

const conceptKeys = new Set(Object.keys(m.concepts));
const quizKeys = new Set(Object.keys(m.quizzes));
const exerciseKeys = new Set(Object.keys(m.exercises));
const topicKeys = new Set(m.topics.map((t) => t.id));
const errors: string[] = [];

for (const t of m.topics) {
  t.conceptIds.forEach((c) => !conceptKeys.has(c) && errors.push(`topic ${t.id}: missing concept ${c}`));
  t.quizIds.forEach((q) => !quizKeys.has(q) && errors.push(`topic ${t.id}: missing quiz ${q}`));
  t.exerciseIds.forEach((e) => !exerciseKeys.has(e) && errors.push(`topic ${t.id}: missing exercise ${e}`));
  (t.prerequisiteTopicIds ?? []).forEach((p) => !topicKeys.has(p) && errors.push(`topic ${t.id}: missing prerequisite ${p}`));
}
for (const ex of Object.values(m.exercises)) {
  ex.conceptIds.forEach((c) => !conceptKeys.has(c) && errors.push(`exercise ${ex.id}: missing concept ${c}`));
  if (ex.learningPathId && !Object.keys(m.learningPaths).includes(ex.learningPathId))
    errors.push(`exercise ${ex.id}: missing learning path ${ex.learningPathId}`);
}
for (const lp of Object.values(m.learningPaths)) {
  for (const step of lp.steps) {
    if (step.type === "quiz" && step.quizId && !quizKeys.has(step.quizId))
      errors.push(`learningPath ${lp.id} step ${step.id}: missing quiz ${step.quizId}`);
  }
}

console.log(`=== ${id} wiring ===`);
console.log(`Topics: ${m.topics.length}  Concepts: ${conceptKeys.size}  Quizzes: ${quizKeys.size}  Exercises: ${exerciseKeys.size}  LP steps: ${Object.values(m.learningPaths).reduce((n, lp) => n + lp.steps.length, 0)}`);
if (!errors.length) {
  console.log("OK All references resolve.");
  process.exit(0);
}
console.error("Wiring problems:");
errors.forEach((e) => console.error("  - " + e));
process.exit(1);

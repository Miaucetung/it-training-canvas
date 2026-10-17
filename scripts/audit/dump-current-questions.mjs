import fs from "node:fs";
import { ccnaQuestions } from "../../src/data/ccnaQuestions.ts";
fs.writeFileSync(".local/app_current.json", JSON.stringify({ ccnaQuestions: ccnaQuestions.map((q) => ({ id: q.id, question: q.question, options: q.options, correct: q.correct, exhibit: !!q.exhibit })) }));
console.log(ccnaQuestions.length);

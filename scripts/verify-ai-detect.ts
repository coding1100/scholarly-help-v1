/**
 * Standalone sanity check for the recalibrated AI detector heuristic.
 *
 * Run: npx ts-node scripts/verify-ai-detect.ts
 *
 * This is not a unit-test-framework test (the frontend has none); it's a fast,
 * dependency-free guard that the heuristic scores obvious-AI high and clean/humanized
 * text low, and that text which clears the humanizer's rules scores below 50.
 */
import { scoreHeuristic } from "../app/lib/server/ai/heuristic-detector";

const AI_TEXT =
  "Furthermore, the implementation of robust frameworks is pivotal to organizational success. " +
  "Moreover, it is important to note that leveraging cutting-edge solutions can foster transformative outcomes. " +
  "Additionally, these seamless integrations underscore the enduring value of innovation. " +
  "Consequently, organizations must navigate the intricate landscape of modern technology.";

const HUMANIZED_TEXT =
  "Companies that build solid frameworks tend to do better. Why? The tooling just works. " +
  "I have seen teams ship faster once they stop fighting their own stack, and that compounds over a year into something real. " +
  "New tech helps too. But only if it fits.";

const ACADEMIC_HUMAN =
  "The sample was drawn from three districts. We interviewed forty-two teachers over six weeks. " +
  "Responses varied. Some described the policy as helpful, while others felt it added paperwork without changing outcomes. " +
  "Our analysis groups these views into four themes, which the next section examines in detail.";

const cases: { name: string; text: string; expect: "high" | "low" }[] = [
  { name: "Obvious AI text", text: AI_TEXT, expect: "high" },
  { name: "Humanized text", text: HUMANIZED_TEXT, expect: "low" },
  { name: "Academic human text", text: ACADEMIC_HUMAN, expect: "low" },
];

let failures = 0;
for (const c of cases) {
  const r = scoreHeuristic(c.text);
  const ok = c.expect === "high" ? r.aiPercent >= 60 : r.aiPercent <= 45;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${c.name.padEnd(22)} -> ${r.aiPercent}% AI ` +
      `(expected ${c.expect}; conf ${r.confidence}; tells ${r.details.transitionCount}t/${r.details.contentTellCount}c; stddev ${r.details.sentenceStdDev.toFixed(1)})`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} case(s) failed.`);
  process.exit(1);
}
console.log("\nAll detector sanity checks passed.");

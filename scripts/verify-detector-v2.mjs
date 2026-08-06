import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const root = process.cwd();
const typesPath = "app/components/AiTools/AiDetectorTool/types.ts";
const sidebarPath = "app/components/AiTools/AiDetectorTool/ResultsSidebar.tsx";
const detectorToolPath =
  "app/components/AiTools/AiDetectorTool/AiDetectorTool.tsx";
const humanizerPath = "app/components/AiTools/HumanizerTool/HumanizerTool.tsx";

const [typesSource, sidebarSource, detectorToolSource, humanizerSource] =
  await Promise.all([
    readFile(`${root}/${typesPath}`, "utf8"),
    readFile(`${root}/${sidebarPath}`, "utf8"),
    readFile(`${root}/${detectorToolPath}`, "utf8"),
    readFile(`${root}/${humanizerPath}`, "utf8"),
  ]);

const compiled = ts.transpileModule(typesSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { exports: module.exports, module, Math });

const {
  detectorLikelihood,
  detectorHumanLikelihood,
  detectorContentShare,
  detectorHumanContentShare,
  detectorPrimaryScore,
  detectorDisagreement,
  FALLBACK_DETECTOR_CONFIG,
} = module.exports;

const base = {
  status: "success",
  verdict: {
    ai_percent: 97,
    human_percent: 3,
    band: [80, 100],
    confidence: 49,
    label: "ai",
  },
  breakdown: { ai: 0, mixed: 100, human: 0 },
  trust: {
    trustworthy: false,
    paraphrase_suspected: false,
    evasion_chars_found: false,
    reason: "Signals disagree.",
  },
  meta: {},
};

assert.equal(detectorLikelihood(base), 97);
assert.equal(detectorHumanLikelihood(base), 3);
assert.equal(detectorContentShare(base), 50);
assert.equal(detectorHumanContentShare(base), 50);
assert.equal(detectorPrimaryScore(base), 50);
assert.equal(detectorDisagreement(base), 47);

const v2 = {
  ...base,
  verdict: {
    ...base.verdict,
    ai_likelihood_percent: 91,
    human_likelihood_percent: 9,
    ai_content_share_percent: 34,
    human_content_share_percent: 66,
    primary_metric: "ai_content_share",
  },
  trust: { ...base.trust, disagreement_percent: 57 },
};
assert.equal(detectorLikelihood(v2), 91);
assert.equal(detectorHumanLikelihood(v2), 9);
assert.equal(detectorContentShare(v2), 34);
assert.equal(detectorHumanContentShare(v2), 66);
assert.equal(detectorPrimaryScore(v2), 34);
assert.equal(detectorDisagreement(v2), 57);

assert.deepEqual(
  {
    minimum_words: FALLBACK_DETECTOR_CONFIG.minimum_words,
    low_confidence_words: FALLBACK_DETECTOR_CONFIG.low_confidence_words,
    maximum_words: FALLBACK_DETECTOR_CONFIG.maximum_words,
    metric_version: FALLBACK_DETECTOR_CONFIG.metric_version,
  },
  {
    minimum_words: 100,
    low_confidence_words: 180,
    maximum_words: 1500,
    metric_version: "2.0",
  },
);

for (const source of [sidebarSource, humanizerSource]) {
  assert.match(source, /AI-like content detected/);
  assert.match(source, /This text reads as humanized/);
  assert.match(source, /Estimated composition/);
  assert.doesNotMatch(source, /Likely range/);
  assert.doesNotMatch(source, /Document likelihood and content share differ/);
  assert.doesNotMatch(source, /Short texts under/);
  assert.doesNotMatch(source, /% of this text appears to be AI-generated/);
}

for (const source of [sidebarSource, detectorToolSource]) {
  assert.doesNotMatch(source, /Auto-replace/i);
  assert.doesNotMatch(source, /autoReplacing/);
}
assert.doesNotMatch(detectorToolSource, /\/tools\/humanizer/);

console.log("Detector v2 frontend contract verified.");

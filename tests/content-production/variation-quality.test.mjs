// Variant-diversity checks for QuestionFamily variants — architect decision
// #6 (Phase 6C): text-similarity is a QUALITY SIGNAL / WARNING ONLY, never
// sole authoritative proof of meaningful variation. Human review remains
// authoritative for genuine scenario diversity, plausible distractors,
// preservation of invariant reasoning, appropriate difficulty, and
// explanation quality — see the Phase 6C Implementation Report's
// human-review table for that judgment. This file only blocks on
// STRUCTURAL duplication (identical stems, identical option-text sets),
// which the architect explicitly approved as a hard error, and otherwise
// only checks vocabulary membership / presence of declared variation axes.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, VARIATION_STRATEGY_VOCABULARY } from "./helpers/load-production.mjs";

const data = loadAll();

function variantsByFamily() {
  const map = new Map();
  for (const q of data.questions) {
    if (!q.family) continue;
    if (!map.has(q.family)) map.set(q.family, []);
    map.get(q.family).push(q);
  }
  return map;
}

test("no two variants within the same family share an identical stem (blocking)", () => {
  const bad = [];
  for (const [familyId, variants] of variantsByFamily()) {
    for (let i = 0; i < variants.length; i++) {
      for (let j = i + 1; j < variants.length; j++) {
        if (variants[i].prompt.trim() === variants[j].prompt.trim()) {
          bad.push(`${familyId}: ${variants[i].id} and ${variants[j].id} have identical stems`);
        }
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("no two variants within the same family share an identical option-text set (blocking)", () => {
  const bad = [];
  for (const [familyId, variants] of variantsByFamily()) {
    const optionSets = variants.map((q) => new Set(q.options.map((o) => o.text.trim().toLowerCase())));
    for (let i = 0; i < variants.length; i++) {
      for (let j = i + 1; j < variants.length; j++) {
        const [a, b] = [optionSets[i], optionSets[j]];
        const identical = a.size === b.size && [...a].every((text) => b.has(text));
        if (identical) bad.push(`${familyId}: ${variants[i].id} and ${variants[j].id} have identical option-text sets`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("every variant's variation_tags are non-empty and drawn from the fixed vocabulary (axis:value form)", () => {
  const bad = [];
  for (const q of data.questions) {
    if (!q.family) continue;
    if (!q.variation_tags || q.variation_tags.length === 0) {
      bad.push(`${q.id} has no variation_tags`);
      continue;
    }
    for (const tag of q.variation_tags) {
      const [axis] = tag.split(":");
      if (!VARIATION_STRATEGY_VOCABULARY.includes(axis)) {
        bad.push(`${q.id} variation_tags includes "${tag}" — axis "${axis}" is not in the fixed vocabulary`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("each family's variants collectively exercise at least one variation axis the family itself declares", () => {
  const familyById = new Map(data.families.map((f) => [f.id, f]));
  const bad = [];
  for (const [familyId, variants] of variantsByFamily()) {
    const family = familyById.get(familyId);
    const axesUsed = new Set(variants.flatMap((q) => (q.variation_tags ?? []).map((t) => t.split(":")[0])));
    const overlap = family.variation_strategy.filter((axis) => axesUsed.has(axis));
    if (overlap.length === 0) bad.push(`${familyId}: no variant uses any axis from its declared variation_strategy`);
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("structural variation exists: within a family, no variant is a pure paraphrase (identical option KEYS-to-correctness mapping AND >90% stem word overlap)", () => {
  // Deliberately narrower than a general similarity gate — this only
  // catches the architect's explicit bad example ("Who should approve..."
  // vs "Who is responsible for approving...") stacked with an unchanged
  // answer key, not merely similar subject matter.
  function words(text) {
    return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  }
  function jaccard(a, b) {
    const intersection = [...a].filter((w) => b.has(w)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : intersection / union;
  }

  const bad = [];
  for (const [familyId, variants] of variantsByFamily()) {
    for (let i = 0; i < variants.length; i++) {
      for (let j = i + 1; j < variants.length; j++) {
        const [qa, qb] = [variants[i], variants[j]];
        const sameCorrectKey = qa.options.find((o) => o.correct)?.key === qb.options.find((o) => o.correct)?.key;
        const overlap = jaccard(words(qa.prompt), words(qb.prompt));
        if (sameCorrectKey && overlap > 0.9) {
          bad.push(`${familyId}: ${qa.id} and ${qb.id} look like a pure paraphrase (${Math.round(overlap * 100)}% stem word overlap)`);
        }
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

// --- Family-level answer-length bias ----------------------------------
// Phase 8B Domain 1 Final Readiness Audit found that two families
// (family.d1.governance-effectiveness and
// family.d1.organizational-culture-governance) had the correct option be
// the single longest option in 100% of their variants (3/3 and 4/4
// respectively) — an exploitable "pick the longest answer" shortcut that
// exists independently of the answer-position randomization architecture
// (app/src/content/answerOrder.ts only randomizes *display* position; it
// cannot mask a *semantic* length tell in the option text itself).
//
// This check is deliberately NOT "the correct answer may never be the
// longest option" — a legitimate, well-written correct answer is often
// genuinely longer than its distractors (it has to state a real position
// AND its qualifying condition), and forcing artificial length parity
// would just trade one artificial pattern for another. A single question,
// or even a couple of questions, having the correct option come out
// longest is ordinary variation: the whole-bank rate has consistently sat
// in the 40-55% range with individual families ranging 0%-67% (see the
// Phase 8B re-audit). What made governance-effectiveness and
// organizational-culture-governance a genuine defect was that EVERY
// variant in the family shared the property, with no exceptions — a
// perfect, memorizable tell scoped to that family. So this rule only
// fires on that specific shape: a family with enough variants to make
// "always" mean something (3+, matching every family in this bank) where
// the correct option is the strict longest in literally 100% of them.
function familyLengthBiasRatio(variants) {
  let longestCount = 0;
  for (const q of variants) {
    const lengths = q.options.map((o) => o.text.trim().length);
    const maxLength = Math.max(...lengths);
    const correctLength = q.options.find((o) => o.correct).text.trim().length;
    if (correctLength === maxLength) longestCount++;
  }
  return longestCount / variants.length;
}

test("no family (3+ variants) has the correct option as the longest option in 100% of variants (blocking)", () => {
  const bad = [];
  for (const [familyId, variants] of variantsByFamily()) {
    if (variants.length < 3) continue;
    const ratio = familyLengthBiasRatio(variants);
    if (ratio === 1) {
      bad.push(
        `${familyId}: correct option is the longest option in ${variants.length}/${variants.length} variants — systematic length tell, not ordinary variation`
      );
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

// Proof this rule would have caught the pre-Phase-8B-correction defect:
// reconstructs the exact pre-fix option-text lengths for the two affected
// families (governance-effectiveness 3/3, organizational-culture-governance
// 4/4, as measured during the Phase 8B audit) and confirms the same
// detector flags both. This is a fixed historical fixture, not live
// production data — it exists purely so the detection rule above can
// never regress into a no-op without this test failing first.
test("length-bias detector would have caught the pre-fix Phase 8B data (historical regression fixture)", () => {
  function fixtureQuestion(correctLength, otherLengths) {
    return {
      options: [
        { correct: true, text: "x".repeat(correctLength) },
        ...otherLengths.map((len) => ({ correct: false, text: "x".repeat(len) }))
      ]
    };
  }

  // governance-effectiveness pre-fix: question.d1.0022/0023/0024, correct
  // option was strictly longest in all 3 (168>148, 116>106, 194>135).
  const preFixGovernanceEffectiveness = [
    fixtureQuestion(168, [145, 148, 122]),
    fixtureQuestion(116, [106, 100, 105]),
    fixtureQuestion(194, [131, 129, 124])
  ];
  // organizational-culture-governance pre-fix: question.d1.0028/0029/
  // 0030/0035, correct option was strictly longest in all 4.
  const preFixOrganizationalCultureGovernance = [
    fixtureQuestion(175, [103, 88, 86]),
    fixtureQuestion(195, [69, 75, 108]),
    fixtureQuestion(201, [75, 119, 122]),
    fixtureQuestion(199, [88, 100, 78])
  ];

  assert.equal(familyLengthBiasRatio(preFixGovernanceEffectiveness), 1);
  assert.equal(familyLengthBiasRatio(preFixOrganizationalCultureGovernance), 1);

  // Sanity check the detector isn't just always true: mixed lengths where
  // the correct option is NOT always longest must not report a 100% ratio.
  const postFixMixedExample = [
    fixtureQuestion(168, [145, 148, 122]),
    fixtureQuestion(116, [106, 129, 105]), // correct is NOT longest here
    fixtureQuestion(194, [135, 129, 124])
  ];
  assert.notEqual(familyLengthBiasRatio(postFixMixedExample), 1);
});

// --- Non-blocking similarity signal -----------------------------------
// This check NEVER fails the suite. Per architect decision #6, a raw
// text-similarity score is informational only; it is printed for human
// reviewers, not treated as proof of (in)sufficient variation. Genuine
// scenario diversity, distractor plausibility, and reasoning preservation
// remain matters for human review (see the Phase 6C human-review table).
test("similarity signal (informational only, never blocking) — printed for human review", () => {
  function words(text) {
    return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  }
  function jaccard(a, b) {
    const intersection = [...a].filter((w) => b.has(w)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : intersection / union;
  }

  for (const [familyId, variants] of variantsByFamily()) {
    for (let i = 0; i < variants.length; i++) {
      for (let j = i + 1; j < variants.length; j++) {
        const overlap = jaccard(words(variants[i].prompt), words(variants[j].prompt));
        if (overlap > 0.5) {
          console.warn(
            `[similarity-signal, non-blocking] ${familyId}: ${variants[i].id} / ${variants[j].id} — ${Math.round(overlap * 100)}% stem word overlap; human review should confirm genuine scenario diversity`
          );
        }
      }
    }
  }
  assert.ok(true);
});

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

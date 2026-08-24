// QuestionFamily invariants — docs/data-model/SCHEMA-QUESTION-FAMILY.md and
// docs/data-model/REPETITION-AND-RECALL-MODEL.md. All blocking: a family
// or variant that fails these checks is a structural authoring defect, not
// a content-quality judgment call (those live in variation-quality.test.mjs
// and require human review — see that file's header).
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex, PRODUCTION_COLLECTIONS } from "./helpers/load-production.mjs";

const data = loadAll();
const index = buildIndex(data);

function resolves(id, expectedCollection) {
  const hits = index.get(id);
  return !!hits?.some((h) => h.collection === expectedCollection);
}

test("every family id is unique and matches family.<domain>.<slug>", () => {
  const seen = new Set();
  const dupes = [];
  for (const f of data.families) {
    if (!PRODUCTION_COLLECTIONS.families.pattern.test(f.id)) assert.fail(`malformed family id: ${f.id}`);
    if (seen.has(f.id)) dupes.push(f.id);
    seen.add(f.id);
  }
  assert.equal(dupes.length, 0, dupes.join(", "));
});

test("every family field reference resolves to a real entity", () => {
  const bad = [];
  for (const f of data.families) {
    if (!resolves(f.domain, "domains")) bad.push(`${f.id}.domain -> ${f.domain}`);
    for (const c of f.concepts) if (!resolves(c, "concepts")) bad.push(`${f.id}.concepts -> ${c}`);
    for (const p of f.patterns) if (!resolves(p, "patterns")) bad.push(`${f.id}.patterns -> ${p}`);
    for (const e of f.evidence_dimensions) if (!resolves(e, "evidenceDimensions")) bad.push(`${f.id}.evidence_dimensions -> ${e}`);
    if (f.role_target && !resolves(f.role_target, "roles")) bad.push(`${f.id}.role_target -> ${f.role_target}`);
    if (f.qualifier_target && !resolves(f.qualifier_target, "qualifiers")) bad.push(`${f.id}.qualifier_target -> ${f.qualifier_target}`);
    if (f.decision_type && !resolves(f.decision_type, "decisionTypes")) bad.push(`${f.id}.decision_type -> ${f.decision_type}`);
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("family lifecycle/stage_target are only set for domains with a canonical lifecycle (never Domain 1 or Foundation)", () => {
  const bad = data.families
    .filter((f) => (f.lifecycle || f.stage_target) && (f.domain === "domain.d1" || f.domain === "domain.foundation"))
    .map((f) => f.id);
  assert.equal(bad.length, 0, bad.join(", "));
});

test("Question.family, when set, resolves to a real family", () => {
  const bad = data.questions
    .filter((q) => q.family && !resolves(q.family, "families"))
    .map((q) => `${q.id} -> ${q.family}`);
  assert.equal(bad.length, 0, bad.join(", "));
});

const familyById = new Map(data.families.map((f) => [f.id, f]));

test("a variant's concepts are a subset of its family's declared concepts", () => {
  const bad = [];
  for (const q of data.questions) {
    if (!q.family) continue;
    const family = familyById.get(q.family);
    for (const c of q.concepts) {
      if (!family.concepts.includes(c)) bad.push(`${q.id}.concepts includes ${c}, not declared by ${family.id}`);
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("a variant's patterns are a subset of its family's declared patterns", () => {
  const bad = [];
  for (const q of data.questions) {
    if (!q.family) continue;
    const family = familyById.get(q.family);
    for (const p of q.patterns) {
      if (!family.patterns.includes(p)) bad.push(`${q.id}.patterns includes ${p}, not declared by ${family.id}`);
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("a variant's evidence_dimensions are a subset of its family's declared evidence_dimensions", () => {
  const bad = [];
  for (const q of data.questions) {
    if (!q.family) continue;
    const family = familyById.get(q.family);
    for (const e of q.evidence_dimensions) {
      if (!family.evidence_dimensions.includes(e)) bad.push(`${q.id}.evidence_dimensions includes ${e}, not declared by ${family.id}`);
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("every family has exactly its expected active variant count (Phase 6C + Phase 7B-1)", () => {
  const byFamily = new Map();
  for (const q of data.questions) {
    if (!q.family || !q.active) continue;
    if (!byFamily.has(q.family)) byFamily.set(q.family, []);
    byFamily.get(q.family).push(q.id);
  }
  const expected = {
    "family.foundation.qualifier-recognition": 3,
    "family.d1.authority-accountability-decision": 3,
    "family.d1.governance-vs-management": 3,
    "family.d1.governance-layer-authority": 4,
    "family.d1.data-ownership-accountability": 4,
    "family.d1.security-strategy-alignment": 3,
    "family.d1.business-justification-roadmap": 3,
    "family.d1.governance-effectiveness": 3,
    "family.d1.legal-regulatory-risk": 4,
    "family.d1.organizational-culture-governance": 4,
    "family.d1.policy-artifact-hierarchy": 3,
    "family.d2.risk-fundamentals": 3,
    "family.d2.risk-assessment-lifecycle": 3,
    "family.d2.risk-analysis-methods": 3,
    "family.d2.quantitative-risk-decisions": 3,
    "family.d2.risk-evaluation": 3,
    "family.d2.risk-treatment-response": 3,
    "family.d2.residual-risk-acceptability": 3,
    "family.d2.risk-control-ownership": 3
  };
  const bad = [];
  for (const [familyId, count] of Object.entries(expected)) {
    const actual = byFamily.get(familyId)?.length ?? 0;
    if (actual !== count) bad.push(`${familyId}: expected ${count}, got ${actual}`);
  }
  assert.equal(bad.length, 0, bad.join("\n"));

  // Also confirm no family in the loaded content is missing from this
  // expectation table (a new family authored without updating this test
  // would otherwise pass silently with zero variant-count coverage).
  const untracked = [...byFamily.keys()].filter((id) => !(id in expected));
  assert.equal(untracked.length, 0, `families with no expected-count coverage in this test: ${untracked.join(", ")}`);
});

// The reinforcement-ready floor is a REPORTED marker for CANDIDATE
// families, not a hard block — only a CANONICAL family is required to
// meet it. This test exercises that evaluation logic directly (not just
// asserting today's two families happen to meet it) using constructed
// in-test fixtures, so the distinction stays proven even if a future
// family is authored below the floor while still CANDIDATE.
function meetsFloor(family, variantCount) {
  return variantCount >= family.minimum_variant_count;
}

test("reinforcement-ready floor: a CANDIDATE family below its floor is reported (test passes), a CANONICAL family below its floor blocks", () => {
  const candidateBelowFloor = { id: "family.test.fixture", minimum_variant_count: 3, content_status: "CANDIDATE" };
  const canonicalBelowFloor = { id: "family.test.fixture2", minimum_variant_count: 3, content_status: "CANONICAL" };

  // CANDIDATE below floor: informational only, must not throw/fail here.
  assert.equal(meetsFloor(candidateBelowFloor, 1), false);

  // CANONICAL below floor IS a blocking condition — assert the check
  // correctly identifies it as a violation when content_status is CANONICAL.
  const canonicalViolation = canonicalBelowFloor.content_status === "CANONICAL" && !meetsFloor(canonicalBelowFloor, 1);
  assert.equal(canonicalViolation, true);

  // Real content: both actual families are CANDIDATE, so neither being
  // below the floor would block — but in fact both already meet it.
  for (const f of data.families) {
    const count = data.questions.filter((q) => q.family === f.id && q.active).length;
    if (f.content_status === "CANONICAL") {
      assert.ok(meetsFloor(f, count), `CANONICAL family ${f.id} is below its minimum_variant_count floor`);
    }
    // CANDIDATE families are never asserted against the floor here — by design.
  }
});

test("no production family is CANONICAL yet — promotion remains a separate, explicit later decision", () => {
  const promoted = data.families.filter((f) => f.content_status === "CANONICAL").map((f) => f.id);
  assert.equal(promoted.length, 0, `unexpectedly CANONICAL: ${promoted.join(", ")}`);
});

// --- Phase 7B-1: U2 compatibility, prerequisite graph, recall expansion ---

test("U2 (lesson.d1.authority-follows-accountability) approved content remains compatible: family and all 3 variants unchanged", () => {
  const lesson = data.lessons.find((l) => l.id === "lesson.d1.authority-follows-accountability");
  assert.ok(lesson, "lesson.d1.authority-follows-accountability must still exist");
  assert.deepEqual(lesson.retrieval_refs, ["question.d1.0002"], "U2's retrieval_refs must be unchanged");
  assert.equal(lesson.objective.includes("identifies or recommends"), true, "U2's objective wording must be unchanged");

  const variantIds = data.questions
    .filter((q) => q.family === "family.d1.authority-accountability-decision" && q.active)
    .map((q) => q.id)
    .sort();
  assert.deepEqual(variantIds, ["question.d1.0002", "question.d1.0003", "question.d1.0004"]);
});

const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const questionsById = new Map(data.questions.map((q) => [q.id, q]));
function familyVariantsFor(familyId) {
  return data.questions.filter((q) => q.family === familyId && q.active).map((q) => q.id);
}
const familyOfLesson = new Map(
  data.lessons.map((l) => [l.id, data.questions.find((q) => q.id === l.retrieval_refs[0])?.family])
);

function ancestorFamilies(lessonId, seen = new Set()) {
  if (seen.has(lessonId)) return new Set();
  seen.add(lessonId);
  const lesson = lessonsById.get(lessonId);
  if (!lesson) return new Set();
  const families = new Set();
  for (const prereqId of lesson.prerequisites) {
    if (!lessonsById.has(prereqId)) continue;
    const f = familyOfLesson.get(prereqId);
    if (f) families.add(f);
    for (const anc of ancestorFamilies(prereqId, seen)) families.add(anc);
  }
  return families;
}

test("Phase 7B-1 U1 -> U2 -> U3 -> U4 prerequisite chain is exactly as specified", () => {
  assert.deepEqual(lessonsById.get("lesson.d1.governance-vs-management").prerequisites, ["lesson.foundation.ask-qualifier"]);
  // lesson.d1.governance-vs-management (U1) is listed FIRST so recall
  // resolves to U1's family, per the approved "U2: recall U1" progression —
  // see the "recall selects the family the approved progression specifies"
  // test below.
  assert.deepEqual(lessonsById.get("lesson.d1.authority-follows-accountability").prerequisites, [
    "lesson.d1.governance-vs-management",
    "lesson.foundation.ask-qualifier"
  ]);
  assert.deepEqual(lessonsById.get("lesson.d1.governance-layer-authority").prerequisites, ["lesson.d1.authority-follows-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.data-ownership-accountability").prerequisites, ["lesson.d1.governance-layer-authority"]);
});

test("recall expansion resolves correctly: each unit's cumulative-recall-eligible families grow through the chain", () => {
  const u1Families = ancestorFamilies("lesson.d1.governance-vs-management");
  const u2Families = ancestorFamilies("lesson.d1.authority-follows-accountability");
  const u3Families = ancestorFamilies("lesson.d1.governance-layer-authority");
  const u4Families = ancestorFamilies("lesson.d1.data-ownership-accountability");

  // U1 has only Foundation as a prerequisite, which has no family-bearing
  // retrieval question of its own family (Foundation's own family is
  // reached the same way) — assert U1 reaches at least the Foundation family.
  assert.ok(u1Families.has("family.foundation.qualifier-recognition"));

  // U2 additively gained lesson.d1.governance-vs-management as a
  // prerequisite in Phase 7B-1 — its recall pool must now also reach U1's
  // family, not just Foundation's.
  assert.ok(u2Families.has("family.foundation.qualifier-recognition"));
  assert.ok(u2Families.has("family.d1.governance-vs-management"));

  // U3: recall U2, and U1 surfaces through cumulative prerequisite
  // traversal (via U2's own prerequisite chain) — per the approved
  // Phase 7A/7B-1 recall progression.
  assert.ok(u3Families.has("family.d1.authority-accountability-decision"));
  assert.ok(u3Families.has("family.d1.governance-vs-management"));
  assert.ok(u3Families.has("family.foundation.qualifier-recognition"));

  // U4: recall U3, cumulative through the whole chain.
  assert.ok(u4Families.has("family.d1.governance-layer-authority"));
  assert.ok(u4Families.has("family.d1.authority-accountability-decision"));
  assert.ok(u4Families.has("family.d1.governance-vs-management"));
  assert.ok(u4Families.has("family.foundation.qualifier-recognition"));

  // Growth is strictly cumulative — each unit reaches at least as many
  // families as the one before it in the chain.
  assert.ok(u2Families.size >= u1Families.size);
  assert.ok(u3Families.size >= u2Families.size);
  assert.ok(u4Families.size >= u3Families.size);
});

// Mirrors app/src/content/resolve.ts's recallFamilyIdsFor() ordering
// exactly: Daily Study's Recall phase always shows the FIRST family in this
// list (getRecall() uses familyIds[0]), so which family is first is not
// cosmetic — it is which family the learner actually sees. Prerequisite
// array ORDER, not just set membership, therefore matters and is tested
// directly here.
function orderedRecallFamilyIds(lessonId) {
  const lesson = lessonsById.get(lessonId);
  const seen = new Set();
  const poolIds = new Set();
  const familyOrder = [];

  function addQuestion(q) {
    if (poolIds.has(q.id)) return;
    poolIds.add(q.id);
    if (q.family && !familyOrder.includes(q.family)) familyOrder.push(q.family);
  }

  function visit(id) {
    if (seen.has(id)) return;
    seen.add(id);
    const l = lessonsById.get(id);
    if (!l) return;
    for (const refId of l.retrieval_refs) {
      const q = questionsById.get(refId);
      if (!q) continue;
      if (q.family && familyById.has(q.family)) {
        for (const variantId of familyVariantsFor(q.family)) addQuestion(questionsById.get(variantId));
      } else {
        addQuestion(q);
      }
    }
    for (const prereqId of l.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
  }
  for (const prereqId of lesson.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
  return familyOrder;
}

test("recall selects the family the approved progression specifies: U2 recalls U1 (not Foundation) first, U3 recalls U2 first, U4 recalls U3 first", () => {
  assert.equal(orderedRecallFamilyIds("lesson.d1.authority-follows-accountability")[0], "family.d1.governance-vs-management");
  assert.equal(orderedRecallFamilyIds("lesson.d1.governance-layer-authority")[0], "family.d1.authority-accountability-decision");
  assert.equal(orderedRecallFamilyIds("lesson.d1.data-ownership-accountability")[0], "family.d1.governance-layer-authority");
});

// --- Phase 7B-2: U5/U6/U7, U1-U4 preservation ---

test("Phase 7B-1 U1-U4 content remains fully preserved by Phase 7B-2 (lessons, families, variant counts unchanged)", () => {
  assert.deepEqual(lessonsById.get("lesson.d1.governance-vs-management").prerequisites, ["lesson.foundation.ask-qualifier"]);
  assert.deepEqual(lessonsById.get("lesson.d1.authority-follows-accountability").prerequisites, [
    "lesson.d1.governance-vs-management",
    "lesson.foundation.ask-qualifier"
  ]);
  assert.deepEqual(lessonsById.get("lesson.d1.governance-layer-authority").prerequisites, ["lesson.d1.authority-follows-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.data-ownership-accountability").prerequisites, ["lesson.d1.governance-layer-authority"]);

  assert.equal(familyVariantsFor("family.d1.governance-vs-management").length, 3);
  assert.equal(familyVariantsFor("family.d1.authority-accountability-decision").length, 3);
  assert.equal(familyVariantsFor("family.d1.governance-layer-authority").length, 4);
  assert.equal(familyVariantsFor("family.d1.data-ownership-accountability").length, 4);
});

test("Phase 7B-2 U5 -> U6 -> U7 prerequisite chain extends the sequence correctly", () => {
  assert.deepEqual(lessonsById.get("lesson.d1.security-strategy-alignment").prerequisites, ["lesson.d1.data-ownership-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.business-justification-roadmap").prerequisites, ["lesson.d1.security-strategy-alignment"]);
  assert.deepEqual(lessonsById.get("lesson.d1.governance-effectiveness").prerequisites, ["lesson.d1.business-justification-roadmap"]);
});

test("recall selects the family the approved Phase 7B-2 progression specifies: U5 recalls U4, U6 recalls U5, U7 recalls U6", () => {
  assert.equal(orderedRecallFamilyIds("lesson.d1.security-strategy-alignment")[0], "family.d1.data-ownership-accountability");
  assert.equal(orderedRecallFamilyIds("lesson.d1.business-justification-roadmap")[0], "family.d1.security-strategy-alignment");
  assert.equal(orderedRecallFamilyIds("lesson.d1.governance-effectiveness")[0], "family.d1.business-justification-roadmap");
});

test("recall expansion is cumulative through the full U1-U7 chain (earlier prerequisites remain reachable, never lost)", () => {
  const u7Families = ancestorFamilies("lesson.d1.governance-effectiveness");
  for (const id of [
    "family.d1.business-justification-roadmap",
    "family.d1.security-strategy-alignment",
    "family.d1.data-ownership-accountability",
    "family.d1.governance-layer-authority",
    "family.d1.authority-accountability-decision",
    "family.d1.governance-vs-management",
    "family.foundation.qualifier-recognition"
  ]) {
    assert.ok(u7Families.has(id), `U7's cumulative recall pool is missing ${id}`);
  }
  assert.ok(!u7Families.has("family.d1.governance-effectiveness"), "U7 must never recall its own family");
});

test("U7 remains ONE combined family, not split into U7A/U7B, per the explicit Phase 7B-2 instruction", () => {
  const u7Concepts = data.concepts.filter((c) => c.id === "concept.d1.governance-effectiveness");
  const u7Families2 = data.families.filter((f) => f.id.startsWith("family.d1.governance-effectiveness"));
  assert.equal(u7Concepts.length, 1);
  assert.equal(u7Families2.length, 1);
});

test("U7's family does not name a specific named framework as a canonical/required teaching vocabulary (not a framework-cataloging lesson)", () => {
  const family = familyById.get("family.d1.governance-effectiveness");
  const namedFrameworkPattern = /\b(ISO ?27001|COBIT|NIST)\b/i;
  assert.equal(namedFrameworkPattern.test(family.teaching_objective + " " + family.invariant_reasoning), false);
});

// --- Phase 7B-3: U8/U9, U1-U7 preservation, U8 non-adjacent recall-back ---

test("Phase 7B-1/7B-2 U1-U7 content remains fully preserved by Phase 7B-3 (lessons, families, variant counts unchanged)", () => {
  assert.deepEqual(lessonsById.get("lesson.d1.governance-vs-management").prerequisites, ["lesson.foundation.ask-qualifier"]);
  assert.deepEqual(lessonsById.get("lesson.d1.authority-follows-accountability").prerequisites, [
    "lesson.d1.governance-vs-management",
    "lesson.foundation.ask-qualifier"
  ]);
  assert.deepEqual(lessonsById.get("lesson.d1.governance-layer-authority").prerequisites, ["lesson.d1.authority-follows-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.data-ownership-accountability").prerequisites, ["lesson.d1.governance-layer-authority"]);
  assert.deepEqual(lessonsById.get("lesson.d1.security-strategy-alignment").prerequisites, ["lesson.d1.data-ownership-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.business-justification-roadmap").prerequisites, ["lesson.d1.security-strategy-alignment"]);
  assert.deepEqual(lessonsById.get("lesson.d1.governance-effectiveness").prerequisites, ["lesson.d1.business-justification-roadmap"]);

  assert.equal(familyVariantsFor("family.d1.governance-vs-management").length, 3);
  assert.equal(familyVariantsFor("family.d1.authority-accountability-decision").length, 3);
  assert.equal(familyVariantsFor("family.d1.governance-layer-authority").length, 4);
  assert.equal(familyVariantsFor("family.d1.data-ownership-accountability").length, 4);
  assert.equal(familyVariantsFor("family.d1.security-strategy-alignment").length, 3);
  assert.equal(familyVariantsFor("family.d1.business-justification-roadmap").length, 3);
  assert.equal(familyVariantsFor("family.d1.governance-effectiveness").length, 3);
});

test("Phase 7B-3 U8 -> U9 prerequisite chain is exactly as specified, with U8's deliberate non-adjacent U1 recall-back ordering", () => {
  // U1 (lesson.d1.governance-vs-management) is listed FIRST, ahead of U7,
  // so recall resolves to U1's family — the approved Phase 7B-3
  // non-adjacent "U8 recalls U1" instruction — see the recall-order test
  // below. U7 is still a prerequisite (second) so the full cumulative
  // U2-U7 chain remains reachable exactly as for every other unit.
  assert.deepEqual(lessonsById.get("lesson.d1.legal-regulatory-risk").prerequisites, [
    "lesson.d1.governance-vs-management",
    "lesson.d1.governance-effectiveness"
  ]);
  assert.deepEqual(lessonsById.get("lesson.d1.organizational-culture-governance").prerequisites, ["lesson.d1.legal-regulatory-risk"]);
});

test("recall selects the family the approved Phase 7B-3 progression specifies: U8 recalls U1 (non-adjacent, not U7), U9 recalls U8", () => {
  assert.equal(orderedRecallFamilyIds("lesson.d1.legal-regulatory-risk")[0], "family.d1.governance-vs-management");
  assert.equal(orderedRecallFamilyIds("lesson.d1.organizational-culture-governance")[0], "family.d1.legal-regulatory-risk");
});

test("recall expansion is cumulative through the full U1-U9 chain (earlier prerequisites remain reachable, never lost)", () => {
  const u9Families = ancestorFamilies("lesson.d1.organizational-culture-governance");
  for (const id of [
    "family.d1.legal-regulatory-risk",
    "family.d1.governance-effectiveness",
    "family.d1.business-justification-roadmap",
    "family.d1.security-strategy-alignment",
    "family.d1.data-ownership-accountability",
    "family.d1.governance-layer-authority",
    "family.d1.authority-accountability-decision",
    "family.d1.governance-vs-management",
    "family.foundation.qualifier-recognition"
  ]) {
    assert.ok(u9Families.has(id), `U9's cumulative recall pool is missing ${id}`);
  }
  assert.ok(!u9Families.has("family.d1.organizational-culture-governance"), "U9 must never recall its own family");

  const u8Families = ancestorFamilies("lesson.d1.legal-regulatory-risk");
  assert.ok(u8Families.has("family.d1.governance-vs-management"), "U8 must reach U1's family (non-adjacent recall-back)");
  assert.ok(u8Families.has("family.d1.governance-effectiveness"), "U8 must still cumulatively reach U7's family");
  assert.ok(!u8Families.has("family.d1.legal-regulatory-risk"), "U8 must never recall its own family");
});

// --- Phase 7C: Domain 1 readiness follow-up (G1 policy-artifact-hierarchy, G3 U8 4th variant, G4 U9 4th variant) ---

const conceptsById = new Map(data.concepts.map((c) => [c.id, c]));
const questionsByFamily = (familyId) => data.questions.filter((q) => q.family === familyId && q.active);

test("G1: the policy-artifact concept and lesson references resolve", () => {
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"), "concept.d1.policy-artifact-hierarchy must exist");
  const u7 = lessonsById.get("lesson.d1.governance-effectiveness");
  assert.ok(u7.concepts.includes("concept.d1.policy-artifact-hierarchy"), "U7 must teach the new concept alongside its original one");
  assert.ok(u7.concepts.includes("concept.d1.governance-effectiveness"), "U7 must still teach its original concept");
  assert.ok(familyById.has("family.d1.policy-artifact-hierarchy"), "family.d1.policy-artifact-hierarchy must exist");
});

test("G1: family.d1.policy-artifact-hierarchy has exactly 3 active variants, all belonging to it", () => {
  const variants = questionsByFamily("family.d1.policy-artifact-hierarchy");
  assert.equal(variants.length, 3);
  for (const q of variants) assert.equal(q.family, "family.d1.policy-artifact-hierarchy");
});

test("G1: the 3 policy-artifact variants are taught before tested (U7 teaches the concept, and is itself the only lesson whose own retrieval_refs include this family)", () => {
  const u7 = lessonsById.get("lesson.d1.governance-effectiveness");
  const anchorId = u7.retrieval_refs[1];
  assert.ok(anchorId, "U7 must have a second retrieval_refs entry for the new family");
  const anchorQuestion = questionsById.get(anchorId);
  assert.equal(anchorQuestion.family, "family.d1.policy-artifact-hierarchy");
  // U7's OWN Apply anchor (retrieval_refs[0]) must be unchanged — the new
  // family is additive, never replacing U7's original, already-approved
  // Apply behavior.
  assert.equal(u7.retrieval_refs[0], "question.d1.0022");
  assert.equal(questionsById.get("question.d1.0022").family, "family.d1.governance-effectiveness");
});

test("G1: the 3 policy-artifact variants meaningfully differ structurally (distinct stems, distinct option-text sets — enforced generally by variation-quality.test.mjs, re-asserted here for this specific new family)", () => {
  const variants = questionsByFamily("family.d1.policy-artifact-hierarchy");
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, 3, "all 3 stems must be distinct");
  const optionSets = variants.map((q) => new Set(q.options.map((o) => o.text.trim().toLowerCase())));
  for (let i = 0; i < optionSets.length; i++) {
    for (let j = i + 1; j < optionSets.length; j++) {
      const [a, b] = [optionSets[i], optionSets[j]];
      const identical = a.size === b.size && [...a].every((t) => b.has(t));
      assert.equal(identical, false, `${variants[i].id} and ${variants[j].id} must not share an identical option-text set`);
    }
  }
});

test("G3: family.d1.legal-regulatory-risk now has exactly 4 active variants, and the new 4th preserves the family's invariant reasoning (structured risk reasoning, not a compliance reflex)", () => {
  const variants = questionsByFamily("family.d1.legal-regulatory-risk");
  assert.equal(variants.length, 4);
  const fourth = variants.find((q) => q.id === "question.d1.0034");
  assert.ok(fourth, "question.d1.0034 must exist and belong to family.d1.legal-regulatory-risk");
  const correct = fourth.options.find((o) => o.correct);
  assert.match(correct.text, /probability|consequence|risk/i, "the correct answer must reflect risk-based reasoning, not a compliance reflex");
});

test("G4: family.d1.organizational-culture-governance now has exactly 4 active variants, and the new 4th tests the culture -> risk-appetite-expression link without teaching that culture overrides authority or that training fixes appetite", () => {
  const variants = questionsByFamily("family.d1.organizational-culture-governance");
  assert.equal(variants.length, 4);
  const fourth = variants.find((q) => q.id === "question.d1.0035");
  assert.ok(fourth, "question.d1.0035 must exist and belong to family.d1.organizational-culture-governance");
  const correct = fourth.options.find((o) => o.correct);
  assert.match(correct.text, /culture/i, "the correct answer must attribute the difference to organizational culture");
  const wrongOptions = fourth.options.filter((o) => !o.correct);
  for (const opt of wrongOptions) {
    assert.doesNotMatch(opt.rationale, /culture (overrides|supersedes)/i, "must never teach that culture overrides approved risk appetite");
  }
});

test("G2: NEXT was not artificially added merely for qualifier-coverage — no Domain 1 question uses qualifier.next", () => {
  const d1Questions = data.questions.filter((q) => q.domain === "domain.d1");
  const nextUsage = d1Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from Domain 1 unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
});

test("Phase 7C: U1-U6 remain completely unchanged (prerequisites and variant counts)", () => {
  assert.deepEqual(lessonsById.get("lesson.d1.governance-vs-management").prerequisites, ["lesson.foundation.ask-qualifier"]);
  assert.deepEqual(lessonsById.get("lesson.d1.authority-follows-accountability").prerequisites, [
    "lesson.d1.governance-vs-management",
    "lesson.foundation.ask-qualifier"
  ]);
  assert.deepEqual(lessonsById.get("lesson.d1.governance-layer-authority").prerequisites, ["lesson.d1.authority-follows-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.data-ownership-accountability").prerequisites, ["lesson.d1.governance-layer-authority"]);
  assert.deepEqual(lessonsById.get("lesson.d1.security-strategy-alignment").prerequisites, ["lesson.d1.data-ownership-accountability"]);
  assert.deepEqual(lessonsById.get("lesson.d1.business-justification-roadmap").prerequisites, ["lesson.d1.security-strategy-alignment"]);

  assert.equal(familyVariantsFor("family.d1.governance-vs-management").length, 3);
  assert.equal(familyVariantsFor("family.d1.authority-accountability-decision").length, 3);
  assert.equal(familyVariantsFor("family.d1.governance-layer-authority").length, 4);
  assert.equal(familyVariantsFor("family.d1.data-ownership-accountability").length, 4);
  assert.equal(familyVariantsFor("family.d1.security-strategy-alignment").length, 3);
  assert.equal(familyVariantsFor("family.d1.business-justification-roadmap").length, 3);
});

test("Phase 7C: U7's originally-approved material remains present (unchanged prerequisite, unchanged Apply anchor, original family/variant count intact)", () => {
  const u7 = lessonsById.get("lesson.d1.governance-effectiveness");
  assert.deepEqual(u7.prerequisites, ["lesson.d1.business-justification-roadmap"]);
  assert.equal(u7.retrieval_refs[0], "question.d1.0022");
  assert.equal(familyVariantsFor("family.d1.governance-effectiveness").length, 3);
  assert.ok(u7.objective.includes("do not by themselves prove governance is effective"), "U7's original objective wording must be preserved, not replaced");
});

test("Phase 7C: U8/U9's original 3 variants remain preserved and active, alongside their new 4th", () => {
  assert.deepEqual(
    questionsByFamily("family.d1.legal-regulatory-risk").map((q) => q.id).sort(),
    ["question.d1.0025", "question.d1.0026", "question.d1.0027", "question.d1.0034"]
  );
  assert.deepEqual(
    questionsByFamily("family.d1.organizational-culture-governance").map((q) => q.id).sort(),
    ["question.d1.0028", "question.d1.0029", "question.d1.0030", "question.d1.0035"]
  );
  assert.deepEqual(lessonsById.get("lesson.d1.legal-regulatory-risk").prerequisites, [
    "lesson.d1.governance-vs-management",
    "lesson.d1.governance-effectiveness"
  ]);
  assert.deepEqual(lessonsById.get("lesson.d1.organizational-culture-governance").prerequisites, ["lesson.d1.legal-regulatory-risk"]);
});

test("Phase 7C: no CANONICAL promotion occurred and all new/modified entities remain CANDIDATE", () => {
  const newIds = {
    concepts: ["concept.d1.policy-artifact-hierarchy"],
    families: ["family.d1.policy-artifact-hierarchy", "family.d1.legal-regulatory-risk", "family.d1.organizational-culture-governance"],
    lessons: ["lesson.d1.governance-effectiveness"],
    questions: ["question.d1.0031", "question.d1.0032", "question.d1.0033", "question.d1.0034", "question.d1.0035"]
  };
  const bad = [];
  for (const [collection, ids] of Object.entries(newIds)) {
    for (const id of ids) {
      const entity = data[collection].find((e) => e.id === id);
      if (!entity) bad.push(`missing ${collection}/${id}`);
      else if (entity.content_status !== "CANDIDATE") bad.push(`${collection}/${id} is ${entity.content_status}, expected CANDIDATE`);
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));

  const anyCanonical = ["concepts", "families", "lessons", "questions"].some((c) => data[c].some((e) => e.content_status === "CANONICAL"));
  assert.equal(anyCanonical, false, "no production entity may be CANONICAL");
});

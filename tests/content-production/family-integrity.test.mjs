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
    "family.d1.data-ownership-accountability": 4
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

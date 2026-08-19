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

test("Phase 6C's two families each have exactly their expected 3 active variants", () => {
  const byFamily = new Map();
  for (const q of data.questions) {
    if (!q.family || !q.active) continue;
    if (!byFamily.has(q.family)) byFamily.set(q.family, []);
    byFamily.get(q.family).push(q.id);
  }
  assert.equal(byFamily.get("family.foundation.qualifier-recognition")?.length, 3);
  assert.equal(byFamily.get("family.d1.authority-accountability-decision")?.length, 3);
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

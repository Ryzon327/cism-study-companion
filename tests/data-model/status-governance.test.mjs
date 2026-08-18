// Covers: "no canonical entity references CANDIDATE/PROTOTYPE material in a
// learner-scoring relationship" and "source provenance present where
// required", from docs/data-model/VALIDATION-INVARIANTS.md. Includes the
// two deliberate negative-fixture demonstrations requested for Phase 3
// review.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex, loadFixture } from "./helpers/load-registry.mjs";

const data = loadAll();
const index = buildIndex(data);

function statusOf(id) {
  const hits = index.get(id);
  return hits?.[0]?.entity?.content_status ?? null;
}

// The scoring-relevant fields on a Question - the fields that actually
// drive what a learner is assessed against, as opposed to purely
// informational "see also" links.
const QUESTION_SCORING_FIELDS = [
  { field: "concepts", isArray: true },
  { field: "patterns", isArray: true },
  { field: "qualifier", nullable: true },
  { field: "roles_mentioned", isArray: true },
  { field: "primary_role", nullable: true },
  { field: "lifecycle", nullable: true },
  { field: "stage", nullable: true },
  { field: "decision_type", nullable: true },
  { field: "evidence_dimensions", isArray: true }
];

function scoringViolations(question) {
  if (question.content_status !== "CANONICAL") return [];
  const violations = [];
  for (const { field, isArray, nullable } of QUESTION_SCORING_FIELDS) {
    const raw = question[field];
    if (raw == null) { continue; }
    const values = isArray ? raw : [raw];
    for (const v of values) {
      const status = statusOf(v);
      if (status && status !== "CANONICAL") {
        violations.push(`${question.id}.${field} references "${v}" (${status})`);
      }
    }
  }
  for (const opt of question.options) {
    if (opt.repair_target == null) continue;
    const status = statusOf(opt.repair_target);
    if (status && status !== "CANONICAL") {
      violations.push(`${question.id} option ${opt.key}.repair_target references "${opt.repair_target}" (${status})`);
    }
  }
  return violations;
}

test("no CANONICAL question in the example set references a CANDIDATE or PROTOTYPE_REFERENCE entity in a scoring field", () => {
  const violations = data.questions.flatMap(scoringViolations);
  assert.equal(violations.length, 0, violations.join("\n"));
});

test("DEMO: a CANONICAL question referencing the CANDIDATE concept.d1.business-objectives is rejected", () => {
  const [q] = loadFixture("invalid-candidate-concept-reference.json");
  assert.equal(q.content_status, "CANONICAL");
  const violations = scoringViolations(q);
  assert.equal(violations.length, 1, "expected exactly one status-governance violation");
  assert.match(violations[0], /concept\.d1\.business-objectives.*CANDIDATE/);
});

test("DEMO: a CANONICAL question referencing the PROTOTYPE_REFERENCE qualifier.primarily is rejected", () => {
  const [q] = loadFixture("invalid-prototype-qualifier-reference.json");
  assert.equal(q.content_status, "CANONICAL");
  const violations = scoringViolations(q);
  assert.equal(violations.length, 1, "expected exactly one status-governance violation");
  assert.match(violations[0], /qualifier\.primarily.*PROTOTYPE_REFERENCE/);
});

const REQUIRES_PROVENANCE = ["domains", "roles", "qualifiers", "decisionTypes", "evidenceDimensions", "repairTargets", "patterns", "lifecycles", "lifecycleStages", "concepts", "questions", "lessons"];

test("every CANONICAL entity has a non-null source", () => {
  const missing = [];
  for (const collection of REQUIRES_PROVENANCE) {
    for (const entity of data[collection]) {
      if (entity.content_status === "CANONICAL" && !entity.source) {
        missing.push(`${collection}/${entity.id}`);
      }
    }
  }
  assert.equal(missing.length, 0, `CANONICAL entities missing source: ${missing.join(", ")}`);
});

test("content_status is always one of the three approved values", () => {
  const bad = [];
  for (const collection of REQUIRES_PROVENANCE) {
    for (const entity of data[collection]) {
      if (!["CANONICAL", "CANDIDATE", "PROTOTYPE_REFERENCE"].includes(entity.content_status)) {
        bad.push(`${collection}/${entity.id}: "${entity.content_status}"`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

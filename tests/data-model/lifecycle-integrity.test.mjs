// Covers: "lifecycle-stage order valid" and the Phase 2/3 amendment that
// Domain 1 and Domain 3 must not have a canonical lifecycle, from
// docs/data-model/VALIDATION-INVARIANTS.md and the Phase 3 amendment
// review. This is the structural enforcement the amendment explicitly
// asked for - not just a status label.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-registry.mjs";

const data = loadAll();

test("the lifecycle registry contains only the two approved canonical lifecycles", () => {
  const ids = data.lifecycles.map(l => l.id).sort();
  assert.deepEqual(
    ids,
    ["lifecycle.incident", "lifecycle.risk"],
    "lifecycles.json must contain exactly lifecycle.risk and lifecycle.incident - no Domain 1/3 lifecycle entity may be added merely for structural symmetry"
  );
});

test("every lifecycle in the registry has content_status CANONICAL", () => {
  for (const l of data.lifecycles) {
    assert.equal(l.content_status, "CANONICAL", `${l.id} must be CANONICAL - a non-canonical lifecycle must not exist in this registry at all`);
  }
});

for (const lifecycleId of ["lifecycle.risk", "lifecycle.incident"]) {
  test(`${lifecycleId}'s stages have unique, contiguous positions starting at 1`, () => {
    const stages = data.lifecycleStages
      .filter(s => s.lifecycle === lifecycleId)
      .sort((a, b) => a.position - b.position);
    const positions = stages.map(s => s.position);
    const expected = stages.map((_, i) => i + 1);
    assert.deepEqual(positions, expected, `${lifecycleId} stage positions: ${positions.join(",")}`);
  });

  test(`${lifecycleId}'s stage preceding/following pointers agree with position order`, () => {
    const stages = data.lifecycleStages
      .filter(s => s.lifecycle === lifecycleId)
      .sort((a, b) => a.position - b.position);
    for (let i = 0; i < stages.length; i++) {
      const expectedPreceding = i === 0 ? null : stages[i - 1].id;
      const expectedFollowing = i === stages.length - 1 ? null : stages[i + 1].id;
      assert.equal(stages[i].preceding, expectedPreceding, `${stages[i].id}.preceding mismatch`);
      assert.equal(stages[i].following, expectedFollowing, `${stages[i].id}.following mismatch`);
    }
  });
}

test("every question.stage belongs to the same lifecycle as question.lifecycle", () => {
  const stageById = new Map(data.lifecycleStages.map(s => [s.id, s]));
  for (const q of data.questions) {
    if (q.stage == null) continue;
    const stage = stageById.get(q.stage);
    assert.ok(stage, `${q.id}: stage "${q.stage}" does not exist`);
    assert.equal(stage.lifecycle, q.lifecycle, `${q.id}: stage "${q.stage}" belongs to "${stage.lifecycle}", not question.lifecycle "${q.lifecycle}"`);
  }
});

test("no Domain 1 or Domain 3 question references a lifecycle or stage", () => {
  const offenders = data.questions.filter(
    q => (q.domain === "domain.d1" || q.domain === "domain.d3") && (q.lifecycle != null || q.stage != null)
  );
  assert.equal(
    offenders.length,
    0,
    `Domain 1/3 questions must not reference a canonical lifecycle (none exists for these domains): ${offenders.map(q => q.id).join(", ")}`
  );
});

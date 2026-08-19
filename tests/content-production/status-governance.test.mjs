// Invariant 23, plus the explicit Phase 6B rule: newly-authored production
// content begins CANDIDATE and Claude Code may not silently promote it.
// This suite enforces that boundary as a blocking gate, not a convention.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex, PRODUCTION_COLLECTIONS } from "./helpers/load-production.mjs";

const data = loadAll();
const index = buildIndex(data);

function statusOf(id) {
  return index.get(id)?.[0]?.entity?.content_status ?? null;
}

test("content_status is always one of the three approved values", () => {
  const bad = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (!["CANONICAL", "CANDIDATE", "PROTOTYPE_REFERENCE"].includes(entity.content_status)) {
        bad.push(`${name}/${entity.id}: "${entity.content_status}"`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("PHASE 6B RULE: no production concept/lesson/question is CANONICAL yet — promotion is a separate, explicit later decision", () => {
  const promoted = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (entity.content_status === "CANONICAL") promoted.push(`${name}/${entity.id}`);
    }
  }
  assert.equal(
    promoted.length,
    0,
    `These entities were promoted to CANONICAL during Phase 6B, which is not authorized: ${promoted.join(", ")}`
  );
});

test("no CANDIDATE production question references CANONICAL-only-required content incorrectly (status is internally consistent)", () => {
  // CANDIDATE entities referencing CANONICAL vocabulary is fine and expected
  // (see schema/example/README.md's precedent) — this only checks that no
  // production question claims CANONICAL status while pointing at anything
  // not yet CANONICAL, mirroring tests/data-model/status-governance.test.mjs's
  // check. Currently vacuous (nothing is CANONICAL — see the rule above) but
  // exists so it activates automatically the moment a future phase promotes
  // anything.
  const SCORING_FIELDS = [
    { field: "concepts", isArray: true },
    { field: "patterns", isArray: true },
    { field: "qualifier", nullable: true },
    { field: "roles_mentioned", isArray: true },
    { field: "primary_role", nullable: true },
    { field: "evidence_dimensions", isArray: true }
  ];
  const violations = [];
  for (const q of data.questions) {
    if (q.content_status !== "CANONICAL") continue;
    for (const { field, isArray } of SCORING_FIELDS) {
      const raw = q[field];
      if (raw == null) continue;
      for (const v of isArray ? raw : [raw]) {
        const status = statusOf(v);
        if (status && status !== "CANONICAL") violations.push(`${q.id}.${field} -> ${v} (${status})`);
      }
    }
  }
  assert.equal(violations.length, 0, violations.join("\n"));
});

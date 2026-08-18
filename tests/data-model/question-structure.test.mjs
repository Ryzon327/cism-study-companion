// Covers: "question correct answer valid", "question options unique/non-
// empty", "required rationales align", "primary_role must appear in
// roles_mentioned", and the qualifier.none exclusion amendment, from
// docs/data-model/VALIDATION-INVARIANTS.md.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, loadFixture } from "./helpers/load-registry.mjs";

const data = loadAll();

test("every question has exactly four options with unique, non-empty text", () => {
  for (const q of data.questions) {
    assert.equal(q.options.length, 4, `${q.id}: expected 4 options, got ${q.options.length}`);
    const texts = q.options.map(o => o.text.trim());
    assert.ok(texts.every(t => t.length > 0), `${q.id}: has an empty option`);
    assert.equal(new Set(texts).size, 4, `${q.id}: options are not all distinct`);
  }
});

test("every question has exactly one correct option, and every wrong option has a rationale", () => {
  for (const q of data.questions) {
    const correct = q.options.filter(o => o.correct === true);
    assert.equal(correct.length, 1, `${q.id}: expected exactly 1 correct option, got ${correct.length}`);
    for (const o of q.options) {
      assert.ok(typeof o.rationale === "string" && o.rationale.length > 0, `${q.id} option ${o.key}: missing rationale`);
    }
  }
});

test("every option key is one of a/b/c/d and unique within its question", () => {
  for (const q of data.questions) {
    const keys = q.options.map(o => o.key);
    assert.deepEqual([...keys].sort(), ["a", "b", "c", "d"], `${q.id}: option keys must be exactly a,b,c,d`);
  }
});

test("primary_role, when set, is a member of roles_mentioned", () => {
  for (const q of data.questions) {
    if (q.primary_role == null) continue;
    assert.ok(
      (q.roles_mentioned || []).includes(q.primary_role),
      `${q.id}: primary_role "${q.primary_role}" is not present in roles_mentioned`
    );
  }
});

test("qualifier.none does not exist anywhere in the qualifier registry", () => {
  const none = data.qualifiers.find(q => q.id === "qualifier.none");
  assert.equal(none, undefined, "qualifier.none must not exist - absence of a qualifier signal is represented as qualifier: null, not a qualifier entity");
});

test("absence of a qualifier signal is representable as qualifier: null", () => {
  const nullQualifierExample = data.questions.find(q => q.qualifier === null);
  assert.ok(nullQualifierExample, "expected at least one example question demonstrating qualifier: null");
});

test("no question uses the literal string \"qualifier.none\"", () => {
  const offenders = data.questions.filter(q => q.qualifier === "qualifier.none");
  assert.equal(offenders.length, 0, `questions using the literal qualifier.none string: ${offenders.map(q => q.id).join(", ")}`);
});

test("prototype-reference-qualifier fixture is correctly shaped for the negative status-governance test", () => {
  const [q] = loadFixture("invalid-prototype-qualifier-reference.json");
  assert.equal(q.qualifier, "qualifier.primarily");
  assert.equal(q.content_status, "CANONICAL");
});

// Requirement 5: invalid qualifier/role/lifecycle/decision references.
//
// Only data/mixed-practice.js's questions carry qualifier/role/lifecycle/
// decision tags today: js/mixed-practice.js reads window.CISMMixedPractice
// directly (not the merged exam bank), and data/exam-bank.js's normalize()
// strips those fields when it assembles the merged pool. So this test
// validates the one bank that actually needs it, against the one dimension
// taxonomy that governs it (bank.dimensions), rather than assuming every
// question set carries these fields.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAppGlobals } from "../helpers/load-app-globals.mjs";

const { CISMMixedPractice } = loadAppGlobals();
const dimensions = CISMMixedPractice?.dimensions ?? {};
const questions = CISMMixedPractice?.questions ?? [];

test("Mixed Practice question bank is non-empty and dimensions taxonomy is present", () => {
  assert.ok(questions.length > 0, "expected CISMMixedPractice.questions to contain questions");
  for (const dim of ["qualifier", "role", "lifecycle", "decision"]) {
    assert.ok(Array.isArray(dimensions[dim]) && dimensions[dim].length > 0, `dimensions.${dim} should be a non-empty array`);
  }
});

for (const dim of ["qualifier", "role", "lifecycle", "decision"]) {
  test(`every question's ${dim} value is a selectable chip in dimensions.${dim}`, () => {
    const allowed = new Set(dimensions[dim] || []);
    const orphaned = questions.filter(q => !allowed.has(q[dim])).map(q => `${q.id} → "${q[dim]}"`);
    // .length is used (not deepEqual against a literal []) because `orphaned`
    // is derived from an array evaluated inside the vm sandbox in
    // load-app-globals.mjs; deep-equality checks can fail on cross-realm
    // array identity even when both arrays are genuinely empty.
    assert.equal(orphaned.length, 0, `questions with a ${dim} value not present in dimensions.${dim}: ${orphaned.join(", ")}`);
  });
}

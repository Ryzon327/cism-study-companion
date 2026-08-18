// Requirements 3 & 4: duplicate question IDs; invalid question/domain references.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAppGlobals } from "../helpers/load-app-globals.mjs";

const { CISMExamBank } = loadAppGlobals();
const questions = CISMExamBank?.questions ?? [];

test("the merged exam bank (legacy + scenario variants + local) is non-empty", () => {
  assert.ok(questions.length > 0, "expected CISMExamBank.questions to contain questions");
});

test("no duplicate question ids exist across the merged exam bank", () => {
  const seen = new Set();
  const duplicates = [];
  for (const q of questions) {
    if (seen.has(q.id)) duplicates.push(q.id);
    seen.add(q.id);
  }
  assert.equal(duplicates.length, 0, `duplicate question ids found: ${duplicates.join(", ")}`);
});

test("every question has exactly four distinct, non-empty options", () => {
  for (const q of questions) {
    assert.equal(q.options?.length, 4, `${q.id}: expected 4 options, got ${q.options?.length}`);
    for (const option of q.options) {
      assert.ok(typeof option === "string" && option.trim().length > 0, `${q.id}: has an empty option`);
    }
    const unique = new Set(q.options.map(o => o.trim()));
    assert.equal(unique.size, 4, `${q.id}: options are not all distinct`);
  }
});

test("every question's correctIndex is a valid index into its options", () => {
  for (const q of questions) {
    assert.ok(
      Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < q.options.length,
      `${q.id}: correctIndex ${q.correctIndex} is out of range for ${q.options.length} options`
    );
  }
});

test("every question's domain is one of 1, 2, 3, 4", () => {
  for (const q of questions) {
    assert.ok(["1", "2", "3", "4"].includes(String(q.domain)), `${q.id}: invalid domain "${q.domain}"`);
  }
});

test("optionRationales, when present, align one-to-one with options", () => {
  for (const q of questions) {
    if (q.optionRationales == null) continue;
    assert.equal(
      q.optionRationales.length,
      q.options.length,
      `${q.id}: optionRationales length (${q.optionRationales.length}) does not match options length (${q.options.length})`
    );
  }
});

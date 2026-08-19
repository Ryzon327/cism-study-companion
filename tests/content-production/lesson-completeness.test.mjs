// Invariant 16: every required docs/data-model/SCHEMA-LESSON.md field is
// present and non-empty for a production lesson.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-production.mjs";

const data = loadAll();

const REQUIRED_STRING_FIELDS = ["objective", "context", "cism_perspective", "scenario"];
const REQUIRED_ARRAY_FIELDS = ["concepts", "recognition_clues", "traps", "memory_rules", "retrieval_refs"];

test("every lesson has all required non-empty string fields", () => {
  const bad = [];
  for (const l of data.lessons) {
    for (const field of REQUIRED_STRING_FIELDS) {
      if (!l[field] || typeof l[field] !== "string" || l[field].trim().length === 0) {
        bad.push(`${l.id}.${field}`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every lesson has all required non-empty array fields", () => {
  const bad = [];
  for (const l of data.lessons) {
    for (const field of REQUIRED_ARRAY_FIELDS) {
      if (!Array.isArray(l[field]) || l[field].length === 0) bad.push(`${l.id}.${field}`);
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every lesson has at least one retrieval question — teaching without immediate application is incomplete", () => {
  const bad = data.lessons.filter((l) => !l.retrieval_refs?.length).map((l) => l.id);
  assert.equal(bad.length, 0, bad.join(", "));
});

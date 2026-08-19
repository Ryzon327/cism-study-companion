// Invariants 17-22: required question fields, exactly 4 unique non-empty
// options, exactly one correct, every wrong option has a meaningful
// rationale and a repair target, the correct option has meaningful
// reasoning.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-production.mjs";

const data = loadAll();

test("every question has id, domain, concepts, prompt, options, explanation", () => {
  const bad = [];
  for (const q of data.questions) {
    if (!q.id || !q.domain || !q.concepts?.length || !q.prompt || !q.options || !q.explanation) {
      bad.push(q.id ?? "(missing id)");
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every question has exactly 4 options with unique, non-empty text", () => {
  const bad = [];
  for (const q of data.questions) {
    if (q.options.length !== 4) bad.push(`${q.id}: ${q.options.length} options`);
    const texts = q.options.map((o) => o.text?.trim());
    if (texts.some((t) => !t)) bad.push(`${q.id}: empty option text`);
    if (new Set(texts).size !== texts.length) bad.push(`${q.id}: duplicate option text`);
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every question has exactly one correct option", () => {
  const bad = data.questions
    .filter((q) => q.options.filter((o) => o.correct).length !== 1)
    .map((q) => q.id);
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every incorrect option has a non-empty, non-trivial rationale and a repair target", () => {
  const bad = [];
  for (const q of data.questions) {
    for (const opt of q.options) {
      if (opt.correct) continue;
      if (!opt.rationale || opt.rationale.trim().length < 20) {
        bad.push(`${q.id} option ${opt.key}: rationale too short/missing`);
      }
      if (!opt.repair_target) bad.push(`${q.id} option ${opt.key}: missing repair_target`);
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("the correct option has a non-empty, non-trivial rationale", () => {
  const bad = [];
  for (const q of data.questions) {
    const correct = q.options.find((o) => o.correct);
    if (!correct?.rationale || correct.rationale.trim().length < 20) bad.push(q.id);
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every question declares at least one evidence dimension", () => {
  const bad = data.questions.filter((q) => !q.evidence_dimensions?.length).map((q) => q.id);
  assert.equal(bad.length, 0, bad.join(", "));
});

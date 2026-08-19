// Invariants 25, 27, 28, 29 — the major product requirement: a learner
// must never be tested on something the application hasn't taught, and
// Recall must only ever pull from material taught strictly before today's
// lesson. This is checked independently of app/src/content/resolve.ts's
// runtime logic (which implements the same rule) so the two can never
// silently drift apart — see docs/learning/CURRICULUM-BLUEPRINT.md's
// untaught-material rule and docs/learning/DAILY-STUDY-MODEL.md's Recall
// section.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex } from "./helpers/load-production.mjs";

const data = loadAll();
const index = buildIndex(data);

const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const questionsById = new Map(data.questions.map((q) => [q.id, q]));

test("lesson prerequisites contain no cycles", () => {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(data.lessons.map((l) => [l.id, WHITE]));
  const cycles = [];

  function visit(id, stack) {
    if (color.get(id) === BLACK) return;
    if (color.get(id) === GRAY) {
      cycles.push([...stack, id].join(" -> "));
      return;
    }
    color.set(id, GRAY);
    const lesson = lessonsById.get(id);
    for (const prereq of lesson?.prerequisites ?? []) {
      if (lessonsById.has(prereq)) visit(prereq, [...stack, id]);
    }
    color.set(id, BLACK);
  }

  for (const l of data.lessons) visit(l.id, []);
  assert.equal(cycles.length, 0, cycles.join("\n"));
});

// Every concept a lesson's own retrieval-application question tests must
// be taught by that lesson (or something the lesson lists as a
// prerequisite) — never introduced for the first time only inside the
// question.
function taughtConceptsFor(lessonId, seen = new Set()) {
  if (seen.has(lessonId)) return new Set();
  seen.add(lessonId);
  const lesson = lessonsById.get(lessonId);
  if (!lesson) return new Set();
  const taught = new Set(lesson.concepts);
  for (const prereq of lesson.prerequisites) {
    if (lessonsById.has(prereq)) for (const c of taughtConceptsFor(prereq, seen)) taught.add(c);
  }
  return taught;
}

test("taught-before-tested: every lesson's retrieval question only tests concepts that lesson (or its prerequisites) actually taught", () => {
  const violations = [];
  for (const lesson of data.lessons) {
    const taught = taughtConceptsFor(lesson.id);
    for (const refId of lesson.retrieval_refs) {
      const question = questionsById.get(refId);
      if (!question) continue;
      for (const c of question.concepts) {
        if (!taught.has(c)) violations.push(`${lesson.id} -> ${refId} tests untaught concept ${c}`);
      }
    }
  }
  assert.equal(violations.length, 0, violations.join("\n"));
});

const familiesById = new Map(data.families.map((f) => [f.id, f]));

function familyVariantsFor(familyId) {
  return data.questions.filter((q) => q.family === familyId && q.active).map((q) => q.id);
}

// Mirrors app/src/content/resolve.ts's recallPoolFor(): the eligible
// recall pool for a lesson is exactly the retrieval_refs reachable through
// its prerequisites — never the lesson's own retrieval_refs, and never
// anything not a prerequisite — expanded (Phase 6C) to every active variant
// of a retrieval_ref question's QuestionFamily, when it has one, so this
// mirror stays in sync with the real family-aware recall pool rather than
// testing a stale pre-Phase-6C model. A retrieval_ref question with no
// family falls back to just itself (Phase 6B-compatible behavior).
function recallPoolFor(lessonId) {
  const lesson = lessonsById.get(lessonId);
  if (!lesson) return [];
  const seen = new Set();
  const poolIds = new Set();
  const pool = [];

  function addQuestion(id) {
    if (poolIds.has(id)) return;
    poolIds.add(id);
    pool.push(id);
  }

  function visit(id) {
    if (seen.has(id)) return;
    seen.add(id);
    const l = lessonsById.get(id);
    if (!l) return;
    for (const ref of l.retrieval_refs) {
      const q = questionsById.get(ref);
      if (q?.family && familiesById.has(q.family)) {
        for (const variantId of familyVariantsFor(q.family)) addQuestion(variantId);
      } else {
        addQuestion(ref);
      }
    }
    for (const prereq of l.prerequisites) if (lessonsById.has(prereq)) visit(prereq);
  }
  for (const prereq of lesson.prerequisites) if (lessonsById.has(prereq)) visit(prereq);
  return pool;
}

test("recall eligibility: a lesson's recall pool never includes that lesson's own retrieval question", () => {
  const violations = [];
  for (const lesson of data.lessons) {
    const pool = recallPoolFor(lesson.id);
    for (const ownRef of lesson.retrieval_refs) {
      if (pool.includes(ownRef)) violations.push(`${lesson.id}: recall pool includes its own question ${ownRef}`);
    }
  }
  assert.equal(violations.length, 0, violations.join("\n"));
});

test("every lesson that has at least one prerequisite has a non-empty recall pool (Recall must have real material to draw from)", () => {
  const violations = data.lessons
    .filter((l) => l.prerequisites.length > 0 && recallPoolFor(l.id).length === 0)
    .map((l) => l.id);
  assert.equal(violations.length, 0, violations.join(", "));
});

test("no Daily Study path (a lesson plus its prerequisite chain) can reach a question outside content/production/ — every retrieval_ref and every recall-pool question resolves inside this loaded set", () => {
  const bad = [];
  for (const lesson of data.lessons) {
    for (const refId of [...lesson.retrieval_refs, ...recallPoolFor(lesson.id)]) {
      if (!index.get(refId)?.some((h) => h.collection === "questions")) bad.push(`${lesson.id} -> ${refId}`);
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

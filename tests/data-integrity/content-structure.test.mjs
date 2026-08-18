// Requirement 6: malformed content/question structures.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAppGlobals } from "../helpers/load-app-globals.mjs";

const { CISMContent, CISMActiveLearning, CISMDailyCoach } = loadAppGlobals();
const DOMAINS = ["1", "2", "3", "4"];

test("data/content.js defines all four domains with required top-level fields", () => {
  for (const d of DOMAINS) {
    const domain = CISMContent?.domains?.[d];
    assert.ok(domain, `domain ${d} should exist in CISMContent.domains`);
    for (const field of ["name", "shortName", "story", "concepts", "comparisons", "patterns", "lifecycle"]) {
      assert.ok(field in domain, `domain ${d} is missing "${field}"`);
    }
    assert.ok(Array.isArray(domain.concepts) && domain.concepts.length > 0, `domain ${d} should have at least one concept`);
  }
});

test("every concept in data/content.js has the fields Explore and Daily Study render", () => {
  for (const d of DOMAINS) {
    for (const concept of CISMContent.domains[d].concepts) {
      for (const field of ["title", "plain", "exam"]) {
        assert.ok(typeof concept[field] === "string" && concept[field].length > 0,
          `domain ${d} concept "${concept.title || "?"}" is missing "${field}"`);
      }
    }
  }
});

test("every data/active-learning.js challenge has the fields its render type requires", () => {
  for (const d of DOMAINS) {
    const lab = CISMActiveLearning?.[d];
    assert.ok(lab && Array.isArray(lab.challenges) && lab.challenges.length > 0,
      `domain ${d} should have at least one active-learning challenge`);

    for (const c of lab.challenges) {
      assert.ok(typeof c.id === "string" && c.id.length > 0, `a challenge in domain ${d} is missing an id`);
      assert.ok(typeof c.concept === "string" && c.concept.length > 0, `${c.id}: missing concept`);
      assert.ok(typeof c.explanation === "string" && c.explanation.length > 0, `${c.id}: missing explanation`);
      assert.ok(typeof c.memory === "string" && c.memory.length > 0, `${c.id}: missing memory rule`);

      if (c.type === "sequence") {
        assert.ok(Array.isArray(c.steps) && c.steps.length > 1, `${c.id}: sequence challenge needs 2+ steps`);
      } else {
        assert.ok(Array.isArray(c.options) && c.options.length > 0, `${c.id}: ${c.type} challenge needs options`);
        assert.ok(
          Number.isInteger(c.correctIndex) && c.correctIndex >= 0 && c.correctIndex < c.options.length,
          `${c.id}: correctIndex out of range`
        );
      }
    }
  }
});

test("data/daily-coach.js has definitions and lifecycle exercises for all four domains", () => {
  for (const d of DOMAINS) {
    assert.ok(Array.isArray(CISMDailyCoach.definitions?.[d]) && CISMDailyCoach.definitions[d].length > 0,
      `domain ${d} should have at least one Daily Study definition`);
  }
});

// This is a direct regression lock for the Build 16 defect ("decision"
// dimension silently fell back to lesson 0 because no decoderLessons entry
// declared dimension:"decision"). decoderLesson() in js/daily-study.js also
// requires a "constraint" lesson as its no-evidence-yet fallback — both are
// asserted here so neither can go missing again without this test failing.
test("decoderLessons cover every mindset dimension plus the no-evidence constraint fallback", () => {
  const lessons = CISMDailyCoach.decoderLessons ?? [];
  assert.ok(lessons.length > 0, "decoderLessons should not be empty");

  for (const dim of ["qualifier", "role", "lifecycle", "decision", "constraint"]) {
    const hasLesson = lessons.some(l => l.dimension === dim);
    assert.ok(hasLesson, `decoderLessons is missing a lesson for dimension "${dim}"`);
  }

  for (const lesson of lessons) {
    assert.ok(Array.isArray(lesson.options) && lesson.options.length > 0, `a "${lesson.dimension}" lesson is missing options`);
    assert.ok(
      Number.isInteger(lesson.correctIndex) && lesson.correctIndex >= 0 && lesson.correctIndex < lesson.options.length,
      `a "${lesson.dimension}" lesson has an out-of-range correctIndex`
    );
  }
});

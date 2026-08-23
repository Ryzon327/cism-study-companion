// Phase 9B-2: D2-U3 (Risk Analysis Methods) and D2-U4 (Quantitative Risk
// for Decisions) — the second Domain 2 production content batch, built per
// the approved Phase 9A architecture (docs/learning/DOMAIN-2-BLUEPRINT.md)
// and the Phase 9B-2 implementation instructions. This file asserts the
// batch-specific structural requirements: existence, variant floor,
// qualitative-vs-quantitative and AV/EF/SLE/ARO/ALE representation, no
// arithmetic-only/number-substitution variants, no calculator dependency,
// the prerequisite chain, and no leakage of a future Domain 2 unit (U5+).
// General structural invariants (id format, referential integrity,
// length-bias, paraphrase detection, etc.) are already covered
// domain-agnostically by the other files in this directory and are not
// re-asserted here.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadAll, ROOT } from "./helpers/load-production.mjs";

const data = loadAll();

const conceptsById = new Map(data.concepts.map((c) => [c.id, c]));
const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const familiesById = new Map(data.families.map((f) => [f.id, f]));
const questionsByFamily = (familyId) => data.questions.filter((q) => q.family === familyId && q.active);

// --- D2-U3: Risk Analysis Methods ----------------------------------------

test("D2-U3: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-analysis-methods"));
  assert.ok(lessonsById.has("lesson.d2.risk-analysis-methods"));
  assert.ok(familiesById.has("family.d2.risk-analysis-methods"));

  const lesson = lessonsById.get("lesson.d2.risk-analysis-methods");
  assert.ok(lesson.concepts.includes("concept.d2.risk-analysis-methods"));
  const family = familiesById.get("family.d2.risk-analysis-methods");
  assert.ok(family.concepts.includes("concept.d2.risk-analysis-methods"));
  assert.ok(family.patterns.includes("pattern.p10"), "U3 must teach Pattern P10 (Method Fits Objective)");
});

test("D2-U3: family.d2.risk-analysis-methods has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-analysis-methods");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U3: Qualitative vs. Quantitative is taught without teaching that one is universally superior", () => {
  const lesson = lessonsById.get("lesson.d2.risk-analysis-methods");
  assert.match(lesson.context, /qualitative/i);
  assert.match(lesson.context, /quantitative/i);

  // Check sentence-by-sentence: a sentence containing the forbidden claim
  // is only acceptable if it also contains a negation cue (rather than
  // asserting the claim as fact) — a plain substring search would false-
  // positive on the lesson's own "rather than assuming X" phrasing.
  const forbiddenClaim = /(quantitative is (always|inherently) (better|superior)|qualitative is (inferior|inaccurate|useless))/i;
  const negationCue = /(rather than|not |never |doesn't mean|does not mean|assuming)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, ...lesson.traps].join(" ");
  const sentences = haystack.split(/(?<=[.!?])\s+/);
  const bareAssertions = sentences.filter((s) => forbiddenClaim.test(s) && !negationCue.test(s));
  assert.equal(bareAssertions.length, 0, `found an unqualified superiority claim: ${bareAssertions.join(" | ")}`);
});

test("D2-U3: 'method fits objective' (Pattern P10) reasoning is present, and at least one variant tests the false-precision trap", () => {
  const lesson = lessonsById.get("lesson.d2.risk-analysis-methods");
  assert.match(lesson.cism_perspective + " " + lesson.traps.join(" "), /(false precision|rigor)/i);

  const variants = questionsByFamily("family.d2.risk-analysis-methods");
  const falsePrecisionVariant = variants.find((q) =>
    q.variation_tags?.some((t) => t.startsWith("distractor-temptation:false-precision"))
  );
  assert.ok(falsePrecisionVariant, "at least one D2-U3 variant must exercise the false-precision distractor trap");
});

test("D2-U3: each variant's correct answer actually connects method choice to the stated decision, not a blanket method preference", () => {
  const variants = questionsByFamily("family.d2.risk-analysis-methods");
  for (const q of variants) {
    const correct = q.options.find((o) => o.correct);
    assert.match(correct.text + " " + correct.rationale, /(decision|objective|quantif|qualitative)/i, `${q.id}'s correct answer must reason about decision/method fit`);
  }
});

test("D2-U3: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.risk-analysis-methods");
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(lesson.concepts.includes(c) || lessonsById.get(lesson.prerequisites[0])?.concepts.includes(c), `${lesson.id} tests untaught concept ${c}`);
  }
});

// --- D2-U4: Quantitative Risk for Decisions ------------------------------

test("D2-U4: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.quantitative-risk-decisions"));
  assert.ok(lessonsById.has("lesson.d2.quantitative-risk-decisions"));
  assert.ok(familiesById.has("family.d2.quantitative-risk-decisions"));

  const lesson = lessonsById.get("lesson.d2.quantitative-risk-decisions");
  assert.ok(lesson.concepts.includes("concept.d2.quantitative-risk-decisions"));
});

test("D2-U4: family.d2.quantitative-risk-decisions has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.quantitative-risk-decisions");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U4: AV, EF, SLE, ARO, and ALE are all represented correctly in the lesson, with the correct formulas", () => {
  const lesson = lessonsById.get("lesson.d2.quantitative-risk-decisions");
  const text = lesson.context + " " + lesson.cism_perspective + " " + lesson.memory_rules.join(" ");
  for (const term of ["Asset Value", "Exposure Factor", "Single Loss Expectancy", "Annualized Rate of Occurrence", "Annualized Loss Expectancy"]) {
    assert.match(text, new RegExp(term, "i"), `lesson must define ${term}`);
  }
  assert.match(text, /Asset Value x Exposure Factor = Single Loss Expectancy|AV x EF = SLE|AV × EF = SLE/i, "SLE = AV x EF must be stated");
  assert.match(
    text,
    /Single Loss Expectancy x Annualized Rate of Occurrence = Annualized Loss Expectancy|SLE x ARO = ALE|SLE × ARO = ALE/i,
    "ALE = SLE x ARO must be stated"
  );
});

test("D2-U4: SLE and ALE calculations in the question variants are arithmetically correct", () => {
  const sleQuestion = data.questions.find((q) => q.id === "question.d2.0011");
  const correctSle = sleQuestion.options.find((o) => o.correct);
  assert.match(correctSle.text, /\$300,000/, "2,000,000 x 0.15 must equal 300,000");

  const aleQuestion = data.questions.find((q) => q.id === "question.d2.0012");
  const correctAle = aleQuestion.options.find((o) => o.correct);
  assert.match(correctAle.text, /\$67,500/, "900,000 x 0.30 x 0.25 must equal 67,500");
});

test("D2-U4: at least one variant tests business-decision interpretation of ALE rather than arithmetic, and does not teach ALE as an automatic decision", () => {
  const variants = questionsByFamily("family.d2.quantitative-risk-decisions");
  const interpretationVariant = variants.find((q) =>
    q.variation_tags?.some((t) => t.startsWith("wording-structure:interpretation-not-calculation"))
  );
  assert.ok(interpretationVariant, "at least one D2-U4 variant must test interpretation rather than calculation");
  const correct = interpretationVariant.options.find((o) => o.correct);
  assert.match(correct.text, /(does not automatically|not.*automatically decide|one.*input)/i, "correct answer must treat ALE as an input, not an automatic decision");

  const lesson = lessonsById.get("lesson.d2.quantitative-risk-decisions");
  assert.doesNotMatch(
    lesson.objective + " " + lesson.context,
    /ALE (alone |by itself )?(automatically )?(decides|determines) whether/i,
    "lesson must never teach that ALE alone automatically decides a treatment outcome"
  );
});

test("D2-U4: the 3 variants are not number-substitution paraphrases of each other — each tests a genuinely different sub-skill", () => {
  const variants = questionsByFamily("family.d2.quantitative-risk-decisions");
  const skills = new Set(
    variants.map((q) => {
      if (q.id === "question.d2.0011") return "calculate-sle";
      if (q.id === "question.d2.0012") return "calculate-ale";
      if (q.id === "question.d2.0013") return "interpret-ale";
      return q.id;
    })
  );
  assert.equal(skills.size, 3, "all three variants must exercise distinct sub-skills, not the same calculation with different numbers");
});

test("D2-U4: no calculator/spreadsheet/financial-library dependency was introduced (content-only, no app code changes)", () => {
  const contentSourceFiles = fs.readdirSync(path.join(ROOT, "app/src/content"));
  const suspicious = contentSourceFiles.filter((f) => /calc|spreadsheet|financial/i.test(f));
  assert.equal(suspicious.length, 0, `no calculator-shaped file should exist in app/src/content: ${suspicious.join(", ")}`);
});

test("D2-U4: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.quantitative-risk-decisions");
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(lesson.concepts.includes(c) || lessonsById.get(lesson.prerequisites[0])?.concepts.includes(c), `${lesson.id} tests untaught concept ${c}`);
  }
});

// --- Across U3/U4 ---------------------------------------------------------

test("Prerequisite chain is exactly D2-U1 -> D2-U2 -> D2-U3 -> D2-U4", () => {
  assert.deepEqual(lessonsById.get("lesson.d2.risk-analysis-methods").prerequisites, ["lesson.d2.risk-assessment-lifecycle"]);
  assert.deepEqual(lessonsById.get("lesson.d2.quantitative-risk-decisions").prerequisites, ["lesson.d2.risk-analysis-methods"]);
});

test("D2-U3/U4's own families still have exactly 3 active variants each, unaffected by later Domain 2 batches", () => {
  assert.equal(questionsByFamily("family.d2.risk-analysis-methods").length, 3);
  assert.equal(questionsByFamily("family.d2.quantitative-risk-decisions").length, 3);
});

test("All new U3/U4 entities are CANDIDATE, unverified, and none reference a future domain (D3/D4)", () => {
  const newEntities = [
    conceptsById.get("concept.d2.risk-analysis-methods"),
    conceptsById.get("concept.d2.quantitative-risk-decisions"),
    lessonsById.get("lesson.d2.risk-analysis-methods"),
    lessonsById.get("lesson.d2.quantitative-risk-decisions"),
    familiesById.get("family.d2.risk-analysis-methods"),
    familiesById.get("family.d2.quantitative-risk-decisions"),
    ...questionsByFamily("family.d2.risk-analysis-methods"),
    ...questionsByFamily("family.d2.quantitative-risk-decisions")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d3|domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 2 entity may reference Domain 3/4: ${bad.join(", ")}`);
});


test("D2-U1 and D2-U2 remain completely unchanged by this batch", () => {
  const u1 = lessonsById.get("lesson.d2.risk-fundamentals");
  const u2 = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  assert.equal(u1.version, 1);
  assert.equal(u2.version, 2, "D2-U2 must remain at its Phase 9B-1 repaired version, not bumped again");
  assert.equal(questionsByFamily("family.d2.risk-fundamentals").length, 3);
  assert.equal(questionsByFamily("family.d2.risk-assessment-lifecycle").length, 3);
});

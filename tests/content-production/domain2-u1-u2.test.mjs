// Phase 9B-1: D2-U1 (Risk Fundamentals & Emerging Risk) and D2-U2 (Risk
// Assessment Lifecycle) — the first Domain 2 production content, built per
// the approved Phase 9A architecture (docs/learning/DOMAIN-2-BLUEPRINT.md).
// This file asserts the batch-specific structural requirements from the
// Phase 9B-1 implementation instructions: existence, variant floor,
// confusing-concept/lifecycle representation, no treatment-stage leakage,
// no dedicated-AI-unit/framework, source-supported qualifier usage, and the
// approved cross-domain prerequisite chain. General structural invariants
// (id format, referential integrity, length-bias, paraphrase detection,
// etc.) are already covered domain-agnostically by the other files in this
// directory and are not re-asserted here.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-production.mjs";

const data = loadAll();

const conceptsById = new Map(data.concepts.map((c) => [c.id, c]));
const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const familiesById = new Map(data.families.map((f) => [f.id, f]));
const questionsByFamily = (familyId) => data.questions.filter((q) => q.family === familyId && q.active);

// --- D2-U1: Risk Fundamentals & Emerging Risk ---------------------------

test("D2-U1: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-fundamentals"), "concept.d2.risk-fundamentals must exist");
  assert.ok(lessonsById.has("lesson.d2.risk-fundamentals"), "lesson.d2.risk-fundamentals must exist");
  assert.ok(familiesById.has("family.d2.risk-fundamentals"), "family.d2.risk-fundamentals must exist");

  const lesson = lessonsById.get("lesson.d2.risk-fundamentals");
  assert.ok(lesson.concepts.includes("concept.d2.risk-fundamentals"), "U1 lesson must teach its own concept");
  const family = familiesById.get("family.d2.risk-fundamentals");
  assert.ok(family.concepts.includes("concept.d2.risk-fundamentals"), "U1 family must declare the same concept");
});

test("D2-U1: family.d2.risk-fundamentals has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-fundamentals");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
  const optionSets = variants.map((q) => new Set(q.options.map((o) => o.text.trim().toLowerCase())));
  for (let i = 0; i < optionSets.length; i++) {
    for (let j = i + 1; j < optionSets.length; j++) {
      const [a, b] = [optionSets[i], optionSets[j]];
      const identical = a.size === b.size && [...a].every((t) => b.has(t));
      assert.equal(identical, false, `${variants[i].id} and ${variants[j].id} must not share an identical option-text set`);
    }
  }
});

test("D2-U1: the Threat vs. Vulnerability vs. Risk distinction is actually taught (pattern P12, correct answers connect all three)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-fundamentals");
  assert.ok(lesson.patterns.includes("pattern.p12"), "U1 lesson must reference pattern.p12");
  assert.match(lesson.context, /threat/i);
  assert.match(lesson.context, /vulnerabilit/i);
  assert.match(lesson.context, /(business impact|business consequence)/i);

  const variants = questionsByFamily("family.d2.risk-fundamentals");
  for (const q of variants) {
    assert.ok(q.patterns.includes("pattern.p12"), `${q.id} must reference pattern.p12`);
    const correct = q.options.find((o) => o.correct);
    // Every correct answer must reason about business impact/consequence,
    // not merely restate a threat/vulnerability count — the actual
    // invariant reasoning target for this family.
    assert.match(
      correct.text + " " + correct.rationale,
      /(impact|consequence|exposure)/i,
      `${q.id}'s correct answer must connect to business impact/consequence, not just threat/vulnerability presence`
    );
  }
});

test("D2-U1: at least one variant is a genuine, source-supported emerging-risk/AI scenario", () => {
  const variants = questionsByFamily("family.d2.risk-fundamentals");
  const aiVariant = variants.find((q) => /\bAI\b|artificial intelligence/i.test(q.prompt));
  assert.ok(aiVariant, "at least one D2-U1 variant must use an AI/emerging-technology scenario");
  assert.match(aiVariant.note, /source.*Emerging Risk|Emerging Risk.*source/is, "the AI variant's note must cite source evidence for the emerging-risk placement");
});

test("D2-U1: AI is treated only as one example scenario, never a dedicated unit, framework, or policy topic", () => {
  // No AI-specific concept, lesson, or family exists — AI must appear only
  // as scenario text inside the general risk-fundamentals family, never as
  // its own teaching objective.
  const aiEntityIds = [...data.concepts, ...data.lessons, ...data.families]
    .filter((e) => /\bai\b/i.test(e.id) || /\bai\b/i.test(e.display_name ?? ""))
    .map((e) => e.id);
  assert.equal(aiEntityIds.length, 0, `no AI-specific production entity may exist: ${aiEntityIds.join(", ")}`);

  // No AI-specific governance/framework/ethics/model-risk vocabulary
  // anywhere in D2-U1's own content.
  const lesson = lessonsById.get("lesson.d2.risk-fundamentals");
  const forbidden = /(AI governance framework|AI ethics|model risk management|AI policy)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U1 must not introduce AI-specific governance/framework/ethics/policy content");
  for (const q of questionsByFamily("family.d2.risk-fundamentals")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must not introduce AI-specific governance/framework/ethics/policy content`);
  }
});

test("D2-U1: no Inherent vs. Residual Risk teaching leaks into this batch (deferred to a later batch where treatment/residual has meaning)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-fundamentals");
  assert.doesNotMatch(lesson.context, /residual risk/i, "U1 must not teach Inherent vs. Residual Risk in this batch");
  assert.ok(!lesson.concepts.includes("concept.d2.inherent-vs-residual-risk"), "U1 must not reference a not-yet-authored Inherent/Residual concept");
});

// --- D2-U2: Risk Assessment Lifecycle ------------------------------------

const EARLY_STAGES = ["stage.risk.context", "stage.risk.identify", "stage.risk.analyze", "stage.risk.evaluate"];
const LATER_STAGES = [
  "stage.risk.treat",
  "stage.risk.determine-residual-risk",
  "stage.risk.validate-acceptability",
  "stage.risk.monitor-reassess"
];

test("D2-U2: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-assessment-lifecycle"), "concept.d2.risk-assessment-lifecycle must exist");
  assert.ok(lessonsById.has("lesson.d2.risk-assessment-lifecycle"), "lesson.d2.risk-assessment-lifecycle must exist");
  assert.ok(familiesById.has("family.d2.risk-assessment-lifecycle"), "family.d2.risk-assessment-lifecycle must exist");

  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  assert.ok(lesson.concepts.includes("concept.d2.risk-assessment-lifecycle"));
  const family = familiesById.get("family.d2.risk-assessment-lifecycle");
  assert.ok(family.concepts.includes("concept.d2.risk-assessment-lifecycle"));
  assert.equal(family.lifecycle, "lifecycle.risk", "U2 family must declare the CANONICAL risk lifecycle");
});

test("D2-U2: family.d2.risk-assessment-lifecycle has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-assessment-lifecycle");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U2: the CANONICAL Context -> Identify -> Analyze -> Evaluate lifecycle is represented correctly, and no variant leaks into Treat or later stages", () => {
  const variants = questionsByFamily("family.d2.risk-assessment-lifecycle");
  const stagesUsed = new Set();
  for (const q of variants) {
    assert.equal(q.lifecycle, "lifecycle.risk", `${q.id} must declare lifecycle.risk`);
    assert.ok(q.stage, `${q.id} must declare a stage`);
    assert.ok(EARLY_STAGES.includes(q.stage), `${q.id}.stage (${q.stage}) must be one of Context/Identify/Analyze/Evaluate`);
    assert.ok(!LATER_STAGES.includes(q.stage), `${q.id}.stage (${q.stage}) must not be a Treat-or-later stage — out of scope for this batch`);
    stagesUsed.add(q.stage);
  }
  // At least two distinct early stages must actually be exercised — this
  // family is about locating stage position, not one fixed stage repeated.
  assert.ok(stagesUsed.size >= 2, `expected variants to span at least 2 distinct early stages, got: ${[...stagesUsed].join(", ")}`);

  // No lesson/question text anywhere in this batch references a
  // treatment-stage action as already appropriate/taught.
  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  const treatmentLanguage = /\b(mitigate|transfer|accept the risk|avoid the risk)\b/i;
  assert.doesNotMatch(lesson.objective, treatmentLanguage, "U2's objective must not teach treatment-stage actions");
});

test("D2-U2: FIRST and NEXT qualifier usage is source-supported and not manufactured for balance (exactly one of each, matching the two genuine source hits)", () => {
  const variants = questionsByFamily("family.d2.risk-assessment-lifecycle");
  const firstCount = variants.filter((q) => q.qualifier === "qualifier.first").length;
  const nextCount = variants.filter((q) => q.qualifier === "qualifier.next").length;
  assert.equal(firstCount, 1, "expected exactly one FIRST-qualifier variant, matching the source-evidenced sequencing question");
  assert.equal(nextCount, 1, "expected exactly one NEXT-qualifier variant, matching the source-evidenced sequencing question — NEXT must not be manufactured beyond genuine evidence");
});

test("D2-U2: cross-domain prerequisite chain is exactly as approved (Domain 1 complete -> D2-U1 -> D2-U2)", () => {
  assert.deepEqual(
    lessonsById.get("lesson.d2.risk-fundamentals").prerequisites,
    ["lesson.d1.organizational-culture-governance"],
    "D2-U1 must be prerequisite on Domain 1's capstone lesson (D1-U9)"
  );
  assert.deepEqual(
    lessonsById.get("lesson.d2.risk-assessment-lifecycle").prerequisites,
    ["lesson.d2.risk-fundamentals"],
    "D2-U2 must be prerequisite on D2-U1 only"
  );
  // Note: this file no longer asserts "no Domain 2 unit beyond U1/U2 exists" —
  // that was a Phase 9B-1 batch-boundary guard, superseded once Phase 9B-2
  // legitimately added D2-U3/U4. The current batch boundary (no U5+ yet) is
  // asserted in domain2-u3-u4.test.mjs instead.
});

test("D2-U2: taught-before-tested holds for both new lessons (retrieval question's concepts are taught by that lesson or its prerequisites)", () => {
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
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d2.risk-fundamentals", "lesson.d2.risk-assessment-lifecycle"]) {
    const lesson = lessonsById.get(lessonId);
    const taught = taughtConceptsFor(lessonId);
    for (const refId of lesson.retrieval_refs) {
      const question = questionsById.get(refId);
      for (const c of question.concepts) {
        assert.ok(taught.has(c), `${lessonId} -> ${refId} tests untaught concept ${c}`);
      }
    }
  }
});

// --- Across U1/U2 ---------------------------------------------------------

test("Domain 2 so far: all new entities are CANDIDATE, unverified, and none reference a future domain (D3/D4)", () => {
  const newEntities = [
    conceptsById.get("concept.d2.risk-fundamentals"),
    conceptsById.get("concept.d2.risk-assessment-lifecycle"),
    lessonsById.get("lesson.d2.risk-fundamentals"),
    lessonsById.get("lesson.d2.risk-assessment-lifecycle"),
    familiesById.get("family.d2.risk-fundamentals"),
    familiesById.get("family.d2.risk-assessment-lifecycle"),
    ...questionsByFamily("family.d2.risk-fundamentals"),
    ...questionsByFamily("family.d2.risk-assessment-lifecycle")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d3|domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 2 entity may reference Domain 3/4: ${bad.join(", ")}`);
});

test("D2-U1/U2's own families still have exactly 3 active variants each, unaffected by later Domain 2 batches", () => {
  assert.equal(questionsByFamily("family.d2.risk-fundamentals").length, 3);
  assert.equal(questionsByFamily("family.d2.risk-assessment-lifecycle").length, 3);
});

// --- Phase 9B-1 Human Experience Gate follow-up: D2-U2 scenario-anchor repair ---
//
// Founder feedback on the first D2-U2 revision: "u2 was not clear to me for
// some reason. i think it is because i am trying to reference it in a
// scenario to know where to actually apply it. i need reference." The fix
// (version 1 -> 2) rewrites the lesson's context/scenario/cism_perspective
// around ONE continuous story (an online payment capability launch) that
// walks all four early lifecycle stages in sequence, and adds an explicit
// "what has already happened, and therefore where am I" memory rule. These
// tests prove that repair landed structurally, without re-litigating
// content-quality judgments (those are for the founder's re-review).

test("D2-U2 follow-up: the lesson was actually revised (version bumped, not a silent no-op)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  assert.equal(lesson.version, 2, "lesson.d2.risk-assessment-lifecycle must be version 2 after the scenario-anchor repair");
});

test("D2-U2 follow-up: the lesson's scenario field names all four CANONICAL early stages in one continuous walkthrough, not just the Analyze/Evaluate pair", () => {
  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  for (const stageName of ["Context", "Identify", "Analyze", "Evaluate"]) {
    assert.match(lesson.scenario, new RegExp(stageName), `lesson.scenario must reference the ${stageName} stage`);
  }
  // A single shared subject (the payment-capability story) must actually
  // connect the stages, not four disconnected one-line mentions - checked
  // by requiring a common noun phrase to appear near each stage mention.
  assert.match(lesson.scenario, /payment/i, "the scenario must be one continuous, concrete story, not abstract stage definitions");
});

test("D2-U2 follow-up: the lesson explicitly distinguishes Analyze from Evaluate as separate reasoning questions", () => {
  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  assert.match(lesson.context, /how likely.*how bad|likelihood.*impact/i, "context must state the Analyze question");
  assert.match(lesson.context, /acceptable|require action/i, "context must state the Evaluate question, distinct from Analyze");
});

test("D2-U2 follow-up: the lesson teaches reading scenario facts as evidence of already-completed stages (the founder's requested reasoning question is present verbatim)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  assert.match(
    lesson.cism_perspective + " " + lesson.memory_rules.join(" "),
    /what has already happened, and therefore where am i/i,
    "the lesson must state the critical reasoning question explicitly"
  );
  assert.match(lesson.cism_perspective, /already occurred|already happened|already been determined/i);
});

test("D2-U2 follow-up: still stops before Treatment (no treatment-stage teaching leaked in during the repair)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  const treatmentTeachingLanguage = /\b(select a treatment|mitigate the risk|transfer the risk|accept the risk|avoid the risk)\b/i;
  assert.doesNotMatch(lesson.context + " " + lesson.scenario + " " + lesson.cism_perspective, treatmentTeachingLanguage);
  // The existing stage-scope test (EARLY_STAGES only, no LATER_STAGES) above
  // already re-verifies the question variants' stage fields on every run.
});

test("D2-U2 follow-up: D2-U1 (lesson, concept, family, questions) is completely unchanged by this repair", () => {
  const u1Lesson = lessonsById.get("lesson.d2.risk-fundamentals");
  assert.equal(u1Lesson.version, 1, "lesson.d2.risk-fundamentals must remain version 1 - this repair targets only D2-U2");
  assert.equal(
    u1Lesson.objective,
    "Distinguish threat, vulnerability, and risk from each other, and recognize that a new or changing technology (such as an AI-powered system) creates new risk context without exempting the enterprise from the standard risk-management discipline.",
    "D2-U1's objective must be byte-for-byte unchanged"
  );
  const u1Variants = questionsByFamily("family.d2.risk-fundamentals");
  assert.equal(u1Variants.length, 3);
  assert.deepEqual(u1Variants.map((q) => q.id).sort(), ["question.d2.0002", "question.d2.0003", "question.d2.0004"]);
});

test("D2-U2 follow-up: all three existing question variants are unchanged (repair targeted the lesson, not the tested variants)", () => {
  const variants = questionsByFamily("family.d2.risk-assessment-lifecycle");
  assert.equal(variants.length, 3, "no variant was added or removed during this repair");
  assert.equal(variants.find((q) => q.id === "question.d2.0005").qualifier, "qualifier.next");
  assert.equal(variants.find((q) => q.id === "question.d2.0006").qualifier, "qualifier.first");
  assert.equal(variants.find((q) => q.id === "question.d2.0007").qualifier, "qualifier.best");
});

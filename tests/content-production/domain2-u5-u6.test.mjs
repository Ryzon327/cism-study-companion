// Phase 9B-3: D2-U5 (Risk Evaluation) and D2-U6 (Risk Treatment / Response
// Selection) — the third Domain 2 production content batch, built per the
// approved Phase 9A architecture (docs/learning/DOMAIN-2-BLUEPRINT.md) and
// the Phase 9B-3 implementation instructions. This file asserts the
// batch-specific structural requirements: existence, variant floor,
// Analyze-vs-Evaluate and Appetite-vs-Tolerance framing, decision-authority
// correctness, the four treatment options taught correctly (transfer does
// not eliminate accountability, acceptance requires authorization), the
// prerequisite chain (U5 branches off U2, not U3/U4), and no leakage of a
// future Domain 2 unit (U7+). General structural invariants (id format,
// referential integrity, length-bias, paraphrase detection, etc.) are
// already covered domain-agnostically by the other files in this
// directory and are not re-asserted here.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-production.mjs";

const data = loadAll();

const conceptsById = new Map(data.concepts.map((c) => [c.id, c]));
const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const familiesById = new Map(data.families.map((f) => [f.id, f]));
const questionsById = new Map(data.questions.map((q) => [q.id, q]));
const questionsByFamily = (familyId) => data.questions.filter((q) => q.family === familyId && q.active);

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

// --- D2-U5: Risk Evaluation ------------------------------------------------

test("D2-U5: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-evaluation"));
  assert.ok(lessonsById.has("lesson.d2.risk-evaluation"));
  assert.ok(familiesById.has("family.d2.risk-evaluation"));

  const lesson = lessonsById.get("lesson.d2.risk-evaluation");
  assert.ok(lesson.concepts.includes("concept.d2.risk-evaluation"));
  const family = familiesById.get("family.d2.risk-evaluation");
  assert.ok(family.patterns.includes("pattern.p02"), "U5 must teach Pattern P02 (Authority Follows Accountability)");
});

test("D2-U5: family.d2.risk-evaluation has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-evaluation");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U5: Analysis vs. Evaluation is explicitly distinguished", () => {
  const lesson = lessonsById.get("lesson.d2.risk-evaluation");
  assert.match(lesson.context + " " + lesson.memory_rules.join(" "), /analysis.*(tells|looks like)/i);
  assert.match(lesson.context + " " + lesson.memory_rules.join(" "), /evaluation.*(tells|means)/i);
});

test("D2-U5: Risk Appetite vs. Risk Tolerance is taught without collapsing them into identical thresholds", () => {
  const lesson = lessonsById.get("lesson.d2.risk-evaluation");
  assert.match(lesson.context, /appetite/i);
  assert.match(lesson.context, /tolerance/i);
  assert.doesNotMatch(lesson.context, /appetite (is|means) (the same as|identical to|equal to) tolerance/i);

  const variants = questionsByFamily("family.d2.risk-evaluation");
  const appetiteToleranceVariant = variants.find((q) => /appetite/i.test(q.prompt) && /tolerance/i.test(q.prompt));
  assert.ok(appetiteToleranceVariant, "at least one D2-U5 variant must directly exercise the appetite-vs-tolerance distinction");
});

test("D2-U5: evaluation against organizational criteria is taught, and the family does not teach a fixed decision-authority hierarchy", () => {
  const lesson = lessonsById.get("lesson.d2.risk-evaluation");
  assert.match(lesson.context, /criteria/i);

  // Sentence-level check: a sentence naming "always decides/accepts/approves"
  // is only a violation if it asserts the claim as fact, not when it's
  // framed as the trap to avoid (e.g. "Assuming X always decides...").
  const forbiddenClaim = /((CISO|board|security manager).{0,20}always (decides|accepts|approves)|always (decides|accepts|approves).{0,20}(CISO|board|security manager))/i;
  const negationCue = /(assuming|rather than|not |never |doesn't mean|does not mean)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, ...lesson.traps].join(" ");
  const sentences = haystack.split(/(?<=[.!?])\s+/);
  const bareAssertions = sentences.filter((s) => forbiddenClaim.test(s) && !negationCue.test(s));
  assert.equal(bareAssertions.length, 0, `found an unqualified fixed-authority claim: ${bareAssertions.join(" | ")}`);
});

test("D2-U5: at least one variant tests that a named-role decision-maker (e.g. the security manager) is not automatically the correct acceptability authority", () => {
  const variants = questionsByFamily("family.d2.risk-evaluation");
  const authorityVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && o.repair_target === "repair.authority-error")
  );
  assert.ok(authorityVariant, "at least one D2-U5 variant must exercise an authority-error distractor");
});

test("D2-U5: does not teach treatment-stage content in place of evaluation (no variant's stage is Treat or later)", () => {
  const EARLY_OR_EVAL_STAGES = ["stage.risk.context", "stage.risk.identify", "stage.risk.analyze", "stage.risk.evaluate"];
  const variants = questionsByFamily("family.d2.risk-evaluation");
  for (const q of variants) {
    assert.ok(EARLY_OR_EVAL_STAGES.includes(q.stage), `${q.id}.stage (${q.stage}) must not be Treat or later`);
  }
});

test("D2-U5: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.risk-evaluation");
  const taught = taughtConceptsFor(lesson.id);
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(taught.has(c), `${lesson.id} -> ${question.id} tests untaught concept ${c}`);
  }
});

test("D2-U5: all entities are CANDIDATE and unverified", () => {
  const entities = [
    conceptsById.get("concept.d2.risk-evaluation"),
    lessonsById.get("lesson.d2.risk-evaluation"),
    familiesById.get("family.d2.risk-evaluation"),
    ...questionsByFamily("family.d2.risk-evaluation")
  ];
  for (const e of entities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
});

// --- D2-U6: Risk Treatment / Response Selection ---------------------------

test("D2-U6: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-treatment-response"));
  assert.ok(lessonsById.has("lesson.d2.risk-treatment-response"));
  assert.ok(familiesById.has("family.d2.risk-treatment-response"));

  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  assert.ok(lesson.concepts.includes("concept.d2.risk-treatment-response"));
  const family = familiesById.get("family.d2.risk-treatment-response");
  assert.ok(family.patterns.includes("pattern.p01"), "U6 must teach Pattern P01 (Business Alignment)");
});

test("D2-U6: family.d2.risk-treatment-response has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-treatment-response");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U6: Avoid, Mitigate, Transfer/Share, and Accept are all defined correctly in the lesson", () => {
  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  const text = lesson.context;
  assert.match(text, /Avoid means stopping/i);
  assert.match(text, /Mitigate means reducing/i);
  assert.match(text, /Transfer\/share means shifting/i);
  assert.match(text, /Accept means/i);
});

test("D2-U6: transfer is explicitly taught as NOT eliminating organizational accountability", () => {
  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  assert.match(lesson.context, /transfer.*(does not|doesn't) (transfer|eliminate).*accountability|does not transfer the organization's own accountability/i);

  const variants = questionsByFamily("family.d2.risk-treatment-response");
  const transferVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /no longer accountable|eliminates? (accountability|responsibility)/i.test(o.text))
  );
  assert.ok(transferVariant, "at least one D2-U6 variant must exercise the transfer-eliminates-accountability trap");
  const correct = transferVariant.options.find((o) => o.correct);
  assert.match(correct.text, /remains accountable|accountable for the underlying risk/i);
});

test("D2-U6: acceptance is taught as a knowing, authorized decision, never passive/unauthorized inaction", () => {
  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  assert.match(lesson.context, /knowing, authorized decision/i);
  assert.doesNotMatch(lesson.context, /acceptance (is|means) doing nothing/i);

  const variants = questionsByFamily("family.d2.risk-treatment-response");
  const acceptanceVariant = variants.find((q) => /accept/i.test(q.prompt) && /authority|authorized/i.test(q.prompt + " " + q.options.map((o) => o.text).join(" ")));
  assert.ok(acceptanceVariant, "at least one D2-U6 variant must test authorized vs. unauthorized acceptance");
  const correct = acceptanceVariant.options.find((o) => o.correct);
  assert.match(correct.text, /authoriz|accountable/i);
});

test("D2-U6: treatment selection is driven by business context, not a strongest-control or cheapest-option default", () => {
  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  const forbidden = /(mitigation is always preferred|strongest control is always best|cheapest option is always best)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective].join(" ");
  assert.doesNotMatch(haystack, forbidden);

  const variants = questionsByFamily("family.d2.risk-treatment-response");
  const strongestControlTrap = variants.find((q) =>
    q.options.some((o) => !o.correct && /most comprehensive|regardless of.*cost/i.test(o.text))
  );
  assert.ok(strongestControlTrap, "at least one D2-U6 variant must exercise the strongest-control-bias trap");
});

test("D2-U6: no variant's treatment name is a giveaway independent of the scenario (each option requires reading business context)", () => {
  const variants = questionsByFamily("family.d2.risk-treatment-response");
  for (const q of variants) {
    // The four treatment-option nouns should not appear as bare, undecorated
    // labels in the option text — every option must be a scenario-specific
    // action/claim, not a one-word vocabulary pick.
    for (const opt of q.options) {
      assert.ok(opt.text.trim().split(/\s+/).length > 4, `${q.id} option ${opt.key} is too short to be scenario-driven: "${opt.text}"`);
    }
  }
});

test("D2-U6: treatment does not precede evaluation (no variant's stage is earlier than Treat)", () => {
  const variants = questionsByFamily("family.d2.risk-treatment-response");
  for (const q of variants) {
    assert.equal(q.stage, "stage.risk.treat", `${q.id}.stage must be stage.risk.treat`);
  }
});

test("D2-U6: Domain 1 business-alignment recall is present and specific (not decorative)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  assert.match(lesson.context, /Domain 1|business.case|roadmap|business-alignment/i);
});

test("D2-U6: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.risk-treatment-response");
  const taught = taughtConceptsFor(lesson.id);
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(taught.has(c), `${lesson.id} -> ${question.id} tests untaught concept ${c}`);
  }
});

test("D2-U6: all entities are CANDIDATE and unverified", () => {
  const entities = [
    conceptsById.get("concept.d2.risk-treatment-response"),
    lessonsById.get("lesson.d2.risk-treatment-response"),
    familiesById.get("family.d2.risk-treatment-response"),
    ...questionsByFamily("family.d2.risk-treatment-response")
  ];
  for (const e of entities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
});

// --- Across U5/U6 ----------------------------------------------------------

test("Prerequisite chain: D2-U5 branches directly off D2-U2 (not U3/U4), and D2-U6 requires D2-U5", () => {
  assert.deepEqual(
    lessonsById.get("lesson.d2.risk-evaluation").prerequisites,
    ["lesson.d2.risk-assessment-lifecycle"],
    "D2-U5 must be prerequisite on D2-U2 only, per the approved Phase 9A branch (parallel to U3/U4, not chained through them)"
  );
  assert.deepEqual(lessonsById.get("lesson.d2.risk-treatment-response").prerequisites, ["lesson.d2.risk-evaluation"]);
});

test("D2-U5/U6's own families still have exactly 3 active variants each, unaffected by later Domain 2 batches", () => {
  assert.equal(questionsByFamily("family.d2.risk-evaluation").length, 3);
  assert.equal(questionsByFamily("family.d2.risk-treatment-response").length, 3);
});

test("D2-U1 through D2-U4 remain completely unchanged by this batch", () => {
  const u1 = lessonsById.get("lesson.d2.risk-fundamentals");
  const u2 = lessonsById.get("lesson.d2.risk-assessment-lifecycle");
  const u3 = lessonsById.get("lesson.d2.risk-analysis-methods");
  const u4 = lessonsById.get("lesson.d2.quantitative-risk-decisions");
  assert.equal(u1.version, 1);
  assert.equal(u2.version, 2, "D2-U2 must remain at its Phase 9B-1 repaired version");
  assert.equal(u3.version, 1);
  assert.equal(u4.version, 1);
  assert.equal(questionsByFamily("family.d2.risk-fundamentals").length, 3);
  assert.equal(questionsByFamily("family.d2.risk-assessment-lifecycle").length, 3);
  assert.equal(questionsByFamily("family.d2.risk-analysis-methods").length, 3);
  assert.equal(questionsByFamily("family.d2.quantitative-risk-decisions").length, 3);
});

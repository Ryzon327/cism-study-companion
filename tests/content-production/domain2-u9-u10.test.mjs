// Phase 9B-5: D2-U9 (Risk Monitoring, Reassessment & Reporting) and D2-U10
// (Embedding Risk Management Into the Business + Domain 2 Synthesis/
// Capstone) — the fifth and final Domain 2 production content batch, built
// per the approved Phase 9A architecture (docs/learning/DOMAIN-2-BLUEPRINT.md)
// and the Phase 9B-4 founder-approved Domain Synthesis / Capstone principle
// (docs/learning/CURRICULUM-BLUEPRINT.md). This file asserts the
// batch-specific structural requirements: existence, variant floor,
// monitor-vs-reassess distinction, reassessment-trigger recognition,
// accepted-risk-not-permanently-closed, audience-appropriate/decision-useful
// reporting, activity-vs-outcome effectiveness measurement, the approved
// non-adjacent U9-recalls-U1 wiring, D2-U10's synthesis/capstone role and
// full connective chain, the payment-system reference model plus varied-
// scenario transfer, business embedding, integrated multi-concept practice,
// the updated U9/U10 prerequisite graph, and no Domain 3 leakage. General
// structural invariants (id format, referential integrity, length-bias,
// paraphrase detection, etc.) are already covered domain-agnostically by
// the other files in this directory and are not re-asserted here.
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

// --- D2-U9: Risk Monitoring, Reassessment & Reporting ----------------------

test("D2-U9: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-monitoring-reporting"));
  assert.ok(lessonsById.has("lesson.d2.risk-monitoring-reporting"));
  assert.ok(familiesById.has("family.d2.risk-monitoring-reporting"));

  const lesson = lessonsById.get("lesson.d2.risk-monitoring-reporting");
  assert.ok(lesson.concepts.includes("concept.d2.risk-monitoring-reporting"));
  const family = familiesById.get("family.d2.risk-monitoring-reporting");
  assert.ok(family.patterns.includes("pattern.p11"), "U9 must teach Pattern P11 (Audience-Appropriate Communication)");
  assert.ok(family.patterns.includes("pattern.p15"), "U9 must teach Pattern P15 (Closing the Loop)");
  assert.ok(family.patterns.includes("pattern.p07"), "U9 must recall Pattern P07 (Implementation != Effectiveness)");
});

test("D2-U9: family.d2.risk-monitoring-reporting has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-monitoring-reporting");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U9: monitoring is distinguished from reassessment, not treated as the same act", () => {
  const lesson = lessonsById.get("lesson.d2.risk-monitoring-reporting");
  assert.match(lesson.context, /monitor/i);
  assert.match(lesson.context, /reassess/i);
  assert.match(lesson.memory_rules.join(" "), /monitor to detect meaningful change; reassess only once/i);
});

test("D2-U9: reassessment is taught as triggered by material change (or a scheduled review), not on every fluctuation and not only after an incident", () => {
  const lesson = lessonsById.get("lesson.d2.risk-monitoring-reporting");
  assert.match(lesson.context, /material change/i);
  const forbidden = /(reassess (everything|every risk) constantly|only reassess after an incident)/i;
  assert.doesNotMatch([lesson.objective, lesson.context].join(" "), forbidden);

  const variants = questionsByFamily("family.d2.risk-monitoring-reporting");
  const triggerVariant = variants.find((q) => q.options.some((o) => !o.correct && o.repair_target === "repair.lifecycle-error") || q.options.some((o) => !o.correct && o.repair_target === "repair.sequence-error"));
  assert.ok(triggerVariant, "at least one D2-U9 variant must exercise a reassessment-trigger-recognition distractor");
});

test("D2-U9: an accepted/validated risk is never taught as permanently closed", () => {
  const lesson = lessonsById.get("lesson.d2.risk-monitoring-reporting");
  const forbidden = /(accepted risk (is|becomes) permanently closed|acceptance (is|means) (a )?final(ly)? settled matter)/i;
  assert.doesNotMatch([lesson.objective, lesson.context, lesson.cism_perspective].join(" "), forbidden);

  const variants = questionsByFamily("family.d2.risk-monitoring-reporting");
  const closedRiskTrap = variants.find((q) =>
    q.options.some((o) => !o.correct && /(already formally validated as acceptable|no further action)/i.test(o.text))
  );
  assert.ok(closedRiskTrap, "at least one D2-U9 variant should exercise an accepted-risk-is-permanently-closed distractor");
});

test("D2-U9: reporting is taught as audience-appropriate and decision-useful, not activity/technical-detail volume", () => {
  const lesson = lessonsById.get("lesson.d2.risk-monitoring-reporting");
  assert.match(lesson.context, /decision-useful|decision-relevant/i);
  assert.match(lesson.memory_rules.join(" "), /report is only as good as the decision/i);

  const variants = questionsByFamily("family.d2.risk-monitoring-reporting");
  const reportingVariant = variants.find((q) => q.patterns.includes("pattern.p11"));
  assert.ok(reportingVariant, "at least one D2-U9 variant must exercise Pattern P11 (audience-appropriate reporting)");
  const technicalOrActivityDistractor = reportingVariant.options.some(
    (o) => !o.correct && (o.repair_target === "repair.technical-vs-management-error" || o.repair_target === "repair.business-context-error")
  );
  assert.ok(technicalOrActivityDistractor, "the reporting variant must offer a raw-technical or activity-count distractor");
});

test("D2-U9: risk-management effectiveness is measured by business outcomes, not activity counts (Domain 1 P07 transfer)", () => {
  const variants = questionsByFamily("family.d2.risk-monitoring-reporting");
  const effectivenessVariant = variants.find((q) => q.patterns.includes("pattern.p07"));
  assert.ok(effectivenessVariant, "at least one D2-U9 variant must exercise Pattern P07 (Implementation != Effectiveness)");
  const correct = effectivenessVariant.options.find((o) => o.correct);
  assert.match(correct.text, /incident|impact|loss|disruption/i, "the correct answer must reference business outcomes, not activity counts");
  const activityDistractors = effectivenessVariant.options.filter(
    (o) => !o.correct && /number of|count of/i.test(o.text)
  );
  assert.ok(activityDistractors.length >= 1, "at least one distractor must offer an activity count as a false effectiveness measure");
});

test("D2-U9: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.risk-monitoring-reporting");
  const taught = taughtConceptsFor(lesson.id);
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(taught.has(c), `${lesson.id} -> ${question.id} tests untaught concept ${c}`);
  }
});

test("D2-U9: all entities are CANDIDATE and unverified", () => {
  const entities = [
    conceptsById.get("concept.d2.risk-monitoring-reporting"),
    lessonsById.get("lesson.d2.risk-monitoring-reporting"),
    familiesById.get("family.d2.risk-monitoring-reporting"),
    ...questionsByFamily("family.d2.risk-monitoring-reporting")
  ];
  for (const e of entities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
});

// --- D2-U10: Embedding Risk Management + Domain 2 Synthesis/Capstone -------

test("D2-U10: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-management-embedding-synthesis"));
  assert.ok(lessonsById.has("lesson.d2.risk-management-embedding-synthesis"));
  assert.ok(familiesById.has("family.d2.risk-management-synthesis"));

  const lesson = lessonsById.get("lesson.d2.risk-management-embedding-synthesis");
  assert.ok(lesson.concepts.includes("concept.d2.risk-management-embedding-synthesis"));
  const family = familiesById.get("family.d2.risk-management-synthesis");
  assert.ok(family.patterns.includes("pattern.p09"), "U10 must teach Pattern P09 (Security Embedded in Business Process)");
  assert.ok(family.patterns.includes("pattern.p08"), "U10 must apply Pattern P08 (Risk-Driven Prioritization)");
});

test("D2-U10: the lesson's connective chain covers the full approved Domain 2 mental-model components", () => {
  const lesson = lessonsById.get("lesson.d2.risk-management-embedding-synthesis");
  const haystack = [lesson.context, lesson.scenario, lesson.cism_perspective].join(" ").toLowerCase();
  const requiredComponents = [
    "business context",
    "threat",
    "vulnerability",
    "context",
    "identify",
    "analyz",
    "evaluat",
    "method selection",
    "appetite",
    "tolerance",
    "treatment",
    "residual risk",
    "acceptab",
    "risk owner",
    "control owner",
    "monitor",
    "reassess",
    "report",
    "embed"
  ];
  const missing = requiredComponents.filter((term) => !haystack.includes(term));
  assert.equal(missing.length, 0, `D2-U10 must connect every required chain component; missing: ${missing.join(", ")}`);
});

test("D2-U10: the recurring payment-system reference model is present in the lesson", () => {
  const lesson = lessonsById.get("lesson.d2.risk-management-embedding-synthesis");
  assert.match(lesson.scenario, /payment.system/i, "D2-U10's scenario must walk the recurring payment-system reference model");
});

test("D2-U10: integrated practice includes at least one non-payment-system scenario, so the reference does not become the only story (reference + transfer)", () => {
  const variants = questionsByFamily("family.d2.risk-management-synthesis");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const paymentVariants = variants.filter((q) => /payment.system/i.test(q.prompt));
  const nonPaymentVariants = variants.filter((q) => !/payment.system/i.test(q.prompt));
  assert.ok(paymentVariants.length >= 1, "at least one variant must anchor to the payment-system reference model");
  assert.ok(nonPaymentVariants.length >= 1, "at least one variant must use a different business setting, for transfer");
  assert.ok(paymentVariants.length < variants.length, "the payment-system story must not be the only scenario used in this family");
});

test("D2-U10: business embedding is explicitly taught (risk management inside business decisions, disagreements escalated to accountable authority)", () => {
  const lesson = lessonsById.get("lesson.d2.risk-management-embedding-synthesis");
  assert.match(lesson.context, /embed/i);
  assert.match([lesson.context, ...lesson.traps].join(" "), /disagreement/i);
  assert.match(lesson.memory_rules.join(" "), /security that lives outside the business process gets bypassed by it/i);
});

test("D2-U10: does not quietly introduce a major new Domain 2 concept — every concept its variants reference is one of the ten approved Domain 2 concepts", () => {
  const approvedD2Concepts = new Set(
    [...conceptsById.values()].filter((c) => c.home_domain === "domain.d2").map((c) => c.id)
  );
  const variants = questionsByFamily("family.d2.risk-management-synthesis");
  const unknownConcepts = new Set();
  for (const q of variants) {
    for (const c of q.concepts) {
      if (!approvedD2Concepts.has(c)) unknownConcepts.add(c);
    }
  }
  assert.equal(unknownConcepts.size, 0, `D2-U10 must not reference a concept outside the approved Domain 2 set: ${[...unknownConcepts].join(", ")}`);
});

test("D2-U10: integrated questions combine more than one previously taught Domain 2 reasoning target, not a single-concept question", () => {
  const variants = questionsByFamily("family.d2.risk-management-synthesis");
  for (const q of variants) {
    assert.ok(
      q.concepts.length >= 2,
      `${q.id} must list at least 2 concepts (its own synthesis concept plus at least one integrated prior concept), got ${q.concepts.length}`
    );
    assert.ok(
      q.concepts.includes("concept.d2.risk-management-embedding-synthesis"),
      `${q.id} must include the synthesis concept itself`
    );
  }
});

test("D2-U10: the family is not a definition-only synthesis family — no variant merely asks to define or recap a term", () => {
  const variants = questionsByFamily("family.d2.risk-management-synthesis");
  const forbidden = /^(what is|define|which best defines)/i;
  for (const q of variants) {
    assert.doesNotMatch(q.prompt.trim(), forbidden, `${q.id}'s prompt reads as a definition-recap question, not an integrated scenario`);
  }
});

test("D2-U10: taught-before-tested holds for every concept every integrated variant references, not only the lesson's own retrieval anchor", () => {
  const lesson = lessonsById.get("lesson.d2.risk-management-embedding-synthesis");
  const taught = taughtConceptsFor(lesson.id);
  const variants = questionsByFamily("family.d2.risk-management-synthesis");
  for (const q of variants) {
    for (const c of q.concepts) {
      assert.ok(taught.has(c), `${lesson.id} -> ${q.id} tests untaught concept ${c}`);
    }
  }
});

test("D2-U10: all entities are CANDIDATE and unverified", () => {
  const entities = [
    conceptsById.get("concept.d2.risk-management-embedding-synthesis"),
    lessonsById.get("lesson.d2.risk-management-embedding-synthesis"),
    familiesById.get("family.d2.risk-management-synthesis"),
    ...questionsByFamily("family.d2.risk-management-synthesis")
  ];
  for (const e of entities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
});

// --- Architecture: U9/U10 prerequisite/recall wiring, no cycle, no leakage -

test("D2-U9 prerequisites realize the approved non-adjacent 'U9 recalls U1' edge (U1 first) while preserving the real U7 content chain (U7 second)", () => {
  assert.deepEqual(
    lessonsById.get("lesson.d2.risk-monitoring-reporting").prerequisites,
    ["lesson.d2.risk-fundamentals", "lesson.d2.residual-risk-acceptability"],
    "D2-U9 must list D2-U1 first (recall priority) and D2-U7 second (real content chain)"
  );
});

test("D2-U10 prerequisites are updated to D2-U9 and D2-U8 (surfaced architecture update from the original D2-U6/D2-U8 blueprint pairing)", () => {
  assert.deepEqual(
    lessonsById.get("lesson.d2.risk-management-embedding-synthesis").prerequisites,
    ["lesson.d2.risk-monitoring-reporting", "lesson.d2.risk-control-ownership"],
    "D2-U10 must list D2-U9 and D2-U8 as its prerequisites"
  );
});

test("D2-U9's default recall family is D2-U1's family (non-adjacent recall resolves as designed), and the full U1-U7 chain remains reachable", () => {
  function familyVariantsFor(familyId) {
    return data.questions.filter((q) => q.family === familyId && q.active).map((q) => q.id);
  }
  function orderedRecallFamilyIds(lessonId) {
    const lesson = lessonsById.get(lessonId);
    const seen = new Set();
    const poolIds = new Set();
    const familyOrder = [];
    function addQuestion(q) {
      if (poolIds.has(q.id)) return;
      poolIds.add(q.id);
      if (q.family && !familyOrder.includes(q.family)) familyOrder.push(q.family);
    }
    function visit(id) {
      if (seen.has(id)) return;
      seen.add(id);
      const l = lessonsById.get(id);
      if (!l) return;
      for (const refId of l.retrieval_refs) {
        const q = questionsById.get(refId);
        if (!q) continue;
        if (q.family && familiesById.has(q.family)) {
          for (const variantId of familyVariantsFor(q.family)) addQuestion(questionsById.get(variantId));
        } else {
          addQuestion(q);
        }
      }
      for (const prereqId of l.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
    }
    for (const prereqId of lesson.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
    return familyOrder;
  }

  const u9Recall = orderedRecallFamilyIds("lesson.d2.risk-monitoring-reporting");
  assert.equal(u9Recall[0], "family.d2.risk-fundamentals", "D2-U9's first (default) recall family must be D2-U1's family, not D2-U7's");
  for (const expectedFamily of [
    "family.d2.residual-risk-acceptability",
    "family.d2.risk-treatment-response",
    "family.d2.risk-evaluation",
    "family.d2.risk-assessment-lifecycle"
  ]) {
    assert.ok(u9Recall.includes(expectedFamily), `D2-U9's cumulative recall pool must still reach ${expectedFamily}`);
  }
  assert.ok(!u9Recall.includes("family.d2.risk-monitoring-reporting"), "D2-U9 must never recall its own family");

  const u10Recall = orderedRecallFamilyIds("lesson.d2.risk-management-embedding-synthesis");
  for (const expectedFamily of [
    "family.d2.risk-monitoring-reporting",
    "family.d2.risk-control-ownership",
    "family.d2.residual-risk-acceptability",
    "family.d2.risk-treatment-response",
    "family.d2.risk-evaluation",
    "family.d2.risk-assessment-lifecycle",
    "family.d2.risk-fundamentals"
  ]) {
    assert.ok(u10Recall.includes(expectedFamily), `D2-U10's cumulative recall pool must reach ${expectedFamily}`);
  }
});

test("No prerequisite cycle exists among D2-U9/D2-U10 and their ancestors", () => {
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

test("No Domain 3 (or later) entity or leakage exists anywhere in production content", () => {
  const laterDomainIds = [...data.concepts, ...data.lessons, ...data.families, ...data.questions]
    .map((e) => e.id)
    .filter((id) => /\.d[3-9]\./.test(id) || /^domain\.d[3-9]$/.test(id));
  assert.equal(laterDomainIds.length, 0, `no Domain 3+ entity may exist yet: ${laterDomainIds.join(", ")}`);

  const questionDomains = new Set(data.questions.map((q) => q.domain));
  for (const d of questionDomains) {
    assert.ok(["domain.foundation", "domain.d1", "domain.d2"].includes(d), `unexpected question domain present: ${d}`);
  }
});

test("Domain 2 production question count is exactly 30 after U1-U10 (3 variants x 10 families)", () => {
  const d2Questions = data.questions.filter((q) => q.domain === "domain.d2");
  assert.equal(d2Questions.length, 30, `expected 30 Domain 2 questions, got ${d2Questions.length}`);
});

test("D2-U1 through D2-U8 remain completely unchanged by this batch", () => {
  const versions = {
    "lesson.d2.risk-fundamentals": 1,
    "lesson.d2.risk-assessment-lifecycle": 2,
    "lesson.d2.risk-analysis-methods": 1,
    "lesson.d2.quantitative-risk-decisions": 1,
    "lesson.d2.risk-evaluation": 1,
    "lesson.d2.risk-treatment-response": 1,
    "lesson.d2.residual-risk-acceptability": 1
    // lesson.d2.risk-control-ownership's own prerequisites/version are
    // unaffected by this batch; version checked via family count below.
  };
  for (const [id, expectedVersion] of Object.entries(versions)) {
    assert.equal(lessonsById.get(id).version, expectedVersion, `${id} must remain at version ${expectedVersion}`);
  }
  const familyCounts = {
    "family.d2.risk-fundamentals": 3,
    "family.d2.risk-assessment-lifecycle": 3,
    "family.d2.risk-analysis-methods": 3,
    "family.d2.quantitative-risk-decisions": 3,
    "family.d2.risk-evaluation": 3,
    "family.d2.risk-treatment-response": 3,
    "family.d2.residual-risk-acceptability": 3,
    "family.d2.risk-control-ownership": 3
  };
  for (const [id, expectedCount] of Object.entries(familyCounts)) {
    assert.equal(questionsByFamily(id).length, expectedCount, `${id} must have exactly ${expectedCount} active variants`);
  }
});

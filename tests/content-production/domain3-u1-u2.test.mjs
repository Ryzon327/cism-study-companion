// D3-U1 (Program Foundations: Strategy to Program) and D3-U2 (Asset
// Identification & Classification) — the first Domain 3 production
// content, built per the approved
// docs/learning/DOMAIN-3-CURRICULUM-ARCHITECTURE.md and the Architect's
// D3-U1/U2 authoring directive. This file asserts the batch-specific
// structural requirements from that directive: existence, variant floor,
// no invented Domain 3 lifecycle, Meridian Manufacturing used as
// comprehension anchor (not the answer to every question), business-
// centered scope (no OT/technical-architecture content), cross-domain
// concept-identity safety (concept.d3.asset-classification distinct from
// concept.d1.data-ownership, per the BUG-001 note), and the approved
// prerequisite chain. General structural invariants (id format, referential
// integrity, length-bias, paraphrase detection, etc.) are already covered
// domain-agnostically by the other files in this directory and are not
// re-asserted here.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-production.mjs";

const data = loadAll();

const conceptsById = new Map(data.concepts.map((c) => [c.id, c]));
const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const familiesById = new Map(data.families.map((f) => [f.id, f]));
const questionsByFamily = (familyId) => data.questions.filter((q) => q.family === familyId && q.active);

// --- D3-U1: Program Foundations (Strategy to Program) ---------------------

test("D3-U1: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.program-foundations"), "concept.d3.program-foundations must exist");
  assert.ok(lessonsById.has("lesson.d3.program-foundations"), "lesson.d3.program-foundations must exist");
  assert.ok(familiesById.has("family.d3.program-foundations"), "family.d3.program-foundations must exist");

  const lesson = lessonsById.get("lesson.d3.program-foundations");
  assert.ok(lesson.concepts.includes("concept.d3.program-foundations"), "U1 lesson must teach its own concept");
  const family = familiesById.get("family.d3.program-foundations");
  assert.ok(family.concepts.includes("concept.d3.program-foundations"), "U1 family must declare the same concept");
});

test("D3-U1: family.d3.program-foundations has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.program-foundations");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U1: the program is distinguished from strategy AND from single technical implementation (pattern P01, business alignment)", () => {
  const lesson = lessonsById.get("lesson.d3.program-foundations");
  assert.ok(lesson.patterns.includes("pattern.p01"), "U1 lesson must reference pattern.p01");
  assert.match(lesson.context, /strategy/i);
  assert.match(lesson.context, /(single|any one) (technology|tool|control|project)/i);

  for (const q of questionsByFamily("family.d3.program-foundations")) {
    const correct = q.options.find((o) => o.correct);
    assert.match(
      correct.text + " " + correct.rationale,
      /(business|approved|objective|priorit)/i,
      `${q.id}'s correct answer must connect the decision back to approved business/security priority, not a standalone technical action`
    );
  }
});

test("D3-U1: Meridian Manufacturing anchors comprehension but is NOT the setting for every variant (per explicit instruction not to make Meridian the answer to every question)", () => {
  const variants = questionsByFamily("family.d3.program-foundations");
  const meridianVariants = variants.filter((q) => /Meridian|Aldergate/.test(q.prompt));
  assert.ok(meridianVariants.length >= 1, "at least one variant must use the Meridian Manufacturing anchor");
  assert.ok(meridianVariants.length < variants.length, "not every variant may use Meridian Manufacturing - transfer requires other settings");

  const lesson = lessonsById.get("lesson.d3.program-foundations");
  assert.match(lesson.scenario, /Meridian/, "U1's Learn scenario must use the approved Meridian Manufacturing reference story");
});

test("D3-U1: business-centered scope only - no OT/ICS, network-engineering, or technical-configuration content anywhere in this batch", () => {
  const lesson = lessonsById.get("lesson.d3.program-foundations");
  const forbidden = /(industrial control system|SCADA|PLC|firmware|network segmentation|VLAN|firewall rule|IP address|configuration file)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U1 must remain business-centered, not an OT/technical-architecture lesson");
  for (const q of questionsByFamily("family.d3.program-foundations")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must remain business-centered`);
  }
});

test("D3-U1: no Domain 3 lifecycle is invented anywhere - no lifecycle/stage set on this family or its variants (binding LIFECYCLE-MODEL.md constraint)", () => {
  const family = familiesById.get("family.d3.program-foundations");
  assert.equal(family.lifecycle, null, "Domain 3 has no canonical lifecycle - family.lifecycle must be null");
  assert.equal(family.stage_target, null, "Domain 3 has no canonical lifecycle - family.stage_target must be null");
  for (const q of questionsByFamily("family.d3.program-foundations")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
  }
});

// --- D3-U2: Asset Identification & Classification -------------------------

test("D3-U2: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.asset-classification"), "concept.d3.asset-classification must exist");
  assert.ok(lessonsById.has("lesson.d3.asset-classification"), "lesson.d3.asset-classification must exist");
  assert.ok(familiesById.has("family.d3.asset-classification"), "family.d3.asset-classification must exist");

  const lesson = lessonsById.get("lesson.d3.asset-classification");
  assert.ok(lesson.concepts.includes("concept.d3.asset-classification"));
  const family = familiesById.get("family.d3.asset-classification");
  assert.ok(family.concepts.includes("concept.d3.asset-classification"));
  assert.equal(family.lifecycle, null, "Domain 3 has no canonical lifecycle - family.lifecycle must be null");
});

test("D3-U2: family.d3.asset-classification has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.asset-classification");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U2: classification is taught as business criticality/sensitivity, never cost/age/threat-alone, across every variant's correct answer", () => {
  const lesson = lessonsById.get("lesson.d3.asset-classification");
  assert.match(lesson.context, /(criticality|sensitivity)/i);
  assert.match(lesson.context, /(rather than|not).*(cost|threat|convenience)/i);

  for (const q of questionsByFamily("family.d3.asset-classification")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
  }
});

test("D3-U2: at least one variant tests owner-vs-custodian accountability (pattern P02/P03), reapplied to Domain 3's own asset-classification context", () => {
  const variants = questionsByFamily("family.d3.asset-classification");
  const ownerVariant = variants.find((q) => q.patterns.includes("pattern.p02") && q.patterns.includes("pattern.p03"));
  assert.ok(ownerVariant, "at least one D3-U2 variant must reapply the authority-follows-accountability / role-verb-matching patterns");
  assert.match(ownerVariant.explanation, /(owner|accountable)/i);
});

test("D3-U2: acquired/newly-onboarded assets are explicitly covered, not treated as an exception to identification/classification", () => {
  const lesson = lessonsById.get("lesson.d3.asset-classification");
  assert.match(lesson.context, /(acquire|acquisition)/i, "U2 must explicitly address bringing acquired assets into the program");
  assert.match(lesson.context, /not exempt/i, "U2 must explicitly state acquired assets are NOT exempt from identification/classification");
  assert.doesNotMatch(lesson.context, /\bare exempt\b/i, "U2 must never claim acquired assets are exempt");
});

test("D3-U2: Meridian Manufacturing anchors comprehension but is NOT the setting for every variant", () => {
  const variants = questionsByFamily("family.d3.asset-classification");
  const meridianVariants = variants.filter((q) => /Meridian|Aldergate/.test(q.prompt));
  assert.ok(meridianVariants.length >= 1, "at least one variant must use the Meridian Manufacturing anchor");
  assert.ok(meridianVariants.length < variants.length, "not every variant may use Meridian Manufacturing - transfer requires other settings");
});

// --- Cross-domain concept-identity safety (BUG-001) ------------------------

test("BUG-001 safety: concept.d3.asset-classification is its own distinct identity, never sharing an id with concept.d1.data-ownership", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"), "concept.d1.data-ownership must still exist, unmodified");
  assert.notEqual("concept.d3.asset-classification", "concept.d1.data-ownership");
  const d3Concept = conceptsById.get("concept.d3.asset-classification");
  assert.equal(d3Concept.home_domain, "domain.d3", "the new Domain 3 concept must declare domain.d3 as its home domain, never domain.d1");
});

test("BUG-001 safety: no Domain 3 lesson/family/question reuses a Domain 1 concept id as its own instructional identity - Domain 1 is recalled through the prerequisite chain, never by id-sharing", () => {
  const d3Lesson = lessonsById.get("lesson.d3.asset-classification");
  assert.ok(!d3Lesson.concepts.some((c) => c.startsWith("concept.d1.")), "D3-U2's own lesson.concepts must contain no Domain 1 concept id");
  const d3Family = familiesById.get("family.d3.asset-classification");
  assert.ok(!d3Family.concepts.some((c) => c.startsWith("concept.d1.")), "D3-U2's own family.concepts must contain no Domain 1 concept id");
  for (const q of questionsByFamily("family.d3.asset-classification")) {
    assert.ok(!q.concepts.some((c) => c.startsWith("concept.d1.")), `${q.id}.concepts must contain no Domain 1 concept id`);
  }
});

// --- Cross-domain prerequisite chain ---------------------------------------

test("D3-U1/U2: cross-domain prerequisite chain is exactly as approved (Domain 2 complete -> D3-U1 -> D3-U2)", () => {
  assert.deepEqual(
    lessonsById.get("lesson.d3.program-foundations").prerequisites,
    ["lesson.d2.risk-management-embedding-synthesis"],
    "D3-U1 must be prerequisite on Domain 2's capstone lesson (D2-U10)"
  );
  assert.deepEqual(
    lessonsById.get("lesson.d3.asset-classification").prerequisites,
    ["lesson.d3.program-foundations"],
    "D3-U2 must be prerequisite on D3-U1 only"
  );
});

test("D3-U1/U2: taught-before-tested holds for both new lessons (retrieval question's concepts are taught by that lesson or its prerequisites)", () => {
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
  for (const lessonId of ["lesson.d3.program-foundations", "lesson.d3.asset-classification"]) {
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

test("recall selects the family the approved progression specifies: D3-U2 recalls D3-U1 first", () => {
  const familiesByIdLocal = familiesById;
  const familyOfLesson = new Map(
    data.lessons.map((l) => [l.id, data.questions.find((q) => q.id === l.retrieval_refs[0])?.family])
  );
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
        const q = data.questions.find((qq) => qq.id === refId);
        if (!q) continue;
        if (q.family && familiesByIdLocal.has(q.family)) {
          for (const variant of questionsByFamily(q.family)) addQuestion(variant);
        } else {
          addQuestion(q);
        }
      }
      for (const prereqId of l.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
    }
    for (const prereqId of lesson.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
    return familyOrder;
  }
  assert.ok(familyOfLesson.get("lesson.d3.program-foundations"), "sanity: D3-U1 must have an anchor family");
  assert.equal(orderedRecallFamilyIds("lesson.d3.asset-classification")[0], "family.d3.program-foundations");
});

// --- Across U1/U2 -----------------------------------------------------------

test("Domain 3 so far: all new entities are CANDIDATE, unverified, and none reference a future domain (D4)", () => {
  const newEntities = [
    conceptsById.get("concept.d3.program-foundations"),
    conceptsById.get("concept.d3.asset-classification"),
    lessonsById.get("lesson.d3.program-foundations"),
    lessonsById.get("lesson.d3.asset-classification"),
    familiesById.get("family.d3.program-foundations"),
    familiesById.get("family.d3.asset-classification"),
    ...questionsByFamily("family.d3.program-foundations"),
    ...questionsByFamily("family.d3.asset-classification")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 3 entity may reference Domain 4: ${bad.join(", ")}`);
});

test("D3-U1/U2's own families still have exactly 3 active variants each", () => {
  assert.equal(questionsByFamily("family.d3.program-foundations").length, 3);
  assert.equal(questionsByFamily("family.d3.asset-classification").length, 3);
});

// Originally "no Domain 3 unit beyond U1/U2 exists yet" — that boundary is
// superseded now that D3-U3/U4 have legitimately been authored (see
// domain3-u3-u4.test.mjs, which owns the current batch-boundary
// assertion), exactly as domain2-u1-u2.test.mjs's own "no Domain 2 unit
// beyond U1/U2" guard was superseded once Phase 9B-2 legitimately added
// D2-U3/U4. This file's own U1/U2 entities remain asserted unchanged by
// the "D3-U1/U2's own families still have exactly 3 active variants each"
// test above.

test("NEXT is not used anywhere in this Domain 3 batch (source-evidenced as essentially absent for Domain 3, per DOMAIN-3-CURRICULUM-ARCHITECTURE.md)", () => {
  const d3Questions = [...questionsByFamily("family.d3.program-foundations"), ...questionsByFamily("family.d3.asset-classification")];
  const nextUsage = d3Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this Domain 3 batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
});

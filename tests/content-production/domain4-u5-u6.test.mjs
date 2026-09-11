// D4-U5 (Containment) and D4-U6 (Evidence Handling / Investigation) —
// Domain 4's third production authoring batch, built per the approved
// docs/learning/DOMAIN-4-CURRICULUM-ARCHITECTURE.md and the Architect's
// D4-U5/U6 authoring directive. Mirrors the domain4-u3-u4.test.mjs
// precedent (and every prior batch test file): tests the learning contract
// and architecture, not arbitrary implementation details. General
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

function familiesAnchoredByLesson(lessonId) {
  const lesson = lessonsById.get(lessonId);
  if (!lesson) return [];
  return lesson.retrieval_refs
    .map((refId) => data.questions.find((qq) => qq.id === refId)?.family)
    .filter(Boolean);
}

function ancestorFamilies(lessonId, seen = new Set()) {
  if (seen.has(lessonId)) return new Set();
  seen.add(lessonId);
  const lesson = lessonsById.get(lessonId);
  if (!lesson) return new Set();
  const families = new Set();
  for (const prereqId of lesson.prerequisites) {
    if (!lessonsById.has(prereqId)) continue;
    for (const f of familiesAnchoredByLesson(prereqId)) families.add(f);
    for (const anc of ancestorFamilies(prereqId, seen)) families.add(anc);
  }
  return families;
}

function harborviewAndSettingChecks(familyId) {
  const variants = questionsByFamily(familyId);
  const harborview = variants.filter((q) => /Harborview/.test(q.prompt));
  assert.ok(harborview.length >= 1, `${familyId}: at least one variant must use the Harborview Hotels anchor`);
  assert.ok(harborview.length <= 1, `${familyId}: Harborview must remain an anchor, not the setting for more than one variant`);
  const transfer = variants.filter((q) => !/Harborview/.test(q.prompt));
  assert.ok(transfer.length >= 2, `${familyId}: at least 2 of 3 variants must use a non-Harborview setting`);
  const settings = new Set(transfer.map((q) => q.variation_tags.find((t) => t.startsWith("business-setting:"))));
  assert.equal(settings.size, transfer.length, `${familyId}: non-Harborview variants must use different business settings from each other`);
}

// --- D4-U5: Containment ------------------------------------------------------

test("D4-U5: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.incident-containment"));
  assert.ok(lessonsById.has("lesson.d4.incident-containment"));
  assert.ok(familiesById.has("family.d4.incident-containment"));

  const lesson = lessonsById.get("lesson.d4.incident-containment");
  assert.ok(lesson.concepts.includes("concept.d4.incident-containment"));
  const family = familiesById.get("family.d4.incident-containment");
  assert.ok(family.concepts.includes("concept.d4.incident-containment"));
  assert.equal(conceptsById.get("concept.d4.incident-containment").home_domain, "domain.d4");
});

test("D4-U5: family.d4.incident-containment has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.incident-containment");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U5: correctly depends on D4-U4 (Escalation & Communications)", () => {
  const lesson = lessonsById.get("lesson.d4.incident-containment");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.escalation-communications"], "D4-U5 must be prerequisite on D4-U4 only");
});

test("D4-U5: teaches containment is not eradication, recovery, or resolution - and scope should be proportionate", () => {
  const lesson = lessonsById.get("lesson.d4.incident-containment");
  assert.ok(lesson.patterns.includes("pattern.p04"));
  assert.ok(lesson.patterns.includes("pattern.p01"));
  const family = familiesById.get("family.d4.incident-containment");
  assert.ok(family.patterns.includes("pattern.p04"));
  assert.ok(family.patterns.includes("pattern.p01"));

  const variants = questionsByFamily("family.d4.incident-containment");
  const overbroadVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(entire|chain-wide|all|company's entire)/i.test(o.text))
  );
  assert.ok(overbroadVariant, "at least one D4-U5 variant must include an indiscriminate/overbroad-shutdown distractor");
});

test("D4-U5: at least one variant tests that a hasty technical action (power-off/restore) can destroy evidence", () => {
  const variants = questionsByFamily("family.d4.incident-containment");
  const evidenceVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(evidence|forensic)/i.test(o.rationale))
  );
  assert.ok(evidenceVariant, "at least one D4-U5 variant must reason about evidence loss from a hasty technical action");
});

test("D4-U5: patterns used (P01, P04) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const concept = conceptsById.get("concept.d4.incident-containment");
  assert.match(concept.note, /already approved for Domain 4/);
});

test("D4-U5: genuinely bound to the Contain stage of the existing CANONICAL incident lifecycle - correct registry IDs used, no new lifecycle/stage invented", () => {
  const family = familiesById.get("family.d4.incident-containment");
  assert.equal(family.lifecycle, "lifecycle.incident");
  assert.equal(family.stage_target, "stage.incident.contain");
  for (const q of questionsByFamily("family.d4.incident-containment")) {
    assert.equal(q.lifecycle, "lifecycle.incident", `${q.id}.lifecycle must be lifecycle.incident`);
    assert.equal(q.stage, "stage.incident.contain", `${q.id}.stage must be stage.incident.contain`);
  }
});

test("D4-U5: source-grounding note documents the 4B3 evidence", () => {
  const concept = conceptsById.get("concept.d4.incident-containment");
  assert.match(concept.note, /4B3/);
});

test("D4-U5: Harborview Hotels anchors exactly one variant; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.incident-containment");
});

test("D4-U5: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.incident-containment")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D4-U6: Evidence Handling / Investigation ---------------------------------

test("D4-U6: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.evidence-investigation"));
  assert.ok(lessonsById.has("lesson.d4.evidence-investigation"));
  assert.ok(familiesById.has("family.d4.evidence-investigation"));

  const lesson = lessonsById.get("lesson.d4.evidence-investigation");
  assert.ok(lesson.concepts.includes("concept.d4.evidence-investigation"));
  const family = familiesById.get("family.d4.evidence-investigation");
  assert.ok(family.concepts.includes("concept.d4.evidence-investigation"));
});

test("D4-U6: family.d4.evidence-investigation has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.evidence-investigation");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U6: dependency decision - single prerequisite on D4-U5 only, confirmed correct via direct schema/recall-pool analysis (the Architect's explicitly unlocked item)", () => {
  const lesson = lessonsById.get("lesson.d4.evidence-investigation");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.incident-containment"], "D4-U6 must be prerequisite on D4-U5 only - see docs/learning/DOMAIN-4-U5-U6-GATE-RECORD.md for the dependency analysis");
  assert.match(lesson.note, /recallPoolFor|transitive closure|dependency decision/i, "the lesson note must document the dependency-architecture reasoning");
});

test("D4-U6: teaches evidence integrity/chain of custody as the central reasoning - not asset tracking, attribution, or a storage-medium detail", () => {
  const lesson = lessonsById.get("lesson.d4.evidence-investigation");
  assert.ok(lesson.patterns.includes("pattern.p02"));
  assert.ok(lesson.patterns.includes("pattern.p04"));
  const family = familiesById.get("family.d4.evidence-investigation");
  assert.ok(family.patterns.includes("pattern.p02"));
  assert.ok(family.patterns.includes("pattern.p04"));

  const variants = questionsByFamily("family.d4.evidence-investigation");
  const custodyVariant = variants.find((q) => /chain of custody/i.test(q.prompt));
  assert.ok(custodyVariant, "at least one D4-U6 variant must test chain of custody directly");
  const correct = custodyVariant.options.find((o) => o.correct);
  assert.match(correct.text, /admissible|credible/i, "the correct answer must tie chain of custody to evidence admissibility/credibility");
});

test("D4-U6: at least one variant tests that restoring/rebuilding too early can destroy evidence needed later", () => {
  const variants = questionsByFamily("family.d4.evidence-investigation");
  const restorationVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(wipe|reimage|restor|rebuild)/i.test(o.text))
  );
  assert.ok(restorationVariant, "at least one D4-U6 variant must include a premature-restoration distractor");
});

test("D4-U6: at least one variant tests that law-enforcement-notification authority belongs to senior management, not the investigator or response team alone", () => {
  const variants = questionsByFamily("family.d4.evidence-investigation");
  const authorityVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /response team/i.test(o.text) && /notify|decide/i.test(o.text))
  );
  assert.ok(authorityVariant, "at least one D4-U6 variant must include a team-decides-independently distractor for law-enforcement notification");
  const distractor = authorityVariant.options.find((o) => !o.correct && /response team/i.test(o.text) && /notify|decide/i.test(o.text));
  assert.match(distractor.rationale, /senior management/i, "the distractor's rationale must place law-enforcement-notification authority with senior management");
});

test("D4-U6: does not manufacture an absolute 'evidence always outranks everything' or 'always notify law enforcement' rule - the criminal-charges variant is explicitly scoped", () => {
  const variants = questionsByFamily("family.d4.evidence-investigation");
  const scopedVariant = variants.find((q) => /criminal charges/i.test(q.prompt));
  assert.ok(scopedVariant, "the evidence-outranks-speed reasoning must be tested in a scenario explicitly scoped to possible criminal charges, not a generic incident");
  assert.match(scopedVariant.explanation, /not a rule that evidence always outranks|scoped/i, "the explanation must clarify this is a scoped refinement, not an absolute rule");
});

test("D4-U6: patterns used (P02, P04) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const concept = conceptsById.get("concept.d4.evidence-investigation");
  assert.match(concept.note, /already approved for Domain 4/);
});

test("D4-U6: deliberately cross-cutting - lifecycle/stage_target null at family and question level, per direct source analysis", () => {
  const family = familiesById.get("family.d4.evidence-investigation");
  assert.equal(family.lifecycle, null, "family.d4.evidence-investigation.lifecycle must be null - evidence/investigation reasoning spans containment through eradication/recovery, not bound to one stage");
  assert.equal(family.stage_target, null);
  for (const q of questionsByFamily("family.d4.evidence-investigation")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null`);
    assert.equal(q.stage, null, `${q.id}.stage must be null`);
  }
});

test("D4-U6: source-grounding note documents the 4B2 evidence, and the largest-single-area status", () => {
  const concept = conceptsById.get("concept.d4.evidence-investigation");
  assert.match(concept.note, /4B2/);
});

test("D4-U6: the unresolved power-off evidence nuance (containment-time volatile evidence vs. investigation-time disk evidence) is documented, not silently smoothed over", () => {
  const concept = conceptsById.get("concept.d4.evidence-investigation");
  assert.match(concept.note, /SOURCE NUANCE NOT RESOLVED|not resolved into an absolute rule/i);
});

test("D4-U6: single family / 3 variants is documented as a deliberate architecture decision, not an artificial collapse of distinct reasoning families", () => {
  const family = familiesById.get("family.d4.evidence-investigation");
  assert.match(family.note, /ONE family \/ 3 variants was used because/);
});

test("D4-U6: Harborview Hotels anchors exactly one variant, continuing directly from D4-U5; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.evidence-investigation");
  const lesson = lessonsById.get("lesson.d4.evidence-investigation");
  assert.match(lesson.context, /D4-U5|contained|isolated/i, "D4-U6's lesson context must continue directly from D4-U5's contained incident");
});

test("D4-U6: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.evidence-investigation")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: recall chain, lifecycle, qualifiers, batch boundary ------

test("taught-before-tested: D4-U5 and D4-U6's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d4.incident-containment", "lesson.d4.evidence-investigation"]) {
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

test("D4-U6's cumulative recall pool reaches the capstone of every prior domain (Foundation through Domain 3) and every prior Domain 4 unit, confirming the cross-domain chain is intact", () => {
  const reachable = ancestorFamilies("lesson.d4.evidence-investigation");
  assert.ok(reachable.has("family.d3.program-synthesis"), "must reach Domain 3's own capstone family");
  assert.ok(reachable.has("family.d2.risk-management-synthesis"), "must reach Domain 2's own capstone family");
  assert.ok(reachable.has("family.d1.authority-accountability-decision"), "must reach a Domain 1 family");
  assert.ok(reachable.has("family.d4.incident-containment"), "must reach D4-U5");
  assert.ok(reachable.has("family.d4.incident-classification-severity"), "must reach D4-U3 (transitively, via D4-U5/U4)");
  assert.ok(reachable.size >= 29, `expected a large, fully cumulative recall pool, got ${reachable.size} families`);
});

test("no invented Domain 4 lifecycle: only the existing CANONICAL lifecycle.incident and its existing stage IDs are used, never a new one", () => {
  const validStageIds = new Set([
    "stage.incident.prepare",
    "stage.incident.identify-confirm",
    "stage.incident.contain",
    "stage.incident.eradicate",
    "stage.incident.recover",
    "stage.incident.post-incident-review-improve"
  ]);
  for (const familyId of ["family.d4.incident-containment", "family.d4.evidence-investigation"]) {
    const family = familiesById.get(familyId);
    if (family.lifecycle !== null) assert.equal(family.lifecycle, "lifecycle.incident", `${familyId} must only use the existing lifecycle.incident`);
    if (family.stage_target !== null) assert.ok(validStageIds.has(family.stage_target), `${familyId}.stage_target must be an existing stage ID`);
    for (const q of questionsByFamily(familyId)) {
      if (q.lifecycle !== null) assert.equal(q.lifecycle, "lifecycle.incident", `${q.id} must only use the existing lifecycle.incident`);
      if (q.stage !== null) assert.ok(validStageIds.has(q.stage), `${q.id}.stage must be an existing stage ID`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: FIRST/PRIMARY/MOST, all genuinely source-grounded, no manufactured NEXT", () => {
  const d4Questions = [...questionsByFamily("family.d4.incident-containment"), ...questionsByFamily("family.d4.evidence-investigation")];
  const nextUsage = d4Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
  for (const q of d4Questions) {
    assert.ok(q.qualifier === null || ["qualifier.first", "qualifier.best", "qualifier.most", "qualifier.primary", "qualifier.primarily"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier or null, got ${q.qualifier}`);
  }
});

test("Domain 4 U5/U6: all new entities are CANDIDATE, unverified, and none reference D4-U7+ or Domain 5", () => {
  const newEntities = [
    conceptsById.get("concept.d4.incident-containment"),
    conceptsById.get("concept.d4.evidence-investigation"),
    lessonsById.get("lesson.d4.incident-containment"),
    lessonsById.get("lesson.d4.evidence-investigation"),
    familiesById.get("family.d4.incident-containment"),
    familiesById.get("family.d4.evidence-investigation"),
    ...questionsByFamily("family.d4.incident-containment"),
    ...questionsByFamily("family.d4.evidence-investigation")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d5|\.d5\./.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 4 U5/U6 entity may reference Domain 5: ${bad.join(", ")}`);
});

test("no concept-id collisions: the two Domain 4 U5/U6 concepts are distinct from each other and from every other concept", () => {
  const u5u6ConceptIds = ["concept.d4.incident-containment", "concept.d4.evidence-investigation"];
  for (const id of u5u6ConceptIds) assert.ok(conceptsById.has(id), `${id} must exist`);
  const otherIds = data.concepts.filter((c) => !u5u6ConceptIds.includes(c.id)).map((c) => c.id);
  for (const id of u5u6ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with any other concept id`);
});

test("batch boundary: no Domain 4 unit beyond U1-U6 exists yet, and no Domain 5 exists", () => {
  const d4Lessons = data.lessons.filter((l) => l.domain === "domain.d4").map((l) => l.id);
  assert.deepEqual(
    d4Lessons.sort(),
    [
      "lesson.d4.program-foundations-readiness",
      "lesson.d4.business-impact-analysis-prioritization",
      "lesson.d4.incident-classification-severity",
      "lesson.d4.escalation-communications",
      "lesson.d4.incident-containment",
      "lesson.d4.evidence-investigation"
    ].sort(),
    "only D4-U1 through D4-U6 may exist in this batch - D4-U7+ is not yet authored"
  );
  const laterDomainIds = [...data.concepts, ...data.lessons, ...data.families, ...data.questions]
    .map((e) => e.id)
    .filter((id) => /\.d[5-9]\./.test(id) || /^domain\.d[5-9]$/.test(id));
  assert.equal(laterDomainIds.length, 0, `no Domain 5+ entity may exist yet: ${laterDomainIds.join(", ")}`);
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/3 and D4-U1-U4 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
  assert.ok(conceptsById.has("concept.d3.program-synthesis"));
  assert.ok(conceptsById.has("concept.d4.incident-management-readiness"));
  assert.ok(conceptsById.has("concept.d4.business-impact-analysis-prioritization"));
  assert.ok(conceptsById.has("concept.d4.incident-classification-severity"));
  assert.ok(conceptsById.has("concept.d4.escalation-communications"));
});

// D4-U7 (Eradication / Recovery) and D4-U8 (IR / BCP / DRP Boundary) —
// Domain 4's fourth production authoring batch, built per the approved
// docs/learning/DOMAIN-4-CURRICULUM-ARCHITECTURE.md and the Architect's
// D4-U7/U8 authoring directive. Mirrors the domain4-u5-u6.test.mjs
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

// --- D4-U7: Eradication / Recovery --------------------------------------------

test("D4-U7: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.eradication-recovery"));
  assert.ok(lessonsById.has("lesson.d4.eradication-recovery"));
  assert.ok(familiesById.has("family.d4.eradication-recovery"));

  const lesson = lessonsById.get("lesson.d4.eradication-recovery");
  assert.ok(lesson.concepts.includes("concept.d4.eradication-recovery"));
  const family = familiesById.get("family.d4.eradication-recovery");
  assert.ok(family.concepts.includes("concept.d4.eradication-recovery"));
  assert.equal(conceptsById.get("concept.d4.eradication-recovery").home_domain, "domain.d4");
});

test("D4-U7: family.d4.eradication-recovery has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.eradication-recovery");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U7: correctly depends on D4-U6 (Evidence Handling / Investigation)", () => {
  const lesson = lessonsById.get("lesson.d4.eradication-recovery");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.evidence-investigation"], "D4-U7 must be prerequisite on D4-U6 only");
});

test("D4-U7: teaches eradication and recovery as two distinct, sequential steps after containment - neither interchangeable with the other or with containment", () => {
  const lesson = lessonsById.get("lesson.d4.eradication-recovery");
  assert.ok(lesson.patterns.includes("pattern.p04"));
  assert.ok(lesson.patterns.includes("pattern.p05"));
  const family = familiesById.get("family.d4.eradication-recovery");
  assert.ok(family.patterns.includes("pattern.p04"));
  assert.ok(family.patterns.includes("pattern.p05"));

  const variants = questionsByFamily("family.d4.eradication-recovery");
  const rebuildVariant = variants.find((q) => /rebuild|original.*media|clean.*media/i.test(q.prompt + JSON.stringify(q.options)));
  assert.ok(rebuildVariant, "at least one D4-U7 variant must test rebuilding from clean original media rather than a possibly-tainted backup");
});

test("D4-U7: at least one variant tests that meeting a stated RTO does not by itself prove recovery is complete", () => {
  const variants = questionsByFamily("family.d4.eradication-recovery");
  const rtoVariant = variants.find((q) => /recovery time objective/i.test(q.prompt));
  assert.ok(rtoVariant, "at least one D4-U7 variant must reference the recovery time objective directly");
  const correct = rtoVariant.options.find((o) => o.correct);
  assert.match(correct.text, /not (actually )?complete|does not guarantee/i, "the correct answer must reason that meeting RTO alone doesn't prove recovery is complete");
});

test("D4-U7: at least one variant tests against retreating to an already-completed stage (containment/eradication) once the scenario states it is finished", () => {
  const variants = questionsByFamily("family.d4.eradication-recovery");
  const sequenceVariant = variants.find((q) => q.qualifier === "qualifier.next");
  assert.ok(sequenceVariant, "at least one D4-U7 variant must use qualifier.next to test correct sequencing");
  const retreatDistractors = sequenceVariant.options.filter((o) => !o.correct && o.repair_target === "repair.sequence-error");
  assert.ok(retreatDistractors.length >= 1, "the sequencing variant must include at least one stage-retreat distractor tagged repair.sequence-error");
});

test("D4-U7: patterns used (P04, P05) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const concept = conceptsById.get("concept.d4.eradication-recovery");
  assert.match(concept.note, /already approved for Domain 4/);
});

test("D4-U7: deliberately does not set a single lifecycle stage - lifecycle.incident with stage_target null, a documented deviation from the architecture document's single-stage assumption", () => {
  const family = familiesById.get("family.d4.eradication-recovery");
  assert.equal(family.lifecycle, "lifecycle.incident", "family.d4.eradication-recovery.lifecycle must remain lifecycle.incident");
  assert.equal(family.stage_target, null, "family.d4.eradication-recovery.stage_target must be null - the family genuinely spans two adjacent stages");
  for (const q of questionsByFamily("family.d4.eradication-recovery")) {
    assert.equal(q.lifecycle, "lifecycle.incident", `${q.id}.lifecycle must be lifecycle.incident`);
    assert.equal(q.stage, null, `${q.id}.stage must be null`);
  }
  const concept = conceptsById.get("concept.d4.eradication-recovery");
  assert.match(concept.note, /LIFECYCLE-MAPPING DEVIATION FLAGGED/i, "the concept note must document the stage_target deviation reasoning");
  assert.match(concept.note, /stage_target.*accepts only one value/i, "the concept note must explain why a single stage could not represent both eradicate and recover");
});

test("D4-U7: source-grounding note documents the 4B5 evidence", () => {
  const concept = conceptsById.get("concept.d4.eradication-recovery");
  assert.match(concept.note, /4B5/);
});

test("D4-U7: the source's own eradication-before-recovery sequencing tension is documented, not silently smoothed over", () => {
  const concept = conceptsById.get("concept.d4.eradication-recovery");
  assert.match(concept.note, /SOURCE TENSION FLAGGED/i);
});

test("D4-U7: Harborview Hotels anchors exactly one variant, continuing directly from D4-U6; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.eradication-recovery");
  const lesson = lessonsById.get("lesson.d4.eradication-recovery");
  assert.match(lesson.context, /D4-U6|preserved evidence/i, "D4-U7's lesson context must continue directly from D4-U6's preserved evidence");
});

test("D4-U7: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.eradication-recovery")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D4-U8: IR / BCP / DRP Boundary --------------------------------------------

test("D4-U8: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.ir-bcp-drp-boundary"));
  assert.ok(lessonsById.has("lesson.d4.ir-bcp-drp-boundary"));
  assert.ok(familiesById.has("family.d4.ir-bcp-drp-boundary"));

  const lesson = lessonsById.get("lesson.d4.ir-bcp-drp-boundary");
  assert.ok(lesson.concepts.includes("concept.d4.ir-bcp-drp-boundary"));
  const family = familiesById.get("family.d4.ir-bcp-drp-boundary");
  assert.ok(family.concepts.includes("concept.d4.ir-bcp-drp-boundary"));
});

test("D4-U8: family.d4.ir-bcp-drp-boundary has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.ir-bcp-drp-boundary");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U8: dependency decision - single prerequisite on D4-U7 only, confirmed correct via direct schema/recall-pool analysis", () => {
  const lesson = lessonsById.get("lesson.d4.ir-bcp-drp-boundary");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.eradication-recovery"], "D4-U8 must be prerequisite on D4-U7 only");
  assert.match(lesson.note, /recallPoolFor|transitive|dependency decision/i, "the lesson note must document the dependency-architecture reasoning");
});

test("D4-U8: teaches business continuity as keeping business PROCESSES running, not an IT-only reduction", () => {
  const lesson = lessonsById.get("lesson.d4.ir-bcp-drp-boundary");
  assert.ok(lesson.patterns.includes("pattern.p01"));
  const family = familiesById.get("family.d4.ir-bcp-drp-boundary");
  assert.ok(family.patterns.includes("pattern.p01"));

  const variants = questionsByFamily("family.d4.ir-bcp-drp-boundary");
  const bcpVariant = variants.find((q) => /business continuity plan/i.test(q.options.map((o) => o.text).join(" ")));
  assert.ok(bcpVariant, "at least one D4-U8 variant must test the business continuity plan directly");
  const correct = bcpVariant.options.find((o) => o.correct);
  assert.match(correct.text, /business continuity/i, "the correct answer must identify business continuity as governing a business-process workaround");
});

test("D4-U8: does not imply that activating one plan (IR/BCP/DRP) automatically activates the others", () => {
  const concept = conceptsById.get("concept.d4.ir-bcp-drp-boundary");
  assert.match(concept.plain, /coordinated, not sequential substitutes|not automatically mean every other plan activates/i);
});

test("D4-U8: at least one variant requires reasoning-from-facts to distinguish RTO from RPO (not acronym recall)", () => {
  const variants = questionsByFamily("family.d4.ir-bcp-drp-boundary");
  const rpoVariant = variants.find((q) => /recovery point objective/i.test(q.options.map((o) => o.text).join(" ")) && /15 minutes|data loss/i.test(q.prompt));
  assert.ok(rpoVariant, "at least one D4-U8 variant must test RPO via a described fact (a stated data-loss tolerance), not a definition-recall prompt");
  const correct = rpoVariant.options.find((o) => o.correct);
  assert.match(correct.text, /recovery point objective|RPO/i);
});

test("D4-U8: at least one variant requires reasoning-from-facts to distinguish SDO from RTO/RPO (not acronym recall)", () => {
  const variants = questionsByFamily("family.d4.ir-bcp-drp-boundary");
  const sdoVariant = variants.find((q) => /half|partial/i.test(q.prompt) && /service delivery objective/i.test(q.options.map((o) => o.text).join(" ")));
  assert.ok(sdoVariant, "at least one D4-U8 variant must test SDO via a described partial-capacity fact, not a definition-recall prompt");
  const correct = sdoVariant.options.find((o) => o.correct);
  assert.match(correct.text, /service delivery objective|SDO/i);
});

test("D4-U8: MTO and AIW are deliberately deferred to Learn narrative only, not forced into Apply merely because they are related terms", () => {
  const variants = questionsByFamily("family.d4.ir-bcp-drp-boundary");
  for (const q of variants) {
    const allText = q.prompt + JSON.stringify(q.options);
    assert.doesNotMatch(allText, /allowable interruption window|\bAIW\b/i, `${q.id} should not test AIW directly this batch (Learn-narrative-only per the terminology disposition)`);
  }
  const concept = conceptsById.get("concept.d4.ir-bcp-drp-boundary");
  assert.match(concept.note, /TERMINOLOGY DISPOSITION/i);
});

test("D4-U8: patterns used (P01) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const concept = conceptsById.get("concept.d4.ir-bcp-drp-boundary");
  assert.match(concept.note, /already approved for Domain 4/);
});

test("D4-U8: deliberately cross-cutting - lifecycle/stage_target null at family and question level, per direct source analysis", () => {
  const family = familiesById.get("family.d4.ir-bcp-drp-boundary");
  assert.equal(family.lifecycle, null, "family.d4.ir-bcp-drp-boundary.lifecycle must be null - business continuity invocation is a documented cross-cutting supporting activity");
  assert.equal(family.stage_target, null);
  for (const q of questionsByFamily("family.d4.ir-bcp-drp-boundary")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null`);
    assert.equal(q.stage, null, `${q.id}.stage must be null`);
  }
});

test("D4-U8: source-grounding note documents the 4A3/4A4 evidence", () => {
  const concept = conceptsById.get("concept.d4.ir-bcp-drp-boundary");
  assert.match(concept.note, /4A3/);
  assert.match(concept.note, /4A4/);
});

test("D4-U8: single family / 3 variants is documented as a deliberate architecture decision, not an artificial collapse of distinct reasoning families", () => {
  const family = familiesById.get("family.d4.ir-bcp-drp-boundary");
  assert.match(family.note, /ONE family \/ 3 variants was used because/);
});

test("D4-U8: Harborview Hotels anchors exactly one variant, continuing directly from D4-U7; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.ir-bcp-drp-boundary");
  const lesson = lessonsById.get("lesson.d4.ir-bcp-drp-boundary");
  assert.match(lesson.context, /D4-U7|being rebuilt|recovery/i, "D4-U8's lesson context must continue directly from D4-U7's recovery-in-progress incident");
});

test("D4-U8: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.ir-bcp-drp-boundary")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: recall chain, lifecycle, qualifiers, batch boundary ------

test("taught-before-tested: D4-U7 and D4-U8's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d4.eradication-recovery", "lesson.d4.ir-bcp-drp-boundary"]) {
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

test("D4-U8's cumulative recall pool reaches the capstone of every prior domain (Foundation through Domain 3) and every prior Domain 4 unit, confirming the cross-domain chain is intact", () => {
  const reachable = ancestorFamilies("lesson.d4.ir-bcp-drp-boundary");
  assert.ok(reachable.has("family.d3.program-synthesis"), "must reach Domain 3's own capstone family");
  assert.ok(reachable.has("family.d2.risk-management-synthesis"), "must reach Domain 2's own capstone family");
  assert.ok(reachable.has("family.d1.authority-accountability-decision"), "must reach a Domain 1 family");
  assert.ok(reachable.has("family.d4.eradication-recovery"), "must reach D4-U7");
  assert.ok(reachable.has("family.d4.evidence-investigation"), "must reach D4-U6 (transitively, via D4-U7)");
  assert.ok(reachable.size >= 31, `expected a large, fully cumulative recall pool, got ${reachable.size} families`);
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
  for (const familyId of ["family.d4.eradication-recovery", "family.d4.ir-bcp-drp-boundary"]) {
    const family = familiesById.get(familyId);
    if (family.lifecycle !== null) assert.equal(family.lifecycle, "lifecycle.incident", `${familyId} must only use the existing lifecycle.incident`);
    if (family.stage_target !== null) assert.ok(validStageIds.has(family.stage_target), `${familyId}.stage_target must be an existing stage ID`);
    for (const q of questionsByFamily(familyId)) {
      if (q.lifecycle !== null) assert.equal(q.lifecycle, "lifecycle.incident", `${q.id} must only use the existing lifecycle.incident`);
      if (q.stage !== null) assert.ok(validStageIds.has(q.stage), `${q.id}.stage must be an existing stage ID`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: BEST/MOST/NEXT/PRIMARY, all genuinely source-grounded", () => {
  const d4Questions = [...questionsByFamily("family.d4.eradication-recovery"), ...questionsByFamily("family.d4.ir-bcp-drp-boundary")];
  for (const q of d4Questions) {
    assert.ok(q.qualifier === null || ["qualifier.first", "qualifier.best", "qualifier.most", "qualifier.next", "qualifier.primary", "qualifier.primarily"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier or null, got ${q.qualifier}`);
  }
  // NEXT is legitimately used here (D4-U7's sequencing variant) unlike prior
  // batches, where it was deliberately absent - it is source-grounded here
  // (the source itself asks "most appropriate NEXT step" in 4B5).
  const nextUsage = d4Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.ok(nextUsage.length >= 1, "expected at least one source-grounded NEXT usage in this batch");
});

test("Domain 4 U7/U8: all new entities are CANDIDATE, unverified, and none reference D4-U9+ or Domain 5", () => {
  const newEntities = [
    conceptsById.get("concept.d4.eradication-recovery"),
    conceptsById.get("concept.d4.ir-bcp-drp-boundary"),
    lessonsById.get("lesson.d4.eradication-recovery"),
    lessonsById.get("lesson.d4.ir-bcp-drp-boundary"),
    familiesById.get("family.d4.eradication-recovery"),
    familiesById.get("family.d4.ir-bcp-drp-boundary"),
    ...questionsByFamily("family.d4.eradication-recovery"),
    ...questionsByFamily("family.d4.ir-bcp-drp-boundary")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d5|\.d5\./.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 4 U7/U8 entity may reference Domain 5: ${bad.join(", ")}`);
});

test("no concept-id collisions: the two Domain 4 U7/U8 concepts are distinct from each other and from every other concept", () => {
  const u7u8ConceptIds = ["concept.d4.eradication-recovery", "concept.d4.ir-bcp-drp-boundary"];
  for (const id of u7u8ConceptIds) assert.ok(conceptsById.has(id), `${id} must exist`);
  const otherIds = data.concepts.filter((c) => !u7u8ConceptIds.includes(c.id)).map((c) => c.id);
  for (const id of u7u8ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with any other concept id`);
});

test("batch boundary: D4-U1 through U8 lessons exist, and no Domain 5 exists", () => {
  // Originally asserted D4-U1 through U8 were the ONLY Domain 4 lessons in
  // existence. D4-U9/U10 have since been authored (see
  // tests/content-production/domain4-u9-u10.test.mjs), so this test is
  // narrowed to confirm U1-U8 still exist rather than that nothing beyond
  // them does; the Domain 5 boundary remains a true batch-boundary check.
  const d4Lessons = data.lessons.filter((l) => l.domain === "domain.d4").map((l) => l.id);
  for (const id of [
    "lesson.d4.program-foundations-readiness",
    "lesson.d4.business-impact-analysis-prioritization",
    "lesson.d4.incident-classification-severity",
    "lesson.d4.escalation-communications",
    "lesson.d4.incident-containment",
    "lesson.d4.evidence-investigation",
    "lesson.d4.eradication-recovery",
    "lesson.d4.ir-bcp-drp-boundary"
  ]) {
    assert.ok(d4Lessons.includes(id), `${id} must still exist`);
  }
  const laterDomainIds = [...data.concepts, ...data.lessons, ...data.families, ...data.questions]
    .map((e) => e.id)
    .filter((id) => /\.d[5-9]\./.test(id) || /^domain\.d[5-9]$/.test(id));
  assert.equal(laterDomainIds.length, 0, `no Domain 5+ entity may exist yet: ${laterDomainIds.join(", ")}`);
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/3 and D4-U1-U6 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
  assert.ok(conceptsById.has("concept.d3.program-synthesis"));
  assert.ok(conceptsById.has("concept.d4.incident-management-readiness"));
  assert.ok(conceptsById.has("concept.d4.business-impact-analysis-prioritization"));
  assert.ok(conceptsById.has("concept.d4.incident-classification-severity"));
  assert.ok(conceptsById.has("concept.d4.escalation-communications"));
  assert.ok(conceptsById.has("concept.d4.incident-containment"));
  assert.ok(conceptsById.has("concept.d4.evidence-investigation"));
});

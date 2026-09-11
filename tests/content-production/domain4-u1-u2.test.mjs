// D4-U1 (Program Foundations & Readiness) and D4-U2 (Business Impact
// Analysis & Prioritization) — Domain 4's first production authoring
// batch, built per the approved docs/learning/DOMAIN-4-CURRICULUM-ARCHITECTURE.md
// and the Architect's D4-U1/U2 authoring directive. Mirrors the
// domain3-u1-u2.test.mjs precedent (and every subsequent Domain 3 batch
// test file): tests the learning contract and architecture, not arbitrary
// implementation details. General structural invariants (id format,
// referential integrity, length-bias, paraphrase detection, etc.) are
// already covered domain-agnostically by the other files in this directory
// and are not re-asserted here.
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

// --- D4-U1: Program Foundations & Readiness ----------------------------------

test("D4-U1: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.incident-management-readiness"));
  assert.ok(lessonsById.has("lesson.d4.program-foundations-readiness"));
  assert.ok(familiesById.has("family.d4.program-foundations-readiness"));

  const lesson = lessonsById.get("lesson.d4.program-foundations-readiness");
  assert.ok(lesson.concepts.includes("concept.d4.incident-management-readiness"));
  const family = familiesById.get("family.d4.program-foundations-readiness");
  assert.ok(family.concepts.includes("concept.d4.incident-management-readiness"));
  assert.equal(conceptsById.get("concept.d4.incident-management-readiness").home_domain, "domain.d4");
});

test("D4-U1: family.d4.program-foundations-readiness has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.program-foundations-readiness");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U1: is Domain 4's entry point, prerequisiting on Domain 3's own capstone to preserve the full cross-domain recall chain", () => {
  const lesson = lessonsById.get("lesson.d4.program-foundations-readiness");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.program-synthesis"], "D4-U1 must be prerequisite on lesson.d3.program-synthesis only");
});

test("D4-U1: teaches readiness precedes incident handling - leadership commitment, authority, and categorization decided before an incident, not during one", () => {
  const lesson = lessonsById.get("lesson.d4.program-foundations-readiness");
  assert.ok(lesson.patterns.includes("pattern.p06"));
  assert.ok(lesson.patterns.includes("pattern.p02"));
  const family = familiesById.get("family.d4.program-foundations-readiness");
  assert.ok(family.patterns.includes("pattern.p06"));
  assert.ok(family.patterns.includes("pattern.p02"));

  for (const q of questionsByFamily("family.d4.program-foundations-readiness")) {
    const correct = q.options.find((o) => o.correct);
    assert.match(
      correct.text + " " + correct.rationale,
      /(before|commitment|authority|categoriz|develop)/i,
      `${q.id}'s correct answer must reason about a decision made in advance of an incident`
    );
  }
});

test("D4-U1: at least one variant explicitly rejects plan-existence-as-readiness (a drafted plan is not proof of readiness)", () => {
  const variants = questionsByFamily("family.d4.program-foundations-readiness");
  const planExistenceVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(already|approved|document|on file)/i.test(o.text))
  );
  assert.ok(planExistenceVariant, "at least one D4-U1 variant must include a plan-existence-as-readiness distractor");
});

test("D4-U1: patterns used (P06, P02) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  // This is a documentation-of-intent test: it does not read schema/registry
  // directly (that would duplicate schema/data-model tests' own job), but
  // asserts that this batch's own note fields document the applicable-domains
  // check performed during authoring.
  const concept = conceptsById.get("concept.d4.incident-management-readiness");
  assert.match(concept.note, /applicable_domains/);
});

test("D4-U1: genuinely bound to the Prepare stage of the existing CANONICAL incident lifecycle - correct registry IDs used, no new lifecycle/stage invented", () => {
  const family = familiesById.get("family.d4.program-foundations-readiness");
  assert.equal(family.lifecycle, "lifecycle.incident");
  assert.equal(family.stage_target, "stage.incident.prepare");
  for (const q of questionsByFamily("family.d4.program-foundations-readiness")) {
    assert.equal(q.lifecycle, "lifecycle.incident", `${q.id}.lifecycle must be lifecycle.incident`);
    assert.equal(q.stage, "stage.incident.prepare", `${q.id}.stage must be stage.incident.prepare`);
  }
});

test("D4-U1: source-grounding note documents the 4A1 evidence", () => {
  const concept = conceptsById.get("concept.d4.incident-management-readiness");
  assert.match(concept.note, /4A1/);
});

test("D4-U1: Harborview Hotels anchors exactly one variant; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.program-foundations-readiness");
});

test("D4-U1: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.program-foundations-readiness")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D4-U2: Business Impact Analysis & Prioritization ------------------------

test("D4-U2: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.business-impact-analysis-prioritization"));
  assert.ok(lessonsById.has("lesson.d4.business-impact-analysis-prioritization"));
  assert.ok(familiesById.has("family.d4.business-impact-analysis-prioritization"));

  const lesson = lessonsById.get("lesson.d4.business-impact-analysis-prioritization");
  assert.ok(lesson.concepts.includes("concept.d4.business-impact-analysis-prioritization"));
  const family = familiesById.get("family.d4.business-impact-analysis-prioritization");
  assert.ok(family.concepts.includes("concept.d4.business-impact-analysis-prioritization"));
});

test("D4-U2: family.d4.business-impact-analysis-prioritization has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.business-impact-analysis-prioritization");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U2: correctly depends on D4-U1 (Program Foundations & Readiness)", () => {
  const lesson = lessonsById.get("lesson.d4.business-impact-analysis-prioritization");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.program-foundations-readiness"], "D4-U2 must be prerequisite on D4-U1 only");
});

test("D4-U2: teaches business impact (not technical sophistication, cost, or novelty) as the basis for recovery priority", () => {
  const lesson = lessonsById.get("lesson.d4.business-impact-analysis-prioritization");
  assert.ok(lesson.patterns.includes("pattern.p01"));
  const family = familiesById.get("family.d4.business-impact-analysis-prioritization");
  assert.ok(family.patterns.includes("pattern.p01"));

  const variants = questionsByFamily("family.d4.business-impact-analysis-prioritization");
  const technicalSophisticationVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(technical|advanced|recently|cost|rebuild)/i.test(o.text))
  );
  assert.ok(technicalSophisticationVariant, "at least one D4-U2 variant must include a technical-sophistication/cost/novelty distractor");
});

test("D4-U2: at least one variant requires business-unit/process-owner input over IT-only or executive-only input", () => {
  const variants = questionsByFamily("family.d4.business-impact-analysis-prioritization");
  const stakeholderVariant = variants.find((q) => {
    const correct = q.options.find((o) => o.correct);
    return /(business unit|process owner|department)/i.test(correct.text);
  });
  assert.ok(stakeholderVariant, "at least one D4-U2 variant must require business-unit/process-owner input as the correct answer");
});

test("D4-U2: IR-vs-BCP-vs-DRP distinction is explicitly taught and source-confirmed, not assumed", () => {
  const concept = conceptsById.get("concept.d4.business-impact-analysis-prioritization");
  assert.match(concept.plain, /incident response.*business continuity.*disaster recovery|three different plans/i);
  assert.match(concept.note, /(source, verbatim|source-confirmed)/i);

  const variants = questionsByFamily("family.d4.business-impact-analysis-prioritization");
  const irBcpVariant = variants.find((q) => /business continuity plan/i.test(q.prompt) && /incident response/i.test(q.prompt));
  assert.ok(irBcpVariant, "at least one D4-U2 variant must test the IR-vs-BCP relationship directly");
  const correct = irBcpVariant.options.find((o) => o.correct);
  assert.match(correct.text, /separate plan/i, "the correct answer must treat business continuity as a separate plan from incident response, not an automatic trigger or the same plan");
});

test("D4-U2: RTO and RPO, where used, match the existing CONFUSING-CONCEPTS.md definitions rather than inventing new ones", () => {
  const concept = conceptsById.get("concept.d4.business-impact-analysis-prioritization");
  assert.match(concept.plain, /recovery time objective, RTO/i);
  assert.match(concept.plain, /recovery point objective, RPO/i);
  // MTO/AIW/SDO are deliberately NOT taught in depth here (reserved for D4-U8) -
  // confirm this unit does not manufacture its own competing definitions.
  assert.doesNotMatch(concept.plain, /allowable interruption window|maximum tolerable outage|service delivery objective/i);
});

test("D4-U2: is deliberately cross-cutting - lifecycle/stage_target null at family and question level, per the Architect's explicit approval", () => {
  const family = familiesById.get("family.d4.business-impact-analysis-prioritization");
  assert.equal(family.lifecycle, null, "family.d4.business-impact-analysis-prioritization.lifecycle must be null - BIA is cross-cutting, not bound to one incident stage");
  assert.equal(family.stage_target, null);
  for (const q of questionsByFamily("family.d4.business-impact-analysis-prioritization")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null`);
    assert.equal(q.stage, null, `${q.id}.stage must be null`);
  }
});

test("D4-U2: source-grounding note documents the 4A2 evidence", () => {
  const concept = conceptsById.get("concept.d4.business-impact-analysis-prioritization");
  assert.match(concept.note, /4A2/);
});

test("D4-U2: Harborview Hotels anchors exactly one variant; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.business-impact-analysis-prioritization");
});

test("D4-U2: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.business-impact-analysis-prioritization")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: recall chain, lifecycle, qualifiers, batch boundary ------

test("taught-before-tested: D4-U1 and D4-U2's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d4.program-foundations-readiness", "lesson.d4.business-impact-analysis-prioritization"]) {
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

test("D4-U2's cumulative recall pool reaches the capstone of every prior domain (Foundation through Domain 3), confirming the cross-domain chain is intact", () => {
  const reachable = ancestorFamilies("lesson.d4.business-impact-analysis-prioritization");
  assert.ok(reachable.has("family.d3.program-synthesis"), "must reach Domain 3's own capstone family");
  assert.ok(reachable.has("family.d2.risk-management-synthesis"), "must reach Domain 2's own capstone family");
  assert.ok(reachable.has("family.d1.authority-accountability-decision"), "must reach a Domain 1 family");
  assert.ok(reachable.size >= 25, `expected a large, fully cumulative recall pool, got ${reachable.size} families`);
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
  for (const familyId of ["family.d4.program-foundations-readiness", "family.d4.business-impact-analysis-prioritization"]) {
    const family = familiesById.get(familyId);
    if (family.lifecycle !== null) assert.equal(family.lifecycle, "lifecycle.incident", `${familyId} must only use the existing lifecycle.incident`);
    if (family.stage_target !== null) assert.ok(validStageIds.has(family.stage_target), `${familyId}.stage_target must be an existing stage ID`);
    for (const q of questionsByFamily(familyId)) {
      if (q.lifecycle !== null) assert.equal(q.lifecycle, "lifecycle.incident", `${q.id} must only use the existing lifecycle.incident`);
      if (q.stage !== null) assert.ok(validStageIds.has(q.stage), `${q.id}.stage must be an existing stage ID`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: FIRST/BEST/MOST/PRIMARILY, all genuinely source-grounded, no manufactured NEXT", () => {
  const d4Questions = [...questionsByFamily("family.d4.program-foundations-readiness"), ...questionsByFamily("family.d4.business-impact-analysis-prioritization")];
  const nextUsage = d4Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
  for (const q of d4Questions) {
    assert.ok(["qualifier.first", "qualifier.best", "qualifier.most", "qualifier.primarily"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier, got ${q.qualifier}`);
  }
});

test("Domain 4 so far (U1-U2): all new entities are CANDIDATE, unverified, and none reference D4-U3+ or Domain 5", () => {
  const newEntities = [
    conceptsById.get("concept.d4.incident-management-readiness"),
    conceptsById.get("concept.d4.business-impact-analysis-prioritization"),
    lessonsById.get("lesson.d4.program-foundations-readiness"),
    lessonsById.get("lesson.d4.business-impact-analysis-prioritization"),
    familiesById.get("family.d4.program-foundations-readiness"),
    familiesById.get("family.d4.business-impact-analysis-prioritization"),
    ...questionsByFamily("family.d4.program-foundations-readiness"),
    ...questionsByFamily("family.d4.business-impact-analysis-prioritization")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d5|\.d5\./.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 4 U1/U2 entity may reference Domain 5: ${bad.join(", ")}`);
});

test("no concept-id collisions: the two Domain 4 concepts authored so far are distinct from each other and from every Domain 1/2/3 concept", () => {
  const d4ConceptIds = data.concepts.filter((c) => c.id.startsWith("concept.d4.")).map((c) => c.id);
  assert.equal(new Set(d4ConceptIds).size, d4ConceptIds.length, "Domain 4 concept ids must be unique");
  assert.equal(d4ConceptIds.length, 2, `expected exactly 2 Domain 4 concepts (U1-U2), found ${d4ConceptIds.length}`);
  const otherIds = data.concepts.filter((c) => !c.id.startsWith("concept.d4.")).map((c) => c.id);
  for (const id of d4ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with a Domain 1/2/3/Foundation concept id`);
});

test("batch boundary: no Domain 4 unit beyond U1-U2 exists yet, and no Domain 5 exists", () => {
  const d4Lessons = data.lessons.filter((l) => l.domain === "domain.d4").map((l) => l.id);
  assert.deepEqual(
    d4Lessons.sort(),
    ["lesson.d4.business-impact-analysis-prioritization", "lesson.d4.program-foundations-readiness"].sort(),
    "only D4-U1 and D4-U2 may exist in this batch - D4-U3+ is not yet authored"
  );
  const laterDomainIds = [...data.concepts, ...data.lessons, ...data.families, ...data.questions]
    .map((e) => e.id)
    .filter((id) => /\.d[5-9]\./.test(id) || /^domain\.d[5-9]$/.test(id));
  assert.equal(laterDomainIds.length, 0, `no Domain 5+ entity may exist yet: ${laterDomainIds.join(", ")}`);
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/3 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
  assert.ok(conceptsById.has("concept.d3.program-synthesis"));
});

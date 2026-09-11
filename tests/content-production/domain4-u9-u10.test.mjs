// D4-U9 (Post-Incident Review) and D4-U10 (Incident Management Synthesis /
// Capstone) — Domain 4's fifth and FINAL production authoring batch, built
// per the approved docs/learning/DOMAIN-4-CURRICULUM-ARCHITECTURE.md and the
// Architect's D4-U9/U10 authoring directive. Mirrors the
// domain4-u7-u8.test.mjs precedent (and every prior batch test file): tests
// the learning contract and architecture, not arbitrary implementation
// details. General structural invariants (id format, referential integrity,
// length-bias, paraphrase detection, etc.) are already covered
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

// --- D4-U9: Post-Incident Review -----------------------------------------------

test("D4-U9: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.post-incident-review"));
  assert.ok(lessonsById.has("lesson.d4.post-incident-review"));
  assert.ok(familiesById.has("family.d4.post-incident-review"));

  const lesson = lessonsById.get("lesson.d4.post-incident-review");
  assert.ok(lesson.concepts.includes("concept.d4.post-incident-review"));
  const family = familiesById.get("family.d4.post-incident-review");
  assert.ok(family.concepts.includes("concept.d4.post-incident-review"));
  assert.equal(conceptsById.get("concept.d4.post-incident-review").home_domain, "domain.d4");
});

test("D4-U9: family.d4.post-incident-review has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.post-incident-review");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U9: correctly depends on D4-U8 (IR / BCP / DRP Boundary)", () => {
  const lesson = lessonsById.get("lesson.d4.post-incident-review");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.ir-bcp-drp-boundary"], "D4-U9 must be prerequisite on D4-U8 only");
});

test("D4-U9: teaches review exists to confirm corrective action and improve the process - never to find fault", () => {
  const lesson = lessonsById.get("lesson.d4.post-incident-review");
  assert.ok(lesson.patterns.includes("pattern.p15"));
  assert.ok(lesson.patterns.includes("pattern.p02"));
  const family = familiesById.get("family.d4.post-incident-review");
  assert.ok(family.patterns.includes("pattern.p15"));
  assert.ok(family.patterns.includes("pattern.p02"));

  const variants = questionsByFamily("family.d4.post-incident-review");
  const blameVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(blam|responsible|fault|performed|held)/i.test(o.text))
  );
  assert.ok(blameVariant, "at least one D4-U9 variant must include a blame/fault-finding distractor");
});

test("D4-U9: at least one variant tests that senior-management review confirms corrective action, not fault-finding", () => {
  const variants = questionsByFamily("family.d4.post-incident-review");
  const reviewVariant = variants.find((q) => /executive review|senior management|executive team/i.test(q.prompt + " " + q.options.map((o) => o.text).join(" ")));
  assert.ok(reviewVariant, "at least one D4-U9 variant must test senior-management review's purpose");
  const correct = reviewVariant.options.find((o) => o.correct);
  assert.match(correct.text, /corrective action|implemented/i, "the correct answer must tie management review to confirming corrective action was implemented");
});

test("D4-U9: at least one variant tests that root-cause analysis, unresolved after eradication, should be completed during post-incident review - not skipped or reassigned to blame", () => {
  const variants = questionsByFamily("family.d4.post-incident-review");
  const rootCauseVariant = variants.find((q) => /never able to conclusively determine/i.test(q.prompt));
  assert.ok(rootCauseVariant, "at least one D4-U9 variant must test unresolved root-cause-analysis continuation");
  const correct = rootCauseVariant.options.find((o) => o.correct);
  assert.match(correct.text, /root.cause/i, "the correct answer must direct completing the root-cause analysis");
});

test("D4-U9: at least one variant tests the PRIMARY goal of post-incident review as process improvement, not documentation/blame/legal-evidence", () => {
  const variants = questionsByFamily("family.d4.post-incident-review");
  const primaryGoalVariant = variants.find((q) => q.qualifier === "qualifier.primary" && /PRIMARY goal/i.test(q.prompt));
  assert.ok(primaryGoalVariant, "at least one D4-U9 variant must directly test the PRIMARY goal of post-incident review");
  const correct = primaryGoalVariant.options.find((o) => o.correct);
  assert.match(correct.text, /improve/i, "the correct answer must identify process improvement as the goal");
});

test("D4-U9: patterns used (P15, P02) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const concept = conceptsById.get("concept.d4.post-incident-review");
  assert.match(concept.note, /already approved for Domain 4/);
});

test("D4-U9: genuinely bound to the domain's final CANONICAL lifecycle stage - correct registry IDs used, no new lifecycle/stage invented", () => {
  const family = familiesById.get("family.d4.post-incident-review");
  assert.equal(family.lifecycle, "lifecycle.incident");
  assert.equal(family.stage_target, "stage.incident.post-incident-review-improve");
  for (const q of questionsByFamily("family.d4.post-incident-review")) {
    assert.equal(q.lifecycle, "lifecycle.incident", `${q.id}.lifecycle must be lifecycle.incident`);
    assert.equal(q.stage, "stage.incident.post-incident-review-improve", `${q.id}.stage must be stage.incident.post-incident-review-improve`);
  }
});

test("D4-U9: source-grounding note documents the 4B6 evidence", () => {
  const concept = conceptsById.get("concept.d4.post-incident-review");
  assert.match(concept.note, /4B6/);
});

test("D4-U9: the architecture document's unsupported 'response-time-reduction is the best effectiveness metric' assumption is flagged, not silently taught", () => {
  const concept = conceptsById.get("concept.d4.post-incident-review");
  assert.match(concept.note, /ARCHITECTURE-ASSUMPTION DISCREPANCY FLAGGED/i);
  const variants = questionsByFamily("family.d4.post-incident-review");
  for (const q of variants) {
    const allText = q.prompt + JSON.stringify(q.options);
    assert.doesNotMatch(allText, /response.time reduction/i, `${q.id} should not test an unsupported response-time-reduction effectiveness claim`);
  }
});

test("D4-U9: Harborview Hotels anchors exactly one variant, continuing directly from D4-U7/U8's fully recovered incident; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.post-incident-review");
  const lesson = lessonsById.get("lesson.d4.post-incident-review");
  assert.match(lesson.context, /D4-U7|D4-U8|recovered/i, "D4-U9's lesson context must continue directly from the fully recovered incident");
});

test("D4-U9: does not introduce a new incident merely to teach this unit - continues the same Harborview incident", () => {
  const lesson = lessonsById.get("lesson.d4.post-incident-review");
  assert.match(lesson.note, /does not introduce a new incident/i);
});

test("D4-U9: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.post-incident-review")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D4-U10: Incident Management Synthesis / Capstone --------------------------

test("D4-U10: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.incident-management-synthesis"));
  assert.ok(lessonsById.has("lesson.d4.incident-management-synthesis"));
  assert.ok(familiesById.has("family.d4.incident-management-synthesis"));

  const lesson = lessonsById.get("lesson.d4.incident-management-synthesis");
  assert.ok(lesson.concepts.includes("concept.d4.incident-management-synthesis"));
  const family = familiesById.get("family.d4.incident-management-synthesis");
  assert.ok(family.concepts.includes("concept.d4.incident-management-synthesis"));
});

test("D4-U10: family.d4.incident-management-synthesis has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.incident-management-synthesis");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U10: correctly depends on D4-U9 (Post-Incident Review) only, transitively covering all of D4-U1-U9", () => {
  const lesson = lessonsById.get("lesson.d4.incident-management-synthesis");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.post-incident-review"], "D4-U10 must be prerequisite on D4-U9 only");
});

test("D4-U10: is a genuinely integrative capstone - every variant integrates at least 3 distinct Domain 4 concepts, not a glossary quiz", () => {
  const variants = questionsByFamily("family.d4.incident-management-synthesis");
  for (const q of variants) {
    const d4Concepts = q.concepts.filter((c) => c.startsWith("concept.d4."));
    assert.ok(d4Concepts.length >= 4, `${q.id} must integrate at least 4 Domain 4 concepts (the synthesis concept plus 3+ prior-unit concepts), got ${d4Concepts.length}: ${d4Concepts.join(", ")}`);
    const priorConcepts = d4Concepts.filter((c) => c !== "concept.d4.incident-management-synthesis");
    assert.ok(priorConcepts.length >= 3, `${q.id} must integrate at least 3 prior-unit Domain 4 concepts beyond the synthesis concept itself, got ${priorConcepts.length}`);
  }
});

test("D4-U10: no variant is a single-unit recap or a stage-labeling exercise - correct answers require weighing more than one open concern at once", () => {
  const variants = questionsByFamily("family.d4.incident-management-synthesis");
  for (const q of variants) {
    const correct = q.options.find((o) => o.correct);
    // A genuinely integrated correct answer should be substantially longer/
    // more composite than a single-fact answer, reflecting that it resolves
    // more than one concern - a weak but real structural proxy for "this
    // isn't a one-line single-unit recap."
    assert.ok(correct.text.length >= 80, `${q.id}'s correct answer (${correct.text.length} chars) looks too short to be resolving multiple integrated concerns`);
  }
});

test("D4-U10: Harborview capstone scenario is a NEW, later management situation - not a repeat of any prior Harborview scene verbatim", () => {
  const lesson = lessonsById.get("lesson.d4.incident-management-synthesis");
  assert.match(lesson.scenario, /Eight months later|eight months/i, "the capstone scenario must be explicitly framed as a new, later situation");
  harborviewAndSettingChecks("family.d4.incident-management-synthesis");
});

test("D4-U10: does not expose stage names in Learn in a way that gives Apply answers away, and does not invent an unofficial second lifecycle", () => {
  const lesson = lessonsById.get("lesson.d4.incident-management-synthesis");
  assert.doesNotMatch(lesson.context, /stage\.incident\./, "Learn context must not leak raw stage IDs");
  assert.doesNotMatch(lesson.scenario, /stage\.incident\./, "Learn scenario must not leak raw stage IDs");
});

test("D4-U10: patterns used are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const family = familiesById.get("family.d4.incident-management-synthesis");
  for (const p of family.patterns) {
    assert.ok(["pattern.p01", "pattern.p02", "pattern.p04", "pattern.p15"].includes(p), `${p} must be one of the patterns already approved for Domain 4 in this batch`);
  }
  const concept = conceptsById.get("concept.d4.incident-management-synthesis");
  assert.match(concept.note, /already approved for Domain 4/);
});

test("D4-U10: deliberately cross-cutting - lifecycle/stage_target null at family and question level, per the general Domain Synthesis/Capstone principle", () => {
  const family = familiesById.get("family.d4.incident-management-synthesis");
  assert.equal(family.lifecycle, null, "family.d4.incident-management-synthesis.lifecycle must be null - the capstone integrates across the whole lifecycle, not one stage");
  assert.equal(family.stage_target, null);
  for (const q of questionsByFamily("family.d4.incident-management-synthesis")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null`);
    assert.equal(q.stage, null, `${q.id}.stage must be null`);
  }
});

test("D4-U10: is integrative with no new source material claimed", () => {
  const concept = conceptsById.get("concept.d4.incident-management-synthesis");
  assert.match(concept.note, /no new source material/i);
});

test("D4-U10: Harborview Hotels anchors exactly one variant; the other two use different non-Harborview settings, each requiring integrated reasoning", () => {
  const variants = questionsByFamily("family.d4.incident-management-synthesis");
  const transfer = variants.filter((q) => !/Harborview/.test(q.prompt));
  for (const q of transfer) {
    const d4Concepts = q.concepts.filter((c) => c.startsWith("concept.d4.") && c !== "concept.d4.incident-management-synthesis");
    assert.ok(d4Concepts.length >= 3, `${q.id} (transfer variant) must still integrate at least 3 prior-unit concepts, got ${d4Concepts.length}`);
  }
});

test("D4-U10: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.incident-management-synthesis")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: recall chain, lifecycle, qualifiers, batch boundary ------

test("taught-before-tested: D4-U9 and D4-U10's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d4.post-incident-review", "lesson.d4.incident-management-synthesis"]) {
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

test("D4-U10's cumulative recall pool reaches the capstone of every prior domain (Foundation through Domain 3) and every Domain 4 unit U1-U9, confirming the fully linear cross-domain chain is intact", () => {
  const reachable = ancestorFamilies("lesson.d4.incident-management-synthesis");
  assert.ok(reachable.has("family.d3.program-synthesis"), "must reach Domain 3's own capstone family");
  assert.ok(reachable.has("family.d2.risk-management-synthesis"), "must reach Domain 2's own capstone family");
  assert.ok(reachable.has("family.d1.authority-accountability-decision"), "must reach a Domain 1 family");
  assert.ok(reachable.has("family.d4.program-foundations-readiness"), "must reach D4-U1");
  assert.ok(reachable.has("family.d4.business-impact-analysis-prioritization"), "must reach D4-U2");
  assert.ok(reachable.has("family.d4.incident-classification-severity"), "must reach D4-U3");
  assert.ok(reachable.has("family.d4.escalation-communications"), "must reach D4-U4");
  assert.ok(reachable.has("family.d4.incident-containment"), "must reach D4-U5");
  assert.ok(reachable.has("family.d4.evidence-investigation"), "must reach D4-U6");
  assert.ok(reachable.has("family.d4.eradication-recovery"), "must reach D4-U7");
  assert.ok(reachable.has("family.d4.ir-bcp-drp-boundary"), "must reach D4-U8");
  assert.ok(reachable.has("family.d4.post-incident-review"), "must reach D4-U9");
  assert.ok(reachable.size >= 35, `expected a large, fully cumulative recall pool, got ${reachable.size} families`);
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
  for (const familyId of ["family.d4.post-incident-review", "family.d4.incident-management-synthesis"]) {
    const family = familiesById.get(familyId);
    if (family.lifecycle !== null) assert.equal(family.lifecycle, "lifecycle.incident", `${familyId} must only use the existing lifecycle.incident`);
    if (family.stage_target !== null) assert.ok(validStageIds.has(family.stage_target), `${familyId}.stage_target must be an existing stage ID`);
    for (const q of questionsByFamily(familyId)) {
      if (q.lifecycle !== null) assert.equal(q.lifecycle, "lifecycle.incident", `${q.id} must only use the existing lifecycle.incident`);
      if (q.stage !== null) assert.ok(validStageIds.has(q.stage), `${q.id}.stage must be an existing stage ID`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: PRIMARY/MOST/BEST/NEXT, all genuinely source-grounded or null", () => {
  const d4Questions = [...questionsByFamily("family.d4.post-incident-review"), ...questionsByFamily("family.d4.incident-management-synthesis")];
  for (const q of d4Questions) {
    assert.ok(q.qualifier === null || ["qualifier.first", "qualifier.best", "qualifier.most", "qualifier.next", "qualifier.primary", "qualifier.primarily"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier or null, got ${q.qualifier}`);
  }
});

test("Domain 4 U9/U10: all new entities are CANDIDATE, unverified, and none reference Domain 5", () => {
  const newEntities = [
    conceptsById.get("concept.d4.post-incident-review"),
    conceptsById.get("concept.d4.incident-management-synthesis"),
    lessonsById.get("lesson.d4.post-incident-review"),
    lessonsById.get("lesson.d4.incident-management-synthesis"),
    familiesById.get("family.d4.post-incident-review"),
    familiesById.get("family.d4.incident-management-synthesis"),
    ...questionsByFamily("family.d4.post-incident-review"),
    ...questionsByFamily("family.d4.incident-management-synthesis")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d5|\.d5\./.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 4 U9/U10 entity may reference Domain 5: ${bad.join(", ")}`);
});

test("no concept-id collisions: the two Domain 4 U9/U10 concepts are distinct from each other and from every other concept", () => {
  const u9u10ConceptIds = ["concept.d4.post-incident-review", "concept.d4.incident-management-synthesis"];
  for (const id of u9u10ConceptIds) assert.ok(conceptsById.has(id), `${id} must exist`);
  const otherIds = data.concepts.filter((c) => !u9u10ConceptIds.includes(c.id)).map((c) => c.id);
  for (const id of u9u10ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with any other concept id`);
});

test("Domain 4 completion boundary: exactly D4-U1 through D4-U10 exist - no D4-U11+ was authored in this batch, and no Domain 5 exists", () => {
  const d4Lessons = data.lessons.filter((l) => l.domain === "domain.d4").map((l) => l.id);
  assert.deepEqual(
    d4Lessons.sort(),
    [
      "lesson.d4.program-foundations-readiness",
      "lesson.d4.business-impact-analysis-prioritization",
      "lesson.d4.incident-classification-severity",
      "lesson.d4.escalation-communications",
      "lesson.d4.incident-containment",
      "lesson.d4.evidence-investigation",
      "lesson.d4.eradication-recovery",
      "lesson.d4.ir-bcp-drp-boundary",
      "lesson.d4.post-incident-review",
      "lesson.d4.incident-management-synthesis"
    ].sort(),
    "exactly D4-U1 through D4-U10 may exist - Domain 4 is now complete for the current MVP curriculum boundary"
  );
  const laterDomainIds = [...data.concepts, ...data.lessons, ...data.families, ...data.questions]
    .map((e) => e.id)
    .filter((id) => /\.d[5-9]\./.test(id) || /^domain\.d[5-9]$/.test(id));
  assert.equal(laterDomainIds.length, 0, `no Domain 5+ entity may exist yet: ${laterDomainIds.join(", ")}`);
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/3 and D4-U1-U8 preserved recall targets are still present", () => {
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
  assert.ok(conceptsById.has("concept.d4.eradication-recovery"));
  assert.ok(conceptsById.has("concept.d4.ir-bcp-drp-boundary"));
});

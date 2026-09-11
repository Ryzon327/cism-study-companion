// D4-U3 (Incident Classification / Severity) and D4-U4 (Escalation &
// Communications) — Domain 4's second production authoring batch, built per
// the approved docs/learning/DOMAIN-4-CURRICULUM-ARCHITECTURE.md and the
// Architect's D4-U3/U4 authoring directive. Mirrors the domain4-u1-u2.test.mjs
// precedent (and every prior batch test file): tests the learning contract
// and architecture, not arbitrary implementation details. General structural
// invariants (id format, referential integrity, length-bias, paraphrase
// detection, etc.) are already covered domain-agnostically by the other
// files in this directory and are not re-asserted here.
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

// --- D4-U3: Incident Classification & Severity -------------------------------

test("D4-U3: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.incident-classification-severity"));
  assert.ok(lessonsById.has("lesson.d4.incident-classification-severity"));
  assert.ok(familiesById.has("family.d4.incident-classification-severity"));

  const lesson = lessonsById.get("lesson.d4.incident-classification-severity");
  assert.ok(lesson.concepts.includes("concept.d4.incident-classification-severity"));
  const family = familiesById.get("family.d4.incident-classification-severity");
  assert.ok(family.concepts.includes("concept.d4.incident-classification-severity"));
  assert.equal(conceptsById.get("concept.d4.incident-classification-severity").home_domain, "domain.d4");
});

test("D4-U3: family.d4.incident-classification-severity has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.incident-classification-severity");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U3: correctly depends on D4-U2 (Business Impact Analysis & Prioritization)", () => {
  const lesson = lessonsById.get("lesson.d4.incident-classification-severity");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.business-impact-analysis-prioritization"], "D4-U3 must be prerequisite on D4-U2 only");
});

test("D4-U3: teaches event-vs-incident - confirmation must precede classification and action, never assumption", () => {
  const lesson = lessonsById.get("lesson.d4.incident-classification-severity");
  assert.ok(lesson.patterns.includes("pattern.p04"));
  const family = familiesById.get("family.d4.incident-classification-severity");
  assert.ok(family.patterns.includes("pattern.p04"));

  const variants = questionsByFamily("family.d4.incident-classification-severity");
  const eventVsIncidentVariant = variants.find((q) => q.qualifier === "qualifier.first");
  assert.ok(eventVsIncidentVariant, "at least one D4-U3 variant must test the FIRST/confirm-before-act reasoning");
  const correct = eventVsIncidentVariant.options.find((o) => o.correct);
  assert.match(correct.text + " " + correct.rationale, /(confirm|actually known|actually happened)/i, "the correct answer must reason about confirming facts before acting");
});

test("D4-U3: severity is assessed by business impact, not technical sophistication or drama", () => {
  const lesson = lessonsById.get("lesson.d4.incident-classification-severity");
  assert.ok(lesson.patterns.includes("pattern.p01"));
  const family = familiesById.get("family.d4.incident-classification-severity");
  assert.ok(family.patterns.includes("pattern.p01"));

  const variants = questionsByFamily("family.d4.incident-classification-severity");
  const technicalDramaVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(sophisticated|technical skill|complex|investigation effort)/i.test(o.text))
  );
  assert.ok(technicalDramaVariant, "at least one D4-U3 variant must include a technical-sophistication-as-severity distractor");
  const correct = technicalDramaVariant.options.find((o) => o.correct);
  assert.match(correct.text, /(exposed|impact|data)/i, "the correct answer must reason from actual business impact, not technical complexity");
});

test("D4-U3: at least one variant requires a business-context-tailored classification scheme, not a generic or outsourced one", () => {
  const variants = questionsByFamily("family.d4.incident-classification-severity");
  const schemeVariant = variants.find((q) => {
    const correct = q.options.find((o) => o.correct);
    return /(business context|tailored|stakeholder)/i.test(correct.text);
  });
  assert.ok(schemeVariant, "at least one D4-U3 variant must require a business-context-tailored classification scheme as the correct answer");
});

test("D4-U3: patterns used (P04, P01) are already CANONICAL-approved for Domain 4 - no new pattern invented, no registry edit required", () => {
  const concept = conceptsById.get("concept.d4.incident-classification-severity");
  assert.match(concept.note, /applicable_domains|already approved for Domain 4/);
});

test("D4-U3: genuinely bound to the Identify/Confirm stage of the existing CANONICAL incident lifecycle - correct registry IDs used, no new lifecycle/stage invented", () => {
  const family = familiesById.get("family.d4.incident-classification-severity");
  assert.equal(family.lifecycle, "lifecycle.incident");
  assert.equal(family.stage_target, "stage.incident.identify-confirm");
  for (const q of questionsByFamily("family.d4.incident-classification-severity")) {
    assert.equal(q.lifecycle, "lifecycle.incident", `${q.id}.lifecycle must be lifecycle.incident`);
    assert.equal(q.stage, "stage.incident.identify-confirm", `${q.id}.stage must be stage.incident.identify-confirm`);
  }
});

test("D4-U3: source-grounding note documents the 4A5 evidence", () => {
  const concept = conceptsById.get("concept.d4.incident-classification-severity");
  assert.match(concept.note, /4A5/);
});

test("D4-U3: Harborview Hotels anchors exactly one variant; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.incident-classification-severity");
});

test("D4-U3: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.incident-classification-severity")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D4-U4: Escalation & Communications ---------------------------------------

test("D4-U4: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d4.escalation-communications"));
  assert.ok(lessonsById.has("lesson.d4.escalation-communications"));
  assert.ok(familiesById.has("family.d4.escalation-communications"));

  const lesson = lessonsById.get("lesson.d4.escalation-communications");
  assert.ok(lesson.concepts.includes("concept.d4.escalation-communications"));
  const family = familiesById.get("family.d4.escalation-communications");
  assert.ok(family.concepts.includes("concept.d4.escalation-communications"));
});

test("D4-U4: family.d4.escalation-communications has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d4.escalation-communications");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D4-U4: correctly depends on D4-U3 (Incident Classification / Severity)", () => {
  const lesson = lessonsById.get("lesson.d4.escalation-communications");
  assert.deepEqual(lesson.prerequisites, ["lesson.d4.incident-classification-severity"], "D4-U4 must be prerequisite on D4-U3 only");
});

test("D4-U4: teaches audience-appropriate communication - business impact and corrective action to executives, not raw technical detail", () => {
  const lesson = lessonsById.get("lesson.d4.escalation-communications");
  assert.ok(lesson.patterns.includes("pattern.p11"));
  const family = familiesById.get("family.d4.escalation-communications");
  assert.ok(family.patterns.includes("pattern.p11"));

  const variants = questionsByFamily("family.d4.escalation-communications");
  const audienceVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(technical log|raw|chronological)/i.test(o.text))
  );
  assert.ok(audienceVariant, "at least one D4-U4 variant must include a raw-technical-detail-to-executives distractor");
  const correct = audienceVariant.options.find((o) => o.correct);
  assert.match(correct.text, /(business impact|corrective action)/i, "the correct answer must reason about business impact and corrective action, not technical detail");
});

test("D4-U4: at least one variant tests authorized-spokesperson-only media communication", () => {
  const variants = questionsByFamily("family.d4.escalation-communications");
  const spokespersonVariant = variants.find((q) => /(reporter|media)/i.test(q.prompt));
  assert.ok(spokespersonVariant, "at least one D4-U4 variant must test media-communication authority");
  const correct = spokespersonVariant.options.find((o) => o.correct);
  assert.match(correct.text, /(authorized spokesperson|spokesperson)/i, "the correct answer must route media contact through one authorized spokesperson");
});

test("D4-U4: at least one variant tests that external/legal notification authority belongs to management, not the ISM, IR team, or a third party acting alone", () => {
  const lesson = lessonsById.get("lesson.d4.escalation-communications");
  assert.ok(lesson.patterns.includes("pattern.p02"));
  const family = familiesById.get("family.d4.escalation-communications");
  assert.ok(family.patterns.includes("pattern.p02"));

  const variants = questionsByFamily("family.d4.escalation-communications");
  const authorityVariant = variants.find((q) => /(regulat|notify)/i.test(q.prompt));
  assert.ok(authorityVariant, "at least one D4-U4 variant must test external-notification authority");
  const correct = authorityVariant.options.find((o) => o.correct);
  assert.match(correct.text, /management/i, "the correct answer must place external-notification authority with management");
  const thirdPartyDistractor = authorityVariant.options.find((o) => !o.correct && /third-party|third party/i.test(o.text));
  assert.ok(thirdPartyDistractor, "the authority variant must include a third-party-decides distractor that a third party's involvement does not transfer accountability");
});

test("D4-U4: is deliberately cross-cutting - lifecycle/stage_target null at family and question level, per the Architect's explicit approval", () => {
  const family = familiesById.get("family.d4.escalation-communications");
  assert.equal(family.lifecycle, null, "family.d4.escalation-communications.lifecycle must be null - escalation/communication recurs throughout the lifecycle, not bound to one stage");
  assert.equal(family.stage_target, null);
  for (const q of questionsByFamily("family.d4.escalation-communications")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null`);
    assert.equal(q.stage, null, `${q.id}.stage must be null`);
  }
});

test("D4-U4: source-grounding note documents the 4B4 evidence", () => {
  const concept = conceptsById.get("concept.d4.escalation-communications");
  assert.match(concept.note, /4B4/);
});

test("D4-U4: P11 (Audience-Appropriate Communication) applicable_domains was deliberately, narrowly extended to include Domain 4 - documented, not a silent registry change", () => {
  const concept = conceptsById.get("concept.d4.escalation-communications");
  assert.match(concept.note, /P11/);
  assert.match(concept.note, /applicable_domains/);
});

test("D4-U4: Harborview Hotels anchors exactly one variant, continuing directly from D4-U3; the other two use different non-Harborview settings", () => {
  harborviewAndSettingChecks("family.d4.escalation-communications");
  const lesson = lessonsById.get("lesson.d4.escalation-communications");
  assert.match(lesson.context, /D4-U3|classified incident|confirmed and classified/i, "D4-U4's lesson context must continue directly from D4-U3's classified incident");
});

test("D4-U4: repair metadata routes through the shared, domain-agnostic repair system (no D4-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d4.escalation-communications")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: recall chain, lifecycle, qualifiers, batch boundary ------

test("taught-before-tested: D4-U3 and D4-U4's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d4.incident-classification-severity", "lesson.d4.escalation-communications"]) {
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

test("D4-U4's cumulative recall pool reaches the capstone of every prior domain (Foundation through Domain 3), confirming the cross-domain chain is intact", () => {
  const reachable = ancestorFamilies("lesson.d4.escalation-communications");
  assert.ok(reachable.has("family.d3.program-synthesis"), "must reach Domain 3's own capstone family");
  assert.ok(reachable.has("family.d2.risk-management-synthesis"), "must reach Domain 2's own capstone family");
  assert.ok(reachable.has("family.d1.authority-accountability-decision"), "must reach a Domain 1 family");
  assert.ok(reachable.has("family.d4.incident-classification-severity"), "must reach D4-U3");
  assert.ok(reachable.has("family.d4.program-foundations-readiness"), "must reach D4-U1");
  assert.ok(reachable.size >= 27, `expected a large, fully cumulative recall pool, got ${reachable.size} families`);
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
  for (const familyId of ["family.d4.incident-classification-severity", "family.d4.escalation-communications"]) {
    const family = familiesById.get(familyId);
    if (family.lifecycle !== null) assert.equal(family.lifecycle, "lifecycle.incident", `${familyId} must only use the existing lifecycle.incident`);
    if (family.stage_target !== null) assert.ok(validStageIds.has(family.stage_target), `${familyId}.stage_target must be an existing stage ID`);
    for (const q of questionsByFamily(familyId)) {
      if (q.lifecycle !== null) assert.equal(q.lifecycle, "lifecycle.incident", `${q.id} must only use the existing lifecycle.incident`);
      if (q.stage !== null) assert.ok(validStageIds.has(q.stage), `${q.id}.stage must be an existing stage ID`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: FIRST/BEST/MOST, all genuinely source-grounded, no manufactured NEXT", () => {
  const d4Questions = [...questionsByFamily("family.d4.incident-classification-severity"), ...questionsByFamily("family.d4.escalation-communications")];
  const nextUsage = d4Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
  for (const q of d4Questions) {
    assert.ok(q.qualifier === null || ["qualifier.first", "qualifier.best", "qualifier.most", "qualifier.primarily"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier or null, got ${q.qualifier}`);
  }
});

test("Domain 4 U3/U4: all new entities are CANDIDATE, unverified, and none reference D4-U5+ or Domain 5", () => {
  const newEntities = [
    conceptsById.get("concept.d4.incident-classification-severity"),
    conceptsById.get("concept.d4.escalation-communications"),
    lessonsById.get("lesson.d4.incident-classification-severity"),
    lessonsById.get("lesson.d4.escalation-communications"),
    familiesById.get("family.d4.incident-classification-severity"),
    familiesById.get("family.d4.escalation-communications"),
    ...questionsByFamily("family.d4.incident-classification-severity"),
    ...questionsByFamily("family.d4.escalation-communications")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d5|\.d5\./.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 4 U3/U4 entity may reference Domain 5: ${bad.join(", ")}`);
});

test("no concept-id collisions: the two Domain 4 U3/U4 concepts are distinct from each other and from every other concept", () => {
  const u3u4ConceptIds = ["concept.d4.incident-classification-severity", "concept.d4.escalation-communications"];
  for (const id of u3u4ConceptIds) assert.ok(conceptsById.has(id), `${id} must exist`);
  const otherIds = data.concepts.filter((c) => !u3u4ConceptIds.includes(c.id)).map((c) => c.id);
  for (const id of u3u4ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with any other concept id`);
});

test("batch boundary: no Domain 4 unit beyond U1-U4 exists yet, and no Domain 5 exists", () => {
  const d4Lessons = data.lessons.filter((l) => l.domain === "domain.d4").map((l) => l.id);
  assert.deepEqual(
    d4Lessons.sort(),
    [
      "lesson.d4.program-foundations-readiness",
      "lesson.d4.business-impact-analysis-prioritization",
      "lesson.d4.incident-classification-severity",
      "lesson.d4.escalation-communications"
    ].sort(),
    "only D4-U1 through D4-U4 may exist in this batch - D4-U5+ is not yet authored"
  );
  const laterDomainIds = [...data.concepts, ...data.lessons, ...data.families, ...data.questions]
    .map((e) => e.id)
    .filter((id) => /\.d[5-9]\./.test(id) || /^domain\.d[5-9]$/.test(id));
  assert.equal(laterDomainIds.length, 0, `no Domain 5+ entity may exist yet: ${laterDomainIds.join(", ")}`);
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/3 and D4-U1/U2 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
  assert.ok(conceptsById.has("concept.d3.program-synthesis"));
  assert.ok(conceptsById.has("concept.d4.incident-management-readiness"));
  assert.ok(conceptsById.has("concept.d4.business-impact-analysis-prioritization"));
});

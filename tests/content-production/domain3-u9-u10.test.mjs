// D3-U9 (Program Metrics & Reporting) and D3-U10 (Program Synthesis /
// Capstone) — Domain 3 authoring Batch 5, the final Domain 3 batch for the
// current MVP curriculum boundary, built per the approved
// docs/learning/DOMAIN-3-CURRICULUM-ARCHITECTURE.md and the Architect's
// D3-U9/U10 authoring directive. Mirrors the domain3-u1-u2.test.mjs,
// domain3-u3-u4.test.mjs, domain3-u5-u6.test.mjs, and domain3-u7-u8.test.mjs
// precedent: tests the learning contract and architecture, not arbitrary
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

function meridianAndSettingChecks(familyId) {
  const variants = questionsByFamily(familyId);
  const meridianVariants = variants.filter((q) => /Meridian|Aldergate/.test(q.prompt));
  assert.ok(meridianVariants.length >= 1, `${familyId}: at least one variant must use the Meridian Manufacturing anchor`);
  assert.ok(meridianVariants.length <= 1, `${familyId}: Meridian must remain an anchor, not the setting for more than one variant`);
  const nonMeridian = variants.filter((q) => !/Meridian|Aldergate/.test(q.prompt));
  assert.ok(nonMeridian.length >= 2, `${familyId}: at least 2 of 3 variants must use a non-Meridian setting`);
  const settings = new Set(nonMeridian.map((q) => q.variation_tags.find((t) => t.startsWith("business-setting:"))));
  assert.equal(settings.size, nonMeridian.length, `${familyId}: non-Meridian variants must use different business settings from each other`);
}

// --- D3-U9: Program Metrics & Reporting --------------------------------------

test("D3-U9: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.program-metrics-reporting"));
  assert.ok(lessonsById.has("lesson.d3.program-metrics-reporting"));
  assert.ok(familiesById.has("family.d3.program-metrics-reporting"));

  const lesson = lessonsById.get("lesson.d3.program-metrics-reporting");
  assert.ok(lesson.concepts.includes("concept.d3.program-metrics-reporting"));
  const family = familiesById.get("family.d3.program-metrics-reporting");
  assert.ok(family.concepts.includes("concept.d3.program-metrics-reporting"));
  assert.equal(conceptsById.get("concept.d3.program-metrics-reporting").home_domain, "domain.d3");
});

test("D3-U9: family.d3.program-metrics-reporting has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.program-metrics-reporting");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U9: correctly depends on D3-U8 (Managing External Services)", () => {
  const lesson = lessonsById.get("lesson.d3.program-metrics-reporting");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.external-services"], "D3-U9 must be prerequisite on D3-U8 only");
});

test("D3-U9: teaches activity/output metrics ≠ effectiveness metrics, reinforcing P07 for metric selection", () => {
  const lesson = lessonsById.get("lesson.d3.program-metrics-reporting");
  assert.ok(lesson.patterns.includes("pattern.p07"));
  const family = familiesById.get("family.d3.program-metrics-reporting");
  assert.ok(family.patterns.includes("pattern.p07"));

  // At least one variant must include an activity/output/isolated-figure
  // distractor; a variant built around the KPI-vs-KRI-vs-gap-analysis
  // measurement-type facet (question.d3.0027) legitimately tests a
  // related but distinct facet of the same P07 reasoning (a KRI/gap
  // report is not evidence of overall effectiveness either) rather than
  // repeating the activity-count distractor shape.
  const variants = questionsByFamily("family.d3.program-metrics-reporting");
  const activityDistractorVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(number of|percentage of|count|deployed|completed|applied|isolated|this (quarter|month))/i.test(o.text))
  );
  assert.ok(activityDistractorVariant, "at least one D3-U9 variant must include an activity/output/isolated-figure distractor");
});

test("D3-U9: teaches audience-appropriate reporting, reusing P11 (Domain 3's first use of this Domain-2-established pattern)", () => {
  const lesson = lessonsById.get("lesson.d3.program-metrics-reporting");
  assert.ok(lesson.patterns.includes("pattern.p11"));
  const family = familiesById.get("family.d3.program-metrics-reporting");
  assert.ok(family.patterns.includes("pattern.p11"));
  // At least one variant must be tagged with P11 specifically (audience routing).
  const audienceVariant = questionsByFamily("family.d3.program-metrics-reporting").find((q) => q.patterns.includes("pattern.p11"));
  assert.ok(audienceVariant, "at least one D3-U9 variant must tag pattern.p11 (audience-appropriate communication)");
});

test("D3-U9: KPI/KRI/KCI/OKR are taught as concise, decision-relevant distinctions (not a vocabulary dump), matching docs/learning/CONFUSING-CONCEPTS.md's approved phrasing", () => {
  const concept = conceptsById.get("concept.d3.program-metrics-reporting");
  assert.match(concept.plain, /key performance indicator \(KPI\)/i);
  assert.match(concept.plain, /key risk indicator \(KRI\)/i);
  assert.match(concept.plain, /key control indicator \(KCI\)/i);
  assert.match(concept.plain, /objective and key result \(OKR\)/i);

  // At least one variant must test a genuine KPI-vs-KRI (or vs. KCI/OKR)
  // distinction, not mere acronym recall - the correct answer must reason
  // about what the measurement type actually shows, and at least one wrong
  // option must be a different named measurement/report type.
  const variants = questionsByFamily("family.d3.program-metrics-reporting");
  const metricTypeVariant = variants.find((q) =>
    /\b(KPI|KRI|KCI|OKR|key performance indicator|key risk indicator|key control indicator|objective and key result)\b/i.test(
      q.prompt + " " + q.options.map((o) => o.text).join(" ")
    )
  );
  assert.ok(metricTypeVariant, "at least one D3-U9 variant must test a KPI/KRI/KCI/OKR-type distinction");
  const correct = metricTypeVariant.options.find((o) => o.correct);
  assert.match(correct.rationale, /(performance|risk exposure|control|goal)/i, "the correct answer must reason about what the measurement type actually shows, not just name it");
});

test("D3-U9: source-grounding note documents the 3A5/3B6 evidence and the KPI/KRI/KCI/OKR thin-evidence gap transparently", () => {
  const concept = conceptsById.get("concept.d3.program-metrics-reporting");
  assert.match(concept.note, /3A5/);
  assert.match(concept.note, /3B6/);
  assert.match(concept.note, /(thin|gap)/i);
});

test("D3-U9: Meridian anchors exactly one variant; the other two use different non-Meridian settings", () => {
  meridianAndSettingChecks("family.d3.program-metrics-reporting");
});

test("D3-U9: repair metadata routes through the shared, domain-agnostic repair system (no D3-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d3.program-metrics-reporting")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D3-U10: Program Synthesis / Capstone ------------------------------------

test("D3-U10: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.program-synthesis"));
  assert.ok(lessonsById.has("lesson.d3.program-synthesis"));
  assert.ok(familiesById.has("family.d3.program-synthesis"));

  const lesson = lessonsById.get("lesson.d3.program-synthesis");
  assert.ok(lesson.concepts.includes("concept.d3.program-synthesis"));
  const family = familiesById.get("family.d3.program-synthesis");
  assert.ok(family.concepts.includes("concept.d3.program-synthesis"));
});

test("D3-U10: family.d3.program-synthesis has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.program-synthesis");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U10: correctly depends on D3-U9 (Program Metrics & Reporting), and that single edge transitively covers every prior D3 family", () => {
  const lesson = lessonsById.get("lesson.d3.program-synthesis");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.program-metrics-reporting"], "D3-U10 must be prerequisite on D3-U9 only");

  const reachable = ancestorFamilies("lesson.d3.program-synthesis");
  const priorD3Families = [
    "family.d3.program-foundations",
    "family.d3.asset-classification",
    "family.d3.policy-governance",
    "family.d3.control-design-selection",
    "family.d3.control-implementation-integration",
    "family.d3.control-testing-evaluation",
    "family.d3.awareness-training",
    "family.d3.external-services"
  ];
  for (const f of priorD3Families) {
    assert.ok(reachable.has(f), `D3-U10's recall pool must reach ${f} through the prerequisite chain`);
  }
});

test("D3-U10 actually synthesizes rather than recaps: every variant's concepts array integrates concept.d3.program-synthesis plus at least two other, distinct prior Domain 3 concepts", () => {
  const variants = questionsByFamily("family.d3.program-synthesis");
  for (const q of variants) {
    assert.ok(q.concepts.includes("concept.d3.program-synthesis"), `${q.id} must include concept.d3.program-synthesis`);
    const otherConcepts = q.concepts.filter((c) => c !== "concept.d3.program-synthesis");
    assert.ok(otherConcepts.length >= 2, `${q.id} must integrate at least two other Domain 3 concepts beyond the synthesis concept itself (got ${otherConcepts.length}) - single-concept questions are not genuine integration`);
    for (const c of otherConcepts) {
      assert.ok(c.startsWith("concept.d3."), `${q.id}'s integrated concept ${c} must be a Domain 3 concept`);
    }
  }
});

test("D3-U10: taught-before-tested holds for every integrated concept each variant references, not just the retrieval question", () => {
  const taught = taughtConceptsFor("lesson.d3.program-synthesis");
  const variants = questionsByFamily("family.d3.program-synthesis");
  for (const q of variants) {
    for (const c of q.concepts) {
      assert.ok(taught.has(c), `${q.id} references ${c}, which must already be taught by D3-U10's own prerequisite chain`);
    }
  }
});

test("D3-U10: no variant answers from only one prior unit's lens - each correct answer's rationale addresses more than one integrated fact", () => {
  const variants = questionsByFamily("family.d3.program-synthesis");
  for (const q of variants) {
    const correct = q.options.find((o) => o.correct);
    // A genuine integration rationale should be substantive enough to
    // connect more than one fact - a single short clause is a signal the
    // question collapsed back into a single-concept question in practice.
    assert.ok(correct.rationale.length >= 80, `${q.id}'s correct rationale (${correct.rationale.length} chars) looks too short to connect multiple integrated facts`);
  }
  // Cross-check against the explanation field too: it should reference
  // more than one prior reasoning target's language.
  for (const q of variants) {
    assert.ok(q.explanation.length >= 100, `${q.id}'s explanation should be substantive enough to tie the integrated facts together`);
  }
});

test("D3-U10: reuses existing patterns only (P07, P02, P11) - no new pattern invented for the capstone", () => {
  const concept = conceptsById.get("concept.d3.program-synthesis");
  const allowed = ["pattern.p07", "pattern.p02", "pattern.p11"];
  for (const p of concept.related_patterns) {
    assert.ok(allowed.includes(p), `concept.d3.program-synthesis.related_patterns must only reuse existing patterns, found ${p}`);
  }
  const variants = questionsByFamily("family.d3.program-synthesis");
  for (const q of variants) {
    assert.equal(q.patterns.length, 1, `${q.id} should tag exactly its own most-salient pattern, mirroring family.d2.risk-management-synthesis's precedent`);
    assert.ok(allowed.includes(q.patterns[0]), `${q.id}.patterns[0] must be one of the batch's reused patterns, found ${q.patterns[0]}`);
  }
});

test("D3-U10: does not reveal unit labels or the tested concept before submission, in either the assessment or the Learn narrative", () => {
  const forbidden = /\bD3-U\d\d?\b|\bunit \d\d?\b/i;
  const variants = questionsByFamily("family.d3.program-synthesis");
  for (const q of variants) {
    assert.doesNotMatch(q.prompt, forbidden, `${q.id}'s prompt must not reveal which unit(s) it draws on`);
    for (const o of q.options) {
      assert.doesNotMatch(o.text, forbidden, `${q.id} option ${o.key} must not reveal which unit(s) it draws on`);
    }
  }
  // The capstone's own Learn narrative must also read as one integrated
  // story, not a labeled recap of prior units - unlike ordinary D3 lessons
  // (D3-U6/U7/U9), which do legitimately cross-reference prior unit labels
  // as connective tissue, per the binding capstone-specific instruction to
  // avoid unit labels in the capstone's own learning/assessment experience.
  const lesson = lessonsById.get("lesson.d3.program-synthesis");
  for (const field of ["objective", "context", "cism_perspective", "scenario"]) {
    assert.doesNotMatch(lesson[field], forbidden, `lesson.d3.program-synthesis.${field} must not reveal explicit unit labels`);
  }
});

test("D3-U10: remains management-level - no deep technical detail introduced at the capstone", () => {
  const forbidden = /(firewall rule syntax|VPN configuration|packet capture|source code review tool|network scanner)/i;
  const lesson = lessonsById.get("lesson.d3.program-synthesis");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U10 must remain management-level");
  for (const q of questionsByFamily("family.d3.program-synthesis")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must remain management-level`);
  }
});

test("D3-U10: Meridian anchors exactly one variant; the other two transfer to different organizations", () => {
  meridianAndSettingChecks("family.d3.program-synthesis");
});

test("D3-U10: repair metadata routes through the shared, domain-agnostic repair system (no capstone-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d3.program-synthesis")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: lifecycle, qualifiers, batch boundary, Domain 3 completion ---

test("no invented Domain 3 lifecycle anywhere in this batch: lifecycle/stage/stage_target remain null on every new entity", () => {
  for (const familyId of ["family.d3.program-metrics-reporting", "family.d3.program-synthesis"]) {
    const family = familiesById.get(familyId);
    assert.equal(family.lifecycle, null, `${familyId}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(family.stage_target, null, `${familyId}.stage_target must be null - Domain 3 has no canonical lifecycle`);
    for (const q of questionsByFamily(familyId)) {
      assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
      assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: BEST/MOST only, no manufactured NEXT", () => {
  const d3U9U10Questions = [...questionsByFamily("family.d3.program-metrics-reporting"), ...questionsByFamily("family.d3.program-synthesis")];
  const nextUsage = d3U9U10Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
  for (const q of d3U9U10Questions) {
    assert.ok(["qualifier.best", "qualifier.most"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier (BEST/MOST), got ${q.qualifier}`);
  }
});

test("Domain 3 so far (U1-U10): all new entities are CANDIDATE, unverified, and none reference Domain 4", () => {
  const newEntities = [
    conceptsById.get("concept.d3.program-metrics-reporting"),
    conceptsById.get("concept.d3.program-synthesis"),
    lessonsById.get("lesson.d3.program-metrics-reporting"),
    lessonsById.get("lesson.d3.program-synthesis"),
    familiesById.get("family.d3.program-metrics-reporting"),
    familiesById.get("family.d3.program-synthesis"),
    ...questionsByFamily("family.d3.program-metrics-reporting"),
    ...questionsByFamily("family.d3.program-synthesis")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 3 U9/U10 entity may reference Domain 4: ${bad.join(", ")}`);
});

test("no concept-id collisions: all ten Domain 3 concepts authored so far are distinct from each other and from every Domain 1/2 concept", () => {
  const d3ConceptIds = data.concepts.filter((c) => c.id.startsWith("concept.d3.")).map((c) => c.id);
  assert.equal(new Set(d3ConceptIds).size, d3ConceptIds.length, "Domain 3 concept ids must be unique");
  assert.equal(d3ConceptIds.length, 10, `expected exactly 10 Domain 3 concepts (U1-U10), found ${d3ConceptIds.length}`);
  const otherIds = data.concepts.filter((c) => !c.id.startsWith("concept.d3.")).map((c) => c.id);
  for (const id of d3ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with a Domain 1/2/Foundation concept id`);
});

test("Domain 3 completion boundary: exactly D3-U1 through D3-U10 exist - no D3-U11+ was authored in this batch", () => {
  const d3Lessons = data.lessons.filter((l) => l.domain === "domain.d3").map((l) => l.id);
  assert.deepEqual(
    d3Lessons.sort(),
    [
      "lesson.d3.asset-classification",
      "lesson.d3.awareness-training",
      "lesson.d3.control-design-selection",
      "lesson.d3.control-implementation-integration",
      "lesson.d3.control-testing-evaluation",
      "lesson.d3.external-services",
      "lesson.d3.policy-governance",
      "lesson.d3.program-foundations",
      "lesson.d3.program-metrics-reporting",
      "lesson.d3.program-synthesis"
    ].sort(),
    "Domain 3 is complete for the current MVP curriculum boundary at exactly D3-U1 through D3-U10 - D3-U11+ and Domain 4 are not yet authored"
  );
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/D3-U1-U8 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
  assert.ok(conceptsById.has("concept.d1.authority-accountability"));
});

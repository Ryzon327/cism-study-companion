// D3-U7 (Security Awareness & Training) and D3-U8 (Managing External
// Services) — Domain 3 authoring Batch 4, built per the approved
// docs/learning/DOMAIN-3-CURRICULUM-ARCHITECTURE.md and the Architect's
// D3-U7/U8 authoring directive. Mirrors the domain3-u1-u2.test.mjs,
// domain3-u3-u4.test.mjs, and domain3-u5-u6.test.mjs precedent: tests the
// learning contract and architecture, not arbitrary implementation
// details. General structural invariants (id format, referential
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

// --- D3-U7: Security Awareness & Training -----------------------------------

test("D3-U7: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.awareness-training-effectiveness"));
  assert.ok(lessonsById.has("lesson.d3.awareness-training"));
  assert.ok(familiesById.has("family.d3.awareness-training"));

  const lesson = lessonsById.get("lesson.d3.awareness-training");
  assert.ok(lesson.concepts.includes("concept.d3.awareness-training-effectiveness"));
  const family = familiesById.get("family.d3.awareness-training");
  assert.ok(family.concepts.includes("concept.d3.awareness-training-effectiveness"));
  assert.equal(conceptsById.get("concept.d3.awareness-training-effectiveness").home_domain, "domain.d3");
});

test("D3-U7: family.d3.awareness-training has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.awareness-training");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U7: correctly depends on D3-U6 (Control Testing & Evaluation)", () => {
  const lesson = lessonsById.get("lesson.d3.awareness-training");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.control-testing-evaluation"], "D3-U7 must be prerequisite on D3-U6 only");
});

test("D3-U7: awareness and training are not treated as pure synonyms - the concept distinguishes broad/ongoing awareness from role-specific/customized training", () => {
  const concept = conceptsById.get("concept.d3.awareness-training-effectiveness");
  assert.match(concept.plain, /awareness is the ongoing, broad/i, "awareness must be described as the broad, ongoing effort");
  assert.match(concept.plain, /training goes further/i, "training must be described as going further than awareness");
  assert.match(concept.plain, /(role-specific|customized)/i, "training must be tied to role-specific/customized content");
});

test("D3-U7: teaches activity (training delivered) vs. effectiveness (behavior changed / risk reduced) - reinforces P07 without repeating U6's control-testing framing", () => {
  const lesson = lessonsById.get("lesson.d3.awareness-training");
  assert.match(lesson.objective + " " + lesson.context, /(behavior|risk)/i);
  assert.doesNotMatch(
    lesson.context,
    /virus-detection|definition files/i,
    "D3-U7 must not simply reuse D3-U6's virus-detection-tool illustration"
  );

  const variants = questionsByFamily("family.d3.awareness-training");
  // At least one variant's correct answer must explicitly reason about behavior
  // change or risk reduction (the core P07 reinforcement); a variant built
  // around the FIRST-step/leadership-support facet (question.d3.0020) is
  // legitimately reasoning about a precondition for that redesign instead,
  // per the source-grounded "obtain senior leadership support" FIRST item.
  const behaviorVariant = variants.find((q) => {
    const correct = q.options.find((o) => o.correct);
    return /(behavior|risk|evidence)/i.test(correct.text + " " + correct.rationale);
  });
  assert.ok(behaviorVariant, "at least one D3-U7 variant's correct answer must reason about behavior change or risk reduction, not mere delivery");

  for (const q of variants) {
    const wrongOptions = q.options.filter((o) => !o.correct);
    assert.ok(
      wrongOptions.some((o) => /(completion|acknowledg|sign|deadline|retake|twice|second time|report(ing)? the .* rate)/i.test(o.text)),
      `${q.id} must include at least one activity/completion/acknowledgment-as-effectiveness distractor`
    );
  }
});

test("D3-U7: references pattern.p07 (Implementation ≠ Effectiveness) - reused, not a new pattern", () => {
  const lesson = lessonsById.get("lesson.d3.awareness-training");
  assert.ok(lesson.patterns.includes("pattern.p07"));
  const family = familiesById.get("family.d3.awareness-training");
  assert.ok(family.patterns.includes("pattern.p07"));
  for (const q of questionsByFamily("family.d3.awareness-training")) {
    assert.ok(q.patterns.includes("pattern.p07"), `${q.id} must reference pattern.p07`);
  }
});

test("D3-U7: at least one variant avoids a purely technical fix for a people/process problem", () => {
  const variants = questionsByFamily("family.d3.awareness-training");
  const technicalFixVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && o.repair_target === "repair.technical-vs-management-error")
  );
  assert.ok(technicalFixVariant, "at least one D3-U7 variant must include a purely-technical-fix distractor (technical controls do not eliminate the need for people/process measures)");
});

test("D3-U7: remains management-level - no deep technical training-delivery-platform detail", () => {
  const forbidden = /(LMS API|single sign-on integration|content management system configuration|video codec|streaming protocol)/i;
  const lesson = lessonsById.get("lesson.d3.awareness-training");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U7 must remain management-level, not a technical training-platform lesson");
  for (const q of questionsByFamily("family.d3.awareness-training")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must remain management-level`);
  }
});

test("D3-U7: source-grounding note documents the 3B4 evidence and the (lack of a) mistagging gap transparently", () => {
  const concept = conceptsById.get("concept.d3.awareness-training-effectiveness");
  assert.match(concept.note, /3B4/);
  assert.match(concept.note, /(management-level|callback)/i);
});

test("D3-U7: Meridian anchors exactly one variant; the other two use different non-Meridian settings", () => {
  meridianAndSettingChecks("family.d3.awareness-training");
});

test("D3-U7: repair metadata routes through the shared, domain-agnostic repair system (no D3-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d3.awareness-training")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D3-U8: Managing External Services ---------------------------------------

test("D3-U8: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.external-services-accountability"));
  assert.ok(lessonsById.has("lesson.d3.external-services"));
  assert.ok(familiesById.has("family.d3.external-services"));

  const lesson = lessonsById.get("lesson.d3.external-services");
  assert.ok(lesson.concepts.includes("concept.d3.external-services-accountability"));
  const family = familiesById.get("family.d3.external-services");
  assert.ok(family.concepts.includes("concept.d3.external-services-accountability"));
});

test("D3-U8: family.d3.external-services has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.external-services");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U8: correctly depends on D3-U7 (Security Awareness & Training)", () => {
  const lesson = lessonsById.get("lesson.d3.external-services");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.awareness-training"], "D3-U8 must be prerequisite on D3-U7 only");
});

test("D3-U8: teaches that outsourcing performance does not outsource accountability - the central Domain 3 external-services reasoning", () => {
  const lesson = lessonsById.get("lesson.d3.external-services");
  assert.match(lesson.memory_rules.join(" "), /accountab/i);
  assert.match(lesson.context, /accountab/i);

  // At least one variant's correct answer must explicitly keep accountability
  // internal and/or reach for the enterprise's own verification; the
  // FIRST-step variant (question.d3.0024) is legitimately reasoning about
  // confirming the agreement's currency instead, per the source-grounded
  // "is the agreement still right" FIRST item.
  const accountabilityVariant = questionsByFamily("family.d3.external-services").find((q) => {
    const correct = q.options.find((o) => o.correct);
    return /(accountab|verif|audit|monitor|oversight)/i.test(correct.text + " " + correct.rationale);
  });
  assert.ok(accountabilityVariant, "at least one D3-U8 variant's correct answer must keep accountability internal and/or reach for the enterprise's own verification");
});

test("D3-U8: contract-vs-assurance is treated explicitly - a contract/SLA/certification existing is distinguished from ongoing, independent verification", () => {
  const variants = questionsByFamily("family.d3.external-services");
  const contractVsAssuranceVariant = variants.find((q) =>
    q.options.some((o) => !o.correct && /(contract|SLA|certif|sign-off|indemnity)/i.test(o.text))
  );
  assert.ok(contractVsAssuranceVariant, "at least one D3-U8 variant must include a contract/SLA/certification-as-sufficient-assurance distractor");
});

test("D3-U8: references pattern.p02 (Authority Follows Accountability) - reused, not a new pattern", () => {
  const lesson = lessonsById.get("lesson.d3.external-services");
  assert.ok(lesson.patterns.includes("pattern.p02"));
  const family = familiesById.get("family.d3.external-services");
  assert.ok(family.patterns.includes("pattern.p02"));
  for (const q of questionsByFamily("family.d3.external-services")) {
    assert.ok(q.patterns.includes("pattern.p02"), `${q.id} must reference pattern.p02`);
  }
});

test("D3-U8: at least one variant explicitly connects to Domain 1's authority-follows-accountability / data-ownership recall", () => {
  const variants = questionsByFamily("family.d3.external-services");
  const recallVariant = variants.find((q) => /accountab/i.test(q.explanation + " " + q.memory_rule) && q.options.some((o) => o.correct && /accountab/i.test(o.text + " " + o.rationale)));
  assert.ok(recallVariant, "at least one D3-U8 variant must explicitly reason about accountability remaining internal (Domain 1 recall)");
});

test("D3-U8: Domain 1's authority-accountability and data-ownership families are reachable through D3-U8's cumulative recall pool (recalled, not re-taught)", () => {
  assert.ok(conceptsById.has("concept.d1.authority-accountability"), "concept.d1.authority-accountability must still exist, unmodified");
  assert.ok(conceptsById.has("concept.d1.data-ownership"), "concept.d1.data-ownership must still exist, unmodified");
  const u8Families = ancestorFamilies("lesson.d3.external-services");
  assert.ok(u8Families.has("family.d1.authority-accountability-decision"), "D3-U8's cumulative recall pool must reach Domain 1's authority-accountability family through the prerequisite chain");
  assert.ok(u8Families.has("family.d1.data-ownership-accountability"), "D3-U8's cumulative recall pool must reach Domain 1's data-ownership family through the prerequisite chain");
  assert.ok(u8Families.has("family.d2.risk-control-ownership"), "D3-U8's cumulative recall pool must reach Domain 2's risk-owner-vs-control-owner family through the prerequisite chain");
  // Sanity: D3-U8 does not re-teach these as its own concepts.
  const lesson = lessonsById.get("lesson.d3.external-services");
  assert.ok(!lesson.concepts.includes("concept.d1.authority-accountability"), "D3-U8's own lesson.concepts must not include the Domain 1 concept id");
  assert.ok(!lesson.concepts.includes("concept.d1.data-ownership"), "D3-U8's own lesson.concepts must not include the Domain 1 concept id");
});

test("D3-U8: no invented vendor-management lifecycle - the U7->U8 and internal contract-signing sequencing is dependency/scenario structure, not a lifecycle", () => {
  const family = familiesById.get("family.d3.external-services");
  assert.equal(family.lifecycle, null);
  assert.equal(family.stage_target, null);
  for (const q of questionsByFamily("family.d3.external-services")) {
    assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
  }
});

test("D3-U8: remains management-level - no deep technical vendor-security-tooling detail", () => {
  const forbidden = /(firewall rule syntax|VPN configuration|API key rotation script|penetration-testing toolkit)/i;
  const lesson = lessonsById.get("lesson.d3.external-services");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U8 must remain management-level, not a technical vendor-security lesson");
  for (const q of questionsByFamily("family.d3.external-services")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must remain management-level`);
  }
});

test("D3-U8: source-grounding note documents the 3B5 evidence", () => {
  const concept = conceptsById.get("concept.d3.external-services-accountability");
  assert.match(concept.note, /3B5/);
});

test("D3-U8: Meridian anchors exactly one variant; the other two use different non-Meridian settings", () => {
  meridianAndSettingChecks("family.d3.external-services");
});

test("D3-U8: repair metadata routes through the shared, domain-agnostic repair system (no D3-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d3.external-services")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: taught-before-tested, lifecycle, qualifiers, batch boundary ---

test("taught-before-tested: D3-U7 and D3-U8's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d3.awareness-training", "lesson.d3.external-services"]) {
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

test("no invented Domain 3 lifecycle anywhere in this batch: lifecycle/stage/stage_target remain null on every new entity", () => {
  for (const familyId of ["family.d3.awareness-training", "family.d3.external-services"]) {
    const family = familiesById.get(familyId);
    assert.equal(family.lifecycle, null, `${familyId}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(family.stage_target, null, `${familyId}.stage_target must be null - Domain 3 has no canonical lifecycle`);
    for (const q of questionsByFamily(familyId)) {
      assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
      assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
    }
  }
});

test("qualifier usage in this batch is source-appropriate: every FIRST/NEXT usage is genuinely source-grounded sequencing, not an invented lifecycle position", () => {
  const d3U7U8Questions = [...questionsByFamily("family.d3.awareness-training"), ...questionsByFamily("family.d3.external-services")];
  const sequencingQualifiers = d3U7U8Questions.filter((q) => q.qualifier === "qualifier.first" || q.qualifier === "qualifier.next");
  // Both units' source material contains genuine FIRST/NEXT items (3B4's
  // "FIRST step after a failed phishing simulation" and 3B5's "NEXT step
  // once a vendor contract is signed" / "FIRST step when a long-standing
  // vendor disappoints"), unlike D3-U5/U6 where no such source-grounded
  // item existed. Each usage here must still carry no lifecycle/stage.
  assert.ok(sequencingQualifiers.length >= 1, "at least one FIRST/NEXT usage is expected, per genuine source evidence in 3B4/3B5");
  for (const q of sequencingQualifiers) {
    assert.equal(q.lifecycle, null, `${q.id} uses a sequencing qualifier but must not carry a lifecycle`);
    assert.equal(q.stage, null, `${q.id} uses a sequencing qualifier but must not carry a stage`);
  }
  const otherQualifiers = d3U7U8Questions.filter((q) => q.qualifier !== "qualifier.first" && q.qualifier !== "qualifier.next");
  for (const q of otherQualifiers) {
    assert.ok(["qualifier.best", "qualifier.most"].includes(q.qualifier), `${q.id} must use a source-appropriate qualifier (BEST/MOST/FIRST/NEXT), got ${q.qualifier}`);
  }
});

test("Domain 3 so far (U1-U8): all new entities are CANDIDATE, unverified, and none reference a future domain (D4) or a later Domain 3 unit", () => {
  const newEntities = [
    conceptsById.get("concept.d3.awareness-training-effectiveness"),
    conceptsById.get("concept.d3.external-services-accountability"),
    lessonsById.get("lesson.d3.awareness-training"),
    lessonsById.get("lesson.d3.external-services"),
    familiesById.get("family.d3.awareness-training"),
    familiesById.get("family.d3.external-services"),
    ...questionsByFamily("family.d3.awareness-training"),
    ...questionsByFamily("family.d3.external-services")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 3 U7/U8 entity may reference Domain 4: ${bad.join(", ")}`);
});

test("no concept-id collisions: all eight Domain 3 concepts authored so far are distinct from each other and from every Domain 1/2 concept", () => {
  const d3ConceptIds = data.concepts.filter((c) => c.id.startsWith("concept.d3.")).map((c) => c.id);
  assert.equal(new Set(d3ConceptIds).size, d3ConceptIds.length, "Domain 3 concept ids must be unique");
  const otherIds = data.concepts.filter((c) => !c.id.startsWith("concept.d3.")).map((c) => c.id);
  for (const id of d3ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with a Domain 1/2/Foundation concept id`);
});

// Originally "no Domain 3 unit beyond U1-U8 exists yet" — that boundary is
// superseded now that D3-U9/U10 have legitimately been authored (see
// domain3-u9-u10.test.mjs, which owns the current batch-boundary
// assertion), mirroring the exact precedent already established at every
// prior batch transition (see the equivalent comments in
// domain3-u1-u2.test.mjs, domain3-u3-u4.test.mjs, and
// domain3-u5-u6.test.mjs). This file's own U7/U8 entities remain asserted
// unchanged by the tests above.

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/D3-U1-U6 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
});

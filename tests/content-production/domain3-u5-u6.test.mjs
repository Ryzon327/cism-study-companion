// D3-U5 (Control Implementation & Integration) and D3-U6 (Control Testing
// & Evaluation) — Domain 3 authoring Batch 3, built per the approved
// docs/learning/DOMAIN-3-CURRICULUM-ARCHITECTURE.md and the Architect's
// D3-U5/U6 authoring directive. Mirrors the domain3-u1-u2.test.mjs and
// domain3-u3-u4.test.mjs precedent: tests the learning contract and
// architecture, not arbitrary implementation details. General structural
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

// --- D3-U5: Control Implementation & Integration ---------------------------

test("D3-U5: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.control-implementation-integration"));
  assert.ok(lessonsById.has("lesson.d3.control-implementation-integration"));
  assert.ok(familiesById.has("family.d3.control-implementation-integration"));

  const lesson = lessonsById.get("lesson.d3.control-implementation-integration");
  assert.ok(lesson.concepts.includes("concept.d3.control-implementation-integration"));
  const family = familiesById.get("family.d3.control-implementation-integration");
  assert.ok(family.concepts.includes("concept.d3.control-implementation-integration"));
  assert.equal(conceptsById.get("concept.d3.control-implementation-integration").home_domain, "domain.d3");
});

test("D3-U5: family.d3.control-implementation-integration has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.control-implementation-integration");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U5: correctly depends on D3-U4 (Control Design & Selection)", () => {
  const lesson = lessonsById.get("lesson.d3.control-implementation-integration");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.control-design-selection"], "D3-U5 must be prerequisite on D3-U4 only");
});

test("D3-U5: teaches implementation vs. integration - a control can be implemented without being embedded in the actual workflow", () => {
  const lesson = lessonsById.get("lesson.d3.control-implementation-integration");
  assert.match(lesson.context, /implement/i);
  assert.match(lesson.context, /integrat/i);
  assert.match(lesson.context + " " + lesson.cism_perspective, /(parallel|bolt-on|alongside|separate)/i, "the lesson must explicitly contrast integration against a separate/parallel/bolt-on activity");

  for (const q of questionsByFamily("family.d3.control-implementation-integration")) {
    const correct = q.options.find((o) => o.correct);
    assert.match(
      correct.text + " " + correct.rationale,
      /(embed|integrat|process|workflow)/i,
      `${q.id}'s correct answer must reason about embedding the control into the actual workflow/process`
    );
  }
});

test("D3-U5: references pattern.p09 (Security Embedded in Business Process) - reused, not a new pattern", () => {
  const lesson = lessonsById.get("lesson.d3.control-implementation-integration");
  assert.ok(lesson.patterns.includes("pattern.p09"));
  const family = familiesById.get("family.d3.control-implementation-integration");
  assert.ok(family.patterns.includes("pattern.p09"));
  for (const q of questionsByFamily("family.d3.control-implementation-integration")) {
    assert.ok(q.patterns.includes("pattern.p09"), `${q.id} must reference pattern.p09`);
  }
});

test("D3-U5: remains management-level - no deep technical implementation detail", () => {
  const forbidden = /(firewall|VLAN|DMZ|IP address|packet|registry key|configure the server|command line|source code)/i;
  const lesson = lessonsById.get("lesson.d3.control-implementation-integration");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U5 must remain management-level, not a technical implementation lesson");
  for (const q of questionsByFamily("family.d3.control-implementation-integration")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must remain management-level`);
  }
});

test("D3-U5: source-grounding note documents the 3B2 mistagging gap transparently, mirroring the 3A1 precedent", () => {
  const concept = conceptsById.get("concept.d3.control-implementation-integration");
  assert.match(concept.note, /3B2/);
  assert.match(concept.note, /(mistag|technical)/i);
});

test("D3-U5: Meridian anchors exactly one variant; the other two use different non-Meridian settings", () => {
  meridianAndSettingChecks("family.d3.control-implementation-integration");
});

test("D3-U5: repair metadata routes through the shared, domain-agnostic repair system (no D3-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d3.control-implementation-integration")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- D3-U6: Control Testing & Evaluation ------------------------------------

test("D3-U6: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.control-testing-evaluation"));
  assert.ok(lessonsById.has("lesson.d3.control-testing-evaluation"));
  assert.ok(familiesById.has("family.d3.control-testing-evaluation"));

  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  assert.ok(lesson.concepts.includes("concept.d3.control-testing-evaluation"));
  const family = familiesById.get("family.d3.control-testing-evaluation");
  assert.ok(family.concepts.includes("concept.d3.control-testing-evaluation"));
});

test("D3-U6: family.d3.control-testing-evaluation has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.control-testing-evaluation");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U6: correctly depends on D3-U5 (Control Implementation & Integration)", () => {
  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  assert.deepEqual(lesson.prerequisites, ["lesson.d3.control-implementation-integration"], "D3-U6 must be prerequisite on D3-U5 only");
});

test("D3-U6: teaches existence/implementation != effectiveness - the central, load-bearing Domain 3 pattern", () => {
  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  assert.match(lesson.context, /(effective|outcome)/i);
  assert.match(lesson.memory_rules.join(" "), /it exists.*it works|exist.*work/i);

  for (const q of questionsByFamily("family.d3.control-testing-evaluation")) {
    const correct = q.options.find((o) => o.correct);
    assert.match(
      correct.text + " " + correct.rationale,
      /(evidence|outcome|actual)/i,
      `${q.id}'s correct answer must demand evidence of outcome, not mere activity/existence`
    );
    const wrongOptions = q.options.filter((o) => !o.correct);
    // At least one distractor per question must represent an activity/existence/documentation trap.
    assert.ok(
      wrongOptions.some((o) => /(install|deploy|complet|document|polic(y|ies)|configur|count|cost)/i.test(o.text)),
      `${q.id} must include at least one activity/existence-as-effectiveness distractor`
    );
  }
});

test("D3-U6: references pattern.p07 (Implementation != Effectiveness) - reused as Domain 3's own load-bearing pattern, not invented here", () => {
  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  assert.ok(lesson.patterns.includes("pattern.p07"));
  const family = familiesById.get("family.d3.control-testing-evaluation");
  assert.ok(family.patterns.includes("pattern.p07"));
  for (const q of questionsByFamily("family.d3.control-testing-evaluation")) {
    assert.ok(q.patterns.includes("pattern.p07"), `${q.id} must reference pattern.p07`);
  }
});

test("D3-U6: at least one variant connects control evaluation to Domain 2's residual-risk-acceptability recall", () => {
  const variants = questionsByFamily("family.d3.control-testing-evaluation");
  const residualRiskVariant = variants.find((q) => /residual risk/i.test(q.explanation + " " + q.recognition_clue + " " + q.memory_rule));
  assert.ok(residualRiskVariant, "at least one D3-U6 variant must explicitly reason about residual risk (Domain 2 recall)");
});

test("D3-U6: Domain 2's residual-risk-acceptability family is reachable through D3-U6's cumulative recall pool (recalled, not re-taught)", () => {
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"), "concept.d2.residual-risk-acceptability must still exist, unmodified");
  const u6Families = ancestorFamilies("lesson.d3.control-testing-evaluation");
  assert.ok(u6Families.has("family.d2.residual-risk-acceptability"), "D3-U6's cumulative recall pool must reach Domain 2's residual-risk-acceptability family through the prerequisite chain");
  // Sanity: D3-U6 does not re-teach it as its own concept.
  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  assert.ok(!lesson.concepts.includes("concept.d2.residual-risk-acceptability"), "D3-U6's own lesson.concepts must not include the Domain 2 concept id");
});

test("D3-U6: does not become a quantitative-risk or auditor-vocabulary lesson", () => {
  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  const forbidden = /(SLE|ALE|ARO|single loss expectancy|annualized loss expectancy)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U6 must not become a quantitative-risk-arithmetic lesson");
});

test("D3-U6: remains management-level - no deep technical testing-methodology detail", () => {
  const forbidden = /(penetration test methodology|black box|white box|source code review tool|network scanner|packet capture)/i;
  const lesson = lessonsById.get("lesson.d3.control-testing-evaluation");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U6 must remain management-level, not a technical testing-methodology lesson");
});

test("D3-U6: source-grounding note documents 3B3 evidence and cites Domain 3's own blueprint for P07's load-bearing status", () => {
  const concept = conceptsById.get("concept.d3.control-testing-evaluation");
  assert.match(concept.note, /3B3/);
  assert.match(concept.note, /load-bearing/i);
});

test("D3-U6: Meridian anchors exactly one variant; the other two use different non-Meridian settings", () => {
  meridianAndSettingChecks("family.d3.control-testing-evaluation");
});

test("D3-U6: repair metadata routes through the shared, domain-agnostic repair system (no D3-specific repair architecture)", () => {
  for (const q of questionsByFamily("family.d3.control-testing-evaluation")) {
    for (const opt of q.options) {
      if (!opt.correct) assert.ok(opt.repair_target, `${q.id} option ${opt.key} must declare a repair_target`);
    }
  }
});

// --- Cross-cutting: taught-before-tested, lifecycle, qualifiers, batch boundary ---

test("taught-before-tested: D3-U5 and D3-U6's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
  const questionsById = new Map(data.questions.map((q) => [q.id, q]));
  for (const lessonId of ["lesson.d3.control-implementation-integration", "lesson.d3.control-testing-evaluation"]) {
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
  for (const familyId of ["family.d3.control-implementation-integration", "family.d3.control-testing-evaluation"]) {
    const family = familiesById.get(familyId);
    assert.equal(family.lifecycle, null, `${familyId}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(family.stage_target, null, `${familyId}.stage_target must be null - Domain 3 has no canonical lifecycle`);
    for (const q of questionsByFamily(familyId)) {
      assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
      assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
    }
  }
});

test("no NEXT qualifier manufactured anywhere in this batch", () => {
  const d3U5U6Questions = [...questionsByFamily("family.d3.control-implementation-integration"), ...questionsByFamily("family.d3.control-testing-evaluation")];
  const nextUsage = d3U5U6Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
});

test("qualifier usage is source-appropriate: MOST/BEST dominant in this batch", () => {
  const d3U5U6Questions = [...questionsByFamily("family.d3.control-implementation-integration"), ...questionsByFamily("family.d3.control-testing-evaluation")];
  const qualifiers = d3U5U6Questions.map((q) => q.qualifier);
  const mostOrBest = qualifiers.filter((q) => q === "qualifier.most" || q === "qualifier.best").length;
  assert.equal(mostOrBest, qualifiers.length, "MOST/BEST should be the only qualifiers used in this batch, per source evidence");
});

test("Domain 3 so far (U1-U6): all new entities are CANDIDATE, unverified, and none reference a future domain (D4) or a later Domain 3 unit", () => {
  const newEntities = [
    conceptsById.get("concept.d3.control-implementation-integration"),
    conceptsById.get("concept.d3.control-testing-evaluation"),
    lessonsById.get("lesson.d3.control-implementation-integration"),
    lessonsById.get("lesson.d3.control-testing-evaluation"),
    familiesById.get("family.d3.control-implementation-integration"),
    familiesById.get("family.d3.control-testing-evaluation"),
    ...questionsByFamily("family.d3.control-implementation-integration"),
    ...questionsByFamily("family.d3.control-testing-evaluation")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 3 U5/U6 entity may reference Domain 4: ${bad.join(", ")}`);
});

test("no concept-id collisions: all six Domain 3 concepts authored so far are distinct from each other and from every Domain 1/2 concept", () => {
  const d3ConceptIds = data.concepts.filter((c) => c.id.startsWith("concept.d3.")).map((c) => c.id);
  assert.equal(new Set(d3ConceptIds).size, d3ConceptIds.length, "Domain 3 concept ids must be unique");
  const otherIds = data.concepts.filter((c) => !c.id.startsWith("concept.d3.")).map((c) => c.id);
  for (const id of d3ConceptIds) assert.ok(!otherIds.includes(id), `${id} must not collide with a Domain 1/2/Foundation concept id`);
});

test("batch boundary: no Domain 3 unit beyond U1-U6 exists yet", () => {
  const d3Lessons = data.lessons.filter((l) => l.domain === "domain.d3").map((l) => l.id);
  assert.deepEqual(
    d3Lessons.sort(),
    [
      "lesson.d3.asset-classification",
      "lesson.d3.control-design-selection",
      "lesson.d3.control-implementation-integration",
      "lesson.d3.control-testing-evaluation",
      "lesson.d3.policy-governance",
      "lesson.d3.program-foundations"
    ].sort(),
    "only D3-U1 through D3-U6 may exist in this batch - D3-U7+ is not yet authored"
  );
});

test("BUG-001/002/003 remain untouched: sanity check that prior Domain 1/2/D3-U1-U4 preserved recall targets are still present", () => {
  assert.ok(conceptsById.has("concept.d1.data-ownership"));
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"));
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
});

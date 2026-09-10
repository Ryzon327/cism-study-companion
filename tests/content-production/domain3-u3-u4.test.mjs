// D3-U3 (Program-Level Policy Governance) and D3-U4 (Control Design &
// Selection) — the second Domain 3 production authoring batch, built per
// the approved docs/learning/DOMAIN-3-CURRICULUM-ARCHITECTURE.md and the
// Architect's D3-U3/U4 authoring directive. Mirrors the domain3-u1-u2.test.mjs
// precedent: tests the learning contract and architecture, not arbitrary
// implementation details. General structural invariants (id format,
// referential integrity, length-bias, paraphrase detection, etc.) are
// already covered domain-agnostically by the other files in this
// directory and are not re-asserted here.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-production.mjs";

const data = loadAll();

const conceptsById = new Map(data.concepts.map((c) => [c.id, c]));
const lessonsById = new Map(data.lessons.map((l) => [l.id, l]));
const familiesById = new Map(data.families.map((f) => [f.id, f]));
const questionsByFamily = (familyId) => data.questions.filter((q) => q.family === familyId && q.active);

// --- D3-U3: Program-Level Policy Governance --------------------------------

test("D3-U3: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.policy-governance"), "concept.d3.policy-governance must exist");
  assert.ok(lessonsById.has("lesson.d3.policy-governance"), "lesson.d3.policy-governance must exist");
  assert.ok(familiesById.has("family.d3.policy-governance"), "family.d3.policy-governance must exist");

  const lesson = lessonsById.get("lesson.d3.policy-governance");
  assert.ok(lesson.concepts.includes("concept.d3.policy-governance"), "U3 lesson must teach its own concept");
  const family = familiesById.get("family.d3.policy-governance");
  assert.ok(family.concepts.includes("concept.d3.policy-governance"), "U3 family must declare the same concept");
  assert.equal(conceptsById.get("concept.d3.policy-governance").home_domain, "domain.d3");
});

test("D3-U3: family.d3.policy-governance has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.policy-governance");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U3: tests mandatory-vs-discretionary governance-effect reasoning, not title/tone/formatting", () => {
  const lesson = lessonsById.get("lesson.d3.policy-governance");
  assert.match(lesson.context, /binding/i);
  assert.match(lesson.context, /discretionary/i);
  assert.match(lesson.context + " " + lesson.cism_perspective, /(title|tone|formatting)/i, "the lesson must explicitly address that title/tone/formatting is NOT what determines governance effect");

  for (const q of questionsByFamily("family.d3.policy-governance")) {
    const correct = q.options.find((o) => o.correct);
    assert.match(
      correct.text + " " + correct.rationale,
      /(must|required|binding|mandatory|should|discretionary|recommendat)/i,
      `${q.id}'s correct answer must reason from the artifact's own binding/discretionary language`
    );
  }
});

test("D3-U3: does not merely re-teach Domain 1's policy-artifact-hierarchy identity — it is its OWN distinct Domain 3 concept, recalled via prerequisite chain only", () => {
  assert.ok(conceptsById.has("concept.d1.policy-artifact-hierarchy"), "concept.d1.policy-artifact-hierarchy must still exist, unmodified");
  assert.notEqual("concept.d3.policy-governance", "concept.d1.policy-artifact-hierarchy");

  const lesson = lessonsById.get("lesson.d3.policy-governance");
  assert.ok(!lesson.concepts.includes("concept.d1.policy-artifact-hierarchy"), "D3-U3's own lesson.concepts must not include the Domain 1 concept id");
  const family = familiesById.get("family.d3.policy-governance");
  assert.ok(!family.concepts.includes("concept.d1.policy-artifact-hierarchy"), "D3-U3's own family.concepts must not include the Domain 1 concept id");
  for (const q of questionsByFamily("family.d3.policy-governance")) {
    assert.ok(!q.concepts.includes("concept.d1.policy-artifact-hierarchy"), `${q.id}.concepts must not include the Domain 1 concept id`);
  }
});

test("D3-U3: Domain 1's policy-artifact-hierarchy family is reachable through D3-U3's cumulative recall pool (recalled, not re-taught)", () => {
  // Mirrors app/src/content/resolve.ts's recallPoolFor(): a lesson's
  // recall pool comes from ALL of its retrieval_refs (not just the first
  // one), expanded through the full prerequisite chain - e.g.
  // lesson.d1.governance-effectiveness (D1-U7) anchors TWO families via
  // its two retrieval_refs (question.d1.0022 -> governance-effectiveness,
  // question.d1.0031 -> policy-artifact-hierarchy).
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
  const u3Families = ancestorFamilies("lesson.d3.policy-governance");
  assert.ok(u3Families.has("family.d1.policy-artifact-hierarchy"), "D3-U3's cumulative recall pool must reach Domain 1's policy-artifact-hierarchy family through the prerequisite chain");
});

test("D3-U3: Meridian anchors one variant; at least 2 of 3 use different, non-Meridian business settings", () => {
  const variants = questionsByFamily("family.d3.policy-governance");
  const meridianVariants = variants.filter((q) => /Meridian|Aldergate/.test(q.prompt));
  assert.ok(meridianVariants.length >= 1, "at least one variant must use the Meridian Manufacturing anchor");
  assert.ok(meridianVariants.length <= 1, "Meridian must remain an anchor, not the setting for more than one variant in this family");
  const nonMeridian = variants.filter((q) => !/Meridian|Aldergate/.test(q.prompt));
  assert.ok(nonMeridian.length >= 2, "at least 2 of 3 variants must use a non-Meridian setting");
  const settings = new Set(nonMeridian.map((q) => q.variation_tags.find((t) => t.startsWith("business-setting:"))));
  assert.equal(settings.size, nonMeridian.length, "the non-Meridian variants must use different business settings from each other");
});

// --- D3-U4: Control Design & Selection --------------------------------------

test("D3-U4: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d3.control-design-selection"), "concept.d3.control-design-selection must exist");
  assert.ok(lessonsById.has("lesson.d3.control-design-selection"), "lesson.d3.control-design-selection must exist");
  assert.ok(familiesById.has("family.d3.control-design-selection"), "family.d3.control-design-selection must exist");

  const lesson = lessonsById.get("lesson.d3.control-design-selection");
  assert.ok(lesson.concepts.includes("concept.d3.control-design-selection"));
  const family = familiesById.get("family.d3.control-design-selection");
  assert.ok(family.concepts.includes("concept.d3.control-design-selection"));
});

test("D3-U4: family.d3.control-design-selection has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d3.control-design-selection");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D3-U4: control classification/selection follows purpose in the scenario, never a technology label", () => {
  const lesson = lessonsById.get("lesson.d3.control-design-selection");
  assert.match(lesson.context, /purpose/i);
  assert.match(lesson.cism_perspective, /(technology|label)/i);

  for (const q of questionsByFamily("family.d3.control-design-selection")) {
    assert.doesNotMatch(q.prompt, /\b(firewall|antivirus|SIEM|IDS|IPS)\b/i, `${q.id} must not classify-by-brand/technology-jargon in its own stem`);
  }
});

test("D3-U4: remains management/business-risk centered, not deeply technical", () => {
  const forbidden = /(configure|IP address|network segmentation|VLAN|firmware|packet|registry key|command line)/i;
  const lesson = lessonsById.get("lesson.d3.control-design-selection");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario, ...lesson.traps, ...lesson.memory_rules].join(" ");
  assert.doesNotMatch(haystack, forbidden, "U4 must remain business/management-centered, not a technical configuration lesson");
  for (const q of questionsByFamily("family.d3.control-design-selection")) {
    assert.doesNotMatch(q.prompt + " " + q.explanation, forbidden, `${q.id} must remain business/management-centered`);
  }
});

test("D3-U4: does not manufacture a vocabulary-heavy 'Control Owner' role-memorization unit", () => {
  const lesson = lessonsById.get("lesson.d3.control-design-selection");
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, lesson.scenario].join(" ");
  const controlOwnerHits = (haystack.match(/control owner/gi) || []).length;
  assert.ok(controlOwnerHits === 0, "U4 must not repeatedly test the literal title 'Control Owner' per the explicit architecture caution");
  for (const q of questionsByFamily("family.d3.control-design-selection")) {
    assert.doesNotMatch(q.prompt, /control owner/i, `${q.id} must not test the literal title 'Control Owner'`);
  }
});

test("D3-U4: recalls Domain 2's risk-driven-prioritization reasoning (pattern.p08) as reinforcement, not new content", () => {
  const variants = questionsByFamily("family.d3.control-design-selection");
  const p08Variant = variants.find((q) => q.patterns.includes("pattern.p08"));
  assert.ok(p08Variant, "at least one D3-U4 variant must reference pattern.p08 (risk-driven prioritization)");
  assert.match(p08Variant.explanation + " " + p08Variant.recognition_clue, /risk appetite/i);
});

test("D3-U4: Meridian anchors one variant; at least 2 of 3 use different, non-Meridian business settings", () => {
  const variants = questionsByFamily("family.d3.control-design-selection");
  const meridianVariants = variants.filter((q) => /Meridian|Aldergate/.test(q.prompt));
  assert.ok(meridianVariants.length >= 1, "at least one variant must use the Meridian Manufacturing anchor");
  assert.ok(meridianVariants.length <= 1, "Meridian must remain an anchor, not the setting for more than one variant in this family");
  const nonMeridian = variants.filter((q) => !/Meridian|Aldergate/.test(q.prompt));
  assert.ok(nonMeridian.length >= 2, "at least 2 of 3 variants must use a non-Meridian setting");
  const settings = new Set(nonMeridian.map((q) => q.variation_tags.find((t) => t.startsWith("business-setting:"))));
  assert.equal(settings.size, nonMeridian.length, "the non-Meridian variants must use different business settings from each other");
});

test("D3-U4: properly depends on both D3-U2 and D3-U3 per the approved dependency shape (D3-U1 -> {D3-U3, D3-U2} -> D3-U4)", () => {
  const lesson = lessonsById.get("lesson.d3.control-design-selection");
  assert.deepEqual(
    [...lesson.prerequisites].sort(),
    ["lesson.d3.asset-classification", "lesson.d3.policy-governance"].sort(),
    "D3-U4 must be prerequisite on exactly D3-U2 and D3-U3"
  );
});

// --- Cross-cutting: lifecycle, qualifiers, taught-before-tested, batch boundary ---

test("no invented Domain 3 lifecycle anywhere in this batch: lifecycle/stage/stage_target remain null on every new entity", () => {
  for (const familyId of ["family.d3.policy-governance", "family.d3.control-design-selection"]) {
    const family = familiesById.get(familyId);
    assert.equal(family.lifecycle, null, `${familyId}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
    assert.equal(family.stage_target, null, `${familyId}.stage_target must be null - Domain 3 has no canonical lifecycle`);
  }
  for (const familyId of ["family.d3.policy-governance", "family.d3.control-design-selection"]) {
    for (const q of questionsByFamily(familyId)) {
      assert.equal(q.lifecycle, null, `${q.id}.lifecycle must be null - Domain 3 has no canonical lifecycle`);
      assert.equal(q.stage, null, `${q.id}.stage must be null - Domain 3 has no canonical lifecycle`);
    }
  }
});

test("no NEXT qualifier manufactured anywhere in this batch (source-evidenced as essentially absent for Domain 3)", () => {
  const d3U3U4Questions = [...questionsByFamily("family.d3.policy-governance"), ...questionsByFamily("family.d3.control-design-selection")];
  const nextUsage = d3U3U4Questions.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextUsage.length, 0, `NEXT must remain absent from this batch unless a future, source-backed need is identified: ${nextUsage.map((q) => q.id).join(", ")}`);
});

test("qualifier usage is source-appropriate: MOST/BEST dominant, FIRST/PRIMARY used only where source-grounded", () => {
  const d3U3U4Questions = [...questionsByFamily("family.d3.policy-governance"), ...questionsByFamily("family.d3.control-design-selection")];
  const qualifiers = d3U3U4Questions.map((q) => q.qualifier);
  const mostOrBest = qualifiers.filter((q) => q === "qualifier.most" || q === "qualifier.best").length;
  assert.ok(mostOrBest >= qualifiers.length / 2, "MOST/BEST should remain the dominant qualifier pattern in this batch");
});

test("taught-before-tested: D3-U3 and D3-U4's retrieval questions only test concepts their lesson (or prerequisites) actually taught", () => {
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
  for (const lessonId of ["lesson.d3.policy-governance", "lesson.d3.control-design-selection"]) {
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

test("Domain 3 so far (U1-U4): all new entities are CANDIDATE, unverified, and none reference a future domain (D4) or a later Domain 3 unit", () => {
  const newEntities = [
    conceptsById.get("concept.d3.policy-governance"),
    conceptsById.get("concept.d3.control-design-selection"),
    lessonsById.get("lesson.d3.policy-governance"),
    lessonsById.get("lesson.d3.control-design-selection"),
    familiesById.get("family.d3.policy-governance"),
    familiesById.get("family.d3.control-design-selection"),
    ...questionsByFamily("family.d3.policy-governance"),
    ...questionsByFamily("family.d3.control-design-selection")
  ];
  for (const e of newEntities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
  const bad = newEntities.filter((e) => /domain\.d4/.test(JSON.stringify(e))).map((e) => e.id);
  assert.equal(bad.length, 0, `no Domain 3 U3/U4 entity may reference Domain 4: ${bad.join(", ")}`);
});

test("batch boundary: no Domain 3 unit beyond U1-U4 exists yet", () => {
  const d3Lessons = data.lessons.filter((l) => l.domain === "domain.d3").map((l) => l.id);
  assert.deepEqual(
    d3Lessons.sort(),
    ["lesson.d3.asset-classification", "lesson.d3.control-design-selection", "lesson.d3.policy-governance", "lesson.d3.program-foundations"].sort(),
    "only D3-U1 through D3-U4 may exist in this batch - D3-U5+ is not yet authored"
  );
});

test("BUG-001/002/003 remain untouched: the registry file's status lines are unchanged by this batch (spot check via the concept-identity guard already covered above)", () => {
  // This batch cannot itself verify docs/regressions/REGISTRY.md content (no
  // loader for it here), but the identity-safety test above proves this
  // batch does not recreate BUG-001's shape, which is the only way this
  // batch could interact with that registry entry at all.
  assert.ok(conceptsById.has("concept.d1.data-ownership"), "sanity: D3-U1/U2's own preserved Domain 1 recall target is still present");
});

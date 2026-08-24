// Phase 9B-4: D2-U7 (Residual Risk & Acceptability) and D2-U8 (Risk Owner
// vs. Control Owner) — the fourth Domain 2 production content batch, built
// per the approved Phase 9A architecture (docs/learning/DOMAIN-2-BLUEPRINT.md)
// and the Phase 9B-4 implementation instructions. This file asserts the
// batch-specific structural requirements: existence, variant floor,
// Inherent-vs-Residual framing, residual-does-not-imply-zero, acceptability
// following determination, source-supported NEXT usage, Risk Owner vs.
// Control Owner framing without seniority/title shortcuts, the AI scenario
// staying scenario-only, the approved non-adjacent U7-recalls-U8 wiring,
// and no leakage of a future Domain 2 unit (U9+). General structural
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
const questionsById = new Map(data.questions.map((q) => [q.id, q]));
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

// --- D2-U7: Residual Risk & Acceptability ---------------------------------

test("D2-U7: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.residual-risk-acceptability"));
  assert.ok(lessonsById.has("lesson.d2.residual-risk-acceptability"));
  assert.ok(familiesById.has("family.d2.residual-risk-acceptability"));

  const lesson = lessonsById.get("lesson.d2.residual-risk-acceptability");
  assert.ok(lesson.concepts.includes("concept.d2.residual-risk-acceptability"));
  const family = familiesById.get("family.d2.residual-risk-acceptability");
  assert.ok(family.patterns.includes("pattern.p04"), "U7 must teach Pattern P04 (No Lifecycle Jumping)");
  assert.ok(family.patterns.includes("pattern.p02"), "U7 must teach Pattern P02 (Authority Follows Accountability)");
});

test("D2-U7: family.d2.residual-risk-acceptability has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.residual-risk-acceptability");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U7: Inherent vs. Residual Risk is explicitly distinguished, tied to before/after treatment", () => {
  const lesson = lessonsById.get("lesson.d2.residual-risk-acceptability");
  assert.match(lesson.context, /inherent risk/i);
  assert.match(lesson.context, /residual risk/i);

  const variants = questionsByFamily("family.d2.residual-risk-acceptability");
  const inherentResidualVariant = variants.find((q) => /inherent/i.test(q.prompt + " " + q.options.map((o) => o.text).join(" ")));
  assert.ok(inherentResidualVariant, "at least one D2-U7 variant must directly exercise the Inherent vs. Residual distinction");
});

test("D2-U7: residual risk is never taught as automatically zero after a successful treatment", () => {
  const lesson = lessonsById.get("lesson.d2.residual-risk-acceptability");
  const forbidden = /(residual risk (is|becomes) (zero|eliminated|removed)|treatment (eliminates|removes) the risk)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective].join(" ");
  assert.doesNotMatch(haystack, forbidden, "must never teach that treatment reduces risk to zero");

  const variants = questionsByFamily("family.d2.residual-risk-acceptability");
  const zeroRiskTrap = variants.find((q) =>
    q.options.some((o) => !o.correct && /(reduce.*risk to zero|eliminate.*risk entirely|discarded entirely)/i.test(o.text))
  );
  assert.ok(zeroRiskTrap, "at least one D2-U7 variant should exercise a zero-risk-framing or discard-inherent-risk trap");
});

test("D2-U7: acceptability is taught as following residual-risk determination, as two distinct ordered steps", () => {
  const lesson = lessonsById.get("lesson.d2.residual-risk-acceptability");
  assert.match(lesson.context, /determine.*residual|residual.*determin/i);
  assert.match(lesson.context, /acceptab/i);
  assert.match(lesson.memory_rules.join(" "), /determine what.?s left, then judge/i);
});

test("D2-U7: NEXT qualifier usage is source-supported (exactly the one genuine NEXT-tagged residual-risk sequencing question), not manufactured", () => {
  const variants = questionsByFamily("family.d2.residual-risk-acceptability");
  const nextVariants = variants.filter((q) => q.qualifier === "qualifier.next");
  assert.equal(nextVariants.length, 1, "expected exactly one NEXT-qualifier D2-U7 variant, matching the source-evidenced residual-risk-acceptability question");
});

test("D2-U7: residual-risk acceptance authority is not taught as a fixed 'CISO/board always decides' rule", () => {
  const lesson = lessonsById.get("lesson.d2.residual-risk-acceptability");
  const forbiddenClaim = /((security manager|CISO|board).{0,20}always (decides|accepts|approves)|always (decides|accepts|approves).{0,20}(security manager|CISO|board))/i;
  const negationCue = /(assuming|rather than|not |never |doesn't mean|does not mean)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, ...lesson.traps].join(" ");
  const sentences = haystack.split(/(?<=[.!?])\s+/);
  const bareAssertions = sentences.filter((s) => forbiddenClaim.test(s) && !negationCue.test(s));
  assert.equal(bareAssertions.length, 0, `found an unqualified fixed-authority claim: ${bareAssertions.join(" | ")}`);

  const variants = questionsByFamily("family.d2.residual-risk-acceptability");
  const authorityVariant = variants.find((q) => q.options.some((o) => !o.correct && o.repair_target === "repair.authority-error"));
  assert.ok(authorityVariant, "at least one D2-U7 variant must exercise an authority-error distractor");
});

test("D2-U7: no treatment-stage reversal — no variant proposes re-selecting treatment after residual risk is already known", () => {
  const variants = questionsByFamily("family.d2.residual-risk-acceptability");
  for (const q of variants) {
    const correct = q.options.find((o) => o.correct);
    assert.doesNotMatch(correct.text, /select (another|an additional) treatment/i, `${q.id}'s correct answer must not propose re-selecting treatment`);
  }
});

test("D2-U7: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.residual-risk-acceptability");
  const taught = taughtConceptsFor(lesson.id);
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(taught.has(c), `${lesson.id} -> ${question.id} tests untaught concept ${c}`);
  }
});

test("D2-U7: all entities are CANDIDATE and unverified", () => {
  const entities = [
    conceptsById.get("concept.d2.residual-risk-acceptability"),
    lessonsById.get("lesson.d2.residual-risk-acceptability"),
    familiesById.get("family.d2.residual-risk-acceptability"),
    ...questionsByFamily("family.d2.residual-risk-acceptability")
  ];
  for (const e of entities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
});

// --- D2-U8: Risk Owner vs. Control Owner -----------------------------------

test("D2-U8: concept, lesson, and family exist and are wired together", () => {
  assert.ok(conceptsById.has("concept.d2.risk-control-ownership"));
  assert.ok(lessonsById.has("lesson.d2.risk-control-ownership"));
  assert.ok(familiesById.has("family.d2.risk-control-ownership"));

  const lesson = lessonsById.get("lesson.d2.risk-control-ownership");
  assert.ok(lesson.concepts.includes("concept.d2.risk-control-ownership"));
  const family = familiesById.get("family.d2.risk-control-ownership");
  assert.ok(family.patterns.includes("pattern.p02"), "U8 must teach Pattern P02");
  assert.ok(family.patterns.includes("pattern.p03"), "U8 must teach Pattern P03 (Role-Verb Matching)");
});

test("D2-U8: family.d2.risk-control-ownership has at least 3 meaningful, distinct active variants", () => {
  const variants = questionsByFamily("family.d2.risk-control-ownership");
  assert.ok(variants.length >= 3, `expected >= 3 variants, got ${variants.length}`);
  const stems = new Set(variants.map((q) => q.prompt.trim()));
  assert.equal(stems.size, variants.length, "all stems must be distinct");
});

test("D2-U8: Risk Owner vs. Control Owner is explicitly taught, and Control Owner is never conflated with automatic Risk Owner status", () => {
  const lesson = lessonsById.get("lesson.d2.risk-control-ownership");
  assert.match(lesson.context, /risk owner/i);
  assert.match(lesson.context, /control owner/i);
  assert.doesNotMatch(lesson.context, /control owner (is|becomes) (the|a) risk owner/i);
  assert.match(lesson.memory_rules.join(" "), /control owner runs the control; risk owner owns the outcome/i);
});

test("D2-U8: Risk Owner is not defined solely by seniority or job title", () => {
  const lesson = lessonsById.get("lesson.d2.risk-control-ownership");
  const forbiddenClaim = /(risk owner is always (senior management|the board|the CISO)|the most senior (person|role) is always the risk owner)/i;
  const negationCue = /(not |never |rather than|doesn't mean|does not mean)/i;
  const haystack = [lesson.objective, lesson.context, lesson.cism_perspective, ...lesson.traps].join(" ");
  const sentences = haystack.split(/(?<=[.!?])\s+/);
  const bareAssertions = sentences.filter((s) => forbiddenClaim.test(s) && !negationCue.test(s));
  assert.equal(bareAssertions.length, 0, `found an unqualified seniority-defines-risk-owner claim: ${bareAssertions.join(" | ")}`);

  const variants = questionsByFamily("family.d2.risk-control-ownership");
  const seniorityTrap = variants.find((q) =>
    q.options.some((o) => !o.correct && /(board of directors|most senior)/i.test(o.text))
  );
  assert.ok(seniorityTrap, "at least one D2-U8 variant should exercise a seniority/title-bias distractor");
});

test("D2-U8: ROLE + VERB + CONTEXT reasoning is present", () => {
  const lesson = lessonsById.get("lesson.d2.risk-control-ownership");
  assert.match(lesson.cism_perspective + " " + lesson.memory_rules.join(" "), /verb/i);
});

test("D2-U8: Domain 1 authority-chain recall (accountability -> authority -> advice/implementation) is present and specific", () => {
  const lesson = lessonsById.get("lesson.d2.risk-control-ownership");
  assert.match(lesson.context, /Domain 1|Recommend\/Approve\/Implement\/Verify/i);
});

test("D2-U8: the AI-scenario variant stays a Risk-Owner-vs-Control-Owner question, not AI governance/framework/ethics/policy content", () => {
  const variants = questionsByFamily("family.d2.risk-control-ownership");
  const aiVariant = variants.find((q) => /\bAI\b|artificial intelligence/i.test(q.prompt));
  assert.ok(aiVariant, "at least one D2-U8 variant must use an AI scenario (per the approved Phase 9A treatment)");
  assert.match(aiVariant.concepts.join(" "), /risk-control-ownership/);

  const forbidden = /(AI governance framework|AI ethics|AI policy|model risk management)/i;
  assert.doesNotMatch(aiVariant.prompt + " " + aiVariant.explanation, forbidden);

  // No AI-specific production entity exists anywhere (concept/lesson/family).
  const aiEntityIds = [...data.concepts, ...data.lessons, ...data.families]
    .filter((e) => /\bai\b/i.test(e.id))
    .map((e) => e.id);
  assert.equal(aiEntityIds.length, 0, `no AI-specific production entity may exist: ${aiEntityIds.join(", ")}`);
});

test("D2-U8: taught-before-tested holds", () => {
  const lesson = lessonsById.get("lesson.d2.risk-control-ownership");
  const taught = taughtConceptsFor(lesson.id);
  const question = questionsById.get(lesson.retrieval_refs[0]);
  for (const c of question.concepts) {
    assert.ok(taught.has(c), `${lesson.id} -> ${question.id} tests untaught concept ${c}`);
  }
});

test("D2-U8: all entities are CANDIDATE and unverified", () => {
  const entities = [
    conceptsById.get("concept.d2.risk-control-ownership"),
    lessonsById.get("lesson.d2.risk-control-ownership"),
    familiesById.get("family.d2.risk-control-ownership"),
    ...questionsByFamily("family.d2.risk-control-ownership")
  ];
  for (const e of entities) {
    assert.equal(e.content_status, "CANDIDATE", `${e.id} must be CANDIDATE`);
    assert.notEqual(e.verification_status, "source_verified", `${e.id} must not claim source_verified`);
  }
});

// --- Architecture: U7 prerequisite/recall wiring, no cycle, no leakage ----

test("D2-U8 prerequisite = D2-U1 branch (parallel off U1, per approved Phase 9A graph)", () => {
  assert.deepEqual(lessonsById.get("lesson.d2.risk-control-ownership").prerequisites, ["lesson.d2.risk-fundamentals"]);
});

test("D2-U7 prerequisites realize the approved non-adjacent 'U7 recalls U8' edge (U8 first) while preserving the real U6 content chain (U6 second)", () => {
  assert.deepEqual(
    lessonsById.get("lesson.d2.residual-risk-acceptability").prerequisites,
    ["lesson.d2.risk-control-ownership", "lesson.d2.risk-treatment-response"],
    "D2-U7 must list D2-U8 first (recall priority) and D2-U6 second (real content chain), mirroring the proven Domain 1 'U8 recalls U1' mechanism"
  );
});

test("D2-U7's default recall family is D2-U8's family (non-adjacent recall actually resolves as designed), and the full U1-U6 chain remains reachable", () => {
  // Mirrors app/src/content/resolve.ts's recallFamilyIdsFor() exactly:
  // visits prerequisites in array order; each prerequisite's own
  // retrieval_refs family is added to the pool before that prerequisite's
  // own prerequisites are recursively visited.
  function familyVariantsFor(familyId) {
    return data.questions.filter((q) => q.family === familyId && q.active).map((q) => q.id);
  }
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
        const q = questionsById.get(refId);
        if (!q) continue;
        if (q.family && familiesById.has(q.family)) {
          for (const variantId of familyVariantsFor(q.family)) addQuestion(questionsById.get(variantId));
        } else {
          addQuestion(q);
        }
      }
      for (const prereqId of l.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
    }
    for (const prereqId of lesson.prerequisites) if (lessonsById.has(prereqId)) visit(prereqId);
    return familyOrder;
  }

  const u7Recall = orderedRecallFamilyIds("lesson.d2.residual-risk-acceptability");
  assert.equal(u7Recall[0], "family.d2.risk-control-ownership", "D2-U7's first (default) recall family must be D2-U8's family, not D2-U6's");
  for (const expectedFamily of [
    "family.d2.risk-treatment-response",
    "family.d2.risk-evaluation",
    "family.d2.risk-assessment-lifecycle",
    "family.d2.risk-fundamentals"
  ]) {
    assert.ok(u7Recall.includes(expectedFamily), `D2-U7's cumulative recall pool must still reach ${expectedFamily}`);
  }
  assert.ok(!u7Recall.includes("family.d2.residual-risk-acceptability"), "D2-U7 must never recall its own family");
});

test("No prerequisite cycle exists among D2-U7/D2-U8 and their ancestors", () => {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(data.lessons.map((l) => [l.id, WHITE]));
  const cycles = [];
  function visit(id, stack) {
    if (color.get(id) === BLACK) return;
    if (color.get(id) === GRAY) {
      cycles.push([...stack, id].join(" -> "));
      return;
    }
    color.set(id, GRAY);
    const lesson = lessonsById.get(id);
    for (const prereq of lesson?.prerequisites ?? []) {
      if (lessonsById.has(prereq)) visit(prereq, [...stack, id]);
    }
    color.set(id, BLACK);
  }
  for (const l of data.lessons) visit(l.id, []);
  assert.equal(cycles.length, 0, cycles.join("\n"));
});

test("No Domain 2 unit beyond U1-U8 exists yet (U9+ not authored)", () => {
  const knownUnitIds = [
    "risk-fundamentals",
    "risk-assessment-lifecycle",
    "risk-analysis-methods",
    "quantitative-risk-decisions",
    "risk-evaluation",
    "risk-treatment-response",
    "residual-risk-acceptability",
    "risk-control-ownership"
  ];
  const laterUnitIds = [...data.concepts, ...data.lessons, ...data.families]
    .map((e) => e.id)
    .filter((id) => /^(concept|lesson|family)\.d2\./.test(id))
    .filter((id) => !knownUnitIds.some((u) => id.includes(u)));
  assert.equal(laterUnitIds.length, 0, `no Domain 2 unit beyond U1-U8 may exist yet: ${laterUnitIds.join(", ")}`);
});

test("Domain 2 production question count is exactly 24 after U1-U8 (3 variants x 8 families)", () => {
  const d2Questions = data.questions.filter((q) => q.domain === "domain.d2");
  assert.equal(d2Questions.length, 24, `expected 24 Domain 2 questions, got ${d2Questions.length}`);
});

test("D2-U1 through D2-U6 remain completely unchanged by this batch", () => {
  const versions = {
    "lesson.d2.risk-fundamentals": 1,
    "lesson.d2.risk-assessment-lifecycle": 2,
    "lesson.d2.risk-analysis-methods": 1,
    "lesson.d2.quantitative-risk-decisions": 1,
    "lesson.d2.risk-evaluation": 1,
    "lesson.d2.risk-treatment-response": 1
  };
  for (const [id, expectedVersion] of Object.entries(versions)) {
    assert.equal(lessonsById.get(id).version, expectedVersion, `${id} must remain at version ${expectedVersion}`);
  }
  const familyCounts = {
    "family.d2.risk-fundamentals": 3,
    "family.d2.risk-assessment-lifecycle": 3,
    "family.d2.risk-analysis-methods": 3,
    "family.d2.quantitative-risk-decisions": 3,
    "family.d2.risk-evaluation": 3,
    "family.d2.risk-treatment-response": 3
  };
  for (const [id, expectedCount] of Object.entries(familyCounts)) {
    assert.equal(questionsByFamily(id).length, expectedCount, `${id} must have exactly ${expectedCount} active variants`);
  }
});

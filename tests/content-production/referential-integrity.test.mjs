// Invariants 3-12, 26: every ID reference from a production entity
// resolves to a real entity of the expected type — domain, concept,
// pattern, role, qualifier, lifecycle/stage (only for domains that have
// one), evidence dimension, repair target, lesson, question, and
// prerequisites.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex } from "./helpers/load-production.mjs";

const data = loadAll();
const index = buildIndex(data);

function resolves(id, expectedCollection) {
  const hits = index.get(id);
  return !!hits?.some((h) => h.collection === expectedCollection);
}

test("every Concept.home_domain resolves to a real domain", () => {
  const bad = data.concepts.filter((c) => !resolves(c.home_domain, "domains")).map((c) => c.id);
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every Concept.related_patterns[] resolves to a real pattern", () => {
  const bad = [];
  for (const c of data.concepts) {
    for (const p of c.related_patterns) if (!resolves(p, "patterns")) bad.push(`${c.id} -> ${p}`);
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every Question's domain/concepts/patterns/qualifier/roles/decision_type/evidence_dimensions resolve", () => {
  const bad = [];
  for (const q of data.questions) {
    if (!resolves(q.domain, "domains")) bad.push(`${q.id}.domain -> ${q.domain}`);
    for (const c of q.concepts) if (!resolves(c, "concepts")) bad.push(`${q.id}.concepts -> ${c}`);
    for (const p of q.patterns) if (!resolves(p, "patterns")) bad.push(`${q.id}.patterns -> ${p}`);
    if (q.qualifier && !resolves(q.qualifier, "qualifiers")) bad.push(`${q.id}.qualifier -> ${q.qualifier}`);
    for (const r of q.roles_mentioned) if (!resolves(r, "roles")) bad.push(`${q.id}.roles_mentioned -> ${r}`);
    if (q.primary_role && !resolves(q.primary_role, "roles")) bad.push(`${q.id}.primary_role -> ${q.primary_role}`);
    if (q.decision_type && !resolves(q.decision_type, "decisionTypes")) bad.push(`${q.id}.decision_type -> ${q.decision_type}`);
    for (const e of q.evidence_dimensions) if (!resolves(e, "evidenceDimensions")) bad.push(`${q.id}.evidence_dimensions -> ${e}`);
    for (const opt of q.options) {
      if (opt.repair_target && !resolves(opt.repair_target, "repairTargets")) {
        bad.push(`${q.id} option ${opt.key}.repair_target -> ${opt.repair_target}`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("primary_role, when set, is a member of roles_mentioned", () => {
  const bad = data.questions
    .filter((q) => q.primary_role && !q.roles_mentioned.includes(q.primary_role))
    .map((q) => q.id);
  assert.equal(bad.length, 0, bad.join(", "));
});

test("lifecycle/stage are only ever set for domains that have a canonical lifecycle (never Domain 1 or Foundation)", () => {
  const bad = data.questions
    .filter((q) => (q.lifecycle || q.stage) && (q.domain === "domain.d1" || q.domain === "domain.foundation"))
    .map((q) => q.id);
  assert.equal(bad.length, 0, `Domain 1/Foundation questions must never reference a lifecycle: ${bad.join(", ")}`);
});

test("every Lesson's domain/concepts/patterns/prerequisites/retrieval_refs resolve", () => {
  const bad = [];
  for (const l of data.lessons) {
    if (!resolves(l.domain, "domains")) bad.push(`${l.id}.domain -> ${l.domain}`);
    for (const c of l.concepts) if (!resolves(c, "concepts")) bad.push(`${l.id}.concepts -> ${c}`);
    for (const p of l.patterns) if (!resolves(p, "patterns")) bad.push(`${l.id}.patterns -> ${p}`);
    for (const prereq of l.prerequisites) {
      if (!resolves(prereq, "lessons") && !resolves(prereq, "concepts")) bad.push(`${l.id}.prerequisites -> ${prereq}`);
    }
    for (const ref of l.retrieval_refs) if (!resolves(ref, "questions")) bad.push(`${l.id}.retrieval_refs -> ${ref}`);
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

test("every entity's source resolves to a real Source row", () => {
  const bad = [];
  for (const [collection, list] of Object.entries(data)) {
    for (const entity of list) {
      if (entity.source && !resolves(entity.source, "sources")) bad.push(`${collection}/${entity.id} -> ${entity.source}`);
    }
  }
  assert.equal(bad.length, 0, bad.join("\n"));
});

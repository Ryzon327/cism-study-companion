// Covers: "every referenced ID exists", "pattern/role/qualifier IDs valid",
// "evidence dimensions valid", "repair targets valid", "no display name
// used as identity" from docs/data-model/VALIDATION-INVARIANTS.md.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex, looksLikeId, loadFixture } from "./helpers/load-registry.mjs";

const data = loadAll();
const index = buildIndex(data);

function resolves(id, allowedCollections) {
  const hits = index.get(id);
  if (!hits) return false;
  return hits.some(h => allowedCollections.includes(h.collection));
}

// { collection, field, isArray, nullable, targets: [collection, ...] }
const FK_RULES = [
  { collection: "roles", field: "characteristic_domains", isArray: true, targets: ["domains"] },
  { collection: "roles", field: "related_patterns", isArray: true, targets: ["patterns"] },
  { collection: "repairTargets", field: "related_evidence_dimension", targets: ["evidenceDimensions"] },
  { collection: "patterns", field: "applicable_domains", isArray: true, targets: ["domains"] },
  { collection: "patterns", field: "related_roles", isArray: true, targets: ["roles"] },
  { collection: "patterns", field: "related_qualifiers", isArray: true, targets: ["qualifiers"] },
  { collection: "patterns", field: "related_lifecycles", isArray: true, targets: ["lifecycles"] },
  { collection: "lifecycles", field: "domain", targets: ["domains"] },
  { collection: "lifecycleStages", field: "lifecycle", targets: ["lifecycles"] },
  { collection: "lifecycleStages", field: "preceding", nullable: true, targets: ["lifecycleStages"] },
  { collection: "lifecycleStages", field: "following", nullable: true, targets: ["lifecycleStages"] },
  { collection: "concepts", field: "home_domain", targets: ["domains"] },
  { collection: "concepts", field: "related_patterns", isArray: true, targets: ["patterns"] },
  { collection: "questions", field: "domain", targets: ["domains"] },
  { collection: "questions", field: "concepts", isArray: true, targets: ["concepts"] },
  { collection: "questions", field: "patterns", isArray: true, targets: ["patterns"] },
  { collection: "questions", field: "qualifier", nullable: true, targets: ["qualifiers"] },
  { collection: "questions", field: "roles_mentioned", isArray: true, targets: ["roles"] },
  { collection: "questions", field: "primary_role", nullable: true, targets: ["roles"] },
  { collection: "questions", field: "lifecycle", nullable: true, targets: ["lifecycles"] },
  { collection: "questions", field: "stage", nullable: true, targets: ["lifecycleStages"] },
  { collection: "questions", field: "decision_type", nullable: true, targets: ["decisionTypes"] },
  { collection: "questions", field: "evidence_dimensions", isArray: true, targets: ["evidenceDimensions"] },
  { collection: "lessons", field: "domain", targets: ["domains"] },
  { collection: "lessons", field: "concepts", isArray: true, targets: ["concepts"] },
  { collection: "lessons", field: "patterns", isArray: true, targets: ["patterns"] },
  { collection: "lessons", field: "prerequisites", isArray: true, targets: ["lessons", "concepts"] },
  { collection: "lessons", field: "retrieval_refs", isArray: true, targets: ["questions"] }
];

// Every entity type also carries a `source` pointer.
const ALL_COLLECTIONS_WITH_SOURCE = Object.keys(data).filter(c => c !== "sources");

for (const rule of FK_RULES) {
  test(`${rule.collection}.${rule.field} always resolves to ${rule.targets.join("/")}`, () => {
    const broken = [];
    for (const entity of data[rule.collection]) {
      const raw = entity[rule.field];
      if (raw == null) {
        if (!rule.nullable) broken.push(`${entity.id}: ${rule.field} is missing/null but is required`);
        continue;
      }
      const values = rule.isArray ? raw : [raw];
      for (const v of values) {
        if (!resolves(v, rule.targets)) broken.push(`${entity.id}: ${rule.field} references "${v}", which does not resolve`);
      }
    }
    assert.equal(broken.length, 0, broken.join("\n"));
  });
}

test("every question option.repair_target resolves to repairTargets when present", () => {
  const broken = [];
  for (const q of data.questions) {
    for (const opt of q.options) {
      if (opt.repair_target == null) continue;
      if (!resolves(opt.repair_target, ["repairTargets"])) {
        broken.push(`${q.id} option ${opt.key}: repair_target "${opt.repair_target}" does not resolve`);
      }
    }
  }
  assert.equal(broken.length, 0, broken.join("\n"));
});

test("every entity's source resolves to the sources registry", () => {
  const broken = [];
  for (const collection of ALL_COLLECTIONS_WITH_SOURCE) {
    for (const entity of data[collection]) {
      if (entity.source == null) continue; // presence is checked separately for CANONICAL entities
      if (!resolves(entity.source, ["sources"])) {
        broken.push(`${collection}/${entity.id}: source "${entity.source}" does not resolve`);
      }
    }
  }
  assert.equal(broken.length, 0, broken.join("\n"));
});

// No display-name-as-identity: every reference-shaped field value must be a
// well-formed dotted id, never a free-text display string, independent of
// whether it happens to resolve. This is the direct structural defense
// against BUG-001/BUG-002's root cause recurring.
test("every referenced value in a relationship field is id-shaped, never a display string", () => {
  const offenders = [];
  for (const rule of FK_RULES) {
    for (const entity of data[rule.collection]) {
      const raw = entity[rule.field];
      if (raw == null) continue;
      const values = rule.isArray ? raw : [raw];
      for (const v of values) {
        if (!looksLikeId(v)) offenders.push(`${entity.id}.${rule.field} = "${v}"`);
      }
    }
  }
  assert.equal(offenders.length, 0, `non-id-shaped relationship values: ${offenders.join(", ")}`);
});

test("nonexistent-concept fixture is correctly rejected by referential integrity", () => {
  const [q] = loadFixture("invalid-nonexistent-concept.json");
  const unresolved = q.concepts.filter(c => !resolves(c, ["concepts"]));
  assert.equal(unresolved.length, 1, "fixture is expected to reference exactly one nonexistent concept id");
  assert.equal(unresolved[0], "concept.d2.does-not-exist");
});

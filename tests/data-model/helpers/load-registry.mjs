// Shared loader for the Phase 3 canonical data model (schema/registry/ +
// schema/example/). Plain JSON, no dependencies, no vm sandbox needed -
// unlike the Phase 1 loader (tests/helpers/load-app-globals.mjs), this
// data has no runtime code to evaluate.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..", "..");

// One entry per collection: where it lives, the id prefix that identifies
// membership, and the format every id in that collection must match.
export const COLLECTIONS = {
  domains: { file: "schema/registry/domains.json", prefix: "domain.", pattern: /^domain\.(d[1-4]|foundation)$/ },
  roles: { file: "schema/registry/roles.json", prefix: "role.", pattern: /^role\.[a-z0-9-]+$/ },
  qualifiers: { file: "schema/registry/qualifiers.json", prefix: "qualifier.", pattern: /^qualifier\.[a-z0-9-]+$/ },
  decisionTypes: { file: "schema/registry/decision-types.json", prefix: "decision.", pattern: /^decision\.[a-z0-9-]+$/ },
  evidenceDimensions: { file: "schema/registry/evidence-dimensions.json", prefix: "evidence.", pattern: /^evidence\.[a-z0-9-]+$/ },
  repairTargets: { file: "schema/registry/repair-targets.json", prefix: "repair.", pattern: /^repair\.[a-z0-9-]+$/ },
  patterns: { file: "schema/registry/patterns.json", prefix: "pattern.", pattern: /^pattern\.p\d{2}$/ },
  lifecycles: { file: "schema/registry/lifecycles.json", prefix: "lifecycle.", pattern: /^lifecycle\.[a-z0-9-]+$/ },
  lifecycleStages: { file: "schema/registry/lifecycle-stages.json", prefix: "stage.", pattern: /^stage\.[a-z0-9-]+\.[a-z0-9-]+$/ },
  sources: { file: "schema/registry/sources.json", prefix: "source.", pattern: /^source\.[a-z0-9-]+\.[a-z0-9-]+$/ },
  practiceModes: { file: "schema/registry/practice-modes.json", prefix: "mode.", pattern: /^mode\.[a-z0-9-]+$/ },
  concepts: { file: "schema/example/concepts.example.json", prefix: "concept.", pattern: /^concept\.(d[1-4]|foundation)\.[a-z0-9-]+$/ },
  questions: { file: "schema/example/questions.example.json", prefix: "question.", pattern: /^question\.(d[1-4]|foundation)\.\d{4}$/ },
  lessons: { file: "schema/example/lessons.example.json", prefix: "lesson.", pattern: /^lesson\.(d[1-4]|foundation)\.[a-z0-9-]+$/ }
};

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

// Loads every collection into { collectionName: Entity[] }.
export function loadAll() {
  const out = {};
  for (const [name, def] of Object.entries(COLLECTIONS)) {
    out[name] = readJson(def.file);
  }
  return out;
}

// Loads one deliberately-invalid fixture from tests/fixtures/data-model/.
// Always returns an array of entities, same shape as the real collections.
export function loadFixture(fileName) {
  return readJson(path.join("tests", "fixtures", "data-model", fileName));
}

// id -> { entity, collection } across every real (non-fixture) collection.
export function buildIndex(data) {
  const index = new Map();
  for (const [collection, list] of Object.entries(data)) {
    for (const entity of list) {
      if (!index.has(entity.id)) index.set(entity.id, []);
      index.get(entity.id).push({ entity, collection });
    }
  }
  return index;
}

// True if `value` is a well-formed dotted-lowercase id shape, independent
// of whether it resolves to anything real. Used by the
// no-display-name-identity check.
export function looksLikeId(value) {
  return typeof value === "string" && /^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/.test(value);
}

// Loader for the Phase 6B production content boundary (content/production/)
// plus the schema/registry/ vocabulary it references. Deliberately
// separate from tests/data-model/helpers/load-registry.mjs, which loads
// schema/example/ (test-only) — the two are never merged into one index,
// so a defect in real content and a defect in the schema-demonstration
// fixtures can never be conflated in one red test. See
// tests/content-production/separation.test.mjs for the check that proves
// this file never touches schema/example/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..", "..", "..");

export const REGISTRY_COLLECTIONS = {
  domains: { file: "schema/registry/domains.json", pattern: /^domain\.(d[1-4]|foundation)$/ },
  roles: { file: "schema/registry/roles.json", pattern: /^role\.[a-z0-9-]+$/ },
  qualifiers: { file: "schema/registry/qualifiers.json", pattern: /^qualifier\.[a-z0-9-]+$/ },
  decisionTypes: { file: "schema/registry/decision-types.json", pattern: /^decision\.[a-z0-9-]+$/ },
  evidenceDimensions: { file: "schema/registry/evidence-dimensions.json", pattern: /^evidence\.[a-z0-9-]+$/ },
  repairTargets: { file: "schema/registry/repair-targets.json", pattern: /^repair\.[a-z0-9-]+$/ },
  patterns: { file: "schema/registry/patterns.json", pattern: /^pattern\.p\d{2}$/ },
  lifecycles: { file: "schema/registry/lifecycles.json", pattern: /^lifecycle\.[a-z0-9-]+$/ },
  lifecycleStages: { file: "schema/registry/lifecycle-stages.json", pattern: /^stage\.[a-z0-9-]+\.[a-z0-9-]+$/ },
  sources: { file: "schema/registry/sources.json", pattern: /^source\.[a-z0-9-]+\.[a-z0-9-]+$/ }
};

export const PRODUCTION_COLLECTIONS = {
  concepts: { file: "content/production/concepts.json", pattern: /^concept\.(d[1-4]|foundation)\.[a-z0-9-]+$/ },
  questions: { file: "content/production/questions.json", pattern: /^question\.(d[1-4]|foundation)\.\d{4}$/ },
  lessons: { file: "content/production/lessons.json", pattern: /^lesson\.(d[1-4]|foundation)\.[a-z0-9-]+$/ }
};

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

export function loadAll() {
  const out = {};
  for (const [name, def] of Object.entries(REGISTRY_COLLECTIONS)) out[name] = readJson(def.file);
  for (const [name, def] of Object.entries(PRODUCTION_COLLECTIONS)) out[name] = readJson(def.file);
  return out;
}

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

export function loadSchemaExampleIds() {
  const exampleDir = path.join(ROOT, "schema", "example");
  const ids = new Set();
  for (const file of ["concepts.example.json", "questions.example.json", "lessons.example.json"]) {
    const entities = readJson(path.join("schema", "example", file));
    for (const entity of entities) ids.add(entity.id);
  }
  return ids;
}

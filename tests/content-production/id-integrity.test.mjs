// Invariants 1-2: production IDs are unique and follow the approved
// namespace conventions from docs/data-model/ID-CONVENTIONS.md — the same
// regex shapes tests/data-model/id-integrity.test.mjs enforces for
// schema/example/, applied here to content/production/ instead.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, PRODUCTION_COLLECTIONS } from "./helpers/load-production.mjs";

const data = loadAll();

test("every production entity id matches its namespace's format", () => {
  const bad = [];
  for (const [name, def] of Object.entries(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (!def.pattern.test(entity.id)) bad.push(`${name}/${entity.id}`);
    }
  }
  assert.equal(bad.length, 0, `malformed ids: ${bad.join(", ")}`);
});

test("every production entity id is unique within its collection", () => {
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    const seen = new Set();
    const dupes = [];
    for (const entity of data[name]) {
      if (seen.has(entity.id)) dupes.push(entity.id);
      seen.add(entity.id);
    }
    assert.equal(dupes.length, 0, `${name} has duplicate ids: ${dupes.join(", ")}`);
  }
});

test("every production entity id is unique across all production collections combined", () => {
  const seen = new Map();
  const dupes = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (seen.has(entity.id)) dupes.push(`${entity.id} (${seen.get(entity.id)} vs ${name})`);
      seen.set(entity.id, name);
    }
  }
  assert.equal(dupes.length, 0, dupes.join(", "));
});

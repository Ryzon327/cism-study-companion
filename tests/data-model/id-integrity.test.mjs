// Covers: "every ID unique" and ID-format invariants from
// docs/data-model/VALIDATION-INVARIANTS.md.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, COLLECTIONS } from "./helpers/load-registry.mjs";

const data = loadAll();

for (const [collection, def] of Object.entries(COLLECTIONS)) {
  test(`every id in ${collection} matches its namespace format`, () => {
    const malformed = data[collection]
      .map(e => e.id)
      .filter(id => !def.pattern.test(id));
    assert.equal(malformed.length, 0, `malformed ids in ${collection}: ${malformed.join(", ")}`);
  });

  test(`every id in ${collection} starts with the "${def.prefix}" namespace prefix`, () => {
    const wrongPrefix = data[collection]
      .map(e => e.id)
      .filter(id => !id.startsWith(def.prefix));
    assert.equal(wrongPrefix.length, 0, `ids missing the "${def.prefix}" prefix: ${wrongPrefix.join(", ")}`);
  });
}

test("no id is duplicated within any single collection", () => {
  for (const [collection, list] of Object.entries(data)) {
    const seen = new Set();
    const duplicates = [];
    for (const e of list) {
      if (seen.has(e.id)) duplicates.push(e.id);
      seen.add(e.id);
    }
    assert.equal(duplicates.length, 0, `duplicate ids in ${collection}: ${duplicates.join(", ")}`);
  }
});

test("no id is duplicated across the entire dataset", () => {
  const seen = new Map();
  const duplicates = [];
  for (const [collection, list] of Object.entries(data)) {
    for (const e of list) {
      if (seen.has(e.id)) duplicates.push(`${e.id} (in both ${seen.get(e.id)} and ${collection})`);
      else seen.set(e.id, collection);
    }
  }
  assert.equal(duplicates.length, 0, `cross-collection duplicate ids: ${duplicates.join(", ")}`);
});

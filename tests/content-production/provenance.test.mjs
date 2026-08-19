// Invariant 24: provenance is present. Every production entity must carry
// a non-null source (already checked to resolve in
// referential-integrity.test.mjs); this suite checks presence and, since
// every Phase 6B entity is CANDIDATE and unverified, that this is stated
// honestly rather than borrowing a verification_status it hasn't earned.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, PRODUCTION_COLLECTIONS } from "./helpers/load-production.mjs";

const data = loadAll();

test("every production entity has a non-null source", () => {
  const bad = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (!entity.source) bad.push(`${name}/${entity.id}`);
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every production entity has a non-null verification_status", () => {
  const bad = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (!entity.verification_status) bad.push(`${name}/${entity.id}`);
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("no CANDIDATE production entity claims source_verified — nothing here has actually been checked against ISACA source material yet", () => {
  const bad = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (entity.content_status === "CANDIDATE" && entity.verification_status === "source_verified") {
        bad.push(`${name}/${entity.id}`);
      }
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

test("every entity carries a note documenting its Phase 6B candidate/authorship status", () => {
  const bad = [];
  for (const name of Object.keys(PRODUCTION_COLLECTIONS)) {
    for (const entity of data[name]) {
      if (!entity.note || !/CANDIDATE/.test(entity.note)) bad.push(`${name}/${entity.id}`);
    }
  }
  assert.equal(bad.length, 0, bad.join(", "));
});

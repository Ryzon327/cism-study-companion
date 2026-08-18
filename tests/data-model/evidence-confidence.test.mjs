// Covers: "confidence does not constitute mastery metadata", from the
// Phase 3 confidence-clarification amendment. Confidence is a calibration
// signal, not a knowledge-mastery input - this test makes that a checked
// invariant, not just documentation prose.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll } from "./helpers/load-registry.mjs";

const data = loadAll();

test("evidence.confidence exists and is explicitly marked as not contributing to mastery", () => {
  const confidence = data.evidenceDimensions.find(e => e.id === "evidence.confidence");
  assert.ok(confidence, "evidence.confidence must exist in the registry");
  assert.equal(confidence.contributes_to_mastery, false, "evidence.confidence.contributes_to_mastery must be false");
});

test("every other evidence dimension explicitly declares contributes_to_mastery", () => {
  for (const dim of data.evidenceDimensions) {
    assert.equal(typeof dim.contributes_to_mastery, "boolean", `${dim.id}: contributes_to_mastery must be an explicit boolean, not implied`);
  }
});

test("practice modes are operational metadata and never contribute to mastery", () => {
  for (const mode of data.practiceModes) {
    assert.equal(mode.contributes_to_mastery, false, `${mode.id}: practice modes describe where/how evidence was generated, not curriculum knowledge - contributes_to_mastery must be false`);
  }
});

test("evidence.confidence is the only mastery-non-contributing dimension among the ten repair-mapped dimensions", () => {
  // The ten Repair Model dimensions all contribute to mastery; only the two
  // Phase 3-added dimensions (confidence, and potentially future calibration
  // signals) are exempt. This locks the reconciliation between the Evidence
  // Vocabulary (superset) and the Repair Target vocabulary (subset).
  const repairMappedDimensionIds = new Set(data.repairTargets.map(r => r.related_evidence_dimension));
  for (const dim of data.evidenceDimensions) {
    if (repairMappedDimensionIds.has(dim.id)) {
      assert.equal(dim.contributes_to_mastery, true, `${dim.id} has a repair target mapped to it, so it must contribute to mastery`);
    }
  }
});

// Covers: "canonical concepts resolve to domains", "canonical question
// domain resolves", and the domain.foundation exclusion requirement, from
// docs/data-model/VALIDATION-INVARIANTS.md. This is the direct structural
// regression lock for the class of defect BUG-002 represents.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAll, buildIndex } from "./helpers/load-registry.mjs";

const data = loadAll();
const index = buildIndex(data);

function domainOf(id) {
  const hits = index.get(id);
  const hit = hits?.find(h => h.collection === "domains");
  return hit?.entity ?? null;
}

test("every concept's home_domain resolves to a real domain (no orphaned concepts)", () => {
  const orphaned = data.concepts.filter(c => domainOf(c.home_domain) === null).map(c => c.id);
  assert.equal(orphaned.length, 0, `concepts with unresolved home_domain: ${orphaned.join(", ")}`);
});

test("every question's concepts resolve to a concept whose home_domain is a real domain", () => {
  const unresolved = [];
  const conceptById = new Map(data.concepts.map(c => [c.id, c]));
  for (const q of data.questions) {
    for (const cid of q.concepts) {
      const concept = conceptById.get(cid);
      if (!concept) { unresolved.push(`${q.id}: concept "${cid}" does not exist`); continue; }
      if (domainOf(concept.home_domain) === null) {
        unresolved.push(`${q.id}: concept "${cid}" has an unresolved home_domain "${concept.home_domain}"`);
      }
    }
  }
  assert.equal(unresolved.length, 0, unresolved.join("\n"));
});

test("domain.foundation is structurally excluded from exam-domain semantics", () => {
  const foundation = data.domains.find(d => d.id === "domain.foundation");
  assert.ok(foundation, "domain.foundation must exist");
  assert.equal(foundation.exam_domain, false, "domain.foundation.exam_domain must be false");
  assert.equal(foundation.exam_weight, null, "domain.foundation.exam_weight must be null");
});

test("exactly the four ISACA domains are marked exam_domain, weights sum to 100", () => {
  const examDomains = data.domains.filter(d => d.exam_domain === true);
  assert.equal(examDomains.length, 4, `expected exactly 4 exam domains, found ${examDomains.length}`);
  const ids = examDomains.map(d => d.id).sort();
  assert.deepEqual(ids, ["domain.d1", "domain.d2", "domain.d3", "domain.d4"]);
  const total = examDomains.reduce((sum, d) => sum + d.exam_weight, 0);
  assert.equal(total, 100, `exam domain weights must sum to 100, got ${total}`);
});

test("no question assigned to domain.foundation is treated as one of the four exam domains", () => {
  for (const q of data.questions) {
    if (q.domain !== "domain.foundation") continue;
    const domain = data.domains.find(d => d.id === q.domain);
    assert.equal(domain.exam_domain, false, `${q.id} is tagged domain.foundation, which must never be exam_domain: true`);
  }
});

// Requirements 1 & 2: duplicate/colliding concept identity; concepts that
// cannot resolve to a domain.
//
// The two `todo` tests below assert the CORRECT invariant, not a weakened
// version of it — they are expected to fail today, and that failure is the
// point. See docs/regressions/REGISTRY.md BUG-001 and BUG-002. Do not
// "fix" these by editing data/*.js content during Phase 1; the underlying
// concept-identity model is deferred to the canonical data model phase.
import test from "node:test";
import assert from "node:assert/strict";
import { loadAppGlobals } from "../helpers/load-app-globals.mjs";
import { resolveConceptDomain } from "../helpers/concept-domain.mjs";

const { CISMContent, CISMActiveLearning, CISMMixedPractice, CISMExamBank } = loadAppGlobals();

test("data/content.js concept titles are unique across all four domains", () => {
  const seenIn = new Map();
  for (const [d, domain] of Object.entries(CISMContent.domains)) {
    for (const c of domain.concepts) {
      const domains = seenIn.get(c.title) || [];
      domains.push(d);
      seenIn.set(c.title, domains);
    }
  }
  const collisions = [...seenIn.entries()].filter(([, ds]) => ds.length > 1);
  // .length is used (not deepEqual against a literal []) because collisions
  // is ultimately derived from data evaluated in the vm sandbox in
  // load-app-globals.mjs; deep-equality checks can fail on cross-realm
  // array identity even when both arrays are genuinely empty.
  assert.equal(
    collisions.length,
    0,
    `content.js concepts used in multiple domains: ${collisions.map(([t, ds]) => `"${t}" in [${ds}]`).join(", ")}`
  );
});

test(
  "no data/active-learning.js concept title is used by challenges in more than one domain",
  { todo: "BUG-001 — see docs/regressions/REGISTRY.md" },
  () => {
    const seenIn = new Map();
    for (const [d, lab] of Object.entries(CISMActiveLearning)) {
      for (const c of lab.challenges) {
        const domains = seenIn.get(c.concept) || new Set();
        domains.add(d);
        seenIn.set(c.concept, domains);
      }
    }
    const collisions = [...seenIn.entries()].filter(([, ds]) => ds.size > 1);
    assert.equal(
      collisions.length,
      0,
      `concepts used by active-learning challenges in more than one domain: ${collisions
        .map(([c, ds]) => `"${c}" in [${[...ds]}]`)
        .join(", ")}`
    );
  }
);

test(
  "every concept referenced by Mixed Practice or the exam bank resolves to exactly one domain",
  { todo: "BUG-002 — see docs/regressions/REGISTRY.md" },
  () => {
    const concepts = new Set([
      ...CISMMixedPractice.questions.map(q => q.concept),
      ...CISMExamBank.questions.map(q => q.concept)
    ]);
    const orphaned = [...concepts].filter(c => resolveConceptDomain(CISMActiveLearning, c) === null);
    assert.equal(
      orphaned.length,
      0,
      `${orphaned.length} of ${concepts.size} concepts do not resolve to any domain via conceptDomain(): ${orphaned
        .slice(0, 10)
        .join(", ")}${orphaned.length > 10 ? ", ..." : ""}`
    );
  }
);

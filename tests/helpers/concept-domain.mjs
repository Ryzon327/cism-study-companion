// Mirrors conceptDomain() as implemented (identically, in two places) in
// js/daily-study.js and js/app.js: the first domain key, in Object.entries
// iteration order, whose data/active-learning.js challenges include a
// matching `concept` string.
//
// This is a deliberate mirror of production logic, not a reimplementation
// of a different algorithm — it exists so data-integrity tests can assert
// what the real app would resolve a concept to, without loading the
// DOM-coupled engine files. If js/daily-study.js's conceptDomain() or its
// duplicate in js/app.js ever changes, update this to match, and revisit
// docs/regressions/REGISTRY.md BUG-001 / BUG-002, which this helper exists
// to characterize.
export function resolveConceptDomain(activeLearning, concept) {
  for (const [domain, lab] of Object.entries(activeLearning || {})) {
    if ((lab.challenges || []).some(c => c.concept === concept)) return domain;
  }
  return null;
}

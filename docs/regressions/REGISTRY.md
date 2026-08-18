# Regression / Defect Registry

Status values: `Open` · `In Progress` · `Fixed` · `Won't Fix` · `Deferred`

A defect is only `Fixed` once its corresponding test's `todo` flag has been
removed, the test passes as a normal (blocking) gate test, and this entry has
been updated to say so. Removing a `todo` flag without fixing the underlying
defect — or fixing the defect without removing the flag — leaves this
registry and the test suite out of sync; treat that as a bug in its own
right.

Per `CLAUDE.md`: a defect entry here is not "resolved" merely because a
document says so. It is resolved when the referenced test is a passing,
non-`todo`, CI-enforced gate.

---

## BUG-001 — Concept identity collision: "Policy hierarchy" spans Domain 1 and Domain 3

- **Status:** Open (Deferred — see Phase 3, canonical concept-identity model)
- **Severity:** High
- **Source:** Engineering Stabilization Baseline Report, 2026-08-18
- **Affected files:** `data/active-learning.js`, `js/daily-study.js`, `js/app.js`, `js/storage.js`
- **Test:** `tests/data-integrity/concept-identity.test.mjs` → *"no data/active-learning.js concept title is used by challenges in more than one domain"* (currently `todo`)
- **Description:** `data/active-learning.js` uses the literal string `concept: "Policy hierarchy"` for challenges in both Domain 1 (`D1-POLICY-HIERARCHY-1/2/3`, `D1-STANDARDS-LINK-1`) and Domain 3 (`D3-POLICY-TECH-1`, `D3-POLICY-STANDARD-1`). `storage.recordActiveResult()` keys the global `mastery` object by concept title alone (not by domain), so attempts against both domains' "Policy hierarchy" challenges are merged into one shared mastery record. `conceptDomain()` — duplicated identically in `js/daily-study.js` and `js/app.js` — resolves this concept to whichever domain appears first in `Object.entries()` iteration order, which is always `"1"`, regardless of where the evidence actually originated.
- **Resolution plan:** Not to be patched in Phase 1 by renaming or restructuring production content. The actual fix belongs to the canonical, domain-scoped concept-identity model introduced in Phase 3.

## BUG-002 — Exam-bank and Mixed Practice concepts that cannot resolve to any domain

- **Status:** Open (Deferred — see Phase 3, canonical concept-identity model)
- **Severity:** High
- **Source:** Engineering Stabilization Baseline Report, 2026-08-18
- **Affected files:** `data/exam-bank.js`, `data/pattern-bank.js`, `data/mixed-practice.js`, `js/daily-study.js`, `js/app.js`
- **Test:** `tests/data-integrity/concept-identity.test.mjs` → *"every concept referenced by Mixed Practice or the exam bank resolves to exactly one domain"* (currently `todo`)
- **Description:** `conceptDomain()` only searches `data/active-learning.js` challenge concepts. 36 of the 57 distinct concept strings used across the merged exam bank (hand-authored + pattern-bank scenario variants) have no matching entry in `active-learning.js` at all, so `conceptDomain()` returns `null` for them. `renderWeakChooser()` in `js/app.js` filters out any mastery record whose resolved domain is `null`, so the majority of Practice-Exam-sourced weakness evidence never appears in "Weak Areas Practice" — not misrouted, but invisible — even though the underlying `storage.mastery[concept]` record is correctly populated.
- **Resolution plan:** Same root cause and same deferred resolution as BUG-001 — this is a symptom of title-string concept identity, not an independent defect. Resolved by the canonical concept-identity model in Phase 3.

## BUG-003 — Dead/unreferenced data files present in the repository

- **Status:** Open (Deferred — do not delete without explicit approval)
- **Severity:** Low (hygiene / contributor-confusion risk, not a learner-facing defect)
- **Source:** Engineering Stabilization Baseline Report, 2026-08-18
- **Affected files:** `data/domains/domain-1.json`, `data/domains/domain-2.json`, `data/domains/domain-3.json`, `data/domains/domain-4.json`, `data/questions/domain-1-questions.json`
- **Test:** `tests/data-integrity/dead-files.test.mjs` → *"every file under data/ is referenced (by path string) from index.html or app source"* (currently `todo`)
- **Description:** These five files are never loaded by any `<script>` tag in `index.html`, never `fetch()`ed, and never referenced by any `.js` file. They hold stub/sample content self-labeled `"status": "sample-only"` and `"status": "content-engine-ready"` from an early build stage, fully superseded by `data/content.js` and the other live data files.
- **Resolution plan:** Explicitly deferred. Per direct instruction, these files must not be deleted during Phase 1 (or any phase) without separate, explicit approval. This entry and its `todo` test exist to keep the dead-file status visible and tracked, not to trigger automatic cleanup.

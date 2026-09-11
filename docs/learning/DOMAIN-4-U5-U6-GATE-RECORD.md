# Phase Gate Record — Domain 4, D4-U5 & D4-U6

**Status: [CANONICAL record of what happened]**. This is the durable
record of Domain 4's third production authoring batch: D4-U5
(Containment) and D4-U6 (Evidence Handling / Investigation), built per the
approved [`DOMAIN-4-CURRICULUM-ARCHITECTURE.md`](DOMAIN-4-CURRICULUM-ARCHITECTURE.md)
and the Architect's D4-U5/U6 authoring directive. All new content remains
`CANDIDATE`.

## Architect review decision

Following Evidence-First review of the 14-panel review artifact
(`/Users/demetrius/Downloads/cism-domain4-u5-u6-review.png`, described
below under Evidence-First status), the Architect recorded:

- D4-U5 (Containment): **APPROVED**.
- D4-U6 (Evidence Handling / Investigation): **APPROVED**.
- Founder UAT: **WAIVED** under the Evidence-First UAT model.
- No curriculum rewrite or UX redesign was requested.
- D4-U5 confirmed to successfully teach: containment limits further harm;
  containment ≠ eradication ≠ recovery ≠ incident closure; containment
  scope should reflect business impact and incident context; the fastest
  technical action is not automatically the best management decision;
  actions that unnecessarily destroy evidence or create excessive
  business disruption may be inappropriate.
- D4-U6 confirmed to successfully teach: investigation seeks reliable
  understanding of what occurred; evidence integrity matters; disciplined
  evidence handling supports reliable management/legal/disciplinary/
  regulatory decisions where applicable; restoring service quickly may
  conflict with evidence-preservation needs; the information security
  manager coordinates the process rather than personally performing
  forensic analysis; external expertise does not transfer organizational
  accountability.
- **U5 containment-stage treatment: APPROVED** — the existing
  `stage.incident.contain` mapping already authored is confirmed correct.
- **U6 cross-cutting lifecycle treatment: APPROVED** — `lifecycle: null`,
  `stage_target: null` confirmed; investigation/evidence preservation may
  operate across multiple stages (IDENTIFY/CONFIRM, CONTAIN, RECOVER), and
  must not be forced into a single stage.
- **U6 prerequisite = D4-U5 only: APPROVED.** No redundant U3/U4
  prerequisite edges are to be added merely for conceptual completeness;
  the `recallPoolFor` inspection is accepted as sufficient evidence that
  additional direct edges would not materially improve retrieval. Preserve
  the current dependency unless a later real defect demonstrates a need to
  change it.
- **Containment-vs-investigation distinction: APPROVED** as authored —
  "How do we stop or limit further harm?" (containment) vs. "What
  happened, what is affected, and what reliable evidence supports that
  conclusion?" (investigation), explicitly NOT taught as strictly
  sequential/non-overlapping; the approved management insight is that
  these concerns can overlap and compete.
- **Evidence-preservation tension: APPROVED as left context-sensitive.**
  No absolute "always/never power off" rule was authored or is to be
  authored; the appropriate action depends on investigative objective,
  evidence volatility, business impact, approved procedure, and
  legal/regulatory context where applicable.
- **CONFUSING-CONCEPTS.md: APPROVED as unchanged.** No new entries for
  Evidence Preservation vs. Rapid Restoration or Investigation vs.
  Containment — the current curriculum teaches these distinctions
  adequately in context; the library remains selective.
- **P04 pattern disposition: APPROVED.** The authoring finding that P04 is
  the appropriate governing pattern for D4-U5 (given the detailed source
  analysis supporting the dominant later-stage-jump error) is accepted.
  P04's meaning, recognition clues, memory rule, and CANONICAL status were
  not altered. The conflicting provisional/working pattern assignment in
  `DOMAIN-4-CURRICULUM-ARCHITECTURE.md` has been corrected via a narrow,
  clearly-marked "Post-authoring corrections" addendum (not a broad
  rewrite) — see that document's own new section for the full correction
  text.
- The reported validation matrix (content-production 409/409, legacy
  523 total/520 pass/0 fail/3 registered `todo`, frontend/Vitest 200/200,
  Chromium 43/43, Firefox 43/43, accessibility passing, visual regression
  32/32, TypeScript clean, production build succeeds, `npm audit` 0
  vulnerabilities) is **accepted**, re-confirmed by a final validation
  re-run at closeout. BUG-001/002/003 remain unchanged/deferred.

## Source coverage

- **D4-U5** grounded in `tools/input/domain-4.txt`'s 4B3 (Incident
  Containment Methods) sub-area, read comprehensively (17 questions):
  containment is explicitly "the first priority in responding to a
  security incident... to limit the impact," ahead of documentation,
  damage assessment, root-cause analysis, or notifying law enforcement
  (root-cause analysis is explicitly identified as eradication work, a
  separate, later process); containment scope should match the incident's
  actual confirmed impact rather than the broadest possible action —
  isolating the affected network segment (not shutting off all network
  access points, which "would create a denial of service that could
  result in loss of revenue") and isolating the affected system (not
  shutting down an entire AI development platform, since that "can
  disrupt business operations and might not be necessary if the breach is
  contained within a limited number of systems") are both explicitly
  preferred over indiscriminate shutdown; restoring from backup before
  containment is explicitly rejected in a ransomware scenario ("could
  allow the backups to be infected and would destroy evidence needed to
  investigate the incident"); preserving forensic evidence is identified
  as "the MOST important incident containment method consideration"; and
  turning off/powering down a system during active data exfiltration is
  explicitly rejected because it "will result in a state change, which
  may result in the loss of forensic evidence" — a targeted action
  (blocking the malicious traffic) is preferred instead.
- **D4-U6** grounded in 4B2 (Incident Investigation and Evaluation), the
  domain's largest single Knowledge-Statement area (36 questions), read
  comprehensively, plus the relevant management-level portion of 4B1
  (Incident Management Tools and Techniques, 26 questions — filtered for
  chain-of-custody/evidence-admissibility content that recurs across both
  tags, not operational tool procedure). Chain of custody is explicitly
  and repeatedly identified as: "the MOST significant concern" when
  evidence is mishandled (ahead of physical damage to the evidence
  itself); the PRIMARY reason being "to ensure that the forensic evidence
  is valid and admissible in a court of law" (explicitly not asset
  tracking or attacker attribution); "the MOST important aspect of
  forensic investigations that will potentially involve legal action";
  and the answer to "MOST important to ensure the admissibility of
  forensic evidence," defined verbatim as "a tracing of who had control
  of the evidence throughout the process." Forensic analysis "must be
  performed only on a copy of the original media so that the evidence is
  uncontaminated," and a write blocker exists specifically "to maintain
  the integrity of the original storage media." When information is
  requested during an investigation, the FIRST priority is explicitly
  "locating the data and preserving the integrity of the data." Whether
  to notify law enforcement is explicitly "senior management's decision,
  depending on various factors identified during a forensic
  investigation." In a scenario where an incident "may want to file
  criminal charges," the source explicitly ranks preventing evidence
  contamination as taking priority even over containment. A digital
  forensic analyst is source-framed as a role to bring in "when needed,"
  not a skill the incident response team itself must hold.

## Learning outcomes

- **D4-U5**: containment limits further harm and spread while the
  incident is still active — it is distinct from eradication (removing
  the root cause), recovery (restoring normal operations), and a resolved
  incident; containment scope should follow the incident's actual,
  confirmed impact rather than an instinct toward the broadest possible
  shutdown; a fast technical action (power-off, restore-from-backup) is
  not automatically the best containment decision if it destroys the
  evidence the organization will need; technical responders act within
  approved management priorities, not on their own instinct toward
  maximal caution.
- **D4-U6**: a reliable understanding of an incident depends on
  disciplined evidence handling — an unbroken, documented chain of
  custody, working from verified copies rather than originals, and
  bringing in forensic expertise when genuinely needed rather than
  expecting the response team to have it; restoring systems too quickly,
  before evidence is preserved, can destroy exactly what a later legal,
  regulatory, disciplinary, or management decision requires; in
  situations that may lead to criminal charges, evidence preservation can
  outweigh the pressure to restore service quickly; deciding whether to
  involve law enforcement remains senior management's decision; a third
  party performing forensic work does not transfer the organization's own
  accountability for how the investigation is handled.

## Harborview progression

Continues directly from D4-U3/U4's classified, escalated incident. D4-U5:
the property's general manager wants the reservations system shut down
chain-wide "to be safe," but the incident response team has confirmed the
compromise is limited to the one property's own reservation server — the
security manager directs a proportionate, scoped isolation instead. D4-U6:
with the server now contained, Harborview's IT team is eager to wipe and
reimage the original hard drive to restore service — the security manager
instead directs the team to preserve a verified copy of the original
before any rebuild proceeds, continuing the same incident and the same
Harborview property established across D4-U3 through D4-U5. The story
remains management-level throughout — no SOC/forensic-tool-operation
detail was introduced in either unit.

## Containment reasoning

Containment is taught as scope-proportionate and evidence-aware: the
correct action in every D4-U5 variant is a targeted, confirmed-scope
isolation, never an indiscriminate shutdown, and never a hasty technical
action (power-off, restore-from-backup) that would destroy evidence
needed later. This directly reuses the existing
`CONFUSING-CONCEPTS.md` "Containment vs. Eradication vs. Recovery" entry
(not duplicated) — D4-U5 is that entry's first full teaching unit, per
the curriculum architecture's own design.

## Investigation reasoning

Investigation is taught as a discipline that depends on evidence
integrity — chain of custody, working from copies, and appropriate
expertise — rather than as "whatever happens after containment." The
source material does not support a strict "containment always finishes,
then investigation begins" sequence; instead, evidence preservation
begins as soon as containment is underway and continues to matter through
eradication/recovery decisions, and in one clearly scoped context
(possible criminal charges), evidence preservation is source-ranked even
above containment speed. D4-U6 teaches this as a genuine, source-grounded
nuance rather than flattening it into a rigid before/after rule — see
`question.d4.0019`'s explanation, which explicitly states this is "a
scoped refinement of containment-first sequencing, not a rule that
evidence always outranks every other priority."

## Evidence / chain-of-custody treatment

Taught at a management level only: what chain of custody is (a
documented, unbroken record of who controlled evidence and when), why it
matters (admissibility/credibility for legal, regulatory, or disciplinary
decisions — not asset tracking, not attacker attribution, not a specific
storage-medium requirement), and that a broken chain of custody is a
bigger risk than physical damage to the evidence itself. No forensic
acquisition commands, imaging-tool procedures, or courtroom-outcome
claims beyond source support were taught. No blanket claim that "every
incident requires law-enforcement-grade evidence handling" was made —
the elevated evidence-preservation priority is explicitly scoped to the
criminal-charges context the source itself uses.

**Source nuance flagged, not silently resolved.** One 4B2 item recommends
pulling power on a compromised server specifically to preserve
disk-based forensic evidence during acquisition ("standard advice from
law enforcement is to pull the power plug... to maximize preservation of
evidence"). This is not the same claim as D4-U5's own 4B3-grounded
finding that powering off a system during active exfiltration destroys
volatile/memory-state evidence — the two items address different
evidence types (disk-state vs. volatile state) in different scenarios
(evidence acquisition vs. active exfiltration containment). This batch
deliberately does not teach a single "always/never power off" rule and
does not stage a question that would force that unresolved tension into
an artificial resolution. Documented in
`concept.d4.evidence-investigation`'s own `note` field for Architect
awareness.

## Lifecycle/stage treatment

Per the Architect's explicit instruction to use only existing registry
IDs and not force cross-cutting families into a stage merely because a
unit's name suggests one:

- **D4-U5** is genuinely, consistently bound to `stage.incident.contain`
  across all three variants — every one of the 17 4B3 source questions
  concerns the post-confirmation, pre-eradication containment phase.
  `family.lifecycle: "lifecycle.incident"`, `family.stage_target:
  "stage.incident.contain"`.
- **D4-U6** is deliberately cross-cutting — much of 4B2's own
  chain-of-custody/admissibility material is stage-agnostic process
  guidance, and the source material itself (e.g. the 4B5-tagged
  "isolated, and proper forensic processes have been followed... next
  step" item) shows evidence/investigation work spanning from
  containment through the boundary of eradication/recovery, not confined
  to one lifecycle moment. `family.lifecycle: null`, `family.stage_target:
  null`.

## D4-U6 dependency recommendation (the Architect's explicitly unlocked item)

**Recommendation: single prerequisite on D4-U5 only — the linear chain is
preserved.** This was confirmed, not assumed, via direct inspection of
`app/src/content/resolve.ts`'s `recallPoolFor` function: the recall pool a
lesson draws from is the **full transitive closure** of every reachable
prerequisite lesson's `retrieval_refs`/families — it is a flat set, not
distance-weighted or nearest-prerequisite-only. This means a single edge
to D4-U5 already makes D4-U1 through D4-U5 fully recall-eligible for
D4-U6; a second direct prerequisite edge to D4-U3 or D4-U4 would be
**functionally inert** for recall purposes. The schema does genuinely
support multi-parent prerequisites elsewhere in this project (e.g.
`lesson.d2.residual-risk-acceptability` depends on both
`lesson.d2.risk-control-ownership` and `lesson.d2.risk-treatment-response`
— two genuinely separate branches of Domain 2's own tree that needed to
reconverge), so this is a real schema capability that was seriously
considered, not dismissed for lack of support. But Domain 4 has been a
strictly linear chain through every unit authored so far (U1→U2→U3→U4→U5),
with no branching that would need a second edge to reconverge — so a
second edge here would add schema complexity without changing any
learner-facing behavior. `lesson.d4.evidence-investigation.prerequisites =
["lesson.d4.incident-containment"]` only.

## Authority treatment

External/legal-notification authority (whether to involve law
enforcement) is placed with `role.board-senior-management`, never with
the investigator or `role.incident-response-team` acting alone —
directly source-confirmed and consistent with D4-U4's own established
escalation-authority pattern (Pattern P02, Authority Follows
Accountability, reused rather than reinvented).

## Legal/regulatory handling

No absolute rules were created. "Always notify law enforcement," "always
involve legal first," and "always preserve every system untouched" were
all deliberately avoided. The one elevated-priority claim
(evidence-preservation outranking restoration speed) is explicitly scoped
to "situations where the incident may lead to criminal charges," mirroring
the source's own scoping, not generalized into a universal rule.

## Third-party handling

Not staged as its own dedicated question this batch (D4-U4 already tests
third-party accountability directly, and remains fully reachable via
D4-U6's recall pool). Reinforced narratively in
`concept.d4.evidence-investigation`'s own teaching text: "a third party
performing forensic work does not transfer the organization's own
accountability for how the investigation is handled" — consistent with
the existing Domain 3 external-services-accountability pattern and
D4-U4's own third-party principle, not re-derived from scratch. No vendor
was added to the Harborview story merely to reuse Domain 3 material, per
the binding instruction.

## Confusing-concept disposition

`docs/learning/CONFUSING-CONCEPTS.md` was inspected for: Containment vs.
Eradication vs. Recovery (already exists — D4-U5 reinforces it as that
entry's first full teaching unit, not duplicated); Evidence preservation
vs. rapid restoration (a real, source-supported tension, but judged to
fit naturally inside D4-U6's own lesson narrative rather than requiring a
separate glossary entry); Investigation vs. containment (also judged to
belong inside the lesson narrative — the two units' own scenario
continuity already makes the distinction concrete); chain of custody vs.
ordinary documentation (the source itself defines chain of custody
precisely enough that a dedicated confusing-concept entry did not seem
materially necessary). **No new entry was added this batch.** Flagged for
Architect review, not silently added or silently skipped — see
"Unresolved concerns" in the final report.

## Question families

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D4-U5 | `concept.d4.incident-containment` | `family.d4.incident-containment` | `question.d4.0014` (Harborview anchor — proportionate scope over chain-wide shutdown), `question.d4.0015` (regional manufacturing company — contain before restore), `question.d4.0016` (national logistics company — block traffic, not power off) |
| D4-U6 | `concept.d4.evidence-investigation` | `family.d4.evidence-investigation` | `question.d4.0017` (Harborview anchor — preserve a copy before any rebuild), `question.d4.0018` (regional healthcare provider — PRIMARY reason for chain of custody), `question.d4.0019` (national retail chain — evidence preservation outranks restoration speed when criminal charges may follow) |

One family per unit, 3 variants each. For D4-U6 specifically: the source
material's chain-of-custody/evidence-integrity reasoning is genuinely one
coherent, heavily-repeated invariant across 4B2/4B1 (the same "evidence
admissibility/credibility" reasoning underlies the chain-of-custody
definition, the work-from-copies rule, and the authority/sequencing
questions) — not multiple materially different reasoning families. A
second family was seriously considered (the directive explicitly invited
this) but not adopted, since splitting "evidence integrity" from
"authority/sequencing" would have separated facets of the same underlying
principle rather than teaching two genuinely different ideas. 6 new
questions total (`question.d4.0014` through `question.d4.0019`), 2 new
concepts, 2 new families, 2 new lessons — all `CANDIDATE`, `unverified`.

## Pattern/registry disposition

No `applicable_domains` registry edit was needed this batch — D4-U5
reuses P01 (Business Alignment) and P04 (No Lifecycle Jumping); D4-U6
reuses P02 (Authority Follows Accountability) and P04 (No Lifecycle
Jumping) — all four already carry `domain.d4` in their `applicable_domains`
arrays (P04 from the architecture phase; P01/P02 already used in D4-U1
through U4; P11's extension approved in the prior D4-U3/U4 batch). No new
pattern was invented. One deliberate correction from the architecture
doc's own proposal: the architecture document's working table guessed
Pattern P05 (No Lifecycle Reversal) as D4-U5's governing pattern; direct
source analysis instead confirmed **P04 (No Lifecycle Jumping)** is the
actual governing pattern — the dominant trap across the 17 4B3 questions
is a distractor that jumps AHEAD to a later-stage action (eradication,
law-enforcement notification, formal evidence imaging, damage assessment)
before containment is complete, which is P04's own recognition pattern
("stem describes an early-stage situation and an option proposes a
later-stage action"), not P05's (retreating to an already-passed stage).
This is flagged explicitly as a correction, not a silent deviation from
the architecture doc.

## Distractor-quality review

Every distractor across both families maps to a real, source-documented
temptation: overbroad/indiscriminate shutdown, premature root-cause
delay, evidence-destroying technical shortcuts, chain-of-custody concept
confusion (asset tracking, attribution, storage medium), and
authority-error (assuming the investigator/response team/technical role
can decide law-enforcement notification). No distractor is a throwaway or
obviously-wrong strawman.

## Qualifier review

FIRST (`question.d4.0014`, `0015`, `0016`, `0017`), PRIMARY
(`question.d4.0018`), MOST (`question.d4.0019`) — all source-appropriate
and source-grounded; no manufactured NEXT.

## Role/authority review

`role.security-manager`, `role.incident-response-team`, and
`role.board-senior-management` are the only roles mentioned, all
CANONICAL, all used per their registered authority — no new role
invented for "forensic specialist" (the source itself frames this as a
role brought in "when needed," not a fixed registry role requiring its
own ID).

## Source-grounding review

Every concept/family/lesson/question `note` field cites specific 4B3/4B2
(and filtered 4B1) source findings, several with short verbatim quotes;
no fabricated or inferred source claims.

## Lifecycle audit

Only the existing CANONICAL `lifecycle.incident` and its existing 6 stage
IDs are referenced; no new lifecycle or stage was invented.
`stage.incident.contain` is genuinely earned for D4-U5; `null` is
genuinely earned for D4-U6, per direct source analysis (see "Lifecycle/
stage treatment" above).

## Concept-ID safety

`concept.d4.incident-containment` and `concept.d4.evidence-investigation`
are unique, non-colliding with any prior-domain or prior-Domain-4 concept
ID.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions carry
`content_status: "CANDIDATE"`, `verification_status: "unverified"` — no
CANONICAL promotion occurred.

## Validation

- `tests/content-production/` (full glob): 409/409 pass, including 32 new
  tests in `domain4-u5-u6.test.mjs`.
- `family-integrity.test.mjs`'s expected-variant-count map gained 2
  entries (`family.d4.incident-containment`: 3,
  `family.d4.evidence-investigation`: 3).
- Legacy `node --test` full suite: 523 tests, 520 pass, 0 fail, 3 `todo`
  (BUG-001/002/003, pre-existing, unchanged).
- Vitest frontend: 200/200 pass, 18 files.
- TypeScript (`tsc --noEmit`): clean.
- Production build (`npm run build`): succeeds.
- Playwright Chromium (functional + `@a11y`): 43/43 pass.
- Playwright Firefox (functional + `@a11y`): 43/43 pass.
- Playwright visual regression: 32/32 pass against existing baselines — no
  baseline updates, since no UI/markup/CSS change occurred this batch.
- `npm audit`: 0 vulnerabilities.

## Defects found/fixed during authoring

1. **A test-logic bug in the newly authored `domain4-u5-u6.test.mjs`
   itself** (not a content defect): the law-enforcement-authority test's
   `Array.find` matched the first question containing the phrase "law
   enforcement" anywhere in its options, rather than the specific variant
   containing the team-decides-independently distractor. Fixed by
   matching on the distractor's own text/rationale shape directly. No
   content change was required — the underlying `question.d4.0019`
   content was correct throughout.

No content-quality defect (incorrect reasoning, mis-grounded source
claim, or unfair distractor) was found. No length-bias failure occurred
this batch (both new families' correct answers were the longest option in
only 1-2 of 3 variants, never 3/3).

## Evidence-First status

One continuous, real-browser walkthrough (D4-U5 Recall → Learn → Apply →
incorrect Feedback → Repair, then D4-U6 Recall → Learn → Apply →
incorrect Feedback → Repair, then a transfer-scenario panel illustrating
the containment/investigation distinction, then Explore, then Practice,
then a mobile Apply screen for D4-U6) was captured as 14 screenshots and
composed into one local contact sheet for Architect review — not
committed, not published:
`/Users/demetrius/Downloads/cism-domain4-u5-u6-review.png`

Confirmed live in the browser:
- D4-U5's Learn screen correctly displays the "Business Alignment" (P01)
  pattern callout with the Harborview scope-proportionality scenario.
- D4-U6's Learn screen correctly displays the "Authority Follows
  Accountability" (P02) pattern callout, continuing directly from D4-U5's
  contained incident.
- D4-U6's Repair screen, for the "delay restoration until law enforcement
  finishes" distractor, correctly surfaced the shared, domain-agnostic
  repair-target micro-question template — no Domain-4-specific repair
  code exists or was needed.
- The transfer-scenario panel (healthcare provider, chain-of-custody
  PRIMARY-reason question) renders as a clean, standalone illustration of
  investigation reasoning with no containment overlap, usable to contrast
  against the D4-U5 panels.
- The mobile Apply screen (390px viewport) renders D4-U6's Harborview
  question legibly with no layout defects.
- AnswerOrder shuffling is visibly active in the captured screenshots
  (option-letter assignment differs from the JSON's own a/b/c/d authoring
  order), confirming Daily Study, Feedback, and Repair all work
  generically for this batch's content with no special-case code.

## Production integration

Domain 4 U5/U6 content integrates through the exact same structures every
prior domain/unit uses. **Zero learning-mode code was modified**:
`explore.ts`, `practice.ts`, `reinforcement.ts`, `QuestionAttemptFlow.tsx`,
`selection.ts`, `answerOrder.ts`, and the shared Repair system are
byte-for-byte unchanged. `app/src/App.tsx`'s dev-only QA review-lesson
list gained two entries (D4-U5, D4-U6 labels) — the only application-code
change in this batch.

## Deferred / not touched

D4-U7 onward (not authored this batch); Domain 5 (does not exist);
learning-mode architecture; `selection.ts`/`answerOrder.ts`; persistence;
confidence adaptation; Adaptive Reinforcement; BUG-001/002/003 (all still
correctly `Open`, untouched); Foundation/Domain 1/Domain 2/Domain 3/D4-U1
through D4-U4 production curriculum (byte-for-byte unchanged);
`CONFUSING-CONCEPTS.md` (not modified — see "Confusing-concept
disposition" above); `schema/registry/patterns.json`'s `applicable_domains`
arrays (no edit needed or made this batch — all four patterns reused were
already Domain-4-approved).

## Final closeout disposition

Architect review is complete and this batch is **APPROVED** for
source-control closeout (commit → push → PR → merge → post-merge
verification). See the companion `DOMAIN 4 — U5/U6 FINAL POST-MERGE
REPORT` (delivered to the Architect/Founder in the same turn as this
record's closeout update) for the exact commit SHA, PR number/URL, CI
results, and post-merge verification. This gate record remains the
durable record of the curriculum/content decision; the final post-merge
report is the durable record of the closeout mechanics.

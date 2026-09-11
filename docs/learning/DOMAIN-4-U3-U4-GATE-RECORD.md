# Phase Gate Record — Domain 4, D4-U3 & D4-U4

**Status: [CANONICAL record of what happened]**. This is the durable
record of Domain 4's second production authoring batch: D4-U3 (Incident
Classification / Severity) and D4-U4 (Escalation & Communications), built
per the approved [`DOMAIN-4-CURRICULUM-ARCHITECTURE.md`](DOMAIN-4-CURRICULUM-ARCHITECTURE.md)
and the Architect's D4-U3/U4 authoring directive. All new content remains
`CANDIDATE`.

## Architect review decision

Following Evidence-First review of the 13-panel review artifact
(`/Users/demetrius/Downloads/cism-domain4-u3-u4-review.png`, described
below under Evidence-first review), the Architect recorded:

- D4-U3 (Incident Classification / Severity): **APPROVED**.
- D4-U4 (Escalation & Communications): **APPROVED**.
- Founder UAT: **WAIVED** under the established Evidence-First UAT model.
- No curriculum rewrite or UX redesign was requested.
- D4-U3 confirmed to successfully teach Event ≠ Incident reasoning,
  confirm/classify before an inappropriate response action, business
  impact as the severity/prioritization basis, and rejection of technical
  drama as a severity shortcut. The Harborview failed-login scenario,
  `stage.incident.identify-confirm` treatment, existing `lifecycle.incident`
  use, current family/variant architecture, and current Aha direction are
  all **APPROVED**.
- D4-U4 confirmed to successfully teach escalation based on classified
  business impact, audience-appropriate communication, authority-aware
  external communication, and rejection of raw technical detail for
  management audiences — without manufacturing an absolute legal/
  regulatory notification rule, and with third-party involvement correctly
  never transferring accountability. Harborview continuity, P11 reuse,
  the deliberate `lifecycle: null` / `stage_target: null` cross-cutting
  treatment, current family/variant architecture, and current Aha
  direction are all **APPROVED**. U4 was explicitly confirmed **not**
  forced into a lifecycle stage for symmetry.
- **pattern.p11 `applicable_domains` extension to Domain 4: APPROVED.**
  The narrow registry metadata change is kept as authored — D4-U4
  genuinely reuses the existing CANONICAL Audience-Appropriate
  Communication pattern. Only `applicable_domains` was authorized to
  change; the pattern's `meaning`, `recognition_clues`, `nuance`,
  `memory_rule`, `id`, and `CANONICAL` status were not touched and remain
  untouched.
- **New `CONFUSING-CONCEPTS.md` entries for Escalation vs. Notification and
  Communication vs. External Notification: DECLINED / NOT NEEDED.** The
  current curriculum already teaches the necessary distinction in
  context; `CONFUSING-CONCEPTS.md` is deliberately kept selective and is
  not expanded merely because a distinction can be described. No
  documentation follow-up is required for these two items.
- The reported validation matrix (content-production 377/377, legacy 488
  pass/0 fail/3 registered `todo`, frontend/Vitest 200/200, Chromium
  43/43, Firefox 43/43, accessibility passing, visual regression 32/32,
  TypeScript clean, production build succeeds, `npm audit` 0
  vulnerabilities) is **accepted**, subject to final source-control
  closeout checks. BUG-001/002/003 remain unchanged/deferred.

## Source coverage

- **D4-U3** grounded in `tools/input/domain-4.txt`'s 4A5 (Incident
  Classification/Categorization) sub-area, read comprehensively (16
  questions): an incident is classified by the nature/intent of the
  confirmed act (an intentional, privileged-access misuse by an insider is
  classified as "insider threat," not "configuration error," "privilege
  escalation," or "denial of service" — each a different actual fact
  pattern); the PRIMARY purpose of classification/categorization and
  triage is using limited incident resources more efficiently, not
  preventing recurrence, ensuring containment, or improving team
  awareness; during the detection-and-analysis phase, a category is
  assigned based on financial/legal/regulatory/operational/reputational
  impact; a data breach is a more precise, and therefore better,
  classification than a broader label like "unauthorized access" when the
  facts support it; the BEST factor for escalating to an internal response
  team is the incident's classification/categorization level itself,
  because that level defines likely impact and urgency; the MOST effective
  way to ensure proper classification is a framework tailored to the
  organization's own business context, built with stakeholder input — not
  generic industry-standard categories, not the incident response team
  alone, and not outsourced to a third party.
- **D4-U4** grounded in 4B4 (Incident Response Communications), also read
  comprehensively (18 questions): the most important item to report to the
  CIO/senior management after a significant breach is the impact and
  corrective actions taken, not a technical log, industry comparison, or
  business case for new controls (each explicitly rejected in-source); the
  primary purpose of a crisis communication plan is providing procedures
  for who/how to contact stakeholders, not minimizing information loss or
  covering only media contact; on discovering exposed confidential data,
  the FIRST step is notifying the data owner before any unilateral
  technical action; the greatest challenge to effective incident
  management is insufficiently defined escalation paths; data owners are
  notified FIRST when a breach affecting customer data is confirmed — the
  steering committee, customers, and regulators are notified later per
  policy/regulatory requirements, not simultaneously; the MOST important
  consideration for media interaction is a specifically drafted message
  from one authorized spokesperson; the BEST input for defining escalation
  guidelines is a risk and impact analysis (a direct callback to D4-U2's
  BIA reasoning); communication regarding security events with legal
  implications is explicitly a business decision belonging to management,
  not the information security manager contacting external authorities
  directly; effective incident management in a large enterprise is MOST
  dependent on effective communication/reporting processes; the factor
  most likely to result in incident identification is security awareness
  training (a direct Domain 3, D3-U7 callback).

## Learning outcomes

- **D4-U3**: an event is not an incident until confirmed — action or
  escalation on assumption, in either direction (overreaction or
  dismissal), is a failure mode distinct from correct behavior; severity
  follows business impact (financial, legal/regulatory, operational,
  reputational, and which specific assets/processes are affected), not
  technical sophistication or drama; classification follows a predefined,
  business-context-tailored scheme built with stakeholder input, not
  generic industry categories or the technical response team's judgment
  alone.
- **D4-U4**: escalation and communication route decision-relevant,
  audience-appropriate information through an authorized path; senior
  management/executives need business impact and corrective action, not
  raw technical detail; media contact goes through one authorized,
  pre-prepared spokesperson only; deciding whether/how to notify external
  parties (regulators, customers, press) with legal/regulatory
  implications is a management decision under the organization's own
  communication plan — never the ISM, the incident response team, or an
  involved third party acting unilaterally; a third party's technical
  involvement in an incident does not transfer the organization's own
  accountability for that decision.

## Reference story continuity

**Harborview Hotels** continues as Domain 4's stable reference
organization, directly continuing the arc from D4-U1/U2. D4-U3 introduces
an overnight spike in failed staff-account logins on the reservations
system at one property: the general manager wants a chain-wide shutdown,
the front-desk supervisor assumes a routine glitch, and the ISM instead
confirms what is actually known (one privileged account compromised,
guest payment data not accessed) before classifying the incident. D4-U4
continues directly from that same classified incident: corporate
leadership, legal/compliance, PR, and the property-management-system
vendor all want information, and the ISM routes business-impact reporting
to leadership, redirects an unauthorized media contact to the single
authorized spokesperson, and confirms that external/regulatory
notification authority belongs to Harborview's management, not to any
technical role or the vendor. The story remains management-level
throughout — no SOC, malware-analysis, or forensic detail was introduced.

## Lifecycle treatment

Per the Architect's explicit locked decision, only the existing CANONICAL
`lifecycle.incident` and its existing registry stage IDs are used — no new
lifecycle or stage was introduced:

- **D4-U3** is genuinely, consistently bound to
  `stage.incident.identify-confirm` across all three variants — the
  source's own Detection and Analysis phase is where a category is
  assigned, and all three variants stay on identify/confirm/classify
  reasoning. `family.lifecycle: "lifecycle.incident"`,
  `family.stage_target: "stage.incident.identify-confirm"`.
- **D4-U4** is deliberately cross-cutting — escalation and communication
  recur throughout the incident lifecycle rather than belonging to one
  stage of it, and is not forced into a stage merely because it follows
  classification in sequence, per the Architect's explicit instruction.
  `family.lifecycle: null`, `family.stage_target: null`.

## Escalation/communication treatment

D4-U4 treats escalation and communication as a management discipline, not
an instinct to over- or under-communicate: escalation guidelines derive
from risk/impact analysis (the same reasoning D4-U2's BIA establishes),
audience determines information content and depth (business impact and
corrective action to executives, never a raw technical log), media
contact is centralized to one authorized spokesperson, and
external/legal notification is explicitly a management decision under the
organization's own communication plan. Legal-notification rules are
**not** made absolute — the correct answer routes to "management,
following the organization's established incident communication plan,"
not to a specific hardcoded external-notification rule, since the source
material does not support a universal rule beyond that authority
placement.

## Role/authority treatment

Authority for external/legal communication is placed with management
(`role.board-senior-management`), never with `role.security-manager` or
`role.incident-response-team` acting alone, and never with an involved
third party. This is tested directly in `question.d4.0013`'s distractor
set (ISM-decides, IR-team-decides, and third-party-decides are all
`repair.authority-error`/`repair.business-context-error` distractors).
Media-spokesperson authority (`question.d4.0012`) follows the same
authority-follows-accountability reasoning (Pattern P02) without
introducing a new role ID for "spokesperson" or "media relations" — no
registry gap was found requiring a new role.

## Qualifiers

`qualifier.first` (D4-U3 Harborview anchor — confirm before act),
`qualifier.most` (D4-U3 severity-ranking and scheme-effectiveness
variants), `qualifier.best` (D4-U4 Harborview anchor — reporting content),
and `qualifier: null` (D4-U4's media-authority and external-notification-
authority variants, whose stems do not carry an explicit superlative —
consistent with the 32 existing production questions across Domains 1–4
that already use `qualifier: null`). No `qualifier.next` was manufactured.

## Question families

| Unit | Concept | Family | Variants |
|---|---|---|---|
| D4-U3 | `concept.d4.incident-classification-severity` | `family.d4.incident-classification-severity` | `question.d4.0008` (Harborview anchor — confirm before classify), `question.d4.0009` (regional grocery chain — business impact vs. technical sophistication), `question.d4.0010` (regional courier company — business-context-tailored scheme) |
| D4-U4 | `concept.d4.escalation-communications` | `family.d4.escalation-communications` | `question.d4.0011` (Harborview anchor — audience-appropriate leadership reporting), `question.d4.0012` (mid-size pharmacy chain — authorized-spokesperson-only media contact), `question.d4.0013` (regional telecommunications provider — management owns external-notification authority) |

One family per unit, 3 variants each — the source supports a single clean
central reasoning family for both units, so no additional family was
introduced merely for coverage. 6 new questions total (`question.d4.0008`
through `question.d4.0013`), 2 new concepts, 2 new families, 2 new
lessons — all `CANDIDATE`, `unverified`.

## Pattern registry note (P11 `applicable_domains` extension)

`schema/registry/patterns.json`'s `pattern.p11` (Audience-Appropriate
Communication) had `applicable_domains: ["domain.d1", "domain.d2",
"domain.d3"]`. This batch's own authoring directive explicitly named "P11
audience-appropriate communication" as D4-U4's expected Domain 3
cross-domain-reinforcement target, and 4B4's CIO/senior-management
reporting material (business impact, not raw logs) is a direct,
source-supported match for P11's existing meaning. `domain.d4` was added
to `pattern.p11.applicable_domains` — **a single, narrow, documented
metadata change**. P11's own `meaning`, `recognition_clues`,
`common_traps`, `nuance`, and `memory_rule` fields were **not** altered;
this is not a redefinition of the pattern, only a declaration that an
already-approved pattern now legitimately applies to a fourth domain,
mirroring how P04/P05/P15 already carry `domain.d4` in their own
`applicable_domains` arrays from the architecture phase. This is a more
assertive registry change than D4-U1/U2 took (which deliberately used
only already-Domain-4-approved patterns and left `applicable_domains`
alone) — flagged explicitly here and in the final report for Architect
confirmation, since it is the first `applicable_domains` edit made during
a production-authoring batch rather than during the architecture phase
itself.

**Architect decision: APPROVED.** The narrow registry metadata change is
kept exactly as authored. Reason given: D4-U4 genuinely reuses the
existing CANONICAL Audience-Appropriate Communication pattern. Do NOT
change pattern meaning, recognition clues, nuance, memory rule, ID, or
CANONICAL status — the `applicable_domains` extension is confirmed as the
only authorized P11 change.

## Confusing-concept disposition

`docs/learning/CONFUSING-CONCEPTS.md` currently has exactly 4 Domain 4
entries (Event vs. Incident; Containment vs. Eradication vs. Recovery; RTO
vs. RPO vs. SDO vs. MTO; Incident Response vs. Business Continuity vs.
Disaster Recovery). This batch's directive named four candidate
distinctions to inspect: Event-vs-Incident (already covered — D4-U3
reinforces the existing entry narratively without duplicating it),
Severity-vs-Business-Impact, Escalation-vs-Notification, and
Communication-vs-External-Notification. None of the latter three has an
existing entry. **No new entry was added this batch.** Severity and
business impact are treated as the same axis in this unit (severity IS
assessed BY business impact, not a separate confusable pair), so no entry
is warranted there. Escalation-vs-Notification and
Communication-vs-External-Notification are real, source-supported
distinctions (D4-U4's own reasoning depends on them: escalation is
internal/authority-routing, notification/communication to external
parties is a separate, higher-stakes management decision) but were judged
close enough to this unit's own core teaching that adding a formal
glossary entry would risk being either redundant with the lesson itself or
a scope decision belonging to the Architect, not something to add
unilaterally per the binding "only add if materially useful/non-
duplicative; flag if out of scope" instruction. **Flagged for Architect
review**, not silently added or silently skipped.

**Architect decision: DECLINED / NOT NEEDED.** Do not add new entries for
Escalation vs. Notification or Communication vs. External Notification —
the current curriculum already teaches the necessary distinction in
context. `CONFUSING-CONCEPTS.md` is not expanded merely because a
distinction can be described; that library is kept selective. No
documentation follow-up is required for these two items.
`docs/learning/CONFUSING-CONCEPTS.md` was not modified in this batch and
remains at exactly 4 Domain 4 entries.

## CANDIDATE status confirmation

All 2 concepts, 2 families, 2 lessons, and 6 questions are
`content_status: "CANDIDATE"`, `verification_status: "unverified"`. No
entity in this batch is `CANONICAL`.

## Validation

- `tests/content-production/` (full glob): 377/377 pass, including 30 new
  tests in `domain4-u3-u4.test.mjs` and the narrowed `domain4-u1-u2.test.mjs`
  batch-boundary/concept-collision tests (mirroring precedent, comments
  explain the narrowing).
- `family-integrity.test.mjs`'s expected-variant-count map gained 2
  entries (`family.d4.incident-classification-severity`: 3,
  `family.d4.escalation-communications`: 3).
- Legacy `node --test` full suite: 491 tests, 488 pass, 0 fail, 3 `todo`
  (BUG-001/002/003, pre-existing, unchanged, untouched by this batch).
- Vitest frontend: 200/200 pass, 18 files (no frontend test needed
  updating this batch — Domain 4's discoverability in Explore/Practice was
  already proven generic during D4-U1/U2).
- TypeScript (`tsc --noEmit`): clean.
- Production build (`npm run build`): succeeds.
- Playwright Chromium (functional + `@a11y`): 43/43 pass.
- Playwright Firefox (functional + `@a11y`): 43/43 pass.
- Playwright visual regression: 32/32 pass against existing baselines — no
  baseline updates, since no UI/markup/CSS change occurred this batch.
- `npm audit`: 0 vulnerabilities.

## Defects found/fixed during authoring

1. **Length-bias (self-caught, same category as every prior batch)**: the
   correct option was the longest in all 3 variants of
   `family.d4.incident-classification-severity`. Fixed by lengthening one
   distractor's wording (meaning unchanged) in `question.d4.0009`'s option
   d, until only 2/3 variants have the correct answer as longest.
2. **A mechanical splicing mistake, self-caught before any test ran**: an
   initial attempt to patch the length-bias distractor used
   `json.dump()` on the entire `questions.json` array, which reformatted
   every pre-existing question's arrays away from this project's
   established hand-formatted single-line-scalar-array style (a ~4,300-line
   diff instead of a few dozen). Caught via `git diff --stat` before
   running any test; the file was reverted to its committed state via
   `git checkout --` and the fix was reapplied as a small, scoped string
   replacement inside the new question block only, then re-spliced — final
   diff is purely additive (324 insertions, 0 deletions).

No content-quality defect (incorrect reasoning, mis-grounded source claim,
or unfair distractor) was found — both defects above were
mechanical/formatting issues caught and fixed before evidence capture.

## Evidence-first review

One continuous, real-browser walkthrough (D4-U3 Recall → Learn → Apply →
incorrect Feedback → Repair, then D4-U4 Recall → Learn → Apply →
incorrect Feedback → Repair, then Explore, then Practice, then a mobile
Apply screen for D4-U3) was captured as 13 screenshots and composed into
one local contact sheet for Architect review — not committed, not
published: `/Users/demetrius/Downloads/cism-domain4-u3-u4-review.png`

Confirmed live in the browser:
- D4-U3's own Recall screen correctly pulled a D4-U2 (keyless-entry
  app/BIA) recall question from the prerequisite pool, not its own
  content — expected and correct, confirming the cross-domain/cross-unit
  recall chain reaches back through D4-U2.
- D4-U3's Learn screen correctly displays the "No Lifecycle Jumping"
  (P04) pattern callout.
- D4-U4's Learn screen correctly displays the "Audience-Appropriate
  Communication" (P11) pattern callout — live confirmation the
  `applicable_domains` registry extension renders correctly for Domain 4
  content.
- D4-U4's Repair screen, for the business-context-error distractor
  ("industry comparison" wrong answer), correctly surfaced the shared,
  domain-agnostic repair-target micro-question template — no
  Domain-4-specific repair code exists or was needed.
- The mobile Apply screen (390px viewport) renders D4-U3's Harborview
  question legibly with no layout defects.
- AnswerOrder shuffling is visibly active (option-letter assignment
  differs from the JSON's own a/b/c/d authoring order in the captured
  screenshots), confirming the wrong-answer capture logic (matching by
  known correct-answer text rather than a fixed key) was necessary and
  worked correctly.

## Production integration

Domain 4 U3/U4 content integrates through the exact same structures every
prior domain/unit uses. **Zero learning-mode code was modified**:
`explore.ts`, `practice.ts`, `reinforcement.ts`, `QuestionAttemptFlow.tsx`,
`selection.ts`, `answerOrder.ts`, and the shared Repair system are
byte-for-byte unchanged. `app/src/App.tsx`'s dev-only QA review-lesson list
gained two entries (D4-U3, D4-U4 labels) — the only application-code
change in this batch.

## Deferred / not touched

D4-U5 onward (not authored this batch); Domain 5 (does not exist);
learning-mode architecture; `selection.ts`/`answerOrder.ts`; persistence;
confidence adaptation; Adaptive Reinforcement; BUG-001/002/003 (all still
correctly `Open`, untouched); Foundation/Domain 1/Domain 2/Domain 3/D4-U1/
D4-U2 production curriculum (byte-for-byte unchanged aside from the two
narrowly-narrowed batch-boundary/concept-collision tests in
`domain4-u1-u2.test.mjs`, itself not a content change);
`CONFUSING-CONCEPTS.md` (not modified — see "Confusing-concept
disposition" above; the Escalation-vs-Notification and
Communication-vs-External-Notification distinctions were flagged and the
Architect declined them — no documentation follow-up required).

## Final closeout disposition

Architect review is complete and this batch is **APPROVED** for
source-control closeout (commit → push → PR → merge → post-merge
verification). See the companion `DOMAIN 4 — U3/U4 FINAL POST-MERGE
REPORT` (delivered to the Architect/Founder in the same turn as this
record's closeout update) for the exact commit SHA, PR number/URL, CI
results, and post-merge verification. This gate record itself is not
updated again after that closeout — the final post-merge report is the
durable record of the closeout mechanics; this file remains the durable
record of the curriculum/content decision.

# Pattern Library

**Status: [CANONICAL].** The fifteen patterns below (P01–P15), their
IDs, and their one-line statements were specified directly in the Phase 2
architectural discussion, not independently derived by Claude Code. The
supporting detail in each entry — recognition clues, traps, applicable
domains, exceptions, example scenarios, memory rules — is elaboration written
to satisfy the approved [Lesson Design Standard](LESSON-DESIGN-STANDARD.md)
and is marked **[CANDIDATE]** where it goes beyond the literal
approved statement. None of it has been checked against ISACA source
material; that check is explicitly out of scope for this documentation-only
phase (see `docs/learning/README.md`).

## How to use this library

A pattern is a **reusable reasoning shape**, not a rigid rule. Per the
architectural discussion: *"These patterns should NOT be written as rigid
universal laws."* Every entry below includes an "Important exceptions /
nuance" field specifically so a future content author (human or AI) does not
turn a pattern into a keyword trick. A pattern earns its place in a lesson or
a piece of feedback only when it explains *why* an answer is right or wrong —
never as a label pasted on top of a question.

Pattern IDs are stable and unique (verified — see Phase 2 quality checks).
Once a pattern ID ships in learner-facing content or learner evidence
records, it must not be reassigned to a different meaning; retire and
replace instead of renumbering.

---

## P01 — Business Alignment
**Statement:** Business objectives anchor the decision.

- **Recognition clues:** The stem mentions business objectives, strategy, mission, or "what the enterprise is trying to accomplish." Two answers are both technically defensible, but only one serves the stated business purpose.
- **Common distractor/trap:** A technically superior or more secure option that is not what the business actually asked for or needs.
- **Applicable domains:** All four; most load-bearing in Domain 1 (Governance).
- **Important exceptions/nuance:** "Business alignment" is not a license to always pick the cheapest or most convenient option — it means the decision should trace back to a stated business objective or requirement in the stem, not to security's own preference. **[CANDIDATE]**
- **Example scenario:** A security manager must choose between two controls with similar cost; the stem states the business's primary objective is minimizing customer-facing downtime. The correct choice supports that objective, even if a competing option offers marginally stronger technical protection. **[CANDIDATE]**
- **Memory rule:** Security exists to enable the business, not to maximize restriction.

## P02 — Authority Follows Accountability
**Statement:** Authority follows accountability.

- **Recognition clues:** The stem asks "who should approve," "who is accountable," or "who decides," especially about a business-risk or business-value question.
- **Common distractor/trap:** The person who *identified*, *analyzed*, or *recommended* the issue is offered as the one who *decides* it — expertise is mistaken for authority.
- **Applicable domains:** All four; most load-bearing in Domain 1 and Domain 2.
- **Important exceptions/nuance:** This does not mean "senior management always decides." Accountability is scoped — a data owner is accountable for classification decisions, a control owner for control remediation, a risk owner for a specific risk's disposition. Match the accountability to the *specific* decision in the stem, not to a fixed hierarchy. See [Role & Authority Matrix](ROLE-AUTHORITY-MATRIX.md).
- **Example scenario:** A security manager identifies a compliance gap and recommends a remediation approach; the stem asks who approves the business risk of not remediating immediately. The answer is the accountable business/risk authority, not the security manager. **[CANDIDATE]**
- **Memory rule:** Security identifies, analyzes, advises, recommends, facilitates, and monitors; the accountable authority owns the decision. *(Carried into this library as the architecturally-supplied example pattern — explicitly not to be treated as universally correct without source validation, per the Phase 2 instructions that introduced it.)*

## P03 — Role-Verb Matching
**Statement:** Match the verb to the role.

- **Recognition clues:** The stem's action verb (approve / recommend / implement / operate / verify / classify / sponsor) is the load-bearing word, more than the role's job title.
- **Common distractor/trap:** A plausible-sounding role paired with a verb that role does not actually perform (e.g., an auditor "implementing" a fix, or a custodian "approving" acceptance of risk).
- **Applicable domains:** All four.
- **Important exceptions/nuance:** The same person can hold different roles in different questions (a CISO can be a control owner in one scenario and an advisor in another) — match the verb to the *role as described in that stem*, not to a title alone. **[CANDIDATE]**
- **Example scenario:** "Who should *implement* the additional access control?" — the answer is whoever operates the system (custodian/IT operations), not whoever approved the requirement (business/data owner). **[CANDIDATE]**
- **Memory rule:** Read the verb before you read the role.

## P04 — No Lifecycle Jumping
**Statement:** Do not jump ahead in the lifecycle.

- **Recognition clues:** The stem describes an early-stage situation (e.g., risk not yet assessed, incident not yet contained) and an answer choice proposes a later-stage action (treatment, eradication, recovery) as if it were already appropriate.
- **Common distractor/trap:** The "obviously good" action that would eventually be correct, but is premature given what the stem says has and hasn't happened yet.
- **Applicable domains:** Domain 2 (risk lifecycle) and Domain 4 (incident lifecycle) most directly; also Domain 1/3 (strategy-before-program-before-controls) and Domain 3's control lifecycle.
- **Important exceptions/nuance:** A stage can be implicit rather than stated outright — the absence of language describing a stage having occurred should not be over-read as proof it hasn't, when the stem's actual question does not depend on that stage. Use this pattern only when lifecycle position is actually what the question is testing. **[CANDIDATE]**
- **Example scenario:** A risk has been identified but not yet analyzed for likelihood and impact; an answer proposing "select a treatment option" is premature — analysis and evaluation come first. **[CANDIDATE]**
- **Memory rule:** A correct action at the wrong stage is still the wrong answer.

## P05 — No Lifecycle Reversal
**Statement:** Do not go backward; respect what has already happened.

- **Recognition clues:** The stem states that something has already occurred (an event was successful, a control already failed, evidence was already lost) and an answer choice proposes an action that only makes sense *before* that fact.
- **Common distractor/trap:** A prevention-focused answer offered after the stem has already stated the bad event occurred; the "textbook first step" that is no longer available given the stated facts.
- **Applicable domains:** Domain 4 (incident lifecycle) most directly; also Domain 2 (residual risk after treatment already applied) and Domain 3 (control already implemented).
- **Important exceptions/nuance:** This is the mirror of P04, not a duplicate — P04 guards against skipping ahead, P05 guards against retreating to an earlier stage's action once the stem has moved past it. Both failures are framed as "lifecycle stage mismatch," so the diagnosis (see [Repair Model](REPAIR-MODEL.md)) should distinguish direction.
- **Example scenario:** "The ransomware attack was successful" in the stem rules out a prevention-only answer choice — the question is now about containment, eradication, or recovery, not about stopping the attack from happening. This example is drawn directly from the approved Domain 4 requirements above.
- **Memory rule:** If the stem says it already happened, an answer that only prevents it cannot be the best answer.

## P06 — Purpose vs. Activity
**Statement:** Purpose is different from activity.

- **Recognition clues:** The stem asks for the *primary purpose*, *objective*, or *reason* something is done, and answer choices mix a genuine purpose with things that are merely steps, byproducts, or tasks involved in doing it.
- **Common distractor/trap:** A true statement about what an activity *involves* offered as if it were *why* the activity exists.
- **Applicable domains:** All four; most load-bearing in Domain 3 (program/control purpose).
- **Important exceptions/nuance:** An activity can serve more than one legitimate purpose; the correct answer is the purpose that matches the *scope and framing of the stem*, not merely a true benefit. **[CANDIDATE]**
- **Example scenario:** The purpose of patch management is to correct newly identified software weaknesses in a timely manner — not "to test software," "to satisfy an audit," or other true-but-secondary effects. **[CANDIDATE]**
- **Memory rule:** Ask "why does this exist," not "what does this involve."

## P07 — Implementation ≠ Effectiveness
**Statement:** Implementation does not prove effectiveness.

- **Recognition clues:** The stem states a control, policy, or program *exists* or *was implemented*, and asks about its effectiveness, adequacy, or whether a risk is actually addressed.
- **Common distractor/trap:** "The control exists" or "the policy was published" offered as if that alone answers a question about whether risk is actually reduced or governance actually works.
- **Applicable domains:** Domain 3 (control effectiveness) most directly; also Domain 1 (governance effectiveness/measurement).
- **Important exceptions/nuance:** This pattern does not mean existence is irrelevant — it means existence is necessary but not sufficient, and the question is usually testing whether the learner reaches for *measurement/monitoring/validation* rather than stopping at "it was implemented."
- **Example scenario:** The existence of information security policies does not by itself prove information security governance is effective — effectiveness requires measurement, oversight, and evidence of outcomes. **[CANDIDATE]**
- **Memory rule:** "It exists" answers a different question than "it works."

## P08 — Risk-Driven Prioritization
**Statement:** Risk drives prioritization and resources.

- **Recognition clues:** The stem asks how to prioritize among competing needs, allocate limited budget/resources, or decide what to address first when not everything can be addressed at once.
- **Common distractor/trap:** Prioritizing by cost alone, by audit findings alone, or by whatever is technically easiest, instead of by risk (likelihood × impact / business exposure).
- **Applicable domains:** Domain 2 primarily; also Domain 3 (control selection under constrained resources).
- **Important exceptions/nuance:** Risk-driven does not mean "biggest number wins" in isolation — it means likelihood and impact together, evaluated against business objectives and risk appetite, not a single input like cost or vulnerability count alone.
- **Example scenario:** With limited remediation budget, the enterprise should prioritize the risk with the most supportable combination of frequency and impact, not simply the one that is cheapest to fix. **[CANDIDATE]**
- **Memory rule:** Limited resources, many risks → prioritize by risk, not by convenience.

## P09 — Security Embedded in Business Process
**Statement:** Embed security into business processes.

- **Recognition clues:** The stem describes security being treated as a separate, bolted-on activity, and the best answer integrates it into how the business already operates (development lifecycle, procurement, HR onboarding/offboarding, change management).
- **Common distractor/trap:** A standalone security review or gate that duplicates existing process rather than integrating with it.
- **Applicable domains:** Domain 2 (risk embedded in business decisions) and Domain 3 (security embedded in operational process) most directly.
- **Important exceptions/nuance:** Embedding does not mean removing independent checks (e.g., audit should still be independent) — it means the *operational* security activity should ride within existing business workflow rather than exist as a disconnected parallel process. **[CANDIDATE]**
- **Example scenario:** Security requirements built into the procurement/contracting process for third parties, rather than assessed only after a vendor is already under contract. **[CANDIDATE]**
- **Memory rule:** Security that lives outside the business process gets bypassed by it.

## P10 — Method Fits Objective
**Statement:** Match the assessment/method to the objective.

- **Recognition clues:** The stem asks which method, framework, or assessment approach is most appropriate for a stated goal, and the distractors are legitimate methods that solve a *different* problem than the one stated.
- **Common distractor/trap:** A generally well-known or "textbook best-practice" method that is nonetheless a mismatch for the specific objective in the stem (e.g., a qualitative technique offered for a scenario that explicitly needs quantitative comparison).
- **Applicable domains:** Domain 2 (risk-assessment method selection) and Domain 3 (control/assurance method selection) most directly.
- **Important exceptions/nuance:** "More rigorous" is not automatically "more correct" — the objective in the stem (speed, precision, comparability, resource constraints) determines the right method, not a general hierarchy of methods.
- **Example scenario:** When the objective is a defensible dollar-figure comparison for a cost-benefit decision, a quantitative method (see [quantitative risk in the Domain 2 blueprint](DOMAIN-2-BLUEPRINT.md)) fits better than a purely qualitative rating. **[CANDIDATE]**
- **Memory rule:** Ask what the method needs to accomplish before judging which method is "best."

## P11 — Audience-Appropriate Communication
**Statement:** Match information to the audience.

- **Recognition clues:** The stem involves reporting, metrics, or communicating results, and asks what is most useful/relevant/appropriate to give to a specific recipient (board, business unit, technical team).
- **Common distractor/trap:** The most detailed or most technically complete information, offered as the best answer regardless of who is receiving it and what decision they need to make with it.
- **Applicable domains:** Domain 1 (governance reporting) and Domain 3 (program/metrics reporting) most directly.
- **Important exceptions/nuance:** "Appropriate to the audience" is not the same as "simplified" — a technical audience may need technical detail; the test is whether the information supports the *recipient's actual decision*, not whether it is short.
- **Example scenario:** A metric has little management value if the recipient cannot understand it or act on it, even if it is technically accurate and precise. **[CANDIDATE]**
- **Memory rule:** A metric/report is only as good as the decision it enables for its actual reader.

## P12 — Risk vs. Vulnerability vs. Threat
**Statement:** Risk is not the same as vulnerability.

- **Recognition clues:** The stem uses "risk," "vulnerability," "threat," or "exposure" in ways that could be confused, and the correct answer depends on knowing which one is actually being described or asked about.
- **Common distractor/trap:** Treating vulnerability count or a single technical weakness as if it were the same thing as business risk, which also requires a threat and a business impact.
- **Applicable domains:** Domain 2 primarily. See [Confusing Concepts](CONFUSING-CONCEPTS.md) for the full term-pair breakdown.
- **Important exceptions/nuance:** A high vulnerability count does not necessarily mean high risk if likelihood of exploitation or business impact is low, and vice versa.
- **Example scenario:** A system with many known vulnerabilities but no exposure to any credible threat and negligible business impact represents lower risk than a system with few vulnerabilities but severe business consequences if compromised. **[CANDIDATE]**
- **Memory rule:** Risk = threat × vulnerability × impact, not any one of them alone.

## P13 — Acceptable Risk, Not Zero Risk
**Statement:** The goal is acceptable risk, not zero risk.

- **Recognition clues:** An answer choice implies eliminating all risk, all vulnerabilities, or all exposure — this is almost always a distractor.
- **Common distractor/trap:** "Eliminate," "remove all," "guarantee," or "ensure zero" language in an answer choice.
- **Applicable domains:** Domain 2 primarily.
- **Important exceptions/nuance:** This does not mean risk reduction efforts are unimportant — it means the *objective* of a risk management program is residual risk within an accepted/tolerable range, decided by the appropriate risk authority, not the absence of risk.
- **Example scenario:** A reasonable objective for an enterprise risk program is to maintain residual risk at an acceptable level, not to prevent every threat or eliminate all inherent risk. **[CANDIDATE]**
- **Memory rule:** CISM's risk goal is acceptable residual risk, not zero risk.

## P14 — Formal Repeatable Process
**Statement:** Formal, repeatable, accountable processes matter.

- **Recognition clues:** The stem contrasts an ad hoc, informal, or one-off approach against a defined, documented, repeatable process, and asks which is preferable for a governance, risk, or program outcome.
- **Common distractor/trap:** A one-time or ad hoc fix that solves the immediate instance but does not establish an accountable, repeatable process for the next occurrence.
- **Applicable domains:** Domain 1 (governance formality) and Domain 3 (program formality) most directly; also Domain 2 (risk process consistency).
- **Important exceptions/nuance:** Formality is not bureaucracy for its own sake — the test is whether the process produces consistent, accountable, auditable outcomes, not whether it has the most documentation.
- **Example scenario:** An enterprise that responds to security incidents ad hoc each time, versus one with a defined, tested incident management process — the defined process is preferred because it is repeatable and improvable. **[CANDIDATE]**
- **Memory rule:** One-time fixes solve today's problem; formal process solves the next one too.

## P15 — Closing the Loop
**Statement:** Improvement closes the loop.

- **Recognition clues:** The stem describes the end of a cycle (post-incident, after an audit finding, after a risk treatment, after a program review) and asks what should happen next.
- **Common distractor/trap:** Stopping at "recovered" or "remediated" without the follow-through step of measuring, learning, and feeding results back into the program.
- **Applicable domains:** Domain 3 (continuous improvement) and Domain 4 (post-incident review) most directly; also Domain 2 (monitor/reassess) and Domain 1 (governance measurement).
- **Important exceptions/nuance:** "Closing the loop" is a distinct stage from the action that precedes it (recovery is not the same as post-incident review; treatment is not the same as monitoring) — do not conflate the two when a question is specifically testing sequence.
- **Example scenario:** After recovery from an incident, the process is not complete until root cause and lessons learned are captured and fed back into prevention and preparedness. This mirrors the approved Domain 4 lifecycle's closing stage.
- **Memory rule:** Recover first, then learn and improve — and don't skip the second half.

---

**Cross-reference:** patterns are applied, not tested in isolation, throughout [Foundation](FOUNDATION-BLUEPRINT.md) and each domain blueprint. The [Repair Model](REPAIR-MODEL.md) uses pattern misapplication as one of its diagnostic failure types.

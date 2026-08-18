# Qualifier Decoder

**Status: [CANONICAL]** for the five core qualifiers and their
one-line reasoning descriptions, specified directly in the Phase 2
architectural discussion. Everything else in this document — traps,
examples, and lifecycle relationships — is elaboration and is marked
**[CANDIDATE]**. The additional variant-wording section is marked
**[PROTOTYPE REFERENCE]** and is explicitly excluded from canonical status —
see [Content status terminology](README.md#content-status-terminology).

> **The canonical Foundation qualifier set — approved during Phase 2
> review — is exactly these five:** FIRST, NEXT, BEST, MOST / MOST
> IMPORTANT, PRIMARY. No other qualifier wording carries canonical status
> at this time.

## Purpose

A CISM stem's qualifier word is usually the single highest-leverage signal
for choosing among answer choices — more than any other word in the
question. [Foundation](FOUNDATION-BLUEPRINT.md) teaches the learner to
identify the qualifier as reasoning step 1, before role, lifecycle, or
elimination. This document is the canonical specification of what each
qualifier means and how it changes reasoning; Mixed Practice, Daily Study,
and Practice Exam content must all resolve to these same five canonical
values.

## The five canonical qualifiers

### FIRST
- **How it changes reasoning:** Think prerequisite — the earliest correct action in the relevant lifecycle, given what the stem says has and hasn't happened yet. Several answer choices may all eventually be necessary; only one can happen first.
- **Common trap:** A generically "good practice" action that is correct in general but not the one thing that must happen *before* the others can be done intelligently.
- **Relationship to lifecycle positioning:** FIRST questions are answered by locating the current lifecycle stage and identifying what precedes the other offered actions. See [Pattern P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping).
- **Example:** New regulation applies to sensitive data handling — the FIRST action is determining which processes and activities are affected, not selecting controls, requesting an exemption, or estimating cost. **[CANDIDATE]**

### NEXT
- **How it changes reasoning:** Think immediate next logical action based on the current state described in the stem — not the ultimate goal, and not a prerequisite that should already be behind you.
- **Common trap:** Skipping ahead to a later, more conclusive-sounding step (see [Pattern P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping)), or falling back to a step that has already been completed (see [Pattern P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal)).
- **Relationship to lifecycle positioning:** NEXT questions require precisely locating "where we are right now" in the stem before evaluating any answer choice.
- **Example:** A risk has been analyzed and evaluated against criteria; the NEXT action is selecting a treatment option — not re-analyzing, and not yet determining residual risk (that follows treatment). **[CANDIDATE]**

### BEST
- **How it changes reasoning:** A completeness/fit test. Several answer choices may be reasonable individually; the correct one most completely addresses the business problem exactly as stated, leaving the least unaddressed.
- **Common trap:** A partial or narrower answer that solves part of the stated problem but not all of it, or a technically sound answer that ignores part of the business context given in the stem.
- **Relationship to lifecycle positioning:** BEST does not usually test lifecycle position directly — it tests whether the answer accounts for everything the stem specified.
- **Example:** Choosing the best distinction between policy and standard means the option that captures the full, correct relationship — "policy sets mandatory direction; a standard sets mandatory allowable boundaries" — rather than a partially-true simplification. **[CANDIDATE]**

### MOST / MOST IMPORTANT
- **How it changes reasoning:** A ranking/priority test. Several answer choices may be true; the correct one carries the greatest weight, priority, or business consequence among them.
- **Common trap:** Choosing an option that is true and relevant but not the *governing* priority — a true secondary factor mistaken for the primary one.
- **Relationship to lifecycle positioning:** Not primarily a lifecycle signal — a magnitude/priority signal. Contrast directly with BEST: MOST ranks, BEST fits — carried forward from the current prototype's decoder model as a useful distinction. **[PROTOTYPE REFERENCE]**
- **Example:** Asked what is MOST important for successful implementation of an enterprise security program, "senior management support" outranks budget, vulnerability assessments, or administrator skill, because the other factors are dependent on that support existing first. **[CANDIDATE]**

### PRIMARY
- **How it changes reasoning:** Identify the fundamental purpose, driver, or responsibility — not a supporting activity, secondary benefit, or true-but-incidental effect. Closely related to [Pattern P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity).
- **Common trap:** A true supporting activity or secondary benefit offered as if it were the fundamental reason something exists or something is done.
- **Relationship to lifecycle positioning:** Not a lifecycle signal — a purpose signal, distinguishing the *reason for* something from *what it involves*.
- **Example:** The primary purpose of risk analysis is to assess exposures and plan remediation — not to justify every expenditure or report residual risk in isolation, which are narrower or secondary framings. **[CANDIDATE]**

## Additional variant wording (carried from the current prototype)

**[PROTOTYPE REFERENCE] — NOT canonical.** The current application's
decoder also models the qualifiers below as real, distinct exam wording.
They are recorded here for continuity and possible future validation, but —
unlike the five qualifiers above — they were not part of the explicit
Phase 2 architectural requirement, have not been confirmed against the
supplied CISM source material, and **must not be treated as canonical or
used to drive learner assessment or curriculum behavior** unless and until
they are explicitly promoted, per the terminology defined in
[`README.md`](README.md#content-status-terminology).

| Variant | Suggested mapping |
|---|---|
| PRIMARILY | Adverb form of PRIMARY; same reasoning. |
| GREATEST | Almost always attached to concern, risk, or benefit; compare magnitude of business exposure, similar to MOST but often risk-flavored. |
| MAIN | Similar to PRIMARY — asks for the central point rather than a true side effect. |
| NONE / no explicit qualifier | When no qualifier word is present, reasoning falls back to role, lifecycle, and concept context rather than a ranking or sequencing test. |

## How this decoder is used elsewhere

- [Foundation](FOUNDATION-BLUEPRINT.md) teaches qualifier recognition as reasoning step 1 (ASK).
- Every domain blueprint's application questions are tagged against these five canonical qualifiers.
- [Repair Model](REPAIR-MODEL.md) defines "qualifier error" as a distinct diagnostic failure type against this same canonical set.

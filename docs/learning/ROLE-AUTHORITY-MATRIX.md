# Role & Authority Matrix

**Status: [CANONICAL].** The twelve canonical roles, and the
role-verb examples for each, were specified directly in the Phase 2
architectural discussion. This document formalizes them into a single
reference matrix that every other learning document must use **exactly these
role names** when referring to a role, so that role identity stays
consistent across Foundation, all four domain blueprints, the Pattern
Library, and the Repair Model.

## The core principle: ROLE + VERB + CONTEXT

A CISM question is very rarely answered correctly by matching a role name
alone. It is answered by matching **which verb that role is being asked to
perform, in the context described**. The same person can be the correct
answer in one scenario and a distractor in another, depending on which verb
the stem uses and what decision is actually being made.

> **Explicit product requirement — do not violate this in future content:**
> Do NOT encode "CISO never owns risk." Risk ownership is contextual and
> depends on relevance and authority in the specific scenario. A role matrix
> that reduces to fixed absolutes ("X always decides, Y never decides") is a
> known trap this application must not build into its own content — see
> [Pattern P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability) and
> [Pattern P03](PATTERN-LIBRARY.md#p03--role-verb-matching).

## Canonical role list

These twelve role names are the only role identifiers future content should
use. Do not introduce synonyms (e.g., "CISO" alone, "management" alone,
"IT" alone) as if they were distinct roles — map any such wording in source
material to one of these twelve.

| # | Role |
|---|---|
| 1 | Board / Senior Management |
| 2 | Security Steering Committee |
| 3 | Information Security Manager / CISO |
| 4 | Business / Process Owner |
| 5 | Risk Owner |
| 6 | Data Owner |
| 7 | Control Owner |
| 8 | Custodian / IT Operations |
| 9 | Internal Audit |
| 10 | Legal / Compliance |
| 11 | Incident Response Team |
| 12 | Users / Employees |

## Matrix: characteristic verbs and context per role

**[CANDIDATE]** beyond the verb sets given directly in the
architectural discussion (marked below); the "typical context" and "not
typically" columns are elaboration written to support the ROLE + VERB +
CONTEXT principle and require checking against the supplied CISM source
material before being treated as exam-verified.

### Board / Senior Management
- **Characteristic verbs (approved):** direct, approve, fund, oversee.
- **Typical context:** Enterprise-level direction, final approval of strategy or major risk acceptance, budget authority, holding the organization accountable.
- **Not typically:** Day-to-day recommendation, technical assessment, control operation.
- **Relates to patterns:** [P01](PATTERN-LIBRARY.md#p01--business-alignment), [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability).

### Security Steering Committee
- **Characteristic verbs (approved):** advocate, prioritize, review, governance oversight.
- **Typical context:** Cross-functional governance body that reviews and prioritizes security initiatives and advocates for the program at a senior level; a bridge between senior management and the security function.
- **Not typically:** Final business-risk acceptance authority (that sits with the appropriate business/risk owner or senior management), day-to-day operations.
- **Relates to patterns:** [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability), [P14](PATTERN-LIBRARY.md#p14--formal-repeatable-process).

### Information Security Manager / CISO
- **Characteristic verbs (approved):** develop, assess, recommend, coordinate, monitor, manage security responsibilities.
- **Typical context:** Owns the security *function* — strategy development, risk/control assessment, recommendation to the accountable authority, coordination across teams, ongoing monitoring, and managing security-specific responsibilities and resources.
- **Not typically, by default:** Final approval of business risk acceptance that belongs to another accountable party — **but this is contextual, not absolute** (see the explicit nuance above). A CISO can be a control owner or even a risk owner for risk that falls within their own scope of authority.
- **Relates to patterns:** [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability), [P03](PATTERN-LIBRARY.md#p03--role-verb-matching), [P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity).

### Business / Process Owner
- **Characteristic verbs (approved):** own business process and consequences.
- **Typical context:** Accountable for a business process and what happens to it — including the consequences of a security event or a control decision affecting that process.
- **Not typically:** Independent verification (that is Internal Audit's role), technical implementation.
- **Relates to patterns:** [P01](PATTERN-LIBRARY.md#p01--business-alignment), [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability).

### Risk Owner
- **Characteristic verbs (approved):** decision authority over relevant risk.
- **Typical context:** Holds authority to accept, treat, transfer, or decide the disposition of a *specific* risk. Frequently but not always the same person as the business/process owner or data owner for that risk — determined by who is accountable for the outcome, not by title.
- **Not typically:** A generic, catch-all "whoever is senior" answer — the risk owner is scoped to the specific risk in the stem.
- **Relates to patterns:** [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability), [P13](PATTERN-LIBRARY.md#p13--acceptable-risk-not-zero-risk).

### Data Owner
- **Characteristic verbs (approved):** classify data / determine protection requirements.
- **Typical context:** Determines classification of information and the protection requirements that follow from that classification, based on business value and impact.
- **Not typically:** Implementing the protection (that is Custodian/IT Operations).
- **Relates to patterns:** [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability), [P03](PATTERN-LIBRARY.md#p03--role-verb-matching).

### Control Owner
- **Characteristic verbs (approved):** operate / maintain / remediate control deficiencies.
- **Typical context:** Accountable for a specific control's ongoing operation, maintenance, and remediation when a deficiency is found — distinct from who *decided* the control was needed.
- **Not typically:** Deciding whether the underlying risk is acceptable (that is the risk owner).
- **Relates to patterns:** [P07](PATTERN-LIBRARY.md#p07--implementation--effectiveness), [P14](PATTERN-LIBRARY.md#p14--formal-repeatable-process).

### Custodian / IT Operations
- **Characteristic verbs (approved):** configure, implement, operate.
- **Typical context:** Carries out the technical implementation and day-to-day operation of controls and systems, based on requirements set by an owner.
- **Not typically:** Approving the requirement itself, classifying data, accepting business risk.
- **Relates to patterns:** [P03](PATTERN-LIBRARY.md#p03--role-verb-matching), [P06](PATTERN-LIBRARY.md#p06--purpose-vs-activity).

### Internal Audit
- **Characteristic verbs (approved):** independently assess / verify / report.
- **Typical context:** Provides independent assurance on whether controls and processes are working as intended, and reports findings — independence is the defining characteristic.
- **Not typically:** Owning or operating the thing being audited (that would compromise independence), remediating findings directly.
- **Relates to patterns:** [P07](PATTERN-LIBRARY.md#p07--implementation--effectiveness), [P11](PATTERN-LIBRARY.md#p11--audience-appropriate-communication).

### Legal / Compliance
- **Characteristic verbs (approved):** interpret / advise / identify obligations.
- **Typical context:** Interprets applicable law, regulation, and contractual obligation, and advises the organization on what is required — an advisory/interpretive role relative to legal exposure, similar in shape to how the security manager advises on security risk.
- **Not typically:** Making the underlying business-risk acceptance decision (advises on the obligation, does not necessarily own the business response).
- **Relates to patterns:** [P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability).

### Incident Response Team
- **Characteristic verbs (approved):** identify, contain, coordinate, investigate.
- **Typical context:** Executes the active incident response process — identification/confirmation, containment, coordination across stakeholders, and investigation — during an active event. See the [incident lifecycle](LIFECYCLE-MODEL.md#domain-4--incident-lifecycle).
- **Not typically:** Strategic/governance decisions outside the active incident, business risk acceptance for the underlying exposure.
- **Relates to patterns:** [P04](PATTERN-LIBRARY.md#p04--no-lifecycle-jumping), [P05](PATTERN-LIBRARY.md#p05--no-lifecycle-reversal).

### Users / Employees
- **Characteristic verbs (approved):** follow, report, participate.
- **Typical context:** Follow established policy and procedure, report suspected issues/incidents, and participate in awareness/training activities.
- **Not typically:** Any decision-authority verb (approve, own, accept) — users are not typically an accountable decision authority in CISM scenarios.
- **Relates to patterns:** [P03](PATTERN-LIBRARY.md#p03--role-verb-matching).

## How this matrix is used elsewhere

- [Pattern P02](PATTERN-LIBRARY.md#p02--authority-follows-accountability) and [P03](PATTERN-LIBRARY.md#p03--role-verb-matching) are the reasoning patterns this matrix exists to support.
- [Foundation](FOUNDATION-BLUEPRINT.md) teaches the ROLE and VERB steps of its reasoning process directly against this matrix.
- Each domain blueprint references specific rows of this matrix where a domain has a characteristic role emphasis (e.g., Domain 1 leans on Board/Senior Management and the Steering Committee; Domain 4 leans on the Incident Response Team).
- The [Repair Model](REPAIR-MODEL.md) uses "role error" and "authority error" as distinct diagnostic failure types, both defined against this matrix.

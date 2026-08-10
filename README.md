# CISM Study Companion

A calm, browser-based study companion focused on one goal: helping you pass the ISACA CISM exam efficiently.

## Build 5

This build keeps the approved visual shell and adds the first real study engine:

- Study / Explore / Practice / Progress navigation
- Light mode by default
- Dark mode toggle
- Theme preference saved in the browser
- Calm, responsive UI
- "Today's Study" home experience
- Foundation study-flow prototype
- Local browser persistence
- JSON backup export/import
- Mobile/tablet/desktop layout

## Practice exam formats

Two formats, both using the corrected ISACA domain weighting:

- **Quick** — 40 questions, 64 minutes
- **Full-length** — 150 questions, 4 hours, matching the real exam's pacing

The countdown is optional on either. Full-length appears only when the question
pool can fill it; see `docs/LOCAL-QUESTION-SET.md` for loading a larger set of
your own material locally.

## Run it

No server is required.

Open `index.html` in your browser.

## Current scope

Build 1 intentionally does **not** include the complete CISM curriculum or full question bank yet. The purpose of this build is to validate the UI, flow, and browser-only foundation before loading the full study engine and content.

## Planned build sequence

1. Application shell & visual system
2. Study engine
3. Full concept / pattern / comparison content
4. Retention & mastery engine
5. Domains 2–4 content population
6. Practice & exam mode
7. Final polish

## Data

Your local settings and early study progress are stored in browser storage. Use **Settings → Export backup** to save a portable JSON backup.


## Build 2 additions

- Question Decoder
- confidence tracking
- guided and independent questions
- immediate reasoning feedback
- repair flow for missed questions
- transfer scenarios
- resumable session position
- attempt history included in backups

The Build 2 lesson is deliberately small. Build 3 will populate the full concept, comparison, pattern, and lifecycle content.


## Build 3 additions

- Full four-domain content catalogue
- Domain concept maps
- Domain-organized comparison library
- Universal and domain-specific question patterns
- Interactive lifecycle maps
- Functional Explore content workspace
- Source-analysis manifest

The normal Study flow remains self-contained. Explore is optional reference and deeper review.


## Build 4 additions

- Active Practice for all four domains
- Distinguish challenges
- Lifecycle sequencing challenges
- Scenario application challenges
- CISM pattern-recognition challenges
- Immediate reasoning feedback
- Memory rules
- Active-retention/mastery evidence saved locally
- Progress view for active retrieval evidence

Build 4 intentionally measures what you can retrieve and apply, not how often you reread content.


## Build 5 additions

- Larger active-practice pools
- Fresh adaptive question mixes each session
- Domain 1 policy hierarchy and baseline practice
- Weakness-weighted question selection
- Recently seen question de-prioritization
- Needs Refresh mastery state
- Automatic repair-focus roll-forward
- Miss clustering by concept at session completion

The goal is to prove understanding with new wording, not reward memorization of a fixed practice set.


## Build 6 additions

Expanded adaptive-practice depth across all four domains using the supplied question bank. No new interaction modes; this build focuses on exam-relevant coverage, variation, and repair.


## Build 7 additions

- Memory Rules embedded directly in Study
- Memory Rules repeated in answer feedback
- Adaptive Memory Rules panel on the Study home screen
- Learning / Needs Refresh concepts from Active Practice automatically surface their compact anchors back in Study

Memory Rules reinforce explanation and application rather than becoming isolated exam tricks.


## Build 8 additions

- Mixed CISM practice across all four domains
- Domain hidden until after the answer
- CISM mindset recognition before each mixed question
- Qualifier / role / lifecycle / decision-context tracking
- Question pattern + Memory Rule feedback
- Mixed misses feed the same adaptive repair engine
- Progress metrics for CISM judgment

Mixed Practice remains a learning mode. Full Practice Exam mode will withhold feedback until the end.


## Build 8.1 additions

- Brief repair explanations for missed qualifier, role, lifecycle, and decision-context signals
- Shows your selected mindset → correct mindset
- Explains why the correct perspective fits
- Adds a tiny Memory Rule for each missed mindset dimension
- Correct dimensions stay quiet to preserve the calm UI

This is a refinement of Mixed Practice, not a new learning mode.

## Build 9 additions

- Practice Exam mode with coaching fully removed until submission
- Domain-weighted readiness analysis
- Per-domain exam evidence
- Mark-for-review and unanswered-question check
- Post-exam missed-question explanations and Memory Rules
- Exam misses automatically feed the existing repair engine
- Readiness history and recent-session average in Progress

Build 9 measures transfer. It does not create a separate curriculum and does not treat one practice score as a guaranteed ISACA result.


## Build 9.1 additions

- Practice Exam Review Center
- One-click jump to every question marked for review
- One-click jump to unanswered questions
- Answer-status indicators in the Review Center
- No more clicking backward through the exam to find flagged questions


## Build 9.2 additions

- Stable Review Center navigation state machine
- Review all marked questions sequentially
- Review all unanswered questions sequentially
- Next/Previous move within the review queue instead of the full exam
- Skip a review question without answering it
- Return to Review Center before submission
- Unmarking or answering removes questions cleanly from the appropriate review queue
- Reset button handlers and disabled states to eliminate stale-navigation glitches


## Build 9.3 additions

- Individual marked-question buttons now enter the marked-review queue
- Next/Previous after an individual jump stay inside marked questions
- Individual unanswered-question buttons behave the same way
- Added an always-visible Return to Review Center action while reviewing
- Removed the numeric-question fall-through behavior from individual review jumps


## Build 10 additions

- 36 scenario/pattern question families across all four domains
- 72 new scenario variants for recurring CISM mental models
- Family-diversity-first Practice Exam selection
- Recently used questions/families are de-prioritized
- Answer choices are shuffled every exam attempt
- Exam history stores question and family IDs for future variance
- Progress shows question-bank depth and scenario-family coverage

Build 10 is designed to make memorizing question wording insufficient.


## Build 11 additions

- One-button Today’s Study experience
- Adaptive daily focus from actual performance evidence
- Recall → Focused Review → Adaptive Practice → Mixed CISM → Close
- Memory Rules used as retrieval anchors, not passive flashcards
- Active Practice and Mixed Practice return results into the daily plan
- Daily completion saved locally
- No streaks, overdue backlog, or forced exam cadence

Build 11 connects the existing learning engines into the normal 30–35 minute daily workflow.


## Build 12 additions

- By Domain Practice is now clickable and functional
- Weak Areas Practice is now clickable and functional
- Retention states and evidence-confidence readiness in Progress
- Mixed-Practice reasoning-trap detection
- Recommended next-domain focus

Readiness is an internal study signal, not an ISACA scaled-score prediction.


## Build 13 — v1.0 Candidate

- Final reliability and polish pass
- Validated backup imports with an automatic pre-import recovery copy
- Bounded browser histories to prevent uncontrolled localStorage growth
- Graceful storage/runtime warnings without intentionally clearing progress
- Escape-key overlay closing
- Keyboard focus visibility and reduced-motion support
- Core feature development is now locked

Future changes should come from real study use: bugs or genuine CISM coverage gaps, not feature expansion for its own sake.

## Guided Daily Study
Daily Study is the primary path: recall, a few exam-useful definitions, lifecycle application, question-decoder training, exam-style application, evidence review, and a calm recommendation for what to do next. Separate practice engines support the guided path rather than requiring the learner to guess what to study.

## Build 15 additions

- Foundation → Domain 1 → Domain 2 → Domain 3 → Domain 4 progression
- One curriculum state now controls Journey and Daily Study
- Untaught future-domain questions no longer define weakness during first-pass learning
- Full adaptive domain selection starts after all domains are completed
- Recall continues across introduced material
- CISM Big Picture is separated from learner progress
- Domain 2 adds AV, EF, SLE, ARO, ALE calculation and management application
- Existing CISM-style wording variance is preserved

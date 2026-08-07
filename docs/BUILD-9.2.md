# Build 9.2 — Stable Review Queue Navigation

Build 9.2 fixes the Practice Exam review workflow and replaces ad-hoc button behavior with an explicit navigation state machine.

Implemented:
- Review Center remains available before submission
- "Review marked questions in order" queue
- "Review unanswered questions in order" queue
- Next moves directly to the next item in the active review queue
- Previous moves to the previous review item
- At the beginning/end of a queue, navigation returns to Review Center
- Learner can skip a marked question without answering/changing it
- Learner can return to Review Center at any time during review
- Unmarking a question while reviewing removes it cleanly from the marked queue
- Answering an unanswered question removes it cleanly from the unanswered queue
- Footer handlers are explicitly reset on every render to prevent stale click-handler glitches
- Button disabled states are reset per mode
- Direct-jump question buttons still work

Purpose:
Make flagged-question review predictable and calm, with no Previous/Next/Unmark state collisions before exam submission.

# Build 13.1 — Confidence Selector Fix

This patch fixes the Study Mode confidence selector.

- Sure / Not sure / Guessing are explicitly interactive before answer submission.
- Confidence click handling is hardened across study-card re-renders.
- Pointer/touch behavior is explicit.
- The selected confidence now has a clear visual check mark and selected state.
- No Practice Exam review-navigation logic was changed.
- No learner progress schema was changed.

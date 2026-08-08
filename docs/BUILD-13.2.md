# Build 13.2 — Question Reference + Confidence Control Fix

## Mixed Practice answer review
After submitting a Mixed CISM answer, the feedback screen now keeps the original question visible and shows:
- the question
- your answer
- the best answer
- the rationale
- CISM decoder
- missed-mindset repair
- question pattern
- Memory Rule

This allows the learner to reread the stem while understanding why the answer was correct or incorrect.

Other practice modes already retain or repeat the question when feedback is shown:
- Study keeps the prompt and answer choices on the same card.
- Active Practice keeps the challenge prompt visible while rendering the result.
- Practice Exam post-exam missed-question review repeats the question stem.

## Confidence selector
The previous per-render click binding was replaced with a single stable delegated listener attached to Study's persistent content container.

Additional changes:
- Sure / Not sure / Guessing use radio-style accessibility semantics.
- Confidence is required before Check Answer on steps that request confidence.
- Selected confidence has a high-contrast check-mark state.
- Pointer/touch behavior is explicit.
- Confidence state survives answer selection and study-card re-rendering.

No Practice Exam review-navigation behavior was changed.

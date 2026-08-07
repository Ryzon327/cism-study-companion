# Build 9.3 — Individual Review Jump Queue Fix

Build 9.3 fixes a specific Practice Exam Review Center behavior.

Before:
- Clicking "Review marked questions in order" used the marked-question queue correctly.
- Clicking an individual marked-question button opened that question in normal exam mode.
- Pressing Next then moved to the next numeric exam question rather than the next marked question.

Now:
- Clicking any individual marked-question button enters the marked-review queue at that selected question.
- Next moves to the next marked question.
- Previous moves to the previous marked question.
- The learner may skip/change/answer without leaving the review queue.
- Clicking any individual unanswered-question button behaves the same way within the unanswered queue.
- A visible "Return to Review Center" control is available while reviewing.
- Unmarking a question still removes it cleanly from the current marked queue.

This is a navigation fix, not a new exam feature.

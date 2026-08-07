# Build 8 — Mixed Practice + CISM Mindset Recognition

Build 8 moves practice from domain-labeled study to mixed-domain CISM judgment.

Implemented:
- Mixed CISM practice across all four supplied domains
- domain label hidden until after answering
- Step 1: identify the qualifier, role/authority, lifecycle stage, and decision context
- Step 2: answer the CISM question
- Step 3: reveal rationale, question pattern, Memory Rule, and actual domain
- adaptive mixed-question selection
- unseen questions prioritized
- recently seen questions de-prioritized
- weak / Needs Refresh concepts receive more weight
- mixed misses feed the existing Active Learning mastery/repair engine
- separate CISM Mindset metrics:
  - qualifier recognition
  - role / authority recognition
  - lifecycle placement
  - decision-context recognition
- mixed-session results shown in Progress
- mixed practice data included in JSON backup

Design principle:
The real exam does not announce the domain. The learner should learn to identify the management problem before choosing the answer.

This is still learning mode. Immediate feedback remains enabled. A future Practice Exam mode will intentionally withhold feedback until submission.

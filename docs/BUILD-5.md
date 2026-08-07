# Build 5 — Adaptive Practice & Repair

Build 5 expands Active Practice from a fixed four-question set into a randomized, weakness-aware practice engine.

Implemented:
- larger question/challenge pools for all four domains
- multiple variants for important concepts
- Domain 1 policy hierarchy, standards, baselines, policy stability, governance sequence, and business-case questions
- adaptive session selection
- unseen items receive strong priority
- recently seen questions are de-prioritized
- missed concepts receive extra selection weight
- weak concepts are surfaced as Current Repair Focus
- mastery states now include Needs Refresh
- session completion clusters misses by concept
- repair concepts automatically roll into future practice
- sequence challenges remain in the mix to reinforce process models
- active practice stays time-bounded instead of creating an unlimited review backlog

Design principle:
Do not make the learner manually revisit reference material after every miss. Use performance evidence to select future retrieval, relearning, and repair.

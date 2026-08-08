# Build 13 — Final Polish, Reliability & v1.0 Hardening

Build 13 intentionally adds no new study mode.

## Reliability
- Storage writes fail gracefully instead of silently.
- A calm warning appears if the browser cannot save the latest change.
- Practice/attempt histories are bounded to prevent unbounded localStorage growth.
- Backup imports are validated before current data is replaced.
- A complete pre-import recovery copy is automatically retained before every valid import.
- Imported histories are normalized and bounded.
- Runtime JavaScript failures show a non-destructive notice rather than implying progress was erased.

## Navigation hardening
- Escape closes the currently open study/practice overlay through its normal close path.
- Existing Practice Exam review navigation remains unchanged.

## Accessibility / visual polish
- Clear keyboard focus states.
- Reduced-motion preference respected.
- Runtime notices match the calm visual language.

## v1.0 candidate
The core application now includes:
- Study + Memory Rules
- Active Practice + adaptive repair
- Mixed CISM mindset training
- Practice Exam + review workflow
- scenario/pattern variance
- Daily Study orchestration
- By Domain / Weak Areas practice
- retention/readiness intelligence
- browser persistence + export/import

Build 13 is the planned endpoint for core feature development. Future changes should come from real bugs, genuine content gaps, or actual study evidence.

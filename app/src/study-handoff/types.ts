/**
 * LI-4 — Targeted Study Handoffs.
 *
 * A `StudyHandoff` is navigation/session state, never learner evidence — it
 * is not persisted to Learning History (LI-1) and carries no display label
 * as computational identity (see `resolveStudyHandoffs.ts`). `PracticeScope`
 * is the stable descriptor threaded through App-level navigation state into
 * `PracticeScreen`, which resolves it against CURRENT production content at
 * the moment the learner actually enters Practice — never a snapshot of
 * historical evidence (see docs/architecture/LI-4-IMPLEMENTATION-RECORD.md).
 */
import type { Axis } from "../learning-intelligence";

/**
 * `"domain"` reuses Practice's existing domain-scoped mechanism
 * (`listPracticeScopes`/`buildPracticeSession`) verbatim — no second
 * domain-filter implementation. `"target"` is every other axis, resolved
 * through the new generic target-eligibility filter in `content/practice.ts`.
 */
export type PracticeScope = { kind: "domain"; domainId: string } | { kind: "target"; axis: Axis; targetId: string };

/** The payload threaded through App.tsx's navigation state into PracticeScreen. */
export interface PracticeHandoffRequest {
  scope: PracticeScope;
  /** Trusted learner-facing label, reused verbatim from LI-3's resolveDisplayLabel — never recomputed differently downstream. */
  label: string;
}

export type StudyHandoff =
  | { kind: "review"; conceptId: string }
  | { kind: "practice"; scope: PracticeScope; eligibleQuestionCount: number };

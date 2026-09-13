/**
 * LI-2 §16/§31: links each RepairAttemptEvent to its originating
 * QuestionAttemptEvent via `parentAttemptId` — never mutating either
 * event, never turning a primary miss into a correct answer, never
 * counting a Repair as a second primary attempt. A Repair whose parent
 * cannot be resolved among the eligible attempts is excluded from
 * classification and reported as an `ORPHAN_REPAIR` diagnostic rather
 * than crashing or being silently reinterpreted.
 */
import type { QuestionAttemptEvent, RepairAttemptEvent } from "../learning-history";
import { sortByOccurredAt } from "./windows";
import type { Diagnostic, RepairOutcome } from "./types";

export interface RepairIndex {
  outcomeForAttempt(attemptId: string): RepairOutcome | null;
}

export function buildRepairIndex(
  primaryAttempts: readonly QuestionAttemptEvent[],
  repairAttempts: readonly RepairAttemptEvent[]
): { index: RepairIndex; diagnostics: Diagnostic[] } {
  const knownAttemptIds = new Set(primaryAttempts.map((a) => a.attemptId));
  const diagnostics: Diagnostic[] = [];
  const byParent = new Map<string, RepairAttemptEvent[]>();

  for (const repair of repairAttempts) {
    if (!knownAttemptIds.has(repair.parentAttemptId)) {
      diagnostics.push({
        kind: "ORPHAN_REPAIR",
        eventId: repair.eventId,
        detail: `parentAttemptId "${repair.parentAttemptId}" does not resolve to any eligible QUESTION_ATTEMPT`
      });
      continue;
    }
    const existing = byParent.get(repair.parentAttemptId) ?? [];
    byParent.set(repair.parentAttemptId, [...existing, repair]);
  }

  // A well-formed attempt has at most one Repair; defensively, if more than
  // one somehow exists, the most recent one determines the outcome —
  // deterministic, never a crash, never an average of contradictory results.
  const outcomeByAttemptId = new Map<string, RepairOutcome>();
  for (const [parentId, repairs] of byParent) {
    const latest = sortByOccurredAt(repairs).at(-1)!;
    outcomeByAttemptId.set(parentId, latest.correct ? "CORRECTED_ON_REPAIR" : "REPAIR_STILL_MISSED");
  }

  return {
    index: { outcomeForAttempt: (attemptId) => outcomeByAttemptId.get(attemptId) ?? null },
    diagnostics
  };
}

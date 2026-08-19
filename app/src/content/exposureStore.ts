/**
 * The ONLY impure/stateful piece of the repetition architecture. A plain
 * module-scope variable — survives repeated "Start Today's Study" clicks
 * within one running page (App.tsx unmounts/remounts DailyStudySession
 * per session, but this module is imported once and keeps its state), and
 * is deliberately reset by a full browser reload. This is expected in
 * Phase 6C, not a bug — see docs/data-model/REPETITION-AND-RECALL-MODEL.md's
 * persistence-boundary section.
 *
 * Shaped as a get/record pair specifically so a future real persistence
 * layer (IndexedDB, per the Phase 6C architecture report) can implement
 * the same interface without any change to selection.ts or
 * productionContentSource.ts — the same decoupling DailyStudyContentSource
 * already proved out for content itself.
 */
import { emptyHistory, recordExposure as recordExposurePure, type ExposureHistory } from "./selection";

let history: ExposureHistory = emptyHistory();

export function getExposureHistory(): ExposureHistory {
  return history;
}

export function recordExposure(questionId: string, now: number = Date.now()): void {
  history = recordExposurePure(history, questionId, now);
}

/** Test-only: restores a clean slate. Not used by production code paths. */
export function resetExposureHistoryForTests(): void {
  history = emptyHistory();
}

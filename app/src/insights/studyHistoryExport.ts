/**
 * LI-3 §25/§26: export is versioned JSON, production learner history only
 * — no QA/prototype events, no browser internals, no account data (none
 * exists), no network call. This is data-shaping only; the actual
 * IndexedDB read still goes through LI-1's `listLearningEvents()` (see
 * InsightsScreen.tsx) — nothing here touches storage directly.
 */
import { EVENT_SCHEMA_VERSION, type LearningEvent } from "../learning-history";

export const EXPORT_FORMAT_VERSION = 1 as const;

export interface StudyHistoryExport {
  exportFormatVersion: typeof EXPORT_FORMAT_VERSION;
  exportedAt: number;
  eventSchemaVersion: typeof EVENT_SCHEMA_VERSION;
  events: LearningEvent[];
}

/** Architect preference (LI-3 brief §25): production learner history only — prototype/QA fixture events are never included. */
export function buildStudyHistoryExport(events: readonly LearningEvent[], exportedAt: number = Date.now()): StudyHistoryExport {
  return {
    exportFormatVersion: EXPORT_FORMAT_VERSION,
    exportedAt,
    eventSchemaVersion: EVENT_SCHEMA_VERSION,
    events: events.filter((event) => event.sourceContext === "production")
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `cism-study-history-YYYY-MM-DD.json`, from local date parts (not UTC) — matching how a learner reads "today's date." */
export function studyHistoryExportFilename(date: Date = new Date()): string {
  return `cism-study-history-${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}.json`;
}

/**
 * The one impure step: triggers a browser download of the given export via
 * a temporary object URL — no server upload, no network call. Kept as a
 * thin, separately-callable function so `buildStudyHistoryExport`'s data
 * shaping stays pure and independently testable.
 */
export function downloadStudyHistoryExport(exportPayload: StudyHistoryExport, filename: string = studyHistoryExportFilename()): void {
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

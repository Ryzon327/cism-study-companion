import { describe, it, expect } from "vitest";
import { buildStudyHistoryExport, studyHistoryExportFilename, EXPORT_FORMAT_VERSION } from "../../../../app/src/insights/studyHistoryExport";
import { EVENT_SCHEMA_VERSION } from "../../../../app/src/learning-history";
import { makeApplyEvent } from "../learning-intelligence/fixtures";

describe("buildStudyHistoryExport", () => {
  it("produces the expected versioned shape", () => {
    const events = [makeApplyEvent({ sourceContext: "production" })];
    const result = buildStudyHistoryExport(events, 1_700_000_000_000);
    expect(result.exportFormatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(result.exportedAt).toBe(1_700_000_000_000);
    expect(result.eventSchemaVersion).toBe(EVENT_SCHEMA_VERSION);
    expect(result.events).toEqual(events);
  });

  it("includes production events only — prototype/QA events are excluded", () => {
    const production = makeApplyEvent({ eventId: "prod-1", sourceContext: "production" });
    const prototype = makeApplyEvent({ eventId: "proto-1", sourceContext: "prototype" });
    const result = buildStudyHistoryExport([production, prototype]);
    expect(result.events).toEqual([production]);
  });

  it("produces an empty events array for an empty history, never fabricating data", () => {
    const result = buildStudyHistoryExport([]);
    expect(result.events).toEqual([]);
  });

  it("is JSON-serializable with no unrelated data (no functions, no undefined leakage)", () => {
    const events = [makeApplyEvent({ sourceContext: "production" })];
    const result = buildStudyHistoryExport(events);
    const roundTripped = JSON.parse(JSON.stringify(result));
    expect(roundTripped.events).toHaveLength(1);
    expect(Object.keys(roundTripped).sort()).toEqual(["eventSchemaVersion", "exportFormatVersion", "exportedAt", "events"].sort());
  });
});

describe("studyHistoryExportFilename", () => {
  it("matches cism-study-history-YYYY-MM-DD.json", () => {
    const date = new Date(2026, 8, 13); // month is 0-indexed: September
    expect(studyHistoryExportFilename(date)).toBe("cism-study-history-2026-09-13.json");
  });

  it("zero-pads single-digit months and days", () => {
    const date = new Date(2026, 0, 5); // January 5
    expect(studyHistoryExportFilename(date)).toBe("cism-study-history-2026-01-05.json");
  });
});

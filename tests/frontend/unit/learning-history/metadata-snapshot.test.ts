import { describe, it, expect } from "vitest";
import { snapshotQuestionMetadata } from "../../../../app/src/learning-history/metadataSnapshot";
import { production } from "../../../../app/src/content/registry";

/**
 * LI-1 §7/§14/§25: metadata is snapshotted AT ATTEMPT TIME from real
 * production content, and is truthfully "unavailable" (never inferred or
 * backfilled) whenever the source can't reliably supply it — a prototype
 * sourceContext, a null questionId, or an unresolvable id.
 */

describe("snapshotQuestionMetadata", () => {
  it("resolves a real production question's full metadata when sourceContext is production", () => {
    const snapshot = snapshotQuestionMetadata("question.foundation.0001", "production");
    const raw = production.questions.get("question.foundation.0001")!;
    expect(snapshot.domain).toBe(raw.domain);
    expect(snapshot.familyId).toBe(raw.family);
    expect(snapshot.conceptIds).toEqual(raw.concepts);
    expect(snapshot.qualifier).toBe(raw.qualifier);
    expect(snapshot.evidenceDimensions).toEqual(raw.evidence_dimensions);
    expect(snapshot.contentStatusAtAttempt).toBe(raw.content_status);
  });

  it("preserves sparse fields as null rather than inventing a value (primary_role/lifecycle/stage on a foundation question)", () => {
    const snapshot = snapshotQuestionMetadata("question.foundation.0001", "production");
    expect(snapshot.primaryRole).toBeNull();
    expect(snapshot.lifecycle).toBeNull();
    expect(snapshot.stage).toBeNull();
  });

  it("a domain-2 question with a real lifecycle/stage preserves those values rather than nulling them out", () => {
    const populated = [...production.questions.values()].find((q) => q.lifecycle && q.stage);
    expect(populated, "expected at least one production question with lifecycle+stage populated").toBeTruthy();
    const snapshot = snapshotQuestionMetadata(populated!.id, "production");
    expect(snapshot.lifecycle).toBe(populated!.lifecycle);
    expect(snapshot.stage).toBe(populated!.stage);
  });

  it("returns unavailable metadata (never throws) for a prototype sourceContext, even with a real production questionId", () => {
    const snapshot = snapshotQuestionMetadata("question.foundation.0001", "prototype");
    expect(snapshot.domain).toBeNull();
    expect(snapshot.familyId).toBeNull();
    expect(snapshot.conceptIds).toEqual([]);
    expect(snapshot.evidenceDimensions).toEqual([]);
  });

  it("returns unavailable metadata for a null questionId", () => {
    const snapshot = snapshotQuestionMetadata(null, "production");
    expect(snapshot.domain).toBeNull();
    expect(snapshot.contentStatusAtAttempt).toBeNull();
  });

  it("returns unavailable metadata (never throws) for an unresolvable questionId", () => {
    const snapshot = snapshotQuestionMetadata("question.does-not-exist.9999", "production");
    expect(snapshot.domain).toBeNull();
    expect(snapshot.conceptIds).toEqual([]);
  });
});

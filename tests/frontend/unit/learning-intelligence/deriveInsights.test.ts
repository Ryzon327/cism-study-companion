import { describe, it, expect, beforeEach } from "vitest";
import { deriveLearningInsights } from "../../../../app/src/learning-intelligence/deriveInsights";
import { INSIGHT_ENGINE_VERSION } from "../../../../app/src/learning-intelligence/types";
import { makeApplyEvent, makeRepairEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

describe("deriveLearningInsights — top-level pure API (§30)", () => {
  it("returns the expected shape, stamped with insightEngineVersion", () => {
    const result = deriveLearningInsights([]);
    expect(result).toEqual({ insightEngineVersion: INSIGHT_ENGINE_VERSION, groups: [], recommendations: [], diagnostics: [] });
  });

  it("excludes prototype-sourced events end-to-end (production-only filtering, §5/§27)", () => {
    const production = [
      makeApplyEvent({ sourceContext: "production", questionId: "q1", occurredAt: 100, correct: false, conceptIds: ["concept.a"] }),
      makeApplyEvent({ sourceContext: "production", questionId: "q2", occurredAt: 200, correct: false, conceptIds: ["concept.a"] }),
      makeApplyEvent({ sourceContext: "production", questionId: "q3", occurredAt: 300, correct: true, conceptIds: ["concept.a"] })
    ];
    const withoutQA = deriveLearningInsights(production);

    const qaContamination = Array.from({ length: 20 }, (_, i) =>
      makeApplyEvent({ sourceContext: "prototype", questionId: `qa${i}`, occurredAt: 1000 + i, correct: false, conceptIds: ["concept.a"] })
    );
    const withQA = deriveLearningInsights([...production, ...qaContamination]);

    expect(withQA.groups).toEqual(withoutQA.groups);
    expect(withQA.recommendations).toEqual(withoutQA.recommendations);
  });

  it("excludes an unsupported eventSchemaVersion end-to-end and surfaces a diagnostic", () => {
    const known = makeApplyEvent({ questionId: "q1", occurredAt: 100 });
    const unknown = { ...makeApplyEvent({ questionId: "q2", occurredAt: 200 }), eventSchemaVersion: 99 as never };
    const result = deriveLearningInsights([known, unknown]);
    expect(result.diagnostics.some((d) => d.kind === "UNSUPPORTED_SCHEMA_VERSION" && d.eventId === unknown.eventId)).toBe(true);
  });

  it("surfaces an ORPHAN_REPAIR diagnostic end-to-end without crashing", () => {
    const apply = makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false });
    const orphan = makeRepairEvent({ parentAttemptId: "unknown-attempt", occurredAt: 150, correct: false });
    const result = deriveLearningInsights([apply, orphan]);
    expect(result.diagnostics).toEqual([{ kind: "ORPHAN_REPAIR", eventId: orphan.eventId, detail: expect.any(String) }]);
  });

  it("groups are returned in a stable, deterministic order (sorted by identity key)", () => {
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, conceptIds: ["concept.zebra"] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, conceptIds: ["concept.alpha"] })
    ];
    const result = deriveLearningInsights(events);
    const keys = result.groups.map((g) => g.identity.key);
    expect(keys).toEqual([...keys].sort());
  });

  it("never mutates the input events array or any event within it", () => {
    const events = Object.freeze([
      Object.freeze(makeApplyEvent({ questionId: "q1", occurredAt: 100 })),
      Object.freeze(makeApplyEvent({ questionId: "q2", occurredAt: 200 }))
    ]);
    expect(() => deriveLearningInsights(events)).not.toThrow();
    expect(events).toHaveLength(2);
  });

  it("is fully deterministic — the same input always produces the same output", () => {
    const events = [
      makeApplyEvent({ questionId: "q1", occurredAt: 100, correct: false, conceptIds: ["concept.a"] }),
      makeApplyEvent({ questionId: "q2", occurredAt: 200, correct: false, conceptIds: ["concept.a"] }),
      makeApplyEvent({ questionId: "q3", occurredAt: 300, correct: true, conceptIds: ["concept.a"] })
    ];
    expect(deriveLearningInsights(events)).toEqual(deriveLearningInsights(events));
  });

  it("does not persist any derived result — deriveLearningInsights is a pure function with no IndexedDB access", () => {
    // Structural guarantee: this module never imports learning-history's
    // impure store. Verified here by absence of any global IndexedDB
    // activity across a call — no fake-indexeddb is installed in this
    // test file at all, so any accidental IndexedDB access would throw.
    expect(() => deriveLearningInsights([makeApplyEvent()])).not.toThrow();
  });
});

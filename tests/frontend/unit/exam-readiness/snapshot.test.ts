import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildExamQuestionSnapshot, computeContentFingerprint } from "../../../../app/src/exam-readiness/snapshot";
import { production } from "../../../../app/src/content/registry";
import { examBlueprints } from "../../../../app/src/exam-readiness/blueprintRegistry";
import { resetExposureHistoryForTests } from "../../../../app/src/content/exposureStore";
import type { ExamBlueprint, ExamQuestionSnapshotEntry } from "../../../../app/src/exam-readiness/types";

/**
 * ER-1: a frozen exam question snapshot captures each question's
 * exam-relevant CONTENT at build time — not just its id — as an authority
 * deliberately separate from "current production content." A later edit to
 * the source question must never change an already-built snapshot's
 * meaning; the content fingerprint exists to make that drift detectable.
 */

const TINY_BLUEPRINT: ExamBlueprint = {
  id: "blueprint.test.tiny",
  effectiveFrom: null,
  effectiveTo: null,
  questionCount: 4,
  durationMinutes: 10,
  domainWeights: [
    { domainId: "domain.d1", weightPercent: 25 },
    { domainId: "domain.d2", weightPercent: 25 },
    { domainId: "domain.d3", weightPercent: 25 },
    { domainId: "domain.d4", weightPercent: 25 }
  ]
};

beforeEach(() => {
  resetExposureHistoryForTests();
});
afterEach(() => {
  resetExposureHistoryForTests();
});

describe("buildExamQuestionSnapshot", () => {
  it("freezes exactly the questions selected, with real content, not just ids", () => {
    const snapshot = buildExamQuestionSnapshot(TINY_BLUEPRINT, { now: 1000 });
    expect(snapshot.questions).toHaveLength(4);
    for (const entry of snapshot.questions) {
      const raw = production.questions.get(entry.questionId)!;
      expect(entry.prompt).toBe(raw.prompt);
      expect(entry.explanation).toBe(raw.explanation);
      expect(entry.domainId).toBe(raw.domain);
      expect(entry.contentVersion).toBe(raw.version);
      expect(entry.options).toEqual(
        raw.options.map((o) => ({ key: o.key, text: o.text, correct: o.correct, rationale: o.rationale }))
      );
      expect(entry.concepts).toEqual(raw.concepts);
    }
  });

  it("the frozen concepts array is an independent copy — mutating it, or the source array, never reaches the other", () => {
    const snapshot = buildExamQuestionSnapshot(TINY_BLUEPRINT, { now: 1000 });
    const entry = snapshot.questions[0]!;
    const raw = production.questions.get(entry.questionId)!;

    expect(entry.concepts).not.toBe(raw.concepts); // different array reference
    expect(entry.concepts).toEqual(raw.concepts); // same values

    const originalRawConcepts = [...raw.concepts];
    try {
      raw.concepts.push("concept.injected-after-snapshot");
      expect(entry.concepts).not.toContain("concept.injected-after-snapshot"); // snapshot untouched

      entry.concepts.push("concept.injected-into-snapshot");
      expect(raw.concepts).not.toContain("concept.injected-into-snapshot"); // source untouched by the reverse mutation
    } finally {
      raw.concepts.length = 0;
      raw.concepts.push(...originalRawConcepts);
    }
  });

  it("records blueprintId and a builtAt timestamp", () => {
    const snapshot = buildExamQuestionSnapshot(TINY_BLUEPRINT, { now: 12345 });
    expect(snapshot.blueprintId).toBe("blueprint.test.tiny");
    expect(snapshot.builtAt).toBe(12345);
  });

  it("propagates a real insufficiency failure rather than freezing a short set", () => {
    const current = examBlueprints.find((b) => b.id === "blueprint.cism.outline-through-2026-11-02")!;
    expect(() => buildExamQuestionSnapshot(current)).toThrow(/insufficient/i);
  });
});

describe("computeContentFingerprint — deterministic content identity", () => {
  function entry(overrides: Partial<ExamQuestionSnapshotEntry> = {}): ExamQuestionSnapshotEntry {
    return {
      questionId: "question.x.0001",
      domainId: "domain.d1",
      family: "family.x",
      concepts: ["concept.x.alpha", "concept.x.beta"],
      prompt: "Prompt text.",
      options: [
        { key: "a", text: "A", correct: true, rationale: "Because." },
        { key: "b", text: "B", correct: false, rationale: "Because." }
      ],
      explanation: "Explanation.",
      contentVersion: 1,
      ...overrides
    };
  }

  it("is deterministic: identical entries always produce the identical fingerprint", () => {
    const a = computeContentFingerprint([entry()]);
    const b = computeContentFingerprint([entry()]);
    expect(a).toBe(b);
  });

  it("is independent of input array order (canonicalized by questionId)", () => {
    const one = entry({ questionId: "question.a" });
    const two = entry({ questionId: "question.b" });
    const forward = computeContentFingerprint([one, two]);
    const reversed = computeContentFingerprint([two, one]);
    expect(forward).toBe(reversed);
  });

  it("changes when any frozen field changes (prompt drift is detectable)", () => {
    const original = computeContentFingerprint([entry()]);
    const edited = computeContentFingerprint([entry({ prompt: "A different prompt." })]);
    expect(edited).not.toBe(original);
  });

  it("changes when contentVersion changes even if visible text is identical", () => {
    const v1 = computeContentFingerprint([entry({ contentVersion: 1 })]);
    const v2 = computeContentFingerprint([entry({ contentVersion: 2 })]);
    expect(v1).not.toBe(v2);
  });

  it("changes when the question set's membership changes", () => {
    const withOne = computeContentFingerprint([entry({ questionId: "question.a" })]);
    const withTwo = computeContentFingerprint([entry({ questionId: "question.a" }), entry({ questionId: "question.b" })]);
    expect(withOne).not.toBe(withTwo);
  });

  it("changes when a question's concept MEMBERSHIP changes (a concept added or removed)", () => {
    const original = computeContentFingerprint([entry({ concepts: ["concept.x.alpha", "concept.x.beta"] })]);
    const added = computeContentFingerprint([entry({ concepts: ["concept.x.alpha", "concept.x.beta", "concept.x.gamma"] })]);
    const removed = computeContentFingerprint([entry({ concepts: ["concept.x.alpha"] })]);
    expect(added).not.toBe(original);
    expect(removed).not.toBe(original);
  });

  it("does NOT change when a question's concepts array is merely reordered — concept identity is set-like, not order-sensitive (documented, deterministic behavior)", () => {
    const forward = computeContentFingerprint([entry({ concepts: ["concept.x.alpha", "concept.x.beta"] })]);
    const reversed = computeContentFingerprint([entry({ concepts: ["concept.x.beta", "concept.x.alpha"] })]);
    expect(forward).toBe(reversed);
  });

  it("does NOT change for a duplicate entry within one question's concepts array (canonicalized as a set)", () => {
    const withoutDupe = computeContentFingerprint([entry({ concepts: ["concept.x.alpha", "concept.x.beta"] })]);
    const withDupe = computeContentFingerprint([entry({ concepts: ["concept.x.alpha", "concept.x.beta", "concept.x.alpha"] })]);
    expect(withoutDupe).toBe(withDupe);
  });

  it("two independently built snapshots of the same blueprint at the same clock, from a clean history, have identical fingerprints", () => {
    const a = buildExamQuestionSnapshot(TINY_BLUEPRINT, { now: 1000 });
    const b = buildExamQuestionSnapshot(TINY_BLUEPRINT, { now: 1000 });
    expect(a.contentFingerprint).toBe(b.contentFingerprint);
    expect(a.questions).toEqual(b.questions);
  });
});

import { describe, it, expect } from "vitest";
import { orderOptionsForDisplay, displayPositionOf, displayLetterForPosition } from "../../../app/src/content/answerOrder";
import productionQuestionsRaw from "../../../content/production/questions.json";

interface Opt {
  key: string;
  text: string;
  correct: boolean;
  rationale: string;
  repair_target?: string;
}

const OPTIONS: Opt[] = [
  { key: "a", text: "Option A text", correct: true, rationale: "why A is right" },
  { key: "b", text: "Option B text", correct: false, rationale: "why B is wrong", repair_target: "repair.authority-error" },
  { key: "c", text: "Option C text", correct: false, rationale: "why C is wrong", repair_target: "repair.role-error" },
  { key: "d", text: "Option D text", correct: false, rationale: "why D is wrong", repair_target: "repair.authority-error" }
];

function correctPositionLetter(qid: string, exposureCount: number): string {
  const ordered = orderOptionsForDisplay(OPTIONS, qid, exposureCount);
  const correctKey = OPTIONS.find((o) => o.correct)!.key;
  return displayLetterForPosition(displayPositionOf(ordered, correctKey));
}

describe("answerOrder — semantic identity is preserved through reordering", () => {
  it("1. every option's semantic key is present, unique, and unchanged after reordering", () => {
    const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0001", 3);
    expect(ordered.map((o) => o.key).sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("2. exactly one semantic answer remains correct after reordering, across many exposure counts", () => {
    for (let e = 0; e < 30; e++) {
      const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0001", e);
      expect(ordered.filter((o) => o.correct)).toHaveLength(1);
    }
  });

  it("3. correctness stays attached to the semantic option, never to a fixed array position", () => {
    for (let e = 0; e < 10; e++) {
      const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0001", e);
      const correctOption = ordered.find((o) => o.correct)!;
      expect(correctOption.key).toBe("a"); // the semantically-correct option is always key "a", regardless of where it now sits
    }
  });

  it("4. rationales follow their semantic option through reordering", () => {
    const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0002", 5);
    for (const opt of ordered) {
      const original = OPTIONS.find((o) => o.key === opt.key)!;
      expect(opt.rationale).toBe(original.rationale);
    }
  });

  it("5. repair targets follow their semantic option through reordering", () => {
    const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0002", 5);
    for (const opt of ordered) {
      const original = OPTIONS.find((o) => o.key === opt.key)!;
      expect(opt.repair_target).toBe(original.repair_target);
    }
  });

  it("6. option count and text content are otherwise unaffected (no options added, removed, or mutated)", () => {
    const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0003", 1);
    expect(ordered).toHaveLength(OPTIONS.length);
    for (const opt of ordered) {
      const original = OPTIONS.find((o) => o.key === opt.key)!;
      expect(opt.text).toBe(original.text);
    }
  });
});

describe("answerOrder — attempt stability (7, 8) and exposure variation (9, 10, 11, 12)", () => {
  it("7 & 8. identical inputs always produce the identical order — deterministic, safe across re-renders/StrictMode double-invocation", () => {
    const a = orderOptionsForDisplay(OPTIONS, "question.test.0004", 2);
    const b = orderOptionsForDisplay(OPTIONS, "question.test.0004", 2);
    const c = orderOptionsForDisplay(OPTIONS, "question.test.0004", 2);
    expect(a.map((o) => o.key)).toEqual(b.map((o) => o.key));
    expect(b.map((o) => o.key)).toEqual(c.map((o) => o.key));
  });

  it("9. a later exposure (different exposureCount) can produce a different order than an earlier one", () => {
    const orders = new Set<string>();
    for (let e = 0; e < 10; e++) {
      orders.add(orderOptionsForDisplay(OPTIONS, "question.test.0005", e).map((o) => o.key).join(""));
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it("10. the correct answer occupies all four positions (A, B, C, D) across enough controlled repeated exposures", () => {
    const seenLetters = new Set<string>();
    for (let e = 0; e < 24; e++) {
      seenLetters.add(correctPositionLetter("question.test.0006", e));
    }
    expect(seenLetters).toEqual(new Set(["A", "B", "C", "D"]));
  });

  it("11. no fixed 'correct answer is always A' behavior remains, for multiple distinct questions", () => {
    for (const qid of ["question.d1.0002", "question.foundation.0001", "question.d1.0016", "question.d1.0022", "question.d1.0008"]) {
      const letters = Array.from({ length: 6 }, (_, e) => correctPositionLetter(qid, e));
      expect(new Set(letters).size).toBeGreaterThan(1); // not stuck at one letter across 6 exposures
      expect(letters.every((l) => l === "A")).toBe(false); // never a solid run of "always A"
    }
  });

  it("12. no simple, universally-predictable +1-per-exposure sequence is required — different questions do not share one fixed rotation pattern", () => {
    const sequenceFor = (qid: string) => Array.from({ length: 6 }, (_, e) => correctPositionLetter(qid, e)).join("");
    const sequences = new Set([
      sequenceFor("question.d1.0002"),
      sequenceFor("question.foundation.0001"),
      sequenceFor("question.d1.0016"),
      sequenceFor("question.d1.0022")
    ]);
    // If every question rotated through the same fixed A,B,C,D,A,B pattern,
    // all four sequences would be identical. They are not — each question's
    // sequence is independently seeded.
    expect(sequences.size).toBeGreaterThan(1);
  });
});

describe("answerOrder — helper functions", () => {
  it("displayPositionOf finds a semantic key's position in an already-ordered array", () => {
    const ordered = orderOptionsForDisplay(OPTIONS, "question.test.0007", 4);
    for (let i = 0; i < ordered.length; i++) {
      expect(displayPositionOf(ordered, ordered[i]!.key)).toBe(i);
    }
  });

  it("displayPositionOf throws for a key that isn't present, rather than silently returning -1", () => {
    expect(() => displayPositionOf(OPTIONS, "z")).toThrow();
  });

  it("displayLetterForPosition maps 0/1/2/3 to A/B/C/D", () => {
    expect(displayLetterForPosition(0)).toBe("A");
    expect(displayLetterForPosition(1)).toBe("B");
    expect(displayLetterForPosition(2)).toBe("C");
    expect(displayLetterForPosition(3)).toBe("D");
  });

  it("a single-option list is returned unchanged (no reordering possible or needed)", () => {
    const single = [OPTIONS[0]!];
    expect(orderOptionsForDisplay(single, "question.test.0008", 5)).toEqual(single);
  });
});

// Added following a Phase 9B-3 investigation into a founder-reported
// concern about answer-position bias (found not confirmed — see
// docs/learning/PHASE-9B3-GATE-RECORD.md). That investigation surfaced a
// real, separate coverage gap worth closing on its own merits: every prior
// test in this file exercised the algorithm only against a fixed list of
// five Domain 1/Foundation question IDs chosen when this file was written,
// so a defect specific to any newer question ID would never have been
// caught by this suite. This closes that gap generically — iterating over
// every ACTUAL production question ID currently authored, rather than a
// fixed sample — so it covers whatever is added in future phases without
// needing a manual update each time. It encodes the same "never stuck at
// one position" shape as the historical defect this architecture was built
// to prevent, not an artificial distribution target.
describe("answerOrder — whole-bank regression: no production question exhibits a first-position (or any fixed-position) bias across repeated exposures", () => {
  const allQuestions = productionQuestionsRaw as unknown as Array<{
    id: string;
    options: Array<{ key: string; correct: boolean }>;
  }>;

  it("every production question's correct answer visits more than one display position across 8 exposures, and is never stuck at position A the whole time", () => {
    for (const q of allQuestions) {
      const correctKey = q.options.find((o) => o.correct)!.key;
      const positions = Array.from({ length: 8 }, (_, e) => {
        const ordered = orderOptionsForDisplay(q.options, q.id, e);
        return displayPositionOf(ordered, correctKey);
      });
      expect(new Set(positions).size, `${q.id}: correct answer never moves across 8 exposures`).toBeGreaterThan(1);
      expect(positions.every((p) => p === 0), `${q.id}: correct answer is at position A for all 8 exposures`).toBe(false);
    }
  });
});

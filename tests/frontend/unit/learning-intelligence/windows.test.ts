import { describe, it, expect, beforeEach } from "vitest";
import { sortByOccurredAt, recentWindow, distinctQuestionCount, distinctConceptCount } from "../../../../app/src/learning-intelligence/windows";
import { makeApplyEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

describe("sortByOccurredAt", () => {
  it("sorts ascending by occurredAt", () => {
    const c = makeApplyEvent({ occurredAt: 300 });
    const a = makeApplyEvent({ occurredAt: 100 });
    const b = makeApplyEvent({ occurredAt: 200 });
    expect(sortByOccurredAt([c, a, b])).toEqual([a, b, c]);
  });

  it("breaks ties on eventId deterministically", () => {
    const a = makeApplyEvent({ eventId: "a", occurredAt: 100 });
    const b = makeApplyEvent({ eventId: "b", occurredAt: 100 });
    expect(sortByOccurredAt([b, a])).toEqual([a, b]);
  });

  it("does not mutate the input array", () => {
    const events = [makeApplyEvent({ occurredAt: 200 }), makeApplyEvent({ occurredAt: 100 })];
    const original = [...events];
    sortByOccurredAt(events);
    expect(events).toEqual(original);
  });
});

describe("recentWindow", () => {
  it("returns all attempts, oldest-first, when fewer than the window size exist", () => {
    const a = makeApplyEvent({ occurredAt: 100 });
    const b = makeApplyEvent({ occurredAt: 200 });
    expect(recentWindow([b, a], 6)).toEqual([a, b]);
  });

  it("returns exactly the most recent N when more than N exist", () => {
    const attempts = [100, 200, 300, 400, 500, 600, 700].map((t) => makeApplyEvent({ occurredAt: t }));
    const window = recentWindow(attempts, 3);
    expect(window.map((a) => a.occurredAt)).toEqual([500, 600, 700]);
  });
});

describe("distinctQuestionCount", () => {
  it("counts distinct non-null questionIds", () => {
    const attempts = [
      makeApplyEvent({ questionId: "q1" }),
      makeApplyEvent({ questionId: "q1" }),
      makeApplyEvent({ questionId: "q2" })
    ];
    expect(distinctQuestionCount(attempts)).toBe(2);
  });

  it("never lets a null questionId satisfy breadth", () => {
    const attempts = [makeApplyEvent({ questionId: null }), makeApplyEvent({ questionId: null })];
    expect(distinctQuestionCount(attempts)).toBe(0);
  });
});

describe("distinctConceptCount", () => {
  it("counts distinct concepts across all attempts, including multi-concept questions", () => {
    const attempts = [
      makeApplyEvent({ conceptIds: ["concept.a"] }),
      makeApplyEvent({ conceptIds: ["concept.a", "concept.b"] })
    ];
    expect(distinctConceptCount(attempts)).toBe(2);
  });
});

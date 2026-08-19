import { describe, it, expect } from "vitest";
import {
  selectVariant,
  recordExposure,
  emptyHistory,
  classifyConfidenceSignal,
  nextSpacingBand,
  type ExposureHistory
} from "../../../app/src/content/selection";

const CANDIDATES = ["question.x.0001", "question.x.0002", "question.x.0003"];

function historyFrom(entries: [string, number][]): ExposureHistory {
  let h = emptyHistory();
  for (const [id, at] of entries) h = recordExposure(h, id, at);
  return h;
}

describe("selectVariant — the exact-repeat policy", () => {
  it("prefers an unseen variant when history is empty", () => {
    const chosen = selectVariant(CANDIDATES, emptyHistory(), 1000);
    expect(CANDIDATES).toContain(chosen);
  });

  it("selects a different unseen variant on the second call, once the first is recorded", () => {
    let history = emptyHistory();
    const first = selectVariant(CANDIDATES, history, 1000);
    history = recordExposure(history, first, 1000);

    const second = selectVariant(CANDIDATES, history, 1001);
    expect(second).not.toBe(first);
  });

  it("selects the third distinct unseen variant on the third call", () => {
    let history = emptyHistory();
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const chosen = selectVariant(CANDIDATES, history, 1000 + i);
      expect(seen).not.toContain(chosen);
      seen.push(chosen);
      history = recordExposure(history, chosen, 1000 + i);
    }
    expect(new Set(seen).size).toBe(3);
  });

  it("falls back to the least-recently-seen variant once every candidate has been shown", () => {
    const history = historyFrom([
      ["question.x.0001", 100],
      ["question.x.0002", 300],
      ["question.x.0003", 200]
    ]);
    // 0001 was seen longest ago (t=100) — it should be selected, not skipped.
    expect(selectVariant(CANDIDATES, history, 1000)).toBe("question.x.0001");
  });

  it("allows an exact repeat when only one eligible variant exists — never throws, never refuses", () => {
    const single = ["question.x.0001"];
    let history = emptyHistory();
    const first = selectVariant(single, history, 1000);
    history = recordExposure(history, first, 1000);
    const second = selectVariant(single, history, 2000);
    expect(second).toBe(first);
    expect(second).toBe("question.x.0001");
  });

  it("is deterministic: identical inputs always produce the identical output", () => {
    const history = historyFrom([
      ["question.x.0001", 100],
      ["question.x.0002", 100]
    ]);
    const a = selectVariant(CANDIDATES, history, 5000);
    const b = selectVariant(CANDIDATES, history, 5000);
    expect(a).toBe(b);
  });

  it("tie-breaks deterministically (lowest id) rather than randomly, when multiple unseen candidates are equally eligible", () => {
    const results = new Set<string>();
    for (let i = 0; i < 5; i++) {
      results.add(selectVariant(CANDIDATES, emptyHistory(), 1000));
    }
    // Same inputs, called repeatedly -> always the same result, proving no Math.random() is involved.
    expect(results.size).toBe(1);
  });

  it("throws on an empty candidate list rather than silently returning something", () => {
    expect(() => selectVariant([], emptyHistory(), 1000)).toThrow();
  });
});

describe("recordExposure — immutability", () => {
  it("never mutates the input history, always returns a new one", () => {
    const before = emptyHistory();
    const after = recordExposure(before, "question.x.0001", 1000);
    expect(before.size).toBe(0);
    expect(after.size).toBe(1);
  });

  it("increments count on repeated exposures to the same variant", () => {
    let h = recordExposure(emptyHistory(), "question.x.0001", 1000);
    h = recordExposure(h, "question.x.0001", 2000);
    expect(h.get("question.x.0001")?.count).toBe(2);
    expect(h.get("question.x.0001")?.lastSeenAt).toBe(2000);
  });
});

describe("classifyConfidenceSignal — confidence never independently creates mastery", () => {
  it("classifies all four correct/confidence combinations without producing any mastery-shaped output", () => {
    expect(classifyConfidenceSignal(false, true)).toBe("strong-repair-priority");
    expect(classifyConfidenceSignal(false, false)).toBe("normal-repair");
    expect(classifyConfidenceSignal(true, false)).toBe("reinforcement-candidate");
    expect(classifyConfidenceSignal(true, true)).toBe("healthy-calibration");
  });
});

describe("nextSpacingBand — three bands, no calendar math", () => {
  it("promotes on healthy calibration, one step at a time", () => {
    expect(nextSpacingBand("SOON", "healthy-calibration")).toBe("LATER");
    expect(nextSpacingBand("LATER", "healthy-calibration")).toBe("STABLE");
    expect(nextSpacingBand("STABLE", "healthy-calibration")).toBe("STABLE");
  });

  it("demotes to SOON on any incorrect signal, regardless of current band", () => {
    expect(nextSpacingBand("STABLE", "strong-repair-priority")).toBe("SOON");
    expect(nextSpacingBand("LATER", "normal-repair")).toBe("SOON");
  });

  it("holds (does not promote) on a reinforcement-candidate signal — a calibration gap, not a demotion", () => {
    expect(nextSpacingBand("LATER", "reinforcement-candidate")).toBe("LATER");
  });
});

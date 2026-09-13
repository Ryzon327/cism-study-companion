import { describe, it, expect } from "vitest";
import {
  resolveDisplayLabel,
  stateLabel,
  reasonCodeCopy,
  evidenceLines,
  buildFocusNext,
  buildStrongerAreas,
  buildTrendSummaries,
  domainSummaryLine,
  buildInsightsViewModel
} from "../../../../app/src/insights/insightPresentation";
import type { EvidenceGroup, EvidenceSummary, GroupIdentity, InsightResult, RecommendationCandidate } from "../../../../app/src/learning-intelligence";

/**
 * LI-3 §10/§11/§41: display-resolution and evidence-copy tests — no raw
 * ID, reason code, engine version, JSON, or timestamp may ever appear in
 * a string this module returns.
 */

const BASE_EVIDENCE: EvidenceSummary = {
  primaryAttemptCount: 3,
  distinctQuestionCount: 3,
  recentPrimaryCount: 3,
  recentCorrectCount: 1,
  recentIncorrectCount: 2,
  sureIncorrectCount: 0,
  lowConfidenceCorrectCount: 0,
  lowConfidenceCorrectDistinctQuestionCount: 0,
  unresolvedRecentIncorrectCount: 2,
  successfulRepairCount: 0,
  failedRepairCount: 0,
  recallCorrectCount: 0,
  recallIncorrectCount: 0,
  lastAttemptAt: 300
};

function identity(axis: GroupIdentity["axis"], targetId: string): GroupIdentity {
  return { axis, targetId, key: `${axis}:${targetId}` };
}

describe("resolveDisplayLabel", () => {
  it("resolves a real production concept to its authored display name, never the raw ID", () => {
    const result = resolveDisplayLabel(identity("concept", "concept.foundation.qualifier-recognition"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toContain("concept.");
    expect(result.label.length).toBeGreaterThan(0);
  });

  it("resolves a real production family to its authored display name", () => {
    const result = resolveDisplayLabel(identity("family", "family.foundation.qualifier-recognition"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toContain("family.");
  });

  it("resolves a real pattern to its authored display name", () => {
    const result = resolveDisplayLabel(identity("pattern", "pattern.p01"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toMatch(/^pattern\./);
  });

  it("resolves a qualifier with the 'questions' suffix (e.g. NEXT -> 'NEXT questions')", () => {
    const result = resolveDisplayLabel(identity("qualifier", "qualifier.next"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).toBe("NEXT questions");
  });

  it("resolves a role to its authored display name", () => {
    const result = resolveDisplayLabel(identity("role", "role.board-senior-management"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toMatch(/^role\./);
  });

  it("resolves a lifecycle to its authored display name", () => {
    const result = resolveDisplayLabel(identity("lifecycle", "lifecycle.risk"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toMatch(/^lifecycle\./);
  });

  it("resolves a stage to its authored display name", () => {
    const result = resolveDisplayLabel(identity("stage", "stage.risk.identify"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toMatch(/^stage\./);
  });

  it("resolves a decision type to its authored display name", () => {
    const result = resolveDisplayLabel(identity("decision_type", "decision.risk"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toMatch(/^decision\./);
  });

  it("resolves a domain to its authored display name", () => {
    const result = resolveDisplayLabel(identity("domain", "domain.d2"));
    expect(result.isUnknownTarget).toBe(false);
    expect(result.label).not.toMatch(/^domain\./);
  });

  it("falls back to a restrained, truthful label for an unknown/stale concept target — never the raw ID", () => {
    const result = resolveDisplayLabel(identity("concept", "concept.does-not-exist.9999"));
    expect(result.isUnknownTarget).toBe(true);
    expect(result.label).not.toContain("concept.");
    expect(result.label).not.toContain("does-not-exist");
    expect(result.label.length).toBeGreaterThan(0);
  });

  it("falls back safely for an unknown pattern/role/lifecycle/stage target too", () => {
    for (const axis of ["pattern", "role", "lifecycle", "stage", "qualifier", "decision_type", "domain", "family", "evidence_dimension"] as const) {
      const result = resolveDisplayLabel(identity(axis, "does-not-exist"));
      expect(result.isUnknownTarget).toBe(true);
      expect(result.label).not.toContain("does-not-exist");
    }
  });
});

describe("stateLabel", () => {
  it("never uses Weak/Bad/Failing/Poor/Mastered", () => {
    for (const state of ["NEEDS_REVIEW", "DEVELOPING", "STRONGER_EVIDENCE", "NOT_ENOUGH_EVIDENCE"] as const) {
      const label = stateLabel(state);
      expect(label).not.toMatch(/weak|bad|fail|poor|master/i);
    }
  });

  it("uses the approved learner-facing labels", () => {
    expect(stateLabel("NEEDS_REVIEW")).toBe("Needs review");
    expect(stateLabel("DEVELOPING")).toBe("Developing");
    expect(stateLabel("STRONGER_EVIDENCE")).toBe("Stronger evidence");
  });
});

describe("reasonCodeCopy", () => {
  it("translates every reason code to non-diagnostic, factual copy", () => {
    const codes = [
      "REPEATED_MISSES",
      "REPEATED_SURE_MISSES",
      "REPAIR_STILL_MISSED",
      "LOW_CONFIDENCE_CORRECT",
      "IMPROVING_RECENTLY",
      "SUCCESSFUL_CORRECTION",
      "RECENT_STRONG_PERFORMANCE"
    ] as const;
    for (const code of codes) {
      const copy = reasonCodeCopy(code);
      expect(copy.length).toBeGreaterThan(0);
      expect(copy).not.toMatch(/overconfiden|you are (weak|bad)/i);
    }
  });

  it("never says 'you are overconfident' for REPEATED_SURE_MISSES", () => {
    expect(reasonCodeCopy("REPEATED_SURE_MISSES")).not.toMatch(/overconfident/i);
  });
});

describe("evidenceLines", () => {
  it("includes a Sure-confidence explanatory line without diagnosing behavior", () => {
    const lines = evidenceLines({ ...BASE_EVIDENCE, sureIncorrectCount: 2 }, []);
    expect(lines.some((l) => l.includes("Sure confidence"))).toBe(true);
    expect(lines.join(" ")).not.toMatch(/overconfident/i);
  });

  it("presents a successful correction positively, not as a bare miss", () => {
    const lines = evidenceLines({ ...BASE_EVIDENCE, successfulRepairCount: 1 }, ["SUCCESSFUL_CORRECTION"]);
    expect(lines.some((l) => l.toLowerCase().includes("corrected"))).toBe(true);
  });

  it("never exposes raw window names, JSON, or reason-code identifiers", () => {
    const lines = evidenceLines(BASE_EVIDENCE, ["REPEATED_MISSES"]);
    const joined = lines.join(" ");
    expect(joined).not.toMatch(/window|REPEATED_MISSES|\{|\}/);
  });
});

/**
 * LI-4: `buildFocusNext` now resolves real handoffs (via
 * study-handoff/resolveStudyHandoffs.ts) instead of LI-2's
 * `suggestedActionKind` text — see docs/architecture/
 * LI-4-IMPLEMENTATION-RECORD.md's binding routing constraint. These use
 * real production IDs since resolution depends on actual current content.
 */
describe("buildFocusNext — LI-4 real action resolution", () => {
  function candidateFor(axis: GroupIdentity["axis"], targetId: string): RecommendationCandidate {
    return {
      target: identity(axis, targetId),
      state: "NEEDS_REVIEW",
      reasonCodes: ["REPEATED_MISSES"],
      evidenceSummary: BASE_EVIDENCE,
      suggestedActionKind: "REVIEW_CONCEPT"
    };
  }

  it("a resolvable concept gets Review + Practice actions with real, target-specific labels", () => {
    const result = makeInsightResult([], [candidateFor("concept", "concept.d3.program-metrics-reporting")]);
    const [presentation] = buildFocusNext(result);
    expect(presentation!.actions.map((a) => a.label)).toEqual(["Review topic", "Practice this topic"]);
    expect(presentation!.actions.every((a) => a.ariaLabel.includes(presentation!.displayLabel))).toBe(true);
  });

  it("a qualifier gets only a Practice action, worded using its own display label", () => {
    const result = makeInsightResult([], [candidateFor("qualifier", "qualifier.next")]);
    const [presentation] = buildFocusNext(result);
    expect(presentation!.actions).toHaveLength(1);
    expect(presentation!.actions[0]!.label).toBe("Practice NEXT questions");
    expect(presentation!.actions[0]!.handoff.kind).toBe("practice");
  });

  it("a pattern gets only a Practice action, labeled 'Practice this pattern'", () => {
    const result = makeInsightResult([], [candidateFor("pattern", "pattern.p02")]);
    const [presentation] = buildFocusNext(result);
    expect(presentation!.actions.map((a) => a.label)).toEqual(["Practice this pattern"]);
  });

  it("a domain gets only a Practice action, never a Review action (LI-4 §6's forbidden 'arbitrary concept in that domain' mapping)", () => {
    const result = makeInsightResult([], [candidateFor("domain", "domain.d2")]);
    const [presentation] = buildFocusNext(result);
    expect(presentation!.actions).toHaveLength(1);
    expect(presentation!.actions[0]!.label).toBe("Practice this domain");
  });

  it("a stale/unresolvable target gets zero actions, never a broken button", () => {
    const result = makeInsightResult([], [candidateFor("concept", "concept.no-longer-exists")]);
    const [presentation] = buildFocusNext(result);
    expect(presentation!.actions).toEqual([]);
  });

  it("carries axis/targetId as computational identity, never relying on the display label", () => {
    const result = makeInsightResult([], [candidateFor("concept", "concept.d3.program-metrics-reporting")]);
    const [presentation] = buildFocusNext(result);
    expect(presentation!.axis).toBe("concept");
    expect(presentation!.targetId).toBe("concept.d3.program-metrics-reporting");
  });
});

function makeGroup(axis: GroupIdentity["axis"], targetId: string, state: EvidenceGroup["state"], overrides: Partial<EvidenceSummary> = {}): EvidenceGroup {
  return { identity: identity(axis, targetId), state, reasonCodes: [], trend: null, evidence: { ...BASE_EVIDENCE, ...overrides } };
}

function makeInsightResult(groups: EvidenceGroup[], recommendations: RecommendationCandidate[] = []): InsightResult {
  return { insightEngineVersion: 1, groups, recommendations, diagnostics: [] };
}

describe("buildStrongerAreas — presentation-only overlap reduction", () => {
  it("drops a redundant domain-level Stronger Evidence entry when a more specific one exists", () => {
    const groups = [makeGroup("concept", "concept.a", "STRONGER_EVIDENCE"), makeGroup("domain", "domain.d1", "STRONGER_EVIDENCE")];
    const result = buildStrongerAreas(makeInsightResult(groups));
    expect(result).toHaveLength(1);
  });

  it("keeps a domain-level entry when no more specific Stronger Evidence exists", () => {
    const groups = [makeGroup("domain", "domain.d1", "STRONGER_EVIDENCE")];
    const result = buildStrongerAreas(makeInsightResult(groups));
    expect(result).toHaveLength(1);
  });

  it("never returns more than 3 entries", () => {
    const groups = Array.from({ length: 6 }, (_, i) => makeGroup("concept", `concept.g${i}`, "STRONGER_EVIDENCE"));
    expect(buildStrongerAreas(makeInsightResult(groups))).toHaveLength(3);
  });

  it("excludes NEEDS_REVIEW/DEVELOPING/NOT_ENOUGH_EVIDENCE groups entirely", () => {
    const groups = [makeGroup("concept", "concept.a", "NEEDS_REVIEW"), makeGroup("concept", "concept.b", "DEVELOPING"), makeGroup("concept", "concept.c", "NOT_ENOUGH_EVIDENCE")];
    expect(buildStrongerAreas(makeInsightResult(groups))).toEqual([]);
  });
});

describe("buildTrendSummaries", () => {
  it("excludes groups already shown in Focus Next", () => {
    const groups = [{ ...makeGroup("concept", "concept.a", "DEVELOPING"), trend: "IMPROVING" as const }];
    const result = buildTrendSummaries(makeInsightResult(groups), new Set(["concept:concept.a"]));
    expect(result).toEqual([]);
  });

  it("includes groups with a known trend not already shown, capped at 2", () => {
    const groups = ["a", "b", "c"].map((id) => ({ ...makeGroup("concept", `concept.${id}`, "DEVELOPING"), trend: "IMPROVING" as const }));
    const result = buildTrendSummaries(makeInsightResult(groups), new Set());
    expect(result).toHaveLength(2);
  });

  it("never includes a group with a null trend", () => {
    const groups = [makeGroup("concept", "concept.a", "DEVELOPING")]; // trend: null by default
    expect(buildTrendSummaries(makeInsightResult(groups), new Set())).toEqual([]);
  });
});

describe("domainSummaryLine", () => {
  it("returns null when no domain-level concern exists", () => {
    expect(domainSummaryLine(makeInsightResult([]))).toBeNull();
  });

  it("returns a subtle summary line when a domain-level concern exists, with no fake precision", () => {
    const groups = [makeGroup("domain", "domain.d2", "NEEDS_REVIEW", { recentIncorrectCount: 3 })];
    const line = domainSummaryLine(makeInsightResult(groups));
    expect(line).not.toBeNull();
    expect(line).not.toMatch(/%|\d+\.\d+/);
  });
});

describe("buildInsightsViewModel — screen-level status", () => {
  it("zero groups -> no-history", () => {
    expect(buildInsightsViewModel(makeInsightResult([])).status).toBe("no-history");
  });

  it("only Recall evidence (zero primary attempts) -> no-history, never a false weakness", () => {
    const groups = [makeGroup("concept", "concept.a", "NOT_ENOUGH_EVIDENCE", { primaryAttemptCount: 0, recentPrimaryCount: 0, recallCorrectCount: 2 })];
    const result = buildInsightsViewModel(makeInsightResult(groups));
    expect(result.status).toBe("no-history");
    expect(result.focusNext).toEqual([]);
  });

  it("one Apply miss (insufficient evidence) -> insufficient-evidence, never a false weakness", () => {
    const groups = [makeGroup("concept", "concept.a", "NOT_ENOUGH_EVIDENCE", { primaryAttemptCount: 1, recentPrimaryCount: 1 })];
    const result = buildInsightsViewModel(makeInsightResult(groups));
    expect(result.status).toBe("insufficient-evidence");
    expect(result.focusNext).toEqual([]);
  });

  it("some history but no actionable groups -> insufficient-evidence", () => {
    const groups = [makeGroup("concept", "concept.a", "NOT_ENOUGH_EVIDENCE", { primaryAttemptCount: 2, recentPrimaryCount: 2 })];
    expect(buildInsightsViewModel(makeInsightResult(groups)).status).toBe("insufficient-evidence");
  });

  it("at least one recommendation or stronger area -> ready", () => {
    const candidate: RecommendationCandidate = {
      target: identity("concept", "concept.a"),
      state: "NEEDS_REVIEW",
      reasonCodes: ["REPEATED_MISSES"],
      evidenceSummary: BASE_EVIDENCE,
      suggestedActionKind: "REVIEW_CONCEPT"
    };
    const groups = [makeGroup("concept", "concept.a", "NEEDS_REVIEW")];
    const result = buildInsightsViewModel(makeInsightResult(groups, [candidate]));
    expect(result.status).toBe("ready");
    expect(result.focusNext).toHaveLength(1);
  });
});

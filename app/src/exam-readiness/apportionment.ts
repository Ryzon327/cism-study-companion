import { assertValidExamBlueprint } from "./blueprintValidation";
import type { DomainQuestionAllocation, ExamBlueprint } from "./types";

/**
 * Largest-remainder apportionment: floor each domain's
 * `questionCount * weightPercent / 100`, then distribute the leftover
 * integer slots (caused by flooring) one at a time to the domains with the
 * largest fractional remainder, tie-broken by higher published weight and
 * then by domain-id string order. This is the only rounding method
 * authorized for Exam Readiness v1 — independently verified to reproduce
 * 25/30/50/45 (current outline) and 27/30/50/43 (2026-11-03 outline)
 * against a 150-question blueprint.
 *
 * This is the shared fail-closed boundary for every Exam Readiness
 * operation, not merely a math helper: `checkExamSufficiency` and
 * `buildExamQuestionSet` both call through this function, so validating
 * `blueprint` here (rather than only at `blueprintRegistry.ts`'s JSON
 * load time) protects every caller — including one that constructs an
 * `ExamBlueprint` object directly, never touching the registry loader —
 * without duplicating validation logic at each call site.
 */
export function allocateBlueprintCounts(blueprint: ExamBlueprint): DomainQuestionAllocation[] {
  assertValidExamBlueprint(blueprint);

  const { questionCount, domainWeights } = blueprint;

  const raw = domainWeights.map((weight) => {
    const exact = (questionCount * weight.weightPercent) / 100;
    const base = Math.floor(exact);
    return { domainId: weight.domainId, weightPercent: weight.weightPercent, base, remainder: exact - base };
  });

  const baseTotal = raw.reduce((sum, entry) => sum + entry.base, 0);
  let leftover = questionCount - baseTotal;

  const byRemainderDesc = [...raw].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    if (b.weightPercent !== a.weightPercent) return b.weightPercent - a.weightPercent;
    return a.domainId.localeCompare(b.domainId);
  });

  const bonusDomainIds = new Set<string>();
  for (let i = 0; i < byRemainderDesc.length && leftover > 0; i++, leftover--) {
    // i < byRemainderDesc.length is guaranteed by the loop condition.
    bonusDomainIds.add(byRemainderDesc[i]!.domainId);
  }

  return raw.map((entry) => ({
    domainId: entry.domainId,
    questionCount: entry.base + (bonusDomainIds.has(entry.domainId) ? 1 : 0)
  }));
}

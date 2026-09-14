import { registry } from "../content/registry";
import type { ExamBlueprint } from "./types";

export interface BlueprintValidationIssue {
  blueprintId: string;
  message: string;
}

const MIN_DATE = "0000-01-01";
const MAX_DATE = "9999-12-31";
const CANONICAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Range comparison across this module is lexicographic string comparison
 * (`resolveCurrentBlueprint`, `dateRangesOverlap` below), which is only
 * correct authority if every date string is genuinely canonical
 * `YYYY-MM-DD` AND represents a real calendar date — `new Date(...)`
 * silently normalizes an impossible date (e.g. "2026-02-30" rolls forward
 * to March), which would make an already-invalid date look authoritative.
 * This validates the string itself, with no `Date` object involved and no
 * new dependency.
 */
function isValidCanonicalDate(value: string): boolean {
  if (!CANONICAL_DATE_RE.test(value)) return false;
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (month < 1 || month > 12) return false;
  const maxDay = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1]!;
  if (day < 1 || day > maxDay) return false;
  return true;
}

/**
 * Validates one blueprint's own internal invariants: weights sum to 100,
 * positive counts, no duplicate domain within it, canonical/real
 * effective dates with a sane range, every referenced domainId exists in
 * the content domain registry AND is a real exam domain
 * (`exam_domain === true`; excludes `domain.foundation` and any
 * nonexistent id), and — every real exam domain appears exactly once (no
 * omission, derived from the domain registry's own `exam_domain === true`
 * entries, never a hard-coded d1-d4 list, so a future fifth exam domain is
 * automatically required here with zero code changes).
 *
 * This is the ONE canonical single-blueprint validation boundary:
 * `validateExamBlueprintRegistry` (below) delegates to this for every
 * entry rather than duplicating these checks, and `apportionment.ts`'s
 * `allocateBlueprintCounts` — the shared choke point every other Exam
 * Readiness operation (`checkExamSufficiency`, `buildExamQuestionSet`)
 * calls through — enforces it via `assertValidExamBlueprint` so a
 * blueprint object constructed directly (never touching
 * `blueprintRegistry.ts`'s own load-time check) still fails closed.
 */
export function validateExamBlueprint(blueprint: ExamBlueprint): BlueprintValidationIssue[] {
  const issues: BlueprintValidationIssue[] = [];

  const totalWeight = blueprint.domainWeights.reduce((sum, w) => sum + w.weightPercent, 0);
  if (totalWeight !== 100) {
    issues.push({ blueprintId: blueprint.id, message: `domainWeights sum to ${totalWeight}, expected 100` });
  }
  if (!Number.isInteger(blueprint.questionCount) || blueprint.questionCount <= 0) {
    issues.push({ blueprintId: blueprint.id, message: `questionCount must be a positive integer, got ${blueprint.questionCount}` });
  }
  if (!Number.isInteger(blueprint.durationMinutes) || blueprint.durationMinutes <= 0) {
    issues.push({ blueprintId: blueprint.id, message: `durationMinutes must be a positive integer, got ${blueprint.durationMinutes}` });
  }

  const fromValid = blueprint.effectiveFrom === null || isValidCanonicalDate(blueprint.effectiveFrom);
  const toValid = blueprint.effectiveTo === null || isValidCanonicalDate(blueprint.effectiveTo);
  if (blueprint.effectiveFrom !== null && !fromValid) {
    issues.push({ blueprintId: blueprint.id, message: `effectiveFrom "${blueprint.effectiveFrom}" is not a valid canonical YYYY-MM-DD date` });
  }
  if (blueprint.effectiveTo !== null && !toValid) {
    issues.push({ blueprintId: blueprint.id, message: `effectiveTo "${blueprint.effectiveTo}" is not a valid canonical YYYY-MM-DD date` });
  }
  if (fromValid && toValid && blueprint.effectiveFrom !== null && blueprint.effectiveTo !== null && blueprint.effectiveFrom >= blueprint.effectiveTo) {
    issues.push({ blueprintId: blueprint.id, message: `effectiveFrom (${blueprint.effectiveFrom}) must be before effectiveTo (${blueprint.effectiveTo})` });
  }

  const seenDomainIds = new Set<string>();
  for (const weight of blueprint.domainWeights) {
    if (seenDomainIds.has(weight.domainId)) {
      issues.push({ blueprintId: blueprint.id, message: `duplicate domainId ${weight.domainId} in domainWeights` });
    }
    seenDomainIds.add(weight.domainId);

    if (weight.weightPercent <= 0) {
      issues.push({ blueprintId: blueprint.id, message: `weightPercent for ${weight.domainId} must be positive, got ${weight.weightPercent}` });
    }

    const domainEntry = registry.domains.get(weight.domainId);
    if (!domainEntry) {
      issues.push({ blueprintId: blueprint.id, message: `domainId ${weight.domainId} does not exist in the domain registry` });
    } else if (domainEntry.exam_domain !== true) {
      issues.push({ blueprintId: blueprint.id, message: `domainId ${weight.domainId} is not a real exam domain (exam_domain !== true)` });
    }
  }

  const requiredExamDomainIds = [...registry.domains.values()]
    .filter((domain) => domain.exam_domain === true)
    .map((domain) => domain.id as string);
  for (const requiredId of requiredExamDomainIds) {
    if (!seenDomainIds.has(requiredId)) {
      issues.push({ blueprintId: blueprint.id, message: `missing required exam domain ${requiredId} — every registered exam_domain must appear exactly once` });
    }
  }

  return issues;
}

/** Throws with every accumulated issue if `blueprint` fails `validateExamBlueprint` — the fail-closed form used at Exam Readiness's shared functional boundary (`allocateBlueprintCounts`). */
export function assertValidExamBlueprint(blueprint: ExamBlueprint): void {
  const issues = validateExamBlueprint(blueprint);
  if (issues.length > 0) {
    const detail = issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid ExamBlueprint "${blueprint.id}": ${detail}`);
  }
}

/**
 * Validates the exam blueprint registry as a whole: every entry's own
 * invariants (delegated to `validateExamBlueprint`, never duplicated here)
 * plus registry-level invariants that only make sense across the full set:
 * unique blueprint ids, no two entries' effective date ranges overlapping,
 * no gap between adjacent ranges once sorted, and at most one open-began
 * (`effectiveFrom: null`) and one open-ended (`effectiveTo: null`) entry —
 * together, these guarantee the registry forms one unbroken, unambiguous
 * timeline that `resolveCurrentBlueprint` can always resolve for any real
 * date, never a gap (no blueprint applies) or an overlap (more than one
 * applies).
 */
export function validateExamBlueprintRegistry(blueprints: readonly ExamBlueprint[]): BlueprintValidationIssue[] {
  const issues: BlueprintValidationIssue[] = [];

  for (const blueprint of blueprints) {
    issues.push(...validateExamBlueprint(blueprint));
  }

  const seenIds = new Set<string>();
  for (const blueprint of blueprints) {
    if (seenIds.has(blueprint.id)) {
      issues.push({ blueprintId: blueprint.id, message: `duplicate blueprint id ${blueprint.id} in the registry` });
    }
    seenIds.add(blueprint.id);
  }

  for (let i = 0; i < blueprints.length; i++) {
    for (let j = i + 1; j < blueprints.length; j++) {
      // Both indices are within bounds by the loop conditions.
      const a = blueprints[i]!;
      const b = blueprints[j]!;
      if (dateRangesOverlap(a, b)) {
        issues.push({
          blueprintId: a.id,
          message: `effective date range overlaps with ${b.id}`
        });
      }
    }
  }

  issues.push(...validateEffectiveDateCoverage(blueprints));

  return issues;
}

function dateRangesOverlap(a: ExamBlueprint, b: ExamBlueprint): boolean {
  const aFrom = a.effectiveFrom ?? MIN_DATE;
  const aTo = a.effectiveTo ?? MAX_DATE;
  const bFrom = b.effectiveFrom ?? MIN_DATE;
  const bTo = b.effectiveTo ?? MAX_DATE;
  // [aFrom, aTo) overlaps [bFrom, bTo) iff aFrom < bTo && bFrom < aTo.
  return aFrom < bTo && bFrom < aTo;
}

/**
 * Checks the registry forms one continuous timeline: at most one
 * open-began entry, at most one open-ended entry, and every pair of
 * adjacent entries (sorted by effective start) either overlaps (already
 * reported by the pairwise overlap check above) or connects EXACTLY
 * (`previous.effectiveTo === next.effectiveFrom`) — anything else is a
 * gap, where a real date would resolve to zero blueprints. This check is
 * purely structural over the registry's own dates; it never reads the
 * wall clock.
 */
function validateEffectiveDateCoverage(blueprints: readonly ExamBlueprint[]): BlueprintValidationIssue[] {
  const issues: BlueprintValidationIssue[] = [];
  if (blueprints.length === 0) return issues;

  const openBegin = blueprints.filter((b) => b.effectiveFrom === null);
  if (openBegin.length > 1) {
    const ids = openBegin.map((b) => b.id).join(", ");
    issues.push({ blueprintId: ids, message: `more than one blueprint has an open (null) effectiveFrom: ${ids}` });
  }

  const openEnd = blueprints.filter((b) => b.effectiveTo === null);
  if (openEnd.length > 1) {
    const ids = openEnd.map((b) => b.id).join(", ");
    issues.push({ blueprintId: ids, message: `more than one blueprint has an open (null) effectiveTo: ${ids}` });
  }

  const sorted = [...blueprints].sort((a, b) => {
    const aStart = a.effectiveFrom ?? MIN_DATE;
    const bStart = b.effectiveFrom ?? MIN_DATE;
    return aStart.localeCompare(bStart);
  });

  for (let i = 0; i < sorted.length - 1; i++) {
    const prev = sorted[i]!;
    const next = sorted[i + 1]!;
    if (dateRangesOverlap(prev, next)) continue; // already reported by the pairwise overlap check

    const connects = prev.effectiveTo !== null && next.effectiveFrom !== null && prev.effectiveTo === next.effectiveFrom;
    if (!connects) {
      issues.push({
        blueprintId: prev.id,
        message: `effective date range gap between ${prev.id} (ends ${prev.effectiveTo ?? "never"}) and ${next.id} (starts ${next.effectiveFrom ?? "the beginning of time"})`
      });
    }
  }

  return issues;
}

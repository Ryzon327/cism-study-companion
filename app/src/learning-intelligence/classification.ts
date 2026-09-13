/**
 * LI-2 §9-§14, §19: the deterministic state machine. Precedence, per the
 * Architect's explicit LI-2 direction (§14): minimum evidence first,
 * then STRONGER EVIDENCE against its own last-5 window, then NEEDS REVIEW
 * against the general last-6 recent-primary window, otherwise DEVELOPING —
 * so genuine recent improvement can overcome older misses, rather than a
 * stale miss permanently blocking a later strong streak.
 *
 * All "recent*" EvidenceSummary fields (recentPrimaryCount through
 * lowConfidenceCorrectCount) are scoped to the general recent-primary
 * window (last 6, §9) — the same window NEEDS REVIEW and DEVELOPING
 * reason codes are evaluated against. All other EvidenceSummary fields
 * (primaryAttemptCount, distinctQuestionCount, successfulRepairCount,
 * failedRepairCount, recallCorrectCount, recallIncorrectCount,
 * lastAttemptAt) are all-time aggregates for the group, per §9's "retain
 * full aggregate evidence where useful."
 */
import type { QuestionAttemptEvent } from "../learning-history";
import { recentWindow, distinctQuestionCount } from "./windows";
import { computeTrend } from "./trend";
import type { RawGroup } from "./grouping";
import type { RepairIndex } from "./repairLinkage";
import type { EvidenceGroup, EvidenceSummary, GroupState, ReasonCode } from "./types";

const GENERAL_WINDOW_SIZE = 6;
const GENERAL_WINDOW_MIN_ATTEMPTS = 3;
const GENERAL_WINDOW_MIN_DISTINCT = 2;

const STRONGER_WINDOW_SIZE = 5;
const STRONGER_MIN_DISTINCT = 3;
const STRONGER_MIN_CORRECT = 4;

function evaluateStrongerEvidence(allPrimary: readonly QuestionAttemptEvent[], repairIndex: RepairIndex): boolean {
  const window5 = recentWindow(allPrimary, STRONGER_WINDOW_SIZE);
  if (window5.length < STRONGER_WINDOW_SIZE) return false; // needs at least 5 total, per the binding floor (§11)
  if (distinctQuestionCount(window5) < STRONGER_MIN_DISTINCT) return false;
  if (window5.filter((a) => a.correct).length < STRONGER_MIN_CORRECT) return false;
  if (window5.some((a) => !a.correct && a.confidence === "sure")) return false;
  if (window5.some((a) => !a.correct && repairIndex.outcomeForAttempt(a.attemptId) === "REPAIR_STILL_MISSED")) return false;
  return true;
}

function evaluateNeedsReview(window6: readonly QuestionAttemptEvent[], repairIndex: RepairIndex): ReasonCode[] {
  const reasonCodes: ReasonCode[] = [];
  const incorrect = window6.filter((a) => !a.correct);

  // A. repeated misses across distinct questions.
  if (incorrect.length >= 2 && distinctQuestionCount(incorrect) >= 2) {
    reasonCodes.push("REPEATED_MISSES");
  }

  // B. confident (Sure) repeated misses across distinct questions.
  const sureIncorrect = incorrect.filter((a) => a.confidence === "sure");
  if (sureIncorrect.length >= 2 && distinctQuestionCount(sureIncorrect) >= 2) {
    reasonCodes.push("REPEATED_SURE_MISSES");
  }

  // C. a failed Repair plus at least one OTHER incorrect primary attempt in
  // this same window — never a single isolated failed Repair alone.
  const hasFailedRepairAmongIncorrect = incorrect.some((a) => repairIndex.outcomeForAttempt(a.attemptId) === "REPAIR_STILL_MISSED");
  if (hasFailedRepairAmongIncorrect && incorrect.length >= 2) {
    reasonCodes.push("REPAIR_STILL_MISSED");
  }

  return reasonCodes;
}

function buildEvidenceSummary(raw: RawGroup, window6: readonly QuestionAttemptEvent[], repairIndex: RepairIndex): EvidenceSummary {
  const allPrimary = raw.primaryAttempts;
  const recentCorrectCount = window6.filter((a) => a.correct).length;

  let successfulRepairCount = 0;
  let failedRepairCount = 0;
  for (const attempt of allPrimary) {
    if (attempt.correct) continue;
    const outcome = repairIndex.outcomeForAttempt(attempt.attemptId);
    if (outcome === "CORRECTED_ON_REPAIR") successfulRepairCount++;
    else if (outcome === "REPAIR_STILL_MISSED") failedRepairCount++;
  }

  const recallCorrectCount = raw.recallAttempts.filter((a) => a.correct).length;

  const recentIncorrect = window6.filter((a) => !a.correct);
  const unresolvedRecentIncorrectCount = recentIncorrect.filter(
    (a) => repairIndex.outcomeForAttempt(a.attemptId) !== "CORRECTED_ON_REPAIR"
  ).length;
  const lowConfidenceCorrectAttempts = window6.filter((a) => a.correct && (a.confidence === "not-sure" || a.confidence === "guessing"));

  return {
    primaryAttemptCount: allPrimary.length,
    distinctQuestionCount: distinctQuestionCount(allPrimary),
    recentPrimaryCount: window6.length,
    recentCorrectCount,
    recentIncorrectCount: window6.length - recentCorrectCount,
    sureIncorrectCount: window6.filter((a) => !a.correct && a.confidence === "sure").length,
    lowConfidenceCorrectCount: lowConfidenceCorrectAttempts.length,
    lowConfidenceCorrectDistinctQuestionCount: distinctQuestionCount(lowConfidenceCorrectAttempts),
    unresolvedRecentIncorrectCount,
    successfulRepairCount,
    failedRepairCount,
    recallCorrectCount,
    recallIncorrectCount: raw.recallAttempts.length - recallCorrectCount,
    lastAttemptAt: allPrimary.length ? Math.max(...allPrimary.map((a) => a.occurredAt)) : null
  };
}

export function classifyGroup(raw: RawGroup, repairIndex: RepairIndex): EvidenceGroup {
  const allPrimary = raw.primaryAttempts;
  const window6 = recentWindow(allPrimary, GENERAL_WINDOW_SIZE);
  const reasonCodes: ReasonCode[] = [];
  let state: GroupState;

  const minimumEvidenceMet = window6.length >= GENERAL_WINDOW_MIN_ATTEMPTS && distinctQuestionCount(window6) >= GENERAL_WINDOW_MIN_DISTINCT;

  if (!minimumEvidenceMet) {
    state = "NOT_ENOUGH_EVIDENCE";
    reasonCodes.push(window6.length < GENERAL_WINDOW_MIN_ATTEMPTS ? "INSUFFICIENT_ATTEMPTS" : "INSUFFICIENT_BREADTH");
  } else if (evaluateStrongerEvidence(allPrimary, repairIndex)) {
    state = "STRONGER_EVIDENCE";
    reasonCodes.push("RECENT_STRONG_PERFORMANCE");
  } else {
    const needsReviewReasons = evaluateNeedsReview(window6, repairIndex);
    if (needsReviewReasons.length > 0) {
      state = "NEEDS_REVIEW";
      reasonCodes.push(...needsReviewReasons);
    } else {
      state = "DEVELOPING";
      if (window6.some((a) => !a.correct && repairIndex.outcomeForAttempt(a.attemptId) === "CORRECTED_ON_REPAIR")) {
        reasonCodes.push("SUCCESSFUL_CORRECTION");
      }
      if (window6.some((a) => a.correct && (a.confidence === "not-sure" || a.confidence === "guessing"))) {
        reasonCodes.push("LOW_CONFIDENCE_CORRECT");
      }
    }
  }

  const trend = computeTrend(allPrimary);
  if (trend === "IMPROVING") reasonCodes.push("IMPROVING_RECENTLY");

  return {
    identity: raw.identity,
    state,
    reasonCodes,
    trend,
    evidence: buildEvidenceSummary(raw, window6, repairIndex)
  };
}

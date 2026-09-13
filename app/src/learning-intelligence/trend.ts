/**
 * LI-2 §18: a coarse, longitudinal trend — deliberately not a statistical
 * model, and never rendered with fake decimal precision. Requires at
 * least 6 eligible primary attempts total; below that, the trend is
 * genuinely unknown (`null`), never guessed at.
 */
import type { QuestionAttemptEvent } from "../learning-history";
import { recentWindow } from "./windows";
import type { TrendState } from "./types";

const TREND_MINIMUM_ATTEMPTS = 6;
const TREND_HALF_SIZE = 3;
const TREND_SHIFT_THRESHOLD = 2;

export function computeTrend(allPrimaryAttempts: readonly QuestionAttemptEvent[]): TrendState {
  if (allPrimaryAttempts.length < TREND_MINIMUM_ATTEMPTS) return null;

  const mostRecentSix = recentWindow(allPrimaryAttempts, TREND_MINIMUM_ATTEMPTS); // oldest-first, length 6
  const previous = mostRecentSix.slice(0, TREND_HALF_SIZE);
  const recent = mostRecentSix.slice(TREND_HALF_SIZE, TREND_MINIMUM_ATTEMPTS);

  const previousCorrect = previous.filter((a) => a.correct).length;
  const recentCorrect = recent.filter((a) => a.correct).length;

  if (recentCorrect - previousCorrect >= TREND_SHIFT_THRESHOLD) return "IMPROVING";
  if (previousCorrect - recentCorrect >= TREND_SHIFT_THRESHOLD) return "NEEDS_REVIEW";
  return "MIXED_DEVELOPING";
}

import { production, type ProductionQuestion } from "../content/registry";
import { emptyHistory, selectFamilyBalancedIds, type ExposureHistory } from "../content/selection";
import { allocateBlueprintCounts } from "./apportionment";
import { checkExamSufficiency } from "./sufficiency";
import { interleaveDomainSelections, type DomainSelection } from "./interleaveDomainSelections";
import type { ExamBlueprint } from "./types";

export interface BuildExamQuestionSetOptions {
  now?: number;
  /**
   * An exam-readiness-only exposure history from a prior call (e.g. an
   * earlier full-length attempt), threaded across every domain in this
   * build. Deliberately never `exposureStore.ts`'s shared Practice history
   * — Exam Readiness v1 must not read from or write to it, so its own
   * question selection can never invisibly suppress, or be suppressed by,
   * ordinary Practice's unseen-question preference. Omit for a first
   * build; defaults to an empty history.
   */
  priorExamQuestionUsage?: ExposureHistory;
}

export interface ExamQuestionSetResult {
  blueprintId: string;
  domainAllocations: { domainId: string; questionCount: number }[];
  questionIds: string[];
  history: ExposureHistory;
}

function eligibleExamQuestionsForDomain(domainId: string): ProductionQuestion[] {
  return [...production.questions.values()].filter((question) => question.active && question.domain === domainId);
}

/**
 * Builds one frozen exam question-id set for `blueprint`: per-domain
 * apportioned counts (`allocateBlueprintCounts`), each domain's pool drawn
 * via the same pure family-balanced selection Practice uses
 * (`content/selection.ts`'s `selectFamilyBalancedIds`) — never the shared
 * Practice `exposureStore`. Fails closed: throws if the blueprint's own
 * sufficiency check fails, rather than silently returning a short set —
 * and, transitively via `checkExamSufficiency` -> `allocateBlueprintCounts`,
 * also fails closed on an invalid `blueprint` object itself (bad weights,
 * an unknown or non-exam domainId), even one constructed directly rather
 * than loaded from the registry.
 *
 * The returned `questionIds` are NOT domain-blocked (never "all Domain 1,
 * then all Domain 2, ..."): each domain is selected independently (exact
 * allocation, family-aware, no duplicates, exam-only history) exactly as
 * before, and only the final combined ORDER is deterministically
 * interleaved across domains (`interleaveDomainSelections`) — this never
 * changes which ids were selected, a domain's allocated count, or borrows
 * across domains.
 */
export function buildExamQuestionSet(blueprint: ExamBlueprint, options: BuildExamQuestionSetOptions = {}): ExamQuestionSetResult {
  const sufficiency = checkExamSufficiency(blueprint);
  if (!sufficiency.sufficient) {
    const shortfalls = sufficiency.domains
      .filter((domain) => !domain.sufficient)
      .map((domain) => `${domain.domainId} short by ${domain.shortfall}`)
      .join(", ");
    throw new Error(`buildExamQuestionSet: insufficient content for blueprint ${blueprint.id} (${shortfalls})`);
  }

  const now = options.now ?? Date.now();
  let workingHistory: ExposureHistory = options.priorExamQuestionUsage ?? emptyHistory();

  const allocations = allocateBlueprintCounts(blueprint);
  const domainSelections: DomainSelection[] = [];

  for (const allocation of allocations) {
    const pool = eligibleExamQuestionsForDomain(allocation.domainId);
    const { selectedIds, history } = selectFamilyBalancedIds(pool, allocation.questionCount, workingHistory, now);
    if (selectedIds.length < allocation.questionCount) {
      throw new Error(
        `buildExamQuestionSet: domain ${allocation.domainId} selected only ${selectedIds.length} of ${allocation.questionCount} required questions despite passing sufficiency check`
      );
    }
    domainSelections.push({ domainId: allocation.domainId, ids: selectedIds });
    workingHistory = history;
  }

  return {
    blueprintId: blueprint.id,
    domainAllocations: allocations,
    questionIds: interleaveDomainSelections(domainSelections),
    history: workingHistory
  };
}

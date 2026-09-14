import { production, registry } from "../content/registry";
import { allocateBlueprintCounts } from "./apportionment";
import type { ExamBlueprint, ExamSufficiencyDomainStatus, ExamSufficiencyResult } from "./types";

/**
 * Checks whether current production content can actually fill a
 * blueprint's per-domain apportioned counts. A domain's available count is
 * every active production question whose `domain` matches — but only when
 * that domain's own registry entry (`schema/registry/domains.json`) has
 * `exam_domain: true`; a blueprint that somehow referenced Foundation (or
 * any other non-exam domain) would otherwise silently report content that
 * can never legitimately count toward an exam question set.
 *
 * Fails closed on an invalid `blueprint` (bad weights, an unknown or
 * non-exam domainId, etc.) via `allocateBlueprintCounts`'s own
 * `assertValidExamBlueprint` guard below — this function does not
 * duplicate that check itself, since it always calls through that shared
 * boundary first.
 */
export function checkExamSufficiency(blueprint: ExamBlueprint): ExamSufficiencyResult {
  const allocations = allocateBlueprintCounts(blueprint);

  const domains: ExamSufficiencyDomainStatus[] = allocations.map((allocation) => {
    const domainEntry = registry.domains.get(allocation.domainId);
    const isExamDomain = domainEntry?.exam_domain === true;

    const available = isExamDomain
      ? [...production.questions.values()].filter((question) => question.active && question.domain === allocation.domainId).length
      : 0;

    const shortfall = Math.max(0, allocation.questionCount - available);

    return {
      domainId: allocation.domainId,
      required: allocation.questionCount,
      available,
      shortfall,
      sufficient: shortfall === 0
    };
  });

  return {
    blueprintId: blueprint.id,
    sufficient: domains.every((domain) => domain.sufficient),
    domains
  };
}

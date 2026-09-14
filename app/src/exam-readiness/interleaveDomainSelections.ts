export interface DomainSelection {
  domainId: string;
  ids: readonly string[];
}

/**
 * Deterministically interleaves several domains' already-selected question
 * ids into one combined order, proportional to each domain's own target
 * count — so a real exam order never runs "all Domain 1, then all Domain
 * 2, ..." (which would implicitly tell the learner which domain is being
 * tested at any moment, defeating a realistic full simulation).
 *
 * Algorithm: deterministic weighted-deficit / proportional interleaving
 * (a stable, single-pass variant of fair/weighted round-robin scheduling).
 * At each output position `p` (1-indexed) out of `total`, every
 * not-yet-exhausted domain has an "ideal" cumulative share at that point —
 * `domain.target * p / total` — and we emit next from whichever domain is
 * currently furthest BEHIND that ideal (largest `ideal - emittedSoFar`).
 * Ties are broken by ascending domainId (stable, not random). This never
 * changes which ids belong to which domain, never changes a domain's
 * count, and never borrows across domains — it only reorders the
 * concatenated output. Pure: no randomness, no wall-clock reads, no
 * storage access; identical inputs always produce the identical order.
 */
export function interleaveDomainSelections(domainSelections: readonly DomainSelection[]): string[] {
  const domains = [...domainSelections]
    .filter((selection) => selection.ids.length > 0)
    .sort((a, b) => a.domainId.localeCompare(b.domainId));

  const totalCount = domains.reduce((sum, selection) => sum + selection.ids.length, 0);
  if (totalCount === 0) return [];

  const targets = new Map<string, number>(domains.map((selection) => [selection.domainId, selection.ids.length]));
  const cursors = new Map<string, number>(domains.map((selection) => [selection.domainId, 0]));
  const idsByDomain = new Map<string, readonly string[]>(domains.map((selection) => [selection.domainId, selection.ids]));

  const output: string[] = [];
  for (let position = 1; position <= totalCount; position++) {
    let chosenDomainId: string | undefined;
    let largestDeficit = -Infinity;

    // `domains` is already sorted ascending by domainId, and we only
    // replace `chosenDomainId` on a STRICTLY larger deficit — so the
    // first (lowest-id) domain among any tied-largest-deficit set wins,
    // giving a stable, deterministic tie-break with no extra logic.
    for (const selection of domains) {
      const target = targets.get(selection.domainId)!;
      const emitted = cursors.get(selection.domainId)!;
      if (emitted >= target) continue; // this domain's selection is fully emitted

      const ideal = (target * position) / totalCount;
      const deficit = ideal - emitted;
      if (deficit > largestDeficit) {
        largestDeficit = deficit;
        chosenDomainId = selection.domainId;
      }
    }

    // Guaranteed defined: with position <= totalCount, at least one domain
    // still has emitted < target (sum of targets == totalCount).
    const domainId = chosenDomainId!;
    const nextIndex = cursors.get(domainId)!;
    output.push(idsByDomain.get(domainId)![nextIndex]!);
    cursors.set(domainId, nextIndex + 1);
  }

  return output;
}

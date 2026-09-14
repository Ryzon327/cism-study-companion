import { describe, it, expect } from "vitest";
import { interleaveDomainSelections, type DomainSelection } from "../../../../app/src/exam-readiness/interleaveDomainSelections";

/**
 * ER-1 Architect correction (MAJOR #3): a real exam simulation must never
 * present "all Domain 1, then all Domain 2, ..." — that implicitly tells
 * the learner which domain is being tested. `interleaveDomainSelections`
 * is a pure, deterministic weighted-deficit interleaving of already-
 * selected per-domain id arrays: it only reorders the combined output, and
 * never changes which ids belong to which domain or a domain's count.
 */

function longestRunLength(ids: readonly string[], domainOf: (id: string) => string): number {
  let longest = 0;
  let current = 0;
  let lastDomain: string | undefined;
  for (const id of ids) {
    const domain = domainOf(id);
    if (domain === lastDomain) {
      current += 1;
    } else {
      current = 1;
      lastDomain = domain;
    }
    longest = Math.max(longest, current);
  }
  return longest;
}

describe("interleaveDomainSelections — deterministic weighted-deficit interleaving", () => {
  it("produces a genuinely mixed-domain order for the real 25/30/50/45 shape, never one large all-one-domain block", () => {
    const domainOf = (id: string) => id.slice(0, id.indexOf(".", id.indexOf(".") + 1));
    const make = (domainId: string, count: number): DomainSelection => ({
      domainId,
      ids: Array.from({ length: count }, (_, i) => `${domainId}.q${i}`)
    });
    const selections = [make("domain.d1", 25), make("domain.d2", 30), make("domain.d3", 50), make("domain.d4", 45)];

    const interleaved = interleaveDomainSelections(selections);
    expect(interleaved).toHaveLength(150);

    // A domain-blocked order would produce one run of ~50 (domain.d3, the
    // largest). Proportional interleaving must keep every run far shorter.
    const longestRun = longestRunLength(interleaved, domainOf);
    expect(longestRun).toBeLessThan(10);
  });

  it("preserves the exact per-domain totals after interleaving", () => {
    const selections: DomainSelection[] = [
      { domainId: "domain.d1", ids: ["d1.a", "d1.b", "d1.c"] },
      { domainId: "domain.d2", ids: ["d2.a"] },
      { domainId: "domain.d3", ids: ["d3.a", "d3.b"] }
    ];
    const interleaved = interleaveDomainSelections(selections);
    const countByDomain = { d1: 0, d2: 0, d3: 0 };
    for (const id of interleaved) {
      if (id.startsWith("d1.")) countByDomain.d1 += 1;
      else if (id.startsWith("d2.")) countByDomain.d2 += 1;
      else if (id.startsWith("d3.")) countByDomain.d3 += 1;
    }
    expect(countByDomain).toEqual({ d1: 3, d2: 1, d3: 2 });
  });

  it("is deterministic: identical inputs always produce the identical order", () => {
    const selections: DomainSelection[] = [
      { domainId: "domain.d1", ids: ["d1.a", "d1.b", "d1.c"] },
      { domainId: "domain.d2", ids: ["d2.a", "d2.b"] },
      { domainId: "domain.d3", ids: ["d3.a"] }
    ];
    const a = interleaveDomainSelections(selections);
    const b = interleaveDomainSelections(selections);
    expect(a).toEqual(b);
  });

  it("never loses or duplicates an id — output is exactly the input ids, once each", () => {
    const selections: DomainSelection[] = [
      { domainId: "domain.d1", ids: ["d1.a", "d1.b", "d1.c", "d1.d"] },
      { domainId: "domain.d2", ids: ["d2.a", "d2.b"] },
      { domainId: "domain.d4", ids: ["d4.a", "d4.b", "d4.c"] }
    ];
    const interleaved = interleaveDomainSelections(selections);
    const expectedIds = selections.flatMap((s) => s.ids);
    expect([...interleaved].sort()).toEqual([...expectedIds].sort());
    expect(new Set(interleaved).size).toBe(interleaved.length);
  });

  it("terminates correctly and stays deterministic for a highly uneven allocation (one dominant domain, several near-singletons)", () => {
    const selections: DomainSelection[] = [
      { domainId: "domain.d1", ids: Array.from({ length: 1 }, (_, i) => `d1.${i}`) },
      { domainId: "domain.d2", ids: Array.from({ length: 1 }, (_, i) => `d2.${i}`) },
      { domainId: "domain.d3", ids: Array.from({ length: 1 }, (_, i) => `d3.${i}`) },
      { domainId: "domain.d4", ids: Array.from({ length: 147 }, (_, i) => `d4.${i}`) }
    ];
    const interleaved = interleaveDomainSelections(selections);
    expect(interleaved).toHaveLength(150);
    expect(new Set(interleaved).size).toBe(150);
    const b = interleaveDomainSelections(selections);
    expect(interleaved).toEqual(b);
  });

  it("a single-domain input is returned in its original order, unchanged", () => {
    const selections: DomainSelection[] = [{ domainId: "domain.d1", ids: ["d1.a", "d1.b", "d1.c"] }];
    expect(interleaveDomainSelections(selections)).toEqual(["d1.a", "d1.b", "d1.c"]);
  });

  it("returns an empty array for no domains, or domains with entirely empty id arrays", () => {
    expect(interleaveDomainSelections([])).toEqual([]);
    expect(interleaveDomainSelections([{ domainId: "domain.d1", ids: [] }])).toEqual([]);
  });

  it("ties are broken deterministically by ascending domainId (lowest id emitted first)", () => {
    // Equal target counts (2 each) across three domains -> at position 1,
    // every domain's deficit is identical (ideal = target*1/total, same
    // ratio for all three since targets are equal); domain.a must win.
    const selections: DomainSelection[] = [
      { domainId: "domain.c", ids: ["c.1", "c.2"] },
      { domainId: "domain.a", ids: ["a.1", "a.2"] },
      { domainId: "domain.b", ids: ["b.1", "b.2"] }
    ];
    const interleaved = interleaveDomainSelections(selections);
    expect(interleaved[0]).toBe("a.1");
  });
});

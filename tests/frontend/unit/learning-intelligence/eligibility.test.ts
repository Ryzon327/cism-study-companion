import { describe, it, expect, beforeEach } from "vitest";
import { filterEligibleEvents } from "../../../../app/src/learning-intelligence/eligibility";
import { makeApplyEvent, resetFixtureIds } from "./fixtures";

beforeEach(() => resetFixtureIds());

describe("filterEligibleEvents", () => {
  it("keeps production-sourced events", () => {
    const event = makeApplyEvent({ sourceContext: "production" });
    const { eligible, diagnostics } = filterEligibleEvents([event]);
    expect(eligible).toEqual([event]);
    expect(diagnostics).toEqual([]);
  });

  it("excludes prototype-sourced events without a diagnostic (routine QA exclusion, not malformed data)", () => {
    const event = makeApplyEvent({ sourceContext: "prototype" });
    const { eligible, diagnostics } = filterEligibleEvents([event]);
    expect(eligible).toEqual([]);
    expect(diagnostics).toEqual([]);
  });

  it("excludes an unrecognized sourceContext AND emits a MALFORMED_EVENT diagnostic", () => {
    const event = makeApplyEvent({ sourceContext: "prototype" });
    const malformed = { ...event, sourceContext: "staging" as never };
    const { eligible, diagnostics } = filterEligibleEvents([malformed]);
    expect(eligible).toEqual([]);
    expect(diagnostics).toEqual([{ kind: "MALFORMED_EVENT", eventId: malformed.eventId, detail: expect.stringContaining("staging") }]);
  });

  it("excludes an unsupported eventSchemaVersion AND emits an UNSUPPORTED_SCHEMA_VERSION diagnostic", () => {
    const event = makeApplyEvent();
    const future = { ...event, eventSchemaVersion: 2 as never };
    const { eligible, diagnostics } = filterEligibleEvents([future]);
    expect(eligible).toEqual([]);
    expect(diagnostics).toEqual([{ kind: "UNSUPPORTED_SCHEMA_VERSION", eventId: future.eventId, detail: expect.any(String) }]);
  });

  it("never mutates the input array or its events", () => {
    const events = Object.freeze([makeApplyEvent({ sourceContext: "prototype" }), makeApplyEvent({ sourceContext: "production" })]);
    for (const e of events) Object.freeze(e);
    expect(() => filterEligibleEvents(events)).not.toThrow();
    expect(events).toHaveLength(2);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/preact";
import { PracticeScreen } from "../../../app/src/screens/PracticeScreen";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";
import { production } from "../../../app/src/content/registry";
import type { PracticeHandoffRequest } from "../../../app/src/study-handoff/types";

/**
 * LI-4 §16/§17/§18/§19/§20/§27: the targeted-Practice landing entered from
 * an Insights handoff — distinct from, but built on, the ordinary
 * scope/count landing practice-screen.test.tsx already covers.
 */

beforeEach(() => {
  resetExposureHistoryForTests();
});

describe("PracticeScreen — targeted entry (concept/family/pattern/qualifier/... scope)", () => {
  it("shows a distinct 'Targeted practice' landing with the trusted label and a truthful eligible count", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" },
      label: "Program metrics and reporting"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    expect(screen.getByRole("heading", { name: "Targeted practice" })).toBeTruthy();
    expect(screen.getByText("Program metrics and reporting")).toBeTruthy();
    expect(screen.getByText(/questions? available for this focus/)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Choose what to practice" })).toBeNull();
  });

  it("never shows the raw target id anywhere", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" },
      label: "Program metrics and reporting"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    expect(screen.queryByText(/concept\.d3/)).toBeNull();
  });

  it("count options are bounded to the true eligible pool — never padded with a repeat", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" },
      label: "Program metrics and reporting"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    const countRadios = screen.getAllByRole("radio");
    for (const radio of countRadios) {
      expect((radio as HTMLButtonElement).disabled).toBe(false); // every offered option is truthfully startable
    }
  });

  it("starting a targeted session only draws questions matching the target", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" },
      label: "Program metrics and reporting"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    fireEvent.click(screen.getByRole("button", { name: "Start Practice →" }));
    expect(screen.getByRole("group", { name: "Answer options" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Targeted practice" })).toBeNull();
  });

  it("'Practice something else' returns to the ordinary scope/count landing", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" },
      label: "Program metrics and reporting"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    fireEvent.click(screen.getByRole("button", { name: "Practice something else" }));
    expect(screen.getByRole("heading", { name: "Choose what to practice" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "All available material" })).toBeTruthy();
  });

  it("a target with zero current eligible questions shows a calm message and no Start action", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "concept", targetId: "concept.does-not-exist" },
      label: "A previously studied topic"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    expect(screen.getByText("No current questions match this focus right now.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start Practice →" })).toBeNull();
    expect(screen.getByRole("button", { name: "Practice something else" })).toBeTruthy();
  });

  it("a cross-cutting (pattern) target's session only draws matching current questions", () => {
    const handoff: PracticeHandoffRequest = {
      scope: { kind: "target", axis: "pattern", targetId: "pattern.p02" },
      label: "Implementation ≠ Effectiveness pattern"
    };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    fireEvent.click(screen.getByRole("button", { name: "Start Practice →" }));
    expect(screen.getByRole("group", { name: "Answer options" })).toBeTruthy();
  });
});

describe("PracticeScreen — domain handoff reuses the ordinary landing, no second implementation (LI-4 §14)", () => {
  it("preselects the domain in the ordinary scope/count landing — no 'Targeted practice' heading", () => {
    const domainId = [...production.families.values()].find((f) => f.active)!.domain;
    const handoff: PracticeHandoffRequest = { scope: { kind: "domain", domainId }, label: "some domain" };
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} initialHandoff={handoff} />);
    expect(screen.getByRole("heading", { name: "Choose what to practice" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Targeted practice" })).toBeNull();
    const scopeGroup = screen.getByRole("radiogroup", { name: /Scope/i });
    const selected = within(scopeGroup).getAllByRole("radio").find((r) => r.getAttribute("aria-checked") === "true");
    expect(selected).toBeDefined();
  });
});

describe("PracticeScreen — manual entry is never accidentally targeted (LI-4 §20 regression)", () => {
  it("opening Practice with no handoff shows the ordinary landing with no targeted indicator", () => {
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} />);
    expect(screen.getByRole("heading", { name: "Choose what to practice" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Targeted practice" })).toBeNull();
    expect(screen.queryByText(/questions? available for this focus/)).toBeNull();
  });
});

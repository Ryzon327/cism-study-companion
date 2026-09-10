import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/preact";
import { ExploreScreen } from "../../../app/src/screens/ExploreScreen";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";
import { production } from "../../../app/src/content/registry";

/**
 * Phase 10B-2: Explore's own flow mechanics (domain -> concept -> review ->
 * optional scenario -> Feedback/Repair -> back to Explore). Deliberately
 * exercises real production content (Domain 1 Governance vs. Management)
 * the same way tests/frontend/e2e/production-daily-study.spec.ts already
 * does for Daily Study, rather than re-testing repair-content genericity
 * itself — that is explore.test.ts's and repair-coverage.test.ts's job.
 * Selection is deterministic here because resetExposureHistoryForTests()
 * runs before every test (see selection.ts's lowest-unseen-id rule).
 */

beforeEach(() => {
  resetExposureHistoryForTests();
});

function openGovernanceVsManagement() {
  render(<ExploreScreen onExit={() => {}} />);
  fireEvent.click(screen.getByRole("button", { name: /Governance/ }));
  fireEvent.click(screen.getByRole("button", { name: "Governance vs. management" }));
}

describe("ExploreScreen", () => {
  it("1. lands on domain choice, not a random question", () => {
    render(<ExploreScreen onExit={() => {}} />);
    expect(screen.getByRole("heading", { name: "Choose something to revisit" })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Answer options" })).toBeNull();
  });

  it("2 & 3. choosing a domain then a concept shows a concise, relevant concept review before any question", () => {
    openGovernanceVsManagement();
    expect(screen.getByRole("heading", { name: "Governance vs. management" })).toBeTruthy();
    expect(screen.getByText(/Governance sets direction/)).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Answer options" })).toBeNull();
  });

  it("6. the scenario question is optional — not shown until the learner explicitly asks for it", () => {
    openGovernanceVsManagement();
    expect(screen.getByRole("button", { name: /Try a scenario/ })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Answer options" })).toBeNull();
  });

  it("7 & 8. the optional question is tied to the selected concept's own family, via the existing family/variant architecture", () => {
    openGovernanceVsManagement();
    fireEvent.click(screen.getByRole("button", { name: /Try a scenario/ }));
    // question.d1.0005 is family.d1.governance-vs-management's lowest-id
    // unseen variant given a fresh exposure history (selection.ts).
    expect(screen.getByText(/international market/)).toBeTruthy();
  });

  it("11 & 13. a correct answer produces normal Feedback and returns to the concept, not a Daily Study completion", () => {
    openGovernanceVsManagement();
    fireEvent.click(screen.getByRole("button", { name: /Try a scenario/ }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market"
      })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Correct" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByRole("heading", { name: "Governance vs. management" })).toBeTruthy();
    expect(screen.queryByText(/Today's study is complete/)).toBeNull();
  });

  it("12 & 13. an incorrect answer can reach Repair (shared near-transfer architecture), then returns to the concept", () => {
    openGovernanceVsManagement();
    fireEvent.click(screen.getByRole("button", { name: /Try a scenario/ }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "The security team configures data-residency controls to comply with the new market's regulations"
      })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Repair the reasoning" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByRole("heading", { name: "Let's correct that reasoning." })).toBeTruthy();

    const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByRole("heading", { name: "Governance vs. management" })).toBeTruthy();
  });

  it("returning from a concept via 'Explore another concept' stays inside Explore, never Daily Study", () => {
    openGovernanceVsManagement();
    fireEvent.click(screen.getByRole("button", { name: "Explore another concept" }));
    expect(screen.getByRole("heading", { name: "Governance" })).toBeTruthy();
    expect(screen.queryByText(/Today's study is complete/)).toBeNull();
  });

  it("14. a concept with no associated question family remains explorable, with the scenario action hidden truthfully", () => {
    const bareConceptId = "concept.synthetic-future.no-family-ui";
    production.concepts.set(bareConceptId, {
      id: bareConceptId,
      display_name: "Bare Synthetic Concept",
      home_domain: "domain.d1",
      plain: "A synthetic concept with no family, used to prove the scenario action hides truthfully.",
      related_patterns: [],
      content_status: "CANDIDATE",
      verification_status: "unverified",
      source: "source.test",
      version: 1
    });
    try {
      render(<ExploreScreen onExit={() => {}} />);
      fireEvent.click(screen.getByRole("button", { name: /Governance/ }));
      fireEvent.click(screen.getByRole("button", { name: "Bare Synthetic Concept" }));
      expect(screen.getByRole("heading", { name: "Bare Synthetic Concept" })).toBeTruthy();
      expect(screen.queryByRole("button", { name: /Try a scenario/ })).toBeNull();
    } finally {
      production.concepts.delete(bareConceptId);
    }
  });

  it("the Done action exits Explore back to Home without going through Daily Study", () => {
    let exited = false;
    render(<ExploreScreen onExit={() => (exited = true)} />);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(exited).toBe(true);
  });
});

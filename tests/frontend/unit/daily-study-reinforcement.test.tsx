import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/preact";
import { DailyStudySession } from "../../../app/src/session/DailyStudySession";
import { productionContentSource, setTodaysLessonIdForReview } from "../../../app/src/content/productionContentSource";
import { prototypeContentSource } from "../../../app/src/data/prototypeContentSource";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

/**
 * Phase 10B-4: Optional Reinforcement's contextual entry from Daily Study
 * Completion, and its own short bounded flow. Exercises real production
 * content (D1-U1, Governance vs. Management) with a fresh exposure history
 * so selection is fully deterministic (selection.ts's lowest-unseen-id
 * rule): Recall resolves question.foundation.0001, Apply resolves
 * question.d1.0005, and — answering Apply incorrectly — Reinforcement then
 * deterministically resolves question.d1.0006, question.foundation.0002,
 * question.d1.0007 in that order.
 */

beforeEach(() => {
  resetExposureHistoryForTests();
  setTodaysLessonIdForReview("lesson.d1.governance-vs-management");
});

function runToCompletion(applyOptionText: string) {
  render(<DailyStudySession contentSource={productionContentSource} onDone={() => {}} onExploreConcept={() => {}} />);
  // Recall
  fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
  // Learn
  fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
  // Apply
  fireEvent.click(screen.getByRole("button", { name: applyOptionText }));
  fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
  fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
}

function continueThroughFeedbackAndRepairIfAny() {
  fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
  const repairGroup = screen.queryByRole("group", { name: "Repair answer options" });
  if (repairGroup) {
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
  }
}

describe("Optional Reinforcement — contextual entry from Daily Study Completion", () => {
  it("2 & 3. is optional and not a required next step: 'Done' works without ever starting it", () => {
    let done = false;
    render(<DailyStudySession contentSource={productionContentSource} onDone={() => (done = true)} onExploreConcept={() => {}} />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByRole("heading", { name: /Today's study is complete/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "A quick reinforcement" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(done).toBe(true);
  });

  it("1. the entry action is offered when real reinforcement content is available, contextually, after Completion", () => {
    runToCompletion("The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market");
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByRole("heading", { name: /Today's study is complete/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "A quick reinforcement" })).toBeTruthy();
  });

  it("4 & 16. starting it creates a bounded 3-question session with correctly incrementing progress", () => {
    runToCompletion("The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market");
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    fireEvent.click(screen.getByRole("button", { name: "A quick reinforcement" }));
    expect(screen.getByText(/Quick reinforcement · Question 1 of 3/)).toBeTruthy();
  });

  it("6 & 5. prefers the just-completed lesson's own family (question.d1.0006, a sibling of the Apply question) first", () => {
    runToCompletion("The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market");
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    fireEvent.click(screen.getByRole("button", { name: "A quick reinforcement" }));
    expect(
      screen.getByText(
        "Senior management approves the enterprise's annual information security objectives and the overall budget envelope needed to support the business strategy. The security manager then assigns specific staff to specific projects within that approved budget. Which of these two activities is the GOVERNANCE activity?"
      )
    ).toBeTruthy();
  });

  it("does not reveal the concept/perspective label above the question", () => {
    runToCompletion("The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market");
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    fireEvent.click(screen.getByRole("button", { name: "A quick reinforcement" }));
    expect(screen.queryByText(/Perspective:/)).toBeNull();
    expect(screen.queryByText("Governance vs. management")).toBeNull();
  });

  it("13 & 14 & 15 & 7. a prior miss can steer selection; incorrect reinforcement answers reach shared Repair and completion returns to the flow", () => {
    // Miss the Apply question on purpose.
    runToCompletion("The security team configures data-residency controls to comply with the new market's regulations");
    expect(screen.getByRole("heading", { name: "Repair the reasoning" })).toBeTruthy();
    continueThroughFeedbackAndRepairIfAny();
    expect(screen.getByRole("heading", { name: /Today's study is complete/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "A quick reinforcement" }));
    expect(screen.getByText(/Question 1 of 3/)).toBeTruthy();

    // Q1 (question.d1.0006): answer correctly.
    fireEvent.click(screen.getByRole("button", { name: "Approving the annual objectives and overall budget envelope" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Correct" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByText(/Question 2 of 3/)).toBeTruthy();

    // Q2 (question.foundation.0002): answer incorrectly, complete Repair.
    fireEvent.click(screen.getByRole("button", { name: "The action that will ultimately provide the greatest risk reduction" }));
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Repair the reasoning" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByText(/Question 3 of 3/)).toBeTruthy();

    // Q3 (question.d1.0007): finish generically.
    const optionsGroup = screen.getByRole("group", { name: "Answer options" });
    fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    continueThroughFeedbackAndRepairIfAny();

    // 17 & 18 & 19. bounded completion, truthful count, no gamification.
    expect(screen.getByRole("heading", { name: "Reinforcement complete" })).toBeTruthy();
    expect(screen.getByText("3 questions completed")).toBeTruthy();
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.queryByText(/pass|fail|grade|score/i)).toBeNull();
    // 19 (no timer).
    expect(screen.queryByText(/\d:\d\d/)).toBeNull();
    expect(screen.queryByText(/countdown/i)).toBeNull();

    // Missed-concept review: question.foundation.0002's concept.
    expect(screen.getByText("Reading the qualifier")).toBeTruthy();
  });

  it("14 (Explore handoff). the reinforcement-complete Explore action reuses Explore's own concept routing", () => {
    let exploredConceptId: string | undefined = "not-called";
    render(
      <DailyStudySession
        contentSource={productionContentSource}
        onDone={() => {}}
        onExploreConcept={(id) => {
          exploredConceptId = id;
        }}
      />
    );
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "The security team configures data-residency controls to comply with the new market's regulations" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    continueThroughFeedbackAndRepairIfAny();
    fireEvent.click(screen.getByRole("button", { name: "A quick reinforcement" }));

    // Q1 correct.
    fireEvent.click(screen.getByRole("button", { name: "Approving the annual objectives and overall budget envelope" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // Q2 incorrect -> Repair -> continue.
    fireEvent.click(screen.getByRole("button", { name: "The action that will ultimately provide the greatest risk reduction" }));
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // Q3 generic finish.
    const optionsGroup = screen.getByRole("group", { name: "Answer options" });
    fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    continueThroughFeedbackAndRepairIfAny();

    expect(screen.getByRole("heading", { name: "Reinforcement complete" })).toBeTruthy();
    fireEvent.click(within(screen.getByText("Reading the qualifier").closest("li")!).getByRole("button", { name: "Explore" }));
    expect(exploredConceptId).toBe("concept.foundation.qualifier-recognition");
  });

  it("20. an invalid/missing context (Phase 5B prototype content source) fails safely — no reinforcement action offered, no crash", () => {
    render(<DailyStudySession contentSource={prototypeContentSource} onDone={() => {}} />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    const optionsGroup = screen.getByRole("group", { name: "Answer options" });
    fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    continueThroughFeedbackAndRepairIfAny();

    expect(screen.getByRole("heading", { name: /Today's study is complete/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "A quick reinforcement" })).toBeNull();
  });
});

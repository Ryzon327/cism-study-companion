import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/preact";
import { PracticeScreen } from "../../../app/src/screens/PracticeScreen";
import { resetExposureHistoryForTests } from "../../../app/src/content/exposureStore";

/**
 * Phase 10B-3: Practice's own session mechanics (scope/count -> bounded
 * question loop -> shared Feedback/Repair -> truthful summary). Exercises
 * real production content (Domain 1) exactly the way
 * tests/frontend/unit/explore-screen.test.tsx already does for Explore,
 * rather than re-testing shared Feedback/Repair genericity itself — that
 * is repair-coverage.test.ts's and practice.test.ts's job. Selection is
 * deterministic here because resetExposureHistoryForTests() runs before
 * every test (see selection.ts's lowest-unseen-id rule): a fresh 2-question
 * Domain 1 session always resolves to question.d1.0002 then
 * question.d1.0019.
 */

beforeEach(() => {
  resetExposureHistoryForTests();
});

function startTwoQuestionD1Session(onExploreConcept: (id?: string) => void = () => {}) {
  render(<PracticeScreen onExit={() => {}} onExploreConcept={onExploreConcept} />);
  fireEvent.click(screen.getByRole("radio", { name: "Governance" }));
  // Domain 1 has 34 eligible questions, so both 5 and 10 are enabled —
  // pick a count no MVP UI actually offers (2) is unavailable, so exercise
  // the smallest offered amount instead. Practice's own scope/count model
  // only exposes 5/10, so this test proves the flow using 5 and only
  // checks the first two questions' behavior rather than all five.
  fireEvent.click(screen.getByRole("radio", { name: "5", exact: true }));
  fireEvent.click(screen.getByRole("button", { name: "Start Practice →" }));
}

describe("PracticeScreen", () => {
  it("1. lands on scope/count choice, not a question", () => {
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} />);
    expect(screen.getByRole("heading", { name: "Choose what to practice" })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Answer options" })).toBeNull();
  });

  it("offers 'All available material' and per-domain scopes generically", () => {
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} />);
    expect(screen.getByRole("radio", { name: "All available material" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Governance" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Risk Management" })).toBeTruthy();
  });

  it("disables a question-count option the current scope cannot truthfully fulfill", () => {
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Foundation" }));
    // domain.foundation has only 3 authored questions.
    expect((screen.getByRole("radio", { name: "5", exact: true }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("radio", { name: "10", exact: true }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Start Practice →" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("does not reveal the concept/perspective being tested before or during a question", () => {
    startTwoQuestionD1Session();
    expect(screen.queryByText(/Perspective:/)).toBeNull();
    expect(screen.queryByText("Authority follows accountability")).toBeNull();
  });

  it("shows known bounded progress (Question 1 of 5)", () => {
    startTwoQuestionD1Session();
    expect(screen.getByText(/Question 1 of 5/)).toBeTruthy();
  });

  it("a correct answer produces normal Feedback and advances to the next question", () => {
    startTwoQuestionD1Session();
    fireEvent.click(screen.getByRole("button", { name: "The accountable business/process owner for that business unit" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Correct" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByText(/Question 2 of 5/)).toBeTruthy();
  });

  it("full 2-question walkthrough: correct then incorrect-with-repair, progressing correctly", () => {
    startTwoQuestionD1Session();

    // Question 1 (question.d1.0002): answer correctly.
    fireEvent.click(screen.getByRole("button", { name: "The accountable business/process owner for that business unit" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Correct" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // Question 2 (question.d1.0019): answer incorrectly, reach Repair.
    expect(screen.getByText(/Question 2 of 5/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "A revised security strategy, since the current one must be inadequate if a new tool is needed" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("heading", { name: "Repair the reasoning" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByRole("heading", { name: "Let's correct that reasoning." })).toBeTruthy();
    const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // 2 of 5 answered — 3 more questions remain in this 5-question session
    // before the summary appears; this test only exercises the first two
    // to keep the walkthrough deterministic and readable. Progress must
    // reflect question 3 now, not a premature summary.
    expect(screen.getByText(/Question 3 of 5/)).toBeTruthy();
  });

  it("completes a full 5-question session and produces a truthful, calm summary", () => {
    startTwoQuestionD1Session();

    let expectedCorrect = 0;
    let expectedIncorrect = 0;

    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(new RegExp(`Question ${i + 1} of 5`))).toBeTruthy();
      const optionsGroup = screen.getByRole("group", { name: "Answer options" });
      fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
      fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
      fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

      const correct = screen.queryByRole("heading", { name: "Correct" }) !== null;
      if (correct) expectedCorrect++;
      else expectedIncorrect++;

      fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

      if (!correct) {
        expect(screen.getByRole("heading", { name: "Let's correct that reasoning." })).toBeTruthy();
        const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
        fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
        fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
      }
    }

    expect(screen.getByRole("heading", { name: "Practice complete" })).toBeTruthy();
    expect(screen.getByText("5 questions completed")).toBeTruthy();
    expect(screen.getByText(`${expectedCorrect} correct`)).toBeTruthy();
    expect(screen.getByText(`${expectedIncorrect} needed repair`)).toBeTruthy();
    // Never presented as a grade/pass-fail/mastery claim.
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.queryByText(/pass|fail|grade/i)).toBeNull();
  });

  it("'Practice again' returns to the landing screen for a fresh session", () => {
    startTwoQuestionD1Session();
    for (let i = 0; i < 5; i++) {
      const optionsGroup = screen.getByRole("group", { name: "Answer options" });
      fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
      fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
      fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
      const correct = screen.queryByRole("heading", { name: "Correct" }) !== null;
      fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
      if (!correct) {
        const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
        fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
        fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
      }
    }
    fireEvent.click(screen.getByRole("button", { name: "Practice again" }));
    expect(screen.getByRole("heading", { name: "Choose what to practice" })).toBeTruthy();
  });

  it("a missed concept in the summary offers a truthful Explore handoff via Explore's own concept routing", () => {
    let exploredConceptId: string | undefined = "not-called";
    startTwoQuestionD1Session((id) => {
      exploredConceptId = id;
    });

    // Question 1 (question.d1.0002): answer correctly.
    fireEvent.click(screen.getByRole("button", { name: "The accountable business/process owner for that business unit" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // Question 2 (question.d1.0019): answer incorrectly, complete Repair.
    fireEvent.click(
      screen.getByRole("button", { name: "A revised security strategy, since the current one must be inadequate if a new tool is needed" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // Questions 3-5: answer correctly using the first-position option is
    // not guaranteed, so just finish generically to reach the summary.
    for (let i = 0; i < 3; i++) {
      const optionsGroup = screen.getByRole("group", { name: "Answer options" });
      fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
      fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
      fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
      const correct = screen.queryByRole("heading", { name: "Correct" }) !== null;
      fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
      if (!correct) {
        const rg = screen.getByRole("group", { name: "Repair answer options" });
        fireEvent.click(within(rg).getAllByRole("button")[0]!);
        fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
      }
    }

    expect(screen.getByRole("heading", { name: "Practice complete" })).toBeTruthy();
    expect(screen.getByText("Business justification, business case, and roadmap")).toBeTruthy();
    fireEvent.click(within(screen.getByText("Business justification, business case, and roadmap").closest("li")!).getByRole("button", { name: "Explore" }));
    expect(exploredConceptId).toBe("concept.d1.business-justification-roadmap");
  });

  it("exit from the landing screen returns safely without starting a session", () => {
    let exited = false;
    render(<PracticeScreen onExit={() => (exited = true)} onExploreConcept={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(exited).toBe(true);
  });
});

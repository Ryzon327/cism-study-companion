import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { QuestionAttemptFlow } from "../../../app/src/session/QuestionAttemptFlow";
import type { AnswerOptionFixture, FeedbackFixture, QuestionFixture, RepairCheckFixture } from "../../../app/src/types/content";

/**
 * Phase 10B-1: contract tests for the shared QUESTION -> ANSWER -> FEEDBACK
 * -> (REPAIR if needed) -> complete primitive, extracted from
 * DailyStudySession so future learning modes (Explore, Practice,
 * Reinforcement) can reuse it. Deliberately uses entirely synthetic
 * fixtures (a fake "domain.synthetic-future" question) rather than real
 * production content, to prove the component is generic over any content
 * source and carries no per-domain/per-lesson assumption — see Phase
 * 10B-1's Part H (generic domain support) and Part I (family
 * compatibility) requirements.
 */

const syntheticQuestion: QuestionFixture = {
  id: "question.synthetic-future.0001",
  domainLabel: "Synthetic Future Domain",
  prompt: "A synthetic scenario for a domain that does not exist in production content yet.",
  options: [
    { key: "a", text: "The correct synthetic answer.", correct: true, rationale: "It is correct because this test says so." },
    { key: "b", text: "A wrong synthetic answer.", correct: false, rationale: "It is wrong because this test says so." },
    { key: "c", text: "Another wrong synthetic answer.", correct: false, rationale: "It is also wrong because this test says so." }
  ]
};

function buildSyntheticFeedback(_question: QuestionFixture, selectedKey: AnswerOptionFixture["key"]): FeedbackFixture & { repairTargetId?: string } {
  const correct = selectedKey === "a";
  return {
    question: syntheticQuestion,
    selectedKey,
    correct,
    why: "The correct synthetic answer is correct because this test says so.",
    whySelectedWasWeaker: correct ? undefined : "The selected synthetic answer was weaker because this test says so.",
    lifecycle: [],
    memoryRule: "A synthetic memory rule.",
    repairTargetId: correct ? undefined : "repair.synthetic-target"
  };
}

const syntheticRepairCheck: RepairCheckFixture = {
  prompt: "Which synthetic statement is accurate?",
  options: [
    { key: "a", text: "The wrong synthetic repair option.", correct: false, rationale: "" },
    { key: "b", text: "The correct synthetic repair option.", correct: true, rationale: "" }
  ],
  confirmation: "Synthetic repair confirmation text."
};

describe("QuestionAttemptFlow — shared question/answer/feedback/repair primitive", () => {
  it("1 & 2. renders the resolved question and evaluates the answer the learner actually selected, regardless of display order", () => {
    const buildFeedback = vi.fn(buildSyntheticFeedback);
    render(
      <QuestionAttemptFlow
        question={syntheticQuestion}
        buildFeedback={buildFeedback}
        getRepairCheck={() => syntheticRepairCheck}
        onComplete={() => {}}
      />
    );
    expect(screen.getByText(syntheticQuestion.prompt)).toBeTruthy();

    fireEvent.click(screen.getByText("A wrong synthetic answer."));
    // ConfidenceControl must be set before "Check answer" enables.
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(buildFeedback).toHaveBeenCalledWith(syntheticQuestion, "b");
  });

  it("3. correct feedback is returned and rendered for a correct answer", () => {
    render(
      <QuestionAttemptFlow
        question={syntheticQuestion}
        buildFeedback={buildSyntheticFeedback}
        getRepairCheck={() => syntheticRepairCheck}
        onComplete={() => {}}
      />
    );
    fireEvent.click(screen.getByText("The correct synthetic answer."));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("heading", { name: "Correct" })).toBeTruthy();
  });

  it("4. incorrect feedback identifies a repair target and 5. Repair can be invoked from the shared flow", () => {
    render(
      <QuestionAttemptFlow
        question={syntheticQuestion}
        buildFeedback={buildSyntheticFeedback}
        getRepairCheck={(feedback) => {
          expect(feedback.repairTargetId).toBe("repair.synthetic-target");
          return syntheticRepairCheck;
        }}
        onComplete={() => {}}
      />
    );
    fireEvent.click(screen.getByText("A wrong synthetic answer."));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("heading", { name: "Repair the reasoning" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByText(syntheticRepairCheck.prompt)).toBeTruthy();
  });

  it("6. repair completion returns control cleanly to the caller via onComplete, exactly once", () => {
    const onComplete = vi.fn();
    render(
      <QuestionAttemptFlow
        question={syntheticQuestion}
        buildFeedback={buildSyntheticFeedback}
        getRepairCheck={() => syntheticRepairCheck}
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByText("A wrong synthetic answer."));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    // Now on the Repair screen; answer it and continue.
    fireEvent.click(screen.getByText("The correct synthetic repair option."));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("a correct answer calls onComplete directly, without ever rendering Repair", () => {
    const onComplete = vi.fn();
    const getRepairCheck = vi.fn(() => syntheticRepairCheck);
    render(
      <QuestionAttemptFlow
        question={syntheticQuestion}
        buildFeedback={buildSyntheticFeedback}
        getRepairCheck={getRepairCheck}
        onComplete={onComplete}
      />
    );
    fireEvent.click(screen.getByText("The correct synthetic answer."));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(getRepairCheck).not.toHaveBeenCalled();
  });

  it("9 & 10. carries no domain/lesson/family assumption — a fully synthetic, non-production question id and domain label render and resolve without error", () => {
    // syntheticQuestion.id/domainLabel reference no real content/production/
    // entity at all; the component never looks either up itself.
    render(
      <QuestionAttemptFlow
        question={syntheticQuestion}
        buildFeedback={buildSyntheticFeedback}
        getRepairCheck={() => syntheticRepairCheck}
        onComplete={() => {}}
      />
    );
    expect(screen.getByText(syntheticQuestion.prompt)).toBeTruthy();
  });
});

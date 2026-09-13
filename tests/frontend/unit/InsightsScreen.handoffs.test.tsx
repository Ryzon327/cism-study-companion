import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { InsightsScreen } from "../../../app/src/screens/InsightsScreen";
import { installFakeIndexedDb } from "./learning-history/fakeIndexedDb";
import { recordQuestionAttempt } from "../../../app/src/learning-history";
import { resetSessionIdForTests } from "../../../app/src/learning-history/sessionId";
import * as db from "../../../app/src/learning-history/db";
import type { StudyHandoff } from "../../../app/src/study-handoff/types";

/**
 * LI-4 §44/§45: component-level proof that Focus Next actually renders
 * real, clickable action controls (not the old informational-only text)
 * and that clicking one calls `onActivateHandoff` with the correct,
 * resolved payload. Real browser navigation through App.tsx is additionally
 * proven end-to-end in tests/frontend/e2e/study-handoff.spec.ts.
 */

const Q = ["question.d3.0026", "question.d3.0027", "question.d3.0028"];

beforeEach(() => {
  installFakeIndexedDb();
  resetSessionIdForTests();
  if (!("createObjectURL" in URL)) {
    (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => "blob:mock";
  }
  if (!("revokeObjectURL" in URL)) {
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
  }
});

function seedApply(questionId: string, occurredAt: number, correct: boolean) {
  return recordQuestionAttempt({
    learningMode: "daily-study",
    sourceContext: "production",
    attemptKind: "apply",
    questionId,
    occurredAt,
    selectedOptionKey: correct ? "a" : "b",
    correctOptionKey: "a",
    correct,
    confidence: "sure",
    repairTargetId: correct ? null : "repair.knowledge-gap"
  }).event;
}

async function waitForWrites(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("InsightsScreen — Focus Next real action controls (LI-4)", () => {
  it("a resolvable concept renders both 'Review topic' and 'Practice this topic' buttons", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });
    expect(screen.getByRole("button", { name: /^Review topic:/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Practice this topic:/ })).toBeTruthy();
  });

  it("clicking 'Review topic' calls onActivateHandoff with a review handoff for the real concept id", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    let activated: [StudyHandoff, string] | undefined;
    render(<InsightsScreen onActivateHandoff={(handoff, label) => (activated = [handoff, label])} />);
    await screen.findByRole("heading", { name: "Focus next" });
    fireEvent.click(screen.getByRole("button", { name: /^Review topic:/ }));
    expect(activated).toBeDefined();
    expect(activated![0]).toEqual({ kind: "review", conceptId: "concept.d3.program-metrics-reporting" });
    expect(activated![1].length).toBeGreaterThan(0);
  });

  it("clicking 'Practice this topic' calls onActivateHandoff with a targeted practice handoff", async () => {
    seedApply(Q[0]!, 100, false);
    seedApply(Q[1]!, 200, false);
    seedApply(Q[2]!, 300, true);
    await waitForWrites();
    let activated: StudyHandoff | undefined;
    render(<InsightsScreen onActivateHandoff={(handoff) => (activated = handoff)} />);
    await screen.findByRole("heading", { name: "Focus next" });
    fireEvent.click(screen.getByRole("button", { name: /^Practice this topic:/ }));
    expect(activated).toEqual({
      kind: "practice",
      scope: { kind: "target", axis: "concept", targetId: "concept.d3.program-metrics-reporting" },
      eligibleQuestionCount: expect.any(Number)
    });
  });

  it("a stale/unknown target renders no action button at all — evidence stays visible", async () => {
    for (let i = 0; i < 3; i++) {
      await db.appendEvent({
        eventSchemaVersion: 1,
        sessionId: "session-stale",
        learningMode: "daily-study",
        sourceContext: "production",
        attemptKind: "apply",
        familyId: null,
        domain: null,
        patterns: [],
        qualifier: null,
        primaryRole: null,
        lifecycle: null,
        stage: null,
        decisionType: null,
        evidenceDimensions: [],
        contentStatusAtAttempt: "CANDIDATE",
        correctOptionKey: "a",
        confidence: "sure",
        eventId: `stale-${i}`,
        attemptId: `stale-${i}`,
        type: "QUESTION_ATTEMPT",
        occurredAt: 100 + i * 10,
        questionId: `question.stale.${i}`,
        conceptIds: ["concept.no-longer-exists"],
        selectedOptionKey: "b",
        correct: false,
        repairTargetId: "repair.knowledge-gap"
      });
    }
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    await screen.findByRole("heading", { name: "Focus next" });
    expect(screen.getByText("A previously studied topic")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^Review topic:/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Practice this topic:/ })).toBeNull();
  });

  it("Stronger Areas never renders a Practice action (LI-4 §25)", async () => {
    for (let i = 0; i < 5; i++) {
      seedApply(Q[i % Q.length]!, 100 + i * 10, true);
    }
    await waitForWrites();
    render(<InsightsScreen onActivateHandoff={() => {}} />);
    const heading = await screen.findByRole("heading", { name: "Stronger areas" });
    const section = heading.closest("section")!;
    expect(section.querySelector("button")).toBeNull();
  });
});

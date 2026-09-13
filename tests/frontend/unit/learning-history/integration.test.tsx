import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/preact";
import { installFakeIndexedDb } from "./fakeIndexedDb";
import { DailyStudySession } from "../../../../app/src/session/DailyStudySession";
import { PracticeScreen } from "../../../../app/src/screens/PracticeScreen";
import { ExploreScreen } from "../../../../app/src/screens/ExploreScreen";
import { productionContentSource, setTodaysLessonIdForReview } from "../../../../app/src/content/productionContentSource";
import { prototypeContentSource } from "../../../../app/src/data/prototypeContentSource";
import { resetExposureHistoryForTests } from "../../../../app/src/content/exposureStore";
import { resetSessionIdForTests } from "../../../../app/src/learning-history/sessionId";
import { listLearningEvents } from "../../../../app/src/learning-history/learningHistoryStore";
import { isQuestionAttemptEvent, isRepairAttemptEvent } from "../../../../app/src/learning-history/types";

/**
 * LI-1: proves real learning-mode UI produces real, correctly-tagged
 * LearningEvents through the one shared recording seam (QuestionAttemptFlow
 * for Apply/Repair; DailyStudySession directly for Recall) — across Daily
 * Study, Practice, Explore, and Reinforcement — without duplicating
 * instrumentation per mode. Uses real production content deterministically,
 * the same way the existing daily-study-reinforcement/practice-screen/
 * explore-screen suites already do (resetExposureHistoryForTests() +
 * selection.ts's lowest-unseen-id rule).
 */

beforeEach(() => {
  resetExposureHistoryForTests();
  installFakeIndexedDb();
  resetSessionIdForTests();
});

async function questionAttemptEvents() {
  return (await listLearningEvents()).filter(isQuestionAttemptEvent);
}
async function repairAttemptEvents() {
  return (await listLearningEvents()).filter(isRepairAttemptEvent);
}

describe("Daily Study — Recall, Apply, and Repair each record real evidence", () => {
  beforeEach(() => {
    setTodaysLessonIdForReview("lesson.d1.governance-vs-management");
  });

  it("Recall records exactly one QUESTION_ATTEMPT with attemptKind 'recall', null confidence, and correct production metadata", async () => {
    render(<DailyStudySession contentSource={productionContentSource} onDone={() => {}} sourceContext="production" />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));

    const events = await questionAttemptEvents();
    expect(events).toHaveLength(1);
    const recall = events[0]!;
    expect(recall.attemptKind).toBe("recall");
    expect(recall.learningMode).toBe("daily-study");
    expect(recall.sourceContext).toBe("production");
    expect(recall.confidence).toBeNull();
    expect(recall.questionId).toBe("question.foundation.0001"); // deterministic given a fresh exposure history
    expect(recall.domain).toBe("domain.foundation");
  });

  it("a correct Apply records exactly one QUESTION_ATTEMPT (attemptKind 'apply') and zero REPAIR_ATTEMPT events", async () => {
    render(<DailyStudySession contentSource={productionContentSource} onDone={() => {}} sourceContext="production" />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    const applyEvents = (await questionAttemptEvents()).filter((e) => e.attemptKind === "apply");
    expect(applyEvents).toHaveLength(1);
    const apply = applyEvents[0]!;
    expect(apply.correct).toBe(true);
    expect(apply.confidence).toBe("sure");
    expect(apply.questionId).toBe("question.d1.0005");
    expect(apply.familyId).toBeTruthy();
    expect(await repairAttemptEvents()).toHaveLength(0);
  });

  it("an incorrect Apply followed by Repair records both events, linked, with the Apply event unchanged by Repair", async () => {
    render(<DailyStudySession contentSource={productionContentSource} onDone={() => {}} sourceContext="production" />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "The security team configures data-residency controls to comply with the new market's regulations" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    const applyEventsBeforeRepair = (await questionAttemptEvents()).filter((e) => e.attemptKind === "apply");
    expect(applyEventsBeforeRepair).toHaveLength(1);
    const applySnapshotBeforeRepair = { ...applyEventsBeforeRepair[0]! };

    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    const repairGroup = screen.getByRole("group", { name: "Repair answer options" });
    fireEvent.click(within(repairGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    const repairs = await repairAttemptEvents();
    expect(repairs).toHaveLength(1);
    const repair = repairs[0]!;
    expect(repair.parentAttemptId).toBe(applySnapshotBeforeRepair.attemptId);
    expect(typeof repair.correct).toBe("boolean");

    const applyEventsAfterRepair = (await questionAttemptEvents()).filter((e) => e.attemptKind === "apply");
    expect(applyEventsAfterRepair).toHaveLength(1);
    expect(applyEventsAfterRepair[0]).toEqual(applySnapshotBeforeRepair); // never mutated by the Repair write
  });

  it("clicking 'Check answer' once records exactly one Apply attempt — no duplicate from the resulting re-render/phase transition", async () => {
    render(<DailyStudySession contentSource={productionContentSource} onDone={() => {}} sourceContext="production" />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    // Feedback -> Continue and a possible Repair both re-render the tree
    // this same QuestionAttemptFlow instance owns; the recording guard
    // (a ref, not just state) must survive those without re-firing.
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    const applyEvents = (await questionAttemptEvents()).filter((e) => e.attemptKind === "apply");
    expect(applyEvents).toHaveLength(1);
  });

  it("prototype-sourced Daily Study attempts are tagged sourceContext 'prototype' and carry no production metadata", async () => {
    render(<DailyStudySession contentSource={prototypeContentSource} onDone={() => {}} sourceContext="prototype" />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    const optionsGroup = screen.getByRole("group", { name: "Answer options" });
    fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    const events = await questionAttemptEvents();
    expect(events.every((e) => e.sourceContext === "prototype")).toBe(true);
    expect(events.every((e) => e.domain === null)).toBe(true);
  });
});

describe("Practice — attempts are tagged learningMode 'practice'", () => {
  it("records a QUESTION_ATTEMPT with learningMode 'practice' and sourceContext 'production'", async () => {
    render(<PracticeScreen onExit={() => {}} onExploreConcept={() => {}} />);
    fireEvent.click(screen.getByRole("radio", { name: "Governance" }));
    fireEvent.click(screen.getByRole("radio", { name: "5", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Start Practice →" }));
    fireEvent.click(screen.getByRole("button", { name: "The accountable business/process owner for that business unit" }));
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    const events = await questionAttemptEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.learningMode).toBe("practice");
    expect(events[0]!.sourceContext).toBe("production");
    expect(events[0]!.questionId).toBe("question.d1.0002");
  });
});

describe("Explore — attempts are tagged learningMode 'explore'", () => {
  it("records a QUESTION_ATTEMPT with learningMode 'explore' and sourceContext 'production'", async () => {
    render(<ExploreScreen onExit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Governance/ }));
    fireEvent.click(screen.getByRole("button", { name: "Governance vs. management" }));
    fireEvent.click(screen.getByRole("button", { name: /Try a scenario/ }));
    const optionsGroup = screen.getByRole("group", { name: "Answer options" });
    fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    const events = await questionAttemptEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.learningMode).toBe("explore");
    expect(events[0]!.sourceContext).toBe("production");
    expect(events[0]!.questionId).toBe("question.d1.0005");
  });
});

describe("Reinforcement — attempts are tagged learningMode 'reinforcement', distinct from Daily Study's own Apply", () => {
  beforeEach(() => {
    setTodaysLessonIdForReview("lesson.d1.governance-vs-management");
  });

  it("a reinforcement question records learningMode 'reinforcement', separate from the earlier daily-study Apply event", async () => {
    render(<DailyStudySession contentSource={productionContentSource} onDone={() => {}} sourceContext="production" />);
    fireEvent.click(document.querySelectorAll(".recall-options .answer-option")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Continue to today's lesson →" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "The Board formally approves the enterprise's acceptable level of risk exposure for operating in the new market" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Sure", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    fireEvent.click(screen.getByRole("button", { name: "A quick reinforcement" }));

    const optionsGroup = screen.getByRole("group", { name: "Answer options" });
    fireEvent.click(within(optionsGroup).getAllByRole("button")[0]!);
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    const events = await questionAttemptEvents();
    const byMode = events.reduce<Record<string, number>>((acc, e) => {
      acc[e.learningMode] = (acc[e.learningMode] ?? 0) + 1;
      return acc;
    }, {});
    expect(byMode["daily-study"]).toBe(2); // recall + apply
    expect(byMode["reinforcement"]).toBe(1);
  });
});

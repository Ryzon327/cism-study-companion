import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { AnswerOption } from "../../../app/src/components/AnswerOption/AnswerOption";

const option = { key: "a" as const, text: "Policy", correct: true, rationale: "n/a" };

describe("AnswerOption", () => {
  it("calls onSelect when clicked and not yet submitted", () => {
    const onSelect = vi.fn();
    render(<AnswerOption option={option} selected={false} submitted={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("does not visually signal correctness before submission", () => {
    render(<AnswerOption option={option} selected={true} submitted={false} onSelect={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.className).not.toContain("answer-option-correct");
    expect(button.className).not.toContain("answer-option-wrong");
  });

  it("is disabled and shows the correct icon once submitted", () => {
    render(<AnswerOption option={option} selected={true} submitted={true} onSelect={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.className).toContain("answer-option-correct");
  });

  it("marks a wrong selected option distinctly from the correct one", () => {
    const wrong = { key: "b" as const, text: "Procedure", correct: false, rationale: "n/a" };
    render(<AnswerOption option={wrong} selected={true} submitted={true} onSelect={() => {}} />);
    expect(screen.getByRole("button").className).toContain("answer-option-wrong");
  });
});

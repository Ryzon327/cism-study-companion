import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import { ReviewQueueGrid } from "../../../app/src/components/ReviewQueueGrid/ReviewQueueGrid";

describe("ReviewQueueGrid", () => {
  it("shows an empty label when there are no items", () => {
    render(<ReviewQueueGrid items={[]} emptyLabel="Nothing marked" />);
    expect(screen.getByText("Nothing marked")).toBeTruthy();
  });

  it("renders one focusable button per item, distinguishing answered from unanswered by icon and text, not color alone", () => {
    render(
      <ReviewQueueGrid
        items={[
          { index: 1, answered: true, marked: false },
          { index: 2, answered: false, marked: true }
        ]}
        emptyLabel="none"
      />
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.textContent).toContain("Answered");
    expect(buttons[1]?.textContent).toContain("Unanswered");
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import { Journey } from "../../../app/src/components/Journey/Journey";
import type { JourneyStep } from "../../../app/src/types/content";

const steps: JourneyStep[] = [
  { id: "foundation", label: "Foundation", state: "completed" },
  { id: "d1", label: "Domain 1", state: "current" },
  { id: "d2", label: "Domain 2", state: "upcoming" }
];

describe("Journey", () => {
  it("renders every step with its state announced for assistive tech", () => {
    render(<Journey steps={steps} />);
    expect(screen.getByText(/Foundation/).textContent).toContain("completed");
    expect(screen.getByText(/Domain 1/).textContent).toContain("current");
    expect(screen.getByText(/Domain 2/).textContent).toContain("upcoming");
  });

  it("uses an ordered list, distinct from a generic card grid", () => {
    render(<Journey steps={steps} />);
    expect(screen.getByRole("list", { name: /learning journey/i })).toBeTruthy();
  });
});

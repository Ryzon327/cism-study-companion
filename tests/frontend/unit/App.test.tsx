import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/preact";
import { App } from "../../../app/src/App";

function openPrototypeSwitcher() {
  const trigger = document.querySelector(".prototype-switcher-trigger");
  if (!trigger) throw new Error("prototype-switcher-trigger not found");
  fireEvent.click(trigger);
}

function assertSessionNavReceded() {
  // In session mode, AppShell renders neither ProductNav nor BottomTabBar —
  // there is no "Main" nav landmark in the document at all.
  expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
  expect(screen.getByRole("button", { name: "Exit" })).toBeTruthy();
}

describe("App integration", () => {
  it("starts on the Home / Today screen with a single unmistakable primary action", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Start Today's Study/ })).toBeTruthy();
  });

  it("real product navigation (Home, Daily Study, Explore & Practice) has exactly three destinations", () => {
    // Two "Main" nav landmarks exist in markup — the desktop ProductNav and
    // the mobile BottomTabBar — mutually exclusive via CSS media query at
    // real viewports (jsdom applies no layout, so both are present here);
    // scope to the desktop topbar's copy, which is what a desktop reviewer
    // actually navigates with.
    const { container } = render(<App />);
    const topbar = container.querySelector(".topbar") as HTMLElement;
    const nav = within(topbar).getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("button")).toHaveLength(3);
    expect(within(nav).getByRole("button", { name: "Daily Study" })).toBeTruthy();
    expect(within(nav).getByRole("button", { name: "Explore & Practice" })).toBeTruthy();
  });

  it("navigates between all eight prototype-gate states via the QA switcher, not product navigation", () => {
    render(<App />);
    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Daily Study — Learn" }));
    expect(screen.getByText("Residual risk")).toBeTruthy();

    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Question / Apply" }));
    expect(screen.getByText(/What should happen NEXT/)).toBeTruthy();

    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Feedback — Correct" }));
    expect(screen.getByText(/Question/, { selector: ".feedback-eyebrow" })).toBeTruthy();

    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Feedback — Incorrect" }));
    expect(screen.getByText(/Why C was weaker|Why B was weaker/)).toBeTruthy();

    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Daily Study Completion" }));
    expect(screen.getByText(/Today's study is complete/)).toBeTruthy();

    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Practice Exam" }));
    expect(screen.getByText("4 / 12")).toBeTruthy();

    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Review Center" }));
    expect(screen.getByText("Review what matters before you submit.")).toBeTruthy();
  });

  it("toggles theme via data-theme on the document element", () => {
    render(<App />);
    const toggle = screen.getByRole("button", { name: /Switch to dark mode|Switch to light mode/ });
    const before = document.documentElement.getAttribute("data-theme");
    fireEvent.click(toggle);
    const after = document.documentElement.getAttribute("data-theme");
    expect(after).not.toBe(before);
  });
});

describe("Daily Study live session (controlled, in-memory experience prototype)", () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it("Home's Start Today's Study begins the session at Recall, receded from product navigation (1, 2, 10)", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Start Today's Study/ }));

    expect(screen.getByText(/Quick recall from Domain 1/)).toBeTruthy();
    assertSessionNavReceded();
  });

  it("Recall advances to Learn, which advances to Apply (2, 3)", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Start Today's Study/ }));

    fireEvent.click(screen.getByRole("button", { name: "Alignment with the organization's risk appetite" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue to today's lesson/ }));
    expect(screen.getByRole("heading", { name: "Residual risk" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
    expect(screen.getByText(/What should happen NEXT/)).toBeTruthy();
    assertSessionNavReceded();
  });

  function advanceToApply() {
    fireEvent.click(screen.getByRole("button", { name: /Start Today's Study/ }));
    fireEvent.click(screen.getByRole("button", { name: "Alignment with the organization's risk appetite" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue to today's lesson/ }));
    fireEvent.click(screen.getByRole("button", { name: "Apply it →" }));
  }

  it("the question cannot be submitted before an answer and confidence are both selected (4)", () => {
    render(<App />);
    advanceToApply();

    const submit = screen.getByRole("button", { name: "Check answer" });
    expect(submit.hasAttribute("disabled")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "The risk owner determines whether the residual risk is acceptable" })
    );
    expect(screen.getByRole("button", { name: "Check answer" }).hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: "Sure" }));
    expect(screen.getByRole("button", { name: "Check answer" }).hasAttribute("disabled")).toBe(false);
  });

  it("a correct selection produces correct feedback and continues straight to Completion (5, 8, 9)", () => {
    render(<App />);
    advanceToApply();

    fireEvent.click(
      screen.getByRole("button", { name: "The risk owner determines whether the residual risk is acceptable" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Sure" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("heading", { name: "Correct" })).toBeTruthy();
    assertSessionNavReceded();

    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByRole("heading", { name: /Today's study is complete/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeTruthy();
    // Back to "full" chrome — product navigation is present again (see the
    // duplicate-landmark note on the earlier product-nav test).
    expect(screen.getAllByRole("navigation", { name: "Main" }).length).toBeGreaterThan(0);
  });

  it("an incorrect selection produces incorrect feedback and routes through Repair before Completion (6, 7, 8)", () => {
    render(<App />);
    advanceToApply();

    fireEvent.click(
      screen.getByRole("button", {
        name: "The security manager formally accepts the residual risk on behalf of the enterprise"
      })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByRole("heading", { name: "Repair the reasoning" })).toBeTruthy();
    // The feedback panel must name the option actually selected (C), not a
    // hardcoded example.
    expect(
      screen.getByText(/C\. The security manager formally accepts the residual risk/)
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    expect(screen.getByRole("heading", { name: "Let's correct that reasoning." })).toBeTruthy();

    const repairContinue = screen.getByRole("button", { name: "Continue →" });
    expect(repairContinue.hasAttribute("disabled")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "Only the accountable risk owner can formally accept residual risk." })
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));

    expect(screen.getByRole("heading", { name: /Today's study is complete/ })).toBeTruthy();
  });

  it("the Prototype QA switcher still works independently of the live session (11)", () => {
    render(<App />);
    openPrototypeSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Practice Exam" }));
    expect(screen.getByText("4 / 12")).toBeTruthy();
  });

  it("never reads or writes localStorage across the full session (12)", () => {
    render(<App />);
    advanceToApply();
    fireEvent.click(
      screen.getByRole("button", { name: "The security manager formally accepts the residual risk on behalf of the enterprise" })
    );
    fireEvent.click(screen.getByRole("radio", { name: "Guessing" }));
    fireEvent.click(screen.getByRole("button", { name: "Check answer" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Only the accountable risk owner can formally accept residual risk." })
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue →" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});

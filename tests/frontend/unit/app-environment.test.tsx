import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/preact";
import { App } from "../../../app/src/App";

/**
 * Product-environment follow-up (docs/architecture/PRODUCT-ENVIRONMENT-FOLLOW-UP.md):
 * the released MVP defaulted to Phase 5B prototype fixtures and always
 * rendered the QA/prototype switcher, even in an ordinary build — a
 * pre-existing defect surfaced during LI-1's architecture review, unrelated
 * to Learning Intelligence itself. `VITE_ENABLE_QA_FIXTURES` is now the
 * one explicit opt-in for both; this file proves the App-level default
 * (unset) and the explicit opt-in, at the unit level. See
 * tests/frontend/e2e/product-environment.spec.ts for the same proof in a
 * real browser, across ordinary dev startup and a real production build.
 *
 * "Authority follows accountability" is production content's default
 * lesson (productionContentSource.ts's DEFAULT_TODAYS_LESSON_ID) — it can
 * only render if production content, not the Phase 5B prototype fixture
 * ("Residual risk and treatment decisions"), is what actually loaded.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ordinary startup (VITE_ENABLE_QA_FIXTURES unset) — the default", () => {
  it("Home shows real production content, not the Phase 5B prototype fixture", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Authority follows accountability" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeNull();
  });

  it("renders no Prototype/Production QA switcher at all", () => {
    render(<App />);
    expect(document.querySelector(".prototype-switcher-trigger")).toBeNull();
    expect(document.querySelector(".prototype-switcher")).toBeNull();
  });

  it("Daily Study begins with real production content, never the prototype fixture's fixed Recall prompt", () => {
    render(<App />);
    // Two "Main" nav landmarks exist in markup (desktop ProductNav +
    // mobile BottomTabBar, mutually exclusive only via a real viewport's
    // CSS media query — see App.test.tsx's identical note); either one's
    // "Daily Study" button starts the same session.
    screen.getAllByRole("button", { name: "Daily Study" })[0]!.click();
    // The Phase 5B prototype fixture's Recall always reads "Quick recall
    // from Domain 1" (see smoke.spec.ts) — production content never does.
    expect(screen.queryByText(/Quick recall from Domain 1/)).toBeNull();
  });
});

describe("explicit QA mode (VITE_ENABLE_QA_FIXTURES=true)", () => {
  it("renders the Prototype/Production QA switcher", () => {
    vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "true");
    render(<App />);
    expect(document.querySelector(".prototype-switcher-trigger")).not.toBeNull();
  });

  it("defaults to the prototype fixture content, preserving prior behavior for QA/developer review", () => {
    vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "true");
    render(<App />);
    expect(screen.getByRole("heading", { name: /Residual risk and treatment decisions/ })).toBeTruthy();
  });

  it("a value other than the exact string 'true' does not enable QA mode (no silent partial-match)", () => {
    vi.stubEnv("VITE_ENABLE_QA_FIXTURES", "1");
    render(<App />);
    expect(document.querySelector(".prototype-switcher-trigger")).toBeNull();
  });
});

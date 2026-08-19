import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { Dialog } from "../../../app/src/components/Dialog/Dialog";

/**
 * Direct regression coverage for the accessibility gap the engineering
 * baseline flagged in the prototype: dialogs must trap focus and return it
 * to the triggering element on close. See
 * docs/design-system/ACCESSIBILITY-STANDARD.md.
 */
describe("Dialog", () => {
  it("renders nothing when closed", () => {
    render(
      <Dialog open={false} titleId="t" title="Submit?" onClose={() => {}}>
        body
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders with dialog semantics when open", () => {
    render(
      <Dialog open={true} titleId="t" title="Submit practice exam?" onClose={() => {}}>
        <button type="button">Confirm</button>
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText("Submit practice exam?")).toBeTruthy();
  });

  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(
      <Dialog open={true} titleId="t" title="Submit?" onClose={onClose}>
        <button type="button">Confirm</button>
      </Dialog>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("returns focus to the previously focused element when it closes", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(
      <Dialog open={true} titleId="t" title="Submit?" onClose={() => {}}>
        <button type="button">Confirm</button>
      </Dialog>
    );
    expect(document.activeElement).not.toBe(trigger);

    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});

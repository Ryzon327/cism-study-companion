import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/preact";
import { Button } from "../../../app/src/components/Button/Button";

describe("Button", () => {
  it("renders its label and responds to clicks", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Start Today's Study</Button>);
    const button = screen.getByRole("button", { name: "Start Today's Study" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Check answer
      </Button>
    );
    const button = screen.getByRole("button", { name: "Check answer" });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as a real, focusable button element for every variant", () => {
    const { rerender } = render(<Button variant="primary">A</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
    rerender(<Button variant="secondary">A</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
    rerender(<Button variant="text">A</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });
});

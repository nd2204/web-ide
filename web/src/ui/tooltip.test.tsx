import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

function Subject({ delayDuration }: { delayDuration?: number }) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button">Step</button>
        </TooltipTrigger>
        <TooltipContent>Step the program</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("opens on hover only after 300ms", () => {
    render(<Subject />);
    const trigger = screen.getByRole("button", { name: "Step" });
    fireEvent.pointerMove(trigger, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(299));
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Step the program");
  });

  it("opens at once on focus", () => {
    render(<Subject delayDuration={0} />);
    fireEvent.focus(screen.getByRole("button", { name: "Step" }));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("is dropped on touch", () => {
    render(<Subject />);
    fireEvent.pointerMove(screen.getByRole("button", { name: "Step" }), {
      pointerType: "touch",
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

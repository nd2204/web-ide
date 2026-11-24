import { Choice } from "@nand2tetris/components/choice.js";
import { Field } from "@nand2tetris/components/field.js";
import { Runbar } from "@nand2tetris/components/runbar.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormRoot from "./form_controls";

class IdleTimer extends Timer {
  async tick() {
    return false;
  }
  reset() {
    // Nothing to reset: the timer only carries speed and steps.
  }
  toggle() {
    // Never started in these tests.
  }
}

function renderRunbar(speed: 0 | 1 | 2 | 3 | 4 = 2) {
  const timer = new IdleTimer();
  const onSpeedChange = vi.fn();
  render(
    <FormRoot>
      <Runbar runner={timer} speed={speed} onSpeedChange={onSpeedChange} />
    </FormRoot>,
  );
  const slider = screen.getByRole("slider", { name: "Execution speed" });
  return { timer, onSpeedChange, slider };
}

// jsdom has no layout, so the slider is driven by keyboard events only.
describe("Run bar speed Slider", () => {
  it("is a named Slider at the starting speed", () => {
    const { slider, timer } = renderRunbar(2);
    expect(slider).toHaveAttribute("aria-valuenow", "2");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "4");
    expect([timer.speed, timer.steps]).toEqual([16, 1]);
  });

  it("maps each step to the timer's speed and steps", () => {
    const { slider, timer, onSpeedChange } = renderRunbar(2);

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onSpeedChange).toHaveBeenLastCalledWith(3);
    expect([timer.speed, timer.steps]).toEqual([16, 16666]);

    fireEvent.keyDown(slider, { key: "End" });
    expect(onSpeedChange).toHaveBeenLastCalledWith(4);
    expect([timer.speed, timer.steps]).toEqual([16, 16666 * 30]);

    fireEvent.keyDown(slider, { key: "Home" });
    expect(onSpeedChange).toHaveBeenLastCalledWith(0);
    expect([timer.speed, timer.steps]).toEqual([1000, 1]);

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onSpeedChange).toHaveBeenLastCalledWith(1);
    expect([timer.speed, timer.steps]).toEqual([500, 1]);
    expect(slider).toHaveAttribute("aria-valuenow", "1");
  });
});

describe("FormRoot", () => {
  it("renders a components Field as the shadcn Input", () => {
    render(
      <FormRoot>
        <Field aria-label="Address" defaultValue="16" />
      </FormRoot>,
    );
    const field = screen.getByRole("textbox", { name: "Address" });
    expect(field).toHaveAttribute("data-slot", "input");
    expect(field).toHaveValue("16");
  });

  it("renders a components Choice as the shadcn Select", () => {
    render(
      <FormRoot>
        <Choice
          aria-label="Number format"
          value="dec"
          options={["bin", "dec", "hex"]}
          onChange={() => undefined}
        />
      </FormRoot>,
    );
    const trigger = screen.getByRole("combobox", { name: "Number format" });
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveTextContent("dec");
  });
});

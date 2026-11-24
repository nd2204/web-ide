import { Memory, MemoryKeyboard } from "@nand2tetris/simulator/cpu/memory.js";
import { fireEvent, render, screen } from "@testing-library/react";
import { Keyboard } from "./keyboard.js";

function setup() {
  const keyboard = new MemoryKeyboard(new Memory(0x6001));
  render(
    <>
      <Keyboard keyboard={keyboard} />
      <input aria-label="Name" />
      <div role="dialog" aria-label="Dialog">
        <button>Inside</button>
      </div>
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Enable Keyboard" }));
  return keyboard;
}

describe("<Keyboard />", () => {
  it("forwards a key pressed on the page", () => {
    const keyboard = setup();
    fireEvent.keyDown(document.body, { key: "a" });
    expect(keyboard.getKey()).toBe("a".charCodeAt(0));
  });

  it("ignores keys typed into an editable field", () => {
    const keyboard = setup();
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    screen.getByRole("textbox", { name: "Name" }).dispatchEvent(event);
    expect(keyboard.getKey()).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores keys pressed inside a dialog", () => {
    const keyboard = setup();
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    screen.getByRole("button", { name: "Inside" }).dispatchEvent(event);
    expect(keyboard.getKey()).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });
});

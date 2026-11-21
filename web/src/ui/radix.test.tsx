import * as Dialog from "@radix-ui/react-dialog";
import { render, screen, userEvent } from "../testing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// Proves the jsdom stubs in setupTests.ts are enough for Radix parts to open,
// so later primitive steps can write component tests without per-file stubs.

describe("Radix in jsdom", () => {
  it("opens a Select and picks an option", async () => {
    const events = userEvent.setup();
    const onValueChange = vi.fn();
    await render(
      <Select value="a" onValueChange={onValueChange}>
        <SelectTrigger aria-label="Letter">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>,
    );

    await events.click(screen.getByRole("combobox", { name: "Letter" }));
    await events.click(await screen.findByRole("option", { name: "Beta" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("opens a Dialog and closes it with Escape", async () => {
    const events = userEvent.setup();
    await render(
      <Dialog.Root>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Settings</Dialog.Title>
            <Dialog.Description>Pick things</Dialog.Description>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>,
    );

    await events.click(screen.getByRole("button", { name: "Open" }));
    expect(
      await screen.findByRole("dialog", { name: "Settings" }),
    ).toBeVisible();
    await events.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

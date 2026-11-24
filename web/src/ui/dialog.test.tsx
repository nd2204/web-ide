import { useState } from "react";
import { render, screen, userEvent } from "../testing";
import { Dialog, DialogContent } from "./dialog";

function Harness({ onClosed }: { onClosed: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            onClosed();
            setOpen(false);
          }
        }}
      >
        <DialogContent heading="Warning" closeLabel="Close">
          <button>Inside</button>
        </DialogContent>
      </Dialog>
    </>
  );
}

describe("<Dialog />", () => {
  it("is a named modal dialog with a labelled close key", async () => {
    const events = userEvent.setup();
    await render(<Harness onClosed={() => undefined} />);
    await events.click(screen.getByRole("button", { name: "Open" }));
    expect(
      await screen.findByRole("dialog", { name: "Warning" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Close" })).toBeVisible();
  });

  it("returns focus to the opener on Escape", async () => {
    const events = userEvent.setup();
    const onClosed = vi.fn();
    await render(<Harness onClosed={onClosed} />);
    const opener = screen.getByRole("button", { name: "Open" });
    await events.click(opener);
    await screen.findByRole("dialog", { name: "Warning" });

    await events.keyboard("{Escape}");
    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    await vi.waitFor(() => expect(opener).toHaveFocus());
  });

  it("closes through the X key but not by clicking outside", async () => {
    const events = userEvent.setup();
    const onClosed = vi.fn();
    await render(<Harness onClosed={onClosed} />);
    await events.click(screen.getByRole("button", { name: "Open" }));
    await screen.findByRole("dialog", { name: "Warning" });

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    await events.click(overlay as Element);
    expect(onClosed).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Warning" })).toBeVisible();

    await events.click(screen.getByRole("button", { name: "Close" }));
    expect(onClosed).toHaveBeenCalledTimes(1);
  });
});

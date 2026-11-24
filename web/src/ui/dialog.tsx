import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { cn } from "./cn";

export const Dialog = DialogPrimitive.Root;
export const DialogDescription = DialogPrimitive.Description;

const Cross = () => (
  <svg
    aria-hidden="true"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

type DialogContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "title"
> & {
  /** The dialog's accessible name and visible heading. */
  heading: React.ReactNode;
  /** The accessible name of the X key. Required so every caller translates it. */
  closeLabel: string;
};

/**
 * A modal raised key, centred and bounded by the viewport (it scrolls inside,
 * on a phone too). Escape and the X key both call the root's `onOpenChange`;
 * clicking the overlay does not, so a stray tap never throws work away.
 */
export function DialogContent({
  className,
  heading,
  closeLabel,
  children,
  onPointerDownOutside,
  onInteractOutside,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: DialogContentProps) {
  // These dialogs are controlled and have no Radix Trigger, and Radix's modal
  // content only restores focus to a Trigger. Remember the opener ourselves.
  const opener = React.useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-40 bg-black/45"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 block max-h-[calc(100dvh-1rem)] w-[min(28rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border-2 border-key-edge bg-key text-foreground shadow-[0_6px_0_rgb(0_0_0/0.22)] outline-none",
          className,
        )}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          onPointerDownOutside?.(event);
        }}
        onInteractOutside={(event) => {
          event.preventDefault();
          onInteractOutside?.(event);
        }}
        onOpenAutoFocus={(event) => {
          opener.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          event.preventDefault();
          if (opener.current?.isConnected) opener.current.focus();
        }}
        {...props}
      >
        <div
          data-slot="dialog-header"
          className="sticky top-0 z-10 flex min-h-11 items-center justify-between gap-3 border-b border-border bg-muted px-5 py-2"
        >
          <DialogPrimitive.Title
            data-slot="dialog-title"
            className="m-0 min-w-0 text-[1.1rem] leading-tight font-bold"
          >
            {heading}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label={closeLabel}
            className="mb-0 inline-flex size-7 coarse:size-11 w-auto shrink-0 items-center justify-center rounded-full border border-key-edge bg-key text-foreground outline-none hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Cross />
          </DialogPrimitive.Close>
        </div>
        <div data-slot="dialog-body" className="p-5">
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/** A row of keys under the dialog's message. */
export function DialogActions({
  className,
  align = "end",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="dialog-actions"
      className={cn(
        "mt-4 flex flex-wrap gap-3",
        align === "end" ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

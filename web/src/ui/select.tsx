import * as SelectPrimitive from "@radix-ui/react-select";
import type * as React from "react";
import { cn } from "./cn";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

const Chevron = () => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** A sunk well that opens a list; the list itself is drawn here, not by the OS. */
export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "inline-flex min-h-7 w-full min-w-0 items-center justify-between gap-2 rounded-full border border-well-edge bg-well px-3 text-[0.9rem] text-foreground outline-none hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 data-[placeholder]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <Chevron />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position="popper"
        sideOffset={4}
        className={cn(
          "z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-md border border-key-edge bg-key p-1 text-foreground",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative grid cursor-default select-none items-center rounded-sm px-2 py-1 text-[0.9rem] outline-none data-[disabled]:opacity-50 data-[highlighted]:bg-[color-mix(in_srgb,var(--lh-yellow)_28%,var(--lh-key))] data-[state=checked]:font-bold",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

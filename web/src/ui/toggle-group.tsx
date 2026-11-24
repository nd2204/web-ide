import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import type * as React from "react";
import { cn } from "./cn";

type Named = { "aria-label": string } | { "aria-labelledby": string };

type SingleProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "onValueChange" | "defaultValue"
> &
  Named & {
    value: string;
    /** Never called with "": pressing the chosen key again keeps it chosen. */
    onValueChange: (value: string) => void;
  };

/**
 * A segmented well for a short exclusive choice: the chosen segment rises as a
 * lit key. Segments wrap onto a second row rather than clip.
 */
export function ToggleGroup({
  className,
  onValueChange,
  ...props
}: SingleProps) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      type="single"
      onValueChange={(value) => {
        if (value) onValueChange(value);
      }}
      className={cn(
        "mb-0 inline-flex w-auto max-w-full justify-self-start flex-wrap items-center gap-0.5 rounded-[1.1rem] border border-well-edge bg-well p-0.5",
        className,
      )}
      {...props}
    />
  );
}

export function ToggleGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "mb-0 inline-flex w-auto min-h-7 coarse:min-h-11 items-center justify-center whitespace-normal rounded-full border border-transparent bg-transparent px-3 text-[0.9rem] font-bold leading-tight text-foreground shadow-none outline-none transition-[background-color,border-color,box-shadow] duration-100 hover:bg-[color-mix(in_srgb,var(--lh-key)_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=on]:border-key-edge data-[state=on]:bg-key data-[state=on]:shadow-[inset_0_-2px_0_rgb(0_0_0/0.14)] disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

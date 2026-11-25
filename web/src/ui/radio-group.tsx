import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type * as React from "react";
import { type ReactNode, useId } from "react";
import { cn } from "./cn";

type Named = { "aria-label": string } | { "aria-labelledby": string };

/** A stack of choice keys; one is chosen. Name it with a label or a heading. */
export function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & Named) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn(
        "grid grid-flow-row grid-cols-1 *:min-w-0 gap-2",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A choice key: a lit face with a well holding a yellow lamp when chosen. The
 * label names it; the hint is announced as its description.
 */
export function RadioGroupItem({
  className,
  label,
  hint,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "children"> & {
  label: ReactNode;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      aria-labelledby={`${id}-label`}
      aria-describedby={hint ? `${id}-hint` : undefined}
      className={cn(
        "mb-0 inline-flex w-full min-h-7 coarse:min-h-11 cursor-pointer items-start gap-3 rounded-sm border border-key-edge bg-key px-3 py-2 text-left text-foreground shadow-[inset_0_-2px_0_rgb(0_0_0/0.14)] outline-none transition-[border-color,box-shadow] duration-100 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-foreground data-[state=checked]:shadow-[inset_0_1px_0_rgb(0_0_0/0.14)] disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <span
        data-slot="radio-group-well"
        className="mt-[0.2em] grid size-4 shrink-0 place-items-center rounded-full border border-well-edge bg-well"
      >
        <RadioGroupPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="block size-2 rounded-full bg-primary"
        />
      </span>
      <span className="grid grid-flow-row grid-cols-1 *:min-w-0 gap-0.5">
        <span
          id={`${id}-label`}
          className="text-[1rem] font-bold leading-tight"
        >
          {label}
        </span>
        {hint && (
          <span
            id={`${id}-hint`}
            className="text-[0.85rem] font-normal leading-snug text-foreground"
          >
            {hint}
          </span>
        )}
      </span>
    </RadioGroupPrimitive.Item>
  );
}

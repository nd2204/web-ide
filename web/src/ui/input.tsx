import type * as React from "react";
import { cn } from "./cn";

/** Shared by Input and Textarea: a sunk well with an edge, never raised. */
export const wellClasses =
  "mb-0 block w-full min-w-0 rounded-sm border border-well-edge bg-well text-foreground shadow-none outline-none appearance-none placeholder:text-muted-foreground hover:border-foreground focus:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60 aria-[invalid=true]:border-[var(--lh-red)]";

/** A single-line text field. */
export function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        wellClasses,
        "h-auto min-h-7 coarse:min-h-11 px-2 py-0.5 text-[1rem] leading-[1.25]",
        className,
      )}
      {...props}
    />
  );
}

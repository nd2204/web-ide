import type * as React from "react";
import { cn } from "./cn";
import { wellClasses } from "./input";

/** A multi-line well for source text; set in the mono face. */
export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        wellClasses,
        "h-auto min-h-16 p-2 [font-family:var(--font-family-monospace)] [font-size:var(--font-size-monospace)] leading-normal",
        className,
      )}
      {...props}
    />
  );
}

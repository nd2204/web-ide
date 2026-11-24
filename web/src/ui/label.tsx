import type * as React from "react";
import { cn } from "./cn";

/** The printed legend next to a field or switch. */
export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "mb-0 block w-auto text-[0.85rem] font-normal leading-tight text-foreground select-none",
        className,
      )}
      {...props}
    />
  );
}

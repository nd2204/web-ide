import * as SwitchPrimitive from "@radix-ui/react-switch";
import type * as React from "react";
import { cn } from "./cn";

/**
 * A sunk track with a key for a thumb; on turns the track output green. The
 * button is the 44px touch target and the track inside it keeps its size.
 */
export function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group mb-0 inline-flex w-auto shrink-0 items-center justify-center coarse:min-h-11 coarse:min-w-11 rounded-full border-0 bg-transparent p-0 text-foreground shadow-none outline-none disabled:opacity-60",
        className,
      )}
      {...props}
    >
      <span
        data-slot="switch-track"
        className="inline-flex h-6 w-11 items-center rounded-full border border-well-edge bg-well p-0.5 transition-colors duration-100 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring group-data-[state=checked]:border-[color-mix(in_srgb,var(--lh-green)_60%,black)] group-data-[state=checked]:bg-output-pin"
      >
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className="pointer-events-none block size-4 rounded-full border border-key-edge bg-key shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=checked]:translate-x-5"
        />
      </span>
    </SwitchPrimitive.Root>
  );
}

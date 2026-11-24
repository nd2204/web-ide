import * as SliderPrimitive from "@radix-ui/react-slider";
import type * as React from "react";
import { cn } from "./cn";

/** A sunk well track with a round key for a thumb (one thumb only). */
export function Slider({
  className,
  thumbLabel,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** The accessible name of the thumb, which is the focusable part. */
  thumbLabel: string;
}) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative inline-flex w-full h-6 coarse:min-h-11 shrink-0 touch-none select-none items-center data-[disabled]:opacity-60",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-2 grow rounded-full border border-well-edge bg-well"
      />
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        aria-label={thumbLabel}
        className="block size-5 cursor-grab rounded-full border-[1.5px] border-key-edge bg-key shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] outline-none transition-colors duration-100 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing data-[disabled]:cursor-default"
      />
    </SliderPrimitive.Root>
  );
}

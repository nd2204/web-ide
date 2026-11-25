import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type * as React from "react";
import { cn } from "./cn";

// Keycap bars: each item is a lit key with a key edge, its title on the left
// and a chevron on the right that turns down when open. Several items can be
// open at once. Closed content stays mounted (hidden), like `<details>`, so a
// widget inside keeps its state.

type AccordionProps = Omit<
  React.ComponentProps<typeof AccordionPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
};

/** The items stack with a small gap, inset from the panel edge. */
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      type="multiple"
      className={cn("m-0 inline-flex w-full flex-col gap-1.5 p-2", className)}
      {...props}
    />
  );
}

export function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "m-0 overflow-hidden rounded-md border border-solid border-key-edge bg-key p-0 text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className="m-0 inline-flex w-full p-0 text-base font-bold leading-tight"
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/trigger m-0 inline-flex w-full coarse:min-h-11 cursor-pointer items-center justify-between gap-2 rounded-none border-0 bg-transparent px-3 py-2 text-start text-base font-bold leading-tight text-foreground shadow-none outline-none transition-colors duration-100 hover:bg-[color-mix(in_srgb,var(--color-key)_88%,var(--color-foreground))] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 -rotate-90 text-muted-foreground transition-transform duration-100 group-data-[state=open]/trigger:rotate-0 motion-reduce:transition-none"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof AccordionPrimitive.Content>,
  "forceMount"
>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      forceMount
      className={cn("m-0 p-0 data-[state=closed]:hidden", className)}
      {...props}
    />
  );
}

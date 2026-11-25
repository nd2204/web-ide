import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";
import { cn } from "./cn";

// Pill tabs on a seam: inactive tabs are muted on the panel, the selected tab
// is a Raised pill with a seam edge and the accent label. The list wraps onto
// more rows rather than push the panel wider. Content keeps a 6rem floor, so a
// short panel scrolls instead of squeezing an editor to nothing. Inactive
// content stays mounted (hidden), so an editor in a tab keeps its state.

/** Fills its parent: the list on top, the selected content below. */
export function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        "m-0 inline-flex size-full flex-col gap-1 px-2 pt-[0.35rem]",
        className,
      )}
      {...props}
    />
  );
}

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "m-0 inline-flex w-full shrink-0 flex-wrap items-end gap-1 border-0 border-b border-solid border-border p-0 ps-2",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "m-0 inline-flex w-auto coarse:min-h-11 cursor-pointer items-center justify-center whitespace-normal rounded-full border border-solid border-transparent bg-transparent px-[0.7rem] py-[0.2rem] text-center text-[0.9rem] font-normal leading-[1.25] text-muted-foreground shadow-none outline-none transition-colors duration-100 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=active]:border-border data-[state=active]:bg-muted data-[state=active]:text-primary-text motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({
  className,
  ...props
}: Omit<React.ComponentProps<typeof TabsPrimitive.Content>, "forceMount">) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      forceMount
      className={cn(
        "m-0 block min-h-24 flex-1 p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=inactive]:hidden",
        className,
      )}
      {...props}
    />
  );
}

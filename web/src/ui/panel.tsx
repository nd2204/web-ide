import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { createContext, useContext } from "react";
import { cn } from "./cn";

// A panel: the Panel ground inside a 1px seam with a Raised title bar. A panel
// inside a panel is a section divided by a seam, not a card. Content wider than
// the panel (a pin table at a large text size, the 512px screen on a phone)
// scrolls sideways inside it, never clips; inline-size containment keeps that
// content from widening the panel, so its title bar stays in view.
// The parts are divs, not `article`/`section`/`header`, so no element rule in
// ui/base.css reaches them.

const InPanel = createContext(false);

const panelVariants = cva(
  "m-0 inline-flex w-full flex-col overflow-x-auto [contain:inline-size] border-solid border-border bg-card p-0 text-foreground shadow-none",
  {
    variants: {
      /** `scroll` lets long content scroll; `clip` keeps an editor's own scroller. */
      overflow: {
        scroll: "overflow-y-auto",
        clip: "overflow-y-hidden",
      },
      nested: {
        false: "rounded-md border",
        true: "rounded-none border-0 border-t",
      },
    },
    defaultVariants: { overflow: "scroll", nested: false },
  },
);

/** Name a panel with `aria-labelledby` (its title's id) to make it a region. */
export function Panel({
  className,
  overflow,
  ...props
}: React.ComponentProps<"div"> &
  Pick<VariantProps<typeof panelVariants>, "overflow">) {
  const nested = useContext(InPanel);
  return (
    <InPanel.Provider value={true}>
      <div
        data-slot="panel"
        data-nested={nested || undefined}
        className={cn(panelVariants({ overflow, nested }), className)}
        {...props}
      />
    </InPanel.Provider>
  );
}

/**
 * The title bar: as tall as one row of keys, controls wrap beneath. Its first
 * child (the title) lines up with the first row of controls.
 */
export function PanelHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "m-0 inline-flex w-full flex-wrap items-start justify-between gap-x-3 gap-y-[0.4rem] rounded-none border-0 border-b border-solid border-border bg-muted px-[0.6rem] py-[0.1rem] font-bold *:first:inline-flex *:first:min-h-7 *:first:items-center *:first:whitespace-nowrap *:first:px-2",
        className,
      )}
      {...props}
    />
  );
}

/** Give it an `id` and point the Panel's `aria-labelledby` at it. */
export function PanelTitle(props: React.ComponentProps<"div">) {
  return <div data-slot="panel-title" {...props} />;
}

const bodyVariants = cva("m-0 flex-1 p-0", {
  variants: {
    /**
     * `flow` lays the content out as blocks that scroll with the panel; `fill`
     * shrinks content that brings its own scroller (an editor, a memory list)
     * to the panel's height. Use `fill` in a `clip` panel.
     */
    layout: {
      flow: "block",
      fill: "inline-flex w-full min-h-0 flex-col",
    },
  },
  defaultVariants: { layout: "flow" },
});

export function PanelBody({
  className,
  layout,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof bodyVariants>) {
  return (
    <div
      data-slot="panel-body"
      className={cn(bodyVariants({ layout }), className)}
      {...props}
    />
  );
}

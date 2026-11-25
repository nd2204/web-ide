import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./cn";

// A data table on the panel ground: seam rules between rows, muted small-caps
// headings like the pin table's, and values in the mono face with tabular
// numerals. Pico still styles bare `table`, `th` and `td` until its last step,
// so every part sets margin, border, padding, colour and alignment itself.

/**
 * `density="compact"` fits a long list (the symbol table) into a small panel.
 * The cells read it from `data-density`, so it is not a class on the table.
 */
export function Table({
  className,
  density = "default",
  ...props
}: React.ComponentProps<"table"> & { density?: "default" | "compact" }) {
  return (
    <table
      data-slot="table"
      data-density={density}
      className={cn(
        "group/table mb-0 w-full border-collapse border-spacing-0 text-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** The column headings stay in view while the rows scroll under them. */
export function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 z-[1] bg-card", className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />;
}

/** `aria-current="true"` marks the current row with the step tint. */
export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-0 border-b border-solid border-border aria-[current=true]:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

const cellBase =
  "border-0 px-3 py-1.5 align-middle group-data-[density=compact]/table:px-2 group-data-[density=compact]/table:py-0.5";

const cellVariants = cva(cellBase, {
  variants: {
    align: {
      start: "text-start",
      end: "text-end",
    },
    /** `fail` tints a value that differs from the expected one. */
    tone: {
      default: "",
      fail: "bg-[color-mix(in_srgb,var(--color-destructive)_16%,transparent)]",
    },
  },
  defaultVariants: { align: "start", tone: "default" },
});

export function TableHead({
  className,
  align,
  ...props
}: Omit<React.ComponentProps<"th">, "align"> &
  Pick<VariantProps<typeof cellVariants>, "align">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        cellVariants({ align }),
        "pt-3 text-[0.75rem] font-bold uppercase leading-tight tracking-[0.08em] text-muted-foreground group-data-[density=compact]/table:[overflow-wrap:anywhere] group-data-[density=compact]/table:pt-2",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  align,
  tone,
  ...props
}: Omit<React.ComponentProps<"td">, "align"> &
  VariantProps<typeof cellVariants>) {
  return (
    <td
      data-slot="table-cell"
      data-tone={tone ?? undefined}
      className={cn(
        cellVariants({ align, tone }),
        "font-normal text-foreground tabular-nums group-data-[density=compact]/table:[overflow-wrap:anywhere] [font-family:var(--font-family-monospace)] [font-size:var(--font-size-monospace)] leading-normal group-data-[density=compact]/table:leading-tight",
        className,
      )}
      {...props}
    />
  );
}

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./cn";

// A calculator key: a lit face, a strong edge, and a darker lip along the
// bottom that flattens when pressed.
const buttonVariants = cva(
  "inline-flex w-auto mb-0 shrink-0 min-h-7 coarse:min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[0.9rem] font-bold leading-tight shadow-[inset_0_-2px_0_rgb(0_0_0/0.14)] transition-[transform,background-color,border-color,box-shadow] duration-100 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px active:shadow-[inset_0_1px_0_rgb(0_0_0/0.14)] disabled:pointer-events-none disabled:border-border disabled:bg-transparent disabled:opacity-60 [&_.material-symbols-outlined]:text-[1.15rem] [&_.material-symbols-outlined]:leading-none has-[>.material-symbols-outlined:only-child]:size-7 has-[>.material-symbols-outlined:only-child]:coarse:min-w-11 has-[>.material-symbols-outlined:only-child]:p-0",
  {
    variants: {
      variant: {
        default:
          "border-key-edge bg-key text-foreground hover:border-foreground hover:bg-[color-mix(in_srgb,var(--color-key)_88%,var(--color-foreground))] aria-[current=true]:bg-primary-foreground aria-[current=true]:text-primary",
        primary:
          "border-[color-mix(in_srgb,var(--color-primary)_60%,black)] bg-primary text-primary-foreground hover:brightness-110",
      },
      size: {
        default: "",
        icon: "size-7 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

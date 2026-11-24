import { type TipProps, TipProvider } from "@nand2tetris/components/tooltip.js";
import { type ReactNode, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function RadixTip({
  label,
  placement = "bottom",
  disabled,
  children,
}: TipProps) {
  // Controlled, so toggling `disabled` never remounts the child.
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open && !disabled} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={placement}>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Makes every `Tip` in `components` a Radix tooltip. */
export function TipRoot({ children }: { children: ReactNode }) {
  return <TipProvider value={RadixTip}>{children}</TipProvider>;
}

export { Tip } from "@nand2tetris/components/tooltip.js";

import { type BtnProps, BtnProvider } from "@nand2tetris/components/button.js";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

function ShadcnBtn({ variant, ...props }: BtnProps) {
  return <Button variant={variant} {...props} />;
}

/** Makes every `Btn` in `components` a shadcn Button. */
export function BtnRoot({ children }: { children: ReactNode }) {
  return <BtnProvider value={ShadcnBtn}>{children}</BtnProvider>;
}

export { Btn } from "@nand2tetris/components/button.js";

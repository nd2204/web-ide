import type { PanelProps } from "@nand2tetris/components/panel.js";
import { useId } from "react";
import {
  PanelBody,
  PanelHeader,
  Panel as PanelRoot,
  PanelTitle,
} from "../ui/panel";

/**
 * A tool panel: a title bar (the title, then its controls) over the content.
 * A titled panel is a region named by its title. `components` widgets get the
 * same panel through `PanelProvider` (see `form_controls.tsx`).
 */
export function Panel({
  children,
  title,
  header,
  className,
  style,
  overflow,
  "aria-label": label,
}: PanelProps) {
  const titleId = useId();
  return (
    <PanelRoot
      role={title || label ? "region" : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      className={className}
      style={style}
      overflow={overflow}
    >
      {(title || header) && (
        <PanelHeader>
          {title && <PanelTitle id={titleId}>{title}</PanelTitle>}
          {header}
        </PanelHeader>
      )}
      <PanelBody layout={overflow === "clip" ? "fill" : "flow"}>
        {children}
      </PanelBody>
    </PanelRoot>
  );
}

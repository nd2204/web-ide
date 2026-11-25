import {
  type ComponentType,
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from "react";

export interface PanelProps {
  children?: ReactNode;
  /** The visible title; it also names the panel as a region. */
  title?: ReactNode;
  /** Names a panel that has no visible title. */
  "aria-label"?: string;
  /** Controls in the title bar, after the title. */
  header?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * `scroll` (default) scrolls the whole panel. `clip` is for content that
   * brings its own scroller (an editor, a memory list): it fills the panel.
   */
  overflow?: "scroll" | "clip";
}

/** Without a provider a Panel is plain divs that the page styles itself. */
function PlainPanel({
  children,
  title,
  header,
  className,
  style,
  "aria-label": label,
}: PanelProps) {
  const titleId = useId();
  return (
    <div
      role={title || label ? "region" : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      className={className}
      style={style}
    >
      {(title || header) && (
        <div>
          {title && <div id={titleId}>{title}</div>}
          {header}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

const PanelContext = createContext<ComponentType<PanelProps>>(PlainPanel);

/** `web` provides the shadcn Panel; widgets here stay free of Radix and Tailwind. */
export const PanelProvider = PanelContext.Provider;

export function Panel(props: PanelProps) {
  const Renderer = useContext(PanelContext);
  return <Renderer {...props} />;
}

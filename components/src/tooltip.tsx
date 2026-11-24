import {
  cloneElement,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";

export type TipPlacement = "top" | "bottom" | "left" | "right";

export interface TipProps {
  /** The tooltip text. Never the only carrier of the control's name. */
  label: string;
  placement?: TipPlacement;
  /** Suppress the tooltip (for example while a menu inside the child is open). */
  disabled?: boolean;
  /** One element that accepts a ref and DOM props, such as a button. */
  children: ReactElement;
}

export type TipWrapper = (props: TipProps) => ReactNode;

/** Without a provider a tip is the browser's own `title` tooltip. */
const TitleTip: TipWrapper = ({ label, disabled, children }) =>
  disabled
    ? children
    : cloneElement(children as ReactElement<{ title?: string }>, {
        title: label,
      });

const TipContext = createContext<TipWrapper>(TitleTip);

/** `web` provides a wrapper that draws its own tooltip; widgets stay free of it. */
export const TipProvider = TipContext.Provider;

export function Tip(props: TipProps) {
  const Wrapper = useContext(TipContext);
  return <>{Wrapper(props)}</>;
}

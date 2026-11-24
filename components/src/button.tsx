import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";

export interface BtnProps extends ComponentProps<"button"> {
  /** `primary` is the single yellow action on a screen. */
  variant?: "default" | "primary";
}

export type BtnRenderer = (props: BtnProps) => ReactNode;

/** Without a provider a Btn is a plain `<button>` that the page styles itself. */
const PlainBtn: BtnRenderer = ({ variant: _variant, ...props }) => (
  <button type="button" {...props} />
);

const BtnContext = createContext<BtnRenderer>(PlainBtn);

/** `web` provides the shadcn Button; widgets here stay free of Radix and Tailwind. */
export const BtnProvider = BtnContext.Provider;

export function Btn(props: BtnProps) {
  const Renderer = useContext(BtnContext);
  return <>{Renderer(props)}</>;
}

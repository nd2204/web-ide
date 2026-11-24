import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
} from "react";

export interface RangeProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** The control's accessible name. */
  "aria-label": string;
  disabled?: boolean;
  style?: CSSProperties;
}

export type RangeRenderer = (props: RangeProps) => ReactNode;

/** Without a provider a Range is the browser's own `<input type="range">`. */
const NativeRange: RangeRenderer = ({ onChange, ...props }) => (
  <input
    type="range"
    {...props}
    onChange={(e) => onChange(Number(e.target.value))}
  />
);

const RangeContext = createContext<RangeRenderer>(NativeRange);

/** `web` provides the shadcn Slider; widgets here stay free of Radix and Tailwind. */
export const RangeProvider = RangeContext.Provider;

/** A slider over a small range of whole steps. */
export function Range(props: RangeProps) {
  const Renderer = useContext(RangeContext);
  return <>{Renderer(props)}</>;
}

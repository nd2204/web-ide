import { createContext, type ReactNode, useContext } from "react";

export interface ChoiceProps {
  value: string;
  /** Each option is shown as its own value. */
  options: readonly string[];
  onChange: (value: string) => void;
  /** The control's accessible name; a Choice has no visible label. */
  "aria-label": string;
  disabled?: boolean;
  "data-testid"?: string;
}

export type ChoiceRenderer = (props: ChoiceProps) => ReactNode;

/** Without a provider a Choice is the browser's own `<select>`. */
const NativeChoice: ChoiceRenderer = ({ options, onChange, ...props }) => (
  <select {...props} onChange={(e) => onChange(e.target.value)}>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const ChoiceContext = createContext<ChoiceRenderer>(NativeChoice);

/** `web` provides the shadcn Select; widgets here stay free of Radix and Tailwind. */
export const ChoiceProvider = ChoiceContext.Provider;

/** A drop-down choice of one value from a short list. */
export function Choice(props: ChoiceProps) {
  const Renderer = useContext(ChoiceContext);
  return <>{Renderer(props)}</>;
}

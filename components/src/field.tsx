import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";

export type FieldProps = ComponentProps<"input">;

export type FieldRenderer = (props: FieldProps) => ReactNode;

/** Without a provider a Field is a plain `<input>` that the page styles itself. */
const PlainField: FieldRenderer = (props) => <input {...props} />;

const FieldContext = createContext<FieldRenderer>(PlainField);

/** `web` provides the shadcn Input; widgets here stay free of Radix and Tailwind. */
export const FieldProvider = FieldContext.Provider;

/** A single-line text field. */
export function Field(props: FieldProps) {
  const Renderer = useContext(FieldContext);
  return <>{Renderer(props)}</>;
}

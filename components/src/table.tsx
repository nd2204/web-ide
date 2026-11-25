import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";

export interface TableProps extends ComponentProps<"table"> {
  /** `compact` rows fit a long list into a small panel. */
  density?: "default" | "compact";
}

export interface CellProps extends Omit<ComponentProps<"td">, "align"> {
  align?: "start" | "end";
  /** `fail` marks a value that differs from the expected one. */
  tone?: "default" | "fail";
}

export interface HeadProps extends Omit<ComponentProps<"th">, "align"> {
  align?: "start" | "end";
}

/**
 * The parts of a data table. Mark the current row with `aria-current="true"`.
 * `web` provides the shadcn Table; widgets here stay free of Radix and Tailwind.
 */
export interface TableParts {
  Table: (props: TableProps) => ReactNode;
  Header: (props: ComponentProps<"thead">) => ReactNode;
  Body: (props: ComponentProps<"tbody">) => ReactNode;
  Row: (props: ComponentProps<"tr">) => ReactNode;
  Head: (props: HeadProps) => ReactNode;
  Cell: (props: CellProps) => ReactNode;
}

/** Without a provider the parts are plain elements that the page styles itself. */
const PlainParts: TableParts = {
  Table: ({ density: _density, ...props }) => <table {...props} />,
  Header: (props) => <thead {...props} />,
  Body: (props) => <tbody {...props} />,
  Row: (props) => <tr {...props} />,
  Head: ({ align: _align, ...props }) => <th {...props} />,
  Cell: ({ align: _align, tone: _tone, ...props }) => <td {...props} />,
};

const TableContext = createContext<TableParts>(PlainParts);

export const TablePartsProvider = TableContext.Provider;

/** The table parts `web` provides, or plain elements without a provider. */
export function useTableParts(): TableParts {
  return useContext(TableContext);
}

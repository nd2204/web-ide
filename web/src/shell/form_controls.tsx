import {
  type ChoiceProps,
  ChoiceProvider,
} from "@nand2tetris/components/choice.js";
import {
  type FieldProps,
  FieldProvider,
} from "@nand2tetris/components/field.js";
import { PanelProvider } from "@nand2tetris/components/panel.js";
import {
  type RangeProps,
  RangeProvider,
} from "@nand2tetris/components/range.js";
import {
  type TableParts,
  TablePartsProvider,
} from "@nand2tetris/components/table.js";
import type { ReactNode } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Panel } from "./panel";

function ShadcnField(props: FieldProps) {
  return <Input {...props} />;
}

function ShadcnChoice({
  value,
  options,
  onChange,
  disabled,
  "aria-label": label,
  "data-testid": testId,
}: ChoiceProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-auto" aria-label={label} data-testid={testId}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ShadcnRange({
  value,
  onChange,
  "aria-label": label,
  ...props
}: RangeProps) {
  return (
    <Slider
      {...props}
      thumbLabel={label}
      value={[value]}
      onValueChange={([next]) => onChange(next)}
    />
  );
}

const SHADCN_TABLE: TableParts = {
  Table,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
};

/**
 * Makes every `Field`, `Choice` and `Range` in `components` a shadcn part, and
 * hands the shadcn Table parts and Panel to the widgets there.
 */
export default function FormRoot({ children }: { children: ReactNode }) {
  return (
    <FieldProvider value={ShadcnField}>
      <ChoiceProvider value={ShadcnChoice}>
        <RangeProvider value={ShadcnRange}>
          <TablePartsProvider value={SHADCN_TABLE}>
            <PanelProvider value={Panel}>{children}</PanelProvider>
          </TablePartsProvider>
        </RangeProvider>
      </ChoiceProvider>
    </FieldProvider>
  );
}

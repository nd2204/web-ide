import {
  type ChoiceProps,
  ChoiceProvider,
} from "@nand2tetris/components/choice.js";
import {
  type FieldProps,
  FieldProvider,
} from "@nand2tetris/components/field.js";
import {
  type RangeProps,
  RangeProvider,
} from "@nand2tetris/components/range.js";
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

/** Makes every `Field`, `Choice` and `Range` in `components` a shadcn part. */
export default function FormRoot({ children }: { children: ReactNode }) {
  return (
    <FieldProvider value={ShadcnField}>
      <ChoiceProvider value={ShadcnChoice}>
        <RangeProvider value={ShadcnRange}>{children}</RangeProvider>
      </ChoiceProvider>
    </FieldProvider>
  );
}

import { type ReactNode, useId } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

/** A boolean setting: its label on the left, the switch on the right. */
export function SwitchRow({
  checked,
  onCheckedChange,
  disabled,
  children,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="inline-flex w-auto items-center gap-2">
      <Label htmlFor={id} className="text-[0.9rem]">
        {children}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

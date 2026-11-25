import type { IconName } from "../icons";
import "./icon.scss";

export const Icon = ({ name }: { name: IconName }) => {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  );
};

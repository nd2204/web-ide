import "./icon.scss";

export const Icon = ({ name }: { name: string }) => {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {name}
    </span>
  );
};

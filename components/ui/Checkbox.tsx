import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
};

export default function Checkbox({ label, className, ...props }: CheckboxProps) {
  const classes = ["ds-checkbox", className].filter(Boolean).join(" ");
  return (
    <label className={classes}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

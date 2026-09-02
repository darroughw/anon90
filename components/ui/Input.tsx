import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  const classes = ["ds-input", className].filter(Boolean).join(" ");
  return <input className={classes} {...props} />;
}

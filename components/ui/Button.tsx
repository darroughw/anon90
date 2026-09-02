import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = ["ds-button", `ds-button--${variant}`, className].filter(Boolean).join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="ds-button__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

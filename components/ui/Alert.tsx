import type { ReactNode } from "react";

type AlertProps = {
  variant?: "info" | "error";
  children: ReactNode;
};

export default function Alert({ variant = "info", children }: AlertProps) {
  const classes = ["ds-alert", variant === "error" && "ds-alert--error"].filter(Boolean).join(" ");

  return (
    <div className={classes} role={variant === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

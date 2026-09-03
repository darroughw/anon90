import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ children, className, ...props }: CardProps) {
  const classes = ["ds-card", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

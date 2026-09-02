import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  const classes = ["ds-card", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

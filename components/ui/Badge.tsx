import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
};

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="ds-badge">
      <span className="ds-badge__value">{children}</span>
    </span>
  );
}

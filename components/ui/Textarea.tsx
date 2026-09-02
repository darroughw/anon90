import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...props }: TextareaProps) {
  const classes = ["ds-textarea", className].filter(Boolean).join(" ");
  return <textarea className={classes} {...props} />;
}

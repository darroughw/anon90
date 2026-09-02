"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog ref={ref} className="ds-dialog" onClose={onClose} onCancel={onClose}>
      <div className="ds-dialog__header">
        <h2 className="ds-dialog__title">{title}</h2>
        <button type="button" className="ds-dialog__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="ds-dialog__body">{children}</div>
    </dialog>
  );
}

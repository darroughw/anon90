"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastVariant = "info" | "error";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ShowToastOptions = {
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const id = nextId.current++;
      const variant = options?.variant ?? "info";
      const duration = options?.duration ?? 4000;

      setToasts((current) => [...current, { id, message, variant }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="ds-toast-region" aria-live="polite" role="status">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={["ds-toast", toast.variant === "error" && "ds-toast--error"]
              .filter(Boolean)
              .join(" ")}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              className="ds-toast__dismiss"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ToastItem, ToastVariant } from "./types";

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS: Record<ToastVariant, number> = {
  error: 6000,
  success: 4500,
  warning: 5000,
};

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; label: string }
> = {
  error: {
    container: "toast-error",
    icon: "text-[var(--toast-error-icon)]",
    label: "Error",
  },
  success: {
    container: "toast-success",
    icon: "text-[var(--toast-success-icon)]",
    label: "Success",
  },
  warning: {
    container: "toast-warning",
    icon: "text-[var(--toast-warning-icon)]",
    label: "Warning",
  },
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const className = `h-4 w-4 shrink-0 ${variantStyles[variant].icon}`;

  if (variant === "success") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M20 6 9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "warning") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v5m0 3h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const styles = variantStyles[item.variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`toast-card animate-fade-up ${styles.container}`}
    >
      <ToastIcon variant={item.variant} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">
          {styles.label}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-snug">{item.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="toast-dismiss shrink-0 rounded-lg p-1 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant = "error") => {
      const trimmed = message.trim();
      if (!trimmed) return;

      const id = crypto.randomUUID();
      setToasts((prev) => [...prev.slice(-4), { id, message: trimmed, variant }]);

      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS[variant]);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const toast = useCallback(
    (message: string, variant: ToastVariant = "error") => push(message, variant),
    [push]
  );

  const error = useCallback((message: string) => push(message, "error"), [push]);
  const success = useCallback(
    (message: string) => push(message, "success"),
    [push]
  );
  const warning = useCallback(
    (message: string) => push(message, "warning"),
    [push]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      for (const timer of activeTimers.values()) clearTimeout(timer);
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, error, success, warning, dismiss }}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end sm:px-0"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto w-full max-w-sm">
            <ToastCard item={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

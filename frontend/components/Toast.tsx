"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<{
  show: (message: string, kind?: ToastKind) => void;
} | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
              t.kind === "success"
                ? "bg-ink text-white ring-black/10"
                : "bg-danger text-white ring-black/10"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

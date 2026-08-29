"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastState {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple self-contained toast system
let toastListeners: Array<(toast: ToastState) => void> = [];

export function toast({
  title,
  description,
  variant = "default",
}: Omit<ToastState, "id">) {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach((fn) => fn({ id, title, description, variant }));
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  React.useEffect(() => {
    const fn = (t: ToastState) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    toastListeners.push(fn);
    return () => {
      toastListeners = toastListeners.filter((x) => x !== fn);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-lg border px-4 py-3 shadow-lg text-sm animate-in slide-in-from-bottom-2 fade-in",
            t.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-white border-stone-200 text-stone-900"
          )}
        >
          <div className="font-semibold">{t.title}</div>
          {t.description && (
            <div className="mt-0.5 text-stone-600 text-xs">{t.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

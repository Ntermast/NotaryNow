// src/components/ui/use-toast.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";

type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [counter, setCounter] = useState(0);

  const toast = (props: ToastProps) => {
    const id = counter;
    setCounter((prev) => prev + 1);
    setToasts((prev) => [...prev, { ...props, id }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-lg shadow-lg bg-white border-l-4 ${
              t.variant === "destructive" ? "border-red-500" : "border-primary"
            } animate-enter`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{t.title}</h4>
                {t.description && (
                  <p className="text-sm text-gray-500">{t.description}</p>
                )}
              </div>
              <button onClick={() => dismissToast(t.id)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
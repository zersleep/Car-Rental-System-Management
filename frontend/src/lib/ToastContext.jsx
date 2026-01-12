import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToastContext } from "@/lib/toastCore";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => {
        setToasts((s) => s.filter((x) => x.id !== t.id));
      }, t.duration || 3000)
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, [toasts]);

  const addToast = (message, type = "success", duration = 3000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((s) => [...s, { id, message, type, duration }]);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm w-full rounded-md px-4 py-3 shadow-lg flex items-center justify-between ${
              t.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <div className="text-sm">{t.message}</div>
            <Button
              variant="ghost"
              className="text-white opacity-80"
              onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

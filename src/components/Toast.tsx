"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastData {
  message: string;
  type: "success" | "error" | "info";
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[390px] animate-slide-up pointer-events-none">
      <div className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl pointer-events-auto",
        toast.type === "success" && "bg-emerald-600 text-white",
        toast.type === "error" && "bg-red-600 text-white",
        toast.type === "info" && "bg-zinc-800 text-white"
      )}>
        {toast.type === "success" && <CheckCircle className="h-4 w-4 flex-shrink-0" />}
        {toast.type === "error" && <XCircle className="h-4 w-4 flex-shrink-0" />}
        {toast.type === "info" && <Info className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1 text-sm font-medium">{toast.message}</span>
        <button onClick={onDismiss} className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

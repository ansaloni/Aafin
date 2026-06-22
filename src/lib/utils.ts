import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getProgressColor(percent: number): string {
  if (percent < 50) return "bg-emerald-500";
  if (percent < 75) return "bg-yellow-400";
  if (percent < 90) return "bg-orange-500";
  return "bg-red-500";
}

export function getProgressTextColor(percent: number): string {
  if (percent < 50) return "text-emerald-600";
  if (percent < 75) return "text-yellow-600";
  if (percent < 90) return "text-orange-600";
  return "text-red-600";
}

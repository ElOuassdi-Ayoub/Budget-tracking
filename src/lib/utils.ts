import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatMonthYear(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), "MMMM yyyy");
}

export function formatShortMonth(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), "MMM yyyy");
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

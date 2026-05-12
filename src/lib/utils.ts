import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Duration } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DURATION_LABELS: Record<Duration, string> = {
  THIRTY_MIN: "30 minutos",
  ONE_HOUR: "1 hora",
  TWO_HOURS: "2 horas",
};

export const DURATION_MINUTES: Record<Duration, number> = {
  THIRTY_MIN: 30,
  ONE_HOUR: 60,
  TWO_HOURS: 120,
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

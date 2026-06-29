import { format, formatDistanceToNow, isPast, isToday } from "date-fns";

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatCompactCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

export function formatDate(d?: Date | string | null) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

export function fromNow(d?: Date | string | null) {
  if (!d) return "";
  return formatDistanceToNow(new Date(d), { addSuffix: true });
}

/** Format a date for an <input type="date"> value (yyyy-MM-dd). */
export function toDateInputValue(d?: Date | string | null) {
  if (!d) return "";
  return format(new Date(d), "yyyy-MM-dd");
}

export function dueState(d?: Date | string | null): "none" | "today" | "overdue" | "upcoming" {
  if (!d) return "none";
  const date = new Date(d);
  if (isToday(date)) return "today";
  if (isPast(date)) return "overdue";
  return "upcoming";
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NodeCard({
  icon: Icon,
  title,
  typeBadge,
  statusBadge,
  subtitle,
  active,
  dim,
  onClick,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  typeBadge?: string;
  statusBadge?: ReactNode;
  subtitle?: string | null;
  active?: boolean;
  dim?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-80 rounded-2xl border bg-zinc-900/80 p-4 shadow-lg transition",
        active ? "border-emerald-500/50 ring-1 ring-emerald-500/30" : "border-white/10",
        onClick && "cursor-pointer hover:border-emerald-500/40",
        className,
      )}
    >
      {statusBadge && <div className="absolute -top-3 right-3">{statusBadge}</div>}
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate font-medium text-zinc-100">{title}</span>
        {typeBadge && <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-zinc-400">{typeBadge}</span>}
      </div>
      {subtitle && <p className={cn("mt-2 text-sm", dim ? "text-zinc-600" : "text-zinc-400")}>{subtitle}</p>}
    </div>
  );
}

export function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/25 ring-inset">
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      {label}
    </span>
  );
}

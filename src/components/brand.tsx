import { Radar } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  iconOnly = false,
  tone = "dark",
}: {
  className?: string;
  iconOnly?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Radar className="h-5 w-5" />
      </span>
      {!iconOnly && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            tone === "light" ? "text-white" : "text-slate-900",
          )}
        >
          TotalReach
        </span>
      )}
    </span>
  );
}

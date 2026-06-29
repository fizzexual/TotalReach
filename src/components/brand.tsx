import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Brand({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
        <Leaf className="h-4 w-4" />
      </span>
      {!iconOnly && (
        <span className="text-[17px] font-semibold tracking-tight text-zinc-100">{APP_NAME}</span>
      )}
    </span>
  );
}

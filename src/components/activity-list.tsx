import { Check, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { toggleActivity, deleteActivity } from "@/lib/actions/activities";
import { ACTIVITY_META, type ActivityType } from "@/lib/constants";
import { formatDate, fromNow, dueState } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ActivityRow = {
  id: string;
  type: string;
  title: string;
  notes: string | null;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  contact?: { id: string; firstName: string; lastName: string } | null;
  deal?: { id: string; title: string } | null;
};

export function ActivityList({
  activities,
  showLinks = true,
  emptyText = "No activities yet.",
}: {
  activities: ActivityRow[];
  showLinks?: boolean;
  emptyText?: string;
}) {
  if (!activities.length) {
    return <p className="px-5 py-6 text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <ul className="divide-y divide-white/[0.05]">
      {activities.map((a) => {
        const state = dueState(a.dueDate);
        return (
          <li key={a.id} className="flex items-start gap-3 px-5 py-3.5">
            <form action={toggleActivity}>
              <input type="hidden" name="id" value={a.id} />
              <button
                type="submit"
                aria-label={a.completed ? "Mark as not done" : "Mark as done"}
                className={cn(
                  "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition",
                  a.completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-white/20 text-transparent hover:border-emerald-400",
                )}
              >
                <Check className="h-3 w-3" />
              </button>
            </form>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={ACTIVITY_META[a.type as ActivityType]?.badge ?? "bg-zinc-500/15 text-zinc-300"}>
                  {a.type}
                </Badge>
                <span className={cn("truncate text-sm font-medium", a.completed ? "text-zinc-500 line-through" : "text-zinc-200")}>
                  {a.title}
                </span>
              </div>
              {a.notes && <p className="mt-0.5 line-clamp-2 text-sm text-zinc-400">{a.notes}</p>}
              <p className="mt-0.5 text-xs text-zinc-500">
                {a.dueDate && (
                  <span
                    className={cn(
                      "font-medium",
                      !a.completed && state === "overdue"
                        ? "text-rose-400"
                        : !a.completed && state === "today"
                          ? "text-amber-400"
                          : "text-zinc-500",
                    )}
                  >
                    Due {formatDate(a.dueDate)}
                    {" · "}
                  </span>
                )}
                {fromNow(a.createdAt)}
                {showLinks && a.contact ? ` · ${a.contact.firstName} ${a.contact.lastName}` : ""}
                {showLinks && a.deal ? ` · ${a.deal.title}` : ""}
              </p>
            </div>

            <form action={deleteActivity}>
              <input type="hidden" name="id" value={a.id} />
              <ConfirmButton type="submit" variant="ghost" size="icon" message="Delete this activity?">
                <Trash2 className="h-4 w-4 text-zinc-500" />
              </ConfirmButton>
            </form>
          </li>
        );
      })}
    </ul>
  );
}

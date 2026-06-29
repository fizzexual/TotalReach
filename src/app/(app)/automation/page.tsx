import Link from "next/link";
import { Workflow, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { AutomationFormModal } from "@/components/automation/automation-form-modal";
import { getTrigger } from "@/lib/automation";
import { toggleAutomation } from "@/lib/actions/automations";
import { cn } from "@/lib/utils";

function Toggle({ id, enabled }: { id: string; enabled: boolean }) {
  return (
    <form action={toggleAutomation}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={enabled ? "Disable automation" : "Enable automation"}
        className={cn("inline-flex h-5 w-9 items-center rounded-full p-0.5 transition", enabled ? "bg-emerald-500" : "bg-white/15")}
      >
        <span className={cn("h-4 w-4 rounded-full bg-white shadow transition", enabled && "translate-x-4")} />
      </button>
    </form>
  );
}

export default async function AutomationPage() {
  const user = await requireUser();
  const automations = await prisma.automation.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { steps: true } } },
  });

  return (
    <div>
      <PageHeader title="Automation" subtitle="Build workflows that run themselves.">
        <AutomationFormModal />
      </PageHeader>

      {automations.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No automations yet"
          description="Create a workflow with a trigger, actions, and conditions — like sending a follow-up when an email is opened."
          action={<AutomationFormModal />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map((a) => {
            const t = getTrigger(a.triggerType);
            const Icon = t.icon;
            return (
              <Card key={a.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Toggle id={a.id} enabled={a.enabled} />
                </div>
                <Link href={`/automation/${a.id}`} className="mt-4">
                  <p className="font-semibold text-zinc-100 hover:text-white">{a.name}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{a.triggerLabel}</p>
                </Link>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-sm">
                  <span className="text-zinc-500">
                    {a._count.steps} {a._count.steps === 1 ? "step" : "steps"} · {a.enabled ? "Active" : "Off"}
                  </span>
                  <Link href={`/automation/${a.id}`} className="inline-flex items-center gap-1 font-medium text-emerald-400 hover:text-emerald-300">
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

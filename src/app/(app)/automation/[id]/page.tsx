import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil, Trash2, Circle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui";
import { ConfirmButton } from "@/components/confirm-button";
import { NodeCard, StatusPill } from "@/components/automation/node-card";
import { StepNode, type StepData } from "@/components/automation/step-node";
import { AddStepModal } from "@/components/automation/add-step-modal";
import { AutomationFormModal } from "@/components/automation/automation-form-modal";
import { RunControls } from "@/components/automation/run-controls";
import { getTrigger } from "@/lib/automation";
import { toggleAutomation, deleteAutomation } from "@/lib/actions/automations";
import { cn } from "@/lib/utils";

function VConnector({ active }: { active?: boolean }) {
  return (
    <div className="flex w-80 flex-col items-center py-1">
      <div className={cn("h-7 w-px", active ? "bg-emerald-500/60" : "bg-white/15")} />
      <ArrowDown active={active} />
    </div>
  );
}

function ArrowDown({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("-mt-1 h-3.5 w-3.5", active ? "text-emerald-500/70" : "text-white/20")} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function BranchConnector({ active }: { active?: boolean }) {
  return (
    <div className="flex shrink-0 items-center px-1">
      <div className={cn("h-px w-6", active ? "bg-emerald-500/60" : "bg-white/15")} />
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/25 ring-inset">Yes</span>
      <div className={cn("h-px w-6", active ? "bg-emerald-500/60" : "bg-white/15")} />
      <ArrowRight className={cn("-ml-1 h-3.5 w-3.5", active ? "text-emerald-500/70" : "text-white/20")} />
    </div>
  );
}

export default async function AutomationBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const automation = await prisma.automation.findFirst({
    where: { id, ownerId: user.id },
    include: { steps: { orderBy: { order: "asc" } } },
  });
  if (!automation) notFound();

  const steps = automation.steps;
  const hasRun = Boolean(automation.lastRunAt);
  const trigger = getTrigger(automation.triggerType);

  const toData = (s: (typeof steps)[number], i: number): StepData => ({
    id: s.id,
    kind: s.kind,
    type: s.type,
    title: s.title,
    subtitle: s.subtitle,
    condField: s.condField,
    condOperator: s.condOperator,
    condValue: s.condValue,
    status: s.status,
    canUp: i > 0,
    canDown: i < steps.length - 1,
  });

  // Pair each Condition with the following step as its "Yes" branch.
  type Row = { kind: "single"; s: StepData } | { kind: "cond"; s: StepData; yes?: StepData };
  const rows: Row[] = [];
  for (let i = 0; i < steps.length; i++) {
    const data = toData(steps[i], i);
    if (steps[i].kind === "Condition") {
      const next = steps[i + 1] ? toData(steps[i + 1], i + 1) : undefined;
      rows.push({ kind: "cond", s: data, yes: next });
      if (next) i++;
    } else {
      rows.push({ kind: "single", s: data });
    }
  }

  return (
    <div>
      <Link href="/automation" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="h-4 w-4" /> Automation
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{automation.name}</h1>
          <p className="text-sm text-zinc-400">
            {automation.triggerLabel}
            {automation.description ? ` · ${automation.description}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RunControls automationId={automation.id} hasRun={hasRun} />
          <form action={toggleAutomation}>
            <input type="hidden" name="id" value={automation.id} />
            <Button type="submit" variant={automation.enabled ? "secondary" : "ghost"}>
              {automation.enabled ? "Enabled" : "Disabled"}
            </Button>
          </form>
          <AutomationFormModal
            automation={{ id: automation.id, name: automation.name, description: automation.description, triggerType: automation.triggerType }}
            trigger={
              <Button variant="secondary">
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            }
          />
          <form action={deleteAutomation}>
            <input type="hidden" name="id" value={automation.id} />
            <ConfirmButton type="submit" variant="ghost" size="icon" message={`Delete "${automation.name}"?`}>
              <Trash2 className="h-4 w-4 text-zinc-400" />
            </ConfirmButton>
          </form>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-zinc-950/40 p-6 sm:p-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div className="flex min-w-max flex-col items-start">
          {/* Trigger */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-400">
            <Circle className="h-3 w-3" /> Trigger
          </div>
          <NodeCard
            icon={trigger.icon}
            title={automation.triggerLabel}
            typeBadge={trigger.badge}
            subtitle={trigger.desc}
            statusBadge={hasRun ? <StatusPill label="Triggered" /> : undefined}
            active={hasRun}
          />

          {rows.map((row) => (
            <div key={row.s.id} className="flex flex-col items-start">
              <VConnector active={hasRun} />
              {row.kind === "single" ? (
                <StepNode step={row.s} />
              ) : (
                <div className="flex items-center">
                  <StepNode step={row.s} />
                  {row.yes && (
                    <>
                      <BranchConnector active={hasRun} />
                      <StepNode step={row.yes} />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          <VConnector active={hasRun} />
          <AddStepModal automationId={automation.id} />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, FormError, Input, Select, Textarea } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { NodeCard, StatusPill } from "@/components/automation/node-card";
import { getAction, ACTION_OPTIONS, CONDITION_FIELDS, CONDITION_OPERATORS } from "@/lib/automation";
import { updateStep, deleteStep, moveStep } from "@/lib/actions/automations";
import type { FormState } from "@/lib/validation";

export type StepData = {
  id: string;
  kind: string;
  type: string;
  title: string;
  subtitle: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  condField: string | null;
  condOperator: string | null;
  condValue: string | null;
  status: string;
  canUp: boolean;
  canDown: boolean;
};

export function StepNode({ step }: { step: StepData }) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(updateStep, {});
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  const isCondition = step.kind === "Condition";
  const Icon = isCondition ? Clock : getAction(step.type).icon;
  const completed = step.status === "Completed";

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      setOpen(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <NodeCard
        icon={Icon}
        title={step.title}
        typeBadge={isCondition ? "Condition" : "Action"}
        subtitle={step.subtitle}
        statusBadge={completed ? <StatusPill label="Completed" /> : undefined}
        active={completed}
        onClick={() => setOpen(true)}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={isCondition ? "Edit condition" : "Edit action"}>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={step.id} />
          {state.error && <FormError>{state.error}</FormError>}

          {isCondition ? (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Field" htmlFor="condField">
                <Select id="condField" name="condField" defaultValue={step.condField ?? "Email opened"}>
                  {CONDITION_FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Operator" htmlFor="condOperator">
                <Select id="condOperator" name="condOperator" defaultValue={step.condOperator ?? "is"}>
                  {CONDITION_OPERATORS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Value" htmlFor="condValue">
                <Input id="condValue" name="condValue" defaultValue={step.condValue ?? ""} placeholder="true" />
              </Field>
            </div>
          ) : (
            <>
              <Field label="Action" htmlFor="type">
                <Select id="type" name="type" defaultValue={step.type}>
                  {ACTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Label" htmlFor="title">
                <Input id="title" name="title" defaultValue={step.title} placeholder="Send email" />
              </Field>
              <Field label="Card description" htmlFor="subtitle">
                <Input id="subtitle" name="subtitle" defaultValue={step.subtitle ?? ""} placeholder='Send "Follow-up offer email"' />
              </Field>
              <Field label="Email subject" htmlFor="emailSubject" hint="Used when the action is Send email.">
                <Input id="emailSubject" name="emailSubject" defaultValue={step.emailSubject ?? ""} placeholder="Quick follow-up" />
              </Field>
              <Field label="Email body" htmlFor="emailBody">
                <Textarea id="emailBody" name="emailBody" defaultValue={step.emailBody ?? ""} placeholder="Write the email your contact will receive…" />
              </Field>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" disabled={!step.canUp || busy} onClick={() => run(() => moveStep(step.id, "up"))} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" disabled={!step.canDown || busy} onClick={() => run(() => moveStep(step.id, "down"))} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={busy}
                className="text-rose-400 hover:bg-rose-500/10"
                onClick={() => {
                  if (window.confirm("Delete this step?")) run(() => deleteStep(step.id));
                }}
                aria-label="Delete step"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              <SubmitButton>Save</SubmitButton>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

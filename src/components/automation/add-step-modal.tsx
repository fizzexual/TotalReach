"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, FormError, Input, Select } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { ACTION_OPTIONS, CONDITION_FIELDS, CONDITION_OPERATORS } from "@/lib/automation";
import { addStep } from "@/lib/actions/automations";
import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/validation";

export function AddStepModal({ automationId }: { automationId: string }) {
  const [open, setOpen] = React.useState(false);
  const [kind, setKind] = React.useState<"Action" | "Condition">("Action");
  const [state, formAction] = useActionState<FormState, FormData>(addStep, {});
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add step
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add step">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="automationId" value={automationId} />
          <input type="hidden" name="kind" value={kind} />
          {state.error && <FormError>{state.error}</FormError>}

          <div className="grid grid-cols-2 gap-2">
            {(["Action", "Condition"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition",
                  kind === k
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 text-zinc-400 hover:bg-white/5",
                )}
              >
                {k}
              </button>
            ))}
          </div>

          {kind === "Action" ? (
            <>
              <Field label="Action" htmlFor="type">
                <Select id="type" name="type" defaultValue="send_email">
                  {ACTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Label" htmlFor="title">
                <Input id="title" name="title" placeholder="Leave blank for default" />
              </Field>
              <Field label="Description" htmlFor="subtitle">
                <Input id="subtitle" name="subtitle" placeholder="Leave blank for default" />
              </Field>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <Field label="Field" htmlFor="condField">
                <Select id="condField" name="condField" defaultValue="Email opened">
                  {CONDITION_FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Operator" htmlFor="condOperator">
                <Select id="condOperator" name="condOperator" defaultValue="is">
                  {CONDITION_OPERATORS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Value" htmlFor="condValue">
                <Input id="condValue" name="condValue" placeholder="true" />
              </Field>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton>Add step</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

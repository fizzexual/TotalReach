"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, FormError, Input, Select, type ButtonVariant } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { TRIGGER_OPTIONS } from "@/lib/automation";
import { createAutomation, updateAutomation } from "@/lib/actions/automations";
import type { FormState } from "@/lib/validation";

export type AutomationValues = {
  id: string;
  name: string;
  description: string | null;
  triggerType: string;
};

export function AutomationFormModal({
  automation,
  trigger,
  triggerLabel = "New automation",
  triggerVariant = "primary",
}: {
  automation?: AutomationValues;
  trigger?: React.ReactNode;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
}) {
  const isEdit = Boolean(automation?.id);
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(
    isEdit ? updateAutomation : createAutomation,
    {},
  );
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="inline-flex">
          {trigger}
        </span>
      ) : (
        <Button variant={triggerVariant} onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> {triggerLabel}
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Edit automation" : "New automation"}>
        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={automation!.id} />}
          {state.error && <FormError>{state.error}</FormError>}
          <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
            <Input id="name" name="name" defaultValue={automation?.name ?? ""} placeholder="Re-engage warm leads" required />
          </Field>
          <Field label="Trigger" htmlFor="triggerType">
            <Select id="triggerType" name="triggerType" defaultValue={automation?.triggerType ?? "email_opened"}>
              {TRIGGER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description" htmlFor="description">
            <Input id="description" name="description" defaultValue={automation?.description ?? ""} placeholder="Optional" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton>{isEdit ? "Save changes" : "Create automation"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

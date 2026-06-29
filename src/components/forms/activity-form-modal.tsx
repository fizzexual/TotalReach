"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea, type ButtonVariant } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { ACTIVITY_TYPES } from "@/lib/constants";
import type { FormState } from "@/lib/validation";
import { createActivity } from "@/lib/actions/activities";

export function ActivityFormModal({
  contacts,
  deals,
  preset,
  triggerLabel = "Log activity",
  triggerVariant = "secondary",
}: {
  contacts?: { id: string; name: string }[];
  deals?: { id: string; title: string }[];
  preset?: { contactId?: string; dealId?: string; companyId?: string; type?: string };
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(createActivity, {});
  const router = useRouter();

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <>
      <Button variant={triggerVariant} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {triggerLabel}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Log activity">
        <form action={formAction} className="space-y-4">
          {preset?.contactId && <input type="hidden" name="contactId" value={preset.contactId} />}
          {preset?.dealId && <input type="hidden" name="dealId" value={preset.dealId} />}
          {preset?.companyId && <input type="hidden" name="companyId" value={preset.companyId} />}
          {state.error && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" htmlFor="type">
              <Select id="type" name="type" defaultValue={preset?.type ?? "Task"}>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Due date" htmlFor="dueDate">
              <Input id="dueDate" name="dueDate" type="date" />
            </Field>
          </div>
          <Field label="Title" htmlFor="title" error={state.fieldErrors?.title}>
            <Input id="title" name="title" placeholder="e.g. Follow-up call" required />
          </Field>
          {contacts && !preset?.contactId && (
            <Field label="Contact" htmlFor="contactId">
              <Select id="contactId" name="contactId" defaultValue="">
                <option value="">— None —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          {deals && !preset?.dealId && (
            <Field label="Deal" htmlFor="dealId">
              <Select id="dealId" name="dealId" defaultValue="">
                <option value="">— None —</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton>Save activity</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

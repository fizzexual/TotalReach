"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, Input, Select, Textarea, type ButtonVariant } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { CONTACT_STATUSES } from "@/lib/constants";
import type { FormState } from "@/lib/validation";
import { createContact, updateContact } from "@/lib/actions/contacts";

type CompanyOption = { id: string; name: string };

export type ContactValues = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  status: string;
  companyId: string | null;
  notes: string | null;
};

export function ContactFormModal({
  companies,
  contact,
  trigger,
  triggerLabel = "New contact",
  triggerVariant = "primary",
}: {
  companies: CompanyOption[];
  contact?: ContactValues;
  trigger?: React.ReactNode;
  triggerLabel?: string;
  triggerVariant?: ButtonVariant;
}) {
  const isEdit = Boolean(contact?.id);
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(
    isEdit ? updateContact : createContact,
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

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Edit contact" : "New contact"}>
        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={contact!.id} />}
          {state.error && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="First name" htmlFor="firstName" error={state.fieldErrors?.firstName}>
              <Input id="firstName" name="firstName" defaultValue={contact?.firstName ?? ""} required />
            </Field>
            <Field label="Last name" htmlFor="lastName" error={state.fieldErrors?.lastName}>
              <Input id="lastName" name="lastName" defaultValue={contact?.lastName ?? ""} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
              <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} placeholder="name@company.com" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={contact?.phone ?? ""} placeholder="+1 555 000 0000" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Job title" htmlFor="title">
              <Input id="title" name="title" defaultValue={contact?.title ?? ""} placeholder="Head of Sales" />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue={contact?.status ?? "Lead"}>
                {CONTACT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Company" htmlFor="companyId">
            <Select id="companyId" name="companyId" defaultValue={contact?.companyId ?? ""}>
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={contact?.notes ?? ""} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton>{isEdit ? "Save changes" : "Create contact"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
